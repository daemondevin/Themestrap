# PluginParticles

A canvas particle background for heroes, sections and cards: drifting dots that twinkle, link up into a network, react to the pointer, and scatter or multiply on click. It replaces particles.js with one dependency-free plugin that follows the Themestrap pattern.

| Feature | Notes |
| - | - |
| Field size | By `density` (per 800 by 800 px, so it scales with the host) or a fixed `count` |
| Look | One color or a random pick from several, circles or squares, random size and opacity, twinkle |
| Motion | Random drift or a steady `direction`, wrap around the edges or bounce off them |
| Network | `links` joins particles that come close |
| Pointer | `bubble`, `grab` or `repulse` on hover, `repulse` or `push` on click |
| Performance | Pauses off screen and in hidden tabs, high-DPI canvas, resizes with its host |
| Accessibility | `aria-hidden`, never takes pointer events, holds still for `prefers-reduced-motion` |

## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance.
2. **`setData`** stores the instance on the host as `__pluginParticles`.
3. **`setOptions`** merges the defaults (or the current options, on later calls) with yours and parses the colors once.
4. **`build`** injects the stylesheet once, makes the host fill its nearest positioned ancestor (`fill`), adds a `<canvas>`, sizes it for the screen's pixel ratio, creates the particles, draws the first frame and starts the animation.
5. **`events`** watches the host's size (`ResizeObserver`), its visibility (`IntersectionObserver`) and the tab's visibility, and reads the pointer from the window.
6. **`destroy`** stops the loop, disconnects the observers, removes the canvas and the classes, and removes the stylesheet when the last instance goes.

### The pointer

The canvas has `pointer-events: none`, so links and buttons above it keep working. Pointer position is read from `window` and mapped into the canvas, and only counts while it is inside the host.

### Stylesheet injection

`<style id="ts-particles-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

## Quick Start

```html
<script src="js/components/themestrap.plugin.particles.js"></script>

<section class="hero" style="position: relative">
    <div data-plugin-particles
         data-plugin-options='{"density": 160, "color": "#0088cc"}'></div>
    <h1 style="position: relative">Welcome</h1>
</section>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// Particles
if (typeof $.fn['themestrapPluginParticles'] === 'function' && $('[data-plugin-particles]').length) {
    themestrap.fn.intObsInit('[data-plugin-particles]:not(.manual)', 'themestrapPluginParticles');
}
```

Zero-vendor plugins are wired in `themestrap.init.js`, not `themestrap.modules.js`.

### Manual init

```js
$('#hero-particles').themestrapPluginParticles({ color: ['#e8672a', '#2ab8c8'], links: { enable: true } });
```

## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-particles` | Any empty element | Init hook. Becomes the canvas container |
| `data-plugin-options` | Host | JSON options |
| `.manual` | Host | Excludes the element from auto-init |

With `fill: true` (the default) the host is placed `position: absolute; inset: 0` inside its parent. A parent with `position: static` gets the `ts-particles-host` class (`position: relative`) so the field stays inside it. Give content that should sit above the field `position: relative` (or a `z-index` above `--ts-particles-z`).

### Migrating from particles.js

| particles.js | PluginParticles |
| - | - |
| `particles.number.value` with `density.enable` | `density` |
| `particles.number.value` without density | `count` |
| `particles.color.value` | `color` |
| `particles.shape.type` | `shape` (`circle` or `square`) |
| `particles.opacity.value` / `random` | `opacity` / `opacityRandom` |
| `particles.opacity.anim` | `twinkle` |
| `particles.size.value` / `random` | `size` / `sizeRandom` |
| `particles.line_linked` | `links` |
| `particles.move.speed` / `direction` / `random` / `out_mode` | `speed` / `direction` / `speedRandom` / `outMode` |
| `interactivity.events.onhover.mode` with `modes.bubble` / `grab` / `repulse` | `hover.mode`, `hover.distance`, `hover.size`, `hover.opacity` |
| `interactivity.events.onclick.mode` with `modes.repulse` / `push` | `click.mode`, `click.distance`, `click.count` |
| `particlesJS('id', config)` | `$('#id').themestrapPluginParticles(options)` or `data-plugin-particles` |

## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `density` | `number` | `80` | Particles per 800 by 800 px of host |
| `count` | `number` | `null` | Fixed number of particles. Overrides `density` |
| `maxParticles` | `number` | `400` | Upper bound for density and for particles added by `push` or `burst()` |
| `color` | `string \| array` | `'#0088cc'` | Any CSS color, or several picked at random |
| `shape` | `string` | `'circle'` | `'circle'` or `'square'` |
| `size` | `number` | `3` | Largest radius in px |
| `sizeRandom` | `boolean` | `true` | Radius between 15% and 100% of `size` |
| `opacity` | `number` | `0.8` | Largest opacity |
| `opacityRandom` | `boolean` | `true` | Opacity between 15% and 100% of `opacity` |
| `twinkle` | `object` | `{ enable: true, speed: 1, min: 0 }` | Fade particles in and out |
| `speed` | `number` | `0.6` | px per frame at 60 fps |
| `speedRandom` | `boolean` | `true` | Vary speed (and wobble a fixed direction) |
| `direction` | `string` | `'none'` | `'none'`, or `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `top-left` |
| `outMode` | `string` | `'out'` | `'out'` wraps around the edges, `'bounce'` bounces off them |
| `links` | `object` | `{ enable: false, distance: 130, color: null, opacity: 0.4, width: 1 }` | Lines between close particles. `color` defaults to the first particle color |
| `hover` | `object` | `{ mode: 'bubble', distance: 150, size: 0, opacity: 0, strength: 0.6 }` | `mode`: `'bubble'`, `'grab'`, `'repulse'` or `null` |
| `click` | `object` | `{ mode: 'repulse', distance: 220, strength: 9, count: 4 }` | `mode`: `'repulse'`, `'push'` or `null` |
| `fill` | `boolean` | `true` | Cover the nearest positioned ancestor |

`bubble` changes radius and opacity toward `hover.size` and `hover.opacity` near the pointer: the defaults (`0`, `0`) make particles fade away under it, larger values make them swell. `grab` draws lines from the pointer to particles within `hover.distance` (link color and opacity come from `links`).

## Public API

```js
const fx = $('#hero-particles').data('__pluginParticles');
```

| Method | Returns | Description |
| - | - | - |
| `pause()`, `play()` | `this` | Stop or resume the animation. `play()` still waits for the host to be visible |
| `isPlaying()` | `boolean` | The animation loop is running |
| `burst(x, y, count)` | `this` | Add particles at a point inside the host (px from its top left) |
| `setOptions(opts)` | `this` | Merge new options. Follow with `refresh()` to rebuild the field |
| `refresh()` | `this` | Resize the canvas and recreate the particles |
| `destroy()` | `this` | Remove the canvas and listeners |

The jQuery bridge also accepts a method name: `$('#hero-particles').themestrapPluginParticles('pause')`.

## Events

Native events, bubbling, dispatched on the host.

| Event | When | `detail` |
| - | - | - |
| `ts.particles.ready` | The first frame is drawn | `{ instance, count }` |

> Use `addEventListener`. jQuery reads the dots as namespaces, so `$el.on('ts.particles.ready', …)` never fires.

## CSS Custom Properties

| Property | Default | Used for |
| - | - | - |
| `--ts-particles-z` | `0` | `z-index` of the filled host |

Colors are options rather than tokens because the canvas draws them. To follow the page theme, set `color` from your own theme variables before init, or call `setOptions({ color }).refresh()` when the theme changes.

## Keyboard Navigation

None. The field is decorative and never takes focus.

## ARIA Wiring

- The host gets `aria-hidden="true"`; the field carries no content.
- `pointer-events: none` keeps everything above it usable with mouse and touch.
- With `prefers-reduced-motion: reduce` the field is drawn once and does not animate. Click repulse still nudges particles in a single redraw.

## Recipes

#### Hero background with content above

```html
<header class="hero position-relative overflow-hidden">
    <div data-plugin-particles data-plugin-options='{"density": 120}'></div>
    <div class="position-relative">…headline and buttons…</div>
</header>
```

#### Follow a dark mode toggle

```js
const fx = $('#bg').data('__pluginParticles');
$('#theme-toggle').themestrapPluginDarkMode({
    onChange: function (theme) {
        fx.setOptions({ color: theme === 'dark' ? '#2ab8c8' : '#0088cc' }).refresh();
    }
});
```

#### Celebrate

```js
const el = document.getElementById('bg');
$(el).data('__pluginParticles').burst(el.clientWidth / 2, el.clientHeight / 2, 40);
```

## Common Pitfalls

**The field covers the page.** The host fills its nearest positioned ancestor. Put it inside the section it belongs to; a static parent is made relative automatically.

**Content is hidden behind the field.** Give that content `position: relative` (or a `z-index` above `--ts-particles-z`).

**Nothing moves.** The host is off screen, the tab is hidden, `pause()` was called, or the visitor prefers reduced motion. `isPlaying()` tells you which state you are in.

**The field is empty.** The host has no height. With `fill: false`, give it an explicit height.

### Diagnostic checklist

1. `document.getElementById('ts-particles-styles')` exists after init.
2. The host contains a `<canvas>` whose size matches the host.
3. `$(host).data('__pluginParticles')._parts.length` is above zero.
4. The parent of a filled host is positioned (`ts-particles-host` or your own rule).
