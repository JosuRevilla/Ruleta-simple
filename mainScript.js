const wheel = document.getElementById('wheel');
const labelsEl = document.getElementById('labels');
const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const resultado = document.getElementById('resultado');
const addBtn = document.getElementById('addBtn');
const newValueInput = document.getElementById('newValue');
const valuesList = document.getElementById('valuesList');

const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#d35400', '#c0392b', '#7f8c8d',
    '#f1c40f', '#bdc3c7', '#ff6b6b', '#48dbfb'
];

let values = [
    { label: 'A', weight: 1 },
    { label: 'B', weight: 1 },
    { label: 'C', weight: 1 },
    { label: 'D', weight: 1 }
  ];

let currentAngle = 0;
let currentEdit = null;

function totalWeight() {
    return values.reduce((sum, v) => sum + v.weight, 0);
}

function getSize() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--size')) || 320;
}

function renderWheel() {
    if (values.length === 0) {
        wheel.style.background = '#eee';
        labelsEl.innerHTML = '';
        spinBtn.disabled = true;
        resultado.textContent = 'Resultado: —';
        renderValuesList();
        return;
    }
    spinBtn.disabled = false;

    const total = totalWeight();
    const stops = [];
    let start = 0;

    // Conic gradient por pesos
    values.forEach((v, i) => {
        const sector = 360 * (v.weight / total);
        const end = start + sector;
        const color = colors[i % colors.length];
        stops.push(`${color} ${start}deg ${end}deg`);
        start = end;
    });
    wheel.style.background = `conic-gradient(${stops.join(', ')})`;

    // crear etiquetas (mismo comportamiento visual que tenías)
    labelsEl.innerHTML = '';
    const size = getSize();
    const radius = Math.round(size * 0.38);

    start = 0;
    values.forEach((v, i) => {
        const mid = start + (360 * (v.weight / total)) / 2;
        const span = document.createElement('span');
        span.className = 'label';
        span.textContent = v.label;
        span.style.transform = `rotate(${mid}deg) translateY(-${radius}px)`;
        labelsEl.appendChild(span);
        start += 360 * (v.weight / total);
    });

    renderValuesList();
}

