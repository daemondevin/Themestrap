// Chart Circular
(((themestrap = {}, $) => {
    const instanceName = '__chartCircular';

    class PluginChartCircular {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el        = $el;
            this.initialHTML = $el.html();
            this._rafId      = null;
            this._timer      = null;

            this
                .setData()
                .setOptions(opts)
                .build();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginChartCircular.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const $el  = self.options.wrapper;
            const o    = self.options;

            self._target    = parseFloat($el.attr('data-percent')) || 0;
            self.$percentEl = $el.find('.percent');

            /* Create a HiDPI-aware canvas */
            const dpr    = window.devicePixelRatio || 1;
            const canvas = document.createElement('canvas');

            canvas.width  = o.size * dpr;
            canvas.height = o.size * dpr;
            canvas.style.width  = o.size + 'px';
            canvas.style.height = o.size + 'px';
            canvas.style.display = 'block';

            self.canvas = canvas;
            self.ctx    = canvas.getContext('2d');
            self.ctx.scale(dpr, dpr);

            /* Insert canvas before any existing children so overlay divs stay on top */
            $el.prepend(canvas);

            self._draw(0);

            self._timer = setTimeout(function() {
                self._animate(self._target);
            }, o.delay);

            return this;
        }

        _draw(pct) {
            const self = this;
            const o    = self.options;
            const ctx  = self.ctx;
            const size = o.size;
            const lw   = o.lineWidth;

            /* Arc sits inside the canvas bounds; inset by half stroke-width */
            const radius = (size / 2) - (lw / 2);
            const cx     = size / 2;
            const cy     = size / 2;

            /* 0% starts at top (–π/2), rotate shifts that origin */
            const origin   = -(Math.PI / 2) + (o.rotate * Math.PI / 180);
            const endAngle = origin + ((pct / 100) * 2 * Math.PI);

            ctx.clearRect(0, 0, size, size);

            /* Track — full circle behind the bar */
            if (o.trackColor !== false) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = o.trackColor;
                ctx.lineWidth   = lw;
                ctx.lineCap     = 'butt';
                ctx.stroke();
            }

            /* Scale tick marks — drawn at the outer edge of the track ring */
            if (o.scaleColor !== false) {
                const ticks = 24;
                ctx.save();
                ctx.strokeStyle = o.scaleColor;
                ctx.lineWidth   = 1;
                for (let i = 0; i < ticks; i++) {
                    const a   = (i / ticks) * 2 * Math.PI - (Math.PI / 2);
                    const cos = Math.cos(a);
                    const sin = Math.sin(a);
                    const r0  = radius + (lw / 2) + 2;
                    const r1  = r0 + o.scaleLength;
                    ctx.beginPath();
                    ctx.moveTo(cx + cos * r0, cy + sin * r0);
                    ctx.lineTo(cx + cos * r1, cy + sin * r1);
                    ctx.stroke();
                }
                ctx.restore();
            }

            /* Progress arc */
            if (pct > 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, origin, endAngle);
                ctx.strokeStyle = o.barColor;
                ctx.lineWidth   = lw;
                ctx.lineCap     = o.lineCap;
                ctx.stroke();
            }
        }

        _animate(target) {
            const self     = this;
            const o        = self.options;
            const duration = o.animate.enabled ? o.animate.duration : 0;

            /* Skip rAF loop entirely when animation is disabled */
            if (duration <= 0) {
                self._draw(target);
                if (self.$percentEl.length) {
                    self.$percentEl.text(Math.round(target));
                }
                return;
            }

            const startTime = performance.now();

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function frame(now) {
                const elapsed  = now - startTime;
                const raw      = Math.min(elapsed / duration, 1);
                const current  = easeOutCubic(raw) * target;

                self._draw(current);

                if (self.$percentEl.length) {
                    self.$percentEl.text(Math.round(current));
                }

                if (raw < 1) {
                    self._rafId = requestAnimationFrame(frame);
                } else {
                    self._rafId = null;
                    /* Snap to exact final values */
                    self._draw(target);
                    if (self.$percentEl.length) {
                        self.$percentEl.text(Math.round(target));
                    }
                }
            }

            self._rafId = requestAnimationFrame(frame);
        }

        destroy() {
            const self = this;

            if (self._rafId !== null) {
                cancelAnimationFrame(self._rafId);
                self._rafId = null;
            }

            if (self._timer !== null) {
                clearTimeout(self._timer);
                self._timer = null;
            }

            self.$el.html(self.initialHTML).removeData(instanceName);

            return this;
        }
    }

    PluginChartCircular.defaults = {
        delay:      1,
        barColor:   '#0088CC',
        trackColor: '#f2f2f2',
        scaleColor:  false,
        scaleLength: 5,
        lineCap:    'round',
        lineWidth:  13,
        size:       175,
        rotate:     0,
        animate: {
            duration: 2500,
            enabled:  true
        }
    };

    $.extend(themestrap, {
        PluginChartCircular
    });

    $.fn.themestrapPluginChartCircular = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginChartCircular($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);