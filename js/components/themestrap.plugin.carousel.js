// Carousel
(((themestrap = {}, $) => {
    const instanceName = '__carousel';
    const STYLE_ID    = 'ts-carousel-styles';

    const SVG_PREV = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const SVG_NEXT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    const SVG_UP   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    const SVG_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    class PluginCarousel {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) { return this; }
            this.$el        = $el;
            this.initialHTML = $el.html();
            this._uid       = ++PluginCarousel._uidCounter;
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
            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style');
                style.id          = STYLE_ID;
                style.textContent = PluginCarousel.css;
                document.head.appendChild(style);
            }

            const $el  = this.$el;
            const opts = this.options;

            if ($('html').attr('dir') === 'rtl') opts.rtl = true;

            // Non-slide transitions only support a single visible item
            if (opts.transition !== 'slide') opts.items = 1;

            const $originals = $el.children();
            const count      = $originals.length;
            if (count === 0) return this;

            // State
            this.slideCount   = count;
            this.currentIndex = 0;
            this.realIndex    = 0;
            this.clonedBefore = 0;
            this.clonedAfter  = 0;
            this.autoplayTimer  = null;
            this.isPlaying      = false;
            this._hovering      = false;
            this._focused       = false;
            this._docHidden     = false;
            this._transitioning = false;
            this.isDragging     = false;

            // Build the DOM skeleton
            this.$trackOuter = $('<div class="tsc-track-outer"></div>');
            this.$track      = $('<div class="tsc-track" role="presentation"></div>');
            this.$trackOuter.append(this.$track);

            this.$nav      = this._buildNav();
            this.$dots     = this._buildDots(count);
            this.$counter  = opts.counter     ? this._buildCounter(count) : null;
            this.$progress = opts.progressBar ? this._buildProgress()     : null;
            this.$thumbs   = (opts.thumbs || opts.thumbsEl) ? this._buildThumbs($originals, count) : null;
            this.$progressBar = null; // set inside _buildProgress

            // Re-wire progressBar ref after build
            if (this.$progress) {
                this.$progressBar = this.$progress.find('.tsc-progress-bar');
            }

            // Populate track with items (plus loop clones)
            this._populateTrack($originals, count);

            // Assemble into element
            $el.empty();
            if (opts.progressBar && opts.progressPosition === 'top') $el.append(this.$progress);
            $el.append(this.$trackOuter, this.$nav, this.$dots);
            if (this.$counter)  $el.append(this.$counter);
            if (opts.progressBar && opts.progressPosition !== 'top') $el.append(this.$progress);

            // Stage padding (peekaboo / reveal-adjacent)
            const sp = opts.stagePadding || 0;
            if (sp > 0) {
                this.$trackOuter.css(opts.vertical
                    ? { paddingTop: sp + 'px', paddingBottom: sp + 'px' }
                    : { paddingLeft: sp + 'px', paddingRight: sp + 'px' }
                );
                this.$trackOuter.css('overflow', 'visible');
                $el.css('overflow', 'hidden');
            }

            // Propagate speed + easing to CSS so transitions can pick them up
            $el[0].style.setProperty('--tsc-speed', opts.speed + 'ms');
            $el[0].style.setProperty('--tsc-easing', opts.easing);
            if (opts.gap) $el[0].style.setProperty('--tsc-gap', opts.gap + 'px');

            // ARIA on root
            $el.attr({
                role:                 'region',
                'aria-roledescription': 'carousel',
                'aria-label':           opts.ariaLabel || 'Carousel'
            });

            // Root classes
            $el.addClass(`tsc-carousel tsc-trans-${opts.transition}`);
            if (opts.vertical)           $el.addClass('tsc-vertical');
            if (opts.rtl)                $el.addClass('tsc-rtl');
            if (opts.dotType === 'line') $el.addClass('tsc-dots-line');
            if (opts.dotType === 'number') $el.addClass('tsc-dots-number');
            if (!opts.loop)              $el.addClass('tsc-no-loop');

            // Initial layout
            if (opts.transition === 'slide') {
                this._layout(false);
            } else {
                this._layoutStack();
            }

            this._updateActive();
            this._updateDots();
            this._updateNavState();
            if (this.$counter) this._updateCounter();
            if (this.$thumbs)  this._updateThumbs();
            if (opts.lazyLoad) this._lazyLoad(0);

            $el.addClass('tsc-loaded');

            // Attach thumbnail strip
            this._attachThumbs();

            // Start autoplay
            if (opts.autoplay) {
                this.isPlaying = true;
                this.$track.attr('aria-live', 'off');
                this._applyPlayState();
            } else {
                this.$track.attr('aria-live', 'polite');
            }

            return this;
        }

        _populateTrack($originals, count) {
            const self = this;
            const opts = this.options;
            const isSlideTrans = opts.transition === 'slide';
            const $realItems   = [];

            $originals.each(function(i) {
                const $item = $('<div class="tsc-item"></div>').attr({
                    role:                  'group',
                    'aria-roledescription': 'slide',
                    'aria-label':           `${i + 1} of ${count}`,
                    'aria-hidden':          'true',
                    tabindex:              '-1',
                    'data-tsc-real':       i
                }).append($(this).clone(true, true));

                self.$track.append($item);
                $realItems.push($item[0]);
            });

            // Clone items for seamless looping (slide mode only)
            if (isSlideTrans && opts.loop && count > 1) {
                const visCount    = self._getItemsCount();
                const cloneCount  = Math.min(Math.max(visCount, 2), count);

                // Prepend tail clones so backward navigation wraps smoothly
                for (let i = cloneCount - 1; i >= 0; i--) {
                    const idx = ((count - cloneCount + i) % count + count) % count;
                    $($realItems[idx]).clone(true, true)
                        .addClass('tsc-clone')
                        .attr('aria-hidden', 'true')
                        .prependTo(self.$track);
                    self.clonedBefore++;
                }

                // Append head clones so forward navigation wraps smoothly
                for (let i = 0; i < cloneCount; i++) {
                    $($realItems[i % count]).clone(true, true)
                        .addClass('tsc-clone')
                        .attr('aria-hidden', 'true')
                        .appendTo(self.$track);
                    self.clonedAfter++;
                }

                self.currentIndex = self.clonedBefore;
            }
        }

        _buildNav() {
            const opts = this.options;
            const vert = opts.vertical;
            const $nav = $('<div class="tsc-nav" aria-hidden="true"></div>');

            const prevIcon = Array.isArray(opts.navText) && opts.navText[0]
                ? opts.navText[0] : (vert ? SVG_UP   : SVG_PREV);
            const nextIcon = Array.isArray(opts.navText) && opts.navText[1]
                ? opts.navText[1] : (vert ? SVG_DOWN : SVG_NEXT);

            this.$prev = $(`<button type="button" class="tsc-btn tsc-prev">${prevIcon}</button>`)
                .attr('aria-label', vert ? 'Previous slide (up)' : 'Previous slide');
            this.$next = $(`<button type="button" class="tsc-btn tsc-next">${nextIcon}</button>`)
                .attr('aria-label', vert ? 'Next slide (down)' : 'Next slide');

            opts.rtl
                ? $nav.append(this.$next, this.$prev)
                : $nav.append(this.$prev, this.$next);

            if (!opts.nav) $nav.addClass('tsc-hidden');
            return $nav;
        }

        _buildDots(count) {
            const opts  = this.options;
            const $dots = $('<div class="tsc-dots" role="tablist" aria-label="Slide navigation"></div>');

            for (let i = 0; i < count; i++) {
                const $dot = $('<button type="button" class="tsc-dot" role="tab"></button>').attr({
                    'aria-label':    `Go to slide ${i + 1}`,
                    'aria-selected': 'false',
                    tabindex:        '-1'
                });

                if (opts.dotType === 'number') {
                    $dot.append(`<span class="tsc-dot-label">${i + 1}</span>`);
                } else {
                    $dot.append('<span class="tsc-dot-pip"></span>');
                }

                $dots.append($dot);
            }

            if (!opts.dots) $dots.addClass('tsc-hidden');
            return $dots;
        }

        _buildCounter(count) {
            const total = String(count).padStart(2, '0');
            const $c    = $('<div class="tsc-counter" aria-live="polite" aria-atomic="true"></div>');
            this.$cN     = $('<span class="tsc-counter-n">01</span>');
            this.$cTotal = $(`<span class="tsc-counter-total">${total}</span>`);
            $c.append(this.$cN, '<span class="tsc-counter-sep"> / </span>', this.$cTotal);
            return $c;
        }

        _buildProgress() {
            const $p = $('<div class="tsc-progress" role="presentation" aria-hidden="true"></div>');
            $p.append('<div class="tsc-progress-bar"></div>');
            return $p;
        }

        _buildThumbs($originals, count) {
            const self  = this;
            const $wrap = $('<div class="tsc-thumbs" role="tablist" aria-label="Slide thumbnails"></div>');

            $originals.each(function(i) {
                const $src = $(this);
                const img  = $src.attr('data-thumb') || $src.find('img').first().attr('src') || '';
                const $th  = $('<button type="button" class="tsc-thumb" role="tab"></button>').attr({
                    'aria-label':    `Go to slide ${i + 1}`,
                    'aria-selected': 'false',
                    tabindex:        '-1'
                });

                if (img) {
                    $th.append(`<img src="${img}" alt="" loading="lazy" aria-hidden="true">`);
                } else {
                    $th.append(`<span class="tsc-thumb-idx">${i + 1}</span>`);
                }

                $wrap.append($th);
            });

            return $wrap;
        }

        _attachThumbs() {
            const opts = this.options;
            if (!this.$thumbs) return;

            if (opts.thumbsEl) {
                const $ext = $(opts.thumbsEl).empty();
                this.$thumbs.children().each(function() {
                    $ext.append($(this).clone(true, true));
                });
                // Point $thumbs at the external container so _updateThumbs targets it
                this.$thumbs = $ext;
            } else {
                this.$el.after(this.$thumbs);
            }
        }

        _getItemsCount() {
            const opts = this.options;
            if (opts.transition !== 'slide') return 1;
            const resp = opts.responsive;
            if (!resp || !Object.keys(resp).length) return Math.max(opts.items || 1, 1);
            const w   = window.innerWidth;
            const bps = Object.keys(resp).map(Number).sort((a, b) => a - b);
            let n     = Math.max(opts.items || 1, 1);
            for (const bp of bps) {
                if (w >= bp && resp[bp].items !== undefined) n = resp[bp].items;
            }
            return Math.max(n, 1);
        }

        _layout(animate) {
            const opts     = this.options;
            const $all     = this.$track.children();
            const n        = $all.length;
            const gap      = opts.gap || 0;
            const visCount = this._getItemsCount();

            if (opts.vertical) {
                const wrapH = this.$trackOuter[0].clientHeight
                    || this.$el[0].clientHeight
                    || 400;
                const itemH = (wrapH - gap * (visCount - 1)) / visCount;
                this.$track.css({
                    flexDirection: 'column',
                    width:         '100%',
                    gap:           gap + 'px',
                    height:        (n * (itemH + gap) - gap) + 'px'
                });
                $all.css({ width: '100%', height: itemH + 'px', flexShrink: 0 });
            } else {
                const stageW = this.$trackOuter[0].clientWidth;
                const itemW  = (stageW - gap * (visCount - 1)) / visCount;
                const totalW = n * (itemW + gap) - gap;
                this.$track.css({
                    flexDirection: 'row',
                    gap:           gap + 'px',
                    width:         totalW + 'px',
                    height:        ''
                });
                $all.css({ width: itemW + 'px', height: '', flexShrink: 0 });
            }

            this._moveTo(this.currentIndex, animate !== false);
            if (opts.autoHeight) this._applyAutoHeight();
        }

        _layoutStack() {
            const self = this;
            const $all = this.$track.children('.tsc-item');

            this.$track.css({ position: 'relative', width: '100%' });
            $all.css({ position: 'absolute', top: 0, left: 0, right: 0, width: '100%' });

            // Attempt to auto-size the track outer if no height is set yet
            requestAnimationFrame(() => {
                if (self.$trackOuter[0].offsetHeight > 0) return;
                let max = 0;
                $all.each(function() { max = Math.max(max, this.scrollHeight); });
                if (max > 0) self.$trackOuter.css('min-height', max + 'px');
            });
        }

        _moveTo(index, animate) {
            const opts  = this.options;
            const gap   = opts.gap || 0;
            const speed = animate !== false ? opts.speed : 0;
            const ease  = opts.easing;
            let tf;

            if (opts.vertical) {
                const itemH = this.$track.children().first().outerHeight() || 0;
                tf = `translate3d(0, ${-(index * (itemH + gap))}px, 0)`;
            } else {
                const visCount = this._getItemsCount();
                const stageW   = this.$trackOuter[0].clientWidth;
                const itemW    = (stageW - gap * (visCount - 1)) / visCount;
                const offset   = index * (itemW + gap);
                tf = opts.rtl
                    ? `translate3d(${offset}px, 0, 0)`
                    : `translate3d(${-offset}px, 0, 0)`;
            }

            this.$track.css({
                transition: speed > 0 ? `transform ${speed}ms ${ease}` : 'none',
                transform:  tf
            });
        }

        _navigate(dir) {
            const opts  = this.options;
            const count = this.slideCount;
            const group = Math.max(opts.group || 1, 1);

            if (this._transitioning) return;

            if (opts.progressBar) this._resetProgress();

            if (opts.transition !== 'slide') {
                let target = this.realIndex + dir * group;
                if (opts.loop) {
                    target = ((target % count) + count) % count;
                } else {
                    target = Math.max(0, Math.min(target, count - 1));
                    if (target === this.realIndex) return;
                }
                this._slideFade(target, true);
            } else {
                let target = this.currentIndex + dir * group;
                if (!opts.loop) {
                    const visCount = this._getItemsCount();
                    const minIdx   = this.clonedBefore;
                    const maxIdx   = this.clonedBefore + count - visCount;
                    target = Math.max(minIdx, Math.min(target, maxIdx));
                    if (target === this.currentIndex) return;
                }
                this._slide(target, true);
            }

            if (opts.autoplay && this.isPlaying && opts.progressBar) {
                this._startProgress();
            }
        }

        _slide(targetIndex, animate) {
            const self    = this;
            const opts    = this.options;
            const cb      = this.clonedBefore;
            const count   = this.slideCount;
            const realIdx = ((targetIndex - cb) % count + count) % count;

            this._transitioning = true;

            this.$el[0].dispatchEvent(new CustomEvent('ts.carousel.change', {
                detail: { index: realIdx, total: count },
                bubbles: true
            }));

            this._moveTo(targetIndex, animate);
            this.currentIndex = targetIndex;
            this.realIndex    = realIdx;

            this._updateActive();
            this._updateDots();
            this._updateNavState();
            if (this.$counter) this._updateCounter();
            if (this.$thumbs)  this._updateThumbs();
            if (opts.lazyLoad) this._lazyLoad(realIdx);
            if (opts.pauseMedia) this._pauseMedia();

            const delay = animate ? opts.speed + 50 : 0;

            setTimeout(() => {
                // Silent loop jump when inside the clone region
                if (opts.loop) {
                    if (self.currentIndex >= cb + count) {
                        self.currentIndex -= count;
                        self._moveTo(self.currentIndex, false);
                    } else if (self.currentIndex < cb) {
                        self.currentIndex += count;
                        self._moveTo(self.currentIndex, false);
                    }
                }

                self._transitioning = false;

                self.$el[0].dispatchEvent(new CustomEvent('ts.carousel.changed', {
                    detail: { index: self.realIndex, total: count },
                    bubbles: true
                }));
            }, delay);
        }

        _slideFade(targetIdx, animate) {
            const self  = this;
            const opts  = this.options;
            const count = this.slideCount;
            const $items = this.$track.children('.tsc-item');

            if (targetIdx === this.realIndex) return;

            this._transitioning = true;

            this.$el[0].dispatchEvent(new CustomEvent('ts.carousel.change', {
                detail: { index: targetIdx, total: count },
                bubbles: true
            }));

            const $cur = $items.eq(this.realIndex);
            const $nxt = $items.eq(targetIdx);
            const tr   = opts.transition;

            if (!animate || opts.speed === 0) {
                $cur.removeClass('tsc-active');
                $nxt.addClass('tsc-active');
                this.realIndex    = targetIdx;
                this.currentIndex = targetIdx;
                this._updateDots();
                this._updateNavState();
                if (this.$counter) this._updateCounter();
                if (this.$thumbs)  this._updateThumbs();
                this._transitioning = false;
                this.$el[0].dispatchEvent(new CustomEvent('ts.carousel.changed', {
                    detail: { index: targetIdx, total: count },
                    bubbles: true
                }));
                return;
            }

            // Apply leave animation to the outgoing slide
            $cur.addClass(`tsc-${tr}-leave`);
            // For zoom: add enter animation class to incoming slide before active is set
            if (tr === 'zoom') $nxt.addClass('tsc-zoom-enter');

            // Update state and active classes
            this.realIndex    = targetIdx;
            this.currentIndex = targetIdx;
            this._updateActive();
            this._updateNavState();
            if (opts.lazyLoad) this._lazyLoad(targetIdx);
            if (opts.pauseMedia) this._pauseMedia();

            setTimeout(() => {
                $cur.removeClass(`tsc-${tr}-leave`);
                $nxt.removeClass('tsc-zoom-enter');
                self._updateDots();
                if (self.$counter) self._updateCounter();
                if (self.$thumbs)  self._updateThumbs();
                self._transitioning = false;
                self.$el[0].dispatchEvent(new CustomEvent('ts.carousel.changed', {
                    detail: { index: targetIdx, total: count },
                    bubbles: true
                }));
            }, opts.speed + 20);
        }

        _updateActive() {
            const opts     = this.options;
            const visCount = this._getItemsCount();

            if (opts.transition !== 'slide') {
                const $real = this.$track.children('.tsc-item');
                $real.removeClass('tsc-active').attr({ 'aria-hidden': 'true', tabindex: '-1' });
                $real.eq(this.realIndex)
                    .addClass('tsc-active')
                    .attr({ 'aria-hidden': 'false', tabindex: '0' });
                return;
            }

            const $all = this.$track.children();
            $all.removeClass('tsc-active').attr({ 'aria-hidden': 'true', tabindex: '-1' });
            for (let i = 0; i < visCount; i++) {
                $all.eq(this.currentIndex + i)
                    .addClass('tsc-active')
                    .attr({ 'aria-hidden': 'false', tabindex: '0' });
            }
        }

        _updateDots() {
            const $dots = this.$dots.children('.tsc-dot');
            $dots.removeClass('tsc-dot-active').attr({ 'aria-selected': 'false', tabindex: '-1' });
            $dots.eq(this.realIndex)
                .addClass('tsc-dot-active')
                .attr({ 'aria-selected': 'true', tabindex: '0' });
        }

        _updateNavState() {
            if (this.options.loop) {
                this.$prev.prop('disabled', false).removeClass('tsc-btn-disabled');
                this.$next.prop('disabled', false).removeClass('tsc-btn-disabled');
                return;
            }

            const cb       = this.clonedBefore;
            const count    = this.slideCount;
            const visCount = this._getItemsCount();

            if (this.options.transition !== 'slide') {
                this.$prev.prop('disabled', this.realIndex === 0)
                    .toggleClass('tsc-btn-disabled', this.realIndex === 0);
                this.$next.prop('disabled', this.realIndex === count - 1)
                    .toggleClass('tsc-btn-disabled', this.realIndex === count - 1);
            } else {
                const atStart = this.currentIndex <= cb;
                const atEnd   = this.currentIndex >= cb + count - visCount;
                this.$prev.prop('disabled', atStart).toggleClass('tsc-btn-disabled', atStart);
                this.$next.prop('disabled', atEnd).toggleClass('tsc-btn-disabled', atEnd);
            }
        }

        _updateCounter() {
            if (!this.$cN) return;
            this.$cN.text(String(this.realIndex + 1).padStart(2, '0'));
        }

        _updateThumbs() {
            if (!this.$thumbs) return;
            this.$thumbs.children('.tsc-thumb')
                .removeClass('tsc-thumb-active')
                .attr({ 'aria-selected': 'false', tabindex: '-1' });
            this.$thumbs.children('.tsc-thumb').eq(this.realIndex)
                .addClass('tsc-thumb-active')
                .attr({ 'aria-selected': 'true', tabindex: '0' });
        }

        _lazyLoad(realIdx) {
            const count  = this.slideCount;
            const $real  = this.$track.children('.tsc-item:not(.tsc-clone)');
            const load   = [realIdx, (realIdx + 1) % count, (realIdx - 1 + count) % count];
            load.forEach(i => {
                $real.eq(i).find('[data-lazy-src]').each(function() {
                    const $img = $(this);
                    $img.attr('src', $img.attr('data-lazy-src')).removeAttr('data-lazy-src');
                });
            });
        }

        _pauseMedia() {
            this.$track.children('.tsc-item:not(.tsc-active)')
                .find('video, audio')
                .each(function() { this.pause(); });

            this.$track.children('.tsc-item.tsc-active')
                .find('[data-autoplay]')
                .each(function() { if (this.play) this.play().catch(() => {}); });
        }

        _applyAutoHeight() {
            let max = 0;
            this.$track.children('.tsc-active').each(function() {
                max = Math.max(max, $(this).outerHeight());
            });
            if (max > 0) this.$trackOuter.css('height', max + 'px');
        }

        _applyPlayState() {
            const opts      = this.options;
            const shouldRun = this.isPlaying && !this._hovering && !this._focused && !this._docHidden;

            if (shouldRun && !this.autoplayTimer) {
                this.autoplayTimer = setInterval(() => this._navigate(1), opts.autoplaySpeed);
                this.$track.attr('aria-live', 'off');
                if (opts.progressBar) this._startProgress();
            } else if (!shouldRun && this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
                this.$track.attr('aria-live', 'polite');
                if (opts.progressBar) this._stopProgress();
            }
        }

        _startProgress() {
            if (!this.$progressBar || !this.$progressBar.length) return;
            const dur = this.options.autoplaySpeed;
            this.$progressBar.css({ transition: 'none', width: '0%' });
            void this.$progressBar[0].offsetWidth; // force reflow
            this.$progressBar.css({ transition: `width ${dur}ms linear`, width: '100%' });
        }

        _stopProgress() {
            if (!this.$progressBar || !this.$progressBar.length) return;
            const cur = this.$progressBar[0].offsetWidth;
            const par = this.$progressBar.parent()[0].offsetWidth;
            const pct = par > 0 ? (cur / par * 100) : 0;
            this.$progressBar.css({ transition: 'none', width: pct.toFixed(1) + '%' });
        }

        _resetProgress() {
            if (!this.$progressBar || !this.$progressBar.length) return;
            this.$progressBar.css({ transition: 'none', width: '0%' });
        }

        _setupDrag() {
            const self    = this;
            const opts    = this.options;
            const trackEl = this.$track[0];

            // Dragging only meaningful in slide transition mode
            if (opts.transition !== 'slide') return;

            let startX   = 0, startY = 0, delta = 0;
            let dragging = false, startTranslate = 0, startTime = 0;
            let dirLocked = null;

            const getX = e => e.touches ? e.touches[0].clientX : e.clientX;
            const getY = e => e.touches ? e.touches[0].clientY : e.clientY;

            const getTranslate = () => {
                const m = new DOMMatrix(getComputedStyle(trackEl).transform);
                return opts.vertical ? m.m42 : m.m41;
            };

            const onStart = e => {
                if (self._transitioning) return;
                startX         = getX(e);
                startY         = getY(e);
                delta          = 0;
                dirLocked      = null;
                startTranslate = getTranslate();
                startTime      = Date.now();
                dragging       = true;
                self.$track.css('transition', 'none');
                // Suspend autoplay while dragging
                if (self.autoplayTimer) {
                    clearInterval(self.autoplayTimer);
                    self.autoplayTimer = null;
                    if (opts.progressBar) self._stopProgress();
                }
            };

            const onMove = e => {
                if (!dragging) return;
                const dx = getX(e) - startX;
                const dy = getY(e) - startY;

                // Lock direction on first meaningful movement
                if (!dirLocked) {
                    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
                    dirLocked = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
                    if (!opts.vertical && dirLocked === 'v') { dragging = false; return; }
                    if ( opts.vertical && dirLocked === 'h') { dragging = false; return; }
                }

                e.preventDefault();
                delta = opts.vertical ? dy : dx;
                self.isDragging = true;

                const tf = opts.vertical
                    ? `translate3d(0, ${startTranslate + dy}px, 0)`
                    : `translate3d(${startTranslate + dx}px, 0, 0)`;
                self.$track.css('transform', tf);
            };

            const onEnd = () => {
                if (!dragging) return;
                dragging        = false;
                self.isDragging = false;

                const elapsed  = Math.max(Date.now() - startTime, 1);
                const velocity = Math.abs(delta) / elapsed;
                const visCount = self._getItemsCount();
                const itemSize = opts.vertical
                    ? (self.$track.children().first().outerHeight() || 100)
                    : (self.$trackOuter[0].clientWidth / visCount);

                const threshold = itemSize * 0.2;
                const fastSwipe = velocity > 0.3;

                if ((Math.abs(delta) > threshold || fastSwipe) && delta < 0) {
                    self._navigate(1);
                } else if ((Math.abs(delta) > threshold || fastSwipe) && delta > 0) {
                    self._navigate(-1);
                } else {
                    // Snap back to current position
                    self._moveTo(self.currentIndex, true);
                }

                // Restore autoplay after drag
                if (self.isPlaying && !self._hovering && !self._focused && !self._docHidden) {
                    self._applyPlayState();
                }
            };

            if (opts.mouseDrag !== false) {
                trackEl.addEventListener('mousedown', onStart);
                this._onDocMove = onMove;
                this._onDocUp   = onEnd;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onEnd);
                trackEl.style.cursor = 'grab';
            }

            if (opts.touchDrag !== false) {
                trackEl.addEventListener('touchstart', onStart, { passive: true });
                trackEl.addEventListener('touchmove',  onMove,  { passive: false });
                trackEl.addEventListener('touchend',   onEnd);
            }
        }

        events() {
            const self = this;
            const $el  = this.$el;
            const opts = this.options;
            const ns   = `.tsc-${this._uid}`;

            // Prev / next buttons
            this.$prev.on(`click${ns}`, e => {
                e.preventDefault();
                self._navigate(-1);
            });
            this.$next.on(`click${ns}`, e => {
                e.preventDefault();
                self._navigate(1);
            });

            // Dot clicks
            this.$dots.on(`click${ns}`, '.tsc-dot', function() {
                self.to($(this).index());
            });

            // Thumbnail clicks (both inline and external containers use the same $thumbs ref)
            if (this.$thumbs) {
                this.$thumbs.on(`click${ns}`, '.tsc-thumb', function() {
                    self.to($(this).index());
                });
            }

            // Keyboard navigation
            if (opts.keyboard) {
                $el.attr('tabindex', '0');
                $el.on(`keydown${ns}`, e => {
                    const k     = e.key;
                    const vert  = opts.vertical;
                    const prev  = vert ? 'ArrowUp'   : 'ArrowLeft';
                    const next  = vert ? 'ArrowDown'  : 'ArrowRight';
                    if (k === prev)   { e.preventDefault(); self._navigate(-1); }
                    if (k === next)   { e.preventDefault(); self._navigate(1);  }
                    if (k === 'Home') { e.preventDefault(); self.to(0); }
                    if (k === 'End')  { e.preventDefault(); self.to(self.slideCount - 1); }
                });
            }

            // Hover pause
            if (opts.autoplay && opts.pauseOnHover) {
                $el.on(`mouseenter${ns}`, () => { self._hovering = true;  self._applyPlayState(); });
                $el.on(`mouseleave${ns}`, () => { self._hovering = false; self._applyPlayState(); });
            }

            // Focus pause (helps keyboard users)
            if (opts.autoplay && opts.pauseOnFocus) {
                $el.on(`focusin${ns}`,  () => { self._focused = true;  self._applyPlayState(); });
                $el.on(`focusout${ns}`, () => { self._focused = false; self._applyPlayState(); });
            }

            // Page Visibility API pause
            if (opts.autoplay && opts.pauseOnVisibility) {
                this._onVisChange = () => {
                    self._docHidden = document.hidden;
                    self._applyPlayState();
                };
                document.addEventListener('visibilitychange', this._onVisChange);
            }

            // Drag / swipe
            this._setupDrag();

            // Responsive relayout via ResizeObserver
            if (window.ResizeObserver) {
                this._resizeObs = new ResizeObserver(() => {
                    if (opts.transition === 'slide') {
                        self._layout(false);
                        self._updateActive();
                        self._updateNavState();
                    }
                });
                this._resizeObs.observe(this.$trackOuter[0]);
            } else {
                let resizeTimer;
                $(window).on(`resize${ns}`, () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        if (opts.transition === 'slide') {
                            self._layout(false);
                            self._updateActive();
                            self._updateNavState();
                        }
                    }, 150);
                });
            }

            // PluginAnimate integration: re-trigger appear animations on active slides
            if (opts.animateIn || opts.animateOut) {
                $el[0].addEventListener('ts.carousel.changed', () => {
                    $el.find('.tsc-item.tsc-active [data-appear-animation]').each(function() {
                        const $this      = $(this);
                        const pluginOpts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                        if (typeof $.fn.themestrapPluginAnimate === 'function') {
                            $this.themestrapPluginAnimate(pluginOpts);
                        }
                    });
                });
            }

            // Re-run PluginIcon on cloned items when they activate
            if ($el.find('[data-icon]').length) {
                $el[0].addEventListener('ts.carousel.changed', () => {
                    $el.find('.tsc-clone.tsc-active [data-icon]').each(function() {
                        const $this      = $(this);
                        const pluginOpts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                        if (typeof $.fn.themestrapPluginIcon === 'function') {
                            $this.themestrapPluginIcon(pluginOpts);
                        }
                    });
                });
            }

            return this;
        }

        // Public: navigate to a specific 0-based real slide index
        to(index) {
            const opts    = this.options;
            const count   = this.slideCount;
            const realIdx = ((index % count) + count) % count;

            if (opts.transition !== 'slide') {
                this._slideFade(realIdx, true);
            } else {
                this._slide(this.clonedBefore + realIdx, true);
            }

            if (opts.progressBar) this._resetProgress();
            if (opts.autoplay && this.isPlaying) this._startProgress();
            return this;
        }

        next()  { this._navigate(1);  return this; }
        prev()  { this._navigate(-1); return this; }

        play() {
            this.isPlaying = true;
            this.$track.attr('aria-live', 'off');
            this._applyPlayState();
            return this;
        }

        pause() {
            this.isPlaying = false;
            this.$track.attr('aria-live', 'polite');
            this._applyPlayState();
            return this;
        }

        destroy() {
            const ns = `.tsc-${this._uid}`;

            if (this.autoplayTimer) clearInterval(this.autoplayTimer);
            if (this._resizeObs)   this._resizeObs.disconnect();
            if (this._onVisChange) document.removeEventListener('visibilitychange', this._onVisChange);
            if (this._onDocMove)   document.removeEventListener('mousemove', this._onDocMove);
            if (this._onDocUp)     document.removeEventListener('mouseup',   this._onDocUp);

            $(window).off(ns);
            this.$el.off(ns);
            if (this.$thumbs) this.$thumbs.off(ns);

            // Remove inline thumbnail strip from DOM
            if (this.$thumbs && !this.options.thumbsEl) {
                this.$thumbs.remove();
            }

            this.$el.html(this.initialHTML);
            this.$el
                .removeClass('tsc-carousel tsc-loaded tsc-vertical tsc-rtl tsc-no-loop tsc-dots-line tsc-dots-number')
                .removeAttr('role aria-roledescription aria-label tabindex style')
                .css({ overflow: '' })
                .removeData(instanceName);

            PluginCarousel.instances = Math.max(0, PluginCarousel.instances - 1);

            if (PluginCarousel.instances === 0) {
                const styleEl = document.getElementById(STYLE_ID);
                if (styleEl) styleEl.remove();
            }

            return this;
        }
    }

    PluginCarousel.instances   = 0;
    PluginCarousel._uidCounter = 0;

    PluginCarousel.defaults = {
        // Core
        items:      1,
        loop:       true,
        transition: 'slide',   // 'slide' | 'fade' | 'zoom'
        speed:      500,
        easing:     'cubic-bezier(0.4, 0, 0.2, 1)',
        group:      1,         // slides to advance per interaction

        // Responsive breakpoints (slide mode only)
        responsive: {},

        // Autoplay
        autoplay:           false,
        autoplaySpeed:      5000,
        pauseOnHover:       true,
        pauseOnFocus:       true,
        pauseOnVisibility:  true,

        // Navigation
        nav:              true,
        navText:          [],
        dots:             true,
        dotType:          'default',  // 'default' | 'line' | 'number'
        counter:          false,
        progressBar:      false,
        progressPosition: 'bottom',   // 'top' | 'bottom'

        // Thumbnails
        thumbs:   false,
        thumbsEl: null,   // CSS selector for an external thumbnail container

        // Interaction
        touchDrag: true,
        mouseDrag: true,
        keyboard:  true,

        // Layout
        rtl:          false,
        vertical:     false,
        stagePadding: 0,
        gap:          0,
        autoHeight:   false,

        // Media
        lazyLoad:   true,
        pauseMedia: false,

        // PluginAnimate compatibility
        animateIn:  null,
        animateOut: null,

        // ARIA
        ariaLabel: 'Carousel',

        // Init system
        forceInit: false,
        accY:      0
    };

    PluginCarousel.css = `
.tsc-carousel {
    --tsc-speed:               500ms;
    --tsc-easing:              cubic-bezier(0.4, 0, 0.2, 1);
    --tsc-nav-size:            46px;
    --tsc-nav-offset:          -23px;
    --tsc-nav-bg:              rgba(0,0,0,.5);
    --tsc-nav-bg-hover:        rgba(0,0,0,.78);
    --tsc-nav-color:           #fff;
    --tsc-nav-radius:          50%;
    --tsc-nav-icon:            20px;
    --tsc-nav-border:          none;
    --tsc-nav-shadow:          0 2px 8px rgba(0,0,0,.25);
    --tsc-dot-size:            8px;
    --tsc-dot-gap:             8px;
    --tsc-dot-color:           rgba(0,0,0,.22);
    --tsc-dot-active-color:    var(--primary, #0d6efd);
    --tsc-dot-line-w:          22px;
    --tsc-dot-line-h:          3px;
    --tsc-dot-num-size:        28px;
    --tsc-progress-h:          3px;
    --tsc-progress-bg:         rgba(0,0,0,.1);
    --tsc-progress-color:      var(--primary, #0d6efd);
    --tsc-counter-color:       var(--grey-600, #6c757d);
    --tsc-thumb-size:          72px;
    --tsc-thumb-gap:           6px;
    --tsc-thumb-radius:        6px;
    --tsc-thumb-opacity:       .5;
    --tsc-thumb-opacity-hover: 1;
    --tsc-thumb-border:        2px solid transparent;
    --tsc-thumb-border-active: 2px solid var(--primary, #0d6efd);
    --tsc-gap:                 0px;

    position: relative;
    z-index: 1;
    opacity: 0;
    touch-action: pan-y;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
}
.tsc-carousel.tsc-loaded {
    opacity: 1;
    transition: opacity .25s ease;
}
.tsc-carousel.tsc-vertical {
    touch-action: pan-x;
    display: flex;
    flex-direction: column;
    overflow: visible;
}
.tsc-carousel.tsc-vertical .tsc-track-outer {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    width: 100%;
}
.tsc-carousel.tsc-vertical .tsc-item {
    overflow: hidden;
}

.tsc-track-outer {
    position: relative;
    overflow: hidden;
    width: 100%;
}
.tsc-track {
    display: flex;
    will-change: transform;
    backface-visibility: hidden;
}
.tsc-item {
    flex-shrink: 0;
    position: relative;
    box-sizing: border-box;
    -webkit-touch-callout: none;
    outline: none;
}
.tsc-item img {
    max-width: 100%;
    height: auto;
    pointer-events: none;
}
.tsc-item:focus-visible {
    outline: 2px solid var(--primary, #0d6efd);
    outline-offset: -2px;
}
.tsc-carousel.tsc-no-loop .tsc-clone {
    display: none;
}

/* Navigation */
.tsc-nav {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
}
.tsc-btn {
    pointer-events: all;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tsc-nav-size);
    height: var(--tsc-nav-size);
    border-radius: var(--tsc-nav-radius);
    background: var(--tsc-nav-bg);
    border: var(--tsc-nav-border);
    color: var(--tsc-nav-color);
    box-shadow: var(--tsc-nav-shadow);
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: background .2s ease, box-shadow .2s ease, opacity .2s ease;
    outline: none;
}
.tsc-btn:hover {
    background: var(--tsc-nav-bg-hover);
}
.tsc-btn:focus-visible {
    outline: 2px solid var(--tsc-nav-color);
    outline-offset: 2px;
}
.tsc-btn.tsc-btn-disabled {
    opacity: .3;
    pointer-events: none;
}
.tsc-btn svg {
    width: var(--tsc-nav-icon);
    height: var(--tsc-nav-icon);
    pointer-events: none;
    display: block;
}
.tsc-prev { left:  var(--tsc-nav-offset); }
.tsc-next { right: var(--tsc-nav-offset); }

.tsc-carousel.tsc-rtl .tsc-prev { left: auto; right: var(--tsc-nav-offset); }
.tsc-carousel.tsc-rtl .tsc-next { right: auto; left: var(--tsc-nav-offset); }

.tsc-carousel.tsc-vertical .tsc-nav {
    /* Constrain the absolute overlay to the trackOuter, not the whole carousel */
    bottom: auto;
    height: 100%;
}
.tsc-carousel.tsc-vertical .tsc-btn {
    left: 50%;
    right: auto;
    top: auto;
    transform: translateX(-50%);
}
/* Buttons sit just inside the track edges rather than outside */
.tsc-carousel.tsc-vertical .tsc-prev { top: 10px; }
.tsc-carousel.tsc-vertical .tsc-next { bottom: 10px; }

/* Dots */
.tsc-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--tsc-dot-gap);
    padding: 14px 0 4px;
}
.tsc-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    outline: none;
}
.tsc-dot:focus-visible {
    outline: 2px solid var(--primary, #0d6efd);
    outline-offset: 2px;
    border-radius: 4px;
}
.tsc-dot-pip {
    display: block;
    width: var(--tsc-dot-size);
    height: var(--tsc-dot-size);
    border-radius: 50%;
    background: var(--tsc-dot-color);
    transition: background .25s ease, transform .25s ease, width .25s ease;
}
.tsc-dot.tsc-dot-active .tsc-dot-pip,
.tsc-dot:hover .tsc-dot-pip {
    background: var(--tsc-dot-active-color);
}
.tsc-dot.tsc-dot-active .tsc-dot-pip {
    transform: scale(1.4);
}

/* Dot type: line */
.tsc-dots-line .tsc-dot-pip {
    width: var(--tsc-dot-line-w);
    height: var(--tsc-dot-line-h);
    border-radius: 2px;
    transform: none !important;
}
.tsc-dots-line .tsc-dot.tsc-dot-active .tsc-dot-pip {
    width: calc(var(--tsc-dot-line-w) * 2);
}

/* Dot type: number */
.tsc-dots-number .tsc-dot {
    width: var(--tsc-dot-num-size);
    height: var(--tsc-dot-num-size);
    border-radius: 50%;
    border: 1.5px solid var(--tsc-dot-color);
    color: var(--tsc-dot-color);
    font-size: .7rem;
    font-weight: 600;
    line-height: 1;
    padding: 0;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
}
.tsc-dots-number .tsc-dot.tsc-dot-active {
    background: var(--tsc-dot-active-color);
    border-color: var(--tsc-dot-active-color);
    color: #fff;
}

/* Counter */
.tsc-counter {
    text-align: center;
    padding: 8px 0 4px;
    font-size: .82rem;
    color: var(--tsc-counter-color);
    letter-spacing: .06em;
    line-height: 1;
}
.tsc-counter-n { font-weight: 700; }
.tsc-counter-sep,
.tsc-counter-total { opacity: .55; }

/* Progress bar */
.tsc-progress {
    width: 100%;
    height: var(--tsc-progress-h);
    background: var(--tsc-progress-bg);
    overflow: hidden;
    flex-shrink: 0;
}
.tsc-progress-bar {
    height: 100%;
    width: 0%;
    background: var(--tsc-progress-color);
}

/* Thumbnail strip */
.tsc-thumbs {
    display: flex;
    gap: var(--tsc-thumb-gap);
    justify-content: center;
    flex-wrap: wrap;
    padding: 8px 0 0;
}
.tsc-thumb {
    flex: 0 0 var(--tsc-thumb-size);
    width: var(--tsc-thumb-size);
    height: var(--tsc-thumb-size);
    border-radius: var(--tsc-thumb-radius);
    border: var(--tsc-thumb-border);
    overflow: hidden;
    padding: 0;
    cursor: pointer;
    opacity: var(--tsc-thumb-opacity);
    background: var(--grey-200, #e9ecef);
    transition: opacity .2s ease, border-color .2s ease;
    outline: none;
}
.tsc-thumb:hover { opacity: var(--tsc-thumb-opacity-hover); }
.tsc-thumb:focus-visible {
    outline: 2px solid var(--primary, #0d6efd);
    outline-offset: 2px;
}
.tsc-thumb.tsc-thumb-active {
    opacity: var(--tsc-thumb-opacity-hover);
    border: var(--tsc-thumb-border-active);
}
.tsc-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
}
.tsc-thumb-idx {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: .8rem;
    color: var(--grey-600, #6c757d);
}

/* Fade transition */
.tsc-trans-fade .tsc-item {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    opacity: 0;
    z-index: 0;
    transition: opacity var(--tsc-speed) var(--tsc-easing);
}
.tsc-trans-fade .tsc-item.tsc-active {
    opacity: 1;
    z-index: 1;
}
.tsc-trans-fade .tsc-item.tsc-fade-leave {
    opacity: 0;
    z-index: 2;
    transition: opacity var(--tsc-speed) var(--tsc-easing);
}

/* Zoom transition */
.tsc-trans-zoom .tsc-item {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    opacity: 0;
    z-index: 0;
    transform: scale(1);
    transition: opacity var(--tsc-speed) var(--tsc-easing),
                transform var(--tsc-speed) var(--tsc-easing);
}
.tsc-trans-zoom .tsc-item.tsc-active {
    opacity: 1;
    z-index: 1;
    transform: scale(1);
}
.tsc-trans-zoom .tsc-item.tsc-zoom-leave {
    opacity: 0;
    z-index: 2;
    transform: scale(.96);
}
.tsc-trans-zoom .tsc-item.tsc-zoom-enter {
    animation: tsc-zoom-enter-kf var(--tsc-speed) var(--tsc-easing) both;
    z-index: 1;
}
@keyframes tsc-zoom-enter-kf {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1);    }
}

/* Utility */
.tsc-hidden { display: none !important; }

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .tsc-carousel {
        --tsc-dot-color:        rgba(255,255,255,.28);
        --tsc-dot-active-color: var(--primary, #6ea8fe);
        --tsc-progress-bg:      rgba(255,255,255,.12);
        --tsc-counter-color:    rgba(255,255,255,.5);
    }
}
html.dark .tsc-carousel,
[data-bs-theme="dark"] .tsc-carousel {
    --tsc-dot-color:        rgba(255,255,255,.28);
    --tsc-dot-active-color: var(--primary, #6ea8fe);
    --tsc-progress-bg:      rgba(255,255,255,.12);
    --tsc-counter-color:    rgba(255,255,255,.5);
}
[data-bs-theme="light"] .tsc-carousel {
    --tsc-dot-color:        rgba(0,0,0,.22);
    --tsc-dot-active-color: var(--primary, #0d6efd);
    --tsc-progress-bg:      rgba(0,0,0,.1);
    --tsc-counter-color:    var(--grey-600, #6c757d);
}
`;

    $.extend(themestrap, { PluginCarousel });

    $.fn.themestrapPluginCarousel = function(opts) {
        return this.map(function() {
            const $this = $(this);
            const inst  = $this.data(instanceName);

            if (inst) {
                if (typeof opts === 'string' && typeof inst[opts] === 'function') {
                    inst[opts]();
                }
                return inst;
            }

            return new PluginCarousel($this, typeof opts === 'object' ? opts : {});
        });
    };
})).apply(this, [window.themestrap, jQuery]);
