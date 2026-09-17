// Float Element
(((themestrap = {}, $) => {
    const instanceName = '__floatElement';

    let _instanceCounter = 0;

    function lerp(a, b, t) {
        return a + (b - a) * Math.max(0, Math.min(1, t));
    }

    class PluginFloatElement {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el         = $el;
            this._uid        = ++_instanceCounter;
            this._inView     = false;
            this._paused     = false;
            this._ticking    = false;
            this._rafId      = null;
            this._active     = false;
            this._lastScrollY = window.scrollY || 0;

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
            this.options = $.extend(true, {}, PluginFloatElement.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const opts = self.options;
            const $el  = opts.wrapper;

            /* SVG child delegation — IO cannot observe inside SVGs so the parent element
               gets data-plugin-float-element-svg and delegates to each child */
            if ($el.data('plugin-float-element-svg')) {
                $el.find('[data-plugin-float-element]').each(function () {
                    const $child     = $(this);
                    const childOpts  = themestrap.fn.getOptions($child.data('plugin-options'));
                    $child.themestrapPluginFloatElement(childOpts || undefined);
                });
                return this;
            }

            /* Respect prefers-reduced-motion */
            if (opts.respectReducedMotion &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return this;
            }

            /* Skip on narrow viewports */
            if ($(window).width() <= opts.minWindowWidth) {
                return this;
            }

            /* Legacy arbitrary style override */
            if (opts.style) {
                $el.attr('style', opts.style);
            }

            /* CSS positioning for absolutely-placed decorative elements */
            if (opts.startPos === 'top') {
                $el.css({ top: '0px' });
            } else if (opts.startPos === 'bottom') {
                $el.css({ bottom: '0px' });
            }

            /* will-change hint for GPU compositing */
            $el.css('will-change', 'transform');

            /* Optional CSS transition to smooth between scroll ticks */
            if (opts.transition) {
                const dur   = opts.transitionDuration + 'ms';
                const delay = opts.transitionDelay   + 'ms';
                let   tx    = 'transform ' + dur + ' ease-out ' + delay;
                if (opts.opacity !== false) {
                    tx += ', opacity ' + dur + ' ease-out ' + delay;
                }
                $el.css('transition', tx);
            }

            /* IntersectionObserver — sets _inView without polling */
            if ('IntersectionObserver' in window) {
                self._observer = new IntersectionObserver(entries => {
                    self._inView = entries[0].isIntersecting;
                }, { rootMargin: '20% 0px 20% 0px' });
                self._observer.observe($el[0]);
            } else {
                self._inView = true;
            }

            self._active = true;

            /* Seed position on build so there is no pop on first scroll */
            self._move();

            return this;
        }

        events() {
            const self = this;

            if (!self._active) return this;

            $(window).on('scroll.floatelement.' + self._uid, () => {
                if (self._paused || self._ticking) return;
                self._ticking = true;
                self._rafId = requestAnimationFrame(() => {
                    self._move();
                    self._ticking = false;
                });
            });

            return this;
        }

        /* Compute all transforms and apply them */
        _move() {
            const self = this;
            const opts = self.options;
            const $el  = opts.wrapper;

            if (!self._inView) return;

            /* Scroll-direction gate */
            const currentScrollY = window.scrollY || $(window).scrollTop();
            const scrollingDown  = currentScrollY >= self._lastScrollY;
            self._lastScrollY    = currentScrollY;

            if (opts.scrollDirection === 'down' && !scrollingDown) return;
            if (opts.scrollDirection === 'up'   &&  scrollingDown) return;

            /* scrollPercent — 100 at the element's natural top,
               falling as the user scrolls the element into view.
               The SVG factor keeps animated SVG children in a tighter range. */
            const factor      = opts.isInsideSVG ? 2 : 100;
            const $win        = $(window);
            const elTop       = $el.offset().top;
            const winTop      = $win.scrollTop();
            const scrollPct   = factor * (elTop - winTop) / $win.height();

            /* Normalized 0–1 for interpolated transforms */
            const t           = Math.max(0, Math.min(1, scrollPct / 100));

            /* Direction: startPos:'bottom' historically inverted the sign;
               invertDirection flips whatever the base direction is */
            const baseDir     = opts.startPos === 'bottom' ? -1 : 1;
            const dir         = opts.invertDirection ? -baseDir : baseDir;

            /* Primary translation */
            let translateVal  = dir * scrollPct / opts.speed;
            if (opts.clamp !== false) {
                const cap    = Math.abs(opts.clamp);
                translateVal = Math.max(-cap, Math.min(cap, translateVal));
            }

            /* Build transform string */
            const transforms = [];
            const result     = {};

            if (!opts.horizontal) {
                transforms.push('translate3d(0, ' + translateVal + '%, 0)');
                result.translateY = translateVal;
            } else {
                transforms.push('translate3d(' + translateVal + '%, 0, 0)');
                result.translateX = translateVal;
            }

            if (Array.isArray(opts.scale)) {
                const scaleVal = lerp(opts.scale[0], opts.scale[1], t);
                transforms.push('scale(' + scaleVal + ')');
                result.scale = scaleVal;
            }

            if (Array.isArray(opts.rotate)) {
                const rotateVal = lerp(opts.rotate[0], opts.rotate[1], t);
                transforms.push('rotate(' + rotateVal + 'deg)');
                result.rotate = rotateVal;
            }

            if (Array.isArray(opts.skew)) {
                const skewVal = lerp(opts.skew[0], opts.skew[1], t);
                transforms.push('skewX(' + skewVal + 'deg)');
                result.skew = skewVal;
            }

            $el.css('transform', transforms.join(' '));

            /* Opacity */
            if (Array.isArray(opts.opacity)) {
                const opacityVal = lerp(opts.opacity[0], opts.opacity[1], t);
                $el.css('opacity', opacityVal);
                result.opacity = opacityVal;
            }

            if (typeof opts.onMove === 'function') {
                opts.onMove.call($el[0], scrollPct, result);
            }
        }

        /* Public API */

        pause() {
            this._paused = true;
            return this;
        }

        resume() {
            this._paused = false;
            this._move();
            return this;
        }

        recalculate() {
            this._move();
            return this;
        }

        destroy() {
            const self = this;
            const $el  = self.options.wrapper;

            $(window).off('scroll.floatelement.' + self._uid);

            if (self._rafId !== null) {
                cancelAnimationFrame(self._rafId);
                self._rafId = null;
            }

            if (self._observer) {
                self._observer.disconnect();
                self._observer = null;
            }

            $el.css({
                transform:    '',
                transition:   '',
                opacity:      '',
                'will-change': '',
                top:          '',
                bottom:       '',
            });

            $el.removeData(instanceName);

            return this;
        }
    }

    PluginFloatElement.defaults = {
        /* Movement */
        speed:                3,        // divisor — larger value = subtler movement
        horizontal:           false,    // true → translate on X axis instead of Y
        invertDirection:      false,    // flip the translation direction
        startPos:             'top',    // 'top' | 'bottom' | 'none' — sets initial CSS position on the element

        /* Viewport gate */
        minWindowWidth:       991,      // plugin is inactive below this viewport width (px)

        /* Additional transforms — each accepts false or a [from, to] tuple,
           interpolated 0–1 across the normalised scroll position */
        opacity:              false,    // e.g. [1, 0]  — fade out as element scrolls up
        scale:                false,    // e.g. [1, 1.2]
        rotate:               false,    // e.g. [0, 30] (degrees)
        skew:                 false,    // e.g. [0, 8]  (degrees, applied as skewX)

        /* Clamping */
        clamp:                false,    // max absolute translation in %; false = unlimited

        /* Smoothing */
        transition:           false,    // add a CSS transition to ease between ticks
        transitionDuration:   500,      // ms
        transitionDelay:      0,        // ms

        /* Scroll direction filter */
        scrollDirection:      'both',   // 'both' | 'down' | 'up'

        /* Accessibility */
        respectReducedMotion: true,     // honour prefers-reduced-motion

        /* SVG child delegation */
        isInsideSVG:          false,
        style:                null,     // arbitrary inline style applied before plugin runs

        /* Callback */
        onMove:               null,     // (scrollPct: number, transforms: object) => void
    };

    $.extend(themestrap, {
        PluginFloatElement
    });

    $.fn.themestrapPluginFloatElement = function(opts) {
        return this.map(function() {
            const $this = $(this);
            const inst  = $this.data(instanceName);

            /* String command — e.g. $el.themestrapPluginFloatElement('pause') */
            if (typeof opts === 'string') {
                if (inst && typeof inst[opts] === 'function') {
                    inst[opts]();
                }
                return $this;
            }

            return inst ? inst : new PluginFloatElement($this, opts);
        });
    };
})).apply(this, [window.themestrap, jQuery]);
