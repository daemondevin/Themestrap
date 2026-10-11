# SideNav vs PanelNav vs VerticalNav

Three Themestrap plugins render a vertical navigation list. They overlap enough to be confusing and differ enough that picking the wrong one costs real rework. This guide compares them side by side, from the shipped source, so you can choose quickly and avoid the sharp edges of each.

| Plugin | One-line identity |
|---|---|
| **PluginSideNav** | A collapsible application sidebar: header, scrolling body, footer, labeled groups, badges, two-level sub-menus, icon-only rail, responsive auto-collapse. |
| **PluginPanelNav** | A fixed-width navigation panel: unlimited nesting depth, section headings, right-aligned metadata, accordion mode, caret-right active indicator. No collapsed rail. |
| **PluginVerticalNav** | A class-driven mini-sidebar: hand-authored `ts-vn-*` markup, hamburger toggle, one level of groups, Bootstrap tooltips in mini mode, optional content push. |

> [!TIP]
> Looking for one plugin that covers sidebar and panel with a shared `data-nav-*` namespace? See `PluginNavigation.md` (PluginNavigation). VerticalNav is not part of it.

---

## Quick Decision Guide

Answer these in order and stop at the first match.

1. **Do you need a collapsible icon rail that also auto-collapses on small screens?**
   Use **SideNav** (`mobileBreakpoint` + `collapseOnMobile`). VerticalNav also collapses, but only via its toggle and a CSS width rule (see Pitfalls).
2. **Do you need more than two levels of nesting, a metadata column, or accordion behavior?**
   Use **PanelNav**. It is the only one that recurses to any depth and the only one with `accordion`.
3. **Do you want to write plain class-based markup with no `data-*` slots, and push page content when the nav collapses?**
   Use **VerticalNav** (`toggleTarget`).
4. **Do you need theme-aware dark mode that follows `html.dark`?**
   Use **SideNav**. PanelNav needs `dark: true`; VerticalNav ships dark by default with a `.ts-vn-light` override.
5. **Is the nav a card or a drawer body rather than a page-level sidebar?**
   Use **PanelNav** (`bordered`, `fill`, fixed `width`).

If none of these decide it, default to **SideNav** for app shells and **PanelNav** for documentation or settings trees.

---

## At a Glance

| | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| **Source file** | `themestrap.plugin.sidenav.js` | `themestrap.plugin.panelnav.js` | `themestrap.plugin.verticalnav.js` |
| **Root attribute** | `data-plugin-sidenav` | `data-plugin-panelnav` | `data-plugin-vertical-nav` |
| **Markup style** | `data-sidenav-*` slots | `data-panelnav-*` slots | `ts-vn-*` classes written by hand |
| **jQuery bridge** | `$.fn.themestrapPluginSideNav` | `$.fn.themestrapPluginPanelNav` | `$.fn.themestrapPluginVerticalNav` |
| **Instance key** | `__pluginSideNav` | `__pluginPanelNav` | `__verticalNav` (no `plugin` prefix) |
| **Namespace class** | `PluginSideNav` | `PluginPanelNav` | `PluginVerticalNav` |
| **Root CSS class** | `.ts-sidenav` | `.ts-panel-nav` | `.ts-vertical-nav` |
| **Token prefix** | `--ts-sidenav-*` | `--ts-pn-*` | `--ts-vn-*` |
| **Injected style ID** | `ts-sidenav-styles` | `ts-panel-nav-styles` | `ts-verticalnav-styles` |
| **Default width** | 260px | 280px | 220px |
| **Collapsed rail** | Yes, 64px | No | Yes, 56px |
| **Nesting depth** | 2 (item, sub-item) | Unlimited | 2 (link, group child) |
| **Header / footer zones** | Both | Actions bar only | Both (class based) |
| **Group / section labels** | `data-sidenav-group` | `data-panelnav-section` | `.ts-vn-section-label` |
| **Badges** | Yes | No (metadata text instead) | No |
| **Right metadata column** | No | Yes | No |
| **Accordion** | No | Yes | No |
| **Active indicator** | Left bar | `caret`, `bar`, `both`, `none` | Left bar |
| **Responsive** | JS resize handler (opt in) | None | CSS media query only |
| **Tooltips when collapsed** | Pure CSS via attribute | None | Bootstrap 5 Tooltip |
| **Content push helper** | No | No | `toggleTarget` |
| **Height animation** | CSS transition + `scrollHeight` | CSS transition + `scrollHeight` | jQuery `.animate()` |
| **Needs jQuery effects** | No | No | Yes (not the slim build) |
| **Needs Bootstrap JS** | No | No | Optional (tooltips) |
| **Init wiring** | DOM ready loop | DOM ready loop | `intObsInit` |
| **`destroy()` behavior** | Strips classes and nodes | Strips classes and nodes | Restores the original HTML string |
| **`refresh()`** | Yes | Yes | No |

