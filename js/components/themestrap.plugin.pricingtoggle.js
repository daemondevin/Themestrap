/**
 * Themestrap Pricing Toggle
 *
 * Drives a billing-period switcher (e.g. Monthly ↔ Annual) that:
 *   - Animates a pill/thumb inside a track between two positions.
 *   - Broadcasts a namespaced jQuery event so any number of listeners on the
 *     page can react (price spans, feature lists, badge visibility, etc.).
 *   - Supports an optional savings badge shown only in the secondary state.
 *   - Exposes a clean programmatic API and full ARIA semantics.
 *   - Integrates with PluginCounter so animated price figures recount when the
 *     period switches (opt-in via options.animatePrices).
 *   - Fires CSS custom-property updates on the host element so pure-CSS
 *     themes can react without any JavaScript of their own.
 *
 *  Markup 
 *
 *   <!-- Minimal: two labels + a track wrapper containing a thumb -->
 *   <div data-plugin-pricingtoggle>
 *     <span data-pt-label-primary>Monthly</span>
 *     <button data-pt-track aria-pressed="false" type="button">
 *       <span data-pt-thumb></span>
 *     </button>
 *     <span data-pt-label-secondary>
 *       Annual
 *       <span data-pt-savings-badge>−20%</span>
 *     </span>
 *   </div>
 *
 *   <!-- Price targets anywhere on the page (not required to be inside the
 *        toggle wrapper). Each element declares both values via data attrs. -->
 *   <span data-pt-price data-pt-primary="$29" data-pt-secondary="$23"></span>
 *
 *   <!-- Per-element options override defaults: -->
 *   <div data-plugin-pricingtoggle
 *        data-plugin-options='{"duration":200,"activeClass":"is-annual"}'>
 *
 *  Events 
 *
 *   The toggle element emits two namespaced events. Both carry the same
 *   detail object:  { state, isPrimary, isSecondary, instance }
 *
 *   ts-pricingtoggle-changed   — fires on every state change (after DOM update)
 *   ts-pricingtoggle-primary   — fires only when reverting to primary state
 *   ts-pricingtoggle-secondary — fires only when entering secondary state
 *
 *   Usage:
 *     $('[data-plugin-pricingtoggle]').on('ts-pricingtoggle-changed', (e, detail) => {
 *       console.log(detail.state); // 'primary' | 'secondary'
 *     });
 *
 * Programmatic API 
 *
 *   const pt = $('[data-plugin-pricingtoggle]').data('__pricingToggle');
 *   pt.setState('secondary');   // set to a specific state
 *   pt.toggle();                // flip current state
 *   pt.getState();              // → 'primary' | 'secondary'
 *   pt.destroy();               // remove all handlers + data
 *
 * Init.js wiring 
 *
 *   if ($.isFunction($.fn['themestrapPluginPricingToggle']) && $('[data-plugin-pricingtoggle]').length) {
 *       $(() => {
 *           $('[data-plugin-pricingtoggle]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginPricingToggle(opts);
 *           });
 *       });
 *   }
 */