function renderValuesList() {
    // Si hay una edición activa guardada, la cancelamos porque vamos a regenerar la lista
    currentEdit = null;
    valuesList.innerHTML = '';

    if (values.length === 0) {
        valuesList.innerHTML = `<div style="color:#777; font-size:14px;">No hay valores. Añade alguno.</div>`;
        return;
    }

    values.forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'item';

        const colorDot = document.createElement('span');
        colorDot.style.width = '14px';
        colorDot.style.height = '14px';
        colorDot.style.background = colors[i % colors.length];
        colorDot.style.borderRadius = '4px';
        colorDot.style.display = 'inline-block';

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.appendChild(colorDot);

        const text = document.createElement('span');
        text.textContent = `${v.label}  (x${v.weight})`;
        meta.appendChild(text);

        // EDIT button
        const editBtn = document.createElement('button');
        editBtn.style.color = '#2f80ed';
        editBtn.style.fontWeight = '700';
        editBtn.style.marginRight = '8px';
        editBtn.textContent = 'Editar';
        editBtn.title = `Editar "${values[i]}"`;

        // DELETE button
        const del = document.createElement('button');
        del.textContent = 'X';
        del.title = `Eliminar "${values[i]}"`;

        // container for right side controls (editar + borrar)
        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';

        right.appendChild(editBtn);
        right.appendChild(del);

        item.appendChild(meta);
        item.appendChild(right);
        valuesList.appendChild(item);

        // EDIT handler: reemplaza el item por un input + guardar/cancelar
        editBtn.addEventListener('click', () => {
            // Si hay una edición activa distinta, restaurarla primero
            if (currentEdit && currentEdit.index !== i) {
                const existing = valuesList.querySelector('.edit-row');
                if (existing && currentEdit.original) valuesList.replaceChild(currentEdit.original, existing);
                currentEdit = null;
            }
            if (currentEdit && currentEdit.index === i) return;

            const editRow = document.createElement('div');
            editRow.className = 'item edit-row';
            const dot = colorDot.cloneNode(true);
            const nameInput = document.createElement('input');
            nameInput.value = v.label;
            nameInput.style.flex = '1';
            nameInput.style.marginRight = '6px';

            const weightInput = document.createElement('input');
            weightInput.type = 'number';
            weightInput.min = '1';
            weightInput.value = v.weight;
            weightInput.style.width = '60px';
            weightInput.style.marginRight = '6px';

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Guardar';
            saveBtn.style.background = '#2ecc71';
            saveBtn.style.color = '#fff';
            saveBtn.style.borderRadius = '6px';
            saveBtn.style.padding = '6px 8px';
            saveBtn.style.border = 'none';
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.marginRight = '6px';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.style.background = '#e0e0e0';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '6px';
            cancelBtn.style.padding = '6px 8px';
            cancelBtn.style.cursor = 'pointer';

            editRow.appendChild(dot);
            editRow.appendChild(nameInput);
            editRow.appendChild(weightInput);
            editRow.appendChild(saveBtn);
            editRow.appendChild(cancelBtn);

            // Guardamos la fila original para poder restaurarla si es necesario
            currentEdit = { index: i, original: item };

            // reemplazar en DOM
            valuesList.replaceChild(editRow, item);
            nameInput.focus();

            // guardar cambios
            saveBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                const w = parseInt(weightInput.value);
                if (!name || isNaN(w) || w < 1) return;
                values[i].label = name;
                values[i].weight = w;
                currentEdit = null;
                renderWheel();
            });

            // cancelar: restaurar vista original
            cancelBtn.addEventListener('click', () => {
                if (currentEdit && currentEdit.original) {
                    valuesList.replaceChild(currentEdit.original, editRow);
                }
                currentEdit = null;
            });

            // permitir Enter para guardar y Escape para cancelar
            nameInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            });
            weightInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') saveBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            });
        });

        // DELETE handler
        del.addEventListener('click', () => {
            // si se borra un elemento que está en edición, limpiar currentEdit
            if (currentEdit && currentEdit.index === i) currentEdit = null;
            values.splice(i, 1);
            renderWheel();
        });
    });
}

function spin() {
    if (values.length === 0) return;
    spinBtn.disabled = true;
    const extraSpins = (Math.floor(Math.random() * 5) + 4) * 360;
    const randomAngle = Math.floor(Math.random() * 360);
    currentAngle += extraSpins + randomAngle;
    wheel.style.transform = `rotate(${currentAngle}deg)`;
    wheel.addEventListener('transitionend', onFinish, { once: true });
}

function onFinish() {
    const angleMod = ((currentAngle % 360) + 360) % 360;
    const normalized = (360 - angleMod) % 360;

    const total = totalWeight();
    let cumulative = 0;
    let winnerIndex = 0;
    for (let i = 0; i < values.length; i++) {
        const sector = 360 * (values[i].weight / total);
        if (normalized >= cumulative && normalized < cumulative + sector) {
            winnerIndex = i;
            break;
        }
        cumulative += sector;
    }

    resultado.textContent = `Resultado: ${values[winnerIndex].label}`;
    spinBtn.disabled = false;
}

// UI handlers
addBtn.addEventListener('click', () => {
    const v = newValueInput.value.trim();
    if (!v) return;
    if (currentEdit) {
        const editRowNow = valuesList.querySelector('.edit-row');
        if (editRowNow && currentEdit.original) valuesList.replaceChild(currentEdit.original, editRowNow);
        currentEdit = null;
    }
    values.push({ label: v, weight: 1 });
    newValueInput.value = '';
    renderWheel();
});
newValueInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });

spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', () => {
    values = [
        { label: 'A', weight: 1 },
        { label: 'B', weight: 1 },
        { label: 'C', weight: 1 },
        { label: 'D', weight: 1 }
    ];
    currentAngle = 0;
    wheel.style.transform = `rotate(0deg)`;
    resultado.textContent = 'Resultado: —';
    currentEdit = null;
    renderWheel();
});

// init
renderWheel();
