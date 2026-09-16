# PluginGDPR

Combines the former `PluginGDPR` and `PluginGDPRWrapper` into a single, dependency-free file. The plugin manages two complementary concerns: a **consent bar** that collects cookie preferences from the visitor, and a **conditional content wrapper** that reveals or AJAX-loads content only when the required consent category has been granted.

Cookie read/write/delete is handled internally using the native `document.cookie` API — no `jquery.cookie` or any other third-party library is required.

---

## How It Works

**PluginGDPR** (`[data-plugin-gdpr]`) attaches to a fixed bar element at the bottom of the viewport. If the `themestrap-privacy-bar` cookie is absent the bar slides up after `cookieBarShowDelay` milliseconds. The bar delegates to a separate `.gdpr-preferences-popup` overlay (matched by class name, not DOM relationship) where the visitor picks which cookie categories to accept. Submitting that form writes two cookies — `themestrap-privacy-bar` and `themestrap-gdpr-preferences` — then dispatches a `ts.gdpr.consent` `CustomEvent` on `window`.

**PluginGDPRWrapper** (`[data-plugin-gdpr-wrapper]`) reads the saved preferences cookie on initialisation and either fades in the element's existing DOM content or, when `ajaxURL` is set and the required category has been consented to, replaces the element's content with a fetched HTML partial. Without consent the element still becomes visible so that any placeholder markup inside it is shown to the visitor.

Both classes share a single injected stylesheet — ref-counted so the `<style>` tag is added once and removed only when every instance has been destroyed.

---

## Quick Start

```html
<!-- 1. The consent bar -->
<div data-plugin-gdpr data-plugin-options='{"cookieBarShowDelay": 3000}'>
  <p>&#x1F36A; We use cookies.</p>
  <div class="d-flex gap-2">
    <button class="gdpr-agree-trigger btn btn-sm btn-primary">Accept All</button>
    <button class="gdpr-preferences-trigger btn btn-sm btn-outline-light">Preferences</button>
  </div>
</div>

<!-- 2. The preferences popup (one per page, near end of body) -->
<div class="gdpr-preferences-popup">
  <div class="gdpr-preferences-popup-content">
    <h5>Cookie Preferences</h5>
    <form class="gdpr-preferences-form">
      <input type="hidden" class="gdpr-input" value="necessary" />
      <div class="form-check">
        <input class="form-check-input gdpr-input" type="checkbox" value="analytics" />
        <label class="form-check-label">Analytics</label>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Save Preferences</button>
    </form>
    <button class="gdpr-close-popup btn btn-link btn-sm">Close</button>
  </div>
</div>

<!-- 3. A consent-gated block -->
<div data-plugin-gdpr-wrapper data-plugin-options='{"checkCookie": "analytics"}'>
  <p>Accept analytics cookies to see this content.</p>
</div>

<!-- Scripts — jQuery is the only runtime dependency -->
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/components/themestrap.plugin.gdpr.js"></script>
```

---

## Markup Reference

### Consent Bar — `[data-plugin-gdpr]`

| Class / Element | Role |
|---|---|
| `[data-plugin-gdpr]` | Bar root; receives `.show` / `.removing` for transitions |
| `.gdpr-agree-trigger` | Checks all inputs then submits the form; works anywhere on the page |
| `.gdpr-preferences-trigger` | Opens the preferences popup |
| `.gdpr-open-preferences` | Toggles the popup from anywhere (e.g. a footer "Manage Cookies" link) |
| `.gdpr-reset-cookies` | Removes both GDPR cookies and reloads the page |

### Preferences Popup

| Class / Element | Role |
|---|---|
| `.gdpr-preferences-popup` | Fixed overlay; receives `.show` to become visible |
| `.gdpr-preferences-popup-content` | Centred content panel; clicking outside this closes the popup |
| `.gdpr-preferences-form` | The `<form>` the plugin listens to for `submit` |
| `.gdpr-input[type="hidden"]` | Always-included category (e.g. `value="necessary"`) |
| `.gdpr-input[type="checkbox"]` | Optional category; included in saved preferences when checked |
| `.gdpr-close-popup` | Closes the popup without saving |

### Conditional Wrapper — `[data-plugin-gdpr-wrapper]`

| Attribute / Option | Role |
|---|---|
| `data-plugin-gdpr-wrapper` | Marks the wrapper element for initialisation |
| `checkCookie` | Consent category required before revealing content |
| `ajaxURL` | When set and consent is granted, `innerHTML` is replaced with the AJAX response |

---

## Configuration Options

### PluginGDPR

| Option | Type | Default | Description |
|---|---|---|---|
| `cookieBarShowDelay` | `number` | `3000` | Milliseconds before the bar slides in on first visit |
| `expires` | `number` | `365` | Cookie expiry in days for both GDPR cookies |

### PluginGDPRWrapper

| Option | Type | Default | Description |
|---|---|---|---|
| `checkCookie` | `string` | `''` | Consent category to check (e.g. `"analytics"`). Empty string means always reveal. |
| `ajaxURL` | `string` | `''` | URL to fetch and inject when consent is present. Leave empty to control visibility only. |
| `loadDelay` | `number` | `1000` | Milliseconds after the AJAX response before fading the content in |

---

## Public API

