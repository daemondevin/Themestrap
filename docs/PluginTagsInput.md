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
| `separators` | string | `',;\n\t'` | The characters that end a tag when text is pasted, dropped or otherwise inserted: here a comma, semicolon, newline and tab. A comma always counts, because the source input stores the tags comma separated. `''` leaves only the comma. |
| `splitOnSpace` | `boolean \| 'auto'` | `'auto'` | Also split on whitespace. `'auto'` follows `validateEmail`: addresses never contain spaces so they split on them, keywords often do so they do not. |
| `maxTags` | number | `0` | The most tags allowed. `0` is no limit. Extra entries are skipped with the reason `'max'`, and the field shakes. |
| `ignoreCase` | boolean | `false` | Treat `Web` and `web` as the same tag. The first spelling wins. |
| `normalize` | function | `null` | `function (text) { return text; }`, runs on every entry before it is checked. Use it to strip characters or collapse spaces so the chips show what your server will keep. |
| `messages` | object | `{ added: '%n added', skipped: '%n skipped' }` | What a screen reader hears after a paste. `%n` is the count. |

Merge order: `defaults → opts → { wrapper }`.


## Public API

Retrieve the instance from a fresh selection:

```js
const ti = $('#to').data('__tagsinput');
```

| Method | Returns | Description |
|---|---|---|
| `addTag(text, silent?)` | `this` | Cleans (trim, then `normalize`) and validates, ignores blanks and duplicates, appends a chip and syncs the source. Pass `true` as the second argument to skip the `add` event. Text that contains a separator, such as `'a, b'`, is split and added as separate tags. |
| `addTags(text, silent?)` | `{ added, skipped }` | Splits the text on the separators and adds each item. `added` is the list of new tags. `skipped` is a list of `{ tag, reason }` where `reason` is `'duplicate'`, `'invalid'` (failed email validation) or `'max'`. Fires an `add` event for each new tag unless `silent`. |
| `removeTag(text)` | `this` | Removes the exact matching tag, syncs the source, fires `remove`. Does nothing when the tag is not present. |
| `getTags()` | `string[]` | A copy of the current tags. |
| `clearTags()` | `this` | Empties the field and syncs the source. Fires no events. |
| `destroy()` | `this` | Unbinds handlers, removes the widget, unhides the source and clears the instance. The source keeps its last value. The injected stylesheet is removed once the last instance is destroyed. |

Rejected input (failed validation, or over `maxTags`) adds the `.ts-ti-invalid` class for 700 ms to run the shake animation. Duplicates are ignored silently, but `addTags()` and a paste report them in `skipped`.

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
| `ts.tagsinput.paste` | `{ added, skipped, tags }` | After a pasted list has been split. Fires once, after the `add` event of each new tag. `added` is the new tags, `skipped` is `[{ tag, reason }]`, `tags` is the full set. Not fired for a single pasted word, which is inserted as text. |

```js
document.addEventListener('ts.tagsinput.add', e => {
    console.log(e.target.name, e.detail.tag, e.detail.tags);
});

document.querySelector('#to').addEventListener('ts.tagsinput.remove', e => {
    console.log('removed', e.detail.tag);
});
```

`tags` is a copy, so it is safe to keep.

A paste of a ten item list fires ten `add` events and then one `paste` event. Listen to `paste` when you want to react once (to show a message, say) and to `add` when you want to react to every tag.


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
| Paste | Text contains a separator | Every item becomes its own tag. The field is left empty |
| Paste | A single word | Inserted into the field as text, so it can be edited before Enter |
| Drop, phone keyboards, dictation | Text contains a separator | Complete items become tags. The last, unfinished item stays in the field |
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
| `.ts-ti-live` | `role`, `aria-live` | `status`, `polite`. A visually hidden note such as "3 added, 1 skipped" after a paste |

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

### Pasting lists

Nothing to set up: pasting splits on commas, semicolons, new lines and tabs, and each item becomes its own tag. A column copied from a spreadsheet or a list copied from another tool works the same way.

```html
<input type="text" data-plugin-tagsinput
       data-plugin-options='{"validateEmail": false, "maxTags": 20, "ignoreCase": true}'>
```

Tell people what was left out:

```js
document.getElementById('keywords').addEventListener('ts.tagsinput.paste', function (e) {
    const dup  = e.detail.skipped.filter(k => k.reason === 'duplicate').length;
    const over = e.detail.skipped.filter(k => k.reason === 'max').length;
    if (dup || over) {
        alert('Added ' + e.detail.added.length + '. ' + dup + ' already there, ' + over + ' over the limit.');
    }
});
```

### Make the chips match your server

If the server cleans tags, give the plugin the same rules so what people see is what is saved. This is what the Themestrap blog does:

```js
$('#tags').themestrapPluginTagsInput({
    validateEmail: false,
    maxTags:       20,
    ignoreCase:    true,
    normalize:     function (t) { return t.replace(/["'<>,\/\\?#%]/g, '').replace(/\s+/g, ' ').trim(); }
});
```

### Space separated lists

Keywords may contain spaces, so a space does not split by default. For a field where it should (hashtags, say):

```js
$('#tags').themestrapPluginTagsInput({ validateEmail: false, splitOnSpace: true });
```

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

**Pasting `web design` gives one tag**
A space does not separate keywords by default (many tags contain spaces). Separate with commas or new lines, or set `splitOnSpace: true`.

**A pasted list lost some items**
Duplicates, entries that failed email validation, and anything over `maxTags` are skipped. They are listed in `e.detail.skipped` of the `ts.tagsinput.paste` event, with a reason for each.

**Pasting inserted text instead of making tags**
A single word with no separator is deliberately left for the browser to paste as text, so you can edit it before pressing Enter. A separator (even a trailing comma) makes it a tag.

**Source `change` handlers never run**
`_syncInput()` uses `.val()`, which fires no DOM events. Listen to the plugin events instead.

**Prefilled values are missing**
Initial values are split on commas, trimmed, and validated, and an entry that contains another separator (such as `a; b`) is split further. Invalid addresses when `validateEmail` is on are silently dropped.

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