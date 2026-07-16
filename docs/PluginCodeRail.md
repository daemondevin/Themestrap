# CodeRail Guide

Themestrap's two-column API reference layout — prose on the left, a sticky code panel on the right that cross-fades between examples in sync with the section currently scrolled into view.

## [How It **Works**](#how-it-works)

PluginCodeRail manages two coordinated columns. As the user scrolls through prose sections on the left, the plugin finds the section currently in the viewport (using IntersectionObserver), cross-fades the matching code panel into the sticky right column, and keeps it pinned at a configurable top offset.

On narrow viewports (below `breakpoint`), the two-column layout collapses and each code panel is relocated inline beneath its prose section.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-code-rail
     data-plugin-options='{"top": 96, "breakpoint": 1024}'>

  <div class="code-rail__prose">
    <section data-code-rail-section="auth">
      <h2>Authentication</h2>
      <p>Pass your API key in the Authorization header.</p>
    </section>
    <section data-code-rail-section="endpoints">
      <h2>Endpoints</h2>
      <p>All endpoints are relative to the base URL.</p>
    </section>
  </div>

  <div class="code-rail__code">
    <div data-code-rail-pane="auth">
      <pre data-plugin-highlight="bash"><code>curl -H "Authorization: Bearer TOKEN" …</code></pre>
    </div>
    <div data-code-rail-pane="endpoints">
      <pre data-plugin-highlight="bash"><code>GET /api/v1/resources</code></pre>
    </div>
  </div>

</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `top` | number | `96` | Sticky top offset in px (height of your fixed header). |
| `breakpoint` | number | `1024` | Viewport width below which rail becomes single-column inline. |
| `rootMargin` | string | `''` | IntersectionObserver root margin override. |
| `fade` | bool | `true` | Cross-fade code panels on scroll-sync change. |

---
