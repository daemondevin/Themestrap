# PluginNumberInput

Replaces the browser's tiny spin arrows with a proper stepper: minus and plus buttons that match your other inputs, hold-to-repeat, keyboard control, bounds, and an optional unit label. The original `<input type="number">` stays in the page and keeps the value, so forms, validation and code that reads the input keep working. No vendor dependencies.

| Feature | Notes |
| - | - |
| Layouts | `split` (minus and plus at the sides) or `stacked` (small arrows at the right) |
| Bounds | Reads `min`, `max` and `step` from the input. The button at a bound shows disabled |
| Hold to repeat | Hold a button and it repeats, speeding up |
| Keyboard | Up and Down, Shift for ten, Page Up and Down, Home and End, Enter |
| Typing | Digits only (no fraction for integer fields). Out-of-range values are clamped when you leave the field |
| Unit | An optional label inside the field, such as `posts` or `px` |
| Sizes | `sm`, `md`, `lg`, or fill the width with `block` |
| Theming | `--ts-ni-*` tokens with light, dark and explicit-light tiers |
| Native behavior | Fires ordinary `input` and `change` events as well as its own |

## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance.
2. **`setData`** stores the instance on the input as `__pluginNumberInput`.
3. **`setOptions`** merges `PluginNumberInput.defaults` with the input's `min`, `max` and `step` attributes and your options. The number of decimals shown comes from `step` (and `min`), so `step="0.1"` shows one decimal.
4. **`build`** injects the stylesheet once, wraps the input, adds the buttons, and forces the input to `type="number"` with its bounds.
5. **`events`** binds press-and-hold, keyboard, typing, blur and the optional wheel.
6. **`destroy`** unwraps the input, restores its original `type`, and removes the stylesheet when the last instance goes.

Stepping from an empty field starts at `min` (or at one step when there is no minimum). Steps are computed from the current value and rounded to the step's precision, so `0.1 + 0.2` never shows as `0.30000000000000004`.

### Stylesheet injection

`<style id="ts-numberinput-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

## Quick Start

```html
<script src="js/components/themestrap.plugin.numberinput.js"></script>

<input type="number" name="per_page" value="8" min="1" max="50"
       data-plugin-numberinput
       data-plugin-options='{"unit": "posts"}'>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// NumberInput
if (typeof $.fn['themestrapPluginNumberInput'] === 'function' &&
    $('[data-plugin-numberinput]').length) {
    themestrap.fn.intObsInit('[data-plugin-numberinput]:not(.manual)', 'themestrapPluginNumberInput');
}
```

Zero-vendor plugins are wired in `themestrap.init.js`, not `themestrap.modules.js`.

### Manual init

```js
$('#price').themestrapPluginNumberInput({ min: 0, max: 999.99, step: 0.01, layout: 'stacked' });
```

## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-numberinput` | `<input>` | Init hook. The host must be an input |
| `data-plugin-options` | Host | JSON options |
| `.manual` | Host | Excludes the element from auto-init |
| `min`, `max`, `step` | Host | Read as the defaults for the matching options |
| `disabled`, `readonly` | Host | Respected: the buttons and keys do nothing |

### Generated structure

```html
<div class="ts-ni ts-ni--split" role="group">
    <button class="ts-ni-btn ts-ni-dec" type="button" tabindex="-1" aria-label="Decrease" aria-controls="id">…</button>
    <div class="ts-ni-field">
        <input class="ts-ni-input" type="number" …>
        <span class="ts-ni-unit" aria-hidden="true">posts</span>
    </div>
    <button class="ts-ni-btn ts-ni-inc" …>…</button>
</div>
```

| Class | Meaning |
| - | - |
| `ts-ni--split`, `ts-ni--stacked` | Layout |
| `ts-ni--sm`, `ts-ni--lg`, `ts-ni--block` | Size and width |
| `ts-ni--disabled` | The input is disabled |
| `is-disabled` (on a button) | The value is at that bound |

## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `min`, `max` | `number` | from attributes | Bounds. Leave out for none |
| `step` | `number` | from attribute, else `1` | Amount per press |
| `precision` | `number` | from `step` | Decimals shown |
| `layout` | `string` | `'split'` | `'split'` or `'stacked'` |
| `size` | `string` | `'md'` | `'sm'`, `'md'` or `'lg'` |
| `block` | `boolean` | `false` | Fill the width of the parent |
| `unit` | `string` | `''` | Text shown after the value |
| `repeat` | `boolean` | `true` | Hold a button to repeat |
| `holdDelay` | `number` | `420` | Milliseconds before repeating starts |
| `holdInterval` | `number` | `90` | Milliseconds between repeats, speeding up |
| `holdMinInterval` | `number` | `25` | Fastest repeat rate |
| `wheel` | `boolean` | `false` | Mouse wheel changes the value while the field is focused |
| `snap` | `boolean` | `false` | Round typed values to a multiple of `step` |
| `labels` | `object` | `{ increase: 'Increase', decrease: 'Decrease' }` | Button names for screen readers |
| `onChange` | `function` | `null` | `function (value) {}` |

