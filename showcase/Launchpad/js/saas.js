/* ============================================================
   Themestrap SaaS Starter — saas.js
   Shared wiring: nav toggling, active link, dark-mode init,
   scroll-to-top, pricing toggle.
   ============================================================ */

$(function () {

    /* Dark Mode */
    if ($.isFunction($.fn.themestrapPluginDarkMode)) {
        $('[data-plugin-darkmode]').each(function () {
            $(this).themestrapPluginDarkMode();
        });
    }

    /* Mobile Nav Toggle */
    $('.saas-nav__toggle').on('click', function () {
        const $nav = $(this).closest('.saas-nav');
        $nav.toggleClass('open');
        const expanded = $nav.hasClass('open');
        $(this).attr('aria-expanded', expanded);
        // close on outside click
        if (expanded) {
            $(document).one('click.navclose', function (e) {
                if (!$(e.target).closest('.saas-nav').length) {
                    $nav.removeClass('open');
                }
            });
        }
    });

    /* Active nav link */
    (function () {
        const current = location.pathname.split('/').pop() || 'index.html';
        $('.saas-nav__links a').each(function () {
            const href = $(this).attr('href') || '';
            const page = href.split('/').pop();
            if (page === current || (current === 'index.html' && page === '')) {
                $(this).addClass('active');
            }
        });
    })();

    /* Pricing Toggle (annual / monthly) */
    const $toggle = $('#pricing-toggle');
    if ($toggle.length) {
        $toggle.on('change', function () {
            const isAnnual = this.checked;
            $('[data-price-monthly]').each(function () {
                const monthly = $(this).data('price-monthly');
                const annual  = $(this).data('price-annual');
                $(this).text(isAnnual ? annual : monthly);
            });
            $('[data-period]').each(function () {
                $(this).text(isAnnual ? '/ month, billed annually' : '/ month');
            });
            $('#pricing-label-monthly').toggleClass('fw-bold', !isAnnual);
            $('#pricing-label-annual').toggleClass('fw-bold', isAnnual);
        });
    }

    /* Scroll to Top */
    const $scrollBtn = $('<button>', {
        id: 'scroll-top',
        'aria-label': 'Back to top',
        html: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 4l4.5 4.5-1 1L8 6 4.5 9.5l-1-1z"/></svg>'
    }).css({
        position: 'fixed', bottom: '24px', right: '24px',
        width: '40px', height: '40px',
        background: 'var(--ts-orange)', color: '#fff',
        border: 'none', borderRadius: '50%',
        cursor: 'pointer', zIndex: 999,
        display: 'none', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(232,103,42,.4)',
        transition: 'opacity .2s, transform .2s'
    }).appendTo('body');

    $(window).on('scroll.saas', function () {
        if (window.scrollY > 400) {
            $scrollBtn.css('display', 'flex');
        } else {
            $scrollBtn.css('display', 'none');
        }
    });

    $scrollBtn.on('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* Counter animation (stat blocks) */
	if ($.isFunction($.fn['themestrapPluginCounter']) && ( $('[data-plugin-counter]').length || $('.counters [data-to]').length )) {
		themestrap.fn.dynIntObsInit( '[data-plugin-counter]:not(.manual), .counters [data-to]', 'themestrapPluginCounter', themestrap.PluginCounter.defaults );
	}

    /* ScrollFx entrance animations */
    if ($.isFunction($.fn.themestrapPluginScrollFx)) {
        themestrap.fn.intObsInit('[data-plugin-scrollfx]:not(.manual)', 'themestrapPluginScrollFx');
    }

    /* Toast notifications */
    if ($.isFunction($.fn.themestrapPluginToast)) {
        $('[data-plugin-toast]').each(function () {
            $(this).themestrapPluginToast();
        });
    }

    /* Newsletter form (demo handler) */
    $('.saas-newsletter-form').on('submit', function (e) {
        e.preventDefault();
        const $btn = $(this).find('[type=submit]');
        const origText = $btn.text();
        $btn.text('Subscribed! ✓').prop('disabled', true);
        setTimeout(function () { $btn.text(origText).prop('disabled', false); }, 3000);
    });

    /* Form CTA demo handler */
    $('.saas-cta-form').on('submit', function (e) {
        e.preventDefault();
        const $btn = $(this).find('[type=submit]');
        $btn.text('Starting trial…').prop('disabled', true);
        setTimeout(function () {
            $btn.closest('.saas-cta-form').html(
                '<p style="color:#fff;font-size:1.1rem;font-weight:600">🎉 You\'re on the list! We\'ll be in touch shortly.</p>'
            );
        }, 1200);
    });

});
