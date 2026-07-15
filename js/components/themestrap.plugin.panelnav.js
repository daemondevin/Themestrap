/**
 * Themestrap Panel Navigation
 *
 * A vertical link list with a caret-right active indicator, expandable
 * drawer-toggle parent sections, optional left icons + right metadata,
 * section headings, and separators.
 */
// Panel Nav
(((themestrap = {}, $) => {

    const instanceName = '__pluginPanelNav';

    // Injected stylesheet — runs once per page, keyed to the plugin style ID.
    const STYLE_ID = 'ts-panel-nav-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginPanelNav (Morningstar-style navigation panel) */
.ts-panel-nav {
    --ts-pn-duration:           240ms;
    --ts-pn-easing:             cubic-bezier(0.4, 0, 0.2, 1);

    /* Geometry */
    --ts-pn-width:              280px;
    --ts-pn-item-pad-y:         0.5rem;
    --ts-pn-item-pad-x:         1rem;
    --ts-pn-indent-step:        1rem;
    --ts-pn-font-size:          0.875rem;

    /* Colours — override via CSS or data-plugin-options */
    --ts-pn-bg:                 #ffffff;
    --ts-pn-border-color:       #e6e9ee;

    --ts-pn-text:               #1c1f23;
    --ts-pn-text-muted:         #6b7785;
    --ts-pn-icon-color:         #6b7785;

    --ts-pn-accent:             var(--color-primary, #2470de);
    --ts-pn-item-hover-bg:      #f4f6f8;
    --ts-pn-item-active-bg:     transparent;
    --ts-pn-item-active-text:   var(--ts-pn-accent);
    --ts-pn-item-active-icon:   var(--ts-pn-accent);
    --ts-pn-active-bar:         var(--ts-pn-accent);

    --ts-pn-section-title:      #8a93a0;
    --ts-pn-metadata-color:     #8a93a0;

    --ts-pn-focus-ring:         var(--ts-pn-accent);

    box-sizing: border-box;
    width: var(--ts-pn-width);
    max-width: 100%;
    background-color: var(--ts-pn-bg);
    color: var(--ts-pn-text);
    font-size: var(--ts-pn-font-size);
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
}

.ts-panel-nav *,
.ts-panel-nav *::before,
.ts-panel-nav *::after { box-sizing: border-box; }

/* Dark variant */
.ts-panel-nav--dark {
    --ts-pn-bg:                 #10151c;
    --ts-pn-border-color:       #232c38;

    --ts-pn-text:               #e7ecf2;
    --ts-pn-text-muted:         #8794a3;
    --ts-pn-icon-color:         #8794a3;

    --ts-pn-accent:             #6fa8ff;
    --ts-pn-item-hover-bg:      #1a212b;
    --ts-pn-item-active-text:   #9cc4ff;
    --ts-pn-item-active-icon:   #9cc4ff;
    --ts-pn-active-bar:         #6fa8ff;

    --ts-pn-section-title:      #6b7785;
    --ts-pn-metadata-color:     #6b7785;
}

/* Full-height variant (when used as a left rail) */
.ts-panel-nav--fill {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Outer border / card framing */
.ts-panel-nav--bordered {
    border: 1px solid var(--ts-pn-border-color);
    border-radius: 0.5rem;
    overflow: hidden;
}

/* Compact density */
.ts-panel-nav--compact {
    --ts-pn-item-pad-y: 0.3125rem;
    --ts-pn-font-size:  0.8125rem;
}

/* Actions header (title row / close button etc.) */
.ts-panel-nav-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem var(--ts-pn-item-pad-x);
    border-bottom: 1px solid var(--ts-pn-border-color);
    flex-shrink: 0;
}

.ts-panel-nav-actions-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ts-pn-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Scrollable body */
.ts-panel-nav-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.375rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--ts-pn-border-color) transparent;
}
.ts-panel-nav-body::-webkit-scrollbar { width: 5px; }
.ts-panel-nav-body::-webkit-scrollbar-thumb {
    background-color: var(--ts-pn-border-color);
    border-radius: 3px;
}

/* When there is no explicit body wrapper the root scrolls itself */
.ts-panel-nav:not(.ts-panel-nav--fill) > .ts-panel-nav-list:first-child,
.ts-panel-nav:not(.ts-panel-nav--fill) > .ts-panel-nav-section:first-child {
    padding-top: 0.375rem;
}

/* Sections */
.ts-panel-nav-section {
    padding: 0.25rem 0;
}
.ts-panel-nav-section + .ts-panel-nav-section {
    border-top: 1px solid var(--ts-pn-border-color);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
}
.ts-panel-nav-section-title {
    display: block;
    padding: 0.375rem var(--ts-pn-item-pad-x) 0.25rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ts-pn-section-title);
    user-select: none;
}

/* Lists */
.ts-panel-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* Item (wraps link + optional drawer) */
.ts-panel-nav-item {
    position: relative;
    margin: 0;
}

/* The interactive row (link or disclosure button) */
.ts-panel-nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: var(--ts-pn-item-pad-y) var(--ts-pn-item-pad-x);
    /* Depth-driven left indent — set per item via --ts-pn-depth */
    padding-left: calc(var(--ts-pn-item-pad-x) + (var(--ts-pn-depth, 0) * var(--ts-pn-indent-step)));
    color: var(--ts-pn-text);
    background: transparent;
    border: none;
    border-radius: 0;
    text-align: left;
    text-decoration: none !important;
    cursor: pointer;
    font: inherit;
    line-height: 1.4;
    transition: background-color var(--ts-pn-duration) var(--ts-pn-easing),
                color var(--ts-pn-duration) var(--ts-pn-easing);
    user-select: none;
}

