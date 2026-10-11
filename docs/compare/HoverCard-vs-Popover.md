# `PluginHoverCard` vs `PluginPopover`

Both plugins create positioned floating content panels attached to a trigger, support four placement directions, alignment, arrows, portaling, auto-flipping, animation, and repositioning on scroll/resize.

Beyond that shared positioning infrastructure, they are intended for fundamentally different interaction models.

`PluginHoverCard` is a **hover/focus preview component**: it opens after a configurable delay, stays open while the pointer moves into the card, and is primarily suited to profile previews, link previews, contextual information, and lightweight hover content.

`PluginPopover` is an **interactive click-controlled disclosure component**: it opens and closes explicitly, supports Escape and outside-click dismissal, manages focus, can act as a modal-like focus trap, and treats its content as a `dialog`.

This document maps out the meaningful architectural, behavioral, accessibility, API, and lifecycle differences so the two plugins can be selected based on the interaction required rather than their similar visual appearance.

---

## One-line summary

| Plugin                | What it does                                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`PluginHoverCard`** | Opens a preview card from mouse hover or keyboard focus, with configurable open/close delays, hover persistence, side-aware animation, auto-flip, and optional portaling.         |
| **`PluginPopover`**   | Opens an interactive popover from a click trigger, with outside-click/Escape dismissal, optional modal focus trapping, mutual exclusion, and explicit open/close/toggle controls. |

The distinction is therefore primarily **interaction semantics**, not positioning technology. Both plugins use essentially the same positioning model and auto-flip strategy.

---

## Trigger and interaction model

This is the most important difference between the two plugins.

### `PluginHoverCard` — hover and focus driven

`PluginHoverCard` listens for four trigger events:

* `mouseenter` → schedule show
* `mouseleave` → schedule hide
* `focus` → schedule show
* `blur` → schedule hide

It also listens for `mouseenter` and `mouseleave` on the card itself so the user can move the pointer from the trigger into the card without immediately closing it.

The delays are independently configurable:

```js
delay: [200, 300]
```

The first value controls opening and the second controls closing. A single number is converted into the same value for both.

This makes the HoverCard appropriate for interactions where the card should appear as a consequence of **looking at or focusing something**, rather than explicitly activating it.

### `PluginPopover` — click driven

`PluginPopover` does not use hover as its activation mechanism.

The trigger receives a click handler that:

1. Prevents the trigger's default action.
2. Stops propagation.
3. Calls `toggle()`.

```js
self.$trigger.on(`click.popover.${self._uid}`, function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.toggle();
});
```

This makes the Popover appropriate for content that the user explicitly opens and interacts with, such as:

* settings panels
* menus
* forms
* action controls
* contextual controls
* interactive information

The click model also means a trigger that would normally navigate — such as an `<a href>` — has its default navigation suppressed while the popover is active.

---

## Delay behavior

|                    | `PluginHoverCard` | `PluginPopover` |
| ------------------ | ----------------- | --------------- |
| Open delay         | ✓                 | ✗               |
| Close delay        | ✓                 | ✗               |
| Configurable delay | `delay`           | None            |
| Hover persistence  | ✓                 | Not applicable  |
| Focus opens        | ✓                 | ✗               |
| Click opens        | Not directly      | ✓               |

### Why the HoverCard needs delays

A hover component without a delay would appear and disappear whenever the pointer briefly crossed the trigger.

The HoverCard therefore maintains separate show and hide timers:

```js
_showTimer
_hideTimer
```

Entering the trigger cancels the pending hide and schedules a show; leaving cancels the pending show and schedules a hide.

This also gives the user time to move the pointer into the card itself.

### Why the Popover doesn't

A click is already an explicit activation event. The Popover therefore opens immediately and relies on explicit dismissal mechanisms rather than hover timing.

---

## DOM structure

### `PluginHoverCard`

The intended structure is:

```html
<div data-plugin-hovercard>
    <a data-hovercard-trigger href="#">
        @daemon_devin
    </a>

    <div data-hovercard-content>
        ...
    </div>
</div>
```

