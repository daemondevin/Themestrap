# PluginSort

Filter buttons and a grid that rearranges itself. Clicking a filter shows the matching items and packs them into a masonry layout, with optional live text search, URL hash sync, a loading state and RTL support. The layout engine is built in; Isotope is no longer needed.

**File:** `js/components/themestrap.plugin.sort.js`  
**Demo:** `demos/plugin.demo.sort.html`  
**jQuery method:** `$.fn.themestrapPluginSort`  
**Data attribute:** `data-plugin-sort`, or the `.sort-source` class  
**Instance key:** `__sort`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

> Earlier versions wrapped Isotope. The filtering and masonry layout are now native, so Isotope and imagesLoaded are no longer needed, and `themestrap.modules.js` no longer loads them for it. The markup is unchanged.



## How It Works

PluginSort is initialized on the **filter list** (the source). On `build()` it:

1. Injects a small stylesheet once (`<style id="themestrap-sort-styles">`).
2. Finds the grid (the destination): the `.sort-destination` element with the same `data-sort-id` as the source. Without one it stops.
3. Equalizes the heights of `span.thumb-info-caption p` paragraphs in the grid, so Porto thumb-info cards line up.
4. Shows a bounce loader if the grid sits inside `.sort-destination-loader`.
5. Binds the search field, if `filterFieldId` names one.
6. Waits until every `<img>` in the grid has loaded (or failed), then lays the grid out, binds the filter links and hash handling, and hides the loader. The loader is removed after 3 seconds regardless.

### Filtering

A filter value is a CSS selector, such as `.web`, or `*` for everything. `setFilter()` builds one selector from:

- the filter itself (nothing for `*`),
- `[data-page-rel={n}]` when the grid has `data-current-page`.

When there is search text, an item must also contain it in its `data-sort-search` attribute. That check is a plain substring match in JavaScript, ignoring case on both sides, so any text is safe to type, spaces and quotes included.

Each item that matches gets `visibleStyle` and is shown; the rest get `hiddenStyle` and are hidden with `display: none`. The grid is then laid out again.

### Layout

In `masonry` mode the plugin measures the first visible item's outer width, works out how many columns fit, and places every visible item absolutely in the shortest column, setting the grid's height to the tallest column. Items animate `top` and `left` over 0.4 s, delayed by `stagger` ms per item. The layout runs again 300 ms after the window stops resizing.

In `fitRows` mode the plugin clears any absolute positioning and leaves the layout to your CSS.



## Quick Start

### 1. Include the files

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.sort.js"></script>
<script src="js/themestrap.init.js"></script>
```

### 2. Mark it up

```html
<!-- filters (the source) -->
<ul class="nav nav-pills sort-source" data-plugin-sort data-sort-id="portfolio"
    data-plugin-options='{"useHash": false}'>
    <li class="nav-item active" data-option-value="*"><a class="nav-link" href="#">All</a></li>
    <li class="nav-item" data-option-value=".web"><a class="nav-link" href="#">Web</a></li>
    <li class="nav-item" data-option-value=".print"><a class="nav-link" href="#">Print</a></li>
</ul>

<!-- the grid (the destination) -->
<div class="row sort-destination" data-sort-id="portfolio">
    <div class="col-sm-6 col-lg-4 isotope-item web"><img src="p1.jpg" alt="Landing page" class="img-fluid"></div>
    <div class="col-sm-6 col-lg-4 isotope-item print"><img src="p2.jpg" alt="Poster" class="img-fluid"></div>
    <div class="col-sm-6 col-lg-4 isotope-item web print"><img src="p3.jpg" alt="Brand kit" class="img-fluid"></div>
