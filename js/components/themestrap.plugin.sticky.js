// Sticky
(((themestrap = {}, $) => {
    const instanceName = '__sticky';

    class PluginSticky {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ( $el.data( instanceName ) ) {
				return this;
			}

			this.$el = $el;

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
			this.options = $.extend(true, {}, PluginSticky.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.pin))) {
				return this;
			}

			const self = this, $window = $(window);
			
			self.options.wrapper.pin(self.options);

			if( self.options.wrapper.hasClass('sticky-wrapper-transparent') ) {
				self.options.wrapper.parent().addClass('position-absolute w-100');
			}

			$window.afterResize(() => {
				self.options.wrapper.removeAttr('style').removeData('pin');
				self.options.wrapper.pin(self.options);
				$window.trigger('scroll');
			});

			// Change Logo Src
			if( self.options.wrapper.find('img').attr('data-change-src') ) {
				const $logo = self.options.wrapper.find('img'), logoSrc = $logo.attr('src'), logoNewSrc = $logo.attr('data-change-src');

				self.changeLogoSrc = activate => {
					if(activate) {
						$logo.attr('src', logoNewSrc);
					} else {
						$logo.attr('src', logoSrc);
					}
				}
			}
			
			return this;
		}

        events() {
            const self = this;
            const $window = $(window);
            const $logo = self.options.wrapper.find('img');
			const classToCheck = ( self.options.wrapper.hasClass('sticky-wrapper-effect-1') ) ? 'sticky-effect-active' : 'sticky-active';
            let stickyActivateFlag = true;
            let stickyDeactivateFlag = false;

            $window.on('scroll sticky.effect.active', () => {
				if( self.options.wrapper.hasClass( classToCheck ) ) {		
					if( stickyActivateFlag ) {			
						if( $logo.attr('data-change-src') ) {
							self.changeLogoSrc(true);
						}

						stickyActivateFlag = false;
						stickyDeactivateFlag = true;
					}
				} else {	
					if( stickyDeactivateFlag ) {				
						if( $logo.attr('data-change-src') ) {
							self.changeLogoSrc(false);
						}

						stickyDeactivateFlag = false;
						stickyActivateFlag = true;
					}
				}
			});

            let isGoingUp = false;
            if( self.options.stickyStartEffectAt ) {

				// First Load
				if( self.options.stickyStartEffectAt < $window.scrollTop() ) {
					self.options.wrapper.addClass('sticky-effect-active');

					$window.trigger('sticky.effect.active');
				}

				$window.on('scroll', () => {
					if( self.options.stickyStartEffectAt < $window.scrollTop() ) {	
						self.options.wrapper.addClass('sticky-effect-active');
						isGoingUp = true;

						$window.trigger('sticky.effect.active');
					} else {	
						if( isGoingUp ) {
							self.options.wrapper.find('.sticky-body').addClass('position-fixed');
							isGoingUp = false;
						}

						if( $window.scrollTop() == 0 ) {
							self.options.wrapper.find('.sticky-body').removeClass('position-fixed');
						}

						self.options.wrapper.removeClass('sticky-effect-active');
					}
				});
			}

            // Refresh Sticky Plugin if click in a data-toggle="collapse"
            if( $('[data-bs-toggle="collapse"]').get(0) ) {

				$('[data-bs-toggle="collapse"]').on('click', () => {
					setTimeout(() => {
						self.build();
						$(window).trigger('scroll');
					}, 1000);
				});

			}

			// Visibility Issue
			document.addEventListener('visibilitychange', () => {
				$(window).trigger('resize');
			});

			setInterval(() => {
				$(window).trigger('resize');
			}, 1000);

        }
    }

    PluginSticky.defaults = {
		minWidth: 991,
		activeClass: 'sticky-active'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSticky
	});

    // jquery plugin
    $.fn.themestrapPluginSticky = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginSticky($this, opts);
			}
			
		});
	}
})).apply(this, [ window.themestrap, jQuery ]);
