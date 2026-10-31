// Rating
(((themestrap = {}, $) => {
    const instanceName = '__rating';

    class PluginRating {
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
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const sizeClasses = ['xs', 'sm', 'md', 'lg', 'xl'];
            let detectedSize = null;

            sizeClasses.forEach(s => {
                if (this.$el.hasClass('rating-' + s)) detectedSize = s;
            });

            this.options = $.extend(true, {}, PluginRating.defaults, { size: detectedSize }, opts, {
                wrapper: this.$el
            });
            return this;
        }

        _iconHtml(icon) {
            const str = String(icon).trim();

            if (str.startsWith('<svg')) {
                if (this.options.currentColor) {
                    // Inline SVG: sanitize hardcoded fill/stroke colors to currentColor,
                    // leaving fill="none" and stroke="none" untouched.
                    const sanitized = str
                        .replace(/\bfill\s*=\s*"(?!none")[^"]*"/gi, 'fill="currentColor"')
                        .replace(/\bstroke\s*=\s*"(?!none")[^"]*"/gi, 'stroke="currentColor"')
                        .replace(/\bfill\s*:\s*(?!none\b)[^;"]*/gi, 'fill:currentColor')
                        .replace(/\bstroke\s*:\s*(?!none\b)[^;"]*/gi, 'stroke:currentColor');
                    return `<span class="icon svg-icon">${sanitized}</span>`;
                } else {
                    return `<span class="icon svg-icon">${str}</span>`;
                }
            }

            // Any other markup (an <img>, an emoji in a <span>) is wrapped as is
            if (str.startsWith('<')) {
                return `<span class="icon">${str}</span>`;
            }

            // Otherwise it is a class string: Font Awesome, Bootstrap Icons, or your own.
            // Only Font Awesome gets the fa-{size} modifier.
            const classes = str.replace(/["<>]/g, '');
            const isFa    = /(^|\s)fa[-\w]*/.test(classes);
            const size    = (isFa && this.options.size && this.options.size !== 'md') ? ` fa-${this.options.size}` : '';
            return `<i class="${classes}${size} icon" aria-hidden="true"></i>`;
        }

        build() {
            const self = this;
            const o = self.options;

            self.$icons = self.$el.find('.icon');

            if (!self.$icons.length) {
                let html = '';
                for (let i = 1; i <= o.maxRating; i++) {
                    html += self._iconHtml(o.icon);
                }
                self.$el.html(html);
                self.$icons = self.$el.find('.icon');
            }

            self.disabled = !o.interactive;
            self.$el.toggleClass('disabled', self.disabled);

            self.setRating(o.initialRating, true);

            return this;
        }

        events() {
            const self = this;

            // Handlers are bound once and stay bound; they ignore input while disabled.
            self.$el.off('.rating')
                .on('mouseenter.rating', '.icon', function() {
                    if (self.disabled) return;
                    const $active = $(this);
                    $active.nextAll().removeClass('selected');
                    self.$el.addClass('selected');
                    $active.addClass('selected').prevAll().addClass('selected');
                })
                .on('mouseleave.rating', '.icon', function() {
                    self.$el.removeClass('selected');
                    self.$icons.removeClass('selected');
                })
                .on('click.rating', '.icon', function() {
                    if (self.disabled) return;
                    const o = self.options;
                    const current = self.getRating();
                    const rating = self.$icons.index($(this)) + 1;
                    const canClear = o.clearable === 'auto' ? self.$icons.length === 1 : o.clearable;

                    if (canClear && current === rating) {
                        self.clearRating();
                    } else {
                        self.setRating(rating);
                    }
                });

            return this;
        }

        setRating(rating, silent) {
            const self = this;
            const ratingIndex = Math.floor(rating - 1 >= 0 ? rating - 1 : 0);
            const $activeIcon = self.$icons.eq(ratingIndex);
            const $partialIcon = rating <= 1 ? $activeIcon : $activeIcon.next();
            const filledPct = (rating % 1) * 100;

            self._rating = Math.max(0, Number(rating) || 0);

            self.$el.removeClass('selected');
            self.$icons.removeClass('selected active partial');

            if (rating > 0) {
                $activeIcon.prevAll().addBack().addClass('active');

                if ($activeIcon.next().length && rating % 1 !== 0) {
                    $partialIcon.addClass('partial active').css('--full', filledPct + '%');

                    if ($partialIcon.css('backgroundColor') === 'transparent') {
                        $partialIcon.removeClass('partial active');
                    }
                }
            }

            if (!silent && typeof self.options.onRate === 'function') {
                self.options.onRate.call(self.$el[0], rating);
            }

            return this;
        }

        getRating() {
            return this._rating || 0;
        }

        clearRating() {
            return this.setRating(0);
        }

        enable() {
            this.disabled = false;
            this.$el.removeClass('disabled');
            return this;
        }

        disable() {
            this.disabled = true;
            this.$el.removeClass('selected').addClass('disabled');
            this.$icons.removeClass('selected');
            return this;
        }

        destroy() {
            this.$el.off('.rating').removeData(instanceName);
            return this;
        }
    }

    PluginRating.defaults = {
        icon:          'fa-solid fa-star',
        currentColor:  false,
        initialRating: 0,
        interactive:   true,
        maxRating:     5,
        clearable:     'auto',
        size:          'md',
        onRate:        function(rating) {}
    };

    $.extend(themestrap, { 
        PluginRating 
    });
    
    $.fn.themestrapPluginRating = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
			} else {
				return new PluginRating($this, opts);
			}
        });
    };
})).apply(this, [window.themestrap, jQuery]);
