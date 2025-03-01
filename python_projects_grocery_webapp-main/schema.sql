-- Create UOM table
CREATE TABLE IF NOT EXISTS uom (
    uom_id SERIAL PRIMARY KEY,
    uom_name VARCHAR(255) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    uom_id INTEGER REFERENCES uom(uom_id),
    price_per_unit DECIMAL(10, 2) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_details table
CREATE TABLE IF NOT EXISTS order_details (
    order_details_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- Insert some sample UOM data if table is empty
INSERT INTO uom (uom_name)
SELECT 'kg' WHERE NOT EXISTS (SELECT 1 FROM uom WHERE uom_name = 'kg');

INSERT INTO uom (uom_name)
SELECT 'litre' WHERE NOT EXISTS (SELECT 1 FROM uom WHERE uom_name = 'litre');

INSERT INTO uom (uom_name)
SELECT 'piece' WHERE NOT EXISTS (SELECT 1 FROM uom WHERE uom_name = 'piece');

INSERT INTO uom (uom_name)
SELECT 'pack' WHERE NOT EXISTS (SELECT 1 FROM uom WHERE uom_name = 'pack');
