# Collapsible Guide

A framework-agnostic collapsible component. Give it a trigger element and a content panel (via `data-collapsible-trigger` / `data-collapsible-content`), and the plugin handles every detail: height-from-zero animation, `aria-expanded` sync, `prefers-reduced-motion` support, and a complete event lifecycle. Use it as the engine behind FAQs, sidebar drawers, mobile menu fly-outs, settings panels — anything that needs to grow and shrink with smooth easing.

## [How It **Works**](#how-it-works)

The plugin manages a single trigger <--> content pairing. On every state change it measures the panel's natural height, animates from `0` to `scrollHeight` (or vice versa), then clears the inline height so the panel reflows naturally when its contents change.

#### Closed state

> The content panel has `aria-hidden="true"`, `height: 0`, `overflow: hidden`, and the trigger has `aria-expanded="false"`. The panel is removed from the layout flow visually but remains in the DOM and is keyboard-focusable only if explicitly opened.
> 
> - Panel height pinned to `0`
> - Trigger `aria-expanded="false"`
> - State class `ts-collapsible--closed`

#### Open state

> During the transition the panel briefly carries an explicit pixel height equal to its content's `scrollHeight`. Once the `transitionend` event fires, the inline height is removed so the panel can grow/shrink naturally with its content.
> 
> - Inline `height` cleared post-transition
> - Trigger `aria-expanded="true"`
> - State class `ts-collapsible--open`

### Animation pipeline

The plugin avoids the classic "height auto can't be animated" trap by measuring, locking, then transitioning. Each direction has a slightly different sequence:

1. Opening — measure then animate
> Plugin reads `scrollHeight` of the content, applies it as an inline `height` in pixels, then forces a reflow before letting CSS transition from `0`. When the transition completes, `height` is removed so the panel becomes self-sizing again.

2. Closing — lock then collapse
> Plugin reads the current pixel height, applies it inline (overwriting `auto`), forces reflow, then sets `height: 0` and lets CSS transition. `overflow: hidden` is applied for the duration to clip mid-transition content.

3. Reduced motion override
> When `(prefers-reduced-motion: reduce)` matches, the duration override is bypassed entirely — state changes are instant. The plugin still emits all the same events so listeners stay portable.

> [!NOTE]
> The plugin injects a `<style id='ts-collapsible-styles'>` tag once per page (on first instantiation). Subsequent instances reuse the existing stylesheet so there isn't any per-instance style duplication.

## [Quick **Start**](#quick-start)

### Markup contract

A collapsible needs exactly two elements: a trigger and a panel. Pair them with a shared identifier:

```html
<button data-collapsible-trigger="faq-1" type="button">
  How do I reset my password?
</button>
<div data-collapsible-content="faq-1">
  <p>Click "Forgot password" on the login screen…</p>
</div>
```

### Initialize the pairing

```js
// Direct call — wires a specific trigger ↔ content pair by ID
$('[data-collapsible-trigger="faq-1"]').themestrapPluginCollapsible();

// Or batch-init every [data-collapsible-trigger] on the page
themestrap.fn.intObsInit(
    '[data-collapsible-trigger]',
    'themestrapPluginCollapsible'
);
```

> [!TIP]
> **Pair via matching ID strings.**
> The plugin walks the DOM looking for a `[data-collapsible-content]` with the same string value as the trigger's `[data-collapsible-trigger]`. The strings can be anything readable (i.e. `faq-1`, `checkout-billing`, `mobile-nav`).

## [Configuration **Options**](#options)

All options can be set via `data-plugin-options` JSON on the trigger element, or programmatically via `setOptions()`.

| Key           | Type   | Default   | Description                                                                          |
|---------------|--------|-----------|--------------------------------------------------------------------------------------|
| `defaultOpen` | bool   | `false`   | Start expanded on init. `aria-expanded` is set immediately, no animation runs.       |
| `disabled`    | bool   | `false`   | When true, the trigger is inert — clicks do nothing, focus styles are suppressed.    |
| `duration`    | string | `"300ms"` | CSS-compatible duration string. Sets `--ts-c-duration` on the content panel.         |
| `easing`      | string | `"ease"`  | CSS timing function. Sets `--ts-c-easing`. Use `cubic-bezier(...)` for fine control. |

### CSS custom properties

Duration and easing are passed to CSS via custom properties, so you can override per-instance or globally with a stylesheet rule:

```css
/* Global override — all collapsibles use a snappier curve */
[data-collapsible-content] {
  --ts-c-duration: 220ms;
  --ts-c-easing: cubic-bezier(.4, 0, .2, 1);
}

/* Per-instance override — slow, dramatic FAQ panels */
.faq-panel[data-collapsible-content] {
  --ts-c-duration: 480ms;
}
```

> [!WARNING]
> Because the plugin uses CSS transitions on `height`, the content panel must not have `display: none`, `visibility: hidden`, or `contain: layout` applied — those break `scrollHeight` measurement. Use the plugin's built-in state classes for styling instead.

## [Instance **API**](#instance-api)

Every initialized collapsible exposes an instance under `$el.data('__collapsible')`:

