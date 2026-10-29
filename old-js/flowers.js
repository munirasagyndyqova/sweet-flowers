
'use strict';

const newBouquetImages = {
    1: 'images/3дж.jpg',
    2: 'images/тулипдж.jpg',
    3: 'images/4дж.jpg',
    6: 'images/лилиидж.jpg',
    8: 'images/5дж.jpg'
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
    ...BOUQUETS.filter(bouquet =>
        Object.hasOwn(newBouquetImages, bouquet.id)
    ),
    ...existingBouquets
];

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function getFilteredBouquets() {
    const query = currentSearch.toLowerCase().trim();

    const filtered = allBouquets.filter(bouquet => {
        const matchesCategory =
            currentCategory === 'all' ||
            bouquet.category === currentCategory;

        const matchesSearch =
            bouquet.name.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name') {
        filtered.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    return filtered;
}

function addBouquetToCart(bouquet, button) {
    if (!bouquet.inStock) return;

    const existingItem = Cart.items.find(
        item => item.id === bouquet.id
    );

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        Cart.items.push({
            ...bouquet,
            qty: 1
        });
    }

    button.textContent = 'Added to Cart ✓';
    updateCartSummary();
}

function createBouquetCard(bouquet) {
    const column = createElement(
        'div',
        'col-12 col-md-6 col-lg-4'
    );

    const card = createElement(
        'div',
        'card h-100 shadow-sm'
    );

    const imageBox = createElement(
        'div',
        'ratio ratio-16x9 overflow-hidden rounded-top'
    );

    const image = createElement(
        'img',
        'w-100 h-100 object-fit-cover'
    );

    image.src = newBouquetImages[bouquet.id];
    image.alt = bouquet.name;
    image.loading = 'lazy';

    imageBox.appendChild(image);

    const body = createElement(
        'div',
        'card-body d-flex flex-column'
    );

    const title = createElement(
        'h3',
        'card-title h5 text-primary',
        bouquet.name
    );

    const category = createElement(
        'p',
        'text-muted small mb-2',
        'Category: ' + bouquet.category
    );

    const price = createElement(
        'p',
        'fw-bold text-primary',
        formatPrice(bouquet.price)
    );

    const button = createElement(
        'button',
        'btn btn-primary w-100 mt-auto',
        'Add to Cart'
    );

    button.type = 'button';

    if (!bouquet.inStock) {
        button.disabled = true;
        button.textContent = 'Out of Stock';
    }

    button.addEventListener('click', () => {
        addBouquetToCart(bouquet, button);
    });

    body.appendChild(title);
    body.appendChild(category);
    body.appendChild(price);
    body.appendChild(button);

    card.appendChild(imageBox);
    card.appendChild(body);
    column.appendChild(card);

    return column;
}

function createFilters(section, renderBouquets) {
    const filterBox = createElement(
        'div',
        'row g-3 mb-4 align-items-end'
    );

    const searchColumn = createElement(
        'div',
        'col-12 col-md-4'
    );

    const searchLabel = createElement(
        'label',
        'form-label fw-semibold',
        'Search Bouquets'
    );

    const searchInput = createElement(
        'input',
        'form-control'
    );

    searchInput.type = 'search';
    searchInput.placeholder = 'Search by bouquet name...';
    searchInput.setAttribute(
        'aria-label',
        'Search bouquets'
    );

    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value;
        renderBouquets();
    });

    searchColumn.appendChild(searchLabel);
    searchColumn.appendChild(searchInput);

    const categoryColumn = createElement(
        'div',
        'col-12 col-md-3'
    );

    const categoryLabel = createElement(
        'label',
        'form-label fw-semibold',
        'Category'
    );

    const categorySelect = createElement(
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

    categories.forEach(([value, label]) => {
        const option = createElement(
            'option',
            '',
            label
        );

        option.value = value;
        categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', () => {
        currentCategory = categorySelect.value;
        renderBouquets();
    });

    categoryColumn.appendChild(categoryLabel);
    categoryColumn.appendChild(categorySelect);

    const sortColumn = createElement(
        'div',
        'col-12 col-md-3'
    );

    const sortLabel = createElement(
        'label',
        'form-label fw-semibold',
        'Sort By'
    );

    const sortSelect = createElement(
        'select',
        'form-select'
    );

    const sortOptions = [
        ['default', 'Default'],
        ['price-asc', 'Price: Low to High'],
        ['price-desc', 'Price: High to Low'],
        ['name', 'Name: A to Z']
    ];

    sortOptions.forEach(([value, label]) => {
        const option = createElement(
            'option',
            '',
            label
        );

        option.value = value;
        sortSelect.appendChild(option);
    });

    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        renderBouquets();
    });

    sortColumn.appendChild(sortLabel);
    sortColumn.appendChild(sortSelect);

    const resetColumn = createElement(
        'div',
        'col-12 col-md-2'
    );

    const resetButton = createElement(
        'button',
        'btn btn-outline-primary w-100',
        'Reset'
    );

    resetButton.type = 'button';

    resetButton.addEventListener('click', () => {
        currentCategory = 'all';
        currentSearch = '';
        currentSort = 'default';

        searchInput.value = '';
        categorySelect.value = 'all';
        sortSelect.value = 'default';

        renderBouquets();
    });

    resetColumn.appendChild(resetButton);

    filterBox.appendChild(searchColumn);
    filterBox.appendChild(categoryColumn);
    filterBox.appendChild(sortColumn);
    filterBox.appendChild(resetColumn);

    section.appendChild(filterBox);
}

