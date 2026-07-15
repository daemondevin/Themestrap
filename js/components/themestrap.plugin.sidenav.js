// SideNav
(((themestrap = {}, $) => {

    const instanceName = '__pluginSideNav';

    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-sidenav-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginSideNav */
.ts-sidenav {
    --ts-sidenav-width:             260px;
    --ts-sidenav-width-collapsed:   64px;
    --ts-sidenav-duration:          250ms;
    --ts-sidenav-easing:            cubic-bezier(0.4, 0, 0.2, 1);

    /* Colours — override via CSS or data-plugin-options */
    --ts-sidenav-bg:                var(--light);
    --ts-sidenav-border-color:      var(--light--200);
    --ts-sidenav-header-bg:         var(--light--100);
    --ts-sidenav-footer-bg:         var(--light--300);

    --ts-sidenav-text:              var(--default);
    --ts-sidenav-text-muted:        var(--muted);
    --ts-sidenav-icon-color:        var(--grey);
    --ts-sidenav-icon-active-color: var(--primary);

    --ts-sidenav-item-hover-bg:     var(--light-rgba-10);
    --ts-sidenav-item-active-bg:    var(--light-rgba-20);
    --ts-sidenav-item-active-color: var(--primary);
    --ts-sidenav-item-active-border:var(--primary);

    --ts-sidenav-group-title-color: #6b7280;
    --ts-sidenav-sub-item-indent:   2.75rem;

    --ts-sidenav-badge-bg:          #e5e7eb;
    --ts-sidenav-badge-color:       #374151;
    --ts-sidenav-badge-active-bg:   #dbeafe;
    --ts-sidenav-badge-active-color:var(--primary);

    --ts-sidenav-toggle-color:      #6b7280;
    --ts-sidenav-toggle-hover-bg:   #f3f4f6;
}

/* Dark variant */
html.dark .ts-sidenav {
    --ts-sidenav-bg:                var(--dark);
    --ts-sidenav-border-color:      var(--dark--200);
    --ts-sidenav-header-bg:         var(--dark--100);
    --ts-sidenav-footer-bg:         var(--dark);

    --ts-sidenav-text:              var(--light);
    --ts-sidenav-text-muted:        var(--light-rgba-20);
    --ts-sidenav-icon-color:        var(--grey-700));
    --ts-sidenav-icon-active-color: var(--grey-900);

    --ts-sidenav-item-hover-bg:     var(--dark-200);
    --ts-sidenav-item-active-bg:    var(--dark-100);
    --ts-sidenav-item-active-color: #93c5fd;
    --ts-sidenav-item-active-border:#3b82f6;

    --ts-sidenav-group-title-color: var(--dark--300);

    --ts-sidenav-badge-bg:          var(--dark--100);
    --ts-sidenav-badge-color:       var(--light);
    --ts-sidenav-badge-active-bg:   var(--primary-100);
    --ts-sidenav-badge-active-color:var(--primary--200);

    --ts-sidenav-toggle-color:      var(--grey-200);
    --ts-sidenav-toggle-hover-bg:   var(--dark-100);
}

/* Root */
.ts-sidenav {
    display: flex;
    flex-direction: column;
    width: var(--ts-sidenav-width);
    height: 100%;
    background-color: var(--ts-sidenav-bg);
    border-right: 1px solid var(--ts-sidenav-border-color);
    overflow: hidden;
    transition:
        width var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    will-change: width;
    flex-shrink: 0;
    position: relative;
    z-index: 100;
}

.ts-sidenav--collapsed {
    width: var(--ts-sidenav-width-collapsed);
}

/* Header */
.ts-sidenav__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0.75rem 1rem 1rem;
    min-height: 4rem;
    background-color: var(--ts-sidenav-header-bg);
    border-bottom: 1px solid var(--ts-sidenav-border-color);
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
}

.ts-sidenav__logo {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ts-sidenav__logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.ts-sidenav__logo i,
.ts-sidenav__logo svg {
    font-size: 1.25rem;
    color: var(--ts-sidenav-icon-active-color);
}

.ts-sidenav__title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ts-sidenav-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
    transition: opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
}

.ts-sidenav--collapsed .ts-sidenav__title {
    opacity: 0;
    pointer-events: none;
    width: 0;
}

/* Collapse toggle button */
.ts-sidenav__toggle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    color: var(--ts-sidenav-toggle-color);
    transition:
        background-color 150ms ease,
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        transform var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    padding: 0;
    line-height: 1;
}