---

## How Each One Works

### SideNav

The root becomes a flex column: **header**, scrolling **body**, **footer**. Items live directly in the body or inside labeled **groups**. Each item *is* the interactive element (an `<a>` or a `role="button"` element), and carries an icon, a label, an optional badge, and an optional chevron. Parent items hold a `data-sidenav-sub-items` container that the plugin wraps in an animated `.ts-sidenav__sub-shell`.

Collapsing toggles `.ts-sidenav--collapsed`. Labels, badges, chevrons and group titles fade out by CSS, sub-shells are forced to height 0, and each item gains a pure-CSS tooltip from `data-ts-sidenav-tooltip` (set automatically from the label text).

### PanelNav

The root is a plain block with a fixed width. Content is organized as **actions bar**, **body**, **sections**, **lists**, **items**. Unlike SideNav, an item is a *wrapper* around a separate link row, and parents hold a `data-panelnav-child-items` list that the plugin wraps in a `.ts-panel-nav-drawer`. Decoration recurses, so every level gets a `--ts-pn-depth` value that drives the indent.

Parent rows are always disclosure widgets: clicking them toggles the drawer and never navigates. Leaves get an injected caret-right that becomes visible on the active item when `activeIndicator` is `caret` or `both`.

### VerticalNav

The plugin adds almost nothing to your markup. You write the structure with `ts-vn-*` classes (`.ts-vn-link`, `.ts-vn-group`, `.ts-vn-group-trigger`, `.ts-vn-group-children`, and so on). At build time it injects a hamburger toggle, group carets, ARIA attributes, and sets group children to height 0. Group open and close are animated with jQuery `.animate()`.

Collapsing toggles `.ts-vn-collapsed`, hides text, carets and labels by CSS, hides group children with `display: none`, and (optionally) creates Bootstrap tooltips for every row.

---

## Markup Reference

The same navigation in all three plugins: one active link, one expandable group with two children, and a footer link.

### SideNav

```html
<nav data-plugin-sidenav
     data-plugin-options='{"showToggle":true}'>

  <div data-sidenav-header>
    <div data-sidenav-logo><i class="bi bi-layers-fill"></i></div>
    <span data-sidenav-title>My App</span>
  </div>

  <div data-sidenav-body>
    <div data-sidenav-group data-sidenav-group-title="Main">
      <a href="/dashboard" data-sidenav-item data-sidenav-active>
        <i class="bi bi-house" data-sidenav-icon></i>
        <span data-sidenav-label>Dashboard</span>
        <span data-sidenav-badge>3</span>
      </a>

      <div data-sidenav-item data-sidenav-has-children>
        <i class="bi bi-gear" data-sidenav-icon></i>
        <span data-sidenav-label>Settings</span>
        <div data-sidenav-sub-items>
          <a href="/settings/profile" data-sidenav-sub-item>Profile</a>
          <a href="/settings/account" data-sidenav-sub-item>Account</a>
        </div>
      </div>
    </div>
  </div>

  <div data-sidenav-footer>
    <a href="/logout" data-sidenav-item>
      <i class="bi bi-box-arrow-right" data-sidenav-icon></i>
      <span data-sidenav-label>Sign Out</span>
    </a>
  </div>
</nav>
```

### PanelNav

