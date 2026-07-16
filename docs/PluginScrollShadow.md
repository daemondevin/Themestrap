# ScrollShadow Guide

Themestrap's gradient-mask scroll-shadow plugin — automatic edge shadows on any scrollable container, indicating that more content exists in a given direction. Vertical, horizontal, or both orientations supported.

A subtle UX cue that solves the "is there more content?" problem on scrollable elements. Attach the plugin to any container with `overflow` and it overlays gradient masks on the edges that _only_ appear when there's content beyond the current scroll position. Scroll to the bottom — the bottom shadow vanishes. Scroll back up — it re-appears. Built on CSS `mask-image` for crisp rendering on any background.

---

## [How It **Works**](#how-it-works)

The plugin layers a CSS mask gradient over the scrollable container, then dynamically toggles state classes (`ts-ss--top`, `ts-ss--bottom`, `ts-ss--left`, `ts-ss--right`) based on the container's scroll position. Each state class adjusts the mask to hide the corresponding edge gradient.

### Layer 1 — Mask gradient

A CSS `mask-image` linear gradient is applied to the container. The gradient fades from `transparent` at the edges to `black` in the middle. The transparent regions are where the shadow appears.

- Single `mask-image` rule covers all four edges
- Width/height of mask region = `size` option (default `40px`)

### Layer 2 — State classes

When the container scrolls, the plugin reads `scrollTop`, `scrollHeight`, `clientHeight` (and the X equivalents) and toggles four state classes. Each class overrides one edge's mask region to `black`, removing that shadow:

- `ts-ss--top` — hide top shadow (scrolled to top)
- `ts-ss--bottom` — hide bottom shadow (scrolled to bottom)

### Three orientations

- **vertical** — shadows on top & bottom edges. Used for vertically-scrolling content.
- **horizontal** — shadows on left & right edges. Used for horizontal scrollers, carousels.
- **both** — shadows on all four edges. Used when content scrolls in two dimensions. Uses two layered `mask-image` gradients with `mask-composite: intersect`.

---

## [Quick **Start**](#quick-start)

### Markup contract

Any scrollable container works — it just needs `overflow: scroll` (or `auto`) plus a constraining width/height:

```html
<div class="data-table-wrap js-scroll-shadow"
     data-plugin-options='{"orientation":"horizontal", "size":"60px"}'
     style="overflow-x: auto; max-width: 100%;">
  <table>...wide table...</table>
</div>
```

### Init

```js
// Manual init
$('.data-table-wrap').themestrapPluginScrollShadow({
    orientation: 'horizontal',
    size: '60px'
});

// Auto-init via the framework
themestrap.fn.intObsInit(
    '.js-scroll-shadow',
    'themestrapPluginScrollShadow'
);
```

> **Tip:** The plugin injects a stylesheet once per page. Look for `<style id="ts-scroll-shadow-styles">` in `<head>` — it contains every mask-image rule for all orientations. You don't need to add CSS yourself; just initialise the plugin.

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | string | `'vertical'` | One of `vertical`, `horizontal`, `both`. Determines which edges get shadows. |
| `size` | string | `'40px'` | CSS length string. Width of the shadow gradient at each edge. Use larger values (60-80px) for bigger containers. |
| `color` | string | `'black'` | Any CSS color. The mask gradient fades from transparent to this color in the centre. |
| `offset` | number | `2` | Pixels of scroll tolerance before showing/hiding edge shadows. Higher values feel more "snappy". |
| `isEnabled` | bool | `true` | Toggle shadows at runtime via `setEnabled(false)`. When false, all four state classes are removed. |

### CSS custom property overrides

The plugin reads its options into CSS custom properties on the container, so you can override per-instance via stylesheet:

```css
.js-scroll-shadow {
  --ts-ss-size:  40px;
  --ts-ss-color: black;
}

/* Override for one container */
.dark-card .js-scroll-shadow {
  --ts-ss-color: rgba(255, 255, 255, .35);
  --ts-ss-size:  60px;
}
```

> **Warning:** Setting `color` programmatically and `--ts-ss-color` via CSS together — the CSS value wins. The plugin uses CSS custom properties as the source of truth so cascade rules apply normally.

---

