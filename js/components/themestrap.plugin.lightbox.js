// Lightbox
(((themestrap = {}, $) => {
    const instanceName = '__pluginLightbox';
    const STYLE_ID     = 'themestrap-lightbox-styles';

    const CSS = `
/* Themestrap Lightbox */
.ts-lb-overlay {
    position: fixed;
    inset: 0;
    z-index: 9990;
    background: rgba(0,0,0,.88);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .28s ease;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
}
.ts-lb-overlay.ts-lb-visible {
    opacity: 1;
}
.ts-lb-dialog {
    position: relative;
    max-width: 92vw;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(.94) translateY(12px);
    transition: transform .28s ease;
    outline: none;
}
.ts-lb-overlay.ts-lb-visible .ts-lb-dialog {
    transform: scale(1) translateY(0);
}
.ts-lb-media {
    position: relative;
    line-height: 0;
}
.ts-lb-media img,
.ts-lb-media video {
    display: block;
    max-width: 92vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 3px;
    box-shadow: 0 24px 64px rgba(0,0,0,.6);
}
.ts-lb-media iframe {
    display: block;
    border: none;
    border-radius: 3px;
    box-shadow: 0 24px 64px rgba(0,0,0,.6);
}
.ts-lb-caption {
    margin-top: 14px;
    color: rgba(255,255,255,.82);
    font-size: .875rem;
    line-height: 1.5;
    text-align: center;
    max-width: 640px;
    padding: 0 12px;
}
.ts-lb-close {
    position: fixed;
    top: 18px;
    right: 22px;
    z-index: 9999;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    font-size: 1.25rem;
    line-height: 1;
    transition: background .18s ease, transform .18s ease;
    padding: 0;
}
.ts-lb-close:hover,
.ts-lb-close:focus {
    background: rgba(255,255,255,.26);
    transform: scale(1.1);
    outline: none;
}
.ts-lb-arrow {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9999;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    cursor: pointer;
    color: #fff;
    font-size: 1.3rem;
    transition: background .18s ease, transform .18s ease;
    padding: 0;
    user-select: none;
}
.ts-lb-arrow:hover,
.ts-lb-arrow:focus {
    background: rgba(255,255,255,.26);
    outline: none;
}
.ts-lb-arrow.ts-lb-prev {
    left: 18px;
    transform: translateY(-50%);
}
.ts-lb-arrow.ts-lb-prev:hover { transform: translateY(-50%) scale(1.1); }
.ts-lb-arrow.ts-lb-next {
    right: 18px;
    transform: translateY(-50%);
}
.ts-lb-arrow.ts-lb-next:hover { transform: translateY(-50%) scale(1.1); }
.ts-lb-counter {
    position: fixed;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,.55);
    font-size: .78rem;
    letter-spacing: .08em;
    white-space: nowrap;
    pointer-events: none;
}
.ts-lb-loader {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.ts-lb-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255,255,255,.18);
    border-top-color: rgba(255,255,255,.8);
    border-radius: 50%;
    animation: ts-lb-spin .7s linear infinite;
}
@keyframes ts-lb-spin {
    to { transform: rotate(360deg); }
}
.ts-lb-media-wrap {
    position: relative;
    min-width: 80px;
    min-height: 60px;
}
.ts-lb-media-wrap.ts-lb-loading .ts-lb-loader { display: flex; }
.ts-lb-media-wrap:not(.ts-lb-loading) .ts-lb-loader { display: none; }
.ts-lb-media-wrap.ts-lb-loading img,
.ts-lb-media-wrap.ts-lb-loading video,
.ts-lb-media-wrap.ts-lb-loading iframe {
    opacity: 0;
}
.ts-lb-media-wrap img,
.ts-lb-media-wrap video,
.ts-lb-media-wrap iframe {
    opacity: 1;
    transition: opacity .22s ease;
}
@media (max-width: 576px) {
    .ts-lb-arrow.ts-lb-prev { left: 8px; }
    .ts-lb-arrow.ts-lb-next { right: 8px; }
    .ts-lb-close { top: 10px; right: 12px; }
    .ts-lb-counter { top: 12px; }
}
`;

    function injectCSS() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    function detectType(src) {
        if (!src) return 'unknown';
        const s = src.toLowerCase().replace(/\?.*$/, '');
        if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(s)) return 'image';
        if (/\.(mp4|webm|ogg|ogv)$/.test(s))              return 'video';
        if (/youtube\.com|youtu\.be/.test(s))              return 'youtube';
        if (/vimeo\.com/.test(s))                          return 'vimeo';
        return 'iframe';
    }

    function youtubeId(url) {
        const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    function vimeoId(url) {
        const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return m ? m[1] : null;
    }

    function buildEmbedUrl(src, type) {
        if (type === 'youtube') {
            const id = youtubeId(src);
            return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : src;
        }
        if (type === 'vimeo') {
            const id = vimeoId(src);
            return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : src;
        }
        return src;
    }

    function buildMediaEl(src, type, opts) {
        switch (type) {
            case 'image': {
                const img = document.createElement('img');
                img.alt = '';
                img.src = src;
                return img;
            }
            case 'video': {
                const v = document.createElement('video');
                v.src = src;
                v.controls = true;
                if (opts.videoAutoplay) v.autoplay = true;
                v.style.maxWidth  = opts.mediaWidth  ? opts.mediaWidth  + 'px' : '92vw';
                v.style.maxHeight = opts.mediaHeight ? opts.mediaHeight + 'px' : '80vh';
                return v;
            }
            case 'youtube':
            case 'vimeo':
            case 'iframe': {
                const f = document.createElement('iframe');
                f.src             = buildEmbedUrl(src, type);
                f.allowFullscreen = true;
                f.allow           = 'autoplay; fullscreen; picture-in-picture';
                f.width           = opts.iframeWidth  || 853;
                f.height          = opts.iframeHeight || 480;
                f.style.maxWidth  = '92vw';
                return f;
            }
            default:
                return null;
        }
    }

    let $overlay       = null;
    let _activeInst    = null;   // currently-open PluginLightbox instance
    let _touchX0       = null;

    function getOverlay() {
        if ($overlay && document.body.contains($overlay[0])) return $overlay;

        const html = `
<div class="ts-lb-overlay" role="dialog" aria-modal="true" aria-label="Lightbox">
  <div class="ts-lb-dialog" tabindex="-1">
    <div class="ts-lb-media">
      <div class="ts-lb-media-wrap ts-lb-loading">
        <div class="ts-lb-loader"><div class="ts-lb-spinner"></div></div>
      </div>
    </div>
    <div class="ts-lb-caption"></div>
  </div>
  <button class="ts-lb-close" aria-label="Close lightbox" type="button">&#10005;</button>
  <button class="ts-lb-arrow ts-lb-prev" aria-label="Previous" type="button">&#8249;</button>
  <button class="ts-lb-arrow ts-lb-next" aria-label="Next" type="button">&#8250;</button>
  <div class="ts-lb-counter"></div>
</div>`;
        $overlay = $(html).appendTo('body');

        $overlay.on('click.lightbox', '.ts-lb-close', function() {
            if (_activeInst) _activeInst.close();
        });

        $overlay.on('click.lightbox', function(e) {
            if (_activeInst && _activeInst.options.closeOnBackdrop && $(e.target).is('.ts-lb-overlay')) {
                _activeInst.close();
            }
        });

        $overlay.on('click.lightbox', '.ts-lb-prev', function() {
            if (_activeInst) _activeInst.prev();
        });

        $overlay.on('click.lightbox', '.ts-lb-next', function() {
            if (_activeInst) _activeInst.next();
        });

        $(document).on('keydown.lightbox', function(e) {
            if (!_activeInst) return;
            switch (e.key) {
                case 'Escape':     _activeInst.close(); break;
                case 'ArrowLeft':  _activeInst.prev();  break;
                case 'ArrowRight': _activeInst.next();  break;
            }
        });

        $overlay[0].addEventListener('touchstart', function(e) {
            _touchX0 = e.changedTouches[0].clientX;
        }, { passive: true });

        $overlay[0].addEventListener('touchend', function(e) {
            if (_touchX0 === null || !_activeInst) return;
            const dx = e.changedTouches[0].clientX - _touchX0;
            _touchX0 = null;
            if (Math.abs(dx) < 40) return;
            dx < 0 ? _activeInst.next() : _activeInst.prev();
        }, { passive: true });

        return $overlay;
    }

    class PluginLightbox {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el   = $el;
            this._open = false;

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
            this.options = $.extend(true, {}, PluginLightbox.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            injectCSS();

            const self = this;
            const o    = self.options;

            // Collect gallery items from the trigger element and siblings in group
            self._items   = [];
            self._current = 0;

            const group = o.group || self.$el.data('lightbox-group') || null;

            if (group) {
                // Build item list from all group members in document order
                $(`[data-lightbox-group="${group}"]`).each(function() {
                    self._items.push(self._extractItem($(this)));
                });
            } else {
                // Single item — just this trigger
                self._items.push(self._extractItem(self.$el));
            }

            // Aria: mark trigger as a lightbox opener
            self.$el.attr('role', 'button').attr('aria-haspopup', 'dialog');
            if (!self.$el.attr('tabindex')) self.$el.attr('tabindex', '0');

            return this;
        }

        _extractItem($trigger) {
            return {
                src     : $trigger.attr('href') || $trigger.data('src') || $trigger.find('img').attr('src') || '',
                caption : $trigger.data('caption') || $trigger.attr('title') || $trigger.find('img').attr('alt') || '',
                type    : $trigger.data('type') || detectType($trigger.attr('href') || $trigger.data('src') || ''),
                $trigger: $trigger,
            };
        }

        events() {
            const self = this;

            self.$el.on('click.lightbox keydown.lightbox', function(e) {
                if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                e.stopPropagation();

                // Find this item's index inside the gallery
                const src = $(this).attr('href') || $(this).data('src') || '';
                let idx   = 0;
                $.each(self._items, function(i, item) {
                    if (item.$trigger[0] === self.$el[0] || item.src === src) { idx = i; return false; }
                });

                self.open(idx);
            });

            return this;
        }

        open(idx) {
            const self   = this;
            const o      = self.options;
            self._current = idx || 0;

            const $ov = getOverlay();
            self._$ov = $ov;

            // Arrow / counter visibility
            $ov.find('.ts-lb-prev, .ts-lb-next, .ts-lb-counter').toggle(self._items.length > 1);

            self._loadItem(self._current);

            // Show overlay
            _activeInst = self;
            $ov.css('pointer-events', '').addClass('ts-lb-visible');
            $ov.find('.ts-lb-dialog').trigger('focus');
            $('body').css('overflow', 'hidden');
            self._open = true;

            // Callback
            if ($.isFunction(o.onOpen)) o.onOpen.call(self, self._items[self._current], self._current);

            return this;
        }

        close() {
            const self = this;
            const o    = self.options;
            const $ov  = self._$ov;

            if (!$ov) return this;

            _activeInst = null;
            self._open  = false;
            $ov.removeClass('ts-lb-visible').css('pointer-events', 'none');

            setTimeout(function() {
                // Stop any media
                $ov.find('iframe').attr('src', '');
                $ov.find('video').each(function() { this.pause(); });
                // Wipe content
                $ov.find('.ts-lb-media-wrap').html('<div class="ts-lb-loader"><div class="ts-lb-spinner"></div></div>').addClass('ts-lb-loading');
                $ov.find('.ts-lb-caption').text('');
                $('body').css('overflow', '');
            }, 300);

            if ($.isFunction(o.onClose)) o.onClose.call(self);

            return this;
        }

        next() {
            if (this._items.length < 2) return this;
            this._current = (this._current + 1) % this._items.length;
            this._loadItem(this._current);
            return this;
        }

        prev() {
            if (this._items.length < 2) return this;
            this._current = (this._current - 1 + this._items.length) % this._items.length;
            this._loadItem(this._current);
            return this;
        }

        goTo(idx) {
            if (idx < 0 || idx >= this._items.length) return this;
            this._current = idx;
            this._loadItem(this._current);
            return this;
        }

        isOpen() {
            return this._open;
        }

        destroy() {
            const self = this;
            self.$el.off('.lightbox');
            self.$el.removeAttr('role aria-haspopup tabindex');
            self.$el.removeData(instanceName);
            if (self._open) self.close();
            return this;
        }

        _loadItem(idx) {
            const self  = this;
            const o     = self.options;
            const item  = self._items[idx];
            const $ov   = self._$ov;

            if (!$ov || !item) return;

            const $wrap    = $ov.find('.ts-lb-media-wrap');
            const $caption = $ov.find('.ts-lb-caption');
            const $counter = $ov.find('.ts-lb-counter');

            // Show loader
            $wrap.addClass('ts-lb-loading');
            // Clear previous media
            $wrap.find('img, video, iframe').remove();

            // Counter
            if (self._items.length > 1) {
                $counter.text(`${idx + 1} / ${self._items.length}`);
            }

            // Caption
            $caption.text(item.caption || '');

            const type = item.type || detectType(item.src);
            const el   = buildMediaEl(item.src, type, o);

            if (!el) {
                $wrap.removeClass('ts-lb-loading');
                return;
            }

            const $el = $(el);

            // Width / height overrides for images
            if (type === 'image' && o.mediaWidth)  $el.css('max-width',  o.mediaWidth  + 'px');
            if (type === 'image' && o.mediaHeight) $el.css('max-height', o.mediaHeight + 'px');

            $wrap.append($el);

            function onLoaded() {
                $wrap.removeClass('ts-lb-loading');
                if ($.isFunction(o.onItemLoad)) o.onItemLoad.call(self, item, idx);
            }

            if (type === 'image') {
                if (el.complete) {
                    onLoaded();
                } else {
                    el.onload  = onLoaded;
                    el.onerror = onLoaded;
                }
            } else {
                // iframes / video: remove spinner after short delay
                setTimeout(onLoaded, 200);
            }
        }
    }

    PluginLightbox.defaults = {
        group          : null,    // Group name; also read from data-lightbox-group
        closeOnBackdrop: true,    // Click overlay backdrop to close
        iframeWidth    : 853,     // Default iframe width (YouTube/Vimeo/custom)
        iframeHeight   : 480,     // Default iframe height
        mediaWidth     : null,    // Override max image width in px
        mediaHeight    : null,    // Override max image height in px
        videoAutoplay  : false,   // Autoplay <video> elements
        onOpen         : null,    // Callback(item, index)
        onClose        : null,    // Callback()
        onItemLoad     : null,    // Callback(item, index) — fired when media is loaded
    };

    $.extend(themestrap, {
        PluginLightbox
    });

    $.fn.themestrapPluginLightbox = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginLightbox($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);