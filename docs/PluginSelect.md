# PluginSelect

A custom select component that replaces the browser's native `<select>` with a fully styled, fully accessible dropdown while keeping the original element in the DOM for form submission and browser autofill compatibility.

**File:** `js/components/themestrap.plugin.select.js`  
**Demo:** `demos/plugin.demo.select.html`  
**Data attribute:** `data-plugin-select`  
**Instance key:** `__pluginSelect`



## How It Works

The plugin is initialized on a wrapper `<div>` that contains a standard `<select>`. On `build()` it:

1. Reads all `<option>` and `<optgroup>` children from the native select.
2. Hides the native select with `display: none !important` (CSS-injected).
3. Appends a `<button class="ts-select-trigger">` and a `<div class="ts-select-content">` to the wrapper.
4. Keeps the native select's `value` in sync whenever a selection is made — so standard `<form>` submission and `FormData` work without any extra code.

The stylesheet is injected lazily on the first `build()` call and removed only when the last active instance is destroyed.



## Quick Start

### Auto-init

Add `data-plugin-select` to a wrapper `<div>` and include the script. The plugin auto-inits via `themestrap.fn.intObsInit` when `themestrap.js` is present on the page.

```html
<div data-plugin-select>
  <select name="timezone">
    <option value="">Select a timezone…</option>
    <option value="utc">UTC</option>
    <option value="est">Eastern (EST / EDT)</option>
    <option value="pst">Pacific (PST / PDT)</option>
  </select>
</div>
```

### Manual init

Use the `.manual` class to opt out of auto-init and initialize with custom options, or simply to control timing yourself.

```html
<div id="my-select" class="manual" data-plugin-select>
  <select name="role">
    <option value="">Pick a role…</option>
    <option value="admin">Admin</option>
    <option value="editor">Editor</option>
    <option value="viewer">Viewer</option>
  </select>
</div>
```

```js
$('#my-select').themestrapPluginSelect({ placeholder: 'Pick a role…' });
```



## Markup Reference

### Basic

```html
<div data-plugin-select>
  <select name="fruit">
    <option value="">Select a fruit…</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="cherry">Cherry</option>
  </select>
</div>
```

### Option groups

Use standard `<optgroup>` elements. Each group renders with a muted label and a `border-top` separator from the preceding group or item.

```html
<div data-plugin-select>
  <select name="framework">
    <option value="">Select a framework…</option>
    <optgroup label="Frontend">
      <option value="react">React</option>
      <option value="vue">Vue</option>
    </optgroup>
    <optgroup label="Backend">
      <option value="express">Express</option>
      <option value="laravel">Laravel</option>
    </optgroup>
  </select>
</div>
```

### Pre-selected value

Set the `selected` attribute on an `<option>` as normal. The plugin reads `$native.val()` during `build()` and reflects it in the trigger.

```html
<div data-plugin-select>
  <select name="theme">
    <option value="light">Light</option>
    <option value="dark" selected>Dark</option>
    <option value="system">System</option>
  </select>
</div>
```

### Disabled trigger

Setting `disabled` on the `<select>` disables the entire control. The trigger becomes non-interactive and the dropdown cannot be opened.

```html
<div data-plugin-select>
  <select name="plan" disabled>
    <option value="">Upgrade to change plan</option>
    <option value="pro">Pro</option>
  </select>
</div>
```

### Disabled options

Individual options can be disabled via the `disabled` attribute. They appear in the list at reduced opacity and are skipped by keyboard navigation and type-ahead.

```html
<option value="xl" disabled>XL (out of stock)</option>
```

### Explicit separator

Insert a `<div class="ts-select-separator">` anywhere inside `.ts-select-viewport` after `build()` if you need a separator independent of group boundaries — or, more practically, build the markup yourself and init programmatically.



## Configuration Options

Options are passed as a plain object to `$.fn.themestrapPluginSelect()` or via a `data-plugin-options` attribute on the wrapper element.

| Option | Type | Default | Description |
| - | - | - | - |
| `placeholder` | `string` | `'Select an option…'` | Placeholder text shown when no value is selected. Overridden automatically by the text of the first `<option value="">`. |
| `disabled` | `boolean` | `false` | Initialise the select in a disabled state. Overridden automatically if the native `<select>` carries the `disabled` attribute. |

```js
$('#my-select').themestrapPluginSelect({
    placeholder: 'Choose one…',
    disabled: false
});
```



## Public API

Retrieve the instance with `.data('__pluginSelect')` on a fresh selection — never chain it off the init call.

```js
/* correct */
$('#my-select').themestrapPluginSelect();
const sel = $('#my-select').data('__pluginSelect');

/* also correct — string command via the bridge */
$('#my-select').themestrapPluginSelect('open');
```

