# PanelNav Guide

Themestrap's vertical navigation panel. A list-group rail with a caret-right active indicator, expandable drawer-toggle parent sections, optional left icons and right-aligned metadata counts, section headings, and an actions header.

A vertical navigation panel. Mark up a plain nested list with `data-panelnav-*` attributes and the plugin decorates it into a polished rail: a caret-right indicator slides in on the active item, parent rows become animated disclosure drawers, and the active branch auto-expands on load.

---

## [How It **Works**](#how-it-works)

PluginPanelNav is a _decorator_: you provide a semantic nested list with `data-panelnav-*` hooks, and the plugin adds the classes, ARIA attributes, disclosure carets, and drawer wrappers needed to make it interactive. Nothing is rendered from scratch — your markup (or the `tsPanelNav` snippet output) stays the source of truth.

### Layer 1 — Decoration

On init the plugin walks the tree, tagging each region and item with `ts-panel-nav-*` classes and a depth attribute. Leaf rows get a hidden caret-right indicator; parent rows get a disclosure caret.

- Regions: `actions`, `body`, `section`
- Per-item depth drives the indent via a CSS custom property

### Layer 2 — Drawers & state

Any item with a nested `[data-panelnav-child-items]` list is wrapped in an animated drawer. Clicking the parent row toggles it; the active branch is auto-expanded on load.

- `ts-panel-nav-item--open` — drawer expanded
- `ts-panel-nav-item--active` — current leaf
- `ts-panel-nav-item--branch-active` — ancestor of current

### Four active-indicator styles

The `activeIndicator` option controls how the current item is flagged:

- **caret** — Caret-right slides in at the row end (default). The MDS signature.
- **bar** — Left accent bar grows to fill the row height.
- **both** — Combines caret + bar.
- **none** — Uses color/weight only.

> [!NOTE]
> The drawer open/close animation reuses the proven Themestrap height technique from PluginCollapsible: animate `0 → scrollHeight` px, then clear the inline height so the CSS `height:auto` open rule takes over. That keeps nested drawers from clipping when their own children expand.

---

## [Quick **Start**](#quick-start)

### Markup contract

The root carries `data-plugin-panel-nav`. Inside, an optional actions header, then a body holding one or more lists. Items are `<li>` elements; parents nest a `[data-panelnav-child-items]` list:

```html
<nav data-plugin-panel-nav
     data-plugin-options='{"activeIndicator":"caret"}'>

  <div data-panelnav-actions>
    <span data-panelnav-actions-title>My App</span>
  </div>

  <div data-panelnav-body>
    <div data-panelnav-section data-panelnav-section-title="Main">
      <ul data-panelnav-list>
        <li data-panelnav-item data-panelnav-active>
          <a href="/" data-panelnav-link>
            <i class="bi bi-house" data-panelnav-icon></i>
            <span data-panelnav-label>Dashboard</span>
            <span data-panelnav-metadata>24</span>
          </a>
        </li>

        <li data-panelnav-item data-panelnav-has-children>
          <a href="#" data-panelnav-link>
            <span data-panelnav-label>Settings</span>
          </a>
          <ul data-panelnav-child-items>
            <li data-panelnav-item><a href="/settings/general" data-panelnav-link>
              <span data-panelnav-label>General</span></a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Attribute reference

| Attribute | Element | Notes |
|-----------|---------|-------|
| `data-plugin-panel-nav` | root | Marks the root `<nav>`. Required for auto-init. |
| `data-panelnav-actions` | region | Optional header row (title + custom actions). |
| `data-panelnav-actions-title` | el | Title text inside the actions header. |
| `data-panelnav-body` | region | Scroll container wrapping the lists. Required for `fill` mode. |
| `data-panelnav-section` | region | A grouped block with its own heading. |
| `data-panelnav-section-title` | attr | Heading text for the section (read from this attribute). |
| `data-panelnav-list` | el | A `<ul>` holding items. |
| `data-panelnav-item` | el | A `<li>` row. |
| `data-panelnav-link` | el | The clickable row content (anchor or button). |
| `data-panelnav-icon` | el | Left icon element. |
| `data-panelnav-label` | el | The row text label. |
| `data-panelnav-metadata` | el | Right-aligned count or label. |
| `data-panelnav-child-items` | el | Nested `<ul>` — makes the item a drawer parent. |
| `data-panelnav-has-children` | attr | Force parent styling even with no inline child list. |
| `data-panelnav-active` | attr | Pre-mark this item (or branch) as active. |
| `data-panelnav-disabled` | attr | Render the item disabled / non-interactive. |
| `data-panelnav-separator` | attr | Render the element as a divider rule. |

### Init

```js
// Manual init
$('[data-plugin-panel-nav]').themestrapPluginPanelNav({
    activeIndicator: 'caret',
    accordion: true
});

