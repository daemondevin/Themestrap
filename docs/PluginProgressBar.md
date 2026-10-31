# PluginProgressBar

Animated progress bars that fill when they scroll into view. Nine color variants, stripes, animated stripes, an indeterminate loading state, five heights and an optional counting label. The plugin builds its own markup and styles, so no Bootstrap progress CSS is needed.

**File:** `js/components/themestrap.plugin.progressbar.js`  
**Demo:** `demos/plugin.demo.progressbar.html`  
**jQuery method:** `$.fn.themestrapPluginProgressBar`  
**Data attribute:** `data-plugin-progress-bar`  
**Instance key:** `__pluginProgressBar`  
**Init strategy:** `dynIntObsInit`, which honors `forceInit` and `accY`



## How It Works

The element you mark up is only a host. On `build()` the plugin:

1. Injects its stylesheet once (`<style id="ts-progress-bar-styles">`).
2. Saves the host's original HTML and classes, so `destroy()` can put them back.
3. Adds `.ts-progress` (plus size and shape classes) and the progressbar ARIA attributes to the host.
4. Replaces the host's content with a track and a fill:

```html
<div class="ts-progress ts-progress--lg" role="progressbar"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="75">
    <div class="ts-progress-track">
        <div class="ts-progress-fill ts-progress-fill--success"
             style="width: 75%; transition: width 1200ms cubic-bezier(0.4, 0, 0.2, 1);">
            <span class="ts-progress-label">75%</span>
        </div>
    </div>
</div>
```

The fill starts at 0. Two animation frames later the plugin sets its width to the target, so the browser has painted the empty bar first and the CSS transition always runs. A label, when enabled, counts up alongside the fill with its own ease-in-out curve.

Through `themestrap.init.js` nothing happens until the bar approaches the viewport: `dynIntObsInit` waits for an IntersectionObserver hit (200 px before it enters, or `accY` px), then initializes. `forceInit: true` skips the wait.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.progressbar.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<div data-plugin-progress-bar data-plugin-options='{"value": 75}'></div>
```

`themestrap.init.js` already wires the plugin:

```js
themestrap.fn.dynIntObsInit(
    '[data-plugin-progress-bar]:not(.manual), [data-appear-progress-animation]',
    'themestrapPluginProgressBar',
    themestrap.PluginProgressBar.defaults
);
```

### Manual init

```html
<div id="upload" class="manual" data-plugin-progress-bar></div>
```

```js
$('#upload').themestrapPluginProgressBar({ value: 0, label: true, size: 'lg', color: 'info' });
const bar = $('#upload').data('__pluginProgressBar');
```



## Markup Reference

Everything is set through options; the host can be any empty block element.

```html
<!-- 60%, green, striped -->
<div data-plugin-progress-bar data-plugin-options='{"value": 60, "color": "success", "striped": true}'></div>

<!-- moving stripes (implies striped) -->
<div data-plugin-progress-bar data-plugin-options='{"value": 80, "color": "warning", "animated": true}'></div>

<!-- tall bar with a label -->
<div data-plugin-progress-bar data-plugin-options='{"value": 45, "label": true, "size": "lg"}'></div>

<!-- a label that is not a percentage -->
<div data-plugin-progress-bar data-plugin-options='{"value": 30, "label": true, "size": "lg", "labelFormat": "Step {value} of 100"}'></div>

<!-- loading, no value -->
<div data-plugin-progress-bar data-plugin-options='{"indeterminate": true, "color": "info"}'></div>

