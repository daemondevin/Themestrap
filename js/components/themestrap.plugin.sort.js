// Sort
(((themestrap = {}, $) => {
    const instanceName = '__sort';

    class PluginSort {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;

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
			if (!($.isFunction($.fn.isotope))) {
				return this;
			}

			const self = this, $source = this.options.wrapper, $destination = $('.sort-destination[data-sort-id="' + $source.attr('data-sort-id') + '"]'), $window = $(window);

			if ($destination.get(0)) {

				self.$source = $source;
				self.$destination = $destination;
				self.$loader = false;

				self.setParagraphHeight($destination);

				if (self.$destination.parents('.sort-destination-loader').get(0)) {
					self.$loader = self.$destination.parents('.sort-destination-loader');
					self.createLoader();
				}

				$destination.attr('data-filter', '*');

				$destination.one('layoutComplete', (event, laidOutItems) => {
					self.removeLoader();

					// If has data-plugin-sticky on the page we need recalculate sticky position
					if( $('[data-plugin-sticky]').length ) {
						setTimeout(() => {
							$('[data-plugin-sticky]').each(function(){
								$(this).data('__sticky').build();
								$(window).trigger('resize');
							});
						}, 500);
					}
				});

				if ( $('#' + self.options.filterFieldId).length ) {

					const $filterField = $('#' + self.options.filterFieldId);

					$filterField.keyup(function() {
						self.options.filterFieldText = $(this).val();
						self.setFilter(self.options.filter);
					});

				}

				$destination.waitForImages(() => {
					$destination.isotope(self.options);
					self.events();
				});

				setTimeout(() => {
					self.removeLoader();
				}, 3000);

			}

			return this;
		}

        events() {
            const self = this;
            let filter = null;
            const $window = $(window);

            self.$source.find('a').click(function(e) {
				e.preventDefault();

				filter = $(this).parent().data('option-value');

				self.setFilter(filter);

				if (e.originalEvent) {
					self.$source.trigger('filtered');
				}

				return this;
			});

            self.$destination.trigger('filtered');
            self.$source.trigger('filtered');

            if (self.options.useHash) {
				self.hashEvents();
			}

            $window.on('resize sort.resize', () => {
				setTimeout(() => {
					self.$destination.isotope('layout');
				}, 300);
			});

            setTimeout(() => {
				$window.trigger('sort.resize');
			}, 300);

            return this;
        }

        setFilter(filter) {
            const self = this;
            const page = false;
            let currentFilter = filter;

            self.$source.find('.active').removeClass('active');
            self.$source.find('li[data-option-value="' + filter + '"], li[data-option-value="' + filter + '"] > a').addClass('active');

            self.options.filter = currentFilter;

            if (self.$destination.attr('data-current-page')) {
				currentFilter = currentFilter + '[data-page-rel=' + self.$destination.attr('data-current-page') + ']';
			}

            if (self.options.filterFieldText != '') {
				currentFilter = currentFilter + '[data-sort-search*=' + self.options.filterFieldText.toLowerCase() + ']';
			}

            self.$destination.attr('data-filter', filter).isotope({
				filter: currentFilter
			}).one('arrangeComplete', (event, filteredItems) => {
				
				if (self.options.useHash) {
					if (window.location.hash != '' || self.options.filter.replace('.', '') != '*') {
						window.location.hash = self.options.filter.replace('.', '');
					}
				}
				
				$(window).trigger('scroll');

			}).trigger('filtered');

            return this;
        }

        hashEvents() {
            const self = this;
            let hash = null;
            let hashFilter = null;
            let initHashFilter = '.' + location.hash.replace('#', '');

            // Check if has scroll to section trough URL hash and prevent the sort plugin from show nothing
            if( $(location.hash).length ) {
				initHashFilter = '.';
			}

            if (initHashFilter != '.' && initHashFilter != '.*') {
				self.setFilter(initHashFilter);
			}

            $(window).on('hashchange', e => {

				hashFilter = '.' + location.hash.replace('#', '');
				hash = (hashFilter == '.' || hashFilter == '.*' ? '*' : hashFilter);

				self.setFilter(hash);

			});

            return this;
        }

        setParagraphHeight() {
            const self = this;
            let minParagraphHeight = 0;
            const paragraphs = $('span.thumb-info-caption p', self.$destination);

            paragraphs.each(function() {
				if ($(this).height() > minParagraphHeight) {
					minParagraphHeight = ($(this).height() + 10);
				}
			});

            paragraphs.height(minParagraphHeight);

            return this;
        }

        createLoader() {
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

        removeLoader() {

			const self = this;

			if (self.$loader) {

				self.$loader.removeClass('sort-destination-loader-showing');

				setTimeout(() => {
					self.$loader.addClass('sort-destination-loader-loaded');
				}, 300);

			}

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
		isOriginLeft: ($('html').attr('dir') == 'rtl' ? false : true)
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSort
	});

    // jquery plugin
    $.fn.themestrapPluginSort = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginSort($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
