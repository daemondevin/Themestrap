# PluginReadMore

Collapses long content blocks to a configurable height and reveals them with an animated gradient fade and a configurable toggle button. CSS transitions drive all animation; no jQuery `.animate()` is used. Dark mode is handled entirely in CSS via custom properties — no JavaScript listeners required.


## Quick Start

### Required HTML

The plugin expects a `.readmore-button-wrapper` child element containing a bare `<a>` tag to already exist in the markup. The plugin injects the button label and manages visibility.. it does not create the wrapper itself.

```html
<div class="my-content">
  <p>Your long-form content goes here…</p>
  <div class="readmore-button-wrapper d-none">
    <a href="#"></a>
  </div>
</div>
```

### Initialize

```js
$('.my-content').themestrapPluginReadMore();

// With options
$('.my-content').themestrapPluginReadMore({
  maxHeight:        150,
  overlayColor:     '#f8f9fa',
  darkOverlayColor: '#1a1f35',
  animDuration:     300,
});
```

Or declaratively via `data-plugin-options`:

```html
<div class="my-content"
     data-plugin-options='{"overlayColor":"#fff","darkOverlayColor":"#1a1f35"}'>
  …
  <div class="readmore-button-wrapper d-none"><a href="#"></a></div>
</div>
```


## Options

### Behaviour

| Option | Type | Default | Description |
|---|---|---|---|
| `buttonOpenLabel` | string | `'Read More <i…>'` | HTML string for the expand button |
| `buttonCloseLabel` | string | `'Read Less <i…>'` | HTML string for the collapse button |
| `enableToggle` | boolean | `true` | Allow collapsing back after expansion |
| `startOpened` | boolean | `false` | Initialize in the expanded state |
| `maxHeight` | number | `110` | Collapsed height in px |
| `align` | string | `'start'` | Button alignment: `'start'` \| `'center'` \| `'end'` |

### Light-mode Overlay

Three levels of control, evaluated top-to-bottom — first match wins.

| Option | Type | Default | Description |
|---|---|---|---|
| `overlayGradient` | string \| null | `null` | Raw CSS gradient — overrides the two options below |
| `overlayStartColor` | string \| null | `null` | Transparent start colour; auto-derived from `overlayColor` when null |
| `overlayColor` | string | `'#ffffff'` | Opaque end colour of the gradient fade |
| `overlayDirection` | string | `'180deg'` | Gradient direction; shared with dark mode |
| `overlayHeight` | number | `100` | Height of the overlay element in px |

### Dark-mode Overlay

Mirrors the same three-level hierarchy as the light overlay. Falls back to the light gradient when none of these are set, preserving backward compatibility.

| Option | Type | Default | Description |
|---|---|---|---|
| `darkOverlayGradient` | string \| null | `null` | Raw CSS gradient for dark mode — overrides the two below |
| `darkOverlayStartColor` | string \| null | `null` | Transparent start in dark mode; auto-derived from `darkOverlayColor` when null |
| `darkOverlayColor` | string \| null | `null` | Opaque end colour in dark mode |

> `overlayDirection` is shared between both modes. If you need a different direction in dark mode, use `darkOverlayGradient`.

### Animation

| Option | Type | Default | Description |
|---|---|---|---|
| `animDuration` | number | `400` | Transition duration in ms |
| `animEasing` | string | `'ease'` | CSS easing or `cubic-bezier(…)` value |

### Callbacks

| Option | Type | Default | Description |
|---|---|---|---|
| `onOpen` | function \| null | `null` | Fires when expansion begins; receives `$wrapper` as the first argument |
| `onClose` | function \| null | `null` | Fires when collapse begins; receives `$wrapper` as the first argument |


## Public API

Retrieve the instance from a fresh selection after initialization:

```js
$('.my-content').themestrapPluginReadMore({ maxHeight: 140 });

const rm = $('.my-content').data('__readmore');
rm.open();
rm.close();
rm.toggle();
rm.destroy();
```

String commands work through the jQuery bridge and return the jQuery collection:

```js
$('.my-content').themestrapPluginReadMore('open');
$('.my-content').themestrapPluginReadMore('close');
$('.my-content').themestrapPluginReadMore('toggle');
$('.my-content').themestrapPluginReadMore('destroy');
```

| Method | Returns | Description |
|---|---|---|
| `open()` | instance | Expands the content block |
| `close()` | instance | Collapses the content block back to `maxHeight` |
| `toggle()` | instance | Flips between expanded and collapsed |
| `destroy()` | instance | Full teardown — removes injected DOM, classes, custom properties, and event listeners |


