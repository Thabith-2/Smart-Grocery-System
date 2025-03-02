// ... existing code ...

// Inside the saveOrder click handler
$("#saveOrder").click(function() {
    // ... existing code ...
    
    $("#itemsInOrder .product-item").each(function() {
        const productSelect = $(this).find('.cart-product');
        const productId = productSelect.val();
        // Get the actual text of the selected option for product name
        const productName = productSelect.find('option:selected').text().trim();
        const qty = parseInt($(this).find('.product-qty').val()) || 0;
        const price = parseFloat($(this).find('.product-price').val()) || 0;
        const total = parseFloat($(this).find('.product-total').val()) || 0;
        
        // ... validation code ...
        
        // Find product details for unit
        const product = productList.find(p => p.product_id == productId);
        const unit = product ? product.uom_name : 'unit';
        
        orderItems.push({
            product_id: productId,
            quantity: qty,
            unit_price: price.toString(),
            total_price: total.toString()
        });
        
        billItems.push({
            name: productName || `Product #${productId}`,  // Use actual product name
            quantity: qty,
            unit: unit,
            price: price,
            total: total
        });
    });
    
    // ... rest of the code ...
    
    // In the success handler
    success: function(response) {
        console.log("Order API response:", response);
        
        // Store order data for bill generation with proper formatting
        const orderData = {
            orderId: response.order_id,
            customerName: customerName,
            date: new Date().toISOString(),
            items: billItems,  // Use the billItems array with product names
            total: parseFloat(grandTotal)
        };
        
        console.log("Storing order data for bill:", JSON.stringify(orderData));
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Show success message
        alert('Order saved successfully');
        
        // Redirect to bill page
        window.location.href = 'bill.html';
    },
    
    // ... rest of the code ...
});

// ... rest of the code ...
