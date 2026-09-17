# PluginFloatElement

Scroll-driven parallax translation with optional secondary transforms. Dependency-free — visibility is tracked with a native `IntersectionObserver` and the scroll handler feeds a `requestAnimationFrame` throttle so it never blocks input events.

---

## How It Works

On every scroll frame the plugin computes a `scrollPercent` value for the element:

```
scrollPercent = 100 × (elementTop − scrollTop) / windowHeight
```

`scrollPercent` is approximately 100 when the element's top edge sits at the bottom of the viewport, falling toward 0 as the element scrolls up, and going negative once it passes the viewport top. Dividing by `speed` gives the `translate` percentage applied via `transform: translate3d(…)`.

A persistent `IntersectionObserver` writes an internal `_inView` flag whenever the element enters or leaves the viewport (with a ±20% rootMargin buffer). Transforms are only applied while `_inView` is `true`, so off-screen elements are skipped entirely.

Additional transforms — `scale`, `rotate`, `skew`, and `opacity` — each accept a `[from, to]` tuple. A normalised `t` value (clamped 0–1 from `scrollPercent / 100`) linearly interpolates between the two endpoints:

```
t = clamp(scrollPercent / 100, 0, 1)
value = from + (to − from) × t
```

All active transforms are composed into a single `transform` string on each tick, keeping GPU layer promotion stable.

---

## Quick Start

```html
<!-- 1. Markup -->
<div id="floating-card">
  Decorative content
</div>

<!-- 2. Scripts (after jQuery and themestrap.js) -->
<script src="js/components/themestrap.plugin.floatelement.js"></script>
```

```js
// 3. Initialize
$('#floating-card').themestrapPluginFloatElement({
  speed: 4,
});
```

The element will begin drifting on the Y axis relative to the scroll position as soon as the page is scrolled.

---

## Markup Reference

Elements can be initialized automatically by `themestrap.init.js` using the `data-plugin-float-element` attribute. Pass options via `data-plugin-options` as a JSON string.

```html
<div data-plugin-float-element
     data-plugin-options='{"speed": 5, "transition": true}'>
</div>
```

For elements inside an SVG (where `IntersectionObserver` cannot observe child nodes directly), add `data-plugin-float-element-svg` to the **parent SVG element** and `data-plugin-float-element` to each child. The plugin will delegate initialization automatically:

```html
<svg data-plugin-float-element-svg>
  <g data-plugin-float-element data-plugin-options='{"isInsideSVG": true, "speed": 3}'></g>
</svg>
```

Add the `.manual` class to exclude an element from auto-init so you can pass custom options in JS:

```html
<div data-plugin-float-element class="manual" id="my-el"></div>
```

```js
$('#my-el').themestrapPluginFloatElement({ speed: 4, scale: [1, 1.08] });
```

