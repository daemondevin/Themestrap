(((themestrap = {}, $) => {
    const instanceName = '__beforeafter';

    class PluginBeforeAfter {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
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
			this.options = $.extend(true, {}, PluginBeforeAfter.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {

			if ($.isFunction($.fn.twentytwenty)) {

				const self = this;

				self.options.wrapper.waitForImages(() => {
					self.options.wrapper.twentytwenty(self.options);
				});

			} else {

				themestrap.fn.showErrorMessage('Failed to Load File', 'Failed to load: twentytwenty - Include the following file(s): (vendor/twentytwenty/css/twentytwenty.css, vendor/twentytwenty/js/jquery.event.move.js, vendor/twentytwenty/js/jquery.twentytwenty.js)');

			}

			return this;

		}
    }

    PluginBeforeAfter.defaults = {
		forceInit: true,
		default_offset_pct: 0.5,
		orientation: 'horizontal',
		before_label: 'Before',
		after_label: 'After',
		no_overlay: false,
		move_slider_on_hover: false,
		move_with_handle_only: true,
		click_to_move: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginBeforeAfter
	});

    // jquery plugin
    $.fn.themestrapPluginBeforeAfter = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginBeforeAfter($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
