// Toggle
(((themestrap = {}, $) => {
    const instanceName = '__toggle';

    class PluginToggle {
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
			this.options = $.extend(true, {}, PluginToggle.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $wrapper = this.options.wrapper;
            const $items = $wrapper.find('> .toggle');
            let $el = null;

            $items.each(function() {
				$el = $(this);

				if ($el.hasClass('active')) {
					$el.find('> p').addClass('preview-active');
					$el.find('> .toggle-content').slideDown(self.options.duration);
				}

				self.events($el);
			});

            if (self.options.isAccordion) {
				self.options.duration = self.options.duration / 2;
			}

            return this;
        }

        events($el) {
            const self = this;
            let previewParCurrentHeight = 0;
            let previewParAnimateHeight = 0;
            let toggleContent = null;

            $el.find('> label, > .toggle-title').click(function({originalEvent}) {
                const $this = $(this);
                const parentSection = $this.parent();
                const parentWrapper = $this.parents('.toggle');
                let previewPar = null;
                let closeElement = null;

                if (self.options.isAccordion && typeof(originalEvent) != 'undefined') {
					closeElement = parentWrapper.find('.toggle.active > label, .toggle.active > .toggle-title');

					if (closeElement[0] == $this[0]) {
						return;
					}
				}

                parentSection.toggleClass('active');

                // Preview Paragraph
                if (parentSection.find('> p').get(0)) {

					previewPar = parentSection.find('> p');
					previewParCurrentHeight = previewPar.css('height');
					previewPar.css('height', 'auto');
					previewParAnimateHeight = previewPar.css('height');
					previewPar.css('height', previewParCurrentHeight);

				}

                // Content
                toggleContent = parentSection.find('> .toggle-content');

                if (parentSection.hasClass('active')) {

					$(previewPar).animate({
						height: previewParAnimateHeight
					}, self.options.duration, function() {
						$(this).addClass('preview-active');
					});

					toggleContent.slideDown(self.options.duration, () => {
						if (closeElement) {
							closeElement.trigger('click');
						}
					});

				} else {

					$(previewPar).animate({
						height: 0
					}, self.options.duration, function() {
						$(this).removeClass('preview-active');
					});

					toggleContent.slideUp(self.options.duration);

				}
            });
        }
    }

    PluginToggle.defaults = {
		duration: 350,
		isAccordion: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginToggle
	});

    // jquery plugin
    $.fn.themestrapPluginToggle = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginToggle($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
