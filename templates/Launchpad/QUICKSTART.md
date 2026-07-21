# Themestrap SaaS Starter — Quick Start Guide

A production-ready, 6-page SaaS marketing site built on the **Themestrap** plugin framework, Bootstrap 5, and jQuery. No build step, no bundler — open a file and it works.

---

## File structure

```
templates/saas-starter/
├── index.html           Landing page (hero, features, stats, testimonials, CTA)
├── features.html        Tabbed feature deep-dive (Deployment, Analytics, Workflow, Integrations, Security)
├── pricing.html         3-tier pricing cards + comparison table + FAQ
├── customers.html       Customer grid + featured story + testimonials
├── customer-detail.html Full customer story (Velocity AI) with aside stats panel
├── about.html           Company story, values, team, investors, locations
├── saas.css             All shared design tokens, layout, and component styles
└── saas.js              Shared interactivity: nav toggle, dark mode, pricing toggle, scroll-to-top
```

---

## Prerequisites

The template uses the Themestrap vendor assets already in the repository. Paths are relative, so no server config is required for local development — just open any `.html` file directly in a browser.

**Required vendor paths (relative to `templates/saas-starter/`):**

| Dependency | Path |
|---|---|
| Bootstrap 5 CSS | `../../vendor/bootstrap/css/bootstrap.min.css` |
| Font Awesome | `../../vendor/fontawesome-free/css/all.min.css` |
| jQuery | `../../vendor/jquery/jquery.min.js` |
| Bootstrap 5 JS | `../../vendor/bootstrap/js/bootstrap.bundle.min.js` |
| Themestrap core | `../../js/themestrap.js` |
| Dark mode plugin | `../../js/components/themestrap.plugin.darkmode.js` |

> **If you move the template folder**, update these paths in every `.html` file's `<head>` and closing `</body>` blocks. A global find-and-replace on `../../` will handle it.

---

## Quick start

1. Open `index.html` in your browser — the full site is live, no server needed.
2. To start customising, work from `saas.css` first (tokens), then the HTML files.
3. For production, serve the folder from any static host (Netlify, Vercel, MODX, Nginx).

---

## Customising your brand

All brand colours, fonts, and spacing live in a single `:root` block at the top of `saas.css`. Replace these values to rebrand the entire site instantly.

```css
:root {
  /* — Brand colours — */
  --ts-navy:        #0a1929;   /* Primary dark surface */
  --ts-orange:      #e8672a;   /* Primary accent / CTA */
  --ts-orange-2:    #d2541b;   /* Hover state */
  --ts-teal:        #2ab8c8;   /* Secondary accent */

  /* — Fonts — */
  --ts-font-display: 'Fraunces', Georgia, serif;   /* Headings */
  --ts-font-ui:      'Syne', system-ui, sans-serif; /* Eyebrows, buttons */
  --ts-font-body:    'DM Sans', system-ui, sans-serif;

  /* — Spacing — */
  --ts-section-py:  80px;     /* Vertical section padding */
  --ts-card-radius: 16px;
}
```

**Google Fonts** are loaded in each `<head>`. If you swap to different fonts, update both the `@import` URL and the CSS variables.

---

## Changing the site name and logo

1. **Name**: Find and replace `Launchpad` across all HTML files. The brand mark (`<div class="saas-nav__logo-mark">L</div>`) uses the first letter — update its text content too.

2. **Logo**: Replace the `.saas-nav__logo-mark` div with an `<img>` tag pointing to your logo SVG:

```html
<!-- Replace this -->
<div class="saas-nav__logo-mark">L</div>

<!-- With this -->
<img src="path/to/logo.svg" alt="Your Company" width="32" height="32">
```

---

## Navigation links

The navigation is hand-coded in each file's `<nav class="saas-nav">` block. To add or remove pages:

1. Add/remove `<li><a href="your-page.html">Label</a></li>` items in each file's `<ul class="saas-nav__links">`.
2. `saas.js` auto-highlights the current page by comparing `location.pathname` to each link's `href` — no extra work needed.

---

## Dark mode

Dark mode is powered by **PluginDarkMode** (`themestrap.plugin.darkmode.js`). It:

- Reads `localStorage` for a saved preference on first load.
- Falls back to `prefers-color-scheme` if no saved preference exists.
- Applies/removes the `.dark` class on `<html>` and sets `data-bs-theme` for Bootstrap.

The FOUC-proof snippet in each `<head>` ensures the correct theme is applied before CSS renders:

```html
<script>(function(){
  try {
    var s = localStorage.getItem('themestrap-theme'),
        d = matchMedia('(prefers-color-scheme:dark)').matches,
        t = s || (d ? 'dark' : 'light'),
        h = document.documentElement;
    if (t === 'dark') h.classList.add('dark');
    h.setAttribute('data-theme', t);
    h.setAttribute('data-bs-theme', t);
  } catch(e) {}
})();</script>
```

Dark mode token overrides are defined in `saas.css` under `html.dark { ... }`. Add or adjust token values there to tune the dark palette.

---

## Pricing page

### Changing prices

Each price value uses paired `data-price-monthly` / `data-price-annual` attributes:

```html
<span data-price-monthly="49" data-price-annual="39">49</span>
```

