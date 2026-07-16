# Countdown Guide

Themestrap's live countdown timer — displays days, hours, minutes, and seconds counting down to a target date.

## [How It **Works**](#how-it-works)

PluginCountdown calculates the distance to the target date on a 1-second interval and writes the values into four sub-elements inside the wrapper. The plugin generates the inner HTML structure on init if it is not already present.

---

## [Quick **Start**](#quick-start)

```html
<div data-plugin-countdown
     data-plugin-options='{"date": "2027/01/01 00:00:00"}'>
</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `date` | string | `'2030/06/10 12:00:00'` | Target date/time as a `YYYY/MM/DD HH:MM:SS` string. |
| `textDay` | string | `'DAYS'` | Label for the days unit. |
| `textHour` | string | `'HRS'` | Label for the hours unit. |
| `textMin` | string | `'MIN'` | Label for the minutes unit. |
| `textSec` | string | `'SEC'` | Label for the seconds unit. |
| `uppercase` | bool | `true` | Render labels in uppercase. |
| `numberClass` | string | `''` | Extra class added to number elements. |
| `wrapperClass` | string | `''` | Extra class added to unit wrapper elements. |
| `insertHTMLbefore` | string | `''` | HTML injected before each unit. |
| `insertHTMLafter` | string | `''` | HTML injected after each unit. |

---

## [Common **Pitfalls**](#pitfalls)

**Date format must be `YYYY/MM/DD HH:MM:SS`.** The string is passed to `new Date(string)` which has cross-browser inconsistencies with ISO 8601 format. Always use the slash-separated format shown above.

**Past dates show zeros.** When the target date has passed, all units display `00`. Add a `onComplete` callback if you need to show a message when the countdown ends.

---
