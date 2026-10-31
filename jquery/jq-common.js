/*
 * jq-common.js - shared jQuery helpers: validators and the form-validation engine.
 *
 * jQuery version: 3.7.1, loaded from the code.jquery.com CDN by the <script> tag in each page's <head>.
 * Why that line is needed: this file calls $ straight away, and a library that has not
 * loaded yet cannot be called. So jQuery is linked first, then main.js, then this file.
 * Everything below is exposed through one global object, SF, so the other files can use it.
 */
(function ($) {
    'use strict';

    var SF = window.SF = window.SF || {};

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function todayIso() {
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    /* ---------- validators: each returns true / false ---------- */
    SF.valid = {
        email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
        phone: function (v) {
            var digits = v.replace(/\D/g, '');
            return /^\+?[\d\s().-]+$/.test(v) && digits.length >= 10 && digits.length <= 12;
        },
        date: function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(v); },
        notPast: function (iso) { return iso >= todayIso(); },    // ISO dates compare correctly as strings
        notFuture: function (iso) { return iso <= todayIso(); }
    };
    SF.todayIso = todayIso;

    SF.fmtDate = function (iso) { return iso ? iso.split('-').reverse().join('.') : ''; };


    SF.form = {};

    // Checkbox errors go after its <label>, every other field gets the message right after it.
    function anchorOf($field) {
        return $field.is(':checkbox') ? $field.next('label') : $field;
    }

    function messageFor($field, rule) {
        if ($field.is(':checkbox')) {
            return $field.prop('required') && !$field.prop('checked') ? 'Please tick this box to continue.' : '';
        }
        var value = rule.raw ? String($field.val()) : String($field.val()).trim();
        if (value === '') {
            if ($field.prop('required')) { return 'This field is required.'; }
            if (!rule.always) { return ''; }
        }
        return rule.check ? rule.check(value, $field) : '';
    }

    SF.form.setError = function ($field, message) {
        SF.form.clearError($field);
        $field.addClass('is-invalid');
        $('<div>')
            .addClass('error-msg text-danger small mt-1')
            .attr('role', 'alert')
            .text(message)                       // .text(): the message is plain text, never parsed as HTML
            .insertAfter(anchorOf($field))
            .hide()
            .slideDown(150);                     // the message slides in next to the field it belongs to
    };

    SF.form.clearError = function ($field) {
        $field.removeClass('is-invalid');
        anchorOf($field).next('.error-msg').remove();
    };

    SF.form.clearAll = function ($form) {
        $form.find('.is-invalid').removeClass('is-invalid');
        $form.find('.error-msg').remove();
    };

    // Checks every field, writes the trimmed value back, shows one message PER field.
    // Returns true only if all fields passed.
    SF.form.run = function ($form, rules) {
        var $firstBad = $();
        $.each(rules, function (_, rule) {
            var $field = $form.find(rule.field);
            if (!$field.length) { return; }      // field not on this page - skip (return false would stop the loop)
            if (!rule.raw && !$field.is(':checkbox')) { $field.val(String($field.val()).trim()); }
            var message = messageFor($field, rule);
            if (message) {
                SF.form.setError($field, message);
                if (!$firstBad.length) { $firstBad = $field; }
            } else {
                SF.form.clearError($field);
            }
        });
        $firstBad.trigger('focus');
        return $firstBad.length === 0;
    };

    // Clears an error AS SOON AS the visitor fixes the field (not only on the next submit).
    // Delegated on '.is-invalid': only fields that currently show an error react.
    SF.form.watch = function ($form, rules) {
        $form.on('input change', '.is-invalid', function () {
            var $field = $(this);
            var rule = $.grep(rules, function (r) { return $field.is(r.field); })[0] || {};
            if (!messageFor($field, rule)) { SF.form.clearError($field); }
        });
    };
}(jQuery));