The toggle in `saas.js` reads these attributes and swaps the displayed value when the user switches billing cadence. To add more tiers, copy a pricing card block and add the data attributes.

### Adding a feature row to the comparison table

Add a `<tr>` inside the `<tbody>` of the comparison table in `pricing.html`:

```html
<tr style="border-bottom:1px solid var(--ts-border)">
  <td style="padding:14px 16px;font-weight:600">Your feature name</td>
  <td style="padding:14px 16px;text-align:center;color:var(--ts-muted)">✗</td>
  <td style="padding:14px 16px;text-align:center;color:var(--ts-success)">✓</td>
  <td style="padding:14px 16px;text-align:center;background:rgba(232,103,42,.04);color:var(--ts-success)">✓</td>
  <td style="padding:14px 16px;text-align:center;color:var(--ts-success)">✓</td>
</tr>
```

---

## Testimonials

Testimonial cards use the `.testimonial` class. To add a new one:

```html
<div class="testimonial">
  <p class="testimonial__quote">Your quote text here.</p>
  <div class="d-flex align-items-center gap-3">
    <div class="testimonial__avatar" style="background:var(--ts-teal)">AB</div>
    <div>
      <div class="testimonial__name">Alex Baxter</div>
      <div class="testimonial__role">CTO, Acme Corp</div>
    </div>
  </div>
</div>
```

The `testimonial__quote` text is automatically wrapped in `"` / `"` curly quotes by CSS `::before` / `::after`. The avatar uses initials — replace with an `<img>` for a real photo.

---

## Customer cards and stories

### Adding a customer card (`customers.html`)

Copy an existing `.customer-card` block and update:

- `customer-card__cover` background colour (use any CSS gradient)
- The emoji icon
- `customer-card__industry`, `customer-card__name`, `customer-card__blurb`
- The metric value and label

### Creating a new customer detail page

1. Duplicate `customer-detail.html`.
2. Update the hero section (company name, badge, co-ordinates, date).
3. Replace all `.aside-stat` values.
4. Rewrite the `<article class="story-body">` content.
5. Update the "More stories" cards at the bottom.
6. Link to the new file from the customer card in `customers.html`.

---

## Team cards (`about.html`)

Each `.team-card` uses initials in a coloured avatar. Swap for a real photo:

```html
<div class="team-card__avatar" style="background:transparent;padding:0;overflow:hidden">
  <img src="path/to/photo.jpg" alt="Name" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
</div>
```

---

## Hero sections

Every hero uses the `.hero` class which applies the navy gradient. To swap the gradient:

```css
/* In saas.css, or inline as style="" */
.hero {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_2 100%);
}
```

The `.hero__grid-bg` div adds the subtle grid overlay — remove it by deleting the div if you prefer a solid background.

---

## Section backgrounds

Sections use three utility classes:

| Class | Appearance |
|---|---|
| *(no class)* | `var(--ts-surface)` — white / dark surface |
| `.section--muted` | `var(--ts-bg)` — subtle off-white / dark alt |
| `.section--dark` | `var(--ts-navy)` — always-dark regardless of mode |

Dark mode automatically adjusts `.section--muted` via the `html.dark` token block.

---

## Adding Themestrap plugins

Any plugin from `js/components/` can be layered onto these pages. Example — adding the **Accordion** plugin to a FAQ variant:

1. Include the script before `saas.js`:
   ```html
   <script src="../../js/components/themestrap.plugin.accordion.js"></script>
   ```

2. Add the markup using the plugin's `data-plugin-accordion` attribute.

3. Auto-init fires via `themestrap.init.js` (if included), or call it manually:
   ```js
   $('[data-plugin-accordion]').themestrapPluginAccordion();
   ```

See the `demos/` folder and the Themestrap docs site for the full markup reference for each plugin.

---

## Removing Google Fonts (self-hosted or system fonts)

Remove the two `<link>` tags for Google Fonts from each `<head>`, then update `saas.css`:

```css
:root {
  --ts-font-display: Georgia, 'Times New Roman', serif;
  --ts-font-ui:      system-ui, sans-serif;
  --ts-font-body:    system-ui, sans-serif;
  --ts-font-mono:    'Courier New', monospace;
}
```

---

## File checklist for a brand-new product

- [ ] Replace `Launchpad` with your product name (global find-and-replace)
- [ ] Update logo mark letter or swap in an SVG logo
- [ ] Set brand colours in `saas.css` `:root` block
- [ ] Update Google Fonts import URL if changing fonts
- [ ] Edit `index.html` hero headline and subhead copy
- [ ] Update stat numbers in the dark stats bar (`index.html`)
- [ ] Rewrite all six feature cards (`index.html` + `features.html`)
- [ ] Set pricing tier names, prices, and feature lists (`pricing.html`)
- [ ] Replace all testimonials with real customer quotes
- [ ] Update customer cards with your actual customers
- [ ] Replace the team section in `about.html` with your real team
- [ ] Update footer links (Privacy, Terms, social profiles)
- [ ] Remove or update the hero dashboard mockup (`index.html`)
- [ ] Replace all emoji placeholders with real logos or illustrations
- [ ] Update meta descriptions in each `<head>`

---

## Browser support

Matches Bootstrap 5: all modern evergreen browsers. IE is not supported.

---

*Themestrap SaaS Starter v1.0 · Part of the Themestrap component library*
