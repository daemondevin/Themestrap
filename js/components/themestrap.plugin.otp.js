/**
 * Themestrap OTP Plugin
 * Digit-segmented one-time password / PIN input with auto-advance,
 * backspace navigation, paste handling, and ARIA wiring.
 *
 * Markup anatomy:
 *
 *   <div data-plugin-otp
 *        data-plugin-options='{"length": 6, "type": "numeric", "autoSubmit": true}'></div>
 *
 * Public API (via stored instance):
 *   const otp = $('#myOtp').data('__pluginOtp');
 *   otp.getValue();          // returns the current string, e.g. "483920"
 *   otp.setValue('123456'); // fills all boxes, moves focus, fires events
 *   otp.clear();            // empties all boxes, fires ts.otp.clear
 *   otp.focus();            // focuses the first empty box (or first box)
 *   otp.setError('Bad code'); // adds error state + message, shakes
 *   otp.setValid();         // adds valid state, clears error
 *   otp.disable(true|false);// disables / re-enables all inputs
 *   otp.destroy();          // teardown, empties element
 *
 * Events dispatched on the wrapper element:
 *   ts.otp.change    — { value, complete }  on every keystroke
 *   ts.otp.complete  — { value }            when all boxes are filled
 *   ts.otp.submit    — { value }            when autoSubmit: true fires
 *   ts.otp.clear     — {}                   when clear() is called
 *
 * Init.js wiring (DOMReady-immediate):
 *   if ($.isFunction($.fn['themestrapPluginOtp']) && $('[data-plugin-otp]').length) {
 *       $(() => {
 *           $('[data-plugin-otp]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginOtp(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginOtp';
    const STYLE_ID     = 'ts-otp-styles';

    const CSS_TEXT = `
        .ts-otp {
            display: inline-flex;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--ts-otp-gap, 8px);
            position: relative;
        }

        .ts-otp__label {
            width: 100%;
            font-size: 13px;
            font-weight: 600;
            color: var(--ts-otp-label-color, rgba(255,255,255,.7));
            margin-bottom: 4px;
            letter-spacing: .03em;
            display: block;
        }

        .ts-otp__input {
            width: var(--ts-otp-size, 52px);
            height: var(--ts-otp-size, 56px);
            text-align: center;
            font-size: var(--ts-otp-font-size, 22px);
            font-weight: 700;
            font-family: var(--bs-font-monospace, monospace);
            border: 2px solid var(--ts-otp-border, rgba(255,255,255,.15));
            border-radius: var(--ts-otp-radius, 10px);
            background: var(--ts-otp-bg, rgba(255,255,255,.06));
            color: var(--ts-otp-color, #f3f4f6);
            outline: none;
            transition: border-color .15s, box-shadow .15s, background .15s;
            caret-color: transparent;
            -webkit-appearance: none;
            appearance: none;
            -moz-appearance: textfield;
        }

        .ts-otp__input::-webkit-outer-spin-button,
        .ts-otp__input::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }

        .ts-otp__input:focus {
            border-color: var(--ts-otp-focus-border, #2ab8c8);
            box-shadow: 0 0 0 3px var(--ts-otp-focus-ring, rgba(42,184,200,.2));
            background: var(--ts-otp-bg-focus, rgba(42,184,200,.06));
        }

        .ts-otp__input:disabled {
            opacity: .45;
            cursor: not-allowed;
        }

        .ts-otp--error .ts-otp__input {
            border-color: var(--ts-otp-error-color, #e8672a) !important;
        }

        .ts-otp--error .ts-otp__input:focus {
            box-shadow: 0 0 0 3px rgba(232,103,42,.2);
        }

        .ts-otp--valid .ts-otp__input {
            border-color: var(--ts-otp-valid-color, #2ab8c8);
        }

        .ts-otp__separator {
            font-size: 22px;
            font-weight: 700;
            color: var(--ts-otp-sep-color, rgba(255,255,255,.3));
            line-height: 1;
            user-select: none;
        }

        .ts-otp__hint {
            width: 100%;
            font-size: 12px;
            color: var(--ts-otp-hint-color, rgba(255,255,255,.38));
            margin: 5px 0 0 0;
            line-height: 1.4;
        }

        .ts-otp__error {
            width: 100%;
            font-size: 12.5px;
            font-weight: 500;
            color: var(--ts-otp-error-color, #e8672a);
            margin: 5px 0 0 0;
            min-height: 18px;
            line-height: 1.4;
        }

        /* Size modifiers */
        .ts-otp--sm .ts-otp__input {
            --ts-otp-size: 40px;
            --ts-otp-font-size: 16px;
            --ts-otp-radius: 7px;
        }

        .ts-otp--lg .ts-otp__input {
            --ts-otp-size: 68px;
            --ts-otp-font-size: 30px;
            --ts-otp-radius: 14px;
        }

        /* Light theme override */
        .ts-otp--light .ts-otp__input {
            --ts-otp-bg:           rgba(0,0,0,.04);
            --ts-otp-bg-focus:     rgba(42,184,200,.05);
            --ts-otp-border:       rgba(0,0,0,.18);
            --ts-otp-color:        #1a1f2e;
            --ts-otp-label-color:  rgba(0,0,0,.65);
            --ts-otp-hint-color:   rgba(0,0,0,.38);
        }

        /* Shake keyframe — triggered by setError() */
        @keyframes tsOtpShake {
            0%, 100% { transform: translateX(0); }
            15%       { transform: translateX(-6px); }
            30%       { transform: translateX(6px); }
            45%       { transform: translateX(-4px); }
            60%       { transform: translateX(4px); }
            75%       { transform: translateX(-2px); }
            90%       { transform: translateX(2px); }
        }

        .ts-otp--shake {
            animation: tsOtpShake .5s cubic-bezier(.36,.07,.19,.97) both;
        }
    `;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id    = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginOtp {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el  = $el;
            this._uid = 'otp-' + Math.random().toString(36).slice(2, 8);

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
            this.options = $.extend(true, {}, PluginOtp.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectStyles();

            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            $el
                .addClass('ts-otp')
                .attr('role', 'group')
                .attr('aria-label', o.ariaLabel || 'One-time code');

            if (o.size)    $el.addClass('ts-otp--' + o.size);
            if (o.theme)   $el.addClass('ts-otp--' + o.theme);

            if (o.label) {
                $('<label class="ts-otp__label"></label>')
                    .text(o.label)
                    .prependTo($el);
            }

            const $inputs = [];
            const inputType = o.type === 'numeric' ? 'tel' : 'text';
            const inputMode = o.type === 'numeric' ? 'numeric' : 'text';
            const pattern   = o.type === 'numeric' ? '[0-9]*' : '[A-Za-z0-9]';
            const mid       = Math.floor(o.length / 2);

            for (let i = 0; i < o.length; i++) {
                const $inp = $('<input>', {
                    type:         inputType,
                    inputmode:    inputMode,
                    maxlength:    '1',
                    autocomplete: i === 0 ? 'one-time-code' : 'off',
                    autocorrect:  'off',
                    autocapitalize: o.uppercase ? 'characters' : 'off',
                    spellcheck:   'false',
                    class:        'ts-otp__input',
                    'aria-label': `Digit ${i + 1} of ${o.length}`,
                    pattern:      pattern,
                });
                $el.append($inp);
                $inputs.push($inp[0]);

                if (o.separator && i === mid - 1) {
                    $('<span class="ts-otp__separator" aria-hidden="true"></span>')
                        .text(o.separator)
                        .appendTo($el);
                }
            }

            self._$inputs = $($.map($inputs, (el) => el));

            if (o.hint) {
                $('<p class="ts-otp__hint"></p>').text(o.hint).appendTo($el);
            }

            self._$error = $('<p class="ts-otp__error" aria-live="polite" role="alert"></p>');
            $el.append(self._$error);

            return this;
        }

        events() {
            const self    = this;
            const o       = self.options;
            const ns      = '.' + self._uid;
            const $inputs = self._$inputs;

            $inputs.each(function(i) {
                const $inp = $(this);

                $inp.on('keydown' + ns, function(e) {
                    const key = e.key;

                    if (key === 'Backspace') {
                        e.preventDefault();
                        if ($inp.val()) {
                            $inp.val('');
                        } else if (i > 0) {
                            $inputs.eq(i - 1).val('').trigger('focus');
                        }
                        self._dispatchChange();
                        return;
                    }

                    if (key === 'Delete') {
                        e.preventDefault();
                        $inp.val('');
                        self._dispatchChange();
                        return;
                    }

                    if (key === 'ArrowLeft' && i > 0) {
                        e.preventDefault();
                        $inputs.eq(i - 1).trigger('focus');
                        return;
                    }

                    if (key === 'ArrowRight' && i < o.length - 1) {
                        e.preventDefault();
                        $inputs.eq(i + 1).trigger('focus');
                        return;
                    }

                    if (key === 'Home') {
                        e.preventDefault();
                        $inputs.first().trigger('focus');
                        return;
                    }

                    if (key === 'End') {
                        e.preventDefault();
                        $inputs.last().trigger('focus');
                        return;
                    }

                    if (key.length === 1) {
                        if (o.type === 'numeric' && !/^[0-9]$/.test(key)) {
                            e.preventDefault();
                        } else if (o.type === 'alphanumeric' && !/^[A-Za-z0-9]$/.test(key)) {
                            e.preventDefault();
                        }
                    }
                });

                $inp.on('input' + ns, function() {
                    let val = $inp.val();

                    if (o.type === 'numeric')      val = val.replace(/[^0-9]/g, '');
                    else                           val = val.replace(/[^A-Za-z0-9]/g, '');
                    if (o.uppercase)               val = val.toUpperCase();

                    val = val.slice(-1);
                    $inp.val(val);

                    self._clearState();

                    if (val && i < o.length - 1) {
                        $inputs.eq(i + 1).trigger('focus');
                    }

                    self._dispatchChange();
                    self._checkComplete();
                });

                $inp.on('paste' + ns, function(e) {
                    e.preventDefault();
                    const raw = (e.originalEvent.clipboardData || window.clipboardData)
                        .getData('text')
                        .trim();
                    self.setValue(raw);
                });

                $inp.on('focus' + ns, function() {
                    $inp[0].select();
                });

                $inp.on('click' + ns, function() {
                    $inp[0].select();
                });
            });

            return this;
        }

        _dispatchChange() {
            const val = this.getValue();
            this.$el[0].dispatchEvent(new CustomEvent('ts.otp.change', {
                bubbles: true,
                detail:  { value: val, complete: val.length === this.options.length },
            }));
        }

        _checkComplete() {
            const val = this.getValue();
            if (val.length < this.options.length) return;

            this.$el[0].dispatchEvent(new CustomEvent('ts.otp.complete', {
                bubbles: true,
                detail:  { value: val },
            }));

            if (this.options.autoSubmit) {
                this.$el[0].dispatchEvent(new CustomEvent('ts.otp.submit', {
                    bubbles: true,
                    detail:  { value: val },
                }));
            }
        }

        _clearState() {
            this.$el.removeClass('ts-otp--error ts-otp--valid ts-otp--shake');
            this._$error.text('');
        }

        getValue() {
            return this._$inputs.map(function() {
                return this.value;
            }).get().join('');
        }

        setValue(code) {
            const self = this;
            const o    = self.options;
            let   clean = String(code);

            if (o.type === 'numeric') clean = clean.replace(/[^0-9]/g, '');
            else                      clean = clean.replace(/[^A-Za-z0-9]/g, '');
            if (o.uppercase)          clean = clean.toUpperCase();

            self._$inputs.each(function(i) {
                this.value = clean[i] || '';
            });

            const lastIdx = Math.min(clean.length, o.length - 1);
            self._$inputs.eq(lastIdx).trigger('focus');

            self._dispatchChange();
            self._checkComplete();
            return self;
        }

        clear() {
            this._$inputs.val('');
            this._$inputs.first().trigger('focus');
            this._clearState();
            this.$el[0].dispatchEvent(new CustomEvent('ts.otp.clear', { bubbles: true }));
            return this;
        }

        focus() {
            const $first = this._$inputs.filter(function() { return !this.value; }).first();
            ($first.length ? $first : this._$inputs.first()).trigger('focus');
            return this;
        }

        setError(message, shake) {
            const self = this;
            self.$el.addClass('ts-otp--error').removeClass('ts-otp--valid');
            self._$error.text(message || '');

            if (shake !== false) {
                self.$el.removeClass('ts-otp--shake');
                // Reflow so the class re-triggers the animation
                void self.$el[0].offsetWidth;
                self.$el.addClass('ts-otp--shake');
            }

            self.focus();
            return self;
        }

        setValid() {
            this.$el.addClass('ts-otp--valid').removeClass('ts-otp--error ts-otp--shake');
            this._$error.text('');
            return this;
        }

        disable(state) {
            this._$inputs.prop('disabled', state !== false);
            return this;
        }

        destroy() {
            const ns = '.' + this._uid;
            this._$inputs.off(ns);
            this.$el
                .empty()
                .removeClass('ts-otp ts-otp--error ts-otp--valid ts-otp--shake ts-otp--sm ts-otp--lg ts-otp--light')
                .removeAttr('role aria-label')
                .removeData(instanceName);
            return this;
        }
    }

    PluginOtp.defaults = {
        length:      6,            // number of input boxes
        type:        'numeric',    // 'numeric' | 'alphanumeric'
        uppercase:   false,        // force uppercase for alphanumeric
        autoSubmit:  false,        // dispatch ts.otp.submit when complete
        separator:   '',           // character rendered between left/right halves (e.g. '-')
        label:       '',           // optional label text above the inputs
        hint:        '',           // optional helper text below the inputs
        ariaLabel:   'One-time code',
        size:        '',           // '' | 'sm' | 'lg'
        theme:       '',           // '' | 'light'
    };

    $.extend(themestrap, { PluginOtp });

    $.fn.themestrapPluginOtp = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginOtp($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
