'use strict';

document.addEventListener('DOMContentLoaded', () => {
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
});