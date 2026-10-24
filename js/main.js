'use strict';

const BOUQUETS = [
    { id: 1, name: 'Romantic Rose', category: 'roses', price: 12500, inStock: true },
    { id: 2, name: 'Spring Tulip', category: 'tulips', price: 9800, inStock: true },
    { id: 3, name: 'Summer Mix', category: 'mixed', price: 8200, inStock: true },
    { id: 4, name: 'White Peony', category: 'peonies', price: 15000, inStock: false },
    { id: 5, name: 'Autumn Bunch', category: 'mixed', price: 6400, inStock: true },
    { id: 6, name: 'Pink Lilies', category: 'lilies', price: 11200, inStock: true },
    { id: 7, name: 'Sunflower Joy', category: 'sunflowers', price: 7300, inStock: true },
    { id: 8, name: 'Orchid Elegance', category: 'orchids', price: 18900, inStock: false }
];


function formatPrice(amount) {
    return amount.toLocaleString('kk-KZ') + ' ₸';
}

const AuthUI = {
    init: function() {
        const dialog = document.createElement('dialog');
        const title = document.createElement('h3');
        title.textContent = 'Registration';

        const info = document.createElement('p');
        info.textContent = 'Please fill in your details.';

        const form = document.createElement('form');

        const userInp = document.createElement('input');
        userInp.type = 'text';
        userInp.placeholder = 'Username';
        userInp.className = 'form-control mb-2';
        userInp.required = true;

        const emailInp = document.createElement('input');
        emailInp.type = 'email';
        emailInp.placeholder = 'Email';
        emailInp.className = 'form-control mb-3';
        emailInp.required = true;

        const passInp = document.createElement('input');
        passInp.type = 'password';
        passInp.placeholder = 'Password (min 8 chars)';
        passInp.className = 'form-control mb-3';
        passInp.required = true;

        const errorMsg = document.createElement('div');
        errorMsg.className = 'text-danger mb-2 d-none';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn btn-primary w-100';
        submitBtn.textContent = 'Register';

        submitBtn.addEventListener('click', () => {
            if (userInp.value.trim().length < 3 || passInp.value.length < 8) {
                errorMsg.textContent = 'Please enter valid username and password (min 8 chars).';
                errorMsg.classList.remove('d-none');
                userInp.classList.add('is-invalid');
                passInp.classList.add('is-invalid');
                return;
            }

            errorMsg.classList.add('d-none');

            dialog.close();
            window.location.reload();
        });

        form.appendChild(userInp);
        form.appendChild(emailInp);
        form.appendChild(passInp);
        form.appendChild(errorMsg);
        form.appendChild(submitBtn);

        dialog.appendChild(title);
        dialog.appendChild(info);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
    }
};

document.addEventListener('DOMContentLoaded', () => AuthUI.init());
