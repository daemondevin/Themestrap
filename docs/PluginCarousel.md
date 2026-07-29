# PluginCarousel — Complete Guide

> **No external dependency.** The rewritten plugin ships its own slide engine, clone-loop, drag/touch handling, and injected CSS. ts Carousel 2 is no longer required.

---

## How It Works

`PluginCarousel` is a fully self-contained jQuery class plugin that replaces the old ts Carousel wrapper. It builds a native `translate3d` slide rail inside a `.ts-stage-outer / .ts-stage` scaffold, clones edge items for seamless infinite loop, and wires responsive breakpoints, autoplay, drag, dots, nav, and a rich set of Porto modifier classes — all without any third-party slider library.

The plugin fires the same jQuery events ts used (`change.ts.carousel`, `changed.ts.carousel`, `initialized.ts.carousel`) so every downstream integration (animated-letters, video-background, `data-carousel-navigate-*`, sync) continues to work without markup changes.

### Lifecycle

```
initialize -> setData -> setOptions -> build -> events
```

`build()` injects the CSS block once (guarded by `#themestrap-carousel-styles`), scaffolds the DOM, clones loop items, wires nav/dots, drag, autoplay, resize observer, and fires `initialized.ts.carousel`.

### Loop cloning

When `loop: true`, the plugin prepends and appends `visibleItems` clones of the real slides. On `transitionend` it detects overflow into the clone zone and silently jumps (no-transition) back to the real counterpart — giving the appearance of infinite looping.

### Responsive breakpoints

Option `responsive` is a breakpoint -> `{items}` map identical to ts's format. On each resize the plugin recalculates `visibleItems`, rebuilds clones if the count changed, and re-applies item widths via `calc()`.

---

## Quick Start

### Markup

```html
<div class="ts-carousel"
     data-plugin-options='{"items": 3, "loop": true, "margin": 20, "autoplay": true}'>
  <div><img src="1.jpg" alt=""></div>
  <div><img src="2.jpg" alt=""></div>
  <div><img src="3.jpg" alt=""></div>
</div>
```

The `data-plugin-carousel` data attribute or the `ts-carousel` class can auto-initialize the plugin. `data-plugin-options` accepts all options as a single-quoted attribute containing double-quoted JSON.

### Automatic Initialization

`themestrap.init.js` wires the plugin via `intObsInit()` — the carousel initializes lazily when it scrolls into the viewport:

```
[data-plugin-carousel]:not(.manual), .ts-carousel:not(.manual)
```

Add the `manual` class to opt out of auto-init.

### Manual Initialization

```js
$('.ts-carousel').themestrapPluginCarousel({ items: 3, loop: true });
```

---

## Configuration Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `items` | number | `3` | Visible item count (overridden by `responsive`). |
| `loop` | bool | `true` | Infinite clone-based loop. |
| `margin` | number | `0` | Gap between items in px. Applied as `margin-right` on each `.ts-item`. |
| `stagePadding` | number | `0` | Horizontal padding on `.ts-stage-outer`, revealing adjacent slides. |
| `startPosition` | number | `0` | Zero-based index of the first visible slide. |
| `smartSpeed` | number | `350` | Slide transition duration in ms. |
| `rtl` | bool | `false` | Right-to-left mode. Also detected from `html[dir="rtl"]`. |
| `responsive` | object | `{0:{items:1}, 479:{items:1}, 768:{items:2}, 979:{items:3}, 1199:{items:4}}` | Breakpoint -> `{items}` map. Pass `{}` to disable. |
| `nav` | bool | `true` | Show prev/next buttons. |
| `navText` | array | `[]` | Two-element array of HTML strings for prev/next button content. |
| `navVerticalOffset` | string | — | CSS value applied to `top` of the nav wrapper (e.g. `"40px"`). |
| `navHorizontalOffset` | string | — | CSS `translate3d` X offset for the nav wrapper. |
| `dots` | bool | `true` | Show dot indicators. |
| `dotsData` | bool | `false` | Pull dot content from `[data-dot]` inside each slide. |
| `dotsVerticalOffset` | string | — | CSS value applied to dots wrapper vertical position. |
| `dotsHorizontalOffset` | string | — | CSS `translate3d` X offset for the dots wrapper. |
| `slideBy` | number\|`'page'` | `1` | Steps per nav click. `'page'` advances by `visibleItems`. |
| `autoplay` | bool | `false` | Auto-advance slides. |
| `autoplayTimeout` | number | `5000` | Interval between auto-advances in ms. |
| `autoplayHoverPause` | bool | `false` | Pause autoplay while the cursor is over the carousel. |
| `autoHeight` | bool | `false` | Set `.ts-stage-outer` height to the tallest active item. |
| `animateIn` | bool | `false` | Enable `change.ts.carousel` / `changed.ts.carousel` hooks for animated-letters and appear-animation re-triggering. |
| `animateOut` | bool | `false` | Same as `animateIn`; both flags activate the same integration hooks. |
| `mouseDrag` | bool | `true` | Enable click-drag navigation. |
| `touchDrag` | bool | `true` | Enable swipe navigation. |
| `center` | bool | `false` | Reserved (not yet implemented; use `carousel-center-active-item` class). |
| `refresh` | bool | `false` | Legacy compat shim — no-op in the new plugin. |

