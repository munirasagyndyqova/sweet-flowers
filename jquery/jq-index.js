'use strict';

$(function () {

    // Find available bouquets
    function getAvailableBouquets() {
        return $.grep(BOUQUETS, function (bouquet) {
            return bouquet.inStock === true;
        });
    }

    // Get random bouquet
    function getRandomBouquet(bouquets) {
        if (bouquets.length === 0) {
            return null;
        }

        const index = Math.floor(Math.random() * bouquets.length);
        return bouquets[index];
    }

    // Create bouquet information
    function createBouquetInfo(bouquet) {
        const $container = $('<div>')
            .addClass('card shadow-sm border-0 h-100');

        const $body = $('<div>')
            .addClass('card-body p-4 text-center');

        const $title = $('<h3>')
            .addClass('h4 text-primary')
            .text(bouquet.name);

        const $category = $('<p>')
            .addClass('text-muted')
            .text('Category: ' + bouquet.category);

        const $price = $('<p>')
            .addClass('fw-bold fs-4 text-primary')
            .text(formatPrice(bouquet.price));

        const $link = $('<a>')
            .attr('href', 'flowers.html')
            .addClass('btn btn-outline-primary')
            .text('View Flowers');

        $body.append($title, $category, $price, $link);
        $container.append($body);

        return $container;
    }

    // Create section
    function createHomeSection(titleText) {
        const $section = $('<section>')
            .addClass('container my-5');

        const $heading = $('<h2>')
            .addClass('text-primary text-center mb-4')
            .text(titleText);

        $section.append($heading);

        return $section;
    }

    // Bouquet of the Day
    function setupFeaturedBouquet() {
        const $section = createHomeSection('Bouquet of the Day');

        const $description = $('<p>')
            .addClass('text-center text-muted')
            .text('Discover a beautiful bouquet selected for you.');

        const $result = $('<div>')
            .addClass('mx-auto col-12 col-md-6');

        const $buttonContainer = $('<div>')
            .addClass('text-center mt-3');

        const $button = $('<button>')
            .attr('type', 'button')
            .addClass('btn btn-primary')
            .text('Show Another Bouquet');

        const available = getAvailableBouquets();

        function displayBouquet() {
            $result.empty();

            const bouquet = getRandomBouquet(available);

            if (bouquet === null) {
                const $message = $('<p>')
                    .addClass('text-center text-muted')
                    .text('No bouquets available.');

                $result.append($message);
                $button.prop('disabled', true);
                return;
            }

            $result.append(createBouquetInfo(bouquet));
        }

        $button.on('click', displayBouquet);

        $buttonContainer.append($button);

        $section.append(
            $description,
            $result,
            $buttonContainer
        );

        if ($('main').length) {
            $('main').append($section);
        }

        displayBouquet();
    }

    // Filter bouquets by budget
    function findBouquetsByBudget(budget) {
        return $.grep(BOUQUETS, function (bouquet) {
            return bouquet.inStock === true &&
                   bouquet.price <= budget;
        }).sort(function (a, b) {
            return a.price - b.price;
        });
    }

    // Budget finder
    function setupBudgetFinder() {
        const $section = createHomeSection(
            'Find Your Perfect Bouquet by Budget'
        );

        const $description = $('<p>')
            .addClass('text-center text-muted')
            .text('Enter your budget and find bouquets within your price range.');

        const $form = $('<form>')
            .addClass('mx-auto col-12 col-md-6');

        const $label = $('<label>')
            .addClass('form-label fw-semibold')
            .text('Your Budget (₸)');

        const $input = $('<input>')
            .attr({
                type: 'number',
                min: '1',
                step: '1',
                required: true,
                placeholder: 'Enter your budget in KZT'
            })
            .addClass('form-control');

        const $error = $('<small>')
            .addClass('text-danger d-block mt-1')
            .attr('role', 'alert');

        const $button = $('<button>')
            .attr('type', 'submit')
            .addClass('btn btn-primary w-100 mt-3')
            .text('Find Bouquets');

        const $results = $('<div>')
            .addClass('row g-3 mt-3')
            .attr('aria-live', 'polite');

        $form.append(
            $label,
            $input,
            $error,
            $button
        );

        $section.append(
            $description,
            $form,
            $results
        );

        if ($('main').length) {
            $('main').append($section);
        }

        $form.on('submit', function (event) {
            event.preventDefault();

            $results.empty();
            $error.text('');

            const rawValue = $input.val().trim();
            const budget = Number(rawValue);

            if (
                rawValue === '' ||
                !Number.isFinite(budget) ||
                budget <= 0 ||
                !Number.isInteger(budget)
            ) {
                $error.text(
                    'Please enter a valid positive budget in KZT.'
                );

                $input.addClass('is-invalid');
                $input.trigger('focus');
                return;
            }

            $input.removeClass('is-invalid');

            const matchingBouquets = findBouquetsByBudget(budget);

            const $count = $('<p>')
                .addClass('text-center fw-semibold')
                .text(
                    'Found ' + matchingBouquets.length + ' bouquets'
                );

            $results.append($count);

            if (matchingBouquets.length === 0) {
                const $message = $('<p>')
                    .addClass('text-center text-muted')
                    .text(
                        'No available bouquets match your budget.'
                    );

                $results.append($message);
                return;
            }

            $.each(matchingBouquets, function (index, bouquet) {
                const $column = $('<div>')
                    .addClass('col-12 col-md-6');

                $column.append(createBouquetInfo(bouquet));
                $results.append($column);
            });
        });
            $('article h2').on('click', function () {
                $(this).siblings('p').slideToggle();
            });
            $('h2').on('click', function () {
                $(this).siblings('p').slideToggle();
            });
        $input.on('input', function () {
            $error.text('');
            $input.removeClass('is-invalid');
        });
    }

    // Initialize home page
    setupFeaturedBouquet();
    setupBudgetFinder();

});