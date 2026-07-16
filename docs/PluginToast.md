# Toast Guide

Themestrap's Bootstrap 5 toast notification plugin — programmatic and element-driven toasts, 9 positions, 6 types, autohide with progress bar, hover-to-pause.

Bootstrap 5 toast notifications, the Themestrap way. Fire one with a single static call (`PluginToast.show({title, body, type})`), or attach the plugin to any element to render its data attributes as a toast. Containers are created lazily per position — nine positions are supported, from `top-end` to `middle-center` to `bottom-start`. Each toast comes with a typed icon, header color, optional timestamp, dismiss button, and an animated countdown bar that pauses on hover.

---

## [How It **Works**](#how-it-works)

A toast is built in two coordinated phases. The plugin keeps a private registry of position containers and reuses them across instances so multiple toasts at the same position stack naturally.

### Phase 1 — Resolve container

The first call to a given `position` creates a fixed-position `div.toast-container` appended to `<body>` at `z-index: 1090`. Subsequent toasts at the same position re-use that container.

- Lazy creation — no DOM cost on page load
- Auto-cleaned when the last toast at a position is dismissed
- Nine positions: three Y × three X

### Phase 2 — Build & show

The toast markup is assembled from options, including a typed SVG icon, contextual text color, optional timestamp, dismiss button, and an animated countdown bar. A native Bootstrap 5 `Toast` instance is created and shown.

- `shown.bs.toast` → fires `onShown`
- `hidden.bs.toast` → removes node, fires `onHidden`
- Hover pauses progress + autohide; mouseleave re-arms

### Position grid

Positions are written as `"y-x"` where _y_ is one of `top`, `middle`, `bottom` and _x_ is one of `start`, `center`, `end`:

| | start | center | end |
|---|---|---|---|
| **top** | `top-start` | `top-center` | `top-end` |
| **middle** | `middle-start` | `middle-center` | `middle-end` |
| **bottom** | `bottom-start` | `bottom-center` | `bottom-end` |

> **Default position is `top-end`.** Override per-call or globally via `PluginToast.defaults.position`.

---

## [Quick **Start**](#quick-start)

### 1. Include the scripts

PluginToast depends on Bootstrap 5's bundled JS (which ships `bootstrap.Toast`). Load it after `themestrap.js`:

```html
<script src="bootstrap.bundle.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/themestrap.plugin.toast.js"></script>
```

### 2. Fire a toast from anywhere

The simplest path — no element required:

```js
themestrap.PluginToast.show({
    title: 'Saved',
    body:  'Your changes have been saved.',
    type:  'success'
});
```

### 3. Or attach to a real element

For data-driven toasts, place a hidden anchor element with the relevant `data-plugin-toast-*` attributes:

```html
<div id="welcomeToast"
     data-plugin-toast
     data-plugin-toast-title="Welcome back"
     data-plugin-toast-body="Logged in as alex@example.com"
     data-plugin-toast-type="info"
     data-plugin-toast-position="bottom-end"></div>

<script>
$('#welcomeToast').themestrapPluginToast();
</script>
```

> **Tip:** Static `show()` is preferred for most cases. Use the element form when the toast's content is rendered server-side and you don't want to re-marshal it through JS.

---

## [Configuration **Options**](#options)

Options merge in this order (later wins): `PluginToast.defaults → opts arg → data-plugin-toast-options → individual data-plugin-toast-* attrs`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `'Notification'` | Header text. Bold. |
| `body` | string | `''` | Body content. May contain HTML. Sanitise untrusted input before passing. |
| `type` | string | `'info'` | One of `success`, `danger`, `warning`, `info`, `dark`, `light`. Drives header color and icon. |
| `position` | string | `'top-end'` | Position grid key. Format: `{top\|middle\|bottom}-{start\|center\|end}`. |
| `autohide` | bool | `true` | Whether to auto-dismiss after `delay` ms. |
| `delay` | number | `4000` | Autohide delay in milliseconds. |
| `dismissible` | bool | `true` | Render a close button in the header. |
| `progress` | bool | `true` | Show animated countdown bar. Ignored when `autohide: false`. Pauses on hover. |
| `timestamp` | string | `null` | Small text shown right-aligned in the header (e.g. `'just now'`, `'2m ago'`). |
| `icon` | string | `null` | Custom image URL. Renders as a 16×16 `<img>` instead of the typed SVG. |
| `onShown` | function | `null` | Fires after the toast has fully animated in. `this` is the plugin instance. |
| `onHidden` | function | `null` | Fires after the toast has fully animated out — just before the DOM node is removed. |

### Per-element data attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-plugin-toast-title` | any string | Header text (bold, left-aligned next to icon). |
| `data-plugin-toast-body` | any string / HTML | Body content. HTML is rendered as-is — escape untrusted input. |
| `data-plugin-toast-type` | `success`, `danger`, `warning`, `info`, `dark`, `light` | Drives icon and header color. Default: `info`. |
| `data-plugin-toast-position` | `{y}-{x}` grid | Where the toast appears. Default: `top-end`. |
| `data-plugin-toast-delay` | number (ms) | Autohide delay in milliseconds. |
| `data-plugin-toast-autohide` | `true` / `false` | Whether to auto-dismiss. |
| `data-plugin-toast-progress` | `true` / `false` | Show the animated countdown bar. Requires `autohide: true`. |
| `data-plugin-toast-icon` | URL to image | Custom 16×16 image source. Falls back to the type's SVG icon when omitted. |

---

## [Static **API**](#static-api)

### `PluginToast.show(opts)`

Fire-and-forget toast launcher. No element required — the plugin attaches a detached anchor to `<body>`, mounts the toast on it, and removes both when the toast hides. Returns the plugin instance.

