# Popover Guide

Themestrap's anchor-positioned popover plugin — accessible, CSS-arrow-decorated popovers with portal mode, dark mode, mutual exclusion, focus trapping, and full keyboard dismissal.

A lightweight, accessible popover primitive. Wrap a trigger and a content panel in `[data-plugin-popover]`, and the plugin handles positioning (with viewport-flip fallback), a CSS arrow, focus trapping, Escape dismissal, click-outside closing, and mutual exclusion so only one popover can be open at a time. An optional portal mode moves the content panel to `<body>` at open time so `overflow: hidden` ancestors can't clip it.

---

## [How It **Works**](#how-it-works)

PluginPopover coordinates three concerns: positioning (CSS anchor or manual `getBoundingClientRect` fallback), ARIA wiring (trigger ↔ panel relationship), and mutual exclusion (only one popover open per page at a time).

### Closed state

> The content panel has `display: none` and no transform or position rules. The trigger carries `aria-expanded="false"` and `aria-haspopup="dialog"`. The document-level click listener is armed and waiting.
>
> - Panel: `display: none`, no inline `top`/`left`
> - Trigger: `aria-expanded="false"`
> - Global click listener: active (checks for outside-click)

### Open state

> The panel is moved to its placement position (CSS `anchor()` or manual pixel values), receives `.ts-popover--open` and the entrance animation class, and is focused at `[data-popover-close]` (if present) or the panel itself. The body receives `ts-popover-open` so external CSS can dim the page if desired.
>
> - Panel: `.ts-popover--open`, `aria-hidden="false"`
> - Trigger: `aria-expanded="true"`, `aria-controls` set
> - Body: `.ts-popover-open`

### Mutual exclusion

Only one popover may be open at a time. The plugin dispatches a `ts-popover-opened` custom event on `document` when any instance opens. All other instances listen for this event and close themselves before the new one finishes opening.

> [!NOTE]
> **Event name uses hyphens, not colons.** <br>
> jQuery's `.off()` uses `.` as a namespace separator and `:` in event names causes silent parsing failures. The plugin uses `ts-popover-opened` (hyphenated) for all mutual-exclusion dispatch.

### Portal mode

When `portaling: true` and the popover opens, the content panel is detached from its original parent and appended to `<body>`. Its original parent is cached in `_$originalParent`. When the popover closes the panel is restored. This lets the popover escape any ancestor with `overflow: hidden` or a clipping stacking context.

---

## [Quick **Start**](#quick-start)

### Markup contract

Wrap a trigger and a content panel together inside the root element:

```html
<div data-plugin-popover
     data-plugin-options='{"side":"bottom","align":"start"}'>

  <button data-popover-trigger type="button">
    Open Popover
  </button>

  <div data-popover-content>
    <button data-popover-close type="button" aria-label="Close">×</button>
    <strong>Popover Title</strong>
    <p>Some descriptive text.</p>
    <a href="/learn-more">Learn more -></a>
  </div>

</div>
```

### Init

```js
// Manual init
$('[data-plugin-popover]').themestrapPluginPopover({
    side:  'bottom',
    align: 'start'
});

// Auto-init wired in themestrap.init.js
if ($.isFunction($.fn['themestrapPluginPopover']) &&
    $('[data-plugin-popover]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-popover]:not(.manual)',
    'themestrapPluginPopover'
  );
}
```

> [!TIP]
>  The plugin injects one stylesheet per page (`<style id="ts-popover-styles">`). Colors, shadow, and border-radius are all `--ts-pop-*` CSS custom properties — override them on the root element or globally rather than modifying the injected sheet.

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `side` | string | `'bottom'` | Preferred placement side: `top`, `bottom`, `left`, `right`. Flips automatically when the popover would overflow the viewport. |
| `align` | string | `'start'` | Alignment along the cross axis: `start`, `center`, `end`. |
| `offset` | number | `8` | Gap in px between the trigger's edge and the popover panel. |
| `arrow` | bool | `true` | Render a CSS arrow pointing from the panel toward the trigger. |
| `portaling` | bool | `false` | On open, move the content panel to `<body>` so it escapes `overflow:hidden` ancestors. Restored on close. |
| `closeOnOutsideClick` | bool | `true` | Click anywhere outside the root to close. |
| `closeOnEscape` | bool | `true` | Press `Escape` to close. Focus returns to the trigger. |
| `dark` | bool | `false` | Dark color scheme. |
| `animationIn` | string | `'ts-popover-in'` | CSS class added to the panel on open. |
| `animationOut` | string | `'ts-popover-out'` | CSS class added to the panel on close (removed after `animationDuration`). |
| `animationDuration` | number | `160` | Fallback timeout in ms in case `animationend` never fires. |
| `onOpen` | function | `null` | Callback after the panel opens. Receives `(instance)`. |
| `onClose` | function | `null` | Callback after the panel finishes closing. Receives `(instance)`. |

### CSS custom property overrides

