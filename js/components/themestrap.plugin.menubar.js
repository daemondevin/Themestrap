/**
 * Themestrap Menubar Plugin
 *
 * An accessible menubar with checkbox items, radio groups, nested 
 * submenus, and full keyboard navigation.
 *
 * Part of the Themestrap component library.
 *
 * Markup anatomy:
 *
 *   <div data-plugin-menubar data-plugin-options='{"loop": true}'>
 *
 *     <div data-menubar-menu>
 *       <button data-menubar-trigger>File</button>
 *       <div data-menubar-content>
 *
 *         <!-- Plain item -->
 *         <button data-menubar-item data-menubar-shortcut="⌘N">
 *           <span data-menubar-item-icon><!-- icon --></span>
 *           <span data-menubar-item-label>New Window</span>
 *         </button>
 *
 *         <!-- Separator -->
 *         <hr data-menubar-separator>
 *
 *         <!-- Group label -->
 *         <div data-menubar-label>Options</div>
 *
 *         <!-- Checkbox item -->
 *         <button data-menubar-item data-menubar-type="checkbox" data-menubar-checked="true">
 *           <span data-menubar-indicator></span>
 *           <span data-menubar-item-label>Show Status Bar</span>
 *         </button>
 *
 *         <!-- Radio group -->
 *         <div data-menubar-radio-group>
 *           <button data-menubar-item data-menubar-type="radio"
 *                   data-menubar-value="top" data-menubar-checked="true">
 *             <span data-menubar-indicator></span>
 *             <span data-menubar-item-label>Top</span>
 *           </button>
 *           <button data-menubar-item data-menubar-type="radio" data-menubar-value="bottom">
 *             <span data-menubar-indicator></span>
 *             <span data-menubar-item-label>Bottom</span>
 *           </button>
 *         </div>
 *
 *         <!-- Submenu -->
 *         <div data-menubar-sub>
 *           <button data-menubar-item data-menubar-sub-trigger>
 *             <span data-menubar-item-label>Share</span>
 *           </button>
 *           <div data-menubar-sub-content>
 *             <button data-menubar-item>Copy Link</button>
 *             <button data-menubar-item>Email…</button>
 *           </div>
 *         </div>
 *
 *         <!-- Disabled item -->
 *         <button data-menubar-item data-menubar-disabled="true">Save As…</button>
 *
 *       </div>
 *     </div>
 *
 *   </div>
 *
 * Options:
 *
 *   subDelay          200     ms delay before opening a sub-menu on hover
 *   subCloseDelay     120     ms hover-out delay before closing a sub-menu
 *   animationDuration 150     open/close animation duration (ms)
 *   closeOnOutside    true    outside click closes the open menu
 *   closeOnEscape     true    Escape closes the open menu
 *   loop              true    keyboard navigation wraps at ends
 *   onOpen            null    callback(menuIndex, instance) on open
 *   onClose           null    callback(menuIndex, instance) on close
 *   onSelect          null    callback($item, payload, instance) on activation
 *
 * Public API:
 *
 *   const mb = $('[data-plugin-menubar]').data('__pluginMenubar');
 *   mb.openMenu(index);    // open a top-level menu by 0-based index
 *   mb.closeMenu();        // close the currently open menu
 *   mb.getActiveMenu();    // returns open menu index or -1
 *
 * Events fired on [data-plugin-menubar]:
 *
 *   menubar:open    — detail: { index, instance }
 *   menubar:close   — detail: { index, instance }
 *   menubar:select  — detail: { $item, payload, instance }
 *                     payload: { type, label, value, checked }
 *
 * Init.js wiring:
 *
 *   if ($.isFunction($.fn['themestrapPluginMenubar']) && $('[data-plugin-menubar]').length) {
 *       $(() => {
 *           $('[data-plugin-menubar]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginMenubar(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginMenubar';

    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    const STYLE_ID = 'ts-menubar-styles';
    const CSS_TEXT = `
/* Themestrap Menubar */
[data-plugin-menubar] {
    --ts-mb-fg:               #0f172a;
    --ts-mb-muted:            #64748b;
    --ts-mb-hover-bg:         rgba(0,0,0,.06);
    --ts-mb-active-bg:        rgba(0,0,0,.09);
    --ts-mb-focus-ring:       #e8672a;
    --ts-mb-content-bg:       #ffffff;
    --ts-mb-content-border:   rgba(0,0,0,.08);
    --ts-mb-content-shadow:   0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
    --ts-mb-item-hover-bg:    rgba(0,0,0,.05);
    --ts-mb-separator:        rgba(0,0,0,.08);
    --ts-mb-indicator-color:  #0f172a;
    --ts-mb-radius:           5px;
    --ts-mb-content-radius:   8px;
    --ts-mb-font-size:        .875rem;
    --ts-mb-z:                1050;

    display: inline-flex;
    align-items: stretch;
    gap: 1px;
    position: relative;
}