// Auto-init (already wired in themestrap.init.js)
$('[data-plugin-panel-nav]:not(.manual)').each(function () {
  const opts = themestrap.fn.getOptions($(this).data('plugin-options'));
  $(this).themestrapPluginPanelNav(opts);
});
```

> [!TIP]
> The plugin injects a stylesheet once per page. Look for `<style id="ts-panel-nav-styles">` in `<head>` — it carries every rule plus the `--ts-pn-*` custom properties. You theme the panel by overriding those variables, not by editing the injected sheet.

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dark` | bool | `false` | Dark color scheme. |
| `bordered` | bool | `false` | Wrap the panel in a bordered, rounded card. |
| `compact` | bool | `false` | Denser row spacing and smaller text. |
| `fill` | bool | `false` | Full-height rail with an internal scroll body. Requires a `[data-panelnav-body]` wrapper. |
| `activeIndicator` | string | `'caret'` | One of `caret`, `bar`, `both`, `none`. |
| `accordion` | bool | `false` | Only one drawer open at a time — opening a sibling closes the rest. |
| `collapsible` | bool | `false` | Enable rail collapse (mini mode). Injects a chevron toggle into the actions header. |
| `collapsed` | bool | `false` | Start collapsed. Requires `collapsible`. |
| `collapsedWidth` | string | `'64px'` | Width of the collapsed icon rail (any CSS length). |
| `expandOnHover` | bool | `false` | While collapsed, temporarily expand to full width on hover. Requires `collapsible`. |
| `collapseToggleLabel` | string | `'Toggle navigation'` | Accessible `aria-label` for the collapse-toggle button. |
| `autoExpandActive` | bool | `true` | Open ancestor drawers of pre-marked active items on load. |
| `activeOnLoad` | bool | `true` | Detect the active leaf from the current page URL on load. |
| `width` | string | `'280px'` | Panel width (any CSS length). |
| `indentStep` | string | `'1rem'` | Per-level indent applied to nested rows. |
| `duration` | string | `'240ms'` | Drawer + indicator transition duration. |
| `accent` | string | `''` | Accent color override. Empty inherits the theme primary. |
| `forceInit` | bool | `true` | Skip IntersectionObserver — the rail is layout-critical, so init immediately. |

### CSS custom property overrides

Every color and dimension is a `--ts-pn-*` custom property on the root:

```css
.ts-panel-nav {
  --ts-pn-width:            280px;
  --ts-pn-accent:           #2470de;
  --ts-pn-item-active-text: var(--ts-pn-accent);
  --ts-pn-indent-step:      1rem;
}

/* A bespoke teal rail in one place */
.docs-rail .ts-panel-nav {
  --ts-pn-accent: #2ab8c8;
  --ts-pn-bg:     #fbfdfe;
}
```

> [!WARNING]
> `activeOnLoad` matches the current page URL against each leaf's real `href` (origin + normalised path). Parent rows use `href="#"` by design — they are disclosure toggles, not links — so they are never matched as the active leaf. Pre-mark a parent branch with `data-panelnav-active` if you need it highlighted.

---

## [Rail **Collapse**](#collapse)

Set `collapsible: true` and the panel can shrink to a narrow icon-only rail. A chevron toggle button is injected into the actions header, and the whole panel animates between `width` and `collapsedWidth`. Labels, metadata, carets and section titles fade to icons only; the active bar still shows.

```html
<nav data-plugin-panel-nav
     data-plugin-options='{"collapsible":true}'>
  <div data-panelnav-actions>
    <span data-panelnav-actions-title>Console</span>
    <!-- the chevron toggle is injected here automatically -->
  </div>
  <div data-panelnav-body>
    <ul data-panelnav-list>...</ul>
  </div>
</nav>
```

### Collapse options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsible` | bool | `false` | Master switch. Adds the toggle button and enables the collapse API. |
| `collapsed` | bool | `false` | Start in the collapsed state (no first-paint animation). |
| `collapsedWidth` | string | `'64px'` | Width of the collapsed rail. |
| `expandOnHover` | bool | `false` | While collapsed, restore full width + contents on hover; collapses again on mouse-out. |
| `collapseToggleLabel` | string | `'Toggle navigation'` | The button's `aria-label`. |

### Driving it from code

```js
const inst = $('#appNav').data('__pluginPanelNav');

inst.collapse();        // shrink to the icon rail
inst.expand();          // back to full width
inst.toggleCollapse();  // flip
inst.isCollapsed();     // => true | false

// React to state changes
$('#appNav').on('collapse.ts.panelnav', (e, d) => {
  document.body.classList.toggle('nav-mini', d.collapsed);
});
```

> [!TIP]
> All of mini mode is driven by a single `ts-panel-nav--collapsed` class on the root — the JS only toggles that one class, and the injected stylesheet does the rest.

---

## [Instance **API**](#instance-api)

```js
const inst = $('[data-plugin-panel-nav]')
               .data('__pluginPanelNav');

const $settings = $('#nav-settings'); // an <li>
inst.open($settings);
inst.setActive($('#nav-api-keys'));
```

