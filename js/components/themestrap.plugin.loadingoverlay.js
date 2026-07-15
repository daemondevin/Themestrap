// Loading Overlay
(((themestrap = {}, $) => {
    // Default
    const loadingOverlayDefaultTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',
		'</div>'
	].join('');

    // Percentage
    const loadingOverlayPercentageTemplate = [
		'<div class="loading-overlay loading-overlay-percentage">',
			'<div class="page-loader-progress-wrapper"><span class="page-loader-progress">0</span><span class="page-loader-progress-symbol">%</span></div>',
		'</div>'
	].join('');

    // Cubes
    const loadingOverlayCubesTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-thecube"><div class="cssload-cube cssload-c1"></div><div class="cssload-cube cssload-c2"></div><div class="cssload-cube cssload-c4"></div><div class="cssload-cube cssload-c3"></div></div></div>',
		'</div>'
	].join('');

    // Cube Progress
    const loadingOverlayCubeProgressTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><span class="cssload-cube-progress"><span class="cssload-cube-progress-inner"></span></span></div>',
		'</div>'
	].join('');

    // Float Rings
    const loadingOverlayFloatRingsTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-float-rings-loader"><div class="cssload-float-rings-inner cssload-one"></div><div class="cssload-float-rings-inner cssload-two"></div><div class="cssload-float-rings-inner cssload-three"></div></div></div>',
		'</div>'
	].join('');

    // Floating Bars
    const loadingOverlayFloatBarsTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-float-bars-container"><ul class="cssload-float-bars-flex-container"><li><span class="cssload-float-bars-loading"></span></li></div></div></div>',
		'</div>'
	].join('');

    // Speeding Wheel
    const loadingOverlaySpeedingWheelTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-speeding-wheel-container"><div class="cssload-speeding-wheel"></div></div></div>',
		'</div>'
	].join('');

    // Zenith
    const loadingOverlayZenithTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-zenith-container"><div class="cssload-zenith"></div></div></div>',
		'</div>'
	].join('');

    // Spinning Square
    const loadingOverlaySpinningSquareTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="cssload-spinning-square-loading"></div></div>',
		'</div>'
	].join('');

    // Pulse
    const loadingOverlayPulseTemplate = [
		'<div class="loading-overlay">',
			'<div class="bounce-loader"><div class="wrapper-pulse"><div class="cssload-pulse-loader"></div></div></div>',
		'</div>'
	].join('');

    const LoadingOverlay = function( $wrapper, options, noInheritOptions ) {
		return this.initialize( $wrapper, options, noInheritOptions );
	};

    LoadingOverlay.prototype = {

		options: {
			css: {},
			hideDelay: 500,
			progressMinTimeout: 0,
			effect: 'default'
		},

		initialize($wrapper, options, noInheritOptions) {
			this.$wrapper = $wrapper;

			this
				.setVars()
				.setOptions( options, noInheritOptions )
				.build()
				.events()
				.dynamicShowHideEvents();

			this.$wrapper.data( 'loadingOverlay', this );
		},

		setVars() {
			this.$overlay = this.$wrapper.find('.loading-overlay');
			this.pageStatus = null;
			this.progress = null;
			this.animationInterval = 33;

			return this;
		},

		setOptions(options, noInheritOptions) {
			if ( !this.$overlay.get(0) ) {
				this.matchProperties();
			}
			
			if( noInheritOptions ) {
				this.options     = $.extend( true, {}, this.options, options );
			} else {
				this.options     = $.extend( true, {}, this.options, options, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')) );
			}

			this.loaderClass = this.getLoaderClass( this.options.css.backgroundColor );

			return this;
		},

		build() {
			const _self = this;

			if ( !this.$overlay.closest(document.documentElement).get(0) ) {
				if ( !this.$cachedOverlay ) {

					switch ( _self.options.effect ) {
						case 'percentageProgress1':
							this.$overlay = $( loadingOverlayPercentageTemplate ).clone();
							break;

						case 'percentageProgress2':
							this.$overlay = $( loadingOverlayPercentageTemplate ).clone();
							this.$overlay
								.addClass('loading-overlay-percentage-effect-2')
								.prepend('<div class="loading-overlay-background-layer"></div>');
							break;

						case 'cubes':
							this.$overlay = $( loadingOverlayCubesTemplate ).clone();
							break;

						case 'cubeProgress':
							this.$overlay = $( loadingOverlayCubeProgressTemplate ).clone();
							break;

						case 'floatRings':
							this.$overlay = $( loadingOverlayFloatRingsTemplate ).clone();
							break;

						case 'floatBars':
							this.$overlay = $( loadingOverlayFloatBarsTemplate ).clone();
							break;

						case 'speedingWheel':
							this.$overlay = $( loadingOverlaySpeedingWheelTemplate ).clone();
							break;

						case 'zenith':
							this.$overlay = $( loadingOverlayZenithTemplate ).clone();
							break;

						case 'spinningSquare':
							this.$overlay = $( loadingOverlaySpinningSquareTemplate ).clone();
							break;

						case 'pulse':
							this.$overlay = $( loadingOverlayPulseTemplate ).clone();
							break;

						case 'infinite':
							this.$overlay = $( loadingOverlayInfiniteTemplate ).clone();
							break;

						case 'default':
						default:
							this.$overlay = $( loadingOverlayDefaultTemplate ).clone();
							break;
					}
					
					if ( this.options.css ) {
						this.$overlay.css( this.options.css );
						this.$overlay.find( '.loader' ).addClass( this.loaderClass );
					}
				} else {
					this.$overlay = this.$cachedOverlay.clone();
				}

				this.$wrapper.prepend( this.$overlay );
			}

			if ( !this.$cachedOverlay ) {
				this.$cachedOverlay = this.$overlay.clone();
			}

			if( ['percentageProgress1', 'percentageProgress2'].includes(_self.options.effect) ) {
				_self.updateProgress();

				if( _self.options.isDynamicHideShow ) {
					setTimeout(() => {
						_self.progress = 'complete';
						
						$('.page-loader-progress').text(100);

						if( ['percentageProgress2'].includes(_self.options.effect) ) {
			            	$('.loading-overlay-background-layer').css({
			            		width: '100%'
			            	});
			            }
					}, 2800);
				}
			}

			return this;
		},

		events() {
			const _self = this;

			if ( this.options.startShowing ) {
				_self.show();
			}

			if ( this.$wrapper.is('body') || this.options.hideOnWindowLoad ) {
				$( window ).on( 'load error', () => {
					setTimeout(() => {
						_self.hide();
					}, _self.options.progressMinTimeout);
				});
			}

			if ( this.options.listenOn ) {
				$( this.options.listenOn )
					.on( 'loading-overlay:show beforeSend.ic', e => {
						e.stopPropagation();
						_self.show();
					})
					.on( 'loading-overlay:hide complete.ic', e => {
						e.stopPropagation();
						_self.hide();
					});
			}

			this.$wrapper
				.on( 'loading-overlay:show beforeSend.ic', e => {
					if ( e.target === _self.$wrapper.get(0) ) {
						e.stopPropagation();
						_self.show();
						return true;
					}
					return false;
				})
				.on( 'loading-overlay:hide complete.ic', e => {
					if ( e.target === _self.$wrapper.get(0) ) {
						e.stopPropagation();
						_self.hide();
						return true;
					}
					return false;
				});

			if( ['percentageProgress1', 'percentageProgress2'].includes(_self.options.effect) ) {
				$(window).on('load', () => {
		            setTimeout(() => {
			            _self.pageStatus = "complete";

			            $('.page-loader-progress').text(100);

			            if( ['percentageProgress2'].includes(_self.options.effect) ) {
			            	$('.loading-overlay-background-layer').css({
			            		width: '100%'
			            	});
			            }
		            }, _self.options.progressMinTimeout);
				});
			}
		        
			return this;
		},

		show() {
			this.build();

			this.position = this.$wrapper.css( 'position' ).toLowerCase();
			if ( this.position != 'relative' || this.position != 'absolute' || this.position != 'fixed' ) {
				this.$wrapper.css({
					position: 'relative'
				});
			}
			this.$wrapper.addClass( 'loading-overlay-showing' );
		},

		hide() {
			const _self = this;

			setTimeout(function() {
				_self.$wrapper.removeClass( 'loading-overlay-showing' );
				
				if ( this.position != 'relative' || this.position != 'absolute' || this.position != 'fixed' ) {
					_self.$wrapper.css({ position: '' });
				}

				$(window).trigger('loading.overlay.ready');
			}, _self.options.hideDelay);
		},

		updateProgress() {
			const _self = this;

			const render = () => {
				if(_self.pageStatus == "complete"){
		            $('.page-loader-progress').text(100);
		            setTimeout(() => {
		                $('.page-loader-progress').addClass('d-none');    
		            }, 700);
		        }
		        else{            
		            if(_self.progress == null){
		                _self.progress = 1;
		            }
		           
		            _self.progress = _self.progress + 1;
		            if(_self.progress >= 0 && _self.progress <= 30){
		                _self.animationInterval += 1;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress > 30 && _self.progress <= 60){
		                _self.animationInterval += 2;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress > 60 && _self.progress <= 80){
		                _self.animationInterval += 40;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress > 80 && _self.progress <= 90){
		                _self.animationInterval += 80;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress > 90 && _self.progress <= 95){
		                _self.animationInterval += 150;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress > 95 && _self.progress <= 99){
		                _self.animationInterval += 400;
		                $('.page-loader-progress').text(_self.progress);
		            }
		            else if(_self.progress >= 100){
		                $('.page-loader-progress').text(99);
		            }

		            if( ['percentageProgress2'].includes(_self.options.effect) ) {
		            	$('.loading-overlay-background-layer').css({
		            		width: _self.progress + '%'
		            	});
		            }
		              
					self.loopInside = setTimeout(render, _self.animationInterval);
		        }

			};
			render();

			return this;
		},

		matchProperties() {
			let i, l, properties;

			properties = [
				'backgroundColor',
				'borderRadius'
			];

			l = properties.length;

			for( i = 0; i < l; i++ ) {
				const obj = {};
				obj[ properties[ i ] ] = this.$wrapper.css( properties[ i ] );

				$.extend( this.options.css, obj );
			}
		},

		getLoaderClass(backgroundColor) {
			if ( !backgroundColor || backgroundColor === 'transparent' || backgroundColor === 'inherit' ) {
				return 'black';
			}

			let hexColor, r, g, b, yiq;

			const colorToHex = color => {
				let hex, rgb;

				if( color.includes('#') ){
					hex = color.replace('#', '');
				} else {
					rgb = color.match(/\d+/g);
					hex = ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2);
				}

				if ( hex.length === 3 ) {
					hex = hex + hex;
				}

				return hex;
			};

			hexColor = colorToHex( backgroundColor );

			r = parseInt( hexColor.substr( 0, 2), 16 );
			g = parseInt( hexColor.substr( 2, 2), 16 );
			b = parseInt( hexColor.substr( 4, 2), 16 );
			yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

			return ( yiq >= 128 ) ? 'black' : 'white';
		},

		dynamicShowHide(effect) {
			const _self = this;

			// Remove Loading Overlay Data
			$('body').removeData('loadingOverlay');

			// Remove Html Of Loading Overlay
			$('.loading-overlay').remove();

			if( effect == '' ) {
				return this;
			}

			// Initialize New Loading Overlay (second parameter is to NO inherit data-plugin-options)
			$('body').loadingOverlay({
				effect: effect ? effect : 'pulse',
				isDynamicHideShow: true
			}, true);

			// Show Loading Overlay Loader
			$('body').data('loadingOverlay').show();

			// Hide Loading Overlay Loader
			setTimeout(() => {
				$('body').data('loadingOverlay').hide();
			}, 3000);

			return this;
		},

		dynamicShowHideEvents() {
			const _self = this;

			// Button
			$(document).off('click.loading-overlay-button').on('click.loading-overlay-button', '.loading-overlay-button', function(e){
				e.preventDefault();

				_self.dynamicShowHide( $(this).data('effect') );
			});

			// Select
			$(document).off('change.loading-overlay-select').on('change.loading-overlay-select', '.loading-overlay-select', function(){
				_self.dynamicShowHide( $(this).val() );
			});

			return this;
		}

	};

    // expose to scope
    $.extend(themestrap, {
		LoadingOverlay
	});

    // expose as a jquery plugin
    $.fn.loadingOverlay = function( opts, noInheritOptions ) {
		return this.each(function() {
			const $this = $( this );

			const loadingOverlay = $this.data( 'loadingOverlay' );
			if ( loadingOverlay ) {
				return loadingOverlay;
			} else {
				const options = opts || $this.data( 'loading-overlay-options' ) || {};
				return new LoadingOverlay( $this, options, noInheritOptions );
			}
		});
	}

    // auto init
    $('[data-loading-overlay]').loadingOverlay();
    
})).apply(this, [window.themestrap, jQuery]);
