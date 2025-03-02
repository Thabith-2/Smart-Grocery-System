// ... existing code ...

// Save order button click handler
$("#saveOrder").click(function() {
    console.log("Save button clicked"); // Debug log
    
    // Get customer name
    const customerName = $("#customerName").val();
    
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }
    
    // Get order items
    const orderItems = [];
    const billItems = [];
    let isValid = true;
    
    $("#itemsInOrder .product-item").each(function() {
        const productSelect = $(this).find('.cart-product');
        const productId = productSelect.val();
        const productName = productSelect.find('option:selected').text();
        const qty = parseInt($(this).find('.product-qty').val());
        const price = parseFloat($(this).find('.product-price').val());
        const total = parseFloat($(this).find('.product-total').val());
        
        if (!productId) {
            alert('Please select a product');
            isValid = false;
            return false;
        }
        
        if (qty <= 0) {
            alert('Quantity must be greater than 0');
            isValid = false;
            return false;
        }
        
        // Find product details for unit
        const product = productList.find(p => p.product_id == productId);
        const unit = product ? product.uom_name : '';
        
        orderItems.push({
            product_id: productId,
            quantity: qty,
            total_price: total.toString()
        });
        
        billItems.push({
            name: productName || 'Unknown Item',
            quantity: qty || 0,
            unit: unit || 'unit',
            price: price || 0,
            total: total || 0
        });
    });
    
    if (!isValid) {
        return;
    }
    
    if (orderItems.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    // Create order data
    const grandTotal = parseFloat($("#product_grand_total").val());
    const data = {
        customer_name: customerName,
        grand_total: grandTotal.toString(),
        order_details: orderItems
    };
    
    console.log("Sending order data:", JSON.stringify(data)); // Debug log
    
    // Create form data for API
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    // Save order via API
    $.ajax({
        url: orderSaveApiUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("Order API response:", response); // Debug log
            
            // Store order data for bill generation with proper formatting
            const orderData = {
                orderId: response.order_id,
                customerName: customerName,
                date: new Date().toISOString(),
                items: billItems.map(item => ({
                    name: item.name,
                    quantity: parseInt(item.quantity),
                    unit: item.unit,
                    price: parseFloat(item.price),
                    total: parseFloat(item.total)
                })),
                total: parseFloat(grandTotal)
            };
            
            // Save to localStorage with proper JSON stringification
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            
            // Show success message
            alert('Order saved successfully');
            
            // Redirect to bill page
            window.location.href = 'bill.html';
        },
        error: function(error) {
            console.error('Error saving order:', error);
            console.error('Error details:', error.responseText);
            alert('Error saving order. Please try again.');
        }
    });
});

// ... existing code ...
