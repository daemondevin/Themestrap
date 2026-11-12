/**
 * Themestrap ImageUpload
 *
 * A picture picker for one image: shows the current picture, accepts a click, a drop or a paste, uploads it
 * with progress, and offers a remove button. The shape of the preview can be a circle (avatars) or a box (logos).
 *
 * Markup:
 *
 *   <div data-plugin-imageupload
 *        data-plugin-options='{"endpoint": "/admin/identity", "field": "file", "shape": "circle",
 *                              "current": "/uploads/site/avatar.jpg", "data": {"kind": "avatar"}, "csrf": "..."}'></div>
 *
 * The endpoint receives a multipart POST with the file under `field` plus the entries of `data`. Removing sends
 * `remove=1` with the same data. Both are expected to answer JSON: { ok: true, url: "..." } or { ok: false, errors: [] }.
 *
 * Only files that match `accept` are sent (MIME types, wildcards such as image/* and extensions such as .svg).
 * With `paste` on, a pasted picture goes to one widget: the one with focus, else the one used last, else the
 * first one on screen. Pastes into text fields outside the widget are left alone.
 *
 * Public API (via stored instance or by name):
 *   const u = $('#avatar').data('__pluginImageUpload');
 *   u.setImage(url);     // show a picture, or '' for the empty state
 *   u.getImage();
 *   u.open();            // open the file chooser
 *   u.remove();          // ask the server to remove the picture
 *   u.enable(); u.disable(); u.destroy();
 *   $('#avatar').themestrapPluginImageUpload('disable');
 *
 * Events (native CustomEvent, bubbling, dispatched on the element):
 *   ts.imageupload.change   detail: { instance, url, action }   action is 'upload' or 'remove'
 *   ts.imageupload.error    detail: { instance, message }
 *
 * CSS custom properties (all optional, the colors and radius follow the skin):
 *   --ts-iu-size, --ts-iu-border, --ts-iu-bg, --ts-iu-accent, --ts-iu-text, --ts-iu-muted, --ts-iu-radius, --ts-iu-danger
 *
 * Init.js wiring:
 *   if (typeof $.fn['themestrapPluginImageUpload'] === 'function' && $('[data-plugin-imageupload]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-imageupload]:not(.manual)', 'themestrapPluginImageUpload');
 *   }
 */