```html
<nav data-plugin-panelnav
     data-plugin-options='{"bordered":true}'>

  <div data-panelnav-actions>
    <span data-panelnav-actions-title>Console</span>
  </div>

  <div data-panelnav-body>
    <div data-panelnav-section data-panelnav-section-title="Main">
      <ul data-panelnav-list>
        <li data-panelnav-item data-panelnav-active>
          <a href="/dashboard" data-panelnav-link>
            <i class="bi bi-house" data-panelnav-icon></i>
            <span data-panelnav-label>Dashboard</span>
            <span data-panelnav-metadata>3</span>
          </a>
        </li>

        <li data-panelnav-item data-panelnav-has-children>
          <button type="button" data-panelnav-link>
            <i class="bi bi-gear" data-panelnav-icon></i>
            <span data-panelnav-label>Settings</span>
          </button>
          <ul data-panelnav-child-items>
            <li data-panelnav-item>
              <a href="/settings/profile" data-panelnav-link>
                <span data-panelnav-label>Profile</span>
              </a>
            </li>
            <li data-panelnav-item>
              <a href="/settings/account" data-panelnav-link>
                <span data-panelnav-label>Account</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### VerticalNav

```html
<nav data-plugin-vertical-nav
     data-plugin-options='{"toggleTarget":"#page-wrapper"}'>

  <div class="ts-vn-header">
    <span class="ts-vn-brand">My App</span>
  </div>

  <div class="ts-vn-body">
    <a href="/dashboard" class="ts-vn-link active">
      <span class="ts-vn-icon"><i class="bi bi-house"></i></span>
      <span class="ts-vn-text">Dashboard</span>
    </a>

    <div class="ts-vn-group">
      <button type="button" class="ts-vn-group-trigger">
        <span class="ts-vn-icon"><i class="bi bi-gear"></i></span>
        <span class="ts-vn-text">Settings</span>
      </button>
      <div class="ts-vn-group-children">
        <a href="/settings/profile" class="ts-vn-link">Profile</a>
        <a href="/settings/account" class="ts-vn-link">Account</a>
      </div>
    </div>
  </div>

  <div class="ts-vn-footer">
    <a href="/logout" class="ts-vn-link">
      <span class="ts-vn-icon"><i class="bi bi-box-arrow-right"></i></span>
      <span class="ts-vn-text">Sign Out</span>
    </a>
  </div>
</nav>
```

### Slot mapping

| Concept | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| Header zone | `data-sidenav-header` | `data-panelnav-actions` | `.ts-vn-header` |
| Brand / title | `data-sidenav-title` | `data-panelnav-actions-title` | `.ts-vn-brand` |
| Logo | `data-sidenav-logo` | none | none |
| Toggle button | `data-sidenav-toggle` or `showToggle` | none | `.ts-vn-toggle-btn` or `toggleBtn` |
| Scrolling body | `data-sidenav-body` | `data-panelnav-body` | `.ts-vn-body` (author supplied) |
| Group / section | `data-sidenav-group` + `-group-title` | `data-panelnav-section` + `-section-title` | `.ts-vn-section-label` (a label, not a wrapper) |
| List wrapper | none | `data-panelnav-list` | none |
| Item | `data-sidenav-item` (is the link) | `data-panelnav-item` (wraps the link) | `.ts-vn-link` |
| Link row | the item itself | `data-panelnav-link` or first `a`/`button` | the `.ts-vn-link` itself |
| Icon | `data-sidenav-icon` | `data-panelnav-icon` | `.ts-vn-icon` |
| Label | `data-sidenav-label` | `data-panelnav-label` | `.ts-vn-text` |
| Badge | `data-sidenav-badge` | none | none |
| Metadata | none | `data-panelnav-metadata` | none |
| Parent flag | `data-sidenav-has-children` or a sub-items child | `data-panelnav-has-children` or a child-items child | a `.ts-vn-group` wrapper |
| Children container | `data-sidenav-sub-items` | `data-panelnav-child-items` | `.ts-vn-group-children` |
| Child item | `data-sidenav-sub-item` | nested `data-panelnav-item` | nested `.ts-vn-link` |
| Active (markup) | `data-sidenav-active`, `data-sidenav-sub-active` | `data-panelnav-active` | `.active` class |
| Disabled | `aria-disabled="true"` | `data-panelnav-disabled` | none |
| Separator | `data-sidenav-separator` | `data-panelnav-separator` | `.ts-vn-divider` |
| Footer | `data-sidenav-footer` | none | `.ts-vn-footer` |

---

## Configuration Options

Each plugin merges `defaults`, then the JS argument, then `data-plugin-options`. Later values win.

| Option | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| `collapsed` | `false` | n/a | `false` |
| `dark` | `false` | `false` | n/a |
| `width` | `'260px'` | `'280px'` | n/a (use `--ts-vn-width`) |
| `widthCollapsed` | `'64px'` | n/a | n/a (use `--ts-vn-width-collapsed`) |
| `duration` | `'250ms'` | `'240ms'` | n/a |
| `animDuration` | n/a | n/a | `260` (ms number) |
| `showToggle` / `toggleBtn` | `showToggle: false` | n/a | `toggleBtn: true` |
| `activeOnLoad` / `activeTracking` | `activeOnLoad: true` | `activeOnLoad: true` | `activeTracking: true` |
| `hashTracking` | n/a | n/a | `false` |
| `autoExpandActive` / `expandActive` | always on | `autoExpandActive: true` | `expandActive: true` |
| `autoCollapse` | `false` | n/a | n/a |
| `mobileBreakpoint` | `null` | n/a | n/a |
| `collapseOnMobile` | `false` | n/a | n/a |
| `accordion` | n/a | `false` | n/a |
| `activeIndicator` | n/a | `'caret'` | n/a |
| `bordered` | n/a | `false` | n/a |
| `compact` | n/a | `false` | n/a |
| `fill` | n/a | `false` | n/a |
| `indentStep` | n/a | `'1rem'` | n/a |
| `accent` | n/a | `''` | n/a |
| `tooltips` | CSS only, automatic | n/a | `true` |
| `toggleTarget` | n/a | n/a | `null` |
| `forceInit` | `true` (declared) | `true` (declared) | not declared |
| `accY` | `0` (declared) | `0` (declared) | not declared |

Notes:

- `forceInit` and `accY` are declared in the SideNav and PanelNav defaults, but `themestrap.init.js` wires both with a direct DOM ready loop rather than `dynIntObsInit`, so those two keys have no effect in the stock wiring.
- SideNav responsive behavior needs **both** `mobileBreakpoint` (a number) and `collapseOnMobile: true`. The breakpoint alone only toggles the `.ts-sidenav--mobile` class.
- PanelNav `activeIndicator` accepts `caret`, `bar`, `both`, `none`. Any other value falls back to `caret`.

---

## Public API

```js
// SideNav
const side = $('#nav').data('__pluginSideNav');