<!-- square corners, filled on DOMReady -->
<div data-plugin-progress-bar data-plugin-options='{"value": 90, "rounded": false, "forceInit": true}'></div>
```

### Classes the plugin adds

| Element | Class | When |
| - | - | - |
| Host | `.ts-progress` | Always |
| Host | `.ts-progress--xs` `--sm` `--md` `--lg` | `size` is set |
| Host | `.ts-progress--square` | `rounded: false` |
| Fill | `.ts-progress-fill--{color}` | `color` is set |
| Fill | `.ts-progress-fill--striped` | `striped` or `animated` |
| Fill | `.ts-progress-fill--animated` | `animated` and not indeterminate |
| Fill | `.ts-progress-fill--indeterminate` | `indeterminate` |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `value` | `number` | `0` | Fill percentage, clamped to 0–100. |
| `color` | `string` | `'primary'` | `primary`, `secondary`, `tertiary`, `quaternary`, `success`, `warning`, `danger`, `info` or `dark`. |
| `striped` | `boolean` | `false` | Diagonal stripes on the fill. |
| `animated` | `boolean` | `false` | Moving stripes. Turns `striped` on. |
| `indeterminate` | `boolean` | `false` | An endless sweep for work of unknown length. `value`, `label` and `set()` are ignored. |
| `label` | `boolean` | `false` | Show the value inside the fill. Needs `size: 'lg'` to be readable (see Pitfalls). |
| `labelFormat` | `string` | `'{value}%'` | Label text. `{value}` becomes the rounded number. |
| `duration` | `number` | `1200` | Fill transition in ms, also used by the label count. |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing for the fill. |
| `size` | `string` | `''` | Height: `''` or `md` 8 px, `xs` 3 px, `sm` 5 px, `lg` 16 px. |
| `rounded` | `boolean` | `true` | Pill ends. `false` gives square corners. |
| `forceInit` | `boolean` | `false` | With `dynIntObsInit`: initialize at once instead of on scroll. |
| `accY` | `number` | `0` | With `dynIntObsInit`: bottom root margin in px for the observer. `0` means the default 200 px. |



## Public API

Read the instance from a fresh selection, never off the init call.

| Method | Returns | Description |
| - | - | - |
| `set(value)` | `this` | Animates to a new value (clamped to 0–100), updates `aria-valuenow`, counts the label, and fires `progressbar:change` (plus `progressbar:complete` at 100). Does nothing on an indeterminate bar. |
| `get()` | `number` | The current target value. |
| `reset()` | `this` | `set(0)`. |
| `destroy()` | `this` | Stops the label animation, restores the host's original HTML and classes, and removes the ARIA attributes and the instance. |

The bridge accepts string commands with one argument:

```js
$('#upload').themestrapPluginProgressBar('set', 64);
$('#upload').themestrapPluginProgressBar('reset');

/* the same, on the instance */
const bar = $('#upload').data('__pluginProgressBar');
bar.set(64);
bar.get();   // 64
```

A string command returns the method's result, so `('get')` gives you a jQuery object holding the number: `$('#upload').themestrapPluginProgressBar('get')[0]`.



## Events

Both are native `CustomEvent`s dispatched on the host with `bubbles: true`, so `addEventListener` and jQuery `.on()` both work. With jQuery, read the payload from `e.originalEvent.detail`.

| Event | When | `detail` |
| - | - | - |
| `progressbar:change` | On every `set()` and `reset()` | `{ value, previous }` |
| `progressbar:complete` | When a `set()` reaches 100, and at init when `value` is 100 | `{ value }` |

```js
document.getElementById('upload').addEventListener('progressbar:complete', function () {
    showToast('Upload finished');
});

$(document).on('progressbar:change', '[data-plugin-progress-bar]', function (e) {
    console.log(this.id, e.originalEvent.detail.value);
});
```

`progressbar:change` is not fired for the initial fill at build time.



## CSS Custom Properties

The bar uses the Themestrap palette variables, with fallbacks for pages that do not load `themestrap.css`:

| Variable | Fallback | Used by |
| - | - | - |
| `--primary` | `#0088CC` | Default fill, `primary` |
| `--secondary` | `#e36159` | `secondary` |
| `--tertiary` | `#2BAAB1` | `tertiary` |
| `--quaternary` | `#383f48` | `quaternary` |
| `--success` | `#87bb53` | `success` |
| `--warning` | `#f4bf75` | `warning` |
| `--danger` | `#ff6159` | `danger` |
| `--info` | `#61a6d6` | `info` |
| `--dark` | `#212529` | `dark` |
| `--dark-rgba-10` | `rgba(33, 37, 41, 0.1)` | The track |
| `--light-rgba-90` | `rgba(255, 255, 255, 0.9)` | The label |

