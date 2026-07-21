# PluginPricingToggle Guide

Drives a billing-period switcher (e.g. Monthly ↔ Annual) that animates a pill/thumb inside a track between two positions, broadcasts namespaced jQuery events so any number of page listeners can react (price spans, feature lists, badge visibility), and exposes a clean programmatic API with full ARIA semantics. Integrates with PluginCounter so animated price figures recount when the period switches, and fires CSS custom-property updates on the host element so pure-CSS themes can react without any JavaScript of their own.

---

## How It Works

The plugin manages a two-state machine — `primary` and `secondary` — that maps onto a toggle switch UI. The terms are intentionally generic: `primary` is the default/left/"off" state (typically Monthly), and `secondary` is the alternate/right/"on" state (typically Annual).

### State machine

On every state change, `_applyState()` performs three things atomically:

1. **ARIA** — sets `aria-pressed="true"` or `"false"` on `[data-pt-track]`
2. **Classes** — toggles `is-active` and the configured `activeClass` on both labels and the wrapper
3. **Prices** — updates every `[data-pt-price]` element in the matching group

The thumb position is handled entirely by CSS: when `[data-pt-track][aria-pressed="true"]`, a CSS rule slides `[data-pt-thumb]` to `left: calc(trackWidth - thumbSize - thumbInset)`. No JavaScript writes to `.style.left`.

### Price scoping

`[data-pt-price]` elements are scoped by a `data-pt-group` attribute. A toggle instance with `group: null` (the default) updates all price elements that also have no `data-pt-group`. A toggle with `group: "enterprise"` only updates elements with `data-pt-group="enterprise"`. This allows multiple independent toggles on one page — e.g. a personal pricing section and an enterprise pricing section — without interference.

### CSS custom properties

On `build()`, the plugin writes all geometry and colour options as CSS custom properties directly onto the host element's inline style. This means pure-CSS themes can override them at any cascade level (`[data-plugin-pricingtoggle]`, a class, or `:root`) and the plugin values act as per-instance defaults, not globals.

---

## Quick Start

### Minimal markup

```html
<div data-plugin-pricingtoggle>
  <span data-pt-label-primary>Monthly</span>

  <button data-pt-track aria-pressed="false" type="button">
    <span data-pt-thumb></span>
  </button>

  <span data-pt-label-secondary>
    Annual
    <span data-pt-savings-badge>−20%</span>
  </span>
</div>
```

### Price targets

Price elements can live anywhere on the page — they do not need to be inside the toggle wrapper:

```html
<span data-pt-price
      data-pt-primary="$29"
      data-pt-secondary="$23"></span>
```

### Include the plugin

```html
<script src="/assets/components/themestrap/vendor/plugins/js/plugins.min.js"></script>
<script src="/assets/components/themestrap/js/themestrap.js"></script>
<script src="/assets/components/themestrap/js/components/themestrap.plugin.pricingtoggle.js"></script>
<script src="/assets/components/themestrap/js/themestrap.init.js"></script>
```

### Auto-init wiring (`themestrap.init.js`)

```js
if ($.isFunction($.fn['themestrapPluginPricingToggle']) && $('[data-plugin-pricingtoggle]').length) {
    $(() => {
        $('[data-plugin-pricingtoggle]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginPricingToggle(opts);
        });
    });
}
```

### Manual init with options

```js
$('[data-plugin-pricingtoggle]').themestrapPluginPricingToggle({
    duration:     200,
    activeClass:  'is-annual',
    animatePrices: true,
});
```

### Per-element options via data attribute

```html
<div data-plugin-pricingtoggle
     data-plugin-options='{"duration": 200, "activeClass": "is-annual"}'>
  …
</div>
```

---

## Markup Reference

### Required elements

| Attribute | Element | Role |
|:----------|:--------|:-----|
| `data-plugin-pricingtoggle` | Container (any block element) | Plugin root; receives `activeClass` and CSS custom properties |
| `data-pt-track` | `<button>` (recommended) | The clickable track; receives `aria-pressed` and `role="switch"` |
| `data-pt-thumb` | Any element inside the track | The sliding pill; position driven by CSS |

### Optional elements

