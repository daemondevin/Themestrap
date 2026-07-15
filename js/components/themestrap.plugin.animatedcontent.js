(((themestrap = {}, $) => {
    const instanceName = '__animatedContent';

    class PluginAnimatedContent {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			const self = this;

			this.$el = $el;
			this.initialText = $el.text();

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
			this.options = $.extend(true, {}, PluginAnimatedContent.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self    = this;

			if( $(window).width() < self.options.minWindowWidth ) {
				return this;
			}

			if( self.options.firstLoadNoAnim ) {
				self.$el.css({
					visibility: 'visible'
				});

				// Inside Carousel
				if( self.$el.closest('.owl-carousel').get(0) ) {
					setTimeout(() => {
						self.$el.closest('.owl-carousel').on('change.owl.carousel', () => {
							self.options.firstLoadNoAnim = false;
							self.build();
						});
					}, 500);
				}

				return this;
			}

			// Set Min Height to avoid flicking issues
			self.setMinHeight();

			// Letter
			if( self.options.contentType == 'letter' ) {

				self.$el.addClass('initialized');

				const letters = self.$el.text().split('');

				self.$el.text('');

				// Type Writer
				if( self.options.animationName == 'typeWriter' ) {
					self.$el.append( '<span class="letters-wrapper"></span><span class="typeWriter"></span>' );

					let index = 0;

					setTimeout(() => {

						const timeout = () => {
							const st = setTimeout(() => {
								const letter = letters[index];
								
								self.$el.find('.letters-wrapper').append( '<span class="letter '+ ( self.options.letterClass ? self.options.letterClass + ' ' : '' ) +'">' + letter + '</span>' );

								index++;
								timeout();
							}, self.options.animationSpeed);

							if( index >= letters.length ) {
								clearTimeout(st);
							}
						};
						timeout();

					}, self.options.startDelay);

				// Class Animation
				} else {
					setTimeout(() => {
						for( let i = 0; i < letters.length; i++ ) {
							const letter = letters[i];
							
							self.$el.append( '<span class="animated-letters-wrapper ' + self.options.wrapperClass + '"><span class="animated-letters-item letter '+ ( self.options.letterClass ? self.options.letterClass + ' ' : '' ) + self.options.animationName +' animated" style="animation-delay: '+ ( i * self.options.animationSpeed ) +'ms;">' + ( letter == ' ' ? '&nbsp;' : letter ) + '</span></span>' );
		
						}
					}, self.options.startDelay);
				}

			// Words
			} else if( self.options.contentType == 'word' ) {
                const words = self.$el.text().split(" ");
                let delay = self.options.startDelay;

                self.$el.empty();

                $.each(words, (i, v) => {
					self.$el.append( $('<span class="animated-words-wrapper ' + self.options.wrapperClass + '">').html('<span class="animated-words-item ' + self.options.wordClass + ' appear-animation" data-appear-animation="' + self.options.animationName + '" data-appear-animation-delay="' + delay + '">' + v + '&nbsp;</span>') );
					delay = delay + self.options.animationSpeed;
				});

                if ($.isFunction($.fn['themestrapPluginAnimate']) && $('.animated-words-item[data-appear-animation]').length) {
					themestrap.fn.dynIntObsInit( '.animated-words-item[data-appear-animation]', 'themestrapPluginAnimate', themestrap.PluginAnimate.defaults );
				}

                self.$el.addClass('initialized');
            }

			return this;
		}

        setMinHeight() {
			const self = this;

			// if it's inside carousel
			if( self.$el.closest('.owl-carousel').get(0) ) {
				self.$el.closest('.owl-carousel').addClass('d-block');
				self.$el.css( 'min-height', self.$el.height() );
				self.$el.closest('.owl-carousel').removeClass('d-block');
			} else {
				self.$el.css( 'min-height', self.$el.height() );
			}

			return this;
		}

        destroy() {
			const self = this;

			self.$el
				.html( self.initialText )
				.css( 'min-height', '' );

			return this;
		}

        events() {
			const self = this;

			// Destroy
			self.$el.on('animated.letters.destroy', () => {
				self.destroy();
			});

			// Initialize
			self.$el.on('animated.letters.initialize', () => {
				self.build();
			});

			return this;
		}
    }

    PluginAnimatedContent.defaults = {
		contentType: 'letter',
		animationName: 'fadeIn',
		animationSpeed: 50,
		startDelay: 500,
		minWindowWidth: 768,
		letterClass: '',
		wordClass: '',
		wrapperClass: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginAnimatedContent
	});

    // jquery plugin
    $.fn.themestrapPluginAnimatedContent = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginAnimatedContent($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
