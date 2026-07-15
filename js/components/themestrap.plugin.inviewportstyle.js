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
			    const un = observeElementInViewport.observeElementInViewport(
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
    }

    PluginInViewportStyle.defaults = {
		viewport: window, 
		threshold: [0],
		modTop: '-200px',
		modBottom: '-200px',
		style: {'transition': 'all 1s ease-in-out'},
		styleIn: '',
		styleOut: '',
		classIn: '',
		classOut: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginInViewportStyle
	});

    // jquery plugin
    $.fn.themestrapPluginInViewportStyle = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginInViewportStyle($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
