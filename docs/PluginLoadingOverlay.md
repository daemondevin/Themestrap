# PluginLoadingOverlay

Themestrap's full-element loading overlay plugin. It provides animated loading indicators, optional messages, progress bars, backdrop customization, blur effects, scroll locking, runtime controls, and automatic show/hide behavior.

The plugin can be attached to either the `<body>` for a full-page loading overlay or to an individual element for a contained loading state.



## How It Works

`PluginLoadingOverlay` creates an overlay inside the element it is initialized on.

When initialized on `<body>`, the overlay uses `position: fixed` and covers the viewport.

When initialized on another element, the plugin automatically gives that element a positioning context when necessary and places the overlay over the element using `position: absolute`.

```javascript
$('body').themestrapPluginLoadingOverlay({
    message: 'Loading...'
});
```

Or attach it to a specific element:

```javascript
$('##content').themestrapPluginLoadingOverlay({
    message: 'Loading content...'
});
```

The plugin instance is stored on the element using the Themestrap instance pattern:

```javascript
$el.data('__pluginLoadingOverlay');
```

The jQuery plugin returns the existing instance when called on an element that has already been initialized.

  
## Basic Usage

Initialize the plugin:

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    message: 'Loading...'
});
```

Because Themestrap plugins return their plugin instance through the jQuery collection, the instance can be used directly:

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    message: 'Loading...'
});

loader.show();
```

The most common pattern is:

```javascript
const loader = $('body').themestrapPluginLoadingOverlay();

loader.show();

setTimeout(() => {
    loader.hide();
}, 2000);
```



## Full-Page Overlay

Initializing against `<body>` creates a viewport-wide overlay.

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'spinner',
    message: 'Please wait...'
});
```

The body overlay uses:

```css
position: fixed;
```

and fills the viewport with:

```css
inset: 0;
```



## Element Overlay

The plugin can also provide loading states for individual components.

```html
<div id="panel">
    <h3>Loading Panel</h3>
    <div class="content">
        Content goes here...
    </div>
</div>
```

```javascript
const loader = $('##panel').themestrapPluginLoadingOverlay({
    message: 'Loading panel...'
});

loader.show();
```

For non-body elements, the plugin automatically adds:

```css
.ts-lo-host {
    position: relative;
}
```

when the host does not already have a positioning context.

This allows the overlay to remain contained within the element.



## Animation Types

The plugin provides seven built-in loading animations.

| Type      | Description                            |
| -- | -- |
| `spinner` | Circular spinner with an open arc      |
| `ring`    | Dual-arc rotating ring                 |
| `pulse`   | Pulsing circular indicator             |
| `ripple`  | Expanding circular rings               |
| `dots`    | Three bouncing dots                    |
| `bars`    | Five animated equalizer-style bars     |
| `orbit`   | Two dots orbiting around a shared axis |

The default is:

```javascript
type: 'spinner'
```

### Spinner

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'spinner'
});
```

### Ring

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'ring'
});
```

### Pulse

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'pulse'
});
```

### Ripple

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'ripple'
});
```

### Dots

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'dots'
});
```

### Bars

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'bars'
});
```

### Orbit

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'orbit'
});
```



## Options

The following options are available.

### `type`

**Type:** `string`
**Default:** `'spinner'`

Controls the loading animation.

Available values:

```text
spinner
ring
pulse
ripple
dots
bars
orbit
```

Example:

```javascript
{
    type: 'dots'
}
```



### `message`

**Type:** `string`
**Default:** `''`

Text displayed beneath the loading animation.

```javascript
{
    message: 'Loading your content...'
}
```

If the value is empty, the message element is hidden.



### `ariaLabel`

**Type:** `string`
**Default:** `'Loading'`

Accessibility label applied to the overlay.

```javascript
{
    ariaLabel: 'Loading content'
}
```

The generated overlay uses:

```html
role="status"
aria-live="polite"
aria-label="Loading content"
```

The overlay also updates its `aria-busy` state when shown and hidden.



### `scrollLock`

