
'use strict';

// Shared bouquet data
const BOUQUETS = [
  {
    id: 1,
    name: 'Romantic Rose',
    category: 'roses',
    price: 12500,
    inStock: true
  },
  {
    id: 2,
    name: 'Spring Tulips',
    category: 'tulips',
    price: 9500,
    inStock: true
  },
  {
    id: 3,
    name: 'Soft Peonies',
    category: 'peonies',
    price: 16500,
    inStock: true
  },
  {
    id: 4,
    name: 'Mixed Bouquet',
    category: 'mixed',
    price: 14500,
    inStock: true
  }
];

// Format numbers as Kazakhstan tenge
function formatPrice(amount) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0
  }).format(amount) + ' ₸';
}

// Find bouquet using its category
function findBouquet(category) {
  return BOUQUETS.find(function (bouquet) {
    return bouquet.category === category;
  }) || null;
}

// Calculate bouquet total
function calculateBouquetPrice(category, quantity) {
  const bouquet = findBouquet(category);

  if (!bouquet || !bouquet.inStock) {
    return 0;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return 0;
  }

  return bouquet.price * quantity;
}

document.addEventListener('DOMContentLoaded', function () {

  // Build catalog cards using plain JavaScript
  const catalog = document.querySelector(
    '#flower-list, #catalog'
  );

  if (
    catalog &&
    !catalog.dataset.sfRendered &&
    !catalog.querySelector('[data-sf-product]')
  ) {
    catalog.dataset.sfRendered = '1';

    const fragment = document.createDocumentFragment();

    for (const bouquet of BOUQUETS) {

      const column = document.createElement('div');
      column.className = 'col-md-4 mb-4';
      column.dataset.sfProduct = String(bouquet.id);

      const card = document.createElement('div');
      card.className = 'card h-100 shadow-sm border-0';

      const body = document.createElement('div');
      body.className = 'card-body d-flex flex-column';

      const status = document.createElement('span');

      status.className = bouquet.inStock
        ? 'badge bg-success align-self-start mb-2'
        : 'badge bg-secondary align-self-start mb-2';

      status.textContent = bouquet.inStock
        ? 'In Stock'
        : 'Out of Stock';

      const title = document.createElement('h3');
      title.className = 'h5 fw-bold text-primary';
      title.textContent = bouquet.name;

      const category = document.createElement('p');
      category.className = 'text-muted mb-4';
      category.textContent = 'Category: ' + bouquet.category;

      const price = document.createElement('strong');
      price.className = 'fs-5 mt-auto';
      price.textContent = formatPrice(bouquet.price);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-outline-primary mt-2 buy-btn';
      button.dataset.id = String(bouquet.id);
      button.textContent = 'Select';
      button.disabled = !bouquet.inStock;

      body.append(
        status,
        title,
        category,
        price,
        button
      );

      card.append(body);
      column.append(card);
      fragment.append(column);
    }

    catalog.append(fragment);
  }

  // Event delegation for dynamically created cards
  if (catalog) {
    catalog.addEventListener('click', function (event) {

      const button = event.target.closest('.buy-btn');

      if (!button || !catalog.contains(button)) {
        return;
      }

      const bouquet = BOUQUETS.find(function (item) {
        return String(item.id) === button.dataset.id;
      });

      if (bouquet) {
        window.location.href =
          'order.html?flower=' +
          encodeURIComponent(bouquet.category);
      }
    });
  }

  // Client-side registration demo
  const navigation = document.querySelector('header nav ul');

  if (
    navigation &&
    !navigation.querySelector('[data-auth-trigger]')
  ) {

    const item = document.createElement('li');
    item.className = 'nav-item';
    item.dataset.authTrigger = '1';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className =
      'nav-link text-white bg-transparent border-0 fw-bold';

    const currentUser = localStorage.getItem(
      'sf_session_user'
    );

    trigger.textContent = currentUser
      ? 'Log out'
      : 'Register';

    item.append(trigger);
    navigation.append(item);

    trigger.addEventListener('click', function () {

      if (localStorage.getItem('sf_session_user')) {
        localStorage.removeItem('sf_session_user');
        window.location.reload();
        return;
      }

      const dialog = document.createElement('dialog');
      dialog.className =
        'border-0 rounded-4 shadow-lg p-4';

      const title = document.createElement('h2');
      title.className = 'h4 text-primary';
      title.textContent = 'Create Account (Demo)';

      const form = document.createElement('form');

      const username = document.createElement('input');
      const email = document.createElement('input');
      const password = document.createElement('input');

      const fields = [
        [username, 'text', 'Username'],
        [email, 'email', 'Email'],
        [password, 'password', 'Password (min 8 characters)']
      ];

      for (const [field, type, placeholder] of fields) {

        field.type = type;
        field.placeholder = placeholder;
        field.className = 'form-control mb-2';
        field.required = true;

        form.append(field);
      }

      const error = document.createElement('p');
      error.className = 'text-danger small';

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn btn-primary';
      submit.textContent = 'Register';

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'btn btn-outline-secondary ms-2';
      close.textContent = 'Cancel';

      close.addEventListener('click', function () {
        dialog.close();
      });

      form.append(error, submit, close);
      dialog.append(title, form);
      document.body.append(dialog);

      dialog.addEventListener('close', function () {
        dialog.remove();
      });

      form.addEventListener('submit', function (event) {

        event.preventDefault();

        if (
          username.value.trim().length < 3 ||
          password.value.length < 8 ||
          !email.validity.valid
        ) {
          error.textContent =
            'Enter a username (3+), valid email and password (8+).';
          return;
        }

        // Do not store passwords in localStorage
        localStorage.setItem(
          'sf_session_user',
          username.value.trim()
        );

        dialog.close();
        window.location.reload();
      });

      dialog.showModal();
    });
  }
});
