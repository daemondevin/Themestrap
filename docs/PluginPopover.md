# Popover Guide

Accessible, anchor-positioned popovers. Mount a `[data-plugin-popover]` wrapper around any trigger and content panel and the plugin handles position math, viewport flip, CSS arrows, side-aware animations, Escape / click-outside dismissal, ARIA wiring, mutual exclusion, and optional `<body>` portaling for escaped overflow contexts.

## [How It **Works**](#how-it-works)

The plugin owns a two-element contract: a *trigger* (any focusable element) and a *content panel* (arbitrary HTML). On open it makes the panel visible, runs position math relative to the trigger, applies the correct side CSS class, and starts the entrance animation. On close it reverses all of that.

#### Closed state

> `[data-popover-content]` has `display: none` and `pointer-events: none`. No `top`/`left` is set yet — positioning only happens on open so there is no flash of misplaced content.
> 
> - Trigger: `aria-expanded="false"`
> - Panel: `display: none; pointer-events: none`
> - No CPU cost from scroll/resize listeners (listeners exist but short-circuit)

#### Open state

> Panel gets `.ts-pop-visible` (`display: block`), position is calculated, the resolved side class (`.ts-pop-side-bottom` etc.) and the entrance animation class are applied. The first focusable element inside the panel receives focus.
> 
> - Trigger: `aria-expanded="true"`
> - Panel: `.ts-pop-visible .ts-pop-side-{side}`
> - `scroll`/`resize` -> `_position()` keeps panel locked

### Position pipeline

1. Flip check

> Before measuring anything, `resolvedSide()` checks whether the preferred side has at least 200 px of viewport space. If not, it flips to the opposite side — `top ↔ bottom`, `left ↔ right`. The resolved side drives both layout and animation.

2. Measure

> The trigger's `outerWidth()` / `outerHeight()` and the panel's `outerWidth()` / `outerHeight()` are read after the panel is visible (`.ts-pop-visible`) so measurements are accurate.

3. Compute offsets

> The `computePosition()` helper (or `computePortaledPosition()` when `portaling: true`) returns `{ top, left, arrowOffset }`. Standard mode positions relative to the wrapper; portaled mode adds scroll offsets and positions relative to the document.

4. Apply &amp; animate

> Side class is set on the panel, `top`/`left` are applied via `.css()`, the arrow `::before`/`::after` offset is injected as a scoped `<style>`, and the entrance animation class fires.

#### Mutual exclusion

Every open popover listens for the custom event `ts-popover-opened` fired on `document`. When any other popover opens, every currently-open one closes automatically — same UX as a native `<select>` or shadcn's Popover primitive.

## [Quick **Start**](#quick-start)

#### Minimal markup

Everything inside one wrapper element. No IDs required:

```html
<div data-plugin-popover>
  <button data-popover-trigger type="button">Open settings</button>
  <div data-popover-content>
    <h4 data-popover-title>Settings</h4>
    <p>Manage your account preferences here.</p>
    <button class="btn btn-sm btn-primary">Save</button>
  </div>
</div>
```

#### Include the plugin

```html
<script src="js/themestrap.js"></script>
<script src="js/themestrap.plugin.popover.js"></script>
```

#### Auto-init wiring (themestrap.init.js)

```javascript
if ($.isFunction($.fn['themestrapPluginPopover']) && $('[data-plugin-popover]').length) {
    $(() => {
        $('[data-plugin-popover]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginPopover(opts);
        });
    });
}
```

#### Passing options inline

```html
<div data-plugin-popover
     data-plugin-options='{"side":"top","align":"center","arrow":true}'>
  ...
</div>
```

> [!NOTE]
> **No build step, no extra dependencies.** The plugin injects its CSS once per page via a `<style id="ts-popover-styles">` tag — you do not need to import a separate stylesheet.

## [Markup **Reference**](#markup)

#### Core anatomy

Three attributes define the contract:

```html
<!-- Root wrapper — plugin attaches here -->
<div data-plugin-popover data-plugin-options='{"side":"bottom","align":"start"}'>
    <!-- Trigger: any focusable element -->
    <button data-popover-trigger type="button"> Open </button>
    <!-- Content: shown/hidden by the plugin -->
    <div data-popover-content>
        <h4 data-popover-title>Popover heading</h4>
        <p>Your content here.</p>
    </div>
</div>
```

#### Remote trigger (separate DOM positions)

When the trigger and panel cannot share a parent (e.g. the trigger is inside a table cell), connect them by pointing the trigger's attribute at the popover's `id`:

```html
<!-- Trigger sits elsewhere in the DOM -->
<button data-popover-trigger="user-pop">Options</button>
<!-- Panel has the matching id -->
<div data-plugin-popover id="user-pop" data-plugin-options='{"side":"right","portaling":true}'>
    <div data-popover-content>…</div>
</div>
```

> [!NOTE]
> Use `portaling: true` with remote triggers — the content element is moved to `<body>` so it escapes any `overflow: hidden` parent. The plugin restores it to its original parent on `destroy()`.

#### Title element

Adding `[data-popover-title]` inside the content panel automatically wires `aria-labelledby` from the dialog role to the title. Without it the panel still works, but screen readers have nothing to announce as the dialog label.

#### ARIA wiring — what the plugin sets

| Element                  | Attribute         | Value                                     |
|--------------------------|-------------------|-------------------------------------------|
| `[data-popover-trigger]` | `aria-haspopup`   | `"dialog"`                                |
| `[data-popover-trigger]` | `aria-expanded`   | `"true"` / `"false"`                      |
| `[data-popover-trigger]` | `aria-controls`   | auto-generated content panel ID           |
| `[data-popover-content]` | `role`            | `"dialog"`                                |
| `[data-popover-content]` | `aria-modal`      | `"true"` when `modal: true`               |
| `[data-popover-content]` | `aria-labelledby` | ID of `[data-popover-title]` (if present) |

## [Configuration **Options**](#options)

Options merge: `PluginPopover.defaults -> opts argument -> data-plugin-options JSON`. Later wins.

#### Position &amp; layout

| Key         | Type   | Default    | Description                                                                                                            |
|-------------|--------|------------|------------------------------------------------------------------------------------------------------------------------|
| `side`      | string | `"bottom"` | Preferred side: `top`, `bottom`, `left`, `right`. Auto-flips if the viewport lacks space.                              |
| `align`     | string | `"start"`  | Alignment on the cross axis: `start`, `center`, `end`.                                                                 |
| `offset`    | number | `8`        | Gap in pixels between the trigger edge and the popover panel.                                                          |
| `portaling` | bool   | `false`    | Move `[data-popover-content]` to `<body>` on init so it escapes `overflow: hidden` ancestors. Restored on `destroy()`. |

#### Arrow

| Key     | Type | Default | Description                                                                                             |
|---------|------|---------|---------------------------------------------------------------------------------------------------------|
| `arrow` | bool | `true`  | Show a pointing CSS arrow (`::before` / `::after` pseudo-elements). Position tracks the trigger centre. |

#### Dismiss behaviour

| Key              | Type | Default | Description                                                          |
|------------------|------|---------|----------------------------------------------------------------------|
| `closeOnEscape`  | bool | `true`  | Press `Esc` to close. Focus returns to the trigger.                  |
| `closeOnOutside` | bool | `true`  | Click anywhere outside the panel (and outside the trigger) to close. |

#### Animation

| Key                 | Type   | Default        | Description                                                                                                |
|---------------------|--------|----------------|------------------------------------------------------------------------------------------------------------|
| `animationIn`       | string | `"ts-pop-in"`  | CSS class added to the panel when opening. The plugin ships side-aware keyframes; swap for your own class. |
| `animationOut`      | string | `"ts-pop-out"` | CSS class added to the panel when closing. Applied until `animationend` fires.                             |
| `animationDuration` | number | `200`          | Fallback ms to force-end the animation if `animationend` never fires.                                      |

