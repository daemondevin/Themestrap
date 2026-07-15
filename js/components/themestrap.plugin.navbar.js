/**
 * Navbar
 * This navigation connects a series of related pages. It sits below a
 * primary nav, exposes a logo/title, a set of links (some with dropdown menus),
 * and an optional call-to-action. The current page is flagged with an accent
 * top border.
 *
 * HTML anchor: [data-plugin-navbar]
 *
 * Quick-start:
 *   <nav class="ts-navbar" data-plugin-navbar
 *        data-plugin-options='{"palette": "light", "sticky": true}'
 *        aria-label="Secondary">
 *     ...
 *   </nav>
 *
 * Init.js wiring (add to themestrap.init.js):
 *   if ($.isFunction($.fn['themestrapPluginNavbar']) && $('[data-plugin-navbar]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-navbar]:not(.manual)', 'themestrapPluginNavbar');
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__navbar';
    
    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-navbar-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
:root {
    /* Themestrap palette */
    --ts-navy:        #0a1929;
    --ts-navy-2:      #0e2238;
    --ts-orange:      #e8672a;
    --ts-orange-2:    #d2541b;
    --ts-teal:        #2ab8c8;

    /* Semantic surface tokens — LIGHT palette defaults */
    --ts-navbar-bg:            #ffffff;
    --ts-navbar-border:        #e4e9f0;
    --ts-navbar-logo-color:    var(--primary);
    --ts-navbar-link-color:    #3a4a5e;
    --ts-navbar-link-hover:    var(--primary-100);
    --ts-navbar-link-current:  var(--primary);
    --ts-navbar-accent:        var(--primary);   /* the current-page bar */
    --ts-navbar-hover-bg:      #f4f6f9;
    --ts-navbar-menu-bg:       #ffffff;
    --ts-navbar-menu-border:   #e4e9f0;
    --ts-navbar-menu-link:     #3a4a5e;
    --ts-navbar-menu-link-hover: var(--primary);
    --ts-navbar-menu-heading:  #8190a3;
    --ts-navbar-toggle-color:  var(--primary);
    --ts-navbar-shadow:        0 1px 2px rgba(10,25,41,.06),
                               0 8px 24px rgba(10,25,41,.10);

    /* Sizing & motion */
    --ts-navbar-height:        56px;
    --ts-navbar-accent-size:   3px;
    --ts-navbar-radius:        8px;
    --ts-navbar-transition:    150ms ease;
    --ts-navbar-sticky-top:    0px;
    --ts-navbar-z:             1020;
}

.ts-navbar[data-ts-navbar-palette="dark"] {
    --ts-navbar-bg:            var(--dark);
    --ts-navbar-border:        var(--dark--200);
    --ts-navbar-logo-color:    #ffffff;
    --ts-navbar-link-color:    #b9c6d6;
    --ts-navbar-link-hover:    #ffffff;
    --ts-navbar-link-current:  #ffffff;
    --ts-navbar-hover-bg:      rgba(255,255,255,.05);
    --ts-navbar-menu-bg:       var(--primary--100);
    --ts-navbar-menu-border:   #1c3147;
    --ts-navbar-menu-link:     #b9c6d6;
    --ts-navbar-menu-link-hover: #ffffff;
    --ts-navbar-menu-heading:  #6f8194;
    --ts-navbar-toggle-color:  #ffffff;
    --ts-navbar-shadow:        0 1px 2px rgba(0,0,0,.3),
                               0 8px 24px rgba(0,0,0,.35);
}

.ts-navbar {
    position: relative;
    background: var(--ts-navbar-bg);
    border-bottom: 1px solid var(--ts-navbar-border);
}

/* Sticky pin — sits at the top once scrolled to. */
.ts-navbar--sticky {
    position: sticky;
    top: var(--ts-navbar-sticky-top);
    z-index: var(--ts-navbar-z);
}

/* Elevated state once pinned. */
.ts-navbar--stuck {
    box-shadow: var(--ts-navbar-shadow);
    border-bottom-color: transparent;
}

/* Zero-height scroll sentinel injected by the plugin. */
.ts-navbar__sentinel {
    height: 0;
    width: 100%;
    pointer-events: none;
}

.ts-navbar__container {
    display: flex;
    align-items: stretch;
    gap: 8px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    min-height: var(--ts-navbar-height);
}

