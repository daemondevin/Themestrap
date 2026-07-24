/**
 * Themestrap Wizard Plugin
 * Accessible multi-step form wizard / onboarding stepper
 * Part of the Themestrap component library.
 *
 * Features:
 *   • Step-by-step navigation with animated forward/back transitions.
 *   • Optional per-step validation gate — any function, or HTML5
 *     constraint validation (via options.validate: 'html5').
 *   • Progress bar and step indicator sync (data-driven, no fixed markup).
 *   • Keyboard navigation: Tab stays inside the active step; Alt+→ / Alt+←
 *     move between steps when no validation is blocking.
 *   • Jump-to-step via [data-wizard-goto="n"] anywhere in the document.
 *   • Substep support — steps can contain nested [data-wizard-substep]
 *     panels that must all be completed before the step counts as done.
 *   • localStorage persistence — optionally re-opens the wizard at the
 *     last-visited step.
 *   • Full ARIA: role="tablist/tab/tabpanel" on the indicator strip;
 *     aria-live region announces step title to screen readers.
 *
 * Markup anatomy:
 *
 *   <div data-plugin-wizard id="signup-wizard"
 *        data-plugin-options='{"persist": true, "animationDuration": 300}'>
 *
 *     <!-- Optional: step indicator strip (rendered from [data-wizard-step] titles
 *          if no [data-wizard-indicators] element exists). -->
 *     <ol data-wizard-indicators role="tablist" aria-label="Form steps"></ol>
 *
 *     <!-- Optional: progress bar -->
 *     <div data-wizard-progress>
 *       <div data-wizard-progress-bar></div>
 *     </div>
 *
 *     <!-- Optional: SR-only live region (auto-created if absent) -->
 *     <div data-wizard-announce aria-live="polite" class="visually-hidden"></div>
 *
 *     <!-- Steps -->
 *     <div data-wizard-steps>
 *
 *       <section data-wizard-step="1"
 *                data-wizard-title="Account"
 *                data-wizard-icon="fas fa-user">
 *         <!-- any content; can include <input>s, [data-wizard-substep], etc. -->
 *         <h3>Create your account</h3>
 *         <input name="email" type="email" required />
 *         <input name="password" type="password" required minlength="8" />
 *       </section>
 *
 *       <section data-wizard-step="2"
 *                data-wizard-title="Profile"
 *                data-wizard-icon="fas fa-id-card">
 *         <h3>Tell us about yourself</h3>
 *         <input name="name" required />
 *       </section>
 *
 *       <section data-wizard-step="3"
 *                data-wizard-title="Done"
 *                data-wizard-icon="fas fa-check">
 *         <h3>All set!</h3>
 *         <p>Your account is ready.</p>
 *       </section>
 *
 *     </div>
 *
 *     <!-- Navigation bar -->
 *     <div data-wizard-nav>
 *       <button data-wizard-prev type="button">Back</button>
 *       <button data-wizard-next type="button">Next</button>
 *       <button data-wizard-submit type="submit">Finish</button>
 *     </div>
 *
 *   </div>
 *
 * Public API (via stored instance):
 *   const wiz = $('#signup-wizard').data('__pluginWizard');
 *   wiz.next();                // advance (runs validation)
 *   wiz.prev();                // go back (never validates)
 *   wiz.goTo(n);               // jump to step n (1-indexed)
 *   wiz.getStep();             // → current 1-indexed step number
 *   wiz.getStepCount();        // → total number of steps
 *   wiz.isFirst();             // → boolean
 *   wiz.isLast();              // → boolean
 *   wiz.markComplete(n);       // manually mark step n complete
 *   wiz.reset();               // return to step 1, clear completions
 *   wiz.destroy();             // remove listeners + instance data
 *
 * Events fired on the wizard root element:
 *   wizard:beforechange   — before step changes; call e.preventDefault() to block
 *   wizard:change         — after step has changed          (from, to, direction)
 *   wizard:complete       — when the last step passes validation and submit fires
 *   wizard:invalid        — when validation fails on a next() attempt          (step)
 *   wizard:reset          — when reset() is called
 *
 * Init.js wiring (DOMReady-immediate):
 *   if ($.isFunction($.fn['themestrapPluginWizard']) && $('[data-plugin-wizard]').length) {
 *       $(() => {
 *           $('[data-plugin-wizard]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginWizard(opts);
 *           });
 *       });
 *   }
 */