[data-menubar-menu] {
    position: relative;
    display: flex;
    align-items: stretch;
}

[data-menubar-trigger] {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border: none;
    background: transparent;
    color: var(--ts-mb-fg);
    font-family: inherit;
    font-size: var(--ts-mb-font-size);
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    border-radius: var(--ts-mb-radius);
    user-select: none;
    white-space: nowrap;
    transition: background-color .1s ease;
    outline: none;
}

[data-menubar-trigger]:hover {
    background: var(--ts-mb-hover-bg);
}

[data-menubar-trigger][aria-expanded="true"] {
    background: var(--ts-mb-active-bg);
}

[data-menubar-trigger]:focus-visible {
    outline: 2px solid var(--ts-mb-focus-ring);
    outline-offset: 1px;
}

[data-menubar-content] {
    position: fixed;
    min-width: 200px;
    background: var(--ts-mb-content-bg);
    border: 1px solid var(--ts-mb-content-border);
    border-radius: var(--ts-mb-content-radius);
    box-shadow: var(--ts-mb-content-shadow);
    padding: 4px;
    z-index: var(--ts-mb-z);
    display: none;
    opacity: 0;
    transform: translateY(-6px) scale(.97);
    transform-origin: top left;
    transition: opacity .15s ease, transform .15s cubic-bezier(.16,1,.3,1);
}

[data-menubar-content].ts-mb-content-open {
    display: block;
}

[data-menubar-content].ts-mb-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
}

[data-menubar-item],
[data-menubar-sub-trigger] {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--ts-mb-fg);
    font-family: inherit;
    font-size: var(--ts-mb-font-size);
    font-weight: 400;
    text-align: left;
    cursor: pointer;
    outline: none;
    white-space: nowrap;
    min-height: 32px;
    transition: background-color .08s ease;
    box-sizing: border-box;
}

[data-menubar-item]:not(.ts-mb-disabled):hover,
[data-menubar-item]:not(.ts-mb-disabled):focus,
[data-menubar-sub-trigger]:not(.ts-mb-disabled):hover,
[data-menubar-sub-trigger]:not(.ts-mb-disabled):focus {
    background: var(--ts-mb-item-hover-bg);
    outline: none;
}

[data-menubar-item].ts-mb-disabled,
[data-menubar-sub-trigger].ts-mb-disabled {
    opacity: .4;
    cursor: not-allowed;
    pointer-events: none;
}

[data-menubar-item-icon] {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-mb-muted);
    font-size: 14px;
}

[data-menubar-item-label] {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

[data-menubar-shortcut-text] {
    flex-shrink: 0;
    margin-left: auto;
    padding-left: 20px;
    font-size: .75rem;
    color: var(--ts-mb-muted);
    letter-spacing: .02em;
    font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
}

[data-menubar-indicator] {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--ts-mb-indicator-color);
    opacity: 0;
    transition: opacity .1s ease;
}