.ts-navbar__logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ts-navbar-logo-color);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -.01em;
    text-decoration: none;
    white-space: nowrap;
    padding: 0 16px 0 0;
    margin-right: 4px;
    flex-shrink: 0;
    transition: opacity var(--ts-navbar-transition);
}
.ts-navbar__logo:hover,
.ts-navbar__logo:focus-visible {
    color: var(--ts-navbar-logo-color);
    opacity: .85;
}
.ts-navbar__logo img,
.ts-navbar__logo svg {
    height: 26px;
    width: auto;
    display: block;
}

.ts-navbar__collapse {
    display: flex;
    align-items: stretch;
    flex: 1 1 auto;
    gap: 8px;
}

.ts-navbar__nav {
    display: flex;
    align-items: stretch;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
}

.ts-navbar__item {
    display: flex;
    align-items: stretch;
    position: relative;
}

.ts-navbar__link,
.ts-navbar__dropdown-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 14px;
    /* Reserve room for the accent bar so :current never shifts layout. */
    border-top: var(--ts-navbar-accent-size) solid transparent;
    margin-top: -1px;                 /* overlap the wrapper border edge */
    color: var(--ts-navbar-link-color);
    font-size: .875rem;
    font-weight: 500;
    line-height: var(--ts-navbar-height);
    text-decoration: none;
    white-space: nowrap;
    background: none;
    border-left: 0; border-right: 0; border-bottom: 0;
    cursor: pointer;
    transition: color var(--ts-navbar-transition),
                background var(--ts-navbar-transition),
                border-color var(--ts-navbar-transition);
}

.ts-navbar__link:hover,
.ts-navbar__dropdown-toggle:hover {
    color: var(--ts-navbar-link-hover);
    background: var(--ts-navbar-hover-bg);
    border-top-color: color-mix(in srgb, var(--ts-navbar-accent) 45%, transparent);
}

.ts-navbar__link:focus-visible,
.ts-navbar__dropdown-toggle:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: -2px;
}

/* Current page — solid accent top border (Red Hat's signature cue). */
.ts-navbar__link--current,
.ts-navbar__link--current:hover,
.ts-navbar__link--current-parent {
    color: var(--ts-navbar-link-current);
    font-weight: 700;
    border-top-color: var(--ts-navbar-accent);
}

/* External links: never show the accent bar except on hover; they leave the IA. */
.ts-navbar__link--external {
    border-top-color: transparent !important;
}
.ts-navbar__link--external:hover {
    border-top-color: color-mix(in srgb, var(--ts-navbar-accent) 45%, transparent) !important;
}
.ts-navbar__external-icon {
    width: 11px; height: 11px;
    flex-shrink: 0;
    opacity: .7;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 2h8v8M14 2 6 10M11 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4' fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 2h8v8M14 2 6 10M11 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4' fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ts-navbar__caret {
    width: 12px; height: 12px;
    flex-shrink: 0;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
    transition: transform var(--ts-navbar-transition);
}
.ts-navbar__item--dropdown.is-open .ts-navbar__caret {
    transform: rotate(180deg);
}

.ts-navbar__menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: calc(var(--ts-navbar-z) + 5);
    min-width: 220px;
    margin-top: 0;
    padding: 8px;
    background: var(--ts-navbar-menu-bg);
    border: 1px solid var(--ts-navbar-menu-border);
    border-radius: var(--ts-navbar-radius);
    box-shadow: var(--ts-navbar-shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity var(--ts-navbar-transition),
                transform var(--ts-navbar-transition),
                visibility var(--ts-navbar-transition);
}
.ts-navbar__item--dropdown.is-open > .ts-navbar__menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.ts-navbar__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.ts-navbar__menu-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    color: var(--ts-navbar-menu-link);
    font-size: .875rem;
    text-decoration: none;
    border-radius: calc(var(--ts-navbar-radius) - 2px);
    transition: background var(--ts-navbar-transition),
                color var(--ts-navbar-transition);
}
.ts-navbar__menu-link:hover,
.ts-navbar__menu-link:focus-visible {
    background: var(--ts-navbar-hover-bg);
    color: var(--ts-navbar-menu-link-hover);
}
.ts-navbar__menu-link.ts-navbar__link--current {
    color: var(--ts-navbar-link-current);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--ts-navbar-accent);
}
.ts-navbar__menu-link:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: -2px;
}