### Methods

#### `open()` → `this`
Opens the dropdown. No-ops if already open or the trigger is disabled. Runs flip-up detection, focuses the listbox element, and dispatches `ts.select.open`.

```js
sel.open();
```

#### `close()` → `this`
Closes the dropdown. No-ops if already closed. Removes the keyboard-focus indicator from any item and dispatches `ts.select.close`.

```js
sel.close();
```

#### `select(value)` → `this`
Selects the option with the given value. If `value` does not match a non-disabled option the call is silently ignored. Updates the trigger text, syncs the native `<select>`, and dispatches `ts.select.change`.

```js
sel.select('apple');
```

#### `getValue()` → `string`
Returns the currently selected value, or an empty string when nothing is selected.

```js
const val = sel.getValue(); /* 'apple' | '' */
```

#### `setValue(value)` → `this`
Alias for `select(value)`.

```js
sel.setValue('banana');
```

#### `reset()` → `this`
Clears the selection, restores the placeholder text, and syncs the native select back to its blank state. Does not dispatch `ts.select.change`.

```js
sel.reset();
```

#### `enable()` → `this`
Removes the disabled state from the trigger and the wrapper class `.ts-select--disabled`.

```js
sel.enable();
```

#### `disable()` → `this`
Applies the disabled state to the trigger and the wrapper class `.ts-select--disabled`. The dropdown cannot be opened while disabled.

```js
sel.disable();
```

#### `destroy()` → `this`
Tears down the plugin: removes all event listeners (including the document-level outside-click handler), restores `initialHTML` to the wrapper, removes all state classes, and clears the instance from jQuery data. Removes the injected stylesheet when this was the last active instance.

```js
sel.destroy();
```



## Events

All events are native `CustomEvent` instances dispatched on the wrapper element with `bubbles: true`, so they propagate up the DOM and can be caught anywhere in the ancestor chain.

```js
document.addEventListener('ts.select.change', function(e) {
    console.log(e.detail);
});
```

Or scoped to a specific instance:

```js
document.getElementById('my-select').addEventListener('ts.select.change', function(e) {
    console.log(e.detail);
});
```

### `ts.select.open`

Fired when the dropdown opens.

| `detail` key | Type | Description |
| - | - | - |
| `value` | `string` | The currently selected value at the time of opening (`''` if none). |

### `ts.select.close`

Fired when the dropdown closes, whether by item selection, Escape key, or an outside click.

| `detail` key | Type | Description |
| - | - | - |
| `value` | `string` | The currently selected value at the time of closing. |

### `ts.select.change`

Fired when a selection is confirmed. Not fired by `reset()`.

When the value actually changes, the wrapped `<select>` also receives ordinary `input` and `change` events (both bubbling), exactly as a native select would. Form libraries, validators and any existing `$('select').on('change', …)` code therefore keep working. Nothing is fired at initialization, and nothing native is fired when the same value is chosen again.

| `detail` key | Type | Description |
| - | - | - |
| `value` | `string` | The newly selected value. |
| `text` | `string` | The display text of the selected option. |
| `previousValue` | `string` | The value that was selected before this change (`''` if none). |



## Long lists

The list scrolls (280px by default) and **opens at the selected item**, so a long list such as time zones does not make the reader hunt for the current value. Group long lists with `<optgroup>` so people can find their way, and keep option labels short:

```html
<div data-plugin-select>
    <select name="timezone">
        <optgroup label="Europe">
            <option value="Europe/Berlin">Berlin</option>
            <option value="Europe/London">London</option>
        </optgroup>
        <optgroup label="America">
            <option value="America/New_York">New York</option>
        </optgroup>
    </select>
</div>
```

Typing the first letters of a label jumps to the matching item.

## Naming the control for screen readers

The button shows the current value, so a screen reader hears only "Berlin". When the field has a visible label, point the button at both:

```js
var trigger = $wrapper.find('.ts-select-trigger')[0];
trigger.setAttribute('aria-labelledby', 'my-label-id ' + trigger.id);
```

A `<label>` that wraps the wrapper does not focus the button when its text is clicked. Use a `<span id>` for the label text, as above.

## CSS Custom Properties

All tokens are declared on `.ts-select` and inherit Bootstrap's own CSS variables where available, with hard-coded fallbacks for standalone use. Override any token on the wrapper element or a parent.

```css
/* example: wider border radius on a single instance */
#my-select {
    --ts-select-trigger-radius: 9999px;
    --ts-select-content-radius: 0.75rem;
}
```

### Trigger