**Type:** `boolean`
**Default:** `true`

Controls whether body scrolling is prevented while a body-level overlay is visible.

```javascript
{
    scrollLock: true
}
```

When active, the plugin adds:

```css
body.ts-scroll-lock {
    overflow: hidden;
}
```

The plugin also compensates for the scrollbar width using:

```css
padding-right: var(--ts-scrollbar-width, 0px);
```


### `backdrop`

**Type:** `string|null`
**Default:** `null`

Sets the overlay's background color.

Any valid CSS color can be supplied.

```javascript
{
    backdrop: 'rgba(0, 0, 0, 0.75)'
}
```

For example:

```javascript
$('body').themestrapPluginLoadingOverlay({
    backdrop: 'rgba(0, 0, 0, 0.8)',
    color: '##ffffff'
});
```

When `null`, the plugin uses its built-in light/dark-aware background.



### `color`

**Type:** `string|null`
**Default:** `null`

Controls the loader and message color.

```javascript
{
    color: '##0088CC'
}
```

The default CSS loader color is:

```text
##e8672a
```

Passing `null` causes the plugin to use the built-in CSS value.



### `size`

**Type:** `string`
**Default:** `'md'`

Controls the loader size.

Built-in size aliases are:

| Value |   Size |
| -- | --: |
| `sm`  | `32px` |
| `md`  | `48px` |
| `lg`  | `64px` |

Example:

```javascript
{
    size: 'lg'
}
```

Custom CSS lengths are also supported:

```javascript
{
    size: '80px'
}
```

or:

```javascript
{
    size: '3rem'
}
```



### `duration`

**Type:** `number`
**Default:** `800`

Controls the animation cycle duration in milliseconds.

```javascript
{
    duration: 1200
}
```

A smaller value produces faster animations:

```javascript
{
    duration: 400
}
```

A larger value produces slower animations:

```javascript
{
    duration: 1600
}
```



### `fadeDuration`

**Type:** `number`
**Default:** `200`

Controls the overlay's fade-in and fade-out duration.

```javascript
{
    fadeDuration: 300
}
```

The value controls the CSS opacity transition as well as the timing used by the `shown` and `hidden` events.



### `blur`

**Type:** `number`
**Default:** `0`

Adds a backdrop blur effect.

```javascript
{
    blur: 5
}
```

This results in:

```css
backdrop-filter: blur(5px);
```

The plugin also applies the WebKit-prefixed version for compatibility.

Set to `0` to disable the effect.



### `autoShow`

**Type:** `boolean`
**Default:** `false`

Automatically displays the overlay immediately after initialization.

```javascript
{
    autoShow: true
}
```

The plugin defers the initial `show()` call by one event-loop tick so that the CSS transition can properly occur.



### `autoHide`

**Type:** `number`
**Default:** `0`

Automatically hides the overlay after the specified number of milliseconds.

```javascript
{
    autoShow: true,
    autoHide: 3000
}
```

`0` disables automatic hiding.



### `progress`

**Type:** `boolean`
**Default:** `false`

Enables the progress bar.

```javascript
{
    progress: true
}
```

The progress bar is rendered below the message.



### `progressValue`

**Type:** `number`
**Default:** `0`

Sets the initial progress percentage.

```javascript
{
    progress: true,
    progressValue: 25
}
```

Values are clamped between `0` and `100`.


### `zIndex`

**Type:** `number`
**Default:** `9000`

Controls the overlay's stacking order.

```javascript
{
    zIndex: 10000
}
```

The value is applied through the:

```css
--ts-lo-z
```

custom property.



## Complete Configuration

