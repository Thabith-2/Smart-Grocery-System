$(document).ready(function() {
    // API URLs
    const productListApiUrl = 'https://smart-grocery-system.onrender.com/getProducts';
    const productSaveApiUrl = 'https://smart-grocery-system.onrender.com/insertProduct';
    const productDeleteApiUrl = 'https://smart-grocery-system.onrender.com/deleteProduct';
    const uomListApiUrl = 'https://smart-grocery-system.onrender.com/getUOM';
    
    // Load product data when page loads
    $.get(productListApiUrl, function(response) {
        if (response) {
            displayProductList(response);
        }
    });
    
    // Load UOM data for dropdown
    $.get(uomListApiUrl, function(response) {
        if (response) {
            displayUomList(response);
        }
    });
    
    // Save product button click handler
    $("#saveProduct").on("click", function() {
        // Get form data
        const data = {
            name: $("#name").val(),
            uom_id: $("#uoms").val(),
            price_per_unit: $("#price").val()
        };
        
        // Validate form data
        if (!data.name) {
            alert('Please enter product name');
            return;
        }
        
        if (!data.uom_id) {
            alert('Please select a unit');
            return;
        }
        
        if (!data.price_per_unit) {
            alert('Please enter price');
            return;
        }
        
        // Create form data for API
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        // Save product via API
        $.ajax({
            url: productSaveApiUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response) {
                    // Close modal
                    $('#addProductModal').modal('hide');
                    
                    // Reset form
                    $("#productForm")[0].reset();
                    
                    // Show success message
                    alert('Product saved successfully');
                    
                    // Reload product list
                    $.get(productListApiUrl, function(response) {
                        if (response) {
                            displayProductList(response);
                        }
                    });
                }
            },
            error: function(error) {
                console.error('Error saving product:', error);
                alert('Error saving product. Please try again.');
            }
        });
    });
    
    // Delete product button click handler
    $(document).on("click", ".delete-product", function() {
        const productId = $(this).data('id');
        
        if (confirm('Are you sure you want to delete this product?')) {
            // Create form data for API
            const formData = new FormData();
            formData.append('product_id', productId);
            
            // Delete product via API
            $.ajax({
                url: productDeleteApiUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response) {
                        // Show success message
                        alert('Product deleted successfully');
                        
                        // Reload product list
                        $.get(productListApiUrl, function(response) {
                            if (response) {
                                displayProductList(response);
                            }
                        });
                    }
                },
                error: function(error) {
                    console.error('Error deleting product:', error);
                    alert('Error deleting product. Please try again.');
                }
            });
        }
    });
    
    // Function to display product list in table
    function displayProductList(products) {
        let tableContent = '';
        
        if (products.length === 0) {
            tableContent = `
                <tr>
                    <td colspan="4" class="text-center">
                        <div class="py-5">
                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" style="width: 80px; opacity: 0.5" class="mb-3">
                            <p class="mb-3">No products found. Add your first product!</p>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addProductModal">
                                <i class="fas fa-plus"></i> Add Product
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            products.forEach(product => {
                tableContent += `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.uom_name}</td>
                        <td>₹${parseFloat(product.price_per_unit).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-danger delete-product" data-id="${product.product_id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        $("table tbody").html(tableContent);
    }
    
    // Function to display UOM list in dropdown
    function displayUomList(uoms) {
        let options = '<option value="">Select Unit</option>';
        
        uoms.forEach(uom => {
            options += `<option value="${uom.uom_id}">${uom.uom_name}</option>`;
        });
        
        $("#uoms").html(options);
    }
});
