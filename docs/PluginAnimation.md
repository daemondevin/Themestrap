# Animation (Animate) Guide

Themestrap's viewport-triggered CSS animation plugin — adds Animate.css entrance classes when elements enter the viewport, using IntersectionObserver.

## [How It **Works**](#how-it-works)

PluginAnimate watches an element with an IntersectionObserver. When the element crosses the configured threshold, the plugin adds the `animated` class and the configured animation class name, then removes them after the animation completes. A `delay` and `duration` can be set per-element via data attributes or plugin options.

---

## [Quick **Start**](#quick-start)

```html
<div data-appear-animation="fadeInUp"
     data-appear-animation-delay="200"
     data-appear-animation-duration="800ms">
  Animates in when scrolled into view
</div>
```

### Init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginAnimate'])
    && $('[data-appear-animation]').length) {
  themestrap.fn.intObsInit(
    '[data-appear-animation]:not(.manual)',
    'themestrapPluginAnimate'
  );
}
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accX` | number | `0` | IntersectionObserver horizontal offset. |
| `accY` | number | `-80` | IntersectionObserver vertical offset (negative = trigger earlier). |
| `delay` | number | `100` | Default animation delay in ms. |
| `duration` | string | `'750ms'` | Default animation duration. |
| `minWindowWidth` | number | `0` | Minimum viewport width to run the animation. |
| `forceAnimation` | bool | `false` | Run animation even when element is above the viewport. |
| `flagClassOnly` | bool | `false` | Only add the animation class; skip `animated` class (for CSS-only animations). |
| `firstLoadNoAnim` | bool | `false` | Skip animation on the first page load. |

### Per-element data attributes

| Attribute | Description |
|-----------|-------------|
| `data-appear-animation` | The animation class name (e.g. `'fadeInUp'`). |
| `data-appear-animation-delay` | Override delay in ms for this element. |
| `data-appear-animation-duration` | Override duration (any CSS time string). |

---

## [Common **Pitfalls**](#pitfalls)

**Requires Animate.css.** The plugin adds class names — it doesn't bundle the actual keyframes. Include Animate.css or an equivalent keyframe library for the animations to run.

**`flagClassOnly` skips the `animated` base class.** Use this for custom CSS animations that don't need Animate.css's `animated` class on the element.
