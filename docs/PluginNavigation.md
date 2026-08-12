# PluginNavigation

A single Themestrap plugin that unifies **PluginSideNav**, **PluginPanelNav**, and **PluginNavMenu** under one shared `data-nav-*` attribute namespace, one CSS token layer, and one jQuery bridge.

Switch between modes with a single option:

| `mode` | Behaviour |
|---|---|
| `"sidebar"` | Collapsible icon-rail sidebar with header/footer zones, group labels, badge counts, animated sub-drawers, and responsive collapse. |
| `"panel"` | Fixed-width vertical nav panel with depth-indented children, metadata column, section headings, accordion mode, and Morningstar-style active indicator. |
| `"megamenu"` | Horizontal or vertical mega-menu bar with hover or click opening, animated content panels, viewport portal, mutual exclusion, and full keyboard navigation. |

---

## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.navigation.js"></script>
```

The plugin injects its own `<style id="ts-nav-styles">` on first use — no separate CSS import is needed.

### Minimal sidebar

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"sidebar","showToggle":true}'>

  <div data-nav-header>
    <div data-nav-logo><i class="bi bi-layers-fill"></i></div>
    <span data-nav-title>My App</span>
  </div>

  <div data-nav-body>
    <div data-nav-section data-nav-section-title="Main">
      <ul data-nav-list>
        <li data-nav-item data-nav-active>
          <a href="/dashboard" data-nav-link>
            <i class="bi bi-house" data-nav-icon></i>
            <span data-nav-label>Dashboard</span>
            <span data-nav-badge>3</span>
          </a>
        </li>
        <li data-nav-item data-nav-has-children>
          <div data-nav-link>
            <i class="bi bi-gear" data-nav-icon></i>
            <span data-nav-label>Settings</span>
          </div>
          <ul data-nav-child-items>
            <li data-nav-item><a href="/settings/general" data-nav-link><span data-nav-label>General</span></a></li>
            <li data-nav-item><a href="/settings/api"     data-nav-link><span data-nav-label>API Keys</span></a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <div data-nav-footer>
    <ul data-nav-list>
      <li data-nav-item>
        <a href="/logout" data-nav-link>
          <i class="bi bi-box-arrow-right" data-nav-icon></i>
          <span data-nav-label>Sign Out</span>
        </a>
      </li>
    </ul>
  </div>
</nav>
```

### Minimal panel

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"panel","activeIndicator":"caret","bordered":true}'>

  <div data-nav-actions>
    <span data-nav-actions-title>Console</span>
  </div>

  <div data-nav-body>
    <div data-nav-section data-nav-section-title="Overview">
      <ul data-nav-list>
        <li data-nav-item data-nav-active>
          <a href="#" data-nav-link>
            <i class="bi bi-house" data-nav-icon></i>
            <span data-nav-label>Home</span>
            <span data-nav-metadata>24</span>
          </a>
        </li>
        <li data-nav-item data-nav-has-children>
          <div data-nav-link>
            <i class="bi bi-folder" data-nav-icon></i>
            <span data-nav-label>Files</span>
          </div>
          <ul data-nav-child-items>
            <li data-nav-item><a href="#" data-nav-link><span data-nav-label>Documents</span></a></li>
            <li data-nav-item><a href="#" data-nav-link><span data-nav-label>Images</span></a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Minimal megamenu

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"megamenu","openOn":"hover","delay":200}'>

  <div data-nav-item>
    <a href="/" data-nav-link>Home</a>
  </div>

  <div data-nav-item>
    <button data-nav-trigger type="button">Products</button>
    <div data-nav-content>
      <a href="/alpha" data-nav-list-item>
        <span data-nav-list-item-icon>🧩</span>
        <div>
          <div data-nav-list-item-title>Alpha</div>
          <p data-nav-list-item-desc>Alpha product description.</p>
        </div>
      </a>
    </div>
  </div>