The trigger can alternatively exist elsewhere in the DOM and reference the HoverCard by its ID.

The plugin stores the content's original parent so that portaled content can later be restored.

### `PluginPopover`

The normal structure is:

```html
<div data-plugin-popover>
    <button data-popover-trigger>
        Open
    </button>

    <div data-popover-content>
        <h4 data-popover-title>
            Popover heading
        </h4>

        ...
    </div>
</div>
```

It also supports the same separate-trigger pattern:

```html
<button data-popover-trigger="settings-pop">
    Settings
</button>

<div data-plugin-popover id="settings-pop">
    <div data-popover-content>
        ...
    </div>
</div>
```

### Structural difference

The DOM structures are intentionally almost identical.

The meaningful difference is what the content **represents**:

* HoverCard → preview/contextual information
* Popover → interactive dialog-like content

---

## External trigger support

Both plugins support a trigger located outside the plugin root.

### `PluginHoverCard`

If no `[data-hovercard-trigger]` is found inside the root, it uses the root's `id`:

```js
const cardId = $el.attr('id');

self.$trigger =
    $(`[data-hovercard-trigger="${cardId}"]`).first();
```

### `PluginPopover`

Popover uses the same pattern:

```js
const popId = $el.attr('id');

self.$trigger =
    $(`[data-popover-trigger="${popId}"]`).first();
```

So there is no meaningful architectural difference here.

---

## Positioning

Both plugins support:

```text
top
bottom
left
right
```

and:

```text
start
center
end
```

They also support an `offset` between the trigger and content.

### `PluginHoverCard`

Default:

```js
side:   'bottom'
align:  'start'
offset: 12
```

### `PluginPopover`

Default:

```js
side:   'bottom'
align:  'start'
offset: 8
```

The underlying position calculations are remarkably similar between the two implementations, including both relative and portaled calculations.

The practical default difference is simply that HoverCard leaves a **12px** gap while Popover leaves an **8px** gap.

---

## Portaling

Both support:

```js
portaling: true
```

When enabled, the content is moved to `document.body`.

### Why

Portaling allows the floating panel to escape:

* `overflow: hidden`
* restrictive ancestor positioning contexts
* certain stacking-context problems

### `PluginHoverCard`

```js
self.$content.appendTo(document.body);
```

### `PluginPopover`

```js
self.$content.appendTo(document.body);
```

The Popover explicitly documents this as escaping `overflow:hidden` and stacking contexts.

Both retain the original parent and move the content back during `destroy()`.

---

## Auto-flipping

Both plugins implement the same basic auto-flip strategy.

The requested side is reversed when the trigger is within approximately **200px** of the corresponding viewport edge.

| Requested side | Flips when          |
| -------------- | ------------------- |
| `top`          | Too close to top    |
| `bottom`       | Too close to bottom |
| `left`         | Too close to left   |
| `right`        | Too close to right  |

`PluginHoverCard` implements this through `resolvedSide()`.

`PluginPopover` implements essentially the same calculation.

Neither implementation performs full collision detection against the actual content dimensions. The decision is based on a fixed 200px viewport-space heuristic plus the configured offset.

That is an important distinction from a full positioning engine such as Floating UI: these plugins perform **simple side flipping**, not comprehensive collision-aware placement.

---

## Arrow implementation

Both plugins support an optional CSS arrow.

### `PluginHoverCard`

Default:

```js
arrow: false
```

The plugin calculates the arrow position and creates a small `<style>` element containing the appropriate `left` or `top` rule for that particular content element.

### `PluginPopover`

Default:

```js
arrow: true
```

The Popover additionally writes a CSS custom property:

```js
--ts-pop-arrow-x
```

or:

```js
--ts-pop-arrow-y
```

before creating its instance-specific style rule.

### Practical difference

