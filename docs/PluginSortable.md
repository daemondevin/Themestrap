# PluginSortable Guide

Drag and drop reordering for lists, rows and grids. It works with a mouse, touch and the keyboard, and lists that share a group name accept each other's items, so a card can move from one column to another. There are no dependencies beyond jQuery.

| | |
|---|---|
| Plugin file | `js/components/themestrap.plugin.sortable.js` |
| Demo | `demos/plugin.demo.sortable.html` |
| Namespace class | `themestrap.PluginSortable` |
| jQuery method | `$.fn.themestrapPluginSortable` |
| Data attribute | `data-plugin-sortable` |
| Instance key | `__pluginSortable` |
| Options attribute | `data-plugin-options` |
| CSS token prefix | `--ts-sort-*` |

Not to be confused with **PluginSort**, which filters a grid with buttons. Sortable lets people put items in their own order.


## How It Works

1. `initialize()` returns early if `$el.data('__pluginSortable')` already exists, otherwise it runs `setData → setOptions → build → events`.
2. `build()` injects one shared `<style id="ts-sortable-styles">` (counted per instance and removed with the last one), adds `.ts-sort-list` to the list (and `.ts-sort-whole` when there is no `handle`), joins the list to its `group`, and marks the items.
3. Marking gives every direct child that matches `items` the class `.ts-sort-item`, and gives its handle (the element matching `handle`, or the item itself) the class `.ts-sort-handle`. A handle with no `aria-label` or `title` gets the `labels.move` text as its `aria-label`.
4. A press on a handle starts a drag. On a touch screen, an item that is its own handle is picked up after the finger rests on it for 300ms, so a quick swipe still scrolls the page. The item gets `.is-dragging` and `<html>` gets `.ts-sort-dragging`, which shows a closed hand everywhere and stops text selection.
5. While the pointer moves, the item is moved in the DOM straight away. Where it goes depends on how the list is laid out, which is read from the item positions on every move:
   - **a column** (`y`): before the first item whose vertical middle is below the pointer;
   - **a row** (`x`): before the first item whose horizontal middle is past the pointer, in reading direction, so right to left pages work too;
   - **a grid** (rows that wrap): before the first item in a lower row, or in the pointer's row and past the pointer.

   Other lists in the same group take the item when the pointer is over them or within 12px of their edges. That list gets `.is-over`.
6. On release the plugin compares the order with the order at the start. If the item moved, `ts.sortable.sort` fires. `ts.sortable.end` always fires. Pressing `Escape` during a drag puts the item back where it started and fires only `end`.

Rendered structure, with `handle: '.grip'`:

```html
<ul class="ts-sort-list" data-plugin-sortable>
    <li class="ts-sort-item" data-id="1">
        <button class="grip ts-sort-handle" type="button"
                aria-label="Move. Use the arrow keys to change the order."></button>
        First
    </li>
</ul>
```


## Quick Start

### 1. Include the script

```html
<script src="js/components/themestrap.plugin.sortable.js"></script>
```

It must load after jQuery and `themestrap.js`. `themestrap.bundle.js` already contains it.

### 2. Add the markup

```html
<ul data-plugin-sortable>
    <li data-id="hero">Hero banner</li>
    <li data-id="features">Feature grid</li>
    <li data-id="pricing">Pricing table</li>
</ul>
```

Give every item a `data-id`. It is what `toArray()` and the `order` in the events report, so it is what you save.

That's all. `themestrap.init.js` starts every `[data-plugin-sortable]` that isn't `.manual` as it comes near the screen, and `themestrap.modules.js` defines it as the `sortable` module for pages that use the loader.

### Manual init

```html
<ul id="pages" class="manual">...</ul>
```

```js
$('#pages').themestrapPluginSortable({
    handle: '.grip',
    onSort: function (detail) {
        $.post('/admin/pages/order', { order: detail.order.join(',') });
    }
});
```


## Markup Reference

| Attribute / class | On | Purpose |
| --- | --- | --- |
| `data-plugin-sortable` | the list | Marks the list for auto init |
| `data-plugin-options='{"k": "v"}'` | the list | Options as JSON in a single quoted attribute |
| `.manual` | the list | Leaves the list out of auto init |
| `data-id="..."` | each item | The item's identity in `toArray()` and in events. Change the attribute name with `idAttr` |
| A `<button type="button">` | inside each item | Recommended handle. A button can be focused, so the keyboard works |
| `tabindex="0"` | each item | Without a handle, lets the keyboard reach and move the items |

