# Accordion Guide

A true multi-item accordion: a group of disclosure rows where, by default, only one panel is open at a time. Height-animated, keyboard accessible, and ARIA-wired.

## [How It **Works**](#how-it-works)

PluginAccordion turns a group of disclosure rows into a single coordinated unit. It is the *group* counterpart to PluginCollapsible (which manages one standalone panel): Accordion owns the open/close relationship between siblings, so by default opening one row closes the others.

### Group coordination

Manages a set of `[data-accordion-item]` rows. In `exclusive` mode it tracks the single open index and closes the previous panel before opening the next. In non-exclusive mode every row is an independent toggle.

### Height animation

Each panel is wrapped in a measuring shell. On open it animates from `0` to the panel's measured height, then clears the inline height so the panel reflows naturally. Honors `prefers-reduced-motion`.

### Markup the plugin expects

Give it a wrapper with `data-plugin-accordion` and one `[data-accordion-item]` per row. Each item needs a trigger and a panel. The plugin injects a CSS-drawn chevron if you do not supply one.

Accordion markup

```xml
<div data-plugin-accordion data-plugin-options='{"exclusive": true, "openIndex": 0}'>
  <div data-accordion-item>
    <button type="button" data-accordion-trigger>What is Themestrap?</button>
    <div data-accordion-panel>
      <p>A jQuery + Bootstrap component library for MODX 3.</p>
    </div>
  </div>
  <div data-accordion-item>
    <button type="button" data-accordion-trigger>How are panels animated?</button>
    <div data-accordion-panel>
      <p>Each panel animates 0 to its measured height, then hands off to CSS.</p>
    </div>
  </div>
</div>
```

All CSS is injected once, lazily.

On the first `build()` the plugin appends a single `<style id="ts-accordion-styles">` tag to the head. Loading the script never adds styles to pages that do not use it, and additional accordions on the same page reuse the one stylesheet.

## [Markup **Contract**](#markup-contract)

Resolution is forgiving — the plugin falls back through several selectors so existing markup usually works untouched.

| Hook                       | Resolved from                                                                       | Notes                                                    |
|----------------------------|-------------------------------------------------------------------------------------|----------------------------------------------------------|
| `[data-accordion-item]`    | Direct children of the wrapper                                                      | One per row. Extra classes are preserved.                |
| `[data-accordion-trigger]` | Falls back to the first `<button>`, `<a>`, or `[data-accordion-header]` in the item | Non-button triggers get `role="button"` + `tabindex`.    |
| `[data-accordion-panel]`   | Falls back to `[data-accordion-content]`, else the trigger's next sibling           | Wrapped in a measuring shell for the height transition.  |
| `[data-accordion-icon]`    | Injected if absent                                                                  | CSS-drawn caret rotated on open — no icon font required. |

Full keyboard + ARIA support is automatic.

Triggers receive `aria-expanded` and `aria-controls`; panels get `role="region"` and `aria-labelledby`. Arrow Up / Down move focus between headers, Home / End jump to the first / last, and Enter / Space toggle.

## [Configuration **Options**](#options)

Set options via the `data-plugin-options` JSON attribute on the wrapper, or as the argument to the jQuery method. The `tsAccordion` snippet emits only the non-default values it was given.

| Property      | Type                  | Default                         | Description                                                                             |
|---------------|-----------------------|---------------------------------|-----------------------------------------------------------------------------------------|
| `exclusive`   | bool                  | `true`                          | Only one panel open at a time. Set `false` for an independent multi-toggle.             |
| `collapsible` | bool                  | `true`                          | In exclusive mode, allow the open panel to be closed so all rows can be shut.           |
| `openIndex`   | number\|array\|string | `0`                             | Which item(s) start open: a 0-based index, an array like `[0,2]`, `'all'`, or `'none'`. |
| `duration`    | string\|number        | `"320ms"`                       | Height transition time — any CSS `<time>` string or a millisecond number.               |
| `easing`      | string                | `"cubic-bezier(.16, 1, .3, 1)"` | CSS timing function for the transition.                                                 |
| `iconRotate`  | number                | `180`                           | Chevron rotation when open, in degrees.                                                 |
| `flush`       | bool                  | `false`                         | Edge-to-edge style — drops the outer card border and radius.                            |
| `disabled`    | bool                  | `false`                         | Render the whole accordion inert.                                                       |

## [Instance **API**](#instance-api)

Every initialized accordion exposes its instance under `$el.data('__accordion')`.

