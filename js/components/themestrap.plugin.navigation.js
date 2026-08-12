/**
 * Themestrap PluginNavigation
 * 
 * 
 *
 * Modes
 *   'sidebar'   Collapsible icon-rail sidebar with header/footer zones,
 *               group titles, badge counts, animated sub-drawers, and
 *               responsive auto-collapse.
 *   'panel'     Fixed-width vertical nav panel with depth-indented children,
 *               metadata column, section headings, and accordion mode.
 *   'megamenu'  Horizontal or vertical mega-menu bar with hover|click open,
 *               animated content panels, viewport portal, and keyboard nav.
 *
 * Data attributes
 *
 *   SIDEBAR/PANEL mode
 *   data-nav-header                  Header region (sidebar)
 *   data-nav-logo                    Logo wrapper inside header
 *   data-nav-title                   Title element inside header
 *   data-nav-toggle                  Collapse toggle button
 *   data-nav-actions                 Panel actions / title bar
 *   data-nav-actions-title           Title inside actions bar
 *   data-nav-body                    Scrollable nav body
 *   data-nav-footer                  Footer region (sidebar)
 *   data-nav-section                 Group / section wrapper
 *   data-nav-section-title="Label"   Section heading text
 *   data-nav-list                    <ul> list container
 *   data-nav-item                    Nav item wrapper
 *   data-nav-link                    Interactive link/button row
 *   data-nav-active                  Pre-mark an item active
 *   data-nav-has-children            Declare parent without a child list
 *   data-nav-disabled                Disable an item
 *   data-nav-icon                    Icon slot inside a link row
 *   data-nav-label                   Text label slot inside a link row
 *   data-nav-badge                   Badge count slot
 *   data-nav-metadata                Right-aligned metadata (panel)
 *   data-nav-child-items             Nested child list (becomes a drawer)
 *   data-nav-separator               Horizontal divider
 *
 *   MEGAMENU mode
 *   data-nav-item                    Top-level menu item
 *   data-nav-link                    Plain link (no panel)
 *   data-nav-trigger                 Disclosure button that opens a panel
 *   data-nav-content                 Content panel (any HTML)
 *   data-nav-viewport                External portal container
 *   data-nav-list-item               Rich link row inside a content panel
 *   data-nav-list-item-icon          Icon box inside a rich link
 *   data-nav-list-item-title         Title line inside a rich link
 *   data-nav-list-item-desc          Description paragraph
 *
 * Public API
 *
 *   UNIVERSAL
 *   inst.setActive($item)            Mark $item as the active leaf; walks
 *                                    ancestors to open drawers + mark branch
 *   inst.setSubActive($sub)          Same, for a nested child item
 *   inst.getActive()                 sidebar/panel → {item, subItem}
 *                                    megamenu → active panel index | -1
 *   inst.refresh()                   destroy + re-init
 *   inst.destroy()
 *
 *   SIDEBAR
 *   inst.collapse()                  Collapse to icon-only rail
 *   inst.expand()                    Restore full width
 *   inst.toggle()                    Flip collapsed state
 *   inst.setCollapsed(bool)
 *
 *   SIDEBAR + PANEL (drawers)
 *   inst.openGroup($item)
 *   inst.closeGroup($item)
 *   inst.toggleGroup($item)
 *   inst.expandAll()
 *   inst.collapseAll()
 *
 *   MEGAMENU
 *   inst.open(index)                 Open panel at 0-based index
 *   inst.close()                     Close the active panel
 *   inst.togglePanel(index)
 *   inst.getActivePanel()            Active panel index | -1
 *
 * Events (fired on the root element)
 *   sidebar.toggle.ts.navigation     { collapsed }
 *   drawer.toggle.ts.navigation      { $item, open }
 *   item.ts.navigation               { $item, $link, href }
 *   panel.open.ts.navigation         { index, $item }
 *   panel.close.ts.navigation        { index, $item }
 *
 * Init.js wiring
 *
 *   // Sidebar/Panel (forceInit:true → dynIntObsInit inits immediately)
 *   if ($.isFunction($.fn['themestrapPluginNavigation']) &&
 *       $('[data-plugin-navigation]').length) {
 *       themestrap.fn.dynIntObsInit(
 *           '[data-plugin-navigation]:not(.manual)',
 *           'themestrapPluginNavigation',
 *           themestrap.PluginNavigation.defaults
 *       );
 *   }
 */
