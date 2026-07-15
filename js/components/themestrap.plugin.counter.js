// Counter
(((themestrap = {}, $) => {
    const instanceName = '__counter';

    class PluginCounter {
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
			this.options = $.extend(true, {}, PluginCounter.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.countTo))) {
				return this;
			}

			const self = this, $el = this.options.wrapper;

			if (self.options.comma) {
				self.options.formatter = (value, {decimals}) => value.toFixed(decimals).toString().replace('.',',')
			}

			$.extend(self.options, {
				onComplete() {
					
					if ($el.data('append')) {
						if( self.options.appendWrapper ) {
							const appendWrapper = $( self.options.appendWrapper );
							appendWrapper.append( $el.data('append') );
							$el.html( $el.html() + appendWrapper[0].outerHTML );
						} else {
							$el.html($el.html() + $el.data('append'));
						}
					}
					if ($el.data('prepend')) {
						if( self.options.prependWrapper ) {
							const prependWrapper = $( self.options.prependWrapper );
							prependWrapper.append( $el.data('prepend') );
                            $el.html(prependWrapper[0].outerHTML + $el.html());
						} else {
							$el.html($el.data('prepend') + $el.html());
						}
					}
				}
			});

			$el.countTo(self.options);

			return this;
		}
		
		destroy() {
            this.$el.removeData(instanceName);
            return this;
        }
    }

    PluginCounter.defaults = {
		accX: 0,
		accY: 0,
		appendWrapper: false,
		prependWrapper: false,
		speed: 3000,
		refreshInterval: 100,
		decimals: 0,
		comma: false,
		onUpdate: null,
		onComplete: null
	}

    // expose to scope
    $.extend(themestrap, {
		PluginCounter
	});

    // jquery plugin
    $.fn.themestrapPluginCounter = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCounter($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
