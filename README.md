# Themestrap

> A zero-build JavaScript component system using jQuery and Bootstrap.

[![jQuery](https://img.shields.io/badge/jQuery-3.x%2F4.x-0769AD?style=flat-square)](https://jquery.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=flat-square)](https://getbootstrap.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

---

## What It Is

Themestrap is a rich UI component set available without a build pipeline. No Webpack, no npm, no compilation step. Every component is a self-contained jQuery plugin that:

- Lazy-initializes via `IntersectionObserver` — only activates when the element enters the viewport
- Lazy-injects its own CSS the first time it runs — no separate stylesheet to enqueue
- Exposes a full `destroy()` method for clean teardown and re-init
- Reads configuration from `data-plugin-options` attributes — no JavaScript required for basic use

All plugins share the `window.themestrap` namespace and load through two files: `themestrap.js` (all plugin class definitions) and `themestrap.init.js` (auto-wiring via IntersectionObserver).

---

## Plugin Architecture

Every plugin follows a strict five-stage lifecycle:

`initialize -> setData -> setOptions -> build -> events`

### File & naming conventions

| Convention | Pattern |
|---|---|
| Filename | `themestrap.plugin.{name}.js` |
| IIFE shape | Triple-paren `(function($, window, document, undefined) { ... }(jQuery, window, document))` |
| jQuery method | `$.fn.themestrapPlugin{Name}` |
| Instance key | `__plugin{Name}` (stored via `$el.data()`) |
| CSS injection | Lazy, from `build()`, guarded by a `STYLE_ID` check |
| Mutual exclusion events | Hyphen-separated: `ts-popover-opened`, `ts-dialog-opened` |

### Basic usage

```html
<!-- Auto-init: just add the data attribute -->
<div data-plugin-accordion data-plugin-options='{"speed": 300}'></div>

<!-- Manual init -->
<div id="my-accordion"></div>
<script>
  $('#my-accordion').themestrapPluginAccordion({ speed: 300 });
</script>

<!-- Access the instance -->
<script>
  const instance = $('#my-accordion').data('__pluginAccordion');
  instance.destroy();
</script>
```

### Init strategies

Plugins use one of four initialization strategies depending on their needs:

| Strategy | Function | Use when |
|---|---|---|
| Simple lazy | `intObsInit(sel, fn)` | Plugin reads only `data-plugin-options`; no defaults merging |
| Defaults merging | `dynIntObsInit(sel, fn, defaults)` | Plugin has a `.defaults` static property |
| Interaction-lazy | `execOnceThroughEvent(sel, event, cb)` | Defer init until first hover/focus (e.g. lightbox) |
| Immediate | `$().each()` in `$(() => {})` | Must run on DOMReady regardless of viewport |

---

## Module Loader

The Module Loader (`themestrap.loader.js` + `themestrap.modules.js`) adds lazy *fetching* on top of the framework's lazy *initialization*. Rather than bundling all plugins and their vendor dependencies into every page, each component declares what it needs via a `data-module` attribute and the loader resolves, fetches, and activates only what that page actually uses.

### Load order

`themestrap.js -> themestrap.loader.js -> themestrap.modules.js -> your page declares data-module`

### How it works

On DOM ready the manifest calls `loader.scan()`, which:

1. **Scans**: collects every `data-module` value on the page
2. **Resolves**: walks each module's `deps` graph depth-first; shared vendor libraries are fetched only once
3. **Fetches**: loads CSS and JS in dependency order with `cache: true` so returning visitors hit the browser cache
4. **Activates**: runs the same `intObsInit` / `dynIntObsInit` / event wiring that `themestrap.init.js` uses, so a plugin fetched after DOM ready still gets its IntersectionObserver

> **One owner per plugin.** If the loader manages a plugin, that plugin must not also be statically included or wired in `themestrap.init.js`. Two owners means two init passes.

### Quick start

**1. Declare it in `themestrap.modules.js`:**

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
    src:      'components/themestrap.plugin.carousel.js',
    deps:     ['owl'],
    selector: '[data-plugin-carousel]',
    method:   'themestrapPluginCarousel',
    strategy: 'intObs'
  });