[data-menubar-indicator].ts-mb-indicator-on {
    opacity: 1;
}

[data-menubar-separator] {
    display: block;
    height: 1px;
    background: var(--ts-mb-separator);
    margin: 4px 0;
    border: none;
}

[data-menubar-label] {
    padding: 6px 8px 2px;
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--ts-mb-muted);
    pointer-events: none;
    user-select: none;
}

[data-menubar-sub] {
    position: relative;
}

[data-menubar-sub-trigger]::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: auto;
    flex-shrink: 0;
    background-color: var(--ts-mb-muted);
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
}

[data-menubar-sub-content] {
    position: absolute;
    display: none;
    min-width: 180px;
    background: var(--ts-mb-content-bg);
    border: 1px solid var(--ts-mb-content-border);
    border-radius: var(--ts-mb-content-radius);
    box-shadow: var(--ts-mb-content-shadow);
    padding: 4px;
    z-index: calc(var(--ts-mb-z) + 10);
    opacity: 0;
    transform: translateX(-4px) scale(.98);
    transform-origin: left top;
    transition: opacity .13s ease, transform .13s cubic-bezier(.16,1,.3,1);
}

[data-menubar-sub-content].ts-mb-sub-open {
    display: block;
}

[data-menubar-sub-content].ts-mb-sub-visible {
    opacity: 1;
    transform: translateX(0) scale(1);
}

html.dark [data-plugin-menubar],
[data-plugin-menubar].ts-mb-dark {
    --ts-mb-fg:              #f1f5f9;
    --ts-mb-muted:           #94a3b8;
    --ts-mb-hover-bg:        rgba(255,255,255,.07);
    --ts-mb-active-bg:       rgba(255,255,255,.11);
    --ts-mb-content-bg:      #1e293b;
    --ts-mb-content-border:  rgba(255,255,255,.10);
    --ts-mb-content-shadow:  0 4px 24px rgba(0,0,0,.45), 0 1px 4px rgba(0,0,0,.2);
    --ts-mb-item-hover-bg:   rgba(255,255,255,.07);
    --ts-mb-separator:       rgba(255,255,255,.09);
    --ts-mb-indicator-color: #f1f5f9;
}