</nav>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// Navigation (hybrid)
if ($.isFunction($.fn['themestrapPluginNavigation']) &&
    $('[data-plugin-navigation]').length) {
    themestrap.fn.dynIntObsInit(
        '[data-plugin-navigation]:not(.manual)',
        'themestrapPluginNavigation',
        themestrap.PluginNavigation.defaults
    );
}
```

> `forceInit: true` is set in defaults, so `dynIntObsInit` initialises immediately without waiting for the element to enter the viewport — correct for layout-critical navigation.

---

## Data Attributes

### Sidebar + Panel mode

| Attribute | Element | Notes |
|---|---|---|
| `data-plugin-navigation` | Root element | Plugin init hook. Add `data-plugin-options` here. |
| `data-nav-header` | Direct child | Header region containing logo/title/toggle (sidebar). |
| `data-nav-logo` | Child of header | Logo wrapper. |
| `data-nav-title` | Child of header | Title text element. |
| `data-nav-toggle` | Child of header | Collapse toggle button. Plugin injects one automatically when `showToggle: true`. |
| `data-nav-actions` | Direct child | Panel actions / title bar (panel mode). |
| `data-nav-actions-title` | Child of actions | Title text inside the actions bar. |
| `data-nav-body` | Direct child | Scrollable nav body. Required for `fill: true` mode. |
| `data-nav-footer` | Direct child | Footer region (sidebar). |
| `data-nav-section` | Inside body | Logical section / group wrapper. |
| `data-nav-section-title="Label"` | On section element | Section heading text. Can also be a child element with `data-nav-section-label`. |
| `data-nav-list` | `<ul>` | List container. Plugin adds `.ts-nav__list`. |
| `data-nav-item` | List item wrapper | One nav item. |
| `data-nav-link` | `<a>` or `<button>` inside item | The interactive row. Plugin synthesises one if absent. |
| `data-nav-active` | On item | Pre-mark this item as active on load. |
| `data-nav-has-children` | On item | Declare parent without a child list element. |
| `data-nav-disabled` | On item | Disable the item (muted, pointer-events none). |
| `data-nav-icon` | Slot inside link row | Icon element. |
| `data-nav-label` | Slot inside link row | Text label. |
| `data-nav-badge` | Slot inside link row | Badge count. |
| `data-nav-metadata` | Slot inside link row | Right-aligned count or label (panel mode). |
| `data-nav-child-items` | Inside item | Nested `<ul>` — becomes an animated drawer. |
| `data-nav-separator` | Inside list / section | Horizontal rule (`<li>` or `<div>`). |

### Megamenu mode

| Attribute | Element | Notes |
|---|---|---|
| `data-nav-item` | Direct child of root | Top-level menu item. |
| `data-nav-link` | `<a>` inside item | Plain link — no panel, hover styling only. |
| `data-nav-trigger` | `<button>` inside item | Opens/closes the sibling content panel. Plugin wires ARIA and a chevron. |
| `data-nav-content` | Sibling of trigger | Dropdown panel — any HTML is valid inside. |
| `data-nav-viewport` | Sibling of root `<nav>` | Optional. Receives all panels when `useViewport: true`. |
| `data-nav-list-item` | `<a>` inside panel | Rich link layout: icon + title + description. |
| `data-nav-list-item-icon` | Inside list item | Icon cell with rounded background. |
| `data-nav-list-item-title` | Inside list item | Bold title line. |
| `data-nav-list-item-desc` | `<p>` inside list item | Muted description paragraph. |

---

## Options

All options are merged as: `PluginNavigation.defaults → JS opts argument → data-plugin-options JSON`. Later values win.

### Universal

| Key | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `"sidebar"` | Layout mode. `"sidebar"` \| `"panel"` \| `"megamenu"`. |
| `dark` | bool | `false` | Apply dark colour scheme via `.ts-nav--dark`. |
| `compact` | bool | `false` | Denser row spacing via `.ts-nav--compact`. |
| `bordered` | bool | `false` | Wrap in a bordered card (panel mode most useful). |
| `duration` | string | `"240ms"` | CSS transition duration for drawers, width, and indicators. |
| `activeIndicator` | string | `"bar"` | Active-item indicator style. `"caret"` \| `"bar"` \| `"both"` \| `"none"`. |
| `accent` | string | `""` | Accent colour override. Any CSS `<color>`. Empty = theme default. |
| `activeOnLoad` | bool | `true` | Match active leaf by comparing item hrefs to the current URL on load. |

### Sidebar + Panel

| Key | Type | Default | Description |
|---|---|---|---|
| `fill` | bool | `false` | Stretch to fill container height. Requires `[data-nav-body]`. |
| `width` | string | `"260px"` | Nav width (sidebar + panel). Any CSS length. |
| `indentStep` | string | `"1rem"` | Per-depth indent added to nested row `padding-left`. |
| `accordion` | bool | `false` | Only one drawer open at a time. |
| `autoExpandActive` | bool | `true` | Open ancestor drawers of pre-marked `[data-nav-active]` items on load. |

### Sidebar only

| Key | Type | Default | Description |
|---|---|---|---|
| `collapsed` | bool | `false` | Start in icon-only rail mode. |
| `widthCollapsed` | string | `"64px"` | Width of the collapsed icon rail. |
| `showToggle` | bool | `false` | Inject a collapse-toggle chevron button into the header. |
| `autoCollapse` | bool | `false` | Collapse the sidebar when a leaf item is clicked. |
| `mobileBreakpoint` | number | `null` | Viewport width (px) below which the sidebar is treated as mobile. Null disables. |
| `collapseOnMobile` | bool | `false` | Auto-collapse below `mobileBreakpoint`, expand above it. |

### Megamenu only

| Key | Type | Default | Description |
|---|---|---|---|
| `orientation` | string | `"horizontal"` | Layout axis. `"horizontal"` — triggers in a row, panels drop below. `"vertical"` — triggers stacked, panels appear to the right. |
| `openOn` | string | `"hover"` | What opens panels. `"hover"` uses a debounced mouseenter. `"click"` toggles on trigger click. |
| `delay` | number | `200` | Milliseconds after `mouseenter` before opening. |
| `closeDelay` | number | `150` | Milliseconds after `mouseleave` before closing. Allows mouse transit into panel. |
| `animationIn` | string | `"ts-nav-in"` | CSS class added when a panel opens. |
| `animationOut` | string | `"ts-nav-out"` | CSS class added when a panel closes. |
| `animationDuration` | number | `200` | Fallback timeout if `animationend` never fires. |
| `useViewport` | bool | `false` | Move all content panels into `[data-nav-viewport]` for a shared animated container. |
| `closeOnEscape` | bool | `true` | Press Esc to close the active panel. Focus returns to its trigger. |
| `closeOnOutside` | bool | `true` | Click outside the nav (and viewport) to close the active panel. |
| `onOpen` | function | `null` | Callback after a panel opens. `fn(itemRecord, instance)`. |
| `onClose` | function | `null` | Callback after a panel closes. Same signature as `onOpen`. |

### Init

| Key | Type | Default | Description |
|---|---|---|---|
| `forceInit` | bool | `true` | Skip IntersectionObserver — navigation is layout-critical and should init immediately. |
| `accY` | number | `0` | IntersectionObserver root-margin offset. Unused when `forceInit` is true. |

---

## Active Indicator Styles

The `activeIndicator` option adds a modifier class and targets CSS accordingly.

| Value | Visual | When to use |
|---|---|---|
| `"bar"` | Left accent bar, `height: 62%` on the active item | Sidebar (default feel — clear spatial anchor) |
| `"caret"` | Caret-right SVG at the end of the active row (Morningstar style) | Panel where the bar would compete with depth-indent lines |
| `"both"` | Left bar + caret-right simultaneously | High-contrast needs |
| `"none"` | Colour/weight change only | Minimal or custom-styled nav |

---

## Public API

### Accessing the instance

```js
// jQuery bridge — inits if not yet done, returns instance
const nav = $('#myNav').themestrapPluginNavigation();

