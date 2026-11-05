
'use strict';

$(function() {

    const $sections = $('.bg-white.p-4.rounded.shadow-sm');

   const $sections = $('.bg-white.p-4.rounded.shadow-sm');

    if ($sections.length < 2) return;

    const $whyChooseUs = $sections.eq(1);

    const facts = [
        'Did you know? Peonies can live up to 100 years!',
        'Florist tip: Change the water in your vase every 2 days.',
        'Secret: Tulips continue to grow even after being cut.',
        'Fun fact: Roses are one of the oldest flowers, dating back 35 million years.',
        'Tip: Keep your bouquet away from direct sunlight and fresh fruit.'
    ];

    // Create button using jQuery
    const $factButton = $('<button>', {
        type: 'button',
        class: 'btn btn-outline-primary w-100 mt-3',
        text: 'Get a Secret Florist Tip'
    });

    // Create fact display
    const $factDisplay = $('<div>', {
        class: 'alert alert-info mt-3 d-none mb-0 fst-italic text-center'
    });

    // Add elements to section
    $whyChooseUs.append($factButton, $factDisplay);

    // Click event
    $factButton.on('click', function() {

        const randomIndex = Math.floor(
            Math.random() * facts.length
        );

        const randomFact = facts[randomIndex];

        $factDisplay
            .text(randomFact)
            .hide()
            .removeClass('d-none')
            .fadeIn(400);

        $factButton.text('Get Another Tip');
    });

     $factDisplay
                .text(We started with a small flower workshop and a simple idea: every bouquet should make someone's day special.)
                .hide()
                .removeClass('d-none')
                .fadeIn(400);
            $factButton.text('About');

});
