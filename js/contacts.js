'use strict';


(function () {
    if (typeof SiteUtils === 'undefined') {
        console.warn('contacts.js: js/utils.js is not loaded.');
        return;
    }

    const form = document.getElementById('contactForm');
    const resultArea = document.getElementById('contactResult');
    if (!form || !resultArea) {
        return;
    }

    const {
        Validators, createEl, createButton, renderAlert, renderErrorSummary, attachCharCounter,
        focusFirstInvalid, createFormValidator, generateDemoReference, formatIsoDate, todayIsoDate
    } = SiteUtils;

    const MAX_QUANTITY = 100;
    const MIN_MESSAGE = 10;
    const MAX_MESSAGE = 500;
    const MAX_DAYS_AHEAD = 365;

    const FIELD_LABELS = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        quantity: 'Number of bouquets',
        date: 'Delivery date',
        message: 'Message'
    };

    const inputs = {
        name: document.getElementById('contactName'),
        email: document.getElementById('contactEmail'),
        phone: document.getElementById('contactPhone'),
        quantity: document.getElementById('contactQuantity'),
        date: document.getElementById('contactDate'),
        subject: document.getElementById('contactSubject'),
        message: document.getElementById('contactMessage'),
        method: Array.from(form.querySelectorAll('input[name="contact_method"]'))
    };
    const newsletterInput = document.getElementById('contactNewsletter');
    const submitButton = document.getElementById('contactSubmit');

    const state = { submitted: false, errorSummaryShown: false };

    /* ---------- reading and validating values ---------- */

    function readValues() {
        const checkedMethod = form.querySelector('input[name="contact_method"]:checked');
        return {
            name: inputs.name.value,
            email: inputs.email.value,
            phone: inputs.phone.value,
            quantity: inputs.quantity.value,
            date: inputs.date.value,
            subject: inputs.subject.value,
            message: inputs.message.value,
            method: checkedMethod ? checkedMethod.value : 'phone',
            newsletter: newsletterInput.checked
        };
    }

    // Returns { fieldKey: message }. Rules 3 and 4 combine several fields.
    function validateValues(values) {
        const errors = {};
        const needsDate = values.subject === 'order';
        const needsPhone = values.method === 'phone';

        const checks = {
            name: Validators.checkPersonName(values.name),
            email: Validators.checkEmail(values.email),
            phone: Validators.checkPhone(values.phone, needsPhone),
            quantity: Validators.checkInteger(values.quantity, 'Number of bouquets', 1, MAX_QUANTITY),
            date: Validators.checkDate(values.date, 'Delivery date', {
                required: needsDate,
                allowPast: false,
                maxDaysAhead: MAX_DAYS_AHEAD
            }),
            message: Validators.checkText(values.message, 'Message', MIN_MESSAGE, MAX_MESSAGE)
        };

        // Combined-field messages: explain WHY the field is required.
        if (needsPhone && values.phone.trim() === '') {
            checks.phone = 'Phone number is required because you chose to be contacted by phone.';
        }
        if (needsDate && values.date.trim() === '') {
            checks.date = 'Choose a delivery date: it is required for an order inquiry.';
        }

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
        dependents: { subject: ['date'], method: ['phone'] },
        readValues: readValues,
        validateValues: validateValues
    });

    /* ---------- inquiry type hint ---------- */

    function getSubjectHint(subject) {
        switch (subject) {
            case 'order':
                return 'Order inquiries need a preferred delivery date and the number of bouquets.';
            case 'feedback':
                return 'Tell us what you liked or what we can improve.';
            case 'complaint':
                return 'Please describe the problem so the team can understand what happened.';
            default:
                return 'Any other question is welcome. The delivery date is optional.';
        }
    }

    const subjectHint = createEl('div', { className: 'form-text', attrs: { id: 'contactSubjectHint' } });
    inputs.subject.insertAdjacentElement('afterend', subjectHint);
    inputs.subject.setAttribute('aria-describedby', 'contactSubjectHint');

    function updateSubjectHint() {
        subjectHint.textContent = getSubjectHint(inputs.subject.value);
    }

    /* ---------- summary after successful validation ---------- */

    function labelOf(select) {
        return select.options[select.selectedIndex].textContent;
    }

    function buildSummaryRows(values) {
        const phoneText = values.phone.trim() === '' ? 'Not provided' : values.phone.trim();
        const dateText = values.date === '' ? 'Not specified' : formatIsoDate(values.date);
        const methodText = values.method === 'email' ? 'Email' : 'Phone';
        return [
            ['Name', values.name.trim()],
            ['Email', values.email.trim()],
            ['Phone', phoneText],
            ['Preferred contact', methodText],
            ['Inquiry type', labelOf(inputs.subject)],
            ['Number of bouquets', String(Number(values.quantity))],
            ['Preferred delivery date', dateText],
            ['Newsletter', values.newsletter ? 'Yes' : 'No'],
            ['Message', values.message.trim()]
        ];
    }

    /* ---------- state helpers ---------- */

    function lockSubmit(locked) {
        submitButton.disabled = locked;
    }

    function clearResult() {
        resultArea.replaceChildren();
        state.errorSummaryShown = false;
    }

    function releaseSubmittedState() {
        state.submitted = false;
        lockSubmit(false);
        clearResult();
    }

    function showSuccess(values) {
        const reference = generateDemoReference('DEMO');
        const editButton = createButton('Edit details', 'btn btn-outline-primary btn-sm');
        const newButton = createButton('Write another message', 'btn btn-outline-secondary btn-sm');

        editButton.addEventListener('click', () => {
            releaseSubmittedState();
            inputs.name.focus();
        });
        newButton.addEventListener('click', () => {
            form.reset();
            inputs.name.focus();
        });

        const rows = buildSummaryRows(values);
        rows.push(['Demo reference', reference + ' (for practice only, not a real request number)']);

        const alertBox = renderAlert(resultArea, {
            kind: 'success',
            title: 'Your message passed all checks',
            message: 'It has NOT been sent to a server, and nobody at Sweet Flowers has received it. ' +
                'To reach the shop now, call +7 (708) 111-57-57 or write to info@sweetflowers.kz.',
            rows: rows,
            actions: [editButton, newButton]
        });
        alertBox.setAttribute('tabindex', '-1');
        alertBox.focus();
    }

    /* ---------- event handlers ---------- */

    function handleSubmit(event) {
        event.preventDefault();
        if (state.submitted) {
            return;
        }
        const invalidKeys = validator.validateAll();
        if (invalidKeys.length > 0) {
            renderErrorSummary(resultArea, invalidKeys, FIELD_LABELS);
            state.errorSummaryShown = true;
            focusFirstInvalid(form);
            return;
        }
        state.submitted = true;
        lockSubmit(true);
        showSuccess(readValues());
    }

    function handleFieldEvent(event) {
        if (state.submitted) {
            releaseSubmittedState();
        }
        if (event.target === inputs.subject) {
            updateSubjectHint();
        }
        const stillInvalid = validator.handleFieldEvent(event);
        if (stillInvalid === 0 && state.errorSummaryShown) {
            clearResult();
        }
    }

    function handleReset() {
        // The browser restores default values AFTER the reset event, so wait one tick.
        setTimeout(() => {
            validator.reset();
            releaseSubmittedState();
            updateSubjectHint();
            updateCounter();
        }, 0);
    }

    /* ---------- setup (runs once) ---------- */

    inputs.name.maxLength = 60;
    inputs.date.min = todayIsoDate(0);
    inputs.date.max = todayIsoDate(MAX_DAYS_AHEAD);
    const updateCounter = attachCharCounter(inputs.message, MAX_MESSAGE);
    updateSubjectHint();

    form.addEventListener('submit', handleSubmit);
    form.addEventListener('input', handleFieldEvent);
    form.addEventListener('change', handleFieldEvent);
    form.addEventListener('reset', handleReset);
})();