| Token | Default | Description |
| - | - | - |
| `--ts-select-h` | `2.25rem` | Height of the trigger button. |
| `--ts-select-trigger-bg` | `var(--bs-body-bg, #fff)` | Trigger background. |
| `--ts-select-trigger-border` | `var(--bs-border-color, #dee2e6)` | Trigger border colour. |
| `--ts-select-trigger-radius` | `0.375rem` | Trigger border radius. |
| `--ts-select-trigger-color` | `var(--bs-body-color, #212529)` | Trigger text colour. |
| `--ts-select-trigger-muted` | `var(--bs-secondary-color, #6c757d)` | Placeholder text and chevron icon colour. |
| `--ts-select-trigger-dim-bg` | `var(--bs-secondary-bg, #e9ecef)` | Background when the trigger is disabled. |
| `--ts-select-focus-border` | `#86b7fe` | Border colour on `:focus-visible`. |
| `--ts-select-focus-ring` | `0 0 0 0.25rem rgba(13,110,253,.25)` | Box-shadow on `:focus-visible`. |

### Dropdown

| Token | Default | Description |
| - | - | - |
| `--ts-select-content-bg` | `var(--bs-body-bg, #fff)` | Dropdown background. |
| `--ts-select-content-border` | `var(--bs-border-color, #dee2e6)` | Dropdown border colour. |
| `--ts-select-content-radius` | `0.5rem` | Dropdown border radius. |
| `--ts-select-content-shadow` | `0 4px 16px -2px …` | Dropdown box-shadow. |
| `--ts-select-content-z` | `1050` | Dropdown z-index. |

### Option items

| Token | Default | Description |
| - | - | - |
| `--ts-select-item-h` | `2rem` | Minimum height of each option row. |
| `--ts-select-item-radius` | `0.25rem` | Border radius of each option row. |
| `--ts-select-item-color` | `var(--bs-body-color, #212529)` | Option text colour. |
| `--ts-select-item-hover-bg` | `var(--bs-tertiary-bg, #f8f9fa)` | Background on hover and keyboard focus. |
| `--ts-select-separator-bg` | `var(--bs-border-color, #dee2e6)` | Group separator line and scrollbar thumb colour. |

### Dark mode

The plugin uses the three-tier dark mode pattern. Tokens are redeclared automatically under each tier — no additional configuration is needed.

| Tier | Selector |
| - | - |
| OS preference | `@media (prefers-color-scheme: dark)` |
| Explicit dark | `html.dark .ts-select`, `[data-bs-theme="dark"] .ts-select` |
| Explicit light override | `[data-bs-theme="light"] .ts-select` |



## Keyboard Navigation

The trigger and the open listbox each have their own key handling. Focus moves between trigger → listbox → trigger; focus never lands on individual option rows (they use a CSS `.ts-select-item--focus` class for visual indication only).

| Context | Key | Action |
| - | - | - |
| Trigger | `↓ / ↑ / Enter / Space` | Opens the dropdown and moves visual focus to the current selection, or the first enabled option if nothing is selected. |
| Trigger | `Escape` | Closes the dropdown if open. |
| Listbox | `↓` | Moves visual focus to the next enabled option. |
| Listbox | `↑` | Moves visual focus to the previous enabled option. |
| Listbox | `Home` | Moves visual focus to the first enabled option. |
| Listbox | `End` | Moves visual focus to the last enabled option. |
| Listbox | `Enter / Space` | Confirms the visually-focused option, closes the dropdown, and returns DOM focus to the trigger. |
| Listbox | `Escape / Tab` | Closes the dropdown and returns DOM focus to the trigger. |
| Listbox | Any printable character | **Type-ahead** — appends the character to an internal buffer (reset after 500 ms of inactivity) and moves visual focus to the first enabled option whose text starts with that buffer string (case-insensitive). |

Disabled options are excluded from all keyboard navigation and type-ahead.



## ARIA Wiring

The plugin constructs a `combobox` / `listbox` pattern per the ARIA Authoring Practices Guide.

```
[div.ts-select]
  [button.ts-select-trigger]
    role="combobox"
    aria-expanded="false | true"
    aria-haspopup="listbox"
    aria-controls="ts-select-{uid}-listbox"
    id="ts-select-{uid}-trigger"

  [div.ts-select-content]
    role="listbox"
    id="ts-select-{uid}-listbox"
    aria-labelledby="ts-select-{uid}-trigger"
    tabindex="-1"

    [div.ts-select-group]                (per <optgroup>)
      role="group"
      aria-labelledby="ts-select-{uid}-gl-{n}"

      [div.ts-select-group-label]
        id="ts-select-{uid}-gl-{n}"

    [div.ts-select-item]
      role="option"
      aria-selected="true | false"
      aria-disabled="true"              (when disabled)
      data-value="{escaped value}"
```

`{uid}` is a monotonically incrementing integer scoped to the page session, ensuring all IDs are unique even with multiple instances.



## Recipes

### React to a change and populate a second select

