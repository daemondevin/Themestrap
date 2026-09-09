# PluginRandomImages

Cycles through a list of images in place with Animate.css transitions. Works in two modes: **single-image** (swaps the `src` of one `<img>`) and **wrapper** (cycles `src` values across all `<img>` children of a container). The loop can be random or sequential, and stops on any of three independent stop conditions.

---

## Quick Start

### Auto-init (single image)

Add the class and pass options via `data-plugin-options`. The current `src` is automatically pushed to the image pool, so you only need to list the *additional* images in `imagesListURL`.

```html
<img src="first.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['second.jpg', 'third.jpg'], 'delay': 3000}"
     alt="">
```

### Auto-init (wrapper)

When the root element is a `<div>` (or any non-`<img>`), the plugin enters wrapper mode. It discovers all `<img>` children, shuffles their source pool, and swaps each one independently using `data-rimage-delay`.

```html
<div class="plugin-random-images" data-plugin-options="{'delay': 10000}">
  <img src="a.jpg" data-rimage-delay="2000" alt="">
  <img src="b.jpg" data-rimage-delay="3500" alt="">
  <img src="c.jpg" data-rimage-delay="2800" alt="">
</div>
```

### Automatic initialization

`themestrap.init.js` wires the plugin via `dynIntObsInit` — lazy viewport init with defaults merging:

```js
themestrap.fn.dynIntObsInit(
    '.plugin-random-images',
    'themestrapPluginRandomImages',
    themestrap.PluginRandomImages.defaults
);
```

The selector is a **class**, not a data attribute. There is no `.manual` opt-out for this plugin's auto-init. To prevent auto-init, omit the class and initialize programmatically.

### Manual initialization (jQuery)

```js
$('.plugin-random-images').themestrapPluginRandomImages({
    imagesListURL: ['b.jpg', 'c.jpg'],
    delay: 2500
});
```

### Manual initialization (vanilla JS)

```js
const inst = themestrap.PluginRandomImages.init(
    document.getElementById('my-img'),
    {
        imagesListURL: ['b.jpg', 'c.jpg'],
        delay: 2500
    }
);
```

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `minWindowWidth` | number | `0` | Plugin does not initialize when `window.innerWidth` is below this value. |
| `random` | boolean | `true` | Shuffle the image pool before each cycle. Set to `false` for sequential (reverse-order) cycling. |
| `imagesListURL` | array\|null | `null` | **Required for single-image mode.** Array of image URLs. The initial `src` is appended automatically, so list only the *additional* images here. |
| `lightboxImagesListURL` | array\|null | `null` | Parallel array of full-size image URLs. When the `<img>` is inside an `.lightbox` anchor, the `href` is kept in sync with the active image index. |
| `delay` | number\|null | `null` | Milliseconds between swaps. In single-image mode, defaults to `3000 ms` when `null`. In wrapper mode, sets the outer cycle interval; per-image timing is controlled by `data-rimage-delay`. |
| `animationDelay` | number | `1000` | Milliseconds between the exit animation starting and the `src` actually being swapped. Match this to your Animate.css animation duration. |
| `animateIn` | string | `'fadeIn'` | Animate.css class applied to the incoming image. Override per-image in wrapper mode with `data-rimage-animate-in`. |
| `animateOut` | string | `'fadeOut'` | Animate.css class applied to the outgoing image. Override per-image in wrapper mode with `data-rimage-animate-out`. |
| `stopAtImageIndex` | number\|false | `false` | Stop the loop when `perImageIndex` equals this value. Works best paired with `random: false` to make the target index predictable. |
| `stopAfterFewSeconds` | number\|false | `false` | Stop the loop after this many milliseconds, via a separate `setTimeout`. Fires independently of swap count. |
| `stopAfterXTimes` | number\|false | `false` | Stop the loop after this many swap cycles have completed. |
| `accY` | number | `0` | Vertical IntersectionObserver trigger offset (px), passed through by `dynIntObsInit`. |

Options go in a single-quoted attribute with double-quoted JSON keys — `themestrap.fn.getOptions()` normalizes quote style and handles malformed JSON gracefully.

