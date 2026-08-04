# PluginScrollbar

A self-contained Themestrap scrollbar plugin with zero vendor JS dependencies — mouse wheel, pointer drag, touch momentum, and keyboard navigation are all implemented from scratch using native browser APIs.

---

## Contents

1. [Overview](#overview)
2. [Files](#files)
3. [Load Order](#load-order)
4. [init.js Wiring](#initjs-wiring)
5. [HTML Auto-Init](#html-auto-init)
6. [Programmatic Init](#programmatic-init)
7. [Options Reference](#options-reference)
8. [scrollTo() Targets](#scrollto-targets)
9. [Public API](#public-api)
10. [Callbacks](#callbacks)
11. [Themes](#themes)
12. [CSS Classes Reference](#css-classes-reference)
13. [Browser Support](#browser-support)

---

## Overview

```
Axes          y (vertical) · x (horizontal) · yx (both simultaneously)
Themes        26 built-in, all pure CSS — no sprite sheet
Input         Mouse wheel · Pointer drag · Touch momentum · Keyboard
Auto-update   ResizeObserver — no manual update() call needed for most cases
Animation     5th-order polynomial easing curve matching the original malihu feel
Dependency    jQuery only (already a Themestrap hard dependency)
```


---

## init.js Wiring

Add the following block to `themestrap.init.js` alongside the other plugin wiring entries:

```js
// Scrollbar
if ($.isFunction($.fn['themestrapPluginScrollbar']) && $('[data-plugin-scrollbar]').length) {
    themestrap.fn.dynIntObsInit(
        '[data-plugin-scrollbar]:not(.manual)',
        'themestrapPluginScrollbar',
        themestrap.PluginScrollbar.defaults
    );
}
```

`dynIntObsInit` is used because `PluginScrollbar.defaults` contains `forceInit: true`, which tells the observer to initialize immediately rather than waiting for the element to enter the viewport. Scrollable panels are typically always visible — sidebars, content areas, chat windows — so lazy init adds latency without any benefit. Panels that genuinely are off-screen on load can override with `data-plugin-options='{"forceInit":false}'`.

---

## HTML Auto-Init

The element **must have a fixed height** (CSS or inline `style`) and `overflow: hidden`. The plugin wraps the content internally — no pre-existing wrapper markup is needed.

### Minimal — vertical, light theme

```html
<div data-plugin-scrollbar style="height: 300px; overflow: hidden;">
  ...content...
</div>
```

### With options

```html
<div data-plugin-scrollbar
     data-plugin-options='{"axis": "y", "theme": "dark", "scrollInertia": 400}'
     style="height: 300px; overflow: hidden;">
  ...content...
</div>
```

### Horizontal

```html
<div data-plugin-scrollbar
     data-plugin-options='{"axis": "x", "theme": "dark-2"}'
     style="height: 80px; overflow: hidden;">
  <!-- content wider than the container -->
  <div style="width: 1200px;">...</div>
</div>
```

### Both axes

```html
<div data-plugin-scrollbar
     data-plugin-options='{"axis": "yx", "theme": "rounded"}'
     style="height: 400px; overflow: hidden;">
  <!-- content both taller and wider than the container -->
</div>
```

### Opt out of auto-init

Add `class="manual"` to skip the IntersectionObserver wiring and initialize manually in your own script:

```html
<div id="mySidebar" class="manual" data-plugin-scrollbar style="height: 500px; overflow: hidden;">
  ...
</div>
```

```js
$('#mySidebar').themestrapPluginScrollbar({ theme: 'dark', scrollInertia: 800 });
```

---

## Programmatic Init

Pass an options object directly to `$.fn.themestrapPluginScrollbar`. Returns the jQuery collection for chaining, but you typically capture the instance through `$.data`:

```js
// Init
$('#myPanel').themestrapPluginScrollbar({
    axis:             'y',
    theme:            'dark',
    scrollInertia:    700,
    autoHideScrollbar: true,
});

// Retrieve the instance later
const sb = $('#myPanel').data('__scrollbar');

// Chain API methods
sb.scrollTo('bottom').stop();
```

---

## Options Reference

All options can be passed as an object to `$.fn.themestrapPluginScrollbar()` or as a JSON string in `data-plugin-options`. Nested options must use dot-notation in JSON or be passed as objects in JS.

### Top-level

| Option | Type | Default | Description |
|---|---|---|---|
| `forceInit` | `boolean` | `true` | Skip the IntersectionObserver and init immediately. Set `false` for panels that start well below the fold. |
| `axis` | `string` | `'y'` | Scroll axis. `'y'` vertical, `'x'` horizontal, `'yx'` both. |
| `theme` | `string` | `'light'` | Visual theme name. See [Themes](#themes). |
| `scrollInertia` | `number` | `950` | Easing animation duration in ms. `0` = instant jump, no animation. |
| `autoDraggerLength` | `boolean` | `true` | Size the thumb proportionally to the content/viewport ratio. `false` uses the CSS `height`/`width` minimum. |
| `autoHideScrollbar` | `boolean` | `false` | Fade the scrollbar out when idle; fade in on hover or scroll activity. |
| `alwaysShowScrollbar` | `0 \| 1 \| 2` | `0` | `0` on hover/scroll only · `1` always visible · `2` always show track, hide thumb when nothing to scroll. |
| `scrollbarPosition` | `string` | `'inside'` | `'inside'` renders the track within the element. `'outside'` renders it outside — the parent must allow `overflow: visible`. |
| `snapAmount` | `number` | `0` | Snap scroll position to multiples of this pixel value. `0` = disabled. |
| `snapOffset` | `number` | `0` | Shift the snap grid by this many pixels. |

### `mouseWheel`

| Option | Type | Default | Description |
|---|---|---|---|
| `mouseWheel.enable` | `boolean` | `true` | Enable mouse wheel scrolling. |
| `mouseWheel.scrollAmount` | `number \| 'auto'` | `'auto'` | Fixed px per wheel notch. `'auto'` uses the raw normalised delta. |
| `mouseWheel.axis` | `string` | `'y'` | Which axis the wheel drives. Follows `axis` option by default. |
| `mouseWheel.preventDefault` | `boolean` | `false` | Prevent native page scroll even when this element reaches its edge. |
| `mouseWheel.invert` | `boolean` | `false` | Reverse the scroll direction. |

### `keyboard`

| Option | Type | Default | Description |
|---|---|---|---|
| `keyboard.enable` | `boolean` | `true` | Enable keyboard navigation when the element has focus. Handles ↑ ↓ ← → Page Up Page Down Home End. |

### `scrollButtons`

| Option | Type | Default | Description |
|---|---|---|---|
| `scrollButtons.enable` | `boolean` | `false` | Show clickable arrow buttons at both ends of the track. |
| `scrollButtons.scrollAmount` | `number \| 'auto'` | `'auto'` | Pixels per button click (or per tick while held). `'auto'` = 40 px. |

### `callbacks`

| Option | Type | Default | Description |
|---|---|---|---|
| `callbacks.onScrollStart` | `function \| null` | `null` | Called once when an animation begins. |
| `callbacks.whileScrolling` | `function \| null` | `null` | Called every rAF frame during animation. Use sparingly. |
| `callbacks.onScroll` | `function \| null` | `null` | Called once when an animation completes. |
| `callbacks.onTotalScroll` | `function \| null` | `null` | Called when scroll reaches the end (within `onTotalScrollOffset` px). |
| `callbacks.onTotalScrollOffset` | `number` | `0` | How many px from the edge counts as "at the end". |
| `callbacks.onTotalScrollBack` | `function \| null` | `null` | Called when scroll returns to the start (within `onTotalScrollBackOffset` px). |
| `callbacks.onTotalScrollBackOffset` | `number` | `0` | How many px from the start counts as "back at the top". |

---

## scrollTo() Targets

`scrollTo(target, opts)` accepts a wide range of target formats:

| Target | Behaviour |
|---|---|
| `number` | Scroll to this pixel offset from the top (or left for `x` axis). |
| `'top'` | Scroll to position 0 (vertical). |
| `'bottom'` | Scroll to the maximum vertical position. |
| `'left'` | Scroll to position 0 (horizontal). |
| `'right'` | Scroll to the maximum horizontal position. |
| `'first'` | Scroll to the first child element of the content container. |
| `'last'` | Scroll to the last child element. |
| `'50%'` | Scroll to 50% of the scrollable range. Any percentage works. |
| `'+=200'` | Scroll 200 px forward from the **current** position. |
| `'-=200'` | Scroll 200 px back from the current position. |
| `'200px'` | Explicit pixel string — equivalent to passing `200` as a number. |
| `'#myAnchor'` | CSS selector resolved **within** the content container. |
| `jQuery object` | Scroll to that element (must be inside the container). |
| `DOM element` | Scroll to that element. |
| `[y, x]` | Array of two targets — used with `axis: 'yx'` to control both axes simultaneously. Either entry can be `null` to leave that axis unchanged. |

### scrollTo() options

```js
sb.scrollTo('bottom', {
    scrollInertia: 400,   // override animation duration (ms)
    axis:          'y',   // override which axis to animate
});
```

---

## Public API

All methods return `this` (the `PluginScrollbar` instance) for chaining unless otherwise noted.

### `update()`

Re-measures the content and viewport dimensions and recalculates the scrollbar. Call this after dynamically inserting or removing content that ResizeObserver might not have caught yet (e.g. content injected inside a `setTimeout`).

```js
$('#myPanel .ts-scrollbox-container .sp-body').append('<p>New paragraph</p>');
$('#myPanel').data('__scrollbar').update();
```

### `scrollTo(target [, opts])`

Scroll to a target position. See [scrollTo() Targets](#scrollto-targets) for the full list of accepted formats.

```js
const sb = $('#myPanel').data('__scrollbar');

sb.scrollTo('bottom');
sb.scrollTo('#section-3');
sb.scrollTo(400);
sb.scrollTo('+=150');
sb.scrollTo([200, 300]); // yx: y=200, x=300
sb.scrollTo([null, 300]); // yx: only scroll x
```

### `stop()`

Immediately cancels any running scroll animation. The content stays at its current mid-animation position.

```js
sb.stop();
```

### `disable([resetScroll])`

Makes the scrollbar non-interactive. Adds the `ts-scrollbar-disabled` class.

```js
sb.disable();          // freeze position
sb.disable(true);      // freeze + jump back to top
```

### `enable()`

Re-activates a previously disabled scrollbar and calls `update()` to recalculate.

```js
sb.enable();
```

### `destroy()`

Completely removes the scrollbar, restores the original inner HTML, unbinds all events, and disconnects the ResizeObserver. After calling `destroy()`, the element can be re-initialized cleanly.

```js
sb.destroy();

// Re-init with different options:
$('#myPanel').themestrapPluginScrollbar({ theme: 'dark' });
```

---

## Callbacks

Callbacks are configured on init and cannot be set through `data-plugin-options` (functions are not serialisable as JSON). All callbacks are called with the element as `this` and a single data argument:

```ts
interface ScrollData {
    scrollY:    number;  // current vertical offset in px
    scrollX:    number;  // current horizontal offset in px
    maxScrollY: number;  // maximum vertical scroll in px
    maxScrollX: number;  // maximum horizontal scroll in px
    pctY:       number;  // vertical position as 0–100 integer
    pctX:       number;  // horizontal position as 0–100 integer
}
```

### onScrollStart

Fires once at the beginning of an animation. Good for opening a loading indicator or logging telemetry.

```js
onScrollStart: function(data) {
    console.log('Scroll started at', data.pctY + '%');
}
```

### whileScrolling

Fires on every `requestAnimationFrame` tick during animation. Suitable for driving a progress bar or parallax effect. Avoid heavy DOM writes here.

```js
whileScrolling: function(data) {
    $('#scrollPct').text(data.pctY + '%');
}
```

### onScroll

Fires once when the animation settles. The definitive "scroll is done" hook.

```js
onScroll: function(data) {
    saveScrollPosition(data.scrollY);
}
```

### onTotalScroll

Fires when the scroll position reaches or passes `maxScrollY - onTotalScrollOffset`. Use this to trigger infinite-scroll content loading.

```js
onTotalScroll: function() {
    loadNextPage();
},
onTotalScrollOffset: 80, // fire when 80 px from the bottom
```

### onTotalScrollBack

Fires when the scroll position returns to or passes `onTotalScrollBackOffset` from the top. Use this to show/hide a "back to top" control.

```js
onTotalScrollBack: function() {
    $('#backToTop').fadeOut();
},
onTotalScrollBackOffset: 0,
```

---

## Themes

Pass the theme name as the `theme` option.

### Light variants

| Theme | Rail | Thumb | Notes |
|---|---|---|---|
| `light` | Semi-transparent black | White 75% | Default |
| `light-2` | White 10% | White 75% | 4 px wide rail, 1 px radius |
| `light-thick` | White 10% | White 75% | 6 px wide bar, 2 px radius |
| `light-thin` | White 10% | White 75% | 2 px wide bar |
| `light-3` | Black 20% | White 75% | 6 px rail, expands on drag |
| `rounded` | White 15% | White 75% | 14 px pill-shaped thumb |
| `rounded-dots` | Dot pattern (light) | White 75% | Transparent rail with PNG dot texture |
| `3d` | Black 20% + inset shadow | #555 + gradient | 70 px fixed thumb, 8 px rail |
| `3d-thick` | Container background | #555 + gradient | Rounded container, fills absolute |
| `minimal` | Transparent | White 20% | No rail, 50 px thumb |
| `inset` | Black 20% | Black 75% | 12 px rail, inset 6 px bar |
| `inset-2` | Outlined (1 px border) | Black 75% | Border-only rail |
| `inset-3` | White 60% | Black 75% | Solid light rail, dark bar |

### Dark variants

Each light theme has a `*-dark` counterpart that inverts the colour palette from white-on-dark to black-on-light. The full list:

```
dark           dark-2         dark-thick     dark-thin      dark-3
rounded-dark   rounded-dots-dark
3d-dark        3d-thick-dark
minimal-dark
inset-dark     inset-2-dark   inset-3-dark
```

### Scroll button arrow colours

The `scrollButtons` arrows are drawn with pure CSS — no sprite sheet or image file required. Arrow colour is determined automatically:

- Any theme whose name **contains `dark`** → black arrows (`rgba(0,0,0,0.7)`)
- All other themes → white arrows (`rgba(255,255,255,0.9)`)
- The `inset`, `inset-2`, and `inset-3` light variants also use dark arrows (overridden explicitly)

---

## CSS Classes Reference

These classes are added to the DOM by the plugin. You can hook into them for additional styling.

| Class | Element | When present |
|---|---|---|
| `.tsScrollbar` | Root element | Always, once initialized |
| `.ts-scrollbar-autoHide` | Root element | When `autoHideScrollbar: true` |
| `.ts-scrollbar-no-scrollbar` | Root element | When content doesn't overflow on any axis |
| `.ts-scrollbar-disabled` | Root element | After `disable()` is called |
| `.tsScrollBox` | Inner box | Always |
| `.ts-scrollbox-vertical` | Inner box | `axis: 'y'` |
| `.ts-scrollbox-horizontal` | Inner box | `axis: 'x'` |
| `.ts-scrollbox-vertical-horizontal` | Inner box | `axis: 'yx'` |
| `.ts-scrollbox-inside` | Inner box | `scrollbarPosition: 'inside'` |
| `.ts-scrollbox-outside` | Inner box | `scrollbarPosition: 'outside'` |
| `.ts-scrollbox-container` | Content div | Always |
| `.ts-scrollbar-no-scrollbar-y` | Content div | When vertical content fits in viewport |
| `.ts-scrollbar-y-hidden` | Content div | When vertical scrollbar is hidden |
| `.ts-scrollbar-no-scrollbar-x` | Content div | When horizontal content fits in viewport |
| `.ts-scrollbar-x_hidden` | Content div | When horizontal scrollbar is hidden |
| `.ts-scrollbox-container-wrapper` | Wrapper div | `axis: 'yx'` only |
| `.ts-scrollbox-scrollTools` | Track div | Always (one per active axis) |
| `.ts-scrollbox-scrollTools-vertical` | Track div | Vertical track |
| `.ts-scrollbox-scrollTools-horizontal` | Track div | Horizontal track |
| `.ts-scrollbar-{theme}` | Inner box + track div | Always — set from `theme` option |
| `.ts-scrollbox-draggerContainer` | Dragger area | Always |
| `.ts-scrollbox-dragger` | Thumb element | Always |
| `.ts-scrollbox-dragger-bar` | Visual bar inside thumb | Always |
| `.ts-scrollbox-draggerRail` | Rail line | Always |
| `.ts-scrollbox-dragger-onDrag` | Thumb element | While being dragged |
| `.ts-scrollbox-scrollTools-onDrag` | Track div | While thumb is being dragged |

---

## Browser Support

| Browser | Status | Notes |
|---|---|---|
| Chrome / Edge 80+ | ✅ Full | Pointer events, ResizeObserver, `wheel` event all present |
| Firefox 75+ | ✅ Full | Same |
| Safari 14+ | ✅ Full | ResizeObserver available since Safari 13.1 |
| iOS Safari 14+ | ✅ Full | Touch momentum uses `touchstart`/`touchmove`/`touchend` |
| Safari 13 | ⚠️ Partial | ResizeObserver available but `setPointerCapture` may behave differently — dragger drag still works via `mousemove` fallback |
| IE 11 | ❌ Not supported | No ResizeObserver, no `const`/`class`/template literals |

> [!NOTE]  
> **ResizeObserver fallback.**  
> When `ResizeObserver` is unavailable the plugin still works — auto-update just requires a manual `update()` call after dynamic content changes. For IE 11 support, use the original malihu wrapper plugin instead.
