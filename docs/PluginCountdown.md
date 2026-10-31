# PluginCountdown

A live countdown to a date, in days, hours, minutes and seconds. Digits roll like an odometer using pure CSS, and four layouts cover the common cases: labels under the numbers, labels beside them, a compact clock, and boxed tiles. No vendor library is needed.

**File:** `js/components/themestrap.plugin.countdown.js`  
**Demo:** `demos/plugin.demo.countdown.html`  
**jQuery method:** `$.fn.themestrapPluginCountdown`  
**Data attribute:** `data-plugin-countdown`  
**Instance key:** `__pluginCountdown`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

> Earlier versions wrapped the jQuery Countdown library and used options such as `textDay`, `numberClass` and `insertHTMLbefore`. Those are gone. See "Migrating from the old plugin" at the end.



## How It Works

On `build()` the plugin:

1. Injects its stylesheet once (`<style id="themestrap-countdown-styles">`).
2. Reads the target date from `data-plugin-countdown-date`, falling back to the `date` option.
3. Reads the layout from `data-plugin-countdown-layout`, falling back to `layout`.
4. Saves the element's HTML (for `destroy()`), empties it and renders one number per enabled unit.
5. Ticks once, then every second.

Each number is a `<span>` with a `--value` custom property. The stylesheet stacks `00` to `99` in the span's `::before` and `::after` and slides them with `top: calc(var(--value) * -1em)`, so changing `--value` rolls the digits. The tens and ones roll separately, and a hundreds digit appears when the value needs it.

When the countdown reaches zero the interval stops and `ts.countdown.finished` fires.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.countdown.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31T23:59:59"></div>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-countdown]:not(.manual), .countdown', 'themestrapPluginCountdown');
```

### Manual init

```js
$('#launch').themestrapPluginCountdown({
    date:     '2026-12-31T23:59:59Z',
    layout:   'boxes',
    fontSize: 'fs-1'
});
```



## Markup Reference

| Attribute | Role |
| - | - |
| `data-plugin-countdown` | Marks the element. |
| `data-plugin-countdown-date` | Target date. Any string `new Date()` understands; ISO 8601 is safest. Wins over the `date` option. |
| `data-plugin-countdown-layout` | `labels-under`, `labels-side`, `clock` or `boxes`. Wins over the `layout` option. |
| `data-plugin-options` | JSON options. |

### Layouts

```html
<!-- 12 days  04 hours  33 min  07 sec, each label under its number (the default) -->
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31"></div>

<!-- 12 days 04 hours 33 min 07 sec, on one line -->
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31" data-plugin-countdown-layout="labels-side"></div>

<!-- 12:4:33:7, a compact clock -->
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31" data-plugin-countdown-layout="clock"
     data-plugin-options='{"showDays": false}'></div>

<!-- tiles with a background -->
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31" data-plugin-countdown-layout="boxes"></div>
```

### Generated markup (`labels-under`)

```html
<div data-plugin-countdown>
    <div style="display: flex; gap: 1rem; text-align: center;">
        <div style="display: flex; flex-direction: column; align-items: center;">
            <span class="ts-countdown font-mono text-5xl">
                <span aria-live="polite" aria-label="12" style="--value: 12; --digits: 2;">12</span>
            </span>
            <span class="ts-countdown-label">days</span>
        </div>
        ...
    </div>
