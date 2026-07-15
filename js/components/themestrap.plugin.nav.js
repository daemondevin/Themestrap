// Nav
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Nav: {

			defaults: {
				wrapper: $('#mainNav'),
				scrollDelay: 600,
				scrollAnimation: 'easeOutQuad'
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

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
                const self = this;
                const $html = $('html');
                const $header = $('#header');
                const $headerNavMain = $('#header .header-nav-main');
                let thumbInfoPreview;

                // Preview Thumbs
                if( self.$wrapper.find('a[data-thumb-preview]').length ) {
					self.$wrapper.find('a[data-thumb-preview]').each(function() {
						thumbInfoPreview = $('<span />').addClass('thumb-info thumb-info-preview')
												.append($('<span />').addClass('thumb-info-wrapper')
													.append($('<span />').addClass('thumb-info-image').css('background-image', 'url(' + $(this).data('thumb-preview') + ')')
											   )
										   );

						$(this).append(thumbInfoPreview);
					});
				}

                // Side Header / Side Header Hamburguer Sidebar (Reverse Dropdown)
                if($html.hasClass('side-header') || $html.hasClass('side-header-hamburguer-sidebar')) {
					
					// Side Header Right / Side Header Hamburguer Sidebar Right
					if($html.hasClass('side-header-right') || $html.hasClass('side-header-hamburguer-sidebar-right')) {
						if(!$html.hasClass('side-header-right-no-reverse')) {
							$header.find('.dropdown-submenu').addClass('dropdown-reverse');
						}
					}

				} else {
					
					// Reverse
					let checkReverseFlag = false;
					self.checkReverse = () => {
						if( !checkReverseFlag ) {
							self.$wrapper.find('.dropdown, .dropdown-submenu').removeClass('dropdown-reverse');

							self.$wrapper.find('.dropdown:not(.manual):not(.dropdown-mega), .dropdown-submenu:not(.manual)').each(function() {
								if(!$(this).find('.dropdown-menu').visible( false, true, 'horizontal' )  ) {
									$(this).addClass('dropdown-reverse');
								}
							});

							checkReverseFlag = true;
						}
					}

					$(window).on('resize', () => {
						checkReverseFlag = false;
					});

					$header.on('mouseover', () => {
						self.checkReverse();
					});

				}

                // Clone Items
                if($headerNavMain.hasClass('header-nav-main-clone-items')) {

			    	$headerNavMain.find('nav > ul > li > a').each(function(){
				    	const parent = $(this).parent(), clone  = $(this).clone(), clone2 = $(this).clone(), wrapper = $('<span class="wrapper-items-cloned"></span>');

				    	// Config Classes
				    	$(this).addClass('item-original');
				    	clone2.addClass('item-two');

				    	// Insert on DOM
				    	parent.prepend(wrapper);
				    	wrapper.append(clone).append(clone2);
				    });

				}

                // Floating
                if($('#header.header-floating-icons').length && $(window).width() > 991) {

					const menuFloatingAnim = {
						$menuFloating: $('#header.header-floating-icons .header-container > .header-row'),

						build() {
							const self = this;

							self.init();
						},
						init() {
                            const self  = this;
                            let divisor = 0;

                            $(window).scroll(function() {
							    const scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height()), st = $(this).scrollTop();

								divisor = $(document).height() / $(window).height();

							    self.$menuFloating.find('.header-column > .header-row').css({
							    	transform : 'translateY( calc('+ scrollPercent +'vh - '+ st / divisor +'px) )' 
							    });
							});
                        }
					};

					menuFloatingAnim.build();

				}

                // Slide
                if($('.header-nav-links-vertical-slide').length) {
					const slideNavigation = {
						$mainNav: $('#mainNav'),
						$mainNavItem: $('#mainNav li'),

						build() {
							const self = this;

							self.menuNav();
						},
						menuNav() {
							const self = this;

							self.$mainNavItem.on('click', function(e){
								const currentMenuItem 	= $(this), currentMenu 		= $(this).parent(), nextMenu        	= $(this).find('ul').first(), prevMenu        	= $(this).closest('.next-menu'), isSubMenu       	= currentMenuItem.hasClass('dropdown') || currentMenuItem.hasClass('dropdown-submenu'), isBack          	= currentMenuItem.hasClass('back-button'), nextMenuHeightDiff  = ( ( nextMenu.find('> li').length * nextMenu.find('> li').outerHeight() ) - nextMenu.outerHeight() ), prevMenuHeightDiff  = ( ( prevMenu.find('> li').length * prevMenu.find('> li').outerHeight() ) - prevMenu.outerHeight() );

								if( isSubMenu ) {
									currentMenu.addClass('next-menu');
									nextMenu.addClass('visible');
									currentMenu.css({
										overflow: 'visible',
										'overflow-y': 'visible'
									});
									
									if( nextMenuHeightDiff > 0 ) {
										nextMenu.css({
											overflow: 'hidden',
											'overflow-y': 'scroll'
										});
									}

									for( i = 0; i < nextMenu.find('> li').length; i++ ) {
										if( nextMenu.outerHeight() < ($('.header-row-side-header').outerHeight() - 100) ) {
											nextMenu.css({
												height: nextMenu.outerHeight() + nextMenu.find('> li').outerHeight()
											});
										}
									}

									nextMenu.css({
										'padding-top': nextMenuHeightDiff + 'px'
									});
								}

								if( isBack ) {
									currentMenu.parent().parent().removeClass('next-menu');
									currentMenu.removeClass('visible');

									if( prevMenuHeightDiff > 0 ) {
										prevMenu.css({
											overflow: 'hidden',
											'overflow-y': 'scroll'
										});
									}
								}

								e.stopPropagation();
							});
						}
					};

					$(window).trigger('resize');
					
					if( $(window).width() > 991 ) {
						slideNavigation.build();
					}

					$(document).ready(() => {
						$(window).afterResize(() => {
							if( $(window).width() > 991 ) {
								slideNavigation.build();
							}
						});
					});
				}

                // Header Nav Main Mobile Dark
                if($('.header-nav-main-mobile-dark').length) {
					$('#header:not(.header-transparent-dark-bottom-border):not(.header-transparent-light-bottom-border)').addClass('header-no-border-bottom');
				}

                // Keyboard Navigation / Accessibility
                if( $(window).width() > 991 ) {
					let focusFlag = false;
					$header.find('.header-nav-main nav > ul > li > a').on('focus', function(){
						
						if( $(window).width() > 991 ) {
							if( !focusFlag ) {
								focusFlag = true;
								$(this).trigger('blur');
								
								self.focusMenuWithChildren();
							}
						}

					});
				}

                return this;
            },

			focusMenuWithChildren() {
                // Get all the link elements within the primary menu.
                let links;

                let i;
                let len;
                const menu = document.querySelector( 'html:not(.side-header):not(.side-header-hamburguer-sidebar):not(.side-header-overlay-full-screen) .header-nav-main > nav' );

                if ( ! menu ) {
					return false;
				}

                links = menu.getElementsByTagName( 'a' );

                // Each time a menu link is focused or blurred, toggle focus.
                for ( i = 0, len = links.length; i < len; i++ ) {
					links[i].addEventListener( 'focus', toggleFocus, true );
					links[i].addEventListener( 'blur', toggleFocus, true );
				}

                //Sets or removes the .focus class on an element.
                function toggleFocus() {
					let self = this;

					// Move up through the ancestors of the current link until we hit .primary-menu.
					while ( !self.className.includes('header-nav-main') ) {
						// On li elements toggle the class .focus.
						if ( 'li' === self.tagName.toLowerCase() ) {
							if ( self.className.includes('accessibility-open') ) {
								self.className = self.className.replace( ' accessibility-open', '' );
							} else {
								self.className += ' accessibility-open';
							}
						}
						self = self.parentElement;
					}
				}
            },

			events() {
                const self    = this;
                const $html   = $('html');
                let $header = $('#header');
                const $window = $(window);
                let headerBodyHeight = $('.header-body').outerHeight();

                if( $header.hasClass('header') ) {
					$header = $('.header');
				}

                $header.find('a[href="#"]').on('click', e => {
					e.preventDefault();
				});

                // Mobile Arrows
                if( $html.hasClass('side-header-hamburguer-sidebar') ) {
					$header.find('.dropdown-toggle, .dropdown-submenu > a')
						.append('<i class="fas fa-chevron-down fa-chevron-right"></i>');
				} else {
					$header.find('.dropdown-toggle, .dropdown-submenu > a')
						.append('<i class="fas fa-chevron-down"></i>');
				}

                $header.find('.dropdown-toggle[href="#"], .dropdown-submenu a[href="#"], .dropdown-toggle[href!="#"] .fa-chevron-down, .dropdown-submenu a[href!="#"] .fa-chevron-down').on('click', function(e) {
					e.preventDefault();
					if ($window.width() < 992) {
						$(this).closest('li').toggleClass('open');

						// Adjust Header Body Height
						const height = ( $header.hasClass('header-effect-shrink') && $html.hasClass('sticky-header-active') ) ? themestrap.StickyHeader.options.stickyHeaderContainerHeight : headerBodyHeight;
						$('.header-body').animate({
					 		height: ($('.header-nav-main nav').outerHeight(true) + height) + 10
					 	}, 0);
					}
				});

                $header.find('li a.active').addClass('current-page-active');

                // Add Open Class
                $header.find('.header-nav-click-to-open .dropdown-toggle[href="#"], .header-nav-click-to-open .dropdown-submenu a[href="#"], .header-nav-click-to-open .dropdown-toggle > i').on('click', function(e) {
					if( !$('html').hasClass('side-header-hamburguer-sidebar') && $window.width() > 991 ) {
						e.preventDefault();
						e.stopPropagation();
					}

					if ($window.width() > 991) {
						e.preventDefault();
						e.stopPropagation();

						$header.find('li a.active').removeClass('active');

						if( $(this).prop('tagName') == 'I' ) {
							$(this).parent().addClass('active');
						} else {
							$(this).addClass('active');
						}

						if (!$(this).closest('li').hasClass('open')) {
                            const $li = $(this).closest('li');
                            let isSub = false;

                            if( $(this).prop('tagName') == 'I' ) {
								$('#header .dropdown.open').removeClass('open');
								$('#header .dropdown-menu .dropdown-submenu.open').removeClass('open');
							}

                            if ( $(this).parent().hasClass('dropdown-submenu') ) {
								isSub = true;
							}

                            $(this).closest('.dropdown-menu').find('.dropdown-submenu.open').removeClass('open');
                            $(this).parent('.dropdown').parent().find('.dropdown.open').removeClass('open');

                            if (!isSub) {
								$(this).parent().find('.dropdown-submenu.open').removeClass('open');
							}

                            $li.addClass('open');

                            $(document).off('click.nav-click-to-open').on('click.nav-click-to-open', ({target}) => {
								if (!$li.is(target) && $li.has(target).length === 0) {
									$li.removeClass('open');
									$li.parents('.open').removeClass('open');
									$header.find('li a.active').removeClass('active');
									$header.find('li a.current-page-active').addClass('active');
								}
							});
                        } else {
							$(this).closest('li').removeClass('open');
							$header.find('li a.active').removeClass('active');
							$header.find('li a.current-page-active').addClass('active');
						}

						$window.trigger({
							type: 'resize',
							from: 'header-nav-click-to-open'
						});
					}
				});

                // Collapse Nav
                $header.find('[data-collapse-nav]').on('click', function(e) {
					$(this).parents('.collapse').removeClass('show');
				});

                // Top Features
                $header.find('.header-nav-features-toggle').on('click', function(e) {
					e.preventDefault();

					const $toggleParent = $(this).parent();

					if (!$(this).siblings('.header-nav-features-dropdown').hasClass('show')) {

						const $dropdown = $(this).siblings('.header-nav-features-dropdown');

						$('.header-nav-features-dropdown.show').removeClass('show');

						$dropdown.addClass('show');

						$(document).off('click.header-nav-features-toggle').on('click.header-nav-features-toggle', ({target}) => {
							if (!$toggleParent.is(target) && $toggleParent.has(target).length === 0) {
								$('.header-nav-features-dropdown.show').removeClass('show');
							}
						});

						if ($(this).attr('data-focus')) {
							$('#' + $(this).attr('data-focus')).focus();
						}

					} else {
						$(this).siblings('.header-nav-features-dropdown').removeClass('show');
					}
				});

                // Hamburguer Menu
                const $hamburguerMenuBtn = $('.hamburguer-btn:not(.side-panel-toggle)'), $hamburguerSideHeader = $('#header.side-header, #header.side-header-overlay-full-screen');

                $hamburguerMenuBtn.on('click', function(){
					if($(this).attr('data-set-active') != 'false') {
						$(this).toggleClass('active');
					}
					$hamburguerSideHeader.toggleClass('side-header-hide');
					$html.toggleClass('side-header-hide');

					$window.trigger('resize');
				});

                // Toggle Side Header
                $('.toggle-side-header').on('click', () => {
					$('.hamburguer-btn-side-header.active').trigger('click');
				});

                $('.hamburguer-close:not(.side-panel-toggle)').on('click', () => {
					$('.hamburguer-btn:not(.hamburguer-btn-side-header-mobile-show)').trigger('click');
				});

                // Set Header Body Height when open mobile menu
                $('.header-nav-main nav').on('show.bs.collapse', function () {
				 	$(this).removeClass('closed');

				 	// Add Mobile Menu Opened Class
				 	$('html').addClass('mobile-menu-opened');

			 		$('.header-body').animate({
				 		height: ($('.header-body').outerHeight() + $('.header-nav-main nav').outerHeight(true)) + 10
				 	});

				 	// Header Below Slider / Header Bottom Slider - Scroll to menu position
				 	if( $('#header').is('.header-bottom-slider, .header-below-slider') && !$('html').hasClass('sticky-header-active') ) {
				 		self.scrollToTarget( $('#header'), 0 );
				 	}
				});

                // Set Header Body Height when collapse mobile menu
                $('.header-nav-main nav').on('hide.bs.collapse', function () {
				 	$(this).addClass('closed');

				 	// Remove Mobile Menu Opened Class
				 	$('html').removeClass('mobile-menu-opened');

			 		$('.header-body').animate({
				 		height: ($('.header-body').outerHeight() - $('.header-nav-main nav').outerHeight(true))
				 	}, function(){
				 		$(this).height('auto');
				 	});
				});

                // Header Effect Shrink - Adjust header body height on mobile
                $window.on('stickyHeader.activate', () => {
					if( $window.width() < 992 && $header.hasClass('header-effect-shrink') ) {
						if( $('.header-btn-collapse-nav').attr('aria-expanded') == 'true' ) {
							$('.header-body').animate({
						 		height: ( $('.header-nav-main nav').outerHeight(true) + themestrap.StickyHeader.options.stickyHeaderContainerHeight ) + ( ($('.header-nav-bar').length) ? $('.header-nav-bar').outerHeight() : 0 ) 
						 	});
						}
					}
				});

                $window.on('stickyHeader.deactivate', () => {
					if( $window.width() < 992 && $header.hasClass('header-effect-shrink') ) {
						if( $('.header-btn-collapse-nav').attr('aria-expanded') == 'true' ) {
							$('.header-body').animate({
						 		height: headerBodyHeight + $('.header-nav-main nav').outerHeight(true) + 10
						 	});
						}
					}
				});

                // Remove Open Class on Resize		
                $window.on('resize.removeOpen', ({from}) => {
					if( from == 'header-nav-click-to-open' ) {
						return;
					}
					
					setTimeout(() => {
						if( $window.width() > 991 ) {
							$header.find('.dropdown.open').removeClass('open');
						}
					}, 100);
				});

                // Side Header - Change value of initial header body height
                $(document).ready(() => {
					if( $window.width() > 991 ) {
						let flag = false;
						
						$window.on('resize', ({from}) => {
							if( from == 'header-nav-click-to-open' ) {
								return;
							}

							$header.find('.dropdown.open').removeClass('open');

							if( $window.width() < 992 && flag == false ) {
								headerBodyHeight = $('.header-body').outerHeight();
								flag = true;

								setTimeout(() => {
									flag = false;
								}, 500);
							}
						});
					}
				});

                // Side Header - Set header height on mobile
                if( $html.hasClass('side-header') ) {
					if( $window.width() < 992 ) {
						$header.css({
							height: $('.header-body .header-container').outerHeight() + (parseInt( $('.header-body').css('border-top-width') ) + parseInt( $('.header-body').css('border-bottom-width') ))
						});
					}

					$(document).ready(() => {
						$window.afterResize(() => {
							if( $window.width() < 992 ) {
								$header.css({
									height: $('.header-body .header-container').outerHeight() + (parseInt( $('.header-body').css('border-top-width') ) + parseInt( $('.header-body').css('border-bottom-width') ))
								});
							} else {
								$header.css({
									height: ''
								});
							}
						});
					});
				}

                // Anchors Position
                if( $('[data-hash]').length ) {
					$('[data-hash]').on('mouseover', function(){
						const $this = $(this);

						if( !$this.data('__dataHashBinded') ) {
                            let target = $this.attr('href');
                            let offset = ($this.is("[data-hash-offset]") ? $this.data('hash-offset') : 0);
                            const delay  = ($this.is("[data-hash-delay]") ? $this.data('hash-delay') : 0);
                            const force  = ($this.is("[data-hash-force]") ? true : false);
                            const windowWidth = $(window).width();

                            // Hash Offset SM
                            if ($this.is("[data-hash-offset-sm]") && windowWidth > 576) {
								offset = $this.data('hash-offset-sm');
							}

                            // Hash Offset MD
                            if ($this.is("[data-hash-offset-md]") && windowWidth > 768) {
								offset = $this.data('hash-offset-md');
							}

                            // Hash Offset LG
                            if ($this.is("[data-hash-offset-lg]") && windowWidth > 992) {
								offset = $this.data('hash-offset-lg');
							}

                            // Hash Offset XL
                            if ($this.is("[data-hash-offset-xl]") && windowWidth > 1200) {
								offset = $this.data('hash-offset-xl');
							}

                            // Hash Offset XXL
                            if ($this.is("[data-hash-offset-xxl]") && windowWidth > 1400) {
								offset = $this.data('hash-offset-xxl');
							}

                            if( !$(target).length ) {
								target = target.split('#');
								target = '#'+target[1];
							}

                            if( target.includes('#') && $(target).length) {
								$this.on('click', e => {
									e.preventDefault();

									if( !$(e.target).is('i') || force ) {

										setTimeout(() => {

											// Close Collapse if open
											$this.parents('.collapse.show').collapse('hide');

											// Close Side Header
											$hamburguerSideHeader.addClass('side-header-hide');
											$html.addClass('side-header-hide');
											
											$window.trigger('resize');

											self.scrollToTarget(target, offset);

											// Data Hash Trigger Click
											if( $this.data('hash-trigger-click') ) {

												const $clickTarget = $( $this.data('hash-trigger-click') ), clickDelay = $this.data('hash-trigger-click-delay') ? $this.data('hash-trigger-click-delay') : 0;

												if( $clickTarget.length ) {

													setTimeout(() => {
														// If is a "Tabs" plugin link
														if( $clickTarget.closest('.nav-tabs').length ) {
															new bootstrap.Tab( $clickTarget[0] ).show();
														} else {
															$clickTarget.trigger('click');
														}
														
													}, clickDelay);
												}

											}

										}, delay);
										
									}

									return;
								});
							}

                            $(this).data('__dataHashBinded', true);
                        }
					});
				}

                // Floating
                if($('#header.header-floating-icons').length) {

					$('#header.header-floating-icons [data-hash]').off().each(function() {

						const target = $(this).attr('href'), offset = ($(this).is("[data-hash-offset]") ? $(this).data('hash-offset') : 0);

						if($(target).length) {
							$(this).on('click', e => {
								e.preventDefault();

									$('html, body').animate({
										scrollTop: $(target).offset().top - offset
									}, 600, 'easeOutQuad', () => {

									});

								return;
							});
						}

					});

				}

                // Side Panel Toggle
                if( $('.side-panel-toggle').length ) {
					const init_html_class = $('html').attr('class');

					$('.side-panel-toggle').on('click', function(e){
						const extra_class = $(this).data('extra-class'), delay       = ( extra_class ) ? 100 : 0, isActive    = $(this).data('is-active') ? $(this).data('is-active') : false;

						e.preventDefault();

						if( isActive ) {
							$('html').removeClass('side-panel-open');
							$(this).data('is-active', false);
							return false;
						}

						if( extra_class ) {
							$('.side-panel-wrapper').css('transition','none');
							$('html')
								.removeClass()
								.addClass( init_html_class )
								.addClass( extra_class );
						}
						setTimeout(() => {
							$('.side-panel-wrapper').css('transition','');
							$('html').toggleClass('side-panel-open');
						}, delay);

						$(this).data('is-active', true);						
					});

					$(document).on('click', ({target}) => {
						if( !$(target).closest('.side-panel-wrapper').length && !$(target).hasClass('side-panel-toggle') ) {
							$('.hamburguer-btn.side-panel-toggle:not(.side-panel-close)').removeClass('active');
							$('html').removeClass('side-panel-open');
							$('.side-panel-toggle').data('is-active', false);
						}
					});
				}

				// OffCanvas
				self.offCanvasMenu();

                return this;
            },

			scrollToTarget(target, offset) {
				const self = this, targetPosition = $(target).offset().top;

				$('body').addClass('scrolling');

				$('html, body').animate({
					scrollTop: $(target).offset().top - offset
				}, self.options.scrollDelay, self.options.scrollAnimation, () => {
					$('body').removeClass('scrolling');

					// If by some reason the scroll finishes in a wrong position, this code will run the scrollToTarget() again until get the correct position
					// We need do it just one time to prevent infinite recursive loop at scrollToTarget() function
					if( $(target).offset().top !=  targetPosition) {
						$('html, body').animate({
							scrollTop: $(target).offset().top - offset
						}, 1, self.options.scrollAnimation, () => {});
					}
				});

				return this;

			},

			offCanvasMenu() {
                const $headerNavMain = $('#header .header-nav-main');
				const $offCanvasNav = $('.offcanvas-nav');

				if($offCanvasNav.length > 0) {
					const $navToClone = $headerNavMain.find('nav');

					if($navToClone.length > 0) {
						$offCanvasNav.html($offCanvasNav.html() + $navToClone.html());
						$offCanvasNav.find('#mainNav').removeAttr('id').removeClass().addClass('nav flex-column w-100');

						// Clean Classes
						$offCanvasNav.find('.dropdown').removeClass().addClass('dropdown');

						$offCanvasNav.find('.dropdown-item:not(.dropdown-toggle)').removeClass().addClass('dropdown-item');
						$offCanvasNav.find('.dropdown-item.dropdown-toggle').removeClass().addClass('dropdown-item dropdown-toggle');

						$offCanvasNav.find('.nav-link:not(.dropdown-toggle)').removeClass().addClass('nav-link');
						$offCanvasNav.find('.nav-link.dropdown-toggle').removeClass().addClass('nav-link dropdown-toggle');

						$offCanvasNav.find('.dropdown-menu').removeClass().addClass('dropdown-menu');

						// Dropdowns
						$offCanvasNav.find('.dropdown-toggle').each(function() {
							const $el = $(this);
							const $arrow = $el.find('i');

							$arrow.on('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								$el.parents('li').toggleClass('open');
							})

							if ($el.attr('href') == '#') {
								$el.on('click', function() {
									$arrow.trigger('click');
								});
							}
						});
					}
				}

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