</div>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-sort]:not(.manual), .sort-source:not(.manual)', 'themestrapPluginSort');
```

### Manual init

```js
$('#filters').themestrapPluginSort({ useHash: false, layoutMode: 'fitRows' });
```



## Markup Reference

### Source

| Attribute or element | Role |
| - | - |
| `data-plugin-sort` or `.sort-source` | Marks the filter list. |
| `data-sort-id` | Pairs it with the grid. **Required.** |
| `li[data-option-value]` | A filter. The value is a CSS selector, or `*` for all. |
| `li > a` | The clickable part. Only `<a>` elements inside the source are bound. |
| `.active` | Set by the plugin on the current `li` and its `a`. |

### Destination

| Attribute or element | Role |
| - | - |
| `.sort-destination` | Marks the grid. **Required class.** |
| `data-sort-id` | Same value as the source. |
| `.isotope-item` | One item (change with `itemSelector`). Its classes are what filters match. |
| `data-sort-search` | Text to search in, on each item. Matching ignores case. |
| `data-page-rel` | Page number of an item, used with `data-current-page`. |
| `data-current-page` | On the grid: limits the visible items to that page. |

### Search

```html
<input type="search" id="portfolio-search" class="form-control" placeholder="Search projects">

<ul class="sort-source" data-plugin-sort data-sort-id="portfolio"
    data-plugin-options='{"filterFieldId": "portfolio-search"}'> ... </ul>

<div class="sort-destination" data-sort-id="portfolio">
    <div class="isotope-item web" data-sort-search="landing page acme"> ... </div>
</div>
```

### Loader

```html
<div class="sort-destination-loader sort-destination-loader-showing">
    <div class="row sort-destination" data-sort-id="portfolio"> ... </div>
</div>
```

The plugin appends a `.bounce-loader`, removes `sort-destination-loader-showing` once the grid is laid out, and adds `sort-destination-loader-loaded` 300 ms later. The loader styles are in `themestrap-elements.css`.



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `useHash` | `boolean` | `true` | Write the active filter to the URL hash (`#web` for `.web`) and apply the hash on load and on `hashchange`. |
| `itemSelector` | `string` | `'.isotope-item'` | Selects the grid items. |
| `layoutMode` | `string` | `'masonry'` | `masonry` (absolute columns) or `fitRows` (your CSS does the layout). |
| `filter` | `string` | `'*'` | The current filter. Updated by `setFilter()`. |
| `filterFieldId` | `string\|false` | `false` | Id (without `#`) of a text field for live search. |
| `filterFieldText` | `string` | `''` | The current search text. Updated as the reader types. |
| `hiddenStyle` | `object` | `{ opacity: 0 }` | CSS applied to items being hidden. |
| `visibleStyle` | `object` | `{ opacity: 1 }` | CSS applied to items being shown. |
| `stagger` | `number` | `30` | Extra `transition-delay` in ms per item, so items move one after another. `0` moves them together. |
| `isOriginLeft` | `boolean` | `true`, or `false` when `<html dir="rtl">` | Fill columns from the left. `false` fills from the right. |



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only.

```js
const sort = $('#filters').data('__sort');
```

| Method | Returns | Description |
| - | - | - |
| `setFilter(filter)` | `this` | Applies a filter (`'.web'`, `'*'`), marks the matching `li` active, lays out again and updates the hash when `useHash` is on. |
| `destroy()` | `this` | Unbinds the filter links, the search field and the window handlers, clears item positions and the grid height, and removes the instance. |

To lay out again after changing the grid's content, trigger the resize the plugin listens for:

```js
$(window).trigger('sort.resize');
```



## Events

All are jQuery events fired with `.trigger()`.

| Event | Fired on | When |
| - | - | - |
| `layoutComplete` | Destination | After the first layout |
| `filtered` | Destination | After the first layout, and after every `setFilter()` |
| `filtered` | Source | After the first layout, and after each click on a filter |

The plugin also triggers `scroll` on `window` after each filter, so sticky elements (PluginSticky, sticky headers) recalculate.

```js
$('.sort-destination[data-sort-id="portfolio"]').on('filtered', function () {
    const count = $(this).find('.isotope-item:visible').length;
    $('#result-count').text(count + ' projects');
});
```