## Events

Both events are native `CustomEvent` instances dispatched on the wrapper element with `{ bubbles: true }`.

| Event | Fires when |
|---|---|
| `ts.readmore.open` | Expansion begins (before the height transition completes) |
| `ts.readmore.close` | Collapse begins (before the height transition completes) |

```js
document.addEventListener('ts.readmore.open', (e) => {
  console.log('Expanded:', e.target);
});

document.querySelector('.my-content').addEventListener('ts.readmore.close', () => {
  console.log('Collapsed');
});
```


## CSS Custom Properties

All per-instance values are set as custom properties on the wrapper element. Override them directly in CSS for fine-grained control without re-initializing.

| Property | Default | Set by |
|---|---|---|
| `--ts-rm-dur` | `400ms` | `animDuration` |
| `--ts-rm-ease` | `ease` | `animEasing` |
| `--ts-rm-overlay-h` | `100px` | `overlayHeight` |
| `--ts-rm-gradient` | _(computed)_ | `overlayColor` / `overlayStartColor` / `overlayGradient` |
| `--ts-rm-gradient-dark` | _(computed)_ | `darkOverlayColor` / `darkOverlayStartColor` / `darkOverlayGradient` |

```css
#my-content {
  --ts-rm-dur:  600ms;
  --ts-rm-ease: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```


## CSS Classes

| Class | Applied to | Purpose |
|---|---|---|
| `.ts-readmore` | Wrapper | Position context, `overflow: hidden`, and height transition |
| `.ts-readmore.is-expanded` | Wrapper | Lifts `overflow` to `visible` after the expansion transition completes |
| `.ts-readmore-overlay` | Injected `<div>` | Gradient fade element pinned to wrapper bottom |
| `.ts-readmore-overlay.is-hidden` | Overlay | Fades overlay to opacity 0 while expanded |
| `.ts-readmore-btn-wrap` | Button wrapper | Absolutely positioned at wrapper bottom, z-index 2 |
| `.ts-readmore-btn-wrap.align-{start\|center\|end}` | Button wrapper | Text alignment variant |


## Dark Mode

Dark mode support is implemented entirely in CSS using the `--ts-rm-gradient-dark` custom property set on the wrapper element during `build()`. No JavaScript listeners are registered — the switch is instant and automatic regardless of how dark mode is activated.

### Activation selectors (injected CSS, in cascade order)

```css
/* 1. System preference — applies when no explicit theme attribute is present */
@media (prefers-color-scheme: dark) {
    .ts-readmore-overlay {
        background: var(--ts-rm-gradient-dark, var(--ts-rm-gradient));
    }
}

/* 2. Bootstrap 5.3 data-bs-theme attribute (on any ancestor element) */
[data-bs-theme="dark"] .ts-readmore-overlay,
html.dark .ts-readmore-overlay {
    background: var(--ts-rm-gradient-dark, var(--ts-rm-gradient));
}

/* 3. Explicit light override — wins over system dark preference */
[data-bs-theme="light"] .ts-readmore-overlay {
    background: var(--ts-rm-gradient);
}
```

The fallback `var(--ts-rm-gradient-dark, var(--ts-rm-gradient))` means that if no dark colour is configured, the light gradient is used in dark mode too. Backward-compatible by design.

### Basic usage

```js
$('.article').themestrapPluginReadMore({
  overlayColor:     '#ffffff',  // light surface
  darkOverlayColor: '#0f1117',  // dark surface
});
```

### Activating dark mode

```js
// Bootstrap 5.3 — toggle on any ancestor, not just <html>
document.getElementById('my-card').setAttribute('data-bs-theme', 'dark');

// Common class-based approach
document.documentElement.classList.add('dark');

// Bootstrap 5.3 toggle on <html>
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

### Overlay gradient control — dark mode

The same three-level hierarchy applies:

```js
// Level 1 — raw gradient (full control)
{ darkOverlayGradient: 'linear-gradient(180deg, transparent 0%, #0f1117 100%)' }

// Level 2 — explicit both stops
{ darkOverlayColor: '#0f1117', darkOverlayStartColor: 'rgba(15,17,23,0)' }

// Level 3 — opaque end only, start auto-derived (hex only)
{ darkOverlayColor: '#0f1117' }
```


## Overlay Gradient Control

### Light mode

```js
// Level 1 — raw gradient
{ overlayGradient: 'linear-gradient(to right, transparent 0%, #ffffff 100%)' }

