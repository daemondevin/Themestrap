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

    // Vendor modules (third-party libs still used by a plugin below)
    loader
        .define('jquery-visible',{ src: 'vendor/visible/js/jquery.visible.min.js' })       // icon, nav
        .define('jquery-cookie', { src: 'vendor/cookie/js/jquery.cookie.js' })             // gdprWrapper
        .define('matchheight',   { src: 'vendor/matchheight/jquery.matchHeight-min.js' })
        .define('jquery-easing', { src: 'vendor/jquery-easing/jquery.easing.min.js' })     // scrollToTop, nav, sectionScroll
        .define('vivus',         { src: 'vendor/vivus/js/vivus.min.js' })                  // global: Vivus
        .define('observe-element-in-viewport',
                                 { src: 'vendor/observe-element-in-viewport/dist/index.umd.js' }) // global: observeElementInViewport
        .define('jquery-pin',    { src: 'vendor/jquery-pin/jquery.pin.js' })
        .define('vide',          { src: 'vendor/vide/js/jquery.vide.min.js' })
        .define('jquery-validation', { src: 'vendor/jquery-validation/js/jquery.validate.min.js' })

        .define('rs-plugin-tools', { src: 'vendor/rs-plugin/js/jquery.themepunch.tools.min.js' })
        .define('rs-plugin',     { src: 'vendor/rs-plugin/js/jquery.themepunch.revolution.min.js',
                                   css: 'vendor/rs-plugin/css/settings.css',  // also: layers.css, navigation.css
                                   deps: ['rs-plugin-tools'] });

    // Themestrap plugins with a vendor dependency (plus viewport init)
    loader
        .definePlugin('icon', {
            src: 'components/themestrap.plugin.icon.js', deps: ['vivus', 'jquery-visible'],
            selector: '[data-icon]', method: 'themestrapPluginIcon',
            strategy: 'dynIntObs', defaultsClass: 'PluginIcon'           // has accY
        })
        .definePlugin('matchHeight', {
            src: 'components/themestrap.plugin.matchheight.js', deps: ['matchheight'],
            selector: '[data-plugin-match-height]', method: 'themestrapPluginMatchHeight', strategy: 'intObs'
        })
        .definePlugin('sectionScroll', {
            src: 'components/themestrap.plugin.sectionscroll.js', deps: ['jquery-easing'],
            selector: '[data-plugin-section-scroll]', method: 'themestrapPluginSectionScroll', strategy: 'intObs'
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
        .definePlugin('gdprWrapper', {
            src: 'components/themestrap.plugin.gdprwrapper.js', deps: ['jquery-cookie'],
            selector: '[data-plugin-gdpr-wrapper]', method: 'themestrapPluginGDPRWrapper', strategy: 'intObs'
        });

    // Themestrap plugins that used to need a vendor library and are now self-contained.
    // Kept here so pages that rely on the loader still fetch them on demand.
    loader
        .definePlugin('carousel', {
            src: 'components/themestrap.plugin.carousel.js',
            selector: '[data-plugin-carousel]', method: 'themestrapPluginCarousel', strategy: 'intObs'
        })
        .definePlugin('beforeAfter', {
            src: 'components/themestrap.plugin.beforeafter.js',
            selector: '[data-plugin-before-after]', method: 'themestrapPluginBeforeAfter', strategy: 'intObs'
        })
        .definePlugin('lightbox', {
            src: 'components/themestrap.plugin.lightbox.js',
            selector: '[data-plugin-lightbox]', method: 'themestrapPluginLightbox',
            strategy: 'event', event: 'mouseover.trigger.lightbox'
        })
        .definePlugin('masonry', {
            src: 'components/themestrap.plugin.masonry.js',
            selector: '[data-plugin-masonry]', method: 'themestrapPluginMasonry', strategy: 'intObs'
        })
        .definePlugin('sort', {
            src: 'components/themestrap.plugin.sort.js',
            selector: '[data-plugin-sort]', method: 'themestrapPluginSort', strategy: 'intObs'
        })
        .definePlugin('chartCircular', {
            src: 'components/themestrap.plugin.chartcircular.js',
            selector: '[data-plugin-chart-circular]', method: 'themestrapPluginChartCircular',
            strategy: 'dynIntObs', defaultsClass: 'PluginChartCircular'
        })
        .definePlugin('countdown', {
            src: 'components/themestrap.plugin.countdown.js',
            selector: '[data-plugin-countdown]', method: 'themestrapPluginCountdown', strategy: 'intObs'
        })
        .definePlugin('counter', {
            src: 'components/themestrap.plugin.counter.js',
            selector: '[data-plugin-counter]', method: 'themestrapPluginCounter',
            strategy: 'dynIntObs', defaultsClass: 'PluginCounter'
        })
        .definePlugin('floatElement', {
            src: 'components/themestrap.plugin.floatelement.js',
            selector: '[data-plugin-float-element]', method: 'themestrapPluginFloatElement', strategy: 'intObs'
        })
        .definePlugin('parallax', {
            src: 'components/themestrap.plugin.parallax.js',
            selector: '[data-plugin-parallax]', method: 'themestrapPluginParallax', strategy: 'intObs'
        })
        .definePlugin('progressBar', {
            src: 'components/themestrap.plugin.progressbar.js',
            selector: '[data-plugin-progress-bar]', method: 'themestrapPluginProgressBar',
            strategy: 'dynIntObs', defaultsClass: 'PluginProgressBar'    // has forceInit and accY
        })
        .definePlugin('hoverEffect', {
            src: 'components/themestrap.plugin.hovereffect.js',
            selector: '[data-plugin-hover-effect]', method: 'themestrapPluginHoverEffect', strategy: 'intObs'
        })
        .definePlugin('gdpr', {
            src: 'components/themestrap.plugin.gdpr.js',
            selector: '[data-plugin-gdpr]', method: 'themestrapPluginGDPR', strategy: 'intObs'
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
