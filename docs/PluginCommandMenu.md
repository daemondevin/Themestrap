# CommandMenu Guide

A modal command palette that lives in the same family as some libraries `cmd` component. Hit `⌘K` from anywhere, type to filter, navigate with the arrow keys, hit Enter to execute. Items can navigate, dispatch JS callbacks, or fire a custom event. Recent selections persist to `localStorage` and pin themselves at the top of the list.

## [How It **Works**](#how-it-works)

PluginCommandMenu wires four concerns together: a dialog shell (backdrop, panel, scroll-lock), a combobox-style search input, a filterable listbox of items grouped under sticky headings, and a global keyboard listener that summons the whole thing with a configurable shortcut. The plugin reads its structure entirely from the existing DOM — no JSON config required at runtime — so the same instance works equally well whether you authored the markup by hand, or by injecting items dynamically.

#### Closed state

> The root element carries `command-hidden` with `display: none` — focus can never tab into the panel when closed. The document-level keydown listener watches for the configured shortcut (`mod+k` by default) and ignores it while the user is mid-typing in any plain input.
> 
> - Root: `aria-hidden="true"`, `command-hidden`
> - Input: `aria-expanded="false"`
> - Global shortcut: armed

#### Open state

> The panel animates in (default: 200 ms fade + 8 px translate), the search input is focused, and the first visible item gets `aria-selected="true"`. The body picks up `dialog-scroll-lock` so the page behind doesn't scroll. The previously focused element is remembered and restored on close.
> 
> - Root: `command-is-open`, `aria-hidden="false"`
> - Input: `aria-expanded="true"`, `aria-activedescendant` set
> - Body: `dialog-scroll-lock`

### Filter pipeline

Every keystroke runs the same five-step pipeline:

1. Tokenize

> The query is lowercased and split on whitespace. Multi-token queries are AND'd — every token must appear in the haystack for an item to match.

2. Build haystack per item

> On first match, the plugin builds a per-item haystack from `[data-command-label]`, `[data-command-description]`, the item's text content (fallback), and any space-delimited `[data-command-keywords]`. The result is cached on the element as jQuery data so subsequent queries are O(1) per item.

3. Hide non-matches

> Items that fail get `hidden="true"`. Items that pass are pushed into a `_visibleItems` jQuery set in DOM order — this set is the authoritative list for keyboard navigation.

4. Hide empty groups &amp; toggle empty state

> Groups whose entire item set is hidden get `hidden="true"` as well so the headings vanish gracefully. If *nothing* matches, the `[data-command-empty]` element is shown.

5. Re-select &amp; notify

> The active index is reset to the first visible item (so Enter always does something), `aria-activedescendant` is updated, and a `command:filter` event fires with the query and match count.

> [!NOTE]  
> The haystack is a flat concatenation of *label · description · text content · keywords*. That means typing `dash settings` matches an item labelled *Dashboard Settings* AND an item labelled *Dashboard* with `data-command-keywords="settings preferences"`. Use keywords to surface items that *should* match but don't share visible words with the query.

## [Quick **Start**](#quick-start)

#### Markup contract

The plugin recognizes eleven data attributes. Only the root element and a few inner regions are strictly required making the rest optional refinements.

```html
<!-- Trigger (anywhere in the DOM) -->
<button data-command-open="main-cmd">Open palette</button>
 
<!-- Command Menu root -->
<div data-plugin-command-menu id="main-cmd"
     data-plugin-options='{"shortcut": "mod+k", "recent": true}'>
 
  <div data-command-backdrop></div>
 
  <div data-command-panel>
 
    <div data-command-search>
      <i class="fas fa-search"></i>
      <input data-command-input type="text" placeholder="Type a command..." />
    </div>
 
    <div data-command-list>
      <div data-command-empty><strong>No results.</strong></div>
 
      <div data-command-group data-command-heading="Navigation">
        <button data-command-item
                data-command-keywords="dashboard overview"
                data-command-href="/dashboard">
          <i class="fas fa-home" data-command-icon></i>
          <span data-command-label>Dashboard</span>
          <kbd data-command-shortcut>G D</kbd>
        </button>
      </div>
 
    </div>
 
    <div data-command-footer>
      <kbd>↑</kbd><kbd>↓</kbd> navigate
      <kbd>↵</kbd> select
      <kbd>esc</kbd> close
    </div>
  </div>
</div>
```

#### Initialize the instance

```js
// Direct call
$('#main-cmd').themestrapPluginCommandMenu();
 
// Or batch-init via the standard themestrap pattern
$('[data-plugin-command-menu]:not(.manual)').each(function () {
    const $this = $(this);
    const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
    $this.themestrapPluginCommandMenu(opts);
});
```

