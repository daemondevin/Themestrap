# PluginToolbar

An accessible toolbar that provides a `role="toolbar"` container with roving-tabindex keyboard navigation, `type="single"` and `type="multiple"` toggle groups, separator elements, link items, RTL support, size modifiers, and a dark theme — all driven by `data-*` attributes with zero external dependencies beyond jQuery.

---

## Quick Start

```html
<!-- 1. Markup -->
<div data-plugin-toolbar aria-label="Document actions">

  <button data-toolbar-button data-toolbar-value="save">Save</button>
  <button data-toolbar-button data-toolbar-value="export">Export</button>

  <div data-toolbar-separator></div>

  <div data-toolbar-toggle-group data-toolbar-type="single">
    <button data-toolbar-toggle-item data-toolbar-value="left"  data-toolbar-pressed="true">Left</button>
    <button data-toolbar-toggle-item data-toolbar-value="center">Center</button>
    <button data-toolbar-toggle-item data-toolbar-value="right">Right</button>
  </div>

</div>

<!-- 2. Scripts (after jQuery + themestrap.js) -->
<script src="js/components/themestrap.plugin.toolbar.js"></script>

<!-- 3. Init (or let init.js handle it automatically) -->
<script>
$('[data-plugin-toolbar]').themestrapPluginToolbar();
</script>
```

---

## Markup Reference

### Root

```html
<div data-plugin-toolbar
     data-plugin-options='{"orientation":"horizontal","loop":true}'
     aria-label="My toolbar">
  ...
</div>
```

The root element receives `role="toolbar"` and `aria-orientation`. Supply your own `aria-label` directly on the element — the plugin only writes its default `"Toolbar"` if no label is already present.

### Button

```html
<button data-toolbar-button data-toolbar-value="save">Save</button>
```

A regular action button. `data-toolbar-value` is passed to `toolbar:button` events and `onButton` callbacks. The `type="button"` attribute is injected automatically on `<button>` elements.

### Link

```html
<a data-toolbar-link href="/help" data-toolbar-value="help">Help</a>
```

An anchor styled identically to a button. Fires `toolbar:link` on click. Keyboard navigation treats it as a peer of buttons and toggle items.

### Toggle Group

```html
<div data-toolbar-toggle-group
     data-toolbar-type="single"
     data-toolbar-group-label="Text alignment">

  <button data-toolbar-toggle-item data-toolbar-value="left" data-toolbar-pressed="true">Left</button>
  <button data-toolbar-toggle-item data-toolbar-value="center">Center</button>
  <button data-toolbar-toggle-item data-toolbar-value="right">Right</button>

</div>
```

| Attribute | Required | Description |
|---|---|---|
| `data-toolbar-toggle-group` | Yes | Marks the group container. Receives `role="group"`. |
| `data-toolbar-type` | No | `"single"` (default) or `"multiple"`. |
| `data-toolbar-group-label` | No | Sets `aria-label` on the group for screen readers. |

**`type="single"`** — only one item can be active at a time. Activating a new item deselects the previous one. Set `allowDeselect: true` to let the user click the active item to deselect it.

**`type="multiple"`** — each item toggles independently. Any combination (including none) can be active simultaneously.

### Toggle Item

```html
<button data-toolbar-toggle-item
        data-toolbar-value="bold"
        data-toolbar-pressed="true">
  Bold
</button>
```

| Attribute | Description |
|---|---|
| `data-toolbar-toggle-item` | Marks this as a toggleable item. |
| `data-toolbar-value` | String identifier passed to events and `getValues()`. |
| `data-toolbar-pressed="true"` | Pre-selects this item on init. The plugin sets `aria-pressed` to match. |

### Separator

```html
<div data-toolbar-separator></div>
```

A thin dividing line. Receives `role="separator"` and `aria-orientation` automatically — vertical in a horizontal toolbar, horizontal in a vertical one.

### Disabled items

```html
<button data-toolbar-button data-toolbar-value="paste" data-toolbar-disabled="true">Paste</button>
```

Any item (`button`, `link`, or `toggle-item`) accepts `data-toolbar-disabled="true"`. Disabled items receive `aria-disabled="true"` and are skipped by roving-tabindex keyboard navigation.

### Icon-only items

Add the class `ts-tb-icon` to collapse padding and produce a square button:

```html
<button class="ts-tb-icon" data-toolbar-button data-toolbar-value="undo" title="Undo">
  <svg>...</svg>
</button>
```

Always supply a `title` or `aria-label` on icon-only items for accessibility.

---

## Options

Pass via `data-plugin-options` JSON or as the JS argument:

```js
$('[data-plugin-toolbar]').themestrapPluginToolbar({
    orientation  : 'horizontal',
    loop         : true,
    ariaLabel    : 'Editor toolbar',
    onToggle(value, pressed, groupEl) {
        console.log(value, pressed);
    }
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `orientation` | String | `"horizontal"` | `"horizontal"` or `"vertical"`. Controls arrow-key axis and separator direction. |
| `loop` | Boolean | `true` | Arrow-key navigation wraps at the edges of the toolbar. |
| `dir` | String | `"ltr"` | `"ltr"` or `"rtl"`. Flips ← → mapping so arrow keys feel natural in right-to-left layouts. |
| `ariaLabel` | String | `"Toolbar"` | Written to `aria-label` only when the element has none already. |
| `size` | String | `null` | `null`, `"sm"`, or `"lg"`. Adds `.ts-toolbar--sm` / `.ts-toolbar--lg`. |
| `dark` | Boolean | `false` | Forces the dark colour scheme. Equivalent to adding `.ts-toolbar--dark` in markup. |
| `full` | Boolean | `false` | Stretches the toolbar to 100% width with item wrapping. |
| `allowDeselect` | Boolean | `false` | In `type="single"` groups, allow clicking the active item to clear the selection. |
| `onToggle` | Function | `null` | `fn(value, pressed, groupEl)` — called after a toggle item changes state. |
| `onButton` | Function | `null` | `fn(value, buttonEl)` — called when a regular button is clicked. |
| `onLink` | Function | `null` | `fn(value, linkEl)` — called when a link item is clicked. |

---

## Keyboard Navigation

The plugin implements the [WAI-ARIA Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) with roving tabindex.

| Key | Action |
|---|---|
| `Tab` | Move browser focus **into** the toolbar. Focus lands on the last-focused item (or the first on the initial visit). |
| `Tab` (while inside) | Move focus **out** of the toolbar to the next focusable element on the page. |
| `→` (horizontal) | Move to the next item. Wraps to first when `loop: true`. |
| `←` (horizontal) | Move to the previous item. Wraps to last when `loop: true`. |
| `↓` (vertical) | Move to the next item. |
| `↑` (vertical) | Move to the previous item. |
| `Home` | Move to the first item. |
| `End` | Move to the last item. |
| `Space` / `Enter` | Activate the focused button or toggle item (native browser behavior on `<button>`). |
| `Escape` | No default action inside the toolbar — handled by the outer page if needed. |

Disabled items are excluded from the navigation cycle. In RTL mode (`dir: "rtl"`), ← and → are swapped.

---

## Public API

### Accessing the instance

```js
const tb = $('#my-toolbar').data('__pluginToolbar');
```

### Methods

| Method | Returns | Description |
|---|---|---|
| `getValues(groupOrSelector?)` | `string \| string[] \| null` | Get the current selection. Single groups return the value string or `null`. Multiple groups return an array of value strings. Defaults to the first group when no argument is given. |
| `setValue(value, groupOrSelector?)` | `this` | Programmatically activate a `type="single"` toggle item by its `data-toolbar-value`. Triggers a click which fires all normal events. |
| `setValues(values[], groupOrSelector?)` | `this` | Set multiple active items on a `type="multiple"` group. Clears first, then applies the array without firing events. |
| `clearGroup(groupOrSelector?)` | `this` | Deselect all items in the target group. |
| `disable(selectorOrValue)` | `this` | Disable items matching the given `data-toolbar-value` string or CSS selector. Updates `aria-disabled` and roving tabindex. |
| `enable(selectorOrValue)` | `this` | Re-enable previously disabled items. |
| `focus()` | `this` | Move browser focus to the current roving-tabindex item in the toolbar. |
| `destroy()` | `this` | Full teardown. Restores original inner HTML, removes all event handlers, clears instance data, and removes the injected stylesheet when no other toolbar instances remain on the page. |

---

## Events

Events fire on the **root toolbar element**. Use jQuery `.on()` or native `addEventListener`.

```js
const $tb = $('#my-toolbar');

