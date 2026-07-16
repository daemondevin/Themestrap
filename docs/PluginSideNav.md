# SideNav Guide

Themestrap's full-featured collapsible sidebar — header/body/footer slots, grouped expandable sub-items with animated height, icon columns, badges, chevrons, CSS tooltips in collapsed state, auto-active detection, and responsive collapse.

## [How It **Works**](#how-it-works)

PluginSideNav manages a sidebar with three layout regions (header, body, footer), discrete item groups with expandable sub-item drawers, a mini/collapsed mode that switches the rail to icon-only, and optional responsive auto-collapse below a configurable breakpoint. All state changes are driven by a single `collapsed` boolean that toggles `ts-sidenav--collapsed` on the root — the injected CSS does the rest.

### Sub-item drawers

Items with `[data-sidenav-has-children]` wrap their `[data-sidenav-sub-items]` list in the same proven height-animation technique used by PluginCollapsible. Drawer height animates 0 → `scrollHeight` on open and reverses on close.

### Collapsed tooltip mode

In collapsed (icon-only) mode, each item's label is hidden. If `Bootstrap.Tooltip` is available, the plugin initialises a tooltip on each icon using the label text. In environments without Bootstrap Tooltips the icon is still visible but the label is not.

### Auto-active detection

When `activeOnLoad: true` the plugin compares `window.location.pathname` against each leaf item's `href`. The first match receives `[data-sidenav-active]` and its parent group is opened automatically.

---

## [Quick **Start**](#quick-start)

```html
<aside data-plugin-side-nav
       id="appSidebar"
       data-plugin-options='{"collapsed": false, "showToggle": true, "activeOnLoad": true}'>

  <div data-sidenav-header>
    <span data-sidenav-logo><i class="fas fa-bolt"></i></span>
    <span data-sidenav-title>MyApp</span>
    <button data-sidenav-toggle aria-label="Collapse sidebar">☰</button>
  </div>

  <div data-sidenav-body>
    <div data-sidenav-group data-sidenav-group-title="Main">
      <a href="/dashboard" data-sidenav-item>
        <span data-sidenav-icon><i class="fas fa-home"></i></span>
        <span data-sidenav-label>Dashboard</span>
        <span data-sidenav-badge>5</span>
      </a>
      <div data-sidenav-item data-sidenav-has-children>
        <span data-sidenav-icon><i class="fas fa-cog"></i></span>
        <span data-sidenav-label>Settings</span>
        <div data-sidenav-sub-items>
          <a href="/settings/profile" data-sidenav-sub-item>Profile</a>
          <a href="/settings/billing" data-sidenav-sub-item>Billing</a>
        </div>
      </div>
    </div>
  </div>

  <div data-sidenav-footer>
    <a href="/help" data-sidenav-item>
      <span data-sidenav-icon><i class="fas fa-question-circle"></i></span>
      <span data-sidenav-label>Help</span>
    </a>
  </div>

</aside>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsed` | bool | `false` | Start in icon-only mini mode. |
| `dark` | bool | `false` | Dark color scheme. |
| `width` | string | `'260px'` | Expanded width (any CSS length). |
| `widthCollapsed` | string | `'64px'` | Collapsed icon-rail width. |
| `duration` | string | `'250ms'` | Width + sub-nav CSS transition duration. |
| `showToggle` | bool | `false` | Inject and wire the built-in collapse toggle button. |
| `activeOnLoad` | bool | `true` | Auto-detect active item from current URL on init. |
| `autoCollapse` | bool | `false` | Collapse after a leaf item is clicked (useful for mobile overlays). |
| `mobileBreakpoint` | number | `null` | Viewport width (px) below which sidebar is treated as mobile. |
| `collapseOnMobile` | bool | `false` | Auto-collapse below `mobileBreakpoint`. |
| `forceInit` | bool | `true` | Skip IntersectionObserver — sidebar is layout-critical. |

### CSS custom properties

```css
.ts-sidenav {
  --ts-sn-width:          260px;
  --ts-sn-width-mini:      64px;
  --ts-sn-bg:          #0a1929;
  --ts-sn-fg:             #fff;
  --ts-sn-active:      #e8672a;
  --ts-sn-border:  rgba(255,255,255,.07);
  --ts-sn-duration:       250ms;
}
```

---

## [Instance **API**](#instance-api)

| Method | Returns | Description |
|--------|---------|-------------|
| `collapse()` | void | Switch to icon-only mode. |
| `expand()` | void | Switch to full-width mode. |
| `toggle()` | void | Flip between modes. |
| `setCollapsed(bool)` | void | Set mode programmatically. |
| `openGroup($item)` | void | Open a group's sub-item drawer. |
| `closeGroup($item)` | void | Close a group's sub-item drawer. |
| `getActive()` | object | `{item, subItem}` — the currently active elements. |
| `setActive($item)` | void | Mark a leaf item as active and open its parent group. |
| `setSubActive($sub)` | void | Mark a sub-item as active. |
| `refresh()` | void | Destroy and re-init with the same options. |
| `destroy()` | void | Full teardown — removes classes, injected nodes, listeners. |

### Events

| Event | Arguments | Fires |
|-------|-----------|-------|
| `toggle.ts.sidenav` | `({collapsed})` | After collapse/expand transition. |
| `item.ts.sidenav` | `({$item, href})` | After a top-level item click. |
| `subitem.ts.sidenav` | `({$item, href})` | After a sub-item click. |
| `group-toggle.ts.sidenav` | `({$item, open})` | After a group drawer toggles. |

---

## [Common **Pitfalls**](#pitfalls)

**Must split icon and label into separate elements.** In mini mode, the plugin hides `[data-sidenav-label]` and shows only `[data-sidenav-icon]`. If icon and label are in the same element without the data attributes, mini mode won't hide the text.

**Sub-items must be inside `[data-sidenav-sub-items]`.** The height animation wraps that element specifically. Plain `<ul>` children without the attribute are ignored.

**`forceInit: true` by default.** Unlike most plugins, SideNav bypasses IntersectionObserver on init because it is layout-critical — the page needs the sidebar width set before content is painted, not lazily when the sidebar scrolls into view.
