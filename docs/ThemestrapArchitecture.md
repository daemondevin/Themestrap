# Plugin Framework

`themestrap.js` is the heart of the Themestrap framework. It serves as the primary entry point that initializes the framework, exposes the public API, and coordinates the loading and execution of Themestrap plugins.

Two cooperating layers power every Themestrap page:

- a class-based plugin framework with lazy initialization
- and a dependency-aware loader that ships only the JavaScript each page actually uses.

This guide covers both, end to end.

## [Overview](#overview)

Themestrap ships a lightweight, jQuery-powered plugin architecture that gives every interactive UI component the same consistent structure: a class-based plugin, a jQuery adapter method, a static defaults object, and an IntersectionObserver-driven lazy initializer wired up through `themestrap.init.js`.

Every plugin follows the same **five-step lifecycle** (`initialize -> setData -> setOptions -> build -> (events)`) and exposes itself on the shared `window.themestrap` namespace so that `init.js` can reference its static defaults without importing anything extra.

#### When to write a plugin

Use the plugin pattern whenever a UI component:

- Needs to keep state between method calls (e.g. the initial HTML so `destroy()` can restore it).
- Should initialize lazily as it scrolls into view, not all at once on DOMReady.
- Can appear multiple times on the same page and must not share state across instances.
- Needs to be accessible imperatively: `$('#el').themestrapPluginFoo({ loop: false })`.
- May need to be destroyed and re-initialized (e.g. after an AJAX load or resize).

For simpler, stateless one-time behaviors (lazy background images, browser class injection, clone helpers, etc.) use a plain *built-in behavior* directly inside the main themestrap IIFE instead.

## [Namespace Architecture](#namespace)

All framework objects live under `window.themestrap`. The namespace is bootstrapped at the top of `themestrap.js` and then populated module-by-module as each IIFE executes.

```bat
window.themestrap
  ├── .fn                      // utility functions (getOptions, intObsInit, dynIntObsInit, …)
  ├── .PluginAnimate           // class + static .defaults
  ├── .PluginAnimatedContent
  ├── .PluginBeforeAfter
  ├── .PluginCarousel
  └── … one entry per plugin file
```

Plugin classes are exposed on the namespace so `init.js` can access their `.defaults` static property without any import boilerplate — e.g. `themestrap.PluginAnimate.defaults`.

> [!NOTE]
> **File load order matters.** <br>
> `themestrap.js` (all class definitions) must be included *before* `themestrap.init.js` (auto-init wiring). Reversing them produces `themestrap is not defined` errors.

## [Plugin Anatomy](#anatomy)

Every plugin consists of four co-located pieces, all defined inside the same IIFE block.

<details>
  
<summary>1. instanceName</summary>

> A unique private string used as the jQuery `.data()` key that stores the instance. Convention: double-underscore prefix, camelCase — e.g. `'__myPlugin'`. Never reuse this string across plugins.

</details>

<details>
  
<summary>2. Plugin class</summary>

> A standard ES6 class whose constructor immediately delegates to `initialize()`. Contains all lifecycle methods and any additional helper methods the plugin needs.

</details>

<details>
  
<summary>3. ClassName.defaults</summary>

> An object literal assigned to the class after the class body closes. Holds all option defaults. Accessed by both `setOptions()` internally and by `themestrap.fn.dynIntObsInit()` externally.

</details>

<details>
  
<summary>4. $.fn.themestrapPlugin* adapter</summary>

> A jQuery plugin function that instantiates the class or returns the existing instance. Named `$.fn.themestrapPlugin[Name]`, e.g. `$.fn.themestrapPluginAnimate`.

</details>

<details>
  
<summary>5. $.extend(themestrap, { PluginName })</summary>

> Exposes the class on the shared namespace so init.js and other plugins can reference `themestrap.PluginName.defaults` or call the jQuery method by string name.

</details>

<details>
  
<summary>6. destroy() method</summary>

> Restores the element to its pre-plugin state. Required if the plugin will be used with the `data-reinit-plugin` re-init mechanism. Store initial HTML as `this.initialHTML` in `initialize()` if needed.

</details>

<details>
  
<summary>7. events() method</summary>

> Wires jQuery event listeners using custom events (e.g. `'myplugin.destroy'`, `'myplugin.rebuild'`). Called at the end of `initialize()`'s chain, after `build()`.

</details>

> [!TIP]
> **Naming convention recap:**<br>
> - class -> `PluginFoo`;
> - jQuery method -> `$.fn.themestrapPluginFoo`;
> - namespace key -> `themestrap.PluginFoo`;
> - instance key -> `'__foo'`.

