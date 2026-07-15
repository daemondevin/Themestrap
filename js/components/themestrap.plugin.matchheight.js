// Match Height
(((themestrap = {}, $) => {
    const instanceName = '__matchHeight';

    class PluginMatchHeight {
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
			this.options = $.extend(true, {}, PluginMatchHeight.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.matchHeight))) {
				return this;
			}

			const self = this;

			self.options.wrapper.matchHeight(self.options);

			return this;
		}
    }

    PluginMatchHeight.defaults = {
		byRow: true,
		property: 'height',
		target: null,
		remove: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginMatchHeight
	});

    // jquery plugin
    $.fn.themestrapPluginMatchHeight = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginMatchHeight($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
