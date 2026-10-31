# PluginParallax

Three scroll and pointer effects in one plugin: a background image that drifts or zooms as the section scrolls past, any CSS property scrubbed between two values by scroll position, and layers that shift with the mouse. Updates are throttled to one per animation frame, and no vendor library is needed.

**File:** `js/components/themestrap.plugin.parallax.js`  
**Demo:** `demos/plugin.demo.parallax.html`  
**jQuery method:** `$.fn.themestrapPluginParallax`  
**Data attribute:** `data-plugin-parallax`  
**Instance key:** `__parallax`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

> The plugin was rewritten without jQuery Visible. Older notes describe options that no longer exist (`horizontalPosition`, `offset`, `enableOnMobile`, `scrollableParallaxMinWidth`, `startOffset`, `transitionDuration`) and different defaults. This guide matches the current file.



## How It Works

Every mode works from one number, **progress**: 0 when the element's top edge reaches the bottom of the viewport, 1 when its bottom edge leaves the top. The plugin recalculates it on window scroll and resize, at most once per frame.

| Mode | Option | What moves |
| - | - | - |
| Background | default | An image layer behind the content, translated or scaled by progress |
| Scrub | `scrollableParallax: true` | One CSS property on one child, from `cssValueStart` to `cssValueEnd` |
| Mouse | `mouseParallax: true` | `.parallax-mouse-object` children, offset by pointer position |

One mode per element: `mouseParallax` wins over `scrollableParallax`, which wins over the background mode.

On first use the plugin injects `<style id="themestrap-parallax-styles">`, which also gives every `[data-plugin-parallax]` element `position: relative; overflow: hidden`.

### Background mode

1. The image comes from the `imageSrc` option, then `data-image-src`, then the element's own CSS `background-image`.
2. The element's content is moved into a new `.parallax-content-layer` (above), and a `.parallax-bg-layer` (below) is added with the image, `background-size: cover` and a height of `parallaxHeight`.
3. The element's own `background-image` is cleared, so the image is not painted twice.
4. On each update the layer is translated by `(progress − 0.5) × (layer height − element height)`, upward by default or downward with `parallaxDirection: 'bottom'`. The layer is centered when the element is in the middle of its trip.

With `parallaxScale: true` the layer is the element's height and is scaled from 1 to `1 + speed × 0.5` instead (or the reverse with `parallaxScaleInvert`).

Updates are skipped while the element is more than 50 px outside the viewport.

### Scrub mode

The target is the first `.scrollable-parallax-wrapper` inside the element, or else its first child, or else the element itself. On each update its inline `style[cssProperty]` is set to `cssValueStart + (cssValueEnd − cssValueStart) × progress`, followed by `cssValueUnit`.

### Mouse mode

The element gets `.parallax-mouse-host`. On `mousemove` the pointer's position from the element's center is measured from −1 to 1 on each axis, and each `.parallax-mouse-object` is translated by `position × data-value × 8` px. On `mouseleave` the objects return to `translate(0, 0)`.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.parallax.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<section data-plugin-parallax data-image-src="img/mountains.jpg"
         data-plugin-options='{"parallaxHeight": "160%"}'
         style="min-height: 60vh;">
    <div class="container py-5 text-white">
        <h2>Foreground content</h2>
    </div>
</section>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-parallax]:not(.manual)', 'themestrapPluginParallax');
```

### Manual init

```js
$('#hero').themestrapPluginParallax({ imageSrc: 'img/hero.jpg', parallaxDirection: 'bottom' });
```



## Markup Reference

| Attribute or class | On | Role |
| - | - | - |
| `data-plugin-parallax` | Host | Marks the element. |
| `data-image-src` | Host | Background image URL (background mode). |
| `data-plugin-options` | Host | JSON options. |
| `.scrollable-parallax-wrapper` | Child | The element to scrub (scrub mode). Optional; the first child is used otherwise. |
| `.parallax-mouse-object` | Child | A layer that follows the mouse (mouse mode). |
| `data-value` | `.parallax-mouse-object` | Depth. Unitless; each unit is up to 8 px of travel. Default `3`. |

### Generated markup (background mode)

```html
<section data-plugin-parallax style="background-image: none;">
    <div class="parallax-bg-layer" style="background-image: url(img/mountains.jpg); height: 160%; transform: translateY(-48.20px);"></div>
    <div class="parallax-content-layer">
        <!-- your original content -->
    </div>
