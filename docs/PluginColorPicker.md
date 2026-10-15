# PluginColorPicker

Zero-dependency jQuery color picker built on an HSV model. Renders a floating panel with a saturation/value area, hue slider, optional alpha slider, preset swatches, and EyeDropper API integration. Outputs in `hex`, `rgb`, `rgba`, `hsl`, or `hsla` format. No canvas, no vendor libraries.

---

## How It Works

The picker uses three stacked CSS layers on the SV area:

1. A solid `hsl(H, 100%, 50%)` base that shifts with the hue slider.
2. A `linear-gradient(to right, white, transparent)` saturation overlay.
3. A `linear-gradient(to top, black, transparent)` value overlay.

A draggable cursor sits on top. Internally all colour state is stored as HSV + alpha and converted to the configured output format on every change. The panel is `position: fixed` and appended to `<body>` so z-index stacking never conflicts with a containing block. Styles are lazily injected once and removed when the last instance is destroyed.

---

## Quick Start

```html
<input type="text" id="my-picker" value="#3498db">
```

```js
$('#my-picker').themestrapPluginColorPicker();
```

With options:

```js
$('#my-picker').themestrapPluginColorPicker({
    format: 'rgba',
    alpha:  true,
    swatches: ['#e74c3c', '#3498db', '#2ecc71'],
    onChange: function(val, inst) {
        console.log(val); // e.g. "rgba(52, 152, 219, 0.8)"
    }
});
```

**Retrieving the instance:**

```js
const inst = $('#my-picker').data('__pluginColorPicker');
inst.setColor('hsl(200, 70%, 50%)');
```

---

## Markup Reference

### Auto-init

Add `data-plugin-color-picker` and the init.js wiring picks it up automatically via IntersectionObserver:

```html
<input type="text" data-plugin-color-picker value="#e74c3c">
```

Per-element options via `data-plugin-options` (single-quoted attribute, double-quoted JSON keys):

```html
<input type="text"
       data-plugin-color-picker
       data-plugin-options='{"format": "hsl", "alpha": false}'
       value="#9b59b6">
```

### Opt out of auto-init

Add the `.manual` class to initialize programmatically:

```html
<input type="text" class="manual" id="my-picker">
```

```js
$('#my-picker').themestrapPluginColorPicker({ format: 'rgb' });
```

### `data-color` fallback

If the `<input>` has no `value`, the plugin reads `data-color` as the starting colour:

```html
<input type="text" data-plugin-color-picker data-color="steelblue">
```

### init.js wiring

```js
// Color Picker
if ($.isFunction($.fn['themestrapPluginColorPicker']) && $('[data-plugin-color-picker]').length) {
    themestrap.fn.intObsInit('[data-plugin-color-picker]:not(.manual)', 'themestrapPluginColorPicker');
}
```

---

## Configuration Options

All options are passed as an object to `themestrapPluginColorPicker(opts)` or as JSON in `data-plugin-options`.

| Option | Type | Default | Description |
|---|---|---|---|
| `format` | `string` | `'hex'` | Output format. One of `hex`, `rgb`, `rgba`, `hsl`, `hsla`. |
| `alpha` | `boolean` | `false` | Show the alpha slider. Enable when using `rgba` or `hsla` format. |
| `swatches` | `string[]` | `[]` | Array of CSS colour strings to render as quick-pick swatches. |
| `closeOnSelect` | `boolean` | `false` | Close the panel immediately when a swatch is clicked. |
| `showInput` | `boolean` | `true` | Show the text field and format selector inside the panel. |
| `showEyeDropper` | `boolean` | `true` | Show the EyeDropper button when `window.EyeDropper` is available. |
| `defaultColor` | `string` | `'#e74c3c'` | Fallback colour when the input value and `data-color` are both absent. |
| `position` | `string` | `'auto'` | Panel placement. `'auto'` flips to above the input when there is not enough space below. |
| `onChange` | `function\|null` | `null` | Called with `(formattedValue, instance)` on every colour change. |
| `onOpen` | `function\|null` | `null` | Called with `(instance)` when the panel opens. |
| `onClose` | `function\|null` | `null` | Called with `(instance)` when the panel closes. |

---

## Public API

Access an instance via `$el.data('__pluginColorPicker')`, or use the jQuery bridge with a method name string.

### `open()` → `this`
Opens the picker panel.

