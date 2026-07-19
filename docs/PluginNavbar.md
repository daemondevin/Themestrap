# PluginNavbar Guide

**File:** `js/components/themestrap.plugin.navbar.js`  
**jQuery method:** `$.fn.themestrapPluginNavbar`  
**Instance key:** `__navbar`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

---

## Over**view**

PluginNavbar is a secondary navigation bar that sits below a primary nav. It provides: a logo/title area, flat links, dropdown menus (single and multi-column section layouts), an optional call-to-action button area, sticky behavior with an `IntersectionObserver`-driven "stuck" elevation state, current-page auto-detection, external-link decoration, mobile collapse with animated toggle, and full keyboard navigation.

All styles are self-contained and injected once into a `<style id="ts-navbar-styles">` tag on script load.

---

## Mark**up**

### Minimal

```html
<nav class="ts-navbar" data-plugin-navbar
     data-plugin-options='{"palette": "light", "sticky": true}'
     aria-label="Section navigation">

  <div class="ts-navbar__container">

    <a class="ts-navbar__logo" href="/">
      <img src="/logo.svg" alt="Logo"> My Project
    </a>

    <!-- Mobile toggle -->
    <button class="ts-navbar__toggle" aria-label="Toggle navigation">
      <span class="ts-navbar__toggle-icon">
        <span class="ts-navbar__toggle-bar"></span>
        <span class="ts-navbar__toggle-bar"></span>
        <span class="ts-navbar__toggle-bar"></span>
      </span>
    </button>

    <!-- Collapsible region -->
    <div class="ts-navbar__collapse">
      <ul class="ts-navbar__nav">
        <li class="ts-navbar__item">
          <a class="ts-navbar__link" href="/docs/">Documentation</a>
        </li>
        <li class="ts-navbar__item">
          <a class="ts-navbar__link" href="/guides/">Guides</a>
        </li>
      </ul>
    </div>

  </div>
</nav>
```

### With a dropdown menu

```html
<li class="ts-navbar__item ts-navbar__item--dropdown">
  <button class="ts-navbar__dropdown-toggle">
    Components
    <span class="ts-navbar__caret" aria-hidden="true"></span>
  </button>
  <div class="ts-navbar__menu">
    <ul class="ts-navbar__menu-list">
      <li><a class="ts-navbar__menu-link" href="/components/alert/">Alert</a></li>
      <li><a class="ts-navbar__menu-link" href="/components/dialog/">Dialog</a></li>
      <li><a class="ts-navbar__menu-link" href="/components/toast/">Toast</a></li>
    </ul>
  </div>
</li>
```

### Multi-column section menu

```html
<div class="ts-navbar__menu ts-navbar__menu--sections">
  <div class="ts-navbar__menu-section">
    <p class="ts-navbar__menu-heading">UI Plugins</p>
    <ul class="ts-navbar__menu-list">
      <li><a class="ts-navbar__menu-link" href="/alert/">Alert</a></li>
      <li><a class="ts-navbar__menu-link" href="/dialog/">Dialog</a></li>
    </ul>
  </div>
  <div class="ts-navbar__menu-section">
    <p class="ts-navbar__menu-heading">Layout</p>
    <ul class="ts-navbar__menu-list">
      <li><a class="ts-navbar__menu-link" href="/masonry/">Masonry</a></li>
    </ul>
    <a class="ts-navbar__menu-cta" href="/all/">Browse all →</a>
  </div>
</div>
```

### With a CTA button area

```html
<div class="ts-navbar__cta">
  <a class="ts-navbar__btn ts-navbar__btn--ghost" href="/login/">Sign in</a>
  <a class="ts-navbar__btn ts-navbar__btn--primary" href="/signup/">Get started</a>
</div>
```

---

## BEM Class **Reference**

