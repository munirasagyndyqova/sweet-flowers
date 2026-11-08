'use strict';

$(function () {

    const newBouquetImages = {
        1: 'images/3дж.jpg',
        2: 'images/тулипдж.jpg',
        3: 'images/4дж.jpg',
        6: 'images/лилиидж.jpg',
        8: 'images/орхидея.jpg'
    };

    const existingBouquets = [
        {
            id: 9,
            name: 'Pink Delight',
            category: 'roses',
            price: 20000,
            inStock: true
        },
        {
            id: 10,
            name: 'Mixed Bouquet',
            category: 'mixed',
            price: 25000,
            inStock: true
        }
    ];

    const allBouquets = [
        ...$.grep(BOUQUETS, function (bouquet) {
            return Object.hasOwn(newBouquetImages, bouquet.id);
        }),
        ...existingBouquets
    ];

    let currentCategory = 'all';
    let currentSearch = '';
    let currentSort = 'default';

    let $cartSummaryElement = null;

    // Create element
    function createElement(tag, className, text) {
        const $element = $('<' + tag + '>');

        if (className) {
            $element.addClass(className);
        }

        if (text !== undefined) {
            $element.text(text);
        }

        return $element;
    }

    // Filter and sort bouquets
    function getFilteredBouquets() {
        const query = currentSearch.toLowerCase().trim();

        const filtered = $.grep(allBouquets, function (bouquet) {
            const matchesCategory =
                currentCategory === 'all' ||
                bouquet.category === currentCategory;

            const matchesSearch =
                bouquet.name.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });

        if (currentSort === 'price-asc') {
            filtered.sort(function (a, b) {
                return a.price - b.price;
            });
        } else if (currentSort === 'price-desc') {
            filtered.sort(function (a, b) {
                return b.price - a.price;
            });
        } else if (currentSort === 'name') {
            filtered.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        }

        return filtered;
    }

    // Add bouquet to cart
    function addBouquetToCart(bouquet, $button) {
        if (!bouquet.inStock) return;

        const existingItem = Cart.items.find(function (item) {
            return item.id === bouquet.id;
        });

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            Cart.items.push({
                ...bouquet,
                qty: 1
            });
        }

        $button.text('Added to Cart ✓');
        updateCartSummary();
    }

    // Create bouquet card
    function createBouquetCard(bouquet) {
        const $column = createElement(
            'div',
            'col-12 col-md-6 col-lg-4'
        );

        const $card = createElement(
            'div',
            'card h-100 shadow-sm'
        );

        const $imageBox = createElement(
            'div',
            'ratio ratio-16x9 overflow-hidden rounded-top'
        );

        const $image = createElement(
            'img',
            'w-100 h-100 object-fit-cover'
        ).attr({
            src: newBouquetImages[bouquet.id],
            alt: bouquet.name,
            loading: 'lazy'
        });

        $imageBox.append($image);

        const $body = createElement(
            'div',
            'card-body d-flex flex-column'
        );

        const $title = createElement(
            'h3',
            'card-title h5 text-primary',
            bouquet.name
        );

        const $category = createElement(
            'p',
            'text-muted small mb-2',
            'Category: ' + bouquet.category
        );

        const $price = createElement(
            'p',
            'fw-bold text-primary',
            formatPrice(bouquet.price)
        );

        const $button = createElement(
            'button',
            'btn btn-primary w-100 mt-auto',
            'Add to Cart'
        ).attr('type', 'button');

        if (!bouquet.inStock) {
            $button.prop('disabled', true);
            $button.text('Out of Stock');
        }

        $button.on('click', function () {
            addBouquetToCart(bouquet, $button);
        });

        $body.append(
            $title,
            $category,
            $price,
            $button
        );

        $card.append($imageBox, $body);
        $column.append($card);

        return $column;
    }

    // Create filters
    function createFilters($section, renderBouquets) {
        const $filterBox = createElement(
            'div',
            'row g-3 mb-4 align-items-end'
        );

        // Search
        const $searchColumn = createElement(
            'div',
            'col-12 col-md-4'
        );

        const $searchLabel = createElement(
            'label',
            'form-label fw-semibold',
            'Search Bouquets'
        );

        const $searchInput = createElement(
            'input',
            'form-control'
        ).attr({
            type: 'search',
            placeholder: 'Search by bouquet name...',
            'aria-label': 'Search bouquets'
        });

        $searchInput.on('input', function () {
            currentSearch = $(this).val();
            renderBouquets();
        });

        $searchColumn.append($searchLabel, $searchInput);

        // Category
        const $categoryColumn = createElement(
            'div',
            'col-12 col-md-3'
        );

        const $categoryLabel = createElement(
            'label',
            'form-label fw-semibold',
            'Category'
        );

        const $categorySelect = createElement(
            'select',
            'form-select'
        );

        const categories = [
            ['all', 'All Categories'],
            ['roses', 'Roses'],
            ['tulips', 'Tulips'],
            ['mixed', 'Mixed'],
            ['lilies', 'Lilies'],
            ['orchids', 'Orchids']
        ];

        $.each(categories, function (index, category) {
            const $option = createElement(
                'option',
                '',
                category[1]
            ).val(category[0]);

            $categorySelect.append($option);
        });

        $categorySelect.on('change', function () {
            currentCategory = $(this).val();
            renderBouquets();
        });

        $categoryColumn.append(
            $categoryLabel,
            $categorySelect
        );

        // Sort
        const $sortColumn = createElement(
            'div',
            'col-12 col-md-3'
        );

        const $sortLabel = createElement(
            'label',
            'form-label fw-semibold',
            'Sort By'
        );

        const $sortSelect = createElement(
            'select',
            'form-select'
        );

        const sortOptions = [
            ['default', 'Default'],
            ['price-asc', 'Price: Low to High'],
            ['price-desc', 'Price: High to Low'],
            ['name', 'Name: A to Z']
        ];

        $.each(sortOptions, function (index, option) {
            const $item = createElement(
                'option',
                '',
                option[1]
            ).val(option[0]);

            $sortSelect.append($item);
        });

        $sortSelect.on('change', function () {
            currentSort = $(this).val();
            renderBouquets();
        });

        $sortColumn.append($sortLabel, $sortSelect);

        // Reset
        const $resetColumn = createElement(
            'div',
            'col-12 col-md-2'
        );

        const $resetButton = createElement(
            'button',
            'btn btn-outline-primary w-100',
            'Reset'
        ).attr('type', 'button');

        $resetButton.on('click', function () {
            currentCategory = 'all';
            currentSearch = '';
            currentSort = 'default';

            $searchInput.val('');
            $categorySelect.val('all');
            $sortSelect.val('default');

            renderBouquets();
        });

        $resetColumn.append($resetButton);

        $filterBox.append(
            $searchColumn,
            $categoryColumn,
            $sortColumn,
            $resetColumn
        );

        $section.append($filterBox);
    }

    // Update cart summary
    function updateCartSummary() {
        if (!$cartSummaryElement) return;

        const quantity = Cart.items.reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);

        const total = Cart.getTotal();

        $cartSummaryElement.text(
            'Cart: ' + quantity +
            ' items | Total: ' + formatPrice(total)
        );
    }

    // Setup cart summary
    function setupCartSummary($section) {
        $cartSummaryElement = createElement(
            'p',
            'text-center fw-semibold text-primary mt-4',
            ''
        ).attr('aria-live', 'polite');

        $section.append($cartSummaryElement);
        updateCartSummary();
    }

    // Setup flowers page
    function setupFlowersPage() {

        const $heading = $('h2').filter(function () {
            return $(this).text().trim() ===
                'Our Popular Bouquets';
        }).first();

        if (!$heading.length) return;

        const $section = $heading.parent();
        const $container = $section.find('.row.g-4').first();

        if (!$container.length) return;

        const $originalColumns = $container.children();

        const originalCards = new Map([
            [9, $originalColumns.eq(0)],
            [10, $originalColumns.eq(1)]
        ]);

        // Update original HTML cards
        originalCards.forEach(function ($column, id) {
            if (!$column.length) return;

            $column.attr(
                'class',
                'col-12 col-md-6 col-lg-4'
            );

            const $image = $column.find('img').first();

            if ($image.length) {
                const $imageBox = createElement(
                    'div',
                    'ratio ratio-16x9 overflow-hidden rounded-top'
                );

                $image.attr(
                    'class',
                    'w-100 h-100 object-fit-cover'
                );

                $image.wrap($imageBox);
            }

            const $body = $column.find('.card-body').first();

            if ($body.length) {
                $body.addClass('d-flex flex-column');
            }

            const bouquet = existingBouquets.find(function (item) {
                return item.id === id;
            });

            if ($body.length && bouquet) {
                const $description = $body.find('.card-text').first();

                if ($description.length) {
                    $description.text(
                        'Category: ' + bouquet.category
                    );
                }

                const $price = createElement(
                    'p',
                    'fw-bold text-primary',
                    formatPrice(bouquet.price)
                );

                const $buttonElement = $body.find('.btn').first();

                if ($buttonElement.length) {
                    $price.insertBefore($buttonElement);
                } else {
                    $body.append($price);
                }
            }

            const $button = $column.find('.btn').first();

            if ($button.length && bouquet) {
                $button
                    .text('Add to Cart')
                    .attr(
                        'class',
                        'btn btn-primary w-100 mt-auto'
                    );

                $button.on('click', function (event) {
                    event.preventDefault();
                    addBouquetToCart(bouquet, $button);
                });
            }
        });

        const $resultCount = createElement(
            'p',
            'text-muted mb-3',
            ''
        ).attr('aria-live', 'polite');

        const $resultsWrapper = createElement('div');

        // Render bouquets
        function renderBouquets() {
            $container.empty();

            const filtered = getFilteredBouquets();

            $resultCount.text(
                'Found ' + filtered.length + ' bouquets'
            );

            if (filtered.length === 0) {
                const $emptyMessage = createElement(
                    'div',
                    'col-12 text-center py-5'
                );

                const $text = createElement(
                    'p',
                    'text-muted',
                    'No bouquets found. Try another search or category.'
                );

                $emptyMessage.append($text);
                $container.append($emptyMessage);
                return;
            }

            $.each(filtered, function (index, bouquet) {
                if (originalCards.has(bouquet.id)) {
                    $container.append(
                        originalCards.get(bouquet.id)
                    );
                } else {
                    $container.append(
                        createBouquetCard(bouquet)
                    );
                }
            });
            
        }

        createFilters($resultsWrapper, renderBouquets);

        $resultsWrapper.insertBefore($container);
        $resultCount.insertBefore($container);

        setupCartSummary($section);
        renderBouquets();
    }

    // Initialize
    setupFlowersPage();

});