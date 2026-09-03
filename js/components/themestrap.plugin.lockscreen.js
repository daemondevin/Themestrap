/**
 * Themestrap Lockscreen Plugin
 * Full-viewport PIN/OTP lockscreen overlay. Wraps PluginOtp to provide a
 * polished idle-lock experience: blurred/dimmed page backdrop, clock display,
 * optional avatar, configurable PIN verification, attempt limiting, and an
 * idle timer that auto-locks after a period of inactivity.
 *
 * Markup anatomy:
 *
 *   <!-- Minimal — plugin builds all inner markup -->
 *   <div data-plugin-lockscreen
 *        id="page-lock"
 *        data-plugin-options='{"pin": "1234", "name": "Alex", "idleTimeout": 300}'></div>
 *
 * Public API (via stored instance):
 *   const ls = $('#page-lock').data('__pluginLockscreen');
 *   ls.lock();                // activate the lockscreen immediately
 *   ls.unlock();              // programmatic unlock (no PIN check)
 *   ls.setPin('6789');        // change the expected PIN at runtime
 *   ls.isLocked();            // returns true | false
 *   ls.resetAttempts();       // clear the failed-attempt counter
 *   ls.destroy();             // teardown
 *
 * Events dispatched on the wrapper element:
 *   ts.lockscreen.locked     — fired when the screen locks
 *   ts.lockscreen.unlocked   — { enteredPin } fired on successful unlock
 *   ts.lockscreen.failed     — { enteredPin, attempts } fired on wrong PIN
 *   ts.lockscreen.blocked    — { attempts } fired when maxAttempts is reached
 *
 * Requires PluginOtp (themestrap.plugin.otp.js) to be loaded first.
 *
 * Init.js wiring (DOMReady-immediate):
 *   if ($.isFunction($.fn['themestrapPluginLockscreen']) && $('[data-plugin-lockscreen]').length) {
 *       $(() => {
 *           $('[data-plugin-lockscreen]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginLockscreen(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginLockscreen';
    const STYLE_ID     = 'ts-lockscreen-styles';

    const CSS_TEXT = `
        .ts-lock {
            position: fixed;
            inset: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            opacity: 0;
            pointer-events: none;
            visibility: hidden;
            transition: opacity .3s ease, visibility .3s ease;
        }

        .ts-lock.ts-lock--active {
            opacity: 1;
            pointer-events: all;
            visibility: visible;
        }

        .ts-lock__backdrop {
            position: fixed;
            inset: 0;
            background: var(--ts-lock-backdrop, rgba(10, 14, 26, 0.88));
            backdrop-filter: blur(var(--ts-lock-blur, 12px));
            -webkit-backdrop-filter: blur(var(--ts-lock-blur, 12px));
        }

        .ts-lock__card {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
            text-align: center;
            width: 100%;
            max-width: 380px;
            animation: tsLockCardIn .35s cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes tsLockCardIn {
            from { opacity: 0; transform: translateY(18px) scale(.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .ts-lock__clock {
            font-size: clamp(52px, 12vw, 82px);
            font-weight: 300;
            letter-spacing: -.03em;
            color: var(--ts-lock-clock-color, #ffffff);
            line-height: 1;
            font-family: var(--ts-lock-clock-font, system-ui, sans-serif);
            margin-bottom: 4px;
        }

        .ts-lock__date {
            font-size: 15px;
            color: var(--ts-lock-date-color, rgba(255,255,255,.55));
            letter-spacing: .02em;
            font-weight: 400;
            margin-bottom: 32px;
        }

        .ts-lock__avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: var(--ts-lock-avatar-bg, rgba(42,184,200,.18)) center/cover no-repeat;
            border: 2px solid var(--ts-lock-avatar-border, rgba(255,255,255,.12));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: var(--ts-lock-avatar-color, #2ab8c8);
            text-transform: uppercase;
            letter-spacing: .02em;
            margin-bottom: 12px;
            flex-shrink: 0;
        }

        .ts-lock__name {
            font-size: 18px;
            font-weight: 600;
            color: var(--ts-lock-name-color, #ffffff);
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .ts-lock__message {
            font-size: 13.5px;
            color: var(--ts-lock-message-color, rgba(255,255,255,.45));
            margin-bottom: 28px;
            line-height: 1.5;
        }

        .ts-lock__otp-wrap {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
        }

        /* Centre the ts-otp inside the card */
        .ts-lock__otp-wrap .ts-otp {
            justify-content: center;
        }

        .ts-lock__actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .ts-lock__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 9px 20px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background .15s, opacity .15s, transform .1s;
            outline: none;
        }

        .ts-lock__btn:active { transform: scale(.97); }

        .ts-lock__btn--primary {
            background: var(--ts-lock-btn-bg, #2ab8c8);
            color: #fff;
        }

        .ts-lock__btn--primary:hover {
            background: var(--ts-lock-btn-hover, #25a5b4);
        }

        .ts-lock__btn--primary:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        .ts-lock__btn--ghost {
            background: rgba(255,255,255,.08);
            color: rgba(255,255,255,.65);
        }

        .ts-lock__btn--ghost:hover {
            background: rgba(255,255,255,.14);
            color: #fff;
        }

        .ts-lock__blocked {
            margin-top: 16px;
            padding: 10px 18px;
            background: rgba(232,103,42,.14);
            border: 1px solid rgba(232,103,42,.3);
            border-radius: 8px;
            font-size: 13px;
            color: #e8a07a;
            line-height: 1.5;
            display: none;
        }

        .ts-lock__blocked.ts-lock__blocked--visible {
            display: block;
        }

        .ts-lock__attempt-dots {
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: 14px;
        }

        .ts-lock__dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,.2);
            transition: background .2s;
        }

        .ts-lock__dot--used {
            background: #e8672a;
        }

        /* Idle indicator pill — appears in top-right when idleTimeout is set */
        .ts-lock__idle-badge {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1999;
            padding: 5px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,.08);
            border: 1px solid rgba(255,255,255,.12);
            color: rgba(255,255,255,.45);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .04em;
            display: none;
            pointer-events: none;
        }

        .ts-lock__idle-badge--visible {
            display: block;
        }
    `;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style       = document.createElement('style');
        style.id          = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    function padTwo(n) {
        return String(n).padStart(2, '0');
    }

    function formatTime(date, use24h) {
        if (use24h) {
            return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
        }
        const h   = date.getHours();
        const h12 = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${h12}:${padTwo(date.getMinutes())} <span class="ts-lock__ampm">${ampm}</span>`;
    }

    function formatDate(date) {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month:   'long',
            day:     'numeric',
        });
    }

    const IDLE_EVENTS = 'mousemove keydown mousedown touchstart scroll';

    class PluginLockscreen {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el        = $el;
            this._uid       = 'lock-' + Math.random().toString(36).slice(2, 8);
            this._locked    = false;
            this._attempts  = 0;
            this._blocked   = false;
            this._clockTick = null;
            this._idleTick  = null;
            this._idleLeft  = 0;

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            if (this.options.lockOnLoad) {
                this.lock();
            }

            if (this.options.idleTimeout > 0) {
                this._startIdleWatcher();
            }

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginLockscreen.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            injectStyles();

            const self = this;
            const o    = self.options;
            const $el  = self.$el;

            $el.addClass('ts-lock').attr('aria-modal', 'true').attr('role', 'dialog');

            // Backdrop
            self._$backdrop = $('<div class="ts-lock__backdrop" aria-hidden="true"></div>');
            $el.append(self._$backdrop);

            // Card
            const $card = $('<div class="ts-lock__card"></div>');
            $el.append($card);
            self._$card = $card;

            // Clock
            self._$clock = $('<div class="ts-lock__clock" aria-live="off" aria-label="Current time"></div>');
            self._$date  = $('<div class="ts-lock__date"></div>');
            $card.append(self._$clock).append(self._$date);
            self._updateClock();
            self._clockTick = setInterval(() => self._updateClock(), 1000);

            // Avatar
            if (o.avatar || o.name) {
                const $av = $('<div class="ts-lock__avatar" aria-hidden="true"></div>');
                if (o.avatar) {
                    $av.css('background-image', `url(${o.avatar})`);
                } else if (o.name) {
                    $av.text(o.name.trim().charAt(0));
                }
                $card.append($av);
            }

            // Name
            if (o.name) {
                $('<div class="ts-lock__name"></div>').text(o.name).appendTo($card);
            }

            // Message
            const $msg = $('<div class="ts-lock__message"></div>').text(o.message);
            $card.append($msg);
            self._$message = $msg;

            // OTP input
            const $otpWrap = $('<div class="ts-lock__otp-wrap"></div>');
            const $otpEl   = $('<div></div>');
            $otpWrap.append($otpEl);
            $card.append($otpWrap);

            if (themestrap.PluginOtp) {
                self._otp = new themestrap.PluginOtp($otpEl, {
                    length:     o.pinLength,
                    type:       o.pinType,
                    autoSubmit: true,
                    size:       o.otpSize,
                });
            }

            // Actions
            const $actions = $('<div class="ts-lock__actions"></div>');
            self._$submitBtn = $(
                `<button type="button" class="ts-lock__btn ts-lock__btn--primary"></button>`
            ).text(o.submitLabel);
            $actions.append(self._$submitBtn);

            if (o.showClear) {
                self._$clearBtn = $(
                    `<button type="button" class="ts-lock__btn ts-lock__btn--ghost"></button>`
                ).text(o.clearLabel);
                $actions.append(self._$clearBtn);
            }

            $card.append($actions);

            // Attempt dots (shown when maxAttempts is set)
            if (o.maxAttempts > 0) {
                const $dots = $('<div class="ts-lock__attempt-dots" aria-hidden="true"></div>');
                for (let i = 0; i < o.maxAttempts; i++) {
                    $('<div class="ts-lock__dot"></div>').appendTo($dots);
                }
                $card.append($dots);
                self._$dots = $dots.find('.ts-lock__dot');
            }

            // Blocked message
            self._$blocked = $('<div class="ts-lock__blocked"></div>').text(o.blockedMessage);
            $card.append(self._$blocked);

            // Idle badge
            if (o.idleTimeout > 0 && o.showIdleBadge) {
                self._$idleBadge = $('<div class="ts-lock__idle-badge"></div>').appendTo('body');
            }

            return this;
        }

        events() {
            const self = this;
            const ns   = '.' + self._uid;

            // Submit button
            self._$submitBtn.on('click' + ns, () => self._attemptUnlock());

            // Clear button
            if (self._$clearBtn) {
                self._$clearBtn.on('click' + ns, () => {
                    if (self._otp) self._otp.clear();
                });
            }

            // OTP auto-submit (ts.otp.submit fires when autoSubmit: true and complete)
            if (self._otp) {
                self._otp.$el[0].addEventListener('ts.otp.submit', (e) => {
                    self._attemptUnlock(e.detail.value);
                });
            }

            // Keyboard: Enter submits, Escape is a no-op (lockscreen stays)
            $(document).on('keydown' + ns, (e) => {
                if (!self._locked) return;
                if (e.key === 'Enter') self._attemptUnlock();
            });

            return this;
        }

        _attemptUnlock(pin) {
            const self = this;
            const o    = self.options;

            if (self._blocked) return;

            const entered = pin !== undefined ? String(pin) : (self._otp ? self._otp.getValue() : '');

            if (entered.length < o.pinLength) {
                if (self._otp) self._otp.setError(o.shortPinMessage, true);
                return;
            }

            if (self._verify(entered)) {
                self._attempts = 0;
                self._updateDots();
                if (self._otp) self._otp.setValid();
                self.$el[0].dispatchEvent(new CustomEvent('ts.lockscreen.unlocked', {
                    bubbles: true,
                    detail:  { enteredPin: entered },
                }));
                setTimeout(() => self.unlock(), 220);
            } else {
                self._attempts++;
                self._updateDots();

                self.$el[0].dispatchEvent(new CustomEvent('ts.lockscreen.failed', {
                    bubbles: true,
                    detail:  { enteredPin: entered, attempts: self._attempts },
                }));

                if (self._otp) self._otp.setError(o.wrongPinMessage, true);

                if (o.maxAttempts > 0 && self._attempts >= o.maxAttempts) {
                    self._triggerBlock();
                } else {
                    setTimeout(() => {
                        if (self._otp) self._otp.clear();
                    }, 600);
                }
            }
        }

        _verify(entered) {
            return String(entered) === String(this.options.pin);
        }

        _triggerBlock() {
            const self = this;
            const o    = self.options;
            self._blocked = true;
            self._$submitBtn.prop('disabled', true);
            if (self._otp) self._otp.disable(true);
            self._$blocked.addClass('ts-lock__blocked--visible');
            self.$el[0].dispatchEvent(new CustomEvent('ts.lockscreen.blocked', {
                bubbles: true,
                detail:  { attempts: self._attempts },
            }));

            if (o.blockDuration > 0) {
                setTimeout(() => {
                    self._blocked   = false;
                    self._attempts  = 0;
                    self._updateDots();
                    self._$submitBtn.prop('disabled', false);
                    self._$blocked.removeClass('ts-lock__blocked--visible');
                    if (self._otp) {
                        self._otp.disable(false).clear();
                    }
                }, o.blockDuration);
            }
        }

        _updateDots() {
            if (!this._$dots) return;
            const used = Math.min(this._attempts, this._$dots.length);
            this._$dots.each(function(i) {
                $(this).toggleClass('ts-lock__dot--used', i < used);
            });
        }

        _updateClock() {
            const now = new Date();
            if (this._$clock) this._$clock.html(formatTime(now, this.options.use24h));
            if (this._$date)  this._$date.text(formatDate(now));
        }

        _startIdleWatcher() {
            const self = this;
            const o    = self.options;
            const ns   = '.' + self._uid + 'idle';

            self._idleLeft = o.idleTimeout;
            self._updateIdleBadge();

            $(document).on(IDLE_EVENTS.split(' ').map(e => e + ns).join(' '), () => {
                if (self._locked) return;
                self._idleLeft = o.idleTimeout;
            });

            self._idleTick = setInterval(() => {
                if (self._locked) return;
                self._idleLeft -= 1;
                self._updateIdleBadge();
                if (self._idleLeft <= 0) {
                    self.lock();
                }
            }, 1000);
        }

        _updateIdleBadge() {
            if (!this._$idleBadge) return;
            const secs = Math.max(0, this._idleLeft);
            const show = secs <= 30 && !this._locked;
            this._$idleBadge.toggleClass('ts-lock__idle-badge--visible', show);
            if (show) {
                this._$idleBadge.text(`Auto-lock in ${secs}s`);
            }
        }

        lock() {
            const self = this;
            if (self._locked) return self;
            self._locked = true;

            $('body').css('overflow', 'hidden');
            self.$el.addClass('ts-lock--active').attr('aria-hidden', 'false');
            self._$message.text(self.options.message);

            if (self._otp) {
                self._otp.clear().focus();
            }

            self.$el[0].dispatchEvent(new CustomEvent('ts.lockscreen.locked', {
                bubbles: true,
            }));

            return self;
        }

        unlock() {
            const self = this;
            if (!self._locked) return self;
            self._locked = false;

            self.$el.removeClass('ts-lock--active').attr('aria-hidden', 'true');
            $('body').css('overflow', '');

            if (self._otp) self._otp.clear();

            // Reset idle timer
            if (self.options.idleTimeout > 0) {
                self._idleLeft = self.options.idleTimeout;
                self._updateIdleBadge();
            }

            return self;
        }

        setPin(pin) {
            this.options.pin = String(pin);
            return this;
        }

        isLocked() {
            return this._locked;
        }

        resetAttempts() {
            this._attempts = 0;
            this._blocked  = false;
            this._updateDots();
            this._$submitBtn.prop('disabled', false);
            this._$blocked.removeClass('ts-lock__blocked--visible');
            if (this._otp) this._otp.disable(false);
            return this;
        }

        destroy() {
            const self = this;
            const ns   = '.' + self._uid;
            const nsI  = ns + 'idle';

            clearInterval(self._clockTick);
            clearInterval(self._idleTick);

            $(document).off(ns).off(nsI);

            self._$submitBtn.off(ns);
            if (self._$clearBtn) self._$clearBtn.off(ns);

            if (self._$idleBadge) self._$idleBadge.remove();

            $('body').css('overflow', '');

            self.$el
                .empty()
                .removeClass('ts-lock ts-lock--active')
                .removeAttr('aria-modal role aria-hidden')
                .removeData(instanceName);

            return self;
        }
    }

    PluginLockscreen.defaults = {
        // Authentication
        pin:              '0000',       // expected PIN / code string
        pinLength:        4,            // number of OTP boxes
        pinType:          'numeric',    // 'numeric' | 'alphanumeric'

        // Copy / labels
        name:             '',           // displayed name under avatar
        avatar:           '',           // URL to avatar image; falls back to initials
        message:          'Enter your PIN to continue',
        submitLabel:      'Unlock',
        clearLabel:       'Clear',
        wrongPinMessage:  'Incorrect PIN. Try again.',
        shortPinMessage:  'Please enter the full PIN.',
        blockedMessage:   'Too many incorrect attempts. Please wait.',

        // Attempt limiting
        maxAttempts:      5,            // 0 = unlimited
        blockDuration:    30000,        // ms to stay blocked (0 = permanent until page reload)

        // Display
        use24h:           false,
        showClear:        true,
        otpSize:          '',           // '' | 'sm' | 'lg' — passed to PluginOtp

        // Idle auto-lock
        lockOnLoad:       false,        // lock immediately on page load
        idleTimeout:      0,            // seconds of inactivity before auto-lock (0 = disabled)
        showIdleBadge:    true,         // show countdown pill in the corner
    };

    $.extend(themestrap, { PluginLockscreen });

    $.fn.themestrapPluginLockscreen = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginLockscreen($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);