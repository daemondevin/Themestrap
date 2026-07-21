# PluginAlert Guide

Enhances Bootstrap `.alert` elements with semantic icon injection, optional auto-dismiss with a countdown progress bar, pause-on-hover, configurable action buttons, smooth slide or fade dismissal animations, and a `create()` factory for programmatic toast alerts — all without touching Bootstrap's existing markup contract.

---

## How It Works

The plugin wraps your existing `.alert` markup in a structured layout: an optional icon column, a body column (title + message + action buttons), and an optional dismiss button. The original inner HTML becomes the message text automatically; nothing needs to be rewritten for basic use.

### Build phase

On `build()` the plugin:

1. **Detects type** — reads `o.type` or falls back to `_detectType()`, which inspects Bootstrap class names (`alert-info`, `alert-success`, etc.) against `BS_TYPE_MAP` and maps them to the plugin's own skin tokens.
2. **Applies skin** — adds `alert-ts` and `alert-ts-{type}` classes, which activate the CSS custom-property token set for that variant.
3. **Rebuilds structure** — calls `_buildStructure()`, which detaches any existing `.btn-close`, empties the element, and injects the icon/body/close layout in a single pass.
4. **Countdown bar** — if `showCountdown && autoDismiss`, appends `.alert-ts-countdown` and uses a double `requestAnimationFrame` to trigger the CSS `scaleX(1) → scaleX(0)` transition after paint.
5. **Auto-dismiss timer** — if `autoDismiss`, stores `_remaining = delay` and starts a `setTimeout` via `_startTimer()`.

### Token cascade

Every variant (`alert-ts-info`, `alert-ts-success`, etc.) defines nine CSS custom properties on itself (`--alert-ts-bg`, `--alert-ts-border`, `--alert-ts-icon`, `--alert-ts-title`, `--alert-ts-text`, `--alert-ts-action`, `--alert-ts-action-hover`, `--alert-ts-close`, `--alert-ts-close-hover`). All structural rules reference only these variables, so swapping the variant class changes the entire colour scheme atomically. Dark-mode overrides are provided for all eleven variants under `html.dark`.

### Pause-on-hover

When `pauseOnHover: true`, `mouseenter` calls `_pauseTimer()`: clears the `setTimeout`, captures the remaining ms as `_remaining -= elapsed`, and — if a countdown bar is present — snapshots its current scale to a `0ms` transition so it freezes visually. `mouseleave` calls `_resumeTimer()`: restarts the timer against the captured `_remaining` and re-engages the CSS transition for the remainder of the duration.

### dismiss() animation

`dismiss()` fires `close.bs.alert`, then either:
- **`slide`** — captures `outerHeight`, sets it as `max-height`, then transitions `max-height/opacity/margin/padding` to zero in `animationDuration`ms.
- **`fade`** (default) — transitions `opacity` to zero.

After the animation, `_afterDismiss()` fires `closed.bs.alert`, calls `onDismiss`, and either removes the element from the DOM (`remove: true`) or sets `display:none`.

---

## Quick Start

### Minimal markup (HTML-authored)

```html
<div class="alert alert-info alert-dismissible" role="alert" data-plugin-alert>
  Your session will expire in 10 minutes.
</div>
```

The plugin reads the `alert-info` class, sets `type: 'info'`, injects the skin tokens, and restructures the interior. No options required.

### With a title and dismiss button

```html
<div class="alert alert-success" data-plugin-alert
     data-plugin-options='{"title":"Changes saved","dismissible":true}'>
  Your profile has been updated successfully.
</div>
```

### Include the plugin

```html
<script src="/assets/components/themestrap/vendor/plugins/js/plugins.min.js"></script>
<script src="/assets/components/themestrap/js/themestrap.js"></script>
<script src="/assets/components/themestrap/js/components/themestrap.plugin.alert.js"></script>
<script src="/assets/components/themestrap/js/themestrap.init.js"></script>
```

### Auto-init wiring (`themestrap.init.js`)

```js
if ($.isFunction($.fn['themestrapPluginAlert']) && $('[data-plugin-alert]').length) {
    $(() => {
        $('[data-plugin-alert]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginAlert(opts);
        });
    });
}
```

