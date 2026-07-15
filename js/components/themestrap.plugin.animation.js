(((themestrap = {}, $) => {
    const instanceName = '__animate';

    class PluginAnimate {
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
			this.options = $.extend(true, {}, PluginAnimate.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			// Flag Class Only
			// - Useful for simple animations like hightlight
			// - Less process and memory
			if( self.options.flagClassOnly ) {
				const delay = self.options.wrapper.attr('data-appear-animation-delay') ? self.options.wrapper.attr('data-appear-animation-delay') : self.options.delay;
				
				self.options.wrapper.css({
					'animation-delay': delay + 'ms',
					'transition-delay': delay + 'ms'
				});
				self.options.wrapper.addClass( self.options.wrapper.attr('data-appear-animation') );

				return this;
			}

			if($('body').hasClass('loading-overlay-showing')) {
				$(window).on('loading.overlay.ready', () => {
					self.animate();
				});
			} else {
				self.animate();
			}

			return this;
		}

        animate() {
            const self = this;
            const $el = this.options.wrapper;
            let delay = 0;
            let duration = this.options.duration;
            const elTopDistance = $el.offset().top;
            const windowTopDistance = $(window).scrollTop();

            // If has appear animation elements inside a SVG. 
            // Intersection Observer API do not check elements inside SVG's, so we need initialize trough top parent SVG
            if( $el.data('appear-animation-svg') ) {
				$el.find('[data-appear-animation]').each(function(){
                    const $this = $(this);
                    let opts;

                    const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                    if (pluginOptions)
						opts = pluginOptions;

                    $this.themestrapPluginAnimate(opts);
                });

				return this;
			}

            // No animation at the first load of page. This is good for performance
            if( self.options.firstLoadNoAnim ) {
				$el.removeClass('appear-animation');

				// Inside Carousel
				if( $el.closest('.owl-carousel').get(0) ) {
					setTimeout(() => {
						$el.closest('.owl-carousel').on('change.owl.carousel', () => {
							self.options.firstLoadNoAnim = false;
							$el.removeData('__animate');
							$el.themestrapPluginAnimate( self.options );
						});
					}, 500);
				}

				return this;
			}

            $el.addClass('appear-animation animated');

            if (!$('html').hasClass('no-csstransitions') && $(window).width() > self.options.minWindowWidth && elTopDistance >= windowTopDistance || self.options.forceAnimation == true) {
				delay = ($el.attr('data-appear-animation-delay') ? $el.attr('data-appear-animation-delay') : self.options.delay);
				duration = ($el.attr('data-appear-animation-duration') ? $el.attr('data-appear-animation-duration') : self.options.duration);

				if (duration != '750ms') {
					$el.css('animation-duration', duration);
				}

				$el.css('animation-delay', delay + 'ms');
				$el.addClass($el.attr('data-appear-animation') + ' appear-animation-visible');
				
				$el.trigger('animation:show');

			} else {
				$el.addClass('appear-animation-visible');
			}

            return this;
        }
    }

    PluginAnimate.defaults = {
		accX: 0,
		accY: -80,
		delay: 100,
		duration: '750ms',
		minWindowWidth: 0,
		forceAnimation: false,
		flagClassOnly: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginAnimate
	});

    // jquery plugin
    $.fn.themestrapPluginAnimate = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginAnimate($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);
