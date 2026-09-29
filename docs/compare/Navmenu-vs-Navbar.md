# PluginNavmenu vs PluginNavbar

## 1. One-line summary

**PluginNavmenu** is a general-purpose, accessible navigation-menu engine focused on interactive content panels, hover/click activation, keyboard navigation, animation, and optional viewport portaling.

**PluginNavbar** is a complete responsive navbar component focused on page navigation, branding, current-page detection, mobile collapse, dropdown menus, sticky positioning, external-link handling, and a predefined visual structure.

The biggest distinction is that **Navmenu is an interaction primitive**, while **Navbar is a complete navigation-bar component**.

---

# 2. Core Architectural Differences

| Area                   | PluginNavmenu                           | PluginNavbar                                  |
| ---------------------- | --------------------------------------- | --------------------------------------------- |
| Primary purpose        | Interactive navigation menu / mega-menu | Complete site navbar                          |
| Layout                 | Horizontal or vertical                  | Horizontal desktop + responsive mobile        |
| Menu model             | Arbitrary content panels                | Structured dropdown menus                     |
| Open behavior          | Hover or click                          | Click                                         |
| Hover delays           | Yes                                     | No                                            |
| Mobile behavior        | Not specifically implemented            | Built-in collapse menu                        |
| Sticky behavior        | No                                      | Yes                                           |
| Current-page detection | No                                      | Yes                                           |
| External links         | No                                      | Yes                                           |
| Viewport/portal        | Optional                                | No                                            |
| Arbitrary panel HTML   | Yes                                     | Limited to defined navbar markup              |
| Animation              | Configurable classes                    | CSS-defined transitions                       |
| Keyboard navigation    | Direction-aware + content entry         | Top-level arrows + Home/End                   |
| Lifecycle              | Explicit destroy                        | Explicit destroy                              |
| Orientation            | Horizontal / vertical                   | Responsive horizontal/vertical transformation |
| Styling model          | Generic data attributes + CSS variables | Opinionated `.ts-navbar__*` component classes |

### Architectural philosophy

`PluginNavmenu` is designed around this concept:

```text
Navigation container
    │
    ├── item
    │    ├── trigger
    │    └── content panel
    │
    ├── item
    │    ├── trigger
    │    └── content panel
    │
    └── item
```

The content panel can contain essentially anything.

`PluginNavbar` instead assumes a complete component hierarchy:

```text
Navbar
 ├── container
 │    ├── logo
 │    ├── collapse
 │    │    └── nav
 │    │         ├── link
 │    │         └── dropdown
 │    │              └── menu
 │    └── CTA
 └── mobile toggle
```

That makes `PluginNavbar` substantially more opinionated.

---

# 3. DOM Structure

## PluginNavmenu

The plugin expects generic semantic hooks:

```html
<nav data-plugin-navmenu>

    <div data-navmenu-item>

        <a href="/about"
           data-navmenu-link>
            About
        </a>

    </div>

    <div data-navmenu-item>

        <button data-navmenu-trigger>
            Products
        </button>

        <div data-navmenu-content>
            ...
        </div>

    </div>

</nav>
```

The important distinction is that **only items containing both a trigger and content panel become interactive menu records**.

Plain links are intentionally skipped.

The plugin internally creates records like:

```js
{
    $item,
    $trigger,
    $content,
    index
}
```

This gives it a relatively flexible content model.

---

## PluginNavbar

Navbar expects a much more specific hierarchy:

```html
<nav class="ts-navbar" data-plugin-navbar>

    <div class="ts-navbar__container">

        <a class="ts-navbar__logo">...</a>

        <div class="ts-navbar__collapse">

            <ul class="ts-navbar__nav">

                <li class="ts-navbar__item">
                    <a class="ts-navbar__link">...</a>
                </li>

                <li class="ts-navbar__item ts-navbar__item--dropdown">

                    <button class="ts-navbar__dropdown-toggle">
                        Products
                    </button>

                    <div class="ts-navbar__menu">
                        ...
                    </div>

                </li>

            </ul>

        </div>

        <div class="ts-navbar__cta">
            ...
        </div>

        <button class="ts-navbar__toggle">
            ...
        </button>

    </div>

</nav>
```

