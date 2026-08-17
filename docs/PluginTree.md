# PluginTree

A self-contained jQuery tree widget with no external dependencies — JSON or inline HTML data sources, animated expand/collapse, single/multi-select, cascading checkboxes, full keyboard navigation, and fuzzy search, all in one file.

---

## Installation

Include the plugin file after `themestrap.js` and jQuery:

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.tree.js"></script>
```

The plugin injects its own stylesheet on first use and removes it when the last instance is destroyed — no separate CSS file required.

---

## Quick Start

### From JSON

```html
<div id="my-tree"></div>

<script>
const tree = $('#my-tree').themestrapPluginTree({
    data: [
        { id: 'home', text: 'Home' },
        {
            id: 'docs', text: 'Documentation',
            state: { opened: true },
            children: [
                { id: 'guide',  text: 'Getting Started' },
                { id: 'api',    text: 'API Reference'   }
            ]
        }
    ]
})[0];
</script>
```

### From Inline HTML

```html
<div id="my-tree">
    <ul>
        <li data-node-id="home">Home</li>
        <li data-node-id="docs" data-state="open">Documentation
            <ul>
                <li data-node-id="guide">Getting Started</li>
                <li data-node-id="api">API Reference</li>
            </ul>
        </li>
    </ul>
</div>

<script>
const tree = $('#my-tree').themestrapPluginTree()[0];
</script>
```

### Auto-init via data attribute

```html
<div data-plugin-tree data-plugin-options='{"openAll": true}'></div>
```

```js
// Tree
if ($.isFunction($.fn['themestrapPluginTree']) && $('[data-plugin-tree]').length) {
    themestrap.fn.intObsInit('[data-plugin-tree]:not(.manual)', 'themestrapPluginTree');
}
```

---

## Data Sources

### JSON Data

Pass an array of node objects to the `data` option. The plugin builds the tree DOM from scratch, giving you full control over structure, icons, and initial state without any HTML in your markup.

```js
$('#my-tree').themestrapPluginTree({
    data: [
        {
            id:   'proj',
            text: 'My Project',
            icon: 'bi bi-folder',
            state: { opened: true },
            children: [
                {
                    id:   'src',
                    text: 'src',
                    children: [
                        { id: 'main', text: 'main.js' },
                        { id: 'util', text: 'utils.js', state: { selected: true } }
                    ]
                },
                { id: 'pkg', text: 'package.json', state: { disabled: true } }
            ]
        }
    ]
});
```

See [JSON Node Schema](#json-node-schema) for a full description of every node property.

### Inline HTML

When `data` is `null` (the default), the plugin reads a `<ul>` directly inside the wrapper element. This is useful when the tree structure is server-rendered or already present in the page.

```html
<div id="my-tree">
    <ul>
        <li data-node-id="animals" data-state="open">Animals
            <ul>
                <li data-node-id="mammals">Mammals
                    <ul>
                        <li data-node-id="cat">Cat</li>
                        <li data-node-id="dog">Dog</li>
                    </ul>
                </li>
                <li data-node-id="reptiles">Reptiles</li>
            </ul>
        </li>
    </ul>
