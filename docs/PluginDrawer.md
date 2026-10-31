# PluginDrawer

An accessible panel that slides in from any edge of the screen: bottom (the default), top, left or right. It brings its own backdrop, locks page scroll, traps focus, closes on Escape, and bottom and top drawers can be dragged away by their handle.

**File:** `js/components/themestrap.plugin.drawer.js`  
**Demo:** `demos/plugin.demo.drawer.html`  
**jQuery method:** `$.fn.themestrapPluginDrawer`  
**Data attribute:** `data-plugin-drawer`  
**Instance key:** `__pluginDrawer`  
**Init strategy:** DOMReady `$().each()`, so every drawer is ready before a trigger can be clicked.



## How It Works

A drawer is a fixed, full-screen root element (`[data-plugin-drawer]`) holding two layers: a translucent backdrop and the panel. The panel sits just off-screen on its edge and slides in with a CSS transform.

On `build()` the plugin:

1. Injects its stylesheet once (`<style id="ts-drawer-styles">`).
2. Adds `role="dialog"` (unless the root already has a role), `aria-modal="true"`, `aria-hidden="true"` and `tabindex="-1"` to the root.
3. Wires `[data-drawer-title]` to `aria-labelledby` and `[data-drawer-description]` to `aria-describedby`, generating ids when they are missing.
4. Injects a `[data-drawer-backdrop]` if the markup has none (when `backdrop: true`).
5. Injects a drag handle for bottom and top drawers (when `showHandle: true`): first inside the panel for a bottom drawer, last for a top drawer.
6. Adds `.drawer-root`, `.drawer-{direction}` and `.drawer-hidden`.

### Open lifecycle

1. The element that had focus is remembered.
2. `<body>` gets `.ts-scroll-lock` (when `scrollLock: true`).
3. `.drawer-hidden` is swapped for `.drawer-is-open` and `aria-hidden` becomes `false`.
4. A forced reflow, then `.drawer-open` is added. That class is the transition target: the panel slides in and the backdrop fades in together.
5. After 50 ms focus moves to the first visible focusable element in the drawer, or to the root when there is none.
6. Tab and Shift+Tab are trapped inside the drawer.
7. `onOpen` runs and `drawer:open` fires.

### Close lifecycle

1. `isOpen` becomes `false`, the focus trap is removed and `.drawer-open` is taken off, so the panel slides out and the backdrop fades.
2. After `transitionDuration + 50` ms the root gets `.drawer-hidden` again, the scroll lock is released, and focus returns to the element that opened the drawer.
3. `onClose` runs and `drawer:close` fires.

Calling `open()` before step 2 cancels the rest: the panel slides back in and nothing is hidden or unlocked. A drag-to-dismiss takes the same path, so it also removes the focus trap.

### Drag to dismiss

Dragging only starts from the handle, so scrolling the panel's content never closes it by accident. While dragging, the panel's transition is switched off and it follows the pointer 1:1, clamped so it can only move toward its own edge. On release it closes when either:

- the distance dragged is more than `dragThreshold` × the panel's height, or
- the release speed is more than `velocityThreshold` px/ms (a flick).

Otherwise it snaps back open.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.drawer.js"></script>
```

`themestrap.js` provides `themestrap.fn.getOptions` and measures the scrollbar width into `--ts-scrollbar-width`, which the scroll lock uses to stop the page shifting sideways.

### 2. Mark it up

```html
<!-- Trigger, anywhere on the page -->
<button data-drawer-open="share-sheet">Share</button>

<!-- Drawer root -->
<div data-plugin-drawer id="share-sheet">
    <div data-drawer-backdrop></div>
    <div data-drawer-panel>
        <h2 data-drawer-title>Share this page</h2>
        <p data-drawer-description>Send a link or copy it.</p>

        <!-- content -->

        <button data-drawer-close>Cancel</button>
    </div>
