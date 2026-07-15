/**
 * themestrap.modules.js
 *
 * LOAD ORDER: 
 *     themestrap.js -> themestrap.loader.js -> themestrap.modules.js (this file)
 *
 * ATTN:
 *     Plugins listed here must NOT be included in the themestrap.init.js file;
 *     the loader fetches and activates them on demand.
 */
(function ($) {

    const loader = themestrap.loader({
        basePath: '/assets/components/themestrap/js/',
        mode: document.documentElement.dataset.env === 'prod' ? 'prod' : 'dev'
    });

    // Vendor modules (third-party libs)
    loader
        .define('jquery-event-move', { src: 'vendor/twentytwenty/js/jquery.event.move.js' })
        .define('twentytwenty',      { src: 'vendor/twentytwenty/js/jquery.twentytwenty.js',
                                       css: 'vendor/twentytwenty/css/twentytwenty.css',
                                       deps: ['jquery-event-move'] })
 
        .define('owl',           { src: 'vendor/owl.carousel/js/owl.carousel.min.js',
                                   css: 'vendor/owl.carousel/css/owl.carousel.min.css' })
        .define('touchswipe',    { src: 'vendor/touchswipe/js/jquery.touchSwipe.min.js' })
        .define('magnific-popup',{ src: 'vendor/magnific-popup/js/jquery.magnific-popup.min.js',
                                   css: 'vendor/magnific-popup/css/magnific-popup.css' })
        .define('isotope',       { src: 'vendor/isotope/js/isotope.pkgd.min.js' })
        .define('waitforimages', { src: 'vendor/waitforimages/js/jquery.waitforimages.js' })
        .define('easypiechart',  { src: 'vendor/easypiechart/js/jquery.easypiechart.min.js' })
        .define('jquery-countdown', { src: 'vendor/countdown/js/jquery.countdown.min.js' }) // The Final Countdown
        .define('countto',       { src: 'vendor/countto/js/jquery.countTo.js' })
        .define('jquery-visible',{ src: 'vendor/visible/js/jquery.visible.min.js' })
        .define('jquery-cookie', { src: 'vendor/cookie/js/jquery.cookie.js' })
        .define('hover3d',       { src: 'vendor/hover3d/js/jquery.hover3d.min.js' })
        .define('matchheight',   { src: 'vendor/matchheight/jquery.matchHeight-min.js' })
        .define('jquery-easing', { src: 'vendor/jquery-easing/jquery.easing.min.js' })
        .define('vivus',         { src: 'vendor/vivus/js/vivus.min.js' })           // global: Vivus
        .define('observe-element-in-viewport',
                                 { src: 'vendor/observe-element-in-viewport/dist/index.umd.js' }) // global: observeElementInViewport
        .define('nanoscroller',  { src: 'vendor/nanoscroller/js/jquery.nanoscroller.min.js',
                                   css: 'vendor/nanoscroller/css/nanoscroller.css' })
        .define('jquery-pin',    { src: 'vendor/jquery-pin/jquery.pin.js' })
        .define('vide',          { src: 'vendor/vide/js/jquery.vide.min.js' })
        .define('jquery-validation', { src: 'vendor/jquery-validation/js/jquery.validate.min.js' })

        .define('rs-plugin-tools', { src: 'vendor/rs-plugin/js/jquery.themepunch.tools.min.js' })
        .define('rs-plugin',     { src: 'vendor/rs-plugin/js/jquery.themepunch.revolution.min.js',
                                   css: 'vendor/rs-plugin/css/settings.css',  // also: layers.css, navigation.css
                                   deps: ['rs-plugin-tools'] });

    // Themestrap plugins (plus viewport init) with a vendor dep
    loader
        .definePlugin('carousel', {
            src: 'components/themestrap.plugin.carousel.js', deps: ['owl'],
            selector: '[data-plugin-carousel]', method: 'themestrapPluginCarousel', strategy: 'intObs'
        })
        .definePlugin('carouselLight', {                       // touchSwipe is optional (swipeEvents)
            src: 'components/themestrap.plugin.carousellight.js', deps: ['touchswipe'],
            selector: '[data-plugin-carousel-light]', method: 'themestrapPluginCarouselLight', strategy: 'intObs'
        })
        .definePlugin('beforeAfter', {
            src: 'components/themestrap.plugin.beforeafter.js', deps: ['twentytwenty', 'waitforimages'],
            selector: '[data-plugin-before-after]', method: 'themestrapPluginBeforeAfter', strategy: 'intObs'
        })
        .definePlugin('lightbox', {
            src: 'components/themestrap.plugin.lightbox.js', deps: ['magnific-popup'],
            selector: '[data-plugin-lightbox]', method: 'themestrapPluginLightbox',
            strategy: 'event', event: 'mouseover.trigger.lightbox'
        })
        .definePlugin('masonry', {
            src: 'components/themestrap.plugin.masonry.js', deps: ['isotope', 'waitforimages'],
            selector: '[data-plugin-masonry]', method: 'themestrapPluginMasonry', strategy: 'intObs'
        })
        .definePlugin('sort', {
            src: 'components/themestrap.plugin.sort.js', deps: ['isotope', 'waitforimages'],
            selector: '[data-plugin-sort]', method: 'themestrapPluginSort', strategy: 'intObs'  // selector: verify (uses .sort-source/.sort-destination + data-sort-id)
        })
        .definePlugin('chartCircular', {
            src: 'components/themestrap.plugin.chartcircular.js', deps: ['easypiechart'],
            selector: '[data-plugin-chart-circular]', method: 'themestrapPluginChartCircular',
            strategy: 'dynIntObs', defaultsClass: 'PluginChartCircular'   // has accY
        })
        .definePlugin('countdown', {                           // The Final Countdown — note: file's guard wrongly checks $.fn.countTo
            src: 'components/themestrap.plugin.countdown.js', deps: ['jquery-countdown'],
            selector: '[data-plugin-countdown]', method: 'themestrapPluginCountdown', strategy: 'intObs'
        })
        .definePlugin('counter', {
            src: 'components/themestrap.plugin.counter.js', deps: ['countto'],
            selector: '[data-plugin-counter]', method: 'themestrapPluginCounter',
            strategy: 'dynIntObs', defaultsClass: 'PluginCounter'        // has accY
        })
        .definePlugin('floatElement', {
            src: 'components/themestrap.plugin.floatelement.js', deps: ['jquery-visible'],
            selector: '[data-plugin-float-element]', method: 'themestrapPluginFloatElement', strategy: 'intObs'
        })
        .definePlugin('parallax', {                            // also uses $.browser.mobile (jquery.browser / Porto core)
            src: 'components/themestrap.plugin.parallax.js', deps: ['jquery-visible'],
            selector: '[data-plugin-parallax]', method: 'themestrapPluginParallax', strategy: 'intObs'
        })
        .definePlugin('icon', {
            src: 'components/themestrap.plugin.icon.js', deps: ['vivus', 'jquery-visible'],
            selector: '[data-icon]', method: 'themestrapPluginIcon',
            strategy: 'dynIntObs', defaultsClass: 'PluginIcon'           // has accY
        })
        .definePlugin('progressBar', {
            src: 'components/themestrap.plugin.progressbar.js', deps: ['jquery-easing'],
            selector: '[data-appear-progress-animation]', method: 'themestrapPluginProgressBar',
            strategy: 'dynIntObs', defaultsClass: 'PluginProgressBar'    // has accY
        })
        .definePlugin('hoverEffect', {                         // hover3d optional (only the '3d' effect; 'magnetic' is vanilla)
            src: 'components/themestrap.plugin.hovereffect.js', deps: ['hover3d'],
            selector: '[data-plugin-hover-effect]', method: 'themestrapPluginHoverEffect', strategy: 'intObs'
        })
        .definePlugin('matchHeight', {
            src: 'components/themestrap.plugin.matchheight.js', deps: ['matchheight'],
            selector: '[data-plugin-match-height]', method: 'themestrapPluginMatchHeight', strategy: 'intObs'
        })
        .definePlugin('sectionScroll', {
            src: 'components/themestrap.plugin.sectionscroll.js', deps: ['jquery-easing'],
            selector: '[data-plugin-section-scroll]', method: 'themestrapPluginSectionScroll', strategy: 'intObs'
        })
        .definePlugin('scrollable', {
            src: 'components/themestrap.plugin.scrollable.js', deps: ['nanoscroller'],
            selector: '[data-plugin-scrollable]', method: 'themestrapPluginScrollable', strategy: 'intObs' // selector: verify (operates on .scrollable)
        })
        .definePlugin('sticky', {
            src: 'components/themestrap.plugin.sticky.js', deps: ['jquery-pin'],
            selector: '[data-plugin-sticky]', method: 'themestrapPluginSticky', strategy: 'intObs'
        })
        .definePlugin('videoBackground', {
            src: 'components/themestrap.plugin.videobackground.js', deps: ['vide'],
            selector: '[data-plugin-video-background]', method: 'themestrapPluginVideoBackground', strategy: 'intObs'
        })
        .definePlugin('revolutionSlider', {
            src: 'components/themestrap.plugin.revolutionslider.js', deps: ['rs-plugin'],
            selector: '[data-plugin-revolution-slider]', method: 'themestrapPluginRevolutionSlider', strategy: 'intObs'
        })
        .definePlugin('gdpr', {
            src: 'components/themestrap.plugin.gdpr.js', deps: ['jquery-cookie'],
            selector: '[data-plugin-gdpr]', method: 'themestrapPluginGDPR', strategy: 'intObs'
        })
        .definePlugin('gdprWrapper', {
            src: 'components/themestrap.plugin.gdprwrapper.js', deps: ['jquery-cookie'],
            selector: '[data-plugin-gdpr-wrapper]', method: 'themestrapPluginGDPRWrapper', strategy: 'intObs'
        });

    // These expose an object with .initialize(). 
    // The loader just fetches their files and vendor, then inits.
    loader
        .define('validation', {
            src: 'components/themestrap.plugin.validation.js', deps: ['jquery-validation'],
            init: () => themestrap.PluginValidation && themestrap.PluginValidation.initialize()
        })
        .define('newsletter', {
            src: 'components/themestrap.plugin.newsletter.js', deps: ['jquery-validation'],
            init: () => themestrap.Newsletter && themestrap.Newsletter.initialize()
        })
        .define('search', {
            src: 'components/themestrap.plugin.search.js', deps: ['jquery-validation'],
            init: () => themestrap.Search && themestrap.Search.initialize()
        })
        .define('scrollToTop', {
            src: 'components/themestrap.plugin.scrolltotop.js', deps: ['jquery-easing'],
            init: () => themestrap.PluginScrollToTop && themestrap.PluginScrollToTop.initialize()
        })
        .define('nav', {
            src: 'components/themestrap.plugin.nav.js', deps: ['jquery-easing', 'jquery-visible'],
            init: () => themestrap.Nav && themestrap.Nav.initialize()
        });

    $(() => loader.scan());

})(jQuery);