// Image Upload
(((themestrap = {}, $) => {
    const instanceName = '__pluginImageUpload';
    const STYLE_ID     = 'ts-imageupload-styles';
    const EVENT        = 'ts.imageupload';

    let instanceCount = 0;
    let seq           = 0;

    const CSS = `
        .ts-iu { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; color: var(--ts-iu-text, inherit); }
        .ts-iu-drop { position: relative; display: grid; place-items: center; flex: 0 0 auto; width: var(--ts-iu-size, 7rem); height: var(--ts-iu-size, 7rem); border: 2px dashed var(--ts-iu-border, var(--ts-skin-border-strong, rgba(128,128,128,.45))); background: var(--ts-iu-bg, var(--ts-skin-surface-2, rgba(128,128,128,.07))); color: var(--ts-iu-muted, var(--ts-skin-text-dim, rgba(128,128,128,.9))); overflow: hidden; cursor: pointer; transition: border-color .15s, background-color .15s; padding: 0; font: inherit; }
        .ts-iu--circle .ts-iu-drop { border-radius: 50%; }
        .ts-iu--box .ts-iu-drop { border-radius: var(--ts-iu-radius, var(--ts-skin-radius, 10px)); width: calc(var(--ts-iu-size, 7rem) * 2.2); }
        .ts-iu-drop:hover, .ts-iu-drop:focus-visible, .ts-iu.is-over .ts-iu-drop { border-color: var(--ts-iu-accent, var(--ts-skin-accent, #00a89f)); outline: none; }
        .ts-iu.is-over .ts-iu-drop { background: color-mix(in srgb, var(--ts-iu-accent, var(--ts-skin-accent, #00a89f)) 10%, transparent); }
        .ts-iu-drop:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ts-iu-accent, var(--ts-skin-accent, #00a89f)) 30%, transparent); }
        .ts-iu.has-image .ts-iu-drop { border-style: solid; }
        .ts-iu-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .ts-iu--box .ts-iu-img { object-fit: contain; padding: .5rem; box-sizing: border-box; }
        .ts-iu-hint { display: flex; flex-direction: column; align-items: center; gap: .25rem; padding: .4rem; font-size: .74rem; line-height: 1.25; text-align: center; }
        .ts-iu-hint svg { width: 1.6rem; height: 1.6rem; }
        .ts-iu.has-image .ts-iu-hint { display: none; }
        .ts-iu-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--ts-iu-accent, var(--ts-skin-accent, #00a89f)); transform-origin: left; transform: scaleX(0); transition: transform .12s; }
        .ts-iu--circle .ts-iu-bar { left: 18%; right: 18%; bottom: 14%; height: 5px; border-radius: 3px; }
        .ts-iu-side { display: flex; flex-direction: column; gap: .5rem; align-items: flex-start; min-width: 0; }
        .ts-iu-row { display: flex; gap: .5rem; flex-wrap: wrap; }
        .ts-iu-msg { margin: 0; font-size: .82rem; min-height: 1.1em; }
        .ts-iu-msg.is-bad { color: var(--ts-iu-danger, var(--ts-skin-danger, #dc2626)); }
        .ts-iu-note { margin: 0; font-size: .78rem; color: var(--ts-iu-muted, var(--ts-skin-text-dim, rgba(128,128,128,.9))); }
        .ts-iu.is-busy .ts-iu-drop { cursor: progress; }
        .ts-iu.is-off { opacity: .55; pointer-events: none; }
        .ts-iu-file { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); opacity: 0; }
        @media (prefers-reduced-motion: reduce) { .ts-iu-drop, .ts-iu-bar { transition: none; } }
    `;

    // Widgets with paste on. One shared listener hands each pasted picture to a single widget
    const pasters = new Set();
    let lastUsed = null;

    function onPaste(e) {
        const ce = e.originalEvent || e;
        const items = (ce.clipboardData || {}).items || [];
        let file = null;
        for (const it of items) {
            if (it.kind === 'file' && /^image\//.test(it.type)) { file = it.getAsFile(); break; }
        }
        if (!file) return;

        // a paste into a text field belongs to that field, unless the field is part of a widget
        const t = ce.target;
        if (t && t.closest && t.closest('input, textarea, [contenteditable=""], [contenteditable="true"]') && !t.closest('.ts-iu')) return;

        const ready = Array.from(pasters).filter((p) => p.$el.is(':visible') && !p.$el.hasClass('is-off'));
        if (!ready.length) return;

        const focus = document.activeElement;
        const onScreen = (p) => {
            const r = p.$el[0].getBoundingClientRect();
            return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
        };
        const byPosition = ready.slice().sort((a, b) => (a.$el[0].compareDocumentPosition(b.$el[0]) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
        const target = ready.find((p) => focus && p.$el[0].contains(focus))
            || (ready.indexOf(lastUsed) >= 0 ? lastUsed : null)
            || byPosition.find(onScreen)
            || byPosition[0];

        ce.preventDefault();
        target._send(file);
    }

    function accepts(file, accept) {
        const rules = String(accept || '').split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
        const type = (file.type || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        if (!rules.length) return /^image\//.test(type);
        return rules.some((r) => r.charAt(0) === '.' ? name.endsWith(r)
            : r.slice(-2) === '/*' ? type.indexOf(r.slice(0, -1)) === 0
            : type === r);
    }

    const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 15V4m0 0L8 8m4-4 4 4"/></svg>';

    class PluginImageUpload {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el     = $el;
            this._uid    = ++seq;
            this._ns     = `.tsiu${this._uid}`;
            this._xhr    = null;

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
            this.options = $.extend(true, {}, PluginImageUpload.defaults, opts, { wrapper: this.$el });
            return this;
        }

        build() {
            const self = this, o = self.options;
            if (!document.getElementById(STYLE_ID)) {
                const st = document.createElement('style');
                st.id = STYLE_ID;
                st.textContent = CSS;
                document.head.appendChild(st);
            }
            instanceCount++;
            const id = `tsiu-${self._uid}`;
            self.$el.addClass(`ts-iu ts-iu--${o.shape === 'circle' ? 'circle' : 'box'}`).empty();
            self.$drop = $('<button type="button" class="ts-iu-drop"></button>').attr('aria-label', o.labels.choose)
                .append($('<span class="ts-iu-hint"></span>').append(ICON, $('<span></span>').text(o.labels.drop)), '<span class="ts-iu-bar"></span>');
            self.$file = $('<input type="file" class="ts-iu-file" tabindex="-1" aria-hidden="true">').attr({ id, accept: o.accept });
            self.$choose = $('<button type="button"></button>').addClass(o.buttonClass).text(o.labels.choose);
            self.$remove = $('<button type="button"></button>').addClass(o.buttonClass).addClass(o.removeClass).text(o.labels.remove);
            self.$msg = $('<p class="ts-iu-msg" role="status" aria-live="polite"></p>');
            self.$note = o.note ? $('<p class="ts-iu-note"></p>').text(o.note) : $();
            const $side = $('<div class="ts-iu-side"></div>').append($('<div class="ts-iu-row"></div>').append(self.$choose, self.$remove), self.$msg, self.$note);
            self.$el.append(self.$drop, self.$file, $side);
            self.setImage(o.current || '');
            return self;
        }

        events() {
            const self = this, o = self.options;
            const open = () => self.open();
            self.$drop.on('click' + self._ns, open);
            self.$choose.on('click' + self._ns, open);
            self.$remove.on('click' + self._ns, () => self.remove());
            self.$file.on('change' + self._ns, () => {
                const f = self.$file[0].files && self.$file[0].files[0];
                if (f) self._send(f);
                self.$file.val('');
            });
            self.$el.on('dragenter' + self._ns + ' dragover' + self._ns, (e) => {
                e.preventDefault();
                self.$el.addClass('is-over');
            });
            self.$el.on('dragleave' + self._ns + ' drop' + self._ns, (e) => {
                e.preventDefault();
                if (e.type === 'dragleave' && self.$el[0].contains(e.relatedTarget)) return;
                self.$el.removeClass('is-over');
                if (e.type === 'drop') {
                    const dt = e.originalEvent.dataTransfer;
                    const f = dt && dt.files && dt.files[0];
                    if (f) self._send(f);
                }
            });
            // remember the widget used last, so a paste goes to it
            self.$el.on('pointerdown' + self._ns + ' focusin' + self._ns, () => { lastUsed = self; });
            if (o.paste) {
                if (!pasters.size) $(document).on('paste.tsiupaste', onPaste);
                pasters.add(self);
            }
            return self;
        }

        _emit(name, detail) {
            const ev = new CustomEvent(`${EVENT}.${name}`, { bubbles: true, detail: Object.assign({ instance: this }, detail) });
            this.$el[0].dispatchEvent(ev);
        }

        _say(text, bad) {
            this.$msg.text(text || '').toggleClass('is-bad', !!bad);
            if (bad) this._emit('error', { message: text });
        }

        _form() {
            const o = this.options, fd = new FormData();
            Object.keys(o.data || {}).forEach((k) => fd.append(k, o.data[k]));
            if (o.csrf) fd.append('_csrf', o.csrf);
            return fd;
        }

        _post(fd, onDone) {
            const self = this, o = self.options;
            const xhr = new XMLHttpRequest();
            self._xhr = xhr;
            self.$el.addClass('is-busy');
            xhr.open('POST', o.endpoint);
            xhr.withCredentials = true;
            xhr.setRequestHeader('Accept', 'application/json');
            if (o.csrf) xhr.setRequestHeader('X-CSRF-Token', o.csrf);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) self.$drop.find('.ts-iu-bar').css('transform', `scaleX(${(e.loaded / e.total).toFixed(3)})`);
            };
            xhr.onload = () => {
                let r = null;
                try { r = JSON.parse(xhr.responseText); } catch (x) { /* handled below */ }
                self._finishPost();
                if (r && r.ok) onDone(r);
                else self._say(r && r.errors && r.errors.length ? r.errors.join(' ') : o.labels.failed, true);
            };
            xhr.onerror = () => { self._finishPost(); self._say(o.labels.failed, true); };
            xhr.send(fd);
        }

        _finishPost() {
            this._xhr = null;
            this.$el.removeClass('is-busy');
            this.$drop.find('.ts-iu-bar').css('transform', 'scaleX(0)');
        }

        _send(file) {
            const self = this, o = self.options;
            if (self._xhr) return;
            if (!accepts(file, o.accept)) { self._say(o.labels.type, true); return; }
            if (o.maxSize && file.size > o.maxSize) { self._say(o.labels.size, true); return; }
            self._say(o.labels.uploading);
            const fd = self._form();
            fd.append(o.field, file, file.name || 'picture');
            self._post(fd, (r) => {
                self.setImage(r.url || '');
                self._say(o.labels.saved);
                self._emit('change', { url: r.url || '', action: 'upload' });
            });
        }

        setImage(url) {
            const self = this;
            self.$drop.find('.ts-iu-img').remove();
            if (url) $('<img class="ts-iu-img" alt="">').attr('src', url).prependTo(self.$drop);
            self._url = url || '';
            self.$el.toggleClass('has-image', !!url);
            self.$remove.prop('hidden', !url);
            self.$choose.text(url ? self.options.labels.change : self.options.labels.choose);
            return self;
        }

        getImage() { return this._url; }

        open() {
            if (!this._xhr && !this.$el.hasClass('is-off')) this.$file[0].click();
            return this;
        }

        remove() {
            const self = this, o = self.options;
            if (self._xhr || !self._url) return self;
            const fd = self._form();
            fd.append('remove', '1');
            self._post(fd, () => {
                self.setImage('');
                self._say(o.labels.removed);
                self._emit('change', { url: '', action: 'remove' });
            });
            return self;
        }

        enable() { this.$el.removeClass('is-off'); return this; }
        disable() { this.$el.addClass('is-off'); return this; }

        destroy() {
            const self = this;
            if (self._xhr) self._xhr.abort();
            self._xhr = null;
            $(document).off(self._ns);
            if (pasters.delete(self) && !pasters.size) $(document).off('paste.tsiupaste');
            if (lastUsed === self) lastUsed = null;
            self.$el.off(self._ns).empty().removeClass('ts-iu ts-iu--circle ts-iu--box has-image is-over is-busy is-off');
            self.$el.removeData(instanceName);
            instanceCount--;
            if (instanceCount <= 0) {
                instanceCount = 0;
                const st = document.getElementById(STYLE_ID);
                if (st) st.remove();
            }
            return this;
        }
    }

    PluginImageUpload.defaults = {
        endpoint:    '',
        field:       'file',
        data:        {},              // extra form entries sent with every request
        csrf:        '',
        current:     '',              // url of the picture to show at first
        shape:       'circle',        // 'circle' or 'box'
        accept:      'image/jpeg,image/png,image/gif,image/webp',   // also decides which files are sent
        maxSize:     0,               // bytes. 0: let the server decide
        paste:       false,           // accept a picture pasted while the page is open
        note:        '',
        buttonClass: 'btn btn-sm btn-outline-secondary',
        removeClass: 'text-danger',   // added to the Remove button after buttonClass
        labels: {
            choose: 'Choose a picture', change: 'Change picture', remove: 'Remove', drop: 'Drop a picture here',
            uploading: 'Uploading…', saved: 'Saved.', removed: 'Removed.',
            failed: 'The picture could not be saved. Please try again.',
            type: 'Please use a JPG, PNG, GIF or WebP picture.', size: 'That picture is too big.'
        }
    };

    $.extend(themestrap, { PluginImageUpload });

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginImageUpload = function (opts, ...args) {
        return this.map(function () {
            const $this = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
                    return instance[opts](...args);
                }
                return instance;
            }

            if (instance) {
                return instance;
            }

            // called without options, each element reads its own data-plugin-options
            const own = opts && typeof opts === 'object' ? opts
                : themestrap.fn && typeof themestrap.fn.getOptions === 'function' ? themestrap.fn.getOptions($this.data('plugin-options')) : {};

            return new PluginImageUpload($this, own);
        });
    };

})).apply(this, [window.themestrap, jQuery]);