# PluginTagsInput Guide

A zero dependency tag and recipient field for Themestrap. It wraps a plain `<input type="text">`, renders each committed value as a removable chip, validates entries as email addresses by default, and keeps the original input in sync as a comma separated string so ordinary form posts keep working.

| | |
|---|---|
| Plugin file | `js/components/themestrap.plugin.tagsinput.js` |
| Demo | `demos/plugin.demo.tagsinput.html` |
| Namespace class | `themestrap.PluginTagsInput` |
| jQuery method | `$.fn.themestrapPluginTagsInput` |
| Data attribute | `data-plugin-tagsinput` |
| Instance key | `__tagsinput` |
| Options attribute | `data-plugin-options` |
| CSS token prefix | `--ts-ti-*` |


## How It Works

1. `initialize()` bails out if `$el.data('__tagsinput')` already exists, otherwise runs `setData → setOptions → build → events`.
2. `build()` lazily injects one shared `<style id="ts-tagsinput-styles">` tag (guarded by `STYLE_ID`, ref-counted by an instance counter), hides the source input with `.ts-tagsinput-source`, and inserts the widget directly after it.
3. Any existing `value` on the source input is split on commas, trimmed, validated, and added silently (no events fire during initialization).
4. Every add or remove calls `_syncInput()`, which writes `tags.join(', ')` back into the source input.
5. `add` and `remove` events are native `CustomEvent`s dispatched on the source input element and bubble up the DOM.

Rendered structure:

```html
<input type="text" class="ts-tagsinput-source" ...>      <!-- hidden, keeps the value -->
<div class="ts-tagsinput" role="group" aria-label="Email addresses">
    <span class="ts-tagsinput-tags">
        <span class="ts-tag">ada@example.com <button type="button" class="ts-tag-remove" aria-label="Remove">&times;</button></span>
    </span>
    <input type="text" class="ts-tagsinput-field" aria-label="Add address">
</div>
```


## Quick Start

### 1. Include the script

```html
<script src="js/components/themestrap.plugin.tagsinput.js"></script>
```

It must load after `themestrap.js` (or any script that defines `window.themestrap`) and after jQuery.

### 2. Add the markup

```html
<input type="text" name="to" data-plugin-tagsinput value="ada@example.com, grace@example.com">
```

### 3. Wire auto init

```js
// TagsInput
if ($.isFunction($.fn['themestrapPluginTagsInput']) && $('[data-plugin-tagsinput]').length) {
    themestrap.fn.intObsInit('[data-plugin-tagsinput]:not(.manual)', 'themestrapPluginTagsInput');
}
```

### Manual init

```html
<input type="text" id="to" class="manual">
```

```js
$('#to').themestrapPluginTagsInput({ validateEmail: false, placeholder: 'Add a keyword...' });
```


## Markup Reference

| Attribute / class | On | Purpose |
| --- | --- | --- |
| `data-plugin-tagsinput` | `<input type="text">` | Marks the input for auto init |
| `data-plugin-options='{"k": "v"}'` | the same input | Per element options, single quoted attribute with double quoted JSON keys |
| `.manual` | the same input | Excludes it from auto init |
| `value="a, b, c"` | the same input | Initial tags, comma separated only |
| `name="..."` | the same input | Submitted with the form as `a, b, c` |

The plugin must be applied to an `<input>`. It reads and writes its `.val()`.


## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `placeholder` | string | `'Add address...'` | Placeholder on the inner text field. Falsy values remove it. |
| `validateEmail` | boolean | `true` | Rejects any entry that does not match `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Set `false` for free form tags. |

Merge order: `defaults → opts → { wrapper }`.


## Public API

Retrieve the instance from a fresh selection:

```js
const ti = $('#to').data('__tagsinput');
```

| Method | Returns | Description |
|---|---|---|
| `addTag(text, silent?)` | `this` | Trims and validates, ignores blanks and duplicates, appends a chip and syncs the source. Pass `true` as the second argument to skip the `add` event. |
| `removeTag(text)` | `this` | Removes the exact matching tag, syncs the source, fires `remove`. Does nothing when the tag is not present. |
| `getTags()` | `string[]` | A copy of the current tags. |
| `clearTags()` | `this` | Empties the field and syncs the source. Fires no events. |
| `destroy()` | `this` | Unbinds handlers, removes the widget, unhides the source and clears the instance. The source keeps its last value. The injected stylesheet is removed once the last instance is destroyed. |

Rejected input (failed validation) adds the `.ts-ti-invalid` class for 700 ms to run the shake animation. Duplicates are ignored silently.

The jQuery bridge returns a jQuery collection of instances (it uses `.map()`), and it accepts an options object only. It does not support string commands.

```js
const ti = $('#to').themestrapPluginTagsInput({}).get(0);   // instance
```


## Events

All events are dispatched on the source input with `bubbles: true`. They are native `CustomEvent`s, so listen with `addEventListener`.

| Event | `detail` | Fired when |
|---|---|---|
| `ts.tagsinput.add` | `{ tag, tags }` | A tag is added through the UI or `addTag()` without `silent`. Not fired for the initial value. |
| `ts.tagsinput.remove` | `{ tag, tags }` | A tag is removed through the chip button, Backspace, or `removeTag()`. |

```js
document.addEventListener('ts.tagsinput.add', e => {
    console.log(e.target.name, e.detail.tag, e.detail.tags);
});

