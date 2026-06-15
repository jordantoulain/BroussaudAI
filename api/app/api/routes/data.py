from fastapi import APIRouter, HTTPException, Depends, status
from api.routes.auth import get_current_user
from core.supabase_client import supabase
import os
import pymysql
import psycopg2
from datetime import datetime, timedelta

router = APIRouter(prefix="/data", tags=["Data"])


def verify_admin(current_user: dict):
    """Vérifie que l'utilisateur a le rôle ADMIN."""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit. Rôle ADMIN requis."
        )


def get_mariadb_connection():
    """Établit une connexion à la base MariaDB."""
    print(os.environ.get("MARIADB_DATABASE", ""))
    conn = pymysql.connect(
        host=os.environ.get("MARIADB_HOST", "localhost"),
        port=int(os.environ.get("MARIADB_PORT", 3306)),
        user=os.environ.get("MARIADB_USER", "root"),
        password=os.environ.get("MARIADB_PASSWORD", ""),
        database=os.environ.get("MARIADB_DATABASE", ""),
        charset="utf8mb3",
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn


def get_supabase_connection():
    """Établit une connexion PostgreSQL à Supabase."""
    conn_str = os.environ.get("SUPABASE_CONNECTION_STRING")
    if not conn_str:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_CONNECTION_STRING non configuré"
        )
    return psycopg2.connect(conn_str)


@router.post("/update", status_code=status.HTTP_200_OK)
def update_flux_sac_data(current_user: dict = Depends(get_current_user)):
    """
    Transfère les données de flux_sac de MariaDB vers Supabase.
    Crée la table si elle n'existe pas et récupère les données des 7 derniers jours.
    Accessible uniquement aux ADMIN.
    """
    verify_admin(current_user)
    
    try:
        # Créer la table dans Supabase si elle n'existe pas
        with get_supabase_connection() as conn:
            with conn.cursor() as cur:
                # Créer la table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS statistiques (
                        num_sac_parent VARCHAR(17) NOT NULL,
                        num_sac_enfant VARCHAR(17) DEFAULT NULL,
                        emplacement VARCHAR(50) NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        date DATE NOT NULL,
                        heure VARCHAR(10) NOT NULL,
                        utilisateur VARCHAR(50) NOT NULL,
                        qte_rebus INTEGER NOT NULL,
                        CONSTRAINT verrou_flux_sac UNIQUE (num_sac_parent, emplacement, type)
                    );
                """)
                
                # Créer les indexes
                cur.execute("""
                    CREATE UNIQUE INDEX IF NOT EXISTS verrou_flux_sac 
                    ON statistiques (num_sac_parent, emplacement, type);
                """)
                
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_fs_numsac_emplacement_type 
                    ON statistiques (num_sac_parent, emplacement, type);
                """)
                
                conn.commit()
        
        # Récupérer les données des 7 derniers jours depuis MariaDB
        seven_days_ago = (datetime.now() - timedelta(days=7)).date()
        
        mariadb_conn = get_mariadb_connection()
        try:
            with mariadb_conn.cursor() as cursor:
                cursor.execute("""
                    SELECT num_sac_parent, num_sac_enfant, emplacement, type, 
                           date, heure, utilisateur, qte_rebus
                    FROM flux_sac
                    WHERE date >= %s
                """, (seven_days_ago,))
                mariadb_data = cursor.fetchall()
        finally:
            mariadb_conn.close()
        
        if not mariadb_data:
            return {"message": "Aucune donnée à transférer"}
        
        # Préparer les données pour insertion dans Supabase
        data_to_insert = []
        for row in mariadb_data:
            data_to_insert.append({
                "num_sac_parent": row["num_sac_parent"],
                "num_sac_enfant": row["num_sac_enfant"],
                "emplacement": row["emplacement"],
                "type": row["type"],
                "date": row["date"].isoformat() if isinstance(row["date"], datetime) else str(row["date"]),
                "heure": row["heure"],
                "utilisateur": row["utilisateur"],
                "qte_rebus": row["qte_rebus"]
            })
        
        # Insérer les données dans Supabase par blocs pour optimiser les performances
        BATCH_SIZE = 1000
        inserted_count = 0
        with get_supabase_connection() as conn:
            with conn.cursor() as cur:
                for i in range(0, len(data_to_insert), BATCH_SIZE):
                    batch = data_to_insert[i:i + BATCH_SIZE]
                    args = [(
                        row["num_sac_parent"],
                        row["num_sac_enfant"],
                        row["emplacement"],
                        row["type"],
                        row["date"],
                        row["heure"],
                        row["utilisateur"],
                        row["qte_rebus"]
                    ) for row in batch]
                    
                    cur.executemany("""
                        INSERT INTO statistiques 
                        (num_sac_parent, num_sac_enfant, emplacement, type, date, heure, utilisateur, qte_rebus)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT ON CONSTRAINT verrou_flux_sac DO NOTHING
                    """, args)
                    conn.commit()
                    inserted_count += len(args)
        
        return {
            "message": "Transfert terminé avec succès",
            "total_data": len(data_to_insert),
            "inserted_count": inserted_count
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
            detail=f"Erreur lors du transfert: {str(e)}"
        )