.ts-panel-nav-link:hover {
    background-color: var(--ts-pn-item-hover-bg);
    color: var(--ts-pn-text);
}

.ts-panel-nav-link:focus-visible {
    outline: 2px solid var(--ts-pn-focus-ring);
    outline-offset: -2px;
}

/* Left active indicator bar */
.ts-panel-nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: var(--ts-pn-active-bar);
    border-radius: 0 2px 2px 0;
    transition: height var(--ts-pn-duration) var(--ts-pn-easing);
}

/* Active leaf */
.ts-panel-nav-item--active > .ts-panel-nav-link {
    background-color: var(--ts-pn-item-active-bg);
    color: var(--ts-pn-item-active-text);
    font-weight: 600;
}

/* Indicator: bar */
.ts-panel-nav--indicator-bar  .ts-panel-nav-item--active > .ts-panel-nav-link::before,
.ts-panel-nav--indicator-both .ts-panel-nav-item--active > .ts-panel-nav-link::before {
    height: 62%;
}

/* Icon */
.ts-panel-nav-icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--ts-pn-icon-color);
    transition: color var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panel-nav-item--active > .ts-panel-nav-link .ts-panel-nav-icon {
    color: var(--ts-pn-item-active-icon);
}

/* Text label */
.ts-panel-nav-text {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Metadata (right-aligned count / label) */
.ts-panel-nav-metadata {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ts-pn-metadata-color);
    font-variant-numeric: tabular-nums;
}
.ts-panel-nav-item--active > .ts-panel-nav-link .ts-panel-nav-metadata {
    color: var(--ts-pn-item-active-text);
}

/* Active caret-right indicator (MDS signature) */
.ts-panel-nav-active-indicator {
    flex-shrink: 0;
    width: 0.75rem;
    height: 0.75rem;
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-pn-item-active-text);
    opacity: 0;
    transform: translateX(-3px);
    transition: opacity var(--ts-pn-duration) var(--ts-pn-easing),
                transform var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panel-nav--indicator-caret .ts-panel-nav-item--active > .ts-panel-nav-link > .ts-panel-nav-active-indicator,
