/*
 * jq-reviews.js - Reviews page (reviews.html).
 *
 * jQuery version: 3.7.1 from code.jquery.com, linked in <head> before this file. It is needed because
 * everything below calls $; a library that has not loaded yet cannot be called.
 * Needs jq-common.js (SF.form, SF.valid) and jq-auth.js (SF.auth) loaded before it.
 * New reviews are built in code from an array and saved in localStorage ('sf_reviews').
 */
$(function () {
    var STORAGE_KEY = 'sf_reviews';
    var $form = $('#reviewForm');
    var $list = $('#reviewsList');
    var $result = $('#reviewResult');

    function loadSaved() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function saveAll(items) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* storage disabled: the review just will not persist */ }
    }
    var reviews = loadSaved();

    // Builds one review card. None of this markup exists in reviews.html.
    function buildReview(r) {
        var $card = $('<article>').addClass('bg-light rounded-3 shadow-sm p-4 mb-3').attr('data-id', r.id);
        var $head = $('<div>').addClass('d-flex justify-content-between align-items-start gap-2').appendTo($card);
        $('<h3>').addClass('text-primary fs-5 mb-1').text(r.name).appendTo($head);
        $('<span>').addClass('badge bg-warning text-dark').text('\u2605'.repeat(r.rating) + ' ' + r.rating + '/5').appendTo($head);

        $('<p>').addClass('mb-2').append($('<q>').text(r.message)).appendTo($card);

        var meta = ['Subject: ' + r.subject];
        if (r.date) { meta.push('Visit: ' + SF.fmtDate(r.date)); }
        meta.push('Recommends us: ' + (r.recommend === 'yes' ? 'yes' : 'no'));
        $('<p>').addClass('small text-muted mb-2').text(meta.join(' | ')).appendTo($card);

        $('<button>').attr('type', 'button').addClass('btn btn-sm btn-outline-danger review-delete')
            .text('Delete my review').appendTo($card);
        return $card;
    }

    // Saved reviews come back from the array when the page opens.
    $.each(reviews, function (_, r) { buildReview(r).appendTo($list); });

    /* ------------------------------------------------------------------
     * DELEGATED HANDLER
     * Why NOT $('.review-delete').on('click', ...): that line runs once, when the page opens. jQuery
     * looks for '.review-delete' elements at that moment and attaches the handler to each one it finds.
     * The cards built by buildReview() do not exist yet (or are created later, when the form is sent),
     * so the handler would never be attached to them and their Delete buttons would do nothing.
     * Here the handler sits on #reviewsList, which exists from the start. A click on a button bubbles up
     * to the list, and jQuery checks AT CLICK TIME whether the clicked element matches '.review-delete'.
     * So it also catches buttons that did not exist when the page loaded.
     * ------------------------------------------------------------------ */
    $list.on('click', '.review-delete', function () {
        var $card = $(this).closest('article');           // from the clicked button to the card it belongs to
        var id = Number($card.attr('data-id'));
        reviews = reviews.filter(function (r) { return r.id !== id; });
        saveAll(reviews);
        $card.slideUp(300, function () { $(this).remove(); });   // remove from the page only AFTER the slide ends
    });

    /* ------------------------------------------------------------------
     * Validation of the review form (same engine as the contact form, see jq-common.js).
     * The rating limits come from the min / max attributes in the HTML.
     * ------------------------------------------------------------------ */
    var rules = [
        { field: '#reviewName', check: function (v) {
                if (v.length < 2) { return 'Please enter your name (at least 2 characters).'; }
                if (v.length > 50) { return 'The name is too long (max 50 characters).'; }
                return '';
            } },
        { field: '#reviewEmail', check: function (v) {
                return SF.valid.email(v) ? '' : 'Enter a valid email, for example name@example.com.';
            } },
        { field: '#reviewPhone', check: function (v) {
                return SF.valid.phone(v) ? '' : 'Use a phone like +7 (708) 111-57-57.';
            } },
        { field: '#reviewRating', always: true, check: function (v, $f) {
                var min = Number($f.attr('min')), max = Number($f.attr('max')), n = Number(v);
                if (v === '' || !Number.isInteger(n) || n < min || n > max) {
                    return 'Give a whole number from ' + min + ' to ' + max + '.';
                }
                return '';
            } },
        { field: '#reviewSubject', always: true, check: function (v) {
                return v ? '' : 'Please choose a subject.';
            } },
        { field: '#reviewDate', always: true, check: function (v, $f) {
                if (!v) { return 'Please choose the date of your visit.'; }
                if (!SF.valid.date(v)) { return 'Enter a valid date.'; }
                var min = $f.attr('min');
                var max = $f.attr('max');
                if (min && v < min) { return 'The date cannot be earlier than ' + SF.fmtDate(min) + '.'; }
                if (max && v > max) { return 'The date cannot be later than ' + SF.fmtDate(max) + '.'; }
                if (!SF.valid.notFuture(v)) { return 'The date of your visit cannot be in the future.'; }
                return '';
            } },
        { field: '#reviewMessage', check: function (v) {
                if (v.length < 10) { return 'Your review is too short (at least 10 characters).'; }
                if (v.length > 1000) { return 'Your review is too long (max 1000 characters).'; }
                return '';
            } }
    ];
    SF.form.watch($form, rules);

    $form.on('submit', function (event) {
        // Without preventDefault() the browser would submit the form and reload the page,
        // and the new review would never be shown.
        event.preventDefault();
        if (!SF.form.run($form, rules)) { return; }

        var review = {
            id: Date.now(),
            name: $('#reviewName').val(),
            rating: Number($('#reviewRating').val()),
            date: $('#reviewDate').val(),
            subject: $('#reviewSubject').find('option:selected').text(),
            recommend: $('input[name="recommend"]:checked').val(),
            message: $('#reviewMessage').val()
        };
        // .prop('checked') = is the box ticked RIGHT NOW. .attr('checked') would give the original HTML
        // attribute and stay the same after the visitor clicks the box.
        var subscribed = $('#reviewNewsletter').prop('checked');

        reviews.unshift(review);
        saveAll(reviews);

        // CHAIN: build the card -> hide it -> put it at the top of the list -> slide it open.
        buildReview(review).hide().prependTo($list).slideDown(400);

        $result.stop(true, true)
            .removeClass('alert-danger')
            .addClass('alert alert-success mt-3')
            .text('Thank you, ' + review.name + '! Your review is published below.' + (subscribed ? ' You are subscribed to our newsletter.' : ''));
        $result.hide().fadeIn(400).delay(5000).fadeOut(600);

        $form[0].reset();                                  // jQuery has no .reset(): native method on the raw form
        $('html, body').animate({ scrollTop: $list.offset().top - 120 }, 500);   // bring the new review into view
    });

    $form.on('reset', function () { SF.form.clearAll($form); });

    // Live counter under the label of the review box (updates on every key press).
    var $counter = $('<small>').addClass('text-muted ms-2').text('0 characters (min 10)')
        .appendTo('label[for="reviewMessage"]');
    $form.on('input', '#reviewMessage', function () {
        var length = $(this).val().trim().length;
        $counter
            .text(length + ' characters' + (length < 10 ? ' (min 10)' : ''))
            .toggleClass('text-success', length >= 10)
            .toggleClass('text-muted', length < 10);
    });

    // Hover on any review card (old ones from the HTML and new ones from the form): shadow-sm <-> shadow.
    // Delegated on <main>, so cards created later also react.
    $('main').on('mouseenter mouseleave', 'article', function () {
        $(this).toggleClass('shadow shadow-sm');
    });

    // A logged-in customer gets the form pre-filled.
    SF.auth.currentUser().then(function (user) {
        if (!user) { return; }
        $('#reviewName').val(user.username);
        $('#reviewEmail').val(user.email);
        $('#reviewPhone').val(user.phone);
    });
});