@media (prefers-reduced-motion: reduce) {
    [data-menubar-content],
    [data-menubar-sub-content] {
        transition: none !important;
        transform: none !important;
    }
}
`;

    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        document.head.appendChild(style);
    }

    class PluginMenubar {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el              = $el;
            this._menus           = [];
            this._activeMenuIndex = -1;
            this._isHot           = false;
            this._nsId            = null;

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
            this.options = $.extend(true, {}, PluginMenubar.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectCSS();

            const self = this;
            const $el  = self.$el;

            $el.attr({ role: 'menubar', 'aria-label': $el.attr('aria-label') || 'Application menu bar' });

            self._menus = $el.children('[data-menubar-menu]').toArray().map((el, idx) => {
                const $menu    = $(el);
                const $trigger = $menu.children('[data-menubar-trigger]').first();
                const $content = $menu.children('[data-menubar-content]').first();

                if (!$trigger.length || !$content.length) return null;

                const triggerId = $trigger.attr('id') || uid('ts-mb-trigger');
                const contentId = $content.attr('id') || uid('ts-mb-content');

                $trigger.attr({
                    id:              triggerId,
                    role:            'menuitem',
                    'aria-haspopup': 'menu',
                    'aria-expanded': 'false',
                    'aria-controls': contentId,
                    tabindex:        idx === 0 ? '0' : '-1',
                });

                $content.attr({
                    id:               contentId,
                    role:             'menu',
                    'aria-labelledby': triggerId,
                });

                self._prepareContent($content);

                return { $menu, $trigger, $content, index: idx };
            }).filter(Boolean);

            return this;
        }

        _prepareContent($content) {
            const self = this;

            $content.find('[data-menubar-separator]').attr('role', 'separator');
            $content.find('[data-menubar-label]').attr({ role: 'presentation', 'aria-hidden': 'true' });
            $content.find('[data-menubar-radio-group]').attr('role', 'group');

            $content.find('[data-menubar-item], [data-menubar-sub-trigger]').each(function() {
                const $item  = $(this);
                const isSub  = $item.is('[data-menubar-sub-trigger]');
                const type   = $item.attr('data-menubar-type') || 'item';
                const itemId = $item.attr('id') || uid('ts-mb-item');

                $item.attr({
                    id:       itemId,
                    tabindex: '-1',
                    role:     isSub ? 'menuitem' :
                              type === 'checkbox' ? 'menuitemcheckbox' :
                              type === 'radio'    ? 'menuitemradio'    : 'menuitem',
                });

                if (isSub) {
                    $item.attr({ 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
                }

                if (type === 'checkbox' || type === 'radio') {
                    const checked = $item.attr('data-menubar-checked') === 'true';
                    $item.attr('aria-checked', checked ? 'true' : 'false');
                    $item.find('[data-menubar-indicator]').toggleClass('ts-mb-indicator-on', checked);
                }

                const shortcut = $item.attr('data-menubar-shortcut');
                if (shortcut && !$item.find('[data-menubar-shortcut-text]').length) {
                    $item.append($('<span data-menubar-shortcut-text></span>').text(shortcut));
                }

                if ($item.attr('data-menubar-disabled') === 'true') {
                    $item.addClass('ts-mb-disabled').attr('aria-disabled', 'true');
                }
            });

            $content.find('[data-menubar-sub]').each(function() {
                const $sub        = $(this);
                const $subTrigger = $sub.children('[data-menubar-sub-trigger]').first();
                const $subContent = $sub.children('[data-menubar-sub-content]').first();

                if (!$subTrigger.length || !$subContent.length) return;

                const subContentId = $subContent.attr('id') || uid('ts-mb-sub-content');
                $subContent.attr({ id: subContentId, role: 'menu' });
                $subTrigger.attr({ 'aria-controls': subContentId });

                $subContent.find('[data-menubar-item]').each(function() {
                    const $it = $(this);
                    if (!$it.attr('id')) $it.attr('id', uid('ts-mb-sub-item'));
                    $it.attr({ role: 'menuitem', tabindex: '-1' });
                    if ($it.attr('data-menubar-disabled') === 'true') {
                        $it.addClass('ts-mb-disabled').attr('aria-disabled', 'true');
                    }
                    const sc = $it.attr('data-menubar-shortcut');
                    if (sc && !$it.find('[data-menubar-shortcut-text]').length) {
                        $it.append($('<span data-menubar-shortcut-text></span>').text(sc));
                    }
                });

                self._bindSubmenu($subTrigger, $subContent, $sub);
            });
        }

        _bindSubmenu($trigger, $content, $sub) {
            const self = this;
            let openTimer, closeTimer;

            const openSub = () => {
                clearTimeout(closeTimer);

                $trigger.closest('[data-menubar-content], [data-menubar-sub-content]')
                    .find('[data-menubar-sub-trigger][aria-expanded="true"]')
                    .not($trigger)
                    .each(function() {
                        const $t = $(this);
                        $t.attr('aria-expanded', 'false');
                        $('#' + $t.attr('aria-controls'))
                            .removeClass('ts-mb-sub-open ts-mb-sub-visible');
                    });

                $trigger.attr('aria-expanded', 'true');

                const trPos = $trigger.position();
                const parentRect = $sub[0].getBoundingClientRect();
                let left  = trPos.left + $trigger.outerWidth() + 4;
                let top   = trPos.top;

                $content.css({ left, top }).addClass('ts-mb-sub-open');

                requestAnimationFrame(() => {
                    const cW = $content.outerWidth();
                    const cH = $content.outerHeight();

                    if (parentRect.left + left + cW > window.innerWidth - 8)  left = trPos.left - cW - 4;
                    if (parentRect.top  + top + cH > window.innerHeight - 8) top  = Math.max(0, window.innerHeight - cH - 8 - parentRect.top);

                    $content.css({ left, top });
                    requestAnimationFrame(() => $content.addClass('ts-mb-sub-visible'));
                });
            };

            const closeSub = (immediate) => {
                clearTimeout(openTimer);
                const doClose = () => {
                    $trigger.attr('aria-expanded', 'false');
                    $content.removeClass('ts-mb-sub-open ts-mb-sub-visible');
                };
                if (immediate) { doClose(); return; }
                closeTimer = setTimeout(doClose, self.options.subCloseDelay);
            };

            $trigger
                .on('mouseenter.menubar', () => {
                    clearTimeout(closeTimer);
                    openTimer = setTimeout(openSub, self.options.subDelay);
                })
                .on('mouseleave.menubar', () => {
                    clearTimeout(openTimer);
                    closeSub();
                })
                .on('click.menubar', (e) => {
                    e.stopPropagation();
                    openSub();
                    setTimeout(() => {
                        $content.find('[data-menubar-item]:not(.ts-mb-disabled)').first().trigger('focus');
                    }, 20);
                })
                .on('keydown.menubar', (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openSub();
                        setTimeout(() => {
                            $content.find('[data-menubar-item]:not(.ts-mb-disabled)').first().trigger('focus');
                        }, 20);
                    }
                });

            $content
                .on('mouseenter.menubar', () => clearTimeout(closeTimer))
                .on('mouseleave.menubar', () => closeSub())
                .on('keydown.menubar', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'Escape') {
                        e.preventDefault();
                        closeSub(true);
                        $trigger.trigger('focus');
                    }
                    if (e.key === 'ArrowDown') { e.preventDefault(); self._focusNextIn($content, 1); }
                    if (e.key === 'ArrowUp')   { e.preventDefault(); self._focusNextIn($content, -1); }
                    if (e.key === 'Enter' || e.key === ' ') {
                        const $f = $content.find('[data-menubar-item]:focus');
                        if ($f.length && !$f.hasClass('ts-mb-disabled')) {
                            e.preventDefault();
                            self._activateItem($f);
                            closeSub(true);
                        }
                    }
                    if (e.key === 'Home') { e.preventDefault(); $content.find('[data-menubar-item]:not(.ts-mb-disabled)').first().trigger('focus'); }
                    if (e.key === 'End')  { e.preventDefault(); $content.find('[data-menubar-item]:not(.ts-mb-disabled)').last().trigger('focus'); }
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        self._typeahead($content, e.key);
                    }
                })
                .on('click.menubar', '[data-menubar-item]', function(e) {
                    const $it = $(this);
                    if ($it.hasClass('ts-mb-disabled')) return;
                    self._activateItem($it);
                    closeSub(true);
                });

            $sub.data('ts-mb-close-sub', () => closeSub(true));
        }

        events() {
            const self  = this;
            const o     = self.options;
            const nsId  = self.$el.attr('id') || uid('mb');
            self._nsId  = nsId;

            self._menus.forEach((menu, idx) => {
                menu.$trigger
                    .on('click.menubar', (e) => {
                        e.stopPropagation();
                        self._activeMenuIndex === idx ? self.closeMenu() : self.openMenu(idx);
                    })
                    .on('mouseenter.menubar', () => {
                        if (self._isHot && self._activeMenuIndex !== idx) self.openMenu(idx);
                    })
                    .on('keydown.menubar', (e) => self._onTriggerKey(e, idx));

                menu.$content
                    .on('keydown.menubar', (e) => self._onContentKey(e, idx))
                    .on('mouseenter.menubar', '[data-menubar-item]', function() {
                        if (!$(this).is('[data-menubar-sub-trigger]')) $(this).trigger('focus');
                    })
                    .on('click.menubar', '[data-menubar-item]:not([data-menubar-sub-trigger])', function(e) {
                        const $it = $(this);
                        if ($it.hasClass('ts-mb-disabled')) return;
                        const type = $it.attr('data-menubar-type') || 'item';
                        self._activateItem($it);
                        if (type === 'item') self.closeMenu();
                    });
            });

            if (o.closeOnOutside) {
                $(document).on('click.menubar-' + nsId, (e) => {
                    if (self._activeMenuIndex === -1) return;
                    if ($(e.target).closest(self.$el).length) return;
                    if ($(e.target).closest('[data-menubar-content], [data-menubar-sub-content]').length) return;
                    self.closeMenu();
                });
            }

            if (o.closeOnEscape) {
                $(document).on('keydown.menubar-' + nsId, (e) => {
                    if (e.key !== 'Escape' || self._activeMenuIndex === -1) return;
                    const prevIdx = self._activeMenuIndex;
                    self.closeMenu();
                    if (self._menus[prevIdx]) self._menus[prevIdx].$trigger.trigger('focus');
                });
            }

            return this;
        }

        _onTriggerKey(e, idx) {
            const self   = this;
            const o      = self.options;
            const len    = self._menus.length;

            const moveRight = () => o.loop ? (idx + 1) % len : Math.min(idx + 1, len - 1);
            const moveLeft  = () => o.loop ? (idx - 1 + len) % len : Math.max(idx - 1, 0);

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    self._isHot ? self.openMenu(moveRight()) : self._focusTrigger(moveRight());
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    self._isHot ? self.openMenu(moveLeft()) : self._focusTrigger(moveLeft());
                    break;
                case 'ArrowDown':
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    self.openMenu(idx);
                    setTimeout(() => self._focusFirstItem(idx), 20);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    self.openMenu(idx);
                    setTimeout(() => self._focusLastItem(idx), 20);
                    break;
                case 'Home':
                    e.preventDefault();
                    self._focusTrigger(0);
                    break;
                case 'End':
                    e.preventDefault();
                    self._focusTrigger(len - 1);
                    break;
                case 'Tab':
                    self.closeMenu();
                    break;
            }
        }

        _onContentKey(e, menuIdx) {
            const self = this;
            const o    = self.options;
            const len  = self._menus.length;
            const menu = self._menus[menuIdx];

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    self._focusNextIn(menu.$content, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    self._focusNextIn(menu.$content, -1);
                    break;
                case 'ArrowRight': {
                    const $f = menu.$content.find('[data-menubar-item]:focus, [data-menubar-sub-trigger]:focus');
                    if ($f.is('[data-menubar-sub-trigger]')) return;
                    e.preventDefault();
                    const next = o.loop ? (menuIdx + 1) % len : Math.min(menuIdx + 1, len - 1);
                    self.openMenu(next);
                    setTimeout(() => self._focusFirstItem(next), 20);
                    break;
                }
                case 'ArrowLeft': {
                    const $f = menu.$content.find('[data-menubar-item]:focus, [data-menubar-sub-trigger]:focus');
                    if ($f.is('[data-menubar-sub-trigger]')) return;
                    e.preventDefault();
                    const prev = o.loop ? (menuIdx - 1 + len) % len : Math.max(menuIdx - 1, 0);
                    self.openMenu(prev);
                    setTimeout(() => self._focusFirstItem(prev), 20);
                    break;
                }
                case 'Home':
                    e.preventDefault();
                    self._focusFirstItem(menuIdx);
                    break;
                case 'End':
                    e.preventDefault();
                    self._focusLastItem(menuIdx);
                    break;
                case 'Tab':
                    self.closeMenu();
                    break;
                default:
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        self._typeahead(menu.$content, e.key);
                    }
                    break;
            }
        }

        _focusNextIn($container, delta) {
            const $items   = $container.find('[data-menubar-item]:not(.ts-mb-disabled), [data-menubar-sub-trigger]:not(.ts-mb-disabled)').filter(':visible');
            const $focused = $container.find('[data-menubar-item]:focus, [data-menubar-sub-trigger]:focus');
            let idx = $items.index($focused) + delta;

            if (idx < 0)             idx = $items.length - 1;
            if (idx >= $items.length) idx = 0;

            $items.eq(idx).trigger('focus');
        }

        _typeahead($container, char) {
            const $items = $container.find('[data-menubar-item]:not(.ts-mb-disabled), [data-menubar-sub-trigger]:not(.ts-mb-disabled)').filter(':visible');
            const $focused = $container.find('[data-menubar-item]:focus, [data-menubar-sub-trigger]:focus');
            const lc = char.toLowerCase();
            let curIdx = $items.index($focused);
            let found = -1;

            for (let i = curIdx + 1; i < $items.length; i++) {
                if ($items.eq(i).text().trim().toLowerCase().startsWith(lc)) { found = i; break; }
            }
            if (found === -1) {
                for (let i = 0; i <= curIdx; i++) {
                    if ($items.eq(i).text().trim().toLowerCase().startsWith(lc)) { found = i; break; }
                }
            }
            if (found >= 0) $items.eq(found).trigger('focus');
        }

        _activateItem($item) {
            const self  = this;
            const o     = self.options;
            const type  = $item.attr('data-menubar-type') || 'item';

            if (type === 'checkbox') {
                const checked = $item.attr('aria-checked') === 'true';
                $item.attr('aria-checked', (!checked).toString());
                $item.attr('data-menubar-checked', (!checked).toString());
                $item.find('[data-menubar-indicator]').toggleClass('ts-mb-indicator-on', !checked);
            }

            if (type === 'radio') {
                $item.closest('[data-menubar-radio-group]')
                    .find('[data-menubar-type="radio"]')
                    .each(function() {
                        $(this).attr({ 'aria-checked': 'false', 'data-menubar-checked': 'false' });
                        $(this).find('[data-menubar-indicator]').removeClass('ts-mb-indicator-on');
                    });
                $item.attr({ 'aria-checked': 'true', 'data-menubar-checked': 'true' });
                $item.find('[data-menubar-indicator]').addClass('ts-mb-indicator-on');
            }

            const payload = {
                type,
                label:   ($item.find('[data-menubar-item-label]').text() || $item.text()).trim(),
                value:   $item.attr('data-menubar-value')   || null,
                checked: $item.attr('aria-checked')         || null,
            };

            self.$el[0].dispatchEvent(new CustomEvent('menubar:select', {
                bubbles: true,
                detail: { $item, payload, instance: self }
            }));

            if (typeof o.onSelect === 'function') o.onSelect.call(self.$el[0], $item, payload, self);
        }

        openMenu(index) {
            const self = this;
            const o    = self.options;
            const menu = self._menus[index];
            if (!menu) return this;

            if (self._activeMenuIndex > -1 && self._activeMenuIndex !== index) {
                self._closePanel(self._menus[self._activeMenuIndex], false);
            }

            self._activeMenuIndex = index;
            self._isHot           = true;

            self._menus.forEach((m, i) => m.$trigger.attr('tabindex', i === index ? '0' : '-1'));
            menu.$trigger.attr('aria-expanded', 'true');

            /* Position the panel just below the trigger */
            const tr       = menu.$trigger[0].getBoundingClientRect();
            let   top      = tr.bottom + 4;
            let   left     = tr.left;

            menu.$content.css({ top, left }).addClass('ts-mb-content-open');

            requestAnimationFrame(() => {
                const cW = menu.$content.outerWidth();
                if (left + cW > window.innerWidth - 8) {
                    menu.$content.css('left', Math.max(8, tr.right - cW));
                }
                requestAnimationFrame(() => menu.$content.addClass('ts-mb-visible'));
            });

            self.$el[0].dispatchEvent(new CustomEvent('menubar:open', {
                bubbles: true,
                detail: { index, instance: self }
            }));

            if (typeof o.onOpen === 'function') o.onOpen.call(self.$el[0], index, self);

            return this;
        }

        closeMenu() {
            const self = this;
            if (self._activeMenuIndex === -1) return this;

            const menu = self._menus[self._activeMenuIndex];
            self._activeMenuIndex = -1;
            self._isHot           = false;

            if (menu) self._closePanel(menu, true);

            return this;
        }

        _closePanel(menu, animate) {
            const self = this;
            const o    = self.options;

            menu.$trigger.attr('aria-expanded', 'false');

            menu.$content.find('[data-menubar-sub]').each(function() {
                const fn = $(this).data('ts-mb-close-sub');
                if (typeof fn === 'function') fn();
            });

            const done = () => {
                menu.$content.removeClass('ts-mb-content-open ts-mb-visible');

                self.$el[0].dispatchEvent(new CustomEvent('menubar:close', {
                    bubbles: true,
                    detail: { index: menu.index, instance: self }
                }));

                if (typeof o.onClose === 'function') o.onClose.call(self.$el[0], menu.index, self);
            };

            if (animate && o.animationDuration) {
                menu.$content.removeClass('ts-mb-visible');
                setTimeout(done, o.animationDuration);
            } else {
                done();
            }
        }

        _focusTrigger(idx) {
            const menu = this._menus[idx];
            if (!menu) return;
            this._menus.forEach((m, i) => m.$trigger.attr('tabindex', i === idx ? '0' : '-1'));
            menu.$trigger.trigger('focus');
        }

        _focusFirstItem(idx) {
            const menu = this._menus[idx];
            if (!menu) return;
            menu.$content.find('[data-menubar-item]:not(.ts-mb-disabled), [data-menubar-sub-trigger]:not(.ts-mb-disabled)').first().trigger('focus');
        }

        _focusLastItem(idx) {
            const menu = this._menus[idx];
            if (!menu) return;
            menu.$content.find('[data-menubar-item]:not(.ts-mb-disabled), [data-menubar-sub-trigger]:not(.ts-mb-disabled)').last().trigger('focus');
        }

        getActiveMenu() {
            return this._activeMenuIndex;
        }

        destroy() {
            const self = this;

            self.closeMenu();

            self._menus.forEach(menu => {
                menu.$trigger.removeAttr('role aria-haspopup aria-expanded aria-controls tabindex').off('.menubar');
                menu.$content.removeAttr('role aria-labelledby').removeClass('ts-mb-content-open ts-mb-visible').off('.menubar');

                menu.$content.find('[data-menubar-sub]').each(function() {
                    const fn = $(this).data('ts-mb-close-sub');
                    if (typeof fn === 'function') fn();
                    $(this).removeData('ts-mb-close-sub');
                });

                menu.$content.find('[data-menubar-item], [data-menubar-sub-trigger]')
                    .removeAttr('id role tabindex aria-checked aria-disabled aria-haspopup aria-expanded aria-controls')
                    .removeClass('ts-mb-disabled')
                    .off('.menubar');

                menu.$content.find('[data-menubar-shortcut-text]').remove();
            });

            self.$el.removeAttr('role aria-label').off('.menubar');

            $(document)
                .off('click.menubar-' + self._nsId)
                .off('keydown.menubar-' + self._nsId);

            self.$el.removeData(instanceName);
            return this;
        }
    }

    PluginMenubar.defaults = {
        subDelay:          200,
        subCloseDelay:     120,
        animationDuration: 150,
        closeOnOutside:    true,
        closeOnEscape:     true,
        loop:              true,
        onOpen:            null,
        onClose:           null,
        onSelect:          null,
    };

    $.extend(themestrap, { PluginMenubar });

    $.fn.themestrapPluginMenubar = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) return $this.data(instanceName);
            return new PluginMenubar($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