.ts-panel-nav--indicator-both  .ts-panel-nav-item--active > .ts-panel-nav-link > .ts-panel-nav-active-indicator {
    opacity: 1;
    transform: translateX(0);
}

/* Disclosure / drawer-toggle caret on parent items */
.ts-panel-nav-toggle-icon {
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-pn-text-muted);
    transition: transform var(--ts-pn-duration) var(--ts-pn-easing),
                color var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panel-nav-item--open > .ts-panel-nav-link > .ts-panel-nav-toggle-icon {
    transform: rotate(180deg);
}
.ts-panel-nav-item--has-children > .ts-panel-nav-link:hover .ts-panel-nav-toggle-icon {
    color: var(--ts-pn-text);
}

/* Parent that itself sits in the active branch */
.ts-panel-nav-item--branch-active > .ts-panel-nav-link {
    color: var(--ts-pn-item-active-text);
}
.ts-panel-nav-item--branch-active > .ts-panel-nav-link .ts-panel-nav-icon {
    color: var(--ts-pn-item-active-icon);
}

/* Drawer (animated child container) */
.ts-panel-nav-drawer {
    overflow: hidden;
    height: 0;
    transition: height var(--ts-pn-duration) var(--ts-pn-easing);
    will-change: height;
}
/* Open state: natural height. Clearing the JS inline height reverts here,
   NOT to the height:0 base rule, so the drawer stays open. */
.ts-panel-nav-item--open > .ts-panel-nav-drawer {
    height: auto;
    overflow: visible;
}

/* Separator */
.ts-panel-nav-separator {
    height: 1px;
    margin: 0.5rem var(--ts-pn-item-pad-x);
    background-color: var(--ts-pn-border-color);
    list-style: none;
}

