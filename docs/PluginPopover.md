# PluginPopover

A click-to-open panel anchored to a trigger, with an arrow, side and alignment control, a flip when the trigger is near the viewport edge, Escape and click-outside closing, an optional focus trap, and a portal mode that escapes `overflow: hidden` containers. Only one popover is open at a time.

**File:** `js/components/themestrap.plugin.popover.js`  
**Demo:** `demos/plugin.demo.popover.html`  
**jQuery method:** `$.fn.themestrapPluginPopover`  
**Data attribute:** `data-plugin-popover`  
**Instance key:** `__pluginPopover`  
**Init strategy:** DOMReady `$().each()` via `themestrap.init.js`



## How It Works

On `build()` the plugin:

1. Injects its stylesheet once (`<style id="ts-popover-styles">`).
2. Finds the trigger: a `[data-popover-trigger]` inside the root, or else a `[data-popover-trigger="{root id}"]` anywhere on the page.
3. Finds the first `[data-popover-content]` inside the root (it warns in the console and stops when there is none).
4. Gives the panel an id, `role="dialog"`, `aria-modal` (from `modal`) and `aria-labelledby` pointing at `[data-popover-title]` when present; gives the trigger `aria-haspopup="dialog"`, `aria-expanded="false"` and `aria-controls`.
5. Adds `.ts-pop-arrow` to the panel when `arrow` is on.
6. With `portaling: true`, moves the panel to `<body>` straight away. It stays there until `destroy()`.

### Opening

1. `ts-popover-opened` is triggered on `document`; every other open popover closes itself.
2. The panel gets `.ts-pop-visible` and is positioned (see Placement).
3. The `animationIn` class plays, and is removed when the animation ends.
4. The trigger gets `aria-expanded="true"`.
5. After 30 ms focus moves to the first visible focusable element in the panel, or to the panel itself (with `tabindex="-1"`).
6. `onOpen` runs and `popover:open` fires.

### Closing

1. `isOpen` becomes `false` and the trigger gets `aria-expanded="false"` at once.
2. The `animationOut` class plays.
3. When it ends (or after `animationDuration + 30` ms) the panel loses `.ts-pop-visible` and its position, `onClose` runs and `popover:close` fires.

Escape also returns focus to the trigger. Closing by any other route leaves focus where it is.

### Placement

Without portaling, the panel is `position: absolute` inside the root (which the CSS makes `position: relative; display: inline-block`), placed beside the trigger on `side` and lined up by `align`. With portaling it is placed with page coordinates on `<body>`. The position is recalculated on every window scroll and resize while open.

**Flip:** before placing, the plugin checks the trigger's distance from the viewport edge on the chosen side. If it is less than 200 px plus `offset`, the panel goes on the opposite side instead. The check uses that fixed 200 px, not the panel's real size, so a tall panel can still run off-screen and a short one can flip when it would have fitted.

The arrow is a CSS triangle on the panel's `::before` (border) and `::after` (fill), pointed by `.ts-pop-side-{side}`. The plugin moves it to stay under the trigger's center by writing a small `<style class="ts-pop-arrow-style">` into the panel.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.popover.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<div data-plugin-popover data-plugin-options='{"side": "bottom", "align": "start"}'>
    <button type="button" data-popover-trigger class="btn btn-light">Details</button>

    <div data-popover-content>
        <h4 data-popover-title class="h6">Shipping</h4>
        <p class="mb-0">Free over $50. Most orders arrive in 2 to 4 days.</p>
    </div>
</div>
```

`themestrap.init.js` already wires it:

```js
$('[data-plugin-popover]:not(.manual)').each(function () {
    const $this = $(this);
    const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
    $this.themestrapPluginPopover(opts);
});
```

### Manual init

```js
$('#share').themestrapPluginPopover({ side: 'top', align: 'center', modal: true });
```



## Markup Reference

| Attribute | On | Role |
| - | - | - |
| `data-plugin-popover` | Root | Marks the popover. |
| `data-plugin-options` | Root | JSON options. |
| `data-popover-trigger` | Inside the root | The button that toggles the panel. |
| `data-popover-trigger="id"` | Anywhere | A trigger outside the root, pointing at the root's `id`. Only the first match is used. |
| `data-popover-content` | Inside the root | The panel. **Required.** |
| `data-popover-title` | Inside the panel | Becomes the panel's accessible name. |

### Trigger outside the root

```html
<button type="button" data-popover-trigger="settings-pop">Settings</button>

<div data-plugin-popover id="settings-pop" data-plugin-options='{"side": "right", "portaling": true}'>
    <div data-popover-content>…</div>