#### Modal / focus trap

| Key     | Type | Default | Description                                                                                                      |
|---------|------|---------|------------------------------------------------------------------------------------------------------------------|
| `modal` | bool | `false` | Trap Tab focus inside the panel while open. Sets `aria-modal="true"`. Use when the popover contains a full form. |

#### Callbacks

| Key       | Type     | Default | Description                                                        |
|-----------|----------|---------|--------------------------------------------------------------------|
| `onOpen`  | function | `null`  | Called after open animation starts. `this` is the plugin instance. |
| `onClose` | function | `null`  | Called after close animation ends. `this` is the plugin instance.  |

#### Side + align grid

Nine usable combinations (4 sides × 3 alignments, minus same-axis redundancy):

| side     | align: start                 | align: center            | align: end                      |
|----------|------------------------------|--------------------------|---------------------------------|
| `bottom` | left-aligned under trigger   | centred under trigger    | right-aligned under trigger     |
| `top`    | left-aligned above trigger   | centred above trigger    | right-aligned above trigger     |
| `right`  | top-aligned right of trigger | vertically centred right | bottom-aligned right of trigger |
| `left`   | top-aligned left of trigger  | vertically centred left  | bottom-aligned left of trigger  |

## [Public **API**](#api)

#### Accessing the instance

```javascript
// jQuery adapter — creates on first call, returns existing instance thereafter
const pop = $('#my-popover').themestrapPluginPopover({ side: 'top' });
 
// Direct data access (after init)
const pop = $('#my-popover').data('__pluginPopover');
```

#### Instance methods

| Method      | Returns | Description                                                                                                                         |
|-------------|---------|-------------------------------------------------------------------------------------------------------------------------------------|
| `open()`    | this    | Show the popover. No-op if already open. Positions, animates, fires `onOpen`, and dispatches `ts-popover-opened` to close siblings. |
| `close()`   | this    | Dismiss the popover. Animates out, then fires `onClose`.                                                                            |
| `toggle()`  | this    | Open if closed, close if open.                                                                                                      |
| `update()`  | this    | Recompute and re-apply position without closing. Call after programmatically resizing the trigger or content.                       |
| `destroy()` | this    | Remove all events, restore aria attributes, move portaled content back, remove instance data. The DOM is left intact.               |

#### jQuery events

Both events bubble from `[data-plugin-popover]`:

```javascript
$('#my-popover')
  .on('popover:open',  (e, instance) => console.log('opened', instance))
  .on('popover:close', (e, instance) => console.log('closed', instance));
```

#### Global broadcast event

When any popover opens it triggers the mutual-exclusion broadcast on `document`. You can listen to it directly to build custom coordination logic:

```javascript
$(document).on('ts-popover-opened', (e, uid) => {
    console.log('A popover opened with uid:', uid);
});
```

## [Portal **Mode**](#portaling)

By default the plugin positions the content panel relative to its CSS `position: relative` wrapper. This breaks whenever an ancestor has `overflow: hidden`, `overflow: scroll`, or creates a new stacking context — common inside sidebars, table cells, scrollable containers, and Bootstrap modals.

#### Enabling portaling

```html
<div data-plugin-popover data-plugin-options='{"portaling":true}'>
  <button data-popover-trigger>Trigger</button>
  <div data-popover-content>Panel</div>
</div>
```

When `portaling: true`:

1. `build()` — move to body

The content panel is removed from its original parent and appended to `<body>`. The original parent is cached in `self.$contentOriginalParent`.

2. `_position()` — absolute page coords

`computePortaledPosition()` reads the trigger's `getBoundingClientRect()` and adds `window.scrollY` / `scrollX` to get document-absolute `top` and `left`. The panel's `position` must be `absolute` (the injected CSS ensures this).

3. `destroy()` — restore

The panel is moved back to `$contentOriginalParent` before any DOM cleanup. Listeners and attributes are then stripped normally.