// PanelNav
const panel = $('#nav').data('__pluginPanelNav');

// VerticalNav
const vert = $('#nav').data('__verticalNav');
```

The jQuery bridge returns the existing instance or creates one. Note the bridge uses `.map()`, so it returns a jQuery collection whose first item is the instance.

| Method | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| Collapse to rail | `collapse()` | none | `collapse()` |
| Expand from rail | `expand()` | none | `expand()` |
| Toggle rail | `toggle()` | none | `toggle()` |
| Set rail state | `setCollapsed(bool)` | none | none |
| Open a parent | `openGroup($item)` | `open($item)` | `openGroup($group)` |
| Close a parent | `closeGroup($item)` | `close($item)` | `closeGroup($group)` |
| Toggle a parent | none public | `toggle($item)` | none public |
| Open all | none | `expandAll()` | none |
| Close all | none | `collapseAll()` | none |
| Set active | `setActive($item)` | `setActive($item)` | `setActive(href)` |
| Set active child | `setSubActive($sub)` | use `setActive` on the nested leaf | use `setActive(href)` |
| Read active | `getActive()` returns `{item, subItem}` | `getActive()` returns a jQuery item | none |
| Rebuild | `refresh()` | `refresh()` | none |
| Teardown | `destroy()` | `destroy()` | `destroy()` |

Two argument gotchas:

- **VerticalNav `setActive` takes an href string**, matched with an exact attribute selector. SideNav and PanelNav take a jQuery element.
- **VerticalNav `openGroup`/`closeGroup` take the `.ts-vn-group` wrapper**, not the trigger button. SideNav takes the item element that owns the sub-items. PanelNav takes the `li`/item wrapper, not the link row.

```js
// Same intent in each plugin: open Settings and mark Profile active
side.openGroup($('#nav [data-sidenav-item]').eq(1));
side.setSubActive($('#nav [data-sidenav-sub-item][href="/settings/profile"]'));

panel.setActive($('#nav [data-panelnav-item]').has('a[href="/settings/profile"]'));

