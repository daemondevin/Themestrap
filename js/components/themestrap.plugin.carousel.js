// Carousel
(((themestrap = {}, $) => {
    const instanceName = '__carousel';
    const STYLE_ID = 'ts-carousel-styles';

    class PluginCarousel {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el = $el;
            this.initialHTML = $el.html();
            this._uid = ++PluginCarousel._uidCounter;

            // Defer init until icon plugin has rendered its icons to prevent flicker
            if ($el.find('[data-icon]').get(0)) {
                const self = this;
                $(window).on('icon.rendered', function() {
                    if ($el.data(instanceName)) return;
                    setTimeout(() => {
                        self.setData().setOptions(opts).build().events();
                    }, 1000);
                });
                return this;
            }

            this.setData().setOptions(opts).build().events();
            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            PluginCarousel.instances++;
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginCarousel.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            // Lazy CSS injection — only once, ref-counted for destroy
            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style');
                style.id = STYLE_ID;
                style.textContent = PluginCarousel.css;
                document.head.appendChild(style);
            }

            const self = this;
            const $el = this.options.wrapper;
            const opts = this.options;

            // RTL: inherit from html[dir] when not explicitly set
            if ($('html').attr('dir') === 'rtl') opts.rtl = true;

            // Collect and count original items before mutating the DOM
            const $originalItems = $el.children();
            const itemCount = $originalItems.length;
            if (itemCount === 0) return this;

            this.itemCount = itemCount;
            this.currentIndex = 0;
            this.clonedBefore = 0;
            this.clonedAfter = 0;
            this.autoplayTimer = null;

            // Single-item shortcut: ignore responsive breakpoints
            if (opts.items === 1) opts.responsive = {};

            // Items beyond default 4: ensure a 1199px breakpoint entry
            if (opts.items > 4) {
                opts.responsive = $.extend(true, {}, opts.responsive, {
                    1199: { items: opts.items }
                });
            }

            // Resolve visible item count for the current viewport width
            this.getItemsCount = () => {
                const resp = opts.responsive;
                if (!resp || Object.keys(resp).length === 0) return Math.max(opts.items || 1, 1);
                const w = window.innerWidth;
                const bps = Object.keys(resp).map(Number).sort((a, b) => a - b);
                let count = Math.max(opts.items || 1, 1);
                for (const bp of bps) {
                    if (w >= bp && resp[bp].items !== undefined) count = resp[bp].items;
                }
                return Math.max(count, 1);
            };

            // Build stage structure
            const $stageOuter = $('<div class="owl-stage-outer"></div>');
            const $stage = $('<div class="owl-stage"></div>');
            $stageOuter.append($stage);

            // Wrap every original child in an .owl-item; keep a reference array for cloning
            const $realItems = [];
            $originalItems.each(function() {
                const $item = $('<div class="owl-item"></div>').append($(this).clone(true, true));
                $stage.append($item);
                $realItems.push($item[0]);
            });

            // Clone items for seamless looping
            if (opts.loop && itemCount > 1) {
                // Clone count: enough to cover one full page-worth of visible items
                const cloneCount = Math.min(Math.max(this.getItemsCount(), 2), itemCount);

                // Prepend clones of the tail of the real items (enables backward loop)
                for (let i = cloneCount - 1; i >= 0; i--) {
                    const idx = ((itemCount - cloneCount + i) % itemCount + itemCount) % itemCount;
                    $($realItems[idx]).clone(true, true).addClass('cloned').prependTo($stage);
                    this.clonedBefore++;
                }

                // Append clones of the head of the real items (enables forward loop)
                for (let i = 0; i < cloneCount; i++) {
                    $($realItems[i % itemCount]).clone(true, true).addClass('cloned').appendTo($stage);
                    this.clonedAfter++;
                }

                // Start positioned at the first real item
                this.currentIndex = this.clonedBefore;
            }

            // Build navigation
            const $nav = $('<div class="owl-nav"></div>');
            const $prev = $('<button type="button" role="button" class="owl-prev"></button>');
            const $next = $('<button type="button" role="button" class="owl-next"></button>');
            opts.rtl ? $nav.append($next).append($prev) : $nav.append($prev).append($next);

            // Build dots
            const $dots = $('<div class="owl-dots"></div>');
            for (let i = 0; i < itemCount; i++) {
                $dots.append($('<button type="button" role="button" class="owl-dot"><span></span></button>'));
            }

            // Replace carousel content with generated structure
            $el.empty().append($stageOuter).append($nav).append($dots);

            // Honour explicit nav/dots suppression
            if (opts.nav === false) $nav.addClass('disabled');
            if (opts.dots === false) $dots.addClass('disabled');

            // SVG arrow icons injected per-button for nav-svg-arrows-1
            if ($el.hasClass('nav-svg-arrows-1')) {
                const svg = '<svg version="1.1" viewBox="0 0 15.698 8.706" width="17" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><polygon stroke="#212121" stroke-width="0.1" fill="#212121" points="11.354,0 10.646,0.706 13.786,3.853 0,3.853 0,4.853 13.786,4.853 10.646,8 11.354,8.706 15.698,4.353"/></svg>';
                $prev.append(svg);
                $next.append(svg);
            }

            // Store DOM refs
            this.$stage = $stage;
            this.$stageOuter = $stageOuter;
            this.$nav = $nav;
            this.$prev = $prev;
            this.$next = $next;
            this.$dots = $dots;

            $el.addClass('owl-themestrap owl-drag');

            // Initial layout — no transition
            this._layout(false);

            // Mark as fully loaded
            $el.addClass('owl-loaded').removeClass('owl-loading');
            $el.css('height', 'auto');

            if ($el.prev().hasClass('owl-carousel-loader')) $el.prev().remove();

            if ($el.closest('.owl-carousel-wrapper').get(0)) {
                setTimeout(() => $el.closest('.owl-carousel-wrapper').css({ height: '' }), 500);
            }

            if ($el.hasClass('nav-outside')) self._handleNavOutside();

            self.navigationOffsets();
            self.carouselNavigate();

            if (opts.autoHeight) self._applyAutoHeight();
            if (opts.autoplay) self._startAutoplay();
            if ($el.attr('data-sync')) self._setupSync();
            if ($el.hasClass('carousel-center-active-item')) self._updateCenterActive();

            if ($el.find('[data-plugin-video-background]').get(0)) $(window).trigger('resize');

            return this;
        }

        // Measure stage, size all items, and position at currentIndex without animation
        _layout(animate) {
            const opts = this.options;
            const visCount = this.getItemsCount();
            const $allItems = this.$stage.children();
            const stageW = this.$stageOuter[0].offsetWidth;
            const itemW = stageW / visCount;

            $allItems.css({
                width: itemW + 'px',
                float: opts.rtl ? 'right' : 'left'
            });

            this.$stage.css({ width: ($allItems.length * itemW) + 'px' });
            this._moveTo(this.currentIndex, animate !== false);
        }

        // Apply a CSS transform to the stage for the given slide index
        _moveTo(index, animate) {
            const opts = this.options;
            const visCount = this.getItemsCount();
            const itemW = this.$stageOuter[0].offsetWidth / visCount;

            this.$stage.css({
                transition: animate ? `transform ${opts.smartSpeed}ms ease` : 'none',
                transform: `translate3d(${-(index * itemW)}px, 0, 0)`
            });
        }

        // Public: navigate to a real item by 0-based index
        to(index) {
            const realIdx = ((index % this.itemCount) + this.itemCount) % this.itemCount;
            this._slide(this.clonedBefore + realIdx, true);
        }

        // Public proxy methods
        next() { this._next(); return this; }
        prev() { this._prev(); return this; }

        _next() { this._slide(this.currentIndex + 1, true); }
        _prev() { this._slide(this.currentIndex - 1, true); }

        // Core slide: fires events, moves the stage, handles loop-jump after transition
        _slide(targetIndex, animate) {
            const self = this;
            const opts = this.options;
            const clonedBefore = this.clonedBefore;
            const itemCount = this.itemCount;
            const realIdx = ((targetIndex - clonedBefore) % itemCount + itemCount) % itemCount;

            this.$el[0].dispatchEvent(new CustomEvent('ts.carousel.change', {
                detail: { property: { name: 'position', value: realIdx } },
                bubbles: true
            }));

            this._moveTo(targetIndex, animate);
            this.currentIndex = targetIndex;

            const afterSlide = () => {
                // Silent jump when we've slid into the clone region
                if (opts.loop) {
                    if (self.currentIndex >= clonedBefore + itemCount) {
                        self.currentIndex = clonedBefore;
                        self._moveTo(self.currentIndex, false);
                    } else if (self.currentIndex < clonedBefore) {
                        self.currentIndex = clonedBefore + itemCount - 1;
                        self._moveTo(self.currentIndex, false);
                    }
                }

                self._updateActive();
                self._updateDots();
                if (self.$el.hasClass('carousel-center-active-item')) self._updateCenterActive();

                const finalIdx = ((self.currentIndex - clonedBefore) % itemCount + itemCount) % itemCount;
                self.$el[0].dispatchEvent(new CustomEvent('ts.carousel.changed', {
                    detail: { item: { index: finalIdx, count: itemCount } },
                    bubbles: true
                }));
            };

            animate ? setTimeout(afterSlide, opts.smartSpeed + 50) : afterSlide();
        }

        // Mark visCount items starting at currentIndex as .active
        _updateActive() {
            const visCount = this.getItemsCount();
            const $allItems = this.$stage.children();
            $allItems.removeClass('active');
            for (let i = 0; i < visCount; i++) {
                $allItems.eq(this.currentIndex + i).addClass('active');
            }
        }

        // Sync dot state to real item index
        _updateDots() {
            const realIdx = ((this.currentIndex - this.clonedBefore) % this.itemCount + this.itemCount) % this.itemCount;
            this.$dots.children().removeClass('active').eq(realIdx).addClass('active');
        }

        // Add .current to the middle visible item for carousel-center-active-item
        _updateCenterActive() {
            const $actives = this.$stage.children('.active');
            const midIdx = Math.floor(($actives.length - 1) / 2);
            this.$stage.children().removeClass('current');
            $actives.eq(midIdx).addClass('current');
        }

        _applyAutoHeight() {
            const self = this;
            const measure = () => {
                const heights = [];
                self.$stage.children('.active').each(function() {
                    heights.push($(this).outerHeight());
                });
                if (heights.length) self.$stageOuter.height(Math.max(...heights));
            };
            const ns = `.carousel-${this._uid}`;
            $(window).on(`load${ns} resize${ns}`, measure);
            measure();
        }

        _startAutoplay() {
            this._stopAutoplay();
            this.autoplayTimer = setInterval(() => this._next(), this.options.autoplayTimeout);
        }

        _stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }

        _setupSync() {
            const syncSel = this.$el.attr('data-sync');
            this.$el[0].addEventListener('ts.carousel.changed', (e) => {
                const syncInst = $(syncSel).data(instanceName);
                if (syncInst) syncInst.to(e.detail.item.index);
            });
        }

        _handleNavOutside() {
            const self = this;
            const $el = this.$el;
            const opts = this.options;
            const ns = `.carousel-${this._uid}`;

            const update = () => {
                if ($(window).width() < 992) {
                    opts.stagePadding = 40;
                    $el.addClass('stage-margin');
                } else {
                    opts.stagePadding = 0;
                    $el.removeClass('stage-margin');
                }
                self.$stageOuter.css('padding', opts.stagePadding ? `0 ${opts.stagePadding}px` : '');
                self._layout(false);
                self.navigationOffsets();
            };

            $(window).on(`load${ns} resize${ns}`, update);
            update();
        }

        // Pointer/touch drag on the stage
        _setupDrag() {
            const self = this;
            const opts = this.options;
            const stage = this.$stage[0];

            let startX = 0, startY = 0, dragging = false, delta = 0, startTranslate = 0;

            const getX = (e) => e.touches ? e.touches[0].clientX : e.clientX;
            const getY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

            const onStart = (e) => {
                startX = getX(e);
                startY = getY(e);
                dragging = true;
                delta = 0;
                const mat = new DOMMatrix(getComputedStyle(stage).transform);
                startTranslate = mat.m41;
                self.$stage.css('transition', 'none');
                self._stopAutoplay();
            };

            const onMove = (e) => {
                if (!dragging) return;
                const dx = getX(e) - startX;
                const dy = getY(e) - startY;
                // Cancel drag if motion is primarily vertical before a horizontal threshold
                if (!delta && Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
                e.preventDefault();
                delta = dx;
                self.$stage.css('transform', `translate3d(${startTranslate + dx}px, 0, 0)`);
            };

            const onEnd = () => {
                if (!dragging) return;
                dragging = false;
                const visCount = self.getItemsCount();
                const itemW = self.$stageOuter[0].offsetWidth / visCount;
                const threshold = itemW * 0.2;
                if (delta < -threshold) {
                    self._next();
                } else if (delta > threshold) {
                    self._prev();
                } else {
                    self._moveTo(self.currentIndex, true);
                }
                if (opts.autoplay) setTimeout(() => self._startAutoplay(), opts.autoplayTimeout);
            };

            if (opts.mouseDrag !== false) {
                stage.addEventListener('mousedown', onStart);
                this._mouseMoveHandler = onMove;
                this._mouseUpHandler = onEnd;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
            }

            if (opts.touchDrag !== false) {
                stage.addEventListener('touchstart', onStart, { passive: true });
                stage.addEventListener('touchmove', onMove, { passive: false });
                stage.addEventListener('touchend', onEnd);
            }
        }

        navigationOffsets() {
            const opts = this.options;
            const $el = this.options.wrapper;
            const $navEl = $el.find('.owl-nav');
            const $dotsEl = $el.find('.owl-dots');
            const navHasTransform = $navEl.css('transform') !== 'none';
            const dotsHasTransform = $dotsEl.css('transform') !== 'none';

            if (opts.navHorizontalOffset && !opts.navVerticalOffset) {
                navHasTransform
                    ? $navEl.css({ left: opts.navHorizontalOffset })
                    : $navEl.css({ transform: `translate3d(${opts.navHorizontalOffset}, 0, 0)` });
            }

            if (opts.navVerticalOffset && !opts.navHorizontalOffset) {
                navHasTransform
                    ? $navEl.css({ top: `calc(50% - ${opts.navVerticalOffset})` })
                    : $navEl.css({ transform: `translate3d(0, ${opts.navVerticalOffset}, 0)` });
            }

            if (opts.navVerticalOffset && opts.navHorizontalOffset) {
                navHasTransform
                    ? $navEl.css({ top: `calc(50% - ${opts.navVerticalOffset})`, left: opts.navHorizontalOffset })
                    : $navEl.css({ transform: `translate3d(${opts.navHorizontalOffset}, ${opts.navVerticalOffset}, 0)` });
            }

            if (opts.dotsHorizontalOffset && !opts.dotsVerticalOffset) {
                $dotsEl.css({ transform: `translate3d(${opts.dotsHorizontalOffset}, 0, 0)` });
            }

            if (opts.dotsVerticalOffset && !opts.dotsHorizontalOffset) {
                dotsHasTransform
                    ? $dotsEl.css({ top: `calc(50% - ${opts.dotsVerticalOffset})` })
                    : $dotsEl.css({ transform: `translate3d(0, ${opts.dotsVerticalOffset}, 0)` });
            }

            if (opts.dotsVerticalOffset && opts.dotsHorizontalOffset) {
                $dotsEl.css({ transform: `translate3d(${opts.dotsHorizontalOffset}, ${opts.dotsVerticalOffset}, 0)` });
            }

            return this;
        }

        carouselNavigate() {
            const self = this;
            const $el = this.options.wrapper;
            const id = $el.attr('id');
            if (!id || !$('[data-carousel-navigate]').get(0)) return this;

            const navSel = `[data-carousel-navigate-id="#${id}"]`;

            $(navSel).each(function() {
                const $this = $(this);
                const toIdx = parseInt($this.data('carousel-navigate-to'), 10) - 1;
                $this.on('click.carousel', () => self.to(toIdx));
            });

            $el[0].addEventListener('ts.carousel.change', () => $(navSel).removeClass('active'));
            $el[0].addEventListener('ts.carousel.changed', (e) => {
                $(`${navSel}[data-carousel-navigate-to="${e.detail.item.index + 1}"]`).addClass('active');
            });

            return this;
        }

        events() {
            const self = this;
            const $el = this.$el;
            const opts = this.options;
            const ns = `.carousel-${this._uid}`;

            this.$prev.on(`click${ns}`, (e) => {
                e.preventDefault();
                self._stopAutoplay();
                self._prev();
                if (opts.autoplay) setTimeout(() => self._startAutoplay(), opts.autoplayTimeout);
            });

            this.$next.on(`click${ns}`, (e) => {
                e.preventDefault();
                self._stopAutoplay();
                self._next();
                if (opts.autoplay) setTimeout(() => self._startAutoplay(), opts.autoplayTimeout);
            });

            this.$dots.on(`click${ns}`, '.owl-dot', function() {
                self._stopAutoplay();
                self.to($(this).index());
                if (opts.autoplay) setTimeout(() => self._startAutoplay(), opts.autoplayTimeout);
            });

            this._setupDrag();

            if (opts.keyboard) {
                $(document).on(`keydown${ns}`, (e) => {
                    if (e.key === 'ArrowLeft') self._prev();
                    if (e.key === 'ArrowRight') self._next();
                });
            }

            if (opts.autoplayHoverPause && opts.autoplay) {
                $el.on(`mouseenter${ns}`, () => self._stopAutoplay());
                $el.on(`mouseleave${ns}`, () => self._startAutoplay());
            }

            // Responsive relayout via ResizeObserver; fallback to debounced window resize
            if (window.ResizeObserver) {
                this._resizeObs = new ResizeObserver(() => {
                    self._layout(false);
                    self._updateActive();
                    self._updateDots();
                });
                this._resizeObs.observe(this.$stageOuter[0]);
            } else {
                let resizeTimer;
                $(window).on(`resize${ns}`, () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        self._layout(false);
                        self._updateActive();
                        self._updateDots();
                    }, 150);
                });
            }

            // AnimateIn/AnimateOut support for appear-animation plugins inside the carousel
            if (opts.animateIn || opts.animateOut) {
                $el[0].addEventListener('ts.carousel.change', () => {
                    $el.find('[data-appear-animation], [data-plugin-animated-letters]').addClass('d-none');
                    $el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');
                    $el.find('.owl-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');
                });

                $el[0].addEventListener('ts.carousel.changed', () => {
                    setTimeout(() => {
                        $el.find('[data-appear-animation]').each(function() {
                            const $this = $(this);
                            const pluginOpts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                            $this.themestrapPluginAnimate(pluginOpts);
                        });
                        $el.find('.owl-item.active [data-appear-animation], .owl-item.active [data-plugin-animated-letters]').removeClass('d-none');
                        $el.find('.owl-item.active [data-plugin-animated-letters]').trigger('animated.letters.initialize');
                        $el.find('.owl-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');
                    }, 10);
                });
            }

            // Re-run icon plugin on cloned items when they become active
            if ($el.find('[data-icon]').length) {
                $el[0].addEventListener('ts.carousel.change', () => {
                    $el.find('.owl-item.cloned [data-icon]').each(function() {
                        const $this = $(this);
                        const pluginOpts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                        if (typeof $.fn.themestrapPluginIcon === 'function') $this.themestrapPluginIcon(pluginOpts);
                    });
                });
            }

            return this;
        }

        destroy() {
            const ns = `.carousel-${this._uid}`;

            this._stopAutoplay();

            if (this._resizeObs) this._resizeObs.disconnect();
            if (this._mouseMoveHandler) document.removeEventListener('mousemove', this._mouseMoveHandler);
            if (this._mouseUpHandler) document.removeEventListener('mouseup', this._mouseUpHandler);

            $(window).off(ns);
            $(document).off(ns);
            this.$el.off(ns);
            $('[data-carousel-navigate]').off('.carousel');

            this.$el.html(this.initialHTML);
            this.$el.removeClass('owl-themestrap owl-loaded owl-loading owl-carousel-init owl-drag');
            this.$el.removeData(instanceName);

            PluginCarousel.instances = Math.max(0, PluginCarousel.instances - 1);
            if (PluginCarousel.instances === 0) {
                const styleEl = document.getElementById(STYLE_ID);
                if (styleEl) styleEl.remove();
            }

            return this;
        }
    }

    PluginCarousel.instances = 0;
    PluginCarousel._uidCounter = 0;

    PluginCarousel.defaults = {
        items: 4,
        loop: true,
        responsive: {
            0:    { items: 1 },
            479:  { items: 1 },
            768:  { items: 2 },
            979:  { items: 3 },
            1199: { items: 4 }
        },
        nav: true,
        navText: [],
        dots: true,
        smartSpeed: 250,
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        mouseDrag: true,
        touchDrag: true,
        stagePadding: 0,
        autoHeight: false,
        rtl: false,
        animateIn: null,
        animateOut: null,
        keyboard: false,
        refresh: false
    };

    PluginCarousel.css = `
/* Carousel */
.owl-carousel {
    position: relative;
    z-index: 1;
    -webkit-tap-highlight-color: transparent;
    touch-action: pan-y;
}
.owl-carousel .owl-stage {
    position: relative;
    will-change: transform;
}
.owl-carousel .owl-stage::after {
    content: "";
    display: block;
    clear: both;
}
.owl-carousel .owl-stage-outer {
    position: relative;
    overflow: hidden;
}
.owl-carousel .owl-item {
    position: relative;
    float: left;
    min-height: 1px;
    backface-visibility: hidden;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    box-sizing: border-box;
}
.owl-carousel .owl-nav .owl-prev,
.owl-carousel .owl-nav .owl-next,
.owl-carousel .owl-dots .owl-dot {
    cursor: pointer;
    user-select: none;
}
.owl-carousel .owl-nav button.owl-prev,
.owl-carousel .owl-nav button.owl-next,
.owl-carousel .owl-dots button.owl-dot {
    background: none;
    border: none;
    padding: 0 !important;
    font: inherit;
    cursor: pointer;
    outline: none;
}
.owl-carousel .owl-nav.disabled,
.owl-carousel .owl-dots.disabled {
    display: none;
}
.owl-carousel .owl-dots .owl-dot span {
    display: block;
    background: #d6d6d6;
    border-radius: 30px;
    transition: background 200ms ease;
}
.owl-carousel.owl-rtl .owl-item { float: right; }
.owl-carousel.owl-drag .owl-item { touch-action: none; user-select: none; }

/* Carousel — Themestrap skin */
.owl-carousel {
    display: block;
    margin-bottom: 20px;
    opacity: 0;
}
.owl-carousel.owl-loaded {
    opacity: 1;
}
.owl-carousel:not(.owl-loaded):not(.owl-carousel-light) > div,
.owl-carousel:not(.owl-loaded):not(.owl-carousel-light) span {
    display: none;
}
.owl-carousel:not(.owl-loaded):not(.owl-carousel-light) > div:first-child,
.owl-carousel:not(.owl-loaded):not(.owl-carousel-light) span:first-child {
    display: block;
}
.owl-carousel .owl-item img {
    transform-style: unset;
}
.owl-carousel .owl-item img[data-icon] {
    display: inline;
}
.owl-carousel .thumbnail {
    margin-right: 1px;
}
.owl-carousel .item-video {
    height: 300px;
}
.owl-carousel .owl-nav {
    top: 50%;
    position: absolute;
    width: 100%;
    margin-top: 0;
    transform: translate3d(0, -50%, 0);
}
.owl-carousel .owl-nav button.owl-prev,
.owl-carousel .owl-nav button.owl-next {
    display: inline-block;
    position: absolute;
    top: 50%;
    width: 30px;
    height: 30px;
    outline: 0;
    margin: 0;
    transform: translate3d(0, -50%, 0);
}
.owl-carousel .owl-nav button.owl-prev {
    left: 0;
}
.owl-carousel .owl-nav button.owl-prev:before {
    font-family: 'Font Awesome 7 Free';
    font-weight: 900;
    font-size: 11.2px;
    font-size: 0.7rem;
    content: "\f053";
    position: relative;
    left: -1px;
    top: -1px;
}
.owl-carousel .owl-nav button.owl-next {
    right: 0;
}
.owl-carousel .owl-nav button.owl-next:before {
    font-family: 'Font Awesome 7 Free';
    font-weight: 900;
    font-size: 11.2px;
    font-size: 0.7rem;
    content: "\f054";
    position: relative;
    left: 1px;
    top: -1px;
}
.owl-carousel.stage-margin .owl-stage-outer {
    margin-left: 40px !important;
    margin-right: 40px !important;
}
.owl-carousel.stage-margin .owl-stage-outer .owl-stage {
    padding-left: 0 !important;
    padding-right: 0 !important;
}
.owl-carousel.stage-margin.stage-margin-sm .owl-stage-outer {
    margin-left: 50px !important;
    margin-right: 50px !important;
}
.owl-carousel.stage-margin.stage-margin-md .owl-stage-outer {
    margin-left: 75px !important;
    margin-right: 75px !important;
}
.owl-carousel.stage-margin.stage-margin-lg .owl-stage-outer {
    margin-left: 100px !important;
    margin-right: 100px !important;
}
.owl-carousel.top-border {
    border-top: 1px solid #eaeaea;
    padding-top: 18px;
}
.owl-carousel.nav-remove-prev .owl-nav .owl-prev { display: none; }
.owl-carousel.nav-remove-next .owl-nav .owl-next { display: none; }
.owl-carousel.nav-full-height .owl-stage-outer { z-index: 1; }
.owl-carousel.nav-full-height .owl-nav { height: 100%; }
.owl-carousel.nav-full-height .owl-nav .owl-next,
.owl-carousel.nav-full-height .owl-nav .owl-prev { height: 100% !important; }
.owl-carousel.show-nav-hover .owl-nav {
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
.owl-carousel.show-nav-hover .owl-nav button.owl-prev {
    left: 0;
    transition: all 0.2s ease-in-out;
}
.owl-carousel.show-nav-hover .owl-nav button.owl-next {
    right: 0;
    transition: all 0.2s ease-in-out;
}
.owl-carousel.show-nav-hover:hover .owl-nav { opacity: 1; }
.owl-carousel.show-nav-hover:hover .owl-nav button.owl-prev { left: -40px; }
.owl-carousel.show-nav-hover:hover .owl-nav button.owl-next { right: -40px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-2:hover .owl-nav button.owl-prev { left: -15px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-2:hover .owl-nav button.owl-next { right: -15px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .owl-nav button.owl-prev { left: -20px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .owl-nav button.owl-next { right: -20px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-3:hover .owl-nav button.owl-prev { left: 10px; }
.owl-carousel.show-nav-hover.show-nav-hover-pos-3:hover .owl-nav button.owl-next { right: 10px; }
.owl-carousel.show-nav-title .owl-nav {
    top: 0;
    right: 0;
    margin-top: -25px;
    width: auto;
}
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"],
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"]:hover,
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"]:active {
    font-size: 18px;
    background: transparent !important;
    width: 18px;
}
.owl-carousel.show-nav-title .owl-nav button.owl-prev { left: -40px; }
.owl-carousel.show-nav-title .owl-nav button.owl-prev:before,
.owl-carousel.show-nav-title .owl-nav button.owl-prev:after,
.owl-carousel.show-nav-title .owl-nav button.owl-next:before,
.owl-carousel.show-nav-title .owl-nav button.owl-next:after { font-size: inherit; }
.owl-carousel.show-nav-title.show-nav-title-both-sides .owl-nav { width: 100%; }
.owl-carousel.show-nav-title.show-nav-title-both-sides button.owl-prev { left: 0; }
.owl-carousel.show-nav-title.show-nav-title-both-sides button.owl-next { right: 0; }
.owl-carousel.show-nav-title.show-nav-title-both-sides-style-2 .owl-nav { margin-top: 15px; }
.owl-carousel.rounded-nav .owl-nav button[class*="owl-"] {
    padding: 3px 7px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid #999;
    color: #999;
}
.owl-carousel.rounded-nav .owl-nav button[class*="owl-"]:hover,
.owl-carousel.rounded-nav .owl-nav button[class*="owl-"].hover {
    background: transparent;
    border: 1px solid #a1a1a1;
    color: #a1a1a1;
}
.owl-carousel.rounded-nav .owl-nav button[class*="owl-"]:active,
.owl-carousel.rounded-nav .owl-nav button[class*="owl-"].active {
    background: transparent;
    border: 1px solid #666;
    color: #666;
}
.owl-carousel.nav-bottom .owl-stage-outer { margin-bottom: 10px; }
.owl-carousel.nav-bottom .owl-nav {
    position: static;
    margin: 0;
    padding: 0;
    width: auto;
    transform: none;
}
.owl-carousel.nav-bottom .owl-nav button.owl-prev,
.owl-carousel.nav-bottom .owl-nav button.owl-next {
    position: static;
    transform: none;
}
.owl-carousel.nav-bottom .owl-nav button.owl-prev { margin-right: 5px; }
.owl-carousel.nav-bottom .owl-nav button.owl-next { margin-left: 5px; }
.owl-carousel.nav-bottom.nav-bottom-align-left .owl-nav { text-align: left; }
.owl-carousel.nav-bottom.nav-bottom-align-right .owl-nav { text-align: right; }
.owl-carousel.nav-bottom-inside .owl-nav {
    position: relative;
    margin: -68.8px 0 0 0;
    margin: -4.3rem 0 0 0;
    padding: 0;
    width: auto;
}
.owl-carousel.nav-bottom-inside .owl-nav button.owl-prev,
.owl-carousel.nav-bottom-inside .owl-nav button.owl-next { position: static; }
.owl-carousel.nav-inside .owl-nav button.owl-prev { left: 15px; }
.owl-carousel.nav-inside .owl-nav button.owl-next { right: 15px; left: auto; }
.owl-carousel.nav-inside.nav-inside-edge .owl-nav button.owl-prev { left: 0; }
.owl-carousel.nav-inside.nav-inside-edge .owl-nav button.owl-next { right: 0; left: auto; }
.owl-carousel.nav-inside.nav-inside-plus .owl-nav button.owl-prev { left: 30px; }
.owl-carousel.nav-inside.nav-inside-plus .owl-nav button.owl-next { right: 30px; left: auto; }
.owl-carousel.nav-inside.nav-bottom .owl-nav {
    position: absolute;
    top: auto;
    bottom: 40px;
    width: 100%;
}
.owl-carousel.nav-inside.nav-bottom .owl-nav button.owl-prev,
.owl-carousel.nav-inside.nav-bottom .owl-nav button.owl-next { position: relative; }
.owl-carousel.nav-inside.nav-bottom .owl-nav button.owl-prev { left: 0; }
.owl-carousel.nav-inside.nav-bottom .owl-nav button.owl-next { right: 0; }
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav { top: auto; bottom: 60px; }
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-prev,
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-next {
    transform: none;
    width: 60px !important;
    height: 60px !important;
}
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-prev:before,
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-next:before {
    font-size: 12.8px;
    font-size: 0.8rem;
    left: 0;
    top: 0;
}
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-prev { left: -60px; top: -61px; }
.owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-next { left: -60px; }
@media (max-width: 991px) {
    .owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-prev { left: 0; }
    .owl-carousel.nav-inside.nav-inside-half-section .owl-nav button.owl-next { left: 0; }
}
.owl-carousel.nav-outside .owl-nav button.owl-prev { left: 0; }
.owl-carousel.nav-outside .owl-nav button.owl-next { right: 0; }
@media (min-width: 992px) {
    .owl-carousel.nav-outside .owl-nav button.owl-prev { left: -50px; }
    .owl-carousel.nav-outside .owl-nav button.owl-next { right: -50px; }
}
.owl-carousel.nav-position-1 .owl-nav button.owl-prev { left: 20px; }
.owl-carousel.nav-position-1 .owl-nav button.owl-next { right: 20px; }
.owl-carousel.nav-icon-1 .owl-nav .owl-next:before { content: "\f061"; }
.owl-carousel.nav-icon-1 .owl-nav .owl-prev:before { content: "\f060"; }
.owl-carousel.nav-size-md .owl-nav .owl-next,
.owl-carousel.nav-size-md .owl-nav .owl-prev { width: 40px; height: 40px; }
.owl-carousel.nav-size-md .owl-nav .owl-next:before,
.owl-carousel.nav-size-md .owl-nav .owl-prev:before { top: 0; font-size: 12px; font-size: 0.75rem; }
.owl-carousel.nav-style-1 .owl-nav .owl-next,
.owl-carousel.nav-style-1 .owl-nav .owl-prev {
    width: 20px;
    background: transparent !important;
    color: #000;
}
.owl-carousel.nav-style-1 .owl-nav .owl-next:hover,
.owl-carousel.nav-style-1 .owl-nav .owl-next:active,
.owl-carousel.nav-style-1 .owl-nav .owl-prev:hover,
.owl-carousel.nav-style-1 .owl-nav .owl-prev:active { color: var(--grey-500); }
.owl-carousel.nav-style-1 .owl-nav .owl-next:before,
.owl-carousel.nav-style-1 .owl-nav .owl-next:after,
.owl-carousel.nav-style-1 .owl-nav .owl-prev:before,
.owl-carousel.nav-style-1 .owl-nav .owl-prev:after { font-size: inherit; }
.owl-carousel.nav-style-2 .owl-nav .owl-next,
.owl-carousel.nav-style-2 .owl-nav .owl-prev { background: transparent !important; }
.owl-carousel.nav-style-2 .owl-nav .owl-next:before,
.owl-carousel.nav-style-2 .owl-nav .owl-prev:before {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 1px;
    width: 1.3em;
    height: 1.3em;
    border-top: 2px solid var(--grey-500);
    border-left: 2px solid var(--grey-500);
    font-size: inherit;
    transform: translate3d(0, -50%, 0) rotate(-45deg);
}
.owl-carousel.nav-style-2 .owl-nav .owl-next:after,
.owl-carousel.nav-style-2 .owl-nav .owl-prev:after {
    content: '';
    display: block;
    border-top: 3px solid var(--grey-500);
    width: 2.5em;
    position: absolute;
    top: 50%;
    font-size: inherit;
    transform: translate3d(0, -50%, 0);
}
.owl-carousel.nav-style-2 .owl-nav .owl-next {
    transform: rotate(180deg) !important;
    transform-origin: 15px 8px;
}
.owl-carousel.nav-style-2.nav-bottom.nav-inside .owl-nav .owl-next { transform-origin: 15px; }
.owl-carousel.nav-style-3 .owl-nav { top: 25%; }
.owl-carousel.nav-style-3 .owl-nav .owl-next,
.owl-carousel.nav-style-3 .owl-nav .owl-prev {
    width: 30px;
    background: transparent !important;
    color: var(--grey-500);
}
.owl-carousel.nav-style-3 .owl-nav .owl-next:before,
.owl-carousel.nav-style-3 .owl-nav .owl-next:after,
.owl-carousel.nav-style-3 .owl-nav .owl-prev:before,
.owl-carousel.nav-style-3 .owl-nav .owl-prev:after { font-size: 1.5em; }
.owl-carousel.nav-style-4 .owl-nav .owl-prev { left: 75px; }
@media (max-width: 991px) { .owl-carousel.nav-style-4 .owl-nav .owl-prev { left: 40px; } }
@media (max-width: 767px) { .owl-carousel.nav-style-4 .owl-nav .owl-prev { left: 13px; } }
.owl-carousel.nav-style-4 .owl-nav .owl-next { right: 75px; }
@media (max-width: 991px) { .owl-carousel.nav-style-4 .owl-nav .owl-next { right: 40px; } }
@media (max-width: 767px) { .owl-carousel.nav-style-4 .owl-nav .owl-next { right: 13px; } }
.owl-carousel.nav-style-4 .owl-nav .owl-prev,
.owl-carousel.nav-style-4 .owl-nav .owl-next {
    background: var(--light);
    font-size: 11.2px;
    font-size: 0.7rem;
    width: 40px;
    height: 40px;
    color: #000;
    border-radius: 100%;
    box-shadow: 0px 0px 40px -10px rgba(0, 0, 0, 0.3);
}
.owl-carousel.nav-style-4 .owl-nav .owl-prev:hover,
.owl-carousel.nav-style-4 .owl-nav .owl-next:hover { color: var(--light); }
.owl-carousel.nav-style-4.nav-style-4-pos-2 .owl-nav .owl-prev { left: 0px; }
.owl-carousel.nav-style-4.nav-style-4-pos-2 .owl-nav .owl-next { right: 0px; }
.owl-carousel.nav-style-diamond .owl-nav .owl-prev,
.owl-carousel.nav-style-diamond .owl-nav .owl-next {
    transform: rotate(45deg);
    transform-origin: 100% 0%;
}
.owl-carousel.nav-style-diamond .owl-nav .owl-prev:before,
.owl-carousel.nav-style-diamond .owl-nav .owl-next:before {
    display: block;
    transform: rotate(-45deg);
    transform-origin: 60% 50%;
}
.owl-carousel.nav-style-diamond .owl-nav .owl-next:before { transform-origin: 50%; }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev,
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-next { width: 35px; height: 35px; }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev:before,
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-next:before { content: none; }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev svg,
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-next svg { width: 2em; }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev svg polygon,
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-next svg polygon { fill: #FFF; stroke: #FFF; }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev svg { transform: rotate(180deg); }
.owl-carousel.nav-arrows-1 .owl-nav .owl-prev,
.owl-carousel.nav-arrows-1 .owl-nav .owl-next {
    width: 35px;
    height: 35px;
    font-size: 19.2px;
    font-size: 1.2rem;
    background: transparent;
}
.owl-carousel.nav-arrows-1 .owl-nav .owl-next:before { content: '\f061'; font-size: inherit; }
.owl-carousel.nav-arrows-1 .owl-nav .owl-prev:before { content: '\f060'; font-size: inherit; }
.owl-carousel.nav-arrows-2 .owl-nav .owl-prev,
.owl-carousel.nav-arrows-2 .owl-nav .owl-next {
    width: 35px;
    height: 35px;
    font-size: 19.2px;
    font-size: 1.2rem;
    background: transparent;
}
.owl-carousel.nav-arrows-2 .owl-nav .owl-next:before { content: '\f101'; font-size: inherit; }
.owl-carousel.nav-arrows-2 .owl-nav .owl-prev:before { content: '\f100'; font-size: inherit; }
.owl-carousel.nav-arrows-thin .owl-nav .owl-prev:before,
.owl-carousel.nav-arrows-thin .owl-nav .owl-next:before {
    font-family: simple-line-icons;
    speak: none;
    font-style: normal;
    font-weight: 700;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
}
.owl-carousel.nav-arrows-thin .owl-nav .owl-next:before { content: "\e606"; font-size: inherit; }
.owl-carousel.nav-arrows-thin .owl-nav .owl-prev:before { content: "\e605"; font-size: inherit; }
.owl-carousel.nav-center-images-only .owl-nav { top: 37%; }
.owl-carousel.nav-center-outside .owl-nav {
    width: calc(100% + 90px);
    left: 49.9%;
    transform: translate3d(-50%, 0, 0);
}
.owl-carousel.full-width .owl-nav button[class*="owl-"],
.owl-carousel.full-width .owl-nav button[class*="owl-"]:hover,
.owl-carousel.big-nav .owl-nav button[class*="owl-"],
.owl-carousel.big-nav .owl-nav button[class*="owl-"]:hover { height: auto; padding: 20px 0 !important; }
.owl-carousel.full-width .owl-nav button.owl-prev,
.owl-carousel.big-nav .owl-nav button.owl-prev { border-radius: 0 4px 4px 0; }
.owl-carousel.full-width .owl-nav button.owl-next,
.owl-carousel.big-nav .owl-nav button.owl-next { border-radius: 4px 0 0 4px; }
.owl-carousel.nav-squared .owl-nav button[class*="owl-"] { border-radius: 0; }
.owl-carousel.nav-rounded .owl-nav button[class*="owl-"] { border-radius: 50%; }
.owl-carousel.nav-sm .owl-nav button.owl-prev,
.owl-carousel.nav-sm .owl-nav button.owl-next { width: 30px !important; height: 30px !important; }
.owl-carousel.nav-md .owl-nav button.owl-prev,
.owl-carousel.nav-md .owl-nav button.owl-next { width: 40px; height: 40px; }
.owl-carousel.nav-lg .owl-nav button.owl-prev,
.owl-carousel.nav-lg .owl-nav button.owl-next { width: 45px; height: 60px; }
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-prev,
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-next { width: 55px; height: 55px; }
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-prev:before,
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-next:before { font-size: 14.4px; font-size: 0.9rem; }
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-prev:before { top: -1px; left: -1px; }
.owl-carousel.nav-lg.rounded-nav .owl-nav button.owl-next:before { top: -1px; left: 1px; }
.owl-carousel.nav-font-size-sm .owl-nav button.owl-prev,
.owl-carousel.nav-font-size-sm .owl-nav button.owl-next { font-size: 10px; }
.owl-carousel.nav-font-size-sm .owl-nav button.owl-prev:before,
.owl-carousel.nav-font-size-sm .owl-nav button.owl-next:before { font-size: inherit; }
.owl-carousel.nav-font-size-md .owl-nav button.owl-prev,
.owl-carousel.nav-font-size-md .owl-nav button.owl-next { font-size: 14px; }
.owl-carousel.nav-font-size-md .owl-nav button.owl-prev:before,
.owl-carousel.nav-font-size-md .owl-nav button.owl-next:before { font-size: inherit; }
.owl-carousel.nav-font-size-lg .owl-nav button.owl-prev,
.owl-carousel.nav-font-size-lg .owl-nav button.owl-next { font-size: 19px; }
.owl-carousel.nav-font-size-lg .owl-nav button.owl-prev:before,
.owl-carousel.nav-font-size-lg .owl-nav button.owl-next:before { font-size: inherit; left: 2px; }
.owl-carousel.nav-font-size-xl .owl-nav button.owl-prev,
.owl-carousel.nav-font-size-xl .owl-nav button.owl-next { font-size: 25px; }
.owl-carousel.nav-font-size-xl .owl-nav button.owl-prev:before,
.owl-carousel.nav-font-size-xl .owl-nav button.owl-next:before { font-size: inherit; left: 2px; }
.owl-carousel.nav-transparent .owl-nav button[class*="owl-"] {
    background-color: transparent !important;
    color: var(--dark) !important;
}
.owl-carousel.nav-transparent .owl-nav button[class*="owl-"]:hover,
.owl-carousel.nav-transparent .owl-nav button[class*="owl-"]:active {
    background-color: transparent !important;
    border-color: transparent !important;
}
.owl-carousel.nav-borders .owl-nav button[class*="owl-"] { border-color: var(--dark-rgba-10) !important; }
.owl-carousel.nav-borders .owl-nav button[class*="owl-"]:hover { border-color: var(--dark-rgba-10) !important; }
.owl-carousel.nav-borders .owl-nav button[class*="owl-"]:active { border-color: var(--dark-rgba-30) !important; }
.owl-carousel.nav-borders-light .owl-nav button[class*="owl-"] { border-color: var(--light-rgba-20) !important; }
.owl-carousel.nav-borders-light .owl-nav button[class*="owl-"]:hover { border-color: var(--light-rgba-20) !important; }
.owl-carousel.nav-borders-light .owl-nav button[class*="owl-"]:active { border-color: var(--light-rgba-30) !important; }
.owl-carousel.nav-arrow-light .owl-nav .owl-next:before,
.owl-carousel.nav-arrow-light .owl-nav .owl-next:after,
.owl-carousel.nav-arrow-light .owl-nav .owl-prev:before,
.owl-carousel.nav-arrow-light .owl-nav .owl-prev:after { color: var(--light) !important; }
.owl-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav button[class*="owl-"] {
    background-color: var(--grey-100) !important;
    border-color: var(--grey-100) !important;
    color: var(--dark) !important;
}
.owl-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav button[class*="owl-"]:hover {
    background-color: var(--light) !important;
    border-color: var(--light) !important;
}
.owl-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav button[class*="owl-"]:active {
    background-color: var(--grey-200) !important;
    border-color: var(--grey-200) !important;
}
.owl-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .owl-nav button[class*="owl-"] {
    width: 35px;
    height: 45px;
    background-color: var(--dark-rgba-10) !important;
    border-color: transparent !important;
}
.owl-carousel.nav-light.nav-style-1 .owl-nav .owl-next,
.owl-carousel.nav-light.nav-style-1 .owl-nav .owl-prev { color: var(--light) !important; }
.owl-carousel.nav-light.nav-style-2 .owl-nav .owl-next:before,
.owl-carousel.nav-light.nav-style-2 .owl-nav .owl-next:after,
.owl-carousel.nav-light.nav-style-2 .owl-nav .owl-prev:before,
.owl-carousel.nav-light.nav-style-2 .owl-nav .owl-prev:after { border-color: var(--light) !important; }
.owl-carousel.nav-light.nav-style-3 .owl-nav .owl-next,
.owl-carousel.nav-light.nav-style-3 .owl-nav .owl-prev { color: var(--light) !important; }
.owl-carousel.nav-light.nav-svg-arrows-1 .owl-nav .owl-next svg polygon,
.owl-carousel.nav-light.nav-svg-arrows-1 .owl-nav .owl-prev svg polygon { fill: #FFF !important; stroke: #FFF !important; }
.owl-carousel.nav-light.nav-arrows-1 .owl-nav .owl-next,
.owl-carousel.nav-light.nav-arrows-1 .owl-nav .owl-prev { color: var(--light) !important; }
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-next,
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-prev {
    background-color: var(--dark--100) !important;
    border-color: var(--dark--100) var(--dark--100) var(--dark--100) !important;
    color: var(--light) !important;
}
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-next:hover,
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-prev:hover {
    background-color: var(--dark--100) !important;
    border-color: var(--dark--100) !important;
}
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-next:active,
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .owl-nav .owl-prev:active {
    background-color: var(--dark) !important;
    border-color: var(--dark) !important;
}
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .owl-nav .owl-next,
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .owl-nav .owl-prev {
    width: 35px;
    height: 45px;
    background-color: rgba(var(--dark--100), 0.4) !important;
    border-color: transparent !important;
}
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .owl-nav .owl-next:hover,
.owl-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .owl-nav .owl-prev:hover {
    background-color: rgba(var(--dark--100), 1) !important;
}
.owl-carousel.nav-dark.nav-style-1 .owl-nav .owl-next,
.owl-carousel.nav-dark.nav-style-1 .owl-nav .owl-prev { color: var(--dark) !important; }
.owl-carousel.nav-dark.nav-style-2 .owl-nav .owl-next:before,
.owl-carousel.nav-dark.nav-style-2 .owl-nav .owl-next:after,
.owl-carousel.nav-dark.nav-style-2 .owl-nav .owl-prev:before,
.owl-carousel.nav-dark.nav-style-2 .owl-nav .owl-prev:after { border-color: var(--dark) !important; }
.owl-carousel.nav-dark.nav-style-3 .owl-nav .owl-next,
.owl-carousel.nav-dark.nav-style-3 .owl-nav .owl-prev { color: var(--dark) !important; }
.owl-carousel.nav-dark.nav-svg-arrows-1 .owl-nav .owl-next svg polygon,
.owl-carousel.nav-dark.nav-svg-arrows-1 .owl-nav .owl-prev svg polygon { fill: var(--dark) !important; stroke: var(--dark) !important; }
.owl-carousel.nav-dark.nav-arrows-1 .owl-nav .owl-next,
.owl-carousel.nav-dark.nav-arrows-1 .owl-nav .owl-prev { color: var(--dark) !important; }
.owl-carousel .owl-dots .owl-dot { outline: 0; }
.owl-carousel .owl-dots .owl-dot span { width: 8px; height: 8px; margin: 5px 4px; }
.owl-carousel.dots-inside .owl-dots { position: absolute; bottom: 2px; right: 10px; margin-top: 0; }
.owl-carousel.dots-title .owl-dots { position: absolute; margin-top: 0 !important; top: -51px; left: 155px; }
.owl-carousel.dots-title .owl-dots .owl-dot span { width: 8px; height: 8px; margin: 5px 4px; }
.owl-carousel.dots-title.dots-title-pos-2 .owl-dots { left: 235px; }
.owl-carousel.dots-light .owl-dots .owl-dot span { background: rgba(255, 255, 255, 0.6); }
.owl-carousel.dots-light .owl-dots .owl-dot.active span,
.owl-carousel.dots-light .owl-dots .owl-dot:hover span { background: #FFF !important; }
.owl-carousel.dots-dark .owl-dots .owl-dot span { background: rgba(33, 33, 33, 0.6); }
.owl-carousel.dots-dark .owl-dots .owl-dot.active span,
.owl-carousel.dots-dark .owl-dots .owl-dot:hover span { background: #212121 !important; }
.owl-carousel.dots-morphing .owl-dots .owl-dot span { width: 20px; height: 6px; transition: ease width 300ms; }
.owl-carousel.dots-morphing .owl-dots .owl-dot.active span,
.owl-carousel.dots-morphing .owl-dots .owl-dot:hover span { width: 40px; }
.owl-carousel.dots-modern .owl-dots { display: flex; align-items: center; justify-content: center; }
.owl-carousel.dots-modern .owl-dots .owl-dot { display: flex; align-items: center; justify-content: center; margin: 0 2px; }
.owl-carousel.dots-modern .owl-dots .owl-dot span { width: 4px; height: 4px; transition: ease all 300ms 300ms; }
.owl-carousel.dots-modern .owl-dots .owl-dot.active span { transition: ease all 300ms; transform: scale(2); }
.owl-carousel.dots-modern.dots-modern-lg .owl-dots .owl-dot { margin: 0 3px; }
.owl-carousel.dots-modern.dots-modern-lg .owl-dots .owl-dot span { width: 6px; height: 6px; }
.owl-carousel.dots-orientation-portrait .owl-dots { display: flex; flex-direction: column; margin-left: 15px !important; margin-right: 15px !important; }
.owl-carousel.dots-align-left .owl-dots { text-align: left; justify-content: flex-start; }
.owl-carousel.dots-align-right .owl-dots { text-align: left; }
.owl-carousel.dots-horizontal-center .owl-dots { left: 0; right: 0; width: 100%; }
.owl-carousel.dots-vertical-center .owl-dots { top: 50%; bottom: auto; margin: 0; transform: translate3d(0, -50%, 0); }
@media (max-width: 575px) {
    .owl-carousel.show-dots-xs .owl-dots { opacity: 1 !important; visibility: visible !important; }
}
@media (min-width: 576px) and (max-width: 767px) {
    .owl-carousel.show-dots-sm .owl-dots { opacity: 1 !important; visibility: visible !important; }
}
@media (min-width: 768px) and (max-width: 991px) {
    .owl-carousel.show-dots-md .owl-dots { opacity: 1 !important; visibility: visible !important; }
}
.owl-carousel.show-dots-hover .owl-dots { opacity: 0; visibility: hidden; transition: ease opacity 300ms; }
.owl-carousel.show-dots-hover:hover .owl-dots { opacity: 1; visibility: visible; }
.owl-carousel.carousel-shadow-1 { position: relative; }
.owl-carousel.carousel-shadow-1:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 65%;
    height: 0px;
    box-shadow: 0 0 110px 180px rgba(0, 0, 0, 0.04);
    transform: translate3d(-50%, -50%, 0);
    z-index: 0;
}
.owl-carousel.carousel-shadow-1.carousel-shadow-1-bold:before { box-shadow: 0 0 110px 230px rgba(0, 0, 0, 0.04); }
.owl-carousel .img-thumbnail.img-thumbnail-hover-icon { display: block; }
.owl-carousel.carousel-right-side-nav { width: calc(100% - 55px); }
.owl-carousel.carousel-right-side-nav .owl-nav .owl-next { width: 55px; transform: translate3d(100%, -50%, 0); }
.owl-carousel.carousel-bottom-inside-shadow .owl-stage-outer:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 35%;
    width: 100%;
    background-image: linear-gradient(360deg, var(--grey-500) 0%, transparent 100%);
}
.owl-carousel [class*="opacity-"]:not([class*="opacity-hover"]) { transition: ease opacity 300ms; }
.owl-carousel [class*="opacity-"]:not([class*="opacity-hover"]):hover { opacity: 1 !important; }
@media (min-width: 576px) {
    .owl-carousel.carousel-sync-style-1 {
        position: absolute;
        top: 50%;
        left: -30px;
        max-width: 355px;
        transform: translate3d(0, -50%, 0);
    }
}
.owl-carousel-spaced { margin-left: -5px; }
.owl-carousel-spaced .owl-item > div { margin: 5px; }
.owl-carousel.testimonials img { display: inline-block; height: 70px; width: 70px; }
@media (max-width: 575px) { .owl-carousel-spaced { margin-left: 0; } }
.carousel-half-full-width-wrapper > .owl-carousel { width: 100%; }
@media (min-width: 576px) { .carousel-half-full-width-wrapper > .owl-carousel { width: calc(100vw - ((100vw - 540px) / 2)); } }
@media (min-width: 768px) { .carousel-half-full-width-wrapper > .owl-carousel { width: calc(100vw - ((100vw - 720px) / 2)); } }
@media (min-width: 992px) { .carousel-half-full-width-wrapper > .owl-carousel { width: calc(100vw - ((100vw - 960px) / 2)); } }
@media (min-width: 1200px) { .carousel-half-full-width-wrapper > .owl-carousel { width: calc(100vw - ((100vw - 1140px) / 2)); } }
.carousel-half-full-width-wrapper > .owl-carousel .owl-stage-outer { margin-bottom: 20px; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left { direction: rtl; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .owl-carousel .owl-nav { display: flex; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .owl-carousel .owl-nav .owl-prev { order: 2; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .owl-carousel .owl-nav .owl-next { order: 1; }
.carousel-areas {
    background: #f2f2f2;
    background: linear-gradient(to bottom, #f2f2f2 0%, rgba(33, 37, 41, 0.5) 100%);
    margin-bottom: -10px;
    padding: 8px 8px 0 8px;
    border-radius: 6px 6px 0 0;
    box-shadow: 0px 0px 50px 20px rgba(0, 0, 0, 0.07);
}
.carousel-areas .owl-carousel { box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2); }
.carousel-areas .owl-carousel .owl-nav button.owl-prev { left: -55px; }
.carousel-areas .owl-carousel .owl-nav button.owl-next { right: -55px; }
.carousel-areas .owl-carousel:first-child img { border-radius: 6px 6px 0 0; }
@media (max-width: 991px) { .carousel-areas .owl-carousel .owl-nav { display: none; } }
.owl-carousel.carousel-center-active-item .owl-item { opacity: 0.2; transition: ease opacity 300ms; }
.owl-carousel.carousel-center-active-item .owl-item.current { opacity: 1 !important; }
.owl-carousel.carousel-center-active-item.carousel-center-active-item-style-2 .owl-item { opacity: 0.7; }
.owl-carousel.carousel-center-active-item-2 .owl-stage-outer { overflow: visible; }
.owl-carousel.carousel-center-active-item-2 .owl-item > div {
    width: 66.6666%;
    margin-left: auto;
    padding: 48px;
    padding: 3rem;
    background: var(--light);
    border-radius: 7px;
    box-shadow: 0px 0px 70px -40px rgba(0, 0, 0, 0.2);
}
.owl-carousel.carousel-center-active-item-2 .owl-item.active > div { margin-right: auto; }
.owl-carousel.carousel-center-active-item-2 .owl-item.active > div * { color: var(--light) !important; }
.owl-carousel.carousel-center-active-item-2 .owl-item.active + .owl-item > div { margin-right: auto; margin-left: 0; }
.owl-carousel.carousel-center-active-item-3 .owl-stage-outer { overflow: visible; }
.owl-carousel.carousel-center-active-item-3 .owl-item > div { width: 100%; margin-left: auto; transition: ease opacity 300ms; }
.owl-carousel.carousel-center-active-item-3 .owl-item.active > div { margin-right: auto; }
.owl-carousel.carousel-center-active-item-3 .owl-item.active + .owl-item > div { margin-right: auto; margin-left: 0; }
.owl-carousel-light.owl-carousel-light-init-fadeIn { transition: ease opacity 300ms; }
.owl-carousel-light .owl-stage-outer,
.owl-carousel-light .owl-stage { height: 100%; }
.owl-carousel-light .owl-item {
    display: none;
    visibility: hidden;
    opacity: 0;
    position: absolute !important;
    width: 100%;
    height: 100%;
    top: 0;
    transition: ease opacity 300ms;
}
.owl-carousel-light .owl-item.active { display: block; visibility: visible; opacity: 1; }
.owl-carousel-light .owl-dots .owl-dot span { margin: 5px 2px; }
.horizontal-scroller { padding: 32px 0; padding: 2rem 0; height: 100vh; position: relative; }
.horizontal-scroller-scroll { position: relative; overflow: hidden; padding: 32px; padding: 2rem; }
.horizontal-scroller-images { height: 100%; display: flex; align-items: center; }
.horizontal-scroller-item { height: 100%; display: flex; justify-content: center; flex: 0 0 auto; padding: 0 32px; padding: 0 2rem; }
.horizontal-scroller-image { object-fit: fill; margin: 0 auto; max-height: 80vh; padding-top: 10vh; }

/* Carousel — skin (primary colour bindings) */
.owl-carousel .owl-dots .owl-dot.active span,
.owl-carousel .owl-dots .owl-dot:hover span { background-color: var(--primary-100); }
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"],
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"]:hover,
.owl-carousel.show-nav-title .owl-nav button[class*="owl-"].hover { color: var(--primary); }
.owl-carousel:not(.nav-arrows-1):not(.show-nav-title) .owl-nav button[class*="owl-"] {
    background-color: var(--primary);
    border-color: var(--primary) var(--primary) var(--primary-300);
    color: var(--primary-inverse);
}
.owl-carousel:not(.nav-arrows-1):not(.show-nav-title) .owl-nav button[class*="owl-"]:hover,
.owl-carousel:not(.nav-arrows-1):not(.show-nav-title) .owl-nav button[class*="owl-"].hover {
    background-color: var(--primary--100);
    border-color: var(--primary--300) var(--primary--300) var(--primary);
}
.owl-carousel:not(.nav-arrows-1):not(.show-nav-title) .owl-nav button[class*="owl-"]:active,
.owl-carousel:not(.nav-arrows-1):not(.show-nav-title) .owl-nav button[class*="owl-"].active {
    background-color: var(--primary-300);
    background-image: none;
    border-color: var(--primary-300) var(--primary-300) var(--primary-300);
}
.owl-carousel.nav-with-transparency:not(.nav-style-1):not(.show-nav-title):not(.nav-arrows-1) .owl-nav button[class*="owl-"] { background-color: var(--primary-rgba-35); }
.owl-carousel.nav-style-1 .owl-nav .owl-next,
.owl-carousel.nav-style-1 .owl-nav .owl-prev { color: var(--primary) !important; }
.owl-carousel.nav-style-2 .owl-nav .owl-next:before,
.owl-carousel.nav-style-2 .owl-nav .owl-next:after,
.owl-carousel.nav-style-2 .owl-nav .owl-prev:before,
.owl-carousel.nav-style-2 .owl-nav .owl-prev:after { border-color: var(--primary); }
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-prev svg polygon,
.owl-carousel.nav-svg-arrows-1 .owl-nav .owl-next svg polygon { fill: var(--primary); stroke: var(--primary); }
.owl-carousel.nav-arrows-1 .owl-nav .owl-prev,
.owl-carousel.nav-arrows-1 .owl-nav .owl-next { color: var(--primary); }
.owl-carousel.carousel-center-active-item-2 .owl-item.active > div { background: var(--primary); }
.owl-carousel.carousel-bottom-inside-shadow .owl-stage-outer:after { background-image: linear-gradient(360deg, var(--primary) 0%, transparent 100%); }
`;

    $.extend(themestrap, { PluginCarousel });

    $.fn.themestrapPluginCarousel = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCarousel($this, opts);
        });
    };
})).apply(this, [window.themestrap, jQuery]);