// Random Images
(((themestrap = {}, $) => {
    const instanceName = '__randomimages';

    class PluginRandomImages {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			this.$el = $el;
            this.st = '';
			this.times = 0;
			this.perImageIndex = 0;

            if( $el.is('img') && typeof opts.imagesListURL == 'undefined' ) {
                return false;
            }

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
			this.options = $.extend(true, {}, PluginRandomImages.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
			
			// Control the screens size we want to have the plugin working
			if( $(window).width() < self.options.minWindowWidth  ) {
				return false;
			}

			// Check if is single image or wrapper with images inside
            if( self.$el.is('img') ) {
				
				// Check it's inside a lightbox
				self.isInsideLightbox = self.$el.closest('.lightbox').length ? true : false;

				// Push the initial image to lightbox list/array
				if( self.isInsideLightbox && self.options.lightboxImagesListURL ) {
					self.options.lightboxImagesListURL.push( self.$el.closest('.lightbox').attr('href') );
				}
	
				// Push the current image src to the array
				self.options.imagesListURL.push( self.$el.attr('src') );

				// Start with lastIndex as the first image loaded on the page
				self.lastIndex = self.options.imagesListURL.length - 1;

				// Identify the last random image element (if has more than one on the page)
				if( self.options.random == false ) {
					$('.plugin-random-images').each(function(i){
						if( i == $('.plugin-random-images').length - 1 ) {
							$(this).addClass('the-last');
						}
					});
				}

				// Start the recursive timeout
				setTimeout(() => {
					self.recursiveTimeout( 
						self.perImageTag, 
						self.options.delay == null ? 3000 : self.options.delay
					);
				}, self.options.delay == null ? 300 : self.options.delay / 3);

			} else {
				
				// Start the recursive timeout
				setTimeout( self.recursiveTimeout( 
					self.perWrapper, 
					self.options.delay ? self.options.delay : getPerWrapperHighDelay(), 
					false 
				), 300);

			}

			// Stop After Few Seconds
			if( self.options.stopAfterFewSeconds ) {
				setTimeout(() => {
					clearTimeout(self.st);
				}, self.options.stopAfterFewSeconds);
			}
			
			return this;

		}

        perImageTag() {
			const self = this;

			// Generate a random index to make the images rotate randomly
			let index = self.options.random ? Math.floor(Math.random() * self.options.imagesListURL.length) : self.lastIndex;

			// Avoid repeat the same image
			if( self.lastIndex !== '' && self.lastIndex == index ) {
				if( self.options.random ) {
					while( index == self.lastIndex ) {
						index = Math.floor(Math.random() * self.options.imagesListURL.length);
					}
				} else {
					index = index - 1;
					if( index == -1 ) {
						index = self.options.imagesListURL.length - 1;
					}
				}
			}

			// Turn the image ready for animations
			self.$el.addClass('animated');

			// Remove the entrance animation class and add the out animation class
			self.$el.removeClass( self.options.animateIn ).addClass( self.options.animateOut );
			
			// Change the image src and add the class for entrance animation
			setTimeout( () => {
				self.$el.attr('src', self.options.imagesListURL[index]).removeClass( self.options.animateOut ).addClass(self.options.animateIn);

				if( self.isInsideLightbox && self.options.lightboxImagesListURL ) {
					self.$el.closest('.lightbox').attr('href', self.options.lightboxImagesListURL[index]);
				}
			}, 1000);
			
			// Save the last index for future checks
			self.lastIndex = index;
			
			// Increment the times var
			self.times++;

			// Save the index for stopAtImageIndex option
			self.perImageIndex = index;

			return this;
		}

        // Iterate the imaes loop and get the higher value
        getPerWrapperHighDelay() {
            const self = this;
            const $wrapper = self.$el;
            let delay = 0;

            $wrapper.find('img').each(function(){
				const $image = $(this);
				
				if( $image.data('rimage-delay') && parseInt( $image.data('rimage-delay') ) > delay ) {
					delay = parseInt( $image.data('rimage-delay') );
				}
			});

            return delay;
        }

        perWrapper() {
			const self = this, $wrapper = self.$el;

			// Turns the imageLlistURL into an array
			self.options.imagesListURL = [];

			// Find all images inside the element wrapper and push their sources to image list array
			$wrapper.find('img').each(function(){
				const $image = $(this);
				self.options.imagesListURL.push( $image.attr('src') ); 
			});

			// Shuffle the images list array (random effect)
			self.options.imagesListURL = self.shuffle( self.options.imagesListURL );

			// Iterate over each image and make some checks like delay for each image, animations, etc...
			$wrapper.find('img').each(function(index){
				const $image = $(this), animateIn  = $image.data('rimage-animate-in') ? $image.data('rimage-animate-in') : self.options.animateIn, animateOut = $image.data('rimage-animate-out') ? $image.data('rimage-animate-out') : self.options.animateOut, delay      = $image.data('rimage-delay') ? $image.data('rimage-delay') : 2000;

				$image.addClass('animated');

				setTimeout( () => {
					$image.removeClass( animateIn ).addClass( animateOut );
				}, delay / 2);

				setTimeout( () => {
					$image.attr('src', self.options.imagesListURL[index]).removeClass( animateOut ).addClass(animateIn);
				}, delay);

			});
			
			// Increment the times variable
			self.times++;

			return this;
		}

        recursiveTimeout(callback, delay) {
			const self = this;

			const timeout = () => {

				if( callback !== null ) {
					callback.call(self);
				}

				// Recursive
				self.st = setTimeout(timeout, delay == null ? 1000 : delay);

				if( self.options.random == false ) {
					if( self.$el.hasClass('the-last') ) {
						$('.plugin-random-images').trigger('rimages.start');
					} else {
						clearTimeout(self.st);
					}
				}

				// Stop At Image Index
				if( self.options.stopAtImageIndex && parseInt(self.options.stopAtImageIndex) == self.perImageIndex ) {
					clearTimeout(self.st);
				}

				// Stop After X Timers
				if( self.options.stopAfterXTimes == self.times ) {
					clearTimeout(self.st);
				}
			};
			timeout();

			self.$el.on('rimages.start', () => {
				clearTimeout(self.st);
				self.st = setTimeout(timeout, delay == null ? 1000 : delay);
			});

		}

        shuffle(array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				const temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}

			return array;
		}
    }

    PluginRandomImages.defaults = {
		minWindowWidth: 0,
		random: true,
		imagesListURL: null,
		lightboxImagesListURL: null,
        delay: null,
        animateIn: 'fadeIn',
		animateOut: 'fadeOut',
		stopAtImageIndex: false, // The value shoudl be the index value of array with images as string. Eg: '2' 
		stopAfterFewSeconds: false, // The value should be in mili-seconds. Eg: 10000 = 10 seconds
		stopAfterXTimes: false,
		accY: 0
	};

    // expose to scope
    $.extend(themestrap, {
		PluginRandomImages
	});

    // jquery plugin
    $.fn.themestrapPluginRandomImages = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginRandomImages($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
