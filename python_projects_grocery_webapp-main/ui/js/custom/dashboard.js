$(document).ready(function() {
    // API endpoints
    const ordersApiUrl = 'https://smart-grocery-system.onrender.com/getAllOrders';
    const productsApiUrl = 'https://smart-grocery-system.onrender.com/getProducts';
    
    // Fetch orders from the API
    $.ajax({
        url: ordersApiUrl,
        type: 'GET',
        success: function(response) {
            if (response && response.length > 0) {
                displayOrders(response);
                updateStats(response);
            } else {
                showEmptyMessage();
            }
        },
        error: function(error) {
            console.error('Error fetching orders:', error);
            showErrorMessage();
        }
    });
    
    // Fetch products for stats
    $.ajax({
        url: productsApiUrl,
        type: 'GET',
        success: function(response) {
            if (response) {
                $('#total-products').text(response.length);
            }
        }
    });
    
    // Function to display orders in the table
    function displayOrders(orders) {
        let tableContent = '';
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        
        // Take only the 5 most recent orders
        const recentOrders = orders.slice(0, 5);
        
        recentOrders.forEach(order => {
            // Safely parse the order total
            let orderTotal = parseFloat(order.total || '0');
            
            tableContent += `
                <tr>
                    <td>${formatDate(order.datetime)}</td>
                    <td>#${order.order_id}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>₹${orderTotal.toFixed(2)}</td>
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
                // Process order details for bill
                const orderDetails = order.order_details || [];
                const processedItems = orderDetails.map(detail => {
                    // Find product details if available
                    const product = detail.product || {};
                    return {
                        name: product.name || 'Unknown Item',
                        quantity: parseInt(detail.quantity) || 0,
                        unit: product.uom_name || 'unit',
                        price: parseFloat(detail.unit_price || '0'),
                        total: parseFloat(detail.total_price || '0')
                    };
                });

                // Prepare order data for bill page
                const orderData = {
                    orderId: order.order_id,
                    customerName: order.customer_name || 'N/A',
                    date: order.datetime,
                    items: processedItems,
                    total: parseFloat(order.total || '0')
                };
                
                console.log('Prepared order data for bill:', orderData); // Debug log
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                window.location.href = 'bill.html';
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
        $('#total-orders').text(orders.length);
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => {
            const orderTotal = parseFloat(order.total || '0');
            return sum + (isNaN(orderTotal) ? 0 : orderTotal);
        }, 0);
        
        $('#total-revenue').text('₹' + totalRevenue.toFixed(2));
    }
    
    // Function to format date
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            
            return date.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }
    
    // ... rest of the code remains the same ...
});
