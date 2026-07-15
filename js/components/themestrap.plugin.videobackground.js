// Video Background
(((themestrap = {}, $) => {
    const instanceName = '__videobackground';

    class PluginVideoBackground {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
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
			this.options = $.extend(true, {}, PluginVideoBackground.defaults, opts, {
				path: this.$el.data('video-path'),
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if (!($.isFunction($.fn.vide)) || (!this.options.path)) {
				return this;
			}

			if (this.options.overlay) {

				const overlayClass = this.options.overlayClass;

				this.options.wrapper.prepend(
					$('<div />').addClass(overlayClass)
				);
			}

			this.options.wrapper
				.vide(this.options.path, this.options)
				.first()
				.css('z-index', 0);

			// Change Poster
			self.changePoster();

			// Initialize Vide inside a carousel
			if( self.options.wrapper.closest('.owl-carousel').get(0) ) {
				self.options.wrapper.closest('.owl-carousel').on('initialized.owl.carousel', () => {
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

				self.options.wrapper.find('.video-background-play').on('click', e => {
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

					setTimeout(() => {
						self.options.wrapper.find('video')[0].play();
					}, 500)
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
			self.options.wrapper.on('video.background.initialize', () => {
				self.build();
			});

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

    // jquery plugin
    $.fn.themestrapPluginVideoBackground = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginVideoBackground($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
