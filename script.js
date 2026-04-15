let deleteCategoryButtons = document.querySelectorAll('.deleteCategory');
const aeriesImportButton = document.getElementById('importAeries');
const addCategoryButton = document.getElementById('addCategory');

// Initialize existing buttons and inputs on page load
deleteCategoryButtons.forEach(button => attachDeleteListener(button));
document.querySelectorAll('.category').forEach(cat => attachCalculationListeners(cat));
calculateTotalGrade(); // Initial calculation

addCategoryButton.addEventListener('click', () => {
    const tableDiv = document.querySelector('.table');
    const newCategory = buildCategory();
    tableDiv.appendChild(newCategory);
    calculateTotalGrade();
});

function attachDeleteListener(button) {
    button.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this category?')) {
            button.parentElement.remove();
            calculateTotalGrade(); // Recalculate when a category is removed
        }
    });
}

function attachCalculationListeners(categoryDiv) {
    const inputs = categoryDiv.querySelectorAll('input');
    
    // Listen for changes on points and max points
    inputs[1].addEventListener('input', calculateTotalGrade);
    inputs[2].addEventListener('input', calculateTotalGrade);
    
    // Setup the weight input to automatically format with '%'
    const weightInput = inputs[3];
    weightInput.type = 'text'; // Must be text to hold the '%' sign
    
    weightInput.addEventListener('blur', (e) => {
        let val = e.target.value.replace('%', '').trim();
        if (val !== '' && !isNaN(val)) {
            e.target.value = val + '%';
        }
        calculateTotalGrade();
    });

    weightInput.addEventListener('focus', (e) => {
        e.target.value = e.target.value.replace('%', '').trim();
    });

    weightInput.addEventListener('input', calculateTotalGrade);
}

function calculateTotalGrade() {
    const categories = document.querySelectorAll('.category');
    let totalWeight = 0;
    let earnedWeight = 0;

    categories.forEach(cat => {
        const inputs = cat.querySelectorAll('input');
        if (inputs.length < 4) return;
        
        const points = parseFloat(inputs[1].value) || 0;
        const max = parseFloat(inputs[2].value) || 0;
        const weightStr = inputs[3].value.replace('%', '');
        const weight = parseFloat(weightStr) || 0;

        // Only count categories that have a max score greater than 0
        if (max > 0) {
            totalWeight += weight;
            earnedWeight += (points / max) * weight;
        }
    });

    const totalPercentageDisplay = document.getElementById('totalPercentage');
    const totalLetterDisplay = document.getElementById('totalLetter');

    if (totalWeight > 0) {
        // Calculate relative to the active weights
        const finalPercent = (earnedWeight / totalWeight) * 100;
        totalPercentageDisplay.textContent = finalPercent.toFixed(2) + '%';
        
        let letter = 'F';
        let color = '#f87171'; // Red

        if (finalPercent >= 90) { letter = 'A'; color = '#4ade80'; } // Green
        else if (finalPercent >= 80) { letter = 'B'; color = '#60a5fa'; } // Blue
        else if (finalPercent >= 70) { letter = 'C'; color = '#facc15'; } // Yellow
        else if (finalPercent >= 60) { letter = 'D'; color = '#fb923c'; } // Orange

        totalLetterDisplay.textContent = letter;
        totalLetterDisplay.style.color = color;
        totalPercentageDisplay.style.color = color;
    } else {
        totalPercentageDisplay.textContent = '0.00%';
        totalLetterDisplay.textContent = '';
        totalPercentageDisplay.style.color = 'inherit';
    }
}

function buildCategory(name = '', points = '', max = '', weight = '') {
    const categoryDiv = document.createElement('div');
    // Updated to use the new CSS grid class
    categoryDiv.classList.add('category', 'category-grid');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Category Name';
    nameInput.value = name;
    categoryDiv.appendChild(nameInput);

    const yourPointsInput = document.createElement('input');
    yourPointsInput.type = 'number';
    yourPointsInput.placeholder = 'Your Points';
    yourPointsInput.classList.add('calc-input');
    yourPointsInput.value = points;
    categoryDiv.appendChild(yourPointsInput);

    const totalPointsInput = document.createElement('input');
    totalPointsInput.type = 'number';
    totalPointsInput.placeholder = 'Total Points';
    totalPointsInput.classList.add('calc-input');
    totalPointsInput.value = max;
    categoryDiv.appendChild(totalPointsInput);

    const weightInput = document.createElement('input');
    weightInput.type = 'text';
    weightInput.placeholder = 'Weight';
    weightInput.classList.add('weight-input');
    // Ensure imported weights get their % sign right away
    if (weight !== '' && !weight.includes('%')) {
        weight = weight + '%';
    }
    weightInput.value = weight;
    categoryDiv.appendChild(weightInput);

    const addButton = document.createElement('button');
    addButton.classList.add('addAssignment');
    addButton.textContent = 'Add Assignment';
    categoryDiv.appendChild(addButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteCategory');
    deleteButton.textContent = 'Delete';
    
    categoryDiv.appendChild(deleteButton);

    attachDeleteListener(deleteButton);
    attachCalculationListeners(categoryDiv);

    return categoryDiv;
}

aeriesImportButton.addEventListener('click', () => {
    const dialog = document.createElement('div');
    // Applied the new CSS class for the dialog
    dialog.classList.add('dialog-overlay');
    dialog.innerHTML = `
        <h2>Import from Aeries</h2>
        <p>Copy and paste your Aeries grade table exactly as the example:</p>
        <p>Example format:</p>
        <img src="image/importExample.png" alt="Import Example">
        <textarea id="aeriesTable" placeholder="Paste Here"></textarea>
        <div class="dialog-buttons">
            <button id="importButton">Import</button>
            <button id="cancelButton">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(dialog);

    const cancelButton = dialog.querySelector('#cancelButton');
    const importButton = dialog.querySelector('#importButton');
    const textarea = dialog.querySelector('#aeriesTable');

    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });

    importButton.addEventListener('click', () => {
        const pastedText = textarea.value;
        if (pastedText.trim() !== "") {
            parseAeriesData(pastedText);
        }
        dialog.remove();
    });
});

function parseAeriesData(text) {
    const lines = text.trim().split('\n');
    const tableDiv = document.querySelector('.table');
    
    // Save the label headers before clearing out the container
    const headersHTML = tableDiv.querySelector('.category-labels').outerHTML;
    tableDiv.innerHTML = headersHTML;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine || 
            trimmedLine === 'Totals' || 
            trimmedLine.startsWith('Category') || 
            trimmedLine.startsWith('Grade') || 
            trimmedLine.startsWith('Total')) {
            return;
        }

        const columns = trimmedLine.split('\t');
        
        if (columns.length >= 4) {
            const categoryName = columns[0].trim();
            const weight = columns[1].replace('%', '').trim();
            const points = columns[2].trim();
            const maxPoints = columns[3].trim();
            
            const newCategory = buildCategory(categoryName, points, maxPoints, weight);
            tableDiv.appendChild(newCategory);
        }
    });
    
    // Recalculate once everything is imported
    calculateTotalGrade();
}