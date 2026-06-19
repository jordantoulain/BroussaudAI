from fastapi import APIRouter, HTTPException, Depends, status
from api.routes.auth import get_current_user
from core.supabase_client import supabase
from core.database import get_mariadb_connection_direct
import os
import pymysql
import psycopg2
from datetime import datetime, timedelta
from contextlib import contextmanager
import logging

router = APIRouter(prefix="/data", tags=["Data"])

logger = logging.getLogger(__name__)

# Postes de production dans l'ordre du flux
POSTES_ORDER = ['TRICO', 'RETOUR', 'REMAIL', 'FORM', 'QUALI', 'BROD', 'ETIQUE', 'FLUX_PROD']

# PostgreSQL connection pool for Supabase
postgres_pool = None

def init_postgres_pool():
    """Initialize PostgreSQL connection pool for Supabase."""
    global postgres_pool
    if postgres_pool is None:
        try:
            from psycopg2 import pool as pg_pool
            conn_str = os.environ.get("SUPABASE_CONNECTION_STRING")
            if not conn_str:
                raise ValueError("SUPABASE_CONNECTION_STRING non configuré")
            postgres_pool = pg_pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=5,
                dsn=conn_str,
                connect_timeout=5,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5
            )
            logger.info("PostgreSQL connection pool created")
        except ImportError:
            logger.warning("psycopg2.pool not available, using direct connections")
            postgres_pool = None


@contextmanager
def get_supabase_connection():
    """Get a PostgreSQL connection from the pool or create a new one."""
    global postgres_pool
    
    if postgres_pool is None:
        init_postgres_pool()
    
    if postgres_pool is not None:
        conn = postgres_pool.getconn()
        try:
            yield conn
        finally:
            postgres_pool.putconn(conn)
    else:
        # Fallback to direct connection
        conn_str = os.environ.get("SUPABASE_CONNECTION_STRING")
        if not conn_str:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_CONNECTION_STRING non configuré"
            )
        conn = psycopg2.connect(conn_str)
        try:
            yield conn
        finally:
            conn.close()


def verify_admin(current_user: dict):
    """Vérifie que l'utilisateur a le rôle ADMIN."""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit. Rôle ADMIN requis."
        )


# Use the pool from core.database for MariaDB
get_mariadb_connection = get_mariadb_connection_direct


