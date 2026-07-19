# PluginChartCircular

**File:** `js/components/themestrap.plugin.chartcircular.js`  
**jQuery method:** `$.fn.themestrapPluginChartCircular`  
**Instance key:** `__chartCircular`  
**Init strategy:** `dynIntObsInit` via `themestrap.init.js` (animates in when entering the viewport)  
**Dependency:** [easyPieChart](https://rendro.github.io/easy-pie-chart/) (`$.fn.easyPieChart`)

## Overview

PluginChartCircular renders an animated circular progress/percentage chart using the easyPieChart library. The chart animates from 0% to its target value when it enters the viewport (via the Themestrap `dynIntObsInit` init strategy), supporting configurable colors, line width, size, cap style, and animation easing.

A `.percent` child element inside the container is updated with the current integer value on every animation frame.

## Markup

```html
<div class="chart-circular"
     data-plugin-chartcircular
     data-percent="85"
     data-plugin-options='{"barColor": "#e8672a", "lineWidth": 8, "size": 140}'>
  <span class="percent"></span>%
</div>
```

The `data-percent` attribute sets the target value (0–100). The plugin temporarily sets it to `0` on init and then calls `easyPieChart.update(value)` after `delay` ms to trigger the animation.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `barColor` | `string` | `'#0088CC'` | Color of the progress arc. Accepts any CSS color value or a function `(percent) => color`. |
| `trackColor` | `string` | `'#f2f2f2'` | Color of the background track arc. Set to `false` to hide. |
| `scaleColor` | `boolean\|string` | `false` | Color of scale lines. `false` disables them. |
| `scaleLength` | `number` | `5` | Length of scale lines in px. |
| `lineCap` | `string` | `'round'` | Canvas line cap: `'round'`, `'square'`, or `'butt'`. |
| `lineWidth` | `number` | `13` | Thickness of the progress arc in px. |
| `size` | `number` | `175` | Diameter of the chart canvas in px. |
| `rotate` | `number` | `0` | Rotation of the start angle in degrees. |
| `animate` | `object` | `{duration: 2500, enabled: true}` | Animation config. `duration` in ms; set `enabled: false` to disable. |
| `delay` | `number` | `1` | Milliseconds after init before the chart animates to its target value. Set higher to sync with other entrance animations. |
| `accY` | `number` | `-150` | IntersectionObserver vertical accumulation offset (used by `dynIntObsInit`). |

## The `.percent` Element

Place a `.percent` element anywhere inside the container. The plugin's `onStep` callback populates it with `parseInt(currentValue)` on every animation frame:

```html
<div data-plugin-chartcircular data-percent="72"
     data-plugin-options='{"size": 160}'>
  <span class="percent"></span>
  <span class="percent-label">%</span>
</div>
```

> [!TIP]  
> Style `.percent` freely — it is not modified beyond its text content.

## Multiple Charts

Each chart element is a separate independent instance. They can have different colors, sizes, and values:

```html
<div class="row g-4 text-center">
  <div class="col-4">
    <div data-plugin-chartcircular data-percent="90"
         data-plugin-options='{"barColor":"#2ab8c8","size":120,"lineWidth":8}'>
      <span class="percent"></span>%
    </div>
    <p class="mt-2">CSS</p>
  </div>
  <div class="col-4">
    <div data-plugin-chartcircular data-percent="75"
         data-plugin-options='{"barColor":"#e8672a","size":120,"lineWidth":8}'>
      <span class="percent"></span>%
    </div>
    <p class="mt-2">JavaScript</p>
  </div>
</div>
```

## Dynamic Bar Color

Pass a function string through `data-plugin-options` is not possible for functions; use the jQuery API when you need a dynamic color:

```js
$('.chart-skill').themestrapPluginChartCircular({
    barColor(percent) {
        if (percent < 33)  return '#ef4444';
        if (percent < 66)  return '#f59e0b';
        return '#22c55e';
    },
    lineWidth: 10,
    size:      150
});
```

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginChartCircular']) && $('[data-plugin-chartcircular]').length) {
    themestrap.fn.dynIntObsInit(
        '[data-plugin-chartcircular]:not(.manual)',
        'themestrapPluginChartCircular',
        themestrap.PluginChartCircular.defaults
    );
}
```

> [!NOTE]  
> `$.fn.easyPieChart` must be loaded before this plugin. The plugin silently exits if the dependency is absent.