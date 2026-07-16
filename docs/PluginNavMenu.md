# NavMenu Guide

Themestrap's zero-build navigation menu plugin with hover or click opening, animated content panels, viewport portal mode, keyboard navigation, mutual exclusion, and full ARIA wiring.

Wrap top-level items in `[data-navmenu-item]`, add a `[data-navmenu-trigger]` and a `[data-navmenu-content]`, and the plugin handles hover/click opening, animated panel transitions, keyboard arrow navigation, Escape dismissal, mutual exclusion, edge-alignment correction, optional viewport portaling, and complete ARIA wiring.

---

## [How It **Works**](#how-it-works)

Each top-level `[data-navmenu-item]` that contains both a trigger and a content panel becomes a managed _item record_. The plugin tracks which item is active and handles all open/close logic centrally so only one panel can be visible at a time.

### Closed state

> The content panel has `display: none` and no positioning is applied. Hover timers are armed on `mouseenter` of the item and cancelled on `mouseleave` — so a quick mouse pass doesn't flicker panels open.
>
> - Trigger: `aria-expanded="false"`
> - Panel: `display: none`
> - Hover timers cleared on leave; no listener cost at rest

### Open state

> The panel receives `.ts-navmenu-active` (`display: block`) and the entrance animation class. Any previously open item is closed (without animation when switching quickly). Edge alignment is re-checked so panels near the right edge of the viewport flip to right-align automatically.
>
> - Trigger: `aria-expanded="true"`
> - Panel: `.ts-navmenu-active .ts-navmenu-in`
> - Previous item closed before new one opens

### Mutual exclusion

Only one panel can be open at a time. When `open(index)` is called and a different item is already active, the old item is closed instantly (no animation) before the new one animates in. This matches the behaviour of shadcn's `NavigationMenu` primitive and avoids two panels stacking on top of each other.

### Edge-alignment correction

On `build()` and on every `resize` (debounced 100 ms) the plugin checks whether each panel would overflow the right edge of the viewport. If it would, the item gets the class `ts-navmenu-align-right` which switches the panel from `left: 0` to `right: 0` — preventing off-screen menus without any extra markup.

### Viewport portal mode

When `useViewport: true`, all content panels are moved into a `[data-navmenu-viewport]` sibling element at `build()` time. The viewport is positioned absolutely and its `left` and `width` transition smoothly as the active item changes — this is the animated "sliding underline" panel effect from shadcn's desktop NavigationMenu. Panels are restored to their original parents on `destroy()`.

---

## [Quick **Start**](#quick-start)

### Minimal markup

A nav with one plain link and one trigger-and-panel item:

```html
<nav data-plugin-navmenu>

  <div data-navmenu-item>
    <a href="/" data-navmenu-link>Home</a>
  </div>

  <div data-navmenu-item>
    <button data-navmenu-trigger type="button">Products</button>
    <div data-navmenu-content>
      <a href="/alpha" data-navmenu-list-item>
        <span data-navmenu-list-item-icon>★</span>
        <div>
          <div data-navmenu-list-item-title>Alpha</div>
          <p data-navmenu-list-item-desc>Alpha product description.</p>
        </div>
      </a>
    </div>
  </div>

</nav>
```

### Auto-init wiring (`themestrap.init.js`)

```js
if ($.isFunction($.fn['themestrapPluginNavmenu']) && $('[data-plugin-navmenu]').length) {
    $(() => {
        $('[data-plugin-navmenu]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginNavmenu(opts);
        });
    });
}
```

### Passing options inline

```html
<nav data-plugin-navmenu
     data-plugin-options='{"openOn":"click","orientation":"vertical"}'>
  …
</nav>
```

> [!NOTE]
> **No stylesheet to import.** The plugin injects its CSS once per page via a `<style id="ts-navmenu-styles">` tag. You do not need a separate `.css` file.

---

## [Markup **Reference**](#markup)

### Full anatomy

