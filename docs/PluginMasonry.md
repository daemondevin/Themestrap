# Masonry Guide

Themestrap's Isotope masonry grid plugin — waits for all images to load, shows a bounce loader, and re-layouts on window resize.

## [How It **Works**](#how-it-works)

PluginMasonry is a thin wrapper around [Isotope](https://isotope.metafizzy.co/). It reads its config from `data-plugin-options`, waits for all images inside the grid to load via jQuery's `imagesLoaded`, hides a `.masonry-loader` parent wrapper, then initialises Isotope. On every window resize it calls `isotope('layout')` to reflow the grid.

---

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

All Isotope configuration options can be passed via `data-plugin-options`. Key options:

| Option | Default | Description |
|--------|---------|-------------|
| `itemSelector` | `'.isotope-item'` | CSS selector for grid items. |
| `layoutMode` | `'masonry'` | Isotope layout mode. |
| `percentPosition` | `true` | Use percent-based positions. |
| `masonry.columnWidth` | (auto) | Fixed column width in px. |

---
