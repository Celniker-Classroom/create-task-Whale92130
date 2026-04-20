const addCategoryButton = document.getElementById('addCategory');
const tableDiv = document.querySelector('.table');
const totalPercentageDisplay = document.getElementById('totalPercentage');
const totalLetterDisplay = document.getElementById('totalLetter');

//list to hold all category data for calculations
let gradeCategories = [];

document.querySelectorAll('.category').forEach(initCategory);

addCategoryButton.addEventListener('click', () => {
    const newCategory = buildCategory();
    tableDiv.appendChild(newCategory);
    updateGradeData();
});

updateGradeData();

function initCategory(categoryDiv) {
    const deleteButton = categoryDiv.querySelector('.deleteCategory');
    const inputs = categoryDiv.querySelectorAll('input');

    inputs.forEach(input => {
        
        input.addEventListener('input', updateGradeData);
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
        updateGradeData();
    });

    deleteButton.addEventListener('click', () => {
        categoryDiv.remove();
        updateGradeData();
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

function updateGradeData() {
    const categoryElements = document.querySelectorAll('.category');
    gradeCategories = []; 

    categoryElements.forEach(category => {
        const inputs = category.querySelectorAll('input');
        const points = parseFloat(inputs[1].value) || 0;
        const total = parseFloat(inputs[2].value) || 0;
        const weight = parseFloat(inputs[3].value.replace('%', '')) || 0;
        gradeCategories.push({
            points: points,
            total: total,
            weight: weight
        });
    });
    const finalPercent = calculateFinalPercentage(gradeCategories);

    if (finalPercent === null) {
        totalPercentageDisplay.textContent = '0.00%';
        totalLetterDisplay.textContent = '';
        totalPercentageDisplay.style.color = 'inherit';
    } else {
        const gradeInfo = getLetterGrade(finalPercent);
        totalPercentageDisplay.textContent = finalPercent.toFixed(2) + '%';
        totalLetterDisplay.textContent = gradeInfo.letter;
        totalPercentageDisplay.style.color = gradeInfo.color;
        totalLetterDisplay.style.color = gradeInfo.color;
    }
}

function calculateFinalPercentage(gradeCategories) {
    let totalWeight = 0;
    let weightedScore = 0;
    for (let i = 0; i < gradeCategories.length; i++) {
        let currentCategory = gradeCategories[i];
        if (currentCategory.total > 0 && currentCategory.weight > 0) {
            const categoryPercent = currentCategory.points / currentCategory.total;
            weightedScore += categoryPercent * currentCategory.weight;
            totalWeight += currentCategory.weight;
        }
    }
    if (totalWeight === 0) {
        return null; 
    }

    return (weightedScore / totalWeight) * 100;
}

function getLetterGrade(percent) {
    if (percent >= 90) return { letter: 'A', color: '#4ade80' };
    if (percent >= 80) return { letter: 'B', color: '#60a5fa' };
    if (percent >= 70) return { letter: 'C', color: '#facc15' };
    if (percent >= 60) return { letter: 'D', color: '#fb923c' };
    return { letter: 'F', color: '#f87171' };
}