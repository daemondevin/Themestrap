// Scroll to Top
(((themestrap = {}, $) => {
    $.extend(themestrap, {

		PluginScrollToTop: {

			defaults: {
				wrapper: $('body'),
				offset: 150,
				buttonClass: 'scroll-to-top',
				buttonAriaLabel: 'Scroll To Top',
				iconClass: 'fas fa-chevron-up',
				delay: 1000,
				visibleMobile: false,
				label: false,
				easing: 'easeOutBack'
			},

			initialize(opts) {
				initialized = true;

				// Don't initialize if the page has Section Scroll
				if( $('body[data-plugin-section-scroll]').get(0) ) {
					return;
				}

				this
					.setOptions(opts)
					.build()
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts);

				return this;
			},

			build() {
                const self = this;
                let $el;

                // Base HTML Markup
                $el = $('<a />')
					.addClass(self.options.buttonClass)
					.attr({
						'href': '#',
						'aria-label': self.options.buttonAriaLabel
					})
					.append(
						$('<i />')
						.addClass(self.options.iconClass)
				);

                // Visible Mobile
                if (!self.options.visibleMobile) {
					$el.addClass('hidden-mobile');
				}

                // Label
                if (self.options.label) {
					$el.append(
						$('<span />').html(self.options.label)
					);
				}

                this.options.wrapper.append($el);

                this.$el = $el;

                return this;
            },

			events() {
                const self = this;
                let _isScrolling = false;

                // Click Element Action
                self.$el.on('click', e => {
					e.preventDefault();
					$('html').animate({
						scrollTop: 0
					}, self.options.delay, self.options.easing);
					return false;
				});

                // Show/Hide Button on Window Scroll event.
                $(window).scroll(() => {

					if (!_isScrolling) {

						_isScrolling = true;

						if ($(window).scrollTop() > self.options.offset) {

							self.$el.stop(true, true).addClass('visible');
							_isScrolling = false;

						} else {

							self.$el.stop(true, true).removeClass('visible');
							_isScrolling = false;

						}

					}

				});

                return this;
            }

		}

	});
})).apply(this, [window.themestrap, jQuery]);