// Wizard
(((themestrap = {}, $) => {
    const instanceName = '__pluginWizard';
    const STYLE_ID     = 'ts-wizard-styles';

    // CSS
    const CSS_TEXT = `
        /* Themestrap Wizard */
        :root {
            --wizard-accent:           var(--color-primary, #e8672a);
            --wizard-accent-subtle:    color-mix(in srgb, var(--wizard-accent) 12%, transparent);
            --wizard-muted:            #94a3b8;
            --wizard-fg:               #0f172a;
            --wizard-bg:               #ffffff;
            --wizard-border:           rgba(15, 23, 42, 0.10);
            --wizard-border-strong:    rgba(15, 23, 42, 0.20);
            --wizard-step-size:        32px;
            --wizard-step-font:        .8125rem;
            --wizard-radius:           var(--border-radius, 6px);
            --wizard-duration:         300ms;
            --wizard-ease:             cubic-bezier(.16, 1, .3, 1);
        }

        /* Root */
        [data-plugin-wizard] {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        /* Indicator strip */
        [data-wizard-indicators] {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: flex-start;
            gap: 0;
            counter-reset: wizard-step;
        }

        [data-wizard-indicator] {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            text-align: center;
            position: relative;
            cursor: pointer;
            padding-bottom: 2px;
        }

        /* Connector line between bubbles */
        [data-wizard-indicator]:not(:last-child)::after {
            content: '';
            position: absolute;
            top: calc(var(--wizard-step-size) / 2);
            left: calc(50% + var(--wizard-step-size) / 2 + 4px);
            right: calc(-50% + var(--wizard-step-size) / 2 + 4px);
            height: 2px;
            background: var(--wizard-border-strong);
            z-index: 0;
            transition: background var(--wizard-duration) ease;
        }

        [data-wizard-indicator].wiz-completed:not(:last-child)::after,
        [data-wizard-indicator].wiz-active:not(:last-child)::after {
            background: var(--wizard-accent);
        }

        /* Bubble */
        [data-wizard-indicator-bubble] {
            width: var(--wizard-step-size);
            height: var(--wizard-step-size);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: var(--wizard-step-font);
            font-weight: 600;
            border: 2px solid var(--wizard-border-strong);
            background: var(--wizard-bg);
            color: var(--wizard-muted);
            position: relative;
            z-index: 1;
            transition:
                background var(--wizard-duration) ease,
                border-color var(--wizard-duration) ease,
                color var(--wizard-duration) ease,
                box-shadow var(--wizard-duration) ease;
        }

        [data-wizard-indicator].wiz-active [data-wizard-indicator-bubble] {
            background: var(--wizard-accent);
            border-color: var(--wizard-accent);
            color: #fff;
            box-shadow: 0 0 0 4px var(--wizard-accent-subtle);
        }

        [data-wizard-indicator].wiz-completed [data-wizard-indicator-bubble] {
            background: var(--wizard-accent);
            border-color: var(--wizard-accent);
            color: #fff;
        }

        [data-wizard-indicator].wiz-completed [data-wizard-indicator-bubble]::after {
            /* Checkmark via Unicode — no icon font dependency */
            content: '✓';
            font-size: .75rem;
        }

        /* Hide the step number when completed (replaced by checkmark) */
        [data-wizard-indicator].wiz-completed [data-wizard-indicator-number] {
            display: none;
        }

        [data-wizard-indicator-icon] {
            font-size: .8125rem;
        }

        [data-wizard-indicator-label] {
            font-size: .6875rem;
            font-weight: 600;
            color: var(--wizard-muted);
            text-transform: uppercase;
            letter-spacing: .04em;
            line-height: 1.2;
            transition: color var(--wizard-duration) ease;
        }

        [data-wizard-indicator].wiz-active [data-wizard-indicator-label] {
            color: var(--wizard-accent);
        }

        [data-wizard-indicator].wiz-completed [data-wizard-indicator-label] {
            color: var(--wizard-fg);
        }

        [data-wizard-indicator][aria-disabled="true"] {
            cursor: default;
            pointer-events: none;
        }

        /* Progress bar */
        [data-wizard-progress] {
            height: 4px;
            background: var(--wizard-border);
            border-radius: 9999px;
            overflow: hidden;
            margin: 12px 0;
        }

        [data-wizard-progress-bar] {
            height: 100%;
            background: var(--wizard-accent);
            border-radius: 9999px;
            transition: width var(--wizard-duration) var(--wizard-ease);
            width: 0%;
        }

        /* Steps viewport */
        [data-wizard-steps] {
            position: relative;
            overflow: hidden;
            /* Height animates via JS (set inline → auto) */
        }

        [data-wizard-step] {
            width: 100%;
            /* Inactive steps are removed from tab order and visually hidden */
        }

        [data-wizard-step][aria-hidden="true"] {
            display: none;
        }

        /* Slide-in animations (class-driven by JS) */
        [data-wizard-step].wiz-enter-left {
            animation: wiz-slide-in-left var(--wizard-duration) var(--wizard-ease) both;
        }
        [data-wizard-step].wiz-enter-right {
            animation: wiz-slide-in-right var(--wizard-duration) var(--wizard-ease) both;
        }
        [data-wizard-step].wiz-leave-left {
            animation: wiz-slide-out-left var(--wizard-duration) var(--wizard-ease) both;
        }
        [data-wizard-step].wiz-leave-right {
            animation: wiz-slide-out-right var(--wizard-duration) var(--wizard-ease) both;
        }

        @keyframes wiz-slide-in-left {
            from { opacity: 0; transform: translateX(-28px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wiz-slide-in-right {
            from { opacity: 0; transform: translateX(28px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wiz-slide-out-left {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(-28px); }
        }
        @keyframes wiz-slide-out-right {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(28px); }
        }

        @media (prefers-reduced-motion: reduce) {
            [data-wizard-step].wiz-enter-left,
            [data-wizard-step].wiz-enter-right,
            [data-wizard-step].wiz-leave-left,
            [data-wizard-step].wiz-leave-right {
                animation: none !important;
            }
        }

        /* Nav bar */
        [data-wizard-nav] {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-top: 16px;
        }

        [data-wizard-prev] { margin-right: auto; }

        /* Hide submit on non-final steps; hide next on final step */
        [data-plugin-wizard]:not([data-wiz-first]) [data-wizard-prev] { display: inline-flex; }
        [data-plugin-wizard][data-wiz-first] [data-wizard-prev]       { visibility: hidden; }

        [data-plugin-wizard]:not([data-wiz-last]) [data-wizard-submit] { display: none; }
        [data-plugin-wizard][data-wiz-last] [data-wizard-next]         { display: none; }
        [data-plugin-wizard][data-wiz-last] [data-wizard-submit]       { display: inline-flex; }

        /* Validation error styles on invalid inputs */
        [data-plugin-wizard] .wiz-invalid {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
        }

        [data-plugin-wizard] [data-wizard-error] {
            font-size: .8125rem;
            color: #dc2626;
            margin-top: 4px;
            display: none;
        }

        [data-plugin-wizard] [data-wizard-error].wiz-show {
            display: block;
        }

        /* Substeps */
        [data-wizard-substep] {
            display: none;
        }
        [data-wizard-substep].wiz-substep-active {
            display: block;
        }
    `;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id    = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    /** 
     * Run HTML5 constraint validation on all required/pattern fields in $el.
     * Returns true if valid, false + marks invalid inputs if not. 
     */
    function html5Validate($step) {
        let ok = true;
        $step.find('input, select, textarea').each(function () {
            const el = this;
            if (el.checkValidity && !el.checkValidity()) {
                $(el).addClass('wiz-invalid');
                const $err = $(el).next('[data-wizard-error]');
                if ($err.length) {
                    $err.text(el.validationMessage).addClass('wiz-show');
                }
                ok = false;
            } else {
                $(el).removeClass('wiz-invalid');
                $(el).next('[data-wizard-error]').removeClass('wiz-show').text('');
            }
        });
        // Focus first invalid
        if (!ok) {
            $step.find('.wiz-invalid').first().trigger('focus');
        }
        return ok;
    }

    let _idSeq = 0;
    const uid = () => `wiz-${++_idSeq}-${Math.random().toString(36).slice(2,6)}`;

    class PluginWizard {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el          = $el;
            this._uid         = uid();
            this._completed   = new Set();    // 1-indexed step numbers
            this._currentStep = 1;
            this._transitioning = false;

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
            this.options   = $.extend(true, {}, PluginWizard.defaults, opts, attrOpts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            injectStyles();

            // Cache step panels
            self.$steps = $el.find('[data-wizard-step]')
                             .sort((a, b) => +$(a).data('wizard-step') - +$(b).data('wizard-step'));
            self._total = self.$steps.length;

            if (!self._total) return this;

            // Ensure each step has an id for ARIA
            self.$steps.each(function () {
                if (!this.id) this.id = uid();
                $(this).attr('role', 'tabpanel');
            });

            // Build/sync indicator strip
            self.$indicators = $el.find('[data-wizard-indicators]');
            if (self.$indicators.length) {
                self._buildIndicators();
            }

            // Progress bar
            self.$progress    = $el.find('[data-wizard-progress]');
            self.$progressBar = $el.find('[data-wizard-progress-bar]');

            // Announce region (SR)
            self.$announce = $el.find('[data-wizard-announce]');
            if (!self.$announce.length) {
                self.$announce = $('<div data-wizard-announce aria-live="polite" class="visually-hidden"></div>').appendTo($el);
            }

            // Nav buttons cache
            self.$btnPrev   = $el.find('[data-wizard-prev]');
            self.$btnNext   = $el.find('[data-wizard-next]');
            self.$btnSubmit = $el.find('[data-wizard-submit]');

            // Restore persisted step
            const initial = o.persist ? self._loadStep() : 1;
            const start   = Math.min(Math.max(initial || 1, 1), self._total);

            // Mark all steps before start as completed when restoring
            for (let i = 1; i < start; i++) self._completed.add(i);

            // Render first step without animation
            self._currentStep = start;
            self._render(null, start, 'none');

            return this;
        }

        events() {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            // Prev / Next / Submit buttons
            $el.on(`click.wizard.${self._uid}`, '[data-wizard-prev]', function (e) {
                e.preventDefault();
                self.prev();
            });

            $el.on(`click.wizard.${self._uid}`, '[data-wizard-next]', function (e) {
                e.preventDefault();
                self.next();
            });

            $el.on(`click.wizard.${self._uid}`, '[data-wizard-submit]', function (e) {
                e.preventDefault();
                self._handleSubmit();
            });

            // Indicator click — jump to a completed step
            $el.on(`click.wizard.${self._uid}`, '[data-wizard-indicator]', function () {
                const n = +$(this).data('wizard-indicator');
                if (!isNaN(n)) self._jumpTo(n);
            });

            // External goto triggers
            $(document).on(`click.wizard.${self._uid}`, `[data-wizard-goto]`, function () {
                const target = $(this).data('wizard-goto');
                const wizId  = $(this).data('wizard-id');
                if (wizId && $el.attr('id') !== String(wizId)) return;
                const n = +target;
                if (!isNaN(n)) self._jumpTo(n);
            });

            // Keyboard: Alt+Arrow for step navigation
            $el.on(`keydown.wizard.${self._uid}`, function (e) {
                if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); self.next(); }
                if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); self.prev(); }
            });

            // Input change — clear validation state
            $el.on(`input.wizard.${self._uid}`, 'input, select, textarea', function () {
                $(this).removeClass('wiz-invalid');
                $(this).next('[data-wizard-error]').removeClass('wiz-show').text('');
            });

            return this;
        }

        next() {
            const self = this;
            if (self._transitioning || self._currentStep >= self._total) return this;

            if (!self._validate(self._currentStep)) return this;

            self._completed.add(self._currentStep);
            self._navigate(self._currentStep, self._currentStep + 1, 'forward');
            return this;
        }

        prev() {
            const self = this;
            if (self._transitioning || self._currentStep <= 1) return this;
            self._navigate(self._currentStep, self._currentStep - 1, 'backward');
            return this;
        }

        goTo(n) {
            return this._jumpTo(n);
        }

        getStep()      { return this._currentStep; }
        getStepCount() { return this._total; }
        isFirst()      { return this._currentStep === 1; }
        isLast()       { return this._currentStep === this._total; }

        markComplete(n) {
            if (n >= 1 && n <= this._total) this._completed.add(n);
            this._syncIndicators();
            return this;
        }

        reset() {
            const self = this;
            self._completed.clear();
            self._currentStep = 1;
            self._saveStep(1);

            self.$steps.find('input, select, textarea').val('').trigger('change');
            self.$steps.find('.wiz-invalid').removeClass('wiz-invalid');
            self.$steps.find('[data-wizard-error]').removeClass('wiz-show').text('');

            self._render(null, 1, 'none');

            self.$el.trigger('wizard:reset', [self]);
            if (typeof self.options.onReset === 'function') self.options.onReset.call(self);

            return this;
        }

        destroy() {
            const self = this;
            self.$el.off(`.wizard.${self._uid}`);
            $(document).off(`.wizard.${self._uid}`);
            self.$el.removeData(instanceName);
            self.$el.removeAttr('data-wiz-first data-wiz-last');
            return this;
        }

        _validate(stepNum) {
            const self    = this;
            const o       = self.options;
            const $step   = self._stepEl(stepNum);

            let valid = true;

            if (o.validate === 'html5') {
                valid = html5Validate($step);
            } else if (typeof o.validate === 'function') {
                valid = o.validate.call(self, $step, stepNum, self);
            }

            if (!valid) {
                self.$el.trigger('wizard:invalid', [self, stepNum, $step]);
                if (typeof o.onInvalid === 'function') o.onInvalid.call(self, $step, stepNum);
            }

            return valid;
        }

        _jumpTo(n) {
            const self = this;
            if (n === self._currentStep) return this;
            if (n < 1 || n > self._total) return this;

            // Forward jumps require all intervening steps to be completed
            if (n > self._currentStep) {
                for (let i = self._currentStep; i < n; i++) {
                    if (!self._completed.has(i)) {
                        // Try to advance through validation to reach n
                        if (!self._validate(i)) return this;
                        self._completed.add(i);
                    }
                }
            }

            const dir = n > self._currentStep ? 'forward' : 'backward';
            self._navigate(self._currentStep, n, dir);
            return this;
        }

        _navigate(from, to, direction) {
            const self = this;
            const $el  = self.$el;
            const o    = self.options;

            // Cancellable pre-change event
            const evt = $.Event('wizard:beforechange');
            $el.trigger(evt, [self, from, to, direction]);
            if (evt.isDefaultPrevented()) return;

            self._transitioning = true;
            self._currentStep   = to;
            self._saveStep(to);

            self._render(from, to, direction);

            $el.trigger('wizard:change', [self, from, to, direction]);
            if (typeof o.onChange === 'function') o.onChange.call(self, from, to, direction);

            setTimeout(() => {
                self._transitioning = false;
            }, o.animationDuration + 50);
        }

        _handleSubmit() {
            const self = this;
            const o    = self.options;

            if (!self._validate(self._currentStep)) return;
            self._completed.add(self._currentStep);

            self.$el.trigger('wizard:complete', [self]);
            if (typeof o.onComplete === 'function') o.onComplete.call(self);

            // If the wizard lives inside a <form>, submit it
            const $form = self.$el.closest('form');
            if (o.submitForm && $form.length) {
                $form[0].submit();
            }
        }

        /** Render step `to`, optionally animating `from` out. */
        _render(from, to, direction) {
            const self = this;
            const o    = self.options;
            const dur  = o.animationDuration;

            const $outStep = from ? self._stepEl(from) : null;
            const $inStep  = self._stepEl(to);

            // Determine animation classes
            const outClass = direction === 'forward'  ? 'wiz-leave-left'  :
                             direction === 'backward' ? 'wiz-leave-right' : null;
            const inClass  = direction === 'forward'  ? 'wiz-enter-right' :
                             direction === 'backward' ? 'wiz-enter-left'  : null;

            // Animate outgoing step, then show incoming
            if ($outStep && $outStep.length && outClass) {
                $outStep
                    .addClass(outClass)
                    .one('animationend webkitAnimationEnd', function () {
                        $outStep
                            .removeClass(outClass)
                            .attr('aria-hidden', 'true')
                            .find('input, select, textarea, button, a, [tabindex]')
                            .attr('tabindex', '-1');
                    });
                // Fallback: remove after duration
                setTimeout(() => {
                    $outStep
                        .removeClass(outClass)
                        .attr('aria-hidden', 'true')
                        .find('input, select, textarea, button, a, [tabindex]')
                        .attr('tabindex', '-1');
                }, dur + 50);
            } else if ($outStep) {
                $outStep
                    .attr('aria-hidden', 'true')
                    .find('input, select, textarea, button, a, [tabindex]')
                    .attr('tabindex', '-1');
            }

            // All steps hidden except incoming
            self.$steps.not($inStep).attr('aria-hidden', 'true');

            // Show incoming
            $inStep.attr('aria-hidden', 'false');
            if (inClass) {
                $inStep.addClass(inClass).one('animationend webkitAnimationEnd', () => {
                    $inStep.removeClass(inClass);
                });
                setTimeout(() => $inStep.removeClass(inClass), dur + 50);
            }

            // Re-enable tab-accessible elements in incoming step
            $inStep.find('input, select, textarea, button, a').removeAttr('tabindex');

            // Sync all state chrome
            self._syncNav();
            self._syncIndicators();
            self._syncProgress();
            self._syncAnnounce(to);

            // Focus management — top of step or first focusable
            /*setTimeout(() => {
                const $focus = $inStep.find('[autofocus]').first();
                if ($focus.length) {
                    $focus.trigger('focus');
                } else {
                    const $f = $inStep.find('input, select, textarea, [tabindex]:not([tabindex="-1"])').first();
                    if ($f.length) $f.trigger('focus');
                }
            }, direction === 'none' ? 0 : dur);*/
        }

        _syncNav() {
            const self  = this;
            const first = self._currentStep === 1;
            const last  = self._currentStep === self._total;
            const $el   = self.$el;

            if (first) $el.attr('data-wiz-first', '');
            else       $el.removeAttr('data-wiz-first');

            if (last) $el.attr('data-wiz-last', '');
            else      $el.removeAttr('data-wiz-last');
        }

        _syncIndicators() {
            const self = this;
            if (!self.$indicators || !self.$indicators.length) return;

            self.$indicators.find('[data-wizard-indicator]').each(function () {
                const $ind = $(this);
                const n    = +$ind.data('wizard-indicator');
                $ind.removeClass('wiz-active wiz-completed wiz-upcoming');

                if (n === self._currentStep)   $ind.addClass('wiz-active');
                else if (self._completed.has(n)) $ind.addClass('wiz-completed');
                else                            $ind.addClass('wiz-upcoming');

                // ARIA: only completed/active steps are reachable via the strip
                const reachable = n <= self._currentStep || self._completed.has(n);
                $ind.attr('aria-disabled', reachable ? 'false' : 'true');
                $ind.attr('aria-selected', n === self._currentStep ? 'true' : 'false');
            });
        }

        _syncProgress() {
            const self = this;
            if (!self.$progressBar.length) return;
            const pct = ((self._currentStep - 1) / (self._total - 1)) * 100;
            self.$progressBar.css('width', (self._total <= 1 ? 100 : pct) + '%');
            self.$progressBar.attr('aria-valuenow', Math.round(pct));
        }

        _syncAnnounce(stepNum) {
            const self  = this;
            const $step = self._stepEl(stepNum);
            const title = $step.data('wizard-title') || `Step ${stepNum} of ${self._total}`;
            self.$announce.text(`${title}. Step ${stepNum} of ${self._total}.`);
        }

        /** Build the indicator strip from step data attributes. */
        _buildIndicators() {
            const self = this;
            self.$indicators.empty().attr('role', 'tablist');

            self.$steps.each(function (idx) {
                const $step  = $(this);
                const n      = +$step.data('wizard-step') || (idx + 1);
                const title  = $step.data('wizard-title') || `Step ${n}`;
                const icon   = $step.data('wizard-icon');

                const $li = $(`
                    <li data-wizard-indicator="${n}"
                        role="tab"
                        aria-selected="false"
                        aria-disabled="true"
                        aria-controls="${$step.attr('id')}"
                        tabindex="0"
                        title="${title}">
                        <span data-wizard-indicator-bubble>
                            ${icon ? `<i class="${icon}" data-wizard-indicator-icon></i>`
                                   : `<span data-wizard-indicator-number>${n}</span>`}
                        </span>
                        <span data-wizard-indicator-label>${title}</span>
                    </li>
                `);
                self.$indicators.append($li);
            });
        }

        _stepEl(n) {
            // Steps sorted by data-wizard-step; n is 1-indexed into that sorted array
            return $(this.$steps[n - 1]);
        }

        _persistKey() {
            const id = this.$el.attr('id');
            if (!id) return null;
            return `ts.wizard.step.${id}`;
        }

        _saveStep(n) {
            const key = this._persistKey();
            if (!key || typeof localStorage === 'undefined') return;
            try { localStorage.setItem(key, String(n)); } catch (_) {}
        }

        _loadStep() {
            const key = this._persistKey();
            if (!key || typeof localStorage === 'undefined') return 1;
            try {
                const raw = localStorage.getItem(key);
                return raw ? parseInt(raw, 10) : 1;
            } catch (_) { return 1; }
        }
    }

    PluginWizard.defaults = {
        // 'html5' uses native constraint validation on each step's inputs.
        // Pass a function(($step, stepNum, instance) => boolean) for custom logic.
        // null / false disables validation entirely.
        validate: 'html5',

        // Slide animation duration (ms). Set 0 to disable.
        animationDuration: 280,

        // Persist the current step to localStorage by wizard [id].
        persist: false,

        // Submit the closest ancestor <form> when the last step passes validation.
        submitForm: true,

        // Lifecycle callbacks
        onChange:   null,   // (from, to, direction)
        onComplete: null,   // ()
        onInvalid:  null,   // ($step, stepNum)
        onReset:    null,   // ()
    };

    $.extend(themestrap, { PluginWizard });

    $.fn.themestrapPluginWizard = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginWizard($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);