# PluginDialog Guide

**File:** `js/components/themestrap.plugin.dialog.js`  
**jQuery method:** `$.fn.themestrapPluginDialog`  
**Instance key:** `__pluginDialog`  
**Init strategy:** DOMReady `$().each()` — dialogs must be ready before any trigger fires.

## Over**view**

PluginDialog provides accessible, focus-trapped modal dialogs with a blurred backdrop, scroll-lock, and a suite of entrance/exit CSS animations. It wires `aria-labelledby` / `aria-describedby` automatically, handles Escape-to-close and Tab-trapping, and restores focus to the originating element on close.

The plugin is fully CSS-animation-driven; it defines its own keyframes (`fadeIn`, `fadeOut`, `fadeInDown`, `fadeOutUp`, `zoomIn`, `zoomOut`, etc.) and applies them to the panel element on open/close.

On mobile (`<576 px`) panels automatically become bottom sheets regardless of the chosen animation.

Themestrap's accessible modal dialog — focus-trapped, scroll-locked, Escape-to-close, backdrop-click-to-close, CSS entrance/exit animations, and correct ARIA wiring.

## How It **Works**

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

## Quick **Start**

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

## Mark**up**

### Minimum required

```html
<!-- Trigger (can live anywhere in the DOM) -->
<button data-dialog-open="confirm-dialog">Open</button>

<!-- Dialog root -->
<div data-plugin-dialog id="confirm-dialog">
  <div data-dialog-backdrop></div>
  <div data-dialog-panel>
    <h2 data-dialog-title>Confirm action</h2>
    <p data-dialog-description>Are you sure you want to proceed?</p>
    <button data-dialog-close>Cancel</button>
    <button data-dialog-close>Confirm</button>
  </div>
</div>
```

### With custom animation and size

```html
<div data-plugin-dialog id="large-dialog"
     data-plugin-options='{"animationIn": "zoomIn", "animationOut": "zoomOut"}'>
  <div data-dialog-backdrop></div>
  <div data-dialog-panel class="dialog-lg">
    <h2 data-dialog-title>Large dialog</h2>
    <p>Content here…</p>
    <button data-dialog-close>Close</button>
  </div>
</div>
```

## Data **Attributes**

| Attribute | Role |
|---|---|
| `data-plugin-dialog` | Marks the dialog root. Required for init. |
| `data-dialog-backdrop` | The dim overlay. Click-to-close is wired here when `closeOnBackdrop: true`. |
| `data-dialog-panel` | The visible content card. Animations and size modifiers apply here. |
| `data-dialog-title` | Auto-wired to `aria-labelledby` on the root. |
| `data-dialog-description` | Auto-wired to `aria-describedby` on the root. |
| `data-dialog-open="<id>"` | Trigger button. Calls `open()` on the dialog with the matching `id`. |
| `data-dialog-close` | Any close trigger inside the panel. |

---

## Size **Modifiers**

Add these classes directly to `[data-dialog-panel]`:

| Class | Panel width |
|---|---|
| *(default)* | `max-width: 32rem` (512 px) |
| `.dialog-sm` | `max-width: 22rem` |
| `.dialog-lg` | `max-width: 48rem` |
| `.dialog-xl` | `max-width: 64rem` |
| `.dialog-full` | `calc(100vw – 2rem)` × `calc(100vh – 2rem)` |

Add `.dialog-alert` to `[data-plugin-dialog]` for a compact centered alert variant.

## Configuration **Options**

| Option | Type | Default | Description |
|---|---|---|---|
| `closeOnBackdrop` | `boolean` | `true` | Close when the backdrop is clicked. |
| `closeOnEscape` | `boolean` | `true` | Close on the `Escape` key. |
| `backdrop` | `boolean` | `true` | Auto-inject a `[data-dialog-backdrop]` if one is missing. |
| `animationIn` | `string` | `'fadeIn'` | CSS animation class applied to `[data-dialog-panel]` on open. |
| `animationOut` | `string` | `'fadeOut'` | CSS animation class applied to `[data-dialog-panel]` on close. |
| `animationDuration` | `number` | `300` | Maximum animation duration in ms (fallback if `animationend` never fires). |
| `scrollLock` | `boolean` | `true` | Add `.dialog-scroll-lock` to `<body>` while a dialog is open (prevents layout shift via `--dialog-scrollbar-width`). |
| `onOpen` | `function\|null` | `null` | Called after the open animation starts. Receives the dialog element. |
| `onClose` | `function\|null` | `null` | Called after the close animation finishes. Receives the dialog element. |

### Animation options

Any of the following strings are valid for `animationIn` / `animationOut`:

| In | Out |
|---|---|
| `fadeIn` | `fadeOut` |
| `fadeInDown` | `fadeOutUp` |
| `fadeInUp` | `fadeOutDown` |
| `zoomIn` | `zoomOut` |

## Programmatic **API**

### Retrieve the instance

```js
const dlg = $('#my-dialog').data('__pluginDialog');
```

### `open()`

Opens the dialog. Saves the currently-focused element, applies scroll-lock, adds entrance animation, and traps Tab focus inside the panel.

### `close()`

Plays the exit animation, removes scroll-lock, and restores focus to the element that triggered `open()`. Fires `dialog:close` after the animation completes.

### `toggle()`

Calls `open()` or `close()` depending on current state.

### `destroy()`

Removes all event listeners, ARIA attributes, and plugin state.

## Events

| Event | Fires on | When |
|---|---|---|
| `dialog:open` | Dialog root | After the open animation starts |
| `dialog:close` | Dialog root | After the close animation ends |

```js
$('#my-dialog').on('dialog:open', (e, instance) => {
    console.log('Dialog opened', instance);
});
$('#my-dialog').on('dialog:close', (e, instance) => {
    console.log('Dialog closed');
});
```

## Accessibility

> - `role="dialog"` and `aria-modal="true"` are added automatically.
> - `[data-dialog-title]` is wired to `aria-labelledby`; `[data-dialog-description]` to `aria-describedby`. IDs are auto-generated if absent.
> - Tab key cycles focus within the panel (focus trap). Shift+Tab cycles backward.
> - Escape closes the dialog (when `closeOnEscape: true`).
> - Focus is returned to the triggering element on close.
> - Scroll-lock compensates exactly for the native scrollbar width via `--dialog-scrollbar-width` (measured once at script load).

## Auto-init (init.js)

Dialogs must be initialized on DOMReady, before any trigger button can fire:

```js
if ($.isFunction($.fn['themestrapPluginDialog']) && $('[data-plugin-dialog]').length) {
    $(() => {
        $('[data-plugin-dialog]:not(.manual)').each(function () {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginDialog(opts);
        });
    });
}
```

## Recipe **Cookbook**

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

## Common **Pitfalls**

**Missing `id` on the root.** Triggers use `data-dialog-open="<id>"` to find their dialog. Without an `id`, triggers won't work (the plugin still works programmatically).

**Focus trap relies on visible focusable elements.** The trap queries `a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])` that are not `disabled` or `hidden`. If the panel contains no focusable elements, the panel itself receives `tabindex="-1"` and focus moves there.

**Scroll lock on mobile.** `overflow: hidden` on `<body>` doesn't prevent scrolling the iOS rubber-band / momentum scroll in all browsers. Add `-webkit-overflow-scrolling: touch` on the panel wrapper and `position: fixed; width: 100%` on body if iOS bounce is a problem.

**Two dialogs open simultaneously.** The plugin supports a dialog stack, but both dialogs must be independent `[data-plugin-dialog]` instances (separate IDs). Nesting one dialog inside another's `[data-dialog-panel]` is not supported.