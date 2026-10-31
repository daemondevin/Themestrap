# PluginHoverEffect

Pointer-driven hover effects with no dependencies: a magnetic pull toward the pointer, a 3D tilt, or both together, with an optional scale and a moving glare highlight. Motion is eased with `requestAnimationFrame` and springs back when the pointer leaves.

**File:** `js/components/themestrap.plugin.hovereffect.js`  
**Demo:** `demos/plugin.demo.hovereffect.html`  
**jQuery method:** `$.fn.themestrapPluginHoverEffect`  
**Data attribute:** `data-plugin-hover-effect`, or the `.hover-effect-3d` class  
**Instance key:** `__hoverEffect`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

> Earlier versions used the hover3d jQuery plugin for the tilt. The tilt is now built in; hover3d is no longer needed, and `themestrap.modules.js` no longer loads it.



## How It Works

On `build()` the plugin records the element's inline `transform`, `transition` and `will-change`, then binds `pointerenter`, `pointermove` and `pointerleave` (passive) for the chosen effect.

On every pointer move it works out where the pointer is relative to the element's center, from −1 to 1 on each axis, and sets targets:

| Effect | Target |
| - | - |
| Magnetic | `translate3d(x × magneticMx × width, y × magneticMy × height)` |
| Tilt | `rotateX(−y × magneticDeg)` and `rotateY(x × magneticDeg)`, behind `perspective(perspective px)` |
| Scale | `scale` while the pointer is over the element |

A single animation loop moves the current values a fraction (`ease`) toward the targets each frame and stops once they are within 0.001. On leave, all targets return to zero and the element eases back. When everything is back at rest the original inline transform is restored exactly, and any transform you had before initialization is kept in front of the plugin's own.

The glare, when on, is an absolutely positioned `<span>` inside the element with a white radial gradient that follows the pointer.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.hovereffect.js"></script>
<script src="js/themestrap.init.js"></script>
```

No stylesheet is needed.

### 2. Mark it up

```html
<!-- magnetic pull (the default) -->
<a href="#" class="btn btn-primary" data-plugin-hover-effect>Get started</a>

<!-- 3D tilt with glare -->
<div class="card" data-plugin-hover-effect
     data-plugin-options='{"effect": "3d", "glare": true, "scale": 1.03}'> ... </div>

<!-- tilt via the legacy class -->
<div class="hover-effect-3d"> ... </div>
```

`themestrap.init.js` already wires both forms:

```js
themestrap.fn.intObsInit('[data-plugin-hover-effect]:not(.manual), .hover-effect-3d:not(.manual)', 'themestrapPluginHoverEffect');
```

### Manual init

```js
$('.pricing-card').themestrapPluginHoverEffect({ effect: 'magnetic-3d', magneticMx: 0.05, magneticMy: 0.05, magneticDeg: 6 });
```



## Markup Reference

| Attribute or class | Role |
| - | - |
| `data-plugin-hover-effect` | Marks the element. |
| `.hover-effect-3d` | Marks the element and forces the tilt effect, whatever `effect` says. |
| `data-plugin-options` | JSON options. |
| `class="manual"` | Keeps auto-init away. |

### Effect names

| `effect` | Result |
| - | - |
| `magnetic` | Pull toward the pointer. |
| `3d` or `tilt` | 3D tilt. |
| `magnetic-3d`, `magnetic3d` or `combined` | Both. |
| `none` | Nothing moves; `scale` and `glare` still work. |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `effect` | `string` | `'magnetic'` | See the table above. |
| `magneticMx` | `number` | `0.15` | Horizontal pull as a fraction of the element's width at the far edge. `0.15` subtle, `0.3` moderate, `0.5` strong. |
| `magneticMy` | `number` | `0.30` | Vertical pull as a fraction of its height. |
| `magneticDeg` | `number` | `12` | Maximum tilt in degrees, used by the tilt effects. |
| `perspective` | `number` | `800` | Perspective in px for the tilt. `0` or `false` leaves it out. |
| `scale` | `number` | `1` | Scale while hovered (`1.04` lifts the element slightly). |
| `ease` | `number` | `0.15` | Fraction of the remaining distance covered each frame. Lower is smoother and slower; `1` is instant. |
| `glare` | `boolean` | `false` | Add the moving highlight. |
| `glareOpacity` | `number` | `0.20` | Strength of the highlight's center. |
| `glareSize` | `number` | `80` | Highlight radius as a percentage of the element. |
| `glareTransition` | `number` | `150` | Fade in and out time in ms. |
| `glareClass` | `string` | `'ts-hover-effect-glare'` | Class on the glare `<span>`. |
| `selector` | `string` | `'.thumb-info, .hover-effect-3d-wrapper'` | Left over from the hover3d version. Not used. |
| `sensitivity` | `number` | `20` | Left over from the hover3d version. Not used. |



## Public API

Read the instance from a fresh selection, never off the init call.

| Method | Returns | Description |
| - | - | - |
| `destroy()` | `this` | Cancels the animation, removes the listeners and the glare, restores the original inline `transform`, `transition` and `will-change`, and removes the instance. |
| `refresh()` | `this` | Reserved; does nothing yet. Sizes are read on every move, so resizing needs no refresh. |

The bridge accepts these as strings:

```js
$('.card').themestrapPluginHoverEffect('destroy');
```

To change options, destroy and initialize again.



## Events

None.



## CSS Custom Properties

None. The plugin writes `transform` (and `transform-style: preserve-3d` for the tilt) inline. Style the glare through its class:

```css
.ts-hover-effect-glare { mix-blend-mode: soft-light; border-radius: inherit; }
```

### Dark mode

The glare is always white, which reads best on dark or photographic surfaces. On light cards lower `glareOpacity` to around `0.1`.

### Reduced motion

There is no reduced-motion handling. Skip the effect for those users:

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('[data-plugin-hover-effect], .hover-effect-3d').addClass('manual');
}
```

