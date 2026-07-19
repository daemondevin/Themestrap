# PluginMasonry Guide

**File:** `js/components/themestrap.plugin.masonry.js`  
**jQuery method:** `$.fn.themestrapPluginMasonry`  
**Instance key:** `__masonry`  
**Init strategy:** DOMReady `$().each()` — Isotope must lay out immediately.  
**Dependency:** [Isotope](https://isotope.metafizzy.co/) (`$.fn.isotope`) and [waitForImages](https://github.com/alexanderdickson/waitForImages) (`$.fn.waitForImages`)

## [How It **Works**](#how-it-works)

PluginMasonry initializes Isotope on a grid container, reads its config from `data-plugin-options`, waits for all child images to load before firing the layout, and shows an optional loading spinner (`.masonry-loader`) during initialization. It also re-layouts on window resize (debounced to 300 ms) and auto-removes the loader after a 3-second fallback.

## [Quick **Start**](#quick-start)

```html
<div class="masonry-loader">
  <!-- The .masonry-loader parent hides the bounce spinner on load -->
  <div class="row" data-plugin-masonry
       data-plugin-options='{"itemSelector": ".col", "layoutMode": "masonry"}'>
    <div class="col"><img src="a.jpg" alt=""></div>
    <div class="col"><img src="b.jpg" alt=""></div>
    <div class="col"><img src="c.jpg" alt=""></div>
  </div>
</div>
```

### Basic grid

```html
<div class="row" data-plugin-masonry>
  <div class="col-sm-6 col-lg-4 isotope-item">…</div>
  <div class="col-sm-6 col-lg-4 isotope-item">…</div>
  <div class="col-sm-6 col-lg-4 isotope-item">…</div>
</div>
```

### With loading overlay

Wrap the grid in `.masonry-loader.masonry-loader-showing` to enable the bounce-loader spinner:

```html
<div class="masonry-loader masonry-loader-showing">
  <div class="row" data-plugin-masonry>
    <div class="col-sm-6 col-lg-4 isotope-item">…</div>
    <div class="col-sm-6 col-lg-4 isotope-item">…</div>
  </div>
</div>
```

> [!NOTE]  
> The loader appends a `.bounce-loader` div with three bounce elements and removes `masonry-loader-showing` (adding `masonry-loader-loaded`) once Isotope fires `layoutComplete` or after the 3-second fallback.

### With Isotope filter

```html
<button data-filter="*">All</button>
<button data-filter=".category-a">Category A</button>

<div class="row" data-plugin-masonry
     data-plugin-options='{"filter": "*", "layoutMode": "masonry"}'>
  <div class="col-sm-6 isotope-item category-a">…</div>
  <div class="col-sm-6 isotope-item category-b">…</div>
</div>
```

> [!IMPORTANT]  
> Filter buttons are wired separately (not by this plugin) — call `$grid.isotope({ filter: selector })` from your own click handler.

## Options

All options are passed through to Isotope. Common options:

| Option | Type | Default | Description |
|---|---|---|---|
| `layoutMode` | `string` | `'masonry'` | Isotope layout mode: `'masonry'`, `'fitRows'`, `'cellsByColumn'`, etc. |
| `itemSelector` | `string` | `'.isotope-item'` | CSS selector for grid items. |
| `filter` | `string` | `'*'` | Initial filter selector. |
| `sortBy` | `string` | `'original-order'` | Sort criterion. |
| `transitionDuration` | `string` | `'0.6s'` | CSS transition duration for item moves. |

Pass any valid Isotope option via `data-plugin-options`:

```html
<div data-plugin-masonry
     data-plugin-options='{"layoutMode": "fitRows", "itemSelector": ".grid-item"}'>
```

## Auto-init (init.js)

Masonry must initialize on DOMReady regardless of viewport (not IntersectionObserver):

```js
if ($.isFunction($.fn['themestrapPluginMasonry']) && $('[data-plugin-masonry]').length) {
    $(() => {
        $('[data-plugin-masonry]:not(.manual)').each(function () {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options')) || {};
            $this.themestrapPluginMasonry(opts);
        });
    });
}
```
---

> [!NOTE]
> - `$.fn.isotope` must be loaded before this plugin runs. The plugin guards with `$.isFunction($.fn.isotope)` and silently exits if Isotope is absent.
> - `$.fn.waitForImages` is required for the image-wait behavior. If absent, Isotope will lay out before images load, causing incorrect column heights.
> - Re-layout is triggered automatically on `window resize` with a 300 ms debounce.