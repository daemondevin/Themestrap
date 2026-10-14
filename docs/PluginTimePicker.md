# PluginTimePicker

A time field with a popover of scrollable hour, minute and AM/PM columns, built to sit beside `PluginCalendar`. You can also type: `8:30pm`, `830`, `20.30` and `9` are all understood. The original input stays in the page (hidden) and always holds the value as 24 hour `HH:mm`, whatever format is displayed, so forms and server code see one consistent format. No vendor dependencies.

| Feature | Notes |
| - | - |
| Popover | Hour, minute and AM/PM columns. Opens at the current value, flips upward near the bottom of the screen |
| Typing | `8:30pm`, `8:30 PM`, `830`, `2030`, `20.30`, `7h15`, `9`. Unreadable text reverts to the last good time |
| Formats | `12`, `24`, or `auto` to follow the visitor's locale |
| Value | Always `HH:mm` in the original input, even when the display is `8:30 PM` |
| Minute step | The popover lists every N minutes. Typing accepts any minute, and a typed minute is added to the list |
| Inline | `inline: true` shows the columns in the page, like an inline calendar |
| Keyboard | Arrow keys in the field and in the columns |
| Theming | `--ts-tp-*` tokens with light, dark and explicit-light tiers |

## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance.
2. **`setData`** stores the instance on the **original input**, as `__pluginTimePicker`.
3. **`setOptions`** merges `PluginTimePicker.defaults` with your options and resolves `format: 'auto'` to `'12'` or `'24'` using `Intl`.
4. **`build`** injects the stylesheet once, hides the original input (`type="hidden"`), and builds the visible field, the clock button and the popover next to it.
5. **`events`** binds typing, the field's keys, the popover's clicks and keys, outside clicks, and reposition on scroll and resize.
6. **`destroy`** puts the original input back and removes the stylesheet when the last instance goes.

### The original keeps its `id`

The hidden input keeps its `id`, so `$('#publish_time')` and `.data('__pluginTimePicker')` work as everywhere in Themestrap. The visible field gets the id `<id>-input`, and any `<label for="id">` is wired to it: clicking the label focuses the visible field, and the field is named by the label for screen readers.

### Positioning

The popover is `position: fixed`, so it is never clipped by a parent with `overflow: hidden` or `overflow: auto`. It is placed under the field (above when there is more room above), kept inside the window, and repositioned while you scroll or resize.

### Stylesheet injection

`<style id="ts-timepicker-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

## Quick Start

```html
<script src="js/components/themestrap.plugin.timepicker.js"></script>

<label for="publish_time">Publish time</label>
<input type="text" id="publish_time" name="publish_time" value="08:30"
       data-plugin-timepicker
       data-plugin-options='{"format": "12", "minuteStep": 5}'>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// TimePicker
if (typeof $.fn['themestrapPluginTimePicker'] === 'function' &&
    $('[data-plugin-timepicker]').length) {
    themestrap.fn.intObsInit('[data-plugin-timepicker]:not(.manual)', 'themestrapPluginTimePicker');
}
```

Zero-vendor plugins are wired in `themestrap.init.js`, not `themestrap.modules.js`.

### With PluginCalendar

```js
$('#f-cal').themestrapPluginCalendar({ mode: 'single' });
$('#f-time').themestrapPluginTimePicker({ minuteStep: 5, block: true });

function combine() {
    const day  = $('#f-cal').data('__pluginCalendar').getValue();     // Date
    const time = $('#f-time').val();                                   // "08:30"
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(),
                    +time.split(':')[0], +time.split(':')[1]);
}
document.getElementById('f-cal').addEventListener('ts.calendar.select', combine);
document.getElementById('f-time').addEventListener('ts.timepicker.change', combine);
```

## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-timepicker` | `<input>` | Init hook. The host must be an input. Its value is read as the starting time |
| `data-plugin-options` | Host | JSON options |
| `.manual` | Host | Excludes the element from auto-init |
| `disabled` | Host | Respected |
| `aria-label` | Host | Used as the field's name when no `<label for>` exists |

