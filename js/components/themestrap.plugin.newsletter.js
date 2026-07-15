// Newsletter
(((themestrap = {}, $) => {
    let initialized = false;

    $.extend(themestrap, {

		Newsletter: {

			defaults: {
				wrapper: $('#newsletterForm')
			},

			initialize($wrapper, opts) {
				if (initialized) {
					return this;
				}

				initialized = true;
				this.$wrapper = ($wrapper || this.defaults.wrapper);

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts, themestrap.fn.getOptions(this.$wrapper.data('plugin-options')));

				return this;
			},

			build() {
				if (!($.isFunction($.fn.validate))) {
					return this;
				}

				const self = this, $email = self.$wrapper.find('#newsletterEmail'), $success = $('#newsletterSuccess'), $error = $('#newsletterError');

				self.$wrapper.validate({
					submitHandler(form) {

						$.ajax({
							type: 'POST',
							url: self.$wrapper.attr('action'),
							data: {
								'email': $email.val()
							},
							dataType: 'json',
							success({response, message}) {
								if (response == 'success') {

									$success.removeClass('d-none');
									$error.addClass('d-none');

									$email
										.val('')
										.blur()
										.closest('.control-group')
										.removeClass('success')
										.removeClass('error');

								} else {

									$error.html(message);
									$error.removeClass('d-none');
									$success.addClass('d-none');

									$email
										.blur()
										.closest('.control-group')
										.removeClass('success')
										.addClass('error');

								}
							}
						});

					},
					rules: {
						newsletterEmail: {
							required: true,
							email: true
						}
					},
					errorPlacement(error, element) {

					}
				});

				return this;
			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
