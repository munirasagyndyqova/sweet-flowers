/*
 * jq-contacts.js - Contacts page (contacts.html).
 *
 * jQuery version: 3.7.1 from code.jquery.com. That <script> line sits in <head> before this file,
 * because everything below calls $ and a library that has not loaded yet cannot be called.
 * The plain-JavaScript originals of the three rewritten features are in old-js-version.js.
 * Everything is wrapped in $(function () {...}) = $(document).ready(): it runs when the DOM is ready.
 */
$(function () {

    /* ------------------------------------------------------------------
     * REWRITTEN FEATURE 1 - show / hide a block (old version: old-js-version.js, oldToggleAside)
     * Replaced: querySelector + createElement/appendChild loops + style.display = 'none' / ''
     *           + addEventListener + a manual if/else for the button label
     * with:     $('aside') + .wrapAll() + .slideToggle(300, callback) + .on('click').
     * Result: shorter (14 lines of code against 22 in old-js-version.js) and clearer, and it animates
     * for free. The callback also fixes a real problem: the label is changed only AFTER the
     * animation has finished, so it always matches what the visitor sees.
     * ------------------------------------------------------------------ */
    var $aside = $('aside').first();
    // everything in the aside except the heading goes into one wrapper, so one call can hide it all
    var $details = $aside.children(':not(h3)').wrapAll('<div class="aside-details"></div>').parent();

    /* CHAIN, link by link:
     *  $('<button>')          - creates a new, empty <button> element in memory
     *  .attr({...})           - sets type and aria-expanded in one go
     *  .addClass('btn ...')   - gives it the Bootstrap look (classes that already exist)
     *  .text('Hide details')  - sets its label (as plain text)
     *  .insertAfter(...)      - puts it into the page, right under the <h3> */
    var $toggleBtn = $('<button>')
        .attr({ type: 'button', 'aria-expanded': 'true' })
        .addClass('btn btn-sm btn-outline-primary mb-3')
        .text('Hide details')
        .insertAfter($aside.children('h3'));

    $toggleBtn.on('click', function () {
        var $btn = $(this);
        $details.slideToggle(300, function () {          // 300 ms; the function below runs when the slide is over
            var isOpen = $details.is(':visible');
            $btn.text(isOpen ? 'Hide details' : 'Show details').attr('aria-expanded', isOpen);
        });
    });

    /* ------------------------------------------------------------------
     * REWRITTEN FEATURE 2 - the list built in code: filter buttons for the shops table
     *                       (old version: old-js-version.js, oldFilterButtons)
     * Replaced: querySelectorAll + for-loops + createElement + classList + style.display
     *           + one addEventListener PER button
     * with:     .find() + .each() + $.each() + .appendTo() + .siblings() + ONE delegated .on('click').
     * Result: only a bit shorter (35 lines against 40), not dramatically. The real gain is
     * .siblings().removeClass('active') (replaces a whole loop) and the fade effect; the part that
     * builds the buttons is about as long as before.
     * ------------------------------------------------------------------ */
    var $table = $('table').first();
    var $rows = $table.find('tbody tr');
    var hoursList = ['All'];

    $rows.each(function () {                              // read every row's last cell: its opening hours
        var $row = $(this);
        var hours = $row.children('td').last().text().trim();
        $row.attr('data-hours', hours);
        if (hoursList.indexOf(hours) === -1) { hoursList.push(hours); }
    });

    var $panel = $('<div>')
        .addClass('btn-group mb-2')
        .attr({ role: 'group', 'aria-label': 'Filter shops by opening hours' })
        .insertBefore($table.closest('.table-responsive'));
    var $count = $('<p>')
        .addClass('small text-muted mb-3')
        .text('Showing ' + $rows.length + ' of ' + $rows.length + ' shops')
        .insertBefore($table.closest('.table-responsive'));

    $.each(hoursList, function (index, hours) {           // the buttons come from the array, not from HTML
        $('<button>')
            .attr({ type: 'button', 'data-hours': hours })
            .addClass('btn btn-outline-primary filter-btn' + (index === 0 ? ' active' : ''))
            .text(hours === 'All' ? 'All shops' : hours)
            .appendTo($panel);
    });

    // Delegated on the panel: one handler serves every button inside it.
    $panel.on('click', '.filter-btn', function () {
        var $btn = $(this);
        var wanted = $btn.attr('data-hours');

        $btn.addClass('active').siblings().removeClass('active');

        var $match = $rows.filter(function () {
            return wanted === 'All' || $(this).attr('data-hours') === wanted;
        });
        $match.fadeIn(300);                               // matching shops come back...
        $rows.not($match).fadeOut(300);                   // ...the others fade away
        $count.text('Showing ' + $match.length + ' of ' + $rows.length + ' shops');
    });

    /* ------------------------------------------------------------------
     * REWRITTEN FEATURE 3 - validation of the feedback form
     *                       (old version: old-js-version.js, oldValidateContactForm)
     * Replaced: getElementById for each field + manual .value.trim() + createElement/insertBefore for
     *           every error + classList.add/remove + loops that delete old errors + form.reset()
     * with:     $('#id').val() + a table of rules + SF.form.run() (in jq-common.js) + .addClass() +
     *           .insertAfter() + .on('input change').
     * Result: NOT really shorter. This file has 41 lines against 45 for the plain version, and the
     * engine I moved to jq-common.js (about 60 more lines) makes the total LONGER for this one form.
     * It only pays off because the same engine also serves the review, login and registration forms.
     * It is clearer, though: the rules are data, so adding a field means adding one rule object.
     * ------------------------------------------------------------------ */
    var $form = $('#contactForm');
    var $result = $('#contactResult');

    var rules = [
        { field: '#contactName', check: function (v) {
                if (v.length < 2) { return 'Please enter your name (at least 2 characters).'; }
                if (v.length > 50) { return 'The name is too long (max 50 characters).'; }
                return '';
            } },
        { field: '#contactEmail', check: function (v) {
                return SF.valid.email(v) ? '' : 'Enter a valid email, for example name@example.com.';
            } },
        // The phone is optional, unless the visitor chose to be contacted by phone: then it is required.
        { field: '#contactPhone', always: true, check: function (v) {
                var phoneChosen = $('input[name="contact_method"]:checked').val() === 'phone';
                if (v === '') { return phoneChosen ? 'Phone is required when you want us to call you.' : ''; }
                return SF.valid.phone(v) ? '' : 'Use a phone like +7 (708) 111-57-57.';
            } },
        // min and max are read from the HTML attributes, so there is one source of truth.
        { field: '#contactQuantity', always: true, check: function (v, $f) {
                var min = Number($f.attr('min')), max = Number($f.attr('max')), n = Number(v);
                if (v === '' || !Number.isInteger(n) || n < min || n > max) {
                    return 'Choose a whole number of bouquets from ' + min + ' to ' + max + '.';
                }
                return '';
            } },
        { field: '#contactSubject', always: true, check: function (v) {
                return v ? '' : 'Please choose a subject.';
            } },
        { field: '#contactDate', always: true, check: function (v, $f) {
                if (!v) { return 'Please choose a delivery date.'; }
                if (!SF.valid.date(v)) { return 'Enter a valid date.'; }
                var min = $f.attr('min');
                var max = $f.attr('max');
                if (min && v < min) { return 'The earliest delivery date is ' + SF.fmtDate(min) + '.'; }
                if (max && v > max) { return 'The latest delivery date is ' + SF.fmtDate(max) + '.'; }
                if (!SF.valid.notPast(v)) { return 'The delivery date cannot be in the past.'; }
                return '';
            } },
        { field: '#contactMessage', check: function (v) {
                if (v.length < 10) { return 'Your message is too short (at least 10 characters).'; }
                if (v.length > 1000) { return 'Your message is too long (max 1000 characters).'; }
                return '';
            } }
    ];

    SF.form.watch($form, rules);

    $form.on('submit', function (event) {
        // Without preventDefault() the browser would send the form (method="post" action="#") and reload
        // the page at once: the error messages and the confirmation below would flash and vanish.
        event.preventDefault();

        // Browser checks (required, type="email") are only the first line of defence. They live in the
        // visitor's browser, which the visitor controls: dev tools can remove `required`, and a script
        // can post data without the form at all. So the SERVER must check every value again.
        if (!SF.form.run($form, rules)) { return; }

        var name = $('#contactName').val();
        var via = $('input[name="contact_method"]:checked').val();

        // .html() is fine for OUR markup; the visitor's name goes in with .text(), so it can never inject HTML.
        $result.stop(true, true)
            .removeClass('alert-danger')
            .addClass('alert alert-success mt-3')
            .html('<strong class="sf-greeting"></strong> We will contact you by <span class="sf-via"></span>.');
        $result.find('.sf-greeting').text('Thank you, ' + name + '!');
        $result.find('.sf-via').text(via === 'phone' ? 'phone' : 'email');
        $result.hide().fadeIn(400).delay(6000).fadeOut(600);

        $form[0].reset();                                 // jQuery has no .reset(): we call the native method on the raw form
    });

    // The Reset button fires the form's "reset" event: clear the red errors too.
    $form.on('reset', function () { SF.form.clearAll($form); });

    // A different subject changes the hint inside the message box.
    var hints = {
        order: 'Which bouquet, how many, and for which date?',
        feedback: 'Tell us what you liked or what we can improve.',
        complaint: 'Describe what went wrong and add your order number if you have one.',
        other: 'Write your message here...'
    };
    $form.on('change', '#contactSubject', function () {
        $('#contactMessage').attr('placeholder', hints[$(this).val()]);
    }).find('#contactSubject').trigger('change');

    // A logged-in customer gets the form pre-filled.
    SF.auth.currentUser().then(function (user) {
        if (!user) { return; }
        $('#contactName').val(user.username);
        $('#contactEmail').val(user.email);
        $('#contactPhone').val(user.phone);
    });
});