| Class | Element |
|---|---|
| `.ts-navbar` | Root `<nav>` |
| `.ts-navbar__container` | Inner flex container (max-width wrapper) |
| `.ts-navbar__logo` | Logo link |
| `.ts-navbar__toggle` | Mobile hamburger button |
| `.ts-navbar__collapse` | Collapsible link region |
| `.ts-navbar__nav` | Top-level `<ul>` |
| `.ts-navbar__item` | `<li>` for a single link |
| `.ts-navbar__item--dropdown` | `<li>` with a dropdown menu |
| `.ts-navbar__link` | Flat `<a>` link |
| `.ts-navbar__dropdown-toggle` | Dropdown trigger `<button>` |
| `.ts-navbar__caret` | Dropdown arrow icon (CSS mask) |
| `.ts-navbar__menu` | Dropdown panel |
| `.ts-navbar__menu--sections` | Multi-column variant |
| `.ts-navbar__menu-section` | One column in the multi-column menu |
| `.ts-navbar__menu-heading` | Column heading |
| `.ts-navbar__menu-list` | Dropdown item `<ul>` |
| `.ts-navbar__menu-link` | Dropdown item `<a>` |
| `.ts-navbar__menu-cta` | "View all" link at the bottom of a section |
| `.ts-navbar__cta` | CTA button area |
| `.ts-navbar__btn` | CTA button |
| `.ts-navbar__btn--primary` | Filled CTA button |
| `.ts-navbar__btn--ghost` | Outlined CTA button |

---

## Configuration **Options**

| Option | Type | Default | Description |
|---|---|---|---|
| `palette` | `string` | `'light'` | Color palette: `'light'` or `'dark'`. Sets `data-ts-navbar-palette` on the root. |
| `sticky` | `boolean` | `true` | Pin to the top of the viewport on scroll. |
| `stickyOffset` | `number` | `0` | Pixel offset from the top when detecting the "stuck" state. |
| `highlightCurrent` | `boolean` | `true` | Auto-detect and flag the current page link. |
| `markExternal` | `boolean` | `true` | Add `target="_blank"`, `rel="noopener noreferrer"`, and `.ts-navbar__link--external` to off-origin links. |
| `closeOnOutsideClick` | `boolean` | `true` | Close open dropdowns when clicking outside the navbar. |
| `keyboardNav` | `boolean` | `true` | Arrow, Home, End, Enter, and Space key navigation across top-level items and dropdowns. |
| `oneOpen` | `boolean` | `true` | Enforce one open dropdown at a time. |

---

## Programmatic **API**

### Retrieve the instance

```js
const nav = $('[data-plugin-navbar]').data('__navbar');
```

### `openDropdown($li)` / `closeDropdowns()`

```js
nav.openDropdown($('.ts-navbar__item--dropdown').first());
nav.closeDropdowns();
```

### `openMenu()` / `closeMenu()` / `toggleMenu()`

Control the mobile collapse region programmatically.

### `setCurrent(selector)`

Override the auto-detected current link:

```js
nav.setCurrent('[href="/docs/"]');
```

### `getCurrent()`

Returns a jQuery object of `.ts-navbar__link--current` elements.

### `destroy()`

Removes all event listeners, the sticky sentinel, the `IntersectionObserver`, and all plugin classes.

---

## Events

| Event | Fires on | When |
|---|---|---|
| `open.tsnavbar` | Navbar root | A dropdown opens |
| `close.tsnavbar` | Navbar root | All dropdowns close |
| `menuopen.tsnavbar` | Navbar root | Mobile menu opens |
| `menuclose.tsnavbar` | Navbar root | Mobile menu closes |

---

## State **Classes**

| Class | Applied to | When |
|---|---|---|
| `.ts-navbar--sticky` | Root | `sticky: true` |
| `.ts-navbar--stuck` | Root | Pinned and scrolled past the sentinel |
| `.ts-navbar--menu-open` | Root | Mobile menu is expanded |
| `.is-open` | `.ts-navbar__item--dropdown` | Dropdown is open |
| `.ts-navbar__link--current` | Link | Matches current page pathname |
| `.ts-navbar__link--current-parent` | Dropdown toggle | Parent of the current page link |
| `.ts-navbar__link--external` | Link | Points to an off-origin URL |

## Custom **Properties**

| Property | Default | Description |
|---|---|---|
| `--ts-navbar-height` | `56px` | Navbar height. |
| `--ts-navbar-accent` | `var(--primary)` | Current-page top border color. |
| `--ts-navbar-accent-size` | `3px` | Thickness of the current-page bar. |
| `--ts-navbar-radius` | `8px` | Border radius for menus and buttons. |
| `--ts-navbar-sticky-top` | `0px` | Offset used with `position: sticky`. |
| `--ts-navbar-z` | `1020` | Z-index. |

Override in your theme CSS or on the element:

```css
.ts-navbar {
    --ts-navbar-height: 64px;
    --ts-navbar-accent: #e8672a;
}
```

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginNavbar']) && $('[data-plugin-navbar]').length) {
    themestrap.fn.intObsInit('[data-plugin-navbar]:not(.manual)', 'themestrapPluginNavbar');
}
```