(((themestrap = {}, $) => {
    const instanceName = '__countdown';

    class PluginCountdown {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
			if ($el.data(instanceName)) {
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
			this.options = $.extend(true, {}, PluginCountdown.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

        build() {
			if (!($.isFunction($.fn.countTo))) {
				return this;
			}

			const self = this, $el = this.options.wrapper, numberClass = ( self.options.numberClass ) ? ' ' + self.options.numberClass : '', wrapperClass = ( self.options.wrapperClass ) ? ' ' + self.options.wrapperClass : '';

			if( self.options.uppercase ) {
				$el.countdown(self.options.date).on('update.countdown', function(event) {
					const $this = $(this).html(event.strftime(self.options.insertHTMLbefore
						+ '<span class="days'+ wrapperClass +'"><span class="'+ numberClass +'">%D</span> '+ self.options.textDay +'</span> '
						+ '<span class="hours'+ wrapperClass +'"><span class="'+ numberClass +'">%H</span> '+ self.options.textHour +'</span> '
						+ '<span class="minutes'+ wrapperClass +'"><span class="'+ numberClass +'">%M</span> '+ self.options.textMin +'</span> '
						+ '<span class="seconds'+ wrapperClass +'"><span class="'+ numberClass +'">%S</span> '+ self.options.textSec +'</span> '
						+ self.options.insertHTMLafter
					));
				});
			} else {
				$el.countdown(self.options.date).on('update.countdown', function(event) {
					const $this = $(this).html(event.strftime(self.options.insertHTMLbefore
						+ '<span class="days'+ wrapperClass +'"><span class="'+ numberClass +'">%D</span> '+ self.options.textDay +'</span> '
						+ '<span class="hours'+ wrapperClass +'"><span class="'+ numberClass +'">%H</span> '+ self.options.textHour +'</span> '
						+ '<span class="minutes'+ wrapperClass +'"><span class="'+ numberClass +'">%M</span> '+ self.options.textMin +'</span> '
						+ '<span class="seconds'+ wrapperClass +'"><span class="'+ numberClass +'">%S</span> '+ self.options.textSec +'</span> '
						+ self.options.insertHTMLafter
					));
				});
			}

			return this;
		}
    }

    PluginCountdown.defaults = {
		date: '2030/06/10 12:00:00',
		textDay: 'DAYS',
		textHour: 'HRS',
		textMin: 'MIN',
		textSec: 'SEC',
		uppercase: true,
		numberClass: '',
		wrapperClass: '',
		insertHTMLbefore: '',
		insertHTMLafter: ''
	};

    // expose to scope
    $.extend(themestrap, {
		PluginCountdown
	});

    // jquery plugin
    $.fn.themestrapPluginCountdown = function(opts) {
		return this.map(function() {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			} else {
				return new PluginCountdown($this, opts);
			}

		});
	}
})).apply(this, [window.themestrap, jQuery]);
