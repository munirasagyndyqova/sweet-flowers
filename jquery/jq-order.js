
'use strict';

$(function () {

    const $form = $('#flowers').closest('form');

    if (!$form.length) return;

    const $flowers = $('#flowers');
    const $quantity = $('#quantity');
    const $date = $('#date');
    const $time = $('#time');
    const $name = $('#name');
    const $phone = $('#phone');
    const $email = $('#email');
    const $address = $('#address');
    const $message = $('#order-message');
    const $promoButton = $('#promo-btn');

    const $buttons = $form.find('button[type="submit"]')
        .closest('.border-top');

    // -----------------------------
    // 1. BOUQUET DATA
    // -----------------------------

    const prices = {
        roses: 12500,
        tulips: 9500,
        peonies: 16500,
        mixed: 14500
    };

    function formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
    }

    // -----------------------------
    // 2. REMOVE DUPLICATE TOTALS
    // -----------------------------

    // Remove old Total blocks
    $form.find('.alert-info').filter(function () {
        return $(this).text().trim().startsWith('Total:');
    }).remove();

    $form.find('#total-price').remove();

    // Create ONLY ONE Total
    const $total = $('<div>', {
        id: 'total-price',
        class: 'alert alert-info mt-4 fs-5 fw-bold text-center'
    });

    $total.insertBefore($buttons);

    // -----------------------------
    // 3. PROMO CODES
    // -----------------------------

    const promoCodes = {
        SWEET10: 10,
        FLOWERS20: 20
    };

    let activeDiscount = 0;
    let appliedCode = '';

    const $promoInput = $('<input>', {
        type: 'text',
        id: 'promo-code',
        class: 'form-control mt-3',
        placeholder: 'Enter promo code'
    }).hide();

    const $promoResult = $('<div>', {
        class: 'small mt-2'
    }).hide();

    $buttons.before($promoInput, $promoResult);

    // -----------------------------
    // 4. CALCULATE TOTAL
    // -----------------------------

    function calculateTotal() {

        const flower = String($flowers.val() || '');
        const quantity = Number($quantity.val());

        const price = prices[flower] || 0;

        const validQuantity =
            Number.isInteger(quantity) &&
            quantity >= 1 &&
            quantity <= 20;

        const subtotal = validQuantity
            ? price * quantity
            : 0;

        const discountAmount = Math.round(
            subtotal * activeDiscount / 100
        );

        const total = subtotal - discountAmount;

        if (activeDiscount > 0) {

            $total.text(
                'Subtotal: ' + formatMoney(subtotal) +
                ' | Discount: -' + formatMoney(discountAmount) +
                ' | Total: ' + formatMoney(total)
            );

        } else {

            $total.text(
                'Total: ' + formatMoney(total)
            );
        }

        return total;
    }

    // Update price when bouquet or quantity changes
    $flowers.on('change', calculateTotal);

    $quantity.on('input change', calculateTotal);

    // Select bouquet from catalog link
    const requestedFlower = new URLSearchParams(
        window.location.search
    ).get('flower');

    if (
        requestedFlower &&
        Object.prototype.hasOwnProperty.call(prices, requestedFlower)
    ) {
        $flowers.val(requestedFlower);
    }

    calculateTotal();

    // -----------------------------
    // 5. APPLY PROMO CODE
    // -----------------------------

    $promoButton.on('click', function () {

        if (!$promoInput.is(':visible')) {

            $promoInput.slideDown(250);
            $promoButton.text('Apply Code');
            return;
        }

        const code = String($promoInput.val() || '')
            .trim()
            .toUpperCase();

        if (
            Object.prototype.hasOwnProperty.call(
                promoCodes,
                code
            )
        ) {

            activeDiscount = promoCodes[code];
            appliedCode = code;

            $promoResult
                .removeClass('text-danger')
                .addClass('text-success')
                .text(
                    'Promo applied! ' +
                    activeDiscount + '% discount.'
                )
                .stop(true, true)
                .hide()
                .fadeIn(300);

            $promoButton.text('Promo Applied');

        } else {

            activeDiscount = 0;
            appliedCode = '';

            $promoResult
                .removeClass('text-success')
                .addClass('text-danger')
                .text('Invalid promo code.')
                .stop(true, true)
                .hide()
                .fadeIn(300);

            $promoButton.text('Apply Code');
        }

        calculateTotal();
    });

    // Remove discount if promo text changes
    $promoInput.on('input', function () {

        activeDiscount = 0;
        appliedCode = '';

        $promoResult.hide();
        $promoButton.text('Apply Code');

        calculateTotal();
    });

    // -----------------------------
    // 6. FORM VALIDATION
    // -----------------------------

    function showError($input, text) {

        $input.addClass('is-invalid');

        $('<div>', {
            class: 'text-danger small mt-1 error-msg',
            text: text
        }).insertAfter($input);
    }

    function clearErrors() {

        $form.find('.error-msg').remove();

        $form.find('.is-invalid')
            .removeClass('is-invalid');
    }

    // Clear field error when user edits it
    $form.on('input change', 'input, select, textarea', function () {

        $(this).removeClass('is-invalid');

        $(this).siblings('.error-msg').remove();
    });

    function validateForm() {

        clearErrors();

        let valid = true;
        let $firstInvalid = null;

        function check($input, condition, errorText) {

            if (condition) {

                showError($input, errorText);

                if (!$firstInvalid) {
                    $firstInvalid = $input;
                }

                valid = false;
            }
        }

        const name = String($name.val() || '').trim();
        const phone = String($phone.val() || '').trim();
        const email = String($email.val() || '').trim();
        const address = String($address.val() || '').trim();

        const quantity = Number($quantity.val());
        const flower = String($flowers.val() || '');

        const digits = phone.replace(/\D/g, '');

        // Name
        check(
            $name,
            name.length < 2,
            'Enter your full name.'
        );

        // Phone
        check(
            $phone,
            !/^\+?[\d\s()-]{10,20}$/.test(phone) ||
            digits.length < 10 ||
            digits.length > 15,
            'Enter a valid phone number.'
        );

        // Email (optional, but must be valid if provided)
        check(
            $email,
            email !== '' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            'Enter a valid email address.'
        );

        // Bouquet
        check(
            $flowers,
            !Object.prototype.hasOwnProperty.call(
                prices,
                flower
            ),
            'Select a valid bouquet.'
        );

        // Quantity
        check(
            $quantity,
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 20,
            'Quantity must be between 1 and 20.'
        );

        // Address
        check(
            $address,
            address.length < 5,
            'Enter a valid delivery address.'
        );

        // Date
        const now = new Date();

        const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');

        check(
            $date,
            !$date.val() || $date.val() < today,
            'Select today or a future delivery date.'
        );

        // Time
        check(
            $time,
            !/^\d{2}:\d{2}$/.test(String($time.val() || '')),
            'Select a delivery time.'
        );

        if (!valid && $firstInvalid) {
            $firstInvalid.trigger('focus');
        }

        return valid;
    }

    // -----------------------------
    // 7. RESET FORM
    // -----------------------------

    $form.on('reset', function () {

        window.setTimeout(function () {

            clearErrors();

            activeDiscount = 0;
            appliedCode = '';

            $promoInput.val('').hide();
            $promoResult.hide();

            $promoButton.text('Apply Promo');

            $message.empty().addClass('hidden');

            calculateTotal();

        }, 0);
    });

    // -----------------------------
    // 8. SUBMIT ORDER
    // -----------------------------

    $form.on('submit', function (event) {

        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const flower = String($flowers.val());
        const quantity = Number($quantity.val());

        const total = calculateTotal();

        const order = {
            id: 'SF-' + Date.now(),
            name: String($name.val()).trim(),
            phone: String($phone.val()).trim(),
            email: String($email.val()).trim(),
            flower: flower,
            quantity: quantity,
            total: total,
            promoCode: appliedCode,
            address: String($address.val()).trim(),
            date: String($date.val()),
            time: String($time.val()),
            payment: String(
                $form.find('input[name="payment"]:checked').val()
            ),
            note: String($('#message').val() || '').trim()
        };

        // Save demo order
        try {

            const saved = JSON.parse(
                localStorage.getItem('sf_orders') || '[]'
            );

            const orders = Array.isArray(saved)
                ? saved
                : [];

            orders.push(order);

            localStorage.setItem(
                'sf_orders',
                JSON.stringify(orders)
            );

        } catch (error) {
            // Order confirmation works without storage
        }

        // Create confirmation
        const $confirmation = $('<div>', {
            class: 'alert alert-success'
        });

        $('<h4>', {
            class: 'fw-bold',
            text: 'Order placed successfully!'
        }).appendTo($confirmation);

        $('<p>', {
            text: 'Order ID: ' + order.id
        }).appendTo($confirmation);

        $('<p>', {
            text:
                quantity + ' × ' + flower +
                ' — ' + formatMoney(total)
        }).appendTo($confirmation);

        if (activeDiscount > 0) {

            $('<p>', {
                text:
                    'Promo code: ' +
                    appliedCode +
                    ' (' + activeDiscount + '% off)'
            }).appendTo($confirmation);
        }

        $('<p>', {
            text:
                'Delivery: ' +
                order.date + ' at ' +
                order.time + ', ' +
                order.address
        }).appendTo($confirmation);

        $('<p>', {
            class: 'small mb-0',
            text:
                'Demo order only. No real payment or delivery was processed.'
        }).appendTo($confirmation);

        // Show result without hiding its parent form
        $message
            .empty()
            .removeClass('hidden d-none')
            .append($confirmation)
            .hide()
            .fadeIn(350);

        $form.children('fieldset').slideUp(300);

        $total.slideUp(300);

        $promoInput.slideUp(300);
        $promoResult.slideUp(300);
        $buttons.slideUp(300);

    });

});
