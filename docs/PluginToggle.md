# PluginToggle

A list of rows that open and close with a jQuery slide. Each row has a title and a content panel, can show a short preview paragraph while closed, and the list can run as an accordion so only one row is open at a time.

**File:** `js/components/themestrap.plugin.toggle.js`  
**Demo:** `demos/plugin.demo.toggle.html`  
**jQuery method:** `$.fn.themestrapPluginToggle`  
**Data attribute:** `data-plugin-toggle`  
**Instance key:** `__toggle`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

> PluginToggle is the original Porto-era component. For new work, PluginAccordion (one open at a time, ARIA, keyboard, events) and PluginCollapsible (a single disclosure) are the fuller options. PluginToggle stays for existing markup and for the preview-paragraph style.



## How It Works

The plugin is initialized on a wrapper and looks only at its **direct** `.toggle` children. On `build()`, for each row:

1. If the row already has `.active`, its preview paragraph gets `.preview-active` and its `.toggle-content` slides open.
2. A click handler is bound to the row's direct `<label>` or `.toggle-title`.

A click toggles `.active` on the row, then:

- **Opening:** the preview paragraph (a direct `<p>` child, if any) animates to its natural height and gets `.preview-active`, and `.toggle-content` slides down.
- **Closing:** the preview animates to height 0 and loses `.preview-active`, and `.toggle-content` slides up.