```html
data-plugin-options="{'delay': 2500, 'animateIn': 'bounceIn', 'animateOut': 'bounceOut'}"
```

---

## Per-element Data Attributes (wrapper mode)

In wrapper mode these attributes on individual `<img>` children override the global options for that image only.

| Attribute | Description |
|---|---|
| `data-rimage-delay` | Swap interval for this image in milliseconds. Falls back to `2000` when absent. |
| `data-rimage-animate-in` | Animate.css class for this image's entrance. Falls back to the global `animateIn`. |
| `data-rimage-animate-out` | Animate.css class for this image's exit. Falls back to the global `animateOut`. |

---

## Public API

### Static methods

#### `PluginRandomImages.init(element, options)`

Initialize a single element and return the instance. Accepts a selector string or a DOM element.

```js
const inst = themestrap.PluginRandomImages.init('#my-img', {
    imagesListURL: ['b.jpg', 'c.jpg'],
    delay: 2000
});
```

Returns the `PluginRandomImages` instance, or `false` if the element was not found or initialization failed.

#### `PluginRandomImages.initAll(selector, options)`

Initialize all elements matching a selector or NodeList. Returns an array of instances.

```js
const instances = themestrap.PluginRandomImages.initAll('.hero-image', {
    delay: 4000
});
```

#### `PluginRandomImages.getInstance(element)`

Retrieve an existing instance without creating a new one. Accepts a selector string or a DOM element.

```js
const inst = themestrap.PluginRandomImages.getInstance(
    document.getElementById('my-img')
);

if (inst) {
    inst.stop();
}
```

Returns the instance or `null`.

### Instance methods

| Method | Returns | Description |
|---|---|---|
| `start(callback, delay)` | `this` | Start (or restart) the recursive loop. `callback` defaults to the appropriate mode handler; `delay` defaults to the configured option. |
| `stop()` | `this` | Pause the loop. Clears the interval timer but keeps the instance alive. Call `start()` to resume. |
| `destroy()` | `void` | Stop the loop, clear all timers, remove the instance from the internal registry, and delete the `__themestrapRandomImages` property from the element. |
| `perImageTag()` | `this` | Single-image swap handler. Applies exit animation, swaps `src`, applies entrance animation. Normally called internally by the loop. |
| `perWrapper()` | `this` | Wrapper-mode swap handler. Shuffles the source pool and cycles each child image. Normally called internally by the loop. |
| `shuffle(array)` | array | Fisher-Yates in-place shuffle. Returns the shuffled array. |

### Instance properties

| Property | Type | Description |
|---|---|---|
| `el` | HTMLElement | The root DOM element the plugin was initialized on. |
| `options` | object | Merged options (defaults + init opts + runtime mutations). |
| `running` | boolean | `true` while the loop is active. |
| `destroyed` | boolean | `true` after `destroy()` has been called. |
| `times` | number | Number of swap cycles completed so far. |
| `lastIndex` | number | Pool index of the currently displayed image. |
| `perImageIndex` | number | Pool index of the last image displayed (used by `stopAtImageIndex`). |

### Retrieving an instance

**Vanilla JS — recommended:**

```js
// Via the static helper
const inst = themestrap.PluginRandomImages.getInstance(el);

// Via the property written directly on the element
const inst = document.getElementById('my-img').__themestrapRandomImages;
```

**jQuery — bridge return value:**

```js
// Calling the bridge method on an already-initialized element returns the instance.
// Do this on a FRESH selection — never chain .data() off the init call.
$('#my-img').themestrapPluginRandomImages();       // init OR return existing
```

> [!WARNING]
> **Pitfall:** Chaining `.data('__randomimages')` off the bridge init call returns `undefined` because `.data()` reads from the jQuery object returned by `.map()`, not from the DOM element. Always retrieve the instance on a separate `$(selector)` call, or use `PluginRandomImages.getInstance()`.

---

## Events

The plugin dispatches one native `CustomEvent` on `document`, used internally for sequential-mode coordination.

| Event | Target | Fires when |
|---|---|---|
| `rimages.start` | `document` | A sequential-mode instance whose element has the `.the-last` class completes one cycle and triggers all peer instances to restart. |

