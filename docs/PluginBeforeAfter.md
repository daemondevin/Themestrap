# BeforeAfter Guide

Themestrap's image comparison slider — a lightweight, self-contained before/after comparison plugin with horizontal and vertical orientations, mouse/touch dragging, keyboard controls, hover and click interaction modes, configurable labels, and automatic image sizing.

Unlike the original BeforeAfter guide, this implementation **does not depend on TwentyTwenty or any other comparison-slider library**. The plugin builds and controls the comparison interface itself.

---

## [How It **Works**](#how-it-works)

PluginBeforeAfter takes the first two `<img>` elements inside the target element and converts them into a layered comparison view.

The first image becomes the **Before** layer and the second becomes the **After** layer. The After layer is clipped using CSS `clip-path`, while a divider and draggable handle indicate the current comparison position. 

The slider position is represented internally as a value between `0` and `1`:

```text
0.0 ─────────────────────────── 1.0
│              │                 │
0%            50%              100%
```

The default position is `0.5`, placing the divider in the center.

The plugin automatically determines the container's aspect ratio from the first image's natural dimensions and uses that ratio to maintain the comparison area's proportions. 

---

## [Quick **Start**](#quick-start)

There are **no external BeforeAfter-specific vendor dependencies**.

Include jQuery and Themestrap:

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.beforeafter.js"></script>
```

Then provide two images:

```html
<div class="before-after"
     data-plugin-before-after>

    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">

</div>
```

The plugin expects at least two images. The first image is treated as Before and the second as After. If fewer than two images are present, the plugin does not build the comparison interface. 

---

## [Configuration **Options**](#options)

| Option                  | Type   | Default        | Description                                             |
| ----------------------- | ------ | -------------- | ------------------------------------------------------- |
| `forceInit`             | bool   | `true`         | Configuration option retained by the plugin defaults.   |
| `default_offset_pct`    | number | `0.5`          | Initial slider position from `0` to `1`.                |
| `orientation`           | string | `'horizontal'` | Comparison orientation: `'horizontal'` or `'vertical'`. |
| `before_label`          | string | `'Before'`     | Text displayed over the Before image.                   |
| `after_label`           | string | `'After'`      | Text displayed over the After image.                    |
| `no_overlay`            | bool   | `false`        | Disable both image labels.                              |
| `move_slider_on_hover`  | bool   | `false`        | Move the slider continuously with the mouse.            |
| `move_with_handle_only` | bool   | `true`         | Require the handle to be used when dragging.            |
| `click_to_move`         | bool   | `false`        | Move the slider directly to the clicked position.       |

These are the actual defaults defined by `PluginBeforeAfter`. 

> **Note:** `forceInit` currently exists in the configuration defaults but is not referenced by the plugin's initialization logic. The current implementation initializes the comparison when the first image is already loaded, or after that image fires its `load` event. 

---

## [Slider **Position**](#slider-position)

### `default_offset_pct`

Controls the initial position of the divider.

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.5
});
```

The value is clamped to the range `0`–`1`.

```javascript
default_offset_pct: 0
```

places the divider at the beginning.

```javascript
default_offset_pct: 0.5
```

places it in the center.

```javascript
default_offset_pct: 1
```

places it at the end.

The plugin converts this value into a percentage and applies it to the divider, handle, and After-layer clipping. 

---

## [Horizontal **Orientation**](#horizontal-orientation)

Horizontal orientation is the default:

```javascript
orientation: 'horizontal'
```

The comparison handle moves from left to right.

```html
<div data-plugin-before-after
     data-plugin-options='{
         "orientation": "horizontal",
         "default_offset_pct": 0.5
     }'>
    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">
</div>
```

The After layer is clipped from the left, exposing the Before image on the left side and the After image on the right. 

---

## [Vertical **Orientation**](#vertical-orientation)

Set:

```javascript
orientation: 'vertical'
```

to create a top/bottom comparison.

```html
<div data-plugin-before-after
     data-plugin-options='{
         "orientation": "vertical",
         "default_offset_pct": 0.5
     }'>
    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">
</div>
```

The divider becomes horizontal and the handle moves vertically.

In vertical mode, the After layer is clipped from the top, leaving Before above the divider and After below it. 

---

## [Image **Requirements**](#image-requirements)

PluginBeforeAfter uses the first two images found inside the wrapper:

```html
<div data-plugin-before-after>
    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">
</div>
```

The plugin clones those images before constructing its internal layers. 

The images are positioned at:

```css
width: 100%;
height: 100%;
object-fit: cover;
```

This means both images fill the comparison area and are cropped as necessary to maintain the container's dimensions. 

### Image Loading

If the first image has already loaded, initialization occurs immediately.

If it has not loaded yet, the plugin waits for its `load` event before constructing the comparison. 

The first image's natural dimensions are used to establish the wrapper's aspect ratio:

```text
padding-bottom = naturalHeight / naturalWidth × 100%
```

This allows the comparison area to maintain the source image's proportions without requiring a fixed height. 

---

