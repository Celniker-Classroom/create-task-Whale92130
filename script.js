const aeriesImportButton = document.getElementById('importAeries');
const addCategoryButton = document.getElementById('addCategory');
const desiredFinalGrade = document.getElementById('desiredFinalGrade');

function initialize() {
    document.querySelectorAll('.category').forEach(initCategory);
    addCategoryButton.addEventListener('click', () => {
        const tableDiv = document.querySelector('.table');
        const newCategory = buildCategory();
        tableDiv.appendChild(newCategory);
        calculateTotalGrade();
    });
    desiredFinalGrade.addEventListener('input', calculateTotalGrade);
    aeriesImportButton.addEventListener('click', openAeriesDialog);
    calculateTotalGrade();
}

function initCategory(categoryDiv) {
    ensureAssignmentSection(categoryDiv);
    const deleteButton = categoryDiv.querySelector('.deleteCategory');
    const addAssignmentButton = categoryDiv.querySelector('.addAssignment');

    attachDeleteListener(deleteButton, categoryDiv);
    attachHeaderListeners(categoryDiv);
    addAssignmentButton.addEventListener('click', () => openAssignmentDialog(categoryDiv));
}

function attachDeleteListener(button, categoryDiv) {
    button.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this category?')) {
            categoryDiv.remove();
            calculateTotalGrade();
        }
    });
}

