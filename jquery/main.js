'use strict';

/*
 * main.js - PLAIN JavaScript (weeks 6-8). There is NO jQuery in this file.
 *
 * Plain JavaScript features (jQuery lives only in the jq-*.js files):
 *   1. Account link in the menu ("Register" / "Hi, name")
 *   2. Bouquet catalog (flowers page): built from the BOUQUETS array + filter + "Select" button
 *   3. Delivery fee calculator (delivery page): built from the DELIVERY_ZONES array
 *   4. Florist tips (about page)
 *   5. Order form (order page): live total, promo code, full validation, confirmation,
 *      and the order is saved so it shows up in "My Orders"
 *
 * The real data of the project sits in arrays/objects at the top; the markup for the bouquets,
 * the districts and the tips exists nowhere in the HTML - it is built from these arrays with loops.
 */
(function () {

    /* ============================ DATA ============================ */

    const SESSION_KEY = 'sf_session_user';   // same key jq-auth.js writes
    const ORDERS_KEY = 'sf_orders';          // jq-auth.js reads it to fill "My Orders"
    const PICK_KEY = 'sf_pick';              // bouquet chosen on the catalog page, used on the order page

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

    const DELIVERY_ZONES = [
        { id: 'esil', name: 'Esil District', price: 1500 },
        { id: 'almaty', name: 'Almaty District', price: 1200 },
        { id: 'saryarka', name: 'Saryarka District', price: 1000 },
        { id: 'baikonyr', name: 'Baikonyr District', price: 1300 },
        { id: 'nura', name: 'Nura District', price: 1800 }
    ];

    const FLORIST_TIPS = [
        'Did you know? Peonies can live up to 100 years!',
        'Florist tip: Change the water in your vase every 2 days.',
        'Secret: Tulips continue to grow even after being cut.',
        'Fun fact: Roses are one of the oldest flowers, dating back 35 million years.',
        'Tip: Keep your bouquet away from direct sunlight and fresh fruit.'
    ];

    // The code advertised on the Reviews page: "FLOWER10 for a 10% discount".
    const PROMO_CODES = { FLOWER10: 0.10 };

    // Which bouquet the visitor clicked "Select" on (a category can hold several bouquets).
    let pickedId = null;
    // The order form replaces this with its real "recalculate the total" function.
    let refreshTotal = function () {};

    /* ======================== SMALL HELPERS ======================== */
    /* Each helper takes parameters, returns a value and is called from several places. */

    function createEl(tag, className, text) {
        const el = document.createElement(tag);
        if (className) { el.className = className; }
        if (text !== undefined) { el.textContent = text; }   // textContent: text is never parsed as HTML
        return el;
    }

    function formatPrice(amount) {
        return (typeof amount === 'number' ? amount : 0).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';
    }

    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    function todayIso() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function readStorage(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function writeStorage(key, value) {
        try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
    }

    function removeStorage(key) {
        try { localStorage.removeItem(key); } catch (e) { /* storage disabled: nothing to remove */ }
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    function isValidPhone(value) {
        const digits = value.replace(/\D/g, '');
        return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 10 && digits.length <= 12;
    }

    function findBouquetById(id) {
        return BOUQUETS.find(function (b) { return b.id === id; });
    }

    function findBouquetByCategory(category) {
        return BOUQUETS.find(function (b) { return b.category === category; });
    }

    // The bouquet the visitor really means: the clicked one if it fits the chosen category, else the first of it.
    function currentBouquet(category) {
        const picked = findBouquetById(pickedId);
        return picked && picked.category === category ? picked : findBouquetByCategory(category);
    }

    // 0 when the code is empty or unknown.
    function getDiscountRate(code) {
        const key = code.trim().toUpperCase();
        return Object.prototype.hasOwnProperty.call(PROMO_CODES, key) ? PROMO_CODES[key] : 0;
    }

    // THE calculated numbers of the project: subtotal, discount and the final total.
    function calcOrderTotal(bouquet, quantity, discountRate) {
        const subtotal = bouquet ? bouquet.price * quantity : 0;
        const discount = Math.round(subtotal * discountRate);
        return { subtotal: subtotal, discount: discount, total: subtotal - discount };
    }

    function filterBouquets(category, inStockOnly) {
        return BOUQUETS.filter(function (b) {
            return (category === '' || b.category === category) && (!inStockOnly || b.inStock);
        });
    }

    // Picks a tip different from the last one shown.
    function pickTipIndex(previousIndex) {
        let index = Math.floor(Math.random() * FLORIST_TIPS.length);
        if (index === previousIndex) { index = (index + 1) % FLORIST_TIPS.length; }
        return index;
    }

    /* Show / hide a block with the Bootstrap classes that already exist (d-none, fade, show). */
    function showBlock(el) {
        el.classList.remove('d-none', 'hidden');
        el.classList.add('fade');
        el.classList.remove('show');
        void el.offsetWidth;                       // restart the transition
        el.classList.add('show');
    }

    function hideBlock(el) {
        el.classList.remove('show');
        el.classList.add('d-none');
    }

    /* Error messages: one next to each wrong field. */
    function showError(field, message) {
        clearError(field);
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        const note = createEl('div', 'text-danger small mt-1 error-msg', message);
        note.setAttribute('role', 'alert');
        field.insertAdjacentElement('afterend', note);
    }

    function clearError(field) {
        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
        const next = field.nextElementSibling;
        if (next && next.classList.contains('error-msg')) { next.remove(); }
    }

    /* ===================== 1. ACCOUNT LINK IN THE MENU ===================== */

    function initAccountLink() {
        const navList = document.querySelector('header nav ul');
        if (!navList || navList.querySelector('[data-auth-trigger]')) { return; }

        const username = readStorage(SESSION_KEY);
        const item = createEl('li', 'nav-item');
        item.setAttribute('data-auth-trigger', '1');

        // A plain link: it works on every page. On pages that load jq-auth.js the registration dialog
        // opens on top of the page; on the other pages the link opens My Orders, which opens it.
        const link = createEl('a', 'btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary',
            username ? 'Hi, ' + username : 'Register');
        link.href = username ? 'my-orders.html' : 'my-orders.html#register';

        item.appendChild(link);
        navList.appendChild(item);
    }

    /* ========================= 2. BOUQUET CATALOG ========================= */

    function buildCard(flower) {
        const col = createEl('div', 'col-md-4 mb-4');
        const card = createEl('div', 'card h-100 shadow-sm border-0');
        const body = createEl('div', 'card-body d-flex flex-column');

        body.appendChild(createEl('span',
            (flower.inStock ? 'badge bg-success' : 'badge bg-secondary') + ' align-self-start mb-2',
            flower.inStock ? 'In Stock' : 'Out of Stock'));
        body.appendChild(createEl('h5', 'card-title fw-bold text-primary', flower.name));
        body.appendChild(createEl('p', 'card-text text-muted mb-4', 'Category: ' + capitalize(flower.category)));

        const footer = createEl('div', 'mt-auto d-flex justify-content-between align-items-center');
        footer.appendChild(createEl('span', 'fs-5 fw-bold', formatPrice(flower.price)));
        const button = createEl('button', 'btn btn-outline-primary buy-btn', 'Select');
        button.type = 'button';
        button.dataset.id = flower.id;
        button.disabled = !flower.inStock;
        footer.appendChild(button);

        body.appendChild(footer);
        card.appendChild(body);
        col.appendChild(card);
        return col;
    }

    function renderCatalog(listEl, items) {
        listEl.textContent = '';
        if (items.length === 0) {                                  // the empty case says so
            const col = createEl('div', 'col-12');
            col.appendChild(createEl('div', 'alert alert-secondary text-center mb-0',
                'No bouquets match these filters. Try another category or untick "In stock only".'));
            listEl.appendChild(col);
            return;
        }
        items.forEach(function (flower) { listEl.appendChild(buildCard(flower)); });
    }

    // The filter panel is built in code too; its categories come from the BOUQUETS array.
    function buildCatalogControls(listEl) {
        const categories = [];
        BOUQUETS.forEach(function (b) {
            if (!categories.includes(b.category)) { categories.push(b.category); }
        });

        const panel = createEl('div', 'd-flex flex-wrap align-items-center gap-3 mb-3');

        const select = createEl('select', 'form-select w-auto');
        select.id = 'catalogCategory';
        select.setAttribute('aria-label', 'Filter bouquets by category');
        const all = createEl('option', '', 'All categories');
        all.value = '';
        select.appendChild(all);
        categories.forEach(function (category) {
            const option = createEl('option', '', capitalize(category));
            option.value = category;
            select.appendChild(option);
        });

        const stockWrap = createEl('div', 'form-check mb-0');
        const stockBox = createEl('input', 'form-check-input');
        stockBox.type = 'checkbox';
        stockBox.id = 'catalogStock';
        const stockLabel = createEl('label', 'form-check-label', 'In stock only');
        stockLabel.htmlFor = 'catalogStock';
        stockWrap.append(stockBox, stockLabel);

        const resetBtn = createEl('button', 'btn btn-outline-secondary btn-sm', 'Reset filters');
        resetBtn.type = 'button';

        const count = createEl('span', 'small text-muted ms-auto');
        count.setAttribute('role', 'status');

        panel.append(select, stockWrap, resetBtn, count);
        listEl.parentNode.insertBefore(panel, listEl);
        return { select: select, stockBox: stockBox, resetBtn: resetBtn, count: count };
    }

    // "Select": on the order page it fills the form; on the catalog page it opens the order page with the choice.
    function applyPick(flower) {
        const select = document.getElementById('flowers');
        if (!select) { return false; }
        select.value = flower.category;
        pickedId = flower.id;
        const form = select.closest('form');
        if (form) { form.classList.add('border-primary'); }
        clearError(select);
        refreshTotal();
        return true;
    }

    function selectBouquet(flower) {
        if (applyPick(flower)) {
            document.getElementById('flowers').scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            writeStorage(PICK_KEY, String(flower.id));
            window.location.href = 'order.html';
        }
    }

    function initCatalog() {
        const listEl = document.querySelector('#flower-list, #catalog');
        if (!listEl) { return; }

        const controls = buildCatalogControls(listEl);

        function update() {
            const items = filterBouquets(controls.select.value, controls.stockBox.checked);
            renderCatalog(listEl, items);
            controls.count.textContent = 'Showing ' + items.length + ' of ' + BOUQUETS.length + ' bouquets';
        }

        controls.select.addEventListener('change', update);                 // event type 1: change
        controls.stockBox.addEventListener('change', update);
        controls.resetBtn.addEventListener('click', function () {           // event type 2: click
            controls.select.value = '';
            controls.stockBox.checked = false;
            update();
        });

        // DELEGATED: one handler on the list. The cards are thrown away and rebuilt on every filter change,
        // so a handler on each button would be lost; this one still catches the new buttons.
        listEl.addEventListener('click', function (event) {
            const button = event.target.closest('.buy-btn');                // the element the visitor really clicked
            if (!button || !listEl.contains(button)) { return; }
            const flower = findBouquetById(Number(button.dataset.id));
            if (flower) { selectBouquet(flower); }
        });

        update();
    }

    /* ====================== 3. DELIVERY FEE CALCULATOR ====================== */

    function initDeliveryCalculator() {
        const table = document.querySelector('.table-bordered');
        if (!table) { return; }

        const wrapper = createEl('div', 'mt-4 border-top pt-3');
        const label = createEl('label', 'form-label fw-bold text-primary', 'Calculate Delivery to Your District:');
        label.htmlFor = 'zoneSelect';
        const select = createEl('select', 'form-select mb-3');
        select.id = 'zoneSelect';
        const placeholder = createEl('option', '', 'Select district...');
        placeholder.value = '';
        select.appendChild(placeholder);
        DELIVERY_ZONES.forEach(function (zone) {
            const option = createEl('option', '', zone.name);
            option.value = zone.id;
            select.appendChild(option);
        });
        const result = createEl('div', 'alert alert-success fw-bold text-center mb-0 d-none');
        result.setAttribute('role', 'status');

        wrapper.append(label, select, result);
        table.parentNode.appendChild(wrapper);

        select.addEventListener('change', function () {
            const zone = DELIVERY_ZONES.find(function (z) { return z.id === select.value; });
            if (!zone) { hideBlock(result); return; }
            result.textContent = 'Delivery Fee: ' + formatPrice(zone.price);
            showBlock(result);
        });
    }

    /* ========================== 4. FLORIST TIPS ========================== */

    function initFloristTips() {
        const sections = document.querySelectorAll('.bg-white.p-4.rounded.shadow-sm');
        if (sections.length < 2) { return; }
        const target = sections[1];

        const button = createEl('button', 'btn btn-outline-primary w-100 mt-3', 'Get a Secret Florist Tip');
        button.type = 'button';
        const display = createEl('div', 'alert alert-info mt-3 mb-0 fst-italic text-center d-none');
        display.setAttribute('role', 'status');
        target.append(button, display);

        let last = -1;
        button.addEventListener('click', function () {
            last = pickTipIndex(last);
            display.textContent = FLORIST_TIPS[last];
            showBlock(display);
            button.textContent = 'Get Another Tip';
        });
    }

    /* ============================ 5. ORDER FORM ============================ */

    function saveOrder(order) {
        let orders = [];
        try { orders = JSON.parse(readStorage(ORDERS_KEY)) || []; } catch (e) { orders = []; }
        orders.push(order);
        return writeStorage(ORDERS_KEY, JSON.stringify(orders));
    }

    function initOrderForm() {
        const flowerSelect = document.getElementById('flowers');
        if (!flowerSelect) { return; }
        const form = flowerSelect.closest('form') || document.querySelector('form');
        if (!form) { return; }

        form.noValidate = true;    // our own messages (one per field) replace the browser's bubbles

        const quantityInput = document.getElementById('quantity');
        const dateInput = document.getElementById('date');
        const addressInput = document.getElementById('address');
        if (dateInput) { dateInput.min = todayIso(); }

        // ---- promo code field and live total: built in code ----
        const promoGroup = createEl('div', 'mb-3');
        const promoLabel = createEl('label', 'form-label fw-semibold', 'Promo code (optional)');
        promoLabel.htmlFor = 'promoCode';
        const promoInput = createEl('input', 'form-control');
        promoInput.type = 'text';
        promoInput.id = 'promoCode';
        promoInput.name = 'promo';
        promoInput.placeholder = 'e.g. FLOWER10';
        promoInput.autocomplete = 'off';
        promoGroup.append(promoLabel, promoInput);

        const totalBox = createEl('div', 'alert alert-info mt-4 fs-5 fw-bold text-center');
        totalBox.setAttribute('role', 'status');
        const totalLine = createEl('div');
        const detailLine = createEl('div', 'fs-6 fw-normal');
        totalBox.append(totalLine, detailLine);

        const anchor = form.querySelector('.border-top, button[type="submit"]');
        const place = anchor ? (anchor.closest('.order-buttons') || anchor) : null;
        if (place) {
            place.parentNode.insertBefore(promoGroup, place);
            place.parentNode.insertBefore(totalBox, place);
        } else {
            form.append(promoGroup, totalBox);
        }

        // ---- result box ----
        let messageBox = document.getElementById('order-message');
        if (!messageBox) {
            messageBox = createEl('div', 'alert alert-success d-none');
            form.insertAdjacentElement('afterend', messageBox);
        }

        function readQuantity() {
            const parsed = parseInt(quantityInput ? quantityInput.value : '1', 10);
            return Math.max(1, parsed || 1);
        }

        refreshTotal = function () {
            const bouquet = currentBouquet(flowerSelect.value);
            const rate = getDiscountRate(promoInput.value);
            const sums = calcOrderTotal(bouquet, readQuantity(), rate);
            totalLine.textContent = 'Total: ' + formatPrice(sums.total);
            detailLine.textContent = rate > 0
                ? 'Subtotal ' + formatPrice(sums.subtotal) + ', promo discount −' + formatPrice(sums.discount)
                : '';
            return sums;
        };

        // The user changes the category by hand: forget the clicked bouquet.
        flowerSelect.addEventListener('change', function () { pickedId = null; refreshTotal(); });   // event: change
        if (quantityInput) { quantityInput.addEventListener('input', refreshTotal); }                // event: input
        promoInput.addEventListener('input', refreshTotal);

        // ---- validation rules: DATA, one object per field ----
        const RULES = [
            { id: 'name', required: true, check: function (v) {
                if (v.length < 2) { return 'Please enter your full name (at least 2 characters).'; }
                return v.length > 50 ? 'The name is too long (max 50 characters).' : '';
            } },
            { id: 'email', required: true, check: function (v) {
                return isValidEmail(v) ? '' : 'Enter a valid email, for example name@example.com.';
            } },
            { id: 'phone', check: function (v) {
                return isValidPhone(v) ? '' : 'Use a phone like +7 (708) 111-57-57.';
            } },
            { id: 'address', check: function (v) {
                return v.length < 5 ? 'Please enter the full delivery address (at least 5 characters).' : '';
            } },
            { id: 'flowers', required: true, requiredMsg: 'Please choose a bouquet.', check: function (v) {
                const bouquet = currentBouquet(v);
                if (!bouquet) { return 'We cannot price this bouquet yet. Please choose another one.'; }
                return bouquet.inStock ? '' : bouquet.name + ' is out of stock right now. Please choose another bouquet.';
            } },
            { id: 'quantity', required: true, check: function (v, field) {
                const n = Number(v);
                const min = field.min !== '' ? Number(field.min) : 1;
                const max = field.max !== '' ? Number(field.max) : 100;
                return !Number.isInteger(n) || n < min || n > max
                    ? 'Choose a whole number of bouquets from ' + min + ' to ' + max + '.' : '';
            } },
            { id: 'date', required: true, requiredMsg: 'Please select a delivery date.', check: function (v, field) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { return 'Enter a valid date.'; }
                if (field.min && v < field.min) { return 'The earliest delivery date is ' + field.min.split('-').reverse().join('.') + '.'; }
                return v < todayIso() ? 'Delivery date cannot be in the past.' : '';
            } },
            { id: 'promoCode', check: function (v) {
                return getDiscountRate(v) > 0 ? '' : 'This promo code is not valid.';
            } }
        ];

        // '' means the field is fine.
        function messageFor(rule, field) {
            const value = field.value.trim();
            if (value === '') {
                return rule.required || field.required ? (rule.requiredMsg || 'This field is required.') : '';
            }
            return rule.check(value, field);
        }

        // The error disappears AS SOON AS the visitor fixes the field (delegated: one handler for the whole form).
        function recheck(event) {
            const field = event.target;
            if (!field.classList || !field.classList.contains('is-invalid')) { return; }
            const rule = RULES.find(function (r) { return r.id === field.id; });
            if (rule && messageFor(rule, field) === '') { clearError(field); }
        }
        form.addEventListener('input', recheck);
        form.addEventListener('change', recheck);

        // Preselect a bouquet chosen on the catalog page.
        const pending = findBouquetById(Number(readStorage(PICK_KEY)));
        if (pending) { applyPick(pending); }
        removeStorage(PICK_KEY);
        refreshTotal();

        form.addEventListener('submit', function (event) {                  // event: submit
            event.preventDefault();                                          // no page reload: we show the answer ourselves

            let firstBad = null;
            RULES.forEach(function (rule) {
                const field = document.getElementById(rule.id);
                if (!field) { return; }                                      // this field is not on the page
                field.value = field.value.trim();                            // trimmed value goes back into the field
                const message = messageFor(rule, field);
                if (message) {
                    showError(field, message);
                    if (!firstBad) { firstBad = field; }
                } else {
                    clearError(field);
                }
            });
            if (firstBad) { firstBad.focus(); return; }

            // ---- every check passed: total it, save it, confirm it ----
            const bouquet = currentBouquet(flowerSelect.value);
            const quantity = readQuantity();
            const sums = refreshTotal();
            const username = readStorage(SESSION_KEY);
            const nameField = document.getElementById('name');
            const customer = nameField ? nameField.value : 'Customer';
            const deliveryDate = dateInput ? dateInput.value : todayIso();
            const address = addressInput ? addressInput.value : 'Address not specified';

            const order = {
                id: Number(String(Date.now()).slice(-6)),
                username: username,
                bouquet: bouquet.name + (quantity > 1 ? ' × ' + quantity : ''),
                ordered: todayIso(),
                delivery: deliveryDate,
                status: 'awaiting',
                total: sums.total
            };
            if (username) { saveOrder(order); }

            showConfirmation(customer, order, bouquet, quantity, sums, address, Boolean(username));
        });

        function showConfirmation(customer, order, bouquet, quantity, sums, address, loggedIn) {
            messageBox.textContent = '';
            messageBox.classList.add('alert', 'alert-success');

            messageBox.appendChild(createEl('h4', 'alert-heading fw-bold', 'Thank you for your order, ' + customer + '!'));
            messageBox.appendChild(createEl('p', 'mb-1', 'Order #' + order.id + ': ' + quantity + '× ' + bouquet.name + '.'));
            const money = sums.discount > 0
                ? 'Total price: ' + formatPrice(sums.total) + ' (promo discount ' + formatPrice(sums.discount) + ' already taken off).'
                : 'Total price: ' + formatPrice(sums.total) + '.';
            messageBox.appendChild(createEl('p', 'mb-1', money));
            messageBox.appendChild(createEl('p', 'mb-1', 'Delivery scheduled for ' + order.delivery.split('-').reverse().join('.') + ' to: ' + address + '.'));

            const next = createEl('p', 'mb-2');
            if (loggedIn) {
                next.append('This order was added to your history. ');
                const link = createEl('a', 'link-primary fw-bold', 'Open My Orders');
                link.href = 'my-orders.html';
                next.appendChild(link);
            } else {
                next.append('Want to follow this order? Use the Register button in the menu, then place your next order while logged in.');
            }
            messageBox.appendChild(next);

            messageBox.appendChild(createEl('hr'));
            messageBox.appendChild(createEl('p', 'mb-3 small text-muted fw-bold', '*This is a front-end demonstration. No data was sent to a server.'));

            const again = createEl('button', 'btn btn-outline-primary', 'Place another order');
            again.type = 'button';
            again.addEventListener('click', function () {                    // event: click
                messageBox.classList.remove('d-block', 'show');
                messageBox.classList.add('hidden');
                form.reset();
                pickedId = null;
                form.classList.remove('d-none', 'fade');
                refreshTotal();
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            messageBox.appendChild(again);

            form.classList.add('fade');                                      // the form fades out, then the answer fades in
            setTimeout(function () {
                form.classList.add('d-none');
                messageBox.classList.remove('hidden', 'd-none');
                messageBox.classList.add('d-block');
                showBlock(messageBox);
                messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
        }
    }

    /* ============================== START ============================== */

    function init() {
        initAccountLink();
        initCatalog();
        initDeliveryCalculator();
        initFloristTips();
        initOrderForm();
    }

    // With `defer` the page is already parsed when this runs, so start at once; otherwise wait for it.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