// Direct data access (after init)
const nav = $('#myNav').data('__pluginNavigation');
```

### Universal methods

| Method | Returns | Description |
|---|---|---|
| `setActive($item)` | `this` | Mark `$item` as the active leaf. Clears all other active/branch states, walks ancestors to open drawers and mark branch-active. |
| `setSubActive($sub)` | `this` | Same as `setActive` but for a nested child item — opens all ancestor drawers along the way. |
| `getActive()` | `{item, subItem}` or `number` | Sidebar/panel: returns `{item: jQuery, subItem: jQuery}`. Megamenu: returns active panel index or `-1`. |
| `refresh()` | new instance | `destroy()` + re-init with the same options. Returns the new instance. |
| `destroy()` | `this` | Full teardown — removes all classes, injected nodes, ARIA, event handlers, and the instance data key. DOM is otherwise left intact. |

### Sidebar methods

| Method | Returns | Description |
|---|---|---|
| `collapse()` | `this` | Collapse to icon-only rail. |
| `expand()` | `this` | Restore full width. Re-opens any drawers that were open before the collapse. |
| `toggle()` | `this` | Flip between collapsed and expanded. |
| `setCollapsed(bool)` | `this` | Programmatically set collapsed state. |

### Sidebar + Panel drawer methods

| Method | Returns | Description |
|---|---|---|
| `openGroup($item)` | `this` | Open a parent item's drawer (no-op if already open). |
| `closeGroup($item)` | `this` | Close a parent item's drawer. |
| `toggleGroup($item)` | `this` | Toggle a parent item's drawer. |
| `expandAll()` | `this` | Open every drawer in the navigation. |
| `collapseAll()` | `this` | Close every open drawer. |

### Megamenu methods

| Method | Returns | Description |
|---|---|---|
| `open(index)` | `this` | Open the panel at zero-based index. Closes any previously open panel first. |
| `close()` | `this` | Close the active panel with the exit animation. |
| `togglePanel(index)` | `this` | Open if closed; close if the same index is already active. |
| `getActivePanel()` | `number` | Index of the open panel, or `-1` if none. |

---

## Events

All events are fired on the root element. jQuery `.on()` and native `addEventListener` both work.

| Event | Mode | Detail / Data | When |
|---|---|---|---|
| `sidebar.toggle.ts.navigation` | sidebar | `{ collapsed: bool }` | After collapse/expand state changes. |
| `drawer.toggle.ts.navigation` | sidebar, panel | `{ $item, open: bool }` | After a drawer opens or closes. |
| `item.ts.navigation` | sidebar, panel | `{ $item, $link, href }` | After a leaf item is clicked and activated. |
| `panel.open.ts.navigation` | megamenu | `{ index, $item }` | After a content panel opens. |
| `panel.close.ts.navigation` | megamenu | `{ index, $item }` | After a content panel closes. |

```js
// jQuery
$('#myNav').on('sidebar.toggle.ts.navigation', function (e, data) {
    console.log('collapsed:', data.collapsed);
});

