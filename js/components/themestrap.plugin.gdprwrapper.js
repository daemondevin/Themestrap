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
			this._origHtml = $el.html();
			this._hadShow = $el.hasClass('show');

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

				self._xhr = $.ajax({
					url: self.options.ajaxURL,
					cache: false,
					complete({responseText}) {
						self._xhr = null;
						self._timer = setTimeout(() => {

							self.options.wrapper.html(responseText).addClass('show');

						}, 1000);

					}
				});

			} else {
				self.options.wrapper.addClass('show');
			}

			return this;

		}

        /**
         * Abort a pending request, put back the original markup and drop the instance.
         * @returns {PluginGDPRWrapper}
         */
        destroy() {
            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            clearTimeout(this._timer);

            this.$el.html(this._origHtml).toggleClass('show', this._hadShow);
            this.$el.removeData(instanceName);

            return this;
        }
    }

    PluginGDPRWrapper.defaults = {

	};

    // expose to scope
    $.extend(themestrap, {
		PluginGDPRWrapper
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginGDPRWrapper = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginGDPRWrapper($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