|                                  | `PluginHoverCard` | `PluginPopover` |
| -------------------------------- | ----------------- | --------------- |
| Arrow supported                  | ✓                 | ✓               |
| Default                          | Off               | On              |
| CSS pseudo-elements              | ✓                 | ✓               |
| Dynamic arrow position           | ✓                 | ✓               |
| CSS custom property for position | ✗                 | ✓               |

---

## Animation

### `PluginHoverCard`

Animation is tied directly to the resolved side.

It has separate classes for:

```text
ts-hc-in-top
ts-hc-in-bottom
ts-hc-in-left
ts-hc-in-right

ts-hc-out-top
ts-hc-out-bottom
ts-hc-out-left
ts-hc-out-right
```

This produces directional entry/exit motion based on where the card appears.

The animation duration is controlled by:

```js
animationDuration: 180
```

but the actual CSS animations are fixed at approximately 180ms for entry and 130ms for exit. The option primarily acts as a JavaScript fallback timeout.

### `PluginPopover`

Popover uses configurable animation class names:

```js
animationIn:  'ts-pop-in',
animationOut: 'ts-pop-out',
animationDuration: 200
```

The Popover also has side-specific animation overrides.

### Key difference

`PluginHoverCard` has a **fixed animation class system**.

`PluginPopover` exposes the animation class names as options, allowing a caller to substitute different CSS animation classes.

---

## Keyboard and accessibility behavior

This is one of the largest differences between the plugins.

### `PluginHoverCard`

The HoverCard is keyboard-accessible in the sense that focus can open it.

If the trigger isn't already an inherently focusable element, the plugin adds:

```html
tabindex="0"
```

It also assigns:

```html
aria-describedby="..."
```

to the trigger and gives the content an ID, `role="group"`, and `aria-label`.

The trigger therefore establishes a descriptive relationship with the card.

### `PluginPopover`

The Popover uses more extensive dialog semantics.

The content receives:

```html
role="dialog"
aria-modal="true|false"
```

and, when a `[data-popover-title]` exists:

```html
aria-labelledby="..."
```

The trigger receives:

```html
aria-haspopup="dialog"
aria-expanded="false|true"
aria-controls="..."
```

### Accessibility distinction

|                                        | `PluginHoverCard` | `PluginPopover` |
| -------------------------------------- | ----------------- | --------------- |
| Focus opens                            | ✓                 | ✗               |
| Adds tabindex to non-focusable trigger | ✓                 | ✗               |
| `aria-describedby`                     | ✓                 | ✗               |
| `role="group"`                         | ✓                 | ✗               |
| `role="dialog"`                        | ✗                 | ✓               |
| `aria-haspopup`                        | ✗                 | ✓               |
| `aria-expanded`                        | ✗                 | ✓               |
| `aria-controls`                        | ✗                 | ✓               |
| `aria-labelledby`                      | ✗                 | ✓               |
| Escape dismissal                       | ✗                 | ✓               |
| Focus trap                             | ✗                 | Optional        |
| Focus restoration                      | ✗                 | ✓               |

The Popover is therefore substantially more oriented toward **interactive accessible content**, whereas the HoverCard is oriented toward **descriptive preview content**.

---

## Focus trapping

Only `PluginPopover` supports a modal focus trap.

When:

```js
modal: true
```

the plugin listens for `Tab` inside the content and cycles focus between the first and last focusable elements.

The HoverCard has no equivalent.

This is important because a HoverCard is not intended to become a modal interaction surface. A Popover can deliberately be promoted into a more contained interactive experience.

---

## Escape behavior

### `PluginHoverCard`

There is no Escape-key handler.

Closing occurs through:

* pointer leaving the trigger/card
* focus leaving the trigger
* explicit `hide()`
* `destroy()`

### `PluginPopover`

Escape handling is configurable:

```js
closeOnEscape: true
```

When Escape is pressed, the Popover:

1. prevents the default action
2. closes
3. returns focus to the trigger

This is an important behavioral distinction for keyboard-driven interfaces.

---

## Outside-click behavior

### `PluginHoverCard`

There is no document-level outside-click handler.

The card is controlled by pointer/focus state instead.