## [Plugin Lifecycle](#lifecycle)

When a plugin jQuery method is called (either by user code or by an init observer), execution flows through a fixed chain of fluent methods. Each method returns `this` so they can be chained.

<details>
  
<summary>constructor($el, opts)</summary>

> Called by `new PluginFoo($el, opts)`. Immediately delegates to `initialize()` and returns the result — so the constructor itself acts as a transparent passthrough.

</details>

<details>
  
<summary>initialize($el, opts)</summary>

> **Re-init guard first:** if `$el.data(instanceName)` already exists, return early — the element is already initialized. Otherwise store `$el`, then call the chain below. Returns `this`.

</details>

<details>
  
<summary>setData()</summary>

> Writes `this` (the plugin instance) onto the element: `this.$el.data(instanceName, this)`. Must run *before* any early returns in later methods, so the re-init guard works correctly on subsequent calls. Returns `this`.

</details>

<details>
  
<summary>setOptions(opts)</summary>

> Merges defaults, caller-supplied opts, and a forced `{ wrapper: this.$el }` override (so the element reference is always available at `this.options.wrapper`): `$.extend(true, {}, PluginFoo.defaults, opts, { wrapper: this.$el })`. Returns `this`.

</details>

<details>
  
<summary>build()</summary>

> The main implementation. Reads from `this.options`, manipulates the DOM, initializes third-party libraries, binds resize/scroll handlers, etc. Always returns `this` so the chain continues.

</details>

<details>
  
<summary>events()</summary>

> Attaches custom jQuery events on the wrapper element for external control (e.g. `'myplugin.destroy'`). Called after `build()` when present.

</details>

> [!WARNING]
> **setData() position is critical.** <br>
> It must be the very first method called in the chain, before *any* conditional early-returns in `setOptions()` or `build()`. If `build()` returns early (e.g. viewport too small) but `setData()` was not called, the re-init guard on the next call will still pass and the plugin will attempt to double-initialize.

## [IIFE Module Pattern](#iife)

Each plugin lives inside its own Immediately Invoked Function Expression that receives `window.themestrap` and `jQuery` as arguments. This keeps the `instanceName` constant and the class body completely private while still writing to the shared namespace via `$.extend(themestrap, { PluginFoo })`.

IIFE wrapper — themestrap.js

```js
(((themestrap = {}, $) => {

    // Private scope — not accessible from outside
    const instanceName = '__myPlugin';

    class PluginMyPlugin {
        // … class body …
    }

    PluginMyPlugin.defaults = { /* … */ };

    // Expose class on the shared namespace
    $.extend(themestrap, { PluginMyPlugin });

    // Register the jQuery adapter
    $.fn.themestrapPluginMyPlugin = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginMyPlugin($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
```

The double-bracket `(((…))).apply(this, [window.themestrap, jQuery])` pattern ensures that each plugin's IIFE receives a mutable reference to the same `themestrap` object, even though `window.themestrap` was originally a plain `{}`. `$.extend` writes to that shared object, so subsequent IIFEs (and `init.js`) see everything.

## [Core Method Reference](#methods)

#### initialize($el, opts)

initialize($el: jQuery, opts?: object): this

Entry point. Checks for an existing instance, stores the element reference, then starts the method chain. It's important that the chain is `setData -> setOptions -> build` (-> `events`) — this order must not change.

```js
initialize($el, opts) {
    if ($el.data(instanceName)) {
        return this;               // already initialized — bail out
    }

    this.$el = $el;
    this.initialHTML = $el.html(); // store if destroy() is needed

    this
        .setData()
        .setOptions(opts)
        .build()
        .events();                 // omit if no custom events needed

    return this;
}
```

#### setData()

setData(): this

Registers the instance with jQuery's data store on the element. This is the mechanism that powers both the re-init guard and external instance retrieval (`$('#el').data('__myPlugin')`).

```js
setData() {
    this.$el.data(instanceName, this);
    return this;
}
```

#### setOptions(opts)

setOptions(opts?: object): this

Performs a three-way deep merge: class defaults -> caller opts -> forced overrides. The `{ wrapper: this.$el }` override is always injected last so `this.options.wrapper` is always the correct jQuery element, regardless of what was passed in.

```js
setOptions(opts) {
    this.options = $.extend(true, {}, PluginMyPlugin.defaults, opts, {
        wrapper: this.$el   // always last — never overrideable
    });
    return this;
}
```

> [!WARNING]
> **Don't put real option keys in the forced override object.**<br>
> Anything in the third argument to `$.extend` wins unconditionally. If you accidentally put `loop: true` there, the user can never disable it via `data-plugin-options`.

