# Changelog

All notable changes to Themestrap are documented here.

This repository does not currently include semantic version tags or package metadata, so the version sequence below is inferred from the project’s actual Git commit history beginning with the initial repository import and continuing through the current main branch state.

## [1.1.1] - 2026-11-12

### Added
- PluginMarkdown draws ```` ```mermaid ```` fenced blocks as diagrams. Mermaid loads from jsDelivr only on pages that have one (`mermaidSrc` to self-host), colors follow the skin through new `--ts-md-diagram-*` tokens, and diagrams redraw when dark mode toggles. New `mermaid` and `mermaidConfig` options, `renderDiagrams()` method, and `diagrams.ts.markdown` / `mermaiderror.ts.markdown` events
- Docs site: Mermaid diagrams use the site palette in light and dark mode
- PluginSortable, PluginReveal and PluginImageUpload: guides (`docs/PluginSortable.md`, `docs/PluginReveal.md`, `docs/PluginImageUpload.md`), demos, docs site entries, `themestrap.init.js` wiring, `themestrap.modules.js` modules, and a place in `themestrap.bundle.js`
- PluginSortable sorts rows and wrapping grids as well as columns. The layout is detected on every move, or set with the new `axis` option. Arrow keys follow the layout (a whole row at a time in a grid, mirrored on right to left pages), and items without a handle can be moved from the keyboard when they have focus
- PluginSortable: `Escape` puts a dragged item back where it started
- PluginImageUpload: `--ts-iu-danger` token for error messages
- PluginReveal, PluginSortable, PluginImageUpload: every method can be called by name through the jQuery method, and names starting with `_` are private

### Changed
- PluginSortable: without a `handle`, touch screens pick an item up after a 300ms hold, so a quick swipe scrolls the page instead of being blocked
- PluginReveal: elements that start appearing within 100ms of each other are numbered for `stagger` in page order, from zero. Slots used to be counted across the whole page and wrap after six, so a row could start in the middle
- PluginReveal fades to the element's own CSS opacity and transform (a centering `translate` is kept) and puts its inline styles back when the fade ends, instead of leaving `transition`, `transform: none` and `opacity: 1` behind. `destroy()` restores the element's own inline styles instead of clearing them
- PluginImageUpload: `accept` now also decides which files are sent (MIME types, wildcards and extensions), instead of a fixed JPG, PNG, GIF and WebP check
- PluginImageUpload: with several paste enabled widgets, a pasted picture goes to one of them (the one with focus, else the one used last, else the first on screen) instead of all of them, and pastes into text fields outside the widget are ignored
- PluginImageUpload: buttons default to Bootstrap classes, `btn btn-sm btn-outline-secondary` with `text-danger` on Remove, instead of `btn` and `warn`. Pass `buttonClass` and `removeClass` to keep the old look
- PluginImageUpload: the progress bar sits inside a circular preview, where the bottom edge was too short to show it
- PluginSortable and PluginImageUpload colors follow the skin (`--ts-skin-accent`, `--ts-skin-border-strong`, ...), with the old values as fallbacks

### Fixed
- PluginImageUpload: labels and option values with quotes or `<` broke the widget's markup
- PluginReveal: `$(el).themestrapPluginReveal('destroy')` returned the instance without destroying it, and `destroy()` and `show()` returned nothing
- PluginSortable and PluginImageUpload header comments used `$.isFunction`, which jQuery 4 removed


## [1.1.0] - 2026-11-7

### Added
- Skins: `css/skins/*.css` set the original palette and a shared `--ts-skin-*` token set for light and dark mode. Ships Venom plus eight Base16 palettes (Solarized, Gruvbox, One, Tomorrow, Nord, Dracula, Rosé Pine, Catppuccin)
- `docs/ThemestrapSkins.md` and `demos/plugin.demo.skins.html`
- The standard Penner easing curves in `themestrap.js`, defined only when jquery.easing hasn't already provided them
- PluginToast: its own lazily injected stylesheet with `--ts-toast-*` tokens, and `destroy()`
- `destroy()` for Animate, GDPR Wrapper, Icon, In Viewport Style, Match Height, Revolution Slider, Scroll FX, Scroll Spy, Section Scroll, Sticky, Toggle and Video Background. Each one removes its handlers, timers and observers, undoes the markup and classes it added, and can be initialized again afterwards
- Every plugin bridge takes a method name: `$(el).themestrapPluginX('destroy')` calls `destroy()` on the instance, with any extra arguments passed through
- Command Menu and Nav Menu docs list their CSS custom properties

### Changed
- Every plugin with injected CSS routes its themable values through `--ts-skin-*` tokens, keeping its previous value as the fallback, so pages without a skin render unchanged
- Plugins that had no design tokens (Context Menu, Hover Card, Popover, Scroll Bar, Calendar, Tree, Lockscreen) gain `--ts-*` hook tokens
- PluginAccordion reads `--ts-skin-*` instead of `--ts-venom-*`; Venom is now a skin
- PluginHighlight's syntax colors follow the skin's Base16 slots
- `themestrap.bundle.js` rebuilt from the current component files; it now includes Color Picker, Dice, Emoticon, Markdown Editor, Particles, Pricing Toggle and Transfer
- `themestrap.modules.js` no longer lists jquery.easing as a dependency of Section Scroll, Scroll To Top and Nav
- Token families renamed to the `--ts-<plugin>-*` pattern. The old names keep working as aliases until the next major version:
  - Alert `--alert-ts-*` → `--ts-alert-*`
  - Carousel `--tsc-*` → `--ts-carousel-*`
  - Command Menu `--command-*` → `--ts-cmd-*`
  - Wizard `--wizard-*` → `--ts-wizard-*`
  - Pricing Toggle `--pt-*` → `--ts-pricing-*`
  - Nav Menu `--ts-nav-*` → `--ts-nm-*`
- For the four families a plugin declares itself (Alert, Carousel, Command Menu, Wizard), the old name is read first, so existing overrides keep beating the built-in value. A side effect: an old-name override set on an ancestor (for example `:root { --alert-ts-bg: ... }`) used to be shadowed by the plugin's own declaration and now takes effect
- Pricing Toggle's color and geometry options default to `null` and are only written inline when given, so stylesheet overrides and skins reach it. Its track now uses the skin accent
- Section Scroll and Sticky use their own debounced resize handler instead of vendor afterResize, which holds a single global callback (the second plugin to use it replaced the first)
- Scroll FX auto-init skips elements with `.manual`, like every other plugin

### Fixed
- jQuery 4 compatibility: every `$.isFunction()` call (plugins, core, init, docs, demos and showcase) replaced with a `typeof` check
- `themestrap.js` hash scrolling threw `easing is not a function` without jquery.easing
- PluginToast's countdown bar never animated (rendered `hljs-toast-progress-bar`, looked for `toast-progress-bar`)
- PluginCommandMenu squeezed an item's label to zero width when the item also had a description
- PluginSticky added three window handlers through jquery.pin on every re-pin, and it re-pins every second, so scroll handlers piled up for as long as the page was open. The handlers from each pin are now removed before the next
- PluginScrollFx removed its scroll listener from `window` even when it was bound to a custom scroll container
- PluginScrollSpy threw when called without options, and had no re-init guard
- PluginVideoBackground had no re-init guard and added another overlay each time it rebuilt
- PluginInViewportStyle threw on every viewport change when `styleIn` or `styleOut` was left at its default
- PluginCarousel's guide listed its tokens as `--tscp-*` and its style id as `ts-carousel-pro-styles`; the code uses neither
- `themestrap.bundle.js` repeated section header comments, and the rebuild script added more on each run


## [1.0.2] - 2026-10-11

### Added
- Additional demo and showcase refinements for project examples
- Improved accessibility and documentation polish across interactive patterns

### Changed
- Refined initialization guidance and usage examples for newer plugin patterns
- Continued cleanup of theme consistency, CSS variable organization, and demo presentation
- Updated project references and narrative wording to better reflect the current component set

### Fixed
- Resolved edge-case initialization and re-initialization issues affecting plugin setup reliability
- Corrected minor documentation inaccuracies, typos, and outdated examples across the guide set


## [1.0.1] - 2026-09-15

### Added
- Minor demo improvements and accessibility tweaks

### Changed
- Updated documentation and clarified initialization examples

### Fixed
- Fixed a plugin initialization race condition under certain load scenarios
- Corrected typos and small inaccuracies across documentation and demos



## [1.0.0] - 2026-09-08

This release represents the current repository state as of the latest commit history, following 128 commits since the project first appeared in Git on 2026-07-14.

### Added
- Lock Screen and OTP plugin support for security-related UI patterns
- Tree plugin with search and selection behaviors
- Calendar plugin with demo and full documentation
- Wizard plugin for multi-step form flows
- New and expanded demos for plugin showcases and webapp examples
- README and architecture documentation updates
- Additional documentation for newer components and examples

### Changed
- Expanded the core component library and documentation set across the project
- Refined README positioning and usage guidance for modern static-site users
- Improved project structure documentation and starter-template guidance
- Continued cleanup of component behavior, readability, and maintainability
- Improved CSS variable organization and theme consistency across demo styles

### Fixed
- Corrected option-handling issues in plugin initialization and re-init behavior
- Fixed outdated documentation and dependency references
- Cleaned up inconsistent patterns and refactored code for better maintainability



## [0.5.0] - 2026-08

### Added
- Initial SIGNAL system status page implementation
- Additional starter-template and webapp references
- Continued plugin and documentation additions for new component work
- Demo pages and supporting docs for advanced UI behaviors

### Changed
- Updated project documentation to reflect the broader component surface area
- Refined readme content and project examples to match evolving functionality
- Improved demo coverage and showcase polish



## [0.4.0] - 2026-07-16

### Added
- Architecture documentation for Themestrap and the module loader
- Documentation for Popover, ScrollShadow, ScrollFx, Toast, and NavMenu
- Additional plugin guides covering ChartCircular, DarkMode, HoverEffect, Counter, FloatElement, Icon, Countdown, and CarouselLight

### Changed
- Standardized doc structure and improved project reference materials
- Updated the project narrative and organizational references in README and guides
- Renamed and reorganized some documentation files to reflect the current project structure

### Fixed
- Corrected clarity issues and outdated descriptions across early documentation



## [0.3.0] - 2026-07-15

### Added
- Accordion guide
- CodeWindow plugin documentation
- Early expansion of the component guide set

### Changed
- Broadened documentation coverage for the initial component inventory
- Increased the depth of README content and project explanation



## [0.2.0] - 2026-07-14

### Added
- Initial Themestrap CSS assets and default skin variables
- Early plugin guide content
- Vendor documentation and foundation project files

### Changed
- Established the initial project structure for documentation and shared assets



## [0.1.0] - 2026-07-14

### Added
- Initial repository import and project bootstrap
- README, style assets, and early/vendor scaffolding
- Initial documentation and asset foundation for the project

### Changed
- Started the project from the raw source and documentation set that would become the Themestrap library
