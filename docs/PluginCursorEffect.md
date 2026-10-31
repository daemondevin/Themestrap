# PluginCursorEffect

A custom cursor: a ring that follows the mouse with a dot at its center. The ring can snap around buttons and cards, the dot can turn into a plus sign, and the native cursor can be hidden.

**File:** `js/components/themestrap.plugin.cursoreffect.js`  
**Demo:** `demos/plugin.demo.cursoreffect.html`  
**jQuery method:** `$.fn.themestrapPluginCursorEffect`  
**Data attribute:** `data-plugin-cursor-effect`  
**Instance key:** `__cursorEffect`  
**Init strategy:** `intObsInit` via `themestrap.init.js`



## How It Works

On `build()` the plugin:

1. Adds classes to the element it was initialized on: `hide-mouse-cursor` (when `hideMouseCursor`), a size class (`cursor-effect-size-small` or `-big`), and the `style` class if one is given.
2. Creates `<div class="cursor-outer">` (the ring) and `<div class="cursor-inner">` (the dot) and prepends both to `<body>`.
3. Starts a `requestAnimationFrame` loop that moves both to the last mouse position with a `transform`.

A `mousemove` listener on the document records the position. The ring's slight lag comes from its CSS transition. Elements marked with `data-cursor-effect-hover` change the cursor while hovered:

| Value | Effect |
| - | - |
| `fit` | The ring stops following and wraps the element: same box, same border radius. The dot hides. Scrolling releases it. |
| `plus` | The dot becomes a `+`. |

`data-cursor-effect-hover-color="light"` or `"dark"` adds `cursor-color-light` or `cursor-color-dark` to both nodes while hovered.

The cursor is document-wide. The element you initialize only receives the classes, so in practice the plugin goes on `<body>`.

**The plugin injects no CSS.** The `.cursor-outer` and `.cursor-inner` styles come from `themestrap-elements.css`.



## Quick Start

### 1. Include the files

```html
<link rel="stylesheet" href="css/themestrap-elements.css">

<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.cursoreffect.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<body data-plugin-cursor-effect data-plugin-options='{"hideMouseCursor": true, "size": "big"}'>
    ...
    <a href="/work" class="btn btn-dark" data-cursor-effect-hover="fit">See our work</a>
    <figure data-cursor-effect-hover="plus" data-cursor-effect-hover-color="light">...</figure>
</body>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-cursor-effect]:not(.manual)', 'themestrapPluginCursorEffect');
```

### Manual init

```js
$('body').themestrapPluginCursorEffect({
    cursorOuterColor: '#20e2d7',
    cursorInnerColor: '#20e2d7',
    size: 'small'
});
```



## Markup Reference

| Attribute | On | Role |
| - | - | - |
| `data-plugin-cursor-effect` | `<body>` | Turns the effect on for the page. |
| `data-plugin-options` | `<body>` | JSON options. |
| `data-cursor-effect-hover="fit"` | Any element | The ring wraps this element while hovered. |
| `data-cursor-effect-hover="plus"` | Any element | The dot becomes a plus while hovered. |
| `data-cursor-effect-hover-color` | A hover element | `light` or `dark` cursor while hovered. |

### Generated nodes

```html
<body class="hide-mouse-cursor cursor-effect-size-big" data-plugin-cursor-effect>
    <div class="cursor-inner" style="transform: translate(412px, 230px);"></div>
    <div class="cursor-outer" style="transform: translate(412px, 230px);"></div>
    ...
</body>
```



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `size` | `string` | `'default'` | `small` (20 px ring), `default` (40 px) or `big` (60 px). |
| `hideMouseCursor` | `boolean` | `false` | Hide the native cursor on the element and on links, buttons and fields inside it. |
| `cursorOuterColor` | `string\|null` | `null` | Ring color, as any CSS color. Default is the theme's `--primary`. |
| `cursorInnerColor` | `string\|null` | `null` | Dot color. Default is `--primary`. |
| `style` | `string\|null` | `null` | A class added to the element. `cursor-effect-style-square` gives a square ring and dot. |