$('#myNav').on('item.ts.navigation', function (e, data) {
    console.log('clicked:', data.href);
});

// Native (megamenu events also bubble natively)
document.querySelector('#myNav').addEventListener('panel.open.ts.navigation', (e) => {
    console.log('opened panel index:', e.detail.index);
});
```

---

## CSS Custom Properties

All colour values in the injected stylesheet are written as `var(--ts-nav-*, fallback)`. Override per-element or on a parent:

```css
/* Teal accent for a specific nav instance */
#myNav {
    --ts-nav-accent:             #2ab8c8;
    --ts-nav-item-active-text:   #2ab8c8;
    --ts-nav-item-active-border: #2ab8c8;
}
```

### Full token reference

| Token | Controls | Default (light) |
|---|---|---|
| `--ts-nav-width` | Expanded sidebar/panel width | `260px` |
| `--ts-nav-width-collapsed` | Collapsed sidebar width | `64px` |
| `--ts-nav-duration` | Transition duration | `240ms` |
| `--ts-nav-easing` | Transition easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--ts-nav-font-size` | Base font size | `0.875rem` |
| `--ts-nav-item-pad-y` | Item row vertical padding | `0.5rem` |
| `--ts-nav-item-pad-x` | Item row horizontal padding | `1rem` |
| `--ts-nav-indent-step` | Per-depth child indent | `1rem` |
| `--ts-nav-bg` | Nav background | `#ffffff` |
| `--ts-nav-border-color` | Borders and separators | `#e6e9ee` |
| `--ts-nav-header-bg` | Header zone background (sidebar) | `#f8f9fa` |
| `--ts-nav-footer-bg` | Footer zone background (sidebar) | `#f1f3f5` |
| `--ts-nav-text` | Default text colour | `#1c1f23` |
| `--ts-nav-text-muted` | Muted / secondary text | `#6b7785` |
| `--ts-nav-icon-color` | Icon colour (inactive) | `#6b7785` |
| `--ts-nav-accent` | Accent / brand colour | `var(--color-primary, #2470de)` |
| `--ts-nav-item-hover-bg` | Row hover background | `#f4f6f8` |
| `--ts-nav-item-active-bg` | Active row background | `transparent` |
| `--ts-nav-item-active-text` | Active row text | `var(--ts-nav-accent)` |
| `--ts-nav-item-active-border` | Left-bar / caret colour | `var(--ts-nav-accent)` |
| `--ts-nav-section-title-color` | Section heading colour | `#8a93a0` |
| `--ts-nav-badge-bg` | Badge background | `#e5e7eb` |
| `--ts-nav-badge-color` | Badge text | `#374151` |
| `--ts-nav-badge-active-bg` | Badge background (active) | `#dbeafe` |
| `--ts-nav-badge-active-color` | Badge text (active) | `var(--ts-nav-accent)` |
| `--ts-nav-content-bg` | Megamenu panel background | `#ffffff` |
| `--ts-nav-content-border` | Panel border colour | `rgba(0,0,0,.08)` |
| `--ts-nav-content-shadow` | Panel box shadow | `0 4px 24px rgba(0,0,0,.10)…` |
| `--ts-nav-muted-text` | Description text in list items | `rgba(0,0,0,.55)` |
| `--ts-nav-focus-ring` | Focus outline colour | `var(--ts-nav-accent)` |

