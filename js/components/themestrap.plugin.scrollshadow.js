// Scroll Shadow
(((themestrap = {}, $) => {

    const instanceName = '__pluginScrollShadow';

    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-scroll-shadow-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
/* Themestrap — PluginScrollShadow */
.ts-scroll-shadow {
    --ts-ss-size:    40px;
    --ts-ss-color:   black;   /* mask fades toward transparent  */
    position: relative;
    overflow: auto;
    /* Mask compositing shorthand — overridden by state classes  */
    -webkit-mask-image: none;
    mask-image:         none;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
}

/* top edge only visible - fade bottom */
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

/* bottom edge only visible - fade top */
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

/* both top and bottom overflow - fade both ends */
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

/* Vertical faces only — reuse vertical rules above for :not([data-orientation]) */
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

/* When BOTH axes are in play — compose with a two-gradient mask */
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

    // Inject the stylesheet only when the plugin is actually used (called
    // from build()), so loading the script never adds CSS to unused pages.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
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
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
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
         *   .ts-ss--top     — content above the visible area
         *   .ts-ss--bottom  — content below the visible area
         *   .ts-ss--left    — content to the left
         *   .ts-ss--right   — content to the right
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
         * Force a shadow recalculation — useful when the container's content
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
         * 'vertical'   — top / bottom shadows (default)
         * 'horizontal' — left / right shadows
         * 'both'       — all four edges
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
         * correct value for mask-image use — do NOT pass rgba() here
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
