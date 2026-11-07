/**
 * Themestrap Transfer Plugin
 * Live progress for downloads, uploads, file copies and other long jobs:
 * bytes done and total, smoothed speed, time left, job states, an
 * indeterminate mode and an optional cancel button.
 * Part of the Themestrap component library for MODX 3
 *
 * Markup anatomy:
 *
 *   <!-- Empty element: the plugin builds the inner markup -->
 *   <div data-plugin-transfer id="dl-ubuntu"
 *        data-plugin-options='{"label": "ubuntu-26.04-desktop-amd64.iso", "total": 6200000000, "cancelable": true}'>
 *   </div>
 *
 *   Built structure (all parts hide themselves when empty):
 *
 *   .ts-transfer.is-idle|is-running|is-paused|is-done|is-failed|is-cancelled[.is-indeterminate]
 *   ├── .ts-transfer-head
 *   │   ├── .ts-transfer-label
 *   │   ├── .ts-transfer-percent
 *   │   └── button.ts-transfer-cancel          (cancelable: true)
 *   ├── .ts-transfer-track[role=progressbar]
 *   │   └── .ts-transfer-bar
 *   └── .ts-transfer-meta
 *       ├── .ts-transfer-bytes                  "2.1 GiB of 5.8 GiB"
 *       ├── .ts-transfer-speed                  "38.2 MiB/s"
 *       ├── .ts-transfer-eta                    "1m 37s left"
 *       └── .ts-transfer-message                state text or setMessage()
 *
 * Options (data-plugin-options JSON or JS object):
 *
 *   label        ''          heading text (always set as text, never HTML)
 *   message      ''          initial message line
 *   total        null        total bytes; null or 0 means unknown
 *   done         0           bytes already done (e.g. a resumed download)
 *   units        'iec'       'iec' (KiB, MiB: 1024) or 'si' (kB, MB: 1000)
 *   decimals     1           decimals for byte and speed values
 *   showPercent  true
 *   showBytes    true
 *   showSpeed    true
 *   showEta      true
 *   cancelable   false       render a cancel button (fires transfer:cancel)
 *   cancelText   'Cancel'
 *   smoothing    0.3         speed EMA weight of the newest sample (0..1)
 *   sampleMs     400         minimum time between speed samples
 *   stateText    { idle: '', running: '', paused: 'Paused', done: 'Done',
 *                  failed: 'Failed', cancelled: 'Cancelled' }
 *   onProgress   null        function(info)  info = { done, total, percent, speed, eta }
 *   onState      null        function(state, previous)
 *   onCancel     null        function()      return false to keep the button enabled
 *
 * Public API (via stored instance):
 *   const t = $('#dl-ubuntu').data('__pluginTransfer');
 *   t.update(2100000000);                         // bytes done; speed and ETA derived
 *   t.update(2100000000, 6200000000);             // done and total
 *   t.update({ done, total, speed });             // speed (bytes/s) from the producer
 *   t.setIndeterminate(true);                     // unknown progress (e.g. verifying)
 *   t.setState('done', 'Checksum OK');            // idle|running|paused|done|failed|cancelled
 *   t.setLabel('New label');
 *   t.setMessage('Retrying in 4s');               // '' clears it
 *   t.getInfo();                                  // { done, total, percent, speed, eta, state }
 *   t.reset();                                    // back to idle, zero bytes
 *   t.destroy();                                  // restore original markup
 *
 * Static helpers:
 *   themestrap.PluginTransfer.formatBytes(1536, 'iec', 1)  // "1.5 KiB"
 *   themestrap.PluginTransfer.formatDuration(97)          // "1m 37s"
 *
 * Events fired on the root element (jQuery):
 *   transfer:progress  [instance, info]
 *   transfer:state     [instance, state, previous]
 *   transfer:complete  [instance]                  state became 'done'
 *   transfer:cancel    [instance]                  cancel button clicked
 *
 * Theming (CSS custom properties). The defaults are declared with
 * :where(.ts-transfer), so a plain .ts-transfer { ... } rule in your theme
 * overrides them regardless of load order:
 *   --ts-transfer-bar, --ts-transfer-track, --ts-transfer-done,
 *   --ts-transfer-failed, --ts-transfer-paused, --ts-transfer-muted,
 *   --ts-transfer-height, --ts-transfer-radius, --ts-transfer-gap,
 *   --ts-transfer-font, --ts-transfer-mono
 *
 * Init.js wiring (DOMReady-immediate: producers call update() whether or not
 * the element has scrolled into view, so it must not wait for an observer):
 *   if (typeof $.fn['themestrapPluginTransfer'] === 'function' && $('[data-plugin-transfer]').length) {
 *       $(() => {
 *           $('[data-plugin-transfer]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginTransfer(opts);
 *           });
 *       });
 *   }
 */
