# Calendar Guide

Themestrap's accessible calendar widget — provides single, multiple, and range date selection with configurable month navigation, date constraints, disabled dates, week configuration, keyboard navigation, native events, callbacks, and a programmatic API.

---

## [How It **Works**](#how-it-works)

PluginCalendar builds and manages its own calendar interface directly from the supplied options. It stores the current view month and selection internally, renders the calendar grid, and exposes the instance through Themestrap's standard jQuery plugin interface.

The calendar supports three selection modes:

* **`single`** — Select one date.
* **`multiple`** — Toggle any number of dates.
* **`range`** — Select a starting date and ending date, with a hover preview while choosing the range.

The plugin also handles keyboard navigation using the calendar's focusable day buttons and dispatches native `CustomEvent` events when selections or the displayed month change.

The plugin's available defaults and public API are defined directly by `PluginCalendar`.

---

## [Quick **Start**](#quick-start)

Include Themestrap and the Calendar plugin:

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.calendar.js"></script>
```

Then add the markup:

```html
<div data-plugin-calendar></div>
```

The Calendar plugin can then be initialized through Themestrap's normal initialization system.

For a manually initialized calendar:

```html
<div id="my-calendar"></div>

<script>
$('#my-calendar').themestrapPluginCalendar();
</script>
```

Options can also be supplied through `data-plugin-options`:

```html
<div data-plugin-calendar
     data-plugin-options='{
       "mode": "range",
       "showFooter": true,
       "weekStartsOn": 1
     }'>
</div>
```

The plugin source documents both automatic `data-plugin-calendar` initialization and manual initialization.

---

## [Configuration **Options**](#options)

| Option            | Type             | Default    | Description                                                                                  |
| ----------------- | ---------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `mode`            | string           | `'single'` | Selection mode: `'single'`, `'multiple'`, or `'range'`.                                      |
| `selected`        | mixed            | `null`     | Initial selection. Its shape depends on `mode`.                                              |
| `initialMonth`    | string / Date    | `null`     | Month to display initially. Defaults to the current month.                                   |
| `showOutsideDays` | bool             | `true`     | Render days from the previous and next months in the calendar grid.                          |
| `weekStartsOn`    | number           | `0`        | First day of the week. `0` = Sunday, `1` = Monday.                                           |
| `minDate`         | string / Date    | `null`     | Earliest selectable date, inclusive.                                                         |
| `maxDate`         | string / Date    | `null`     | Latest selectable date, inclusive.                                                           |
| `disabled`        | array / function | `[]`       | Specific dates to disable, or a function returning `true` for dates that should be disabled. |
| `fixedWeeks`      | bool             | `false`    | Always render exactly six calendar rows.                                                     |
| `showFooter`      | bool             | `false`    | Display a `Today` button beneath the calendar.                                               |
| `onSelect`        | function         | `null`     | Callback fired after a selection is committed.                                               |

These are the plugin's actual default options.

---

## [Selection **Modes**](#selection-modes)

### Single

The default mode selects one date:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    mode: 'single',
    selected: '2026-08-26'
});
```

The selected value is a `Date` object internally.

### Multiple

Multiple mode maintains an array of selected dates:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    mode: 'multiple',
    selected: [
        '2026-08-04',
        '2026-08-12',
        '2026-08-26'
    ]
});
```

Clicking an unselected date adds it to the selection. Clicking an already selected date removes it.

### Range

Range mode uses an object containing `from` and `to`:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    mode: 'range',
    selected: {
        from: '2026-08-10',
        to: '2026-08-18'
    }
});
```

The first click establishes the starting date. The second click establishes the ending date. If the dates are selected in reverse order, the plugin automatically orders them so `from` precedes `to`. While choosing the second date, hovering over calendar days previews the potential range.

---

## [Initial **Selection**](#initial-selection)

The `selected` option follows the shape of the selected mode:

```javascript
// Single
selected: '2026-08-26'
```