vert.setActive('/settings/profile');
```

---

## Events

| Event | Plugin | Payload | Fires when |
|---|---|---|---|
| `toggle.ts.sidenav` | SideNav | `{ collapsed }` | Collapsed state is applied. Also fires once at build when `collapsed: true`. |
| `group-toggle.ts.sidenav` | SideNav | `{ $item, open }` | A sub-menu opens or closes by click or API. |
| `item.ts.sidenav` | SideNav | `{ $item, href }` | A leaf item is clicked. |
| `subitem.ts.sidenav` | SideNav | `{ $item, href }` | A sub-item is clicked. |
| `drawer-toggle.ts.panelnav` | PanelNav | `{ $item, open }` | A drawer opens or closes. |
| `item.ts.panelnav` | PanelNav | `{ $item, $link, href }` | A leaf is clicked. |
| `verticalNav.collapsed` | VerticalNav | none | `collapse()` runs. |
| `verticalNav.expanded` | VerticalNav | none | `expand()` runs. |

```js
// SideNav and PanelNav use the ts namespace convention
$('#nav').on('toggle.ts.sidenav', (e, d) => {
    console.log('collapsed:', d.collapsed);
});

// VerticalNav events are jQuery namespaced: type "verticalNav", namespace "collapsed"
$('#nav').on('verticalNav.collapsed', () => console.log('mini mode on'));
$('#nav').on('verticalNav.expanded',  () => console.log('mini mode off'));

// A plain "verticalNav" listener fires for both
$('#nav').on('verticalNav', () => console.log('either'));
```

VerticalNav fires no group or item events. If you need to react to navigation clicks there, bind your own delegated handler on `.ts-vn-link`.

---

## CSS Custom Properties

Override on the element or a parent. Prefixes differ per plugin.

| Concern | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| Width | `--ts-sidenav-width` | `--ts-pn-width` | `--ts-vn-width` |
| Collapsed width | `--ts-sidenav-width-collapsed` | n/a | `--ts-vn-width-collapsed` |
| Duration | `--ts-sidenav-duration` | `--ts-pn-duration` | `--ts-vn-transition` (shorthand) |
| Easing | `--ts-sidenav-easing` | `--ts-pn-easing` | inside `--ts-vn-transition` |
| Background | `--ts-sidenav-bg` | `--ts-pn-bg` | `--ts-vn-bg` |
| Border | `--ts-sidenav-border-color` | `--ts-pn-border-color` | `--ts-vn-border` |
| Text | `--ts-sidenav-text` | `--ts-pn-text` | `--ts-vn-link-color` |
| Muted text | `--ts-sidenav-text-muted` | `--ts-pn-text-muted` | none |
| Icon color | `--ts-sidenav-icon-color` | `--ts-pn-icon-color` | `--ts-vn-icon-color` |
| Active icon | `--ts-sidenav-icon-active-color` | `--ts-pn-item-active-icon` | `--ts-vn-icon-active` |
| Hover background | `--ts-sidenav-item-hover-bg` | `--ts-pn-item-hover-bg` | `--ts-vn-link-hover-bg` |
| Active background | `--ts-sidenav-item-active-bg` | `--ts-pn-item-active-bg` | `--ts-vn-link-active-bg` |
| Active text | `--ts-sidenav-item-active-color` | `--ts-pn-item-active-text` | `--ts-vn-link-active-color` |
| Active bar / mark | `--ts-sidenav-item-active-border` | `--ts-pn-active-bar` | `--ts-vn-link-active-mark` |
| Accent | via `--primary` | `--ts-pn-accent` | via `--primary` |
| Group / section title | `--ts-sidenav-group-title-color` | `--ts-pn-section-title` | none (hard coded) |
| Child indent | `--ts-sidenav-sub-item-indent` | `--ts-pn-indent-step` | `--ts-vn-group-indent` |
| Focus ring | outline uses active border | `--ts-pn-focus-ring` | `--ts-vn-focus-ring` |
| Header footprint | none | none | `--ts-vn-header-height` |
| Row height | padding based | `--ts-pn-item-pad-y` | `--ts-vn-item-height` |

Token source differs too:

- **SideNav** defaults are built from the theme variables (`--light`, `--dark`, `--primary`, `--grey`, and so on), so it inherits your theme.
- **PanelNav** uses hard-coded hex defaults except for `--ts-pn-accent`, which falls back through `--color-primary`.
- **VerticalNav** mixes theme variables (`--dark`, `--default`, `--primary`) with hard-coded values such as `#393c41` and `#49afd9`.

