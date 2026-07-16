# Dialog Guide

Themestrap's accessible modal dialog — focus-trapped, scroll-locked, Escape-to-close, backdrop-click-to-close, CSS entrance/exit animations, and correct ARIA wiring.

## [How It **Works**](#how-it-works)

PluginDialog manages a single modal instance. It handles the full accessibility contract: focus is trapped inside the panel while open, the element that triggered the open is remembered and refocused on close, `aria-modal` and `aria-labelledby` are wired automatically, and the page scrollbar is locked so the background can't drift.

### Open lifecycle

1. Panel receives `.ts-dialog--open` + the entrance animation class.
2. `<body>` receives `ts-dialog-scroll-lock` (sets `overflow: hidden`).
3. Focus moves to the first focusable element inside `[data-dialog-panel]`, or the panel itself.
4. A `focustrap` keydown handler prevents Tab/Shift-Tab from leaving the panel.

### Close lifecycle

1. Exit animation class applied; plugin waits for `animationend` (or `animationDuration` timeout).
2. Panel hidden, scroll lock removed.
3. Focus returned to the element that triggered the open.
4. `dialog:close` event fires.

### Multiple open dialogs

A stack of open dialogs is maintained. Opening a second dialog while one is open pushes the first to the background stack. Closing the top-most dialog pops the stack and restores focus to the previous one.

---

## [Quick **Start**](#quick-start)

```html
<!-- Trigger — anywhere in the DOM -->
<button data-dialog-open="confirm-dialog" class="btn btn-primary">
  Open Dialog
</button>

<!-- Dialog root -->
<div data-plugin-dialog
     id="confirm-dialog"
     data-plugin-options='{"closeOnBackdrop": true, "animationIn": "fadeInDown"}'>

  <div data-dialog-backdrop></div>

  <div data-dialog-panel
       role="dialog"
       aria-modal="true"
       aria-labelledby="dlg-title">

    <button data-dialog-close aria-label="Close dialog">×</button>

    <h2 id="dlg-title">Confirm Action</h2>
    <p>Are you sure you want to delete this item? This cannot be undone.</p>

    <div class="dialog-footer">
      <button data-dialog-close class="btn btn-secondary">Cancel</button>
      <button id="confirm-btn" class="btn btn-danger">Delete</button>
    </div>
  </div>

</div>
```

### Init

```js
// Manual
$('[data-plugin-dialog]').themestrapPluginDialog();

// Auto-init (themestrap.init.js)
if ($.isFunction($.fn['themestrapPluginDialog'])
    && $('[data-plugin-dialog]').length) {
  $('[data-plugin-dialog]:not(.manual)').each(function () {
    const opts = themestrap.fn.getOptions($(this).data('plugin-options'));
    $(this).themestrapPluginDialog(opts);
  });
}
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeOnBackdrop` | bool | `true` | Close when `[data-dialog-backdrop]` is clicked. |
| `closeOnEscape` | bool | `true` | Close on Escape key. |
| `backdrop` | bool | `true` | Require a `[data-dialog-backdrop]` element — warns if absent. |
| `animationIn` | string | `'fadeIn'` | CSS animation class for the panel entrance. |
| `animationOut` | string | `'fadeOut'` | CSS animation class for the panel exit. |
| `animationDuration` | number | `300` | Fallback timeout in ms if `animationend` never fires. |
| `onOpen` | function | `null` | Callback after the panel is visible: `fn(instance)`. |
| `onClose` | function | `null` | Callback after the panel is hidden: `fn(instance)`. |

---

## [Data **Attributes**](#attributes)

| Attribute | Element | Notes |
|-----------|---------|-------|
| `data-plugin-dialog` | root | Plugin mount point. Give it an `id` for triggers to target. |
| `data-dialog-backdrop` | div | The dimmed overlay behind the panel. |
| `data-dialog-panel` | div | The visible dialog box. Receives `role="dialog"`, `aria-modal`, focus trap. |
| `data-dialog-close` | any | Any element that should close the dialog on click. |
| `data-dialog-open="id"` | any | Any element that opens the dialog with matching `id`. |

---

## [Instance **API**](#instance-api)

```js
const dlg = $('#confirm-dialog').data('__pluginDialog');

dlg.open();    // open programmatically
dlg.close();   // close programmatically
dlg.toggle();  // flip
dlg.isOpen();  // => true | false
dlg.destroy(); // unbind everything
```

### Events

| Event | Arguments | Fires |
|-------|-----------|-------|
| `dialog:open` | `(e, instance)` | After the entrance animation starts. |
| `dialog:close` | `(e, instance)` | After the exit animation completes. |

```js
$('#confirm-dialog')
  .on('dialog:open',  (e, inst) => console.log('dialog open'))
  .on('dialog:close', (e, inst) => console.log('dialog closed'));
```

---

## [Recipe **Cookbook**](#recipes)

#### Confirmation dialog with result

```js
const dlg = $('#confirm-dialog').data('__pluginDialog');

$('#delete-btn').on('click', () => dlg.open());

$('#confirm-btn').on('click', () => {
  deleteItem(currentId);
  dlg.close();
});
```

#### Async content on open

```js
$('#data-dialog').on('dialog:open', async (e, inst) => {
  const html = await fetch('/api/preview').then(r => r.text());
  $(inst.$panel).find('.dialog-body').html(html);
});
```

#### Auto-open on page load

```js
$(function () {
  if (shouldShowWelcome()) {
    $('#welcome-dialog').data('__pluginDialog').open();
  }
});
```

---

## [Common **Pitfalls**](#pitfalls)

**Missing `id` on the root.** Triggers use `data-dialog-open="<id>"` to find their dialog. Without an `id`, triggers won't work (the plugin still works programmatically).

**Focus trap relies on visible focusable elements.** The trap queries `a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])` that are not `disabled` or `hidden`. If the panel contains no focusable elements, the panel itself receives `tabindex="-1"` and focus moves there.

**Scroll lock on mobile.** `overflow: hidden` on `<body>` doesn't prevent scrolling the iOS rubber-band / momentum scroll in all browsers. Add `-webkit-overflow-scrolling: touch` on the panel wrapper and `position: fixed; width: 100%` on body if iOS bounce is a problem.

**Two dialogs open simultaneously.** The plugin supports a dialog stack, but both dialogs must be independent `[data-plugin-dialog]` instances (separate IDs). Nesting one dialog inside another's `[data-dialog-panel]` is not supported.
