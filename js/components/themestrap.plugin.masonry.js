// Masonry
(((themestrap = {}, $) => {
    const instanceName = '__masonry';
    const STYLE_ID     = 'themestrap-masonry-styles';

    class PluginMasonry {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el          = $el;
            this.initialHTML  = $el[0].innerHTML;
            this._raf         = null;
            this._positions   = [];
            this._resizeTimer = null;

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
            this.options = $.extend(true, {}, PluginMasonry.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            this._injectStyles();

            const self = this, $el = this.options.wrapper;

            $el.addClass('ts-masonry-container');

            // Apply column class
            if (self.options.columnClass) {
                $el.addClass(self.options.columnClass);
            }

            // Loader
            self.$loader = false;
            if ($el.parents('.masonry-loader').get(0)) {
                self.$loader = $el.parents('.masonry-loader');
                self._createLoader();
            }

            // Wait for images then layout
            self._waitForImages($el[0], () => {
                self._layout();
                self._removeLoader();
            });

            // Fallback loader removal
            if (self.$loader) {
                setTimeout(() => self._removeLoader(), 3000);
            }

            return this;
        }

        events() {
            const self = this;
            const $win = $(window);

            // Resize handler — debounced
            $win.on('resize.themestrap.masonry.' + self._uid(), () => {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(() => self._layout(), 200);
            });

            return this;
        }

        _layout() {
            const self    = this;
            const $el     = self.options.wrapper;
            const $items  = $el.children(':not(.ts-masonry-sizer)');

            if (!$items.length) return;

            const cols      = self._columnCount();
            const gutter    = self._gutter();
            const colWidth  = (($el.width() - (gutter * (cols - 1))) / cols) || 0;
            const colHeights = new Array(cols).fill(0);

            // Stamp sizer item (invisible) to set column width for mixed-width items
            $el.find('.ts-masonry-sizer').remove();

            $items.each(function(i) {
                const $item = $(this);
                // Temporarily set width so we can measure natural height
                $item.css({ width: colWidth, position: 'absolute', visibility: 'hidden' });
            });

            // Read heights after setting widths (avoid forced reflow per-item)
            const heights = $items.map(function() {
                return $(this).outerHeight(true);
            }).get();

            $items.each(function(i) {
                const $item   = $(this);
                // Find shortest column
                const col     = self._minIndex(colHeights);
                const x       = col * (colWidth + gutter);
                const y       = colHeights[col];

                $item.css({
                    position: 'absolute',
                    left:     x,
                    top:      y,
                    width:    colWidth,
                    visibility: ''
                });

                colHeights[col] += heights[i] + gutter;
            });

            // Set container height
            $el.css({
                position: 'relative',
                height:   Math.max.apply(null, colHeights) - gutter
            });

            self._positions = colHeights;
        }

        _columnCount() {
            const self  = this;
            const w     = $(window).width();
            const resp  = self.options.responsive;

            if (!resp || !Object.keys(resp).length) {
                return self.options.columns;
            }

            // Sort breakpoints descending, pick first that matches
            const bps = Object.keys(resp).map(Number).sort((a, b) => b - a);
            for (const bp of bps) {
                if (w >= bp) return resp[bp].columns || self.options.columns;
            }

            // Below all breakpoints — use smallest defined
            const smallest = bps[bps.length - 1];
            return (resp[smallest] && resp[smallest].columns) || 1;
        }

        _gutter() {
            const self = this;
            const w    = $(window).width();
            const resp = self.options.responsive;

            if (!resp || !Object.keys(resp).length) {
                return self.options.gutter;
            }

            const bps = Object.keys(resp).map(Number).sort((a, b) => b - a);
            for (const bp of bps) {
                if (w >= bp) {
                    return resp[bp].gutter !== undefined
                        ? resp[bp].gutter
                        : self.options.gutter;
                }
            }

            const smallest = bps[bps.length - 1];
            return (resp[smallest] && resp[smallest].gutter !== undefined)
                ? resp[smallest].gutter
                : self.options.gutter;
        }

        _minIndex(arr) {
            let minVal = Infinity, minIdx = 0;
            arr.forEach((v, i) => { if (v < minVal) { minVal = v; minIdx = i; } });
            return minIdx;
        }

        _waitForImages(container, cb) {
            const imgs = Array.from(container.querySelectorAll('img'));
            if (!imgs.length) { cb(); return; }

            let remaining = imgs.length;
            const done = () => { if (--remaining === 0) cb(); };
            imgs.forEach(img => {
                if (img.complete) {
                    done();
                } else {
                    img.addEventListener('load',  done, { once: true });
                    img.addEventListener('error', done, { once: true });
                }
            });
        }

        _createLoader() {
            const self = this;
            const tpl  = [
                '<div class="bounce-loader">',
                    '<div class="bounce1"></div>',
                    '<div class="bounce2"></div>',
                    '<div class="bounce3"></div>',
                '</div>'
            ].join('');
            self.$loader.append(tpl);
        }

        _removeLoader() {
            const self = this;
            if (!self.$loader) return;
            self.$loader.removeClass('masonry-loader-showing');
            setTimeout(() => self.$loader.addClass('masonry-loader-loaded'), 300);
        }

        _injectStyles() {
            if (document.getElementById(STYLE_ID)) return;
            const style = document.createElement('style');
            style.id   = STYLE_ID;
            style.textContent = [
                '.ts-masonry-container { position: relative; }',
                '.ts-masonry-container > * { box-sizing: border-box; }'
            ].join('\n');
            document.head.appendChild(style);
        }

        _uid() {
            if (!this.__uid) {
                this.__uid = Math.random().toString(36).slice(2);
            }
            return this.__uid;
        }

        /**
         * Re-run layout (useful after dynamic content changes).
         */
        layout() {
            this._layout();
            return this;
        }

        /**
         * Append new items, wait for their images, then re-layout.
         * @param {jQuery} $newItems - items to append to the container
         */
        appended($newItems) {
            const self = this;
            self.options.wrapper.append($newItems);
            self._waitForImages(self.options.wrapper[0], () => self._layout());
            return this;
        }

        destroy() {
            const self = this;
            $(window).off('resize.themestrap.masonry.' + self._uid());
            clearTimeout(self._resizeTimer);
            self.options.wrapper
                .removeClass('ts-masonry-container')
                .css({ position: '', height: '' })
                .children().css({ position: '', left: '', top: '', width: '', visibility: '' });
            self.$el[0].innerHTML = self.initialHTML;
            self.$el.removeData(instanceName);
            return this;
        }
    }

    PluginMasonry.defaults = {
        columns: 3,
        gutter:  20,
        // Responsive breakpoints: { minWidth: { columns, gutter } }
        responsive: {
            0:    { columns: 1, gutter: 15 },
            576:  { columns: 2, gutter: 15 },
            768:  { columns: 2, gutter: 20 },
            992:  { columns: 3, gutter: 20 },
            1200: { columns: 3, gutter: 20 }
        },
        columnClass: ''
    };

    // Expose to scope
    $.extend(themestrap, { PluginMasonry });

    // jQuery bridge
    $.fn.themestrapPluginMasonry = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginMasonry($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
