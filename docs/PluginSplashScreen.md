# Splash Screen Guide

Asset-preloading splash screen plugin. It loads JavaScript and CSS assets before completing initialization, optionally caches those assets using `StorageBin`, supports concurrent downloads, reports loading progress, executes the downloaded assets, and can display an animated Three.js ribbon background.

`PluginSplashScreen` is designed for applications that need to preload resources before the page becomes fully usable.


## How It Works

The Splash Screen plugin accepts an array of files and downloads them asynchronously.

```javascript
$('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',
        '/assets/js/app.js'
    ]
});
```

Once every file has successfully loaded, the plugin:

1. Executes JavaScript files.
2. Injects CSS files into the document.
3. Stores the downloaded resources in the configured `StorageBin` cache.
4. Calls the `onSuccess` callback.

The plugin can also:

* Limit the number of simultaneous downloads.
* Load files from cache instead of downloading them again.
* Force a fresh download.
* Track loading through a `PluginProgressBar`.
* Provide per-file callbacks.
* Provide global loading and error callbacks.
* Display an optional animated Three.js ribbon.
* Retrieve downloaded file contents with `getFile()`.


## Basic Usage

A minimal splash screen can be initialized with:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',
        '/assets/js/app.js'
    ]
});
```

The files are automatically loaded when the plugin initializes.

There is no separate `load()` or `start()` method. Initialization begins the loading process.


## File Configuration

The `files` option accepts an array containing either URL strings or objects.

### URL Strings

The simplest form is an array of URLs:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',
        '/assets/js/app.js',
        '/assets/js/application.js'
    ]
});
```

The plugin determines how to execute the resource based on its file extension.

#### JavaScript

Files ending in `.js` are injected as executable `<script>` elements.

#### CSS

Files ending in `.css` are injected as `<style>` elements.


## File Callback Objects

A file can also be represented by an object:

```javascript
{
    url: '/assets/js/application.js',
    callback: function(path) {
        console.log('Loaded:', path);
    }
}
```

For example:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',

        {
            url: '/assets/js/application.js',
            callback: function(path) {
                console.log('Application loaded:', path);
            }
        }
    ]
});
```

The callback is invoked in the context of the `PluginSplashScreen` instance.

For a normally downloaded file, the callback receives:

```javascript
callback(path)
```

For a cached file, it receives:

```javascript
callback(path, data)
```

where `data` contains the cached file contents.


## Loading Order

Files are initially processed in the order supplied to `files`.

However, the plugin supports concurrent downloads through the `threads` option.

```javascript
{
    threads: 3
}
```

With three threads, up to three XHR requests may be active simultaneously.

The default is:

```javascript
threads: 1
```

which effectively processes downloads sequentially.


## Concurrent Downloads

For applications with many independent assets, increasing the thread count can reduce total loading time.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    threads: 4,

    files: [
        '/assets/css/app.css',
        '/assets/css/components.css',
        '/assets/js/vendor.js',
        '/assets/js/app.js'
    ]
});
```

The plugin maintains an internal queue when the maximum number of concurrent downloads has been reached.

When a download finishes, the next queued file is started.


## Caching

The plugin uses Themestrap's `StorageBin` utility to cache downloaded resources.

The cache key is:

```text
ts_splashscreen_cache
```

By default, the cache backend is:

```javascript
cacheBackend: 'localStorage'
```

After all files successfully load, the plugin stores their contents.

A cached entry contains:

```javascript
{
    objects: [
        {
            path: '/assets/css/app.css',
            data: '...'
        },
        {
            path: '/assets/js/app.js',
            data: '...'
        }
    ]
}
```

On subsequent initialization, the plugin checks the cache before making an XHR request.


## Fresh Mode

Set `fresh: true` to clear the splash-screen cache before loading.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    fresh: true,

    files: [
        '/assets/css/app.css',
        '/assets/js/app.js'
    ]
});
```

This is useful when developing or when you need to guarantee that the current versions of your assets are downloaded.

With:

```javascript
fresh: false
```

the existing cache is used whenever possible.


## Cache Backend

The cache backend can be changed through:

```javascript
cacheBackend
```

For example:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    cacheBackend: 'localStorage'
});
```

