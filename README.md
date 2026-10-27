# Themestrap

[![jQuery](https://img.shields.io/badge/jQuery-3.x%2F4.x-0769AD?style=flat-square)](https://jquery.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=flat-square)](https://getbootstrap.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

---

## What It Is

Themestrap is a collection of reusable modular UI components available without a build pipeline. No Webpack, no npm, no compilation step. It is designed and meant for projects that don't need (_or don't want_) a modern application build system. Just HTML, CSS, JavaScript, and the components you actually need.

> Themestrap is a genuinely interesting project; the zero-build, no-React-needed philosophy is a principled stance that's easy to second-guess but hard to argue with once you see it working.
> 
> — _Claude AI_

A tooltip shouldn't require a compilation step. A loading indicator shouldn't require a bundler. A carousel shouldn't require your entire website to be rewritten as a JavaScript application. Common interface behavior should be reusable without forcing a project into a build system, application framework, or large runtime. Themestrap provides those pieces individually while still allowing them to work together.

## Features

* **Zero-build architecture** — use Themestrap directly in an existing website.
* **80+ components** — from navigation and overlays to content, animation, and utility components.
* **jQuery plugin architecture** — every component exposes a familiar plugin interface.
* **Declarative initialization** — configure components directly through HTML.
* **Configurable `data-*` attributes** — No knowledge of JavaScript required for basic usage.
* **Programmatic control** — access component instances from JavaScript when needed.
* **Lazy initialization** — components can initialize through `IntersectionObserver`.
* **Lazy CSS injection** — components can inject their required styles when first used.
* **Destroy & reinitialize** — plugins expose lifecycle control for dynamic applications.
* **Module Loader** — optionally fetch plugins and their dependencies only when required.
* **CMS-friendly** — works naturally with server-rendered and template-driven markup.
* **Dynamically insertable** — newly added content can be scanned and initialized.
* **Composable** — components are designed to work independently or together.

All Themestrap components share the `window.themestrap` namespace and can be loaded a few ways:

* **`themestrap.js`**  — main `window.themestrap` namespace and utility functions. _required_
* **`themestrap.bundle.js`** — loads all component class definitions at once.
* **`themestrap.plugin.*.js`** — manually load individual component files.
* **`themestrap.loader.js` + `themestrap.modules.js`** — lazy *fetching* via the [module loader](#module-loader)
* **`themestrap.init.js`** — automatic component initialization via `IntersectionObserver`.

This allows Themestrap, depending on the requirements of the project, to support both a simple **load-everything approach** or a more selective **load-only-what-you-need approach** by hand-picking each component to load manually or by allowing a dynamic loader to select what components are needed.

## Quick Start

Themestrap is designed to be usable directly from a normal HTML page.

Include jQuery and Themestrap:

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@4.0.0/dist/jquery.min.js"></script>

<!-- Themestrap namespace and utilities -->
<script src="js/themestrap.js"></script>

<!-- All available components -->
<script src="js/themestrap.bundle.js"></script>

<!-- Automatic component initialzation-->
<script src="js/themestrap.init.js"></script>
```

Then declare a component in your markup:

```html
<div
    data-plugin-accordion
    data-plugin-options='{"speed": 300}'>
</div>
```

The initialization system detects the element and initializes the plugin.

No additional JavaScript initialization is required for basic use.

## Configuration

Themestrap components can be configured using `data-plugin-options` attributes.

```html
<div
    data-plugin-carousel
    data-plugin-options='{"loop": true, "autoplay": true, "autoplayTimeout": 5000}'>
</div>
```

Options are read and merged over the component's `.defaults`. Single-quoted attribute, double-quoted JSON keys.

This makes components particularly convenient in CMS templates, where markup can be generated without requiring a corresponding JavaScript initialization block.

### Re-init a component

```html
<button
  data-reinit-plugin="__pluginCarousel"
  data-reinit-plugin-function="themestrapPluginCarousel"
  data-reinit-plugin-element="#my-carousel"
  data-reinit-plugin-options='{"loop": false}'
>Reinit</button>
```

Requires the component to implement `destroy()`.

## Programmatic Usage

Declarative configuration isn't the only way to use Themestrap.

You can opt out of auto-initializatioin by adding the `.manual` class to prevent `themestrap.init.js` from auto-initializing an element so a component can be initialized directly:

```html
<div id="my-carousel" class="manual" data-plugin-carousel>
  ...slides...
</div>
<script>
  $('#my-carousel').themestrapPluginCarousel({ loop: false });
</script>
```

The component instance can then be retrieved when direct control is required:

```javascript
const instance = $('#my-accordion').data('__pluginAccordion');

instance.destroy();
```

This provides two complementary approaches:

> Declarative HTML &rarr; `data-plugin-options` &rarr; Themestrap

and

> Programmatic JavaScript &rarr; `$.fn.themestrapPluginName()` &rarr; Component instance

Use whichever approach fits your project.

## Component Architecture

Every component follows a strict five-stage lifecycle:

`initialize()` &rarr; `setData()` &rarr; `setOptions()` &rarr; `build()` &rarr; `events`

Components also expose `destroy()` for teardown and reinitialization.

### File & naming conventions

| Convention | Pattern |
|---|---|
| Filename | `themestrap.plugin.{name}.js` |
| IIFE shape | Triple-paren `(function($, window, document, undefined) { ... }(jQuery, window, document))` |
| jQuery method | `$.fn.themestrapPlugin{Name}` |
| Instance key | `__plugin{Name}` or `__{name} (stored via `$el.data()`) |
| CSS injection | Lazy, from `build()`, guarded by a `STYLE_ID` check |
| Mutual exclusion events | Hyphen-separated: `ts-popover-opened`, `ts-dialog-opened` |

### Init strategies

Components use one of four initialization strategies depending on their needs:

| Strategy | Function | Use when |
|---|---|---|
| Simple lazy | `intObsInit(sel, fn)` | Component reads only `data-plugin-options`; no defaults merging |
| Defaults merging | `dynIntObsInit(sel, fn, defaults)` | Component has a `.defaults` static property |
| Interaction-lazy | `execOnceThroughEvent(sel, event, cb)` | Defer init until first hover/focus (e.g. lightbox) |
| Immediate | `$().each()` in `$(() => {})` | Must run on DOMReady regardless of viewport |

---

## Module Loader

The module loader (`themestrap.loader.js` + `themestrap.modules.js`) adds lazy *fetching* on top of the framework's lazy *initialization*. Rather than bundling all plugins and their vendor dependencies into every page, each component declares what it needs via a `data-module` attribute and the loader resolves, fetches, and activates only what that page actually uses.

### Load order

`themestrap.js` &rarr; `themestrap.loader.js` &rarr; `themestrap.modules.js` &rarr; your page declares `data-module`

You can find a more exhaustive explaination and guide about the [module loader](docs/ThemestrapModuleLoader.md) in the `docs` folder.

> [!WARNING]
> **One owner per component.**  
> If the loader manages a component, that component must not also be statically included or wired in `themestrap.init.js`. Two owners means two initialization passes.

## Current Status

### What's Here

- 80+ component plugins
- There's [docs](docs/) for each component
- There's [demos](demos/) for each component
- 3 starter templates, 4 webapps, and 1 game to [showcase](showcase/) how to use the components in the wild
- IntersectionObserver lazy-init pipeline (`themestrap.init.js`)
- Module Loader (`themestrap.loader.js` + `themestrap.modules.js`) with full vendor dependency map
- Full `destroy()` / re-init support on all components

### Showcase
 
Each folder in [`showcase/`](showcase/) is a complete project that puts the components to work in a real interface rather than in isolation.
 
#### Starter Templates
 
**[Launchpad](showcase/Launchpad/)** — A six-page SaaS marketing site (landing, features, pricing, customers, customer story, and about) driven by a single set of design tokens with full light and dark themes. Its [quick start guide](showcase/Launchpad/QUICKSTART.md) covers rebranding and customizing it.  
- _Uses:_ Dark Mode on every page, with Counter and Scroll FX on the landing page.
 
**[Pixels](showcase/Pixels/)** — A single-page product landing template with a dismissible notice bar, hero, feature grid, stats, testimonials, pricing, FAQ, contact form, and footer.  
- _Uses:_ Navbar, Sticky, Animate, Scroll FX, Counter, Progress Bar, Accordion, Pricing Toggle, Toast, and Scroll To Top, wired up through `themestrap.init.js`.
 
**[Procedure](showcase/Procedure/)** — An API reference documentation site with quickstart, authentication, messages, conversations, webhooks, pagination, and errors pages.  
- _Uses:_ Code Rail for the two-column prose and synced code layout, Code Window and Highlight for the code samples, Alert for callouts, Command Menu (⌘K) for search, Scroll Spy and Scroll Shadow for the sidebar, and Dark Mode.
 
#### Webapps
 
**[cod[e]ditor](showcase/cod-e-ditor/)** — An in-browser code editor built on CodeMirror 5 with a desktop-style title bar, file explorer, format settings, and terminal and debugger panels.  
- _Uses:_ Menubar for the File, Edit, View, Settings, and Help menus, Toolbar, Tooltip, Command Menu, and Context Menu.
 
**[Mailbox](showcase/mailbox/)** — An email client with a sign-in page, inbox, message view, and compose screen.  
- _Uses:_ Navigation for the sidebar, Hover Card for message previews, Context Menu for right-click message actions, Command Menu, Dialog for confirmations and settings, Drawer, Calendar, Scrollbar, Loading Overlay, Toast, Dark Mode, plus Tags Input for recipients and Rich Editor for the message body.
 
**[Signal](showcase/signal/)** — A single-page system status dashboard for tracking focus sessions, with an end-of-day countdown, metric charts, and a session log.  
- _Uses:_ Countdown, Chart Circular, Progress Bar, Rating, Tooltip, Toast, and Dark Mode.
 
**[TSBlog](showcase/TSBlog/)** — A self-hosted PHP blog that stores posts as flat files or in SQLite and is managed entirely from a browser-based admin, with no database or build step to set up.  
- _Uses:_ The admin is built from Auth, Calendar, Time Picker, Select, Number Input, Dialog, Toolbar, Markdown, Markdown Editor, Rich Editor, and Tags Input. The public theme loads only Scroll Shadow, and only on post pages.
 
#### Game
 
**[10,000](showcase/10000/)** — The dice game 10,000 (a.k.a. Farkle or Hot Dice), playable online with friends through a Node.js and socket.io server, or alone in 3D.  
- _Uses:_ Dice for the game board, Particles for the animated background, Drawer for the rules and chat panels, Markdown to render the rules, Dialog, Alert, Tooltip, Loading Overlay, Number Input, Progress Bar, Counter, Collapsible, Scroll Shadow, Scrollbar, and `themestrap.fn.createStorage` to remember each player's name and seat.

### On the Horizon
- Rewrite all components with dependencies to be self-contained. (_in progress_)
- Integration with [**MODX Revolution**](https://modx.com/). Will include dedicated snippets and chunks for almost every component. (_sometime in the future_)
- **jQuery 4 compatibility** — A `themestrap.component.js` base class with auto-tracked teardown, reactive `setState()`, and a `defineComponent()` factory was designed and prototyped. A few plugins have been migrated as a proof of concept. (_broader rollout is pending_)

## Component Categories

Themestrap contains a broad collection of components. The following is not a complete list:

### Content & Layout

* [Accordion](docs/PluginAccordion.md)
* [Animated Content](docs/PluginAnimatedContent.md)
* [Before/After](docs/PluginBeforeAfter.md)
* [Calendar](docs/PluginCalendar.md)
* [Collapsible](docs/PluginCollapsible.md)
* [Masonry](docs/PluginMasonry.md)
* [Sort](docs/PluginSort.md)
* [Tree](docs/PluginTree.md)

### Navigation

* [Menubar](docs/PluginMenubar.md)
* [Navbar](docs/PluginNavbar.md)
* [Nav Menu](docs/PluginNavMenu.md)
* [Navigation](docs/PluginNavigation.md)
* [Panel Navigation](docs/PluginPanelNav.md)
* [Side Navigation](docs/PluginSideNav.md)
* [Vertical Navigation](docs/PluginVerticalNav.md)
* [Toolbar](docs/PluginToolbar.md)

### Interaction

* [Alert](docs/PluginAlert.md)
* [Context Menu](docs/PluginContextMenu.md)
* [Dialog](docs/PluginDialog.md)
* [Popover](docs/PluginPopover.md)
* [Toast](docs/PluginToast.md)
* [Wizard](docs/PluginWizard.md)
* [Command Menu](docs/PluginCommandMenu.md)

### Media

* [Carousel](docs/PluginCarousel.md)
* [Light Carousel](docs/PluginCarouselLight.md)
* [Lightbox](docs/PluginLightbox.md)
* [Video Background](#video-background)

### Visual Effects

* [Animation](docs/PluginAnimation.md)
* [Cursor Effect](docs/PluginCursorEffect.md)
* [Hover Effect](docs/PluginHoverEffect.md)
* [In-Viewport Style](docs/PluginInViewportStyle.md)
* [Parallax](docs/PluginParallax.md)
* [Scroll FX](docs/PluginScrollFx.md)
* [Scroll Shadow](docs/PluginScrollShadow.md)

### Utilities

* [Countdown](docs/PluginCountdown.md)
* [Counter](docs/PluginCounter.md)
* [Dark Mode](docs/PluginDarkMode.md)
* [Float Element](docs/PluginFloatElement.md)
* [Highlight](docs/PluginHighlight.md)
* [Scrollbar](docs/PluginScrollbar.md)
* [Scroller](docs/PluginScroller.md)
* [Pricing Toggle](docs/PluginPricingToggle.md)

### Forms & Authentication

* [Account](docs/PluginAccount.md)
* [Authentication](docs/PluginAuth.md)
* [OTP](docs/PluginOtp.md)
* [GDPR](docs/PluginGDPR.md)
* [GDPR Wrapper](docs/PluginGDPRWrapper.md)

### Code & Documentation

* [Code Rail](docs/PluginCodeRail.md)
* [Code Window](docs/PluginCodeWindow.md)
* [Markdown](docs/PluginMarkdown.md)
* [Highlight](docs/PluginHighlight.md)

The repository currently maintains individual guides for its components under the [`docs`](docs/) folder.

## Examples

### Tooltip-Style Enhancement

A component can be attached directly to existing markup:

```html
<button
    data-plugin-tooltip
    data-plugin-options='{
        "title": "Save your changes"
    }'>
    Save
</button>
```

The surrounding page doesn't need to know how the tooltip works.

### Carousel

A carousel can be declared entirely through markup:

```html
<div
    data-plugin-carousel
    data-plugin-options='{
        "loop": true,
        "items": 3
    }'>

    <div class="slide">First</div>
    <div class="slide">Second</div>
    <div class="slide">Third</div>

</div>
```

The application remains responsible for the content while Themestrap provides the behavior.

See the [Carousel documentation](docs/PluginCarousel.md).

### Accordion

```html
<div
    data-plugin-accordion
    data-plugin-options='{
        "speed": 300
    }'>
    ...
</div>
```

See the [Accordion documentation](docs/PluginAccordion.md).

---

### Toast

A notification can be treated as another independent piece of interface behavior.

```javascript
// Plugin-specific API; see the Toast documentation
```

See the [Toast documentation](docs/PluginToast.md).

## Where Themestrap Fits

Themestrap is particularly well suited to:

* Static websites
* Marketing sites
* Documentation
* CMS templates
* Server-rendered applications
* Legacy applications
* Admin interfaces
* Prototypes
* Internal tools
* Websites that need selective JavaScript enhancement

It can also be used alongside an existing application architecture when a full component framework isn't appropriate for a particular page or feature.

## Dependencies

Most Themestrap components are self-contained and require only the core environment they were designed for but some components use third-party libraries for specialized functionality.

Examples include:

| Dependency                    | Components                     |
| ----------------------------- | ------------------------------ |
| `jquery.visible`              | Float Element, Icon            |
| `jquery.cookie`               | GDPR, GDPR Wrapper             |
| `Vivus`                       | Icon                           |
| `observe-element-in-viewport` | In-Viewport Style              |
| `vide`                        | Video Background               |
| `jquery.matchHeight`          | Match Height                   |
| `jquery.easing`               | Section Scroll, Scroll To Top  |
| `jquery.pin`                  | Sticky                         |
| `jquery-validation`           | Validation, Newsletter, Search |

The [module loader](#module-loader) can manage these dependencies when components are loaded dynamically.

## Documentation

### Architecture

* [Themestrap Architecture](docs/ThemestrapArchitecture.md)
* [Module Loader](docs/ThemestrapModuleLoader.md)
* [Plugin Skeleton](docs/ThemestrapPluginSkeleton.js)

### Components

The repository currently includes documentation for more than 75 plugins and components. Browse the complete collection in [`docs/`](docs/). For a [quick reference](REFERENCE.md) on each component, have a look in the `REFERENCE.md` file.

## Demos

Themestrap includes demonstration implementations showing how the components can be used together rather than only in isolation.

Browse the [`demos/`](demos/) and [`showcase/`](showcase/) directories to see the components work in actual interfaces out in the wild.

## The Philosophy

Themestrap isn't trying to make every website into an application. It's trying to make **small pieces of application behavior easy to reuse** and implement. A project should be able to start with:

* HTML
* CSS
* JavaScript 

and selectively add:

+ Tooltip
+ Carousel
+ Wizard
+ Before/After
+ Syntax Highlight
+ Splash Screen
+ Navigation
+ Notifications
+ Animation
+ ...

without being forced to adopt everything else.

That means Themestrap can stay out of the way when it isn't needed and provide additional behavior when it is. The goal isn't to make every component visible. The goal is to make the interface feel intentional.

More on the [reason](REASON.md) why Themestrap exists can be found in the `REASON.md` file.

## License

MIT
