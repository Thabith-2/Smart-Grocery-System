// Define your api here
var productListApiUrl = 'https://smart-grocery-system.onrender.com/getProducts';
var uomListApiUrl = 'https://smart-grocery-system.onrender.com/getUOM';
var productSaveApiUrl = 'https://smart-grocery-system.onrender.com/insertProduct';
var productDeleteApiUrl = 'https://smart-grocery-system.onrender.com/deleteProduct';
var orderListApiUrl = 'https://smart-grocery-system.onrender.com/getAllOrders';
var orderSaveApiUrl = 'https://smart-grocery-system.onrender.com/insertOrder';

// For product drop in order
var productsApiUrl = 'https://fakestoreapi.com/products';

function callApi(method, url, data) {
    $.ajax({
        method: method,
        url: url,
        data: data
    }).done(function( msg ) {
        window.location.reload();
    });
}

function calculateValue() {
    var total = 0;
    $(".product-item").each(function( index ) {
        var qty = parseFloat($(this).find('.product-qty').val());
        var price = parseFloat($(this).find('#product_price').val());
        price = price*qty;
        $(this).find('#item_total').val(price.toFixed(2));
        total += price;
    });
    $("#product_grand_total").val(total.toFixed(2));
}

function orderParser(order) {
    return {
        id : order.id,
        date : order.employee_name,
        orderNo : order.employee_name,
        customerName : order.employee_name,
        cost : parseInt(order.employee_salary)
    }
}

function productParser(product) {
    return {
        id : product.id,
        name : product.employee_name,
        unit : product.employee_name,
        price : product.employee_name
    }
}

function productDropParser(product) {
    return {
        id : product.id,
        name : product.title
    }
}

//To enable bootstrap tooltip globally
// $(function () {
//     $('[data-toggle="tooltip"]').tooltip()
// });

// Common utility functions for the application

// Function to format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
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

// Function to show loading spinner
function showLoading(element) {
    $(element).html(`
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        </div>
    `);
}

// Function to show error message
function showError(element, message) {
    $(element).html(`
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message || 'An error occurred. Please try again.'}
        </div>
    `);
}

// Function to show success message
function showSuccess(element, message) {
    $(element).html(`
        <div class="alert alert-success" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            ${message || 'Operation completed successfully.'}
        </div>
    `);
}

// Function to show empty state
function showEmptyState(element, title, message, buttonText, buttonUrl, buttonIcon) {
    $(element).html(`
        <div class="text-center py-5">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" style="width: 80px; opacity: 0.5" class="mb-3">
            <h5 class="mb-2">${title || 'No Data Found'}</h5>
            <p class="text-muted mb-4">${message || 'There are no items to display.'}</p>
            ${buttonText ? `
                <a href="${buttonUrl || '#'}" class="btn btn-primary">
                    ${buttonIcon ? `<i class="fas fa-${buttonIcon} me-2"></i>` : ''}
                    ${buttonText}
                </a>
            ` : ''}
        </div>
    `);
}

// Function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    return {
        success: false,
        message: 'Unable to connect to the server. Please try again later.'
    };
}

// Function to validate form inputs
function validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
        const value = formData[field];
        const fieldRules = rules[field];
        
        if (fieldRules.required && (!value || value.trim() === '')) {
            errors[field] = `${fieldRules.label || field} is required`;
            continue;
        }
        
        if (fieldRules.min && parseFloat(value) < fieldRules.min) {
            errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.min}`;
            continue;
        }
        
        if (fieldRules.max && parseFloat(value) > fieldRules.max) {
            errors[field] = `${fieldRules.label || field} must be at most ${fieldRules.max}`;
            continue;
        }
        
        if (fieldRules.pattern && !new RegExp(fieldRules.pattern).test(value)) {
            errors[field] = fieldRules.message || `${fieldRules.label || field} is invalid`;
            continue;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Function to create a toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    if ($('#toast-container').length === 0) {
        $('body').append(`
            <div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1100"></div>
        `);
    }
    
    // Generate a unique ID for the toast
    const toastId = 'toast-' + Date.now();
    
    // Set toast color based on type
    let bgColor = 'bg-success';
    let icon = 'check-circle';
    
    if (type === 'error') {
        bgColor = 'bg-danger';
        icon = 'exclamation-triangle';
    } else if (type === 'warning') {
        bgColor = 'bg-warning';
        icon = 'exclamation-circle';
    } else if (type === 'info') {
        bgColor = 'bg-info';
        icon = 'info-circle';
    }
    
    // Create toast element
    const toast = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icon} me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container
    $('#toast-container').append(toast);
    
    // Initialize and show the toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
        delay: 5000
    });
    toastElement.show();
    
    // Remove toast from DOM after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

// Function to format number with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to generate a random ID
function generateId(prefix = '') {
    return prefix + Math.random().toString(36).substr(2, 9);
}

// Function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
