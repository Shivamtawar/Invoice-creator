// Initialize the invoice with default values and event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    setDefaultDates();
    
    // Initialize item and addon containers
    initItemsAndAddons();
    
    // Add event listeners to all interactive elements
    setupEventListeners();
    
    // Initial update of preview
    updateInvoicePreview();
    
    // Apply the default theme explicitly on load
    changeColorTheme();

    // Update due amount
    updateDueAmount();
});

// Set today's date as invoice date and due date as 15 days from now
function setDefaultDates() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15);
    
    document.getElementById('invoice-date').valueAsDate = today;
    document.getElementById('due-date').valueAsDate = dueDate;
}

// Initialize items and addons
function initItemsAndAddons() {
    // Add first item row by default
    addItemRow();
    
    // Set up addons container (empty initially)
    document.getElementById('addons-container').innerHTML = `
        <div class="addon-details-header">
            <span>Description</span>
            <span>Quantity</span>
            <span>Rate</span>
            <span>Amount</span>
            <span></span>
        </div>
    `;
}

// Set up all event listeners
function setupEventListeners() {
    // Add item button
    document.getElementById('add-item').addEventListener('click', addItemRow);
    
    // Add addon button
    document.getElementById('add-addon').addEventListener('click', addAddonRow);
    
    // Discount type change
    document.getElementById('discount-type').addEventListener('change', handleDiscountTypeChange);
    
    // QR code type change
    document.getElementById('qr-payment').addEventListener('change', handleQRPaymentChange);
    
    // Logo upload handling
    document.getElementById('business-logo-upload').addEventListener('change', handleLogoUpload);
    document.getElementById('business-logo-url').addEventListener('input', handleLogoUrlChange);
    
    // Custom QR code upload
    document.getElementById('qr-custom-upload').addEventListener('change', handleQRUpload);
    
    // Theme change
    document.getElementById('color-theme').addEventListener('change', function() {
        changeColorTheme();
        updateInvoicePreview();
    });
    
    // Button actions
    document.getElementById('preview-invoice').addEventListener('click', updateInvoicePreview);
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('reset-form').addEventListener('click', resetForm);
    
    // Add input event listeners to all form fields for live updates
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
}

// Add a new item row to the items container
function addItemRow() {
    const itemsContainer = document.getElementById('items-container');
    
    // Check if header exists, if not add it
    if (itemsContainer.children.length === 0) {
        itemsContainer.innerHTML = `
            <div class="item-details-header">
                <span>Description</span>
                <span>Quantity</span>
                <span>Rate</span>
                <span>Amount</span>
                <span></span>
            </div>
        `;
    }
    
    // Create a new item row
    const itemRow = document.createElement('div');
    itemRow.className = 'item-details';
    itemRow.innerHTML = `
        <input type="text" class="item-description" placeholder="Item description">
        <input type="number" class="item-quantity" placeholder="1" value="1" min="1">
        <input type="number" class="item-rate" placeholder="0.00" step="0.01" min="0">
        <input type="text" class="item-amount" placeholder="0.00" readonly>
        <button class="delete-item"><i class="fas fa-times"></i></button>
    `;
    
    // Add event listeners to the new row inputs
    itemRow.querySelector('.item-quantity').addEventListener('input', calculateItemAmount);
    itemRow.querySelector('.item-rate').addEventListener('input', calculateItemAmount);
    itemRow.querySelector('.delete-item').addEventListener('click', function() {
        itemRow.remove();
        updateInvoicePreview();
    });
    
    // Append the new row
    itemsContainer.appendChild(itemRow);
    
    // Calculate the initial amount
    calculateItemAmount.call(itemRow.querySelector('.item-rate'));
}

