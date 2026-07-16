# ScrollFx Guide

Themestrap's scroll-triggered CSS custom-property animator — interpolates any property between two values based on viewport scroll position, with full multi-property support and reduced-motion safety.

A declarative way to animate elements based on scroll position. Write a single `data-scroll-fx` attribute and the plugin writes a `--scroll-fx-{property}` CSS custom property to the element as the user scrolls, interpolated linearly between two values across a viewport range you define. Use the variable in any CSS rule to drive parallax, fade, blur, rotation, color shifts — anything that can read a custom property.

---

## [How It **Works**](#how-it-works)

The plugin reads attribute definitions, registers each element with a single per-page scroll listener (throttled via `requestAnimationFrame`), then writes interpolated values as CSS custom properties on each tracked element every frame.

### Phase 1 — Parse attributes

The plugin reads `data-scroll-fx` (single effect) and `data-scroll-fx-1`…`data-scroll-fx-N` (multiple effects on one element). Each value is parsed as `property,start,end,startPercent,endPercent` and stored as an effect descriptor.

- Up to 9 simultaneous effects per element
- Effects evaluated independently each frame

### Phase 2 — Track & write

A single global `scroll` listener loops registered elements. For each, the plugin computes the element's position relative to the viewport, maps it to `0..1` across the start/end percent range, then writes `--scroll-fx-{property}: {interpolated}` to the element's inline style.

- One `rAF` tick per scroll event
- `prefers-reduced-motion` short-circuits the whole loop

### Viewport math

The percent range is measured against the _element's position within the viewport_, not the page:

```js
// Element's top edge as a percentage of viewport height,
// where 0% = element top at viewport top, 100% = element top at viewport bottom.
const rect = el.getBoundingClientRect();
const pct  = (rect.top / window.innerHeight) * 100;

// Map pct from [startPercent..endPercent] into [0..1]
const t = clamp((pct - startPercent) / (endPercent - startPercent), 0, 1);

// Interpolate between start and end values
const value = start + (end - start) * t;
el.style.setProperty('--scroll-fx-' + property, value);
```

> With `startPercent: 100` and `endPercent: 0`, the animation runs from _just below the viewport_ to _just above it_ — the most common range. Flip the values to run the animation in reverse.

---

## [Quick **Start**](#quick-start)

### Markup contract

Add `data-scroll-fx` to any element with the format `property,start,end,startPercent,endPercent`:

```html
<!-- Fade from 0 to 1 as the element scrolls in from below -->
<div class="js-scroll-fx" data-scroll-fx="opacity,0,1,100,40">...</div>

<!-- Multiple effects on one element -->
<div class="js-scroll-fx"
     data-scroll-fx-1="opacity,0,1,100,40"
     data-scroll-fx-2="translateY,80,0,100,40"
     data-scroll-fx-3="blur,8,0,100,40">...</div>
```

### CSS reference

The plugin only writes the variable — you decide how to apply it:

```css
.js-scroll-fx {
  /* Reference the variable in any CSS property */
  opacity:   var(--scroll-fx-opacity, 1);
  transform: translateY(calc(var(--scroll-fx-translateY, 0) * 1px))
             rotate(calc(var(--scroll-fx-rotate, 0) * 1deg));
  filter:    blur(calc(var(--scroll-fx-blur, 0) * 1px));
}
```

### Auto-init

```js
// Any element with class .js-scroll-fx is auto-initialised:
themestrap.fn.dynIntObsInit(
    '.js-scroll-fx',
    'themestrapPluginScrollFx'
);

// Or attach manually
$('.parallax-section').themestrapPluginScrollFx();
```

> **Tip:** Use `dynIntObsInit` (dynamic) over `intObsInit` for ScrollFx — it re-evaluates the selector on DOM mutations, so dynamically-injected elements get animated too.

---

## [Attribute **Reference**](#options)

Options are read primarily from `data-scroll-fx*` attributes. Each attribute value is a comma-separated 5-tuple:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `property` | string | — | Custom property name. Written as `--scroll-fx-{property}`. Common: `opacity`, `translateX`, `translateY`, `rotate`, `scale`, `blur`, `hue`. |
| `start` | number | — | Value at `startPercent`. Plain number — unit (px, deg, %) is added in your CSS via `calc(...)`. |
| `end` | number | — | Value at `endPercent`. Interpolation is linear. |
| `startPercent` | number | `100` | Viewport percentage at which to _start_ the animation. `100` = element top at viewport bottom (just entering). |
| `endPercent` | number | `0` | Viewport percentage at which to _end_ the animation. `0` = element top at viewport top (fully scrolled past). |