```js
inst.open();
// or:
$('#my-picker').themestrapPluginColorPicker('open');
```

### `close()` → `this`
Closes the picker panel.

### `toggle()` → `this`
Opens if closed, closes if open.

### `setColor(value)` → `this`
Accepts any parseable colour string: hex (`#fff`, `#ffffff`), `rgb()`, `rgba()`, `hsl()`, `hsla()`, or a named CSS colour (`cornflowerblue`).

```js
inst.setColor('#e74c3c');
inst.setColor('rgba(46, 204, 113, 0.5)');
inst.setColor('hsl(240, 100%, 50%)');
```

### `getColor()` → `string`
Returns the current colour in the configured `format`.

```js
const hex = inst.getColor(); // '#3498db'
```

### `destroy()` → `this`
Removes the panel from the DOM, unwraps the input, unbinds all events, removes the instance data key, and removes the injected `<style>` tag when the last instance is destroyed.

---

## Events

### Native `change` event

The plugin writes the formatted colour value to the source `<input>` and triggers a native `change` event on it after every colour change. Use this to integrate with any form or framework that observes `change`:

```js
$('#my-picker').on('change', function() {
    console.log('new value:', this.value);
});
```

### Callback options

| Callback | Signature | Fires when |
|---|---|---|
| `onChange` | `(value: string, inst: PluginColorPicker)` | Any colour change — drag, keyboard, swatch, or typed input |
| `onOpen` | `(inst: PluginColorPicker)` | Panel becomes visible |
| `onClose` | `(inst: PluginColorPicker)` | Panel is hidden |

---

## CSS Custom Properties

Override these on `:root` or any ancestor element to restyle the picker.

| Property | Default (light) | Description |
|---|---|---|
| `--ts-cp-bg` | `#ffffff` | Panel background colour |
| `--ts-cp-border` | `rgba(0,0,0,.1)` | Panel and track border colour |
| `--ts-cp-shadow` | `0 8px 30px rgba(0,0,0,.12)` | Panel drop shadow |
| `--ts-cp-radius` | `10px` | Panel border radius |
| `--ts-cp-panel-w` | `264px` | Panel width |
| `--ts-cp-picker-h` | `154px` | Height of the SV area |
| `--ts-cp-track-h` | `12px` | Height of the hue and alpha tracks |
| `--ts-cp-track-radius` | `6px` | Track border radius |
| `--ts-cp-thumb-size` | `32px` | Swatch-button width and height |
| `--ts-cp-thumb-radius` | `6px` | Swatch-button border radius |
| `--ts-cp-thumb-border` | `rgba(0,0,0,.18)` | Swatch-button border colour |
| `--ts-cp-swatch-size` | `22px` | Preset swatch button size |
| `--ts-cp-swatch-radius` | `4px` | Preset swatch button border radius |
| `--ts-cp-z` | `9999` | Panel z-index |
| `--ts-cp-focus` | `rgba(99,202,183,.7)` | Focus ring colour |
| `--ts-cp-input-bg` | `rgba(0,0,0,.04)` | Text input and select background |
| `--ts-cp-input-fg` | `#1a2530` | Text input and select foreground |
| `--ts-cp-input-border` | `rgba(0,0,0,.12)` | Text input and select border |

Dark-mode values are applied automatically via `@media (prefers-color-scheme: dark)`, `html.dark`, and `[data-bs-theme="dark"]`. Force a specific theme by setting `data-bs-theme="light"` or `data-bs-theme="dark"` on any ancestor.

**Custom panel width example:**

```css
#my-form {
    --ts-cp-panel-w: 320px;
    --ts-cp-picker-h: 200px;
}
```

---

## Keyboard Navigation

The panel is fully operable without a mouse.

| Element | Key | Action |
|---|---|---|
| Thumb button | `Enter` / `Space` | Toggle panel |
| Thumb button | `Tab` | Moves focus into the open panel |
| SV cursor | `→` / `←` | Saturation ±1% (±10% with `Shift`) |
| SV cursor | `↑` / `↓` | Brightness ±1% (±10% with `Shift`) |
| Hue track | `→` / `↑` | Hue +1° (±10° with `Shift`) |
| Hue track | `←` / `↓` | Hue −1° (±10° with `Shift`) |
| Alpha track | `→` / `↑` | Alpha +0.01 (±0.1 with `Shift`) |
| Alpha track | `←` / `↓` | Alpha −0.01 (±0.1 with `Shift`) |
| Swatches | `→` / `↓` | Focus next swatch |
| Swatches | `←` / `↑` | Focus previous swatch |
| Swatches | `Enter` / `Space` | Apply swatch colour |
| Text field | `Enter` | Parse and apply typed colour |
| Anywhere in panel | `Escape` | Close panel, return focus to thumb |

