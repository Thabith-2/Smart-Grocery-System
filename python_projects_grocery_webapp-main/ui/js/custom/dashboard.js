// ... existing code ...

// Inside the print-order click handler
$('.print-order').click(function() {
    const orderId = $(this).data('id');
    const order = orders.find(o => o.order_id == orderId);
    if (order) {
        // Process order details for bill
        const orderDetails = order.order_details || [];
        
        // Calculate total if not available
        let orderTotal = 0;
        if (order.grand_total && !isNaN(parseFloat(order.grand_total))) {
            orderTotal = parseFloat(order.grand_total);
        } else if (order.total && !isNaN(parseFloat(order.total))) {
            orderTotal = parseFloat(order.total);
        } else {
            // Calculate from order details
            orderTotal = orderDetails.reduce((sum, detail) => {
                const itemTotal = parseFloat(detail.total_price || 0);
                return sum + (isNaN(itemTotal) ? 0 : itemTotal);
            }, 0);
        }
        
        // Fetch products to get product names
        $.ajax({
            url: productsApiUrl,
            type: 'GET',
            success: function(products) {
                // Process items for bill display
                const processedItems = [];
                
                orderDetails.forEach(detail => {
                    // Find product by ID
                    const productId = detail.product_id;
                    const product = products.find(p => p.product_id == productId);
                    
                    // Get product info
                    let productName = product ? product.name : 'Unknown Item';
                    let unit = product ? product.uom_name : 'unit';
                    
                    // Get quantity and prices
                    const quantity = parseInt(detail.quantity) || 0;
                    const unitPrice = parseFloat(detail.unit_price || 0);
                    const totalPrice = parseFloat(detail.total_price || 0);
                    
                    processedItems.push({
                        name: productName,
                        quantity: quantity,
                        unit: unit,
                        price: unitPrice || (totalPrice / quantity),
                        total: totalPrice || (unitPrice * quantity)
                    });
                });

                // Prepare order data for bill page
                const orderData = {
                    orderId: order.order_id,
                    customerName: order.customer_name || 'N/A',
                    date: order.datetime || new Date().toISOString(),
                    items: processedItems,
                    total: orderTotal
                };
                
                console.log('Prepared order data for bill:', orderData);
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                window.location.href = 'bill.html';
            },
            error: function(error) {
                console.error('Error fetching products:', error);
                // Fallback if products can't be fetched
                const processedItems = orderDetails.map(detail => ({
                    name: 'Product #' + detail.product_id,
                    quantity: parseInt(detail.quantity) || 0,
                    unit: 'unit',
                    price: parseFloat(detail.unit_price || 0),
                    total: parseFloat(detail.total_price || 0)
                }));
                
                const orderData = {
                    orderId: order.order_id,
                    customerName: order.customer_name || 'N/A',
                    date: order.datetime || new Date().toISOString(),
                    items: processedItems,
                    total: orderTotal
                };
                
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                window.location.href = 'bill.html';
            }
        });
    }
});

// ... rest of the code ...
