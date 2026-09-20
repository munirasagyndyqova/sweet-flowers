# CSS Checklist — What Is Used and On Which Page

**Sweet Flowers · Introduction to Web Technologies · Assignment 1**

A matrix view: rows = every required selector, property, technique; columns = pages where it appears.
Fill in the exact stylesheet + line number in the last two columns.
A wrong or missing line number means the item is **not counted**.

> **Pages in this project:**
> `index.html` · `about.html` · `flowers.html` · `delivery.html` · `order.html` · `contacts.html` · `reviews.html` · `my-orders.html` · `colophon.html`

---

## 1. Selectors — Each Used At Least Once

| # | Selector | index | about | flowers | delivery | order | contacts | reviews | my-orders | colophon | Stylesheet | Line | Author |
|---|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|------------|:----:|--------|
| 1.1 | Type | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.2 | Class | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | `akbota.css` | | Akbota |
| 1.3 | ID | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `akbota.css` | | Akbota |
| 1.4 | Descendant (` `) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.5 | Child (`>`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.6 | Adjacent sibling (`+`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.7 | Grouping (`,`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.8 | Attribute (`[…]`) | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.9 | Universal (`*`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.10 | `:hover` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `base.css` | | team |
| 1.11 | `:focus` | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | `base.css` | | team |
| 1.12 | `:first-child` | | ✓ | | ✓ | ✓ | | | | | `nurziya.css` | | Nurziya |
| 1.13 | `:nth-child` | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | `base.css` | | team |
| 1.14 | `::before` | | ✓ | ✓ | ✓ | ✓ | | | | ✓ | `nurziya.css` | | Nurziya |
| 1.15 | `::after` | | ✓ | | ✓ | | ✓ | | ✓ | | `akbota.css` | | Akbota |

---

## 2. Classes — At Least Eight, Reused

| # | Class | Reused on page(s) | Times reused | Stylesheet | Line | Author |
|---|-------|-------------------|:---:|------------|:----:|--------|
| 2.1 | `.status-card` | `my-orders.html` | 3 | `akbota.css` | | Akbota |
| 2.2 | `.badge` | `my-orders.html`, `reviews.html` | 8 | `akbota.css` | | Akbota |
| 2.3 | `.gallery` | `contacts.html` | 1 container (5 figures) | `akbota.css` | | Akbota |
| 2.4 | `.btn` | `my-orders.html`, `reviews.html` | 4 | `akbota.css` | | Akbota |
| 2.5 | `.flower-card` | `flowers.html` | 6+ | `munira.css` | | Munira |
| 2.6 | `.location-card` | `delivery.html` | 5 | `nurziya.css` | | Nurziya |
| 2.7 | `.payment-methods` | `delivery.html` | 1 list with 4 items | `nurziya.css` | | Nurziya |
| 2.8 | `.order-buttons` | `order.html` | 2 buttons | `nurziya.css` | | Nurziya |
| 2.9 | `.delivery-table` | `delivery.html` | 1 table | `nurziya.css` | | Nurziya |
| 2.10 | `.form-group` | `order.html` | 5 groups | `nurziya.css` | | Nurziya |

---

## 3. IDs — At Least Two, Used Once Per Page

| # | ID | Page | Why id (comment) | Stylesheet | Line | Author |
|---|-----|------|------------------|------------|:----:|--------|
| 3.1 | `#login` | `my-orders.html` | Jump target for the "Log out" link — one per page | `akbota.css` | | Akbota |
| 3.2 | `#dashboard` | `my-orders.html` | Target of CSS `:target` login — one per page | `akbota.css` | | Akbota |
| 3.3 | `#order-title` | `order.html` | Unique page heading — one per page | `nurziya.css` | | Nurziya |
| 3.4 | `#delivery-note` | `delivery.html` | Single important note — one per page | `nurziya.css` | | Nurziya |
| 3.5 | `#about-intro` | `about.html` | Unique intro block — one per page | `nurziya.css` | | Nurziya |

---

## 4. Colours, Fonts, Spacing

| # | Item | Where | Page | Stylesheet | Line | Author |
|---|------|-------|------|------------|:----:|--------|
| 4.1 | Palette comment (max 5 colours) | top of file | all | `base.css` | | team |
| 4.2 | `#d6336c` rose pink | headings, buttons | all | `base.css` | | team |
| 4.3 | `#fcc2d7` soft pink | borders, tables | all | `base.css` | | team |
| 4.4 | `#212529` charcoal | body text | all | `base.css` | | team |
| 4.5 | `#fff5f7` blush white | page bg | all | `base.css` | | team |
| 4.6 | `#f8f9fa` off white | form rows | all | `base.css` | | team |
| 4.7 | **Hex** colour | everywhere | all | `base.css` | | team |
| 4.8 | **rgba()** colour | shadows | all | `base.css` | | team |
| 4.9 | **Named** colour `gold` | `.badge-awaiting` | `my-orders.html` | `akbota.css` | | Akbota |
| 4.10 | Heading font stack | `'Helvetica Neue', Arial, sans-serif` | all | `base.css` | | team |
| 4.11 | Body font stack | `'Georgia', 'Times New Roman', serif` | all | `base.css` | | team |
| 4.12 | `font-size` | body | all | `base.css` | | team |
| 4.13 | `font-weight` | body | all | `base.css` | | team |
| 4.14 | `line-height` | body | all | `base.css` | | team |
| 4.15 | `letter-spacing` | body | all | `base.css` | | team |
| 4.16 | `box-sizing` | `*` | all | `base.css` | | team |
| 4.17 | `margin` (deliberate) | section, main | all | `base.css` | | team |
| 4.18 | `padding` (deliberate) | section, header | all | `base.css` | | team |
| 4.19 | `border` (deliberate) | section, fieldset | all | `base.css` | | team |
| 4.20 | Margin collapse — comment | near `main` | all | `base.css` | | team |
| 4.21 | `text-align` | h1, header, footer | all | `base.css` | | team |
| 4.22 | Layout alignment (flex/grid) | nav, cards | all | `base.css` | | team |

---

## 5. Priority & Cascade

| # | Item | Where | Page | Line | Author | Comment |
|---|------|-------|------|:----:|--------|:-------:|
| 5.1 | One internal `<style>` block | `<head>` | `contacts.html` | | Akbota | ☐ |
| 5.2 | One inline `style="…"` | `<p class="stars">` | `reviews.html` | | Akbota | ☐ |
| 5.3 | `!important` used once | `input:focus` | `order.html` | | Nurziya | ☐ |

---

## 6. Flexbox

| # | Requirement | Page | Stylesheet | Line | Author |
|---|-------------|------|------------|:----:|--------|
| 6.1 | Nav flex row (`justify-content`, `align-items`, `gap`) | all | `base.css` | | team |
| 6.2 | Second flex container — Akbota | `my-orders.html` (`.status-summary`) | `akbota.css` | | Akbota |
| 6.2 | Second flex container — Nurziya | `delivery.html` (`.payment-methods`) | `nurziya.css` | | Nurziya |
| 6.2 | Second flex container — Munira | `flowers.html` (`.flower-card-footer`) | `munira.css` | | Munira |
| 6.3 | `flex-wrap` | `.status-summary` | `akbota.css` | | Akbota |
| 6.4 | Items grow/shrink (`flex: g s b`) | `.status-card` | `akbota.css` | | Akbota |
| 6.5 | `flex-direction` | `.payment-options` | `nurziya.css` | | Nurziya |

---

## 7. Grid

| # | Requirement | Page | Stylesheet | Line | Author |
|---|-------------|------|------------|:----:|--------|
| 7.1 | Grid section — Akbota | `my-orders.html` (`.dashboard-section:target`) | `akbota.css` | | Akbota |
| 7.1 | Grid section — Nurziya | `delivery.html` (`.locations-grid`) | `nurziya.css` | | Nurziya |
| 7.1 | Grid section — Munira | `flowers.html` (`.flowers-catalog-grid`) | `munira.css` | | Munira |
| 7.2 | `grid-template-columns` with `fr` | — | `akbota.css` | | Akbota |
| 7.3 | `repeat()` | — | `nurziya.css` | | Nurziya |
| 7.4 | `gap` | — | `nurziya.css` | | Nurziya |
| 7.5 | Item spanning >1 column/row | `.location-card:last-child` | `nurziya.css` | | Nurziya |
| 7.6 | `minmax()` | `minmax(0, 1fr)` | `akbota.css` | | Akbota |
| 7.7 | Comment: why grid > flexbox | `.locations-grid` | `nurziya.css` | | Nurziya |

---

## 8. Positioning, Float, Clear

| # | Value | Page | Selector | Stylesheet | Line | Author | Comment |
|---|-------|------|----------|------------|:----:|--------|:-------:|
| 8.1 | `static` | `delivery.html` | `.important-info` | `nurziya.css` | | Nurziya | ☐ |
| 8.2 | `relative` | `my-orders.html` | `.status-card` | `akbota.css` | | Akbota | ☐ |
| 8.3 | `relative` | `delivery.html` | `.location-card` | `nurziya.css` | | Nurziya | ☐ |
| 8.4 | `absolute` | `my-orders.html` | `.status-card::before` | `akbota.css` | | Akbota | ☐ |
| 8.5 | `absolute` | `flowers.html` | `.badge-popular` | `munira.css` | | Munira | ☐ |
| 8.6 | `fixed` | `contacts.html` | `.back-to-top` | `akbota.css` | | Akbota | ☐ |
| 8.7 | `fixed` | `delivery.html` | `.quick-order` | `nurziya.css` | | Nurziya | ☐ |
| 8.8 | Float image in paragraph | `about.html` | `.about-photo` | `nurziya.css` | | Nurziya | ☐ |
| 8.9 | Clear after float | `about.html` | `.about-card::after` | `nurziya.css` | | Nurziya | ☐ |

---

## 9. Centering — Three Techniques

| # | Technique | Page | Selector | Stylesheet | Line | Author | Comment |
|---|-----------|------|----------|------------|:----:|--------|:-------:|
| 9.1 | `margin: auto` | `my-orders.html` | `.login-section` | `akbota.css` | | Akbota | ☐ |
| 9.2 | Flexbox centering | `my-orders.html` | `.status-summary` | `akbota.css` | | Akbota | ☐ |
| 9.3 | Absolute + `transform` | `my-orders.html` | `.dashboard-section:target > h2::after` | `akbota.css` | | Akbota | ☐ |

---

## 10. Animations — Keyframes

| # | Keyframe | Applied on which pages | Defined in | Line | Author |
|---|----------|------------------------|------------|:----:|--------|
| 10.1 | `pageFadeIn` | all | `base.css` | | team |
| 10.2 | `slideDown` | all | `base.css` | | team |
| 10.3 | `fadeInUp` | all | `base.css` | | team |
| 10.4 | `zoomIn` | `flowers.html`, `contacts.html`, `reviews.html` | `base.css` | | team |
| 10.5 | `titleGlow` | all | `base.css` | | team |
| 10.6 | `highlightPulse` | `contacts.html`, `reviews.html`, `my-orders.html` | `base.css` | | team |

---

## 11. Which Page Uses Which Technique — Quick Matrix

| Technique | index | about | flowers | delivery | order | contacts | reviews | my-orders |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Type / class / id | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Descendant / child / sibling | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attribute selector | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Universal `*` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `:hover` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `:focus` | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `:first-child` | | ✓ | | ✓ | ✓ | | | |
| `:nth-child` | | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `::before` | | ✓ | ✓ | ✓ | ✓ | | | |
| `::after` | | ✓ | | ✓ | | ✓ | | ✓ |
| Flexbox | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Grid | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| `minmax()` | | | ✓ | ✓ | | | | ✓ |
| Item spanning | | | | ✓ | | | | ✓ |
| `position: relative` | | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `position: absolute` | | | ✓ | ✓ | | ✓ | ✓ | ✓ |
| `position: fixed` | | ✓ | | ✓ | ✓ | ✓ | | ✓ |
| Float + clear | | ✓ | | | | | | |
| Centering (3 ways) | | | | | | ✓ | | ✓ |
| Animations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 12. Per-Student Summary

| Student | Stylesheet | Selectors covered | Classes | IDs | Grid | Flex | Animations | Signed |
|---------|------------|:-----------------:|:-------:|:---:|:----:|:----:|:----------:|--------|
| Koshkinbayeva Akbota | `akbota.css` | 6 / 15 | 4 | 2 | ✓ | ✓ | ✓ | ☐ |
| Nurziya | `nurziya.css` | 5 / 15 | 5 | 3 | ✓ | ✓ | ✓ | ☐ |
| Sagyndykova Munira | `munira.css` | 4 / 15 | 2 | 0 | ✓ | ✓ | ✓ | ☐ |

> **Note:** The selectors listed above are only the ones each student *personally* uses in their stylesheet. Shared ones (type, descendant, child, sibling, grouping, universal) are all in `base.css`.

--- 