</div>
```

### 3. Initialize

`themestrap.init.js` initializes every `[data-plugin-drawer]` on DOMReady, so including it is enough. Without `init.js`, use the same block on your page:

```js
if (typeof $.fn.themestrapPluginDrawer === 'function' && $('[data-plugin-drawer]').length) {
    $(() => {
        $('[data-plugin-drawer]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginDrawer(opts);
        });
    });
}
```

### Manual init

Add `.manual` to keep auto-init away from a drawer, then initialize it yourself:

```html
<div data-plugin-drawer id="cart" class="manual"> ... </div>
```

```js
$('#cart').themestrapPluginDrawer({ direction: 'right', scrollLock: false });
const cart = $('#cart').data('__pluginDrawer');
```



## Markup Reference

| Attribute | On | Role |
| - | - | - |
| `data-plugin-drawer` | Root | Marks the drawer. Give it an `id` so triggers can find it. |
| `data-plugin-options` | Root | JSON options, read by `themestrap.fn.getOptions`. |
| `data-drawer-backdrop` | Inside the root | The overlay. Injected automatically when missing and `backdrop: true`. |
| `data-drawer-panel` | Inside the root | The sliding panel. **Required.** |
| `data-drawer-handle` | Inside the panel | The drag handle. Injected for bottom and top drawers. Add it yourself to choose where it goes. |
| `data-drawer-title` | Inside the panel | Becomes the drawer's accessible name (`aria-labelledby`). |
| `data-drawer-description` | Inside the panel | Becomes its description (`aria-describedby`) and is styled in the muted color. |
| `data-drawer-close` | Inside the drawer | Any element that closes the drawer when clicked. |
| `data-drawer-open="id"` | Anywhere | A trigger. Opens the drawer whose `id` matches. |

### Directions

```html
<div data-plugin-drawer id="sheet"></div>                                              <!-- bottom -->
<div data-plugin-drawer id="notice" data-plugin-options='{"direction": "top"}'></div>
<div data-plugin-drawer id="menu"   data-plugin-options='{"direction": "left"}'></div>
<div data-plugin-drawer id="filter" data-plugin-options='{"direction": "right"}'></div>
```

Bottom and top panels span the full width and grow up to `--ts-drw-max-h` (85% of the viewport). Left and right panels are full height and `--ts-drw-side-w` wide (380 px, or 85% of a narrow screen). Padding respects the device's safe areas (`env(safe-area-inset-*)`), so sheets clear the iPhone home indicator.

### Placing the handle yourself

```html
<div data-drawer-panel>
    <header class="sheet-header">
        <div data-drawer-handle></div>
        <h2 data-drawer-title>Cart</h2>
    </header>
    ...
</div>
```

The plugin only looks for an existing handle inside the root, so a hand-placed one is used as is. Side drawers hide every handle with CSS and have no drag.

### State classes

| Class | When |
| - | - |
| `.drawer-root` | Always, once initialized. |
| `.drawer-bottom` `.drawer-top` `.drawer-left` `.drawer-right` | The direction. |
| `.drawer-hidden` | Closed: `display: none`. |
| `.drawer-is-open` | Open or opening, from the moment it is shown until it is hidden again. |
| `.drawer-open` | The transition target: panel in, backdrop visible. |
| `body.ts-scroll-lock` | While a drawer with `scrollLock: true` is open. |



## Configuration Options

Pass options as an object to `themestrapPluginDrawer()` or as JSON in `data-plugin-options`.

| Option | Type | Default | Description |
| - | - | - | - |
| `direction` | `string` | `'bottom'` | Edge the panel slides from: `'bottom'`, `'top'`, `'left'` or `'right'`. |
| `backdrop` | `boolean` | `true` | Make sure a `[data-drawer-backdrop]` exists, injecting one when missing. With `false` the backdrop is not wired at all (see Pitfalls). |
| `closeOnBackdrop` | `boolean` | `true` | Close when the backdrop is clicked. |
| `closeOnEscape` | `boolean` | `true` | Close on the Escape key. |
| `scrollLock` | `boolean` | `true` | Add `.ts-scroll-lock` to `<body>` while open. |
| `showHandle` | `boolean` | `true` | Inject a drag handle for bottom and top drawers. |
| `draggable` | `boolean` | `true` | Allow drag to dismiss from the handle. Needs a handle. |
| `dragThreshold` | `number` | `0.4` | Close when dragged further than this fraction of the panel's size. |
| `velocityThreshold` | `number` | `0.5` | Close when released faster than this, in px per ms. |
| `transitionDuration` | `number` | `320` | Milliseconds to wait before hiding after a close. Keep it equal to `--ts-drw-dur`. |
| `onOpen` | `function\|null` | `null` | Called as the open transition starts. `this` is the instance; receives the root as a jQuery object. |
| `onClose` | `function\|null` | `null` | Called after the close transition ends. Same arguments. |

```html
<div data-plugin-drawer id="release-notes"
     data-plugin-options='{"dragThreshold": 0.25, "velocityThreshold": 0.6}'> ... </div>
