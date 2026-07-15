
// Themestrap
window.themestrap = {};

// Themestrap Common Functions
window.themestrap.fn = {

	getOptions(opts) {

		if (typeof(opts) == 'object') {

			return opts;

		} else if (typeof(opts) == 'string') {

			try {
				return JSON.parse(opts.replace(/'/g, '"').replace(';', ''));
			} catch (e) {
				return {};
			}

		} else {

			return {};

		}

	},

	execPluginFunction(functionName, context) {
		const args = Array.prototype.slice.call(arguments, 2);
		const namespaces = functionName.split(".");
		const func = namespaces.pop();

		for (let i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}

		return context[func](...args);
	},

	intObs(selector, functionName, intObsOptions, alwaysObserve) {
		const $el = document.querySelectorAll(selector);
		let intersectionObserverOptions = {
			rootMargin: '0px 0px 200px 0px'
		};

		if (Object.keys(intObsOptions).length) {
			intersectionObserverOptions = $.extend(intersectionObserverOptions, intObsOptions);
		}

		const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.intersectionRatio > 0) {
					if (typeof functionName === 'string') {
						const func = Function('return ' + functionName)();
					} else {
						const callback = functionName;

						callback.call($(entry.target));
					}

					// Unobserve
					if (!alwaysObserve) {
						observer.unobserve(entry.target);
					}

				}
            }
        }, intersectionObserverOptions);

		$($el).each(function() {
			observer.observe($(this)[0]);
		});
	},

	intObsInit(selector, functionName) {
		const $el = document.querySelectorAll(selector);
		const intersectionObserverOptions = {
			rootMargin: '200px'
		};

		const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.intersectionRatio > 0) {
                    const $this = $(entry.target);
                    let opts;

                    const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                    if (pluginOptions)
						opts = pluginOptions;

                    themestrap.fn.execPluginFunction(functionName, $this, opts);

                    // Unobserve
                    observer.unobserve(entry.target);
                }
            }
        }, intersectionObserverOptions);

		$($el).each(function() {
			observer.observe($(this)[0]);
		});
	},

	dynIntObsInit(selector, functionName, pluginDefaults) {
		const $el = document.querySelectorAll(selector);

		$($el).each(function() {
            const $this = $(this);
            let opts;

            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
            if (pluginOptions)
				opts = pluginOptions;

            const mergedPluginDefaults = themestrap.fn.mergeOptions(pluginDefaults, opts);

            const intersectionObserverOptions = {
				rootMargin: themestrap.fn.getRootMargin(functionName, mergedPluginDefaults),
				threshold: 0
			};

            if (!mergedPluginDefaults.forceInit) {

				const observer = new IntersectionObserver(entries => {
                    for (const entry of entries) {
                        if (entry.intersectionRatio > 0) {
							themestrap.fn.execPluginFunction(functionName, $this, mergedPluginDefaults);

							// Unobserve
							observer.unobserve(entry.target);
						}
                    }
                }, intersectionObserverOptions);

				observer.observe($this[0]);

			} else {
				themestrap.fn.execPluginFunction(functionName, $this, mergedPluginDefaults);
			}
        });
	},

	getRootMargin(plugin, {accY}) {
		switch (plugin) {
			case 'themestrapPluginCounter':
				return accY ? `0px 0px ${accY}px 0px` : '0px 0px 200px 0px';
				break;

			case 'themestrapPluginAnimate':
				return accY ? `0px 0px ${accY}px 0px` : '0px 0px 200px 0px';
				break;

			case 'themestrapPluginIcon':
				return accY ? `0px 0px ${accY}px 0px` : '0px 0px 200px 0px';
				break;

			case 'themestrapPluginRandomImages':
				return accY ? `0px 0px ${accY}px 0px` : '0px 0px 200px 0px';
				break;

			default:
				return '0px 0px 200px 0px';
				break;
		}
	},

	mergeOptions(obj1, obj2) {
		const obj3 = {};

		for (var attrname in obj1) {
			obj3[attrname] = obj1[attrname];
		}
		for (var attrname in obj2) {
			obj3[attrname] = obj2[attrname];
		}

		return obj3;
	},

	execOnceThroughEvent($el, event, callback) {
		const self = this, dataName = self.formatDataName(event);

		$($el).on(event, function() {
			if (!$(this).data(dataName)) {

				// Exec Callback Function
				callback.call($(this));

				// Add data name 
				$(this).data(dataName, true);

				// Unbind event
				$(this).off(event);
			}
		});

		return this;
	},

	execOnceThroughWindowEvent($el, event, callback) {
		const self = this, dataName = self.formatDataName(event);

		$($el).on(event, function() {
			if (!$(this).data(dataName)) {

				// Exec Callback Function
				callback();

				// Add data name 
				$(this).data(dataName, true);

				// Unbind event
				$(this).off(event);
			}
		});

		return this;
	},

	formatDataName(name) {
		name = name.replace('.', '');
		return name;
	},

	isElementInView($el) {
		const rect = $el[0].getBoundingClientRect();

		return (
			rect.top <= (window.innerHeight / 3)
		);
	},

	//getScripts(arr, path) {
	//	const _arr = $.map(arr, scr => $.getScript((path || "") + scr));
	//	_arr.push($.Deferred(({resolve}) => {
	//		$(resolve);
	//	}));
	//	return $.when(..._arr);
	//},

    getScripts(arr, path = '') {
        const loadedScripts = new Set();
        const requests = arr.map(src => {
            const fullPath = path + src;
    
            if (loadedScripts.has(fullPath)) {
                return $.Deferred().resolve();
            }
    
            return $.getScript(fullPath).done(() => {
                loadedScripts.add(fullPath);
            });
        });
    
        return $.when(...requests);
    },
    
    async importScripts(arr, path = '') {
        await Promise.all(
            arr.map(src => import(path + src))
        );
    },

	showErrorMessage(title, content) {

		if ($('html').hasClass('disable-error-warning')) {
			return;
		}

		$('.modalThemestrapErrorMessage').remove();
		$('body').append('<div class="modal fade" id="modalThemestrapErrorMessage"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">' + title + '</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">' + content + '</div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button></div></div></div></div>');

		var modalThemestrapErrorMessage = document.getElementById('modalThemestrapErrorMessage');
		var modalThemestrapErrorMessage = bootstrap.Modal.getOrCreateInstance(modalThemestrapErrorMessage);
		modalThemestrapErrorMessage.show();

	}

};

(((themestrap = {}, $) => {
	/*
	Browser Selector
	*/
	$.extend({

		browserSelector() {

			// jQuery.browser.mobile (http://detectmobilebrowser.com/)
			(a => {(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

			// Touch
			const hasTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

			const u = navigator.userAgent, ua = u.toLowerCase(), is = t => ua.includes(t), g = 'gecko', w = 'webkit', s = 'safari', o = 'opera', h = document.documentElement, b = [(!(/opera|webtv/i.test(ua)) && /msie\s(\d)/.test(ua)) ? (`ie ie${parseFloat(navigator.appVersion.split("MSIE")[1])}`) : is('firefox/2') ? `${g} ff2` : is('firefox/3.5') ? `${g} ff3 ff3_5` : is('firefox/3') ? `${g} ff3` : is('gecko/') ? g : is('opera') ? o + (/version\/(\d+)/.test(ua) ? ` ${o}${RegExp.jQuery1}` : (/opera(\s|\/)(\d+)/.test(ua) ? ` ${o}${RegExp.jQuery2}` : '')) : is('konqueror') ? 'konqueror' : is('chrome') ? `${w} chrome` : is('iron') ? `${w} iron` : is('applewebkit/') ? `${w} ${s}${/version\/(\d+)/.test(ua) ? ` ${s}${RegExp.jQuery1}` : ''}` : is('mozilla/') ? g : '', is('j2me') ? 'mobile' : is('iphone') ? 'iphone' : is('ipod') ? 'ipod' : is('mac') ? 'mac' : is('darwin') ? 'mac' : is('webtv') ? 'webtv' : is('win') ? 'win' : is('freebsd') ? 'freebsd' : (is('x11') || is('linux')) ? 'linux' : '', 'js'];

			c = b.join(' ');

			if ($.browser.mobile) {
				c += ' mobile';
			}

			if (hasTouch) {
				c += ' touch';
			}

			h.className += ` ${c}`;

			// Edge Detect
			const isEdge = /Edge/.test(navigator.userAgent);

			if(isEdge) {
				$('html').removeClass('chrome').addClass('edge');
			}

			// Dark and Boxed Compatibility
			if($('body').hasClass('dark')) {
				$('html').addClass('dark');
			}

			if($('body').hasClass('boxed')) {
				$('html').addClass('boxed');
			}

		}

	});

	$.browserSelector();

	/*
	Browser Workarounds
	*/
	if (/iPad|iPhone|iPod/.test(navigator.platform)) {

		// iPad/Iphone/iPod Hover Workaround
		$(document).ready($ => {
			$('.thumb-info').attr('onclick', 'return true');
		});
	}

	/*
	Lazy Load Bacground Images
	*/

	// Check for IntersectionObserver support
	if ('IntersectionObserver' in window) {
		document.addEventListener("DOMContentLoaded", function() {

			function handleIntersection(entries) {
				entries.map((entry) => {
					if (entry.isIntersecting) {
						// Item has crossed our observation
						// threshold - load src from data-src
						entry.target.style.backgroundImage = "url('" + entry.target.dataset.bgSrc + "')";
						// Job done for this item - no need to watch it!
						observer.unobserve(entry.target);
					}
				});
			}

			const lazyLoadElements = document.querySelectorAll('.lazyload');
			const observer = new IntersectionObserver(
				handleIntersection, {
					rootMargin: "100px"
				}
			);
			lazyLoadElements.forEach(lazyLoadEl => observer.observe(lazyLoadEl));
		});
	} else {
		// No interaction support? Load all background images automatically
		const lazyLoadElements = document.querySelectorAll('.lazyload');
		lazyLoadElements.forEach(lazyLoadEl => {
			lazyLoadEl.style.backgroundImage = "url('" + lazyLoadEl.dataset.bgSrc + "')";
		});
	}

	/*
	Tabs
	*/
	if( $('a[data-bs-toggle="tab"]').length ) {
		$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function({target}) {
			const $tabPane = $($(target).attr('href'));

			// Carousel Refresh
			if($tabPane.length) {
				$tabPane.find('.owl-carousel').trigger('refresh.owl.carousel');
			}

			// Change Active Class
			$(this).parents('.nav-tabs').find('.active').removeClass('active');
			$(this).addClass('active').parent().addClass('active');
		});	

		if( window.location.hash ) {
			$(window).on('load', () => {
				if( window.location.hash !== '*' && $( window.location.hash ).get(0) ) {
					new bootstrap.Tab( $('a.nav-link[href="'+ window.location.hash +'"]:not([data-hash])')[0] ).show();
				}
			});
		}
	}

	/*
	On Load Scroll
	*/
	if( !$('html').hasClass('disable-onload-scroll') && window.location.hash && !['#*'].includes( window.location.hash ) ) {

		window.scrollTo(0, 0);

		$(window).on('load', () => {
			setTimeout(() => {
				const target = window.location.hash;
				let offset = ( $(window).width() < 768 ) ? 180 : 90;

				if (!$(target).length) {
					return;
				}

				if ( $("a[href$='" + window.location.hash + "']").is('[data-hash-offset]') ) {
					offset = parseInt( $("a[href$='" + window.location.hash + "']").first().attr('data-hash-offset') );
				} else if ( $("html").is('[data-hash-offset]') ) {
					offset = parseInt( $("html").attr('data-hash-offset') );
				}

				if (isNaN(offset)) {
					offset = 0;
				}

				$('body').addClass('scrolling');

				$('html, body').animate({
					scrollTop: $(target).offset().top - offset
				}, 600, 'easeOutQuad', () => {
					$('body').removeClass('scrolling');
				});
			}, 1);
		});
	}

	/*
	* Text Rotator
	*/
	$.fn.extend({
		textRotator(options) {

			const defaults = {
				fadeSpeed: 500,
				pauseSpeed: 100,
				child: null
			};

			var options = $.extend(defaults, options);

			return this.each(function() {
				const o = options;
				const obj = $(this);
				const items = $(obj.children(), obj);
				items.each(function() {
					$(this).hide();
				})
				if (!o.child) {
					var next = $(obj).children(':first');
				} else {
					var next = o.child;
				}
				$(next).fadeIn(o.fadeSpeed, () => {
					$(next).delay(o.pauseSpeed).fadeOut(o.fadeSpeed, function() {
						let next = $(this).next();
						if (next.length == 0) {
							next = $(obj).children(':first');
						}
						$(obj).textRotator({
							child: next,
							fadeSpeed: o.fadeSpeed,
							pauseSpeed: o.pauseSpeed
						});
					})
				});
			});
		}
	});

	/*
	* Notice Top bar
	*/
	const $noticeTopBar = {
		$wrapper: $('.notice-top-bar'),
		$closeBtn: $('.notice-top-bar-close'),
		$header: $('#header'),
		$body: $('.body'),
		init() {
			const self = this;

			if( !$.cookie('themestrapNoticeTopBarClose') ) {
				self
					.build()
					.events();
			} else {
				self.$wrapper.parent().prepend( '<!-- Notice Top Bar removed by cookie -->' );
				self.$wrapper.remove();
			}

			return this;
		},
		build() {
			const self = this;

			$(window).on('load', () => {
				setTimeout(() => {
					self.$body.css({
						'margin-top': self.$wrapper.outerHeight(),
						'transition': 'ease margin 300ms'
					});

					$('#noticeTopBarContent').textRotator({
						fadeSpeed: 500,
						pauseSpeed: 5000
					});

					if( ['absolute', 'fixed'].includes( self.$header.css('position') ) ) {
						self.$header.css({
							'top': self.$wrapper.outerHeight(),
							'transition': 'ease top 300ms'
						});
					}

					$(window).trigger('notice.top.bar.opened');

				}, 1000);
			});

			return this;
		},
		events() {
			const self = this;

			self.$closeBtn.on('click', e => {
				e.preventDefault();

				self.$body.animate({
					'margin-top': 0,
				}, 300, () => {
					self.$wrapper.remove();
					self.saveCookie();
				});

				if( ['absolute', 'fixed'].includes( self.$header.css('position') ) ) {
					self.$header.animate({
						top: 0
					}, 300);
				}

				// When header has shrink effect
				if( self.$header.hasClass('header-effect-shrink') ) {
					self.$header.find('.header-body').animate({
						top: 0
					}, 300);
				}

				$(window).trigger('notice.top.bar.closed');
			});

			return this;
		},
		checkCookie() {
			const self = this;

			if( $.cookie('themestrapNoticeTopBarClose') ) {
				return true;
			} else {
				return false;
			}

			return this;
		},
		saveCookie() {
			const self = this;

			$.cookie('themestrapNoticeTopBarClose', true);

			return this;
		}
	};

	if( $('.notice-top-bar').length ) {
		$noticeTopBar.init();
	}

	/*
	* Image Hotspots
	*/
	if( $('.image-hotspot').length ) {
		$('.image-hotspot')
			.append('<span class="ring"></span>')
			.append('<span class="circle"></span>');
	}

	/*
	* Reading Progress
	*/
	if( $('.progress-reading').length ) {

		function updateScrollProgress() {
			const pixels = $(document).scrollTop();
				pageHeight = $(document).height() - $(window).height()
				progress = 100 * pixels / pageHeight;

			$('.progress-reading .progress-bar').width(parseInt(progress) + "%");
		}

		$(document).on('scroll ready', () => {
			updateScrollProgress();
		});

		$(document).ready(() => {
			$(window).afterResize(() => {
				updateScrollProgress();
			});
		});

	}

	/*
	* Page Transition
	*/
	if( $('body[data-plugin-page-transition]').length ) {
		
		let link_click = false;

		$(document).on('click', 'a', function(e){
			link_click = $(this);
		});

		$(window).on("beforeunload", e => {
			if( typeof link_click === 'object' ) {
				const href = link_click.attr('href');

				if( href.indexOf('mailto:') != 0 && href.indexOf('tel:') != 0 && !link_click.data('rm-from-transition') ) {
					$('body').addClass('page-transition-active');
				}
			}
		});

		$(window).on("pageshow", ({persisted, originalEvent}) => {
			if( persisted || originalEvent.persisted) {
				if( $('html').hasClass('safari') ) {
					window.location.reload();
				}
				
				$('body').removeClass('page-transition-active');
			}
		});
	}

	/*
	* Clone Element
	*/
	if( $('[data-clone-element]').length ) {

		$('[data-clone-element]').each(function() {

			const $el = $(this), content = $el.html(), qty = $el.attr('data-clone-element');

			for (let i = 0; i < qty; i++) {
				$el.html($el.html() + content);
			}

		});

	}

	if( $('[data-clone-element-to]').length ) {

		$('[data-clone-element-to]').each(function() {

			const $el = $(this);
			const content = $el.html();
			const $to = $($el.attr('data-clone-element-to'));

			$to.html($to.html() + content);

		});

	}

	/*
	* Thumb Info Floating Caption
	*/
	$('.thumb-info-floating-caption').each(function() {

		$(this)
			.addClass('thumb-info-floating-element-wrapper')
			.append( '<span class="thumb-info-floating-element thumb-info-floating-caption-title d-none">'+ $(this).data('title') +'</span>' );

		if( $(this).data('type') ) {
			$('.thumb-info-floating-caption-title', $(this))
				.append( '<div class="thumb-info-floating-caption-type">'+ $(this).data('type') +'</div>' )
				.css({
					'padding-bottom' : 22
				});
		}

		if( $(this).hasClass('thumb-info-floating-caption-clean') ) {
			$('.thumb-info-floating-element', $(this)).addClass('bg-transparent');
		}

	});

	/*
	* Thumb Info Floating Element
	*/
	if( $('.thumb-info-floating-element-wrapper').length ) {

		if (typeof gsap !== 'undefined') {

			$('.thumb-info-floating-element-wrapper').on('mouseenter', function({clientX, clientY}) {
				
				if(!$(this).data('offset')) {
					$(this).data('offset', 0);
				}

				const offset = parseInt($(this).data('offset'));

				$('.thumb-info-floating-element-clone').remove();

				$('.thumb-info-floating-element', $(this)).clone().addClass('thumb-info-floating-element-clone p-fixed p-events-none').attr('style', 'transform: scale(0.1);').removeClass('d-none').appendTo('body');

				$('.thumb-info-floating-element-clone').css({
					left: clientX + (offset),
					top: clientY + (offset)
				}).fadeIn(300);

				gsap.to('.thumb-info-floating-element-clone', 0.5, {
					css: {
						scaleX: 1,
						scaleY: 1
					}
				});

				$(document).off('mousemove').on('mousemove', ({clientX, clientY}) => {

					gsap.to('.thumb-info-floating-element-clone', 0.5, {
						css: {
							left: clientX + (offset),
							top: clientY + (offset)
						}
					});

				});

			}).on('mouseout', () => {

				gsap.to('.thumb-info-floating-element-clone', 0.5, {
					css: {
						scaleX: 0.5,
						scaleY: 0.5,
						opacity: 0
					}
				});

			});

		} else {
			themestrap.fn.showErrorMessage('Failed to Load File', 'Failed to load: GSAP - Include the following file(s): (vendor/gsap/gsap.min.js)');
		}

	}

	/*
	* Thumb Info Direction Aware
	*/
	$(window).on('load', () => {
		$('.thumb-info-wrapper-direction-aware').each( function() {
			$(this).hoverdir({
				speed : 300,
				easing : 'ease',
				hoverDelay : 0,
				inverse : false,
				hoverElem: '.thumb-info-wrapper-overlay'
			});
		});
	});

	/*
	* Thumb Info Container Full
	*/
	$('.thumb-info-container-full-img').each(function() {

		const $container = $(this);

		$('[data-full-width-img-src]', $container).each(function() {
			const uniqueId = 'img' + Math.floor(Math.random() * 10000);
			$(this).attr('data-rel', uniqueId);

			$container.append('<div style="background-image: url(' + $(this).attr('data-full-width-img-src') + ');" id="' + uniqueId + '" class="thumb-info-container-full-img-large opacity-0"></div>');
		});

		$('.thumb-info', $container).on('mouseenter', function(e){
			$('.thumb-info-container-full-img-large').removeClass('active');
			$('#' + $(this).attr('data-rel')).addClass('active');
		});

	});

	/*
	* Toggle Text Click
	*/
	$('[data-toggle-text-click]').on('click', function () {
		$(this).text(function(i, text){
			return text === $(this).attr('data-toggle-text-click') ? $(this).attr('data-toggle-text-click-alt') : $(this).attr('data-toggle-text-click');
		});
	});

	/*
	* Toggle Class
	*/
	$('[data-toggle-class]').on('click', function (e) {
		e.preventDefault();

		$(this).toggleClass( $(this).data('toggle-class') );
	});

	/*
	* Shape Divider Aspect Ratio
	*/
	if( $('.shape-divider').length ) {
		aspectRatioSVG();
		$(window).on('resize', () => {
			aspectRatioSVG();
		});
	}

	/*
	* Shape Divider Animated
	*/
	if( $('.shape-divider-horizontal-animation').length ) {
		themestrap.fn.intObs('.shape-divider-horizontal-animation', function(){
			for( let i = 0; i <= 1; i++ ) {
				const svgClone = $(this).find('svg:nth-child(1)').clone();

				$(this).append( svgClone )
			}

			$(this).addClass('start');
		}, {});
	}

	/*
	* Shape Divider - SVG Aspect Ratio
	*/
	function aspectRatioSVG() {
		if( $(window).width() < 1950 ) {
			$('.shape-divider svg[preserveAspectRatio]').each(function(){
				if( !$(this).parent().hasClass('shape-divider-horizontal-animation') ) {
					$(this).attr('preserveAspectRatio', 'xMinYMin');
				} else {
					$(this).attr('preserveAspectRatio', 'none');
				}
			});
		} else {
			$('.shape-divider svg[preserveAspectRatio]').each(function(){
				$(this).attr('preserveAspectRatio', 'none');
			});
		}
	}

	/*
	* Content Switcher
	*/
	$('[data-content-switcher]').on('change', function(e, v) {
		const switcherRel = ($(this).is(':checked') ? '1' : '2' ), switcherId = $(this).attr('data-content-switcher-content-id');

		$('[data-content-switcher-id=' + switcherId + ']').addClass('initialized').removeClass('active');

		const $activeEl = $('[data-content-switcher-id=' + switcherId + '][data-content-switcher-rel=' + switcherRel + ']');

		$activeEl.addClass('active');

		$activeEl.parent().css('height', $activeEl.height());
	});

	$('[data-content-switcher]').trigger('change');

	/*
	* Dynamic Height
	*/
	const $window = $(window);
	$window.on('resize dynamic.height.resize', () => {
		$('[data-dynamic-height]').each(function(){
			const $this = $(this), values = JSON.parse($this.data('dynamic-height').replace(/'/g,'"').replace(';',''));

			// XS
			if( $window.width() < 576 ) {
				$this.height( values[4] );
			}

			// SM
			if( $window.width() > 575 && $window.width() < 768 ) {
				$this.height( values[3] );
			}

			// MD
			if( $window.width() > 767 && $window.width() < 992 ) {
				$this.height( values[2] );
			}

			// LG
			if( $window.width() > 991 && $window.width() < 1200 ) {
				$this.height( values[1] );
			}

			// XS
			if( $window.width() > 1199 ) {
				$this.height( values[0] );
			}
		});
	});

	// Mobile First Load
	if( $window.width() < 992 ) {
		$window.trigger('dynamic.height.resize');
	}

	/*
	* Video - Trigger Play
	*/
	if( $('[data-trigger-play-video]').length ) {
		themestrap.fn.execOnceThroughEvent( '[data-trigger-play-video]', 'mouseover.trigger.play.video', function(){
			const $video = $( $(this).data('trigger-play-video') );

			$(this).on('click', function(e){
				e.preventDefault();

				if( $(this).data('trigger-play-video-remove') == 'yes' ) {
					$(this).animate({
						opacity: 0
					}, 300, function(){
						$video[0].play();

						$(this).remove();
					});
				} else {
					setTimeout(() => {
						$video[0].play();
					},300);
				}
			});
		});
	}

	/*
	* Video - Auto Play
	*/
	if( $('video[data-auto-play]').length ) {
		$(window).on('load', () => {
			$('video[data-auto-play]').each(function(){
				const $video = $(this);

				setTimeout(() => {
					if( $( '#' + $video.attr('id') ).length ) {
						if( $( '[data-trigger-play-video="#' + $video.attr('id') + '"]' ).data('trigger-play-video-remove') == 'yes' ) {
							$( '[data-trigger-play-video="#' + $video.attr('id') + '"]' ).animate({
								opacity: 0
							}, 300, () => {
								$video[0].play();

								$( '[data-trigger-play-video="#' + $video.attr('id') + '"]' ).remove();
							});
						} else {
							setTimeout(() => {
								$video[0].play();
							},300);
						}
					}
				}, 100);

			});
		});
	}

	/*
	* Remove min height after the load of page
	*/
	if( $('[data-remove-min-height]').length ) {
		$(window).on('load', () => {
			$('[data-remove-min-height]').each(function(){
				$(this).css({
					'min-height': 0
				});
			});
		});
	}

	/*
	* Title Border
	*/
	if($('[data-title-border]').length) {

		const $pageHeaderTitleBorder = $('<span class="page-header-title-border"></span>'), $pageHeaderTitle = $('[data-title-border]'), $window = $(window);

		$pageHeaderTitle.before($pageHeaderTitleBorder);

		const setPageHeaderTitleBorderWidth = () => {
			$pageHeaderTitleBorder.width($pageHeaderTitle.width());
		};

		$window.afterResize(() => {
			setPageHeaderTitleBorderWidth();
		});

		setPageHeaderTitleBorderWidth();

		$pageHeaderTitleBorder.addClass('visible');
	}

	/*
	* Footer Reveal
	*/
	($ => {
		const $footerReveal = {
			$wrapper: $('.footer-reveal'),
			init() {
				const self = this;

				self.build();
				self.events();
			},
			build() {
				const self = this, footer_height = self.$wrapper.outerHeight(true), window_height = ( $(window).height() - $('.header-body').height() );

				if( footer_height > window_height ) {
					$('#footer').removeClass('footer-reveal');
					$('body').css('margin-bottom', 0);
				} else {
					$('#footer').addClass('footer-reveal');
					$('body').css('margin-bottom', footer_height);
				}

			},
			events() {
				const self = this, $window = $(window);

				$window.on('load', () => {
					$window.afterResize(() => {
						self.build();
					});
				});
			}
		};

		if( $('.footer-reveal').length ) {
			$footerReveal.init();
		}
	})(jQuery);

	/*
	* Re-Init Plugin
	*/
	if( $('[data-reinit-plugin]').length ) {
		$('[data-reinit-plugin]').on('click', function(e) {
			e.preventDefault();

			const pluginInstance = $(this).data('reinit-plugin'), pluginFunction = $(this).data('reinit-plugin-function'), pluginElement  = $(this).data('reinit-plugin-element'), pluginOptions  = themestrap.fn.getOptions($(this).data('reinit-plugin-options'));

			$( pluginElement ).data( pluginInstance ).destroy();

			setTimeout(() => {
				themestrap.fn.execPluginFunction(pluginFunction, $( pluginElement ), pluginOptions);	
			}, 1000);

		});
	}

	/*
	* Simple Copy To Clipboard
	*/
	if( $('[data-copy-to-clipboard]').length ) {
		themestrap.fn.intObs( '[data-copy-to-clipboard]', function(){
			const $this = $(this);

			$this.wrap( '<div class="copy-to-clipboard-wrapper position-relative"></div>' );

			const $copyButton = $('<a href="#" class="btn btn-primary btn-px-2 py-1 text-0 position-absolute top-8 right-8">COPY</a>');
			$this.parent().prepend( $copyButton );

			$copyButton.on('click', function(e){
				e.preventDefault();

				const $btn       = $(this), $temp = $('<textarea class="d-block opacity-0" style="height: 0;">');

				$btn.parent().append( $temp );

				$temp.val( $this.text() );
					
				$temp[0].select();
				$temp[0].setSelectionRange(0, 99999);

				document.execCommand("copy");

				$btn.addClass('copied');
				setTimeout(() => {
					$btn.removeClass('copied');
				}, 1000);

				$temp.remove();
			});
		}, {
			rootMargin: '0px 0px 0px 0px'
		} );
	}

	/*
	* Marquee
	*/
	if( $('.marquee').length && $.isFunction($.fn.marquee) ) {
		$('.marquee').marquee({
			duration: 5000,
			gap: 0,
			delayBeforeStart: 0,
			direction: 'left',
			duplicated: true
		});
	}

	/*
	* Style Switcher Open Loader Button
	*/
	if( $('.style-switcher-open-loader').length ) {

		const urlParams = new URLSearchParams(window.location.search);

		let hideStyleSwitcherAfterShow = false;

		$('.style-switcher-open-loader').on('click', function(e){
			e.preventDefault();

			const $this = $(this);

			// Add Spinner to icon
			$this.addClass('style-switcher-open-loader-loading');

			const basePath = $(this).data('base-path'), skinSrc = $(this).data('skin-src');

			const script1 = document.createElement("script");
			script1.src = basePath + "master/style-switcher/style.switcher.localstorage.js";

			const script2 = document.createElement("script");
			script2.src = basePath + "master/style-switcher/style.switcher.js";
			script2.id = "styleSwitcherScript";
			script2.setAttribute('data-base-path', basePath);
			script2.setAttribute('data-skin-src', skinSrc);

			script2.onload = () => {
				setTimeout(() => {
					// Trigger a click to open the style switcher sidebar
					function checkIfReady() {
						if( !$('.style-switcher-open').length ) {
							window.setTimeout(checkIfReady, 100);
						} else {
							$('.style-switcher-open').trigger('click');

							if (hideStyleSwitcherAfterShow) {
								setTimeout(() => {
									$('.style-switcher-open').trigger('click');
								}, 2000);
							}
						}
					}
					checkIfReady();

				}, 500);
			}

			document.body.appendChild(script1);
			document.body.appendChild(script2);	

		});

		let htmlDataOptions = $('html').data('style-switcher-options');
		let showSwitcher = false;

		if(htmlDataOptions) {
			htmlDataOptions = htmlDataOptions.replace(/'/g, '"');

			if (JSON.parse(htmlDataOptions).showSwitcher) {
				showSwitcher = true;
			}

			if (JSON.parse(htmlDataOptions).hideStyleSwitcherAfterShow) {
				hideStyleSwitcherAfterShow = true;
			}
		}

		if (urlParams.has("showStyleSwitcher")) {
			showSwitcher = true;
		}

		if (urlParams.has("hideStyleSwitcherAfterShow")) {
			hideStyleSwitcherAfterShow = true;
		}

		if (showSwitcher) {
			$('.style-switcher-open-loader').trigger('click');
		}

	}

})).apply(this, [ window.themestrap, jQuery ]);

// Animate
(((themestrap = {}, $) => {
    const instanceName = '__animate';

    class PluginAnimate {
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
			this.options = $.extend(true, {}, PluginAnimate.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			// Flag Class Only
			// - Useful for simple animations like hightlight
			// - Less process and memory
			if( self.options.flagClassOnly ) {
				const delay = self.options.wrapper.attr('data-appear-animation-delay') ? self.options.wrapper.attr('data-appear-animation-delay') : self.options.delay;
				
				self.options.wrapper.css({
					'animation-delay': delay + 'ms',
					'transition-delay': delay + 'ms'
				});
				self.options.wrapper.addClass( self.options.wrapper.attr('data-appear-animation') );

				return this;
			}

			if($('body').hasClass('loading-overlay-showing')) {
				$(window).on('loading.overlay.ready', () => {
					self.animate();
				});
			} else {
				self.animate();
			}

			return this;
		}

        animate() {
            const self = this;
            const $el = this.options.wrapper;
            let delay = 0;
            let duration = this.options.duration;
            const elTopDistance = $el.offset().top;
            const windowTopDistance = $(window).scrollTop();

            // If has appear animation elements inside a SVG. 
            // Intersection Observer API do not check elements inside SVG's, so we need initialize trough top parent SVG
            if( $el.data('appear-animation-svg') ) {
				$el.find('[data-appear-animation]').each(function(){
                    const $this = $(this);
                    let opts;

                    const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                    if (pluginOptions)
						opts = pluginOptions;

                    $this.themestrapPluginAnimate(opts);
                });

				return this;
			}

            // No animation at the first load of page. This is good for performance
            if( self.options.firstLoadNoAnim ) {
				$el.removeClass('appear-animation');

				// Inside Carousel
				if( $el.closest('.owl-carousel').get(0) ) {
					setTimeout(() => {
						$el.closest('.owl-carousel').on('change.owl.carousel', () => {
							self.options.firstLoadNoAnim = false;
							$el.removeData('__animate');
							$el.themestrapPluginAnimate( self.options );
						});
					}, 500);
				}

				return this;
			}

            $el.addClass('appear-animation animated');

            if (!$('html').hasClass('no-csstransitions') && $(window).width() > self.options.minWindowWidth && elTopDistance >= windowTopDistance || self.options.forceAnimation == true) {
				delay = ($el.attr('data-appear-animation-delay') ? $el.attr('data-appear-animation-delay') : self.options.delay);
				duration = ($el.attr('data-appear-animation-duration') ? $el.attr('data-appear-animation-duration') : self.options.duration);

				if (duration != '750ms') {
					$el.css('animation-duration', duration);
				}

				$el.css('animation-delay', delay + 'ms');
				$el.addClass($el.attr('data-appear-animation') + ' appear-animation-visible');
				
				$el.trigger('animation:show');

			} else {
				$el.addClass('appear-animation-visible');
			}

            return this;
        }
    }

    PluginAnimate.defaults = {
		accX: 0,
		accY: -80,
		delay: 100,
		duration: '750ms',
		minWindowWidth: 0,
		forceAnimation: false,
		flagClassOnly: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginAnimate
	});

    // jquery plugin
    $.fn.themestrapPluginAnimate = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginAnimate($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);

// Animated Content
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

// Before / After
(((themestrap = {}, $) => {
    const instanceName = '__beforeafter';

    class PluginBeforeAfter {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
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
			this.options = $.extend(true, {}, PluginBeforeAfter.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {

			if ($.isFunction($.fn.twentytwenty)) {

				const self = this;

				self.options.wrapper.waitForImages(() => {
					self.options.wrapper.twentytwenty(self.options);
				});

			} else {

				themestrap.fn.showErrorMessage('Failed to Load File', 'Failed to load: twentytwenty - Include the following file(s): (vendor/twentytwenty/css/twentytwenty.css, vendor/twentytwenty/js/jquery.event.move.js, vendor/twentytwenty/js/jquery.twentytwenty.js)');

			}

			return this;

		}
    }

    PluginBeforeAfter.defaults = {
		forceInit: true,
		default_offset_pct: 0.5,
		orientation: 'horizontal',
		before_label: 'Before',
		after_label: 'After',
		no_overlay: false,
		move_slider_on_hover: false,
		move_with_handle_only: true,
		click_to_move: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginBeforeAfter
	});

    // jquery plugin
    $.fn.themestrapPluginBeforeAfter = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginBeforeAfter($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Carousel Light
(((themestrap = {}, $) => {
    const instanceName = '__carouselLight';

    class PluginCarouselLight {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;
			this.clickFlag = true;

			this
				.setData()
				.setOptions(opts)
				.build()
				.owlNav()
				.owlDots()
				.autoPlay()
				.events();

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginCarouselLight.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			self.$el
				.css('opacity', 1)
				.find('.owl-item:first-child')
				.addClass('active');

			self.$el.trigger('initialized.owl.carousel');

			// Carousel Navigate By ID and item index
			self.carouselNavigate();

			return this;
		}

        changeSlide($nextSlide) {
			const self = this, $prevSlide = self.$el.find('.owl-item.active');

			self.$el.find('.owl-item.active').addClass('removing');

			$prevSlide
				.removeClass('fadeIn')
				.addClass( 'fadeOut animated' );

			setTimeout(() => {
				setTimeout(() => {
					$prevSlide.removeClass('active');
				}, 400);

				$nextSlide
					.addClass('active')
					.removeClass('fadeOut')
					.addClass( 'fadeIn animated' );

			}, 200);

			// Dots
			self.$el
				.find('.owl-dot')
				.removeClass('active')
				.eq( $nextSlide.index() )
				.addClass('active');

			self.$el.trigger({
				type: 'change.owl.carousel',
				nextSlideIndex: $nextSlide.index(),
				prevSlideIndex: $prevSlide.index()
			});

			setTimeout(() => {
				self.$el.trigger({
					type: 'changed.owl.carousel',
					nextSlideIndex: $nextSlide.index(),
					prevSlideIndex: $prevSlide.index()
				});
			}, 500);
		}

        owlNav() {
			const self = this, $owlNext = self.$el.find('.owl-next'), $owlPrev = self.$el.find('.owl-prev');

			$owlPrev.on('click', e => {
				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				self.owlPrev();
			});

			$owlNext.on('click', e => {
				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				self.owlNext();
			});

			return this;
		}

        owlDots() {
			const self = this, $owlDot = self.$el.find('.owl-dot');

			$owlDot.on('click', function(e){
				let $this = $(this);

				e.preventDefault();

				if( self.options.disableAutoPlayOnClick ) {
					window.clearInterval(self.autoPlayInterval);
				}

				if( self.avoidMultipleClicks() ) {
					return false;
				}

				const dotIndex = $(this).index();

				// Do nothing if respective dot slide is active/showing
				if( $this.hasClass('active') ) {
					return false;
				}

				self.changeSlide( self.$el.find('.owl-item').eq( dotIndex ) );
			});

			return this;
		}

        owlPrev() {
			const self = this;

			if( self.$el.find('.owl-item.active').prev().get(0) ) {
				self.changeSlide( self.$el.find('.owl-item.active').prev() );
			} else {
				self.changeSlide( self.$el.find('.owl-item:last-child') );
			}
		}

        owlNext() {
			const self = this;

			if( self.$el.find('.owl-item.active').next().get(0) ) {
				self.changeSlide( self.$el.find('.owl-item.active').next() );
			} else {
				self.changeSlide( self.$el.find('.owl-item').eq(0) );
			}
		}

        avoidMultipleClicks() {
			const self = this;

			if( !self.clickFlag ) {
				return true;
			}

			if( self.clickFlag ) {
				self.clickFlag = false;
				setTimeout(() => {
					self.clickFlag = true; 
				}, 1000);
			}

			return false;
		}

        autoPlay() {
			const self = this, $el  = this.options.wrapper;

			if( self.options.autoplay ) {
				self.autoPlayInterval = window.setInterval(() => {
					self.owlNext();
				}, self.options.autoplayTimeout);
			}

			return this;
		}

        carouselNavigate() {
			const self      = this, $el       = this.options.wrapper, $carousel = $el;

			if( $('[data-carousel-navigate]').get(0) ) {
				$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').each(function(){
					const $this = $(this), hasCarousel = $( $this.data('carousel-navigate-id') ).get(0), toIndex = $this.data('carousel-navigate-to');

					if( hasCarousel ) {

						$this.on('click', () => {

							if( self.options.disableAutoPlayOnClick ) {
								window.clearInterval(self.autoPlayInterval);
							}
							
							self.changeSlide( self.$el.find('.owl-item').eq( parseInt(toIndex) - 1 ) );
						});

					}
				});

				$el.on('change.owl.carousel', e => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').removeClass('active');
				});

				$el.on('changed.owl.carousel', ({nextSlideIndex}) => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"][data-carousel-navigate-to="'+ ( nextSlideIndex + 1 ) +'"]').addClass('active');
				});
			}

			return this;
		}

        events() {
			const self = this;

			self.$el.on('change.owl.carousel', event => {

				// Hide elements inside carousel
			    self.$el.find('[data-appear-animation]:not(.background-image-wrapper), [data-plugin-animated-letters]').addClass('invisible');

			    // Animated Letters
			    self.$el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');

			    // Remove "d-none" class before show the element. This is useful when using background images inside a carousel. Like ken burns effect
			    self.$el.find('.owl-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');

			});

			self.$el.on('changed.owl.carousel', event => {
				setTimeout(() => {

				    // Appear Animation
				    if( self.$el.find('.owl-item.cloned [data-appear-animation]').get(0) ) {
				    	self.$el.find('.owl-item.cloned [data-appear-animation]').each(function() {
                            const $this = $(this);
                            let opts;

                            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                            if (pluginOptions)
								opts = pluginOptions;

                            $this.themestrapPluginAnimate(opts);
                        });
				    }

					// Show elements inside carousel
				    self.$el.find('.owl-item.active [data-appear-animation]:not(.background-image-wrapper), [data-plugin-animated-letters]').removeClass('invisible');

				    // Animated Letters
				    self.$el.find('.owl-item.active [data-plugin-animated-letters]').trigger('animated.letters.initialize');

				    // Background Video
				    self.$el.find('.owl-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');

				}, 500);
			    
			});

			if( self.options.swipeEvents ) {
				self.$el.swipe({
					swipe(event, direction, distance, duration, fingerCount, fingerData) {
						switch ( direction ) {
							case 'right':
								self.owlPrev();
							break;
				
							case 'left':
								self.owlNext();
							break;
						}
					},
					allowPageScroll: "vertical"
				});
			}
		}
    }

    PluginCarouselLight.defaults = {
		autoplay: true,
		autoplayTimeout: 7000,
		disableAutoPlayOnClick: true,
		swipeEvents: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCarouselLight
	});

    // jquery plugin
    $.fn.themestrapPluginCarouselLight = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCarouselLight($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);

// Carousel
(((themestrap = {}, $) => {
    const instanceName = '__carousel';

    class PluginCarousel {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
				return this;
			}

			this.$el = $el;

			// If has data-icon inside, initialize only after icons get rendered
			// Prevent flicking issues
			if( $el.find('[data-icon]').get(0) ) {
				const self = this;

				$(window).on('icon.rendered', function(){
					if ($el.data(instanceName)) {
						return this;
					}

					setTimeout(() => {
						self
							.setData()
							.setOptions(opts)
							.build();
					}, 1000);
				});

				return this;
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
			this.options = $.extend(true, {}, PluginCarousel.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.owlCarousel))) {
				return this;
			}

			const self = this, $el = this.options.wrapper;

			// Add Themestrap Class
			$el.addClass('owl-themestrap');

			// Add Loading
			$el.addClass('owl-loading');

			// Force RTL according to HTML dir attribute
			if ($('html').attr('dir') == 'rtl') {
				this.options = $.extend(true, {}, this.options, {
					rtl: true
				});
			}

			if (this.options.items == 1) {
				this.options.responsive = {}
			}

			if (this.options.items > 4) {
				this.options = $.extend(true, {}, this.options, {
					responsive: {
						1199: {
							items: this.options.items
						}
					}
				});
			}

			// Auto Height Fixes
			if (this.options.autoHeight) {
				const itemsHeight = [];

				$el.find('.owl-item').each(function(){
					if( $(this).hasClass('active') ) {
						itemsHeight.push( $(this).height() );
					}
				});

				$(window).afterResize(() => {
					$el.find('.owl-stage-outer').height( Math.max.apply(null, itemsHeight) );
				});

				$(window).on('load', () => {
					$el.find('.owl-stage-outer').height( Math.max.apply(null, itemsHeight) );
				});
			}

			// Initialize OwlCarousel
			$el.owlCarousel(this.options).addClass('owl-carousel-init animated fadeIn');

			// Remove "animated fadeIn" class to prevent conflicts
			setTimeout(() => {
				$el.removeClass('animated fadeIn');
			}, 1000);

			// Owl Carousel Wrapper
			if( $el.closest('.owl-carousel-wrapper').get(0) ) {
				setTimeout(() => {
					$el.closest('.owl-carousel-wrapper').css({
						height: ''
					});
				}, 500);
			}

			// Owl Carousel Loader
			if( $el.prev().hasClass('owl-carousel-loader') ) {
				$el.prev().remove();
			}

			// Nav Offset
			self.navigationOffsets();

			// Nav Outside
			if( $el.hasClass('nav-outside') ) {
				$(window).on('owl.carousel.nav.outside', () => {
					if( $(window).width() < 992 ) {
						self.options.stagePadding = 40;
						$el.addClass('stage-margin');
					} else {
						self.options.stagePadding = 0;
						$el.removeClass('stage-margin');
					}

					$el.owlCarousel('destroy').owlCarousel( self.options );

					// Nav Offset
					self.navigationOffsets();
				});

				// Window Resize
				$(window).on('load', () => {
					$(window).afterResize(() => {
						$(window).trigger('owl.carousel.nav.outside');
					});
				});

				// First Load
				$(window).trigger('owl.carousel.nav.outside');
			}

			// Nav style 5 (SVG Arrows)
			if( $el.hasClass('nav-svg-arrows-1') ) {
				const svg_arrow = '' +
					'<svg version="1.1" viewBox="0 0 15.698 8.706" width="17" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
						'<polygon stroke="#212121" stroke-width="0.1" fill="#212121" points="11.354,0 10.646,0.706 13.786,3.853 0,3.853 0,4.853 13.786,4.853 10.646,8 11.354,8.706 15.698,4.353 "/>' +
					'</svg>';

				$el.find('.owl-next, .owl-prev').append( svg_arrow );
			}

			// Sync
			if( $el.attr('data-sync') ) {
				$el.on('change.owl.carousel', ({namespace, property, relatedTarget}) => {
					if (namespace && property.name === 'position') {
					    const target = relatedTarget.relative(property.value, true);
					    $( $el.data('sync') ).owlCarousel('to', target, 300, true);				        
				  	}
				});
			}

			// Carousel Center Active Item
			if( $el.hasClass('carousel-center-active-item') ) {
				const itemsActive    = $el.find('.owl-item.active'), indexCenter    = Math.floor( ($el.find('.owl-item.active').length - 1) / 2 ), itemCenter     = itemsActive.eq(indexCenter);

				itemCenter.addClass('current');

				$el.on('change.owl.carousel', event => {
				  	$el.find('.owl-item').removeClass('current');
					
					setTimeout(() => {
					  	const itemsActive    = $el.find('.owl-item.active'), indexCenter    = Math.floor( ($el.find('.owl-item.active').length - 1) / 2 ), itemCenter     = itemsActive.eq(indexCenter);

					  	itemCenter.addClass('current');
					}, 100);
				});

				// Refresh
				$el.trigger('refresh.owl.carousel');

			}

			// AnimateIn / AnimateOut Fix
			if( self.options.animateIn || self.options.animateOut ) {
				$el.on('change.owl.carousel', event => {

					// Hide elements inside carousel
				    $el.find('[data-appear-animation], [data-plugin-animated-letters]').addClass('d-none');

				    // Animated Letters
				    $el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');

				    // Remove "d-none" class before show the element. This is useful when using background images inside a carousel. Like ken burns effect
				    $el.find('.owl-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');

				});

				$el.on('changed.owl.carousel', event => {
					setTimeout(() => {

					    // Appear Animation
				    	$el.find('[data-appear-animation]').each(function() {
                            const $this = $(this);
                            let opts;

                            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                            if (pluginOptions)
								opts = pluginOptions;

                            $this.themestrapPluginAnimate(opts);
                        });

						// Show elements inside carousel
					    $el.find('.owl-item.active [data-appear-animation], [data-plugin-animated-letters]').removeClass('d-none');

					    // Animated Letters
					    $el.find('.owl-item.active [data-plugin-animated-letters]').trigger('animated.letters.initialize');

					    // Background Video
					    $el.find('.owl-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');

					}, 10);
				    
				});
			}

			// data-icon inside carousel
			if( $el.find('[data-icon]').length ) {
				$el.on('change.owl.carousel drag.owl.carousel', () => {
					$el.find('.owl-item.cloned [data-icon]').each(function(){
                        const $this = $(this);
                        let opts;

                        const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                        if (pluginOptions)
							opts = pluginOptions;

                        $this.themestrapPluginIcon(opts);
                    });
				});
			}

			// Render Background Videos inside carousel. Just a trigger on window is sufficient to render
			if( $el.find('[data-plugin-video-background]').get(0) ) {
				$(window).resize();
			}

			// Remove Loading
			$el.removeClass('owl-loading');

			// Remove Height
			$el.css('height', 'auto');

			// Carousel Navigate By ID and item index
			self.carouselNavigate();

			// Refresh Carousel
			if( self.options.refresh ) {
				$el.owlCarousel('refresh');
			}

			return this;
		}

        navigationOffsets() {
			const self 			 = this, $el  			 = this.options.wrapper, navHasTransform  = $el.find('.owl-nav').css('transform') == 'none' ? false : true, dotsHasTransform = $el.find('.owl-dots').css('transform') == 'none' ? false : true;

			// ************* NAV *****************
			// Nav Offset - Horizontal
			if( self.options.navHorizontalOffset && !self.options.navVerticalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d('+ self.options.navHorizontalOffset +', 0, 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						left: self.options.navHorizontalOffset
					});
				}
			}

			// Nav Offset - Vertical
			if( self.options.navVerticalOffset && !self.options.navHorizontalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d(0, '+ self.options.navVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						top: 'calc( 50% - '+ self.options.navVerticalOffset +' )'
					});
				}
			}

			// Nav Offset - Horizontal & Vertical
			if( self.options.navVerticalOffset && self.options.navHorizontalOffset ) {
				if( !navHasTransform ) {
					$el.find('.owl-nav').css({
						transform: 'translate3d('+ self.options.navHorizontalOffset +', '+ self.options.navVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-nav').css({
						top: 'calc( 50% - '+ self.options.navVerticalOffset +' )',
						left: self.options.navHorizontalOffset
					});
				}
			}

			// ********** DOTS *********************
			// Dots Offset - Horizontal
			if( self.options.dotsHorizontalOffset && !self.options.dotsVerticalOffset ) {
				$el.find('.owl-dots').css({
					transform: 'translate3d('+ self.options.dotsHorizontalOffset +', 0, 0)'
				});
			}

			// Dots Offset - Vertical
			if( self.options.dotsVerticalOffset && !self.options.dotsHorizontalOffset ) {
				if( !dotsHasTransform ) {
					$el.find('.owl-dots').css({
						transform: 'translate3d(0, '+ self.options.dotsVerticalOffset +', 0)'
					});
				} else {
					$el.find('.owl-dots').css({
						top: 'calc( 50% - '+ self.options.dotsVerticalOffset +' )'
					});
				}
			}

			// Dots Offset - Horizontal & Vertical
			if( self.options.dotsVerticalOffset && self.options.dotsHorizontalOffset ) {
				$el.find('.owl-dots').css({
					transform: 'translate3d('+ self.options.dotsHorizontalOffset +', '+ self.options.dotsVerticalOffset +', 0)'
				});
			}

			return this;
		}

        carouselNavigate() {
			const self      = this, $el       = this.options.wrapper, $carousel = $el.data('owl.carousel');

			if( $('[data-carousel-navigate]').get(0) ) {
				$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').each(function(){
					const $this = $(this), hasCarousel = $( $this.data('carousel-navigate-id') ).get(0), toIndex = $this.data('carousel-navigate-to');

					if( hasCarousel ) {

						$this.on('click', () => {
							$carousel.to( parseInt(toIndex) - 1 );
						});

					}
				});

				$el.on('change.owl.carousel', () => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"]').removeClass('active');
				});

				$el.on('changed.owl.carousel', ({item}) => {
					$('[data-carousel-navigate-id="#'+ $el.attr('id') +'"][data-carousel-navigate-to="'+ ( item.index + 1 ) +'"]').addClass('active');
				});
			}

			return this;
		}
    }

    PluginCarousel.defaults = {
		loop: true,
		responsive: {
			0: {
				items: 1
			},
			479: {
				items: 1
			},
			768: {
				items: 2
			},
			979: {
				items: 3
			},
			1199: {
				items: 4
			}
		},
		navText: [],
		refresh: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCarousel
	});

    // jquery plugin
    $.fn.themestrapPluginCarousel = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCarousel($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Chart Circular
(((themestrap = {}, $) => {
    const instanceName = '__chartCircular';

    class PluginChartCircular {
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
			this.options = $.extend(true, {}, PluginChartCircular.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.easyPieChart))) {
				return this;
			}

			const self = this, $el = this.options.wrapper, value = ($el.attr('data-percent') ? $el.attr('data-percent') : 0), percentEl = $el.find('.percent');

			$.extend(true, self.options, {
				onStep(from, to, currentValue) {
					percentEl.html(parseInt(currentValue));
				}
			});

			$el.attr('data-percent', 0);

			$el.easyPieChart(self.options);

			setTimeout(() => {

				$el.data('easyPieChart').update(value);
				$el.attr('data-percent', value);

			}, self.options.delay);

			return this;
		}
    }

    PluginChartCircular.defaults = {
		accX: 0,
		accY: -150,
		delay: 1,
		barColor: '#0088CC',
		trackColor: '#f2f2f2',
		scaleColor: false,
		scaleLength: 5,
		lineCap: 'round',
		lineWidth: 13,
		size: 175,
		rotate: 0,
		animate: ({
			duration: 2500,
			enabled: true
		})
	};

    // expose to scope
    $.extend(themestrap, {
		PluginChartCircular
	});

    // jquery plugin
    $.fn.themestrapPluginChartCircular = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginChartCircular($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Countdown
(((themestrap = {}, $) => {
    const instanceName = '__countdown';

    class PluginCountdown {
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
			this.options = $.extend(true, {}, PluginCountdown.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.countTo))) {
				return this;
			}

			const self = this, $el = this.options.wrapper, numberClass = ( self.options.numberClass ) ? ' ' + self.options.numberClass : '', wrapperClass = ( self.options.wrapperClass ) ? ' ' + self.options.wrapperClass : '';

			if( self.options.uppercase ) {
				$el.countdown(self.options.date).on('update.countdown', function(event) {
					const $this = $(this).html(event.strftime(self.options.insertHTMLbefore
						+ '<span class="days'+ wrapperClass +'"><span class="'+ numberClass +'">%D</span> '+ self.options.textDay +'</span> '
						+ '<span class="hours'+ wrapperClass +'"><span class="'+ numberClass +'">%H</span> '+ self.options.textHour +'</span> '
						+ '<span class="minutes'+ wrapperClass +'"><span class="'+ numberClass +'">%M</span> '+ self.options.textMin +'</span> '
						+ '<span class="seconds'+ wrapperClass +'"><span class="'+ numberClass +'">%S</span> '+ self.options.textSec +'</span> '
						+ self.options.insertHTMLafter
					));
				});
			} else {
				$el.countdown(self.options.date).on('update.countdown', function(event) {
					const $this = $(this).html(event.strftime(self.options.insertHTMLbefore
						+ '<span class="days'+ wrapperClass +'"><span class="'+ numberClass +'">%D</span> '+ self.options.textDay +'</span> '
						+ '<span class="hours'+ wrapperClass +'"><span class="'+ numberClass +'">%H</span> '+ self.options.textHour +'</span> '
						+ '<span class="minutes'+ wrapperClass +'"><span class="'+ numberClass +'">%M</span> '+ self.options.textMin +'</span> '
						+ '<span class="seconds'+ wrapperClass +'"><span class="'+ numberClass +'">%S</span> '+ self.options.textSec +'</span> '
						+ self.options.insertHTMLafter
					));
				});
			}

			return this;
		}
    }

    PluginCountdown.defaults = {
		date: '2030/06/10 12:00:00',
		textDay: 'DAYS',
		textHour: 'HRS',
		textMin: 'MIN',
		textSec: 'SEC',
		uppercase: true,
		numberClass: '',
		wrapperClass: '',
		insertHTMLbefore: '',
		insertHTMLafter: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCountdown
	});

    // jquery plugin
    $.fn.themestrapPluginCountdown = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCountdown($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Counter
(((themestrap = {}, $) => {
    const instanceName = '__counter';

    class PluginCounter {
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
			this.options = $.extend(true, {}, PluginCounter.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.countTo))) {
				return this;
			}

			const self = this, $el = this.options.wrapper;

			if (self.options.comma) {
				self.options.formatter = (value, {decimals}) => value.toFixed(decimals).toString().replace('.',',')
			}

			$.extend(self.options, {
				onComplete() {
					
					if ($el.data('append')) {
						if( self.options.appendWrapper ) {
							const appendWrapper = $( self.options.appendWrapper );
							appendWrapper.append( $el.data('append') );
							$el.html( $el.html() + appendWrapper[0].outerHTML );
						} else {
							$el.html($el.html() + $el.data('append'));
						}
					}
					if ($el.data('prepend')) {
						if( self.options.prependWrapper ) {
							const prependWrapper = $( self.options.prependWrapper );
							prependWrapper.append( $el.data('prepend') );
                            $el.html(prependWrapper[0].outerHTML + $el.html());
						} else {
							$el.html($el.data('prepend') + $el.html());
						}
					}
				}
			});

			$el.countTo(self.options);

			return this;
		}
		
		destroy() {
            this.$el.removeData(instanceName);
            return this;
        }
    }

    PluginCounter.defaults = {
		accX: 0,
		accY: 0,
		appendWrapper: false,
		prependWrapper: false,
		speed: 3000,
		refreshInterval: 100,
		decimals: 0,
		comma: false,
		onUpdate: null,
		onComplete: null
	}

    // expose to scope
    $.extend(themestrap, {
		PluginCounter
	});

    // jquery plugin
    $.fn.themestrapPluginCounter = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCounter($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

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

// GDPR
(((themestrap = {}, $) => {
    const instanceName = '__gdpr';

    class PluginGDPR {
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

			return this;
		}

        setData() {
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginGDPR.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			// Show
			if( !$.cookie( 'themestrap-privacy-bar' ) ) {
				setTimeout(() => {
					self.options.wrapper.addClass('show');
				}, self.options.cookieBarShowDelay);
			}

			// If already has preferences cookie, check inputs according preferences cookie data
			if( $.cookie( 'themestrap-gdpr-preferences' ) ) {
				const preferencesArr = $.cookie( 'themestrap-gdpr-preferences' ).split(',');

				for( let i = 0; i < preferencesArr.length; i++ ) {
					if( $('input[value="'+ preferencesArr[i] +'"]').get(0) ) {
						if( $('input[value="'+ preferencesArr[i] +'"]').is(':checkbox') ) {
							$('input[value="'+ preferencesArr[i] +'"]').prop('checked', true);
						}
					}
				}
			}

			return this;

		}

        events() {
			const self = this;

			// Agree Trigger
			self.options.wrapper.find('.gdpr-agree-trigger').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-form').find('.gdpr-input').each(function(){
					if( $(this).is(':checkbox') || $(this).is(':hidden') ) {
						$(this).prop('checked', true);
					}
				});

				$('.gdpr-preferences-form').trigger('submit').removeClass('show');

				self.removeCookieBar();
			});

			// Preferences Trigger
			self.options.wrapper.find('.gdpr-preferences-trigger').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').addClass('show');
			});

			// Close Popup Button
			$('.gdpr-close-popup').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').removeClass('show');
			});

			// Close Popup When Click Outside of popup area
			$('.gdpr-preferences-popup').on('click', ({target}) => {
				if( !$(target).closest('.gdpr-preferences-popup-content').get(0) ) {
					$('.gdpr-preferences-popup').removeClass('show');
				}
			});

			// Preference Form
			$('.gdpr-preferences-form').on('submit', function(e){
				e.preventDefault();

				const $this = $(this);

				// Save Preferences Button
				$this.find('button[type="submit"]').text( 'SAVING...' );

				// Form Data
				const formData = [];
				$this.find('.gdpr-input').each(function(){
					if( $(this).is(':checkbox') && $(this).is(':checked') || $(this).is(':hidden') ) {
						formData.push( $(this).val() );
					}
				});

				$.cookie( 'themestrap-privacy-bar', true, {expires: self.options.expires} );

				setTimeout(() => {
					$this.find('button[type="submit"]').text( 'SAVED!' ).removeClass('btn-primary').addClass('btn-success');

					setTimeout(() => {
						$('.gdpr-preferences-popup').removeClass('show');
						self.removeCookieBar();

						$this.find('button[type="submit"]').text( 'SAVE PREFERENCES' ).removeClass('btn-success').addClass('btn-primary');

						if( $.cookie( 'themestrap-gdpr-preferences' ) ) {

							$.cookie( 'themestrap-gdpr-preferences', formData, {expires: self.options.expires} );
							location.reload();

						} else {

							$.cookie( 'themestrap-gdpr-preferences', formData, {expires: self.options.expires} );

							if ($.isFunction($.fn['themestrapPluginGDPRWrapper']) && $('[data-plugin-gdpr-wrapper]').length) {

								$(() => {
									$('[data-plugin-gdpr-wrapper]:not(.manual)').each(function() {
                                        const $this = $(this);
                                        let opts;

                                        $this.removeData('__gdprwrapper');

                                        const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                                        if (pluginOptions)
											opts = pluginOptions;

                                        $this.themestrapPluginGDPRWrapper(opts);
                                    });
								});

							}

						}

					}, 500);
				}, 1000);
			});

			// Remove/Reset Cookies
			$('.gdpr-reset-cookies').on('click', e => {
				e.preventDefault();

				self.clearCookies();

				location.reload();
			});

			// Open Preferences
			$('.gdpr-open-preferences').on('click', e => {
				e.preventDefault();

				$('.gdpr-preferences-popup').toggleClass('show');
			});

			return this;
		}

        removeCookieBar() {
			const self = this;

			self.options.wrapper.addClass('removing').on('transitionend', () => {
				setTimeout(() => {
					self.options.wrapper.removeClass('show removing');
				}, 500);
			});

			return this;
		}

        clearCookies() {
			const self = this;

			$.removeCookie( 'themestrap-privacy-bar' );
			$.removeCookie( 'themestrap-gdpr-preferences' );

			return this;
		}
    }

    PluginGDPR.defaults = {
		cookieBarShowDelay: 3000,
		expires: 365
	};

    // expose to scope
    $.extend(themestrap, {
		PluginGDPR
	});

    // jquery plugin
    $.fn.themestrapPluginGDPR = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginGDPR($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// GDPR Wrapper
(((themestrap = {}, $) => {
    const instanceName = '__gdprwrapper';

    class PluginGDPRWrapper {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			const self = this;

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
			this.options = $.extend(true, {}, PluginGDPRWrapper.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if( $.cookie( 'themestrap-gdpr-preferences' ) && $.cookie( 'themestrap-gdpr-preferences' ).includes(self.options.checkCookie) ) {

				$.ajax({
					url: self.options.ajaxURL,
					cache: false,
					complete({responseText}) {
					
						setTimeout(() => {

							self.options.wrapper.html(responseText).addClass('show');

						}, 1000);

					}
				});

			} else {
				self.options.wrapper.addClass('show');
			}

			return this;

		}
    }

    PluginGDPRWrapper.defaults = {

	};

    // expose to scope
    $.extend(themestrap, {
		PluginGDPRWrapper
	});

    // jquery plugin
    $.fn.themestrapPluginGDPRWrapper = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginGDPRWrapper($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Hover Effect
(((themestrap = {}, $) => {
    const instanceName = '__hoverEffect';

    class PluginHoverEffect {
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
			this.options = $.extend(true, {}, PluginHoverEffect.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this;

			if(self.$el.hasClass('hover-effect-3d')) {
				self.options.effect = '3d';
			}

			// Magnetic
			if(self.options.effect == 'magnetic') {
				self.magnetic();
			}

			// 3d
			if(self.options.effect == '3d') {
				self.hover3d();
			}

			return this;
		}

        magnetic() {
			const self = this;

			self.$el.mousemove(function({clientX, clientY}) {

				const pos = this.getBoundingClientRect();
				const mx = clientX - pos.left - pos.width/2; 
				const my = clientY - pos.top - pos.height/2;

				this.style.transform = 'translate('+ mx * self.options.magneticMx +'px, '+ my * self.options.magneticMx +'px)';

			});

			self.$el.mouseleave(function(e) {

				this.style.transform = 'translate3d(0px, 0px, 0px)';

			});

			return this;

		}

        hover3d() {
			const self = this;

			if ($.isFunction($.fn['hover3d'])) {

				self.$el.hover3d({
					selector: self.options.selector,
					sensitivity: self.options.sensitivity
				});

			}

			return this;

		}
    }

    PluginHoverEffect.defaults = {
		effect: 'magnetic',
		magneticMx: 0.15,
		magneticMy: 0.3,
		magneticDeg: 12,
		selector: '.thumb-info, .hover-effect-3d-wrapper',
		sensitivity: 20
	};

    // expose to scope
    $.extend(themestrap, {
		PluginHoverEffect
	});

    // jquery plugin
    $.fn.themestrapPluginHoverEffect = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginHoverEffect($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);

// Icon
(((themestrap = {}, $) => {
    const instanceName = '__icon';

    class PluginIcon {
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
				const SVGContent = $.get({
					url: fileName, 
					success(data, status, {responseText}) {
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

						const icon = new Vivus(uniqid, {start: 'manual', type: 'sync', selfDestroy: true, duration, onReady({el}) {
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
							setTimeout(() => {
								icon.finish();
							}, 10);
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
							$(window).on('scroll', () => {
								if( $el.visible( true ) ) {
									self.startIconAnimation( icon, $el );
								}
							});

						} else {
							
							$el.css({ opacity: 1 });
							icon.finish();
							
							$(window).on('themestrap.plugin.icon.svg.ready', () => {
								setTimeout(() => {
									icon.el.setAttribute('class', 'finished');
									icon.finish();
								}, 300);
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

				setTimeout(() => {
					icon.el.setAttribute('class', 'finished');
				}, icon.duration * 5 );
			});
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

    // jquery plugin
    $.fn.themestrapPluginIcon = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginIcon($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);

// In Viewport Style
(((themestrap = {}, $) => {
    const instanceName = '__inviewportstyle';

    class PluginInViewportStyle {
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
			this.options = $.extend(true, {}, PluginInViewportStyle.defaults, opts, {});

			return this;
		}

        build() {
			const self = this, el = self.$el.get(0);

			self.$el.css(self.options.style);

		    if (typeof window.IntersectionObserver === 'function') {
			    const un = observeElementInViewport.observeElementInViewport(
			        el, () => {
			        	self.$el.css(self.options.styleIn);
			        	self.$el
			        		.addClass(self.options.classIn)
			        		.removeClass(self.options.classOut);
			        }, () => {
			        	self.$el.css(self.options.styleOut);
			        	self.$el
			        		.addClass(self.options.classOut)
			        		.removeClass(self.options.classIn);
			        }, {
			        	viewport: self.options.viewport, 
			            threshold: self.options.threshold,
						modTop: self.options.modTop,
						modBottom: self.options.modBottom
			        }
			    )
		    };

			return this;
		}
    }

    PluginInViewportStyle.defaults = {
		viewport: window, 
		threshold: [0],
		modTop: '-200px',
		modBottom: '-200px',
		style: {'transition': 'all 1s ease-in-out'},
		styleIn: '',
		styleOut: '',
		classIn: '',
		classOut: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginInViewportStyle
	});

    // jquery plugin
    $.fn.themestrapPluginInViewportStyle = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginInViewportStyle($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Lightbox
(((themestrap = {}, $) => {
    const instanceName = '__lightbox';

    class PluginLightbox {
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
			this.options = $.extend(true, {}, PluginLightbox.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.magnificPopup))) {
				return this;
			}

			this.options.wrapper.magnificPopup(this.options);

			return this;
		}
    }

    PluginLightbox.defaults = {
		tClose: 'Close (Esc)', // Alt text on close button
		tLoading: 'Loading...', // Text that is displayed during loading. Can contain %curr% and %total% keys
		gallery: {
			tPrev: 'Previous (Left arrow key)', // Alt text on left arrow
			tNext: 'Next (Right arrow key)', // Alt text on right arrow
			tCounter: '%curr% of %total%' // Markup for "1 of 7" counter
		},
		image: {
			tError: '<a href="%url%">The image</a> could not be loaded.' // Error message when image could not be loaded
		},
		ajax: {
			tError: '<a href="%url%">The content</a> could not be loaded.' // Error message when ajax request failed
		},
		callbacks: {
			open() {
				$('html').addClass('lightbox-opened');
			},
			close() {
				$('html').removeClass('lightbox-opened');
			}
		}
	};

    // expose to scope
    $.extend(themestrap, {
		PluginLightbox
	});

    // jquery plugin
    $.fn.themestrapPluginLightbox = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginLightbox($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

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

// Masonry
(((themestrap = {}, $) => {
    const instanceName = '__masonry';

    class PluginMasonry {
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
			this.options = $.extend(true, {}, PluginMasonry.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.isotope))) {
				return this;
			}

			const self = this, $window = $(window);

			self.$loader = false;

			if (self.options.wrapper.parents('.masonry-loader').get(0)) {
				self.$loader = self.options.wrapper.parents('.masonry-loader');
				self.createLoader();
			}

			self.options.wrapper.one('layoutComplete', (event, laidOutItems) => {
				self.removeLoader();
			});

			self.options.wrapper.waitForImages(() => {
				self.options.wrapper.isotope(self.options);	
			});

			$(window).on('resize', () => {
				setTimeout(() => {
					self.options.wrapper.isotope('layout');
				}, 300);
			});

			setTimeout(() => {
				self.removeLoader();
			}, 3000);

			return this;
		}

        createLoader() {
			const self = this;

			const loaderTemplate = [
				'<div class="bounce-loader">',
					'<div class="bounce1"></div>',
					'<div class="bounce2"></div>',
					'<div class="bounce3"></div>',
				'</div>'
			].join('');

			self.$loader.append(loaderTemplate);

			return this;
		}

        removeLoader() {

			const self = this;

			if (self.$loader) {

				self.$loader.removeClass('masonry-loader-showing');

				setTimeout(() => {
					self.$loader.addClass('masonry-loader-loaded');
				}, 300);

			}

		}
    }

    PluginMasonry.defaults = {

	};

    // expose to scope
    $.extend(themestrap, {
		PluginMasonry
	});

    // jquery plugin
    $.fn.themestrapPluginMasonry = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginMasonry($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Match Height
(((themestrap = {}, $) => {
    const instanceName = '__matchHeight';

    class PluginMatchHeight {
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
			this.options = $.extend(true, {}, PluginMatchHeight.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.matchHeight))) {
				return this;
			}

			const self = this;

			self.options.wrapper.matchHeight(self.options);

			return this;
		}
    }

    PluginMatchHeight.defaults = {
		byRow: true,
		property: 'height',
		target: null,
		remove: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginMatchHeight
	});

    // jquery plugin
    $.fn.themestrapPluginMatchHeight = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginMatchHeight($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Parallax
(((themestrap = {}, $) => {
    const instanceName = '__parallax';

    class PluginParallax {
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
			this.options = $.extend(true, {}, PluginParallax.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $window = $(window);
            let offset;
            let yPos;
            let plxPos;
            let background;
            let rotateY;

            // Mouse Parallax
            if( self.options.mouseParallax ) {

				$window.mousemove(({clientX, clientY}) => {

					$('.parallax-mouse-object', self.options.wrapper).each(function() {

				        const moving_value = $( this ).attr('data-value');
				        const x = (clientX * moving_value) / 250;
				        const y = (clientY * moving_value) / 250;

				        $( this ).css('transform', 'translateX(' + x + 'px) translateY(' + y + 'px)');
				    });

				});

				return this;

			}

            // Scrollable
            if( self.options.scrollableParallax && $(window).width() > self.options.scrollableParallaxMinWidth ) {
				const $scrollableWrapper = self.options.wrapper.find('.scrollable-parallax-wrapper');

				if( $scrollableWrapper.get(0) ) {
                    let progress 	 = ( $(window).scrollTop() > ( self.options.wrapper.offset().top + $(window).outerHeight() ) ) ? self.options.cssValueEnd : self.options.cssValueStart;
                    const cssValueUnit = self.options.cssValueUnit ? self.options.cssValueUnit : '';

                    $scrollableWrapper.css({
						'background-image' : 'url(' + self.options.wrapper.data('image-src') + ')',
						'background-size' : 'cover',
						'background-position' : 'center',
						'background-attachment' : 'fixed',
						'transition' : 'ease '+ self.options.cssProperty +' '+ self.options.transitionDuration,
						'width' : progress + '%'
					});

                    $(window).on('scroll', e => {
						if( self.options.wrapper.visible( true ) ) {
							const $window = $(window), scrollTop = $window.scrollTop(), elementOffset = self.options.wrapper.offset().top, currentElementOffset = (elementOffset - scrollTop);

						   	const scrollPercent = Math.abs( +( currentElementOffset - $window.height() ) / (self.options.startOffset ? self.options.startOffset : 7) );
						 	
						 	// Increment progress value according scroll position
						 	if( scrollPercent <= self.options.cssValueEnd && progress <= self.options.cssValueEnd ) {
						 		progress = self.options.cssValueStart + scrollPercent;
						 	}

						 	// Adjust CSS end value
						 	if( progress > self.options.cssValueEnd ) {
						 		progress = self.options.cssValueEnd;
						 	}

						 	// Adjust CSS start value
						 	if( progress < self.options.cssValueStart ) {
						 		progress = self.options.cssValueStart;
						 	}

						 	const styles = {};
						 	styles[self.options.cssProperty] = progress + cssValueUnit;

							$scrollableWrapper.css(styles);
						}
					});
                }

				return;
			}

            // Create Parallax Element
            if( self.options.fadeIn ) {
				background = $('<div class="parallax-background fadeIn animated"></div>');
			} else {
				background = $('<div class="parallax-background"></div>');
			}

            // Set Style for Parallax Element
            background.css({
				'background-image' : 'url(' + self.options.wrapper.data('image-src') + ')',
				'background-size' : 'cover',
				'position' : 'absolute',
				'top' : 0,
				'left' : 0,
				'width' : '100%',
				'height' : self.options.parallaxHeight
			});

            if( self.options.parallaxScale ) {
				background.css({
					'transition' : 'transform 500ms ease-out'
				});
			}

            // Add Parallax Element on DOM
            self.options.wrapper.prepend(background);

            // Set Overlfow Hidden and Position Relative to Parallax Wrapper
            self.options.wrapper.css({
				'position' : 'relative',
				'overflow' : 'hidden'
			});

            // Parallax Effect on Scroll & Resize
            const parallaxEffectOnScrolResize = () => {
				$window.on('scroll resize', () => {
					offset  = self.options.wrapper.offset();
					yPos    = -($window.scrollTop() - (offset.top - 100)) / ((self.options.speed + 2 ));
					plxPos  = (yPos < 0) ? Math.abs(yPos) : -Math.abs(yPos);
					rotateY = ( $('html[dir="rtl"]').get(0) ) ? ' rotateY(180deg)' : ''; // RTL
					
					offset  = self.options.wrapper.offset();
					yPos    = -($window.scrollTop() - (offset.top - 100)) / ((self.options.speed + 2 ));
					plxPos  = (yPos < 0) ? Math.abs(yPos) : -Math.abs(yPos);
					rotateY = ( $('html[dir="rtl"]').get(0) ) ? ' rotateY(180deg)' : ''; // RTL

					if( !self.options.parallaxScale ) {

						if( self.options.parallaxDirection == 'bottom' ) {
							self.options.offset = 250;
						}

						let y = ( (plxPos - 50) + (self.options.offset) );
						if( self.options.parallaxDirection == 'bottom' ) {
							y = ( y < 0 ) ? Math.abs( y ) : -Math.abs( y );
						}

						background.css({
							'transform' : 'translate3d(0, '+ y +'px, 0)' + rotateY,
							'background-position-x' : self.options.horizontalPosition
						});

					} else {
                        const scrollTop = $window.scrollTop();
                        const elementOffset = self.options.wrapper.offset().top;
                        const currentElementOffset = (elementOffset - scrollTop);
                        let scrollPercent = Math.abs( +( currentElementOffset - $window.height() ) / (self.options.startOffset ? self.options.startOffset : 7) );

                        scrollPercent = parseInt((scrollPercent >= 100) ? 100 : scrollPercent);

                        const currentScale = (scrollPercent / 100) * 50;

                        if ( !self.options.parallaxScaleInvert ) {
							background.css({
								'transform' : 'scale(1.' + String(currentScale).padStart(2, '0') + ', 1.' + String(currentScale).padStart(2, '0') + ')'
							});
						} else {
							background.css({
								'transform' : 'scale(1.' + String(50 - currentScale).padStart(2, '0') + ', 1.' + String(50 - currentScale).padStart(2, '0') + ')'
							});
						}
                    }
				});

				$window.trigger('scroll');
			};

            if (!$.browser.mobile) {
				parallaxEffectOnScrolResize();
			} else {
				if( self.options.enableOnMobile == true ) {
					parallaxEffectOnScrolResize();
				} else {
					self.options.wrapper.addClass('parallax-disabled');
				}
			}

            return this;
        }
    }

    PluginParallax.defaults = {
		speed: 1.5,
		horizontalPosition: '50%',
		offset: 0,
		parallaxDirection: 'top',
		parallaxHeight: '180%',
		parallaxScale: false,
		parallaxScaleInvert: false,
		scrollableParallax: false,
		scrollableParallaxMinWidth: 991,
		startOffset: 7,
		transitionDuration: '200ms',
		cssProperty: 'width',
		cssValueStart: 40,
		cssValueEnd: 100,
		cssValueUnit: 'vw',
		mouseParallax: false,
		enableOnMobile: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginParallax
	});

    // jquery plugin
    $.fn.themestrapPluginParallax = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginParallax($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Progress Bar
(((themestrap = {}, $) => {
    const instanceName = '__progressBar';

    class PluginProgressBar {
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
			this.options = $.extend(true, {}, PluginProgressBar.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $el = this.options.wrapper;
            let delay = 1;

            delay = ($el.attr('data-appear-animation-delay') ? $el.attr('data-appear-animation-delay') : self.options.delay);

            $el.addClass($el.attr('data-appear-animation'));

            setTimeout(() => {

				$el.animate({
					width: $el.attr('data-appear-progress-animation')
				}, 1500, 'easeOutQuad', () => {
					$el.find('.progress-bar-tooltip').animate({
						opacity: 1
					}, 500, 'easeOutQuad');
				});

			}, delay);

            return this;
        }
    }

    PluginProgressBar.defaults = {
		accX: 0,
		accY: -50,
		delay: 1
	};

    // expose to scope
    $.extend(themestrap, {
		PluginProgressBar
	});

    // jquery plugin
    $.fn.themestrapPluginProgressBar = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginProgressBar($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

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

// Revolution Slider
(((themestrap = {}, $) => {
    const instanceName = '__revolution';

    class PluginRevolutionSlider {
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
			this.options = $.extend(true, {}, PluginRevolutionSlider.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.revolution))) {
				return this;
			}

			// Single Slider Class
			if(this.options.wrapper.find('> ul > li').length == 1) {
				this.options.wrapper.addClass('slider-single-slide');

				// Remove Bullets
				// this.options.navigation.bullets.enable = false;
				$.extend(this.options.navigation, {
					bullets: {
						enable: false
					}
				});

			}

			// Full Screen Class
			if(this.options.sliderLayout == 'fullscreen') {
				this.options.wrapper.closest('.slider-container').addClass('fullscreen-slider');
			}
			
			// Initialize Revolution Slider
			this.options.wrapper.revolution(this.options);

			// Addon Init - Typewriter
			if(this.options.addOnTypewriter.enable) {
				RsTypewriterAddOn($, this.options.wrapper);
			}

			// Addon Init - Whiteboard
			if(this.options.addOnWhiteboard.enable) {
				this.options.wrapper.rsWhiteBoard();
			}

			// Addon Init - Particles
			if(this.options.addOnParticles.enable) {
				RsParticlesAddOn(this.options.wrapper);
			}

			// Addon Init - Countdown
			if(this.options.addOnCountdown.enable) {
				tp_countdown(this.options.wrapper, this.options.addOnCountdown.targetdate, this.options.addOnCountdown.slidechanges);
			}

			// Addon Init - Slicey
			if(this.options.addOnSlicey.enable) {
				this.options.wrapper.revSliderSlicey();
			}

			// Addon Init - Filmstrip
			if(this.options.addOnFilmstrip.enable) {
				RsFilmstripAddOn($, this.options.wrapper, '../vendor/rs-plugin/revolution-addons/filmstrip/', false);
			}

			// Addon Init - Before After
			if(this.options.addOnBeforeAfter.enable) {
				RevSliderBeforeAfter($, this.options.wrapper, this.options.addOnBeforeAfter.options);
			}

			// Addon Init - Panorama
			if(this.options.addOnPanorama.enable) {
				RsAddonPanorama($, this.options.wrapper);
			}

			// Addon Init - Revealer
			if(this.options.addOnRevealer.enable) {
				RsRevealerAddOn($, this.options.wrapper, this.options.revealer.spinnerHtml);
			}

			// Addon Init - Duotone
			if(this.options.addOnDuotone.enable) {
				RsAddonDuotone($, this.options.wrapper, true, "cubic-bezier(0.645, 0.045, 0.355, 1.000)", "1000");
			}

			// Addon Init - Bubblemorph
			if(this.options.addOnBubblemorph.enable) {
				BubbleMorphAddOn($, this.options.wrapper, false);
			}

			// Addon Init - Distortion
			if(this.options.addOnDistortion.enable) {
				RsLiquideffectAddOn($, this.options.wrapper);
			}

			return this;
		}

        events() {

			return this;
		}
    }

    PluginRevolutionSlider.defaults = {
		sliderType: 'standard',
		sliderLayout: 'fullwidth',
		delay: 9000,
		gridwidth: 1170,
		gridheight: 500,
		spinner: 'spinner3',
		disableProgressBar: 'on',
		parallax: {
			type: 'off',
			bgparallax: 'off'
		},
		navigation: {
			keyboardNavigation: 'off',
			keyboard_direction: 'horizontal',
			mouseScrollNavigation: 'off',
			onHoverStop: 'off',
			touch: {
				touchenabled: 'on',
				swipe_threshold: 75,
				swipe_min_touches: 1,
				swipe_direction: 'horizontal',
				drag_block_vertical: false
			},
			arrows: {
				enable: true,
				hide_onmobile: false,
				hide_under: 0,
				hide_onleave: true,
				hide_delay: 200,
				hide_delay_mobile: 1200,
				left: {
					h_align: 'left',
					v_align: 'center',
					h_offset: 30,
					v_offset: 0
				},
				right: {
					h_align: 'right',
					v_align: 'center',
					h_offset: 30,
					v_offset: 0
				}
			}
		},

		/* ADDONS */
	    addOnTypewriter: {
			enable: false
		},
		addOnWhiteboard: {
			enable: false,

		},
	    whiteboard: {
	        movehand: {
	            src: '../vendor/rs-plugin/revolution-addons/whiteboard/assets/images/hand_point_right.png',
	            width: 400,
	            height: 1000,
	            handtype: 'right',
	            transform: {
	                transformX: 50,
	                transformY: 50
	            },
	            jittering: {
	                distance: '80',
	                distance_horizontal: '100',
	                repeat: '5',
	                offset: '10',
	                offset_horizontal: '0'
	            },
	            rotation: {
	                angle: '10',
	                repeat: '3'
	            }
	        },
	        writehand: {
	            src: '../vendor/rs-plugin/revolution-addons/whiteboard/assets/images/write_right_angle.png',
	            width: 572,
	            height: 691,
	            handtype: 'right',
	            transform: {
	                transformX: 50,
	                transformY: 50
	            },
	            jittering: {
	                distance: '80',
	                distance_horizontal: '100',
	                repeat: '5',
	                offset: '10',
	                offset_horizontal: '0'
	            },
	            rotation:{
	                angle: '10',
	                repeat: '3'
	            }
	        }
	    },
	    addOnParticles: {
	    	enable: false
	    },
	    particles: {
			startSlide: "first", 
			endSlide: "last", 
			zIndex: "1",
			particles: {
				number: {value: 80}, color: {value: "#ffffff"},
				shape: {
					type: "circle", stroke: {width: 0, color: "#ffffff", opacity: 1},
					image: {src: ""}
				},
				opacity: {value: 0.5, random: true, min: 0.25, anim: {enable: false, speed: 3, opacity_min: 0, sync: false}},
				size: {value: 2, random: false, min: 30, anim: {enable: false, speed: 40, size_min: 1, sync: false}},
				line_linked: {enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1},
				move: {enable: true, speed: 6, direction: "none", random: true, min_speed: 6, straight: false, out_mode: "out"}
			},
			interactivity: {
				events: {onhover: {enable: false, mode: "repulse"}, onclick: {enable: false, mode: "repulse"}},
				modes: {grab: {distance: 400, line_linked: {opacity: 0.5}}, bubble: {distance: 400, size: 40, opacity: 0.4}, repulse: {distance: 200}}
			}
		},
		addOnCountdown: {
			enable: false,
			targetdate: new Date().getTime() + 864000000, // http://www.freeformatter.com/epoch-timestamp-to-date-converter.html
			slidechanges: [{days: 0, hours: 0, minutes: 0, seconds: 0, slide: 2}]
		},
		addOnSlicey: {
			enable: false
		},
		addOnFilmstrip: {
			enable: false
		},
		addOnBeforeAfter : {
			enable: false,
			options: {
				cursor: "move",
			    carousel: false,
			    arrowStyles: {
			        leftIcon: "fa-icon-caret-left",
			        rightIcon: "fa-icon-caret-right",
			        topIcon: "fa-icon-caret-up",
			        bottomIcon: "fa-icon-caret-down",
			        size: "35",
			        color: "#ffffff",
			        spacing: "10",
			        bgColor: "transparent",
			        padding: "0",
			        borderRadius: "0"
			    },
			    dividerStyles: {
			        width: "1",
			        color: "rgba(255, 255, 255, 0.5)"
			    }
			}
		},
		addOnPanorama: {
			enable: false
		},
		addOnRevealer: {
			enable: false,
		},
		revealer: {
			direction: "open_horizontal",
			color: "#ffffff",
			duration: "1500",
			delay: "0",
			easing: "Power2.easeInOut",
			overlay_enabled: true,
			overlay_color: "#000000",
			overlay_duration: "1500",
			overlay_delay: "0",
			overlay_easing: "Power2.easeInOut",
			spinner: "1",
			spinnerColor: "#006dd2",
			spinnerHtml: "<div class='rsaddon-revealer-spinner rsaddon-revealer-spinner-1'><div class='rsaddon-revealer-1'><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><span style='background: {{color}}'><\/span><\/div><\/div \/>"
		},
		addOnDuotone: {
			enable: false
		},
		addOnBubblemorph: {
			enable: false
		},
		addOnDistortion: {
			enable: false
		}
		
	};

    // expose to scope
    $.extend(themestrap, {
		PluginRevolutionSlider
	});

    // jquery plugin
    $.fn.themestrapPluginRevolutionSlider = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginRevolutionSlider($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// ScrollFx
(((themestrap = {}, $) => {
    const instanceName = '__scrollFx';

    class PluginScrollFx {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el = $el;
            this.el = $el[0];

            this.options = [];
            this.scrollingFx = [];
            this.animating = [];
            this.deltaScrolling = [];
            this.observer = [];

            this.setData()
                .setOptions(opts)
                .setup();

            return this;
        }

        setData() {
            this.boundingRect = this.el.getBoundingClientRect();
            this.windowHeight = window.innerHeight;
            return this;
        }

        setOptions(opts) {
            this.settings = Object.assign({
                scrollableSelector: this.$el.attr('data-scrollable-element') || null
            }, opts);

            this.scrollableElement = this.settings.scrollableSelector
                ? document.querySelector(this.settings.scrollableSelector)
                : null;

            return this;
        }

        setup() {
            // Respect reduced motion
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            this.collectOptions();
            this.initObservers();
            this.bindResize();

            this.dispatch('scrollFxReady');

            return this;
        }

        collectOptions() {
            const base = this.el.getAttribute('data-scroll-fx');

            if (base) {
                this.options.push(this.parseOption(base));
            } else {
                let i = 1;
                let attr;

                while ((attr = this.el.getAttribute(`data-scroll-fx-${i}`))) {
                    this.options.push(this.parseOption(attr));
                    i++;
                }
            }
        }

        initObservers() {
            this.options.forEach((opt, i) => {
                this.scrollingFx[i] = null;
                this.animating[i] = false;
                this.deltaScrolling[i] = this.computeScrollRange(i);

                this.observer[i] = new IntersectionObserver((entries) => {
                    this.handleIntersection(i, entries);
                }, {
                    rootMargin: `${opt[5] - 100}% 0px ${-opt[4]}% 0px`
                });

                this.observer[i].observe(this.el);

                // Initial run
                setTimeout(() => this.update(i));
            });
        }

        handleIntersection(index, entries) {
            const entry = entries[0];

            if (entry.isIntersecting) {
                if (this.scrollingFx[index]) return;

                this.setData();
                this.deltaScrolling[index] = this.computeScrollRange(index);

                this.scrollingFx[index] = this.update.bind(this, index);

                (this.scrollableElement || window)
                    .addEventListener('scroll', this.scrollingFx[index]);

            } else {
                if (!this.scrollingFx[index]) return;

                window.removeEventListener('scroll', this.scrollingFx[index]);
                this.scrollingFx[index] = null;
            }
        }

        update(index) {
            const scroll = this.getScroll();
            const [start, end] = this.deltaScrolling[index];

            if (scroll < start) {
                this.apply(index, this.options[index][1]);
                return;
            }

            if (scroll > end) {
                this.apply(index, this.options[index][2]);
                return;
            }

            if (this.animating[index]) return;

            this.animating[index] = true;

            requestAnimationFrame(() => {
                const opt = this.options[index];
                let value;

                if (isNaN(opt[1])) {
                    value = scroll >= end ? opt[2] : opt[1];
                } else {
                    const progress = (scroll - start) / (end - start);
                    value = opt[1] + (opt[2] - opt[1]) * progress;
                }

                this.apply(index, value);
                this.animating[index] = false;
            });
        }

        apply(index, value) {
            const opt = this.options[index];
            const property = opt[0];

            if (isNaN(value)) {
                if (this.el.getAttribute('data-theme') !== value) {
                    this.el.classList.add('scroll-fx--theme-transition');
                    this.el.offsetWidth;

                    this.el.setAttribute('data-theme', value);

                    this.el.addEventListener('transitionend', () => {
                        this.el.classList.remove('scroll-fx--theme-transition');
                    }, { once: true });
                }
                return;
            }

            const unit = opt[3];

            if (property === '--scroll-fx-skew' || property === '--scroll-fx-scale') {
                this.el.style.setProperty(`${property}-x`, value + unit);
                this.el.style.setProperty(`${property}-y`, value + unit);
            } else {
                this.el.style.setProperty(property, value + unit);
            }
        }

        parseOption(str) {
            const parts = str.split(',').map(s => s.trim());

            const parseValues = (a, b) => {
                let start = parseFloat(a);
                let end = parseFloat(b);
                let unit = a.replace(start, '');

                if (isNaN(start)) {
                    start = a;
                    end = b;
                    unit = '';
                }

                return [start, end, unit];
            };

            const prop = this.normalizeProperty(parts[0]);
            const [start, end, unit] = parseValues(parts[1], parts[2]);

            return [prop, start, end, unit, parseInt(parts[3]), parseInt(parts[4])];
        }

        normalizeProperty(name) {
            let prop = '--scroll-fx-';

            for (let i = 0; i < name.length; i++) {
                prop += name[i] === name[i].toUpperCase()
                    ? '-' + name[i].toLowerCase()
                    : name[i];
            }

            if (prop === '--scroll-fx-rotate') prop = '--scroll-fx-rotate-z';
            if (prop === '--scroll-fx-translate') prop = '--scroll-fx-translate-x';

            return prop;
        }

        computeScrollRange(index) {
            const opt = this.options[index];
            const scroll = this.getScroll();

            return [
                scroll - (this.windowHeight - (this.windowHeight + this.boundingRect.height) * opt[4] / 100) + this.boundingRect.top,
                scroll - (this.windowHeight - (this.windowHeight + this.boundingRect.height) * opt[5] / 100) + this.boundingRect.top
            ];
        }

        getScroll() {
            return this.scrollableElement
                ? this.scrollableElement.scrollTop
                : window.scrollY;
        }

        bindResize() {
            let timeout;

            window.addEventListener('resize', () => {
                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    this.setData();

                    this.deltaScrolling = this.deltaScrolling.map((_, i) => {
                        const range = this.computeScrollRange(i);
                        this.update(i);
                        return range;
                    });

                    this.dispatch('scrollFxResized');
                }, 500);
            });
        }

        dispatch(name) {
            this.el.dispatchEvent(new CustomEvent(name));
        }
    }
    
    // expose to scope
    $.extend(themestrap, {
		PluginScrollFx
	});

    // jquery plugin
    $.fn.themestrapPluginScrollFx = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginScrollFx($this, opts);
			}

		});
	}

    // Auto-init
    $('.js-scroll-fx').each(function () {
        const $this = $(this);
        const instance = new PluginScrollFx($this);
        $this.data(instanceName, instance);
    });

    themestrap.ScrollFx = PluginScrollFx;

})).apply(this, [window.themestrap, jQuery]);

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

// Scroll to Top
(((themestrap = {}, $) => {
    $.extend(themestrap, {

		PluginScrollToTop: {

			defaults: {
				wrapper: $('body'),
				offset: 150,
				buttonClass: 'scroll-to-top',
				buttonAriaLabel: 'Scroll To Top',
				iconClass: 'fas fa-chevron-up',
				delay: 1000,
				visibleMobile: false,
				label: false,
				easing: 'easeOutBack'
			},

			initialize(opts) {
				initialized = true;

				// Don't initialize if the page has Section Scroll
				if( $('body[data-plugin-section-scroll]').get(0) ) {
					return;
				}

				this
					.setOptions(opts)
					.build()
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts);

				return this;
			},

			build() {
                const self = this;
                let $el;

                // Base HTML Markup
                $el = $('<a />')
					.addClass(self.options.buttonClass)
					.attr({
						'href': '#',
						'aria-label': self.options.buttonAriaLabel
					})
					.append(
						$('<i />')
						.addClass(self.options.iconClass)
				);

                // Visible Mobile
                if (!self.options.visibleMobile) {
					$el.addClass('hidden-mobile');
				}

                // Label
                if (self.options.label) {
					$el.append(
						$('<span />').html(self.options.label)
					);
				}

                this.options.wrapper.append($el);

                this.$el = $el;

                return this;
            },

			events() {
                const self = this;
                let _isScrolling = false;

                // Click Element Action
                self.$el.on('click', e => {
					e.preventDefault();
					$('html').animate({
						scrollTop: 0
					}, self.options.delay, self.options.easing);
					return false;
				});

                // Show/Hide Button on Window Scroll event.
                $(window).scroll(() => {

					if (!_isScrolling) {

						_isScrolling = true;

						if ($(window).scrollTop() > self.options.offset) {

							self.$el.stop(true, true).addClass('visible');
							_isScrolling = false;

						} else {

							self.$el.stop(true, true).removeClass('visible');
							_isScrolling = false;

						}

					}

				});

                return this;
            }

		}

	});
})).apply(this, [window.themestrap, jQuery]);

/**
 * Scroller
 *
 * A native, dependency-free custom scrollbar. It wraps an element's content in a 
 * hidden-native-scrollbar viewport and renders a themable custom track + draggable 
 * thumb on top.
 *
 * Unlike `themestrap.plugin.scrollable.js` (which delegates to the external
 * nanoScroller vendor library), this plugin implements all scrollbar geometry,
 * dragging, track-paging and auto-hide behaviour itself — no third-party JS.
 *
 * Markup (auto-generated from the host element's existing children):
 *   <div data-plugin-scroller>                ->  .ts-scroller
 *     ...your content...                          .ts-scroller__content  (scroll viewport)
 *                                                 .ts-scroller__bar      (track)
 *                                                   .ts-scroller__thumb  (draggable thumb)
 */
// Scroller
(((themestrap = {}, $) => {

    const instanceName = '__pluginScroller';

    // Per-instance id so multiple scrollers can namespace their window events
    // independently and detach cleanly in destroy().
    let uidCounter = 0;

    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID.
    const STYLE_ID = 'ts-scroller-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginScroller (native custom scrollbar, no vendor deps) */
.ts-scroller {
    --ts-scroller-size:        8px;
    --ts-scroller-gutter:      2px;
    --ts-scroller-radius:      8px;
    --ts-scroller-track:       transparent;
    --ts-scroller-thumb:       rgba(10, 25, 41, 0.28);
    --ts-scroller-thumb-hover: rgba(10, 25, 41, 0.5);
    position: relative;
    overflow: hidden;
}

/* Scroll viewport — native scrollbar hidden, momentum scrolling on iOS */
.ts-scroller__content {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;      /* Firefox            */
    -ms-overflow-style: none;   /* legacy Edge / IE   */
    box-sizing: border-box;
}
.ts-scroller__content::-webkit-scrollbar {   /* Chrome / Safari */
    width: 0;
    height: 0;
    display: none;
}

/* Custom track — hidden until overflow exists, then revealed by state classes */
.ts-scroller__bar {
    position: absolute;
    top:    var(--ts-scroller-gutter);
    right:  var(--ts-scroller-gutter);
    bottom: var(--ts-scroller-gutter);
    width:  var(--ts-scroller-size);
    background: var(--ts-scroller-track);
    border-radius: var(--ts-scroller-radius);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
    z-index: 5;
}
.ts-scroller--has-overflow .ts-scroller__bar {
    pointer-events: auto;
}
.ts-scroller--has-overflow.ts-scroller--always  .ts-scroller__bar,
.ts-scroller--has-overflow.ts-scroller--scrolling .ts-scroller__bar,
.ts-scroller--has-overflow.ts-scroller--dragging  .ts-scroller__bar,
.ts-scroller--has-overflow:hover .ts-scroller__bar {
    opacity: 1;
}

/* Custom thumb — vertical position driven by translateY() from JS */
.ts-scroller__thumb {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 30px;
    background: var(--ts-scroller-thumb);
    border-radius: var(--ts-scroller-radius);
    cursor: grab;
    transition: background .2s ease;
    will-change: transform;
    touch-action: none;
}
.ts-scroller__thumb:hover,
.ts-scroller--dragging .ts-scroller__thumb {
    background: var(--ts-scroller-thumb-hover);
}
.ts-scroller--dragging .ts-scroller__thumb {
    cursor: grabbing;
}
.ts-scroller--dragging,
.ts-scroller--dragging .ts-scroller__content {
    -webkit-user-select: none;
    user-select: none;
}
`;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    // Normalize a CSS length: bare numbers become px, strings pass through.
    function cssLen(v) {
        if (v === null || v === undefined || v === '') return '';
        return (typeof v === 'number' || /^\d+(\.\d+)?$/.test(String(v))) ? (v + 'px') : String(v);
    }

    class PluginScroller {

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
            this.options = $.extend(true, {}, PluginScroller.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily — only when an instance is built.
            injectStyles();

            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            self._uid     = ++uidCounter;
            self._pointer = ('PointerEvent' in window);
            self._dragging = false;

            $el.addClass('ts-scroller');

            // Wrap the host element's existing content (elements AND text nodes)
            // into the scroll viewport. wrapInner preserves the original nodes,
            // so any event handlers bound to the content survive intact.
            $el.wrapInner($('<div></div>').addClass(options.contentClass));
            self.$content = $el.children().first();

            // Build the custom track + thumb and lay it over the viewport.
            self.$thumb = $('<div></div>').addClass(options.sliderClass);
            self.$bar   = $('<div></div>').addClass(options.paneClass).append(self.$thumb);
            $el.append(self.$bar);

            // Height handling:
            //   - `height`    -> fixed wrapper height; content fills it (height:100%).
            //   - `maxHeight`  -> content grows up to a cap, wrapper sizes to content.
            //   - neither     -> rely on whatever CSS height the wrapper already has.
            if (options.height) {
                $el.css('height', cssLen(options.height));
            }
            if (options.maxHeight) {
                $el.css('height', '');
                self.$content.css({ height: 'auto', maxHeight: cssLen(options.maxHeight) });
            }

            // Make the viewport keyboard-focusable so arrow / page keys scroll it.
            if (options.tabIndex !== null && options.tabIndex !== undefined) {
                self.$content.attr('tabindex', options.tabIndex);
            }

            if (options.alwaysVisible) {
                $el.addClass('ts-scroller--always');
            }

            // Recalculate when the viewport resizes or its content mutates.
            if (typeof ResizeObserver !== 'undefined') {
                self._resizeObserver = new ResizeObserver(() => self.update());
                self._resizeObserver.observe($el[0]);
                self._resizeObserver.observe(self.$content[0]);
            }
            if (typeof MutationObserver !== 'undefined') {
                self._mutationObserver = new MutationObserver(() => self.update());
                self._mutationObserver.observe(self.$content[0], {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }

            self.update();

            return this;
        }

        events() {
            const self     = this;
            const downEvt  = (self._pointer ? 'pointerdown' : 'mousedown') + '.scroller';

            // Single entry point on the track: thumb-hit starts a drag,
            // track-hit pages the viewport toward the click position.
            self.$bar.on(downEvt, function(e) {
                if (self.$thumb.is(e.target) || $.contains(self.$thumb[0], e.target)) {
                    self._startDrag(e);
                } else {
                    self._trackJump(e);
                }
            });

            // Native scroll on the viewport drives the thumb position.
            self.$content.on('scroll.scroller', () => {
                self._positionThumb();
                self._flash();
            });

            // Optionally stop the page from scrolling once a boundary is reached.
            if (self.options.preventPageScrolling) {
                self.$content.on('wheel.scroller', (e) => self._onWheel(e));
            }

            $(window).on('resize.scroller-' + self._uid, () => self.update());

            return this;
        }

        /**
         * Measure the viewport, size the thumb proportionally and toggle the
         * overflow state. Safe to call repeatedly (reset / reflow entry point).
         */
        update() {
            const self    = this;
            const options = self.options;

            if (!self.$content || !self.$content.length) {
                return this;
            }

            const content  = self.$content[0];
            const viewportH = content.clientHeight;   // visible height
            const contentH  = content.scrollHeight;    // total scrollable height
            const barH       = self.$bar[0].clientHeight;

            const hasOverflow = options.isEnabled && contentH > viewportH + 1;
            self.$el.toggleClass('ts-scroller--has-overflow', hasOverflow);

            if (!hasOverflow) {
                self._maxScroll = 0;
                self._maxThumbTravel = 0;
                return this;
            }

            // Thumb height is proportional to the visible / total ratio,
            // clamped between sliderMinHeight and (optionally) sliderMaxHeight,
            // and never taller than the track itself.
            let thumbH = Math.round(barH * (viewportH / contentH));
            thumbH = Math.max(options.sliderMinHeight, thumbH);
            if (options.sliderMaxHeight) {
                thumbH = Math.min(thumbH, options.sliderMaxHeight);
            }
            thumbH = Math.min(thumbH, barH);

            self._thumbH         = thumbH;
            self._maxScroll      = contentH - viewportH;
            self._maxThumbTravel = Math.max(0, barH - thumbH);

            self.$thumb.css('height', thumbH + 'px');
            self._positionThumb();

            return this;
        }

        _positionThumb() {
            const self = this;
            if (!self.$thumb || !self._maxScroll) return this;
            const content = self.$content[0];
            const ratio = self._maxScroll > 0 ? content.scrollTop / self._maxScroll : 0;
            const y = ratio * self._maxThumbTravel;
            self.$thumb.css('transform', 'translateY(' + y + 'px)');
            return this;
        }

        _startDrag(e) {
            const self = this;
            if (!self._maxThumbTravel) return;

            e.preventDefault();

            self._dragging        = true;
            self._dragStartY      = self._eventY(e);
            self._dragStartScroll = self.$content[0].scrollTop;
            self.$el.addClass('ts-scroller--dragging');

            const moveEvt = (self._pointer ? 'pointermove' : 'mousemove') + '.scroller-drag';
            const upEvt   = (self._pointer
                ? 'pointerup.scroller-drag pointercancel.scroller-drag'
                : 'mouseup.scroller-drag');

            $(document)
                .on(moveEvt, (ev) => self._onDragMove(ev))
                .on(upEvt,   ()   => self._endDrag());
        }

        _onDragMove(e) {
            const self = this;
            if (!self._dragging || !self._maxThumbTravel) return;
            const dy = self._eventY(e) - self._dragStartY;
            const scrollDelta = (dy / self._maxThumbTravel) * self._maxScroll;
            self.$content[0].scrollTop = self._dragStartScroll + scrollDelta;
            // The viewport's scroll handler repositions the thumb.
        }

        _endDrag() {
            const self = this;
            self._dragging = false;
            self.$el.removeClass('ts-scroller--dragging');
            $(document).off('.scroller-drag');
            self._flash();
        }

        _trackJump(e) {
            const self = this;
            if (!self._maxThumbTravel) return;

            const rect = self.$bar[0].getBoundingClientRect();
            const y    = self._eventY(e) - rect.top;

            let targetTop = y - (self._thumbH / 2);
            targetTop = Math.max(0, Math.min(self._maxThumbTravel, targetTop));

            const ratio = self._maxThumbTravel > 0 ? targetTop / self._maxThumbTravel : 0;
            self._scrollTo(ratio * self._maxScroll, true);
            self._flash();
        }

        _onWheel(e) {
            const self    = this;
            const content = self.$content[0];
            const oe      = e.originalEvent || e;
            const delta   = oe.deltaY;

            const atTop    = content.scrollTop <= 0;
            const atBottom = content.scrollTop >= (content.scrollHeight - content.clientHeight - 1);

            if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
                e.preventDefault();
            }
        }

        _flash() {
            const self = this;
            if (self.options.alwaysVisible) return;
            self.$el.addClass('ts-scroller--scrolling');
            clearTimeout(self._flashTimer);
            self._flashTimer = setTimeout(() => {
                self.$el.removeClass('ts-scroller--scrolling');
            }, self.options.flashDelay);
        }

        /**
         * Scroll the viewport.
         * @param {number|string|Element|jQuery} value  px offset, 'top', 'bottom',
         *                                               an element or a selector.
         * @param {boolean} smooth                        animate with smooth behaviour.
         */
        scrollTo(value, smooth) {
            const self    = this;
            const content = self.$content[0];
            let top;

            if (value === 'top') {
                top = 0;
            } else if (value === 'bottom') {
                top = content.scrollHeight;
            } else if (typeof value === 'number') {
                top = value;
            } else {
                const $target = $(value);
                if (!$target.length) return this;
                top = content.scrollTop
                    + ($target[0].getBoundingClientRect().top - content.getBoundingClientRect().top);
            }

            return self._scrollTo(top, smooth);
        }

        scrollTop(smooth)    { return this.scrollTo('top', smooth); }
        scrollBottom(smooth) { return this.scrollTo('bottom', smooth); }

        _scrollTo(top, smooth) {
            const content = this.$content[0];
            if (smooth && typeof content.scrollTo === 'function') {
                content.scrollTo({ top: top, behavior: 'smooth' });
            } else {
                content.scrollTop = top;
            }
            return this;
        }

        /** Toggle scrollbar rendering without tearing down the instance. */
        setEnabled(state) {
            this.options.isEnabled = !!state;
            this.update();
            return this;
        }

        destroy() {
            const self = this;

            $(window).off('resize.scroller-' + self._uid);
            $(document).off('.scroller-drag');
            clearTimeout(self._flashTimer);

            if (self.$bar)     self.$bar.off('.scroller');
            if (self.$content) self.$content.off('.scroller');

            if (self._resizeObserver)   { self._resizeObserver.disconnect();   self._resizeObserver = null; }
            if (self._mutationObserver) { self._mutationObserver.disconnect(); self._mutationObserver = null; }

            if (self.$bar) {
                self.$bar.remove();
                self.$bar = null;
            }

            // Unwrap the viewport: move its children back up to the host element
            // (preserving handlers), then drop the now-empty wrapper.
            if (self.$content) {
                self.$el.append(self.$content.contents());
                self.$content.remove();
                self.$content = null;
            }

            self.$el
                .removeClass('ts-scroller ts-scroller--has-overflow ts-scroller--always ts-scroller--scrolling ts-scroller--dragging')
                .css({ height: '' })
                .removeData(instanceName);

            return this;
        }

        /** Vertical client coordinate from a mouse, pointer or touch event. */
        _eventY(e) {
            const oe = e.originalEvent || e;
            if (oe.touches && oe.touches.length)               return oe.touches[0].clientY;
            if (oe.changedTouches && oe.changedTouches.length) return oe.changedTouches[0].clientY;
            return (typeof oe.clientY === 'number') ? oe.clientY : e.clientY;
        }
    }

    PluginScroller.defaults = {
        /** Keep the scrollbar permanently visible instead of auto-hiding. */
        alwaysVisible: false,

        /** When auto-hiding, how long (ms) the bar stays visible after scrolling. */
        flashDelay: 1200,

        /** Smallest allowed thumb height in px. */
        sliderMinHeight: 30,

        /** Largest allowed thumb height in px (null = no cap). */
        sliderMaxHeight: null,

        /** Stop wheel scrolling from bubbling to the page at the scroll boundary. */
        preventPageScrolling: false,

        /** tabindex applied to the viewport for keyboard scrolling (null to skip). */
        tabIndex: 0,

        /** Fixed wrapper height (number = px, or any CSS length string). */
        height: null,

        /** Max viewport height; wrapper grows with content up to this cap. */
        maxHeight: null,

        /** Set false to keep the instance alive but render no scrollbar. */
        isEnabled: true,

        /** Class applied to the generated scroll viewport. */
        contentClass: 'ts-scroller__content',

        /** Class applied to the generated track. */
        paneClass: 'ts-scroller__bar',

        /** Class applied to the generated thumb. */
        sliderClass: 'ts-scroller__thumb'
    };

    // expose to scope
    $.extend(themestrap, {
        PluginScroller
    });

    // jquery plugin
    $.fn.themestrapPluginScroller = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginScroller($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// Scrollable
(((themestrap = {}, $) => {
    const instanceName = '__scrollable';

    class PluginScrollable {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        static updateModals() {
            PluginScrollable.updateBootstrapModal();
        }

        static updateBootstrapModal() {
            let updateBoostrapModal;

            updateBoostrapModal = typeof $.fn.modal !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor.prototype !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor.prototype.enforceFocus !== 'undefined';

            if ( !updateBoostrapModal ) {
                return false;
            }

            const originalFocus = $.fn.modal.Constructor.prototype.enforceFocus;
            $.fn.modal.Constructor.prototype.enforceFocus = function() {
                originalFocus.apply( this );

                const $scrollable = this.$element.find('.scrollable');
                if ( $scrollable ) {
                    if ( $.isFunction($.fn['themestrapPluginScrollable'])  ) {
                        $scrollable.themestrapPluginScrollable();
                    }

                    if ( $.isFunction($.fn['nanoScroller']) ) {
                        $scrollable.nanoScroller();
                    }
                }
            };
        }

        initialize($el, opts) {
			if ( $el.data( instanceName ) ) {
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
			this.options = $.extend(true, {}, PluginScrollable.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			this.options.wrapper.nanoScroller(this.options);

			return this;
		}
    }

    PluginScrollable.defaults = {
		contentClass: 'scrollable-content',
		paneClass: 'scrollable-pane',
		sliderClass: 'scrollable-slider',
		alwaysVisible: true,
		preventPageScrolling: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginScrollable
	});

    // jquery plugin
    $.fn.themestrapPluginScrollable = function(opts) {
		return this.each(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginScrollable($this, opts);
			}

		});
	};

    $(() => {
		PluginScrollable.updateModals();
	});
})).apply(this, [window.themestrap, jQuery]);

// Section Scroll
(((themestrap = {}, $) => {
    const instanceName = '__sectionScroll';

    class PluginSectionScroll {
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
			this.options = $.extend(true, {}, PluginSectionScroll.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			const self = this, $el = this.options.wrapper;

			// Check type of header and change the target for header (by change header color purpose)
			if( $('html').hasClass('side-header-overlay-full-screen') ) {
				self.$header = $('.sticky-wrapper');
			} else {
				self.$header = $('#header');
			}

			// Turn the section full height or not depeding on the content size
			self.updateSectionsHeight();

			// Wrap all sections in a section wrapper
			$( this.options.targetClass ).wrap('<div class="section-wrapper"></div>');

			// Set the section wrapper height
	  		$('.section-wrapper').each(function(){
	  			$(this).height( $(this).find('.section-scroll').outerHeight() );
	  		});

	  		// Add active class to the first section on page load
	  		$('.section-wrapper').first().addClass('active');
			
	        let flag = false, scrollableFlag = false, touchDirection = '', touchstartY = 0, touchendY = 0;

	        $(window).on('touchstart', ({changedTouches}) => {
			    touchstartY = changedTouches[0].screenY;
			});

	        let wheelEvent = 'onwheel' in document ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	        if( $(window).width() < 992 && $('html').hasClass('touch') ) {
	        	wheelEvent = 'onwheel' in document ? 'wheel touchend' : document.onmousewheel !== undefined ? 'mousewheel touchend' : 'DOMMouseScroll touchend';
	        }

        	if( $(window).width() < 992 ) {
	    		$('html').removeClass('overflow-hidden');
			    $(window).on('scroll', () => {

		    		let index = 0;
		    		$('.section-scroll').each(function(){
		    			if( $(this).offset().top <= $(window).scrollTop() + 50 ) {
		    				const $currentSection2 = $('.section-wrapper').eq( index ).find('.section-scroll');

			            	$('.section-scroll-dots-navigation > ul > li').removeClass('active');
							$('.section-scroll-dots-navigation > ul > li').eq( index ).addClass('active');

							$(window).trigger({
								type: 'section.scroll.mobile.change.header.color',
								currentSection: $currentSection2
							});
		    			}

		    			index++;
		    		});
		    		
			    });

			    $(window).on('section.scroll.mobile.change.header.color', ({currentSection}) => {
			    	if( typeof currentSection == 'undefined' ) {
			    		return;
			    	}

			    	const $currentSection = currentSection, headerColor     = $currentSection.data('section-scroll-header-color');
								    	
			    	$('#header .header-nav').removeClass('header-nav-light-text header-nav-dark-text').addClass('header-nav-' + headerColor + '-text');
			    	$('#header .header-nav-features').removeClass('header-nav-features-dark header-nav-features-light').addClass('header-nav-features-' + headerColor);
			    	$('#header .header-social-icons').removeClass('social-icons-icon-dark social-icons-icon-light').addClass('social-icons-icon-' + headerColor);

			    	// Change Logo
			    	if( self.options.changeHeaderLogo && headerColor != undefined ) {
				    	if( headerColor == 'light' ) {
				    		$('#header .header-logo img').attr('src', self.options.headerLogoLight);
				    	} else if( headerColor == 'dark' ) {
				    		$('#header .header-logo img').attr('src', self.options.headerLogoDark);
				    	}
			    	}

			    	self.$header.css({
			    		opacity: 1
			    	});

			    });
        	}

	        $(window).on(wheelEvent, ({target, originalEvent}) => {
                if( $(window).width() < 992 ) {
	        		return;
	        	}

                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
		        	if( $(target).closest('.section-scroll-dots-navigation').get(0) || $(target).closest('.header-body').get(0) || $(target).closest('.owl-carousel').get(0) ) {
		        		return;
		        	}
		        }

                // Side Header Overlay Full Screen
                if( $('html.side-header-overlay-full-screen.side-header-hide').get(0) ) {
		        	return;
		        }

                const wheelDirection = originalEvent.wheelDelta == undefined ? originalEvent.deltaY > 0 : originalEvent.wheelDelta < 0;
                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
		        	touchendY = event.changedTouches[0].screenY;
	        		
				    if( touchendY <= touchstartY ) {
				    	touchDirection = 'up';
				    }

				    if( touchendY >= touchstartY ) {
				    	touchDirection = 'down';
				    }

				    if( touchendY == touchstartY ) {
				    	return;
				    }
	        	}

                const $currentSection = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll');
                const $nextSection = self.getNextSection(wheelDirection, touchDirection);
                let nextSectionOffsetTop;

                // If is the last section, then change the offsetTop value
                if( self.getCurrentIndex() == $('.section-wrapper').length - 1 ) {
            		nextSectionOffsetTop = $(document).height();
            	} else {
            		nextSectionOffsetTop = $nextSection.offset().top;
            	}

                if( $(window).width() < 992 && $('html').hasClass('touch') ) {
				    setTimeout(() => {
					    if( $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').hasClass('section-scroll-scrollable') ) {
					    	$('html').removeClass('overflow-hidden');
					    } else {
					    	$('html').addClass('overflow-hidden');
					    }
				    }, 1200);
				}

                // For non full height sections
                if( $currentSection.hasClass('section-scroll-scrollable') ) {
	        		if( !flag && !scrollableFlag ) {

		        		// Scroll Direction
		        		if(wheelDirection || touchDirection == 'up') {
		        			if( ( $(window).scrollTop() + $(window).height() ) >= nextSectionOffsetTop ) {
		        				flag = true;
								setTimeout(() => {
									$(window).trigger('section.scroll.change.header.color');

					            	setTimeout(() => {
										flag = false;
									}, 500);
								}, 1000);

		        				if( self.getCurrentIndex() == ( $('.section-wrapper').length - 1 )  ) {
						    		return false;
						    	}

		        				// Move to the next section
		        				self.moveTo( $currentSection.offset().top + $currentSection.outerHeight() );

		        				// Change Section Active Class
					   			self.changeSectionActiveState( $nextSection );

					   			self.$header.css({
							    	opacity: 0,
							    	transition: 'ease opacity 500ms'
							    });
					        }

			        		if( !$('html').hasClass('touch') ) {
				        		for( var i = 1; i < 100; i++ ) {
					        		$('body, html').scrollTop( $(window).scrollTop() + 1 );

					        		if( ( $(window).scrollTop() + $(window).height() ) >= nextSectionOffsetTop ) {
					        			scrollableFlag = true;
										setTimeout(() => {
											$(window).trigger('section.scroll.change.header.color');
							            	scrollableFlag = false;
										}, 500);
					        			break;
					        		}
				        		}
				        	}
					    } else {
					    	if( $(window).scrollTop() <= $currentSection.offset().top ) {
					    		flag = true;
								setTimeout(() => {
									$(window).trigger('section.scroll.change.header.color');

					            	setTimeout(() => {
										flag = false;
									}, 500);
								}, 1000);

					    		if( self.getCurrentIndex() == 0  ) {
						    		return false;
						    	}

					   			// Move to the next section
		        				self.moveTo( $currentSection.offset().top - $(window).height() );

		        				// Change Section Active Class
					   			self.changeSectionActiveState( $nextSection );

					   			self.$header.css({
							    	opacity: 0,
							    	transition: 'ease opacity 500ms'
							    });
					        }

					    	if( !$('html').hasClass('touch') ) {
				        		for( var i = 1; i < 100; i++ ) {
					        		$('body, html').scrollTop( $(window).scrollTop() - 1 );

					        		if( $(window).scrollTop() <= $currentSection.offset().top ) {
					        			scrollableFlag = true;
										setTimeout(() => {
											$(window).trigger('section.scroll.change.header.color');
							            	scrollableFlag = false;
										}, 500);
					        			break;
					        		}
				        		}
				        	}
					    }

			   			// Change Dots Active Class
				        self.changeDotsActiveState();

		        		return;

		        	}
	        	}

                // For full height sections
                if( !flag && !scrollableFlag ) {
				    if(wheelDirection || touchDirection == 'up') {
				    	if( self.getCurrentIndex() == ( $('.section-wrapper').length - 1 )  ) {
				    		return false;
				    	}

				   		// Change Section Active Class
			   			self.changeSectionActiveState( $nextSection );

				   		setTimeout(() => {
				   			// Move to the next section
	        				self.moveTo( $nextSection.offset().top );

				   		}, 150);
				    } else {
				    	if( self.getCurrentIndex() == 0  ) {
				    		return false;
				    	}

				   		// Change Section Active Class
			   			self.changeSectionActiveState( $nextSection );

				   		if( $nextSection.height() > $(window).height() ) {
				   			// Move to the next section
	        				self.moveTo( $currentSection.offset().top - $(window).height() );
				   		} else {
					        setTimeout(() => {
					   			// Move to the next section
		        				self.moveTo( $nextSection.offset().top );

					   		}, 150);
				   		}
				    }

				    // Change Dots Active Class
			        self.changeDotsActiveState();

				    self.$header.css({
				    	opacity: 0,
				    	transition: 'ease opacity 500ms'
				    });

				    // Style next section
	            	$nextSection.css({
	            		position: 'relative',
	            		opacity: 1,
	            		'z-index': 1,
	            		transform: 'translate3d(0,0,0) scale(1)'
	            	});

	            	// Style previous section
	            	$currentSection.css({
	            		position: 'fixed',
	            		width: '100%',
	            		top: 0,
	            		left: 0,
	            		opacity: 0,
	            		'z-index': 0,
	            		transform: 'translate3d(0,0,-10px) scale(0.7)',
	            		transition: 'ease transform 600ms, ease opacity 600ms',
	            	});

					setTimeout(() => {
						$currentSection.css({
		            		position: 'relative',
		            		opacity: 1,
		            		transform: 'translate3d(0,0,-10px) scale(1)'
		            	});

						$(window).trigger('section.scroll.change.header.color');

		            	setTimeout(() => {
							flag = false;
						}, 500);
					}, 1000);

					flag = true;

				}

                return;
            });

	        // Dots Navigation
	        if( this.options.dotsNav ) {
	        	self.dotsNavigation();
	        }

	        // First Load
	        setTimeout(() => {
		        if( $(window.location.hash).get(0) ) {
		        	self.moveTo( $(window.location.hash).parent().offset().top );

		        	self.changeSectionActiveState( $(window.location.hash) );

		        	// Change Dots Active Class
			        self.changeDotsActiveState();

		        	self.updateHash( true );
		        } else {
                    const hash  = window.location.hash;
                    let index = hash.replace('#','');

                    if( !hash ) {
		        		index = 1;
		        	}

                    self.moveTo( $('.section-wrapper').eq( index - 1 ).offset().top );

                    self.changeSectionActiveState( $('.section-wrapper').eq( index - 1 ).find('.section-scroll') );

                    // Change Dots Active Class
                    self.changeDotsActiveState();

                    self.updateHash( true );
                }

				$(window).trigger('section.scroll.ready');
				$(window).trigger('section.scroll.change.header.color');
			}, 500);

			return this;
		}

        updateSectionsHeight() {
			const self = this;

			$('.section-scroll').css({ height: '' });

			$('.section-scroll').each(function(){
				if( $(this).outerHeight() < ( $(window).height() + 3 ) ) {
					$(this).css({ height: '100vh' });		
				} else {
					$(this).addClass('section-scroll-scrollable');
				}
			});

			// Set the section wrapper height
	  		$('.section-wrapper').each(function(){
	  			$(this).height( $(this).find('.section-scroll').outerHeight() );
	  		});

			return this;
		}

        updateHash(first_load) {
			const self = this;

			if( !window.location.hash ) {
				window.location.hash = 1;
			} else {
				if(!first_load) {
					const $section = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll'), section_id = $section.attr('id') ? $section.attr('id') : $section.parent().index() + 1;

					window.location.hash = section_id;
				}
			}

			return this;
		}

        getCurrentIndex() {
            const self = this;
            let currentIndex = 0;

            currentIndex = $('.section-wrapper.active').index();

            return currentIndex;
        }

        moveTo($scrollTopValue, first_load) {
			const self = this;

			$('body, html').animate({
   				scrollTop: $scrollTopValue
   			}, 1000, 'easeOutQuint');

   			setTimeout(() => {
	   			self.updateHash();
   			}, 500);

			return this;
		}

        getNextSection(wheelDirection, touchDirection) {
            const self = this;
            let $nextSection = '';

            // Scroll Direction
            if(wheelDirection || touchDirection == 'up') {
				$nextSection = $('.section-wrapper').eq( self.getCurrentIndex() + 1 ).find('.section-scroll');
        	} else {
        		$nextSection = $('.section-wrapper').eq( self.getCurrentIndex() - 1 ).find('.section-scroll');
        	}

            return $nextSection;
        }

        changeSectionActiveState($nextSection) {
			const self = this;

			$('.section-wrapper').removeClass('active');
	   		$nextSection.parent().addClass('active');

			return this;
		}

        changeDotsActiveState() {
			const self = this;

			$('.section-scroll-dots-navigation > ul > li').removeClass('active');
			$('.section-scroll-dots-navigation > ul > li').eq( self.getCurrentIndex() ).addClass('active');

			return this;
		}

        dotsNavigation() {
			const self = this;

			const dotsNav = $('<div class="section-scroll-dots-navigation"><ul class="list list-unstyled"></ul></div>'), currentSectionIndex = self.getCurrentIndex();

        	if( self.options.dotsClass ) {
        		dotsNav.addClass( self.options.dotsClass );
        	}

        	for( let i = 0; i < $('.section-scroll').length; i++ ) {
        		const title = $('.section-wrapper').eq( i ).find('.section-scroll').data('section-scroll-title');

        		dotsNav.find('> ul').append( '<li'+ ( ( currentSectionIndex == i ) ? ' class="active"' : '' ) +'><a href="#'+ i +'" data-nav-id="'+ i +'"><span>'+ title +'</span></a></li>' );
        	}

        	$('.body').append( dotsNav );

        	dotsNav.find('a[data-nav-id]').on('click touchstart', function(e){
        		e.preventDefault();
        		const $this = $(this);

        		$('.section-scroll').css({
        			opacity: 0,
        			transition: 'ease opacity 300ms'
        		});

        		self.$header.css({
			    	opacity: 0,
			    	transition: 'ease opacity 500ms'
			    });

        		setTimeout(() => {
	        		self.moveTo( $('.section-wrapper').eq( $this.data('nav-id') ).offset().top )

		   			$('.section-wrapper').removeClass('active');
			   		$('.section-wrapper').eq( $this.data('nav-id') ).addClass('active');

	        		$('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').css({
	        			opacity: 1
	        		});

	        		setTimeout(() => {
		        		$('.section-scroll').css({ opacity: 1 });

		        		$(window).trigger('section.scroll.change.header.color');
	        		}, 500);

	        		if( $(window).width() > 991 ) {
		        		self.changeDotsActiveState();
	        		}
        		}, 500);
        	});

			return this;
		}

        events() {
			const self = this;

			$(window).on('section.scroll.ready', () => {
				$(window).scrollTop(0);
			});

			$(window).on('section.scroll.change.header.color', () => {
		    	const headerColor = $('.section-wrapper').eq( self.getCurrentIndex() ).find('.section-scroll').data('section-scroll-header-color');
		    	
		    	$('#header .header-nav').removeClass('header-nav-light-text header-nav-dark-text').addClass('header-nav-' + headerColor + '-text');
		    	$('#header .header-nav-features').removeClass('header-nav-features-dark header-nav-features-light').addClass('header-nav-features-' + headerColor);
		    	$('#header .header-social-icons').removeClass('social-icons-icon-dark social-icons-icon-light').addClass('social-icons-icon-' + headerColor);

		    	// Change Logo
		    	if( self.options.changeHeaderLogo && headerColor != undefined ) {
			    	if( headerColor == 'light' ) {
			    		$('#header .header-logo img').attr('src', self.options.headerLogoLight);
			    	} else if( headerColor == 'dark' ) {
			    		$('#header .header-logo img').attr('src', self.options.headerLogoDark);
			    	}
		    	}

		    	self.$header.css({
		    		opacity: 1
		    	});
		    });

			$(document).ready(() => {
			    $(window).afterResize(() => {
			    	self.updateSectionsHeight();

			    	if( $(window).width() < 992 ) {
			    		$('html').removeClass('overflow-hidden');
			    	}
			    });
			});

		    return this;
		}
    }

    PluginSectionScroll.defaults = {
		targetClass: '.section',
		dotsNav: true,
		changeHeaderLogo: true,
		headerLogoDark: 'img/logo-default-slim.png',
		headerLogoLight: 'img/logo-default-slim-dark.png'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSectionScroll
	});

    // jquery plugin
    $.fn.themestrapPluginSectionScroll = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginSectionScroll($this, opts);
			}

		});
	};
})).apply(this, [window.themestrap, jQuery]);

// Sort
(((themestrap = {}, $) => {
    const instanceName = '__sort';

    class PluginSort {
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
			this.options = $.extend(true, {}, PluginSort.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.isotope))) {
				return this;
			}

			const self = this, $source = this.options.wrapper, $destination = $('.sort-destination[data-sort-id="' + $source.attr('data-sort-id') + '"]'), $window = $(window);

			if ($destination.get(0)) {

				self.$source = $source;
				self.$destination = $destination;
				self.$loader = false;

				self.setParagraphHeight($destination);

				if (self.$destination.parents('.sort-destination-loader').get(0)) {
					self.$loader = self.$destination.parents('.sort-destination-loader');
					self.createLoader();
				}

				$destination.attr('data-filter', '*');

				$destination.one('layoutComplete', (event, laidOutItems) => {
					self.removeLoader();

					// If has data-plugin-sticky on the page we need recalculate sticky position
					if( $('[data-plugin-sticky]').length ) {
						setTimeout(() => {
							$('[data-plugin-sticky]').each(function(){
								$(this).data('__sticky').build();
								$(window).trigger('resize');
							});
						}, 500);
					}
				});

				if ( $('#' + self.options.filterFieldId).length ) {

					const $filterField = $('#' + self.options.filterFieldId);

					$filterField.keyup(function() {
						self.options.filterFieldText = $(this).val();
						self.setFilter(self.options.filter);
					});

				}

				$destination.waitForImages(() => {
					$destination.isotope(self.options);
					self.events();
				});

				setTimeout(() => {
					self.removeLoader();
				}, 3000);

			}

			return this;
		}

        events() {
            const self = this;
            let filter = null;
            const $window = $(window);

            self.$source.find('a').click(function(e) {
				e.preventDefault();

				filter = $(this).parent().data('option-value');

				self.setFilter(filter);

				if (e.originalEvent) {
					self.$source.trigger('filtered');
				}

				return this;
			});

            self.$destination.trigger('filtered');
            self.$source.trigger('filtered');

            if (self.options.useHash) {
				self.hashEvents();
			}

            $window.on('resize sort.resize', () => {
				setTimeout(() => {
					self.$destination.isotope('layout');
				}, 300);
			});

            setTimeout(() => {
				$window.trigger('sort.resize');
			}, 300);

            return this;
        }

        setFilter(filter) {
            const self = this;
            const page = false;
            let currentFilter = filter;

            self.$source.find('.active').removeClass('active');
            self.$source.find('li[data-option-value="' + filter + '"], li[data-option-value="' + filter + '"] > a').addClass('active');

            self.options.filter = currentFilter;

            if (self.$destination.attr('data-current-page')) {
				currentFilter = currentFilter + '[data-page-rel=' + self.$destination.attr('data-current-page') + ']';
			}

            if (self.options.filterFieldText != '') {
				currentFilter = currentFilter + '[data-sort-search*=' + self.options.filterFieldText.toLowerCase() + ']';
			}

            self.$destination.attr('data-filter', filter).isotope({
				filter: currentFilter
			}).one('arrangeComplete', (event, filteredItems) => {
				
				if (self.options.useHash) {
					if (window.location.hash != '' || self.options.filter.replace('.', '') != '*') {
						window.location.hash = self.options.filter.replace('.', '');
					}
				}
				
				$(window).trigger('scroll');

			}).trigger('filtered');

            return this;
        }

        hashEvents() {
            const self = this;
            let hash = null;
            let hashFilter = null;
            let initHashFilter = '.' + location.hash.replace('#', '');

            // Check if has scroll to section trough URL hash and prevent the sort plugin from show nothing
            if( $(location.hash).length ) {
				initHashFilter = '.';
			}

            if (initHashFilter != '.' && initHashFilter != '.*') {
				self.setFilter(initHashFilter);
			}

            $(window).on('hashchange', e => {

				hashFilter = '.' + location.hash.replace('#', '');
				hash = (hashFilter == '.' || hashFilter == '.*' ? '*' : hashFilter);

				self.setFilter(hash);

			});

            return this;
        }

        setParagraphHeight() {
            const self = this;
            let minParagraphHeight = 0;
            const paragraphs = $('span.thumb-info-caption p', self.$destination);

            paragraphs.each(function() {
				if ($(this).height() > minParagraphHeight) {
					minParagraphHeight = ($(this).height() + 10);
				}
			});

            paragraphs.height(minParagraphHeight);

            return this;
        }

        createLoader() {
			const self = this;

			const loaderTemplate = [
				'<div class="bounce-loader">',
					'<div class="bounce1"></div>',
					'<div class="bounce2"></div>',
					'<div class="bounce3"></div>',
				'</div>'
			].join('');

			self.$loader.append(loaderTemplate);

			return this;
		}

        removeLoader() {

			const self = this;

			if (self.$loader) {

				self.$loader.removeClass('sort-destination-loader-showing');

				setTimeout(() => {
					self.$loader.addClass('sort-destination-loader-loaded');
				}, 300);

			}

		}
    }

    PluginSort.defaults = {
		useHash: true,
		itemSelector: '.isotope-item',
		layoutMode: 'masonry',
		filter: '*',
		filterFieldId: false,
		filterFieldText: '',
		hiddenStyle: {
			opacity: 0
		},
		visibleStyle: {
			opacity: 1
		},
		stagger: 30,
		isOriginLeft: ($('html').attr('dir') == 'rtl' ? false : true)
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSort
	});

    // jquery plugin
    $.fn.themestrapPluginSort = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginSort($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Sticky
(((themestrap = {}, $) => {
    const instanceName = '__sticky';

    class PluginSticky {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ( $el.data( instanceName ) ) {
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
			this.options = $.extend(true, {}, PluginSticky.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.pin))) {
				return this;
			}

			const self = this, $window = $(window);
			
			self.options.wrapper.pin(self.options);

			if( self.options.wrapper.hasClass('sticky-wrapper-transparent') ) {
				self.options.wrapper.parent().addClass('position-absolute w-100');
			}

			$window.afterResize(() => {
				self.options.wrapper.removeAttr('style').removeData('pin');
				self.options.wrapper.pin(self.options);
				$window.trigger('scroll');
			});

			// Change Logo Src
			if( self.options.wrapper.find('img').attr('data-change-src') ) {
				const $logo = self.options.wrapper.find('img'), logoSrc = $logo.attr('src'), logoNewSrc = $logo.attr('data-change-src');

				self.changeLogoSrc = activate => {
					if(activate) {
						$logo.attr('src', logoNewSrc);
					} else {
						$logo.attr('src', logoSrc);
					}
				}
			}
			
			return this;
		}

        events() {
            const self = this;
            const $window = $(window);
            const $logo = self.options.wrapper.find('img');
			const classToCheck = ( self.options.wrapper.hasClass('sticky-wrapper-effect-1') ) ? 'sticky-effect-active' : 'sticky-active';
            let stickyActivateFlag = true;
            let stickyDeactivateFlag = false;

            $window.on('scroll sticky.effect.active', () => {
				if( self.options.wrapper.hasClass( classToCheck ) ) {		
					if( stickyActivateFlag ) {			
						if( $logo.attr('data-change-src') ) {
							self.changeLogoSrc(true);
						}

						stickyActivateFlag = false;
						stickyDeactivateFlag = true;
					}
				} else {	
					if( stickyDeactivateFlag ) {				
						if( $logo.attr('data-change-src') ) {
							self.changeLogoSrc(false);
						}

						stickyDeactivateFlag = false;
						stickyActivateFlag = true;
					}
				}
			});

            let isGoingUp = false;
            if( self.options.stickyStartEffectAt ) {

				// First Load
				if( self.options.stickyStartEffectAt < $window.scrollTop() ) {
					self.options.wrapper.addClass('sticky-effect-active');

					$window.trigger('sticky.effect.active');
				}

				$window.on('scroll', () => {
					if( self.options.stickyStartEffectAt < $window.scrollTop() ) {	
						self.options.wrapper.addClass('sticky-effect-active');
						isGoingUp = true;

						$window.trigger('sticky.effect.active');
					} else {	
						if( isGoingUp ) {
							self.options.wrapper.find('.sticky-body').addClass('position-fixed');
							isGoingUp = false;
						}

						if( $window.scrollTop() == 0 ) {
							self.options.wrapper.find('.sticky-body').removeClass('position-fixed');
						}

						self.options.wrapper.removeClass('sticky-effect-active');
					}
				});
			}

            // Refresh Sticky Plugin if click in a data-toggle="collapse"
            if( $('[data-bs-toggle="collapse"]').get(0) ) {

				$('[data-bs-toggle="collapse"]').on('click', () => {
					setTimeout(() => {
						self.build();
						$(window).trigger('scroll');
					}, 1000);
				});

			}

			// Visibility Issue
			document.addEventListener('visibilitychange', () => {
				$(window).trigger('resize');
			});

			setInterval(() => {
				$(window).trigger('resize');
			}, 1000);

        }
    }

    PluginSticky.defaults = {
		minWidth: 991,
		activeClass: 'sticky-active'
	};

    // expose to scope
    $.extend(themestrap, {
		PluginSticky
	});

    // jquery plugin
    $.fn.themestrapPluginSticky = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginSticky($this, opts);
			}
			
		});
	}
})).apply(this, [ window.themestrap, jQuery ]);

// Toggle
(((themestrap = {}, $) => {
    const instanceName = '__toggle';

    class PluginToggle {
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
			this.options = $.extend(true, {}, PluginToggle.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
            const self = this;
            const $wrapper = this.options.wrapper;
            const $items = $wrapper.find('> .toggle');
            let $el = null;

            $items.each(function() {
				$el = $(this);

				if ($el.hasClass('active')) {
					$el.find('> p').addClass('preview-active');
					$el.find('> .toggle-content').slideDown(self.options.duration);
				}

				self.events($el);
			});

            if (self.options.isAccordion) {
				self.options.duration = self.options.duration / 2;
			}

            return this;
        }

        events($el) {
            const self = this;
            let previewParCurrentHeight = 0;
            let previewParAnimateHeight = 0;
            let toggleContent = null;

            $el.find('> label, > .toggle-title').click(function({originalEvent}) {
                const $this = $(this);
                const parentSection = $this.parent();
                const parentWrapper = $this.parents('.toggle');
                let previewPar = null;
                let closeElement = null;

                if (self.options.isAccordion && typeof(originalEvent) != 'undefined') {
					closeElement = parentWrapper.find('.toggle.active > label, .toggle.active > .toggle-title');

					if (closeElement[0] == $this[0]) {
						return;
					}
				}

                parentSection.toggleClass('active');

                // Preview Paragraph
                if (parentSection.find('> p').get(0)) {

					previewPar = parentSection.find('> p');
					previewParCurrentHeight = previewPar.css('height');
					previewPar.css('height', 'auto');
					previewParAnimateHeight = previewPar.css('height');
					previewPar.css('height', previewParCurrentHeight);

				}

                // Content
                toggleContent = parentSection.find('> .toggle-content');

                if (parentSection.hasClass('active')) {

					$(previewPar).animate({
						height: previewParAnimateHeight
					}, self.options.duration, function() {
						$(this).addClass('preview-active');
					});

					toggleContent.slideDown(self.options.duration, () => {
						if (closeElement) {
							closeElement.trigger('click');
						}
					});

				} else {

					$(previewPar).animate({
						height: 0
					}, self.options.duration, function() {
						$(this).removeClass('preview-active');
					});

					toggleContent.slideUp(self.options.duration);

				}
            });
        }
    }

    PluginToggle.defaults = {
		duration: 350,
		isAccordion: false
	};

    // expose to scope
    $.extend(themestrap, {
		PluginToggle
	});

    // jquery plugin
    $.fn.themestrapPluginToggle = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginToggle($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);

// Validation
(((themestrap = {}, $) => {
    $.extend(themestrap, {

		PluginValidation: {

			defaults: {
				formClass: 'needs-validation',
				validator: {
					highlight(element) {
						$(element)
							.addClass('is-invalid')
							.removeClass('is-valid')
							.parent()
							.removeClass('has-success')
							.addClass('has-danger');
					},
					success(label, element) {
						$(element)
							.removeClass('is-invalid')
							.addClass('is-valid')
							.parent()
							.removeClass('has-danger')
							.addClass('has-success')
							.find('label.error')
							.remove();
					},
					errorPlacement(error, element) {
						if (element.attr('type') == 'radio' || element.attr('type') == 'checkbox') {
							error.appendTo(element.parent().parent());
						} else {
							error.insertAfter(element);
						}
					}
				}
			},

			initialize(opts) {
				initialized = true;

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts);

				return this;
			},

			build() {
				const self = this;

				if (!($.isFunction($.validator))) {
					return this;
				}

				self.setMessageGroups();

				$.validator.setDefaults(self.options.validator);

				$('.' + self.options.formClass).validate();

				return this;
			},

			setMessageGroups() {

				$('.checkbox-group[data-msg-required], .radio-group[data-msg-required]').each(function() {
					const message = $(this).data('msg-required');
					$(this).find('input').attr('data-msg-required', message);
				});

			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

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

// Account
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Account: {

			defaults: {
				wrapper: $('#headerAccount')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			events() {
				const self = this;

				$(window).on('load', () => {
					$(document).ready(() => {
						setTimeout(() => {

							self.$wrapper.find('input').on('focus', () => {
								self.$wrapper.addClass('open');

								$(document).mouseup(({target}) => {
									if (!self.$wrapper.is(target) && self.$wrapper.has(target).length === 0) {
										self.$wrapper.removeClass('open');
									}
								});
							});

						}, 1500);
					});
				});

				$('#headerSignUp').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signup').removeClass('signin').removeClass('recover');
					self.$wrapper.find('.signup-form input:first').focus();
				});

				$('#headerSignIn').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signin').removeClass('signup').removeClass('recover');
					self.$wrapper.find('.signin-form input:first').focus();
				});

				$('#headerRecover').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('recover').removeClass('signup').removeClass('signin');
					self.$wrapper.find('.recover-form input:first').focus();
				});

				$('#headerRecoverCancel').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signin').removeClass('signup').removeClass('recover');
					self.$wrapper.find('.signin-form input:first').focus();
				});
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

// Nav
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Nav: {

			defaults: {
				wrapper: $('#mainNav'),
				scrollDelay: 600,
				scrollAnimation: 'easeOutQuad'
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.build()
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			build() {
                const self = this;
                const $html = $('html');
                const $header = $('#header');
                const $headerNavMain = $('#header .header-nav-main');
                let thumbInfoPreview;

                // Preview Thumbs
                if( self.$wrapper.find('a[data-thumb-preview]').length ) {
					self.$wrapper.find('a[data-thumb-preview]').each(function() {
						thumbInfoPreview = $('<span />').addClass('thumb-info thumb-info-preview')
												.append($('<span />').addClass('thumb-info-wrapper')
													.append($('<span />').addClass('thumb-info-image').css('background-image', 'url(' + $(this).data('thumb-preview') + ')')
											   )
										   );

						$(this).append(thumbInfoPreview);
					});
				}

                // Side Header / Side Header hamburguer Sidebar (Reverse Dropdown)
                if($html.hasClass('side-header') || $html.hasClass('side-header-hamburguer-sidebar')) {
					
					// Side Header Right / Side Header hamburguer Sidebar Right
					if($html.hasClass('side-header-right') || $html.hasClass('side-header-hamburguer-sidebar-right')) {
						if(!$html.hasClass('side-header-right-no-reverse')) {
							$header.find('.dropdown-submenu').addClass('dropdown-reverse');
						}
					}

				} else {
					
					// Reverse
					let checkReverseFlag = false;
					self.checkReverse = () => {
						if( !checkReverseFlag ) {
							self.$wrapper.find('.dropdown, .dropdown-submenu').removeClass('dropdown-reverse');

							self.$wrapper.find('.dropdown:not(.manual):not(.dropdown-mega), .dropdown-submenu:not(.manual)').each(function() {
								if(!$(this).find('.dropdown-menu').visible( false, true, 'horizontal' )  ) {
									$(this).addClass('dropdown-reverse');
								}
							});

							checkReverseFlag = true;
						}
					}

					$(window).on('resize', () => {
						checkReverseFlag = false;
					});

					$header.on('mouseover', () => {
						self.checkReverse();
					});

				}

                // Clone Items
                if($headerNavMain.hasClass('header-nav-main-clone-items')) {

			    	$headerNavMain.find('nav > ul > li > a').each(function(){
				    	const parent = $(this).parent(), clone  = $(this).clone(), clone2 = $(this).clone(), wrapper = $('<span class="wrapper-items-cloned"></span>');

				    	// Config Classes
				    	$(this).addClass('item-original');
				    	clone2.addClass('item-two');

				    	// Insert on DOM
				    	parent.prepend(wrapper);
				    	wrapper.append(clone).append(clone2);
				    });

				}

                // Floating
                if($('#header.header-floating-icons').length && $(window).width() > 991) {

					const menuFloatingAnim = {
						$menuFloating: $('#header.header-floating-icons .header-container > .header-row'),

						build() {
							const self = this;

							self.init();
						},
						init() {
                            const self  = this;
                            let divisor = 0;

                            $(window).scroll(function() {
							    const scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height()), st = $(this).scrollTop();

								divisor = $(document).height() / $(window).height();

							    self.$menuFloating.find('.header-column > .header-row').css({
							    	transform : 'translateY( calc('+ scrollPercent +'vh - '+ st / divisor +'px) )' 
							    });
							});
                        }
					};

					menuFloatingAnim.build();

				}

                // Slide
                if($('.header-nav-links-vertical-slide').length) {
					const slideNavigation = {
						$mainNav: $('#mainNav'),
						$mainNavItem: $('#mainNav li'),

						build() {
							const self = this;

							self.menuNav();
						},
						menuNav() {
							const self = this;

							self.$mainNavItem.on('click', function(e){
								const currentMenuItem 	= $(this),
								    currentMenu 		= $(this).parent(), 
								    nextMenu        	= $(this).find('ul').first(), 
								    prevMenu        	= $(this).closest('.next-menu'), 
								    isSubMenu       	= currentMenuItem.hasClass('dropdown') || currentMenuItem.hasClass('dropdown-submenu'), 
								    isBack          	= currentMenuItem.hasClass('back-button'), 
								    nextMenuHeightDiff  = ( ( nextMenu.find('> li').length * nextMenu.find('> li').outerHeight() ) - nextMenu.outerHeight() ), 
								    prevMenuHeightDiff  = ( ( prevMenu.find('> li').length * prevMenu.find('> li').outerHeight() ) - prevMenu.outerHeight() );

								if( isSubMenu ) {
									currentMenu.addClass('next-menu');
									nextMenu.addClass('visible');
									currentMenu.css({
										overflow: 'visible',
										'overflow-y': 'visible'
									});
									
									if( nextMenuHeightDiff > 0 ) {
										nextMenu.css({
											overflow: 'hidden',
											'overflow-y': 'scroll'
										});
									}

									for( i = 0; i < nextMenu.find('> li').length; i++ ) {
										if( nextMenu.outerHeight() < ($('.header-row-side-header').outerHeight() - 100) ) {
											nextMenu.css({
												height: nextMenu.outerHeight() + nextMenu.find('> li').outerHeight()
											});
										}
									}

									nextMenu.css({
										'padding-top': nextMenuHeightDiff + 'px'
									});
								}

								if( isBack ) {
									currentMenu.parent().parent().removeClass('next-menu');
									currentMenu.removeClass('visible');

									if( prevMenuHeightDiff > 0 ) {
										prevMenu.css({
											overflow: 'hidden',
											'overflow-y': 'scroll'
										});
									}
								}

								e.stopPropagation();
							});
						}
					};

					$(window).trigger('resize');
					
					if( $(window).width() > 991 ) {
						slideNavigation.build();
					}

					$(document).ready(() => {
						$(window).afterResize(() => {
							if( $(window).width() > 991 ) {
								slideNavigation.build();
							}
						});
					});
				}

                // Header Nav Main Mobile Dark
                if($('.header-nav-main-mobile-dark').length) {
					$('#header:not(.header-transparent-dark-bottom-border):not(.header-transparent-light-bottom-border)').addClass('header-no-border-bottom');
				}

                // Keyboard Navigation / Accessibility
                if( $(window).width() > 991 ) {
					let focusFlag = false;
					$header.find('.header-nav-main nav > ul > li > a').on('focus', function(){
						
						if( $(window).width() > 991 ) {
							if( !focusFlag ) {
								focusFlag = true;
								$(this).trigger('blur');
								
								self.focusMenuWithChildren();
							}
						}

					});
				}

                return this;
            },

			focusMenuWithChildren() {
                // Get all the link elements within the primary menu.
                let links;

                let i;
                let len;
                const menu = document.querySelector( 'html:not(.side-header):not(.side-header-hamburguer-sidebar):not(.side-header-overlay-full-screen) .header-nav-main > nav' );

                if ( ! menu ) {
					return false;
				}

                links = menu.getElementsByTagName( 'a' );

                // Each time a menu link is focused or blurred, toggle focus.
                for ( i = 0, len = links.length; i < len; i++ ) {
					links[i].addEventListener( 'focus', toggleFocus, true );
					links[i].addEventListener( 'blur', toggleFocus, true );
				}

                //Sets or removes the .focus class on an element.
                function toggleFocus() {
					let self = this;

					// Move up through the ancestors of the current link until we hit .primary-menu.
					while ( !self.className.includes('header-nav-main') ) {
						// On li elements toggle the class .focus.
						if ( 'li' === self.tagName.toLowerCase() ) {
							if ( self.className.includes('accessibility-open') ) {
								self.className = self.className.replace( ' accessibility-open', '' );
							} else {
								self.className += ' accessibility-open';
							}
						}
						self = self.parentElement;
					}
				}
            },

			events() {
                const self    = this;
                const $html   = $('html');
                let $header = $('#header');
                const $window = $(window);
                let headerBodyHeight = $('.header-body').outerHeight();

                if( $header.hasClass('header') ) {
					$header = $('.header');
				}

                $header.find('a[href="#"]').on('click', e => {
					e.preventDefault();
				});

                // Mobile Arrows
                if( $html.hasClass('side-header-hamburguer-sidebar') ) {
					$header.find('.dropdown-toggle, .dropdown-submenu > a')
						.append('<i class="fas fa-chevron-down fa-chevron-right"></i>');
				} else {
					$header.find('.dropdown-toggle, .dropdown-submenu > a')
						.append('<i class="fas fa-chevron-down"></i>');
				}

                $header.find('.dropdown-toggle[href="#"], .dropdown-submenu a[href="#"], .dropdown-toggle[href!="#"] .fa-chevron-down, .dropdown-submenu a[href!="#"] .fa-chevron-down').on('click', function(e) {
					e.preventDefault();
					if ($window.width() < 992) {
						$(this).closest('li').toggleClass('open');

						// Adjust Header Body Height
						const height = ( $header.hasClass('header-effect-shrink') && $html.hasClass('sticky-header-active') ) ? themestrap.StickyHeader.options.stickyHeaderContainerHeight : headerBodyHeight;
						$('.header-body').animate({
					 		height: ($('.header-nav-main nav').outerHeight(true) + height) + 10
					 	}, 0);
					}
				});

                $header.find('li a.active').addClass('current-page-active');

                // Add Open Class
                $header.find('.header-nav-click-to-open .dropdown-toggle[href="#"], .header-nav-click-to-open .dropdown-submenu a[href="#"], .header-nav-click-to-open .dropdown-toggle > i').on('click', function(e) {
					if( !$('html').hasClass('side-header-hamburguer-sidebar') && $window.width() > 991 ) {
						e.preventDefault();
						e.stopPropagation();
					}

					if ($window.width() > 991) {
						e.preventDefault();
						e.stopPropagation();

						$header.find('li a.active').removeClass('active');

						if( $(this).prop('tagName') == 'I' ) {
							$(this).parent().addClass('active');
						} else {
							$(this).addClass('active');
						}

						if (!$(this).closest('li').hasClass('open')) {
                            const $li = $(this).closest('li');
                            let isSub = false;

                            if( $(this).prop('tagName') == 'I' ) {
								$('#header .dropdown.open').removeClass('open');
								$('#header .dropdown-menu .dropdown-submenu.open').removeClass('open');
							}

                            if ( $(this).parent().hasClass('dropdown-submenu') ) {
								isSub = true;
							}

                            $(this).closest('.dropdown-menu').find('.dropdown-submenu.open').removeClass('open');
                            $(this).parent('.dropdown').parent().find('.dropdown.open').removeClass('open');

                            if (!isSub) {
								$(this).parent().find('.dropdown-submenu.open').removeClass('open');
							}

                            $li.addClass('open');

                            $(document).off('click.nav-click-to-open').on('click.nav-click-to-open', ({target}) => {
								if (!$li.is(target) && $li.has(target).length === 0) {
									$li.removeClass('open');
									$li.parents('.open').removeClass('open');
									$header.find('li a.active').removeClass('active');
									$header.find('li a.current-page-active').addClass('active');
								}
							});
                        } else {
							$(this).closest('li').removeClass('open');
							$header.find('li a.active').removeClass('active');
							$header.find('li a.current-page-active').addClass('active');
						}

						$window.trigger({
							type: 'resize',
							from: 'header-nav-click-to-open'
						});
					}
				});

                // Collapse Nav
                $header.find('[data-collapse-nav]').on('click', function(e) {
					$(this).parents('.collapse').removeClass('show');
				});

                // Top Features
                $header.find('.header-nav-features-toggle').on('click', function(e) {
					e.preventDefault();

					const $toggleParent = $(this).parent();

					if (!$(this).siblings('.header-nav-features-dropdown').hasClass('show')) {

						const $dropdown = $(this).siblings('.header-nav-features-dropdown');

						$('.header-nav-features-dropdown.show').removeClass('show');

						$dropdown.addClass('show');

						$(document).off('click.header-nav-features-toggle').on('click.header-nav-features-toggle', ({target}) => {
							if (!$toggleParent.is(target) && $toggleParent.has(target).length === 0) {
								$('.header-nav-features-dropdown.show').removeClass('show');
							}
						});

						if ($(this).attr('data-focus')) {
							$('#' + $(this).attr('data-focus')).focus();
						}

					} else {
						$(this).siblings('.header-nav-features-dropdown').removeClass('show');
					}
				});

                // hamburguer Menu
                const $hamburguerMenuBtn = $('.hamburguer-btn:not(.side-panel-toggle)'), $hamburguerSideHeader = $('#header.side-header, #header.side-header-overlay-full-screen');

                $hamburguerMenuBtn.on('click', function(){
					if($(this).attr('data-set-active') != 'false') {
						$(this).toggleClass('active');
					}
					$hamburguerSideHeader.toggleClass('side-header-hide');
					$html.toggleClass('side-header-hide');

					$window.trigger('resize');
				});

                // Toggle Side Header
                $('.toggle-side-header').on('click', () => {
					$('.hamburguer-btn-side-header.active').trigger('click');
				});

                $('.hamburguer-close:not(.side-panel-toggle)').on('click', () => {
					$('.hamburguer-btn:not(.hamburguer-btn-side-header-mobile-show)').trigger('click');
				});
				
                // Close Side Header when clicking off the menu / behind it
                $(document).on('click.closeSideHeader', function(e) {
                    const $btn = $('.hamburguer-btn:not(.side-panel-toggle).active');
                    if( !$btn.length ) return;                                   // menu isn't open
                    if( $(e.target).closest('#header').length ) return;          // clicked inside the panel
                    if( $(e.target).closest('.hamburguer-btn, .hamburguer-open, .toggle-side-header').length ) return; // clicked a control
                    $btn.trigger('click');                                       // same toggle as pressing close
                });

                // Set Header Body Height when open mobile menu
                $('.header-nav-main nav').on('show.bs.collapse', function () {
				 	$(this).removeClass('closed');

				 	// Add Mobile Menu Opened Class
				 	$('html').addClass('mobile-menu-opened');

			 		$('.header-body').animate({
				 		height: ($('.header-body').outerHeight() + $('.header-nav-main nav').outerHeight(true)) + 10
				 	});

				 	// Header Below Slider / Header Bottom Slider - Scroll to menu position
				 	if( $('#header').is('.header-bottom-slider, .header-below-slider') && !$('html').hasClass('sticky-header-active') ) {
				 		self.scrollToTarget( $('#header'), 0 );
				 	}
				});

                // Set Header Body Height when collapse mobile menu
                $('.header-nav-main nav').on('hide.bs.collapse', function () {
				 	$(this).addClass('closed');

				 	// Remove Mobile Menu Opened Class
				 	$('html').removeClass('mobile-menu-opened');

			 		$('.header-body').animate({
				 		height: ($('.header-body').outerHeight() - $('.header-nav-main nav').outerHeight(true))
				 	}, function(){
				 		$(this).height('auto');
				 	});
				});

                // Header Effect Shrink - Adjust header body height on mobile
                $window.on('stickyHeader.activate', () => {
					if( $window.width() < 992 && $header.hasClass('header-effect-shrink') ) {
						if( $('.header-btn-collapse-nav').attr('aria-expanded') == 'true' ) {
							$('.header-body').animate({
						 		height: ( $('.header-nav-main nav').outerHeight(true) + themestrap.StickyHeader.options.stickyHeaderContainerHeight ) + ( ($('.header-nav-bar').length) ? $('.header-nav-bar').outerHeight() : 0 ) 
						 	});
						}
					}
				});

                $window.on('stickyHeader.deactivate', () => {
					if( $window.width() < 992 && $header.hasClass('header-effect-shrink') ) {
						if( $('.header-btn-collapse-nav').attr('aria-expanded') == 'true' ) {
							$('.header-body').animate({
						 		height: headerBodyHeight + $('.header-nav-main nav').outerHeight(true) + 10
						 	});
						}
					}
				});

                // Remove Open Class on Resize		
                $window.on('resize.removeOpen', ({from}) => {
					if( from == 'header-nav-click-to-open' ) {
						return;
					}
					
					setTimeout(() => {
						if( $window.width() > 991 ) {
							$header.find('.dropdown.open').removeClass('open');
						}
					}, 100);
				});

                // Side Header - Change value of initial header body height
                $(document).ready(() => {
					if( $window.width() > 991 ) {
						let flag = false;
						
						$window.on('resize', ({from}) => {
							if( from == 'header-nav-click-to-open' ) {
								return;
							}

							$header.find('.dropdown.open').removeClass('open');

							if( $window.width() < 992 && flag == false ) {
								headerBodyHeight = $('.header-body').outerHeight();
								flag = true;

								setTimeout(() => {
									flag = false;
								}, 500);
							}
						});
					}
				});

                // Side Header - Set header height on mobile
                if( $html.hasClass('side-header') ) {
					if( $window.width() < 992 ) {
						$header.css({
							height: $('.header-body .header-container').outerHeight() + (parseInt( $('.header-body').css('border-top-width') ) + parseInt( $('.header-body').css('border-bottom-width') ))
						});
					}

					$(document).ready(() => {
						$window.afterResize(() => {
							if( $window.width() < 992 ) {
								$header.css({
									height: $('.header-body .header-container').outerHeight() + (parseInt( $('.header-body').css('border-top-width') ) + parseInt( $('.header-body').css('border-bottom-width') ))
								});
							} else {
								$header.css({
									height: ''
								});
							}
						});
					});
				}

                // Anchors Position
                if( $('[data-hash]').length ) {
					$('[data-hash]').on('mouseover', function(){
						const $this = $(this);

						if( !$this.data('__dataHashBinded') ) {
                            let target = $this.attr('href');
                            let offset = ($this.is("[data-hash-offset]") ? $this.data('hash-offset') : 0);
                            const delay  = ($this.is("[data-hash-delay]") ? $this.data('hash-delay') : 0);
                            const force  = ($this.is("[data-hash-force]") ? true : false);
                            const windowWidth = $(window).width();

                            // Hash Offset SM
                            if ($this.is("[data-hash-offset-sm]") && windowWidth > 576) {
								offset = $this.data('hash-offset-sm');
							}

                            // Hash Offset MD
                            if ($this.is("[data-hash-offset-md]") && windowWidth > 768) {
								offset = $this.data('hash-offset-md');
							}

                            // Hash Offset LG
                            if ($this.is("[data-hash-offset-lg]") && windowWidth > 992) {
								offset = $this.data('hash-offset-lg');
							}

                            // Hash Offset XL
                            if ($this.is("[data-hash-offset-xl]") && windowWidth > 1200) {
								offset = $this.data('hash-offset-xl');
							}

                            // Hash Offset XXL
                            if ($this.is("[data-hash-offset-xxl]") && windowWidth > 1400) {
								offset = $this.data('hash-offset-xxl');
							}

                            if( !$(target).length ) {
								target = target.split('#');
								target = '#'+target[1];
							}

                            if( target.includes('#') && $(target).length) {
								$this.on('click', e => {
									e.preventDefault();

									if( !$(e.target).is('i') || force ) {

										setTimeout(() => {

											// Close Collapse if open
											$this.parents('.collapse.show').collapse('hide');

											// Close Side Header
											$hamburguerSideHeader.addClass('side-header-hide');
											$html.addClass('side-header-hide');
											
											$window.trigger('resize');

											self.scrollToTarget(target, offset);

											// Data Hash Trigger Click
											if( $this.data('hash-trigger-click') ) {

												const $clickTarget = $( $this.data('hash-trigger-click') ),
												    clickDelay = $this.data('hash-trigger-click-delay') ? $this.data('hash-trigger-click-delay') : 0;

												if( $clickTarget.length ) {

													setTimeout(() => {
														// If is a "Tabs" plugin link
														if( $clickTarget.closest('.nav-tabs').length ) {
															new bootstrap.Tab( $clickTarget[0] ).show();
														} else {
															$clickTarget.trigger('click');
														}
														
													}, clickDelay);
												}

											}

										}, delay);
										
									}

									return;
								});
							}

                            $(this).data('__dataHashBinded', true);
                        }
					});
				}

                // Floating
                if($('#header.header-floating-icons').length) {

					$('#header.header-floating-icons [data-hash]').off().each(function() {

						const target = $(this).attr('href'), 
						    offset = ($(this).is("[data-hash-offset]") ? $(this).data('hash-offset') : 0);

						if($(target).length) {
							$(this).on('click', e => {
								e.preventDefault();

									$('html, body').animate({
										scrollTop: $(target).offset().top - offset
									}, 600, 'easeOutQuad', () => {

									});

								return;
							});
						}

					});

				}

                // Side Panel Toggle
                if( $('.side-panel-toggle').length ) {
					const init_html_class = $('html').attr('class');

					$('.side-panel-toggle').on('click', function(e){
						const extra_class = $(this).data('extra-class'), 
						    delay       = ( extra_class ) ? 100 : 0, 
						    isActive    = $(this).data('is-active') ? $(this).data('is-active') : false;

						e.preventDefault();

						if( isActive ) {
							$('html').removeClass('side-panel-open');
							$(this).data('is-active', false);
							return false;
						}

						if( extra_class ) {
							$('.side-panel-wrapper').css('transition','none');
							$('html')
								.removeClass()
								.addClass( init_html_class )
								.addClass( extra_class );
						}
						setTimeout(() => {
							$('.side-panel-wrapper').css('transition','');
							$('html').toggleClass('side-panel-open');
						}, delay);

						$(this).data('is-active', true);						
					});

					$(document).on('click', ({target}) => {
						if( !$(target).closest('.side-panel-wrapper').length && !$(target).hasClass('side-panel-toggle') ) {
							$('.hamburguer-btn.side-panel-toggle:not(.side-panel-close)').removeClass('active');
							$('html').removeClass('side-panel-open');
							$('.side-panel-toggle').data('is-active', false);
						}
					});
				}

				// OffCanvas
				self.offCanvasMenu();

                return this;
            },

			scrollToTarget(target, offset) {
				const self = this, targetPosition = $(target).offset().top;

				$('body').addClass('scrolling');

				$('html, body').animate({
					scrollTop: $(target).offset().top - offset
				}, self.options.scrollDelay, self.options.scrollAnimation, () => {
					$('body').removeClass('scrolling');

					// If by some reason the scroll finishes in a wrong position, this code will run the scrollToTarget() again until get the correct position
					// We need do it just one time to prevent infinite recursive loop at scrollToTarget() function
					if( $(target).offset().top !=  targetPosition) {
						$('html, body').animate({
							scrollTop: $(target).offset().top - offset
						}, 1, self.options.scrollAnimation, () => {});
					}
				});

				return this;

			},

			offCanvasMenu() {
                const $headerNavMain = $('#header .header-nav-main');
				const $offCanvasNav = $('.offcanvas-nav');

				if($offCanvasNav.length > 0) {
					const $navToClone = $headerNavMain.find('nav');

					if($navToClone.length > 0) {
						$offCanvasNav.html($offCanvasNav.html() + $navToClone.html());
						$offCanvasNav.find('#mainNav').removeAttr('id').removeClass().addClass('nav flex-column w-100');

						// Clean Classes
						$offCanvasNav.find('.dropdown').removeClass().addClass('dropdown');

						$offCanvasNav.find('.dropdown-item:not(.dropdown-toggle)').removeClass().addClass('dropdown-item');
						$offCanvasNav.find('.dropdown-item.dropdown-toggle').removeClass().addClass('dropdown-item dropdown-toggle');

						$offCanvasNav.find('.nav-link:not(.dropdown-toggle)').removeClass().addClass('nav-link');
						$offCanvasNav.find('.nav-link.dropdown-toggle').removeClass().addClass('nav-link dropdown-toggle');

						$offCanvasNav.find('.dropdown-menu').removeClass().addClass('dropdown-menu');

						// Dropdowns
						$offCanvasNav.find('.dropdown-toggle').each(function() {
							const $el = $(this);
							const $arrow = $el.find('i');

							$arrow.on('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								$el.parents('li').toggleClass('open');
							})

							if ($el.attr('href') == '#') {
								$el.on('click', function() {
									$arrow.trigger('click');
								});
							}
						});
					}
				}

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

// Newsletter
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Newsletter: {

			defaults: {
				wrapper: $('#newsletterForm')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			build() {
				if (!($.isFunction($.fn.validate))) {
					return this;
				}

				const self = this, $email = self.$wrapper.find('#newsletterEmail'), $success = $('#newsletterSuccess'), $error = $('#newsletterError');

				self.$wrapper.validate({
					submitHandler(form) {

						$.ajax({
							type: 'POST',
							url: self.$wrapper.attr('action'),
							data: {
								'email': $email.val()
							},
							dataType: 'json',
							success({response, message}) {
								if (response == 'success') {

									$success.removeClass('d-none');
									$error.addClass('d-none');

									$email
										.val('')
										.blur()
										.closest('.control-group')
										.removeClass('success')
										.removeClass('error');

								} else {

									$error.html(message);
									$error.removeClass('d-none');
									$success.addClass('d-none');

									$email
										.blur()
										.closest('.control-group')
										.removeClass('success')
										.addClass('error');

								}
							}
						});

					},
					rules: {
						newsletterEmail: {
							required: true,
							email: true
						}
					},
					errorPlacement(error, element) {

					}
				});

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

// Search
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Search: {

			defaults: {
				wrapper: $('#searchForm')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			build() {
				if (!($.isFunction($.fn.validate))) {
					return this;
				}

				this.$wrapper.validate({
					errorPlacement(error, element) {}
				});

				// Search Reveal
				themestrap.fn.execOnceThroughEvent( '#header', 'mouseover.search.reveal', () => {
					$('.header-nav-features-search-reveal').each(function() {
						const $el = $(this), $header = $('#header'), $html = $('html');

						$el.find('.header-nav-features-search-show-icon').on('click', () => {
							$el.addClass('show');
							$header.addClass('search-show');
							$html.addClass('search-show');
							$('#headerSearch').focus();
						});

						$el.find('.header-nav-features-search-hide-icon').on('click', () => {
							$el.removeClass('show');
							$header.removeClass('search-show');
							$html.removeClass('search-show');
						});
					});
				} );

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

// Sticky Header
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		StickyHeader: {

			defaults: {
				wrapper: $('#header'),
				headerBody: $('#header .header-body'),
				stickyEnabled: true,
				stickyEnableOnBoxed: true,
				stickyEnableOnMobile: false,
				stickyStartAt: 0,
				stickyStartAtElement: false,
				stickySetTop: 0,
				stickyEffect: '',
				stickyHeaderContainerHeight: false,
				stickyChangeLogo: false,
				stickyChangeLogoWrapper: true,
				stickyForce: false,
				stickyScrollUp: false,
				stickyScrollValue: 0
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}				

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				if( this.$wrapper.hasClass('header') ) {
					this.$wrapper = $('.header[data-plugin-options]');
				}

				this
					.setOptions(opts)
					.build()
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));
				return this;
			},

			build() {
                if( $(window).width() < 992 && this.options.stickyEnableOnMobile == false ) {
					$('html').addClass('sticky-header-mobile-disabled');
					return this;
				}

                if (!this.options.stickyEnableOnBoxed && $('html').hasClass('boxed') || $('html').hasClass('side-header-hamburguer-sidebar') && !this.options.stickyForce || !this.options.stickyEnabled) {
					return this;
				}

                const self = this;

                if( self.options.wrapper.hasClass('header') ) {
					self.options.wrapper = $('.header');
					self.options.headerBody = $('.header .header-body');
				}

                const $html = $('html');
                const $window = $(window);
                const sideHeader = $html.hasClass('side-header');
                const initialHeaderTopHeight = self.options.wrapper.find('.header-top').outerHeight();
                const initialHeaderContainerHeight = self.options.wrapper.find('.header-container').outerHeight();
                let minHeight;

                // HTML Classes
                $html.addClass('sticky-header-enabled');

                if (parseInt(self.options.stickySetTop) < 0) {
					$html.addClass('sticky-header-negative');
				}

                if (self.options.stickyScrollUp) {
					$html.addClass('sticky-header-scroll-direction');
				}

                // Notice Top Bar First Load
                if( $('.notice-top-bar').get(0) ) {
					if (parseInt(self.options.stickySetTop) == 1 || self.options.stickyEffect == 'shrink') {
						$('.body').on('transitionend webkitTransitionEnd oTransitionEnd', () => {
						    setTimeout(() => {
								if( !$html.hasClass('sticky-header-active') ) {
								    self.options.headerBody.animate({
								    	top: $('.notice-top-bar').outerHeight()
								    }, 300, () => {
								    	if( $html.hasClass('sticky-header-active') ) {
								    		self.options.headerBody.css('top', 0);
								    	}
								    });
								}
						    }, 0);
						});
					}					
				}

                // Set Start At
                if(self.options.stickyStartAtElement) {

					const $stickyStartAtElement = $(self.options.stickyStartAtElement);

					$(window).on('scroll resize sticky.header.resize', () => {
						self.options.stickyStartAt = $stickyStartAtElement.offset().top;
					});

					$(window).trigger('sticky.header.resize');
				}

                // Define Min Height value
                if( self.options.wrapper.find('.header-top').get(0) ) {
					minHeight = ( initialHeaderTopHeight + initialHeaderContainerHeight );
				} else {
					minHeight = initialHeaderContainerHeight;
				}

                // Set Wrapper Min-Height
                if( !sideHeader ) {
					if( !$('.header-logo-sticky-change').get(0) ) {
						self.options.wrapper.css('height', self.options.headerBody.outerHeight());
					} else {
						$window.on('stickyChangeLogo.loaded', () => {
							self.options.wrapper.css('height', self.options.headerBody.outerHeight());
						});
					}

					if( self.options.stickyEffect == 'shrink' ) {
						
						// Prevent wrong visualization of header when reload on middle of page
						$(document).ready(() => {
							if( $window.scrollTop() >= self.options.stickyStartAt ) {
								self.options.wrapper.find('.header-container').on('transitionend webkitTransitionEnd oTransitionEnd', () => {
									self.options.headerBody.css('position', 'fixed');
								});
							} else {
								if( !$html.hasClass('boxed') ) {
									self.options.headerBody.css('position', 'fixed');
								}
							}
						});

						self.options.wrapper.find('.header-container').css('height', initialHeaderContainerHeight);
						self.options.wrapper.find('.header-top').css('height', initialHeaderTopHeight);
					}
				}

                // Sticky Header Container Height
                if( self.options.stickyHeaderContainerHeight ) {
					self.options.wrapper.find('.header-container').css('height', self.options.wrapper.find('.header-container').outerHeight());
				}

                // Boxed
                if($html.hasClass('boxed') && self.options.stickyEffect == 'shrink') {
					self.boxedLayout();
				}

                // Check Sticky Header / Flags prevent multiple runs at same time
                let activate_flag   	 = true;

                let deactivate_flag 	 = false;
                const initialStickyStartAt = self.options.stickyStartAt;

                self.checkStickyHeader = () => {

					// Notice Top Bar
					const $noticeTopBar = $('.notice-top-bar');
					if ( $noticeTopBar.get(0) ) {
						self.options.stickyStartAt = ( $noticeTopBar.data('sticky-start-at') ) ? $noticeTopBar.data('sticky-start-at') : $('.notice-top-bar').outerHeight();
					} else {
						if( $html.hasClass('boxed') ) {
							self.options.stickyStartAt = initialStickyStartAt + 25;
						} else {
							self.options.stickyStartAt = initialStickyStartAt;
						}
					}

					if( $window.width() > 991 && $html.hasClass('side-header') ) {
						$html.removeClass('sticky-header-active');
						activate_flag = true;
						return;
					}

					if ($window.scrollTop() >= parseInt(self.options.stickyStartAt)) {
						if( activate_flag ) {
							self.activateStickyHeader();
							activate_flag = false;
							deactivate_flag = true;
						}
					} else {
						if( deactivate_flag ) {
							self.deactivateStickyHeader();
							deactivate_flag = false;
							activate_flag = true;
						}
					}

					// Scroll Up
					if (self.options.stickyScrollUp) {
						
					    // Get the new Value
					    self.options.stickyScrollNewValue = window.pageYOffset;

					    //Subtract the two and conclude
					    if(self.options.stickyScrollValue - self.options.stickyScrollNewValue < 0){
					        $html.removeClass('sticky-header-scroll-up').addClass('sticky-header-scroll-down');
					    } else if(self.options.stickyScrollValue - self.options.stickyScrollNewValue > 0){
					        $html.removeClass('sticky-header-scroll-down').addClass('sticky-header-scroll-up');
					    }

					    // Update the old value
					    self.options.stickyScrollValue = self.options.stickyScrollNewValue;

					}
				};

                // Activate Sticky Header
                self.activateStickyHeader = () => {
					if ($window.width() < 992) {
						if (self.options.stickyEnableOnMobile == false) {
							self.deactivateStickyHeader();
							self.options.headerBody.css({
								position: 'relative'
							});
							return false;
						}
					} else {
						if (sideHeader) {
							self.deactivateStickyHeader();
							return;
						}
					}

					$html.addClass('sticky-header-active');

					// Sticky Effect - Reveal
					if( self.options.stickyEffect == 'reveal' ) {

						self.options.headerBody.css('top','-' + self.options.stickyStartAt + 'px');

						self.options.headerBody.animate({
							top: self.options.stickySetTop
						}, 400, () => {});

					}

					// Sticky Effect - Shrink
					if( self.options.stickyEffect == 'shrink' ) {

						// If Header Top
						if( self.options.wrapper.find('.header-top').get(0) ) {
							self.options.wrapper.find('.header-top').css({
								height: 0,
								'min-height': 0,
								overflow: 'hidden'
							});
						}

						// Header Container
						if( self.options.stickyHeaderContainerHeight ) {
							self.options.wrapper.find('.header-container').css({
								height: self.options.stickyHeaderContainerHeight,
								'min-height': 0
							});
						} else {
							self.options.wrapper.find('.header-container').css({
								height: (initialHeaderContainerHeight / 3) * 2, // two third of container height
								'min-height': 0
							});

							const y = initialHeaderContainerHeight - ((initialHeaderContainerHeight / 3) * 2);
							$('.main').css({
								transform: 'translate3d(0, -'+ y +'px, 0)',
								transition: 'ease transform 300ms'
							}).addClass('has-sticky-header-transform');

							if($html.hasClass('boxed')) {
								self.options.headerBody.css('position','fixed');
							}
						}

					}

					self.options.headerBody.css('top', self.options.stickySetTop);

					if (self.options.stickyChangeLogo) {
						self.changeLogo(true);
					}

					// Set Elements Style
					if( $('[data-sticky-header-style]').length ) {
						$('[data-sticky-header-style]').each(function() {
							const $el = $(this), css = themestrap.fn.getOptions($el.data('sticky-header-style-active')), opts = themestrap.fn.getOptions($el.data('sticky-header-style'));

							if( $window.width() > opts.minResolution ) {
								$el.css(css);
							}
						});
					}

					$.event.trigger({
						type: 'stickyHeader.activate'
					});
				};

                // Deactivate Sticky Header
                self.deactivateStickyHeader = () => {
					$html.removeClass('sticky-header-active');

					if ( $(window).width() < 992 && self.options.stickyEnableOnMobile == false) {
						return false;
					}

					// Sticky Effect - Shrink
					if( self.options.stickyEffect == 'shrink' ) {

						// Boxed Layout
						if( $html.hasClass('boxed') ) {

							// Set Header Body Position Absolute
							self.options.headerBody.css('position','absolute');

							if( $window.scrollTop() > $('.body').offset().top ) {
								// Set Header Body Position Fixed
								self.options.headerBody.css('position','fixed');								
							}

						} else {
							// Set Header Body Position Fixed
							self.options.headerBody.css('position','fixed');
						}

						// If Header Top
						if( self.options.wrapper.find('.header-top').get(0) ) {
							self.options.wrapper.find('.header-top').css({
								height: initialHeaderTopHeight,
								overflow: 'visible'
							});

							// Fix [data-icon] issue when first load is on middle of the page
							if( self.options.wrapper.find('.header-top [data-icon]').length ) {
								themestrap.fn.intObsInit( '.header-top [data-icon]:not(.svg-inline--fa)', 'themestrapPluginIcon' );
							}
						}

						// Header Container
						self.options.wrapper.find('.header-container').css({
							height: initialHeaderContainerHeight
						});

					}

					self.options.headerBody.css('top', 0);

					if (self.options.stickyChangeLogo) {
						self.changeLogo(false);
					}

					// Set Elements Style
					if( $('[data-sticky-header-style]').length ) {
						$('[data-sticky-header-style]').each(function() {
							const $el = $(this), css = themestrap.fn.getOptions($el.data('sticky-header-style-deactive')), opts = themestrap.fn.getOptions($el.data('sticky-header-style'));

							if( $window.width() > opts.minResolution ) {
								$el.css(css);
							}
						});
					}

					$.event.trigger({
						type: 'stickyHeader.deactivate'
					});
				};

                // Always Sticky
                if (parseInt(self.options.stickyStartAt) <= 0) {
					self.activateStickyHeader();
				}

                // Set Logo
                if (self.options.stickyChangeLogo) {

					const $logoWrapper = self.options.wrapper.find('.header-logo'), $logo = $logoWrapper.find('img'), logoWidth = $logo.attr('width'), logoHeight = $logo.attr('height'), logoSmallTop = parseInt($logo.attr('data-sticky-top') ? $logo.attr('data-sticky-top') : 0), logoSmallWidth = parseInt($logo.attr('data-sticky-width') ? $logo.attr('data-sticky-width') : 'auto'), logoSmallHeight = parseInt($logo.attr('data-sticky-height') ? $logo.attr('data-sticky-height') : 'auto');

					if (self.options.stickyChangeLogoWrapper) {
						$logoWrapper.css({
							'width': $logo.outerWidth(true),
							'height': $logo.outerHeight(true)
						});
					}

					self.changeLogo = activate => {
						if(activate) {
							
							$logo.css({
								'top': logoSmallTop,
								'width': logoSmallWidth,
								'height': logoSmallHeight
							});

						} else {
							
							$logo.css({
								'top': 0,
								'width': logoWidth,
								'height': logoHeight
							});

						}
					}

					$.event.trigger({
						type: 'stickyChangeLogo.loaded'
					});

				}

                // Side Header
                let headerBodyHeight, flag = false;

                self.checkSideHeader = () => {
					if($window.width() < 992 && flag == false) {
						headerBodyHeight = self.options.headerBody.height();
						flag = true;
					}

					if(self.options.stickyStartAt == 0 && sideHeader) {
						self.options.wrapper.css('min-height', 0);
					}

					if(self.options.stickyStartAt > 0 && sideHeader && $window.width() < 992) {
						self.options.wrapper.css('min-height', headerBodyHeight);
					}
				}

                return this;
            },

			events() {
				const self = this;

				if( $(window).width() < 992 && this.options.stickyEnableOnMobile == false ) {
					return this;
				}

				if (!this.options.stickyEnableOnBoxed && $('body').hasClass('boxed') || $('html').hasClass('side-header-hamburguer-sidebar') && !this.options.stickyForce || !this.options.stickyEnabled) {
					return this;
				}

				if (!self.options.alwaysStickyEnabled) {
					$(window).on('scroll resize', () => {
						if ( $(window).width() < 992 && self.options.stickyEnableOnMobile == false) {
							self.options.headerBody.css({
								position: ''
							});

							if( self.options.stickyEffect == 'shrink' ) {
								self.options.wrapper.find('.header-top').css({
									height: ''
								});
							}

							self.deactivateStickyHeader();
						} else {
							self.checkStickyHeader();
						}
					});
				} else {
					self.activateStickyHeader();
				}

				$(window).on('load resize', () => {
					self.checkSideHeader();
				});

				$(window).on('layout.boxed', () => {
					self.boxedLayout();
				});

				return this;
			},

			boxedLayout() {
				const self = this, $window = $(window);

				if($('html').hasClass('boxed') && self.options.stickyEffect == 'shrink') {
					if( (parseInt(self.options.stickyStartAt) == 0) && $window.width() > 991) {
						self.options.stickyStartAt = 30;
					}

					// Set Header Body Position Absolute
					self.options.headerBody.css({
						position: 'absolute',
						top: 0
					});

					// Set position absolute because top margin from boxed layout
					$window.on('scroll', () => {
						if( $window.scrollTop() > $('.body').offset().top ) {
							self.options.headerBody.css({
								'position' : 'fixed',
								'top' : 0
							});								
						} else {
							self.options.headerBody.css({
								'position' : 'absolute',
								'top' : 0
							});
						}
					});
				}

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);

// Alert
(((themestrap = {}, $) => {
    const instanceName = '__pluginAlert';

    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-alert-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `/* Themestrap — PluginAlert */
.alert-ts-primary {
    --alert-ts-bg           : var(--primary-rgba-10);
    --alert-ts-border       : var(--primary);
    --alert-ts-icon         : var(--primary);
    --alert-ts-title        : var(--primary-300);
    --alert-ts-text         : var(--primary-200);
    --alert-ts-action       : var(--primary-200);
    --alert-ts-action-hover : var(--primary-300);
    --alert-ts-close        : var(--primary--200);
    --alert-ts-close-hover  : var(--primary-300);
}

.alert-ts-secondary {
    --alert-ts-bg           : var(--secondary-rgba-10);
    --alert-ts-border       : var(--secondary);
    --alert-ts-icon         : var(--secondary);
    --alert-ts-title        : var(--secondary-300);
    --alert-ts-text         : var(--secondary-200);
    --alert-ts-action       : var(--secondary-200);
    --alert-ts-action-hover : var(--secondary-300);
    --alert-ts-close        : var(--secondary--200);
    --alert-ts-close-hover  : var(--secondary-300);
}

.alert-ts-tertiary {
    --alert-ts-bg           : var(--tertiary-rgba-10);
    --alert-ts-border       : var(--tertiary);
    --alert-ts-icon         : var(--tertiary);
    --alert-ts-title        : var(--tertiary-300);
    --alert-ts-text         : var(--tertiary-200);
    --alert-ts-action       : var(--tertiary-200);
    --alert-ts-action-hover : var(--tertiary-300);
    --alert-ts-close        : var(--tertiary--200);
    --alert-ts-close-hover  : var(--tertiary-300);
}

.alert-ts-quaternary {
    --alert-ts-bg           : var(--quaternary-rgba-10);
    --alert-ts-border       : var(--quaternary);
    --alert-ts-icon         : var(--quaternary);
    --alert-ts-title        : var(--quaternary-300);
    --alert-ts-text         : var(--quaternary-200);
    --alert-ts-action       : var(--quaternary-200);
    --alert-ts-action-hover : var(--quaternary-300);
    --alert-ts-close        : var(--quaternary--200);
    --alert-ts-close-hover  : var(--quaternary-300);
}

.alert-ts-light {
    --alert-ts-bg           : var(--light-100);
    --alert-ts-border       : var(--grey-800);
    --alert-ts-icon         : var(--light-300);
    --alert-ts-title        : var(--dark-300);
    --alert-ts-text         : var(--dark-200);
    --alert-ts-action       : var(--dark-200);
    --alert-ts-action-hover : var(--dark-300);
    --alert-ts-close        : var(--dark--200);
    --alert-ts-close-hover  : var(--dark-300);
}

.alert-ts-dark {
    --alert-ts-bg           : var(--dark--300);
    --alert-ts-border       : var(--dark-300);
    --alert-ts-icon         : var(--dark-300);
    --alert-ts-title        : var(--light-300);
    --alert-ts-text         : var(--light-200);
    --alert-ts-action       : var(--light-200);
    --alert-ts-action-hover : var(--light-300);
    --alert-ts-close        : var(--light--200);
    --alert-ts-close-hover  : var(--light-300);
}

.alert-ts-info {
    --alert-ts-bg           : #eff6ff;
    --alert-ts-border       : #3b82f6;
    --alert-ts-icon         : #3b82f6;
    --alert-ts-title        : #1e40af;
    --alert-ts-text         : #1d4ed8;
    --alert-ts-action       : #1d4ed8;
    --alert-ts-action-hover : #1e40af;
    --alert-ts-close        : #93c5fd;
    --alert-ts-close-hover  : #1d4ed8;
}

.alert-ts-success {
    --alert-ts-bg           : #f0fdf4;
    --alert-ts-border       : #22c55e;
    --alert-ts-icon         : #22c55e;
    --alert-ts-title        : #14532d;
    --alert-ts-text         : #15803d;
    --alert-ts-action       : #15803d;
    --alert-ts-action-hover : #14532d;
    --alert-ts-close        : #86efac;
    --alert-ts-close-hover  : #15803d;
}

.alert-ts-warning {
    --alert-ts-bg           : #fffbeb;
    --alert-ts-border       : #f59e0b;
    --alert-ts-icon         : #f59e0b;
    --alert-ts-title        : #78350f;
    --alert-ts-text         : #92400e;
    --alert-ts-action       : #92400e;
    --alert-ts-action-hover : #78350f;
    --alert-ts-close        : #fcd34d;
    --alert-ts-close-hover  : #92400e;
}

.alert-ts-danger {
    --alert-ts-bg           : #fef2f2;
    --alert-ts-border       : #ef4444;
    --alert-ts-icon         : #ef4444;
    --alert-ts-title        : #7f1d1d;
    --alert-ts-text         : #991b1b;
    --alert-ts-action       : #991b1b;
    --alert-ts-action-hover : #7f1d1d;
    --alert-ts-close        : #fca5a5;
    --alert-ts-close-hover  : #991b1b;
}

.alert-ts-neutral {
    --alert-ts-bg           : #f9fafb;
    --alert-ts-border       : #6b7280;
    --alert-ts-icon         : #6b7280;
    --alert-ts-title        : #111827;
    --alert-ts-text         : #374151;
    --alert-ts-action       : #374151;
    --alert-ts-action-hover : #111827;
    --alert-ts-close        : #d1d5db;
    --alert-ts-close-hover  : #374151;
}


/* Base alert-ts layout */
.alert.alert-ts {
    display          : flex;
    align-items      : flex-start;
    gap              : 0.75rem;
    padding          : 1rem 1rem 1rem 1.25rem;
    border-radius    : 0.5rem;
    border-width     : 0;
    border-left      : 4px solid var(--alert-ts-border);
    background-color : var(--alert-ts-bg);
    position         : relative;
    overflow         : hidden;   /* clips countdown bar */
}

.alert.alert-ts.alert-sm {
    padding: 5px 10px;
    font-size: 0.9em;
}

.alert.alert-ts.alert-lg {
    padding: 20px;
    font-size: 1.2em;
}

/* Remove Bootstrap's default coloured border/bg — our tokens take over */
.alert.alert-ts[class*="alert-primary"],
.alert.alert-ts[class*="alert-secondary"],
.alert.alert-ts[class*="alert-success"],
.alert.alert-ts[class*="alert-danger"],
.alert.alert-ts[class*="alert-warning"],
.alert.alert-ts[class*="alert-info"],
.alert.alert-ts[class*="alert-light"],
.alert.alert-ts[class*="alert-dark"] {
    background-color : var(--alert-ts-bg);
    border-color     : transparent;
    border-left-color: var(--alert-ts-border);
    color            : var(--alert-ts-text);
}


/* Icon */
.alert-ts-icon {
    flex-shrink    : 0;
    width          : 1.25rem;   /* 20 px */
    height         : 1.25rem;
    color          : var(--alert-ts-icon);
    margin-top     : 1px;       /* optical alignment with first line of text */
}

.alert-ts-icon svg {
    display : block;
    width   : 100%;
    height  : 100%;
}

/* Body */
.alert-ts-body {
    flex    : 1 1 auto;
    min-width: 0;
}

.alert-ts-title {
    font-size   : 0.975rem;   /* 14 px */
    font-weight : 600;
    line-height : 1.4;
    color       : var(--alert-ts-title);
    margin      : 0 0 0.25rem;
}

.alert-ts-text {
    font-size   : 0.975rem;
    line-height : 1.5;
    color       : var(--alert-ts-text);
}

.alert-ts-text p:last-child {
    margin-bottom: 0;
}


/* Action buttons */
.alert-ts-actions {
    display     : flex;
    flex-wrap   : wrap;
    gap         : 0.5rem;
    margin-top  : 0.75rem;
}

.alert-ts-action {
    display         : inline-flex;
    align-items     : center;
    padding         : 0.375rem 0.75rem;
    font-size       : 0.875rem;
    font-weight     : 500;
    line-height     : 1;
    border-radius   : 0.375rem;
    border          : 1.5px solid transparent;
    cursor          : pointer;
    transition      : background-color 0.15s ease,
                      border-color     0.15s ease,
                      color            0.15s ease;
    text-decoration : none;
    white-space     : nowrap;
}

/* Primary action — filled */
.alert-ts-action-primary {
    background-color : var(--alert-ts-action);
    border-color     : var(--alert-ts-action);
    color            : #fff;
}

.alert-ts-action-primary:hover,
.alert-ts-action-primary:focus-visible {
    background-color : var(--alert-ts-action-hover);
    border-color     : var(--alert-ts-action-hover);
    color            : #fff;
}

/* Secondary action — ghost / outlined */
.alert-ts-action-secondary {
    background-color : transparent;
    border-color     : var(--alert-ts-action);
    color            : var(--alert-ts-action);
}

.alert-ts-action-secondary:hover,
.alert-ts-action-secondary:focus-visible {
    background-color : var(--alert-ts-action);
    color            : #fff;
}

/* Link-style action — no border, just tinted text */
.alert-ts-action-link {
    background  : none;
    border-color: transparent;
    color       : var(--alert-ts-action);
    padding-left : 0;
    padding-right: 0;
}

.alert-ts-action-link:hover,
.alert-ts-action-link:focus-visible {
    color           : var(--alert-ts-action-hover);
    text-decoration : underline;
}

.alert-ts-action:focus-visible {
    outline        : 2px solid var(--alert-ts-border);
    outline-offset : 2px;
}


/* Dismiss (×) button */
.alert-ts-close {
    flex-shrink      : 0;
    display          : inline-flex;
    align-items      : center;
    justify-content  : center;
    width            : 1.5rem;
    height           : 1.5rem;
    padding          : 0;
    margin-left      : auto;
    background       : none;
    border           : none;
    border-radius    : 0.375rem;
    color            : var(--alert-ts-close);
    cursor           : pointer;
    transition       : color 0.15s ease, background-color 0.15s ease;
}

.alert-ts-close svg {
    display : block;
    width   : 1.25rem;
    height  : 1.25rem;
}

.alert-ts-close:hover {
    color            : var(--alert-ts-close-hover);
    background-color : color-mix(in srgb, var(--alert-ts-border) 12%, transparent);
}

.alert-ts-close:focus-visible {
    outline        : 2px solid var(--alert-ts-border);
    outline-offset : 2px;
    color          : var(--alert-ts-close-hover);
}


/* Countdown progress bar */
.alert-ts-countdown {
    position         : absolute;
    bottom           : 0;
    left             : 0;
    width            : 100%;
    height           : 3px;
    background-color : var(--alert-ts-border);
    opacity          : 0.45;
    transform        : scaleX(1);
    transform-origin : left center;
    transition-property    : transform;
    transition-timing-function: linear;
    /* transitionDuration is set dynamically by JS */
}


/* Toast stack (programmatic / create()) */
.alert-toast-stack {
    position   : fixed;
    top        : 1.25rem;
    right      : 1.25rem;
    z-index    : 1090;
    display    : flex;
    flex-direction : column;
    gap        : 0.625rem;
    width      : clamp(280px, 90vw, 400px);
    pointer-events: none;
}

.alert-toast-stack > .alert-ts {
    pointer-events : auto;
    box-shadow     : 0 4px 6px -1px rgba(0,0,0,.08),
                     0 2px 4px -2px rgba(0,0,0,.06);
}

/* Slide-in entrance for toasts */
.alert-ts-toast {
    animation: alertTsSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes alertTsSlideIn {
    from {
        opacity   : 0;
        transform : translateX(2rem);
    }
    to {
        opacity   : 1;
        transform : translateX(0);
    }
}

/* Dark-mode palette */
html.dark .alert-ts-info {
    --alert-ts-bg           : #172554;
    --alert-ts-border       : #3b82f6;
    --alert-ts-icon         : #60a5fa;
    --alert-ts-title        : #bfdbfe;
    --alert-ts-text         : #93c5fd;
    --alert-ts-action       : #93c5fd;
    --alert-ts-action-hover : #bfdbfe;
    --alert-ts-close        : #3b82f6;
    --alert-ts-close-hover  : #bfdbfe;
}

html.dark .alert-ts-success {
    --alert-ts-bg           : #052e16;
    --alert-ts-border       : #22c55e;
    --alert-ts-icon         : #4ade80;
    --alert-ts-title        : #bbf7d0;
    --alert-ts-text         : #86efac;
    --alert-ts-action       : #86efac;
    --alert-ts-action-hover : #bbf7d0;
    --alert-ts-close        : #22c55e;
    --alert-ts-close-hover  : #bbf7d0;
}

html.dark .alert-ts-warning {
    --alert-ts-bg           : #27170a;
    --alert-ts-border       : #f59e0b;
    --alert-ts-icon         : #fbbf24;
    --alert-ts-title        : #fde68a;
    --alert-ts-text         : #fcd34d;
    --alert-ts-action       : #fcd34d;
    --alert-ts-action-hover : #fde68a;
    --alert-ts-close        : #f59e0b;
    --alert-ts-close-hover  : #fde68a;
}

html.dark .alert-ts-danger {
    --alert-ts-bg           : #2d0a0a;
    --alert-ts-border       : #ef4444;
    --alert-ts-icon         : #f87171;
    --alert-ts-title        : #fecaca;
    --alert-ts-text         : #fca5a5;
    --alert-ts-action       : #fca5a5;
    --alert-ts-action-hover : #fecaca;
    --alert-ts-close        : #ef4444;
    --alert-ts-close-hover  : #fecaca;
}

html.dark .alert-ts-neutral {
    --alert-ts-bg           : #111827;
    --alert-ts-border       : #6b7280;
    --alert-ts-icon         : #9ca3af;
    --alert-ts-title        : #f9fafb;
    --alert-ts-text         : #d1d5db;
    --alert-ts-action       : #d1d5db;
    --alert-ts-action-hover : #f9fafb;
    --alert-ts-close        : #6b7280;
    --alert-ts-close-hover  : #f9fafb;
}

.alert.alert-ts {
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
}

/* Reduced-motion overrides */
@media (prefers-reduced-motion: reduce) {
    .alert-ts-toast {
        animation: none;
    }

    .alert-ts-countdown {
        transition: none;
    }
}`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    const ICONS = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-10 5.75a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2" clip-rule="evenodd" />
</svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-5.97-3.03a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l2.235-2.235L14.97 8.97a.75.75 0 0 1 1.06 0" clip-rule="evenodd" />
</svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path fill="currentColor" fill-rule="evenodd" d="M5.312 10.762C8.23 5.587 9.689 3 12 3s3.77 2.587 6.688 7.762l.364.644c2.425 4.3 3.638 6.45 2.542 8.022S17.786 21 12.364 21h-.728c-5.422 0-8.134 0-9.23-1.572s.117-3.722 2.542-8.022zM12 7.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75M12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clip-rule="evenodd" />
</svg>`,
        danger: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 0 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 0 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06" clip-rule="evenodd" />
</svg>`,
        neutral: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path fill="currentColor" fill-rule="evenodd" d="M9.25 18.709c0-.42.336-.76.75-.76h4c.414 0 .75.34.75.76s-.336.76-.75.76h-4a.755.755 0 0 1-.75-.76m.667 2.532c0-.42.335-.76.75-.76h2.666c.415 0 .75.34.75.76a.754.754 0 0 1-.75.759h-2.666a.755.755 0 0 1-.75-.76" clip-rule="evenodd" />
	<path fill="currentColor" d="m7.41 13.828l1.105 1.053c.31.295.485.707.485 1.137c0 .647.518 1.172 1.157 1.172h3.686c.639 0 1.157-.525 1.157-1.172c0-.43.176-.842.485-1.137l1.104-1.053c1.542-1.48 2.402-3.425 2.41-5.446L19 8.297C19 4.842 15.866 2 12 2S5 4.842 5 8.297v.085c.009 2.021.87 3.966 2.41 5.446" />
</svg>`
    };

    //Bootstrap class ? plugin type 
    const BS_TYPE_MAP = {
        'alert-default'    : 'neutral',
        'alert-primary'    : 'primary',
        'alert-secondary'  : 'secondary',
        'alert-tertiary'   : 'tertiary',
        'alert-quaternary' : 'quaternary',
        'alert-info'       : 'info',
        'alert-success'    : 'success',
        'alert-warning'    : 'warning',
        'alert-danger'     : 'danger',
        'alert-secondary'  : 'secondary',
        'alert-light'      : 'light',
        'alert-dark'       : 'dark'
    };

    // Close-button SVG
    const CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                         <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                       </svg>`;

    class PluginAlert {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el          = $el;
            this.$countdown   = null;
            this._timer       = null;
            this._startTime   = null;
            this._remaining   = null;
            this._initialHTML = $el.html();   // saved before build mutates the DOM

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
            const pluginOptions = themestrap.fn.getOptions(this.$el.data('plugin-options'));
            this.options = $.extend(true, {}, PluginAlert.defaults, pluginOptions, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self = this;
            const o    = self.options;

            // Resolve type from Bootstrap classes when not explicitly provided
            if (!o.type) {
                o.type = self._detectType();
            }

            // Apply skin classes
            self.$el
                .addClass(`alert-ts alert-ts-${o.type}`)
                .attr('role', 'alert');

            // Restructure markup
            self._buildStructure();

            // Countdown progress bar
            if (o.showCountdown && o.autoDismiss) {
                self.$el.css('position', 'relative');

                self.$countdown = $('<div>', { class: 'alert-ts-countdown' })
                    .appendTo(self.$el);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (self.$countdown) {
                            self.$countdown.css({
                                transitionDuration : `${o.delay}ms`,
                                transform          : 'scaleX(0)'
                            });
                        }
                    });
                });
            }

            // Auto-dismiss timer
            if (o.autoDismiss) {
                self._remaining = o.delay;
                self._startTimer();
            }

            return this;
        }

        _detectType() {
            let type = 'info';
            $.each(BS_TYPE_MAP, (cls, mapped) => {
                if (this.$el.hasClass(cls)) {
                    type = mapped;
                    return false; // break $.each
                }
            });
            return type;
        }

        /**
         * Rearranges the alert's inner HTML
         * Works for HTML-authored alerts and create()-generated ones.
         */
        _buildStructure() {
            const self = this;
            const o    = self.options;

            // Detach any existing Bootstrap close button
            const $bsClose = self.$el.find('.btn-close').detach();

            // Capture remaining content as the message (only when no explicit message option)
            const messageHTML = (o.message != null)
                ? o.message
                : self.$el.html().trim();

            self.$el.empty();

            // Icon 
            if (o.showIcon) {
                $('<div>', { class: 'alert-ts-icon', 'aria-hidden': 'true' })
                    .html(ICONS[o.type] || ICONS.info)
                    .appendTo(self.$el);
            }

            // Body
            const $body = $('<div>', { class: 'alert-ts-body' }).appendTo(self.$el);

            if (o.title) {
                $('<p>', { class: 'alert-ts-title' }).text(o.title).appendTo($body);
            }

            if (messageHTML) {
                $('<div>', { class: 'alert-ts-text' }).html(messageHTML).appendTo($body);
            }

            // Action links / buttons
            if (o.actions && o.actions.length) {
                const $actions = $('<div>', { class: 'alert-ts-actions' });
                o.actions.forEach(action => {
                    $('<button>', {
                        type         : 'button',
                        class        : `alert-ts-action alert-ts-action-${action.variant || 'primary'} ${action.class || ''}`.trim(),
                        text         : action.label,
                        'data-action': action.key || ''
                    }).appendTo($actions);
                });
                $actions.appendTo($body);
            }

            // Dismiss button
            if (o.dismissible) {
                $('<button>', {
                    type        : 'button',
                    class       : 'alert-ts-close',
                    'aria-label': 'Dismiss alert'
                }).html(CLOSE_SVG).appendTo(self.$el);
            } else if ($bsClose.length) {
                // Preserve original Bootstrap close button when present
                $bsClose.addClass('alert-ts-close').appendTo(self.$el);
            }
        }

        events() {
            const self = this;
            const o    = self.options;

            // Dismiss on close-button click
            self.$el.on('click.pluginalert', '.alert-ts-close, .btn-close', e => {
                e.preventDefault();
                e.stopPropagation();
                self.dismiss();
            });

            // Action button clicks — fire a namespaced jQuery event and optional callback
            self.$el.on('click.pluginalert', '.alert-ts-action', function() {
                const key = $(this).data('action');
                self.$el.trigger('action.alert', [key, self]);
                if ($.isFunction(o.onAction)) {
                    o.onAction.call(self, key);
                }
            });

            // Hover-pause
            if (o.pauseOnHover && o.autoDismiss) {
                self.$el
                    .on('mouseenter.pluginalert', () => self._pauseTimer())
                    .on('mouseleave.pluginalert', () => self._resumeTimer());
            }

            return this;
        }

        _startTimer() {
            this._startTime = Date.now();
            this._timer     = setTimeout(() => this.dismiss(), this._remaining);
            return this;
        }

        _pauseTimer() {
            if (!this._timer) return this;

            clearTimeout(this._timer);
            this._timer     = null;
            this._remaining -= Date.now() - this._startTime;

            if (this.$countdown) {
                const ratio = Math.max(0, this._remaining / this.options.delay);
                this.$countdown.css({
                    transitionDuration : '0ms',
                    transform          : `scaleX(${ratio})`
                });
            }
            return this;
        }

        _resumeTimer() {
            if (this._timer) return this;
            this._startTimer();

            if (this.$countdown) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (this.$countdown) {
                            this.$countdown.css({
                                transitionDuration : `${this._remaining}ms`,
                                transform          : 'scaleX(0)'
                            });
                        }
                    });
                });
            }
            return this;
        }

        /**
         * Animate the alert out, then remove or hide it.
         * Fires close.bs.alert and closed.bs.alert to preserve Bootstrap compatibility.
         */
        dismiss() {
            const self = this;
            const o    = self.options;

            clearTimeout(self._timer);
            self._timer = null;

            self.$el.trigger('close.bs.alert');

            if (o.animation === 'slide') {
                self.$el.css({
                    overflow   : 'hidden',
                    maxHeight  : `${self.$el.outerHeight(true)}px`,
                    transition : `max-height ${o.animationDuration}ms ease,
                                  opacity     ${o.animationDuration}ms ease,
                                  margin      ${o.animationDuration}ms ease,
                                  padding     ${o.animationDuration}ms ease`
                });

                setTimeout(() => {
                    self.$el.css({
                        maxHeight     : '0px',
                        opacity       : 0,
                        marginTop     : 0,
                        marginBottom  : 0,
                        paddingTop    : 0,
                        paddingBottom : 0
                    });
                    setTimeout(() => self._afterDismiss(), o.animationDuration);
                }, 20);

            } else {
                self.$el.css({
                    transition : `opacity ${o.animationDuration}ms ease`,
                    opacity    : 0
                });
                setTimeout(() => self._afterDismiss(), o.animationDuration);
            }

            return this;
        }

        _afterDismiss() {
            const self = this;
            self.$el.trigger('closed.bs.alert');

            if ($.isFunction(self.options.onDismiss)) {
                self.options.onDismiss.call(self);
            }

            if (self.options.remove) {
                self.$el.remove();
            } else {
                self.$el.css('display', 'none');
            }
        }

        destroy() {
            const self = this;

            clearTimeout(self._timer);
            self._timer = null;

            self.$el.off('.pluginalert');
            self.$el.html(self._initialHTML);
            self.$el.removeClass((_, cls) =>
                cls.split(' ').filter(c => c.startsWith('alert-ts')).join(' ')
            );
            self.$el.css({
                position      : '',
                overflow      : '',
                maxHeight     : '',
                opacity       : '',
                transition    : '',
                marginTop     : '',
                marginBottom  : '',
                paddingTop    : '',
                paddingBottom : ''
            });

            self.$countdown = null;
            self.$el.removeData(instanceName);
            return this;
        }
    }

    PluginAlert.defaults = {
        // Type: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
        // Auto-detected from Bootstrap classes when null.
        type              : null,

        // Layout / content
        showIcon          : false,   // inject icon matching the type
        dismissible       : false,   // render dismiss button
        title             : null,    // bold heading above the message
        message           : null,    // message HTML (used by create(); HTML alerts auto-detect)
        actions           : [],      // [{label, key, variant, class}]

        // Behaviour
        autoDismiss       : false,
        delay             : 5000,    // ms before auto-dismiss
        pauseOnHover      : true,

        // Animation
        animation         : 'fade',  // 'slide' | 'fade'
        animationDuration : 400,
        showCountdown     : true,    // shrinking bar along the bottom edge

        // Lifecycle callbacks
        onDismiss         : null,    // fn() — called after the alert is removed
        onAction          : null,    // fn(key) — called when an action button is clicked

        remove            : true     // true: remove from DOM; false: display:none
    };

    /**
     * PluginAlert.create(containerSelector, opts)
     *
     * Programmatically create and inject a new alert. If no container is given,
     * alerts stack inside a shared `.alert-toast-stack` (auto-created on <body>).
     *
     * @param {string|jQuery} container  Target selector / jQuery object (optional).
     * @param {object}        opts       Any PluginAlert options. `message` is expected.
     * @returns {PluginAlert}            The newly-created plugin instance.
     *
     * Examples:
     *
     *   // Toast with a title and two action buttons
     *   themestrap.PluginAlert.create({
     *       type    : 'warning',
     *       title   : 'Unsaved changes',
     *       message : 'You have unsaved changes. Do you want to save them?',
     *       delay   : 8000,
     *       actions : [
     *           { label: 'Save',    key: 'save',    variant: 'primary' },
     *           { label: 'Discard', key: 'discard', variant: 'secondary' }
     *       ],
     *       onAction(key) {
     *           if (key === 'save') saveChanges();
     *           this.dismiss();
     *       }
     *   });
     *
     *   // Inject into a specific container
     *   themestrap.PluginAlert.create('#page-notifications', {
     *       type    : 'success',
     *       message : 'Profile updated successfully.'
     *   });
     */
    PluginAlert.create = function(container, opts) {
        // Allow omitting container argument
        if (container && typeof container === 'object' && !container.jquery) {
            opts      = container;
            container = null;
        }

        const o = $.extend(true, {}, PluginAlert.defaults, opts);

        // Resolve / create container
        let $container = container ? $(container) : null;
        if (!$container || !$container.length) {
            $container = $('.alert-toast-stack');
            if (!$container.length) {
                $container = $('<div>', { class: 'alert-toast-stack' }).appendTo('body');
            }
        }

        // Build a minimal Bootstrap-compatible alert element
        const $alert = $('<div>', {
            class : `alert alert-ts alert-ts-${o.type || 'info'} alert-ts-toast`,
            role  : 'alert'
        }).appendTo($container);

        return new PluginAlert($alert, o);
    };

    $.extend(themestrap, { PluginAlert });

    $.fn.themestrapPluginAlert = function(opts) {
        return this.each(function() {
            const $this    = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && $.isFunction(instance[opts])) {
                    instance[opts]();
                } else if (opts !== 'dismiss' && opts !== 'destroy') {
                    console.warn(`[PluginAlert] Unknown command: "${opts}"`);
                }
                return;
            }

            if (!instance) {
                new PluginAlert($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// Rating
(((themestrap = {}, $) => {
    const instanceName = '__rating';

    class PluginRating {
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
            const sizeClasses = ['xs', 'sm', 'md', 'lg', 'xl'];
            let detectedSize = null;

            sizeClasses.forEach(s => {
                if (this.$el.hasClass('rating-' + s)) detectedSize = s;
            });

            this.options = $.extend(true, {}, PluginRating.defaults, { size: detectedSize }, opts, {
                wrapper: this.$el
            });
            return this;
        }

        _iconHtml(icon) {
            const str = String(icon).trim();

            if (str.startsWith('<svg')) {
                if (this.options.currentColor) {
                    // Inline SVG â€” sanitize hardcoded fill/stroke colors to currentColor,
                    // leaving fill="none" and stroke="none" untouched.
                    const sanitized = str
                        .replace(/\bfill\s*=\s*"(?!none")[^"]*"/gi, 'fill="currentColor"')
                        .replace(/\bstroke\s*=\s*"(?!none")[^"]*"/gi, 'stroke="currentColor"')
                        .replace(/\bfill\s*:\s*(?!none\b)[^;"]*/gi, 'fill:currentColor')
                        .replace(/\bstroke\s*:\s*(?!none\b)[^;"]*/gi, 'stroke:currentColor');
                    return `<span class="icon svg-icon">${sanitized}</span>`;
                } else {
                    return `<span class="icon svg-icon">${str}</span>`;
                }
            }

            if (/\bfa[-\w]/.test(str)) {
                // Font Awesome class string e.g. "fa-solid fa-heart"
                const size = (this.options.size && this.options.size !== 'md') ? ` fa-${this.options.size}` : '';
                return `<i class="${str.replace(/"/g, '')}${size} icon"></i>`;
            }

        }

        build() {
            const self = this;
            const o = self.options;

            self.$icons = self.$el.find('.icon');

            if (!self.$icons.length) {
                let html = '';
                for (let i = 1; i <= o.maxRating; i++) {
                    html += self._iconHtml(o.icon);
                }
                self.$el.html(html);
                self.$icons = self.$el.find('.icon');
            }

            if (o.interactive) {
                self.$el.removeClass('disabled');
            } else {
                self.$el.addClass('disabled');
            }

            self.setRating(o.initialRating, true);

            return this;
        }

        events() {
            const self = this;

            self.$el
                .on('mouseenter.rating', '.icon', function() {
                    const $active = $(this);
                    $active.nextAll().removeClass('selected');
                    self.$el.addClass('selected');
                    $active.addClass('selected').prevAll().addClass('selected');
                })
                .on('mouseleave.rating', '.icon', function() {
                    self.$el.removeClass('selected');
                    self.$icons.removeClass('selected');
                })
                .on('click.rating', '.icon', function() {
                    const o = self.options;
                    const current = self.getRating();
                    const rating = self.$icons.index($(this)) + 1;
                    const canClear = o.clearable === 'auto' ? self.$icons.length === 1 : o.clearable;

                    if (canClear && current === rating) {
                        self.clearRating();
                    } else {
                        self.setRating(rating);
                    }
                });

            return this;
        }

        setRating(rating, silent) {
            const self = this;
            const ratingIndex = Math.floor(rating - 1 >= 0 ? rating - 1 : 0);
            const $activeIcon = self.$icons.eq(ratingIndex);
            const $partialIcon = rating <= 1 ? $activeIcon : $activeIcon.next();
            const filledPct = (rating % 1) * 100;

            self.$el.removeClass('selected');
            self.$icons.removeClass('selected active partial');

            if (rating > 0) {
                $activeIcon.prevAll().addBack().addClass('active');

                if ($activeIcon.next().length && rating % 1 !== 0) {
                    $partialIcon.addClass('partial active').css('--full', filledPct + '%');

                    if ($partialIcon.css('backgroundColor') === 'transparent') {
                        $partialIcon.removeClass('partial active');
                    }
                }
            }

            if (!silent) {
                self.options.onRate.call(self.$el[0], rating);
            }

            return this;
        }

        getRating() {
            return this.$icons.filter('.active').length;
        }

        clearRating() {
            return this.setRating(0);
        }

        enable() {
            const self = this;
            self.$el.removeClass('disabled');
            if (!self.$el.data('eventsbound')) {
                self.events();
                self.$el.data('eventsbound', true);
            }
            return this;
        }

        disable() {
            this.$el.addClass('disabled').off('.rating');
            return this;
        }

        destroy() {
            this.$el.off('.rating').removeData(instanceName);
            return this;
        }
    }

    PluginRating.defaults = {
        icon:          'fa-solid fa-star',
        currentColor:  false,
        initialRating: 0,
        interactive:   true,
        maxRating:     5,
        clearable:     'auto',
        size:          'md',
        onRate:        function(rating) {}
    };

    $.extend(themestrap, { 
        PluginRating 
    });
    
    $.fn.themestrapPluginRating = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
			} else {
				return new PluginRating($this, opts);
			}
        });
    };
})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Syntax Highlight Plugin
 * Wraps highlight.js core with lazy ESM loading, language aliases, promise
 * coalescing, line numbers, pre-highlighted lines, line selection and copy.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * ATTRIBUTE API  (all attributes must live on the <pre> element)
 *   data-plugin-highlight="modx"
 *   data-plugin-highlight="javascript"
 *     Canonical highlight.js language ID (or alias — see LANG_ALIASES below).
 *     Omit or leave blank for plaintext (no coloring, line numbers still apply).
 *
 *   data-plugin-highlight-lines="1,3,5-8"
 *     Comma-separated line numbers and/or inclusive ranges pre-marked with the
 *     .hljs-ln-highlight-line / .hljs-ln-highlight-num classes (amber by default).
 *     Applied after hljs runs — purely presentational, no effect on copy content.
 *
 *   data-plugin-highlight-hljs-config='{"tabReplace":"  "}'
 *     JSON object forwarded to hljs.configure() before highlighting runs.
 *     Any valid hljs configure key is accepted.
 *
 *   data-plugin-options='{"showCopy":true,"lineNumbers":true,"copyTimeout":800}'
 *     Standard Themestrap options object. Accepts all PluginHighlight.defaults keys.
 *     Individual data-plugin-highlight-* attrs take precedence over options in this bag.
 *
 *   id="my-block"
 *     Line anchors use this as a prefix: my-block-L1, my-block-L2 …
 *     A sequential id is auto-generated when absent: codeblock-1-L1, codeblock-1-L2 …
 *
 * ELEMENT NORMALIZATION
 * The plugin always operates on a <pre> element. If the jQuery selector targets
 * a <code> child or a wrapper <div>, the plugin locates the nearest <pre>,
 * relocates any highlight data-* attrs, and uses the <pre> from that point on.
 *
 * RESILIENCE
 * highlight.js core and per-language grammars are fetched from a CDN via dynamic
 * import(). Those requests can fail (502 Bad Gateway, network drops, CSP blocks,
 * timeouts). The plugin is designed to degrade gracefully rather than throw:
 *   - Each import is wrapped in a per-attempt timeout and retried with backoff.
 *   - A failed import is evicted from the in-flight cache so it is never "poisoned"
 *     (a single transient 502 will not permanently disable highlighting).
 *   - If core never loads, blocks still render as ESCAPED plaintext with line
 *     numbers and copy intact — no raw-HTML injection, no thrown errors.
 *   - After a hard core failure the loader backs off for a cooldown window to
 *     avoid hammering a down CDN, then transparently retries later.
 *
 * USAGE
 *   <pre id="ex1"
 *        data-plugin-highlight="javascript"
 *        data-plugin-highlight-lines="3,7-9"
 *        data-plugin-options='{"lineNumbers":true,"showCopy":true}'><code>
 *       const greet = name => `Hello, ${name}!`;
 *   </code></pre>
 *
 *   <script>
 *     $('#ex1').themestrapPluginHighlight();
 *   </script>
 *
 * Auto-init via themestrap.init.js (requires data-plugin-highlight on the <pre>):
 *
 *   if ($.isFunction($.fn['themestrapPluginHighlight']) && $('[data-plugin-highlight]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-highlight]:not(.manual)', 'themestrapPluginHighlight');
 *   }
 */
// Syntax Highlight
(((themestrap = {}, $) => {
    const instanceName = '__highlight';

    // Resilience tuning
    // CDN endpoints (extracted so they can be swapped / mirrored in one place).
    const HLJS_CORE_URL  = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11-stable/build/es/core.js';
    const HLJS_LANG_BASE = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/';
    const MODX_LANG_URL  = 'https://nskiag6l.modx.dev/assets/components/themestrap/js/modx.js';

    const LOAD_TIMEOUT_MS  = 10000;  // per-attempt ceiling for a single import()
    const LOAD_RETRIES     = 2;      // extra attempts after the first (so 3 total)
    const RETRY_BASE_MS    = 400;    // exponential backoff base between attempts
    const CORE_COOLDOWN_MS = 15000;  // back-off window after a hard core failure

    // Syntax Highlight stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use the this plugin.
    const STYLE_ID = 'ts-syntax-highlight-styles';
    const CSS_TEXT = `            /** 
             *  Themestrap Syntax Highlight — Styles
             */
            /* Code Block */
            .code-highlight {
                
            }
            
            .code-highlight-header {
                background-color: var(--dark--300);
                width: 100%;
                text-align: right;
                border-radius: var(--border-radius);
            }
            
            html.dark .code-highlight-header {
                background-color: var(--dark-100);
            }

            .code-highlight .code-highlight-caption {
                font-size: smaller;
                float: left;
                margin-left: 12px;
                margin-top: 9px;
                color: var(--light-200);
            }

            .code-highlight .topfix {
                background-color: var(--dark--300);
                width: 100%;
                height: 1em;
                margin-top: -1em;
                border-bottom: 1px var(--light-rgba-10) solid;
            }

            html.dark .code-highlight .topfix {
                background-color: var(--dark-100);
            }

            .code-highlight .buttons {
                height: 35px;
                margin-right: 5px;
                border: 0;
                outline: 0;
                display: flex;
                transition: 0.2s;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: flex-end;
                align-items: center;
            }

            .code-highlight .buttons .badge {
                margin-right:20px;
            }

            .code-highlight .button svg path, 
            .code-highlight .button svg rect, 
            .code-highlight .button svg polygon {
              fill: var(--light-200);
            }

            .code-highlight .button svg {
                width: 10px;
                height: 10px;
                margin: 0 8px;
            }
            
            /* Light Mode - Inspired by Base16 */
            pre code.hljs {
                display: block;
                overflow-x: auto;
                padding: 1em
            }

            code.hljs {
                padding: 3px 5px
            }

            .hljs {
                background: var(--light-100);
                color: var(--dark--300);
            }

            .hljs ::-moz-selection,
            .hljs::-moz-selection {
                background-color: var(--light-inverse);
                color: var(--dark-inverse)
            }

            .hljs ::selection,
            .hljs::selection {
                background-color: var(--light-inverse);
                color: var(--dark-inverse)
            }

            .hljs-comment {
                color: #b8b8b8
            }

            .hljs-tag {
                color: #585858
            }

            .hljs-operator,
            .hljs-punctuation,
            .hljs-subst {
                color: #383838
            }

            .hljs-operator {
                opacity: .7
            }

            .hljs-bullet,
            .hljs-deletion,
            .hljs-name,
            .hljs-selector-tag,
            .hljs-template-variable,
            .hljs-variable {
                color: #ab4642
            }

            .hljs-attr,
            .hljs-link,
            .hljs-literal,
            .hljs-number,
            .hljs-symbol,
            .hljs-variable.constant_ {
                color: #dc9656
            }

            .hljs-class .hljs-title,
            .hljs-title,
            .hljs-title.class_ {
                color: #f7ca88
            }

            .hljs-strong {
                font-weight: 700;
                color: #f7ca88
            }

            .hljs-addition,
            .hljs-code,
            .hljs-string,
            .hljs-title.class_.inherited__ {
                color: #a1b56c
            }

            .hljs-built_in,
            .hljs-doctag,
            .hljs-keyword.hljs-atrule,
            .hljs-quote,
            .hljs-regexp {
                color: #86c1b9
            }

            .hljs-attribute,
            .hljs-function .hljs-title,
            .hljs-section,
            .hljs-title.function_,
            .ruby .hljs-property {
                color: #7cafc2
            }

            .diff .hljs-meta,
            .hljs-keyword,
            .hljs-template-tag,
            .hljs-type {
                color: #ba8baf
            }

            .hljs-emphasis {
                color: #ba8baf;
                font-style: italic
            }

            .hljs-meta,
            .hljs-meta .hljs-keyword,
            .hljs-meta .hljs-string {
                color: #a16946
            }

            .hljs-meta .hljs-keyword,
            .hljs-meta-keyword {
                font-weight: 700
            }
            
            /* Dark Mode - Inspired by Base16 */
            html.dark pre code.hljs {
                display: block;
                overflow-x: auto;
                padding: 1em
            }

            html.dark code.hljs {
                padding: 3px 5px
            }

            html.dark .hljs {
                color: #d8d8d8;
                background: #181818
            }

            html.dark .hljs ::-moz-selection,
            html.dark .hljs::-moz-selection {
                background-color: #383838;
                color: #d8d8d8
            }

            html.dark .hljs ::selection,
            html.dark .hljs::selection {
                background-color: #383838;
                color: #d8d8d8
            }

            html.dark .hljs-comment {
                color: #585858
            }

            html.dark .hljs-tag {
                color: #b8b8b8
            }

            html.dark .hljs-operator,
            html.dark .hljs-punctuation,
            html.dark .hljs-subst {
                color: #d8d8d8
            }

            html.dark .hljs-operator {
                opacity: .7
            }

            html.dark .hljs-bullet,
            html.dark .hljs-deletion,
            html.dark .hljs-name,
            html.dark .hljs-selector-tag,
            html.dark .hljs-template-variable,
            html.dark .hljs-variable {
                color: #ab4642
            }

            html.dark .hljs-attr,
            html.dark .hljs-link,
            html.dark .hljs-literal,
            html.dark .hljs-number,
            html.dark .hljs-symbol,
            html.dark .hljs-variable.constant_ {
                color: #dc9656
            }

            html.dark .hljs-class .hljs-title,
            html.dark .hljs-title,
            html.dark .hljs-title.class_ {
                color: #f7ca88
            }

            html.dark .hljs-strong {
                font-weight: 700;
                color: #f7ca88
            }

            html.dark .hljs-addition,
            html.dark .hljs-code,
            html.dark .hljs-string,
            html.dark .hljs-title.class_.inherited__ {
                color: #a1b56c
            }

            html.dark .hljs-built_in,
            html.dark .hljs-doctag,
            html.dark .hljs-keyword.hljs-atrule,
            html.dark .hljs-quote,
            html.dark .hljs-regexp {
                color: #86c1b9
            }

            html.dark .hljs-attribute,
            html.dark .hljs-function .hljs-title,
            html.dark .hljs-section,
            html.dark .hljs-title.function_,
            html.dark .ruby .hljs-property {
                color: #7cafc2
            }

            html.dark .diff .hljs-meta,
            html.dark .hljs-keyword,
            html.dark .hljs-template-tag,
            html.dark .hljs-type {
                color: #ba8baf
            }

            html.dark .hljs-emphasis {
                color: #ba8baf;
                font-style: italic
            }

            html.dark .hljs-meta,
            html.dark .hljs-meta .hljs-keyword,
            html.dark .hljs-meta .hljs-string {
                color: #a16946
            }

            html.dark .hljs-meta .hljs-keyword,
            html.dark .hljs-meta-keyword {
                font-weight: 700
            }

            html.dark .hljs-ln-highlight-line {
                background: rgba(229,192,123,.12); 
                border-left: 2px solid #e5c07b; 
                padding-left: 2px;
            }

            .hljs-ln-highlight-line {
                background: rgba(229,192,123,.3); 
                border-left: 2px solid #cfa85e; 
                padding-left: 2px;
            }

            .hljs-ln-highlight-num {
                color: #e5c07b; 
                background: rgba(229,192,123,.12);
            }

            pre:not([data-plugin-highlight]) {
                border-radius: 0.5em;
            }

            pre code, pre code.hljs {
              display: block;
              overflow-x: auto;
              padding: 1em
            }

            .hljs-ts-json.attr_ {
               color: var(--secondary);
            }
            .hljs-ts-json.string_ {
               color: var(--primary--300);
            }
            .hljs-ts-json.number_ {
               color: #0288d1;
            }
            .hljs-ts-json.literal_ {
               color: blue;
            }
            .hljs-ts-json.punctuation_ {
               color: #607d8b;
            }

            .hljs-ln-wrapper {
                display: flex;
                width: 100%;
            }

            .hljs-ln-numbers {
                text-align: right;
                margin-right: 10px;
                padding-right: 10px;
                border-right: 1px solid rgba(255,255,255,0.1);
                user-select: none;
            }

            .hljs-ln-number {
                opacity: 0.5;
                padding: 0 5px;
            }

            .hljs-ln-code {
                flex: 1;
            }

            .hljs-ln-line {
                position: relative;
                white-space: pre;
            }

            .hljs-ln-copy {
                position: absolute;
                left: -220px;
                top: -20px;
                opacity: 0;
                cursor: pointer;
                font-size: 12px;
                transition: 0.2s;
            }

            .hljs-ln-copy img {
                width: 16px;
                height: 16px;
            }

            .hljs-ln-line:hover .hljs-ln-copy {
                opacity: 1;
            }

            .hljs-ln-line:hover .hljs-ln-copy {
                opacity: 1;
            }

            .hljs-ln-copy.copied {
                color: #4caf50;
            }

            .hljs-copy-corner {
                position: absolute;
                z-index: 3;
                display: flex;
                flex-direction: column;
            }

            .hljs-copy-btn {
                top: 10px;
                right: 10px;
                opacity: .2;
                align-items: flex-end;
                background-color: var(--light-rgba-20) !important;
            }

            .hljs-copy-btn:hover {
                opacity: 1;
            }
        `;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()). Keeps the CSS out of pages that merely load the script.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    // HTML-escape source text for the fallback render path. When hljs is NOT
    // available we must never write raw textContent into innerHTML — code blocks
    // routinely contain <, >, & and even literal <script>/<style>, which would
    // otherwise be parsed as markup (broken layout at best, injection at worst).
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[c]));
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // import() cannot be aborted, but we can stop *waiting* on it. The module
    // keeps downloading in the background and the browser caches it, so a later
    // retry resolves instantly from cache. The timer is always cleared to avoid
    // a dangling reject on the winning path.
    function importWithTimeout(url, timeout) {
        let timer;
        const timeoutP = new Promise((_, reject) => {
            timer = setTimeout(
                () => reject(new Error(`timeout after ${timeout}ms`)),
                timeout
            );
        });
        return Promise.race([import(url), timeoutP]).finally(() => clearTimeout(timer));
    }

    // Resilient dynamic import: per-attempt timeout + exponential backoff retry.
    // Throws the last error only after all attempts are exhausted. Note that a
    // browser dynamic-import failure (e.g. a 502 from the CDN) surfaces as a
    // TypeError without an accessible HTTP status, so every failure is treated
    // as retryable rather than branching on status codes.
    async function loadModule(url, { timeout = LOAD_TIMEOUT_MS, retries = LOAD_RETRIES, label = url } = {}) {
        let lastErr;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await importWithTimeout(url, timeout);
            } catch (e) {
                lastErr = e;
                console.warn(
                    `PluginHighlight: load attempt ${attempt + 1}/${retries + 1} failed for ${label} — ${e?.message || e}`
                );
                if (attempt < retries) await delay(RETRY_BASE_MS * Math.pow(2, attempt));
            }
        }
        throw lastErr;
    }

    // Maps shorthand / alternate names to canonical highlight.js grammar IDs.
    // Note: hljs registers the XML grammar under both 'xml' and 'html'; using
    // 'html' as the canonical keeps parity with the CDN filename (xml.min.js).
    const LANG_ALIASES = {
        js:    'javascript',
        ts:    'typescript',
        py:    'python',
        rb:    'ruby',
        cs:    'csharp',
        sh:    'bash',
        shell: 'bash',
        yml:   'yaml',
        md:    'markdown',
        htm:   'xml',       // hljs xml grammar lives in xml.min.js; registered as 'html'
        html:  'xml',       //      ''                                      ''
        c:     'c',
        'c++': 'cpp',
    };

    // Languages known to exist on the hljs CDN. Any language NOT in this set
    // produces a console.warn before the import is attempted — catches typos
    // without a silent 404.
    const POPULAR_LANGUAGES = new Set([
        'bash', 'c', 'cpp', 'csharp', 'css', 'dart', 'diff', 'dockerfile',
        'go', 'graphql', 'html', 'ini', 'java', 'javascript', 'json',
        'kotlin', 'less', 'lua', 'makefile', 'markdown', 'modx', 'nginx',
        'objectivec', 'perl', 'php', 'plaintext', 'powershell', 'python',
        'r', 'ruby', 'rust', 'scala', 'scss', 'sql', 'swift', 'toml',
        'typescript', 'vbnet', 'xml', 'yaml',
    ]);

    // Shared caches (global across all instances on the page)
    themestrap._hljs           = null;  // hljs core singleton
    themestrap._hljsLangs      = {};    // { [lang]: true } registration flags
    themestrap._hljsLoading    = {};    // { [lang|'__core__']: Promise } — in-flight coalescing
    themestrap._hljsCoreFailed = 0;     // epoch ms of the last hard core failure (cooldown gate)

    class PluginHighlight {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            // Always operate on a <pre> — normalize before the re-init guard.
            $el = this._normalizePre($el);

            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

            this
                .setData()
                .setOptions(opts)
                .build(); // async, fire-and-forget — build() never rejects (see below)

            return this;
        }

        /**
         * Ensures the working element is a <pre>. When the caller targets a
         * <code> element the plugin walks up to the nearest ancestor <pre>.
         * When the caller targets any other wrapper element the plugin walks
         * down to the first descendant <pre>.
         *
         * Any highlight-related data-* attributes found on the original element
         * are relocated to the <pre> so the plugin reads them from the correct node.
         */
        _normalizePre($el) {
            if ($el.is('pre')) return $el;

            const RELOCATE = [
                'plugin-highlight',
                'plugin-highlight-hljs-config',
                'plugin-highlight-lines',
                'plugin-options',
            ];

            const $pre = $el.is('code')
                ? $el.closest('pre')
                : $el.find('pre').first();

            if (!$pre.length) {
                console.warn('PluginHighlight: no <pre> found relative to the given element. Operating on the element as-is.');
                return $el;
            }

            // Relocate data attrs from the original element to the <pre>
            RELOCATE.forEach(attr => {
                const raw = $el.attr(`data-${attr}`);
                if (raw !== undefined) {
                    $pre.attr(`data-${attr}`, raw);
                    $el.removeAttr(`data-${attr}`);
                }
            });

            // Move id to <pre> when the <pre> has no id of its own
            if ($el.attr('id') && !$pre.attr('id')) {
                $pre.attr('id', $el.attr('id'));
                $el.removeAttr('id');
            }

            return $pre;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            // Standard Themestrap plugin options bag (data-plugin-options)
            const pluginOpts = themestrap.fn.getOptions(
                this.$el.data('plugin-options')
            ) || {};

            // hljs configure object (dedicated attr takes precedence)
            let hljsOptions = {};
            const hljsConfig = themestrap.fn.getOptions(
                this.$el.data('plugin-highlight-hljs-config')
            );
            if (hljsConfig) {
                try {
                    hljsOptions = (typeof hljsConfig === 'string')
                        ? JSON.parse(hljsConfig)
                        : hljsConfig;
                } catch (e) {
                    console.warn('PluginHighlight: invalid JSON in data-plugin-highlight-hljs-config', e);
                }
            }

            // Resolve language — dedicated attr → pluginOpts.language → plaintext
            // Then normalize through the alias map.
            let lang = (
                this.$el.data('plugin-highlight') ||
                pluginOpts.language || ''
            ).toLowerCase().trim();
            lang = LANG_ALIASES[lang] || lang || 'plaintext';

            // Parse pre-highlighted line ranges
            const rawLines = (
                this.$el.data('plugin-highlight-lines') ||
                pluginOpts.highlightLines || ''
            );

            this.options = $.extend(true, {}, PluginHighlight.defaults, pluginOpts, opts, {
                wrapper:        this.$el,
                lang,
                hljsOptions,
                highlightLines: this._parseLineRanges(String(rawLines || '')),
            });

            return this;
        }

        /**
         * Converts a comma-separated string of 1-based line numbers and inclusive
         * ranges into a flat Set<number>.
         *
         *   "1,3,5-8"  →  Set { 1, 3, 5, 6, 7, 8 }
         *   ""         →  Set {}
         */
        _parseLineRanges(raw) {
            const nums = new Set();
            if (!raw.trim()) return nums;

            raw.split(',').forEach(part => {
                part = part.trim();
                if (part.includes('-')) {
                    const [a, b] = part.split('-').map(Number);
                    if (!isNaN(a) && !isNaN(b) && a > 0 && b >= a) {
                        for (let i = a; i <= b; i++) nums.add(i);
                    }
                } else {
                    const n = Number(part);
                    if (!isNaN(n) && n > 0) nums.add(n);
                }
            });

            return nums;
        }

        /**
         * Loads the hljs core singleton. Resolves to the hljs object on success
         * or to `null` on failure (callers degrade to escaped plaintext).
         *
         * Resilience:
         *   - Coalesces concurrent loads onto one promise.
         *   - On failure, EVICTS the in-flight cache entry so the next init can
         *     retry — a transient 502 never poisons the cache for the session.
         *   - After a hard failure, refuses to retry for CORE_COOLDOWN_MS to avoid
         *     a retry storm against a down CDN, then transparently tries again.
         */
        async loadHLJS() {
            if (themestrap._hljs) return themestrap._hljs;

            // Cooldown gate: skip fast (return null) if we failed very recently.
            if (themestrap._hljsCoreFailed &&
                (Date.now() - themestrap._hljsCoreFailed) < CORE_COOLDOWN_MS) {
                return null;
            }

            if (!themestrap._hljsLoading['__core__']) {
                themestrap._hljsLoading['__core__'] = loadModule(HLJS_CORE_URL, { label: 'hljs core' })
                    .then(m => {
                        themestrap._hljs = m.default;
                        themestrap._hljsCoreFailed = 0;     // clear any prior failure
                        return themestrap._hljs;
                    })
                    .catch(err => {
                        // Record the failure window and EVICT so a later init retries.
                        themestrap._hljsCoreFailed = Date.now();
                        delete themestrap._hljsLoading['__core__'];
                        console.warn('PluginHighlight: highlight.js core failed to load — rendering plain code blocks for now.', err?.message || err);
                        return null;                        // graceful, non-throwing
                    });
            }

            return themestrap._hljsLoading['__core__'];
        }

        /**
         * Registers a language grammar. Resolves to `true` when the grammar is
         * available afterwards, `false` otherwise. Never throws.
         *
         * Resilience: failed language imports are evicted from the in-flight
         * cache (so they can be retried), and a failure simply falls the block
         * back to escaped plaintext rather than aborting the whole build.
         */
        async loadLanguage(lang, hljs) {
            if (!hljs) return false;
            if (lang === 'plaintext') return false;   // no grammar needed; escape path handles it
            if (themestrap._hljsLangs[lang]) return true;

            if (!themestrap._hljsLoading[lang]) {
                if (!POPULAR_LANGUAGES.has(lang)) {
                    console.warn(`PluginHighlight: "${lang}" is not in the known-language list and may 404.`);
                }

                const url = (lang === 'modx') ? MODX_LANG_URL : `${HLJS_LANG_BASE}${lang}.min.js`;
                
                themestrap._hljsLoading[lang] = (async () => {
                    // modx requires xml to be registered first
                    if (lang === 'modx' && !themestrap._hljsLangs['xml']) {
                        await loadModule(`${HLJS_LANG_BASE}xml.min.js`, { label: 'language "xml"' })
                            .then(mod => {
                                hljs.registerLanguage('xml', mod.default);
                                themestrap._hljsLangs['xml'] = true;
                            });
                    }
                    if (lang === 'modx' && !themestrap._hljsLangs['json']) {
                        await loadModule(`${HLJS_LANG_BASE}json.min.js`, { label: 'language "json"' })
                            .then(mod => {
                                hljs.registerLanguage('json', mod.default);
                                themestrap._hljsLangs['json'] = true;
                            });
                    }
                    return loadModule(url, { label: `language "${lang}"` })
                        .then(mod => {
                            hljs.registerLanguage(lang, mod.default);
                            themestrap._hljsLangs[lang] = true;
                            return true;
                        })
                        .catch(err => {
                            console.warn(`PluginHighlight: language "${lang}" failed to load — falling back to plaintext.`, err?.message || err);
                            delete themestrap._hljsLoading[lang];
                            return false;
                        });
                })();
            }
            return themestrap._hljsLoading[lang];
        }

        // The whole build is wrapped so that NOTHING here can produce an
        // unhandled promise rejection from the fire-and-forget call in
        // initialize(). Any unexpected error leaves the block untouched.
        async build() {
            try {
                injectStyles();

                const hljs = await this.loadHLJS();          // null on failure
                const langReady = hljs
                    ? await this.loadLanguage(this.options.lang, hljs)
                    : false;

                if (hljs && this.options.hljsOptions && Object.keys(this.options.hljsOptions).length) {
                    try {
                        hljs.configure(this.options.hljsOptions);
                    } catch (e) {
                        console.warn('PluginHighlight: hljs.configure() failed — continuing with defaults.', e);
                    }
                }

                this.instances = [];

                this.$el.each((blockIndex, elem) => {
                    try {
                        const instance = this.buildBlock(elem, blockIndex, hljs, langReady);
                        if (instance) this.instances.push(instance);
                    } catch (e) {
                        console.warn('PluginHighlight: failed to build a code block — left as-is.', e);
                    }
                });

                this.bindGlobalEvents();
                this.handleHash();
            } catch (e) {
                console.warn('PluginHighlight: build() aborted unexpectedly.', e);
                this.instances = this.instances || [];
            }

            return this;
        }

        buildBlock(elem, blockIndex, hljs, langReady) {
            const code  = elem.querySelector('code') || elem;
            const $code = $(code);

            if ($code.hasClass('hljs-ln-done')) return null;
            
            let rawText  = code.textContent;
            const rawLines = rawText.split('\n');

            // Syntax highlight when possible; otherwise render ESCAPED plaintext.
            // Either branch produces HTML-safe markup before touching innerHTML.
            let highlightedHTML;

            const canHighlight = !!hljs && langReady && !!hljs.getLanguage(this.options.lang);

            if (canHighlight) {
                try {
                    const result = hljs.highlight(rawText, {
                        language: this.options.lang,
                        ignoreIllegals: true,
                    });
                    highlightedHTML = result.value;            // already escaped by hljs
                    $code.addClass(`hljs language-${this.options.lang}`);
                } catch (e) {
                    console.warn('PluginHighlight: hljs.highlight() threw — rendering escaped plaintext.', e);
                    highlightedHTML = escapeHtml(rawText);
                    $code.addClass('hljs');
                }
            } else {
                highlightedHTML = escapeHtml(rawText);          // never inject raw text
                $code.addClass('hljs');                         // keep base styling/background
            }

            code.innerHTML = highlightedHTML;

            // Split on newlines — both raw (for copy) and highlighted (for display)
            let htmlLines = code.innerHTML.split('\n');

            // Strip the trailing empty entry produced by a closing newline in source
            if (htmlLines.at(-1)?.trim() === '') {
                htmlLines.pop();
                rawLines.pop();
            }

            const blockId = elem.id || `codeblock-${blockIndex + 1}`;
            elem.id = blockId;

            const lineRefs = [];

            // Line numbers 
            if (this.options.lineNumbers) {
                const $wrap  = $('<div class="hljs-ln-wrapper"/>');
                const $nums  = $('<div class="hljs-ln-numbers"/>');
                const $lines = $('<div class="hljs-ln-code"/>');

                htmlLines.forEach((lineHTML, i) => {
                    const lineNumber = i + 1;
                    const anchorId   = `${blockId}-L${lineNumber}`;
                    const isMarked   = this.options.highlightLines.has(lineNumber);

                    const $num  = $(`<div class="hljs-ln-number${isMarked ? ' hljs-ln-highlight-num' : ''}" role="button" tabindex="0">${lineNumber}</div>`);
                    const $line = $('<div class="hljs-ln-line"></div>');

                    $line.attr('id', anchorId);
                    $line.html(lineHTML || '&nbsp;');

                    if (isMarked) $line.addClass('hljs-ln-highlight-line');

                    lineRefs.push($line[0]);

                    $num.on('mousedown', (e) => {
                        e.preventDefault();
                        this.startSelection(blockId, i);
                    });

                    $num.on('mouseenter', () => {
                        this.updateSelection(blockId, i);
                    });

                    $nums.append($num);
                    $lines.append($line);
                });

                $wrap.append($nums, $lines);
                $code.empty().append($wrap).addClass('hljs-ln-done');
            }

            // Copy button
            if (this.options.showCopy) {
                const $copyBtn = $('<button class="btn btn-modern btn-light btn-outline btn-xs btn-effect-1 hljs-copy-corner hljs-copy-btn">Copy</button>');

                $copyBtn.on('click', async () => {
                    const ok = await this.copy(rawText);
                    $copyBtn.text(ok ? 'Copied!' : 'Copy failed');
                    if (ok) {
                        setTimeout(() => {
                            themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                        }, this.options.copyTimeout);
                    }
                    setTimeout(() => $copyBtn.text('Copy'), this.options.copyTimeout);
                });

                $(elem).css('position', 'relative').append($copyBtn);
            }

            return { blockId, rawLines, lineRefs, selection: [], selecting: false, start: null };
        }

        bindGlobalEvents() {
            $(document).off('mouseup.highlight').on('mouseup.highlight', async () => {
                for (const inst of this.instances) {
                    if (!inst.selecting) continue;

                    inst.selecting = false;

                    const text = inst.selection
                        .map(el => el.textContent)
                        .join('\n');

                    if (text.trim()) {
                        const ok = await this.copy(text);
                        if (ok) {
                            setTimeout(() => {
                                themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                            }, this.options.copyTimeout);
                        }
                    }
                }
            });

            $(window).off('hashchange.highlight')
                .on('hashchange.highlight', () => this.handleHash());
        }

        startSelection(blockId, index) {
            const inst = this.instances.find(i => i.blockId === blockId);
            if (!inst) return;

            inst.selecting = true;
            inst.start     = index;

            this.clearSelection(inst);
            this.applySelection(inst, index, index);
        }

        updateSelection(blockId, index) {
            const inst = this.instances.find(i => i.blockId === blockId);
            if (!inst || !inst.selecting) return;
            this.applySelection(inst, inst.start, index);
        }

        applySelection(inst, start, end) {
            this.clearSelection(inst);
            const [min, max] = [start, end].sort((a, b) => a - b);

            for (let i = min; i <= max; i++) {
                const el = inst.lineRefs[i];
                if (!el) continue;
                el.classList.add('hljs-ln-selected');
                inst.selection.push(el);
            }
        }

        clearSelection(inst) {
            inst.selection.forEach(el => el.classList.remove('hljs-ln-selected'));
            inst.selection = [];
        }

        // Returns true on success, false on failure (both clipboard paths covered).
        async copy(text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
                throw new Error('clipboard API unavailable');
            } catch {
                // Fallback for older browsers / non-HTTPS contexts
                try {
                    const $ta = $('<textarea/>')
                        .val(text)
                        .css({ position: 'fixed', top: '-1000px', opacity: 0 })
                        .appendTo('body');
                    $ta[0].select();
                    const ok = document.execCommand('copy');
                    $ta.remove();
                    return ok;
                } catch (e) {
                    console.warn('PluginHighlight: copy to clipboard failed.', e);
                    return false;
                }
            }
        }
        
        highlightBackticks(input, hljs) {
            return input.replace(/`([^`]*?)`/g, (fullMatch, content) => {
                const trimmed = content.trim();
        
                let language = "xml";
                if (this.isJson(trimmed)) {
                    language = "json";
                } else if (this.isModx(trimmed)) {
                    language = "modx";
                }
        
                return "`" + hljs.highlight(trimmed, { language }).value + "`";
            });
        }
        
        isJson(value) {
            if (typeof value !== "string") return false;
        
            // Accept either the raw backtick-delimited value or just the contents.
            const match = value.match(/^`([\s\S]*)`$/);
            const content = (match ? match[1] : value).trim();
        
            if (!content || !/^[\[{]/.test(content)) {
                return false;
            }
        
            try {
                JSON.parse(content);
                return true;
            } catch {
                return false;
            }
        }
        
        isModx(value) {
            if (typeof value !== "string") return false;
        
            // Accept either the raw backtick-delimited value or just the contents.
            const match = value.match(/^`([\s\S]*)`$/);
            const content = (match ? match[1] : value).trim();
        
            if (!content || !/^[\[\[]]/.test(content)) {
                return false;
            } else {
                return true;
            }
        }

        handleHash() {
            this.$el.find('.hljs-ln-highlight').removeClass('hljs-ln-highlight');

            const hash = window.location.hash.replace('#', '');
            if (!hash) return;

            const target = document.getElementById(hash);
            if (target) {
                target.classList.add('hljs-ln-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        destroy() {
            $(document).off('mouseup.highlight');
            $(window).off('hashchange.highlight');
            this.$el.removeData(instanceName);
            return this;
        }
    }

    // Do NOT include Set/Map values here — $.extend(true, …) cannot deep-clone
    // them. highlightLines is always set by setOptions() as a fresh Set.
    PluginHighlight.defaults = {
        language:    '',
        theme:       'atom-one-dark',
        lineNumbers: true,
        showCopy:    true,
        copyTimeout: 800,
    };

    $.extend(themestrap, { PluginHighlight });

    $.fn.themestrapPluginHighlight = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginHighlight($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// Toast
(((themestrap = {}, $) => {
    const instanceName = '__toast';

    // Container registry
    // â€” one container div per position, lazily created.
    const containers = {};

    function getContainer(position) {
        if (containers[position]) return containers[position];

        const [y, x] = position.split('-');   // e.g. 'top-end' â†’ ['top', 'end']

        const yClass = {
            top:    'top-0',
            middle: 'top-50 translate-middle-y',
            bottom: 'bottom-0',
        }[y] ?? 'top-0';

        const xClass = {
            start:  'start-0',
            center: 'start-50 translate-middle-x',
            end:    'end-0',
        }[x] ?? 'end-0';

        const $c = $(`<div class="toast-container position-fixed p-3 ${yClass} ${xClass}" />`);
        $c.css('z-index', 1090);
        $('body').append($c);

        containers[position] = $c;
        return $c;
    }

    // Icon map â€” Bootstrap icon SVG paths keyed by toast type.
    const typeIcons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" stroke="#0088cc"></path><path d="M9 12l2 2l4 -4" stroke="#777"></path></g></svg>`,
        danger:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" stroke="#0088cc"></path><path d="M12 8v4" stroke="#777"></path><path d="M12 16h.01" stroke="#777"></path></g></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M12 9v4" stroke="#777"></path><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0" stroke="#0088cc"></path><path d="M12 16h.01" stroke="#777"></path></g></svg>`,
        info:    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" stroke="#0088cc"></path><path d="M12 9h.01" stroke="#777"></path><path d="M11 12h1v4h1" stroke="#777"></path></g></svg>`,
        dark:    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"></path></g></svg>`,
        light:   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#0088cc"><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" stroke="#0088cc"></path><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" stroke="#777"></path></g></svg>`,
    };

    // Header colour map: Bootstrap contextual text + bg combos for the
    // icon/title row, keeping the body neutral white.
    const typeHeaderClass = {
        success: 'text-success',
        danger:  'text-danger',
        warning: 'text-warning',
        info:    'text-info',
        dark:    'text-dark',
        light:   'text-secondary',
    };

    class PluginToast {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            this.$el = $el;

            if ($el.data(instanceName)) {
                return $el.data(instanceName);
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
            const attrOpts = themestrap.fn.getOptions(this.$el.data('plugin-toast-options'));

            this.options = $.extend(true, {}, PluginToast.defaults, opts, attrOpts, {
                // Inline data attributes win over everything else.
                title:    this.$el.data('plugin-toast-title')    ?? (opts?.title    ?? PluginToast.defaults.title),
                body:     this.$el.data('plugin-toast-body')     ?? (opts?.body     ?? PluginToast.defaults.body),
                type:     this.$el.data('plugin-toast-type')     ?? (opts?.type     ?? PluginToast.defaults.type),
                position: this.$el.data('plugin-toast-position') ?? (opts?.position ?? PluginToast.defaults.position),
                delay:    this.$el.data('plugin-toast-delay')    ?? (opts?.delay    ?? PluginToast.defaults.delay),
                autohide: this.$el.data('plugin-toast-autohide') ?? (opts?.autohide ?? PluginToast.defaults.autohide),
                progress: this.$el.data('plugin-toast-progress') ?? (opts?.progress ?? PluginToast.defaults.progress),
                icon:     this.$el.data('plugin-toast-icon')     ?? (opts?.icon     ?? null),
            });

            return this;
        }

        build() {
            const self = this;
            const o    = self.options;

            const icon = o.icon
                ? `<img src="${o.icon}" width="16" height="16" alt="" />`
                : (typeIcons[o.type] ?? '');

            const headerClass = typeHeaderClass[o.type] ?? '';

            const timestamp = o.timestamp
                ? `<small class="text-body-secondary ms-auto">${o.timestamp}</small>`
                : '';

            const progress = o.autohide && o.progress
                ? `<div class="hljs-toast-progress"><div class="hljs-toast-progress-bar"></div></div>`
                : '';

            const $toast = $(`
                <div class="toast align-items-stretch border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header ${headerClass}">
                        <span class="me-2 d-flex">${icon}</span>
                        <strong class="me-auto">${o.title}</strong>
                        ${timestamp}
                        ${o.dismissible ? '<button type="button" class="btn-close ms-2" data-bs-dismiss="toast" aria-label="Close"></button>' : ''}
                    </div>
                    <div class="toast-body">${o.body}</div>
                    ${progress}
                </div>
            `);

            const $container = getContainer(o.position);
            $container.append($toast);

            // Bootstrap 5 native Toast instance
            const bsToast = new bootstrap.Toast($toast[0], {
                autohide: o.autohide,
                delay:    o.delay,
            });

            // Progress bar animation â€” shrinks width over `delay` ms.
            if (o.autohide && o.progress) {
                const $bar = $toast.find('.toast-progress-bar');
                // Reset then animate on next tick so the transition fires.
                $bar.css('transition', 'none').css('width', '100%');
                requestAnimationFrame(() => {
                    $bar.css('transition', `width ${o.delay}ms linear`).css('width', '0%');
                });
            }

            // Pause progress & autohide on hover.
            if (o.autohide && o.progress) {
                $toast.on('mouseenter', () => {
                    $toast.find('.toast-progress-bar').css('transition', 'none');
                    bsToast._clearTimeout?.();  // Bootstrap internal â€” gracefully no-ops if absent.
                }).on('mouseleave', () => {
                    bsToast.show();             // Re-arms the autohide timer.
                });
            }

            // Remove from DOM after Bootstrap fires hidden event.
            $toast[0].addEventListener('hidden.bs.toast', () => {
                $toast.remove();
                // Clean up empty container.
                if ($container.children().length === 0) {
                    $container.remove();
                    delete containers[o.position];
                }
                self.$el.removeData(instanceName);
                if (typeof o.onHidden === 'function') o.onHidden.call(self);
            });

            $toast[0].addEventListener('shown.bs.toast', () => {
                if (typeof o.onShown === 'function') o.onShown.call(self);
            });

            self.$toast  = $toast;
            self._bsToast = bsToast;

            bsToast.show();

            return this;
        }

        hide() {
            this._bsToast?.hide();
            return this;
        }

        dispose() {
            this._bsToast?.dispose();
            this.$el.removeData(instanceName);
            return this;
        }

        // Fire-and-forget: PluginToast.show({ title: 'â€¦', body: 'â€¦', type: 'success' })
        // No element needed â€” mounts to a detached anchor appended to body.
        static show(opts) {
            const $anchor = $('<div />').appendTo('body').hide();
            return new PluginToast($anchor, opts);
        }
    }

    PluginToast.defaults = {
        title:       'Notification',
        body:        '',
        type:        'info',            // success | danger | warning | info | dark | light
        position:    'top-end',         // {top|middle|bottom}-{start|center|end}
        autohide:    true,
        delay:       4000,
        dismissible: true,
        progress:    true,              // animated countdown bar (requires autohide: true)
        timestamp:   null,             // string shown in header right (e.g. 'just now')
        onShown:     null,
        onHidden:    null,
        icon:        null,             // custom img src; falls back to type icon SVG
    };

    $.extend(themestrap, { PluginToast });

    $.fn.themestrapPluginToast = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginToast($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// Scroll Shadow
(((themestrap = {}, $) => {

    const instanceName = '__pluginScrollShadow';

    // injected once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-scroll-shadow-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
/* Themestrap â€” PluginScrollShadow */
.ts-scroll-shadow {
    --ts-ss-size:    40px;
    --ts-ss-color:   black;   /* mask fades toward transparent  */
    position: relative;
    overflow: auto;
    /* Mask compositing shorthand â€” overridden by state classes  */
    -webkit-mask-image: none;
    mask-image:         none;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
}

/* top edge only visible  â†’ fade bottom */
.ts-scroll-shadow[data-orientation="vertical"].ts-ss--bottom,
.ts-scroll-shadow:not([data-orientation]).ts-ss--bottom {
    -webkit-mask-image:
        linear-gradient(to bottom,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to bottom,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

/* bottom edge only visible â†’ fade top */
.ts-scroll-shadow[data-orientation="vertical"].ts-ss--top,
.ts-scroll-shadow:not([data-orientation]).ts-ss--top {
    -webkit-mask-image:
        linear-gradient(to top,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to top,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

/* both top and bottom overflow â†’ fade both ends */
.ts-scroll-shadow[data-orientation="vertical"].ts-ss--top.ts-ss--bottom,
.ts-scroll-shadow:not([data-orientation]).ts-ss--top.ts-ss--bottom {
    -webkit-mask-image:
        linear-gradient(to bottom,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to bottom,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

.ts-scroll-shadow[data-orientation="horizontal"].ts-ss--right {
    -webkit-mask-image:
        linear-gradient(to right,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to right,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

.ts-scroll-shadow[data-orientation="horizontal"].ts-ss--left {
    -webkit-mask-image:
        linear-gradient(to left,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to left,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

.ts-scroll-shadow[data-orientation="horizontal"].ts-ss--left.ts-ss--right {
    -webkit-mask-image:
        linear-gradient(to right,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to right,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

/* Vertical faces only â€” reuse vertical rules above for :not([data-orientation]) */
.ts-scroll-shadow[data-orientation="both"].ts-ss--bottom:not(.ts-ss--top):not(.ts-ss--left):not(.ts-ss--right) {
    -webkit-mask-image:
        linear-gradient(to bottom,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to bottom,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}
.ts-scroll-shadow[data-orientation="both"].ts-ss--top:not(.ts-ss--bottom):not(.ts-ss--left):not(.ts-ss--right) {
    -webkit-mask-image:
        linear-gradient(to top,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to top,
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}
.ts-scroll-shadow[data-orientation="both"].ts-ss--top.ts-ss--bottom:not(.ts-ss--left):not(.ts-ss--right) {
    -webkit-mask-image:
        linear-gradient(to bottom,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
    mask-image:
        linear-gradient(to bottom,
            transparent 0%,
            var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)),
            transparent 100%
        );
}

/* When BOTH axes are in play â€” compose with a two-gradient mask */
.ts-scroll-shadow[data-orientation="both"].ts-ss--top.ts-ss--bottom.ts-ss--left.ts-ss--right {
    -webkit-mask-image:
        linear-gradient(to bottom,
            transparent 0%, var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%
        ),
        linear-gradient(to right,
            transparent 0%, var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%
        );
    mask-image:
        linear-gradient(to bottom,
            transparent 0%, var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%
        ),
        linear-gradient(to right,
            transparent 0%, var(--ts-ss-color) var(--ts-ss-size),
            var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%
        );
    -webkit-mask-composite: destination-in;
    mask-composite: intersect;
    -webkit-mask-size: 100% 100%, 100% 100%;
    mask-size: 100% 100%, 100% 100%;
}

/* Partial two-axis variants */
.ts-scroll-shadow[data-orientation="both"].ts-ss--bottom.ts-ss--left.ts-ss--right:not(.ts-ss--top) {
    -webkit-mask-image:
        linear-gradient(to bottom, var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%),
        linear-gradient(to right, transparent 0%, var(--ts-ss-color) var(--ts-ss-size), var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%);
    mask-image:
        linear-gradient(to bottom, var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%),
        linear-gradient(to right, transparent 0%, var(--ts-ss-color) var(--ts-ss-size), var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%);
    -webkit-mask-composite: destination-in;
    mask-composite: intersect;
    -webkit-mask-size: 100% 100%, 100% 100%;
    mask-size: 100% 100%, 100% 100%;
}
.ts-scroll-shadow[data-orientation="both"].ts-ss--top.ts-ss--left.ts-ss--right:not(.ts-ss--bottom) {
    -webkit-mask-image:
        linear-gradient(to top, var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%),
        linear-gradient(to right, transparent 0%, var(--ts-ss-color) var(--ts-ss-size), var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%);
    mask-image:
        linear-gradient(to top, var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%),
        linear-gradient(to right, transparent 0%, var(--ts-ss-color) var(--ts-ss-size), var(--ts-ss-color) calc(100% - var(--ts-ss-size)), transparent 100%);
    -webkit-mask-composite: destination-in;
    mask-composite: intersect;
    -webkit-mask-size: 100% 100%, 100% 100%;
    mask-size: 100% 100%, 100% 100%;
}
`;
        document.head.appendChild(style);
    }

    class PluginScrollShadow {

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
            this.options = $.extend(true, {}, PluginScrollShadow.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            // Apply base class + orientation attribute
            $el.addClass('ts-scroll-shadow');

            if (options.orientation) {
                $el.attr('data-orientation', options.orientation);
            }

            // Apply CSS custom properties from options
            if (options.size !== PluginScrollShadow.defaults.size) {
                $el.css('--ts-ss-size', options.size);
            }
            if (options.color !== PluginScrollShadow.defaults.color) {
                $el.css('--ts-ss-color', options.color);
            }

            if (!options.isEnabled) {
                return this;
            }

            // Build a ResizeObserver to recalculate when the container resizes
            if (typeof ResizeObserver !== 'undefined') {
                self._resizeObserver = new ResizeObserver(() => {
                    self._updateShadows();
                });
                self._resizeObserver.observe($el[0]);
            }

            // Initial calculation
            self._updateShadows();

            return this;
        }

        events() {
            const self = this;

            self.$el.on('scroll.scrollshadow', () => {
                self._updateShadows();
            });

            return this;
        }

        /**
         * Measures the element's scroll state and toggles the four shadow
         * edge classes accordingly.
         *
         * State classes added to the wrapper element:
         *   .ts-ss--top     â€” content above the visible area
         *   .ts-ss--bottom  â€” content below the visible area
         *   .ts-ss--left    â€” content to the left
         *   .ts-ss--right   â€” content to the right
         */
        _updateShadows() {
            const self    = this;
            const el      = self.$el[0];
            const options = self.options;
            const offset  = options.offset;

            if (!options.isEnabled) {
                self.$el.removeClass('ts-ss--top ts-ss--bottom ts-ss--left ts-ss--right');
                return;
            }

            const scrollTop   = el.scrollTop;
            const scrollLeft  = el.scrollLeft;
            const scrollableY = el.scrollHeight - el.clientHeight;
            const scrollableX = el.scrollWidth  - el.clientWidth;

            const orientation = options.orientation;
            const trackV = orientation === 'vertical' || orientation === 'both' || !orientation;
            const trackH = orientation === 'horizontal' || orientation === 'both';

            self.$el
                .toggleClass('ts-ss--top',    trackV && scrollTop > offset)
                .toggleClass('ts-ss--bottom',  trackV && scrollTop < scrollableY - offset)
                .toggleClass('ts-ss--left',    trackH && scrollLeft > offset)
                .toggleClass('ts-ss--right',   trackH && scrollLeft < scrollableX - offset);
        }

        /**
         * Force a shadow recalculation â€” useful when the container's content
         * changes programmatically.
         */
        update() {
            this._updateShadows();
            return this;
        }

        /**
         * Enable or disable shadows without destroying the plugin instance.
         * @param {boolean} state
         */
        setEnabled(state) {
            this.options.isEnabled = !!state;
            this._updateShadows();
            return this;
        }

        destroy() {
            const self = this;

            self.$el.off('.scrollshadow');

            if (self._resizeObserver) {
                self._resizeObserver.disconnect();
                self._resizeObserver = null;
            }

            self.$el
                .removeClass('ts-scroll-shadow ts-ss--top ts-ss--bottom ts-ss--left ts-ss--right')
                .removeAttr('data-orientation')
                .css({
                    '--ts-ss-size':  '',
                    '--ts-ss-color': ''
                })
                .removeData(instanceName);

            return this;
        }

    }

    PluginScrollShadow.defaults = {
        /**
         * Scroll axis to track.
         * 'vertical'   â€” top / bottom shadows (default)
         * 'horizontal' â€” left / right shadows
         * 'both'       â€” all four edges
         */
        orientation: 'vertical',

        /**
         * Shadow feather size. Maps to --ts-ss-size CSS custom property.
         * Accepts any CSS length string: '40px', '3rem', '10%', etc.
         */
        size: '40px',

        /**
         * Mask color. The gradient fades from this value to transparent.
         * Use a named color or any valid CSS <color>. 'black' is the
         * correct value for mask-image use â€” do NOT pass rgba() here
         * unless you want a semi-transparent mask at the centre.
         * Maps to --ts-ss-color CSS custom property.
         */
        color: 'black',

        /**
         * Pixel threshold before shadows appear. Adds a small "dead zone"
         * so a 1px rounding error doesn't falsely trigger a shadow.
         */
        offset: 2,

        /**
         * Set to false to disable all shadow rendering while keeping the
         * plugin instance alive. Useful for toggling based on viewport size.
         */
        isEnabled: true
    };

    $.extend(themestrap, { PluginScrollShadow });

    $.fn.themestrapPluginScrollShadow = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginScrollShadow($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Dialog Plugin
 * Accessible, focus-trapped dialogs with backdrop, scroll-lock, and transition support.
 * Part of the Themestrap component library for MODX 3
 * 
 * Markup anatomy:
 * 
 *   <!-- Trigger (anywhere in the DOM) -->
 *   <button data-dialog-open="payment-dialog">Open</button>
 * 
 *   <!-- Dialog root -->
 *   <div data-plugin-dialog id="payment-dialog"
 *        data-plugin-options='{"animationIn": "fadeInDown", "closeOnBackdrop": true}'>
 * 
 *     <!-- Backdrop: click-to-close overlay -->
 *     <div data-dialog-backdrop></div>
 * 
 *     <!-- Panel: the visible card -->
 *     <div data-dialog-panel>
 * 
 *       <!-- Title & description wired to ARIA automatically -->
 *       <h2 data-dialog-title>Confirm Payment</h2>
 *       <p data-dialog-description>Review the details below before confirming.</p>
 * 
 *       <!-- Any content here -->
 * 
 *       <!-- Dedicated close trigger(s) inside the panel -->
 *       <button data-dialog-close>Cancel</button>
 *       <button data-dialog-close>Confirm</button>
 *     </div>
 *   </div>
 * 
 * Public API (via stored instance):
 *   const dlg = $('#payment-dialog').data('__pluginDialog');
 *   dlg.open();
 *   dlg.close();
 *   dlg.toggle();
 * 
 * Events fired on the dialog root element:
 *   dialog:open   â€” after open animation starts   (receives instance as arg)
 *   dialog:close  â€” after close animation ends     (receives instance as arg)
 * 
 * Init.js wiring (DOMReady-immediate â€” dialogs must be ready before any trigger fires):
 *   if ($.isFunction($.fn['themestrapPluginDialog']) && $('[data-plugin-dialog]').length) {
 *       $(() => {
 *           $('[data-plugin-dialog]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginDialog(opts);
 *           });
 *       });
 *   }  
 */
// Dialog
(((themestrap = {}, $) => {
    const instanceName = '__pluginDialog';

    // Scrollbar width measurement
    // Runs once when the plugin file loads. Measures the native scrollbar width
    // and stores it as --dialog-scrollbar-width on <html> so that
    // body.dialog-scroll-lock { padding-right: var(--dialog-scrollbar-width) }
    // can compensate exactly, preventing any layout shift when the dialog opens.
    //
    // Wrapped in a DOMContentLoaded guard so the script is safe to load from
    // <head> as well as before </body>.
    (function measureScrollbarWidth() {
        function measure() {
            const outer = document.createElement('div');
            outer.style.cssText = 'visibility:hidden;overflow:scroll;position:absolute;width:100px';
            document.body.appendChild(outer);
            const width = outer.offsetWidth - outer.clientWidth;
            document.body.removeChild(outer);
            document.documentElement.style.setProperty('--dialog-scrollbar-width', width + 'px');
        }

        if (document.body) {
            // Body is already available (script loaded before </body> as normal)
            measure();
        } else {
            // Script loaded in <head> — defer until the body exists
            document.addEventListener('DOMContentLoaded', measure, { once: true });
        }
    })();

    // Focusable selector (ARIA-compliant set)
    const FOCUSABLE = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ].join(', ');

    // generate a short collision-resistant ID
    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;
    
    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-dialog-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `/**
 * PluginDialog — Themestrap Dialog Styles
 *
 * Structure expected:
 * .dialog-root                    ← [data-plugin-dialog] — full-screen container
 * ├── [data-dialog-backdrop]      ← dim overlay
 * └── [data-dialog-panel]         ← visible card / content region
 *     ├── [data-dialog-title]
 *     ├── [data-dialog-description]
 *     └── …content…
 *
 * State classes (toggled by the plugin):
 * .dialog-root.dialog-hidden      ← closed (display:none equivalent via CSS)
 * .dialog-root.dialog-is-open     ← open
 * body.dialog-scroll-lock         ← scroll disabled while a dialog is open
 */
.dialog-root {
    position: fixed;
    inset: 0;                  /* top/right/bottom/left: 0 */
    z-index: 1060;             /* above Bootstrap modals (1055) */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;

    /* Hidden state — plugin toggles this class */
    &.dialog-hidden {
        display: none;
        pointer-events: none;
        visibility: hidden;
    }
}

[data-dialog-backdrop] {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);

    /* Fade in with the dialog */
    .dialog-is-open & {
        animation: dialogBackdropIn 0.2s ease forwards;
    }
}

@keyframes dialogBackdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}

[data-dialog-panel] {
    position: relative;         /* sit above backdrop */
    z-index: 1;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.25),
        0 4px  12px rgba(0, 0, 0, 0.12);
    padding: 2rem;
    width: 100%;
    max-width: 32rem;           /* ~512px — override with data-plugin-options if needed */
    max-height: calc(100vh - 4rem);
    overflow-y: auto;

    /* Scrollbar styling (WebKit) */
    scrollbar-width: thin;
    &::-webkit-scrollbar       { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 2px; }
}

[data-dialog-title] {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: inherit;
}

[data-dialog-description] {
    font-size: 0.9375rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

body.dialog-scroll-lock {
    overflow: hidden;
    /* Prevent layout shift from scrollbar disappearing */
    padding-right: var(--dialog-scrollbar-width, 0px);
}

/* The plugin adds these classes to [data-dialog-panel].
   Uses Animate.css-style naming so Themestrap's existing
   animationIn/Out options work with zero extra CSS.               */
@keyframes dialogFadeIn {
    from { opacity: 0; transform: scale(0.97) translateY(-6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes dialogFadeOut {
    from { opacity: 1; transform: scale(1)    translateY(0); }
    to   { opacity: 0; transform: scale(0.97) translateY(-6px); }
}

[data-dialog-panel].fadeIn  { animation: dialogFadeIn  0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-dialog-panel].fadeOut { animation: dialogFadeOut 0.2s  ease-in                        forwards; }

@keyframes dialogFadeInDown {
    from { opacity: 0; transform: translateY(-24px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes dialogFadeOutUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-24px); }
}

[data-dialog-panel].fadeInDown { animation: dialogFadeInDown 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-dialog-panel].fadeOutUp  { animation: dialogFadeOutUp  0.2s  ease-in                        forwards; }

@keyframes dialogFadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes dialogFadeOutDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(24px); }
}

[data-dialog-panel].fadeInUp   { animation: dialogFadeInUp   0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-dialog-panel].fadeOutDown{ animation: dialogFadeOutDown 0.2s  ease-in                        forwards; }

@keyframes dialogZoomIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
}

@keyframes dialogZoomOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(0.85); }
}

[data-dialog-panel].zoomIn  { animation: dialogZoomIn  0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
[data-dialog-panel].zoomOut { animation: dialogZoomOut 0.18s ease-in                            forwards; }

@media (max-width: 575.98px) {
    .dialog-root {
        align-items: flex-end;
        padding: 0;
    }

    [data-dialog-panel] {
        border-radius: 1rem 1rem 0 0;
        max-width: 100%;
        max-height: 92vh;
        padding: 1.5rem 1.25rem 2rem;
    }

    /* Override panel animations with a sheet-style slide-up on mobile */
    [data-dialog-panel].fadeIn,
    [data-dialog-panel].fadeInDown,
    [data-dialog-panel].fadeInUp,
    [data-dialog-panel].zoomIn {
        animation: dialogFadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    [data-dialog-panel].fadeOut,
    [data-dialog-panel].fadeOutUp,
    [data-dialog-panel].fadeOutDown,
    [data-dialog-panel].zoomOut {
        animation: dialogFadeOutDown 0.2s ease-in forwards;
    }
}

/* Add .dialog-sm / .dialog-lg / .dialog-xl / .dialog-full to [data-dialog-panel] */
[data-dialog-panel].dialog-sm   { max-width: 22rem; }
[data-dialog-panel].dialog-lg   { max-width: 48rem; }
[data-dialog-panel].dialog-xl   { max-width: 64rem; }
[data-dialog-panel].dialog-full {
    max-width: calc(100vw - 2rem);
    max-height: calc(100vh - 2rem);
    width: 100%;
}

/* Add .dialog-alert to [data-plugin-dialog] for a compact centered alert. */
.dialog-alert [data-dialog-panel] {
    text-align: center;
    padding: 2.5rem 2rem;
    max-width: 26rem;
}

.dialog-alert [data-dialog-title] {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
}

@media (prefers-color-scheme: dark) {
    [data-dialog-panel] {
        background: #1e2939;
        color: #f3f4f6;
        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.55),
            0 4px  12px rgba(0, 0, 0, 0.3);
    }

    [data-dialog-description] {
        color: #9ca3af;
    }
}
`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginDialog {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el            = $el;
            this.$previousFocus = null;
            this.isOpen         = false;
            this._uid           = uid('dialog');

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
            this.options = $.extend(true, {}, PluginDialog.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // ARIA role / modal flag
            if (!$el.attr('role')) $el.attr('role', 'dialog');
            $el.attr('aria-modal', 'true');

            // Auto-wire title → aria-labelledby
            const $title = $el.find('[data-dialog-title]').first();
            if ($title.length && !$el.attr('aria-labelledby')) {
                const id = $title.attr('id') || uid('dialog-title');
                $title.attr('id', id);
                $el.attr('aria-labelledby', id);
            }

            // Auto-wire description → aria-describedby
            const $desc = $el.find('[data-dialog-description]').first();
            if ($desc.length && !$el.attr('aria-describedby')) {
                const id = $desc.attr('id') || uid('dialog-desc');
                $desc.attr('id', id);
                $el.attr('aria-describedby', id);
            }

            // Ensure a backdrop element exists when option is on
            if (opts.backdrop) {
                self.$backdrop = $el.find('[data-dialog-backdrop]');
                if (!self.$backdrop.length) {
                    self.$backdrop = $('<div data-dialog-backdrop></div>');
                    $el.prepend(self.$backdrop);
                }
            }

            // Grab the panel (content card) — may be absent for simple dialogs
            self.$panel = $el.find('[data-dialog-panel]');

            // Hidden by default — use CSS class rather than inline style so
            // theme CSS retains full control of transitions.
            $el
                .addClass('dialog-root')
                .attr('aria-hidden', 'true')
                .attr('tabindex', '-1');

            if (!$el.hasClass('dialog-is-open')) {
                $el.addClass('dialog-hidden');
            }

            return this;
        }

        events() {
            const self     = this;
            const $el      = self.$el;
            const opts     = self.options;
            const dialogId = $el.attr('id');

            // External trigger buttons (open)
            if (dialogId) {
                $(document).on(
                    `click.dialog.${self._uid}`,
                    `[data-dialog-open="${dialogId}"]`,
                    function (e) {
                        e.preventDefault();
                        self.open();
                    }
                );
            }

            // Internal close buttons
            $el.on('click.dialog', '[data-dialog-close]', function (e) {
                e.preventDefault();
                self.close();
            });

            // Backdrop click to close
            if (opts.closeOnBackdrop && self.$backdrop && self.$backdrop.length) {
                $el.on('click.dialog.backdrop', function (e) {
                    if ($(e.target).is('[data-dialog-backdrop]')) {
                        self.close();
                    }
                });
            }

            // Escape key (document-level, scoped to this instance)
            if (opts.closeOnEscape) {
                $(document).on(`keydown.dialog.${self._uid}`, function (e) {
                    if (self.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                        e.preventDefault();
                        self.close();
                    }
                });
            }

            return this;
        }

        open() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (self.isOpen) return this;
            self.isOpen = true;

            // Remember where focus was so we can restore it on close
            self.$previousFocus = $(document.activeElement);

            // Scroll lock: add class to <body>.
            // CSS rule:  body.dialog-scroll-lock { overflow: hidden; padding-right: var(--dialog-scrollbar-width, 0px); }
            // The padding-right compensates for the scrollbar disappearing, preventing layout shift.
            if (opts.scrollLock) {
                $('body').addClass('dialog-scroll-lock');
            }

            // Reveal
            $el
                .removeClass('dialog-hidden')
                .addClass('dialog-is-open')
                .attr('aria-hidden', 'false');

            // Panel-level entrance animation
            const $animTarget = self.$panel.length ? self.$panel : $el;
            if (opts.animationIn) {
                $animTarget
                    .addClass(`dialog-anim-enter ${opts.animationIn}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`dialog-anim-enter ${opts.animationIn}`);
                    });

                setTimeout(() => {
                    $animTarget.removeClass(`dialog-anim-enter ${opts.animationIn}`);
                }, opts.animationDuration + 50);
            }

            // Focus management
            setTimeout(() => self._focusFirst(), 50);

            // Focus trap: intercept Tab / Shift+Tab
            $el.on('keydown.dialog.trap', (e) => {
                if (e.key === 'Tab' || e.keyCode === 9) {
                    self._trapFocus(e);
                }
            });

            // Callback & event
            if (typeof opts.onOpen === 'function') opts.onOpen.call(self, $el);
            $el.trigger('dialog:open', [self]);

            return this;
        }

        close() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return this;

            $el.off('keydown.dialog.trap');

            const $animTarget = self.$panel.length ? self.$panel : $el;

            if (opts.animationOut) {
                $animTarget
                    .addClass(`dialog-anim-leave ${opts.animationOut}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`dialog-anim-leave ${opts.animationOut}`);
                        self._finishClose();
                    });

                setTimeout(() => {
                    $animTarget.removeClass(`dialog-anim-leave ${opts.animationOut}`);
                    self._finishClose();
                }, opts.animationDuration + 50);
            } else {
                self._finishClose();
            }

            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        _finishClose() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return;
            self.isOpen = false;

            $el
                .addClass('dialog-hidden')
                .removeClass('dialog-is-open')
                .attr('aria-hidden', 'true');

            if (opts.scrollLock) {
                $('body').removeClass('dialog-scroll-lock');
            }

            // Restore focus to the element that opened the dialog
            if (self.$previousFocus && self.$previousFocus.length) {
                self.$previousFocus.trigger('focus');
                self.$previousFocus = null;
            }

            if (typeof opts.onClose === 'function') opts.onClose.call(self, $el);
            $el.trigger('dialog:close', [self]);
        }

        _focusFirst() {
            const focusable = this._focusable();
            if (focusable.length) {
                focusable.first().trigger('focus');
            } else {
                this.$el.trigger('focus');
            }
        }

        _trapFocus(e) {
            const focusable = this._focusable();
            if (!focusable.length) return;

            const $first   = focusable.first();
            const $last    = focusable.last();
            const $current = $(document.activeElement);

            if (e.shiftKey) {
                if ($current.is($first)) {
                    e.preventDefault();
                    $last.trigger('focus');
                }
            } else {
                if ($current.is($last)) {
                    e.preventDefault();
                    $first.trigger('focus');
                }
            }
        }

        _focusable() {
            return this.$el.find(FOCUSABLE).filter(':visible').not('[data-dialog-backdrop]');
        }

        destroy() {
            const self = this;
            const $el  = self.$el;

            if (self.isOpen) self.close();

            $(document).off(`click.dialog.${self._uid}`);
            $(document).off(`keydown.dialog.${self._uid}`);
            $el.off('.dialog');

            $el
                .removeData(instanceName)
                .removeAttr('role aria-modal aria-hidden aria-labelledby aria-describedby tabindex')
                .removeClass('dialog-root dialog-hidden dialog-is-open');

            return this;
        }
    }

    PluginDialog.defaults = {
        closeOnBackdrop  : true,    // close when [data-dialog-backdrop] is clicked
        closeOnEscape    : true,    // close on Escape key
        backdrop         : true,    // inject/require a [data-dialog-backdrop] element
        animationIn      : 'fadeIn',        // CSS animation class applied to [data-dialog-panel]
        animationOut     : 'fadeOut',       // CSS animation class applied on close
        animationDuration: 300,             // ms — fallback if animationend never fires
        scrollLock       : true,    // add .dialog-scroll-lock to <body> while open
        onOpen           : null,    // function(dialogElement) {}
        onClose          : null,    // function(dialogElement) {}
    };

    $.extend(themestrap, { PluginDialog });

    $.fn.themestrapPluginDialog = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginDialog($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// Collapsible
(((themestrap = {}, $) => {

    const instanceName = '__pluginCollapsible';

    const STYLE_ID = 'ts-collapsible-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginCollapsible */
.ts-collapsible {
    --ts-c-duration:  300ms;
    --ts-c-easing:    ease;
}

/* The outer clipping shell */
.ts-collapsible__content-shell {
    overflow: hidden;
    height: 0;
    transition: height var(--ts-c-duration) var(--ts-c-easing);
    will-change: height;
}

/*
 * IMPORTANT: when open, height must be 'auto' (not just overflow:visible)
 * so that clearing the JS inline style doesn't revert to the height:0 rule
 * above. The JS animates px→px then removes the inline style; CSS height:auto
 * takes over cleanly from there.
 */
.ts-collapsible--open > .ts-collapsible__content-shell {
    height: auto;
    overflow: visible;
}

/* Trigger chevron — rotates when open */
.ts-collapsible__trigger [data-collapsible-chevron] {
    display: inline-block;
    transition: transform var(--ts-c-duration) var(--ts-c-easing);
}

.ts-collapsible--open .ts-collapsible__trigger [data-collapsible-chevron] {
    transform: rotate(180deg);
}

/* Disabled state */
.ts-collapsible--disabled .ts-collapsible__trigger {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
}
`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginCollapsible {

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
            this.options = $.extend(true, {}, PluginCollapsible.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            $el.addClass('ts-collapsible');

            // CSS custom properties
            if (options.duration !== PluginCollapsible.defaults.duration) {
                $el.css('--ts-c-duration', options.duration);
            }
            if (options.easing !== PluginCollapsible.defaults.easing) {
                $el.css('--ts-c-easing', options.easing);
            }

            // Identify / validate trigger 
            self.$trigger = $el.find('[data-collapsible-trigger]').first();
            if (!self.$trigger.length) {
                // Fallback: first button/a inside root
                self.$trigger = $el.find('button, a').first();
            }
            self.$trigger.addClass('ts-collapsible__trigger');

            // Wrap content element
            self.$content = $el.find('[data-collapsible-content]').first();

            if (!self.$content.length) {
                // Nothing to collapse
                return this;
            }

            // Wrap with the clipping shell if not already done
            if (!self.$content.parent().hasClass('ts-collapsible__content-shell')) {
                self.$content.wrap('<div class="ts-collapsible__content-shell"></div>');
                self.$content.addClass('ts-collapsible__content-inner');
            }

            self.$shell = self.$content.parent();

            // Disabled state 
            if (options.disabled) {
                $el.addClass('ts-collapsible--disabled');
                self.$trigger.attr('aria-disabled', 'true');
            }

            // Instant init — no animation
            self._setOpen(options.defaultOpen, false);

            return this;
        }

        events() {
            const self = this;

            self.$trigger.on('click.collapsible', function(e) {
                e.preventDefault();
                if (self.options.disabled) return;
                self.toggle();
            });

            // Keyboard: Space / Enter on non-button triggers
            self.$trigger.on('keydown.collapsible', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    if ($(this).is('button')) return; // browser fires click natively
                    e.preventDefault();
                    if (!self.options.disabled) self.toggle();
                }
            });

            return this;
        }

        /**
         * Opens the collapsible.
         * @returns {PluginCollapsible}
         */
        open() {
            this._setOpen(true, true);
            return this;
        }

        /**
         * Closes the collapsible.
         * @returns {PluginCollapsible}
         */
        close() {
            this._setOpen(false, true);
            return this;
        }

        /**
         * Toggles the collapsible between open and closed.
         * @returns {PluginCollapsible}
         */
        toggle() {
            return this._isOpen ? this.close() : this.open();
        }

        /**
         * Returns true if the collapsible is currently open.
         * @returns {boolean}
         */
        isOpen() {
            return !!this._isOpen;
        }

        /**
         * Enables or disables the trigger without destroying the instance.
         * @param {boolean} state
         * @returns {PluginCollapsible}
         */
        setDisabled(state) {
            this.options.disabled = !!state;
            this.$el.toggleClass('ts-collapsible--disabled', this.options.disabled);
            this.$trigger.attr('aria-disabled', this.options.disabled ? 'true' : null);
            return this;
        }

        destroy() {
            const self = this;

            self.$trigger.off('.collapsible');

            // Unwrap the shell
            if (self.$shell && self.$shell.length) {
                self.$content.unwrap();
            }

            self.$el
                .removeClass('ts-collapsible ts-collapsible--open ts-collapsible--disabled')
                .css({ '--ts-c-duration': '', '--ts-c-easing': '' });

            if (self.$trigger) {
                self.$trigger
                    .removeClass('ts-collapsible__trigger')
                    .removeAttr('aria-expanded aria-controls aria-disabled');
            }

            if (self.$content) {
                self.$content.removeClass('ts-collapsible__content-inner');
            }

            self.$el.removeData(instanceName);

            return this;
        }

        /**
         * Core open/close state machine.
         *
         * @param {boolean} open    — desired state
         * @param {boolean} animate — whether to run the height transition
         */
        _setOpen(open, animate) {
            const self     = this;
            const $el      = self.$el;
            const $shell   = self.$shell;
            const $content = self.$content;

            if (!$shell || !$shell.length) return;

            // Cancel any in-flight animation
            clearTimeout(self._timer);

            const duration = self._parseDuration(self.options.duration);
            if (open) {
                // OPENING
                self._isOpen = true;
                $el.addClass('ts-collapsible--open');
                self.$trigger
                    .attr('aria-expanded', 'true')
                    .attr('aria-controls', $content.attr('id') || null);

                if (animate) {
                    //
                    // 1. Temporarily suppress the CSS height:auto rule so we can
                    //    animate from 0 → measured px. We do this by locking the
                    //    shell at 0 with an inline style (inline beats the class).
                    //
                    $shell.css({ overflow: 'hidden', height: '0px' });

                    // 2. Measure the natural height of the inner content.
                    const targetH = $content[0].scrollHeight;

                    // 3. Force a reflow so the browser registers the 0px baseline
                    //    before we change it (otherwise no transition fires).
                    $shell[0].offsetHeight; // eslint-disable-line no-unused-expressions

                    // 4. Animate to target height.
                    $shell.css('height', targetH + 'px');

                    $el.trigger('open.ts.collapsible');

                    // 5. After the transition, clear the inline style.
                    //    Because .ts-collapsible--open > .ts-collapsible__content-shell
                    //    has { height: auto; overflow: visible }, the shell now
                    //    sits at auto — not at 0 — so the content stays visible.
                    self._timer = setTimeout(() => {
                        $shell.css({ height: '', overflow: '' });
                        $el.trigger('opened.ts.collapsible');
                    }, duration);

                } else {
                    // Instant open: clear inline styles; CSS height:auto takes over.
                    $shell.css({ height: '', overflow: '' });
                }

            } else {
                // CLOSING 
                self._isOpen = false;
                self.$trigger.attr('aria-expanded', 'false');

                if (animate) {
                    //
                    // 1. The shell may currently be at height:auto (CSS rule from
                    //    --open class). We cannot transition auto → 0, so we must
                    //    first lock it to a pixel value.
                    //
                    //    scrollHeight gives the full inner height regardless of
                    //    current overflow/height values.
                    //
                    const currentH = $shell[0].scrollHeight;

                    // 2. Pin to px (inline style beats the CSS height:auto rule).
                    $shell.css({ overflow: 'hidden', height: currentH + 'px' });

                    // 3. Remove --open class NOW so the CSS height:auto rule no
                    //    longer fights our inline style during the transition.
                    $el.removeClass('ts-collapsible--open');

                    // 4. Force reflow so the browser sees currentH before we move.
                    $shell[0].offsetHeight; // eslint-disable-line no-unused-expressions

                    // 5. Animate to 0.
                    $shell.css('height', '0');

                    $el.trigger('close.ts.collapsible');

                    self._timer = setTimeout(() => {
                        // Inline overflow:hidden is now redundant (CSS height:0 on
                        // the shell rule handles clipping), but we clear it cleanly.
                        $shell.css('overflow', '');
                        $el.trigger('closed.ts.collapsible');
                    }, duration);

                } else {
                    // Instant close.
                    $shell.css({ height: '0', overflow: '' });
                    $el.removeClass('ts-collapsible--open');
                }
            }

            $el.trigger('change.ts.collapsible', [open]);
        }

        /**
         * Converts a CSS duration string like '300ms' or '0.3s' to milliseconds.
         * @param {string} str
         * @returns {number}
         */
        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 300;
            const s = str.trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 300;
        }

    }

    PluginCollapsible.defaults = {
        /**
         * Whether the collapsible is open on initialisation.
         */
        defaultOpen: false,

        /**
         * When true the trigger is inert and the panel cannot be toggled.
         */
        disabled: false,

        /**
         * Height-transition duration. Accepts any CSS <time> string ('300ms',
         * '0.3s') or a plain millisecond number (300). Maps to --ts-c-duration.
         */
        duration: '300ms',

        /**
         * CSS easing for the height transition. Maps to --ts-c-easing.
         */
        easing: 'ease'
    };

    $.extend(themestrap, { PluginCollapsible });

    $.fn.themestrapPluginCollapsible = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginCollapsible($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Vertical Navigation Plugin
 *
 * Supports collapsible sidebar (icon-only "mini" mode), expandable nav
 * groups, active state tracking, icon support, and responsive behavior.
 *
 * Markup:
 *   <nav data-plugin-vertical-nav data-plugin-options='{"collapsed": false}'>
 *
 *     <!-- Optional header / branding -->
 *     <div class="ts-vn-header">
 *       <span class="ts-vn-brand">App Name</span>
 *     </div>
 *
 *     <!-- Direct link -->
 *     <a href="/dashboard" class="ts-vn-link active">
 *       <span class="ts-vn-icon"><i class="fas fa-home"></i></span>
 *       <span class="ts-vn-text">Dashboard</span>
 *     </a>
 *
 *     <!-- Expandable nav group -->
 *     <div class="ts-vn-group">
 *       <button class="ts-vn-group-trigger">
 *         <span class="ts-vn-icon"><i class="fas fa-cog"></i></span>
 *         <span class="ts-vn-text">Settings</span>
 *       </button>
 *       <div class="ts-vn-group-children">
 *         <a href="/settings/profile"  class="ts-vn-link">Profile</a>
 *         <a href="/settings/account"  class="ts-vn-link">Account</a>
 *       </div>
 *     </div>
 *
 *     <!-- Divider -->
 *     <div class="ts-vn-divider"></div>
 *
 *   </nav>
 *
 * Options (data-plugin-options or JS):
 *   collapsed      {Boolean}  false  — Start in icon-only mini mode
 *   activeTracking {Boolean}  true   — Auto-set .active from current URL
 *   hashTracking   {Boolean}  false  — Also match location.hash in addition to pathname
 *   expandActive   {Boolean}  true   — Auto-expand group that contains the active link
 *   toggleBtn      {Boolean}  true   — Render the collapse toggle button
 *   toggleTarget   {String}   null   — Extra selector to add/remove .ts-vn-collapsed on collapse
 *                                      (e.g. '#page-wrapper') — useful for pushing main content
 *   animDuration   {Number}   260    — Group open/close animation duration in ms
 *   tooltips       {Boolean}  true   — Show nav-text as Bootstrap tooltip when collapsed
 *
 * Public API:
 *   const nav = $('#myNav').data('__verticalNav');
 *   nav.collapse();         // collapse to mini mode
 *   nav.expand();           // expand to full mode
 *   nav.toggle();           // toggle collapse state
 *   nav.openGroup($group);  // expand a .ts-vn-group element
 *   nav.closeGroup($group); // collapse a .ts-vn-group element
 *   nav.setActive(href);    // programmatically mark a link active
 *   nav.destroy();          // teardown and restore original HTML
 *
 * themestrap.init.js wiring:
 *   // Vertical Navigation
 *   if ($.isFunction($.fn['themestrapPluginVerticalNav']) && $('[data-plugin-vertical-nav]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-vertical-nav]:not(.manual)', 'themestrapPluginVerticalNav');
 *   }
 */
// Vertical Navigation
(((themestrap = {}, $) => {
    const instanceName = '__verticalNav';

    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-verticalnav-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `/**
 * Vertical Navigation Plugin — Stylesheet
 *
 * Customise with CSS custom properties on the :root or on
 * the .ts-vertical-nav element itself.
 */
/* Custom Properties */
.ts-vertical-nav {
    --ts-vn-bg:              var(--dark);
    --ts-vn-border:          #393c41;

    --ts-vn-width:           220px;
    --ts-vn-width-collapsed: 56px;
    --ts-vn-transition:      260ms cubic-bezier(.4, 0, .2, 1);

    --ts-vn-link-color:        var(--default);
    --ts-vn-link-hover-color:  var(--primary);
    --ts-vn-link-hover-bg:     rgba(255, 255, 255, .08);
    --ts-vn-link-active-color: var(--primary);
    --ts-vn-link-active-bg:    rgba(255, 255, 255, .14);
    --ts-vn-link-active-mark:  var(--primary);

    --ts-vn-icon-size:   1.125rem;   /* 18 px */
    --ts-vn-icon-color:  rgba(255, 255, 255, .60);
    --ts-vn-icon-active: var(--primary);

    --ts-vn-header-height: 56px;
    --ts-vn-item-height:   36px;
    --ts-vn-item-gap:      2px;

    --ts-vn-group-indent: 2.5rem;   /* children indented past icon column */

    --ts-vn-divider-color: var(--grey-200);

    --ts-vn-focus-ring: 0 0 0 2px #49afd9;
    --ts-vn-radius:     4px;
}
/* Root nav element */
.ts-vertical-nav {
    display:        flex;
    flex-direction: column;
    width:          var(--ts-vn-width);
    min-height:     100%;
    background:     var(--ts-vn-bg);
    border-right:   1px solid var(--ts-vn-border);
    overflow:       hidden;
    transition:     width var(--ts-vn-transition);
    flex-shrink:    0;
    position:       relative;
    /* Stacking context so tooltips rendered in <body> still overlay correctly */
    z-index:        100;
}

/* Collapsed / mini mode */
.ts-vertical-nav.ts-vn-collapsed {
    width: var(--ts-vn-width-collapsed);
}
/* Header */
.ts-vn-header {
    display:         flex;
    align-items:     center;
    height:          var(--ts-vn-header-height);
    padding:         0 .75rem;
    border-bottom:   1px solid var(--ts-vn-border);
    gap:             .5rem;
    flex-shrink:     0;
    overflow:        hidden;
    white-space:     nowrap;
}

.ts-vn-brand {
    font-size:     .875rem;
    font-weight:   600;
    color:         #fff;
    opacity:       1;
    transition:    opacity var(--ts-vn-transition),
                   max-width var(--ts-vn-transition);
    max-width:     9999px;
    overflow:      hidden;
}

.ts-vn-collapsed .ts-vn-brand {
    opacity:   0;
    max-width: 0;
}
/* Toggle button */
.ts-vn-toggle-btn {
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink:     0;
    width:           32px;
    height:          32px;
    padding:         0;
    background:      transparent;
    border:          1px solid var(--ts-vn-border);
    border-radius:   var(--ts-vn-radius);
    cursor:          pointer;
    color:           var(--ts-vn-link-color);
    transition:      background var(--ts-vn-transition),
                     color      var(--ts-vn-transition);
    margin-left:     auto;  /* push to far right inside header */
}

.ts-vn-toggle-btn:hover,
.ts-vn-toggle-btn:focus-visible {
    background: var(--ts-vn-link-hover-bg);
    color:      var(--ts-vn-link-hover-color);
    outline:    none;
    box-shadow: var(--ts-vn-focus-ring);
}

/* hamburguer icon composed of three spans */
.ts-vn-toggle-icon {
    display:         flex;
    flex-direction:  column;
    gap:             4px;
    width:           16px;
}

.ts-vn-toggle-icon span {
    display:       block;
    width:         100%;
    height:        2px;
    background:    currentColor;
    border-radius: 1px;
    transition:    transform var(--ts-vn-transition),
                   opacity  var(--ts-vn-transition),
                   width    var(--ts-vn-transition);
}

/* Animate hamburguer ? arrow when collapsed */
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(1) {
    transform:    translateY(6px) rotate(45deg);
}
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(2) {
    opacity: 0;
    width:   0;
}
.ts-vn-collapsed .ts-vn-toggle-icon span:nth-child(3) {
    transform:    translateY(-6px) rotate(-45deg);
}

/* When placed inside the header without a .ts-vn-header wrapper */
.ts-vertical-nav > .ts-vn-toggle-btn {
    margin: .5rem .5rem .5rem auto;
    display: flex;
}
/* Nav body (scroll area) */
.ts-vn-body {
    flex:       1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding:    .5rem 0;

    /* Slim scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.15) transparent;
}

.ts-vn-body::-webkit-scrollbar       { width: 4px; }
.ts-vn-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
/* Shared link / button row styles */
.ts-vn-link,
.ts-vn-group-trigger {
    display:         flex;
    align-items:     center;
    gap:             .75rem;
    width:           100%;
    min-height:      var(--ts-vn-item-height);
    padding:         0 .75rem;
    margin-bottom:   var(--ts-vn-item-gap);
    color:           var(--ts-vn-link-color);
    text-decoration: none;
    background:      transparent;
    border:          none;
    border-radius:   var(--ts-vn-radius);
    cursor:          pointer;
    white-space:     nowrap;
    overflow:        hidden;
    text-align:      left;
    position:        relative;
    transition:      background var(--ts-vn-transition),
                     color      var(--ts-vn-transition);
    flex-shrink:     0;
}

.ts-vn-link:hover,
.ts-vn-group-trigger:hover {
    background: var(--ts-vn-link-hover-bg);
    color:      var(--ts-vn-link-hover-color);
}

.ts-vn-link:focus-visible,
.ts-vn-group-trigger:focus-visible {
    outline:    none;
    box-shadow: var(--ts-vn-focus-ring);
}

/* Active link — left-border accent (Clarity's signature detail) */
.ts-vn-link.active {
    background: var(--ts-vn-link-active-bg);
    color:      var(--ts-vn-link-active-color);
}

.ts-vn-link.active::before {
    content:       '';
    position:      absolute;
    left:          0;
    top:           4px;
    bottom:        4px;
    width:         3px;
    border-radius: 0 2px 2px 0;
    background:    var(--ts-vn-link-active-mark);
}

.ts-vn-link.active .ts-vn-icon {
    color: var(--ts-vn-icon-active);
}
/* Icon column */
.ts-vn-icon {
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink:     0;
    width:           var(--ts-vn-icon-size);
    height:          var(--ts-vn-icon-size);
    font-size:       var(--ts-vn-icon-size);
    color:           var(--ts-vn-icon-color);
    transition:      color var(--ts-vn-transition);
}

.ts-vn-link:hover   .ts-vn-icon,
.ts-vn-group-trigger:hover .ts-vn-icon {
    color: var(--ts-vn-link-hover-color);
}
/* Nav text */
.ts-vn-text {
    flex:        1 1 auto;
    font-size:   .8125rem;   /* 13 px — Clarity's default */
    font-weight: 500;
    overflow:    hidden;
    text-overflow: ellipsis;
    opacity:     1;
    max-width:   9999px;
    transition:  opacity     var(--ts-vn-transition),
                 max-width   var(--ts-vn-transition),
                 visibility  var(--ts-vn-transition);
    visibility:  visible;
}

/* Hide text in collapsed / mini mode */
.ts-vn-collapsed .ts-vn-text {
    opacity:    0;
    max-width:  0;
    visibility: hidden;
}
/* Caret */
.ts-vn-caret {
    flex-shrink: 0;
    width:       .5rem;
    height:      .5rem;
    border-right:  2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform:     rotate(-45deg);  /* points right = closed */
    transition:    transform var(--ts-vn-transition),
                   opacity   var(--ts-vn-transition);
    margin-left:   auto;
    opacity:       .6;
}

.ts-vn-group--open > .ts-vn-group-trigger .ts-vn-caret {
    transform: rotate(45deg);  /* points down = open */
    opacity:   1;
}

/* Hide caret in mini mode */
.ts-vn-collapsed .ts-vn-caret {
    opacity:    0;
    max-width:  0;
    overflow:   hidden;
}
/* Nav groups & children */
.ts-vn-group {
    display: flex;
    flex-direction: column;
}

.ts-vn-group-children {
    overflow:   hidden;
    /* height is set by JS; CSS only provides the transition */
    transition: height var(--ts-vn-transition);
    padding-left: var(--ts-vn-group-indent);
}

/* Child links are slightly smaller */
.ts-vn-group-children .ts-vn-link {
    font-size:  .75rem;   /* 12 px */
    min-height: 30px;
    padding:    0 .5rem 0 .75rem;
}

/* In mini mode, children are hidden entirely and group trigger acts as
   a direct link (authors should set href on .ts-vn-group-trigger or
   add a data-group-href attribute). */
.ts-vn-collapsed .ts-vn-group-children {
    display: none;
}
/* Section label / divider */
.ts-vn-section-label {
    display:      block;
    padding:      .75rem .75rem .25rem;
    font-size:    .6875rem;  /* 11 px */
    font-weight:  600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color:          rgba(255, 255, 255, .40);
    white-space:    nowrap;
    overflow:       hidden;
    opacity:        1;
    transition:     opacity var(--ts-vn-transition),
                    max-height var(--ts-vn-transition);
}

.ts-vn-collapsed .ts-vn-section-label {
    opacity:    0;
    max-height: 0;
    padding:    0;
}

.ts-vn-divider {
    height:     1px;
    margin:     .5rem .75rem;
    background: var(--ts-vn-divider-color);
    flex-shrink: 0;
}
/* Footer slot */
.ts-vn-footer {
    flex-shrink:   0;
    padding:       .5rem 0;
    border-top:    1px solid var(--ts-vn-border);
    overflow:      hidden;
    white-space:   nowrap;
}
/* Light theme variant */
.ts-vertical-nav.ts-vn-light {
    --ts-vn-bg:              var(--light);
    --ts-vn-border:          var(--grey-200);

    --ts-vn-link-color:        var(--dark);
    --ts-vn-link-hover-color:  #000;
    --ts-vn-link-hover-bg:     rgba(0, 0, 0, .05);
    --ts-vn-link-active-color: #000;
    --ts-vn-link-active-bg:    var(--primary-rgba-10);

    --ts-vn-icon-color:  #6a7e90;
    --ts-vn-divider-color: var(--grey-200);
}

.ts-vertical-nav.ts-vn-light .ts-vn-brand {
    color: var(--dark);
}

.ts-vertical-nav.ts-vn-light .ts-vn-section-label {
    color: rgba(0, 0, 0, .40);
}
/* Responsive — collapses automatically at sm breakpoint */
@media (max-width: 767.98px) {
    .ts-vertical-nav {
        width: var(--ts-vn-width-collapsed);
    }
}
/* Transition for external content panel (when toggleTarget is used) */
[class*="ts-vn-push"] {
    transition: margin-left var(--ts-vn-transition),
                padding-left var(--ts-vn-transition);
}
`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginVerticalNav {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el          = $el;
            this.initialHTML  = $el.html();   // preserved for destroy()
            this._tooltips    = [];           // Bootstrap Tooltip instances

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
            this.options = $.extend(true, {}, PluginVerticalNav.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Root element housekeeping
            $el.addClass('ts-vertical-nav');
            if ($el.attr('role') === undefined) {
                $el.attr({ role: 'navigation', 'aria-label': 'Vertical navigation' });
            }

            // Inject the toggle button into the header (or prepend before first child)
            if (o.toggleBtn) {
                self._injectToggleBtn();
            }

            // Inject group carets
            $el.find('.ts-vn-group-trigger').each(function() {
                const $btn = $(this);
                if (!$btn.find('.ts-vn-caret').length) {
                    $btn.append('<span class="ts-vn-caret" aria-hidden="true"></span>');
                }
                $btn.attr({ 'aria-expanded': 'false', 'aria-haspopup': 'true' });
            });

            // Wrap group children content for animation measurement
            $el.find('.ts-vn-group-children').each(function() {
                const $children = $(this);
                $children
                    .attr('role', 'region')
                    .css({ overflow: 'hidden', height: 0 })
                    .addClass('ts-vn-group-children--collapsed');
            });

            // Active link detection
            if (o.activeTracking) {
                self._detectActive();
            }

            // Apply initial collapsed state
            if (o.collapsed) {
                $el.addClass('ts-vn-collapsed');
                if (o.toggleTarget) {
                    $(o.toggleTarget).addClass('ts-vn-collapsed');
                }
                self._refreshTooltips();
            }

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Toggle collapse via the injected button
            $el.on('click.verticalNav', '.ts-vn-toggle-btn', function(e) {
                e.preventDefault();
                self.toggle();
            });

            // Nav group trigger — expand / collapse children
            $el.on('click.verticalNav', '.ts-vn-group-trigger', function(e) {
                e.preventDefault();
                const $group = $(this).closest('.ts-vn-group');
                self._toggleGroup($group);
            });

            // Active link — track on click if activeTracking is on
            if (o.activeTracking) {
                $el.on('click.verticalNav', '.ts-vn-link', function() {
                    $el.find('.ts-vn-link.active').removeClass('active').removeAttr('aria-current');
                    $(this).addClass('active').attr('aria-current', 'page');
                });
            }

            return this;
        }

        collapse() {
            const o = this.options;
            this.$el.addClass('ts-vn-collapsed');
            this.$el.find('.ts-vn-toggle-btn').attr('aria-expanded', 'false');
            if (o.toggleTarget) {
                $(o.toggleTarget).addClass('ts-vn-collapsed');
            }
            this._refreshTooltips();
            this.$el.trigger('verticalNav.collapsed');
            return this;
        }

        expand() {
            const o = this.options;
            this.$el.removeClass('ts-vn-collapsed');
            this.$el.find('.ts-vn-toggle-btn').attr('aria-expanded', 'true');
            if (o.toggleTarget) {
                $(o.toggleTarget).removeClass('ts-vn-collapsed');
            }
            this._destroyTooltips();
            this.$el.trigger('verticalNav.expanded');
            return this;
        }

        toggle() {
            if (this.$el.hasClass('ts-vn-collapsed')) {
                this.expand();
            } else {
                this.collapse();
            }
            return this;
        }

        openGroup($group) {
            const self     = this;
            const o        = self.options;
            const $trigger  = $group.find('> .ts-vn-group-trigger');
            const $children = $group.find('> .ts-vn-group-children');

            $group.addClass('ts-vn-group--open');
            $trigger.attr('aria-expanded', 'true');
            $children.removeClass('ts-vn-group-children--collapsed');

            // Animate open: measure natural height, animate to it, then free to auto
            const targetH = $children.css({ height: 'auto' }).outerHeight();
            $children
                .css({ height: 0 })
                .stop(true)
                .animate({ height: targetH }, o.animDuration, function() {
                    $(this).css({ height: 'auto' });
                });

            return this;
        }

        closeGroup($group) {
            const self     = this;
            const o        = self.options;
            const $trigger  = $group.find('> .ts-vn-group-trigger');
            const $children = $group.find('> .ts-vn-group-children');

            $group.removeClass('ts-vn-group--open');
            $trigger.attr('aria-expanded', 'false');

            $children.stop(true).animate({ height: 0 }, o.animDuration, function() {
                $(this).css({ height: 0 }).addClass('ts-vn-group-children--collapsed');
            });

            return this;
        }

        setActive(href) {
            const $el = this.$el;
            $el.find('.ts-vn-link.active').removeClass('active').removeAttr('aria-current');

            const $match = $el.find(`.ts-vn-link[href="${href}"]`);
            if ($match.length) {
                $match.addClass('active').attr('aria-current', 'page');

                if (this.options.expandActive) {
                    const $parentGroup = $match.closest('.ts-vn-group');
                    if ($parentGroup.length) {
                        this.openGroup($parentGroup);
                    }
                }
            }

            return this;
        }

        destroy() {
            this._destroyTooltips();
            this.$el
                .removeClass('ts-vertical-nav ts-vn-collapsed')
                .off('.verticalNav')
                .removeAttr('role aria-label')
                .html(this.initialHTML)
                .removeData(instanceName);
            return this;
        }

        _injectToggleBtn() {
            const $el = this.$el;

            // Honor an existing toggle button the author may have placed
            if ($el.find('.ts-vn-toggle-btn').length) {
                return;
            }

            const $btn = $(
                '<button class="ts-vn-toggle-btn" type="button" ' +
                        'aria-expanded="true" aria-label="Toggle navigation">' +
                    '<span class="ts-vn-toggle-icon" aria-hidden="true">' +
                        '<span></span><span></span><span></span>' +
                    '</span>' +
                '</button>'
            );

            const $header = $el.find('.ts-vn-header');
            if ($header.length) {
                $header.append($btn);
            } else {
                $el.prepend($btn);
            }
        }

        _toggleGroup($group) {
            if ($group.hasClass('ts-vn-group--open')) {
                this.closeGroup($group);
            } else {
                this.openGroup($group);
            }
        }

        _detectActive() {
            const o       = this.options;
            const path    = window.location.pathname;
            const hash    = window.location.hash;
            const $el     = this.$el;
            let   $active = null;

            $el.find('.ts-vn-link').each(function() {
                const href = $(this).attr('href') || '';
                if (!href || href === '#') return;

                if (href === path || (o.hashTracking && href === path + hash)) {
                    $active = $(this);
                    return false; // break
                }
            });

            if ($active) {
                $active.addClass('active').attr('aria-current', 'page');

                if (o.expandActive) {
                    const $parentGroup = $active.closest('.ts-vn-group');
                    if ($parentGroup.length) {
                        // Open without animation on init (height: auto directly)
                        const $trigger  = $parentGroup.find('> .ts-vn-group-trigger');
                        const $children = $parentGroup.find('> .ts-vn-group-children');

                        $parentGroup.addClass('ts-vn-group--open');
                        $trigger.attr('aria-expanded', 'true');
                        $children
                            .removeClass('ts-vn-group-children--collapsed')
                            .css({ height: 'auto' });
                    }
                }
            }
        }

        _refreshTooltips() {
            const self = this;
            const o    = self.options;

            if (!o.tooltips) return;

            // Bootstrap 5 Tooltip — guard against absence
            if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;

            self._destroyTooltips();

            self.$el.find('.ts-vn-link, .ts-vn-group-trigger').each(function() {
                const $el    = $(this);
                const label  = $el.find('.ts-vn-text').text().trim();
                if (!label) return;

                const tip = new bootstrap.Tooltip(this, {
                    title:     label,
                    placement: 'right',
                    trigger:   'hover focus',
                    container: 'body'
                });
                self._tooltips.push(tip);
            });
        }

        _destroyTooltips() {
            this._tooltips.forEach(t => t.dispose());
            this._tooltips = [];
        }
    }

    PluginVerticalNav.defaults = {
        collapsed:      false,
        activeTracking: true,
        hashTracking:   false,
        expandActive:   true,
        toggleBtn:      true,
        toggleTarget:   null,
        animDuration:   260,
        tooltips:       true
    };

    $.extend(themestrap, { PluginVerticalNav });

    $.fn.themestrapPluginVerticalNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginVerticalNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

// SideNav
(((themestrap = {}, $) => {

    const instanceName = '__pluginSideNav';

    // Injected stylesheet — keyed to STYLE_ID so it runs only once per page
    const STYLE_ID = 'ts-sidenav-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginSideNav */
.ts-sidenav {
    --ts-sidenav-width:             260px;
    --ts-sidenav-width-collapsed:   64px;
    --ts-sidenav-duration:          250ms;
    --ts-sidenav-easing:            cubic-bezier(0.4, 0, 0.2, 1);

    /* Colors — override via CSS or data-plugin-options */
    --ts-sidenav-bg:                var(--light);
    --ts-sidenav-border-color:      var(--light--200);
    --ts-sidenav-header-bg:         var(--light--100);
    --ts-sidenav-footer-bg:         var(--light--300);

    --ts-sidenav-text:              var(--default);
    --ts-sidenav-text-muted:        var(--muted);
    --ts-sidenav-icon-color:        var(--grey);
    --ts-sidenav-icon-active-color: var(--primary);

    --ts-sidenav-item-hover-bg:     var(--light-rgba-10);
    --ts-sidenav-item-active-bg:    var(--light-rgba-20);
    --ts-sidenav-item-active-color: var(--primary);
    --ts-sidenav-item-active-border:var(--primary);

    --ts-sidenav-group-title-color: #6b7280;
    --ts-sidenav-sub-item-indent:   2.75rem;

    --ts-sidenav-badge-bg:          #e5e7eb;
    --ts-sidenav-badge-color:       #374151;
    --ts-sidenav-badge-active-bg:   #dbeafe;
    --ts-sidenav-badge-active-color:var(--primary);

    --ts-sidenav-toggle-color:      #6b7280;
    --ts-sidenav-toggle-hover-bg:   #f3f4f6;
}

/* Dark variant */
html.dark .ts-sidenav {
    --ts-sidenav-bg:                var(--dark-200);
    --ts-sidenav-border-color:      var(--dark-rgba-50);
    --ts-sidenav-header-bg:         var(--dark-200);
    --ts-sidenav-footer-bg:         var(--dark-200);

    --ts-sidenav-text:              var(--grey-800);
    --ts-sidenav-text-muted:        var(--light-rgba-20);
    --ts-sidenav-icon-color:        var(--grey-800);
    --ts-sidenav-icon-active-color: var(--light);

    --ts-sidenav-item-hover-bg:     var(--dark-300);
    --ts-sidenav-item-active-bg:    var(--dark-100);
    --ts-sidenav-item-active-color: #93c5fd;
    --ts-sidenav-item-active-border:#3b82f6;

    --ts-sidenav-group-title-color: var(--dark--300);

    --ts-sidenav-badge-bg:          var(--dark--100);
    --ts-sidenav-badge-color:       var(--default);
    --ts-sidenav-badge-active-bg:   var(--primary);
    --ts-sidenav-badge-active-color:var(--light);

    --ts-sidenav-toggle-color:      var(--default);
    --ts-sidenav-toggle-hover-bg:   var(--dark-300);
}

/* Root */
.ts-sidenav {
    display: flex;
    flex-direction: column;
    width: var(--ts-sidenav-width);
    height: 100%;
    background-color: var(--ts-sidenav-bg);
    border-left: 1px solid var(--ts-sidenav-border-color);
    overflow: hidden;
    transition:
        width var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    will-change: width;
    flex-shrink: 0;
    position: relative;
    z-index: 100;
}

.ts-sidenav--collapsed {
    width: var(--ts-sidenav-width-collapsed);
}

/* Header */
.ts-sidenav__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0rem 0.75rem 1rem 1rem;
    min-height: 56px;
    background-color: var(--ts-sidenav-header-bg);
    box-shadow: 0 1px 2px rgba(0,0,0,.3),
                0 8px 24px rgba(0,0,0,.35);
    border-bottom-color: transparent;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
}

html.dark .ts-sidenav__header {
    background-color: var(--dark-200);
}

.ts-sidenav__logo {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ts-sidenav__logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.ts-sidenav__logo i,
.ts-sidenav__logo svg {
    font-size: 1.25rem;
    color: var(--ts-sidenav-icon-active-color);
}

.ts-sidenav__title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ts-sidenav-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
    transition: opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
}

.ts-sidenav--collapsed .ts-sidenav__title {
    opacity: 0;
    pointer-events: none;
    width: 0;
}

/* Collapse toggle button */
.ts-sidenav__toggle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    color: var(--ts-sidenav-toggle-color);
    transition:
        background-color 150ms ease,
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        transform var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    padding: 0;
    line-height: 1;
}

.ts-sidenav__toggle:hover {
    background-color: var(--ts-sidenav-toggle-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__toggle:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
    outline-offset: 2px;
}

.ts-sidenav--collapsed .ts-sidenav__toggle {
    transform: rotate(180deg);
}

/* Body (scrollable nav area) */
.ts-sidenav__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem 0;

    /* Thin scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--ts-sidenav-border-color) transparent;
}

.ts-sidenav__body::-webkit-scrollbar {
    width: 4px;
}

.ts-sidenav__body::-webkit-scrollbar-track {
    background: transparent;
}

.ts-sidenav__body::-webkit-scrollbar-thumb {
    background-color: var(--ts-sidenav-border-color);
    border-radius: 2px;
}

/* Groups */
.ts-sidenav__group {
    padding: 0.25rem 0;
}

.ts-sidenav__group + .ts-sidenav__group {
    border-top: 1px solid var(--ts-sidenav-border-color);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
}

.ts-sidenav__group-title {
    display: flex;
    align-items: center;
    padding: 0.375rem 1rem 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ts-sidenav-group-title-color);
    white-space: nowrap;
    overflow: hidden;
    transition: opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    user-select: none;
}

.ts-sidenav--collapsed .ts-sidenav__group-title {
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
}

/* Nav items */
.ts-sidenav__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    margin: 0.0625rem 0.5rem;
    border-radius: 0.375rem;
    text-decoration: none !important;
    color: var(--ts-sidenav-text);
    cursor: pointer;
    position: relative;
    transition:
        background-color 150ms ease,
        color 150ms ease;
    border: none;
    background: transparent;
    width: calc(100% - 1rem);
    text-align: left;
    user-select: none;
    outline-offset: -2px;
}

.ts-sidenav__item::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: var(--ts-sidenav-item-active-border);
    border-radius: 0 2px 2px 0;
    transition: height 150ms ease;
}

.ts-sidenav__item:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__item:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
}

.ts-sidenav__item--active {
    background-color: var(--ts-sidenav-item-active-bg);
    color: var(--ts-sidenav-item-active-color);
    font-weight: 500;
}

.ts-sidenav__item--active::before {
    height: 60%;
}

/* Item icon */
.ts-sidenav__item-icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-sidenav-icon-color);
    transition: color 150ms ease;
    font-size: 1rem;
}

.ts-sidenav__item--active .ts-sidenav__item-icon {
    color: var(--ts-sidenav-icon-active-color);
}

.ts-sidenav__item:hover .ts-sidenav__item-icon {
    color: var(--ts-sidenav-text);
}

.ts-sidenav__item--active:hover .ts-sidenav__item-icon {
    color: var(--ts-sidenav-icon-active-color);
}

/* Item label */
.ts-sidenav__item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition:
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        max-width var(--ts-sidenav-duration) var(--ts-sidenav-easing);
}

.ts-sidenav--collapsed .ts-sidenav__item-label {
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    pointer-events: none;
}

/* Badge */
.ts-sidenav__item-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.3125rem;
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1;
    border-radius: 0.625rem;
    background-color: var(--ts-sidenav-badge-bg);
    color: var(--ts-sidenav-badge-color);
    transition:
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        background-color 150ms ease;
}

.ts-sidenav__item--active .ts-sidenav__item-badge {
    background-color: var(--ts-sidenav-badge-active-bg);
    color: var(--ts-sidenav-badge-active-color);
}

.ts-sidenav--collapsed .ts-sidenav__item-badge {
    opacity: 0;
    pointer-events: none;
}

/* Chevron (for parent items) */
.ts-sidenav__item-chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    color: var(--ts-sidenav-text-muted);
    transition:
        transform var(--ts-sidenav-duration) var(--ts-sidenav-easing),
        opacity var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    font-size: 0.75rem;
}

.ts-sidenav--collapsed .ts-sidenav__item-chevron {
    opacity: 0;
    pointer-events: none;
}

.ts-sidenav__item--open > .ts-sidenav__item-chevron {
    transform: rotate(-90deg);
}

/* Parent items with sub-nav: wrap so the sub-shell occupies its own full-width
   row below the icon/label/chevron row. Without this, the sub-shell sits as a
   flex sibling of the label and its content width squeezes the label to zero. */
.ts-sidenav__item--has-children {
    flex-wrap: wrap;
    row-gap: 0;
}

/* Sub-items (nested nav) */
.ts-sidenav__sub-shell {
    /* Force the shell into its own flex row so it does not compete with the
       label for horizontal space. flex-basis / width both need to be 100%. */
    width: 100%;
    overflow: hidden;
    height: 0;
    transition: height var(--ts-sidenav-duration) var(--ts-sidenav-easing);
    will-change: height;
}

/* Open state: allow natural height.
   CRITICAL — without this rule, clearing the JS inline height style reverts
   control to height: 0 above and the shell snaps closed the moment the
   open animation finishes. */
.ts-sidenav__item--open > .ts-sidenav__sub-shell {
    height: auto;
    overflow: visible;
}

.ts-sidenav__sub-items {
    padding: 0.125rem 0 0.25rem 0;
}

.ts-sidenav__sub-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem 0.375rem var(--ts-sidenav-sub-item-indent);
    margin: 0.0625rem 0.5rem;
    border-radius: 0.375rem;
    text-decoration: none !important;
    color: var(--ts-sidenav-text);
    font-size: 0.875rem;
    line-height: 1.25rem;
    cursor: pointer;
    position: relative;
    transition: background-color 150ms ease, color 150ms ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
}

.ts-sidenav__sub-item:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

.ts-sidenav__sub-item:focus-visible {
    outline: 2px solid var(--ts-sidenav-item-active-border);
    outline-offset: -2px;
}

.ts-sidenav__sub-item--active {
    background-color: var(--ts-sidenav-item-active-bg);
    color: var(--ts-sidenav-item-active-color);
    font-weight: 500;
}

/* Sub-item left dot indicator */
.ts-sidenav__sub-item::before {
    content: '';
    position: absolute;
    left: calc(var(--ts-sidenav-sub-item-indent) - 0.75rem);
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--ts-sidenav-border-color);
    transition: background-color 150ms ease;
}

.ts-sidenav__sub-item--active::before,
.ts-sidenav__sub-item:hover::before {
    background-color: var(--ts-sidenav-item-active-border);
}

/* Sub-items hidden in collapsed mode — CSS handles the visual; JS handles open state restoration */
.ts-sidenav--collapsed .ts-sidenav__sub-shell {
    height: 0 !important;
    overflow: hidden;
}

/* Footer */
.ts-sidenav__footer {
    flex-shrink: 0;
    padding: 0.5rem 0;
    background-color: var(--ts-sidenav-footer-bg);
    border-top: 1px solid var(--ts-sidenav-border-color);
    overflow: hidden;
}

.ts-sidenav__btn-group {
    align-items: center;
    display: flex;
    justify-content: space-evenly;
    padding-inline: 1rem;
}

.ts-sidenav__buttons {
    align-items: center;
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin-bottom: -1px;
    min-width: 0;
    position: relative;
    white-space: nowrap;
}

.ts-sidenav__btn-divider {
    background: var(--ts-sidenav-border-color);;
    content: "";
    display: block;
    height: 1.25rem;
    width: .0625rem;
}

.ts-sidenav__btn-item {
    box-shadow: none;
    color: var(--ts-sidenav-icon-color);
}

.ts-sidenav__btn-item:hover {
    background-color: var(--ts-sidenav-item-hover-bg);
    color: var(--ts-sidenav-text);
}

/* Tooltip on collapsed items (pure CSS, driven by data-ts-sidenav-tooltip attr) */
.ts-sidenav--collapsed .ts-sidenav__item[data-ts-sidenav-tooltip] {
    position: relative;
}

.ts-sidenav--collapsed .ts-sidenav__item[data-ts-sidenav-tooltip]:hover::after {
    content: attr(data-ts-sidenav-tooltip);
    position: absolute;
    left: calc(var(--ts-sidenav-width-collapsed) - 0.5rem);
    top: 50%;
    transform: translateY(-50%);
    background-color: #1f2937;
    color: #f9fafb;
    padding: 0.3125rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 200;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1);
}

/* Collapsed: centre the icon */
.ts-sidenav--collapsed .ts-sidenav__item {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
    width: calc(var(--ts-sidenav-width-collapsed) - 1rem);
    margin-left: 0.5rem;
}

.ts-sidenav--collapsed .ts-sidenav__item::before {
    left: -0.5rem;
}

/* Accessibility */
.ts-sidenav__item[aria-disabled="true"] {
    opacity: 0.45;
    pointer-events: none;
    cursor: not-allowed;
}

/* Separator */
.ts-sidenav__separator {
    height: 1px;
    background-color: var(--ts-sidenav-border-color);
    margin: 0.5rem 1rem;
}
`;

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginSideNav {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el    = $el;
            this._cleanup = [];
            this._raf     = [];

            // Unique namespace keeps multiple instances on one page from
            // interfering with each other's window event listeners.
            this._uid = 'tsSideNav_' + Math.random().toString(36).slice(2, 9);

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
            this.options = $.extend(true, {}, PluginSideNav.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self    = this;
            const $el     = self.$el;
            const options = self.options;

            $el.addClass('ts-sidenav');

            if (options.dark) {
                $el.addClass('ts-sidenav--dark');
            }

            if (options.width !== PluginSideNav.defaults.width) {
                $el.css('--ts-sidenav-width', options.width);
            }

            if (options.widthCollapsed !== PluginSideNav.defaults.widthCollapsed) {
                $el.css('--ts-sidenav-width-collapsed', options.widthCollapsed);
            }

            if (options.duration !== PluginSideNav.defaults.duration) {
                $el.css('--ts-sidenav-duration', options.duration);
            }

            self._buildHeader();
            self._buildBody();
            self._buildFooter();
            self._buildGroups();

            // Suppress the width transition on first paint so there's no
            // animated flash from 260px → collapsed width on page load.
            $el[0].style.transition = 'none';
            self._isCollapsed = false;

            if (options.collapsed) {
                // animate=false: CSS transition is already suppressed above.
                self._applyCollapsed(true);
            }

            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => {
                    $el[0].style.removeProperty('transition');
                });
                self._raf.push(raf2);
            });
            self._raf.push(raf1);

            if (options.activeOnLoad) {
                self._autoSetActive();
            }

            // Only wire responsive handling when explicitly opted-in.
            if (options.mobileBreakpoint) {
                self._bindResponsive();
            }

            return this;
        }

        /**
         * Wire a resize listener that collapses/expands the sidebar based on
         * viewport width. Only activated when `mobileBreakpoint` is non-zero.
         *
         * Uses a per-instance event namespace (`this._uid`) so multiple
         * sidebar instances on the same page never clobber each other.
         */
        _bindResponsive() {
            const self      = this;
            const namespace = 'resize.' + self._uid;

            self._resizeHandler = () => {
                const isMobile = window.innerWidth <= self.options.mobileBreakpoint;

                self.$el.toggleClass('ts-sidenav--mobile', isMobile);

                if (isMobile) {
                    if (self.options.collapseOnMobile && !self._isCollapsed) {
                        self.collapse();
                    }
                } else {
                    // Use the live collapsed state, not the frozen initial option.
                    if (self.options.collapseOnMobile && self._isCollapsed) {
                        self.expand();
                    }
                }
            };

            $(window).on(namespace, self._resizeHandler);

            // Register teardown so destroy() can remove this handler cleanly.
            self._cleanup.push(() => {
                $(window).off(namespace, self._resizeHandler);
            });

            // Run immediately to apply the correct initial state.
            self._resizeHandler();
        }

        _buildHeader() {
            const self = this;
            const $el  = self.$el;

            self.$header = $el.find('[data-sidenav-header]').first();
            if (!self.$header.length) return;

            self.$header.addClass('ts-sidenav__header');

            const $logo = self.$header.children('[data-sidenav-logo]').first();
            if ($logo.length) {
                $logo.addClass('ts-sidenav__logo');
            }

            const $title = self.$header.children('[data-sidenav-title]').first();
            if ($title.length) {
                $title.addClass('ts-sidenav__title');
            }

            let $toggle = self.$header.children('[data-sidenav-toggle]').first();

            if (!$toggle.length && self.options.showToggle) {
                $toggle = $(
                    '<button type="button" aria-label="Toggle sidebar"' +
                    ' data-sidenav-toggle data-ts-sidenav-injected-toggle="true"></button>'
                );
                $toggle.html(self._chevronIcon());
                self.$header.append($toggle);
            }

            if ($toggle.length) {
                $toggle.addClass('ts-sidenav__toggle');
                self.$toggle = $toggle;
            }
        }

        _buildBody() {
            const self = this;
            const $el  = self.$el;

            self.$body = $el.find('[data-sidenav-body]').first();
            if (self.$body.length) {
                self.$body.addClass('ts-sidenav__body');
            }
        }

        _buildFooter() {
            const self = this;
            const $el  = self.$el;

            self.$footer = $el.find('[data-sidenav-footer]').first();
            if (!self.$footer.length) return;

            self.$footer.addClass('ts-sidenav__footer');

            self.$footer.children('[data-sidenav-item]').each(function() {
                self._decorateItem($(this));
            });
        }

        _buildGroups() {
            const self = this;
            const $el  = self.$el;

            $el.find('[data-sidenav-group]').each(function() {
                const $group = $(this);
                $group.addClass('ts-sidenav__group');

                const groupTitle =
                    $group.attr('data-sidenav-group-title') ||
                    $group.attr('data-sidenav-group') ||
                    '';

                if (groupTitle) {
                    let $gt = $group.children('[data-sidenav-group-label]').first();

                    if (!$gt.length) {
                        $gt = $('<div data-sidenav-group-label></div>').text(groupTitle);
                        $group.prepend($gt);
                    }

                    $gt.addClass('ts-sidenav__group-title');
                }

                $group.children('[data-sidenav-item]').each(function() {
                    self._decorateItem($(this));
                });
            });

            // Items that sit directly inside the body (not inside a group)
            const $bodyArea = self.$body && self.$body.length ? self.$body : $el;

            $bodyArea.children('[data-sidenav-item]').each(function() {
                self._decorateItem($(this));
            });

            $el.find('[data-sidenav-separator]').addClass('ts-sidenav__separator');
        }

        /**
         * Decorate a single nav item and its sub-items.
         * Guards against double-decoration with jQuery data flag.
         * @param {jQuery} $item
         */
        _decorateItem($item) {
            const self = this;

            if ($item.data('__tsSidenavDecorated')) return;
            $item.data('__tsSidenavDecorated', true);

            $item.addClass('ts-sidenav__item');

            if ($item.is('[data-sidenav-active]')) {
                $item.addClass('ts-sidenav__item--active');
                $item.attr('aria-current', 'page');
            }

            const $icon      = $item.children('[data-sidenav-icon]').first();
            const $label     = $item.children('[data-sidenav-label]').first();
            const $badge     = $item.children('[data-sidenav-badge]').first();
            const $chevron   = $item.children('[data-sidenav-chevron]').first();
            const $subContainer = $item.children('[data-sidenav-sub-items]').first();

            $icon.addClass('ts-sidenav__item-icon');
            $label.addClass('ts-sidenav__item-label');
            $badge.addClass('ts-sidenav__item-badge');
            $chevron.addClass('ts-sidenav__item-chevron').html(self._chevronIcon());

            const tooltipText = $label.text().trim() || $item.attr('title') || '';
            if (tooltipText) {
                $item.attr('data-ts-sidenav-tooltip', tooltipText);
            }

            if ($subContainer.length || $item.is('[data-sidenav-has-children]')) {
                $item.addClass('ts-sidenav__item--has-children');

                // Inject a chevron if the markup doesn't already have one.
                if (!$item.children('.ts-sidenav__item-chevron').length) {
                    const $chev = $(
                        '<span aria-hidden="true" data-ts-sidenav-injected-chevron="true"></span>'
                    );
                    $chev.addClass('ts-sidenav__item-chevron').html(self._chevronIcon());
                    $item.append($chev);
                }

                if ($subContainer.length) {
                    $subContainer.addClass('ts-sidenav__sub-items');

                    $subContainer.children('[data-sidenav-sub-item]').each(function() {
                        self._decorateSubItem($(this));
                    });

                    if (!$subContainer.parent().hasClass('ts-sidenav__sub-shell')) {
                        $subContainer.wrap('<div class="ts-sidenav__sub-shell"></div>');
                    }

                    $item.data('_$subShell', $subContainer.parent());
                }

                // If any child is already active, open the parent immediately
                // (no animation — this runs during init).
                // CSS rule `.ts-sidenav__item--open > .ts-sidenav__sub-shell { height: auto }`
                // provides the open height when the inline style is cleared here.
                const hasActiveChild = $item.find('.ts-sidenav__sub-item--active').length;

                if (hasActiveChild) {
                    $item.addClass('ts-sidenav__item--open');
                    const $shell = self._getShell($item);
                    if ($shell && $shell.length) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }
            }

            if (!$item.is('a')) {
                $item.attr({ role: 'button', tabindex: '0' });
            }
        }

        /**
         * Decorate a sub-item link.
         * @param {jQuery} $sub
         */
        _decorateSubItem($sub) {
            $sub.addClass('ts-sidenav__sub-item');

            if ($sub.is('[data-sidenav-sub-active]')) {
                $sub.addClass('ts-sidenav__sub-item--active');
                $sub.attr('aria-current', 'page');
            }

            if (!$sub.is('a')) {
                $sub.attr({ role: 'button', tabindex: '0' });
            }
        }

        events() {
            const self = this;
            const $el  = self.$el;

            $el.on('click.sidenav', '[data-sidenav-toggle]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggle();
            });

            $el.on('click.sidenav', '.ts-sidenav__item', function(e) {
                const $item = $(this);

                if ($item.is('[data-sidenav-toggle]') ||
                    $item.closest('[data-sidenav-toggle]').length) return;

                if ($item.hasClass('ts-sidenav__item--has-children')) {
                    e.preventDefault();
                    self._toggleSubItems($item);
                    return;
                }

                self.setActive($item);

                const href = $item.attr('href');
                $el.trigger('item.ts.sidenav', [{ $item, href }]);

                if (self.options.autoCollapse && !self._isCollapsed) {
                    self.collapse();
                }
            });

            $el.on('click.sidenav', '.ts-sidenav__sub-item', function(e) {
                // Stop the click from bubbling to the .ts-sidenav__item delegated
                // handler. Without this the parent item's handler fires too,
                // sees --has-children, and calls _toggleSubItems — closing the group.
                e.stopPropagation();
                const $sub = $(this);
                self.setSubActive($sub);
                const href = $sub.attr('href');
                $el.trigger('subitem.ts.sidenav', [{ $item: $sub, href }]);
            });

            $el.on('keydown.sidenav', '[role="button"]', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });

            return this;
        }

        /**
         * Collapse the sidebar to icon-only mode.
         *
         * CSS rule `.ts-sidenav--collapsed .ts-sidenav__sub-shell { height: 0 !important }`
         * handles the visual hiding of open sub-shells. We must NOT set an
         * inline `height: 0px` here — that inline value would persist after
         * expand() removes the `--collapsed` class and block re-expansion.
         */
        collapse() {
            return this._applyCollapsed(true);
        }

        /**
         * Expand the sidebar to full width.
         *
         * Any sub-shells that were open before the collapse still carry the
         * `--open` class. Restore their heights so the user sees them open
         * again without having to re-click.
         */
        expand() {
            this._applyCollapsed(false);

            // Restore previously-open sub-item shells.
            this.$el.find('.ts-sidenav__item--open').each((_, el) => {
                const $item  = $(el);
                const $shell = this._getShell($item);

                if (!$shell || !$shell.length) return;

                const $inner = $shell.children('.ts-sidenav__sub-items');
                if (!$inner.length) return;

                // Measure natural height and set it immediately (no animation
                // needed — the sidebar width transition already provides motion).
                const targetH = $inner[0].scrollHeight;
                $shell.css({ height: targetH + 'px', overflow: '' });

                // Then let it settle to auto so dynamic content resizes freely.
                // The CSS open-state rule (height: auto) takes over when cleared.
                const timerId = setTimeout(() => {
                    if ($item.hasClass('ts-sidenav__item--open')) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }, this._parseDuration(this.options.duration));

                $item.data('_subTimer', timerId);
            });

            return this;
        }

        /**
         * Toggle between collapsed and expanded.
         */
        toggle() {
            return this._isCollapsed ? this.expand() : this.collapse();
        }

        /**
         * Set collapsed state programmatically.
         * @param {boolean} state
         */
        setCollapsed(state) {
            return state ? this.collapse() : this.expand();
        }

        /**
         * Open a specific parent item's sub-nav (no-op if already open).
         * @param {jQuery} $item
         */
        openGroup($item) {
            if (!$item.hasClass('ts-sidenav__item--open')) {
                this._toggleSubItems($item);
            }
            return this;
        }

        /**
         * Close a specific parent item's sub-nav (no-op if already closed).
         * @param {jQuery} $item
         */
        closeGroup($item) {
            if ($item.hasClass('ts-sidenav__item--open')) {
                this._toggleSubItems($item);
            }
            return this;
        }

        /**
         * Return the currently active item and sub-item (if any).
         * @returns {{ item: jQuery, subItem: jQuery }}
         */
        getActive() {
            return {
                item:    this.$el.find('.ts-sidenav__item--active').first(),
                subItem: this.$el.find('.ts-sidenav__sub-item--active').first()
            };
        }

        /**
         * Programmatically set the active top-level item.
         * Clears active from all other items and sub-items.
         * @param {jQuery} $item
         */
        setActive($item) {
            const $el = this.$el;

            $el.find('.ts-sidenav__item--active')
                .removeClass('ts-sidenav__item--active')
                .removeAttr('aria-current');

            $el.find('.ts-sidenav__sub-item--active')
                .removeClass('ts-sidenav__sub-item--active')
                .removeAttr('aria-current');

            $item.addClass('ts-sidenav__item--active').attr('aria-current', 'page');

            return this;
        }

        /**
         * Programmatically set the active sub-item.
         * Clears active from any other sub-item, marks this one, and marks
         * its parent item as active (without adding aria-current to the parent,
         * since the parent is not the current page).
         * @param {jQuery} $sub
         */
        setSubActive($sub) {
            const $el = this.$el;

            $el.find('.ts-sidenav__sub-item--active')
                .removeClass('ts-sidenav__sub-item--active')
                .removeAttr('aria-current');

            $sub.addClass('ts-sidenav__sub-item--active').attr('aria-current', 'page');

            const $parentItem = $sub.closest('.ts-sidenav__item--has-children');

            if ($parentItem.length) {
                $el.find('.ts-sidenav__item--active')
                    .not($parentItem)
                    .removeClass('ts-sidenav__item--active')
                    .removeAttr('aria-current');

                // Parent gets the active highlight class but NOT aria-current —
                // it is the container, not the current page itself.
                $parentItem
                    .addClass('ts-sidenav__item--active ts-sidenav__item--open');
            }

            return this;
        }

        /**
         * Tear down the instance and restore the original DOM.
         */
        destroy() {
            const self = this;
            const $el  = self.$el;

            // Remove all delegated event handlers.
            $el.off('.sidenav');

            // Run registered cleanup callbacks (e.g. window resize handler).
            self._cleanup.forEach(fn => { try { fn(); } catch (e) {} });

            // Cancel any in-flight requestAnimationFrames.
            self._raf.forEach(id => cancelAnimationFrame(id));

            // Cancel any in-flight sub-item accordion timers.
            // Timers are stored via jQuery data on each item element.
            $el.find('[data-sidenav-item]').addBack('[data-sidenav-item]').each(function() {
                const timer = $(this).data('_subTimer');
                if (timer) clearTimeout(timer);
            });

            // Unwrap animated sub-shells.
            $el.find('.ts-sidenav__sub-shell').each(function() {
                const $sub = $(this).children('.ts-sidenav__sub-items');
                if ($sub.length) $sub.unwrap();
            });

            // Remove injected elements.
            $el.find('[data-ts-sidenav-injected-chevron]').remove();
            $el.find('[data-ts-sidenav-injected-toggle]').remove();

            // Strip injected attributes.
            $el.find('[data-ts-sidenav-tooltip]').removeAttr('data-ts-sidenav-tooltip');
            $el.find('[aria-current]').removeAttr('aria-current');
            $el.find('[role="button"]').removeAttr('role tabindex');
            $el.removeAttr('data-sidenav-collapsed');

            // Remove decoration flag from all descendants.
            $el.find('*').removeData('__tsSidenavDecorated').removeData('_subTimer').removeData('_$subShell');

            // Strip all injected classes.
            $el.find('*').removeClass([
                'ts-sidenav__header',
                'ts-sidenav__logo',
                'ts-sidenav__title',
                'ts-sidenav__toggle',
                'ts-sidenav__body',
                'ts-sidenav__footer',
                'ts-sidenav__group',
                'ts-sidenav__group-title',
                'ts-sidenav__item',
                'ts-sidenav__item--active',
                'ts-sidenav__item--has-children',
                'ts-sidenav__item--open',
                'ts-sidenav__item-icon',
                'ts-sidenav__item-label',
                'ts-sidenav__item-badge',
                'ts-sidenav__item-chevron',
                'ts-sidenav__sub-items',
                'ts-sidenav__sub-item',
                'ts-sidenav__sub-item--active',
                'ts-sidenav__separator'
            ].join(' '));

            // Strip root classes and inline custom properties.
            $el.removeClass(
                'ts-sidenav ts-sidenav--dark ts-sidenav--collapsed ts-sidenav--mobile'
            );
            $el.css({
                '--ts-sidenav-width':           '',
                '--ts-sidenav-width-collapsed': '',
                '--ts-sidenav-duration':        '',
                transition:                     ''
            });

            // Remove the instance from element data.
            $el.removeData(instanceName);

            // Clear instance references.
            self._cleanup     = [];
            self._raf         = [];
            self.$header      = null;
            self.$body        = null;
            self.$footer      = null;
            self.$toggle      = null;
            self._resizeHandler = null;

            return this;
        }

        /**
         * Destroy and re-initialise with the same options.
         * Returns the new instance.
         */
        refresh() {
            const $el   = this.$el;
            const opts  = $.extend(true, {}, this.options);
            delete opts.wrapper; // will be re-set by setOptions
            this.destroy();
            return new PluginSideNav($el, opts);
        }

        /**
         * Apply or remove the collapsed state.
         * CSS transition suppression for the initial paint is handled by
         * build() setting `style.transition = 'none'` before this is called.
         * @param {boolean} collapsed
         */
        _applyCollapsed(collapsed) {
            const $el = this.$el;

            this._isCollapsed = collapsed;
            $el.toggleClass('ts-sidenav--collapsed', collapsed);
            $el.attr('data-sidenav-collapsed', collapsed ? 'true' : 'false');
            $el.trigger('toggle.ts.sidenav', [{ collapsed }]);

            return this;
        }

        /**
         * Animate open/close of a parent item's sub-items.
         * @param {jQuery} $item
         */
        _toggleSubItems($item) {
            const self   = this;
            const $el    = self.$el;
            const isOpen = $item.hasClass('ts-sidenav__item--open');
            const $shell = self._getShell($item);

            if (!$shell || !$shell.length) return this;

            const duration = self._parseDuration(self.options.duration);

            // Cancel any in-progress animation for this item.
            clearTimeout($item.data('_subTimer'));

            if (!isOpen) {
                // OPENING
                $item.addClass('ts-sidenav__item--open');
                $shell.css({ overflow: 'hidden', height: '0px' });

                const targetH = $shell.children('.ts-sidenav__sub-items')[0].scrollHeight;

                $shell[0].offsetHeight; // force reflow

                $shell.css('height', targetH + 'px');

                $el.trigger('group-toggle.ts.sidenav', [{ $item, open: true }]);

                const timerId = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    // Set to 'auto' — NOT '' — so the CSS height:0 base rule
                    // does not snap the shell closed when the inline style is removed.
                    $shell.css({ height: 'auto', overflow: '' });
                }, duration);

                $item.data('_subTimer', timerId);

            } else {
                // CLOSING
                const currentH = $shell[0].scrollHeight;
                $shell.css({ overflow: 'hidden', height: currentH + 'px' });

                $shell[0].offsetHeight; // force reflow

                $item.removeClass('ts-sidenav__item--open');
                $shell.css('height', '0px');

                $el.trigger('group-toggle.ts.sidenav', [{ $item, open: false }]);

                const timerId = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $shell.css({ overflow: '' });
                }, duration);

                $item.data('_subTimer', timerId);
            }

            return this;
        }

        /**
         * Walk all item links and match against window.location to set active.
         * Uses the URL API for reliable origin-aware matching with trailing-
         * slash normalisation.
         */
        _autoSetActive() {
            const self    = this;
            const $el     = self.$el;
            let matched   = false;

            const normalize = (url) => {
                try {
                    const u = new URL(url, window.location.origin);
                    return u.origin + (u.pathname.replace(/\/+$/, '') || '/');
                } catch (e) {
                    return null;
                }
            };

            const current = normalize(window.location.href);

            // Walk sub-items first (more specific match wins).
            $el.find('.ts-sidenav__sub-item[href]').each(function() {
                const $sub = $(this);
                const link = normalize($sub.attr('href'));

                if (!link || link !== current) return;

                self.setSubActive($sub);

                const $parentItem = $sub.closest('.ts-sidenav__item--has-children');
                if ($parentItem.length && !$parentItem.hasClass('ts-sidenav__item--open')) {
                    $parentItem.addClass('ts-sidenav__item--open');
                    const $shell = self._getShell($parentItem);
                    if ($shell && $shell.length) {
                        $shell.css({ height: '', overflow: '' });
                    }
                }

                matched = true;
                return false; // break
            });

            if (!matched) {
                $el.find('.ts-sidenav__item[href]').each(function() {
                    const $item = $(this);
                    const link  = normalize($item.attr('href'));

                    if (!link || link !== current) return;

                    self.setActive($item);
                    return false; // break
                });
            }
        }

        /**
         * Retrieve the animated sub-shell for a parent item.
         * Prefers the jQuery-data reference set during decoration (faster),
         * falls back to a direct DOM search.
         * @param {jQuery} $item
         * @returns {jQuery|null}
         */
        _getShell($item) {
            return $item.data('_$subShell') ||
                   $item.children('.ts-sidenav__sub-shell').first() ||
                   null;
        }

        /**
         * Inline chevron SVG — used for the toggle button and auto-injected
         * parent-item chevrons.
         */
        _chevronIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" ' +
                   'viewBox="0 0 15 15" aria-hidden="true"><g fill="none">' +
                   '<path d="M8.21192 3.09155C8.40164 2.95736 8.66555 2.96958' +
                   ' 8.8418 3.13452C9.01806 3.29976 9.04853 3.56338 8.92676' +
                   ' 3.76148L8.86524 3.84155L5.43555 7.49976L8.86524 11.158L8.92676' +
                   ' 11.238C9.04853 11.4361 9.01806 11.6998 8.8418 11.865C8.66555' +
                   ' 12.0299 8.40164 12.0422 8.21192 11.908L8.13477 11.8416L4.38477' +
                   ' 7.84155C4.20487 7.64932 4.20487 7.35019 4.38477 7.15796L8.13477' +
                   ' 3.15796L8.21192 3.09155Z" fill="currentColor"></path></g></svg> ';
        }

        /**
         * Parse a CSS duration string to milliseconds.
         * @param {string|number} str
         * @returns {number}
         */
        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 250;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 250;
        }

    }

    PluginSideNav.defaults = {
        /** Start in collapsed (icon-only) mode. */
        collapsed: false,

        /** Use dark colour scheme. */
        dark: false,

        /** Expanded sidebar width (any CSS length). */
        width: '260px',

        /** Collapsed / icon-only sidebar width. */
        widthCollapsed: '64px',

        /** CSS transition duration for width and sub-item animations. */
        duration: '250ms',

        /** Inject the built-in collapse toggle button in the header. */
        showToggle: false,

        /** Auto-detect and set active item from the current page URL. */
        activeOnLoad: true,

        /** Collapse sidebar when a leaf item is clicked (useful for mobile overlays). */
        autoCollapse: false,

        /**
         * Viewport width (px) below which the sidebar is treated as mobile.
         * Set to null (the default) to disable responsive behaviour entirely.
         * Only activates when collapseOnMobile is also true.
         */
        mobileBreakpoint: null,

        /**
         * Automatically collapse when the viewport drops below mobileBreakpoint,
         * and expand again when it rises above it.
         * Requires mobileBreakpoint to be non-null.
         */
        collapseOnMobile: false,

        /** forceInit: bypass IntersectionObserver — sidebar is layout-critical. */
        forceInit: true,

        /** accY: IntersectionObserver root margin offset (unused with forceInit). */
        accY: 0
    };

    $.extend(themestrap, { PluginSideNav });

    $.fn.themestrapPluginSideNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginSideNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Dark Mode Toggle
 *
 * Toggles light / dark theme on the document by adding or removing the
 * `dark` class on the <html> element  the same hook Themestrap's
 * `feature-layout-dark.html` uses (`<html class="dark">`). Also sets a
 * `data-theme` attribute and `data-bs-theme` attribute so Bootstrap 5.3
 * native components pick up the theme too.
 *
 * Resolution order on first paint:
 *   1. localStorage[options.storageKey]            // explicit user choice
 *   2. window.matchMedia('(prefers-color-scheme: dark)')
 *   3. light
 *
 * The plugin runs its theme-apply step the moment the script executes
 * (before DOMReady) so the correct class is on <html> as early as
 * possible, minimising flash-of-unstyled-content.
 *
 * Persistence:
 *   - Manual clicks save to localStorage.
 *   - Optionally also writes a cookie (off by default) so the server can
 *     read the theme at render time. Enable by setting
 *     `PluginDarkMode.defaults.cookieEnabled = true` before the first
 *     instance is created. See the cookie* options below for tuning.
 *   - Until a manual click has occurred, the page follows OS-level
 *     `prefers-color-scheme` changes in real time.
 *   - `storage` events propagate theme changes between tabs.
 *
 * Markup (auto-init via [data-plugin-darkmode]):
 *   <button data-plugin-darkmode></button>
 *
 *   The plugin injects an SVG sun (light mode) or moon (dark mode) so the
 *   icon reflects the *current* theme.
 *
 * Programmatic API:
 *   themestrap.PluginDarkMode.getTheme()       // 'light' | 'dark'
 *   themestrap.PluginDarkMode.setTheme('dark') // persist + apply
 *   themestrap.PluginDarkMode.toggle()         // flip current theme
 *   themestrap.PluginDarkMode.reset()          // clear override, follow OS
 *   themestrap.PluginDarkMode.apply()          // re-run resolution order
 *
 * Init.js wiring:
 *   if ($.isFunction($.fn['themestrapPluginDarkMode']) && $('[data-plugin-darkmode]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-darkmode]:not(.manual)', 'themestrapPluginDarkMode');
 *   }
 *
 * Optional FOUC-proof head snippet (place BEFORE any CSS in <head>):
 *   <script>
 *     (function(){
 *       try {
 *         var s = localStorage.getItem('themestrap-theme'),
 *             d = matchMedia('(prefers-color-scheme: dark)').matches,
 *             t = s || (d ? 'dark' : 'light'),
 *             h = document.documentElement;
 *         if (t === 'dark') h.classList.add('dark');
 *         h.setAttribute('data-theme', t);
 *         h.setAttribute('data-bs-theme', t);
 *       } catch(e) {}
 *     })();
 *   </script>
 */
(((themestrap = {}, $) => {
    const instanceName = '__darkMode';

    // Sun / moon SVGs (Feather-style monochrome, uses currentColor so the
    // icon picks up the button's text colour).
    const ICON_SUN = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" fill="none" stroke="currentColor"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0m-4-9v2m0 14.004v2M5 12H3m18 0h-2m0-7-2 2M5 5l2 2m0 10-2 2m14 0-2-2"></path></g></svg>';
    const ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path visibility="visible" fill="currentColor" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" d="M12,2.5C17.22,2.5,21.5,6.78,21.5,12C21.5,17.22,17.22,21.5,12,21.5C6.78,21.5,2.5,17.22,2.5,12C2.5,6.78,6.78,2.5,12,2.5 M12.1,4C7.68,4,4.1,7.58,4.1,12C4.1,16.42,7.68,20,12.1,20C16.52,20,20.1,16.42,20.1,12C20.1,7.58,16.52,4,12.1,4 M12.6,14C13.43,14,14.1,14.67,14.1,15.5C14.1,16.33,13.43,17,12.6,17C11.77,17,11.1,16.33,11.1,15.5C11.1,14.67,11.77,14,12.6,14 M8.1,11C8.65,11,9.1,11.45,9.1,12C9.1,12.55,8.65,13,8.1,13C7.55,13,7.1,12.55,7.1,12C7.1,11.45,7.55,11,8.1,11 M14.5,8C15.28,8,16,8.72,16,9.5C16,10.28,15.28,11,14.5,11C13.72,11,13,10.28,13,9.5C13,8.72,13.72,8,14.5,8 M14.45,8.8C14.02,8.8,13.7,9.12,13.7,9.55C13.7,9.98,14.02,10.3,14.45,10.3C14.88,10.3,15.2,9.98,15.2,9.55C15.2,9.12,14.88,8.8,14.45,8.8"></path></g></svg>';

    // Module-level config. Live instances may override per-element, but the
    // *global* theme application uses these. They are mutable through
    // `PluginDarkMode.defaults.*` before the first instance is constructed.
    const config = {
        storageKey:    'themestrap-theme',
        darkClass:     'dark',
        dataAttribute: 'data-theme',
        bsThemeAttribute: 'data-bs-theme',

        // Cookie sync (server-side theme support). Off by default - opt-in
        // because cookies travel on every HTTP request and not every site
        // needs server-side theme awareness.
        cookieEnabled:  false,
        cookieName:     'themestrap-theme',
        cookieMaxAge:   31536000,    // 1 year, in seconds
        cookiePath:     '/',
        cookieSameSite: 'lax',
    };

    // Set of live instances; we notify each on theme change so every toggle
    // button on the page agrees on icon / aria state.
    const instances = new Set();

    function safeRead() {
        try { return window.localStorage?.getItem(config.storageKey) || null; }
        catch { return null; }
    }

    function safeWrite(value) {
        try { window.localStorage?.setItem(config.storageKey, value); }
        catch { /* private mode, quota, etc.  fail silently */ }
    }

    function safeClear() {
        try { window.localStorage?.removeItem(config.storageKey); }
        catch { /* same */ }
    }

    // Cookie helpers - all guarded so they cannot break the plugin if the
    // host environment forbids document.cookie writes.
    function writeCookie(value) {
        if (!config.cookieEnabled) return;
        try {
            const parts = [
                `${encodeURIComponent(config.cookieName)}=${encodeURIComponent(value)}`,
                `path=${config.cookiePath}`,
                `max-age=${config.cookieMaxAge}`,
                `samesite=${config.cookieSameSite}`,
            ];
            // Auto-flag Secure when SameSite=None (browsers reject otherwise)
            // and when the page itself is on https.
            if (config.cookieSameSite.toLowerCase() === 'none'
                    || (typeof location !== 'undefined' && location.protocol === 'https:')) {
                parts.push('secure');
            }
            document.cookie = parts.join('; ');
        } catch { /* SecurityError, etc. - fail silently */ }
    }

    function clearCookie() {
        if (!config.cookieEnabled) return;
        try {
            document.cookie =
                `${encodeURIComponent(config.cookieName)}=; ` +
                `path=${config.cookiePath}; max-age=0; samesite=${config.cookieSameSite}`;
        } catch { /* same */ }
    }

    function systemPrefersDark() {
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function resolveTheme() {
        const stored = safeRead();
        if (stored === 'dark' || stored === 'light') return stored;
        return systemPrefersDark() ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        const html = document.documentElement;
        const isDark = theme === 'dark';

        html.classList.toggle(config.darkClass, isDark);
        
        if (config.swapDarkLight) {
            $('.bg-white:not([data-plugin-darkmode-exempt]), .bg-black:not([data-plugin-darkmode-exempt])').toggleClass('bg-white bg-black');
            $('.bg-light:not([data-plugin-darkmode-exempt]), .bg-dark:not([data-plugin-darkmode-exempt])').toggleClass('bg-light bg-dark');
            $('.bg-light-100:not([data-plugin-darkmode-exempt]), .bg-dark-100:not([data-plugin-darkmode-exempt])').toggleClass('bg-light-100 bg-dark-100');
            $('.bg-light-200:not([data-plugin-darkmode-exempt]), .bg-dark-200:not([data-plugin-darkmode-exempt])').toggleClass('bg-light-200 bg-dark-200');
            $('.bg-light-300:not([data-plugin-darkmode-exempt]), .bg-dark-300:not([data-plugin-darkmode-exempt])').toggleClass('bg-light-300 bg-dark-300');
            $('.bg-light--100:not([data-plugin-darkmode-exempt]), .bg-dark--100:not([data-plugin-darkmode-exempt])').toggleClass('bg-light--100 bg-dark--100');
            $('.bg-light--200:not([data-plugin-darkmode-exempt]), .bg-dark--200:not([data-plugin-darkmode-exempt])').toggleClass('bg-light--200 bg-dark--200');
            $('.bg-light--300:not([data-plugin-darkmode-exempt]), .bg-dark--300:not([data-plugin-darkmode-exempt])').toggleClass('bg-light--300 bg-dark--300');
            $('.bg-color-light:not([data-plugin-darkmode-exempt]), .bg-color-dark:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light bg-color-dark');
            $('.bg-color-light-100:not([data-plugin-darkmode-exempt]), .bg-color-dark-100:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light-100 bg-color-dark-100');
            $('.bg-color-light-200:not([data-plugin-darkmode-exempt]), .bg-color-dark-200:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light-200 bg-color-dark-200');
            $('.bg-color-light-300:not([data-plugin-darkmode-exempt]), .bg-color-dark-300:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light-300 bg-color-dark-300');
            $('.bg-color-light--100:not([data-plugin-darkmode-exempt]), .bg-color-dark--100:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light--100 bg-color-dark--100');
            $('.bg-color-light--200:not([data-plugin-darkmode-exempt]), .bg-color-dark--200:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light--200 bg-color-dark--200');
            $('.bg-color-light--300:not([data-plugin-darkmode-exempt]), .bg-color-dark--300:not([data-plugin-darkmode-exempt])').toggleClass('bg-color-light--300 bg-color-dark--300');
            $('.text-light:not([data-plugin-darkmode-exempt]), .text-dark:not([data-plugin-darkmode-exempt])').toggleClass('text-light text-dark');
            $('.text-color-light:not([data-plugin-darkmode-exempt]), .text-color-dark:not([data-plugin-darkmode-exempt])').toggleClass('text-color-light text-color-dark');
            $('.table-light:not([data-plugin-darkmode-exempt]), .table-dark:not([data-plugin-darkmode-exempt])').toggleClass('table-light table-dark');
        }
        $('.ts-vertical-nav').toggleClass('ts-vn-light');

        if (config.dataAttribute) {
            html.setAttribute(config.dataAttribute, theme);
        }
        if (config.bsThemeAttribute) {
            html.setAttribute(config.bsThemeAttribute, theme);
        }

        // Refresh every live instance so the icon and aria state are in sync.
        instances.forEach((inst) => inst._refreshUI && inst._refreshUI(theme));
    }

    // Early-apply
    // Run immediately on script load, before DOMReady, so the correct class
    // is on <html> as early as the parser will allow. Wrapped in try/catch
    // because the script might run in odd contexts (very early errors here
    // would block the rest of the plugin from registering).
    try { applyTheme(resolveTheme()); } catch (e) { /* no-op */ }

    // System-preference listener
    // Track OS-level theme changes, but only honour them when the user
    // hasn't pinned a preference via a manual toggle (no localStorage value).
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (mql) {
        const handler = (e) => {
            if (!safeRead()) applyTheme(e.matches ? 'dark' : 'light');
        };
        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', handler);
        } else if (typeof mql.addListener === 'function') {
            // Safari < 14 fallback
            mql.addListener(handler);
        }
    }

    // Cross-tab sync
    // When the user toggles theme in another tab, mirror it here.
    window.addEventListener('storage', (e) => {
        if (e.key !== config.storageKey) return;
        if (e.newValue === 'dark' || e.newValue === 'light') {
            applyTheme(e.newValue);
        } else if (e.newValue === null) {
            // Preference was cleared elsewhere  fall back to system.
            applyTheme(systemPrefersDark() ? 'dark' : 'light');
        }
    });

    class PluginDarkMode {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            instances.add(this);
            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const attrOpts = themestrap.fn.getOptions(this.$el.data('plugin-darkmode-options'));

            this.options = $.extend(true, {}, PluginDarkMode.defaults, opts, attrOpts, {
                wrapper: this.$el,
            });

            // Per-instance options may override the module-level config. The
            // first instance wins; subsequent overrides re-apply the theme
            // using the new attributes/class names.
            let configChanged = false;
            [
                'storageKey', 'darkClass', 'dataAttribute', 'bsThemeAttribute',
                'cookieEnabled', 'cookieName', 'cookieMaxAge', 'cookiePath', 'cookieSameSite',
            ].forEach((k) => {
                if (this.options[k] !== undefined && this.options[k] !== config[k]) {
                    config[k] = this.options[k];
                    configChanged = true;
                }
            });
            if (configChanged) {
                applyTheme(resolveTheme());
                // If cookie sync was just turned on, write the current theme
                // so the server sees it on the next request without waiting
                // for the user to toggle.
                if (config.cookieEnabled) {
                    writeCookie(PluginDarkMode.getTheme());
                }
            }

            return this;
        }

        build() {
            // If element is a <button> make sure it has type="button" so it
            // doesn't accidentally submit a wrapping form.
            if (this.$el.is('button') && !this.$el.attr('type')) {
                this.$el.attr('type', 'button');
            }
            // Non-button elements get keyboard semantics.
            if (!this.$el.is('button, a, [role]')) {
                this.$el.attr('role', 'button');
                if (this.$el.attr('tabindex') === undefined) {
                    this.$el.attr('tabindex', '0');
                }
            }

            this._refreshUI(PluginDarkMode.getTheme());
            return this;
        }

        events() {
            const self = this;

            self.$el.on('click.darkmode', function (e) {
                e.preventDefault();
                PluginDarkMode.toggle();
            });

            // Keyboard activation for non-button toggles  buttons handle
            // space/enter natively.
            if (!self.$el.is('button')) {
                self.$el.on('keydown.darkmode', function (e) {
                    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
                        e.preventDefault();
                        PluginDarkMode.toggle();
                    }
                });
            }

            return this;
        }

        // Called by the module-level applyTheme() whenever the theme changes.
        // Updates the icon, aria-pressed and aria-label so the button always
        // reflects current state.
        _refreshUI(theme) {
            const o = this.options;
            const isDark = theme === 'dark';

            if (o.renderIcon) {
                // Sun icon when in LIGHT mode, moon when in DARK mode  the
                // icon represents the current theme, not the action.
                this.$el.html(isDark ? o.iconMoon : o.iconSun);
            }

            // Aria label describes what clicking will *do*.
            const label = isDark ? o.ariaLabelLight : o.ariaLabelDark;
            this.$el.attr({
                'aria-label': label,
                'title': label,
                'aria-pressed': isDark ? 'true' : 'false',
            });

            // Themeable hook classes for styling the toggle itself.
            this.$el
                .toggleClass('is-dark', isDark)
                .toggleClass('is-light', !isDark);

            if (typeof o.onChange === 'function') {
                o.onChange.call(this, theme);
            }

            return this;
        }

        destroy() {
            this.$el.off('.darkmode').removeData(instanceName);
            instances.delete(this);
            return this;
        }

        // Static API
        // All callable without an element instance, e.g. from a settings menu,
        // a keyboard shortcut handler, or another plugin.
        static getTheme() {
            return document.documentElement.classList.contains(config.darkClass) ? 'dark' : 'light';
        }

        static setTheme(theme) {
            if (theme !== 'dark' && theme !== 'light') return;
            safeWrite(theme);
            writeCookie(theme);
            applyTheme(theme);
        }

        static toggle() {
            PluginDarkMode.setTheme(PluginDarkMode.getTheme() === 'dark' ? 'light' : 'dark');
        }

        // Clear any saved override and revert to OS preference.
        static reset() {
            safeClear();
            clearCookie();
            applyTheme(systemPrefersDark() ? 'dark' : 'light');
        }

        // Re-run the full resolution order. Useful after manually changing
        // PluginDarkMode.defaults.storageKey or similar.
        static apply() {
            applyTheme(resolveTheme());
        }
    }

    PluginDarkMode.defaults = {
        // localStorage key. Override before first init to share theme state
        // across multiple Themestrap projects on the same domain.
        storageKey:       'themestrap-theme',

        // Class added to <html> when dark mode is active. Must match the
        // selector Themestrap CSS uses - leave at 'dark' for stock theme.
        darkClass:        'dark',

        // Whether to toggle classes that are specific to dark/light.
        // i.e. 'bg-light' <-> 'bg-dark' or 'text-light' <-> 'text-dark'
        // Won't effect any element with 'data-plugin-darkmode-exempt'
        swapDarkLight:    false,

        // Attribute set on <html> reflecting the current theme.
        // Set to null/false to disable.
        dataAttribute:    'data-theme',

        // Bootstrap 5.3 native theme attribute. Harmless on older Bootstrap.
        // Set to null/false to disable.
        bsThemeAttribute: 'data-bs-theme',

        // Cookie sync. Off by default - turn on for server-side awareness
        // (e.g. when MODX needs to know the theme at render time). When
        // enabled, every setTheme/toggle/reset call also writes (or clears)
        // the cookie alongside localStorage.
        cookieEnabled:    true,
        cookieName:       'themestrap-theme',
        cookieMaxAge:     31536000,    // 1 year, in seconds
        cookiePath:       '/',
        cookieSameSite:   'lax',       // 'lax' | 'strict' | 'none'

        // Whether to inject the SVG icon into the toggle button. Disable if
        // you want to render your own icon/label markup inside the button.
        renderIcon:       true,
        iconSun:          ICON_SUN,
        iconMoon:         ICON_MOON,

        // Accessible labels  describe the *action* of clicking.
        ariaLabelLight:   'Switch to light mode',
        ariaLabelDark:    'Switch to dark mode',

        // function(theme) {  }   called on every theme change for this
        // instance (after the DOM has been updated).
        onChange:         null,
    };

    $.extend(themestrap, { PluginDarkMode });

    $.fn.themestrapPluginDarkMode = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginDarkMode($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Auth Plugin
 * Progressive-enhancement layer for MODX Login extra forms (and any auth form).
 * Part of the Themestrap component library for MODX 3
 *
 * Adds inline validation, password show/hide, password-strength meter, loading
 * button state, toast feedback, and optional AJAX submission to login,
 * register, forgot-password, reset-password, change-password, and
 * update-profile forms.
 *
 * Markup anatomy:
 *
 *   <form data-plugin-auth
 *         data-auth-action="login"
 *         data-plugin-options='{"ajax": false, "toasts": true, "redirect": "/dashboard"}'
 *         method="post"
 *         action="">
 *
 *     <div data-auth-field="username">
 *       <label for="auth-username">Username</label>
 *       <input id="auth-username" name="username" type="text"
 *              required data-auth-error class="form-control">
 *       <div data-auth-feedback class="invalid-feedback"></div>
 *     </div>
 *
 *     <div data-auth-field="password">
 *       <label for="auth-password">Password</label>
 *       <div class="input-group">
 *         <input id="auth-password" name="password" type="password"
 *                required minlength="8" data-auth-strength
 *                data-auth-error class="form-control">
 *         <button type="button" class="btn btn-outline-secondary"
 *                 data-auth-toggle-password>Show</button>
 *       </div>
 *       <div data-auth-strength-meter class="auth-strength"></div>
 *       <div data-auth-feedback class="invalid-feedback"></div>
 *     </div>
 *
 *     <button type="submit" data-auth-submit class="btn btn-primary">
 *       <span data-auth-submit-label>Sign In</span>
 *       <span data-auth-spinner class="spinner-border spinner-border-sm d-none"
 *             role="status" aria-hidden="true"></span>
 *     </button>
 *   </form>
 *
 * Public API (via stored instance):
 *   const auth = $('#myForm').data('__pluginAuth');
 *   auth.validate();           // returns true | false
 *   auth.setBusy(true|false);  // toggle loading state
 *   auth.reset();              // clear all field error states
 *   auth.destroy();
 *
 * Events fired on the form element:
 *   auth:validate   (instance, isValid)
 *   auth:submit     (instance, formData)
 *   auth:success    (instance, response)
 *   auth:error      (instance, error)
 *
 * Init.js wiring (DOMReady-immediate â€” auth forms must work without scrolling):
 *   if ($.isFunction($.fn['themestrapPluginAuth']) && $('[data-plugin-auth]').length) {
 *       $(() => {
 *           $('[data-plugin-auth]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginAuth(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginAuth';
    
    // Injected stylesheet â€” runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-auth-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
        /* Themestrap Auth Plugin â€” supplementary styles
           Pairs with themestrap.plugin.auth.js.
           Bootstrap 5 provides the bulk of validation styling (is-invalid / is-valid /
           invalid-feedback); these rules add only what the framework is missing:
           the segmented password-strength meter, the Caps Lock hint pill, and a few
           ergonomic spacings on auth forms. */

        .auth-form .form-control:focus {
            box-shadow: 0 0 0 .2rem rgba(13, 110, 253, .15);
        }

        /* Password strength meter
           Built lazily by PluginAuth â€” five <span class="auth-strength-bar"> +
           one <span class="auth-strength-label">. Bar colours are applied via
           Bootstrap utility classes (.bg-danger / .bg-warning / .bg-info / .bg-success). */
        .auth-strength {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 6px;
            height: 22px;
        }

        .auth-strength .auth-strength-bar {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: #e9ecef;
            transition: background-color .2s ease;
        }

        .auth-strength .auth-strength-label {
            margin-left: 8px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .04em;
            text-transform: uppercase;
            color: #6c757d;
            min-width: 64px;
        }

        /* Caps Lock hint pill
           Rendered inside [data-auth-field] for password fields. The plugin toggles
           .d-none on [data-auth-capslock] based on keyup CapsLock state. */
        .auth-capslock {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            border-radius: 10px;
            background: #fff3cd;
            color: #664d03;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .03em;
        }

        .auth-capslock::before {
            content: "â‡ª ";
            margin-right: 4px;
        }

        /* Profile card */
        .auth-profile-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 18px 20px;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            background: #fff;
        }

        .auth-profile-card .auth-profile-avatar {
            flex: 0 0 64px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #e9ecef center/cover no-repeat;
            color: #6c757d;
            font-size: 26px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
        }

        .auth-profile-card .auth-profile-name {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
        }

        .auth-profile-card .auth-profile-meta {
            margin: 0;
            font-size: 13px;
            color: #6c757d;
        }

        .auth-profile-card .auth-profile-actions {
            margin-left: auto;
            display: flex;
            gap: 8px;
        }

        /* Compact spinner-in-button alignment */
        .auth-form [data-auth-submit] {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        /* Optional: smooth disabled state */
        .auth-form [data-auth-submit][disabled] {
            cursor: progress;
            opacity: .75;
        }
        `;
        document.head.appendChild(style);
    }

    // Password strength scoring (0-4, no zxcvbn dependency).
    function scorePassword(pw) {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 8)  score++;
        if (pw.length >= 12) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw))   score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(score, 4);
    }

    const STRENGTH_LABELS  = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const STRENGTH_CLASSES = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
    const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    class PluginAuth {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el    = $el;
            this.action = ($el.data('auth-action') || 'login').toString().toLowerCase();
            this.busy   = false;
            this._uid   = 'auth-' + Math.random().toString(36).slice(2, 8);

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
            this.options = $.extend(true, {}, PluginAuth.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            const self = this;
            const $el  = self.$el;

            self.$fields  = $el.find('[data-auth-field]');
            self.$inputs  = $el.find('[data-auth-error]');
            self.$submit  = $el.find('[data-auth-submit]').first();
            self.$label   = self.$submit.find('[data-auth-submit-label]').first();
            self.$spinner = self.$submit.find('[data-auth-spinner]').first();

            if (self.$label.length) {
                self.originalLabel = self.$label.text();
            }

            $el.addClass('auth-form auth-form-' + self.action);
            $el.attr('novalidate', 'novalidate');

            return this;
        }

        events() {
            const self = this;
            const $el  = self.$el;
            const ns   = '.' + self._uid;

            // Form submit
            $el.on('submit' + ns, function (e) {
                if (!self.validate()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    self._toastError(self.options.errorMessage ||
                        $el.data('auth-error-msg') ||
                        'Please correct the highlighted fields.');
                    return false;
                }

                $el.trigger('auth:submit', [self, self._collect()]);

                if (self.options.ajax) {
                    e.preventDefault();
                    self._submitAjax();
                    return false;
                }

                self.setBusy(true);
            });

            // Live validation on blur / change
            self.$inputs.on('blur' + ns + ' change' + ns, function () {
                self._validateField($(this));
            });

            // Re-validate on input once a field has been marked invalid
            self.$inputs.on('input' + ns, function () {
                const $i = $(this);
                if ($i.hasClass('is-invalid')) {
                    self._validateField($i);
                }
            });

            // Password strength meter â€” live update
            $el.find('[data-auth-strength]').on('input' + ns, function () {
                self._updateStrength($(this));
            });

            // Password toggle (Show / Hide)
            $el.on('click' + ns, '[data-auth-toggle-password]', function (e) {
                e.preventDefault();
                self._togglePassword($(this));
            });

            // Caps Lock warning on password inputs
            $el.find('input[type="password"]').on('keyup' + ns, function (e) {
                const caps = e.originalEvent && typeof e.originalEvent.getModifierState === 'function'
                    ? e.originalEvent.getModifierState('CapsLock')
                    : false;
                const $field = $(this).closest('[data-auth-field]');
                $field.find('[data-auth-capslock]').toggleClass('d-none', !caps);
            });

            return this;
        }

        // Public API 
        validate() {
            const self = this;
            let valid = true;

            self.$inputs.each(function () {
                if (!self._validateField($(this))) {
                    valid = false;
                }
            });

            self.$el.trigger('auth:validate', [self, valid]);
            return valid;
        }

        reset() {
            const self = this;
            self.$inputs
                .removeClass('is-invalid is-valid')
                .closest('[data-auth-field]')
                .find('[data-auth-feedback]').text('');
            return self;
        }

        setBusy(busy) {
            const self = this;
            self.busy = !!busy;

            if (!self.$submit.length) return self;

            self.$submit.prop('disabled', self.busy);

            if (self.$spinner.length) {
                self.$spinner.toggleClass('d-none', !self.busy);
            }

            if (self.$label.length) {
                self.$label.text(self.busy
                    ? (self.options.busyLabel || 'Working...')
                    : self.originalLabel
                );
            }

            return self;
        }

        destroy() {
            const self = this;
            const ns   = '.' + self._uid;

            self.$el.off(ns);
            self.$inputs.off(ns);
            self.$el.find('[data-auth-strength]').off(ns);
            self.$el.find('input[type="password"]').off(ns);
            self.$el.removeClass('auth-form auth-form-' + self.action);
            self.$el.removeData(instanceName);

            return self;
        }

        // Internals
        _validateField($input) {
            const self     = this;
            const $field   = $input.closest('[data-auth-field]');
            const $fb      = $field.find('[data-auth-feedback]').first();
            const val      = ($input.val() || '').toString();
            const type     = ($input.attr('type') || 'text').toLowerCase();
            const required = $input.prop('required');

            let error = '';

            if (required && !val.trim()) {
                error = self.options.messages.required;
            }
            else if (val && type === 'email' && !EMAIL_RX.test(val)) {
                error = self.options.messages.email;
            }
            else if (val && $input.attr('minlength')) {
                const min = parseInt($input.attr('minlength'), 10);
                if (val.length < min) {
                    error = self.options.messages.minlength.replace('%s', min);
                }
            }
            else if (val && $input.attr('pattern')) {
                try {
                    if (!new RegExp('^(?:' + $input.attr('pattern') + ')$').test(val)) {
                        error = self.options.messages.pattern;
                    }
                } catch (e) { /* malformed pattern â€” skip */ }
            }
            else if (val && $input.data('auth-match')) {
                const target = $input.data('auth-match');
                const $other = self.$el.find(target);
                if ($other.length && val !== ($other.val() || '').toString()) {
                    error = self.options.messages.match;
                }
            }

            if (error) {
                $input.removeClass('is-valid').addClass('is-invalid');
                if ($fb.length) $fb.text(error);
                return false;
            }

            $input.removeClass('is-invalid');
            if (val.trim()) $input.addClass('is-valid');
            if ($fb.length) $fb.text('');
            return true;
        }

        _updateStrength($input) {
            const val   = ($input.val() || '').toString();
            const score = scorePassword(val);
            const $field = $input.closest('[data-auth-field]');
            const $meter = $field.find('[data-auth-strength-meter]').first();

            if (!$meter.length) return;

            // Lazy-construct the 5 bar segments
            if (!$meter.children().length) {
                const bars = [0, 1, 2, 3, 4]
                    .map(() => '<span class="auth-strength-bar"></span>')
                    .join('');
                $meter
                    .addClass('auth-strength')
                    .html(bars + '<span class="auth-strength-label"></span>');
            }

            const $bars  = $meter.children('.auth-strength-bar');
            const $label = $meter.children('.auth-strength-label');

            $bars.each(function (i) {
                $(this)
                    .removeClass('bg-danger bg-warning bg-info bg-success')
                    .toggleClass(STRENGTH_CLASSES[score], i <= score && val.length > 0);
            });

            $label.text(val.length ? STRENGTH_LABELS[score] : '');
        }

        _togglePassword($btn) {
            const $field = $btn.closest('[data-auth-field]');
            const $pw    = $field.find('input').filter(function () {
                const t = ($(this).attr('type') || '').toLowerCase();
                return t === 'password' || t === 'text';
            }).filter('[data-auth-strength], [name*="password"]').first();

            if (!$pw.length) return;

            const isHidden = $pw.attr('type') === 'password';
            $pw.attr('type', isHidden ? 'text' : 'password');
            $btn.text(isHidden
                ? (this.options.hidePasswordLabel || 'Hide')
                : (this.options.showPasswordLabel || 'Show')
            );
            $btn.attr('aria-pressed', isHidden ? 'true' : 'false');
        }

        _collect() {
            const data = {};
            this.$el.find('input, select, textarea').each(function () {
                const $i = $(this);
                const name = $i.attr('name');
                if (!name) return;
                const type = ($i.attr('type') || '').toLowerCase();
                if ((type === 'checkbox' || type === 'radio') && !$i.prop('checked')) return;
                data[name] = $i.val();
            });
            return data;
        }

        _submitAjax() {
            const self = this;
            const $el  = self.$el;
            const url  = $el.attr('action') || window.location.href;

            self.setBusy(true);

            $.ajax({
                url:      url,
                method:   ($el.attr('method') || 'POST').toUpperCase(),
                data:     $el.serialize(),
                dataType: 'json',
                headers:  { 'X-Requested-With': 'XMLHttpRequest' },
            })
            .done(function (resp) {
                const ok = resp && (resp.success === true || resp.success === 'true');

                if (ok) {
                    self._toastSuccess(resp.message || $el.data('auth-success-msg') || self.options.successMessage);
                    $el.trigger('auth:success', [self, resp]);

                    const redirect = resp.redirect || $el.data('auth-redirect') || self.options.redirect;
                    if (redirect) {
                        setTimeout(() => { window.location.href = redirect; }, 600);
                    } else {
                        self.setBusy(false);
                    }
                    return;
                }

                // Server reported failure â€” paint field errors if provided
                if (resp && resp.errors && typeof resp.errors === 'object') {
                    Object.keys(resp.errors).forEach(name => {
                        const $i = $el.find('[name="' + name + '"]').first();
                        if (!$i.length) return;
                        $i.removeClass('is-valid').addClass('is-invalid');
                        const $fb = $i.closest('[data-auth-field]').find('[data-auth-feedback]').first();
                        if ($fb.length) $fb.text(resp.errors[name]);
                    });
                }

                self._toastError((resp && resp.message) || self.options.errorMessage);
                $el.trigger('auth:error', [self, resp]);
                self.setBusy(false);
            })
            .fail(function (xhr) {
                const msg = (xhr && xhr.responseJSON && xhr.responseJSON.message)
                    || self.options.networkErrorMessage;
                self._toastError(msg);
                $el.trigger('auth:error', [self, { network: true, status: xhr.status }]);
                self.setBusy(false);
            });
        }

        _toastSuccess(body) {
            if (!this.options.toasts || !body) return;
            if (themestrap && themestrap.PluginToast) {
                themestrap.PluginToast.show({
                    title: this.options.toastSuccessTitle,
                    body:  body,
                    type:  'success',
                });
            }
        }

        _toastError(body) {
            if (!this.options.toasts || !body) return;
            if (themestrap && themestrap.PluginToast) {
                themestrap.PluginToast.show({
                    title: this.options.toastErrorTitle,
                    body:  body,
                    type:  'danger',
                });
            }
        }
    }

    PluginAuth.defaults = {
        // Submission
        ajax:                false,    // when true, posts via XHR and expects JSON
        redirect:            '',       // URL to redirect to after AJAX success

        // Feedback
        toasts:              true,     // emit PluginToast on success / error
        toastSuccessTitle:   'Success',
        toastErrorTitle:     'Sorry',
        successMessage:      '',
        errorMessage:        'Please check the form for errors.',
        networkErrorMessage: 'Could not reach the server. Please try again.',

        // UI labels
        busyLabel:           'Working...',
        showPasswordLabel:   'Show',
        hidePasswordLabel:   'Hide',

        // Validation messages
        messages: {
            required:  'This field is required.',
            email:     'Please enter a valid email address.',
            minlength: 'Must be at least %s characters.',
            pattern:   'Invalid format.',
            match:     'Values do not match.',
        },
    };

    $.extend(themestrap, { PluginAuth });

    $.fn.themestrapPluginAuth = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginAuth($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Command Menu Plugin
 * Accessible, keyboard-driven command palette
 * Part of the Themestrap component library for MODX 3.
 *
 * Features:
 *   â€¢ Global keyboard shortcut (default: Cmd/Ctrl+K) to summon the palette anywhere.
 *   â€¢ Live fuzzy-ish substring filtering as the user types â€” searches the visible
 *     label, the optional description, AND any space-delimited keywords supplied
 *     via [data-command-keywords].
 *   â€¢ Keyboard navigation â€” ArrowUp / ArrowDown / Home / End / PgUp / PgDn,
 *     Enter to execute, Escape to close. The active item is auto-scrolled into view.
 *   â€¢ Item activation modes â€” navigate to [data-command-href], dispatch a
 *     [data-command-action] event, or invoke a JS callback registered against an
 *     [data-command-action] key.
 *   â€¢ Group headings â€” items inside a [data-command-group] share a sticky heading
 *     pulled from [data-command-heading]. Empty groups auto-hide as the user
 *     filters.
 *   â€¢ Empty state â€” a [data-command-empty] element is shown when no items match.
 *   â€¢ Recent commands â€” optionally pinned at the top of the list and persisted to
 *     localStorage (one history list per instance ID).
 *   â€¢ Full ARIA combobox + listbox pattern with aria-activedescendant.
 *
 * Markup anatomy:
 *
 *   <!-- Trigger (anywhere in the DOM) -->
 *   <button data-command-open="main-cmd">
 *     <kbd>âŒ˜</kbd><kbd>K</kbd>
 *   </button>
 *
 *   <!-- Command Menu root -->
 *   <div data-plugin-command-menu id="main-cmd"
 *        data-plugin-options='{"shortcut": "mod+k", "recent": true}'>
 *
 *     <!-- Backdrop -->
 *     <div data-command-backdrop></div>
 *
 *     <!-- Panel -->
 *     <div data-command-panel>
 *
 *       <!-- Search input -->
 *       <div data-command-search>
 *         <i class="fas fa-search"></i>
 *         <input data-command-input type="text" placeholder="Type a command..." />
 *       </div>
 *
 *       <!-- List of groups and items -->
 *       <div data-command-list>
 *
 *         <!-- Empty state -->
 *         <div data-command-empty>No results found.</div>
 *
 *         <!-- Optional recents group (auto-managed when recent: true) -->
 *         <div data-command-group data-command-heading="Recent"
 *              data-command-recent></div>
 *
 *         <!-- Static groups -->
 *         <div data-command-group data-command-heading="Navigation">
 *           <button data-command-item
 *                   data-command-keywords="dashboard overview"
 *                   data-command-href="/dashboard">
 *             <i class="fas fa-home" data-command-icon></i>
 *             <span data-command-label>Dashboard</span>
 *             <span data-command-description>Go to the dashboard</span>
 *             <kbd data-command-shortcut>G D</kbd>
 *           </button>
 *
 *           <button data-command-item
 *                   data-command-action="new-project">
 *             <i class="fas fa-plus" data-command-icon></i>
 *             <span data-command-label>New projectâ€¦</span>
 *             <kbd data-command-shortcut>âŒ˜ N</kbd>
 *           </button>
 *         </div>
 *       </div>
 *
 *       <!-- Optional footer -->
 *       <div data-command-footer>
 *         <kbd>â†‘</kbd><kbd>â†“</kbd> to navigate
 *         <kbd>â†µ</kbd> to select
 *         <kbd>esc</kbd> to close
 *       </div>
 *     </div>
 *   </div>
 *
 * Public API (via stored instance):
 *   const cmd = $('#main-cmd').data('__pluginCommandMenu');
 *   cmd.open();
 *   cmd.close();
 *   cmd.toggle();
 *   cmd.setQuery('proj');
 *   cmd.registerAction('new-project', () => { ... });
 *
 * Events fired on the command menu root element:
 *   command:open    â€” after the open transition begins                 (instance)
 *   command:close   â€” after the close transition completes             (instance)
 *   command:filter  â€” every time the query changes after filtering     (instance, query, matchCount)
 *   command:select  â€” when an item is activated (before navigation)    (instance, $item, payload)
 *
 * Init.js wiring (DOMReady-immediate â€” must be ready before any trigger fires):
 *   if ($.isFunction($.fn['themestrapPluginCommandMenu']) && $('[data-plugin-command-menu]').length) {
 *       $(() => {
 *           $('[data-plugin-command-menu]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginCommandMenu(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginCommandMenu';
    

    // Injected stylesheet â€” runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-vertical-nav-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `           /** 
             *  Themestrap Command Menu â€” Styles
             *
             *  Every selector is data-attribute driven (no React, no headless
             *  wrappers â€” just classes and data-* hooks).
             *
             *  Variables can be overridden globally via :root, per-instance via the
             *  .command-menu element, or via theme skins (dark mode, brand colours).
             */
            :root {
                --command-bg:              var(--light-100);
                --command-fg:              var(--default);
                --command-muted:           var(--dark-rgba-50);
                --command-border:          rgba(15, 23, 42, 0.08);
                --command-border-strong:   rgba(15, 23, 42, 0.16);
                --command-hover:           rgba(15, 23, 42, 0.04);
                --command-active-bg:       rgba(15, 23, 42, 0.06);
                --command-active-fg:       #0f172a;
                --command-accent:          var(--primary);
                --command-backdrop:        rgba(15, 23, 42, 0.55);
                --command-radius:          14px;
                --command-radius-item:     8px;
                --command-shadow:          0 24px 56px -12px rgba(15, 23, 42, 0.32),
                                           0 4px 12px -4px rgba(15, 23, 42, 0.16);
                --command-panel-width:     min(96vw, 640px);
                --command-list-max-h:      min(60vh, 480px);
                --command-z:               1080;
                --command-font:            inherit;
            }

            /* Dark variant */
            html.dark .command-menu,
            .command-menu.command-dark {
                --command-bg:            var(--dark-100);
                --command-fg:            var(--default);
                --command-muted:         var(--light-rgba-50);
                --command-border:        rgba(255, 255, 255, 0.08);
                --command-border-strong: rgba(255, 255, 255, 0.16);
                --command-hover:         rgba(255, 255, 255, 0.06);
                --command-active-bg:     rgba(255, 255, 255, 0.10);
                --command-active-fg:     #ffffff;
                --command-backdrop:      rgba(0, 0, 0, 0.6);
                --command-shadow:        0 24px 56px -12px rgba(0, 0, 0, 0.6),
                                         0 4px 12px -4px rgba(0, 0, 0, 0.4);
            }

            /* Root container */
            .command-menu {
                position: fixed;
                inset: 0;
                z-index: var(--command-z);
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: clamp(40px, 12vh, 120px) 16px 16px;
                font-family: var(--command-font);
                color: var(--command-fg);
                pointer-events: auto;
            }

            .command-menu.command-hidden {
                /* Use display:none so focus can never reach the panel when closed */
                display: none;
            }

            /* Backdrop */
            .command-menu [data-command-backdrop] {
                position: absolute;
                inset: 0;
                background: var(--command-backdrop);
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                animation: command-fade-in 180ms ease both;
            }

            .command-menu.command-hidden [data-command-backdrop] {
                animation: none;
            }

            /* Panel */
            .command-menu [data-command-panel] {
                position: relative;
                width: var(--command-panel-width);
                background: var(--command-bg);
                color: var(--command-fg);
                border: 1px solid var(--command-border);
                border-radius: var(--command-radius);
                box-shadow: var(--command-shadow);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                max-height: min(80vh, 720px);
                animation: command-panel-in 200ms cubic-bezier(.16, 1, .3, 1) both;
            }

            /* Panel size variants */
            .command-menu [data-command-panel].command-sm  { --command-panel-width: min(96vw, 440px); }
            .command-menu [data-command-panel].command-lg  { --command-panel-width: min(96vw, 800px); }
            .command-menu [data-command-panel].command-xl  { --command-panel-width: min(96vw, 960px); }

            /* Search row */
            .command-menu [data-command-search] {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 18px;
                border-bottom: 1px solid var(--command-border);
            }

            .command-menu [data-command-search] > i,
            .command-menu [data-command-search] > svg {
                color: var(--command-muted);
                font-size: 16px;
                flex: 0 0 auto;
                pointer-events: none;
            }

            .command-menu [data-command-input] {
                flex: 1 1 auto;
                appearance: none;
                border: 0;
                outline: 0;
                background: transparent;
                color: var(--command-fg);
                font-size: 15px;
                line-height: 1.5;
                padding: 4px 0;
                font-family: inherit;
            }

            .command-menu [data-command-input]::placeholder {
                color: var(--command-muted);
                opacity: 1;
            }

            /* Optional close shortcut hint inside the search row */
            .command-menu [data-command-search] kbd {
                background: var(--command-hover);
                border: 1px solid var(--command-border);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* List & groups */
            .command-menu [data-command-list] {
                flex: 1 1 auto;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 6px;
                max-height: var(--command-list-max-h);
                scrollbar-width: thin;
                scrollbar-color: var(--command-border-strong) transparent;
            }

            .command-menu [data-command-list]::-webkit-scrollbar {
                width: 8px;
            }
            .command-menu [data-command-list]::-webkit-scrollbar-thumb {
                background: var(--command-border-strong);
                border-radius: 8px;
            }

            .command-menu [data-command-group] {
                padding: 4px 0;
            }

            .command-menu [data-command-group][hidden] {
                display: none;
            }

            .command-menu [data-command-group-heading] {
                padding: 8px 10px 4px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--command-muted);
                user-select: none;
            }

            /* Visual separator between groups */
            .command-menu [data-command-group] + [data-command-group] {
                border-top: 1px solid var(--command-border);
                margin-top: 6px;
                padding-top: 8px;
            }

            /* Items */
            .command-menu [data-command-item] {
                appearance: none;
                border: 0;
                background: transparent;
                color: inherit;
                text-align: left;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 9px 10px;
                border-radius: var(--command-radius-item);
                font-size: 14px;
                line-height: 1.4;
                cursor: pointer;
                transition: background-color 80ms ease, color 80ms ease;
                font-family: inherit;
            }

            .command-menu [data-command-item][hidden] {
                display: none;
            }

            .command-menu [data-command-item]:hover,
            .command-menu [data-command-item].command-item-active,
            .command-menu [data-command-item][aria-selected="true"] {
                background: var(--command-active-bg);
                color: var(--command-active-fg);
                outline: none;
            }

            .command-menu [data-command-item]:focus-visible {
                outline: 2px solid var(--command-accent);
                outline-offset: -2px;
            }

            .command-menu [data-command-item][disabled],
            .command-menu [data-command-item][aria-disabled="true"] {
                opacity: 0.45;
                cursor: not-allowed;
                pointer-events: none;
            }

            /* Item icon */
            .command-menu [data-command-item] [data-command-icon] {
                flex: 0 0 18px;
                width: 18px;
                text-align: center;
                color: var(--command-muted);
                font-size: 15px;
                transition: color 80ms ease;
            }

            .command-menu [data-command-item].command-item-active [data-command-icon],
            .command-menu [data-command-item]:hover [data-command-icon] {
                color: var(--command-active-fg);
            }

            /* Item label + description column */
            .command-menu [data-command-item] [data-command-label] {
                flex: 1 1 auto;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
            }

            .command-menu [data-command-item] [data-command-description] {
                display: block;
                font-size: 12px;
                color: var(--command-muted);
                font-weight: 400;
                margin-top: 1px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* When both label and description live in their own span, stack them */
            .command-menu [data-command-item] [data-command-label]:has(+ [data-command-description]) {
                /* No-op for fallback; the structural CSS below handles stacking */
            }

            .command-menu [data-command-item]:has([data-command-description]) [data-command-label] {
                display: block;
            }

            .command-menu [data-command-item]:has([data-command-description]) {
                align-items: center;
            }

            /* Wrap label + description in an inline column when both are present */
            .command-menu [data-command-item] [data-command-label] + [data-command-description] {
                /* If author puts description after label without a wrapper, force it onto its own line */
                width: 100%;
                flex: 1 0 100%;
                margin-top: 2px;
                margin-left: 30px;   /* align with label, accounting for icon column */
            }

            /* Right-aligned shortcut */
            .command-menu [data-command-item] [data-command-shortcut] {
                flex: 0 0 auto;
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 3px;
                color: var(--command-muted);
                font-size: 11.5px;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
                font-weight: 500;
            }

            .command-menu [data-command-item] [data-command-shortcut] kbd,
            .command-menu [data-command-item] kbd[data-command-shortcut] {
                background: var(--command-hover);
                border: 1px solid var(--command-border);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* Right-aligned trailing badge (e.g. "New", "Beta") */
            .command-menu [data-command-item] [data-command-badge] {
                flex: 0 0 auto;
                margin-left: auto;
                display: inline-block;
                padding: 0px 8px;
                border-radius: 999px;
                padding-top: 2px;
                background: var(--command-accent);
                color: #fff;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 0.02em;
                text-transform: uppercase;
            }

            /* Empty state */
            .command-menu [data-command-empty] {
                padding: 36px 16px;
                text-align: center;
                color: var(--command-muted);
                font-size: 14px;
                line-height: 1.5;
            }

            .command-menu [data-command-empty] strong {
                display: block;
                color: var(--command-fg);
                font-weight: 600;
                margin-bottom: 4px;
            }

            /* Footer */
            .command-menu [data-command-footer] {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 8px 14px;
                border-top: 1px solid var(--command-border);
                background: var(--command-hover);
                color: var(--command-muted);
                font-size: 11.5px;
                flex-wrap: wrap;
            }

            .command-menu [data-command-footer] span,
            .command-menu [data-command-footer] .command-footer-item {
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .command-menu [data-command-footer] kbd {
                background: var(--command-bg);
                border: 1px solid var(--command-border-strong);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
                box-shadow: 0 1px 0 var(--command-border);
            }

            /* External trigger button preset */
            [data-command-open] {
                /* Subtle inline-input lookalike â€” entirely optional, opt in via the
                   .command-trigger class or use your own button styling. */
            }

            .command-trigger {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 6px 10px 6px 12px;
                background: var(--command-bg, #fff);
                color: var(--command-muted, #64748b);
                border: 1px solid var(--command-border, rgba(15, 23, 42, 0.12));
                border-radius: 8px;
                font-size: 13px;
                line-height: 1.4;
                min-width: 220px;
                cursor: pointer;
                transition: border-color 100ms ease, box-shadow 100ms ease, background 100ms ease;
            }

            .command-trigger:hover {
                border-color: var(--command-border-strong, rgba(15, 23, 42, 0.2));
                background: var(--command-hover, rgba(15, 23, 42, 0.04));
            }

            .command-trigger .command-trigger-label {
                flex: 1 1 auto;
                text-align: left;
            }

            .command-trigger .command-trigger-shortcut {
                flex: 0 0 auto;
                display: inline-flex;
                gap: 3px;
            }

            .command-trigger .command-trigger-shortcut kbd {
                background: var(--command-hover, rgba(15, 23, 42, 0.06));
                border: 1px solid var(--command-border, rgba(15, 23, 42, 0.12));
                color: var(--command-muted, #64748b);
                border-radius: 4px;
                padding: 1px 5px;
                font-size: 10.5px;
                line-height: 1.2;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* Animations */
            @keyframes command-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            @keyframes command-fade-out {
                from { opacity: 1; }
                to   { opacity: 0; }
            }

            @keyframes command-panel-in {
                from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }

            @keyframes command-panel-out {
                from { opacity: 1; transform: translateY(0)    scale(1);    }
                to   { opacity: 0; transform: translateY(-4px) scale(0.98); }
            }

            /* Animate.css compat â€” the plugin applies generic animation classes. */
            .command-menu [data-command-panel].fadeIn  { animation-name: command-panel-in;  }
            .command-menu [data-command-panel].fadeOut { animation-name: command-panel-out; }

            /* Reduced motion override */
            @media (prefers-reduced-motion: reduce) {
                .command-menu [data-command-panel],
                .command-menu [data-command-backdrop],
                .command-menu [data-command-panel].fadeIn,
                .command-menu [data-command-panel].fadeOut {
                    animation: none !important;
                }
            }

            /* Responsive â€” full-screen on phones */
            @media (max-width: 575.98px) {
                .command-menu {
                    padding: 0;
                    align-items: stretch;
                }
                .command-menu [data-command-panel],
                .command-menu [data-command-panel].command-sm,
                .command-menu [data-command-panel].command-lg,
                .command-menu [data-command-panel].command-xl {
                    width: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                    border: 0;
                }
                .command-menu [data-command-list] {
                    max-height: none;
                    flex: 1 1 auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Scrollbar measurement â€” same approach as PluginDialog, shared CSS var.
    // If PluginDialog has already set --dialog-scrollbar-width we leave it alone.
    (function measureScrollbarWidth() {
        function measure() {
            if (document.documentElement.style.getPropertyValue('--dialog-scrollbar-width')) return;

            const outer = document.createElement('div');
            outer.style.cssText = 'visibility:hidden;overflow:scroll;position:absolute;width:100px';
            document.body.appendChild(outer);
            const width = outer.offsetWidth - outer.clientWidth;
            document.body.removeChild(outer);
            document.documentElement.style.setProperty('--dialog-scrollbar-width', width + 'px');
        }

        if (document.body) {
            measure();
        } else {
            document.addEventListener('DOMContentLoaded', measure, { once: true });
        }
    })();

    // Short collision-resistant ID generator.
    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    // Platform detection â€” Mac uses âŒ˜ (metaKey), Win/Linux uses Ctrl.
    const isMac = typeof navigator !== 'undefined' &&
                  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');

    /**
     * Parse a shortcut string like "mod+k", "ctrl+shift+p", "/", "?" into a
     * descriptor object used by the keydown matcher.
     *
     *   mod  â†’ âŒ˜ on Mac, Ctrl on others
     *   alt  â†’ Alt / Option
     *   shift â†’ Shift
     *   key  â†’ the actual non-modifier key
     */
    function parseShortcut(str) {
        if (!str) return null;
        const parts = String(str).toLowerCase().split('+').map(s => s.trim());
        const desc = { mod: false, ctrl: false, alt: false, shift: false, key: '' };
        parts.forEach(p => {
            if (p === 'mod')        desc.mod   = true;
            else if (p === 'ctrl')  desc.ctrl  = true;
            else if (p === 'alt' || p === 'option') desc.alt = true;
            else if (p === 'shift') desc.shift = true;
            else                    desc.key   = p;
        });
        return desc;
    }

    function matchShortcut(e, desc) {
        if (!desc || !desc.key) return false;

        // Normalize the event key â€” "K" vs "k", spacebar's " ", etc.
        const key = (e.key || '').toLowerCase();
        if (key !== desc.key) return false;

        const modActive = isMac ? e.metaKey : e.ctrlKey;

        if (desc.mod   && !modActive) return false;
        if (!desc.mod  &&  desc.ctrl && !e.ctrlKey) return false;
        if (desc.alt   && !e.altKey) return false;
        if (desc.shift && !e.shiftKey) return false;

        // If mod isn't required, ensure the OS modifier ISN'T pressed
        // (so "/" doesn't fire while Cmd+/ is held).
        if (!desc.mod && !desc.ctrl) {
            if (e.metaKey || e.ctrlKey) return false;
        }

        return true;
    }

    /**
     * Should the global shortcut be ignored because the user is mid-typing?
     * We DO want âŒ˜K to work inside ordinary inputs (matching Linear / Vercel /
     * GitHub behaviour), so we only block plain printable shortcuts.
     */
    function isTypingTarget(target, desc) {
        if (desc && (desc.mod || desc.ctrl)) return false;

        const tag = (target && target.tagName) ? target.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
        if (target && target.isContentEditable) return true;
        return false;
    }

    class PluginCommandMenu {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el            = $el;
            this.$previousFocus = null;
            this.isOpen         = false;
            this._uid           = uid('command');
            this._actions       = {};      // string key â†’ callback
            this._activeIndex   = -1;      // index into _visibleItems
            this._visibleItems  = $();
            this._query         = '';

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
            this.options = $.extend(true, {}, PluginCommandMenu.defaults, opts, {
                wrapper: this.$el,
            });

            // Pre-compute shortcut descriptor once.
            this._shortcutDesc = parseShortcut(this.options.shortcut);

            return this;
        }

        build() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // ARIA scaffolding â€” dialog wrapping a combobox over a listbox.
            $el
                .addClass('command-menu')
                .attr('role', 'dialog')
                .attr('aria-modal', 'true')
                .attr('aria-hidden', 'true')
                .attr('aria-label', $el.attr('aria-label') || 'Command Menu')
                .attr('tabindex', '-1');

            // Ensure backdrop element exists.
            self.$backdrop = $el.find('[data-command-backdrop]');
            if (!self.$backdrop.length && opts.backdrop) {
                self.$backdrop = $('<div data-command-backdrop></div>').prependTo($el);
            }

            // Cache key elements
            self.$panel     = $el.find('[data-command-panel]').first();
            self.$input     = $el.find('[data-command-input]').first();
            self.$list      = $el.find('[data-command-list]').first();
            self.$empty     = $el.find('[data-command-empty]').first();
            self.$footer    = $el.find('[data-command-footer]').first();
            self.$recent    = $el.find('[data-command-recent]').first();

            // Hidden by default â€” CSS-class driven so theming has full control.
            if (!$el.hasClass('command-is-open')) {
                $el.addClass('command-hidden');
            }

            // ARIA wiring on the input
            if (self.$input.length) {
                const listId = self.$list.attr('id') || uid('command-list');
                self.$list.attr('id', listId).attr('role', 'listbox');

                self.$input
                    .attr('role',           'combobox')
                    .attr('autocomplete',   'off')
                    .attr('autocorrect',    'off')
                    .attr('autocapitalize', 'off')
                    .attr('spellcheck',     'false')
                    .attr('aria-autocomplete', 'list')
                    .attr('aria-expanded',  'false')
                    .attr('aria-controls',  listId);
            }

            // Assign IDs to every item so we can use aria-activedescendant
            $el.find('[data-command-item]').each(function () {
                const $it = $(this);
                if (!$it.attr('id'))   $it.attr('id', uid('command-item'));
                if (!$it.attr('role')) $it.attr('role', 'option');
                $it.attr('aria-selected', 'false');
                $it.attr('tabindex', '-1');
            });

            // Group ARIA
            $el.find('[data-command-group]').each(function () {
                const $g = $(this);
                if (!$g.attr('role')) $g.attr('role', 'group');
                const heading = $g.attr('data-command-heading');
                if (heading && !$g.find('[data-command-group-heading]').length) {
                    $('<div data-command-group-heading></div>').text(heading).prependTo($g);
                }
            });

            // Hide empty state initially
            if (self.$empty.length) {
                self.$empty.attr('hidden', true);
            }

            // Render recents bucket on first build
            if (opts.recent) {
                self._renderRecent();
            } else if (self.$recent.length) {
                self.$recent.hide();
            }

            // Build the cached pool of items used by filter().
            self._allItems = $el.find('[data-command-item]');

            return this;
        }

        events() {
            const self     = this;
            const $el      = self.$el;
            const opts     = self.options;
            const dialogId = $el.attr('id');

            // External trigger buttons.
            if (dialogId) {
                $(document).on(
                    `click.commandmenu.${self._uid}`,
                    `[data-command-open="${dialogId}"]`,
                    function (e) {
                        e.preventDefault();
                        self.toggle();
                    }
                );
            }

            // Internal close buttons
            $el.on('click.commandmenu', '[data-command-close]', function (e) {
                e.preventDefault();
                self.close();
            });

            // Backdrop click to close
            if (opts.closeOnBackdrop && self.$backdrop && self.$backdrop.length) {
                $el.on('click.commandmenu.backdrop', function (e) {
                    if ($(e.target).is('[data-command-backdrop]')) {
                        self.close();
                    }
                });
            }

            // Item activation â€” click or Enter on focused item
            $el.on('click.commandmenu', '[data-command-item]', function (e) {
                e.preventDefault();
                self._activate($(this));
            });

            // Item hover should sync the active index
            $el.on('mousemove.commandmenu', '[data-command-item]', function () {
                const idx = self._visibleItems.index(this);
                if (idx >= 0 && idx !== self._activeIndex) {
                    self._setActive(idx, false);   // no scroll on hover
                }
            });

            // Search input
            if (self.$input.length) {
                self.$input.on('input.commandmenu', function () {
                    self._query = this.value;
                    self._filter();
                });

                // Key handling on the input (navigation must work while typing)
                self.$input.on('keydown.commandmenu', function (e) {
                    self._onInputKey(e);
                });
            }

            // Document-level keydown â€” Escape, shortcuts, etc.
            $(document).on(`keydown.commandmenu.${self._uid}`, function (e) {
                // Escape always closes when open
                if (self.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                    e.preventDefault();
                    self.close();
                    return;
                }

                // Global open shortcut â€” only when CLOSED
                if (!self.isOpen && self._shortcutDesc) {
                    if (isTypingTarget(e.target, self._shortcutDesc)) return;

                    if (matchShortcut(e, self._shortcutDesc)) {
                        e.preventDefault();
                        self.open();
                    }
                }
            });

            return this;
        }

        open() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (self.isOpen) return this;
            self.isOpen = true;

            self.$previousFocus = $(document.activeElement);

            if (opts.scrollLock) {
                $('body').addClass('dialog-scroll-lock');
            }

            $el
                .removeClass('command-hidden')
                .addClass('command-is-open')
                .attr('aria-hidden', 'false');

            if (self.$input.length) {
                self.$input.attr('aria-expanded', 'true');
            }

            const $animTarget = self.$panel.length ? self.$panel : $el;
            if (opts.animationIn) {
                $animTarget
                    .addClass(`command-anim-enter ${opts.animationIn}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`command-anim-enter ${opts.animationIn}`);
                    });
                setTimeout(() => {
                    $animTarget.removeClass(`command-anim-enter ${opts.animationIn}`);
                }, opts.animationDuration + 50);
            }

            // Reset query each open unless preserveQuery is on
            if (!opts.preserveQuery) {
                self._query = '';
                if (self.$input.length) self.$input.val('');
            }

            // Initial filter pass to populate _visibleItems
            self._filter();

            // Focus the search input
            setTimeout(() => {
                if (self.$input.length) {
                    self.$input.trigger('focus');
                    if (opts.preserveQuery && self.$input.val()) {
                        // Select all so typing replaces it
                        self.$input[0].setSelectionRange(0, self.$input.val().length);
                    }
                }
            }, 50);

            if (typeof opts.onOpen === 'function') opts.onOpen.call(self, $el);
            $el.trigger('command:open', [self]);

            return this;
        }

        close() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return this;

            const $animTarget = self.$panel.length ? self.$panel : $el;

            if (opts.animationOut) {
                $animTarget
                    .addClass(`command-anim-leave ${opts.animationOut}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`command-anim-leave ${opts.animationOut}`);
                        self._finishClose();
                    });
                setTimeout(() => {
                    $animTarget.removeClass(`command-anim-leave ${opts.animationOut}`);
                    self._finishClose();
                }, opts.animationDuration + 50);
            } else {
                self._finishClose();
            }

            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        /**
         * Programmatically set the search query. Triggers the same filter()
         * pipeline as user typing.
         */
        setQuery(q) {
            const self = this;
            self._query = q || '';
            if (self.$input.length) self.$input.val(self._query);
            self._filter();
            return this;
        }

        /**
         * Register a JS callback against a [data-command-action] key. When the
         * matching item is activated, the callback receives ($item, instance).
         */
        registerAction(key, cb) {
            if (typeof key === 'string' && typeof cb === 'function') {
                this._actions[key] = cb;
            }
            return this;
        }

        /**
         * Unregister an action. No-op if the key was never registered.
         */
        unregisterAction(key) {
            delete this._actions[key];
            return this;
        }

        /**
         * Manually push a "recent" entry. Normally this happens automatically
         * when an item is selected and opts.recent is true.
         */
        pushRecent(id) {
            this._pushRecent(id);
            this._renderRecent();
            return this;
        }

        /**
         * Clear stored recent entries.
         */
        clearRecent() {
            const key = this._recentKey();
            if (key && typeof localStorage !== 'undefined') {
                try { localStorage.removeItem(key); } catch (_) {}
            }
            this._renderRecent();
            return this;
        }

        _finishClose() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return;
            self.isOpen = false;

            $el
                .addClass('command-hidden')
                .removeClass('command-is-open')
                .attr('aria-hidden', 'true');

            if (self.$input.length) {
                self.$input.attr('aria-expanded', 'false');
                self.$input.removeAttr('aria-activedescendant');
            }

            if (opts.scrollLock) {
                $('body').removeClass('dialog-scroll-lock');
            }

            if (self.$previousFocus && self.$previousFocus.length) {
                self.$previousFocus.trigger('focus');
                self.$previousFocus = null;
            }

            if (typeof opts.onClose === 'function') opts.onClose.call(self, $el);
            $el.trigger('command:close', [self]);
        }

        /**
         * The core filter pipeline â€” runs on every input event and on open().
         * Builds the _visibleItems set, hides non-matching items, hides empty
         * groups, toggles the empty state, and re-selects the first match.
         */
        _filter() {
            const self = this;
            const opts = self.options;
            const q    = self._query.trim().toLowerCase();
            const tokens = q ? q.split(/\s+/) : [];

            // 1. Per-item match
            const visible = [];

            self._allItems.each(function () {
                const $it = $(this);

                // Items marked data-command-skip-filter are always shown when
                // their parent group is shown (used for static helpers like
                // "Clear recents").
                if ($it.is('[data-command-skip-filter]')) {
                    $it.removeAttr('hidden');
                    if (tokens.length === 0 || self._matchItem($it, tokens)) {
                        visible.push(this);
                    }
                    return;
                }

                if (tokens.length === 0 || self._matchItem($it, tokens)) {
                    $it.removeAttr('hidden');
                    visible.push(this);
                } else {
                    $it.attr('hidden', true);
                    $it.attr('aria-selected', 'false');
                }
            });

            // 2. Hide empty groups (groups with no visible items)
            self.$el.find('[data-command-group]').each(function () {
                const $g = $(this);
                const hasVisible = $g.find('[data-command-item]:not([hidden])').length > 0;
                if (hasVisible) {
                    $g.removeAttr('hidden');
                } else {
                    $g.attr('hidden', true);
                }
            });

            // 3. Toggle empty state
            self._visibleItems = $(visible);
            if (self.$empty.length) {
                if (visible.length === 0) {
                    self.$empty.removeAttr('hidden');
                } else {
                    self.$empty.attr('hidden', true);
                }
            }

            // 4. Re-select first item
            if (self._visibleItems.length) {
                self._setActive(0, false);
            } else {
                self._activeIndex = -1;
                if (self.$input.length) self.$input.removeAttr('aria-activedescendant');
            }

            // 5. Notify listeners
            self.$el.trigger('command:filter', [self, q, visible.length]);

            if (typeof opts.onFilter === 'function') {
                opts.onFilter.call(self, q, visible.length);
            }

            return this;
        }

        /**
         * Test a single item against a token list. Tokens are AND'd together.
         * The haystack is built from: label, description, keywords, and the
         * item's own text content (fallback when no [data-command-label]).
         */
        _matchItem($it, tokens) {
            // Build a haystack â€” cache it on the element after first read.
            let hay = $it.data('_commandHay');
            if (!hay) {
                const parts = [];
                const $label = $it.find('[data-command-label]').first();
                parts.push($label.length ? $label.text() : $it.text());

                const $desc = $it.find('[data-command-description]').first();
                if ($desc.length) parts.push($desc.text());

                const kw = $it.attr('data-command-keywords');
                if (kw) parts.push(kw);

                hay = parts.join(' ').toLowerCase().replace(/\s+/g, ' ').trim();
                $it.data('_commandHay', hay);
            }

            // Every token must appear in the haystack.
            for (let i = 0; i < tokens.length; i++) {
                if (hay.indexOf(tokens[i]) === -1) return false;
            }
            return true;
        }

        /**
         * Move the active index to `idx` (clamped to visible range) and update
         * ARIA + visual state. When `scroll` is true, the item is scrolled into
         * view inside the list.
         */
        _setActive(idx, scroll) {
            const self = this;
            const len  = self._visibleItems.length;
            if (!len) {
                self._activeIndex = -1;
                return;
            }
            // Clamp / wrap
            if (idx < 0)    idx = len - 1;
            if (idx >= len) idx = 0;

            // Clear previous
            self._visibleItems.attr('aria-selected', 'false')
                              .removeClass('command-item-active');

            self._activeIndex = idx;
            const $cur = self._visibleItems.eq(idx);
            $cur.attr('aria-selected', 'true').addClass('command-item-active');

            const itemId = $cur.attr('id');
            if (itemId && self.$input.length) {
                self.$input.attr('aria-activedescendant', itemId);
            }

            if (scroll !== false) self._scrollIntoView($cur);
        }

        _scrollIntoView($item) {
            if (!$item || !$item.length || !this.$list.length) return;
            const item = $item[0];
            const list = this.$list[0];

            const iTop    = item.offsetTop;
            const iBottom = iTop + item.offsetHeight;
            const lTop    = list.scrollTop;
            const lBottom = lTop + list.clientHeight;

            if (iTop < lTop) {
                list.scrollTop = iTop;
            } else if (iBottom > lBottom) {
                list.scrollTop = iBottom - list.clientHeight;
            }
        }

        _onInputKey(e) {
            const self = this;
            const len  = self._visibleItems.length;
            const key  = e.key;

            // Allow consumers to handle keys before us
            const beforeEvent = $.Event('command:keydown', { originalEvent: e });
            self.$el.trigger(beforeEvent, [self, key]);
            if (beforeEvent.isDefaultPrevented()) {
                e.preventDefault();
                return;
            }

            switch (key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (len) self._setActive(self._activeIndex + 1);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    if (len) self._setActive(self._activeIndex - 1);
                    break;

                case 'Home':
                    e.preventDefault();
                    if (len) self._setActive(0);
                    break;

                case 'End':
                    e.preventDefault();
                    if (len) self._setActive(len - 1);
                    break;

                case 'PageDown':
                    e.preventDefault();
                    if (len) self._setActive(Math.min(self._activeIndex + 5, len - 1));
                    break;

                case 'PageUp':
                    e.preventDefault();
                    if (len) self._setActive(Math.max(self._activeIndex - 5, 0));
                    break;

                case 'Enter':
                    if (self._activeIndex >= 0) {
                        e.preventDefault();
                        self._activate(self._visibleItems.eq(self._activeIndex));
                    }
                    break;

                case 'Tab':
                    // Trap focus inside the menu
                    if (!e.shiftKey && self._activeIndex >= 0) {
                        e.preventDefault();
                        self._setActive(self._activeIndex + 1);
                    } else if (e.shiftKey && self._activeIndex >= 0) {
                        e.preventDefault();
                        self._setActive(self._activeIndex - 1);
                    }
                    break;
            }
        }

        /**
         * Run the activation pipeline for an item:
         *   1. Fire command:select (cancellable)
         *   2. Push to recents
         *   3. Resolve action: href â†’ navigate, action key â†’ callback, else close
         */
        _activate($item) {
            const self = this;
            const opts = self.options;

            if (!$item || !$item.length || $item.is('[disabled], [aria-disabled="true"]')) {
                return;
            }

            const payload = {
                id:       $item.attr('id'),
                action:   $item.attr('data-command-action'),
                href:     $item.attr('data-command-href'),
                target:   $item.attr('data-command-target'),
                label:    ($item.find('[data-command-label]').first().text() || $item.text()).trim(),
            };

            // Fire select event â€” preventDefault to suppress navigation/close.
            const evt = $.Event('command:select');
            self.$el.trigger(evt, [self, $item, payload]);

            if (typeof opts.onSelect === 'function') {
                opts.onSelect.call(self, $item, payload);
            }

            if (evt.isDefaultPrevented()) return;

            // Track recent
            if (opts.recent && payload.id) {
                self._pushRecent(payload.id);
            }

            // Resolve action
            if (payload.action && typeof self._actions[payload.action] === 'function') {
                self._actions[payload.action].call(self, $item, self);
            } else if (payload.href) {
                if (opts.closeOnSelect) self.close();
                if (payload.target && payload.target !== '_self') {
                    window.open(payload.href, payload.target);
                    return;
                }
                window.location.href = payload.href;
                return;
            }

            if (opts.closeOnSelect) self.close();
        }

        _recentKey() {
            const id = this.$el.attr('id');
            if (!id) return null;
            return `themestrap.command.recent.${id}`;
        }

        _getRecent() {
            const key = this._recentKey();
            if (!key || typeof localStorage === 'undefined') return [];
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : [];
            } catch (_) {
                return [];
            }
        }

        _pushRecent(id) {
            const self = this;
            const key  = self._recentKey();
            if (!key || typeof localStorage === 'undefined') return;
            const list = self._getRecent().filter(x => x !== id);
            list.unshift(id);
            const trimmed = list.slice(0, self.options.recentLimit);
            try {
                localStorage.setItem(key, JSON.stringify(trimmed));
            } catch (_) {}
            self._renderRecent();
        }

        /**
         * Render the recents group by cloning each remembered item from the
         * static list into the [data-command-recent] container.
         */
        _renderRecent() {
            const self = this;
            const $rec = self.$recent;
            if (!$rec.length) return;

            $rec.empty();

            const ids = self._getRecent();
            if (!ids.length) {
                $rec.hide();
                return;
            }

            ids.forEach(id => {
                const $orig = self.$el.find(`#${$.escapeSelector ? $.escapeSelector(id) : id}`).first();
                // Don't clone items that no longer exist (or items inside the recents bucket itself).
                if (!$orig.length || $orig.closest('[data-command-recent]').length) return;

                const $clone = $orig.clone(true);
                // Mark the clone so we can identify it later if needed.
                $clone.attr('data-command-clone', id);
                // Give clones a unique ID so aria-activedescendant works for them too.
                $clone.attr('id', uid('command-item'));
                // Restore default ARIA state on the clone.
                $clone.attr('aria-selected', 'false').removeClass('command-item-active');
                $clone.removeAttr('hidden');
                $clone.removeData('_commandHay');
                $rec.append($clone);
            });

            $rec.show();

            // Re-prime the cached pool â€” clones are real items too.
            self._allItems = self.$el.find('[data-command-item]');
        }

        destroy() {
            const self = this;
            if (self.isOpen) self.close();

            $(document).off(`click.commandmenu.${self._uid}`);
            $(document).off(`keydown.commandmenu.${self._uid}`);
            self.$el.off('.commandmenu');
            if (self.$input.length) self.$input.off('.commandmenu');

            self.$el
                .removeData(instanceName)
                .removeClass('command-menu command-hidden command-is-open')
                .removeAttr('role aria-modal aria-hidden aria-label tabindex');

            return this;
        }
    }

    PluginCommandMenu.defaults = {
        // Global keyboard shortcut to summon the menu. Use "mod+k" for âŒ˜K on Mac
        // and Ctrl+K elsewhere. Set to null to disable the global shortcut.
        shortcut         : 'mod+k',

        // Close behaviour
        closeOnBackdrop  : true,
        closeOnSelect    : true,

        // Backdrop & scroll-lock
        backdrop         : true,
        scrollLock       : true,

        // Animation classes applied to [data-command-panel] (falls back to root).
        animationIn      : 'fadeIn',
        animationOut     : 'fadeOut',
        animationDuration: 200,

        // When true, the search query survives close/reopen cycles.
        preserveQuery    : false,

        // Recent commands â€” auto-cloned into [data-command-recent] when present.
        recent           : false,
        recentLimit      : 5,

        // Lifecycle callbacks. All receive `this` as the plugin instance.
        onOpen           : null,    // ($el)
        onClose          : null,    // ($el)
        onFilter         : null,    // (query, matchCount)
        onSelect         : null,    // ($item, payload)
    };

    $.extend(themestrap, { PluginCommandMenu });

    $.fn.themestrapPluginCommandMenu = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCommandMenu($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Panel Navigation
 *
 * A vertical link list with a caret-right active indicator, expandable
 * drawer-toggle parent sections, optional left icons + right metadata,
 * section headings, and separators.
 */
// Panel Nav
(((themestrap = {}, $) => {

    const instanceName = '__pluginPanelNav';

    // Injected stylesheet - runs once per page, keyed to the plugin style ID.
    const STYLE_ID = 'ts-panelnav-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
/* Themestrap - PluginPanelNav */
.ts-panelnav {
    --ts-pn-duration:           240ms;
    --ts-pn-easing:             cubic-bezier(0.4, 0, 0.2, 1);

    /* Geometry */
    --ts-pn-width:              280px;
    --ts-pn-collapsed-width:    64px;
    --ts-pn-item-pad-y:         0.5rem;
    --ts-pn-item-pad-x:         1rem;
    --ts-pn-indent-step:        1rem;
    --ts-pn-font-size:          0.875rem;

    /* Colours â€” override via CSS or data-plugin-options */
    --ts-pn-bg:                 #ffffff;
    --ts-pn-border-color:       #e6e9ee;

    --ts-pn-text:               #1c1f23;
    --ts-pn-text-muted:         #6b7785;
    --ts-pn-icon-color:         #6b7785;

    --ts-pn-accent:             var(--color-primary, #2470de);
    --ts-pn-item-hover-bg:      #f4f6f8;
    --ts-pn-item-active-bg:     transparent;
    --ts-pn-item-active-text:   var(--ts-pn-accent);
    --ts-pn-item-active-icon:   var(--ts-pn-accent);
    --ts-pn-active-bar:         var(--ts-pn-accent);

    --ts-pn-section-title:      #8a93a0;
    --ts-pn-metadata-color:     #8a93a0;

    --ts-pn-focus-ring:         var(--ts-pn-accent);

    box-sizing: border-box;
    width: var(--ts-pn-width);
    max-width: 100%;
    background-color: var(--ts-pn-bg);
    color: var(--ts-pn-text);
    font-size: var(--ts-pn-font-size);
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
}

/* Smooth width change for the collapsible rail */
.ts-panelnav--collapsible {
    transition: width var(--ts-pn-duration) var(--ts-pn-easing);
}

.ts-panelnav *,
.ts-panelnav *::before,
.ts-panelnav *::after { box-sizing: border-box; }

/* Dark variant */
.ts-panelnav--dark {
    --ts-pn-bg:                 #10151c;
    --ts-pn-border-color:       #232c38;

    --ts-pn-text:               #e7ecf2;
    --ts-pn-text-muted:         #8794a3;
    --ts-pn-icon-color:         #8794a3;

    --ts-pn-accent:             #6fa8ff;
    --ts-pn-item-hover-bg:      #1a212b;
    --ts-pn-item-active-text:   #9cc4ff;
    --ts-pn-item-active-icon:   #9cc4ff;
    --ts-pn-active-bar:         #6fa8ff;

    --ts-pn-section-title:      #6b7785;
    --ts-pn-metadata-color:     #6b7785;
}

/* Full-height variant (when used as a left rail) */
.ts-panelnav--fill {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Outer border / card framing */
.ts-panelnav--bordered {
    border: 1px solid var(--ts-pn-border-color);
    border-radius: 0.5rem;
    overflow: hidden;
}

/* Compact density */
.ts-panelnav--compact {
    --ts-pn-item-pad-y: 0.3125rem;
    --ts-pn-font-size:  0.8125rem;
}

/* Collapse-toggle button injected into the actions header */
.ts-panelnav-collapse-toggle {
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--ts-pn-text-muted);
    cursor: pointer;
    transition: background-color var(--ts-pn-duration) var(--ts-pn-easing),
                color var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panelnav-collapse-toggle:hover {
    background: var(--ts-pn-item-hover-bg);
    color: var(--ts-pn-text);
}
.ts-panelnav-collapse-toggle:focus-visible {
    outline: 2px solid var(--ts-pn-focus-ring);
    outline-offset: 1px;
}
.ts-panelnav-collapse-toggle svg {
    width: 1rem;
    height: 1rem;
    transition: transform var(--ts-pn-duration) var(--ts-pn-easing);
}
/* Chevron points left when expanded, right when collapsed */
.ts-panelnav--collapsed .ts-panelnav-collapse-toggle svg {
    transform: rotate(180deg);
}

/* Collapsed geometry */
.ts-panelnav--collapsed {
    width: var(--ts-pn-collapsed-width);
}

/* While collapsed: drop the text-y bits to icons only. We keep the DOM
   intact and just hide via opacity+width so expansion animates cleanly. */
.ts-panelnav--collapsed .ts-panelnav-text,
.ts-panelnav--collapsed .ts-panelnav-metadata,
.ts-panelnav--collapsed .ts-panelnav-toggle-icon,
.ts-panelnav--collapsed .ts-panelnav-active-indicator,
.ts-panelnav--collapsed .ts-panelnav-actions-title {
    opacity: 0;
    width: 0;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    pointer-events: none;
    white-space: nowrap;
}

/* Section titles collapse to a thin rule so groups stay visually separated */
.ts-panelnav--collapsed .ts-panelnav-section-title {
    height: 1px;
    padding: 0;
    margin: 0.375rem 0.75rem;
    color: transparent;
    background: var(--ts-pn-border-color);
    overflow: hidden;
}

/* Center the icon within the narrowed row, kill the depth indent */
.ts-panelnav--collapsed .ts-panelnav-link {
    justify-content: center;
    padding-left: var(--ts-pn-item-pad-x);
    padding-right: var(--ts-pn-item-pad-x);
}
.ts-panelnav--collapsed .ts-panelnav-icon {
    margin: 0;
}

/* Suppress open drawers while collapsed (children are hidden in mini mode) */
.ts-panelnav--collapsed .ts-panelnav-drawer {
    height: 0 !important;
    overflow: hidden !important;
}

/* Active bar still reads in collapsed mode; caret indicator is hidden above */
.ts-panelnav--collapsed.ts-panelnav--indicator-caret
    .ts-panelnav-item--active > .ts-panelnav-link::before {
    height: 62%;
}

/* expandOnHover: temporarily restore full width + contents on hover.
   Implemented by removing the collapsed sizing while hovered. */
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover {
    width: var(--ts-pn-width);
}
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-text,
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-metadata,
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-toggle-icon,
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-active-indicator,
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-actions-title {
    opacity: 1;
    width: auto;
    min-width: 0;
    pointer-events: auto;
}
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-metadata {
    margin-left: auto;
}
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-link {
    justify-content: flex-start;
}
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-section-title {
    height: auto;
    padding: 0.375rem var(--ts-pn-item-pad-x) 0.25rem;
    margin: 0;
    color: var(--ts-pn-section-title);
    background: transparent;
}
.ts-panelnav--collapsed.ts-panelnav--expand-on-hover:hover .ts-panelnav-item--open
    > .ts-panelnav-drawer {
    height: auto !important;
    overflow: visible !important;
}

/* Actions header (title row / close button etc.) */
.ts-panelnav-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem var(--ts-pn-item-pad-x);
    border-bottom: 1px solid var(--ts-pn-border-color);
    flex-shrink: 0;
}

.ts-panelnav-actions-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ts-pn-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Scrollable body */
.ts-panelnav-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.375rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--ts-pn-border-color) transparent;
}
.ts-panelnav-body::-webkit-scrollbar { width: 5px; }
.ts-panelnav-body::-webkit-scrollbar-thumb {
    background-color: var(--ts-pn-border-color);
    border-radius: 3px;
}

/* When there is no explicit body wrapper the root scrolls itself */
.ts-panelnav:not(.ts-panelnav--fill) > .ts-panelnav-list:first-child,
.ts-panelnav:not(.ts-panelnav--fill) > .ts-panelnav-section:first-child {
    padding-top: 0.375rem;
}

/* Sections */
.ts-panelnav-section {
    padding: 0.25rem 0;
}
.ts-panelnav-section + .ts-panelnav-section {
    border-top: 1px solid var(--ts-pn-border-color);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
}
.ts-panelnav-section-title {
    display: block;
    padding: 0.375rem var(--ts-pn-item-pad-x) 0.25rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ts-pn-section-title);
    user-select: none;
}

/* Lists */
.ts-panelnav-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* Item (wraps link + optional drawer) */
.ts-panelnav-item {
    position: relative;
    margin: 0;
}

/* The interactive row (link or disclosure button) */
.ts-panelnav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: var(--ts-pn-item-pad-y) var(--ts-pn-item-pad-x);
    /* Depth-driven left indent â€” set per item via --ts-pn-depth */
    padding-left: calc(var(--ts-pn-item-pad-x) + (var(--ts-pn-depth, 0) * var(--ts-pn-indent-step)));
    color: var(--ts-pn-text);
    background: transparent;
    border: none;
    border-radius: 0;
    text-align: left;
    text-decoration: none !important;
    cursor: pointer;
    font: inherit;
    line-height: 1.4;
    transition: background-color var(--ts-pn-duration) var(--ts-pn-easing),
                color var(--ts-pn-duration) var(--ts-pn-easing);
    user-select: none;
}

.ts-panelnav-link:hover {
    background-color: var(--ts-pn-item-hover-bg);
    color: var(--ts-pn-text);
}

.ts-panelnav-link:focus-visible {
    outline: 2px solid var(--ts-pn-focus-ring);
    outline-offset: -2px;
}

/* Left active indicator bar */
.ts-panelnav-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background-color: var(--ts-pn-active-bar);
    border-radius: 0 2px 2px 0;
    transition: height var(--ts-pn-duration) var(--ts-pn-easing);
}

/* Active leaf */
.ts-panelnav-item--active > .ts-panelnav-link {
    background-color: var(--ts-pn-item-active-bg);
    color: var(--ts-pn-item-active-text);
    font-weight: 600;
}

/* Indicator: bar */
.ts-panelnav--indicator-bar  .ts-panelnav-item--active > .ts-panelnav-link::before,
.ts-panelnav--indicator-both .ts-panelnav-item--active > .ts-panelnav-link::before {
    height: 62%;
}

/* Icon */
.ts-panelnav-icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--ts-pn-icon-color);
    transition: color var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panelnav-item--active > .ts-panelnav-link .ts-panelnav-icon {
    color: var(--ts-pn-item-active-icon);
}

/* Text label */
.ts-panelnav-text {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Metadata (right-aligned count / label) */
.ts-panelnav-metadata {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ts-pn-metadata-color);
    font-variant-numeric: tabular-nums;
}
.ts-panelnav-item--active > .ts-panelnav-link .ts-panelnav-metadata {
    color: var(--ts-pn-item-active-text);
}

/* Active caret-right indicator (MDS signature) */
.ts-panelnav-active-indicator {
    flex-shrink: 0;
    width: 0.75rem;
    height: 0.75rem;
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-pn-item-active-text);
    opacity: 0;
    transform: translateX(-3px);
    transition: opacity var(--ts-pn-duration) var(--ts-pn-easing),
                transform var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panelnav--indicator-caret .ts-panelnav-item--active > .ts-panelnav-link > .ts-panelnav-active-indicator,
.ts-panelnav--indicator-both  .ts-panelnav-item--active > .ts-panelnav-link > .ts-panelnav-active-indicator {
    opacity: 1;
    transform: translateX(0);
}

/* Disclosure / drawer-toggle caret on parent items */
.ts-panelnav-toggle-icon {
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ts-pn-text-muted);
    transition: transform var(--ts-pn-duration) var(--ts-pn-easing),
                color var(--ts-pn-duration) var(--ts-pn-easing);
}
.ts-panelnav-item--open > .ts-panelnav-link > .ts-panelnav-toggle-icon {
    transform: rotate(180deg);
}
.ts-panelnav-item--has-children > .ts-panelnav-link:hover .ts-panelnav-toggle-icon {
    color: var(--ts-pn-text);
}

/* Parent that itself sits in the active branch */
.ts-panelnav-item--branch-active > .ts-panelnav-link {
    color: var(--ts-pn-item-active-text);
}
.ts-panelnav-item--branch-active > .ts-panelnav-link .ts-panelnav-icon {
    color: var(--ts-pn-item-active-icon);
}

/* Drawer (animated child container) */
.ts-panelnav-drawer {
    overflow: hidden;
    height: 0;
    transition: height var(--ts-pn-duration) var(--ts-pn-easing);
    will-change: height;
}
/* Open state: natural height. Clearing the JS inline height reverts here,
   NOT to the height:0 base rule, so the drawer stays open. */
.ts-panelnav-item--open > .ts-panelnav-drawer {
    height: auto;
    overflow: visible;
}

/* Separator */
.ts-panelnav-separator {
    height: 1px;
    margin: 0.5rem var(--ts-pn-item-pad-x);
    background-color: var(--ts-pn-border-color);
    list-style: none;
}

/* Disabled */
.ts-panelnav-item--disabled > .ts-panelnav-link {
    opacity: 0.45;
    pointer-events: none;
    cursor: not-allowed;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .ts-panelnav-link,
    .ts-panelnav-drawer,
    .ts-panelnav-toggle-icon,
    .ts-panelnav-active-indicator,
    .ts-panelnav-link::before { transition: none !important; }
}
`;
        document.head.appendChild(style);
    }

    class PluginPanelNav {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el      = $el;
            this._raf      = [];
            this._timers   = [];
            this._collapsed = false;
            this.$collapseToggle = null;

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
            this.options = $.extend(true, {}, PluginPanelNav.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self    = this;
            const $el     = self.$el;
            const options = self.options;
            const D       = PluginPanelNav.defaults;

            $el.addClass('ts-panelnav');

            if (options.dark)     $el.addClass('ts-panelnav--dark');
            if (options.bordered) $el.addClass('ts-panelnav--bordered');
            if (options.compact)  $el.addClass('ts-panelnav--compact');
            if (options.fill)     $el.addClass('ts-panelnav--fill');

            // Active-indicator style modifier
            const indicator = ['caret', 'bar', 'both', 'none'].indexOf(options.activeIndicator) !== -1
                ? options.activeIndicator : 'caret';
            $el.addClass('ts-panelnav--indicator-' + indicator);

            // CSS custom property overrides (only when differing from defaults)
            if (options.width    !== D.width)    $el.css('--ts-pn-width', options.width);
            if (options.duration !== D.duration) $el.css('--ts-pn-duration', options.duration);
            if (options.accent)                  $el.css('--ts-pn-accent', options.accent);
            if (options.indentStep)              $el.css('--ts-pn-indent-step', options.indentStep);

            // Rail-collapse setup
            if (options.collapsible) {
                $el.addClass('ts-panelnav--collapsible');
                if (options.expandOnHover) $el.addClass('ts-panelnav--expand-on-hover');
                if (options.collapsedWidth !== D.collapsedWidth) {
                    $el.css('--ts-pn-collapsed-width', options.collapsedWidth);
                }
            }

            // ARIA role on the root
            if (!$el.attr('role')) $el.attr('role', 'navigation');

            // Decorate regions
            self._buildActions();
            self._buildBody();
            self._buildSections();

            // Inject the collapse-toggle button (creates a header if needed)
            if (options.collapsible) self._buildCollapseToggle();

            // Decorate every top-level list and any stray items
            const $scope = self.$body && self.$body.length ? self.$body : $el;
            $scope.children('[data-panelnav-list]').each(function() {
                self._decorateList($(this), 0);
            });
            // Lists nested directly in sections were handled by _buildSections;
            // also handle bare items / lists placed straight under the scope.
            $scope.children('[data-panelnav-item]').each(function() {
                self._decorateItem($(this), 0);
            });
            $scope.children('[data-panelnav-separator]').addClass('ts-panelnav-separator');

            // Suppress transitions on first paint so opening active branches
            // doesn't animate on load.
            $el.attr('data-ts-pn-initialising', 'true');

            if (options.autoExpandActive) self._expandActiveBranches();
            if (options.activeOnLoad)      self._autoSetActive();

            // Apply initial collapsed state without animating on first paint.
            if (options.collapsible && options.collapsed) {
                $el.addClass('ts-panelnav--collapsed');
                self._collapsed = true;
                self._syncCollapseToggleAria();
            } else {
                self._collapsed = false;
            }

            const raf1 = requestAnimationFrame(() => {
                const raf2 = requestAnimationFrame(() => {
                    $el.removeAttr('data-ts-pn-initialising');
                });
                self._raf.push(raf2);
            });
            self._raf.push(raf1);

            return this;
        }

        _buildActions() {
            const self = this;
            self.$actions = self.$el.find('[data-panelnav-actions]').first();
            if (!self.$actions.length) return;
            self.$actions.addClass('ts-panelnav-actions');
            self.$actions.children('[data-panelnav-actions-title]')
                .addClass('ts-panelnav-actions-title');
        }

        /**
         * Build the collapse-toggle button. If the panel has no actions header,
         * one is created so the toggle has a home. The button is tagged with
         * data-ts-pn-injected-toggle so destroy() can remove it (and remove the
         * header too, if we created it).
         */
        _buildCollapseToggle() {
            const self = this;
            const $el  = self.$el;

            // Ensure an actions header exists.
            if (!self.$actions || !self.$actions.length) {
                self.$actions = $('<div data-panelnav-actions data-ts-pn-injected-actions="true"></div>')
                    .addClass('ts-panelnav-actions');
                $el.prepend(self.$actions);
            }

            // Avoid duplicate buttons on re-init.
            if (self.$actions.children('.ts-panelnav-collapse-toggle').length) {
                self.$collapseToggle = self.$actions.children('.ts-panelnav-collapse-toggle').first();
                return;
            }

            const $btn = $('<button type="button" class="ts-panelnav-collapse-toggle" data-ts-pn-injected-toggle="true"></button>')
                .attr('aria-label', self.options.collapseToggleLabel)
                .attr('aria-expanded', 'true')
                .html(self._chevronIcon());

            self.$actions.append($btn);
            self.$collapseToggle = $btn;
        }

        _syncCollapseToggleAria() {
            const self = this;
            if (!self.$collapseToggle || !self.$collapseToggle.length) return;
            self.$collapseToggle.attr('aria-expanded', self._collapsed ? 'false' : 'true');
        }

        _buildBody() {
            const self = this;
            self.$body = self.$el.find('[data-panelnav-body]').first();
            if (self.$body.length) self.$body.addClass('ts-panelnav-body');
        }

        _buildSections() {
            const self = this;
            const $scope = self.$body && self.$body.length ? self.$body : self.$el;

            $scope.find('[data-panelnav-section]').each(function() {
                const $section = $(this);
                if ($section.data('__tsPnSection')) return;
                $section.data('__tsPnSection', true);
                $section.addClass('ts-panelnav-section');

                const title = $section.attr('data-panelnav-section-title') || '';
                if (title) {
                    let $t = $section.children('[data-panelnav-section-label]').first();
                    if (!$t.length) {
                        $t = $('<div data-panelnav-section-label data-ts-pn-injected-title="true"></div>').text(title);
                        $section.prepend($t);
                    }
                    $t.addClass('ts-panelnav-section-title');
                }

                // Decorate the lists / items inside this section at depth 0
                $section.children('[data-panelnav-list]').each(function() {
                    self._decorateList($(this), 0);
                });
                $section.children('[data-panelnav-item]').each(function() {
                    self._decorateItem($(this), 0);
                });
                $section.children('[data-panelnav-separator]').addClass('ts-panelnav-separator');
            });
        }

        /**
         * Decorate a <ul>/list container and all its direct item children.
         * @param {jQuery} $list
         * @param {number} depth
         */
        _decorateList($list, depth) {
            const self = this;
            if ($list.data('__tsPnList')) return;
            $list.data('__tsPnList', true);
            $list.addClass('ts-panelnav-list');

            $list.children('[data-panelnav-item]').each(function() {
                self._decorateItem($(this), depth);
            });
            $list.children('[data-panelnav-separator]').addClass('ts-panelnav-separator');
        }

        /**
         * Decorate a single nav item, recursing into nested child lists.
         * @param {jQuery} $item
         * @param {number} depth
         */
        _decorateItem($item, depth) {
            const self = this;
            if ($item.data('__tsPnItem')) return;
            $item.data('__tsPnItem', true);

            $item.addClass('ts-panelnav-item');
            $item.attr('data-ts-pn-depth', depth);

            // The interactive row: a child <a> / <button> tagged data-panelnav-link,
            // or the first <a>/<button>, otherwise wrap the inline content.
            let $link = $item.children('[data-panelnav-link]').first();
            if (!$link.length) $link = $item.children('a, button').first();

            if (!$link.length) {
                // Wrap loose inline content (icon/label/etc.) into a link row.
                const $loose = $item.children().not('[data-panelnav-child-items]');
                $link = $('<span data-panelnav-link data-ts-pn-injected-link="true"></span>');
                if ($loose.length) {
                    $loose.first().before($link);
                    $link.append($loose);
                } else {
                    $item.prepend($link);
                }
            }
            $link.addClass('ts-panelnav-link');

            // Depth indent applied via CSS custom property on the link.
            if (depth > 0) $link.css('--ts-pn-depth', depth);

            // Decorate inner parts
            $link.children('[data-panelnav-icon]').first().addClass('ts-panelnav-icon');
            $link.children('[data-panelnav-label]').first().addClass('ts-panelnav-text');
            $link.children('[data-panelnav-metadata]').first().addClass('ts-panelnav-metadata');

            // If no explicit label element, treat the link's own text as the label.
            if (!$link.children('.ts-panelnav-text').length) {
                $link.addClass('ts-panelnav-link--plain');
            }

            const $childContainer = $item.children('[data-panelnav-child-items]').first();
            const hasChildren = $childContainer.length > 0 || $item.is('[data-panelnav-has-children]');

            if ($item.is('[data-panelnav-disabled]')) {
                $item.addClass('ts-panelnav-item--disabled');
                $link.attr('aria-disabled', 'true');
            }

            if (hasChildren) {
                $item.addClass('ts-panelnav-item--has-children');

                // Inject a disclosure caret if absent.
                if (!$link.children('.ts-panelnav-toggle-icon').length) {
                    const $caret = $('<span class="ts-panelnav-toggle-icon" aria-hidden="true" data-ts-pn-injected-caret="true"></span>')
                        .html(self._caretIcon());
                    $link.append($caret);
                }

                $link.attr('aria-expanded', 'false');

                if ($childContainer.length) {
                    $childContainer.addClass('ts-panelnav-list');
                    if (!$childContainer.data('__tsPnList')) $childContainer.data('__tsPnList', true);

                    // Wrap the child list in an animated drawer shell.
                    if (!$childContainer.parent().hasClass('ts-panelnav-drawer')) {
                        $childContainer.wrap('<div class="ts-panelnav-drawer"></div>');
                    }
                    const $drawer = $childContainer.parent();
                    $item.data('_$drawer', $drawer);

                    // Unique id wiring for aria-controls (avoids collisions across
                    // multiple panels on one page).
                    const cid = 'ts-pn-drawer-' + Math.random().toString(36).slice(2, 9);
                    $drawer.attr('id', cid);
                    $link.attr('aria-controls', cid);

                    // Recurse â€” children one level deeper.
                    $childContainer.children('[data-panelnav-item]').each(function() {
                        self._decorateItem($(this), depth + 1);
                    });
                    $childContainer.children('[data-panelnav-separator]').addClass('ts-panelnav-separator');
                }
            } else {
                // Leaf â€” inject the active caret-right indicator placeholder.
                if (!$link.children('.ts-panelnav-active-indicator').length) {
                    const $ind = $('<span class="ts-panelnav-active-indicator" aria-hidden="true" data-ts-pn-injected-indicator="true"></span>')
                        .html(self._caretRightIcon());
                    $link.append($ind);
                }
            }

            // Active flags
            if ($item.is('[data-panelnav-active]')) {
                if (hasChildren) {
                    $item.addClass('ts-panelnav-item--branch-active');
                } else {
                    $item.addClass('ts-panelnav-item--active');
                    $link.attr('aria-current', 'page');
                }
            }

            // Accessibility role for non-anchor disclosure rows
            if (!$link.is('a, button')) {
                $link.attr({ role: hasChildren ? 'button' : 'link', tabindex: '0' });
            }
        }

        events() {
            const self = this;
            const $el  = self.$el;

            // Toggle a parent drawer
            $el.on('click.panelnav', '.ts-panelnav-item--has-children > .ts-panelnav-link', function(e) {
                const $link = $(this);
                const $item = $link.parent();
                if ($item.hasClass('ts-panelnav-item--disabled')) return;

                // Nav-panel parents are disclosure widgets by convention, so we
                // always intercept and toggle rather than navigate.
                e.preventDefault();
                self._toggleDrawer($item);
            });

            // Activate a leaf
            $el.on('click.panelnav', '.ts-panelnav-item:not(.ts-panelnav-item--has-children) > .ts-panelnav-link', function(e) {
                const $link = $(this);
                const $item = $link.parent();
                if ($item.hasClass('ts-panelnav-item--disabled')) return;

                self.setActive($item);

                const href = $link.attr('href');
                $el.trigger('item.ts.panelnav', [{ $item, $link, href }]);

                // If it's not a real navigable anchor, prevent default jump.
                if (!$link.is('a') || !href || href === '#') e.preventDefault();
            });

            // Keyboard activation for injected button/link rows
            $el.on('keydown.panelnav', '.ts-panelnav-link[role]', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    $(this).trigger('click');
                }
            });

            // Collapse-toggle button
            $el.on('click.panelnav', '.ts-panelnav-collapse-toggle', function(e) {
                e.preventDefault();
                self.toggleCollapse();
            });

            return this;
        }

        /** Open a parent item's drawer (no-op if already open or has no drawer). */
        open($item) {
            if ($item.hasClass('ts-panelnav-item--has-children') &&
                !$item.hasClass('ts-panelnav-item--open')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Close a parent item's drawer. */
        close($item) {
            if ($item.hasClass('ts-panelnav-item--open')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Toggle a parent item's drawer. */
        toggle($item) {
            if ($item.hasClass('ts-panelnav-item--has-children')) {
                this._toggleDrawer($item);
            }
            return this;
        }

        /** Open every drawer in the panel. */
        expandAll() {
            const self = this;
            self.$el.find('.ts-panelnav-item--has-children').each(function() {
                self.open($(this));
            });
            return this;
        }

        /** Close every drawer in the panel. */
        collapseAll() {
            const self = this;
            self.$el.find('.ts-panelnav-item--has-children.ts-panelnav-item--open').each(function() {
                self.close($(this));
            });
            return this;
        }

        /**
         * Mark a leaf item active, clearing all others. Opens any ancestor
         * drawers so the active item is visible. Sets aria-current.
         * @param {jQuery} $item
         */
        setActive($item) {
            const self = this;
            const $el  = self.$el;

            $el.find('.ts-panelnav-item--active')
                .removeClass('ts-panelnav-item--active')
                .children('.ts-panelnav-link').removeAttr('aria-current');

            $el.find('.ts-panelnav-item--branch-active')
                .removeClass('ts-panelnav-item--branch-active');

            $item.addClass('ts-panelnav-item--active');
            $item.children('.ts-panelnav-link').attr('aria-current', 'page');

            // Walk ancestors: mark branch-active + open drawers.
            $item.parents('.ts-panelnav-item--has-children').each(function() {
                const $anc = $(this);
                $anc.addClass('ts-panelnav-item--branch-active');
                self.open($anc);
            });

            return this;
        }

        /** Return the currently active item (jQuery, may be empty). */
        getActive() {
            return this.$el.find('.ts-panelnav-item--active').first();
        }

        /** Collapse the panel to the mini / icon-only rail. */
        collapse() {
            return this._setCollapsed(true);
        }

        /** Expand the panel back to full width. */
        expand() {
            return this._setCollapsed(false);
        }

        /** Toggle between collapsed and expanded. */
        toggleCollapse() {
            return this._setCollapsed(!this._collapsed);
        }

        /** Whether the panel is currently collapsed. */
        isCollapsed() {
            return !!this._collapsed;
        }

        /**
         * Internal collapse-state setter. No-op unless the panel is collapsible
         * or the requested state already matches. Fires collapse.ts.panelnav.
         * @param {boolean} collapsed
         */
        _setCollapsed(collapsed) {
            const self = this;
            const $el  = self.$el;

            if (!self.options.collapsible) return self;
            collapsed = !!collapsed;
            if (collapsed === self._collapsed) return self;

            self._collapsed = collapsed;
            $el.toggleClass('ts-panelnav--collapsed', collapsed);
            self._syncCollapseToggleAria();

            $el.trigger('collapse.ts.panelnav', [{ collapsed }]);
            return self;
        }

        /** Destroy and re-init with the same options. Returns the new instance. */
        refresh() {
            const $el  = this.$el;
            const opts = $.extend(true, {}, this.options);
            delete opts.wrapper;
            this.destroy();
            return new PluginPanelNav($el, opts);
        }

        /** Full teardown â€” removes classes, injected nodes, drawers, handlers. */
        destroy() {
            const self = this;
            const $el  = self.$el;

            $el.off('.panelnav');
            self._raf.forEach(id => cancelAnimationFrame(id));
            self._timers.forEach(id => clearTimeout(id));

            // Unwrap drawers
            $el.find('.ts-panelnav-drawer').each(function() {
                const $inner = $(this).children('[data-panelnav-child-items]');
                if ($inner.length) $inner.unwrap();
            });

            // Remove injected nodes
            $el.find('[data-ts-pn-injected-toggle]').remove();
            $el.find('[data-ts-pn-injected-caret]').remove();
            $el.find('[data-ts-pn-injected-indicator]').remove();
            $el.find('[data-ts-pn-injected-title]').remove();
            // Remove an actions header only if WE created it.
            $el.children('[data-ts-pn-injected-actions]').remove();
            $el.find('[data-ts-pn-injected-link]').each(function() {
                const $span = $(this);
                $span.children().insertBefore($span);
                $span.remove();
            });

            // Strip injected attributes
            $el.find('[aria-controls]').removeAttr('aria-controls');
            $el.find('[aria-expanded]').removeAttr('aria-expanded');
            $el.find('[aria-current]').removeAttr('aria-current');
            $el.find('.ts-panelnav-link[role]').removeAttr('role tabindex');
            $el.find('.ts-panelnav-drawer').removeAttr('id');

            // Remove data flags + cached drawer refs
            $el.find('*').removeData('__tsPnItem')
                          .removeData('__tsPnList')
                          .removeData('__tsPnSection')
                          .removeData('_$drawer')
                          .removeData('_tsPnTimer');

            // Strip element classes
            const classes = [
                'ts-panelnav-actions', 'ts-panelnav-actions-title', 'ts-panelnav-body',
                'ts-panelnav-section', 'ts-panelnav-section-title', 'ts-panelnav-list',
                'ts-panelnav-item', 'ts-panelnav-item--active', 'ts-panelnav-item--branch-active',
                'ts-panelnav-item--has-children', 'ts-panelnav-item--open',
                'ts-panelnav-item--disabled', 'ts-panelnav-link', 'ts-panelnav-link--plain',
                'ts-panelnav-icon', 'ts-panelnav-text', 'ts-panelnav-metadata',
                'ts-panelnav-separator', 'ts-panelnav-collapse-toggle'
            ].join(' ');
            $el.find('*').removeClass(classes).removeAttr('data-ts-pn-depth');
            $el.find('.ts-panelnav-link').css('--ts-pn-depth', '');

            // Strip root classes + inline custom properties
            $el.removeClass(
                'ts-panelnav ts-panelnav--dark ts-panelnav--bordered ts-panelnav--compact ' +
                'ts-panelnav--fill ts-panelnav--indicator-caret ts-panelnav--indicator-bar ' +
                'ts-panelnav--indicator-both ts-panelnav--indicator-none ' +
                'ts-panelnav--collapsible ts-panelnav--collapsed ts-panelnav--expand-on-hover'
            );
            $el.css({
                '--ts-pn-width': '', '--ts-pn-duration': '',
                '--ts-pn-accent': '', '--ts-pn-indent-step': '',
                '--ts-pn-collapsed-width': ''
            });
            $el.removeAttr('data-ts-pn-initialising');
            $el.removeData(instanceName);

            self.$actions = self.$body = null;
            self.$collapseToggle = null;
            self._collapsed = false;
            self._raf = [];
            self._timers = [];

            return this;
        }

        /**
         * Animate a parent item's drawer open/closed.
         * animate pxâ†’px, then clear the inline height so the CSS open rule
         * (height:auto) takes over.
         * @param {jQuery} $item
         */
        _toggleDrawer($item) {
            const self   = this;
            const $el     = self.$el;
            const isOpen  = $item.hasClass('ts-panelnav-item--open');
            const $drawer = self._getDrawer($item);
            const $link   = $item.children('.ts-panelnav-link');

            if (!$drawer || !$drawer.length) return this;

            const duration = self._parseDuration(self.options.duration);
            clearTimeout($item.data('_tsPnTimer'));

            // Accordion mode: close siblings before opening.
            if (!isOpen && self.options.accordion) {
                $item.siblings('.ts-panelnav-item--has-children.ts-panelnav-item--open')
                    .each(function() { self.close($(this)); });
            }

            if (!isOpen) {
                // OPEN
                $item.addClass('ts-panelnav-item--open');
                $link.attr('aria-expanded', 'true');

                $drawer.css({ overflow: 'hidden', height: '0px' });
                const target = $drawer.children('[data-panelnav-child-items]')[0].scrollHeight;
                $drawer[0].offsetHeight; // reflow
                $drawer.css('height', target + 'px');

                $el.trigger('drawer-toggle.ts.panelnav', [{ $item, open: true }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $drawer.css({ height: 'auto', overflow: '' });
                }, duration);
                $item.data('_tsPnTimer', t);
                self._timers.push(t);

            } else {
                // CLOSE
                const current = $drawer[0].scrollHeight;
                $drawer.css({ overflow: 'hidden', height: current + 'px' });
                $drawer[0].offsetHeight; // reflow
                $item.removeClass('ts-panelnav-item--open');
                $link.attr('aria-expanded', 'false');
                $drawer.css('height', '0px');

                $el.trigger('drawer-toggle.ts.panelnav', [{ $item, open: false }]);

                const t = setTimeout(() => {
                    if (!$item.closest('body').length) return;
                    $drawer.css('overflow', '');
                }, duration);
                $item.data('_tsPnTimer', t);
                self._timers.push(t);
            }

            return this;
        }

        /** Open ancestor drawers of any pre-marked active items (no animation). */
        _expandActiveBranches() {
            const self = this;
            self.$el.find('[data-panelnav-active]').each(function() {
                $(this).parents('.ts-panelnav-item--has-children').each(function() {
                    const $anc   = $(this);
                    $anc.addClass('ts-panelnav-item--open ts-panelnav-item--branch-active');
                    $anc.children('.ts-panelnav-link').attr('aria-expanded', 'true');
                    const $drawer = self._getDrawer($anc);
                    if ($drawer && $drawer.length) $drawer.css({ height: '', overflow: '' });
                });
            });
            return this;
        }

        /**
         * Match item hrefs against the current URL and set the active item.
         * Sub-items (deeper) win over shallower matches.
         */
        _autoSetActive() {
            const self = this;
            const $el  = self.$el;

            const normalize = (url) => {
                try {
                    const u = new URL(url, window.location.origin);
                    return u.origin + (u.pathname.replace(/\/+$/, '') || '/');
                } catch (e) { return null; }
            };

            const current = normalize(window.location.href);
            if (!current) return;

            let best = null, bestDepth = -1;

            $el.find('.ts-panelnav-item:not(.ts-panelnav-item--has-children) > a.ts-panelnav-link[href]').each(function() {
                const $link = $(this);
                const link  = normalize($link.attr('href'));
                if (!link || link !== current) return;
                const depth = parseInt($link.parent().attr('data-ts-pn-depth'), 10) || 0;
                if (depth > bestDepth) { best = $link.parent(); bestDepth = depth; }
            });

            if (best) self.setActive(best);
            return self;
        }

        _getDrawer($item) {
            return $item.data('_$drawer') ||
                   $item.children('.ts-panelnav-drawer').first() || null;
        }

        _caretIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" ' +
                   'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                   'stroke-linejoin="round" aria-hidden="true"><polyline points="4 6 8 10 12 6"/></svg>';
        }

        _caretRightIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" ' +
                   'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                   'stroke-linejoin="round" aria-hidden="true"><polyline points="6 4 10 8 6 12"/></svg>';
        }

        /** Double-chevron used on the collapse-toggle button (points left = expanded). */
        _chevronIcon() {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" ' +
                   'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
                   'stroke-linejoin="round" aria-hidden="true">' +
                   '<polyline points="9 3 4 8 9 13"/><polyline points="13 3 8 8 13 13"/></svg>';
        }

        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 240;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 240;
        }

    }

    PluginPanelNav.defaults = {
        /** Dark colour scheme. */
        dark: false,

        /** Wrap the panel in a bordered card. */
        bordered: false,

        /** Compact (denser) row spacing. */
        compact: false,

        /**
         * Stretch to full container height with an internal scroll body.
         * Requires a [data-panelnav-body] wrapper around the lists.
         */
        fill: false,

        /**
         * Active-item indicator style:
         *   'caret' â€” caret-right at the row end (default)
         *   'bar'   â€” left accent bar
         *   'both'  â€” caret-right + left bar
         *   'none'  â€” colour/weight change only
         */
        activeIndicator: 'caret',

        /** Only one drawer open at a time (accordion behaviour). */
        accordion: false,

        /**
         * Enable rail collapse (mini / icon-only mode). Adds a toggle button
         * to the actions header and lets collapse()/expand()/toggleCollapse()
         * shrink the whole panel to an icon strip.
         */
        collapsible: false,

        /** Start in the collapsed (mini) state. Requires collapsible. */
        collapsed: false,

        /** Width of the collapsed rail (any CSS length). */
        collapsedWidth: '64px',

        /** While collapsed, temporarily expand the rail on hover. */
        expandOnHover: false,

        /** Accessible label for the collapse-toggle button. */
        collapseToggleLabel: 'Toggle navigation',

        /** Open ancestor drawers of pre-marked [data-panelnav-active] items on load. */
        autoExpandActive: true,

        /** Detect + mark the active leaf from the current page URL on load. */
        activeOnLoad: true,

        /** Panel width (any CSS length). */
        width: '280px',

        /** Per-level indent applied to nested rows (any CSS length). */
        indentStep: '1rem',

        /** Drawer + indicator transition duration. */
        duration: '240ms',

        /** Accent colour override (CSS <color>). Empty = inherit theme default. */
        accent: '',

        /** forceInit: panel is layout-critical â€” skip IntersectionObserver. */
        forceInit: true,

        /** accY: IntersectionObserver root-margin offset (unused with forceInit). */
        accY: 0
    };

    $.extend(themestrap, { PluginPanelNav });

    $.fn.themestrapPluginPanelNav = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginPanelNav($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Navbar
 * This navigation connects a series of related pages. It sits below a
 * primary nav, exposes a logo/title, a set of links (some with dropdown menus),
 * and an optional call-to-action. The current page is flagged with an accent
 * top border.
 *
 * HTML anchor: [data-plugin-navbar]
 *
 * Quick-start:
 *   <nav class="ts-navbar" data-plugin-navbar
 *        data-plugin-options='{"palette": "light", "sticky": true}'
 *        aria-label="Secondary">
 *     ...
 *   </nav>
 *
 * Init.js wiring (add to themestrap.init.js):
 *   if ($.isFunction($.fn['themestrapPluginNavbar']) && $('[data-plugin-navbar]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-navbar]:not(.manual)', 'themestrapPluginNavbar');
 *   }
 */
 // Navbar
(((themestrap = {}, $) => {
    const instanceName = '__pluginNavbar';
    
    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-navbar-styles';
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
:root {
    /* Semantic surface tokens — LIGHT palette defaults */
    --ts-navbar-bg:            #ffffff;
    --ts-navbar-border:        #e4e9f0;
    --ts-navbar-logo-color:    var(--primary);
    --ts-navbar-link-color:    #3a4a5e;
    --ts-navbar-link-hover:    var(--primary-100);
    --ts-navbar-link-current:  var(--primary);
    --ts-navbar-accent:        var(--primary);   /* the current-page bar */
    --ts-navbar-hover-bg:      #f4f6f9;
    --ts-navbar-menu-bg:       #ffffff;
    --ts-navbar-menu-border:   #e4e9f0;
    --ts-navbar-menu-link:     #3a4a5e;
    --ts-navbar-menu-link-hover: var(--primary);
    --ts-navbar-menu-heading:  #8190a3;
    --ts-navbar-toggle-color:  var(--primary);
    --ts-navbar-shadow:        0 1px 2px rgba(10,25,41,.06),
                               0 8px 24px rgba(10,25,41,.10);

    /* Sizing & motion */
    --ts-navbar-height:        56px;
    --ts-navbar-accent-size:   3px;
    --ts-navbar-radius:        8px;
    --ts-navbar-transition:    150ms ease;
    --ts-navbar-sticky-top:    0px;
    --ts-navbar-z:             1020;
}

html.dark .ts-navbar,
.ts-navbar[data-ts-navbar-palette="dark"] {
    --ts-navbar-bg:            var(--dark);
    --ts-navbar-border:        var(--dark--200);
    --ts-navbar-logo-color:    #ffffff;
    --ts-navbar-link-color:    #b9c6d6;
    --ts-navbar-link-hover:    #ffffff;
    --ts-navbar-link-current:  #ffffff;
    --ts-navbar-hover-bg:      rgba(255,255,255,.05);
    --ts-navbar-menu-bg:       var(--dark-200);
    --ts-navbar-menu-border:   #1c3147;
    --ts-navbar-menu-link:     #b9c6d6;
    --ts-navbar-menu-link-hover: #ffffff;
    --ts-navbar-menu-heading:  #6f8194;
    --ts-navbar-toggle-color:  #ffffff;
    --ts-navbar-shadow:        0 1px 2px rgba(0,0,0,.3),
                               0 8px 24px rgba(0,0,0,.35);
}

.ts-navbar {
    position: relative;
    background: var(--ts-navbar-bg);
    border-bottom: 1px solid var(--ts-navbar-border);
}

/* Sticky pin — sits at the top once scrolled to. */
.ts-navbar--sticky {
    position: sticky;
    top: var(--ts-navbar-sticky-top);
    z-index: var(--ts-navbar-z);
}

/* Elevated state once pinned. */
.ts-navbar--stuck {
    box-shadow: var(--ts-navbar-shadow);
    border-bottom-color: transparent;
}

/* Zero-height scroll sentinel injected by the plugin. */
.ts-navbar__sentinel {
    height: 0;
    width: 100%;
    pointer-events: none;
}

.ts-navbar__container {
    display: flex;
    align-items: stretch;
    gap: 8px;
    margin: 0 auto;
    padding: 0 20px;
    min-height: var(--ts-navbar-height);
}

.ts-navbar__logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ts-navbar-logo-color);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -.01em;
    text-decoration: none;
    white-space: nowrap;
    padding: 0 16px 0 0;
    margin-right: 4px;
    flex-shrink: 0;
    transition: opacity var(--ts-navbar-transition);
}
.ts-navbar__logo:hover,
.ts-navbar__logo:focus-visible {
    color: var(--ts-navbar-logo-color);
    opacity: .85;
}
.ts-navbar__logo img,
.ts-navbar__logo svg {
    height: 26px;
    width: auto;
    display: block;
}

.ts-navbar__collapse {
    display: flex;
    align-items: stretch;
    flex: 1 1 auto;
    gap: 8px;
}

.ts-navbar__nav {
    display: flex;
    align-items: stretch;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
}

.ts-navbar__item {
    display: flex;
    align-items: stretch;
    position: relative;
}
.ts-navbar__item.ts-navbar__search { 
    margin-left: auto;
    width: 16%;
}

.ts-navbar__link,
.ts-navbar__dropdown-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 14px;
    /* Reserve room for the accent bar so :current never shifts layout. */
    border-top: var(--ts-navbar-accent-size) solid transparent;
    margin-top: -1px;                 /* overlap the wrapper border edge */
    color: var(--ts-navbar-link-color);
    font-size: .875rem;
    font-weight: 500;
    line-height: var(--ts-navbar-height);
    text-decoration: none;
    white-space: nowrap;
    background: none;
    border-left: 0; border-right: 0; border-bottom: 0;
    cursor: pointer;
    transition: color var(--ts-navbar-transition),
                background var(--ts-navbar-transition),
                border-color var(--ts-navbar-transition);
}

.ts-navbar__link:hover,
.ts-navbar__dropdown-toggle:hover {
    color: var(--ts-navbar-link-hover);
    background: var(--ts-navbar-hover-bg);
    border-top-color: color-mix(in srgb, var(--ts-navbar-accent) 45%, transparent);
}

.ts-navbar__link:focus-visible,
.ts-navbar__dropdown-toggle:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: -2px;
}

/* Current page — solid accent top border (Red Hat's signature cue). */
.ts-navbar__link--current,
.ts-navbar__link--current:hover,
.ts-navbar__link--current-parent {
    color: var(--ts-navbar-link-current);
    font-weight: 700;
    border-top-color: var(--ts-navbar-accent);
}

/* External links: never show the accent bar except on hover; they leave the IA. */
.ts-navbar__link--external {
    border-top-color: transparent !important;
}
.ts-navbar__link--external:hover {
    border-top-color: color-mix(in srgb, var(--ts-navbar-accent) 45%, transparent) !important;
}
.ts-navbar__external-icon {
    width: 11px; height: 11px;
    flex-shrink: 0;
    opacity: .7;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 2h8v8M14 2 6 10M11 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4' fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M6 2h8v8M14 2 6 10M11 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4' fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ts-navbar__caret {
    width: 12px; height: 12px;
    flex-shrink: 0;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
    transition: transform var(--ts-navbar-transition);
}
.ts-navbar__item--dropdown.is-open .ts-navbar__caret {
    transform: rotate(180deg);
}

.ts-navbar__menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: calc(var(--ts-navbar-z) + 5);
    min-width: 220px;
    margin-top: 0;
    padding: 8px;
    background: var(--ts-navbar-menu-bg);
    border: 1px solid var(--ts-navbar-menu-border);
    border-radius: var(--ts-navbar-radius);
    box-shadow: var(--ts-navbar-shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity var(--ts-navbar-transition),
                transform var(--ts-navbar-transition),
                visibility var(--ts-navbar-transition);
}
.ts-navbar__item--dropdown.is-open > .ts-navbar__menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.ts-navbar__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.ts-navbar__menu-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    color: var(--ts-navbar-menu-link);
    font-size: .875rem;
    text-decoration: none;
    border-radius: calc(var(--ts-navbar-radius) - 2px);
    transition: background var(--ts-navbar-transition),
                color var(--ts-navbar-transition);
}
.ts-navbar__menu-link:hover,
.ts-navbar__menu-link:focus-visible {
    background: var(--ts-navbar-hover-bg);
    color: var(--ts-navbar-menu-link-hover);
}
.ts-navbar__menu-link.ts-navbar__link--current {
    color: var(--ts-navbar-link-current);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--ts-navbar-accent);
}
.ts-navbar__menu-link:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: -2px;
}

.ts-navbar__menu--sections {
    display: flex;
    gap: 8px;
    min-width: auto;
    padding: 14px;
}
.ts-navbar__menu-section {
    min-width: 190px;
    padding: 0 8px;
    border-right: 1px solid var(--ts-navbar-menu-border);
}
.ts-navbar__menu-section:last-child {
    border-right: 0;
}
.ts-navbar__menu-heading {
    margin: 4px 12px 8px;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ts-navbar-menu-heading);
}
.ts-navbar__menu-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 8px 12px 4px;
    color: var(--primary);
    font-size: .8125rem;
    font-weight: 600;
    text-decoration: none;
}
.ts-navbar__menu-cta:hover { color: var(--ts-primary-200); }
.ts-navbar__menu-cta::after {
    content: "";
    width: 12px; height: 12px;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8h9M9 4l4 4-4 4' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8h9M9 4l4 4-4 4' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat center / contain;
}

.ts-navbar__cta {
    display: flex;
    align-items: center;
    gap: 30px;
    flex-shrink: 0;
    margin-left: auto;
    padding-left: 8px;
}
.ts-navbar__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: .45rem 1rem;
    font-size: .8125rem;
    font-weight: 600;
    line-height: 1.2;
    border-radius: var(--ts-navbar-radius);
    border: 1.5px solid transparent;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--ts-navbar-transition),
                border-color var(--ts-navbar-transition),
                color var(--ts-navbar-transition);
}
.ts-navbar__btn--primary {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
}
.ts-navbar__btn--primary:hover {
    background: var(--primary-100);
    border-color: var(--primary-100);
    color: #fff;
}
.ts-navbar__btn--ghost {
    background: transparent;
    border-color: var(--ts-navbar-border);
    color: var(--ts-navbar-link-color);
}
.ts-navbar__btn--ghost:hover {
    border-color: var(--tertiary);
    color: var(--ts-navbar-link-hover);
}

.ts-navbar__toggle {
    display: none;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    padding: 8px 10px;
    background: transparent;
    border: 0;
    border-radius: var(--ts-navbar-radius);
    color: var(--ts-navbar-toggle-color);
    cursor: pointer;
}
.ts-navbar__toggle:hover { background: var(--ts-navbar-hover-bg); }
.ts-navbar__toggle:focus-visible {
    outline: 2px solid var(--ts-navbar-accent);
    outline-offset: 2px;
}
.ts-navbar__toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 4px;
    pointer-events: none;
}
.ts-navbar__toggle-bar {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transition: transform var(--ts-navbar-transition),
                opacity var(--ts-navbar-transition);
}
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(2) { opacity: 0; }
.ts-navbar--menu-open .ts-navbar__toggle-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 991.98px) {
    .ts-navbar__container {
        flex-wrap: wrap;
        align-items: center;
        min-height: var(--ts-navbar-height);
    }
    .ts-navbar__logo { margin-right: auto; }
    .ts-navbar__toggle { display: inline-flex; }

    .ts-navbar__collapse {
        flex: 0 0 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 220ms ease;
    }
    .ts-navbar--menu-open .ts-navbar__collapse {
        max-height: 80vh;
        overflow-y: auto;
        padding-bottom: 12px;
        border-top: 1px solid var(--ts-navbar-border);
        margin-top: 0;
    }

    .ts-navbar__nav { flex-direction: column; gap: 0; }
    .ts-navbar__item { display: block; }
    .ts-navbar__item.ts-navbar__search { display: flex; margin-left: unset; }

    .ts-navbar__link,
    .ts-navbar__dropdown-toggle {
        width: 100%;
        height: auto;
        line-height: 1.4;
        padding: 13px 4px;
        border-top: 0;
        /* On mobile the accent moves to the left edge. */
        border-left: var(--ts-navbar-accent-size) solid transparent;
        margin-top: 0;
    }
    .ts-navbar__link:hover,
    .ts-navbar__dropdown-toggle:hover { border-top-color: transparent; }
    .ts-navbar__link--current,
    .ts-navbar__link--current-parent {
        border-top-color: transparent;
        border-left-color: var(--ts-navbar-accent);
    }
    .ts-navbar__dropdown-toggle { justify-content: space-between; }

    /* Menus expand inline rather than floating. */
    .ts-navbar__menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        border: 0;
        border-radius: 0;
        min-width: 0;
        padding: 0 0 6px 18px;
        display: none;
    }
    .ts-navbar__item--dropdown.is-open > .ts-navbar__menu { display: block; }
    .ts-navbar__menu--sections { flex-direction: column; gap: 0; }
    .ts-navbar__menu-section { border-right: 0; min-width: 0; padding: 0; }

    .ts-navbar__cta {
        margin-left: 0;
        padding: 12px 4px 4px;
        border-top: 1px solid var(--ts-navbar-border);
    }
    .ts-navbar__cta:has(.ts-navbar__social-btn) { display: flex; justify-content: space-evenly; }
    .ts-navbar__btn { flex: 1 1 auto; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
    .ts-navbar,
    .ts-navbar *,
    .ts-navbar *::before,
    .ts-navbar *::after {
        transition-duration: 1ms !important;
        animation-duration: 1ms !important;
    }
}
        `;
        document.head.appendChild(style);
    }


    // Unique ID seed — keeps collapse / dropdown targets independent when more
    // than one navbar exists on a single page.
    let _uid = 0;

    /** Current page pathname, hash/query stripped. */
    function currentPath() {
        return window.location.pathname.replace(/\/$/, '') || '/';
    }

    /** Normalize an href down to its pathname for comparison. */
    function linkPath(href) {
        try {
            return new URL(href, window.location.href).pathname.replace(/\/$/, '') || '/';
        } catch (e) {
            return href;
        }
    }

    /** True when an href points off the current origin. */
    function isExternal(href) {
        if (!href || href.charAt(0) === '#') return false;
        try {
            return new URL(href, window.location.href).origin !== window.location.origin;
        } catch (e) {
            return false;
        }
    }

    class PluginNavbar {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el = $el;
            this.uid = ++_uid;

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
            // Merge per-element data-plugin-options on top of any passed options.
            const attrOpts = (themestrap.fn && themestrap.fn.getOptions)
                ? themestrap.fn.getOptions(this.$el.data('plugin-options'))
                : null;
            if (attrOpts) opts = $.extend(true, {}, opts, attrOpts);

            this.options = $.extend(true, {}, PluginNavbar.defaults, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            // Base class + color palette
            $el.addClass('ts-navbar');
            $el.attr('data-ts-navbar-palette', o.palette);

            if (o.sticky) {
                $el.addClass('ts-navbar--sticky');
            }

            // Unique collapse target for the mobile toggle
            self._wireCollapse();

            // ARIA wiring on dropdown triggers
            self._wireDropdowns();

            // External link decoration
            if (o.markExternal) {
                self._markExternal();
            }

            // Current page detection
            if (o.highlightCurrent) {
                self._markCurrent();
            }

            // Sticky "stuck" sentinel
            if (o.sticky) {
                self._initSticky();
            }

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;
            const $el  = self.$el;
            const ns   = `.tsnavbar.${self.uid}`;

            // Dropdown toggle (click)
            $el.on(`click${ns}`, '.ts-navbar__dropdown-toggle', function (e) {
                e.preventDefault();
                const $li = $(this).closest('.ts-navbar__item--dropdown');
                self.toggleDropdown($li);
            });

            // Mobile collapse toggle
            $el.on(`click${ns}`, '.ts-navbar__toggle', function () {
                self.toggleMenu();
            });

            // Close open dropdown on outside click
            if (o.closeOnOutsideClick) {
                $(document).on(`click${ns}`, function (e) {
                    if (!$(e.target).closest('.ts-navbar__item--dropdown', $el[0]).length) {
                        self.closeDropdowns();
                    }
                });
            }

            // Escape closes dropdowns + mobile menu
            $(document).on(`keydown${ns}`, function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    const had = $el.find('.ts-navbar__item--dropdown.is-open').length;
                    self.closeDropdowns();
                    if ($el.hasClass('ts-navbar--menu-open')) {
                        self.closeMenu();
                    }
                    // Return focus to the trigger that was open.
                    if (had) {
                        $el.find('.ts-navbar__dropdown-toggle').filter(function () {
                            return $(this).attr('aria-expanded') === 'false';
                        });
                    }
                }
            });

            // Keyboard arrow navigation across top-level items
            if (o.keyboardNav) {
                self._keyboardNav(ns);
            }

            // Sticky scroll/resize re-measure 
            if (o.sticky && !self._observer) {
                $(window).on(`resize${ns}`, () => self._measureSticky());
            }

            // Re-run current detection on SPA popstate
            if (o.highlightCurrent) {
                $(window).on(`popstate${ns}`, () => self._markCurrent());
            }

            return this;
        }

        /** Toggle a dropdown <li>. Respects the oneOpen option. */
        toggleDropdown($li) {
            const isOpen = $li.hasClass('is-open');
            if (this.options.oneOpen) this.closeDropdowns();
            if (!isOpen) this.openDropdown($li);
            return this;
        }

        /** Open a dropdown <li>. */
        openDropdown($li) {
            $li.addClass('is-open')
               .find('> .ts-navbar__dropdown-toggle')
               .attr('aria-expanded', 'true');

            this.$el.trigger($.Event('open.tsnavbar', { item: $li[0] }));
            return this;
        }

        /** Close every open dropdown. */
        closeDropdowns() {
            this.$el.find('.ts-navbar__item--dropdown.is-open')
                .removeClass('is-open')
                .find('> .ts-navbar__dropdown-toggle')
                .attr('aria-expanded', 'false');

            this.$el.trigger($.Event('close.tsnavbar'));
            return this;
        }

        /** Open/close the mobile collapse region. */
        toggleMenu() {
            return this.$el.hasClass('ts-navbar--menu-open')
                ? this.closeMenu()
                : this.openMenu();
        }

        openMenu() {
            this.$el.addClass('ts-navbar--menu-open')
                .find('.ts-navbar__toggle').attr('aria-expanded', 'true');
            this.$el.trigger($.Event('menuopen.tsnavbar'));
            return this;
        }

        closeMenu() {
            this.$el.removeClass('ts-navbar--menu-open')
                .find('.ts-navbar__toggle').attr('aria-expanded', 'false');
            this.closeDropdowns();
            this.$el.trigger($.Event('menuclose.tsnavbar'));
            return this;
        }

        /** Mark a link as the current page by selector or href. */
        setCurrent(selector) {
            this.$el.find('.ts-navbar__link')
                .removeClass('ts-navbar__link--current')
                .removeAttr('aria-current');

            const $target = this.$el.find(selector);
            $target.addClass('ts-navbar__link--current').attr('aria-current', 'page');

            // Flag the parent dropdown toggle too.
            $target.closest('.ts-navbar__item--dropdown')
                .find('> .ts-navbar__dropdown-toggle')
                .addClass('ts-navbar__link--current-parent');

            return this;
        }

        /** Returns the current link element(s). */
        getCurrent() {
            return this.$el.find('.ts-navbar__link--current');
        }hi

        /** Assigns a unique id to the collapse region and points the toggle at it. */
        _wireCollapse() {
            const self     = this;
            const $collapse = self.$el.find('.ts-navbar__collapse').first();
            if (!$collapse.length) return;

            let id = $collapse.attr('id');
            if (!id || id === 'ts-navbar-collapse') {
                id = `ts-navbar-collapse-${self.uid}`;
                $collapse.attr('id', id);
            }

            self.$el.find('.ts-navbar__toggle').each(function () {
                $(this).attr('aria-controls', id);
                if ($(this).attr('aria-expanded') === undefined) {
                    $(this).attr('aria-expanded', 'false');
                }
            });
        }

        /** Ensures dropdown triggers carry the correct ARIA attributes. */
        _wireDropdowns() {
            this.$el.find('.ts-navbar__item--dropdown > .ts-navbar__dropdown-toggle')
                .each(function () {
                    const $t = $(this);
                    if ($t.attr('aria-haspopup') === undefined) $t.attr('aria-haspopup', 'true');
                    if ($t.attr('aria-expanded') === undefined) $t.attr('aria-expanded', 'false');
                });
        }

        /** Decorates off-origin links: target/rel + an external modifier class. */
        _markExternal() {
            this.$el.find('.ts-navbar__link, .ts-navbar__menu-link').each(function () {
                const $a  = $(this);
                const href = $a.attr('href');
                if (isExternal(href)) {
                    $a.addClass('ts-navbar__link--external');
                    if (!$a.attr('target')) $a.attr('target', '_blank');
                    if (!$a.attr('rel'))    $a.attr('rel', 'noopener noreferrer');
                }
            });
        }

        /** Auto-flags the link whose href matches the current pathname. */
        _markCurrent() {
            const self = this;
            const path = currentPath();
            let   hit  = false;

            self.$el.find('.ts-navbar__link, .ts-navbar__menu-link').each(function () {
                const $a   = $(this);
                const href = $a.attr('href');
                if (!href || href === '#' || $a.hasClass('ts-navbar__link--external')) return;

                const match = linkPath(href) === path;
                $a.toggleClass('ts-navbar__link--current', match)
                  .attr('aria-current', match ? 'page' : null);

                if (match) {
                    hit = true;
                    // If the match lives inside a dropdown, flag the trigger.
                    $a.closest('.ts-navbar__item--dropdown')
                      .find('> .ts-navbar__dropdown-toggle')
                      .addClass('ts-navbar__link--current-parent');
                }
            });

            return hit;
        }

        /** Sets up an IntersectionObserver sentinel so the bar can show an
         *  elevated "stuck" state once it pins to the top of the viewport. */
        _initSticky() {
            const self = this;

            // A zero-height sentinel placed immediately before the navbar.
            self._$sentinel = $('<div class="ts-navbar__sentinel" aria-hidden="true"></div>');
            self.$el.before(self._$sentinel);

            if (typeof IntersectionObserver !== 'undefined') {
                const top = parseInt(self.options.stickyOffset, 10) || 0;
                self._observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            self.$el.toggleClass('ts-navbar--stuck', !entry.isIntersecting);
                        });
                    },
                    { rootMargin: `-${top + 1}px 0px 0px 0px`, threshold: [1] }
                );
                self._observer.observe(self._$sentinel[0]);
            } else {
                // Fallback: scroll handler.
                self._measureSticky();
                $(window).on(`scroll.tsnavbar.${self.uid}`, () => self._measureSticky());
            }
        }

        /** Scroll fallback when IntersectionObserver is unavailable. */
        _measureSticky() {
            if (!this._$sentinel) return;
            const top = parseInt(this.options.stickyOffset, 10) || 0;
            const rect = this._$sentinel[0].getBoundingClientRect();
            this.$el.toggleClass('ts-navbar--stuck', rect.top <= top);
        }

        /** Left/right arrow navigation across the visible top-level links. */
        _keyboardNav(ns) {
            const self = this;

            self.$el.on(`keydown${ns}`, '.ts-navbar__link, .ts-navbar__dropdown-toggle', function (e) {
                const $items = self.$el
                    .find('.ts-navbar__nav > .ts-navbar__item > .ts-navbar__link, ' +
                          '.ts-navbar__nav > .ts-navbar__item > .ts-navbar__dropdown-toggle')
                    .filter(':visible');

                const idx = $items.index(this);
                if (idx === -1) return;

                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    $items.eq(Math.min(idx + 1, $items.length - 1)).trigger('focus');
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    $items.eq(Math.max(idx - 1, 0)).trigger('focus');
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    $items.first().trigger('focus');
                } else if (e.key === 'End') {
                    e.preventDefault();
                    $items.last().trigger('focus');
                } else if ((e.key === 'Enter' || e.key === ' ') &&
                           $(this).hasClass('ts-navbar__dropdown-toggle')) {
                    e.preventDefault();
                    self.toggleDropdown($(this).closest('.ts-navbar__item--dropdown'));
                }
            });
        }

        destroy() {
            const self = this;
            const ns   = `.tsnavbar.${self.uid}`;

            $(window).off(ns);
            $(document).off(ns);
            self.$el.off(ns);

            if (self._observer) {
                self._observer.disconnect();
                self._observer = null;
            }
            if (self._$sentinel) {
                self._$sentinel.remove();
                self._$sentinel = null;
            }

            self.$el
                .removeClass('ts-navbar ts-navbar--sticky ts-navbar--stuck ts-navbar--menu-open')
                .removeAttr('data-ts-navbar-palette')
                .removeData(instanceName);

            self.$el.find('.ts-navbar__item--dropdown.is-open').removeClass('is-open');

            return this;
        }
    }

    PluginNavbar.defaults = {
        palette:             'light', // 'light' | 'dark'
        sticky:              true,    // pin to the top of the viewport on scroll
        stickyOffset:        0,       // px offset from the top when stuck
        highlightCurrent:    true,    // auto-detect the current page link
        markExternal:        true,    // add target/rel + external modifier to off-site links
        closeOnOutsideClick: true,    // close open dropdowns when clicking elsewhere
        keyboardNav:         true,    // arrow / Home / End / Enter / Space key support
        oneOpen:             true     // only one dropdown open at a time
    };

    $.extend(themestrap, { PluginNavbar });

    $.fn.themestrapPluginNavbar = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginNavbar($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Code Window Plugin
 *
 * Decorates a group of <pre> code blocks with a mac or windows editor window:
 * a chrome bar (mac or windows buttons + a filename tab strip), a body that shows
 * one pane at a time, and an optional ambient gradient glow behind the frame.
 * Syntax highlighting, line numbers and the copy button are delegated to
 * PluginHighlight — this plugin only owns the window shell and tab switching.
 *
 * Part of the Themestrap component library for MODX 3.
 *
 * MARKUP
 *   <div data-plugin-code-window
 *        data-plugin-options='{"glow": true, "activeTab": 0}'>
 *
 *     <pre data-code-window-tab="cache-advance.config.js"
 *          data-plugin-highlight="javascript"
 *          data-plugin-highlight-lines="2,3-5"><code>export default {
 *     strategy: 'predictive',
 *   }</code></pre>
 *
 *     <pre data-code-window-tab="package.json"
 *          data-plugin-highlight="json"><code>{ "name": "cache-advance" }</code></pre>
 *
 *   </div>
 *
 * Each direct-child <pre> becomes one tab. The tab label is read from
 * data-code-window-tab (falls back to "untitled"). All standard PluginHighlight
 * data-* attributes (data-plugin-highlight, -lines, -hljs-config) stay on the
 * <pre> and are honored.
 *
 * OPTIONS (data-plugin-options)
 *   activeTab   {number}  Zero-based index of the pane shown first.   default 0
 *   chrome      {string}  Render either a Mac or Windows topbar.      default 'win'
 *   tabs        {bool}    Render the filename tab strip.              default true
 *   glow        {bool}    Ambient gradient glow behind the window.    default true
 *   lineNumbers {bool}    Forwarded to PluginHighlight.               default true
 *   showCopy    {bool}    Forwarded to PluginHighlight (copy button). default true
 *   highlight   {bool}    Run PluginHighlight on each pane.           default true
 *   accent      {string}  CSS color for the active-tab indicator.    default '' (theme)
 *
 * EVENTS
 *   codewindow:ready  (e, instance)                 fired once after build
 *   codewindow:tab    (e, instance, index, $pane)   fired on every tab change
 *
 * PROGRAMMATIC API 
 *   const cw = $('#hero-code').data('__codeWindow');
 *   cw.activate(1);          // switch to the second pane
 *   cw.next(); cw.prev();    // cycle panes
 *   cw.destroy();            // restore original markup
 *
 *   // Code Window
 *   if ($.isFunction($.fn['themestrapPluginCodeWindow']) && $('[data-plugin-code-window]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-code-window]:not(.manual)', 'themestrapPluginCodeWindow');
 *   }
 */
// Code Window
(((themestrap = {}, $) => {
    const instanceName = '__codeWindow';

    // Injected once per page, keyed to STYLE_ID — loading the script never adds
    // CSS to pages that don't use the plugin (styles land on first build()).
    const STYLE_ID = 'ts-code-window-styles';

    const CSS_TEXT = `/* Themestrap — PluginCodeWindow */
.ts-code-window {
    --ts-cw-radius:        4px;
    --ts-cw-bg:            #212529;
    --ts-cw-chrome-bg:     #16181b;
    --ts-cw-border:        rgba(255,255,255,0.08);
    --ts-cw-tab-fg:        rgba(245,241,234,0.50);
    --ts-cw-tab-fg-active: #f5f1ea;
    --ts-cw-accent:        var(--primary);
    --ts-cw-glow-1:        rgba(42,184,200,0.30);
    --ts-cw-glow-2:        rgba(232,103,42,0.28);
    --ts-cw-shadow:        0 30px 60px -20px rgba(0,0,0,0.55),
                           0 12px 24px -12px rgba(0,0,0,0.45);

    position: relative;
    border-radius: var(--ts-cw-radius);
    background: var(--ts-cw-bg);
    border: 1px solid var(--ts-cw-border);
    box-shadow: var(--ts-cw-shadow);
    overflow: hidden;
    isolation: isolate;
    margin-bottom: 2em;
}

/* Light theme tuning (page default). Dark theme keeps the dark editor look. */
html:not(.dark) .ts-code-window {
    --ts-cw-shadow: 0 24px 50px -22px rgba(10,25,41,0.35),
                    0 8px 18px -10px rgba(10,25,41,0.20);
}

/* Ambient gradient glow */
.ts-code-window--glow::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, var(--ts-cw-glow-1), transparent 40%, var(--ts-cw-glow-2));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    opacity: 0.9;
    pointer-events: none;
}
.ts-code-window--glow::after {
    content: '';
    position: absolute;
    z-index: -2;
    inset: -40px -30px auto -30px;
    height: 120px;
    background:
        radial-gradient(40% 120% at 20% 0%, var(--ts-cw-glow-1) 0%, transparent 70%),
        radial-gradient(40% 120% at 85% 0%, var(--ts-cw-glow-2) 0%, transparent 70%);
    filter: blur(28px);
    opacity: 0.55;
    pointer-events: none;
}

/* Mac Chrome bar */
.ts-code-window__chrome.mac {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 14px;
    height: 44px;
    background: var(--ts-cw-chrome-bg);
    border-bottom: 1px solid var(--ts-cw-border);
}

.ts-code-window__dots {
    display: flex;
    gap: 7px;
    flex-shrink: 0;
}
.ts-code-window__dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255,255,255,0.16);
}
.ts-code-window__dots span:nth-child(1) { background: #ff5f57; }
.ts-code-window__dots span:nth-child(2) { background: #febc2e; }
.ts-code-window__dots span:nth-child(3) { background: #28c840; }

/* Windows chrome bar */
.ts-code-window__chrome.win {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 38px;
    background: var(--ts-cw-chrome-bg);
    border-bottom: 1px solid var(--ts-cw-border);
}

.ts-code-window__btns {
    display: flex;
    align-items: stretch;
    margin-left: auto;
    align-self: stretch;
    flex-shrink: 0;
}

.ts-code-window__btns .button {
    width: 46px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    transition: background-color 0.15s ease;
}

.ts-code-window__btns .button svg {
    width: 10px;
    height: 10px;
    fill: rgba(255,255,255,0.75);
}

.ts-code-window__btns .button {
    width: 48px;
}

.ts-code-window__btns .button svg {
    width: 9px;
    height: 9px;
}

/* Tab strip */
.ts-code-window__tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0;
    padding: 0;
    height: 100%;
}
.ts-code-window__chrome.win .ts-code-window__tabs {
    flex: 1 1 auto;
    min-width: 0;
}
.ts-code-window__tabs::-webkit-scrollbar { display: none; }

.ts-code-window__tab {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--ts-cw-tab-fg);
    font-family: var(--mono, ui-monospace, 'JetBrains Mono', monospace);
    font-size: 12.5px;
    line-height: 1;
    padding: 0 14px;
    height: 100%;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    transition: color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}
.ts-code-window__tab:hover { color: var(--ts-cw-tab-fg-active); }
.ts-code-window__tab[aria-selected="true"] {
    color: var(--ts-cw-tab-fg-active);
}
.ts-code-window__tab[aria-selected="true"]::after {
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--ts-cw-accent);
}
.ts-code-window__tab:focus-visible {
    outline: 2px solid var(--ts-cw-accent);
    outline-offset: -2px;
    border-radius: 4px;
}

/* Single-tab / no-tabs: render the filename as a static label */
.ts-code-window--single .ts-code-window__tab { cursor: default; }
.ts-code-window--single .ts-code-window__tab[aria-selected="true"]::after { display: none; }

/* Body + panes */
.ts-code-window__body {
    position: relative;
    background: var(--ts-cw-bg);
}
.ts-code-window__pane { display: none; }
.ts-code-window__pane.is-active { display: block; }

/* Normalize the contained <pre> so the window owns the frame */
.ts-code-window__pane pre {
    margin: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}

.ts-code-window__filename {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Langauge */
.ts-code-window__lang {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 2px 6px;
    border-radius: 999px;

    font-size: 10px;
    font-weight: 600;
    line-height: 1;

    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.75);

    text-transform: uppercase;
    letter-spacing: .04em;
}

.ts-code-window__lang.lang-javascript {
    background: rgba(247,223,30,.15);
    color: #f7df1e;
}

.ts-code-window__lang.lang-css {
    background: rgba(38,77,228,.15);
    color: #5b8cff;
}

.ts-code-window__lang.lang-html {
    background: rgba(228,77,38,.15);
    color: #ff8b6b;
}

.ts-code-window__lang.lang-php {
    background: rgba(119,123,180,.15);
    color: #a9afff;
}

.ts-code-window__lang.lang-json {
    background: rgba(255,255,255,.10);
    color: #fff;
}
`;

    class PluginCodeWindow {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;
            this.initialHTML = $el.html();   // capture before build mutates the DOM

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
            const pluginOpts = themestrap.fn.getOptions(
                this.$el.data('plugin-options')
            ) || {};

            this.options = $.extend(true, {}, PluginCodeWindow.defaults, pluginOpts, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            const self = this;
            this.injectStyles();

            // Collect the source panes (direct-child <pre>, else any descendant <pre>)
            let $panes = this.$el.children('pre');
            if (!$panes.length) $panes = this.$el.find('pre');
            if (!$panes.length) {
                // Nothing to decorate — leave the element untouched.
                return this;
            }

            // Build the window shell
            const $window = $('<div class="ts-code-window" role="group"></div>');
            if (this.options.glow)  $window.addClass('ts-code-window--glow');
            if ($panes.length < 2)  $window.addClass('ts-code-window--single');
            if (this.options.accent) $window.css('--ts-cw-accent', this.options.accent);

            const $chrome = $('<div class="ts-code-window__chrome mac"></div>');

            if (this.options.chrome === 'mac') {
                $chrome.addClass('mac').append(
                    '<div class="ts-code-window__dots" aria-hidden="true"><span></span><span></span><span></span></div>'
                );
            }

            const $tabs = $('<div class="ts-code-window__tabs" role="tablist"></div>');
            const $body = $('<div class="ts-code-window__body"></div>');

            this.$tabButtons = [];
            this.$panes      = [];

            const baseId  = this.$el.attr('id') || `codewindow-${++PluginCodeWindow._seq}`;
            this.$el.attr('id', baseId);

            const active = this.clampIndex(this.options.activeTab, $panes.length);

            $panes.each(function (i, preEl) {
                const $pre   = $(preEl);
                const label  = $pre.attr('data-code-window-tab') || $pre.data('codeWindowTab') || 'untitled';
                const tabId  = `${baseId}-tab-${i}`;
                const paneId = `${baseId}-pane-${i}`;
                const language = $pre.attr('data-plugin-highlight') || $pre.data('pluginHighlight') || 'text';
                // Pane wrapper
                const $pane = $('<div class="ts-code-window__pane"></div>')
                    .attr({ id: paneId, role: 'tabpanel', 'aria-labelledby': tabId, tabindex: '0' });

                if (i === active) $pane.addClass('is-active');

                // Avoid double auto-init from themestrap.init.js — this plugin
                // drives highlighting explicitly below.
                $pre.addClass('manual').appendTo($pane);
                $body.append($pane);

                // Tab button
                const $tab = $('<button type="button" class="ts-code-window__tab"></button>')
                    .attr({
                        id: tabId,
                        role: 'tab',
                        'aria-controls': paneId,
                        'aria-selected': i === active ? 'true' : 'false',
                        tabindex: i === active ? '0' : '-1',
                    });
                
                $tab.append(
                    $('<span class="ts-code-window__filename"></span>').text(label)
                );
                
                $tab.append(
                    $('<span class="ts-code-window__lang"></span>')
                        .addClass(`lang-${language.toLowerCase()}`)
                        .text(language)
                );

                if (self.options.tabs) $tabs.append($tab);

                self.$tabButtons.push($tab);
                self.$panes.push($pane);
            });

            if (this.options.tabs) $chrome.append($tabs);
            
            if (this.options.chrome === 'win') {
                const $winBtns = $('<div class="ts-code-window__btns" aria-hidden="true"></div>')
                $winBtns
                    .append('<div class="minimize button"><svg viewBox="0 0 10.2 1" y="0px" x="0px"><rect height="1" width="10.2" y="50%" x="0"></rect></svg></div>')
                    .append('<div class="maximize button"><svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z"></path></svg></div>')
                    .append('<div class="close button"><svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"></polygon></svg></div>');
                $chrome.addClass('win').removeClass('mac').append($winBtns);
            }

            // Assemble + swap into the DOM
            $window.append($chrome, $body);
            this.$el.empty().append($window);

            this.$window = $window;
            this.activeIndex = active;

            // Delegate syntax highlighting to PluginHighlight (when present)
            this.highlightPanes();

            this.$el.trigger('codewindow:ready', [this]);
            return this;
        }

        highlightPanes() {
            const self = this;
            if (!this.options.highlight) return this;

            if (!$.isFunction($.fn.themestrapPluginHighlight)) {
                // Highlight plugin not on the page — panes still render as plain
                // (but styled) code. Nothing else to do.
                return this;
            }

            this.$panes.forEach($pane => {
                $pane.find('pre').themestrapPluginHighlight({
                    lineNumbers: self.options.lineNumbers,
                    showCopy:    self.options.showCopy,
                });
            });

            return this;
        }

        events() {
            const self = this;

            // Tab click
            this.$window.on('click.codewindow', '.ts-code-window__tab', function () {
                const id = $(this).attr('id');
                const i  = self.$tabButtons.findIndex($b => $b.attr('id') === id);
                if (i > -1) self.activate(i);
            });

            // Roving-tabindex keyboard support (ARIA tab pattern)
            this.$window.on('keydown.codewindow', '.ts-code-window__tab', function (e) {
                const id = $(this).attr('id');
                const i  = self.$tabButtons.findIndex($b => $b.attr('id') === id);
                if (i < 0) return;

                let next = null;
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown': next = (i + 1) % self.$tabButtons.length; break;
                    case 'ArrowLeft':
                    case 'ArrowUp':   next = (i - 1 + self.$tabButtons.length) % self.$tabButtons.length; break;
                    case 'Home':      next = 0; break;
                    case 'End':       next = self.$tabButtons.length - 1; break;
                    default: return;
                }

                e.preventDefault();
                self.activate(next);
                self.$tabButtons[next].trigger('focus');
            });

            return this;
        }

        activate(index) {
            const i = this.clampIndex(index, this.$panes.length);
            if (i === this.activeIndex) return this;

            this.$tabButtons.forEach(($tab, n) => {
                const on = n === i;
                $tab.attr({ 'aria-selected': on ? 'true' : 'false', tabindex: on ? '0' : '-1' });
            });

            this.$panes.forEach(($pane, n) => $pane.toggleClass('is-active', n === i));

            this.activeIndex = i;
            this.$el.trigger('codewindow:tab', [this, i, this.$panes[i]]);
            return this;
        }

        next() { return this.activate((this.activeIndex + 1) % this.$panes.length); }
        prev() { return this.activate((this.activeIndex - 1 + this.$panes.length) % this.$panes.length); }

        clampIndex(n, len) {
            n = parseInt(n, 10);
            if (isNaN(n) || n < 0) return 0;
            if (n > len - 1) return len - 1;
            return n;
        }

        injectStyles() {
            if (document.getElementById(STYLE_ID)) return this;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS_TEXT;
            document.head.appendChild(style);
            return this;
        }

        destroy() {
            if (this.$window) this.$window.off('.codewindow');
            this.$el.html(this.initialHTML).removeData(instanceName);
            return this;
        }
    }

    PluginCodeWindow._seq = 0;

    PluginCodeWindow.defaults = {
        activeTab:   0,
        chrome:      'win', // win or mac
        tabs:        true,
        glow:        true,
        lineNumbers: true,
        showCopy:    true,
        highlight:   true,
        accent:      '',
    };

    $.extend(themestrap, { PluginCodeWindow });

    $.fn.themestrapPluginCodeWindow = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCodeWindow($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Popover Plugin
 * Accessible, anchor-positioned popovers.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * Markup anatomy
 *
 *   <!-- Wrapper (the plugin root — positions anchor + popover together) -->
 *   <div data-plugin-popover
 *        data-plugin-options='{"side": "bottom", "align": "start"}'>
 *
 *     <!-- Trigger: the button / link that opens the popover -->
 *     <button data-popover-trigger>Open</button>
 *
 *     <!-- Content panel: shown/hidden by the plugin -->
 *     <div data-popover-content>
 *       <h4 data-popover-title>Popover heading</h4>
 *       <p>Your popover content goes here.</p>
 *     </div>
 *   </div>
 *
 * Alternatively: trigger and content in separate DOM positions
 *
 *   <button data-popover-trigger="settings-pop">Settings</button>
 *
 *   <div data-plugin-popover id="settings-pop"
 *        data-plugin-options='{"side":"right"}'>
 *     <div data-popover-content>…</div>
 *   </div>
 *
 * Options (data-plugin-options JSON or JS object)
 *
 *   side              "top"|"bottom"|"left"|"right"   where the popover appears
 *   align             "start"|"center"|"end"          alignment along the side axis
 *   offset            8                               gap between trigger and popover (px)
 *   arrow             true                            show a pointing arrow
 *   portaling         false                           append content to <body> to escape
 *                                                     overflow:hidden / stacking contexts
 *   closeOnEscape     true                            Escape key closes
 *   closeOnOutside    true                            click outside closes
 *   animationIn       "ts-pop-in"                     CSS animation class on open
 *   animationOut      "ts-pop-out"                    CSS animation class on close
 *   animationDuration 200                             ms fallback if animationend stalls
 *   modal             false                           trap focus inside content
 *   onOpen            null                            callback(instance)
 *   onClose           null                            callback(instance)
 *
 * Public API
 *
 *   const pop = $('#my-popover').data('__pluginPopover');
 *   pop.open();
 *   pop.close();
 *   pop.toggle();
 *   pop.update();   // reposition without closing
 *
 * Events fired on [data-plugin-popover]
 *
 *   popover:open   — after open animation begins   (detail: instance)
 *   popover:close  — after close animation ends    (detail: instance)
 *
 * Init.js wiring
 *
 *   if ($.isFunction($.fn['themestrapPluginPopover']) && $('[data-plugin-popover]').length) {
 *       $(() => {
 *           $('[data-plugin-popover]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginPopover(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginPopover';

    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    const FOCUSABLE = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ].join(', ');

    const STYLE_ID = 'ts-popover-styles';

    const CSS_TEXT = `
/* Themestrap Popover */

/* Wrapper: gives the trigger a positioning context */
[data-plugin-popover] {
    position: relative;
    display: inline-block;
}

/* The content panel */
[data-popover-content] {
    position: absolute;
    z-index: 9995;
    min-width: 14rem;
    max-width: 22rem;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 0.5rem;
    box-shadow:
        0 4px  6px -1px rgba(0, 0, 0, 0.07),
        0 10px 15px -3px rgba(0, 0, 0, 0.10);
    padding: 1rem;
    line-height: 1.5;
    color: #1a1a2e;

    /* Hidden by default */
    display: none;
    pointer-events: none;
}

[data-popover-content].ts-pop-visible {
    display: block;
    pointer-events: auto;
}

[data-popover-title] {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0 0 0.375rem;
    line-height: 1.3;
}

/* Arrow */

[data-popover-content]::before,
[data-popover-content]::after {
    content: '';
    display: none;
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    pointer-events: none;
}

[data-popover-content].ts-pop-arrow::before,
[data-popover-content].ts-pop-arrow::after {
    display: block;
}

/* Bottom arrow (popover is above trigger) */
[data-popover-content].ts-pop-side-top::after  { top: 100%; border-top-color: #fff; }
[data-popover-content].ts-pop-side-top::before { top: calc(100% + 1px); border-top-color: rgba(0,0,0,0.08); }

/* Top arrow (popover is below trigger) */
[data-popover-content].ts-pop-side-bottom::after  { bottom: 100%; border-bottom-color: #fff; }
[data-popover-content].ts-pop-side-bottom::before { bottom: calc(100% + 1px); border-bottom-color: rgba(0,0,0,0.08); }

/* Right arrow (popover is left of trigger) */
[data-popover-content].ts-pop-side-left::after  { left: 100%; border-left-color: #fff; }
[data-popover-content].ts-pop-side-left::before { left: calc(100% + 1px); border-left-color: rgba(0,0,0,0.08); }

/* Left arrow (popover is right of trigger) */
[data-popover-content].ts-pop-side-right::after  { right: 100%; border-right-color: #fff; }
[data-popover-content].ts-pop-side-right::before { right: calc(100% + 1px); border-right-color: rgba(0,0,0,0.08); }

/* Animations */
@keyframes tsPopIn {
    from { opacity: 0; transform: scale(0.96) translateY(-4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes tsPopOut {
    from { opacity: 1; transform: scale(1)    translateY(0); }
    to   { opacity: 0; transform: scale(0.96) translateY(-4px); }
}

[data-popover-content].ts-pop-in  { animation: tsPopIn  0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
[data-popover-content].ts-pop-out { animation: tsPopOut 0.12s ease-in                        forwards; }

/* Side-aware: popover below trigger slides down */
[data-popover-content].ts-pop-side-bottom.ts-pop-in  { animation-name: tsPopInDown; }
[data-popover-content].ts-pop-side-bottom.ts-pop-out { animation-name: tsPopOutDown; }

@keyframes tsPopInDown {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes tsPopOutDown {
    from { opacity: 1; transform: scale(1)    translateY(0); }
    to   { opacity: 0; transform: scale(0.96) translateY(4px); }
}

/* Left / Right sides */
@keyframes tsPopInLeft {
    from { opacity: 0; transform: scale(0.96) translateX(-4px); }
    to   { opacity: 1; transform: scale(1)    translateX(0); }
}
@keyframes tsPopOutLeft {
    from { opacity: 1; transform: scale(1)    translateX(0); }
    to   { opacity: 0; transform: scale(0.96) translateX(-4px); }
}

[data-popover-content].ts-pop-side-left.ts-pop-in  { animation-name: tsPopInLeft; }
[data-popover-content].ts-pop-side-left.ts-pop-out { animation-name: tsPopOutLeft; }

@keyframes tsPopInRight {
    from { opacity: 0; transform: scale(0.96) translateX(4px); }
    to   { opacity: 1; transform: scale(1)    translateX(0); }
}
@keyframes tsPopOutRight {
    from { opacity: 1; transform: scale(1)    translateX(0); }
    to   { opacity: 0; transform: scale(0.96) translateX(4px); }
}

[data-popover-content].ts-pop-side-right.ts-pop-in  { animation-name: tsPopInRight; }
[data-popover-content].ts-pop-side-right.ts-pop-out { animation-name: tsPopOutRight; }

/* Dark mode — uses Porto/Themestrap CSS custom properties set by html.dark */
html.dark [data-popover-content] {
    background: var(--dark-300);
    color: var(--default);
    border-color: var(--dark-rgba-50);
    box-shadow:
        0 4px  6px -1px rgba(0, 0, 0, 0.3),
        0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

html.dark [data-popover-content].ts-pop-side-top::after    { border-top-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-top::before   { border-top-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-bottom::after  { border-bottom-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-bottom::before { border-bottom-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-left::after   { border-left-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-left::before  { border-left-color: var(--dark-rgba-50); }
html.dark [data-popover-content].ts-pop-side-right::after  { border-right-color: var(--dark-300); }
html.dark [data-popover-content].ts-pop-side-right::before { border-right-color: var(--dark-rgba-50); }
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id          = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    /**
     * Relative positioning math (default, portaling: false)
     * Computes CSS `top` and `left` relative to [data-plugin-popover] wrapper.
     */
    function computePosition($trigger, $content, side, align, offset) {
        const tw = $trigger.outerWidth();
        const th = $trigger.outerHeight();
        const cw = $content.outerWidth();
        const ch = $content.outerHeight();

        let top = 0;
        let left = 0;

        switch (side) {
            case 'top':    top  = -(ch + offset); left = 0;          break;
            case 'bottom': top  = th + offset;    left = 0;          break;
            case 'left':   top  = 0;              left = -(cw + offset); break;
            case 'right':  top  = 0;              left = tw + offset; break;
        }

        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':  left = 0;             break;
                case 'center': left = (tw - cw) / 2; break;
                case 'end':    left = tw - cw;       break;
            }
        } else {
            switch (align) {
                case 'start':  top = 0;              break;
                case 'center': top = (th - ch) / 2;  break;
                case 'end':    top = th - ch;        break;
            }
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            const triggerCentreInContent = (tw / 2) - left;
            arrowOffset = Math.max(10, Math.min(cw - 10, triggerCentreInContent)) - 6;
        } else {
            const triggerCentreInContent = (th / 2) - top;
            arrowOffset = Math.max(10, Math.min(ch - 10, triggerCentreInContent)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /**
     * Portaled positioning math (portaling: true)
     * Computes absolute page coordinates so the content can escape
     * overflow:hidden ancestors and complex stacking contexts.
     */
    function computePortaledPosition($trigger, $content, side, align, offset) {
        const rect      = $trigger[0].getBoundingClientRect();
        const scrollTop = window.scrollY  || document.documentElement.scrollTop;
        const scrollLeft= window.scrollX  || document.documentElement.scrollLeft;

        const tTop  = rect.top  + scrollTop;
        const tLeft = rect.left + scrollLeft;
        const tw    = rect.width;
        const th    = rect.height;
        const cw    = $content.outerWidth();
        const ch    = $content.outerHeight();

        let top = 0;
        let left = 0;

        switch (side) {
            case 'top':    top  = tTop - ch - offset; left = tLeft;          break;
            case 'bottom': top  = tTop + th + offset; left = tLeft;          break;
            case 'left':   top  = tTop;               left = tLeft - cw - offset; break;
            case 'right':  top  = tTop;               left = tLeft + tw + offset; break;
        }

        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':  /* left = tLeft already set */ break;
                case 'center': left = tLeft + (tw / 2) - (cw / 2); break;
                case 'end':    left = tLeft + tw - cw; break;
            }
        } else {
            switch (align) {
                case 'start':  /* top = tTop already set */ break;
                case 'center': top = tTop + (th / 2) - (ch / 2); break;
                case 'end':    top = tTop + th - ch; break;
            }
        }

        let arrowOffset = null;
        if (side === 'top' || side === 'bottom') {
            const triggerCentreInContent = (tLeft + (tw / 2)) - left;
            arrowOffset = Math.max(10, Math.min(cw - 10, triggerCentreInContent)) - 6;
        } else {
            const triggerCentreInContent = (tTop + (th / 2)) - top;
            arrowOffset = Math.max(10, Math.min(ch - 10, triggerCentreInContent)) - 6;
        }

        return { top, left, arrowOffset };
    }

    /**
     * Flip logic: return the actual side to use after checking viewport space.
     */
    function resolvedSide($trigger, side, offset) {
        const rect = $trigger[0].getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        switch (side) {
            case 'top':    return rect.top    < (200 + offset)      ? 'bottom' : side;
            case 'bottom': return rect.bottom > (vh - 200 - offset) ? 'top'    : side;
            case 'left':   return rect.left   < (200 + offset)      ? 'right'  : side;
            case 'right':  return rect.right  > (vw - 200 - offset) ? 'left'   : side;
            default:       return side;
        }
    }

    class PluginPopover {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el         = $el;
            this.isOpen      = false;
            this._uid        = uid('popover');
            this._activeSide = null;

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
            this.options = $.extend(true, {}, PluginPopover.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            injectStyles();

            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // Case A: trigger is *inside* [data-plugin-popover]
            self.$trigger = $el.find('[data-popover-trigger]').first();

            // Case B: trigger is elsewhere in the DOM, pointing to this popover by id
            if (!self.$trigger.length) {
                const popId = $el.attr('id');
                if (popId) {
                    self.$trigger = $(`[data-popover-trigger="${popId}"]`).first();
                }
            }

            self.$content = $el.find('[data-popover-content]').first();

            if (!self.$content.length) {
                console.warn('[PluginPopover] No [data-popover-content] found inside', $el[0]);
                return this;
            }

            // Track original DOM parent so destroy() can move portal content back
            self.$contentOriginalParent = self.$content.parent();

            const contentId = self.$content.attr('id') || uid('pop-content');
            self.$content.attr('id', contentId);
            self.$content.attr('role', 'dialog');
            self.$content.attr('aria-modal', opts.modal ? 'true' : 'false');

            const $title = self.$content.find('[data-popover-title]').first();
            if ($title.length) {
                const titleId = $title.attr('id') || uid('pop-title');
                $title.attr('id', titleId);
                self.$content.attr('aria-labelledby', titleId);
            }

            if (self.$trigger.length) {
                self.$trigger.attr('aria-haspopup', 'dialog');
                self.$trigger.attr('aria-expanded', 'false');
                self.$trigger.attr('aria-controls', contentId);
            }

            if (opts.arrow) {
                self.$content.addClass('ts-pop-arrow');
            }

            if (opts.portaling) {
                // Move content to <body> so it escapes overflow:hidden stacking contexts.
                // destroy() moves it back to $contentOriginalParent.
                self.$content.appendTo(document.body);
            }

            return this;
        }

        events() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // Stop clicks inside the popover content from bubbling to the
            // document closeOnOutside handler.
            self.$content.on(`click.popover.${self._uid}`, function (e) {
                e.stopPropagation();
            });

            // Trigger: toggle on click
            if (self.$trigger && self.$trigger.length) {
                self.$trigger.on(`click.popover.${self._uid}`, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.toggle();
                });
            }

            // Escape key
            if (opts.closeOnEscape) {
                $(document).on(`keydown.popover.${self._uid}`, function (e) {
                    if (self.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                        e.preventDefault();
                        self.close();
                        if (self.$trigger && self.$trigger.length) {
                            self.$trigger.trigger('focus');
                        }
                    }
                });
            }

            // Click outside to close
            if (opts.closeOnOutside) {
                $(document).on(`click.popover.${self._uid}`, function (e) {
                    if (!self.isOpen) return;

                    const $target   = $(e.target);
                    const inContent = $target.closest(self.$content).length > 0;
                    const inTrigger = self.$trigger && self.$trigger.length
                        ? $target.closest(self.$trigger).length > 0
                        : false;
                    const inRoot    = $target.closest($el).length > 0;

                    if (!inContent && !inTrigger && !inRoot) {
                        self.close();
                    }
                });
            }

            // Mutual exclusion: close this popover when any other one opens.
            // FIX: use 'ts-popover-opened' (no colon in event name) so jQuery's
            // namespace separator '.' works correctly in both on() and off().
            $(document).on(`ts-popover-opened.popover.${self._uid}`, function (e, openedUid) {
                if (self.isOpen && self._uid !== openedUid) {
                    self.close();
                }
            });

            // Focus trap (modal: true)
            if (opts.modal) {
                self.$content.on(`keydown.popover.${self._uid}`, function (e) {
                    if (!self.isOpen || (e.key !== 'Tab' && e.keyCode !== 9)) return;
                    self._trapFocus(e);
                });
            }

            // Reposition on scroll/resize
            $(window).on(`resize.popover.${self._uid} scroll.popover.${self._uid}`, function () {
                if (self.isOpen) self._position();
            });

            return this;
        }

        open() {
            const self = this;
            const opts = self.options;

            if (self.isOpen) return this;
            self.isOpen = true;

            // Broadcast so other popovers can close themselves.
            // FIX: matches the renamed event in events().
            $(document).trigger('ts-popover-opened', [self._uid]);

            self.$content
                .removeClass(opts.animationOut)
                .addClass('ts-pop-visible');

            self._position();

            self.$content
                .removeClass(opts.animationOut)
                .addClass(opts.animationIn)
                .one('animationend webkitAnimationEnd', function () {
                    self.$content.removeClass(opts.animationIn);
                });

            setTimeout(() => {
                if (self.isOpen) self.$content.removeClass(opts.animationIn);
            }, opts.animationDuration + 30);

            if (self.$trigger && self.$trigger.length) {
                self.$trigger.attr('aria-expanded', 'true');
            }

            setTimeout(() => {
                const $focusable = self.$content.find(FOCUSABLE).filter(':visible').first();
                if ($focusable.length) {
                    $focusable.trigger('focus');
                } else {
                    self.$content.attr('tabindex', '-1').trigger('focus');
                }
            }, 30);

            if (typeof opts.onOpen === 'function') opts.onOpen.call(self);
            self.$el.trigger('popover:open', [self]);

            return this;
        }

        close() {
            const self = this;
            const opts = self.options;

            if (!self.isOpen) return this;

            // Mark closed immediately so re-entrant calls and the mutual-exclusion
            // handler do not re-close an already-closing popover.
            self.isOpen = false;

            if (self.$trigger && self.$trigger.length) {
                self.$trigger.attr('aria-expanded', 'false');
            }

            self.$content
                .removeClass(opts.animationIn)
                .addClass(opts.animationOut)
                .one('animationend webkitAnimationEnd', function () {
                    self._finishClose();
                });

            // Safety fallback if animationend never fires
            setTimeout(() => {
                if (!self.isOpen) self._finishClose();
            }, opts.animationDuration + 30);

            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        update() {
            if (this.isOpen) this._position();
            return this;
        }

        _finishClose() {
            const self = this;
            const opts = self.options;

            // Guard: if quickly re-opened during the animation, do not hide.
            if (self.isOpen) return;

            self.$content
                .removeClass(`ts-pop-visible ${opts.animationOut}`)
                .css({ top: '', left: '' })
                .removeClass(
                    'ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right'
                );

            if (typeof opts.onClose === 'function') opts.onClose.call(self);
            self.$el.trigger('popover:close', [self]);
        }

        _position() {
            const self = this;
            const opts = self.options;

            if (!self.$trigger || !self.$trigger.length) return;

            const side = resolvedSide(self.$trigger, opts.side, opts.offset);
            self._activeSide = side;

            const compute = opts.portaling ? computePortaledPosition : computePosition;
            const { top, left, arrowOffset } = compute(
                self.$trigger,
                self.$content,
                side,
                opts.align,
                opts.offset
            );

            self.$content
                .removeClass('ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right')
                .addClass(`ts-pop-side-${side}`)
                .css({ top, left });

            if (opts.arrow && arrowOffset !== null) {
                const prop = (side === 'top' || side === 'bottom')
                    ? '--ts-pop-arrow-x'
                    : '--ts-pop-arrow-y';
                self.$content[0].style.setProperty(prop, arrowOffset + 'px');

                self.$content.find('style.ts-pop-arrow-style').remove();
                const arrowStyle  = document.createElement('style');
                arrowStyle.className = 'ts-pop-arrow-style';
                const arrowProp   = (side === 'top' || side === 'bottom') ? 'left' : 'top';
                arrowStyle.textContent = `
                    #${self.$content.attr('id')}::before,
                    #${self.$content.attr('id')}::after {
                        ${arrowProp}: ${arrowOffset}px;
                    }
                `;
                self.$content.append(arrowStyle);
            }
        }

        _trapFocus(e) {
            const focusable = this.$content.find(FOCUSABLE).filter(':visible');
            if (!focusable.length) { e.preventDefault(); return; }

            const $first   = focusable.first();
            const $last    = focusable.last();
            const $current = $(document.activeElement);

            if (e.shiftKey) {
                if ($current.is($first)) { e.preventDefault(); $last.trigger('focus'); }
            } else {
                if ($current.is($last))  { e.preventDefault(); $first.trigger('focus'); }
            }
        }

        destroy() {
            const self = this;
            const $el  = self.$el;

            if (self.isOpen) {
                self.isOpen = false;
                self._finishClose();
            }

            if (self.$trigger && self.$trigger.length) {
                self.$trigger
                    .off(`.popover.${self._uid}`)
                    .removeAttr('aria-haspopup aria-expanded aria-controls');
            }

            // FIX: off() with namespace '.popover.{uid}' now cleanly removes ALL
            // events registered under that namespace, including 'ts-popover-opened'
            // because the event name is now 'ts-popover-opened.popover.{uid}'.
            $(document).off(`.popover.${self._uid}`);
            $(window).off(`.popover.${self._uid}`);

            if (self.$content && self.$content.length) {
                self.$content.off(`.popover.${self._uid}`);
                self.$content.find('style.ts-pop-arrow-style').remove();

                // FIX: if portaling moved $content to <body>, move it back to its
                // original parent before final cleanup, preventing an orphaned node.
                if (self.options.portaling && self.$contentOriginalParent && self.$contentOriginalParent.length) {
                    self.$content.appendTo(self.$contentOriginalParent);
                }

                self.$content
                    .removeAttr('id role aria-modal aria-labelledby tabindex')
                    .removeClass(
                        'ts-pop-visible ts-pop-arrow ' +
                        'ts-pop-side-top ts-pop-side-bottom ts-pop-side-left ts-pop-side-right ' +
                        `${self.options.animationIn} ${self.options.animationOut}`
                    )
                    .css({ top: '', left: '' });
            }

            $el.removeData(instanceName);

            return this;
        }
    }

    PluginPopover.defaults = {
        side              : 'bottom',   // top | bottom | left | right
        align             : 'start',    // start | center | end
        offset            : 8,          // px gap between trigger and popover
        arrow             : true,       // show CSS arrow
        portaling         : false,      // append content to <body> to escape stacking contexts
        closeOnEscape     : true,
        closeOnOutside    : true,
        animationIn       : 'ts-pop-in',
        animationOut      : 'ts-pop-out',
        animationDuration : 200,        // ms — fallback if animationend never fires
        modal             : false,      // trap focus inside content
        onOpen            : null,       // function(instance) {}
        onClose           : null,       // function(instance) {}
    };

    $.extend(themestrap, { PluginPopover });

    $.fn.themestrapPluginPopover = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginPopover($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);

/**
 * Themestrap Navigation Menu Plugin
 * Accessible, animated mega-menu / navigation menu.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * Markup anatomy
 *
 *   <nav data-plugin-navmenu
 *        data-plugin-options='{"orientation":"horizontal","delay":200}'>
 *
 *     <!-- Each top-level item -->
 *     <div data-navmenu-item>
 *
 *       <!-- Plain link (no sub-menu) -->
 *       <a href="/about" data-navmenu-link>About</a>
 *
 *     </div>
 *
 *     <div data-navmenu-item>
 *
 *       <!-- Trigger button (opens the content panel) -->
 *       <button data-navmenu-trigger aria-expanded="false">Products</button>
 *
 *       <!-- Content panel — can hold any HTML; grid layouts work great -->
 *       <div data-navmenu-content>
 *         <ul>
 *           <li><a href="/products/alpha" data-navmenu-list-item>
 *             <span data-navmenu-list-item-icon>★</span>
 *             <div>
 *               <div data-navmenu-list-item-title>Alpha</div>
 *               <p data-navmenu-list-item-desc>Alpha product description.</p>
 *             </div>
 *           </a></li>
 *         </ul>
 *       </div>
 *
 *     </div>
 *   </nav>
 *
 *   <!-- Optional: viewport element for animated panel transitions -->
 *   <div data-navmenu-viewport></div>
 *
 * Options
 *
 *   orientation       "horizontal"|"vertical"    layout axis                   "horizontal"
 *   openOn            "hover"|"click"            what opens panels             "hover"
 *   delay             200                        hover open delay (ms)         200
 *   closeDelay        150                        hover close delay (ms)        150
 *   animationIn       "ts-navmenu-in"            CSS class added on open       "ts-navmenu-in"
 *   animationOut      "ts-navmenu-out"           CSS class added on close      "ts-navmenu-out"
 *   animationDuration 200                        fallback timeout (ms)         200
 *   useViewport       false                      portal panels into the        false
 *                                                [data-navmenu-viewport] el
 *   closeOnEscape     true                       Esc key closes open panel     true
 *   closeOnOutside    true                       click outside closes          true
 *   onOpen            null                       callback(item, instance)      null
 *   onClose           null                       callback(item, instance)      null
 *
 * Public API 
 *
 *   const nav = $('[data-plugin-navmenu]').data('__pluginNavmenu');
 *   nav.open(index);          // open item by index (0-based)
 *   nav.close();              // close the active item
 *   nav.toggle(index);        // toggle item by index
 *   nav.getActive();          // returns index of open item, or -1
 *
 * Events
 *
 *   navmenu-opened   fired on [data-plugin-navmenu] after a panel opens
 *   navmenu-closed   fired on [data-plugin-navmenu] after a panel closes
 *
 *   Both events carry { detail: { index, $item, instance } }
 *
 * Init.js wiring 
 *
 *   if ($.isFunction($.fn['themestrapPluginNavmenu']) && $('[data-plugin-navmenu]').length) {
 *       $(() => {
 *           $('[data-plugin-navmenu]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginNavmenu(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginNavmenu';

    /* tiny uid helper */
    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    /* lazy CSS injection */
    const STYLE_ID = 'ts-navmenu-styles';
    const CSS_TEXT = `
/* Themestrap Navigation Menu */
[data-plugin-navmenu] {
    position: relative;
    display: flex;
    align-items: center;
    gap: .25rem;
}

[data-plugin-navmenu][data-navmenu-orientation="vertical"] {
    flex-direction: column;
    align-items: stretch;
}

[data-navmenu-item] {
    position: relative;
}

[data-navmenu-trigger] {
    display: inline-flex;
    align-items: center;
    gap: .375rem;
    padding: .5rem .75rem;
    border: none;
    background: transparent;
    border-radius: .375rem;
    font-size: .875rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    color: inherit;
    transition: background-color .15s ease, color .15s ease;
    user-select: none;
    white-space: nowrap;
}

[data-navmenu-trigger]:hover,
[data-navmenu-trigger][aria-expanded="true"] {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
}

[data-navmenu-trigger]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

/* Chevron indicator */
[data-navmenu-trigger]::after {
    content: '';
    display: inline-block;
    width: .75rem;
    height: .75rem;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    flex-shrink: 0;
    transition: transform .2s ease;
}

[data-navmenu-trigger][aria-expanded="true"]::after {
    transform: rotate(-180deg);
}

/* Plain nav links */
[data-navmenu-link] {
    display: inline-flex;
    align-items: center;
    padding: .5rem .75rem;
    border-radius: .375rem;
    font-size: .875rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    transition: background-color .15s ease, color .15s ease;
    white-space: nowrap;
}

[data-navmenu-link]:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
    text-decoration: none;
}

[data-navmenu-link]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

/* Content panels */
[data-navmenu-content] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    background: var(--ts-nav-content-bg, #fff);
    border: 1px solid var(--ts-nav-content-border, rgba(0,0,0,.08));
    border-radius: .5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
    padding: .5rem;
    z-index: 1050;
    display: none;
    transform-origin: top center;
}

[data-navmenu-content].ts-navmenu-active {
    display: block;
}

/* right-aligned panel when item is near end of nav */
[data-navmenu-item].ts-navmenu-align-right [data-navmenu-content] {
    left: auto;
    right: 0;
}

/* Vertical orientation: panels appear to the right */
[data-plugin-navmenu][data-navmenu-orientation="vertical"] [data-navmenu-content] {
    top: 0;
    left: calc(100% + .5rem);
}

/* Viewport */
[data-navmenu-viewport] {
    position: absolute;
    top: calc(100% + .5rem);
    left: 0;
    min-width: 220px;
    overflow: hidden;
    background: var(--ts-nav-content-bg, #fff);
    border: 1px solid var(--ts-nav-content-border, rgba(0,0,0,.08));
    border-radius: .5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
    z-index: 1050;
    display: none;
    transition: width .2s ease, height .2s ease, left .2s ease;
}

[data-navmenu-viewport].ts-navmenu-viewport-active {
    display: block;
}

/* Animations */
@keyframes ts-navmenu-in-kf {
    from { opacity: 0; transform: translateY(-6px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
}

@keyframes ts-navmenu-out-kf {
    from { opacity: 1; transform: translateY(0)    scale(1);   }
    to   { opacity: 0; transform: translateY(-6px) scale(.97); }
}

.ts-navmenu-in  { animation: ts-navmenu-in-kf  .18s cubic-bezier(.16,1,.3,1) both; }
.ts-navmenu-out { animation: ts-navmenu-out-kf .14s ease-in               both; }

/* Vertical axis animations */
[data-plugin-navmenu][data-navmenu-orientation="vertical"] .ts-navmenu-in {
    animation-name: ts-navmenu-in-v-kf;
}
[data-plugin-navmenu][data-navmenu-orientation="vertical"] .ts-navmenu-out {
    animation-name: ts-navmenu-out-v-kf;
}

@keyframes ts-navmenu-in-v-kf {
    from { opacity: 0; transform: translateX(-6px) scale(.97); }
    to   { opacity: 1; transform: translateX(0)    scale(1);   }
}

@keyframes ts-navmenu-out-v-kf {
    from { opacity: 1; transform: translateX(0)    scale(1);   }
    to   { opacity: 0; transform: translateX(-6px) scale(.97); }
}

/* List items inside panels */
[data-navmenu-list-item] {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: .625rem .75rem;
    border-radius: .375rem;
    text-decoration: none;
    color: inherit;
    transition: background-color .15s ease;
}

[data-navmenu-list-item]:hover {
    background-color: color-mix(in srgb, currentColor 6%, transparent);
    text-decoration: none;
}

[data-navmenu-list-item]:focus-visible {
    outline: 2px solid var(--ts-nav-focus-ring, currentColor);
    outline-offset: 2px;
}

[data-navmenu-list-item-icon] {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: .375rem;
    background-color: var(--ts-nav-icon-bg, color-mix(in srgb, currentColor 8%, transparent));
    flex-shrink: 0;
    font-size: 1.1rem;
    line-height: 1;
}

[data-navmenu-list-item-title] {
    font-size: .875rem;
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: .125rem;
}

[data-navmenu-list-item-desc] {
    font-size: .8125rem;
    line-height: 1.4;
    color: var(--ts-nav-muted, rgba(0,0,0,.55));
    margin: 0;
}

/* Dark-mode overrides */
html.dark [data-navmenu-content],
html.dark [data-navmenu-viewport] {
    background: var(--ts-nav-content-bg, #1c1c1e);
    border-color: var(--ts-nav-content-border, rgba(255,255,255,.1));
    box-shadow: 0 4px 24px rgba(0,0,0,.4);
}

html.dark [data-navmenu-list-item-desc] {
    color: var(--ts-nav-muted, rgba(255,255,255,.55));
}
`;

    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        document.head.appendChild(style);
    }

    class PluginNavmenu {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) { return this; }

            this.$el         = $el;
            this.$items      = [];
            this.activeIndex = -1;
            this._openTimer  = null;
            this._closeTimer = null;

            this.setData()
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
            this.options = $.extend(true, {}, PluginNavmenu.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectCSS();

            const self = this;
            const o    = self.options;

            /* Mark orientation */
            self.$el.attr('data-navmenu-orientation', o.orientation);

            /* Collect items */
            self.$items = self.$el.children('[data-navmenu-item]').toArray().map((el, idx) => {
                const $item    = $(el);
                const $trigger = $item.find('[data-navmenu-trigger]').first();
                const $content = $item.find('[data-navmenu-content]').first();

                /* Skip plain-link items */
                if (!$trigger.length || !$content.length) return null;

                /* Unique IDs for ARIA */
                const triggerId = $trigger.attr('id') || uid('ts-navmenu-trigger');
                const contentId = $content.attr('id') || uid('ts-navmenu-content');

                $trigger.attr({
                    id: triggerId,
                    'aria-controls': contentId,
                    'aria-expanded': 'false',
                    'aria-haspopup': 'true',
                });

                $content.attr({
                    id: contentId,
                    role: 'region',
                    'aria-labelledby': triggerId,
                });

                return { $item, $trigger, $content, index: idx };
            }).filter(Boolean);

            /* Viewport portal: move all content panels into it */
            self.$viewport = self.$el.siblings('[data-navmenu-viewport]').first();
            if (o.useViewport && self.$viewport.length) {
                self.$items.forEach(item => {
                    item.$originalParent = item.$content.parent();
                    item.$content.appendTo(self.$viewport);
                });
            }

            /* Check edge alignment */
            self._updateAlignment();

            return this;
        }

        events() {
            const self = this;
            const o    = self.options;

            self.$items.forEach((item, idx) => {
                if (o.openOn === 'hover') {
                    /* Hover on item triggers open/close */
                    item.$item
                        .on('mouseenter.navmenu', () => {
                            clearTimeout(self._closeTimer);
                            self._openTimer = setTimeout(() => self.open(idx), o.delay);
                        })
                        .on('mouseleave.navmenu', () => {
                            clearTimeout(self._openTimer);
                            self._closeTimer = setTimeout(() => {
                                if (self.activeIndex === idx) self.close();
                            }, o.closeDelay);
                        });

                    /* Keep open when hovering inside content */
                    item.$content
                        .on('mouseenter.navmenu', () => clearTimeout(self._closeTimer))
                        .on('mouseleave.navmenu', () => {
                            self._closeTimer = setTimeout(() => {
                                if (self.activeIndex === idx) self.close();
                            }, o.closeDelay);
                        });
                }

                /* Trigger click — always toggle */
                item.$trigger.on('click.navmenu', (e) => {
                    e.stopPropagation();
                    self.toggle(idx);
                });

                /* Keyboard: Enter/Space on trigger */
                item.$trigger.on('keydown.navmenu', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.toggle(idx);
                    }
                    if (e.key === 'Escape') {
                        self.close();
                        item.$trigger.trigger('focus');
                    }
                    /* Arrow navigation between triggers */
                    if (o.orientation === 'horizontal') {
                        if (e.key === 'ArrowRight') { e.preventDefault(); self._focusAdjacentTrigger(idx, 1); }
                        if (e.key === 'ArrowLeft')  { e.preventDefault(); self._focusAdjacentTrigger(idx, -1); }
                        if (e.key === 'ArrowDown' && self.activeIndex === idx) {
                            e.preventDefault();
                            self._focusFirstInContent(idx);
                        }
                    }
                    if (o.orientation === 'vertical') {
                        if (e.key === 'ArrowDown')  { e.preventDefault(); self._focusAdjacentTrigger(idx, 1); }
                        if (e.key === 'ArrowUp')    { e.preventDefault(); self._focusAdjacentTrigger(idx, -1); }
                        if (e.key === 'ArrowRight' && self.activeIndex === idx) {
                            e.preventDefault();
                            self._focusFirstInContent(idx);
                        }
                    }
                });
            });

            /* Close on Escape (document level) */
            if (o.closeOnEscape) {
                $(document).on('keydown.navmenu-' + self.$el.attr('id'), (e) => {
                    if (e.key === 'Escape' && self.activeIndex > -1) {
                        const active = self.$items[self.activeIndex];
                        self.close();
                        if (active) active.$trigger.trigger('focus');
                    }
                });
            }

            /* Close on outside click */
            if (o.closeOnOutside) {
                $(document).on('click.navmenu-' + self.$el.attr('id'), (e) => {
                    if (self.activeIndex === -1) return;
                    const $t = $(e.target);
                    /* Clicked inside nav root or active viewport panel? Stay open. */
                    if ($t.closest(self.$el).length) return;
                    if (self.$viewport && self.$viewport.length && $t.closest(self.$viewport).length) return;
                    self.close();
                });
            }

            /* Recalc edge alignment on resize */
            $(window).on('resize.navmenu-' + (self.$el.attr('id') || uid('nav')), () => {
                clearTimeout(self._resizeTimer);
                self._resizeTimer = setTimeout(() => self._updateAlignment(), 100);
            });

            return this;
        }

        open(index) {
            const self  = this;
            const o     = self.options;
            const item  = self.$items[index];
            if (!item) return this;

            /* Close existing */
            if (self.activeIndex > -1 && self.activeIndex !== index) {
                self._closePanel(self.$items[self.activeIndex], false);
            }

            self.activeIndex = index;
            item.$trigger.attr('aria-expanded', 'true');

            /* Viewport mode: position viewport under trigger */
            if (o.useViewport && self.$viewport && self.$viewport.length) {
                self._positionViewport(item);
                self.$viewport.addClass('ts-navmenu-viewport-active');
                /* Hide all content panels inside viewport, show the right one */
                self.$viewport.find('[data-navmenu-content]').not(item.$content).hide();
                item.$content.show();
            }

            /* Animate in */
            item.$content
                .removeClass(o.animationOut)
                .addClass('ts-navmenu-active ' + o.animationIn);

            /* Callback & event */
            if (typeof o.onOpen === 'function') o.onOpen(item, self);
            self.$el[0].dispatchEvent(new CustomEvent('navmenu-opened', {
                bubbles: true,
                detail: { index, $item: item.$item, instance: self }
            }));

            return this;
        }

        close() {
            const self = this;
            if (self.activeIndex === -1) return this;

            const item = self.$items[self.activeIndex];
            self.activeIndex = -1;

            if (item) self._closePanel(item, true);
            return this;
        }

        toggle(index) {
            return this.activeIndex === index ? this.close() : this.open(index);
        }

        getActive() {
            return this.activeIndex;
        }

        destroy() {
            const self = this;
            const o    = self.options;

            clearTimeout(self._openTimer);
            clearTimeout(self._closeTimer);
            clearTimeout(self._resizeTimer);

            /* Restore portaled content */
            if (o.useViewport && self.$viewport && self.$viewport.length) {
                self.$items.forEach(item => {
                    if (item.$originalParent) item.$content.appendTo(item.$originalParent);
                });
                self.$viewport
                    .removeClass('ts-navmenu-viewport-active')
                    .hide()
                    .removeAttr('style');
            }

            /* Restore ARIA & classes */
            self.$items.forEach(item => {
                item.$trigger.removeAttr('aria-expanded aria-controls aria-haspopup');
                item.$content.removeClass('ts-navmenu-active ' + o.animationIn + ' ' + o.animationOut);
                item.$item.off('.navmenu');
                item.$trigger.off('.navmenu');
                item.$content.off('.navmenu');
            });

            self.$el
                .removeAttr('data-navmenu-orientation')
                .off('.navmenu');

            const navId = self.$el.attr('id');
            if (navId) {
                $(document).off('keydown.navmenu-' + navId);
                $(document).off('click.navmenu-' + navId);
                $(window).off('resize.navmenu-' + navId);
            }

            self.$el.removeData(instanceName);
            return this;
        }

        _closePanel($itemOrRecord, animate) {
            const self = this;
            const o    = self.options;
            const item = $itemOrRecord.$trigger ? $itemOrRecord : null; // already a record
            if (!item) return;

            item.$trigger.attr('aria-expanded', 'false');

            const done = () => {
                item.$content
                    .removeClass('ts-navmenu-active ' + o.animationIn + ' ' + o.animationOut);

                if (o.useViewport && self.$viewport && self.$viewport.length) {
                    self.$viewport.removeClass('ts-navmenu-viewport-active').hide();
                }

                if (typeof o.onClose === 'function') o.onClose(item, self);
                self.$el[0].dispatchEvent(new CustomEvent('navmenu-closed', {
                    bubbles: true,
                    detail: { index: item.index, $item: item.$item, instance: self }
                }));
            };

            if (animate && o.animationOut) {
                item.$content.removeClass(o.animationIn).addClass(o.animationOut);
                const timeout = setTimeout(done, o.animationDuration);
                item.$content.one('animationend.navmenu', () => {
                    clearTimeout(timeout);
                    done();
                });
            } else {
                done();
            }
        }

        _positionViewport(item) {
            const self     = this;
            const navRect  = self.$el[0].getBoundingClientRect();
            const trigRect = item.$trigger[0].getBoundingClientRect();
            const left     = trigRect.left - navRect.left;

            self.$viewport.css({
                left: left + 'px',
                width: item.$content.outerWidth(true) + 'px'
            });
        }

        _updateAlignment() {
            const self   = this;
            const navW   = self.$el[0].getBoundingClientRect().right;
            const winW   = window.innerWidth;

            self.$items.forEach(item => {
                const itemRight = item.$item[0].getBoundingClientRect().right;
                /* If content panel would overflow right edge, right-align it */
                const panelW    = item.$content.outerWidth(true) || 240;
                if (itemRight + panelW > winW) {
                    item.$item.addClass('ts-navmenu-align-right');
                } else {
                    item.$item.removeClass('ts-navmenu-align-right');
                }
            });
        }

        _focusAdjacentTrigger(currentIdx, delta) {
            const self    = this;
            const targets = self.$items;
            const next    = targets[currentIdx + delta];
            if (next) next.$trigger.trigger('focus');
        }

        _focusFirstInContent(index) {
            const self = this;
            const item = self.$items[index];
            if (!item) return;
            const $first = item.$content.find('a, button, [tabindex]').filter(':visible').first();
            if ($first.length) $first.trigger('focus');
        }
    }

    PluginNavmenu.defaults = {
        orientation:       'horizontal',
        openOn:            'hover',
        delay:             200,
        closeDelay:        150,
        animationIn:       'ts-navmenu-in',
        animationOut:      'ts-navmenu-out',
        animationDuration: 200,
        useViewport:       false,
        closeOnEscape:     true,
        closeOnOutside:    true,
        onOpen:            null,
        onClose:           null,
    };

    $.extend(themestrap, { PluginNavmenu });

    $.fn.themestrapPluginNavmenu = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginNavmenu($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