// Add a new addon row
function addAddonRow() {
    const addonsContainer = document.getElementById('addons-container');
    
    // Create a new addon row
    const addonRow = document.createElement('div');
    addonRow.className = 'addon-details';
    addonRow.innerHTML = `
        <input type="text" class="addon-description" placeholder="Add-on description">
        <input type="number" class="addon-quantity" placeholder="1" value="1" min="1">
        <input type="number" class="addon-rate" placeholder="0.00" step="0.01" min="0">
        <input type="text" class="addon-amount" placeholder="0.00" readonly>
        <button class="delete-addon"><i class="fas fa-times"></i></button>
    `;
    
    // Add event listeners to the new row inputs
    addonRow.querySelector('.addon-quantity').addEventListener('input', calculateAddonAmount);
    addonRow.querySelector('.addon-rate').addEventListener('input', calculateAddonAmount);
    addonRow.querySelector('.delete-addon').addEventListener('click', function() {
        addonRow.remove();
        updateInvoicePreview();
    });
    
    // Append the new row
    addonsContainer.appendChild(addonRow);
    
    // Calculate the initial amount
    calculateAddonAmount.call(addonRow.querySelector('.addon-rate'));
}

// Calculate item amount based on quantity and rate
function calculateItemAmount() {
    const row = this.closest('.item-details');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const amount = quantity * rate;
    
    row.querySelector('.item-amount').value = amount.toFixed(2);
    updateInvoicePreview();
}

// Calculate addon amount based on quantity and rate
function calculateAddonAmount() {
    const row = this.closest('.addon-details');
    const quantity = parseFloat(row.querySelector('.addon-quantity').value) || 0;
    const rate = parseFloat(row.querySelector('.addon-rate').value) || 0;
    const amount = quantity * rate;
    
    row.querySelector('.addon-amount').value = amount.toFixed(2);
    updateInvoicePreview();
}

// Handle discount type change
function handleDiscountTypeChange() {
    const discountType = document.getElementById('discount-type').value;
    const discountValueContainer = document.querySelector('.discount-value-container');
    const discountReasonContainer = document.querySelector('.discount-reason-container');
    
    if (discountType === 'none') {
        discountValueContainer.style.display = 'none';
        discountReasonContainer.style.display = 'none';
    } else {
        discountValueContainer.style.display = 'block';
        discountReasonContainer.style.display = 'block';
    }
    
    updateInvoicePreview();
}

// Handle QR payment option change
function handleQRPaymentChange() {
    const qrType = document.getElementById('qr-payment').value;
    const qrUpiContainer = document.querySelector('.qr-upi-container');
    const qrCustomContainer = document.querySelector('.qr-custom-container');
    const qrCodeArea = document.getElementById('qr-code-area');
    
    // Hide all containers first
    qrUpiContainer.style.display = 'none';
    qrCustomContainer.style.display = 'none';
    
    // Show relevant container based on selection
    if (qrType === 'none') {
        qrCodeArea.style.display = 'none';
    } else {
        qrCodeArea.style.display = 'block';
        if (qrType === 'upi') {
            qrUpiContainer.style.display = 'block';
        } else if (qrType === 'custom') {
            qrCustomContainer.style.display = 'block';
        }
    }
    
    updateInvoicePreview();
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoImg = document.querySelector('#preview-logo img');
            logoImg.src = event.target.result;
            document.getElementById('business-logo-url').value = '';
        };
        reader.readAsDataURL(file);
    }
}

// Handle logo URL change
function handleLogoUrlChange() {
    const url = document.getElementById('business-logo-url').value;
    if (url) {
        const logoImg = document.querySelector('#preview-logo img');
        logoImg.src = url;
        document.getElementById('business-logo-upload').value = '';
    }
}

// Handle QR code upload
function handleQRUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const qrImg = document.querySelector('#qr-code-image img');
            qrImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Change color theme
function changeColorTheme() {
    const theme = document.getElementById('color-theme').value;
    const invoicePreview = document.getElementById('invoice-preview');
    
    // Remove all theme classes first
    invoicePreview.classList.remove('theme-blue', 'theme-teal', 'theme-purple', 'theme-green', 'theme-dark');
    
    // Add the selected theme class
    invoicePreview.classList.add(`theme-${theme}`);
}

