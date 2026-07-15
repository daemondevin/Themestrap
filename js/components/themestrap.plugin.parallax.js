// Parallax
(((themestrap = {}, $) => {
    const instanceName = '__parallax';

    class PluginParallax {
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
			this.options = $.extend(true, {}, PluginParallax.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $window = $(window);
            let offset;
            let yPos;
            let plxPos;
            let background;
            let rotateY;

            // Mouse Parallax
            if( self.options.mouseParallax ) {

				$window.mousemove(({clientX, clientY}) => {

					$('.parallax-mouse-object', self.options.wrapper).each(function() {

				        const moving_value = $( this ).attr('data-value');
				        const x = (clientX * moving_value) / 250;
				        const y = (clientY * moving_value) / 250;

				        $( this ).css('transform', 'translateX(' + x + 'px) translateY(' + y + 'px)');
				    });

				});

				return this;

			}

            // Scrollable
            if( self.options.scrollableParallax && $(window).width() > self.options.scrollableParallaxMinWidth ) {
				const $scrollableWrapper = self.options.wrapper.find('.scrollable-parallax-wrapper');

				if( $scrollableWrapper.get(0) ) {
                    let progress 	 = ( $(window).scrollTop() > ( self.options.wrapper.offset().top + $(window).outerHeight() ) ) ? self.options.cssValueEnd : self.options.cssValueStart;
                    const cssValueUnit = self.options.cssValueUnit ? self.options.cssValueUnit : '';

                    $scrollableWrapper.css({
						'background-image' : 'url(' + self.options.wrapper.data('image-src') + ')',
						'background-size' : 'cover',
						'background-position' : 'center',
						'background-attachment' : 'fixed',
						'transition' : 'ease '+ self.options.cssProperty +' '+ self.options.transitionDuration,
						'width' : progress + '%'
					});

                    $(window).on('scroll', e => {
						if( self.options.wrapper.visible( true ) ) {
							const $window = $(window), scrollTop = $window.scrollTop(), elementOffset = self.options.wrapper.offset().top, currentElementOffset = (elementOffset - scrollTop);

						   	const scrollPercent = Math.abs( +( currentElementOffset - $window.height() ) / (self.options.startOffset ? self.options.startOffset : 7) );
						 	
						 	// Increment progress value according scroll position
						 	if( scrollPercent <= self.options.cssValueEnd && progress <= self.options.cssValueEnd ) {
						 		progress = self.options.cssValueStart + scrollPercent;
						 	}

						 	// Adjust CSS end value
						 	if( progress > self.options.cssValueEnd ) {
						 		progress = self.options.cssValueEnd;
						 	}

						 	// Adjust CSS start value
						 	if( progress < self.options.cssValueStart ) {
						 		progress = self.options.cssValueStart;
						 	}

						 	const styles = {};
						 	styles[self.options.cssProperty] = progress + cssValueUnit;

							$scrollableWrapper.css(styles);
						}
					});
                }

				return;
			}

            // Create Parallax Element
            if( self.options.fadeIn ) {
				background = $('<div class="parallax-background fadeIn animated"></div>');
			} else {
				background = $('<div class="parallax-background"></div>');
			}

            // Set Style for Parallax Element
            background.css({
				'background-image' : 'url(' + self.options.wrapper.data('image-src') + ')',
				'background-size' : 'cover',
				'position' : 'absolute',
				'top' : 0,
				'left' : 0,
				'width' : '100%',
				'height' : self.options.parallaxHeight
			});

            if( self.options.parallaxScale ) {
				background.css({
					'transition' : 'transform 500ms ease-out'
				});
			}

            // Add Parallax Element on DOM
            self.options.wrapper.prepend(background);

            // Set Overlfow Hidden and Position Relative to Parallax Wrapper
            self.options.wrapper.css({
				'position' : 'relative',
				'overflow' : 'hidden'
			});

            // Parallax Effect on Scroll & Resize
            const parallaxEffectOnScrolResize = () => {
				$window.on('scroll resize', () => {
					offset  = self.options.wrapper.offset();
					yPos    = -($window.scrollTop() - (offset.top - 100)) / ((self.options.speed + 2 ));
					plxPos  = (yPos < 0) ? Math.abs(yPos) : -Math.abs(yPos);
					rotateY = ( $('html[dir="rtl"]').get(0) ) ? ' rotateY(180deg)' : ''; // RTL
					
					offset  = self.options.wrapper.offset();
					yPos    = -($window.scrollTop() - (offset.top - 100)) / ((self.options.speed + 2 ));
					plxPos  = (yPos < 0) ? Math.abs(yPos) : -Math.abs(yPos);
					rotateY = ( $('html[dir="rtl"]').get(0) ) ? ' rotateY(180deg)' : ''; // RTL

					if( !self.options.parallaxScale ) {

						if( self.options.parallaxDirection == 'bottom' ) {
							self.options.offset = 250;
						}

						let y = ( (plxPos - 50) + (self.options.offset) );
						if( self.options.parallaxDirection == 'bottom' ) {
							y = ( y < 0 ) ? Math.abs( y ) : -Math.abs( y );
						}

						background.css({
							'transform' : 'translate3d(0, '+ y +'px, 0)' + rotateY,
							'background-position-x' : self.options.horizontalPosition
						});

					} else {
                        const scrollTop = $window.scrollTop();
                        const elementOffset = self.options.wrapper.offset().top;
                        const currentElementOffset = (elementOffset - scrollTop);
                        let scrollPercent = Math.abs( +( currentElementOffset - $window.height() ) / (self.options.startOffset ? self.options.startOffset : 7) );

                        scrollPercent = parseInt((scrollPercent >= 100) ? 100 : scrollPercent);

                        const currentScale = (scrollPercent / 100) * 50;

                        if ( !self.options.parallaxScaleInvert ) {
							background.css({
								'transform' : 'scale(1.' + String(currentScale).padStart(2, '0') + ', 1.' + String(currentScale).padStart(2, '0') + ')'
							});
						} else {
							background.css({
								'transform' : 'scale(1.' + String(50 - currentScale).padStart(2, '0') + ', 1.' + String(50 - currentScale).padStart(2, '0') + ')'
							});
						}
                    }
				});

				$window.trigger('scroll');
			};

            if (!$.browser.mobile) {
				parallaxEffectOnScrolResize();
			} else {
				if( self.options.enableOnMobile == true ) {
					parallaxEffectOnScrolResize();
				} else {
					self.options.wrapper.addClass('parallax-disabled');
				}
			}

            return this;
        }
    }

    PluginParallax.defaults = {
		speed: 1.5,
		horizontalPosition: '50%',
		offset: 0,
		parallaxDirection: 'top',
		parallaxHeight: '180%',
		parallaxScale: false,
		parallaxScaleInvert: false,
		scrollableParallax: false,
		scrollableParallaxMinWidth: 991,
		startOffset: 7,
		transitionDuration: '200ms',
		cssProperty: 'width',
		cssValueStart: 40,
		cssValueEnd: 100,
		cssValueUnit: 'vw',
		mouseParallax: false,
		enableOnMobile: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginParallax
	});

    // jquery plugin
    $.fn.themestrapPluginParallax = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginParallax($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