function attachHeaderListeners(categoryDiv) {
    const inputs = categoryDiv.querySelectorAll('.category-grid input');
    inputs[1].addEventListener('input', calculateTotalGrade);
    inputs[2].addEventListener('input', calculateTotalGrade);

    const weightInput = inputs[3];
    weightInput.type = 'text';
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

function ensureAssignmentSection(categoryDiv) {
    if (!categoryDiv.querySelector('.assignments')) {
        const assignmentsSection = document.createElement('div');
        assignmentsSection.classList.add('assignments');
        assignmentsSection.innerHTML = `
            <div class="assignment-grid assignment-labels">
                <span>Assignments</span>
                <span>Your Score</span>
                <span>Total Points</span>
                <span>Needed</span>
                <span></span>
            </div>
            <div class="assignment-list"></div>
        `;
        categoryDiv.appendChild(assignmentsSection);
    }
}

function buildCategory(name = '', points = '', max = '', weight = '') {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    const header = document.createElement('div');
    header.classList.add('category-grid');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Category Name';
    nameInput.value = name;

    const yourPointsInput = document.createElement('input');
    yourPointsInput.type = 'number';
    yourPointsInput.placeholder = 'Your Points';
    yourPointsInput.classList.add('calc-input');
    yourPointsInput.value = points;

    const totalPointsInput = document.createElement('input');
    totalPointsInput.type = 'number';
    totalPointsInput.placeholder = 'Total Points';
    totalPointsInput.classList.add('calc-input');
    totalPointsInput.value = max;

    const weightInput = document.createElement('input');
    weightInput.type = 'text';
    weightInput.placeholder = 'Weight';
    weightInput.classList.add('weight-input');
    if (weight !== '' && !weight.includes('%')) {
        weight = weight + '%';
    }
    weightInput.value = weight;

    const addButton = document.createElement('button');
    addButton.classList.add('addAssignment');
    addButton.textContent = 'Add Assignment';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('deleteCategory');
    deleteButton.textContent = 'Delete';

    header.appendChild(nameInput);
    header.appendChild(yourPointsInput);
    header.appendChild(totalPointsInput);
    header.appendChild(weightInput);
    header.appendChild(addButton);
    header.appendChild(deleteButton);

    categoryDiv.appendChild(header);
    ensureAssignmentSection(categoryDiv);
    initCategory(categoryDiv);
    return categoryDiv;
}

function openAeriesDialog() {
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

    const cancelButton = dialog.querySelector('#cancelButton');
    const importButton = dialog.querySelector('#importButton');
    const textarea = dialog.querySelector('#aeriesTable');

    cancelButton.addEventListener('click', () => dialog.remove());
    importButton.addEventListener('click', () => {
        const pastedText = textarea.value;
        if (pastedText.trim() !== '') {
            parseAeriesData(pastedText);
        }
        dialog.remove();
    });
}

function openAssignmentDialog(categoryDiv, assignmentRow = null) {
    const isEdit = Boolean(assignmentRow);
    const currentName = isEdit ? assignmentRow.dataset.name : '';
    const currentPoints = isEdit && assignmentRow.dataset.unknown !== 'true' ? assignmentRow.dataset.points : '';
    const currentMax = isEdit ? assignmentRow.dataset.max : '';

    const dialog = document.createElement('div');
    dialog.classList.add('dialog-overlay');
    dialog.innerHTML = `
        <h2>${isEdit ? 'Edit' : 'Add'} Assignment</h2>
        <p>Name</p>
        <input type="text" id="assignmentName" placeholder="Assignment Name" value="${currentName}">
        <p>Your Score</p>
        <p>(Leave blank if this is the assignment you want to calculate for)</p>
        <input type="number" id="assignmentPoints" placeholder="Score" value="${currentPoints}">
        <p>Total Points</p>
        <input type="number" id="assignmentMaxPoints" placeholder="Total Points" value="${currentMax}">
        <div class="dialog-buttons">
            <button id="addButton">${isEdit ? 'Save' : 'Add'}</button>
            <button id="cancelButton">Cancel</button>
        </div>
    `;
    document.body.appendChild(dialog);

    const cancelButton = dialog.querySelector('#cancelButton');
    const addButton = dialog.querySelector('#addButton');
    const nameInput = dialog.querySelector('#assignmentName');
    const pointsInput = dialog.querySelector('#assignmentPoints');
    const maxPointsInput = dialog.querySelector('#assignmentMaxPoints');

    cancelButton.addEventListener('click', () => dialog.remove());
    addButton.addEventListener('click', () => {
        const name = nameInput.value.trim() || 'Untitled';
        const points = pointsInput.value.trim();
        const maxPoints = maxPointsInput.value.trim();
        const unknown = points === '';

        if (maxPoints === '' || isNaN(maxPoints) || Number(maxPoints) <= 0) {
            alert('Please enter a valid total points value.');
            return;
        }
        if (!unknown && (isNaN(points) || Number(points) < 0)) {
            alert('Please enter a valid score or leave it blank to solve for it.');
            return;
        }
        if (unknown && countUnknownAssignments(assignmentRow) >= 1) {
            alert('You can only have one unknown assignment at a time.');
            return;
        }

        const assignmentData = {
            name,
            points: unknown ? '' : Number(points),
            max: Number(maxPoints),
            unknown,
        };

        if (isEdit) {
            updateAssignmentRow(assignmentRow, assignmentData);
        } else {
            addAssignmentRow(categoryDiv, assignmentData);
        }
        calculateTotalGrade();
        dialog.remove();
    });
}

function countUnknownAssignments(excludeRow = null) {
    let unknownCount = 0;
    document.querySelectorAll('.assignment-row').forEach(row => {
        if (row !== excludeRow && row.dataset.unknown === 'true') {
            unknownCount += 1;
        }
    });
    return unknownCount;
}

function addAssignmentRow(categoryDiv, data) {
    const list = categoryDiv.querySelector('.assignment-list');
    const row = document.createElement('div');
    row.classList.add('assignment-row');
    row.dataset.name = data.name;
    row.dataset.points = data.unknown ? '' : data.points;
    row.dataset.max = data.max;
    row.dataset.unknown = data.unknown ? 'true' : 'false';

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('assignment-name');
    nameSpan.textContent = data.name;

    const scoreSpan = document.createElement('span');
    scoreSpan.classList.add('assignment-score');
    scoreSpan.textContent = data.unknown ? `? / ${data.max}` : `${data.points} / ${data.max}`;

    const maxSpan = document.createElement('span');
    maxSpan.classList.add('assignment-max');
    maxSpan.textContent = data.max;

    const neededSpan = document.createElement('span');
    neededSpan.classList.add('assignment-needed');
    neededSpan.textContent = '';

    const actions = document.createElement('div');
    actions.classList.add('assignment-actions');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';

    editButton.addEventListener('click', () => openAssignmentDialog(categoryDiv, row));
    deleteButton.addEventListener('click', () => {
        row.remove();
        const remainingRows = categoryDiv.querySelectorAll('.assignment-row');
        if (remainingRows.length === 0) {
            const inputs = categoryDiv.querySelectorAll('.category-grid input');
            inputs[1].value = '';
            inputs[2].value = '';
            inputs[1].disabled = false;
            inputs[2].disabled = false;
        }
        calculateTotalGrade();
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    row.appendChild(nameSpan);
    row.appendChild(scoreSpan);
    row.appendChild(maxSpan);
    row.appendChild(neededSpan);
    row.appendChild(actions);
    list.appendChild(row);
    return row;
}

function updateAssignmentRow(row, data) {
    row.dataset.name = data.name;
    row.dataset.points = data.unknown ? '' : data.points;
    row.dataset.max = data.max;
    row.dataset.unknown = data.unknown ? 'true' : 'false';
    row.querySelector('.assignment-name').textContent = data.name;
    row.querySelector('.assignment-score').textContent = data.unknown ? `? / ${data.max}` : `${data.points} / ${data.max}`;
    row.querySelector('.assignment-max').textContent = data.max;
    row.querySelector('.assignment-needed').textContent = '';
}

function calculateTotalGrade() {
    const categories = document.querySelectorAll('.category');
    let totalWeight = 0;
    let earnedWeight = 0;
    let unknownRow = null;

    categories.forEach(cat => {
        const inputs = cat.querySelectorAll('.category-grid input');
        if (inputs.length < 4) return;

        const weightStr = inputs[3].value.replace('%', '');
        const weight = parseFloat(weightStr) || 0;
        let knownEarned = 0;
        let knownMax = 0;
        let categoryMax = 0;
        let hasUnknown = false;

        const assignmentRows = cat.querySelectorAll('.assignment-row');
        assignmentRows.forEach(row => {
            const maxPoints = parseFloat(row.dataset.max) || 0;
            categoryMax += maxPoints;
            if (row.dataset.unknown === 'true') {
                hasUnknown = true;
                unknownRow = row;
            } else {
                knownEarned += parseFloat(row.dataset.points) || 0;
                knownMax += maxPoints;
            }
        });

        if (assignmentRows.length > 0) {
            inputs[2].value = categoryMax || '';
            if (hasUnknown) {
                inputs[1].value = knownMax > 0 ? knownEarned : '';
            } else {
                inputs[1].value = knownEarned;
            }
            inputs[1].disabled = true;
            inputs[2].disabled = true;
        } else {
            const points = parseFloat(inputs[1].value) || 0;
            const max = parseFloat(inputs[2].value) || 0;
            knownEarned = points;
            knownMax = max;
            categoryMax = max;
            inputs[1].disabled = false;
            inputs[2].disabled = false;
        }

        if (assignmentRows.length > 0 && hasUnknown) {
            if (knownMax > 0) {
                totalWeight += weight;
                earnedWeight += (knownEarned / knownMax) * weight;
            }
        } else if (knownMax > 0) {
            totalWeight += weight;
            earnedWeight += (knownEarned / knownMax) * weight;
        }
    });

    const totalPercentageDisplay = document.getElementById('totalPercentage');
    const totalLetterDisplay = document.getElementById('totalLetter');

    if (totalWeight > 0) {
        const finalPercent = (earnedWeight / totalWeight) * 100;
        totalPercentageDisplay.textContent = finalPercent.toFixed(2) + '%';

        let letter = 'F';
        let color = '#f87171';
        if (finalPercent >= 90) { letter = 'A'; color = '#4ade80'; }
        else if (finalPercent >= 80) { letter = 'B'; color = '#60a5fa'; }
        else if (finalPercent >= 70) { letter = 'C'; color = '#facc15'; }
        else if (finalPercent >= 60) { letter = 'D'; color = '#fb923c'; }

        totalLetterDisplay.textContent = letter;
        totalLetterDisplay.style.color = color;
        totalPercentageDisplay.style.color = color;
    } else {
        totalPercentageDisplay.textContent = '0.00%';
        totalLetterDisplay.textContent = '';
        totalPercentageDisplay.style.color = 'inherit';
    }

    updateUnknownAssignmentNeeded(unknownRow);
}

function parseDesiredGrade() {
    const value = desiredFinalGrade.value.trim();
    if (!value) return null;

    const percent = parseFloat(value);
    if (!isNaN(percent)) {
        return Math.max(0, Math.min(100, percent));
    }

    const letter = value[0].toUpperCase();
    const letterMap = { A: 90, B: 80, C: 70, D: 60 };
    return letterMap[letter] || null;
}

function updateUnknownAssignmentNeeded(unknownRow) {
    document.querySelectorAll('.assignment-needed').forEach(el => el.textContent = '');
    const desired = parseDesiredGrade();
    if (!unknownRow || desired === null) {
        return;
    }

    const categoryDiv = unknownRow.closest('.category');
    const weightInput = categoryDiv.querySelector('.category-grid input.weight-input');
    const weight = parseFloat(weightInput.value.replace('%', '')) || 0;
    const unknownMax = parseFloat(unknownRow.dataset.max) || 0;
    let knownEarned = 0;
    let knownMax = 0;
    let totalCategoryMax = 0;

    categoryDiv.querySelectorAll('.assignment-row').forEach(row => {
        const rowMax = parseFloat(row.dataset.max) || 0;
        totalCategoryMax += rowMax;
        if (row.dataset.unknown !== 'true') {
            knownEarned += parseFloat(row.dataset.points) || 0;
            knownMax += rowMax;
        }
    });

    const totalWeightAll = Array.from(document.querySelectorAll('.category')).reduce((sum, cat) => {
        const input = cat.querySelector('.category-grid input.weight-input');
        const weightValue = parseFloat(input.value.replace('%', '')) || 0;
        return sum + weightValue;
    }, 0);

    const currentWeightedOther = Array.from(document.querySelectorAll('.category')).reduce((sum, cat) => {
        if (cat === categoryDiv) return sum;
        const inputs = cat.querySelectorAll('.category-grid input');
        if (inputs.length < 4) return sum;

        const weightValue = parseFloat(inputs[3].value.replace('%', '')) || 0;
        let catEarned = 0;
        let catMax = 0;
        const assignmentRows = cat.querySelectorAll('.assignment-row');
        let hasUnknownInCat = false;

        assignmentRows.forEach(row => {
            const rowMax = parseFloat(row.dataset.max) || 0;
            if (row.dataset.unknown === 'true') {
                hasUnknownInCat = true;
            } else {
                catEarned += parseFloat(row.dataset.points) || 0;
                catMax += rowMax;
            }
        });

        if (assignmentRows.length > 0) {
            if (hasUnknownInCat) {
                if (catMax > 0) {
                    return sum + weightValue * (catEarned / catMax);
                }
                return sum;
            }
            return sum + weightValue * (catEarned / catMax);
        }

        const points = parseFloat(inputs[1].value) || 0;
        const max = parseFloat(inputs[2].value) || 0;
        if (max > 0) {
            return sum + weightValue * (points / max);
        }
        return sum;
    }, 0);

    if (weight === 0 || totalCategoryMax === 0) {
        unknownRow.querySelector('.assignment-needed').textContent = 'Enter a category weight and assignment max points.';
        return;
    }

    const targetWeighted = (desired / 100) * totalWeightAll;
    const neededScore = ((targetWeighted - currentWeightedOther) * totalCategoryMax / weight) - knownEarned;
    const normalized = Math.max(0, neededScore);
    const neededText = normalized > unknownMax
        ? `Need ${normalized.toFixed(1)} / ${unknownMax} (impossible)`
        : `Need ${normalized.toFixed(1)} / ${unknownMax}`;

    unknownRow.querySelector('.assignment-needed').textContent = neededText;
}

function parseAeriesData(text) {
    const lines = text.trim().split('\n');
    const tableDiv = document.querySelector('.table');
    const headersHTML = tableDiv.querySelector('.category-labels').outerHTML;
    tableDiv.innerHTML = headersHTML;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'Totals' || trimmedLine.startsWith('Category') || trimmedLine.startsWith('Grade') || trimmedLine.startsWith('Total')) {
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
    calculateTotalGrade();
}

initialize();
