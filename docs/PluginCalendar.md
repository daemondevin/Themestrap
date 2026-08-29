# PluginCalendar

A dependency-free date picker built for Themestrap. Supports single, multiple, and range selection; disabled date rules via arrays, bounds, or a predicate function; and full keyboard navigation using the ARIA grid pattern. Styles are injected once on first use and removed when the last instance is destroyed.

---

## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.calendar.js"></script>
```

No separate stylesheet is needed — the plugin injects `<style id="ts-calendar-styles">` on first use.

### Minimal usage

```html
<div id="my-calendar"></div>

<script>
$('#my-calendar').themestrapPluginCalendar();
</script>
```

### With options

```html
<div id="my-calendar"></div>

<script>
$('#my-calendar').themestrapPluginCalendar({
    mode:       'range',
    showFooter: true,
    onSelect:   function({ from, to }) {
        console.log(from, to);
    },
});
</script>
```

### Data attribute init

```html
<div data-plugin-calendar
     data-plugin-options='{"mode":"single","weekStartsOn":1}'></div>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// Calendar
if (typeof $.fn['themestrapPluginCalendar'] === 'function'
    && $('[data-plugin-calendar]').length) {
    themestrap.fn.intObsInit(
        '[data-plugin-calendar]:not(.manual)',
        'themestrapPluginCalendar'
    );
}
```

> Add `.manual` to any element to opt out of auto-init and initialize it manually via the jQuery bridge.

---

## Options

All options merge as: `PluginCalendar.defaults → JS opts argument → data-plugin-options JSON`. Later values win.

| Key | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `"single"` | Selection mode. `"single"` \| `"multiple"` \| `"range"`. |
| `selected` | varies | `null` | Pre-selected value. Shape must match `mode` — see [Selection Modes](#selection-modes). |
| `initialMonth` | Date \| string \| null | `null` | Month to open on. Defaults to the current month. Accepts a `Date` or `"YYYY-MM-DD"` string. |
| `showOutsideDays` | boolean | `true` | Render padding days from the previous and next month in the first and last rows. |
| `weekStartsOn` | number | `0` | Day of the week to display in the first column. `0` = Sunday, `1` = Monday. |
| `minDate` | Date \| string \| null | `null` | Lower bound (inclusive). Days before this date are disabled. |
| `maxDate` | Date \| string \| null | `null` | Upper bound (inclusive). Days after this date are disabled. |
| `disabled` | Array \| function \| `[]` | `[]` | Specific dates to disable. Accepts a `Date[]`, `"YYYY-MM-DD"[]`, or a predicate `(date: Date) => boolean`. Applied after `minDate`/`maxDate`. |
| `fixedWeeks` | boolean | `false` | Always render exactly 6 rows regardless of the month. Prevents layout shift when navigating. |
| `showFooter` | boolean | `false` | Render a "Today" button beneath the grid that navigates the view back to the current month. |
| `onSelect` | function \| null | `null` | Callback fired after a selection is committed. Receives the same value shape as `selected`. |

---

## Selection Modes

### Single

One date at a time. Clicking a selected day moves the selection rather than deselecting it.

```js
$('#my-calendar').themestrapPluginCalendar({
    mode:     'single',
    selected: new Date(),                  // or '2026-08-26'
    onSelect: function(date) {
        console.log(date.toDateString());
    },
});
```

`selected` accepts a `Date`, a `"YYYY-MM-DD"` string, or `null`. `onSelect` receives the committed `Date`.

### Multiple

Any number of days can be toggled on or off independently. Clicking a selected day deselects it.

```js
$('#my-calendar').themestrapPluginCalendar({
    mode:     'multiple',
    selected: [new Date(), '2026-09-01'],  // mixed Date/string OK
    onSelect: function(dates) {
        console.log(dates.length, 'dates selected');
    },
});
```

`selected` accepts a `Date[]`. `onSelect` receives a shallow copy of the current `Date[]`.

### Range

Two clicks define a span: the first click anchors the start; the second click commits the end. Hovering between clicks shows a live preview band. If the second click is before the first, the bounds are silently swapped.

```js
$('#my-calendar').themestrapPluginCalendar({
    mode:     'range',
    selected: { from: new Date(), to: '2026-09-10' },
    onSelect: function({ from, to }) {
        console.log('From', from, '→ to', to);
    },
});
```

`selected` accepts `{ from: Date|null, to: Date|null }`. `onSelect` receives the same shape with both properties as `Date` objects.

---

## Disabled Dates

Disabled rules are evaluated in order. A date is disabled if any rule matches.

### Bounds

```js
const today = new Date();
const max   = new Date(today);
max.setDate(today.getDate() + 30);