> [!NOTE]  
> **Add the init.js wiring once and forget about it.**  
> Because the global `mod+k` listener is attached during `events()`, the menu must be initialized before any trigger can fire. Use the DOMReady-immediate pattern (not `intObsInit`) — the menu is already off-screen, so there's no rendering cost.

## [Configuration **Options**](#options)

All options can be set via `data-plugin-options` JSON on the root element, or programmatically via `$el.themestrapPluginCommandMenu(opts)`.

| Key                 | Type   | Default     | Description                                                                                                                                                                              |
|---------------------|--------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `shortcut`          | string | `"mod+k"`   | Global keyboard shortcut to summon the menu. `mod` = ⌘ on Mac, Ctrl elsewhere. Combine with `+`: `"ctrl+shift+p"`, `"alt+/"`. Single keys work too: `"/"`, `"?"`. Set `null` to disable. |
| `closeOnBackdrop`   | bool   | `true`      | Close the menu when the backdrop is clicked.                                                                                                                                             |
| `closeOnSelect`     | bool   | `true`      | Close after an item is activated. Set `false` for inline action menus that should stay open.                                                                                             |
| `backdrop`          | bool   | `true`      | Inject a `[data-command-backdrop]` element if one is not authored. Set `false` for non-modal palettes that overlay without dimming.                                                      |
| `scrollLock`        | bool   | `true`      | Add `dialog-scroll-lock` to `<body>` while open so the page does not scroll behind the panel.                                                                                            |
| `animationIn`       | string | `"fadeIn"`  | CSS animation class applied to `[data-command-panel]` on open. Falls back to the root element if no panel exists.                                                                        |
| `animationOut`      | string | `"fadeOut"` | CSS animation class applied to `[data-command-panel]` on close.                                                                                                                          |
| `animationDuration` | number | `200`       | Fallback timeout (ms) in case `animationend` never fires — keeps state consistent.                                                                                                       |
| `preserveQuery`     | bool   | `false`     | Keep the search query (and filtered state) across close/reopen cycles. When the menu reopens, the input is focused with all text selected so typing replaces it.                         |
| `recent`            | bool   | `false`     | Track activated items in `localStorage` and auto-clone them into `[data-command-recent]`. Persists per instance ID.                                                                      |
| `recentLimit`       | number | `5`         | Maximum number of remembered recent entries.                                                                                                                                             |
| `onOpen`            | fn     | `null`      | Callback fired after open animation begins. Receives the root element. `this` = plugin instance.                                                                                         |
| `onClose`           | fn     | `null`      | Callback fired after close animation completes.                                                                                                                                          |
| `onFilter`          | fn     | `null`      | Callback fired on every query change. Receives `(query, matchCount)`.                                                                                                                    |
| `onSelect`          | fn     | `null`      | Callback fired when an item is activated, BEFORE navigation/close. Receives `($item, payload)` where payload = `{id, action, href, target, label}`.                                      |

#### Shortcut string grammar

The shortcut parser accepts a `+`-separated list of tokens. Order doesn't matter.

| Key     | Type     | Default | Description                                                                                                        |
|---------|----------|---------|--------------------------------------------------------------------------------------------------------------------|
| `mod`   | modifier | —       | ⌘ on Mac, Ctrl on Windows/Linux. The canonical "platform" modifier.                                                |
| `ctrl`  | modifier | —       | Always Ctrl, regardless of platform. Use this when you need to differentiate from ⌘ on Mac.                        |
| `alt`   | modifier | —       | Alt / Option. Accepts `"option"` as an alias.                                                                      |
| `shift` | modifier | —       | Shift.                                                                                                             |
| `<key>` | key      | —       | The actual non-modifier key — letter, digit, or symbol. Single character match against the lowercased `event.key`. |

> [!WARNING]  
> Without a modifier, the shortcut is only matched when the user is NOT typing in any input/textarea/select/contenteditable. With a modifier (`mod` or `ctrl`), the shortcut works everywhere — even mid-typing.

## [Item **Attributes**](#item-attributes)

Item behavior is configured entirely via data attributes which means no JS registration is required for the common cases. The plugin reads these on activation and dispatches the right thing.

