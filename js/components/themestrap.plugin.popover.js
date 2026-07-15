/**
 * Themestrap Popover Plugin
 * Accessible, anchor-positioned popovers.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * Markup anatomy
 *
 *   <!-- Wrapper (the plugin root — positions anchor + popover together) -->
 *   <div data-plugin-popover
 *        data-plugin-options='{"side": "bottom", "align": "start"}'>
 *
 *     <!-- Trigger: the button / link that opens the popover -->
 *     <button data-popover-trigger>Open</button>
 *
 *     <!-- Content panel: shown/hidden by the plugin -->
 *     <div data-popover-content>
 *       <h4 data-popover-title>Popover heading</h4>
 *       <p>Your popover content goes here.</p>
 *     </div>
 *   </div>
 *
 * Alternatively: trigger and content in separate DOM positions
 *
 *   <button data-popover-trigger="settings-pop">Settings</button>
 *
 *   <div data-plugin-popover id="settings-pop"
 *        data-plugin-options='{"side":"right"}'>
 *     <div data-popover-content>…</div>
 *   </div>
 *
 * Options (data-plugin-options JSON or JS object)
 *
 *   side              "top"|"bottom"|"left"|"right"   where the popover appears
 *   align             "start"|"center"|"end"          alignment along the side axis
 *   offset            8                               gap between trigger and popover (px)
 *   arrow             true                            show a pointing arrow
 *   portaling         false                           append content to <body> to escape
 *                                                     overflow:hidden / stacking contexts
 *   closeOnEscape     true                            Escape key closes
 *   closeOnOutside    true                            click outside closes
 *   animationIn       "ts-pop-in"                     CSS animation class on open
 *   animationOut      "ts-pop-out"                    CSS animation class on close
 *   animationDuration 200                             ms fallback if animationend stalls
 *   modal             false                           trap focus inside content
 *   onOpen            null                            callback(instance)
 *   onClose           null                            callback(instance)
 *
 * Public API
 *
 *   const pop = $('#my-popover').data('__pluginPopover');
 *   pop.open();
 *   pop.close();
 *   pop.toggle();
 *   pop.update();   // reposition without closing
 *
 * Events fired on [data-plugin-popover]
 *
 *   popover:open   — after open animation begins   (detail: instance)
 *   popover:close  — after close animation ends    (detail: instance)
 *
 * Init.js wiring
 *
 *   if ($.isFunction($.fn['themestrapPluginPopover']) && $('[data-plugin-popover]').length) {
 *       $(() => {
 *           $('[data-plugin-popover]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginPopover(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginPopover';

    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    const FOCUSABLE = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ].join(', ');

    const STYLE_ID = 'ts-popover-styles';

    const CSS_TEXT = `
/* Themestrap Popover */

/* Wrapper: gives the trigger a positioning context */
[data-plugin-popover] {
    position: relative;
    display: inline-block;
}

/* The content panel */
[data-popover-content] {
    position: absolute;
    z-index: 9995;
    min-width: 14rem;
    max-width: 22rem;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 0.5rem;
    box-shadow:
        0 4px  6px -1px rgba(0, 0, 0, 0.07),
        0 10px 15px -3px rgba(0, 0, 0, 0.10);
    padding: 1rem;
    line-height: 1.5;
    color: #1a1a2e;

    /* Hidden by default */
    display: none;
    pointer-events: none;
}

[data-popover-content].ts-pop-visible {
    display: block;
    pointer-events: auto;
}

[data-popover-title] {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0 0 0.375rem;
    line-height: 1.3;
}

/* Arrow */

[data-popover-content]::before,
[data-popover-content]::after {
    content: '';
    display: none;
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    pointer-events: none;
}

[data-popover-content].ts-pop-arrow::before,
[data-popover-content].ts-pop-arrow::after {
    display: block;
}