document.querySelector('#to').addEventListener('ts.tagsinput.remove', e => {
    console.log('removed', e.detail.tag);
});
```

`tags` is a copy, so it is safe to keep.


## CSS Custom Properties

Set tokens on `.ts-tagsinput`, or on any ancestor, since custom properties inherit.

| Token | Default | Controls |
|---|---|---|
| `--ts-ti-bg` | `rgba(255,255,255,0.03)` | Field background |
| `--ts-ti-border` | `rgba(255,255,255,0.10)` | Field border |
| `--ts-ti-border-hover` | `rgba(255,255,255,0.20)` | Border on hover |
| `--ts-ti-border-focus` | `#00c7be` | Border while the inner field has focus |
| `--ts-ti-border-invalid` | `#e74c3c` | Border during the invalid shake |
| `--ts-ti-radius` | `5px` | Field corner radius |
| `--ts-ti-text` | `inherit` | Typed text colour |
| `--ts-ti-placeholder` | `rgba(205,216,230,0.40)` | Placeholder colour |
| `--ts-ti-tag-bg` | `rgba(0,199,190,0.15)` | Chip background |
| `--ts-ti-tag-text` | `#00c7be` | Chip text |
| `--ts-ti-tag-border` | `rgba(0,199,190,0.30)` | Chip border |
| `--ts-ti-tag-radius` | `20px` | Chip corner radius |

```css
.theme-amber {
    --ts-ti-border-focus: #ff9f43;
    --ts-ti-tag-bg: rgba(255,159,67,0.16);
    --ts-ti-tag-text: #ffb870;
    --ts-ti-tag-border: rgba(255,159,67,0.35);
    --ts-ti-tag-radius: 6px;
}
```

The built in defaults are tuned for dark surfaces and the plugin does not ship the three tier dark mode block. On a light page, override at least `--ts-ti-bg`, `--ts-ti-border`, `--ts-ti-border-hover`, `--ts-ti-text`, `--ts-ti-placeholder` and the three `--ts-ti-tag-*` colour tokens.

The chip remove button hover tint (`rgba(0,199,190,0.20)`) is not tokenized.

---

## Keyboard Navigation

| Key | Context | Action |
|---|---|---|
| `Enter` | Field has text | Commit the tag |
| `,` | Field has text | Commit the tag (the comma is not inserted) |
| `;` | Field has text | Commit the tag |
| `Tab` | Field has text | Commit the tag and keep focus in the field |
| `Tab` | Field is empty | Normal focus movement |
| `Backspace` | Field is empty | Remove the last tag |
| Blur | Field has text | Commit the tag |
| Click on the container | Anywhere except a remove button | Focus the field |

Remove buttons are real `<button>` elements, so they can be reached with Shift+Tab from the field and activated with Enter or Space.

---

## ARIA Wiring

| Element | Attribute | Value |
|---|---|---|
| `.ts-tagsinput` | `role` | `group` |
| `.ts-tagsinput` | `aria-label` | `Email addresses` |
| `.ts-tagsinput-field` | `aria-label` | `Add address` |
| `.ts-tag-remove` | `aria-label` | `Remove` |

The labels are hard coded and do not follow the `placeholder` option. For anything other than email, override them after init:

```js
const ti = $('#keywords').themestrapPluginTagsInput({ validateEmail: false }).get(0);
ti.$container.attr('aria-label', 'Keywords');
ti.$field.attr('aria-label', 'Add keyword');
```