#### build()

build(): this

The implementation heart of the plugin. Read options from `this.options`, write to the DOM, bind third-party components, etc. Always return `this` — even on early exits.

```js
build() {
    const self = this;

    // Guard: skip on narrow viewports if desired
    if ($(window).width() < self.options.minWindowWidth) {
        return this;
    }

    // … do the actual work …
    self.options.wrapper.addClass('plugin-active');

    return this;
}
```

#### destroy() optional

destroy(): this

Reverses what `build()` did: restore HTML, remove added classes, unbind event listeners, tear down third-party libraries. Required for plugins used with `data-reinit-plugin`. The re-init pattern calls `.destroy()` then immediately calls `$.fn.themestrapPlugin*()` again.

```js
destroy() {
    const self = this;

    // Restore original state
    self.$el
        .html(self.initialHTML)   // restore pre-plugin HTML
        .css('min-height', '')    // remove any injected styles
        .removeClass('plugin-active');

    // Remove the data reference so the element can be reinitialized
    self.$el.removeData(instanceName);

    return this;
}
```

#### events() optional

events(): this

Binds custom jQuery events on the wrapper element, enabling external code to control the plugin without keeping a reference to the instance. Use namespaced event names to avoid collisions.

```js
events() {
    const self = this;

    self.$el.on('myplugin.destroy', () => {
        self.destroy();
    });

    self.$el.on('myplugin.rebuild', () => {
        self.build();
    });

    return this;
}
```

## [Defaults &amp; Options](#defaults)

Plugin options flow from three sources, merged in this order (later wins):

1. **`PluginName.defaults`** — class-level defaults (lowest priority).
2. **Caller-supplied `opts`** — passed to `$.fn.themestrapPlugin*(opts)` or merged from `data-plugin-options` by the init system.
3. **`{ wrapper: this.$el }`** — always injected last; never overrideable.

Defining defaults

```js
// Assigned after the class body — not inside it
PluginMyPlugin.defaults = {
    accX: 0,
    accY: -80,         // viewport offset for dynIntObsInit
    delay: 100,
    duration: '750ms',
    minWindowWidth: 0,
    forceInit: false,  // true = skip IntersectionObserver, init immediately
    loop: true
};
```

##### Special default keys

| Key         | Type    | Used by                           | Description                                                                                                                                                                                                 |
|-------------|---------|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `forceInit` | boolean | `dynIntObsInit`                   | When `true`, bypasses the IntersectionObserver entirely and initializes the plugin synchronously on DOMReady.                                                         |
| `accY`      | number  | `dynIntObsInit` -> `getRootMargin` | Pixel offset added to the IntersectionObserver's `rootMargin` bottom value. Negative values trigger the plugin before the element fully enters the viewport (useful for animations that need a head-start). |
| `accX`      | number  | `dynIntObsInit`                   | Horizontal accumulation offset (rarely used, defaults to 0).                                                                                                                                                |
| `wrapper`   | jQuery  | `setOptions`                      | Always injected by `setOptions()` as the last override. Always equals `this.$el`. Never define this in `.defaults`.                                                                                         |

## [jQuery Adapter](#jquery-adapter)

The adapter function is what makes a plugin callable like `$('#el').themestrapPluginFoo(opts)`. It uses `this.map()` so it works correctly on multi-element jQuery sets — each element gets its own independent instance.

```js
$.fn.themestrapPluginMyPlugin = function(opts) {
    return this.map(function() {
        const $this = $(this);

        if ($this.data(instanceName)) {
            // Already initialized — return the existing instance
            return $this.data(instanceName);
        } else {
            // First call — create a new instance
            return new PluginMyPlugin($this, opts);
        }
    });
};
```

Using `.map()` instead of `.each()` means calling the jQuery method on a set returns a jQuery-like object of instances, making patterns like `$('.carousel').themestrapPluginCarousel()` safe regardless of how many matching elements exist.

##### Calling the adapter from init.js

The init system calls the adapter indirectly through `themestrap.fn.execPluginFunction(functionName, $this, opts)`, where `functionName` is the string `'themestrapPluginMyPlugin'`. This is why the jQuery method name must be passed as a string to `intObsInit` / `dynIntObsInit`.

## [Initialization Strategies](#init-strategies)

All auto-init happens in `themestrap.init.js`, which runs after DOMReady. The right strategy depends on whether the plugin needs its defaults merged at observation time and whether it can tolerate deferred init.

