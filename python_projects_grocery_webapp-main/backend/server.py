from flask import Flask, request, jsonify, g
from flask_cors import CORS
import json
import products_dao
import orders_dao
import uom_dao
import sql_connection
import os
import sys

app = Flask(__name__)
CORS(app)

# Connection management
@app.after_request
def after_request(response):
    # Return connection to the pool
    if hasattr(g, 'db_conn'):
        sql_connection.return_connection(g.db_conn)
    return response

# Database setup endpoint
@app.route('/setup-db', methods=['GET'])
def setup_db_route():
    try:
        # Use an absolute import instead of a relative import
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if current_dir not in sys.path:
            sys.path.append(current_dir)
        
        # Now import the module
        import setup_db
        result = setup_db.setup_database()
        return jsonify(result)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return jsonify({"success": False, "error": str(e), "details": error_details})

# UOM endpoints
@app.route('/getUOM', methods=['GET'])
def get_uom():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    response = uom_dao.get_uoms(conn)
    return jsonify(response)

# Product endpoints
@app.route('/getProducts', methods=['GET'])
def get_products():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    response = products_dao.get_all_products(conn)
    return jsonify(response)

@app.route('/insertProduct', methods=['POST'])
def insert_product():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    
    request_payload = json.loads(request.form['data'])
    product_id = products_dao.insert_new_product(conn, request_payload)
    response = jsonify({
        'product_id': product_id,
        'success': True
    })
    return response

@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    
    request_payload = json.loads(request.form['data'])
    product_id = request_payload['product_id']
    products_dao.delete_product(conn, product_id)
    response = jsonify({
        'success': True
    })
    return response

# Order endpoints
@app.route('/getAllOrders', methods=['GET'])
def get_all_orders():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    response = orders_dao.get_all_orders(conn)
    return jsonify(response)

@app.route('/insertOrder', methods=['POST'])
def insert_order():
    conn = sql_connection.get_sql_connection()
    g.db_conn = conn
    
    request_payload = json.loads(request.form['data'])
    order_id = orders_dao.insert_order(conn, request_payload)
    response = jsonify({
        'order_id': order_id,
        'success': True
    })
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