</section>
```



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `speed` | `number` | `1.5` | Scale mode only: the image zooms to `1 + speed × 0.5`. It does not affect the translate effect. |
| `parallaxDirection` | `string` | `'top'` | Background mode: `'top'` moves the image up as the page scrolls down; `'bottom'` moves it down. |
| `parallaxHeight` | `string` | `'150%'` | Height of the image layer. The extra beyond 100% is how far it travels. |
| `imageSrc` | `string\|null` | `null` | Background image URL. Wins over `data-image-src`. |
| `parallaxScale` | `boolean` | `false` | Zoom the image instead of moving it. |
| `parallaxScaleInvert` | `boolean` | `false` | Start zoomed in and zoom out. |
| `scrollableParallax` | `boolean` | `false` | Use scrub mode. |
| `cssProperty` | `string` | `'width'` | Scrub mode: the property to set, in JavaScript form (`'opacity'`, `'letterSpacing'`, `'width'`). |
| `cssValueStart` | `number` | `0` | Scrub mode: value at progress 0. |
| `cssValueEnd` | `number` | `100` | Scrub mode: value at progress 1. |
| `cssValueUnit` | `string` | `'%'` | Scrub mode: unit after the number. `''` for unitless properties. |
| `mouseParallax` | `boolean` | `false` | Use mouse mode. |

The travel distance in background mode is set by `parallaxHeight`: at `150%` on a 400 px section the image moves 200 px over the whole scroll; at `200%` it moves 400 px.



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only.

```js
const px = $('#hero').data('__parallax');
```

| Method | Returns | Description |
| - | - | - |
| `refresh()` | `this` | Recalculates and applies the current position now. Call it after the element's size changes without a window resize (an accordion opening, content loading). Does nothing in mouse mode. |
| `destroy()` | `this` | Stops updates, removes the listeners, restores the element's original HTML and `style`, and removes the instance. |

To change options, destroy and initialize again.



## Events

Both are native `CustomEvent`s dispatched on the host with `bubbles: false`, so listen on the element itself.

| Event | When | `detail` |
| - | - | - |
| `parallax:update` | Each background-mode update while near the viewport | `{ progress, instance }` |
| `parallax:mouse` | Each pointer move in mouse mode | `{ dx, dy, instance }` (−1 to 1) |

```js
document.getElementById('hero').addEventListener('parallax:update', function (e) {
    this.style.setProperty('--hero-progress', e.detail.progress.toFixed(3));
});
```

Scrub mode fires no event.



## CSS Custom Properties

None are defined. Injected styles:

```css
[data-plugin-parallax] { position: relative; overflow: hidden; }
.parallax-bg-layer {
    position: absolute; top: 0; left: 0; width: 100%;
    background-size: cover; background-repeat: no-repeat; background-position: center center;
    pointer-events: none; will-change: transform;
}
.parallax-mouse-host   { position: relative; overflow: hidden; }
.parallax-mouse-object { will-change: transform; }
.parallax-content-layer { position: relative; z-index: 1; }
```

Darken the image for legible text:

```css
#hero .parallax-bg-layer::after { content: ''; position: absolute; inset: 0; background: rgba(10, 25, 41, .55); }
```

Change the focal point:

```css
#hero .parallax-bg-layer { background-position: center 30%; }
```

### Reduced motion

The plugin does not check `prefers-reduced-motion`. Skip it for those users before `themestrap.init.js` runs:

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('[data-plugin-parallax]').addClass('manual').each(function () {
        const src = $(this).data('image-src');
        if (src) { $(this).css({ backgroundImage: 'url(' + src + ')', backgroundSize: 'cover' }); }
    });
}
```