```js
// PluginGDPR
const gdpr = $('[data-plugin-gdpr]').data('__gdpr');

gdpr.removeCookieBar();
// Plays the slide-out transition without writing a cookie.

gdpr.clearCookies();
// Removes themestrap-privacy-bar and themestrap-gdpr-preferences.
// Does not reload the page — call location.reload() yourself if needed.

gdpr.destroy();
// Removes all .gdpr-namespaced listeners from $(document), hides the bar,
// and releases the injected stylesheet when no other instance holds a reference.
// Designed for single-bar pages.
```

```js
// PluginGDPRWrapper
const wrapper = $('[data-plugin-gdpr-wrapper]').data('__gdprwrapper');

wrapper.destroy();
// Empties the wrapper's innerHTML, removes .show, and clears the instance data.
```

---

## Events

### `ts.gdpr.consent` (window, CustomEvent)

Fired on `window` when the visitor saves their preferences. Access the selected categories via `event.detail.categories`.

```js
window.addEventListener('ts.gdpr.consent', function(e) {
  console.log(e.detail.categories); // ['necessary', 'analytics']
});
```

This event fires before any page reload, so handlers run regardless of whether `hadPrefs` triggered a reload.

---

## CSS Custom Properties

| Property | Default | Controls |
|---|---|---|
| `--ts-gdpr-bar-py` | `.875rem` | Bar vertical padding |
| `--ts-gdpr-bar-px` | `1.5rem` | Bar horizontal padding |
| `--ts-gdpr-bar-bg` | `#0a1929` | Bar background |
| `--ts-gdpr-bar-color` | `#c8d8e8` | Bar text colour |
| `--ts-gdpr-bar-accent` | `#2ab8c8` | Bar top border colour |
| `--ts-gdpr-popup-bg` | `#fff` | Popup content panel background |
| `--ts-gdpr-popup-color` | `#1a2332` | Popup content panel text colour |
| `--ts-gdpr-popup-radius` | `.75rem` | Popup content panel border-radius |
| `--ts-gdpr-popup-py` | `2rem` | Popup content panel vertical padding |
| `--ts-gdpr-popup-px` | `2rem` | Popup content panel horizontal padding |
| `--ts-gdpr-popup-max-w` | `520px` | Popup content panel max-width |
| `--ts-gdpr-wrapper-fade` | `400ms` | Wrapper fade-in transition duration |

---

## Auto-Init Wiring (themestrap.init.js)

Both classes use DOMReady-immediate initialisation (no IntersectionObserver) because they must run before the user scrolls or interacts.

```js
// GDPR Bar
if (typeof $.fn['themestrapPluginGDPR'] === 'function' && $('[data-plugin-gdpr]').length) {
  $(() => {
    $('[data-plugin-gdpr]:not(.manual)').each(function() {
      const $this = $(this);
      const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
      $this.themestrapPluginGDPR(opts);
    });
  });
}

// GDPR Wrapper
if (typeof $.fn['themestrapPluginGDPRWrapper'] === 'function' && $('[data-plugin-gdpr-wrapper]').length) {
  $(() => {
    $('[data-plugin-gdpr-wrapper]:not(.manual)').each(function() {
      const $this = $(this);
      const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
      $this.themestrapPluginGDPRWrapper(opts);
    });
  });
}
```

Both `init.js` blocks remain identical — only the source file has changed from two files to one.

---

## Recipes

**Always-on category (no checkbox)**

Use a hidden input for categories that should always be recorded without a user toggle:

```html
<input type="hidden" class="gdpr-input" value="necessary" />
```

**Consent-gated iframe (AJAX variant)**

Leave the wrapper empty and point `ajaxURL` at an HTML partial containing the iframe. The iframe only enters the DOM — and therefore makes no network requests — after consent is granted:

```html
<div data-plugin-gdpr-wrapper
     data-plugin-options='{"checkCookie":"marketing","ajaxURL":"/partials/youtube.html"}'></div>
```

**Footer "Manage Cookies" link**

Any element with `.gdpr-open-preferences` toggles the popup regardless of whether the bar is still visible:

```html
<a href="#" class="gdpr-open-preferences">Manage Cookies</a>
```

**Reacting to consent in your own scripts**

```js
window.addEventListener('ts.gdpr.consent', function(e) {
  if (e.detail.categories.includes('analytics')) {
    initAnalytics();
  }
});
```

---

## Common Pitfalls

**Bar never appears**

Check that `themestrap-privacy-bar` is not already set. Open DevTools → Application → Cookies, clear both `themestrap-*` entries, then reload.

**Popup close-on-backdrop-click not working**

The `.gdpr-preferences-popup` element must not have a CSS `transform` applied to it or any ancestor. A transformed ancestor breaks `position: fixed` stacking. Place the popup as a direct child of `<body>`.

**Wrapper shows placeholder even after accepting**

`checkCookie` must exactly match one of the values submitted by the form. The comparison is `prefsRaw.split(',').includes(checkCookie)` — an exact string match, not a substring search. `"analytic"` will not match a saved value of `"analytics"`.

**Changing preferences reloads the page**

Intentional. When preferences were previously set (`hadPrefs` is true), a reload guarantees that consent-gated scripts or content from the previous session are properly removed or re-evaluated. On first save (no prior prefs) the wrappers reinitialise in-place without a reload.

**Multiple bars on the same page**

`destroy()` calls `$(document).off('.gdpr')`, removing all document-level listeners for the namespace. Two simultaneous `PluginGDPR` instances will interfere — the plugin is designed for one bar per page.

**`removeCookieBar()` callback fires unexpectedly**

jQuery's `.one()` is used internally for `transitionend`, so the cleanup callback fires exactly once regardless of how many CSS properties transition simultaneously.