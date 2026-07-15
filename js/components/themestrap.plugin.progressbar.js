// Progress Bar
(((themestrap = {}, $) => {
    const instanceName = '__progressBar';

    class PluginProgressBar {
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
			this.options = $.extend(true, {}, PluginProgressBar.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $el = this.options.wrapper;
            let delay = 1;

            delay = ($el.attr('data-appear-animation-delay') ? $el.attr('data-appear-animation-delay') : self.options.delay);

            $el.addClass($el.attr('data-appear-animation'));

            setTimeout(() => {

				$el.animate({
					width: $el.attr('data-appear-progress-animation')
				}, 1500, 'easeOutQuad', () => {
					$el.find('.progress-bar-tooltip').animate({
						opacity: 1
					}, 500, 'easeOutQuad');
				});

			}, delay);

            return this;
        }
    }

    PluginProgressBar.defaults = {
		accX: 0,
		accY: -50,
		delay: 1
	};

    // expose to scope
    $.extend(themestrap, {
		PluginProgressBar
	});

    // jquery plugin
    $.fn.themestrapPluginProgressBar = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginProgressBar($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
