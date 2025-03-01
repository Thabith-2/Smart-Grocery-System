import os
import psycopg2

def setup_database():
    try:
        # Get the schema.sql file path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(current_dir, 'schema.sql')
        
        # Read schema.sql file
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to the database
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        
        # Execute the schema SQL
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)
        
        conn.close()
        return {"success": True, "message": "Database schema created successfully!"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = setup_database()
    print(result)
