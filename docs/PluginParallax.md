# PluginParallax Guide

> The most configurable plugin in the suite. At its simplest it gives a section a slow-scrolling background image; with more options it can scrub any CSS property as you scroll, react to the mouse, scale the image, and switch behavior below a width breakpoint.

---

## How It Works

PluginParallax has three distinct modes that share one option set:

| Mode | Trigger option | What it does |
|---|---|---|
| **Background** | *(default)* | Moves an oversized background image slower than the page scroll |
| **Scrollable** | `scrollableParallax: true` | Scrubs an arbitrary CSS property between two values as the element passes through the viewport |
| **Mouse** | `mouseParallax: true` | Shifts `.parallax-mouse-object` children in response to pointer movement |

Modes are mutually exclusive per element — the first matching branch in `build()` wins and returns early. Do not combine `mouseParallax` and `scrollableParallax` on the same element.

### Where the image comes from

The background image is read from `data-image-src` on the host element, not from a CSS `background-image`. This lets the plugin own the layer it builds and position it independently of the element's own background.

```html
<section data-plugin-parallax data-image-src="img/mountains.jpg">
  <!-- foreground content here -->
</section>
```

### Mobile behavior

`enableOnMobile` defaults to `true` for the background mode. When `false`, the plugin adds `.parallax-disabled` to the wrapper instead of binding scroll events.

The scrollable mode has its own `scrollableParallaxMinWidth` guard (default `991`). Below that pixel width the scrubbing path is skipped entirely and no styles are applied.

### Injected CSS

On first init the plugin lazily injects a `<style id="themestrap-parallax-styles">` block containing:

```css
.parallax-background { will-change: transform; background-repeat: no-repeat; background-size: cover; }
.parallax-disabled .parallax-background { transform: none !important; }
```

The guard prevents duplicate injection across multiple instances.

---

## Quick Start

### Markup contract

```html
<!-- Background-image parallax -->
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"speed":1.5,"parallaxHeight":"180%"}'>
  <div class="container py-5">Foreground content</div>
</section>
```

### Automatic initialization

`themestrap.init.js` wires this plugin via `intObsInit()` — lazy, triggered when the element scrolls into the viewport:

```js
// init.js entry
if ($.isFunction($.fn['themestrapPluginParallax']) && $('[data-plugin-parallax]').length) {
    themestrap.fn.intObsInit('[data-plugin-parallax]:not(.manual)', 'themestrapPluginParallax');
}
```

Add the `manual` class to opt an element out of auto-init.

### Manual initialization

```js
$('#mySection').themestrapPluginParallax({
    speed          : 2,
    parallaxHeight : '200%',
});
```

---

## Configuration Options

| Key | Type | Default | Description |
|---|---|---|---|
| `speed` | number | `1.5` | Parallax movement speed multiplier relative to scroll. Higher = slower movement. |
| `horizontalPosition` | string | `'50%'` | Horizontal background-position of the parallax layer. |
| `offset` | number | `0` | Vertical start offset (px) applied to the parallax layer. |
| `parallaxDirection` | string | `'top'` | Direction the layer travels: `'top'` or `'bottom'`. |
| `parallaxHeight` | string | `'180%'` | Height of the oversized parallax layer — must exceed `100%` to have slack to scroll through. |
| `parallaxScale` | bool | `false` | Scale the image as it scrolls for a zoom effect. |
| `parallaxScaleInvert` | bool | `false` | Invert the scale direction when `parallaxScale` is on. |
| `scrollableParallax` | bool | `false` | Enable scroll-scrubbed CSS-property mode. |
| `scrollableParallaxMinWidth` | number | `991` | Minimum window width for scrollable mode; below this falls back to static. |
| `startOffset` | number | `7` | Divisor controlling how fast the scrub range traverses on scroll. |
| `transitionDuration` | string | `'200ms'` | CSS transition applied to the scrubbed property. |
| `cssProperty` | string | `'width'` | Which CSS property the scrollable mode animates. |
| `cssValueStart` | number | `40` | Scrubbed property value at the start of the scroll range. |
| `cssValueEnd` | number | `100` | Scrubbed property value at the end of the scroll range. |
| `cssValueUnit` | string | `'vw'` | Unit appended to the scrubbed value (e.g. `'%'`, `'px'`, `'vw'`). |
| `mouseParallax` | bool | `false` | Enable pointer-driven parallax on `.parallax-mouse-object` children. |
| `enableOnMobile` | bool | `true` | Allow background parallax on mobile user-agents. |

