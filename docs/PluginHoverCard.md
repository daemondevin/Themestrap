# PluginHoverCard

A hover-triggered preview card that appears after a configurable delay, stays open while the cursor is inside it, auto-flips at viewport edges, and dispatches native events — zero dependencies beyond jQuery.

HoverCard is for **non-blocking, glanceable context**: user profiles, link previews, document teasers, quick-reference definitions. For interactive, click-triggered panels use [PluginPopover](plugin-popover.html) instead.


## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.hovercard.js"></script>
```

The plugin injects its own `<style id="ts-hovercard-styles">` on first use — no separate CSS import is needed.

### Minimal markup

```html
<span data-plugin-hovercard>
  <a data-hovercard-trigger href="/profile/daemon_devin">@daemon_devin</a>

  <div data-hovercard-content>
    <div class="hc-avatar">
      <img src="avatar.jpg" alt="daemon.devin">
    </div>
    <div class="hc-name">daemon.devin</div>
    <div class="hc-handle">@daemon_devin</div>
    <p class="hc-bio">Building Themestrap — a zero-build jQuery plugin ecosystem for MODX 3.</p>
    <hr class="hc-divider">
    <div class="hc-meta">
      <span>128 <span class="hc-meta-label">Following</span></span>
      <span>4.2k <span class="hc-meta-label">Followers</span></span>
    </div>
  </div>
</span>
```

### Init.js wiring

HoverCard must be wired on DOMReady — hover events need to be registered before the first interaction, so IntersectionObserver or `execOnceThroughEvent` are not appropriate here.

```js
// HoverCard
if ($.isFunction($.fn['themestrapPluginHoverCard']) && $('[data-plugin-hovercard]').length) {
    $(() => {
        $('[data-plugin-hovercard]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginHoverCard(opts);
        });
    });
}
```


## Markup Anatomy

### Wrapper

The `[data-plugin-hovercard]` element is the plugin root. It must wrap both the trigger and the content panel. The plugin sets `position: relative; display: inline-block` on it so the card is positioned relative to this element.

```html
<span data-plugin-hovercard
      data-plugin-options='{"side": "bottom", "align": "start", "delay": [200, 300]}'>
  <!-- trigger + content go here -->
</span>
```

### Trigger

Any element inside the wrapper that carries `data-hovercard-trigger`. On mouseenter the open delay starts; on mouseleave the close delay starts. Non-focusable triggers (plain `<span>`) receive `tabindex="0"` automatically for keyboard access.

```html
<!-- Link trigger -->
<a data-hovercard-trigger href="/profile/alice">@alice</a>

<!-- Button trigger -->
<button data-hovercard-trigger type="button">View profile</button>

<!-- Plain inline trigger (tabindex added automatically) -->
<span data-hovercard-trigger>daemon.devin</span>
```

### Content panel

The element carrying `data-hovercard-content` is the card. Any HTML is valid inside it. The plugin adds positioning, animation classes, and ARIA attributes — do not add those yourself.

```html
<div data-hovercard-content>
  <!-- Any content: .hc-* helpers, custom markup, images, links -->
</div>
```

### External trigger pattern

The trigger and wrapper can live in different DOM positions. Set the `id` on the wrapper and point the trigger at it using the attribute value:

```html
<p>
  Written by <a data-hovercard-trigger="author-card" href="#">Alice</a>
</p>

<!-- Wrapper can be anywhere in the document -->
<span id="author-card" data-plugin-hovercard>
  <div data-hovercard-content>
    <!-- card content -->
  </div>