/* Bottom arrow (popover is above trigger) */
[data-popover-content].ts-pop-side-top::after  { top: 100%; border-top-color: #fff; }
[data-popover-content].ts-pop-side-top::before { top: calc(100% + 1px); border-top-color: rgba(0,0,0,0.08); }

/* Top arrow (popover is below trigger) */
[data-popover-content].ts-pop-side-bottom::after  { bottom: 100%; border-bottom-color: #fff; }
[data-popover-content].ts-pop-side-bottom::before { bottom: calc(100% + 1px); border-bottom-color: rgba(0,0,0,0.08); }

/* Right arrow (popover is left of trigger) */
[data-popover-content].ts-pop-side-left::after  { left: 100%; border-left-color: #fff; }
[data-popover-content].ts-pop-side-left::before { left: calc(100% + 1px); border-left-color: rgba(0,0,0,0.08); }

/* Left arrow (popover is right of trigger) */
[data-popover-content].ts-pop-side-right::after  { right: 100%; border-right-color: #fff; }
[data-popover-content].ts-pop-side-right::before { right: calc(100% + 1px); border-right-color: rgba(0,0,0,0.08); }

/* Animations */
@keyframes tsPopIn {
    from { opacity: 0; transform: scale(0.96) translateY(-4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes tsPopOut {
    from { opacity: 1; transform: scale(1)    translateY(0); }
    to   { opacity: 0; transform: scale(0.96) translateY(-4px); }
}

[data-popover-content].ts-pop-in  { animation: tsPopIn  0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-popover-content].ts-pop-out { animation: tsPopOut 0.12s ease-in                        forwards; }

/* Side-aware: popover below trigger slides down */
[data-popover-content].ts-pop-side-bottom.ts-pop-in  { animation-name: tsPopInDown; }
[data-popover-content].ts-pop-side-bottom.ts-pop-out { animation-name: tsPopOutDown; }

@keyframes tsPopInDown {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes tsPopOutDown {
    from { opacity: 1; transform: scale(1)    translateY(0); }
    to   { opacity: 0; transform: scale(0.96) translateY(4px); }
}

/* Left / Right sides */
@keyframes tsPopInLeft {
    from { opacity: 0; transform: scale(0.96) translateX(-4px); }
    to   { opacity: 1; transform: scale(1)    translateX(0); }
}
@keyframes tsPopOutLeft {
    from { opacity: 1; transform: scale(1)    translateX(0); }
    to   { opacity: 0; transform: scale(0.96) translateX(-4px); }
}

[data-popover-content].ts-pop-side-left.ts-pop-in  { animation-name: tsPopInLeft; }
[data-popover-content].ts-pop-side-left.ts-pop-out { animation-name: tsPopOutLeft; }

@keyframes tsPopInRight {
    from { opacity: 0; transform: scale(0.96) translateX(4px); }
    to   { opacity: 1; transform: scale(1)    translateX(0); }
}
@keyframes tsPopOutRight {
    from { opacity: 1; transform: scale(1)    translateX(0); }
    to   { opacity: 0; transform: scale(0.96) translateX(4px); }
}

[data-popover-content].ts-pop-side-right.ts-pop-in  { animation-name: tsPopInRight; }
[data-popover-content].ts-pop-side-right.ts-pop-out { animation-name: tsPopOutRight; }

/* Dark mode — uses Porto/Themestrap CSS custom properties set by html.dark */
html.dark [data-popover-content] {
    background: var(--dark-300);
    color: var(--default);
    border-color: var(--dark-rgba-50);
    box-shadow:
        0 4px  6px -1px rgba(0, 0, 0, 0.3),
        0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

html.dark [data-popover-content].ts-pop-side-top::after    { border-top-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-top::before   { border-top-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-bottom::after  { border-bottom-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-bottom::before { border-bottom-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-left::after   { border-left-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-left::before  { border-left-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-right::after  { border-right-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-right::before { border-right-color: var(--dark-rgba-50); }
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id          = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    /**
     * Relative positioning math (default, portaling: false)
     * Computes CSS `top` and `left` relative to [data-plugin-popover] wrapper.
     */
    function computePosition($trigger, $content, side, align, offset) {
        const tw = $trigger.outerWidth();
        const th = $trigger.outerHeight();
        const cw = $content.outerWidth();
        const ch = $content.outerHeight();

        let top = 0;
        let left = 0;

        switch (side) {
            case 'top':    top  = -(ch + offset); left = 0;          break;
            case 'bottom': top  = th + offset;    left = 0;          break;
            case 'left':   top  = 0;              left = -(cw + offset); break;
            case 'right':  top  = 0;              left = tw + offset; break;
        }

        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':  left = 0;             break;
                case 'center': left = (tw - cw) / 2; break;
                case 'end':    left = tw - cw;       break;
            }
        } else {
            switch (align) {
                case 'start':  top = 0;              break;
                case 'center': top = (th - ch) / 2;  break;
                case 'end':    top = th - ch;        break;
            }
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            const triggerCentreInContent = (tw / 2) - left;
            arrowOffset = Math.max(10, Math.min(cw - 10, triggerCentreInContent)) - 6;
        } else {
            const triggerCentreInContent = (th / 2) - top;
            arrowOffset = Math.max(10, Math.min(ch - 10, triggerCentreInContent)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /**
     * Portaled positioning math (portaling: true)
     * Computes absolute page coordinates so the content can escape
     * overflow:hidden ancestors and complex stacking contexts.
     */
    function computePortaledPosition($trigger, $content, side, align, offset) {
        const rect      = $trigger[0].getBoundingClientRect();
        const scrollTop = window.scrollY  || document.documentElement.scrollTop;
        const scrollLeft= window.scrollX  || document.documentElement.scrollLeft;

        const tTop  = rect.top  + scrollTop;
        const tLeft = rect.left + scrollLeft;
        const tw    = rect.width;
        const th    = rect.height;
        const cw    = $content.outerWidth();
        const ch    = $content.outerHeight();

        let top = 0;
        let left = 0;

        switch (side) {
            case 'top':    top  = tTop - ch - offset; left = tLeft;          break;
            case 'bottom': top  = tTop + th + offset; left = tLeft;          break;
            case 'left':   top  = tTop;               left = tLeft - cw - offset; break;
            case 'right':  top  = tTop;               left = tLeft + tw + offset; break;
        }

        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':  /* left = tLeft already set */ break;
                case 'center': left = tLeft + (tw / 2) - (cw / 2); break;
                case 'end':    left = tLeft + tw - cw; break;
            }
        } else {
            switch (align) {
                case 'start':  /* top = tTop already set */ break;
                case 'center': top = tTop + (th / 2) - (ch / 2); break;
                case 'end':    top = tTop + th - ch; break;
            }
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            const triggerCentreInContent = (tLeft + (tw / 2)) - left;
            arrowOffset = Math.max(10, Math.min(cw - 10, triggerCentreInContent)) - 6;
        } else {
            const triggerCentreInContent = (tTop + (th / 2)) - top;
            arrowOffset = Math.max(10, Math.min(ch - 10, triggerCentreInContent)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /**
     * Flip logic: return the actual side to use after checking viewport space.
     */
    function resolvedSide($trigger, side, offset) {
        const rect = $trigger[0].getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        switch (side) {
            case 'top':    return rect.top    < (200 + offset)      ? 'bottom' : side;
            case 'bottom': return rect.bottom > (vh - 200 - offset) ? 'top'    : side;
            case 'left':   return rect.left   < (200 + offset)      ? 'right'  : side;
            case 'right':  return rect.right  > (vw - 200 - offset) ? 'left'   : side;
            default:       return side;
        }
    }

    class PluginPopover {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el         = $el;
            this.isOpen      = false;
            this._uid        = uid('popover');
            this._activeSide = null;

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
            this.options = $.extend(true, {}, PluginPopover.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            injectStyles();

            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // Case A: trigger is *inside* [data-plugin-popover]
            self.$trigger = $el.find('[data-popover-trigger]').first();

            // Case B: trigger is elsewhere in the DOM, pointing to this popover by id
            if (!self.$trigger.length) {
                const popId = $el.attr('id');
                if (popId) {
                    self.$trigger = $(`[data-popover-trigger="${popId}"]`).first();
                }
            }

            self.$content = $el.find('[data-popover-content]').first();

            if (!self.$content.length) {
                console.warn('[PluginPopover] No [data-popover-content] found inside', $el[0]);
                return this;
            }

            // Track original DOM parent so destroy() can move portal content back
            self.$contentOriginalParent = self.$content.parent();

            const contentId = self.$content.attr('id') || uid('pop-content');
            self.$content.attr('id', contentId);
            self.$content.attr('role', 'dialog');
            self.$content.attr('aria-modal', opts.modal ? 'true' : 'false');

            const $title = self.$content.find('[data-popover-title]').first();
            if ($title.length) {
                const titleId = $title.attr('id') || uid('pop-title');
                $title.attr('id', titleId);
                self.$content.attr('aria-labelledby', titleId);
            }

            if (self.$trigger.length) {
                self.$trigger.attr('aria-haspopup', 'dialog');
                self.$trigger.attr('aria-expanded', 'false');
                self.$trigger.attr('aria-controls', contentId);
            }

            if (opts.arrow) {
                self.$content.addClass('ts-pop-arrow');
            }

            if (opts.portaling) {
                // Move content to <body> so it escapes overflow:hidden stacking contexts.
                // destroy() moves it back to $contentOriginalParent.
                self.$content.appendTo(document.body);
            }

            return this;
        }

        events() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // Stop clicks inside the popover content from bubbling to the
            // document closeOnOutside handler.
            self.$content.on(`click.popover.${self._uid}`, function (e) {
                e.stopPropagation();
            });

            // Trigger: toggle on click
            if (self.$trigger && self.$trigger.length) {
                self.$trigger.on(`click.popover.${self._uid}`, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.toggle();
                });
            }

            // Escape key
            if (opts.closeOnEscape) {
                $(document).on(`keydown.popover.${self._uid}`, function (e) {
                    if (self.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                        e.preventDefault();
                        self.close();
                        if (self.$trigger && self.$trigger.length) {
                            self.$trigger.trigger('focus');
                        }
                    }
                });
            }

            // Click outside to close
            if (opts.closeOnOutside) {
                $(document).on(`click.popover.${self._uid}`, function (e) {
                    if (!self.isOpen) return;

                    const $target   = $(e.target);
                    const inContent = $target.closest(self.$content).length > 0;
                    const inTrigger = self.$trigger && self.$trigger.length
                        ? $target.closest(self.$trigger).length > 0
                        : false;
                    const inRoot    = $target.closest($el).length > 0;

                    if (!inContent && !inTrigger && !inRoot) {
                        self.close();
                    }
                });
            }

            // Mutual exclusion: close this popover when any other one opens.
            // FIX: use 'ts-popover-opened' (no colon in event name) so jQuery's
            // namespace separator '.' works correctly in both on() and off().
            $(document).on(`ts-popover-opened.popover.${self._uid}`, function (e, openedUid) {
                if (self.isOpen && self._uid !== openedUid) {
                    self.close();
                }
            });

            // Focus trap (modal: true)
            if (opts.modal) {
                self.$content.on(`keydown.popover.${self._uid}`, function (e) {
                    if (!self.isOpen || (e.key !== 'Tab' && e.keyCode !== 9)) return;
                    self._trapFocus(e);
                });
            }

            // Reposition on scroll/resize
            $(window).on(`resize.popover.${self._uid} scroll.popover.${self._uid}`, function () {
                if (self.isOpen) self._position();
            });

            return this;
        }

        open() {
            const self = this;
            const opts = self.options;

            if (self.isOpen) return this;
            self.isOpen = true;

            // Broadcast so other popovers can close themselves.
            // FIX: matches the renamed event in events().
            $(document).trigger('ts-popover-opened', [self._uid]);

            self.$content
                .removeClass(opts.animationOut)
                .addClass('ts-pop-visible');

            self._position();

            self.$content
                .removeClass(opts.animationOut)
                .addClass(opts.animationIn)
                .one('animationend webkitAnimationEnd', function () {
                    self.$content.removeClass(opts.animationIn);
                });

            setTimeout(() => {
                if (self.isOpen) self.$content.removeClass(opts.animationIn);
            }, opts.animationDuration + 30);

            if (self.$trigger && self.$trigger.length) {
                self.$trigger.attr('aria-expanded', 'true');
            }

            setTimeout(() => {
                const $focusable = self.$content.find(FOCUSABLE).filter(':visible').first();
                if ($focusable.length) {
                    $focusable.trigger('focus');
                } else {
                    self.$content.attr('tabindex', '-1').trigger('focus');
                }
            }, 30);

            if (typeof opts.onOpen === 'function') opts.onOpen.call(self);
            self.$el.trigger('popover:open', [self]);

            return this;
        }

        close() {
            const self = this;
            const opts = self.options;

            if (!self.isOpen) return this;

            // Mark closed immediately so re-entrant calls and the mutual-exclusion
            // handler do not re-close an already-closing popover.
            self.isOpen = false;

            if (self.$trigger && self.$trigger.length) {
                self.$trigger.attr('aria-expanded', 'false');
            }

            self.$content
                .removeClass(opts.animationIn)
                .addClass(opts.animationOut)
                .one('animationend webkitAnimationEnd', function () {
                    self._finishClose();
                });

            // Safety fallback if animationend never fires
            setTimeout(() => {
                if (!self.isOpen) self._finishClose();
            }, opts.animationDuration + 30);

            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        update() {
            if (this.isOpen) this._position();
            return this;
        }

        _finishClose() {
            const self = this;
            const opts = self.options;

            // Guard: if quickly re-opened during the animation, do not hide.
            if (self.isOpen) return;

            self.$content
                .removeClass(`ts-pop-visible ${opts.animationOut}`)
                .css({ top: '', left: '' })
                .removeClass(
                    'ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right'
                );

            if (typeof opts.onClose === 'function') opts.onClose.call(self);
            self.$el.trigger('popover:close', [self]);
        }

        _position() {
            const self = this;
            const opts = self.options;

            if (!self.$trigger || !self.$trigger.length) return;

            const side = resolvedSide(self.$trigger, opts.side, opts.offset);
            self._activeSide = side;

            const compute = opts.portaling ? computePortaledPosition : computePosition;
            const { top, left, arrowOffset } = compute(
                self.$trigger,
                self.$content,
                side,
                opts.align,
                opts.offset
            );

            self.$content
                .removeClass('ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right')
                .addClass(`ts-pop-side-${side}`)
                .css({ top, left });

            if (opts.arrow && arrowOffset !== null) {
                const prop = (side === 'top' || side === 'bottom')
                    ? '--ts-pop-arrow-x'
                    : '--ts-pop-arrow-y';
                self.$content[0].style.setProperty(prop, arrowOffset + 'px');

                self.$content.find('style.ts-pop-arrow-style').remove();
                const arrowStyle  = document.createElement('style');
                arrowStyle.className = 'ts-pop-arrow-style';
                const arrowProp   = (side === 'top' || side === 'bottom') ? 'left' : 'top';
                arrowStyle.textContent = `
                    #${self.$content.attr('id')}::before,
                    #${self.$content.attr('id')}::after {
                        ${arrowProp}: ${arrowOffset}px;
                    }
                `;
                self.$content.append(arrowStyle);
            }
        }

        _trapFocus(e) {
            const focusable = this.$content.find(FOCUSABLE).filter(':visible');
            if (!focusable.length) { e.preventDefault(); return; }

            const $first   = focusable.first();
            const $last    = focusable.last();
            const $current = $(document.activeElement);

            if (e.shiftKey) {
                if ($current.is($first)) { e.preventDefault(); $last.trigger('focus'); }
            } else {
                if ($current.is($last))  { e.preventDefault(); $first.trigger('focus'); }
            }
        }

        destroy() {
            const self = this;
            const $el  = self.$el;

            if (self.isOpen) {
                self.isOpen = false;
                self._finishClose();
            }

            if (self.$trigger && self.$trigger.length) {
                self.$trigger
                    .off(`.popover.${self._uid}`)
                    .removeAttr('aria-haspopup aria-expanded aria-controls');
            }

            // FIX: off() with namespace '.popover.{uid}' now cleanly removes ALL
            // events registered under that namespace, including 'ts-popover-opened'
            // because the event name is now 'ts-popover-opened.popover.{uid}'.
            $(document).off(`.popover.${self._uid}`);
            $(window).off(`.popover.${self._uid}`);

            if (self.$content && self.$content.length) {
                self.$content.off(`.popover.${self._uid}`);
                self.$content.find('style.ts-pop-arrow-style').remove();

                // FIX: if portaling moved $content to <body>, move it back to its
                // original parent before final cleanup, preventing an orphaned node.
                if (self.options.portaling && self.$contentOriginalParent && self.$contentOriginalParent.length) {
                    self.$content.appendTo(self.$contentOriginalParent);
                }

                self.$content
                    .removeAttr('id role aria-modal aria-labelledby tabindex')
                    .removeClass(
                        'ts-pop-visible ts-pop-arrow ' +
                        'ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right ' +
                        `${self.options.animationIn} ${self.options.animationOut}`
                    )
                    .css({ top: '', left: '' });
            }

            $el.removeData(instanceName);

            return this;
        }
    }

    PluginPopover.defaults = {
        side              : 'bottom',   // top | bottom | left | right
        align             : 'start',    // start | center | end
        offset            : 8,          // px gap between trigger and popover
        arrow             : true,       // show CSS arrow
        portaling         : false,      // append content to <body> to escape stacking contexts
        closeOnEscape     : true,
        closeOnOutside    : true,
        animationIn       : 'ts-pop-in',
        animationOut      : 'ts-pop-out',
        animationDuration : 200,        // ms — fallback if animationend never fires
        modal             : false,      // trap focus inside content
        onOpen            : null,       // function(instance) {}
        onClose           : null,       // function(instance) {}
    };

    $.extend(themestrap, { PluginPopover });

    $.fn.themestrapPluginPopover = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginPopover($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);