### Manual init with options

```js
$('.my-alert').themestrapPluginAlert({
    type:        'warning',
    showIcon:    true,
    dismissible: true,
    autoDismiss: true,
    delay:       6000,
});
```

### Per-element options via data attribute

```html
<div class="alert alert-warning" data-plugin-alert
     data-plugin-options='{"showIcon":true,"autoDismiss":true,"delay":6000}'>
  …
</div>
```

---

## Markup Reference

### Plugin root

Any `.alert` element may be the plugin root. The plugin reads Bootstrap variant classes (`alert-info`, `alert-warning`, etc.) automatically, so no `type` option is required when those classes are present.

```html
<div class="alert alert-success" data-plugin-alert>
  …
</div>
```

### Resulting structure (after `build()`)

```html
<div class="alert alert-success alert-ts alert-ts-success" role="alert">

  <!-- injected when showIcon: true -->
  <div class="alert-ts-icon" aria-hidden="true">
    <svg>…</svg>
  </div>

  <!-- always injected -->
  <div class="alert-ts-body">
    <p class="alert-ts-title">…</p>          <!-- when title option is set -->
    <div class="alert-ts-text">…</div>        <!-- original innerHTML or message option -->
    <div class="alert-ts-actions">            <!-- when actions array is non-empty -->
      <button class="alert-ts-action alert-ts-action-primary">…</button>
    </div>
  </div>

  <!-- injected when dismissible: true -->
  <button class="alert-ts-close" aria-label="Dismiss alert">…</button>

  <!-- injected when showCountdown && autoDismiss -->
  <div class="alert-ts-countdown"></div>

</div>
```

### Action button variants

Action objects in the `actions` array accept a `variant` key:

| Variant | Class added | Appearance |
|:--------|:------------|:-----------|
| `'primary'` (default) | `alert-ts-action-primary` | Filled, token-coloured background |
| `'secondary'` | `alert-ts-action-secondary` | Ghost / outlined |
| `'link'` | `alert-ts-action-link` | Text-only, no border |

---

## Configuration Options

Options merge: `PluginAlert.defaults → opts argument → data-plugin-options JSON`.

### Layout / content

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `type` | `string\|null` | `null` | Alert variant: `'info'`, `'success'`, `'warning'`, `'danger'`, `'neutral'`, `'primary'`, `'secondary'`, `'tertiary'`, `'quaternary'`, `'light'`, `'dark'`. When `null`, auto-detected from Bootstrap class names. |
| `showIcon` | bool | `false` | Inject an SVG icon matching the type (icons for `info`, `success`, `warning`, `danger`, `neutral`; falls back to `info` icon for theme variants). |
| `dismissible` | bool | `false` | Render a dismiss (×) button. |
| `title` | `string\|null` | `null` | Bold heading rendered above the message. |
| `message` | `string\|null` | `null` | Message HTML. When `null`, the element's existing `innerHTML` is used. Explicit `message` is required when using `create()`. |
| `actions` | array | `[]` | Array of action descriptors: `{ label, key, variant, class }`. |

### Behaviour

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `autoDismiss` | bool | `false` | Automatically dismiss the alert after `delay` ms. |
| `delay` | number | `5000` | Auto-dismiss delay in milliseconds. |
| `pauseOnHover` | bool | `true` | Pause the auto-dismiss timer while the cursor is over the alert. |
| `remove` | bool | `true` | After dismissal, `true` removes the element from the DOM; `false` sets `display:none`. |

### Animation

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `animation` | string | `'fade'` | Exit animation: `'fade'` (opacity) or `'slide'` (max-height collapse). |
| `animationDuration` | number | `400` | Exit animation duration in milliseconds. |
| `showCountdown` | bool | `true` | Show a shrinking progress bar along the bottom edge when `autoDismiss` is enabled. |

### Callbacks

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `onDismiss` | `function\|null` | `null` | Called after the alert is removed/hidden. Invoked as `fn.call(instance)`. |
| `onAction` | `function\|null` | `null` | Called when an action button is clicked. Signature: `fn.call(instance, key)`. Equivalent to listening for the `action.alert` jQuery event. |