### Dark mode

| | How dark is applied | Follows `html.dark`? |
|---|---|---|
| SideNav | Tokens are redefined under `html.dark .ts-sidenav`. | Yes |
| PanelNav | `dark: true` adds `.ts-panel-nav--dark`, which redefines the tokens. | No |
| VerticalNav | Dark is the default. Add `.ts-vn-light` on the root for the light variant. | No |

SideNav's `dark: true` adds `.ts-sidenav--dark`, but the shipped stylesheet has no rules for that class. The option currently has no visual effect on a light page. To force a dark SideNav outside `html.dark`, override the tokens yourself.

```css
/* Force dark tokens on one SideNav without html.dark */
#forcedDark {
    --ts-sidenav-bg:          #10151c;
    --ts-sidenav-text:        #e7ecf2;
    --ts-sidenav-border-color:#232c38;
}
```

---

## Keyboard Navigation

None of the three implements roving tabindex or arrow key movement. All rely on normal tab order.

| Key | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| `Tab` | Moves through anchors and injected `role="button"` items | Moves through links and injected rows | Moves through anchors, buttons, toggle |
| `Enter` / `Space` | Activates `[role="button"]` items | Activates `.ts-panel-nav-link[role]` rows | Native button and link behavior only |
| Arrow keys | none | none | none |
| `Escape` | none | none | none |

VerticalNav's trigger and toggle are real `<button>` elements, so they activate natively. SideNav and PanelNav inject `role` and `tabindex="0"` only when the row is not an `<a>` or `<button>`, and add the key handler for those.

---

## ARIA Wiring

| Behavior | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| Root role | none added | `role="navigation"` if absent | `role="navigation"` and `aria-label="Vertical navigation"` if absent |
| Active item | `aria-current="page"` | `aria-current="page"` on the link | `aria-current="page"` |
| Active parent | active class only, no `aria-current` | branch-active class only | none |
| Parent expanded state | not set | `aria-expanded` on the link | `aria-expanded` on the trigger |
| Controls relationship | not set | `aria-controls` to the drawer id | not set |
| Popup hint | none | none | `aria-haspopup="true"` on triggers |
| Children region | none | none | `role="region"` on group children |
| Disabled | `aria-disabled` styling only | `aria-disabled="true"` | none |
| Toggle button | `aria-label="Toggle sidebar"` | n/a | `aria-expanded` and `aria-label` |

Accessibility gaps worth knowing:

- **SideNav parents expose no expanded state.** Screen reader users cannot tell whether a group is open. If that matters, add `aria-expanded` yourself in a `group-toggle.ts.sidenav` handler, or prefer PanelNav.
- **VerticalNav sets `aria-haspopup="true"` on disclosure triggers.** That announces a menu popup, which is not what an in-page disclosure is. Remove it after init if your audit flags it.
- **SideNav root has no `role="navigation"`.** Use a `<nav>` element, as in the examples.

---

## Auto-Init Wiring

```js
// VerticalNav: IntersectionObserver based
if ($.isFunction($.fn['themestrapPluginVerticalNav']) && $('[data-plugin-vertical-nav]').length) {
    themestrap.fn.intObsInit('[data-plugin-vertical-nav]:not(.manual)', 'themestrapPluginVerticalNav');
}

// SideNav: direct DOM ready loop
if ($.isFunction($.fn['themestrapPluginSideNav']) && $('[data-plugin-sidenav]').length) {
    $(() => {
        $('[data-plugin-sidenav]:not(.manual)').each(function() {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginSideNav(opts);
        });
    });
}

// PanelNav: direct DOM ready loop
if ($.isFunction($.fn['themestrapPluginPanelNav']) && $('[data-plugin-panelnav]').length) {
    $(() => {
        $('[data-plugin-panelnav]:not(.manual)').each(function() {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginPanelNav(opts);
        });
    });
}
```

The practical consequence: SideNav and PanelNav are built at DOM ready, before first paint of the interactive state. VerticalNav waits for the element to intersect the viewport, so a sidebar that is visible on load still initializes almost immediately, but a nav that starts off screen (inside an offcanvas, for example) initializes late. Add `.manual` and call the bridge yourself when you need deterministic timing.