/* Disabled */
.ts-panel-nav-item--disabled > .ts-panel-nav-link {
    opacity: 0.45;
    pointer-events: none;
    cursor: not-allowed;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .ts-panel-nav-link,
    .ts-panel-nav-drawer,
    .ts-panel-nav-toggle-icon,
    .ts-panel-nav-active-indicator,
    .ts-panel-nav-link::before { transition: none !important; }
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

    class PluginPanelNav {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el      = $el;
            this._raf      = [];
            this._timers   = [];

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
            this.options = $.extend(true, {}, PluginPanelNav.defaults, opts, {
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
            const D       = PluginPanelNav.defaults;

            $el.addClass('ts-panel-nav');

            if (options.dark)     $el.addClass('ts-panel-nav--dark');
            if (options.bordered) $el.addClass('ts-panel-nav--bordered');
            if (options.compact)  $el.addClass('ts-panel-nav--compact');
            if (options.fill)     $el.addClass('ts-panel-nav--fill');

            // Active-indicator style modifier
            const indicator = ['caret', 'bar', 'both', 'none'].indexOf(options.activeIndicator) !== -1
                ? options.activeIndicator : 'caret';
            $el.addClass('ts-panel-nav--indicator-' + indicator);

            // CSS custom property overrides (only when differing from defaults)
            if (options.width    !== D.width)    $el.css('--ts-pn-width', options.width);
            if (options.duration !== D.duration) $el.css('--ts-pn-duration', options.duration);
            if (options.accent)                  $el.css('--ts-pn-accent', options.accent);
            if (options.indentStep)              $el.css('--ts-pn-indent-step', options.indentStep);

            // ARIA role on the root
            if (!$el.attr('role')) $el.attr('role', 'navigation');

            // Decorate regions
            self._buildActions();
            self._buildBody();
            self._buildSections();

            // Decorate every top-level list and any stray items
            const $scope = self.$body && self.$body.length ? self.$body : $el;
            $scope.children('[data-panelnav-list]').each(function() {
                self._decorateList($(this), 0);
            });
            // Lists nested directly in sections were handled by _buildSections;
            // also handle bare items / lists placed straight under the scope.
            $scope.children('[data-panelnav-item]').each(function() {
                self._decorateItem($(this), 0);
            });
            $scope.children('[data-panelnav-separator]').addClass('ts-panel-nav-separator');

            // Suppress transitions on first paint so opening active branches
            // doesn't animate on load.
            $el.attr('data-ts-pn-initialising', 'true');

            if (options.autoExpandActive) self._expandActiveBranches();
            if (options.activeOnLoad)      self._autoSetActive();

            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => {
                    $el.removeAttr('data-ts-pn-initialising');
                });
                self._raf.push(raf2);
            });
            self._raf.push(raf1);

            return this;
        }

        _buildActions() {
            const self = this;
            self.$actions = self.$el.find('[data-panelnav-actions]').first();
            if (!self.$actions.length) return;
            self.$actions.addClass('ts-panel-nav-actions');
            self.$actions.children('[data-panelnav-actions-title]')
                .addClass('ts-panel-nav-actions-title');
        }

        _buildBody() {
            const self = this;
            self.$body = self.$el.find('[data-panelnav-body]').first();
            if (self.$body.length) self.$body.addClass('ts-panel-nav-body');
        }

        _buildSections() {
            const self = this;
            const $scope = self.$body && self.$body.length ? self.$body : self.$el;

            $scope.find('[data-panelnav-section]').each(function() {
                const $section = $(this);
                if ($section.data('__tsPnSection')) return;
                $section.data('__tsPnSection', true);
                $section.addClass('ts-panel-nav-section');

                const title = $section.attr('data-panelnav-section-title') || '';
                if (title) {
                    let $t = $section.children('[data-panelnav-section-label]').first();
                    if (!$t.length) {
                        $t = $('<div data-panelnav-section-label data-ts-pn-injected-title="true"></div>').text(title);
                        $section.prepend($t);
                    }
                    $t.addClass('ts-panel-nav-section-title');
                }

                // Decorate the lists / items inside this section at depth 0
                $section.children('[data-panelnav-list]').each(function() {
                    self._decorateList($(this), 0);
                });
                $section.children('[data-panelnav-item]').each(function() {
                    self._decorateItem($(this), 0);
                });
                $section.children('[data-panelnav-separator]').addClass('ts-panel-nav-separator');
            });
        }

        /**
         * Decorate a <ul>/list container and all its direct item children.
         * @param {jQuery} $list
         * @param {number} depth
         */
        _decorateList($list, depth) {
            const self = this;
            if ($list.data('__tsPnList')) return;
            $list.data('__tsPnList', true);
            $list.addClass('ts-panel-nav-list');

            $list.children('[data-panelnav-item]').each(function() {
                self._decorateItem($(this), depth);
            });
            $list.children('[data-panelnav-separator]').addClass('ts-panel-nav-separator');
        }

        /**
         * Decorate a single nav item, recursing into nested child lists.
         * @param {jQuery} $item
         * @param {number} depth
         */
        _decorateItem($item, depth) {
            const self = this;
            if ($item.data('__tsPnItem')) return;
            $item.data('__tsPnItem', true);

            $item.addClass('ts-panel-nav-item');
            $item.attr('data-ts-pn-depth', depth);

            // The interactive row: a child <a> / <button> tagged data-panelnav-link,
            // or the first <a>/<button>, otherwise wrap the inline content.
            let $link = $item.children('[data-panelnav-link]').first();
            if (!$link.length) $link = $item.children('a, button').first();

            if (!$link.length) {
                // Wrap loose inline content (icon/label/etc.) into a link row.
                const $loose = $item.children().not('[data-panelnav-child-items]');
                $link = $('<span data-panelnav-link data-ts-pn-injected-link="true"></span>');
                if ($loose.length) {
                    $loose.first().before($link);
                    $link.append($loose);
                } else {
                    $item.prepend($link);
                }
            }
            $link.addClass('ts-panel-nav-link');

            // Depth indent applied via CSS custom property on the link.
            if (depth > 0) $link.css('--ts-pn-depth', depth);

            // Decorate inner parts
            $link.children('[data-panelnav-icon]').first().addClass('ts-panel-nav-icon');
            $link.children('[data-panelnav-label]').first().addClass('ts-panel-nav-text');
            $link.children('[data-panelnav-metadata]').first().addClass('ts-panel-nav-metadata');

            // If no explicit label element, treat the link's own text as the label.
            if (!$link.children('.ts-panel-nav-text').length) {
                $link.addClass('ts-panel-nav-link--plain');
            }

            const $childContainer = $item.children('[data-panelnav-child-items]').first();
            const hasChildren = $childContainer.length > 0 || $item.is('[data-panelnav-has-children]');

            if ($item.is('[data-panelnav-disabled]')) {
                $item.addClass('ts-panel-nav-item--disabled');
                $link.attr('aria-disabled', 'true');
            }

            if (hasChildren) {
                $item.addClass('ts-panel-nav-item--has-children');

                // Inject a disclosure caret if absent.
                if (!$link.children('.ts-panel-nav-toggle-icon').length) {
                    const $caret = $('<span class="ts-panel-nav-toggle-icon" aria-hidden="true" data-ts-pn-injected-caret="true"></span>')
                        .html(self._caretIcon());
                    $link.append($caret);
                }

                $link.attr('aria-expanded', 'false');

                if ($childContainer.length) {
                    $childContainer.addClass('ts-panel-nav-list');
                    if (!$childContainer.data('__tsPnList')) $childContainer.data('__tsPnList', true);

                    // Wrap the child list in an animated drawer shell.
                    if (!$childContainer.parent().hasClass('ts-panel-nav-drawer')) {
                        $childContainer.wrap('<div class="ts-panel-nav-drawer"></div>');
                    }
                    const $drawer = $childContainer.parent();
                    $item.data('_$drawer', $drawer);

                    // Unique id wiring for aria-controls (avoids collisions across
                    // multiple panels on one page).
                    const cid = 'ts-pn-drawer-' + Math.random().toString(36).slice(2, 9);
                    $drawer.attr('id', cid);
                    $link.attr('aria-controls', cid);

                    // Recurse — children one level deeper.
                    $childContainer.children('[data-panelnav-item]').each(function() {
                        self._decorateItem($(this), depth + 1);
                    });
                    $childContainer.children('[data-panelnav-separator]').addClass('ts-panel-nav-separator');
                }
            } else {
                // Leaf — inject the active caret-right indicator placeholder.
                if (!$link.children('.ts-panel-nav-active-indicator').length) {
                    const $ind = $('<span class="ts-panel-nav-active-indicator" aria-hidden="true" data-ts-pn-injected-indicator="true"></span>')
                        .html(self._caretRightIcon());
                    $link.append($ind);
                }
            }

            // Active flags
            if ($item.is('[data-panelnav-active]')) {
                if (hasChildren) {
                    $item.addClass('ts-panel-nav-item--branch-active');
                } else {
                    $item.addClass('ts-panel-nav-item--active');
                    $link.attr('aria-current', 'page');
                }
            }

            // Accessibility role for non-anchor disclosure rows
            if (!$link.is('a, button')) {
                $link.attr({ role: hasChildren ? 'button' : 'link', tabindex: '0' });
            }
        }

        events() {
            const self = this;
            const $el  = self.$el;

            // Toggle a parent drawer
            $el.on('click.panelnav', '.ts-panel-nav-item--has-children > .ts-panel-nav-link', function(e) {
                const $link = $(this);
                const $item = $link.parent();
                if ($item.hasClass('ts-panel-nav-item--disabled')) return;

                // Nav-panel parents are disclosure widgets by convention, so we
                // always intercept and toggle rather than navigate.
                e.preventDefault();
                self._toggleDrawer($item);
            });

            // Activate a leaf
            $el.on('click.panelnav', '.ts-panel-nav-item:not(.ts-panel-nav-item--has-children) > .ts-panel-nav-link', function(e) {
                const $link = $(this);
                const $item = $link.parent();
                if ($item.hasClass('ts-panel-nav-item--disabled')) return;

                self.setActive($item);

                const href = $link.attr('href');
                $el.trigger('item.ts.panelnav', [{ $item, $link, href }]);

                // If it's not a real navigable anchor, prevent default jump.
                if (!$link.is('a') || !href || href === '#') e.preventDefault();
            });

            // Keyboard activation for injected button/link rows
            $el.on('keydown.panelnav', '.ts-panel-nav-link[role]', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });

            return this;
        }

        /** Open a parent item's drawer (no-op if already open or has no drawer). */
        open($item) {
            if ($item.hasClass('ts-panel-nav-item--has-children') &&
                !$item.hasClass('ts-panel-nav-item--open')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Close a parent item's drawer. */
        close($item) {
            if ($item.hasClass('ts-panel-nav-item--open')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Toggle a parent item's drawer. */
        toggle($item) {
            if ($item.hasClass('ts-panel-nav-item--has-children')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Open every drawer in the panel. */
        expandAll() {
            const self = this;
            self.$el.find('.ts-panel-nav-item--has-children').each(function() {
                self.open($(this));
            });
            return this;
        }

        /** Close every drawer in the panel. */
        collapseAll() {
            const self = this;
            self.$el.find('.ts-panel-nav-item--has-children.ts-panel-nav-item--open').each(function() {
                self.close($(this));
            });
            return this;
        }

        /**
         * Mark a leaf item active, clearing all others. Opens any ancestor
         * drawers so the active item is visible. Sets aria-current.
         * @param {jQuery} $item
         */
        setActive($item) {
            const self = this;
            const $el  = self.$el;

            $el.find('.ts-panel-nav-item--active')
                .removeClass('ts-panel-nav-item--active')
                .children('.ts-panel-nav-link').removeAttr('aria-current');

            $el.find('.ts-panel-nav-item--branch-active')
                .removeClass('ts-panel-nav-item--branch-active');

            $item.addClass('ts-panel-nav-item--active');
            $item.children('.ts-panel-nav-link').attr('aria-current', 'page');

            // Walk ancestors: mark branch-active + open drawers.
            $item.parents('.ts-panel-nav-item--has-children').each(function() {
                const $anc = $(this);
                $anc.addClass('ts-panel-nav-item--branch-active');
                self.open($anc);
            });

            return this;
        }

        /** Return the currently active item (jQuery, may be empty). */
        getActive() {
            return this.$el.find('.ts-panel-nav-item--active').first();
        }

        /** Destroy and re-init with the same options. Returns the new instance. */
        refresh() {
            const $el  = this.$el;
            const opts = $.extend(true, {}, this.options);
            delete opts.wrapper;
            this.destroy();
            return new PluginPanelNav($el, opts);
        }

        /** Full teardown — removes classes, injected nodes, drawers, handlers. */
        destroy() {
            const self = this;
            const $el  = self.$el;

            $el.off('.panelnav');
            self._raf.forEach(id => cancelAnimationFrame(id));
            self._timers.forEach(id => clearTimeout(id));

            // Unwrap drawers
            $el.find('.ts-panel-nav-drawer').each(function() {
                const $inner = $(this).children('[data-panelnav-child-items]');
                if ($inner.length) $inner.unwrap();
            });

            // Remove injected nodes
            $el.find('[data-ts-pn-injected-caret]').remove();
            $el.find('[data-ts-pn-injected-indicator]').remove();
            $el.find('[data-ts-pn-injected-title]').remove();
            $el.find('[data-ts-pn-injected-link]').each(function() {
                const $span = $(this);
                $span.children().insertBefore($span);
                $span.remove();
            });

            // Strip injected attributes
            $el.find('[aria-controls]').removeAttr('aria-controls');
            $el.find('[aria-expanded]').removeAttr('aria-expanded');
            $el.find('[aria-current]').removeAttr('aria-current');
            $el.find('.ts-panel-nav-link[role]').removeAttr('role tabindex');
            $el.find('.ts-panel-nav-drawer').removeAttr('id');

            // Remove data flags + cached drawer refs
            $el.find('*').removeData('__tsPnItem')
                          .removeData('__tsPnList')
                          .removeData('__tsPnSection')
                          .removeData('_$drawer')
                          .removeData('_tsPnTimer');

            // Strip element classes
            const classes = [
                'ts-panel-nav-actions', 'ts-panel-nav-actions-title', 'ts-panel-nav-body',
                'ts-panel-nav-section', 'ts-panel-nav-section-title', 'ts-panel-nav-list',
                'ts-panel-nav-item', 'ts-panel-nav-item--active', 'ts-panel-nav-item--branch-active',
                'ts-panel-nav-item--has-children', 'ts-panel-nav-item--open',
                'ts-panel-nav-item--disabled', 'ts-panel-nav-link', 'ts-panel-nav-link--plain',
                'ts-panel-nav-icon', 'ts-panel-nav-text', 'ts-panel-nav-metadata',
                'ts-panel-nav-separator'
            ].join(' ');
            $el.find('*').removeClass(classes).removeAttr('data-ts-pn-depth');
            $el.find('.ts-panel-nav-link').css('--ts-pn-depth', '');

            // Strip root classes + inline custom properties
            $el.removeClass(
                'ts-panel-nav ts-panel-nav--dark ts-panel-nav--bordered ts-panel-nav--compact ' +
                'ts-panel-nav--fill ts-panel-nav--indicator-caret ts-panel-nav--indicator-bar ' +
                'ts-panel-nav--indicator-both ts-panel-nav--indicator-none'
            );
            $el.css({
                '--ts-pn-width': '', '--ts-pn-duration': '',
                '--ts-pn-accent': '', '--ts-pn-indent-step': ''
            });
            $el.removeAttr('data-ts-pn-initialising');
            $el.removeData(instanceName);

            self.$actions = self.$body = null;
            self._raf = [];
            self._timers = [];

            return this;
        }

        /**
         * Animate a parent item's drawer open/closed.
         * Mirrors the proven Themestrap collapsible height technique:
         * animate px→px, then clear the inline height so the CSS open rule
         * (height:auto) takes over.
         * @param {jQuery} $item
         */
        _toggleDrawer($item) {
            const self   = this;
            const $el     = self.$el;
            const isOpen  = $item.hasClass('ts-panel-nav-item--open');
            const $drawer = self._getDrawer($item);
            const $link   = $item.children('.ts-panel-nav-link');

            if (!$drawer || !$drawer.length) return this;

            const duration = self._parseDuration(self.options.duration);
            clearTimeout($item.data('_tsPnTimer'));

            // Accordion mode: close siblings before opening.
            if (!isOpen && self.options.accordion) {
                $item.siblings('.ts-panel-nav-item--has-children.ts-panel-nav-item--open')
                    .each(function() { self.close($(this)); });
            }

            if (!isOpen) {
                // OPEN
                $item.addClass('ts-panel-nav-item--open');
                $link.attr('aria-expanded', 'true');

                $drawer.css({ overflow: 'hidden', height: '0px' });
                const target = $drawer.children('[data-panelnav-child-items]')[0].scrollHeight;
                $drawer[0].offsetHeight; // reflow
                $drawer.css('height', target + 'px');

                $el.trigger('drawer-toggle.ts.panelnav', [{ $item, open: true }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $drawer.css({ height: 'auto', overflow: '' });
                }, duration);
                $item.data('_tsPnTimer', t);
                self._timers.push(t);

            } else {
                // CLOSE
                const current = $drawer[0].scrollHeight;
                $drawer.css({ overflow: 'hidden', height: current + 'px' });
                $drawer[0].offsetHeight; // reflow
                $item.removeClass('ts-panel-nav-item--open');
                $link.attr('aria-expanded', 'false');
                $drawer.css('height', '0px');

                $el.trigger('drawer-toggle.ts.panelnav', [{ $item, open: false }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $drawer.css('overflow', '');
                }, duration);
                $item.data('_tsPnTimer', t);
                self._timers.push(t);
            }

            return this;
        }

        /** Open ancestor drawers of any pre-marked active items (no animation). */
        _expandActiveBranches() {
            const self = this;
            self.$el.find('[data-panelnav-active]').each(function() {
                $(this).parents('.ts-panel-nav-item--has-children').each(function() {
                    const $anc   = $(this);
                    $anc.addClass('ts-panel-nav-item--open ts-panel-nav-item--branch-active');
                    $anc.children('.ts-panel-nav-link').attr('aria-expanded', 'true');
                    const $drawer = self._getDrawer($anc);
                    if ($drawer && $drawer.length) $drawer.css({ height: '', overflow: '' });
                });
            });
            return this;
        }

        /**
         * Match item hrefs against the current URL and set the active item.
         * Sub-items (deeper) win over shallower matches.
         */
        _autoSetActive() {
            const self = this;
            const $el  = self.$el;

            const normalize = (url) => {
                try {
                    const u = new URL(url, window.location.origin);
                    return u.origin + (u.pathname.replace(/\/+$/, '') || '/');
                } catch (e) { return null; }
            };

            const current = normalize(window.location.href);
            if (!current) return;

            let best = null, bestDepth = -1;

            $el.find('.ts-panel-nav-item:not(.ts-panel-nav-item--has-children) > a.ts-panel-nav-link[href]').each(function() {
                const $link = $(this);
                const link  = normalize($link.attr('href'));
                if (!link || link !== current) return;
                const depth = parseInt($link.parent().attr('data-ts-pn-depth'), 10) || 0;
                if (depth > bestDepth) { best = $link.parent(); bestDepth = depth; }
            });

            if (best) self.setActive(best);
            return self;
        }

        _getDrawer($item) {
            return $item.data('_$drawer') ||
                   $item.children('.ts-panel-nav-drawer').first() || null;
        }

        _caretIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" ' +
                   'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                   'stroke-linejoin="round" aria-hidden="true"><polyline points="4 6 8 10 12 6"/></svg>';
        }

        _caretRightIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" ' +
                   'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                   'stroke-linejoin="round" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>';
        }

        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 240;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 240;
        }

    }

    PluginPanelNav.defaults = {
        /** Dark color scheme. */
        dark: false,

        /** Wrap the panel in a bordered card. */
        bordered: false,

        /** Compact (denser) row spacing. */
        compact: false,

        /**
         * Stretch to full container height with an internal scroll body.
         * Requires a [data-panelnav-body] wrapper around the lists.
         */
        fill: false,

        /**
         * Active-item indicator style:
         *   'caret' — Morningstar-style caret-right at the row end (default)
         *   'bar'   — left accent bar
         *   'both'  — caret-right + left bar
         *   'none'  — color/weight change only
         */
        activeIndicator: 'caret',

        /** Only one drawer open at a time (accordion behaviour). */
        accordion: false,

        /** Open ancestor drawers of pre-marked [data-panelnav-active] items on load. */
        autoExpandActive: true,

        /** Detect + mark the active leaf from the current page URL on load. */
        activeOnLoad: true,

        /** Panel width (any CSS length). */
        width: '280px',

        /** Per-level indent applied to nested rows (any CSS length). */
        indentStep: '1rem',

        /** Drawer + indicator transition duration. */
        duration: '240ms',

        /** Accent color override (CSS <color>). Empty = inherit theme default. */
        accent: '',

        /** forceInit: panel is layout-critical — skip IntersectionObserver. */
        forceInit: true,

        /** accY: IntersectionObserver root-margin offset (unused with forceInit). */
        accY: 0
    };

    $.extend(themestrap, { PluginPanelNav });

    $.fn.themestrapPluginPanelNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginPanelNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
