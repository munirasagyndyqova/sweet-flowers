/*
 * jq-my-orders.js - login form, dashboard, logout for my-orders.html.
 * Needs jq-common.js (SF.form, SF.valid, SF.formatPrice, SF.fmtDate)
 * and jq-auth.js (SF.auth).
 */
(function ($) {
    'use strict';

    var SF = window.SF;

    function showLogin() {
        $('#loginView').removeClass('d-none');
        $('#dashboardView').addClass('d-none');
    }

    function showDashboard(user) {
        $('#loginView').addClass('d-none');
        $('#dashboardView').removeClass('d-none');
        $('#customerName').text(user.username);

        SF.auth.getOrders(user.id).then(function (orders) {
            renderCounts(orders);
            renderOrders(orders);
        }, function () {
            renderCounts([]);
            renderOrders([]);
        });
    }

    function renderCounts(orders) {
        var active = 0, awaiting = 0, completed = 0;
        orders.forEach(function (o) {
            if (o.status === 'active')         { active++; }
            else if (o.status === 'awaiting')  { awaiting++; }
            else if (o.status === 'completed') { completed++; }
        });
        $('#activeCount').text(active);
        $('#awaitingCount').text(awaiting);
        $('#completedCount').text(completed);
    }

    function statusBadge(status) {
        var map = {
            awaiting:  'bg-warning text-dark',
            active:    'bg-primary',
            completed: 'bg-success'
        };
        return $('<span>')
            .addClass('badge ' + (map[status] || 'bg-secondary'))
            .text(status || '—');
    }

    function renderOrders(orders) {
        var $tbody = $('#ordersTbody').empty();

        if (!orders.length) {
            $tbody.append(
                $('<tr>').append(
                    $('<td>')
                        .attr('colspan', 6)
                        .addClass('text-center text-muted py-4')
                        .text('You have no orders yet.')
                )
            );
            return;
        }

        orders.forEach(function (o) {
            $tbody.append(
                $('<tr>').append(
                    $('<td>').text('#' + o.id),
                    $('<td>').text(o.bouquet || ''),
                    $('<td>').text(SF.fmtDate(o.ordered)),
                    $('<td>').text(SF.fmtDate(o.delivery) + ' ' + (o.time || '')),
                    $('<td>').append(statusBadge(o.status)),
                    $('<td>').addClass('text-end').text(SF.formatPrice(Number(o.total) || 0))
                )
            );
        });
    }

    $(function () {
        // Already signed in? Jump straight to the dashboard.
        if (SF.auth.sessionName()) {
            SF.auth.currentUser().then(function (user) {
                if (user) { showDashboard(user); } else { showLogin(); }
            }, showLogin);
        } else {
            showLogin();
        }

        // Login button
        $('#loginBtn').on('click', function () {
            var $result  = $('#loginResult').removeClass().addClass('result-area').empty();
            var identity = String($('#loginUsername').val() || '').trim();
            var password = String($('#loginPassword').val() || '');

            if (!identity || !password) {
                $result.addClass('alert alert-danger mt-3')
                    .text('Please enter your name/email and password.');
                return;
            }

            var $btn = $(this).prop('disabled', true).text('Logging in...');

            SF.auth.login(identity, password).then(function () {
                // Reload so main.js rewrites the menu ("Register" -> "Hi, <name>"),
                // then our start-up code shows the dashboard.
                window.location.reload();
            }, function (err) {
                $btn.prop('disabled', false).text('Log in');
                $result.addClass('alert alert-danger mt-3')
                    .text(err && err.message ? err.message : 'Login failed.');
            });
        });

        // Enter key anywhere in the login form triggers the login button
        $('#loginForm').on('submit', function (e) {
            e.preventDefault();
            $('#loginBtn').trigger('click');
        });
        $('#loginForm').on('keypress', 'input', function (e) {
            if (e.which === 13) { e.preventDefault(); $('#loginBtn').trigger('click'); }
        });

        // Logout
        $('#logoutBtn').on('click', function () {
            SF.auth.logout();
            window.location.reload();
        });
    });
}(jQuery));
