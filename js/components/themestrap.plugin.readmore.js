// Read More
(((themestrap = {}, $) => {
    const instanceName = '__readmore';

    class PluginReadMore {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			const self = this;

			this.$el = $el;

			this
				.setData()
				.setOptions(opts)
				.build()
				.events();

			if( self.options.startOpened ) {
				self.options.wrapper.find('.readmore-button-wrapper > a').trigger('click');
			}

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginReadMore.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			self.options.wrapper.addClass('position-relative');

			// Overlay
			self.options.wrapper.append( '<div class="readmore-overlay"></div>' );

			// Check if is Safari
			let backgroundCssValue = 'linear-gradient(180deg, rgba(2, 0, 36, 0) 0%, '+ self.options.overlayColor +' 100%)';
			if( $('html').hasClass('safari') ) {
				backgroundCssValue = '-webkit-linear-gradient(top, rgba(2, 0, 36, 0) 0%, '+ self.options.overlayColor +' 100%)'
			}
			
			self.options.wrapper.find('.readmore-overlay').css({
				background: backgroundCssValue,
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: '100%',
				height: self.options.overlayHeight,
				'z-index': 1
			});

			// Read More Button
			self.options.wrapper.find('.readmore-button-wrapper').removeClass('d-none').css({
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: '100%',
				'z-index': 2
			});	

			// Button Label
			self.options.wrapper.find('.readmore-button-wrapper > a').html( self.options.buttonOpenLabel );

			self.options.wrapper.css({
				'height': self.options.maxHeight,
				'overflow-y': 'hidden'
			});

			// Alignment
			switch ( self.options.align ) {
				case 'center':
					self.options.wrapper.find('.readmore-button-wrapper').addClass('text-center');
					break;

				case 'end':
					self.options.wrapper.find('.readmore-button-wrapper').addClass('text-end');
					break;

				case 'start':
				default:
					self.options.wrapper.find('.readmore-button-wrapper').addClass('text-start');
					break;
			}

			return this;

		}

        events() {
			const self = this;

			// Read More
			self.readMore = () => {
				self.options.wrapper.find('.readmore-button-wrapper > a:not(.readless)').on('click', function(e){
					e.preventDefault();

					const $this = $(this);

					setTimeout(() => {
						self.options.wrapper.animate({
							'height': self.options.wrapper[0].scrollHeight
						}, () => {
							if( !self.options.enableToggle ) {
								$this.fadeOut();
							}

							$this.html( self.options.buttonCloseLabel ).addClass('readless').off('click');

							self.readLess();

							self.options.wrapper.find('.readmore-overlay').fadeOut();
							self.options.wrapper.css({
								'max-height': 'none',
								'overflow': 'visible'
							});

							self.options.wrapper.find('.readmore-button-wrapper').animate({
								bottom: -20
							});
						});
					}, 200);
				});
			}

			// Read Less
			self.readLess = () => {
				self.options.wrapper.find('.readmore-button-wrapper > a.readless').on('click', function(e){
					e.preventDefault();

					const $this = $(this);

					// Button
					self.options.wrapper.find('.readmore-button-wrapper').animate({
						bottom: 0
					});

					// Overlay
					self.options.wrapper.find('.readmore-overlay').fadeIn();

					setTimeout(() => {
						self.options.wrapper.height(self.options.wrapper[0].scrollHeight).animate({
							'height': self.options.maxHeight
						}, () => {
							$this.html( self.options.buttonOpenLabel ).removeClass('readless').off('click');

							self.readMore();

							self.options.wrapper.css({
								'overflow': 'hidden'
							});
						});
					}, 200);
				});
			}

			// First Load
			self.readMore();

			return this;
		}
    }

    PluginReadMore.defaults = {
		buttonOpenLabel: 'Read More <i class="fas fa-chevron-down text-2 ms-1"></i>',
		buttonCloseLabel: 'Read Less <i class="fas fa-chevron-up text-2 ms-1"></i>',
		enableToggle: true,
		maxHeight: 110,
		overlayColor: '#FFF',
		overlayHeight: 100,
		startOpened: false,
		align: 'left'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginReadMore
	});

    // jquery plugin
    $.fn.themestrapPluginReadMore = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginReadMore($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