```css
/* Global override */
.ts-popover {
  --ts-pop-bg:      #fff;
  --ts-pop-border:  rgba(0,0,0,.08);
  --ts-pop-shadow:  0 8px 32px rgba(0,0,0,.12);
  --ts-pop-radius:  10px;
  --ts-pop-offset:  8px;     /* mirrors the `offset` option */
  --ts-pop-arrow:   8px;     /* arrow size */
}

/* Per-instance dark override */
.pricing-card [data-plugin-popover] {
  --ts-pop-bg:     #0e2238;
  --ts-pop-border: rgba(255,255,255,.1);
  --ts-pop-fg:     #f0e6d3;
}
```

---

## [Placement **System**](#placement)

### Side + align pairs

| `side` | `align` | Result |
|--------|---------|--------|
| `bottom` | `start` | Panel below trigger, left-aligned |
| `bottom` | `center` | Panel below trigger, centered |
| `bottom` | `end` | Panel below trigger, right-aligned |
| `top` | `start` | Panel above trigger, left-aligned |
| `left` | `center` | Panel left of trigger, vertically centered |
| `right` | `end` | Panel right of trigger, bottom-aligned |

### Viewport-flip logic

Before positioning, the plugin checks whether the panel would overflow its preferred side. If it would:

1. Try the opposite side (`bottom` -> `top`, `left` -> `right`).
2. If that also overflows, fall back to the original side and let the panel clip (rarely reached with `offset: 8`).

The flip is silent — no class is added, no event fires. It recalculates on every open.

### CSS Anchor API (progressive enhancement)

When the browser supports `CSS.supports('anchor-name', '--x')`, the plugin uses CSS `anchor()` for positioning — zero JavaScript layout math, sub-pixel accurate, reflows automatically when the trigger moves. On unsupported browsers it falls back to manual `getBoundingClientRect()` calculations.

---

## [Portal **Mode**](#portal)

Use portal mode whenever an ancestor of the popover root has `overflow: hidden`, a CSS `transform`, or a stacking context that would clip the panel.

```html
<!-- overflow:hidden ancestor clips the popover panel without portaling -->
<div style="overflow:hidden; position:relative">
  <div data-plugin-popover
       data-plugin-options='{"portaling":true,"side":"right"}'>
    <button data-popover-trigger>Info</button>
    <div data-popover-content>…</div>
  </div>
</div>
```

### What portaling does

1. **On open:** `data-popover-content` is detached and appended to `<body>`. Its `originalParent` is cached on the instance as `_$originalParent`.
2. **While open:** The panel is positioned with `position: fixed` and pixel values computed from the trigger's `getBoundingClientRect()`.
3. **On close:** The panel is re-attached to `_$originalParent` at its original DOM position.

> [!WARNING]
>  In portal mode the panel is removed from its original DOM position while open. Any CSS that inherits from the popover root (custom property overrides, cascade) will be lost when the panel is on `<body>`. Pass styles via the panel element's own `style` attribute or via a global rule.

> [!WARNING]
>  Restoring the panel to `_$originalParent` on close is what prevents orphaned DOM nodes. Always call `destroy()` before removing the popover root from the DOM — `destroy()` calls `close()` first, which restores the panel before the root is gone.

---

## [Instance **API**](#instance-api)

```js
const pop = $('[data-plugin-popover]').data('__pluginPopover');

pop.open();
pop.close();
pop.toggle();
pop.destroy();
```

| Method | Returns | Description |
|--------|---------|-------------|
| `open()` | this | Show the popover. If another popover is open, mutual exclusion closes it first. |
| `close()` | this | Hide the popover. Runs the exit animation, then restores the portal panel if applicable. |
| `toggle()` | this | Open if closed; close if open. |
| `isOpen()` | bool | Whether the panel is currently visible. |
| `destroy()` | this | Close, restore portal, unbind all listeners, clear ARIA, and remove the instance from data. |

### Events

Lifecycle events bubble from the root element:

```js
$('[data-plugin-popover]')
  .on('popover:open',   (e, inst) => console.log('opened'))
  .on('popover:close',  (e, inst) => console.log('closed'));
```

| Event | Arguments | Fires |
|-------|-----------|-------|
| `popover:open` | `(e, instance)` | After the panel is positioned and the entrance animation starts. |
| `popover:close` | `(e, instance)` | After the exit animation completes and the panel is hidden. |

---

## [Mutual **Exclusion**](#mutual-exclusion)

All popover instances on a page share a single mutual exclusion channel via a custom DOM event dispatched on `document`.

When `open()` runs:
1. The instance dispatches `ts-popover-opened` on `document` with a reference to itself.
2. Every other live instance listens for this event and calls `close()` on itself if it is currently open.
3. The new instance then positions and shows its panel.

This requires no shared registry — instances are self-managing. Adding a new popover to the page does not require touching any existing code.