Per-element overrides go in a single-quoted `data-plugin-options` attribute with double-quoted JSON keys — `themestrap.fn.getOptions()` normalizes it and merges it over the defaults:

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"speed":2,"parallaxDirection":"bottom"}'>
```

---

## Instance API

Every Themestrap plugin runs the same fluent lifecycle on construction:
`initialize → setData → setOptions → build`

```js
// Initialize (or return the existing instance)
const inst = $('#myEl').themestrapPluginParallax({ speed: 2 });

// Retrieve a previously initialized instance
const same = $('#myEl').data('__parallax');

// Destroy — removes the background layer, unbinds scroll/resize/mousemove,
// restores wrapper CSS, and clears the data key
inst.destroy();
```

The jQuery bridge is idempotent: calling `themestrapPluginParallax()` a second time returns the cached instance from `data('__parallax')` rather than building a new one.

### Events

| Event | Fires when |
|---|---|
| `scroll.parallax` | The plugin recalculates the layer position on each window scroll tick (background + scrollable modes). |

---

## Modes In Depth

### Mode 1 — Background image parallax (default)

The plugin creates a `.parallax-background` div, sets it as an oversized absolute layer, prepends it inside the wrapper, and binds `scroll.parallax resize.parallax` on `window`.

On each tick:

```
yPos   = -(scrollTop - (elTop - 100)) / (speed + 2)
plxPos = Math.abs(yPos) when negative, else -Math.abs(yPos)
y      = (plxPos - 50) + offset          // direction: top
y      = -(plxPos - 50 + offset)         // direction: bottom (offset auto-set to 250)
transform: translate3d(0, {y}px, 0)
```

**RTL support:** when `<html dir="rtl">` is present, `rotateY(180deg)` is appended to the transform.

### Mode 2 — Scroll-scrubbed CSS property

Requires a `.scrollable-parallax-wrapper` child inside the host element. The plugin reads `cssProperty`, `cssValueStart`, `cssValueEnd`, and `cssValueUnit` to build a `window.scroll` handler that linearly interpolates the named property as the element passes through the viewport.

The `startOffset` divisor controls sensitivity — smaller values = faster traversal of the value range.

Skipped entirely when `window.width() <= scrollableParallaxMinWidth`.

### Mode 3 — Mouse parallax

No background layer is created. Instead, every child with class `.parallax-mouse-object` is translated based on mouse position, scaled by the element's `data-value` attribute:

```js
x = (clientX * data_value) / 250
y = (clientY * data_value) / 250
transform: translateX({x}px) translateY({y}px)
```

Negative `data-value` inverts the axis, creating a sense of depth when mixing positive and negative layers.

---

## Recipe Cookbook

### Basic background parallax

```html
<section data-plugin-parallax data-image-src="img/bg.jpg">
  <div class="container py-5">Content</div>
</section>
```

### Slow, tall parallax

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"speed":3,"parallaxHeight":"250%"}'>
```

### Downward-scrolling direction

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"parallaxDirection":"bottom"}'>
```

### Scale zoom on scroll

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"parallaxScale":true}'>
```

### Scale zoom — inverted (zooms out)

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"parallaxScale":true,"parallaxScaleInvert":true}'>
```

### Scroll-scrubbed width (bar grows on scroll)

```html
<div data-plugin-parallax
     data-plugin-options='{
       "scrollableParallax":true,
       "cssProperty":"width",
       "cssValueStart":20,
       "cssValueEnd":100,
       "cssValueUnit":"%"
     }'>
  <div class="scrollable-parallax-wrapper"></div>