// Update invoice preview based on form values
function updateInvoicePreview() {
    // Update basic info
    document.getElementById('preview-invoice-number').textContent = '#' + (document.getElementById('invoice-number').value || 'INV-001');
    document.getElementById('preview-business-name').textContent = document.getElementById('business-name').value || 'Your Business LLC';
    document.getElementById('preview-business-contact').textContent = document.getElementById('business-contact').value || 'Your Name';
    document.getElementById('preview-business-phone').textContent = document.getElementById('business-phone').value || '(555) 555-5555';
    document.getElementById('preview-business-email').textContent = document.getElementById('business-email').value || 'your@email.com';
    
    // Update client info
    document.getElementById('preview-client-name').textContent = document.getElementById('client-name').value || 'Client Name';
    document.getElementById('preview-client-phone').textContent = document.getElementById('client-phone').value || '(555) 555-5555';
    document.getElementById('preview-client-email').textContent = document.getElementById('client-email').value || 'client@email.com';
    
    // Update dates
    const invoiceDate = document.getElementById('invoice-date').value ? new Date(document.getElementById('invoice-date').value) : new Date();
    const dueDate = document.getElementById('due-date').value ? new Date(document.getElementById('due-date').value) : new Date();
    
    document.getElementById('preview-invoice-date').textContent = formatDate(invoiceDate);
    document.getElementById('preview-due-date').textContent = formatDate(dueDate);
    document.getElementById('preview-po-number').textContent = document.getElementById('po-number').value || '001';
    
    // Update items in preview
    updateItemsPreview();
    
    // Calculate and update totals
    calculateTotals();
    
    // Update notes
    document.getElementById('preview-notes').textContent = document.getElementById('notes').value || 'Thank you for your business!';
    
    // Update QR code text
    updateQRCode();
    
    // Update due amount
    updateDueAmount();
}

// Update items in the preview table
function updateItemsPreview() {
    const itemsTableBody = document.getElementById('preview-items');
    itemsTableBody.innerHTML = '';
    
    // Get currency symbol
    const currencySymbol = document.getElementById('currency').value;
    
    // Add items
    const itemRows = document.querySelectorAll('.item-details');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value || 'Item description';
        const quantity = row.querySelector('.item-quantity').value || '0';
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${description}</td>
            <td>${quantity}</td>
            <td>${currencySymbol}${rate.toFixed(2)}</td>
            <td>${currencySymbol}${amount.toFixed(2)}</td>
        `;
        itemsTableBody.appendChild(tr);
    });
    
    // Add add-ons
    const addonRows = document.querySelectorAll('.addon-details');
    addonRows.forEach(row => {
        const description = row.querySelector('.addon-description').value || 'Add-on';
        const quantity = row.querySelector('.addon-quantity').value || '0';
        const rate = parseFloat(row.querySelector('.addon-rate').value) || 0;
        const amount = parseFloat(row.querySelector('.addon-amount').value) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${description} <small>(Add-on)</small></td>
            <td>${quantity}</td>
            <td>${currencySymbol}${rate.toFixed(2)}</td>
            <td>${currencySymbol}${amount.toFixed(2)}</td>
        `;
        itemsTableBody.appendChild(tr);
    });
}