```

A drawer the reader cannot dismiss by accident:

```html
<div data-plugin-drawer id="terms"
     data-plugin-options='{"closeOnBackdrop": false, "closeOnEscape": false, "showHandle": false, "draggable": false}'> ... </div>
```



## Public API

Read the instance from a fresh selection. Never chain `.data()` off the init call, which returns the instances mapped by `.map()`, not the element.

```js
/* correct */
$('#cart').themestrapPluginDrawer({ direction: 'right' });
const drw = $('#cart').data('__pluginDrawer');

/* wrong */
const drw = $('#cart').themestrapPluginDrawer().data('__pluginDrawer');
```

The jQuery bridge takes an options object only. It does not accept string commands such as `'open'`; call methods on the instance.

### `open()` → `this`

Opens the drawer. Does nothing when it is already open. Called while a close is still running, it cancels the close and slides the drawer back in, keeping the original focus target.

### `close()` → `this`

Starts the close transition and sets `isOpen` to `false` at once. The drawer is hidden, the scroll lock released and focus restored `transitionDuration + 50` ms later, unless `open()` is called first. Does nothing when already closed or closing.

### `toggle()` → `this`

`close()` when `isOpen` is true, otherwise `open()`.

### `destroy()` → `this`

Cancels any pending close, releases the scroll lock if open, removes every listener (trigger, close, backdrop, Escape, focus trap and drag), removes the backdrop and handle it injected (yours stay), removes the ARIA attributes and the `role` it added, clears its classes, and removes the instance from jQuery data. The element then shows as ordinary markup, so re-initialize it straight away or hide it.

Re-initializing with other options is a plain destroy and init:

```js
$('#cart').data('__pluginDrawer').destroy();
$('#cart').themestrapPluginDrawer({ direction: 'left' });
```

### Properties

| Property | Type | Description |
| - | - | - |
| `isOpen` | `boolean` | `true` from `open()` until `close()` is called. It turns `false` as the close transition starts. |
| `options` | `object` | The merged options. |
| `$el` | `jQuery` | The root. |
| `$panel` | `jQuery` | `[data-drawer-panel]`. |
| `$backdrop` | `jQuery\|null` | The backdrop, or `null` when `backdrop: false`. |
| `$handle` | `jQuery\|null` | The handle, or `null` for side drawers or `showHandle: false`. |



## Events

Both events are **jQuery events** triggered on the root with `$el.trigger()`. They bubble through jQuery, and the instance is passed as the second argument. Listen with `.on()`: `addEventListener` does not see events fired by `.trigger()`.

| Event | When | Handler arguments |
| - | - | - |
| `drawer:open` | As the open transition starts | `(event, instance)` |
| `drawer:close` | After the close transition ends and focus is restored | `(event, instance)` |

```js
$('#cart').on('drawer:open', function (e, drw) {
    console.log('opened', drw.options.direction);
});

