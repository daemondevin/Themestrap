# Counter Plugin

**File:** `js/components/themestrap.plugin.counter.js`  
**jQuery method:** `$.fn.themestrapPluginCounter`  
**Instance key:** `__pluginCounter`  
**Data attribute:** `data-plugin-counter`

---

## Overview

Animates a number from a start value to a target value over a configurable duration. No external dependencies — the counter runs entirely on `requestAnimationFrame` with an ease-in-out-quad easing curve. Affix strings (prepend/append) are applied after the animation completes.

---

## Quick Start

```html
<span data-plugin-counter data-to="1250" data-plugin-options='{"speed":2500}'>0</span>
```

Auto-init in `themestrap.init.js`:

```js
if ($.isFunction($.fn['themestrapPluginCounter']) && ($('[data-plugin-counter]').length || $('.counters [data-to]').length)) {
    themestrap.fn.dynIntObsInit('[data-plugin-counter]:not(.manual), .counters [data-to]', 'themestrapPluginCounter', themestrap.PluginCounter.defaults);
}
```

Manual init via jQuery:

```js
$('#my-counter').themestrapPluginCounter({
    to:    5000,
    speed: 3000
});
```

---

## Data Attributes

| Attribute | Type | Description |
|---|---|---|
| `data-plugin-counter` | — | Marks the element for auto-init |
| `data-to` | number | Target value (required unless passed in options) |
| `data-from` | number | Starting value (default: `0`) |
| `data-speed` | number | Duration in ms (default: `3000`) |
| `data-prepend` | string | Text inserted before the number on complete |
| `data-append` | string | Text inserted after the number on complete |
| `data-plugin-options` | JSON | Any option key from the table below |

`data-to`, `data-from`, and `data-speed` take precedence over their `data-plugin-options` equivalents when both are present.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `from` | number | `0` | Start value |
| `to` | number | `null` | End value — required |
| `speed` | number | `3000` | Animation duration in milliseconds |
| `refreshInterval` | number | `100` | Minimum ms between DOM text updates (floored at 16) |
| `decimals` | number | `0` | Decimal places in the formatted output |
| `comma` | boolean | `false` | Replace `.` decimal point with `,` |
| `thousandsSeparator` | string | `''` | Character inserted every 3 integer digits, e.g. `','` or `'.'` |
| `appendWrapper` | string/false | `false` | Selector or HTML tag wrapping the append string |
| `prependWrapper` | string/false | `false` | Selector or HTML tag wrapping the prepend string |
| `formatter` | function/null | `null` | `(value, opts) => string` — overrides all built-in formatting |
| `onUpdate` | function/null | `null` | Called each refresh tick with the current `value` |
| `onComplete` | function/null | `null` | Called once when the animation ends with the final `value` |

---

## Methods

| Method | Signature | Description |
|---|---|---|
| `replay` | `replay(to?)` | Re-run animation from the current displayed value. Pass a new `to` to change the target. |
| `setValue` | `setValue(value)` | Jump instantly to a value with no animation. Cancels any running animation. |
| `stop` | `stop()` | Freeze the animation at its current position. |
| `destroy` | `destroy()` | Stop animation and remove the instance data from the element. |

Retrieve the instance:

```js
const inst = $('#my-counter').data('__pluginCounter');
inst.replay();
```

---

## Examples

### Thousands separator

```html
<span
  data-plugin-counter
  data-to="1234567"
  data-plugin-options='{"thousandsSeparator":",","speed":3000}'>0</span>
```

### Comma decimal (European style)

```html
<span
  data-plugin-counter
  data-to="3.14159"
  data-plugin-options='{"decimals":5,"comma":true}'>0</span>
```

### Prepend / append affixes

```html
<!-- Currency prefix -->
<span data-plugin-counter data-to="4999" data-prepend="$"
      data-plugin-options='{"thousandsSeparator":","}'>$0</span>

<!-- Percentage suffix -->
<span data-plugin-counter data-to="87" data-append="%">0%</span>
```

