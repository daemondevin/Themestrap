# PluginContextMenu

A right-click context menu with nested sub-menus, separators, group labels, keyboard navigation, dark mode, smart viewport-edge detection, and a public API for swapping items at runtime with zero dependencies beyond jQuery.

**File:** `themestrap.plugin.contextmenu.js`  
**jQuery method:** `$.fn.themestrapPluginContextMenu`  
**Instance key:** `__pluginContextMenu`  
**Data attribute:** `data-plugin-context-menu`  

---

## Overview

- Opens on **right-click** (`contextmenu` event); optionally on **long-press** (mobile).
- Menu is portaled to `<body>` and positioned with `position:fixed` — never clips inside an `overflow:hidden` ancestor.
- Flips left/up automatically when it would overflow the viewport edge.
- Scale + opacity enter transition anchored to the opening corner via CSS custom property `--ts-ctx-origin-x/y`.
- **Mutual exclusion** — opening one menu closes all other open context menus on the page.
- Full keyboard support: `⏶` `⏷` `⏵` `⏴` `Enter` `Esc` `Tab`.
- Sub-menus open on hover or `⏵`; close on `⏴` or mouse-out (with 120 ms grace delay for mouse travel).
- CSS injected lazily once per page via `STYLE_ID` guard.

---

## Quick Start

```html
<!-- 1. Include plugin after jQuery -->
<script src="js/components/themestrap.plugin.contextmenu.js"></script>

<!-- 2. Mark your trigger element -->
<div id="my-area">Right-click me</div>

<!-- 3. Initialise -->
<script>
$('#my-area').themestrapPluginContextMenu({
  items: [
    { label: 'Cut',   icon: '✂️', shortcut: '⌘X', action: () => {} },
    { label: 'Copy',  icon: '📋', shortcut: '⌘C', action: () => {} },
    { label: 'Paste', icon: '📌', shortcut: '⌘V', action: () => {} },
    { type: 'separator' },
    { label: 'Delete', icon: '🗑', destructive: true, action: () => {} }
  ]
});
</script>
```

---

## HTML / Data-attribute Usage

When `themestrap.init.js` is loaded, elements with `data-plugin-context-menu` are auto-initialised as they enter the viewport. Pass options as JSON in `data-plugin-options`:

```html
<div
  data-plugin-context-menu
  data-plugin-options='{
    "dark": false,
    "items": [
      { "type": "label", "text": "Actions" },
      { "label": "Edit",   "icon": "✏️",  "shortcut": "⌘E" },
      { "label": "Delete", "icon": "🗑", "destructive": true }
    ]
  }'>
  Right-click this element
</div>
```