/* every drawer on the page */
$(document).on('drawer:close', '[data-plugin-drawer]', function (e, drw) {
    console.log(this.id, 'closed');
});
```



## CSS Custom Properties

All tokens are declared on `:root`. Override them there for every drawer, or on one drawer's root for just that one.

| Token | Light | Dark | Used for |
| - | - | - | - |
| `--ts-drw-bg` | `#ffffff` | `#1e2939` | Panel and handle strip background |
| `--ts-drw-overlay` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.7)` | Backdrop color (with a 2 px blur) |
| `--ts-drw-shadow-b` | soft upward shadow | deeper | Bottom panel shadow |
| `--ts-drw-shadow-t` | soft downward shadow | deeper | Top panel shadow |
| `--ts-drw-shadow-l` | soft shadow to the right | deeper | Left panel shadow |
| `--ts-drw-shadow-r` | soft shadow to the left | deeper | Right panel shadow |
| `--ts-drw-radius` | `1rem` | same | Corner radius on the panel's inner edge |
| `--ts-drw-handle` | `rgba(0,0,0,.18)` | `rgba(255,255,255,.22)` | Handle pill |
| `--ts-drw-handle-hover` | `rgba(0,0,0,.30)` | `rgba(255,255,255,.38)` | Handle pill on hover and while dragging |
| `--ts-drw-text-muted` | `#6b7280` | `#9ca3af` | `[data-drawer-description]` |
| `--ts-drw-max-h` | `85svh` | same | Maximum height of bottom and top panels |
| `--ts-drw-side-w` | `min(380px, 85vw)` | same | Width of left and right panels |
| `--ts-drw-pad` | `1.5rem` | same | Panel padding |
| `--ts-drw-dur` | `320ms` | same | Transition duration (match `transitionDuration`) |
| `--ts-drw-ease` | `cubic-bezier(0.32, 0.72, 0, 1)` | same | Panel easing |

```css
/* one branded drawer */
#upgrade-sheet {
    --ts-drw-bg:           #0e2238;
    --ts-drw-radius:       1.5rem;
    --ts-drw-handle:       rgba(32, 226, 215, .55);
    --ts-drw-handle-hover: #20e2d7;
}
#upgrade-sheet [data-drawer-panel] { color: #e2eaf4; }
```

### Dark mode

The plugin uses the three-tier pattern shared by every Themestrap plugin, so drawers always agree with PluginDarkMode:

| Tier | Selector |
| - | - |
| System preference | `@media (prefers-color-scheme: dark)` |
| Explicit dark | `html.dark`, `[data-bs-theme="dark"]` |
| Explicit light override | `[data-bs-theme="light"]` |

Because the tier 2 and 3 selectors match any element, `data-bs-theme="dark"` on a single drawer's root turns just that drawer dark.

### Reduced motion

Under `prefers-reduced-motion: reduce` the panel and backdrop transitions drop to 0.01 ms, so drawers appear and disappear without sliding.



## Keyboard Navigation

| Key | Action |
| - | - |
| `Enter` / `Space` on a trigger | Opens the drawer (triggers are ordinary buttons). |
| `Tab` | Moves to the next focusable element. From the last one, wraps to the first. |
| `Shift` + `Tab` | Moves backwards. From the first one, wraps to the last. |
| `Escape` | Closes the drawer (when `closeOnEscape: true`). |

Focus moves into the drawer when it opens and returns to the trigger when it closes. Drag to dismiss is pointer-only, so always give a drawer a visible close button or keep `closeOnEscape` on.



## ARIA Wiring

```
[div data-plugin-drawer]                 the root
    role="dialog"                        unless a role is already set
    aria-modal="true"
    aria-hidden="true | false"
    aria-labelledby="{title id}"         when [data-drawer-title] exists
    aria-describedby="{description id}"  when [data-drawer-description] exists
    tabindex="-1"

    [div data-drawer-backdrop]
    [div data-drawer-panel]
        [div data-drawer-handle]  role="presentation"   (when injected)
        [h2 data-drawer-title]    id="drawer-title-{n}-{rand}"   (when it had none)
        [p data-drawer-description] id="drawer-desc-{n}-{rand}"
```

An `aria-labelledby` or `aria-describedby` already on the root is left alone, and so is an existing `role`. For a navigation drawer, keep the root as a dialog and put a `<nav aria-label="Main">` inside the panel.



## Recipes

### Open from code

```js
$(function () {
    if (!localStorage.getItem('seen-tour')) {
        $('#tour').data('__pluginDrawer').open();
        localStorage.setItem('seen-tour', '1');
    }
});
```

### Load content when it opens