A fully configured overlay might look like this:

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    type: 'ring',
    message: 'Preparing application...',
    ariaLabel: 'Preparing application',
    backdrop: 'rgba(14, 34, 56, 0.94)',
    color: '##ffffff',
    size: 'lg',
    duration: 900,
    fadeDuration: 250,
    blur: 4,
    autoShow: false,
    autoHide: 0,
    progress: true,
    progressValue: 0,
    lockScroll: true,
    zIndex: 10000
});
```



## Public API

The plugin exposes a chainable runtime API.

### `show()`

Displays the overlay.

```javascript
loader.show();
```

The method:

1. Marks the instance as visible.
2. Sets `aria-busy="true"`.
3. Applies body scroll locking when appropriate.
4. Displays the overlay.
5. Forces a reflow.
6. Adds the `is-visible` class.
7. Dispatches the `show.ts.loadingoverlay` event.
8. Dispatches `shown.ts.loadingoverlay` after the fade duration.

Calling `show()` while the overlay is already visible has no effect.



### `hide()`

Hides the overlay.

```javascript
loader.hide();
```

The method removes the visible state and waits for the fade transition before restoring the overlay's display state.

It also releases the body scroll lock when applicable.

Calling `hide()` when the overlay is already hidden has no effect.



### `toggle()`

Toggles the current visibility state.

```javascript
loader.toggle();
```

Equivalent to:

```javascript
if (loader.isVisible()) {
    loader.hide();
} else {
    loader.show();
}
```



### `isVisible()`

Returns whether the overlay is currently visible.

```javascript
if (loader.isVisible()) {
    console.log('Loading...');
}
```

Returns:

```javascript
true
```

or:

```javascript
false
```



## Updating the Message

The loading message can be changed at runtime with `setMessage()`.

```javascript
loader.setMessage('Downloading files...');
```

Because the method is chainable, calls can be combined:

```javascript
loader
    .setMessage('Almost finished...')
    .show();
```

Passing an empty string hides the message:

```javascript
loader.setMessage('');
```



## Updating Progress

If the plugin was initialized with:

```javascript
progress: true
```

the progress bar can be updated with:

```javascript
loader.setProgress(50);
```

For example:

```javascript
loader.setProgress(25);

setTimeout(() => {
    loader.setProgress(50);
}, 500);

setTimeout(() => {
    loader.setProgress(75);
}, 1000);

setTimeout(() => {
    loader.setProgress(100);
}, 1500);
```

Values outside the valid range are automatically clamped:

```javascript
loader.setProgress(-10);  // 0
loader.setProgress(150);  // 100
```

The progress bar also updates its:

```html
aria-valuenow
```

attribute.

> `setProgress()` has no visible effect if the plugin was initialized without `progress: true`.



## Changing the Animation

The loader type can be changed without destroying and recreating the plugin.

```javascript
loader.setType('dots');
```

For example:

```javascript
loader
    .setType('bars')
    .setMessage('Processing...')
    .show();
```

Available types:

```javascript
loader.setType('spinner');
loader.setType('ring');
loader.setType('pulse');
loader.setType('ripple');
loader.setType('dots');
loader.setType('bars');
loader.setType('orbit');
```



## Changing the Size

Use `setSize()` to change the loader size at runtime.

```javascript
loader.setSize('lg');
```

Built-in sizes:

```javascript
loader.setSize('sm');
loader.setSize('md');
loader.setSize('lg');
```

Custom CSS values are also supported:

```javascript
loader.setSize('80px');
```



## Changing the Color

Use `setColor()` to change the loader and message color.

```javascript
loader.setColor('##0088CC');
```

Any valid CSS color may be used:

```javascript
loader.setColor('##ffffff');
loader.setColor('rgb(0, 136, 204)');
loader.setColor('var(--bs-primary)');
```

Passing `null` restores the CSS default:

```javascript
loader.setColor(null);
```



## Changing the Backdrop

The overlay background can also be changed at runtime.

```javascript
loader.setBackdrop('rgba(0, 0, 0, 0.8)');
```

To restore the built-in light/dark-aware backdrop:

```javascript
loader.setBackdrop(null);
```



## Events

The plugin dispatches native `CustomEvent` events on the host element.

#### `show.ts.loadingoverlay`

Fired immediately when the overlay begins showing.

```javascript
$('body').on('show.ts.loadingoverlay', function () {
    console.log('Overlay is showing');
});
```



### `shown.ts.loadingoverlay`

Fired after the fade-in duration has elapsed.

```javascript
$('body').on('shown.ts.loadingoverlay', function () {
    console.log('Overlay is visible');
});
```



### `hide.ts.loadingoverlay`

Fired immediately when hiding begins.

```javascript
$('body').on('hide.ts.loadingoverlay', function () {
    console.log('Overlay is hiding');
});
```



### `hidden.ts.loadingoverlay`

Fired after the fade-out duration has elapsed.

```javascript
$('body').on('hidden.ts.loadingoverlay', function () {
    console.log('Overlay is hidden');
});
```

The events are also native DOM events and bubble through the document.

For example:

```javascript
document.body.addEventListener(
    'shown.ts.loadingoverlay',
    () => {
        console.log('Loading overlay shown');
    }
);
```



## AJAX / Fetch Example

A common use case is displaying the overlay while an asynchronous operation is running.

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    type: 'dots',
    message: 'Loading data...'
});

loader.show();

fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .finally(() => {
        loader.hide();
    });
```

