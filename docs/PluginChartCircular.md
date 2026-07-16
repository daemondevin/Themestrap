# ChartCircular Guide

Themestrap's circular progress chart plugin — wraps easyPieChart to animate a pie/progress ring from 0 to a target percentage when scrolled into view.

## [How It **Works**](#how-it-works)

PluginChartCircular reads the target value from `data-percent`, registers the element with an IntersectionObserver, and calls `easyPieChart` on viewport entry. The number inside the chart element is animated in sync with the ring via easyPieChart's `onStep` callback.

---

## [Quick **Start**](#quick-start)

```html
<div class="chart"
     data-plugin-chart-circular
     data-plugin-options='{"barColor": "#e8672a", "lineWidth": 13, "size": 175}'
     data-percent="75">
  <span class="percent">0</span>%
</div>
```

### Init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginChartCircular'])
    && $('[data-plugin-chart-circular]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-chart-circular]:not(.manual)',
    'themestrapPluginChartCircular'
  );
}
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | number | `1` | Delay in ms before starting the animation. |
| `barColor` | string | `'#0088CC'` | Progress arc color. |
| `trackColor` | string | `'#f2f2f2'` | Background track color. |
| `scaleColor` | bool/string | `false` | Scale line color (`false` = hidden). |
| `lineCap` | string | `'round'` | End cap: `'round'` or `'butt'`. |
| `lineWidth` | number | `13` | Arc stroke width in px. |
| `size` | number | `175` | Chart diameter in px. |
| `rotate` | number | `0` | Starting rotation in degrees. |
| `animate` | object | `{duration: 2500, enabled: true}` | Animation settings. |
| `accX` | number | `0` | IntersectionObserver X offset. |
| `accY` | number | `-150` | IntersectionObserver Y offset. |

---

## [Common **Pitfalls**](#pitfalls)

**easyPieChart must be loaded.** This plugin requires `jquery.easypiechart.js`. If it is absent, no chart is rendered and no error is thrown.

**`data-percent` drives the target.** The value on the `<span class="percent">` is animated; the data attribute on the container sets the arc target. Make sure both are present.