> [!NOTE]  
> `action` callbacks cannot be serialised in HTML data attributes. Use the JavaScript API when you need click handlers. For data-attribute-only usage, listen for the `ts-ctx-open` jQuery event on the element and wire up your logic there.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | Array | `[]` | Array of item definition objects. See [Item Schema](#item-schema). |
| `dark` | Boolean | `false` | Adds `.ts-ctx-dark` to the menu — applies a dark color scheme including to any sub-menus. |
| `ariaLabel` | String | `'Context menu'` | Sets `aria-label` on the menu container. |
| `triggerEvent` | String \| null | `null` | Pass `'longpress'` to also open on mobile touch-and-hold. Right-click is always active. |
| `longpressDelay` | Number | `600` | Milliseconds before longpress fires. Only used with `triggerEvent: 'longpress'`. |
| `mutualExclusion` | Boolean | `true` | Opening any context menu closes all other open context menus on the page. |
| `onOpen` | Function \| null | `null` | Callback fired when menu opens. Receives `(instance)`. `this` is the trigger element. |
| `onClose` | Function \| null | `null` | Callback fired when menu closes for any reason. Receives `(instance)`. |

---

## Item Schema

Each entry in the `items` array is a plain object. Three distinct shapes are supported.

### 1. Action item (default)

```js
{
  label:       'Save',          // required — display text
  action:      (e, item) => {}, // required — click handler; menu closes after
  icon:        '💾',            // optional — HTML/emoji string shown left of label
  shortcut:    '⌘S',           // optional — hint string shown right-aligned
  disabled:    false,           // optional — greyed out, not clickable
  destructive: false            // optional — red coloring (danger action)
}
```

### 2. Sub-menu trigger

```js
{
  label: 'Share',
  icon:  '🔗',
  items: [                      // nested array — same schema recursively
    { label: 'Copy Link', action: () => {} },
    { label: 'Email…',    action: () => {} }
  ]
}
```

A chevron arrow (`›`) is added automatically to any item that has a nested `items` array. `action` is ignored when `items` is present.

### 3. Non-interactive items

```js
// Horizontal separator
{ type: 'separator' }

// Group label (uppercase, muted)
{ type: 'label', text: 'File Actions' }
```

---

## Sub-menus

Nest an `items` array inside any item to create a sub-menu. Sub-menus open on hover with a 120 ms hide delay to allow mouse travel, or via the `⏵` key.

```js
$('#el').themestrapPluginContextMenu({
  items: [
    {
      label: 'Share', icon: '🔗',
      items: [
        { label: 'Copy Link', shortcut: '⌘L', action: () => {} },
        { label: 'Email…',                     action: () => {} },
        { type: 'separator' },
        { label: 'More apps…',                 action: () => {} }
      ]
    },
    { label: 'Rename', icon: '✏️', action: () => {} }
  ]
});
```

Sub-menus flip to the left side if they would overflow the right edge of the viewport.

---

## Dark Mode

Pass `dark: true` to apply the dark color scheme. Sub-menus inherit the same setting.

```js
$('#canvas').themestrapPluginContextMenu({
  dark: true,
  items: [
    { label: 'Edit',      icon: '✏️', action: () => {} },
    { label: 'Duplicate', icon: '⧉',  action: () => {} },
    { type: 'separator' },
    { label: 'Delete',    icon: '🗑', destructive: true, action: () => {} }
  ]
});
```

If you are using **PluginDarkMode**, this will automatically switch to dark mode when that plugin is enabled. If you want to control it yourself, you can listen for `ts-dark-mode-changed` or use your perfered mechanism and call `setItems()` to rebuild with the updated flag:

```js
$(document).on('ts-dark-mode-changed', function(e, isDark) {
  const inst = $('#canvas').data('__pluginContextMenu');
  inst.options.dark = isDark;
  inst.setItems(inst.options.items);
});
```

---

## Dynamic Items

Call `setItems(newItems)` on the instance to replace the menu's item list at runtime without destroying and re-creating the plugin.

```js
// Init
$('#el').themestrapPluginContextMenu({ items: viewItems });

// Later — swap items
const inst = $('#el').data('__pluginContextMenu');
inst.setItems(editItems);
```

Use this for context-sensitive menus that change based on selection state, user permissions, or application mode.

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `⏶` / `⏷` | Move focus between enabled items. Disabled items are skipped. |
| `⏵` or `Enter` on sub-menu trigger | Open sub-menu and focus its first item. |
| `⏴` | Close the current sub-menu. |
| `Enter` on action item | Fire the item's action and close the menu. |
| `Esc` | Close the menu (and any open sub-menu). |
| `Tab` | Close the menu; moves focus out of the menu into the page. |

Focus is automatically moved to the first enabled item when the menu opens.

---

## jQuery Events

Events are triggered on the **trigger element**, not on the menu DOM node.

| Event | Extra data | When |
|---|---|---|
| `ts-ctx-open` | Plugin instance | Fired immediately after the menu becomes visible. |
| `ts-ctx-close` | Plugin instance | Fired whenever the menu closes — click-outside, `Esc`, `Tab`, or programmatic `.close()`. |

```js
$('#el')
  .on('ts-ctx-open',  (e, inst) => console.log('opened', inst))
  .on('ts-ctx-close', (e, inst) => console.log('closed', inst))
  .themestrapPluginContextMenu({ items: [...] });
```

You can also pass `onOpen` and `onClose` as option callbacks — see [Options](#options).

---

## Public API

Retrieve the instance via `.data('__pluginContextMenu')`:

```js
const inst = $('#el').data('__pluginContextMenu');
```

| Method | Returns | Description |
|---|---|---|
| `setItems(items)` | `this` | Replaces the item list and rebuilds the menu DOM. Safe to call while the menu is closed. |
| `close()` | `this` | Closes the menu programmatically. No-op if already closed. Fires `ts-ctx-close` and `onClose`. |
| `destroy()` | `this` | Closes the menu, removes it from the DOM, unbinds all namespaced listeners, and removes the instance from `.data()`. |

```js
inst.close();                              // programmatic close
inst.setItems([{ label: 'New', action: () => {} }]);  // swap items
inst.destroy();                            // full teardown
```

---

## Init.js Wiring

Add the following block to `themestrap.init.js`:

```js
// Context Menu
if ($.isFunction($.fn['themestrapPluginContextMenu'])
    && $('[data-plugin-context-menu]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-context-menu]:not(.manual)',
    'themestrapPluginContextMenu'
  );
}
```

---

## Accessibility

- Menu container has `role="menu"` and an `aria-label` (configurable via `ariaLabel`).
- Each interactive item has `role="menuitem"`.
- Disabled items receive `tabindex="-1"` and are excluded from arrow-key navigation.
- `Tab` closes the menu rather than cycling through its items.
- `user-select: none` prevents accidental text selection during keyboard navigation.

> [!NOTE]  
> The native `contextmenu` event is suppressed on the trigger element (`e.preventDefault()`) to replace the browser default menu. Ensure your custom menu provides equivalent functionality (copy, paste, etc.) wherever users expect these browser-native actions.