</div>
```

Positioning measures the trigger, so for a trigger outside the root use `portaling: true`; without it the panel is placed relative to the root, not the trigger.

### Classes the plugin sets

| Class | On | When |
| - | - | - |
| `.ts-pop-visible` | Panel | Open, or closing |
| `.ts-pop-arrow` | Panel | `arrow: true` |
| `.ts-pop-side-top` `-bottom` `-left` `-right` | Panel | The side actually used, while open |
| `ts-pop-in`, `ts-pop-out` | Panel | During the open and close animations (the `animationIn` and `animationOut` options) |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `side` | `string` | `'bottom'` | `top`, `bottom`, `left` or `right`. Flips near the viewport edge (see Placement). |
| `align` | `string` | `'start'` | `start`, `center` or `end`, along the side. |
| `offset` | `number` | `8` | Gap in px between trigger and panel. |
| `arrow` | `boolean` | `true` | Draw the arrow. |
| `portaling` | `boolean` | `false` | Move the panel to `<body>` at init, to escape `overflow: hidden` and stacking contexts. |
| `closeOnEscape` | `boolean` | `true` | Escape closes and returns focus to the trigger. |
| `closeOnOutside` | `boolean` | `true` | A click outside the root, the panel and the trigger closes. |
| `animationIn` | `string` | `'ts-pop-in'` | Class played on open. The built-in animations slide from the side used. |
| `animationOut` | `string` | `'ts-pop-out'` | Class played on close. |
| `animationDuration` | `number` | `200` | Fallback in ms if `animationend` never fires. |
| `modal` | `boolean` | `false` | Trap Tab inside the panel and set `aria-modal="true"`. |
| `onOpen` | `function\|null` | `null` | Called on open. `this` is the instance. |
| `onClose` | `function\|null` | `null` | Called after closing. `this` is the instance. |

Earlier versions of this guide listed `closeOnOutsideClick` and `dark`. Neither exists: the option is `closeOnOutside`, and dark mode follows `html.dark` automatically.



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only.

```js
const pop = $('#share').data('__pluginPopover');
```

| Member | Returns | Description |
| - | - | - |
| `open()` | `this` | Opens, closing any other open popover. |
| `close()` | `this` | Closes with the exit animation. |
| `toggle()` | `this` | Opens or closes. |
| `update()` | `this` | Recomputes the position while open. Call it after the panel's content changes size. |
| `destroy()` | `this` | Removes all listeners, moves a portaled panel back into the root, and clears the plugin's ARIA, classes and instance. |
| `isOpen` | `boolean` | A property, not a method: `true` while open. |



## Events

Both are jQuery events fired on the root, with the instance as the second argument. Listen with `.on()`.

| Event | When |
| - | - |
| `popover:open` | As the panel opens |
| `popover:close` | After the close animation |

```js
$('#share')
    .on('popover:open',  (e, pop) => console.log('opened', pop.$el.attr('id')))
    .on('popover:close', (e, pop) => console.log('closed'));
```

Mutual exclusion uses a jQuery event on `document`, `ts-popover-opened`, with the opening popover's internal id as its argument. You can listen to it with `$(document).on('ts-popover-opened', …)`; `addEventListener` does not see it.



## CSS Custom Properties

The panel's look is fixed values in the injected stylesheet:

| Property on `[data-popover-content]` | Value |
| - | - |
| `min-width` / `max-width` | `14rem` / `22rem` |
| `padding` | `1rem` |
| `background` | `#fff` |
| `border` | `1px solid rgba(0, 0, 0, 0.08)` |
| `border-radius` | `0.5rem` |
| `box-shadow` | `0 4px 6px -1px rgba(0,0,0,.07), 0 10px 15px -3px rgba(0,0,0,.10)` |
| `color` | `#1a1a2e` |
| `z-index` | `9995` |

The only custom properties are `--ts-pop-arrow-x` and `--ts-pop-arrow-y`, which the plugin writes itself.

Override with more specific selectors. The plugin's `<style>` is added at the end of `<head>`, so include an id or the root in your selector. Remember the arrow fill when changing the background:

```css
#share [data-popover-content]                          { background: #0e2238; color: #e2eaf4; max-width: 18rem; }
#share [data-popover-content].ts-pop-side-bottom::after { border-bottom-color: #0e2238; }
#share [data-popover-content].ts-pop-side-top::after    { border-top-color: #0e2238; }
```

With `portaling: true` the panel is a child of `<body>`, so select it by its own id or a class you give it, not through the root.

### Dark mode