> [!WARNING]
> **Portaling + `z-index`.**  
> The injected stylesheet sets `z-index: 9995` on the content panel — above Bootstrap modals (1055) and tooltips (1080). If your page has even higher stacking contexts, override: `[data-popover-content] { z-index: 10000; }`.

## [Dark **Mode**](#dark-mode)

The plugin's injected stylesheet includes an `html.dark` selector block that reads Porto/Themestrap CSS custom properties. `PluginDarkMode` adds the `dark` class to `<html>` — no extra configuration required.

```css
/* Injected stylesheet — dark overrides */
html.dark [data-popover-content] {
    background: var(--dark-300);
    color: var(--default);
    border-color: var(--dark-rgba-50);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.3), …;
}
 
/* Arrow colours per side */
html.dark [data-popover-content].ts-pop-side-bottom::after  { border-bottom-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-bottom::before { border-bottom-color: var(--dark-rgba-50); }
```

> [!NOTE]
> The variables `--dark-300`, `--default`, and `--dark-rgba-50` are defined by Themestrap's skin CSS (`skins/default.css`). Define these variables yourself or override the selector to use literal colors.

## [Recipe **Cookbook**](#recipes)

Drop-in patterns for common popover use-cases.

Profile card

```html
<div data-plugin-popover>
  <button data-popover-trigger class="btn btn-sm btn-outline-secondary">
    Alex Mercer
  </button>
  <div data-popover-content style="min-width:200px">
    <h4 data-popover-title>Alex Mercer</h4>
    <p class="text-muted mb-1">Senior Engineer</p>
    <a href="mailto:alex@example.com" class="btn btn-sm btn-primary">
      Email
    </a>
  </div>
</div>
```

Tooltip-style, centred above

```html
<div data-plugin-popover
     data-plugin-options='{"side":"top","align":"center","arrow":true}'>
  <button data-popover-trigger class="btn btn-sm btn-dark">
    Help
  </button>
  <div data-popover-content>
    <p>Click to expand the section below.</p>
  </div>
</div>Copy
```

Settings panel, right of icon

```html
<div data-plugin-popover
     data-plugin-options='{"side":"right","align":"start","arrow":false}'>
  <button data-popover-trigger class="btn btn-icon">
    <i class="fas fa-gear"></i>
  </button>
  <div data-popover-content style="min-width:260px">
    <h4 data-popover-title>Display settings</h4>
    <label class="form-check">
      <input type="checkbox" class="form-check-input"> Compact view
    </label>
    <label class="form-check">
      <input type="checkbox" class="form-check-input" checked> Show avatars
    </label>
  </div>
</div>
```

Form inside a focus-trapped popover

```html
<div data-plugin-popover
     data-plugin-options='{"side":"bottom","modal":true,"closeOnOutside":false}'>
  <button data-popover-trigger class="btn btn-primary">Add tag</button>
  <div data-popover-content style="min-width:280px">
    <h4 data-popover-title>New tag</h4>
    <input type="text" class="form-control form-control-sm mb-2"
           placeholder="Tag name" id="new-tag-input">
    <div class="d-flex gap-2">
      <button class="btn btn-sm btn-primary">Create</button>
      <button class="btn btn-sm btn-outline-secondary"
              onclick="$(this).closest('[data-plugin-popover]')
                             .data('__pluginPopover').close()">
        Cancel
      </button>
    </div>
  </div>
</div>
```

Inside overflow:hidden sidebar

```html
<!-- Trigger inside a constrained sidebar -->
<div style="overflow:hidden; height:48px; position:relative">
  <div data-plugin-popover
       data-plugin-options='{"portaling":true,"side":"bottom"}'>
    <button data-popover-trigger class="btn btn-sm">More</button>
    <div data-popover-content>
      <p>This panel escapes the overflow boundary.</p>
    </div>
  </div>
</div>
```

Trigger outside the wrapper

