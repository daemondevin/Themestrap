// CursorEffect
(((themestrap = {}, $) => {
    const instanceName = '__cursorEffect';

    class PluginCursorEffect {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
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
			this.options = $.extend(true, {}, PluginCursorEffect.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			// Global Variables for cursor position
			self.clientX = -100;
			self.clientY = -100;

			// Hide Mouse Cursor
			if( self.options.hideMouseCursor ) {
				self.$el.addClass('hide-mouse-cursor');
			}

			// Creates the cursor wrapper node
			const cursorOuter = document.createElement('DIV');
				cursorOuter.className = 'cursor-outer';

			// Creates the cursor inner node
			const cursorInner = document.createElement('DIV');
				cursorInner.className = 'cursor-inner';

			// Custom Cursor Outer Color
			if( self.options.cursorOuterColor ) {
				cursorOuter.style = 'border-color: ' + self.options.cursorOuterColor + ';';
			}

			// Custom Cursor Inner Color
			if( self.options.cursorInnerColor ) {
				cursorInner.style = 'background-color: ' + self.options.cursorInnerColor + ';';
			}

			// Size
			if( self.options.size ) {
				switch ( self.options.size ) {
					case 'small':
						self.$el.addClass( 'cursor-effect-size-small' );
						break;
					
					case 'big':
						self.$el.addClass( 'cursor-effect-size-big' );
						break;
				}
			}

			// Style
			if( self.options.style ) {
				self.$el.addClass( self.options.style );
			}

			// Prepend cursor wrapper node to the body
			document.body.prepend( cursorOuter );

			// Prepend cursor inner node to the body
			document.body.prepend( cursorInner );

			// Loop for render
			const render = () => {
				cursorOuter.style.transform = 'translate('+ self.clientX +'px, '+ self.clientY +'px)';
				cursorInner.style.transform = 'translate('+ self.clientX +'px, '+ self.clientY +'px)';

				self.loopInside = requestAnimationFrame(render);
			};
			self.loop = requestAnimationFrame(render);

			return this;
		}

        events() {
			const self = this, $cursorOuter = $('.cursor-outer'), $cursorInner = $('.cursor-inner');

			const initialCursorOuterBox    = $cursorOuter[0].getBoundingClientRect(), initialCursorOuterRadius = $cursorOuter.css('border-radius');

			// Update Cursor Position
			document.addEventListener('mousemove', ({clientX, clientY}) => {
				if( !self.isStuck ) {
					self.clientX = clientX - 20;
					self.clientY = clientY - 20;
				}

				$cursorOuter.removeClass('opacity-0');
			});

			self.isStuck = false;
			$('[data-cursor-effect-hover]').on('mouseenter', function(e){

				// Identify Event With Hover Class
				$cursorOuter.addClass('cursor-outer-hover');
				$cursorInner.addClass('cursor-inner-hover');

				// Hover Color
				const hoverColor = $(this).data('cursor-effect-hover-color');
				$cursorOuter.addClass( 'cursor-color-' + hoverColor );
				$cursorInner.addClass( 'cursor-color-' + hoverColor );

				// Effect Types
				switch ( $(this).data('cursor-effect-hover') ) {
					case 'fit':
						const thisBox = $(this)[0].getBoundingClientRect();

						self.clientX = thisBox.x;
						self.clientY = thisBox.y;

						$cursorOuter.css({
							width: thisBox.width,
							height: thisBox.height,
							'border-radius': $(this).css('border-radius')
						}).addClass('cursor-outer-fit');

						$cursorInner.addClass('opacity-0');

						self.isStuck = true;
						break;

					case 'plus':
						$cursorInner.addClass('cursor-inner-plus');
						break;
				}
			});

			$('[data-cursor-effect-hover]').on('mouseleave', function(){
				
				// Identify Event With Hover Class
				$cursorOuter.removeClass('cursor-outer-hover');
				$cursorInner.removeClass('cursor-inner-hover');

				// Remove Color Class
				const hoverColor = $(this).data('cursor-effect-hover-color');
				$cursorOuter.removeClass( 'cursor-color-' + hoverColor );
				$cursorInner.removeClass( 'cursor-color-' + hoverColor );

				// Effect Types
				switch ( $(this).data('cursor-effect-hover') ) {
					case 'fit':
						$cursorOuter.css({
							width: initialCursorOuterBox.width,
							height: initialCursorOuterBox.height,
							'border-radius': initialCursorOuterRadius
						}).removeClass('cursor-outer-fit');

						$cursorInner.removeClass('opacity-0');

						self.isStuck = false;
						break;

					case 'plus':
						$cursorInner.removeClass('cursor-inner-plus');
						break;
				}
			});

			$(window).on('scroll', () => {
				if( $cursorOuter.hasClass('cursor-outer-fit') ) {
					$cursorOuter.addClass('opacity-0').removeClass('cursor-outer-fit');
				}
			});

			return this;
		}

        destroy() {
			const self = this;

			self.$el.removeClass('hide-mouse-cursor cursor-effect-size-small cursor-effect-size-big cursor-effect-style-square');		

			cancelAnimationFrame( self.loop );
			cancelAnimationFrame( self.loopInside );

			document.querySelector('.cursor-outer').remove();
			document.querySelector('.cursor-inner').remove();

			self.$el.removeData( instanceName, self );
		}
    }

    PluginCursorEffect.defaults = {

	}

    // expose to scope
    $.extend(themestrap, {
		PluginCursorEffect
	});

    // jquery plugin
    $.fn.themestrapPluginCursorEffect = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCursorEffect($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
