# PluginOtp

A digit-segmented one-time password and PIN input. Each character occupies its own styled box, advancing focus automatically as the user types and retreating on backspace. Supports numeric and alphanumeric modes, paste-to-fill, a mid-group separator, size variants, a light theme, and distinct error and valid states — including a shake animation triggered by `setError()`.

CSS is injected lazily on first use via a `<style id="ts-otp-styles">` guard — no separate stylesheet import is required.

---

## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.otp.js"></script>
```

### Minimal markup

```html
<div id="my-otp"></div>
```

```js
$('#my-otp').themestrapPluginOtp({ length: 6 });
```

### With data attributes

```html
<div data-plugin-otp
     data-plugin-options='{"length":6,"type":"numeric","autoSubmit":true}'></div>
```

### Auto-init wiring (`themestrap.init.js`)

```js
if ($.isFunction($.fn['themestrapPluginOtp']) && $('[data-plugin-otp]').length) {
    $(() => {
        $('[data-plugin-otp]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginOtp(opts);
        });
    });
}
```

---

## Options

All options are merged as: `PluginOtp.defaults → JS opts argument → data-plugin-options JSON`. Later values win.

| Key | Type | Default | Description |
|---|---|---|---|
| `length` | number | `6` | Number of individual input boxes rendered. |
| `type` | string | `"numeric"` | `"numeric"` — digits only, uses `type="tel"` and `inputmode="numeric"` for mobile. `"alphanumeric"` — accepts letters and digits. |
| `uppercase` | bool | `false` | Forces alphanumeric input to uppercase as the user types. |
| `autoSubmit` | bool | `false` | When `true`, dispatches `ts.otp.submit` immediately when all boxes are filled. |
| `separator` | string | `""` | Character rendered between the left and right halves (e.g. `"-"`). Only appears when `length` is even. |
| `label` | string | `""` | Text label rendered above the input group. |
| `hint` | string | `""` | Small helper text rendered below the input group. |
| `ariaLabel` | string | `"One-time code"` | `aria-label` placed on the wrapper `role="group"` element. |
| `size` | string | `""` | Box size modifier. `""` (default) · `"sm"` · `"lg"`. |
| `theme` | string | `""` | `""` (dark) · `"light"`. Light swaps the CSS variable set for use on bright backgrounds. |

---

## Public API

### Accessing the instance

```js
// Initialize, then retrieve separately — do NOT chain .data() off the bridge return value
$('#my-otp').themestrapPluginOtp({ length: 6 });
const otp = $('#my-otp').data('__pluginOtp');
```

### Methods

| Method | Returns | Description |
|---|---|---|
| `getValue()` | `string` | Current value as a concatenated string, e.g. `"483920"`. Empty boxes contribute `""`. |
| `setValue(code)` | `this` | Fill boxes from `code`, sanitize to the configured `type`, advance focus to the last filled box, and fire change/complete events. Paste-like behaviour. |
| `clear()` | `this` | Empty all boxes, move focus to the first box, clear error/valid state, and dispatch `ts.otp.clear`. |
| `focus()` | `this` | Focus the first empty box; falls back to the first box if all are filled. |
| `setError(message, shake?)` | `this` | Apply error state (red borders, message text). Triggers the shake animation unless `shake` is explicitly `false`. Focuses the first box. |
| `setValid()` | `this` | Apply valid state (teal borders). Clears any error message. |
| `disable(state)` | `this` | Pass `true` to disable all inputs; `false` to re-enable. |
| `destroy()` | `this` | Remove all generated DOM, event handlers, classes, and the data key. The wrapper element is left empty. |

---

## Events

All events are dispatched as native `CustomEvent` on the wrapper element with `bubbles: true`. jQuery `.on()` and native `addEventListener` both work.

| Event | `detail` payload | When |
|---|---|---|
| `ts.otp.change` | `{ value: string, complete: bool }` | Fires on every keypress, backspace, or programmatic change. `complete` is `true` when `value.length === length`. |
| `ts.otp.complete` | `{ value: string }` | Fires once when all boxes are filled (including via `setValue`). |
| `ts.otp.submit` | `{ value: string }` | Fires when `autoSubmit: true` and the input is complete. Use this as the trigger to verify the code. |
| `ts.otp.clear` | — | Fires when `clear()` is called. |

```js
const $el = $('#my-otp');

