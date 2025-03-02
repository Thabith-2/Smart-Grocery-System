$(document).ready(function() {
    try {
        // Get order data from localStorage
        const orderData = JSON.parse(localStorage.getItem('lastOrder'));
        
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            showError();
            return;
        }
        
        // Display order information
        displayOrderInfo(orderData);
        
        // Display order items
        displayOrderItems(orderData.items);
        
        // Display total
        displayTotal(orderData.total);
    } catch (error) {
        console.error('Error processing order data:', error);
        showError();
    }
});

// Function to format currency
function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return '₹0.00';
    return '₹' + parseFloat(amount).toFixed(2);
}

// Function to format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '/');
    } catch (error) {
        return new Date().toLocaleDateString('en-IN');
    }
}

// Function to display order information
function displayOrderInfo(orderData) {
    $('#order-id').text(orderData.orderId || 'N/A');
    $('#customer-name').text(orderData.customerName || 'N/A');
    $('#order-date').text(formatDate(orderData.date));
}

// Function to display order items
function displayOrderItems(items) {
    if (!Array.isArray(items)) return;
    
    let tableContent = '';
    
    items.forEach(item => {
        if (!item) return;
        
        const name = item.name || 'Unknown Item';
        const quantity = item.quantity || 0;
        const unit = item.unit || 'unit';
        const price = item.price || 0;
        const total = item.total || 0;
        
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
    $('#bill-total').text(formatCurrency(total));
}

// Function to show error
function showError() {
    $('.bill-container').html(`
        <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">No Order Data Found</h4>
            <p>We couldn't find any order data to generate a bill. Please create a new order.</p>
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