| Attribute | Element | Role |
|:----------|:--------|:-----|
| `data-pt-label-primary` | Any inline element | Left label; receives `is-active` when in primary state; click sets state to primary |
| `data-pt-label-secondary` | Any inline element | Right label; receives `is-active` when in secondary state; click sets state to secondary |
| `data-pt-savings-badge` | Child of `data-pt-label-secondary` | Animates in (opacity + scale) when secondary state is active |
| `data-pt-price` | Any inline element, anywhere on page | Updated with `data-pt-primary` or `data-pt-secondary` value on state change |

### Price element attributes

```html
<span
  data-pt-price
  data-pt-primary="$29"
  data-pt-secondary="$23"
  data-pt-group="personal">   <!-- optional scope key -->
</span>
```

| Attribute | Required | Description |
|:----------|:---------|:------------|
| `data-pt-price` | Yes | Marks the element as a managed price target |
| `data-pt-primary` | Yes | Value shown in primary state |
| `data-pt-secondary` | Yes | Value shown in secondary state |
| `data-pt-group` | No | Scope key; must match the toggle's `group` option for the element to be updated |

### Starting in secondary state

Set `aria-pressed="true"` on `[data-pt-track]` before the plugin initialises — the plugin reads it and starts in secondary state without needing a JavaScript option:

```html
<button data-pt-track aria-pressed="true" type="button">
  <span data-pt-thumb></span>
</button>
```

---

## Configuration Options

Options merge: `PluginPricingToggle.defaults → opts argument → data-plugin-options JSON`.

### State

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `initialState` | `string\|null` | `null` | Starting state: `'primary'` or `'secondary'`. When `null`, the plugin reads `aria-pressed` from `[data-pt-track]`; `"true"` → secondary, anything else → primary. |
| `activeClass` | string | `'is-secondary'` | Class added to the wrapper element and the active label on every state change. Useful hook for external CSS. |
| `group` | `string\|null` | `null` | Scope key for price updates. Null = update all `[data-pt-price]` elements that have no `data-pt-group`. A string value = update only elements whose `data-pt-group` matches. |

### Animation

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `duration` | number | `250` | Thumb slide and label colour transition duration in milliseconds. Applied as `--pt-duration`. |
| `animatePrices` | bool | `true` | Crossfade `[data-pt-price]` elements by toggling `.pt-fading` (opacity 0), updating the text, then removing the class. |
| `priceFadeDuration` | number | `160` | Duration of the price crossfade in milliseconds. Applied as `--pt-price-duration`. |

### Geometry

All geometry values are CSS length strings — passed directly as CSS custom properties:

| Option | Default | CSS property |
|:-------|:--------|:-------------|
| `trackWidth` | `'44px'` | `--pt-track-width` |
| `trackHeight` | `'24px'` | `--pt-track-height` |
| `thumbSize` | `'18px'` | `--pt-thumb-size` |
| `thumbInset` | `'3px'` | `--pt-thumb-inset` |

### Colours

All colour values are CSS colour strings — passed directly as CSS custom properties:

| Option | Default | CSS property | Controls |
|:-------|:--------|:-------------|:---------|
| `trackColor` | `'#3b82f6'` | `--pt-track-bg` | Track background |
| `thumbColor` | `'#ffffff'` | `--pt-thumb-bg` | Thumb fill |
| `labelMutedColor` | `'#64748b'` | `--pt-label-muted` | Inactive label text |
| `labelActiveColor` | `'#0f172a'` | `--pt-label-active` | Active label text |
| `badgeBg` | `'rgba(34,197,94,.12)'` | `--pt-badge-bg` | Savings badge background |
| `badgeColor` | `'#16a34a'` | `--pt-badge-color` | Savings badge text |

### Accessibility

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `ariaLabelPrimary` | string | `'Switch to annual billing'` | `aria-label` set on `[data-pt-track]` when in primary state |
| `ariaLabelSecondary` | string | `'Switch to monthly billing'` | `aria-label` set on `[data-pt-track]` when in secondary state |

### Callback

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `onChange` | `function\|null` | `null` | Called on every state change after DOM updates. Signature: `function(state, instance)`. Equivalent to listening for `ts-pricingtoggle-changed` but co-located with the init options. |

### CSS custom properties (direct override)

Since all options are written as CSS custom properties on the host element, you can override them at any cascade level:

```css
/* Global defaults */
[data-plugin-pricingtoggle] {
  --pt-track-width:    56px;
  --pt-track-height:   30px;
  --pt-thumb-size:     24px;
  --pt-thumb-inset:    3px;
  --pt-track-bg:       #e8672a;
  --pt-duration:       200ms;
}

/* Per-wrapper override via inline style */
<div data-plugin-pricingtoggle style="--pt-track-bg: #2ab8c8">…</div>
```

---

## Public API

### Accessing the instance

```js
// Data key access after auto- or manual-init
const pt = $('[data-plugin-pricingtoggle]').data('__pricingToggle');
```

### Instance methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `setState(state)` | `this` | Set the toggle to `'primary'` or `'secondary'`. No-ops if the state is already current. Fires `_applyState()` → updates ARIA, classes, prices, and emits events. |
| `toggle()` | `this` | Flip the current state. Calls `setState()` internally. |
| `getState()` | `string` | Return the current state string: `'primary'` or `'secondary'`. |
| `destroy()` | `this` | Remove all `.pricingtoggle` namespaced event handlers from the track, both labels, and the wrapper. Remove the instance reference from `$el.data()`. Does not restore price elements or remove injected CSS. |

### jQuery events

All three events fire on the toggle's host element and bubble. Each carries an identical `detail` object as the second argument:

```js
{
  state:       'primary' | 'secondary',
  isPrimary:   true | false,
  isSecondary: true | false,
  instance:    PluginPricingToggle
}
```

| Event | When |
|:------|:-----|
| `ts-pricingtoggle-changed` | Every state change (after DOM update) |
| `ts-pricingtoggle-primary` | Only when reverting to primary state |
| `ts-pricingtoggle-secondary` | Only when entering secondary state |

```js
$('[data-plugin-pricingtoggle]')
  .on('ts-pricingtoggle-changed', (e, detail) => {
      console.log(detail.state);           // 'primary' | 'secondary'
      console.log(detail.isPrimary);       // true | false
      console.log(detail.instance);        // PluginPricingToggle instance
  })
  .on('ts-pricingtoggle-secondary', (e, detail) => {
      // Fires only when switching TO annual/secondary
      analytics.track('pricing_toggle_annual');
  });
```

---

## Recipe Cookbook

### Standard SaaS pricing toggle

```html
<div class="pricing-header text-center mb-5">
  <div data-plugin-pricingtoggle
       data-plugin-options='{"trackColor":"#e8672a","duration":200}'>
    <span data-pt-label-primary>Monthly</span>
    <button data-pt-track aria-pressed="false" type="button">
      <span data-pt-thumb></span>
    </button>
    <span data-pt-label-secondary>
      Annual <span data-pt-savings-badge>Save 20%</span>
    </span>
  </div>
</div>

<!-- Cards elsewhere on the page -->
<div class="pricing-card">
  <div class="price">
    <span data-pt-price data-pt-primary="$29" data-pt-secondary="$23"></span>
    <span>/mo</span>
  </div>
</div>
```

### Multiple independent toggles on one page

```html
<!-- Personal plans toggle -->
<div data-plugin-pricingtoggle data-plugin-options='{"group":"personal"}'>
  …
</div>
<span data-pt-price data-pt-group="personal"
      data-pt-primary="$9"  data-pt-secondary="$7"></span>

<!-- Enterprise plans toggle -->
<div data-plugin-pricingtoggle data-plugin-options='{"group":"enterprise"}'>
  …
</div>
<span data-pt-price data-pt-group="enterprise"
      data-pt-primary="$99" data-pt-secondary="$79"></span>
```

### Start in secondary (annual) state

```html
<!-- Set aria-pressed="true" — plugin reads it on init -->
<div data-plugin-pricingtoggle>
  <span data-pt-label-primary>Monthly</span>
  <button data-pt-track aria-pressed="true" type="button">
    <span data-pt-thumb></span>
  </button>
  <span data-pt-label-secondary>Annual</span>
</div>
```

### Programmatic control from external UI

```js
const pt = $('[data-plugin-pricingtoggle]').data('__pricingToggle');

// Set to a specific state
$('#btn-monthly').on('click', () => pt.setState('primary'));
$('#btn-annual').on('click',  () => pt.setState('secondary'));

// Read current state
console.log(pt.getState()); // 'primary' | 'secondary'

// Flip
$('#btn-toggle').on('click', () => pt.toggle());
```

### onChange callback (co-located with init)