.ts-navbar__menu--sections {
    display: flex;
    gap: 8px;
    min-width: auto;
    padding: 14px;
}
.ts-navbar__menu-section {
    min-width: 190px;
    padding: 0 8px;
    border-right: 1px solid var(--ts-navbar-menu-border);
}
.ts-navbar__menu-section:last-child {
    border-right: 0;
}
.ts-navbar__menu-heading {
    margin: 4px 12px 8px;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ts-navbar-menu-heading);
}
.ts-navbar__menu-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 8px 12px 4px;
    color: var(--ts-orange);
    font-size: .8125rem;
    font-weight: 600;
    text-decoration: none;
}
.ts-navbar__menu-cta:hover { color: var(--ts-orange-2); }
.ts-navbar__menu-cta::after {
    content: "";
    width: 12px; height: 12px;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8h9M9 4l4 4-4 4' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8h9M9 4l4 4-4 4' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ts-navbar__cta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-left: auto;
    padding-left: 8px;
}
.ts-navbar__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: .45rem 1rem;
    font-size: .8125rem;
    font-weight: 600;
    line-height: 1.2;
    border-radius: var(--ts-navbar-radius);
    border: 1.5px solid transparent;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--ts-navbar-transition),
                border-color var(--ts-navbar-transition),
                color var(--ts-navbar-transition);
}
.ts-navbar__btn--primary {
    background: var(--secondary);
    border-color: var(--secondary);
    color: #fff;
}
.ts-navbar__btn--primary:hover {
    background: var(--secondary-100);
    border-color: var(--secondary-100);
    color: #fff;
}
.ts-navbar__btn--ghost {
    background: transparent;
    border-color: var(--ts-navbar-border);
    color: var(--ts-navbar-link-color);
}
.ts-navbar__btn--ghost:hover {
    border-color: var(--tertiary);
    color: var(--ts-navbar-link-hover);
}

