// In Viewport Style
(((themestrap = {}, $) => {
    const instanceName = '__inviewportstyle';

    class PluginInViewportStyle {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this._origClass = $el.attr('class');
			this._origStyle = $el.attr('style');

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
			this.options = $.extend(true, {}, PluginInViewportStyle.defaults, opts, {});

			return this;
		}

        build() {
			const self = this, el = self.$el.get(0);

			self.$el.css(self.options.style);

		    if (typeof window.IntersectionObserver === 'function') {
			    self._unobserve = observeElementInViewport.observeElementInViewport(
			        el, () => {
			        	self.$el.css(self.options.styleIn);
			        	self.$el
			        		.addClass(self.options.classIn)
			        		.removeClass(self.options.classOut);
			        }, () => {
			        	self.$el.css(self.options.styleOut);
			        	self.$el
			        		.addClass(self.options.classOut)
			        		.removeClass(self.options.classIn);
			        }, {
			        	viewport: self.options.viewport, 
			            threshold: self.options.threshold,
						modTop: self.options.modTop,
						modBottom: self.options.modBottom
			        }
			    )
		    };

			return this;
		}

        /**
         * Stop observing and restore the element's original class and style attributes.
         * @returns {PluginInViewportStyle}
         */
        destroy() {
            const $el = this.$el;

            if (typeof this._unobserve === 'function') {
                this._unobserve();
                this._unobserve = null;
            }

            if (this._origClass === undefined) {
                $el.removeAttr('class');
            } else {
                $el.attr('class', this._origClass);
            }
            if (this._origStyle === undefined) {
                $el.removeAttr('style');
            } else {
                $el.attr('style', this._origStyle);
            }

            $el.removeData(instanceName);

            return this;
        }
    }

    PluginInViewportStyle.defaults = {
		viewport: window, 
		threshold: [0],
		modTop: '-200px',
		modBottom: '-200px',
		style: {'transition': 'all 1s ease-in-out'},
		styleIn: {},
		styleOut: {},
		classIn: '',
		classOut: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginInViewportStyle
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginInViewportStyle = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginInViewportStyle($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
