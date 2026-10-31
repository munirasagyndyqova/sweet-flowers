/*
 * old-js-version.js - NOT linked to any page.
 * The plain-JavaScript versions of the three features that jq-contacts.js rewrites with jQuery,
 * kept here so both versions can be compared side by side:
 *   1. oldToggleAside            -> "FEATURE 1" in jq-contacts.js
 *   2. oldFilterButtons          -> "FEATURE 2" in jq-contacts.js
 *   3. oldValidateContactForm    -> "FEATURE 3" in jq-contacts.js
 */

/* ---------- 1. show / hide a block ---------- */
function oldToggleAside() {
    var aside = document.querySelector('aside');
    var details = document.createElement('div');
    details.className = 'aside-details';

    var children = Array.prototype.slice.call(aside.children);
    children.forEach(function (child) {
        if (child.tagName !== 'H3') { details.appendChild(child); }
    });
    aside.appendChild(details);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-primary mb-3';
    btn.textContent = 'Hide details';
    btn.setAttribute('aria-expanded', 'true');
    aside.insertBefore(btn, details);

    btn.addEventListener('click', function () {
        var isHidden = details.style.display === 'none';
        details.style.display = isHidden ? '' : 'none';       // no animation
        btn.textContent = isHidden ? 'Hide details' : 'Show details';
        btn.setAttribute('aria-expanded', String(isHidden));
    });
}

/* ---------- 2. filter buttons built in code ---------- */
function oldFilterButtons() {
    var table = document.querySelector('table');
    var rows = table.querySelectorAll('tbody tr');
    var hoursList = ['All'];

    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].querySelectorAll('td');
        var hours = cells[cells.length - 1].textContent.trim();
        rows[i].setAttribute('data-hours', hours);
        if (hoursList.indexOf(hours) === -1) { hoursList.push(hours); }
    }

    var wrapper = document.querySelector('.table-responsive');
    var panel = document.createElement('div');
    panel.className = 'btn-group mb-2';
    panel.setAttribute('role', 'group');
    wrapper.parentNode.insertBefore(panel, wrapper);

    var count = document.createElement('p');
    count.className = 'small text-muted mb-3';
    count.textContent = 'Showing ' + rows.length + ' of ' + rows.length + ' shops';
    wrapper.parentNode.insertBefore(count, wrapper);

    hoursList.forEach(function (hours, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-primary filter-btn' + (index === 0 ? ' active' : '');
        btn.setAttribute('data-hours', hours);
        btn.textContent = hours === 'All' ? 'All shops' : hours;

        btn.addEventListener('click', function () {           // one listener PER button
            var buttons = panel.querySelectorAll('.filter-btn');
            for (var j = 0; j < buttons.length; j++) { buttons[j].classList.remove('active'); }
            btn.classList.add('active');

            var shown = 0;
            for (var k = 0; k < rows.length; k++) {
                var match = hours === 'All' || rows[k].getAttribute('data-hours') === hours;
                rows[k].style.display = match ? '' : 'none';  // no fade
                if (match) { shown++; }
            }
            count.textContent = 'Showing ' + shown + ' of ' + rows.length + ' shops';
        });

        panel.appendChild(btn);
    });
}

/* ---------- 3. validation of the feedback form ---------- */
function oldValidateContactForm() {
    var form = document.getElementById('contactForm');
    var result = document.getElementById('contactResult');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var oldErrors = form.querySelectorAll('.error-msg');
        for (var i = 0; i < oldErrors.length; i++) { oldErrors[i].parentNode.removeChild(oldErrors[i]); }
        var oldBad = form.querySelectorAll('.is-invalid');
        for (var j = 0; j < oldBad.length; j++) { oldBad[j].classList.remove('is-invalid'); }

        var ok = true;
        function fail(input, message) {
            ok = false;
            input.classList.add('is-invalid');
            var div = document.createElement('div');
            div.className = 'error-msg text-danger small mt-1';
            div.textContent = message;
            input.parentNode.insertBefore(div, input.nextSibling);
        }

        var name = document.getElementById('contactName');
        name.value = name.value.trim();
        if (name.value.length < 2) { fail(name, 'Please enter your name (at least 2 characters).'); }

        var email = document.getElementById('contactEmail');
        email.value = email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value)) { fail(email, 'Enter a valid email, for example name@example.com.'); }

        var phone = document.getElementById('contactPhone');
        phone.value = phone.value.trim();
        var digits = phone.value.replace(/\D/g, '');
        if (phone.value !== '' && !(digits.length >= 10 && digits.length <= 12)) { fail(phone, 'Use a phone like +7 (708) 111-57-57.'); }

        var message = document.getElementById('contactMessage');
        message.value = message.value.trim();
        if (message.value.length < 10) { fail(message, 'Your message is too short (at least 10 characters).'); }

        if (!ok) { return; }

        result.className = 'result-area alert alert-success mt-3';
        result.textContent = 'Thank you, ' + name.value + '! We will contact you soon.';
        form.reset();
    });

    // clear an error as soon as the visitor edits the field
    form.addEventListener('input', function (event) {
        var field = event.target;
        if (field.classList.contains('is-invalid')) {
            field.classList.remove('is-invalid');
            var next = field.nextElementSibling;
            if (next && next.classList.contains('error-msg')) { next.parentNode.removeChild(next); }
        }
    });
}
