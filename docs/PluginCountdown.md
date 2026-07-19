# PluginCountdown Guide

**File:** `js/components/themestrap.plugin.countdown.js`  
**jQuery method:** `$.fn.themestrapPluginCountdown`  
**Instance key:** `__countdown`  
**Init strategy:** `intObsInit` via `themestrap.init.js`  
**Dependency:** [jQuery Countdown](https://hilios.github.io/jQuery.countdown/) (`$.fn.countdown`)

---

## Overview

PluginCountdown wraps the jQuery Countdown plugin with Themestrap's standard options lifecycle. It renders a live days / hours / minutes / seconds display that updates once per second, with configurable unit labels, an optional number class for styling the digit spans, and optional wrapper classes on each unit block.

---

## Markup

### Basic

```html
<div data-plugin-countdown
     data-plugin-options='{"date": "2026/12/31 23:59:59"}'></div>
```

### With custom labels

```html
<div data-plugin-countdown
     data-plugin-options='{
       "date"       : "2026/12/31 23:59:59",
       "textDay"    : "Days",
       "textHour"   : "Hours",
       "textMin"    : "Minutes",
       "textSec"    : "Seconds",
       "wrapperClass": "countdown-box",
       "numberClass" : "countdown-number"
     }'></div>
```

### With injected surrounding HTML

```html
<div data-plugin-countdown
     data-plugin-options='{
       "date"            : "2027/01/01 00:00:00",
       "insertHTMLbefore": "<div class=\"d-flex gap-3\">",
       "insertHTMLafter" : "</div>"
     }'></div>
```

---

## Output HTML

The plugin generates the following structure on each tick:

```html
<!-- Example with wrapperClass="countdown-box" and numberClass="countdown-number" -->
<span class="days countdown-box">
  <span class="countdown-number">03</span> DAYS
</span>
<span class="hours countdown-box">
  <span class="countdown-number">14</span> HRS
</span>
<span class="minutes countdown-box">
  <span class="countdown-number">22</span> MIN
</span>
<span class="seconds countdown-box">
  <span class="countdown-number">07</span> SEC
</span>
```

`insertHTMLbefore` is prepended before `.days`; `insertHTMLafter` is appended after `.seconds`.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `date` | `string` | `'2030/06/10 12:00:00'` | Target date-time in `YYYY/MM/DD HH:MM:SS` format, interpreted by the Countdown plugin. |
| `textDay` | `string` | `'DAYS'` | Label appended after the days number. |
| `textHour` | `string` | `'HRS'` | Label appended after the hours number. |
| `textMin` | `string` | `'MIN'` | Label appended after the minutes number. |
| `textSec` | `string` | `'SEC'` | Label appended after the seconds number. |
| `uppercase` | `boolean` | `true` | Reserved for future case-transformation use; currently both branches render identically. |
| `numberClass` | `string` | `''` | Extra class(es) added to the inner `<span>` holding the digit value. |
| `wrapperClass` | `string` | `''` | Extra class(es) added to each unit `<span>` (`days`, `hours`, `minutes`, `seconds`). |
| `insertHTMLbefore` | `string` | `''` | Raw HTML injected before the first unit span on every tick. |
| `insertHTMLafter` | `string` | `''` | Raw HTML injected after the last unit span on every tick. |

---

## Styling Tips

Target the generated spans by their fixed class names:

```css
/* Unit boxes */
.countdown-box {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  background: #0a1929;
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
}

/* Digit */
.countdown-number {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}
```

Or use `wrapperClass` and `numberClass` to inject any Bootstrap or Themestrap utility classes directly.

---

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginCountdown']) && $('[data-plugin-countdown]').length) {
    themestrap.fn.intObsInit('[data-plugin-countdown]:not(.manual)', 'themestrapPluginCountdown');
}
```

> **Note:** `$.fn.countdown` must be included before `themestrap.plugin.countdown.js`. The plugin silently exits when the dependency is missing.