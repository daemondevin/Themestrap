# PluginAlert Guide

**File:** `js/components/themestrap.plugin.alert.js`  
**jQuery method:** `$.fn.themestrapPluginAlert`  
**Instance key:** `__pluginAlert`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

## Over**view**

PluginAlert transforms any Bootstrap `.alert` element into a fully-featured notification component. It injects its CSS lazily on first use, auto-detects the alert type from existing Bootstrap classes, and adds rich UX features: contextual icons, optional dismissal, action buttons, auto-dismiss with a countdown progress bar, hover-pause, and slide or fade exit animations.

A static `PluginAlert.create()` factory lets you fire toast-style alerts from JavaScript with zero markup.

## Mark**up**

### Declarative (HTML-authored)

```html
<div class="alert alert-ts-success" role="alert"
     data-plugin-options='{"showIcon": true, "dismissible": true, "autoDismiss": true, "delay": 4000}'>
  Your profile was saved successfully.
</div>
```

> [!NOTE]  
> The plugin reads existing Bootstrap contextual classes (`alert-success`, `alert-danger`, etc.) and maps them to its own token-driven skin classes automatically.

### With a title

```html
<div class="alert alert-ts-warning"
     data-plugin-options='{"title": "Action required", "showIcon": true, "dismissible": true}'>
  Please verify your email address before continuing.
</div>
```

### With action buttons

```html
<div class="alert alert-ts-info"
     data-plugin-options='{
       "title": "Unsaved changes",
       "showIcon": true,
       "actions": [
         {"label": "Save",    "key": "save",    "variant": "primary"},
         {"label": "Discard", "key": "discard", "variant": "secondary"}
       ]
     }'>
  You have unsaved changes. Save or discard before leaving.
</div>
```

## Type **Map**

| Class on the element | Resolved type | Skin class applied |
|---|---|---|
| `alert-info` | `info` | `alert-ts-info` |
| `alert-success` | `success` | `alert-ts-success` |
| `alert-warning` | `warning` | `alert-ts-warning` |
| `alert-danger` | `danger` | `alert-ts-danger` |
| `alert-primary` | `primary` | `alert-ts-primary` |
| `alert-secondary` | `secondary` | `alert-ts-secondary` |
| `alert-tertiary` | `tertiary` | `alert-ts-tertiary` |
| `alert-quaternary` | `quaternary` | `alert-ts-quaternary` |
| `alert-light` | `light` | `alert-ts-light` |
| `alert-dark` | `dark` | `alert-ts-dark` |
| *(none / alert-default)* | `neutral` | `alert-ts-neutral` |

> [!TIP]  
> You can also set `type` explicitly via `data-plugin-options` to bypass auto-detection.

---

## Configuration **Options**

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `string\|null` | `null` | Override the auto-detected type. |
| `showIcon` | `boolean` | `false` | Inject a contextual SVG icon. |
| `dismissible` | `boolean` | `false` | Render a dismiss (×) button. |
| `title` | `string\|null` | `null` | Bold heading rendered above the message. |
| `message` | `string\|null` | `null` | Message HTML. Used by `create()`; HTML alerts auto-detect existing content. |
| `actions` | `Array` | `[]` | Array of `{label, key, variant, class}` action buttons. `variant` is `primary`, `secondary`, or `link`. |
| `autoDismiss` | `boolean` | `false` | Automatically dismiss after `delay` ms. |
| `delay` | `number` | `5000` | Auto-dismiss delay in milliseconds. |
| `pauseOnHover` | `boolean` | `true` | Pause the auto-dismiss timer while the cursor is over the alert. |
| `animation` | `string` | `'fade'` | Exit animation style: `'fade'` or `'slide'`. |
| `animationDuration` | `number` | `400` | Duration of the exit animation in ms. |
| `showCountdown` | `boolean` | `true` | Show a shrinking progress bar at the bottom edge during auto-dismiss. |
| `onDismiss` | `function\|null` | `null` | Callback fired after the alert is fully removed. |
| `onAction` | `function(key)\|null` | `null` | Callback fired when an action button is clicked. Receives the action's `key`. |
| `remove` | `boolean` | `true` | `true` removes the element from the DOM; `false` sets `display:none`. |

---

## Programmatic **API**

### Retrieve the instance

```js
const alert = $('#my-alert').data('__pluginAlert');
alert.dismiss();
alert.destroy();
```

### `dismiss()`

Plays the exit animation and removes (or hides) the element. Fires `close.bs.alert` and `closed.bs.alert` for Bootstrap compatibility.

### `destroy()`

Tears down events, restores original HTML and classes, and removes the instance from `$.data`.

### `PluginAlert.create([ container, ] opts)`

Fire-and-forget factory. Creates a new alert element and appends it to a shared `.alert-toast-stack` positioned in the top-right corner of the viewport (auto-created). Pass a container selector as the first argument to inject into a specific element instead.

```js
// Toast — top-right stack
themestrap.PluginAlert.create({
    type:       'success',
    title:      'Profile updated',
    message:    'Your changes were saved.',
    autoDismiss: true,
    delay:      4000,
    showIcon:   true
});

// Inject into a page region
themestrap.PluginAlert.create('#page-notifications', {
    type:    'warning',
    message: 'Your session expires in 5 minutes.',
    actions: [
        { label: 'Extend', key: 'extend', variant: 'primary' }
    ],
    onAction(key) {
        if (key === 'extend') extendSession();
        this.dismiss();
    }
});
```

## Events

Events are fired on the alert's root element.

| Event | When | Notes |
|---|---|---|
| `close.bs.alert` | When dismiss begins | Bootstrap-compatible |
| `closed.bs.alert` | After dismiss animation completes | Bootstrap-compatible |
| `action.alert` | When an action button is clicked | Receives `[key, instance]` as arguments |

```js
$('#my-alert').on('action.alert', (e, key, instance) => {
    if (key === 'retry') retryOperation();
    instance.dismiss();
});
```

## CSS **Architecture**

Styles are injected lazily into a `<style id="ts-alert-styles">` tag on the first `build()` call. Skins are token-driven using CSS custom properties scoped to each `.alert-ts-{type}` class:

| Variable | Role |
|---|---|
| `--alert-ts-bg` | Background fill |
| `--alert-ts-border` | Left accent border color |
| `--alert-ts-icon` | Icon color |
| `--alert-ts-title` | Title text color |
| `--alert-ts-text` | Body text color |
| `--alert-ts-action` | Action button accent |
| `--alert-ts-close` | Close button color |

Sizes: add `.alert-sm` or `.alert-lg` to the root element for size variants.

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginAlert']) && $('[data-plugin-alert]').length) {
    themestrap.fn.intObsInit('[data-plugin-alert]:not(.manual)', 'themestrapPluginAlert');
}
```

> [!Note]  
> Most alert use cases are HTML-authored with `data-plugin-options` directly on `.alert` elements rather than via a separate `data-plugin-alert` attribute. The `create()` factory handles fully programmatic use.