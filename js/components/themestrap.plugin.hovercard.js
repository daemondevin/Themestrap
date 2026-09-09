/**
 * Themestrap HoverCard Plugin
 * Hover-triggered preview cards with delay, side-aware animations,
 * auto-flip, portaling, optional arrow, and keyboard accessibility.
 *
 * Part of the Themestrap component library.
 *
 * Markup anatomy
 *
 *   <!-- Wrapper (the plugin root) -->
 *   <div data-plugin-hovercard
 *        data-plugin-options='{"side": "bottom", "delay": [200, 300]}'>
 *
 *     <!-- Trigger: any inline element -->
 *     <a data-hovercard-trigger href="#">@daemon_devin</a>
 *
 *     <!-- Content panel: shown on hover -->
 *     <div data-hovercard-content>
 *       <div class="hc-avatar">
 *         <img src="avatar.jpg" alt="daemon_devin">
 *       </div>
 *       <div class="hc-name">daemon.devin</div>
 *       <div class="hc-handle">@daemon_devin</div>
 *       <p class="hc-bio">Building Themestrap — a zero-build jQuery plugin ecosystem.</p>
 *       <div class="hc-meta">
 *         <span>128 <span class="hc-meta-label">Following</span></span>
 *         <span>4.2k <span class="hc-meta-label">Followers</span></span>
 *       </div>
 *     </div>
 *   </div>
 *
 * Options (data-plugin-options JSON or JS object)
 *
 *   side              "bottom"              where the card appears: top|bottom|left|right
 *   align             "start"               alignment along the side axis: start|center|end
 *   offset            12                    gap between trigger and card (px)
 *   arrow             false                 show a pointing CSS arrow
 *   portaling         false                 append content to <body> to escape overflow:hidden
 *   delay             [200, 300]            [openDelayMs, closeDelayMs]; single number for both
 *   animationDuration 180                   ms — fallback if animationend never fires
 *   ariaLabel         "Hover card"          aria-label on the content panel
 *   onShow            null                  callback(instance)
 *   onHide            null                  callback(instance)
 *
 * Public API
 *
 *   const hc = $('#my-hovercard').data('__pluginHoverCard');
 *   hc.show();
 *   hc.hide();
 *   hc.update();  // reposition without toggling visibility
 *
 * Events dispatched on [data-plugin-hovercard]  (native CustomEvent, bubbles)
 *
 *   ts.hovercard.show   — after card becomes visible   (detail: instance)
 *   ts.hovercard.hide   — after card is hidden         (detail: instance)
 *
 * Init.js wiring
 *
 *   if ($.isFunction($.fn['themestrapPluginHoverCard']) && $('[data-plugin-hovercard]').length) {
 *       $(() => {
 *           $('[data-plugin-hovercard]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginHoverCard(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginHoverCard';

    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    const STYLE_ID = 'ts-hovercard-styles';

    const CSS_TEXT = `/* Themestrap HoverCard */

[data-plugin-hovercard] {
    position: relative;
    display: inline-block;
}

[data-hovercard-content] {
    position: absolute;
    z-index: 9994;
    min-width: 240px;
    max-width: 340px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 0.625rem;
    box-shadow:
        0 4px  6px -1px rgba(0, 0, 0, 0.07),
        0 10px 15px -3px rgba(0, 0, 0, 0.10);
    padding: 1rem;
    line-height: 1.5;
    color: #1a1a2e;
    display: none;
    pointer-events: none;
}

[data-hovercard-content].ts-hc-visible {
    display: block;
    pointer-events: auto;
}