</div>
```

`boxes` wraps each unit in `<div class="ts-countdown-box">` with the box options applied inline. `clock` and `labels-side` put all numbers in a single `.ts-countdown` span with the separator or labels as text between them.



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `date` | `string\|Date` | `null` | Target date. Without one (and no attribute), the numbers stay at 0 and nothing ticks. |
| `layout` | `string` | `'labels-under'` | `labels-under`, `labels-side`, `clock` or `boxes`. |
| `fontSize` | `string` | `'text-5xl'` | Class added to each `.ts-countdown`. The default is not a Bootstrap class; use `fs-1`, `display-4` or your own (see Pitfalls). Ignored by `clock`. |
| `gap` | `string` | `'1rem'` | Space between units in `labels-under` and `boxes`. |
| `separator` | `string` | `':'` | Text between numbers in `clock`. |
| `minDigits` | `number` | `2` | Minimum digits shown: `1`, `2` or `3`. `2` turns 7 into 07. Only `labels-under` and `boxes` honor it. |
| `showDays` | `boolean` | `true` | Show the days unit. |
| `showHours` | `boolean` | `true` | Show the hours unit. |
| `showMinutes` | `boolean` | `true` | Show the minutes unit. |
| `showSeconds` | `boolean` | `true` | Show the seconds unit. |
| `labelDays` | `string` | `'days'` | Label for days. |
| `labelHours` | `string` | `'hours'` | Label for hours. |
| `labelMinutes` | `string` | `'min'` | Label for minutes. |
| `labelSeconds` | `string` | `'sec'` | Label for seconds. |
| `boxBg` | `string` | `'var(--ts-navy, #0a1929)'` | `boxes`: tile background. |
| `boxColor` | `string` | `'#fff'` | `boxes`: tile text color. |
| `boxPadding` | `string` | `'0.5rem 1rem'` | `boxes`: tile padding. |
| `boxRadius` | `string` | `'0.5rem'` | `boxes`: tile corner radius. |

Hiding a larger unit does not fold its time into the next one. With `showDays: false`, a countdown 3 days away shows only the hours left in the current day, never more than 23 (see Pitfalls).



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only.

```js
const cd = $('#launch').data('__pluginCountdown');
```

| Method | Returns | Description |
| - | - | - |
| `setDate(date)` | `this` | Sets a new target and restarts the ticking. |
| `pause()` | `this` | Stops ticking. The numbers freeze; the target does not move. |
| `resume()` | `this` | Ticks again (catching up to the real time). Does nothing without a target. |
| `destroy()` | `this` | Stops ticking, restores the element's original HTML and removes the instance. |

`pause()` freezes the display, not the clock: on `resume()` the numbers jump to the true remaining time.



## Events

| Event | When | Arguments |
| - | - | - |
| `ts.countdown.finished` | The countdown reaches zero while ticking | `(event)` |

It is a jQuery event fired with `.trigger()`. jQuery reads the dots as namespaces (type `ts`, namespaces `countdown` and `finished`), so bind it with the full name and jQuery `.on()`:

```js
$('#launch').on('ts.countdown.finished', function () {
    $(this).replaceWith('<p class="lead">We are live!</p>');
});
```



## CSS Custom Properties

Set by the plugin on each number span:

| Property | Description |
| - | - |
| `--value` | The current value. Changing it rolls the digits. |
| `--digits` | Minimum digits (from `minDigits`), in `labels-under` and `boxes`. |

Classes to style:

| Class | Element |
| - | - |
| `.ts-countdown` | Wrapper around number spans. Sets `font-family: monospace`. |
| `.ts-countdown-label` | The unit label (`labels-under`, `boxes`). |
| `.ts-countdown-box` | A tile in `boxes`. |

```css
.ts-countdown       { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
.ts-countdown-label { font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; opacity: .7; }
.ts-countdown-box   { min-width: 5rem; }
```

The roll speed is set by `transition: top 1s cubic-bezier(1, 0, 0, 1)` on the pseudo-elements:

```css
.ts-countdown > span::before,
.ts-countdown > span::after { transition-duration: .4s; }
```

### Reduced motion

There is no reduced-motion rule. Add one if the roll should stop:

```css
@media (prefers-reduced-motion: reduce) {
    .ts-countdown > span::before,
    .ts-countdown > span::after { transition: none; }
}
```

### Dark mode

Colors are inherited from the page, so `labels-under`, `labels-side` and `clock` follow your theme. `boxes` uses `boxBg` and `boxColor`, which you pass per instance.



## Keyboard Navigation

A countdown is not interactive and takes no focus.



## ARIA Wiring

```
[span.ts-countdown]
    [span aria-live="polite" aria-label="{value}"]   one per unit, updated every second
```

Every number is a polite live region that changes each second, so screen readers can announce constantly. For most pages, silence them and give a readable summary instead:

```js
$('#launch').on('ts.countdown.finished', function () { $('#launch-summary').text('The sale has started.'); });
$('#launch').find('[aria-live]').removeAttr('aria-live');
```

```html
<p id="launch-summary" class="visually-hidden">The sale starts on 31 December 2026 at 23:59.</p>
<div id="launch" data-plugin-countdown data-plugin-countdown-date="2026-12-31T23:59:59" aria-hidden="true"></div>
```



## Recipes

### A countdown to the next hour

```js
const next = new Date();
next.setHours(next.getHours() + 1, 0, 0, 0);
$('#next-hour').themestrapPluginCountdown({ date: next, showDays: false, layout: 'clock' });
```

### Restart every day at midnight

```js
$('#daily').on('ts.countdown.finished', function () {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    $(this).data('__pluginCountdown').setDate(midnight);
});
```

### Tiles in the brand color

```html
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31" data-plugin-countdown-layout="boxes"
     data-plugin-options='{"fontSize": "fs-2", "boxBg": "#20e2d7", "boxColor": "#0a1929", "gap": ".75rem"}'></div>
```



## Common Pitfalls

### The digits are huge, tiny or unstyled

`fontSize` defaults to `text-5xl`, a Tailwind-style class that Bootstrap does not have, so without your own rule the numbers use the inherited size. Pass a class you have: `fs-1`, `display-5`, or one of your own. The `font-mono` class it also adds is not Bootstrap either; the monospace font comes from `.ts-countdown`.

### Digits overlap or show the whole 00–99 column

The roll uses CSS `round()` inside `calc()`. Browsers without it (before Chrome 125, Firefox 118, Safari 15.4) cannot compute the offsets. Target current browsers, or hide the pseudo-elements and show the plain text the plugin also writes into each span:

```css
@supports not (width: calc(round(to-zero, 1px, 1px))) {
    .ts-countdown > span { visibility: visible; width: auto; }
    .ts-countdown > span::before,
    .ts-countdown > span::after { content: none; }
}
```

### `ts.countdown.finished` never fires

It only fires when the countdown reaches zero while it is ticking. A date that has already passed when the page loads shows zeros and fires nothing. Check the date yourself on load if you need that case. Also bind it with jQuery `.on()`; `addEventListener` does not see it.

### Options from JavaScript are ignored

The bridge merges `data-plugin-options` over the object you pass, so the attribute wins. The `data-plugin-countdown-date` and `-layout` attributes win too.

### The clock shows 7 instead of 07

`minDigits` only applies to `labels-under` and `boxes`.

### Hiding days makes the hours wrong

Units are computed as a whole (days, then the rest), and a hidden unit's time is dropped, not carried into the next. For a long countdown with `showDays: false`, hours never go above 23. Keep the largest unit visible.

### Dates are off by hours

`new Date('2026-12-31')` is midnight UTC, while `new Date('2026-12-31T00:00:00')` is midnight local time. Write the time zone explicitly (`Z` or `+02:00`) for events with a fixed moment.

### `.countdown` elements initialize unexpectedly

`themestrap.init.js` also matches the legacy `.countdown` class, without the `:not(.manual)` guard. Rename unrelated `.countdown` elements, or remove that selector from `init.js`.

### Diagnostic checklist

- [ ] A date is set, in ISO 8601 with a time zone.
- [ ] `fontSize` names a class that exists.
- [ ] The target browsers support CSS `round()`, or the fallback CSS is in place.
- [ ] `ts.countdown.finished` is bound with jQuery `.on()`.
- [ ] Live-region chatter is handled for screen readers.
- [ ] The instance is read with `$(selector).data('__pluginCountdown')`.



## Migrating from the old plugin

| Old | New |
| - | - |
| jQuery Countdown vendor file | Not needed, and `themestrap.modules.js` no longer loads it. |
| `date: '2026/12/31 23:59:59'` | `date: '2026-12-31T23:59:59'`, or `data-plugin-countdown-date` |
| `textDay`, `textHour`, `textMin`, `textSec` | `labelDays`, `labelHours`, `labelMinutes`, `labelSeconds` |
| `numberClass` | `fontSize` (one class on `.ts-countdown`), or CSS on `.ts-countdown` |
| `wrapperClass` | CSS on `.ts-countdown-box` with `layout: 'boxes'` |
| `insertHTMLbefore`, `insertHTMLafter` | Put the markup around the element instead |
| `uppercase` | `text-transform` on `.ts-countdown-label` |
| Instance key `__countdown` | `__pluginCountdown` |
