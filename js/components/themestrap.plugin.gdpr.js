// GDPR
(((themestrap = {}, $) => {

	function _getCookie(name) {
		const match = document.cookie.match(
			new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
		);
		return match ? decodeURIComponent(match[1]) : null;
	}

	function _setCookie(name, value, days) {
		const expires = new Date(Date.now() + days * 864e5).toUTCString();
		document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
	}

	function _removeCookie(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
	}

	const STYLE_ID = 'ts-gdpr-styles';
	let _styleRefs = 0;

	const CSS = [
		'[data-plugin-gdpr].gdpr-init{transition:none!important}',
		'[data-plugin-gdpr]{position:fixed;inset-block-end:0;inset-inline:0;z-index:1040;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.625rem;padding:var(--ts-gdpr-bar-py,.875rem) var(--ts-gdpr-bar-px,1.5rem);background:var(--ts-gdpr-bar-bg,#0a1929);color:var(--ts-gdpr-bar-color,#c8d8e8);border-top:2px solid var(--ts-gdpr-bar-accent,#2ab8c8);box-shadow:0 -4px 20px rgba(0,0,0,.28);transform:translateY(110%);transition:transform .35s ease,opacity .35s ease;opacity:0;pointer-events:none}',
		'[data-plugin-gdpr].show{transform:translateY(0);opacity:1;pointer-events:auto}',
		'[data-plugin-gdpr].removing{transform:translateY(110%);opacity:0;pointer-events:none}',
		'.gdpr-preferences-popup{position:fixed;inset:0;z-index:1050;display:flex;align-items:center;justify-content:center;padding:1.25rem;background:rgba(0,0,0,.55);opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease}',
		'.gdpr-preferences-popup.show{opacity:1;visibility:visible}',
		'.gdpr-preferences-popup-content{position:relative;background:var(--ts-gdpr-popup-bg,#fff);color:var(--ts-gdpr-popup-color,#1a2332);border-radius:var(--ts-gdpr-popup-radius,.75rem);padding:var(--ts-gdpr-popup-py,2rem) var(--ts-gdpr-popup-px,2rem);max-width:var(--ts-gdpr-popup-max-w,520px);width:100%;max-height:80dvh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}',
		'[data-plugin-gdpr-wrapper]{opacity:0;transition:opacity var(--ts-gdpr-wrapper-fade,400ms) ease}',
		'[data-plugin-gdpr-wrapper].show{opacity:1}',
	].join('\n');

	function _injectStyles() {
		if (_styleRefs++ === 0 && !document.getElementById(STYLE_ID)) {
			const style = document.createElement('style');
			style.id    = STYLE_ID;
			style.textContent = CSS;
			document.head.appendChild(style);
		}
	}

	function _removeStyles() {
		if (--_styleRefs <= 0) {
			_styleRefs = 0;
			const el = document.getElementById(STYLE_ID);
			if (el) el.parentNode.removeChild(el);
		}
	}

	const gdprInstanceName = '__gdpr';

	class PluginGDPR {
		constructor($el, opts) {
			return this.initialize($el, opts);
		}

		initialize($el, opts) {
			if ($el.data(gdprInstanceName)) {
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
			this.$el.data(gdprInstanceName, this);
			return this;
		}

		setOptions(opts) {
			this.options = $.extend(true, {}, PluginGDPR.defaults, opts, {
				wrapper: this.$el
			});
			return this;
		}

		build() {
			const self = this;

			// Add sentinel before injecting styles so the transition-suppression
			// rule applies on first paint, preventing the initial hide from
			// animating out of the element's pre-plugin visible state.
			self.options.wrapper.addClass('gdpr-init');
			_injectStyles();
			requestAnimationFrame(() => self.options.wrapper.removeClass('gdpr-init'));

			if (!_getCookie('themestrap-privacy-bar')) {
				setTimeout(() => {
					self.options.wrapper.addClass('show');
				}, self.options.cookieBarShowDelay);
			}

			// Reflect any previously saved preferences back onto checkboxes
			const prefsRaw = _getCookie('themestrap-gdpr-preferences');
			if (prefsRaw) {
				prefsRaw.split(',').forEach(val => {
					const $input = $('input[value="' + val + '"]');
					if ($input.is(':checkbox')) {
						$input.prop('checked', true);
					}
				});
			}

			return this;
		}

		events() {
			const self = this;

			// Accept all — tick every input then submit
			$(document).on('click.gdpr', '.gdpr-agree-trigger', e => {
				e.preventDefault();
				$('.gdpr-preferences-form .gdpr-input').each(function() {
					if ($(this).is(':checkbox') || $(this).is(':hidden')) {
						$(this).prop('checked', true);
					}
				});
				$('.gdpr-preferences-form').trigger('submit');
			});

			// Open popup from the bar
			$(document).on('click.gdpr', '.gdpr-preferences-trigger', e => {
				e.preventDefault();
				$('.gdpr-preferences-popup').addClass('show');
			});

			// Toggle popup from anywhere else (e.g. footer link)
			$(document).on('click.gdpr', '.gdpr-open-preferences', e => {
				e.preventDefault();
				$('.gdpr-preferences-popup').toggleClass('show');
			});

			// Close popup via its own button
			$(document).on('click.gdpr', '.gdpr-close-popup', e => {
				e.preventDefault();
				$('.gdpr-preferences-popup').removeClass('show');
			});

			// Close popup by clicking the backdrop
			$(document).on('click.gdpr', '.gdpr-preferences-popup', ({ target }) => {
				if (!$(target).closest('.gdpr-preferences-popup-content').length) {
					$('.gdpr-preferences-popup').removeClass('show');
				}
			});

			// Close popup on Escape
			$(document).on('keydown.gdpr', e => {
				if (e.key === 'Escape') {
					$('.gdpr-preferences-popup').removeClass('show');
				}
			});

			// Save preferences
			$(document).on('submit.gdpr', '.gdpr-preferences-form', function(e) {
				e.preventDefault();

				const $form = $(this);
				const $btn  = $form.find('button[type="submit"]');

				$btn.text('SAVING\u2026').prop('disabled', true);

				const formData = [];
				$form.find('.gdpr-input').each(function() {
					if (($(this).is(':checkbox') && $(this).is(':checked')) || $(this).is(':hidden')) {
						formData.push($(this).val());
					}
				});

				const hadPrefs = !!_getCookie('themestrap-gdpr-preferences');

				_setCookie('themestrap-privacy-bar', 'true', self.options.expires);

				setTimeout(() => {
					$btn.text('SAVED!').removeClass('btn-primary').addClass('btn-success');

					setTimeout(() => {
						$('.gdpr-preferences-popup').removeClass('show');
						self.removeCookieBar();

						$btn.text('SAVE PREFERENCES')
							.removeClass('btn-success')
							.addClass('btn-primary')
							.prop('disabled', false);

						_setCookie('themestrap-gdpr-preferences', formData.join(','), self.options.expires);

						window.dispatchEvent(new CustomEvent('ts.gdpr.consent', {
							detail: { categories: formData }
						}));

						if (hadPrefs) {
							location.reload();
						} else {
							self._reinitWrappers();
						}

					}, 500);
				}, 1000);
			});

			// Clear all consent cookies and reload
			$(document).on('click.gdpr', '.gdpr-reset-cookies', e => {
				e.preventDefault();
				self.clearCookies();
				location.reload();
			});

			return this;
		}

		_reinitWrappers() {
			if (typeof $.fn['themestrapPluginGDPRWrapper'] !== 'function') return;
			if (!$('[data-plugin-gdpr-wrapper]').length) return;

			$('[data-plugin-gdpr-wrapper]:not(.manual)').each(function() {
				const $this = $(this);
				$this.removeData('__gdprwrapper');
				const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
				$this.themestrapPluginGDPRWrapper(opts);
			});
		}

		removeCookieBar() {
			this.options.wrapper
				.addClass('removing')
				.one('transitionend.gdpr', () => {
					this.options.wrapper.removeClass('show removing');
				});
			return this;
		}

		clearCookies() {
			_removeCookie('themestrap-privacy-bar');
			_removeCookie('themestrap-gdpr-preferences');
			return this;
		}

		destroy() {
			$(document).off('.gdpr');
			this.options.wrapper.off('.gdpr').removeClass('show removing');
			this.$el.removeData(gdprInstanceName);
			_removeStyles();
			return this;
		}
	}

	PluginGDPR.defaults = {
		cookieBarShowDelay: 3000,
		expires: 365
	};

	const wrapperInstanceName = '__gdprwrapper';

	class PluginGDPRWrapper {
		constructor($el, opts) {
			return this.initialize($el, opts);
		}

		initialize($el, opts) {
			if ($el.data(wrapperInstanceName)) {
				return this;
			}

			this.$el = $el;

			this
				.setData()
				.setOptions(opts)
				.build();

			return this;
		}

		setData() {
			this.$el.data(wrapperInstanceName, this);
			return this;
		}

		setOptions(opts) {
			this.options = $.extend(true, {}, PluginGDPRWrapper.defaults, opts, {
				wrapper: this.$el
			});
			return this;
		}

		build() {
			const self = this;

			_injectStyles();

			const { ajaxURL, checkCookie, loadDelay } = self.options;
			const prefsRaw     = _getCookie('themestrap-gdpr-preferences');
			const consentGiven = !checkCookie || (!!prefsRaw && prefsRaw.split(',').includes(checkCookie));

			if (consentGiven && ajaxURL) {
				$.ajax({
					url: ajaxURL,
					cache: false,
					complete({ responseText }) {
						setTimeout(() => {
							self.options.wrapper.html(responseText).addClass('show');
						}, loadDelay);
					}
				});
			} else {
				self.options.wrapper.addClass('show');
			}

			return this;
		}

		destroy() {
			this.options.wrapper.removeClass('show').empty();
			this.$el.removeData(wrapperInstanceName);
			_removeStyles();
			return this;
		}
	}

	PluginGDPRWrapper.defaults = {
		ajaxURL:     '',
		checkCookie: '',
		loadDelay:   1000
	};

	$.extend(themestrap, {
		PluginGDPR,
		PluginGDPRWrapper
	});
	
	$.fn.themestrapPluginGDPR = function(opts) {
		return this.map(function() {
			const $this = $(this);
			if ($this.data(gdprInstanceName)) {
				return $this.data(gdprInstanceName);
			} else {
				return new PluginGDPR($this, opts);
			}
		});
	};

	$.fn.themestrapPluginGDPRWrapper = function(opts) {
		return this.map(function() {
			const $this = $(this);
			if ($this.data(wrapperInstanceName)) {
				return $this.data(wrapperInstanceName);
			} else {
				return new PluginGDPRWrapper($this, opts);
			}
		});
	};

})).apply(this, [window.themestrap, jQuery]);
