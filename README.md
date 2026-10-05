# Sweet Flowers

**Assignment 1 Introduction to Web Technologies**
A website for **Sweet Flowers**, a real flower shop in Astana, Kazakhstan.

## Team

| Student | Pages |
|---|---|
| Sagyndykova Munira | `index.html`, `flowers.html` |
| Kenes Nurziya | `about.html`, `order.html`, `delivery.html` |
| Koshkinbayeva Akbota | `reviews.html`, `my-orders.html`, `contacts.html` |

## Project structure

```
sweet-flowers/
├── index.html         — home page
├── about.html         — about the shop
├── flowers.html       — catalog of flowers/bouquets
├── order.html         — order form
├── delivery.html      — delivery & payment info
├── reviews.html       — customer reviews
├── contacts.html      — contacts and location
├── images/            — photos used across the site
└── README.md
```

## How to open

This is a static, unstyled HTML-only site with no server or hosting.
Just clone or download the repository and open `index.html` directly in your browser no build steps, no dependencies.

```
git clone https://github.com/munirasagyndyqova/sweet-flowers.git
```

## Technologies

- Pure HTML5 semantic markup only
- No CSS, no JavaScript, no frameworks (by assignment requirement styling is added in a later assignment)

## Reports & submission materials

- [Tag checklist](checklist.md)
- [CSS checklist](CSS-CHECKLIST.md)
- [PDF report](report.pdf)-Task A & Task B with screenshots
- [Hand-drawn sketch](pic.jpg)
- [AI usage log](ai-log.md)

## Notes

- All content (text, prices, opening hours, address, phone, photos, reviews) is real, collected from an actual flower shop in Astana.
- Commit history reflects individual contributions from each team member across multiple days.

**Assignment 2: CSS Styling & Design**

This phase introduces custom CSS styling to create a visually appealing, structured, and modern experience for the **Sweet Flowers** website, building upon our semantic HTML foundation.

## Team Contributions for Assignment 2

Each team member styled their own assigned pages, writing custom CSS to enhance the layout, typography, and color scheme. 

| Student | Styled Pages |
|---|---|
| Sagyndykova Munira | `index.html`, `flowers.html` |
| Kenes Nurziya | `about.html`, `order.html`, `delivery.html` |
| Koshkinbayeva Akbota | `reviews.html`, `colophon.html`, `contacts.html` |

## Project structure

```
sweet-flowers/
├── css/               — custom CSS stylesheets for all pages
├── images/            — photos used across the site
├── index.html         — home page
├── about.html         — about the shop
├── flowers.html       — catalog of flowers/bouquets
├── order.html         — order form
├── delivery.html      — delivery & payment info
├── reviews.html       — customer reviews
├── contacts.html      — contacts and location
└── README.md
```
## Updated Project Structure

A dedicated `css/` folder was added to manage all the individual stylesheets cleanly.
## Phase 2 Technologies

- **HTML5**: Semantic structure.
- **CSS3**: Custom styling, positioning, and visual design added independently by each team member.
- **Zero Frameworks**: No external CSS libraries (like Bootstrap or Tailwind) were used. All CSS was written from scratch.
**Assignment 3: Bootstrap Integration & Responsive Design**

In this phase, we migrated the **Sweet Flowers** website to **Bootstrap 5**. The primary goal was to replace our custom hand-written layouts (flexbox, grid, floats) with the Bootstrap grid system and utility classes, ensuring full responsiveness across all devices. Our custom CSS was reduced to a minimal "correction layer".

## Team Contributions for Assignment 3

Each team member refactored their assigned pages, stripping out old custom CSS and implementing Bootstrap classes, grids, and components.

| Student | Refactored Pages & Key Bootstrap Features |
|---|---|
| Sagyndykova Munira | `index.html`, `flowers.html` |
| Kenes Nurziya | `about.html`, `order.html`, `delivery.html` (Added Accordion, Grid Cards, Forms, and styled Buttons) |
| Koshkinbayeva Akbota | `reviews.html`, `my-orders.html`, `contacts.html` |

## Updated Project Structure for Phase 3
```
sweet-flowers/
├── css/              — reduced to a minimal "correction layer" (brand colors/fonts only)
├── images/            — photos used across the site
├── index.html         — html files refactored with Bootstrap classes
├── about.html         — about the shop
├── flowers.html       — catalog of flowers/bouquets
├── order.html         — order form
├── delivery.html      — delivery & payment info
├── reviews.html       — customer reviews
├── contacts.html      — contacts and location
├── removed_css.txt        — log detailing which custom CSS rules were deleted and replaced by Bootstrap
└── README.md
```
## Phase 3 Technologies & Features

