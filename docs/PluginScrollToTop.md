# PluginScrollToTop

A "back to top" button. The plugin creates it, fades it in once the page has scrolled past an offset, and scrolls smoothly back to the top when it is clicked.

**File:** `js/components/themestrap.plugin.scrolltotop.js`  
**Demo:** `demos/plugin.demo.scrolltotop.html`  
**Namespace:** `themestrap.PluginScrollToTop`  
**Init strategy:** `themestrap.PluginScrollToTop.initialize()`, called by `themestrap.init.js`

PluginScrollToTop is a page-level singleton, not a jQuery plugin: there is no `$.fn.themestrapPluginScrollToTop`, no data attribute and no per-element instance. One button per page.



## How It Works

`initialize(opts)`:

1. Stops at once if `<body>` has `data-plugin-section-scroll` (PluginSectionScroll brings its own navigation).
2. Merges `opts` over `PluginScrollToTop.defaults`.
3. Builds `<a href="#" class="scroll-to-top" aria-label="Scroll To Top"><i class="fas fa-chevron-up"></i></a>`, adds `.hidden-mobile` unless `visibleMobile` is true, appends an optional `<span>` label, and appends the button to `wrapper` (the `<body>` by default).
4. Binds two handlers:
   - **click:** animates `html` `scrollTop` to 0 over `delay` ms with `easing`.
   - **window scroll:** adds `.visible` when the page is scrolled more than `offset` px, removes it otherwise.

The look comes from `themestrap-elements.css`: a dark tab fixed to the bottom right, at opacity 0 until `.visible` raises it to 0.75 (1 on hover), and hidden below 992 px when it has `.hidden-mobile`.



## Quick Start

### 1. Include the files

```html
<link rel="stylesheet" href="vendor/fontawesome-free/css/all.min.css">
<link rel="stylesheet" href="css/themestrap-elements.css">

<script src="vendor/jquery/jquery.min.js"></script>
<script src="vendor/jquery.easing/jquery.easing.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.scrolltotop.js"></script>
<script src="js/themestrap.init.js"></script>
```

That is all: `themestrap.init.js` calls `initialize()` whenever the plugin is loaded, and the button appears with the defaults. jQuery Easing is required for the default `easeOutBack` curve.

### 2. Change the options

`themestrap.init.js` passes no options, so change the defaults between the plugin and `init.js`:

```html
<script src="js/components/themestrap.plugin.scrolltotop.js"></script>
<script>
    $.extend(themestrap.PluginScrollToTop.defaults, {
        offset:        400,
        visibleMobile: true,
        label:         'Top'
    });
</script>
<script src="js/themestrap.init.js"></script>
```

### Without `themestrap.init.js`

```js
$(function () {
    themestrap.PluginScrollToTop.initialize({ offset: 300, easing: 'swing' });
});
```

Call it once. Each call adds another button (see Pitfalls).



## Markup Reference

No markup is needed. The generated button:

```html
<a href="#" class="scroll-to-top hidden-mobile visible" aria-label="Scroll To Top">
    <i class="fas fa-chevron-up"></i>
    <span>Top</span>                    <!-- only with the label option -->
</a>
```

| Class | When |
| - | - |
| `scroll-to-top` | Always (the `buttonClass` option) |
| `hidden-mobile` | `visibleMobile: false`. Hidden below 992 px by `themestrap-elements.css`. |
| `visible` | The page is scrolled past `offset` |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `wrapper` | `jQuery` | `$('body')` | Where the button is appended. |
| `offset` | `number` | `150` | Scroll distance in px before the button shows. |
| `buttonClass` | `string` | `'scroll-to-top'` | Class on the button. Changing it drops the built-in styles. |
| `buttonAriaLabel` | `string` | `'Scroll To Top'` | The button's `aria-label`. |
| `iconClass` | `string` | `'fas fa-chevron-up'` | Classes for the `<i>` icon. Any icon font works (`'bi bi-arrow-up'`). |
| `delay` | `number` | `1000` | Scroll animation duration in ms. |
| `visibleMobile` | `boolean` | `false` | Keep the button on screens under 992 px. |
| `label` | `string\|false` | `false` | Text after the icon. Inserted as HTML. |
| `easing` | `string` | `'easeOutBack'` | jQuery easing name. Anything other than `'swing'` or `'linear'` needs jQuery Easing. |



## Public API

| Member | Description |
| - | - |
| `themestrap.PluginScrollToTop.defaults` | The default options. Change them before `initialize()` runs. |
| `themestrap.PluginScrollToTop.initialize(opts)` | Builds the button and binds the handlers. Returns the object, or `undefined` when the page uses Section Scroll. |
| `themestrap.PluginScrollToTop.$el` | The button, as a jQuery object, after `initialize()`. |
| `themestrap.PluginScrollToTop.options` | The merged options. |

There is no `destroy()`. To remove the button:

```js
const stt = themestrap.PluginScrollToTop;
stt.$el.remove();
$(window).off('scroll');   // also removes other scroll handlers bound without a namespace
```



## Events

None. Listen to the button directly:

```js
themestrap.PluginScrollToTop.$el.on('click', function () {
    analytics.track('scroll_to_top');
});
```



## CSS Custom Properties

None of its own. `themestrap-elements.css` styles `html .scroll-to-top` with a fixed `#404040` background, `var(--border-radius)` top corners, `var(--light)` text and `z-index: 1040`. Override with the same selector strength:

```css
html .scroll-to-top {
    background: #0e2238;
    color: #20e2d7;
    right: 24px;
    bottom: 24px;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
}
html .scroll-to-top:not(.visible) { pointer-events: none; }
```

The last rule is worth keeping: by default the hidden button is only transparent, so it can still be clicked (see Pitfalls).

### Reduced motion

The scroll is a jQuery animation and does not follow `prefers-reduced-motion`. Respect it with the defaults:

```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    themestrap.PluginScrollToTop.defaults.delay = 0;
}
```



## Keyboard Navigation

The button is a link, so it is reached with Tab and activated with Enter. While hidden it is still in the tab order: either add the `pointer-events` rule above and hide it from the tab order too, or accept that keyboard users can always reach it.

```css
html .scroll-to-top:not(.visible) { visibility: hidden; }
```

`visibility: hidden` removes it from the tab order, but also cancels the fade. Combine it with a transition on `visibility` if you want both.

After the scroll, focus stays on the button at the bottom of the page. To move it to the top, focus a skip target:

```js
themestrap.PluginScrollToTop.$el.on('click', function () {
    setTimeout(function () { $('#top').attr('tabindex', '-1').trigger('focus'); }, themestrap.PluginScrollToTop.options.delay);
});
```



## ARIA Wiring

```
<a href="#" class="scroll-to-top" aria-label="{buttonAriaLabel}">
    <i class="{iconClass}"></i>
```

The icon has no `aria-hidden`; icon fonts render nothing for screen readers in practice, and the `aria-label` names the link. A `label` adds visible text but the `aria-label` still wins, so keep them consistent.



## Recipes

### A round floating button with Bootstrap Icons

```js
$.extend(themestrap.PluginScrollToTop.defaults, {
    iconClass:     'bi bi-arrow-up',
    visibleMobile: true,
    easing:        'swing',
    delay:         600
});
```

Pair it with the CSS above.

### Scroll inside a dashboard layout

The button only scrolls the page (`html`). For a layout where a container scrolls, bind your own handler:

```js
const stt = themestrap.PluginScrollToTop;
stt.$el.off('click').on('click', function (e) {
    e.preventDefault();
    $('#main-pane').animate({ scrollTop: 0 }, stt.options.delay, 'swing');
});
```

The visibility still follows the window's scroll, not the container's.



## Common Pitfalls

### `$(...).themestrapPluginScrollToTop is not a function`

There is no jQuery method. Use `themestrap.PluginScrollToTop.initialize()`, or just load `themestrap.init.js`, which calls it.

### Clicking does nothing, with "jQuery.easing[…] is not a function" in the console

The default `easeOutBack` comes from jQuery Easing. Load `vendor/jquery.easing/jquery.easing.min.js`, or set `easing: 'swing'`.

### Two buttons

`themestrap.init.js` already calls `initialize()`. Calling it again yourself adds a second button, and only the newest one fades in and out. Change `defaults` instead.

### Options passed to `initialize()` have no effect

When `themestrap.init.js` is on the page it runs `initialize()` first, with the defaults. Your later call makes a second button. Set the defaults before `init.js` loads.

### The invisible button gets clicked

A hidden button is only at opacity 0. It still sits over the bottom right corner and takes clicks and focus. Add `html .scroll-to-top:not(.visible) { pointer-events: none; }`.

### No button on phones

`visibleMobile` is `false` by default, which hides the button below 992 px.

### No button at all

The page has `<body data-plugin-section-scroll>`, the CSS from `themestrap-elements.css` is missing, or the plugin loads after `themestrap.init.js`.

It can also be the load position. The default `wrapper: $('body')` is evaluated when the plugin file runs, and `themestrap.init.js` calls `initialize()` straight away, not on DOMReady. Loaded in `<head>`, both happen before `<body>` exists, so the button is appended to nothing. Load the scripts at the end of `<body>`.

### Diagnostic checklist

- [ ] The plugin loads after `themestrap.js` and before `themestrap.init.js`.
- [ ] jQuery Easing is loaded, or `easing` is `'swing'`.
- [ ] `themestrap-elements.css` (or your own `.scroll-to-top` styles) is loaded.
- [ ] Options are set on `defaults`, and `initialize()` runs once.
- [ ] `<body>` does not have `data-plugin-section-scroll`.
- [ ] The hidden state blocks pointer events.