A progress-enabled version can provide status updates:

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    type: 'bars',
    message: 'Downloading...',
    progress: true
});

loader.show();

loader.setProgress(25);

setTimeout(() => loader.setProgress(50), 500);
setTimeout(() => loader.setProgress(75), 1000);
setTimeout(() => {
    loader.setProgress(100);
    loader.setMessage('Complete!');

    setTimeout(() => loader.hide(), 500);
}, 1500);
```



## Element-Level Loading State

The plugin is particularly useful for temporarily disabling interaction with an individual component.

```javascript
const loader = $('##user-profile').themestrapPluginLoadingOverlay({
    type: 'spinner',
    message: 'Saving profile...'
});

$('##save-profile').on('click', function () {
    loader.show();

    saveProfile()
        .finally(() => {
            loader.hide();
        });
});
```

Because the overlay receives pointer events while visible, it can also prevent interaction with the covered element during the loading operation.



## Automatic Loading

For situations where the loading state should begin immediately:

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'ring',
    message: 'Loading application...',
    autoShow: true
});
```

To automatically hide after a fixed period:

```javascript
$('body').themestrapPluginLoadingOverlay({
    type: 'pulse',
    message: 'Working...',
    autoShow: true,
    autoHide: 3000
});
```



## Dark Mode

The overlay has built-in dark-mode awareness.

When no explicit `backdrop` is supplied, it checks:

```css
@media (prefers-color-scheme: dark)
```

and also supports:

```html
<html class="dark">
```

and:

```html
<html data-bs-theme="dark">
```

Light mode can explicitly be selected with:

```html
<html data-bs-theme="light">
```

The built-in backgrounds are approximately:

**Light:**

```css
rgba(255, 255, 255, 0.92)
```

**Dark:**

```css
rgba(14, 34, 56, 0.92)
```

An explicitly supplied `backdrop` overrides these defaults.



## CSS Customization

The plugin exposes several CSS custom properties on the overlay.

```css
.ts-lo-overlay {
    --ts-lo-color: ##e8672a;
    --ts-lo-z: 9000;
    --ts-lo-size: 48px;
    --ts-lo-duration: 800ms;
    --ts-lo-fade: 200ms;
}
```

The backdrop uses:

```css
--ts-lo-bg
```

with a fallback to:

```css
--ts-lo-bg-default
```

This makes the plugin straightforward to customize from a Themestrap stylesheet.

For example:

```css
.my-loading-overlay .ts-lo-overlay {
    --ts-lo-color: ##0088CC;
    --ts-lo-size: 56px;
}
```



## Accessibility

The overlay is created with:

```html
role="status"
aria-live="polite"
```

and receives an accessible label:

```html
aria-label="Loading"
```

The `aria-busy` state is changed automatically:

```html
aria-busy="true"
```

when the overlay is visible and:

```html
aria-busy="false"
```

when it is hidden.

Progress bars also expose:

```html
role="progressbar"
aria-valuemin="0"
aria-valuemax="100"
aria-valuenow="..."
```