```html
<!-- Root nav — plugin attaches here -->
<nav data-plugin-navmenu
     data-plugin-options='{"openOn":"hover","delay":200}'>

  <!-- Plain link item (no sub-panel) -->
  <div data-navmenu-item>
    <a href="/" data-navmenu-link>Home</a>
  </div>

  <!-- Trigger + panel item -->
  <div data-navmenu-item>

    <!-- Trigger: opens / closes the panel -->
    <button data-navmenu-trigger type="button">Products</button>

    <!-- Content panel: any HTML is valid inside -->
    <div data-navmenu-content>

      <!-- Rich list item with icon, title, and description -->
      <a href="/products/alpha" data-navmenu-list-item>
        <span data-navmenu-list-item-icon>★</span>
        <div>
          <div data-navmenu-list-item-title>Alpha</div>
          <p data-navmenu-list-item-desc>Alpha description.</p>
        </div>
      </a>

    </div>
  </div>

</nav>

<!-- Optional: viewport element for animated panel transitions -->
<div data-navmenu-viewport></div>
```

### Data attributes reference

| Attribute | Element | Notes |
|-----------|---------|-------|
| `data-plugin-navmenu` | Root `<nav>` | Plugin init hook. Add `data-plugin-options` here. |
| `data-navmenu-item` | Direct child of root | Wraps one top-level nav item (link or trigger+panel pair). |
| `data-navmenu-link` | `<a>` inside item | Plain nav link — no panel, receives hover styling only. |
| `data-navmenu-trigger` | `<button>` inside item | Opens/closes the sibling panel. Plugin wires ARIA and a chevron. |
| `data-navmenu-content` | Sibling of trigger inside item | The dropdown panel. Can hold any HTML. |
| `data-navmenu-viewport` | Sibling of root `<nav>` | Optional. Receives all panels when `useViewport: true`. |
| `data-navmenu-list-item` | `<a>` inside panel | Rich list-item layout: icon + title + description side by side. |
| `data-navmenu-list-item-icon` | Span/div inside list item | Icon cell — receives a rounded background. |
| `data-navmenu-list-item-title` | Div inside list item | Bold title line. |
| `data-navmenu-list-item-desc` | `<p>` inside list item | Muted description line. |

### ARIA wiring — what the plugin sets

| Element | Attribute | Value |
|---------|-----------|-------|
| `[data-navmenu-trigger]` | `aria-expanded` | `"true"` when panel open, `"false"` when closed |
| `[data-navmenu-trigger]` | `aria-controls` | Auto-generated ID of the associated content panel |
| `[data-navmenu-trigger]` | `aria-haspopup` | `"true"` |
| `[data-navmenu-content]` | `role` | `"region"` |
| `[data-navmenu-content]` | `aria-labelledby` | ID of the associated trigger |

---

## [Configuration **Options**](#options)

Options merge: `PluginNavmenu.defaults -> opts argument -> data-plugin-options JSON`. Later wins.

### Layout

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | string | `"horizontal"` | Nav axis. `"horizontal"` = flex row, panels drop below triggers. `"vertical"` = flex column, panels appear to the right of triggers. |

### Open behaviour

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `openOn` | string | `"hover"` | `"hover"` uses mouseenter with a debounce delay. `"click"` toggles on trigger click only — better for touch/mobile navigation. |
| `delay` | number | `200` | Milliseconds to wait after `mouseenter` before opening the panel. |
| `closeDelay` | number | `150` | Milliseconds to wait after `mouseleave` before closing. Allows the mouse to move from the trigger into the panel without the panel closing mid-transit. |

### Viewport portal

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useViewport` | bool | `false` | Move all content panels into the `[data-navmenu-viewport]` element at build time. The viewport slides its `left` and resizes its `width` as the active item changes. |

### Animation

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `animationIn` | string | `"ts-navmenu-in"` | CSS class added to the content panel on open. |
| `animationOut` | string | `"ts-navmenu-out"` | CSS class added to the content panel on close. |
| `animationDuration` | number | `200` | Fallback timeout in ms to force-complete a close animation. |

### Dismiss

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeOnEscape` | bool | `true` | Press `Esc` to close the active panel. Focus returns to the trigger. |
| `closeOnOutside` | bool | `true` | Click anywhere outside the nav to close the active panel. |