Navbar therefore controls substantially more of the surrounding markup than Navmenu does.

### Important distinction

Navmenu asks:

> "Where are my triggers and their content panels?"

Navbar asks:

> "Is this a complete Themestrap navbar and how should every part of it behave?"

---

# 4. Menu Content Model

## PluginNavmenu

Navmenu deliberately treats panel contents as opaque HTML.

For example:

```html
<div data-navmenu-content>

    <div class="grid">

        <a href="/alpha">
            Alpha
        </a>

        <a href="/beta">
            Beta
        </a>

    </div>

</div>
```

The plugin doesn't require a particular internal structure.

It provides optional styling hooks such as:

```text
data-navmenu-list-item
data-navmenu-list-item-icon
data-navmenu-list-item-title
data-navmenu-list-item-desc
```

This makes it appropriate for:

* mega-menus
* product grids
* category navigation
* documentation navigation
* rich navigation cards
* arbitrary HTML panels

---

## PluginNavbar

Navbar has predefined menu concepts:

```text
.ts-navbar__menu
.ts-navbar__menu-list
.ts-navbar__menu-link
.ts-navbar__menu--sections
.ts-navbar__menu-section
.ts-navbar__menu-heading
.ts-navbar__menu-cta
```

It therefore provides more opinionated visual semantics.

The component explicitly understands:

* menu links
* sections
* headings
* menu CTAs
* current menu links

---

# 5. Open/Close Behavior

## PluginNavmenu

Navmenu supports:

```js
openOn: 'hover'
```

or:

```js
openOn: 'click'
```

Default:

```js
openOn: 'hover'
```

Hover behavior includes configurable delays:

```js
delay: 200,
closeDelay: 150
```

The implementation uses timers to prevent panels from immediately flickering when moving between trigger and content.

It also keeps the menu open while the pointer is inside the content panel.

---

## PluginNavbar

Navbar uses click-driven dropdowns.

```js
toggleDropdown($li)
openDropdown($li)
closeDropdowns()
```

There is no configurable hover-open mode.

The default behavior is:

```js
oneOpen: true
```

so opening one dropdown closes the others.

### Practical difference

Navmenu is designed to support:

```text
hover → delay → open
```

Navbar is designed around:

```text
click → toggle
```

This is one of the clearest functional differences between the two plugins.

---

# 6. Animation

## PluginNavmenu

Animation is explicitly configurable:

```js
animationIn: 'ts-navmenu-in',
animationOut: 'ts-navmenu-out',
animationDuration: 200
```

The plugin adds/removes the configured classes:

```js
.addClass('ts-navmenu-active ' + o.animationIn)
```

and:

```js
.addClass(o.animationOut)
```

It also waits for `animationend`, with a timeout fallback.

There are separate horizontal and vertical keyframes.

Horizontal:

```text
translateY(-6px) → translateY(0)
```

Vertical:

```text
translateX(-6px) → translateX(0)
```

---

## PluginNavbar

Navbar animation is CSS-driven through state classes:

```css
.ts-navbar__item--dropdown.is-open > .ts-navbar__menu
```

The menu transitions:

```text
opacity
transform
visibility
```

from:

```text
opacity: 0
transform: translateY(-6px)
visibility: hidden
```

to:

```text
opacity: 1
transform: translateY(0)
visibility: visible
```

The mobile menu uses a separate `max-height` transition.

### Architectural difference

Navmenu exposes animation as part of its JavaScript API.

Navbar treats animation as part of the component's CSS state model.

---

# 7. Viewport / Portal Support

## PluginNavmenu

Navmenu has explicit viewport support:

```js
useViewport: false
```

When enabled:

```html
<div data-navmenu-viewport></div>
```

the content panels are moved into the viewport.

The plugin remembers each panel's original parent:

```js
item.$originalParent = item.$content.parent();
```

and restores it during `destroy()`.

The viewport is then positioned underneath the active trigger.

This is particularly useful for mega-menu layouts where all panels need to share a common visual container.

---

## PluginNavbar

Navbar has no equivalent portal system.

Its dropdown remains inside:

```text
.ts-navbar__item
```

and is absolutely positioned relative to the navigation item on desktop.

On mobile it becomes an inline/static menu.

### Result

Navmenu can separate:

```text
trigger location
```

from:

```text
panel rendering location
```

Navbar does not.

---

# 8. Responsive Behavior

## PluginNavmenu

Navmenu provides an `orientation` option:

```js
orientation: 'horizontal'
```

or:

```js
orientation: 'vertical'
```

Vertical mode changes:

* flex direction
* panel position
* animation axis
* keyboard navigation axis

However, it does **not** implement a breakpoint-driven mobile navigation system.

---

## PluginNavbar

Responsive behavior is a core feature.

At:

```css
@media (max-width: 991.98px)
```

the navbar changes from:

```text
logo + horizontal links + CTA
```

to:

```text
logo + hamburger
        ↓
expanded vertical menu
```

Dropdowns stop floating and become inline:

```css
position: static;
```

The mobile collapse uses:

```text
max-height
overflow-y
```

and:

```text
.ts-navbar--menu-open
```

state.

### Important distinction

`orientation` in Navmenu is a **menu-layout option**.

Responsive behavior in Navbar is a **complete component transformation**.

---

# 9. Positioning and Edge Alignment

## PluginNavmenu

Navmenu actively measures the viewport:

```js
_updateAlignment()
```

and determines whether a panel would overflow the right edge.

If so, it applies:

```text
ts-navmenu-align-right
```

which changes:

```css
left: auto;
right: 0;
```

This makes individual panels adapt to their position in the navigation.

---

## PluginNavbar

Navbar dropdowns are simply positioned:

```css
left: 0;
top: 100%;
```

There is no JavaScript collision or edge measurement system.

The component therefore assumes that its predefined layout and menu widths are sufficient.

---

# 10. Accessibility

Both plugins perform meaningful ARIA wiring, but their approaches differ.

## PluginNavmenu

Each trigger receives:

```html
aria-controls="..."
aria-expanded="false"
aria-haspopup="true"
```

The associated content receives:

```html
role="region"
aria-labelledby="..."
```

The plugin also supports:

* Enter
* Space
* Escape
* ArrowLeft
* ArrowRight
* ArrowUp
* ArrowDown

depending on orientation.

When the panel is open, ArrowDown/ArrowRight can move focus into the first interactive element inside the panel.

That is a particularly important feature for keyboard traversal of richer mega-menu content.

---

## PluginNavbar

Dropdown triggers receive:

```html
aria-haspopup="true"
aria-expanded="false"
```

The mobile toggle receives:

```html
aria-controls="..."
aria-expanded="false"
```

Current links receive:

```html
aria-current="page"
```

Keyboard navigation supports:

* ArrowLeft
* ArrowRight
* Home
* End
* Enter
* Space

### Difference

Navmenu has a more explicit **trigger → panel navigation model**.

Navbar has a broader **navbar navigation model**, including the mobile collapse and current-page semantics.

---

# 11. Keyboard Navigation

## PluginNavmenu

Keyboard movement respects orientation.

Horizontal:

```text
ArrowLeft  → previous trigger
ArrowRight → next trigger
ArrowDown  → first item in active panel
```

Vertical:

```text
ArrowUp    → previous trigger
ArrowDown  → next trigger
ArrowRight → first item in active panel
```

This makes the orientation meaningful to keyboard users as well as visually.

---

## PluginNavbar

