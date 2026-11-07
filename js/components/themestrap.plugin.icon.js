// Icon
(((themestrap = {}, $) => {
    const instanceName = '__icon';
    let uid = 0;

    class PluginIcon {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this._ns = '.tsicon' + (++uid);
			this._origClass = $el.attr('class');
			this._origStyle = $el.attr('style');
			this._timers = [];

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
			this.options = $.extend(true, {}, PluginIcon.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self  	 = this;
            let $el   	 = this.options.wrapper;
            const color 	 = self.options.color;
            const elTopDistance = $el.offset().top;
            const windowTopDistance = $(window).scrollTop();
            let duration = ( self.options.animated && !self.options.strokeBased ) ? 200 : 100;

            // Check origin
            if( window.location.protocol === 'file:' ) {
				$el.css({
					opacity: 1,
					width: $el.attr('width')
				});

				if( self.options.extraClass ) {
					$el.addClass( self.options.extraClass );
				}

				if( self.options.extraClass.indexOf('-color-light') > 0 ) {
					$el.css({
						filter: 'invert(1)'
					});
				}

				$(window).trigger('icon.rendered');
				return;
			}

            // Duration
            if( self.options.duration ) {
				duration = self.options.duration;
			}

            // SVG Content
			const fileName = $el.attr('src');

			if(fileName.split('.').pop() == 'svg') {
				self._xhr = $.get({
					url: fileName, 
					success(data, status, {responseText}) {
						self._xhr = null;
						const iconWrapper = self.options.fadeIn ? $('<div class="animated-icon animated fadeIn">'+ responseText +'</div>') : $('<div class="animated-icon animated">'+ responseText +'</div>'), uniqid = 'icon_' + Math.floor(Math.random() * 26) + Date.now();

						// Add ID
						iconWrapper.find('svg').attr('id', uniqid);

						// Identify with filename
						iconWrapper.find('svg').attr('data-filename', $el.attr('src').split(/(\\|\/)/g).pop());

						if( $el.attr('width') ) {
							iconWrapper.find('svg')
								.attr('width', $el.attr('width'))
								.attr('height', $el.attr('width'));						
						}

						if( $el.attr('height') ) {
							iconWrapper.find('svg')
								.attr('height', $el.attr('height'));	
						}

						if( self.options.svgViewBox ) {
							iconWrapper.find('svg')
								.attr('viewBox', self.options.svgViewBox);
						}

						$el.replaceWith(iconWrapper);

						// replaceWith drops the img's data, so the instance lives on the wrapper from here on
						self.$icon = iconWrapper;
						iconWrapper.data(instanceName, self);

						if( self.options.extraClass ) {
							iconWrapper.addClass( self.options.extraClass );
						}

						if( self.options.removeClassAfterInit ) {
							iconWrapper.removeClass(self.options.removeClassAfterInit);
						}

						if( self.options.onlySVG ) {
							$(window).trigger('icon.rendered');
							return this;
						}

						$el = iconWrapper;

						const icon = self.vivus = new Vivus(uniqid, {start: 'manual', type: 'sync', selfDestroy: true, duration, onReady({el}) {
							const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
							let animateStyle = '';

							// SVG Fill Based
							if( self.options.animated && !self.options.strokeBased || !self.options.animated && color && !self.options.strokeBased ) {
								animateStyle = 'stroke-width: 0.1px; fill-opacity: 0; transition: ease fill-opacity 300ms;';
								
								// Set Style on SVG inside object
								styleElement.textContent = '#' + uniqid + ' path, #' + uniqid + ' line, #' + uniqid + ' rect, #' + uniqid + ' circle, #' + uniqid + ' polyline { fill: '+ color +'; stroke: '+ color +'; '+ animateStyle + (self.options.svgStyle ? self.options.svgStyle : "") + ' } .finished path { fill-opacity: 1; }';
								el.appendChild(styleElement);
							}

							// SVG Stroke Based
							if( self.options.animated && self.options.strokeBased || !self.options.animated && color && self.options.strokeBased ) {

								// Set Style on SVG inside object
								styleElement.textContent = '#' + uniqid + ' path, #' + uniqid + ' line, #' + uniqid + ' rect, #' + uniqid + ' circle, #' + uniqid + ' polyline { stroke: '+ color +'; ' + (self.options.svgStyle ? self.options.svgStyle : "") + '}';
								el.appendChild(styleElement);
							}

							$.event.trigger('themestrap.plugin.icon.svg.ready');
						}});

						// Isn't animated
						if( !self.options.animated ) {
							self._timers.push(setTimeout(() => {
								icon.finish();
							}, 10));
							$el.css({ opacity: 1 });
						}

						// Animated
						if( self.options.animated && $(window).width() > 767 ) {
							
							// First Load
							if( $el.visible( true ) ) {
								self.startIconAnimation( icon, $el );
							} else if( elTopDistance < windowTopDistance ) {
								self.startIconAnimation( icon, $el );
							}

							// On Scroll
							$(window).on('scroll' + self._ns, () => {
								if( $el.visible( true ) ) {
									self.startIconAnimation( icon, $el );
								}
							});

						} else {
							
							$el.css({ opacity: 1 });
							icon.finish();
							
							$(window).on('themestrap.plugin.icon.svg.ready' + self._ns, () => {
								self._timers.push(setTimeout(() => {
									icon.el.setAttribute('class', 'finished');
									icon.finish();
								}, 300));
							});
							
						}

						$(window).trigger('icon.rendered');
					}
				});
			} else {
				$el.removeAttr('data-icon');
			}

            return this;
        }

        startIconAnimation(icon, $el) {
			const self = this;

			// Animate for better performance
			$({to:0}).animate({to:1}, ((self.options.strokeBased) ? self.options.delay : self.options.delay + 300 ), () => {
				$el.css({ opacity: 1 });
			});

			$({to:0}).animate({to:1}, self.options.delay, () => {
				icon.play(1);

				self._timers.push(setTimeout(() => {
					icon.el.setAttribute('class', 'finished');
				}, icon.duration * 5 ));
			});
		}

        /**
         * Put the original <img> back in place of the inline SVG and drop all handlers and timers.
         * Call it on the img before the SVG loads, or on the .animated-icon wrapper after.
         * @returns {PluginIcon}
         */
        destroy() {
            const $el = this.$el;

            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            $(window).off(this._ns);
            this._timers.forEach(clearTimeout);
            this._timers = [];

            if (this.vivus && typeof this.vivus.destroy === 'function') {
                try { this.vivus.destroy(); } catch (e) { /* already self destroyed */ }
            }
            this.vivus = null;

            if (this.$icon) {
                this.$icon.replaceWith($el);
                this.$icon = null;
            }

            if (this._origClass === undefined) {
                $el.removeAttr('class');
            } else {
                $el.attr('class', this._origClass);
            }
            if (this._origStyle === undefined) {
                $el.removeAttr('style');
            } else {
                $el.attr('style', this._origStyle);
            }

            $el.removeData(instanceName);

            return this;
        }
    }

    PluginIcon.defaults = {
		color: '#2388ED',
		animated: false,
		delay: 300,
		onlySVG: false,
		removeClassAfterInit: false,
		fadeIn: true,
		accY: 0
	};

    // expose to scope
    $.extend(themestrap, {
		PluginIcon
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginIcon = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginIcon($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
