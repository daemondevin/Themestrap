# HoverEffect Guide

Themestrap's magnetic and 3D-tilt hover effects — applies a magnetic cursor-follow or a three-dimensional tilt to elements on mouse hover.

## [How It **Works**](#how-it-works)

PluginHoverEffect supports two modes:

- **magnetic** — on `mousemove` the element translates slightly toward the cursor by `magneticMx`/`magneticMy` multipliers and rotates up to `magneticDeg` degrees. On `mouseleave` it springs back to origin.
- **3d** — delegates to the [hover3d](https://github.com/ariona/hover3d) jQuery plugin for a CSS `perspective` + `rotateX/Y` tilt effect.

The mode is auto-detected from the `effect` option or from the `.hover-effect-3d` class on the element.

---

## [Quick **Start**](#quick-start)

```html
<!-- Magnetic -->
<div data-plugin-hover-effect
     data-plugin-options='{"effect": "magnetic", "magneticMx": 0.15}'>
  Hover me
</div>

<!-- 3D tilt (also triggered by the class) -->
<div class="hover-effect-3d" data-plugin-hover-effect>
  <img src="card.jpg" alt="">
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `effect` | string | `'magnetic'` | `'magnetic'` or `'3d'`. |
| `magneticMx` | number | `0.15` | X-axis movement multiplier (0–1). |
| `magneticMy` | number | `0.3` | Y-axis movement multiplier (0–1). |
| `magneticDeg` | number | `12` | Maximum rotation in degrees. |
| `selector` | string | `'.thumb-info, .hover-effect-3d-wrapper'` | Target selector for the 3D effect. |
| `sensitivity` | number | `20` | 3D tilt sensitivity. |

---