---

## Public API

### Accessing the instance

```js
const alert = $('.my-alert').data('__pluginAlert');
```

### Instance methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `dismiss()` | `this` | Animate the alert out, then remove or hide it per the `remove` option. Fires `close.bs.alert` before animation and `closed.bs.alert` after. |
| `destroy()` | `this` | Remove all `.pluginalert` namespaced event listeners, restore the original `innerHTML`, strip `alert-ts-*` classes and inline styles, clear any pending timer, and remove the instance from `$el.data()`. |

### jQuery string commands

```js
$('.my-alert').themestrapPluginAlert('dismiss');
$('.my-alert').themestrapPluginAlert('destroy');
```

### jQuery events

| Event | When | Extra args |
|:------|:-----|:-----------|
| `close.bs.alert` | Immediately on `dismiss()` call, before animation | — |
| `closed.bs.alert` | After the exit animation completes | — |
| `action.alert` | When an action button is clicked | `[key, instance]` |

```js
$('.my-alert')
  .on('closed.bs.alert', () => console.log('gone'))
  .on('action.alert', (e, key, instance) => {
      if (key === 'retry') retryRequest();
      instance.dismiss();
  });
```

---

## `PluginAlert.create()`

Static factory that programmatically creates and injects a new alert. When no container is provided, alerts stack inside a shared `.alert-toast-stack` div that is auto-created and appended to `<body>`.

```js
PluginAlert.create([container], opts)
```

| Argument | Type | Description |
|:---------|:-----|:------------|
| `container` | `string\|jQuery\|null` | Selector or jQuery object to append into. Omit for the default toast stack. |
| `opts` | object | Any `PluginAlert` options. `message` is required. |

Returns the `PluginAlert` instance.

---

## Recipe Cookbook

### Simple inline alert

```html
<div class="alert alert-info" data-plugin-alert
     data-plugin-options='{"showIcon":true,"dismissible":true}'>
  Two-factor authentication is now active on your account.
</div>
```

### Auto-dismissing success toast

```js
themestrap.PluginAlert.create({
    type:        'success',
    title:       'Saved',
    message:     'Your changes have been saved.',
    autoDismiss: true,
    delay:       4000,
    showIcon:    true,
});
```

### Confirmation alert with action buttons

```js
themestrap.PluginAlert.create({
    type:    'warning',
    title:   'Unsaved changes',
    message: 'You have unsaved changes. Do you want to save them before leaving?',
    actions: [
        { label: 'Save',    key: 'save',    variant: 'primary' },
        { label: 'Discard', key: 'discard', variant: 'secondary' },
        { label: 'Cancel',  key: 'cancel',  variant: 'link' }
    ],
    dismissible: false,
    onAction(key) {
        if (key === 'save')    saveChanges();
        if (key !== 'cancel')  this.dismiss();
    }
});
```

### Inject into a specific container

```js
themestrap.PluginAlert.create('#page-notifications', {
    type:    'info',
    message: 'A new software update is available.',
    remove:  false,   // hide, don't remove — allows toggling visibility later
});
```

### Alert with countdown and pause-on-hover

```html
<div class="alert alert-danger" data-plugin-alert
     data-plugin-options='{
       "title"        : "Session expiring",
       "showIcon"     : true,
       "autoDismiss"  : true,
       "delay"        : 10000,
       "showCountdown": true,
       "pauseOnHover" : true,
       "animation"    : "slide"
     }'>
  Your session will expire in 10 seconds. Save your work now.
</div>
```

### onDismiss callback

```js
$('.cookie-banner').themestrapPluginAlert({
    dismissible: true,
    onDismiss() {
        localStorage.setItem('cookie-banner-dismissed', '1');
    }
});
```

### Slide exit animation

```js
$('.my-alert').themestrapPluginAlert({
    dismissible:       true,
    animation:         'slide',
    animationDuration: 300,
});
```

### Programmatic dismiss and destroy

```js
const inst = $('.my-alert').data('__pluginAlert');

// Animate out and remove from DOM
inst.dismiss();

// Or tear down without animation (e.g. page unload)
inst.destroy();
```

