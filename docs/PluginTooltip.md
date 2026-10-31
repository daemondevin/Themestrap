# PluginTooltip

Small text labels that appear next to an element on hover, keyboard focus or tap. They are positioned with JavaScript, flip to the other side when there is no room, stay inside the viewport, and are linked to their trigger for screen readers.

**File:** `js/components/themestrap.plugin.tooltip.js`  
**Demo:** `demos/plugin.demo.tooltip.html`  
**jQuery method:** `$.fn.themestrapPluginTooltip`  
**Data attribute:** `data-plugin-tooltip`  
**Instance key:** `__pluginTooltip`  
**Init strategy:** DOMReady `$().each()`



## How It Works

On `build()` the plugin:

1. Injects its stylesheet once (`<style id="ts-tooltip-styles">`).
2. Reads the content from the `content` option, falling back to the value of `data-plugin-tooltip`. With no content at all it stops here: no tooltip, no events.
3. Creates one `<div class="ts-tooltip-el" role="tooltip">` per trigger and appends it to `<body>`, so `overflow: hidden` or a stacking context on an ancestor can never clip it.
4. Sets `aria-describedby` on the trigger to the tooltip's id.
5. Adds `tabindex="0"` to triggers that cannot take focus (a `<span>`, say), so keyboard users can reach them.

The tooltip is `position: fixed`. Each time it shows, and on every window scroll or resize while visible, the plugin measures the trigger and places the tooltip on the preferred side. If that side lacks room it flips to the opposite one, then clamps the result 8 px inside the viewport. The arrow follows the side actually used through `data-tt-loc`.

### Triggers

| Input | Shows | Hides |
| - | - | - |
| Mouse | `mouseenter`, after the show delay | `mouseleave`, after the hide delay |
| Keyboard | `focus` | `blur` |
| Touch | First tap | Second tap, or a tap anywhere else |



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.tooltip.js"></script>
```

`themestrap.js` is required: the plugin calls `themestrap.fn.getOptions` itself to read `data-plugin-options`.

### 2. Mark it up

```html
<button data-plugin-tooltip="Save your work before continuing.">Save</button>
```

### 3. Initialize

`themestrap.init.js` initializes every `[data-plugin-tooltip]` on DOMReady, so including it is enough. Without `init.js`, use the same block on your page:

```js
if (typeof $.fn.themestrapPluginTooltip === 'function' && $('[data-plugin-tooltip]').length) {
    $(() => {
        $('[data-plugin-tooltip]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginTooltip(opts);
        });
    });
}
```

### Manual init

```html
<span id="tip" class="manual" data-plugin-tooltip="">Hover me</span>
```

```js
$('#tip').themestrapPluginTooltip({ content: 'Set from JavaScript', type: 'info', location: 'right' });
```



## Markup Reference

| Attribute | Role |
| - | - |
| `data-plugin-tooltip="text"` | Marks the trigger. The value is the tooltip text unless `content` is set. |
| `data-plugin-options` | JSON options. |
| `class="manual"` | Keeps auto-init away from this trigger. |

```html
<!-- text from the attribute -->
<button data-plugin-tooltip="Copy to clipboard">Copy</button>

<!-- a variant and a side -->
<span data-plugin-tooltip="Pro tip"
      data-plugin-options='{"type": "primary", "location": "bottom", "delay": [200, 0]}'>Hover me</span>

<!-- HTML content: the attribute can stay empty -->
<a href="#" data-plugin-tooltip=""
   data-plugin-options='{"content": "<strong>Bold</strong> tip", "html": true}'>Link</a>
```

### Generated markup

```html
<div id="ts-tt-1" class="ts-tooltip-el ts-tt-primary ts-tt-visible" role="tooltip"
     data-tt-loc="bottom" style="top: 212px; left: 340px;">
    <div class="ts-tooltip-inner">Pro tip</div>
    <span class="ts-tooltip-arrow" aria-hidden="true"></span>