Navbar's keyboard system treats the top-level navigation as a linear collection:

```text
ArrowLeft
ArrowRight
Home
End
```

It also supports Enter/Space for dropdown toggles.

It does not provide the Navmenu behavior of moving from the trigger directly into the first interactive panel item via ArrowDown/ArrowRight.

---

# 12. Current Page Awareness

This is a major feature difference.

## PluginNavmenu

There is no built-in current-page detection.

It does not inspect:

```js
window.location.pathname
```

and does not provide:

```js
aria-current
```

management.

---

## PluginNavbar

Navbar explicitly supports:

```js
highlightCurrent: true
```

It calculates the current pathname and compares it against navigation links.

It can mark:

```text
.ts-navbar__link--current
```

and:

```html
aria-current="page"
```

It also marks a parent dropdown:

```text
.ts-navbar__link--current-parent
```

when the current page is inside a dropdown.

This makes Navbar much more appropriate when the component represents the site's actual page hierarchy.

---

# 13. External Link Handling

## PluginNavmenu

No external-link processing is implemented.

---

## PluginNavbar

Navbar can automatically identify off-origin links.

With:

```js
markExternal: true
```

it adds:

```text
ts-navbar__link--external
```

and automatically supplies:

```html
target="_blank"
rel="noopener noreferrer"
```

when appropriate.

It also has CSS for an external-link indicator.

This is functionality specific to Navbar.

---

# 14. Sticky Navigation

## PluginNavmenu

No sticky functionality.

---

## PluginNavbar

Sticky navigation is built into the component.

Default:

```js
sticky: true
```

The plugin inserts a zero-height sentinel immediately before the navbar:

```html
<div class="ts-navbar__sentinel"
     aria-hidden="true"></div>
```

It then observes that sentinel with `IntersectionObserver`.

When it leaves the viewport, Navbar adds:

```text
ts-navbar--stuck
```

which adds the elevated shadow treatment.

There is also a scroll-based fallback when `IntersectionObserver` isn't available.

This makes sticky behavior a first-class Navbar feature rather than something the page author must implement separately.

---

# 15. Mobile Navigation

## PluginNavmenu

No mobile hamburger/collapse system exists.

The author would need to provide the mobile layout and visibility behavior externally.

---

## PluginNavbar

Navbar has a complete mobile menu system.

State:

```text
ts-navbar--menu-open
```

Toggle:

```text
.ts-navbar__toggle
```

Collapse:

```text
.ts-navbar__collapse
```

The plugin automatically generates/wires a unique collapse ID so multiple Navbar instances don't collide.

This is one of the strongest reasons not to treat the two components as interchangeable.

---

# 16. Public API

## PluginNavmenu

```js
nav.open(index);
nav.close();
nav.toggle(index);
nav.getActive();
nav.destroy();
```

The API is index-oriented because the plugin models navigation as a collection of interactive menu items.

Example:

```js
const nav = $('[data-plugin-navmenu]')
    .data('__pluginNavmenu');

nav.open(2);
```

---

## PluginNavbar

Navbar exposes:

```js
navbar.toggleDropdown($li);
navbar.openDropdown($li);
navbar.closeDropdowns();

navbar.toggleMenu();
navbar.openMenu();
navbar.closeMenu();

navbar.setCurrent(selector);
navbar.getCurrent();

navbar.destroy();
```

Its API is therefore more feature-oriented.

It has separate APIs for:

```text
dropdown state
mobile-menu state
current-page state
```

### Fundamental API difference

Navmenu:

```text
open(index)
close()
toggle(index)
```

Navbar:

```text
dropdown operations
+
mobile menu operations
+
current-page operations
```

---

# 17. Events

## PluginNavmenu

Uses native `CustomEvent`.

Opening:

```text
navmenu-opened
```

Closing:

```text
navmenu-closed
```

The event detail contains:

```js
{
    index,
    $item,
    instance
}
```