</span>
```

The plugin uses `$('[data-hovercard-trigger="author-card"]')` to locate the trigger; hover events are attached to that element and positioning is computed relative to it.


## Convenience Layout Classes

The plugin injects styles for a set of optional layout helpers. The card content is entirely freeform — these classes exist as a shortcut for the common profile-card shape.

| Class | Element | Purpose |
|---|---|---|
| `.hc-avatar` | Wrapper `div` | Container for an avatar image. Adds `margin-bottom`. |
| `.hc-avatar img` | `<img>` inside `.hc-avatar` | `48 × 48px` circular crop via `border-radius: 50%`. |
| `.hc-name` | Any inline/block | Primary name label — `0.9375rem`, bold. |
| `.hc-handle` | Any inline/block | Secondary handle or username — `0.8125rem`, muted. |
| `.hc-bio` | `<p>` | Short bio paragraph — `0.8125rem`, muted, bottom-margined. |
| `.hc-meta` | `div` | Flex row for stat pairs (following / followers, etc.). |
| `.hc-meta-label` | `<span>` inside `.hc-meta` | Muted weight-400 suffix on a stat value. |
| `.hc-divider` | `<hr>` | Thin horizontal rule for visual separation within the card. |

All helpers adapt to dark mode automatically when `html.dark` is present (set by PluginDarkMode).


## Options

Pass as a JSON object on `data-plugin-options` or as a JS object to the jQuery method. Option resolution order: `defaults → JS opts argument → data-plugin-options JSON` (later values win).

| Option | Type | Default | Description |
|---|---|---|---|
| `side` | string | `"bottom"` | Preferred side. `"top"` \| `"bottom"` \| `"left"` \| `"right"`. Auto-flips to the opposite side when the viewport has insufficient space. |
| `align` | string | `"start"` | Alignment along the chosen side axis. `"start"` \| `"center"` \| `"end"`. |
| `offset` | number | `12` | Gap in pixels between the trigger edge and the card. |
| `arrow` | boolean | `false` | Show a CSS triangle arrow pointing from the card toward the trigger. |
| `portaling` | boolean | `false` | Appends `[data-hovercard-content]` to `<body>` at init time. Escapes `overflow: hidden` ancestors and complex stacking contexts. The node is restored to its original parent on `destroy()`. |
| `delay` | number \| array | `[200, 300]` | Open and close delays in milliseconds. A single number applies to both. An array `[openMs, closeMs]` sets them independently. |
| `animationDuration` | number | `180` | Safety timeout in ms used as a fallback if `animationend` never fires. |
| `ariaLabel` | string | `"Hover card"` | `aria-label` applied to the content panel (`role="group"`). Customize to reflect the card's purpose — `"User profile"`, `"Document preview"`, etc. |
| `onShow` | function | `null` | Callback fired after the card becomes visible. Called with the plugin instance as `this`. |
| `onHide` | function | `null` | Callback fired after the card is hidden. Same signature as `onShow`. |


## Public API

Retrieve the instance via `.data('__pluginHoverCard')` after initialization.

```js
const hc = $('#my-card').data('__pluginHoverCard');
```

Or use the jQuery bridge string-command form:

```js
$('#my-card').themestrapPluginHoverCard('show');
$('#my-card').themestrapPluginHoverCard('destroy');
```

| Method | Returns | Description |
|---|---|---|
| `hc.show()` | `this` | Show the card immediately, bypassing the open delay. No-op if already visible. |
| `hc.hide()` | `this` | Hide the card immediately, bypassing the close delay. No-op if already hidden. |
| `hc.update()` | `this` | Recompute position without changing visibility. Call after dynamic layout changes — accordion expand, tab switch, scroll-into-view, etc. |
| `hc.destroy()` | `this` | Full teardown: removes all namespaced event listeners, clears ARIA attributes set by the plugin, restores portaled content to its original parent, removes `tabindex` if one was injected, and removes the instance from `.data()`. DOM content is otherwise left intact. |


## Events

The plugin dispatches native `CustomEvent`s on the `[data-plugin-hovercard]` root element. Both bubble, so you can listen at a parent or at `document`.

| Event | `detail` | When |
|---|---|---|
| `ts.hovercard.show` | Plugin instance | Immediately after the card becomes visible and the open animation begins. |
| `ts.hovercard.hide` | Plugin instance | After the hide animation completes and the card is removed from layout. |

```js
// Document-level listener — catches events from every card on the page
document.addEventListener('ts.hovercard.show', function(e) {
    const instance = e.detail;
    console.log('card shown on', instance.$el[0]);
});

document.addEventListener('ts.hovercard.hide', function(e) {
    console.log('card hidden');
});

// Per-element listener
$('#my-card')[0].addEventListener('ts.hovercard.show', function(e) {
    analytics.track('hovercard_shown');
});
```

The `onShow` and `onHide` options are callbacks that fire at the same points:

```js
$('#my-card').themestrapPluginHoverCard({
    onShow: function() { console.log('shown', this.$el); },
    onHide: function() { console.log('hidden'); }
});
```


## CSS Custom Properties

The injected stylesheet uses CSS custom properties for colours and sizes. Override them on the `[data-plugin-hovercard]` element or on a parent to retheme without editing the plugin.

```css
/* Example: tighter, more compact cards */
[data-plugin-hovercard] {
    --ts-hc-min-width:   200px;
    --ts-hc-max-width:   280px;
    --ts-hc-padding:     0.75rem;
    --ts-hc-radius:      0.5rem;
}
```

| Variable | Default | Controls |
|---|---|---|
| `--ts-hc-min-width` | `240px` | Minimum card width. |
| `--ts-hc-max-width` | `340px` | Maximum card width. |
| `--ts-hc-padding` | `1rem` | Inner padding of the card panel. |
| `--ts-hc-radius` | `0.625rem` | Card border-radius. |
| `--ts-hc-bg` | `#fff` | Card background colour. |
| `--ts-hc-border` | `rgba(0,0,0,0.08)` | Card border colour. |
| `--ts-hc-shadow` | `0 4px 6px…, 0 10px 15px…` | Card box-shadow. |
| `--ts-hc-color` | `#1a1a2e` | Default text colour inside the card. |
| `--ts-hc-z` | `9994` | Card z-index. |

