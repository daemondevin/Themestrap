// Validation
(((themestrap = {}, $) => {
    $.extend(themestrap, {

		PluginValidation: {

			defaults: {
				formClass: 'needs-validation',
				validator: {
					highlight(element) {
						$(element)
							.addClass('is-invalid')
							.removeClass('is-valid')
							.parent()
							.removeClass('has-success')
							.addClass('has-danger');
					},
					success(label, element) {
						$(element)
							.removeClass('is-invalid')
							.addClass('is-valid')
							.parent()
							.removeClass('has-danger')
							.addClass('has-success')
							.find('label.error')
							.remove();
					},
					errorPlacement(error, element) {
						if (element.attr('type') == 'radio' || element.attr('type') == 'checkbox') {
							error.appendTo(element.parent().parent());
						} else {
							error.insertAfter(element);
						}
					}
				}
			},

			initialize(opts) {
				initialized = true;

				this
					.setOptions(opts)
					.build();

				return this;
			},

			setOptions(opts) {
				this.options = $.extend(true, {}, this.defaults, opts);

				return this;
			},

			build() {
				const self = this;

				if (!($.isFunction($.validator))) {
					return this;
				}

				self.setMessageGroups();

				$.validator.setDefaults(self.options.validator);

				$('.' + self.options.formClass).validate();

				return this;
			},

			setMessageGroups() {

				$('.checkbox-group[data-msg-required], .radio-group[data-msg-required]').each(function() {
					const message = $(this).data('msg-required');
					$(this).find('input').attr('data-msg-required', message);
				});

			}

		}

	});
})).apply(this, [window.themestrap, jQuery]);
