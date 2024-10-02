let totalCommission = 0;
let editingRowIndex = null;

// Event listener for form submission
document.getElementById('personForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const exerciseType = document.getElementById('exerciseType').value;
    const uniqueID = document.getElementById('uniqueID').value;

    // Set price based on exercise type
    let price = 0;
    if (exerciseType === 'PT') {
        price = 25000;
    } else if (exerciseType === 'Target') {
        price = 15000;
    } else if (exerciseType === 'Basic') {
        price = 12000;
    }

    const adjustedPrice = price - 8000;
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
    priceCell.innerHTML = price;
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

// Function to edit an existing row
function editRow(button) {
    const row = button.parentNode.parentNode;
    editingRowIndex = row.rowIndex - 1;  // Get row index

    // Populate form with current row values
    document.getElementById('name').value = row.cells[0].textContent;
    document.getElementById('exerciseType').value = row.cells[1].textContent;
    document.getElementById('uniqueID').value = row.cells[3].textContent;

    // Remove commission from the total (because it's being edited)
    updateTotalCommission(-parseFloat(row.cells[4].textContent));
}

// Function to update an existing row with new values
function updateRow(index, name, exerciseType, price, uniqueID, commission) {
    const table = document.getElementById('personTable').getElementsByTagName('tbody')[0];
    const row = table.rows[index];

    row.cells[0].textContent = name;
    row.cells[1].textContent = exerciseType;
    row.cells[2].textContent = price;
    row.cells[3].textContent = uniqueID;
    row.cells[4].textContent = commission.toFixed(2);

    // Recalculate the total commission after editing
    updateTotalCommission(commission);
}

// Function to delete a row from the table
function deleteRow(button, commission) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);

    // Remove the row's commission from the total
    updateTotalCommission(-commission);
}

// Function to update the total commission
function updateTotalCommission(commission) {
    totalCommission += commission;
    document.getElementById('totalCommission').textContent = totalCommission.toFixed(2);
}

// Event listener for invoice submission
document.getElementById('submitInvoice').addEventListener('click', function() {
    generateInvoice();
});

// Function to generate and download the invoice
function generateInvoice() {
    const table = document.getElementById('personTable').getElementsByTagName('tbody')[0];
    const rows = table.rows;
    let invoiceData = "Name, Exercise Type, Price, Unique ID, Commission\n";

    // Loop through each row and extract data
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        const rowData = [];
        for (let j = 0; j < cells.length - 1; j++) { // Skip the actions cell
            rowData.push(cells[j].textContent);
        }
        invoiceData += rowData.join(", ") + "\n";
    }

    // Add total commission to the invoice
    invoiceData += "\nTotal Commission: " + totalCommission.toFixed(2);

    // Create a blob and download the invoice as a CSV file
    const blob = new Blob([invoiceData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.csv';
    link.click();
}
