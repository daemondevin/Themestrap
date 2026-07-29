// Parallax
(((themestrap = {}, $) => {

    const instanceName = '__parallax';
    const STYLE_ID    = 'themestrap-parallax-styles';

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
[data-plugin-parallax] { position: relative; overflow: hidden; }

/* Scroll-parallax bg layer */
.parallax-bg-layer {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    pointer-events: none;
    will-change: transform;
}

/* Mouse-parallax: children move; wrapper clips */
.parallax-mouse-host { position: relative; overflow: hidden; }
.parallax-mouse-object { will-change: transform; }

/* Content above bg */
.parallax-content-layer { position: relative; z-index: 1; }
`;
        document.head.appendChild(s);
    }

    // RAF throttle helper
    function rafThrottle(fn) {
        let pending = false;
        return function(...args) {
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => { pending = false; fn.apply(this, args); });
        };
    }

    class PluginParallax {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el        = $el;
            this.initialHTML  = $el.html();
            this.initialStyle = $el.attr('style') || '';
            this._destroyed   = false;

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
            this.options = $.extend(true, {}, PluginParallax.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectStyles();
            const o = this.options;

            if (o.mouseParallax) {
                this._buildMouse();
            } else if (o.scrollableParallax) {
                this._buildScrollable();
            } else {
                this._buildBg();
            }

            return this;
        }

        // Background / scale parallax
        _buildBg() {
            const self = this;
            const o    = self.options;

            // Image source: option > data-image-src attr > existing CSS bg
            let imgSrc = o.imageSrc || self.$el.data('image-src') || '';
            if (!imgSrc) {
                const raw = self.$el.css('background-image');
                if (raw && raw !== 'none') {
                    imgSrc = raw.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                }
            }

            // Move existing children into a content wrapper so bg sits underneath
            if (!self.$el.find('.parallax-bg-layer').length) {
                const existingHTML = self.$el.html();
                self.$el.html('');

                self.$bgLayer = $('<div>').addClass('parallax-bg-layer');
                if (imgSrc) self.$bgLayer.css('background-image', 'url(' + imgSrc + ')');

                // Height of bg layer — must be taller than host to allow travel
                const heightVal = o.parallaxHeight || '150%';
                self.$bgLayer.css('height', heightVal);

                self.$bgLayer.appendTo(self.$el);

                self.$contentLayer = $('<div>').addClass('parallax-content-layer').html(existingHTML);
                self.$contentLayer.appendTo(self.$el);

                // Clear bg from host element to avoid double-paint
                self.$el.css('background-image', 'none');
            } else {
                self.$bgLayer      = self.$el.find('.parallax-bg-layer').first();
                self.$contentLayer = self.$el.find('.parallax-content-layer').first();
            }

            self._tickBg();
        }

        _tickBg() {
            const self = this;
            if (self._destroyed || !self.$bgLayer) return;

            const o    = self.options;
            const el   = self.$el[0];
            const rect = el.getBoundingClientRect();
            const viewH = window.innerHeight || document.documentElement.clientHeight;

            // Only paint when element is (or is close to) the viewport
            if (rect.bottom < -50 || rect.top > viewH + 50) return;

            // progress: 0 = bottom of el just entered bottom of viewport
            //           1 = top of el just exited top of viewport
            const total    = viewH + rect.height;
            const elapsed  = viewH - rect.top;
            const progress = Math.max(0, Math.min(1, elapsed / total));

            if (o.parallaxScale) {
                // Scale mode: zoom bg from 1 → 1+speed (or reverse)
                const scaleMin = 1;
                const scaleMax = 1 + (o.speed * 0.5);
                const scale    = o.parallaxScaleInvert
                    ? scaleMax - progress * (scaleMax - scaleMin)
                    : scaleMin + progress * (scaleMax - scaleMin);

                self.$bgLayer[0].style.transform = 'scale(' + scale.toFixed(4) + ')';
                self.$bgLayer[0].style.transformOrigin = 'center center';
                self.$bgLayer[0].style.top = '0';
                self.$bgLayer[0].style.height = '100%';

            } else {
                // Classic translate: bg moves opposite to scroll direction
                const layerH   = self.$bgLayer[0].offsetHeight;
                const hostH    = el.offsetHeight;
                const maxTravel = layerH - hostH;
                const dir       = o.parallaxDirection === 'bottom' ? 1 : -1;
                const shift     = dir * (progress - 0.5) * maxTravel;

                self.$bgLayer[0].style.transform = 'translateY(' + shift.toFixed(2) + 'px)';
            }

            // Emit via native CustomEvent
            // avoids jQuery's scroll-event triggering
            // which was causing the infinite re-entry call stack overflow.
            el.dispatchEvent(new CustomEvent('parallax:update', {
                detail: { progress: progress, instance: self },
                bubbles: false
            }));
        }

        // Scrollable CSS-scrub parallax
        _buildScrollable() {
            const self = this;
            const o    = self.options;

            // The target element to animate: first child with .scrollable-parallax-wrapper,
            // or fallback to first child, or the element itself
            self.$scrubTarget = self.$el.find('.scrollable-parallax-wrapper').first();
            if (!self.$scrubTarget.length) self.$scrubTarget = self.$el.children().first();
            if (!self.$scrubTarget.length) self.$scrubTarget = self.$el;

            self._tickScrollable();
        }

        _tickScrollable() {
            const self = this;
            if (self._destroyed) return;

            const o    = self.options;
            const rect = self.$el[0].getBoundingClientRect();
            const viewH = window.innerHeight || document.documentElement.clientHeight;

            if (rect.bottom < 0 || rect.top > viewH) return;

            const total    = viewH + rect.height;
            const elapsed  = viewH - rect.top;
            const progress = Math.max(0, Math.min(1, elapsed / total));

            const value = o.cssValueStart + (o.cssValueEnd - o.cssValueStart) * progress;
            const cssVal = value.toFixed(2) + (o.cssValueUnit || '');

            self.$scrubTarget[0].style[o.cssProperty] = cssVal;
        }

        _buildMouse() {
            const self = this;

            self.$el.addClass('parallax-mouse-host');

            // Cache all depth objects
            self.$mouseObjects = self.$el.find('.parallax-mouse-object');

            self._onMouseMove = function(e) {
                if (self._destroyed) return;

                const rect  = self.$el[0].getBoundingClientRect();
                const cx    = rect.left + rect.width  / 2;
                const cy    = rect.top  + rect.height / 2;
                const dx    = (e.clientX - cx) / (rect.width  / 2);  // -1 … +1
                const dy    = (e.clientY - cy) / (rect.height / 2);  // -1 … +1

                self.$mouseObjects.each(function() {
                    const depth = parseFloat($(this).data('value') || 3);
                    const tx    = dx * depth * 8;
                    const ty    = dy * depth * 8;
                    this.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
                });

                // Native event so we never recurse through scroll handler
                self.$el[0].dispatchEvent(new CustomEvent('parallax:mouse', {
                    detail: { dx: dx, dy: dy, instance: self },
                    bubbles: false
                }));
            };

            self._onMouseLeave = function() {
                if (self._destroyed) return;
                self.$mouseObjects.each(function() {
                    this.style.transform = 'translate(0,0)';
                });
            };

            // Bind directly via native addEventListener to avoid jQuery event
            // propagation touching the scroll handler namespace
            self.$el[0].addEventListener('mousemove', self._onMouseMove);
            self.$el[0].addEventListener('mouseleave', self._onMouseLeave);
        }

        events() {
            const self = this;
            const o    = self.options;

            if (o.mouseParallax) return this; // mouse mode uses its own listeners

            const tick = o.scrollableParallax
                ? () => self._tickScrollable()
                : () => self._tickBg();

            self._onScrollResize = rafThrottle(function() {
                if (!self._destroyed) tick();
            });

            $(window).on('scroll.parallax resize.parallax', self._onScrollResize);

            return this;
        }

        refresh() {
            const o = this.options;
            if (!o.mouseParallax) {
                o.scrollableParallax ? this._tickScrollable() : this._tickBg();
            }
            return this;
        }

        destroy() {
            const self = this;
            self._destroyed = true;

            $(window).off('scroll.parallax resize.parallax', self._onScrollResize);

            if (self._onMouseMove) {
                self.$el[0].removeEventListener('mousemove',  self._onMouseMove);
                self.$el[0].removeEventListener('mouseleave', self._onMouseLeave);
            }

            self.$el
                .html(self.initialHTML)
                .attr('style', self.initialStyle || null)
                .removeClass('parallax-mouse-host')
                .removeData(instanceName);

            return this;
        }
    }

    PluginParallax.defaults = {
        // BG / scale mode
        /** Speed multiplier for translate or scale effect. */
        speed: 1.5,
        /** 'top' (default) or 'bottom' — which direction the bg shifts on scroll. */
        parallaxDirection: 'top',
        /** Height of the bg layer (CSS string). Must exceed 100% to allow travel. */
        parallaxHeight: '150%',
        /** Background image URL. Falls back to data-image-src attr, then CSS bg. */
        imageSrc: null,
        /** Enable scale/zoom mode instead of translate. */
        parallaxScale: false,
        /** Reverse the scale direction (starts large, shrinks). */
        parallaxScaleInvert: false,
        // Scrollable CSS-scrub mode
        /** Enable scroll-scrubbed CSS property mode. */
        scrollableParallax: false,
        /** CSS property name to animate, e.g. 'width', 'opacity'. */
        cssProperty: 'width',
        /** Start value (number). */
        cssValueStart: 0,
        /** End value (number). */
        cssValueEnd: 100,
        /** Unit suffix appended to value, e.g. '%', 'px'. */
        cssValueUnit: '%',
        // Mouse parallax mode
        /** Enable pointer-tracking parallax. Children with data-value get depth. */
        mouseParallax: false
    };

    $.extend(themestrap, { PluginParallax });

    $.fn.themestrapPluginParallax = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) return $this.data(instanceName);
            return new PluginParallax($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
