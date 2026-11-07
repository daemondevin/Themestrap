(((themestrap = {}, $) => {
    const instanceName = '__scrollFx';

    class PluginScrollFx {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el = $el;
            this.el = $el[0];
            this._origStyle = $el.attr('style');
            this._origTheme = $el.attr('data-theme');
            this._timers = [];

            // setData() below only measures, so the instance is stored here
            $el.data(instanceName, this);

            this.options = [];
            this.scrollingFx = [];
            this.animating = [];
            this.deltaScrolling = [];
            this.observer = [];

            this.setData()
                .setOptions(opts)
                .setup();

            return this;
        }

        setData() {
            this.boundingRect = this.el.getBoundingClientRect();
            this.windowHeight = window.innerHeight;
            return this;
        }

        setOptions(opts) {
            this.settings = Object.assign({
                scrollableSelector: this.$el.attr('data-scrollable-element') || null
            }, opts);

            this.scrollableElement = this.settings.scrollableSelector
                ? document.querySelector(this.settings.scrollableSelector)
                : null;

            return this;
        }

        setup() {
            // Respect reduced motion
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            this.collectOptions();
            this.initObservers();
            this.bindResize();

            this.dispatch('scrollFxReady');

            return this;
        }

        collectOptions() {
            const base = this.el.getAttribute('data-scroll-fx');

            if (base) {
                this.options.push(this.parseOption(base));
            } else {
                let i = 1;
                let attr;

                while ((attr = this.el.getAttribute(`data-scroll-fx-${i}`))) {
                    this.options.push(this.parseOption(attr));
                    i++;
                }
            }
        }

        initObservers() {
            this.options.forEach((opt, i) => {
                this.scrollingFx[i] = null;
                this.animating[i] = false;
                this.deltaScrolling[i] = this.computeScrollRange(i);

                this.observer[i] = new IntersectionObserver((entries) => {
                    this.handleIntersection(i, entries);
                }, {
                    rootMargin: `${opt[5] - 100}% 0px ${-opt[4]}% 0px`
                });

                this.observer[i].observe(this.el);

                // Initial run
                this._timers.push(setTimeout(() => this.update(i)));
            });
        }

        handleIntersection(index, entries) {
            const entry = entries[0];

            if (entry.isIntersecting) {
                if (this.scrollingFx[index]) return;

                this.setData();
                this.deltaScrolling[index] = this.computeScrollRange(index);

                this.scrollingFx[index] = this.update.bind(this, index);

                (this.scrollableElement || window)
                    .addEventListener('scroll', this.scrollingFx[index]);

            } else {
                if (!this.scrollingFx[index]) return;

                (this.scrollableElement || window)
                    .removeEventListener('scroll', this.scrollingFx[index]);
                this.scrollingFx[index] = null;
            }
        }

        update(index) {
            const scroll = this.getScroll();
            const [start, end] = this.deltaScrolling[index];

            if (scroll < start) {
                this.apply(index, this.options[index][1]);
                return;
            }

            if (scroll > end) {
                this.apply(index, this.options[index][2]);
                return;
            }

            if (this.animating[index]) return;

            this.animating[index] = true;

            requestAnimationFrame(() => {
                const opt = this.options[index];
                let value;

                if (isNaN(opt[1])) {
                    value = scroll >= end ? opt[2] : opt[1];
                } else {
                    const progress = (scroll - start) / (end - start);
                    value = opt[1] + (opt[2] - opt[1]) * progress;
                }

                this.apply(index, value);
                this.animating[index] = false;
            });
        }

        apply(index, value) {
            const opt = this.options[index];
            const property = opt[0];

            if (isNaN(value)) {
                if (this.el.getAttribute('data-theme') !== value) {
                    this.el.classList.add('scroll-fx--theme-transition');
                    this.el.offsetWidth;

                    this.el.setAttribute('data-theme', value);

                    this.el.addEventListener('transitionend', () => {
                        this.el.classList.remove('scroll-fx--theme-transition');
                    }, { once: true });
                }
                return;
            }

            const unit = opt[3];

            if (property === '--scroll-fx-skew' || property === '--scroll-fx-scale') {
                this.el.style.setProperty(`${property}-x`, value + unit);
                this.el.style.setProperty(`${property}-y`, value + unit);
            } else {
                this.el.style.setProperty(property, value + unit);
            }
        }

        parseOption(str) {
            const parts = str.split(',').map(s => s.trim());

            const parseValues = (a, b) => {
                let start = parseFloat(a);
                let end = parseFloat(b);
                let unit = a.replace(start, '');

                if (isNaN(start)) {
                    start = a;
                    end = b;
                    unit = '';
                }

                return [start, end, unit];
            };

            const prop = this.normalizeProperty(parts[0]);
            const [start, end, unit] = parseValues(parts[1], parts[2]);

            return [prop, start, end, unit, parseInt(parts[3]), parseInt(parts[4])];
        }

        normalizeProperty(name) {
            let prop = '--scroll-fx-';

            for (let i = 0; i < name.length; i++) {
                prop += name[i] === name[i].toUpperCase()
                    ? '-' + name[i].toLowerCase()
                    : name[i];
            }

            if (prop === '--scroll-fx-rotate') prop = '--scroll-fx-rotate-z';
            if (prop === '--scroll-fx-translate') prop = '--scroll-fx-translate-x';

            return prop;
        }

        computeScrollRange(index) {
            const opt = this.options[index];
            const scroll = this.getScroll();

            return [
                scroll - (this.windowHeight - (this.windowHeight + this.boundingRect.height) * opt[4] / 100) + this.boundingRect.top,
                scroll - (this.windowHeight - (this.windowHeight + this.boundingRect.height) * opt[5] / 100) + this.boundingRect.top
            ];
        }

        getScroll() {
            return this.scrollableElement
                ? this.scrollableElement.scrollTop
                : window.scrollY;
        }

        bindResize() {
            this._onResize = () => {
                clearTimeout(this._resizeTimer);

                this._resizeTimer = setTimeout(() => {
                    this.setData();

                    this.deltaScrolling = this.deltaScrolling.map((_, i) => {
                        const range = this.computeScrollRange(i);
                        this.update(i);
                        return range;
                    });

                    this.dispatch('scrollFxResized');
                }, 500);
            };

            window.addEventListener('resize', this._onResize);
        }

        dispatch(name) {
            this.el.dispatchEvent(new CustomEvent(name));
        }

        /**
         * Disconnect the observers, remove the scroll and resize listeners and
         * restore the element's original style and data-theme.
         * @returns {PluginScrollFx}
         */
        destroy() {
            const target = this.scrollableElement || window;

            this.observer.forEach(observer => observer && observer.disconnect());
            this.scrollingFx.forEach(handler => handler && target.removeEventListener('scroll', handler));
            this.observer = [];
            this.scrollingFx = [];

            if (this._onResize) {
                window.removeEventListener('resize', this._onResize);
                this._onResize = null;
            }
            clearTimeout(this._resizeTimer);
            this._timers.forEach(clearTimeout);
            this._timers = [];

            this.el.classList.remove('scroll-fx--theme-transition');
            if (this._origStyle === undefined) {
                this.$el.removeAttr('style');
            } else {
                this.$el.attr('style', this._origStyle);
            }
            if (this._origTheme === undefined) {
                this.$el.removeAttr('data-theme');
            } else {
                this.$el.attr('data-theme', this._origTheme);
            }

            this.$el.removeData(instanceName);

            return this;
        }
    }
    
    // expose to scope
    $.extend(themestrap, {
		PluginScrollFx
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginScrollFx = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginScrollFx($this, opts);
		});
	};

    // Auto-init
    $('.js-scroll-fx:not(.manual)').each(function () {
        $(this).themestrapPluginScrollFx();
    });

    themestrap.ScrollFx = PluginScrollFx;

})).apply(this, [window.themestrap, jQuery]);
