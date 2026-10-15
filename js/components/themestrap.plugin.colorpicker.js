// Color Picker
(((themestrap = {}, $) => {

    const instanceName  = '__pluginColorPicker';
    const STYLE_ID      = 'themestrap-color-picker-styles';
    let   instanceCount = 0;

    // Color math utilities
    const Color = {

        hexToRgb(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return null;
            const n = parseInt(hex, 16);
            if (isNaN(n)) return null;
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        },

        rgbToHex({ r, g, b }) {
            return '#' + [r, g, b]
                .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
                .join('');
        },

        rgbToHsv({ r, g, b }) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
            let h = 0;
            const s = max === 0 ? 0 : d / max;
            const v = max;
            if (max !== min) {
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return { h: h * 360, s: s * 100, v: v * 100 };
        },

        hsvToRgb({ h, s, v }) {
            h /= 360; s /= 100; v /= 100;
            let r = 0, g = 0, b = 0;
            const i = Math.floor(h * 6), f = h * 6 - i;
            const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        },

        rgbToHsl({ r, g, b }) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        },

        hslToRgb({ h, s, l }) {
            s /= 100; l /= 100;
            const a = s * Math.min(l, 1 - l);
            const f = n => {
                const k = (n + h / 30) % 12;
                return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            };
            return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
        },

        parse(value) {
            if (!value) return null;
            value = String(value).trim();
            if (/^#?[0-9a-f]{3,8}$/i.test(value)) {
                const hex = value.startsWith('#') ? value : '#' + value;
                const rgb = Color.hexToRgb(hex);
                if (!rgb) return null;
                return { ...Color.rgbToHsv(rgb), a: 1 };
            }
            const rm = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
            if (rm) {
                const rgb = { r: +rm[1], g: +rm[2], b: +rm[3] };
                return { ...Color.rgbToHsv(rgb), a: rm[4] !== undefined ? +rm[4] : 1 };
            }
            const hm = value.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)/i);
            if (hm) {
                const rgb = Color.hslToRgb({ h: +hm[1], s: +hm[2], l: +hm[3] });
                return { ...Color.rgbToHsv(rgb), a: hm[4] !== undefined ? +hm[4] : 1 };
            }
            try {
                const el = document.createElement('div');
                el.style.color = value;
                document.body.appendChild(el);
                const computed = getComputedStyle(el).color;
                document.body.removeChild(el);
                const nm = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                if (nm) {
                    const rgb = { r: +nm[1], g: +nm[2], b: +nm[3] };
                    return { ...Color.rgbToHsv(rgb), a: nm[4] !== undefined ? +nm[4] : 1 };
                }
            } catch (e) {}
            return null;
        },

        format(hsv, alpha, fmt) {
            const rgb = Color.hsvToRgb(hsv);
            switch (fmt) {
                case 'rgb':  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                case 'rgba': return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
                case 'hsl':  { const hsl = Color.rgbToHsl(rgb); return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`; }
                case 'hsla': { const hsl = Color.rgbToHsl(rgb); return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`; }
                default:     return Color.rgbToHex(rgb);
            }
        }
    };

    class PluginColorPicker {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el    = $el;
            this._id    = `ts-cp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
            this.isOpen = false;
            this._hsv   = { h: 0, s: 100, v: 100 };
            this._alpha = 1;

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            instanceCount++;
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginColorPicker.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const o    = self.options;

            if (!document.getElementById(STYLE_ID)) {
                $('<style>').attr('id', STYLE_ID).text(PluginColorPicker._css()).appendTo('head');
            }

            const start  = self.$el.val() || self.$el.data('color') || o.defaultColor;
            const parsed = Color.parse(start);
            if (parsed) {
                self._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
                self._alpha = parsed.a;
            }

            self.$el.wrap(`<div class="ts-cp-wrapper" id="${self._id}-wrapper"></div>`);
            self.$wrapper = $(`#${self._id}-wrapper`);

            self.$thumb = $(
                `<button type="button" class="ts-cp-thumb"` +
                ` aria-label="Open color picker" aria-haspopup="dialog"` +
                ` aria-expanded="false" aria-controls="${self._id}-panel"></button>`
            );
            self.$wrapper.append(self.$thumb);

            self.$panel = self._buildPanel();
            $('body').append(self.$panel);

            self._updateUI(false);

            return this;
        }

        _buildPanel() {
            const self = this;
            const o    = self.options;
            const pid  = `${self._id}-panel`;

            const $panel = $(
                `<div class="ts-cp-panel" id="${pid}"` +
                ` role="dialog" aria-label="Color picker" aria-modal="true" tabindex="-1"></div>`
            );

            const $picker = $(`
                <div class="ts-cp-picker">
                    <div class="ts-cp-picker-sat"></div>
                    <div class="ts-cp-picker-val"></div>
                    <div class="ts-cp-picker-cursor" role="slider"
                         aria-label="Color" tabindex="0"
                         aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"></div>
                </div>
            `);

            const $hueWrap = $(`
                <div class="ts-cp-hue-wrap">
                    <div class="ts-cp-hue-track" role="slider" aria-label="Hue"
                         tabindex="0" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0">
                        <div class="ts-cp-hue-thumb"></div>
                    </div>
                </div>
            `);

            let $alphaWrap = null;
            if (o.alpha) {
                $alphaWrap = $(`
                    <div class="ts-cp-alpha-wrap">
                        <div class="ts-cp-alpha-track" role="slider" aria-label="Opacity"
                             tabindex="0" aria-valuemin="0" aria-valuemax="1" aria-valuenow="1">
                            <div class="ts-cp-alpha-thumb"></div>
                        </div>
                    </div>
                `);
            }

            const $fields  = $('<div class="ts-cp-fields"></div>');
            const $preview = $('<div class="ts-cp-preview"><div class="ts-cp-preview-bg"></div><div class="ts-cp-preview-color"></div></div>');
            $fields.append($preview);

            if (o.showInput) {
                const $wrap = $(`
                    <div class="ts-cp-input-wrap">
                        <input class="ts-cp-field-input" type="text" spellcheck="false"
                               aria-label="Color value" autocomplete="off">
                    </div>
                `);
                const $sel = $('<select class="ts-cp-format-select" aria-label="Color format"></select>');
                ['hex', 'rgb', 'rgba', 'hsl', 'hsla'].forEach(f => {
                    $sel.append(`<option value="${f}"${f === o.format ? ' selected' : ''}>${f.toUpperCase()}</option>`);
                });
                $fields.append($wrap, $sel);
                self.$fieldInput   = $wrap.find('.ts-cp-field-input');
                self.$formatSelect = $sel;
            }

            $panel.append($picker, $hueWrap);
            if ($alphaWrap) $panel.append($alphaWrap);
            $panel.append($fields);

            if (o.swatches && o.swatches.length) {
                const $swatches = $('<div class="ts-cp-swatches" role="group" aria-label="Color presets"></div>');
                o.swatches.forEach((color, i) => {
                    $swatches.append(
                        `<button type="button" class="ts-cp-swatch"` +
                        ` style="background:${color}" data-color="${color}"` +
                        ` aria-label="${color}" tabindex="${i === 0 ? 0 : -1}"></button>`
                    );
                });
                $panel.append($swatches);
            }

            if (o.showEyeDropper && window.EyeDropper) {
                const $edWrap = $(`
                    <div class="ts-cp-eyedropper-wrap">
                        <button type="button" class="ts-cp-eyedropper"
                                aria-label="Pick color from screen" title="Eyedropper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/>
                                <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8Z"/>
                            </svg>
                            <span>Pick from screen</span>
                        </button>
                    </div>
                `);
                $panel.append($edWrap);
                self.$eyedropper = $edWrap.find('.ts-cp-eyedropper');
            }

            self.$picker       = $picker;
            self.$pickerCursor = $picker.find('.ts-cp-picker-cursor');
            self.$hueTrack     = $hueWrap.find('.ts-cp-hue-track');
            self.$hueThumb     = $hueWrap.find('.ts-cp-hue-thumb');
            self.$previewColor = $preview.find('.ts-cp-preview-color');

            if ($alphaWrap) {
                self.$alphaTrack = $alphaWrap.find('.ts-cp-alpha-track');
                self.$alphaThumb = $alphaWrap.find('.ts-cp-alpha-thumb');
            }

            return $panel;
        }

        events() {
            const self = this;

            self.$thumb.on('click.colorpicker', function(e) {
                e.stopPropagation();
                self.toggle();
            });

            self.$picker.on('mousedown.colorpicker touchstart.colorpicker', function(e) {
                self._startDrag(e, self._pickerMove.bind(self));
            });

            self.$hueTrack.on('mousedown.colorpicker touchstart.colorpicker', function(e) {
                self._startDrag(e, self._hueMove.bind(self));
            });

            if (self.options.alpha && self.$alphaTrack) {
                self.$alphaTrack.on('mousedown.colorpicker touchstart.colorpicker', function(e) {
                    self._startDrag(e, self._alphaMove.bind(self));
                });
            }

            if (self.options.showInput) {
                self.$fieldInput.on('keydown.colorpicker', function(e) {
                    if (e.key === 'Enter') {
                        const parsed = Color.parse($(this).val());
                        if (parsed) {
                            self._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
                            self._alpha = parsed.a;
                            self._updateUI(true, true);
                        }
                    }
                });
                self.$fieldInput.on('blur.colorpicker', function() {
                    const parsed = Color.parse($(this).val());
                    if (parsed) {
                        self._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
                        self._alpha = parsed.a;
                        self._updateUI(true, true);
                    }
                });
                self.$formatSelect.on('change.colorpicker', function() {
                    self.options.format = $(this).val();
                    self._updateUI(true);
                });
            }

            self.$panel.on('click.colorpicker', '.ts-cp-swatch', function() {
                const parsed = Color.parse($(this).data('color'));
                if (parsed) {
                    self._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
                    self._alpha = parsed.a;
                    self._updateUI(true);
                }
                if (self.options.closeOnSelect) self.close();
            });

            self.$panel.on('keydown.colorpicker', '.ts-cp-swatch', function(e) {
                const $all = self.$panel.find('.ts-cp-swatch');
                const idx  = $all.index(this);
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const $next = $all.eq(idx + 1);
                    if ($next.length) { $all.attr('tabindex', -1); $next.attr('tabindex', 0).trigger('focus'); }
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const $prev = $all.eq(idx - 1);
                    if ($prev.length) { $all.attr('tabindex', -1); $prev.attr('tabindex', 0).trigger('focus'); }
                }
            });

            self.$pickerCursor.on('keydown.colorpicker', function(e) {
                const step = e.shiftKey ? 10 : 1;
                let hit = true;
                switch (e.key) {
                    case 'ArrowRight': self._hsv.s = Math.min(100, self._hsv.s + step); break;
                    case 'ArrowLeft':  self._hsv.s = Math.max(0,   self._hsv.s - step); break;
                    case 'ArrowUp':    self._hsv.v = Math.min(100, self._hsv.v + step); break;
                    case 'ArrowDown':  self._hsv.v = Math.max(0,   self._hsv.v - step); break;
                    default: hit = false;
                }
                if (hit) { e.preventDefault(); self._updateUI(true); }
            });

            self.$hueTrack.on('keydown.colorpicker', function(e) {
                const step = e.shiftKey ? 10 : 1;
                let hit = true;
                switch (e.key) {
                    case 'ArrowRight': case 'ArrowUp':   self._hsv.h = Math.min(360, self._hsv.h + step); break;
                    case 'ArrowLeft':  case 'ArrowDown': self._hsv.h = Math.max(0,   self._hsv.h - step); break;
                    default: hit = false;
                }
                if (hit) { e.preventDefault(); self._updateUI(true); }
            });

            if (self.options.alpha && self.$alphaTrack) {
                self.$alphaTrack.on('keydown.colorpicker', function(e) {
                    const step = e.shiftKey ? 0.1 : 0.01;
                    let hit = true;
                    switch (e.key) {
                        case 'ArrowRight': case 'ArrowUp':   self._alpha = +(Math.min(1, self._alpha + step)).toFixed(2); break;
                        case 'ArrowLeft':  case 'ArrowDown': self._alpha = +(Math.max(0, self._alpha - step)).toFixed(2); break;
                        default: hit = false;
                    }
                    if (hit) { e.preventDefault(); self._updateUI(true); }
                });
            }

            if (self.$eyedropper) {
                self.$eyedropper.on('click.colorpicker', async function() {
                    try {
                        const result = await (new EyeDropper()).open();
                        const parsed = Color.parse(result.sRGBHex);
                        if (parsed) {
                            self._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
                            self._alpha = 1;
                            self._updateUI(true);
                        }
                    } catch (err) {
                        // User cancelled the dropper -- no-op
                    }
                });
            }

            $(document).on(`click.colorpicker.${self._id}`, function(e) {
                if (
                    self.isOpen &&
                    !$(e.target).closest(self.$panel).length &&
                    !$(e.target).closest(self.$wrapper).length
                ) {
                    self.close();
                }
            });

            $(document).on(`keydown.colorpicker.${self._id}`, function(e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.close();
                    self.$thumb.trigger('focus');
                }
            });

            return this;
        }

        _startDrag(e, moveFn) {
            e.preventDefault();
            moveFn(e);
            $(document).on('mousemove.ts-cp-drag touchmove.ts-cp-drag', moveFn);
            $(document).one('mouseup.ts-cp-drag touchend.ts-cp-drag', function() {
                $(document).off('.ts-cp-drag');
            });
        }

        _pickerMove(e) {
            const rect  = this.$picker[0].getBoundingClientRect();
            const c     = this._client(e);
            this._hsv.s = Math.max(0, Math.min(100, (c.x - rect.left)  / rect.width  * 100));
            this._hsv.v = Math.max(0, Math.min(100, (1 - (c.y - rect.top) / rect.height) * 100));
            this._updateUI(true);
        }

        _hueMove(e) {
            const rect  = this.$hueTrack[0].getBoundingClientRect();
            const c     = this._client(e);
            this._hsv.h = Math.max(0, Math.min(360, (c.x - rect.left) / rect.width * 360));
            this._updateUI(true);
        }

        _alphaMove(e) {
            const rect    = this.$alphaTrack[0].getBoundingClientRect();
            const c       = this._client(e);
            this._alpha   = +(Math.max(0, Math.min(1, (c.x - rect.left) / rect.width))).toFixed(2);
            this._updateUI(true);
        }

        _client(e) {
            const ev  = e.originalEvent || e;
            const src = ev.touches ? ev.touches[0] : ev;
            return { x: src.clientX, y: src.clientY };
        }

        _updateUI(emit, skipField) {
            const self        = this;
            const { h, s, v } = self._hsv;
            const a           = self._alpha;
            const rgb         = Color.hsvToRgb({ h, s, v });
            const hex         = Color.rgbToHex(rgb);

            self.$picker.css('background-color', `hsl(${h}, 100%, 50%)`);

            self.$pickerCursor.css({ left: `${s}%`, top: `${100 - v}%` });
            self.$pickerCursor.attr('aria-valuenow', `Saturation ${Math.round(s)}, Brightness ${Math.round(v)}`);

            self.$hueThumb.css({ left: `${(h / 360) * 100}%`, 'background-color': `hsl(${h}, 100%, 50%)` });
            self.$hueTrack.attr('aria-valuenow', Math.round(h));

            if (self.options.alpha && self.$alphaTrack) {
                self.$alphaThumb.css({ left: `${a * 100}%`, 'background-color': hex });
                self.$alphaTrack.css(
                    'background',
                    `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`
                );
                self.$alphaTrack.attr('aria-valuenow', a);
            }

            const displayColor = self.options.alpha ? `rgba(${rgb.r},${rgb.g},${rgb.b},${a})` : hex;
            self.$previewColor.css('background-color', displayColor);
            self.$thumb[0].style.setProperty('--ts-cp-thumb-color', displayColor);

            const formatted = Color.format({ h, s, v }, a, self.options.format);

            if (!skipField && self.options.showInput && self.$fieldInput) {
                self.$fieldInput.val(formatted);
            }

            self.$el.val(formatted);

            if (emit) {
                self.$el.trigger('change');
                if (typeof self.options.onChange === 'function') {
                    self.options.onChange(formatted, self);
                }
            }
        }

        _reposition() {
            const self = this;
            const rect = self.$wrapper[0].getBoundingClientRect();
            const ph   = self.$panel.outerHeight();
            const pw   = self.$panel.outerWidth();
            const vpH  = window.innerHeight;
            const vpW  = window.innerWidth;

            const top  = rect.bottom + ph + 8 <= vpH ? rect.bottom + 8 : rect.top - ph - 8;
            let   left = rect.left;

            if (left + pw > vpW) left = Math.max(4, rect.right - pw);

            self.$panel.css({ top: `${top}px`, left: `${left}px` });
        }

        open() {
            if (this.isOpen) return this;
            this.$panel.stop(true, true).fadeIn(150);
            this.isOpen = true;
            this.$thumb.attr('aria-expanded', 'true');
            this._reposition();
            this.$panel.trigger('focus');
            if (typeof this.options.onOpen === 'function') this.options.onOpen(this);
            return this;
        }

        close() {
            if (!this.isOpen) return this;
            this.$panel.stop(true, true).fadeOut(120);
            this.isOpen = false;
            this.$thumb.attr('aria-expanded', 'false');
            if (typeof this.options.onClose === 'function') this.options.onClose(this);
            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        setColor(value) {
            const parsed = Color.parse(value);
            if (!parsed) return this;
            this._hsv   = { h: parsed.h, s: parsed.s, v: parsed.v };
            this._alpha = parsed.a;
            this._updateUI(true);
            return this;
        }

        getColor() {
            return Color.format(this._hsv, this._alpha, this.options.format);
        }

        destroy() {
            const self = this;
            $(document).off(`.colorpicker.${self._id}`);
            $(document).off('.ts-cp-drag');
            self.$panel.remove();
            self.$el.off('.colorpicker');
            self.$el.unwrap();
            self.$el.removeData(instanceName);
            instanceCount--;
            if (instanceCount <= 0) {
                $(`#${STYLE_ID}`).remove();
                instanceCount = 0;
            }
            return this;
        }

        static _css() {
            return `
:root {
    --ts-cp-bg: #fff;
    --ts-cp-border: rgba(0,0,0,.1);
    --ts-cp-shadow: 0 8px 30px rgba(0,0,0,.12);
    --ts-cp-radius: 10px;
    --ts-cp-panel-w: 264px;
    --ts-cp-picker-h: 154px;
    --ts-cp-track-h: 12px;
    --ts-cp-track-radius: 6px;
    --ts-cp-thumb-size: 32px;
    --ts-cp-thumb-radius: 6px;
    --ts-cp-thumb-border: rgba(0,0,0,.18);
    --ts-cp-swatch-size: 22px;
    --ts-cp-swatch-radius: 4px;
    --ts-cp-z: 9999;
    --ts-cp-focus: rgba(99,202,183,.7);
    --ts-cp-input-bg: rgba(0,0,0,.04);
    --ts-cp-input-fg: #1a2530;
    --ts-cp-input-border: rgba(0,0,0,.12);
}
@media (prefers-color-scheme: dark) {
    :root {
        --ts-cp-bg: #1e2938;
        --ts-cp-border: rgba(255,255,255,.1);
        --ts-cp-shadow: 0 12px 40px rgba(0,0,0,.45);
        --ts-cp-thumb-border: rgba(255,255,255,.18);
        --ts-cp-input-bg: rgba(255,255,255,.06);
        --ts-cp-input-fg: #e0e8f0;
        --ts-cp-input-border: rgba(255,255,255,.12);
    }
}
html.dark,
[data-bs-theme="dark"] {
    --ts-cp-bg: #1e2938;
    --ts-cp-border: rgba(255,255,255,.1);
    --ts-cp-shadow: 0 12px 40px rgba(0,0,0,.45);
    --ts-cp-thumb-border: rgba(255,255,255,.18);
    --ts-cp-input-bg: rgba(255,255,255,.06);
    --ts-cp-input-fg: #e0e8f0;
    --ts-cp-input-border: rgba(255,255,255,.12);
}
[data-bs-theme="light"] {
    --ts-cp-bg: #fff;
    --ts-cp-border: rgba(0,0,0,.1);
    --ts-cp-shadow: 0 8px 30px rgba(0,0,0,.12);
    --ts-cp-thumb-border: rgba(0,0,0,.18);
    --ts-cp-input-bg: rgba(0,0,0,.04);
    --ts-cp-input-fg: #1a2530;
    --ts-cp-input-border: rgba(0,0,0,.12);
}
.ts-cp-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    vertical-align: middle;
}
.ts-cp-thumb {
    flex-shrink: 0;
    width: var(--ts-cp-thumb-size);
    height: var(--ts-cp-thumb-size);
    border-radius: var(--ts-cp-thumb-radius);
    border: 2px solid var(--ts-cp-thumb-border);
    cursor: pointer;
    padding: 0;
    transition: transform .12s, border-color .15s;
    background-color: #fff;
    background-image:
        linear-gradient(var(--ts-cp-thumb-color,#e74c3c), var(--ts-cp-thumb-color,#e74c3c)),
        repeating-conic-gradient(#bbb 0% 25%, transparent 0% 50%);
    background-size: 100% 100%, 8px 8px;
}
.ts-cp-thumb:hover { transform: scale(1.08); border-color: rgba(99,202,183,.6); }
.ts-cp-thumb:focus-visible { outline: 2px solid var(--ts-cp-focus); outline-offset: 2px; }
.ts-cp-panel {
    position: fixed;
    z-index: var(--ts-cp-z);
    width: var(--ts-cp-panel-w);
    background: var(--ts-cp-bg);
    border: 1px solid var(--ts-cp-border);
    border-radius: var(--ts-cp-radius);
    box-shadow: var(--ts-cp-shadow);
    padding: 12px;
    user-select: none;
    -webkit-user-select: none;
}
.ts-cp-picker {
    position: relative;
    width: 100%;
    height: var(--ts-cp-picker-h);
    border-radius: 6px;
    margin-bottom: 10px;
    cursor: crosshair;
    background-color: #f00;
}
.ts-cp-picker-sat,
.ts-cp-picker-val {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    pointer-events: none;
}
.ts-cp-picker-sat { background: linear-gradient(to right, #fff, transparent); }
.ts-cp-picker-val { background: linear-gradient(to top, #000, transparent); }
.ts-cp-picker-cursor {
    position: absolute;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.5);
    cursor: grab;
    outline: none;
}
.ts-cp-picker-cursor:active { cursor: grabbing; }
.ts-cp-picker-cursor:focus-visible { box-shadow: 0 0 0 3px var(--ts-cp-focus), 0 1px 4px rgba(0,0,0,.5); }
.ts-cp-hue-wrap,
.ts-cp-alpha-wrap {
    margin-bottom: 8px;
    position: relative;
}
.ts-cp-hue-track,
.ts-cp-alpha-track {
    position: relative;
    height: var(--ts-cp-track-h);
    border-radius: var(--ts-cp-track-radius);
    cursor: pointer;
    outline: none;
}
.ts-cp-hue-track {
    background: linear-gradient(to right,
        #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
.ts-cp-alpha-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--ts-cp-track-radius);
    background-image: repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%);
    background-size: 8px 8px;
}
.ts-cp-alpha-track {
    position: relative;
    z-index: 1;
}
.ts-cp-hue-track:focus-visible,
.ts-cp-alpha-track:focus-visible { box-shadow: 0 0 0 2px var(--ts-cp-focus); }
.ts-cp-hue-thumb,
.ts-cp-alpha-thumb {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.4);
    pointer-events: none;
}
.ts-cp-fields {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    margin-bottom: 2px;
}
.ts-cp-preview {
    flex-shrink: 0;
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 5px;
    border: 1px solid var(--ts-cp-border);
    overflow: hidden;
}
.ts-cp-preview-bg {
    position: absolute;
    inset: 0;
    background-image: repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%);
    background-size: 8px 8px;
}
.ts-cp-preview-color { position: absolute; inset: 0; }
.ts-cp-input-wrap { flex: 1; min-width: 0; }
.ts-cp-field-input {
    display: block;
    width: 100%;
    height: 28px;
    padding: 4px 8px;
    background: var(--ts-cp-input-bg);
    border: 1px solid var(--ts-cp-input-border);
    border-radius: 5px;
    color: var(--ts-cp-input-fg);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    outline: none;
    transition: border-color .15s;
    box-sizing: border-box;
}
.ts-cp-field-input:focus { border-color: var(--ts-cp-focus); }
.ts-cp-format-select {
    flex-shrink: 0;
    height: 28px;
    padding: 0 4px;
    background: var(--ts-cp-input-bg);
    border: 1px solid var(--ts-cp-input-border);
    border-radius: 5px;
    color: var(--ts-cp-input-fg);
    font-size: 11px;
    cursor: pointer;
    outline: none;
    transition: border-color .15s;
}
.ts-cp-format-select:focus { border-color: var(--ts-cp-focus); }
.ts-cp-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--ts-cp-border);
}
.ts-cp-swatch {
    width: var(--ts-cp-swatch-size);
    height: var(--ts-cp-swatch-size);
    border-radius: var(--ts-cp-swatch-radius);
    border: 1px solid rgba(0,0,0,.15);
    cursor: pointer;
    padding: 0;
    transition: transform .12s, box-shadow .12s;
}
.ts-cp-swatch:hover { transform: scale(1.2); box-shadow: 0 2px 8px rgba(0,0,0,.25); }
.ts-cp-swatch:focus-visible { outline: 2px solid var(--ts-cp-focus); outline-offset: 2px; }
.ts-cp-eyedropper-wrap {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--ts-cp-border);
    display: flex;
    justify-content: flex-end;
}
.ts-cp-eyedropper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 10px;
    background: var(--ts-cp-input-bg);
    border: 1px solid var(--ts-cp-input-border);
    border-radius: 5px;
    color: var(--ts-cp-input-fg);
    font-size: 11px;
    cursor: pointer;
    transition: background .15s, border-color .15s;
}
.ts-cp-eyedropper:hover { background: rgba(99,202,183,.12); border-color: rgba(99,202,183,.45); }
.ts-cp-eyedropper:focus-visible { outline: 2px solid var(--ts-cp-focus); outline-offset: 2px; }
`;
        }
    }

    PluginColorPicker.defaults = {
        format:         'hex',
        alpha:          false,
        swatches:       [],
        closeOnSelect:  false,
        position:       'auto',
        showEyeDropper: true,
        showInput:      true,
        defaultColor:   '#e74c3c',
        onChange:       null,
        onOpen:         null,
        onClose:        null,
    };

    $.extend(themestrap, { PluginColorPicker });

    $.fn.themestrapPluginColorPicker = function(opts, ...args) {
        return this.map(function() {
            const $this = $(this);
            if (typeof opts === 'string') {
                const inst = $this.data(instanceName);
                if (inst && typeof inst[opts] === 'function') {
                    return inst[opts](...args);
                }
                return $this;
            }
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginColorPicker($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
