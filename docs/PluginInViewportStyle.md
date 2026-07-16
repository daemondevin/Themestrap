# InViewportStyle Guide

Themestrap's viewport-state style toggle — applies different CSS styles and classes to an element depending on whether it is inside or outside the viewport.

## [How It **Works**](#how-it-works)

PluginInViewportStyle uses the `observeElementInViewport` helper to watch an element. When the element enters the viewport, `styleIn` / `classIn` are applied; when it exits, `styleOut` / `classOut` are applied instead.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-in-viewport-style
     data-plugin-options='{
       "style": {"transition": "all 0.6s ease"},
       "styleIn":  {"opacity": "1", "transform": "translateY(0)"},
       "styleOut": {"opacity": "0", "transform": "translateY(20px)"},
       "classIn":  "in-view",
       "classOut": "out-of-view"
     }'>
  Animated content
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `viewport` | Window | `window` | Viewport element for the observer. |
| `threshold` | array | `[0]` | IntersectionObserver threshold values. |
| `modTop` | string | `'-200px'` | Top root margin modifier. |
| `modBottom` | string | `'-200px'` | Bottom root margin modifier. |
| `style` | object | `{'transition': 'all 1s ease-in-out'}` | Initial CSS styles applied on init. |
| `styleIn` | object/string | `''` | CSS styles to apply when in viewport. |
| `styleOut` | object/string | `''` | CSS styles to apply when out of viewport. |
| `classIn` | string | `''` | Class to add when in viewport (removes `classOut`). |
| `classOut` | string | `''` | Class to add when out of viewport (removes `classIn`). |