Options such as `color`, `type` or `hideNative` do not exist and are ignored.



## Public API

Read the instance from a fresh selection, never off the init call.

```js
const cursor = $('body').data('__cursorEffect');
```

| Method | Returns | Description |
| - | - | - |
| `setSize(size)` | `this` | `small`, `default` or `big`. Anything else becomes `default`. |
| `hide()` | `this` | Hides both nodes (adds Bootstrap's `opacity-0`). |
| `show()` | `this` | Shows them again. |
| `destroy()` | `this` | Stops the loop, removes the listeners and both nodes, removes the classes and the instance. |

To change colors, destroy and re-initialize:

```js
$('body').data('__cursorEffect').destroy();
$('body').themestrapPluginCursorEffect({ cursorOuterColor: '#e8672a', cursorInnerColor: '#e8672a' });
```



## Events

None.



## CSS Custom Properties

None of its own. `themestrap-elements.css` colors the ring and dot with `--primary` and the light and dark variants with `--light` and `#212121`, and positions both `position: fixed` at `z-index` 9998 and 9999.

```css
/* a thicker, softer ring */
.cursor-outer { border-width: 2px; opacity: .6; transition-duration: .15s; }

/* a difference-blend dot that shows on any background */
.cursor-inner { mix-blend-mode: difference; background-color: #fff; }
```

Bootstrap's `.opacity-0` utility is used for hiding; without Bootstrap, add `.opacity-0 { opacity: 0 !important; }`.

### Reduced motion

There is no reduced-motion handling. Skip the effect for those users:

```js
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('body').themestrapPluginCursorEffect({ hideMouseCursor: true });
}
```



## Keyboard Navigation

The effect is mouse-only and does not change keyboard behavior. With `hideMouseCursor: true`, keep visible focus styles: the custom cursor does not follow focus.



## ARIA Wiring

Both nodes are decorative and have `pointer-events: none`. They are not hidden from assistive technology explicitly; they are empty, so nothing is announced.



## Recipes

### Only on devices with a precise pointer

```js
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $('body').themestrapPluginCursorEffect({ hideMouseCursor: true });
}
```

On touch screens there is no `mousemove`, so the nodes stay parked off-screen; the check above keeps them out of the page entirely.

### Hide the cursor over a video

```js
const cursor = $('body').data('__cursorEffect');
$('#hero-video').on('mouseenter', () => cursor.hide()).on('mouseleave', () => cursor.show());
```



## Common Pitfalls

### Hovering `fit` or `plus` elements does nothing

Builds before the October 2026 fix bound the hover handlers under a misspelled event name, so these effects never triggered. Update `themestrap.plugin.cursoreffect.js`.

### Size or style options do nothing

The size and style classes go on the initialized element, and the CSS targets `.cursor-effect-size-big .cursor-outer`, so the element must contain the cursor nodes. The nodes live in `<body>`: initialize on `<body>` (or `<html>`), not on a section.

### Two cursors

Each instance adds its own pair of nodes. Initialize once, on `<body>`.

### The native cursor vanishes but no custom one appears

`themestrap-elements.css` is not loaded, so the nodes have no size or color. Load it, or copy the Cursor Effect block from it.

### The ring sits slightly off the pointer

The plugin offsets the position by 20 px to center the default 40 px ring. The small and big sizes compensate with `left` and `top` in CSS. If you change the ring size, adjust those offsets too.

### Diagnostic checklist

- [ ] `themestrap-elements.css` is loaded.
- [ ] The plugin is initialized once, on `<body>`.
- [ ] Options use the real names: `cursorOuterColor`, `cursorInnerColor`, `hideMouseCursor`, `size`, `style`.
- [ ] Bootstrap (or an `.opacity-0` rule) is present.
- [ ] Focus styles stay visible when the native cursor is hidden.
