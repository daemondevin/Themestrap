// Commom Plugins
(($ => {

	'use strict';

	// Scroll to Top Button.
	if (typeof themestrap.PluginScrollToTop !== 'undefined') {
		themestrap.PluginScrollToTop.initialize();
	}
	
	// Tooltips
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
	  	return new bootstrap.Tooltip(tooltipTriggerEl)
	});

	// Popovers
	var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
	var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
	  	return new bootstrap.Popover(popoverTriggerEl)
	});
	
	// Validations
	if ( $.isFunction($.validator) && typeof themestrap.PluginValidation !== 'undefined') {
		themestrap.PluginValidation.initialize();
	}

	// Animate
	if ($.isFunction($.fn['themestrapPluginAnimate']) && $('[data-appear-animation]').length) {
		themestrap.fn.dynIntObsInit( '[data-appear-animation], [data-appear-animation-svg]', 'themestrapPluginAnimate', themestrap.PluginAnimate.defaults );
	}

	// Animated Content
	if ($.isFunction($.fn['themestrapPluginAnimatedContent'])) {
		themestrap.fn.intObsInit( '[data-plugin-animated-letters]:not(.manual), .animated-letters', 'themestrapPluginAnimatedContent' );
		themestrap.fn.intObsInit( '[data-plugin-animated-words]:not(.manual), .animated-words', 'themestrapPluginAnimatedContent' );
	}

	// Before / After
	if ($.isFunction($.fn['themestrapPluginBeforeAfter']) && $('[data-plugin-before-after]').length) {
		themestrap.fn.intObsInit( '[data-plugin-before-after]:not(.manual)', 'themestrapPluginBeforeAfter' );
	}

	// Carousel Light
	if ($.isFunction($.fn['themestrapPluginCarouselLight']) && $('.owl-carousel-light').length) {
		themestrap.fn.intObsInit( '.owl-carousel-light', 'themestrapPluginCarouselLight' );
	}

	// Carousel
	if ($.isFunction($.fn['themestrapPluginCarousel']) && $('[data-plugin-carousel]:not(.manual), .owl-carousel:not(.manual)').length) {
		themestrap.fn.intObsInit( '[data-plugin-carousel]:not(.manual), .owl-carousel:not(.manual)', 'themestrapPluginCarousel' );
	}

	// Chart.Circular
	if ($.isFunction($.fn['themestrapPluginChartCircular']) && ( $('[data-plugin-chart-circular]').length || $('.circular-bar-chart').length )) {
		themestrap.fn.dynIntObsInit( '[data-plugin-chart-circular]:not(.manual), .circular-bar-chart:not(.manual)', 'themestrapPluginChartCircular', themestrap.PluginChartCircular.defaults );
	}

	// Countdown
	if ($.isFunction($.fn['themestrapPluginCountdown']) && ( $('[data-plugin-countdown]').length || $('.countdown').length )) {
		themestrap.fn.intObsInit( '[data-plugin-countdown]:not(.manual), .countdown', 'themestrapPluginCountdown' );
	}

	// Counter
	if ($.isFunction($.fn['themestrapPluginCounter']) && ( $('[data-plugin-counter]').length || $('.counters [data-to]').length )) {
		themestrap.fn.dynIntObsInit( '[data-plugin-counter]:not(.manual), .counters [data-to]', 'themestrapPluginCounter', themestrap.PluginCounter.defaults );
	}

	// Cursor Effect
	if ($.isFunction($.fn['themestrapPluginCursorEffect']) && $('[data-plugin-cursor-effect]').length ) {
		themestrap.fn.intObsInit( '[data-plugin-cursor-effect]:not(.manual)', 'themestrapPluginCursorEffect' );
	}

	// Float Element
	if ($.isFunction($.fn['themestrapPluginFloatElement']) && $('[data-plugin-float-element]').length) {
		themestrap.fn.intObsInit( '[data-plugin-float-element], [data-plugin-float-element-svg]', 'themestrapPluginFloatElement' );
	}

	// GDPR
	if ($.isFunction($.fn['themestrapPluginGDPR']) && $('[data-plugin-gdpr]').length) {

		$(() => {
			$('[data-plugin-gdpr]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginGDPR(opts);
            });
		});

	}

	// GDPR Wrapper
	if ($.isFunction($.fn['themestrapPluginGDPRWrapper']) && $('[data-plugin-gdpr-wrapper]').length) {

		$(() => {
			$('[data-plugin-gdpr-wrapper]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginGDPRWrapper(opts);
            });
		});

	}

	// Hover Effect
	if ($.isFunction($.fn['themestrapPluginHoverEffect']) && $('[data-plugin-hover-effect], .hover-effect-3d').length) {
		themestrap.fn.intObsInit( '[data-plugin-hover-effect]:not(.manual), .hover-effect-3d:not(.manual)', 'themestrapPluginHoverEffect' );
	}

	// Animated Icon
	if ($.isFunction($.fn['themestrapPluginIcon']) && $('[data-icon]').length) {
		themestrap.fn.dynIntObsInit( '[data-icon]:not(.svg-inline--fa)', 'themestrapPluginIcon', themestrap.PluginIcon.defaults );
	}

	// In Viewport Style
	if ($.isFunction($.fn['themestrapPluginInViewportStyle']) && $('[data-inviewport-style]').length) {

		$(() => {
			$('[data-inviewport-style]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginInViewportStyle(opts);
            });
		});

	}

	// Lightbox
	if ($.isFunction($.fn['themestrapPluginLightbox']) && ( $('[data-plugin-lightbox]').length || $('.lightbox').length )) {
		themestrap.fn.execOnceThroughEvent( '[data-plugin-lightbox]:not(.manual), .lightbox:not(.manual)', 'mouseover.trigger.lightbox', function(){
            const $this = $(this);
            let opts;

            const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
            if (pluginOptions)
				opts = pluginOptions;

            $this.themestrapPluginLightbox(opts);
        });
	}

	// Masonry
	if ($.isFunction($.fn['themestrapPluginMasonry']) && $('[data-plugin-masonry]').length) {

		$(() => {
			$('[data-plugin-masonry]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginMasonry(opts);
            });
		});

	}

	if ($('[data-masonry]').length) {
		const $masonryItems = $('[data-masonry]');

		$(window).on('load', () => {
			setTimeout(() => {
				$masonryItems.each(function() {
					$(this).masonry('layout');
				});
			}, 1);
		});
	}

	// Match Height
	if ($.isFunction($.fn['themestrapPluginMatchHeight']) && $('[data-plugin-match-height]').length) {

		$(() => {
			$('[data-plugin-match-height]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginMatchHeight(opts);
            });
		});

	}

	// Parallax
	if ($.isFunction($.fn['themestrapPluginParallax']) && $('[data-plugin-parallax]').length) {
		themestrap.fn.intObsInit( '[data-plugin-parallax]:not(.manual)', 'themestrapPluginParallax' );
	}

	// Progress Bar
	if ($.isFunction($.fn['themestrapPluginProgressBar']) && ( $('[data-plugin-progress-bar]') || $('[data-appear-progress-animation]').length )) {
		themestrap.fn.dynIntObsInit( '[data-plugin-progress-bar]:not(.manual), [data-appear-progress-animation]', 'themestrapPluginProgressBar', themestrap.PluginProgressBar.defaults );
	}

	// Random Images
	if ($.isFunction($.fn['themestrapPluginRandomImages']) && $('[data-plugin-random-images]').length) {
		themestrap.fn.dynIntObsInit( '.plugin-random-images', 'themestrapPluginRandomImages', themestrap.PluginRandomImages.defaults );
	}

	// Read More
	if ($.isFunction($.fn['themestrapPluginReadMore']) && $('[data-plugin-readmore]').length) {
		themestrap.fn.intObsInit( '[data-plugin-readmore]:not(.manual)', 'themestrapPluginReadMore' );
	}

	// Revolution Slider
	if ($.isFunction($.fn['themestrapPluginRevolutionSlider']) && ( $('[data-plugin-revolution-slider]').length || $('.slider-container .slider').length )) {

		$(() => {
			$('[data-plugin-revolution-slider]:not(.manual), .slider-container .slider:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginRevolutionSlider(opts);
            });
		});

	}

	// Scroll Spy
	if ($.isFunction($.fn['themestrapPluginScrollSpy']) && $('[data-plugin-scroll-spy]').length) {

		$(() => {
			$('[data-plugin-scroll-spy]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginScrollSpy(opts);
            });
		});

	}

	// Section Scroll
	if ($.isFunction($.fn['themestrapPluginSectionScroll']) && $('[data-plugin-section-scroll]').length) {

		$(() => {
			$('[data-plugin-section-scroll]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginSectionScroll(opts);
            });
		});

	}

	// Sort
	if ($.isFunction($.fn['themestrapPluginSort']) && ( $('[data-plugin-sort]').length || $('.sort-source').length )) {
		themestrap.fn.intObsInit( '[data-plugin-sort]:not(.manual), .sort-source:not(.manual)', 'themestrapPluginSort' );
	}

	// Sticky
	if ($.isFunction($.fn['themestrapPluginSticky']) && $('[data-plugin-sticky]').length) {
		themestrap.fn.execOnceThroughWindowEvent( window, 'scroll.trigger.sticky', () => {
			$('[data-plugin-sticky]:not(.manual)').each(function() {
                const $this = $(this);
                let opts;

                const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
                if (pluginOptions)
					opts = pluginOptions;

                $this.themestrapPluginSticky(opts);
            });
		});
	}

	// Toggle
	if ($.isFunction($.fn['themestrapPluginToggle']) && $('[data-plugin-toggle]').length) {
		themestrap.fn.intObsInit( '[data-plugin-toggle]:not(.manual)', 'themestrapPluginToggle' );
	}

	// Video Background
	if ($.isFunction($.fn['themestrapPluginVideoBackground']) && $('[data-plugin-video-background]').length) {
		themestrap.fn.intObsInit( '[data-plugin-video-background]:not(.manual)', 'themestrapPluginVideoBackground' );
	}

	// Sticky Header
	if (typeof themestrap.StickyHeader !== 'undefined') {
		themestrap.StickyHeader.initialize();
	}

	// Nav Menu
	if (typeof themestrap.Nav !== 'undefined') {
		themestrap.Nav.initialize();
	}

	// Search
	if (typeof themestrap.Search !== 'undefined' && ( $('#searchForm').length || $('.header-nav-features-search-reveal').length )) {
		themestrap.Search.initialize();
	}

	// Newsletter
	if (typeof themestrap.Newsletter !== 'undefined' && $('#newsletterForm').length) {
		themestrap.fn.intObs( '#newsletterForm', 'themestrap.Newsletter.initialize();', {} );
	}

	// Account
	if (typeof themestrap.Account !== 'undefined' && ( $('#headerAccount').length || $('#headerSignUp').length || $('#headerSignIn').length || $('#headerRecover').length || $('#headerRecoverCancel').length )) {
		themestrap.Account.initialize();
	}
	
    // Alert
    if ($.isFunction($.fn['themestrapPluginAlert']) && $('[data-plugin-alert]').length) {
        themestrap.fn.intObsInit('[data-plugin-alert]:not(.manual)', 'themestrapPluginAlert');
    }
	
    // Rating
    if ($.isFunction($.fn['themestrapPluginRating']) && $('[data-plugin-rating]').length) {
        themestrap.fn.intObsInit('[data-plugin-rating]:not(.manual)', 'themestrapPluginRating');
    }
    
	// Syntax Highlight
	if ($.isFunction($.fn['themestrapPluginHighlight']) && $('[data-plugin-highlight]').length) {
		$(() => {
			$('[data-plugin-highlight]:not(.manual)').each(function() {
                const $this = $(this);
                $this.themestrapPluginHighlight();
            });
		});
	}
	
	// Code Window
	if ($.isFunction($.fn['themestrapPluginCodeWindow']) && $('[data-plugin-code-window]').length) {
      themestrap.fn.intObsInit('[data-plugin-code-window]:not(.manual)','themestrapPluginCodeWindow');
    }
    
    // Scroller
    if ($.isFunction($.fn['themestrapPluginScroller']) && $('[data-plugin-scroller]').length) {
        themestrap.fn.intObsInit('[data-plugin-scroller]:not(.manual)', 'themestrapPluginScroller');
    }
    
    // Scrollable
	if ($.isFunction($.fn['nanoScroller']) && $('[data-plugin-scrollable]').length) {

		$(() => {
			$('[data-plugin-scrollable]:not(.manual)').each(function() {
				const $this = $(this);
				const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
				$this.themestrapPluginScrollable(opts);
			});
		});

	}
	
	// Scroll Shadow
    if ($.isFunction($.fn['themestrapPluginScrollShadow']) && $('[data-plugin-scroll-shadow]').length) {
        themestrap.fn.intObsInit('[data-plugin-scroll-shadow]:not(.manual)', 'themestrapPluginScrollShadow');
    }
    
    // Dialog
    if ($.isFunction($.fn['themestrapPluginDialog']) && $('[data-plugin-dialog]').length) {
        $(() => {
            $('[data-plugin-dialog]:not(.manual)').each(function () {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginDialog(opts);
            });
        });
    }
    
    // Collapsible
    if ($.isFunction($.fn['themestrapPluginCollapsible']) && $('[data-plugin-collapsible]').length) {
        themestrap.fn.intObsInit('[data-plugin-collapsible]:not(.manual)', 'themestrapPluginCollapsible');
    }
    
    // Vertical Navigation
    if ($.isFunction($.fn['themestrapPluginVerticalNav']) && $('[data-plugin-vertical-nav]').length) {
        themestrap.fn.intObsInit('[data-plugin-vertical-nav]:not(.manual)', 'themestrapPluginVerticalNav');
    }
    
    // SideNav
    if ($.isFunction($.fn['themestrapPluginSideNav']) && $('[data-plugin-sidenav]').length) {
        $(() => {
            $('[data-plugin-sidenav]:not(.manual)').each(function() {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginSideNav(opts);
            });
        });
    }
    
    // Dark Mode
    if ($.isFunction($.fn['themestrapPluginDarkMode']) && $('[data-plugin-darkmode]').length) {
        themestrap.fn.intObsInit('[data-plugin-darkmode]:not(.manual)', 'themestrapPluginDarkMode');
    }
    
    if ($.isFunction($.fn['themestrapPluginAuth']) && $('[data-plugin-auth]').length) {
        $(() => {
            $('[data-plugin-auth]:not(.manual)').each(function () {
                const $this = $(this);
                const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginAuth(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginCommandMenu']) && $('[data-plugin-command-menu]').length) {
        $(() => {
            $('[data-plugin-command-menu]:not(.manual)').each(function () {
                const $this = $(this);
                const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginCommandMenu(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginPanelNav']) && $('[data-plugin-panelnav]').length) {
        $(() => {
            $('[data-plugin-panelnav]:not(.manual)').each(function() {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginPanelNav(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginNavbar']) && $('[data-plugin-navbar]').length) {
        $(() => {
            $('[data-plugin-navbar]:not(.manual)').each(function() {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginNavbar(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginAuth']) && $('[data-plugin-auth]').length) {
        $(() => {
            $('[data-plugin-auth]:not(.manual)').each(function () {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginAuth(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginPopover']) && $('[data-plugin-popover]').length) {
        $(() => {
            $('[data-plugin-popover]:not(.manual)').each(function () {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginPopover(opts);
            });
        });
    }
    
    if ($.isFunction($.fn['themestrapPluginNavmenu']) && $('[data-plugin-navmenu]').length) {
        $(() => {
            $('[data-plugin-navmenu]:not(.manual)').each(function () {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginNavmenu(opts);
            });
        });
    }
    
})).apply( this, [ jQuery ]);
