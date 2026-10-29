'use strict';

const SiteUtils = (function () {
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const NAME_PATTERN = /^\p{L}[\p{L}\s'.-]*$/u;
    const PHONE_CHARS_PATTERN = /^\+?[\d\s()-]+$/;

    /*generic helpers*/

    function pad2(value) {
        return String(value).padStart(2, '0');
    }

    function createEl(tag, options) {
        const settings = options || {};
        const node = document.createElement(tag);
        if (settings.className) {
            node.className = settings.className;
        }
        if (settings.text !== undefined) {
            node.textContent = settings.text;
        }
        if (settings.attrs) {
            Object.keys(settings.attrs).forEach((name) => {
                node.setAttribute(name, settings.attrs[name]);
            });
        }
        return node;
    }

    function toIsoDate(date) {
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    function todayIsoDate(offsetDays) {
        const date = new Date();
        date.setDate(date.getDate() + (offsetDays || 0));
        return toIsoDate(date);
    }

    function formatDate(date) {
        return pad2(date.getDate()) + '.' + pad2(date.getMonth() + 1) + '.' + date.getFullYear();
    }

    function formatDateTime(date) {
        return formatDate(date) + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    }

    function formatIsoDate(isoDate) {
        const parts = isoDate.split('-');
        return parts[2] + '.' + parts[1] + '.' + parts[0];
    }

    // Demonstration reference only - NOT a real request/order number.
    function generateDemoReference(prefix) {
        const digits = Math.floor(Math.random() * 900000) + 100000;
        return prefix + '-' + digits;
    }

    function normalizeText(value) {
        return value.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    /*validators*/

    const Validators = {
        checkText: function (value, label, min, max) {
            const trimmed = value.trim();
            if (trimmed.length === 0) {
                return label + ' is required.';
            }
            if (trimmed.length < min) {
                return label + ' must be at least ' + min + ' characters (now ' + trimmed.length + ').';
            }
            if (trimmed.length > max) {
                return label + ' must be at most ' + max + ' characters (now ' + trimmed.length + ').';
            }
            return '';
        },

        checkPersonName: function (value) {
            const base = Validators.checkText(value, 'Name', 2, 60);
            if (base !== '') {
                return base;
            }
            if (!NAME_PATTERN.test(value.trim())) {
                return 'Name may contain only letters, spaces, apostrophes, dots and hyphens.';
            }
            return '';
        },

        checkEmail: function (value) {
            const trimmed = value.trim();
            if (trimmed === '') {
                return 'Email is required.';
            }
            if (!EMAIL_PATTERN.test(trimmed)) {
                return 'Enter a valid email address, for example name@example.com.';
            }
            return '';
        },

        checkPhone: function (value, required) {
            const trimmed = value.trim();
            if (trimmed === '') {
                return required ? 'Phone number is required.' : '';
            }
            if (!PHONE_CHARS_PATTERN.test(trimmed)) {
                return 'Phone may contain only digits, spaces, +, - and brackets.';
            }
            const digits = trimmed.replace(/\D/g, '');
            const startsCorrectly = digits.charAt(0) === '7' || digits.charAt(0) === '8';
            if (digits.length !== 11 || !startsCorrectly) {
                return 'Enter a Kazakhstan number with 11 digits, for example +7 (708) 111-57-57.';
            }
            return '';
        },

        checkInteger: function (raw, label, min, max) {
            const trimmed = raw.trim();
            if (trimmed === '') {
                return label + ' is required.';
            }
            if (!/^-?\d+$/.test(trimmed)) {
                return label + ' must be a whole number.';
            }
            const number = Number(trimmed);
            if (number < min || number > max) {
                return label + ' must be between ' + min + ' and ' + max + '.';
            }
            return '';
        },

        // options: { required, allowPast, allowFuture, maxDaysAhead }
        checkDate: function (raw, label, options) {
            const settings = Object.assign({ required: false, allowPast: true, allowFuture: true }, options);
            const trimmed = raw.trim();
            if (trimmed === '') {
                return settings.required ? label + ' is required.' : '';
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return label + ' is not a valid date.';
            }
            const parts = trimmed.split('-').map(Number);
            const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
            const isRealDate = parsed.getFullYear() === parts[0] &&
                parsed.getMonth() === parts[1] - 1 &&
                parsed.getDate() === parts[2];
            if (!isRealDate) {
                return label + ' is not a valid date.';
            }
            if (!settings.allowPast && trimmed < todayIsoDate(0)) {
                return label + ' cannot be in the past.';
            }
            if (!settings.allowFuture && trimmed > todayIsoDate(0)) {
                return label + ' cannot be in the future.';
            }
            if (settings.maxDaysAhead !== undefined && trimmed > todayIsoDate(settings.maxDaysAhead)) {
                return label + ' must be within the next ' + settings.maxDaysAhead + ' days.';
            }
            return '';
        }
    };


    function appendDescribedBy(input, id) {
        const current = input.getAttribute('aria-describedby');
        const ids = current ? current.split(' ') : [];
        if (!ids.includes(id)) {
            ids.push(id);
            input.setAttribute('aria-describedby', ids.join(' '));
        }
    }

    function getErrorElement(input) {
        const id = input.id + 'Error';
        let errorEl = document.getElementById(id);
        if (!errorEl) {
            errorEl = createEl('div', { className: 'invalid-feedback', attrs: { id: id } });
            input.insertAdjacentElement('afterend', errorEl);
            appendDescribedBy(input, id);
        }
        return errorEl;
    }

    function setFieldError(input, message) {
        getErrorElement(input).textContent = '\u26A0 ' + message;
        input.classList.remove('is-valid', 'success');
        input.classList.add('is-invalid', 'error');
        input.setAttribute('aria-invalid', 'true');
    }

    function setFieldValid(input) {
        getErrorElement(input).textContent = '';
        input.classList.remove('is-invalid', 'error');
        input.classList.add('is-valid', 'success');
        input.removeAttribute('aria-invalid');
    }

    function clearFieldState(input) {
        const errorEl = document.getElementById(input.id + 'Error');
        if (errorEl) {
            errorEl.textContent = '';
        }
        input.classList.remove('is-invalid', 'is-valid', 'error', 'success');
        input.removeAttribute('aria-invalid');
    }

    function focusFirstInvalid(form) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return firstInvalid;
    }


    // options: { kind, title, message, rows: [[label, value]], actions: [buttons] }
    function renderAlert(container, options) {
        const icons = { success: '\u2713 ', danger: '\u26A0 ', warning: '\u26A0 ', info: '\u2139 ' };
        const alertBox = createEl('div', { className: 'alert alert-' + options.kind + ' mt-3 mb-0 fade-in-up' });
        if (options.title) {
            alertBox.append(createEl('p', {
                className: 'fw-bold mb-1',
                text: (icons[options.kind] || '') + options.title
            }));
        }
        if (options.message) {
            const hasRows = Boolean(options.rows && options.rows.length > 0);
            alertBox.append(createEl('p', { className: hasRows ? 'mb-2' : 'mb-0', text: options.message }));
        }
        if (options.rows && options.rows.length > 0) {
            const list = createEl('dl', { className: 'row mb-0 small' });
            options.rows.forEach((row) => {
                list.append(
                    createEl('dt', { className: 'col-sm-4', text: row[0] }),
                    createEl('dd', { className: 'col-sm-8 mb-1 text-break', text: row[1] })
                );
            });
            alertBox.append(list);
        }
        if (options.actions && options.actions.length > 0) {
            const bar = createEl('div', { className: 'd-flex flex-wrap gap-2 mt-3' });
            bar.append(...options.actions);
            alertBox.append(bar);
        }
        container.replaceChildren(alertBox);
        return alertBox;
    }

    function renderErrorSummary(container, invalidKeys, labels) {
        const names = invalidKeys.map((key) => labels[key] || key).join(', ');
        const count = invalidKeys.length;
        return renderAlert(container, {
            kind: 'danger',
            title: 'Please correct ' + count + (count === 1 ? ' field' : ' fields'),
            message: 'Nothing was submitted. Check the marked fields: ' + names + '.'
        });
    }

    function createButton(label, className, attrs) {
        return createEl('button', {
            className: className,
            text: label,
            attrs: Object.assign({ type: 'button' }, attrs)
        });
    }

    // Wraps a control with a visible label inside a Bootstrap column.
    function createLabeledControl(labelText, control, columnClass) {
        const column = createEl('div', { className: columnClass });
        column.append(createEl('label', {
            className: 'form-label small fw-semibold mb-1',
            text: labelText,
            attrs: { for: control.id }
        }), control);
        return column;
    }

    // Live character counter under a text field; returns an update function.
    function attachCharCounter(input, max) {
        const counter = createEl('div', { className: 'form-text', attrs: { id: input.id + 'Counter' } });
        input.maxLength = max;
        input.insertAdjacentElement('afterend', counter);
        appendDescribedBy(input, counter.id);

        function update() {
            const length = input.value.length;
            const atLimit = length >= max;
            counter.textContent = length + ' / ' + max + ' characters' + (atLimit ? ' (limit reached)' : '');
            counter.classList.toggle('text-danger', atLimit);
        }

        input.addEventListener('input', update);
        update();
        return update;
    }

    function createFormValidator(config) {
        const state = { attempted: false };

        function applyFieldResult(key, message) {
            const input = config.inputs[key];
            if (message) {
                setFieldError(input, message);
            } else if (input.value.trim() !== '') {
                setFieldValid(input);
            } else {
                clearFieldState(input);
            }
        }

        function runChecks(keys) {
            const errors = config.validateValues(config.readValues());
            keys.forEach((key) => applyFieldResult(key, errors[key]));
            return errors;
        }

        function invalidKeys() {
            return config.keys.filter((key) => config.inputs[key].classList.contains('is-invalid'));
        }

        function validateAll() {
            state.attempted = true;
            runChecks(config.keys);
            return invalidKeys();
        }

        function keyFor(target) {
            const found = Object.keys(config.inputs).find((key) => [].concat(config.inputs[key]).includes(target));
            return found || null;
        }

        // Called from input/change listeners. Returns how many fields are still invalid.
        function handleFieldEvent(event) {
            const key = keyFor(event.target);
            const keysToCheck = [];
            if (state.attempted) {
                keysToCheck.push(...config.keys);
            } else if (key !== null) {
                const isValidated = config.keys.includes(key);
                const hasError = isValidated && config.inputs[key].classList.contains('is-invalid');
                if (isValidated && (event.type === 'change' || hasError)) {
                    keysToCheck.push(key);
                }
                (config.dependents[key] || []).forEach((dependent) => {
                    if (config.inputs[dependent].classList.contains('is-invalid')) {
                        keysToCheck.push(dependent);
                    }
                });
            }
            if (keysToCheck.length > 0) {
                runChecks(keysToCheck);
            }
            return invalidKeys().length;
        }

        function reset() {
            state.attempted = false;
            config.keys.forEach((key) => clearFieldState(config.inputs[key]));
        }

        return { validateAll, handleFieldEvent, invalidKeys, reset, runChecks };
    }

    return Object.freeze({
        createEl, createButton, createLabeledControl, attachCharCounter,
        Validators, setFieldError, setFieldValid, clearFieldState, focusFirstInvalid,
        renderAlert, renderErrorSummary, createFormValidator,
        todayIsoDate, formatDate, formatDateTime, formatIsoDate,
        generateDemoReference, normalizeText
    });
})();