// Pricing Toggle
(((themestrap = {}, $) => {
    const instanceName = '__pricingToggle';

    // CSS injected once per page
    const STYLE_ID = 'themestrap-pricingtoggle-styles';

    const CSS = `
        [data-plugin-pricingtoggle] {
            display: inline-flex;
            align-items: center;
            gap: .75rem;
            user-select: none;
        }

        /* Track */
        [data-pt-track] {
            position: relative;
            display: inline-block;
            width: var(--pt-track-width, 44px);
            height: var(--pt-track-height, 24px);
            border-radius: 9999px;
            background: var(--pt-track-bg, #3b82f6);
            border: none;
            cursor: pointer;
            padding: 0;
            transition: background var(--pt-duration, 250ms) ease;
            flex-shrink: 0;
        }
        [data-pt-track]:focus-visible {
            outline: 2px solid var(--pt-track-bg, #3b82f6);
            outline-offset: 3px;
        }

        /* Thumb */
        [data-pt-thumb] {
            position: absolute;
            top: var(--pt-thumb-inset, 3px);
            left: var(--pt-thumb-inset, 3px);
            width: var(--pt-thumb-size, 18px);
            height: var(--pt-thumb-size, 18px);
            border-radius: 50%;
            background: var(--pt-thumb-bg, #fff);
            box-shadow: 0 1px 4px rgba(0, 0, 0, .25);
            transition: left var(--pt-duration, 250ms) cubic-bezier(.16, 1, .3, 1),
                        background var(--pt-duration, 250ms) ease;
            pointer-events: none;
        }

        /* Secondary (active / "on") state: slide thumb to the right */
        [data-pt-track][aria-pressed="true"] [data-pt-thumb] {
            left: calc(
                var(--pt-track-width, 44px)
                - var(--pt-thumb-size, 18px)
                - var(--pt-thumb-inset, 3px)
            );
        }

        /* Labels */
        [data-pt-label-primary],
        [data-pt-label-secondary] {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            font-size: .875rem;
            font-weight: 600;
            color: var(--pt-label-muted, #64748b);
            transition: color var(--pt-duration, 250ms) ease;
            cursor: pointer;
        }
        [data-pt-label-primary].is-active,
        [data-pt-label-secondary].is-active {
            color: var(--pt-label-active, #0f172a);
        }

        /* Savings badge — hidden in primary state, shown in secondary */
        [data-pt-savings-badge] {
            display: inline-block;
            background: var(--pt-badge-bg, rgba(34, 197, 94, .12));
            color: var(--pt-badge-color, #16a34a);
            font-size: .6875rem;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;
            letter-spacing: .02em;
            opacity: 0;
            transform: scale(.8) translateY(2px);
            transition: opacity var(--pt-duration, 250ms) ease,
                        transform var(--pt-duration, 250ms) cubic-bezier(.16, 1, .3, 1);
            pointer-events: none;
        }
        [data-pt-label-secondary].is-active [data-pt-savings-badge] {
            opacity: 1;
            transform: none;
        }

        /* Price targets: crossfade between values */
        [data-pt-price] {
            display: inline-block;
            transition: opacity var(--pt-price-duration, 180ms) ease;
        }
        [data-pt-price].pt-fading {
            opacity: 0;
        }
    `;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const $style = $('<style>').attr({ id: STYLE_ID, type: 'text/css' }).text(CSS);
        $('head').append($style);
    }

    /**
     * Update every [data-pt-price] element on the page whose scope matches
     * this toggle instance. Scoping: if the price element has a
     * [data-pt-group] attribute it must equal the toggle's group option.
     */
    function updatePrices(opts, state) {
        const isPrimary = state === 'primary';
        const group = opts.group || null;

        $('[data-pt-price]').each(function () {
            const $price = $(this);
            const elGroup = $price.data('pt-group') || null;

            // Scope: only update elements that belong to the same group,
            // OR elements with no group when no group is configured.
            if (group !== elGroup) return;

            const primary   = $price.data('pt-primary')   ?? '';
            const secondary = $price.data('pt-secondary') ?? '';
            const next = isPrimary ? primary : secondary;

            if (opts.animatePrices) {
                $price.addClass('pt-fading');
                setTimeout(() => {
                    $price.text(next).removeClass('pt-fading');
                }, opts.priceFadeDuration);
            } else {
                $price.text(next);
            }
        });
    }

    class PluginPricingToggle {

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

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const attrOpts = themestrap.fn.getOptions(this.$el.data('plugin-options'));

            this.options = $.extend(true, {}, PluginPricingToggle.defaults, opts, attrOpts, {
                wrapper: this.$el,
            });

            // Resolve initial state from markup if not forced via options.
            // If the track is already aria-pressed="true" we start secondary.
            if (!this.options.initialState) {
                const $track = this.$el.find('[data-pt-track]');
                this.options.initialState =
                    $track.attr('aria-pressed') === 'true' ? 'secondary' : 'primary';
            }

            this._state = this.options.initialState;
            return this;
        }

        build() {
            injectStyles();

            const o = this.options;
            const $el = this.$el;

            // Cache sub-element references (supports zero or one of each).
            this.$track         = $el.find('[data-pt-track]');
            this.$thumb         = $el.find('[data-pt-thumb]');
            this.$labelPrimary  = $el.find('[data-pt-label-primary]');
            this.$labelSecondary= $el.find('[data-pt-label-secondary]');
            this.$savingsBadge  = $el.find('[data-pt-savings-badge]');

            // Ensure the track button has the right type & ARIA role.
            if (this.$track.is('button') && !this.$track.attr('type')) {
                this.$track.attr('type', 'button');
            }
            this.$track.attr('role', 'switch');

            // Apply CSS custom properties from options so pure-CSS themes
            // can pick them up without any extra JS.
            $el.css({
                '--pt-track-width':      o.trackWidth,
                '--pt-track-height':     o.trackHeight,
                '--pt-thumb-size':       o.thumbSize,
                '--pt-thumb-inset':      o.thumbInset,
                '--pt-track-bg':         o.trackColor,
                '--pt-thumb-bg':         o.thumbColor,
                '--pt-duration':         o.duration + 'ms',
                '--pt-price-duration':   o.priceFadeDuration + 'ms',
                '--pt-label-muted':      o.labelMutedColor,
                '--pt-label-active':     o.labelActiveColor,
                '--pt-badge-bg':         o.badgeBg,
                '--pt-badge-color':      o.badgeColor,
            });

            // Apply initial visual state without emitting events.
            this._applyState(this._state, { silent: true });

            // Set initial price values.
            updatePrices(o, this._state);

            return this;
        }

        events() {
            const self = this;

            // Track click / keyboard.
            self.$track.on('click.pricingtoggle', function () {
                self.toggle();
            });

            // Label clicks also toggle.
            self.$labelPrimary.on('click.pricingtoggle', function () {
                if (self._state !== 'primary') self.setState('primary');
            });
            self.$labelSecondary.on('click.pricingtoggle', function () {
                if (self._state !== 'secondary') self.setState('secondary');
            });

            // Keyboard: Space / Enter on non-button tracks.
            if (!self.$track.is('button')) {
                self.$track.on('keydown.pricingtoggle', function (e) {
                    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
                        e.preventDefault();
                        self.toggle();
                    }
                });
            }

            return this;
        }

        /**
         * Apply visual state to all sub-elements.
         * @param {string}  state   'primary' | 'secondary'
         * @param {object}  opts
         * @param {boolean} opts.silent  suppress jQuery event emission
         */
        _applyState(state, { silent = false } = {}) {
            const o  = this.options;
            const isSecondary = state === 'secondary';

            // ARIA
            this.$track.attr('aria-pressed', isSecondary ? 'true' : 'false');

            // Labels
            this.$labelPrimary
                .toggleClass('is-active', !isSecondary)
                .toggleClass(o.activeClass, !isSecondary);
            this.$labelSecondary
                .toggleClass('is-active', isSecondary)
                .toggleClass(o.activeClass, isSecondary);

            // Host element class hook for external CSS.
            this.$el.toggleClass(o.activeClass, isSecondary);

            // Accessible labels on track button.
            if (this.$track.length) {
                this.$track.attr(
                    'aria-label',
                    isSecondary ? o.ariaLabelSecondary : o.ariaLabelPrimary,
                );
            }

            if (!silent) {
                updatePrices(o, state);
                this._emit(state);
                if (typeof o.onChange === 'function') {
                    o.onChange.call(this, state, this);
                }
            }

            return this;
        }

        /** Build and fire the three namespaced jQuery events. */
        _emit(state) {
            const detail = {
                state,
                isPrimary:   state === 'primary',
                isSecondary: state === 'secondary',
                instance: this,
            };
            this.$el.trigger('ts-pricingtoggle-changed',   [detail]);
            this.$el.trigger('ts-pricingtoggle-' + state,  [detail]);
        }

        /**
         * Set the toggle to a specific state.
         * @param {'primary'|'secondary'} state
         */
        setState(state) {
            if (state !== 'primary' && state !== 'secondary') return this;
            if (state === this._state) return this;
            this._state = state;
            this._applyState(state);
            return this;
        }

        /** Flip the current state. */
        toggle() {
            return this.setState(this._state === 'primary' ? 'secondary' : 'primary');
        }

        /** Return the current state string. */
        getState() {
            return this._state;
        }

        /** Tear down: remove handlers + instance data. */
        destroy() {
            this.$track.off('.pricingtoggle');
            this.$labelPrimary.off('.pricingtoggle');
            this.$labelSecondary.off('.pricingtoggle');
            this.$el.off('.pricingtoggle').removeData(instanceName);
            return this;
        }
    }

    PluginPricingToggle.defaults = {
        // Starting state. 'primary' = left/off, 'secondary' = right/on.
        // If null the plugin reads aria-pressed from the [data-pt-track] element.
        initialState: null,

        // Class added to the wrapper and the active label. Useful for theming.
        activeClass: 'is-secondary',

        // Group key — scope [data-pt-price] updates to elements with a
        // matching [data-pt-group] attribute. Null = unscoped (updates all
        // price elements without a group attribute).
        group: null,

        // Price animation: crossfade price spans when switching state.
        animatePrices:     true,
        priceFadeDuration: 160,          // ms for the opacity fade

        // Thumb slide duration (also used for label color transition).
        duration: 250,                   // ms

        // Track / thumb geometry expressed as CSS values.
        trackWidth:  '44px',
        trackHeight: '24px',
        thumbSize:   '18px',
        thumbInset:  '3px',

        // Colors (applied as CSS custom properties).
        trackColor:       '#3b82f6',
        thumbColor:       '#ffffff',
        labelMutedColor:  '#64748b',
        labelActiveColor: '#0f172a',
        badgeBg:          'rgba(34,197,94,.12)',
        badgeColor:       '#16a34a',

        // Accessible labels for the track button.
        ariaLabelPrimary:   'Switch to annual billing',
        ariaLabelSecondary: 'Switch to monthly billing',

        // Optional callback fired on every state change.
        // Signature: function(state, instance) {}
        onChange: null,
    };

    $.extend(themestrap, { PluginPricingToggle });

    $.fn.themestrapPluginPricingToggle = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginPricingToggle($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);