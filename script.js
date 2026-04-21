const addCategoryButton = document.getElementById('addCategory');
const tableDiv = document.querySelector('.table');
const totalPercentageDisplay = document.getElementById('totalPercentage');
const totalLetterDisplay = document.getElementById('totalLetter');

let gradeCategories = [];

const modal = document.getElementById('assignmentModal');
const closeBtn = document.querySelector('.close');
let currentCategory = null;

closeBtn.onclick = () => modal.style.display = 'none';

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

document.getElementById('addAssignmentConfirm').addEventListener('click', () => {
    const name = document.getElementById('assignmentName').value;
    const yourScore = document.getElementById('yourScore').value;
    const totalPoints = document.getElementById('totalPoints').value;
    if (!currentCategory) return;
    const assignmentList = currentCategory.querySelector('.assignment-list');
    const newAssignment = document.createElement('div');
    newAssignment.classList.add('assignment-grid');
    newAssignment.innerHTML = `
        <input placeholder="Assignment Name" type="text" value="${name}">
        <input placeholder="Your Score" type="number" class="calc-input" value="${yourScore}">
        <input placeholder="Total Points" type="number" class="calc-input" value="${totalPoints}">
        <span class="needed-score"></span>
        <button class="deleteAssignment">Delete</button>
    `;
    assignmentList.appendChild(newAssignment);

    // add event listeners
    const inputs = newAssignment.querySelectorAll('input.calc-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateGradeData);
    });
    const deleteBtn = newAssignment.querySelector('.deleteAssignment');
    deleteBtn.addEventListener('click', () => {
        newAssignment.remove();
        updateGradeData();
    });

    if (yourScore === '') {
        // calculate needed
        const needed = calculateNeededScore(currentCategory, parseFloat(totalPoints) || 0);
        newAssignment.querySelector('.needed-score').textContent = needed ? needed.toFixed(2) : '';
    }

    // clear modal
    document.getElementById('assignmentName').value = '';
    document.getElementById('yourScore').value = '';
    document.getElementById('totalPoints').value = '';
    modal.style.display = 'none';
    updateGradeData();
});

document.getElementById('desiredFinalGrade').addEventListener('input', () => {
    updateNeededScores();
    updateGradeData();
});

document.querySelectorAll('.category').forEach(initCategory);

addCategoryButton.addEventListener('click', () => {
    const newCategory = buildCategory();
    tableDiv.appendChild(newCategory);
    updateGradeData();
});

updateGradeData();

function initCategory(categoryDiv) {
    const deleteButton = categoryDiv.querySelector('.deleteCategory');
    const addAssignmentButton = categoryDiv.querySelector('.addAssignment');
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
    addAssignmentButton.addEventListener('click', () => {
        currentCategory = categoryDiv;
        modal.style.display = 'block';
    });
}
function buildCategory() {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    categoryDiv.innerHTML = `
        <div class="category-grid">
                    <input placeholder="Category Name" type="text" value="Homework">
                    <input placeholder="Your Points" type="number" class="calc-input">
                    <input placeholder="Total Points" type="number" class="calc-input">
                    <input placeholder="Weight" type="text" class="weight-input">
                    <button class="addAssignment">Add Assignment</button>
                    <button class="deleteCategory">Delete</button>
                </div>
                <div class="assignments">
                    <div class="assignment-grid assignment-labels">
                        <span>Assignments</span>
                        <span>Your Score</span>
                        <span>Total Points</span>
                        <span>Needed</span>
                        <span></span>
                    </div>
                    <div class="assignment-list"></div>
                </div>
    `;

    initCategory(categoryDiv);
    return categoryDiv;
}

function updateGradeData() {
    const categoryElements = document.querySelectorAll('.category');
    gradeCategories = []; 

    categoryElements.forEach(category => {
        const assignmentList = category.querySelector('.assignment-list');
        const assignments = assignmentList.querySelectorAll('.assignment-grid');
        let points = 0;
        let total = 0;
        assignments.forEach(ass => {
            const inputs = ass.querySelectorAll('input');
            const yourScore = parseFloat(inputs[1].value) || 0;
            const totalPoints = parseFloat(inputs[2].value) || 0;
            if (inputs[1].value !== '') { // only if filled
                points += yourScore;
                total += totalPoints;
            }
        });
        const inputs = category.querySelectorAll('input');
        inputs[1].value = points;
        inputs[2].value = total;
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

function getDesiredPercent() {
    const input = document.getElementById('desiredFinalGrade').value.trim();
    if (!input) return null;
    if (isNaN(input)) {
        const letter = input.toUpperCase();
        switch (letter) {
            case 'A': return 90;
            case 'B': return 80;
            case 'C': return 70;
            case 'D': return 60;
            case 'F': return 0;
            default: return null;
        }
    } else {
        return parseFloat(input);
    }
}

function calculateNeededScore(categoryDiv, T) {
    const desiredPercent = getDesiredPercent();
    if (!desiredPercent || T === 0) return null;
    // get current gradeCategories
    const categoryElements = document.querySelectorAll('.category');
    let current_weighted = 0;
    let total_weight = 0;
    let current_points_cat = 0;
    let current_total_cat = 0;
    let W = 0;
    categoryElements.forEach(category => {
        const inputs = category.querySelectorAll('input');
        const points = parseFloat(inputs[1].value) || 0;
        const total = parseFloat(inputs[2].value) || 0;
        const weight = parseFloat(inputs[3].value.replace('%', '')) || 0;
        if (category === categoryDiv) {
            current_points_cat = points;
            current_total_cat = total;
            W = weight;
        } else {
            if (total > 0 && weight > 0) {
                current_weighted += (points / total) * weight;
                total_weight += weight;
            }
        }
    });
    if (W === 0) return null;
    const contrib_old = current_total_cat > 0 ? (current_points_cat / current_total_cat) * W : 0;
    const total_weight_new = total_weight + W;
    const desired_weighted = (desiredPercent / 100) * total_weight_new;
    const desired_contrib = desired_weighted - current_weighted;
    const new_total_cat = current_total_cat + T;
    const S = (desired_contrib / W) * new_total_cat - current_points_cat;
    return S > 0 ? S : 0;
}

function updateNeededScores() {
    const categoryElements = document.querySelectorAll('.category');
    categoryElements.forEach(category => {
        const assignmentList = category.querySelector('.assignment-list');
        const assignments = assignmentList.querySelectorAll('.assignment-grid');
        assignments.forEach(ass => {
            const inputs = ass.querySelectorAll('input');
            const yourScore = inputs[1].value;
            const totalPoints = parseFloat(inputs[2].value) || 0;
            const neededSpan = ass.querySelector('.needed-score');
            if (yourScore === '') {
                const needed = calculateNeededScore(category, totalPoints);
                neededSpan.textContent = needed ? needed.toFixed(2) : '';
            } else {
                neededSpan.textContent = '';
            }
        });
    });
}