@router.post("/init", status_code=status.HTTP_200_OK)
def init_flux_sac_data(current_user: dict = Depends(get_current_user)):
    """
    Transfère les données initiales de flux_sac de MariaDB vers Supabase.
    Crée la table si elle n'existe pas et récupère les données des 365 derniers jours.
    Accessible uniquement aux ADMIN.
    """
    verify_admin(current_user)
    
    try:
        # Créer la table dans Supabase si elle n'existe pas
        with get_supabase_connection() as conn:
            with conn.cursor() as cur:
                # Créer la table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS statistiques (
                        num_sac_parent VARCHAR(17) NOT NULL,
                        num_sac_enfant VARCHAR(17) DEFAULT NULL,
                        emplacement VARCHAR(50) NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        date DATE NOT NULL,
                        heure VARCHAR(10) NOT NULL,
                        utilisateur VARCHAR(50) NOT NULL,
                        qte_rebus INTEGER NOT NULL,
                        CONSTRAINT verrou_flux_sac UNIQUE (num_sac_parent, emplacement, type)
                    );
                """)
                
                # Créer les indexes
                cur.execute("""
                    CREATE UNIQUE INDEX IF NOT EXISTS verrou_flux_sac 
                    ON statistiques (num_sac_parent, emplacement, type);
                """)
                
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_fs_numsac_emplacement_type 
                    ON statistiques (num_sac_parent, emplacement, type);
                """)
                
                conn.commit()
        
        # Récupérer les données des 365 derniers jours depuis MariaDB
        one_year_ago = (datetime.now() - timedelta(days=365)).date()
        
        mariadb_conn = get_mariadb_connection()
        try:
            with mariadb_conn.cursor() as cursor:
                cursor.execute("""
                    SELECT num_sac_parent, num_sac_enfant, emplacement, type, 
                           date, heure, utilisateur, qte_rebus
                    FROM flux_sac
                    WHERE date >= %s
                """, (one_year_ago,))
                mariadb_data = cursor.fetchall()
        finally:
            mariadb_conn.close()
        
        if not mariadb_data:
            return {"message": "Aucune donnée à transférer"}
        
        # Préparer les données pour insertion dans Supabase
        data_to_insert = []
        for row in mariadb_data:
            data_to_insert.append({
                "num_sac_parent": row["num_sac_parent"],
                "num_sac_enfant": row["num_sac_enfant"],
                "emplacement": row["emplacement"],
                "type": row["type"],
                "date": row["date"].isoformat() if isinstance(row["date"], datetime) else str(row["date"]),
                "heure": row["heure"],
                "utilisateur": row["utilisateur"],
                "qte_rebus": row["qte_rebus"]
            })
        
        # Insérer les données dans Supabase par blocs pour optimiser les performances
        BATCH_SIZE = 1000
        inserted_count = 0
        with get_supabase_connection() as conn:
            with conn.cursor() as cur:
                for i in range(0, len(data_to_insert), BATCH_SIZE):
                    batch = data_to_insert[i:i + BATCH_SIZE]
                    args = [(
                        row["num_sac_parent"],
                        row["num_sac_enfant"],
                        row["emplacement"],
                        row["type"],
                        row["date"],
                        row["heure"],
                        row["utilisateur"],
                        row["qte_rebus"]
                    ) for row in batch]
                    
                    cur.executemany("""
                        INSERT INTO statistiques 
                        (num_sac_parent, num_sac_enfant, emplacement, type, date, heure, utilisateur, qte_rebus)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT ON CONSTRAINT verrou_flux_sac DO NOTHING
                    """, args)
                    conn.commit()
                    inserted_count += len(args)
        
        return {
            "message": "Initialisation terminée avec succès",
            "total_data": len(data_to_insert),
            "inserted_count": inserted_count
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
            detail=f"Erreur lors du transfert: {str(e)}"
        )
