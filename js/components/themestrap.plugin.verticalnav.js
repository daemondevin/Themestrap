/**
 * Vertical Navigation Plugin
 *
 * Supports collapsible sidebar (icon-only "mini" mode), expandable nav
 * groups, active state tracking, icon support, and responsive behavior.
 *
 * Markup:
 *   <nav data-plugin-vertical-nav data-plugin-options='{"collapsed": false}'>
 *
 *     <!-- Optional header / branding -->
 *     <div class="ts-vn-header">
 *       <span class="ts-vn-brand">App Name</span>
 *     </div>
 *
 *     <!-- Direct link -->
 *     <a href="/dashboard" class="ts-vn-link active">
 *       <span class="ts-vn-icon"><i class="fas fa-home"></i></span>
 *       <span class="ts-vn-text">Dashboard</span>
 *     </a>
 *
 *     <!-- Expandable nav group -->
 *     <div class="ts-vn-group">
 *       <button class="ts-vn-group-trigger">
 *         <span class="ts-vn-icon"><i class="fas fa-cog"></i></span>
 *         <span class="ts-vn-text">Settings</span>
 *       </button>
 *       <div class="ts-vn-group-children">
 *         <a href="/settings/profile"  class="ts-vn-link">Profile</a>
 *         <a href="/settings/account"  class="ts-vn-link">Account</a>
 *       </div>
 *     </div>
 *
 *     <!-- Divider -->
 *     <div class="ts-vn-divider"></div>
 *
 *   </nav>
 *
 * Options (data-plugin-options or JS):
 *   collapsed      {Boolean}  false  — Start in icon-only mini mode
 *   activeTracking {Boolean}  true   — Auto-set .active from current URL
 *   hashTracking   {Boolean}  false  — Also match location.hash in addition to pathname
 *   expandActive   {Boolean}  true   — Auto-expand group that contains the active link
 *   toggleBtn      {Boolean}  true   — Render the collapse toggle button
 *   toggleTarget   {String}   null   — Extra selector to add/remove .ts-vn-collapsed on collapse
 *                                      (e.g. '#page-wrapper') — useful for pushing main content
 *   animDuration   {Number}   260    — Group open/close animation duration in ms
 *   tooltips       {Boolean}  true   — Show nav-text as Bootstrap tooltip when collapsed
 *
 * Public API:
 *   const nav = $('#myNav').data('__verticalNav');
 *   nav.collapse();         // collapse to mini mode
 *   nav.expand();           // expand to full mode
 *   nav.toggle();           // toggle collapse state
 *   nav.openGroup($group);  // expand a .ts-vn-group element
 *   nav.closeGroup($group); // collapse a .ts-vn-group element
 *   nav.setActive(href);    // programmatically mark a link active
 *   nav.destroy();          // teardown and restore original HTML
 *
 * themestrap.init.js wiring:
 *   // Vertical Navigation
 *   if ($.isFunction($.fn['themestrapPluginVerticalNav']) && $('[data-plugin-vertical-nav]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-vertical-nav]:not(.manual)', 'themestrapPluginVerticalNav');
 *   }
 */
