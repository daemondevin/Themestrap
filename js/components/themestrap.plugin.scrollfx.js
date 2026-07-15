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
                setTimeout(() => this.update(i));
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

                window.removeEventListener('scroll', this.scrollingFx[index]);
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
            let timeout;

            window.addEventListener('resize', () => {
                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    this.setData();

                    this.deltaScrolling = this.deltaScrolling.map((_, i) => {
                        const range = this.computeScrollRange(i);
                        this.update(i);
                        return range;
                    });

                    this.dispatch('scrollFxResized');
                }, 500);
            });
        }

        dispatch(name) {
            this.el.dispatchEvent(new CustomEvent(name));
        }
    }
    
    // expose to scope
    $.extend(themestrap, {
		PluginScrollFx
	});

    // jquery plugin
    $.fn.themestrapPluginScrollFx = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginScrollFx($this, opts);
			}

		});
	}

    // Auto-init
    $('.js-scroll-fx').each(function () {
        const $this = $(this);
        const instance = new PluginScrollFx($this);
        $this.data(instanceName, instance);
    });

    themestrap.ScrollFx = PluginScrollFx;

})).apply(this, [window.themestrap, jQuery]);
