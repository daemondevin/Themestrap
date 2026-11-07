// Sticky
(((themestrap = {}, $) => {
    const instanceName = '__sticky';
    let uid = 0;

    class PluginSticky {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ( $el.data( instanceName ) ) {
				return this;
			}

			this.$el = $el;
			this._ns = '.tssticky' + (++uid);
			this._origStyle = $el.attr('style');
			this._timers = [];

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
			if (!(typeof $.fn.pin === 'function')) {
				return this;
			}

			const self = this, $window = $(window);
			
			self._repin();

			if( self.options.wrapper.hasClass('sticky-wrapper-transparent') && !self._$classedParent ) {
				const $parent = self.options.wrapper.parent();
				const added = ['position-absolute', 'w-100'].filter(cls => !$parent.hasClass(cls));

				$parent.addClass(added.join(' '));
				self._$classedParent = $parent;
				self._addedParentClasses = added;
			}

			// Debounced resize of our own: vendor afterResize keeps one global callback,
			// so a second plugin using it would silently replace this one
			$window.off('resize' + self._ns).on('resize' + self._ns, () => {
				clearTimeout(self._resizeTimer);
				self._resizeTimer = setTimeout(() => {
					self._repin();
					$window.trigger('scroll');
				}, 500);
			});

			// Change Logo Src
			if( self.options.wrapper.find('img').attr('data-change-src') ) {
				const $logo = self.options.wrapper.find('img'), logoSrc = $logo.attr('src'), logoNewSrc = $logo.attr('data-change-src');

				if (!self._$logo) {
					self._$logo = $logo;
					self._logoSrc = logoSrc;
				}

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

        /**
         * Pin the element afresh. jquery.pin binds scroll, resize and load handlers on
         * window on every call and offers no way to remove them, so the handlers each
         * call adds are recorded here and removed before the next call and on destroy().
         */
        _repin() {
            const $wrapper = this.options.wrapper;
            const types = ['scroll', 'resize', 'load'];
            const handlers = () => {
                const events = $._data(window, 'events') || {};
                return types.map(type => (events[type] || []).map(h => h.handler));
            };

            this._unpin();
            $wrapper.css({ width: '', left: '', top: '', position: '' });

            const before = handlers();
            $wrapper.pin(this.options);
            const after = handlers();

            this._pinHandlers = [];
            types.forEach((type, i) => {
                after[i].filter(fn => !before[i].includes(fn)).forEach(fn => this._pinHandlers.push([type, fn]));
            });
        }

        _unpin() {
            (this._pinHandlers || []).forEach(([type, fn]) => $(window).off(type, fn));
            this._pinHandlers = [];
            this.options.wrapper.removeData('pin');
        }

        events() {
            const self = this;
            const $window = $(window);
            const $logo = self.options.wrapper.find('img');
			const classToCheck = ( self.options.wrapper.hasClass('sticky-wrapper-effect-1') ) ? 'sticky-effect-active' : 'sticky-active';
            let stickyActivateFlag = true;
            let stickyDeactivateFlag = false;

            $window.on('scroll' + self._ns + ' sticky.effect.active' + self._ns, () => {
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

				$window.on('scroll' + self._ns, () => {
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

				$('[data-bs-toggle="collapse"]').on('click' + self._ns, () => {
					self._timers.push(setTimeout(() => {
						self.build();
						$(window).trigger('scroll');
					}, 1000));
				});

			}

			// Visibility Issue
			self._onVisibility = () => {
				$(window).trigger('resize');
			};
			document.addEventListener('visibilitychange', self._onVisibility);

			self._interval = setInterval(() => {
				$(window).trigger('resize');
			}, 1000);

			return this;
        }

        /**
         * Unpin the element, unbind every handler, stop the refresh interval and
         * put back the classes, inline style and logo src it started with.
         * @returns {PluginSticky}
         */
        destroy() {
            const $el = this.$el;
            const $window = $(window);

            clearInterval(this._interval);
            clearTimeout(this._resizeTimer);
            this._timers.forEach(clearTimeout);
            this._timers = [];

            $window.off(this._ns);
            $(document).find('[data-bs-toggle="collapse"]').off(this._ns);
            if (this._onVisibility) {
                document.removeEventListener('visibilitychange', this._onVisibility);
                this._onVisibility = null;
            }

            this._unpin();

            if ($el.parent().is('.pin-wrapper')) {
                $el.unwrap();
            }
            if (this._$classedParent && this._addedParentClasses.length) {
                this._$classedParent.removeClass(this._addedParentClasses.join(' '));
            }
            this._$classedParent = null;

            $el.removeClass([this.options.activeClass, 'sticky-effect-active'].join(' '));
            $el.find('.sticky-body').removeClass('position-fixed');

            if (this._origStyle === undefined) {
                $el.removeAttr('style');
            } else {
                $el.attr('style', this._origStyle);
            }

            if (this._$logo) {
                this._$logo.attr('src', this._logoSrc);
                this._$logo = null;
            }

            $el.removeData(instanceName);

            return this;
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

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginSticky = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginSticky($this, opts);
		});
	};
})).apply(this, [ window.themestrap, jQuery ]);