### Generated structure

```html
<div class="ts-tp">
    <input type="hidden" id="publish_time" name="publish_time" value="08:30">   <!-- the original -->
    <div class="ts-tp-field">
        <span class="ts-tp-icon">…</span>
        <input class="ts-tp-input" type="text" role="combobox" aria-haspopup="dialog" aria-expanded="false" …>
        <button class="ts-tp-toggle" type="button" tabindex="-1" aria-label="Choose a time">…</button>
    </div>
    <div class="ts-tp-pop" role="dialog" aria-label="Choose a time">
        <div class="ts-tp-cols">
            <div class="ts-tp-col" role="listbox" aria-label="Hours" tabindex="0">
                <div class="ts-tp-item" role="option" data-v="8" aria-selected="true">08</div> …
            </div>
            <div class="ts-tp-col" …>minutes</div>
            <div class="ts-tp-col" …>AM / PM (12 hour only)</div>
        </div>
        <div class="ts-tp-foot"><button class="ts-tp-link ts-tp-now">Now</button><button class="ts-tp-link ts-tp-done">Done</button></div>
    </div>
</div>
```

## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `format` | `string` | `'auto'` | `'12'`, `'24'`, or `'auto'` to follow the locale |
| `locale` | `string` | `''` | Locale used by `'auto'` |
| `minuteStep` | `number` | `5` | Minutes between entries in the popover (1 to 30) |
| `defaultTime` | `string` | `'09:00'` | Used for the parts you have not chosen yet, when the field is empty |
| `placeholder` | `string` | `'Time'` | Shown when empty |
| `ariaLabel` | `string` | `'Time'` | Field name when there is no label |
| `block` | `boolean` | `false` | Fill the width of the parent |
| `inline` | `boolean` | `false` | Show the columns in the page instead of a popover |
| `showNow` | `boolean` | `true` | A "Now" link |
| `openOnClick` | `boolean` | `true` | Clicking the field opens the popover |
| `labels` | `object` | `choose, hours, minutes, period, am, pm, now, done` | Text, for translation |
| `onChange` | `function` | `null` | `function (value) {}` with the `HH:mm` value |

`format`, `inline` and `minuteStep` are read when the instance is built. To change them, `destroy()` and initialize again.

## Public API

```js
const tp = $('#publish_time').data('__pluginTimePicker');
```

| Method | Returns | Description |
| - | - | - |
| `getValue()` | `string` | `"08:30"`, or `""` when empty |
| `getTime()` | `object \| null` | `{ hour: 8, minute: 30 }` |
| `setValue(v, silent)` | `this` | `"20:15"`, `"8:15pm"` or `{ hour, minute }`. `""` clears. `silent` skips the events |
| `setNow(source)` | `this` | The current time |
| `open()`, `close()`, `toggle()` | `this` | The popover |
| `enable()`, `disable()` | `this` | Toggle the field |
| `destroy()` | `this` | Restore the original input |

`PluginTimePicker.parse(text)` is a static helper that returns `{ hour, minute }` or `null`. The jQuery bridge accepts a method name: `$('#publish_time').themestrapPluginTimePicker('setValue', '15:45')`.

> Setting the hidden input's value with `.val()` does not update the visible field. Use `setValue()`.

## Events

Native events, bubbling, dispatched on the **original** input.

| Event | `detail` | When |
| - | - | - |
| `input`, `change` | none | After every change |
| `ts.timepicker.change` | `{ instance, value, hour, minute, display, source, previousValue }` | `source` is `'popover'`, `'typing'`, `'keyboard'`, `'now'` or `'api'` |
| `ts.timepicker.open`, `ts.timepicker.close` | `{ instance }` | The popover |

Typing applies when you leave the field or press Enter.

> Use `addEventListener` for the `ts.timepicker.*` events. jQuery reads the dots as namespaces, so `$el.on('ts.timepicker.change', …)` never fires. The ordinary `change` event works with jQuery.

## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-tp-h` | `2.45rem` | same | Field height |
| `--ts-tp-bg` | `#ffffff` | `rgba(255,255,255,.03)` | Field background |
| `--ts-tp-border` | `rgba(0,0,0,.18)` | `rgba(255,255,255,.14)` | Borders |
| `--ts-tp-border-focus` | `#00a89f` | `#00c7be` | Focus border |
| `--ts-tp-focus-ring` | `0 0 0 3px rgba(0,168,159,.20)` | tinted | Focus ring |
| `--ts-tp-radius` | `7px` | same | Field corners |
| `--ts-tp-text`, `--ts-tp-muted` | `#1f2937`, 55% | `#d5dfeb`, 55% | Text and placeholder |
| `--ts-tp-pop-bg` | `#ffffff` | `#0e2238` | Popover background |
| `--ts-tp-hover` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.08)` | Item hover |
| `--ts-tp-accent`, `--ts-tp-accent-text` | `#00a89f`, `#04211f` | `#00c7be`, `#04211f` | Selected item |
| `--ts-tp-shadow` | soft drop shadow | stronger | Popover shadow |

Theme resolution follows the standard three tiers. To match `PluginCalendar` and the rest of a page, set the tokens on `:root`.

## Keyboard Navigation

In the field:

| Key | Action |
| - | - |
| `ArrowUp`, `ArrowDown` | Change the minutes by `minuteStep` (wraps past midnight) |
| `Shift + ArrowUp`, `Shift + ArrowDown` | Change the hour |
| `Alt + ArrowDown` | Open the popover |
| `Enter` | Apply the typed text (and close the popover) |
| `Escape` | Close the popover |

In the popover:

| Key | Action |
| - | - |
| `ArrowUp`, `ArrowDown` | Previous and next value in the focused column |
| `Home`, `End` | First and last value |
| `ArrowLeft`, `ArrowRight` | Move between columns |
| `Enter`, `Escape` | Close and return to the field |
| `Tab` | Moves from the field into the columns |

## ARIA Wiring

| Element | Attributes |
| - | - |
| Visible field | `role="combobox"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, named by its `<label>` |
| Popover | `role="dialog"`, `aria-label` |
| Columns | `role="listbox"` with an `aria-label` (Hours, Minutes, AM or PM) |
| Items | `role="option"`, `aria-selected` |

Pointer presses inside the popover do not take focus away from the field, so typing and picking can be mixed freely.

## Recipes

### 24 hour, every 15 minutes

```js
$('#start').themestrapPluginTimePicker({ format: '24', minuteStep: 15 });
```

### Always show the picker

```js
$('#alarm').themestrapPluginTimePicker({ inline: true, format: '12' });
```

### Translate the labels

```js
$('#t').themestrapPluginTimePicker({
    format: '24',
    labels: { choose: 'Heure', hours: 'Heures', minutes: 'Minutes', now: 'Maintenant', done: 'OK' }
});
```

### Read the value

```js
document.getElementById('publish_time').addEventListener('ts.timepicker.change', function (e) {
    console.log(e.detail.value);     // "20:15"  (always 24 hour)
    console.log(e.detail.display);   // "8:15 PM"
});
```

## Common Pitfalls

**`$('#id').val('09:00')` does not change what I see.** The visible field is separate from the hidden original. Use `setValue('09:00')`.

**The server receives `8:30 PM`.** It does not: the hidden input always holds `08:30`. Check that you read the original input and not the visible `-input` field, which has no `name`.

**The popover is cut off.** It is `position: fixed` and should not be. A transformed ancestor (`transform`, `filter`) becomes the reference for fixed elements; move the field out of it.

**`$el.on('ts.timepicker.change')` never fires.** Use `addEventListener`, or the plain `change` event.

### Diagnostic checklist

1. Is jQuery loaded before the plugin file?
2. Does `$('#id').data('__pluginTimePicker')` return an instance (on the original input)?
3. Is `<style id="ts-timepicker-styles">` in the head?
4. Does the input sit inside a `.ts-tp` wrapper with exactly one `.ts-tp-pop`?
