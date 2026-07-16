Themestrap · JS Infrastructure

# Module *Loader*

A dependency-aware loader that decides which plugin and vendor files reach a page, resolves their order, fetches each once, then runs the framework's own init wiring so the plugin activates.

> `themestrap.js` -> `themestrap.loader.js` -> `themestrap.modules.js` -> your page declares `data-module`

## Overview

Themestrap ships a bunch of component plugins and a dozens of third-party libraries. Loading all of them on every page is wasteful; tracking which page needs which by hand is error-prone. The Module Loader moves that decision into the page itself.

A component declares what it needs with a single `data-module` attribute. On DOM ready the loader scans the page, resolves each module's dependency graph, fetches the missing files in order (keeping the browser cache), and then activates the plugin exactly the way `themestrap.init.js` would — through `intObsInit` / `dynIntObsInit` or an event trigger.

The result: every page pulls only the JavaScript and CSS its content actually uses, and nothing has to be wired up twice.

## When to use it

Themestrap already initializes lazily — `init.js` uses an `IntersectionObserver` so a plugin only runs when its element scrolls near the viewport. The loader adds the layer below that: lazy *fetching*. It earns its place in specific situations.

### Reach for it when

- A plugin depends on a **heavy vendor library** — Slider Revolution, Isotope, Owl Carousel — that most pages never use.
- You ship **optional, separate-file plugins** rather than one concatenated bundle.
- Component markup is assembled by MODX and you want each chunk to **carry its own dependency** instead of a global script list.

### Skip it when

- The plugin is part of your always-loaded core bundle — the loader would only re-resolve something already present.
- A library is needed above the fold on nearly every page; just include it normally.

The loader manages lazy **fetching**; the framework still manages lazy **initialization**. They compose — the loader hands a freshly fetched plugin straight to the same observer wiring.

## Install &amp; load order

Three files, in this order. The loader needs `themestrap.js` (for `themestrap.fn` and jQuery); the manifest needs the loader.

template · before &lt;/body&gt;copyhtml

```
<!-- 1 · framework core (defines themestrap.fn, requires jQuery) -->
<script src="/js/themestrap.js"></script>

<!-- 2 · the loader engine -->
<script src="/js/themestrap.loader.js"></script>

<!-- 3 · the manifest: defines every module + calls loader.scan() -->
<script src="/js/themestrap.modules.js"></script>
```

## How it works

On DOM ready the manifest calls `loader.scan()`. From there the flow is:

1. **Scan.** Collect every `data-module` value on the page (read via `attr()`, not `data()`, so numeric-looking names aren't coerced).
2. **Resolve.** For each module, walk its `deps` graph depth-first. A vendor library shared by several plugins is fetched once.
3. **Fetch.** Load CSS and JS for each module in dependency order. Scripts use `cache:true`, so a returning visitor pulls from the browser cache instead of re-downloading.
4. **Activate.** Once a plugin's file is in, run the same guarded `intObsInit` / `dynIntObsInit` / event wiring `init.js` uses — so a plugin fetched after DOM ready still gets its observer.

Because the loader owns activation, a plugin it manages must **not** also be static-included or wired in `init.js` — that would initialize it twice. See [Rules &amp; gotchas](#rules--gotchas).

## Quick start

Define a vendor library and the plugin that needs it, then drop an element that declares the module. Two files touch this; the page does the rest.

### 1 · Declare it in the manifest

themestrap.modules.js

```js
const loader = themestrap.loader({
  basePath: '/assets/components/themestrap/js/',
  mode: document.documentElement.dataset.env === 'prod' ? 'prod' : 'dev'
});

loader
  .define('owl', {
    src: 'vendor/owl.carousel/js/owl.carousel.min.js',
    css: 'vendor/owl.carousel/css/owl.carousel.min.css'
  })
  .definePlugin('carousel', {
    src: 'components/themestrap.plugin.carousel.js',
    deps: ['owl'],
    selector: '[data-plugin-carousel]',
    method: 'themestrapPluginCarousel',
    strategy: 'intObs'
  });

$(() => loader.scan());
```

### 2 · Declare the need in markup

```html
<!-- data-module = what to fetch · data-plugin-carousel = what init binds to -->
<div data-module="carousel"
     data-plugin-carousel
     data-plugin-options='{"loop": true, "items": 3}'>
  <!-- slides -->
</div>
```

When this page loads, the scanner sees `carousel`, fetches Owl's CSS + JS then the plugin, and binds the observer to `[data-plugin-carousel]`. A page without that element fetches none of it.

## Loader API

Get the singleton with `themestrap.loader(opts)`. The first call sets options; later calls return the same instance.

| Method         | Signature                        | Purpose                                                                                                                       |
|----------------|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `define`       | `(name, {src, css, deps, init})` | Register any module: a JS file, a CSS file, dependencies, and/or an `init` callback run after it loads.                       |
| `definePlugin` | `(name, cfg)`                    | Register a Themestrap `$.fn` plugin. Generates `init` to run the framework's lazy-init wiring. See [strategies](#strategies). |
| `require`      | `([names])` -> promise            | Resolve, fetch and activate the named modules, settling after DOM ready.                                                      |
| `load`         | `(name)` -> promise               | Load one module and its deps, once. Shared in-flight; cleared on failure so it can retry.                                     |
| `scan`         | `(context = document)`           | Find every `[data-module]` in `context` and `require()` them. Pass a subtree for AJAX-injected content.                       |
| `on` / `emit`  | `(event, fn)` / `(event, data)`  | Tiny event bus. The loader emits `loaded:<name>` as each module settles.                                                      |

### Loading content injected after page load

Call `scan()` with the new subtree so its modules resolve without re-processing the whole document:

ajax callback

```js
$.get(url, html => {
  const $frag = $(html).appendTo('#results');
  themestrap.loader().scan($frag[0]);   // fetch + activate only what arrived
});
```

## Activation strategies

`definePlugin` mirrors the wiring in `themestrap.init.js`. The `strategy` field picks how the plugin binds once its file has loaded.

| Strategy         | Maps to                                | Use for                                                  | Extra field     |
|------------------|----------------------------------------|----------------------------------------------------------|-----------------|
| `intObs` default | `intObsInit(sel, method)`              | Most plugins — init when the element nears the viewport. | —               |
| `dynIntObs`      | `dynIntObsInit(sel, method, defaults)` | Plugins whose defaults carry `accY` / `forceInit`.       | `defaultsClass` |
| `event`          | `execOnceThroughEvent(...)`            | Defer until a user event (e.g. lightbox on hover).       | `event`         |

The config fields in full:

definePlugin · config

```js
loader.definePlugin('chartCircular', {
  src:           'components/themestrap.plugin.chartcircular.js',
  deps:          ['easypiechart'],          // vendor modules to fetch first
  selector:      '[data-plugin-chart-circular]', // what init binds to
  method:        'themestrapPluginChartCircular',  // the $.fn.* method
  strategy:      'dynIntObs',             // reads accY off the class defaults
  defaultsClass: 'PluginChartCircular',    // required for dynIntObs
  // manual: false  -> opt out of the :not(.manual) guard (default true)
  // css:    '...'  -> a stylesheet to load alongside the script
  // init:   fn     -> extra setup, run after activation
});
```

For `dynIntObs`, the loader passes the class's **live** static `defaults` object (not a copy) — `dynIntObsInit` reads `forceInit` and `accY` straight off it.

## Object-style plugins

A handful of components don't expose a `$.fn` selector plugin. They initialize as objects — `themestrap.Nav.initialize()`, `themestrap.Search.initialize()`, and so on. These use plain `define()` with an `init` callback instead of `definePlugin`.

object-style modules

```js
loader
  .define('search', {          // $.fn.validate · themestrap.Search.initialize
    src: 'components/themestrap.plugin.search.js',
    deps: ['jquery-validation'],
    init: () => themestrap.Search.initialize()
  })
  .define('nav', {             // jquery.visible + jquery.easing · themestrap.Nav.initialize
    src: 'components/themestrap.plugin.nav.js',
    deps: ['jquery-visible', 'jquery-easing'],
    init: () => themestrap.Nav.initialize()
  });
```

`load()` already runs `mod.init` after the script and CSS resolve, so `define()` + `init` works out of the box. Tag the relevant container (`#searchForm`, `#mainNav`, …) with `data-module` so `scan()` picks it up.

## The manifest

`themestrap.modules.js` is the one place that knows the dependency map. It has four parts: loader options, vendor module definitions, plugin definitions, and the closing `scan()` call.

themestrap.modules.js · shape

```js
(function ($) {
  const loader = themestrap.loader({ basePath: '…', mode: '…' });

  // 1 · vendor modules — the third-party libs
  loader.define('isotope',      { src: 'vendor/isotope/js/isotope.pkgd.min.js' })
        .define('waitforimages',{ src: 'vendor/waitforimages/js/jquery.waitforimages.js' });

  // 2 · $.fn plugins -> definePlugin
  loader.definePlugin('masonry', {
    src: 'components/themestrap.plugin.masonry.js',
    deps: ['isotope', 'waitforimages'],
    selector: '[data-plugin-masonry]', method: 'themestrapPluginMasonry', strategy: 'intObs'
  });

  // 3 · object-style plugins -> define() + init  (see §08)

  // 4 · auto-load whatever the page declares
  $(() => loader.scan());
})(jQuery);
```

A vendor library used by several plugins is defined once and listed in each plugin's `deps`; the loader de-duplicates the fetch.

## Vendor dependencies

Every component was scanned for the library it actually calls — its `$.isFunction($.fn.X)` guard or direct vendor method. Twenty-six plugins depend on a third-party library across twenty-two libs.

| Vendor library              | Module name                   | Plugins that need it                         |
|-----------------------------|-------------------------------|----------------------------------------------|
| Owl Carousel                | `owl`                         | carousel                                     |
| touchSwipe                  | `touchswipe`                  | carouselLight opt                            |
| twentytwenty + event.move   | `twentytwenty`                | beforeAfter                                  |
| Magnific Popup              | `magnific-popup`              | lightbox                                     |
| Isotope                     | `isotope`                     | masonry, sort                                |
| waitForImages               | `waitforimages`               | beforeAfter, masonry, sort                   |
| easyPieChart                | `easypiechart`                | chartCircular                                |
| The Final Countdown         | `jquery-countdown`            | countdown                                    |
| countTo                     | `countto`                     | counter                                      |
| jquery.visible              | `jquery-visible`              | floatElement, parallax, icon, nav            |
| jquery.cookie               | `jquery-cookie`               | gdpr, gdprWrapper                            |
| Vivus                       | `vivus`                       | icon                                         |
| observe-element-in-viewport | `observe-element-in-viewport` | inViewportStyle                              |
| vide                        | `vide`                        | videoBackground                              |
| hover3d                     | `hover3d`                     | hoverEffect opt                              |
| jquery.matchHeight          | `matchheight`                 | matchHeight                                  |
| jquery.easing               | `jquery-easing`               | progressBar, sectionScroll, scrollToTop, nav |
| nanoScrollerJS              | `nanoscroller`                | scrollable                                   |
| jquery.pin                  | `jquery-pin`                  | sticky                                       |
| jquery-validation           | `jquery-validation`           | validation, newsletter, search               |
| Slider Revolution           | `rs-plugin`                   | revolutionSlider                             |

*opt* marks an optional dependency — `carouselLight` needs touchSwipe only when `swipeEvents` is on; `hoverEffect` needs hover3d only for the `3d` effect (its `magnetic` effect is vanilla).

Library identity is confirmed from source. The `vendor/<lib>/…` file **paths** follow the convention in `PluginBeforeAfter`'s error message and should be checked against your real `vendor/` folder. If `jquery-visible` or `waitforimages` already lives in your core bundle, drop it from the `deps` arrays.

## Rules &amp; gotchas

### One owner per plugin

If the loader manages a plugin, that plugin's file must not also be statically included or wired in `themestrap.init.js`. Two owners means two init passes. Pick one: bundle it the old way, or hand it to the loader.

### Shared libraries

`jquery-visible` (four plugins) and `waitforimages` (three) are fetched once and reused. If either is already in your core bundle, remove it from the relevant `deps` so the loader doesn't define a module nothing fetches.

### Production filenames

With `mode: 'prod'` the loader rewrites `.js` to `.min.js` on fetch. Keep source and minified files side by side, or override per-module by pointing `src` straight at the minified file.

### Verify selectors against `init.js`

Each plugin's `selector` and `strategy` mirror the wiring in `themestrap.init.js`.

The loader fetches with `cache:true` on purpose. `$.getScript` and `themestrap.fn.getScripts` force `cache:false` and re-download on every page which would defeat the point of loading lazily.

## Self-contained plugins

Most components need no third-party library — they inject their own CSS and use only jQuery, Bootstrap, or vanilla APIs. Register them with `definePlugin` only if you also want lazy *fetching*; they have no `deps`.

### Already self-initializing

These wire themselves at file load — the loader doesn't need to activate them:

loadingOverlay -> \[data-loading-overlay] scrollFx -> .js-scroll-fx

### Intra-framework, not vendor

A few plugins depend on *other Themestrap plugins* rather than third-party libs: 
> - `animatedContent -> PluginAnimate`
> - `auth -> PluginToast`
> - `codewindow -> PluginHighlight`
> - `coderail -> codewindow / highlight`
> - `highlight` self-loads highlight.js from a CDN via dynamic `import()`, so it needs no loader-managed vendor module.

