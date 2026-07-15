(((themestrap = {}, $) => {
    const instanceName = '__chartCircular';

    class PluginChartCircular {
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
			this.options = $.extend(true, {}, PluginChartCircular.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.easyPieChart))) {
				return this;
			}

			const self = this, $el = this.options.wrapper, value = ($el.attr('data-percent') ? $el.attr('data-percent') : 0), percentEl = $el.find('.percent');

			$.extend(true, self.options, {
				onStep(from, to, currentValue) {
					percentEl.html(parseInt(currentValue));
				}
			});

			$el.attr('data-percent', 0);

			$el.easyPieChart(self.options);

			setTimeout(() => {

				$el.data('easyPieChart').update(value);
				$el.attr('data-percent', value);

			}, self.options.delay);

			return this;
		}
    }

    PluginChartCircular.defaults = {
		accX: 0,
		accY: -150,
		delay: 1,
		barColor: '#0088CC',
		trackColor: '#f2f2f2',
		scaleColor: false,
		scaleLength: 5,
		lineCap: 'round',
		lineWidth: 13,
		size: 175,
		rotate: 0,
		animate: ({
			duration: 2500,
			enabled: true
		})
	};

    // expose to scope
    $.extend(themestrap, {
		PluginChartCircular
	});

    // jquery plugin
    $.fn.themestrapPluginChartCircular = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginChartCircular($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