### Callbacks

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onOpen` | function | `null` | Called after a panel opens. Receives `(itemRecord, instance)`. |
| `onClose` | function | `null` | Called after a panel finishes closing. Same arguments as `onOpen`. |

---

## [Public **API**](#api)

### Accessing the instance

```js
// jQuery adapter — creates on first call, returns existing instance thereafter
const nav = $('[data-plugin-navmenu]').themestrapPluginNavmenu();

// Direct data access (after auto-init)
const nav = $('[data-plugin-navmenu]').data('__pluginNavmenu');
```

### Instance methods

| Method | Returns | Description |
|--------|---------|-------------|
| `open(index)` | this | Open the item at zero-based `index`. Closes any other open item first. |
| `close()` | this | Close the active item, running the exit animation. |
| `toggle(index)` | this | Open if closed; close if the same index is already active. |
| `getActive()` | number | Return the index of the currently open item, or `-1` if none is open. |
| `destroy()` | this | Remove all events, restore portaled panels, strip ARIA attributes, and remove instance data. |

### Custom events

Both events bubble from `[data-plugin-navmenu]`:

```js
document.querySelector('[data-plugin-navmenu]')
  .addEventListener('navmenu-opened', (e) => {
    console.log('opened index', e.detail.index, e.detail.$item);
  });

document.querySelector('[data-plugin-navmenu]')
  .addEventListener('navmenu-closed', (e) => {
    console.log('closed index', e.detail.index);
  });
```

| Event | detail properties | When fired |
|-------|-------------------|-----------|
| `navmenu-opened` | `index`, `$item`, `instance` | After the panel opens and the entrance animation starts |
| `navmenu-closed` | `index`, `$item`, `instance` | After the panel finishes closing (animation end or timeout) |

### Keyboard behaviour

| Key | Where | Action |
|-----|-------|--------|
| `Enter` / `Space` | On a trigger | Toggle the panel |
| `Escape` | Anywhere (when a panel is open) | Close the active panel; return focus to its trigger |
| `⏴` / `⏵` | On a trigger (horizontal orientation) | Move focus to the previous / next trigger |
| `⏶` / `⏷` | On a trigger (vertical orientation) | Move focus to the previous / next trigger |
| `⏷` | On a trigger (horizontal, panel open) | Move focus to the first focusable element inside the open panel |
| `⏵` | On a trigger (vertical, panel open) | Move focus to the first focusable element inside the open panel |

---

## [Orientation **Modes**](#orientation)

### Horizontal (default)

Items are arranged left-to-right in a flex row. Panels drop vertically below their trigger (`top: calc(100% + 8px)`). Arrow keys `⏴`/`⏵` move between triggers. `⏷` from an open trigger focuses the first panel item.

```html
<nav data-plugin-navmenu
     data-plugin-options='{"orientation":"horizontal"}'>
```

### Vertical

Items stack top-to-bottom in a flex column. Panels appear to the right of their trigger (`left: calc(100% + 8px); top: 0`). Arrow keys `⏶`/`⏷` move between triggers. `⏵` from an open trigger focuses the first panel item.

```html
<nav data-plugin-navmenu
     data-plugin-options='{"orientation":"vertical"}'>
```

---

## [Viewport **Portal Mode**](#viewport)

All content panels live inside a single positioned container that moves and resizes smoothly as the active item changes.

### Required markup

```html
<nav data-plugin-navmenu
     data-plugin-options='{"useViewport":true}'>
  … items …
</nav>
<div data-navmenu-viewport></div>
```

### How it works

1. **build() — portal panels.** All `[data-navmenu-content]` panels are detached from their `[data-navmenu-item]` parents and appended to `[data-navmenu-viewport]`. Each panel's original parent is cached for `destroy()` restoration.

2. **open(index) — position viewport.** `_positionViewport(item)` measures the trigger's position relative to the nav root and sets `left` and `width` on the viewport element via `.css()`. CSS `transition` on the viewport animates the slide.

3. **Panel visibility inside viewport.** All sibling panels inside the viewport are hidden; only the active item's panel is shown. The entrance animation class fires on the panel itself.

4. **destroy() — restore.** Each panel is moved back to its cached `$originalParent` and the viewport is hidden and its inline styles cleared.

> [!NOTE]
> The viewport element needs a CSS transition for the sliding effect. The plugin's injected CSS includes: `[data-navmenu-viewport] { transition: left .2s ease, width .2s ease; }`

---

## [Recipe **Cookbook**](#recipes)

#### Standard site header nav (hover, horizontal)

```html
<nav data-plugin-navmenu
     data-plugin-options='{"openOn":"hover","delay":180}'>

  <div data-navmenu-item>
    <a href="/" data-navmenu-link>Home</a>
  </div>

  <div data-navmenu-item>
    <button data-navmenu-trigger type="button">Products</button>
    <div data-navmenu-content>
      <a href="/product-a" data-navmenu-list-item>
        <span data-navmenu-list-item-icon>A</span>
        <div>
          <div data-navmenu-list-item-title>Product A</div>
          <p data-navmenu-list-item-desc>A brief description.</p>
        </div>
      </a>
    </div>
  </div>

