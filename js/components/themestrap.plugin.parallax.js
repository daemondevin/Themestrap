// Parallax
(((themestrap = {}, $) => {
    const instanceName = '__parallax';
    const STYLE_ID     = 'themestrap-parallax-styles';

    const isMobile = () => /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const isVisible = ($el) => {
        const rect = $el[0].getBoundingClientRect();
        const wh   = window.innerHeight || document.documentElement.clientHeight;
        return rect.bottom >= 0 && rect.top <= wh;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.parallax-background{will-change:transform;background-repeat:no-repeat;background-size:cover;}',
            '.parallax-disabled .parallax-background{transform:none!important;}',
        ].join('');
        document.head.appendChild(style);
    };

    class PluginParallax {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el       = $el;
            this._handlers = {};   // store named handlers for clean destroy()

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
            this.options = $.extend(true, {}, PluginParallax.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self    = this;
            const $window = $(window);

            injectStyles();

            /* MODE 1: Mouse parallax */
            if (self.options.mouseParallax) {
                const onMouseMove = ({ clientX, clientY }) => {
                    $('.parallax-mouse-object', self.options.wrapper).each(function () {
                        const mv = parseFloat($(this).attr('data-value')) || 1;
                        const x  = (clientX * mv) / 250;
                        const y  = (clientY * mv) / 250;
                        $(this).css('transform', `translateX(${x}px) translateY(${y}px)`);
                    });
                };
                self._handlers.mouseMove = onMouseMove;
                $window.on('mousemove.parallax', onMouseMove);
                return this;
            }

            /* MODE 2: Scroll-scrubbed CSS property */
            if (self.options.scrollableParallax && $window.width() > self.options.scrollableParallaxMinWidth) {
                const $sw = self.options.wrapper.find('.scrollable-parallax-wrapper');

                if ($sw.length) {
                    const unit = self.options.cssValueUnit || '';
                    let progress = (
                        $window.scrollTop() > (self.options.wrapper.offset().top + $window.height())
                    ) ? self.options.cssValueEnd : self.options.cssValueStart;

                    $sw.css({
                        'background-image'    : `url(${self.options.wrapper.data('image-src')})`,
                        'background-size'     : 'cover',
                        'background-position' : 'center',
                        'background-attachment': 'fixed',
                        'transition'          : `ease ${self.options.cssProperty} ${self.options.transitionDuration}`,
                    });
                    const startStyles = {};
                    startStyles[self.options.cssProperty] = progress + unit;
                    $sw.css(startStyles);

                    const onScroll = () => {
                        if (!isVisible(self.options.wrapper)) return;
                        const scrollTop     = $window.scrollTop();
                        const elOffset      = self.options.wrapper.offset().top;
                        const curOffset     = elOffset - scrollTop;
                        const scrollPercent = Math.abs((curOffset - $window.height()) / (self.options.startOffset || 7));

                        if (scrollPercent <= self.options.cssValueEnd && progress <= self.options.cssValueEnd) {
                            progress = self.options.cssValueStart + scrollPercent;
                        }
                        if (progress > self.options.cssValueEnd) progress = self.options.cssValueEnd;
                        if (progress < self.options.cssValueStart) progress = self.options.cssValueStart;

                        const styles = {};
                        styles[self.options.cssProperty] = progress + unit;
                        $sw.css(styles);
                    };

                    self._handlers.scroll = onScroll;
                    $window.on('scroll.parallax', onScroll);
                }

                return this;
            }

            /* MODE 3: Background-image parallax */
            const $bg = $('<div class="parallax-background"></div>');

            $bg.css({
                'background-image'  : `url(${self.options.wrapper.data('image-src')})`,
                'background-size'   : 'cover',
                'position'          : 'absolute',
                'top'               : 0,
                'left'              : 0,
                'width'             : '100%',
                'height'            : self.options.parallaxHeight,
            });

            if (self.options.parallaxScale) {
                $bg.css('transition', 'transform 500ms ease-out');
            }

            self.options.wrapper.prepend($bg);
            self.options.wrapper.css({ position: 'relative', overflow: 'hidden' });
            self.$bg = $bg;

            const isRTL = $('html[dir="rtl"]').length > 0;

            const tick = () => {
                const wTop    = $window.scrollTop();
                const elTop   = self.options.wrapper.offset().top;
                const yPos    = -(wTop - (elTop - 100)) / (self.options.speed + 2);
                const plxPos  = yPos < 0 ? Math.abs(yPos) : -Math.abs(yPos);
                const rotateY = isRTL ? ' rotateY(180deg)' : '';

                if (!self.options.parallaxScale) {
                    let offset = self.options.offset;
                    if (self.options.parallaxDirection === 'bottom') {
                        offset = 250;
                    }

                    let y = (plxPos - 50) + offset;
                    if (self.options.parallaxDirection === 'bottom') {
                        y = y < 0 ? Math.abs(y) : -Math.abs(y);
                    }

                    $bg.css({
                        'transform'              : `translate3d(0, ${y}px, 0)${rotateY}`,
                        'background-position-x'  : self.options.horizontalPosition,
                    });

                } else {
                    const curOffset     = elTop - wTop;
                    let scrollPercent   = Math.abs((curOffset - $window.height()) / (self.options.startOffset || 7));
                    scrollPercent       = Math.min(100, parseInt(scrollPercent, 10));
                    const currentScale  = (scrollPercent / 100) * 50;

                    const scaleVal = !self.options.parallaxScaleInvert
                        ? '1.' + String(currentScale).padStart(2, '0')
                        : '1.' + String(50 - currentScale).padStart(2, '0');

                    $bg.css('transform', `scale(${scaleVal}, ${scaleVal})`);
                }
            };

            const onScrollResize = () => {
                tick();
                self.options.wrapper.trigger('scroll.parallax');
            };

            self._handlers.scrollResize = onScrollResize;

            const mobile = isMobile();
            if (!mobile || self.options.enableOnMobile) {
                $window.on('scroll.parallax resize.parallax', onScrollResize);
                $window.trigger('scroll');
            } else {
                self.options.wrapper.addClass('parallax-disabled');
            }

            return this;
        }

        destroy() {
            const $window = $(window);
            $window.off('scroll.parallax resize.parallax mousemove.parallax');
            if (this.$bg) {
                this.$bg.remove();
                this.$bg = null;
            }
            this.options.wrapper.css({ position: '', overflow: '' });
            this.options.wrapper.removeClass('parallax-disabled');
            this.$el.removeData(instanceName);
            return this;
        }
    }

    PluginParallax.defaults = {
        speed                    : 1.5,
        horizontalPosition       : '50%',
        offset                   : 0,
        parallaxDirection        : 'top',
        parallaxHeight           : '180%',
        parallaxScale            : false,
        parallaxScaleInvert      : false,
        scrollableParallax       : false,
        scrollableParallaxMinWidth: 991,
        startOffset              : 7,
        transitionDuration       : '200ms',
        cssProperty              : 'width',
        cssValueStart            : 40,
        cssValueEnd              : 100,
        cssValueUnit             : 'vw',
        mouseParallax            : false,
        enableOnMobile           : true,
    };

    $.extend(themestrap, {
        PluginParallax,
    });

    $.fn.themestrapPluginParallax = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginParallax($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
