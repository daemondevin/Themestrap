// Countdown
(((themestrap = {}, $) => {
    const instanceName = '__pluginCountdown';
    const STYLE_ID = 'themestrap-countdown-styles';

    const CSS = `
.ts-countdown {
	font-family: monospace;
    display: inline-flex;
    align-items: flex-end;
    gap: 0;
    line-height: 1em;
}
.ts-countdown > span {
    visibility: hidden;
    position: relative;
    display: inline-block;
    overflow: hidden;
    height: 1em;
    transition: width 0.4s ease-out 0.2s;
    --value-v: max(0, var(--value, 0));
    --value-hundreds: round(to-zero, var(--value-v) / 100, 1);
    --value-tens: round(to-zero, calc(var(--value-v) - var(--value-hundreds) * 100) / 10, 1);
    --value-ones: calc(var(--value-v) - var(--value-hundreds) * 100 - var(--value-tens) * 10);
    --show-hundreds: clamp(clamp(0, var(--digits, 1) - 2, 1), var(--value-hundreds), 1);
    --show-tens: clamp(clamp(0, var(--digits, 1) - 1, 1), calc(var(--value-tens) + var(--show-hundreds)), 1);
    --first-digits: round(to-zero, var(--value-v) / 10, 1);
    width: calc(1ch + var(--show-tens) * 1ch + var(--show-hundreds) * 1ch);
    direction: ltr;
}
.ts-countdown > span::before,
.ts-countdown > span::after {
    visibility: visible;
    position: absolute;
    overflow: hidden;
    white-space: pre;
    text-align: end;
    direction: rtl;
    font-variant-numeric: tabular-nums;
    content: "00\\A 01\\A 02\\A 03\\A 04\\A 05\\A 06\\A 07\\A 08\\A 09\\A 10\\A 11\\A 12\\A 13\\A 14\\A 15\\A 16\\A 17\\A 18\\A 19\\A 20\\A 21\\A 22\\A 23\\A 24\\A 25\\A 26\\A 27\\A 28\\A 29\\A 30\\A 31\\A 32\\A 33\\A 34\\A 35\\A 36\\A 37\\A 38\\A 39\\A 40\\A 41\\A 42\\A 43\\A 44\\A 45\\A 46\\A 47\\A 48\\A 49\\A 50\\A 51\\A 52\\A 53\\A 54\\A 55\\A 56\\A 57\\A 58\\A 59\\A 60\\A 61\\A 62\\A 63\\A 64\\A 65\\A 66\\A 67\\A 68\\A 69\\A 70\\A 71\\A 72\\A 73\\A 74\\A 75\\A 76\\A 77\\A 78\\A 79\\A 80\\A 81\\A 82\\A 83\\A 84\\A 85\\A 86\\A 87\\A 88\\A 89\\A 90\\A 91\\A 92\\A 93\\A 94\\A 95\\A 96\\A 97\\A 98\\A 99\\A";
    transition: top 1s cubic-bezier(1, 0, 0, 1),
                width 0.2s ease-out 0.2s,
                opacity 0.2s ease-out 0.2s;
}
.ts-countdown > span::before {
    width: calc(1ch + var(--show-hundreds) * 1ch);
    top: calc(var(--first-digits) * -1em);
    inset-inline-end: 0;
    opacity: var(--show-tens);
}
.ts-countdown > span::after {
    width: 1ch;
    top: calc(var(--value-ones) * -1em);
    inset-inline-start: 0;
}
`;

    class PluginCountdown {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this.initialHTML = $el.html();
            this._interval = null;

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
            this.options = $.extend(true, {}, PluginCountdown.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const $el = self.$el;
            const opts = self.options;

            // Inject CSS once
            if (!$('#' + STYLE_ID).length) {
                $('<style>').attr('id', STYLE_ID).text(CSS).appendTo('head');
            }

            // Parse target date
            const targetAttr = $el.attr('data-plugin-countdown-date') || opts.date;
            self._target = targetAttr ? new Date(targetAttr).getTime() : null;

            // Determine display layout from options/attr
            const layout = $el.attr('data-plugin-countdown-layout') || opts.layout;

            // Build the DOM
            self._render(layout);

            // Kick off ticking
            if (self._target) {
                self._tick();
                self._interval = setInterval(() => self._tick(), 1000);
            }

            return this;
        }

        _render(layout) {
            const self = this;
            const $el = self.$el;
            const opts = self.options;
            layout = layout || 'labels-under';

            $el.empty();

            // Build unit list based on options
            const units = [];
            if (opts.showDays)    units.push({ key: 'days',    label: opts.labelDays });
            if (opts.showHours)   units.push({ key: 'hours',   label: opts.labelHours });
            if (opts.showMinutes) units.push({ key: 'minutes', label: opts.labelMinutes });
            if (opts.showSeconds) units.push({ key: 'seconds', label: opts.labelSeconds });

            self._spans = {};

            if (layout === 'clock') {
                // e.g. 10h 24m 59s inline
                const $wrapper = $('<span>').addClass('ts-countdown font-mono');
                units.forEach((u, i) => {
                    const $span = $('<span>').attr({
                        'aria-live': 'polite',
                        'aria-label': '0'
                    }).css('--value', '0');
                    self._spans[u.key] = $span;
                    $wrapper.append($span);
                    if (i < units.length - 1) {
                        $wrapper.append(document.createTextNode(opts.separator));
                    }
                });
                $el.append($wrapper);

            } else if (layout === 'labels-side') {
                // number LABEL number LABEL ...
                const $wrapper = $('<span>').addClass('ts-countdown font-mono ' + opts.fontSize);
                units.forEach((u, i) => {
                    const $span = $('<span>').attr({
                        'aria-live': 'polite',
                        'aria-label': '0'
                    }).css('--value', '0');
                    self._spans[u.key] = $span;
                    $wrapper.append($span);
                    $wrapper.append(document.createTextNode('\u00a0' + u.label));
                    if (i < units.length - 1) {
                        $wrapper.append(document.createTextNode('\u00a0'));
                    }
                });
                $el.append($wrapper);

            } else if (layout === 'boxes') {
                // grid of boxed units, label under
                const $grid = $('<div>').css({ display: 'flex', gap: opts.gap, textAlign: 'center' });
                units.forEach(u => {
                    const $box = $('<div>').addClass('ts-countdown-box').css({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: opts.boxPadding,
                        background: opts.boxBg,
                        borderRadius: opts.boxRadius,
                        color: opts.boxColor
                    });
                    const $wrap = $('<span>').addClass('ts-countdown font-mono ' + opts.fontSize);
                    const $span = $('<span>').attr({
                        'aria-live': 'polite',
                        'aria-label': '0'
                    }).css('--value', '0');
                    if (opts.minDigits >= 2) $span.css('--digits', opts.minDigits);
                    self._spans[u.key] = $span;
                    $wrap.append($span);
                    const $label = $('<span>').addClass('ts-countdown-label').text(u.label);
                    $box.append($wrap).append($label);
                    $grid.append($box);
                });
                $el.append($grid);

            } else {
                // default: labels-under (grid layout)
                const $grid = $('<div>').css({ display: 'flex', gap: opts.gap, textAlign: 'center' });
                units.forEach(u => {
                    const $col = $('<div>').css({ display: 'flex', flexDirection: 'column', alignItems: 'center' });
                    const $wrap = $('<span>').addClass('ts-countdown font-mono ' + opts.fontSize);
                    const $span = $('<span>').attr({
                        'aria-live': 'polite',
                        'aria-label': '0'
                    }).css('--value', '0');
                    if (opts.minDigits >= 2) $span.css('--digits', opts.minDigits);
                    self._spans[u.key] = $span;
                    $wrap.append($span);
                    const $label = $('<span>').addClass('ts-countdown-label').text(u.label);
                    $col.append($wrap).append($label);
                    $grid.append($col);
                });
                $el.append($grid);
            }
        }

        _tick() {
            const self = this;
            const now = Date.now();
            let diff = Math.max(0, Math.floor((self._target - now) / 1000));

            if (diff === 0 && self._interval) {
                clearInterval(self._interval);
                self._interval = null;
                self.$el.trigger('ts.countdown.finished');
            }

            const days    = Math.floor(diff / 86400);
            diff -= days * 86400;
            const hours   = Math.floor(diff / 3600);
            diff -= hours * 3600;
            const minutes = Math.floor(diff / 60);
            const seconds = diff - minutes * 60;

            const vals = { days, hours, minutes, seconds };

            $.each(self._spans, (key, $span) => {
                if (!$span) return;
                const v = vals[key] || 0;
                $span.css('--value', v).attr('aria-label', v);
                $span[0].textContent = v;
            });
        }

        // Public API

        /**
         * Set a new target date and restart the countdown.
         * @param {string|Date} date
         */
        setDate(date) {
            const self = this;
            if (self._interval) clearInterval(self._interval);
            self._target = new Date(date).getTime();
            self._tick();
            self._interval = setInterval(() => self._tick(), 1000);
            return this;
        }

        /**
         * Pause the countdown.
         */
        pause() {
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }
            return this;
        }

        /**
         * Resume a paused countdown.
         */
        resume() {
            if (!this._interval && this._target) {
                this._tick();
                this._interval = setInterval(() => this._tick(), 1000);
            }
            return this;
        }

        events() {
            return this;
        }

        destroy() {
            const self = this;
            if (self._interval) clearInterval(self._interval);
            self.$el.html(self.initialHTML).removeData(instanceName);
            return this;
        }
    }

    PluginCountdown.defaults = {
        date:        null,           // ISO date string or Date object
        layout:      'labels-under', // 'labels-under' | 'labels-side' | 'clock' | 'boxes'
        fontSize:    'text-5xl',     // Bootstrap/utility font size class on .ts-countdown
        gap:         '1rem',         // CSS gap between units
        separator:   ':',            // separator character for 'clock' layout
        minDigits:   2,              // set --digits on inner spans (1 | 2 | 3)
        showDays:    true,
        showHours:   true,
        showMinutes: true,
        showSeconds: true,
        labelDays:    'days',
        labelHours:   'hours',
        labelMinutes: 'min',
        labelSeconds: 'sec',
        // box layout extras
        boxBg:      'var(--ts-navy, #0a1929)',
        boxColor:   '#fff',
        boxPadding: '0.5rem 1rem',
        boxRadius:  '0.5rem',
    };

    $.extend(themestrap, { PluginCountdown });

    $.fn.themestrapPluginCountdown = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions) opts = $.extend({}, opts, pluginOptions);
                return new PluginCountdown($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