---

## ARIA Wiring

| Element | Roles / Attributes | Notes |
|---|---|---|
| Thumb `<button>` | `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` | `aria-expanded` is toggled to `"true"` / `"false"` on open / close |
| Panel `<div>` | `role="dialog"`, `aria-label="Color picker"`, `aria-modal="true"`, `tabindex="-1"` | Receives focus on open |
| SV cursor | `role="slider"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` | `aria-valuenow` updates to `"Saturation X, Brightness Y"` on drag |
| Hue track | `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="360"`, `aria-valuenow` | Updated in degrees |
| Alpha track | `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="1"`, `aria-valuenow` | Updated as a decimal |
| Swatch group | `role="group"`, `aria-label="Color presets"` | |
| Each swatch | `aria-label` set to the colour string | Roving tabindex managed on arrow navigation |

---

## Recipes

### Live CSS variable preview

```js
$('#accent-picker').themestrapPluginColorPicker({
    onChange: function(val) {
        document.documentElement.style.setProperty('--accent', val);
    }
});
```

### Sync two pickers

```js
function syncPickers(src, dest) {
    $(src).themestrapPluginColorPicker({
        onChange: function(val) {
            $(dest).data('__pluginColorPicker').setColor(val);
        }
    });
}
syncPickers('#picker-a', '#picker-b');
syncPickers('#picker-b', '#picker-a');
```

### Read-only display (no text input)

```js
$('#display-picker').themestrapPluginColorPicker({
    showInput: false,
    swatches:  ['#e74c3c', '#3498db', '#2ecc71'],
    closeOnSelect: true,
});
```

### Reinit with new options

```js
const inst = $('#my-picker').data('__pluginColorPicker');
inst.destroy();
$('#my-picker').themestrapPluginColorPicker({ format: 'hsl', alpha: true });
```

### Bootstrap form integration

```html
<div class="mb-3">
    <label class="form-label">Brand colour</label>
    <input type="hidden" name="brand_color" id="brand-picker" value="#3498db">
</div>
```

```js
$('#brand-picker').themestrapPluginColorPicker({
    onChange: function(val) {
        $('[name="brand_color"]').val(val);
    }
});
```

The plugin works on `<input type="hidden">` — the thumb button appears without a visible field.

---

## Common Pitfalls

**Panel does not appear**

- [ ] Confirm jQuery is loaded before the plugin script.
- [ ] Confirm `window.themestrap` exists before the plugin IIFE runs (include `themestrap.js` or the namespace stub).
- [ ] Check that `z-index` of the panel (`--ts-cp-z`, default `9999`) is not beneath a `position: fixed` modal backdrop.
- [ ] If the input is inside a `transform`ed container, the panel may render in the wrong position — the panel uses `position: fixed`, which is anchored by transformed ancestors. Move the input outside the transform, or adjust with `--ts-cp-z`.

**`getColor()` returns the wrong format**

- [ ] `format` defaults to `'hex'`. If you need `rgba`, pass `format: 'rgba'` at init time or change `inst.options.format` before calling `getColor()`.

**Alpha slider is missing**

- [ ] Set `alpha: true` explicitly. It is `false` by default even when `format` is `'rgba'`.

**Typed colour in the field is not applied**

- [ ] The field commits on `Enter` or `blur`. Typing alone does not update the picker — this is intentional to avoid mid-type resets.

**Swatch colours appear but clicking does nothing**

- [ ] Pass `swatches` as an array of strings, not an array of objects.
- [ ] Ensure the strings are valid CSS colours (`'#e74c3c'` not `e74c3c`).

**The instance is `undefined` after init**

- [ ] Retrieve via `$el.data('__pluginColorPicker')` — note the double underscore prefix.
- [ ] Never chain `.data('__pluginColorPicker')` off the init call; use a fresh `$(selector)` selection to read the instance.

**`destroy()` does not remove the injected styles**

- [ ] The `<style>` tag is removed only when `instanceCount` reaches zero — i.e. when the last picker on the page is destroyed. This is by design so styles remain available while any instance is active.