### `PluginPopover`

Outside-click closing is enabled by default:

```js
closeOnOutside: true
```

The plugin listens on `document` and determines whether the click occurred inside:

* the content
* the trigger
* the plugin root

If none match, it closes.

Clicks inside the content are stopped from reaching the document handler.

---

## Mutual exclusion

Only `PluginPopover` implements automatic mutual exclusion.

When one Popover opens, it broadcasts:

```text
ts-popover-opened
```

Other Popover instances listening for that event close themselves.

This means the Popover system can enforce a behavior where only one popover is open at a time.

`PluginHoverCard` has no equivalent global coordination mechanism.

---

## Public API comparison

| Method      | `PluginHoverCard` | `PluginPopover` | Notes                                       |
| ----------- | ----------------- | --------------- | ------------------------------------------- |
| `show()`    | ✓                 | ✗               | Opens/shows HoverCard.                      |
| `hide()`    | ✓                 | ✗               | Closes/hides HoverCard.                     |
| `open()`    | ✗                 | ✓               | Opens Popover.                              |
| `close()`   | ✗                 | ✓               | Closes Popover.                             |
| `toggle()`  | ✗                 | ✓               | Toggles Popover state.                      |
| `update()`  | ✓                 | ✓               | Repositions while visible/open.             |
| `destroy()` | ✓                 | ✓               | Removes plugin behavior and restores state. |

### State naming

The internal state also reflects the intended interaction model:

```js
PluginHoverCard:
this.isVisible
```

versus:

```js
PluginPopover:
this.isOpen
```

The distinction is small but semantically appropriate: the HoverCard is primarily a visibility surface, while the Popover represents an explicitly opened interactive component.

---

## Callbacks and events

### `PluginHoverCard`

Callbacks:

```js
onShow
onHide
```

Events:

```text
ts.hovercard.show
ts.hovercard.hide
```

The events are native `CustomEvent`s and bubble from the plugin root. Their `detail` contains the instance.

### `PluginPopover`

Callbacks:

```js
onOpen
onClose
```

Events:

```text
popover:open
popover:close
```

These are emitted with jQuery's `.trigger()` and pass the instance as event data.

### Important implementation difference

|                     | `PluginHoverCard`      | `PluginPopover`                |
| ------------------- | ---------------------- | ------------------------------ |
| Show/open callback  | `onShow`               | `onOpen`                       |
| Hide/close callback | `onHide`               | `onClose`                      |
| Event system        | Native `CustomEvent`   | jQuery event                   |
| Event bubbles       | ✓                      | jQuery propagation             |
| Event detail        | `{ detail: instance }` | jQuery event data `[instance]` |

This is a genuine API inconsistency between the two plugins even though their functionality is conceptually similar.

---

## `update()` behavior

Both plugins expose:

```js
update()
```

but neither uses it to change configuration.

It simply repositions the currently visible/open content.

### HoverCard

```js
if (this.isVisible) this._position();
```

### Popover

```js
if (this.isOpen) this._position();
```

Both also automatically reposition during:

```text
window resize
window scroll
```

---

## Initialization and wiring

Both plugins use direct DOM-ready initialization rather than `intObsInit()` or `dynIntObsInit()`.

### `PluginHoverCard`

```js
$('[data-plugin-hovercard]:not(.manual)').each(function () {
    const $this = $(this);
    const opts =
        themestrap.fn.getOptions(
            $this.data('plugin-options')
        ) || undefined;

    $this.themestrapPluginHoverCard(opts);
});
```

### `PluginPopover`

The Popover follows the same initialization pattern:

```js
$('[data-plugin-popover]:not(.manual)').each(function () {
    const $this = $(this);
    const opts =
        themestrap.fn.getOptions(
            $this.data('plugin-options')
        ) || undefined;

    $this.themestrapPluginPopover(opts);
});
```

There is therefore no meaningful initialization architecture difference.

---

## CSS and visual defaults

### `PluginHoverCard`

Default content:

