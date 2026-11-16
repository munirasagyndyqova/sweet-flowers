
'use strict';

// ==========================================
// SWEET FLOWERS - MAIN JAVASCRIPT
// ==========================================

// Shared data for flowers.js and other pages
const BOUQUETS = [
    { id: 1, name: 'Romantic Rose', category: 'roses', price: 12500, inStock: true },
    { id: 2, name: 'Spring Tulip', category: 'tulips', price: 9800, inStock: true },
    { id: 3, name: 'Summer Mix', category: 'mixed', price: 8200, inStock: true },
    { id: 4, name: 'White Peony', category: 'peonies', price: 15000, inStock: false },
    { id: 5, name: 'Autumn Bunch', category: 'mixed', price: 6400, inStock: true },
    { id: 6, name: 'Pink Lilies', category: 'lilies', price: 11200, inStock: true },
    { id: 7, name: 'Sunflower Joy', category: 'sunflowers', price: 7300, inStock: true },
    { id: 8, name: 'Orchid Elegance', category: 'orchids', price: 18900, inStock: false },
    { id: 9, name: 'Pink Delight', category: 'roses', price: 20000, inStock: true },
    { id: 10, name: 'Mixed Bouquet', category: 'mixed', price: 25000, inStock: true }
];

const DELIVERY_ZONES = [
    { id: 'esil', name: 'Esil District', price: 1500 },
    { id: 'almaty', name: 'Almaty District', price: 1200 },
    { id: 'saryarka', name: 'Saryarka District', price: 1000 },
    { id: 'baikonyr', name: 'Baikonyr District', price: 1300 },
    { id: 'nura', name: 'Nura District', price: 1800 }
];

const PICKUP_BRANCHES = [
    'Sweet Flowers 1 — Al-Farabi Avenue, 9',
    'Sweet Flowers 2 — B. Sokpakbaev St, 1',
    'Sweet Flowers 3 — E-15 Street, 16'
];

const PROMO_CODES = {
    FLOWER10: 0.10,
    SWEET10: 0.10,
    FLOWERS20: 0.20
};

const SESSION_KEY = 'sf_session_user';
const ORDERS_KEY = 'sf_orders';
const PICK_KEY = 'sf_pick';
const DELIVERY_KEY = 'sf_delivery_choice';

// Make shared data available to other scripts
window.BOUQUETS = BOUQUETS;
window.DELIVERY_ZONES = DELIVERY_ZONES;

// The main file is the only owner of the Order form
window.SF_MAIN_OWNS_ORDER = true;

// ==========================================
// COMMON FUNCTIONS
// ==========================================

function formatPrice(amount) {
    return new Intl.NumberFormat('ru-RU').format(
        Number(amount) || 0
    ) + ' ₸';
}

window.formatPrice = formatPrice;

function createEl(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // Storage is unavailable
    }
}

function findBouquet(id) {
    return BOUQUETS.find(function (bouquet) {
        return bouquet.id === Number(id);
    }) || null;
}

function findDistrict(id) {
    return DELIVERY_ZONES.find(function (zone) {
        return zone.id === id;
    }) || null;
}