| Function                                   | Trigger                                                  | Defaults merge?                                                                | Best for                                                                                                                                  |
|--------------------------------------------|----------------------------------------------------------|--------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `intObsInit(sel, fn)`                      | Element enters viewport (rootMargin 200px)               | No — reads `data-plugin-options` only                                          | Simple plugins whose only configuration comes from `data-plugin-options`. e.g. Carousel, BeforeAfter, Lightbox.                           |
| `dynIntObsInit(sel, fn, defaults)`         | Element enters viewport (rootMargin derived from `accY`) | Yes — merges class defaults with per-element opts before creating the observer | Plugins where viewport entry offset (`accY`) or `forceInit` must be evaluated per-element. e.g. PluginAnimate, PluginCounter, PluginIcon. |
| `execOnceThroughEvent(sel, event, cb)`      | First occurrence of a DOM event (e.g. `mouseover`)       | No                                                                             | Heavy plugins that should only initialize on first interaction. e.g. PluginLightbox (deferred until hover).                               |
| `execOnceThroughWindowEvent(el, event, cb)` | First window event (e.g. `scroll`)                       | No                                                                             | Plugins that should wait until the user first scrolls. e.g. PluginSticky.                                                                 |
| `intObs(sel, fn, obsOpts, alwaysObserve)`  | IntersectionObserver with custom options                 | No                                                                             | When you need a custom `rootMargin`, a non-string callback, or repeat-on-intersect behavior.                                              |
| Direct `$(() => { $el.each(…) })`          | DOMReady                                                 | Manual                                                                         | Plugins that must run immediately regardless of viewport position. e.g. GDPR, Masonry, SectionScroll.                                     |

##### intObsInit — signature

```js
themestrap.fn.intObsInit(
    selector,     // CSS selector string — include :not(.manual) if needed
    functionName  // string: jQuery method name, e.g. 'themestrapPluginFoo'
);
```

##### dynIntObsInit — signature

```js
themestrap.fn.dynIntObsInit(
    selector,       // CSS selector string
    functionName,   // string: jQuery method name
    pluginDefaults  // MUST be the static: themestrap.PluginFoo.defaults
                    // NOT a local copy — dynIntObsInit reads forceInit and accY directly
);
```

> [!CAUTION]
> **Pass the live static reference.** <br>
> The third argument to `dynIntObsInit` must be `themestrap.PluginFoo.defaults` — not a local variable copy. The function reads `forceInit` and `accY` from it at observation time, after per-element options have been merged. A stale copy will cause incorrect rootMargin calculations.

##### getRootMargin — supported plugins

`dynIntObsInit` calls `themestrap.fn.getRootMargin(functionName, mergedDefaults)` to compute the IntersectionObserver's `rootMargin` from the merged `accY` value. For this to work, the plugin's jQuery method name must be listed in the switch statement inside `getRootMargin`. Add a case when creating a new plugin that uses `dynIntObsInit`.

getRootMargin switch — add a case for new dynIntObsInit plugins

```js
getRootMargin(plugin, {accY}) {
    switch (plugin) {
        case 'themestrapPluginCounter':
        case 'themestrapPluginAnimate':
        case 'themestrapPluginIcon':
        case 'themestrapPluginMyNewPlugin':   // ← add here
            return accY ? `0px 0px ${accY}px 0px` : '0px 0px 200px 0px';

        default:
            return '0px 0px 200px 0px';
    }
}
```

## [themestrap.fn Utilities](#fn-utilities)

All utility functions live on `themestrap.fn` and are available globally as long as `themestrap.js` has been loaded.

