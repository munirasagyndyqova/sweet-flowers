

$(function () {
    const $flowerList = $('#flower-list, #catalog');

    if ($flowerList.length) {
        $.each(BOUQUETS, function (_, flower) {
            const statusClass = flower.inStock ? 'badge bg-success' : 'badge bg-secondary';
            const statusText = flower.inStock ? 'In Stock' : 'Out of Stock';

            const $card = $('<div>').addClass('col-md-4 mb-4').html(`
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body d-flex flex-column">
                        <span class="${statusClass} align-self-start mb-2">${statusText}</span>
                        <h5 class="card-title fw-bold text-primary">${flower.name}</h5>
                        <p class="card-text text-muted mb-4">Category: ${flower.category}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="fs-5 fw-bold">${formatPrice(flower.price)}</span>
                            <button type="button" class="btn btn-outline-primary buy-btn" data-id="${flower.id}" ${!flower.inStock ? 'disabled' : ''}>
                                Select
                            </button>
                        </div>
                    </div>
                </div>
            `);

            $flowerList.append($card);
        });

        $flowerList.on('click', '.buy-btn', function () {
            const flowerId = $(this).attr('data-id');
            const selectedFlower = BOUQUETS.find(b => b.id == flowerId);

            if (selectedFlower && $('#flowers').length) {
                $('#flowers')
                    .val(selectedFlower.category)
                    .trigger('change')
                    .closest('.card, form')
                    .addClass('border-primary');
            }
        });
    }

    const $aboutSections = $('.bg-white.p-4.rounded.shadow-sm');

    if ($aboutSections.length >= 2) {
        const $targetSection = $aboutSections.eq(1);

        const facts = [
            "Did you know? Peonies can live up to 100 years!",
            "Florist tip: Change the water in your vase every 2 days.",
            "Secret: Tulips continue to grow even after being cut.",
            "Fun fact: Roses are one of the oldest flowers, dating back 35 million years.",
            "Tip: Keep your bouquet away from direct sunlight and fresh fruit."
        ];

        const $factBtn = $('<button>')
            .addClass('btn btn-outline-primary w-100 mt-3')
            .text('Get a Secret Florist Tip');

        const $factDisplay = $('<div>')
            .addClass('alert alert-info mt-3 mb-0 fst-italic text-center')
            .hide();

        $targetSection.append($factBtn, $factDisplay);

        $factBtn.on('click', function () {
            const randomIndex = Math.floor(Math.random() * facts.length);

            $factDisplay
                .text(facts[randomIndex])
                .stop(true, true)
                .fadeIn(300);

            $(this).text('Get Another Tip');
        });
    }

    const $table = $('.table-bordered');

    if ($table.length) {
        const $container = $table.parent();

        const deliveryZones = [
            { id: 'esil', name: 'Esil District', price: 1500 },
            { id: 'almaty', name: 'Almaty District', price: 1200 },
            { id: 'saryarka', name: 'Saryarka District', price: 1000 },
            { id: 'baikonyr', name: 'Baikonyr District', price: 1300 },
            { id: 'nura', name: 'Nura District', price: 1800 }
        ];

        const $calcWrapper = $('<div>').addClass('mt-4 border-top pt-3');
        const $label = $('<label>').addClass('form-label fw-bold text-primary').text('Calculate Delivery to Your District:');
        const $select = $('<select>').addClass('form-select mb-3').append($('<option>').val('').text('Select district...'));

        $.each(deliveryZones, function (_, zone) {
            $select.append($('<option>').attr('value', zone.id).text(zone.name));
        });

        const $resultDisplay = $('<div>').addClass('alert alert-success fw-bold text-center mb-0').hide();

        $calcWrapper.append($label, $select, $resultDisplay).appendTo($container);

        $select.on('change', function () {
            const selectedId = $(this).val();

            if (!selectedId) {
                $resultDisplay.slideUp(200);
                return;
            }

            const zone = deliveryZones.find(z => z.id === selectedId);
            if (zone) {
                $resultDisplay.text(`Delivery Fee: ${formatPrice(zone.price)}`).slideDown(200);
            }
        });
    }

    const $orderForm = $('form');

    if ($orderForm.length && $('#flowers').length) {
        const $flowerSelect = $('#flowers');
        const $quantityInput = $('#quantity');
        const $dateInput = $('#date');
        const $orderMessage = $('#order-message');

        const $totalContainer = $('<div>')
            .addClass('alert alert-info mt-4 fs-5 fw-bold text-center')
            .text('Total: 0 ₸');

        $orderForm.find('.border-top, button[type="submit"]').first().before($totalContainer);

        function calculateTotal() {
            const selectedCategory = $flowerSelect.val();
            const qty = parseInt($quantityInput.val(), 10) || 1;
            const bouquet = BOUQUETS.find(b => b.category === selectedCategory);
            const total = bouquet ? bouquet.price * qty : 0;

            $totalContainer.text(`Total: ${formatPrice(total)}`);
            return total;
        }

        $flowerSelect.on('change', calculateTotal);
        $quantityInput.on('input keyup', calculateTotal);
        calculateTotal();

        $orderForm.on('input change', 'input, select', function () {
            $(this).removeClass('is-invalid');
            $(this).next('.error-msg').remove();
        });

        $orderForm.on('submit', function (e) {
            e.preventDefault();

            $('.error-msg').remove();
            $orderForm.find('.is-invalid').removeClass('is-invalid');

            let isValid = true;
            let $firstInvalid = null;

            function showError($input, message) {
                isValid = false;
                $input.addClass('is-invalid');
                $('<div>').addClass('text-danger small mt-1 error-msg').text(message).insertAfter($input);
                if (!$firstInvalid) $firstInvalid = $input;
            }

            const $nameInput = $('#name');
            if ($nameInput.length && $nameInput.val().trim().length < 2) {
                showError($nameInput, 'Please enter a valid full name (min 2 characters).');
            }

            const $emailInput = $('#email');
            if ($emailInput.length) {
                const emailVal = $emailInput.val().trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailVal)) {
                    showError($emailInput, 'Please enter a valid email address.');
                }
            }

            if ($dateInput.length) {
                const dateVal = $dateInput.val();
                if (dateVal) {
                    const selectedDate = new Date(dateVal);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                        showError($dateInput, 'Delivery date cannot be in the past.');
                    }
                } else {
                    showError($dateInput, 'Please select a delivery date.');
                }
            }

            if (!isValid) {
                $firstInvalid.focus();
                return;
            }

            const totalSum = calculateTotal();
            const chosenFlowerText = $flowerSelect.find('option:selected').text();
            const nameVal = $nameInput.length ? $nameInput.val().trim() : 'Customer';
            const addressText = $('#address').length ? $('#address').val().trim() : 'Address not specified';

            $orderForm.slideUp(400, function () {
                $orderMessage
                    .removeClass('hidden d-none')
                    .addClass('alert-success d-block')
                    .html(`
                        <h4 class="alert-heading fw-bold">Thank you for your order, ${nameVal}!</h4>
                        <p>You selected ${$quantityInput.val()}x ${chosenFlowerText}. Total price: ${formatPrice(totalSum)}.</p>
                        <p>Delivery scheduled for ${$dateInput.val()} to: ${addressText}.</p>
                        <hr>
                        <p class="mb-0 small text-muted fw-bold">*This is a front-end demonstration. No data was sent to a server.</p>
                    `)
                    .fadeIn(300);
            });
        });
    }

    const AuthUI = {
        init() {
            const $nav = $('header nav ul');
            if (!$nav.length || localStorage.getItem('sf_session_user')) return;

            $nav.find('[data-auth-trigger]').remove();

            const $btn = $('<button>')
                .attr('type', 'button')
                .addClass('nav-link text-white bg-transparent border-0 fw-bold')
                .text('Register')
                .on('click', () => this.openDialog());

            $('<li>')
                .addClass('nav-item')
                .attr('data-auth-trigger', '1')
                .append($btn)
                .appendTo($nav);
        },

        openDialog() {
            $('#demo-auth-dialog').remove();

            const $dialog = $('<dialog>')
                .attr('id', 'demo-auth-dialog')
                .addClass('border-0 rounded-4 shadow-lg p-4')
                .css('max-width', '400px');

            const $title = $('<h2>').addClass('h4 text-primary mb-3').text('Create Account (Demo)');
            const $info = $('<p>').addClass('text-muted small mb-3').text('Front-end demo only.');

            const $userInp = $('<input>').attr({ type: 'text', placeholder: 'Username', required: true }).addClass('form-control mb-2');
            const $emailInp = $('<input>').attr({ type: 'email', placeholder: 'Email', required: true }).addClass('form-control mb-3');
            const $passInp = $('<input>').attr({ type: 'password', placeholder: 'Password (min 8 chars)', required: true }).addClass('form-control mb-3');
            const $submitBtn = $('<button>').attr('type', 'button').addClass('btn btn-primary w-100').text('Register');

            const $form = $('<form>').append($userInp, $emailInp, $passInp, $submitBtn);

            $dialog.append($title, $info, $form).appendTo('body');
            $dialog[0].showModal();

            $submitBtn.on('click', function () {
                const username = $userInp.val().trim();
                const password = $passInp.val();

                if (username.length < 3 || password.length < 8) {
                    alert('Please enter valid username and password (min 8 chars).');
                    return;
                }

                localStorage.setItem('sf_session_user', username);
                $dialog[0].close();
                window.location.reload();
            });
        }
    };

    AuthUI.init();
});