The value is passed directly to:

```javascript
themestrap.fn.createStorage()
```

so the available backends depend on the Themestrap `StorageBin` implementation being used.


## ProgressBar Integration

`PluginSplashScreen` can drive an existing Themestrap `PluginProgressBar` instance.

The `progressBar` option accepts:

* A CSS selector
* A jQuery object
* A DOM element

The referenced element must already contain a `PluginProgressBar` instance.

For example:

```html
<div id="loading-progress"></div>
```

```javascript
$('##loading-progress').themestrapPluginProgressBar();

const splash = $('body').themestrapPluginSplashScreen({
    progressBar: '##loading-progress',

    files: [
        '/assets/css/app.css',
        '/assets/js/vendor.js',
        '/assets/js/app.js'
    ]
});
```

The Splash Screen plugin updates the progress bar after each file completes.

The percentage is calculated as:

```text
completed files / total files × 100
```

For example, with four files:

```text
1 / 4 = 25%
2 / 4 = 50%
3 / 4 = 75%
4 / 4 = 100%
```

Cached files count toward completion as well.


## ProgressBar Resolution

The plugin resolves the progress bar once during initialization.

A selector:

```javascript
progressBar: '##loading-progress'
```

A jQuery object:

```javascript
progressBar: $('##loading-progress')
```

Or a DOM element:

```javascript
progressBar: document.getElementById('loading-progress')
```

If the resolved element does not contain a `PluginProgressBar` instance, the plugin silently falls back to no progress-bar integration and emits a debug message when `debug` is enabled.


## Three.js Ribbon Background

The plugin optionally supports an animated Three.js ribbon background.

Enable it with:

```javascript
ribbon: true
```

Example:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    ribbon: true,

    files: [
        '/assets/css/app.css',
        '/assets/js/app.js'
    ]
});
```

The ribbon uses Three.js `r128` loaded from the jsDelivr CDN.

The Three.js module is only loaded when:

```javascript
ribbon: true
```

This means pages that do not use the ribbon do not incur the Three.js network request.


## Three.js Loading

The plugin maintains page-level Three.js state:

```javascript
themestrap._three
themestrap._threeLoading
```

This allows multiple Splash Screen instances on the same page to share the same Three.js module load.

If several instances request the ribbon simultaneously, they reuse the same in-flight promise rather than initiating multiple Three.js downloads.

The module is loaded dynamically with:

```javascript
import(...)
```

If Three.js fails to load, the splash screen continues without the ribbon background.

When debugging is enabled, the failure is reported to the console.


## Ribbon Animation

The ribbon is rendered with:

* A Three.js `Scene`
* A `PerspectiveCamera`
* A `WebGLRenderer`
* A subdivided `PlaneGeometry`
* A custom `ShaderMaterial`

The animation is driven using `requestAnimationFrame()`.

The shader uses animated noise and trigonometric calculations to deform the plane into the ribbon effect.

The renderer is automatically resized when the window changes dimensions.


## Ribbon Performance

The ribbon uses WebGL and therefore requires a browser with WebGL support.

Because the animation continuously uses:

```javascript
requestAnimationFrame()
```

it should generally be reserved for splash screens or other short-lived UI rather than unnecessarily persistent page backgrounds.

Destroying the plugin cancels the animation frame and disposes the renderer.


## Loading Lifecycle

The loading process follows this general sequence:

```text
Initialize Plugin
       ↓
Create StorageBin
       ↓
Resolve ProgressBar
       ↓
Load Three.js (optional)
       ↓
Build Ribbon (optional)
       ↓
Read Cache
       ↓
Start File Downloads
       ↓
Process Each File
       ↓
Update ProgressBar
       ↓
Execute All Files
       ↓
Store Cache
       ↓
onSuccess()
```

If any HTTP request fails, the loading process enters its failure state.


## `onLoaded`

The `onLoaded` callback fires whenever an individual file completes.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/js/app.js',
        '/assets/js/components.js'
    ],

    onLoaded: function(current, total, path, data) {
        console.log(
            `${current} of ${total}: ${path}`
        );
    }
});
```

The callback receives:

| Argument  | Description                  |
| --------- | ---------------------------- |
| `current` | Number of files completed    |
| `total`   | Total number of files        |
| `path`    | File URL                     |
| `data`    | File contents when available |

For cached resources, `data` is supplied from the cache.

For normal XHR downloads, `data` is not passed to the callback by `_processResponse()`.


## `onSuccess`

`onSuccess` fires after all files have loaded and been executed.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',
        '/assets/js/app.js'
    ],

    onSuccess: function() {
        console.log('Application resources loaded.');
    }
});
```

At this point the plugin has:

1. Loaded all files.
2. Executed JavaScript.
3. Injected CSS.
4. Stored the resources in the cache.


## `onError`

`onError` fires when an HTTP request returns an error status.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/js/app.js'
    ],

    onError: function(path) {
        console.error('Failed to load:', path);
    }
});
```

The callback receives the failed file path.

Once an error occurs, the plugin sets its internal failure state and stops further loading.


## Callback Context

Callbacks are called with the Splash Screen instance as their `this` value.

For example:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/js/app.js'
    ],

    onLoaded: function(current, total, path) {
        console.log(this);
    }
});
```

Inside the callback:

```javascript
this
```

refers to the `PluginSplashScreen` instance.

This means the callback can access methods such as:

```javascript
this.getFile(path);
```


## Retrieving Loaded Files

Use `getFile()` to retrieve the contents of a loaded resource.

```javascript
const data = splash.getFile('/assets/js/app.js');

console.log(data);
```

The method returns:

* The downloaded/cached file contents if the path exists.
* `null` if the file is unknown or has not been loaded.

Example:

```javascript
const appSource = splash.getFile('/assets/js/app.js');

if (appSource) {
    console.log('Application source available.');
}
```

This can be useful when a caller needs access to the raw source after preloading.


## JavaScript Execution

When all files have successfully loaded, the plugin executes every loaded resource.

For `.js` files it creates a `<script>` element:

```html
<script type="text/javascript">
    ...
</script>
```

and appends it to:

```javascript
document.body
```

The script therefore executes as normal JavaScript.


## CSS Injection

`.css` files are injected into the document as `<style>` elements.

The downloaded CSS becomes:

```html
<style type="text/css">
    ...
</style>
```

and is appended to:

```javascript
document.head
```

This allows the plugin to preload CSS and activate it after all configured resources have completed.


## File Execution Order

Downloads may occur concurrently when `threads` is greater than `1`.

However, execution is performed after all files have finished loading.

The plugin then iterates through the internal `_loadedFiles` array and executes each resource in that array's configured order.

This allows downloads to happen concurrently while maintaining the configured execution ordering.


## Debugging

Enable debug output with:

```javascript
debug: true
```

Example:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    debug: true,

    files: [
        '/assets/js/app.js',
        '/assets/css/app.css'
    ]
});
```

Debug messages use the prefix:

```text
[PluginSplashScreen]
```

Debug logging can report events such as:

* Cache hits
* Failed downloads
* Invalid progress-bar configuration
* Cache-storage failures
* Three.js loading failures


## Complete Example

A more complete application setup might look like:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/vendor.css',
        '/assets/css/app.css',
        '/assets/js/vendor.js',
        '/assets/js/app.js'
    ],

    threads: 3,

    fresh: false,

    ribbon: true,

    progressBar: '##loading-progress',

    cacheBackend: 'localStorage',

    debug: false,

    onLoaded: function(current, total, path) {
        console.log(
            `Loaded ${current}/${total}: ${path}`
        );
    },

    onSuccess: function() {
        console.log('Application ready.');
    },

    onError: function(path) {
        console.error(
            'Unable to load application resource:',
            path
        );
    }
});
```


## Using File-Specific Callbacks

Individual resources can have their own callbacks while the plugin also provides global lifecycle callbacks.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        {
            url: '/assets/js/vendor.js',

            callback: function(path) {
                console.log('Vendor library ready:', path);
            }
        },

        {
            url: '/assets/js/app.js',

            callback: function(path) {
                console.log('Application script ready:', path);
            }
        }
    ],

    onLoaded: function(current, total, path) {
        console.log(`${current}/${total}: ${path}`);
    },

    onSuccess: function() {
        console.log('Everything loaded.');
    }
});
```

