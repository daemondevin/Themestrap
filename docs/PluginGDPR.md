# GDPR Guide

Themestrap's cookie consent bar — shows a configurable cookie bar after a delay, supports per-category preference management via a popup, and saves choices to a cookie via jQuery Cookie.

## [How It **Works**](#how-it-works)

PluginGDPR checks for a `themestrap-gdpr-preferences` cookie on init. If absent, it shows `#gdpr-cookie-bar` after `cookieBarShowDelay` ms. Users can agree to all (writes a cookie for all categories) or open the preferences popup to accept/reject individual categories. On preference change the plugin calls `$.fn.themestrapPluginGDPRWrapper()` on any wrappers on the page.

---

## [Quick **Start**](#quick-start)

```html
<div id="gdpr-cookie-bar" data-plugin-gdpr>
  <p>We use cookies to improve your experience.</p>
  <button class="gdpr-agree-trigger">Accept All</button>
  <button class="gdpr-preferences-trigger">Manage Preferences</button>
</div>

<div class="gdpr-preferences-popup">
  <div class="gdpr-preferences-popup-content">
    <form class="gdpr-preferences-form">
      <label>
        <input type="checkbox" class="gdpr-input" value="analytics"> Analytics
      </label>
      <button type="submit" class="btn btn-primary">Save Preferences</button>
    </form>
    <button class="gdpr-close-popup">×</button>
  </div>
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cookieBarShowDelay` | number | `3000` | Delay in ms before showing the cookie bar. |
| `expires` | number | `365` | Cookie expiry in days. |

---

## [Common **Pitfalls**](#pitfalls)

**Requires jQuery Cookie.** The plugin calls `$.cookie()` to read and write the preferences. Include `jquery.cookie.js` before `themestrap.plugin.gdpr.js`.

**Cookie name is fixed.** Preferences are always stored as `themestrap-gdpr-preferences`. If you need a different key, modify the plugin source.

---