Run this before `themestrap.init.js`.



## Keyboard Navigation

The effect follows the pointer only and does not change focus or keyboard behavior.



## ARIA Wiring

The glare `<span>` has `aria-hidden="true"`. Nothing else is added.



## Recipes

### A subtle magnetic button

```html
<button class="btn btn-dark" data-plugin-hover-effect
        data-plugin-options='{"magneticMx": 0.2, "magneticMy": 0.35, "ease": 0.2}'>Subscribe</button>
```

### Tilting cards with a lift

```html
<div class="row g-4">
    <div class="col-md-4"><div class="card h-100" data-plugin-hover-effect
         data-plugin-options='{"effect": "3d", "magneticDeg": 8, "scale": 1.03, "glare": true}'> ... </div></div>
</div>
```

### Elements added later

```js
$(newCardsHtml).appendTo('#grid').filter('[data-plugin-hover-effect]').themestrapPluginHoverEffect();
```



## Common Pitfalls

### A CSS transition makes the motion feel laggy

The plugin eases in JavaScript. A `transition: transform …` on the element adds a second ease on top and the motion trails. Remove transitions on `transform` from hovered elements, or set `ease: 1` and let CSS do the easing.

### A CSS `:hover` transform is overwritten

The plugin writes `transform` inline, which beats a stylesheet `:hover { transform: … }`. Use the `scale` option instead, or apply the hover transform to a child.

### The glare spills outside rounded corners

The glare is positioned inside the element. Give the element `overflow: hidden`, or `border-radius: inherit` on `.ts-hover-effect-glare`. If the element was `position: static`, the plugin sets `position: relative` on it.

### Magnetic links feel hard to click

A strong pull moves the target away from where the pointer started. Keep `magneticMx` and `magneticMy` at or below `0.3` for buttons and links.

### Options from the old plugin do nothing

`selector` and `sensitivity` belong to the hover3d version and are ignored. Use `magneticDeg` for the tilt strength.

### Diagnostic checklist

- [ ] The element has `data-plugin-hover-effect` or `.hover-effect-3d`.
- [ ] No CSS `transition` on `transform` fights the animation.
- [ ] Tilt effects use `effect: '3d'` (or the class), not `selector` or `sensitivity`.
- [ ] Glare elements clip with `overflow: hidden`.
- [ ] Reduced motion is respected.
