
'use strict';

// Find available bouquets
function getAvailableBouquets() {
    return BOUQUETS.filter(bouquet => bouquet.inStock === true);
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
    const container = document.createElement('div');
    container.className = 'card shadow-sm border-0 h-100';

    const body = document.createElement('div');
    body.className = 'card-body p-4 text-center';

    const title = document.createElement('h3');
    title.className = 'h4 text-primary';
    title.textContent = bouquet.name;

    const category = document.createElement('p');
    category.className = 'text-muted';
    category.textContent = 'Category: ' + bouquet.category;

    const price = document.createElement('p');
    price.className = 'fw-bold fs-4 text-primary';
    price.textContent = formatPrice(bouquet.price);

    const link = document.createElement('a');
    link.href = 'flowers.html';
    link.className = 'btn btn-outline-primary';
    link.textContent = 'View Flowers';

    body.appendChild(title);
    body.appendChild(category);
    body.appendChild(price);
    body.appendChild(link);

    container.appendChild(body);

    return container;
}

// Create section
function createHomeSection(titleText) {
    const section = document.createElement('section');
    section.className = 'container my-5';

    const heading = document.createElement('h2');
    heading.className = 'text-primary text-center mb-4';
    heading.textContent = titleText;

    section.appendChild(heading);

    return section;
}

// Bouquet of the Day
function setupFeaturedBouquet() {
    const section = createHomeSection('Bouquet of the Day');

    const description = document.createElement('p');
    description.className = 'text-center text-muted';
    description.textContent =
        'Discover a beautiful bouquet selected for you.';

    const result = document.createElement('div');
    result.className = 'mx-auto col-12 col-md-6';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'text-center mt-3';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = 'Show Another Bouquet';

    const available = getAvailableBouquets();

    function displayBouquet() {
        result.replaceChildren();

        const bouquet = getRandomBouquet(available);

        if (bouquet === null) {
            const message = document.createElement('p');
            message.className = 'text-center text-muted';
            message.textContent = 'No bouquets available.';
            result.appendChild(message);
            button.disabled = true;
            return;
        }

        result.appendChild(createBouquetInfo(bouquet));
    }

    button.addEventListener('click', displayBouquet);

    buttonContainer.appendChild(button);

    section.appendChild(description);
    section.appendChild(result);
    section.appendChild(buttonContainer);

    const main = document.querySelector('main');
    if (main) main.appendChild(section);

    displayBouquet();
}

// Filter bouquets by budget
function findBouquetsByBudget(budget) {
    return BOUQUETS.filter(bouquet =>
        bouquet.inStock === true &&
        bouquet.price <= budget
    ).sort((a, b) => a.price - b.price);
}

// Budget finder
function setupBudgetFinder() {
    const section = createHomeSection('Find Your Perfect Bouquet by Budget');

    const description = document.createElement('p');
    description.className = 'text-center text-muted';
    description.textContent =
        'Enter your budget and find bouquets within your price range.';

    const form = document.createElement('form');
    form.className = 'mx-auto col-12 col-md-6';

    const label = document.createElement('label');
    label.className = 'form-label fw-semibold';
    label.textContent = 'Your Budget (₸)';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.step = '1';
    input.required = true;
    input.className = 'form-control';
    input.placeholder = 'Enter your budget in KZT';

    const error = document.createElement('small');
    error.className = 'text-danger d-block mt-1';
    error.setAttribute('role', 'alert');

    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn btn-primary w-100 mt-3';
    button.textContent = 'Find Bouquets';

    const results = document.createElement('div');
    results.className = 'row g-3 mt-3';
    results.setAttribute('aria-live', 'polite');

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(error);
    form.appendChild(button);

    section.appendChild(description);
    section.appendChild(form);
    section.appendChild(results);

    const main = document.querySelector('main');
    if (main) main.appendChild(section);

    form.addEventListener('submit', event => {
        event.preventDefault();

        results.replaceChildren();
        error.textContent = '';

        const rawValue = input.value.trim();
        const budget = Number(rawValue);

        if (rawValue === '' || !Number.isFinite(budget) ||
            budget <= 0 || !Number.isInteger(budget)) {
            error.textContent =
                'Please enter a valid positive budget in KZT.';
            input.classList.add('is-invalid');
            input.focus();
            return;
        }

        input.classList.remove('is-invalid');

        const matchingBouquets = findBouquetsByBudget(budget);

        const count = document.createElement('p');
        count.className = 'text-center fw-semibold';
        count.textContent =
            'Found ' + matchingBouquets.length + ' bouquets';

        results.appendChild(count);

        if (matchingBouquets.length === 0) {
            const message = document.createElement('p');
            message.className = 'text-center text-muted';
            message.textContent =
                'No available bouquets match your budget.';

            results.appendChild(message);
            return;
        }

        matchingBouquets.forEach(bouquet => {
            const column = document.createElement('div');
            column.className = 'col-12 col-md-6';

            column.appendChild(createBouquetInfo(bouquet));
            results.appendChild(column);
        });
    });

    input.addEventListener('input', () => {
        error.textContent = '';
        input.classList.remove('is-invalid');
    });
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    setupFeaturedBouquet();
    setupBudgetFinder();
});