This is useful for consumers that prefer standard DOM events.

---

## PluginNavbar

Uses jQuery events:

```text
open.tsnavbar
close.tsnavbar
menuopen.tsnavbar
menuclose.tsnavbar
```

For example:

```js
$navbar.on('open.tsnavbar', function (e) {
    ...
});
```

The dropdown-open event includes the DOM item:

```js
{
    item: $li[0]
}
```

### Difference

Navmenu's event architecture is native DOM:

```js
dispatchEvent(new CustomEvent(...))
```

Navbar's is jQuery-centric:

```js
$this.trigger($.Event(...))
```

That difference matters if Themestrap is eventually trying to reduce its dependence on jQuery.

---

# 18. Initialization / Wiring

## PluginNavmenu

Its documented wiring is direct DOM-ready initialization:

```js
$(() => {
    $('[data-plugin-navmenu]:not(.manual)').each(function () {
        ...
        $this.themestrapPluginNavmenu(opts);
    });
});
```

The plugin itself also reads its options from the argument supplied by initialization.

---

## PluginNavbar

The documented initialization uses:

```js
themestrap.fn.intObsInit(
    '[data-plugin-navbar]:not(.manual)',
    'themestrapPluginNavbar'
);
```

This means Navbar is designed to participate in Themestrap's intersection-observer-based initialization system.

It also independently reads:

```js
data-plugin-options
```

through:

```js
themestrap.fn.getOptions(...)
```

and merges those options with passed options.

### Important implementation distinction

Navbar is designed around **Themestrap's shared initialization infrastructure**.

Navmenu's supplied initialization example uses a direct DOM-ready scan instead.

---

# 19. Multiple Instance Handling

## PluginNavmenu

Uses:

```js
$el.data('__pluginNavmenu')
```

to prevent duplicate initialization.

Its document/window handlers are based on the navbar's DOM `id`:

```js
keydown.navmenu-{id}
click.navmenu-{id}
resize.navmenu-{id}
```

There is a potential lifecycle consideration here: document/window namespace construction depends on the root element having an ID for the escape/outside handlers to be cleanly removed by `destroy()`.

---

## PluginNavbar

Navbar generates an internal numeric UID:

```js
this.uid = ++_uid;
```

and uses:

```text
.tsnavbar.{uid}
```

for its event namespace.

This is more robust for multiple instances because the event namespace does not depend on the navbar having an HTML `id`.

---

# 20. Destroy / Lifecycle

## PluginNavmenu

`destroy()` handles:

* timers
* portaled content restoration
* viewport cleanup
* ARIA cleanup
* animation-class cleanup
* item handlers
* trigger handlers
* content handlers
* root handlers
* document handlers
* window handlers
* instance data

It specifically restores content that was moved into the viewport.

That is an important lifecycle responsibility.

---

## PluginNavbar

`destroy()` handles:

* window/document event handlers
* root handlers
* IntersectionObserver
* sticky sentinel
* component state classes
* palette attribute
* plugin instance data
* open dropdown state

It does **not** restore every ARIA attribute that was added or modified during initialization.

For example, `_wireDropdowns()` may add:

```html
aria-haspopup
aria-expanded
```

but `destroy()` does not explicitly remove them.

Likewise, collapse wiring adds:

```html
aria-controls
```

without explicitly restoring the original markup.

So Navbar's destroy behavior is primarily **behavioral cleanup**, whereas Navmenu's destroy is more explicit about restoring DOM state.

---

# 21. Styling / Theming

## PluginNavmenu

Uses generic data attributes:

```css
[data-plugin-navmenu]
[data-navmenu-item]
[data-navmenu-trigger]
[data-navmenu-content]
```

and a relatively small set of custom properties:

```text
--ts-nav-focus-ring
--ts-nav-content-bg
--ts-nav-content-border
--ts-nav-icon-bg
--ts-nav-muted
```

Its styling is therefore fairly component-neutral.