/* Side-aware entry animations */
@keyframes tsHcInUp    { from { opacity:0; transform:scale(.96) translateY( 4px);  } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes tsHcOutDown { from { opacity:1; transform:scale(1)   translateY(0);    } to { opacity:0; transform:scale(.96) translateY( 4px); } }
@keyframes tsHcInDown  { from { opacity:0; transform:scale(.96) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes tsHcOutUp   { from { opacity:1; transform:scale(1)   translateY(0);    } to { opacity:0; transform:scale(.96) translateY(-4px); } }
@keyframes tsHcInLeft  { from { opacity:0; transform:scale(.96) translateX( 4px); } to { opacity:1; transform:scale(1) translateX(0); } }
@keyframes tsHcOutRight{ from { opacity:1; transform:scale(1)   translateX(0);    } to { opacity:0; transform:scale(.96) translateX( 4px); } }
@keyframes tsHcInRight { from { opacity:0; transform:scale(.96) translateX(-4px); } to { opacity:1; transform:scale(1) translateX(0); } }
@keyframes tsHcOutLeft { from { opacity:1; transform:scale(1)   translateX(0);    } to { opacity:0; transform:scale(.96) translateX(-4px); } }

[data-hovercard-content].ts-hc-in-top     { animation: tsHcInUp     0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-hovercard-content].ts-hc-out-top    { animation: tsHcOutDown  0.13s ease-in forwards; }
[data-hovercard-content].ts-hc-in-bottom  { animation: tsHcInDown   0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-hovercard-content].ts-hc-out-bottom { animation: tsHcOutUp    0.13s ease-in forwards; }
[data-hovercard-content].ts-hc-in-left    { animation: tsHcInLeft   0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-hovercard-content].ts-hc-out-left   { animation: tsHcOutRight 0.13s ease-in forwards; }
[data-hovercard-content].ts-hc-in-right   { animation: tsHcInRight  0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-hovercard-content].ts-hc-out-right  { animation: tsHcOutLeft  0.13s ease-in forwards; }

/* Arrow */
[data-hovercard-content]::before,
[data-hovercard-content]::after {
    content: '';
    display: none;
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    pointer-events: none;
}

[data-hovercard-content].ts-hc-arrow::before,
[data-hovercard-content].ts-hc-arrow::after {
    display: block;
}

[data-hovercard-content].ts-hc-side-top::after    { top:  100%;                border-top-color: #fff; }
[data-hovercard-content].ts-hc-side-top::before   { top:  calc(100% + 1px);   border-top-color: rgba(0,0,0,0.08); }
[data-hovercard-content].ts-hc-side-bottom::after  { bottom: 100%;             border-bottom-color: #fff; }
[data-hovercard-content].ts-hc-side-bottom::before { bottom: calc(100% + 1px); border-bottom-color: rgba(0,0,0,0.08); }
[data-hovercard-content].ts-hc-side-left::after   { left:  100%;               border-left-color: #fff; }
[data-hovercard-content].ts-hc-side-left::before  { left:  calc(100% + 1px);   border-left-color: rgba(0,0,0,0.08); }
[data-hovercard-content].ts-hc-side-right::after  { right: 100%;               border-right-color: #fff; }
[data-hovercard-content].ts-hc-side-right::before { right: calc(100% + 1px);   border-right-color: rgba(0,0,0,0.08); }

/* Convenience layout helpers */
.hc-avatar       { margin-bottom: 0.625rem; }
.hc-avatar img   { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; display: block; }

.hc-name         { font-size: 0.9375rem; font-weight: 700; line-height: 1.25; color: inherit; }
.hc-handle       { font-size: 0.8125rem; color: #6b7280; margin-bottom: 0.375rem; }
.hc-bio          { font-size: 0.8125rem; color: #374151; margin: 0 0 0.625rem; }

.hc-meta         { display: flex; gap: 1rem; font-size: 0.8125rem; font-weight: 600; color: inherit; }
.hc-meta-label   { font-weight: 400; color: #6b7280; }

.hc-divider      { border: none; border-top: 1px solid rgba(0,0,0,0.06); margin: 0.625rem 0; }

/* Dark mode */
html.dark [data-hovercard-content] {
    background: var(--dark-300);
    color: var(--default);
    border-color: var(--dark-rgba-50);
    box-shadow:
        0 4px  6px -1px rgba(0,0,0,0.3),
        0 10px 15px -3px rgba(0,0,0,0.4);
}

html.dark [data-hovercard-content].ts-hc-side-top::after    { border-top-color: var(--dark-300); }
html.dark [data-hovercard-content].ts-hc-side-top::before   { border-top-color: var(--dark-rgba-50); }
html.dark [data-hovercard-content].ts-hc-side-bottom::after  { border-bottom-color: var(--dark-300); }
html.dark [data-hovercard-content].ts-hc-side-bottom::before { border-bottom-color: var(--dark-rgba-50); }
html.dark [data-hovercard-content].ts-hc-side-left::after   { border-left-color: var(--dark-300); }
html.dark [data-hovercard-content].ts-hc-side-left::before  { border-left-color: var(--dark-rgba-50); }
html.dark [data-hovercard-content].ts-hc-side-right::after  { border-right-color: var(--dark-300); }
html.dark [data-hovercard-content].ts-hc-side-right::before { border-right-color: var(--dark-rgba-50); }

html.dark .hc-handle,
html.dark .hc-meta-label { color: var(--color-grey-300, #9ca3af); }
html.dark .hc-bio        { color: var(--color-grey-200, #c0c8d4); }
html.dark .hc-divider    { border-top-color: var(--dark-rgba-50); }

@media (prefers-reduced-motion: reduce) {
    [data-hovercard-content] { animation: none !important; }
}
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id          = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    /* Position math — relative layout (portaling: false) */
    function computePosition($trigger, $content, side, align, offset) {
        const tw = $trigger.outerWidth();
        const th = $trigger.outerHeight();
        const cw = $content.outerWidth();
        const ch = $content.outerHeight();

        let top = 0, left = 0;

        switch (side) {
            case 'top':    top  = -(ch + offset); left = 0;              break;
            case 'bottom': top  =  th + offset;   left = 0;              break;
            case 'left':   top  = 0;              left = -(cw + offset); break;
            case 'right':  top  = 0;              left =  tw + offset;   break;
        }

        if (side === 'top' || side === 'bottom') {
            if (align === 'center') left = (tw - cw) / 2;
            if (align === 'end')    left = tw - cw;
        } else {
            if (align === 'center') top = (th - ch) / 2;
            if (align === 'end')    top = th - ch;
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            arrowOffset = Math.max(10, Math.min(cw - 10, (tw / 2) - left)) - 6;
        } else {
            arrowOffset = Math.max(10, Math.min(ch - 10, (th / 2) - top)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /* Position math — portaled layout (portaling: true) */
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

        let top = 0, left = 0;

        switch (side) {
            case 'top':    top  = tTop  - ch - offset;  left = tLeft;                break;
            case 'bottom': top  = tTop  + th + offset;  left = tLeft;                break;
            case 'left':   top  = tTop;                 left = tLeft - cw - offset;  break;
            case 'right':  top  = tTop;                 left = tLeft + tw + offset;  break;
        }

        if (side === 'top' || side === 'bottom') {
            if (align === 'center') left = tLeft + (tw / 2) - (cw / 2);
            if (align === 'end')    left = tLeft + tw - cw;
        } else {
            if (align === 'center') top = tTop + (th / 2) - (ch / 2);
            if (align === 'end')    top = tTop + th - ch;
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            arrowOffset = Math.max(10, Math.min(cw - 10, (tLeft + (tw / 2)) - left)) - 6;
        } else {
            arrowOffset = Math.max(10, Math.min(ch - 10, (tTop + (th / 2)) - top)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /* Auto-flip: return the best side given available viewport space */
    function resolvedSide($trigger, side, offset) {
        const rect = $trigger[0].getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        switch (side) {
            case 'top':    return rect.top    < (200 + offset)        ? 'bottom' : side;
            case 'bottom': return rect.bottom > (vh - 200 - offset)   ? 'top'    : side;
            case 'left':   return rect.left   < (200 + offset)        ? 'right'  : side;
            case 'right':  return rect.right  > (vw - 200 - offset)   ? 'left'   : side;
            default:       return side;
        }
    }

    class PluginHoverCard {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el         = $el;
            this.isVisible   = false;
            this._uid        = uid('hovercard');
            this._showTimer  = null;
            this._hideTimer  = null;
            this._activeSide = null;
            this._addedTabindex = false;

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
            this.options = $.extend(true, {}, PluginHoverCard.defaults, opts, {
                wrapper: this.$el
            });

            if (typeof this.options.delay === 'number') {
                this.options.delay = [this.options.delay, this.options.delay];
            }

            return this;
        }

        build() {
            injectStyles();

            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            self.$trigger = $el.find('[data-hovercard-trigger]').first();

            /* External trigger pattern: trigger elsewhere points to this card by id */
            if (!self.$trigger.length) {
                const cardId = $el.attr('id');
                if (cardId) {
                    self.$trigger = $(`[data-hovercard-trigger="${cardId}"]`).first();
                }
            }

            self.$content = $el.find('[data-hovercard-content]').first();

            if (!self.$content.length) {
                console.warn('[PluginHoverCard] No [data-hovercard-content] found in', $el[0]);
                return this;
            }

            self.$contentOriginalParent = self.$content.parent();

            const contentId = self.$content.attr('id') || uid('hc-content');
            self.$content.attr({
                id          : contentId,
                role        : 'group',
                'aria-label': opts.ariaLabel
            });

            /* Link trigger to card for screen readers */
            if (self.$trigger.length) {
                self.$trigger.attr('aria-describedby', contentId);

                if (!self.$trigger.is('a[href], button, input, select, textarea, [tabindex]')) {
                    self.$trigger.attr('tabindex', '0');
                    self._addedTabindex = true;
                }
            }

            if (opts.arrow) {
                self.$content.addClass('ts-hc-arrow');
            }

            if (opts.portaling) {
                self.$content.appendTo(document.body);
            }

            return this;
        }

        events() {
            const self = this;
            const ns   = `.hovercard.${self._uid}`;

            if (self.$trigger && self.$trigger.length) {
                self.$trigger
                    .on(`mouseenter${ns}`, () => self._scheduleShow())
                    .on(`mouseleave${ns}`, () => self._scheduleHide())
                    .on(`focus${ns}`,      () => self._scheduleShow())
                    .on(`blur${ns}`,       () => self._scheduleHide());
            }

            if (self.$content && self.$content.length) {
                /* Hovering inside the card keeps it open */
                self.$content
                    .on(`mouseenter${ns}`, () => self._cancelHide())
                    .on(`mouseleave${ns}`, () => self._scheduleHide());
            }

            $(window).on(`resize${ns} scroll${ns}`, () => {
                if (self.isVisible) self._position();
            });

            return this;
        }

        _scheduleShow() {
            const self = this;
            self._cancelHide();
            if (self.isVisible) return this;

            const delay = self.options.delay[0];
            self._showTimer = delay > 0
                ? setTimeout(() => self.show(), delay)
                : (self.show(), null);

            return this;
        }

        _scheduleHide() {
            const self = this;
            self._cancelShow();
            if (!self.isVisible) return this;

            const delay = self.options.delay[1];
            self._hideTimer = delay > 0
                ? setTimeout(() => self.hide(), delay)
                : (self.hide(), null);

            return this;
        }

        _cancelShow() {
            clearTimeout(this._showTimer);
            this._showTimer = null;
            return this;
        }

        _cancelHide() {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
            return this;
        }

        show() {
            const self = this;

            if (self.isVisible || !self.$content || !self.$content.length) return this;

            self.isVisible = true;

            const side    = resolvedSide(
                self.$trigger && self.$trigger.length ? self.$trigger : self.$el,
                self.options.side,
                self.options.offset
            );
            self._activeSide = side;

            const inClass   = `ts-hc-in-${side}`;
            const allIn     = 'ts-hc-in-top ts-hc-in-bottom ts-hc-in-left ts-hc-in-right';
            const allOut    = 'ts-hc-out-top ts-hc-out-bottom ts-hc-out-left ts-hc-out-right';
            const allSides  = 'ts-hc-side-top ts-hc-side-bottom ts-hc-side-left ts-hc-side-right';

            self.$content
                .removeClass(`${allOut} ${allIn} ${allSides}`)
                .addClass(`ts-hc-visible ts-hc-side-${side}`);

            self._position();

            self.$content
                .addClass(inClass)
                .one('animationend webkitAnimationEnd', function () {
                    self.$content.removeClass(inClass);
                });

            setTimeout(() => {
                if (self.isVisible) self.$content.removeClass(inClass);
            }, self.options.animationDuration + 30);

            self.$el[0].dispatchEvent(new CustomEvent('ts.hovercard.show', {
                bubbles: true,
                detail : self
            }));

            if (typeof self.options.onShow === 'function') {
                self.options.onShow.call(self);
            }

            return this;
        }

        hide() {
            const self = this;

            if (!self.isVisible || !self.$content || !self.$content.length) return this;

            self.isVisible = false;

            const side     = self._activeSide || self.options.side;
            const outClass = `ts-hc-out-${side}`;
            const allIn    = 'ts-hc-in-top ts-hc-in-bottom ts-hc-in-left ts-hc-in-right';

            self.$content
                .removeClass(allIn)
                .addClass(outClass)
                .one('animationend webkitAnimationEnd', function () {
                    self._finishHide(outClass);
                });

            setTimeout(() => {
                if (!self.isVisible) self._finishHide(outClass);
            }, self.options.animationDuration + 30);

            return this;
        }

        _finishHide(outClass) {
            const self = this;

            if (self.isVisible) return; /* re-opened during animation */

            const allSides = 'ts-hc-side-top ts-hc-side-bottom ts-hc-side-left ts-hc-side-right';

            self.$content
                .removeClass(`ts-hc-visible ${outClass} ${allSides}`)
                .css({ top: '', left: '' })
                .find('style.ts-hc-arrow-style').remove();

            self.$el[0].dispatchEvent(new CustomEvent('ts.hovercard.hide', {
                bubbles: true,
                detail : self
            }));

            if (typeof self.options.onHide === 'function') {
                self.options.onHide.call(self);
            }
        }

        update() {
            if (this.isVisible) this._position();
            return this;
        }

        _position() {
            const self = this;
            const opts = self.options;
            const $ref = self.$trigger && self.$trigger.length ? self.$trigger : self.$el;

            const side    = resolvedSide($ref, opts.side, opts.offset);
            self._activeSide = side;

            const compute = opts.portaling ? computePortaledPosition : computePosition;
            const { top, left, arrowOffset } = compute($ref, self.$content, side, opts.align, opts.offset);

            const allSides = 'ts-hc-side-top ts-hc-side-bottom ts-hc-side-left ts-hc-side-right';

            self.$content
                .removeClass(allSides)
                .addClass(`ts-hc-side-${side}`)
                .css({ top, left });

            if (opts.arrow && arrowOffset !== null) {
                self.$content.find('style.ts-hc-arrow-style').remove();
                const arrowStyle  = document.createElement('style');
                arrowStyle.className = 'ts-hc-arrow-style';
                const prop = (side === 'top' || side === 'bottom') ? 'left' : 'top';
                arrowStyle.textContent = `
                    #${self.$content.attr('id')}::before,
                    #${self.$content.attr('id')}::after {
                        ${prop}: ${arrowOffset}px;
                    }
                `;
                self.$content.append(arrowStyle);
            }

            return this;
        }

        destroy() {
            const self = this;
            const ns   = `.hovercard.${self._uid}`;

            self._cancelShow();
            self._cancelHide();

            if (self.isVisible) {
                self.isVisible = false;
                if (self.$content) {
                    const allClasses = [
                        'ts-hc-visible', 'ts-hc-arrow',
                        'ts-hc-side-top', 'ts-hc-side-bottom', 'ts-hc-side-left', 'ts-hc-side-right',
                        'ts-hc-in-top', 'ts-hc-in-bottom', 'ts-hc-in-left', 'ts-hc-in-right',
                        'ts-hc-out-top', 'ts-hc-out-bottom', 'ts-hc-out-left', 'ts-hc-out-right'
                    ].join(' ');
                    self.$content
                        .removeClass(allClasses)
                        .css({ top: '', left: '' })
                        .find('style.ts-hc-arrow-style').remove();
                }
            }

            if (self.$trigger && self.$trigger.length) {
                self.$trigger.off(ns).removeAttr('aria-describedby');
                if (self._addedTabindex) {
                    self.$trigger.removeAttr('tabindex');
                }
            }

            if (self.$content && self.$content.length) {
                self.$content.off(ns).removeAttr('id role aria-label');

                if (self.options.portaling && self.$contentOriginalParent && self.$contentOriginalParent.length) {
                    self.$content.appendTo(self.$contentOriginalParent);
                }
            }

            $(window).off(ns);
            self.$el.removeData(instanceName);

            return this;
        }
    }

    PluginHoverCard.defaults = {
        side             : 'bottom',      // top | bottom | left | right
        align            : 'start',       // start | center | end
        offset           : 12,            // px gap between trigger and card
        arrow            : false,         // show a CSS triangle arrow
        portaling        : false,         // append content to <body> to escape stacking contexts
        delay            : [200, 300],    // [openDelayMs, closeDelayMs]; single number for both
        animationDuration: 180,           // ms — fallback if animationend never fires
        ariaLabel        : 'Hover card',  // aria-label on the content panel
        onShow           : null,          // callback(instance)
        onHide           : null,          // callback(instance)
    };

    $.extend(themestrap, { PluginHoverCard });

    $.fn.themestrapPluginHoverCard = function(opts) {
        return this.map(function() {
            const $this    = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && $.isFunction(instance[opts])) {
                    instance[opts]();
                }
                return instance;
            }

            if (instance) {
                return instance;
            }

            return new PluginHoverCard($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);