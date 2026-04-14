let deleteCategoryButtons = document.querySelectorAll('.deleteCategory');
const aeriesImportButton = document.getElementById('importAeries');


console.log('Found delete buttons:', deleteCategoryButtons.length);
deleteCategoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Delete button clicked');
        if (confirm('Are you sure you want to delete this category?')) {
            button.parentElement.remove();
        }
    });
});

costAddCategoryButton = document.getElementById('addCategory');
costAddCategoryButton.addEventListener('click', () => {
    const tableDiv = document.querySelector('.table');
    const newCategory = buildCategory();
    tableDiv.appendChild(newCategory);
});

function buildCategory() {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Category Name';
    categoryDiv.appendChild(nameInput);

    const yourPointsInput = document.createElement('input');
    yourPointsInput.type = 'number';
    yourPointsInput.placeholder = 'Your Points';
    categoryDiv.appendChild(yourPointsInput);

    const totalPointsInput = document.createElement('input');
    totalPointsInput.type = 'number';
    totalPointsInput.placeholder = 'Total Points';
    categoryDiv.appendChild(totalPointsInput);

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.placeholder = 'Weight%';
    categoryDiv.appendChild(weightInput);

    const addButton = document.createElement('button');
    addButton.classList.add('addAssignment');
    addButton.textContent = 'Add Assignment';
    categoryDiv.appendChild(addButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteCategory');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        console.log('Delete button clicked');
        if (confirm('Are you sure you want to delete this category?')) {
            deleteButton.parentElement.remove();
        }
    });
    categoryDiv.appendChild(deleteButton);

    return categoryDiv;
}

aeriesImportButton.addEventListener('click', () => {
    console.log('Import from Aeries button clicked');
    const dialog = document.createElement('div');
    dialog.innerHTML = `
        <h2>Import from Aeries</h2>
        <p>Copy and paste your Aeries grade table exactly as the example:</p>
        <p>Example format:</p>
        <img src="image/importExample.png" alt="Import Example" style="width: 100%; max-width: 400px; margin-bottom: 10px;">
        <textarea type="text" id="aeriesTable" placeholder="Paste Here" style="width: 100%; height: 100px; color: #fff; background-color: #2c3e50; border: 1px solid #34495e;"></textarea>
        <button id="importButton">Import</button>
        <button id="cancelButton">Cancel</button>
    `;
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = '#07120d';
    dialog.style.padding = '20px';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    dialog.style.zIndex = '1000';
    document.body.appendChild(dialog);
});
    