`html.dark [data-popover-content]` switches to `var(--dark-300)` with a `var(--dark-rgba-50)` border, arrows included. There are no rules for `data-bs-theme="dark"` or `prefers-color-scheme`; add your own if your site uses them.

### Reduced motion

There is no reduced-motion rule. Turn the animations off:

```css
@media (prefers-reduced-motion: reduce) {
    [data-popover-content].ts-pop-in,
    [data-popover-content].ts-pop-out { animation: none; }
}
```



## Keyboard Navigation

| Key | Action |
| - | - |
| `Enter` / `Space` on the trigger | Toggles the popover (it is a button). |
| `Tab` | Moves through the panel. With `modal: true` it wraps from the last focusable element to the first; otherwise it leaves the panel. |
| `Shift` + `Tab` | Backwards; wraps with `modal: true`. |
| `Escape` | Closes and returns focus to the trigger. |

Focus moves into the panel on open. Without `modal`, tabbing out of the panel leaves it open; it closes on the next outside click.



## ARIA Wiring

```
[button data-popover-trigger]
    aria-haspopup="dialog"
    aria-expanded="false | true"
    aria-controls="{panel id}"

[div data-popover-content]
    id="pop-content-{n}-{rand}"       when it had none
    role="dialog"
    aria-modal="false | true"         from the modal option
    aria-labelledby="{title id}"      when [data-popover-title] exists
```

Give panels without a visible title an `aria-label`.



## Recipes

### Help icon

```html
<div data-plugin-popover data-plugin-options='{"side": "top", "align": "center"}'>
    <button type="button" data-popover-trigger class="btn btn-sm btn-link" aria-label="Help">
        <i class="fas fa-question-circle"></i>
    </button>
    <div data-popover-content aria-label="Help">
        <p class="mb-0">Use an ISO 8601 date, such as 2026-12-31.</p>
    </div>
</div>
```

### Inside a scrolling table

```html
<div class="table-responsive">
    …
    <div data-plugin-popover data-plugin-options='{"portaling": true, "side": "left"}'>
        <button type="button" data-popover-trigger>Actions</button>
        <div data-popover-content>…</div>
    </div>
</div>
```

### A form that keeps focus inside

```html
<div data-plugin-popover id="rename" data-plugin-options='{"modal": true}'>
    <button type="button" data-popover-trigger>Rename</button>
    <div data-popover-content>
        <h4 data-popover-title class="h6">Rename file</h4>
        <input class="form-control mb-2" value="report.pdf">
        <button type="button" class="btn btn-primary btn-sm" id="rename-save">Save</button>
    </div>
</div>
```

```js
$('#rename-save').on('click', function () {
    save();
    $('#rename').data('__pluginPopover').close();
});
```

### Content that loads after opening

```js
$('#profile').on('popover:open', async function (e, pop) {
    const html = await fetch('/profile/card').then(r => r.text());
    pop.$content.html(html);
    pop.update();
});
```



## Common Pitfalls

### Clicks inside the panel do not reach document handlers

The panel stops click propagation so that clicking inside it does not count as an outside click. As a side effect, delegated handlers on `document` (such as `$(document).on('click', '.copy-btn', …)`) never see clicks inside a popover. Bind handlers to the panel or its children directly.

### The panel is clipped

An ancestor with `overflow: hidden`, `overflow: auto` or `clip` cuts the panel off. Use `portaling: true`.

### Styles set on the root do not reach a portaled panel

A portaled panel lives in `<body>` from init onward, so it no longer inherits from the root or its ancestors. Style it through its own id or class.

### The panel opens on the wrong side

The flip uses a fixed 200 px threshold rather than measuring the panel. Pick the side with the most room for that spot, or call `update()` after layout changes.

### `isOpen()` throws "not a function"

`isOpen` is a property. Use `pop.isOpen`.

### Options from older notes do nothing

`closeOnOutsideClick` and `dark` do not exist. Use `closeOnOutside`, and `html.dark` for dark panels.

### Removing a portaled popover leaves its panel behind

Call `destroy()` before removing the root. It moves the panel back into the root, so it is removed with it.

### Diagnostic checklist

- [ ] `<style id="ts-popover-styles">` is in `<head>` after init.
- [ ] `$('#id').data('__pluginPopover')` returns an instance.
- [ ] `[data-popover-content]` is inside the root.
- [ ] `aria-expanded` toggles on the trigger when clicked.
- [ ] Clipped panels use `portaling: true`.
- [ ] Options use the real names (`closeOnOutside`, `modal`).
- [ ] Event listeners use jQuery `.on()`.