.ts-sidenav__toggle:hover {
    background-color: var(--ts-sidenav-toggle-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__toggle:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
    outline-offset: 2px;
}

.ts-sidenav--collapsed .ts-sidenav__toggle {
    transform: rotate(180deg);
}

/* Body (scrollable nav area) */
.ts-sidenav__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem 0;

    /* Thin scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--ts-sidenav-border-color) transparent;
}

.ts-sidenav__body::-webkit-scrollbar {
    width: 4px;
}

.ts-sidenav__body::-webkit-scrollbar-track {
    background: transparent;
}

.ts-sidenav__body::-webkit-scrollbar-thumb {
    background-color: var(--ts-sidenav-border-color);
    border-radius: 2px;
}

/* Groups */
.ts-sidenav__group {
    padding: 0.25rem 0;
}

.ts-sidenav__group + .ts-sidenav__group {
    border-top: 1px solid var(--ts-sidenav-border-color);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
}

.ts-sidenav__group-title {
    display: flex;
    align-items: center;
    padding: 0.375rem 1rem 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ts-sidenav-group-title-color);
    white-space: nowrap;
    overflow: hidden;
    transition: opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    user-select: none;
}

.ts-sidenav--collapsed .ts-sidenav__group-title {
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
}

/* Nav items */
.ts-sidenav__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    margin: 0.0625rem 0.5rem;
    border-radius: 0.375rem;
    text-decoration: none !important;
    color: var(--ts-sidenav-text);
    cursor: pointer;
    position: relative;
    transition:
        background-color 150ms ease,
        color 150ms ease;
    border: none;
    background: transparent;
    width: calc(100% - 1rem);
    text-align: left;
    user-select: none;
    outline-offset: -2px;
}

.ts-sidenav__item::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: var(--ts-sidenav-item-active-border);
    border-radius: 0 2px 2px 0;
    transition: height 150ms ease;
}

.ts-sidenav__item:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__item:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
}

.ts-sidenav__item--active {
    background-color: var(--ts-sidenav-item-active-bg);
    color: var(--ts-sidenav-item-active-color);
    font-weight: 500;
}

.ts-sidenav__item--active::before {
    height: 60%;
}

/* Item icon */
.ts-sidenav__item-icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-sidenav-icon-color);
    transition: color 150ms ease;
    font-size: 1rem;
}

.ts-sidenav__item--active .ts-sidenav__item-icon {
    color: var(--ts-sidenav-icon-active-color);
}

.ts-sidenav__item:hover .ts-sidenav__item-icon {
    color: var(--ts-sidenav-text);
}

.ts-sidenav__item--active:hover .ts-sidenav__item-icon {
    color: var(--ts-sidenav-icon-active-color);
}

/* Item label */
.ts-sidenav__item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition:
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        max-width var(--ts-sidenav-duration) var(--ts-sidenav-easing);
}

.ts-sidenav--collapsed .ts-sidenav__item-label {
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    pointer-events: none;
}

/* Badge */
.ts-sidenav__item-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.3125rem;
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1;
    border-radius: 0.625rem;
    background-color: var(--ts-sidenav-badge-bg);
    color: var(--ts-sidenav-badge-color);
    transition:
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        background-color 150ms ease;
}

.ts-sidenav__item--active .ts-sidenav__item-badge {
    background-color: var(--ts-sidenav-badge-active-bg);
    color: var(--ts-sidenav-badge-active-color);
}

.ts-sidenav--collapsed .ts-sidenav__item-badge {
    opacity: 0;
    pointer-events: none;
}

/* Chevron (for parent items) */
.ts-sidenav__item-chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    color: var(--ts-sidenav-text-muted);
    transition:
        transform var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    font-size: 0.75rem;
}

.ts-sidenav--collapsed .ts-sidenav__item-chevron {
    opacity: 0;
    pointer-events: none;
}

.ts-sidenav__item--open > .ts-sidenav__item-chevron {
    transform: rotate(180deg);
}

/* Parent items with sub-nav: wrap so the sub-shell occupies its own full-width
   row below the icon/label/chevron row. Without this, the sub-shell sits as a
   flex sibling of the label and its content width squeezes the label to zero. */
.ts-sidenav__item--has-children {
    flex-wrap: wrap;
    row-gap: 0;
}

/* Sub-items (nested nav) */
.ts-sidenav__sub-shell {
    /* Force the shell into its own flex row so it does not compete with the
       label for horizontal space. flex-basis / width both need to be 100%. */
    width: 100%;
    overflow: hidden;
    height: 0;
    transition: height var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    will-change: height;
}

/* Open state: allow natural height.
   CRITICAL — without this rule, clearing the JS inline height style reverts
   control to height: 0 above and the shell snaps closed the moment the
   open animation finishes. */
