# Icon Guide

Themestrap's SVG icon inliner — fetches SVG files via AJAX, inlines them into the DOM, and optionally animates them with Vivus stroke/fill animation.

## [How It **Works**](#how-it-works)

PluginIcon replaces an `<img>` tag with an inline `<svg>` by fetching the image source via AJAX. After injection, it optionally applies a fill color via CSS class, fades the SVG in, and runs a [Vivus](https://maxwallstudio.com/vivus) stroke or fill animation. Inside carousels, it re-runs on cloned slides after the `translated.owl.carousel` event.

---

## [Quick **Start**](#quick-start)

```html
<img src="/assets/icons/star.svg"
     data-icon
     data-plugin-options='{"animated": true, "color": "#e8672a", "strokeBased": true}'
     width="64" height="64" alt="Star icon">
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `color` | string | `'#2388ED'` | SVG fill/stroke color. |
| `animated` | bool | `false` | Animate with Vivus. |
| `delay` | number | `300` | Delay before animation starts in ms. |
| `onlySVG` | bool | `false` | Skip Vivus; just inline the SVG. |
| `strokeBased` | bool | `false` | Use stroke animation instead of fill animation. |
| `removeClassAfterInit` | string/bool | `false` | Class to remove after init. |
| `fadeIn` | bool | `true` | Fade the SVG wrapper in after load. |
| `svgViewBox` | string | `''` | Override the SVG `viewBox` attribute. |
| `svgStyle` | string | `''` | Extra inline CSS string for SVG paths. |
| `extraClass` | string | `''` | Extra class on the SVG wrapper. |
| `accY` | number | `0` | IntersectionObserver Y offset. |

---

## [Common **Pitfalls**](#pitfalls)

**CORS.** The AJAX fetch uses `$.get()`. SVG files on a different origin will fail unless CORS headers are set. Host SVGs on the same origin as the page.

**Vivus must be loaded separately.** The plugin checks for `window.Vivus` before animating. If Vivus is absent, the SVG is inlined without animation.

---