| Key                        | Type   | Default | Description                                                                                                                                             |
|----------------------------|--------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data-command-item`        | attr   | —       | Marks an element as a selectable command. Required.                                                                                                     |
| `data-command-keywords`    | string | —       | Space-delimited extra search terms. Items match if every typed token appears in label, description, text content, OR keywords.                          |
| `data-command-href`        | string | —       | URL to navigate to on activation. If both `href` and a registered `action` exist, the action wins.                                                      |
| `data-command-target`      | string | `_self` | Anchor target. `_blank` opens in a new tab via `window.open()`.                                                                                         |
| `data-command-action`      | string | —       | Key passed to `registerAction(key, callback)`. When activated, the callback runs with `($item, instance)`.                                              |
| `data-command-skip-filter` | flag   | —       | Item is always shown when its group is shown but its exempt from the substring filter. Useful for static helpers like "Clear recents" or "Create new…". |
| `disabled / aria-disabled` | flag   | —       | Standard ARIA.. the item is rendered but inert. The filter still includes it for visual completeness; activation is a no-op.                            |

#### Inner element hooks

* * *

Inside each `[data-command-item]`, these tagged children get specific styling and ARIA treatment:

| Key                          | Type    | Default | Description                                                                                |
|------------------------------|---------|---------|--------------------------------------------------------------------------------------------|
| `[data-command-icon]`        | element | —       | Leading icon. Colour-coordinated with the active state.                                    |
| `[data-command-label]`       | element | —       | The visible label. Used as the primary haystack term. Truncated with ellipsis on overflow. |
| `[data-command-description]` | element | —       | Optional secondary text. Searchable, displayed in muted color, wraps to a second line.     |
| `[data-command-shortcut]`    | element | —       | Right-aligned keyboard hint (kbd-styled). Visual only — does not bind a real shortcut.     |
| `[data-command-badge]`       | element | —       | Right-aligned pill (e.g. "New", "Beta"). Uses the accent color.                            |

## [Instance **API**](#instance-api)

Every initialized menu exposes an instance on its root element under `$el.data('__pluginCommandMenu')`.

| Method                          | Returns | Description                                                                                              |
|---------------------------------|---------|----------------------------------------------------------------------------------------------------------|
| `open()`                        | this    | Show the menu, focus the input, reset the query (unless `preserveQuery` is on). Fires `command:open`.    |
| `close()`                       | this    | Animate out, restore focus to the originally-focused element. Fires `command:close`.                     |
| `toggle()`                      | this    | Open if closed, close if open.                                                                           |
| `setQuery(q)`                   | this    | Programmatically set the search query. Runs the same filter pipeline as user typing.                     |
| `registerAction(key, callback)` | this    | Bind a JS callback to a `[data-command-action="key"]` item. Callback signature: `($item, instance)`.     |
| `unregisterAction(key)`         | this    | Remove a previously registered action callback.                                                          |
| `pushRecent(id)`                | this    | Manually push an item ID into the recents stack. Normally happens automatically on selection.            |
| `clearRecent()`                 | this    | Wipe the recents localStorage entry and re-render the empty bucket.                                      |
| `destroy()`                     | this    | Remove all event listeners (document-level included), drop the instance reference, strip plugin classes. |

#### Event lifecycle

All four lifecycle events bubble from the menu's root element. They carry the instance as the first extra arg, plus context-specific payload.

```js
$('#main-cmd')
  .on('command:open',   (e, instance) => console.log('opened'))
  .on('command:close',  (e, instance) => console.log('closed'))
  .on('command:filter', (e, instance, query, matchCount) => {
      console.log(`"${query}" -> ${matchCount} matches`);
  })
  .on('command:select', (e, instance, $item, payload) => {
      // payload = {id, action, href, target, label}
      if (payload.action === 'logout') {
          e.preventDefault();   // suppress default navigate/close
          showConfirmModal();
      }
  });
```

> [!NOTE]  
> Call `e.preventDefault()` on the event (or return `false` from `onSelect`) and the plugin will skip both the navigation AND the auto-close. This is the right place for confirmation modals, async API calls, or anything else that needs to interject before activation.

#### Action callbacks

For items that should run JS instead of navigating, give them `data-command-action="some-key"` and register a callback:

```js
const cmd = $('#main-cmd').data('__pluginCommandMenu');
 
cmd.registerAction('new-project', ($item, instance) => {
    instance.close();
    showNewProjectDialog();
});
 
cmd.registerAction('toggle-theme', () => {
    document.documentElement.classList.toggle('dark');
});
 