```js
document.addEventListener('rimages.start', function (e) {
    console.log('sequential cycle triggered by', e.detail.source);
});
```

---

## Modes in Detail

### Single-image mode

Triggered when the root element is an `<img>`. The `imagesListURL` array is required — initialization returns `false` without it. During `buildImage()`:

1. The current `src` is appended to `imagesListURL` so the initial image participates in the pool.
2. `lastIndex` is set to the last index of the pool (the just-appended initial image), so the first swap picks a different one.
3. If `random: false`, `.the-last` is assigned to the last `.plugin-random-images` element in the document for sequential coordination.

### Wrapper mode

Triggered when the root element is anything other than an `<img>`. No `imagesListURL` is required. During `perWrapper()`:

1. The current `src` values of all `<img>` children are collected into a source pool.
2. The pool is shuffled (Fisher-Yates).
3. Each child image exits via its own `data-rimage-delay / 2` timeout, then gets a new `src` and enters at `data-rimage-delay`.

The outer loop interval (`delay` option) controls how often the entire shuffle-and-swap cycle repeats.

### Sequential mode (`random: false`)

Sequential mode only applies to single-image instances. Images cycle in reverse order through the pool (descending index). Multiple sequential instances on the same page coordinate via the `rimages.start` document event: the "last" instance (the one with `.the-last`) drives the loop and broadcasts to the others, which restart themselves on receipt.

---

## Recipes

### Inline pool, random, indefinite

```html
<img src="hero-1.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['hero-2.jpg', 'hero-3.jpg'], 'delay': 4000}"
     alt="">
```

### Wrapper with staggered swap times

```html
<div class="plugin-random-images" data-plugin-options="{'delay': 15000}">
  <img src="a.jpg" data-rimage-delay="2000" alt="">
  <img src="b.jpg" data-rimage-delay="3800" alt="">
  <img src="c.jpg" data-rimage-delay="2600" alt="">
  <img src="d.jpg" data-rimage-delay="4200" alt="">
</div>
```

### Play through once then stop

```html
<img src="slide-1.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['slide-2.jpg', 'slide-3.jpg'],
                           'random': false,
                           'delay': 3000,
                           'stopAfterXTimes': 3}"
     alt="">
```

### Stop on a specific image

```html
<img src="a.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['b.jpg', 'c.jpg'],
                           'random': false,
                           'delay': 2500,
                           'stopAtImageIndex': 1}"
     alt="">
```

### Stop after a duration

```html
<img src="hero.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['hero-b.jpg', 'hero-c.jpg'],
                           'delay': 2000,
                           'stopAfterFewSeconds': 10000}"
     alt="">
```

### Lightbox synchronization

```html
<a href="hero-full.jpg" class="lightbox">
  <img src="hero-thumb.jpg"
       class="plugin-random-images"
       data-plugin-options="{'imagesListURL': ['thumb-b.jpg', 'thumb-c.jpg'],
                             'lightboxImagesListURL': ['full-b.jpg', 'full-c.jpg'],
                             'delay': 3500}"
       alt="">
</a>
```

The `href` on the `.lightbox` anchor is kept in sync with the active image index automatically.

### Manual start / stop toggle

```js
const btn   = document.getElementById('toggle-btn');
const imgEl = document.getElementById('my-img');
let inst = null;

btn.addEventListener('click', function () {
    if (!inst) {
        inst = themestrap.PluginRandomImages.init(imgEl, {
            imagesListURL: ['b.jpg', 'c.jpg'],
            delay: 2000
        });
        btn.textContent = 'Stop';
        return;
    }

    if (inst.running) {
        inst.stop();
        btn.textContent = 'Resume';
    } else {
        inst.start(
            function () { inst.perImageTag(); },
            inst.options.delay
        );
        btn.textContent = 'Stop';
    }
});
```

### Viewport-width guard

Only rotate on viewports wider than 768 px:

```html
<img src="hero.jpg"
     class="plugin-random-images"
     data-plugin-options="{'imagesListURL': ['b.jpg', 'c.jpg'],
                           'delay': 3000,
                           'minWindowWidth': 768}"
     alt="">
```

---

## Common Pitfalls