// Transfer
(((themestrap = {}, $) => {
    const instanceName = '__pluginTransfer';
    const STATES = ['idle', 'running', 'paused', 'done', 'failed', 'cancelled'];

    // Injected stylesheet, added once on first build so pages that only load
    // the script get no extra CSS.
    const STYLE_ID = 'ts-transfer-styles';
    const CSS_TEXT = `
/* Tokens sit in :where() (zero specificity) so any theme rule overrides them. */
:where(.ts-transfer) {
    --ts-transfer-bar: var(--ts-skin-accent, var(--bs-primary, #0088cc));
    --ts-transfer-track: var(--ts-skin-surface-2, rgba(127, 127, 127, .2));
    --ts-transfer-done: var(--ts-skin-success, var(--bs-success, #198754));
    --ts-transfer-failed: var(--ts-skin-danger, var(--bs-danger, #dc3545));
    --ts-transfer-paused: var(--ts-skin-warning, var(--bs-warning, #ffc107));
    --ts-transfer-muted: var(--ts-skin-text-dim, var(--bs-secondary-color, #6c757d));
    --ts-transfer-height: 4px;
    --ts-transfer-radius: 999px;
    --ts-transfer-gap: 6px;
    --ts-transfer-font: var(--ts-skin-font, inherit);
    --ts-transfer-mono: ui-monospace, "Cascadia Mono", Consolas, monospace;
}
.ts-transfer {
    display: flex;
    flex-direction: column;
    gap: var(--ts-transfer-gap);
    font-family: var(--ts-transfer-font);
    min-width: 0;
}
.ts-transfer-head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}
.ts-transfer-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
}
.ts-transfer-percent {
    font-family: var(--ts-transfer-mono);
    font-size: .85em;
    color: var(--ts-transfer-muted);
    font-variant-numeric: tabular-nums;
}
.ts-transfer-cancel {
    margin-left: auto;
    font: inherit;
    font-size: .85em;
    line-height: 1.2;
    padding: 3px 10px;
    border-radius: 6px;
    border: 1px solid currentColor;
    background: transparent;
    color: var(--ts-transfer-muted);
    cursor: pointer;
}
.ts-transfer-cancel:hover:not(:disabled) { color: var(--ts-transfer-failed); }
.ts-transfer-cancel:disabled { opacity: .5; cursor: default; }
.ts-transfer-track {
    position: relative;
    height: var(--ts-transfer-height);
    border-radius: var(--ts-transfer-radius);
    background: var(--ts-transfer-track);
    overflow: hidden;
}
.ts-transfer-bar {
    height: 100%;
    width: 0;
    border-radius: inherit;
    background: var(--ts-transfer-bar);
    transition: width .2s linear, background-color .2s ease;
}
.ts-transfer.is-indeterminate .ts-transfer-bar,
.ts-transfer.is-unknown .ts-transfer-bar {
    width: 30%;
    animation: ts-transfer-slide 1.1s ease-in-out infinite;
}
@keyframes ts-transfer-slide {
    from { transform: translateX(-100%); }
    to   { transform: translateX(340%); }
}
.ts-transfer.is-done      .ts-transfer-bar { background: var(--ts-transfer-done); }
.ts-transfer.is-failed    .ts-transfer-bar { background: var(--ts-transfer-failed); }
.ts-transfer.is-paused    .ts-transfer-bar,
.ts-transfer.is-cancelled .ts-transfer-bar { background: var(--ts-transfer-paused); }
.ts-transfer-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-family: var(--ts-transfer-mono);
    font-size: .82em;
    color: var(--ts-transfer-muted);
    font-variant-numeric: tabular-nums;
    min-width: 0;
}
.ts-transfer.is-done   .ts-transfer-message { color: var(--ts-transfer-done); }
.ts-transfer.is-failed .ts-transfer-message { color: var(--ts-transfer-failed); font-family: var(--ts-transfer-font); }
.ts-transfer-message { overflow-wrap: anywhere; white-space: pre-line; }
.ts-transfer-label:empty, .ts-transfer-percent:empty, .ts-transfer-bytes:empty,
.ts-transfer-speed:empty, .ts-transfer-eta:empty, .ts-transfer-message:empty { display: none; }
.ts-transfer-head:not(:has(> :not(:empty))) { display: none; }
.ts-transfer-meta:not(:has(> :not(:empty))) { display: none; }
@media (prefers-reduced-motion: reduce) {
    .ts-transfer-bar { transition: none; }
    .ts-transfer.is-indeterminate .ts-transfer-bar,
    .ts-transfer.is-unknown .ts-transfer-bar { animation: none; width: 100%; opacity: .5; }
}
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginTransfer {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this.initialHTML = $el.html();
            this.initialClass = $el.attr('class') || '';

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
            this.options = $.extend(true, {}, PluginTransfer.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const o = self.options;
            injectStyles();

            self.state = 'idle';
            self.indeterminate = false;
            self.total = o.total > 0 ? Number(o.total) : null;
            self.done = Number(o.done) || 0;
            self.speed = 0;
            self._sample = null;
            self._frame = null;

            const $head = $('<div class="ts-transfer-head"></div>');
            self.$label = $('<span class="ts-transfer-label"></span>').text(o.label || '');
            self.$percent = $('<span class="ts-transfer-percent"></span>');
            $head.append(self.$label, self.$percent);
            if (o.cancelable) {
                self.$cancel = $('<button type="button" class="ts-transfer-cancel"></button>').text(o.cancelText);
                $head.append(self.$cancel);
            }

            self.$track = $('<div class="ts-transfer-track" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>');
            self.$bar = $('<div class="ts-transfer-bar"></div>');
            self.$track.append(self.$bar);
            if (o.label) self.$track.attr('aria-label', o.label);

            const $meta = $('<div class="ts-transfer-meta"></div>');
            self.$bytes = $('<span class="ts-transfer-bytes"></span>');
            self.$speed = $('<span class="ts-transfer-speed"></span>');
            self.$eta = $('<span class="ts-transfer-eta"></span>');
            self.$message = $('<span class="ts-transfer-message" aria-live="polite"></span>').text(o.message || '');
            $meta.append(self.$bytes, self.$speed, self.$eta, self.$message);

            self.$el
                .addClass('ts-transfer is-idle')
                .empty()
                .append($head, self.$track, $meta);

            self._render();
            return this;
        }

        events() {
            const self = this;
            if (self.$cancel) {
                self.$el.on('click.transfer', '.ts-transfer-cancel', (e) => {
                    e.preventDefault();
                    if (self.$cancel.prop('disabled')) return;
                    const keep = typeof self.options.onCancel === 'function'
                        && self.options.onCancel.call(self) === false;
                    if (!keep) self.$cancel.prop('disabled', true);
                    self.$el.trigger('transfer:cancel', [self]);
                });
            }
            return this;
        }

        // Accepts update(done), update(done, total) or update({ done, total, speed }).
        update(done, total) {
            const self = this;
            let explicitSpeed = null;

            if (done !== null && typeof done === 'object') {
                if (done.total !== undefined) total = done.total;
                if (done.speed !== undefined) explicitSpeed = Number(done.speed);
                done = done.done;
            }
            if (total !== undefined) {
                self.total = total > 0 ? Number(total) : null;
            }
            done = Math.max(0, Number(done) || 0);

            if (explicitSpeed !== null && isFinite(explicitSpeed)) {
                self.speed = Math.max(0, explicitSpeed);
                self._sample = { t: performance.now(), done };
            } else {
                self._sampleSpeed(done);
            }
            self.done = done;

            if (self.state === 'idle' || self.state === 'paused') {
                self.setState('running');
            }
            if (self.indeterminate && self.total) {
                self.setIndeterminate(false);
            }

            self._schedule();
            const info = self.getInfo();
            if (typeof self.options.onProgress === 'function') self.options.onProgress.call(self, info);
            self.$el.trigger('transfer:progress', [self, info]);
            return this;
        }

        setIndeterminate(on) {
            this.indeterminate = !!on;
            this.$el.toggleClass('is-indeterminate', this.indeterminate);
            this._schedule();
            return this;
        }

        setState(state, message) {
            const self = this;
            if (!STATES.includes(state)) return this;
            const previous = self.state;
            self.state = state;
            self.$el
                .removeClass(STATES.map((s) => `is-${s}`).join(' '))
                .addClass(`is-${state}`);

            if (state !== 'running') {
                self.speed = 0;
                self._sample = null;
            }
            if (state === 'done') {
                self.indeterminate = false;
                self.$el.removeClass('is-indeterminate');
                if (self.total) self.done = self.total;
            }
            if (self.$cancel) {
                self.$cancel.prop('disabled', ['done', 'failed', 'cancelled'].includes(state));
                self.$cancel.toggle(state !== 'done');
            }

            const text = message !== undefined ? message : (self.options.stateText[state] || '');
            self.$message.text(text);
            self._schedule();

            if (previous !== state) {
                if (typeof self.options.onState === 'function') self.options.onState.call(self, state, previous);
                self.$el.trigger('transfer:state', [self, state, previous]);
                if (state === 'done') self.$el.trigger('transfer:complete', [self]);
            }
            return this;
        }

        setLabel(text) {
            this.$label.text(text || '');
            this.$track.attr('aria-label', text || null);
            return this;
        }

        setMessage(text) {
            this.$message.text(text || '');
            return this;
        }

        getInfo() {
            const total = this.total;
            const percent = total ? Math.min(100, (this.done / total) * 100) : null;
            const eta = total && this.speed > 0 && this.state === 'running'
                ? Math.max(0, (total - this.done) / this.speed)
                : null;
            return { done: this.done, total, percent, speed: this.speed, eta, state: this.state };
        }

        reset() {
            const self = this;
            self.done = 0;
            self.total = self.options.total > 0 ? Number(self.options.total) : null;
            self.speed = 0;
            self._sample = null;
            self.setIndeterminate(false);
            if (self.$cancel) self.$cancel.prop('disabled', false).show();
            self.setState('idle', self.options.message || '');
            return this;
        }

        destroy() {
            const self = this;
            if (self._frame) cancelAnimationFrame(self._frame);
            self.$el
                .off('.transfer')
                .removeData(instanceName)
                .attr('class', self.initialClass)
                .html(self.initialHTML);
            return this;
        }

        // Exponential moving average over samples at least sampleMs apart.
        _sampleSpeed(done) {
            const self = this;
            const now = performance.now();
            const s = self._sample;
            if (!s || done < s.done) {
                self._sample = { t: now, done };
                if (!s) self.speed = 0;
                return;
            }
            const dt = now - s.t;
            if (dt < self.options.sampleMs) return;
            const instant = ((done - s.done) / dt) * 1000;
            const a = Math.min(1, Math.max(0, Number(self.options.smoothing)));
            self.speed = self.speed > 0 ? self.speed * (1 - a) + instant * a : instant;
            self._sample = { t: now, done };
        }

        // Coalesce DOM writes to one per animation frame.
        _schedule() {
            const self = this;
            if (self._frame) return;
            const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
            self._frame = raf(() => {
                self._frame = null;
                self._render();
            });
        }

        _render() {
            const self = this;
            const o = self.options;
            const info = self.getInfo();
            const fmt = (n) => PluginTransfer.formatBytes(n, o.units, o.decimals);

            // Running with no known total: animate like indeterminate mode.
            self.$el.toggleClass('is-unknown', self.state === 'running' && !info.total);

            if (self.indeterminate || info.percent === null) {
                self.$bar.css('width', self.state === 'done' ? '100%' : '');
                self.$track.removeAttr('aria-valuenow');
                self.$percent.text('');
            } else {
                self.$bar.css('width', `${info.percent.toFixed(2)}%`);
                self.$track.attr('aria-valuenow', Math.round(info.percent));
                self.$percent.text(o.showPercent ? `${info.percent.toFixed(info.percent < 10 ? 1 : 0)}%` : '');
            }

            let bytes = '';
            if (o.showBytes && (self.done > 0 || (info.total && self.state !== 'idle'))) {
                bytes = info.total ? `${fmt(self.done)} of ${fmt(info.total)}` : fmt(self.done);
            }
            self.$bytes.text(bytes);

            const running = self.state === 'running' && !self.indeterminate;
            self.$speed.text(o.showSpeed && running && info.speed > 0 ? `${fmt(info.speed)}/s` : '');
            self.$eta.text(o.showEta && running && info.eta !== null && info.eta > 0
                ? `${PluginTransfer.formatDuration(info.eta)} left`
                : '');
        }

        static formatBytes(n, units = 'iec', decimals = 1) {
            if (n === null || n === undefined || !isFinite(n)) return '';
            const si = units === 'si';
            const base = si ? 1000 : 1024;
            const names = si ? ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
            let value = Math.abs(n);
            let i = 0;
            while (value >= base && i < names.length - 1) {
                value /= base;
                i++;
            }
            const sign = n < 0 ? '-' : '';
            return `${sign}${i === 0 ? Math.round(value) : value.toFixed(decimals)} ${names[i]}`;
        }

        static formatDuration(seconds) {
            if (!isFinite(seconds) || seconds < 0) return '';
            const s = Math.round(seconds);
            if (s < 60) return `${s}s`;
            if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
            const h = Math.floor(s / 3600);
            const m = Math.round((s % 3600) / 60);
            return m === 60 ? `${h + 1}h 0m` : `${h}h ${m}m`;
        }
    }

    PluginTransfer.defaults = {
        label: '',
        message: '',
        total: null,
        done: 0,
        units: 'iec',
        decimals: 1,
        showPercent: true,
        showBytes: true,
        showSpeed: true,
        showEta: true,
        cancelable: false,
        cancelText: 'Cancel',
        smoothing: 0.3,
        sampleMs: 400,
        stateText: {
            idle: '',
            running: '',
            paused: 'Paused',
            done: 'Done',
            failed: 'Failed',
            cancelled: 'Cancelled'
        },
        onProgress: null,
        onState: null,
        onCancel: null
    };

    $.extend(themestrap, {
        PluginTransfer
    });

    $.fn.themestrapPluginTransfer = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginTransfer($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
