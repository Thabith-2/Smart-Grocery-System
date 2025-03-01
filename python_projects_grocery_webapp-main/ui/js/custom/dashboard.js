$(document).ready(function() {
    // API endpoints
    const ordersApiUrl = 'http://localhost:5000/getAllOrders';
    const productsApiUrl = 'http://localhost:5000/getProducts';
    
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
            const orderTotal = parseFloat(order.total);
            
            tableContent += `
                <tr>
                    <td>${formatDate(order.datetime)}</td>
                    <td>#${order.order_id}</td>
                    <td>${order.customer_name}</td>
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
        $('.view-order').click(function() {
            const orderId = $(this).data('id');
            // Store the order ID and redirect to a detail page
            localStorage.setItem('viewOrderId', orderId);
            window.location.href = 'view-order.html';
        });
        
        $('.print-order').click(function() {
            const orderId = $(this).data('id');
            // Find the order and store it for printing
            const order = orders.find(o => o.order_id == orderId);
            if (order) {
                // Prepare order data for bill page
                const orderData = {
                    orderId: order.order_id,
                    customerName: order.customer_name,
                    date: order.datetime,
                    items: order.order_details || [],
                    total: order.total
                };
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                window.location.href = 'bill.html';
            }
        });
    }
    
    // Function to update stats
    function updateStats(orders) {
        // Update total orders
        $('#total-orders').text(orders.length);
        
        // Calculate total revenue
        let totalRevenue = 0;
        orders.forEach(order => {
            totalRevenue += parseFloat(order.total);
        });
        $('#total-revenue').text('₹' + totalRevenue.toFixed(2));
    }
    
    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Function to show empty message
    function showEmptyMessage() {
        $('table tbody').html(`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="py-5">
                        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" style="width: 80px; opacity: 0.5" class="mb-3">
                        <p class="mb-3">No orders found. Create your first order!</p>
                        <a href="order.html" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> New Order
                        </a>
                    </div>
                </td>
            </tr>
        `);
    }
    
    // Function to show error message
    function showErrorMessage() {
        $('table tbody').html(`
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <div class="py-5">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <p>Unable to load orders. Please try again later.</p>
                        <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                </td>
            </tr>
        `);
    }
});