It also has built-in:

```css
html.dark
```

overrides.

---

## PluginNavbar

Uses a large semantic variable system:

```text
--ts-navbar-bg
--ts-navbar-border
--ts-navbar-logo-color
--ts-navbar-link-color
--ts-navbar-link-hover
--ts-navbar-link-current
--ts-navbar-accent
--ts-navbar-accent-hover
--ts-navbar-menu-bg
--ts-navbar-menu-border
--ts-navbar-menu-link
--ts-navbar-menu-link-hover
--ts-navbar-menu-heading
--ts-navbar-toggle-color
--ts-navbar-shadow
--ts-navbar-height
--ts-navbar-accent-size
--ts-navbar-radius
--ts-navbar-transition
--ts-navbar-sticky-top
--ts-navbar-z
```

This makes Navbar substantially more themeable as a complete visual component.

It also supports:

```text
palette="light"
palette="dark"
```

and automatically responds to:

```css
html.dark
```

---

# 22. Reduced Motion

## PluginNavmenu

The supplied CSS does not include a `prefers-reduced-motion` override.

Its animations therefore remain governed by the configured animation classes and browser behavior.

---

## PluginNavbar

Explicitly provides:

```css
@media (prefers-reduced-motion: reduce)
```

and reduces transition/animation durations to approximately 1ms.

This is a built-in accessibility difference.

---

# 23. Feature Matrix

| Feature                            |  PluginNavmenu  |    PluginNavbar    |
| ---------------------------------- | :-------------: | :----------------: |
| Generic navigation menu            |        ✓        |          —         |
| Complete navbar component          |        —        |          ✓         |
| Horizontal orientation             |        ✓        |          ✓         |
| Vertical orientation               |        ✓        |  Responsive mobile |
| Hover opening                      |        ✓        |          —         |
| Click opening                      |        ✓        |          ✓         |
| Configurable hover delay           |        ✓        |          —         |
| Configurable close delay           |        ✓        |          —         |
| Rich arbitrary panel HTML          |        ✓        |       Partial      |
| Mega-menu support                  |        ✓        | Sections supported |
| Viewport portal                    |        ✓        |          —         |
| Edge alignment                     |        ✓        |          —         |
| Current-page detection             |        —        |          ✓         |
| `aria-current` management          |        —        |          ✓         |
| External-link detection            |        —        |          ✓         |
| Automatic external-link attributes |        —        |          ✓         |
| Sticky navigation                  |        —        |          ✓         |
| Sticky observer                    |        —        |          ✓         |
| Mobile collapse                    |        —        |          ✓         |
| Hamburger toggle                   |        —        |          ✓         |
| Dropdown menus                     |        ✓        |          ✓         |
| Multiple-open control              | One active item |      `oneOpen`     |
| Escape close                       |        ✓        |          ✓         |
| Outside click close                |        ✓        |          ✓         |
| Arrow navigation                   |        ✓        |          ✓         |
| Home/End navigation                |        —        |          ✓         |
| Move focus into panel              |        ✓        |          —         |
| Configurable animation classes     |        ✓        |          —         |
| Built-in reduced-motion handling   |        —        |          ✓         |
| Native CustomEvents                |        ✓        |          —         |
| jQuery events                      |        —        |          ✓         |
| CSS data-attribute architecture    |        ✓        |          —         |
| Opinionated component CSS          |        —        |          ✓         |
| Explicit portal restoration        |        ✓        |          —         |
| Explicit ARIA cleanup              |        ✓        |       Partial      |
| `destroy()`                        |        ✓        |          ✓         |

---

# 24. Where Their Responsibilities Overlap

There is significant overlap around dropdown navigation.

Both provide:

```text
trigger
   ↓
dropdown/content
```

Both support:

* click toggling
* Escape
* outside-click closing
* keyboard navigation
* ARIA-expanded state
* multiple menu items
* animated open/close states
* dark-mode styling