$tb.on('toolbar:toggle', function(e, value, pressed, $item, $group, instance) {
    console.log('toggle', value, pressed);
});

$tb.on('toolbar:button', function(e, value, $btn, instance) {
    console.log('button', value);
});

$tb.on('toolbar:link', function(e, value, $link, instance) {
    console.log('link', value);
});
```

Native `CustomEvent` is also dispatched on the element for non-jQuery listeners:

```js
document.getElementById('my-toolbar').addEventListener('toolbar:toggle', (e) => {
    const { value, pressed, item, group } = e.detail;
});
```

| Event | jQuery args | `detail` keys | Fires when… |
|---|---|---|---|
| `toolbar:toggle` | `value, pressed, $item, $group, instance` | `value, pressed, item, group, instance` | A toggle item changes state (click or programmatic). |
| `toolbar:button` | `value, $btn, instance` | `value, button, instance` | A `data-toolbar-button` is clicked. |
| `toolbar:link` | `value, $link, instance` | `value, link, instance` | A `data-toolbar-link` is clicked. |

---

## Theming with CSS Variables

All visual properties are exposed as CSS custom properties on the root element. Override them per-instance or globally:

```css
/* Teal accent for a specific toolbar */
#my-toolbar {
    --ts-tb-on-bg:       #2ab8c8;
    --ts-tb-on-fg:       #0a1929;
    --ts-tb-on-hover-bg: #1e9aaa;
    --ts-tb-focus-ring:  #2ab8c8;
}
```

### Full token reference

| Token | Default (light) | Controls |
|---|---|---|
| `--ts-tb-bg` | `#f4f6f8` | Toolbar background |
| `--ts-tb-border` | `rgba(0,0,0,.1)` | Toolbar border |
| `--ts-tb-shadow` | `0 1px 3px …` | Toolbar box shadow |
| `--ts-tb-pad` | `4px` | Inner padding of the toolbar container |
| `--ts-tb-gap` | `2px` | Gap between top-level items |
| `--ts-tb-radius` | `8px` | Toolbar border-radius |
| `--ts-tb-item-h` | `34px` | Item height |
| `--ts-tb-item-px` | `10px` | Item horizontal padding |
| `--ts-tb-item-radius` | `5px` | Item border-radius |
| `--ts-tb-item-fg` | `#374151` | Item text color |
| `--ts-tb-item-hover-bg` | `rgba(0,0,0,.06)` | Item hover background |
| `--ts-tb-item-hover-fg` | `#111827` | Item hover text color |
| `--ts-tb-item-active-bg` | `rgba(0,0,0,.09)` | Click flash background |
| `--ts-tb-item-font` | `0.875rem` | Item font size |
| `--ts-tb-on-bg` | `#e8672a` | Pressed/active toggle background |
| `--ts-tb-on-fg` | `#fff` | Pressed/active toggle text |
| `--ts-tb-on-hover-bg` | `#d2541b` | Pressed toggle hover background |
| `--ts-tb-focus-ring` | `#e8672a` | Focus outline color |
| `--ts-tb-focus-offset` | `2px` | Focus outline offset |
| `--ts-tb-sep-color` | `rgba(0,0,0,.12)` | Separator color |
| `--ts-tb-sep-size` | `1px` | Separator thickness |
| `--ts-tb-sep-margin` | `4px` | Separator block/inline margin |
| `--ts-tb-group-bg` | `rgba(0,0,0,.05)` | Toggle group container background |
| `--ts-tb-group-radius` | `6px` | Toggle group border-radius |
| `--ts-tb-group-gap` | `1px` | Gap between items inside a group |
| `--ts-tb-disabled-opacity` | `.4` | Opacity of disabled items |

Dark mode overrides all color tokens automatically when `html.dark` is present. Force the dark palette with `.ts-toolbar--dark` on the root element or `dark: true` in options. Opt a specific toolbar out of auto-dark with `.ts-toolbar--light`.

---

## Stylesheet Lifecycle

The plugin injects its `<style id="ts-toolbar-styles">` tag lazily on first `build()` call. It tracks active instances via `PluginToolbar.instances`. When `destroy()` brings the count to zero the stylesheet is removed from the `<head>` automatically — important for single-page applications where the toolbar may be mounted and unmounted repeatedly.

