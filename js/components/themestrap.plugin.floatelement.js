// Float Element
(((themestrap = {}, $) => {
    const instanceName = '__floatElement';

    class PluginFloatElement {
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
				.build();

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginFloatElement.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $el = this.options.wrapper;
            const $window = $(window);
            let minus;

            // If has floating elements inside a SVG. 
            // Intersection Observer API do not check elements inside SVG's, so we need initialize trough top parent SVG
            if( $el.data('plugin-float-element-svg') ) {
				$el.find('[data-plugin-float-element]').each(function(){
                    const $this = $(this);
                    let opts;

                    const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                    if (pluginOptions)
						opts = pluginOptions;

                    $this.themestrapPluginFloatElement(opts);
                });

				return this;
			}

            if( self.options.style ) {
				$el.attr('style', self.options.style);
			}

            if( $window.width() > self.options.minWindowWidth ) {

				// Set Start Position
				if( self.options.startPos == 'none' ) {
					minus = '';
				} else if( self.options.startPos == 'top' ) {
					$el.css({
						top: 0
					});
					minus = '';
				} else {
					$el.css({
						bottom: 0
					});
					minus = '-';
				}

				// Set Transition
				if( self.options.transition ) {
					$el.css({
						transition: 'ease-out transform '+ self.options.transitionDuration +'ms ' + self.options.transitionDelay + 'ms'
					});
				}

				// First Load
				self.movement(minus);	

				// Scroll
				$window.on('scroll', () => {
					self.movement(minus);				   
				});

			}

            return this;
        }

        movement(minus) {
			const self = this, $el = this.options.wrapper, $window = $(window), scrollTop = $window.scrollTop(), elementOffset = $el.offset().top, currentElementOffset = (elementOffset - scrollTop), factor = ( self.options.isInsideSVG ) ? 2 : 100;

		   	const scrollPercent = factor * currentElementOffset / ($window.height());

		   	if( $el.visible( true ) ) {

		   		if( !self.options.horizontal ) {

		   			$el.css({
			   			transform: 'translate3d(0, '+ minus + scrollPercent / self.options.speed +'%, 0)'
			   		});

		   		} else {

		   			$el.css({
			   			transform: 'translate3d('+ minus + scrollPercent / self.options.speed +'%, 0, 0)'
			   		});

		   		}
		   		
		   	}

		}
    }

    PluginFloatElement.defaults = {
		startPos: 'top',
		speed: 3,
		horizontal: false,
		isInsideSVG: false,
		transition: false,
		transitionDelay: 0,
		transitionDuration: 500,
		minWindowWidth: 991
	};

    // expose to scope
    $.extend(themestrap, {
		PluginFloatElement
	});

    // jquery plugin
    $.fn.themestrapPluginFloatElement = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginFloatElement($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