$el.on('ts.otp.change', function (e) {
    console.log('current value:', e.detail.value);
});

$el.on('ts.otp.complete', function (e) {
    console.log('complete:', e.detail.value);
});

$el.on('ts.otp.submit', function (e) {
    verifyCode(e.detail.value).then((ok) => {
        const otp = $el.data('__pluginOtp');
        ok ? otp.setValid() : otp.setError('Incorrect code. Try again.');
    });
});
```

---

## CSS Custom Properties

Override tokens on the wrapper element or any ancestor.

```css
#my-otp {
    --ts-otp-focus-border: #7c3aed;
    --ts-otp-focus-ring:   rgba(124, 58, 237, .2);
    --ts-otp-size:         60px;
}
```

| Token | Controls | Default |
|---|---|---|
| `--ts-otp-gap` | Gap between boxes (and separator) | `8px` |
| `--ts-otp-size` | Box width **and** height | `52px` / `56px` |
| `--ts-otp-font-size` | Digit font size | `22px` |
| `--ts-otp-radius` | Box border radius | `10px` |
| `--ts-otp-bg` | Box background (inactive) | `rgba(255,255,255,.06)` |
| `--ts-otp-bg-focus` | Box background (focused) | `rgba(42,184,200,.06)` |
| `--ts-otp-border` | Box border colour (inactive) | `rgba(255,255,255,.15)` |
| `--ts-otp-color` | Digit text colour | `#f3f4f6` |
| `--ts-otp-focus-border` | Focused box border | `#2ab8c8` |
| `--ts-otp-focus-ring` | Focused box box-shadow | `rgba(42,184,200,.2)` |
| `--ts-otp-error-color` | Error border and message text | `#e8672a` |
| `--ts-otp-valid-color` | Valid state border | `#2ab8c8` |
| `--ts-otp-sep-color` | Separator character colour | `rgba(255,255,255,.3)` |
| `--ts-otp-label-color` | Label text colour | `rgba(255,255,255,.7)` |
| `--ts-otp-hint-color` | Hint text colour | `rgba(255,255,255,.38)` |

---

## Keyboard Navigation

| Key | Action |
|---|---|
| Any valid digit / letter | Fills the current box and advances focus to the next. |
| `Backspace` | Clears the current box if filled; moves focus to the previous box and clears it if the current box is already empty. |
| `Delete` | Clears the current box without moving focus. |
| `←` | Move focus to the previous box. |
| `→` | Move focus to the next box. |
| `Home` | Move focus to the first box. |
| `End` | Move focus to the last box. |

---

## ARIA Wiring

| Element | Attribute | Value |
|---|---|---|
| Wrapper `<div>` | `role` | `"group"` |
| Wrapper `<div>` | `aria-label` | Value of `ariaLabel` option. |
| Each `<input>` | `aria-label` | `"Digit N of M"` |
| Each `<input>` | `autocomplete` | `"one-time-code"` on the first box; `"off"` on the rest. |
| Each `<input>` | `inputmode` | `"numeric"` for numeric type; `"text"` for alphanumeric. |
| Error `<p>` | `aria-live` | `"polite"` — error message is announced to screen readers. |
| Error `<p>` | `role` | `"alert"` |

---

## Recipes

### Verify on complete

