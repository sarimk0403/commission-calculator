let totalCommission = 0;
let editingRowIndex = null;

// Default prices (can be modified by the user)
let prices = {
    Basic: 15000,
    Target: 18000,
    PT: 25000
};

let deductions = {
    Basic: 8000,
    Target: 9000,
    PT: 10000
};

// Function to save settings to localStorage
function savePrices() {
    localStorage.setItem('exercisePrices', JSON.stringify(prices));
    localStorage.setItem('exerciseDeductions', JSON.stringify(deductions));
}

// Function to load prices from localStorage
function loadPrices() {
    const savedPrices = localStorage.getItem('exercisePrices');
    const savedDeductions = localStorage.getItem('exerciseDeductions');

    if (savedPrices) {
        prices = JSON.parse(savedPrices);
        document.getElementById('basicPrice').value = prices.Basic;
        document.getElementById('targetPrice').value = prices.Target;
        document.getElementById('ptPrice').value = prices.PT;
    }

    if (savedDeductions) {
        deductions = JSON.parse(savedDeductions);
        document.getElementById('basicDeduction').value = deductions.Basic;
        document.getElementById('targetDeduction').value = deductions.Target;
        document.getElementById('ptDeduction').value = deductions.PT;
    }
}

// Load prices when the page loads
window.onload = loadPrices;

// Event listener for saving prices
document.getElementById('savePrices').addEventListener('click', function() {
    prices.Basic = parseFloat(document.getElementById('basicPrice').value) || prices.Basic;
    prices.Target = parseFloat(document.getElementById('targetPrice').value) || prices.Target;
    prices.PT = parseFloat(document.getElementById('ptPrice').value) || prices.PT;

    deductions.Basic = parseFloat(document.getElementById('basicDeduction').value) || deductions.Basic;
    deductions.Target = parseFloat(document.getElementById('targetDeduction').value) || deductions.Target;
    deductions.PT = parseFloat(document.getElementById('ptDeduction').value) || deductions.PT;

    savePrices();
    alert('Prices and Deductions saved successfully!');
});

// Event listener for editing prices
document.getElementById('editPrices').addEventListener('click', function() {
    document.getElementById('basicPrice').value = prices.Basic;
    document.getElementById('targetPrice').value = prices.Target;
    document.getElementById('ptPrice').value = prices.PT;

    document.getElementById('basicDeduction').value = deductions.Basic;
    document.getElementById('targetDeduction').value = deductions.Target;
    document.getElementById('ptDeduction').value = deductions.PT;

    alert('You can now edit the prices and deductions.');
});

// Event listener for form submission
document.getElementById('personForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const exerciseType = document.getElementById('exerciseType').value;
    const uniqueID = document.getElementById('uniqueID').value;

    // Get price based on exercise type
    const price = prices[exerciseType] || 0;
    const deduction = deductions[exerciseType] || 0;
    const adjustedPrice = price - deduction;
    const commission = adjustedPrice * 0.50;

    if (editingRowIndex !== null) {
        // If editing, update the existing row
        updateRow(editingRowIndex, name, exerciseType, price, uniqueID, commission);
        editingRowIndex = null;  // Reset editing mode
    } else {
        // If not editing, add new row
        addRowToTable(name, exerciseType, price, uniqueID, commission);
    }

    // Clear form
    document.getElementById('personForm').reset();
});

// Function to add new row to the table
function addRowToTable(name, exerciseType, price, uniqueID, commission) {
    const table = document.getElementById('personTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const nameCell = newRow.insertCell(0);
    const exerciseTypeCell = newRow.insertCell(1);
    const priceCell = newRow.insertCell(2);
    const uniqueIDCell = newRow.insertCell(3);
    const commissionCell = newRow.insertCell(4);
    const actionsCell = newRow.insertCell(5);

    nameCell.innerHTML = name;
    exerciseTypeCell.innerHTML = exerciseType;
    priceCell.innerHTML = price.toFixed(2);
    uniqueIDCell.innerHTML = uniqueID;
    commissionCell.innerHTML = commission.toFixed(2);

    // Add Edit and Delete buttons to the row
    actionsCell.innerHTML = `
        <button class="edit-btn" onclick="editRow(this)">Edit</button>
        <button class="delete-btn" onclick="deleteRow(this, ${commission})">Delete</button>
    `;

    // Update the total commission
    updateTotalCommission(commission);
}

function updateTotalCommission(commission) {
    totalCommission += commission;
    document.getElementById('totalCommission').textContent = totalCommission.toFixed(2);
}

// Function to edit an existing row
function editRow(button) {
    const row = button.parentNode.parentNode;
    editingRowIndex = row.rowIndex - 1; // Adjust for header row

    // Populate form with current row values
    document.getElementById('name').value = row.cells[0].textContent;
    document.getElementById('exerciseType').value = row.cells[1].textContent;
    document.getElementById('uniqueID').value = row.cells[3].textContent;

    // Optionally, remove the commission of the row being edited from the total
    updateTotalCommission(-parseFloat(row.cells[4].textContent));
}

// Function to delete a row
function deleteRow(button, commission) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotalCommission(-commission);
}

// Toggle the visibility of the price settings section
document.getElementById('togglePriceSettings').addEventListener('click', function () {
    const settingsDiv = document.getElementById('price-settings');
    const toggleBtn = document.getElementById('togglePriceSettings');

    if (settingsDiv.style.display === "none" || settingsDiv.style.display === "") {
        settingsDiv.style.display = "block";
        toggleBtn.textContent = "▲"; // Change arrow to up
    } else {
        settingsDiv.style.display = "none";
        toggleBtn.textContent = "▼"; // Change arrow to down
    }
});

// Automatically hide settings after saving prices
document.getElementById('savePrices').addEventListener('click', function () {
    document.getElementById('price-settings').style.display = "none";
    document.getElementById('togglePriceSettings').textContent = "▼";
});

// Function to generate PDF from table without "Actions" column and with dynamic month title
document.getElementById('submitInvoice').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get current month name
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    const currentMonth = monthNames[currentDate.getMonth()]; // Get month name

    const title = `${currentMonth} Payroll`; // Dynamic title

    doc.text(title, 14, 15); // Set dynamic title at the top

    // Get table headers (excluding the last column)
    const headers = [];
    document.querySelectorAll("#personTable thead th").forEach((th, index) => {
        if (index < 5) { // Only include the first 5 columns (skip "Actions")
            headers.push(th.innerText);
        }
    });

    // Get table rows (excluding the last column)
    const data = [];
    document.querySelectorAll("#personTable tbody tr").forEach(row => {
        const rowData = [];
        row.querySelectorAll("td").forEach((td, index) => {
            if (index < 5) { // Only include first 5 columns
                rowData.push(td.innerText);
            }
        });
        data.push(rowData);
    });

    // Generate the PDF table
    doc.autoTable({
        head: [headers],  // Set headers
        body: data,       // Set row data
        startY: 20,       // Position to start the table
        theme: 'grid',    // Adds a border grid
        headStyles: { fillColor: [76, 175, 80] }, // Green header color
    });

    // Save the generated PDF
    doc.save(`${currentMonth}_Payroll.pdf`);
});




 