</div>
```

### Scroll-scrubbed opacity

```html
<div data-plugin-parallax
     data-plugin-options='{
       "scrollableParallax":true,
       "cssProperty":"opacity",
       "cssValueStart":0,
       "cssValueEnd":1,
       "cssValueUnit":"",
       "startOffset":5
     }'>
  <div class="scrollable-parallax-wrapper">Fades in as you scroll</div>
</div>
```

### Multi-layer mouse parallax

```html
<div data-plugin-parallax data-plugin-options='{"mouseParallax":true}'>
  <!-- positive data-value = moves with cursor, negative = moves against -->
  <img class="parallax-mouse-object" src="layer-back.png"  data-value="2">
  <img class="parallax-mouse-object" src="layer-mid.png"   data-value="-4">
  <img class="parallax-mouse-object" src="layer-front.png" data-value="7">
</div>
```

### Mobile disabled

```html
<section data-plugin-parallax
         data-image-src="img/bg.jpg"
         data-plugin-options='{"enableOnMobile":false}'>
```

### Manual init and destroy

```js
// Initialize manually (skips auto-init because of .manual class)
$('#hero.manual').themestrapPluginParallax({ speed: 2, parallaxHeight: '220%' });

// Get instance later
const inst = $('#hero').data('__parallax');

// Destroy completely
inst.destroy();

// Re-initialize with new options
$('#hero').themestrapPluginParallax({ speed: 1, parallaxDirection: 'bottom' });
```

---

## init.js Wiring

Add this block to `themestrap.init.js` alongside the other plugin wiring:

```js
// Parallax
if ($.isFunction($.fn['themestrapPluginParallax']) && $('[data-plugin-parallax]').length) {
    themestrap.fn.intObsInit('[data-plugin-parallax]:not(.manual)', 'themestrapPluginParallax');
}
```

`intObsInit` is the correct strategy here because the plugin reads only `data-plugin-options` for its configuration — no `forceInit` / `accY` merging is needed, so `dynIntObsInit` is not required.

---

## Common Pitfalls

### Image goes in `data-image-src`, not CSS

> [!CAUTION]
> The parallax background is built from `data-image-src` on the host element. A CSS `background-image` is invisible to the plugin — it will produce an empty layer.

```html
<!-- ✅ Correct -->
<section data-plugin-parallax data-image-src="img/bg.jpg">

<!-- ❌ Wrong — plugin sees no image -->
<section data-plugin-parallax style="background-image: url(img/bg.jpg)">
```

### `parallaxHeight` must exceed 100%

> [!WARNING]
> If `parallaxHeight` is not taller than the container there is no vertical slack for the image to travel through. The effect looks frozen. Keep it above `100%` — the default `180%` works well for most sections.

### Two modes, one option bag — pick one per element

> [!NOTE]
> `scrollableParallax` and `mouseParallax` are checked first in `build()`. If either is `true`, the function returns early before the background-layer branch runs. Mixing all three on one element will silently activate only mouse mode (checked first).

### Scrollable mode needs a `.scrollable-parallax-wrapper` child

> [!NOTE]
> The scrollable path looks for a `.scrollable-parallax-wrapper` descendant to apply the scrubbed styles to. If the child is absent, `$sw.length` is falsy and no handler is bound.

### Mouse `data-value` is unitless

> [!TIP]
> Each `.parallax-mouse-object` reads a numeric `data-value` attribute. Omitting it defaults to `NaN` → `0` (no movement). Negative values invert the travel direction, which creates convincing depth layering.

### Destroy before re-init with new options

> [!TIP]
> `themestrapPluginParallax()` is idempotent; calling it again on an already-initialized element returns the cached instance unchanged. To apply new options, call `inst.destroy()` first, then re-initialize.

```js
const inst = $('#el').data('__parallax');
inst.destroy();
$('#el').themestrapPluginParallax({ speed: 3 });
```
