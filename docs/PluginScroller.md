# Scroller Guide

Themestrap's native custom-scrollbar plugin. A from-scratch, dependency-free alternative to nanoScroller. Wraps any element's content in a hidden-native-scrollbar viewport and overlays a themable, draggable scrollbar with auto-hide, track-paging and a small public API.

A custom scrollbar you can actually style. PluginScroller hides the platform scrollbar on a scrollable container and renders its own track and thumb on top. Also themable through CSS custom properties, draggable, click-to-page, and auto-hiding by default. Unlike `PluginScrollable`, which delegates to the external nanoScroller library, this plugin owns all of its geometry, dragging and reflow logic, so it ships with **no third-party JavaScript**.

---

## [How It **Works**](#how-it-works)

PluginScroller turns one element into three: a clipped host, an inner _viewport_ that does the real scrolling, and a custom _track_ with a draggable _thumb_ laid over the top. The host's existing children are wrapped into the viewport on init via jQuery `wrapInner()`, so any handlers bound to your content survive untouched.

### Layer 1 — Hidden-native viewport

The generated `.ts-scroller__content` scrolls natively, but its platform scrollbar is hidden with modern CSS — no brittle negative-margin or scrollbar-width measuring hack:

- `scrollbar-width: none` (Firefox)
- `::-webkit-scrollbar { display: none }` (Chrome / Safari)
- `-webkit-overflow-scrolling: touch` keeps iOS momentum

### Layer 2 — Custom track + thumb

The thumb height is proportional to the visible / total ratio and is positioned with a single `translateY()`. Native scroll drives the thumb; dragging the thumb drives native scroll — one source of truth.

- Drag the thumb to scroll
- Click the track to page toward the click
- Auto-hides unless `alwaysVisible` is set

> Scrollbar geometry is recalculated automatically: a `ResizeObserver` watches the viewport's box and a `MutationObserver` watches its children, so the thumb resizes when the container or its content changes — no manual `update()` needed in the common case.

### PluginScroller vs PluginScrollable

Both give you a styled scrollbar, but they are not the same component:

- **PluginScroller** — native, zero-dependency, vertical custom scrollbar. Themable via CSS custom properties. This plugin.
- **PluginScrollable** — a thin wrapper that delegates to the external `nanoScroller` jQuery library. Use it only if you already ship nanoScroller for other reasons.

---

## [Quick **Start**](#quick-start)

### Markup contract

Point the plugin at any block that has or is given a constrained height. The plugin generates the inner viewport and bar:

```html
<div data-plugin-scroller
     data-plugin-options='{"height":320, "alwaysVisible":true}'>
  <!-- your long content; the plugin wraps this automatically -->
  <p>…</p>
</div>
```

After init the DOM looks like this:

```html
<div class="ts-scroller" style="height:320px">
  <div class="ts-scroller__content" tabindex="0">  <!-- scroll viewport -->
    <p>…</p>
  </div>
  <div class="ts-scroller__bar">                    <!-- custom track -->
    <div class="ts-scroller__thumb"></div>          <!-- draggable thumb -->
  </div>
</div>
```

### Init

```js
// Manual init
$('#log-panel').themestrapPluginScroller({
    maxHeight: 400,
    alwaysVisible: false
});

// Auto-init via the framework (already wired in themestrap.init.js)
themestrap.fn.intObsInit(
    '[data-plugin-scroller]:not(.manual)',
    'themestrapPluginScroller'
);
```

> [!TIP]
> The plugin injects one stylesheet per page. Look for `<style id="ts-scroller-styles">` in `<head>` — it carries every base rule and CSS custom property. You never add CSS yourself; theme via the variables documented below.

> [!WARNING]
> The host needs a height for there to be anything to scroll. Set one in CSS, or pass `height` (fixed) or `maxHeight` (grow-then-cap) as an option. Without a constraint the content fits, no overflow exists, and — correctly — no scrollbar appears.

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alwaysVisible` | bool | `false` | Keep the scrollbar permanently visible instead of auto-hiding after a scroll. |
| `flashDelay` | number | `1200` | When auto-hiding, how long (ms) the bar stays visible after the last scroll. |
| `sliderMinHeight` | number | `30` | Smallest allowed thumb height in px, so the thumb stays grabbable on very long content. |
| `sliderMaxHeight` | number | `null` | Largest allowed thumb height in px. `null` means no cap. |
| `preventPageScrolling` | bool | `false` | Stop the wheel from handing off to the page once the viewport reaches the top or bottom edge. |
| `tabIndex` | number | `0` | tabindex applied to the viewport for keyboard scrolling. Pass `null` to skip. |
| `height` | number/string | `null` | Fixed host height. A bare number becomes px; any CSS length string is passed through. |
| `maxHeight` | number/string | `null` | Cap the viewport height; the host grows with content up to this value, then scrolls. |
| `isEnabled` | bool | `true` | Set false to keep the instance alive but render no scrollbar. Toggle later via `setEnabled()`. |
| `contentClass` | string | `'ts-scroller__content'` | Class applied to the generated viewport. |
| `paneClass` | string | `'ts-scroller__bar'` | Class applied to the generated track. |
| `sliderClass` | string | `'ts-scroller__thumb'` | Class applied to the generated thumb. |

### CSS custom property overrides

Appearance is driven entirely by CSS custom properties on the host:

```css
.ts-scroller {
  --ts-scroller-size:        8px;     /* track / thumb width      */
  --ts-scroller-gutter:      2px;     /* inset from the edges     */
  --ts-scroller-radius:      8px;     /* corner rounding          */
  --ts-scroller-track:       transparent;
  --ts-scroller-thumb:       rgba(10, 25, 41, 0.28);
  --ts-scroller-thumb-hover: rgba(10, 25, 41, 0.5);
}