```html
<!-- Trigger in a table row -->
<td>
  <button data-popover-trigger="row-42-pop" class="btn btn-xs btn-link">
    Details
  </button>
</td>
 
<!-- Panel anywhere in the DOM -->
<div data-plugin-popover id="row-42-pop"
     data-plugin-options='{"side":"left","portaling":true}'>
  <div data-popover-content>
    <h4 data-popover-title>Row 42</h4>
    <p>Additional row metadata here.</p>
  </div>
</div>
```

Open / close from JS

```javascript
const pop = $('#settings-pop').data('__pluginPopover');
 
// Open after a delay
setTimeout(() => pop.open(), 1000);
 
// Close on custom event
$(document).on('settings:saved', () => pop.close());
 
// Reposition if content changes dynamically
$('#settings-pop [data-popover-content]')
  .find('.dynamic-section')
  .html(newContent);
pop.update();  // recalculate height
```

Lazy-load content on open

```javascript
$('#data-pop').themestrapPluginPopover({
  side:    'bottom',
  onOpen:  function () {
    const $content = this.$content;
    if ($content.data('loaded')) return;
    $content.find('.loading').show();
    fetch('/api/widget-data')
      .then(r => r.json())
      .then(data => {
        $content.find('.loading').hide();
        $content.find('.body').text(data.summary);
        $content.data('loaded', true);
        this.update();  // reposition after content grows
      });
  }
});
```

## [Common **Pitfalls**](#pitfalls)

#### Panel clipped by `overflow: hidden`

> [!WARNING]
> If the popover panel is partially or fully invisible and the trigger is inside a scrollable or `overflow: hidden` container, enable `portaling: true`. The panel is moved to `<body>` and positioned with absolute document coordinates, bypassing the overflow boundary.

#### "No \[data-popover-content] found" warning

> [!NOTE]
> The plugin logs a console warning and returns early if it can’t find `[data-popover-content]` inside the wrapper. Check that the element exists in the DOM at init time and that the attribute name is spelled correctly (no typos, no extra whitespace).

#### Popover always appears in the wrong corner

> [!NOTE]
> `computePosition()` measures against the wrapper’s coordinate space (because the wrapper is `position: relative`). If something in CSS overrides that (`position: static` forced by a utility class, or a parent with `transform` that shifts the containing block), the origin shifts. Inspect the wrapper’s computed style and ensure it stays `position: relative`.

#### Popover renders behind other elements

> [!NOTE]
> The injected style sets `z-index: 9995`. If your layout has a fixed navbar, modal, or offcanvas at a higher index, increase it: `[data-popover-content] { z-index: 10000; }`. With `portaling: true` the panel is a direct child of `<body>` so stacking context issues are rare.

#### Dark mode arrow colours wrong

> [!NOTE]
> The dark mode arrow colours use `var(--dark-300)` and `var(--dark-rgba-50)`. These are Porto skin variables. Outside of Porto, define them on `:root` or override the `html.dark [data-popover-content].ts-pop-side-*` rules with literal colour values.

#### Portaled panel left in `<body>` after destroy

> [!NOTE]
> The plugin stores `$contentOriginalParent` during `build()` and moves the panel back in `destroy()`. If you manually move the panel between init and destroy, update `instance.$contentOriginalParent` to point to the new parent, or the restored node will land in the wrong place.

### **Quick diagnostic checklist**

> - Is `[data-popover-content]` a direct child of `[data-plugin-popover]` (or of `<body>` if portaled)?
> - Is jQuery loaded before `themestrap.plugin.popover.js`?
> - Does `$('[data-plugin-popover]').data('__pluginPopover')` return an instance object?
> - Is `aria-expanded` toggling on the trigger when you click it? If not, events are not wired.
> - Is the panel visible in the DOM (DevTools Element panel) but not on screen? Check `z-index` and `overflow`.
> - Does the panel appear at 0,0 (top-left)? The wrapper is probably not `position: relative` — enable `portaling: true` instead.
> - Does the panel jump during animation? `outerWidth()`/`outerHeight()` returned 0. Ensure the panel is measurable when `.ts-pop-visible` is set.
  