function todayISO() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function isValidPhone(value) {
    return /^\+77\d{9}$/.test(String(value || '').trim());
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(field, message) {
    clearError(field);

    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');

    const note = createEl(
        'div',
        'text-danger small mt-1 sf-error',
        message
    );

    field.insertAdjacentElement('afterend', note);
}

function clearError(field) {
    if (!field) return;

    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');

    const next = field.nextElementSibling;

    if (next && next.classList.contains('sf-error')) {
        next.remove();
    }
}

function calculatePrice(bouquet, quantity, rate, fee) {
    const subtotal = bouquet
        ? bouquet.price * quantity
        : 0;

    const discount = Math.round(subtotal * rate);

    return {
        subtotal: subtotal,
        discount: discount,
        deliveryFee: fee,
        total: subtotal - discount + fee
    };
}

// ==========================================
// 1. ACTIVE NAVIGATION
// ==========================================

function initNavigation() {
    const nav = document.querySelector('header nav ul');

    if (!nav) return;

    const username = readStorage(SESSION_KEY);

    let accountLink = nav.querySelector(
        '[data-auth-trigger] a'
    );

    if (!accountLink) {
        accountLink = Array.from(
            nav.querySelectorAll('a')
        ).find(function (link) {
            const text = link.textContent.trim().toLowerCase();

            return text === 'register' ||
                text.startsWith('hi,');
        });
    }

    if (!accountLink) {
        const item = createEl('li', 'nav-item');

        item.setAttribute('data-auth-trigger', '1');

        accountLink = createEl(
            'a',
            'nav-link text-white fw-bold',
            'Register'
        );

        item.appendChild(accountLink);
        nav.appendChild(item);
    }

    // Ensure jq-auth.js can identify the account link
    accountLink.parentElement.setAttribute(
        'data-auth-trigger',
        '1'
    );

    accountLink.textContent = username
        ? 'Hi, ' + username
        : 'Register';

    accountLink.href = username
        ? 'my-orders.html'
        : 'my-orders.html#register';

    const currentPage =
        location.pathname.split('/').pop() || 'index.html';

    nav.querySelectorAll('a').forEach(function (link) {
        const target = new URL(link.href, location.href);

        const targetPage =
            target.pathname.split('/').pop() || 'index.html';

        const active = (
            link !== accountLink &&
            !target.hash &&
            targetPage === currentPage
        );

        link.classList.remove(
            'active',
            'bg-white',
            'btn-light',
            'text-primary',
            'rounded-pill'
        );

        link.classList.add('text-white');
        link.removeAttribute('aria-current');

        if (active) {
            link.classList.remove('text-white');

            link.classList.add(
                'active',
                'bg-white',
                'text-primary',
                'rounded-pill'
            );

            link.setAttribute('aria-current', 'page');
        }
    });
}

// ==========================================
// 2. PHONE VALIDATION
// ==========================================

function initPhoneValidation() {

    function preparePhone(field) {
        if (field.dataset.sfPhoneReady === '1') return;

        field.dataset.sfPhoneReady = '1';

        field.placeholder = '+77081115757';
        field.autocomplete = 'tel';

        // Registration phone remains optional
        const optional = field.id === 'regPhone' ||
            !field.required && field.id !== 'phone';

        if (!optional && !field.value.trim()) {
            field.value = '+77';
        }

        function validate(displayError) {
            const value = field.value.trim();
            let message = '';

            if (optional && !value) {
                message = '';
            } else if (!value.startsWith('+77')) {
                message = 'Phone must start with +77.';
            } else if (!/^\+\d+$/.test(value)) {
                message = 'Only numbers are allowed.';
            } else if (!isValidPhone(value)) {
                message = 'Enter exactly 11 digits after +, starting with 77.';
            }

            field.setCustomValidity(message);

            if (displayError) {
                if (message) {
                    showError(field, message);
                } else {
                    clearError(field);
                }
            }

            return message === '';
        }

        field.addEventListener('input', function () {
            validate(true);
        });

        field.addEventListener('blur', function () {
            validate(true);
        });

        field.sfValidatePhone = validate;
        validate(false);
    }

    function scanPhones() {
        document.querySelectorAll(
            'input[type="tel"], input[name="phone"], #phone'
        ).forEach(preparePhone);
    }

    scanPhones();

    // Catch registration inputs created by jQuery
    const observer = new MutationObserver(scanPhones);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Block invalid phone numbers before submit handlers
    document.addEventListener('submit', function (event) {
        const phone = event.target.querySelector(
            'input[type="tel"], input[name="phone"], #phone'
        );

        if (
            phone &&
            typeof phone.sfValidatePhone === 'function' &&
            !phone.sfValidatePhone(true)
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            phone.focus();
        }
    }, true);
}

// ==========================================
// 3. FLOWERS PAGE INTEGRATION
// ==========================================

function initFlowersIntegration() {
    const catalog = document.querySelector(
        '#flower-list, #catalog'
    );

    if (!catalog) return;

    // Existing flowers.js owns catalog rendering and cart.
    // This handler only supports explicit Select buttons.
    catalog.addEventListener('click', function (event) {
        const button = event.target.closest(
            '.buy-btn[data-id]'
        );

        if (!button || !catalog.contains(button)) return;

        const bouquet = findBouquet(button.dataset.id);

        if (!bouquet || !bouquet.inStock) return;

        writeStorage(PICK_KEY, String(bouquet.id));

        location.href = 'order.html';
    });
}

// ==========================================
// 4. DELIVERY PAGE
// ==========================================

function initDeliveryCalculator() {
    const table = document.querySelector(
        'main .table-bordered'
    );

    if (!table) return;

    // Do not create two calculators
    if (document.getElementById('zoneSelect')) return;

    const wrapper = createEl(
        'div',
        'mt-4 border-top pt-3'
    );

    const label = createEl(
        'label',
        'form-label fw-bold text-primary',
        'Calculate Delivery to Your District:'
    );

    label.htmlFor = 'zoneSelect';

    const select = createEl(
        'select',
        'form-select mb-3'
    );

    select.id = 'zoneSelect';

    const placeholder = createEl(
        'option',
        '',
        'Select district...'
    );

    placeholder.value = '';
    select.appendChild(placeholder);

    DELIVERY_ZONES.forEach(function (zone) {
        const option = createEl('option', '', zone.name);

        option.value = zone.id;

        select.appendChild(option);
    });

    const result = createEl(
        'div',
        'alert alert-success fw-bold text-center d-none'
    );

    result.setAttribute('role', 'status');

    wrapper.append(label, select, result);
    table.parentNode.appendChild(wrapper);

    select.addEventListener('change', function () {
        const zone = findDistrict(select.value);

        if (!zone) {
            removeStorage(DELIVERY_KEY);
            result.classList.add('d-none');
            return;
        }

        writeStorage(DELIVERY_KEY, zone.id);

        result.textContent =
            'Delivery Fee: ' + formatPrice(zone.price);

        result.classList.remove('d-none');
    });

    const saved = readStorage(DELIVERY_KEY);

    if (findDistrict(saved)) {
        select.value = saved;
        select.dispatchEvent(new Event('change'));
    }
}

// ==========================================
// 5. ORDER PAGE
// ==========================================

function initOrderForm() {
    const flowerSelect = document.getElementById('flowers');

    if (!flowerSelect) return;

    const form = flowerSelect.closest('form');

    if (!form) return;

    form.noValidate = true;

    const nameInput = form.querySelector('#name');
    const phoneInput = form.querySelector('#phone');
    const emailInput = form.querySelector('#email');
    const quantityInput = form.querySelector('#quantity');
    const addressInput = form.querySelector('#address');
    const dateInput = form.querySelector('#date');
    const timeInput = form.querySelector('#time');

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    const buttons = submitButton
        ? submitButton.closest('.border-top')
        : null;

    if (dateInput) {
        dateInput.min = todayISO();
    }

    // --------------------------------------
    // AVAILABLE BOUQUETS
    // --------------------------------------

    flowerSelect.textContent = '';

    const available = BOUQUETS.filter(function (bouquet) {
        return bouquet.inStock;
    });

    available.forEach(function (bouquet) {
        const option = createEl(
            'option',
            '',
            bouquet.name + ' — ' + formatPrice(bouquet.price)
        );

        option.value = String(bouquet.id);
        flowerSelect.appendChild(option);
    });

    if (!available.length) {
        const option = createEl(
            'option',
            '',
            'No bouquets available'
        );

        option.value = '';
        flowerSelect.appendChild(option);
    }

    const savedPick = Number(readStorage(PICK_KEY));

    if (available.some(function (b) {
        return b.id === savedPick;
    })) {
        flowerSelect.value = String(savedPick);
    }

    removeStorage(PICK_KEY);

    // --------------------------------------
    // DELIVERY AND PICKUP
    // --------------------------------------

    const deliveryGroup = createEl('div', 'mb-4');

    const methodLabel = createEl(
        'label',
        'form-label fw-bold',
        'Delivery Method:'
    );

    methodLabel.htmlFor = 'deliveryMethod';

    const methodSelect = createEl(
        'select',
        'form-select mb-3'
    );

    methodSelect.id = 'deliveryMethod';

    [
        ['delivery', 'Home Delivery'],
        ['pickup', 'Self Pickup — Free']
    ].forEach(function (item) {
        const option = createEl('option', '', item[1]);

        option.value = item[0];
        methodSelect.appendChild(option);
    });

    const districtLabel = createEl(
        'label',
        'form-label fw-bold',
        'Choose Your District:'
    );

    districtLabel.htmlFor = 'orderDistrict';

    const districtSelect = createEl(
        'select',
        'form-select mb-3'
    );

    districtSelect.id = 'orderDistrict';

    DELIVERY_ZONES.forEach(function (zone) {
        const option = createEl(
            'option',
            '',
            zone.name + ' — ' + formatPrice(zone.price)
        );

        option.value = zone.id;
        districtSelect.appendChild(option);
    });

    const savedDistrict = readStorage(DELIVERY_KEY);

    if (findDistrict(savedDistrict)) {
        districtSelect.value = savedDistrict;
    }

    const branchLabel = createEl(
        'label',
        'form-label fw-bold d-none',
        'Pickup Branch:'
    );

    branchLabel.htmlFor = 'pickupBranch';

    const branchSelect = createEl(
        'select',
        'form-select mb-3 d-none'
    );

    branchSelect.id = 'pickupBranch';

    PICKUP_BRANCHES.forEach(function (branch) {
        const option = createEl('option', '', branch);

        option.value = branch;
        branchSelect.appendChild(option);
    });

    deliveryGroup.append(
        methodLabel,
        methodSelect,
        districtLabel,
        districtSelect,
        branchLabel,
        branchSelect
    );

    const addressGroup = addressInput
        ? addressInput.closest('.mb-3')
        : null;

    if (addressGroup) {
        addressGroup.parentNode.insertBefore(
            deliveryGroup,
            addressGroup
        );
    } else {
        form.prepend(deliveryGroup);
    }

    // --------------------------------------
    // PROMO AND TOTAL
    // --------------------------------------

    // Remove any previously created Total blocks
    form.querySelectorAll('.alert-info').forEach(function (item) {
        if (/^Total:/.test(item.textContent.trim())) {
            item.remove();
        }
    });

    form.querySelectorAll('#total-price').forEach(function (item) {
        item.remove();
    });

    const oldPromo = form.querySelector('#promoCode');

    if (oldPromo) {
        const oldGroup = oldPromo.closest('.mb-3');

        if (oldGroup) oldGroup.remove();
    }

    const promoGroup = createEl('div', 'mb-3');

    const promoLabel = createEl(
        'label',
        'form-label fw-bold',
        'Promo Code (optional):'
    );

    promoLabel.htmlFor = 'promoCode';

    const promoInput = createEl(
        'input',
        'form-control'
    );

    promoInput.id = 'promoCode';
    promoInput.placeholder = 'FLOWER10';
    promoInput.autocomplete = 'off';

    const promoResult = createEl(
        'div',
        'small mt-2'
    );

    promoGroup.append(
        promoLabel,
        promoInput,
        promoResult
    );

    const totalBox = createEl(
        'div',
        'alert alert-info mt-4 fs-5 fw-bold text-center'
    );

    totalBox.id = 'total-price';

    const totalLine = createEl('div');

    const detailLine = createEl(
        'div',
        'fs-6 fw-normal mt-2'
    );

    totalBox.append(totalLine, detailLine);

    if (buttons) {
        buttons.parentNode.insertBefore(promoGroup, buttons);
        buttons.parentNode.insertBefore(totalBox, buttons);
    } else {
        form.append(promoGroup, totalBox);
    }

    let activePromo = '';

    // --------------------------------------
    // DELIVERY CALCULATION
    // --------------------------------------

    function selectedDelivery() {
        if (methodSelect.value === 'pickup') {
            return {
                method: 'pickup',
                district: '',
                branch: branchSelect.value,
                fee: 0
            };
        }

        const zone = findDistrict(districtSelect.value);

        return {
            method: 'delivery',
            district: zone ? zone.name : '',
            branch: '',
            fee: zone ? zone.price : 0
        };
    }

    function calculateTotal() {
        const bouquet = findBouquet(flowerSelect.value);
        const quantity = Number(quantityInput.value);

        const validQuantity =
            Number.isInteger(quantity) &&
            quantity >= 1 &&
            quantity <= 20;

        const count = validQuantity ? quantity : 0;

        const delivery = selectedDelivery();

        const rate = PROMO_CODES[activePromo] || 0;

        const sums = calculatePrice(
            bouquet,
            count,
            rate,
            delivery.fee
        );

        totalLine.textContent =
            'Total: ' + formatPrice(sums.total);

        detailLine.textContent =
            'Flowers: ' + formatPrice(sums.subtotal) +
            ' | Discount: -' + formatPrice(sums.discount) +
            ' | Delivery: ' + formatPrice(sums.deliveryFee);

        return {
            bouquet: bouquet,
            quantity: count,
            delivery: delivery,
            subtotal: sums.subtotal,
            discount: sums.discount,
            total: sums.total
        };
    }

    function updateDeliveryMode() {
        const pickup = methodSelect.value === 'pickup';

        districtLabel.classList.toggle('d-none', pickup);
        districtSelect.classList.toggle('d-none', pickup);

        branchLabel.classList.toggle('d-none', !pickup);
        branchSelect.classList.toggle('d-none', !pickup);

        if (addressGroup) {
            addressGroup.classList.toggle('d-none', pickup);
        }

        if (addressInput) {
            addressInput.required = !pickup;

            if (pickup) {
                clearError(addressInput);
            }
        }

        calculateTotal();
    }

    methodSelect.addEventListener(
        'change',
        updateDeliveryMode
    );

    districtSelect.addEventListener('change', function () {
        writeStorage(DELIVERY_KEY, districtSelect.value);
        calculateTotal();
    });

    flowerSelect.addEventListener('change', calculateTotal);
    quantityInput.addEventListener('input', calculateTotal);

    // --------------------------------------
    // PROMO CODES
    // --------------------------------------

    const promoButton = form.querySelector('#promo-btn');

    function applyPromo() {
        const code = promoInput.value.trim().toUpperCase();

        if (Object.prototype.hasOwnProperty.call(
            PROMO_CODES,
            code
        )) {
            activePromo = code;

            promoResult.className =
                'small mt-2 text-success';

            promoResult.textContent =
                'Promo applied: ' +
                Math.round(PROMO_CODES[code] * 100) +
                '% off';
        } else {
            activePromo = '';

            promoResult.className =
                'small mt-2 text-danger';

            promoResult.textContent =
                'Invalid promo code.';
        }

        calculateTotal();
    }

    if (promoButton) {
        promoButton.addEventListener('click', applyPromo);
    }

    promoInput.addEventListener('input', function () {
        activePromo = '';
        promoResult.textContent = '';
        calculateTotal();
    });

    updateDeliveryMode();

    // --------------------------------------
    // FORM VALIDATION
    // --------------------------------------

    function validateField(field) {
        if (!field) return true;

        const value = String(field.value || '').trim();
        let message = '';

        switch (field.id) {
            case 'name':
                if (value.length < 2) {
                    message = 'Enter your full name.';
                }
                break;

            case 'phone':
                if (!isValidPhone(value)) {
                    message =
                        'Use +77 and exactly 11 digits, e.g. +77081115757.';
                }
                break;

            case 'email':
                if (!isValidEmail(value)) {
                    message = 'Enter a valid email.';
                }
                break;

            case 'flowers':
                const bouquet = findBouquet(value);

                if (!bouquet || !bouquet.inStock) {
                    message = 'Choose an available bouquet.';
                }
                break;

            case 'quantity':
                const quantity = Number(value);

                if (
                    value === '' ||
                    !Number.isInteger(quantity) ||
                    quantity < 1 ||
                    quantity > 20
                ) {
                    message = 'Choose 1 to 20 bouquets.';
                }
                break;

            case 'address':
                if (
                    methodSelect.value === 'delivery' &&
                    value.length < 5
                ) {
                    message = 'Enter your delivery address.';
                }
                break;

            case 'date':
                if (!value || value < todayISO()) {
                    message =
                        'Select today or a future date.';
                }
                break;

            case 'time':
                if (!/^\d{2}:\d{2}$/.test(value)) {
                    message = 'Select a delivery time.';
                }
                break;
        }

        if (message) {
            showError(field, message);
            return false;
        }

        clearError(field);
        return true;
    }

    const fields = [
        nameInput,
        phoneInput,
        emailInput,
        flowerSelect,
        quantityInput,
        addressInput,
        dateInput,
        timeInput
    ].filter(Boolean);

    form.addEventListener('input', function (event) {
        if (fields.includes(event.target)) {
            validateField(event.target);
        }
    });

    form.addEventListener('change', function (event) {
        if (fields.includes(event.target)) {
            validateField(event.target);
        }
    });

    // --------------------------------------
    // RESET FORM
    // --------------------------------------

    form.addEventListener('reset', function () {
        setTimeout(function () {
            activePromo = '';
            promoInput.value = '';
            promoResult.textContent = '';

            form.querySelectorAll('.sf-error')
                .forEach(function (item) {
                    item.remove();
                });

            fields.forEach(clearError);

            if (phoneInput) {
                phoneInput.value = '+77';
                phoneInput.setCustomValidity('');
            }

            updateDeliveryMode();
        }, 0);
    });

    // --------------------------------------
    // SUBMIT ORDER
    // --------------------------------------

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        let firstInvalid = null;

        fields.forEach(function (field) {
            if (!validateField(field) && !firstInvalid) {
                firstInvalid = field;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const result = calculateTotal();
        const bouquet = result.bouquet;

        if (!bouquet || !bouquet.inStock) return;

        const delivery = result.delivery;
        const username = readStorage(SESSION_KEY);

        const order = {
            id: Number(String(Date.now()).slice(-6)),
            username: username,
            bouquet: bouquet.name +
                (result.quantity > 1
                    ? ' × ' + result.quantity
                    : ''),
            ordered: todayISO(),
            delivery: dateInput.value,
            time: timeInput.value,
            status: 'awaiting',
            total: result.total,
            subtotal: result.subtotal,
            discount: result.discount,
            deliveryFee: delivery.fee,
            deliveryMethod: delivery.method,
            district: delivery.district,
            pickupBranch: delivery.branch,
            address: addressInput.value.trim(),
            phone: phoneInput.value.trim(),
            promoCode: activePromo
        };

        // Compatible with My Orders
        if (username) {
            let orders = [];

            try {
                orders = JSON.parse(
                    readStorage(ORDERS_KEY) || '[]'
                );

                if (!Array.isArray(orders)) {
                    orders = [];
                }
            } catch (error) {
                orders = [];
            }

            orders.push(order);

            writeStorage(
                ORDERS_KEY,
                JSON.stringify(orders)
            );
        }

        // --------------------------------------
        // CONFIRMATION
        // --------------------------------------

        let messageBox = document.getElementById(
            'order-message'
        );

        if (!messageBox) {
            messageBox = createEl('div');
        }

        // Move outside form so it remains visible
        form.insertAdjacentElement(
            'afterend',
            messageBox
        );

        messageBox.textContent = '';
        messageBox.className =
            'alert alert-success mt-3';

        messageBox.appendChild(
            createEl(
                'h4',
                'fw-bold',
                'Order placed successfully!'
            )
        );

        messageBox.appendChild(
            createEl(
                'p',
                '',
                result.quantity + ' × ' + bouquet.name
            )
        );

        messageBox.appendChild(
            createEl(
                'p',
                'fw-bold',
                'Total: ' + formatPrice(result.total)
            )
        );

        const deliveryText = delivery.method === 'pickup'
            ? 'Self Pickup — Free. Branch: ' + delivery.branch
            : 'Delivery to ' + delivery.district +
              ', ' + order.address +
              '. Fee: ' + formatPrice(delivery.fee);

        messageBox.appendChild(
            createEl('p', '', deliveryText)
        );

        messageBox.appendChild(
            createEl(
                'p',
                '',
                'Date: ' + order.delivery +
                ' at ' + order.time
            )
        );

        messageBox.appendChild(
            createEl(
                'p',
                'small text-muted',
                'Demo order only. No real payment or delivery was processed.'
            )
        );

        if (username) {
            const ordersLink = createEl(
                'a',
                'btn btn-outline-primary me-2',
                'My Orders'
            );

            ordersLink.href = 'my-orders.html';

            messageBox.appendChild(ordersLink);
        }

        const again = createEl(
            'button',
            'btn btn-primary',
            'Place Another Order'
        );

        again.type = 'button';

        messageBox.appendChild(again);

        again.addEventListener('click', function () {
            messageBox.classList.add('d-none');
            form.classList.remove('d-none');

            form.reset();
            calculateTotal();

            form.scrollIntoView({
                behavior: 'smooth'
            });
        });

        form.classList.add('d-none');
        messageBox.classList.remove('hidden', 'd-none');

        messageBox.scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    initNavigation();
    initPhoneValidation();
    initFlowersIntegration();
    initDeliveryCalculator();
    initOrderForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
