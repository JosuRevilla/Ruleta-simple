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

        let values = ['1', '2', '3', '4'];
        let currentAngle = 0;

        function getSize() {
            return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--size')) || 320;
        }

        function renderWheel() {
            const n = values.length;
            if (n === 0) {
                wheel.style.background = '#eee';
                labelsEl.innerHTML = '';
                spinBtn.disabled = true;
                resultado.textContent = 'Resultado: —';
                renderValuesList();
                return;
            }
            spinBtn.disabled = false;

            const sector = 360 / n;
            const stops = [];
            let start = 0;
            for (let i = 0; i < n; i++) {
                const end = start + sector;
                const color = colors[i % colors.length];
                stops.push(`${color} ${start}deg ${end}deg`);
                start = end;
            }
            // Mantengo tu conic-gradient tal cual (sin "from -90deg")
            wheel.style.background = `conic-gradient(${stops.join(', ')})`;

            // crear etiquetas (mismo comportamiento visual que tenías)
            labelsEl.innerHTML = '';
            const size = getSize();
            const radius = Math.round(size * 0.38);

            let acc = 0;
            for (let i = 0; i < n; i++) {
                const startA = acc;
                const mid = startA + sector / 2;
                acc += sector;

                const span = document.createElement('span');
                span.className = 'label';
                span.textContent = values[i];
                // preservo tu transform: texto girado según sector (si prefieres horizontal, lo cambiamos)
                span.style.transform = `rotate(${mid}deg) translateY(-${radius}px)`;
                labelsEl.appendChild(span);
            }
            renderValuesList();
        }

        function renderValuesList() {
            valuesList.innerHTML = '';
            if (values.length === 0) {
                valuesList.innerHTML = `<div style="color:#777; font-size:14px;">No hay valores. Añade alguno.</div>`;
                return;
            }
            for (let i = 0; i < values.length; i++) {
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
                text.textContent = values[i];
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
                    // crear fila de edición
                    const editRow = document.createElement('div');
                    editRow.className = 'item edit-row';
                    const dot = colorDot.cloneNode(true);
                    const input = document.createElement('input');
                    input.value = values[i];
                    input.className = 'edit-input';
                    input.style.flex = '1';
                    input.style.marginRight = '8px';

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
                    editRow.appendChild(input);
                    editRow.appendChild(saveBtn);
                    editRow.appendChild(cancelBtn);

                    // reemplazar en DOM
                    valuesList.replaceChild(editRow, item);
                    input.focus();

                    // guardar cambios
                    saveBtn.addEventListener('click', () => {
                        const v = input.value.trim();
                        if (!v) return;
                        values[i] = v;
                        renderWheel();
                    });

                    // cancelar: restaurar vista original
                    cancelBtn.addEventListener('click', () => {
                        renderValuesList();
                    });

                    // permitir Enter para guardar y Escape para cancelar
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') saveBtn.click();
                        if (e.key === 'Escape') cancelBtn.click();
                    });
                });

                // DELETE handler
                del.addEventListener('click', () => {
                    values.splice(i, 1);
                    renderWheel();
                });
            }
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
            // tu lógica actual (sin ajustar por "from -90deg")
            const angleMod = ((currentAngle % 360) + 360) % 360;
            const normalized = (360 - angleMod) % 360;
            const n = values.length;
            const sector = 360 / n;
            let index = Math.floor(normalized / sector) % n;
            if (index < 0) index += n;
            resultado.textContent = `Resultado: ${values[index]}`;
            spinBtn.disabled = false;
        }

        // UI handlers
        addBtn.addEventListener('click', () => {
            const v = newValueInput.value.trim(); if (!v) return;
            values.push(v); newValueInput.value = ''; renderWheel();
        });
        newValueInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });

        spinBtn.addEventListener('click', spin);
        resetBtn.addEventListener('click', () => {
            values = ['1', '2', '3', '4'];
            currentAngle = 0;
            wheel.style.transform = `rotate(0deg)`;
            resultado.textContent = 'Resultado: —';
            renderWheel();
        });

        // init
        renderWheel();