### Toast stack with custom position

The toast stack element is a plain `<div>` — override its position via CSS:

```css
.alert-toast-stack {
    top:   auto;
    right: auto;
    bottom: 1.25rem;
    left:  1.25rem;
}
```

### Dark mode

Dark-mode palettes are activated automatically when `html.dark` is present on the document element. No JavaScript or option is needed — CSS does the work. All eleven type variants have dark-mode overrides:

- Semantic variants (`info`, `success`, `warning`, `danger`, `neutral`) use deep-tinted backgrounds with bright foreground text.
- Theme variants (`primary`, `secondary`, `tertiary`, `quaternary`) use `color-mix(in srgb, var(--{name}) 12%, #0a1929)` as the background, falling back gracefully when the CSS custom property is not defined.
- `light` maps to a slate-800 background; `dark` maps to near-black slate-950.

To toggle dark mode:

```js
document.documentElement.classList.toggle('dark');
```

---

## Common Pitfalls

### Type is not detected from custom variant classes

> [!Note]  
> `_detectType()` only maps the standard Bootstrap classes (`alert-info`, `alert-success`, `alert-warning`, `alert-danger`, `alert-primary`, `alert-secondary`, `alert-light`, `alert-dark`). Custom classes like `alert-brand` will not be detected. Pass `type` explicitly as an option in that case.

### `message` option is required with `create()`

> [!Warning]  
> When using `PluginAlert.create()`, the element starts empty. If `message` is omitted, the alert will render with no body text. Always supply at least `message` when calling `create()`.

### `remove: false` alerts are not re-shown automatically

> [!Note]  
> Setting `remove: false` keeps the element in the DOM as `display:none` after dismissal. The plugin does not provide a `show()` method — if you need to re-display the alert, manipulate `display` directly and call `destroy()` + re-init to restore the structure.

### Countdown bar flickers on low-end devices

> [!Note]  
> The countdown bar uses a double `requestAnimationFrame` trick to defer the CSS transition start until after the browser has painted. On very slow devices, if the frame budget is missed, the bar may start mid-transition. This is a cosmetic issue only — `dismiss()` timing is governed by `setTimeout`, not the CSS animation.

### Multiple inits on the same element

> [!Note]  
> Calling `.themestrapPluginAlert()` on an already-initialised element is a no-op — the constructor guards against duplicate instances via `$el.data(instanceName)`. To change options, call `destroy()` first.

### Auto-dismiss does not respect `remove: false` for the timer

> [!Note]  
> The auto-dismiss timer always calls `dismiss()` when it fires, regardless of the `remove` option. `remove` only controls what happens *inside* `_afterDismiss()` — the element is hidden either way. There is no option to "pause and not hide" automatically.

### `closed.bs.alert` fires after the animation, not immediately

> [!Note]  
> Bootstrap's own dismissal fires `closed.bs.alert` synchronously. This plugin fires it after `animationDuration`ms. If other scripts listen for `closed.bs.alert` and expect synchronous behaviour, account for the delay or reduce `animationDuration` to `0`.

### Diagnostic checklist

- [ ] Is `data-plugin-alert` on the `.alert` element? (Plugin requires the Bootstrap `.alert` class too.)
- [ ] Does `$('.my-alert').data('__pluginAlert')` return an instance after init?
- [ ] Is the type skin applied? Check for `alert-ts-{type}` class on the element.
- [ ] Icons not showing? Confirm `showIcon: true` and that the `type` maps to one of the five icon keys (`info`, `success`, `warning`, `danger`, `neutral`).
- [ ] Countdown bar missing? Requires both `autoDismiss: true` and `showCountdown: true`.
- [ ] Pause-on-hover not working? Requires `autoDismiss: true` and `pauseOnHover: true`.
- [ ] Action buttons not firing? Listen for `action.alert` on the alert element, or pass `onAction` in options.
- [ ] Dark mode tokens not applying? Confirm `html.dark` class is on `<html>`, not `<body>` or a wrapper.
- [ ] `create()` alert not appearing? Check that a `.alert-toast-stack` was created — inspect `$('.alert-toast-stack').length` after the call.