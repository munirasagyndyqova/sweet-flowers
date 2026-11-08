
'use strict';

$(function () {

  const $table = $('main .table-bordered').first();
  
  // Remove the duplicate delivery calculator
  $('#delivery-calculator').remove();

  // The first calculator already exists, so stop here
  return;


  if (!$table.length) {
    return;
  }

  const $container = $table.parent();

  // Prevent duplicate delivery calculators
  if ($container.find('#delivery-calculator').length) {
    return;
  }

  // Estimated demo delivery prices
  const zones = [
    {
      id: 'esil',
      name: 'Esil District',
      price: 1500
    },
    {
      id: 'almaty',
      name: 'Almaty District',
      price: 1200
    },
    {
      id: 'saryarka',
      name: 'Saryarka District',
      price: 1000
    },
    {
      id: 'baikonyr',
      name: 'Baikonyr District',
      price: 1300
    },
    {
      id: 'nura',
      name: 'Nura District',
      price: 1800
    }
  ];

  // Calculator wrapper
  const $wrapper = $('<div>', {
    id: 'delivery-calculator',
    class: 'mt-4 border-top pt-3'
  });

  // Label
  const $label = $('<label>', {
    for: 'delivery-district',
    class: 'form-label fw-bold text-primary',
    text: 'Estimate Delivery to Your District:'
  });

  // Dropdown
  const $select = $('<select>', {
    id: 'delivery-district',
    class: 'form-select mb-3'
  });

  // Output
  const $output = $('<div>', {
    class: 'alert alert-success fw-bold text-center'
  }).hide();

  // Default option
  $select.append(
    $('<option>', {
      value: '',
      text: 'Select district...'
    })
  );

  // Generate options using jQuery
  $.each(zones, function (index, zone) {

    $select.append(
      $('<option>', {
        value: zone.id,
        text: zone.name
      })
    );

  });

  // Insert elements
  $wrapper
    .append($label, $select, $output)
    .appendTo($container);

  // Calculate delivery fee
  $select.on('change', function () {

    const selectedId = $(this).val();

    const zone = zones.find(function (item) {
      return item.id === selectedId;
    });

    if (!zone) {

      $output
        .stop(true, true)
        .slideUp(180);

      return;
    }

    $output
      .stop(true, true)
      .hide()
      .text(
        'Estimated delivery fee: ' +
        formatPrice(zone.price) +
        ' (not a Yandex quote)'
      )
      .slideDown(250);

  });

});