The source input is hidden with `display: none`, so any `<label for="...">` pointing at it will not focus the widget. Point your own click handler at `ti.$field` if you need that.

---

## Recipes

### Free form keywords

```html
<input type="text" data-plugin-tagsinput
       data-plugin-options='{"validateEmail": false, "placeholder": "Add a keyword..."}'
       value="jquery, bootstrap">
```

### Split a pasted list

The plugin does not split pasted text, so a pasted list is treated as one entry. This delegated handler fixes that for every instance on the page.

```js
$(document).on('paste', '.ts-tagsinput-field', function (e) {
    const text = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
    if (!/[,;\s]/.test(text.trim())) return;

    e.preventDefault();
    const ti = $(this).closest('.ts-tagsinput').prev().data('__tagsinput');
    text.split(/[,;\s]+/).forEach(v => ti.addTag(v));
});
```

The widget is always inserted directly after the source input, which is why `.prev()` finds it.

### React to changes in the source input

The plugin writes to the source with `.val()`, which does not fire native `input` or `change` events. Listen to the plugin events instead, or re-dispatch:

```js
document.addEventListener('ts.tagsinput.add', syncAfterChange);
document.addEventListener('ts.tagsinput.remove', syncAfterChange);

function syncAfterChange(e) {
    e.target.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Read the value server side

```php
$to = array_filter(array_map('trim', explode(',', $_POST['to'] ?? '')));
```

### Pre-populate or replace tags from code

```js
const ti = $('#to').data('__tagsinput');
ti.clearTags();
['ada@example.com', 'grace@example.com'].forEach(t => ti.addTag(t, true));
```

### Rebuild after the DOM changes

```js
$('#to').data('__tagsinput').destroy();
$('#to').themestrapPluginTagsInput({});
```

Or use the framework re-init attributes on a button:

```html
<button data-reinit-plugin="__tagsinput"
        data-reinit-plugin-function="themestrapPluginTagsInput"
        data-reinit-plugin-element="#to">Reinit</button>
```

---

## Common Pitfalls

**Entries disappear when I press Enter**
`validateEmail` defaults to `true`. Anything that is not an email address is cleared from the field and discarded, with only a brief shake as feedback. Set `validateEmail: false` for free form tags.

**`$('#to').on('ts.tagsinput.add', ...)` never fires**
jQuery treats the dots as event namespaces, so `ts.tagsinput.add` becomes the event `ts` with namespaces. The events are native `CustomEvent`s, so use `addEventListener`.

**`.data('__tagsinput')` returns undefined**
Do not chain it off the init call. The bridge returns a jQuery collection of instances, not the source element. Retrieve the instance from a fresh `$(selector)`, or call `.get(0)` on the init result.

**Pasted lists become one invalid entry**
Pasting is not split. Use the paste recipe above.

**Source `change` handlers never run**
`_syncInput()` uses `.val()`, which fires no DOM events. Listen to the plugin events instead.

**Prefilled values are missing**
Initial values are split on commas only, trimmed, and validated. Semicolon separated values, or invalid addresses when `validateEmail` is on, are silently dropped.

**Screen reader label says "Email addresses" on a keyword field**
The ARIA labels are fixed strings. Override them after init as shown in the ARIA section.

**Colours look wrong on a light page**
The defaults assume a dark surface. Override the background, border, text and tag tokens on an ancestor.

**`clearTags()` did not notify my UI**
`clearTags()` fires no events. Update your own state after calling it.

**Tab key seems to trap focus**
Tab commits the pending text and prevents the default focus move, but only when the field contains text. Press Tab again on the empty field to leave.

### Diagnostic checklist

1. Is `window.themestrap` defined before the plugin script loads?
2. Is jQuery loaded before the plugin script?
3. Is the target an `<input type="text">`, and does it lack `.manual` if you expect auto init?
4. Is the `intObsInit('[data-plugin-tagsinput]:not(.manual)', 'themestrapPluginTagsInput')` line present in `themestrap.init.js`?
5. Is the input already initialized? A second init call returns the existing instance and ignores new options. Call `destroy()` first.
6. Is `data-plugin-options` valid JSON inside a single quoted attribute?
7. Are you listening with `addEventListener` rather than jQuery `.on()`?
8. Does `<style id="ts-tagsinput-styles">` exist in `<head>` after init? If not, `build()` never ran.