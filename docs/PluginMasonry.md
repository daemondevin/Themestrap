# PluginMasonry Guide

A fully self-contained Pinterest-style grid engine. Packs children into responsive columns using native absolute positioning — **no Isotope, no waitForImages, no external dependencies**. Images are waited on natively and a loader overlay is shown until the grid is fully settled.

---

## How It Works

On init the plugin waits for every `<img>` inside the container to report a natural height (via native `load`/`error` events). Once all images are settled it runs the layout pass, which:

1. Calculates the column count and gutter for the current viewport width by walking the responsive breakpoint map.
2. Sets each child's `width` to the computed column width and reads its `outerHeight`.
3. Assigns each child an absolute `left`/`top` position by placing it in the shortest column (bin-packing).
4. Sets the container's explicit `height` to the tallest column's accumulated height.

A debounced `resize` handler (200 ms) re-runs the layout whenever the viewport changes, so responsive column counts snap to the right breakpoint automatically.

### CSS injection

On first init the plugin injects a single `<style id="themestrap-masonry-styles">` into `<head>`. Only two rules are written: `position: relative` on the container and `box-sizing: border-box` on its children. A guard prevents duplicate injection across multiple instances on the same page.

---

## Quick Start

> **No dependencies.** This plugin is fully self-contained. No external libraries need to be loaded.

### Markup

```html
<div data-plugin-masonry>
  <div>...card one...</div>
  <div>...card two...</div>
  <div>...card three...</div>
</div>
```

The container's direct children are the masonry items — no special class is required. The plugin assigns sizing and position directly via inline CSS. Any existing classes (Bootstrap grid columns, card wrappers, etc.) are preserved.

### Automatic initialization

`themestrap.init.js` wires this plugin on DOM ready via a direct `$().each()` pass against:

```
[data-plugin-masonry]:not(.manual)
```

Add the `manual` class to opt an element out and initialize it yourself.

### Manual initialization

```js
$('#myGrid').themestrapPluginMasonry({
  columns: 4,
  gutter: 24
});
```

---

## Configuration Options

| Key | Type | Default | Description |
|---|---|---|---|
| `columns` | number | `3` | Fallback column count when no responsive breakpoint matches. |
| `gutter` | number | `20` | Gap in pixels between columns and rows. Used as fallback when no breakpoint defines it. |
| `responsive` | object | `{0, 576, 768, 992, 1200}` | Breakpoint map — keys are minimum viewport widths; values are `{ columns, gutter }` objects. |
| `columnClass` | string | `''` | Extra class added to the container element on init. |

> Per-element overrides go in a single-quoted `data-plugin-options` attribute with double-quoted JSON keys — `themestrap.fn.getOptions()` normalises it and merges it over the defaults.

### Responsive breakpoints

The default breakpoint map mirrors Bootstrap's grid:

```js
responsive: {
  0:    { columns: 1, gutter: 15 },  // xs — single column
  576:  { columns: 2, gutter: 15 },  // sm
  768:  { columns: 2, gutter: 20 },  // md
  992:  { columns: 3, gutter: 20 },  // lg
  1200: { columns: 3, gutter: 20 }   // xl
}
```

The plugin sorts breakpoint keys descending and walks them to find the first whose minimum width is ≤ the current viewport. You can override individual breakpoints without replacing the whole map.

---

## Instance API

Every Themestrap plugin runs the same fluent lifecycle on construction:
`initialize → setData → setOptions → build → events`

Initialize (or fetch the existing instance) through the jQuery method:

```js
// Initialize / return the existing instance
const inst = $('#myGrid').themestrapPluginMasonry({ columns: 4 });

// Pull a previously-initialized instance straight off the element
const same = $('#myGrid').data('__masonry');
```

The jQuery method is idempotent: calling `themestrapPluginMasonry()` a second time returns the cached instance stored under `data('__masonry')` rather than building a new one.

### Public methods

| Method | Args | Returns | Description |
|---|---|---|---|
| `layout()` | — | `this` | Re-run the layout pass immediately. Use after changing item content or showing the container. |
| `appended($items)` | `$items` jQuery | `this` | Append new items, wait for their images, then re-layout. Designed for load-more / infinite-scroll. |
| `destroy()` | — | `this` | Removes the resize listener, strips inline styles from all items and the container, restores `initialHTML`. |

### Internal helpers (reference)

These are not part of the public API but useful for debugging:

- `_layout()` — the core bin-packing pass.
- `_columnCount()` / `_gutter()` — resolve the active breakpoint values.
- `_waitForImages(container, cb)` — native image-load waiter; fires `cb` once all `<img>` elements complete.
- `_createLoader()` / `_removeLoader()` — inject and dismiss the `.bounce-loader` overlay inside any parent `.masonry-loader`.
- `_injectStyles()` — one-time CSS injection guarded by `STYLE_ID`.
- `_uid()` — stable random string used to namespace the resize event per instance.

---

## Loading Overlay

If the grid container has a `.masonry-loader` ancestor, the plugin automatically injects a `.bounce-loader` spinner and controls its visibility classes while waiting for images. This is the same loader pattern used across all Themestrap masonry layouts in Porto.

```html
<div class="masonry-loader masonry-loader-showing">
  <div data-plugin-masonry data-plugin-options='{"columns": 3}'>
    <div>Item A</div>
    <div>Item B</div>
  </div>
</div>
```

Classes managed on the `.masonry-loader` element:

- `masonry-loader-showing` — present while waiting; removed when images settle.
- `masonry-loader-loaded` — added 300 ms after loader removal; triggers the CSS reveal transition.

A 3-second safety timeout calls `_removeLoader()` in case any images fail to fire events. The layout still runs regardless.

---

## Recipes

### Basic 3-column grid

```html
<div data-plugin-masonry>
  <div class="portfolio-item">...</div>
  <div class="portfolio-item">...</div>
  <div class="portfolio-item">...</div>
</div>
```

### Custom breakpoints — 4-column desktop

```html
<div data-plugin-masonry
     data-plugin-options='{
       "responsive": {
         "0":    {"columns": 1, "gutter": 12},
         "576":  {"columns": 2, "gutter": 16},
         "992":  {"columns": 4, "gutter": 20},
         "1400": {"columns": 4, "gutter": 24}
       }
     }'>
  ...
</div>
```

### Zero-gap tile grid

```html
<div data-plugin-masonry data-plugin-options='{"gutter": 0}'>
  <div><img src="..." alt=""></div>
  <div><img src="..." alt=""></div>
</div>
```

### Load More — append items after AJAX fetch

```js
const grid = $('#myGrid').data('__masonry');

fetch('/api/more-items')
  .then(r => r.text())
  .then(html => {
    grid.appended($(html));
  });
```

### Force re-layout after Bootstrap tab show

```js
$('[data-bs-toggle="tab"]').on('shown.bs.tab', () => {
  const inst = $('#tabGrid').data('__masonry');
  if (inst) inst.layout();
});
```

---

## Common Pitfalls

### Grid inside a hidden container

> **Error:** If the container is `display: none` when the plugin initializes, all items report a height of `0` and the layout collapses.

Show the container first, or call `instance.layout()` after it becomes visible (e.g. on tab show, modal open).

### Children must not have conflicting `position`

The layout engine applies `position: absolute` to every direct child. Children that already set `position: fixed` or `position: sticky` will escape the stacking context. Keep those position declarations on inner elements instead.

### Images without dimensions work fine

Unlike the old Isotope-based version, this plugin waits for images natively before laying out. You do **not** need to set explicit `width`/`height` attributes — though doing so speeds up the initial paint by letting the browser reserve space earlier.

### Masonry is not Sort

PluginMasonry only lays out items — it doesn't filter, sort, or animate item additions. For filterable grids pair it with `PluginSort` (which uses Isotope), or implement your own filter logic that calls `instance.layout()` after toggling item visibility.

---

## Upgrading from the Isotope-based version

The rewrite is a **drop-in replacement**. All of the following are preserved:

- `data-plugin-masonry` attribute trigger
- `instanceName` (`__masonry`)
- jQuery bridge name (`themestrapPluginMasonry`)
- Loader markup and CSS class sequence (`.masonry-loader`, `.masonry-loader-showing`, `.masonry-loader-loaded`, `.bounce-loader`)
- `init.js` wiring (DOM-ready `$().each()` pass)

The only **breaking change** is the `defaults` object — the old plugin had an empty `{}` defaults (all configuration was passed to Isotope). The new plugin has `columns`, `gutter`, `responsive`, and `columnClass` defaults. If you were passing Isotope-specific options like `layoutMode` or `itemSelector` via `data-plugin-options`, those are now ignored silently.