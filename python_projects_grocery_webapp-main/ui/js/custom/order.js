$(document).ready(function() {
    // API URLs
    const productListApiUrl = 'http://localhost:5000/getProducts';
    const orderSaveApiUrl = 'http://localhost:5000/insertOrder';
    
    // Load products for dropdown
    let productList = [];
    $.get(productListApiUrl, function(response) {
        if (response) {
            productList = response;
            // Add first item by default
            addNewItem();
        }
    });
    
    // Add more items button click handler
    $("#addMoreButton").click(function() {
        addNewItem();
    });
    
    // Remove item button click handler
    $(document).on("click", ".remove-row", function() {
        $(this).closest('.product-item').remove();
        calculateGrandTotal();
    });
    
    // Product selection change handler
    $(document).on("change", ".cart-product", function() {
        const productId = $(this).val();
        const item = $(this).closest('.product-item');
        
        // Find selected product
        const selectedProduct = productList.find(product => product.product_id == productId);
        
        if (selectedProduct) {
            // Update price
            const price = parseFloat(selectedProduct.price_per_unit);
            item.find('.product-price').val(price.toFixed(2));
            
            // Update total
            const qty = parseInt(item.find('.product-qty').val());
            const total = price * qty;
            item.find('.product-total').val(total.toFixed(2));
            
            // Update grand total
            calculateGrandTotal();
        }
    });
    
    // Quantity change handler
    $(document).on("change", ".product-qty", function() {
        const item = $(this).closest('.product-item');
        const price = parseFloat(item.find('.product-price').val());
        const qty = parseInt($(this).val());
        
        // Update total
        const total = price * qty;
        item.find('.product-total').val(total.toFixed(2));
        
        // Update grand total
        calculateGrandTotal();
    });
    
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
            // Get the actual text of the selected option for product name
            const productName = productSelect.find('option:selected').text().trim();
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
            error: function(error) {
                console.error('Error saving order:', error);
                console.error('Error details:', error.responseText); // More detailed error
                alert('Error saving order. Please try again.');
            }
        });
    });
    
    // Function to add new item
    function addNewItem() {
        // Clone template
        const newItem = $(".product-box .product-item").clone();
        
        // Populate product dropdown
        let options = '<option value="">Select Product</option>';
        productList.forEach(product => {
            options += `<option value="${product.product_id}">${product.name}</option>`;
        });
        newItem.find('.cart-product').html(options);
        
        // Add to order items
        $("#itemsInOrder").append(newItem);
    }
    
    // Function to calculate grand total
    function calculateGrandTotal() {
        let grandTotal = 0;
        
        $("#itemsInOrder .product-item").each(function() {
            const total = parseFloat($(this).find('.product-total').val()) || 0;
            grandTotal += total;
        });
        
        $("#product_grand_total").val(grandTotal.toFixed(2));
    }
});
