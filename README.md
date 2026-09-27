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