## Keyboard Navigation

Parallax is decorative and does not affect focus or keyboard use.



## ARIA Wiring

None. The image layer is a CSS background, so it is not announced. If the image carries meaning, describe it in the content.



## Recipes

### Slow drift with a tall layer

```html
<section data-plugin-parallax data-image-src="img/forest.jpg"
         data-plugin-options='{"parallaxHeight": "200%"}'> … </section>
```

### Zoom on scroll

```html
<section data-plugin-parallax data-image-src="img/city.jpg"
         data-plugin-options='{"parallaxScale": true, "speed": 0.6}'> … </section>
```

`speed: 0.6` zooms from 1× to 1.3×.

### A progress bar that grows on scroll

```html
<div data-plugin-parallax
     data-plugin-options='{"scrollableParallax": true, "cssProperty": "width", "cssValueStart": 10, "cssValueEnd": 100, "cssValueUnit": "%"}'>
    <div class="scrollable-parallax-wrapper" style="height: 4px; background: #e8672a;"></div>
</div>
```

### Fade in on scroll

```html
<div data-plugin-parallax
     data-plugin-options='{"scrollableParallax": true, "cssProperty": "opacity", "cssValueStart": 0, "cssValueEnd": 1, "cssValueUnit": ""}'>
    <div class="scrollable-parallax-wrapper"> … </div>
</div>
```

The value is set across the whole trip, so it reaches 1 only as the element leaves the top. For a fade that completes earlier, use `parallax:update`-style logic of your own, or PluginScrollFx.

### Layered mouse scene

```html
<div data-plugin-parallax data-plugin-options='{"mouseParallax": true}' style="height: 420px;">
    <img class="parallax-mouse-object position-absolute" data-value="1" src="img/sky.png" alt="">
    <img class="parallax-mouse-object position-absolute" data-value="3" src="img/hills.png" alt="">
    <img class="parallax-mouse-object position-absolute" data-value="6" src="img/tree.png" alt="">
</div>
```

Higher values move further and read as closer.



## Common Pitfalls

### Event handlers inside the section stop working

Background mode rebuilds the content: it reads the element's HTML and writes it back inside `.parallax-content-layer`. Handlers bound directly to elements inside before init are lost, and so are form values and other live state. Initialize first and bind afterward, or use delegated handlers (`$(document).on('click', '#hero .btn', …)`). `destroy()` rebuilds the content again.

### `speed` does nothing

`speed` only affects the zoom in scale mode. For the translate effect, change `parallaxHeight`.

### The image does not move

The layer moves by the difference between its height and the element's. With `parallaxHeight: '100%'` there is nothing to move. Also check that the element has a height of its own (`min-height`), since the content layer is the only thing giving it size.

### Gaps at the top or bottom of the section

With a short `parallaxHeight` and a tall section, the image may not cover the section at the ends of the scroll. Raise `parallaxHeight`.

### The image is clipped wrongly or spills out

The injected `overflow: hidden` on `[data-plugin-parallax]` clips the layer. If your CSS overrides `overflow` on the element, the image shows outside it.

### Scrub mode changes the wrong element

Without a `.scrollable-parallax-wrapper`, the first child is used, which may be a heading or a wrapper you did not intend. Add the class to the element you mean.

### Scrubbed numbers need no unit

`cssValueUnit` defaults to `'%'`. For `opacity`, `zIndex` or `flexGrow` set it to `''`, or the browser ignores the value.

### Diagnostic checklist

- [ ] The element has a height of its own.
- [ ] The image is in `data-image-src` or `imageSrc` (or the element's CSS background).
- [ ] `parallaxHeight` is above `100%` for the translate effect.
- [ ] Only one of `mouseParallax` and `scrollableParallax` is set.
- [ ] Event handlers inside are bound after init, or delegated.
- [ ] `cssValueUnit` suits the scrubbed property.
- [ ] Event listeners are on the element itself (the events do not bubble).