// Vertical Navigation
(((themestrap = {}, $) => {
    const instanceName = '__verticalNav';

    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-verticalnav-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `/**
 * Vertical Navigation Plugin — Stylesheet
 *
 * Customise with CSS custom properties on the :root or on
 * the .ts-vertical-nav element itself.
 */
/* Custom Properties */
.ts-vertical-nav {
    --ts-vn-bg:              var(--dark);
    --ts-vn-border:          #393c41;

    --ts-vn-width:           220px;
    --ts-vn-width-collapsed: 56px;
    --ts-vn-transition:      260ms cubic-bezier(.4, 0, .2, 1);

    --ts-vn-link-color:        var(--default);
    --ts-vn-link-hover-color:  var(--primary);
    --ts-vn-link-hover-bg:     rgba(255, 255, 255, .08);
    --ts-vn-link-active-color: var(--primary);
    --ts-vn-link-active-bg:    rgba(255, 255, 255, .14);
    --ts-vn-link-active-mark:  var(--primary);

    --ts-vn-icon-size:   1.125rem;   /* 18 px */
    --ts-vn-icon-color:  rgba(255, 255, 255, .60);
    --ts-vn-icon-active: var(--primary);

    --ts-vn-header-height: 56px;
    --ts-vn-item-height:   36px;
    --ts-vn-item-gap:      2px;

    --ts-vn-group-indent: 2.5rem;   /* children indented past icon column */

    --ts-vn-divider-color: var(--grey-200);

    --ts-vn-focus-ring: 0 0 0 2px #49afd9;
    --ts-vn-radius:     4px;
}
/* Root nav element */
.ts-vertical-nav {
    display:        flex;
    flex-direction: column;
    width:          var(--ts-vn-width);
    min-height:     100%;
    background:     var(--ts-vn-bg);
    border-right:   1px solid var(--ts-vn-border);
    overflow:       hidden;
    transition:     width var(--ts-vn-transition);
    flex-shrink:    0;
    position:       relative;
    /* Stacking context so tooltips rendered in <body> still overlay correctly */
    z-index:        100;
}

/* Collapsed / mini mode */
.ts-vertical-nav.ts-vn-collapsed {
    width: var(--ts-vn-width-collapsed);
}
/* Header */
.ts-vn-header {
    display:         flex;
    align-items:     center;
    height:          var(--ts-vn-header-height);
    padding:         0 .75rem;
    border-bottom:   1px solid var(--ts-vn-border);
    gap:             .5rem;
    flex-shrink:     0;
    overflow:        hidden;
    white-space:     nowrap;
}

.ts-vn-brand {
    font-size:     .875rem;
    font-weight:   600;
    color:         #fff;
    opacity:       1;
    transition:    opacity var(--ts-vn-transition),
                   max-width var(--ts-vn-transition);
    max-width:     9999px;
    overflow:      hidden;
}

.ts-vn-collapsed .ts-vn-brand {
    opacity:   0;
    max-width: 0;
}
/* Toggle button */
.ts-vn-toggle-btn {
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink:     0;
    width:           32px;
    height:          32px;
    padding:         0;
    background:      transparent;
    border:          1px solid var(--ts-vn-border);
    border-radius:   var(--ts-vn-radius);
    cursor:          pointer;
    color:           var(--ts-vn-link-color);
    transition:      background var(--ts-vn-transition),
                     color      var(--ts-vn-transition);
    margin-left:     auto;  /* push to far right inside header */
}

.ts-vn-toggle-btn:hover,
.ts-vn-toggle-btn:focus-visible {
    background: var(--ts-vn-link-hover-bg);
    color:      var(--ts-vn-link-hover-color);
    outline:    none;
    box-shadow: var(--ts-vn-focus-ring);
}

/* hamburguer icon composed of three spans */
.ts-vn-toggle-icon {
    display:         flex;
    flex-direction:  column;
    gap:             4px;
    width:           16px;
}

.ts-vn-toggle-icon span {
    display:       block;
    width:         100%;
    height:        2px;
    background:    currentColor;
    border-radius: 1px;
    transition:    transform var(--ts-vn-transition),
                   opacity  var(--ts-vn-transition),
                   width    var(--ts-vn-transition);
}

/* Animate hamburguer ? arrow when collapsed */
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(1) {
    transform:    translateY(6px) rotate(45deg);
}
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(2) {
    opacity: 0;
    width:   0;
}
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(3) {
    transform:    translateY(-6px) rotate(-45deg);
}

/* When placed inside the header without a .ts-vn-header wrapper */
.ts-vertical-nav > .ts-vn-toggle-btn {
    margin: .5rem .5rem .5rem auto;
    display: flex;
}
/* Nav body (scroll area) */
.ts-vn-body {
    flex:       1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding:    .5rem 0;

    /* Slim scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.15) transparent;
}

.ts-vn-body::-webkit-scrollbar       { width: 4px; }
.ts-vn-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
/* Shared link / button row styles */
.ts-vn-link,
.ts-vn-group-trigger {
    display:         flex;
    align-items:     center;
    gap:             .75rem;
    width:           100%;
    min-height:      var(--ts-vn-item-height);
    padding:         0 .75rem;
    margin-bottom:   var(--ts-vn-item-gap);
    color:           var(--ts-vn-link-color);
    text-decoration: none;
    background:      transparent;
    border:          none;
    border-radius:   var(--ts-vn-radius);
    cursor:          pointer;
    white-space:     nowrap;
    overflow:        hidden;
    text-align:      left;
    position:        relative;
    transition:      background var(--ts-vn-transition),
                     color      var(--ts-vn-transition);
    flex-shrink:     0;
}

.ts-vn-link:hover,
.ts-vn-group-trigger:hover {
    background: var(--ts-vn-link-hover-bg);
    color:      var(--ts-vn-link-hover-color);
}

.ts-vn-link:focus-visible,
.ts-vn-group-trigger:focus-visible {
    outline:    none;
    box-shadow: var(--ts-vn-focus-ring);
}

/* Active link — left-border accent (Clarity's signature detail) */
.ts-vn-link.active {
    background: var(--ts-vn-link-active-bg);
    color:      var(--ts-vn-link-active-color);
}

.ts-vn-link.active::before {
    content:       '';
    position:      absolute;
    left:          0;
    top:           4px;
    bottom:        4px;
    width:         3px;
    border-radius: 0 2px 2px 0;
    background:    var(--ts-vn-link-active-mark);
}

.ts-vn-link.active .ts-vn-icon {
    color: var(--ts-vn-icon-active);
}
/* Icon column */
.ts-vn-icon {
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink:     0;
    width:           var(--ts-vn-icon-size);
    height:          var(--ts-vn-icon-size);
    font-size:       var(--ts-vn-icon-size);
    color:           var(--ts-vn-icon-color);
    transition:      color var(--ts-vn-transition);
}

.ts-vn-link:hover   .ts-vn-icon,
.ts-vn-group-trigger:hover .ts-vn-icon {
    color: var(--ts-vn-link-hover-color);
}
/* Nav text */
.ts-vn-text {
    flex:        1 1 auto;
    font-size:   .8125rem;   /* 13 px — Clarity's default */
    font-weight: 500;
    overflow:    hidden;
    text-overflow: ellipsis;
    opacity:     1;
    max-width:   9999px;
    transition:  opacity     var(--ts-vn-transition),
                 max-width   var(--ts-vn-transition),
                 visibility  var(--ts-vn-transition);
    visibility:  visible;
}

/* Hide text in collapsed / mini mode */
.ts-vn-collapsed .ts-vn-text {
    opacity:    0;
    max-width:  0;
    visibility: hidden;
}
/* Caret */
.ts-vn-caret {
    flex-shrink: 0;
    width:       .5rem;
    height:      .5rem;
    border-right:  2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform:     rotate(-45deg);  /* points right = closed */
    transition:    transform var(--ts-vn-transition),
                   opacity   var(--ts-vn-transition);
    margin-left:   auto;
    opacity:       .6;
}

.ts-vn-group--open > .ts-vn-group-trigger .ts-vn-caret {
    transform: rotate(45deg);  /* points down = open */
    opacity:   1;
}

/* Hide caret in mini mode */
.ts-vn-collapsed .ts-vn-caret {
    opacity:    0;
    max-width:  0;
    overflow:   hidden;
}
/* Nav groups & children */
.ts-vn-group {
    display: flex;
    flex-direction: column;
}

.ts-vn-group-children {
    overflow:   hidden;
    /* height is set by JS; CSS only provides the transition */
    transition: height var(--ts-vn-transition);
    padding-left: var(--ts-vn-group-indent);
}

/* Child links are slightly smaller */
.ts-vn-group-children .ts-vn-link {
    font-size:  .75rem;   /* 12 px */
    min-height: 30px;
    padding:    0 .5rem 0 .75rem;
}

/* In mini mode, children are hidden entirely and group trigger acts as
   a direct link (authors should set href on .ts-vn-group-trigger or
   add a data-group-href attribute). */
.ts-vn-collapsed .ts-vn-group-children {
    display: none;
}
/* Section label / divider */
.ts-vn-section-label {
    display:      block;
    padding:      .75rem .75rem .25rem;
    font-size:    .6875rem;  /* 11 px */
    font-weight:  600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color:          rgba(255, 255, 255, .40);
    white-space:    nowrap;
    overflow:       hidden;
    opacity:        1;
    transition:     opacity var(--ts-vn-transition),
                    max-height var(--ts-vn-transition);
}

.ts-vn-collapsed .ts-vn-section-label {
    opacity:    0;
    max-height: 0;
    padding:    0;
}

.ts-vn-divider {
    height:     1px;
    margin:     .5rem .75rem;
    background: var(--ts-vn-divider-color);
    flex-shrink: 0;
}
/* Footer slot */
.ts-vn-footer {
    flex-shrink:   0;
    padding:       .5rem 0;
    border-top:    1px solid var(--ts-vn-border);
    overflow:      hidden;
    white-space:   nowrap;
}
/* Light theme variant */
.ts-vertical-nav.ts-vn-light {
    --ts-vn-bg:              var(--light);
    --ts-vn-border:          var(--grey-200);

    --ts-vn-link-color:        var(--dark);
    --ts-vn-link-hover-color:  #000;
    --ts-vn-link-hover-bg:     rgba(0, 0, 0, .05);
    --ts-vn-link-active-color: #000;
    --ts-vn-link-active-bg:    var(--primary-rgba-10);

    --ts-vn-icon-color:  #6a7e90;
    --ts-vn-divider-color: var(--grey-200);
}

.ts-vertical-nav.ts-vn-light .ts-vn-brand {
    color: var(--dark);
}

.ts-vertical-nav.ts-vn-light .ts-vn-section-label {
    color: rgba(0, 0, 0, .40);
}
/* Responsive — collapses automatically at sm breakpoint */
@media (max-width: 767.98px) {
    .ts-vertical-nav {
        width: var(--ts-vn-width-collapsed);
    }
}
/* Transition for external content panel (when toggleTarget is used) */
[class*="ts-vn-push"] {
    transition: margin-left var(--ts-vn-transition),
                padding-left var(--ts-vn-transition);
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

    class PluginVerticalNav {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el          = $el;
            this.initialHTML  = $el.html();   // preserved for destroy()
            this._tooltips    = [];           // Bootstrap Tooltip instances

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
            this.options = $.extend(true, {}, PluginVerticalNav.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Root element housekeeping
            $el.addClass('ts-vertical-nav');
            if ($el.attr('role') === undefined) {
                $el.attr({ role: 'navigation', 'aria-label': 'Vertical navigation' });
            }

            // Inject the toggle button into the header (or prepend before first child)
            if (o.toggleBtn) {
                self._injectToggleBtn();
            }

            // Inject group carets
            $el.find('.ts-vn-group-trigger').each(function() {
                const $btn = $(this);
                if (!$btn.find('.ts-vn-caret').length) {
                    $btn.append('<span class="ts-vn-caret" aria-hidden="true"></span>');
                }
                $btn.attr({ 'aria-expanded': 'false', 'aria-haspopup': 'true' });
            });

            // Wrap group children content for animation measurement
            $el.find('.ts-vn-group-children').each(function() {
                const $children = $(this);
                $children
                    .attr('role', 'region')
                    .css({ overflow: 'hidden', height: 0 })
                    .addClass('ts-vn-group-children--collapsed');
            });

            // Active link detection
            if (o.activeTracking) {
                self._detectActive();
            }

            // Apply initial collapsed state
            if (o.collapsed) {
                $el.addClass('ts-vn-collapsed');
                if (o.toggleTarget) {
                    $(o.toggleTarget).addClass('ts-vn-collapsed');
                }
                self._refreshTooltips();
            }

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Toggle collapse via the injected button
            $el.on('click.verticalNav', '.ts-vn-toggle-btn', function(e) {
                e.preventDefault();
                self.toggle();
            });

            // Nav group trigger — expand / collapse children
            $el.on('click.verticalNav', '.ts-vn-group-trigger', function(e) {
                e.preventDefault();
                const $group = $(this).closest('.ts-vn-group');
                self._toggleGroup($group);
            });

            // Active link — track on click if activeTracking is on
            if (o.activeTracking) {
                $el.on('click.verticalNav', '.ts-vn-link', function() {
                    $el.find('.ts-vn-link.active').removeClass('active').removeAttr('aria-current');
                    $(this).addClass('active').attr('aria-current', 'page');
                });
            }

            return this;
        }

        collapse() {
            const o = this.options;
            this.$el.addClass('ts-vn-collapsed');
            this.$el.find('.ts-vn-toggle-btn').attr('aria-expanded', 'false');
            if (o.toggleTarget) {
                $(o.toggleTarget).addClass('ts-vn-collapsed');
            }
            this._refreshTooltips();
            this.$el.trigger('verticalNav.collapsed');
            return this;
        }

        expand() {
            const o = this.options;
            this.$el.removeClass('ts-vn-collapsed');
            this.$el.find('.ts-vn-toggle-btn').attr('aria-expanded', 'true');
            if (o.toggleTarget) {
                $(o.toggleTarget).removeClass('ts-vn-collapsed');
            }
            this._destroyTooltips();
            this.$el.trigger('verticalNav.expanded');
            return this;
        }

        toggle() {
            if (this.$el.hasClass('ts-vn-collapsed')) {
                this.expand();
            } else {
                this.collapse();
            }
            return this;
        }

        openGroup($group) {
            const self     = this;
            const o        = self.options;
            const $trigger  = $group.find('> .ts-vn-group-trigger');
            const $children = $group.find('> .ts-vn-group-children');

            $group.addClass('ts-vn-group--open');
            $trigger.attr('aria-expanded', 'true');
            $children.removeClass('ts-vn-group-children--collapsed');

            // Animate open: measure natural height, animate to it, then free to auto
            const targetH = $children.css({ height: 'auto' }).outerHeight();
            $children
                .css({ height: 0 })
                .stop(true)
                .animate({ height: targetH }, o.animDuration, function() {
                    $(this).css({ height: 'auto' });
                });

            return this;
        }

        closeGroup($group) {
            const self     = this;
            const o        = self.options;
            const $trigger  = $group.find('> .ts-vn-group-trigger');
            const $children = $group.find('> .ts-vn-group-children');

            $group.removeClass('ts-vn-group--open');
            $trigger.attr('aria-expanded', 'false');

            $children.stop(true).animate({ height: 0 }, o.animDuration, function() {
                $(this).css({ height: 0 }).addClass('ts-vn-group-children--collapsed');
            });

            return this;
        }

        setActive(href) {
            const $el = this.$el;
            $el.find('.ts-vn-link.active').removeClass('active').removeAttr('aria-current');

            const $match = $el.find(`.ts-vn-link[href="${href}"]`);
            if ($match.length) {
                $match.addClass('active').attr('aria-current', 'page');

                if (this.options.expandActive) {
                    const $parentGroup = $match.closest('.ts-vn-group');
                    if ($parentGroup.length) {
                        this.openGroup($parentGroup);
                    }
                }
            }

            return this;
        }

        destroy() {
            this._destroyTooltips();
            this.$el
                .removeClass('ts-vertical-nav ts-vn-collapsed')
                .off('.verticalNav')
                .removeAttr('role aria-label')
                .html(this.initialHTML)
                .removeData(instanceName);
            return this;
        }

        _injectToggleBtn() {
            const $el = this.$el;

            // Honor an existing toggle button the author may have placed
            if ($el.find('.ts-vn-toggle-btn').length) {
                return;
            }

            const $btn = $(
                '<button class="ts-vn-toggle-btn" type="button" ' +
                        'aria-expanded="true" aria-label="Toggle navigation">' +
                    '<span class="ts-vn-toggle-icon" aria-hidden="true">' +
                        '<span></span><span></span><span></span>' +
                    '</span>' +
                '</button>'
            );

            const $header = $el.find('.ts-vn-header');
            if ($header.length) {
                $header.append($btn);
            } else {
                $el.prepend($btn);
            }
        }

        _toggleGroup($group) {
            if ($group.hasClass('ts-vn-group--open')) {
                this.closeGroup($group);
            } else {
                this.openGroup($group);
            }
        }

        _detectActive() {
            const o       = this.options;
            const path    = window.location.pathname;
            const hash    = window.location.hash;
            const $el     = this.$el;
            let   $active = null;

            $el.find('.ts-vn-link').each(function() {
                const href = $(this).attr('href') || '';
                if (!href || href === '#') return;

                if (href === path || (o.hashTracking && href === path + hash)) {
                    $active = $(this);
                    return false; // break
                }
            });

            if ($active) {
                $active.addClass('active').attr('aria-current', 'page');

                if (o.expandActive) {
                    const $parentGroup = $active.closest('.ts-vn-group');
                    if ($parentGroup.length) {
                        // Open without animation on init (height: auto directly)
                        const $trigger  = $parentGroup.find('> .ts-vn-group-trigger');
                        const $children = $parentGroup.find('> .ts-vn-group-children');

                        $parentGroup.addClass('ts-vn-group--open');
                        $trigger.attr('aria-expanded', 'true');
                        $children
                            .removeClass('ts-vn-group-children--collapsed')
                            .css({ height: 'auto' });
                    }
                }
            }
        }

        _refreshTooltips() {
            const self = this;
            const o    = self.options;

            if (!o.tooltips) return;

            // Bootstrap 5 Tooltip — guard against absence
            if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;

            self._destroyTooltips();

            self.$el.find('.ts-vn-link, .ts-vn-group-trigger').each(function() {
                const $el    = $(this);
                const label  = $el.find('.ts-vn-text').text().trim();
                if (!label) return;

                const tip = new bootstrap.Tooltip(this, {
                    title:     label,
                    placement: 'right',
                    trigger:   'hover focus',
                    container: 'body'
                });
                self._tooltips.push(tip);
            });
        }

        _destroyTooltips() {
            this._tooltips.forEach(t => t.dispose());
            this._tooltips = [];
        }
    }

    PluginVerticalNav.defaults = {
        collapsed:      false,
        activeTracking: true,
        hashTracking:   false,
        expandActive:   true,
        toggleBtn:      true,
        toggleTarget:   null,
        animDuration:   260,
        tooltips:       true
    };

    $.extend(themestrap, { PluginVerticalNav });

    $.fn.themestrapPluginVerticalNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginVerticalNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