</nav>
```

#### Sidebar left-rail nav (click, vertical)

```html
<nav data-plugin-navmenu
     data-plugin-options='{"openOn":"click","orientation":"vertical"}'
     style="width:200px">

  <div data-navmenu-item>
    <button data-navmenu-trigger type="button">Settings</button>
    <div data-navmenu-content>
      <a class="ts-simple-item" href="/settings/account">Account</a>
      <a class="ts-simple-item" href="/settings/billing">Billing</a>
    </div>
  </div>

</nav>
```

#### Lazy-load panel content on open

```js
$('[data-plugin-navmenu]').themestrapPluginNavmenu({
  onOpen: function (item, instance) {
    const $panel = item.$content;
    if ($panel.data('loaded')) return;
    $panel.find('.loading-spinner').show();
    fetch('/api/nav-data/' + item.index)
      .then(r => r.json())
      .then(data => {
        $panel.find('.loading-spinner').hide();
        $panel.find('.panel-body').html(data.html);
        $panel.data('loaded', true);
      });
  }
});
```

#### Programmatic control

```js
const nav = $('[data-plugin-navmenu]').data('__pluginNavmenu');

nav.open(1);                           // open the second item
setTimeout(() => nav.close(), 3000);   // close after 3 seconds
$('#help-btn').on('click', () => nav.toggle(2));
```

---

## [Common **Pitfalls**](#pitfalls)

**No items found — panels never open.** The plugin only manages `[data-navmenu-item]` elements that contain **both** a `[data-navmenu-trigger]` **and** a `[data-navmenu-content]` child. Items with only one of those (plain link items) are skipped silently. Check your markup nesting.

**Viewport mode shows nothing.** When `useViewport: true` is set, you must add a `[data-navmenu-viewport]` element as a sibling of the `<nav>` element — not inside it. If the viewport is absent, the plugin skips portaling and logs a warning.

**Plugin initialises before content is in the DOM.** The default init wiring uses `$(() => {...})` (DOMReady). If nav items are injected by JS after DOMReady (e.g. AJAX), call `$('[data-plugin-navmenu]').themestrapPluginNavmenu()` manually after injection.

**Panels render behind a fixed header or modal.** The injected stylesheet sets `z-index: 1050` on `[data-navmenu-content]`. If your layout has a sticky or fixed element at a higher index, override with: `[data-navmenu-content] { z-index: 2000; }`

**Custom event names with colons not firing on jQuery off().** jQuery uses `.` as a namespace separator in `.off()`, and colons in event names create conflicts. The plugin uses hyphen-separated names (`navmenu-opened`, `navmenu-closed`) specifically to avoid this.

### Diagnostic checklist

> - Is `[data-navmenu-item]` a **direct child** of `[data-plugin-navmenu]`? The plugin uses `.children('[data-navmenu-item]')`.
> - Does each item that should have a panel contain both `[data-navmenu-trigger]` and `[data-navmenu-content]`?
> - Is jQuery loaded before `themestrap.plugin.navmenu.js`?
> - Does `$('[data-plugin-navmenu]').data('__pluginNavmenu')` return an instance?
> - Is `aria-expanded` toggling on the trigger? If not, events aren't wired.
> - Using `useViewport: true`? Does a `[data-navmenu-viewport]` sibling of the nav exist in the DOM at init time?
> - Panel hidden behind another element? Check `z-index` of fixed/sticky ancestors.
  
