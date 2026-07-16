# GDPRWrapper Guide

Themestrap's GDPR-conditional content loader — conditionally loads AJAX content into a wrapper based on whether a specific consent cookie category has been accepted.

## [How It **Works**](#how-it-works)

PluginGDPRWrapper checks `$.cookie('themestrap-gdpr-preferences')` for the presence of the `checkCookie` value. If the consent is given, it fetches `ajaxURL` and injects the response into the wrapper element. If not, the wrapper is shown with its default placeholder content.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-gdpr-wrapper
     data-plugin-options='{
       "ajaxURL": "/embed/analytics-widget",
       "checkCookie": "analytics"
     }'>
  <p>Accept analytics cookies to see this widget.</p>
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ajaxURL` | string | — | URL to fetch content from when consent is given. |
| `checkCookie` | string | — | Cookie category value to check (e.g. `'marketing'`, `'analytics'`). |

---
