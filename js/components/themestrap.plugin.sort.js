// Sort
(((themestrap = {}, $) => {
    const instanceName = '__sort';

    const STYLE_ID = 'themestrap-sort-styles';

    class PluginSort {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this.initialHTML = $el.html();

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
            this.options = $.extend(true, {}, PluginSort.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            this._injectStyles();

            const self = this;
            const $source = this.options.wrapper;
            const $destination = $('.sort-destination[data-sort-id="' + $source.attr('data-sort-id') + '"]');

            if (!$destination.get(0)) {
                return this;
            }

            self.$source = $source;
            self.$destination = $destination;
            self.$loader = false;

            self._setParagraphHeight($destination);

            if (self.$destination.parents('.sort-destination-loader').get(0)) {
                self.$loader = self.$destination.parents('.sort-destination-loader');
                self._createLoader();
            }

            $destination.attr('data-filter', '*');

            if ($('#' + self.options.filterFieldId).length) {
                const $filterField = $('#' + self.options.filterFieldId);
                $filterField.on('keyup.sort', function () {
                    self.options.filterFieldText = $(this).val();
                    self.setFilter(self.options.filter);
                });
            }

            // Wait for images then lay out
            self._waitForImages($destination, () => {
                self._initGrid();
                self.events();
                self._removeLoader();
            });

            // Safety fallback to remove loader
            setTimeout(() => {
                self._removeLoader();
            }, 3000);

            return this;
        }

        // ─── Native image-load barrier ───────────────────────────────────────────

        _waitForImages($container, callback) {
            const imgs = $container.find('img').get();

            if (!imgs.length) {
                callback();
                return;
            }

            let remaining = imgs.length;

            const done = () => {
                remaining--;
                if (remaining <= 0) callback();
            };

            imgs.forEach(img => {
                if (img.complete) {
                    done();
                } else {
                    img.addEventListener('load', done);
                    img.addEventListener('error', done);
                }
            });
        }

        // ─── Native masonry grid ──────────────────────────────────────────────────

        _initGrid() {
            const self = this;
            const $dest = self.$destination;

            $dest.addClass('ts-sort-grid');

            self._layout();

            $dest.trigger('layoutComplete', [[]]);
        }

        _layout() {
            const self = this;
            const $dest = self.$destination;
            const opts = self.options;
            const colSelector = opts.itemSelector;
            const $allItems = $dest.find(colSelector);

            if (opts.layoutMode === 'fitRows') {
                // Simple flex row layout — let CSS handle it
                $dest.css({ position: '' });
                $allItems.css({ position: '', top: '', left: '' });
                return;
            }

            // Masonry: absolute-position columns
            const containerWidth = $dest.width();
            if (!containerWidth) return;

            // Determine column count from visible items
            const $visible = $allItems.filter(':visible').first();
            if (!$visible.length) return;

            const itemOuterWidth = $visible.outerWidth(true);
            if (!itemOuterWidth) return;

            const cols = Math.max(1, Math.round(containerWidth / itemOuterWidth));
            const colHeights = new Array(cols).fill(0);
            const isRTL = !opts.isOriginLeft;

            $dest.css({ position: 'relative' });

            $allItems.each(function (i) {
                const $item = $(this);

                if ($item.css('display') === 'none') {
                    $item.css({ position: '', top: '', left: '' });
                    return;
                }

                // Stagger support
                if (opts.stagger) {
                    const delay = i * opts.stagger;
                    $item.css('transition-delay', delay + 'ms');
                }

                const col = colHeights.indexOf(Math.min(...colHeights));
                const left = isRTL
                    ? containerWidth - (col + 1) * itemOuterWidth
                    : col * itemOuterWidth;

                $item.css({
                    position: 'absolute',
                    top: colHeights[col] + 'px',
                    left: left + 'px'
                });

                colHeights[col] += $item.outerHeight(true);
            });

            const totalHeight = Math.max(...colHeights);
            $dest.css({ height: totalHeight + 'px' });
        }

        // ─── Events ───────────────────────────────────────────────────────────────

        events() {
            const self = this;

            self.$source.find('a').on('click.sort', function (e) {
                e.preventDefault();

                const filter = $(this).parent().data('option-value');
                self.setFilter(filter);

                if (e.originalEvent) {
                    self.$source.trigger('filtered');
                }
            });

            self.$destination.trigger('filtered');
            self.$source.trigger('filtered');

            if (self.options.useHash) {
                self._hashEvents();
            }

            $(window).on('resize.sort sort.resize', () => {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(() => {
                    self._layout();
                }, 300);
            });

            setTimeout(() => {
                $(window).trigger('sort.resize');
            }, 300);

            return this;
        }

        // ─── Public API ───────────────────────────────────────────────────────────

        setFilter(filter) {
            const self = this;
            let currentFilter = filter || '*';

            self.$source.find('.active').removeClass('active');
            self.$source.find(
                'li[data-option-value="' + filter + '"], ' +
                'li[data-option-value="' + filter + '"] > a'
            ).addClass('active');

            self.options.filter = currentFilter;

            // Build compound filter string
            let cssFilter = currentFilter === '*' ? '' : currentFilter;

            if (self.$destination.attr('data-current-page')) {
                cssFilter += '[data-page-rel=' + self.$destination.attr('data-current-page') + ']';
            }

            if (self.options.filterFieldText !== '') {
                cssFilter += '[data-sort-search*=' + self.options.filterFieldText.toLowerCase() + ']';
            }

            // Show/hide items natively
            const $allItems = self.$destination.find(self.options.itemSelector);

            $allItems.each(function () {
                const $item = $(this);
                const show = cssFilter === '' || $item.is(cssFilter);

                if (show) {
                    $item.css(self.options.visibleStyle).show();
                } else {
                    $item.css(self.options.hiddenStyle).hide();
                }
            });

            // Re-layout after filter change
            setTimeout(() => {
                self._layout();

                // Hash update
                if (self.options.useHash) {
                    if (window.location.hash !== '' || self.options.filter.replace('.', '') !== '*') {
                        window.location.hash = self.options.filter.replace('.', '');
                    }
                }

                $(window).trigger('scroll');
                self.$destination.trigger('filtered');
            }, 0);

            return this;
        }

        // ─── Private helpers ──────────────────────────────────────────────────────

        _hashEvents() {
            const self = this;
            let initHashFilter = '.' + location.hash.replace('#', '');

            // If hash points to a scroll-to element, don't treat it as a filter
            if ($(location.hash).length) {
                initHashFilter = '.';
            }

            if (initHashFilter !== '.' && initHashFilter !== '.*') {
                self.setFilter(initHashFilter);
            }

            $(window).on('hashchange.sort', () => {
                const hashFilter = '.' + location.hash.replace('#', '');
                const hash = (hashFilter === '.' || hashFilter === '.*') ? '*' : hashFilter;
                self.setFilter(hash);
            });

            return this;
        }

        _setParagraphHeight($destination) {
            const self = this;
            let minParagraphHeight = 0;
            const paragraphs = $('span.thumb-info-caption p', $destination);

            paragraphs.each(function () {
                if ($(this).height() > minParagraphHeight) {
                    minParagraphHeight = ($(this).height() + 10);
                }
            });

            paragraphs.height(minParagraphHeight);
            return this;
        }

        _createLoader() {
            const self = this;
            const loaderTemplate = [
                '<div class="bounce-loader">',
                '<div class="bounce1"></div>',
                '<div class="bounce2"></div>',
                '<div class="bounce3"></div>',
                '</div>'
            ].join('');
            self.$loader.append(loaderTemplate);
            return this;
        }

        _removeLoader() {
            const self = this;
            if (self.$loader) {
                self.$loader.removeClass('sort-destination-loader-showing');
                setTimeout(() => {
                    self.$loader.addClass('sort-destination-loader-loaded');
                }, 300);
            }
            return this;
        }

        _injectStyles() {
            if ($('#' + STYLE_ID).length) return;

            const css = [
                '.ts-sort-grid { position: relative; }',
                '.ts-sort-grid .isotope-item { transition: opacity 0.3s ease, top 0.4s ease, left 0.4s ease; }',
                '.ts-sort-grid.fitRows { display: flex; flex-wrap: wrap; }'
            ].join('\n');

            $('<style id="' + STYLE_ID + '">' + css + '</style>').appendTo('head');
        }

        destroy() {
            const self = this;

            // Unbind all namespaced events
            if (self.$source) self.$source.find('a').off('.sort');
            if (self.$destination) {
                // Reset item positions
                self.$destination.find(self.options.itemSelector).css({
                    position: '', top: '', left: '',
                    opacity: '', display: '', transitionDelay: ''
                });
                self.$destination.css({ position: '', height: '' });
                self.$destination.removeClass('ts-sort-grid');
            }

            $('#' + self.options.filterFieldId).off('.sort');
            $(window).off('.sort');

            self.$el.removeData(instanceName);

            return this;
        }
    }

    PluginSort.defaults = {
        useHash: true,
        itemSelector: '.isotope-item',
        layoutMode: 'masonry',
        filter: '*',
        filterFieldId: false,
        filterFieldText: '',
        hiddenStyle: {
            opacity: 0
        },
        visibleStyle: {
            opacity: 1
        },
        stagger: 30,
        isOriginLeft: ($('html').attr('dir') === 'rtl' ? false : true)
    };

    // expose to scope
    $.extend(themestrap, {
        PluginSort
    });

    // jquery plugin
    $.fn.themestrapPluginSort = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginSort($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
