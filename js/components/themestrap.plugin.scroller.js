/**
 * Scroller
 *
 * A native, dependency-free custom scrollbar. It wraps an element's content in a 
 * hidden-native-scrollbar viewport and renders a themable custom track + draggable 
 * thumb on top.
 *
 * Unlike `themestrap.plugin.scrollable.js` (which delegates to the external
 * nanoScroller vendor library), this plugin implements all scrollbar geometry,
 * dragging, track-paging and auto-hide behaviour itself — no third-party JS.
 *
 * Markup (auto-generated from the host element's existing children):
 *   <div data-plugin-scroller>                ->  .ts-scroller
 *     ...your content...                          .ts-scroller__content  (scroll viewport)
 *                                                 .ts-scroller__bar      (track)
 *                                                   .ts-scroller__thumb  (draggable thumb)
 */
// Scroller
(((themestrap = {}, $) => {

    const instanceName = '__pluginScroller';

    // Per-instance id so multiple scrollers can namespace their window events
    // independently and detach cleanly in destroy().
    let uidCounter = 0;

    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID.
    const STYLE_ID = 'ts-scroller-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginScroller (native custom scrollbar, no vendor deps) */
.ts-scroller {
    --ts-scroller-size:        8px;
    --ts-scroller-gutter:      2px;
    --ts-scroller-radius:      8px;
    --ts-scroller-track:       transparent;
    --ts-scroller-thumb:       rgba(10, 25, 41, 0.28);
    --ts-scroller-thumb-hover: rgba(10, 25, 41, 0.5);
    position: relative;
    overflow: hidden;
}

/* Scroll viewport — native scrollbar hidden, momentum scrolling on iOS */
.ts-scroller__content {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;      /* Firefox            */
    -ms-overflow-style: none;   /* legacy Edge / IE   */
    box-sizing: border-box;
}
.ts-scroller__content::-webkit-scrollbar {   /* Chrome / Safari */
    width: 0;
    height: 0;
    display: none;
}

/* Custom track — hidden until overflow exists, then revealed by state classes */
.ts-scroller__bar {
    position: absolute;
    top:    var(--ts-scroller-gutter);
    right:  var(--ts-scroller-gutter);
    bottom: var(--ts-scroller-gutter);
    width:  var(--ts-scroller-size);
    background: var(--ts-scroller-track);
    border-radius: var(--ts-scroller-radius);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
    z-index: 5;
}
.ts-scroller--has-overflow .ts-scroller__bar {
    pointer-events: auto;
}
.ts-scroller--has-overflow.ts-scroller--always  .ts-scroller__bar,
.ts-scroller--has-overflow.ts-scroller--scrolling .ts-scroller__bar,
.ts-scroller--has-overflow.ts-scroller--dragging  .ts-scroller__bar,
.ts-scroller--has-overflow:hover .ts-scroller__bar {
    opacity: 1;
}

/* Custom thumb — vertical position driven by translateY() from JS */
.ts-scroller__thumb {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 30px;
    background: var(--ts-scroller-thumb);
    border-radius: var(--ts-scroller-radius);
    cursor: grab;
    transition: background .2s ease;
    will-change: transform;
    touch-action: none;
}
.ts-scroller__thumb:hover,
.ts-scroller--dragging .ts-scroller__thumb {
    background: var(--ts-scroller-thumb-hover);
}
.ts-scroller--dragging .ts-scroller__thumb {
    cursor: grabbing;
}
.ts-scroller--dragging,
.ts-scroller--dragging .ts-scroller__content {
    -webkit-user-select: none;
    user-select: none;
}
`;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    // Normalize a CSS length: bare numbers become px, strings pass through.
    function cssLen(v) {
        if (v === null || v === undefined || v === '') return '';
        return (typeof v === 'number' || /^\d+(\.\d+)?$/.test(String(v))) ? (v + 'px') : String(v);
    }

    class PluginScroller {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;

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
            this.options = $.extend(true, {}, PluginScroller.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily — only when an instance is built.
            injectStyles();

            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            self._uid     = ++uidCounter;
            self._pointer = ('PointerEvent' in window);
            self._dragging = false;

            $el.addClass('ts-scroller');

            // Wrap the host element's existing content (elements AND text nodes)
            // into the scroll viewport. wrapInner preserves the original nodes,
            // so any event handlers bound to the content survive intact.
            $el.wrapInner($('<div></div>').addClass(options.contentClass));
            self.$content = $el.children().first();

            // Build the custom track + thumb and lay it over the viewport.
            self.$thumb = $('<div></div>').addClass(options.sliderClass);
            self.$bar   = $('<div></div>').addClass(options.paneClass).append(self.$thumb);
            $el.append(self.$bar);

            // Height handling:
            //   - `height`    -> fixed wrapper height; content fills it (height:100%).
            //   - `maxHeight`  -> content grows up to a cap, wrapper sizes to content.
            //   - neither     -> rely on whatever CSS height the wrapper already has.
            if (options.height) {
                $el.css('height', cssLen(options.height));
            }
            if (options.maxHeight) {
                $el.css('height', '');
                self.$content.css({ height: 'auto', maxHeight: cssLen(options.maxHeight) });
            }

            // Make the viewport keyboard-focusable so arrow / page keys scroll it.
            if (options.tabIndex !== null && options.tabIndex !== undefined) {
                self.$content.attr('tabindex', options.tabIndex);
            }

            if (options.alwaysVisible) {
                $el.addClass('ts-scroller--always');
            }

            // Recalculate when the viewport resizes or its content mutates.
            if (typeof ResizeObserver !== 'undefined') {
                self._resizeObserver = new ResizeObserver(() => self.update());
                self._resizeObserver.observe($el[0]);
                self._resizeObserver.observe(self.$content[0]);
            }
            if (typeof MutationObserver !== 'undefined') {
                self._mutationObserver = new MutationObserver(() => self.update());
                self._mutationObserver.observe(self.$content[0], {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }

            self.update();

            return this;
        }

        events() {
            const self     = this;
            const downEvt  = (self._pointer ? 'pointerdown' : 'mousedown') + '.scroller';

            // Single entry point on the track: thumb-hit starts a drag,
            // track-hit pages the viewport toward the click position.
            self.$bar.on(downEvt, function(e) {
                if (self.$thumb.is(e.target) || $.contains(self.$thumb[0], e.target)) {
                    self._startDrag(e);
                } else {
                    self._trackJump(e);
                }
            });

            // Native scroll on the viewport drives the thumb position.
            self.$content.on('scroll.scroller', () => {
                self._positionThumb();
                self._flash();
            });

            // Optionally stop the page from scrolling once a boundary is reached.
            if (self.options.preventPageScrolling) {
                self.$content.on('wheel.scroller', (e) => self._onWheel(e));
            }

            $(window).on('resize.scroller-' + self._uid, () => self.update());

            return this;
        }

        /**
         * Measure the viewport, size the thumb proportionally and toggle the
         * overflow state. Safe to call repeatedly (reset / reflow entry point).
         */
        update() {
            const self    = this;
            const options = self.options;

            if (!self.$content || !self.$content.length) {
                return this;
            }

            const content  = self.$content[0];
            const viewportH = content.clientHeight;   // visible height
            const contentH  = content.scrollHeight;    // total scrollable height
            const barH       = self.$bar[0].clientHeight;

            const hasOverflow = options.isEnabled && contentH > viewportH + 1;
            self.$el.toggleClass('ts-scroller--has-overflow', hasOverflow);

            if (!hasOverflow) {
                self._maxScroll = 0;
                self._maxThumbTravel = 0;
                return this;
            }

            // Thumb height is proportional to the visible / total ratio,
            // clamped between sliderMinHeight and (optionally) sliderMaxHeight,
            // and never taller than the track itself.
            let thumbH = Math.round(barH * (viewportH / contentH));
            thumbH = Math.max(options.sliderMinHeight, thumbH);
            if (options.sliderMaxHeight) {
                thumbH = Math.min(thumbH, options.sliderMaxHeight);
            }
            thumbH = Math.min(thumbH, barH);

            self._thumbH         = thumbH;
            self._maxScroll      = contentH - viewportH;
            self._maxThumbTravel = Math.max(0, barH - thumbH);

            self.$thumb.css('height', thumbH + 'px');
            self._positionThumb();

            return this;
        }

        _positionThumb() {
            const self = this;
            if (!self.$thumb || !self._maxScroll) return this;
            const content = self.$content[0];
            const ratio = self._maxScroll > 0 ? content.scrollTop / self._maxScroll : 0;
            const y = ratio * self._maxThumbTravel;
            self.$thumb.css('transform', 'translateY(' + y + 'px)');
            return this;
        }

        _startDrag(e) {
            const self = this;
            if (!self._maxThumbTravel) return;

            e.preventDefault();

            self._dragging        = true;
            self._dragStartY      = self._eventY(e);
            self._dragStartScroll = self.$content[0].scrollTop;
            self.$el.addClass('ts-scroller--dragging');

            const moveEvt = (self._pointer ? 'pointermove' : 'mousemove') + '.scroller-drag';
            const upEvt   = (self._pointer
                ? 'pointerup.scroller-drag pointercancel.scroller-drag'
                : 'mouseup.scroller-drag');

            $(document)
                .on(moveEvt, (ev) => self._onDragMove(ev))
                .on(upEvt,   ()   => self._endDrag());
        }

        _onDragMove(e) {
            const self = this;
            if (!self._dragging || !self._maxThumbTravel) return;
            const dy = self._eventY(e) - self._dragStartY;
            const scrollDelta = (dy / self._maxThumbTravel) * self._maxScroll;
            self.$content[0].scrollTop = self._dragStartScroll + scrollDelta;
            // The viewport's scroll handler repositions the thumb.
        }

        _endDrag() {
            const self = this;
            self._dragging = false;
            self.$el.removeClass('ts-scroller--dragging');
            $(document).off('.scroller-drag');
            self._flash();
        }

        _trackJump(e) {
            const self = this;
            if (!self._maxThumbTravel) return;

            const rect = self.$bar[0].getBoundingClientRect();
            const y    = self._eventY(e) - rect.top;

            let targetTop = y - (self._thumbH / 2);
            targetTop = Math.max(0, Math.min(self._maxThumbTravel, targetTop));

            const ratio = self._maxThumbTravel > 0 ? targetTop / self._maxThumbTravel : 0;
            self._scrollTo(ratio * self._maxScroll, true);
            self._flash();
        }

        _onWheel(e) {
            const self    = this;
            const content = self.$content[0];
            const oe      = e.originalEvent || e;
            const delta   = oe.deltaY;

            const atTop    = content.scrollTop <= 0;
            const atBottom = content.scrollTop >= (content.scrollHeight - content.clientHeight - 1);

            if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
                e.preventDefault();
            }
        }

        _flash() {
            const self = this;
            if (self.options.alwaysVisible) return;
            self.$el.addClass('ts-scroller--scrolling');
            clearTimeout(self._flashTimer);
            self._flashTimer = setTimeout(() => {
                self.$el.removeClass('ts-scroller--scrolling');
            }, self.options.flashDelay);
        }

        /**
         * Scroll the viewport.
         * @param {number|string|Element|jQuery} value  px offset, 'top', 'bottom',
         *                                               an element or a selector.
         * @param {boolean} smooth                        animate with smooth behaviour.
         */
        scrollTo(value, smooth) {
            const self    = this;
            const content = self.$content[0];
            let top;

            if (value === 'top') {
                top = 0;
            } else if (value === 'bottom') {
                top = content.scrollHeight;
            } else if (typeof value === 'number') {
                top = value;
            } else {
                const $target = $(value);
                if (!$target.length) return this;
                top = content.scrollTop
                    + ($target[0].getBoundingClientRect().top - content.getBoundingClientRect().top);
            }

            return self._scrollTo(top, smooth);
        }

        scrollTop(smooth)    { return this.scrollTo('top', smooth); }
        scrollBottom(smooth) { return this.scrollTo('bottom', smooth); }

        _scrollTo(top, smooth) {
            const content = this.$content[0];
            if (smooth && typeof content.scrollTo === 'function') {
                content.scrollTo({ top: top, behavior: 'smooth' });
            } else {
                content.scrollTop = top;
            }
            return this;
        }

        /** Toggle scrollbar rendering without tearing down the instance. */
        setEnabled(state) {
            this.options.isEnabled = !!state;
            this.update();
            return this;
        }

        destroy() {
            const self = this;

            $(window).off('resize.scroller-' + self._uid);
            $(document).off('.scroller-drag');
            clearTimeout(self._flashTimer);

            if (self.$bar)     self.$bar.off('.scroller');
            if (self.$content) self.$content.off('.scroller');

            if (self._resizeObserver)   { self._resizeObserver.disconnect();   self._resizeObserver = null; }
            if (self._mutationObserver) { self._mutationObserver.disconnect(); self._mutationObserver = null; }

            if (self.$bar) {
                self.$bar.remove();
                self.$bar = null;
            }

            // Unwrap the viewport: move its children back up to the host element
            // (preserving handlers), then drop the now-empty wrapper.
            if (self.$content) {
                self.$el.append(self.$content.contents());
                self.$content.remove();
                self.$content = null;
            }

            self.$el
                .removeClass('ts-scroller ts-scroller--has-overflow ts-scroller--always ts-scroller--scrolling ts-scroller--dragging')
                .css({ height: '' })
                .removeData(instanceName);

            return this;
        }

        /** Vertical client coordinate from a mouse, pointer or touch event. */
        _eventY(e) {
            const oe = e.originalEvent || e;
            if (oe.touches && oe.touches.length)               return oe.touches[0].clientY;
            if (oe.changedTouches && oe.changedTouches.length) return oe.changedTouches[0].clientY;
            return (typeof oe.clientY === 'number') ? oe.clientY : e.clientY;
        }
    }

    PluginScroller.defaults = {
        /** Keep the scrollbar permanently visible instead of auto-hiding. */
        alwaysVisible: false,

        /** When auto-hiding, how long (ms) the bar stays visible after scrolling. */
        flashDelay: 1200,

        /** Smallest allowed thumb height in px. */
        sliderMinHeight: 30,

        /** Largest allowed thumb height in px (null = no cap). */
        sliderMaxHeight: null,

        /** Stop wheel scrolling from bubbling to the page at the scroll boundary. */
        preventPageScrolling: false,

        /** tabindex applied to the viewport for keyboard scrolling (null to skip). */
        tabIndex: 0,

        /** Fixed wrapper height (number = px, or any CSS length string). */
        height: null,

        /** Max viewport height; wrapper grows with content up to this cap. */
        maxHeight: null,

        /** Set false to keep the instance alive but render no scrollbar. */
        isEnabled: true,

        /** Class applied to the generated scroll viewport. */
        contentClass: 'ts-scroller__content',

        /** Class applied to the generated track. */
        paneClass: 'ts-scroller__bar',

        /** Class applied to the generated thumb. */
        sliderClass: 'ts-scroller__thumb'
    };

    // expose to scope
    $.extend(themestrap, {
        PluginScroller
    });

    // jquery plugin
    $.fn.themestrapPluginScroller = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginScroller($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