/* Brand the thumb on one container only */
.code-rail .ts-scroller {
  --ts-scroller-thumb:       rgba(232, 103, 42, 0.45);   /* orange */
  --ts-scroller-thumb-hover: rgba(232, 103, 42, 0.75);
  --ts-scroller-size:        10px;
}
```

---

## [Instance **API**](#instance-api)

| Method | Returns | Description |
|--------|---------|-------------|
| `update()` | this | Re-measure the viewport and resize/reposition the thumb. Safe to call repeatedly. |
| `scrollTo(value, smooth)` | this | Scroll the viewport. `value` is a px offset, `'top'`, `'bottom'`, an element, or a selector. Pass `true` for smooth behaviour. |
| `scrollTop(smooth)` | this | Shortcut for `scrollTo('top', smooth)`. |
| `scrollBottom(smooth)` | this | Shortcut for `scrollTo('bottom', smooth)`. |
| `setEnabled(state)` | this | Toggle scrollbar rendering at runtime without tearing down the instance. |
| `destroy()` | this | Detach all listeners and observers, unwrap the viewport back to the host, remove the bar and all classes/inline styles, and clear the instance data. |

### Getting the instance

Every method returns `this` for chaining. Retrieve the instance from the host's data key, `__pluginScroller`:

```js
const inst = $('#log-panel').data('__pluginScroller');

inst.scrollBottom(true);   // smooth-scroll to the end
inst.update();             // recalc after measuring new content
inst.setEnabled(false);    // hide the bar, keep the instance
```

### No custom events

Like `PluginScrollShadow`, this plugin emits no events — the model is observational. To react to scroll position, listen on the generated viewport (`inst.$content`) directly:

```js
const inst = $('#log-panel').data('__pluginScroller');

inst.$content.on('scroll', function () {
  const el = this;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
    console.log('Reached the bottom');
  }
});
```

### Reflow handling

Geometry is re-evaluated automatically when:

- The viewport's box dimensions change (`ResizeObserver`)
- Content is added or removed inside the viewport (`MutationObserver`)
- `update()` is called manually

> [!TIP]
> The one case that needs a manual `update()` is a scroller built while hidden — e.g. inside an inactive tab or a `display:none` panel — because its viewport measures zero height. Call `update()` when the container becomes visible.

---

## [Recipe **Cookbook**](#recipes)

#### Fixed-height panel

```html
<div data-plugin-scroller
     data-plugin-options='{"height":300}'>
  <p>Long content that overflows 300px…</p>
</div>
```

#### Grow-to-content, then cap

```html
<!-- Grows with content, then caps and scrolls past 420px -->
<div data-plugin-scroller
     data-plugin-options='{"maxHeight":420}'>
  <ul>
    <li>Item…</li>
  </ul>
</div>
```

#### Always-on, branded thumb

```html
<!-- Always-visible, thicker, orange thumb -->
<div class="code-rail" data-plugin-scroller
     data-plugin-options='{"height":360, "alwaysVisible":true, "sliderMinHeight":48}'>
  <pre><code>…</code></pre>
</div>

<style>
.code-rail { --ts-scroller-thumb: rgba(232,103,42,.5); --ts-scroller-size: 10px; }
</style>
```

#### Live log pinned to bottom

```js
// Live log: append, then pin to the bottom
const $panel = $('#log').themestrapPluginScroller({ height: 320 });
const inst   = $panel.data('__pluginScroller');

socket.on('line', function (text) {
  $('#log .ts-scroller__content').append('<div>' + text + '</div>');
  // MutationObserver recalcs automatically; just pin to the end:
  inst.scrollBottom();
});
```

#### Re-measure inside a tab

```js
// Re-measure a scroller revealed inside a Bootstrap tab
$('[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
  const sel  = $(e.target).attr('href');
  const inst = $(sel).find('[data-plugin-scroller]').data('__pluginScroller');
  if (inst) inst.update();   // viewport had 0 height while hidden
});
```

---

## [Common **Pitfalls**](#pitfalls)

**The host must have a constrained height.** This is the most common "it isn't working" case. If the content fits, nothing overflows and no bar is drawn — by design. Give the host a height in CSS, or pass the `height` / `maxHeight` option.

**Built while hidden = zero height.** A scroller initialised inside a hidden element (inactive tab, collapsed panel, `display:none`) measures a zero-height viewport, so the thumb can't size itself. Call `update()` once the container is visible.

**Content is wrapped, not replaced.** On init the host's children are moved into a generated `.ts-scroller__content` wrapper. Selectors that assumed a direct parent–child relationship with the host may need a depth adjustment (e.g. `.host > .item` becomes `.host .item`). `destroy()` unwraps everything back to the original structure.

### When the scrollbar does not appear

> - Does the host actually overflow? If content fits, no bar = correct.
> - Is `<style id="ts-scroller-styles">` present in `<head>`?
> - Was the scroller built while hidden? Call `update()` when shown.
> - Is `data-plugin-scroller` on the element, and is the element free of `.manual`?
> - In DevTools, does the host have a `.ts-scroller__content` child with a real `clientHeight`?
> - Is `isEnabled` still true? `setEnabled(false)` removes the bar.
