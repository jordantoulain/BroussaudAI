"""
Database connection utilities.
Note: For production, consider using connection pooling (DBUtils, mysql-connector-python, etc.)
"""
import os
import pymysql
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

# Configuration from environment variables
mariadb_config = {
    "host": os.environ.get("MARIADB_HOST", "localhost"),
    "port": int(os.environ.get("MARIADB_PORT", 3306)),
    "user": os.environ.get("MARIADB_USER", "root"),
    "password": os.environ.get("MARIADB_PASSWORD", ""),
    "database": os.environ.get("MARIADB_DATABASE", ""),
    "charset": "utf8mb3",
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": False,
    "connect_timeout": 5,
}


@contextmanager
def get_mariadb_connection():
    """
    Get a MariaDB connection with proper cleanup.
    
    Usage:
        with get_mariadb_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM table")
                results = cursor.fetchall()
    
    Returns:
        A database connection
        
    Raises:
        Exception: If connection fails
    
    Note: For production, implement connection pooling with DBUtils or similar.
    """
    conn = None
    try:
        conn = pymysql.connect(**mariadb_config)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if conn:
            conn.close()


def get_mariadb_connection_direct():
    """
    Get a direct MariaDB connection (caller must close it).
    
    Note: Prefer using get_mariadb_connection() context manager.
    For production, implement connection pooling.
    """
    return pymysql.connect(**mariadb_config)
