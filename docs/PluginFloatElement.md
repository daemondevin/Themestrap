# FloatElement Guide

Themestrap's scroll-driven floating animation — creates a bobbing or parallax-style float effect driven by the scroll position.

## [How It **Works**](#how-it-works)

PluginFloatElement listens to the `scroll` event and applies a `translateY` (or `translateX`) CSS transform to the element proportional to its scroll offset. The speed multiplier controls how far the element drifts relative to the scroll distance.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-float-element
     data-plugin-options='{"speed": 3, "horizontal": false, "minWindowWidth": 991}'>
  <img src="/decoration.svg" alt="">
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startPos` | string | `'top'` | Starting position: `'top'` or `'bottom'`. |
| `speed` | number | `3` | Multiplier for the transform distance. |
| `horizontal` | bool | `false` | Float horizontally instead of vertically. |
| `isInsideSVG` | bool | `false` | Element is inside an SVG (uses different transform syntax). |
| `transition` | bool | `false` | Apply a CSS transition to the transform. |
| `transitionDelay` | number | `0` | Delay before transition in ms. |
| `transitionDuration` | number | `500` | CSS transition duration in ms. |
| `minWindowWidth` | number | `991` | Minimum viewport width to activate. |

---