---

## Keyboard Navigation

### Sidebar + Panel

| Key | Action |
|---|---|
| `Space` / `Enter` | Activate or toggle the focused item (injected `role="button"` rows). |
| `Tab` | Standard focus traversal through the nav. |

### Megamenu

| Key | Context | Action |
|---|---|---|
| `Enter` / `Space` | On a trigger | Toggle the content panel. |
| `Escape` | Anywhere, panel open | Close the active panel; return focus to its trigger. |
| `←` / `→` | On a trigger (horizontal) | Move focus to the previous/next trigger. |
| `↑` / `↓` | On a trigger (vertical) | Move focus to the previous/next trigger. |
| `↓` | Trigger, horizontal, panel open | Move focus to the first focusable element inside the panel. |
| `→` | Trigger, vertical, panel open | Move focus to the first focusable element inside the panel. |

---

## Recipes

### Sidebar with responsive collapse

```html
<nav data-plugin-navigation
     data-plugin-options='{
       "mode":"sidebar",
       "showToggle":true,
       "mobileBreakpoint":768,
       "collapseOnMobile":true
     }'>
  …
</nav>
```

### Dark accordion panel

```html
<nav data-plugin-navigation
     data-plugin-options='{
       "mode":"panel",
       "dark":true,
       "accordion":true,
       "activeIndicator":"both",
       "bordered":true
     }'>
  …
</nav>
```

### Click-to-open vertical megamenu

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"megamenu","openOn":"click","orientation":"vertical"}'>
  <div data-nav-item>
    <button data-nav-trigger type="button">Settings</button>
    <div data-nav-content style="min-width:180px">
      <a href="/settings/account" class="simple-link">Account</a>
      <a href="/settings/billing" class="simple-link">Billing</a>
    </div>
  </div>
</nav>
```

### Viewport portal (animated sliding panel)

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"megamenu","useViewport":true,"openOn":"hover"}'>
  <div data-nav-item>
    <button data-nav-trigger type="button">Products</button>
    <div data-nav-content><!-- panel A --></div>
  </div>
  <div data-nav-item>
    <button data-nav-trigger type="button">Docs</button>
    <div data-nav-content><!-- panel B --></div>
  </div>
</nav>
<!-- Required sibling element -->
<div data-nav-viewport></div>
```

### Programmatic control

```js
const nav = $('#myNav').data('__pluginNavigation');

// Sidebar
nav.collapse();
nav.expand();
nav.toggle();
nav.expandAll();
nav.collapseAll();

// Panel — open a specific drawer
const $item = $('#myNav').find('[data-nav-item]').eq(2);
nav.openGroup($item);

// Megamenu — open panel 1, close after 3s
nav.open(1);
setTimeout(() => nav.close(), 3000);

// Set active programmatically
const $leaf = $('#myNav').find('.ts-nav__item:not(.ts-nav__item--has-children)').first();
nav.setActive($leaf);

// Teardown and rebuild
nav.destroy();
$('#myNav').themestrapPluginNavigation({ mode: 'panel', accordion: true });
```

### Listen for events

```js
const $nav = $('#myNav');

// Sidebar
$nav.on('sidebar.toggle.ts.navigation', (e, d) => {
    console.log('collapsed:', d.collapsed);
});

// Drawer open/close (sidebar + panel)
$nav.on('drawer.toggle.ts.navigation', (e, d) => {
    console.log('drawer', d.open ? 'opened' : 'closed', d.$item);
});

// Leaf item clicked (sidebar + panel)
$nav.on('item.ts.navigation', (e, d) => {
    console.log('navigating to', d.href);
});

// Megamenu panel (jQuery)
$nav.on('panel.open.ts.navigation',  (e, d) => console.log('panel', d.index, 'opened'));
$nav.on('panel.close.ts.navigation', (e, d) => console.log('panel', d.index, 'closed'));
```

