# Counter Guide

Themestrap's viewport-triggered number animation — counts from 0 to a target value with easing when the element scrolls into view.

## [How It **Works**](#how-it-works)

PluginCounter reads the target number from the element's text content (or from `data-to`), registers the element with `themestrap.fn.intObsInit`, and fires a linear tick animation from `0` to the target over a configurable duration when the IntersectionObserver triggers. Each tick calls the optional `onUpdate` callback and formats the value with optional decimals and comma separators.

### Viewport entry

The IntersectionObserver fires when the element crosses the `accY` threshold from the bottom of the viewport (default: no offset). The animation starts immediately on first entry and does not repeat on subsequent re-entries.

---

## [Quick **Start**](#quick-start)

```html
<!-- Value from text content -->
<span data-plugin-counter
      data-plugin-options='{"speed": 2500, "decimals": 0}'>
  1500
</span>

<!-- Value from data attribute -->
<span data-plugin-counter
      data-to="99.9"
      data-plugin-options='{"decimals": 1, "comma": true}'>
  0
</span>
```

### Append/prepend mode

The plugin can write the animated number into a generated `<span>` adjacent to the element rather than replacing its text content, preserving any surrounding markup (currency symbols, suffixes):

```html
<p>
  <span data-plugin-counter
        data-plugin-options='{"prependWrapper": true}'>4000</span>+
</p>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accX` | number | `0` | IntersectionObserver X offset in px. |
| `accY` | number | `0` | IntersectionObserver Y offset in px (negative = trigger earlier). |
| `appendWrapper` | bool | `false` | Write the animated value into a `<span>` appended after the element. |
| `prependWrapper` | bool | `false` | Write the animated value into a `<span>` prepended before the element. |
| `speed` | number | `3000` | Total animation duration in ms. |
| `refreshInterval` | number | `100` | Tick interval in ms (lower = smoother, more CPU). |
| `decimals` | number | `0` | Number of decimal places to display. |
| `comma` | bool | `false` | Format the value with comma thousands separator. |
| `onUpdate` | function | `null` | Called on every tick: `fn(currentValue)`. |
| `onComplete` | function | `null` | Called when the animation reaches the target value. |

---

## [Instance **API**](#instance-api)

```js
const counter = $('[data-plugin-counter]').data('__counter');

counter.start();    // manually start the animation
counter.stop();     // pause at the current value
counter.reset();    // return to 0 and stop
counter.destroy();  // teardown, restore original text
```

---

## [Recipe **Cookbook**](#recipes)

#### Stats bar

```html
<div class="stats-row">
  <div class="stat">
    <h3><span data-plugin-counter
              data-plugin-options='{"speed":2000}'>4200</span>+</h3>
    <p>Happy customers</p>
  </div>
  <div class="stat">
    <h3>$<span data-plugin-counter
               data-plugin-options='{"speed":2000,"comma":true}'>1200000</span></h3>
    <p>Revenue generated</p>
  </div>
</div>
```

#### Callback on complete

```js
$('[data-plugin-counter]').themestrapPluginCounter({
  speed: 2000,
  onComplete: function () {
    $(this).closest('.stat').addClass('complete');
  }
});
```

---

## [Common **Pitfalls**](#pitfalls)

**Text content must be a plain number.** The plugin uses `parseFloat()` on the element's trimmed text content. Currency symbols, commas, or other non-numeric characters will result in `NaN` and the animation will not run. Use `data-to` for the numeric value and style the surrounding text separately.

**Animation fires only once.** The IntersectionObserver unregisters after the first trigger so the counter doesn't re-animate on every scroll. For a repeatable counter, call `reset()` then `start()` manually.