In accordion mode, when a row opens, the plugin looks for the open row inside the nearest `.toggle` ancestors of the clicked title, which is why **the wrapper itself must carry the `.toggle` class** for accordion mode (Porto's original markup does this). It then waits for its slide to finish and then triggers a click on the title of the row that was open before, closing it. Clicking the already open row does nothing, so one row always stays open once any has been opened. Accordion mode also halves `duration` for the clicks.

**The plugin injects no CSS.** The `.toggle` styles come from `themestrap-elements.css`, including dark-mode rules in `themestrap.css`. The demo page carries a compact stand-alone set.



## Quick Start

### 1. Include the files

```html
<link rel="stylesheet" href="css/themestrap-elements.css">

<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.toggle.js"></script>
<script src="js/themestrap.init.js"></script>
```

Use the full jQuery build: the plugin animates with `slideDown`, `slideUp` and `animate`, which jQuery slim does not include.

### 2. Mark it up

```html
<div class="toggle toggle-primary" data-plugin-toggle>
    <section class="toggle active">
        <label>What is Themestrap?</label>
        <div class="toggle-content">
            <p>A zero-build jQuery and Bootstrap 5 component library.</p>
        </div>
    </section>
    <section class="toggle">
        <label>Do I need a build step?</label>
        <div class="toggle-content">
            <p>No. Every component is a plain script you include.</p>
        </div>
    </section>
</div>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-toggle]:not(.manual)', 'themestrapPluginToggle');
```

### Manual init

```js
$('#faq').themestrapPluginToggle({ isAccordion: true, duration: 400 });   // #faq has class="toggle"
```



## Markup Reference

| Element | Required | Role |
| - | - | - |
| `[data-plugin-toggle]` | Yes | The wrapper the plugin is initialized on. Give it the `.toggle` class too: accordion mode and the style variants depend on it. |
| `> .toggle` | Yes | One row. Must be a direct child of the wrapper. Add `.active` to start it open. |
| `> label` or `> .toggle-title` | Yes | The clickable title. Must be a direct child of the row. |
| `> p` | No | A preview paragraph shown between the title and the content while the row is open (styled closed by CSS). |
| `> .toggle-content` | Yes | The panel that slides. Must be a direct child of the row. |

### With a preview paragraph

```html
<section class="toggle">
    <label>Shipping</label>
    <p>Free over $50. Most orders arrive in 2 to 4 days.</p>
    <div class="toggle-content">
        <p>Full shipping details…</p>
    </div>
</section>
```

### Style variants in `themestrap-elements.css`

Add these next to `.toggle` on the wrapper: `toggle-simple`, `toggle-minimal`, `toggle-primary` (and the other palette colors), `toggle-sm`, `toggle-lg`.

### Classes the plugin sets

| Class | On | When |
| - | - | - |
| `.active` | `.toggle` | The row is open. |
| `.preview-active` | `> p` | The preview paragraph is expanded. |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `duration` | `number` | `350` | Slide duration in ms. Halved for clicks in accordion mode. Rows that start open always use the full value. |
| `isAccordion` | `boolean` | `false` | Opening a row closes the one that was open. |

```html
<div class="toggle" data-plugin-toggle data-plugin-options='{"isAccordion": true, "duration": 500}'> ... </div>
```



## Public API

The instance exposes no methods beyond initialization. Read it with `$(selector).data('__toggle')` to inspect `options`.

To open or close a row from code, trigger a click on its title:

```js
$('#faq > .toggle').eq(2).children('label, .toggle-title').trigger('click');
```

There is no `destroy()`. To remove the behavior, unbind the title clicks:

```js
$('#faq > .toggle > label, #faq > .toggle > .toggle-title').off('click');
$('#faq').removeData('__toggle');
```



## Events

The plugin fires no events of its own. Listen to the title clicks, and read the row's state after the class has flipped:

```js
$('#faq').on('click', '> .toggle > label, > .toggle > .toggle-title', function () {
    const $row = $(this).parent();
    setTimeout(function () {
        console.log($row.find('> label, > .toggle-title').text(), $row.hasClass('active') ? 'opened' : 'closed');
    });
});
```



## CSS Custom Properties

None. The styles in `themestrap-elements.css` use the Themestrap palette variables (`--grey-100`, `--grey-500`, `--primary` …), and `themestrap.css` adds dark-mode backgrounds under `html.dark`.

A minimal stand-alone set, from the demo page:

```css
.toggle > label,
.toggle > .toggle-title { display: block; padding: .9rem 1.1rem; cursor: pointer; font-weight: 600; }
.toggle > .toggle-content { display: none; padding: 0 1.1rem; }
.toggle.active > .toggle-content { display: block; }
.toggle > p { height: 0; overflow: hidden; margin: 0; }
```

`.toggle-content` must start hidden (`display: none`) for `slideDown` to have something to reveal.



## Keyboard Navigation

The titles are `<label>` or plain elements, so they are not focusable and have no key handling. To make a list usable from the keyboard, use `<button>` titles:

```html
<section class="toggle">
    <button type="button" class="toggle-title" aria-expanded="false">Returns</button>
    <div class="toggle-content">...</div>
</section>
```

Buttons fire `click` on Enter and Space. Reset the button's own styles in CSS, and keep `aria-expanded` in sync (see below).



## ARIA Wiring

The plugin adds no ARIA. With button titles, keep `aria-expanded` current:

```js
$('#faq').on('click', '> .toggle > .toggle-title', function () {
    const $btn = $(this);
    setTimeout(function () { $btn.attr('aria-expanded', String($btn.parent().hasClass('active'))); });
});
```

If you need this out of the box, PluginAccordion manages `aria-expanded`, `aria-controls` and keyboard focus for you.



## Recipes

### Open the row named in the URL hash

```js
$(function () {
    const $row = $(location.hash + '.toggle');
    if ($row.length && !$row.hasClass('active')) {
        $row.children('label, .toggle-title').trigger('click');
    }
});
```

### Open all rows

```js
$('#faq > .toggle:not(.active) > label, #faq > .toggle:not(.active) > .toggle-title').trigger('click');
```

Clicks fired with `.trigger()` skip accordion handling, so this opens every row even in accordion mode.



## Common Pitfalls

### Accordion mode opens rows but never closes the previous one

The wrapper is missing the `.toggle` class. The plugin finds the open row through the clicked title's `.toggle` ancestors; without the class on the wrapper, the only ancestor is the row itself, so it never finds the other open row. Use `<div class="toggle" data-plugin-toggle>`.

Clicks fired from code with `.trigger('click')` also skip accordion handling: the plugin only applies it to real clicks (it checks `originalEvent`), so the previous row stays open.

### Nested rows do nothing

The plugin only reads direct children: wrapper `> .toggle`, then row `> label`, `> .toggle-title`, `> p` and `> .toggle-content`. An extra `<div>` anywhere in that chain breaks it. A nested toggle list needs its own `data-plugin-toggle` wrapper.

### "slideDown is not a function"

jQuery slim has no effects module. Load the full `jquery.min.js`.

### Content flashes open on load

`.toggle-content` must be hidden by CSS before the plugin runs. Without `themestrap-elements.css` (or your own rule), every panel shows until clicked twice.

### An accordion row cannot be closed

By design: clicking the open row in accordion mode does nothing. Use the default mode if readers should be able to close everything.

### Clicking quickly in accordion mode leaves two rows open

The previous row closes only after the new one has finished sliding. Several fast clicks can stack up. Keep `duration` short, or switch to PluginAccordion.

### Diagnostic checklist

- [ ] The wrapper has the `.toggle` class (required for accordion mode).
- [ ] `.toggle` rows are direct children of the `[data-plugin-toggle]` wrapper.
- [ ] Each row has a direct `<label>` or `.toggle-title`, and a direct `.toggle-content`.
- [ ] `.toggle-content` is hidden by CSS.
- [ ] The full jQuery build is loaded, not slim.
- [ ] `themestrap.js` loads before the plugin.