// Navigation
(((themestrap = {}, $) => {

    const instanceName = '__pluginNavigation';

    /* tiny uid helper — avoids ARIA ID collisions across instances */
    let _uidSeq = 0;
    const uid = (p) => `${p}-${++_uidSeq}-${Math.random().toString(36).slice(2, 7)}`;

    const STYLE_ID = 'ts-nav-styles';
    const CSS_TEXT = `
/* Themestrap — PluginNavigation */

/* Token layer */
.ts-nav {
    /* Geometry */
    --ts-nav-width:              260px;
    --ts-nav-width-collapsed:     64px;
    --ts-nav-duration:           240ms;
    --ts-nav-easing:             cubic-bezier(0.4, 0, 0.2, 1);
    --ts-nav-font-size:          0.875rem;
    --ts-nav-item-pad-y:         0.5rem;
    --ts-nav-item-pad-x:         1rem;
    --ts-nav-indent-step:        1rem;

    /* Colours */
    --ts-nav-bg:                 var(--light, #ffffff);
    --ts-nav-border-color:       var(--light--200, #ececec);
    --ts-nav-header-bg:          var(--light--100, #ffffff);
    --ts-nav-footer-bg:          var(--light--300, #ffffff);

    --ts-nav-text:               var(--default, #777);
    --ts-nav-text-muted:         var(--dark-rgba-20, rgba(33, 37, 41, 0.2));
    --ts-nav-icon-color:         var(--grey, #969696);

    --ts-nav-accent:             var(--primary, #0088CC);
    --ts-nav-focus-ring:         var(--ts-nav-accent);

    --ts-nav-item-hover-bg:      var(--light-rgba-10, #rgba(255, 255, 255, 0.1));
    --ts-nav-item-active-bg:     transparent;
    --ts-nav-item-active-text:   var(--ts-nav-accent);
    --ts-nav-item-active-border: var(--ts-nav-accent);

    --ts-nav-section-title-color:#8a93a0;
    --ts-nav-badge-bg:           var(--light-300, #e6e6e6);
    --ts-nav-badge-color:        var(--dark-300, #383f45);
    --ts-nav-badge-active-bg:    var(--grey-500, #dbdbdb);
    --ts-nav-badge-active-color: var(--ts-nav-accent);
    --ts-nav-toggle-color:       var(--grey-1000, #757575);
    --ts-nav-toggle-hover-bg:    var(--light-100, #f2f2f2);

    --ts-nav-content-bg:         var(--light, #ffffff);
    --ts-nav-content-border:     var(--light-rgba-10, rgba(255, 255, 255, 0.1));
    --ts-nav-content-shadow:     0 4px 24px var(--dark-rgba-10, rgba(33, 37, 41, 0.1)), 0 1px 4px var(--dark-rgba-60, rgba(33, 37, 41, 0.6));
    --ts-nav-muted-text:         var(--dark-rgba-50, rgba(33, 37, 41, 0.5));
}

/* Dark variant — via option class or html.dark */
.ts-nav--dark,
html.dark .ts-nav {
    --ts-nav-bg:                 var(--dark, #212529);
    --ts-nav-border-color:       var(--dark--200, #101214);
    --ts-nav-header-bg:          var(--dark--100, #2c3237);
    --ts-nav-footer-bg:          var(--dark, #212529);
    --ts-nav-text:               var(--light, #ffffff);
    --ts-nav-text-muted:         var(--light-rgba-20, rgba(255, 255, 255, 0.2));
    --ts-nav-icon-color:         var(--grey-700, #c1c1c1);
    --ts-nav-accent:             var(--primary, #0088CC);
    --ts-nav-item-hover-bg:      var(--dark-200, #101214);
    --ts-nav-item-active-text:   var(--ts-nav-accent);
    --ts-nav-item-active-border: var(--ts-nav-accent);
    --ts-nav-section-title-color:var(--dark--300, #383f45);
    --ts-nav-badge-bg:           var(--dark--100, #2c3237);
    --ts-nav-badge-color:        var(--light, #ffffff);
    --ts-nav-badge-active-bg:    var(--primary-100, #0077b3);
    --ts-nav-badge-active-color: var(--primary--200, #00a1f2);
    --ts-nav-toggle-color:       var(--grey-200, #eaeaea);
    --ts-nav-toggle-hover-bg:    var(--dark-100, #16181b);
    --ts-nav-content-bg:         var(--dark, #212529);
    --ts-nav-content-border:     var(--dark-rgba-80, rgba(33, 37, 41, 0.8));
    --ts-nav-content-shadow:     0 4px 24px var(--dark-rgba-40, rgba(33, 37, 41, 0.4));
    --ts-nav-muted-text:         var(--light-rgba-50, rgba(255, 255, 255, 0.5));
}

/* Compact density */
.ts-nav--compact {
    --ts-nav-item-pad-y: 0.3125rem;
    --ts-nav-font-size:  0.8125rem;
}

/* Universal box-sizing */
.ts-nav *,
.ts-nav *::before,
.ts-nav *::after { box-sizing: border-box; }

/* Sidebar mode */
.ts-nav--sidebar {
    display: flex;
    flex-direction: column;
    width: var(--ts-nav-width);
    height: 100%;
    background-color: var(--ts-nav-bg);
    border-right: 1px solid var(--ts-nav-border-color);
    overflow: hidden;
    transition: width var(--ts-nav-duration) var(--ts-nav-easing);
    will-change: width;
    flex-shrink: 0;
    position: relative;
    z-index: 100;
}

.ts-nav--sidebar.ts-nav--collapsed {
    width: var(--ts-nav-width-collapsed);
}

/* Panel mode */
.ts-nav--panel {
    width: var(--ts-nav-width);
    max-width: 100%;
    background-color: var(--ts-nav-bg);
    color: var(--ts-nav-text);
    font-size: var(--ts-nav-font-size);
    line-height: 1.4;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
}

.ts-nav--panel.ts-nav--fill {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.ts-nav--bordered {
    border: 1px solid var(--ts-nav-border-color);
    border-radius: .5rem;
    overflow: hidden;
}

/* Megamenu mode */
.ts-nav--megamenu {
    position: relative;
    display: flex;
    align-items: center;
    gap: .25rem;
}

.ts-nav--megamenu[data-nav-orientation="vertical"] {
    flex-direction: column;
    align-items: stretch;
}

/* Header (sidebar) */
.ts-nav__header {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: 1rem .75rem 1rem 1rem;
    min-height: 4rem;
    background-color: var(--ts-nav-header-bg);
    border-bottom: 1px solid var(--ts-nav-border-color);
    flex-shrink: 0;
    overflow: hidden;
}

.ts-nav__logo {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ts-nav__logo img { width: 100%; height: 100%; object-fit: contain; }
.ts-nav__logo i, .ts-nav__logo svg { font-size: 1.25rem; color: var(--ts-nav-accent); }

.ts-nav__title {
    font-size: .9375rem;
    font-weight: 600;
    color: var(--ts-nav-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
    transition: opacity var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav__toggle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    background: transparent;
    border-radius: .375rem;
    cursor: pointer;
    color: var(--ts-nav-toggle-color);
    transition:
        background-color 150ms ease,
        transform var(--ts-nav-duration) var(--ts-nav-easing);
    padding: 0;
    line-height: 1;
}

.ts-nav__toggle:hover { background-color: var(--ts-nav-toggle-hover-bg); color: var(--ts-nav-text); }
.ts-nav__toggle:focus-visible { outline: 2px solid var(--ts-nav-focus-ring); outline-offset: 2px; }
.ts-nav--collapsed .ts-nav__toggle { transform: rotate(180deg); }

/* Body */
.ts-nav__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: .375rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--ts-nav-border-color) transparent;
}

.ts-nav__body::-webkit-scrollbar { width: 4px; }
.ts-nav__body::-webkit-scrollbar-track { background: transparent; }
.ts-nav__body::-webkit-scrollbar-thumb {
    background-color: var(--ts-nav-border-color);
    border-radius: 2px;
}

/* Footer */
.ts-nav__footer {
    flex-shrink: 0;
    padding: .5rem 0;
    background-color: var(--ts-nav-footer-bg);
    border-top: 1px solid var(--ts-nav-border-color);
    overflow: hidden;
}

/* Panel actions bar */
.ts-nav__actions {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .75rem var(--ts-nav-item-pad-x);
    border-bottom: 1px solid var(--ts-nav-border-color);
    flex-shrink: 0;
}

.ts-nav__actions-title {
    font-size: .9375rem;
    font-weight: 600;
    color: var(--ts-nav-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Sections */
.ts-nav__section { padding: .25rem 0; }

.ts-nav__section + .ts-nav__section {
    border-top: 1px solid var(--ts-nav-border-color);
    margin-top: .25rem;
    padding-top: .5rem;
}

.ts-nav__section-title {
    display: flex;
    align-items: center;
    padding: .375rem var(--ts-nav-item-pad-x) .25rem;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: var(--ts-nav-section-title-color);
    white-space: nowrap;
    overflow: hidden;
    user-select: none;
    transition: opacity var(--ts-nav-duration) var(--ts-nav-easing),
                height var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav--sidebar.ts-nav--collapsed .ts-nav__section-title {
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
}

/* Lists */
.ts-nav__list { list-style: none; margin: 0; padding: 0; }

/* Items */
.ts-nav__item { position: relative; margin: 0; }

/* Interactive link / button row */
.ts-nav__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: .625rem;
    width: 100%;
    padding: var(--ts-nav-item-pad-y) var(--ts-nav-item-pad-x);
    /* Depth-driven indent: depth 0 = no extra indent, 1+ = n × indent-step */
    padding-left: calc(var(--ts-nav-item-pad-x) + (var(--ts-nav-depth, 0) * var(--ts-nav-indent-step)));
    color: var(--ts-nav-text);
    background: transparent;
    border: none;
    text-align: left;
    text-decoration: none !important;
    cursor: pointer;
    font: inherit;
    font-size: var(--ts-nav-font-size);
    line-height: 1.4;
    transition:
        background-color var(--ts-nav-duration) var(--ts-nav-easing),
        color var(--ts-nav-duration) var(--ts-nav-easing);
    user-select: none;
}

/* Sidebar: pill shape with margin, depth indent still applies via CSS var */
.ts-nav--sidebar .ts-nav__link {
    margin: .0625rem .5rem;
    border-radius: .375rem;
    width: calc(100% - 1rem);
}

/* Panel: full-bleed rows, no radius */
.ts-nav--panel .ts-nav__link { border-radius: 0; }

.ts-nav__link:hover { background-color: var(--ts-nav-item-hover-bg); color: var(--ts-nav-text); }

.ts-nav__link:focus-visible { outline: 2px solid var(--ts-nav-focus-ring); outline-offset: -2px; }

/* Active / branch-active states */
.ts-nav__item--active > .ts-nav__link {
    background-color: var(--ts-nav-item-active-bg);
    color: var(--ts-nav-item-active-text);
    font-weight: 600;
}

.ts-nav__item--branch-active > .ts-nav__link { color: var(--ts-nav-item-active-text); }

.ts-nav__item--branch-active > .ts-nav__link .ts-nav__icon { color: var(--ts-nav-accent); }

/* Disabled */
.ts-nav__item--disabled > .ts-nav__link {
    opacity: .45;
    pointer-events: none;
    cursor: not-allowed;
}

/* Active indicators */

/* Base: left bar — zero height until made active */
.ts-nav__link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: var(--ts-nav-item-active-border);
    border-radius: 0 2px 2px 0;
    transition: height var(--ts-nav-duration) var(--ts-nav-easing);
}

/* Sidebar pill rows: bar offset accounts for the left margin */
.ts-nav--sidebar .ts-nav__link::before { left: -.5rem; }

.ts-nav--indicator-bar  .ts-nav__item--active > .ts-nav__link::before,
.ts-nav--indicator-both .ts-nav__item--active > .ts-nav__link::before { height: 62%; }

/* Caret-right (Morningstar / PanelNav style) */
.ts-nav__active-caret {
    flex-shrink: 0;
    width: .75rem;
    height: .75rem;
    margin-left: .25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-nav-item-active-text);
    opacity: 0;
    transform: translateX(-3px);
    transition:
        opacity var(--ts-nav-duration) var(--ts-nav-easing),
        transform var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav--indicator-caret .ts-nav__item--active:not(.ts-nav__item--has-children) > .ts-nav__link > .ts-nav__active-caret,
.ts-nav--indicator-both  .ts-nav__item--active:not(.ts-nav__item--has-children) > .ts-nav__link > .ts-nav__active-caret {
    opacity: 1;
    transform: translateX(0);
}

/* Inner parts */
.ts-nav__icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--ts-nav-icon-color);
    transition: color var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav__item--active > .ts-nav__link .ts-nav__icon { color: var(--ts-nav-accent); }

.ts-nav__label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition:
        opacity var(--ts-nav-duration) var(--ts-nav-easing),
        max-width var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav__badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 .3125rem;
    font-size: .6875rem;
    font-weight: 600;
    line-height: 1;
    border-radius: .625rem;
    background-color: var(--ts-nav-badge-bg);
    color: var(--ts-nav-badge-color);
    transition: background-color 150ms ease, opacity var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav__item--active > .ts-nav__link .ts-nav__badge {
    background-color: var(--ts-nav-badge-active-bg);
    color: var(--ts-nav-badge-active-color);
}

/* Right-aligned metadata (panel mode — counts, timestamps, etc.) */
.ts-nav__metadata {
    flex-shrink: 0;
    margin-left: auto;
    font-size: .75rem;
    font-weight: 500;
    color: var(--ts-nav-text-muted);
    font-variant-numeric: tabular-nums;
}

.ts-nav__item--active > .ts-nav__link .ts-nav__metadata { color: var(--ts-nav-item-active-text); }

/* Chevron (parent-toggle indicator) */
.ts-nav__chevron {
    flex-shrink: 0;
    width: .875rem;
    height: .875rem;
    margin-left: .25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-nav-text-muted);
    transition:
        transform var(--ts-nav-duration) var(--ts-nav-easing),
        opacity var(--ts-nav-duration) var(--ts-nav-easing);
}

.ts-nav__item--open > .ts-nav__link > .ts-nav__chevron { transform: rotate(180deg); }

/* Drawer (animated child container) */

/* Parent items wrap so the drawer occupies its own full-width row */
.ts-nav__item--has-children { flex-wrap: wrap; row-gap: 0; }

.ts-nav__drawer {
    width: 100%;
    overflow: hidden;
    height: 0;
    transition: height var(--ts-nav-duration) var(--ts-nav-easing);
    will-change: height;
}

/* Open: hand height back to CSS so inline style can be cleared safely */
.ts-nav__item--open > .ts-nav__drawer { height: auto; overflow: visible; }

.ts-nav__child-list { padding: .125rem 0 .25rem; list-style: none; margin: 0; }

/* Sidebar collapsed: force all drawers shut regardless of JS open state */
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__drawer { height: 0 !important; overflow: hidden; }

/* Collapsed sidebar adjustments */

/*
 * Collapsed link: kill gap so the icon occupies the exact horizontal centre
 * of the rail regardless of how many zero-width invisible siblings remain.
 */
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__link {
    justify-content: center;
    gap: 0;
    padding-left: 0;
    padding-right: 0;
    width: calc(var(--ts-nav-width-collapsed) - 1rem);
    margin-left: .5rem;
}

/*
 * Invisible flex children must also take zero width — opacity:0 alone leaves
 * the element in the flex layout, which shifts the icon off-centre.
 */
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__label {
    opacity: 0;
    pointer-events: none;
    max-width: 0;
    overflow: hidden;
}

.ts-nav--sidebar.ts-nav--collapsed .ts-nav__badge,
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__chevron,
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__active-caret,
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__metadata {
    opacity: 0;
    pointer-events: none;
    width: 0;
    min-width: 0 !important;
    max-width: 0;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
}

.ts-nav--sidebar.ts-nav--collapsed .ts-nav__title {
    opacity: 0;
    pointer-events: none;
    width: 0;
    overflow: hidden;
}

/* Pure-CSS tooltip on collapsed items — driven by data-nav-tooltip attr */
.ts-nav--sidebar.ts-nav--collapsed .ts-nav__link[data-nav-tooltip]:hover::after {
    content: attr(data-nav-tooltip);
    position: absolute;
    left: calc(var(--ts-nav-width-collapsed) - .5rem);
    top: 50%;
    transform: translateY(-50%);
    background-color: #1f2937;
    color: #f9fafb;
    padding: .3125rem .625rem;
    border-radius: .375rem;
    font-size: .8125rem;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 200;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);
}

/* Separator */
.ts-nav__separator {
    height: 1px;
    background-color: var(--ts-nav-border-color);
    margin: .5rem var(--ts-nav-item-pad-x);
    list-style: none;
}

/* Megamenu: trigger */
[data-nav-trigger] {
    display: inline-flex;
    align-items: center;
    gap: .375rem;
    padding: .5rem .75rem;
    border: none;
    background: transparent;
    border-radius: .375rem;
    font-size: .875rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    color: inherit;
    transition: background-color .15s ease, color .15s ease;
    user-select: none;
    white-space: nowrap;
}

[data-nav-trigger]:hover,
[data-nav-trigger][aria-expanded="true"] {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
}

[data-nav-trigger]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

/* Chevron via CSS mask — same visual as NavMenu trigger */
[data-nav-trigger]::after {
    content: '';
    display: inline-block;
    width: .75rem;
    height: .75rem;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    flex-shrink: 0;
    transition: transform .2s ease;
}

[data-nav-trigger][aria-expanded="true"]::after { transform: rotate(-180deg); }

/* Megamenu: plain link */
[data-nav-link] {
    display: inline-flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .375rem;
    font-size: .875rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    transition: background-color .15s ease;
    white-space: nowrap;
}

[data-nav-link]:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    text-decoration: none;
}

/* Megamenu: content panels */
[data-nav-content] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    background: var(--ts-nav-content-bg);
    border: 1px solid var(--ts-nav-content-border);
    border-radius: .5rem;
    box-shadow: var(--ts-nav-content-shadow);
    padding: .5rem;
    z-index: 1050;
    display: none;
    transform-origin: top center;
}

[data-nav-content].ts-nav-panel-active { display: block; }

.ts-nav--megamenu[data-nav-orientation="vertical"] [data-nav-content] {
    top: 0;
    left: calc(100% + .5rem);
}

[data-nav-item].ts-nav-align-right [data-nav-content] { left: auto; right: 0; }

/* Megamenu: viewport portal */
[data-nav-viewport] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    overflow: hidden;
    background: var(--ts-nav-content-bg);
    border: 1px solid var(--ts-nav-content-border);
    border-radius: .5rem;
    box-shadow: var(--ts-nav-content-shadow);
    z-index: 1050;
    display: none;
    transition: width .2s ease, height .2s ease, left .2s ease;
}

[data-nav-viewport].ts-nav-viewport-active { display: block; }

/* Megamenu: rich list items inside panels */
[data-nav-list-item] {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .625rem .75rem;
    border-radius: .375rem;
    text-decoration: none;
    color: inherit;
    transition: background-color .15s ease;
}

[data-nav-list-item]:hover {
    background-color: color-mix(in srgb, currentColor 6%, transparent);
    text-decoration: none;
}

[data-nav-list-item-icon] {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: .375rem;
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    flex-shrink: 0;
    font-size: 1.1rem;
    line-height: 1;
}

[data-nav-list-item-title] {
    font-size: .875rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: .125rem;
}

[data-nav-list-item-desc] {
    font-size: .8125rem;
    line-height: 1.4;
    color: var(--ts-nav-muted-text);
    margin: 0;
}

@keyframes ts-nav-in-kf {
    from { opacity: 0; transform: translateY(-6px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
}

@keyframes ts-nav-out-kf {
    from { opacity: 1; transform: translateY(0)    scale(1);   }
    to   { opacity: 0; transform: translateY(-6px) scale(.97); }
}

@keyframes ts-nav-in-v-kf {
    from { opacity: 0; transform: translateX(-6px) scale(.97); }
    to   { opacity: 1; transform: translateX(0)    scale(1);   }
}

@keyframes ts-nav-out-v-kf {
    from { opacity: 1; transform: translateX(0)    scale(1);   }
    to   { opacity: 0; transform: translateX(-6px) scale(.97); }
}

.ts-nav-in  { animation: ts-nav-in-kf  .18s cubic-bezier(.16,1,.3,1) both; }
.ts-nav-out { animation: ts-nav-out-kf .14s ease-in               both; }

.ts-nav--megamenu[data-nav-orientation="vertical"] .ts-nav-in  { animation-name: ts-nav-in-v-kf; }
.ts-nav--megamenu[data-nav-orientation="vertical"] .ts-nav-out { animation-name: ts-nav-out-v-kf; }

/* Suppress transitions during the initialisation double-rAF window */
.ts-nav[data-ts-nav-init] .ts-nav__drawer,
.ts-nav[data-ts-nav-init] .ts-nav__link::before,
.ts-nav[data-ts-nav-init] .ts-nav__active-caret,
.ts-nav[data-ts-nav-init] .ts-nav__section-title { transition: none !important; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .ts-nav__link, .ts-nav__drawer, .ts-nav__chevron,
    .ts-nav__active-caret, .ts-nav__link::before,
    [data-nav-trigger], [data-nav-content] {
        transition: none !important;
        animation: none !important;
    }
}
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(s);
    }

    class PluginNavigation {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el          = $el;
            this._raf         = [];
            this._timers      = [];
            this._cleanup     = [];
            this._activePanel = -1;     // megamenu: index of open panel
            this._isCollapsed = false;  // sidebar: current collapsed state
            this._uid         = 'tsNav_' + Math.random().toString(36).slice(2, 9);
            this._panelItems  = [];     // megamenu: collected item records

            this.setData()
                .setOptions(opts)
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginNavigation.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectStyles();
            const self = this;
            const $el  = self.$el;
            const o    = self.options;
            const D    = PluginNavigation.defaults;

            $el.addClass('ts-nav ts-nav--' + o.mode);
            if (o.dark)     $el.addClass('ts-nav--dark');
            if (o.bordered) $el.addClass('ts-nav--bordered');
            if (o.compact)  $el.addClass('ts-nav--compact');
            if (o.fill)     $el.addClass('ts-nav--fill');

            // Active-indicator modifier (for panel: caret|bar|both|none)
            const ind = ['caret', 'bar', 'both', 'none'].indexOf(o.activeIndicator) !== -1
                ? o.activeIndicator : 'bar';
            $el.addClass('ts-nav--indicator-' + ind);

            // CSS custom property overrides (only when differing from defaults)
            if (o.width          !== D.width)          $el.css('--ts-nav-width',           o.width);
            if (o.widthCollapsed !== D.widthCollapsed) $el.css('--ts-nav-width-collapsed', o.widthCollapsed);
            if (o.duration       !== D.duration)       $el.css('--ts-nav-duration',        o.duration);
            if (o.indentStep     !== D.indentStep)     $el.css('--ts-nav-indent-step',     o.indentStep);
            if (o.accent)                              $el.css('--ts-nav-accent',          o.accent);

            if (o.mode === 'megamenu') {
                $el.attr('data-nav-orientation', o.orientation);
                self._buildMegamenu();
            } else {
                // Sidebar + Panel share the same structural DOM build
                if (!$el.attr('role')) $el.attr('role', 'navigation');

                // Suppress CSS transitions during first-paint decoration
                $el.attr('data-ts-nav-init', 'true');

                self._buildActions();   // panel actions/title bar
                self._buildHeader();    // sidebar logo/title/toggle header
                self._buildBody();
                self._buildFooter();
                self._buildSections();  // sections → lists → items

                if (o.activeOnLoad)     self._autoSetActive();
                if (o.autoExpandActive) self._expandActiveBranches();

                if (o.mode === 'sidebar') {
                    // Kill the width transition for the very first paint
                    $el[0].style.transition = 'none';
                    self._isCollapsed = false;
                    if (o.collapsed) self._applyCollapsed(true);
                    if (o.mobileBreakpoint) self._bindResponsive();
                }

                // Lift both transition suppressors after two rAFs
                const r1 = requestAnimationFrame(() => {
                    const r2 = requestAnimationFrame(() => {
                        $el[0].style.removeProperty('transition');
                        $el.removeAttr('data-ts-nav-init');
                    });
                    self._raf.push(r2);
                });
                self._raf.push(r1);
            }

            return this;
        }

        _buildActions() {
            const self = this;
            self.$actions = self.$el.find('[data-nav-actions]').first();
            if (!self.$actions.length) return;
            self.$actions.addClass('ts-nav__actions');
            self.$actions.children('[data-nav-actions-title]').addClass('ts-nav__actions-title');
        }

        _buildHeader() {
            const self = this;
            const $el  = self.$el;

            self.$header = $el.find('[data-nav-header]').first();
            if (!self.$header.length) return;

            self.$header.addClass('ts-nav__header');
            self.$header.children('[data-nav-logo]').first().addClass('ts-nav__logo');
            self.$header.children('[data-nav-title]').first().addClass('ts-nav__title');

            let $toggle = self.$header.children('[data-nav-toggle]').first();
            if (!$toggle.length && self.options.showToggle) {
                $toggle = $(
                    '<button type="button" aria-label="Toggle sidebar"' +
                    ' data-nav-toggle data-ts-nav-injected="toggle"></button>'
                ).html(self._chevronSVG());
                self.$header.append($toggle);
            }
            if ($toggle.length) {
                $toggle.addClass('ts-nav__toggle');
                self.$toggle = $toggle;
            }
        }

        _buildBody() {
            const self = this;
            self.$body = self.$el.find('[data-nav-body]').first();
            if (self.$body.length) self.$body.addClass('ts-nav__body');
        }

        _buildFooter() {
            const self = this;
            self.$footer = self.$el.find('[data-nav-footer]').first();
            if (!self.$footer.length) return;
            self.$footer.addClass('ts-nav__footer');
            // Support both bare [data-nav-item] and items inside a [data-nav-list] wrapper
            self.$footer.children('[data-nav-list]').each(function() { self._decorateList($(this), 0); });
            self.$footer.children('[data-nav-item]').each(function() { self._decorateItem($(this), 0); });
            self.$footer.children('[data-nav-separator]').addClass('ts-nav__separator');
        }

        _buildSections() {
            const self   = this;
            const $scope = self.$body && self.$body.length ? self.$body : self.$el;

            $scope.find('[data-nav-section]').each(function() {
                const $s = $(this);
                if ($s.data('__tsNavSection')) return;
                $s.data('__tsNavSection', true);
                $s.addClass('ts-nav__section');

                // Section title from attribute or inner label element
                const title = $s.attr('data-nav-section-title') || $s.attr('data-nav-section') || '';
                if (title) {
                    let $t = $s.children('[data-nav-section-label]').first();
                    if (!$t.length) {
                        $t = $('<div data-nav-section-label data-ts-nav-injected="section-title"></div>').text(title);
                        $s.prepend($t);
                    }
                    $t.addClass('ts-nav__section-title');
                }

                $s.children('[data-nav-list]').each(function() { self._decorateList($(this), 0); });
                $s.children('[data-nav-item]').each(function() { self._decorateItem($(this), 0); });
                $s.children('[data-nav-separator]').addClass('ts-nav__separator');
            });

            // Direct children of scope that are not inside a section
            $scope.children('[data-nav-list]').each(function() { self._decorateList($(this), 0); });
            $scope.children('[data-nav-item]').each(function() { self._decorateItem($(this), 0); });
            $scope.children('[data-nav-separator]').addClass('ts-nav__separator');
        }

        /**
         * Decorate a <ul> list container and its direct item children.
         * @param {jQuery} $list
         * @param {number} depth
         */
        _decorateList($list, depth) {
            const self = this;
            if ($list.data('__tsNavList')) return;
            $list.data('__tsNavList', true);
            $list.addClass('ts-nav__list');
            $list.children('[data-nav-item]').each(function() { self._decorateItem($(this), depth); });
            $list.children('[data-nav-separator]').addClass('ts-nav__separator');
        }

        /**
         * Decorate one nav item and recursively decorate its children.
         * Guards against double-decoration with a jQuery data flag.
         * @param {jQuery} $item
         * @param {number} depth
         */
        _decorateItem($item, depth) {
            const self = this;
            if ($item.data('__tsNavItem')) return;
            $item.data('__tsNavItem', true);

            $item.addClass('ts-nav__item');
            $item.attr('data-ts-nav-depth', depth);

            // Find or synthesize the interactive link row
            let $link = $item.children('[data-nav-link]').first();
            if (!$link.length) $link = $item.children('a, button').first();
            if (!$link.length) {
                // Wrap loose inline content (icon + label etc.) into a span row
                const $loose = $item.children().not('[data-nav-child-items]');
                $link = $('<span data-nav-link data-ts-nav-injected="link"></span>');
                $loose.length
                    ? ($loose.first().before($link), $link.append($loose))
                    : $item.prepend($link);
            }
            $link.addClass('ts-nav__link');

            // Apply depth indent via CSS custom property (panel / sidebar expanded)
            if (depth > 0) $link.css('--ts-nav-depth', depth);

            // Decorate inner anatomy slots
            $link.children('[data-nav-icon]').first().addClass('ts-nav__icon');
            $link.children('[data-nav-label]').first().addClass('ts-nav__label');
            $link.children('[data-nav-badge]').first().addClass('ts-nav__badge');
            $link.children('[data-nav-metadata]').first().addClass('ts-nav__metadata');

            // CSS-tooltip label for sidebar collapsed mode
            const tooltipText = $link.children('.ts-nav__label').text().trim()
                || $item.attr('title') || '';
            if (tooltipText) $link.attr('data-nav-tooltip', tooltipText);

            const $childContainer = $item.children('[data-nav-child-items]').first();
            const hasChildren     = $childContainer.length > 0 || $item.is('[data-nav-has-children]');
            const isDisabled      = $item.is('[data-nav-disabled]');

            if (isDisabled) {
                $item.addClass('ts-nav__item--disabled');
                $link.attr('aria-disabled', 'true');
            }

            if (hasChildren) {
                $item.addClass('ts-nav__item--has-children');

                // Inject disclosure chevron if absent
                if (!$link.children('.ts-nav__chevron').length) {
                    $('<span class="ts-nav__chevron" aria-hidden="true" data-ts-nav-injected="chevron"></span>')
                        .html(self._chevronSVG())
                        .appendTo($link);
                }
                $link.attr('aria-expanded', 'false');

                if ($childContainer.length) {
                    $childContainer.addClass('ts-nav__child-list ts-nav__list');
                    $childContainer.data('__tsNavList', true);

                    // Wrap child list in the animated drawer shell
                    if (!$childContainer.parent().hasClass('ts-nav__drawer')) {
                        $childContainer.wrap('<div class="ts-nav__drawer"></div>');
                    }
                    const $drawer = $childContainer.parent();
                    $item.data('_$drawer', $drawer);

                    // ARIA: unique id for aria-controls
                    const cid = $drawer.attr('id') || uid('ts-nav-drawer');
                    $drawer.attr('id', cid);
                    $link.attr('aria-controls', cid);

                    // Recurse — children one depth level deeper
                    $childContainer.children('[data-nav-item]').each(function() {
                        self._decorateItem($(this), depth + 1);
                    });
                    $childContainer.children('[data-nav-separator]').addClass('ts-nav__separator');
                }

            } else {
                // Leaf: inject the caret-right active indicator placeholder
                if (!$link.children('.ts-nav__active-caret').length) {
                    $('<span class="ts-nav__active-caret" aria-hidden="true" data-ts-nav-injected="caret"></span>')
                        .html(self._caretRightSVG())
                        .appendTo($link);
                }
            }

            // Apply pre-marked active state
            if ($item.is('[data-nav-active]')) {
                if (hasChildren) {
                    $item.addClass('ts-nav__item--branch-active');
                } else {
                    $item.addClass('ts-nav__item--active');
                    $link.attr('aria-current', 'page');
                }
            }

            // Keyboard role for non-native interactive elements
            if (!$link.is('a, button')) {
                $link.attr({ role: hasChildren ? 'button' : 'link', tabindex: '0' });
            }
        }

        _buildMegamenu() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            self._panelItems = $el.children('[data-nav-item]').toArray().map((el, idx) => {
                const $item    = $(el);
                const $trigger = $item.find('[data-nav-trigger]').first();
                const $content = $item.find('[data-nav-content]').first();

                // Plain-link items have no trigger/content — skip
                if (!$trigger.length || !$content.length) return null;

                const triggerId = $trigger.attr('id') || uid('ts-nav-trigger');
                const contentId = $content.attr('id') || uid('ts-nav-content');

                $trigger.attr({
                    id: triggerId,
                    'aria-controls': contentId,
                    'aria-expanded': 'false',
                    'aria-haspopup': 'true',
                });
                $content.attr({
                    id: contentId,
                    role: 'region',
                    'aria-labelledby': triggerId,
                });

                return { $item, $trigger, $content, index: idx };
            }).filter(Boolean);

            // Viewport portal: move all content panels into the external container
            self.$viewport = $el.siblings('[data-nav-viewport]').first();
            if (o.useViewport && self.$viewport.length) {
                self._panelItems.forEach(item => {
                    item.$originalParent = item.$content.parent();
                    item.$content.appendTo(self.$viewport);
                });
            }

            self._updateAlignment();
            return this;
        }

        events() {
            const self = this;
            const o    = self.options;

            if (o.mode === 'megamenu') {
                self._eventsMegamenu();
            } else {
                self._eventsSidebarPanel();
            }
            return this;
        }

        _eventsSidebarPanel() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            // Sidebar collapse toggle
            $el.on('click.tsNav', '[data-nav-toggle]', (e) => {
                e.preventDefault();
                e.stopPropagation();
                self.toggle();
            });

            // Parent item -> toggle drawer
            $el.on('click.tsNav', '.ts-nav__item--has-children > .ts-nav__link', function(e) {
                const $item = $(this).parent();
                if ($item.hasClass('ts-nav__item--disabled')) return;
                e.preventDefault();
                self._toggleDrawer($item);
            });

            // Leaf item -> activate + fire event
            $el.on('click.tsNav', '.ts-nav__item:not(.ts-nav__item--has-children) > .ts-nav__link', function(e) {
                const $link = $(this);
                const $item = $link.parent();
                if ($item.hasClass('ts-nav__item--disabled')) return;

                self.setActive($item);
                const href = $link.attr('href');
                $el.trigger('item.ts.navigation', [{ $item, $link, href }]);

                if (!$link.is('a') || !href || href === '#') e.preventDefault();
                if (o.mode === 'sidebar' && o.autoCollapse && !self._isCollapsed) self.collapse();
            });

            // Keyboard: Space/Enter on injected role=button rows
            $el.on('keydown.tsNav', '.ts-nav__link[role]', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });
        }

        _eventsMegamenu() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            self._panelItems.forEach((item, idx) => {
                if (o.openOn === 'hover') {
                    item.$item
                        .on('mouseenter.tsNav', () => {
                            clearTimeout(self._closeTimer);
                            self._openTimer = setTimeout(() => self.open(idx), o.delay);
                        })
                        .on('mouseleave.tsNav', () => {
                            clearTimeout(self._openTimer);
                            self._closeTimer = setTimeout(() => {
                                if (self._activePanel === idx) self.close();
                            }, o.closeDelay);
                        });

                    item.$content
                        .on('mouseenter.tsNav', () => clearTimeout(self._closeTimer))
                        .on('mouseleave.tsNav', () => {
                            self._closeTimer = setTimeout(() => {
                                if (self._activePanel === idx) self.close();
                            }, o.closeDelay);
                        });
                }

                // Trigger click always toggles (works for both hover + click modes)
                item.$trigger.on('click.tsNav', (e) => {
                    e.stopPropagation();
                    self.togglePanel(idx);
                });

                // Keyboard navigation
                item.$trigger.on('keydown.tsNav', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.togglePanel(idx); }
                    if (e.key === 'Escape') { self.close(); item.$trigger.trigger('focus'); }

                    if (o.orientation === 'horizontal') {
                        if (e.key === 'ArrowRight') { e.preventDefault(); self._focusTrigger(idx,  1); }
                        if (e.key === 'ArrowLeft')  { e.preventDefault(); self._focusTrigger(idx, -1); }
                        if (e.key === 'ArrowDown' && self._activePanel === idx) {
                            e.preventDefault(); self._focusFirstInContent(idx);
                        }
                    } else {
                        if (e.key === 'ArrowDown') { e.preventDefault(); self._focusTrigger(idx,  1); }
                        if (e.key === 'ArrowUp')   { e.preventDefault(); self._focusTrigger(idx, -1); }
                        if (e.key === 'ArrowRight' && self._activePanel === idx) {
                            e.preventDefault(); self._focusFirstInContent(idx);
                        }
                    }
                });
            });

            // Document-level: Escape and outside-click
            if (o.closeOnEscape) {
                $(document).on('keydown.tsNav-' + self._uid, (e) => {
                    if (e.key === 'Escape' && self._activePanel > -1) {
                        const active = self._panelItems[self._activePanel];
                        self.close();
                        if (active) active.$trigger.trigger('focus');
                    }
                });
            }

            if (o.closeOnOutside) {
                $(document).on('click.tsNav-' + self._uid, (e) => {
                    if (self._activePanel === -1) return;
                    const $t = $(e.target);
                    if ($t.closest($el).length) return;
                    if (self.$viewport && self.$viewport.length && $t.closest(self.$viewport).length) return;
                    self.close();
                });
            }

            // Recalculate right-edge alignment on resize
            $(window).on('resize.tsNav-' + self._uid, () => {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(() => self._updateAlignment(), 100);
            });

            self._cleanup.push(() => {
                $(document).off('keydown.tsNav-' + self._uid);
                $(document).off('click.tsNav-'   + self._uid);
                $(window).off('resize.tsNav-'    + self._uid);
            });
        }

        /** Collapse to icon-only rail. */
        collapse() { return this._applyCollapsed(true); }

        /**
         * Expand to full width. Restores any drawers that were open
         * before the collapse without requiring the user to re-click.
         */
        expand() {
            this._applyCollapsed(false);
            this.$el.find('.ts-nav__item--open').each((_, el) => {
                const $item   = $(el);
                const $drawer = this._getDrawer($item);
                if (!$drawer || !$drawer.length) return;
                const $inner = $drawer.children('.ts-nav__child-list');
                if (!$inner.length) return;
                const target = $inner[0].scrollHeight;
                $drawer.css({ height: target + 'px', overflow: '' });
                const t = setTimeout(() => {
                    if ($item.hasClass('ts-nav__item--open')) $drawer.css({ height: 'auto', overflow: '' });
                }, this._parseDuration(this.options.duration));
                $item.data('_tsNavTimer', t);
            });
            return this;
        }

        /** Toggle between collapsed and expanded. */
        toggle() { return this._isCollapsed ? this.expand() : this.collapse(); }

        /** Programmatically set collapsed state (sidebar). */
        setCollapsed(state) { return state ? this.collapse() : this.expand(); }

        /** Open a parent item's child drawer (no-op if already open). */
        openGroup($item) {
            if (!$item.hasClass('ts-nav__item--open')) this._toggleDrawer($item);
            return this;
        }

        /** Close a parent item's child drawer. */
        closeGroup($item) {
            if ($item.hasClass('ts-nav__item--open')) this._toggleDrawer($item);
            return this;
        }

        /** Toggle a parent item's child drawer. */
        toggleGroup($item) { return this._toggleDrawer($item); }

        /** Open every drawer in the navigation. */
        expandAll() {
            this.$el.find('.ts-nav__item--has-children').each((_, el) => this.openGroup($(el)));
            return this;
        }

        /** Close every drawer in the navigation. */
        collapseAll() {
            this.$el.find('.ts-nav__item--has-children.ts-nav__item--open').each((_, el) => this.closeGroup($(el)));
            return this;
        }

        /**
         * Set the active leaf item. Clears all existing active / branch-active
         * states, marks $item, and walks its ancestors to mark branch-active
         * and open any closed drawers along the way.
         * @param {jQuery} $item
         */
        setActive($item) {
            const $el = this.$el;

            $el.find('.ts-nav__item--active')
                .removeClass('ts-nav__item--active')
                .children('.ts-nav__link').removeAttr('aria-current');

            $el.find('.ts-nav__item--branch-active')
                .removeClass('ts-nav__item--branch-active');

            $item.addClass('ts-nav__item--active');
            $item.children('.ts-nav__link').attr('aria-current', 'page');

            // Open ancestor drawers and mark branch
            $item.parents('.ts-nav__item--has-children').each((_, el) => {
                const $anc = $(el);
                $anc.addClass('ts-nav__item--branch-active');
                this.openGroup($anc);
            });

            return this;
        }

        /**
         * Set active on a nested child item, open its parent drawer, and
         * mark the parent branch-active. Clears any previous active leaf.
         * @param {jQuery} $sub
         */
        setSubActive($sub) {
            const $el = this.$el;

            $el.find('.ts-nav__item--active')
                .removeClass('ts-nav__item--active')
                .children('.ts-nav__link').removeAttr('aria-current');

            $sub.addClass('ts-nav__item--active');
            $sub.children('.ts-nav__link').attr('aria-current', 'page');

            // Walk up and open all ancestor drawers
            $sub.parents('.ts-nav__item--has-children').each((_, el) => {
                const $anc    = $(el);
                const $drawer = this._getDrawer($anc);
                $anc.addClass('ts-nav__item--branch-active ts-nav__item--open');
                $anc.children('.ts-nav__link').attr('aria-expanded', 'true');
                if ($drawer && $drawer.length) $drawer.css({ height: '', overflow: '' });
            });

            return this;
        }

        /**
         * Return the current active element.
         * - sidebar/panel: { item: jQuery, subItem: jQuery }
         * - megamenu: active panel index (number) or -1
         */
        getActive() {
            if (this.options.mode === 'megamenu') return this._activePanel;
            return {
                item:    this.$el.find('.ts-nav__item--active').first(),
                subItem: this.$el.find('.ts-nav__item--active .ts-nav__child-list .ts-nav__item--active').first()
            };
        }

        /**
         * Open the mega-menu panel at the given index. Closes any currently
         * open panel first.
         * @param {number} index
         */
        open(index) {
            const self = this;
            const o    = self.options;
            const item = self._panelItems[index];
            if (!item) return this;

            if (self._activePanel > -1 && self._activePanel !== index) {
                self._closePanel(self._panelItems[self._activePanel], false);
            }

            self._activePanel = index;
            item.$trigger.attr('aria-expanded', 'true');

            if (o.useViewport && self.$viewport && self.$viewport.length) {
                self._positionViewport(item);
                self.$viewport.addClass('ts-nav-viewport-active');
                self.$viewport.find('[data-nav-content]').not(item.$content).hide();
                item.$content.show();
            }

            item.$content
                .removeClass(o.animationOut)
                .addClass('ts-nav-panel-active ' + o.animationIn);

            if (typeof o.onOpen === 'function') o.onOpen(item, self);
            self.$el.trigger('panel.open.ts.navigation', [{ index, $item: item.$item }]);

            return this;
        }

        /** Close the currently open mega-menu panel. */
        close() {
            const self = this;
            if (self._activePanel === -1) return this;
            const item = self._panelItems[self._activePanel];
            self._activePanel = -1;
            if (item) self._closePanel(item, true);
            return this;
        }

        /**
         * Toggle the mega-menu panel at index. Closes if already open,
         * opens otherwise.
         * @param {number} index
         */
        togglePanel(index) {
            return this._activePanel === index ? this.close() : this.open(index);
        }

        /** Return the currently open panel index, or -1. */
        getActivePanel() { return this._activePanel; }

        /** Fully tear down — removes all classes, injected nodes, event handlers,
         *  ARIA attributes, and the instance data key. Returns `this` for chaining. */
        destroy() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            // Cancel in-flight animations/timers
            self._raf.forEach(id => cancelAnimationFrame(id));
            self._timers.forEach(id => clearTimeout(id));
            $el.find('[data-nav-item]').each(function() {
                clearTimeout($(this).data('_tsNavTimer'));
            });
            clearTimeout(self._openTimer);
            clearTimeout(self._closeTimer);
            clearTimeout(self._resizeTimer);

            // Run registered teardown callbacks (window/document event removals)
            self._cleanup.forEach(fn => { try { fn(); } catch (_) {} });

            $el.off('.tsNav');

            if (o.mode === 'megamenu') {
                // Restore portaled content panels to original parent
                if (o.useViewport && self.$viewport && self.$viewport.length) {
                    self._panelItems.forEach(item => {
                        if (item.$originalParent) item.$content.appendTo(item.$originalParent);
                    });
                    self.$viewport
                        .removeClass('ts-nav-viewport-active')
                        .hide()
                        .removeAttr('style');
                }
                self._panelItems.forEach(item => {
                    item.$trigger.removeAttr('aria-expanded aria-controls aria-haspopup id');
                    item.$content.attr('id', function(_, v) { return v && v.startsWith('ts-nav-content') ? null : v; });
                    item.$content.removeAttr('role aria-labelledby');
                    item.$content.removeClass('ts-nav-panel-active ' + o.animationIn + ' ' + o.animationOut);
                    item.$item.off('.tsNav');
                    item.$trigger.off('.tsNav');
                    item.$content.off('.tsNav');
                });
                $el.removeAttr('data-nav-orientation');

            } else {
                // Unwrap animated drawer shells
                $el.find('.ts-nav__drawer').each(function() {
                    $(this).children('[data-nav-child-items]').unwrap();
                });

                // Remove injected nodes by the tagged attribute
                $el.find('[data-ts-nav-injected="chevron"]').remove();
                $el.find('[data-ts-nav-injected="caret"]').remove();
                $el.find('[data-ts-nav-injected="toggle"]').remove();
                $el.find('[data-ts-nav-injected="section-title"]').remove();
                $el.find('[data-ts-nav-injected="link"]').each(function() {
                    const $s = $(this);
                    $s.children().insertBefore($s);
                    $s.remove();
                });

                // Strip ARIA and injected attributes
                $el.find('[aria-controls]').removeAttr('aria-controls');
                $el.find('[aria-expanded]').removeAttr('aria-expanded');
                $el.find('[aria-current]').removeAttr('aria-current');
                $el.find('[aria-disabled]').removeAttr('aria-disabled');
                $el.find('.ts-nav__link[role]').removeAttr('role tabindex');
                $el.find('.ts-nav__drawer').removeAttr('id');
                $el.find('[data-nav-tooltip]').removeAttr('data-nav-tooltip');
                $el.find('[data-ts-nav-depth]').removeAttr('data-ts-nav-depth');
                $el.removeAttr('data-ts-nav-init data-nav-collapsed');

                // Clear decoration data flags and per-item timers
                $el.find('*')
                    .removeData('__tsNavItem')
                    .removeData('__tsNavList')
                    .removeData('__tsNavSection')
                    .removeData('_$drawer')
                    .removeData('_tsNavTimer');

                // Strip inline depth CSS vars
                $el.find('.ts-nav__link').css('--ts-nav-depth', '');

                // Strip all injected classes from descendants
                const classes = [
                    'ts-nav__actions', 'ts-nav__actions-title',
                    'ts-nav__header', 'ts-nav__logo', 'ts-nav__title', 'ts-nav__toggle',
                    'ts-nav__body', 'ts-nav__footer',
                    'ts-nav__section', 'ts-nav__section-title',
                    'ts-nav__list', 'ts-nav__item', 'ts-nav__item--active',
                    'ts-nav__item--branch-active', 'ts-nav__item--has-children',
                    'ts-nav__item--open', 'ts-nav__item--disabled',
                    'ts-nav__link', 'ts-nav__icon', 'ts-nav__label', 'ts-nav__badge',
                    'ts-nav__metadata', 'ts-nav__chevron', 'ts-nav__active-caret',
                    'ts-nav__child-list', 'ts-nav__separator',
                ].join(' ');
                $el.find('*').removeClass(classes);

                $el.css({ transition: '' });
            }

            // Strip root-level classes and CSS custom properties
            $el.removeClass([
                'ts-nav', 'ts-nav--sidebar', 'ts-nav--panel', 'ts-nav--megamenu',
                'ts-nav--dark', 'ts-nav--bordered', 'ts-nav--compact', 'ts-nav--fill',
                'ts-nav--collapsed', 'ts-nav--mobile',
                'ts-nav--indicator-caret', 'ts-nav--indicator-bar',
                'ts-nav--indicator-both',  'ts-nav--indicator-none',
            ].join(' '));
            $el.css({
                '--ts-nav-width': '', '--ts-nav-width-collapsed': '',
                '--ts-nav-duration': '', '--ts-nav-indent-step': '', '--ts-nav-accent': '',
            });
            $el.removeAttr('role');

            $el.removeData(instanceName);

            // Nullify instance references
            self._raf = []; self._timers = []; self._cleanup = []; self._panelItems = [];
            self.$header = self.$body = self.$footer = self.$actions = self.$toggle = null;

            return this;
        }

        /** Destroy and re-initialize with the same options. Returns the new instance. */
        refresh() {
            const $el  = this.$el;
            const opts = $.extend(true, {}, this.options);
            delete opts.wrapper;
            this.destroy();
            return new PluginNavigation($el, opts);
        }

        /**
         * Animate a parent item's drawer open or closed.
         * Uses the proven scrollHeight px->px technique then clears to 'auto'
         * so the CSS open-state rule (height: auto) takes control.
         * @param {jQuery} $item
         */
        _toggleDrawer($item) {
            const self    = this;
            const $el     = self.$el;
            const isOpen  = $item.hasClass('ts-nav__item--open');
            const $drawer = self._getDrawer($item);
            const $link   = $item.children('.ts-nav__link').first();
            if (!$drawer || !$drawer.length) return this;

            const dur = self._parseDuration(self.options.duration);
            clearTimeout($item.data('_tsNavTimer'));

            // Accordion: close sibling drawers before opening this one
            if (!isOpen && self.options.accordion) {
                $item.siblings('.ts-nav__item--has-children.ts-nav__item--open')
                    .each(function() { self.closeGroup($(this)); });
            }

            const $inner = $drawer.children('.ts-nav__child-list');

            if (!isOpen) {
                // OPEN
                $item.addClass('ts-nav__item--open');
                $link.attr('aria-expanded', 'true');

                $drawer.css({ overflow: 'hidden', height: '0px' });
                const target = $inner[0].scrollHeight;
                $drawer[0].offsetHeight; // force reflow
                $drawer.css('height', target + 'px');

                $el.trigger('drawer.toggle.ts.navigation', [{ $item, open: true }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    // 'auto' (not '') so the CSS height:0 base rule is overridden
                    $drawer.css({ height: 'auto', overflow: '' });
                }, dur);
                $item.data('_tsNavTimer', t);

            } else {
                // CLOSE 
                const current = $drawer[0].scrollHeight;
                $drawer.css({ overflow: 'hidden', height: current + 'px' });
                $drawer[0].offsetHeight; // force reflow
                $item.removeClass('ts-nav__item--open');
                $link.attr('aria-expanded', 'false');
                $drawer.css('height', '0px');

                $el.trigger('drawer.toggle.ts.navigation', [{ $item, open: false }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $drawer.css('overflow', '');
                }, dur);
                $item.data('_tsNavTimer', t);
            }

            return this;
        }

        /** Apply or remove the collapsed state (sidebar). */
        _applyCollapsed(collapsed) {
            const $el = this.$el;
            this._isCollapsed = collapsed;
            $el.toggleClass('ts-nav--collapsed', collapsed);
            $el.attr('data-nav-collapsed', collapsed ? 'true' : 'false');
            $el.trigger('sidebar.toggle.ts.navigation', [{ collapsed }]);
            return this;
        }

        /**
         * Wire a window resize listener that collapses/expands the sidebar
         * based on viewport width (sidebar mode only).
         */
        _bindResponsive() {
            const self = this;
            const ns   = 'resize.tsNav-' + self._uid;

            self._resizeHandler = () => {
                const isMobile = window.innerWidth <= self.options.mobileBreakpoint;
                self.$el.toggleClass('ts-nav--mobile', isMobile);
                if (isMobile && self.options.collapseOnMobile && !self._isCollapsed) self.collapse();
                if (!isMobile && self.options.collapseOnMobile && self._isCollapsed) self.expand();
            };

            $(window).on(ns, self._resizeHandler);
            self._cleanup.push(() => $(window).off(ns, self._resizeHandler));
            self._resizeHandler(); // apply immediately
        }

        _closePanel(item, animate) {
            const self = this;
            const o    = self.options;
            if (!item || !item.$trigger) return;

            item.$trigger.attr('aria-expanded', 'false');

            const done = () => {
                item.$content.removeClass('ts-nav-panel-active ' + o.animationIn + ' ' + o.animationOut);
                if (o.useViewport && self.$viewport && self.$viewport.length) {
                    self.$viewport.removeClass('ts-nav-viewport-active').hide();
                }
                if (typeof o.onClose === 'function') o.onClose(item, self);
                self.$el.trigger('panel.close.ts.navigation', [{ index: item.index, $item: item.$item }]);
            };

            if (animate && o.animationOut) {
                item.$content.removeClass(o.animationIn).addClass(o.animationOut);
                const t = setTimeout(done, o.animationDuration);
                item.$content.one('animationend.tsNav', () => { clearTimeout(t); done(); });
            } else {
                done();
            }
        }

        _positionViewport(item) {
            const navRect  = this.$el[0].getBoundingClientRect();
            const trigRect = item.$trigger[0].getBoundingClientRect();
            this.$viewport.css({
                left:  (trigRect.left - navRect.left) + 'px',
                width: (item.$content.outerWidth(true) || 240) + 'px',
            });
        }

        _updateAlignment() {
            const winW = window.innerWidth;
            this._panelItems.forEach(item => {
                const right  = item.$item[0].getBoundingClientRect().right;
                const panelW = item.$content.outerWidth(true) || 240;
                item.$item.toggleClass('ts-nav-align-right', right + panelW > winW);
            });
        }

        _focusTrigger(idx, delta) {
            const next = this._panelItems[idx + delta];
            if (next) next.$trigger.trigger('focus');
        }

        _focusFirstInContent(idx) {
            const item = this._panelItems[idx];
            if (!item) return;
            item.$content.find('a, button, [tabindex]').filter(':visible').first().trigger('focus');
        }

        /**
         * Match leaf item hrefs against the current URL and set the best
         * (deepest) match as the active item.
         */
        _autoSetActive() {
            const self      = this;
            const $el       = self.$el;
            const normalize = (url) => {
                try {
                    const u = new URL(url, window.location.origin);
                    return u.origin + (u.pathname.replace(/\/+$/, '') || '/');
                } catch (_) { return null; }
            };
            const current = normalize(window.location.href);
            if (!current) return;

            let best = null, bestDepth = -1;

            $el.find('.ts-nav__item:not(.ts-nav__item--has-children) a.ts-nav__link[href]').each(function() {
                const $link = $(this);
                const link  = normalize($link.attr('href'));
                if (!link || link !== current) return;
                const depth = parseInt($link.parent().attr('data-ts-nav-depth'), 10) || 0;
                if (depth > bestDepth) { best = $link.parent(); bestDepth = depth; }
            });

            if (best) self.setActive(best);
        }

        /**
         * Open ancestor drawers of any elements pre-marked with [data-nav-active].
         * Runs without animation (called during init while transitions are suppressed).
         */
        _expandActiveBranches() {
            const self = this;
            self.$el.find('[data-nav-active]').each(function() {
                $(this).parents('.ts-nav__item--has-children').each(function() {
                    const $anc    = $(this);
                    const $drawer = self._getDrawer($anc);
                    $anc.addClass('ts-nav__item--open ts-nav__item--branch-active');
                    $anc.children('.ts-nav__link').attr('aria-expanded', 'true');
                    if ($drawer && $drawer.length) $drawer.css({ height: '', overflow: '' });
                });
            });
        }

        /** Retrieve the animated drawer for a parent item (cached or DOM search). */
        _getDrawer($item) {
            return $item.data('_$drawer') ||
                   $item.children('.ts-nav__drawer').first() || null;
        }

        _chevronSVG() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' +
                   'viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" ' +
                   'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                   '<polyline points="4 6 8 10 12 6"/></svg>';
        }

        _caretRightSVG() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" ' +
                   'viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" ' +
                   'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                   '<polyline points="6 4 10 8 6 12"/></svg>';
        }

        /**
         * Parse a CSS duration string to milliseconds.
         * @param {string|number} str
         * @returns {number}
         */
        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 240;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 240;
        }

    }

    PluginNavigation.defaults = {
        /* Universal */
        /** Layout mode: 'sidebar' | 'panel' | 'megamenu' */
        mode:              'sidebar',
        /** Dark colour scheme. */
        dark:              false,
        /** Compact (denser) row spacing. */
        compact:           false,
        /** Wrap in a bordered card. */
        bordered:          false,
        /** Transition / animation duration. */
        duration:          '240ms',
        /**
         * Active-item left indicator style.
         * 'bar'   — left accent bar          (sidebar default — from SideNav)
         * 'caret' — caret-right at row end   (panel default   — from PanelNav)
         * 'both'  — bar + caret-right
         * 'none'  — colour/weight change only
         */
        activeIndicator:   'bar',
        /** Accent colour override (any CSS <color>). Empty = theme default. */
        accent:            '',
        /** Auto-detect and mark the active leaf from the current page URL on load. */
        activeOnLoad:      true,

        /* Sidebar + Panel */
        /** Stretch to fill container height (requires [data-nav-body] wrapper). */
        fill:              false,
        /** Navigation panel / sidebar width (any CSS length). */
        width:             '260px',
        /** Per-depth indent applied to child rows. */
        indentStep:        '1rem',
        /** Only one drawer open at a time (accordion behaviour). */
        accordion:         false,
        /** Open ancestor drawers of pre-marked [data-nav-active] items on load. */
        autoExpandActive:  true,

        /** Start in collapsed (icon-only) mode. */
        collapsed:         false,
        /** Collapsed / icon-only rail width. */
        widthCollapsed:    '64px',
        /** Inject the built-in collapse-toggle button in the header. */
        showToggle:        false,
        /** Collapse the sidebar when a leaf item is clicked. */
        autoCollapse:      false,
        /**
         * Viewport width (px) below which the sidebar is treated as mobile.
         * Null disables responsive behaviour.
         */
        mobileBreakpoint:  null,
        /** Auto-collapse below mobileBreakpoint, expand above it. */
        collapseOnMobile:  false,

        /** Layout axis for the trigger row. */
        orientation:       'horizontal',
        /** What opens content panels. */
        openOn:            'hover',
        /** Hover-open delay (ms). */
        delay:             200,
        /** Hover-close delay (ms). */
        closeDelay:        150,
        /** CSS class added when a panel opens. */
        animationIn:       'ts-nav-in',
        /** CSS class added when a panel closes. */
        animationOut:      'ts-nav-out',
        /** Fallback close timeout when animationend does not fire. */
        animationDuration: 200,
        /** Move content panels into [data-nav-viewport] for shared-box transitions. */
        useViewport:       false,
        /** Close the open panel when Escape is pressed. */
        closeOnEscape:     true,
        /** Close the open panel when the user clicks outside. */
        closeOnOutside:    true,
        /** Callback fired after a panel opens. fn(itemRecord, instance) */
        onOpen:            null,
        /** Callback fired after a panel closes. fn(itemRecord, instance) */
        onClose:           null,

        /** Skip IntersectionObserver — navigation is layout-critical. */
        forceInit:         true,
        /** IntersectionObserver root-margin offset (unused with forceInit). */
        accY:              0,
    };

    $.extend(themestrap, { PluginNavigation });

    $.fn.themestrapPluginNavigation = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginNavigation($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