Use a descriptive `ariaLabel` when the loading operation has a specific purpose:

```javascript
$('body').themestrapPluginLoadingOverlay({
    message: 'Saving your changes...',
    ariaLabel: 'Saving your changes'
});
```



## Destroying the Plugin

When the plugin is no longer needed, call:

```javascript
loader.destroy();
```

This removes:

* The overlay element
* The plugin instance data
* The temporary `.ts-lo-host` class
* Any active plugin timers

It also releases the body scroll lock when appropriate.

After destruction, the plugin can be initialized again:

```javascript
loader.destroy();

const newLoader = $('body').themestrapPluginLoadingOverlay({
    type: 'ring'
});
```



## Practical Examples

### Simple Page Loader

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    message: 'Loading...'
});

loader.show();

setTimeout(() => {
    loader.hide();
}, 2000);
```



### Dark Loading Overlay

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    type: 'ring',
    message: 'Please wait...',
    backdrop: 'rgba(14, 34, 56, 0.94)',
    color: '##ffffff',
    blur: 4
});

loader.show();
```



### Minimal Dots Loader

```javascript
const loader = $('##content').themestrapPluginLoadingOverlay({
    type: 'dots'
});

loader.show();
```



### Progress Loader

```javascript
const loader = $('body').themestrapPluginLoadingOverlay({
    type: 'bars',
    message: 'Uploading files...',
    progress: true,
    progressValue: 0
});

loader.show();

let progress = 0;

const interval = setInterval(() => {
    progress += 10;
    loader.setProgress(progress);

    if (progress >= 100) {
        clearInterval(interval);
        loader.setMessage('Upload complete!');

        setTimeout(() => loader.hide(), 500);
    }
}, 300);
```



### Runtime Configuration

Because the public API is chainable, multiple properties can be updated together:

```javascript
loader
    .setType('orbit')
    .setSize('lg')
    .setColor('##0088CC')
    .setBackdrop('rgba(255, 255, 255, 0.95)')
    .setMessage('Processing...')
    .setProgress(50)
    .show();
```



## API Reference

| Method                | Description                     |
|  | - |
| `show()`              | Show the overlay                |
| `hide()`              | Hide the overlay                |
| `toggle()`            | Toggle visibility               |
| `isVisible()`         | Return current visibility state |
| `setMessage(message)` | Change or hide the message      |
| `setProgress(value)`  | Set progress from 0–100         |
| `setType(type)`       | Change the loader animation     |
| `setSize(size)`       | Change loader size              |
| `setColor(color)`     | Change loader/message color     |
| `setBackdrop(color)`  | Change overlay backdrop         |
| `destroy()`           | Remove the plugin and clean up  |



## Events Reference

| Event                      | Fired                    |
| -- |  |
| `show.ts.loadingoverlay`   | When showing begins      |
| `shown.ts.loadingoverlay`  | After fade-in completes  |
| `hide.ts.loadingoverlay`   | When hiding begins       |
| `hidden.ts.loadingoverlay` | After fade-out completes |



## Default Options

```javascript
PluginLoadingOverlay.defaults = {
    type          : 'spinner',
    message       : '',
    ariaLabel     : 'Loading',
    scrollLock    : true,
    backdrop      : null,
    color         : null,
    size          : 'md',
    duration      : 800,
    fadeDuration  : 200,
    blur          : 0,
    autoShow      : false,
    autoHide      : 0,
    progress      : false,
    progressValue : 0,
    lockScroll    : true,
    zIndex        : 9000
};
```



## jQuery Initialization

The plugin is exposed as:

```javascript
$.fn.themestrapPluginLoadingOverlay
```

Therefore the standard Themestrap initialization syntax is:

```javascript
$('##element').themestrapPluginLoadingOverlay(options);
```

For example:

```javascript
$('##app').themestrapPluginLoadingOverlay({
    type: 'spinner',
    message: 'Loading application...'
});
```

Calling the plugin again on an already initialized element returns the existing `PluginLoadingOverlay` instance rather than creating another overlay.