$('#my-calendar').themestrapPluginCalendar({
    minDate: today,   // anything before today is disabled
    maxDate: max,     // anything more than 30 days out is disabled
});
```

### Specific dates

```js
$('#my-calendar').themestrapPluginCalendar({
    disabled: [
        new Date(2026, 11, 25),  // Christmas
        '2026-12-26',            // Boxing Day
    ],
});
```

### Predicate function

The function receives a `Date` set to midnight local time and should return `true` to disable.

```js
$('#my-calendar').themestrapPluginCalendar({
    disabled: function(date) {
        const day = date.getDay();
        return day === 0 || day === 6;  // block weekends
    },
});
```

---

## Public API

### Accessing the instance

```js
// jQuery bridge — initializes if not yet done
$('#my-calendar').themestrapPluginCalendar({ mode: 'single' });

// Direct access after init
const inst = $('#my-calendar').data('__pluginCalendar');
```

### Methods

| Method | Returns | Description |
|---|---|---|
| `getValue()` | varies | Returns the current selection in the shape matching `mode`. See [Selection Modes](#selection-modes). Returns `null` (single), `[]` (multiple), or `{ from: null, to: null }` (range) when nothing is selected. |
| `setValue(val)` | `this` | Set the selection programmatically. Shape must match `mode`. Clears any in-progress range anchor. Re-renders immediately. |
| `goToMonth(year, month)` | `this` | Navigate the view to the given month. `month` is zero-indexed (0 = January). Does not change the selection. |
| `goToToday()` | `this` | Navigate the view to the current month. Does not change the selection. |
| `destroy()` | `this` | Full teardown — removes injected CSS (if this was the last instance), unbinds all events, clears the data key, and empties the wrapper element. |

### Examples

```js
const inst = $('#my-calendar').data('__pluginCalendar');

// Read the current value
const date = inst.getValue();   // → Date | null  (single mode)

// Set a date
inst.setValue(new Date());

// Set a range
inst.setValue({ from: new Date(), to: new Date(2026, 11, 31) });

// Navigate
inst.goToMonth(2026, 11);       // December 2026 (month is 0-indexed)
inst.goToToday();

// Clear selection (single)
inst.setValue(null);

// Clear selection (multiple)
inst.setValue([]);

// Teardown
inst.destroy();

// Re-initialize on the same element after destroy
$('#my-calendar').themestrapPluginCalendar({ mode: 'range' });
```

---

## Events

Events are dispatched as native `CustomEvent`s on the wrapper element. They bubble, so you can listen on a parent container. Both `addEventListener` and jQuery `.on()` work.

| Event | `detail` keys | When |
|---|---|---|
| `ts.calendar.select` | `{ date: Date, selected: varies }` | After a selection is committed. `date` is the last-clicked day; `selected` matches the shape for the active `mode`. Not fired during a range's first click (anchor phase). |
| `ts.calendar.monthChange` | `{ month: number, year: number }` | After the view navigates to a different month via the previous/next buttons or a keyboard PageUp/Down action. `month` is zero-indexed. |

```js
const el = document.getElementById('my-calendar');

el.addEventListener('ts.calendar.select', function(e) {
    console.log('selected:', e.detail.selected);
});

el.addEventListener('ts.calendar.monthChange', function(e) {
    console.log('month:', e.detail.month, 'year:', e.detail.year);
});

// jQuery also works
$('#my-calendar').on('ts.calendar.select', function(e) {
    console.log(e.detail.date);
});
```

---

## CSS Custom Properties

The injected stylesheet reads from CSS custom properties before falling back to hard-coded values. Set them on the wrapper element or any ancestor to theme the calendar without touching the plugin source.

| Token | Fallback | Controls |
|---|---|---|
| `--bg-raised` | `#252627` | Calendar background. |
| `--bg-hover` | `#2e2f30` | Day button hover background. |
| `--border-soft` | `rgba(255,255,255,0.12)` | Calendar border and nav button border. |
| `--border-mid` | `rgba(255,255,255,0.20)` | Nav button border on hover. |
| `--border-dim` | `rgba(255,255,255,0.06)` | Footer top border. |
| `--text-bright` | `#f0f0f0` | Month/year caption. |
| `--text-normal` | `#c0c0c0` | Day button default text. |
| `--text-muted` | `rgba(255,255,255,0.35)` | Nav arrows and day-of-week headers. |
| `--text-dim` | `rgba(255,255,255,0.18)` | Outside days and disabled day text. |
| `--accent-cyan` | `#5ecfdb` | Selected day background, today dot, range band, nav focus ring. |
| `--font-ui` | `system-ui, sans-serif` | All text in the calendar. |

