'use strict';


(function () {
    if (typeof SiteUtils === 'undefined') {
        console.warn('reviews.js: js/utils.js is not loaded.');
        return;
    }

    const form = document.getElementById('reviewForm');
    const resultArea = document.getElementById('reviewResult');
    const firstStaticReview = document.querySelector('article[id^="review"]');
    const host = firstStaticReview ? firstStaticReview.parentElement : document.getElementById('reviewsList');
    if (!form || !resultArea || !host) {
        return;
    }

    const {
        Validators, createEl, createButton, createLabeledControl, renderAlert, renderErrorSummary,
        attachCharCounter, focusFirstInvalid, createFormValidator, generateDemoReference,
        formatDate, formatDateTime, formatIsoDate, normalizeText, todayIsoDate
    } = SiteUtils;

    const MIN_MESSAGE = 10;
    const MAX_MESSAGE = 500;
    const SOURCE_2GIS = '2gis';
    const SOURCE_SESSION = 'session';

    const FIELD_LABELS = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        rating: 'Rating',
        date: 'Date of visit',
        message: 'Your review'
    };
    const SUBJECT_LABELS = { praise: 'Praise', suggestion: 'Suggestion', complaint: 'Complaint' };

    const inputs = {
        name: document.getElementById('reviewName'),
        email: document.getElementById('reviewEmail'),
        phone: document.getElementById('reviewPhone'),
        rating: document.getElementById('reviewRating'),
        date: document.getElementById('reviewDate'),
        subject: document.getElementById('reviewSubject'),
        message: document.getElementById('reviewMessage'),
        recommend: Array.from(form.querySelectorAll('input[name="recommend"]'))
    };

    /* ---------- data: REVIEWS array ---------- */

    function extractReview(article, index) {
        const quote = article.querySelector('q');
        const cite = article.querySelector('cite');
        if (!quote || !cite) {
            return null;
        }
        const dateText = article.querySelector('p.small.text-muted');
        const dateParts = /(\d{2})\.(\d{2})\.(\d{4})/.exec(dateText ? dateText.textContent : '');
        const image = article.querySelector('img');
        const caption = article.querySelector('figcaption');
        const link = article.querySelector('a[href]');
        const timestamp = dateParts
            ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1])).getTime()
            : 0;

        return {
            id: Number(article.id.replace('review', '')) || index + 1,
            author: cite.textContent.trim(),
            text: quote.textContent.replace(/\s+/g, ' ').trim(),
            timestamp: timestamp,
            hasTime: false,
            source: SOURCE_2GIS,
            subject: '',
            rating: null,
            recommend: '',
            visitDate: '',
            reference: '',
            imageSrc: image ? image.getAttribute('src') : '',
            imageAlt: image ? image.getAttribute('alt') : '',
            imageCaption: caption ? caption.textContent.trim() : '',
            link: link ? link.getAttribute('href') : ''
        };
    }

    function loadExistingReviews() {
        const loaded = [];
        Array.from(host.querySelectorAll('article[id^="review"]')).forEach((article, index) => {
            const review = extractReview(article, index);
            if (review !== null) {
                loaded.push(review);
                article.remove(); // redrawn below by createReviewCard()
            }
        });
        return loaded;
    }

    const REVIEWS = loadExistingReviews();
    const state = { justAddedId: null, errorSummaryShown: false, skipResultClear: false };

    function nextReviewId(reviews) {
        return reviews.reduce((highest, review) => Math.max(highest, review.id), 0) + 1;
    }

    function createReviewObject(values, id, now) {
        return {
            id: id,
            author: values.name.trim(),
            text: values.message.trim(),
            timestamp: now.getTime(),
            hasTime: true,
            source: SOURCE_SESSION,
            subject: values.subject,
            rating: Number(values.rating),
            recommend: values.recommend,
            visitDate: values.date,
            reference: generateDemoReference('REV'),
            imageSrc: '',
            imageAlt: '',
            imageCaption: '',
            link: ''
        };
    }

    /* ---------- searching, sorting, statistics ---------- */

    function filterReviews(reviews, query, source) {
        const needle = query.trim().toLowerCase();
        return reviews.filter((review) => {
            const matchesSource = source === 'all' || review.source === source;
            const matchesQuery = needle === '' ||
                review.author.toLowerCase().includes(needle) ||
                review.text.toLowerCase().includes(needle);
            return matchesSource && matchesQuery;
        });
    }

    function ratingOrZero(review) {
        return review.rating === null ? 0 : review.rating;
    }

    function sortReviews(reviews, mode) {
        const copy = reviews.slice();
        switch (mode) {
            case 'oldest':
                return copy.sort((a, b) => a.timestamp - b.timestamp);
            case 'author':
                return copy.sort((a, b) => a.author.localeCompare(b.author));
            case 'rating':
                return copy.sort((a, b) => ratingOrZero(b) - ratingOrZero(a) || b.timestamp - a.timestamp);
            default:
                return copy.sort((a, b) => b.timestamp - a.timestamp);
        }
    }

    function averageRating(reviews) {
        const rated = reviews.filter((review) => review.rating !== null);
        if (rated.length === 0) {
            return null;
        }
        return rated.reduce((sum, review) => sum + review.rating, 0) / rated.length;
    }

    function countBySource(reviews) {
        return reviews.reduce((counts, review) => {
            counts[review.source] = (counts[review.source] || 0) + 1;
            return counts;
        }, {});
    }

    function pluralize(count, word) {
        return count + ' ' + word + (count === 1 ? '' : 's');
    }

    /* ---------- rendering (used for existing AND new reviews) ---------- */

    function createRatingLine(rating) {
        const line = createEl('p', { className: 'mb-1' });
        const stars = createEl('span', { text: '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating) });
        stars.setAttribute('aria-hidden', 'true');
        line.append(stars, createEl('span', { className: 'ms-2 small', text: 'Rating: ' + rating + ' out of 5' }));
        return line;
    }

    function createSourceBadge(source) {
        if (source === SOURCE_SESSION) {
            return createEl('span', { className: 'badge text-bg-warning', text: 'Demo \u2013 not published' });
        }
        return createEl('span', { className: 'badge text-bg-secondary', text: '2GIS review' });
    }

    function createReviewCard(review, animate) {
        const card = createEl('article', {
            className: 'bg-light rounded-3 shadow-sm p-4 mb-4' + (animate ? ' fade-in-up' : ''),
            attrs: { id: 'review' + review.id, tabindex: '-1' }
        });

        const head = createEl('div', { className: 'd-flex flex-wrap align-items-center gap-2 mb-2' });
        head.append(createEl('h3', { className: 'text-primary fs-5 mb-0', text: 'Review ' + review.id }),
            createSourceBadge(review.source));
        card.append(head);

        const quoteParagraph = createEl('p');
        quoteParagraph.append(createEl('q', { text: review.text }));
        card.append(quoteParagraph);

        if (review.rating !== null) {
            card.append(createRatingLine(review.rating));
        }

        if (review.imageSrc !== '') {
            const figure = createEl('figure', { className: 'mb-3 text-center' });
            figure.append(createEl('img', {
                className: 'review-img rounded shadow-sm mx-auto d-block',
                attrs: { src: review.imageSrc, alt: review.imageAlt, width: '240', height: '170' }
            }));
            if (review.imageCaption !== '') {
                figure.append(createEl('figcaption', { className: 'small text-muted mt-2', text: review.imageCaption }));
            }
            card.append(figure);
        }

        const byline = createEl('p', { className: 'mb-1' });
        byline.append('\u2014 ', createEl('cite', { text: review.author }));
        card.append(byline);

        const postedAt = new Date(review.timestamp);
        const postedText = review.hasTime ? formatDateTime(postedAt) : formatDate(postedAt);
        card.append(createEl('p', { className: 'small text-muted mb-1', text: 'Posted on: ' + postedText }));

        const details = [];
        if (review.subject !== '') {
            details.push('Topic: ' + (SUBJECT_LABELS[review.subject] || review.subject));
        }
        if (review.recommend !== '') {
            details.push('Recommends us: ' + (review.recommend === 'yes' ? 'Yes' : 'No'));
        }
        if (review.visitDate !== '') {
            details.push('Visit date: ' + formatIsoDate(review.visitDate));
        }
        if (details.length > 0) {
            card.append(createEl('p', { className: 'small text-muted mb-1', text: details.join(' \u00B7 ') }));
        }
        if (review.reference !== '') {
            card.append(createEl('p', {
                className: 'small text-muted mb-0',
                text: 'Demo reference ' + review.reference + '. Shown on this page only; it was not sent or published and disappears when you refresh.'
            }));
        }

        if (review.link !== '') {
            const linkParagraph = createEl('p', { className: 'mb-0' });
            linkParagraph.append(createEl('a', {
                className: 'link-primary fw-bold',
                text: 'Read original review',
                attrs: { href: review.link, target: '_blank', rel: 'noopener' }
            }));
            card.append(linkParagraph);
        }
        return card;
    }

    /* ---------- controls (created by JavaScript above the list) ---------- */

    const searchInput = createEl('input', {
        className: 'form-control',
        attrs: { type: 'search', id: 'reviewSearch', placeholder: 'Name or words in the review', autocomplete: 'off' }
    });
    const sourceSelect = createEl('select', { className: 'form-select', attrs: { id: 'reviewSourceFilter' } });
    [['all', 'All reviews'], [SOURCE_2GIS, 'From 2GIS'], [SOURCE_SESSION, 'Added in this visit (demo)']]
        .forEach((pair) => sourceSelect.append(createEl('option', { text: pair[1], attrs: { value: pair[0] } })));
    const sortSelect = createEl('select', { className: 'form-select', attrs: { id: 'reviewSort' } });
    [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['author', 'Author A\u2013Z'], ['rating', 'Highest rating first']]
        .forEach((pair) => sortSelect.append(createEl('option', { text: pair[1], attrs: { value: pair[0] } })));
    const resetControlsButton = createButton('Reset', 'btn btn-outline-secondary w-100');

    const controlsRow = createEl('div', { className: 'row g-2 align-items-end mb-3' });
    const resetColumn = createEl('div', { className: 'col-6 col-md-2' });
    resetColumn.append(resetControlsButton);
    controlsRow.append(
        createLabeledControl('Search reviews', searchInput, 'col-12 col-md-4'),
        createLabeledControl('Show', sourceSelect, 'col-6 col-md-3'),
        createLabeledControl('Sort by', sortSelect, 'col-6 col-md-3'),
        resetColumn
    );

    const countLine = createEl('p', { className: 'small text-muted mb-1', attrs: { role: 'status', 'aria-live': 'polite' } });
    const summaryLine = createEl('p', { className: 'small text-muted mb-3' });
    const feed = createEl('div', { attrs: { id: 'reviewsFeed' } });

    const heading = host.querySelector('h2');
    if (heading) {
        heading.after(controlsRow, countLine, summaryLine, feed);
    } else {
        host.prepend(controlsRow, countLine, summaryLine, feed);
    }

    function createEmptyState(message, withReset) {
        const box = createEl('div', { className: 'bg-light rounded-3 p-4 text-center text-muted' });
        box.append(createEl('p', { className: withReset ? 'mb-2' : 'mb-0', text: message }));
        if (withReset) {
            box.append(createButton('Reset search and filters', 'btn btn-outline-primary btn-sm', { 'data-action': 'reset-controls' }));
        }
        return box;
    }

    function updateSummary() {
        const counts = countBySource(REVIEWS);
        const parts = [
            (counts[SOURCE_2GIS] || 0) + ' from 2GIS',
            (counts[SOURCE_SESSION] || 0) + ' added in this visit (demo)'
        ];
        const average = averageRating(REVIEWS);
        if (average !== null) {
            parts.push('average rating of rated reviews: ' + average.toFixed(1) + ' / 5');
        }
        summaryLine.textContent = parts.join(' \u00B7 ');
    }

    function renderReviews() {
        const visible = sortReviews(filterReviews(REVIEWS, searchInput.value, sourceSelect.value), sortSelect.value);
        if (REVIEWS.length === 0) {
            feed.replaceChildren(createEmptyState('There are no reviews on this page yet. Be the first to share your experience below.', false));
        } else if (visible.length === 0) {
            feed.replaceChildren(createEmptyState('No reviews match your search.', true));
        } else {
            feed.replaceChildren(...visible.map((review) => createReviewCard(review, review.id === state.justAddedId)));
        }
        countLine.textContent = 'Showing ' + visible.length + ' of ' + pluralize(REVIEWS.length, 'review') + '.';
        updateSummary();
    }

    function resetControls() {
        searchInput.value = '';
        sourceSelect.value = 'all';
        sortSelect.value = 'newest';
        state.justAddedId = null;
        renderReviews();
    }

    searchInput.addEventListener('input', renderReviews);
    sourceSelect.addEventListener('change', renderReviews);
    sortSelect.addEventListener('change', renderReviews);
    resetControlsButton.addEventListener('click', resetControls);
    feed.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action="reset-controls"]');
        if (button) {
            resetControls();
            searchInput.focus();
        }
    });

    /* ---------- review form ---------- */

    function readValues() {
        const checked = form.querySelector('input[name="recommend"]:checked');
        return {
            name: inputs.name.value,
            email: inputs.email.value,
            phone: inputs.phone.value,
            rating: inputs.rating.value,
            date: inputs.date.value,
            subject: inputs.subject.value,
            message: inputs.message.value,
            recommend: checked ? checked.value : 'yes'
        };
    }

    function isDuplicateReview(reviews, author, text) {
        const authorKey = normalizeText(author);
        const textKey = normalizeText(text);
        return reviews.find((review) => normalizeText(review.author) === authorKey && normalizeText(review.text) === textKey) !== undefined;
    }

    // Rules: name, email, phone, rating, date, text length, plus combined rating/topic/recommendation rules.
    function validateValues(values) {
        const checks = {
            name: Validators.checkPersonName(values.name),
            email: Validators.checkEmail(values.email),
            phone: Validators.checkPhone(values.phone, false),
            rating: Validators.checkInteger(values.rating, 'Rating', 1, 5),
            date: Validators.checkDate(values.date, 'Date of visit', { required: false, allowFuture: false }),
            message: Validators.checkText(values.message, 'Your review', MIN_MESSAGE, MAX_MESSAGE)
        };

        if (checks.rating === '') {
            const rating = Number(values.rating);
            if (values.subject === 'praise' && rating < 3) {
                checks.rating = 'A "Praise" review needs a rating of 3 or more. Change the rating or the subject.';
            } else if (values.subject === 'complaint' && rating > 3) {
                checks.rating = 'A "Complaint" needs a rating of 3 or less. Change the rating or the subject.';
            } else if (values.recommend === 'no' && rating >= 4) {
                checks.rating = 'You would not recommend us, but the rating is ' + rating + '. Please make them match.';
            } else if (values.recommend === 'yes' && rating <= 2) {
                checks.rating = 'You would recommend us, but the rating is ' + rating + '. Please make them match.';
            }
        }

        if (checks.name === '' && checks.message === '' && isDuplicateReview(REVIEWS, values.name, values.message)) {
            checks.message = 'This exact review was already added in this visit.';
        }

        const errors = {};
        Object.keys(checks).forEach((key) => {
            if (checks[key] !== '') {
                errors[key] = checks[key];
            }
        });
        return errors;
    }

    const validator = createFormValidator({
        inputs: inputs,
        keys: Object.keys(FIELD_LABELS),
        dependents: { subject: ['rating'], recommend: ['rating'] },
        readValues: readValues,
        validateValues: validateValues
    });

    function clearResult() {
        resultArea.replaceChildren();
        state.errorSummaryShown = false;
    }

    function showSuccess(review) {
        const showButton = createButton('Show my review', 'btn btn-outline-primary btn-sm');
        showButton.addEventListener('click', () => {
            const card = document.getElementById('review' + review.id);
            if (card) {
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
                card.focus();
            }
        });
        renderAlert(resultArea, {
            kind: 'success',
            title: 'Thank you, ' + review.author + '! Your review was added to this page for this visit only',
            message: 'It has NOT been sent to a server or published for other visitors, and it will disappear when you refresh the page. ' +
                'Demo reference: ' + review.reference + '.',
            actions: [showButton]
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        const invalidKeys = validator.validateAll();
        if (invalidKeys.length > 0) {
            renderErrorSummary(resultArea, invalidKeys, FIELD_LABELS);
            state.errorSummaryShown = true;
            focusFirstInvalid(form);
            return;
        }
        const review = createReviewObject(readValues(), nextReviewId(REVIEWS), new Date());
        REVIEWS.push(review);
        searchInput.value = '';
        sourceSelect.value = 'all';
        sortSelect.value = 'newest';
        state.justAddedId = review.id;
        renderReviews();

        state.skipResultClear = true;
        form.reset();
        showSuccess(review);
    }

    function handleFieldEvent(event) {
        const stillInvalid = validator.handleFieldEvent(event);
        if (stillInvalid === 0 && state.errorSummaryShown) {
            clearResult();
        }
    }

    function handleReset() {
        const keepResult = state.skipResultClear;
        state.skipResultClear = false;
        setTimeout(() => {
            validator.reset();
            updateCounter();
            if (!keepResult) {
                clearResult();
            }
        }, 0);
    }

    /* ---------- setup (runs once) ---------- */

    inputs.name.maxLength = 60;
    inputs.date.max = todayIsoDate(0);
    const updateCounter = attachCharCounter(inputs.message, MAX_MESSAGE);

    form.addEventListener('submit', handleSubmit);
    form.addEventListener('input', handleFieldEvent);
    form.addEventListener('change', handleFieldEvent);
    form.addEventListener('reset', handleReset);

    renderReviews();
})();
