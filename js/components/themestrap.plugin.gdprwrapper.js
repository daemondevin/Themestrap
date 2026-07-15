// GDPR Wrapper
(((themestrap = {}, $) => {
    const instanceName = '__gdprwrapper';

    class PluginGDPRWrapper {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			const self = this;

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
			this.options = $.extend(true, {}, PluginGDPRWrapper.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if( $.cookie( 'themestrap-gdpr-preferences' ) && $.cookie( 'themestrap-gdpr-preferences' ).includes(self.options.checkCookie) ) {

				$.ajax({
					url: self.options.ajaxURL,
					cache: false,
					complete({responseText}) {
					
						setTimeout(() => {

							self.options.wrapper.html(responseText).addClass('show');

						}, 1000);

					}
				});

			} else {
				self.options.wrapper.addClass('show');
			}

			return this;

		}
    }

    PluginGDPRWrapper.defaults = {

	};

    // expose to scope
    $.extend(themestrap, {
		PluginGDPRWrapper
	});

    // jquery plugin
    $.fn.themestrapPluginGDPRWrapper = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginGDPRWrapper($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
