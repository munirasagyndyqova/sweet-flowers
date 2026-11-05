
'use strict';

$(function() {

    const $form = $('form').first();

    if (!$form.length) return;

    const $flowers = $('#flowers');
    const $quantity = $('#quantity');
    const $date = $('#date');
    const $message = $('#order-message');
    const $name = $('#name');
    const $address = $('#address');

    if (
        !$flowers.length ||
        !$quantity.length ||
        !$date.length ||
        !$message.length
    ) return;

    // Create total price display
    const $totalContainer = $('<div>', {
        class: 'alert alert-info mt-4 fs-5 fw-bold text-center',
        text: 'Total: 0 ₸'
    });

    const $buttonGroup = $form.find('.border-top').first();

    if ($buttonGroup.length) {
        $totalContainer.insertBefore($buttonGroup);
    } else {
        $form.append($totalContainer);
    }

    // Calculate total price
    function updateTotal() {

        const category = $flowers.val();
        const qty = parseInt($quantity.val(), 10) || 0;

        const bouquet = BOUQUETS.find(function(item) {
            return item.category === category;
        });

        let total = 0;

        if (bouquet && qty > 0) {
            total = bouquet.price * qty;
        }

        $totalContainer.text(
            'Total: ' + formatPrice(total)
        );

        return total;
    }

    // Update total when values change
    $flowers.on('change', updateTotal);
    $quantity.on('input', updateTotal);

    updateTotal();

    // Show validation error
    function showError($input, message) {

        $input.addClass('is-invalid');

        const $error = $('<div>', {
            class: 'text-danger small mt-1 error-msg',
            text: message
        });

        $input.after($error);
    }

    // Clear validation errors
    function clearFormErrors() {

        $form.find('.error-msg').remove();
        $form.find('.is-invalid').removeClass('is-invalid');
    }

    // Handle order submission
    $form.on('submit', function(event) {

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

        const customerName = $name.val().trim();
        const customerAddress = $address.val().trim();

        const quantity = Number($quantity.val());
        const selectedDate = $date.val();

        // Validate name
        validate(
            $name,
            customerName.length < 2,
            'Please enter a valid full name.'
        );

        // Validate address
        validate(
            $address,
            customerAddress.length < 5,
            'Please enter a valid delivery address.'
        );

        // Validate quantity
        validate(
            $quantity,
            !Number.isInteger(quantity) || quantity < 1,
            'Quantity must be at least 1.'
        );

        // Validate flower selection
        const selectedBouquet = BOUQUETS.find(function(item) {
            return item.category === $flowers.val();
        });

        validate(
            $flowers,
            !selectedBouquet,
            'Please select a valid flower.'
        );

        // Validate delivery date
        if (!selectedDate) {

            validate(
                $date,
                true,
                'Please select a delivery date.'
            );

        } else {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deliveryDate = new Date(selectedDate + 'T00:00:00');

            validate(
                $date,
                deliveryDate < today,
                'Delivery date cannot be in the past.'
            );
        }

        // Stop if form is invalid
        if (!isValid) {
            $firstInvalid.trigger('focus');
            return;
        }

        const total = updateTotal();

        const chosenFlower = $flowers
            .find('option:selected')
            .text();

        // Hide form using jQuery
        $form.fadeOut(300, function() {

            // Create confirmation title
            const $title = $('<h4>', {
                class: 'alert-heading fw-bold',
                text: 'Thank you for your order, ' + customerName + '!'
            });

            // Create order summary
            const $summary = $('<p>', {
                text:
                    'You selected ' +
                    quantity + 'x ' +
                    chosenFlower +
                    '. Total price: ' +
                    formatPrice(total) + '.'
            });

            // Create delivery information
            const $delivery = $('<p>', {
                text:
                    'Delivery scheduled for ' +
                    selectedDate +
                    ' to: ' +
                    customerAddress + '.'
            });

            // Demo warning
            const $divider = $('<hr>');

            const $warning = $('<p>', {
                class: 'mb-0 small text-muted fw-bold',
                text: '*This is a front-end demonstration. No data was sent to a server and no real payment was processed.'
            });

            // Display confirmation
            $message
                .empty()
                .removeClass('hidden d-none')
                .addClass('alert-success d-block')
                .append(
                    $title,
                    $summary,
                    $delivery,
                    $divider,
                    $warning
                )
                .hide()
                .fadeIn(500);

        });

    });

});