let cartSummaryElement = null;

function updateCartSummary() {
    if (!cartSummaryElement) return;

    const quantity = Cart.items.reduce(
        (sum, item) => sum + item.qty,
        0
    );

    const total = Cart.getTotal();

    cartSummaryElement.textContent =
        'Cart: ' + quantity +
        ' items | Total: ' + formatPrice(total);
}

function setupCartSummary(section) {
    cartSummaryElement = createElement(
        'p',
        'text-center fw-semibold text-primary mt-4',
        ''
    );

    cartSummaryElement.setAttribute(
        'aria-live',
        'polite'
    );

    section.appendChild(cartSummaryElement);
    updateCartSummary();
}

function setupFlowersPage() {
    const heading = [...document.querySelectorAll('h2')]
        .find(element =>
            element.textContent.trim() ===
            'Our Popular Bouquets'
        );

    if (!heading) return;

    const section = heading.parentElement;
    const container = section.querySelector('.row.g-4');

    if (!container) return;

    const originalColumns = [...container.children];

    const originalCards = new Map([
        [9, originalColumns[0]],
        [10, originalColumns[1]]
    ]);

    originalCards.forEach((column, id) => {
        if (!column) return;

        column.className =
            'col-12 col-md-6 col-lg-4';

        const image = column.querySelector('img');

        if (image) {
            const imageBox = createElement(
                'div',
                'ratio ratio-16x9 overflow-hidden rounded-top'
            );

            image.className =
                'w-100 h-100 object-fit-cover';

            image.parentElement.insertBefore(
                imageBox,
                image
            );

            imageBox.appendChild(image);
        }

        const body = column.querySelector('.card-body');

        if (body) {
            body.classList.add(
                'd-flex',
                'flex-column'
            );
        }

        const bouquet = existingBouquets.find(
            item => item.id === id
        );

        if (body && bouquet) {
            const description = body.querySelector('.card-text');

            if (description) {
                description.textContent =
                    'Category: ' + bouquet.category;
            }

            const price = createElement(
                'p',
                'fw-bold text-primary',
                formatPrice(bouquet.price)
            );

            const buttonElement = body.querySelector('.btn');

            if (buttonElement) {
                body.insertBefore(price, buttonElement);
            } else {
                body.appendChild(price);
            }
        }

        const button = column.querySelector('.btn');

        if (button && bouquet) {
            button.textContent = 'Add to Cart';
            button.className =
                'btn btn-primary w-100 mt-auto';

            button.addEventListener('click', event => {
                event.preventDefault();
                addBouquetToCart(bouquet, button);
            });
        }
    });

    const resultCount = createElement(
        'p',
        'text-muted mb-3',
        ''
    );

    resultCount.setAttribute(
        'aria-live',
        'polite'
    );

    const resultsWrapper = createElement('div');

    function renderBouquets() {
        container.replaceChildren();

        const filtered = getFilteredBouquets();

        resultCount.textContent =
            'Found ' + filtered.length + ' bouquets';

        if (filtered.length === 0) {
            const emptyMessage = createElement(
                'div',
                'col-12 text-center py-5'
            );

            const text = createElement(
                'p',
                'text-muted',
                'No bouquets found. Try another search or category.'
            );

            emptyMessage.appendChild(text);
            container.appendChild(emptyMessage);
            return;
        }

        filtered.forEach(bouquet => {
            if (originalCards.has(bouquet.id)) {
                container.appendChild(
                    originalCards.get(bouquet.id)
                );
            } else {
                container.appendChild(
                    createBouquetCard(bouquet)
                );
            }
        });
    }

    createFilters(resultsWrapper, renderBouquets);

    section.insertBefore(
        resultsWrapper,
        container
    );

    section.insertBefore(
        resultCount,
        container
    );

    setupCartSummary(section);
    renderBouquets();
}

document.addEventListener(
    'DOMContentLoaded',
    setupFlowersPage
);