## Public API

```js
const ni = $('#per_page').data('__pluginNumberInput');
```

| Method | Returns | Description |
| - | - | - |
| `getValue()` | `number \| null` | The value, or `null` when empty |
| `setValue(v, silent)` | `this` | Clamps to the bounds. `silent` skips the events |
| `increment(n)`, `decrement(n)` | `this` | Move `n` steps (default 1) |
| `setMin(n)`, `setMax(n)`, `setStep(n)` | `this` | Change the rules |
| `enable()`, `disable()` | `this` | Toggle the input |
| `destroy()` | `this` | Restore the plain input |

The jQuery bridge also accepts a method name: `$('#per_page').themestrapPluginNumberInput('increment', 5)`.

## Events

Native events, bubbling, dispatched on the input.

| Event | When |
| - | - |
| `input`, `change` | After every change made by the plugin (buttons, keys, wheel, `setValue`) |
| `ts.numberinput.change` | Same moments. `detail`: `{ instance, value, previousValue, source }` where `source` is `'button'`, `'keyboard'`, `'wheel'`, `'typing'` or `'api'` |

Typing fires `change` when you leave the field or press Enter, after the value is clamped. `setValue(v, true)` fires nothing.

> Use `addEventListener` for `ts.numberinput.change`. jQuery reads the dots as namespaces, so `$el.on('ts.numberinput.change', …)` never fires. The ordinary `change` event works with jQuery.

## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-ni-h` | `2.45rem` | same | Height |
| `--ts-ni-bg` | `#ffffff` | `rgba(255,255,255,.03)` | Background |
| `--ts-ni-border` | `rgba(0,0,0,.18)` | `rgba(255,255,255,.14)` | Border and dividers |
| `--ts-ni-border-focus` | `#00a89f` | `#00c7be` | Focus border |
| `--ts-ni-focus-ring` | `0 0 0 3px rgba(0,168,159,.20)` | tinted | Focus ring |
| `--ts-ni-radius` | `7px` | same | Corners |
| `--ts-ni-text`, `--ts-ni-muted` | `#1f2937`, 55% | `#d5dfeb`, 55% | Text and unit |
| `--ts-ni-btn-bg`, `--ts-ni-btn-hover` | 3.5% and 9% black | 5% and 12% white | Buttons |
| `--ts-ni-width` | `auto` | same | Overall width |
| `--ts-ni-input-width` | `4.5rem` | same | Width of the value field |

Theme resolution follows the standard three tiers: `prefers-color-scheme`, then `html.dark` and `[data-bs-theme="dark"]`, then an explicit `[data-bs-theme="light"]`. Set the tokens on `:root` to restyle every instance.

## Keyboard Navigation

| Key | Action |
| - | - |
| `ArrowUp`, `ArrowDown` | One step |
| `Shift + ArrowUp`, `Shift + ArrowDown`, `PageUp`, `PageDown` | Ten steps |
| `Home`, `End` | Minimum and maximum (when set) |
| `Enter` | Apply the typed value |

The minus and plus buttons are not tab stops (`tabindex="-1"`), because the input already handles the keys. They stay available to pointer and touch users.

## ARIA Wiring

| Element | Attributes |
| - | - |
| Wrapper | `role="group"` |
| Input | The native number input is a spin button. `min` and `max` give it its range |
| Buttons | `aria-label`, `aria-controls` pointing at the input, `aria-disabled` at a bound |
| Unit | `aria-hidden`, because the label is usually the better description |

## Recipes

### Money with two decimals

```js
$('#price').themestrapPluginNumberInput({ min: 0, step: 0.05, unit: '€' });
```

### Step by 5, typed values rounded to match

```js
$('#minutes').themestrapPluginNumberInput({ min: 0, max: 60, step: 5, snap: true });
```

### React to changes

```js
document.getElementById('per_page').addEventListener('ts.numberinput.change', function (e) {
    console.log(e.detail.value, e.detail.source);
});
```

## Common Pitfalls

**Nothing is wrapped.** The host must be an `<input>`. A `div` is refused with a console error.

**The value jumps back when I type a big number.** Values outside `min` and `max` are clamped when you leave the field. That is the intent.

**`$el.on('ts.numberinput.change')` never fires.** Use `addEventListener`, or the plain `change` event.

**I see the browser's arrows too.** Another stylesheet is forcing `appearance` back on the input. The plugin sets it on `.ts-ni input.ts-ni-input`; check for a rule with higher specificity.

### Diagnostic checklist

1. Is jQuery loaded before the plugin file?
2. Does `$('#field').data('__pluginNumberInput')` return an instance?
3. Is `<style id="ts-numberinput-styles">` in the head?
4. Does the input sit inside a `.ts-ni` wrapper?