---

## Init.js Wiring

Add to `themestrap.init.js` for page-wide auto-initialization:

```js
if ($.isFunction($.fn['themestrapPluginToolbar']) && $('[data-plugin-toolbar]').length) {
    themestrap.fn.intObsInit('[data-plugin-toolbar]:not(.manual)', 'themestrapPluginToolbar');
}
```

Add `.manual` to any toolbar that should be initialized by hand:

```html
<div data-plugin-toolbar class="manual" id="my-tb"></div>
```

```js
$('#my-tb').themestrapPluginToolbar({ ariaLabel: 'Custom toolbar', dark: true });
```

---

## MODX Snippet

```php
<?php
/**
 * tsToolbar snippet
 * Renders a Themestrap Toolbar from a JSON items definition.
 *
 * Properties:
 *   &items    — JSON array of item definitions (required)
 *   &options  — JSON options for data-plugin-options (default: '{}')
 *   &label    — aria-label on the root element (default: 'Toolbar')
 *   &class    — extra CSS classes on the root element
 *
 * Item definition:
 *   { "type": "button", "value": "save", "label": "Save" }
 *   { "type": "link",   "value": "help", "label": "Help", "href": "/help" }
 *   { "type": "separator" }
 *   { "type": "toggle-group", "groupType": "single", "items": [
 *       { "value": "left", "label": "Left", "pressed": true },
 *       { "value": "center", "label": "Center" }
 *   ]}
 */

$itemsJson  = $modx->getOption('items',   $scriptProperties, '[]');
$optionsJson = $modx->getOption('options', $scriptProperties, '{}');
$label      = $modx->getOption('label',   $scriptProperties, 'Toolbar');
$class      = $modx->getOption('class',   $scriptProperties, '');

$items = json_decode($itemsJson, true);
if (empty($items) || !is_array($items)) return '';

$classList = trim('ts-toolbar-wrap ' . $class);
$out = '<div data-plugin-toolbar';
$out .= ' aria-label="' . htmlspecialchars($label) . '"';
if ($class) $out .= ' class="' . htmlspecialchars($class) . '"';
if ($optionsJson !== '{}') $out .= " data-plugin-options='" . $optionsJson . "'";
$out .= '>' . PHP_EOL;

foreach ($items as $item) {
    $type = $item['type'] ?? 'button';

    if ($type === 'separator') {
        $out .= '  <div data-toolbar-separator></div>' . PHP_EOL;
        continue;
    }

    if ($type === 'button') {
        $val   = htmlspecialchars($item['value'] ?? '');
        $label = htmlspecialchars($item['label'] ?? $val);
        $dis   = !empty($item['disabled']) ? ' data-toolbar-disabled="true"' : '';
        $out .= "  <button data-toolbar-button data-toolbar-value=\"{$val}\"{$dis}>{$label}</button>" . PHP_EOL;
        continue;
    }

    if ($type === 'link') {
        $val   = htmlspecialchars($item['value'] ?? '#');
        $href  = htmlspecialchars($item['href'] ?? '#');
        $label = htmlspecialchars($item['label'] ?? $val);
        $dis   = !empty($item['disabled']) ? ' data-toolbar-disabled="true"' : '';
        $out .= "  <a data-toolbar-link href=\"{$href}\" data-toolbar-value=\"{$val}\"{$dis}>{$label}</a>" . PHP_EOL;
        continue;
    }

    if ($type === 'toggle-group') {
        $groupType  = htmlspecialchars($item['groupType'] ?? 'single');
        $groupLabel = isset($item['groupLabel']) ? ' data-toolbar-group-label="' . htmlspecialchars($item['groupLabel']) . '"' : '';
        $out .= "  <div data-toolbar-toggle-group data-toolbar-type=\"{$groupType}\"{$groupLabel}>" . PHP_EOL;
        foreach ($item['items'] ?? [] as $ti) {
            $val     = htmlspecialchars($ti['value'] ?? '');
            $tiLabel = htmlspecialchars($ti['label'] ?? $val);
            $pressed = !empty($ti['pressed']) ? ' data-toolbar-pressed="true"' : '';
            $dis     = !empty($ti['disabled']) ? ' data-toolbar-disabled="true"' : '';
            $out .= "    <button data-toolbar-toggle-item data-toolbar-value=\"{$val}\"{$pressed}{$dis}>{$tiLabel}</button>" . PHP_EOL;
        }
        $out .= '  </div>' . PHP_EOL;
        continue;
    }
}

$out .= '</div>' . PHP_EOL;
return $out;
```

