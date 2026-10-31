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

1. The element that had focus is remembered.
2. `<body>` receives `.ts-scroll-lock` (`overflow: hidden`, plus right padding equal to `--ts-scrollbar-width` so the page does not shift).
3. The root swaps `.dialog-hidden` for `.dialog-is-open`, `aria-hidden` becomes `false`, and the panel gets `dialog-anim-enter` plus the `animationIn` class.
4. After 50 ms focus moves to `[data-dialog-autofocus]` if present, otherwise the first focusable element in the dialog, otherwise the root.
5. A keydown handler keeps Tab and Shift+Tab inside the dialog.

### Close lifecycle

1. Exit animation class applied; plugin waits for `animationend` (or `animationDuration` timeout).
2. Panel hidden, scroll lock removed.
3. Focus returned to the element that triggered the open.
4. `dialog:close` event fires.

### Multiple open dialogs

There is no dialog stack. Each dialog is independent: opening a second one leaves the first open underneath, and each remembers its own trigger for focus restore. Two things follow from that. Every open dialog listens for Escape on the document, so one press closes all of them. And the scroll lock is a single class on `<body>`, so closing the top dialog unlocks the page while the lower one is still open. Open dialogs one at a time where you can, and give an inner dialog `closeOnEscape: false` if you do nest them.


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
| `data-dialog-autofocus` | The element that receives focus when the dialog opens, instead of the first focusable one. Use it to make the safe choice the default in a destructive dialog. |


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
| `scrollLock` | `boolean` | `true` | Add `.ts-scroll-lock` to `<body>` while the dialog is open. The padding from `--ts-scrollbar-width` (measured by `themestrap.js`) prevents layout shift. |
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

## Theming and Dark **Mode**

Every color comes from a CSS token, so a dialog can be restyled without touching the plugin. Set them on `:root` for every dialog or on one dialog's root for just that one.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--ts-dlg-bg` | `#ffffff` | `#1e2939` | Panel background |
| `--ts-dlg-color` | unset (inherits the page color) | `#f3f4f6` | Panel text |
| `--ts-dlg-text-muted` | `#6b7280` | `#9ca3af` | `[data-dialog-description]` |
| `--ts-dlg-shadow` | soft shadow | deeper shadow | Panel shadow |
| `--ts-dlg-backdrop` | `rgba(0, 0, 0, 0.6)` | `rgba(0, 0, 0, 0.7)` | `[data-dialog-backdrop]` |
| `--ts-dlg-scrollbar` | `rgba(0, 0, 0, 0.2)` | `rgba(255, 255, 255, 0.15)` | WebKit scrollbar thumb |

Dark mode follows the same three tiers as the other Themestrap plugins, so dialogs always agree with PluginDarkMode:

1. `@media (prefers-color-scheme: dark)` when nothing else says otherwise.
2. `html.dark` or `[data-bs-theme="dark"]`, which PluginDarkMode sets when the user picks dark.
3. `[data-bs-theme="light"]`, which brings back the light tokens when the user picks light on a system that prefers dark.

```css
/* Brand colored dialogs, light and dark */
:root { --ts-dlg-bg: #fdfaf3; }
html.dark, [data-bs-theme="dark"] { --ts-dlg-bg: #20263a; }
```

## Accessibility

> - `role="dialog"` and `aria-modal="true"` are added automatically.
> - `[data-dialog-title]` is wired to `aria-labelledby`; `[data-dialog-description]` to `aria-describedby`. IDs are auto-generated if absent.
> - Tab key cycles focus within the panel (focus trap). Shift+Tab cycles backward.
> - Escape closes the dialog (when `closeOnEscape: true`).
> - Focus is returned to the triggering element on close.
> - Scroll-lock compensates for the native scrollbar width via `--ts-scrollbar-width`, which `themestrap.js` measures and sets on `<html>`.

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

## Prompts: `confirm()` and `alert()`

For a question or a notice you do not want to write markup for, use the built-in prompts. They replace `window.confirm()` and `window.alert()` with real, accessible, themed dialogs, and they return a Promise.

```js
themestrap.PluginDialog.confirm({
    title:        'Delete this post?',
    message:      'This removes it from your site for good. It cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel:  'Keep it',
    danger:       true
}).then(function (yes) {
    if (yes) { deletePost(); }
});

themestrap.PluginDialog.alert({ title: 'Saved', message: 'Your changes are live.' })
    .then(function () { /* after it is dismissed */ });
```

| Option | Default | Description |
|---|---|---|
| `title` | `'Are you sure?'` (`'Notice'` for `alert`) | The heading. Inserted as text. |
| `message` | `''` | The body. Inserted as text, never as HTML. Line breaks (`\n`) are kept. |
| `confirmLabel` | `'OK'` | Text of the confirm button. |
| `cancelLabel` | `'Cancel'` | Text of the cancel button (`confirm` only). |
| `danger` | `false` | Destructive action: the confirm button gets the danger class and **Cancel is focused first**, so an accidental Enter does not delete anything. |
| `closeOnBackdrop` | `true` | Clicking the backdrop counts as cancel. |
| `closeOnEscape` | `true` | Escape counts as cancel. |
| `classes` | `{ confirm: 'btn btn-primary', danger: 'btn btn-danger', cancel: 'btn btn-light', actions: '' }` | Button classes, for frameworks other than Bootstrap. |

A plain string is shorthand for `{ message: '…' }`.

`confirm` resolves `true` only when the confirm button is pressed. Escape, the backdrop and Cancel all resolve `false`. `alert` always resolves `true`. After it closes, the prompt removes its own markup, restores focus to where it was, and releases the scroll lock, so prompts can be used repeatedly without leaving anything behind.

> The browser's own tab-close warning (`beforeunload`) cannot be replaced by any script. Use a prompt for in-page actions such as links, and keep `beforeunload` as a backstop.

## Recipe **Cookbook**

#### Confirmation without markup

Prefer `PluginDialog.confirm()` (above). The markup version below is for dialogs that need custom content.

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

**Dialog stays dark after picking light.** Older builds of the plugin only listened to `prefers-color-scheme`, so a user who chose light on a dark system still got dark dialogs. The current build reads the same `html.dark` and `data-bs-theme` signals as PluginDarkMode; update the plugin file if you see this.

**Two dialogs open simultaneously.** There is no stack (see "Multiple open dialogs"): one Escape closes both, and closing either releases the page's scroll lock. Both must be separate `[data-plugin-dialog]` instances with their own ids; nesting one dialog inside another's `[data-dialog-panel]` is not supported.