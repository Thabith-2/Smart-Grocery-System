$(document).ready(function() {
    // Get order data from localStorage
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!orderData) {
        // No order data found, show error
        showError();
        return;
    }
    
    // Display order information
    displayOrderInfo(orderData);
    
    // Display order items
    displayOrderItems(orderData.items);
    
    // Display total
    displayTotal(orderData.total);
});

// Function to display order information
function displayOrderInfo(orderData) {
    $('#order-id').text(orderData.orderId);
    $('#customer-name').text(orderData.customerName);
    $('#order-date').text(formatDate(orderData.date));
}

// Function to display order items
function displayOrderItems(items) {
    let tableContent = '';
    
    items.forEach(item => {
        tableContent += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>₹${parseFloat(item.price).toFixed(2)}</td>
                <td>₹${parseFloat(item.total).toFixed(2)}</td>
            </tr>
        `;
    });
    
    $('#bill-items').html(tableContent);
}

// Function to display total
function displayTotal(total) {
    $('#bill-total').text(`₹${parseFloat(total).toFixed(2)}`);
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