def get_all_orders(connection):
    cursor = connection.cursor()
    query = ("SELECT o.order_id, o.customer_name, o.total_amount, o.datetime, "
             "od.order_details_id, od.product_id, od.quantity, od.total_price, "
             "p.name, p.price_per_unit, p.uom_id, u.uom_name "
             "FROM orders o "
             "LEFT JOIN order_details od ON o.order_id = od.order_id "
             "LEFT JOIN products p ON od.product_id = p.product_id "
             "LEFT JOIN uom u ON p.uom_id = u.uom_id "
             "ORDER BY o.datetime DESC")
    cursor.execute(query)
    
    orders = {}
    for (order_id, customer_name, total_amount, datetime, 
         order_details_id, product_id, quantity, total_price, 
         product_name, price_per_unit, uom_id, uom_name) in cursor:
        
        if order_id not in orders:
            orders[order_id] = {
                'order_id': order_id,
                'customer_name': customer_name,
                'total_amount': float(total_amount),
                'datetime': datetime,
                'order_details': []
            }
            
        if order_details_id:
            orders[order_id]['order_details'].append({
                'order_details_id': order_details_id,
                'product_id': product_id,
                'quantity': float(quantity),
                'total_price': float(total_price),
                'product_name': product_name,
                'price_per_unit': float(price_per_unit),
                'uom_id': uom_id,
                'uom_name': uom_name
            })
    
    return list(orders.values())

def insert_order(connection, order):
    cursor = connection.cursor()
    
    # Get the next available order_id
    query = "SELECT MAX(order_id) FROM orders"
    cursor.execute(query)
    result = cursor.fetchone()
    if result[0] is None:
        next_order_id = 1
    else:
        next_order_id = result[0] + 1
    
    # Insert order
    order_query = ("INSERT INTO orders "
                  "(customer_name, total_amount) "
                  "VALUES (%s, %s) RETURNING order_id")
    order_data = (order['customer_name'], float(order['grand_total']))
    
    cursor.execute(order_query, order_data)
    order_id = cursor.fetchone()[0]
    
    # Get the next available order_details_id
    query = "SELECT MAX(order_details_id) FROM order_details"
    cursor.execute(query)
    result = cursor.fetchone()
    if result[0] is None:
        next_detail_id = 1
    else:
        next_detail_id = result[0] + 1
    
    # Insert order details
    order_details_query = ("INSERT INTO order_details "
                          "(order_id, product_id, quantity, total_price, order_details_id) "
                          "VALUES (%s, %s, %s, %s, %s)")
    
    for item in order['order_details']:
        cursor.execute(order_details_query, [
            order_id,
            int(item['product_id']),
            float(item['quantity']),
            float(item['total_price']),
            next_detail_id
        ])
        next_detail_id += 1
    
    connection.commit()
    
    return order_id
