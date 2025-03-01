
## 5. uom_dao.py

```python
def get_uoms(connection):
    cursor = connection.cursor()
    query = ("SELECT uom_id, uom_name FROM uom")
    cursor.execute(query)
    
    response = []
    for (uom_id, uom_name) in cursor:
        response.append({
            'uom_id': uom_id,
            'uom_name': uom_name
        })
    
    return response
```