The element's initial text mirrors the pre-animation state so users with JS disabled see a reasonable fallback.

### Affix wrappers

Wrap the affix in a styled `<sup>` or `<span>`:

```js
$('#counter').themestrapPluginCounter({
    to:            99,
    append:        '%',          // not a data attribute — set via options is not supported;
                                 // use data-append on the element
    appendWrapper: '<sup class="text-sm">'
});
```

> [!Note]
> `appendWrapper`/`prependWrapper` only apply to affixes set via `data-append`/`data-prepend` on the element. They are applied after the animation completes.

### Custom formatter

```js
$('#counter').themestrapPluginCounter({
    to: 1073741824,
    speed: 3500,
    formatter(value) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let u = 0;
        while (value >= 1024 && u < units.length - 1) { value /= 1024; u++; }
        return value.toFixed(2) + '\u202f' + units[u];
    }
});
```

### Callbacks

```js
$('#counter').themestrapPluginCounter({
    to:    100,
    speed: 3000,
    onUpdate(v)  { console.log('tick:', v.toFixed(0)); },
    onComplete(v){ console.log('done:', v); }
});
```

Both callbacks receive the raw numeric `value` as their first argument. `this` inside the callback is the DOM element.

### Programmatic replay

```js
const inst = $('#counter').data('__pluginCounter');

inst.replay();        // replay from current display value to original data-to
inst.replay(500);     // count to a new target from current position
inst.stop();          // freeze mid-animation
inst.setValue(0);     // reset display instantly
inst.replay();        // animate from 0 to original target
```

---

## init.js Wiring

```js
// themestrap.init.js
if ($.isFunction($.fn['themestrapPluginCounter']) && ($('[data-plugin-counter]').length || $('.counters [data-to]').length)) {
    themestrap.fn.dynIntObsInit('[data-plugin-counter]:not(.manual), .counters [data-to]', 'themestrapPluginCounter', themestrap.PluginCounter.defaults);
}
```
---

## Easing

The animation uses **ease-in-out quad**:

```
t < 0.5  ->  2t²
t ≥ 0.5  ->  -1 + (4 - 2t)t
```

There is no option to change the easing curve. Pass a custom `formatter` or drive the animation externally via `setValue()` on a `requestAnimationFrame` loop if a different curve is needed.

---

## Accessibility

- The counter element updates its text content on every tick. Screen readers in live-region mode will announce each change, which is noisy. Wrap the counter in a `role="status"` `aria-live="polite"` container and put only the static label inside `aria-live` — not the animating number — or add `aria-hidden="true"` to the counter element and provide a visually-hidden final value via `onComplete`.
- Counters respect `prefers-reduced-motion` if you add a guard in the `speed` option: pass `speed: 0` (instant) when the media query matches, then call `setValue(to)` directly.

---

## Diagnostics

**Counter stays at 0 / never animates**  
- Confirm `data-to` is present and its value parses as a finite number (`isNaN` check).  
 Confirm the element is in the viewport when `intObsInit` fires — counters off-screen at load will animate when they scroll into view.

**Affix not appearing**  
- `data-append` / `data-prepend` are applied only in `onComplete`, after the animation ends. If you call `stop()` mid-animation, affixes will not be added.  
 If the element's initial HTML already contains the affix (e.g. `>0%</span>`), the affix will be doubled after completion. Either initialise clean (`>0</span>`) or omit `data-append`.

**`onComplete` / `onUpdate` not firing**  
- These must be passed via jQuery init or `data-plugin-options` — they cannot be serialised as JSON if they contain function bodies. Use jQuery init.

**Thousands separator not showing**  
- `thousandsSeparator` must be passed as a string in `data-plugin-options`, e.g. `'{"thousandsSeparator":","}'`. An empty string `""` disables it (default).

**`formatter` option ignored**  
- `formatter` cannot be set via `data-plugin-options` (functions are not valid JSON). Use jQuery init.