```js
$('#order-sheet').on('drawer:open', async function (e, drw) {
    const html = await fetch('/orders/latest').then(r => r.text());
    drw.$panel.find('.sheet-body').html(html);
});
```

### Side drawer below a breakpoint, nothing above it

```js
const mq  = window.matchMedia('(min-width: 992px)');
const nav = $('#side-nav').data('__pluginDrawer');
mq.addEventListener('change', e => { if (e.matches && nav.isOpen) nav.close(); });
```

Show the trigger only on small screens (`class="d-lg-none"`) and render the same links inline on large ones.

### A select or form inside a drawer

Drawers work well as filter panels. PluginSelect, PluginNumberInput and native fields all take part in the focus trap. Keep the submit button inside the panel and close the drawer from your submit handler:

```js
$('#filters form').on('submit', function (e) {
    e.preventDefault();
    applyFilters(new FormData(this));
    $('#filters').data('__pluginDrawer').close();
});
```

### Change the direction later

```js
const $panel = $('#panel');

function rebuild() {
    $panel.data('__pluginDrawer').destroy();
    $panel.themestrapPluginDrawer({ direction: 'left' });
}

// .drawer-is-open stays on until the close transition has finished
if ($panel.hasClass('drawer-is-open')) {
    $panel.one('drawer:close', rebuild);
    $panel.data('__pluginDrawer').close();
} else {
    rebuild();
}
```



## Common Pitfalls

### Text is invisible inside the panel

The panel sets a background but no text color, so it inherits the page's. On a dark page with a light drawer (or the other way round) the text matches the background. Set a color on the panel:

```css
.drawer-root [data-drawer-panel] { color: #1f2937; }
```

### `addEventListener('drawer:open')` never fires

The events come from jQuery's `.trigger()`, which native listeners do not receive. Use `$(el).on('drawer:open', ...)`.

### Triggers do nothing

`data-drawer-open` matches the drawer's `id`. A drawer without an `id` still works from code but has no triggers. Also check that the drawer was initialized: `themestrap.init.js` must be on the page, and a `.manual` drawer needs your own init call.

### A long sheet opens scrolled to the bottom

On open, focus goes to the first focusable element. If the only one is a Close button at the end of a tall sheet, the browser scrolls the panel down to it. Put a close button (or another control) near the top.

### Escape closes more than one drawer

Each open drawer listens for Escape on the document, so with two drawers open, one Escape closes both. Avoid stacking drawers, or set `closeOnEscape: false` on the lower one.

### The page scrolls again while a drawer is still open

The scroll lock is one class on `<body>`. Closing any drawer, dialog or command menu that uses `.ts-scroll-lock` removes it, even if another one is still open.

### Backdrop clicks do nothing with `backdrop: false`

`closeOnBackdrop` only wires the backdrop the plugin found or injected. With `backdrop: false` that reference is `null`, so a `[data-drawer-backdrop]` in your markup is drawn but not clickable. Keep `backdrop: true` if you want click-to-close.

### No drag on side drawers

Left and right drawers get no handle, and CSS hides one if you add it. They close through the backdrop, Escape or a close button.

### The close feels cut short or lingers

`transitionDuration` (JavaScript) and `--ts-drw-dur` (CSS) must match. If the CSS is slower, the drawer is hidden mid-slide; if the JavaScript is slower, the page stays locked after the panel has gone.

### Diagnostic checklist

- [ ] The root has `data-plugin-drawer` and an `id`, and triggers use `data-drawer-open` with that `id`.
- [ ] `[data-drawer-panel]` exists inside the root.
- [ ] `themestrap.js` loads before the plugin, and both load after jQuery.
- [ ] `themestrap.init.js` is loaded after the plugin, or the drawer is initialized by hand (always, when it has `.manual`).
- [ ] The panel has a text color that contrasts with `--ts-drw-bg`.
- [ ] There is a visible close button, or `closeOnEscape` is on.
- [ ] Event listeners use jQuery `.on()`.
- [ ] `transitionDuration` equals `--ts-drw-dur`.
- [ ] Instances are read with a fresh `$(selector).data('__pluginDrawer')`.
