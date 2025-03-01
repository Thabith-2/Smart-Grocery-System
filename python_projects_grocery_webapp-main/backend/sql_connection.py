import os
import psycopg2
from psycopg2 import pool

__connection_pool = None

def get_sql_connection():
    print("Opening PostgreSQL connection")
    global __connection_pool
    
    if __connection_pool is None:
        # Get database URL from environment variable
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            # Fallback for local development
            database_url = "postgresql://postgres:password@localhost:5432/grocery_store"
        
        # Create a connection pool
        __connection_pool = pool.SimpleConnectionPool(1, 10, database_url)
    
    return __connection_pool.getconn()

def return_connection(connection):
    global __connection_pool
    if __connection_pool:
        __connection_pool.putconn(connection)

