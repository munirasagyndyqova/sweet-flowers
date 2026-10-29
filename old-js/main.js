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
    return amount.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';
}

function filterBouquets(category, searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    return BOUQUETS.filter(b => {
        const matchCat = category === 'all' || b.category === category;
        const matchSearch = b.name.toLowerCase().includes(query);
        return matchCat && matchSearch;
    });
}

function calculateTotal(cartItems) {
    return cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function generateOrderRef() {
    const rand = Math.floor(Math.random() * 90000) + 10000;
    return 'SF-2026-' + rand;
}

function showFieldError(field, message) {
    field.classList.add('is-error');
    const err = document.createElement('small');
    err.className = 'js-error text-danger d-block mt-1';
    err.textContent = message;
    field.insertAdjacentElement('afterend', err);
}

function clearErrors(form) {
    form.querySelectorAll('.js-error').forEach(el => el.remove());
    form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
}

const Cart = {
    items: [],

    add(bouquetId) {
        const item = this.items.find(i => i.id === bouquetId);
        if (item) {
            item.qty += 1;
        } else {
            const bouquet = BOUQUETS.find(b => b.id === bouquetId);
            if (bouquet) this.items.push({ ...bouquet, qty: 1 });
        }
    },

    remove(bouquetId) {
        this.items = this.items.filter(i => i.id !== bouquetId);
    },

    getTotal() {
        return calculateTotal(this.items);
    }
};

const Auth = {
    login(username) {
        localStorage.setItem('sf_session_user', username);
    },
    logout() {
        localStorage.removeItem('sf_session_user');
    },
    getUser() {
        return localStorage.getItem('sf_session_user');
    }
};

const AuthUI = {
    init() {
        const nav = document.querySelector('header nav ul');
        if (!nav) return;

        const old = nav.querySelector('[data-auth-trigger]');
        if (old) old.remove();

        if (Auth.getUser()) {
            return;
        }

        const li = document.createElement('li');
        li.className = 'nav-item';
        li.dataset.authTrigger = '1';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-link text-white bg-transparent border-0 fw-bold';
        btn.textContent = 'Register';
        btn.addEventListener('click', this.openDialog);

        li.appendChild(btn);
        nav.appendChild(li);
    },

    openDialog() {
        const dialog = document.createElement('dialog');
        dialog.className = 'border-0 rounded-4 shadow-lg p-4';
        dialog.style.maxWidth = '400px';

        const title = document.createElement('h2');
        title.className = 'h4 text-primary mb-3';
        title.textContent = 'Create Account (Demo)';

        const info = document.createElement('p');
        info.className = 'text-muted small mb-3';
        info.textContent = 'Front-end demo only. Passwords are not stored.';

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

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn btn-primary w-100';
        submitBtn.textContent = 'Register';

        submitBtn.addEventListener('click', () => {
            if (userInp.value.trim().length < 3 || passInp.value.length < 8) {
                alert('Please enter valid username and password (min 8 chars).');
                return;
            }


            Auth.login(userInp.value.trim());
            dialog.close();
            window.location.reload();
        });

        form.appendChild(userInp);
        form.appendChild(emailInp);
        form.appendChild(passInp);
        form.appendChild(submitBtn);

        dialog.appendChild(title);
        dialog.appendChild(info);
        dialog.appendChild(form);
        document.body.appendChild(dialog);
        dialog.showModal();
    }
};

document.addEventListener('DOMContentLoaded', () => AuthUI.init());