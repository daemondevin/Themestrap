# VerticalNav Guide

Themestrap's vertical sidebar navigation plugin — full sidebar with collapsible groups, mini-mode collapse, active-link tracking, tooltip integration, and full programmatic control.

A complete sidebar navigation primitive. Build a hierarchical menu with expandable groups, icon + text dual-mode rendering, automatic active-state tracking based on URL or hash, and a mini-mode collapse that shrinks the sidebar to icon-only and converts labels into tooltips. All Bootstrap 5-compatible, fully keyboard-accessible, and observable via events.


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

1. **Parse DOM structure.** Plugin adds `.ts-vertical-nav` to the `[data-plugin-vertical-nav]` root and walks for `.ts-vn-link`, `.ts-vn-group`, `.ts-vn-group-trigger`, and `.ts-vn-group-children` elements. Builds an internal map of group → children relationships.

2. **Bind event handlers.** Adds click handlers to group triggers (expand/collapse), document-level clicks (close flyouts when outside), and the collapse button it injects when `toggleBtn: true`. If `hashTracking: true`, also binds `hashchange`.

3. **Resolve initial active link.** If `activeTracking: true`, finds the link matching `window.location.pathname` (or hash if enabled), marks it `.active`, and expands its ancestor group if `expandActive: true`.

4. **Apply initial mode.** If `collapsed: true`, the sidebar starts in mini mode — width is collapsed, tooltips are initialized on all links, and existing group expansions are folded.

> [!NOTE]
> On `destroy()`, the plugin reverses all four steps in order: tooltips disposed, document listeners removed, event handlers unbound, then DOM state cleared and the instance dropped from `$el.data()`.


## [Quick **Start**](#quick-start)

### Markup contract

The root is any element with `data-plugin-vertical-nav`; the plugin adds the `.ts-vertical-nav` class that all its CSS hangs from. Every inner class is prefixed `ts-vn-`.

```html
<nav id="sidebar" data-plugin-vertical-nav data-plugin-options='{"collapsed": false}'>
  <div class="ts-vn-header">
    <span class="ts-vn-brand">Themestrap</span>
  </div>

  <a href="/dashboard" class="ts-vn-link">
    <span class="ts-vn-icon"><i class="fas fa-home"></i></span>
    <span class="ts-vn-text">Dashboard</span>
  </a>

  <div class="ts-vn-group">
    <button class="ts-vn-group-trigger" type="button">
      <span class="ts-vn-icon"><i class="fas fa-cog"></i></span>
      <span class="ts-vn-text">Settings</span>
    </button>
    <div class="ts-vn-group-children">
      <a href="/settings/profile" class="ts-vn-link"><span class="ts-vn-text">Profile</span></a>
      <a href="/settings/billing" class="ts-vn-link"><span class="ts-vn-text">Billing</span></a>
    </div>
  </div>

  <div class="ts-vn-divider"></div>

  <a href="/logout" class="ts-vn-link">
    <span class="ts-vn-icon"><i class="fas fa-sign-out-alt"></i></span>
    <span class="ts-vn-text">Logout</span>
  </a>
</nav>
```

With `toggleBtn: true` (the default) the plugin injects its own collapse button, `<button class="ts-vn-toggle-btn">` with a three-bar icon. Do not add one yourself.

### Init

```js
$('#sidebar').themestrapPluginVerticalNav({
    collapsed:      false,
    activeTracking: true,
    expandActive:   true,
    hashTracking:   false,
    toggleBtn:      true,
    toggleTarget:   '#page-content',
    tooltips:       true
});

// Or let themestrap.init.js do it:
themestrap.fn.intObsInit('[data-plugin-vertical-nav]:not(.manual)', 'themestrapPluginVerticalNav');
```

> [!TIP]
> Each child of an icon-bearing element needs the `ts-vn-icon` and `ts-vn-text` classes split out. Mini mode works by hiding `.ts-vn-text` via CSS — the icons stay because they have `.ts-vn-icon`. Mixing them up will cause icons to disappear when collapsed.


## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsed` | bool | `false` | Start in mini mode. Width is collapsed, tooltips initialized, group children folded. |
| `activeTracking` | bool | `true` | Auto-mark the link matching `window.location.pathname` as `.active` on init. |
| `hashTracking` | bool | `false` | When true, also listen for `hashchange` events and re-resolve the active link against `location.hash`. |
| `expandActive` | bool | `true` | When tracking is on, automatically expand any group that contains the active link. |
| `toggleBtn` | bool | `true` | Inject a `.ts-vn-toggle-btn` collapse button into the sidebar and wire it to `toggle()`. |
| `toggleTarget` | string | `null` | Selector for other elements (such as the page content) that receive `.ts-vn-collapsed` alongside the sidebar, so they can shift with it. It is not a button selector. |
| `animDuration` | number | `260` | Milliseconds for the group open/close (height) animation. The sidebar width transition is CSS, set by `--ts-vn-transition`. |
| `tooltips` | bool | `true` | Initialize Bootstrap tooltips on each link in mini mode. Disable if you don't want them or already manage tooltips elsewhere. |

### CSS custom properties

Declared on `.ts-vertical-nav` (dark by default), with a light set on `.ts-vertical-nav.ts-vn-light`. Override them on the root element or on `:root`.

```css
#sidebar {
  --ts-vn-width:             220px;                          /* expanded width */
  --ts-vn-width-collapsed:   56px;                           /* mini-mode width */
  --ts-vn-transition:        260ms cubic-bezier(.4, 0, .2, 1); /* width and color transitions */
  --ts-vn-bg:                #0a1929;
  --ts-vn-border:            #393c41;
  --ts-vn-link-color:        #c3cfdd;
  --ts-vn-link-hover-color:  #fff;
  --ts-vn-link-hover-bg:     rgba(255, 255, 255, .08);
  --ts-vn-link-active-color: #e8672a;
  --ts-vn-link-active-bg:    rgba(255, 255, 255, .14);
  --ts-vn-link-active-mark:  #e8672a;                        /* bar beside the active link */
  --ts-vn-icon-size:         1.125rem;
  --ts-vn-icon-color:        rgba(255, 255, 255, .6);
  --ts-vn-icon-active:       #e8672a;
  --ts-vn-header-height:     56px;
  --ts-vn-item-height:       36px;
  --ts-vn-item-gap:          2px;
  --ts-vn-group-indent:      2.5rem;
  --ts-vn-divider-color:     #393c41;
  --ts-vn-focus-ring:        0 0 0 2px #49afd9;
  --ts-vn-radius:            4px;
}
```

The defaults use the Themestrap palette (`--dark`, `--default`, `--primary`, `--grey-200`). Add `.ts-vn-light` to the root for the light set.


## [Instance **API**](#instance-api)

Read the instance from a fresh selection; the key is `__verticalNav` (capital N). Every method returns the instance.

```js
$('#sidebar').themestrapPluginVerticalNav();
const nav = $('#sidebar').data('__verticalNav');
```

| Method | Returns | Description |
|--------|---------|-------------|
| `collapse()` | this | Switch to mini mode: adds `.ts-vn-collapsed` (also to `toggleTarget`), sets the toggle button's `aria-expanded="false"`, sets up tooltips when `tooltips: true`, and fires `verticalNav.collapsed`. |
| `expand()` | this | Switch to expanded mode, dispose the tooltips, and fire `verticalNav.expanded`. |
| `toggle()` | this | Switch between modes. |
| `openGroup($group)` | this | Expand a `.ts-vn-group`. |
| `closeGroup($group)` | this | Collapse a `.ts-vn-group`. |
| `setActive(href)` | this | Mark the link with that `href` active, clearing the previous one, and expand its group when `expandActive` is on. |
| `destroy()` | this | Tear down all listeners, dispose tooltips, restore the original HTML and drop the instance. |

### Mode change events

Two jQuery events fire on the root as soon as the class changes, before the CSS width transition has finished:

```js
$('#sidebar')
  .on('verticalNav.collapsed', () => console.log('Now mini'))
  .on('verticalNav.expanded',  () => console.log('Now full'));
```

> [!NOTE]
> jQuery reads `verticalNav.collapsed` as the event `verticalNav` in the namespace `collapsed`, so bind the full name as above. To act once the width has settled, wait for the transition (260 ms by default, `--ts-vn-transition`):
>
> ```js
> $('#sidebar').on('verticalNav.collapsed verticalNav.expanded', function () {
>     $(this).one('transitionend', () => $(window).trigger('resize'));
> });
> ```

### Bootstrap tooltip integration

When `tooltips: true` and the sidebar is in mini mode, each `.ts-vn-link` gets a Bootstrap Tooltip initialized with:

- `title` — read from the link's `.ts-vn-text` content
- `placement: 'right'`
- `trigger: 'hover focus'`

All tooltips are disposed when the sidebar expands again — no leftover popper instances.


## [Recipe **Cookbook**](#recipes)

#### Standard sidebar with active tracking

```html
<nav id="sidebar" data-plugin-vertical-nav>
  <div class="ts-vn-header"><span class="ts-vn-brand">Themestrap</span></div>
  <a href="/" class="ts-vn-link">
    <span class="ts-vn-icon"><i class="fas fa-home"></i></span>
    <span class="ts-vn-text">Home</span>
  </a>
</nav>
```

`themestrap.init.js` initializes it; `activeTracking` marks the link for the current page.

#### Toggle button outside the sidebar, pushing the content

```html
<button id="burger" class="header-burger" type="button" aria-controls="sidebar">
  <i class="fas fa-bars"></i>
</button>

<nav id="sidebar" data-plugin-vertical-nav class="manual">...</nav>
<main id="page-content">...</main>
```

```js
$('#sidebar').themestrapPluginVerticalNav({
    toggleBtn:    false,             // no injected button
    toggleTarget: '#page-content'    // gets .ts-vn-collapsed too
});
const nav = $('#sidebar').data('__verticalNav');
$('#burger').on('click', () => nav.toggle());
```

```css
#page-content                 { margin-left: 220px; transition: margin-left 260ms; }
#page-content.ts-vn-collapsed { margin-left: 56px; }
```

#### Persist collapse state in localStorage

```js
const $vn = $('#sidebar');
let wasCollapsed = false;
try { wasCollapsed = localStorage.getItem('ts-vn-collapsed') === '1'; } catch (e) {}

$vn.themestrapPluginVerticalNav({ collapsed: wasCollapsed });

$vn.on('verticalNav.collapsed', () => { try { localStorage.setItem('ts-vn-collapsed', '1'); } catch (e) {} });
$vn.on('verticalNav.expanded',  () => { try { localStorage.setItem('ts-vn-collapsed', '0'); } catch (e) {} });
```

#### Responsive auto-collapse

```js
$('#sidebar').themestrapPluginVerticalNav();
const nav = $('#sidebar').data('__verticalNav');
const mq  = matchMedia('(min-width: 1200px)');

function syncToWidth() { mq.matches ? nav.expand() : nav.collapse(); }
syncToWidth();
mq.addEventListener('change', syncToWidth);
```

#### Drive from a SPA router

```js
$('#sidebar').themestrapPluginVerticalNav({ activeTracking: false });
const nav = $('#sidebar').data('__verticalNav');

myRouter.on('navigate', route => nav.setActive(route.path));
```


## [Common **Pitfalls**](#pitfalls)

**Icon vs text class mix-up.** Every visible label inside a link or trigger must be wrapped in `.ts-vn-text`, and every visible icon must have `.ts-vn-icon`. Mini mode hides `.ts-vn-text` via CSS — if you forget the class, the text won't hide, breaking the icon-only layout.

**Bootstrap tooltip dependency.** PluginVerticalNav uses `bootstrap.Tooltip` (from `bootstrap.bundle.min.js`). If you're using `bootstrap.min.js` (without Popper), tooltips won't initialize. Either switch to the bundle, or disable tooltips with `tooltips: false`.

**URL pathname matching is exact.** `activeTracking` uses `===` against `window.location.pathname`. Trailing slashes, query strings, and hashes are NOT ignored. If your links have `/about` but the URL is `/about/`, the match fails. Either normalize the links or use `setActive()` manually after route changes.

**Flyouts can be clipped.** When collapsed and a group is hovered, its children flyout appears to the right of the icon column with `position: absolute`. If an ancestor has `overflow: hidden`, the flyout will be clipped. The sidebar root should have `overflow: visible` at minimum.

### Diagnostic checklist

> - Is Bootstrap 5's bundle JS loaded? `typeof bootstrap.Tooltip === 'function'`
> - Does every text label have `.ts-vn-text` exactly?
> - Are nested children inside `.ts-vn-group-children` only?
> - Is `window.location.pathname` matching your link `href` exactly (incl. trailing slash)?
> - Is the instance read as `__verticalNav`, on a fresh selection rather than chained off the init call?
> - An external toggle button calls `toggle()`; `toggleTarget` is for elements that should shift, not for buttons.
> - If flyouts are clipped, walk up the DOM looking for `overflow: hidden`.
