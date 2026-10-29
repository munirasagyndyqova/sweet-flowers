'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const tableElement = document.querySelector('.table-bordered');
    if (!tableElement) return;

    const container = tableElement.parentElement;

    const deliveryZones = [
        { id: 'esil', name: 'Esil District', price: 1500 },
        { id: 'almaty', name: 'Almaty District', price: 1200 },
        { id: 'saryarka', name: 'Saryarka District', price: 1000 },
        { id: 'baikonyr', name: 'Baikonyr District', price: 1300 },
        { id: 'nura', name: 'Nura District', price: 1800 }
    ];

    const calcWrapper = document.createElement('div');
    calcWrapper.className = 'mt-4 border-top pt-3';

    const label = document.createElement('label');
    label.className = 'form-label fw-bold text-primary';
    label.textContent = 'Calculate Delivery to Your District:';

    const select = document.createElement('select');
    select.className = 'form-select mb-3';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select district...';
    select.appendChild(defaultOption);

    deliveryZones.forEach(zone => {
        const opt = document.createElement('option');
        opt.value = zone.id;
        opt.textContent = zone.name;
        select.appendChild(opt);
    });

    const resultDisplay = document.createElement('div');
    resultDisplay.className = 'alert alert-success fw-bold text-center d-none mb-0';

    calcWrapper.appendChild(label);
    calcWrapper.appendChild(select);
    calcWrapper.appendChild(resultDisplay);

    container.appendChild(calcWrapper);

    select.addEventListener('change', (e) => {
        const selectedId = e.target.value;

        if (!selectedId) {
            resultDisplay.classList.add('d-none');
            return;
        }

        const zone = deliveryZones.find(z => z.id === selectedId);

        if (zone) {
            resultDisplay.textContent = `Delivery Fee: ${formatPrice(zone.price)}`;
            resultDisplay.classList.remove('d-none');
        }
    });
});