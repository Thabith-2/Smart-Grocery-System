$(document).ready(function() {
    try {
        console.log("Loading bill page");
        const orderDataString = localStorage.getItem('lastOrder');
        console.log("Retrieved order data:", orderDataString);
        
        const orderData = JSON.parse(orderDataString);
        
        if (!orderData || !orderData.items || !Array.isArray(orderData.items)) {
            console.error("Invalid order data:", orderData);
            showError();
            return;
        }
        
        displayOrderInfo(orderData);
        displayOrderItems(orderData.items);
        displayTotal(orderData.total);
    } catch (error) {
        console.error('Error processing order data:', error);
        showError();
    }
});

function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) {
        console.warn("Invalid amount for currency formatting:", amount);
        return '₹0.00';
    }
    return '₹' + num.toFixed(2);
}

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
        });
    } catch (error) {
        console.warn("Date formatting error:", error);
        return new Date().toLocaleDateString('en-IN');
    }
}

function displayOrderInfo(orderData) {
    console.log("Displaying order info:", orderData);
    $('#order-id').text(orderData.orderId || 'N/A');
    $('#customer-name').text(orderData.customerName || 'N/A');
    $('#order-date').text(formatDate(orderData.date));
}

function displayOrderItems(items) {
    console.log("Displaying order items:", items);
    let tableContent = '';
    
    items.forEach((item, index) => {
        if (!item) {
            console.warn(`Skipping invalid item at index ${index}`);
            return;
        }
        
        tableContent += `
            <tr>
                <td>${item.name || 'Unknown Item'}</td>
                <td>${item.quantity || 0} ${item.unit || 'unit'}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.total)}</td>
            </tr>
        `;
    });
    
    $('#bill-items').html(tableContent);
}

function displayTotal(total) {
    console.log("Displaying total:", total);
    $('#bill-total').text(formatCurrency(total));
}

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
