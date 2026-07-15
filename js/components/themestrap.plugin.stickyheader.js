// Sticky Header
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		StickyHeader: {

			defaults: {
				wrapper: $('#header'),
				headerBody: $('#header .header-body'),
				stickyEnabled: true,
				stickyEnableOnBoxed: true,
				stickyEnableOnMobile: false,
				stickyStartAt: 0,
				stickyStartAtElement: false,
				stickySetTop: 0,
				stickyEffect: '',
				stickyHeaderContainerHeight: false,
				stickyChangeLogo: false,
				stickyChangeLogoWrapper: true,
				stickyForce: false,
				stickyScrollUp: false,
				stickyScrollValue: 0
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}				

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				if( this.$wrapper.hasClass('header') ) {
					this.$wrapper = $('.header[data-plugin-options]');
				}

				this
					.setOptions(opts)
					.build()
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));
				return this;
			},

			build() {
                if( $(window).width() < 992 && this.options.stickyEnableOnMobile == false ) {
					$('html').addClass('sticky-header-mobile-disabled');
					return this;
				}

                if (!this.options.stickyEnableOnBoxed && $('html').hasClass('boxed') || $('html').hasClass('side-header-hamburguer-sidebar') && !this.options.stickyForce || !this.options.stickyEnabled) {
					return this;
				}

                const self = this;

                if( self.options.wrapper.hasClass('header') ) {
					self.options.wrapper = $('.header');
					self.options.headerBody = $('.header .header-body');
				}

                const $html = $('html');
                const $window = $(window);
                const sideHeader = $html.hasClass('side-header');
                const initialHeaderTopHeight = self.options.wrapper.find('.header-top').outerHeight();
                const initialHeaderContainerHeight = self.options.wrapper.find('.header-container').outerHeight();
                let minHeight;

                // HTML Classes
                $html.addClass('sticky-header-enabled');

                if (parseInt(self.options.stickySetTop) < 0) {
					$html.addClass('sticky-header-negative');
				}

                if (self.options.stickyScrollUp) {
					$html.addClass('sticky-header-scroll-direction');
				}

                // Notice Top Bar First Load
                if( $('.notice-top-bar').get(0) ) {
					if (parseInt(self.options.stickySetTop) == 1 || self.options.stickyEffect == 'shrink') {
						$('.body').on('transitionend webkitTransitionEnd oTransitionEnd', () => {
						    setTimeout(() => {
								if( !$html.hasClass('sticky-header-active') ) {
								    self.options.headerBody.animate({
								    	top: $('.notice-top-bar').outerHeight()
								    }, 300, () => {
								    	if( $html.hasClass('sticky-header-active') ) {
								    		self.options.headerBody.css('top', 0);
								    	}
								    });
								}
						    }, 0);
						});
					}					
				}

                // Set Start At
                if(self.options.stickyStartAtElement) {

					const $stickyStartAtElement = $(self.options.stickyStartAtElement);

					$(window).on('scroll resize sticky.header.resize', () => {
						self.options.stickyStartAt = $stickyStartAtElement.offset().top;
					});

					$(window).trigger('sticky.header.resize');
				}

                // Define Min Height value
                if( self.options.wrapper.find('.header-top').get(0) ) {
					minHeight = ( initialHeaderTopHeight + initialHeaderContainerHeight );
				} else {
					minHeight = initialHeaderContainerHeight;
				}

                // Set Wrapper Min-Height
                if( !sideHeader ) {
					if( !$('.header-logo-sticky-change').get(0) ) {
						self.options.wrapper.css('height', self.options.headerBody.outerHeight());
					} else {
						$window.on('stickyChangeLogo.loaded', () => {
							self.options.wrapper.css('height', self.options.headerBody.outerHeight());
						});
					}

					if( self.options.stickyEffect == 'shrink' ) {
						
						// Prevent wrong visualization of header when reload on middle of page
						$(document).ready(() => {
							if( $window.scrollTop() >= self.options.stickyStartAt ) {
								self.options.wrapper.find('.header-container').on('transitionend webkitTransitionEnd oTransitionEnd', () => {
									self.options.headerBody.css('position', 'fixed');
								});
							} else {
								if( !$html.hasClass('boxed') ) {
									self.options.headerBody.css('position', 'fixed');
								}
							}
						});

						self.options.wrapper.find('.header-container').css('height', initialHeaderContainerHeight);
						self.options.wrapper.find('.header-top').css('height', initialHeaderTopHeight);
					}
				}

                // Sticky Header Container Height
                if( self.options.stickyHeaderContainerHeight ) {
					self.options.wrapper.find('.header-container').css('height', self.options.wrapper.find('.header-container').outerHeight());
				}

                // Boxed
                if($html.hasClass('boxed') && self.options.stickyEffect == 'shrink') {
					self.boxedLayout();
				}

                // Check Sticky Header / Flags prevent multiple runs at same time
                let activate_flag   	 = true;

                let deactivate_flag 	 = false;
                const initialStickyStartAt = self.options.stickyStartAt;

                self.checkStickyHeader = () => {

					// Notice Top Bar
					const $noticeTopBar = $('.notice-top-bar');
					if ( $noticeTopBar.get(0) ) {
						self.options.stickyStartAt = ( $noticeTopBar.data('sticky-start-at') ) ? $noticeTopBar.data('sticky-start-at') : $('.notice-top-bar').outerHeight();
					} else {
						if( $html.hasClass('boxed') ) {
							self.options.stickyStartAt = initialStickyStartAt + 25;
						} else {
							self.options.stickyStartAt = initialStickyStartAt;
						}
					}

					if( $window.width() > 991 && $html.hasClass('side-header') ) {
						$html.removeClass('sticky-header-active');
						activate_flag = true;
						return;
					}

					if ($window.scrollTop() >= parseInt(self.options.stickyStartAt)) {
						if( activate_flag ) {
							self.activateStickyHeader();
							activate_flag = false;
							deactivate_flag = true;
						}
					} else {
						if( deactivate_flag ) {
							self.deactivateStickyHeader();
							deactivate_flag = false;
							activate_flag = true;
						}
					}

					// Scroll Up
					if (self.options.stickyScrollUp) {
						
					    // Get the new Value
					    self.options.stickyScrollNewValue = window.pageYOffset;

					    //Subtract the two and conclude
					    if(self.options.stickyScrollValue - self.options.stickyScrollNewValue < 0){
					        $html.removeClass('sticky-header-scroll-up').addClass('sticky-header-scroll-down');
					    } else if(self.options.stickyScrollValue - self.options.stickyScrollNewValue > 0){
					        $html.removeClass('sticky-header-scroll-down').addClass('sticky-header-scroll-up');
					    }

					    // Update the old value
					    self.options.stickyScrollValue = self.options.stickyScrollNewValue;

					}
				};

                // Activate Sticky Header
                self.activateStickyHeader = () => {
					if ($window.width() < 992) {
						if (self.options.stickyEnableOnMobile == false) {
							self.deactivateStickyHeader();
							self.options.headerBody.css({
								position: 'relative'
							});
							return false;
						}
					} else {
						if (sideHeader) {
							self.deactivateStickyHeader();
							return;
						}
					}

					$html.addClass('sticky-header-active');

					// Sticky Effect - Reveal
					if( self.options.stickyEffect == 'reveal' ) {

						self.options.headerBody.css('top','-' + self.options.stickyStartAt + 'px');

						self.options.headerBody.animate({
							top: self.options.stickySetTop
						}, 400, () => {});

					}

					// Sticky Effect - Shrink
					if( self.options.stickyEffect == 'shrink' ) {

						// If Header Top
						if( self.options.wrapper.find('.header-top').get(0) ) {
							self.options.wrapper.find('.header-top').css({
								height: 0,
								'min-height': 0,
								overflow: 'hidden'
							});
						}

						// Header Container
						if( self.options.stickyHeaderContainerHeight ) {
							self.options.wrapper.find('.header-container').css({
								height: self.options.stickyHeaderContainerHeight,
								'min-height': 0
							});
						} else {
							self.options.wrapper.find('.header-container').css({
								height: (initialHeaderContainerHeight / 3) * 2, // two third of container height
								'min-height': 0
							});

							const y = initialHeaderContainerHeight - ((initialHeaderContainerHeight / 3) * 2);
							$('.main').css({
								transform: 'translate3d(0, -'+ y +'px, 0)',
								transition: 'ease transform 300ms'
							}).addClass('has-sticky-header-transform');

							if($html.hasClass('boxed')) {
								self.options.headerBody.css('position','fixed');
							}
						}

					}

					self.options.headerBody.css('top', self.options.stickySetTop);

					if (self.options.stickyChangeLogo) {
						self.changeLogo(true);
					}

					// Set Elements Style
					if( $('[data-sticky-header-style]').length ) {
						$('[data-sticky-header-style]').each(function() {
							const $el = $(this), css = themestrap.fn.getOptions($el.data('sticky-header-style-active')), opts = themestrap.fn.getOptions($el.data('sticky-header-style'));

							if( $window.width() > opts.minResolution ) {
								$el.css(css);
							}
						});
					}

					$.event.trigger({
						type: 'stickyHeader.activate'
					});
				};

                // Deactivate Sticky Header
                self.deactivateStickyHeader = () => {
					$html.removeClass('sticky-header-active');

					if ( $(window).width() < 992 && self.options.stickyEnableOnMobile == false) {
						return false;
					}

					// Sticky Effect - Shrink
					if( self.options.stickyEffect == 'shrink' ) {

						// Boxed Layout
						if( $html.hasClass('boxed') ) {

							// Set Header Body Position Absolute
							self.options.headerBody.css('position','absolute');

							if( $window.scrollTop() > $('.body').offset().top ) {
								// Set Header Body Position Fixed
								self.options.headerBody.css('position','fixed');								
							}

						} else {
							// Set Header Body Position Fixed
							self.options.headerBody.css('position','fixed');
						}

						// If Header Top
						if( self.options.wrapper.find('.header-top').get(0) ) {
							self.options.wrapper.find('.header-top').css({
								height: initialHeaderTopHeight,
								overflow: 'visible'
							});

							// Fix [data-icon] issue when first load is on middle of the page
							if( self.options.wrapper.find('.header-top [data-icon]').length ) {
								themestrap.fn.intObsInit( '.header-top [data-icon]:not(.svg-inline--fa)', 'themestrapPluginIcon' );
							}
						}

						// Header Container
						self.options.wrapper.find('.header-container').css({
							height: initialHeaderContainerHeight
						});

					}

					self.options.headerBody.css('top', 0);

					if (self.options.stickyChangeLogo) {
						self.changeLogo(false);
					}

					// Set Elements Style
					if( $('[data-sticky-header-style]').length ) {
						$('[data-sticky-header-style]').each(function() {
							const $el = $(this), css = themestrap.fn.getOptions($el.data('sticky-header-style-deactive')), opts = themestrap.fn.getOptions($el.data('sticky-header-style'));

							if( $window.width() > opts.minResolution ) {
								$el.css(css);
							}
						});
					}

					$.event.trigger({
						type: 'stickyHeader.deactivate'
					});
				};

                // Always Sticky
                if (parseInt(self.options.stickyStartAt) <= 0) {
					self.activateStickyHeader();
				}

                // Set Logo
                if (self.options.stickyChangeLogo) {

					const $logoWrapper = self.options.wrapper.find('.header-logo'), $logo = $logoWrapper.find('img'), logoWidth = $logo.attr('width'), logoHeight = $logo.attr('height'), logoSmallTop = parseInt($logo.attr('data-sticky-top') ? $logo.attr('data-sticky-top') : 0), logoSmallWidth = parseInt($logo.attr('data-sticky-width') ? $logo.attr('data-sticky-width') : 'auto'), logoSmallHeight = parseInt($logo.attr('data-sticky-height') ? $logo.attr('data-sticky-height') : 'auto');

					if (self.options.stickyChangeLogoWrapper) {
						$logoWrapper.css({
							'width': $logo.outerWidth(true),
							'height': $logo.outerHeight(true)
						});
					}

					self.changeLogo = activate => {
						if(activate) {
							
							$logo.css({
								'top': logoSmallTop,
								'width': logoSmallWidth,
								'height': logoSmallHeight
							});

						} else {
							
							$logo.css({
								'top': 0,
								'width': logoWidth,
								'height': logoHeight
							});

						}
					}

					$.event.trigger({
						type: 'stickyChangeLogo.loaded'
					});

				}

                // Side Header
                let headerBodyHeight, flag = false;

                self.checkSideHeader = () => {
					if($window.width() < 992 && flag == false) {
						headerBodyHeight = self.options.headerBody.height();
						flag = true;
					}

					if(self.options.stickyStartAt == 0 && sideHeader) {
						self.options.wrapper.css('min-height', 0);
					}

					if(self.options.stickyStartAt > 0 && sideHeader && $window.width() < 992) {
						self.options.wrapper.css('min-height', headerBodyHeight);
					}
				}

                return this;
            },

			events() {
				const self = this;

				if( $(window).width() < 992 && this.options.stickyEnableOnMobile == false ) {
					return this;
				}

				if (!this.options.stickyEnableOnBoxed && $('body').hasClass('boxed') || $('html').hasClass('side-header-hamburguer-sidebar') && !this.options.stickyForce || !this.options.stickyEnabled) {
					return this;
				}

				if (!self.options.alwaysStickyEnabled) {
					$(window).on('scroll resize', () => {
						if ( $(window).width() < 992 && self.options.stickyEnableOnMobile == false) {
							self.options.headerBody.css({
								position: ''
							});

							if( self.options.stickyEffect == 'shrink' ) {
								self.options.wrapper.find('.header-top').css({
									height: ''
								});
							}

							self.deactivateStickyHeader();
						} else {
							self.checkStickyHeader();
						}
					});
				} else {
					self.activateStickyHeader();
				}

				$(window).on('load resize', () => {
					self.checkSideHeader();
				});

				$(window).on('layout.boxed', () => {
					self.boxedLayout();
				});

				return this;
			},

			boxedLayout() {
				const self = this, $window = $(window);

				if($('html').hasClass('boxed') && self.options.stickyEffect == 'shrink') {
					if( (parseInt(self.options.stickyStartAt) == 0) && $window.width() > 991) {
						self.options.stickyStartAt = 30;
					}

					// Set Header Body Position Absolute
					self.options.headerBody.css({
						position: 'absolute',
						top: 0
					});

					// Set position absolute because top margin from boxed layout
					$window.on('scroll', () => {
						if( $window.scrollTop() > $('.body').offset().top ) {
							self.options.headerBody.css({
								'position' : 'fixed',
								'top' : 0
							});								
						} else {
							self.options.headerBody.css({
								'position' : 'absolute',
								'top' : 0
							});
						}
					});
				}

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