| Function                                    | Signature                              | Description                                                                                                                                                                                                                                                                  |
|---------------------------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `getOptions(opts)`                          | any -> object                           | Normalises plugin options. If `opts` is already an object, returns it as-is. If it's a string, parses it as JSON after converting single-quotes to double-quotes. Returns `{}` on error or if opts is falsy. Used internally by `intObsInit` to parse `data-plugin-options`. |
| `mergeOptions(obj1, obj2)`                  | (obj, obj) -> obj                       | Shallow merge of two objects. Used by `dynIntObsInit` to merge class defaults with per-element options before creating the observer. Unlike `$.extend`, this is a simple own-property copy loop.                                                                             |
| `intObsInit(sel, fn)`                       | (string, string) -> void                | Creates an IntersectionObserver (rootMargin `'200px'`) that calls the named jQuery plugin function once each matching element enters the viewport. Unobserves after first trigger.                                                                                           |
| `dynIntObsInit(sel, fn, defaults)`          | (string, string, object) -> void        | Per-element IntersectionObserver with rootMargin derived from merged defaults. Respects `forceInit`: when true, skips the observer entirely and calls the plugin immediately.                                                                                                |
| `intObs(sel, fn, obsOpts, alwaysObserve)`   | (string, fn\|string, obj, bool) -> void | Lower-level IntersectionObserver setup. Accepts custom `obsOpts` (merged with default `rootMargin: '0px 0px 200px 0px'`). If `alwaysObserve` is true, does not unobserve after intersection. Accepts a callback function or string function name.                            |
| `execPluginFunction(name, ctx, …args)`      | (string, jQuery, …) -> any              | Resolves a dot-separated function name string against a context object and calls it with the remaining arguments. Used internally by the init functions to call `$el.themestrapPluginFoo(opts)` by string name.                                                              |
| `execOnceThroughEvent($el, event, cb)`       | (jQuery, string, fn) -> this            | Binds a one-shot DOM event listener. On first fire, calls `cb.call($(this))`, sets a data flag, and unbinds itself. The `event` string becomes the data-name key (dots stripped).                                                                                            |
| `execOnceThroughWindowEvent($el, event, cb)` | (element, string, fn) -> this           | Same as above but the callback is called without a `this` context (plain function call). Used for window-level events like `scroll`.                                                                                                                                         |
| `getRootMargin(plugin, opts)`               | (string, obj) -> string                 | Returns an IntersectionObserver `rootMargin` CSS string based on the plugin name and merged `accY` value. Plugins not in the switch get the default `'0px 0px 200px 0px'`.                                                                                                   |
| `isElementInView($el)`                      | (jQuery) -> boolean                     | Returns true if the element's top edge is within the top third of the viewport. A quick synchronous visibility check for use inside plugin logic.                                                                                                                            |
| `getScripts(arr, path)`                     | (string\[], string?) -> Promise         | Loads an array of script files in parallel using `$.getScript`, returning a `$.when` Promise that resolves when all files have loaded. Useful for lazily loading third-party vendor scripts only when a plugin is instantiated.                                              |
| `showErrorMessage(title, content)`          | (string, string) -> void                | Displays a Bootstrap modal error dialog. Used by plugins to warn about missing dependencies (e.g. "Include twentytwenty.js"). Suppressed when `<html class="disable-local-warning">` is set — useful during local development.                                               |

## [Data Attribute System](#data-attrs)

##### Per-element options

Any element can override plugin defaults via a `data-plugin-options` attribute containing a JSON object. Use **single-quoted attribute, double-quoted JSON keys** — `themestrap.fn.getOptions` normalises it automatically.

```html
<div data-plugin-my-plugin
     data-plugin-options='{"loop": false, "delay": 300, "accY": -120}'>
    <!-- content -->
</div>
```

##### Trigger attributes

Most plugins are auto-detected by either a class (e.g. `.owl-carousel`) or a data attribute (e.g. `data-plugin-my-plugin`). The selector passed to the init function determines which pattern is used.

Selector patterns used in init.js

```js
// Class-based
themestrap.fn.intObsInit('.owl-carousel:not(.manual)', 'themestrapPluginCarousel');

// Data-attribute-based
themestrap.fn.intObsInit('[data-plugin-my-plugin]:not(.manual)', 'themestrapPluginMyPlugin');

// Both patterns combined
themestrap.fn.intObsInit('[data-plugin-countdown]:not(.manual), .countdown', 'themestrapPluginCountdown');
```

##### Per-element data attrs used by specific built-ins

| Attribute                        | Plugin                | Effect                                                                                                                                 |
|----------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `data-appear-animation`          | PluginAnimate         | CSS animation class to apply when element enters viewport (e.g. `fadeInUp`).                                                           |
| `data-appear-animation-delay`    | PluginAnimate         | Per-element animation delay in ms. Overrides the `delay` default.                                                                      |
| `data-appear-animation-duration` | PluginAnimate         | Per-element duration string (e.g. `1200ms`). Overrides the `duration` default.                                                         |
| `data-appear-animation-svg`      | PluginAnimate         | If present, the plugin searches inside the SVG for child elements with `data-appear-animation` and initializes each one independently. |
| `data-to`                        | PluginCounter         | Target number to count up to.                                                                                                          |
| `data-plugin-animated-letters`   | PluginAnimatedContent | Triggers letter-by-letter animated text on the element.                                                                                |
| `data-plugin-animated-words`     | PluginAnimatedContent | Triggers word-by-word animated text on the element.                                                                                    |

## [Manual Mode (.manual)](#manual)

