// Scrollable
(((themestrap = {}, $) => {
    const instanceName = '__scrollable';

    class PluginScrollable {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        static updateModals() {
            PluginScrollable.updateBootstrapModal();
        }

        static updateBootstrapModal() {
            let updateBoostrapModal;

            updateBoostrapModal = typeof $.fn.modal !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor.prototype !== 'undefined';
            updateBoostrapModal = updateBoostrapModal && typeof $.fn.modal.Constructor.prototype.enforceFocus !== 'undefined';

            if ( !updateBoostrapModal ) {
                return false;
            }

            const originalFocus = $.fn.modal.Constructor.prototype.enforceFocus;
            $.fn.modal.Constructor.prototype.enforceFocus = function() {
                originalFocus.apply( this );

                const $scrollable = this.$element.find('.scrollable');
                if ( $scrollable ) {
                    if ( $.isFunction($.fn['themestrapPluginScrollable'])  ) {
                        $scrollable.themestrapPluginScrollable();
                    }

                    if ( $.isFunction($.fn['nanoScroller']) ) {
                        $scrollable.nanoScroller();
                    }
                }
            };
        }

        initialize($el, opts) {
			if ( $el.data( instanceName ) ) {
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
			this.$el.data(instanceName, this);

			return this;
		}

        setOptions(opts) {
			this.options = $.extend(true, {}, PluginScrollable.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			this.options.wrapper.nanoScroller(this.options);

			return this;
		}
    }

    PluginScrollable.defaults = {
		contentClass: 'scrollable-content',
		paneClass: 'scrollable-pane',
		sliderClass: 'scrollable-slider',
		alwaysVisible: true,
		preventPageScrolling: true
	};

    // expose to scope
    $.extend(themestrap, {
		PluginScrollable
	});

    // jquery plugin
    $.fn.themestrapPluginScrollable = function(opts) {
		return this.each(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginScrollable($this, opts);
			}

		});
	};

    $(() => {
		PluginScrollable.updateModals();
	});
})).apply(this, [window.themestrap, jQuery]);
