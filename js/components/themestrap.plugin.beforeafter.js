// Before/After
(((themestrap = {}, $) => {
    const instanceName = '__beforeafter';
    const STYLE_ID = 'ts-beforeafter-styles';

    const CSS = `
.ts-ba-wrap {
    position: relative;
    overflow: hidden;
    line-height: 0;
    cursor: col-resize;
    user-select: none;
    -webkit-user-select: none;
}
.ts-ba-wrap.ts-ba-vertical {
    cursor: row-resize;
}

/* Layers stay fixed at 100% size */
.ts-ba-before,
.ts-ba-after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.ts-ba-before {
    z-index: 1;
}

.ts-ba-after {
    z-index: 2;
    /* Revealed via clip-path in JS */
}

/* Images lock strictly to the parent bounds without moving or scaling */
.ts-ba-before img,
.ts-ba-after img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    max-width: none;
    pointer-events: none;
}

.ts-ba-divider {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background: #fff;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
}
.ts-ba-wrap.ts-ba-vertical .ts-ba-divider {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
}
.ts-ba-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 44px;
    height: 44px;
    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,.35);
    cursor: col-resize;
    touch-action: none;
    outline-offset: 2px;
}
.ts-ba-wrap.ts-ba-vertical .ts-ba-handle {
    cursor: row-resize;
}
.ts-ba-handle::before,
.ts-ba-handle::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
}
.ts-ba-handle::before {
    border-width: 7px 8px 7px 0;
    border-color: transparent #888 transparent transparent;
    margin-right: 4px;
}
.ts-ba-handle::after {
    border-width: 7px 0 7px 8px;
    border-color: transparent transparent transparent #888;
    margin-left: 4px;
}
.ts-ba-wrap.ts-ba-vertical .ts-ba-handle::before {
    border-width: 0 7px 8px 7px;
    border-color: transparent transparent #888 transparent;
    margin-right: 0;
    margin-bottom: 4px;
}
.ts-ba-wrap.ts-ba-vertical .ts-ba-handle::after {
    border-width: 8px 7px 0 7px;
    border-color: #888 transparent transparent transparent;
    margin-left: 0;
    margin-top: 4px;
}
.ts-ba-label {
    position: absolute;
    top: 12px;
    z-index: 15;
    background: rgba(0,0,0,.5);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: 3px;
    pointer-events: none;
}
.ts-ba-before-label { left: 12px; }
.ts-ba-after-label  { right: 12px; }
.ts-ba-wrap.ts-ba-vertical .ts-ba-before-label { top: 12px; left: 12px; }
.ts-ba-wrap.ts-ba-vertical .ts-ba-after-label  { top: auto; bottom: 12px; left: 12px; right: auto; }
`;

    let instanceCounter = 0;

    class PluginBeforeAfter {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }
            this.id = ++instanceCounter;
            this.eventNamespace = `.beforeafter_${this.id}`;
            this.$el = $el;
            this.initialHTML = $el.html();

            this
                .setData()
                .setOptions(opts)
                .injectStyles()
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const attrOpts = themestrap.fn && themestrap.fn.getOptions
                ? (themestrap.fn.getOptions(this.$el.data('plugin-options')) || {})
                : {};

            this.options = $.extend(true, {}, PluginBeforeAfter.defaults, attrOpts, opts, {
                wrapper: this.$el
            });

            return this;
        }

        injectStyles() {
            if (!document.getElementById(STYLE_ID)) {
                const s = document.createElement('style');
                s.id = STYLE_ID;
                s.textContent = CSS;
                document.head.appendChild(s);
            }
            return this;
        }

        build() {
            const self = this;
            const $wrap = self.options.wrapper;
            const o = self.options;
            const isVertical = o.orientation === 'vertical';

            const $imgs = $wrap.find('img');
            if ($imgs.length < 2) {
                return this;
            }

            const $imgBefore = $imgs.eq(0).clone();
            const $imgAfter  = $imgs.eq(1).clone();

            const doInit = () => {
                const nw = $imgs[0].naturalWidth  || 800;
                const nh = $imgs[0].naturalHeight || 600;

                $wrap.addClass('ts-ba-wrap' + (isVertical ? ' ts-ba-vertical' : ''));
                $wrap.css({ position: 'relative', paddingBottom: (nh / nw * 100) + '%', height: 0 });

                const pct = Math.max(0, Math.min(1, o.default_offset_pct));

                const $before = $('<div class="ts-ba-before">').append($imgBefore);
                const $after  = $('<div class="ts-ba-after">').append($imgAfter);
                const $divider = $('<div class="ts-ba-divider">');
                const $handle  = $('<div class="ts-ba-handle" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100">');

                let $labelBefore, $labelAfter;
                if (!o.no_overlay) {
                    $labelBefore = $('<div class="ts-ba-label ts-ba-before-label">').text(o.before_label);
                    $labelAfter  = $('<div class="ts-ba-label ts-ba-after-label">').text(o.after_label);
                }

                $wrap.empty().append($before, $after, $divider, $handle);
                if (!o.no_overlay) {
                    $wrap.append($labelBefore, $labelAfter);
                }

                self.$before  = $before;
                self.$after   = $after;
                self.$divider = $divider;
                self.$handle  = $handle;
                self.isVertical = isVertical;

                self._setPosition(pct);
            };

            const img = $imgs[0];
            if (img.complete && img.naturalWidth) {
                doInit();
            } else {
                $imgs[0].addEventListener('load', doInit, { once: true });
            }

            return this;
        }

		_setPosition(pct) {
			const self = this;
			pct = Math.max(0, Math.min(1, pct));
			self.pct = pct;
			
			const p = (pct * 100).toFixed(4) + '%';
			const invP = ((1 - pct) * 100).toFixed(4) + '%';
			const val = Math.round(pct * 100);

			if (self.isVertical) {
				// Clips the bottom of the After layer so Before is on top, After is on bottom
				const clipPath = `inset(${p} 0 0 0)`;
				self.$after.css({
					clipPath: clipPath,
					webkitClipPath: clipPath
				});
				self.$divider.css({ top: p, left: 0 });
				self.$handle.css({ top: p, left: '50%' });
			} else {
				// Inset: inset(top right bottom left)
				// Clipping the right side reveals the Before layer underneath on the left, 
				// keeping the After layer visible on the right.
				const clipPath = `inset(0 0 0 ${p})`;
				self.$after.css({
					clipPath: clipPath,
					webkitClipPath: clipPath
				});
				self.$divider.css({ left: p, top: 0 });
				self.$handle.css({ left: p, top: '50%' });
			}
			
			self.$handle.attr('aria-valuenow', val);
		}

        _pctFromEvent(e) {
            const self = this;
            const rect = self.options.wrapper[0].getBoundingClientRect();
            const pt = e.touches ? e.touches[0] : e;
            if (self.isVertical) {
                return (pt.clientY - rect.top) / rect.height;
            }
            return (pt.clientX - rect.left) / rect.width;
        }

        events() {
            const self = this;
            const $wrap = self.options.wrapper;
            const ns = self.eventNamespace;
            let dragging = false;

            $wrap.on(`mousedown${ns} touchstart${ns}`, (e) => {
                if (self.options.move_with_handle_only) return;
                dragging = true;
                self._setPosition(self._pctFromEvent(e.originalEvent || e));
            });

            self.$handle.on(`mousedown${ns} touchstart${ns}`, (e) => {
                e.stopPropagation();
                dragging = true;
            });

            $(document)
                .on(`mousemove${ns} touchmove${ns}`, (e) => {
                    if (!dragging) return;
                    e.preventDefault();
                    self._setPosition(self._pctFromEvent(e.originalEvent || e));
                })
                .on(`mouseup${ns} touchend${ns}`, () => { 
                    dragging = false; 
                });

            self.$handle.on(`keydown${ns}`, (e) => {
                let step = 0.05;
                if (e.shiftKey) step = 0.1;

                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    self._setPosition(self.pct - step);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    self._setPosition(self.pct + step);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    self._setPosition(0);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    self._setPosition(1);
                }
            });

            if (self.options.move_slider_on_hover) {
                $wrap.on(`mousemove${ns}`, (e) => {
                    if (dragging) return;
                    self._setPosition(self._pctFromEvent(e.originalEvent || e));
                });
            }

            if (self.options.click_to_move) {
                $wrap.on(`click${ns}`, (e) => {
                    self._setPosition(self._pctFromEvent(e.originalEvent || e));
                });
            }

            return this;
        }

        destroy() {
            const ns = this.eventNamespace;
            $(document).off(ns);
            this.options.wrapper
                .removeClass('ts-ba-wrap ts-ba-vertical')
                .css({ position: '', paddingBottom: '', height: '' })
                .html(this.initialHTML)
                .off(ns)
                .removeData(instanceName);

            return this;
        }
    }

    PluginBeforeAfter.defaults = {
        forceInit: true,
        default_offset_pct: 0.5,
        orientation: 'horizontal',   // 'horizontal' | 'vertical'
        before_label: 'Before',
        after_label: 'After',
        no_overlay: false,
        move_slider_on_hover: false,
        move_with_handle_only: true,
        click_to_move: false
    };

    $.extend(themestrap, {
        PluginBeforeAfter
    });

    $.fn.themestrapPluginBeforeAfter = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginBeforeAfter($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
