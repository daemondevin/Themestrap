// Plugin Context Menu
(((themestrap = {}, $) => {
    const instanceName = '__pluginContextMenu';
    const STYLE_ID     = 'ts-contextmenu-styles';

    // CSS
    const CSS = `
/* Themestrap Context Menu */
.ts-ctx-menu {
    position: fixed;
    z-index: 9999;
    min-width: 180px;
    max-width: 280px;
    padding: 4px;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1),
                0 0 0 1px rgba(0,0,0,.04);
    font-family: inherit;
    font-size: .875rem;
    line-height: 1.4;
    opacity: 0;
    transform: scale(.95);
    transform-origin: var(--ts-ctx-origin-x, top) var(--ts-ctx-origin-y, left);
    transition: opacity 120ms ease, transform 120ms ease;
    pointer-events: none;
    user-select: none;
}
.ts-ctx-menu.ts-ctx-visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
}

/* Dark mode */
html.dark .ts-ctx-menu,
.ts-ctx-menu.ts-ctx-dark {
    background: #1c1c1e;
    border-color: rgba(255,255,255,.08);
    color: #f5f5f5;
}

/* Items */
.ts-ctx-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: .875rem;
    text-align: left;
    cursor: pointer;
    outline: none;
    position: relative;
    white-space: nowrap;
}
.ts-ctx-item:hover,
.ts-ctx-item:focus {
    background: rgba(0,0,0,.06);
}
html.dark .ts-ctx-item:hover,
html.dark .ts-ctx-item:focus,
.ts-ctx-dark .ts-ctx-item:hover,
.ts-ctx-dark .ts-ctx-item:focus {
    background: rgba(255,255,255,.08);
}
.ts-ctx-item.ts-ctx-destructive {
    color: #dc2626;
}
html.dark .ts-ctx-item.ts-ctx-destructive,
.ts-ctx-dark .ts-ctx-item.ts-ctx-destructive {
    color: #f87171;
}
.ts-ctx-item.ts-ctx-destructive:hover,
.ts-ctx-item.ts-ctx-destructive:focus {
    background: rgba(220,38,38,.08);
}
.ts-ctx-item.ts-ctx-disabled {
    opacity: .45;
    cursor: not-allowed;
    pointer-events: none;
}
.ts-ctx-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: .7;
}
.ts-ctx-item-label {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ts-ctx-item-shortcut {
    margin-left: auto;
    flex-shrink: 0;
    font-size: .75rem;
    opacity: .5;
    letter-spacing: .02em;
}

/* Separator */
.ts-ctx-separator {
    height: 1px;
    margin: 4px 0;
    background: rgba(0,0,0,.07);
}
html.dark .ts-ctx-separator,
.ts-ctx-dark .ts-ctx-separator {
    background: rgba(255,255,255,.08);
}

/* Label (non-interactive group label) */
.ts-ctx-label {
    padding: 4px 8px 2px;
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    opacity: .45;
    cursor: default;
}

/* Sub-menu arrow */
.ts-ctx-item-arrow {
    margin-left: auto;
    flex-shrink: 0;
    opacity: .45;
    font-size: .7rem;
}

/* Sub-menu */
.ts-ctx-submenu {
    position: fixed;
    z-index: 10000;
}
`;

    // Class
    class PluginContextMenu {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el   = $el;
            this.$menu = null;

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
            this.options = $.extend(true, {}, PluginContextMenu.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        // CSS injection
        _injectStyles() {
            if (!document.getElementById(STYLE_ID)) {
                const $style = $('<style>').attr('id', STYLE_ID).text(CSS);
                $('head').append($style);
            }
        }

        // Build
        build() {
            const self = this;
            self._injectStyles();
            self._buildMenu();
            return this;
        }

        _buildMenu() {
            const self  = this;
            const opts  = self.options;
            const dark  = opts.dark;

            const $menu = $('<div>')
                .addClass('ts-ctx-menu')
                .toggleClass('ts-ctx-dark', dark)
                .attr('role', 'menu')
                .attr('aria-label', opts.ariaLabel || 'Context menu')
                .css('display', 'none');

            self._renderItems(opts.items, $menu);

            $('body').append($menu);
            self.$menu = $menu;
        }

        _renderItems(items, $container) {
            const self = this;

            if (!Array.isArray(items) || !items.length) { return; }

            items.forEach(item => {
                if (item.type === 'separator') {
                    $container.append($('<div>').addClass('ts-ctx-separator').attr('role', 'separator'));
                    return;
                }
                if (item.type === 'label') {
                    $container.append($('<div>').addClass('ts-ctx-label').text(item.text));
                    return;
                }

                const $item = $('<button>')
                    .addClass('ts-ctx-item')
                    .attr('type', 'button')
                    .attr('role', 'menuitem')
                    .toggleClass('ts-ctx-destructive', !!item.destructive)
                    .toggleClass('ts-ctx-disabled', !!item.disabled)
                    .attr('tabindex', item.disabled ? -1 : 0);

                if (item.icon) {
                    $item.append($('<span>').addClass('ts-ctx-item-icon').html(item.icon));
                }

                $item.append($('<span>').addClass('ts-ctx-item-label').text(item.label));

                if (item.shortcut) {
                    $item.append($('<span>').addClass('ts-ctx-item-shortcut').text(item.shortcut));
                }

                if (Array.isArray(item.items) && item.items.length) {
                    // Sub-menu trigger
                    $item.append($('<span>').addClass('ts-ctx-item-arrow').html('&#x276F;'));
                    $item.data('ts-ctx-has-sub', true);
                    self._bindSubmenuItem($item, item.items);
                } else if (typeof item.action === 'function') {
                    $item.on('click.contextmenu', function(e) {
                        if ($item.hasClass('ts-ctx-disabled')) { return; }
                        item.action.call(self.$el[0], e, item);
                        self.close();
                    });
                }

                $container.append($item);
            });
        }

        _bindSubmenuItem($item, subItems) {
            const self = this;
            let   $sub = null;
            let   hideTimer;

            const openSub = () => {
                clearTimeout(hideTimer);
                if ($sub && $sub.length) {
                    $sub.remove();
                    $sub = null;
                }

                $sub = $('<div>')
                    .addClass('ts-ctx-menu ts-ctx-submenu')
                    .toggleClass('ts-ctx-dark', self.options.dark)
                    .attr('role', 'menu');

                self._renderItems(subItems, $sub);
                $('body').append($sub);

                const rect  = $item[0].getBoundingClientRect();
                let   left  = rect.right + 4;
                let   top   = rect.top;

                $sub.css({ left, top, display: 'block' });

                const subW  = $sub.outerWidth();
                const subH  = $sub.outerHeight();
                const vw    = window.innerWidth;
                const vh    = window.innerHeight;

                if (left + subW > vw - 8) { left = rect.left - subW - 4; }
                if (top + subH > vh - 8)  { top  = vh - subH - 8; }

                $sub.css({ left, top });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { $sub.addClass('ts-ctx-visible'); });
                });

                $sub.on('mouseenter.subctx', () => { clearTimeout(hideTimer); })
                    .on('mouseleave.subctx', () => {
                        hideTimer = setTimeout(closeSub, 120);
                    });
            };

            const closeSub = () => {
                if ($sub && $sub.length) {
                    $sub.removeClass('ts-ctx-visible');
                    setTimeout(() => { if ($sub) { $sub.remove(); $sub = null; } }, 130);
                }
            };

            $item.on('mouseenter.contextmenu', () => {
                clearTimeout(hideTimer);
                // Close sibling sub-menus
                $item.closest('.ts-ctx-menu').find('.ts-ctx-item').not($item).trigger('ts-ctx-close-sub');
                openSub();
            })
            .on('mouseleave.contextmenu', () => {
                hideTimer = setTimeout(closeSub, 120);
            })
            .on('ts-ctx-close-sub.contextmenu', () => {
                closeSub();
            })
            .on('keydown.contextmenu', function(e) {
                if (e.key === 'ArrowRight' || e.key === 'Enter') { openSub(); }
                if (e.key === 'ArrowLeft')  { closeSub(); }
            });

            // Expose close for parent destroy
            $item.data('ts-ctx-close-sub', closeSub);
        }

        // Events
        events() {
            const self = this;
            const opts = self.options;

            self.$el.on('contextmenu.contextmenu', function(e) {
                e.preventDefault();
                self._openAt(e.clientX, e.clientY);
            });

            if (opts.triggerEvent === 'longpress') {
                let pressTimer;
                self.$el
                    .on('touchstart.contextmenu', function(e) {
                        pressTimer = setTimeout(() => {
                            const t = e.originalEvent.touches[0];
                            self._openAt(t.clientX, t.clientY);
                        }, opts.longpressDelay);
                    })
                    .on('touchend.contextmenu touchmove.contextmenu', () => {
                        clearTimeout(pressTimer);
                    });
            }

            // Close on outside click / scroll / escape
            $(document)
                .on('click.contextmenu-' + self._uid(), function(e) {
                    if (!$(e.target).closest('.ts-ctx-menu').length) {
                        self.close();
                    }
                })
                .on('keydown.contextmenu-' + self._uid(), function(e) {
                    if (e.key === 'Escape') { self.close(); }
                    if (e.key === 'ArrowDown') { self._focusItem(1); }
                    if (e.key === 'ArrowUp')   { self._focusItem(-1); }
                    if (e.key === 'Tab')        { self.close(); }
                })
                .on('scroll.contextmenu-' + self._uid() + ' contextmenu.contextmenu-' + self._uid(), function() {
                    self.close();
                });

            return this;
        }

        // Positioning & open/close
        _openAt(x, y) {
            const self = this;
            const $m   = self.$menu;

            // Close any other open context menus
            if (self.options.mutualExclusion) {
                $('[data-plugin-context-menu]').each(function() {
                    const inst = $(this).data(instanceName);
                    if (inst && inst !== self) { inst.close(); }
                });
            }

            $m.css({ left: x, top: y, display: 'block' });

            const mW = $m.outerWidth();
            const mH = $m.outerHeight();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let finalX = x;
            let finalY = y;
            let originX = 'left';
            let originY = 'top';

            if (x + mW > vw - 8) { finalX = vw - mW - 8; originX = 'right'; }
            if (y + mH > vh - 8) { finalY = vh - mH - 8; originY = 'bottom'; }

            $m.css({
                left: finalX,
                top:  finalY,
                '--ts-ctx-origin-x': originX,
                '--ts-ctx-origin-y': originY
            });

            // Focus first item once visible
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    $m.addClass('ts-ctx-visible');
                    $m.find('.ts-ctx-item:not(.ts-ctx-disabled)').first().trigger('focus');
                });
            });

            self.$el.trigger('ts-ctx-open', [self]);

            if (typeof self.options.onOpen === 'function') {
                self.options.onOpen.call(self.$el[0], self);
            }
        }

        close() {
            const self = this;
            const $m   = self.$menu;

            if (!$m || !$m.hasClass('ts-ctx-visible')) { return this; }

            $m.removeClass('ts-ctx-visible');
            setTimeout(() => { $m.css('display', 'none'); }, 130);

            // Close any orphaned sub-menus
            $m.find('[data-ts-ctx-has-sub]').each(function() {
                const close = $(this).data('ts-ctx-close-sub');
                if (typeof close === 'function') { close(); }
            });

            self.$el.trigger('ts-ctx-close', [self]);

            if (typeof self.options.onClose === 'function') {
                self.options.onClose.call(self.$el[0], self);
            }

            return this;
        }

        // Keyboard navigation
        _focusItem(direction) {
            const self  = this;
            const $m    = self.$menu;
            if (!$m.hasClass('ts-ctx-visible')) { return; }

            const $items   = $m.find('.ts-ctx-item:not(.ts-ctx-disabled)');
            const $focused = $m.find('.ts-ctx-item:focus');
            let   idx      = $items.index($focused);

            idx = idx + direction;
            if (idx < 0)              { idx = $items.length - 1; }
            if (idx >= $items.length) { idx = 0; }

            $items.eq(idx).trigger('focus');
        }

        // UID helper (for namespaced doc events)
        _uid() {
            if (!this.__uid) {
                this.__uid = Math.random().toString(36).slice(2, 8);
            }
            return this.__uid;
        }

        // Public API
        /**
         * Programmatically update the menu items and rebuild the menu.
         * @param {Array} items  New items array following the same schema.
         */
        setItems(items) {
            const self = this;
            self.options.items = items;
            if (self.$menu) {
                self.$menu.remove();
                self.$menu = null;
            }
            self._buildMenu();
            return this;
        }

        // Destroy
        destroy() {
            const self = this;

            self.close();

            if (self.$menu) {
                self.$menu.remove();
                self.$menu = null;
            }

            self.$el.off('.contextmenu');

            $(document)
                .off('click.contextmenu-' + self._uid())
                .off('keydown.contextmenu-' + self._uid())
                .off('scroll.contextmenu-' + self._uid())
                .off('contextmenu.contextmenu-' + self._uid());

            self.$el.removeData(instanceName);

            return this;
        }
    }

    //  Defaults
    PluginContextMenu.defaults = {
        /**
         * Menu items array. Each item is one of:
         *
         *   { label, action, icon?, shortcut?, disabled?, destructive? }
         *   { type: 'separator' }
         *   { type: 'label', text }
         *   { label, icon?, items: [...] }   ← sub-menu
         */
        items: [],

        /** Apply dark theme to the menu */
        dark: false,

        /** aria-label for the menu container */
        ariaLabel: 'Context menu',

        /**
         * Extra trigger in addition to right-click.
         * 'longpress' — opens menu after a touch-and-hold on mobile.
         */
        triggerEvent: null,

        /** Longpress delay in ms (only used when triggerEvent: 'longpress') */
        longpressDelay: 600,

        /**
         * When true, opening one context-menu closes any other
         * open context-menus on the page.
         */
        mutualExclusion: true,

        /** Callback fired when menu opens. Receives the plugin instance. */
        onOpen: null,

        /** Callback fired when menu closes. Receives the plugin instance. */
        onClose: null,
    };

    // Namespace export
    $.extend(themestrap, { PluginContextMenu });

    // jQuery plugin method
    $.fn.themestrapPluginContextMenu = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginContextMenu($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