.ts-sidenav__item--open > .ts-sidenav__sub-shell {
    height: auto;
    overflow: visible;
}

.ts-sidenav__sub-items {
    padding: 0.125rem 0 0.25rem 0;
}

.ts-sidenav__sub-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem 0.375rem var(--ts-sidenav-sub-item-indent);
    margin: 0.0625rem 0.5rem;
    border-radius: 0.375rem;
    text-decoration: none !important;
    color: var(--ts-sidenav-text);
    font-size: 0.875rem;
    line-height: 1.25rem;
    cursor: pointer;
    position: relative;
    transition: background-color 150ms ease, color 150ms ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
}

.ts-sidenav__sub-item:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__sub-item:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
    outline-offset: -2px;
}

.ts-sidenav__sub-item--active {
    background-color: var(--ts-sidenav-item-active-bg);
    color: var(--ts-sidenav-item-active-color);
    font-weight: 500;
}

/* Sub-item left dot indicator */
.ts-sidenav__sub-item::before {
    content: '';
    position: absolute;
    left: calc(var(--ts-sidenav-sub-item-indent) - 0.75rem);
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--ts-sidenav-border-color);
    transition: background-color 150ms ease;
}

.ts-sidenav__sub-item--active::before,
.ts-sidenav__sub-item:hover::before {
    background-color: var(--ts-sidenav-item-active-border);
}

/* Sub-items hidden in collapsed mode — CSS handles the visual; JS handles open state restoration */
.ts-sidenav--collapsed .ts-sidenav__sub-shell {
    height: 0 !important;
    overflow: hidden;
}

/* Footer */
.ts-sidenav__footer {
    flex-shrink: 0;
    padding: 0.5rem 0;
    background-color: var(--ts-sidenav-footer-bg);
    border-top: 1px solid var(--ts-sidenav-border-color);
    overflow: hidden;
}

.ts-sidenav__btn-group {
    align-items: center;
    display: flex;
    justify-content: space-evenly;
    padding-inline: 1rem;
}

.ts-sidenav__buttons {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin-bottom: -1px;
    min-width: 0;
    position: relative;
    white-space: nowrap;
}

.ts-sidenav__btn-divider {
    background: var(--ts-sidenav-border-color);;
    content: "";
    display: block;
    height: 1.25rem;
    width: .0625rem;
}

.ts-sidenav__item-btn {
    box-shadow: none;
    color: var(--ts-sidenav-text);
}

.ts-sidenav__item-btn:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

/* Tooltip on collapsed items (pure CSS, driven by data-ts-sidenav-tooltip attr) */
.ts-sidenav--collapsed .ts-sidenav__item[data-ts-sidenav-tooltip] {
    position: relative;
}

.ts-sidenav--collapsed .ts-sidenav__item[data-ts-sidenav-tooltip]:hover::after {
    content: attr(data-ts-sidenav-tooltip);
    position: absolute;
    left: calc(var(--ts-sidenav-width-collapsed) - 0.5rem);
    top: 50%;
    transform: translateY(-50%);
    background-color: #1f2937;
    color: #f9fafb;
    padding: 0.3125rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 200;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);
}

/* Collapsed: centre the icon */
.ts-sidenav--collapsed .ts-sidenav__item {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    width: calc(var(--ts-sidenav-width-collapsed) - 1rem);
    margin-left: 0.5rem;
}

.ts-sidenav--collapsed .ts-sidenav__item::before {
    left: -0.5rem;
}

/* Accessibility */
.ts-sidenav__item[aria-disabled="true"] {
    opacity: 0.45;
    pointer-events: none;
    cursor: not-allowed;
}