```js
themestrap.PluginToast.show({
    title:    'Upload complete',
    body:     '<strong>3 files</strong> uploaded successfully.',
    type:     'success',
    position: 'bottom-center',
    delay:    6000,
    onHidden: () => console.log('Toast gone'),
});
```

### `PluginToast.defaults`

Mutable defaults object. Override before first use to change site-wide behavior:

```js
// Before any .show() call:
themestrap.PluginToast.defaults.delay    = 6000;
themestrap.PluginToast.defaults.position = 'bottom-end';
themestrap.PluginToast.defaults.progress = true;
```

---

## [Instance **API**](#instance-api)

### Accessing the instance

```js
// jQuery adapter — returns existing instance if any, else creates one
const t = $('#myAnchor').themestrapPluginToast({ title: 'Hi' });

// Or grab the existing instance directly:
const t = $('#myAnchor').data('__toast');
```

### Instance methods

| Method | Returns | Description |
|--------|---------|-------------|
| `hide()` | this | Programmatically dismiss the toast. Animates out then fires `onHidden`. |
| `dispose()` | this | Tears down the Bootstrap Toast instance and removes the data reference. The DOM node remains — pair with `$toast.remove()` for a full cleanup. |

### Lifecycle callbacks

```js
themestrap.PluginToast.show({
    title: 'Heads up',
    body:  'Session expires in 5 minutes.',
    type:  'warning',
    autohide: false,
    onShown: function () {
        console.log('Toast visible at', new Date());
    },
    onHidden: function () {
        document.dispatchEvent(new CustomEvent('session:warning-dismissed'));
    },
});
```

---

## [Hover Pause & Container Behaviour](#behavior)

### Hover pause & progress bar

When both `autohide` and `progress` are `true`, the toast renders a thin animated bar at the bottom that shrinks from 100% to 0% over the autohide `delay`. Hovering the toast pauses both the bar and Bootstrap's autohide timer; `mouseleave` re-arms them.

The progress bar uses CSS classes `.hljs-toast-progress` and `.hljs-toast-progress-bar`. Add this minimal default:

```css
.hljs-toast-progress {
    height: 3px;
    background: rgba(0,0,0,.06);
    overflow: hidden;
}
.hljs-toast-progress-bar {
    height: 100%;
    background: currentColor;
    width: 100%;
}
```

### Container lifecycle

Position containers are created lazily on first use and removed when the last toast at that position dismisses.

1. **Container miss** — first call to `position: 'bottom-end'` creates `div.toast-container.position-fixed.p-3.bottom-0.end-0` and appends it to `<body>`. The DOM reference is cached in the `containers` registry.
2. **Container hit** — subsequent calls to the same position retrieve the cached container and append the new toast inside it.
3. **Container cleanup** — when a toast fires `hidden.bs.toast` and the container has no more children, the container is removed from the DOM and de-registered.

---

## [Recipe **Cookbook**](#recipes)

#### Save success

```js
themestrap.PluginToast.show({
    title: 'Saved',
    body:  'Your settings have been updated.',
    type:  'success'
});
```

#### API failure

```js
fetch('/api/orders').catch(err => {
    themestrap.PluginToast.show({
        title:    'Network error',
        body:     err.message,
        type:     'danger',
        autohide: false,    // stays until clicked
        position: 'top-center'
    });
});
```

#### Persistent connection-lost banner

```js
const t = themestrap.PluginToast.show({
    title:       'Reconnecting…',
    body:        'You are offline. Retrying in 5s.',
    type:        'warning',
    autohide:    false,
    dismissible: false,
    position:    'bottom-center'
});

// Later, when reconnected:
t.hide();
```

#### Undo prompt

```js
themestrap.PluginToast.show({
    title: 'Item moved to trash',
    body:  '<a href="#" id="undo-link">Undo</a>',
    type:  'dark',
    delay: 8000,
    onShown: function () {
        document.getElementById('undo-link')
            ?.addEventListener('click', e => {
                e.preventDefault();
                this.hide();
                restoreItem();
            });
    }
});
```

#### Toast from server-rendered data attribute

```html
<div id="welcomeBack"
     data-plugin-toast
     data-plugin-toast-title="Welcome back, Alex"
     data-plugin-toast-body="Last seen 3 hours ago"
     data-plugin-toast-type="info"
     data-plugin-toast-position="top-end"></div>

<script>
  $('#welcomeBack').themestrapPluginToast();
</script>
```

---

## [Common **Pitfalls**](#pitfalls)

**`"bootstrap is not defined"`.** PluginToast relies on Bootstrap 5's bundled JS for the native `bootstrap.Toast` class. Load `bootstrap.bundle.min.js` — NOT `bootstrap.min.js`, which omits the toast component. Verify with `typeof bootstrap.Toast === 'function'` in the browser console.

**Progress bar invisible.** The plugin emits `.hljs-toast-progress` and `.hljs-toast-progress-bar` elements but ships no CSS for them. Add the minimal block shown in the Hover Pause section above.

**Toasts at different positions don't stack together.** Each position has its own container. Two toasts with different `position` values render in two independent containers. To stack them, pass the same `position` string to both calls.

**Body content is HTML.** The `body` string is injected via `.toast-body`'s innerHTML — untrusted input must be escaped on the server. The plugin does _not_ sanitise.

### Diagnostic checklist

- Does `typeof bootstrap.Toast` return `'function'`?
- Is `themestrap.PluginToast` defined?
- Does the toast container appear in the DOM (search for `.toast-container`)?
- Is the toast inside the container but not visible? Check `z-index` conflicts.
- Is the position string one of the nine documented values?
- Is `progress` true but the bar invisible? Add the CSS block above.
