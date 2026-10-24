'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.bg-white.p-4.rounded.shadow-sm');
    if (sections.length < 2) return;

    const whyChooseUsSection = sections[1];

    const facts = [
        "Did you know? Peonies can live up to 100 years!",
        "Florist tip: Change the water in your vase every 2 days.",
        "Secret: Tulips continue to grow even after being cut.",
        "Fun fact: Roses are one of the oldest flowers, dating back 35 million years.",
        "Tip: Keep your bouquet away from direct sunlight and fresh fruit."
    ];

    const factBtn = document.createElement('button');
    factBtn.className = 'btn btn-outline-primary w-100 mt-3';
    factBtn.textContent = 'Get a Secret Florist Tip';

    const factDisplay = document.createElement('div');
    factDisplay.className = 'alert alert-info mt-3 d-none mb-0 fst-italic text-center';

    whyChooseUsSection.appendChild(factBtn);
    whyChooseUsSection.appendChild(factDisplay);

    factBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * facts.length);
        factDisplay.textContent = facts[randomIndex];
        factDisplay.classList.remove('d-none');

        factBtn.textContent = 'Get Another Tip';
    });
});