### Horizontal scrollable containers

By default, scroll position is read from `window`. To track horizontal scroll within a container, add `data-scrollable-element` pointing to a parent selector:

```html
<div class="horizontal-scroller" style="overflow-x: scroll;">
  <div data-scroll-fx="opacity,0,1,100,30"
       data-scrollable-element=".horizontal-scroller">...</div>
</div>
```

> **Warning:** The plugin reads from `scrollLeft`/`clientWidth` on the named scrollable element. It must be a real scroll container — `overflow-x: scroll` (or `auto`) with a fixed width.

---

## [Recipe **Cookbook**](#recipes)

#### Classic fade + rise on entry

```html
<section class="js-scroll-fx"
         data-scroll-fx-1="opacity,0,1,100,50"
         data-scroll-fx-2="translateY,60,0,100,50">
  <h2>A new way to scroll</h2>
</section>

<style>
.js-scroll-fx {
  opacity:   var(--scroll-fx-opacity, 1);
  transform: translateY(calc(var(--scroll-fx-translateY, 0) * 1px));
  transition: opacity 80ms linear, transform 80ms linear;
}
</style>
```

#### Slow-moving background parallax

```html
<div class="hero js-scroll-fx"
     data-scroll-fx="translateY,-200,200,100,0">
  <img src="/img/mountain.jpg" alt="">
</div>

<style>
.hero img {
  transform: translateY(calc(var(--scroll-fx-translateY, 0) * 1px));
  will-change: transform;
}
</style>
```

#### Unblur on entry

```html
<figure class="js-scroll-fx"
        data-scroll-fx="blur,10,0,80,40">
  <img src="/photo.jpg" alt="">
</figure>

<style>
.js-scroll-fx img {
  filter: blur(calc(var(--scroll-fx-blur, 0) * 1px));
  transition: filter 60ms linear;
}
</style>
```

#### Scroll-driven hue rotate

```html
<div class="rainbow js-scroll-fx"
     data-scroll-fx="hue,0,360,100,0">
  <h1>Colour by scroll</h1>
</div>

<style>
.rainbow {
  filter: hue-rotate(calc(var(--scroll-fx-hue, 0) * 1deg));
}
</style>
```

---

## [Common **Pitfalls**](#pitfalls)

**Frame-budget watchdog.** ScrollFx runs on every scroll event (throttled to `rAF`). Animating `filter: blur()` or `backdrop-filter` is GPU-expensive — on low-end mobile, a single blurry element can drop frame rate visibly. Prefer `opacity` and `transform`; reserve filters for hero sections.

**Plain numbers, units in CSS.** The plugin writes raw numbers — `--scroll-fx-translateY: 42.7`, not `42.7px`. You must add units in your CSS via `calc(var(--scroll-fx-translateY) * 1px)`. This is intentional: it lets the same variable drive different units in different contexts.

**Reduced motion is honored.** When `(prefers-reduced-motion: reduce)` matches, ScrollFx skips all calculations and never writes any CSS variables. Always write fallbacks: `var(--scroll-fx-opacity, 1)`.

**Element must reference the variable.** Setting `data-scroll-fx` alone does nothing visible. The plugin only writes a CSS variable — you must reference it from a real CSS property (`opacity`, `transform`, `filter`). Forgetting the CSS rule is the #1 source of "why isn't this working" issues.

**Sticky + transform = broken.** An ancestor with `position: sticky` establishes its own containing block. If you apply a `translateY` ScrollFx to that sticky element, the sticky behavior breaks. Move the transform to a child element instead.

### When the effect does not appear

- Open DevTools -> Elements -> inspect the target. Does it have a `--scroll-fx-{property}` custom property set inline?
- Is your CSS rule referencing the variable correctly with units (`calc(var(...) * 1px)`)?
- Are you on a system with `prefers-reduced-motion`? Variables will not be set.
- Did the plugin actually attach? Check `$(el).data('plugin_themestrapPluginScrollFx')`.
- Is the percentage range backwards? Start should be the value when entering, end when exiting.
