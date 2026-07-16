# Navbar Guide

Themestrap's sub-navigation bar plugin — a secondary nav strip below the primary header with logo, grouped links, optional dropdowns, a CTA button, sticky behavior, and mobile hamburger menu.

## [How It **Works**](#how-it-works)

PluginNavbar enhances a `<nav>` element already in the DOM with sticky scroll behavior, mobile breakpoint toggling (hamburger → drawer), auto-detection of the current page link, and optional light/dark palette.

The plugin does not generate markup — it expects the full nav HTML (typically rendered by a MODX chunk) and wires interaction and positioning on top.

---

## [Quick **Start**](#quick-start)

```html
<nav class="ts-navbar" data-plugin-navbar
     data-plugin-options='{"palette": "light", "sticky": true}'
     aria-label="Section navigation">

  <div class="ts-navbar__brand">
    <a href="/">
      <img src="/logo.svg" alt="Brand" height="32">
    </a>
  </div>

  <div class="ts-navbar__links">
    <a href="/overview" class="ts-navbar__link">Overview</a>
    <a href="/pricing"  class="ts-navbar__link">Pricing</a>
    <a href="/docs"     class="ts-navbar__link">Docs</a>
  </div>

  <div class="ts-navbar__cta">
    <a href="/get-started" class="btn btn-sm btn-primary">Get Started</a>
  </div>

  <button class="ts-navbar__toggle" aria-label="Menu">
    <span class="hamburger"></span>
  </button>

</nav>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `palette` | string | `'light'` | `'light'` or `'dark'`. Sets the root color scheme. |
| `sticky` | bool | `true` | Pin the navbar to the top of the viewport on scroll. |
| `stickyOffset` | number | `0` | Distance from the top (px) when stickied. |
| `highlightCurrent` | bool | `true` | Auto-detect and add `.active` to the link matching the current URL. |
| `mobileBreakpoint` | number | `991` | Viewport width below which the hamburger drawer is used. |
| `mobileDrawerAnimation` | string | `'slideDown'` | Animation for the mobile drawer: `'slideDown'` or `'fade'`. |

---

## [Common **Pitfalls**](#pitfalls)

**Sticky conflicts with a sticky primary header.** If both `PluginStickyHeader` and `PluginNavbar` are sticky, they will stack by default. Offset the Navbar's `stickyOffset` by the primary header's height, or wrap them in a single sticky block.

**`highlightCurrent` uses exact path matching.** Trailing slashes and query strings are not normalised. If the current page is `/about/` and the link is `/about`, they won't match. Normalise links or disable `highlightCurrent` and set the active class server-side.

---
