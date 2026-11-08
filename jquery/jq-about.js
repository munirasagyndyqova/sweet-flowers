
'use strict';

$(function () {

  // Find the Why Choose Us section
  const $panel = $('section')
    .find('h2')
    .filter(function () {
      return $(this).text().trim() === 'Why Choose Us?';
    })
    .first()
    .closest('.bg-white');

  if (!$panel.length) {
    return;
  }

  // Prevent duplicate buttons
  if ($panel.find('[data-florist-tip]').length) {
    return;
  }

  const tips = [
    'Change the water in your vase every two days.',
    'Keep bouquets away from direct sunlight.',
    'Trim the stems at an angle before placing flowers in water.',
    'Remove leaves that would sit below the waterline.'
  ];

  // Create button using jQuery
  const $button = $('<button>', {
    type: 'button',
    class: 'btn btn-outline-primary w-100 mt-3',
    text: 'Get a Florist Tip'
  });

  $button.attr('data-florist-tip', '1');

  // Create result container
  const $result = $('<div>', {
    class: 'alert alert-info mt-3 mb-0 text-center'
  }).hide();

  // Add elements to the page
  $panel.append($button, $result);

  // Show a new tip on click
  $button.on('click', function () {

    const randomIndex = Math.floor(
      Math.random() * tips.length
    );

    const tip = tips[randomIndex];

    $result
      .stop(true, true)
      .hide()
      .text(tip)
      .fadeIn(350);

    $(this).text('Another Tip');
  });

});