// Level 2 — explicit both stops
{ overlayColor: '#f0f4f8', overlayStartColor: 'rgba(240,244,248,0)' }

// Level 3 — opaque end only, start auto-derived (hex only)
{ overlayColor: '#f0f4f8' }
```

> Auto-derivation of the transparent start colour only works for 3- and 6-digit hex strings (`#fff`, `#f0f4f8`). For `rgb()`, `hsl()`, or CSS custom properties, always provide `overlayStartColor` explicitly.


## Recipes

### Dark mode — automatic switching

```js
$('.card-body').themestrapPluginReadMore({
  overlayColor:     '#ffffff',
  darkOverlayColor: '#1e2030',
});
```

Toggle with Bootstrap 5.3:
```js
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

### Dark card — always dark (no switching)

```js
$('.dark-card .bio').themestrapPluginReadMore({
  overlayColor: '#1e2030',
});
```

### One-shot expand — no collapse

```js
$('.article-excerpt').themestrapPluginReadMore({
  enableToggle: false,
  maxHeight:    80,
});
```

### Custom horizontal gradient

```js
$('.content').themestrapPluginReadMore({
  overlayGradient:     'linear-gradient(to right, transparent 0%, #ffffff 100%)',
  darkOverlayGradient: 'linear-gradient(to right, transparent 0%, #0f1117 100%)',
  overlayHeight:       200,
  maxHeight:           300,
});
```

### External trigger

```js
$('#content').themestrapPluginReadMore({ maxHeight: 120 });

$('#ext-btn').on('click', () => {
  $('#content').data('__readmore').toggle();
});
```

### Spring easing

```js
$('.content').themestrapPluginReadMore({
  animDuration: 700,
  animEasing:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
});
```

### Scroll back on collapse

```js
$('.content').themestrapPluginReadMore({
  onClose: ($wrap) => {
    $wrap[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
});
```


## Common Pitfalls

**Button never appears**

The plugin does not create `.readmore-button-wrapper` — it must already be a direct child of the content wrapper. If it is absent, no error is thrown, but the toggle control is never rendered.

```
✓ This must exist inside the content wrapper:
    <div class="readmore-button-wrapper d-none">
      <a href="#"></a>
    </div>
```


**Gradient seam visible**

`overlayColor` must match the element's actual rendered background. For elements that inherit their background from a parent, read the computed value and be aware of the hex-only auto-derivation limit:

```js
// Computed background returns rgb(…) — auto-derivation won't work
const bg = getComputedStyle(el).backgroundColor;

$(el).themestrapPluginReadMore({
  overlayColor:      bg,
  overlayStartColor: 'rgba(255, 255, 255, 0)',  // must be explicit
});
```

The same applies to `darkOverlayColor` and `darkOverlayStartColor`.


**Non-hex colour produces a transparent-start mismatch**

Auto-derivation of the start colour supports only 3- and 6-digit hex strings. Any other format — `rgb()`, `hsl()`, named colours, or CSS variables — falls through to `transparent`, producing a hard edge at the top of the gradient.

```js
// Risky
{ overlayColor: 'rgb(240, 244, 248)' }

// Safe
{ overlayColor: 'rgb(240, 244, 248)', overlayStartColor: 'rgba(240, 244, 248, 0)' }
```


**Dark mode activates even with an explicit light theme**

If the system preference is dark but the page uses an explicit light theme (i.e. no `data-bs-theme` attribute is set anywhere), the `@media (prefers-color-scheme: dark)` block applies the dark gradient. To prevent this when controlling theme programmatically, always set `data-bs-theme="light"` on `<html>` for the light state in addition to `data-bs-theme="dark"` for the dark state. The injected CSS has a `[data-bs-theme="light"]` override that takes precedence.

```js
// Correct two-state toggle
const html = document.documentElement;
toggleBtn.addEventListener('click', () => {
  const isDark = html.getAttribute('data-bs-theme') === 'dark';
  html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
});
```


**Content taller after lazy images load**

`scrollHeight` is read at the moment `open()` is called. If images or embeds load after that point and increase the true content height, the expanded container is clipped at the earlier snapshot. Re-invoke after images settle:

```js
const rm = $('#content').data('__readmore');
$('#content img').on('load', () => { rm.close(); rm.open(); });
```


**Plugin initialized inside a hidden parent**

If the wrapper is inside a collapsed Bootstrap `accordion`, a hidden tab panel, or any element with `display: none`, `scrollHeight` is 0 at init time. Initialize — or call `destroy()` then re-initialize — after the parent becomes visible.