.ts-navbar__toggle {
    display: none;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    padding: 8px 10px;
    background: transparent;
    border: 0;
    border-radius: var(--ts-navbar-radius);
    color: var(--ts-navbar-toggle-color);
    cursor: pointer;
}
.ts-navbar__toggle:hover { background: var(--ts-navbar-hover-bg); }
.ts-navbar__toggle:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: 2px;
}
.ts-navbar__toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 4px;
    pointer-events: none;
}
.ts-navbar__toggle-bar {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transition: transform var(--ts-navbar-transition),
                opacity var(--ts-navbar-transition);
}
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(2) { opacity: 0; }
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 991.98px) {
    .ts-navbar__container {
        flex-wrap: wrap;
        align-items: center;
        min-height: var(--ts-navbar-height);
    }
    .ts-navbar__logo { margin-right: auto; }
    .ts-navbar__toggle { display: inline-flex; }

    .ts-navbar__collapse {
        flex: 0 0 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 220ms ease;
    }
    .ts-navbar--menu-open .ts-navbar__collapse {
        max-height: 80vh;
        overflow-y: auto;
        padding-bottom: 12px;
        border-top: 1px solid var(--ts-navbar-border);
        margin-top: 0;
    }

    .ts-navbar__nav { flex-direction: column; gap: 0; }
    .ts-navbar__item { display: block; }

    .ts-navbar__link,
    .ts-navbar__dropdown-toggle {
        width: 100%;
        height: auto;
        line-height: 1.4;
        padding: 13px 4px;
        border-top: 0;
        /* On mobile the accent moves to the left edge. */
        border-left: var(--ts-navbar-accent-size) solid transparent;
        margin-top: 0;
    }
    .ts-navbar__link:hover,
    .ts-navbar__dropdown-toggle:hover { border-top-color: transparent; }
    .ts-navbar__link--current,
    .ts-navbar__link--current-parent {
        border-top-color: transparent;
        border-left-color: var(--ts-navbar-accent);
    }
    .ts-navbar__dropdown-toggle { justify-content: space-between; }

    /* Menus expand inline rather than floating. */
    .ts-navbar__menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        border: 0;
        border-radius: 0;
        min-width: 0;
        padding: 0 0 6px 18px;
        display: none;
    }
    .ts-navbar__item--dropdown.is-open > .ts-navbar__menu { display: block; }
    .ts-navbar__menu--sections { flex-direction: column; gap: 0; }
    .ts-navbar__menu-section { border-right: 0; min-width: 0; padding: 0; }

    .ts-navbar__cta {
        margin-left: 0;
        padding: 12px 4px 4px;
        border-top: 1px solid var(--ts-navbar-border);
    }
    .ts-navbar__btn { flex: 1 1 auto; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
    .ts-navbar,
    .ts-navbar *,
    .ts-navbar *::before,
    .ts-navbar *::after {
        transition-duration: 1ms !important;
        animation-duration: 1ms !important;
    }
}
        `;
        document.head.appendChild(style);
    }


    // Unique ID seed — keeps collapse / dropdown targets independent when more
    // than one navbar exists on a single page.
    let _uid = 0;

    /** Current page pathname, hash/query stripped. */
    function currentPath() {
        return window.location.pathname.replace(/\/$/, '') || '/';
    }

    /** Normalize an href down to its pathname for comparison. */
    function linkPath(href) {
        try {
            return new URL(href, window.location.href).pathname.replace(/\/$/, '') || '/';
        } catch (e) {
            return href;
        }
    }

    /** True when an href points off the current origin. */
    function isExternal(href) {
        if (!href || href.charAt(0) === '#') return false;
        try {
            return new URL(href, window.location.href).origin !== window.location.origin;
        } catch (e) {
            return false;
        }
    }

    class PluginNavbar {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el = $el;
            this.uid = ++_uid;

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
            // Merge per-element data-plugin-options on top of any passed options.
            const attrOpts = (themestrap.fn && themestrap.fn.getOptions)
                ? themestrap.fn.getOptions(this.$el.data('plugin-options'))
                : null;
            if (attrOpts) opts = $.extend(true, {}, opts, attrOpts);

            this.options = $.extend(true, {}, PluginNavbar.defaults, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Base class + color palette
            $el.addClass('ts-navbar');
            $el.attr('data-ts-navbar-palette', o.palette);

            if (o.sticky) {
                $el.addClass('ts-navbar--sticky');
            }

            // Unique collapse target for the mobile toggle
            self._wireCollapse();

            // ARIA wiring on dropdown triggers
            self._wireDropdowns();

            // External link decoration
            if (o.markExternal) {
                self._markExternal();
            }

            // Current page detection
            if (o.highlightCurrent) {
                self._markCurrent();
            }

            // Sticky "stuck" sentinel
            if (o.sticky) {
                self._initSticky();
            }

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;
            const ns   = `.tsnavbar.${self.uid}`;

            // Dropdown toggle (click)
            $el.on(`click${ns}`, '.ts-navbar__dropdown-toggle', function (e) {
                e.preventDefault();
                const $li = $(this).closest('.ts-navbar__item--dropdown');
                self.toggleDropdown($li);
            });

            // Mobile collapse toggle
            $el.on(`click${ns}`, '.ts-navbar__toggle', function () {
                self.toggleMenu();
            });

            // Close open dropdown on outside click
            if (o.closeOnOutsideClick) {
                $(document).on(`click${ns}`, function (e) {
                    if (!$(e.target).closest('.ts-navbar__item--dropdown', $el[0]).length) {
                        self.closeDropdowns();
                    }
                });
            }

            // Escape closes dropdowns + mobile menu
            $(document).on(`keydown${ns}`, function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    const had = $el.find('.ts-navbar__item--dropdown.is-open').length;
                    self.closeDropdowns();
                    if ($el.hasClass('ts-navbar--menu-open')) {
                        self.closeMenu();
                    }
                    // Return focus to the trigger that was open.
                    if (had) {
                        $el.find('.ts-navbar__dropdown-toggle').filter(function () {
                            return $(this).attr('aria-expanded') === 'false';
                        });
                    }
                }
            });

            // Keyboard arrow navigation across top-level items
            if (o.keyboardNav) {
                self._keyboardNav(ns);
            }

            // Sticky scroll/resize re-measure 
            if (o.sticky && !self._observer) {
                $(window).on(`resize${ns}`, () => self._measureSticky());
            }

            // Re-run current detection on SPA popstate
            if (o.highlightCurrent) {
                $(window).on(`popstate${ns}`, () => self._markCurrent());
            }

            return this;
        }

        /** Toggle a dropdown <li>. Respects the oneOpen option. */
        toggleDropdown($li) {
            const isOpen = $li.hasClass('is-open');
            if (this.options.oneOpen) this.closeDropdowns();
            if (!isOpen) this.openDropdown($li);
            return this;
        }

        /** Open a dropdown <li>. */
        openDropdown($li) {
            $li.addClass('is-open')
               .find('> .ts-navbar__dropdown-toggle')
               .attr('aria-expanded', 'true');

            this.$el.trigger($.Event('open.tsnavbar', { item: $li[0] }));
            return this;
        }

        /** Close every open dropdown. */
        closeDropdowns() {
            this.$el.find('.ts-navbar__item--dropdown.is-open')
                .removeClass('is-open')
                .find('> .ts-navbar__dropdown-toggle')
                .attr('aria-expanded', 'false');

            this.$el.trigger($.Event('close.tsnavbar'));
            return this;
        }

        /** Open/close the mobile collapse region. */
        toggleMenu() {
            return this.$el.hasClass('ts-navbar--menu-open')
                ? this.closeMenu()
                : this.openMenu();
        }

        openMenu() {
            this.$el.addClass('ts-navbar--menu-open')
                .find('.ts-navbar__toggle').attr('aria-expanded', 'true');
            this.$el.trigger($.Event('menuopen.tsnavbar'));
            return this;
        }

        closeMenu() {
            this.$el.removeClass('ts-navbar--menu-open')
                .find('.ts-navbar__toggle').attr('aria-expanded', 'false');
            this.closeDropdowns();
            this.$el.trigger($.Event('menuclose.tsnavbar'));
            return this;
        }

        /** Mark a link as the current page by selector or href. */
        setCurrent(selector) {
            this.$el.find('.ts-navbar__link')
                .removeClass('ts-navbar__link--current')
                .removeAttr('aria-current');

            const $target = this.$el.find(selector);
            $target.addClass('ts-navbar__link--current').attr('aria-current', 'page');

            // Flag the parent dropdown toggle too.
            $target.closest('.ts-navbar__item--dropdown')
                .find('> .ts-navbar__dropdown-toggle')
                .addClass('ts-navbar__link--current-parent');

            return this;
        }

        /** Returns the current link element(s). */
        getCurrent() {
            return this.$el.find('.ts-navbar__link--current');
        }

        /** Assigns a unique id to the collapse region and points the toggle at it. */
        _wireCollapse() {
            const self     = this;
            const $collapse = self.$el.find('.ts-navbar__collapse').first();
            if (!$collapse.length) return;

            let id = $collapse.attr('id');
            if (!id || id === 'ts-navbar-collapse') {
                id = `ts-navbar-collapse-${self.uid}`;
                $collapse.attr('id', id);
            }

            self.$el.find('.ts-navbar__toggle').each(function () {
                $(this).attr('aria-controls', id);
                if ($(this).attr('aria-expanded') === undefined) {
                    $(this).attr('aria-expanded', 'false');
                }
            });
        }

        /** Ensures dropdown triggers carry the correct ARIA attributes. */
        _wireDropdowns() {
            this.$el.find('.ts-navbar__item--dropdown > .ts-navbar__dropdown-toggle')
                .each(function () {
                    const $t = $(this);
                    if ($t.attr('aria-haspopup') === undefined) $t.attr('aria-haspopup', 'true');
                    if ($t.attr('aria-expanded') === undefined) $t.attr('aria-expanded', 'false');
                });
        }

        /** Decorates off-origin links: target/rel + an external modifier class. */
        _markExternal() {
            this.$el.find('.ts-navbar__link, .ts-navbar__menu-link').each(function () {
                const $a  = $(this);
                const href = $a.attr('href');
                if (isExternal(href)) {
                    $a.addClass('ts-navbar__link--external');
                    if (!$a.attr('target')) $a.attr('target', '_blank');
                    if (!$a.attr('rel'))    $a.attr('rel', 'noopener noreferrer');
                }
            });
        }

        /** Auto-flags the link whose href matches the current pathname. */
        _markCurrent() {
            const self = this;
            const path = currentPath();
            let   hit  = false;

            self.$el.find('.ts-navbar__link, .ts-navbar__menu-link').each(function () {
                const $a   = $(this);
                const href = $a.attr('href');
                if (!href || href === '#' || $a.hasClass('ts-navbar__link--external')) return;

                const match = linkPath(href) === path;
                $a.toggleClass('ts-navbar__link--current', match)
                  .attr('aria-current', match ? 'page' : null);

                if (match) {
                    hit = true;
                    // If the match lives inside a dropdown, flag the trigger.
                    $a.closest('.ts-navbar__item--dropdown')
                      .find('> .ts-navbar__dropdown-toggle')
                      .addClass('ts-navbar__link--current-parent');
                }
            });

            return hit;
        }

        /** Sets up an IntersectionObserver sentinel so the bar can show an
         *  elevated "stuck" state once it pins to the top of the viewport. */
        _initSticky() {
            const self = this;

            // A zero-height sentinel placed immediately before the navbar.
            self._$sentinel = $('<div class="ts-navbar__sentinel" aria-hidden="true"></div>');
            self.$el.before(self._$sentinel);

            if (typeof IntersectionObserver !== 'undefined') {
                const top = parseInt(self.options.stickyOffset, 10) || 0;
                self._observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            self.$el.toggleClass('ts-navbar--stuck', !entry.isIntersecting);
                        });
                    },
                    { rootMargin: `-${top + 1}px 0px 0px 0px`, threshold: [1] }
                );
                self._observer.observe(self._$sentinel[0]);
            } else {
                // Fallback: scroll handler.
                self._measureSticky();
                $(window).on(`scroll.tsnavbar.${self.uid}`, () => self._measureSticky());
            }
        }

        /** Scroll fallback when IntersectionObserver is unavailable. */
        _measureSticky() {
            if (!this._$sentinel) return;
            const top = parseInt(this.options.stickyOffset, 10) || 0;
            const rect = this._$sentinel[0].getBoundingClientRect();
            this.$el.toggleClass('ts-navbar--stuck', rect.top <= top);
        }

        /** Left/right arrow navigation across the visible top-level links. */
        _keyboardNav(ns) {
            const self = this;

            self.$el.on(`keydown${ns}`, '.ts-navbar__link, .ts-navbar__dropdown-toggle', function (e) {
                const $items = self.$el
                    .find('.ts-navbar__nav > .ts-navbar__item > .ts-navbar__link, ' +
                          '.ts-navbar__nav > .ts-navbar__item > .ts-navbar__dropdown-toggle')
                    .filter(':visible');

                const idx = $items.index(this);
                if (idx === -1) return;

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    $items.eq(Math.min(idx + 1, $items.length - 1)).trigger('focus');
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    $items.eq(Math.max(idx - 1, 0)).trigger('focus');
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    $items.first().trigger('focus');
                } else if (e.key === 'End') {
                    e.preventDefault();
                    $items.last().trigger('focus');
                } else if ((e.key === 'Enter' || e.key === ' ') &&
                           $(this).hasClass('ts-navbar__dropdown-toggle')) {
                    e.preventDefault();
                    self.toggleDropdown($(this).closest('.ts-navbar__item--dropdown'));
                }
            });
        }

        destroy() {
            const self = this;
            const ns   = `.tsnavbar.${self.uid}`;

            $(window).off(ns);
            $(document).off(ns);
            self.$el.off(ns);

            if (self._observer) {
                self._observer.disconnect();
                self._observer = null;
            }
            if (self._$sentinel) {
                self._$sentinel.remove();
                self._$sentinel = null;
            }

            self.$el
                .removeClass('ts-navbar ts-navbar--sticky ts-navbar--stuck ts-navbar--menu-open')
                .removeAttr('data-ts-navbar-palette')
                .removeData(instanceName);

            self.$el.find('.ts-navbar__item--dropdown.is-open').removeClass('is-open');

            return this;
        }
    }

    PluginNavbar.defaults = {
        palette:             'light', // 'light' | 'dark'
        sticky:              true,    // pin to the top of the viewport on scroll
        stickyOffset:        0,       // px offset from the top when stuck
        highlightCurrent:    true,    // auto-detect the current page link
        markExternal:        true,    // add target/rel + external modifier to off-site links
        closeOnOutsideClick: true,    // close open dropdowns when clicking elsewhere
        keyboardNav:         true,    // arrow / Home / End / Enter / Space key support
        oneOpen:             true     // only one dropdown open at a time
    };

    $.extend(themestrap, { PluginNavbar });

    $.fn.themestrapPluginNavbar = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginNavbar($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