* `min-width: 240px`
* `max-width: 340px`
* `border-radius: 0.625rem`
* `padding: 1rem`
* `z-index: 9994`

It also provides convenience classes specifically suited to profile-style preview content:

```text
.hc-avatar
.hc-name
.hc-handle
.hc-bio
.hc-meta
.hc-meta-label
.hc-divider
```

### `PluginPopover`

Default content:

* `min-width: 14rem`
* `max-width: 22rem`
* `border-radius: 0.5rem`
* `padding: 1rem`
* `z-index: 9995`

It provides a specific:

```text
[data-popover-title]
```

styling hook rather than HoverCard's profile-oriented helper classes.

---

## Dark mode

Both plugins support:

```css
html.dark
```

and use Themestrap/Porto custom properties for dark-mode colors.

### HoverCard

Uses:

```text
--dark-300
--default
--dark-rgba-50
```

plus additional grey fallback variables for the profile helpers.

### Popover

Uses:

```text
--dark-300
--default
--dark-rgba-50
```

for the panel and arrow.

Their dark-mode implementation is therefore structurally very similar.

---

## Reduced-motion support

`PluginHoverCard` explicitly includes:

```css
@media (prefers-reduced-motion: reduce) {
    [data-hovercard-content] {
        animation: none !important;
    }
}
```

The supplied `PluginPopover` CSS does not contain an equivalent `prefers-reduced-motion` media query.

That means the two plugins currently differ in their explicit CSS-level reduced-motion handling.

---

## Destroy behavior

### `PluginHoverCard`

`destroy()`:

1. Cancels pending show/hide timers.
2. Removes visibility and animation classes.
3. Clears positioning.
4. Removes the generated arrow style.
5. Removes trigger event handlers.
6. Removes `aria-describedby`.
7. Removes the automatically added `tabindex`, if it added one.
8. Removes content event handlers.
9. Moves portaled content back to its original parent.
10. Removes window handlers.
11. Removes the instance data.

### `PluginPopover`

`destroy()`:

1. Closes an open Popover.
2. Removes trigger event handlers and ARIA attributes.
3. Removes document event handlers.
4. Removes window event handlers.
5. Removes content event handlers.
6. Removes generated arrow styles.
7. Moves portaled content back.
8. Removes IDs, roles, ARIA attributes, animation classes, and positioning.
9. Removes instance data.

### Important distinction

Neither plugin takes an `innerHTML` snapshot and replaces the DOM during destruction. Both deliberately clean up and preserve the existing content nodes.

That is particularly useful when the content contains application-managed DOM state or event handlers.

---

## Plugin options comparison

| Option              | `PluginHoverCard` | `PluginPopover` |
| ------------------- | ----------------- | --------------- |
| `side`              | ✓                 | ✓               |
| `align`             | ✓                 | ✓               |
| `offset`            | ✓                 | ✓               |
| `arrow`             | ✓                 | ✓               |
| `portaling`         | ✓                 | ✓               |
| `delay`             | ✓                 | ✗               |
| `animationDuration` | ✓                 | ✓               |
| `ariaLabel`         | ✓                 | ✗               |
| `onShow`            | ✓                 | ✗               |
| `onHide`            | ✓                 | ✗               |
| `closeOnEscape`     | ✗                 | ✓               |
| `closeOnOutside`    | ✗                 | ✓               |
| `animationIn`       | ✗                 | ✓               |
| `animationOut`      | ✗                 | ✓               |
| `modal`             | ✗                 | ✓               |
| `onOpen`            | ✗                 | ✓               |
| `onClose`           | ✗                 | ✓               |

---

## Feature matrix

