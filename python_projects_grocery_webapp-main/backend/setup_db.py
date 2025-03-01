import os
import psycopg2

def setup_database():
    try:
        # Get the schema.sql file path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        schema_path = os.path.join(parent_dir, 'schema.sql')
        
        # Debug file path
        print(f"Looking for schema.sql at: {schema_path}")
        
        # Check if file exists
        if not os.path.exists(schema_path):
            # Try alternative locations
            alt_path = os.path.join(current_dir, 'schema.sql')
            if os.path.exists(alt_path):
                schema_path = alt_path
                print(f"Found schema.sql at alternative path: {schema_path}")
            else:
                return {"success": False, "error": f"Schema file not found at {schema_path} or {alt_path}"}
        
        # Read schema.sql file
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to the database using the DATABASE_URL environment variable
        database_url = os.environ.get('DATABASE_URL')
        
        # Debug database URL (mask password for security)
        if database_url:
            masked_url = database_url.replace('://', '://***:***@')
            print(f"Using database URL: {masked_url}")
        else:
            return {"success": False, "error": "DATABASE_URL environment variable is not set"}
        
        # Connect to the database
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        
        # Execute the schema SQL
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)
        
        conn.close()
        return {"success": True, "message": "Database schema created successfully!"}
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error: {str(e)}\n{error_details}")
        return {"success": False, "error": str(e), "details": error_details}

if __name__ == "__main__":
    result = setup_database()
    print(result)