> [!TIP]
> Every option can be set globally by modifying `PluginCarousel.defaults`, or per-element via `data-plugin-options`.

---

## Instance API

### Getting the instance

```js
// Init (idempotent — returns existing instance on repeat calls)
const $el  = $('.ts-carousel').themestrapPluginCarousel();

// Pull from data store directly
const inst = $el.data('__carousel');
```

### Public methods

| Method | Description |
|--------|-------------|
| `inst.next(speed?)` | Advance one slide. Optional `speed` overrides `smartSpeed` for this transition. |
| `inst.prev(speed?)` | Step back one slide. |
| `inst.to(index, speed?)` | Jump to a zero-based real slide index. Wraps modulo item count. |
| `inst.destroy()` | Remove clones, unbind all events, restore the element to pre-init state. |
| `inst.navigationOffsets()` | Re-apply `navVerticalOffset` / `navHorizontalOffset` after a layout change. |
| `inst.carouselNavigate()` | Internal: binds `data-carousel-navigate-*` external buttons. Called during `build()`. |

### Events

Bind with jQuery `.on()` on the carousel element:

| Event | Payload | Fires when |
|-------|---------|------------|
| `initialized.ts.carousel` | — | Plugin has finished `build()`. |
| `change.ts.carousel` | `{ item: { index, count } }` | A slide transition is about to start. |
| `changed.ts.carousel` | `{ item: { index, count }, property: { name, value } }` | Transition complete (after `smartSpeed + 50 ms`). |

---

## Modifier Classes

### Nav position

| Class | Effect |
|-------|--------|
| `nav-inside` | Buttons inside the stage at 15 px inset. |
| `nav-inside-edge` | Buttons flush with stage edges. |
| `nav-inside-plus` | Buttons at 30 px inset. |
| `nav-outside` | Buttons outside stage (−50 px on ≥992 px). |
| `nav-bottom` | Buttons below the stage in normal document flow. |
| `nav-bottom-inside` | Buttons overlaid at the bottom of the stage. |
| `nav-center-outside` | Nav wrapper extended 90 px beyond the stage width, centred. |
| `nav-position-1` | Buttons at 20 px inset. |

### Nav appearance

| Class | Effect |
|-------|--------|
| `show-nav-hover` | Nav fades in on hover and slides in from outside. |
| `show-nav-title` | Nav positioned top-right above a heading, transparent background. |
| `nav-style-1` | Transparent background, inherits text colour. |
| `nav-style-2` | CSS chevron arrows (no icon font required). |
| `nav-style-3` | Large transparent icon style. |
| `nav-style-4` | Pill-shaped buttons with drop shadow. |
| `nav-style-diamond` | Diamond-rotated buttons. |
| `nav-svg-arrows-1` | SVG arrow icons injected by the plugin. |
| `nav-arrows-1` | FA `f060`/`f061` long arrows. |
| `nav-arrows-2` | FA `f100`/`f101` double chevrons. |
| `nav-arrows-thin` | Simple-line-icons thin chevrons. |
| `nav-icon-1` | FA `f060`/`f061` icons on default buttons. |
| `rounded-nav` | Circular border on buttons. |
| `nav-squared` | No border-radius. |
| `nav-rounded` | 50% border-radius. |
| `full-width` / `big-nav` | Full-height padded buttons. |

### Nav color

`nav-light`, `nav-dark`, `nav-transparent`, `nav-borders`, `nav-borders-light`, `nav-arrow-light`, `nav-with-transparency`

### Nav size

`nav-sm` (30 px), `nav-md` (40 px), `nav-lg` (60 px tall), `nav-font-size-sm/md/lg/xl`

### Nav visibility

`nav-remove-prev`, `nav-remove-next`, `nav-full-height`

### Dots

| Class | Effect |
|-------|--------|
| `dots-inside` | Dots overlaid at bottom-right of stage. |
| `dots-title` | Dots positioned above stage beside a heading. |
| `dots-light` / `dots-dark` | White or dark dot colors. |
| `dots-morphing` | Dots stretch horizontally when active. |
| `dots-modern` | Tiny dots that scale up on active. |
| `dots-orientation-portrait` | Vertical dot stack. |
| `dots-align-left` / `dots-align-right` | Dot alignment. |
| `dots-horizontal-center` | Full-width centred dots. |
| `dots-vertical-center` | Vertically centred dots (use with `dots-inside`). |
| `show-dots-hover` | Dots fade in on carousel hover. |
| `show-dots-xs/sm/md` | Show dots only at specific breakpoints. |

