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
			if (!(typeof $.fn.matchHeight === 'function')) {
				return this;
			}

			const self = this;

			self.options.wrapper.matchHeight(self.options);

			return this;
		}

        /**
         * Release the element from its matchHeight group and clear the height it was given.
         * @returns {PluginMatchHeight}
         */
        destroy() {
            const $el = this.$el;

            if (typeof $.fn.matchHeight === 'function') {
                $el.matchHeight({ remove: true, property: this.options.property });

                // matchHeight leaves empty groups behind, drop them so resize stops visiting them
                if ($.fn.matchHeight._groups) {
                    $.fn.matchHeight._groups = $.fn.matchHeight._groups.filter(group => group.elements.length);
                }
            }

            $el.removeData(instanceName);

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

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginMatchHeight = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginMatchHeight($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
