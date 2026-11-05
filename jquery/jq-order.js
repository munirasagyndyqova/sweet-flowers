
'use strict';

$(function () {

    const $form = $('#flowers').closest('form');

    if (!$form.length) return;

    const $flowers = $('#flowers');
    const $quantity = $('#quantity');
    const $date = $('#date');
    const $name = $('#name');
    const $address = $('#address');
    const $message = $('#order-message');

    // Find existing Total blocks instead of creating new ones
    let $totalContainer = $('#total-price');

    if (!$totalContainer.length) {
        $totalContainer = $form.find('.alert-info').filter(function () {
            return $(this).text().trim().startsWith('Total:');
        }).first();
    }

    // Remove duplicate Total blocks
    $form.find('.alert-info').filter(function () {
        return $(this).text().trim().startsWith('Total:');
    }).not($totalContainer).remove();

    // Create Total only if it does not exist
    if (!$totalContainer.length) {
        $totalContainer = $('<div>', {
            id: 'total-price',
            class: 'alert alert-info mt-4 fs-5 fw-bold text-center',
            text: 'Total: 0 ₸'
        });

        const $buttons = $form.find('.border-top').last();

        if ($buttons.length) {
            $totalContainer.insertBefore($buttons);
        } else {
            $form.append($totalContainer);
        }
    }

    // Format total price
    function updateTotal() {

        const selectedValue = String($flowers.val() || '').toLowerCase().trim();
        const quantity = Number($quantity.val()) || 0;

        const bouquet = BOUQUETS.find(function (item) {

            return (
                item.category.toLowerCase() === selectedValue ||
                item.name.toLowerCase() === selectedValue ||
                String(item.id) === selectedValue
            );
        });

        let total = 0;

        if (bouquet && quantity > 0) {
            total = bouquet.price * quantity;
        }

        $totalContainer.text('Total: ' + formatPrice(total));

        return total;
    }

    // Recalculate when flower or quantity changes
    $flowers.on('change', updateTotal);
    $quantity.on('input change', updateTotal);

    updateTotal();

    // Show validation errors
    function showError($input, message) {

        $input.addClass('is-invalid');

        $('<div>', {
            class: 'text-danger small mt-1 error-msg',
            text: message
        }).insertAfter($input);
    }

    // Remove old errors
    function clearFormErrors() {

        $form.find('.error-msg').remove();
        $form.find('.is-invalid').removeClass('is-invalid');
    }

    // Submit order
    $form.on('submit', function (event) {

        event.preventDefault();

        clearFormErrors();

        let isValid = true;
        let $firstInvalid = null;

        function validate($input, condition, message) {

            if (condition) {

                showError($input, message);

                if (!$firstInvalid) {
                    $firstInvalid = $input;
                }

                isValid = false;
            }
        }

        const customerName = String($name.val() || '').trim();
        const customerAddress = String($address.val() || '').trim();
        const quantity = Number($quantity.val());
        const selectedDate = $date.val();

        // Name validation
        validate(
            $name,
            customerName.length < 2,
            'Please enter a valid full name.'
        );

        // Address validation
        validate(
            $address,
            customerAddress.length < 5,
            'Please enter a valid delivery address.'
        );

        // Quantity validation
        validate(
            $quantity,
            !Number.isInteger(quantity) || quantity < 1,
            'Quantity must be at least 1.'
        );

        // Flower validation
        const selectedValue = String($flowers.val() || '').toLowerCase().trim();

        const selectedBouquet = BOUQUETS.find(function (item) {
            return (
                item.category.toLowerCase() === selectedValue ||
                item.name.toLowerCase() === selectedValue ||
                String(item.id) === selectedValue
            );
        });

        validate(
            $flowers,
            !selectedBouquet,
            'Please select a valid flower.'
        );

        // Date validation
        if (!selectedDate) {

            validate(
                $date,
                true,
                'Please select a delivery date.'
            );

        } else {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deliveryDate = new Date(
                selectedDate + 'T00:00:00'
            );

            validate(
                $date,
                deliveryDate < today,
                'Delivery date cannot be in the past.'
            );
        }

        if (!isValid) {

            if ($firstInvalid) {
                $firstInvalid.trigger('focus');
            }

            return;
        }

        // Final price
        const total = updateTotal();

        const chosenFlower = $flowers
            .find('option:selected')
            .text();

        // Hide order form
        $form.fadeOut(300, function () {

            const $title = $('<h4>', {
                class: 'alert-heading fw-bold',
                text: 'Thank you for your order, ' + customerName + '!'
            });

            const $summary = $('<p>', {
                text:
                    'You selected ' +
                    quantity + 'x ' +
                    chosenFlower +
                    '. Total price: ' +
                    formatPrice(total) + '.'
            });

            const $delivery = $('<p>', {
                text:
                    'Delivery scheduled for ' +
                    selectedDate +
                    ' to: ' +
                    customerAddress + '.'
            });

            const $warning = $('<p>', {
                class: 'mb-0 small text-muted fw-bold',
                text: '*This is a front-end demonstration. No real payment was processed.'
            });

            $message
                .empty()
                .removeClass('hidden d-none')
                .addClass('alert-success d-block')
                .append(
                    $title,
                    $summary,
                    $delivery,
                    $('<hr>'),
                    $warning
                )
                .hide()
                .fadeIn(500);
        });
    });

});