```javascript
// Multiple
selected: [
    '2026-08-04',
    '2026-08-12'
]
```

```javascript
// Range
selected: {
    from: '2026-08-10',
    to: '2026-08-18'
}
```

The plugin also accepts `Date` objects for these values. The source normalizes incoming values according to the active selection mode.

---

## [Date **Constraints**](#date-constraints)

### Minimum and Maximum Dates

Use `minDate` and `maxDate` to establish an inclusive selectable range:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    minDate: '2026-08-05',
    maxDate: '2026-08-25'
});
```

Dates before `minDate` and dates after `maxDate` are disabled.

### Specific Disabled Dates

Pass an array of dates:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    disabled: [
        '2026-08-03',
        '2026-08-11',
        '2026-08-19'
    ]
});
```

### Dynamic Disabled Dates

`disabled` can instead be a function:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    disabled: function (date) {
        return date.getDay() === 0 || date.getDay() === 6;
    }
});
```

This example disables Saturdays and Sundays.

The plugin checks `minDate`, `maxDate`, a functional `disabled` predicate, and an array of disabled dates when determining whether a day can be selected.

---

## [Calendar **Layout**](#calendar-layout)

### Week Start

By default, weeks begin on Sunday:

```javascript
weekStartsOn: 0
```

Set it to `1` to begin weeks on Monday:

```javascript
weekStartsOn: 1
```

The day labels and grid calculation both follow this setting.

### Outside Days

Outside days are enabled by default:

```javascript
showOutsideDays: true
```

Set this to `false` to prevent days belonging to adjacent months from being displayed:

```javascript
showOutsideDays: false
```

### Fixed Weeks

Normally, the calendar renders only as many rows as the displayed month requires. Set:

```javascript
fixedWeeks: true
```

to always render six rows.

This is useful when the calendar needs a consistent height regardless of the month being displayed.

### Today Footer

Enable the footer with:

```javascript
showFooter: true
```

This adds a `Today` button that calls `goToToday()` when clicked.

---

## [Keyboard **Navigation**](#keyboard-navigation)

Calendar day buttons support keyboard navigation.

| Key          | Action                             |
| ------------ | ---------------------------------- |
| `ArrowLeft`  | Move one day backward              |
| `ArrowRight` | Move one day forward               |
| `ArrowUp`    | Move one week backward             |
| `ArrowDown`  | Move one week forward              |
| `PageUp`     | Move one month backward            |
| `PageDown`   | Move one month forward             |
| `Home`       | Move to the first day of the month |
| `End`        | Move to the last day of the month  |

When keyboard navigation crosses a month boundary, the calendar automatically changes the displayed month and moves focus to the corresponding date.

The calendar grid uses `role="grid"`, day cells use `role="gridcell"`, and the plugin maintains a roving `tabindex` so that only the current focus date is in the normal tab order.

---

## [Selection **Callback**](#selection-callback)

The `onSelect` option receives the current selection after a selection has been committed:

```javascript
$('#my-calendar').themestrapPluginCalendar({
    mode: 'single',

    onSelect: function (selected) {
        console.log(selected);
    }
});
```

For multiple mode, `selected` is an array.

For range mode, it is an object:

```javascript
{
    from: Date,
    to: Date
}
```

The callback is invoked by the plugin's selection handling after the corresponding selection event is dispatched.

---

## [Events](#events)

PluginCalendar emits native bubbling `CustomEvent` events from the calendar's wrapper element.

### `ts.calendar.select`

Fired when a selection is committed:

```javascript
const el = $('#my-calendar')[0];