| Method              | Returns   | Description                                                        |
|---------------------|-----------|--------------------------------------------------------------------|
| `open(i)`           | this      | Open item `i`. In exclusive mode, closes whichever panel was open. |
| `close(i)`          | this      | Close item `i`.                                                    |
| `toggle(i)`         | this      | Invert the state of item `i`.                                      |
| `openAll()`         | this      | Open every item (no-op beyond the first in exclusive mode).        |
| `closeAll()`        | this      | Close every item.                                                  |
| `openedIndexes()`   | number\[] | Array of currently-open 0-based indices.                           |
| `setDisabled(bool)` | this      | Toggle the inert state at runtime.                                 |
| `refresh()`         | this      | Re-scan items after the DOM changes (rows added / removed).        |
| `destroy()`         | this      | Restore the original markup and remove namespaced events.          |

Programmatic control

```javascript
var acc = $('#faq').data('__accordion');
acc.open(2);              // open the third row
acc.toggle(1);            // flip the second
console.log(acc.openedIndexes());  // -> [2]
acc.refresh();            // after injecting new rows
```

## [Event **Lifecycle**](#events)

All events are namespaced `.ts.accordion` and bubble from the wrapper. The `open`/`close` pair fire as the animation starts; `opened`/`closed` fire after it finishes.

| Event                 | Arguments                   | Fires                                                                  |
|-----------------------|-----------------------------|------------------------------------------------------------------------|
| `ready.ts.accordion`  | `(e, instance)`             | Once, after init.                                                      |
| `open.ts.accordion`   | `(e, index, $item)`         | An open animation begins.                                              |
| `opened.ts.accordion` | `(e, index, $item)`         | The open animation completes.                                          |
| `close.ts.accordion`  | `(e, index, $item)`         | A close animation begins.                                              |
| `closed.ts.accordion` | `(e, index, $item)`         | The close animation completes.                                         |
| `change.ts.accordion` | `(e, index, isOpen, $item)` | Any state change — listen here if you only care about the final state. |

Listening for state changes

JAVASCRIPT

```javascript
$('#faq')
  .on('opened.ts.accordion', function (e, i, $item) {
    console.log('opened row', i);
  })
  .on('change.ts.accordion', function (e, i, isOpen) {
    console.log('row', i, isOpen ? 'open' : 'closed');
  });
```

## [Recipe **Cookbook**](#recipes)

Common configurations. The first three are pure markup; the last drives the plugin from your own state.

#### Exclusive FAQ (default)
---
```ini
[[tsAccordion?
  &items=`[
    {"title":"Do you offer refunds?","content":"<p>Within 30 days, yes.</p>","open":true},
    {"title":"Is there a free trial?","content":"<p>14 days, no card required.</p>"},
    {"title":"How do I cancel?","content":"<p>From your dashboard, any time.</p>"}
  ]`
]]
```

#### Independent multi-open, all closed

* * *

```ini
[[tsAccordion?
  &exclusive=`0`
  &openIndex=`none`
  &items=`[ ... ]`
]]
```

#### Flush, edge-to-edge

* * *

```imi
[[tsAccordion?
  &flush=`1`
  &items=`[ ... ]`
]]
```

#### Drive it from your own UI

* * *

External controls

```javascript
var acc = $('#settings').themestrapPluginAccordion().data('__accordion');
 
$('#expand-all').on('click', function () { acc.openAll(); });
$('#collapse-all').on('click', function () { acc.closeAll(); });Copy
```

## [Init.js **Wiring**](#init-js)

Instead of a per-block init script, wire auto-init once in `themestrap.init.js` so every `[data-plugin-accordion]` on the page initializes when it nears the viewport.

```javascript
// themestrap.init.js — PluginAccordion auto-init
if ($.isFunction($.fn['themestrapPluginAccordion'])
    && $('[data-plugin-accordion]').length) {
    themestrap.fn.intObsInit(
        '[data-plugin-accordion]:not(.manual)',
        'themestrapPluginAccordion'
    );
}
```

Add the `.manual` class to any accordion you want to initialize yourself with custom options.

## [Common **Pitfalls**](#pitfalls)

- Don't put "display:none" on a panel.

- Height measurement reads `scrollHeight`, which is `0` for a `display:none` element — the open animation has nothing to grow into. The plugin's closed state already uses `height:0; overflow:hidden`, so let it manage visibility.

- Re-measure after injecting content.

- If you change a panel's contents after init (e.g. via Ajax), call `refresh()` so the next open uses a fresh measurement.
