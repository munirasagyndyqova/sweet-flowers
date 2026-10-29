'use strict';


(function () {
    if (typeof SiteUtils === 'undefined' || typeof BOUQUETS === 'undefined' || typeof formatPrice !== 'function') {
        console.warn('my-orders.js: js/main.js and js/utils.js must be loaded first.');
        return;
    }

    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginBtn');
    const loginResult = document.getElementById('loginResult');
    const logoutButton = document.getElementById('logoutBtn');
    const customerName = document.getElementById('customerName');
    const activeCount = document.getElementById('activeCount');
    const awaitingCount = document.getElementById('awaitingCount');
    const completedCount = document.getElementById('completedCount');
    const tbody = document.getElementById('ordersTbody');
    if (!loginView || !dashboardView || !loginForm || !usernameInput || !passwordInput || !loginButton ||
        !loginResult || !logoutButton || !customerName || !activeCount || !awaitingCount ||
        !completedCount || !tbody) {
        return;
    }

    const {
        Validators, createEl, createButton, createLabeledControl, renderAlert, setFieldError,
        setFieldValid, clearFieldState, focusFirstInvalid, formatDate
    } = SiteUtils;

    const TABLE_COLUMNS = 6;
    const STATUS_FILTERS = [
        ['all', 'All orders'],
        ['active', 'Active (preparing or awaiting delivery)'],
        ['preparing', 'Preparing'],
        ['awaiting', 'Awaiting delivery'],
        ['delivered', 'Delivered'],
        ['cancelled', 'Cancelled']
    ];
    const SORT_OPTIONS = [
        ['newest', 'Newest first'],
        ['oldest', 'Oldest first'],
        ['total-high', 'Total: high to low'],
        ['total-low', 'Total: low to high']
    ];

    /* ---------- data: sample orders built from the BOUQUETS catalogue ---------- */

    function daysFromToday(offset) {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + offset);
        return date;
    }

    // Looks the bouquet up in the catalogue and keeps a price snapshot, like a real order would.
    function makeItem(bouquetId, quantity) {
        const bouquet = BOUQUETS.find((entry) => entry.id === bouquetId);
        return { bouquetId: bouquetId, quantity: quantity, unitPrice: bouquet ? bouquet.price : 0 };
    }

    function createSampleOrders() {
        return [
            { id: 'DEMO-1001', orderedOn: daysFromToday(-62), deliveryOn: daysFromToday(-61), status: 'delivered', items: [makeItem(1, 1)] },
            { id: 'DEMO-1002', orderedOn: daysFromToday(-48), deliveryOn: daysFromToday(-47), status: 'delivered', items: [makeItem(2, 2), makeItem(3, 1)] },
            { id: 'DEMO-1003', orderedOn: daysFromToday(-30), deliveryOn: daysFromToday(-29), status: 'delivered', items: [makeItem(4, 1)] },
            { id: 'DEMO-1004', orderedOn: daysFromToday(-21), deliveryOn: daysFromToday(-20), status: 'cancelled', items: [makeItem(6, 1)] },
            { id: 'DEMO-1005', orderedOn: daysFromToday(-9), deliveryOn: daysFromToday(-8), status: 'delivered', items: [makeItem(7, 3)] },
            { id: 'DEMO-1006', orderedOn: daysFromToday(-1), deliveryOn: daysFromToday(1), status: 'awaiting', items: [makeItem(1, 1), makeItem(3, 2)] },
            { id: 'DEMO-1007', orderedOn: daysFromToday(0), deliveryOn: daysFromToday(2), status: 'preparing', items: [makeItem(5, 2)] },
            { id: 'DEMO-1008', orderedOn: daysFromToday(0), deliveryOn: daysFromToday(3), status: 'preparing', items: [makeItem(8, 1)] }
        ];
    }

    const state = {
        orders: createSampleOrders(),
        query: '',
        status: 'all',
        sort: 'newest',
        expanded: new Set(),
        pendingCancel: null
    };

    /* ---------- calculations and helpers ---------- */

    function bouquetName(bouquetId) {
        const bouquet = BOUQUETS.find((entry) => entry.id === bouquetId);
        return bouquet ? bouquet.name : 'Unknown bouquet';
    }

    function calculateLineTotal(item) {
        return item.unitPrice * item.quantity;
    }

    function calculateOrderTotal(order) {
        return order.items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    }

    function calculateTotalQuantity(order) {
        return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    function describeItems(order) {
        return order.items.map((item) => bouquetName(item.bouquetId) + ' \u00D7 ' + item.quantity).join(', ');
    }

    function isActive(order) {
        return order.status === 'preparing' || order.status === 'awaiting';
    }

    function statusLabel(status) {
        switch (status) {
            case 'preparing':
                return 'Preparing';
            case 'awaiting':
                return 'Awaiting delivery';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }

    function statusBadgeClass(status) {
        switch (status) {
            case 'preparing':
                return 'badge text-bg-primary';
            case 'awaiting':
                return 'badge text-bg-warning';
            case 'delivered':
                return 'badge text-bg-success';
            default:
                return 'badge text-bg-secondary';
        }
    }

    function pluralize(count, word) {
        return count + ' ' + word + (count === 1 ? '' : 's');
    }

    function matchesStatus(order, status) {
        if (status === 'all') {
            return true;
        }
        if (status === 'active') {
            return isActive(order);
        }
        return order.status === status;
    }

    function filterOrders(orders, query, status) {
        const needle = query.trim().toLowerCase();
        return orders.filter((order) => {
            const haystack = (order.id + ' ' + describeItems(order)).toLowerCase();
            return matchesStatus(order, status) && (needle === '' || haystack.includes(needle));
        });
    }

    function sortOrders(orders, mode) {
        const copy = orders.slice();
        switch (mode) {
            case 'oldest':
                return copy.sort((a, b) => a.orderedOn - b.orderedOn);
            case 'total-high':
                return copy.sort((a, b) => calculateOrderTotal(b) - calculateOrderTotal(a));
            case 'total-low':
                return copy.sort((a, b) => calculateOrderTotal(a) - calculateOrderTotal(b));
            default:
                return copy.sort((a, b) => b.orderedOn - a.orderedOn || b.id.localeCompare(a.id));
        }
    }

    function getDisplayName(username) {
        const trimmed = username.trim();
        const name = trimmed.includes('@') ? trimmed.slice(0, trimmed.indexOf('@')) : trimmed;
        return name === '' ? 'guest' : name;
    }

    /* ---------- controls built by JavaScript inside the "Order history" section ---------- */

    const searchInput = createEl('input', {
        className: 'form-control',
        attrs: { type: 'search', id: 'orderSearch', placeholder: 'Order # or bouquet name', autocomplete: 'off' }
    });
    const statusSelect = createEl('select', { className: 'form-select', attrs: { id: 'orderStatusFilter' } });
    STATUS_FILTERS.forEach((pair) => statusSelect.append(createEl('option', { text: pair[1], attrs: { value: pair[0] } })));
    const sortSelect = createEl('select', { className: 'form-select', attrs: { id: 'orderSort' } });
    SORT_OPTIONS.forEach((pair) => sortSelect.append(createEl('option', { text: pair[1], attrs: { value: pair[0] } })));
    const resetButton = createButton('Reset', 'btn btn-outline-secondary w-100');

    const controlsRow = createEl('div', { className: 'row g-2 align-items-end mb-3' });
    const resetColumn = createEl('div', { className: 'col-6 col-md-2' });
    resetColumn.append(resetButton);
    controlsRow.append(
        createLabeledControl('Search orders', searchInput, 'col-12 col-md-4'),
        createLabeledControl('Status', statusSelect, 'col-6 col-md-3'),
        createLabeledControl('Sort by', sortSelect, 'col-6 col-md-3'),
        resetColumn
    );
    const countLine = createEl('p', { className: 'small text-muted mb-2', attrs: { role: 'status', 'aria-live': 'polite' } });
    const notice = createEl('div', { attrs: { role: 'status', 'aria-live': 'polite' } });

    const tableWrapper = tbody.closest('.table-responsive');
    const historySection = tbody.closest('section') || dashboardView;
    if (tableWrapper && tableWrapper.parentElement) {
        tableWrapper.before(controlsRow, countLine, notice);
    } else {
        historySection.append(controlsRow, countLine, notice);
    }

    // Honest demo notices (the frozen HTML cannot be edited, so they are added here).
    const dashboardIntro = dashboardView.querySelector('p.text-muted');
    const dashboardNotice = createEl('div', {
        className: 'alert alert-warning',
        text: 'Demonstration data: this page is not connected to a server or an order system. ' +
            'The orders below are sample records built from our bouquet catalogue so you can try searching, ' +
            'filtering and opening order details. They are not your real orders.',
        attrs: { role: 'note' }
    });
    if (dashboardIntro) {
        dashboardIntro.after(dashboardNotice);
    } else {
        dashboardView.prepend(dashboardNotice);
    }
    const loginIntro = loginView.querySelector('p');
    const loginNotice = createEl('div', {
        className: 'alert alert-info small',
        text: 'Demonstration mode: there is no account system. Entering details only opens a view with sample ' +
            'orders. Your password is not checked, sent or saved.',
        attrs: { role: 'note' }
    });
    if (loginIntro) {
        loginIntro.after(loginNotice);
    } else {
        loginView.prepend(loginNotice);
    }

    /* ---------- rendering ---------- */

    function createFullRow(content) {
        const row = createEl('tr');
        const cell = createEl('td', { className: 'text-center text-muted py-4', attrs: { colspan: String(TABLE_COLUMNS) } });
        cell.append(...content);
        row.append(cell);
        return row;
    }

    function createOrderRow(order) {
        const isOpen = state.expanded.has(order.id);
        const row = createEl('tr');

        const toggle = createButton(
            (isOpen ? '\u25BE ' : '\u25B8 ') + order.id,
            'btn btn-link p-0 fw-semibold text-decoration-none',
            {
                'data-action': 'toggle',
                'data-order-id': order.id,
                'aria-expanded': String(isOpen),
                'aria-label': (isOpen ? 'Hide' : 'Show') + ' details for order ' + order.id
            }
        );
        if (isOpen) {
            toggle.setAttribute('aria-controls', 'detail-' + order.id);
        }
        const idCell = createEl('td');
        idCell.append(toggle);

        const badgeCell = createEl('td');
        badgeCell.append(createEl('span', { className: statusBadgeClass(order.status), text: statusLabel(order.status) }));

        row.append(
            idCell,
            createEl('td', { text: describeItems(order) }),
            createEl('td', { text: formatDate(order.orderedOn) }),
            createEl('td', { text: order.status === 'cancelled' ? '\u2014' : formatDate(order.deliveryOn) }),
            badgeCell,
            createEl('td', { className: 'text-end', text: formatPrice(calculateOrderTotal(order)) })
        );
        return row;
    }

    function createCancelControls(order) {
        const box = createEl('div');
        if (order.status !== 'preparing') {
            box.append(createEl('p', { className: 'small text-muted mb-0', text: 'Only orders that are still being prepared can be cancelled.' }));
            return box;
        }
        if (state.pendingCancel === order.id) {
            box.append(createEl('p', { className: 'fw-semibold mb-2', text: 'Cancel order ' + order.id + '? This only changes the demonstration data.' }));
            const bar = createEl('div', { className: 'd-flex flex-wrap gap-2' });
            bar.append(
                createButton('Yes, cancel order', 'btn btn-danger btn-sm', { 'data-action': 'cancel-confirm', 'data-order-id': order.id }),
                createButton('Keep order', 'btn btn-outline-secondary btn-sm', { 'data-action': 'cancel-keep', 'data-order-id': order.id })
            );
            box.append(bar);
        } else {
            box.append(createButton('Cancel order', 'btn btn-outline-danger btn-sm', { 'data-action': 'cancel-ask', 'data-order-id': order.id }));
        }
        return box;
    }

    function createDetailRow(order) {
        const row = createEl('tr', { attrs: { id: 'detail-' + order.id } });
        const cell = createEl('td', { className: 'bg-light', attrs: { colspan: String(TABLE_COLUMNS) } });
        cell.append(createEl('h4', { className: 'fs-6 text-primary', text: 'Order ' + order.id + ' \u2013 details' }));

        const list = createEl('ul', { className: 'list-unstyled mb-2' });
        order.items.forEach((item) => {
            const bouquet = BOUQUETS.find((entry) => entry.id === item.bouquetId);
            const stockNote = bouquet && !bouquet.inStock ? ' (currently out of stock)' : '';
            list.append(createEl('li', {
                text: bouquetName(item.bouquetId) + ': ' + item.quantity + ' \u00D7 ' + formatPrice(item.unitPrice) +
                    ' = ' + formatPrice(calculateLineTotal(item)) + stockNote
            }));
        });
        cell.append(list);
        cell.append(createEl('p', {
            className: 'fw-semibold mb-3',
            text: 'Total: ' + formatPrice(calculateOrderTotal(order)) + ' (' + pluralize(calculateTotalQuantity(order), 'bouquet') + ')'
        }));
        cell.append(createCancelControls(order));
        row.append(cell);
        return row;
    }

    function updateSummary() {
        activeCount.textContent = String(state.orders.filter(isActive).length);
        awaitingCount.textContent = String(state.orders.filter((order) => order.status === 'awaiting').length);
        completedCount.textContent = String(state.orders.filter((order) => order.status === 'delivered').length);
    }

    function updateCountLine(visible) {
        const value = visible
            .filter((order) => order.status !== 'cancelled')
            .reduce((sum, order) => sum + calculateOrderTotal(order), 0);
        countLine.textContent = 'Showing ' + visible.length + ' of ' + pluralize(state.orders.length, 'order') +
            '. Value of shown orders (cancelled excluded): ' + formatPrice(value) + '.';
    }

    // focusRequest = { orderId, action } - keeps keyboard focus after the table is rebuilt.
    function render(focusRequest) {
        const visible = sortOrders(filterOrders(state.orders, state.query, state.status), state.sort);
        const rows = [];

        if (state.orders.length === 0) {
            const link = createEl('a', { className: 'link-primary', text: 'Place an order', attrs: { href: 'order.html' } });
            rows.push(createFullRow(['No orders yet. ', link, '.']));
        } else if (visible.length === 0) {
            rows.push(createFullRow([
                createEl('p', { className: 'mb-2', text: 'No orders match your search and filters.' }),
                createButton('Reset search and filters', 'btn btn-outline-primary btn-sm', { 'data-action': 'reset-filters' })
            ]));
        } else {
            visible.forEach((order) => {
                rows.push(createOrderRow(order));
                if (state.expanded.has(order.id)) {
                    rows.push(createDetailRow(order));
                }
            });
        }

        tbody.replaceChildren(...rows);
        updateCountLine(visible);
        updateSummary();

        if (focusRequest) {
            const selector = 'button[data-action="' + focusRequest.action + '"][data-order-id="' + focusRequest.orderId + '"]';
            const target = tbody.querySelector(selector);
            if (target) {
                target.focus();
            }
        }
    }

    function resetFilters() {
        searchInput.value = '';
        statusSelect.value = 'all';
        sortSelect.value = 'newest';
        state.query = '';
        state.status = 'all';
        state.sort = 'newest';
        state.expanded.clear();
        state.pendingCancel = null;
        notice.replaceChildren();
        render();
    }

    /* ---------- order actions ---------- */

    function findOrder(orderId) {
        return state.orders.find((order) => order.id === orderId);
    }

    function handleAction(action, orderId) {
        const order = findOrder(orderId);
        switch (action) {
            case 'toggle':
                if (state.expanded.has(orderId)) {
                    state.expanded.delete(orderId);
                    if (state.pendingCancel === orderId) {
                        state.pendingCancel = null;
                    }
                } else {
                    state.expanded.add(orderId);
                }
                render({ orderId: orderId, action: 'toggle' });
                break;
            case 'cancel-ask':
                if (order && order.status === 'preparing') {
                    state.pendingCancel = orderId;
                    render({ orderId: orderId, action: 'cancel-keep' });
                }
                break;
            case 'cancel-keep':
                state.pendingCancel = null;
                render({ orderId: orderId, action: 'cancel-ask' });
                break;
            case 'cancel-confirm':
                state.pendingCancel = null;
                if (order && order.status === 'preparing') {
                    order.status = 'cancelled';
                    renderAlert(notice, {
                        kind: 'success',
                        title: 'Order ' + orderId + ' marked as cancelled',
                        message: 'This is a demonstration: nothing was sent to a server. The counters above were updated.'
                    });
                } else {
                    renderAlert(notice, {
                        kind: 'info',
                        title: 'Nothing changed',
                        message: 'Order ' + orderId + ' can no longer be cancelled.'
                    });
                }
                render({ orderId: orderId, action: 'toggle' });
                break;
            case 'reset-filters':
                resetFilters();
                searchInput.focus();
                break;
            default:
                break;
        }
    }

    tbody.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (button) {
            handleAction(button.dataset.action, button.dataset.orderId);
        }
    });

    searchInput.addEventListener('input', () => {
        state.query = searchInput.value;
        render();
    });
    statusSelect.addEventListener('change', () => {
        state.status = statusSelect.value;
        render();
    });
    sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        render();
    });
    resetButton.addEventListener('click', resetFilters);

    /* ---------- demo login / logout (no real authentication) ---------- */

    function validateLogin(username, password) {
        const errors = {};
        const trimmed = username.trim();
        if (trimmed === '') {
            errors.username = 'Enter your name or email.';
        } else if (trimmed.length < 3) {
            errors.username = 'Name or email must be at least 3 characters.';
        } else if (trimmed.includes('@') && Validators.checkEmail(trimmed) !== '') {
            errors.username = 'This looks like an email address, but it is not valid.';
        }
        if (password.length === 0) {
            errors.password = 'Enter a password.';
        } else if (password.length < 8) {
            errors.password = 'Password must have at least 8 characters (same rule as registration).';
        }
        return errors;
    }

    function applyLoginResult(input, message) {
        if (message) {
            setFieldError(input, message);
        } else {
            setFieldValid(input);
        }
    }

    function showDashboard(username) {
        customerName.textContent = getDisplayName(username);
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        render();
        const heading = dashboardView.querySelector('h2');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
        }
    }

    function attemptLogin() {
        const errors = validateLogin(usernameInput.value, passwordInput.value);
        applyLoginResult(usernameInput, errors.username);
        applyLoginResult(passwordInput, errors.password);
        if (errors.username || errors.password) {
            renderAlert(loginResult, {
                kind: 'danger',
                title: 'Please correct the marked fields',
                message: 'The demonstration view was not opened.'
            });
            focusFirstInvalid(loginForm);
            return;
        }
        const username = usernameInput.value;
        passwordInput.value = ''; // the password is never kept
        loginResult.replaceChildren();
        clearFieldState(usernameInput);
        clearFieldState(passwordInput);
        showDashboard(username);
    }

    function handleLoginFieldInput(event) {
        clearFieldState(event.target);
        loginResult.replaceChildren();
    }

    function logout() {
        state.orders = createSampleOrders();
        resetFilters();
        usernameInput.value = '';
        passwordInput.value = '';
        clearFieldState(usernameInput);
        clearFieldState(passwordInput);
        loginResult.replaceChildren();
        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
        usernameInput.focus();
    }

    loginButton.addEventListener('click', attemptLogin);
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        attemptLogin();
    });
    [usernameInput, passwordInput].forEach((input) => {
        input.addEventListener('input', handleLoginFieldInput);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                attemptLogin();
            }
        });
    });
    logoutButton.addEventListener('click', logout);

    /* ---------- initial state ---------- */

    // base.css defines .hidden but not .is-hidden, so hide the dashboard until the demo view is opened.
    dashboardView.classList.add('hidden');
    render();
})();
