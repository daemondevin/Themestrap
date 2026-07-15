// Search
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Search: {

			defaults: {
				wrapper: $('#searchForm')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			build() {
				if (!($.isFunction($.fn.validate))) {
					return this;
				}

				this.$wrapper.validate({
					errorPlacement(error, element) {}
				});

				// Search Reveal
				themestrap.fn.execOnceThroughEvent( '#header', 'mouseover.search.reveal', () => {
					$('.header-nav-features-search-reveal').each(function() {
						const $el = $(this), $header = $('#header'), $html = $('html');

						$el.find('.header-nav-features-search-show-icon').on('click', () => {
							$el.addClass('show');
							$header.addClass('search-show');
							$html.addClass('search-show');
							$('#headerSearch').focus();
						});

						$el.find('.header-nav-features-search-hide-icon').on('click', () => {
							$el.removeClass('show');
							$header.removeClass('search-show');
							$html.removeClass('search-show');
						});
					});
				} );

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
