# CursorEffect Guide

Themestrap's custom cursor visual effect plugin — applies a custom cursor visual to an element or the document.

## [How It **Works**](#how-it-works)

PluginCursorEffect creates a custom cursor follower element and tracks `mousemove` events on the target element (or `document`). The visual implementation is driven entirely by `data-plugin-options`. No defaults are defined in the plugin source — all configuration is per-instance.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-cursor-effect
     data-plugin-options='{"type": "follow", "color": "#e8672a", "size": 20}'>
  Hover over this area
</div>
```

---

## [Common **Pitfalls**](#pitfalls)

**No built-in defaults.** All configuration must be passed explicitly via `data-plugin-options` or the options argument. The plugin has no fallback appearance.

**Touch devices.** The cursor follower only activates on pointer devices. On touch-only screens the plugin is inert.

---