Only **direct children** of the list are items. Any element can be the list (`<ul>`, `<ol>`, `<div>`, `<tbody>`), laid out as a column, a row (`display: flex`) or a grid (`display: grid`, or a flex row that wraps).

The plugin adds these classes:

| Class | On | When |
| --- | --- | --- |
| `.ts-sort-list` | the list | Always |
| `.ts-sort-whole` | the list | When there is no `handle` |
| `.ts-sort-item` | each item | Always |
| `.ts-sort-handle` | each handle | Always |
| `.is-dragging` | the item | While it is dragged |
| `.is-over` | another list in the group | While the dragged item is over it |
| `.ts-sort-disabled` | the list | After `disable()` |
| `.ts-sort-dragging` | `<html>` | During any drag |


## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | string | `'*'` | Selector for the children that can be moved. Children that don't match stay where they are but still take up space in the list. |
| `handle` | string | `''` | Selector of the grip inside each item. Empty: the whole item is the handle, except links, buttons, labels, form fields and editable areas inside it, and touch screens pick items up after a short hold. |
| `group` | string | `''` | Lists with the same group name accept each other's items. Empty: the list keeps its items to itself. |
| `axis` | string | `'auto'` | How the items are laid out: `'y'` (a column), `'x'` (a row) or `'grid'` (rows that wrap). `'auto'` reads it from the item positions, or from the list's CSS when it has fewer than two items. |
| `idAttr` | string | `'data-id'` | The attribute that `toArray()` reads. Items without it are reported as `''`. |
| `labels.move` | string | `'Move. Use the arrow keys to change the order.'` | The `aria-label` given to handles that have no `aria-label` or `title`. Only used when `handle` is set. |
| `onStart` | function | `null` | `function (detail) {}`, called with `this` as the instance, when a drag starts. |
| `onSort` | function | `null` | `function (detail) {}`, called after a drop or a key press that changed the order or moved the item to another list. |
| `onEnd` | function | `null` | `function (detail) {}`, called after every drag, moved, unmoved or cancelled. |

Merge order: `defaults → opts → { wrapper }`. Called without an options object, the jQuery method reads each element's own `data-plugin-options`. Callbacks can't be written in JSON, so lists that need them are initialized from script.


## Public API

```js
const list = $('#pages').data('__pluginSortable');
```

| Method | Returns | Description |
|---|---|---|
| `toArray()` | `string[]` | The `idAttr` value of each item, in the current order. |
| `refresh()` | `this` | Marks items added since init. New items can't be dragged until this runs. |
| `disable()` | `this` | Presses on handles no longer start a drag and the keyboard is ignored. Adds `.ts-sort-disabled`, which fades the handles. |
| `enable()` | `this` | Undoes `disable()`. |
| `destroy()` | `this` | Ends a drag in progress, unbinds every handler, removes the classes the plugin added, leaves the group and drops the instance. Items stay in their current order. The `aria-label` given to handles stays. The stylesheet is removed with the last instance on the page. |

The jQuery method also takes a method name, with any arguments after it. Names starting with `_` are private and can't be called this way:

```js
$('#pages').themestrapPluginSortable('disable');
const order = $('#pages').themestrapPluginSortable('toArray').get();   // map() flattens the array
```

Without a method name it returns a jQuery collection of instances, so `.get(0)` on the result is the instance. Calling it again on an initialized list returns the existing instance and ignores the new options.


## Events

All events are native `CustomEvent`s that bubble. Listen with `addEventListener`.

| Event | Dispatched on | `detail` | Fired when |
|---|---|---|---|
| `ts.sortable.start` | the list the item came from | `{ instance, item }` | A drag starts. A plain click on a handle starts one too. |
| `ts.sortable.sort` | the list it came from, then the list it went to | `{ instance, item, order, from, to }` | The item ended up somewhere new. |
| `ts.sortable.end` | the list the item came from | `{ instance, item }` | Every drag ends, moved or not, and after `Escape`. |

- `item` is the moved element.
- `from` and `to` are the instances of the two lists. They are the same instance when the item stayed in its list.
- `order` is `to.toArray()`: the order of the list the item **landed in**. For the list it left, call `detail.from.toArray()`.
- `instance` is the instance that dispatched the event. When an item changes lists, `sort` fires on both lists, so it is `from` the first time and `to` the second.
- A keyboard move fires only `sort`, and adds `before`, the order before the move.

```js
document.getElementById('pages').addEventListener('ts.sortable.sort', function (e) {
    console.log(e.detail.item.dataset.id, 'moved, new order:', e.detail.order);
});
```

