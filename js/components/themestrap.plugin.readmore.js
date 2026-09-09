// Read More
(((themestrap = {}, $) => {
    const instanceName = '__readmore';
    const STYLE_ID     = 'ts-readmore-styles';
    let   instanceCount = 0;

    /* Inject shared styles once per page */
    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
.ts-readmore {
    position: relative;
    overflow: hidden;
    transition: height var(--ts-rm-dur, 400ms) var(--ts-rm-ease, ease);
}
.ts-readmore.is-expanded {
    overflow: visible;
}
.ts-readmore-overlay {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    height: var(--ts-rm-overlay-h, 100px);
    pointer-events: none;
    background: var(--ts-rm-gradient);
    transition: opacity var(--ts-rm-dur, 400ms) ease;
}
.ts-readmore-overlay.is-hidden {
    opacity: 0;
}
/* System dark mode preference */
@media (prefers-color-scheme: dark) {
    .ts-readmore-overlay {
        background: var(--ts-rm-gradient-dark, var(--ts-rm-gradient));
    }
}
/* Class-based dark mode — Bootstrap 5.3 data-bs-theme and html.dark */
[data-bs-theme="dark"] .ts-readmore-overlay,
html.dark .ts-readmore-overlay {
    background: var(--ts-rm-gradient-dark, var(--ts-rm-gradient));
}
/* Explicit light override — wins over system dark preference */
[data-bs-theme="light"] .ts-readmore-overlay {
    background: var(--ts-rm-gradient);
}
.ts-readmore-btn-wrap {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    z-index: 2;
}
.ts-readmore-btn-wrap.align-center { text-align: center; }
.ts-readmore-btn-wrap.align-end    { text-align: right;  }
.ts-readmore-btn-wrap.align-start  { text-align: left;   }
        `.trim();
        document.head.appendChild(s);
    };

    const removeStyles = () => {
        if (instanceCount > 0) return;
        document.getElementById(STYLE_ID)?.remove();
    };

    /* Convert a 3- or 6-digit hex colour to its rgba(r,g,b,0) equivalent */
    const hexToTransparent = (hex) => {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        if (h.length !== 6) return 'transparent';
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},0)`;
    };

    class PluginReadMore {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el       = $el;
            this._expanded = false;
            instanceCount++;
            injectStyles();
            this.setData().setOptions(opts).build().events();
            if (this.options.startOpened) this.open();
            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const attrOpts = themestrap.fn.getOptions(this.$el);
            this.options = $.extend(true, {}, PluginReadMore.defaults, attrOpts, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self  = this;
            const o     = self.options;
            const $wrap = o.wrapper;
            const el    = $wrap[0];

            /* Animation */
            el.style.setProperty('--ts-rm-dur',       `${o.animDuration}ms`);
            el.style.setProperty('--ts-rm-ease',      o.animEasing);

            /* Overlay dimensions */
            el.style.setProperty('--ts-rm-overlay-h', `${o.overlayHeight}px`);

            /* Light gradient */
            const lightGradient = o.overlayGradient
                || self._buildGradient(o.overlayColor, o.overlayStartColor, o.overlayDirection);
            el.style.setProperty('--ts-rm-gradient', lightGradient);

            /* Dark gradient — only registered when a dark colour is configured */
            if (o.darkOverlayColor || o.darkOverlayGradient) {
                const darkGradient = o.darkOverlayGradient
                    || self._buildGradient(o.darkOverlayColor, o.darkOverlayStartColor, o.overlayDirection);
                el.style.setProperty('--ts-rm-gradient-dark', darkGradient);
            }

            $wrap.addClass('ts-readmore').css('height', o.maxHeight);

            /* Overlay — no inline styles; all driven by CSS custom properties on the wrapper */
            $('<div class="ts-readmore-overlay"></div>').appendTo($wrap);

            /* Button wrapper — must already exist in HTML as .readmore-button-wrapper */
            $wrap.find('.readmore-button-wrapper')
                .removeClass('d-none')
                .addClass(`ts-readmore-btn-wrap align-${o.align}`)
                .find('a').html(o.buttonOpenLabel);

            return this;
        }

        _buildGradient(color, startColor, direction) {
            const start = startColor || hexToTransparent(color);
            return `linear-gradient(${direction}, ${start} 0%, ${color} 100%)`;
        }

        events() {
            const self = this;
            self.options.wrapper.on('click.readmore', '.readmore-button-wrapper > a', (e) => {
                e.preventDefault();
                self._expanded ? self.close() : self.open();
            });
            return this;
        }

        open() {
            const self  = this;
            const o     = self.options;
            const $wrap = o.wrapper;

            self._expanded = true;

            /* Animate to full scroll height, then release overflow constraint */
            $wrap.css('height', $wrap[0].scrollHeight);
            $wrap[0].addEventListener('transitionend', function onEnd(e) {
                if (e.propertyName !== 'height') return;
                $wrap[0].removeEventListener('transitionend', onEnd);
                $wrap.addClass('is-expanded').css('height', '');
            });

            $wrap.find('.ts-readmore-overlay').addClass('is-hidden');

            if (o.enableToggle) {
                $wrap.find('.readmore-button-wrapper > a').html(o.buttonCloseLabel);
            } else {
                $wrap.find('.readmore-button-wrapper').hide();
            }

            $wrap[0].dispatchEvent(new CustomEvent('ts.readmore.open', { bubbles: true }));
            if (typeof o.onOpen === 'function') o.onOpen.call(self, $wrap);

            return self;
        }

        close() {
            const self  = this;
            const o     = self.options;
            const $wrap = o.wrapper;

            self._expanded = false;

            /* Remove is-expanded first (restores overflow:hidden via CSS class),
               snapshot current height, reflow, then animate to maxHeight */
            $wrap.removeClass('is-expanded').css('height', $wrap[0].offsetHeight);
            $wrap[0].offsetHeight; // force reflow before transitioning
            $wrap.css('height', o.maxHeight);

            $wrap.find('.ts-readmore-overlay').removeClass('is-hidden');
            $wrap.find('.readmore-button-wrapper').show().find('a').html(o.buttonOpenLabel);

            $wrap[0].dispatchEvent(new CustomEvent('ts.readmore.close', { bubbles: true }));
            if (typeof o.onClose === 'function') o.onClose.call(self, $wrap);

            return self;
        }

        toggle() {
            return this._expanded ? this.close() : this.open();
        }

        destroy() {
            const self  = this;
            const $wrap = self.options.wrapper;
            const el    = $wrap[0];

            $wrap.off('click.readmore');
            $wrap.removeData(instanceName);
            $wrap.removeClass('ts-readmore is-expanded');
            $wrap.css('height', '');

            el.style.removeProperty('--ts-rm-dur');
            el.style.removeProperty('--ts-rm-ease');
            el.style.removeProperty('--ts-rm-overlay-h');
            el.style.removeProperty('--ts-rm-gradient');
            el.style.removeProperty('--ts-rm-gradient-dark');

            $wrap.find('.ts-readmore-overlay').remove();
            $wrap.find('.readmore-button-wrapper')
                .addClass('d-none')
                .removeClass('ts-readmore-btn-wrap align-start align-center align-end')
                .show().find('a').html('');

            instanceCount--;
            removeStyles();

            return self;
        }
    }

    PluginReadMore.defaults = {
        /* Button labels */
        buttonOpenLabel:   'Read More <i class="fas fa-chevron-down text-2 ms-1"></i>',
        buttonCloseLabel:  'Read Less <i class="fas fa-chevron-up text-2 ms-1"></i>',

        /* Behaviour */
        enableToggle:      true,
        startOpened:       false,
        maxHeight:         110,

        /* Light-mode overlay — three levels of control (evaluated top-to-bottom, first match wins):
         *   overlayGradient      raw CSS gradient string — overrides everything below
         *   overlayStartColor    explicit transparent start colour (auto-derived from overlayColor if null)
         *   overlayColor         opaque end colour; transparent start is derived from this */
        overlayColor:      '#ffffff',
        overlayStartColor: null,
        overlayGradient:   null,
        overlayDirection:  '180deg',
        overlayHeight:     100,

        /* Dark-mode overlay — same three-level hierarchy as above.
         *   Falls back silently to the light gradient when none of these are set.
         *   overlayDirection is shared; use darkOverlayGradient for a different direction in dark mode. */
        darkOverlayColor:      null,
        darkOverlayStartColor: null,
        darkOverlayGradient:   null,

        /* Layout */
        align:        'start',

        /* Animation */
        animDuration: 400,
        animEasing:   'ease',

        /* Callbacks — both receive the wrapper $el as first argument */
        onOpen:  null,
        onClose: null,
    };

    $.extend(themestrap, { PluginReadMore });

    $.fn.themestrapPluginReadMore = function(opts) {
        return this.map(function() {
            const $this    = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && typeof instance[opts] === 'function') instance[opts]();
                return $this;
            }

            if (instance) return instance;
            return new PluginReadMore($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
