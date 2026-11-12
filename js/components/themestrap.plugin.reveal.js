/**
 * Themestrap Reveal
 *
 * Fades elements in as they scroll into view, and can give a banner a slow parallax drift.
 * Everything is done with element styles set from script, so no stylesheet is injected and the
 * plugin works on pages with a strict Content Security Policy. Elements already on screen when the
 * page loads are left alone, so nothing flashes. Visitors who prefer reduced motion get no effects.
 *
 *   <div data-plugin-reveal data-plugin-options='{"animation":"fadeInUp","delay":100}'>...</div>
 *   <section data-plugin-reveal data-plugin-options='{"parallax":true,"speed":0.3}'>...</section>
 *
 *   $('.card').themestrapPluginReveal({ animation: 'fadeInRight', stagger: 80 });
 *
 * Options
 *   animation  fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight   (default fadeInUp)
 *   distance   pixels the element travels while fading in              (default 28)
 *   duration   milliseconds                                             (default 600)
 *   delay      milliseconds before it starts                            (default 0)
 *   stagger    extra milliseconds for each element that starts appearing with others
 *              (within 100ms): the first waits delay, the second delay + stagger, ...  (default 0)
 *   threshold  how much must be visible, 0 to 1                         (default 0.12)
 *   parallax   true moves the element's background picture more slowly than the page
 *   speed      parallax strength, 0 to 1                                (default 0.3)
 *   target     CSS selector of a child (such as an <img>) to move instead of the background.
 *              Give it extra height in your CSS so its edges never show.
 *
 * The fade runs towards the element's own CSS opacity and transform, so a transform used for
 * centering is kept. When it ends, the element's inline styles are put back as they were.
 *
 * Events (native CustomEvents on the element): ts.reveal.shown
 * Methods: show(wait), destroy(), also by name: $(el).themestrapPluginReveal('destroy')
 */
