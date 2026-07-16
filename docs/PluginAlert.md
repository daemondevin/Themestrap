# Alert Guide

Themestrap's enhanced Bootstrap alert — icons, countdown progress bar, hover-pause, action buttons, auto-dismiss with slide or fade animation, and a static `create()` factory.

## [How It **Works**](#how-it-works)

PluginAlert enhances existing Bootstrap alert elements or creates new ones programmatically via `themestrap.PluginAlert.create()`. It auto-detects the alert type from Bootstrap classes, injects a contextual SVG icon, and optionally auto-dismisses after a configurable delay with an animated countdown progress bar.

---

## [Quick **Start**](#quick-start)

### Enhancing an existing alert

```html
<div class="alert alert-ts alert-ts-info" role="alert"
     data-plugin-options='{"showIcon": true, "dismissible": true,
                           "autoDismiss": true, "delay": 5000}'>
  Your file has been uploaded successfully.
</div>
```

### Creating programmatically

```js
themestrap.PluginAlert.create({
    type:    'warning',
    title:   'Unsaved changes',
    message: 'Save before leaving?',
    delay:   8000,
    actions: [
        { label: 'Save',    key: 'save',    variant: 'primary' },
        { label: 'Discard', key: 'discard', variant: 'secondary' }
    ],
    onAction(key) {
        if (key === 'save') saveChanges();
        this.dismiss();
    }
});
```

### Inject into a specific container

```js
themestrap.PluginAlert.create('#page-notifications', {
    type:    'success',
    message: 'Profile updated successfully.'
});
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | `null` | `'info'`, `'success'`, `'warning'`, `'danger'`, `'neutral'`, or any `alert-ts-*` variant. Auto-detected when null. |
| `showIcon` | bool | `false` | Inject an SVG icon matching the type. |
| `dismissible` | bool | `false` | Render a dismiss (×) button. |
| `title` | string | `null` | Bold heading above the message. |
| `message` | string | `null` | Message HTML. Used by `create()`; HTML alerts auto-detect content. |
| `actions` | array | `[]` | Action buttons: `[{label, key, variant, class}]`. |
| `autoDismiss` | bool | `false` | Auto-remove after `delay` ms. |
| `delay` | number | `5000` | Milliseconds before auto-dismiss. |
| `pauseOnHover` | bool | `true` | Pause the countdown timer on hover. |
| `animation` | string | `'fade'` | Dismissal animation: `'fade'` or `'slide'`. |
| `animationDuration` | number | `400` | Duration of the dismissal animation in ms. |
| `showCountdown` | bool | `true` | Show a shrinking progress bar along the bottom. |
| `onDismiss` | function | `null` | Callback after the alert is dismissed. |
| `onAction` | function | `null` | Callback when an action button is clicked: `fn(key)`. |
| `remove` | bool | `true` | `true` removes from DOM; `false` hides with `display:none`. |

---

## [Instance **API**](#instance-api)

```js
const alert = $('#myAlert').data('__pluginAlert');
alert.dismiss();   // animate out and remove/hide
alert.destroy();   // restore original HTML without animation
```

### Events

| Event | Fires |
|-------|-------|
| `close.bs.alert` | Before the dismiss animation starts. |
| `closed.bs.alert` | After the alert is removed/hidden. |
| `action.alert` | When an action button is clicked: `(e, key, instance)`. |

---

## [Common **Pitfalls**](#pitfalls)

**Type auto-detection requires Bootstrap variant classes.** Without a `type` option and without a Bootstrap `alert-success`/`alert-warning`/etc. class, the plugin falls back to `'info'`. Always set at least one variant class or pass `type` explicitly.

**`create()` appends to `<body>` by default.** To inject into a specific container, pass the selector as the first argument: `create('#container', opts)`.

---
