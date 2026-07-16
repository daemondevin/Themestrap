# VerticalNav Guide

Themestrap's vertical sidebar navigation plugin — full sidebar with collapsible groups, mini-mode collapse, active-link tracking, tooltip integration, and full programmatic control.

A complete sidebar navigation primitive. Build a hierarchical menu with expandable groups, icon + text dual-mode rendering, automatic active-state tracking based on URL or hash, and a mini-mode collapse that shrinks the sidebar to icon-only and converts labels into tooltips. All Bootstrap 5-compatible, fully keyboard-accessible, and observable via events.

---

## [How It **Works**](#how-it-works)

The plugin manages a single sidebar instance, handling four cooperating concerns: rendering modes (expanded vs mini), group expansion state, active link tracking, and tooltip integration when collapsed.

### Expanded mode

The sidebar shows its full width. Icons and text are both visible. Group triggers reveal nested children inline with an animated chevron rotation. Active link is highlighted with the configured color, and its parent group auto-expands if `expandActive: true`.

- Full text labels visible
- Nested groups animate open/closed
- No tooltips needed — labels are right there

### Mini mode

Sidebar collapses to icon-only. Text labels are visually hidden but remain in the DOM for screen readers. Hovering a link reveals a Bootstrap tooltip showing the full label. Groups collapse — hover instead shows a flyout panel positioned to the right of the icon column.

- Width transitions via CSS variable
- Bootstrap Tooltip auto-attached on entry
- Flyouts for grouped items on hover

### Initialization lifecycle

1. **Parse DOM structure.** Plugin reads the root `.ts-vn` element and walks for `.ts-vn-link`, `.ts-vn-group`, `.ts-vn-group-trigger`, and `.ts-vn-group-children` elements. Builds an internal map of group → children relationships.

2. **Bind event handlers.** Adds click handlers to group triggers (expand/collapse), document-level clicks (close flyouts when outside), and the toggle button if present. If `hashTracking: true`, also binds `hashchange`.

3. **Resolve initial active link.** If `activeTracking: true`, finds the link matching `window.location.pathname` (or hash if enabled), marks it `.active`, and expands its ancestor group if `expandActive: true`.

4. **Apply initial mode.** If `collapsed: true`, the sidebar starts in mini mode — width is collapsed, tooltips are initialised on all links, and existing group expansions are folded.

> [!NOTE]
> On `destroy()`, the plugin reverses all four steps in order: tooltips disposed, document listeners removed, event handlers unbound, then DOM state cleared and the instance dropped from `$el.data()`.

---

## [Quick **Start**](#quick-start)

### Markup contract

The sidebar follows a strict naming convention. Every prefix is `ts-vn-*` for namespace isolation.

```html
<aside class="ts-vn">
  <div class="ts-vn-header">
    <a class="ts-vn-brand" href="/">
      <img src="/logo.svg" class="ts-vn-icon">
      <span class="ts-vn-text">Themestrap</span>
    </a>
    <button class="ts-vn-toggle" type="button">
      <i class="fas fa-bars"></i>
    </button>
  </div>

  <nav>
    <a href="/dashboard" class="ts-vn-link">
      <i class="fas fa-home ts-vn-icon"></i>
      <span class="ts-vn-text">Dashboard</span>
    </a>

    <div class="ts-vn-group">
      <button class="ts-vn-group-trigger" type="button">
        <i class="fas fa-cog ts-vn-icon"></i>
        <span class="ts-vn-text">Settings</span>
      </button>
      <div class="ts-vn-group-children">
        <a href="/settings/profile" class="ts-vn-link">
          <span class="ts-vn-text">Profile</span>
        </a>
        <a href="/settings/billing" class="ts-vn-link">
          <span class="ts-vn-text">Billing</span>
        </a>
      </div>
    </div>

    <div class="ts-vn-divider"></div>

    <a href="/logout" class="ts-vn-link">
      <i class="fas fa-sign-out ts-vn-icon"></i>
      <span class="ts-vn-text">Logout</span>
    </a>
  </nav>
</aside>
```