$(() => loader.scan());
```

**2. Declare the need in markup:**

```html
<div data-module="carousel"
     data-plugin-carousel
     data-plugin-options='{"loop": true, "items": 3}'>
  <!-- slides -->
</div>
```

A page without that element fetches none of it.

### Loader API

| Method | Signature | Purpose |
|---|---|---|
| `define` | `(name, {src, css, deps, init})` | Register any module: JS file, CSS file, dependencies, and/or an `init` callback |
| `definePlugin` | `(name, cfg)` | Register a Themestrap `$.fn` plugin; generates `init` to run the framework's lazy-init wiring |
| `require` | `([names])` -> promise | Resolve, fetch, and activate named modules after DOM ready |
| `load` | `(name)` -> promise | Load one module and its deps, once; in-flight is shared |
| `scan` | `(context = document)` | Find every `[data-module]` in `context` and `require()` them |
| `on` / `emit` | `(event, fn)` / `(event, data)` | Tiny event bus; emits `loaded:<name>` as each module settles |

### Activation strategies

`definePlugin`'s `strategy` field mirrors the wiring in `themestrap.init.js`:

| Strategy | Maps to | Use for | Extra field |
|---|---|---|---|
| `intObs` *(default)* | `intObsInit(sel, method)` | Most plugins — init when element nears viewport | — |
| `dynIntObs` | `dynIntObsInit(sel, method, defaults)` | Plugins whose defaults carry `accY` / `forceInit` | `defaultsClass` |
| `event` | `execOnceThroughEvent(...)` | Defer until a user event (e.g. lightbox on hover) | `event` |

### Loading AJAX-injected content

```js
$.get(url, html => {
  const $frag = $(html).appendTo('#results');
  themestrap.loader().scan($frag[0]); // fetch + activate only what arrived
});
```

### When to use it

Reach for the loader when a plugin depends on a heavy vendor library (Isotope, Owl Carousel, Slider Revolution) that most pages never use, or when you ship separate-file plugins rather than one concatenated bundle. Skip it when the plugin is part of your always-loaded core bundle or its library is needed above the fold on nearly every page.

### Vendor dependency map

Some plugins depend on a third-party libraries:

| Vendor library | Module name | Plugins |
|---|---|---|
| Owl Carousel | `owl` | carousel |
| touchSwipe | `touchswipe` | carouselLight *(opt)* |
| twentytwenty + event.move | `twentytwenty` | beforeAfter |
| Magnific Popup | `magnific-popup` | lightbox |
| Isotope | `isotope` | masonry, sort |
| waitForImages | `waitforimages` | beforeAfter, masonry, sort |
| easyPieChart | `easypiechart` | chartCircular |
| The Final Countdown | `jquery-countdown` | countdown |
| countTo | `countto` | counter |
| jquery.visible | `jquery-visible` | floatElement, parallax, icon, nav |
| jquery.cookie | `jquery-cookie` | gdpr, gdprWrapper |
| Vivus | `vivus` | icon |
| observe-element-in-viewport | `observe-element-in-viewport` | inViewportStyle |
| vide | `vide` | videoBackground |
| hover3d | `hover3d` | hoverEffect *(opt)* |
| jquery.matchHeight | `matchheight` | matchHeight |
| jquery.easing | `jquery-easing` | progressBar, sectionScroll, scrollToTop, nav |
| nanoScrollerJS | `nanoscroller` | scrollable |
| jquery.pin | `jquery-pin` | sticky |
| jquery-validation | `jquery-validation` | validation, newsletter, search |
| Slider Revolution | `rs-plugin` | revolutionSlider |

### Self-contained plugins

Most of the components need no third-party library; they inject their own CSS and use only jQuery, Bootstrap, or vanilla APIs. Register them with `definePlugin` only if you also want lazy *fetching*; they have no `deps`:

---

## Components

### UI Plugins

| Plugin | jQuery Method | Description |
|---|---|---|
| **Accordion** | `themestrapPluginAccordion` | Animated expand/collapse panels |
| **BeforeAfter** | `themestrapPluginBeforeAfter` | Drag-to-reveal image comparison slider |
| **Carousel** | `themestrapPluginCarousel` | Owl Carousel wrapper with responsive breakpoints |
| **CodeRail** | `themestrapPluginCodeRail` | Floating sticky code snippet rail |
| **CodeWindow** | `themestrapPluginCodeWindow` | Styled terminal / code window display |
| **CommandMenu** | `themestrapPluginCommandMenu` | Keyboard-driven command palette (`⌘K`) |
| **Collapsible** | `themestrapPluginCollapsible` | Generic collapsible content regions |
| **Counter** | `themestrapPluginCounter` | Animated number counter with easing |
| **DarkMode** | `themestrapPluginDarkMode` | System-aware dark/light mode toggle |
| **Dialog** | `themestrapPluginDialog` | Accessible modal dialog with focus trap |
| **Highlight** | `themestrapPluginHighlight` | Syntax highlighting for code blocks |
| **Masonry** | `themestrapPluginMasonry` | CSS/JS masonry grid layout |
| **Navbar** | `themestrapPluginNavbar` | Sticky, scroll-aware navigation bar |
| **NavMenu** | `themestrapPluginNavMenu` | Mega-menu / flyout navigation |
| **PanelNav** | `themestrapPluginPanelNav` | Sliding panel navigation |
| **Popover** | `themestrapPluginPopover` | Portal-mode popovers with dark mode and mutual exclusion |
| **Scroller** | `themestrapPluginScroller` | Custom scrollbar / scroll container |
| **ScrollFx** | `themestrapPluginScrollFx` | Scroll-driven entrance animation effects |
| **ScrollShadow** | `themestrapPluginScrollShadow` | Dynamic shadow applied on scroll |
| **SideNav** | `themestrapPluginSideNav` | Off-canvas side navigation drawer |
| **Toast** | `themestrapPluginToast` | Notification toasts with auto-dismiss |
| **VerticalNav** | `themestrapPluginVerticalNav` | Vertical tree navigation with sub-levels |

---

## Configuration

### Data attributes

```html
<div
  data-plugin-carousel
  data-plugin-options='{"loop": true, "autoplay": true, "autoplayTimeout": 5000}'