def create_stats_tables(conn):
    """Crée les tables stats_users dans Supabase."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS stats_users (
                date DATE NOT NULL,
                utilisateur VARCHAR(50) NOT NULL,
                emplacement VARCHAR(50) NOT NULL,
                nb_operations INT NOT NULL DEFAULT 0,
                nb_sacs_uniques INT NOT NULL DEFAULT 0,
                qte_totale INT NOT NULL DEFAULT 0,
                nb_deb INT NOT NULL DEFAULT 0,
                nb_fin INT NOT NULL DEFAULT 0,
                nb_supp_rebus INT NOT NULL DEFAULT 0,
                nb_supp_regroupement INT NOT NULL DEFAULT 0,
                PRIMARY KEY (date, utilisateur, emplacement)
            );
        """)

        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_stats_users_date
            ON stats_users (date);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_stats_users_utilisateur
            ON stats_users (utilisateur);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_stats_users_emplacement
            ON stats_users (emplacement);
        """)

        conn.commit()


def update_stats_users(conn, mariadb_data):
    """Met à jour la table stats_users avec les données agrégées par (date, utilisateur, poste)."""
    stats = {}
    for row in mariadb_data:
        key = (row["date"], row["utilisateur"], row["emplacement"])
        if key not in stats:
            stats[key] = {
                "date": row["date"],
                "utilisateur": row["utilisateur"],
                "emplacement": row["emplacement"],
                "nb_operations": 0,
                "sacs": set(),
                "qte_totale": 0,
                "nb_deb": 0,
                "nb_fin": 0,
                "nb_supp_rebus": 0,
                "nb_supp_regroupement": 0
            }

        s = stats[key]
        s["nb_operations"] += 1
        s["sacs"].add(row["num_sac_parent"])
        s["qte_totale"] += row["qte_rebus"]

        if row["type"] == "DEB":
            s["nb_deb"] += 1
        elif row["type"] == "FIN":
            s["nb_fin"] += 1
        elif row["type"] == "SUPP_REBUS":
            s["nb_supp_rebus"] += 1
        elif row["type"] == "SUPP_REGROUPEMENT":
            s["nb_supp_regroupement"] += 1

    data_to_insert = []
    for key, s in stats.items():
        data_to_insert.append({
            "date": s["date"],
            "utilisateur": s["utilisateur"],
            "emplacement": s["emplacement"],
            "nb_operations": s["nb_operations"],
            "nb_sacs_uniques": len(s["sacs"]),
            "qte_totale": s["qte_totale"],
            "nb_deb": s["nb_deb"],
            "nb_fin": s["nb_fin"],
            "nb_supp_rebus": s["nb_supp_rebus"],
            "nb_supp_regroupement": s["nb_supp_regroupement"]
        })

    BATCH_SIZE = 500
    updated_count = 0
    with conn.cursor() as cur:
        for i in range(0, len(data_to_insert), BATCH_SIZE):
            batch = data_to_insert[i:i + BATCH_SIZE]
            args = [(
                d["date"],
                d["utilisateur"],
                d["emplacement"],
                d["nb_operations"],
                d["nb_sacs_uniques"],
                d["qte_totale"],
                d["nb_deb"],
                d["nb_fin"],
                d["nb_supp_rebus"],
                d["nb_supp_regroupement"]
            ) for d in batch]

            cur.executemany("""
                INSERT INTO stats_users
                (date, utilisateur, emplacement, nb_operations, nb_sacs_uniques, qte_totale,
                 nb_deb, nb_fin, nb_supp_rebus, nb_supp_regroupement)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (date, utilisateur, emplacement)
                DO UPDATE SET
                    nb_operations = EXCLUDED.nb_operations,
                    nb_sacs_uniques = EXCLUDED.nb_sacs_uniques,
                    qte_totale = EXCLUDED.qte_totale,
                    nb_deb = EXCLUDED.nb_deb,
                    nb_fin = EXCLUDED.nb_fin,
                    nb_supp_rebus = EXCLUDED.nb_supp_rebus,
                    nb_supp_regroupement = EXCLUDED.nb_supp_regroupement
            """, args)
            conn.commit()
            updated_count += len(args)

    return updated_count


@router.post("/update", status_code=status.HTTP_200_OK)
def update_stats_data(current_user: dict = Depends(get_current_user)):
    """
    Met à jour les statistiques utilisateurs.
    - stats_users : données des 7 derniers jours (agrégation par date, utilisateur, poste)
    Accessible uniquement aux ADMIN.
    """
    verify_admin(current_user)

    try:
        with get_supabase_connection() as conn:
            create_stats_tables(conn)

        seven_days_ago = (datetime.now() - timedelta(days=7)).date()

        mariadb_conn = get_mariadb_connection()
        recent_data = []

        try:
            with mariadb_conn.cursor() as cursor:
                cursor.execute("""
                    SELECT num_sac_parent, num_sac_enfant, emplacement, type,
                           date, heure, utilisateur, qte_rebus
                    FROM flux_sac
                    WHERE date >= %s
                """, (seven_days_ago,))
                recent_data = cursor.fetchall()
        finally:
            mariadb_conn.close()

        if not recent_data:
            return {"message": "Aucune donnée à transférer"}

        users_updated = 0
        with get_supabase_connection() as conn:
            users_updated = update_stats_users(conn, recent_data)

        return {
            "message": "Mise à jour des statistiques terminée avec succès",
            "stats_users": {
                "period": "7 derniers jours",
                "updated_count": users_updated
            }
        }

    except pymysql.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de connexion à MariaDB: {str(e)}"
        )
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de connexion à Supabase: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )


@router.post("/init", status_code=status.HTTP_200_OK)
def init_stats_data(current_user: dict = Depends(get_current_user)):
    """
    Initialise les statistiques utilisateurs avec les données historiques (365 jours).
    - stats_users : données des 365 derniers jours (agrégation par date, utilisateur, poste)
    Accessible uniquement aux ADMIN.
    """
    verify_admin(current_user)

    try:
        with get_supabase_connection() as conn:
            create_stats_tables(conn)

        one_year_ago = (datetime.now() - timedelta(days=365)).date()

        mariadb_conn = get_mariadb_connection()
        all_data = []

        try:
            with mariadb_conn.cursor() as cursor:
                cursor.execute("""
                    SELECT num_sac_parent, num_sac_enfant, emplacement, type,
                           date, heure, utilisateur, qte_rebus
                    FROM flux_sac
                    WHERE date >= %s
                    ORDER BY date, heure
                """, (one_year_ago,))
                all_data = cursor.fetchall()
        finally:
            mariadb_conn.close()

        if not all_data:
            return {"message": "Aucune donnée à transférer"}

        users_updated = 0
        with get_supabase_connection() as conn:
            users_updated = update_stats_users(conn, all_data)

        return {
            "message": "Initialisation des statistiques terminée avec succès",
            "stats_users": {
                "period": "365 derniers jours",
                "updated_count": users_updated
            }
        }

    except pymysql.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de connexion à MariaDB: {str(e)}"
        )
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de connexion à Supabase: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'initialisation: {str(e)}"
        )