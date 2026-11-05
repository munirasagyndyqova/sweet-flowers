
'use strict';

$(function() {

    const $table = $('.table-bordered').first();

    if (!$table.length) return;

    const $container = $table.parent();

    const deliveryZones = [
        { id: 'esil', name: 'Esil District', price: 1500 },
        { id: 'almaty', name: 'Almaty District', price: 1200 },
        { id: 'saryarka', name: 'Saryarka District', price: 1000 },
        { id: 'baikonyr', name: 'Baikonyr District', price: 1300 },
        { id: 'nura', name: 'Nura District', price: 1800 }
    ];

    // Create calculator container
    const $calculator = $('<div>', {
        class: 'mt-4 border-top pt-3'
    });

    // Create label
    const $label = $('<label>', {
        class: 'form-label fw-bold text-primary',
        text: 'Calculate Delivery to Your District:'
    });

    // Create select
    const $select = $('<select>', {
        class: 'form-select mb-3'
    });

    // Add default option
    $select.append(
        $('<option>', {
            value: '',
            text: 'Select district...'
        })
    );

    // Add district options
    $.each(deliveryZones, function(index, zone) {

        const $option = $('<option>', {
            value: zone.id,
            text: zone.name
        });

        $select.append($option);
    });

    // Create result element
    const $result = $('<div>', {
        class: 'alert alert-success fw-bold text-center d-none mb-0'
    });

    // Add elements to calculator
    $calculator.append(
        $label,
        $select,
        $result
    );

    $container.append($calculator);

    // Handle district selection
    $select.on('change', function() {

        const selectedId = $(this).val();

        if (!selectedId) {
            $result.addClass('d-none');
            return;
        }

        const zone = deliveryZones.find(function(item) {
            return item.id === selectedId;
        });

        if (zone) {
            $result
                .text('Delivery Fee: ' + formatPrice(zone.price))
                .hide()
                .removeClass('d-none')
                .fadeIn(400);
        }
    });

});