Call in a template or chunk:

```
[[tsToolbar?
  &label=`Editor toolbar`
  &options=`{"dark":true,"ariaLabel":"Editor toolbar"}`
  &items=`[
    {"type":"button","value":"save","label":"Save"},
    {"type":"separator"},
    {"type":"toggle-group","groupType":"multiple","items":[
      {"value":"bold","label":"Bold"},
      {"value":"italic","label":"Italic","pressed":true}
    ]}
  ]`
]]
```

---

## Recipes

### RTL toolbar

```html
<div data-plugin-toolbar data-plugin-options='{"dir":"rtl"}' dir="rtl">
  <button data-toolbar-button data-toolbar-value="a">أ</button>
  <button data-toolbar-button data-toolbar-value="b">ب</button>
  <div data-toolbar-toggle-group data-toolbar-type="single">
    <button data-toolbar-toggle-item data-toolbar-value="right" data-toolbar-pressed="true">يمين</button>
    <button data-toolbar-toggle-item data-toolbar-value="center">وسط</button>
    <button data-toolbar-toggle-item data-toolbar-value="left">يسار</button>
  </div>
</div>
```

### Full-width wrapped toolbar

```html
<div data-plugin-toolbar data-plugin-options='{"full":true}' style="width:100%">
  <button data-toolbar-button data-toolbar-value="new">New</button>
  <button data-toolbar-button data-toolbar-value="open">Open</button>
  <!-- items wrap automatically -->
</div>
```

### Sync two toolbars to the same state

```js
$('#toolbar-a, #toolbar-b').on('toolbar:toggle', function(e, value, pressed, $item, $group) {
    const peer = $(this).is('#toolbar-a') ? '#toolbar-b' : '#toolbar-a';
    const peerTb = $(peer).data('__pluginToolbar');
    if (!peerTb) return;
    const type = $group.data('ts-tb-type');
    if (type === 'single') {
        peerTb.setValue(value, $group.attr('data-toolbar-group-label'));
    }
});
```

### Programmatic init with callbacks

```js
$('#my-toolbar').themestrapPluginToolbar({
    ariaLabel : 'Format',
    onToggle(value, pressed, groupEl) {
        document.execCommand(value, false, null);
    },
    onButton(value) {
        if (value === 'save') saveDocument();
    }
});
```

### Listen and react to a single toggle group

```js
$('#my-toolbar').on('toolbar:toggle', function(e, value, pressed, $item, $group) {
    if ($group.attr('data-toolbar-group-label') !== 'Text alignment') return;
    document.querySelector('#editor').style.textAlign = value;
});
```

---

## Common Pitfalls

**Arrow keys do nothing**
Check that the root element has `role="toolbar"` (applied by the plugin). If the element already had a different `role` before init the plugin respects that and skips setting one — remove the conflicting attribute.

**Toggle group fires but selection does not visually change**
The `ts-toolbar__toggle-item--on` class and `aria-pressed` attribute are both set by the plugin's click handler. If you are calling `e.preventDefault()` on the click event before it reaches the toolbar root, the handler never fires. Remove the interception or call `tb.setValue()` directly instead.

**`setValues()` does not fire `toolbar:toggle`**
By design — `setValues()` is a silent bulk-set used for restoring state (e.g. from localStorage). To fire events use `tb.setValue()` for each value instead, which triggers a simulated click.

**Stylesheet survives after `destroy()`**
Only happens when another toolbar instance is still active. The stylesheet is shared; `ejectStyles()` only runs when `PluginToolbar.instances` reaches exactly zero. Confirm by checking `PluginToolbar.instances` in the console.

**Icon-only buttons have no accessible name**
Add `title="…"` or `aria-label="…"` to every `ts-tb-icon` button. Without a text label or accessible name, screen readers will announce the button without context.

**`getValues()` returns `null` for a multiple group**
`getValues()` returns `null` only for single groups with nothing selected. For multiple groups it returns an empty array `[]` when nothing is selected. Check for `Array.isArray(result) && result.length === 0` rather than `=== null`.