// Reveal
(((themestrap = {}, $) => {

    const instanceName = '__pluginReveal';
    const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const STYLES = ['opacity', 'transform', 'transition', 'willChange', 'backgroundPosition'];

    // Elements that start appearing within BATCH_MS of each other share one stagger sequence:
    // slot 0, 1, 2 ... in document order, starting again at 0 for the next group. Each element has
    // its own observer and observers report in no fixed order, so the ones that come into view
    // together are collected and numbered once, on the next frame.
    const BATCH_MS = 100;
    let batchStart = -Infinity;
    let batchSize = 0;
    let pending = [];

    function queueShow(instance) {
        if (!pending.length) {
            requestAnimationFrame(flushShows);
        }
        pending.push(instance);
    }

    function flushShows() {
        const list = pending;
        pending = [];

        const now = performance.now();
        if (now - batchStart > BATCH_MS) {
            batchSize = 0;
        }
        batchStart = now;

        list.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
        list.forEach(instance => {
            if (instance.mode === 'reveal' && instance.io) {
                instance.show(instance.options.delay + (batchSize++) * instance.options.stagger);
            }
        });
    }

    function readOptions($el) {
        const raw = $el.data('plugin-options');
        if (themestrap.fn && typeof themestrap.fn.getOptions === 'function') {
            return themestrap.fn.getOptions(raw);
        }
        return $.isPlainObject(raw) ? raw : {};
    }

    class PluginReveal {

        static defaults = {
            animation: 'fadeInUp',
            distance: 28,
            duration: 600,
            delay: 0,
            stagger: 0,
            threshold: 0.12,
            parallax: false,
            speed: 0.3,
            target: ''
        };

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this.el = $el[0];
            this.mode = '';          // 'reveal' or 'parallax' once set up, empty when left alone
            this.saved = null;       // the element's inline styles before Reveal touched them
            this.timer = null;

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
            // data-plugin-options is read even when initialized from script; passed options win
            this.options = $.extend(true, {}, PluginReveal.defaults, readOptions(this.$el), opts, { wrapper: this.$el });
            return this;
        }

        build() {
            if (reduce() || !('IntersectionObserver' in window)) {
                return this;
            }
            if (this.options.parallax) {
                this.buildParallax();
            } else {
                this.buildReveal();
            }
            return this;
        }

        offset() {
            const d = this.options.distance, a = this.options.animation;
            return a === 'fadeInUp' ? [0, d] : a === 'fadeInDown' ? [0, -d] : a === 'fadeInLeft' ? [-d, 0] : a === 'fadeInRight' ? [d, 0] : [0, 0];
        }

        saveStyles(el) {
            const saved = {};
            STYLES.forEach(p => { saved[p] = el.style[p]; });
            return saved;
        }

        restoreStyles(el, saved) {
            STYLES.forEach(p => { el.style[p] = saved[p]; });
        }

        buildReveal() {
            const el = this.el, [x, y] = this.offset();

            // Anything already in view stays as it is
            if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
                return;
            }

            // Fade towards the element's own CSS values, so a CSS opacity or transform is kept
            const cs = getComputedStyle(el);
            this.to = {
                opacity: cs.opacity,
                transform: 'translate3d(0,0,0)' + (cs.transform && cs.transform !== 'none' ? ' ' + cs.transform : '')
            };
            this.saved = this.saveStyles(el);

            el.style.opacity = '0';
            el.style.transform = this.to.transform.replace('translate3d(0,0,0)', 'translate3d(' + x + 'px,' + y + 'px,0)');
            el.style.willChange = 'opacity, transform';
            this.mode = 'reveal';
        }

        buildParallax() {
            const el = this.el, o = this.options;

            this.moved = o.target ? el.querySelector(o.target) : null;
            this.saved = this.saveStyles(el);
            this.movedTransform = this.moved ? this.moved.style.transform : '';
            this.mode = 'parallax';

            let ticking = false;
            this.update = () => {
                ticking = false;
                const r = el.getBoundingClientRect(), shift = Math.round(-r.top * o.speed);
                if (this.moved) {
                    this.moved.style.transform = 'translate3d(0,' + shift + 'px,0)';
                } else {
                    el.style.backgroundPosition = '50% calc(50% + ' + shift + 'px)';
                }
            };
            this.onScroll = () => {
                if (this.inView && !ticking) {
                    ticking = true;
                    requestAnimationFrame(this.update);
                }
            };
            this.update();
        }

        events() {
            const o = this.options;

            if (this.mode === 'reveal') {
                this.io = new IntersectionObserver(entries => {
                    if (entries.some(en => en.isIntersecting) && pending.indexOf(this) < 0) {
                        queueShow(this);
                    }
                }, { threshold: o.threshold });
                this.io.observe(this.el);
            }

            if (this.mode === 'parallax') {
                this.io = new IntersectionObserver(entries => {
                    this.inView = entries[0].isIntersecting;
                    if (this.inView) {
                        this.onScroll();
                    }
                }, { threshold: 0 });
                this.io.observe(this.el);
                window.addEventListener('scroll', this.onScroll, { passive: true });
                window.addEventListener('resize', this.onScroll);
            }

            return this;
        }

        /**
         * Play the fade now, after `wait` milliseconds, and fire ts.reveal.shown.
         * When the fade is over the element's inline styles are put back as they were.
         * @param {number} [wait=0]
         * @returns {PluginReveal}
         */
        show(wait) {
            const el = this.el, o = this.options;
            wait = wait || 0;

            if (this.io && this.mode === 'reveal') {
                this.io.disconnect();
                this.io = null;
            }

            if (this.mode === 'reveal') {
                el.style.transition = 'opacity ' + o.duration + 'ms ease ' + wait + 'ms, transform ' + o.duration + 'ms ease ' + wait + 'ms';
                el.style.opacity = this.to.opacity;
                el.style.transform = this.to.transform;

                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.timer = null;
                    this.restoreStyles(el, this.saved);
                    this.mode = '';
                }, o.duration + wait + 50);
            }

            el.dispatchEvent(new CustomEvent('ts.reveal.shown', { bubbles: true }));
            return this;
        }

        /**
         * Stop observing, remove the parallax listeners and put the inline styles back.
         * An element still waiting to appear is shown at once.
         * @returns {PluginReveal}
         */
        destroy() {
            if (this.io) {
                this.io.disconnect();
                this.io = null;
            }
            clearTimeout(this.timer);
            this.timer = null;

            if (this.onScroll) {
                window.removeEventListener('scroll', this.onScroll);
                window.removeEventListener('resize', this.onScroll);
                this.onScroll = null;
            }

            if (this.saved) {
                this.restoreStyles(this.el, this.saved);
                this.saved = null;
            }
            if (this.moved) {
                this.moved.style.transform = this.movedTransform;
                this.moved = null;
            }

            this.mode = '';
            this.$el.removeData(instanceName);

            return this;
        }
    }

    // expose to scope
    $.extend(themestrap, {
        PluginReveal
    });

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginReveal = function (opts, ...args) {
        return this.map(function () {
            const $this = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
                    return instance[opts](...args);
                }
                return instance;
            }

            return instance || new PluginReveal($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