| Feature                                | `PluginHoverCard` | `PluginPopover` |
| -------------------------------------- | ----------------- | --------------- |
| **Hover activation**                   | ✓                 | ✗               |
| **Focus activation**                   | ✓                 | ✗               |
| **Click activation**                   | ✗                 | ✓               |
| **Open delay**                         | ✓                 | ✗               |
| **Close delay**                        | ✓                 | ✗               |
| **Hover into content without closing** | ✓                 | Not applicable  |
| **Top / bottom / left / right**        | ✓                 | ✓               |
| **Start / center / end alignment**     | ✓                 | ✓               |
| **Auto-flip**                          | ✓                 | ✓               |
| **Portaling**                          | ✓                 | ✓               |
| **Arrow**                              | ✓                 | ✓               |
| **Arrow default**                      | Off               | On              |
| **Side-aware animation**               | ✓                 | ✓               |
| **Configurable animation class**       | ✗                 | ✓               |
| **Scroll/resize repositioning**        | ✓                 | ✓               |
| **Escape to close**                    | ✗                 | ✓               |
| **Outside click to close**             | ✗                 | ✓               |
| **Mutual exclusion**                   | ✗                 | ✓               |
| **Focus restoration**                  | ✗                 | ✓               |
| **Focus trap**                         | ✗                 | Optional        |
| **Dialog semantics**                   | ✗                 | ✓               |
| **`aria-describedby` relationship**    | ✓                 | ✗               |
| **`aria-expanded`**                    | ✗                 | ✓               |
| **`aria-controls`**                    | ✗                 | ✓               |
| **Native CustomEvent API**             | ✓                 | ✗               |
| **jQuery event API**                   | ✗                 | ✓               |
| **Open/show callbacks**                | ✓                 | ✓               |
| **Close/hide callbacks**               | ✓                 | ✓               |
| **Reduced-motion CSS handling**        | ✓                 | ✗               |
| **Profile-oriented helper CSS**        | ✓                 | ✗               |
| **Modal behavior**                     | ✗                 | ✓               |
| **Interactive content orientation**    | Limited           | ✓               |

---

## When to use `PluginHoverCard`

Use `PluginHoverCard` when:

* You want a **preview that appears on hover**.
* You want the same preview to appear when a user **focuses the trigger**.
* You need configurable **open and close delays**.
* The content is primarily descriptive rather than an application control surface.
* You want the pointer to be able to travel from the trigger into the card without immediately closing it.
* You're building profile previews, author cards, user previews, link previews, or contextual information.
* You want a lightweight content surface that does not behave like a dialog.
* You want the component's built-in profile-oriented CSS helpers.
* You want explicit native `CustomEvent` notifications.
* You want the plugin to explicitly suppress animation under `prefers-reduced-motion`.

---

## When to use `PluginPopover`

Use `PluginPopover` when:

* The user should **explicitly click to open** the content.
* The content contains interactive controls.
* You need **Escape-to-close** behavior.
* You need **outside-click dismissal**.
* You need focus returned to the trigger after Escape.
* You need `aria-expanded`, `aria-controls`, and dialog semantics.
* You need an optional **focus trap**.
* You want only one Popover open at a time.
* You need explicit `open()`, `close()`, and `toggle()` methods.
* You want configurable animation class names.
* You are building settings, actions, forms, contextual controls, or other interactive content.
* You need a component that behaves more like a small dialog than a passive preview.

---

## The fundamental distinction

The two plugins share enough positioning infrastructure that they can look nearly identical on screen, but they should not be considered interchangeable.

`PluginHoverCard` is fundamentally a **preview interaction**:

```text
pointer/focus
      ↓
   delay
      ↓
   preview
      ↓
pointer/focus leaves
      ↓
   delay
      ↓
    hide
```

`PluginPopover` is fundamentally an **explicit interactive state**:

```text
     click
       ↓
     open
       ↓
interactive content
   ↙    ↓     ↘
Escape outside  another
       ↓        ↓
     close    close
```

That difference explains most of the other API differences.

The HoverCard needs timers because hover is transient. The Popover needs outside-click and Escape handling because explicit activation creates an independently persistent open state. The Popover needs stronger ARIA semantics and optional focus trapping because its content is intended to be interactive. The HoverCard instead establishes a descriptive relationship between the trigger and preview using `aria-describedby`.

In short, **the positioning engine is nearly the same; the interaction contract is not**.