### Example: light theme override

```css
#my-calendar {
    --bg-raised:   #ffffff;
    --bg-hover:    #f4f6f8;
    --border-soft: rgba(0,0,0,0.10);
    --border-mid:  rgba(0,0,0,0.18);
    --border-dim:  rgba(0,0,0,0.06);
    --text-bright: #0f172a;
    --text-normal: #374151;
    --text-muted:  rgba(0,0,0,0.40);
    --text-dim:    rgba(0,0,0,0.20);
    --accent-cyan: #0284c7;
}
```

---

## Keyboard Navigation

The calendar implements the WAI-ARIA grid pattern with a roving tabindex — only one day button holds `tabindex="0"` at a time. All other day buttons have `tabindex="-1"`.

| Key | Action |
|---|---|
| `ArrowLeft` | Move focus to the previous day. Wraps to the previous month if needed. |
| `ArrowRight` | Move focus to the next day. Wraps to the next month if needed. |
| `ArrowUp` | Move focus seven days back. Wraps to the previous month if needed. |
| `ArrowDown` | Move focus seven days forward. Wraps to the next month if needed. |
| `PageUp` | Move focus to the same day in the previous month. |
| `PageDown` | Move focus to the same day in the next month. |
| `Home` | Move focus to the first day of the current month. |
| `End` | Move focus to the last day of the current month. |
| `Enter` / `Space` | Activate the focused day (native `<button>` default). |
| `Tab` | Standard focus traversal — exits the grid. |

When keyboard navigation crosses a month boundary, the view re-renders automatically and focus is placed on the target day.

---

## ARIA Wiring

The plugin sets and manages the following ARIA attributes. Do not set them manually.

| Element | Attribute | Value |
|---|---|---|
| `table.ts-cal-table` | `role` | `"grid"` |
| `table.ts-cal-table` | `aria-label` | `"Month Year"` — updated on every render. |
| `td.ts-cal-cell` | `role` | `"gridcell"` |
| `th.ts-cal-head-cell` | `scope` | `"col"` |
| `button.ts-cal-day` | `aria-label` | Full date string e.g. `"Wednesday, August 26, 2026"`. |
| `button.ts-cal-day` (selected) | `aria-selected` | `"true"` |
| `button.ts-cal-day` (disabled) | `aria-disabled` | `"true"` |
| `button.ts-cal-day` (disabled) | `disabled` | Present (HTML attribute). |
| `button.ts-cal-day` (focus target) | `tabindex` | `"0"` — one per render; all others `"-1"`. |
| `.ts-cal-caption` | `aria-live` | `"polite"` — announces month changes to screen readers. |
| `button.ts-cal-prev` | `aria-label` | `"Previous month"` |
| `button.ts-cal-next` | `aria-label` | `"Next month"` |

---

## Recipes

### Range picker with today pre-selected as start

```js
const today = new Date();
$('#my-calendar').themestrapPluginCalendar({
    mode:     'range',
    selected: { from: today, to: null },
});
```

### Weekday-only picker (no weekends)

```js
$('#my-calendar').themestrapPluginCalendar({
    mode:     'single',
    disabled: (date) => date.getDay() === 0 || date.getDay() === 6,
});
```

### Booking window — next 14 days, excludes today

```js
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const max = new Date(tomorrow);
max.setDate(max.getDate() + 13);

$('#my-calendar').themestrapPluginCalendar({
    mode:        'single',
    minDate:     tomorrow,
    maxDate:     max,
    fixedWeeks:  true,
    showFooter:  false,
});
```

### Multiple selection with a cap

```js
$('#my-calendar').themestrapPluginCalendar({
    mode: 'multiple',
    onSelect: function(dates) {
        if (dates.length > 5) {
            /* Remove the oldest pick to enforce a 5-date cap */
            dates.shift();
            $(this).data('__pluginCalendar').setValue(dates);
        }
    },
});
```