### Init

```js
$('.ts-vn').themestrapPluginVerticalNav({
    collapsed:     false,
    activeTracking: true,
    expandActive:  true,
    hashTracking:  false,
    toggleBtn:     true,
    tooltips:      true
});

// Or via the framework
themestrap.fn.intObsInit('.ts-vn', 'themestrapPluginVerticalNav');
```

> [!TIP]
> Each child of an icon-bearing element needs the `ts-vn-icon` and `ts-vn-text` classes split out. Mini mode works by hiding `.ts-vn-text` via CSS — the icons stay because they have `.ts-vn-icon`. Mixing them up will cause icons to disappear when collapsed.

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsed` | bool | `false` | Start in mini mode. Width is collapsed, tooltips initialised, group children folded. |
| `activeTracking` | bool | `true` | Auto-mark the link matching `window.location.pathname` as `.active` on init. |
| `hashTracking` | bool | `false` | When true, also listen for `hashchange` events and re-resolve the active link against `location.hash`. |
| `expandActive` | bool | `true` | When tracking is on, automatically expand any group that contains the active link. |
| `toggleBtn` | bool | `true` | Wire up `.ts-vn-toggle` inside the sidebar to call `toggle()` on click. |
| `toggleTarget` | string | `null` | External selector for a toggle button outside the sidebar (e.g. a header burger icon). |
| `animDuration` | number | `260` | Milliseconds for the collapse/expand animation. Mirrored into CSS variable `--ts-vn-anim`. |
| `tooltips` | bool | `true` | Initialise Bootstrap tooltips on each link in mini mode. Disable if you don't want them or already manage tooltips elsewhere. |

### CSS custom properties

Visual tuning happens via CSS variables on the root `.ts-vn` element:

```css
.ts-vn {
  --ts-vn-w:            260px;   /* expanded width */
  --ts-vn-w-mini:        64px;   /* mini-mode width */
  --ts-vn-bg:        #0a1929;   /* background */
  --ts-vn-fg:           #fff;   /* text color */
  --ts-vn-active:    #e8672a;   /* active link color */
  --ts-vn-hover-bg:  rgba(255,255,255,.05);
  --ts-vn-anim:        260ms;   /* width transition */
}
```

---

## [Instance **API**](#instance-api)

| Method | Returns | Description |
|--------|---------|-------------|
| `collapse()` | void | Switch to mini mode. Animates width transition, initializes tooltips if `tooltips: true`, fires `verticalNav.collapsed` event when done. |
| `expand()` | void | Switch to expanded mode. Disposes tooltips, fires `verticalNav.expanded` event when done. |
| `toggle()` | void | Switch between modes. Reads current state and calls the inverse. |
| `openGroup($el)` | void | Programmatically expand a group. Accepts a jQuery handle to a `.ts-vn-group`. |
| `closeGroup($el)` | void | Programmatically collapse a group. |
| `setActive(href)` | void | Manually mark a link as active by its href. Removes existing active class first. Expands the parent group if `expandActive` is on. |
| `destroy()` | void | Tear down all listeners, dispose tooltips, remove state classes, drop the instance reference. |

### Mode change events

Two events fire on the root `.ts-vn` element, after the corresponding CSS transition completes:

```js
$('.ts-vn')
  .on('verticalNav.collapsed', () => console.log('Now mini'))
  .on('verticalNav.expanded',  () => console.log('Now full'));