---

## ARIA Wiring

The plugin sets and updates ARIA attributes automatically. Do not set these manually.

### Sidebar + Panel

| Element | Attribute | When set |
|---|---|---|
| Active `[data-nav-link]` | `aria-current="page"` | Leaf item marked active. |
| Parent `[data-nav-link]` | `aria-expanded` | `"true"` when drawer open, `"false"` when closed. |
| Parent `[data-nav-link]` | `aria-controls` | Auto-generated `id` of the drawer `<div>`. |
| `[data-nav-link]` (non-anchor) | `role="button"` or `role="link"` | Injected on synthesised spans. |
| `[data-nav-disabled]` | `aria-disabled="true"` | On the link row of a disabled item. |
| Root element | `role="navigation"` | Set if absent. |

### Megamenu

| Element | Attribute | Value |
|---|---|---|
| `[data-nav-trigger]` | `aria-expanded` | `"true"` / `"false"` toggled with panel state. |
| `[data-nav-trigger]` | `aria-controls` | Auto-generated `id` of the content panel. |
| `[data-nav-trigger]` | `aria-haspopup` | `"true"`. |
| `[data-nav-content]` | `role` | `"region"`. |
| `[data-nav-content]` | `aria-labelledby` | `id` of the associated trigger. |

---

## Common Pitfalls

**Sidebar/panel items never become active on load**
`activeOnLoad` matches hrefs against the current URL using the URL API. Items with `href="#"` or no `href` will never match. Use real paths or add `data-nav-active` directly in markup to pre-mark items.

**Child drawers don't animate**
The drawer animation requires `[data-nav-child-items]` to be a direct child of `[data-nav-item]`. The plugin wraps it in a `.ts-nav__drawer` shell; if you nest it more deeply the shell is missing and height animation won't work.

**Megamenu: panel items have no trigger/content — panel never opens**
The plugin only manages `[data-nav-item]` elements that contain **both** `[data-nav-trigger]` and `[data-nav-content]` as children. Items with only one (plain links) are skipped silently. Check nesting.

**Megamenu: panel renders behind a fixed header**
The injected CSS sets `z-index: 1050` on `[data-nav-content]`. Override for your layout: `[data-nav-content] { z-index: 2000; }`.

**useViewport mode shows nothing**
`[data-nav-viewport]` must be a **sibling** of the `<nav>` element (not inside it) and must exist in the DOM at init time. The plugin uses `.siblings('[data-nav-viewport]')` to locate it.

**Collapsed sidebar: expanded drawers are visible**
The CSS rule `.ts-nav--sidebar.ts-nav--collapsed .ts-nav__drawer { height: 0 !important; overflow: hidden; }` suppresses drawers visually. If it's being overridden, check for conflicting specificity in your own stylesheet.

**`accordion: true` not closing siblings**
Accordion closes siblings via `$item.siblings('.ts-nav__item--has-children.ts-nav__item--open')`. This only works if all drawer-parent items are at the same nesting level inside the same list. Accordion has no effect across sections or across depth levels.

**Plugin initialised before nav HTML is in the DOM**
The default wiring uses `dynIntObsInit` which respects `forceInit: true` and runs at DOMReady. If nav items are injected by AJAX after DOMReady, call the jQuery bridge manually after injection. Re-calling on an already-inited element is safe (guarded by `$el.data(instanceName)` check).

**Diagnostic checklist**

- Does `$('#myNav').data('__pluginNavigation')` return an instance object?
- In sidebar/panel mode: does each `[data-nav-item]` have a `[data-nav-link]` or a native `<a>`/`<button>` as a child?
- In megamenu mode: does each trigger item contain **both** `[data-nav-trigger]` and `[data-nav-content]` as direct children of the same `[data-nav-item]`?
- Is the `[data-nav-content]` element positioned correctly (inside `[data-nav-item]`, not outside)?
- Is jQuery loaded before `themestrap.js` and before `themestrap.plugin.navigation.js`?
- Does `aria-expanded` toggle on triggers when you interact? If not, events are not wired.
- Using `useViewport: true`? Does `[data-nav-viewport]` exist as a sibling of the nav at init time?