To save a board of connected lists once per drop, listen to `end` instead, which fires once, and read every list:

```js
document.addEventListener('ts.sortable.end', function () {
    const board = {};
    $('.board [data-plugin-sortable]').each(function () {
        board[this.id] = $(this).data('__pluginSortable').toArray();
    });
    $.post('/board/save', { board: JSON.stringify(board) });
});
```


## CSS Custom Properties

| Token | Default | Controls |
|---|---|---|
| `--ts-sort-ghost` | `--ts-skin-accent-soft`, else `rgba(0,168,159,.08)` | Background of the item while it is dragged |
| `--ts-sort-line` | `--ts-skin-accent`, else `#00a89f` | The dashed outline on the dragged item and on the list it is over |

With a skin loaded they follow its accent. Set them on the list or any ancestor to override:

```css
.board {
    --ts-sort-ghost: rgba(255,159,67,.14);
    --ts-sort-line:  #ff9f43;
}
```

The dragged item is also shown at 55% opacity, and `.ts-sort-disabled` shows handles at 50%. Neither is a token. Everything else about how the list looks is up to your own CSS. Style `.is-dragging` and `.is-over` to change the feedback:

```css
.ts-sort-item.is-dragging { box-shadow: 0 8px 24px rgba(0,0,0,.25); }
```

---

## Keyboard Navigation

| Key | Focus on | Action |
|---|---|---|
| `Tab` | | Moves between handles (buttons), or between items that have `tabindex="0"` |
| `Up` / `Down` | a handle, in a column | Moves the item up or down one place |
| `Left` / `Right` | a handle, in a row or grid | Moves the item one place back or forward in reading order, so right to left pages are mirrored |
| `Up` / `Down` | a handle, in a grid | Moves the item one row up or down |
| `Escape` | during a drag | Puts the item back where it started |

Without a `handle`, the keys work when the item itself has focus, not a link or button inside it. Focus stays on the handle (or item) after the move. The keyboard moves items within their list only. Moving an item to another list takes a mouse, a finger or a pen.

---

## ARIA Wiring

| Element | Attribute | Value |
|---|---|---|
| Each handle with no `aria-label` or `title` | `aria-label` | `labels.move` |

Items that are their own handle get no label, because it would replace the item's own text for screen readers. There is no live region announcing the new position. If your users need one, announce it yourself from the `sort` event:

```js
list.addEventListener('ts.sortable.sort', function (e) {
    const pos = e.detail.order.indexOf(e.detail.item.dataset.id) + 1;
    $('#sr-status').text('Moved to position ' + pos + ' of ' + e.detail.order.length);
});
```

```html
<p id="sr-status" class="visually-hidden" role="status" aria-live="polite"></p>
```

---

## Recipes

### A list with drag handles

```html
<ul data-plugin-sortable data-plugin-options='{"handle": ".grip"}'>
    <li data-id="1"><button class="grip" type="button">&#x2807;</button> Write the release notes</li>
    <li data-id="2"><button class="grip" type="button">&#x2807;</button> Tag the build</li>
</ul>
```

### A row of tabs

```html
<div class="d-flex gap-2" data-plugin-sortable>
    <span class="tab" data-id="inbox" tabindex="0">Inbox</span>
    <span class="tab" data-id="drafts" tabindex="0">Drafts</span>
    <span class="tab" data-id="sent" tabindex="0">Sent</span>
</div>
```

The row is detected from the item positions. `tabindex="0"` lets the arrow keys move a focused tab.

### A photo grid

```html
<div class="photo-grid" data-plugin-sortable>
    <figure data-id="p1" tabindex="0"><img src="1.jpg" alt="Harbour at dawn"></figure>
    <figure data-id="p2" tabindex="0"><img src="2.jpg" alt="Market stalls"></figure>
    ...
</div>
```

```css
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .5rem; }
.photo-grid img { width: 100%; display: block; -webkit-user-drag: none; }
```

`-webkit-user-drag: none` stops the browser's own image dragging from getting in the way in Safari and Chrome. Add `draggable="false"` to the images for Firefox.

### A board of connected columns

```html
<ul id="todo"  data-plugin-sortable data-plugin-options='{"handle": ".grip", "group": "board"}'>...</ul>
<ul id="doing" data-plugin-sortable data-plugin-options='{"handle": ".grip", "group": "board"}'>...</ul>
<ul id="done"  data-plugin-sortable data-plugin-options='{"handle": ".grip", "group": "board"}'></ul>
```

```css
.board .ts-sort-list { min-height: 120px; }   /* an empty column needs height to be dropped on */
```