```

> [!NOTE]
> Events fire _after_ the width transition completes (delayed by `animDuration`), not before. Use them to trigger downstream layout changes that depend on the sidebar's final size.

### Bootstrap tooltip integration

When `tooltips: true` and the sidebar is in mini mode, each `.ts-vn-link` gets a Bootstrap Tooltip initialised with:

- `title` — read from the link's `.ts-vn-text` content
- `placement: 'right'`
- `trigger: 'hover focus'`

All tooltips are disposed when the sidebar expands again — no leftover popper instances.

---

## [Recipe **Cookbook**](#recipes)

#### Standard sidebar with active tracking

```html
<aside class="ts-vn">
  <div class="ts-vn-header">...</div>
  <nav>
    <a href="/" class="ts-vn-link">
      <i class="fas fa-home ts-vn-icon"></i>
      <span class="ts-vn-text">Home</span>
    </a>
  </nav>
</aside>

<script>
$('.ts-vn').themestrapPluginVerticalNav();
</script>
```

#### Toggle button outside the sidebar

```html
<button class="header-burger" type="button">
  <i class="fas fa-bars"></i>
</button>

<aside class="ts-vn">...</aside>

<script>
$('.ts-vn').themestrapPluginVerticalNav({
    toggleBtn:    false,
    toggleTarget: '.header-burger'
});
</script>
```

#### Persist collapse state in localStorage

```js
const $vn = $('.ts-vn');
const wasCollapsed = localStorage.getItem('ts-vn-collapsed') === '1';

$vn.themestrapPluginVerticalNav({ collapsed: wasCollapsed });

$vn.on('verticalNav.collapsed', () =>
  localStorage.setItem('ts-vn-collapsed', '1'));
$vn.on('verticalNav.expanded', () =>
  localStorage.setItem('ts-vn-collapsed', '0'));
```

#### Responsive auto-collapse

```js
const $vn  = $('.ts-vn').themestrapPluginVerticalNav();
const inst = $vn.data('__verticalnav');

function syncToWidth() {
  const wide = matchMedia('(min-width: 1200px)').matches;
  wide ? inst.expand() : inst.collapse();
}

syncToWidth();
window.addEventListener('resize', syncToWidth);
```

#### Drive from a SPA router

```js
const inst = $('.ts-vn')
  .themestrapPluginVerticalNav({ activeTracking: false })
  .data('__verticalnav');

// Custom router calls back when route changes
myRouter.on('navigate', route => {
  inst.setActive(route.path);
});
```

---

## [Common **Pitfalls**](#pitfalls)

**Icon vs text class mix-up.** Every visible label inside a link or trigger must be wrapped in `.ts-vn-text`, and every visible icon must have `.ts-vn-icon`. Mini mode hides `.ts-vn-text` via CSS — if you forget the class, the text won't hide, breaking the icon-only layout.

**Bootstrap tooltip dependency.** PluginVerticalNav uses `bootstrap.Tooltip` (from `bootstrap.bundle.min.js`). If you're using `bootstrap.min.js` (without Popper), tooltips won't initialise. Either switch to the bundle, or disable tooltips with `tooltips: false`.

**URL pathname matching is exact.** `activeTracking` uses `===` against `window.location.pathname`. Trailing slashes, query strings, and hashes are NOT ignored. If your links have `/about` but the URL is `/about/`, the match fails. Either normalise the links or use `setActive()` manually after route changes.

**Flyouts can be clipped.** When collapsed and a group is hovered, its children flyout appears to the right of the icon column with `position: absolute`. If an ancestor has `overflow: hidden`, the flyout will be clipped. The sidebar root should have `overflow: visible` at minimum.

### Diagnostic checklist

> - Is Bootstrap 5's bundle JS loaded? `typeof bootstrap.Tooltip === 'function'`
> - Does every text label have `.ts-vn-text` exactly?
> - Are nested children inside `.ts-vn-group-children` only?
> - Is `window.location.pathname` matching your link `href` exactly (incl. trailing slash)?
> - Does the toggle button have the right selector (`.ts-vn-toggle` inside or `toggleTarget` outside)?
> - If flyouts are clipped, walk up the DOM looking for `overflow: hidden`.
