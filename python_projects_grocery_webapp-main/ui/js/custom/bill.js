$(document).ready(function() {
    try {
        // Get order data from localStorage
        const orderDataStr = localStorage.getItem('lastOrder');
        if (!orderDataStr) {
            showError('No order data found');
            return;
        }

        const orderData = JSON.parse(orderDataStr);
        if (!orderData || !orderData.items || !orderData.items.length) {
            showError('Invalid order data');
            return;
        }

        // Display order information
        displayOrderInfo(orderData);
        
        // Display order items
        displayOrderItems(orderData.items);
        
        // Display total
        displayTotal(orderData.total);
    } catch (error) {
        console.error('Error processing order:', error);
        showError('Error processing order data');
    }
});

// Function to format currency
function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return '₹' + num.toFixed(2);
}

// Function to format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return new Date().toLocaleDateString('en-IN');
    }
}

// Function to display order information
function displayOrderInfo(orderData) {
    $('#order-id').text(orderData.orderId || 'N/A');
    $('#customer-name').text(orderData.customerName || 'Guest');
    $('#order-date').text(formatDate(orderData.date));
}

// Function to display order items
function displayOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        $('#bill-items').html('<tr><td colspan="4" class="text-center">No items found</td></tr>');
        return;
    }

    let tableContent = '';
    
    items.forEach(item => {
        if (!item) return;
        
        const name = item.name || 'Unknown Item';
        const quantity = item.quantity || 0;
        const unit = item.unit || 'unit';
        const price = parseFloat(item.price) || 0;
        const total = parseFloat(item.total) || 0;

        tableContent += `
            <tr>
                <td>${name}</td>
                <td>${quantity} ${unit}</td>
                <td>${formatCurrency(price)}</td>
                <td>${formatCurrency(total)}</td>
            </tr>
        `;
    });
    
    $('#bill-items').html(tableContent);
}

// Function to display total
function displayTotal(total) {
    const formattedTotal = formatCurrency(total || 0);
    $('#bill-total').text(formattedTotal);
}

// Function to show error
function showError(message = 'No Order Data Found') {
    $('.bill-container').html(`
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">${message}</h4>
            <p>We couldn't process the order data properly. Please create a new order.</p>
            <hr>
            <div class="d-flex justify-content-center">
                <a href="order.html" class="btn btn-primary me-2">
                    <i class="fas fa-shopping-cart"></i> Create New Order
                </a>
                <a href="index.html" class="btn btn-secondary">
                    <i class="fas fa-home"></i> Go to Dashboard
                </a>
            </div>
        </div>
    `);
}