// Calculate subtotal, discount, tax, and total
function calculateTotals() {
    // Get currency symbol
    const currencySymbol = document.getElementById('currency').value;
    
    // Calculate subtotal from items
    let subtotal = 0;
    document.querySelectorAll('.item-details').forEach(row => {
        subtotal += parseFloat(row.querySelector('.item-amount').value) || 0;
    });
    
    // Add addons to subtotal
    document.querySelectorAll('.addon-details').forEach(row => {
        subtotal += parseFloat(row.querySelector('.addon-amount').value) || 0;
    });
    
    // Calculate discount
    let discount = 0;
    const discountType = document.getElementById('discount-type').value;
    const discountValue = parseFloat(document.getElementById('discount-value').value) || 0;
    const discountReason = document.getElementById('discount-reason').value || '';
    
    if (discountType === 'percentage') {
        discount = (subtotal * discountValue / 100);
    } else if (discountType === 'fixed') {
        discount = discountValue;
    }
    
    // Calculate tax
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    
    // Calculate total
    const total = subtotal - discount + taxAmount;
    
    // Update preview with formatted values
    document.getElementById('preview-subtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
    document.getElementById('preview-balance-due').textContent = `${currencySymbol}${total.toFixed(2)}`;
    document.getElementById('preview-total').textContent = `${currencySymbol}${total.toFixed(2)}`;
    
    // Handle discount display
    const discountRow = document.querySelector('.discount-row');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('preview-discount').textContent = `-${currencySymbol}${discount.toFixed(2)}`;
        document.getElementById('preview-discount-reason').textContent = discountReason ? ` (${discountReason})` : '';
    } else {
        discountRow.style.display = 'none';
    }
    
    // Handle tax display
    const taxRow = document.querySelector('.tax-row');
    if (taxAmount > 0) {
        taxRow.style.display = 'flex';
        document.getElementById('preview-tax').textContent = `${currencySymbol}${taxAmount.toFixed(2)}`;
    } else {
        taxRow.style.display = 'none';
    }
}

// Update QR code based on selection
function updateQRCode() {
    const qrType = document.getElementById('qr-payment').value;
    const qrCodeArea = document.getElementById('qr-code-area');
    
    if (qrType === 'none') {
        qrCodeArea.style.display = 'none';
    } else {
        qrCodeArea.style.display = 'block';
        
        if (qrType === 'upi') {
            const upiId = document.getElementById('qr-upi-id').value || 'yourname@upi';
            document.getElementById('qr-code-text').textContent = `Scan to pay (UPI: ${upiId})`;
        } else if (qrType === 'custom') {
            document.getElementById('qr-code-text').textContent = 'Scan to pay';
        }
    }
}

// Format date as MM/DD/YYYY
function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Generate and download PDF
function downloadPDF() {
    // First update the preview to ensure it's current
    updateInvoicePreview();
    
    // Get invoice container
    const invoiceElement = document.getElementById('invoice-preview');
    
    // Create configuration for html2canvas
    const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
    };
    
    // Notify user
    alert('Preparing your PDF for download. This might take a moment...');
    
    // Convert to canvas and then to PDF
    html2canvas(invoiceElement, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate the PDF size
        const imgWidth = 190; // Reduced width to add margins
        const pageHeight = 280; // Reduced height to add margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add margins to the PDF
        const marginLeft = 10; // Left margin in mm
        const marginTop = 10; // Top margin in mm
        
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
        
        // Check if we need additional pages
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add additional pages if needed
        while (heightLeft > pageHeight) {
            position = heightLeft - pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', marginLeft, -position + marginTop, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Get business name for filename or default to "invoice"
        const businessName = document.getElementById('business-name').value || 'invoice';
        const invoiceNumber = document.getElementById('invoice-number').value || 'INV001';
        
        // Download the PDF
        pdf.save(`${businessName}-${invoiceNumber}.pdf`);
    });
}

// Reset form to default values
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All your data will be lost.')) {
        // Clear all inputs
        document.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        
        // Reset select dropdowns
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Reset items and addons containers
        document.getElementById('items-container').innerHTML = '';
        document.getElementById('addons-container').innerHTML = '';
        
        // Reset discount and QR containers visibility
        document.querySelector('.discount-value-container').style.display = 'none';
        document.querySelector('.discount-reason-container').style.display = 'none';
        document.querySelector('.qr-upi-container').style.display = 'none';
        document.querySelector('.qr-custom-container').style.display = 'none';
        
        // Reset theme
        document.getElementById('color-theme').value = 'blue';
        changeColorTheme(); // Apply default theme explicitly after reset
        
        // Reset dates
        setDefaultDates();
        
        // Reinitialize items and addons
        initItemsAndAddons();
        
        // Update preview
        updateInvoicePreview();
    }
}

// Update due amount whenever total changes
function updateDueAmount() {
    const totalAmount = document.getElementById('preview-total').textContent;
    document.getElementById('preview-due-amount').textContent = totalAmount;
}