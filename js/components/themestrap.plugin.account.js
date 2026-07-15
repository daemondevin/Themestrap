// Account
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Account: {

			defaults: {
				wrapper: $('#headerAccount')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.events();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			events() {
				const self = this;

				$(window).on('load', () => {
					$(document).ready(() => {
						setTimeout(() => {

							self.$wrapper.find('input').on('focus', () => {
								self.$wrapper.addClass('open');

								$(document).mouseup(({target}) => {
									if (!self.$wrapper.is(target) && self.$wrapper.has(target).length === 0) {
										self.$wrapper.removeClass('open');
									}
								});
							});

						}, 1500);
					});
				});

				$('#headerSignUp').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signup').removeClass('signin').removeClass('recover');
					self.$wrapper.find('.signup-form input:first').focus();
				});

				$('#headerSignIn').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signin').removeClass('signup').removeClass('recover');
					self.$wrapper.find('.signin-form input:first').focus();
				});

				$('#headerRecover').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('recover').removeClass('signup').removeClass('signin');
					self.$wrapper.find('.recover-form input:first').focus();
				});

				$('#headerRecoverCancel').on('click', e => {
					e.preventDefault();
					self.$wrapper.addClass('signin').removeClass('signup').removeClass('recover');
					self.$wrapper.find('.signin-form input:first').focus();
				});
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
