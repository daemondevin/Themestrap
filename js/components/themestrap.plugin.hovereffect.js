// Hover Effect
(((themestrap = {}, $) => {
    const instanceName = '__hoverEffect';

    class PluginHoverEffect {
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
			this.options = $.extend(true, {}, PluginHoverEffect.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if(self.$el.hasClass('hover-effect-3d')) {
				self.options.effect = '3d';
			}

			// Magnetic
			if(self.options.effect == 'magnetic') {
				self.magnetic();
			}

			// 3d
			if(self.options.effect == '3d') {
				self.hover3d();
			}

			return this;
		}

        magnetic() {
			const self = this;

			self.$el.mousemove(function({clientX, clientY}) {

				const pos = this.getBoundingClientRect();
				const mx = clientX - pos.left - pos.width/2; 
				const my = clientY - pos.top - pos.height/2;

				this.style.transform = 'translate('+ mx * self.options.magneticMx +'px, '+ my * self.options.magneticMx +'px)';

			});

			self.$el.mouseleave(function(e) {

				this.style.transform = 'translate3d(0px, 0px, 0px)';

			});

			return this;

		}

        hover3d() {
			const self = this;

			if ($.isFunction($.fn['hover3d'])) {

				self.$el.hover3d({
					selector: self.options.selector,
					sensitivity: self.options.sensitivity
				});

			}

			return this;

		}
    }

    PluginHoverEffect.defaults = {
		effect: 'magnetic',
		magneticMx: 0.15,
		magneticMy: 0.3,
		magneticDeg: 12,
		selector: '.thumb-info, .hover-effect-3d-wrapper',
		sensitivity: 20
	};

    // expose to scope
    $.extend(themestrap, {
		PluginHoverEffect
	});

    // jquery plugin
    $.fn.themestrapPluginHoverEffect = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginHoverEffect($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);
