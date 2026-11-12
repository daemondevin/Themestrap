# PluginReveal Guide

Fades elements in as they scroll into view, and gives a banner a slow parallax drift. Everything is done with element styles set from script, so no stylesheet is injected and the plugin works on pages with a strict Content Security Policy. Elements already on screen when the page loads are left alone, so nothing flashes, and visitors who prefer reduced motion get no effects at all.

| | |
|---|---|
| Plugin file | `js/components/themestrap.plugin.reveal.js` |
| Demo | `demos/plugin.demo.reveal.html` |
| Namespace class | `themestrap.PluginReveal` |
| jQuery method | `$.fn.themestrapPluginReveal` |
| Data attribute | `data-plugin-reveal` |
| Instance key | `__pluginReveal` |
| Options attribute | `data-plugin-options` |
| CSS token prefix | none, the plugin injects no CSS |


## How It Works

1. `initialize()` returns early if `$el.data('__pluginReveal')` already exists, otherwise it runs `setData → setOptions → build → events`.
2. `build()` does nothing at all when the visitor prefers reduced motion or the browser has no `IntersectionObserver`. The element stays exactly as your CSS draws it.
3. With `parallax` off, the element is a **reveal**:
   - If its top edge is above 92% of the window height, it is already on screen and is left alone.
   - Otherwise Reveal notes the element's own computed `opacity` and `transform` and its inline styles, then sets `opacity: 0` and moves it `distance` pixels in the direction of the `animation`, on top of any transform it already has. An `IntersectionObserver` watches it.
   - When `threshold` of it is visible, it fades back to its own opacity and transform and fires `ts.reveal.shown`. Elements that come into view together are numbered in page order for the `stagger`. The observer is disconnected, so it plays once.
   - When the fade is over, the element's inline styles are put back exactly as they were, so nothing Reveal set is left behind.
4. With `parallax` on, the element is a **parallax banner**. While any part of it is on screen, every scroll and resize (throttled to one update per frame) moves its background, or the `target` child, by `-top × speed` pixels.

Because the styles are only ever set from script, a page with JavaScript off, or where the script fails, shows every element normally.


## Quick Start

### 1. Include the script

```html
<script src="js/components/themestrap.plugin.reveal.js"></script>
```

It must load after jQuery and `themestrap.js`. `themestrap.bundle.js` already contains it.

### 2. Add the markup

```html
<div class="card" data-plugin-reveal>...</div>

<div class="card" data-plugin-reveal data-plugin-options='{"animation": "fadeInLeft", "delay": 150}'>...</div>

<section class="banner" data-plugin-reveal data-plugin-options='{"parallax": true, "speed": 0.3}'>...</section>
```

That's all. `themestrap.init.js` sets each `[data-plugin-reveal]` that isn't `.manual` up as it comes within 200px of the screen, which is early enough for the fade to play. An element the visitor jumps straight to (with a link to an anchor, say) simply appears. `themestrap.modules.js` defines it as the `reveal` module for pages that use the loader.

### Manual init

```js
$('.feature-card').themestrapPluginReveal({ animation: 'fadeInUp', stagger: 80 });
```

Unlike most plugins, Reveal also reads `data-plugin-options` when it is initialized from script. Options passed in the call win over the attribute.


## Markup Reference

| Attribute / class | On | Purpose |
| --- | --- | --- |
| `data-plugin-reveal` | any element | Marks it for auto init |
| `data-plugin-options='{"k": "v"}'` | the same element | Options as JSON in a single quoted attribute |
| `.manual` | the same element | Leaves it out of auto init |

Reveal adds no classes and no markup. It sets these inline styles:

| Mode | Inline styles |
| --- | --- |
| Reveal, waiting | `opacity: 0`, `transform: translate3d(...)` plus the element's own transform, `will-change: opacity, transform` |
| Reveal, fading | `opacity`, `transform` and a `transition`. All four are put back as they were when the fade ends |
| Parallax, background | `background-position: 50% calc(50% + Npx)` |
| Parallax, `target` | `transform: translate3d(0, Npx, 0)` on the target |


## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `animation` | string | `'fadeInUp'` | `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft` or `fadeInRight`, with the animate.css meanings: `fadeInUp` rises from below, `fadeInDown` drops from above, `fadeInLeft` slides in from the left and `fadeInRight` from the right. An unknown name fades without moving. |
| `distance` | number | `28` | Pixels the element travels while it fades. Ignored by `fadeIn`. |
| `duration` | number | `600` | Length of the fade, in milliseconds. The easing is always `ease`. |
| `delay` | number | `0` | Milliseconds to wait once the element is in view. |
| `stagger` | number | `0` | Extra milliseconds for each element that starts appearing with others. See [Stagger](#stagger). |
| `threshold` | number | `0.12` | How much of the element must be visible before it appears, from `0` to `1`. |
| `parallax` | boolean | `false` | Make this a parallax banner instead of a fade. |
| `speed` | number | `0.3` | Parallax strength, from `0` (moves with the page) to `1` (fixed in place). |
| `target` | string | `''` | Selector of a child to move instead of the background. Give it extra height in your CSS so its edges never show (see [Sizing parallax layers](#sizing-parallax-layers)). |

Merge order: `PluginReveal.defaults → data-plugin-options → opts`. Change the defaults for the whole page before anything is initialized:

```js
themestrap.PluginReveal.defaults.duration = 800;
themestrap.PluginReveal.defaults.distance = 40;
```

### Stagger

Elements that start appearing within 100ms of each other form a group. Reveal numbers the group in page order, from 0, and each element waits `delay + number × stagger` milliseconds. The next group starts again from 0.

So a row of four cards that scrolls into view waits 0, 1 × stagger, 2 × stagger and 3 × stagger, left to right, whatever else on the page appeared before them. An element scrolled into view on its own has number 0 and waits only `delay`.


## Public API

```js
const reveal = $('#promo').data('__pluginReveal');
```

| Method | Returns | Description |
|---|---|---|
| `show(wait)` | `this` | Plays the fade now, after `wait` milliseconds (default `0`), and fires `ts.reveal.shown`. The observer is disconnected, so it won't play again. On an element Reveal left alone (already on screen, reduced motion, or parallax) it only fires the event. |
| `destroy()` | `this` | Disconnects the observer, removes the parallax scroll and resize listeners, puts the element's inline styles back as they were before Reveal (and the target's `transform`), and drops the instance. A waiting element appears at once, without animation. |

The jQuery method also takes a method name, with any arguments after it. Names starting with `_` are private and can't be called this way:

```js
$('#promo').themestrapPluginReveal('show');
$('#promo').themestrapPluginReveal('destroy');
```

Without a method name it returns a jQuery collection of instances, so `.get(0)` on the result is the instance. Calling it again on an initialized element returns the existing instance and ignores the new options.


## Events

| Event | Dispatched on | `detail` | Fired when |
|---|---|---|---|
| `ts.reveal.shown` | the element | none | The fade starts. It fires when `show()` runs, before any `delay` or `stagger` wait and before the transition. |

It is a native `CustomEvent` that bubbles. Listen with `addEventListener`:

```js
document.addEventListener('ts.reveal.shown', function (e) {
    console.log(e.target, 'is appearing');
});
```

Parallax banners fire no events. Elements that Reveal left alone only fire it when `show()` is called on them.


## CSS Custom Properties

None. Reveal injects no stylesheet, so there is nothing to theme: every look comes from your own CSS, and Reveal only animates `opacity`, `transform` and `background-position`.

---

## Keyboard Navigation

Nothing to do. When someone tabs to a link or button inside a waiting element, the browser scrolls it into view, the observer sees it, and it appears.

---

## ARIA Wiring

Reveal adds no ARIA attributes. Waiting elements are only transparent: they stay in the accessibility tree, so screen readers read them in order, and their links and buttons can still be focused.

When the visitor asks their system for reduced motion, Reveal does nothing, so no element is ever hidden or moved. That is checked once, when each element is set up.

---

## Recipes

### A staggered row of cards

```html
<div class="row">
    <div class="col-md-4" data-plugin-reveal data-plugin-options='{"stagger": 90}'>...</div>
    <div class="col-md-4" data-plugin-reveal data-plugin-options='{"stagger": 90}'>...</div>
    <div class="col-md-4" data-plugin-reveal data-plugin-options='{"stagger": 90}'>...</div>
</div>
```

Or from script:

```js
$('.feature').themestrapPluginReveal({ animation: 'fadeInUp', stagger: 90 });
```

### A centered badge

Reveal keeps the element's own transform, so an element centered with `transform` slides in and stays centered:

```css
.badge-float { position: absolute; left: 50%; transform: translateX(-50%); }
```

```html
<span class="badge-float" data-plugin-reveal>New</span>
```

### A hero image that drifts

```html
<section class="hero" data-plugin-reveal data-plugin-options='{"parallax": true, "speed": 0.3, "target": ".hero-img"}'>
    <img class="hero-img" src="img/hero.jpg" alt="">
    <div class="hero-text">...</div>
</section>
```

```css
.hero      { position: relative; height: 60vh; overflow: hidden; }
.hero-img  { position: absolute; left: 0; top: 0; width: 100%; height: calc(100% + 30vh); object-fit: cover; }
.hero-text { position: relative; }
```

### A background picture that drifts

```html
<section class="band" style="background-image: url(img/texture.jpg);"
         data-plugin-reveal data-plugin-options='{"parallax": true, "speed": 0.3}'>...</section>
```

```css
.band { background-size: auto calc(100% + 60vh); background-repeat: no-repeat; }
```

The picture must also be wide enough to fill the band at that height. A repeating pattern never shows an edge, whatever its size.

### Sizing parallax layers

While a banner is on screen, the moving layer is only ever shifted upwards relative to it, by up to `speed × (window height − banner height)` when the banner sits at the bottom of the window. So:

- A **`target` child** pinned to the top of the banner (`top: 0`) needs that much extra height at the bottom. `height: calc(100% + 30vh)` covers any `speed` up to `0.3`, and `calc(100% + 50vh)` up to `0.5`.
- A **background** stays centered, so it needs the extra height twice, half above and half below: `background-size: auto calc(100% + 60vh)` covers `speed` up to `0.3`.

A banner taller than the window needs no extra height.

### A "skip animations" button

```js
$('#skip-animations').on('click', function () {
    $('[data-plugin-reveal]').each(function () {
        const reveal = $(this).data('__pluginReveal');
        if (reveal && this.style.opacity === '0') reveal.show();
    });
});
```

This only reaches elements that have been set up. `themestrap.init.js` sets elements up as they come near the screen, so for a page wide switch, set every element up at load instead: `$('[data-plugin-reveal]').themestrapPluginReveal();`.

### Print everything

Waiting elements are transparent, and the print preview doesn't scroll. Show them for print:

```css
@media print {
    [data-plugin-reveal] { opacity: 1 !important; transform: none !important; }
}
```

### Reveal, Animate or ScrollFx?

| Plugin | Use it for |
| --- | --- |
| **Reveal** | Simple fades and slides, and parallax banners, with no stylesheet and nothing to load |
| **Animate** | The full animate.css catalogue (bounces, zooms, flips...). Needs the animate.css stylesheet |
| **ScrollFx** | Effects tied to scroll position, which play backwards when you scroll back up |

---

## Common Pitfalls

**The element just appears, with no animation**
It was on screen when it was set up: its top edge was above 92% of the window height. That is on purpose, so the first screen of a page never flashes. It also happens for elements set up while hidden (`display: none` measures as being at the top of the window), and when the visitor prefers reduced motion.

**`$('#promo').on('ts.reveal.shown', ...)` never fires**
jQuery reads the dots as namespaces, so it listens for an event called `ts`. Use `addEventListener`.

**Cards in a row don't stagger**
A stagger only spaces out elements that start appearing within 100ms of each other. Cards on different rows, or a page scrolled slowly so they enter one by one, each start at 0. Check that the cards share the `stagger` value and come into view together.

**The parallax background shows an edge**
The background moves but doesn't grow. Use a repeating pattern, or make the picture taller than the element. See [Sizing parallax layers](#sizing-parallax-layers).

**The parallax background doesn't move**
Reveal sets `background-position` inline. Check that nothing else sets it inline afterwards (a `background` shorthand set from script does), and that reduced motion is off.

**The parallax child shows its edges**
The `target` needs extra height at the bottom, and the banner needs `overflow: hidden`. See [Sizing parallax layers](#sizing-parallax-layers).

**A CSS transition on the element plays during the fade**
While the fade runs, Reveal's own `transition` replaces yours. Yours is back as soon as the fade ends. If a hover effect must work during the first second, put it on an inner element.

**Content stays invisible**
An element that is never scrolled to (inside a container with its own scroll bar that the page never brings into view, say) never gets the observer's signal. Don't use Reveal inside scrolling panels, or call `show()` yourself.

### Diagnostic checklist

1. Is jQuery loaded, then `themestrap.js`, then the plugin (or `themestrap.bundle.js`)?
2. Is `themestrap.init.js` loaded, or is the element initialized from script? `.manual` elements must be started by hand.
3. Is the element below the first screen when it is set up? Elements already in view are left alone.
4. Is reduced motion turned on in the system settings? Then Reveal does nothing, by design.
5. Is `data-plugin-options` valid JSON inside a single quoted attribute?
6. Does the element have `opacity: 0` in its `style` attribute after it is set up? If not, it was in view, reduced motion is on, or `build()` never ran.
7. Are you listening with `addEventListener` rather than jQuery `.on()`?
8. Was the element already initialized? A second call returns the existing instance and ignores new options. Call `destroy()` first.