```js
$('[data-plugin-pricingtoggle]').themestrapPluginPricingToggle({
    onChange(state, instance) {
        // state: 'primary' | 'secondary'
        document.title = state === 'secondary'
            ? 'Pricing — Annual'
            : 'Pricing — Monthly';
    }
});
```

### Sync URL hash with toggle state

```js
$('[data-plugin-pricingtoggle]')
  .on('ts-pricingtoggle-changed', (e, detail) => {
      const url = new URL(window.location);
      url.searchParams.set('billing', detail.state);
      history.replaceState(null, '', url);
  })
  .themestrapPluginPricingToggle();

// Restore state from URL on load
const billing = new URLSearchParams(location.search).get('billing');
if (billing === 'secondary') {
    $('[data-plugin-pricingtoggle]').data('__pricingToggle')?.setState('secondary');
}
```

### Custom geometry and colour via options

```js
$('[data-plugin-pricingtoggle]').themestrapPluginPricingToggle({
    trackWidth:   '56px',
    trackHeight:  '30px',
    thumbSize:    '24px',
    thumbInset:   '3px',
    trackColor:   '#0a1929',
    thumbColor:   '#2ab8c8',
    labelActiveColor: '#ffffff',
    duration:     180,
});
```

### Show/hide content sections on toggle

```js
$('[data-plugin-pricingtoggle]')
  .on('ts-pricingtoggle-primary',   () => {
      $('.monthly-only').show();
      $('.annual-only').hide();
  })
  .on('ts-pricingtoggle-secondary', () => {
      $('.monthly-only').hide();
      $('.annual-only').show();
  })
  .themestrapPluginPricingToggle();
```

---

## Common Pitfalls

### Track must be a `<button>` or have `tabindex`

> **Warning:** If `[data-pt-track]` is not a `<button>`, it won't receive keyboard focus by default. Add `tabindex="0"` manually. The plugin adds Space/Enter keyboard handling automatically for non-button tracks, but focus must be reachable first. Using `<button type="button">` is the recommended approach — it handles focus, keyboard, and ARIA natively.

### `aria-pressed` must be present before init

> **Note:** The plugin reads `aria-pressed` from `[data-pt-track]` during `setOptions()` to determine the initial state when `initialState` is null. If the attribute is absent entirely, the plugin defaults to primary. Always include `aria-pressed="false"` (or `"true"`) in your markup — don't rely on the plugin to add it.

### Price elements must have both `data-pt-primary` and `data-pt-secondary`

> **Note:** If either value attribute is missing, `$price.data('pt-primary')` returns `undefined`, and the text content of the price element becomes `""` on that state. Always declare both attributes even if one value is the same as the other.

### Group scoping catches nothing

> **Warning:** If you set `group: "enterprise"` on the toggle but forget to add `data-pt-group="enterprise"` on the price elements (or vice versa), `updatePrices()` will update zero elements silently. Open the console, call `$('[data-pt-price]').map(function(){ return $(this).data('pt-group') }).get()` and verify the group values match.

### Destroy does not reset price elements

> **Note:** `destroy()` removes event handlers and the instance reference, but does not restore `[data-pt-price]` elements to their original text. If you re-init with a different `initialState`, call `setState()` explicitly after re-init to ensure prices reflect the new starting state.

### Multiple inits on the same element

> **Note:** Calling `.themestrapPluginPricingToggle()` on an already-initialised element returns the existing instance — it does not create a second one or re-run `build()`. To change options, call `destroy()` first, then re-init.

### Diagnostic checklist

- [ ] Is `data-plugin-pricingtoggle` present on the wrapper? (Check spelling — no `data-plugin-pricing-toggle`.)
- [ ] Is `[data-pt-track]` a `<button>` with `type="button"` and `aria-pressed="false"`?
- [ ] Is `[data-pt-thumb]` a direct child of `[data-pt-track]`?
- [ ] Does `$('[data-plugin-pricingtoggle]').data('__pricingToggle')` return an instance?
- [ ] Are price elements updating? Check `data-pt-primary` and `data-pt-secondary` are both present.
- [ ] Are multiple toggles interfering? Verify `group` options and `data-pt-group` attributes match.
- [ ] Is the thumb not animating? Check `--pt-duration` isn't being overridden to `0` by a parent CSS rule.
- [ ] Is the savings badge not appearing? It needs `[data-pt-savings-badge]` as a child of `[data-pt-label-secondary]` — not `[data-pt-label-primary]`.