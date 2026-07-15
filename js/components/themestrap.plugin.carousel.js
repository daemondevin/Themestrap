(((themestrap = {}, $) => {
    const instanceName = '__carousel';

    class PluginCarousel {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;

			// If has data-icon inside, initialize only after icons get rendered
			// Prevent flicking issues
			if( $el.find('[data-icon]').get(0) ) {
				const self = this;

				$(window).on('icon.rendered', function(){
					if ($el.data(instanceName)) {
						return this;
					}

					setTimeout(() => {
						self
							.setData()
							.setOptions(opts)
							.build();
					}, 1000);
				});

				return this;
			}

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
			this.options = $.extend(true, {}, PluginCarousel.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.owlCarousel))) {
				return this;
			}

			const self = this, $el = this.options.wrapper;

			// Add Themestrap Class
			$el.addClass('owl-themestrap');

			// Add Loading
			$el.addClass('owl-loading');

			// Force RTL according to HTML dir attribute
			if ($('html').attr('dir') == 'rtl') {
				this.options = $.extend(true, {}, this.options, {
					rtl: true
				});
			}

			if (this.options.items == 1) {
				this.options.responsive = {}
			}

			if (this.options.items > 4) {
				this.options = $.extend(true, {}, this.options, {
					responsive: {
						1199: {
							items: this.options.items
						}
					}
				});
			}

			// Auto Height Fixes
			if (this.options.autoHeight) {
				const itemsHeight = [];

				$el.find('.owl-item').each(function(){
					if( $(this).hasClass('active') ) {
						itemsHeight.push( $(this).height() );
					}
				});

				$(window).afterResize(() => {
					$el.find('.owl-stage-outer').height( Math.max.apply(null, itemsHeight) );
				});

				$(window).on('load', () => {
					$el.find('.owl-stage-outer').height( Math.max.apply(null, itemsHeight) );
				});
			}

			// Initialize OwlCarousel
			$el.owlCarousel(this.options).addClass('owl-carousel-init animated fadeIn');

			// Remove "animated fadeIn" class to prevent conflicts
			setTimeout(() => {
				$el.removeClass('animated fadeIn');
			}, 1000);

			// Owl Carousel Wrapper
			if( $el.closest('.owl-carousel-wrapper').get(0) ) {
				setTimeout(() => {
					$el.closest('.owl-carousel-wrapper').css({
						height: ''
					});
				}, 500);
			}

			// Owl Carousel Loader
			if( $el.prev().hasClass('owl-carousel-loader') ) {
				$el.prev().remove();
			}

			// Nav Offset
			self.navigationOffsets();

			// Nav Outside
			if( $el.hasClass('nav-outside') ) {
				$(window).on('owl.carousel.nav.outside', () => {
					if( $(window).width() < 992 ) {
						self.options.stagePadding = 40;
						$el.addClass('stage-margin');
					} else {
						self.options.stagePadding = 0;
						$el.removeClass('stage-margin');
					}

					$el.owlCarousel('destroy').owlCarousel( self.options );

					// Nav Offset
					self.navigationOffsets();
				});

				// Window Resize
				$(window).on('load', () => {
					$(window).afterResize(() => {
						$(window).trigger('owl.carousel.nav.outside');
					});
				});

				// First Load
				$(window).trigger('owl.carousel.nav.outside');
			}

			// Nav style 5 (SVG Arrows)
			if( $el.hasClass('nav-svg-arrows-1') ) {
				const svg_arrow = '' +
					'<svg version="1.1" viewBox="0 0 15.698 8.706" width="17" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
						'<polygon stroke="#212121" stroke-width="0.1" fill="#212121" points="11.354,0 10.646,0.706 13.786,3.853 0,3.853 0,4.853 13.786,4.853 10.646,8 11.354,8.706 15.698,4.353 "/>' +
					'</svg>';

				$el.find('.owl-next, .owl-prev').append( svg_arrow );
			}

			// Sync
			if( $el.attr('data-sync') ) {
				$el.on('change.owl.carousel', ({namespace, property, relatedTarget}) => {
					if (namespace && property.name === 'position') {
					    const target = relatedTarget.relative(property.value, true);
					    $( $el.data('sync') ).owlCarousel('to', target, 300, true);				        
				  	}
				});
			}

			// Carousel Center Active Item
			if( $el.hasClass('carousel-center-active-item') ) {
				const itemsActive    = $el.find('.owl-item.active'), indexCenter    = Math.floor( ($el.find('.owl-item.active').length - 1) / 2 ), itemCenter     = itemsActive.eq(indexCenter);

				itemCenter.addClass('current');

				$el.on('change.owl.carousel', event => {
				  	$el.find('.owl-item').removeClass('current');
					
					setTimeout(() => {
					  	const itemsActive    = $el.find('.owl-item.active'), indexCenter    = Math.floor( ($el.find('.owl-item.active').length - 1) / 2 ), itemCenter     = itemsActive.eq(indexCenter);

					  	itemCenter.addClass('current');
					}, 100);
				});

				// Refresh
				$el.trigger('refresh.owl.carousel');

			}

			// AnimateIn / AnimateOut Fix
			if( self.options.animateIn || self.options.animateOut ) {
				$el.on('change.owl.carousel', event => {

					// Hide elements inside carousel
				    $el.find('[data-appear-animation], [data-plugin-animated-letters]').addClass('d-none');

				    // Animated Letters
				    $el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');

				    // Remove "d-none" class before show the element. This is useful when using background images inside a carousel. Like ken burns effect
				    $el.find('.owl-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');

				});

				$el.on('changed.owl.carousel', event => {
					setTimeout(() => {

					    // Appear Animation
				    	$el.find('[data-appear-animation]').each(function() {
                            const $this = $(this);
                            let opts;

                            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                            if (pluginOptions)
								opts = pluginOptions;

                            $this.themestrapPluginAnimate(opts);
                        });

						// Show elements inside carousel
					    $el.find('.owl-item.active [data-appear-animation], [data-plugin-animated-letters]').removeClass('d-none');

					    // Animated Letters
					    $el.find('.owl-item.active [data-plugin-animated-letters]').trigger('animated.letters.initialize');

					    // Background Video
					    $el.find('.owl-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');

					}, 10);
				    
				});
			}

			// data-icon inside carousel
			if( $el.find('[data-icon]').length ) {
				$el.on('change.owl.carousel drag.owl.carousel', () => {
					$el.find('.owl-item.cloned [data-icon]').each(function(){
                        const $this = $(this);
                        let opts;

                        const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                        if (pluginOptions)
							opts = pluginOptions;

                        $this.themestrapPluginIcon(opts);
                    });
				});
			}

			// Render Background Videos inside carousel. Just a trigger on window is sufficient to render
			if( $el.find('[data-plugin-video-background]').get(0) ) {
				$(window).resize();
			}

			// Remove Loading
			$el.removeClass('owl-loading');

			// Remove Height
			$el.css('height', 'auto');

			// Carousel Navigate By ID and item index
			self.carouselNavigate();

			// Refresh Carousel
			if( self.options.refresh ) {
				$el.owlCarousel('refresh');
			}

			return this;
		}

        navigationOffsets() {
			const self 			 = this, $el  			 = this.options.wrapper, navHasTransform  = $el.find('.owl-nav').css('transform') == 'none' ? false : true, dotsHasTransform = $el.find('.owl-dots').css('transform') == 'none' ? false : true;

			// ************* NAV *****************
			// Nav Offset - Horizontal
			if( self.options.navHorizontalOffset && !self.options.navVerticalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d('+ self.options.navHorizontalOffset +', 0, 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						left: self.options.navHorizontalOffset
					});
				}
			}

			// Nav Offset - Vertical
			if( self.options.navVerticalOffset && !self.options.navHorizontalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d(0, '+ self.options.navVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						top: 'calc( 50% - '+ self.options.navVerticalOffset +' )'
					});
				}
			}

			// Nav Offset - Horizontal & Vertical
			if( self.options.navVerticalOffset && self.options.navHorizontalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d('+ self.options.navHorizontalOffset +', '+ self.options.navVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						top: 'calc( 50% - '+ self.options.navVerticalOffset +' )',
						left: self.options.navHorizontalOffset
					});
				}
			}

			// ********** DOTS *********************
			// Dots Offset - Horizontal
			if( self.options.dotsHorizontalOffset && !self.options.dotsVerticalOffset ) {
				$el.find('.owl-dots').css({
					transform: 'translate3d('+ self.options.dotsHorizontalOffset +', 0, 0)'
				});
			}

			// Dots Offset - Vertical
			if( self.options.dotsVerticalOffset && !self.options.dotsHorizontalOffset ) {
				if( !dotsHasTransform ) {
					$el.find('.owl-dots').css({
						transform: 'translate3d(0, '+ self.options.dotsVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-dots').css({
						top: 'calc( 50% - '+ self.options.dotsVerticalOffset +' )'
					});
				}
			}

			// Dots Offset - Horizontal & Vertical
			if( self.options.dotsVerticalOffset && self.options.dotsHorizontalOffset ) {
				$el.find('.owl-dots').css({
					transform: 'translate3d('+ self.options.dotsHorizontalOffset +', '+ self.options.dotsVerticalOffset +', 0)'
				});
			}

			return this;
		}

        carouselNavigate() {
			const self      = this, $el       = this.options.wrapper, $carousel = $el.data('owl.carousel');

			if( $('[data-carousel-navigate]').get(0) ) {
				$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').each(function(){
					const $this = $(this), hasCarousel = $( $this.data('carousel-navigate-id') ).get(0), toIndex = $this.data('carousel-navigate-to');

					if( hasCarousel ) {

						$this.on('click', () => {
							$carousel.to( parseInt(toIndex) - 1 );
						});

					}
				});

				$el.on('change.owl.carousel', () => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').removeClass('active');
				});

				$el.on('changed.owl.carousel', ({item}) => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"][data-carousel-navigate-to="'+ ( item.index + 1 ) +'"]').addClass('active');
				});
			}

			return this;
		}
    }

    PluginCarousel.defaults = {
		loop: true,
		responsive: {
			0: {
				items: 1
			},
			479: {
				items: 1
			},
			768: {
				items: 2
			},
			979: {
				items: 3
			},
			1199: {
				items: 4
			}
		},
		navText: [],
		refresh: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCarousel
	});

    // jquery plugin
    $.fn.themestrapPluginCarousel = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCarousel($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