---

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `speed` | `number` | `3` | Divisor applied to `scrollPercent` — larger values produce subtler movement |
| `horizontal` | `boolean` | `false` | Translate on the X axis instead of the Y axis |
| `invertDirection` | `boolean` | `false` | Flip the translation direction. Replaces the old `minus: '-'` pattern |
| `startPos` | `string` | `'top'` | CSS positioning preset for absolutely-placed elements: `'top'` sets `top: 0`, `'bottom'` sets `bottom: 0` and inverts the base direction, `'none'` applies no positioning |
| `minWindowWidth` | `number` | `991` | The plugin is inactive below this viewport width in px. Set to `0` to enable on all viewports |
| `clamp` | `false \| number` | `false` | Cap the absolute translation at ±N%. Prevents elements from drifting out of a bounded container |
| `opacity` | `false \| [number, number]` | `false` | Interpolate CSS `opacity` across the scroll range, e.g. `[0, 1]` fades in, `[1, 0]` fades out |
| `scale` | `false \| [number, number]` | `false` | Interpolate a `scale()` transform, e.g. `[1, 1.1]` |
| `rotate` | `false \| [number, number]` | `false` | Interpolate a `rotate()` transform in degrees, e.g. `[0, 15]` |
| `skew` | `false \| [number, number]` | `false` | Interpolate a `skewX()` transform in degrees, e.g. `[0, 8]` |
| `transition` | `boolean` | `false` | Apply a CSS `transition` to smooth movement between scroll ticks. Useful for slow or stuttery scroll inputs |
| `transitionDuration` | `number` | `500` | Duration of the smoothing transition in ms. Keep this short (100–300 ms) to avoid lag |
| `transitionDelay` | `number` | `0` | Delay before the transition starts, in ms |
| `scrollDirection` | `string` | `'both'` | Gate transform updates by scroll direction: `'both'`, `'down'`, or `'up'`. The element freezes in place when scrolling against the specified direction |
| `respectReducedMotion` | `boolean` | `true` | Skip initialization entirely if the visitor has `prefers-reduced-motion: reduce` set. The element remains static |
| `isInsideSVG` | `boolean` | `false` | Applies a tighter `scrollPercent` factor (÷50 rather than ÷1) for child elements inside an SVG, where coordinate spaces are scaled |
| `style` | `string \| null` | `null` | An arbitrary inline style string applied to the element before the plugin runs. Provided for legacy layout compatibility |
| `onMove` | `function \| null` | `null` | Callback fired on every computed rAF tick. Receives `(scrollPct: number, transforms: object)`. See [onMove Callback](#onmove-callback) |

### `[from, to]` tuple behaviour

All tuple options (`opacity`, `scale`, `rotate`, `skew`) use the same interpolation:

- `t = 0` when `scrollPercent ≥ 100` (element top at viewport bottom)
- `t = 1` when `scrollPercent ≤ 0` (element top at or above viewport top)
- Values between are linearly interpolated

This means `[0, 1]` on `opacity` starts transparent when the element first enters from below and reaches full opacity as it scrolls to the top of the viewport.

---

## Public API

Retrieve the instance from the element's data store. Do not chain off the init call.

```js
// Correct
$('#my-el').themestrapPluginFloatElement({ speed: 4 });
const inst = $('#my-el').data('__floatElement');

// Incorrect — init returns a jQuery map, not the instance
const inst = $('#my-el').themestrapPluginFloatElement({ speed: 4 }).someMethod();
```

### Methods

**`inst.pause()`**
Suspends rAF updates. The element freezes at its current transform. Scroll events still bind but produce no output until `resume()` is called.

**`inst.resume()`**
Resumes updates and immediately fires one tick to snap the element to the current scroll position.

**`inst.recalculate()`**
Forces one transform tick without waiting for a scroll event. Useful after a layout change (e.g. an accordion expanding above the element changes its `offsetTop`).

**`inst.destroy()`**
Unbinds the scroll listener, cancels any pending animation frame, disconnects the `IntersectionObserver`, removes `will-change` and `transition`, clears the inline `transform` and `opacity`, and calls `removeData`. The element is left in its natural painted state.

### String command shorthand

The jQuery bridge accepts a method name as a string:

```js
$('#my-el').themestrapPluginFloatElement('pause');
$('#my-el').themestrapPluginFloatElement('resume');
$('#my-el').themestrapPluginFloatElement('recalculate');
$('#my-el').themestrapPluginFloatElement('destroy');
```

---

## onMove Callback

The `onMove` function fires on every computed animation frame tick while the element is in view.

```js
$('#my-el').themestrapPluginFloatElement({
  speed:   4,
  scale:   [1, 1.1],
  opacity: [0.5, 1],
  onMove: function (scrollPct, transforms) {
    // scrollPct  — raw scrollPercent before clamping (can be outside 0–100)
    // transforms — object containing the values applied this tick
  },
});
```

### `transforms` object shape

The `transforms` object only contains keys for active options:

| Key | Present when | Value |
|---|---|---|
| `translateY` | `horizontal: false` | Applied Y translation in `%` |
| `translateX` | `horizontal: true` | Applied X translation in `%` |
| `scale` | `scale` tuple set | Computed scale factor |
| `rotate` | `rotate` tuple set | Computed rotation in degrees |
| `skew` | `skew` tuple set | Computed skewX in degrees |
| `opacity` | `opacity` tuple set | Computed opacity |

`onMove` is an option, not a jQuery event, so only one callback can be registered per instance. For multiple consumers, wrap the callback or use a custom event dispatched from within `onMove`.

---

## Recipes

### Classic parallax background layer

```js
$('.hero-bg').themestrapPluginFloatElement({
  speed:           6,
  startPos:        'top',
  transition:      true,
  transitionDuration: 120,
});
```

A high `speed` value keeps the movement subtle — appropriate for background imagery where a strong parallax feels distracting.

### Scroll-driven hero reveal

Fade and scale a hero element in as it scrolls into the viewport:

```js
$('.hero-headline').themestrapPluginFloatElement({
  speed:   5,
  opacity: [0, 1],
  scale:   [0.95, 1],
  transition:      true,
  transitionDuration: 300,
});
```

### Counter-scroll element

An element that moves in the opposite direction to the scroll, creating a sense of depth:

```js
$('.floating-badge').themestrapPluginFloatElement({
  speed:           4,
  invertDirection: true,
  transition:      true,
  transitionDuration: 150,
});
```

### Contained drift with clamp

Decorative element inside a card where uncapped drift would clip against the card edge:

```js
$('.card-decoration').themestrapPluginFloatElement({
  speed: 3,
  clamp: 6,
});
```

### SVG child elements

```html
<svg id="my-svg" data-plugin-float-element-svg>
  <circle id="dot-a" data-plugin-float-element
          data-plugin-options='{"isInsideSVG": true, "speed": 4}'/>
  <circle id="dot-b" data-plugin-float-element
          data-plugin-options='{"isInsideSVG": true, "speed": 7, "invertDirection": true}'/>
</svg>
```

```js
$('#my-svg').themestrapPluginFloatElement();
```

The parent SVG triggers the delegation and each child self-initializes with its own options.

### Reduced-motion safe

`respectReducedMotion: true` is the default. For a static fallback that still has entrance opacity:

```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

$('.float-el').themestrapPluginFloatElement({
  speed:                4,
  opacity:              [0.4, 1],
  respectReducedMotion: true,
});

// If reduced motion is active, provide a static fallback opacity
if (prefersReduced) {
  $('.float-el').css('opacity', '1');
}
```

### Recalculate after layout shift

When content above the element expands (e.g. an accordion opens), the element's `offsetTop` changes. Trigger a recalculate:

```js
$('#accordion').on('opened.ts.accordion', function () {
  const inst = $('#my-float-el').data('__floatElement');
  if (inst) inst.recalculate();
});
```

---

## Common Pitfalls

**Element has no height on init.** The plugin reads `offset().top` in `build()`. If the element is hidden or collapsed at init time, `offsetTop` will be 0 or incorrect and the initial seed position will be wrong. Initialize after layout is stable, or call `recalculate()` once the element is visible.

**Effect disabled on mobile.** `minWindowWidth` defaults to `991`. On viewports narrower than this the plugin silently skips initialization. Set `minWindowWidth: 0` for demos or when parallax is intentional on small screens.

**`startPos` has no effect on flow-positioned elements.** The `'top'` and `'bottom'` values inject `top: 0px` or `bottom: 0px` as inline styles. These only change layout on `position: absolute` or `position: fixed` elements. For normal flow elements, ignore `startPos` and rely on `invertDirection` to control the translation sign.

**Stale `offsetTop` after DOM mutation.** If elements above the floating element change height at runtime, call `inst.recalculate()` to force a tick with the updated geometry.

**`onMove` is not an event — only one handler per instance.** Passing `onMove` twice (or reinitializing with a different callback) replaces the previous handler. Coordinate multiple consumers in a single function or dispatch a custom DOM event from inside `onMove`.

**Opacity tuple has the wrong orientation.** `opacity: [1, 0]` fades the element *out* as it scrolls toward the top of the viewport. `[0, 1]` fades it *in*. This is counter-intuitive because `t = 0` corresponds to the element entering from *below*.

**`destroy()` then immediate reinit can race.** `destroy()` cancels the pending `requestAnimationFrame` synchronously, but the browser may fire one more scroll event before the new listener is bound. Add a brief timeout or defer reinit to the next tick if you see a flash.

**IntersectionObserver rootMargin means early activation.** The observer uses `rootMargin: '20% 0px 20% 0px'`, so the `_inView` flag becomes `true` before the element is fully on screen. This is intentional — it prevents a transform pop when the element enters — but it means `onMove` may fire while the element is still just off-screen.

### Diagnostic checklist

- [ ] Page is fully laid out before `themestrapPluginFloatElement` is called (inside `$(function(){…})`)
- [ ] `minWindowWidth` is ≤ current viewport width
- [ ] `respectReducedMotion` is `false` if testing on a machine with reduced-motion enabled
- [ ] For SVG children, `data-plugin-float-element-svg` is on the `<svg>` and `isInsideSVG: true` is in each child's options
- [ ] `clamp` is set when the element is inside a bounded container with `overflow: hidden`
- [ ] `recalculate()` is called after any layout shift that changes the element's `offsetTop`
- [ ] Instance is retrieved as `$el.data('__floatElement')` on a fresh selector, not chained off init