</div>
```



## Configuration Options

Options can come from `data-plugin-options`, from the object passed to `themestrapPluginTooltip()`, or both; the object wins.

| Option | Type | Default | Description |
| - | - | - | - |
| `content` | `string` | `''` | The tooltip text. Falls back to the `data-plugin-tooltip` value. |
| `type` | `string` | `'default'` | Color variant: `default`, `primary`, `secondary`, `tertiary`, `quaternary`, `dark`, `light`, `success`, `warning`, `danger`, `info`. |
| `location` | `string` | `'top'` | Preferred side: `top`, `bottom`, `left` or `right`. Flips when there is no room. |
| `offset` | `number` | `8` | Gap in px between the trigger and the tooltip. |
| `arrow` | `boolean` | `true` | Draw the pointing arrow. |
| `html` | `boolean` | `false` | Insert `content` as HTML instead of text. Only use with content you control. |
| `maxWidth` | `number\|string` | `260` | Maximum width. A number is px; a string is any CSS length (`'20rem'`). |
| `delay` | `number\|array` | `[100, 0]` | `[show, hide]` delays in ms. A single number is used for both. |
| `onShow` | `function\|null` | `null` | Called after the tooltip shows. `this` is the instance. |
| `onHide` | `function\|null` | `null` | Called after it hides. `this` is the instance. |



## Public API

Read the instance from a fresh selection, never off the init call.

```js
$('#tip').themestrapPluginTooltip();
const tt = $('#tip').data('__pluginTooltip');
```

The bridge also takes string commands, so these are the same:

```js
tt.show();
$('#tip').themestrapPluginTooltip('show');
```

| Method | Returns | Description |
| - | - | - |
| `show()` | `this` | Shows now, skipping the delay. |
| `hide()` | `this` | Hides now. |
| `toggle()` | `this` | Shows or hides. |
| `update()` | `this` | Recomputes the position while visible. Call it after layout changes such as an accordion opening. |
| `setContent(content)` | `this` | Replaces the text (or HTML when `html: true`) and repositions if visible. |
| `destroy()` | `this` | Removes the tooltip element, all listeners, `aria-describedby`, and the `tabindex` the plugin added. |

`setContent()` with an argument is a method call only; the string bridge passes no arguments.



## Events

Both are **jQuery events** fired on the trigger with `.trigger()`, with the instance as the second argument. Listen with `.on()`; `addEventListener` does not receive them.

| Event | When |
| - | - |
| `tooltip:show` | After the tooltip becomes visible |
| `tooltip:hide` | After it is hidden |

```js
$('#tip').on('tooltip:show', function (e, tt) {
    tt.setContent('Last saved ' + timeAgo(lastSave));
});
```



## CSS Custom Properties

Each tooltip reads two tokens. They are declared on `.ts-tooltip-el` itself, and each variant class sets its own values, so override them on that element (setting them on `:root` has no effect).

| Token | Default | Used for |
| - | - | - |
| `--ts-tt-bg` | `rgba(0, 0, 0, 0.94)` | Background and arrow |
| `--ts-tt-color` | `var(--grey-500, #dbdbdb)` | Text |

Variants pull from the Themestrap palette when it is present (`--primary-rgba-90`, `--secondary-rgba-90` and so on) and fall back to fixed colors otherwise.

```css
/* every default tooltip; "body" lifts it over the plugin's rule
   but keeps it below the variant rules */
body .ts-tooltip-el {
    --ts-tt-bg:    #0e2238;
    --ts-tt-color: #e2eaf4;
}

/* one new variant: type: 'brand' adds .ts-tt-brand */
.ts-tooltip-el.ts-tt-brand { --ts-tt-bg: #20e2d7; --ts-tt-color: #0a1929; }
```

Any string works as `type`; the plugin adds `ts-tt-{type}` and leaves the styling to you.

Other fixed styles you may want to override on `.ts-tooltip-el`: `padding: 7px 13px`, `border-radius: 5px`, `font-size: 0.8125rem`, `text-align: center` and `z-index: 9999`.

### Dark mode

The default tooltip is already dark, and the variants are solid colors, so there are no dark-mode tiers. The `light` variant is the one to swap in a dark theme:

```css
html.dark .ts-tooltip-el.ts-tt-light,
[data-bs-theme="dark"] .ts-tooltip-el.ts-tt-light { --ts-tt-bg: #1e2939; --ts-tt-color: #f3f4f6; }
```

### Reduced motion

Under `prefers-reduced-motion: reduce` the scale animation is removed and the fade drops to 50 ms.



## Keyboard Navigation

| Key | Action |
| - | - |
| `Tab` onto the trigger | Shows the tooltip (after the show delay). |
| `Tab` away | Hides it. |

There is no Escape handling. If your tooltips can cover other content, add it yourself:

```js
$(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
        $('[data-plugin-tooltip]').each(function () {
            const tt = $(this).data('__pluginTooltip');
            if (tt) { tt.hide(); }
        });
    }
});
```



## ARIA Wiring

```
[trigger]
    aria-describedby="ts-tt-{n}"
    tabindex="0"                 only when the element could not take focus

<body>
    [div.ts-tooltip-el]  id="ts-tt-{n}"  role="tooltip"
        [div.ts-tooltip-inner]
        [span.ts-tooltip-arrow]  aria-hidden="true"
```

A tooltip describes its trigger; it does not name it. An icon-only button still needs its own `aria-label`:

```html
<button aria-label="Delete" data-plugin-tooltip="Delete this file"><i class="fa-solid fa-trash"></i></button>
```



## Recipes

### Live content

```js
const tt = $('#sync').data('__pluginTooltip');
setInterval(function () { tt.setContent('Synced ' + minutesAgo() + ' min ago'); }, 60000);
```

### Explain a disabled button

Disabled buttons fire no mouse events, so put the tooltip on a wrapper:

```html
<span data-plugin-tooltip="Add a title first" class="d-inline-block">
    <button class="btn btn-primary" disabled style="pointer-events: none;">Publish</button>
</span>
```

### Reposition after layout changes

```js
$('#settings').on('opened.ts.accordion', function () {
    $(this).find('[data-plugin-tooltip]').each(function () {
        const tt = $(this).data('__pluginTooltip');
        if (tt) { tt.update(); }
    });
});
```

### Tooltips added after page load

```js
const $row = $(renderRow(data)).appendTo('#table tbody');
$row.find('[data-plugin-tooltip]').themestrapPluginTooltip();
```

Destroy them before removing the row, or their tooltip elements stay in `<body>`.



## Common Pitfalls

### Nothing shows

The tooltip is only built when there is content. An empty `data-plugin-tooltip=""` with no `content` option creates nothing, and a later `setContent()` does nothing either. Give it placeholder text if the real content arrives later.

### Theme tokens on `:root` are ignored

`--ts-tt-bg` and `--ts-tt-color` are declared on `.ts-tooltip-el`, which beats anything inherited. Target `body .ts-tooltip-el` or a variant class. The plugin's stylesheet is injected at the end of `<head>` on first use, so a plain `.ts-tooltip-el` rule in your own stylesheet loses on order.

### `addEventListener('tooltip:show')` never fires

The events come from jQuery's `.trigger()`. Use `.on()`.

### HTML shows up as text

Set `html: true`. Without it, content is inserted with `.text()`.

### Tooltip elements pile up in `<body>`

Each trigger owns one element in `<body>`. Removing a trigger from the page does not remove it; call `destroy()` first.

### The tooltip cannot be hovered

The tooltip has `pointer-events: none`, so moving the pointer onto it counts as leaving the trigger. Do not put links or buttons in a tooltip; use PluginPopover or PluginHoverCard for interactive content.

### Diagnostic checklist

- [ ] `themestrap.js` loads before the plugin, and both after jQuery.
- [ ] The trigger has content, from the attribute or the `content` option.
- [ ] `themestrap.init.js` is loaded after the plugin, or the trigger is initialized by hand (always, when it has `.manual`).
- [ ] HTML content uses `html: true`, and only with content you control.
- [ ] Color overrides target `body .ts-tooltip-el` or a variant class.
- [ ] Event listeners use jQuery `.on()`.
- [ ] Triggers removed from the page are destroyed first.