This gives you both per-file and overall lifecycle control.


## Building an Application Preloader

The plugin can be used as a centralized application asset loader.

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    ribbon: true,

    files: [
        '/assets/css/bootstrap.css',
        '/assets/css/themestrap.css',
        '/assets/js/jquery.js',
        '/assets/js/themestrap.js',
        '/assets/js/app.js'
    ],

    onSuccess: function() {
        document.documentElement.classList.add('app-ready');
    }
});
```

This allows the application to wait until its primary CSS and JavaScript resources have been loaded and executed before enabling the rest of the interface.


## Multiple Splash Screens

The plugin stores each instance on its host element using:

```javascript
__splashScreen
```

Calling the plugin again on the same element returns the existing instance rather than creating another one.

```javascript
const first = $('##app').themestrapPluginSplashScreen({
    files: ['/assets/js/app.js']
});

const second = $('##app').themestrapPluginSplashScreen();

console.log(first === second);
```

The result is:

```text
true
```

Multiple instances can therefore be associated with different elements.


## Destroying the Plugin

Use:

```javascript
splash.destroy();
```

to remove the plugin.

When destroyed, the plugin:

* Cancels the ribbon animation frame.
* Disposes the Three.js renderer.
* Removes its window resize handler.
* Empties the host element.
* Removes the plugin's stored instance data.

Example:

```javascript
splash.destroy();
```

> `destroy()` removes the host element's contents with `$el.empty()`. It should therefore be used only when the Splash Screen owns the contents of that host element.


## Default Options

```javascript
PluginSplashScreen.defaults = {
    files:        [],
    threads:      1,
    fresh:        false,
    ribbon:       false,
    progressBar:  null,
    debug:        false,
    cacheBackend: 'localStorage',
    onSuccess:    null,
    onError:      null,
    onLoaded:     null
};
```


## Options Reference

| Option         | Type                    | Default          | Description                                   |
| -------------- | ----------------------- | ---------------- | --------------------------------------------- |
| `files`        | `Array`                 | `[]`             | Files to preload                              |
| `threads`      | `Number`                | `1`              | Maximum concurrent XHR downloads              |
| `fresh`        | `Boolean`               | `false`          | Clears the Splash Screen cache before loading |
| `ribbon`       | `Boolean`               | `false`          | Enables the Three.js ribbon background        |
| `progressBar`  | `String` / jQuery / DOM | `null`           | Existing `PluginProgressBar` instance         |
| `debug`        | `Boolean`               | `false`          | Enables console debugging                     |
| `cacheBackend` | `String`                | `'localStorage'` | StorageBin backend                            |
| `onSuccess`    | `Function`              | `null`           | Called after all files load and execute       |
| `onError`      | `Function`              | `null`           | Called when a file fails                      |
| `onLoaded`     | `Function`              | `null`           | Called after each file completes              |


## API Reference

| Method          | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `getFile(path)` | Returns the loaded file contents                               |
| `destroy()`     | Removes the Splash Screen instance and cleans up its resources |

Unlike some Themestrap UI plugins, the Splash Screen does not expose `show()` or `hide()` methods. Its lifecycle is driven by initialization and completion of the configured file-loading process.


## File Object Reference

A file entry may be either:

### String

```javascript
'/assets/js/app.js'
```

or:

### Object

```javascript
{
    url: '/assets/js/app.js',
    callback: function(path, data) {
        // Handle this resource
    }
}
```


## Recommended Usage

For a typical application, a sensible configuration is:

```javascript
const splash = $('body').themestrapPluginSplashScreen({
    files: [
        '/assets/css/app.css',
        '/assets/js/vendor.js',
        '/assets/js/app.js'
    ],

    threads: 2,

    ribbon: true,

    progressBar: '##loading-progress',

    onSuccess: function() {
        console.log('Application initialized.');
    },

    onError: function(path) {
        console.error('Application failed to load:', path);
    }
});
```

For development, consider:

```javascript
fresh: true,
debug: true
```

For production, caching can normally remain enabled:

```javascript
fresh: false,
debug: false
```
