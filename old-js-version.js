
// FEATURE 1: Florist Tip Generator (Original plain JS from about.js)
function initFloristTipGenerator() {
    const sections = document.querySelectorAll('.bg-white.p-4.rounded.shadow-sm');
    if (sections.length < 2) return;

    const whyChooseUsSection = sections[1];

    const facts = [
        "Did you know? Peonies can live up to 100 years!",
        "Florist tip: Change the water in your vase every 2 days.",
        "Secret: Tulips continue to grow even after being cut.",
        "Fun fact: Roses are one of the oldest flowers, dating back 35 million years.",
        "Tip: Keep your bouquet away from direct sunlight and fresh fruit."
    ];

    const factBtn = document.createElement('button');
    factBtn.className = 'btn btn-outline-primary w-100 mt-3';
    factBtn.textContent = 'Get a Secret Florist Tip';

    const factDisplay = document.createElement('div');
    factDisplay.className = 'alert alert-info mt-3 d-none mb-0 fst-italic text-center';

    whyChooseUsSection.appendChild(factBtn);
    whyChooseUsSection.appendChild(factDisplay);

    factBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * facts.length);
        factDisplay.textContent = facts[randomIndex];
        factDisplay.classList.remove('d-none');

        factBtn.textContent = 'Get Another Tip';
    });
}

// FEATURE 2: Delivery District Calculator
function initDeliveryCalculator() {
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
}

// FEATURE 3: Order Form Validation & Total Calculation
function initOrderFormValidation() {
    const orderForm = document.querySelector('form');
    if (!orderForm) return;

    const flowerSelect = document.getElementById('flowers');
    const quantityInput = document.getElementById('quantity');
    const dateInput = document.getElementById('date');
    const orderMessage = document.getElementById('order-message');

    const totalContainer = document.createElement('div');
    totalContainer.className = 'alert alert-info mt-4 fs-5 fw-bold text-center';
    totalContainer.textContent = 'Total: 0 ₸';

    const btnGroup = document.querySelector('.border-top');
    orderForm.insertBefore(totalContainer, btnGroup);

    function calculateTotal() {
        const selectedCategory = flowerSelect.value;
        const qty = parseInt(quantityInput.value) || 1;

        const bouquet = BOUQUETS.find(b => b.category === selectedCategory);

        let total = 0;
        if (bouquet) {
            total = bouquet.price * qty;
        }

        totalContainer.textContent = `Total: ${formatPrice(total)}`;
        return total;
    }

    flowerSelect.addEventListener('change', calculateTotal);
    quantityInput.addEventListener('input', calculateTotal);

    calculateTotal();

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        document.querySelectorAll('.text-danger.error-msg').forEach(el => el.remove());
        orderForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        let isValid = true;
        let firstInvalidField = null;

        function showError(inputElement, message) {
            isValid = false;
            inputElement.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-danger small mt-1 error-msg';
            errorDiv.textContent = message;
            inputElement.parentElement.appendChild(errorDiv);
            if (!firstInvalidField) firstInvalidField = inputElement;
        }

        const nameInput = document.getElementById('name');
        if (nameInput.value.trim().length < 2) {
            showError(nameInput, 'Please enter a valid full name.');
        }

        if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showError(dateInput, 'Delivery date cannot be in the past.');
            }
        } else {
            showError(dateInput, 'Please select a delivery date.');
        }

        if (!isValid) {
            firstInvalidField.focus();
            return;
        }

        const totalSum = calculateTotal();
        const chosenFlowerText = flowerSelect.options[flowerSelect.selectedIndex].text;

        orderForm.style.display = 'none';
        orderMessage.classList.remove('hidden', 'd-none');
        orderMessage.classList.add('alert-success', 'd-block');
        orderMessage.innerHTML = '';

        const title = document.createElement('h4');
        title.className = 'alert-heading fw-bold';
        title.textContent = `Thank you for your order, ${nameInput.value.trim()}!`;

        const summary = document.createElement('p');
        summary.textContent = `You selected ${quantityInput.value}x ${chosenFlowerText}. Total price: ${formatPrice(totalSum)}.`;

        const deliveryInfo = document.createElement('p');
        const addressText = document.getElementById('address').value.trim();
        deliveryInfo.textContent = `Delivery scheduled for ${dateInput.value} to: ${addressText}.`;

        const demoWarning = document.createElement('hr');

        const demoText = document.createElement('p');
        demoText.className = 'mb-0 small text-muted fw-bold';
        demoText.textContent = '*This is a front-end demonstration. No data was sent to a server and no real payment was processed.';

        orderMessage.append(title, summary, deliveryInfo, demoWarning, demoText);
    });
}