## [Instance **API**](#instance-api)

| Method | Returns | Description |
|--------|---------|-------------|
| `update()` | void | Manually re-evaluate scroll state. Use after programmatically scrolling or resizing content inside the container. |
| `setEnabled(bool)` | void | Toggle the shadow effect at runtime. Removes all four state classes when disabled. |
| `destroy()` | void | Remove scroll listeners, ResizeObserver, all state classes, and inline mask styles. |

### No DOM events

Unlike most Themestrap plugins, PluginScrollShadow doesn't emit events — the entire interaction model is observational. If you need to react to edge-state changes, observe the state classes directly:

```js
const target = document.querySelector('.js-scroll-shadow');

const observer = new MutationObserver(() => {
  if (target.classList.contains('ts-ss--bottom')) {
    console.log('Reached the bottom');
  }
});

observer.observe(target, { attributes: true, attributeFilter: ['class'] });
```

### Resize handling

The plugin sets up a `ResizeObserver` on the container _and_ a `MutationObserver` on its children. State is automatically re-evaluated when:

- The container's box dimensions change
- Content is added or removed inside the container
- `update()` is called manually

> No need to call `update()` after content injection — the MutationObserver handles it. The only time you need a manual `update()` is after programmatically scrolling (which doesn't fire a scroll event in some edge cases) or changing options.

---

## [Recipe **Cookbook**](#recipes)

#### Wide data table

```html
<div class="js-scroll-shadow"
     data-plugin-options='{"orientation":"horizontal", "size":"50px"}'
     style="overflow-x: auto;">
  <table class="table">
    <tr><th>Col 1</th><th>Col 2</th>...</tr>
  </table>
</div>
```

#### Long conversation thread

```html
<div class="chat-thread js-scroll-shadow"
     data-plugin-options='{"orientation":"vertical","size":"30px"}'
     style="overflow-y: auto; max-height: 480px;">
  <div class="msg">...</div>
  <div class="msg">...</div>
</div>
```

#### Horizontal card carousel

```html
<div class="card-rail js-scroll-shadow"
     data-plugin-options='{"orientation":"horizontal","size":"80px","color":"white"}'
     style="overflow-x: auto; display: flex; gap: 16px;">
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

#### Dark container, light shadows

```html
<div class="dark-panel js-scroll-shadow"
     data-plugin-options='{"orientation":"vertical","color":"#0a1929"}'
     style="background: #0a1929; color: #fff;
            overflow-y: auto; max-height: 320px;">
  <p>Long content here…</p>
</div>

<style>
/* Match shadow color to background */
.dark-panel { --ts-ss-color: #0a1929; }
</style>
```

---

## [Common **Pitfalls**](#pitfalls)

**Container must actually overflow.** If the container's content fits inside its visible area, no shadows will appear — there's nothing to indicate. This is correct behavior, but easy to confuse with "plugin not working". Test with content that overflows in both dimensions if using `orientation: both`.

**Browser support for mask-image.** PluginScrollShadow uses `mask-image` and `-webkit-mask-image`. All modern browsers support this (Chrome 120+, Safari 15.4+, Firefox 53+), but older Edge or in-app browsers may not. There is no JavaScript fallback — the shadows simply won't appear on unsupported engines, while everything else continues to work.

**Background image vs background color.** Because the plugin masks the container itself, any `background-image` or `background-color` on the container is also clipped at the edges. If you need a solid background that doesn't fade, wrap the scrollable element in an outer div: `<div class="bg"><div class="js-scroll-shadow">...</div></div>`.

**Z-index inside scrollable.** `mask-image` creates a stacking context. Any element with a higher `z-index` inside the scrollable will be masked too. Move absolute-positioned overlays (e.g. a sticky header inside the scroller) outside the scrollable container.

### When shadows do not appear

- Does the container actually overflow? If content fits, no shadows = correct.
- Is `<style id="ts-scroll-shadow-styles">` present in `<head>`?
- Check the container in DevTools — does it have `mask-image` set inline?
- Are the state classes (`ts-ss--top` etc.) being toggled when you scroll?
- Is the orientation correct for your scroll direction?
- Browser support — try in Chrome stable. `caniuse.com/mdn-css_properties_mask-image`.
