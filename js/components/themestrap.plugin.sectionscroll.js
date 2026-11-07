// Section Scroll
(((themestrap = {}, $) => {
    const instanceName = '__sectionScroll';
    let uid = 0;

    class PluginSectionScroll {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this._ns = '.tssectionscroll' + (++uid);
			this._timers = [];
			this._saved = [];

			this
				.setData()
				.setOptions(opts)
				.build()
				.events();

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginSectionScroll.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this, $el = this.options.wrapper;

			// Check type of header and change the target for header (by change header color purpose)
			if( $('html').hasClass('side-header-overlay-full-screen') ) {
				self.$header = $('.sticky-wrapper');
			} else {
				self.$header = $('#header');
			}

			// Remember everything this plugin restyles so destroy() can put it back
			self._htmlHadOverflow = $('html').hasClass('overflow-hidden');
			self._save($('.section-scroll'), ['style', 'class']);
			self._save(self.$header, ['style']);
			self._save($('#header .header-nav, #header .header-nav-features, #header .header-social-icons'), ['class']);
			self._save($('#header .header-logo img'), ['src']);

			// Turn the section full height or not depeding on the content size
			self.updateSectionsHeight();

			// Wrap all sections in a section wrapper
			$( this.options.targetClass ).wrap('<div class="section-wrapper"></div>');

			// Set the section wrapper height
	  		$('.section-wrapper').each(function(){
	  			$(this).height( $(this).find('.section-scroll').outerHeight() );
	  		});

	  		// Add active class to the first section on page load
	  		$('.section-wrapper').first().addClass('active');
			
	        let flag = false, scrollableFlag = false, touchDirection = '', touchstartY = 0, touchendY = 0;

	        $(window).on('touchstart' + self._ns, ({changedTouches}) => {
			    touchstartY = changedTouches[0].screenY;
			});

	        let wheelEvent = 'onwheel' in document ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	        if( $(window).width() < 992 && $('html').hasClass('touch') ) {
	        	wheelEvent = 'onwheel' in document ? 'wheel touchend' : document.onmousewheel !== undefined ? 'mousewheel touchend' : 'DOMMouseScroll touchend';
	        }

        	if( $(window).width() < 992 ) {
	    		$('html').removeClass('overflow-hidden');
			    $(window).on('scroll' + self._ns, () => {

		    		let index = 0;
		    		$('.section-scroll').each(function(){
		    			if( $(this).offset().top <= $(window).scrollTop() + 50 ) {
		    				const $currentSection2 = $('.section-wrapper').eq( index ).find('.section-scroll');

			            	$('.section-scroll-dots-navigation > ul > li').removeClass('active');
							$('.section-scroll-dots-navigation > ul > li').eq( index ).addClass('active');

							$(window).trigger({
								type: 'section.scroll.mobile.change.header.color',
								currentSection: $currentSection2
							});
		    			}

		    			index++;
		    		});
		    		
			    });

			    $(window).on('section.scroll.mobile.change.header.color' + self._ns, ({currentSection}) => {
			    	if( typeof currentSection == 'undefined' ) {
			    		return;
			    	}

			    	const $currentSection = currentSection, headerColor     = $currentSection.data('section-scroll-header-color');
								    	
			    	$('#header .header-nav').removeClass('header-nav-light-text header-nav-dark-text').addClass('header-nav-' + headerColor + '-text');
			    	$('#header .header-nav-features').removeClass('header-nav-features-dark header-nav-features-light').addClass('header-nav-features-' + headerColor);
			    	$('#header .header-social-icons').removeClass('social-icons-icon-dark social-icons-icon-light').addClass('social-icons-icon-' + headerColor);

			    	// Change Logo
			    	if( self.options.changeHeaderLogo && headerColor != undefined ) {
				    	if( headerColor == 'light' ) {
				    		$('#header .header-logo img').attr('src', self.options.headerLogoLight);
				    	} else if( headerColor == 'dark' ) {
				    		$('#header .header-logo img').attr('src', self.options.headerLogoDark);
				    	}
			    	}

			    	self.$header.css({
			    		opacity: 1
			    	});

			    });
        	}

	        $(window).on(wheelEvent.split(' ').map(type => type + self._ns).join(' '), ({target, originalEvent}) => {
                if( $(window).width() < 992 ) {
	        		return;
	        	}

                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
		        	if( $(target).closest('.section-scroll-dots-navigation').get(0) || $(target).closest('.header-body').get(0) || $(target).closest('.owl-carousel').get(0) ) {
		        		return;
		        	}
		        }

                // Side Header Overlay Full Screen
                if( $('html.side-header-overlay-full-screen.side-header-hide').get(0) ) {
		        	return;
		        }

                const wheelDirection = originalEvent.wheelDelta == undefined ? originalEvent.deltaY > 0 : originalEvent.wheelDelta < 0;
                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
		        	touchendY = event.changedTouches[0].screenY;
	        		
				    if( touchendY <= touchstartY ) {
				    	touchDirection = 'up';
				    }

				    if( touchendY >= touchstartY ) {
				    	touchDirection = 'down';
				    }

				    if( touchendY == touchstartY ) {
				    	return;
				    }
	        	}

                const $currentSection = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll');
                const $nextSection = self.getNextSection(wheelDirection, touchDirection);
                let nextSectionOffsetTop;

                // If is the last section, then change the offsetTop value
                if( self.getCurrentIndex() == $('.section-wrapper').length - 1 ) {
            		nextSectionOffsetTop = $(document).height();
            	} else {
            		nextSectionOffsetTop = $nextSection.offset().top;
            	}

                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
				    self._later(() => {
					    if( $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').hasClass('section-scroll-scrollable') ) {
					    	$('html').removeClass('overflow-hidden');
					    } else {
					    	$('html').addClass('overflow-hidden');
					    }
				    }, 1200);
				}

                // For non full height sections
                if( $currentSection.hasClass('section-scroll-scrollable') ) {
	        		if( !flag && !scrollableFlag ) {

		        		// Scroll Direction
		        		if(wheelDirection || touchDirection == 'up') {
		        			if( ( $(window).scrollTop() + $(window).height() ) >= nextSectionOffsetTop ) {
		        				flag = true;
								self._later(() => {
									$(window).trigger('section.scroll.change.header.color');

					            	self._later(() => {
										flag = false;
									}, 500);
								}, 1000);

		        				if( self.getCurrentIndex() == ( $('.section-wrapper').length - 1 )  ) {
						    		return false;
						    	}

		        				// Move to the next section
		        				self.moveTo( $currentSection.offset().top + $currentSection.outerHeight() );

		        				// Change Section Active Class
					   			self.changeSectionActiveState( $nextSection );

					   			self.$header.css({
							    	opacity: 0,
							    	transition: 'ease opacity 500ms'
							    });
					        }

			        		if( !$('html').hasClass('touch') ) {
				        		for( var i = 1; i < 100; i++ ) {
					        		$('body, html').scrollTop( $(window).scrollTop() + 1 );

					        		if( ( $(window).scrollTop() + $(window).height() ) >= nextSectionOffsetTop ) {
					        			scrollableFlag = true;
										self._later(() => {
											$(window).trigger('section.scroll.change.header.color');
							            	scrollableFlag = false;
										}, 500);
					        			break;
					        		}
				        		}
				        	}
					    } else {
					    	if( $(window).scrollTop() <= $currentSection.offset().top ) {
					    		flag = true;
								self._later(() => {
									$(window).trigger('section.scroll.change.header.color');

					            	self._later(() => {
										flag = false;
									}, 500);
								}, 1000);

					    		if( self.getCurrentIndex() == 0  ) {
						    		return false;
						    	}

					   			// Move to the next section
		        				self.moveTo( $currentSection.offset().top - $(window).height() );

		        				// Change Section Active Class
					   			self.changeSectionActiveState( $nextSection );

					   			self.$header.css({
							    	opacity: 0,
							    	transition: 'ease opacity 500ms'
							    });
					        }

					    	if( !$('html').hasClass('touch') ) {
				        		for( var i = 1; i < 100; i++ ) {
					        		$('body, html').scrollTop( $(window).scrollTop() - 1 );

					        		if( $(window).scrollTop() <= $currentSection.offset().top ) {
					        			scrollableFlag = true;
										self._later(() => {
											$(window).trigger('section.scroll.change.header.color');
							            	scrollableFlag = false;
										}, 500);
					        			break;
					        		}
				        		}
				        	}
					    }

			   			// Change Dots Active Class
				        self.changeDotsActiveState();

		        		return;

		        	}
	        	}

                // For full height sections
                if( !flag && !scrollableFlag ) {
				    if(wheelDirection || touchDirection == 'up') {
				    	if( self.getCurrentIndex() == ( $('.section-wrapper').length - 1 )  ) {
				    		return false;
				    	}

				   		// Change Section Active Class
			   			self.changeSectionActiveState( $nextSection );

				   		self._later(() => {
				   			// Move to the next section
	        				self.moveTo( $nextSection.offset().top );

				   		}, 150);
				    } else {
				    	if( self.getCurrentIndex() == 0  ) {
				    		return false;
				    	}

				   		// Change Section Active Class
			   			self.changeSectionActiveState( $nextSection );

				   		if( $nextSection.height() > $(window).height() ) {
				   			// Move to the next section
	        				self.moveTo( $currentSection.offset().top - $(window).height() );
				   		} else {
					        self._later(() => {
					   			// Move to the next section
		        				self.moveTo( $nextSection.offset().top );

					   		}, 150);
				   		}
				    }

				    // Change Dots Active Class
			        self.changeDotsActiveState();

				    self.$header.css({
				    	opacity: 0,
				    	transition: 'ease opacity 500ms'
				    });

				    // Style next section
	            	$nextSection.css({
	            		position: 'relative',
	            		opacity: 1,
	            		'z-index': 1,
	            		transform: 'translate3d(0,0,0) scale(1)'
	            	});

	            	// Style previous section
	            	$currentSection.css({
	            		position: 'fixed',
	            		width: '100%',
	            		top: 0,
	            		left: 0,
	            		opacity: 0,
	            		'z-index': 0,
	            		transform: 'translate3d(0,0,-10px) scale(0.7)',
	            		transition: 'ease transform 600ms, ease opacity 600ms',
	            	});

					self._later(() => {
						$currentSection.css({
		            		position: 'relative',
		            		opacity: 1,
		            		transform: 'translate3d(0,0,-10px) scale(1)'
		            	});

						$(window).trigger('section.scroll.change.header.color');

		            	self._later(() => {
							flag = false;
						}, 500);
					}, 1000);

					flag = true;

				}

                return;
            });

	        // Dots Navigation
	        if( this.options.dotsNav ) {
	        	self.dotsNavigation();
	        }

	        // First Load
	        self._later(() => {
		        if( $(window.location.hash).get(0) ) {
		        	self.moveTo( $(window.location.hash).parent().offset().top );

		        	self.changeSectionActiveState( $(window.location.hash) );

		        	// Change Dots Active Class
			        self.changeDotsActiveState();

		        	self.updateHash( true );
		        } else {
                    const hash  = window.location.hash;
                    let index = hash.replace('#','');

                    if( !hash ) {
		        		index = 1;
		        	}

                    self.moveTo( $('.section-wrapper').eq( index - 1 ).offset().top );

                    self.changeSectionActiveState( $('.section-wrapper').eq( index - 1 ).find('.section-scroll') );

                    // Change Dots Active Class
                    self.changeDotsActiveState();

                    self.updateHash( true );
                }

				$(window).trigger('section.scroll.ready');
				$(window).trigger('section.scroll.change.header.color');
			}, 500);

			return this;
		}

        updateSectionsHeight() {
			const self = this;

			$('.section-scroll').css({ height: '' });

			$('.section-scroll').each(function(){
				if( $(this).outerHeight() < ( $(window).height() + 3 ) ) {
					$(this).css({ height: '100vh' });		
				} else {
					$(this).addClass('section-scroll-scrollable');
				}
			});

			// Set the section wrapper height
	  		$('.section-wrapper').each(function(){
	  			$(this).height( $(this).find('.section-scroll').outerHeight() );
	  		});

			return this;
		}

        updateHash(first_load) {
			const self = this;

			if( !window.location.hash ) {
				window.location.hash = 1;
			} else {
				if(!first_load) {
					const $section = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll'), section_id = $section.attr('id') ? $section.attr('id') : $section.parent().index() + 1;

					window.location.hash = section_id;
				}
			}

			return this;
		}

        getCurrentIndex() {
            const self = this;
            let currentIndex = 0;

            currentIndex = $('.section-wrapper.active').index();

            return currentIndex;
        }

        moveTo($scrollTopValue, first_load) {
			const self = this;

			$('body, html').animate({
   				scrollTop: $scrollTopValue
   			}, 1000, 'easeOutQuint');

   			self._later(() => {
	   			self.updateHash();
   			}, 500);

			return this;
		}

        getNextSection(wheelDirection, touchDirection) {
            const self = this;
            let $nextSection = '';

            // Scroll Direction
            if(wheelDirection || touchDirection == 'up') {
				$nextSection = $('.section-wrapper').eq( self.getCurrentIndex() + 1 ).find('.section-scroll');
        	} else {
        		$nextSection = $('.section-wrapper').eq( self.getCurrentIndex() - 1 ).find('.section-scroll');
        	}

            return $nextSection;
        }

        changeSectionActiveState($nextSection) {
			const self = this;

			$('.section-wrapper').removeClass('active');
	   		$nextSection.parent().addClass('active');

			return this;
		}

        changeDotsActiveState() {
			const self = this;

			$('.section-scroll-dots-navigation > ul > li').removeClass('active');
			$('.section-scroll-dots-navigation > ul > li').eq( self.getCurrentIndex() ).addClass('active');

			return this;
		}

        dotsNavigation() {
			const self = this;

			const dotsNav = $('<div class="section-scroll-dots-navigation"><ul class="list list-unstyled"></ul></div>'), currentSectionIndex = self.getCurrentIndex();

        	if( self.options.dotsClass ) {
        		dotsNav.addClass( self.options.dotsClass );
        	}

        	for( let i = 0; i < $('.section-scroll').length; i++ ) {
        		const title = $('.section-wrapper').eq( i ).find('.section-scroll').data('section-scroll-title');

        		dotsNav.find('> ul').append( '<li'+ ( ( currentSectionIndex == i ) ? ' class="active"' : '' ) +'><a href="#'+ i +'" data-nav-id="'+ i +'"><span>'+ title +'</span></a></li>' );
        	}

        	$('.body').append( dotsNav );
        	self.$dotsNav = dotsNav;

        	dotsNav.find('a[data-nav-id]').on('click touchstart', function(e){
        		e.preventDefault();
        		const $this = $(this);

        		$('.section-scroll').css({
        			opacity: 0,
        			transition: 'ease opacity 300ms'
        		});

        		self.$header.css({
			    	opacity: 0,
			    	transition: 'ease opacity 500ms'
			    });

        		self._later(() => {
	        		self.moveTo( $('.section-wrapper').eq( $this.data('nav-id') ).offset().top )

		   			$('.section-wrapper').removeClass('active');
			   		$('.section-wrapper').eq( $this.data('nav-id') ).addClass('active');

	        		$('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').css({
	        			opacity: 1
	        		});

	        		self._later(() => {
		        		$('.section-scroll').css({ opacity: 1 });

		        		$(window).trigger('section.scroll.change.header.color');
	        		}, 500);

	        		if( $(window).width() > 991 ) {
		        		self.changeDotsActiveState();
	        		}
        		}, 500);
        	});

			return this;
		}

        events() {
			const self = this;

			$(window).on('section.scroll.ready' + self._ns, () => {
				$(window).scrollTop(0);
			});

			$(window).on('section.scroll.change.header.color' + self._ns, () => {
		    	const headerColor = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').data('section-scroll-header-color');
		    	
		    	$('#header .header-nav').removeClass('header-nav-light-text header-nav-dark-text').addClass('header-nav-' + headerColor + '-text');
		    	$('#header .header-nav-features').removeClass('header-nav-features-dark header-nav-features-light').addClass('header-nav-features-' + headerColor);
		    	$('#header .header-social-icons').removeClass('social-icons-icon-dark social-icons-icon-light').addClass('social-icons-icon-' + headerColor);

		    	// Change Logo
		    	if( self.options.changeHeaderLogo && headerColor != undefined ) {
			    	if( headerColor == 'light' ) {
			    		$('#header .header-logo img').attr('src', self.options.headerLogoLight);
			    	} else if( headerColor == 'dark' ) {
			    		$('#header .header-logo img').attr('src', self.options.headerLogoDark);
			    	}
		    	}

		    	self.$header.css({
		    		opacity: 1
		    	});
		    });

			// Debounced resize of our own: vendor afterResize keeps one global callback,
			// so a second plugin using it would silently replace this one
			$(window).on('resize' + self._ns, () => {
				clearTimeout(self._resizeTimer);
				self._resizeTimer = setTimeout(() => {
			    	self.updateSectionsHeight();

			    	if( $(window).width() < 992 ) {
			    		$('html').removeClass('overflow-hidden');
			    	}
				}, 500);
			});

		    return this;
		}

        _later(fn, delay) {
			const id = setTimeout(() => {
				this._timers = this._timers.filter(t => t !== id);
				fn();
			}, delay);
			this._timers.push(id);

			return id;
		}

        _save($els, attrs) {
			$els.each((i, el) => {
				attrs.forEach(attr => this._saved.push([el, attr, el.getAttribute(attr)]));
			});
		}

        /**
         * Unbind every handler, stop pending timers and scroll animation, remove the
         * dots navigation and section wrappers, and restore the header and sections.
         * @returns {PluginSectionScroll}
         */
        destroy() {
            $(window).off(this._ns);
            this._timers.forEach(clearTimeout);
            this._timers = [];
            clearTimeout(this._resizeTimer);
            $('body, html').stop(true);

            if (this.$dotsNav) {
                this.$dotsNav.remove();
                this.$dotsNav = null;
            }

            $(this.options.targetClass).filter((i, el) => $(el).parent().hasClass('section-wrapper')).unwrap();

            this._saved.forEach(([el, attr, value]) => {
                if (value === null) {
                    el.removeAttribute(attr);
                } else {
                    el.setAttribute(attr, value);
                }
            });
            this._saved = [];

            if ($('html').hasClass('overflow-hidden') !== this._htmlHadOverflow) {
                $('html').toggleClass('overflow-hidden', this._htmlHadOverflow);
            }

            this.$el.removeData(instanceName);

            return this;
        }
    }

    PluginSectionScroll.defaults = {
		targetClass: '.section',
		dotsNav: true,
		changeHeaderLogo: true,
		headerLogoDark: 'img/logo-default-slim.png',
		headerLogoLight: 'img/logo-default-slim-dark.png'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSectionScroll
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginSectionScroll = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginSectionScroll($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