Dark mode is applied automatically when `html.dark` is present via selector overrides in the injected stylesheet. No extra configuration is needed.


## Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Standard focus traversal. Focus reaching `[data-hovercard-trigger]` starts the open delay. |
| `Shift+Tab` | Reverse traversal. Focus leaving the trigger starts the close delay. |
| *Focus on trigger* | Starts the open delay (same delay as mouseenter). |
| *Blur from trigger* | Starts the close delay (same delay as mouseleave), unless the cursor is inside the card. |

Non-focusable triggers (a plain `<span>` that is not an `<a>`, `<button>`, or element with `tabindex`) receive `tabindex="0"` automatically at init time, making them reachable by keyboard. This attribute is removed on `destroy()`.

The card itself is not keyboard-navigable — it is informational and not interactive at the dialog level. If the card content contains links or buttons that users need keyboard access to, consider PluginPopover with `modal: false` instead.


## ARIA Wiring

The plugin sets and updates ARIA attributes automatically. Do not set these manually.

| Element | Attribute | Value |
|---|---|---|
| `[data-hovercard-trigger]` | `aria-describedby` | Auto-generated `id` of the content panel. Links the trigger to its description for screen readers. |
| `[data-hovercard-content]` | `id` | Auto-generated unique ID (e.g. `hc-content-1-a3f7b`). |
| `[data-hovercard-content]` | `role` | `"group"` — marks the card as a related region, not a dialog. |
| `[data-hovercard-content]` | `aria-label` | Value of the `ariaLabel` option (`"Hover card"` by default). |
| Non-focusable trigger | `tabindex` | `"0"` — injected when the trigger is not natively focusable. |


## Recipes

### Profile card — default bottom placement

```html
<span data-plugin-hovercard>
  <a data-hovercard-trigger href="/users/alice">@alice</a>
  <div data-hovercard-content>
    <div class="hc-avatar"><img src="alice.jpg" alt="Alice"></div>
    <div class="hc-name">Alice</div>
    <div class="hc-handle">@alice · Frontend Lead</div>
    <p class="hc-bio">CSS grid evangelist. Accessibility advocate.</p>
    <hr class="hc-divider">
    <div class="hc-meta">
      <span>312 <span class="hc-meta-label">Following</span></span>
      <span>8.1k <span class="hc-meta-label">Followers</span></span>
    </div>
  </div>
</span>
```

### Link preview — opens above, slow close

Slow close delay gives the user time to read the teaser before the card disappears.

```html
<span data-plugin-hovercard
      data-plugin-options='{"side":"top","align":"center","delay":[150,500]}'>
  <a data-hovercard-trigger href="/docs/architecture">Plugin Architecture Guide</a>
  <div data-hovercard-content>
    <div class="hc-name" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.55;margin-bottom:.4rem;">Guide · 12 min read</div>
    <div class="hc-name">Plugin Architecture</div>
    <p class="hc-bio">Deep dive into the Themestrap plugin class lifecycle — initialize, setData, setOptions, build, events, destroy.</p>
  </div>
</span>
```

### With arrow, right-side placement

```html
<span data-plugin-hovercard
      data-plugin-options='{"side":"right","align":"center","arrow":true}'>
  <button data-hovercard-trigger type="button">Release notes</button>
  <div data-hovercard-content>
    <div class="hc-name">v2.4.0 — HoverCard</div>
    <p class="hc-bio">New plugin: PluginHoverCard. Hover-triggered preview cards with delay, auto-flip, portaling, and side-aware animations.</p>
  </div>
</span>
```

### Instant preview (no delay)

```html
<span data-plugin-hovercard data-plugin-options='{"delay":0}'>
  <button data-hovercard-trigger type="button">Info</button>
  <div data-hovercard-content>
    <p class="hc-bio mb-0">Opens immediately on mouseenter. Best for toolbars and icon grids where glancing is intentional.</p>
  </div>
</span>
```

### Portaled — escapes overflow:hidden ancestors

```html
<div style="overflow: hidden; height: 80px;">
  <span data-plugin-hovercard data-plugin-options='{"portaling":true}'>
    <button data-hovercard-trigger type="button">Peek</button>
    <div data-hovercard-content>
      <p class="hc-bio mb-0">This card escapes the overflow:hidden container because portaling moves it to &lt;body&gt;.</p>
    </div>
  </span>
</div>
```

### Multiple cards in running text

Each wrapper is a fully independent instance. Any number can coexist in prose.