## CSS Custom Properties

None. The injected styles are:

```css
.ts-sort-grid { position: relative; }
.ts-sort-grid .isotope-item { transition: opacity 0.3s ease, top 0.4s ease, left 0.4s ease; }
.ts-sort-grid.fitRows { display: flex; flex-wrap: wrap; }
```

`.ts-sort-grid` is added to the destination. The `.fitRows` rule only applies if you add that class yourself (see Pitfalls).

```css
/* slower, springier moves */
.ts-sort-grid .isotope-item { transition: opacity .3s ease, top .6s cubic-bezier(.2,.8,.2,1.2), left .6s cubic-bezier(.2,.8,.2,1.2); }
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
    .ts-sort-grid .isotope-item { transition: none; }
}
```



## Keyboard Navigation

Filters are links, so they are reached with Tab and activated with Enter. The plugin does not move focus. Hidden items are `display: none`, so they leave the tab order.



## ARIA Wiring

The plugin adds no ARIA. Mark the current filter and announce result changes:

```js
$('.sort-source[data-sort-id="portfolio"]').on('filtered', function () {
    $(this).find('a').attr('aria-current', null);
    $(this).find('li.active > a').attr('aria-current', 'true');
});
```

```html
<p id="result-count" class="visually-hidden" aria-live="polite"></p>
```



## Recipes

### Filter from a dropdown

```js
$('#category').on('change', function () {
    $('#filters').data('__sort').setFilter(this.value || '*');
});
```

### Combine two filters

A filter is a selector, so `.web.featured` shows items that have both classes, and `.web, .print` shows either.

```html
<li data-option-value=".web.featured"><a href="#">Featured web</a></li>
```

### Paginate

```html
<div class="row sort-destination" data-sort-id="portfolio" data-current-page="1">
    <div class="col-md-4 isotope-item web" data-page-rel="1"> ... </div>
    <div class="col-md-4 isotope-item web" data-page-rel="2"> ... </div>
</div>
```

```js
function goToPage(n) {
    const sort = $('#filters').data('__sort');
    $('.sort-destination[data-sort-id="portfolio"]').attr('data-current-page', n);
    sort.setFilter(sort.options.filter);
}
```



## Common Pitfalls

### Nothing happens

The grid needs the `.sort-destination` class and the same `data-sort-id` as the filters, and the plugin goes on the filters, not on the grid. Filters must be `<a>` elements inside `li[data-option-value]`.

### Search matches nothing

Search only looks at `data-sort-search`, not at the item's visible text. Give every item the words people will type, such as its title and tags.

### Items overlap or leave gaps

Masonry assumes every item has the same width as the first visible one. Mixed widths (a `col-8` among `col-4`s) are laid out on the narrow grid and overlap. Keep item widths equal, or use `fitRows`.

### `fitRows` does not wrap

The plugin does not add the `fitRows` class its stylesheet expects. Use a Bootstrap `.row` as the grid, or add `class="fitRows"` to the destination yourself.

### The URL hash jumps the page or fights other links

With `useHash: true` the filter is written to `location.hash`, and any hash on load is treated as a filter (unless an element with that id exists). Set `useHash: false` on pages that use hash links.

### Two grids interfere after `destroy()`

`destroy()` removes every `.sort` handler on `window`, including those of other grids on the page. After destroying one, the others stop re-laying out on resize and stop following the hash. Re-initialize them (destroy, then init) after destroying any grid.

### Diagnostic checklist

- [ ] The plugin is on the filter list; the grid has `.sort-destination` and the same `data-sort-id`.
- [ ] Filters are `li[data-option-value] > a`.
- [ ] Items match `itemSelector` (`.isotope-item` by default) and share one width.
- [ ] Items to be searched have a `data-sort-search` attribute.
- [ ] `useHash` is off on pages with hash links.
- [ ] Isotope is no longer loaded for this plugin.