There are no `--ts-*` tokens yet. Style the generated classes directly:

```css
/* a brand color: pass color: 'brand' */
.ts-progress-fill--brand { background: #20e2d7; }

/* a lighter track on dark backgrounds */
html.dark .ts-progress-track,
[data-bs-theme="dark"] .ts-progress-track { background: rgba(255, 255, 255, .12); }

/* a 12px height */
.ts-progress--chunky { height: 12px; }
```

Any string works as `color` or `size`: the plugin adds `ts-progress-fill--{color}` or `ts-progress--{size}` and leaves the CSS to you.

### Reduced motion

Under `prefers-reduced-motion: reduce` the fill jumps straight to its value and the stripe and indeterminate animations stop.



## Keyboard Navigation

A progress bar is not interactive and takes no focus.



## ARIA Wiring

```
[host]
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="{value}"     updated by set()
    aria-busy="true"            indeterminate only
```

Give each bar an accessible name, or a screen reader announces only a number:

```html
<span id="cpu-label">CPU</span>
<div data-plugin-progress-bar aria-labelledby="cpu-label"
     data-plugin-options='{"value": 42}'></div>
```

The plugin keeps attributes it does not set, and `destroy()` leaves `aria-labelledby` alone.



## Recipes

### Upload progress

```js
const bar = $('#upload').data('__pluginProgressBar');
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', function (e) {
    if (e.lengthComputable) { bar.set(e.loaded / e.total * 100); }
});
```

Keep `duration` short (around 200 ms) for bars that update often, so the fill keeps up.

### Switch from loading to a known value

An indeterminate bar cannot be `set()`. Rebuild it once the size is known:

```js
const $bar = $('#import');
$bar.data('__pluginProgressBar').destroy();
$bar.themestrapPluginProgressBar({ value: 0, label: true, size: 'lg' });
```

### Skill bars that fill one after another

```html
<div data-plugin-progress-bar data-plugin-options='{"value": 90, "duration": 900}'></div>
<div data-plugin-progress-bar data-plugin-options='{"value": 75, "duration": 1300}'></div>
<div data-plugin-progress-bar data-plugin-options='{"value": 60, "duration": 1700}'></div>
```



## Common Pitfalls

### Old Bootstrap markup is wiped out

Earlier versions animated an existing `.progress > .progress-bar[data-value]`. The current plugin replaces the host's content with its own track and fill, so a `.progress-bar` child disappears and `data-value` is ignored. Move the value into `data-plugin-options='{"value": …}'`. Note that `themestrap.init.js` still includes the old `[data-appear-progress-animation]` selector, so those elements are rebuilt too.

### The bar fills before anyone sees it

With manual init the fill starts at once. Use `themestrap.init.js` (or `dynIntObsInit` yourself) for scroll-triggered fills.

### The label is clipped or missing

The label is 10 px text inside the fill. It is hidden on `xs` and `sm` bars, and crowded on the default 8 px height. Use `size: 'lg'`. It also sits inside the fill, so at very low values there is no room for it.

### `set()` does nothing

Indeterminate bars ignore `set()`. Values outside 0–100 are clamped, and anything that is not a number becomes 0.

### The instance is `undefined`

The key is `__pluginProgressBar`. Older notes used `__progressBar`.

### Diagnostic checklist

- [ ] The host is an empty block element with `data-plugin-progress-bar`.
- [ ] The value is in `data-plugin-options`, not `data-value`.
- [ ] `themestrap.js` loads before the plugin, and `themestrap.init.js` after it.
- [ ] Labels are used with `size: 'lg'`.
- [ ] Each bar has an accessible name.
- [ ] jQuery handlers read `e.originalEvent.detail`.
