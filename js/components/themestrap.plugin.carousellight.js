(((themestrap = {}, $) => {
    const instanceName = '__carouselLight';

    class PluginCarouselLight {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this.clickFlag = true;

			this
				.setData()
				.setOptions(opts)
				.build()
				.owlNav()
				.owlDots()
				.autoPlay()
				.events();

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginCarouselLight.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			self.$el
				.css('opacity', 1)
				.find('.owl-item:first-child')
				.addClass('active');

			self.$el.trigger('initialized.owl.carousel');

			// Carousel Navigate By ID and item index
			self.carouselNavigate();

			return this;
		}

        changeSlide($nextSlide) {
			const self = this, $prevSlide = self.$el.find('.owl-item.active');

			self.$el.find('.owl-item.active').addClass('removing');

			$prevSlide
				.removeClass('fadeIn')
				.addClass( 'fadeOut animated' );

			setTimeout(() => {
				setTimeout(() => {
					$prevSlide.removeClass('active');
				}, 400);

				$nextSlide
					.addClass('active')
					.removeClass('fadeOut')
					.addClass( 'fadeIn animated' );

			}, 200);

			// Dots
			self.$el
				.find('.owl-dot')
				.removeClass('active')
				.eq( $nextSlide.index() )
				.addClass('active');

			self.$el.trigger({
				type: 'change.owl.carousel',
				nextSlideIndex: $nextSlide.index(),
				prevSlideIndex: $prevSlide.index()
			});

			setTimeout(() => {
				self.$el.trigger({
					type: 'changed.owl.carousel',
					nextSlideIndex: $nextSlide.index(),
					prevSlideIndex: $prevSlide.index()
				});
			}, 500);
		}

        owlNav() {
			const self = this, $owlNext = self.$el.find('.owl-next'), $owlPrev = self.$el.find('.owl-prev');

			$owlPrev.on('click', e => {
				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				self.owlPrev();
			});

			$owlNext.on('click', e => {
				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				self.owlNext();
			});

			return this;
		}

        owlDots() {
			const self = this, $owlDot = self.$el.find('.owl-dot');

			$owlDot.on('click', function(e){
				let $this = $(this);

				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				const dotIndex = $(this).index();

				// Do nothing if respective dot slide is active/showing
				if( $this.hasClass('active') ) {
					return false;
				}

				self.changeSlide( self.$el.find('.owl-item').eq( dotIndex ) );
			});

			return this;
		}

        owlPrev() {
			const self = this;

			if( self.$el.find('.owl-item.active').prev().get(0) ) {
				self.changeSlide( self.$el.find('.owl-item.active').prev() );
			} else {
				self.changeSlide( self.$el.find('.owl-item:last-child') );
			}
		}

        owlNext() {
			const self = this;

			if( self.$el.find('.owl-item.active').next().get(0) ) {
				self.changeSlide( self.$el.find('.owl-item.active').next() );
			} else {
				self.changeSlide( self.$el.find('.owl-item').eq(0) );
			}
		}

        avoidMultipleClicks() {
			const self = this;

			if( !self.clickFlag ) {
				return true;
			}

			if( self.clickFlag ) {
				self.clickFlag = false;
				setTimeout(() => {
					self.clickFlag = true; 
				}, 1000);
			}

			return false;
		}

        autoPlay() {
			const self = this, $el  = this.options.wrapper;

			if( self.options.autoplay ) {
				self.autoPlayInterval = window.setInterval(() => {
					self.owlNext();
				}, self.options.autoplayTimeout);
			}

			return this;
		}

        carouselNavigate() {
			const self      = this, $el       = this.options.wrapper, $carousel = $el;

			if( $('[data-carousel-navigate]').get(0) ) {
				$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').each(function(){
					const $this = $(this), hasCarousel = $( $this.data('carousel-navigate-id') ).get(0), toIndex = $this.data('carousel-navigate-to');

					if( hasCarousel ) {

						$this.on('click', () => {

							if( self.options.disableAutoPlayOnClick ) {
								window.clearInterval(self.autoPlayInterval);
							}
							
							self.changeSlide( self.$el.find('.owl-item').eq( parseInt(toIndex) - 1 ) );
						});

					}
				});

				$el.on('change.owl.carousel', e => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').removeClass('active');
				});

				$el.on('changed.owl.carousel', ({nextSlideIndex}) => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"][data-carousel-navigate-to="'+ ( nextSlideIndex + 1 ) +'"]').addClass('active');
				});
			}

			return this;
		}

        events() {
			const self = this;

			self.$el.on('change.owl.carousel', event => {

				// Hide elements inside carousel
			    self.$el.find('[data-appear-animation]:not(.background-image-wrapper), [data-plugin-animated-letters]').addClass('invisible');

			    // Animated Letters
			    self.$el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');

			    // Remove "d-none" class before show the element. This is useful when using background images inside a carousel. Like ken burns effect
			    self.$el.find('.owl-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');

			});

			self.$el.on('changed.owl.carousel', event => {
				setTimeout(() => {

				    // Appear Animation
				    if( self.$el.find('.owl-item.cloned [data-appear-animation]').get(0) ) {
				    	self.$el.find('.owl-item.cloned [data-appear-animation]').each(function() {
                            const $this = $(this);
                            let opts;

                            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                            if (pluginOptions)
								opts = pluginOptions;

                            $this.themestrapPluginAnimate(opts);
                        });
				    }

					// Show elements inside carousel
				    self.$el.find('.owl-item.active [data-appear-animation]:not(.background-image-wrapper), [data-plugin-animated-letters]').removeClass('invisible');

				    // Animated Letters
				    self.$el.find('.owl-item.active [data-plugin-animated-letters]').trigger('animated.letters.initialize');

				    // Background Video
				    self.$el.find('.owl-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');

				}, 500);
			    
			});

			if( self.options.swipeEvents ) {
				self.$el.swipe({
					swipe(event, direction, distance, duration, fingerCount, fingerData) {
						switch ( direction ) {
							case 'right':
								self.owlPrev();
							break;
				
							case 'left':
								self.owlNext();
							break;
						}
					},
					allowPageScroll: "vertical"
				});
			}
		}
    }

    PluginCarouselLight.defaults = {
		autoplay: true,
		autoplayTimeout: 7000,
		disableAutoPlayOnClick: true,
		swipeEvents: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCarouselLight
	});

    // jquery plugin
    $.fn.themestrapPluginCarouselLight = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCarouselLight($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);