## [Labels and **Overlay**](#labels-and-overlay)

By default, the plugin displays:

```text
Before                         After
```

The labels can be customized:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    before_label: 'Original',
    after_label: 'Edited'
});
```

The resulting labels are placed over their respective sides of the comparison. 

### Disable Labels

Set:

```javascript
no_overlay: true
```

Example:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    no_overlay: true
});
```

No label elements are created when `no_overlay` is enabled. 

---

## [Dragging](#dragging)

By default:

```javascript
move_with_handle_only: true
```

This means the user must grab the circular handle to move the slider.

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_with_handle_only: true
});
```

Touch and mouse input are both supported.

The plugin listens for:

* `mousedown`
* `touchstart`
* `mousemove`
* `touchmove`
* `mouseup`
* `touchend`

The document-level move/end handlers are namespaced per instance. 

---

## [Dragging the **Entire Slider Area**](#dragging-the-entire-slider-area)

Set:

```javascript
move_with_handle_only: false
```

to allow the comparison wrapper itself to initiate dragging.

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_with_handle_only: false
});
```

With this setting, clicking/touching the comparison area begins dragging from that location. 

---

## [Move on **Hover**](#move-on-hover)

Enable:

```javascript
move_slider_on_hover: true
```

to make the divider follow the mouse pointer:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_slider_on_hover: true
});
```

The slider updates continuously as the pointer moves across the wrapper.

Dragging still takes precedence; hover movement is ignored while an active drag is occurring. 

This option is particularly useful for desktop image comparisons where continuous dragging is not desired.

---

## [Click to **Move**](#click-to-move)

Enable:

```javascript
click_to_move: true
```

to allow the user to click anywhere within the comparison:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    click_to_move: true
});
```

The slider immediately jumps to the clicked position. 

This can be combined with the other interaction modes:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_slider_on_hover: true,
    click_to_move: true,
    move_with_handle_only: false
});
```

---

## [Keyboard **Controls**](#keyboard-controls)

The comparison handle is keyboard accessible.

The handle is created with:

```html
tabindex="0"
role="slider"
```

and exposes:

```html
aria-valuemin="0"
aria-valuemax="100"
aria-valuenow="50"
```

The `aria-valuenow` value is updated whenever the slider moves.  

### Keyboard Commands

| Key             | Movement     |
| --------------- | ------------ |
| `ArrowLeft`     | Move left    |
| `ArrowRight`    | Move right   |
| `ArrowUp`       | Move up      |
| `ArrowDown`     | Move down    |
| `Shift + Arrow` | Move by 10%  |
| `Home`          | Move to 0%   |
| `End`           | Move to 100% |

Normal arrow-key movement changes the position by **5%**.

Holding `Shift` changes the step to **10%**. 

For horizontal comparisons, left/right arrows are the natural controls. For vertical comparisons, up/down arrows provide the corresponding movement.

---

## [Touch **Support**](#touch-support)

The plugin supports touch interaction without requiring a separate touch library.

The handle uses:

```css
touch-action: none;
```

and the plugin handles `touchstart`, `touchmove`, and `touchend` events.  

This allows the same comparison interface to work with touchscreen devices as well as conventional mouse input.

---

## [Themestrap **Data Attributes**](#themestrap-data-attributes)

Options can be supplied through Themestrap's `data-plugin-options` mechanism:

```html
<div data-plugin-before-after
     data-plugin-options='{
         "default_offset_pct": 0.35,
         "orientation": "vertical",
         "before_label": "Original",
         "after_label": "Result"
     }'>

    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">

</div>
```

The plugin reads options from `data-plugin-options` and merges them with the plugin defaults and any options supplied directly to the JavaScript initializer. 

The effective precedence is:

```text
Plugin defaults
      ↓
data-plugin-options
      ↓
JavaScript options
```

JavaScript options therefore override equivalent values supplied through the data attribute.

---

## [JavaScript **Initialization**](#javascript-initialization)

PluginBeforeAfter can also be initialized directly:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.35
});
```

The plugin stores the instance on the element using the internal data key:

```javascript
__beforeafter
```

and subsequent initialization of the same element returns the existing instance rather than creating another one.  

The Themestrap plugin constructor is also exposed as:

```javascript
themestrap.PluginBeforeAfter
```

and the jQuery plugin method is:

```javascript
$.fn.themestrapPluginBeforeAfter
```



---

## [Programmatic **Access**](#programmatic-access)

Retrieve an existing instance:

```javascript
const comparison =
    $('#comparison').data('__beforeafter');
```

The instance exposes its current position through:

```javascript
comparison.pct
```

For example:

```javascript
console.log(comparison.pct);
```

A value of:

```text
0.5
```

means the slider is positioned at 50%.

The internal position setter is `_setPosition()`, but it is an internal implementation method rather than a documented public API method. 

---

## [Destroying an **Instance**](#destroying-an-instance)

Call:

```javascript
comparison.destroy();
```

to remove the active comparison.

`destroy()`:

* Removes document-level event handlers.
* Removes the plugin's wrapper classes.
* Clears the generated inline sizing styles.
* Restores the original HTML.
* Removes the wrapper's event handlers.
* Removes the stored plugin instance.

The original markup is preserved when the plugin is initialized specifically so it can be restored during destruction.  

---

## [Complete **Example**](#complete-example)

```html
<div id="comparison"
     data-plugin-before-after
     data-plugin-options='{
         "default_offset_pct": 0.4,
         "orientation": "horizontal",
         "before_label": "Original",
         "after_label": "Modified",
         "move_slider_on_hover": false,
         "move_with_handle_only": true,
         "click_to_move": true
     }'>

    <img src="before.jpg" alt="Before">
    <img src="after.jpg" alt="After">

</div>
```

Or initialize it entirely from JavaScript:

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.4,
    orientation: 'horizontal',
    before_label: 'Original',
    after_label: 'Modified',
    no_overlay: false,
    move_slider_on_hover: false,
    move_with_handle_only: true,
    click_to_move: true
});
```

---

## [Configuration **Examples**](#configuration-examples)

### Standard Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.5
});
```

### Comparison Starting at 25%

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.25
});
```

### Vertical Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    orientation: 'vertical'
});
```

### Custom Labels

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    before_label: 'Original',
    after_label: 'Retouched'
});
```

### No Labels

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    no_overlay: true
});
```

### Hover Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_slider_on_hover: true
});
```

### Clickable Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    click_to_move: true
});
```

### Free-Dragging Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    move_with_handle_only: false
});
```

### Fully Interactive Comparison

```javascript
$('#comparison').themestrapPluginBeforeAfter({
    default_offset_pct: 0.5,
    orientation: 'horizontal',
    before_label: 'Before',
    after_label: 'After',
    move_slider_on_hover: true,
    move_with_handle_only: false,
    click_to_move: true
});
```

---

## [Options **Summary**](#options-summary)

| Option                  | Default        | Purpose                                                                 |
| ----------------------- | -------------- | ----------------------------------------------------------------------- |
| `forceInit`             | `true`         | Present in the defaults, but currently has no effect on initialization. |
| `default_offset_pct`    | `0.5`          | Initial comparison position.                                            |
| `orientation`           | `'horizontal'` | Horizontal or vertical comparison.                                      |
| `before_label`          | `'Before'`     | Before-image label.                                                     |
| `after_label`           | `'After'`      | After-image label.                                                      |
| `no_overlay`            | `false`        | Removes the labels.                                                     |
| `move_slider_on_hover`  | `false`        | Makes the slider follow the pointer.                                    |
| `move_with_handle_only` | `true`         | Restricts drag initiation to the handle.                                |
| `click_to_move`         | `false`        | Jumps the slider to the clicked location.                               |

All of these values come from the current `PluginBeforeAfter.defaults` definition. 

---

## [Implementation **Notes**](#implementation-notes)

### No TwentyTwenty Dependency

The current implementation does **not** use:

```text
jquery.twentytwenty.js
jquery.event.move.js
twentytwenty.css
```

The comparison CSS is embedded directly in the plugin and injected into the document once using the style ID:

```text
themestrap-beforeafter-styles
```



### CSS Is Shared Between Instances

Multiple BeforeAfter instances reuse the same injected stylesheet. The plugin checks for the existing style element before creating another one. 

### Instance-Specific Event Namespaces

Each instance receives its own event namespace:

```text
.beforeafter_1
.beforeafter_2
.beforeafter_3
...
```

This allows individual instances to be destroyed without removing handlers belonging to other BeforeAfter instances. 

### Original Markup Is Preserved

The plugin saves the wrapper's original HTML before replacing it with the generated comparison structure:

```javascript
this.initialHTML = $el.html();
```

That original markup is restored by `destroy()`.  

### Position Is Clamped

Slider positions outside the valid range are automatically constrained:

```text
less than 0  → 0
greater than 1 → 1
```

This applies both to the initial position and subsequent movements. 

---

## [API **Summary**](#api-summary)

| API                                  | Description                                        |
| ------------------------------------ | -------------------------------------------------- |
| `themestrap.PluginBeforeAfter`       | Constructor exposed through Themestrap.            |
| `$.fn.themestrapPluginBeforeAfter()` | jQuery initialization method.                      |
| `.data('__beforeafter')`             | Retrieve the existing instance.                    |
| `instance.pct`                       | Current slider position from `0` to `1`.           |
| `instance.destroy()`                 | Remove the comparison and restore original markup. |

The current source exposes `destroy()` as the explicit lifecycle method. `_setPosition()` and `_pctFromEvent()` are internal implementation methods and should not be treated as public API.  

---

## [Option **Reference**](#option-reference)

```javascript
PluginBeforeAfter.defaults = {
    forceInit: true,
    default_offset_pct: 0.5,
    orientation: 'horizontal',
    before_label: 'Before',
    after_label: 'After',
    no_overlay: false,
    move_slider_on_hover: false,
    move_with_handle_only: true,
    click_to_move: false
};
```

