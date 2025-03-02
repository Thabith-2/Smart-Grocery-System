$(document).ready(function() {
    console.log("Dashboard loading - fetching data from APIs");
    
    // Fetch orders from the API
    $.ajax({
        url: orderListApiUrl,
        type: 'GET',
        success: function(response) {
            console.log("Orders API response:", response);
            if (response && response.length > 0) {
                displayOrders(response);
                updateStats(response);
            } else {
                console.log("No orders found or empty response");
                showEmptyState('table tbody', 'No Orders Found', 'Start by creating your first order', 'Create New Order', 'order.html', 'plus');
                // Still update the order count to 0
                $('#total-orders').text('0');
            }
        },
        error: function(error) {
            console.error('Error fetching orders:', error);
            showError('table tbody', 'Unable to load orders. Please try again later.');
            // Still update the order count to 0
            $('#total-orders').text('0');
        }
    });
    
    // Fetch products for stats
    $.ajax({
        url: productListApiUrl,
        type: 'GET',
        success: function(response) {
            console.log("Products API response:", response);
            if (response && Array.isArray(response)) {
                $('#total-products').text(response.length);
            } else {
                console.log("Invalid products response:", response);
                $('#total-products').text('0');
            }
        },
        error: function(error) {
            console.error('Error fetching products:', error);
            $('#total-products').text('0');
        }
    });
    
    // Function to display orders in the table
    function displayOrders(orders) {
        if (!Array.isArray(orders) || orders.length === 0) {
            showEmptyState('table tbody', 'No Orders Found', 'Start by creating your first order', 'Create New Order', 'order.html', 'plus');
            return;
        }
        
        let tableContent = '';
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => {
            try {
                return new Date(b.datetime) - new Date(a.datetime);
            } catch (e) {
                return 0;
            }
        });
        
        // Take only the 5 most recent orders
        const recentOrders = orders.slice(0, 5);
        
        recentOrders.forEach(order => {
            // Get the order total - try different properties based on API response structure
            let orderTotal = 0;
            
            // Try different possible properties for total
            if (order.grand_total && !isNaN(parseFloat(order.grand_total))) {
                orderTotal = parseFloat(order.grand_total);
            } else if (order.total && !isNaN(parseFloat(order.total))) {
                orderTotal = parseFloat(order.total);
            } else {
                // Calculate from order details if available
                if (order.order_details && Array.isArray(order.order_details)) {
                    orderTotal = order.order_details.reduce((sum, detail) => {
                        const itemTotal = parseFloat(detail.total_price || 0);
                        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
                    }, 0);
                }
            }
            
            console.log(`Order #${order.order_id} total: ${orderTotal}`);
            
            tableContent += `
                <tr>
                    <td>${formatDate(order.datetime)}</td>
                    <td>#${order.order_id}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${formatCurrency(orderTotal)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-order" data-id="${order.order_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success print-order" data-id="${order.order_id}">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        $('table tbody').html(tableContent);
        
        // Add event listeners for action buttons
        $('.print-order').click(function() {
            const orderId = $(this).data('id');
            const order = orders.find(o => o.order_id == orderId);
            if (order) {
                // Fetch products to get product names
                $.ajax({
                    url: productListApiUrl,
                    type: 'GET',
                    success: function(products) {
                        console.log("Products for order:", products);
                        
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
                        
                        // Process items for bill display
                        const processedItems = [];
                        
                        orderDetails.forEach(detail => {
                            // Find product by ID
                            const productId = detail.product_id;
                            const product = products.find(p => p.product_id == productId);
                            
                            // Get product info
                            let productName = product ? product.name : `Product #${productId}`;
                            let unit = product ? product.uom_name : 'unit';
                            
                            // Get quantity and prices
                            const quantity = parseInt(detail.quantity) || 0;
                            const unitPrice = parseFloat(detail.unit_price || 0);
                            const totalPrice = parseFloat(detail.total_price || 0);
                            
                            processedItems.push({
                                name: productName,
                                quantity: quantity,
                                unit: unit,
                                price: unitPrice || (totalPrice / quantity) || 0,
                                total: totalPrice || (unitPrice * quantity) || 0
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
                        handleApiError(error);
                        showToast('Error fetching product details', 'error');
                        
                        // Fallback if products can't be fetched
                        const processedItems = orderDetails.map(detail => ({
                            name: `Product #${detail.product_id}`,
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

        $('.view-order').click(function() {
            const orderId = $(this).data('id');
            localStorage.setItem('viewOrderId', orderId);
            window.location.href = 'view-order.html';
        });
    }
    
    // Function to update stats
    function updateStats(orders) {
        if (!Array.isArray(orders)) {
            $('#total-orders').text('0');
            $('#total-revenue').text(formatCurrency(0));
            return;
        }
        
        $('#total-orders').text(orders.length);
        
        // Calculate total revenue
        let totalRevenue = 0;
        
        orders.forEach(order => {
            // Try different possible properties for total
            if (order.grand_total && !isNaN(parseFloat(order.grand_total))) {
                totalRevenue += parseFloat(order.grand_total);
            } else if (order.total && !isNaN(parseFloat(order.total))) {
                totalRevenue += parseFloat(order.total);
            } else {
                // Calculate from order details if available
                if (order.order_details && Array.isArray(order.order_details)) {
                    const orderTotal = order.order_details.reduce((sum, detail) => {
                        const itemTotal = parseFloat(detail.total_price || 0);
                        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
                    }, 0);
                    totalRevenue += orderTotal;
                }
            }
        });
        
        $('#total-revenue').text(formatCurrency(totalRevenue));
    }
    
    // Add retry button functionality
    $(document).on('click', '#retryButton', function() {
        location.reload();
    });
});