### Open on a specific month regardless of today

```js
$('#my-calendar').themestrapPluginCalendar({
    initialMonth: '2027-01-01',
});
```

### European layout — Monday first, always 6 rows

```js
$('#my-calendar').themestrapPluginCalendar({
    weekStartsOn: 1,
    fixedWeeks:   true,
});
```

### Programmatic navigation in response to external UI

```js
$('#my-calendar').themestrapPluginCalendar({ mode: 'single' });

$('#btn-prev-month').on('click', function() {
    const inst = $('#my-calendar').data('__pluginCalendar');
    const vd   = inst._viewDate;
    inst.goToMonth(vd.getFullYear(), vd.getMonth() - 1);
});
```

> `_viewDate` is an internal `Date` set to the first of the displayed month. It is safe to read but should not be mutated directly; use `goToMonth()` instead.

### React to selection with a native event listener (no jQuery on the consumer side)

```js
document.getElementById('my-calendar').addEventListener('ts.calendar.select', function(e) {
    const { from, to } = e.detail.selected;  // range mode
    document.getElementById('summary').textContent =
        from.toDateString() + ' → ' + (to ? to.toDateString() : '…');
});
```

### Teardown and reinitialize in a different mode

```js
const $el = $('#my-calendar');
$el.data('__pluginCalendar').destroy();
$el.themestrapPluginCalendar({ mode: 'multiple', weekStartsOn: 1 });
```

---

## Common Pitfalls

**Calendar renders but no day is ever highlighted as today**  
The today check compares the calendar cell date to `new Date()` at render time using year, month, and date components only. If the system clock is incorrect or the page has been open across midnight without re-rendering, the today indicator will be on the wrong day. Navigate away and back to force a re-render.

**`onSelect` never fires during a range's first click**  
This is intentional. The first click in range mode anchors the start but does not yet commit a selection. `onSelect` and `ts.calendar.select` only fire when both `from` and `to` are set (the second click). To detect the anchor phase, inspect `inst._rangeAnchor` directly or listen on the wrapper's click event.

**Outside days cannot be clicked even though `showOutsideDays: true`**  
Outside days render visually but behave as disabled when `showOutsideDays` is `false`. Double-check that `showOutsideDays` is actually truthy — the default is `true`, but passing `data-plugin-options='{"showOutsideDays":false}'` in markup overrides it. Clicking an outside day navigates the selection but not the view; the view stays on the current month.

**`data-plugin-options` JSON parse failure**  
`themestrap.fn.getOptions()` normalizes single-quoted JSON, but the value must still be valid JSON structure. A common mistake is using unquoted property names (`{mode:'single'}` is invalid; `{"mode":"single"}` is correct). Check the browser console for parse errors.

**`minDate`/`maxDate` string values not being parsed**  
Both options accept ISO `"YYYY-MM-DD"` strings, but only in that exact format. Strings like `"Aug 26 2026"` or locale-formatted dates will parse to `null` and be silently ignored. Always use `"YYYY-MM-DD"` or pass a `Date` object.

**CSS variables not applying**  
CSS custom properties only cascade down; they cannot target elements from a sibling or cousin scope. Set them on the calendar wrapper element (`#my-calendar { --accent-cyan: … }`) or on a direct ancestor. Setting them on `body` works globally.

**Injected `<style>` removed prematurely**  
The `STYLE_ID` stylesheet is removed when `PluginCalendar.instances` reaches zero. If you call `destroy()` on all calendars and then render a new one, the stylesheet is re-injected. This is automatic — but if you are testing with multiple calendar instances, destroying them all at once and immediately inspecting the rendered output may show unstyled output for a frame. Use `requestAnimationFrame` or a slight defer if this matters.

**Diagnostic checklist**

- Does `$('#my-calendar').data('__pluginCalendar')` return an instance object?
- Is `document.getElementById('ts-calendar-styles')` present in the `<head>`?
- Are jQuery and `themestrap.js` loaded before `themestrap.plugin.calendar.js`?
- For `data-plugin-options`: is the JSON valid and double-quoted?
- For range mode: is `onSelect` being called only after the second click (not the first)?
- For disabled dates as an array: are the date values in `Date` or `"YYYY-MM-DD"` format — not locale strings?