/* Separator */
.ts-sidenav__separator {
    height: 1px;
    background-color: var(--ts-sidenav-border-color);
    margin: 0.5rem 1rem;
}
`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginSideNav {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el    = $el;
            this._cleanup = [];
            this._raf     = [];

            // Unique namespace keeps multiple instances on one page from
            // interfering with each other's window event listeners.
            this._uid = 'tsSideNav_' + Math.random().toString(36).slice(2, 9);

            this
                .setData()
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
            this.options = $.extend(true, {}, PluginSideNav.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            $el.addClass('ts-sidenav');

            if (options.dark) {
                $el.addClass('ts-sidenav--dark');
            }

            if (options.width !== PluginSideNav.defaults.width) {
                $el.css('--ts-sidenav-width', options.width);
            }

            if (options.widthCollapsed !== PluginSideNav.defaults.widthCollapsed) {
                $el.css('--ts-sidenav-width-collapsed', options.widthCollapsed);
            }

            if (options.duration !== PluginSideNav.defaults.duration) {
                $el.css('--ts-sidenav-duration', options.duration);
            }

            self._buildHeader();
            self._buildBody();
            self._buildFooter();
            self._buildGroups();

            // Suppress the width transition on first paint so there's no
            // animated flash from 260px → collapsed width on page load.
            $el[0].style.transition = 'none';
            self._isCollapsed = false;

            if (options.collapsed) {
                // animate=false: CSS transition is already suppressed above.
                self._applyCollapsed(true);
            }

            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => {
                    $el[0].style.removeProperty('transition');
                });
                self._raf.push(raf2);
            });
            self._raf.push(raf1);

            if (options.activeOnLoad) {
                self._autoSetActive();
            }

            // Only wire responsive handling when explicitly opted-in.
            if (options.mobileBreakpoint) {
                self._bindResponsive();
            }

            return this;
        }

        /**
         * Wire a resize listener that collapses/expands the sidebar based on
         * viewport width. Only activated when `mobileBreakpoint` is non-zero.
         *
         * Uses a per-instance event namespace (`this._uid`) so multiple
         * sidebar instances on the same page never clobber each other.
         */
        _bindResponsive() {
            const self      = this;
            const namespace = 'resize.' + self._uid;

            self._resizeHandler = () => {
                const isMobile = window.innerWidth <= self.options.mobileBreakpoint;

                self.$el.toggleClass('ts-sidenav--mobile', isMobile);

                if (isMobile) {
                    if (self.options.collapseOnMobile && !self._isCollapsed) {
                        self.collapse();
                    }
                } else {
                    // Use the live collapsed state, not the frozen initial option.
                    if (self.options.collapseOnMobile && self._isCollapsed) {
                        self.expand();
                    }
                }
            };

            $(window).on(namespace, self._resizeHandler);

            // Register teardown so destroy() can remove this handler cleanly.
            self._cleanup.push(() => {
                $(window).off(namespace, self._resizeHandler);
            });

            // Run immediately to apply the correct initial state.
            self._resizeHandler();
        }

        _buildHeader() {
            const self = this;
            const $el  = self.$el;

            self.$header = $el.find('[data-sidenav-header]').first();
            if (!self.$header.length) return;

            self.$header.addClass('ts-sidenav__header');

            const $logo = self.$header.children('[data-sidenav-logo]').first();
            if ($logo.length) {
                $logo.addClass('ts-sidenav__logo');
            }

            const $title = self.$header.children('[data-sidenav-title]').first();
            if ($title.length) {
                $title.addClass('ts-sidenav__title');
            }

            let $toggle = self.$header.children('[data-sidenav-toggle]').first();

            if (!$toggle.length && self.options.showToggle) {
                $toggle = $(
                    '<button type="button" aria-label="Toggle sidebar"' +
                    ' data-sidenav-toggle data-ts-sidenav-injected-toggle="true"></button>'
                );
                $toggle.html(self._chevronIcon());
                self.$header.append($toggle);
            }

            if ($toggle.length) {
                $toggle.addClass('ts-sidenav__toggle');
                self.$toggle = $toggle;
            }
        }

        _buildBody() {
            const self = this;
            const $el  = self.$el;

            self.$body = $el.find('[data-sidenav-body]').first();
            if (self.$body.length) {
                self.$body.addClass('ts-sidenav__body');
            }
        }

        _buildFooter() {
            const self = this;
            const $el  = self.$el;

            self.$footer = $el.find('[data-sidenav-footer]').first();
            if (!self.$footer.length) return;

            self.$footer.addClass('ts-sidenav__footer');

            self.$footer.children('[data-sidenav-item]').each(function() {
                self._decorateItem($(this));
            });
        }

        _buildGroups() {
            const self = this;
            const $el  = self.$el;

            $el.find('[data-sidenav-group]').each(function() {
                const $group = $(this);
                $group.addClass('ts-sidenav__group');

                const groupTitle =
                    $group.attr('data-sidenav-group-title') ||
                    $group.attr('data-sidenav-group') ||
                    '';

                if (groupTitle) {
                    let $gt = $group.children('[data-sidenav-group-label]').first();

                    if (!$gt.length) {
                        $gt = $('<div data-sidenav-group-label></div>').text(groupTitle);
                        $group.prepend($gt);
                    }

                    $gt.addClass('ts-sidenav__group-title');
                }

                $group.children('[data-sidenav-item]').each(function() {
                    self._decorateItem($(this));
                });
            });

            // Items that sit directly inside the body (not inside a group)
            const $bodyArea = self.$body && self.$body.length ? self.$body : $el;

            $bodyArea.children('[data-sidenav-item]').each(function() {
                self._decorateItem($(this));
            });

            $el.find('[data-sidenav-separator]').addClass('ts-sidenav__separator');
        }

        /**
         * Decorate a single nav item and its sub-items.
         * Guards against double-decoration with jQuery data flag.
         * @param {jQuery} $item
         */
        _decorateItem($item) {
            const self = this;

            if ($item.data('__tsSidenavDecorated')) return;
            $item.data('__tsSidenavDecorated', true);

            $item.addClass('ts-sidenav__item');

            if ($item.is('[data-sidenav-active]')) {
                $item.addClass('ts-sidenav__item--active');
                $item.attr('aria-current', 'page');
            }

            const $icon      = $item.children('[data-sidenav-icon]').first();
            const $label     = $item.children('[data-sidenav-label]').first();
            const $badge     = $item.children('[data-sidenav-badge]').first();
            const $chevron   = $item.children('[data-sidenav-chevron]').first();
            const $subContainer = $item.children('[data-sidenav-sub-items]').first();

            $icon.addClass('ts-sidenav__item-icon');
            $label.addClass('ts-sidenav__item-label');
            $badge.addClass('ts-sidenav__item-badge');
            $chevron.addClass('ts-sidenav__item-chevron');

            const tooltipText = $label.text().trim() || $item.attr('title') || '';
            if (tooltipText) {
                $item.attr('data-ts-sidenav-tooltip', tooltipText);
            }

            if ($subContainer.length || $item.is('[data-sidenav-has-children]')) {
                $item.addClass('ts-sidenav__item--has-children');

                // Inject a chevron if the markup doesn't already have one.
                if (!$item.children('.ts-sidenav__item-chevron').length) {
                    const $chev = $(
                        '<span aria-hidden="true" data-ts-sidenav-injected-chevron="true"></span>'
                    );
                    $chev.addClass('ts-sidenav__item-chevron').html(self._chevronIcon());
                    $item.append($chev);
                }

                if ($subContainer.length) {
                    $subContainer.addClass('ts-sidenav__sub-items');

                    $subContainer.children('[data-sidenav-sub-item]').each(function() {
                        self._decorateSubItem($(this));
                    });

                    if (!$subContainer.parent().hasClass('ts-sidenav__sub-shell')) {
                        $subContainer.wrap('<div class="ts-sidenav__sub-shell"></div>');
                    }

                    $item.data('_$subShell', $subContainer.parent());
                }

                // If any child is already active, open the parent immediately
                // (no animation — this runs during init).
                // CSS rule `.ts-sidenav__item--open > .ts-sidenav__sub-shell { height: auto }`
                // provides the open height when the inline style is cleared here.
                const hasActiveChild = $item.find('.ts-sidenav__sub-item--active').length;

                if (hasActiveChild) {
                    $item.addClass('ts-sidenav__item--open');
                    const $shell = self._getShell($item);
                    if ($shell && $shell.length) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }
            }

            if (!$item.is('a')) {
                $item.attr({ role: 'button', tabindex: '0' });
            }
        }

        /**
         * Decorate a sub-item link.
         * @param {jQuery} $sub
         */
        _decorateSubItem($sub) {
            $sub.addClass('ts-sidenav__sub-item');

            if ($sub.is('[data-sidenav-sub-active]')) {
                $sub.addClass('ts-sidenav__sub-item--active');
                $sub.attr('aria-current', 'page');
            }

            if (!$sub.is('a')) {
                $sub.attr({ role: 'button', tabindex: '0' });
            }
        }

        events() {
            const self = this;
            const $el  = self.$el;

            $el.on('click.sidenav', '[data-sidenav-toggle]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggle();
            });

            $el.on('click.sidenav', '.ts-sidenav__item', function(e) {
                const $item = $(this);

                if ($item.is('[data-sidenav-toggle]') ||
                    $item.closest('[data-sidenav-toggle]').length) return;

                if ($item.hasClass('ts-sidenav__item--has-children')) {
                    e.preventDefault();
                    self._toggleSubItems($item);
                    return;
                }

                self.setActive($item);

                const href = $item.attr('href');
                $el.trigger('item.ts.sidenav', [{ $item, href }]);

                if (self.options.autoCollapse && !self._isCollapsed) {
                    self.collapse();
                }
            });

            $el.on('click.sidenav', '.ts-sidenav__sub-item', function(e) {
                // Stop the click from bubbling to the .ts-sidenav__item delegated
                // handler. Without this the parent item's handler fires too,
                // sees --has-children, and calls _toggleSubItems — closing the group.
                e.stopPropagation();
                const $sub = $(this);
                self.setSubActive($sub);
                const href = $sub.attr('href');
                $el.trigger('subitem.ts.sidenav', [{ $item: $sub, href }]);
            });

            $el.on('keydown.sidenav', '[role="button"]', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });

            return this;
        }

        /**
         * Collapse the sidebar to icon-only mode.
         *
         * CSS rule `.ts-sidenav--collapsed .ts-sidenav__sub-shell { height: 0 !important }`
         * handles the visual hiding of open sub-shells. We must NOT set an
         * inline `height: 0px` here — that inline value would persist after
         * expand() removes the `--collapsed` class and block re-expansion.
         */
        collapse() {
            return this._applyCollapsed(true);
        }

        /**
         * Expand the sidebar to full width.
         *
         * Any sub-shells that were open before the collapse still carry the
         * `--open` class. Restore their heights so the user sees them open
         * again without having to re-click.
         */
        expand() {
            this._applyCollapsed(false);

            // Restore previously-open sub-item shells.
            this.$el.find('.ts-sidenav__item--open').each((_, el) => {
                const $item  = $(el);
                const $shell = this._getShell($item);

                if (!$shell || !$shell.length) return;

                const $inner = $shell.children('.ts-sidenav__sub-items');
                if (!$inner.length) return;

                // Measure natural height and set it immediately (no animation
                // needed — the sidebar width transition already provides motion).
                const targetH = $inner[0].scrollHeight;
                $shell.css({ height: targetH + 'px', overflow: '' });

                // Then let it settle to auto so dynamic content resizes freely.
                // The CSS open-state rule (height: auto) takes over when cleared.
                const timerId = setTimeout(() => {
                    if ($item.hasClass('ts-sidenav__item--open')) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }, this._parseDuration(this.options.duration));

                $item.data('_subTimer', timerId);
            });

            return this;
        }

        /**
         * Toggle between collapsed and expanded.
         */
        toggle() {
            return this._isCollapsed ? this.expand() : this.collapse();
        }

        /**
         * Set collapsed state programmatically.
         * @param {boolean} state
         */
        setCollapsed(state) {
            return state ? this.collapse() : this.expand();
        }

        /**
         * Open a specific parent item's sub-nav (no-op if already open).
         * @param {jQuery} $item
         */
        openGroup($item) {
            if (!$item.hasClass('ts-sidenav__item--open')) {
                this._toggleSubItems($item);
            }
            return this;
        }

        /**
         * Close a specific parent item's sub-nav (no-op if already closed).
         * @param {jQuery} $item
         */
        closeGroup($item) {
            if ($item.hasClass('ts-sidenav__item--open')) {
                this._toggleSubItems($item);
            }
            return this;
        }

        /**
         * Return the currently active item and sub-item (if any).
         * @returns {{ item: jQuery, subItem: jQuery }}
         */
        getActive() {
            return {
                item:    this.$el.find('.ts-sidenav__item--active').first(),
                subItem: this.$el.find('.ts-sidenav__sub-item--active').first()
            };
        }

        /**
         * Programmatically set the active top-level item.
         * Clears active from all other items and sub-items.
         * @param {jQuery} $item
         */
        setActive($item) {
            const $el = this.$el;

            $el.find('.ts-sidenav__item--active')
                .removeClass('ts-sidenav__item--active')
                .removeAttr('aria-current');

            $el.find('.ts-sidenav__sub-item--active')
                .removeClass('ts-sidenav__sub-item--active')
                .removeAttr('aria-current');

            $item.addClass('ts-sidenav__item--active').attr('aria-current', 'page');

            return this;
        }

        /**
         * Programmatically set the active sub-item.
         * Clears active from any other sub-item, marks this one, and marks
         * its parent item as active (without adding aria-current to the parent,
         * since the parent is not the current page).
         * @param {jQuery} $sub
         */
        setSubActive($sub) {
            const $el = this.$el;

            $el.find('.ts-sidenav__sub-item--active')
                .removeClass('ts-sidenav__sub-item--active')
                .removeAttr('aria-current');

            $sub.addClass('ts-sidenav__sub-item--active').attr('aria-current', 'page');

            const $parentItem = $sub.closest('.ts-sidenav__item--has-children');

            if ($parentItem.length) {
                $el.find('.ts-sidenav__item--active')
                    .not($parentItem)
                    .removeClass('ts-sidenav__item--active')
                    .removeAttr('aria-current');

                // Parent gets the active highlight class but NOT aria-current —
                // it is the container, not the current page itself.
                $parentItem
                    .addClass('ts-sidenav__item--active ts-sidenav__item--open');
            }

            return this;
        }

        /**
         * Tear down the instance and restore the original DOM.
         */
        destroy() {
            const self = this;
            const $el  = self.$el;

            // Remove all delegated event handlers.
            $el.off('.sidenav');

            // Run registered cleanup callbacks (e.g. window resize handler).
            self._cleanup.forEach(fn => { try { fn(); } catch (e) {} });

            // Cancel any in-flight requestAnimationFrames.
            self._raf.forEach(id => cancelAnimationFrame(id));

            // Cancel any in-flight sub-item accordion timers.
            // Timers are stored via jQuery data on each item element.
            $el.find('[data-sidenav-item]').addBack('[data-sidenav-item]').each(function() {
                const timer = $(this).data('_subTimer');
                if (timer) clearTimeout(timer);
            });

            // Unwrap animated sub-shells.
            $el.find('.ts-sidenav__sub-shell').each(function() {
                const $sub = $(this).children('.ts-sidenav__sub-items');
                if ($sub.length) $sub.unwrap();
            });

            // Remove injected elements.
            $el.find('[data-ts-sidenav-injected-chevron]').remove();
            $el.find('[data-ts-sidenav-injected-toggle]').remove();

            // Strip injected attributes.
            $el.find('[data-ts-sidenav-tooltip]').removeAttr('data-ts-sidenav-tooltip');
            $el.find('[aria-current]').removeAttr('aria-current');
            $el.find('[role="button"]').removeAttr('role tabindex');
            $el.removeAttr('data-sidenav-collapsed');

            // Remove decoration flag from all descendants.
            $el.find('*').removeData('__tsSidenavDecorated').removeData('_subTimer').removeData('_$subShell');

            // Strip all injected classes.
            $el.find('*').removeClass([
                'ts-sidenav__header',
                'ts-sidenav__logo',
                'ts-sidenav__title',
                'ts-sidenav__toggle',
                'ts-sidenav__body',
                'ts-sidenav__footer',
                'ts-sidenav__group',
                'ts-sidenav__group-title',
                'ts-sidenav__item',
                'ts-sidenav__item--active',
                'ts-sidenav__item--has-children',
                'ts-sidenav__item--open',
                'ts-sidenav__item-icon',
                'ts-sidenav__item-label',
                'ts-sidenav__item-badge',
                'ts-sidenav__item-chevron',
                'ts-sidenav__sub-items',
                'ts-sidenav__sub-item',
                'ts-sidenav__sub-item--active',
                'ts-sidenav__separator'
            ].join(' '));

            // Strip root classes and inline custom properties.
            $el.removeClass(
                'ts-sidenav ts-sidenav--dark ts-sidenav--collapsed ts-sidenav--mobile'
            );
            $el.css({
                '--ts-sidenav-width':           '',
                '--ts-sidenav-width-collapsed': '',
                '--ts-sidenav-duration':        '',
                transition:                     ''
            });

            // Remove the instance from element data.
            $el.removeData(instanceName);

            // Clear instance references.
            self._cleanup     = [];
            self._raf         = [];
            self.$header      = null;
            self.$body        = null;
            self.$footer      = null;
            self.$toggle      = null;
            self._resizeHandler = null;

            return this;
        }

        /**
         * Destroy and re-initialize with the same options.
         * Returns the new instance.
         */
        refresh() {
            const $el   = this.$el;
            const opts  = $.extend(true, {}, this.options);
            delete opts.wrapper; // will be re-set by setOptions
            this.destroy();
            return new PluginSideNav($el, opts);
        }

        /**
         * Apply or remove the collapsed state.
         * CSS transition suppression for the initial paint is handled by
         * build() setting `style.transition = 'none'` before this is called.
         * @param {boolean} collapsed
         */
        _applyCollapsed(collapsed) {
            const $el = this.$el;

            this._isCollapsed = collapsed;
            $el.toggleClass('ts-sidenav--collapsed', collapsed);
            $el.attr('data-sidenav-collapsed', collapsed ? 'true' : 'false');
            $el.trigger('toggle.ts.sidenav', [{ collapsed }]);

            return this;
        }

        /**
         * Animate open/close of a parent item's sub-items.
         * @param {jQuery} $item
         */
        _toggleSubItems($item) {
            const self   = this;
            const $el    = self.$el;
            const isOpen = $item.hasClass('ts-sidenav__item--open');
            const $shell = self._getShell($item);

            if (!$shell || !$shell.length) return this;

            const duration = self._parseDuration(self.options.duration);

            // Cancel any in-progress animation for this item.
            clearTimeout($item.data('_subTimer'));

            if (!isOpen) {
                // OPENING
                $item.addClass('ts-sidenav__item--open');
                $shell.css({ overflow: 'hidden', height: '0px' });

                const targetH = $shell.children('.ts-sidenav__sub-items')[0].scrollHeight;

                $shell[0].offsetHeight; // force reflow

                $shell.css('height', targetH + 'px');

                $el.trigger('group-toggle.ts.sidenav', [{ $item, open: true }]);

                const timerId = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    // Set to 'auto' — NOT '' — so the CSS height:0 base rule
                    // does not snap the shell closed when the inline style is removed.
                    $shell.css({ height: 'auto', overflow: '' });
                }, duration);

                $item.data('_subTimer', timerId);

            } else {
                // CLOSING
                const currentH = $shell[0].scrollHeight;
                $shell.css({ overflow: 'hidden', height: currentH + 'px' });

                $shell[0].offsetHeight; // force reflow

                $item.removeClass('ts-sidenav__item--open');
                $shell.css('height', '0px');

                $el.trigger('group-toggle.ts.sidenav', [{ $item, open: false }]);

                const timerId = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $shell.css({ overflow: '' });
                }, duration);

                $item.data('_subTimer', timerId);
            }

            return this;
        }

        /**
         * Walk all item links and match against window.location to set active.
         * Uses the URL API for reliable origin-aware matching with trailing-
         * slash normalisation.
         */
        _autoSetActive() {
            const self    = this;
            const $el     = self.$el;
            let matched   = false;

            const normalize = (url) => {
                try {
                    const u = new URL(url, window.location.origin);
                    return u.origin + (u.pathname.replace(/\/+$/, '') || '/');
                } catch (e) {
                    return null;
                }
            };

            const current = normalize(window.location.href);

            // Walk sub-items first (more specific match wins).
            $el.find('.ts-sidenav__sub-item[href]').each(function() {
                const $sub = $(this);
                const link = normalize($sub.attr('href'));

                if (!link || link !== current) return;

                self.setSubActive($sub);

                const $parentItem = $sub.closest('.ts-sidenav__item--has-children');
                if ($parentItem.length && !$parentItem.hasClass('ts-sidenav__item--open')) {
                    $parentItem.addClass('ts-sidenav__item--open');
                    const $shell = self._getShell($parentItem);
                    if ($shell && $shell.length) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }

                matched = true;
                return false; // break
            });

            if (!matched) {
                $el.find('.ts-sidenav__item[href]').each(function() {
                    const $item = $(this);
                    const link  = normalize($item.attr('href'));

                    if (!link || link !== current) return;

                    self.setActive($item);
                    return false; // break
                });
            }
        }

        /**
         * Retrieve the animated sub-shell for a parent item.
         * Prefers the jQuery-data reference set during decoration (faster),
         * falls back to a direct DOM search.
         * @param {jQuery} $item
         * @returns {jQuery|null}
         */
        _getShell($item) {
            return $item.data('_$subShell') ||
                   $item.children('.ts-sidenav__sub-shell').first() ||
                   null;
        }

        /**
         * Inline chevron SVG — used for the toggle button and auto-injected
         * parent-item chevrons.
         */
        _chevronIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ' +
                   'viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
                   'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
                   'aria-hidden="true"><polyline points="4 6 8 10 12 6"/></svg>';
        }

        /**
         * Parse a CSS duration string to milliseconds.
         * @param {string|number} str
         * @returns {number}
         */
        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 250;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 250;
        }

    }

    PluginSideNav.defaults = {
        /** Start in collapsed (icon-only) mode. */
        collapsed: false,

        /** Use dark color scheme. */
        dark: false,

        /** Expanded sidebar width (any CSS length). */
        width: '260px',

        /** Collapsed / icon-only sidebar width. */
        widthCollapsed: '64px',

        /** CSS transition duration for width and sub-item animations. */
        duration: '250ms',

        /** Inject the built-in collapse toggle button in the header. */
        showToggle: false,

        /** Auto-detect and set active item from the current page URL. */
        activeOnLoad: true,

        /** Collapse sidebar when a leaf item is clicked (useful for mobile overlays). */
        autoCollapse: false,

        /**
         * Viewport width (px) below which the sidebar is treated as mobile.
         * Set to null (the default) to disable responsive behaviour entirely.
         * Only activates when collapseOnMobile is also true.
         */
        mobileBreakpoint: null,

        /**
         * Automatically collapse when the viewport drops below mobileBreakpoint,
         * and expand again when it rises above it.
         * Requires mobileBreakpoint to be non-null.
         */
        collapseOnMobile: false,

        /** forceInit: bypass IntersectionObserver — sidebar is layout-critical. */
        forceInit: true,

        /** accY: IntersectionObserver root margin offset (unused with forceInit). */
        accY: 0
    };

    $.extend(themestrap, { PluginSideNav });

    $.fn.themestrapPluginSideNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginSideNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
