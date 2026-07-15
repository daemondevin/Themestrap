/**
 * Themestrap Auth Plugin
 * Progressive-enhancement layer for MODX Login extra forms (and any auth form).
 * Part of the Themestrap component library for MODX 3
 *
 * Adds inline validation, password show/hide, password-strength meter, loading
 * button state, toast feedback, and optional AJAX submission to login,
 * register, forgot-password, reset-password, change-password, and
 * update-profile forms.
 *
 * Markup anatomy:
 *
 *   <form data-plugin-auth
 *         data-auth-action="login"
 *         data-plugin-options='{"ajax": false, "toasts": true, "redirect": "/dashboard"}'
 *         method="post"
 *         action="">
 *
 *     <div data-auth-field="username">
 *       <label for="auth-username">Username</label>
 *       <input id="auth-username" name="username" type="text"
 *              required data-auth-error class="form-control">
 *       <div data-auth-feedback class="invalid-feedback"></div>
 *     </div>
 *
 *     <div data-auth-field="password">
 *       <label for="auth-password">Password</label>
 *       <div class="input-group">
 *         <input id="auth-password" name="password" type="password"
 *                required minlength="8" data-auth-strength
 *                data-auth-error class="form-control">
 *         <button type="button" class="btn btn-outline-secondary"
 *                 data-auth-toggle-password>Show</button>
 *       </div>
 *       <div data-auth-strength-meter class="auth-strength"></div>
 *       <div data-auth-feedback class="invalid-feedback"></div>
 *     </div>
 *
 *     <button type="submit" data-auth-submit class="btn btn-primary">
 *       <span data-auth-submit-label>Sign In</span>
 *       <span data-auth-spinner class="spinner-border spinner-border-sm d-none"
 *             role="status" aria-hidden="true"></span>
 *     </button>
 *   </form>
 *
 * Public API (via stored instance):
 *   const auth = $('#myForm').data('__pluginAuth');
 *   auth.validate();           // returns true | false
 *   auth.setBusy(true|false);  // toggle loading state
 *   auth.reset();              // clear all field error states
 *   auth.destroy();
 *
 * Events fired on the form element:
 *   auth:validate   (instance, isValid)
 *   auth:submit     (instance, formData)
 *   auth:success    (instance, response)
 *   auth:error      (instance, error)
 *
 * Init.js wiring (DOMReady-immediate — auth forms must work without scrolling):
 *   if ($.isFunction($.fn['themestrapPluginAuth']) && $('[data-plugin-auth]').length) {
 *       $(() => {
 *           $('[data-plugin-auth]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginAuth(opts);
 *           });
 *       });
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__pluginAuth';
    
    // Injected stylesheet — runs once per page, keyed to the plugin stylesheet ID
    const STYLE_ID = 'ts-auth-styles';
    // CSS_TEXT is injected lazily by injectStyles() on first build (see below),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const CSS_TEXT = `
        /* Themestrap Auth Plugin — supplementary styles
           Bootstrap 5 provides the bulk of validation styling (is-invalid / is-valid /
           invalid-feedback); these rules add only what the framework is missing:
           the segmented password-strength meter, the Caps Lock hint pill, and a few
           ergonomic spacings on auth forms. */

        .auth-form .form-control:focus {
            box-shadow: 0 0 0 .2rem rgba(13, 110, 253, .15);
        }

        /* Password strength meter
           Built lazily by PluginAuth — five <span class="auth-strength-bar"> +
           one <span class="auth-strength-label">. Bar colors are applied via
           Bootstrap utility classes (.bg-danger / .bg-warning / .bg-info / .bg-success). */
        .auth-strength {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 6px;
            height: 22px;
        }

        .auth-strength .auth-strength-bar {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: #e9ecef;
            transition: background-color .2s ease;
        }

        .auth-strength .auth-strength-label {
            margin-left: 8px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .04em;
            text-transform: uppercase;
            color: #6c757d;
            min-width: 64px;
        }

        /* Caps Lock hint pill
           Rendered inside [data-auth-field] for password fields. The plugin toggles
           .d-none on [data-auth-capslock] based on keyup CapsLock state. */
        .auth-capslock {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            border-radius: 10px;
            background: #fff3cd;
            color: #664d03;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .03em;
        }

        .auth-capslock::before {
            content: "⇪ ";
            margin-right: 4px;
        }

        /* Profile card */
        .auth-profile-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 18px 20px;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            background: #fff;
        }

        .auth-profile-card .auth-profile-avatar {
            flex: 0 0 64px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #e9ecef center/cover no-repeat;
            color: #6c757d;
            font-size: 26px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
        }

        .auth-profile-card .auth-profile-name {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
        }

        .auth-profile-card .auth-profile-meta {
            margin: 0;
            font-size: 13px;
            color: #6c757d;
        }

        .auth-profile-card .auth-profile-actions {
            margin-left: auto;
            display: flex;
            gap: 8px;
        }

        /* Compact spinner-in-button alignment */
        .auth-form [data-auth-submit] {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        /* Optional: smooth disabled state */
        .auth-form [data-auth-submit][disabled] {
            cursor: progress;
            opacity: .75;
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

    // Password strength scoring (0-4, no zxcvbn dependency).
    function scorePassword(pw) {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 8)  score++;
        if (pw.length >= 12) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw))   score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(score, 4);
    }

    const STRENGTH_LABELS  = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const STRENGTH_CLASSES = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
    const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    class PluginAuth {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el    = $el;
            this.action = ($el.data('auth-action') || 'login').toString().toLowerCase();
            this.busy   = false;
            this._uid   = 'auth-' + Math.random().toString(36).slice(2, 8);

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
            this.options = $.extend(true, {}, PluginAuth.defaults, opts, {
                wrapper: this.$el,
            });
            return this;
        }

        build() {
            // Inject component CSS lazily - only when an instance is built.
            injectStyles();
            const self = this;
            const $el  = self.$el;

            self.$fields  = $el.find('[data-auth-field]');
            self.$inputs  = $el.find('[data-auth-error]');
            self.$submit  = $el.find('[data-auth-submit]').first();
            self.$label   = self.$submit.find('[data-auth-submit-label]').first();
            self.$spinner = self.$submit.find('[data-auth-spinner]').first();

            if (self.$label.length) {
                self.originalLabel = self.$label.text();
            }

            $el.addClass('auth-form auth-form-' + self.action);
            $el.attr('novalidate', 'novalidate');

            return this;
        }

        events() {
            const self = this;
            const $el  = self.$el;
            const ns   = '.' + self._uid;

            // Form submit
            $el.on('submit' + ns, function (e) {
                if (!self.validate()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    self._toastError(self.options.errorMessage ||
                        $el.data('auth-error-msg') ||
                        'Please correct the highlighted fields.');
                    return false;
                }

                $el.trigger('auth:submit', [self, self._collect()]);

                if (self.options.ajax) {
                    e.preventDefault();
                    self._submitAjax();
                    return false;
                }

                self.setBusy(true);
            });

            // Live validation on blur / change
            self.$inputs.on('blur' + ns + ' change' + ns, function () {
                self._validateField($(this));
            });

            // Re-validate on input once a field has been marked invalid
            self.$inputs.on('input' + ns, function () {
                const $i = $(this);
                if ($i.hasClass('is-invalid')) {
                    self._validateField($i);
                }
            });

            // Password strength meter — live update
            $el.find('[data-auth-strength]').on('input' + ns, function () {
                self._updateStrength($(this));
            });

            // Password toggle (Show / Hide)
            $el.on('click' + ns, '[data-auth-toggle-password]', function (e) {
                e.preventDefault();
                self._togglePassword($(this));
            });

            // Caps Lock warning on password inputs
            $el.find('input[type="password"]').on('keyup' + ns, function (e) {
                const caps = e.originalEvent && typeof e.originalEvent.getModifierState === 'function'
                    ? e.originalEvent.getModifierState('CapsLock')
                    : false;
                const $field = $(this).closest('[data-auth-field]');
                $field.find('[data-auth-capslock]').toggleClass('d-none', !caps);
            });

            return this;
        }

        // Public API 
        validate() {
            const self = this;
            let valid = true;

            self.$inputs.each(function () {
                if (!self._validateField($(this))) {
                    valid = false;
                }
            });

            self.$el.trigger('auth:validate', [self, valid]);
            return valid;
        }

        reset() {
            const self = this;
            self.$inputs
                .removeClass('is-invalid is-valid')
                .closest('[data-auth-field]')
                .find('[data-auth-feedback]').text('');
            return self;
        }

        setBusy(busy) {
            const self = this;
            self.busy = !!busy;

            if (!self.$submit.length) return self;

            self.$submit.prop('disabled', self.busy);

            if (self.$spinner.length) {
                self.$spinner.toggleClass('d-none', !self.busy);
            }

            if (self.$label.length) {
                self.$label.text(self.busy
                    ? (self.options.busyLabel || 'Working...')
                    : self.originalLabel
                );
            }

            return self;
        }

        destroy() {
            const self = this;
            const ns   = '.' + self._uid;

            self.$el.off(ns);
            self.$inputs.off(ns);
            self.$el.find('[data-auth-strength]').off(ns);
            self.$el.find('input[type="password"]').off(ns);
            self.$el.removeClass('auth-form auth-form-' + self.action);
            self.$el.removeData(instanceName);

            return self;
        }

        // Internals
        _validateField($input) {
            const self     = this;
            const $field   = $input.closest('[data-auth-field]');
            const $fb      = $field.find('[data-auth-feedback]').first();
            const val      = ($input.val() || '').toString();
            const type     = ($input.attr('type') || 'text').toLowerCase();
            const required = $input.prop('required');

            let error = '';

            if (required && !val.trim()) {
                error = self.options.messages.required;
            }
            else if (val && type === 'email' && !EMAIL_RX.test(val)) {
                error = self.options.messages.email;
            }
            else if (val && $input.attr('minlength')) {
                const min = parseInt($input.attr('minlength'), 10);
                if (val.length < min) {
                    error = self.options.messages.minlength.replace('%s', min);
                }
            }
            else if (val && $input.attr('pattern')) {
                try {
                    if (!new RegExp('^(?:' + $input.attr('pattern') + ')$').test(val)) {
                        error = self.options.messages.pattern;
                    }
                } catch (e) { /* malformed pattern — skip */ }
            }
            else if (val && $input.data('auth-match')) {
                const target = $input.data('auth-match');
                const $other = self.$el.find(target);
                if ($other.length && val !== ($other.val() || '').toString()) {
                    error = self.options.messages.match;
                }
            }

            if (error) {
                $input.removeClass('is-valid').addClass('is-invalid');
                if ($fb.length) $fb.text(error);
                return false;
            }

            $input.removeClass('is-invalid');
            if (val.trim()) $input.addClass('is-valid');
            if ($fb.length) $fb.text('');
            return true;
        }

        _updateStrength($input) {
            const val   = ($input.val() || '').toString();
            const score = scorePassword(val);
            const $field = $input.closest('[data-auth-field]');
            const $meter = $field.find('[data-auth-strength-meter]').first();

            if (!$meter.length) return;

            // Lazy-construct the 5 bar segments
            if (!$meter.children().length) {
                const bars = [0, 1, 2, 3, 4]
                    .map(() => '<span class="auth-strength-bar"></span>')
                    .join('');
                $meter
                    .addClass('auth-strength')
                    .html(bars + '<span class="auth-strength-label"></span>');
            }

            const $bars  = $meter.children('.auth-strength-bar');
            const $label = $meter.children('.auth-strength-label');

            $bars.each(function (i) {
                $(this)
                    .removeClass('bg-danger bg-warning bg-info bg-success')
                    .toggleClass(STRENGTH_CLASSES[score], i <= score && val.length > 0);
            });

            $label.text(val.length ? STRENGTH_LABELS[score] : '');
        }

        _togglePassword($btn) {
            const $field = $btn.closest('[data-auth-field]');
            const $pw    = $field.find('input').filter(function () {
                const t = ($(this).attr('type') || '').toLowerCase();
                return t === 'password' || t === 'text';
            }).filter('[data-auth-strength], [name*="password"]').first();

            if (!$pw.length) return;

            const isHidden = $pw.attr('type') === 'password';
            $pw.attr('type', isHidden ? 'text' : 'password');
            $btn.text(isHidden
                ? (this.options.hidePasswordLabel || 'Hide')
                : (this.options.showPasswordLabel || 'Show')
            );
            $btn.attr('aria-pressed', isHidden ? 'true' : 'false');
        }

        _collect() {
            const data = {};
            this.$el.find('input, select, textarea').each(function () {
                const $i = $(this);
                const name = $i.attr('name');
                if (!name) return;
                const type = ($i.attr('type') || '').toLowerCase();
                if ((type === 'checkbox' || type === 'radio') && !$i.prop('checked')) return;
                data[name] = $i.val();
            });
            return data;
        }

        _submitAjax() {
            const self = this;
            const $el  = self.$el;
            const url  = $el.attr('action') || window.location.href;

            self.setBusy(true);

            $.ajax({
                url:      url,
                method:   ($el.attr('method') || 'POST').toUpperCase(),
                data:     $el.serialize(),
                dataType: 'json',
                headers:  { 'X-Requested-With': 'XMLHttpRequest' },
            })
            .done(function (resp) {
                const ok = resp && (resp.success === true || resp.success === 'true');

                if (ok) {
                    self._toastSuccess(resp.message || $el.data('auth-success-msg') || self.options.successMessage);
                    $el.trigger('auth:success', [self, resp]);

                    const redirect = resp.redirect || $el.data('auth-redirect') || self.options.redirect;
                    if (redirect) {
                        setTimeout(() => { window.location.href = redirect; }, 600);
                    } else {
                        self.setBusy(false);
                    }
                    return;
                }

                // Server reported failure — paint field errors if provided
                if (resp && resp.errors && typeof resp.errors === 'object') {
                    Object.keys(resp.errors).forEach(name => {
                        const $i = $el.find('[name="' + name + '"]').first();
                        if (!$i.length) return;
                        $i.removeClass('is-valid').addClass('is-invalid');
                        const $fb = $i.closest('[data-auth-field]').find('[data-auth-feedback]').first();
                        if ($fb.length) $fb.text(resp.errors[name]);
                    });
                }

                self._toastError((resp && resp.message) || self.options.errorMessage);
                $el.trigger('auth:error', [self, resp]);
                self.setBusy(false);
            })
            .fail(function (xhr) {
                const msg = (xhr && xhr.responseJSON && xhr.responseJSON.message)
                    || self.options.networkErrorMessage;
                self._toastError(msg);
                $el.trigger('auth:error', [self, { network: true, status: xhr.status }]);
                self.setBusy(false);
            });
        }

        _toastSuccess(body) {
            if (!this.options.toasts || !body) return;
            if (themestrap && themestrap.PluginToast) {
                themestrap.PluginToast.show({
                    title: this.options.toastSuccessTitle,
                    body:  body,
                    type:  'success',
                });
            }
        }

        _toastError(body) {
            if (!this.options.toasts || !body) return;
            if (themestrap && themestrap.PluginToast) {
                themestrap.PluginToast.show({
                    title: this.options.toastErrorTitle,
                    body:  body,
                    type:  'danger',
                });
            }
        }
    }

    PluginAuth.defaults = {
        // Submission
        ajax:                false,    // when true, posts via XHR and expects JSON
        redirect:            '',       // URL to redirect to after AJAX success

        // Feedback
        toasts:              true,     // emit PluginToast on success / error
        toastSuccessTitle:   'Success',
        toastErrorTitle:     'Sorry',
        successMessage:      '',
        errorMessage:        'Please check the form for errors.',
        networkErrorMessage: 'Could not reach the server. Please try again.',

        // UI labels
        busyLabel:           'Working...',
        showPasswordLabel:   'Show',
        hidePasswordLabel:   'Hide',

        // Validation messages
        messages: {
            required:  'This field is required.',
            email:     'Please enter a valid email address.',
            minlength: 'Must be at least %s characters.',
            pattern:   'Invalid format.',
            match:     'Values do not match.',
        },
    };

    $.extend(themestrap, { PluginAuth });

    $.fn.themestrapPluginAuth = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginAuth($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