That overlap means it would be easy for users to initially perceive them as two implementations of the same component.

They aren't quite that.

---

# 25. The Critical Difference: Primitive vs Component

The cleanest conceptual separation is:

```text
PluginNavmenu
     ↓
navigation interaction primitive
```

versus:

```text
PluginNavbar
     ↓
complete responsive site-navigation component
```

Navmenu answers:

> "How should a collection of navigation triggers and rich content panels behave?"

Navbar answers:

> "How should a complete website navbar behave across desktop and mobile?"

That distinction explains most of their API and architectural differences.

---

# 26. When to Use PluginNavmenu

Use **PluginNavmenu** when the page needs a flexible interactive menu such as:

### Mega-menu

```text
Products
 ├── Software
 ├── Hardware
 ├── Integrations
 └── Resources
```

where the panel may contain a custom grid or card layout.

### Documentation navigation

```text
Guides
 ├── Getting Started
 ├── Configuration
 └── API
```

### Rich navigation panels

For example:

```text
Products
 ┌───────────────────────────────┐
 │ ★ Alpha       ★ Beta          │
 │ Description   Description     │
 │                               │
 │ ★ Gamma       ★ Delta         │
 └───────────────────────────────┘
```

### Vertical navigation

Its vertical orientation and axis-aware keyboard navigation make it useful for side-oriented navigation menus.

---

# 27. When to Use PluginNavbar

Use **PluginNavbar** when you need an actual site navigation bar with:

* logo/branding
* top-level links
* dropdowns
* current-page indication
* mobile hamburger menu
* CTA buttons
* sticky positioning
* external-link handling
* responsive desktop/mobile transformation

It is much closer to a complete site-level component.

---

# 28. They Should Not Be Considered Direct Replacements

A useful way to think about them is:

```text
PluginNavmenu
    │
    ├── Menu trigger behavior
    ├── Rich panel behavior
    ├── Hover/click behavior
    ├── Keyboard panel navigation
    ├── Viewport positioning
    └── Mega-menu interaction
```

while:

```text
PluginNavbar
    │
    ├── Branding
    ├── Site links
    ├── Dropdowns
    ├── Current page
    ├── External links
    ├── Mobile menu
    ├── Sticky behavior
    └── CTA
```

There is a shared dropdown interaction layer, but their component responsibilities are different.

---

# 29. One Architectural Opportunity

There is a reasonable case for treating **Navmenu as the lower-level menu interaction engine** and **Navbar as the higher-level site-navigation component** in the Themestrap ecosystem.

Conceptually:

```text
                    Themestrap Navigation
                           │
             ┌─────────────┴─────────────┐
             │                           │
       PluginNavmenu               PluginNavbar
       interaction layer            site component
             │                           │
       rich menu panels             responsive shell
       hover / click                logo / CTA
       keyboard                     sticky
       viewport                     current page
       positioning                  mobile collapse
```

However, the supplied implementations are currently separate rather than sharing an internal base class.

They also use different event conventions and different DOM/state models:

```text
Navmenu → native CustomEvent + data-* hooks
Navbar  → jQuery events + .ts-navbar__* classes
```

So they should currently be treated as **related but independent plugins**, rather than one being a drop-in replacement for the other.

---

# 30. Bottom Line

**PluginNavmenu is the flexible menu system.**

It specializes in:

```text
trigger → interactive panel
```

with hover/click behavior, configurable delays, keyboard traversal, viewport support, arbitrary panel content, and positioning.

**PluginNavbar is the complete navigation bar.**

It specializes in:

```text
branding + navigation + dropdowns + responsive menu + sticky behavior
```

with current-page detection, external-link handling, mobile collapse, CTA support, and a more opinionated visual system.

The two overlap around dropdown navigation, but their intended abstraction levels are different:

```text
PluginNavmenu = "How a navigation menu behaves"
PluginNavbar  = "What a complete navigation bar is"
```