Adding the `manual` class to any element prevents `themestrap.init.js` from auto-initialising it. You are then responsible for initialising it in your own JavaScript.

```html
<div class="owl-carousel manual" id="myCarousel">
    <!-- slides -->
</div>
```

Manual init — JavaScript

```js
$('#myCarousel').themestrapPluginCarousel({
    loop: false,
    autoplay: false,
    responsive: {
        0:    { items: 1 },
        768:  { items: 2 },
        1024: { items: 3 }
    }
});
```

> [!WARNING]
> **The `:not(.manual)` filter must appear in the selector string.**<br>
> Both the `init.js` selector guard AND the length-check selector (if used) must include `:not(.manual)`. If either is missing, manual elements will still be auto-initialized.

##### Carousel inside Bootstrap tabs

When an Owl Carousel is inside a Bootstrap tab and was initialized with `.manual` before its tab was shown, the carousel may not render correctly. Trigger a refresh after the tab becomes visible:

```js
$('[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
    const target = $($(e.target).attr('data-bs-target'));
    target.find('.owl-carousel').trigger('refresh.owl.carousel');
});
```

## [Accessing Plugin Instances](#instances)

Since `setData()` stores the instance on the element using jQuery's data store, you can retrieve it at any time after initialization:

```js
// Retrieve an existing instance
const instance = $('#myElement').data('__myPlugin');

// Call a public method
instance.build();
instance.destroy();

// Check whether the plugin has been initialized
if ($('#myElement').data('__myPlugin')) {
    console.log('Plugin is active');
}
```

The `instanceName` is private to each plugin's IIFE, so you must know the string to retrieve the instance. By convention it's `'__' + camelCasePluginName` — e.g. `'__animate'`, `'__carouselLight'`, `'__animatedContent'`.

##### `data-reinit-plugin` mechanism

Themestrap provides a declarative re-init button pattern for widgets that need to be destroyed and rebuilt (e.g. after a filter changes visible items).

```html
<button
  data-reinit-plugin="__myPlugin"
  data-reinit-plugin-function="themestrapPluginMyPlugin"
  data-reinit-plugin-element="#myElement"
  data-reinit-plugin-options='{"loop": false}'
>
  Reinitialize
</button>
```

When clicked, the built-in handler calls `$('#myElement').data('__myPlugin').destroy()` then `$('#myElement').themestrapPluginMyPlugin({ loop: false })`. The plugin **must implement `destroy()`** for this to work.

## [Complete Plugin Skeleton](#skeleton)

Copy and paste this template as the starting point for any new Themestrap plugin. Replace every occurrence of `MyPlugin` / `myPlugin` with your plugin name.

themestrap.js — add inside the file, after the last existing plugin block

