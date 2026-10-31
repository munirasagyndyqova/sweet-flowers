/*
 * jq-auth.js - registration, login, session and the "database" of Sweet Flowers.
 *
 * jQuery version: 3.7.1 (CDN, linked in <head> BEFORE this file). It is needed here for
 * $.getJSON (AJAX), the Deferred promises and for building the registration dialog in code.
 * Needs jq-common.js (SF.form) and main.js (its "Register" button, which we take over).
 *
 * HOW THE DATABASE WORKS
 *  - data/db.json is the database file: users and orders. It is read with $.getJSON().
 *  - A browser cannot write to a file on disk, so users who register on the site are saved
 *    in localStorage ('sf_users') and merged with the users from db.json on every read.
 *    To make registration write into db.json for real you need a server (Node/Express, PHP...).
 *  - Passwords are never stored as text: salt + SHA-256 (Web Crypto). This is a front-end demo;
 *    hashing in the browser does NOT replace real password handling on a server.
 *  - The session key 'sf_session_user' is the same key main.js reads, so its "Register"
 *    button disappears when somebody is logged in.
 */
(function ($) {
    'use strict';

    var SF = window.SF = window.SF || {};
    var SESSION_KEY = 'sf_session_user';
    var USERS_KEY = 'sf_users';
    var dbPromise = null;

    /* ======================= database layer ======================= */

    function fail(message, code, field) {
        return $.Deferred().reject({ message: message, code: code || 'error', field: field }).promise();
    }

    function loadDb() {
        if (!dbPromise) {
            dbPromise = $.getJSON('data/db.json').then(null, function () {
                dbPromise = null;                // allow a retry next time
                return fail('Could not load data/db.json. Open the site through a local web server, not as a file.', 'db');
            });
        }
        return dbPromise;
    }

    function readLocalUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
    }

    function writeLocalUsers(users) {
        try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); return true; } catch (e) { return false; }
    }

    function getUsers() {
        return loadDb().then(function (db) { return (db.users || []).concat(readLocalUsers()); });
    }


    function toHex(bytes) {
        return Array.from(new Uint8Array(bytes)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function randomHex(count) {
        var bytes = new Uint8Array(count);
        window.crypto.getRandomValues(bytes);
        return toHex(bytes);
    }

    function sha256(text) {
        var dfd = $.Deferred();
        if (!window.crypto || !window.crypto.subtle) {
            return dfd.reject({ message: 'Secure hashing is not available. Open the site on localhost or https.', code: 'error' }).promise();
        }
        window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(
            function (buffer) { dfd.resolve(toHex(buffer)); },
            function () { dfd.reject({ message: 'Could not process the password.', code: 'error' }); }
        );
        return dfd.promise();
    }

    /* ======================= auth API ======================= */

    function sessionName() { return localStorage.getItem(SESSION_KEY); }

    function register(data) {
        return getUsers().then(function (users) {
            var name = data.username.toLowerCase();
            var email = data.email.toLowerCase();
            if (users.some(function (u) { return u.username.toLowerCase() === name; })) {
                return fail('This username is already taken.', 'field', '#regUsername');
            }
            if (users.some(function (u) { return u.email.toLowerCase() === email; })) {
                return fail('An account with this email already exists.', 'field', '#regEmail');
            }
            var salt = randomHex(16);
            return sha256(salt + ':' + data.password).then(function (hash) {
                var user = {
                    id: users.reduce(function (max, u) { return Math.max(max, u.id); }, 0) + 1,
                    username: data.username,
                    email: data.email,
                    phone: data.phone || '',
                    salt: salt,
                    passwordHash: hash,
                    createdAt: new Date().toISOString().slice(0, 10)
                };
                var saved = readLocalUsers();
                saved.push(user);
                if (!writeLocalUsers(saved)) { return fail('Browser storage is disabled, so the account cannot be saved.', 'error'); }
                localStorage.setItem(SESSION_KEY, user.username);
                return user;
            });
        });
    }

    function login(identity, password) {
        return getUsers().then(function (users) {
            var wanted = identity.trim().toLowerCase();
            var user = users.find(function (u) {
                return u.username.toLowerCase() === wanted || u.email.toLowerCase() === wanted;
            });
            var wrong = 'Wrong name, email or password.';
            if (!user) { return fail(wrong, 'credentials'); }
            return sha256(user.salt + ':' + password).then(function (hash) {
                if (hash !== user.passwordHash) { return fail(wrong, 'credentials'); }
                localStorage.setItem(SESSION_KEY, user.username);
                return user;
            });
        });
    }

    function logout() { localStorage.removeItem(SESSION_KEY); }

    function currentUser() {
        var name = sessionName();
        if (!name) { return $.Deferred().resolve(null).promise(); }
        return getUsers().then(function (users) {
            return users.find(function (u) { return u.username === name; }) || null;
        });
    }

    function getOrders(userId) {
        return loadDb().then(function (db) {
            return (db.orders || [])
                .filter(function (o) { return o.userId === userId; })
                .sort(function (a, b) { return b.ordered.localeCompare(a.ordered) || b.id - a.id; });
        });
    }

    /* ======================= registration dialog ======================= */

    var STRENGTH = [
        { cls: '', label: '' },
        { cls: 'w-25 bg-danger', label: 'weak' },
        { cls: 'w-50 bg-warning', label: 'fair' },
        { cls: 'w-75 bg-info', label: 'good' },
        { cls: 'w-100 bg-success', label: 'strong' }
    ];

    function strength(pw) {
        if (!pw) { return 0; }
        var score = 1;
        if (pw.length >= 8) { score++; }
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) { score++; }
        if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) { score++; }
        return score;
    }

    function openRegisterDialog() {
        $('#sf-register-dialog').remove();

        // The col-* classes only give the dialog a sensible width; no new CSS is written.
        var $dialog = $('<dialog>')
            .attr('id', 'sf-register-dialog')
            .addClass('border-0 rounded-4 shadow-lg p-0 col-11 col-sm-8 col-md-6 col-xl-4');
        var $body = $('<div>').addClass('p-4').appendTo($dialog);

        var $head = $('<div>').addClass('d-flex justify-content-between align-items-start mb-3').appendTo($body);
        $('<div>').append(
            $('<h2>').addClass('h4 text-primary mb-1').text('Create your account'),
            $('<p>').addClass('text-muted small mb-0').text('Track your orders and order faster next time.')
        ).appendTo($head);
        $('<button>').attr({ type: 'button', 'aria-label': 'Close' }).addClass('btn-close').appendTo($head);

        // `novalidate` because our own validation shows one message per field;
        // the `required` attributes stay on the inputs and are read by SF.form.
        var $form = $('<form>').attr('novalidate', '').appendTo($body);

        // The fields are built from an array - this markup exists nowhere in the HTML files.
        var fields = [
            { id: 'regUsername',  label: 'Username',         type: 'text',     auto: 'username',     ph: 'e.g. aigerim_k' },
            { id: 'regEmail',     label: 'Email',            type: 'email',    auto: 'email',        ph: 'you@example.com' },
            { id: 'regPhone',     label: 'Phone (optional)', type: 'tel',      auto: 'tel',          ph: '+7 (___) ___-__-__', optional: true },
            { id: 'regPassword',  label: 'Password',         type: 'password', auto: 'new-password', ph: 'At least 8 characters' },
            { id: 'regPassword2', label: 'Repeat password',  type: 'password', auto: 'new-password', ph: 'Type it once more' }
        ];
        $.each(fields, function (_, f) {
            var $group = $('<div>').addClass('mb-3').appendTo($form);
            $('<label>').attr('for', f.id).addClass('form-label fw-semibold').text(f.label).appendTo($group);
            $('<input>')
                .attr({ id: f.id, name: f.id, type: f.type, placeholder: f.ph, autocomplete: f.auto })
                .prop('required', !f.optional)
                .addClass('form-control')
                .appendTo($group);
        });

        // Password strength meter: the width and colour come from classes that already exist (w-25..w-100, bg-*).
        var $pwGroup = $form.find('#regPassword').parent();
        var $bar = $('<div>').addClass('progress-bar').appendTo(
            $('<div>').addClass('progress mt-2').attr({ role: 'progressbar', 'aria-label': 'Password strength' }).appendTo($pwGroup)
        );
        var $meterText = $('<small>').addClass('text-muted').appendTo($pwGroup);

        var $showRow = $('<div>').addClass('form-check mb-2').appendTo($form);
        $('<input>').attr({ type: 'checkbox', id: 'regShow' }).addClass('form-check-input').appendTo($showRow);
        $('<label>').attr('for', 'regShow').addClass('form-check-label').text('Show passwords').appendTo($showRow);

        var $termsRow = $('<div>').addClass('form-check mb-3').appendTo($form);
        $('<input>').attr({ type: 'checkbox', id: 'regTerms' }).prop('required', true).addClass('form-check-input').appendTo($termsRow);
        $('<label>').attr('for', 'regTerms').addClass('form-check-label')
            .text('I agree that my data is stored in this demo project.').appendTo($termsRow);

        var $submit = $('<button>').attr('type', 'submit').addClass('btn btn-primary w-100').text('Create account').appendTo($form);
        $('<p>').addClass('text-center small mt-3 mb-0').text('Already registered? ')
            .append($('<a>').attr('href', 'my-orders.html').addClass('link-primary fw-bold').text('Log in'))
            .appendTo($body);
        var $result = $('<div>').addClass('alert mt-3 mb-0').attr({ role: 'status', 'aria-live': 'polite' }).hide().appendTo($body);

        var rules = [
            { field: '#regUsername', check: function (v) {
                return /^[A-Za-z0-9_.-]{3,20}$/.test(v) ? '' : 'Use 3-20 letters, digits, dots, dashes or underscores.';
            } },
            { field: '#regEmail', check: function (v) {
                return SF.valid.email(v) ? '' : 'Enter a valid email, for example name@example.com.';
            } },
            { field: '#regPhone', check: function (v) {
                return SF.valid.phone(v) ? '' : 'Use a phone like +7 (708) 111-57-57.';
            } },
            { field: '#regPassword', raw: true, check: function (v) {
                if (v.length < 8) { return 'Password must be at least 8 characters.'; }
                if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) { return 'Add at least one letter and one digit.'; }
                return '';
            } },
            { field: '#regPassword2', raw: true, check: function (v, $f) {
                return v === $f.closest('form').find('#regPassword').val() ? '' : 'The passwords do not match.';
            } },
            { field: '#regTerms' }
        ];
        SF.form.watch($form, rules);

        $form.on('input', '#regPassword', function () {
            var pw = $(this).val();
            var level = STRENGTH[strength(pw)];
            $bar.removeClass('w-25 w-50 w-75 w-100 bg-danger bg-warning bg-info bg-success').addClass(level.cls);
            $meterText.text(pw ? 'Password strength: ' + level.label : '');
        });

        $form.on('change', '#regShow', function () {
            // .prop('checked') is the LIVE state of the checkbox. .attr('checked') would only return
            // what was written in the HTML at the start, and would not change when the visitor clicks.
            var type = $(this).prop('checked') ? 'text' : 'password';
            $form.find('#regPassword, #regPassword2').attr('type', type);
        });

        $form.on('submit', function (event) {
            event.preventDefault();      // without it the browser would submit the form and reload the page, and our checks would never show
            $result.stop(true, true).hide();
            if (!SF.form.run($form, rules)) { return; }

            var data = {
                username: $form.find('#regUsername').val(),
                email: $form.find('#regEmail').val(),
                phone: $form.find('#regPhone').val(),
                password: $form.find('#regPassword').val()
            };
            $submit.prop('disabled', true).text('Creating account...');

            register(data).then(function (user) {
                $result
                    .removeClass('alert-danger').addClass('alert-success')
                    .text('Welcome, ' + user.username + '! Your account is ready. Opening My Orders...')
                    .hide().fadeIn(300).delay(1500)
                    .fadeOut(300, function () { window.location.href = 'my-orders.html'; });   // callback: runs only after the fade ends
            }, function (err) {
                if (err.field) {
                    var $bad = $form.find(err.field);
                    SF.form.setError($bad, err.message);
                    $bad.trigger('focus');
                } else {
                    $result.removeClass('alert-success').addClass('alert-danger').text(err.message).hide().fadeIn(300);
                }
                $submit.prop('disabled', false).text('Create account');
            });
        });

        $dialog.on('click', '.btn-close', function () { $dialog[0].close(); });
        $dialog.on('click', function (event) { if (event.target === this) { this.close(); } });   // click on the dark backdrop
        $dialog.on('close', function () { $dialog.remove(); });

        $dialog.appendTo('body');
        $dialog[0].showModal();                  // <dialog> has no jQuery equivalent: we call the native method on the raw element
        $form.find('#regUsername').trigger('focus');
    }

    /* ======================= the nav button ======================= */

    $(function () {
        var $nav = $('header nav ul');
        var name = sessionName();

        if (name) {
            $('<li>').addClass('nav-item').append(
                $('<a>').attr('href', 'my-orders.html')
                    .addClass('btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary')
                    .text('Hi, ' + name)
            ).appendTo($nav);
            return;
        }

        // We keep the button, replace its handler with ours and restyle it with existing classes.
        $nav.find('[data-auth-trigger] button')
            .off('click')
            .on('click', openRegisterDialog)
            .removeClass('nav-link text-white bg-transparent border-0')
            .addClass('btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary');
    });

    SF.auth = {
        register: register,
        login: login,
        logout: logout,
        sessionName: sessionName,
        currentUser: currentUser,
        getOrders: getOrders,
        openRegisterDialog: openRegisterDialog
    };
}(jQuery));