```js
document.getElementById('sel-country').addEventListener('ts.select.change', function(e) {
    const regions = getRegionsFor(e.detail.value);
    const $region = $('#sel-region');
    const sel     = $region.data('__pluginSelect');

    /* rebuild the native select's options */
    $region.find('select').html(
        '<option value="">Select a region…</option>' +
        regions.map(r => `<option value="${r.id}">${r.name}</option>`).join('')
    );

    /* re-parse and rebuild the custom UI */
    sel.destroy();
    $region.themestrapPluginSelect();
});
```

### Read value on form submit

The native `<select>` stays in the DOM, so standard form serialization works untouched.

```js
$('form').on('submit', function(e) {
    e.preventDefault();
    const data = new FormData(this);
    console.log(data.get('timezone')); /* reads the hidden native select */
});
```

### Initialise with a value set in JavaScript

Set the native select's value before calling the plugin. The plugin reads `$native.val()` during `build()`.

```js
$('#my-select').find('select').val('pst');
$('#my-select').themestrapPluginSelect();
```

Or initialize first, then call `setValue`:

```js
$('#my-select').themestrapPluginSelect();
$('#my-select').data('__pluginSelect').setValue('pst');
```

### Per-instance colour override

```css
/* pill-shaped trigger with a brand teal border */
#brand-select {
    --ts-select-trigger-radius: 9999px;
    --ts-select-trigger-border: #20e2d7;
    --ts-select-focus-border:   #20e2d7;
    --ts-select-focus-ring:     0 0 0 0.25rem rgba(32, 226, 215, 0.25);
    --ts-select-content-radius: 0.75rem;
}
```

### Widen the dropdown beyond the trigger

The dropdown matches the trigger's width by default (`left: 0; right: 0`). To allow it to grow wider than its trigger:

```css
#my-select .ts-select-content {
    right: auto;
    min-width: 100%;
    width: max-content;
    max-width: calc(100vw - 2rem);
}
```



## Common Pitfalls

### `data-plugin-select` on the wrong element

`data-plugin-select` must go on the **wrapper `<div>`**, not on the `<select>` itself. The plugin calls `this.$el.find('select')` to locate the native select as a child.

```html
<!-- wrong -->
<select data-plugin-select name="fruit">…</select>

<!-- correct -->
<div data-plugin-select>
  <select name="fruit">…</select>
</div>
```

### Chaining `.data()` off the init call

`.themestrapPluginSelect()` returns a jQuery object of PluginSelect instances (via `.map()`), not the original element. Always retrieve the instance on a fresh selection.

```js
/* wrong — .data() called on the map result, not the element */
const sel = $('#my-select').themestrapPluginSelect().data('__pluginSelect');

/* correct */
$('#my-select').themestrapPluginSelect();
const sel = $('#my-select').data('__pluginSelect');
```

### `setValue()` silently no-ops for disabled options

`_findItem()` returns `null` for any option with `disabled: true`. Calling `setValue('xl')` when that option is disabled will do nothing and fire no event.

### Calling API methods after `destroy()`

`destroy()` removes the instance from jQuery data. Any method calls on the stale reference after destruction will throw because the DOM elements it references are gone. Re-initialize before calling methods again.

```js
sel.destroy();
/* sel is now a dangling reference — do not use it */
$('#my-select').themestrapPluginSelect();
const sel = $('#my-select').data('__pluginSelect'); /* fresh instance */
```

### Dropdown hidden by an `overflow: hidden` ancestor

The dropdown is positioned `absolute` relative to the `.ts-select` wrapper. If any ancestor has `overflow: hidden` or `overflow: clip`, the dropdown will be clipped. Either remove that restriction from the ancestor, or use a portal pattern (append `.ts-select-content` to `document.body` and update its `position: fixed` coordinates — this is not built in but can be added).

### z-index conflicts

The dropdown's default `z-index` is `1050` (same as Bootstrap modals). Inside a stacking context with a higher `z-index`, the dropdown may be rendered beneath other elements. Override with the token:

```css
#my-select { --ts-select-content-z: 1200; }
```

### Diagnostic checklist

- [ ] `data-plugin-select` is on the wrapper `<div>`, not the `<select>`.
- [ ] The wrapper `<div>` has `position: relative` (added by the plugin via `.ts-select`; check it hasn't been overridden).
- [ ] No ancestor between `.ts-select` and the viewport has `overflow: hidden` that would clip the dropdown.
- [ ] The script loads after jQuery.
- [ ] For manual instances: `.manual` is on the wrapper so auto-init doesn't double-initialize.
- [ ] Instances retrieved with a fresh `$(selector).data('__pluginSelect')`, not chained off the init call.
- [ ] `setValue()` is being called with a value that exists and is not disabled.