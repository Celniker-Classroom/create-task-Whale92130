const addCategoryButton = document.getElementById('addCategory');
const tableDiv = document.querySelector('.table');
const totalPercentageDisplay = document.getElementById('totalPercentage');
const totalLetterDisplay = document.getElementById('totalLetter');
const importFromAeriesButton = document.getElementById('importAeries');

let gradeCategories = [];

let currentCategory = null;
let categoryCounter = 4;

const popup = document.getElementById('assignmentPopup');
const closePopup = document.querySelector('.popup-close');

closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

importFromAeriesButton.addEventListener('click', () => {
    const dialog = document.createElement('div');
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
    document.getElementById('cancelButton').addEventListener('click', () => {
        dialog.remove();
    });
    document.getElementById('importButton').addEventListener('click', () => {
        const pastedText = document.getElementById('aeriesTable').value;
        importAeriesCategories(pastedText);
        dialog.remove();
    });
});

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
        const needed = calculateNeededScore(currentCategory, parseFloat(totalPoints) || 0);
        newAssignment.querySelector('.needed-score').textContent = needed ? needed.toFixed(2) : '';
    }

    document.getElementById('assignmentName').value = '';
    document.getElementById('yourScore').value = '';
    document.getElementById('totalPoints').value = '';
    popup.style.display = 'none';
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
        document.getElementById('assignmentName').value = '';
        document.getElementById('yourScore').value = '';
        document.getElementById('totalPoints').value = '';
        popup.style.display = 'block';
    });
}
function buildCategory() {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    categoryDiv.innerHTML = `
        <div class="category-grid">
                    <input placeholder="Category Name" type="text" value="Category ${categoryCounter}">
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

    categoryCounter++;
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
            if (inputs[1].value !== '') {
                points += yourScore;
                total += totalPoints;
            }
        });
        const inputs = category.querySelectorAll('input');
        if (assignments.length > 0) {

            if (!category.dataset.manualTotal) {

                category.dataset.manualTotal = inputs[2].value;
                category.dataset.manualPoints = inputs[1].value;
            }
            const manualTotal = parseFloat(category.dataset.manualTotal) || 0;
            const manualPoints = parseFloat(category.dataset.manualPoints) || 0;
            inputs[1].value = manualPoints + points;
            inputs[2].value = manualTotal + total;
            inputs[1].setAttribute('readonly', true);
            inputs[2].setAttribute('readonly', true);
        } else {

            inputs[1].removeAttribute('readonly');
            inputs[2].removeAttribute('readonly');

            if (category.dataset.manualTotal) {
                inputs[1].value = category.dataset.manualPoints || '';
                inputs[2].value = category.dataset.manualTotal || '';
                delete category.dataset.manualTotal;
                delete category.dataset.manualPoints;
            }
        }
        const weight = parseFloat(inputs[3].value.replace('%', '')) || 0;
        gradeCategories.push({
            points: parseFloat(inputs[1].value) || 0,
            total: parseFloat(inputs[2].value) || 0,
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
    updateNeededScores();
}

function calculateFinalPercentage(gradeCategories) {
    let totalWeight = 0;
    let weightedScore = 0;
    let extraCreditPoints = 0;
    for (let i = 0; i < gradeCategories.length; i++) {
        let currentCategory = gradeCategories[i];
        if (currentCategory.total > 0 && currentCategory.weight > 0) {
            const categoryPercent = currentCategory.points / currentCategory.total;
            weightedScore += categoryPercent * currentCategory.weight;
            totalWeight += currentCategory.weight;
        } else if (currentCategory.total === 0 && currentCategory.points > 0 && currentCategory.weight > 0) {
            extraCreditPoints += currentCategory.points;
        }
    }
    if (totalWeight === 0) {
        return null;
    }

    const baseGrade = (weightedScore / totalWeight) * 100;
    return baseGrade + extraCreditPoints;
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

//https://chatgpt.com/s/t_69ea787abf288191b25688fe53e9ed33
//I used ai to implement the import from aeries button because it is advanced parsing
function importAeriesCategories(rawText) {
    const parsedCategories = parseAeriesTotals(rawText);

    if (parsedCategories.length === 0) {
        alert('Could not find any valid categories in that Aeries table.');
        return;
    }

    // remove all current categories
    document.querySelectorAll('.category').forEach(category => category.remove());

    // rebuild categories from imported data
    parsedCategories.forEach(categoryData => {
        const categoryDiv = buildCategory();
        const inputs = categoryDiv.querySelectorAll('input');

        // inputs:
        // 0 = category name
        // 1 = your points
        // 2 = total points
        // 3 = weight
        inputs[0].value = categoryData.name;
        inputs[1].value = categoryData.points;
        inputs[2].value = categoryData.total;
        inputs[3].value = categoryData.weight + '%';

        tableDiv.appendChild(categoryDiv);
    });

    updateGradeData();
}

function parseAeriesTotals(rawText) {
    const lines = rawText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== '');

    const categories = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // skip obvious non-category rows
        if (
            /^totals?$/i.test(line) ||
            /^category\s+/i.test(line) ||
            /^perc of/i.test(line) ||
            /^grade\s+/i.test(line) ||
            /^points\s+/i.test(line) ||
            /^max\s+/i.test(line) ||
            /^perc\s*/i.test(line) ||
            /^mark\s*/i.test(line) ||
            /^total\b/i.test(line)
        ) {
            continue;
        }

        const parsed = parseAeriesCategoryLine(line);
        if (parsed) {
            categories.push(parsed);
        }
    }

    return categories;
}

function parseAeriesCategoryLine(line) {
    // Works for pasted rows like:
    // Projects/Tests	60.00%	0.00	0	0.00%
    // or with spaces instead of tabs

    const match = line.match(/^(.*?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%/);

    if (!match) return null;

    const name = match[1].trim();
    const weight = parseFloat(match[2]);
    const points = parseFloat(match[3]);
    const total = parseFloat(match[4]);

    if (!name) return null;

    return {
        name,
        weight,
        points,
        total
    };
}