### Save the order through a hidden field

```html
<form method="post">
    <ul id="slides" data-plugin-sortable>...</ul>
    <input type="hidden" name="order" id="slide-order">
    <button type="submit">Save</button>
</form>
```

```js
document.getElementById('slides').addEventListener('ts.sortable.sort', function (e) {
    document.getElementById('slide-order').value = e.detail.order.join(',');
});
```

### Read the order on the server

```php
$ids = array_values(array_filter(array_map('intval', explode(',', $_POST['order'] ?? ''))));
foreach ($ids as $position => $id) {
    $db->prepare('UPDATE pages SET menuindex = ? WHERE id = ?')->execute([$position, $id]);
}
```

### Undo a move the server refused

The DOM has already changed by the time `sort` fires. To put the item back, keep the old order and rebuild it:

```js
let saved = $('#pages').data('__pluginSortable').toArray();

document.getElementById('pages').addEventListener('ts.sortable.sort', function (e) {
    $.post('/admin/pages/order', { order: e.detail.order.join(',') })
        .done(function () { saved = e.detail.order; })
        .fail(function () {
            const $list = $('#pages');
            saved.forEach(function (id) { $list.append($list.children('[data-id="' + id + '"]')); });
        });
});
```

### Keep a fixed row in place

`items` decides what can move. A dropped item always lands next to another item, so a row that doesn't match and sits at the top of the list stays at the top:

```html
<ul data-plugin-sortable data-plugin-options='{"items": ".row-item"}'>
    <li class="list-header">Pinned</li>
    <li class="row-item" data-id="a">A</li>
    <li class="row-item" data-id="b">B</li>
</ul>
```

### Lock the list while saving

```js
const list = $('#pages').data('__pluginSortable');
list.disable();
$.post('/admin/pages/order', { order: list.toArray().join(',') }).always(function () { list.enable(); });
```

---

## Common Pitfalls

**`$('#list').on('ts.sortable.sort', ...)` never fires**
jQuery reads the dots as namespaces, so it listens for an event called `ts`. These are native `CustomEvent`s. Use `addEventListener`.

**Items added from script can't be dragged**
Only marked items can be dragged. Call `refresh()` after adding items.

**Nothing can be dropped on an empty list**
A list is only a target when the pointer is over it or within 12px of it. An empty list with no height is a line. Give the lists a `min-height`.

**On a phone, dragging a row scrolls the page instead**
Without a `handle`, the whole item is the handle and a touch only picks it up after a 300ms hold. A quick swipe scrolls on purpose. Hold the item first, or add a `handle`: handles respond to touch at once, and swiping on them never scrolls.

**A grid sorts as if it were a column**
With `axis: 'auto'`, the layout is read from where the first items sit. Items of very different heights in the first row can look like a column. Set `axis: 'grid'`.

**The arrow keys do nothing**
With a `handle`, the handle must be able to take focus: use a `<button>`. Without one, give the items `tabindex="0"` and focus the item itself, not a link inside it.

**`sort` fired twice**
When an item changes lists, `sort` fires on both lists. Check `e.detail.instance === e.detail.to` to react once, or listen to `end`.

**`order` is not the order of the list I'm listening on**
`detail.order` is always the list the item landed in. Use `detail.from.toArray()` for the list it left.

**`start` and `end` fired on a plain click**
A press on a handle starts a drag right away with a mouse or pen, even without movement, so a click fires `start` and `end` but not `sort`.

**An item can't be dragged after it moved to another list**
Each list looks for its own `handle` selector inside its items. Use the same `handle` on every list in a group.

**A hidden list is not a drop target**
Lists are measured during the drag, so a list in a closed tab or a collapsed panel can't receive items. It works as soon as it is shown, with nothing to call.

### Diagnostic checklist

1. Is jQuery loaded, then `themestrap.js`, then the plugin (or `themestrap.bundle.js`)?
2. Is `themestrap.init.js` loaded, or is the list initialized from script? `.manual` lists must be started by hand.
3. Are the items direct children of the element with `data-plugin-sortable`?
4. Does each item have the class `.ts-sort-item` after init? If not, `build()` never ran, or the items were added later (call `refresh()`).
5. Does the `handle` selector match an element inside every item?
6. Do connected lists use exactly the same `group` string?
7. Are you listening with `addEventListener` rather than jQuery `.on()`?
8. Is `data-plugin-options` valid JSON inside a single quoted attribute?
9. Was the list already initialized? A second call returns the existing instance and ignores new options. Call `destroy()` first.