```js
/**
 * Themestrap MyPlugin Plugin
 * Short, concise description of this plugin.
 *
 * Part of the Themestrap component library.
 * https://github.com/daemondevin/Themestrap
 *
 * Markup anatomy
 *   <!-- Plugin root element -->
 *   <div id="myElement" class=""
 *        data-plugin-myplugin
 *        data-plugin-options='{"option":"value","param":true}'>
 *
 *     <!-- Anything else -->
 *     <div data-myplugin-child>
 *
 *       <span>MyPlugin</span>
 *
 *     </div>
 *
 *   </div>
 *
 * Options
 *
 *   option            "this"|"that"   what this option does      "default"
 *   param             boolean         switch this param on/off   true
 *
 * Public API 
 *
 *   // Retrieve an existing instance
 *   const instance = $('#myElement').data('__myPlugin');
 *    
 *   // Call a public method
 *   instance.build();
 *   instance.destroy();
 *    
 *   // Check whether the plugin has been initialized
 *   if ($('#myElement').data('__myPlugin')) {
 *       console.log('Plugin is active');
 *   }
 *
 * Events
 *
 *   myplugin.destroy   fired on [data-plugin-myplugin] after destroy()
 *   myplugin.rebuild   fired on [data-plugin-myplugin] after build()
 *
 *   Both events carry { detail: { index, instance } }
 *
 * Init.js wiring 
 *
 *   if ($.isFunction($.fn['themestrapPluginMyPlugin']) && $('[data-plugin-my-plugin]').length) {
 *       themestrap.fn.dynIntObsInit('[data-plugin-my-plugin]:not(.manual)', 'themestrapPluginMyPlugin', themestrap.PluginMyPlugin.defaults);
 *   }
 */
// My Plugin
(((themestrap = {}, $) => {
 
    const instanceName = '__myPlugin';
    
    // MyPlugin stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use this plugin.
    const STYLE_ID = 'ts-myplugin-styles';
    const CSS_TEXT = ``;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()). Keeps the CSS out of pages that merely load the script.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginMyPlugin {
 
        constructor($el, opts) {
            return this.initialize($el, opts);
        }
 
        initialize($el, opts) {
            // Re-init guard — bail if already initialized on this element
            if ($el.data(instanceName)) {
                return this;
            }
 
            this.$el = $el;
 
            // Store original HTML if destroy() needs to restore it
            this.initialHTML = $el.html();
 
            this
                .setData()
                .setOptions(opts)
                .build()
                .events();   // remove this line if no custom events needed
 
            return this;
        }
 
        setData() {
            this.$el.data(instanceName, this);
            return this;
        }
 
        setOptions(opts) {
            this.options = $.extend(true, {}, PluginMyPlugin.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }
 
        build() {
            const self = this;
            
            injectCSS();
 
            // Optional: skip below minimum viewport width
            if ($(window).width() < self.options.minWindowWidth) {
                return this;
            }
 
            // Your implementation here 
            self.options.wrapper.addClass('my-plugin-active');
 
            return this;
        }
 
        destroy() {
            const self = this;
 
            // Restore original state
            self.$el
                .html(self.initialHTML)
                .removeClass('my-plugin-active');
 
            // Clear the instance reference so the element can be reinitialized
            self.$el.removeData(instanceName);
 
            return this;
        }
 
        events() {
            const self = this;
 
            self.$el.on('myplugin.destroy', () => { self.destroy(); });
            self.$el.on('myplugin.rebuild', () => { self.build(); });
 
            return this;
        }
 
    }
 
    PluginMyPlugin.defaults = {
        accX: 0,
        accY: -80,            // viewport lookahead offset for dynIntObsInit
        delay: 0,
        minWindowWidth: 0,
        forceInit: false      // set true to skip IntersectionObserver
    };
 
    // Expose on namespace (required by init.js)
    $.extend(themestrap, { PluginMyPlugin });
 
    // jQuery adapter
    $.fn.themestrapPluginMyPlugin = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginMyPlugin($this, opts);
            }
        });
    };
 
})).apply(this, [window.themestrap, jQuery]);
```

## [Init.js Wiring](#init-wiring)

Once the plugin class exists in `themestrap.js`, add a wiring block to `themestrap.init.js`. Every block follows the same guard-then-init structure.

themestrap.init.js — choose the appropriate strategy

```
// Option A: intObsInit (simple, no defaults merge) 
if ($.isFunction($.fn['themestrapPluginMyPlugin'])
        && $('[data-plugin-my-plugin]').length) {
    themestrap.fn.intObsInit(
        '[data-plugin-my-plugin]:not(.manual)',
        'themestrapPluginMyPlugin'
    );
}

// Option B: dynIntObsInit (defaults merge, accY/forceInit support) 
if ($.isFunction($.fn['themestrapPluginMyPlugin'])
        && $('[data-plugin-my-plugin]').length) {
    themestrap.fn.dynIntObsInit(
        '[data-plugin-my-plugin]:not(.manual)',
        'themestrapPluginMyPlugin',
        themestrap.PluginMyPlugin.defaults   // live static reference!
    );
}

// Option C: DOMReady (must run immediately, no observer)
if ($.isFunction($.fn['themestrapPluginMyPlugin'])
        && $('[data-plugin-my-plugin]').length) {
    $(() => {
        $('[data-plugin-my-plugin]:not(.manual)').each(function() {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options'));
            $this.themestrapPluginMyPlugin(opts);
        });
    });
}

// Option D: event-lazy (init on first interaction) 
if ($.isFunction($.fn['themestrapPluginMyPlugin'])
        && $('[data-plugin-my-plugin]').length) {
    themestrap.fn.execOnceTroughEvent(
        '[data-plugin-my-plugin]:not(.manual)',
        'mouseover.trigger.myplugin',
        function() {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options'));
            $this.themestrapPluginMyPlugin(opts);
        }
    );
}
```

> [!TIP]
> **Always guard with `$.isFunction($.fn[…])`.**<br>
> Plugin files are loaded conditionally depending on the page. The guard prevents init.js from crashing on pages that don't include the plugin's script file.

## [Extending Existing Plugins](#extending)

There are three common extension patterns, each appropriate for different scenarios.

##### 1. Override defaults globally

The simplest extension: change the default value for every instance on the page, without modifying the source file.

```js
// In your own JS file, after themestrap.js loads:
themestrap.PluginAnimate.defaults.delay = 200;
themestrap.PluginAnimate.defaults.accY = -100;
```

