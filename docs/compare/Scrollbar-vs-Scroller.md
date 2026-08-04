# `PluginScrollbar` vs `PluginScroller`

Both plugins hide the browser's default scrollbar and replace it with a styled, draggable custom one. Beyond that surface similarity they make very different architectural choices, serve different use cases, and carry different trade-offs. This document maps out every meaningful difference so you can pick the right one without trial and error.

---

## One-line summary

| Plugin | What it does |
|---|---|
| **`PluginScrollbar`** | Replaces the native scroll mechanism entirely — content is moved via CSS `top`/`left` while the browser's scroll is bypassed. Ships 26 pre-baked visual themes. |
| **`PluginScroller`** | Hides the native scrollbar with CSS and overlays a custom track and thumb on top — the browser still does the real scrolling. Themable via CSS custom properties. |

---

## Scrolling mechanism

This is the most fundamental difference between the two plugins.

### `PluginScrollbar` — synthetic scroll

The browser's native scroll is never used for positioning. Instead:

1. Content is moved inside a clipped `.tsScrollBox` viewport by changing the CSS `top` and `left` properties on `.ts-scrollbox_container`.
2. Every scroll action — wheel, drag, keyboard, touch — goes through a `requestAnimationFrame` animation loop with a custom easing curve.
3. The plugin owns the scroll position completely. It can apply snap grids, inertia, easing curves and intermediate states that native scroll cannot.

The cost is complexity: the plugin implements its own easing engine, touch-velocity tracking, and keyboard handler from scratch.

### `PluginScroller` — native scroll, hidden scrollbar

The browser's native scroll is left in charge of everything:

1. Content is wrapped inside a `.ts-scroller__content` div that scrolls natively but hides its platform scrollbar with CSS (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`).
2. The custom thumb is positioned with a `translateY()` derived from the viewport's `scrollTop` on every `scroll` event.
3. Dragging the thumb writes back to `scrollTop`; the `scroll` handler then repositions the thumb — one source of truth.

The native approach gives iOS momentum, browser-level smooth-scroll, and accessibility handling for free, but means the plugin cannot apply custom easing or snap grids to wheel/keyboard events.

---

## DOM structure

### PluginScrollbar

Wraps the host element's children in a multi-layer structure:

```html
<!-- Host element -->
<div class="tsScrollbar mCS-dark">
  <div class="tsScrollBox ts-scrollbox-vertical ts-scrollbox-inside">
    <div class="ts-scrollbox-container" style="position:relative;top:0;left:0;">
      <!-- original content -->
    </div>
    <div class="ts-scrollbox-scrollTools mCS-dark ts-scrollbox-scrollTools-vertical">
      <div class="ts-scrollbox-draggerContainer">
        <div class="ts-scrollbox-dragger" style="position:absolute;top:0;">
          <div class="ts-scrollbox-dragger-bar"></div>
        </div>
        <div class="ts-scrollbox-draggerRail"></div>
      </div>
      <!-- optional: .ts-scrollbox-buttonUp / .ts-scrollbox-buttonDown -->
    </div>
  </div>
</div>
```

The content container is positioned relatively and translated by changing `top` and `left`. The scrollbar tools — track, rail, thumb, and optional buttons — are separate siblings inside the box.

### PluginScroller

A minimal three-layer structure:

```html
<!-- Host element -->
<div class="ts-scroller" style="height:300px">
  <div class="ts-scroller__content" tabindex="0">
    <!-- original content, moved here by wrapInner() -->
  </div>
  <div class="ts-scroller__bar">
    <div class="ts-scroller__thumb"></div>
  </div>
</div>
```

Six class names total versus ~16 for `PluginScrollbar`. No rail element, no button elements, no axis-mode classes. The content div does real native scrolling; the bar and thumb are a visual overlay only.

---

## CSS and theming

### `PluginScrollbar`

- Theming is done by selecting one of **26 named themes** (`light`, `dark`, `rounded`, `3d-thick-dark`, `minimal-dark`, etc.) and passing its name as the `theme` option. The theme class (e.g. `ts-scrollbar-dark`) is added to the inner scroll box and the track element, activating pre-written CSS rules in the stylesheet.
- Customizing a theme beyond its pre-baked colors requires overriding the  class selectors in your own CSS.
- The scrollbar track and thumb are sized and colored through class-based CSS rules, not custom properties.

### `PluginScroller`

- All visual properties are exposed as **CSS custom properties** on the `.ts-scroller` element:

  ```css
  .ts-scroller {
    --ts-scroller-size:        8px;
    --ts-scroller-gutter:      2px;
    --ts-scroller-radius:      8px;
    --ts-scroller-track:       transparent;
    --ts-scroller-thumb:       rgba(10, 25, 41, 0.28);
    --ts-scroller-thumb-hover: rgba(10, 25, 41, 0.5);
  }
  ```

- Per-instance theming requires only a parent class and a few variable overrides — no new named theme, no stylesheet entry, no build step:

  ```css
  .sidebar .ts-scroller {
    --ts-scroller-thumb:       rgba(232, 103, 42, 0.45);
    --ts-scroller-size:        10px;
  }
  ```

- There are no pre-built themes. The default look is a neutral semi-transparent dark thumb with no visible track — a single starting point you style yourself.

---

## Axes

| | `PluginScrollbar` | `PluginScroller` |
|---|---|---|
| Vertical (`y`) | ✓ | ✓ |
| Horizontal (`x`) | ✓ | ✗ |
| Both simultaneously (`yx`) | ✓ | ✗ |

`PluginScroller` is **vertical only**. Its `.ts-scroller__content` div is configured with `overflow-y: auto; overflow-x: hidden`. There is no option to enable horizontal scrolling.

`PluginScrollbar` supports all three axes via the `axis` option. The `yx` mode adds a `ts-scrollbox-container-wrapper` to accommodate both scrollbar tracks and adjusts their corner offsets accordingly.

---

## Animation and easing

### `PluginScrollbar`

- All scroll actions (wheel, click-to-jump, `scrollTo()`, keyboard) run through a `requestAnimationFrame` animation loop with a configurable duration (`scrollInertia`, default 950 ms).
- The easing function is a 5th-order polynomial (`0.5t⁵ − 2.5t⁴ + 5.5t³ − 6.5t² + 4t`) that matches the feel of the original malihu `mcsEaseOut` curve exactly.
- `scrollInertia: 0` disables easing entirely — every action snaps immediately.
- **Snap scrolling** rounds every target position to the nearest multiple of `snapAmount` pixels before animating.
- The animation loop starts from the *current rendered position*, not the previous target, so rapid wheel events stack naturally and the content accelerates.

### `PluginScroller`

- No custom animation engine. `scrollTo(value, smooth)` delegates directly to the browser:
  - `smooth = true` → `element.scrollTo({ top, behavior: 'smooth' })`
  - `smooth = false` → `element.scrollTop = top`
- The browser's built-in smooth-scroll is used, which varies in duration and easing across browsers and cannot be configured.
- Wheel scrolling, keyboard scrolling, and touch scrolling all use the browser's default behavior — no easing override is possible.
- No snap grid support.

---

## Touch and momentum

### `PluginScrollbar`

Implements its own touch momentum from scratch:

1. `touchstart` / `touchmove` track a rolling 100 ms velocity history.
2. On `touchend`, the last velocity is projected forward to calculate a momentum target.
3. The existing rAF animation loop carries the content to that target with the same easing curve as all other scroll actions.
4. The axis-locking logic (`touchAxis`) prevents diagonal drift when only one axis is configured.

### `PluginScroller`

- Sets `-webkit-overflow-scrolling: touch` on the content viewport, delegating momentum to the iOS Safari native rubber-band scroll.
- On Android and desktop, the browser's native touch behavior is used.
- No JavaScript is involved in touch momentum — it is entirely the platform's responsibility.

The practical difference: `PluginScrollbar's` momentum behaves identically on all platforms (same easing, same duration); `PluginScroller's` momentum varies by device and browser and cannot be configured.

---

## Keyboard support

### `PluginScrollbar`

Has its own `keydown` handler on the host element. Handles:

- `↑` / `↓` — one line (40 px)
- `←` / `→` — one line (40 px, when `axis` includes `x`)
- `Page Up` / `Page Down` — 90% of the viewport height
- `Home` / `End` — jump to top or bottom

Key events fire the same rAF animation loop as all other scroll actions, so they respect `scrollInertia`.

### `PluginScroller`

Sets `tabindex="0"` on the `.ts-scroller__content` div. The browser's native keyboard scroll then operates on it directly. This gives correct arrow-key and Page Up/Down behavior in all browsers without any JS, but the scroll amount and style are browser-defined and cannot be changed.

---

## Auto-update strategy

Both plugins use `ResizeObserver` to re-measure when the container's dimensions change.

| Observer | `PluginScrollbar` | `PluginScroller` |
|---|---|---|
| `ResizeObserver` on host box | ✓ | ✓ |
| `ResizeObserver` on content container | ✓ | ✓ |
| `MutationObserver` on content children | ✗ | ✓ |

`PluginScroller` adds a `MutationObserver` that watches `childList`, `subtree`, and `characterData` mutations inside the viewport. This means appending elements, changing text, or toggling classes on children will automatically trigger a recalculation — no `update()` call required.

`PluginScrollbar` relies on `ResizeObserver` only. If content changes size without the container box changing (e.g. injecting a paragraph that was briefly inside a `display:none` element and later shown), a manual `update()` may be needed.

The one edge case both plugins share: **built while hidden**. A scroller initialized inside a collapsed accordion panel, inactive tab, or `display:none` element measures zero height. `update()` must be called once the container becomes visible.

---

## Public API comparison

| Method | `PluginScrollbar` | `PluginScroller` | Notes |
|---|---|---|---|
| `update()` | ✓ | ✓ | Re-measure and resize the thumb. |
| `scrollTo(target, opts)` | ✓ | ✓ | Rich format differences — see below. |
| `scrollTop(smooth)` | ✗ | ✓ | Shortcut for `scrollTo('top')`. |
| `scrollBottom(smooth)` | ✗ | ✓ | Shortcut for `scrollTo('bottom')`. |
| `stop()` | ✓ | ✗ | Cancels the rAF animation mid-flight. No equivalent in `PluginScroller` (native scroll cannot be interrupted). |
| `disable(reset)` | ✓ | ✗ | Makes the scrollbar non-interactive; optionally resets position. |
| `enable()` | ✓ | ✗ | Re-activates after `disable()`. |
| `setEnabled(state)` | ✗ | ✓ | Toggle scrollbar rendering without tearing down the instance. Equivalent to `disable()`/`enable()` combined. |
| `destroy()` | ✓ | ✓ | Tear down the instance and restore the DOM. |

### Why `PluginScrollbar` has `stop()` and `PluginScroller` does not

`stop()` cancels a running `requestAnimationFrame` loop. `PluginScrollbar` owns the animation engine, so it can interrupt it. `PluginScroller` delegates scrolling to the browser — once `element.scrollTo({ behavior: 'smooth' })` is issued there is no JS API to cancel the resulting scroll. This is a fundamental limitation of the native-scroll approach.

---

## scrollTo() targets

### `PluginScrollbar`

Accepts a rich set of target formats:

| Target | Behaviour |
|---|---|
| `number` | Pixel offset from top (or left for `x` axis) |
| `'top'` | Position 0 (vertical) |
| `'bottom'` | Maximum scroll position (vertical) |
| `'left'` | Position 0 (horizontal) |
| `'right'` | Maximum scroll position (horizontal) |
| `'first'` | First child element of the content container |
| `'last'` | Last child element |
| `'50%'` | 50% of scrollable range (any percentage) |
| `'+=200'` | 200 px forward from current position |
| `'-=200'` | 200 px back from current position |
| `'200px'` | Explicit pixel string |
| `'#myEl'` | CSS selector resolved inside the content container |
| `jQuery object` | Scroll to that element |
| `DOM element` | Scroll to that element |
| `[y, x]` | Array for `yx` axis — controls both axes simultaneously |

Also accepts a second argument `opts` with `scrollInertia` and `axis` overrides.

### `PluginScroller`

Accepts a simpler set:

| Target | Behaviour |
|---|---|
| `number` | Pixel offset from top |
| `'top'` | Position 0 |
| `'bottom'` | `scrollHeight` (the maximum) |
| CSS selector string | Resolved via `$(value)`; position calculated from `getBoundingClientRect()` |
| jQuery object | Same bounding-rect calculation |
| DOM element | Same |

The second argument is a boolean: `true` = smooth, `false` / omitted = instant. There is no `+=` / `-=` relative offset syntax, no percentage support, no `'first'`/`'last'` shorthands, and no horizontal target support.

---

## Callbacks and events

### `PluginScrollbar` — five named callback options

Callbacks are configured in the `callbacks` option object on init. They cannot be set via `data-plugin-options` (functions are not JSON-serializable).

| Callback | When |
|---|---|
| `onScrollStart` | Once, when an animation begins |
| `whileScrolling` | Every `requestAnimationFrame` tick during animation |
| `onScroll` | Once, when the animation settles |
| `onTotalScroll` | When scroll reaches the end (within `onTotalScrollOffset` px) |
| `onTotalScrollBack` | When scroll returns to the start (within `onTotalScrollBackOffset` px) |

Each callback receives a data object: `{ scrollY, scrollX, maxScrollY, maxScrollX, pctY, pctX }`.

### `PluginScroller` — no callbacks

`PluginScroller` emits no events and has no callback options. The recommended pattern is to listen directly on the native scroll viewport that the plugin generates:

```js
const inst = $('#panel').data('__pluginScroller');

inst.$content.on('scroll', function() {
    const el = this;
    const pct = Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100);
    // react to scroll position here
});
```

This is more flexible for position monitoring, but there is no equivalent of `onTotalScroll` (the "reached the bottom" hook useful for infinite-scroll) without writing the boundary check yourself.

---

## Height handling

Both plugins require the host element to have a constrained height — without one, content fits, nothing overflows, and no scrollbar appears. They expose different options for setting that height.

### `PluginScrollbar`

Relies on the host element's **existing CSS height**, or on inline CSS applied by the plugin when options are set:

- `height` option is not supported — the element's CSS `height` must be set in your stylesheet or via a `style` attribute before init.
- The `scrollbarPosition: 'outside'` option and outside-layout behavior exist, but height configuration is left to the author's CSS.

### `PluginScroller`

Provides two explicit height options:

| Option | Behaviour |
|---|---|
| `height` | Sets a **fixed** host height. A bare number is treated as px; any CSS length string passes through as-is. |
| `maxHeight` | The host **grows with its content** up to this cap, then becomes scrollable. The host has no fixed height below the cap. |

The `maxHeight` pattern — grow-to-content, then scroll — is not natively supported by `PluginScrollbar` and would require wrapping CSS to achieve.

---

## Init and wiring

### `PluginScrollbar`

```js
// init.js wiring
if ($.isFunction($.fn['themestrapPluginScrollbar']) && $('[data-plugin-scrollbar]').length) {
    themestrap.fn.dynIntObsInit(
        '[data-plugin-scrollbar]:not(.manual)',
        'themestrapPluginScrollbar',
        themestrap.PluginScrollbar.defaults
    );
}
```

Uses `dynIntObsInit` because `PluginScrollbar.defaults` contains `forceInit: true`. Most scrollable panels are always visible, so lazy init adds latency without benefit. Per-element override: `data-plugin-options='{"forceInit":false}'`.

### `PluginScroller`

```js
// init.js wiring (as referenced in the Scroller docs)
themestrap.fn.intObsInit(
    '[data-plugin-scroller]:not(.manual)',
    'themestrapPluginScroller'
);
```

Uses `intObsInit` (simpler). No `forceInit` is needed because the native-scroll approach works even at zero scroll offset — the scrollbar will appear whenever content overflows, regardless of when init happened.

---

## Instance data key and data attribute

| | `PluginScrollbar` | `PluginScroller` |
|---|---|---|
| HTML attribute | `data-plugin-scrollbar` | `data-plugin-scroller` |
| jQuery data key | `'__scrollbar'` | `'__pluginScroller'` |
| Retrieve instance | `$el.data('__scrollbar')` | `$el.data('__pluginScroller')` |
| jQuery method | `$.fn.themestrapPluginScrollbar` | `$.fn.themestrapPluginScroller` |

---

## Destroy behavior

### `PluginScrollbar`

Restores the host element by writing back the **saved `innerHTML` snapshot** taken at the start of `initialize()`. This is a fast full reset but it discards any event handlers that were bound to child elements after init.

### `PluginScroller`

Restores the host by:

1. Moving the `.ts-scroller__content` wrapper's children back up to the host with `$el.append($content.contents())`.
2. Removing the now-empty `$content` wrapper.
3. Removing the `$bar` element.

Because `jQuery.contents()` moves nodes without cloning them, **event handlers bound to content elements survive `destroy()`**. This matters when content elements have listeners attached in other parts of the codebase.

---

## Feature matrix

| Feature | `PluginScrollbar` | `PluginScroller` |
|---|---|---|
| **Vertical axis** | ✓ | ✓ |
| **Horizontal axis** | ✓ | ✗ |
| **Both axes (yx)** | ✓ | ✗ |
| **Custom easing / inertia** | ✓ (rAF + polynomial) | ✗ (native smooth-scroll) |
| **Snap scrolling** | ✓ | ✗ |
| **Touch momentum** | ✓ (custom JS) | ✓ (native iOS) |
| **Scroll buttons on track** | ✓ | ✗ |
| **Keyboard handler** | ✓ (custom JS) | ✓ (native via tabindex) |
| **stop() mid-animation** | ✓ | ✗ |
| **disable() / enable()** | ✓ | via `setEnabled()` |
| **Named callbacks** | ✓ (5 hooks) | ✗ (listen on `$content`) |
| **Pre-built themes** | ✓ (26) | ✗ |
| **CSS custom properties** | ✗ | ✓ |
| **Self-contained CSS** | ✗ (external file) | ✓ (injected `<style>`) |
| **MutationObserver** | ✗ | ✓ |
| **ResizeObserver** | ✓ | ✓ |
| **`maxHeight` (grow-then-scroll)** | ✗ | ✓ |
| **Preserves child event handlers on destroy** | ✗ (innerHTML reset) | ✓ (node move) |
| **Accessibility (native focus / AT scroll)** | ! (synthetic scroll) | ✓ (native scroll) |

---

## When to use which

### Use `PluginScrollbar` when:

- You need **horizontal or dual-axis (yx) scrolling**.
- You need **snap scrolling** (e.g. full-page sections, card carousels).
- You need **`stop()`** to interrupt a running animation programmatically.
- You need the **five scroll callbacks** — especially `onTotalScroll` for infinite-scroll load triggers.
- You need configurable **scroll buttons** (up/down arrows on the track).
- Your design requires a **heavily customized easing curve or inertia duration** on individual scroll panels.
- Content event handlers are **re-bound on every render** so the `innerHTML` reset in `destroy()` is not a concern.

### Use `PluginScroller` when:

- You only need **vertical scrolling** and want the simplest possible implementation.
- You want to **theme the scrollbar with CSS custom properties** without touching a stylesheet — override `--ts-scroller-thumb` and you're done.
- Content has **event handlers bound externally** that must survive `destroy()` intact.
- You want **MutationObserver auto-reflow** — content can be dynamically injected and the thumb will resize automatically without calling `update()`.
- You need the **`maxHeight` grow-then-scroll** height model (common for dropdown lists, log panels, and comment threads that start short but grow).
- You are building a **live log or chat panel** (`scrollBottom()` + `MutationObserver` together make this a natural fit).
- You prefer **native browser scroll behavior** — iOS rubber-band, browser-level smooth-scroll, and native assistive-technology integration without any synthetic override.
- You want a **smaller implementation surface** — fewer options to configure, fewer edge cases to test.
