(((themestrap = {}, $) => {
    const instanceName = '__gdpr';

    class PluginGDPR {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			const self = this;

			this.$el = $el;

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
			this.options = $.extend(true, {}, PluginGDPR.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			// Show
			if( !$.cookie( 'themestrap-privacy-bar' ) ) {
				setTimeout(() => {
					self.options.wrapper.addClass('show');
				}, self.options.cookieBarShowDelay);
			}

			// If already has preferences cookie, check inputs according preferences cookie data
			if( $.cookie( 'themestrap-gdpr-preferences' ) ) {
				const preferencesArr = $.cookie( 'themestrap-gdpr-preferences' ).split(',');

				for( let i = 0; i < preferencesArr.length; i++ ) {
					if( $('input[value="'+ preferencesArr[i] +'"]').get(0) ) {
						if( $('input[value="'+ preferencesArr[i] +'"]').is(':checkbox') ) {
							$('input[value="'+ preferencesArr[i] +'"]').prop('checked', true);
						}
					}
				}
			}

			return this;

		}

        events() {
			const self = this;

			// Agree Trigger
			self.options.wrapper.find('.gdpr-agree-trigger').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-form').find('.gdpr-input').each(function(){
					if( $(this).is(':checkbox') || $(this).is(':hidden') ) {
						$(this).prop('checked', true);
					}
				});

				$('.gdpr-preferences-form').trigger('submit').removeClass('show');

				self.removeCookieBar();
			});

			// Preferences Trigger
			self.options.wrapper.find('.gdpr-preferences-trigger').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').addClass('show');
			});

			// Close Popup Button
			$('.gdpr-close-popup').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').removeClass('show');
			});

			// Close Popup When Click Outside of popup area
			$('.gdpr-preferences-popup').on('click', ({target}) => {
				if( !$(target).closest('.gdpr-preferences-popup-content').get(0) ) {
					$('.gdpr-preferences-popup').removeClass('show');
				}
			});

			// Preference Form
			$('.gdpr-preferences-form').on('submit', function(e){
				e.preventDefault();

				const $this = $(this);

				// Save Preferences Button
				$this.find('button[type="submit"]').text( 'SAVING...' );

				// Form Data
				const formData = [];
				$this.find('.gdpr-input').each(function(){
					if( $(this).is(':checkbox') && $(this).is(':checked') || $(this).is(':hidden') ) {
						formData.push( $(this).val() );
					}
				});

				$.cookie( 'themestrap-privacy-bar', true, {expires: self.options.expires} );

				setTimeout(() => {
					$this.find('button[type="submit"]').text( 'SAVED!' ).removeClass('btn-primary').addClass('btn-success');

					setTimeout(() => {
						$('.gdpr-preferences-popup').removeClass('show');
						self.removeCookieBar();

						$this.find('button[type="submit"]').text( 'SAVE PREFERENCES' ).removeClass('btn-success').addClass('btn-primary');

						if( $.cookie( 'themestrap-gdpr-preferences' ) ) {

							$.cookie( 'themestrap-gdpr-preferences', formData, {expires: self.options.expires} );
							location.reload();

						} else {

							$.cookie( 'themestrap-gdpr-preferences', formData, {expires: self.options.expires} );

							if ($.isFunction($.fn['themestrapPluginGDPRWrapper']) && $('[data-plugin-gdpr-wrapper]').length) {

								$(() => {
									$('[data-plugin-gdpr-wrapper]:not(.manual)').each(function() {
                                        const $this = $(this);
                                        let opts;

                                        $this.removeData('__gdprwrapper');

                                        const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                                        if (pluginOptions)
											opts = pluginOptions;

                                        $this.themestrapPluginGDPRWrapper(opts);
                                    });
								});

							}

						}

					}, 500);
				}, 1000);
			});

			// Remove/Reset Cookies
			$('.gdpr-reset-cookies').on('click', e => {
				e.preventDefault();

				self.clearCookies();

				location.reload();
			});

			// Open Preferences
			$('.gdpr-open-preferences').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').toggleClass('show');
			});

			return this;
		}

        removeCookieBar() {
			const self = this;

			self.options.wrapper.addClass('removing').on('transitionend', () => {
				setTimeout(() => {
					self.options.wrapper.removeClass('show removing');
				}, 500);
			});

			return this;
		}

        clearCookies() {
			const self = this;

			$.removeCookie( 'themestrap-privacy-bar' );
			$.removeCookie( 'themestrap-gdpr-preferences' );

			return this;
		}
    }

    PluginGDPR.defaults = {
		cookieBarShowDelay: 3000,
		expires: 365
	};

    // expose to scope
    $.extend(themestrap, {
		PluginGDPR
	});

    // jquery plugin
    $.fn.themestrapPluginGDPR = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginGDPR($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
