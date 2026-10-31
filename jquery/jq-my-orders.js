/*
 * jq-my-orders.js - My Orders page (my-orders.html): login, dashboard, orders table.
 *
 * jQuery version: 3.7.1 from code.jquery.com, linked in <head> before this file. It is needed because
 * everything below calls $; a library that has not loaded yet cannot be called.
 * Needs jq-common.js (SF.form), jq-auth.js (SF.auth) and main.js (formatPrice) loaded before it.
 * The data comes from data/db.json through SF.auth (AJAX); the table rows are built here from an array.
 */
$(function () {
    var STATUS = {
        active:    { label: 'In progress',       badge: 'bg-primary' },
        awaiting:  { label: 'Awaiting delivery', badge: 'bg-warning text-dark' },
        completed: { label: 'Delivered',         badge: 'bg-success' }
    };

    var $loginView = $('#loginView');
    var $loginForm = $('#loginForm');
    var $loginResult = $('#loginResult');
    var $dashboard = $('#dashboardView');

    /* ---------------- login view: two extra buttons / hints built in code ---------------- */

    // The "Log in" button is type="button", so Enter in the password box did nothing.
    // Making it a submit button lets the form's own submit event handle both click and Enter.
    $('#loginBtn').prop('type', 'submit');

    $('<button>').attr('type', 'button').addClass('btn btn-outline-primary').text('Create account')
        .insertAfter('#loginBtn')
        .on('click', function () { SF.auth.openRegisterDialog(); });

    $('<p>').addClass('text-center text-muted small mt-3 mb-0')
        .html('Demo account: <code>demo</code> / <code>Demo1234</code>')   // .html(): this is our own markup
        .appendTo($loginView);

    /* ---------------- login ---------------- */

    var loginRules = [
        { field: '#loginUsername' },              // required comes from the HTML attribute
        { field: '#loginPassword', raw: true }    // raw: a password is never trimmed
    ];
    SF.form.watch($loginForm, loginRules);

    $loginForm.on('submit', function (event) {
        event.preventDefault();       // otherwise the page reloads before the login result can be shown
        $loginResult.empty().removeClass('alert alert-danger mt-3');
        if (!SF.form.run($loginForm, loginRules)) { return; }

        var $btn = $('#loginBtn').prop('disabled', true);
        SF.auth.login($('#loginUsername').val(), $('#loginPassword').val()).then(function (user) {
            showDashboard(user);
        }, function (err) {
            if (err.code === 'credentials') {
                SF.form.setError($('#loginPassword'), err.message);
            } else {
                showProblem(err);
            }
        }).always(function () { $btn.prop('disabled', false); });
    });

    function showProblem(err) {
        $loginView.removeClass('is-hidden');
        $loginResult.addClass('alert alert-danger mt-3').text(err.message);
    }

    /* ---------------- dashboard ---------------- */

    // Numbers count up from 0: .animate() on a plain object, .text() written on every step.
    function countUp($el, target) {
        $({ n: 0 }).animate({ n: target }, {
            duration: 700,
            step: function (now) { $el.text(Math.ceil(now)); },
            complete: function () { $el.text(target); }
        });
    }

    function renderSummary(orders) {
        $.each({ active: '#activeCount', awaiting: '#awaitingCount', completed: '#completedCount' }, function (status, selector) {
            var total = orders.filter(function (o) { return o.status === status; }).length;
            countUp($(selector), total);
        });
    }

    // The whole table body is built from the array: the HTML only has a "Loading orders..." row.
    function renderOrders(orders) {
        var $tbody = $('#ordersTbody').empty();

        if (!orders.length) {
            var $cell = $('<td>').attr('colspan', 6).addClass('text-center text-muted py-4').text('You have no orders yet. ');
            $('<a>').attr('href', 'order.html').addClass('link-primary fw-bold').text('Order your first bouquet').appendTo($cell);
            $('<tr>').append($cell).appendTo($tbody);
            return;
        }

        $.each(orders, function (i, o) {
            var st = STATUS[o.status] || { label: o.status, badge: 'bg-secondary' };
            var $row = $('<tr>').attr('data-status', o.status);
            $('<td>').addClass('fw-semibold').text('#' + o.id).appendTo($row);
            $('<td>').text(o.bouquet).appendTo($row);
            $('<td>').text(SF.fmtDate(o.ordered)).appendTo($row);
            $('<td>').text(SF.fmtDate(o.delivery)).appendTo($row);
            $('<td>').append($('<span>').addClass('badge ' + st.badge).text(st.label)).appendTo($row);
            $('<td>').addClass('text-end fw-semibold').text(formatPrice(o.total)).appendTo($row);

            /* CHAIN, link by link (rows appear one after another):
             *  $row.hide()          - hides the finished row so it can fade in
             *  .appendTo($tbody)    - puts it into the table
             *  .delay(i * 80)       - waits a little longer for each next row
             *  .fadeIn(300)         - shows it with a 300 ms fade */
            $row.hide().appendTo($tbody).delay(i * 80).fadeIn(300);
        });
    }

    function revealDashboard() {
        // CHAIN: remove the class that hides the section -> hide it for the animation -> fade it in.
        $dashboard.removeClass('is-hidden').hide().fadeIn(500);
    }

    function showDashboard(user) {
        SF.auth.getOrders(user.id).then(function (orders) {
            $('#customerName').text(user.username);   // .text(): a name must never be parsed as HTML
            renderOrders(orders);
            renderSummary(orders);
            if ($loginView.is(':visible')) {
                $loginView.slideUp(300, revealDashboard);   // callback: the dashboard appears when the form has gone
            } else {
                revealDashboard();
            }
        }, showProblem);
    }

    /* ---------------- clickable status cards = filter for the table ---------------- */

    $('<p>').addClass('small text-muted mb-3').text('Tip: click a status card to filter your orders.')
        .insertAfter('.status-summary');
    $('.status-summary article').attr({ role: 'button', tabindex: 0, title: 'Click to filter the table' });

    $dashboard.on('click keyup', '.status-summary article', function (event) {
        if (event.type === 'keyup' && event.key !== 'Enter') { return; }

        var $card = $(this);
        var status = $card.find('[id$="Count"]').attr('id').replace('Count', '');   // 'activeCount' -> 'active'
        var wasOn = $card.hasClass('bg-primary-subtle');

        $card.siblings().removeClass('bg-primary-subtle').addClass('bg-white');
        $card.toggleClass('bg-white bg-primary-subtle');   // swap white <-> highlighted

        var $rows = $('#ordersTbody tr[data-status]');
        var $show = wasOn ? $rows : $rows.filter('[data-status="' + status + '"]');
        $show.fadeIn(200);
        $rows.not($show).fadeOut(200);
    });

    /* ---------------- logout ---------------- */

    $('#logoutBtn').on('click', function () {
        SF.auth.logout();
        // After the fade we reload, so main.js (which we do not edit) draws its Register button again.
        $dashboard.fadeOut(300, function () { window.location.reload(); });
    });

    /* ---------------- on page load: is somebody already logged in? ---------------- */

    if (SF.auth.sessionName()) {
        $loginView.addClass('is-hidden');             // no flash of the login form while the data loads
        SF.auth.currentUser().then(function (user) {
            if (user) {
                showDashboard(user);
            } else {                                  // a session of a user that is not in the database
                SF.auth.logout();
                window.location.reload();
            }
        }, showProblem);
    }
});