```js
// Listen for any popover opening anywhere on the page
document.addEventListener('ts-popover-opened', (e) => {
    console.log('a popover opened', e.detail?.instance);
});
```

---

## [Focus **Management**](#focus)

The plugin applies a minimal focus trap while a popover is open.

- **On open:** Focus moves to `[data-popover-close]` if present, otherwise to the panel element itself (which receives `tabindex="-1"` during the transition).
- **Tab / Shift+Tab:** Constrained to focusable elements inside `[data-popover-content]`.
- **Escape:** Closes the popover and returns focus to the trigger.
- **On close:** Focus is explicitly returned to the trigger element (`[data-popover-trigger]`).

> [!NOTE]
> Hover cards and decorative popovers that should _not_ trap focus can opt out by adding `data-popover-no-trap` to the content panel. Focus then moves freely even while the popover is open.

---

## [Recipe **Cookbook**](#recipes)

#### Simple info tooltip

```html
<div data-plugin-popover
     data-plugin-options='{"side":"top","align":"center","arrow":true}'>
  <button data-popover-trigger type="button"
          class="btn btn-sm btn-icon" aria-label="Help">
    <i class="fas fa-question-circle"></i>
  </button>
  <div data-popover-content style="max-width:220px">
    <p class="mb-0">This field expects an ISO 8601 date string.</p>
  </div>
</div>
```

#### Rich card popover (portal mode)

```html
<div data-plugin-popover
     data-plugin-options='{"portaling":true,"side":"right","align":"start"}'>

  <button data-popover-trigger class="avatar-btn">
    <img src="/avatar.jpg" class="avatar" alt="Profile">
  </button>

  <div data-popover-content class="profile-card">
    <button data-popover-close class="btn-close" aria-label="Close"></button>
    <img src="/avatar.jpg" class="avatar-lg" alt="">
    <h5>Alexandra Chen</h5>
    <p class="text-muted">Product Designer</p>
    <a href="/profile" class="btn btn-sm btn-primary">View Profile</a>
  </div>

</div>
```

#### Dark popover

```html
<div data-plugin-popover
     data-plugin-options='{"dark":true,"side":"bottom"}'>
  <button data-popover-trigger>Settings</button>
  <div data-popover-content>
    <ul class="list-unstyled mb-0">
      <li><a href="/settings">Preferences</a></li>
      <li><a href="/logout">Sign out</a></li>
    </ul>
  </div>
</div>
```

#### Programmatic control

```js
const pop = $('#infoPopover').data('__pluginPopover');

// Open after a delay
setTimeout(() => pop.open(), 2000);

// Close from an external button
$('#dismiss').on('click', () => pop.close());

// Toggle on a keyboard shortcut
$(document).on('keydown', e => {
  if (e.key === 'i' && e.metaKey) pop.toggle();
});
```

#### React to open/close

```js
$('[data-plugin-popover]')
  .on('popover:open', (e, inst) => {
    analytics.track('popover_open', { id: inst.$root.attr('id') });
  })
  .on('popover:close', (e, inst) => {
    analytics.track('popover_close', { id: inst.$root.attr('id') });
  });
```

---

## [Common **Pitfalls**](#pitfalls)

**Panel clipped by `overflow: hidden`.** Any ancestor between the popover root and `<body>` with `overflow: hidden` (or `overflow: clip`) will clip the panel. Enable portal mode (`portaling: true`) to escape it.

**CSS cascade lost in portal mode.** When portaled, the panel is a direct child of `<body>`. Custom properties set on the popover root or any ancestor are no longer inherited. Pass per-instance overrides on the `[data-popover-content]` element's own `style` attribute, or write a global rule.

**Mutual exclusion uses `ts-popover-opened` (hyphenated).** If you are manually dispatching or listening for this event, use hyphens — not colons. jQuery's `.off()` parsing treats `:` as a namespace separator and will silently fail to unbind.

**Destroying the root without calling `destroy()`.** If you remove `[data-plugin-popover]` from the DOM while the popover is open and `portaling: true`, the content panel (now on `<body>`) becomes an orphan. Always call `instance.destroy()` before removing the root element from the DOM.

**Arrow misaligned on `align: center`.** Arrow centering depends on the content panel having a defined width. If the panel grows to fit content without a `max-width` or explicit `width`, the arrow may drift. Set `max-width` on `[data-popover-content]` for centered or end-aligned popovers.

### Diagnostic checklist

> - Is `<style id="ts-popover-styles">` present in `<head>` after init?
> - Does `$('[data-plugin-popover]').data('__pluginPopover')` return an instance?
> - Is `aria-expanded` toggling on the trigger? If not, click events are not wired.
> - Is the panel clipped? Enable `portaling: true`.
> - Are two popovers opening simultaneously? Check for duplicate `ts-popover-opened` listener removal in `destroy()`.
> - Is `closeOnOutsideClick` preventing a trigger inside a modal from working? Wrap both in the same root element so the outside-click boundary is correct.