></div>
```

Options are read and merged over the plugin's `.defaults`. Single-quoted attribute, double-quoted JSON keys.

### Opt out of auto-init

Add the `.manual` class to prevent `themestrap.init.js` from auto-initializing an element:

```html
<div class="owl-carousel manual" id="my-carousel"></div>
<script>
  $('#my-carousel').themestrapPluginCarousel({ loop: false });
</script>
```

### Re-init a plugin

```html
<button
  data-reinit-plugin="__pluginCarousel"
  data-reinit-plugin-function="themestrapPluginCarousel"
  data-reinit-plugin-element="#my-carousel"
  data-reinit-plugin-options='{"loop": false}'
>Reinit</button>
```

Requires the plugin to implement `destroy()`.

---

## Current Status

### What's Here

- 23 UI plugins
- IntersectionObserver lazy-init pipeline (`themestrap.init.js`)
- Module Loader (`themestrap.loader.js` + `themestrap.modules.js`) with full vendor dependency map
- Full `destroy()` / re-init support on all plugins

### On the Horizon
- Integration with [**MODX Revolution**](https://modx.com/). Will include dedicated snippets and chunks for almost every component. 
- **jQuery 4 compatibility** — A `themestrap.component.js` base class with auto-tracked teardown, reactive `setState()`, and a `defineComponent()` factory was designed and prototyped. A few plugins have been migrated as a proof of concept; broader rollout is pending.

---

## License

MIT
