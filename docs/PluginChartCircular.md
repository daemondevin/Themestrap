# PluginChartCircular

An animated ring chart for a single percentage, drawn on a HiDPI-aware `<canvas>`. The ring fills from 0 to its value when it scrolls into view, with an optional track, tick marks and a counting number in the middle. No vendor library is needed.

**File:** `js/components/themestrap.plugin.chartcircular.js`  
**Demo:** `demos/plugin.demo.chartcircular.html`  
**jQuery method:** `$.fn.themestrapPluginChartCircular`  
**Data attribute:** `data-plugin-chart-circular`, or the `.circular-bar-chart` class  
**Instance key:** `__chartCircular`  
**Init strategy:** `dynIntObsInit` via `themestrap.init.js`

> Earlier versions wrapped easyPieChart. The chart is now drawn by the plugin itself, so the easyPieChart vendor file is no longer needed and `themestrap.modules.js` no longer loads it. A function for `barColor` and the `accY` default are gone with it; see Pitfalls.



## How It Works

On `build()` the plugin:

1. Reads the target from `data-percent` (0–100).
2. Creates a `<canvas>` of `size` × `size` CSS pixels, scaled by `devicePixelRatio` so the ring is sharp on high-density screens, and **prepends** it to the element. Your existing children (such as the number) stay after it.
3. Draws the empty state: the track, and the tick marks if `scaleColor` is set.
4. After `delay` ms, animates the arc from 0 to the target over `animate.duration` ms with an ease-out curve, writing the rounded current value into any `.percent` element inside on every frame.

The arc starts at 12 o'clock (shifted by `rotate` degrees) and runs clockwise. It is inset by half the line width, so it never clips at the canvas edge.

Through `themestrap.init.js` nothing happens until the element approaches the viewport: `dynIntObsInit` initializes it on an IntersectionObserver hit, 200 px before it enters by default.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.chartcircular.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<div class="chart-ring" data-plugin-chart-circular data-percent="85"
     data-plugin-options='{"barColor": "#e8672a", "lineWidth": 8, "size": 140}'>
    <span class="chart-ring__value"><span class="percent"></span>%</span>
</div>
```

```css
.chart-ring { position: relative; width: 140px; height: 140px; }
.chart-ring__value {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    font: 600 1.5rem/1 'JetBrains Mono', monospace;
}
```

The plugin only draws the ring. Centering the number over it is up to your CSS, as above.

`themestrap.init.js` already wires it:

```js
themestrap.fn.dynIntObsInit(
    '[data-plugin-chart-circular]:not(.manual), .circular-bar-chart:not(.manual)',
    'themestrapPluginChartCircular',
    themestrap.PluginChartCircular.defaults
);
```

### Manual init

```js
$('#uptime').themestrapPluginChartCircular({ size: 120, lineWidth: 10, barColor: '#2ab8c8' });
```

Manual init starts the animation straight away (after `delay`), wherever the element is.



## Markup Reference

| Attribute or class | Role |
| - | - |
| `data-plugin-chart-circular` or `.circular-bar-chart` | Marks the element for `themestrap.init.js`. |
| `data-percent` | The value, 0–100. Read once at init. |
| `data-plugin-options` | JSON options. |
| `.percent` | Any element inside; receives the counting number as text. |
| `class="manual"` | Keeps auto-init away. |

### Generated markup

```html
<div class="chart-ring" data-plugin-chart-circular data-percent="85">
    <canvas width="280" height="280" style="width: 140px; height: 140px; display: block;"></canvas>
    <span class="chart-ring__value"><span class="percent">85</span>%</span>
</div>
```



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `barColor` | `string` | `'#0088CC'` | Arc color, any CSS color. Must be a string (see Pitfalls). |
| `trackColor` | `string\|false` | `'#f2f2f2'` | Full-circle track behind the arc. `false` hides it. |
| `scaleColor` | `string\|false` | `false` | Color of 24 tick marks around the outside of the ring. `false` hides them. |
| `scaleLength` | `number` | `5` | Tick length in px. |
| `lineCap` | `string` | `'round'` | End of the arc: `round`, `square` or `butt`. The track is always `butt`. |
| `lineWidth` | `number` | `13` | Ring thickness in px. |
| `size` | `number` | `175` | Canvas width and height in CSS px. |
| `rotate` | `number` | `0` | Rotates the starting point clockwise, in degrees. `0` is 12 o'clock. |
| `animate` | `object` | `{ duration: 2500, enabled: true }` | `duration` in ms; `enabled: false` draws the final value at once. |
| `delay` | `number` | `1` | Wait in ms after init before animating. |

Ticks are drawn just outside the ring, so with `scaleColor` set, keep `size` large enough or reduce `lineWidth`: the ticks extend `scaleLength + 2` px beyond the arc and are clipped at the canvas edge otherwise.



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only.

| Method | Returns | Description |
| - | - | - |
| `destroy()` | `this` | Cancels the pending animation, restores the element's original HTML (removing the canvas) and removes the instance. |

To change the value, destroy, update `data-percent`, and initialize again:

```js
const $chart = $('#uptime');
$chart.data('__chartCircular').destroy();
$chart.attr('data-percent', 97).themestrapPluginChartCircular({ delay: 0 });
```



## Events

None.



## CSS Custom Properties

None; colors and sizes are options, drawn into the canvas. CSS can still size the element, place the number, and style `.percent`.

### Dark mode

The default `trackColor` (`#f2f2f2`) is nearly invisible against light pages and very bright on dark ones. Pick it per theme:

```js
const dark = document.documentElement.classList.contains('dark');
$('#uptime').themestrapPluginChartCircular({ trackColor: dark ? 'rgba(255,255,255,.12)' : '#eef1f4' });
```

### Reduced motion

```js
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$.extend(true, themestrap.PluginChartCircular.defaults, { animate: { enabled: !still } });
```

Run it before `themestrap.init.js`.



## Keyboard Navigation

The chart is not interactive and takes no focus.



## ARIA Wiring

The plugin adds no ARIA, and a canvas is invisible to screen readers. Describe the value on the element:

```html
<div data-plugin-chart-circular data-percent="85" role="img" aria-label="Uptime 85%"> … </div>
```

The counting `.percent` text is read too unless hidden; with `role="img"` and an `aria-label`, add `aria-hidden="true"` to the visible number so it is not announced twice.



## Recipes

### A row of skill rings

```html
<div class="d-flex gap-4 text-center">
    <figure class="chart-ring" data-plugin-chart-circular data-percent="90"
            data-plugin-options='{"barColor": "#2ab8c8", "size": 120, "lineWidth": 8}'
            role="img" aria-label="CSS 90%">
        <span class="chart-ring__value" aria-hidden="true"><span class="percent"></span>%</span>
    </figure>
    <figure class="chart-ring" data-plugin-chart-circular data-percent="75"
            data-plugin-options='{"barColor": "#e8672a", "size": 120, "lineWidth": 8, "delay": 300}'
            role="img" aria-label="JavaScript 75%">
        <span class="chart-ring__value" aria-hidden="true"><span class="percent"></span>%</span>
    </figure>
</div>
```

Staggering `delay` makes the rings fill one after another.

### Color by value

`barColor` must be a string, so choose it before init:

```js
$('.chart-skill').each(function () {
    const pct = parseFloat($(this).attr('data-percent')) || 0;
    const color = pct < 33 ? '#ef4444' : pct < 66 ? '#f59e0b' : '#22c55e';
    $(this).themestrapPluginChartCircular({ barColor: color, size: 150, lineWidth: 10 });
});
```

### A gauge from 7 o'clock

```js
$('#gauge').themestrapPluginChartCircular({ rotate: 210, lineCap: 'butt' });
```



## Common Pitfalls

### Nothing renders

`themestrap.init.js` looks for `data-plugin-chart-circular` (with hyphens) or `.circular-bar-chart`. The old `data-plugin-chartcircular` spelling is not matched.

### `barColor` as a function breaks the arc

The canvas stroke takes a string. A function, which easyPieChart allowed, produces no arc. Work out the color before init (see Recipes).

### The number sits under or beside the ring

The canvas is placed first and the plugin does not position anything else. Give the element `position: relative` and the number `position: absolute; inset: 0` with centering, as in Quick Start.

### The ring animates before anyone sees it

Manual init animates at once. Use `themestrap.init.js` (or `dynIntObsInit` yourself) to wait for the viewport. The observer's default 200 px margin also starts the animation a little before the ring is visible; to wait longer, pass a negative `accY` in `data-plugin-options` (for example `-100`), which `dynIntObsInit` uses as the bottom root margin.

### Changing `data-percent` does nothing

The value is read once at init. Destroy and initialize again (see Public API).

### Diagnostic checklist

- [ ] The element has `data-plugin-chart-circular` or `.circular-bar-chart`.
- [ ] `data-percent` holds a number from 0 to 100.
- [ ] `barColor` is a string.
- [ ] The element has `position: relative` if the number is overlaid.
- [ ] The chart has `role="img"` and an `aria-label`.