```js
$('#my-otp').themestrapPluginOtp({ length: 6, autoSubmit: false });

$('#my-otp').on('ts.otp.complete', function (e) {
    const otp = $('#my-otp').data('__pluginOtp');
    otp.disable(true);

    fetch('/api/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: e.detail.value }),
    })
    .then((r) => r.json())
    .then((data) => {
        if (data.ok) {
            otp.setValid();
        } else {
            otp.disable(false).setError('That code was incorrect. Try again.');
        }
    });
});
```

### 4-digit PIN with separator and auto-submit

```html
<div id="pin"></div>
```

```js
$('#pin').themestrapPluginOtp({ length: 4, separator: '–', autoSubmit: true });

$('#pin').on('ts.otp.submit', function (e) {
    if (e.detail.value !== '1234') {
        $('#pin').data('__pluginOtp').setError('Wrong PIN');
    }
});
```

### Alphanumeric backup code (large, uppercase)

```js
$('#backup-code').themestrapPluginOtp({
    length:    8,
    type:      'alphanumeric',
    uppercase: true,
    size:      'lg',
    separator: '-',
    label:     'Recovery code',
    hint:      'Find this in your account security settings.',
});
```

### Light theme on a white form card

```js
$('#card-otp').themestrapPluginOtp({
    length: 6,
    theme:  'light',
    size:   'sm',
});
```

### Programmatic fill from a magic-link URL parameter

```js
const params = new URLSearchParams(window.location.search);
const code   = params.get('code') || '';

$('#my-otp').themestrapPluginOtp({ length: 6, autoSubmit: true });

if (code) {
    $('#my-otp').data('__pluginOtp').setValue(code);
}
```

---

## Common Pitfalls

**`getValue()` returns a string shorter than `length`**
Boxes that have not been filled contribute an empty string. `getValue()` is simply the concatenation of all box values — it does not pad. Check `value.length === options.length` or listen to `ts.otp.complete` instead of `ts.otp.change`.

**Paste fills only one box**
The `paste` handler is attached to each individual `<input>`. It fires on the input that holds focus at the time of pasting. If the wrapper `<div>` receives a paste event instead (e.g. the user has tabbed out of all inputs), nothing happens. Keep focus inside the component before pasting, or call `otp.focus()` first.

**`setError()` shake does not replay on repeated errors**
The shake animation is a CSS `@keyframes`. To replay it the class must be removed, a reflow forced, then re-added. The plugin handles this via `void el.offsetWidth` between `removeClass` and `addClass`. If you find the shake not replaying, verify nothing outside is re-adding `.ts-otp--shake` before the plugin removes it.

**`autoSubmit: true` fires on `setValue()` — unintended verification**
`setValue()` calls `_checkComplete()`, which fires `ts.otp.submit` if `autoSubmit` is `true`. If you use `setValue()` to pre-populate a field for display (not verification), set `autoSubmit: false` and listen to `ts.otp.complete` instead, handling submission manually.

**`type: "numeric"` still accepts letters on some Android keyboards**
The `maxlength="1"` and `pattern` attributes filter input on most browsers, but some Android soft keyboards bypass these constraints. The `input` event handler strips non-numeric characters after the fact — the field will appear to accept a letter momentarily before clearing it. This is expected behaviour for soft-keyboard environments.

**Separator appears in wrong position**
The separator is rendered after the box at index `Math.floor(length / 2) - 1` — i.e. between the two equal halves. It only appears when `length` is even. A `length: 5` with `separator: "-"` will render no separator.

**Diagnostic checklist**

- Does `$('#my-otp').data('__pluginOtp')` return an instance (not `undefined`)? If not, check that the init call ran after DOMReady and that the script is loaded correctly.
- Is `type: "numeric"` set but the user is entering letters? Verify `inputmode="numeric"` is present on the rendered `<input>` elements in DevTools.
- `ts.otp.complete` not firing? Check that `getValue().length` equals your configured `length`. Empty boxes prevent the event.
- Error state not clearing on new input? The `_clearState()` call runs on every `input` event. Verify no external code is re-adding `.ts-otp--error` after the user starts typing.