| Method | Returns | Description |
|--------|---------|-------------|
| `open($item)` | this | Open a parent item's drawer (no-op if already open or it has no children). |
| `close($item)` | this | Close a parent item's drawer. |
| `toggle($item)` | this | Toggle a parent item's drawer. |
| `expandAll()` | this | Open every drawer in the panel. |
| `collapseAll()` | this | Close every drawer in the panel. |
| `setActive($item)` | this | Mark a leaf active, clear the previous active item, set `aria-current`, and open all ancestor drawers. |
| `getActive()` | jQuery | Return the currently active item (may be an empty set). |
| `collapse()` | this | Collapse the panel to the mini/icon-only rail. Requires `collapsible`. |
| `expand()` | this | Expand the panel back to full width. |
| `toggleCollapse()` | this | Toggle between collapsed and expanded. |
| `isCollapsed()` | bool | Whether the panel is currently collapsed. |
| `refresh()` | instance | Destroy and re-initialise with the same options. Returns the new instance. |
| `destroy()` | this | Full teardown — removes classes, injected nodes, drawers, ARIA attributes, and handlers. |

### Events

The panel emits two namespaced events on the root element:

```js
const $nav = $('[data-plugin-panel-nav]');

// Fired when a leaf is clicked
$nav.on('item.ts.panelnav', (e, d) => {
  console.log('navigated to', d.href, d.$item, d.$link);
});

// Fired when a parent drawer opens or closes
$nav.on('drawer-toggle.ts.panelnav', (e, d) => {
  console.log('drawer', d.open ? 'opened' : 'closed', d.$item);
});
```

| Event | Arguments | Description |
|-------|-----------|-------------|
| `item.ts.panelnav` | `{$item, $link, href}` | A leaf row was clicked. Plugin has already applied active state by the time this fires. |
| `drawer-toggle.ts.panelnav` | `{$item, open}` | A parent drawer finished toggling. `open` is the new boolean state. |
| `collapse.ts.panelnav` | `{collapsed}` | The rail collapsed or expanded. `collapsed` is the new boolean state. |

> [!NOTE]
> Leaf clicks on real anchors with a valid `href` are _not_ prevented — the browser still navigates. The event fires first so you can hook analytics or a SPA router. For SPA use, call `e.preventDefault()` in your `item.ts.panelnav` handler and route via `d.href` yourself.

---

## [Recipe **Cookbook**](#recipes)

#### App left rail (full height)

```html
<nav data-plugin-panel-nav
     data-plugin-options='{"fill":true,"bordered":true}'
     style="height:100vh;">
  <div data-panelnav-actions>
    <span data-panelnav-actions-title>Console</span>
  </div>
  <div data-panelnav-body>
    <ul data-panelnav-list>...</ul>
  </div>
</nav>
```

#### One drawer open at a time

```js
$('[data-plugin-panel-nav]')
  .themestrapPluginPanelNav({ accordion: true });
```

#### Dark rail with teal accent

```html
<nav data-plugin-panel-nav
     data-plugin-options='{"dark":true,"accent":"#2ab8c8"}'>
  <div data-panelnav-body>
    <ul data-panelnav-list>...</ul>
  </div>
</nav>
```

#### Intercept for client routing (SPA)

```js
$('#appNav').on('item.ts.panelnav', (e, d) => {
  e.preventDefault();
  router.navigate(d.href);   // your SPA router
});
```

#### Live metadata badges

```js
// Update an unread count on a row
$('#nav-inbox')
  .find('[data-panelnav-metadata]')
  .text(unreadCount);
```

---

## [Common **Pitfalls**](#pitfalls)

**Parent rows are disclosures, not links.** An item with a nested `[data-panelnav-child-items]` list is treated as a disclosure toggle. The plugin intercepts its click with `preventDefault()` and opens/closes the drawer instead of navigating — so give parent rows `href="#"`. If a parent must _also_ be a destination, add a separate leaf child linking to it (e.g. an "Overview" row).

**`fill` mode needs a body wrapper.** `fill: true` makes the panel a flex column with an internally scrolling region — but only if the lists are inside a `[data-panelnav-body]` element. Without it the actions header scrolls away with the content. Always wrap lists in a body when using `fill`.

**Active detection only matches leaves.** `activeOnLoad` compares the current URL against each leaf's real `href`. Parents (`href="#"`) are skipped. To highlight a parent branch on load, mark it (or its current child) with `data-panelnav-active` in the markup, and let `autoExpandActive` open the branch.

**Multiple panels on one page.** Each parent drawer gets a unique generated `id` for its `aria-controls` wiring, so several independent panels coexist safely. The injected stylesheet is shared (one `<style id="ts-panel-nav-styles">` for the whole page) — that is intentional and correct.

### Diagnostic checklist

> - Is `<style id="ts-panel-nav-styles">` present in `<head>`?
> - Does the root carry `data-plugin-panel-nav` and did init run (check for `.ts-panel-nav`)?
> - Are parent items giving their child list `data-panelnav-child-items` (not just a bare `<ul>`)?
> - Do parent rows use `href="#"` rather than a real URL?
> - For `fill` mode — are the lists inside `[data-panelnav-body]`?
> - For URL active-matching — do leaf hrefs resolve to the same origin + path as the current page?
