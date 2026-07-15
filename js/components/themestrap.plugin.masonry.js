// Masonry
(((themestrap = {}, $) => {
    const instanceName = '__masonry';

    class PluginMasonry {
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
			this.options = $.extend(true, {}, PluginMasonry.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.isotope))) {
				return this;
			}

			const self = this, $window = $(window);

			self.$loader = false;

			if (self.options.wrapper.parents('.masonry-loader').get(0)) {
				self.$loader = self.options.wrapper.parents('.masonry-loader');
				self.createLoader();
			}

			self.options.wrapper.one('layoutComplete', (event, laidOutItems) => {
				self.removeLoader();
			});

			self.options.wrapper.waitForImages(() => {
				self.options.wrapper.isotope(self.options);	
			});

			$(window).on('resize', () => {
				setTimeout(() => {
					self.options.wrapper.isotope('layout');
				}, 300);
			});

			setTimeout(() => {
				self.removeLoader();
			}, 3000);

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

				self.$loader.removeClass('masonry-loader-showing');

				setTimeout(() => {
					self.$loader.addClass('masonry-loader-loaded');
				}, 300);

			}

		}
    }

    PluginMasonry.defaults = {

	};

    // expose to scope
    $.extend(themestrap, {
		PluginMasonry
	});

    // jquery plugin
    $.fn.themestrapPluginMasonry = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginMasonry($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
