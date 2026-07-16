# Sort Guide

Themestrap's Isotope filter/sort grid — filter buttons drive a destination grid, with URL hash sync, live text search, and automatic Sticky recalculation on layout.

## [How It **Works**](#how-it-works)

PluginSort wires filter control elements to an Isotope grid via a shared `data-sort-id`. Clicking a filter button (`data-option-value="*"` for all, `".category"` for filtered) runs `isotope('filter', value)` on the destination grid. URL hash is synced when `useHash: true`.

---

## [Quick **Start**](#quick-start)

```html
<!-- Filter controls -->
<ul data-plugin-sort data-sort-id="portfolio">
  <li class="active" data-option-value="*"><a href="#">All</a></li>
  <li data-option-value=".web"><a href="#">Web</a></li>
  <li data-option-value=".print"><a href="#">Print</a></li>
</ul>

<!-- Grid -->
<div class="sort-destination" data-sort-id="portfolio">
  <div class="isotope-item web"><img src="p1.jpg" alt=""></div>
  <div class="isotope-item print"><img src="p2.jpg" alt=""></div>
</div>
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useHash` | bool | `true` | Sync the active filter with the URL hash. |
| `itemSelector` | string | `'.isotope-item'` | Isotope item selector. |
| `layoutMode` | string | `'masonry'` | Isotope layout mode. |
| `filter` | string | `'*'` | Initial active filter value. |
| `filterFieldId` | string | `false` | ID of a text field for live search filtering. |
| `stagger` | number | `30` | Item stagger animation delay in ms. |

### Live search

```html
<input type="text" id="portfolio-search" placeholder="Search…">

<ul data-plugin-sort data-sort-id="portfolio"
    data-plugin-options='{"filterFieldId": "portfolio-search"}'>
  ...
</ul>
```
