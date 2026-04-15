const addCategoryButton = document.getElementById('addCategory');
const tableDiv = document.querySelector('.table');
const totalPercentageDisplay = document.getElementById('totalPercentage');
const totalLetterDisplay = document.getElementById('totalLetter');

function initialize() {
    document.querySelectorAll('.category').forEach(initCategory);

    addCategoryButton.addEventListener('click', () => {
        const newCategory = buildCategory();
        tableDiv.appendChild(newCategory);
        calculateTotalGrade();
    });

    calculateTotalGrade();
}

function initCategory(categoryDiv) {
    const deleteButton = categoryDiv.querySelector('.deleteCategory');
    const inputs = categoryDiv.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('input', calculateTotalGrade);
    });

    const weightInput = categoryDiv.querySelector('.weight-input');

    weightInput.addEventListener('focus', () => {
        weightInput.value = weightInput.value.replace('%', '').trim();
    });

    weightInput.addEventListener('blur', () => {
        const value = weightInput.value.replace('%', '').trim();
        if (value !== '' && !isNaN(value)) {
            weightInput.value = value + '%';
        }
        calculateTotalGrade();
    });

    deleteButton.addEventListener('click', () => {
        categoryDiv.remove();
        calculateTotalGrade();
    });
}

function buildCategory(name = '', points = '', total = '', weight = '') {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    categoryDiv.innerHTML = `
        <div class="category-grid">
            <input type="text" placeholder="Category Name" value="${name}">
            <input type="number" placeholder="Your Points" value="${points}">
            <input type="number" placeholder="Total Points" value="${total}">
            <input type="text" placeholder="Weight" class="weight-input" value="${weight}">
            <button class="deleteCategory">Delete</button>
        </div>
    `;

    initCategory(categoryDiv);
    return categoryDiv;
}

function calculateTotalGrade() {
    const categories = document.querySelectorAll('.category');
    let totalWeight = 0;
    let weightedScore = 0;

    categories.forEach(category => {
        const inputs = category.querySelectorAll('input');

        const points = parseFloat(inputs[1].value) || 0;
        const total = parseFloat(inputs[2].value) || 0;
        const weight = parseFloat(inputs[3].value.replace('%', '')) || 0;

        if (total > 0 && weight > 0) {
            const categoryPercent = points / total;
            weightedScore += categoryPercent * weight;
            totalWeight += weight;
        }
    });

    if (totalWeight === 0) {
        totalPercentageDisplay.textContent = '0.00%';
        totalLetterDisplay.textContent = '';
        totalPercentageDisplay.style.color = 'inherit';
        return;
    }

    const finalPercent = (weightedScore / totalWeight) * 100;
    const { letter, color } = getLetterGrade(finalPercent);

    totalPercentageDisplay.textContent = finalPercent.toFixed(2) + '%';
    totalLetterDisplay.textContent = letter;
    totalPercentageDisplay.style.color = color;
    totalLetterDisplay.style.color = color;
}

function getLetterGrade(percent) {
    if (percent >= 90) return { letter: 'A', color: '#4ade80' };
    if (percent >= 80) return { letter: 'B', color: '#60a5fa' };
    if (percent >= 70) return { letter: 'C', color: '#facc15' };
    if (percent >= 60) return { letter: 'D', color: '#fb923c' };
    return { letter: 'F', color: '#f87171' };
}

initialize();