el.addEventListener('ts.calendar.select', function (event) {
    console.log(event.detail.date);
    console.log(event.detail.selected);
});
```

The event detail contains:

```javascript
{
    date: Date,
    selected: ...
}
```

### `ts.calendar.monthChange`

Fired whenever the displayed month changes:

```javascript
el.addEventListener('ts.calendar.monthChange', function (event) {
    console.log(event.detail.month);
    console.log(event.detail.year);
});
```

`month` is zero-indexed, matching JavaScript's `Date` month numbering.

## The plugin dispatches both events as bubbling, cancelable `CustomEvent` instances.

## [Programmatic **API**](#programmatic-api)

Get the Calendar instance through the standard Themestrap data key:

```javascript
const cal = $('#my-calendar').data('__pluginCalendar');
```

### `getValue()`

Returns the current selection:

```javascript
const value = cal.getValue();
```

### `setValue(value)`

Programmatically changes the selection:

```javascript
cal.setValue('2026-08-15');
```

For multiple mode:

```javascript
cal.setValue([
    '2026-08-05',
    '2026-08-15',
    '2026-08-25'
]);
```

For range mode:

```javascript
cal.setValue({
    from: '2026-08-10',
    to: '2026-08-18'
});
```

`setValue()` normalizes the supplied value according to the calendar's current selection mode and rerenders the calendar.

### `goToMonth(year, month)`

Navigate directly to a month:

```javascript
cal.goToMonth(2026, 8);
```

The month argument is **zero-indexed**, so:

```text
0  = January
1  = February
...
7  = August
8  = September
```

### `goToToday()`

Return the calendar's view to the current month:

```javascript
cal.goToToday();
```

This changes the displayed month; it does not itself change the current selection.

### `destroy()`

Remove the Calendar instance:

```javascript
cal.destroy();
```

The plugin removes its event handlers, clears the wrapper, removes its stored instance data, and removes the shared Calendar stylesheet when the final Calendar instance is destroyed.

---

## [Complete **Example**](#complete-example)

```html
<div id="booking-calendar"></div>

<script>
$('#booking-calendar').themestrapPluginCalendar({
    mode: 'range',

    selected: {
        from: '2026-08-10',
        to: '2026-08-18'
    },

    initialMonth: '2026-08-01',

    weekStartsOn: 1,

    showOutsideDays: true,

    fixedWeeks: true,

    minDate: '2026-08-01',

    maxDate: '2026-12-31',

    disabled: function (date) {
        return date.getDay() === 0 || date.getDay() === 6;
    },

    showFooter: true,

    onSelect: function (selected) {
        console.log('Selected:', selected);
    }
});

const calendar = $('#booking-calendar').data('__pluginCalendar');

$('#booking-calendar')[0].addEventListener(
    'ts.calendar.monthChange',
    function (event) {
        console.log(
            'Month changed:',
            event.detail.month,
            event.detail.year
        );
    }
);
</script>
```

---

## [Themestrap **Initialization**](#themestrap-initialization)

PluginCalendar follows the Themestrap initialization pattern:

```html
<div data-plugin-calendar></div>
```

Themestrap's initialization wiring looks for `[data-plugin-calendar]` elements and initializes them through `themestrapPluginCalendar`. Elements marked with `.manual` are excluded from automatic initialization.

For manual initialization:

```html
<div id="my-calendar"></div>
```

```javascript
const cal = $('#my-calendar').themestrapPluginCalendar({
    mode: 'multiple',
    showFooter: true
});
```

---

## [API **Summary**](#api-summary)

| Method                   | Description                       |
| ------------------------ | --------------------------------- |
| `getValue()`             | Returns the current selection.    |
| `setValue(value)`        | Sets and renders a new selection. |
| `goToMonth(year, month)` | Navigates to a specific month.    |
| `goToToday()`            | Navigates to the current month.   |
| `destroy()`              | Tears down the Calendar instance. |

The public API is defined by the Calendar class and documented in the source's usage section.

---

## [Events **Summary**](#events-summary)

| Event                     | Detail             | Description                             |
| ------------------------- | ------------------ | --------------------------------------- |
| `ts.calendar.select`      | `date`, `selected` | Fired after a selection is committed.   |
| `ts.calendar.monthChange` | `month`, `year`    | Fired when the displayed month changes. |

Both are native bubbling `CustomEvent` events dispatched from the Calendar wrapper.