---

## Active State Detection

| | SideNav | PanelNav | VerticalNav |
|---|---|---|---|
| Runs on load | `activeOnLoad` | `activeOnLoad` | `activeTracking` |
| Comparison | URL API, origin plus path, trailing slash stripped | URL API, origin plus path, trailing slash stripped | Raw `href === location.pathname` |
| Relative hrefs (`page.html`) | Resolved against the origin, matches only if that resolves to the current path | Same | Never match, because the raw string is compared |
| Query string | Ignored | Ignored | Ignored |
| Hash | Ignored | Ignored | Optional via `hashTracking` |
| Deepest match wins | Sub-items checked first | Deepest leaf wins | First match wins |
| Parents | Get the active and open classes | Get `branch-active` and open | Group opens when `expandActive` |
| Click tracking | Yes, via `setActive` | Yes, via `setActive` | Yes, moves `.active` on click |

For VerticalNav, use root-relative hrefs (`/dashboard`, not `dashboard`), or call `setActive(href)` yourself.

---

## Recipes

### App shell with responsive sidebar (SideNav)

```html
<nav data-plugin-sidenav
     data-plugin-options='{
       "showToggle": true,
       "mobileBreakpoint": 768,
       "collapseOnMobile": true
     }'>
  <!-- header, body, footer as above -->
</nav>
```

### Accordion settings tree, any depth (PanelNav)

```html
<nav data-plugin-panelnav
     data-plugin-options='{
       "accordion": true,
       "bordered": true,
       "activeIndicator": "both",
       "indentStep": "1.25rem"
     }'>
  <!-- sections, lists, nested child-items as above -->
</nav>
```

### Sidebar that pushes the page (VerticalNav)

```html
<div id="page-wrapper" class="ts-vn-push">
  <!-- main content -->
</div>

<nav data-plugin-vertical-nav
     data-plugin-options='{"toggleTarget":"#page-wrapper"}'>
  <!-- ts-vn markup as above -->
</nav>
```

```css
/* Shift content to match the rail width */
#page-wrapper           { margin-left: 220px; }
#page-wrapper.ts-vn-collapsed { margin-left: 56px; }
```

The `ts-vn-push` class only supplies the margin and padding transition (`[class*="ts-vn-push"]`). The margin values are yours to set.

### React to collapse in the rest of the layout (SideNav)

```js
$('#nav').on('toggle.ts.sidenav', (e, d) => {
    $('body').toggleClass('sidebar-collapsed', d.collapsed);
});
```

### Migrating VerticalNav to SideNav

| VerticalNav | SideNav |
|---|---|
| `data-plugin-vertical-nav` | `data-plugin-sidenav` |
| `.ts-vn-header` / `.ts-vn-brand` | `data-sidenav-header` / `data-sidenav-title` |
| `.ts-vn-toggle-btn` (auto) | `showToggle: true` |
| `.ts-vn-body` | `data-sidenav-body` |
| `.ts-vn-link` | `data-sidenav-item` on the same `<a>` |
| `.ts-vn-icon` / `.ts-vn-text` | `data-sidenav-icon` / `data-sidenav-label` |
| `.active` | `data-sidenav-active` |
| `.ts-vn-group` + trigger + children | one item with `data-sidenav-has-children` and a `data-sidenav-sub-items` container |
| `.ts-vn-group-children > .ts-vn-link` | `data-sidenav-sub-item` |
| `.ts-vn-section-label` | `data-sidenav-group` with `data-sidenav-group-title` |
| `.ts-vn-divider` | `data-sidenav-separator` |
| `.ts-vn-footer` | `data-sidenav-footer` |
| `toggleTarget` | listen for `toggle.ts.sidenav` and toggle your own class |
| `setActive('/path')` | `setActive($item)` or `setSubActive($sub)` |
| `tooltips` | automatic CSS tooltips |
| `verticalNav.collapsed` | `toggle.ts.sidenav` with `collapsed: true` |
| `--ts-vn-*` tokens | `--ts-sidenav-*` tokens |

### Migrating PanelNav to SideNav

Only do this if your tree is at most two levels deep. SideNav has no recursion, no accordion, and no metadata slot, so those features do not carry over.

---

## Common Pitfalls

