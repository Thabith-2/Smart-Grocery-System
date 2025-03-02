// ... existing code ...

$("#saveOrder").click(function() {
    console.log("Save button clicked");
    
    const customerName = $("#customerName").val();
    
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }
    
    const orderItems = [];
    const billItems = [];
    let isValid = true;
    
    $("#itemsInOrder .product-item").each(function() {
        const productSelect = $(this).find('.cart-product');
        const productId = productSelect.val();
        const productName = productSelect.find('option:selected').text();
        const qty = parseInt($(this).find('.product-qty').val()) || 0;
        const price = parseFloat($(this).find('.product-price').val()) || 0;
        const total = parseFloat($(this).find('.product-total').val()) || 0;
        
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
        
        const product = productList.find(p => p.product_id == productId);
        const unit = product ? product.uom_name : 'unit';
        
        orderItems.push({
            product_id: productId,
            quantity: qty,
            unit_price: price.toString(),
            total_price: total.toString()
        });
        
        billItems.push({
            name: productName || 'Unknown Item',
            quantity: qty,
            unit: unit,
            price: price,
            total: total
        });
    });
    
    if (!isValid || orderItems.length === 0) {
        if (orderItems.length === 0) alert('Please add at least one item');
        return;
    }
    
    const grandTotal = parseFloat($("#product_grand_total").val()) || 0;
    const data = {
        customer_name: customerName,
        grand_total: grandTotal.toString(),
        order_details: orderItems
    };
    
    console.log("Sending order data:", JSON.stringify(data));
    
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    $.ajax({
        url: orderSaveApiUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log("Order API response:", response);
            
            const orderData = {
                orderId: response.order_id,
                customerName: customerName,
                date: new Date().toISOString(),
                items: billItems,
                total: grandTotal
            };
            
            console.log("Storing order data:", JSON.stringify(orderData));
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            
            alert('Order saved successfully');
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