```html
<p>
  The project was built by
  <span data-plugin-hovercard>
    <a data-hovercard-trigger href="#">@alice</a>
    <div data-hovercard-content><!-- Alice's card --></div>
  </span>,
  <span data-plugin-hovercard>
    <a data-hovercard-trigger href="#">@bob</a>
    <div data-hovercard-content><!-- Bob's card --></div>
  </span>, and
  <span data-plugin-hovercard>
    <a data-hovercard-trigger href="#">@carol</a>
    <div data-hovercard-content><!-- Carol's card --></div>
  </span>.
</p>
```

### Programmatic control

```js
// Initialize manually (skip auto-init by adding .manual to the element)
$('#my-card').themestrapPluginHoverCard({
    side  : 'top',
    align : 'center',
    delay : [100, 200],
    onShow: function() { analytics.track('hovercard_shown'); }
});

// Get instance
const hc = $('#my-card').data('__pluginHoverCard');

// Force open/close
hc.show();
hc.hide();

// Reposition after a layout change
hc.update();

// Destroy and re-initialize with new options
hc.destroy();
$('#my-card').themestrapPluginHoverCard({ side: 'right', delay: 0 });
```

### Listen for events

```js
// All cards on the page
document.addEventListener('ts.hovercard.show', function(e) {
    const instance = e.detail;
    const label    = instance.$trigger
        ? instance.$trigger.text().trim()
        : 'unknown';
    console.log('Card shown:', label);
});

// Specific element
$('#my-card')[0].addEventListener('ts.hovercard.hide', function() {
    console.log('Card hidden');
});
```


## Common Pitfalls

**Card clips at the edge of its container**
The card is positioned relative to the `[data-plugin-hovercard]` wrapper. Any ancestor with `overflow: hidden` will clip it. Enable `portaling: true` to move the card to `<body>` and escape all overflow constraints.

**Card appears behind other elements**
The card uses `z-index: 9994`. If a stacking context ancestor is winning, enable `portaling: true` to move the card to the top-level stacking context, where z-index resolution starts fresh.

**Card doesn't open on first hover**
The init wiring must run on DOMReady (`$(() => {...})`) — not via IntersectionObserver or `execOnceThroughEvent`. Hover events must be registered before the first interaction. Verify the plugin script is loaded and the init block has run by checking `$('[data-plugin-hovercard]').data('__pluginHoverCard')`.

**Card flashes on cursor transit between trigger and card**
This happens when `delay[1]` (close delay) is too short for the gap between the trigger and the card. Increase the close delay (e.g. `300ms`) or reduce `offset` so the gap is smaller.

**Destroy leaves a residual node in `<body>`**
If `portaling: true` was used and `destroy()` is not called before removing the wrapper from the DOM, the portaled content node becomes an orphan in `<body>`. Always call `hc.destroy()` before removing or replacing hover-card elements via AJAX or templating.

**`ariaLabel` is not read by screen readers**
`aria-label` on a `role="group"` is announced differently across assistive technology. For cards whose purpose is apparent from context, `"Hover card"` is acceptable. For ambiguous contexts, supply a specific value: `"User profile"`, `"Document preview"`, `"Article teaser"`.

**External trigger: card never opens**
The external trigger pattern requires the wrapper to have an `id` and the trigger to carry that exact string as the `data-hovercard-trigger` attribute value. Check that the ID matches, that both elements are in the DOM at init time, and that the plugin is initialized on the wrapper element, not the trigger.

### Diagnostic checklist

- Does `$('[data-plugin-hovercard]').data('__pluginHoverCard')` return an instance?
- Is `themestrap.plugin.hovercard.js` loaded after jQuery and `themestrap.js`?
- Is the init block running on DOMReady (not deferred by an IntersectionObserver)?
- Does each `[data-plugin-hovercard]` contain a `[data-hovercard-trigger]` child (or does an external trigger reference it by `id`)?
- Does each `[data-plugin-hovercard]` contain a `[data-hovercard-content]` child?
- Is any ancestor of the wrapper using `overflow: hidden`? If so, enable `portaling: true`.
- On the external trigger pattern: does the `id` on the wrapper exactly match the `data-hovercard-trigger` attribute value on the trigger element?


## HoverCard vs Popover

| | HoverCard | Popover |
|---|---|---|
| **Trigger** | Hover (mouseenter / focus) | Click |
| **Close** | Mouseleave / blur (after delay) | Escape, outside click, or trigger re-click |
| **Delay** | Configurable open + close delay | None |
| **Card stays open when cursor moves into it** | Yes — mouseenter on the card cancels the hide timer | No |
| **Focus trap** | No | Optional (`modal: true`) |
| **ARIA role** | `role="group"` | `role="dialog"` |
| **Trigger ARIA** | `aria-describedby` | `aria-haspopup`, `aria-expanded`, `aria-controls` |
| **Mutual exclusion broadcast** | No | Yes — opening one closes others |
| **Use for** | Non-interactive previews, profile teasers, link tooltips | Interactive panels, forms, menus, confirmations |