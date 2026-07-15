/**
 * Themestrap Navigation Menu Plugin
 * Accessible, animated mega-menu / navigation menu.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * Markup anatomy
 *
 *   <nav data-plugin-navmenu
 *        data-plugin-options='{"orientation":"horizontal","delay":200}'>
 *
 *     <!-- Each top-level item -->
 *     <div data-navmenu-item>
 *
 *       <!-- Plain link (no sub-menu) -->
 *       <a href="/about" data-navmenu-link>About</a>
 *
 *     </div>
 *
 *     <div data-navmenu-item>
 *
 *       <!-- Trigger button (opens the content panel) -->
 *       <button data-navmenu-trigger aria-expanded="false">Products</button>
 *
 *       <!-- Content panel — can hold any HTML; grid layouts work great -->
 *       <div data-navmenu-content>
 *         <ul>
 *           <li><a href="/products/alpha" data-navmenu-list-item>
 *             <span data-navmenu-list-item-icon>★</span>
 *             <div>
 *               <div data-navmenu-list-item-title>Alpha</div>
 *               <p data-navmenu-list-item-desc>Alpha product description.</p>
 *             </div>
 *           </a></li>
 *         </ul>
 *       </div>
 *
 *     </div>
 *   </nav>
 *
 *   <!-- Optional: viewport element for animated panel transitions -->
 *   <div data-navmenu-viewport></div>
 *
 * Options
 *
 *   orientation       "horizontal"|"vertical"    layout axis                   "horizontal"
 *   openOn            "hover"|"click"            what opens panels             "hover"
 *   delay             200                        hover open delay (ms)         200
 *   closeDelay        150                        hover close delay (ms)        150
 *   animationIn       "ts-navmenu-in"            CSS class added on open       "ts-navmenu-in"
 *   animationOut      "ts-navmenu-out"           CSS class added on close      "ts-navmenu-out"
 *   animationDuration 200                        fallback timeout (ms)         200
 *   useViewport       false                      portal panels into the        false
 *                                                [data-navmenu-viewport] el
 *   closeOnEscape     true                       Esc key closes open panel     true
 *   closeOnOutside    true                       click outside closes          true
 *   onOpen            null                       callback(item, instance)      null
 *   onClose           null                       callback(item, instance)      null
 *
 * Public API 
 *
 *   const nav = $('[data-plugin-navmenu]').data('__pluginNavmenu');
 *   nav.open(index);          // open item by index (0-based)
 *   nav.close();              // close the active item
 *   nav.toggle(index);        // toggle item by index
 *   nav.getActive();          // returns index of open item, or -1
 *
 * Events
 *
 *   navmenu-opened   fired on [data-plugin-navmenu] after a panel opens
 *   navmenu-closed   fired on [data-plugin-navmenu] after a panel closes
 *
 *   Both events carry { detail: { index, $item, instance } }
 *
 * Init.js wiring 
 *
 *   if ($.isFunction($.fn['themestrapPluginNavmenu']) && $('[data-plugin-navmenu]').length) {
 *       $(() => {
 *           $('[data-plugin-navmenu]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginNavmenu(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginNavmenu';

    /* tiny uid helper */
    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    /* lazy CSS injection */
    const STYLE_ID = 'ts-navmenu-styles';
    const CSS_TEXT = `
/* Themestrap Navigation Menu */
[data-plugin-navmenu] {
    position: relative;
    display: flex;
    align-items: center;
    gap: .25rem;
}

[data-plugin-navmenu][data-navmenu-orientation="vertical"] {
    flex-direction: column;
    align-items: stretch;
}

[data-navmenu-item] {
    position: relative;
}

[data-navmenu-trigger] {
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

[data-navmenu-trigger]:hover,
[data-navmenu-trigger][aria-expanded="true"] {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
}

[data-navmenu-trigger]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

/* Chevron indicator */
[data-navmenu-trigger]::after {
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

[data-navmenu-trigger][aria-expanded="true"]::after {
    transform: rotate(-180deg);
}

/* Plain nav links */
[data-navmenu-link] {
    display: inline-flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .375rem;
    font-size: .875rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    transition: background-color .15s ease, color .15s ease;
    white-space: nowrap;
}

[data-navmenu-link]:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    text-decoration: none;
}

[data-navmenu-link]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

/* Content panels */
[data-navmenu-content] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    background: var(--ts-nav-content-bg, #fff);
    border: 1px solid var(--ts-nav-content-border, rgba(0,0,0,.08));
    border-radius: .5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
    padding: .5rem;
    z-index: 1050;
    display: none;
    transform-origin: top center;
}

[data-navmenu-content].ts-navmenu-active {
    display: block;
}

/* right-aligned panel when item is near end of nav */
[data-navmenu-item].ts-navmenu-align-right [data-navmenu-content] {
    left: auto;
    right: 0;
}

/* Vertical orientation: panels appear to the right */
[data-plugin-navmenu][data-navmenu-orientation="vertical"] [data-navmenu-content] {
    top: 0;
    left: calc(100% + .5rem);
}

/* Viewport */
[data-navmenu-viewport] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    overflow: hidden;
    background: var(--ts-nav-content-bg, #fff);
    border: 1px solid var(--ts-nav-content-border, rgba(0,0,0,.08));
    border-radius: .5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
    z-index: 1050;
    display: none;
    transition: width .2s ease, height .2s ease, left .2s ease;
}

[data-navmenu-viewport].ts-navmenu-viewport-active {
    display: block;
}

/* Animations */
@keyframes ts-navmenu-in-kf {
    from { opacity: 0; transform: translateY(-6px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
}

@keyframes ts-navmenu-out-kf {
    from { opacity: 1; transform: translateY(0)    scale(1);   }
    to   { opacity: 0; transform: translateY(-6px) scale(.97); }
}

.ts-navmenu-in  { animation: ts-navmenu-in-kf  .18s cubic-bezier(.16,1,.3,1) both; }
.ts-navmenu-out { animation: ts-navmenu-out-kf .14s ease-in               both; }

/* Vertical axis animations */
[data-plugin-navmenu][data-navmenu-orientation="vertical"] .ts-navmenu-in {
    animation-name: ts-navmenu-in-v-kf;
}
[data-plugin-navmenu][data-navmenu-orientation="vertical"] .ts-navmenu-out {
    animation-name: ts-navmenu-out-v-kf;
}

@keyframes ts-navmenu-in-v-kf {
    from { opacity: 0; transform: translateX(-6px) scale(.97); }
    to   { opacity: 1; transform: translateX(0)    scale(1);   }
}

@keyframes ts-navmenu-out-v-kf {
    from { opacity: 1; transform: translateX(0)    scale(1);   }
    to   { opacity: 0; transform: translateX(-6px) scale(.97); }
}

/* List items inside panels */
[data-navmenu-list-item] {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .625rem .75rem;
    border-radius: .375rem;
    text-decoration: none;
    color: inherit;
    transition: background-color .15s ease;
}

[data-navmenu-list-item]:hover {
    background-color: color-mix(in srgb, currentColor 6%, transparent);
    text-decoration: none;
}

[data-navmenu-list-item]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

[data-navmenu-list-item-icon] {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: .375rem;
    background-color: var(--ts-nav-icon-bg, color-mix(in srgb, currentColor 8%, transparent));
    flex-shrink: 0;
    font-size: 1.1rem;
    line-height: 1;
}

[data-navmenu-list-item-title] {
    font-size: .875rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: .125rem;
}

[data-navmenu-list-item-desc] {
    font-size: .8125rem;
    line-height: 1.4;
    color: var(--ts-nav-muted, rgba(0,0,0,.55));
    margin: 0;
}

/* Dark-mode overrides */
html.dark [data-navmenu-content],
html.dark [data-navmenu-viewport] {
    background: var(--ts-nav-content-bg, #1c1c1e);
    border-color: var(--ts-nav-content-border, rgba(255,255,255,.1));
    box-shadow: 0 4px 24px rgba(0,0,0,.4);
}

html.dark [data-navmenu-list-item-desc] {
    color: var(--ts-nav-muted, rgba(255,255,255,.55));
}
`;

    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        document.head.appendChild(style);
    }

    class PluginNavmenu {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) { return this; }

            this.$el         = $el;
            this.$items      = [];
            this.activeIndex = -1;
            this._openTimer  = null;
            this._closeTimer = null;

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
            this.options = $.extend(true, {}, PluginNavmenu.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectCSS();

            const self = this;
            const o    = self.options;

            /* Mark orientation */
            self.$el.attr('data-navmenu-orientation', o.orientation);

            /* Collect items */
            self.$items = self.$el.children('[data-navmenu-item]').toArray().map((el, idx) => {
                const $item    = $(el);
                const $trigger = $item.find('[data-navmenu-trigger]').first();
                const $content = $item.find('[data-navmenu-content]').first();

                /* Skip plain-link items */
                if (!$trigger.length || !$content.length) return null;

                /* Unique IDs for ARIA */
                const triggerId = $trigger.attr('id') || uid('ts-navmenu-trigger');
                const contentId = $content.attr('id') || uid('ts-navmenu-content');

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

            /* Viewport portal: move all content panels into it */
            self.$viewport = self.$el.siblings('[data-navmenu-viewport]').first();
            if (o.useViewport && self.$viewport.length) {
                self.$items.forEach(item => {
                    item.$originalParent = item.$content.parent();
                    item.$content.appendTo(self.$viewport);
                });
            }

            /* Check edge alignment */
            self._updateAlignment();

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;

            self.$items.forEach((item, idx) => {
                if (o.openOn === 'hover') {
                    /* Hover on item triggers open/close */
                    item.$item
                        .on('mouseenter.navmenu', () => {
                            clearTimeout(self._closeTimer);
                            self._openTimer = setTimeout(() => self.open(idx), o.delay);
                        })
                        .on('mouseleave.navmenu', () => {
                            clearTimeout(self._openTimer);
                            self._closeTimer = setTimeout(() => {
                                if (self.activeIndex === idx) self.close();
                            }, o.closeDelay);
                        });

                    /* Keep open when hovering inside content */
                    item.$content
                        .on('mouseenter.navmenu', () => clearTimeout(self._closeTimer))
                        .on('mouseleave.navmenu', () => {
                            self._closeTimer = setTimeout(() => {
                                if (self.activeIndex === idx) self.close();
                            }, o.closeDelay);
                        });
                }

                /* Trigger click — always toggle */
                item.$trigger.on('click.navmenu', (e) => {
                    e.stopPropagation();
                    self.toggle(idx);
                });

                /* Keyboard: Enter/Space on trigger */
                item.$trigger.on('keydown.navmenu', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.toggle(idx);
                    }
                    if (e.key === 'Escape') {
                        self.close();
                        item.$trigger.trigger('focus');
                    }
                    /* Arrow navigation between triggers */
                    if (o.orientation === 'horizontal') {
                        if (e.key === 'ArrowRight') { e.preventDefault(); self._focusAdjacentTrigger(idx, 1); }
                        if (e.key === 'ArrowLeft')  { e.preventDefault(); self._focusAdjacentTrigger(idx, -1); }
                        if (e.key === 'ArrowDown' && self.activeIndex === idx) {
                            e.preventDefault();
                            self._focusFirstInContent(idx);
                        }
                    }
                    if (o.orientation === 'vertical') {
                        if (e.key === 'ArrowDown')  { e.preventDefault(); self._focusAdjacentTrigger(idx, 1); }
                        if (e.key === 'ArrowUp')    { e.preventDefault(); self._focusAdjacentTrigger(idx, -1); }
                        if (e.key === 'ArrowRight' && self.activeIndex === idx) {
                            e.preventDefault();
                            self._focusFirstInContent(idx);
                        }
                    }
                });
            });

            /* Close on Escape (document level) */
            if (o.closeOnEscape) {
                $(document).on('keydown.navmenu-' + self.$el.attr('id'), (e) => {
                    if (e.key === 'Escape' && self.activeIndex > -1) {
                        const active = self.$items[self.activeIndex];
                        self.close();
                        if (active) active.$trigger.trigger('focus');
                    }
                });
            }

            /* Close on outside click */
            if (o.closeOnOutside) {
                $(document).on('click.navmenu-' + self.$el.attr('id'), (e) => {
                    if (self.activeIndex === -1) return;
                    const $t = $(e.target);
                    /* Clicked inside nav root or active viewport panel? Stay open. */
                    if ($t.closest(self.$el).length) return;
                    if (self.$viewport && self.$viewport.length && $t.closest(self.$viewport).length) return;
                    self.close();
                });
            }

            /* Recalc edge alignment on resize */
            $(window).on('resize.navmenu-' + (self.$el.attr('id') || uid('nav')), () => {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(() => self._updateAlignment(), 100);
            });

            return this;
        }

        open(index) {
            const self  = this;
            const o     = self.options;
            const item  = self.$items[index];
            if (!item) return this;

            /* Close existing */
            if (self.activeIndex > -1 && self.activeIndex !== index) {
                self._closePanel(self.$items[self.activeIndex], false);
            }

            self.activeIndex = index;
            item.$trigger.attr('aria-expanded', 'true');

            /* Viewport mode: position viewport under trigger */
            if (o.useViewport && self.$viewport && self.$viewport.length) {
                self._positionViewport(item);
                self.$viewport.addClass('ts-navmenu-viewport-active');
                /* Hide all content panels inside viewport, show the right one */
                self.$viewport.find('[data-navmenu-content]').not(item.$content).hide();
                item.$content.show();
            }

            /* Animate in */
            item.$content
                .removeClass(o.animationOut)
                .addClass('ts-navmenu-active ' + o.animationIn);

            /* Callback & event */
            if (typeof o.onOpen === 'function') o.onOpen(item, self);
            self.$el[0].dispatchEvent(new CustomEvent('navmenu-opened', {
                bubbles: true,
                detail: { index, $item: item.$item, instance: self }
            }));

            return this;
        }

        close() {
            const self = this;
            if (self.activeIndex === -1) return this;

            const item = self.$items[self.activeIndex];
            self.activeIndex = -1;

            if (item) self._closePanel(item, true);
            return this;
        }

        toggle(index) {
            return this.activeIndex === index ? this.close() : this.open(index);
        }

        getActive() {
            return this.activeIndex;
        }

        destroy() {
            const self = this;
            const o    = self.options;

            clearTimeout(self._openTimer);
            clearTimeout(self._closeTimer);
            clearTimeout(self._resizeTimer);

            /* Restore portaled content */
            if (o.useViewport && self.$viewport && self.$viewport.length) {
                self.$items.forEach(item => {
                    if (item.$originalParent) item.$content.appendTo(item.$originalParent);
                });
                self.$viewport
                    .removeClass('ts-navmenu-viewport-active')
                    .hide()
                    .removeAttr('style');
            }

            /* Restore ARIA & classes */
            self.$items.forEach(item => {
                item.$trigger.removeAttr('aria-expanded aria-controls aria-haspopup');
                item.$content.removeClass('ts-navmenu-active ' + o.animationIn + ' ' + o.animationOut);
                item.$item.off('.navmenu');
                item.$trigger.off('.navmenu');
                item.$content.off('.navmenu');
            });

            self.$el
                .removeAttr('data-navmenu-orientation')
                .off('.navmenu');

            const navId = self.$el.attr('id');
            if (navId) {
                $(document).off('keydown.navmenu-' + navId);
                $(document).off('click.navmenu-' + navId);
                $(window).off('resize.navmenu-' + navId);
            }

            self.$el.removeData(instanceName);
            return this;
        }

        _closePanel($itemOrRecord, animate) {
            const self = this;
            const o    = self.options;
            const item = $itemOrRecord.$trigger ? $itemOrRecord : null; // already a record
            if (!item) return;

            item.$trigger.attr('aria-expanded', 'false');

            const done = () => {
                item.$content
                    .removeClass('ts-navmenu-active ' + o.animationIn + ' ' + o.animationOut);

                if (o.useViewport && self.$viewport && self.$viewport.length) {
                    self.$viewport.removeClass('ts-navmenu-viewport-active').hide();
                }

                if (typeof o.onClose === 'function') o.onClose(item, self);
                self.$el[0].dispatchEvent(new CustomEvent('navmenu-closed', {
                    bubbles: true,
                    detail: { index: item.index, $item: item.$item, instance: self }
                }));
            };

            if (animate && o.animationOut) {
                item.$content.removeClass(o.animationIn).addClass(o.animationOut);
                const timeout = setTimeout(done, o.animationDuration);
                item.$content.one('animationend.navmenu', () => {
                    clearTimeout(timeout);
                    done();
                });
            } else {
                done();
            }
        }

        _positionViewport(item) {
            const self     = this;
            const navRect  = self.$el[0].getBoundingClientRect();
            const trigRect = item.$trigger[0].getBoundingClientRect();
            const left     = trigRect.left - navRect.left;

            self.$viewport.css({
                left: left + 'px',
                width: item.$content.outerWidth(true) + 'px'
            });
        }

        _updateAlignment() {
            const self   = this;
            const navW   = self.$el[0].getBoundingClientRect().right;
            const winW   = window.innerWidth;

            self.$items.forEach(item => {
                const itemRight = item.$item[0].getBoundingClientRect().right;
                /* If content panel would overflow right edge, right-align it */
                const panelW    = item.$content.outerWidth(true) || 240;
                if (itemRight + panelW > winW) {
                    item.$item.addClass('ts-navmenu-align-right');
                } else {
                    item.$item.removeClass('ts-navmenu-align-right');
                }
            });
        }

        _focusAdjacentTrigger(currentIdx, delta) {
            const self    = this;
            const targets = self.$items;
            const next    = targets[currentIdx + delta];
            if (next) next.$trigger.trigger('focus');
        }

        _focusFirstInContent(index) {
            const self = this;
            const item = self.$items[index];
            if (!item) return;
            const $first = item.$content.find('a, button, [tabindex]').filter(':visible').first();
            if ($first.length) $first.trigger('focus');
        }
    }

    PluginNavmenu.defaults = {
        orientation:       'horizontal',
        openOn:            'hover',
        delay:             200,
        closeDelay:        150,
        animationIn:       'ts-navmenu-in',
        animationOut:      'ts-navmenu-out',
        animationDuration: 200,
        useViewport:       false,
        closeOnEscape:     true,
        closeOnOutside:    true,
        onOpen:            null,
        onClose:           null,
    };

    $.extend(themestrap, { PluginNavmenu });

    $.fn.themestrapPluginNavmenu = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginNavmenu($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