### Misc

| Class | Effect |
|-------|--------|
| `stage-margin` | 40 px margins on stage outer; `stage-margin-sm/md/lg` for larger values. |
| `top-border` | 1 px top border + 18 px padding. |
| `carousel-center-active-item` | Non-current items at 0.2 opacity; current at 1. |
| `carousel-center-active-item-style-2` | Same but 0.7 opacity for non-current. |
| `carousel-center-active-item-2` | Card-style active item with primary background. |
| `carousel-center-active-item-3` | Full-width active item layout. |
| `show-nav-hover` | Nav hidden until hover. |
| `carousel-shadow-1` | Radial shadow behind the carousel. |
| `carousel-bottom-inside-shadow` | Gradient shadow at stage bottom. |
| `carousel-right-side-nav` | Stage narrowed 55 px; next button positioned outside right. |

---

## Recipes

### Three-up image grid

```html
<div class="ts-carousel"
     data-plugin-options='{"items":3,"loop":true,"margin":16}'>
  <div><img src="a.jpg" alt=""></div>
  <div><img src="b.jpg" alt=""></div>
  <div><img src="c.jpg" alt=""></div>
</div>
```

### Autoplay hero banner

```html
<div class="ts-carousel"
     data-plugin-options='{
       "items": 1, "loop": true,
       "autoplay": true, "autoplayTimeout": 5000,
       "autoplayHoverPause": true,
       "nav": false, "dots": true, "smartSpeed": 600,
       "responsive": {}
     }'>
  <div>...slide...</div>
</div>
```

### Fixed two-item, no loop

```html
<!-- responsive:{} locks item count regardless of viewport width -->
<div class="ts-carousel"
     data-plugin-options='{"items":2,"loop":false,"margin":20,"responsive":{}}'>
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
```

### External navigation

```html
<button data-carousel-navigate-to="2"
        data-carousel-navigate-id="#hero">Go to slide 2</button>

<div id="hero" class="ts-carousel"
     data-plugin-options='{"items":1,"loop":true,"nav":false,"dots":false,"responsive":{}}'>
  <div>Slide 1</div>
  <div>Slide 2</div>
</div>
```

### Peek (stagePadding)

```html
<div class="ts-carousel"
     data-plugin-options='{"items":1,"loop":true,"stagePadding":50,"margin":20,"responsive":{}}'>
  <div>Slide A</div>
  <div>Slide B</div>
</div>
```

### Synced carousels

```html
<div id="main-car" class="ts-carousel" data-sync="#thumb-car"
     data-plugin-options='{"items":1,"loop":true,"nav":true,"dots":false,"responsive":{}}'>
  <div>Main 1</div>
  <div>Main 2</div>
</div>

<div id="thumb-car" class="ts-carousel manual"
     data-plugin-options='{"items":4,"loop":false,"nav":false,"dots":false}'>
  <div>Thumb 1</div>
  <div>Thumb 2</div>
</div>
```

### Programmatic API

```js
// Manual init (add .manual to skip auto-init)
const $el  = $('#my-carousel').themestrapPluginCarousel({ items: 3 });
const inst = $el.data('__carousel');

$('#btn-next').on('click', () => inst.next());
$('#btn-prev').on('click', () => inst.prev());
$('#btn-go3').on('click', () => inst.to(2));   // zero-based

$el.on('changed.ts.carousel', (e) => {
  console.log('Now at slide', e.item.index);
});

// Clean up
inst.destroy();
```

---

## Common Pitfalls

### Carousel collapses inside a hidden tab

The plugin cannot measure a hidden element. If you manually initialize inside a Bootstrap tab, trigger a resize after the tab opens:

```js
$('#myTab').on('shown.bs.tab', () => $(window).trigger('resize'));
```

### `responsive: {}` vs omitting `responsive`

Omitting `responsive` applies the default breakpoint ramp (1 -> 4 items). Pass `responsive: {}` to **lock** the carousel to the `items` value at all widths.

### Icons not rendered before init

If slides contain `[data-icon]` elements that haven't rendered yet, the plugin defers init until `icon.rendered` fires on `window`. Add the `manual` class and initialize yourself after icons are ready if you need tighter control.

### CSS specificity with nav-light / nav-dark

These modifiers use `!important` to override the skin defaults. Don't add your own `!important` to nav button colors unless you're above the modifier level in specificity.

### Destroy and re-init

`destroy()` removes clones, unbinds events, and clears `data('__carousel')`. After destroy, calling `$.fn.themestrapPluginCarousel()` on the same element starts a fresh instance. The stage scaffold is also removed, so re-init rebuilds it from the original children.