| Method              | Returns | Description                                                                                                                    |
|---------------------|---------|--------------------------------------------------------------------------------------------------------------------------------|
| `open()`            | void    | Expand the panel. No-op if already open or `disabled`. Fires `open.ts.collapsible` -> animates -> fires `opened.ts.collapsible`. |
| `close()`           | void    | Collapse the panel. Fires `close.ts.collapsible` -> animates -> fires `closed.ts.collapsible`.                                   |
| `toggle()`          | void    | Inverse of current state. Equivalent to `isOpen() ? close() : open()`.                                                         |
| `isOpen()`          | bool    | Returns whether the panel is currently expanded.                                                                               |
| `setDisabled(bool)` | void    | Toggle the disabled flag at runtime. Closes the panel if currently open.                                                       |
| `destroy()`         | void    | Remove all event listeners, clear inline styles, and drop the instance reference from `$el.data()`.                            |

### Event lifecycle

All four lifecycle events bubble from the trigger element. The opening / closing pair fire *before* the height transition starts; opened / closed fire *after* `transitionend`:

```js
$('[data-collapsible-trigger="faq-1"]')
  .on('open.ts.collapsible',   () => console.log('starting open'))
  .on('opened.ts.collapsible', () => console.log('fully open'))
  .on('close.ts.collapsible',  () => console.log('starting close'))
  .on('closed.ts.collapsible', () => console.log('fully closed'))
  .on('change.ts.collapsible', (e, {isOpen}) => console.log('now', isOpen));
```

> [!TIP]
> The `change.ts.collapsible` event fires on every state change with a `{{isOpen: bool}}` payload. Listen for that one if you only care about the final state — no need to handle both open and close events.

## [Recipe **Cookbook**](#recipes)

Common patterns. Each recipe is self-contained — copy, paste, customize.

Accordion-style FAQ

```html
<div class="faq">
  <button data-collapsible-trigger="q1">
    What is Themestrap?
    <i class="fas fa-chevron-down"></i>
  </button>
  <div data-collapsible-content="q1">
    <p>Themestrap is a Porto/Bootstrap-based UI kit…</p>
  </div>
</div>

<style>
.faq button[aria-expanded="true"] .fa-chevron-down {
  transform: rotate(180deg);
}
.faq button .fa-chevron-down {
  transition: transform 220ms ease;
}
</style>
```

Mobile nav fly-out

```html
<button data-collapsible-trigger="mobile-nav"
        class="d-md-none btn btn-icon">
  <i class="fas fa-bars"></i>
</button>
<nav data-collapsible-content="mobile-nav"
     class="d-md-none mobile-nav">
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<script>
$('[data-collapsible-trigger="mobile-nav"]')
  .themestrapPluginCollapsible({duration:'180ms'});
</script>
```

FormOptional form section

```html
<label class="form-check">
  <input type="checkbox" id="want-shipping">
  Different shipping address
</label>

<div data-collapsible-content="shipping-fields">
  <input name="ship_address" class="form-control">
  <input name="ship_city"    class="form-control mt-2">
</div>

<script>
const c = $('[data-collapsible-content=\"shipping-fields\"]');
// programmatic init — no visible trigger
const inst = new themestrap.PluginCollapsible();
inst.initialize(c.prev('label'));

$('#want-shipping').on('change', function() {
  this.checked ? inst.open() : inst.close();
});
</script>
```

ReactiveSync to external state

```js
const sidebar = $('[data-collapsible-trigger="sidebar"]')
  .themestrapPluginCollapsible()
  .data('__collapsible');

// React to URL hash changes
window.addEventListener('hashchange', () => {
  if (location.hash === '#open-sidebar') {
    sidebar.open();
  } else {
    sidebar.close();
  }
});

// React to user pref
matchMedia('(min-width: 1200px)')
  .addEventListener('change', e => {
    sidebar.setDisabled(e.matches);
  });
```

## [Common **Pitfalls**](#pitfalls)

Four things that have tripped up real integrations. Read these before opening an issue.

#### Don’t use `display: none`

> [!CAUTION]
> Setting `display: none` on the content panel (in CSS or via a utility class) breaks height measurement. `scrollHeight` returns `0` when an element is `display:none`, so the open animation has nothing to grow to. Use the plugin’s built-in `height: 0; overflow: hidden` approach which is already applied automatically by the closed state.

#### Nested collapsibles need height bubbling

> [!WARNING]
> When a collapsible contains another collapsible, opening the inner one changes its scrollHeight *after* the outer one’s opening animation has completed. The outer panel will be clipped. Solution: listen for `opened.ts.collapsible` on the inner one and call `open()` a second time on the outer instance to re-measure.

#### Images inside the panel

> [!NOTE]
> If the panel contains `<img>` tags without explicit dimensions, `scrollHeight` may be measured before images load making the open animation stop short. Either set `width`/`height` attributes on every image, or wrap the panel content in a CSS-aspect-ratio container.

#### Init before content is in DOM

> [!WARNING]
> If you initialize the plugin and *then* inject content into the panel (e.g. via Ajax), the next `open()` call uses the stale measurement. Two options: (1) call the plugin’s `destroy()` + re-init after injecting, or (2) avoid the issue entirely by injecting content *before* calling `open()` for the first time.

* * *

### **Quick diagnostic checklist**

> - Does the trigger’s `data-collapsible-trigger` exactly match the content’s `data-collapsible-content` (case-sensitive)?
> - Is jQuery loaded before `themestrap.js`?
> - Does the `<style id="ts-collapsible-styles">` tag appear in `<head>`?
> - Has the content element been moved in the DOM after init (e.g. by another plugin)?
> - Is `prefers-reduced-motion` active on your OS? Animations are intentionally instant.
> - Is the panel’s parent `display: none`? Measurement returns 0.