##### 2. Subclass a plugin

Create a derived class that inherits all methods and only overrides what you need. Register a new jQuery method and namespace entry so it can be used independently.

```js
(((themestrap = {}, $) => {

    const instanceName = '__myAnimateExtended';

    class PluginMyAnimateExtended extends themestrap.PluginAnimate {

        build() {
            // Run the parent build first, then add extra behavior
            super.build();
            this.options.wrapper.on('animation:show', () => {
                console.log('Element animated:', this.$el);
            });
            return this;
        }

    }

    PluginMyAnimateExtended.defaults = {
        ...themestrap.PluginAnimate.defaults,
        delay: 0    // override one default
    };

    $.extend(themestrap, { PluginMyAnimateExtended });

    $.fn.themestrapPluginMyAnimateExtended = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) return $this.data(instanceName);
            return new PluginMyAnimateExtended($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
```

##### 3. Monkey-patch a single method

For quick ad-hoc changes without subclassing. Wrap the original method and call it from inside your replacement.

```js
const _originalBuild = themestrap.PluginCarousel.prototype.build;

themestrap.PluginCarousel.prototype.build = function() {
    // Custom pre-build logic
    this.options.wrapper.addClass('carousel-loading');

    // Call original
    _originalBuild.call(this);

    // Custom post-build logic
    this.options.wrapper.removeClass('carousel-loading');

    return this;
};
```

> [!WARNING]
> **Monkey-patches apply globally.** <br>
> Every new instance of that plugin on the page will use the patched method. Use subclassing if you only want to modify behavior on specific elements.

## [Common Pitfalls](#pitfalls)

##### Plugin initializes twice / instance state is lost

The re-init guard at the top of `initialize()` reads `$el.data(instanceName)`. If `setData()` was never called (e.g. because an earlier call returned early before reaching it), the guard never fires. Always call `setData()` as the very first method in the chain — before any conditional early-returns in `setOptions` or `build`.

##### Options not applying / always using defaults

`setOptions` merges in order: `defaults -> opts -> { wrapper }`. If you accidentally put a real option key in the forced override object (the third argument to `$.extend`), it will always win and can never be overridden. Never put anything other than `wrapper: this.$el` in the third argument.

##### dynIntObsInit not triggering / wrong rootMargin

The third argument to `dynIntObsInit` must be the live static `themestrap.PluginFoo.defaults` object — not a local copy. If you also want custom `accY` handling, add a case to the `getRootMargin` switch statement.

##### .manual elements still auto-initialising

The `:not(.manual)` filter must appear in the selector string passed to `intObsInit` / `dynIntObsInit`, not just in a separate `.length` guard check. Both places need it:

`themestrap.fn.intObsInit('.my-widget:not(.manual)', 'themestrapPluginFoo');`

##### Carousel inside a Bootstrap tab doesn't display

The `shown.bs.tab` handler in `themestrap.js` fires `refresh.owl.carousel` on Owl Carousels inside newly-shown tabs. If the carousel was initialized with `.manual` before its tab was shown, the carousel hasn't registered for that event yet. Trigger the refresh manually:

`$('#myCarousel').trigger('refresh.owl.carousel');`

##### GSAP-dependent features failing in local file:// dev

Features like Thumb Info Floating Caption require GSAP. When run from a `file://` origin, `themestrap.fn.showErrorMessage` fires a modal. Suppress it during development by adding `class="disable-local-warning"` to the `<html>` element.

##### destroy() not re-enabling init guard after calling removeData

If your `destroy()` implementation calls `self.$el.removeData(instanceName)`, the element can be fully re-initialized by the jQuery adapter on the next call. If you *don't* call `removeData`, the re-init guard will still fire and the jQuery adapter will return the old (destroyed) instance. Choose your strategy deliberately: remove the data key if re-init should create a fresh instance; keep it if you want a destroyed plugin to remain inaccessible.

### **Quick diagnostic checklist**

> - Is `themestrap.js` loading *before* `themestrap.init.js`?
> - Is the plugin's script file included on this page?
> - Does the `$.isFunction($.fn['themestrapPlugin…'])` guard in init.js pass?
> - Does the element match the selector (including any `:not(.manual)`)?
> - Has `setData()` been called before any early-return in the chain?
> - Is the third arg to `dynIntObsInit` the live static `themestrap.PluginFoo.defaults`?
> - Does the plugin name appear in the `getRootMargin` switch (if using `dynIntObsInit`)?
> - Does the plugin implement `destroy()` if used with `data-reinit-plugin`?