- **Bootstrap 5 (via CDN)**: Handled all heavy lifting for layout, spacing, alignment, and typography.
- **Responsive Grid System**: Implemented `container`, `container-fluid`, `row`, and `col-*` classes to ensure the site works flawlessly at 375px (mobile), 768px (tablet), and desktop widths. **Zero horizontal scrolling on mobile.**
- **Mobile Navigation**: Replaced the static header menu with a fully functional Bootstrap Navbar Toggler (hamburger menu) for small screens.
- **UI Components**: Integrated interactive Bootstrap components (such as Accordions and Cards) adapted to the flower shop's content.
- **CSS Correction Layer**: Custom CSS was drastically reduced per the assignment rules. We kept only brand colors (`#d6336c`, `#fcc2d7`), custom fonts, and minor overrides, letting Bootstrap's utility classes do the rest.
- **Git Workflow**: Commits were made independently by each team member across multiple days to reflect the refactoring process.


**Midterm Project: Final Logic & JavaScript Preparation**

For the midterm, the Sweet Flowers website was finalized as a complete, cohesive static site. All missing logic, empty blocks, and dead links were resolved. The markup was prepared for future JavaScript integration by adding state classes (`.hidden`, `.error`, `.success`, `.selected`), empty containers for system messages, and unique IDs to interactive elements. 

## Three User Journeys

All paths can be completed by a single visitor from their own screen.

**Journey 1: Choosing and ordering a bouquet**
* **Start:** The visitor lands on `index.html`.
* **Steps:** 
  1. Clicks on "Flowers" in the navigation to view the catalog (`flowers.html`).
  2. Compares bouquets and clicks the "Order Now" button under a specific arrangement.
  3. The link takes them to `order.html`.
  4. The visitor fills out their contact details, delivery address, selects "Kaspi Pay", and clicks "Place Order".
* **End:** The form submission triggers (future JS) a success message in the `#order-message` container on the same page.

**Journey 2: Checking delivery terms and contacting the shop**
* **Start:** The visitor opens `delivery.html` to check the delivery zones and time.
* **Steps:** 
  1. Reads the delivery fee table and the payment methods.
  2. Clicks on the "Freshness Guarantee" accordion to read the shop's policy.
  3. Needs to call a specific branch, so they navigate to `contacts.html` via the top menu.
* **End:** The visitor finds the correct phone number and address on the contacts page and clicks the `tel:` link to initiate a call.

**Journey 3: Learning about the team and reading feedback**
* **Start:** The visitor starts at `about.html` to learn about the florist team.
* **Steps:** 
  1. Reads the shop's story and views the team section.
  2. Wants to see what other customers think and clicks "Reviews" in the navigation (`reviews.html`).
  3. Reads the existing customer feedback.
* **End:** The visitor fills out the "Leave a Review" form at the bottom of the page and submits it, where an empty container is prepared to show a "Thank you for your review" message.

## Quality Pass Log

Two days before the deadline, team members reviewed each other's pages on different devices to catch and fix remaining bugs.

* **Fixed by Nurziya:** Removed "Coming Soon" text and `disabled` attribute from the promo button in `order.html`. Added missing `#order-message` container for form submission results. Added JS state classes to `base.css`.
* **Fixed by Munira:** Removed placeholder buttons and checked links in `index.html` and `flowers.html`. Added IDs and data attributes to important buttons, bouquet catalog, and price table to prepare the HTML structure for future JavaScript.
* **Fixed by Akbota:**
* - `reviews.html` — review photos stretched to full width → fixed with width/height on `<img>`.
- `my-orders.html` — "Download receipt" link was `href="#"` → replaced with real links.
- `contacts.html` — feedback form had no result area → added `#contactResult`.
- All pages — navigation differed between pages → unified.
- `my-orders.html` — login used `:has()`, didn't work in older browsers → switched to `~`.

Re-checked after fixes: no dead links, every form has a result area, no horizontal scroll at 375px, W3C validator passes, console clean.

## Freeze Tag
The complete, JS-ready structure is frozen under the Git tag `midterm`.
