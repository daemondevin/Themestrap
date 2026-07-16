# BeforeAfter Guide

Themestrap's image comparison slider — wraps the TwentyTwenty jQuery plugin with Themestrap's init pattern, adding IntersectionObserver-based lazy init and a `forceInit` override.

## [How It **Works**](#how-it-works)

PluginBeforeAfter delegates all dragging, touch, and layout logic to [TwentyTwenty](https://zurb.com/playground/twentytwenty). The plugin's only job is to initialise TwentyTwenty with the options from `data-plugin-options` when the element enters the viewport, and to handle the `forceInit` edge case for elements that are already visible on load.

---

## [Quick **Start**](#quick-start)

Include the required vendor files:

```html
<link rel="stylesheet" href="vendor/twentytwenty.css">
<script src="vendor/jquery.event.move.js"></script>
<script src="vendor/jquery.twentytwenty.js"></script>
```

Then add the markup:

```html
<div class="twentytwenty-container"
     data-plugin-before-after
     data-plugin-options='{"default_offset_pct": 0.5, "orientation": "horizontal"}'>
  <img src="before.jpg" alt="Before">
  <img src="after.jpg" alt="After">
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `forceInit` | bool | `true` | Initialize immediately without waiting for viewport entry. |
| `default_offset_pct` | number | `0.5` | Initial slider position (0–1). |
| `orientation` | string | `'horizontal'` | `'horizontal'` or `'vertical'`. |
| `before_label` | string | `'Before'` | Label shown on the before image. |
| `after_label` | string | `'After'` | Label shown on the after image. |
| `no_overlay` | bool | `false` | Hide the label overlay. |
| `move_slider_on_hover` | bool | `false` | Move the slider on mouse hover. |
| `move_with_handle_only` | bool | `true` | Restrict dragging to the handle. |
| `click_to_move` | bool | `false` | Jump the slider to click position. |

---