cmd.registerAction('logout', () => {
    if (confirm('Sign out?')) window.location = '/logout';
});
```

## [Keyboard **Reference**](#keyboard)

Full keyboard surface so every key is intercepted on the search input and routed to the right handler.

| Key                     | Type    | Default | Description                                                                                                        |
|-------------------------|---------|---------|--------------------------------------------------------------------------------------------------------------------|
| `⌘K (or your shortcut)` | global  | —       | Opens the menu from anywhere on the page. Works inside ordinary form inputs when the shortcut includes a modifier. |
| `Escape`                | global  | —       | Closes the menu when open. Bubbles up if no menu is open.                                                          |
| `ArrowDown / ArrowUp`   | in-menu | —       | Move active item by one. Wraps at the ends.                                                                        |
| `Home / End`            | in-menu | —       | Jump to first / last visible item.                                                                                 |
| `PageDown / PageUp`     | in-menu | —       | Jump by five items, clamped to range.                                                                              |
| `Tab / Shift+Tab`       | in-menu | —       | Same as ArrowDown / ArrowUp — focus is trapped inside the menu while open.                                         |
| `Enter`                 | in-menu | —       | Activate the currently highlighted item.                                                                           |
| `Type any character`    | in-menu | —       | Appends to the search query and re-filters. First visible item becomes active.                                     |

> [!NOTE]  
> When arrow navigation moves the active item past the visible edge of the list, the plugin updates `scrollTop` to keep it in view. Mouse hover updates the active item without scrolling.

## [Recipe **Cookbook**](#recipes)

Common patterns — copy, paste, customize.

Async-load items on first open

```js
const cmd = $('#projects-cmd')
  .themestrapPluginCommandMenu()
  .data('__pluginCommandMenu');
 
let loaded = false;
$('#projects-cmd').on('command:open', async () => {
  if (loaded) return;
  loaded = true;
 
  const projects = await fetch('/api/projects').then(r => r.json());
  const $group = $('[data-command-heading="Projects"]', '#projects-cmd');
 
  projects.forEach(p => {
    $group.append(`
      <button data-command-item
              data-command-href="/projects/${p.id}"
              data-command-keywords="${p.tags.join(' ')}">
        <i class="fas fa-folder" data-command-icon></i>
        <span data-command-label>${p.name}</span>
        <span data-command-description>${p.client}</span>
      </button>
    `);
  });
 
  // Re-prime the plugin's cached item pool
  cmd.build();
});
```

## [Common **Pitfalls**](#pitfalls)

Five things that have tripped real integrations. Read first.

#### The menu needs to init before its trigger can fire

> [!CAUTION]  
> Unlike most Themestrap plugins, the command menu cannot use `intObsInit` (lazy-on-viewport) because the menu is OFF-screen on every page — IntersectionObserver would never fire. Use the DOMReady-immediate pattern shown in the Quick Start. Otherwise pressing ⌘K does nothing until the user happens to scroll the menu into view, which never happens.

#### No `id` = no triggers, no recents

> [!WARNING]  
> Triggers find their menu via `data-command-open="<menu-id>"`, and the recents stack is keyed by id in localStorage. Without an `id` on the menu root, triggers won't open it (the plugin still works programmatically) and recents have nowhere to persist. If you author markup by hand, set one explicitly.

#### Injecting items at runtime requires a rebuild

> [!NOTE]  
> The plugin caches the item pool in `_allItems` at build time and only refreshes it when recents change. If you inject new `[data-command-item]` elements via Ajax or runtime code, call `instance.build()` after insertion so the filter sees them. (The plugin's `build()` is idempotent for the parts that matter — it re-queries the DOM and re-assigns IDs to anything missing one.)

#### Shortcut collisions with the browser

> [!WARNING]  
> `mod+k` is canonical for command palettes but it clashes with Firefox's search bar and some Chrome extensions. The plugin's `e.preventDefault()` suppresses the browser default on its handled keys, but extensions that listen at a higher priority can still win. If you're getting partial behavior, try `mod+shift+k` or `mod+/` as alternatives.

#### Body stuck scroll-locked after a hard close

> [!WARNING]  
> If you remove the menu element from the DOM while it's open (route change in an SPA, jQuery `.remove()` without calling `destroy()`), the `dialog-scroll-lock` class on `<body>` stays applied. Always call `instance.destroy()` before removing the root element. The plugin's `destroy()` calls `close()` first, which handles cleanup correctly.

### **Quick diagnostic checklist**

> - Is jQuery loaded before `themestrap.js`?
> - Is the plugin file (`themestrap.plugin.commandmenu.js`) actually being served? Check the network panel.
> - Does the plugin's CSS file (or your inline equivalent) define `.command-hidden { display: none }`?
> - Is the trigger's `data-command-open` value an exact match for the menu's `id`?
> - Is there a parent element with `pointer-events: none`? The menu is `position: fixed` but parents can still suppress clicks on the backdrop.
> - Is the global shortcut firing inside an iframe? The keydown listener is attached to the parent document only.
> - Run `$('#yourMenuId').data('__pluginCommandMenu')` in the console. This should return an object, not `undefined`.