**SideNav: `dark: true` changes nothing visible**
The option adds `.ts-sidenav--dark`, but dark tokens are only defined under `html.dark .ts-sidenav`. Toggle `html.dark` (PluginDarkMode does this), or override tokens on the element.

**SideNav: sub-menus never open**
The sub-items container must be a *direct child* of the item. The plugin reads `.children('[data-sidenav-sub-items]')`. Nesting it deeper leaves the item without a shell and the click handler has nothing to toggle.

**SideNav: only two levels**
Sub-items are not decorated recursively. A `data-sidenav-item` placed inside `data-sidenav-sub-items` is ignored. Use PanelNav for deeper trees.

**SideNav: responsive collapse does nothing**
`mobileBreakpoint` alone only toggles `.ts-sidenav--mobile`. Set `collapseOnMobile: true` as well.

**PanelNav: parent rows never navigate**
Every parent link is intercepted with `preventDefault()` and toggles its drawer. A parent that must also be a link needs a separate child leaf ("Overview") inside its drawer.

**PanelNav: nothing scrolls with `fill: true`**
`fill` makes the root a flex column and expects a `[data-panelnav-body]` wrapper to scroll. Without the body element the content overflows the container.

**PanelNav: accordion does not close cousins**
Accordion closes only siblings inside the same list (`$item.siblings(...)`). Items in different sections or at different depths are not closed.

**PanelNav: active item not detected**
Auto-detect only inspects **leaf** rows that are real anchors with an `href`. Buttons, `href="#"`, and parents are skipped. Mark the item with `data-panelnav-active` or call `setActive()`.

**VerticalNav: labels are clipped, not hidden, on small screens**
Below 768px a CSS media query forces the width to the rail width, but the `ts-vn-collapsed` class is not added. Text is clipped by `overflow: hidden` instead of hidden, tooltips are not created, and the toggle's state is out of sync with what you see. If you need a true responsive collapse, call `collapse()` from your own resize or `matchMedia` handler.

**VerticalNav: group triggers do nothing in mini mode**
In the collapsed state group children are `display: none`, and the trigger click handler always calls `preventDefault()` and toggles the hidden group. The source comment mentions a `data-group-href` fallback, but no code implements it. Give mini mode its own behavior (for example, expand on trigger click) in your own handler.

**VerticalNav: `.ts-vn-body` is not created for you**
Scrolling and the slim scrollbar live on `.ts-vn-body`, but the plugin never adds it. Wrap your links in one, or long menus will not scroll.

**VerticalNav: animation breaks on jQuery slim**
Group open and close use `.stop()` and `.animate()`. The slim jQuery build excludes the effects module, so groups will throw or stay closed. Use the full build.

**VerticalNav: `destroy()` throws away later DOM changes**
It restores the HTML string captured at init (`initialHTML`). Anything you added or edited after init is lost, and handlers bound to child nodes are detached with the old nodes.

**VerticalNav: instance lookup returns undefined**
The instance key is `__verticalNav`, not `__pluginVerticalNav`. Use `$('#nav').data('__verticalNav')`, or go through the bridge.

**VerticalNav: active link never highlights**
Auto-detect compares the raw `href` string to `location.pathname`. Relative hrefs, full URLs and trailing-slash differences will not match.

### Diagnostic checklist

- Does the root have the right attribute (`data-plugin-sidenav`, `data-plugin-panelnav`, `data-plugin-vertical-nav`) and no `.manual` class?
- Does `$('#nav').data(key)` return an instance? Keys: `__pluginSideNav`, `__pluginPanelNav`, `__verticalNav`.
- Is the injected `<style>` present (`ts-sidenav-styles`, `ts-panel-nav-styles`, `ts-verticalnav-styles`)?
- SideNav and PanelNav: is every parent's child container a **direct child** of its item?
- PanelNav: does each item have a link row (`data-panelnav-link`, or a direct `a`/`button` child)?
- VerticalNav: are you loading the full jQuery build, and is Bootstrap JS present if you expect tooltips?
- Collapsing does not look right: is the collapsed class on the root (`ts-sidenav--collapsed` or `ts-vn-collapsed`)?
- Colors wrong in dark mode: is `html.dark` set (SideNav), `dark: true` set (PanelNav), or `.ts-vn-light` applied (VerticalNav)?
