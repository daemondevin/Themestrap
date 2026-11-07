// Video Background
(((themestrap = {}, $) => {
    const instanceName = '__videobackground';
    let uid = 0;

    class PluginVideoBackground {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this._ns = '.tsvideobg' + (++uid);
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
			this.options = $.extend(true, {}, PluginVideoBackground.defaults, opts, {
				path: this.$el.data('video-path'),
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if (!(typeof $.fn.vide === 'function') || (!this.options.path)) {
				return this;
			}

			if (this.options.overlay && !this.$overlay) {

				const overlayClass = this.options.overlayClass;

				this.$overlay = $('<div />').addClass(overlayClass);
				this.options.wrapper.prepend(this.$overlay);
			}

			this.options.wrapper
				.vide(this.options.path, this.options)
				.first()
				.css('z-index', 0);

			// Change Poster
			self.changePoster();

			// Initialize Vide inside a carousel
			if( self.options.wrapper.closest('.owl-carousel').get(0) ) {
				self.options.wrapper.closest('.owl-carousel').off(self._ns).on('initialized.owl.carousel' + self._ns, () => {
					$('.owl-item.cloned')
						.find('[data-plugin-video-background] .vide-video-wrapper')
						.remove();

					$('.owl-item.cloned')
						.find('[data-plugin-video-background]')
						.vide(self.options.path, self.options)
						.first()
						.css('z-index', 0);

					self.changePoster( self.options.wrapper.closest('.owl-carousel') );
				});
			}

			// Play Video Button
			const $playButton = self.options.wrapper.find('.video-background-play');

			if( $playButton.get(0) ) {
				const $playWrapper = self.options.wrapper.find('.video-background-play-wrapper');

				self.options.wrapper.find('.video-background-play').off(self._ns).on('click' + self._ns, e => {
					e.preventDefault();

					if( $playWrapper.get(0) ) {
						$playWrapper.animate({
							opacity: 0
						}, 300, () => {
							$playWrapper.parent().height( $playWrapper.outerHeight() );
							$playWrapper.remove();
						});
					} else {
						$playButton.animate({
							opacity: 0
						}, 300, () => {
							$playButton.remove();
						});
					}

					self._timers.push(setTimeout(() => {
						self.options.wrapper.find('video')[0].play();
					}, 500));
				});
			}

			$(window).trigger('vide.video.inserted.on.dom');

			return this;
		}

        changePoster($carousel) {
			const self = this;

			// If it's inside carousel
			if( $carousel && self.options.changePoster ) {
				$carousel.find('.owl-item [data-plugin-video-background] .vide-video-wrapper').css({
					'background-image': 'url(' + self.options.changePoster + ')'
				});

				return this;
			}

			if( self.options.changePoster ) {
				self.options.wrapper.find('.vide-video-wrapper').css({
					'background-image': 'url(' + self.options.changePoster + ')'
				});
			}

			return this;
		}

        events() {
			const self = this;

			// Initialize
			self.options.wrapper.on('video.background.initialize' + self._ns, () => {
				self.build();
			});

			return this;
		}

        /**
         * Tear down Vide (video and poster wrapper), remove the overlay this plugin
         * added, unbind its handlers and restore the element's inline style.
         * @returns {PluginVideoBackground}
         */
        destroy() {
            const $el = this.$el;
            const $carousel = $el.closest('.owl-carousel');

            this._timers.forEach(clearTimeout);
            this._timers = [];

            $el.off(this._ns);
            $el.find('.video-background-play').off(this._ns);
            $carousel.off(this._ns);

            const vide = $el.data('vide');
            if (vide && typeof vide.destroy === 'function') {
                vide.destroy();
            }

            if (this.$overlay) {
                this.$overlay.remove();
                this.$overlay = null;
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

    PluginVideoBackground.defaults = {
		overlay: false,
		volume: 1,
		playbackRate: 1,
		muted: true,
		loop: true,
		autoplay: true,
		position: '50% 50%',
		posterType: 'detect',
		className: 'vide-video-wrapper'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginVideoBackground
	});

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginVideoBackground = function(opts, ...args) {
		return this.map(function() {
			const $this = $(this);
			const instance = $this.data(instanceName);

			if (typeof opts === 'string') {
				if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
					return instance[opts](...args);
				}
				return instance;
			}

			return instance || new PluginVideoBackground($this, opts);
		});
	};
})).apply(this, [window.themestrap, jQuery]);
