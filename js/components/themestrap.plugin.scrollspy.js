// Scroll Spy
(((themestrap = {}, $) => {
    const instanceName = '__scrollSpy';

    class PluginScrollSpy {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {

			if( document.querySelector( opts.target ) == null ) {
				return false;
			}

			this.$el = $el;

			this
				.setData()
				.setOptions(opts);
			
			this.build();

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginScrollSpy.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this, target = document.querySelector( self.options.target ) != null ? document.querySelector( self.options.target ) : false, navItems = target == '#header' || target == '.wrapper-spy' ? target.querySelectorAll('.header-nav .nav > li a') : target.querySelectorAll('.nav > li a');

			// Get all section ID's
			let sectionIDs = Object.keys(navItems).map((key, index) => navItems[key].hash);

			// Remove empty values from sectionIDs array
			sectionIDs = sectionIDs.filter(value => value != '');

			// Store in a global variable
			self.sectionIDs = sectionIDs;

			for( let i = 0; i < sectionIDs.length; i++ ) {

				// Default Root Margin
				let rootMargin = '-20% 0px -79.9% 0px';
				
				// Spy Offset
				if( $( sectionIDs[i] ).data('spy-offset') ) {
					const rootMarginOffset = $( sectionIDs[i] ).data('spy-offset'), isNegativeOffset = parseInt( rootMarginOffset ) < 0 ? true : false;

					// Mount a new rootMargin based on offset value
					rootMargin = rootMargin.split(' ').map((element, index) => {
						if( element.indexOf('%') > 0 ) {
                            const valueToInt = parseInt( element.replace('%','') );
                            let newValue = 0;

                            switch ( index ) {
								case 0:
									if( isNegativeOffset ) {
										newValue = valueToInt - rootMarginOffset;
									} else {
										newValue = Math.abs(valueToInt) + rootMarginOffset;
									}
									break;

								case 2:
									if( isNegativeOffset ) {
										newValue = valueToInt + rootMarginOffset;
									} else {
										newValue = Math.abs(valueToInt) - rootMarginOffset;
									}
									break;
							
							}

                            if( isNegativeOffset ) {
								newValue = newValue + '%';
							} else {
								newValue = '-' + newValue + '%';
							}

                            return newValue;
                        } else {
							return element;
						}
					}).join(' ');
				}

				const selector = sectionIDs[i],
                      callback = function() {
                          const $section = $(this);

                          if( target == '#header' || target == '.wrapper-spy' ) {
                              $('#header .header-nav .nav > li a').removeClass('active');
                              $('#header .header-nav .nav > li a[href="#'+ $section[0].id +'"]').addClass('active');
                          } else {
                              $( target ).find('.nav > li a').removeClass('active');
                              $( target ).find('.nav > li a[href="#'+ $section[0].id +'"]').addClass('active');
                          }
                          
                      };

				this.scrollSpyIntObs( selector, callback, { 
					rootMargin,
					threshold: 0
				}, true, i, true);

            }

            return this;

		}

        scrollSpyIntObs(selector, functionName, intObsOptions, alwaysObserve, index, firstLoad) {
			const self = this;

			const $el = document.querySelectorAll( selector );
			let intersectionObserverOptions = {
				rootMargin: '0px 0px 200px 0px'
			};

			if( Object.keys(intObsOptions).length ) {
				intersectionObserverOptions = $.extend(intersectionObserverOptions, intObsOptions);
			}

			const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (entry.intersectionRatio > 0 ) {
						if( typeof functionName === 'string' ) {
							const func = Function( 'return ' + functionName )();
						} else {
							const callback = functionName;

							callback.call( $(entry.target) );
						}

						// Unobserve
						if( !alwaysObserve ) {
							observer.unobserve(entry.target);   
						}

					} else {
						if( firstLoad == false ) {
							if( index == self.sectionIDs.length - 1 ) {
								$('#header .header-nav .nav > li a').removeClass('active');
								$('#header .header-nav .nav > li a[href="#'+ entry.target.id +'"]').parent().prev().find('a').addClass('active');
							}
						}
						firstLoad = false;

					}
                }
            }, intersectionObserverOptions);
			
			$( $el ).each(function(){
				observer.observe( $(this)[0] );
			});

			return this;
		}
    }

    PluginScrollSpy.defaults = {
		target: '#header'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginScrollSpy
	});

    // jquery plugin
    $.fn.themestrapPluginScrollSpy = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginScrollSpy($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