**`imagesListURL` must be an array, not a string**

In single-image mode the plugin checks `Array.isArray(options.imagesListURL)` and exits with `false` if it is not an array. A JSON string or a bare URL string will fail silently.

```js
// Wrong
{ imagesListURL: 'images.json' }

// Correct
{ imagesListURL: ['b.jpg', 'c.jpg', 'd.jpg'] }
```

**`delay: null` means no looping in single-image mode**

When `delay` is `null` the calculated initial delay is `300 ms` and the loop delay is `3000 ms`. If you actually want no looping, set `stopAfterXTimes: 1`. Omitting `delay` entirely keeps the default `null`.

**Chaining `.data()` off the init call returns `undefined`**

The jQuery bridge returns a jQuery object from `.map()`, not the DOM element, so `.data('__randomimages')` reads from the wrong context.

```js
// Wrong — returns undefined
const inst = $('.plugin-random-images')
    .themestrapPluginRandomImages({ delay: 2000 })
    .data('__randomimages');

// Correct — retrieve on a fresh selection
$('.plugin-random-images').themestrapPluginRandomImages({ delay: 2000 });
const inst = themestrap.PluginRandomImages.getInstance(
    document.querySelector('.plugin-random-images')
);
```

**`stopAtImageIndex: 0` may stop immediately in sequential mode**

Pool index `0` is the last element in the reverse-sequential order. In sequential mode, the first swap lands on index `length - 2`. If the pool has only two images, `stopAtImageIndex: 0` halts after the very first swap. Use `stopAfterXTimes` or `stopAtImageIndex: 1` (or higher) for more predictable behaviour with small pools.

**Image pool includes the initial `src`**

The current `src` of the `<img>` is appended to `imagesListURL` during `buildImage()`. If you also include that same URL in the array you pass as the option, it appears twice in the pool.

```js
// Pool ends up as ['a.jpg', 'b.jpg', 'c.jpg', 'a.jpg'] — a.jpg twice
{ imagesListURL: ['a.jpg', 'b.jpg', 'c.jpg'] }
// and the <img src="a.jpg"> initial value gets appended

// Correct: only list the additional images
{ imagesListURL: ['b.jpg', 'c.jpg'] }
```

**`destroy()` is permanent**

After `destroy()` the instance is removed from the internal `WeakMap` and `getInstance()` returns `null`. Calling `start()` on a destroyed instance has no effect (`destroyed` guard exits early). To restart from scratch, call `PluginRandomImages.init()` again on the element.

**Sequential mode requires `.the-last` on the page**

Multiple sequential instances coordinate via a `.the-last` class that is assigned to the last `.plugin-random-images` element in DOM order when each instance initializes. If elements are added or removed from the DOM after init, call `markLastImageInstance()` on any one instance to re-assign the class.

**`animationDelay` must be ≤ your animation duration**

The default `animationDelay` of `1000 ms` matches Animate.css's default 1 s animation duration. If you use a faster animation via a custom `animation-duration` override, reduce `animationDelay` to match, or the image swap will happen after the animation has already finished, resulting in a visible cut.

```html
<style>
.animated { animation-duration: 500ms; }
</style>

<img src="hero.jpg"
     class="plugin-random-images"
     data-plugin-options="{'delay': 2000, 'animationDelay': 500}"
     ...>
```

### Diagnostic checklist

> - Images not rotating at all → check the browser console for `false` returned by `init()`; confirm `imagesListURL` is a non-empty array for single-image mode.
> - `delay` option ignored → `dynIntObsInit` only intersects and fires when the element enters the viewport; scroll it into view, or lower `accY`.
> - Loop stops immediately → check `stopAfterXTimes` default (`false`) — if you set it to `0`, the `Number(0) > 0` guard prevents it from firing, but `1` would stop after the first swap.
> - Animation class not applying → confirm Animate.css (`animate.compat.css`) is loaded; check that the class name is spelled as it appears in the Animate.css docs (case-sensitive).
> - Lightbox `href` out of sync → confirm `lightboxImagesListURL` has exactly the same number of entries as `imagesListURL` (after the initial src is appended, so one more than you pass in). Index mismatch causes `undefined` to be set as the href.