</div>
```

**Supported `data-state` values on `<li>` elements**

| Value | Effect |
|---|---|
| `open` | Node starts expanded |
| `selected` | Node starts selected |
| `disabled` | Node is non-interactive |

The `data-node-id` attribute is used as the node's identifier throughout the API. If omitted, the plugin falls back to the element's `id` attribute, then to the node's trimmed text content.

---

## Options Reference

```js
$('#my-tree').themestrapPluginTree({
    data:        null,   // JSON node array, or null to read from DOM
    openAll:     false,  // expand every folder on init (no animation)
    checkbox:    false,  // show checkboxes; enables cascading select
    multiSelect: true,   // false = at most one node selected at a time
    animation:   200,    // slideDown/slideUp duration in ms; 0 to disable
    icons: {
        folder:  null,   // CSS class string for folder icon (overrides default emoji)
        leaf:    null,   // CSS class string for leaf icon
    },
    search: {
        enabled:     false,       // inject a search input above the tree
        placeholder: 'Search…',  // input placeholder text
        fuzzy:       false,       // fuzzy char-order match vs exact substring
        openFound:   true,        // auto-open ancestors of matching nodes
    },
    onSelect:   null,   // callback(nodeData, $li) — fired on node select
    onDeselect: null,   // callback(nodeData, $li) — fired on node deselect
    onOpen:     null,   // callback(nodeData, $li) — fired on folder open
    onClose:    null,   // callback(nodeData, $li) — fired on folder close
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `data` | `Array\|null` | `null` | JSON node array. `null` means read from existing `<ul>` inside the wrapper. |
| `openAll` | `boolean` | `false` | Expand all folder nodes immediately on init, without animation. |
| `checkbox` | `boolean` | `false` | Render a checkbox on every node. Clicking a parent cascades to all descendants; parent state reflects children (checked / indeterminate / unchecked). |
| `multiSelect` | `boolean` | `true` | When `false`, selecting a node clears all previous selections first. |
| `animation` | `number` | `200` | jQuery `slideDown`/`slideUp` duration in milliseconds. Set to `0` to disable animation entirely. |
| `icons.folder` | `string\|null` | `null` | CSS class(es) applied to the icon `<span>` of folder nodes, e.g. `'bi bi-folder'`. Defaults to an emoji icon when `null`. |
| `icons.leaf` | `string\|null` | `null` | CSS class(es) applied to the icon `<span>` of leaf nodes. Defaults to an emoji icon when `null`. |
| `search.enabled` | `boolean` | `false` | Prepend a search `<input>` to the tree. Also exposes a ✕ clear button. |
| `search.placeholder` | `string` | `'Search…'` | Placeholder text for the search input. |
| `search.fuzzy` | `boolean` | `false` | When `true`, matches nodes whose text contains all query characters in order (e.g. `'btn'` matches `'Button'`). When `false`, uses exact case-insensitive substring matching with `<mark>` highlighting. |
| `search.openFound` | `boolean` | `true` | Automatically reveal ancestor folders of matching nodes during a search. |
| `onSelect` | `Function\|null` | `null` | Callback invoked after a node is selected. Receives `(nodeData, $li)`. |
| `onDeselect` | `Function\|null` | `null` | Callback invoked after a node is deselected. Receives `(nodeData, $li)`. |
| `onOpen` | `Function\|null` | `null` | Callback invoked after a folder is opened. Receives `(nodeData, $li)`. |
| `onClose` | `Function\|null` | `null` | Callback invoked after a folder is closed. Receives `(nodeData, $li)`. |

---

## JSON Node Schema

Each item in the `data` array (and each item in a node's `children` array) follows this shape:

```js
{
    id:       'unique-string',  // required — used as the API reference key
    text:     'Display Label',  // required — text shown in the tree
    icon:     'bi bi-file',     // optional — CSS class(es) for a custom icon
    state: {
        opened:   false,        // start this folder expanded
        selected: false,        // start this node selected
        disabled: false,        // make this node non-interactive
    },
    children: []                // array of child node objects (omit for leaf nodes)
}
```

| Property | Type | Required | Notes |
|---|---|---|---|
| `id` | `string\|number` | Yes | Must be unique across the entire tree. Used by all API methods as the reference key. |
| `text` | `string` | Yes | The label rendered inside the node. HTML is escaped — plain text only. |
| `icon` | `string` | No | CSS class string rendered as `<i class="...">` inside the icon wrapper. Overrides `icons.folder`/`icons.leaf` for this specific node. |
| `state.opened` | `boolean` | No | Starts the node expanded. Only meaningful for nodes that have `children`. |
| `state.selected` | `boolean` | No | Starts the node selected (and checked, if `checkbox: true`). |
| `state.disabled` | `boolean` | No | Renders the node at 38% opacity with `pointer-events: none`. Disabled nodes cannot be selected or toggled. |
| `children` | `Array` | No | Array of child node objects following the same schema. Omitting `children` (or passing an empty array) makes the node a leaf. |

---

## Public API

### Accessing the Instance

```js
// Option 1 — from the jQuery plugin call
const tree = $('#my-tree').themestrapPluginTree({ ... })[0];

// Option 2 — retrieve later via jQuery data
const tree = $('#my-tree').data('__pluginTree');
```

### Method Reference

All methods return the instance, so calls are chainable.

| Method | Arguments | Returns | Description |
|---|---|---|---|
| `open(ref)` | `ref` — id string, number, or jQuery `<li>` | `instance` | Expands a folder node. No-ops on leaf nodes or already-open folders. Fires `ts.tree.open` and `onOpen`. |
| `close(ref)` | `ref` | `instance` | Collapses a folder node. No-ops on already-closed or leaf nodes. Fires `ts.tree.close` and `onClose`. |
| `toggle(ref)` | `ref` | `instance` | Opens the node if closed, closes it if open. |
| `openAll()` | — | `instance` | Expands every folder in the tree, each firing its own `ts.tree.open` event. |
| `closeAll()` | — | `instance` | Collapses every open folder, each firing its own `ts.tree.close` event. |
| `select(ref)` | `ref` | `instance` | Selects a node programmatically. Respects `multiSelect`. Fires `ts.tree.select` and `onSelect`. |
| `deselect(ref)` | `ref` | `instance` | Deselects a specific node. Fires `ts.tree.deselect` and `onDeselect`. |
| `deselectAll()` | — | `instance` | Clears all selections silently (no events fired per node). |
| `getSelected()` | — | `Array` | Returns `[{ id, data, $el }, ...]` for every currently selected node. |
| `search(term)` | `string` | `instance` | Filters the tree to nodes matching `term`. Pass an empty string to clear the filter and restore the tree. Fires `ts.tree.search`. |
| `destroy()` | — | `instance` | Removes all event listeners, restores the original inner HTML, removes the instance from jQuery data, and ref-counts the injected stylesheet (removes it when the last instance is destroyed). |

### The `ref` Parameter

`open`, `close`, `toggle`, `select`, and `deselect` all accept a **ref** — any of:

- A **string or number** matching a node's `id` — `tree.open('docs')`
- A **jQuery object** pointing to the `<li>` element — `tree.open($li)`

```js
// By id string
tree.open('components');
tree.select('api');

// By jQuery element (from an event handler)
tree.$el.on('click', '.ts-tree-node', function() {
    tree.open($(this));
});

// Chained
tree.openAll().select('home');
```

### `getSelected()` Return Shape

```js
const selected = tree.getSelected();
// [
//   {
//     id:   'api',
//     data: { id: 'api', text: 'API Reference', ... },  // original node object
//     $el:  jQuery(<li>)
//   },
//   ...
// ]

const ids = tree.getSelected().map(s => s.id);
```

---

## Events

All events are native `CustomEvent` instances dispatched on the wrapper element with `bubbles: true`, so they can be caught anywhere up the DOM.

| Event | `detail` shape | Fired when |
|---|---|---|
| `ts.tree.select` | `{ id, data, $el }` | A node is selected (click, keyboard, or `select()` API call) |
| `ts.tree.deselect` | `{ id, data, $el }` | A node is deselected |
| `ts.tree.open` | `{ id, data, $el }` | A folder is expanded |
| `ts.tree.close` | `{ id, data, $el }` | A folder is collapsed |
| `ts.tree.search` | `{ term, count }` | A search is run (including clear — `term` will be `''`, `count` will be `0`) |

`deselectAll()` does **not** fire `ts.tree.deselect` per node — use it when you want a silent bulk clear.

### Listening for Events

```js
const el = document.getElementById('my-tree');

el.addEventListener('ts.tree.select', function(e) {
    console.log('Selected:', e.detail.id, e.detail.data);
});

el.addEventListener('ts.tree.open', function(e) {
    console.log('Opened folder:', e.detail.id);
});

el.addEventListener('ts.tree.search', function(e) {
    console.log(`"${e.detail.term}" → ${e.detail.count} result(s)`);
});
```

### Using jQuery `.on()` (events bubble)

```js
$(document).on('ts.tree.select', '#my-tree', function(e) {
    // e.originalEvent.detail contains the payload
    console.log(e.originalEvent.detail.id);
});
```

### Callback Options vs. Events

Callbacks (`onSelect`, `onDeselect`, `onOpen`, `onClose`) are called with `(nodeData, $li)` and fire at the same point as their corresponding events. Use callbacks for simple inline handling; use events when you need to decouple listeners from the initialization call or listen across multiple trees.

---

## Keyboard Navigation

The plugin implements the [WAI-ARIA Treeview pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Each node inner element is focusable (`tabindex="0"`) and responds to:

| Key | Action |
|---|---|
| `↓` Arrow Down | Move focus to the next visible node |
| `↑` Arrow Up | Move focus to the previous visible node |
| `→` Arrow Right | If folder is closed — open it. If already open — move focus into first child. |
| `←` Arrow Left | If folder is open — close it. If already closed or is a leaf — move focus to parent. |
| `Home` | Move focus to the first node in the tree |
| `End` | Move focus to the last visible node in the tree |
| `Enter` | Select the focused node (or toggle its checkbox if `checkbox: true`) and open/close if it is a folder |
| `Space` | Same as `Enter` |

Focus is never trapped inside the tree — `Tab` and `Shift+Tab` follow standard browser behaviour.

---

## Checkbox Mode

Enable with `checkbox: true`. A checkbox element appears on every node, and selection is driven through checkbox clicks rather than node text clicks.

```js
$('#my-tree').themestrapPluginTree({
    checkbox:    true,
    multiSelect: true,
    data: [
        {
            id: 'perms', text: 'Permissions',
            children: [
                { id: 'read',   text: 'Read'   },
                { id: 'write',  text: 'Write'  },
                { id: 'delete', text: 'Delete' }
            ]
        }
    ]
});
```

### Cascading Logic

- Checking a **parent** checks all of its descendants.
- Unchecking a **parent** unchecks all of its descendants.
- Checking or unchecking a **child** updates all ancestors:
  - All children checked → parent shows **checked** (✓)
  - No children checked → parent shows **unchecked**
  - Some children checked → parent shows **indeterminate** (−)

### Reading Checkbox State

`getSelected()` returns every node that is currently in the checked state, regardless of whether it is a folder or leaf:

```js
const checked = tree.getSelected().map(s => s.id);
// ['read', 'write']
```

---

## Search & Filter

```js
$('#my-tree').themestrapPluginTree({
    data: [...],
    search: {
        enabled:     true,
        placeholder: 'Filter…',
        fuzzy:       false,
        openFound:   true
    }
});
```

When `search.enabled` is `true`, a text input is prepended to the tree wrapper. The user can type to filter nodes. A ✕ clear button appears as soon as the input has content.

### Matching Modes

**Substring (default, `fuzzy: false`)** — case-insensitive `String.prototype.includes()`. Matching text is highlighted with a `<mark>` element.

**Fuzzy (`fuzzy: true`)** — all characters of the search term must appear in the node text in the same order, but do not need to be adjacent. `'btn'` matches `'Button'`, `'Submit Button'`, and `'Abstract'`. Fuzzy mode does not highlight matches.

### Programmatic Search

You can call `search()` without a visible input — useful for filtering the tree from an external control:

```js
// Filter to nodes containing 'button'
tree.search('button');

// Clear the filter and restore the full tree
tree.search('');
```

### Search Event

```js
document.getElementById('my-tree').addEventListener('ts.tree.search', function(e) {
    // e.detail.term  — the search string (empty string on clear)
    // e.detail.count — number of nodes that matched
    if (!e.detail.term) return;
    console.log(`Found ${e.detail.count} result(s) for "${e.detail.term}"`);
});
```

---

## Custom Icons

### Global Override via Options

```js
$('#my-tree').themestrapPluginTree({
    icons: {
        folder: 'bi bi-folder',      // all folder nodes
        leaf:   'bi bi-file-text',   // all leaf nodes
    }
});
```

The class string is applied to the icon `<span>` inside each node. Any icon library that works via CSS class (Bootstrap Icons, Font Awesome, Remix Icons, etc.) is compatible.

### Per-Node Override via JSON

An `icon` property on an individual node always wins over the global `icons` option:

```js
{
    id:   'images',
    text: 'Images',
    icon: 'bi bi-images',   // overrides icons.folder for this node only
    children: [
        { id: 'logo', text: 'logo.png', icon: 'bi bi-file-image' }
    ]
}
```

### Per-Node Override via HTML

For inline HTML trees, add the icon markup yourself before calling the plugin — the plugin only creates an icon wrapper if none is present:

```html
<li data-node-id="images">
    <i class="bi bi-images"></i> Images
    <ul>...</ul>
</li>
```

---

## Styling & CSS Variables

The plugin uses the standard Themestrap CSS custom properties. Override any of them on the wrapper element or a parent to retheme the tree without touching the injected stylesheet:

```css
#my-tree {
    --bg-deepest:  #1a1a2e;
    --bg-hover:    #16213e;
    --bg-active:   #0f3460;
    --text-normal: #e0e0e0;
    --text-bright: #ffffff;
    --accent-cyan: #e94560;
    --border-soft: rgba(233, 69, 96, 0.20);
}
```

| Variable | Role |
|---|---|
| `--bg-deepest` | Search input background |
| `--bg-hover` | Node hover background |
| `--bg-active` | Selected node background |
| `--text-normal` | Default node text colour |
| `--text-bright` | Hovered node text colour |
| `--text-dim` | Expand/collapse arrow colour |
| `--text-muted` | Unset checkbox border colour |
| `--accent-cyan` | Selected node text; search highlight; checkbox fill; focus ring |
| `--border-soft` | Search input border |
| `--border-mid` | Search input focus border |
| `--font-ui` | Node label font |
| `--font-mono` | Search input font |

### Key CSS Classes

| Class | Element | Notes |
|---|---|---|
| `.ts-tree` | Wrapper | Added to the root element on init |
| `.ts-tree-node` | `<li>` | Every node |
| `.ts-tree-node.ts-tree-leaf` | `<li>` | Leaf node (no children) |
| `.ts-tree-node.ts-tree-open` | `<li>` | Currently expanded folder |
| `.ts-tree-node.ts-tree-selected` | `<li>` | Currently selected node |
| `.ts-tree-node.ts-tree-disabled` | `<li>` | Disabled node |
| `.ts-tree-node.ts-tree-hidden` | `<li>` | Hidden during search filter |
| `.ts-tree-node-inner` | `<span>` | Clickable row inside each node |
| `.ts-tree-anchor` | `<span>` | The expand/collapse arrow |
| `.ts-tree-icon` | `<span>` | Icon wrapper |
| `.ts-tree-text` | `<span>` | Node label |
| `.ts-tree-checkbox` | `<span>` | Checkbox element (when `checkbox: true`) |
| `.ts-tree-checkbox.ts-tree-checked` | `<span>` | Checked state |
| `.ts-tree-checkbox.ts-tree-indeterminate` | `<span>` | Indeterminate state |
| `.ts-tree-children` | `<ul>` | Child node list |
| `.ts-tree-search` | `<div>` | Search bar wrapper (when `search.enabled: true`) |
| `.ts-tree-no-results` | `<div>` | "No results" message shown during a zero-match search |

---

## init.js Wiring

Add this block to `themestrap.init.js` to enable automatic initialization for any element carrying `data-plugin-tree`:

```js
// Tree
if ($.isFunction($.fn['themestrapPluginTree']) && $('[data-plugin-tree]').length) {
    themestrap.fn.intObsInit('[data-plugin-tree]:not(.manual)', 'themestrapPluginTree');
}
```

Then in your HTML:

```html
<!-- Auto-initialized with options -->
<div data-plugin-tree data-plugin-options='{"openAll": true, "checkbox": true}'></div>

<!-- Skipped by auto-init — initialize manually -->
<div data-plugin-tree class="manual" id="my-tree"></div>
<script>
$('#my-tree').themestrapPluginTree({ multiSelect: false });
</script>
```

---

## Accessibility

The plugin follows the [ARIA Treeview pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

- The root `<ul>` carries `role="tree"`.
- Every `<li>` carries `role="treeitem"`.
- Child `<ul>` elements carry `role="group"`.
- Folder `<li>` elements carry `aria-expanded="true|false"`, updated on every open/close.
- Disabled nodes carry `aria-disabled="true"`.
- Checkboxes carry `role="checkbox"` and `aria-checked="true|false|mixed"`.
- The expand/collapse arrow carries `aria-hidden="true"`.
- Every node inner element is focusable (`tabindex="0"`) and handles the full set of keyboard interactions described in [Keyboard Navigation](#keyboard-navigation).
- Search match highlights use `<mark>` elements, which are announced by screen readers as highlighted text.

---

## Recipes

### Single-select sidebar navigation

```js
$('#sidebar-nav').themestrapPluginTree({
    data: [
        { id: 'home',     text: 'Home',     icon: 'bi bi-house' },
        { id: 'products', text: 'Products', icon: 'bi bi-box',
          state: { opened: true },
          children: [
              { id: 'phones',   text: 'Phones'   },
              { id: 'laptops',  text: 'Laptops'  },
              { id: 'tablets',  text: 'Tablets'  }
          ]
        },
        { id: 'contact', text: 'Contact', icon: 'bi bi-envelope' }
    ],
    multiSelect: false,
    animation:   160,
    onSelect: function(node) {
        window.location.hash = node.id;
    }
});
```

### File explorer with selection readout

```js
const explorer = $('#explorer').themestrapPluginTree({
    data:        fileSystemData,
    multiSelect: true,
    animation:   120
})[0];

$('#open-selected').on('click', function() {
    const files = explorer.getSelected()
        .filter(s => !s.data.children)    // leaves only
        .map(s => s.id);
    console.log('Opening:', files);
});
```

### Permissions checklist

```js
$('#perms-tree').themestrapPluginTree({
    data:        rolesAndCapabilities,
    checkbox:    true,
    openAll:     true,
    multiSelect: true,
    onSelect: function(node) {
        syncPermission(node.id, true);
    },
    onDeselect: function(node) {
        syncPermission(node.id, false);
    }
});
```

### Searchable component library with external input

```js
const tree = $('#component-tree').themestrapPluginTree({
    data:      componentData,
    animation: 0              // disable animation for snappy search response
})[0];

$('#external-search').on('input', function() {
    tree.search($(this).val());
});

$('#clear-btn').on('click', function() {
    $('#external-search').val('');
    tree.search('');
});
```

### Re-initializing with new options

`destroy()` restores the original inner HTML, so you can call the plugin again cleanly:

```js
let tree = $('#my-tree').themestrapPluginTree({ checkbox: false })[0];

$('#toggle-checkboxes').on('click', function() {
    tree.destroy();
    tree = $('#my-tree').themestrapPluginTree({
        checkbox: true,
        openAll:  true
    })[0];
});
```

### Listening to multiple trees from a single handler

Because events bubble, a single listener on a common ancestor covers every tree in a section:

```js
document.getElementById('sidebar').addEventListener('ts.tree.select', function(e) {
    const { id, data } = e.detail;
    console.log('Node selected in some tree:', id, data);
});
```
