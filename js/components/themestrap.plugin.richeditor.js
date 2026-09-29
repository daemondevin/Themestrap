/**
 * Themestrap RichEditor Plugin
 * Lightweight contenteditable editor built on PluginToolbar (formatting controls)
 * and PluginDialog (link dialog). Zero vendor dependencies.
 *
 * Markup:
 *
 *   <div data-plugin-rich-editor
 *        data-plugin-options='{"placeholder": "Write your message...", "minHeight": 220}'>
 *       <p>Optional seed content.</p>
 *   </div>
 *
 * Public API (via stored instance):
 *   const editor = $('#myEditor').data('__pluginRichEditor');
 *   editor.getContent();     // HTML string, '' when empty
 *   editor.getText();        // plain text
 *   editor.setContent(html); // replaces content (trusted HTML only, it is not sanitized)
 *   editor.isEmpty();
 *   editor.clear();
 *   editor.focus();
 *   editor.enable() / editor.disable();
 *   editor.destroy();        // restores the current content into the host element
 *
 * Events dispatched on the host element (native CustomEvent, bubbles):
 *   ts.richeditor.change   detail: { instance }
 *   ts.richeditor.focus    detail: { instance }
 *   ts.richeditor.blur     detail: { instance }
 *
 * CSS custom properties (all optional):
 *   --ts-re-bg, --ts-re-border, --ts-re-border-focus, --ts-re-radius, --ts-re-padding,
 *   --ts-re-toolbar-bg, --ts-re-text, --ts-re-placeholder, --ts-re-link,
 *   --ts-re-accent-contrast
 *
 * Init.js wiring (or a definePlugin entry in themestrap.modules.js):
 *   if ($.isFunction($.fn['themestrapPluginRichEditor']) && $('[data-plugin-rich-editor]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-rich-editor]:not(.manual)', 'themestrapPluginRichEditor');
 *   }
 */
// RichEditor
(((themestrap = {}, $) => {
    const instanceName = '__pluginRichEditor';
    const STYLE_ID     = 'ts-richeditor-styles';
    const EVENT_NS     = 'richeditor';

    let instanceCount = 0;
    let seq           = 0;

    const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
    const MOD    = IS_MAC ? '\u2318' : 'Ctrl+';

    // Theme tokens. Private --re-* properties resolve the public --ts-re-* overrides
    // against a per-theme fallback, so consumers can override on any ancestor.
    const LIGHT_TOKENS = `
        --re-bg:              var(--ts-re-bg, #ffffff);
        --re-border:          var(--ts-re-border, rgba(0,0,0,.14));
        --re-toolbar-bg:      var(--ts-re-toolbar-bg, rgba(0,0,0,.035));
        --re-text:            var(--ts-re-text, #1f2937);
        --re-placeholder:     var(--ts-re-placeholder, rgba(31,41,55,.42));
        --re-link:            var(--ts-re-link, #0b8a83);
        --re-accent:          var(--ts-re-border-focus, #00a89f);
    `;

    const DARK_TOKENS = `
        --re-bg:              var(--ts-re-bg, rgba(255,255,255,.02));
        --re-border:          var(--ts-re-border, rgba(255,255,255,.10));
        --re-toolbar-bg:      var(--ts-re-toolbar-bg, rgba(0,0,0,.20));
        --re-text:            var(--ts-re-text, #cdd8e6);
        --re-placeholder:     var(--ts-re-placeholder, rgba(205,216,230,.35));
        --re-link:            var(--ts-re-link, #00c7be);
        --re-accent:          var(--ts-re-border-focus, #00c7be);
    `;

    const INJECTED_CSS = `
        .ts-richeditor { ${LIGHT_TOKENS} }
        @media (prefers-color-scheme: dark) {
            .ts-richeditor { ${DARK_TOKENS} }
        }
        html.dark .ts-richeditor,
        [data-bs-theme="dark"] .ts-richeditor { ${DARK_TOKENS} }
        [data-bs-theme="light"] .ts-richeditor,
        html [data-bs-theme="light"] .ts-richeditor { ${LIGHT_TOKENS} }

        .ts-richeditor {
            display: flex;
            flex-direction: column;
            background: var(--re-bg);
            border: 1px solid var(--re-border);
            border-radius: var(--ts-re-radius, 6px);
            overflow: hidden;
            transition: border-color .15s, box-shadow .15s;
        }
        .ts-richeditor.ts-re-focused {
            border-color: var(--re-accent);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--re-accent) 18%, transparent);
        }
        .ts-richeditor.ts-re-disabled { opacity: .6; }
        .ts-richeditor.ts-re-disabled .ts-toolbar { pointer-events: none; }

        /* PluginToolbar shell variables are overridden so the toolbar merges
           flush into the top edge of the editor container. */
        .ts-richeditor .ts-toolbar {
            --ts-tb-bg:     var(--re-toolbar-bg);
            --ts-tb-border: transparent;
            --ts-tb-shadow: none;
            --ts-tb-radius: 0;
            width: 100%;
            max-width: 100%;
            flex-wrap: wrap;
            border-radius: 0;
            border-bottom: 1px solid var(--re-border);
        }

        .ts-re-content {
            flex: 1;
            padding: var(--ts-re-padding, 14px 16px);
            outline: none;
            color: var(--re-text);
            font-size: 14px;
            line-height: 1.7;
            font-family: inherit;
            overflow-y: auto;
            word-break: break-word;
        }
        /* Placeholder is floated with zero height so it never affects the caret line */
        .ts-re-content.ts-re-empty::before {
            content: attr(data-placeholder);
            color: var(--re-placeholder);
            pointer-events: none;
            float: left;
            height: 0;
        }
        .ts-re-content a            { color: var(--re-link); }
        .ts-re-content ul,
        .ts-re-content ol           { padding-left: 1.4em; margin: .4em 0; }
        .ts-re-content p            { margin: 0 0 .6em; }
        .ts-re-content p:last-child { margin-bottom: 0; }

        /* Link dialog. The dialog lives on <body>, so it is themed with currentColor
           and inherits its colors from PluginDialog's panel. */
        .ts-re-link-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .10em;
            text-transform: uppercase;
            opacity: .65;
            margin-bottom: 8px;
        }
        .ts-re-link-input {
            display: block;
            width: 100%;
            background: transparent;
            border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
            border-radius: 5px;
            color: inherit;
            font-size: 14px;
            padding: 9px 12px;
            font-family: inherit;
            outline: none;
            transition: border-color .15s;
        }
        .ts-re-link-input:focus            { border-color: var(--ts-re-border-focus, #00a89f); }
        .ts-re-link-input[aria-invalid="true"] { border-color: #dc2626; }
        .ts-re-link-error {
            color: #dc2626;
            font-size: 12px;
            margin: 6px 0 0;
        }
        .ts-re-link-btns {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 16px;
        }
        .ts-re-dlg-remove { margin-right: auto; }
        .ts-re-dlg-cancel,
        .ts-re-dlg-remove,
        .ts-re-dlg-confirm {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 5px;
            border: none;
            font-size: 13px;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: opacity .14s;
        }
        .ts-re-dlg-cancel,
        .ts-re-dlg-remove  { background: color-mix(in srgb, currentColor 10%, transparent); color: inherit; }
        .ts-re-dlg-confirm {
            background: var(--ts-re-border-focus, #00a89f);
            color: var(--ts-re-accent-contrast, #04211f);
            font-weight: 600;
        }
        .ts-re-dlg-cancel:hover,
        .ts-re-dlg-remove:hover  { opacity: .8; }
        .ts-re-dlg-confirm:hover { opacity: .87; }
        .ts-re-dlg-remove[hidden] { display: none; }
    `;

    // Command definitions: key -> execCommand name, icon, label, and optional shortcut letter
    const CMDS = {
        bold:        { cmd: 'bold',                icon: 'fas fa-bold',          label: 'Bold',             key: 'B' },
        italic:      { cmd: 'italic',              icon: 'fas fa-italic',        label: 'Italic',           key: 'I' },
        underline:   { cmd: 'underline',           icon: 'fas fa-underline',     label: 'Underline',        key: 'U' },
        strike:      { cmd: 'strikeThrough',       icon: 'fas fa-strikethrough', label: 'Strikethrough' },
        ul:          { cmd: 'insertUnorderedList', icon: 'fas fa-list-ul',       label: 'Bullet List' },
        ol:          { cmd: 'insertOrderedList',   icon: 'fas fa-list-ol',       label: 'Numbered List' },
        link:        { cmd: 'link',                icon: 'fas fa-link',          label: 'Insert Link',      key: 'K' },
        clearFormat: { cmd: 'removeFormat',        icon: 'fas fa-eraser',        label: 'Clear Formatting' },
    };

    const INLINE_KEYS = ['bold', 'italic', 'underline', 'strike'];
    const LIST_KEYS   = ['ul', 'ol'];
    const ACTION_KEYS = ['link', 'clearFormat'];

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const toPx = (v) => (typeof v === 'number' ? `${v}px` : v);

    const titleFor = (def) => (def.key ? `${def.label} (${MOD}${def.key})` : def.label);

    // Returns a safe URL string, or '' when the input is rejected.
    // Bare addresses get https:// and bare emails get mailto:, anything with a
    // scheme outside the allowed list (javascript:, data:, ...) is refused.
    const normalizeUrl = (raw, protocols) => {
        let url = String(raw || '').replace(/[\u0000-\u001f\u007f\s]+/g, '');
        if (!url) return '';
        if (/^[\/#?]/.test(url)) return url;
        if (/^[^@:\/]+@[^@:\/]+\.[^@:\/]+$/.test(url)) return `mailto:${url}`;
        if (!/^[a-z][a-z0-9+.\-]*:/i.test(url)) url = `https://${url}`;
        const scheme = url.match(/^([a-z][a-z0-9+.\-]*):/i)[1].toLowerCase();
        return protocols.indexOf(scheme) !== -1 ? url : '';
    };

    class PluginRichEditor {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el           = $el;
            this._uid          = ++seq;
            this._ns           = `${EVENT_NS}${this._uid}`;
            this._savedRange   = null;
            this._linkEl       = null;
            this._selectedText = '';
            this._failed       = false;

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
            this.options = $.extend(true, {}, PluginRichEditor.defaults, opts, {
                wrapper: this.$el
            });

            // $.extend(true) merges arrays index by index, so a short user array would be
            // padded with default entries. Arrays are replaced wholesale instead.
            if (opts && Object.prototype.hasOwnProperty.call(opts, 'toolbar')) {
                this.options.toolbar = opts.toolbar;
            }
            if (opts && Array.isArray(opts.allowedProtocols)) {
                this.options.allowedProtocols = opts.allowedProtocols.slice();
            }

            return this;
        }

        build() {
            const self = this;
            const opts = self.options;
            const $el  = opts.wrapper;

            if (!self._requires('themestrapPluginDialog', 'PluginDialog')
                || (opts.toolbar !== false && !self._requires('themestrapPluginToolbar', 'PluginToolbar'))) {
                self._failed = true;
                $el.removeData(instanceName);
                return this;
            }

            instanceCount++;
            if (!document.getElementById(STYLE_ID)) {
                const style       = document.createElement('style');
                style.id          = STYLE_ID;
                style.textContent = INJECTED_CSS;
                document.head.appendChild(style);
            }

            self._enabled = self._enabledKeys();

            // Any markup already inside the host becomes the initial content
            const seed = $el.html().trim();
            $el.empty().addClass('ts-richeditor');

            if (opts.toolbar !== false && self._enabled.size) {
                self.$toolbarEl = self._buildToolbarEl();
                $el.append(self.$toolbarEl);
                self.$toolbarEl.themestrapPluginToolbar($.extend({}, opts.toolbarOptions));
                self._toolbar = self.$toolbarEl.data('__pluginToolbar');
            }

            self.$editable = $('<div class="ts-re-content ts-re-empty" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true"></div>')
                .attr('aria-label', opts.ariaLabel);

            if (opts.minHeight)    self.$editable.css('min-height', toPx(opts.minHeight));
            if (opts.maxHeight)    self.$editable.css('max-height', toPx(opts.maxHeight));
            if (opts.placeholder) {
                self.$editable.attr({ 'data-placeholder': opts.placeholder, 'aria-placeholder': opts.placeholder });
            }
            if (seed) self.$editable.html(seed);
            $el.append(self.$editable);
            self._toggleEmpty();

            if (self._enabled.has('link')) {
                self._buildDialog();
            }

            if (opts.disabled) self.disable();

            return this;
        }

        // Verifies a dependency plugin is loaded, reporting through the framework when it is not
        _requires(method, label) {
            if (typeof $.fn[method] === 'function') return true;

            const file = `components/themestrap.plugin.${label.replace('Plugin', '').toLowerCase()}.js`;
            if (themestrap.fn && typeof themestrap.fn.showErrorMessage === 'function') {
                themestrap.fn.showErrorMessage(
                    'Failed to Load File',
                    `Failed to load: ${label} - Include the following file(s): (${file})`
                );
            } else {
                console.error(`PluginRichEditor: ${label} must be loaded first (${file}).`);
            }
            return false;
        }

        // Set of enabled command keys derived from options.toolbar
        _enabledKeys() {
            const t = this.options.toolbar;
            if (t === true || !Array.isArray(t)) return new Set(Object.keys(CMDS));

            const keys = new Set();
            t.forEach((item) => {
                if (!item || item === '|') return;
                if (CMDS[item]) { keys.add(item); return; }
                // Accept raw execCommand names for backwards compatibility
                const byCmd = Object.keys(CMDS).find((k) => CMDS[k].cmd === item);
                if (byCmd) keys.add(byCmd);
            });
            return keys;
        }

        // PluginToolbar host element and its inner markup
        _buildToolbarEl() {
            const self    = this;
            const enabled = self._enabled;

            const inline  = INLINE_KEYS.filter((k) => enabled.has(k));
            const lists   = LIST_KEYS.filter((k) => enabled.has(k));
            const actions = ACTION_KEYS.filter((k) => enabled.has(k));

            const groups = [];
            if (inline.length) groups.push(self._toggleGroupHtml(inline, 'Inline formatting'));
            if (lists.length)  groups.push(self._toggleGroupHtml(lists, 'List formatting'));
            if (actions.length) {
                groups.push(actions.map((k) => {
                    const d = CMDS[k];
                    return `
                        <button type="button" class="ts-tb-icon"
                                data-toolbar-button data-toolbar-value="${k}"
                                title="${titleFor(d)}" aria-label="${d.label}">
                            <i class="${d.icon}" aria-hidden="true"></i>
                        </button>`;
                }).join(''));
            }

            return $(`<div>${groups.join('<hr data-toolbar-separator>')}</div>`);
        }

        _toggleGroupHtml(keys, label) {
            const items = keys.map((k) => {
                const d = CMDS[k];
                return `
                    <button type="button" class="ts-tb-icon"
                            data-toolbar-toggle-item data-toolbar-value="${k}"
                            title="${titleFor(d)}" aria-label="${d.label}">
                        <i class="${d.icon}" aria-hidden="true"></i>
                    </button>`;
            }).join('');

            return `
                <div data-toolbar-toggle-group data-toolbar-type="multiple"
                     data-toolbar-group-label="${label}">${items}</div>`;
        }

        // Link dialog. PluginDialog owns the modal UX, focus trap, ARIA, and base CSS.
        _buildDialog() {
            const self = this;
            const id   = `ts-re-dlg-${self._uid}`;

            self.$dialog = $(`
                <div data-plugin-dialog id="${id}">
                    <div data-dialog-backdrop></div>
                    <div data-dialog-panel class="dialog-sm">
                        <h2 data-dialog-title>Insert Link</h2>
                        <p data-dialog-description>Paste or type a URL. Select text first to wrap it in the link.</p>
                        <label class="ts-re-link-label" for="${id}-url">URL</label>
                        <input type="text" id="${id}-url" class="ts-re-link-input" inputmode="url"
                               placeholder="https://" autocomplete="off" spellcheck="false">
                        <p class="ts-re-link-error" role="alert" hidden></p>
                        <div class="ts-re-link-btns">
                            <button type="button" class="ts-re-dlg-remove" hidden>Remove link</button>
                            <button type="button" class="ts-re-dlg-cancel" data-dialog-close>Cancel</button>
                            <button type="button" class="ts-re-dlg-confirm">
                                <i class="fas fa-link" aria-hidden="true"></i> <span>Insert</span>
                            </button>
                        </div>
                    </div>
                </div>
            `);

            $('body').append(self.$dialog);
            self.$dialog.themestrapPluginDialog($.extend({}, self.options.dialogOptions));
            self._dialog = self.$dialog.data('__pluginDialog');

            self.$linkInput  = self.$dialog.find('.ts-re-link-input');
            self.$linkError  = self.$dialog.find('.ts-re-link-error');
            self.$linkRemove = self.$dialog.find('.ts-re-dlg-remove');
            self.$linkTitle  = self.$dialog.find('[data-dialog-title]');
            self.$linkOk     = self.$dialog.find('.ts-re-dlg-confirm span');

            return this;
        }

        events() {
            const self = this;
            if (self._failed) return this;

            if (self.$toolbarEl) {
                // Save the selection and keep focus in the editable while the toolbar is
                // pressed. The click (and its toolbar:* event) still fires normally.
                self.$toolbarEl.on(`mousedown.${EVENT_NS}`, (e) => {
                    self._saveSelection();
                    e.preventDefault();
                });

                // PluginToolbar dispatches native CustomEvents, so plain listeners are used
                self.$toolbarEl[0].addEventListener('toolbar:toggle', (e) => {
                    self._execCmd(e.detail.value);
                });
                self.$toolbarEl[0].addEventListener('toolbar:button', (e) => {
                    if (e.detail.value === 'link') {
                        self._openLinkDialog();
                    } else {
                        self._execCmd(e.detail.value);
                    }
                });
            }

            self.$editable
                .on(`focus.${EVENT_NS}`, () => {
                    self.options.wrapper.addClass('ts-re-focused');
                    // Paragraphs instead of bare <div>s so the p rules in the injected CSS apply
                    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (err) { /* unsupported */ }
                    self._dispatch('ts.richeditor.focus');
                    if (typeof self.options.onFocus === 'function') self.options.onFocus.call(self);
                })
                .on(`blur.${EVENT_NS}`, () => {
                    self._saveSelection();
                    self.options.wrapper.removeClass('ts-re-focused');
                    self._dispatch('ts.richeditor.blur');
                    if (typeof self.options.onBlur === 'function') self.options.onBlur.call(self);
                })
                .on(`keyup.${EVENT_NS} mouseup.${EVENT_NS}`, () => {
                    self._syncState();
                })
                .on(`input.${EVENT_NS}`, () => {
                    self._toggleEmpty();
                    self._syncState();
                    self._dispatch('ts.richeditor.change');
                    if (typeof self.options.onChange === 'function') {
                        self.options.onChange.call(self, self.getContent());
                    }
                })
                .on(`keydown.${EVENT_NS}`, (e) => {
                    const mod = e.ctrlKey || e.metaKey;
                    if (mod && !e.altKey && !e.shiftKey && String(e.key).toLowerCase() === 'k'
                        && self._enabled.has('link')) {
                        e.preventDefault();
                        self._openLinkDialog();
                    }
                })
                .on(`paste.${EVENT_NS}`, (e) => {
                    if (!self.options.pastePlainText) return;
                    const data = (e.originalEvent || e).clipboardData;
                    if (!data) return;
                    e.preventDefault();
                    document.execCommand('insertText', false, data.getData('text/plain'));
                });

            // selectionchange only fires on the document, never on an element
            $(document).on(`selectionchange.${self._ns}`, () => {
                if (document.activeElement === self.$editable[0]) self._syncState();
            });

            if (self.$dialog) self._dialogEvents();

            return this;
        }

        _dialogEvents() {
            const self = this;
            const $dlg = self.$dialog;

            $dlg.on(`dialog:open.${EVENT_NS}`, () => {
                const editing = !!self._linkEl;
                self._setLinkError('');
                self.$linkInput.val(editing ? (self._linkEl.getAttribute('href') || '') : '');
                self.$linkRemove.prop('hidden', !editing);
                self.$linkTitle.text(editing ? 'Edit Link' : 'Insert Link');
                self.$linkOk.text(editing ? 'Update' : 'Insert');
                setTimeout(() => self.$linkInput.trigger('focus').trigger('select'), 60);
            });

            $dlg.on(`keydown.${EVENT_NS}`, '.ts-re-link-input', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    self._applyLink();
                }
            });

            $dlg.on(`input.${EVENT_NS}`, '.ts-re-link-input', () => self._setLinkError(''));
            $dlg.on(`click.${EVENT_NS}`, '.ts-re-dlg-confirm', () => self._applyLink());
            $dlg.on(`click.${EVENT_NS}`, '.ts-re-dlg-remove', () => self._removeLink());

            return this;
        }

        // Selection helpers

        _inEditable(range) {
            return !!range && this.$editable[0].contains(range.commonAncestorContainer);
        }

        // The live selection range when it sits inside the editable, otherwise the saved one
        _activeRange() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
                const range = sel.getRangeAt(0);
                if (this._inEditable(range)) return range.cloneRange();
            }
            return this._savedRange ? this._savedRange.cloneRange() : null;
        }

        _saveSelection() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
                const range = sel.getRangeAt(0);
                if (this._inEditable(range)) this._savedRange = range.cloneRange();
            }
            return this;
        }

        _restoreSelection() {
            if (!this._savedRange) return this;
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(this._savedRange);
            }
            return this;
        }

        _selectNode(node) {
            const range = document.createRange();
            range.selectNodeContents(node);
            this._savedRange = range;
            return this._restoreSelection();
        }

        // Format commands

        _execCmd(key) {
            const def = CMDS[key];
            if (!def) return this;

            this._restoreSelection();
            this.$editable.trigger('focus');
            document.execCommand(def.cmd, false, null);
            this._syncState();
            return this;
        }

        // Link dialog flow

        _openLinkDialog() {
            const range = this._activeRange();
            if (!range || !this._dialog) return this;

            this._savedRange   = range;
            this._selectedText = range.toString().trim();

            const node = range.commonAncestorContainer;
            const el   = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
            const a    = el && typeof el.closest === 'function' ? el.closest('a') : null;
            this._linkEl = a && this.$editable[0].contains(a) ? a : null;

            this._dialog.open();
            return this;
        }

        _setLinkError(message) {
            this.$linkError.text(message).prop('hidden', !message);
            this.$linkInput.attr('aria-invalid', message ? 'true' : 'false');
            return this;
        }

        _applyLink() {
            const self = this;
            const raw  = self.$linkInput.val().trim();

            if (!raw) {
                if (self._linkEl) return self._removeLink();
                self._dialog.close();
                return this;
            }

            const url = normalizeUrl(raw, self.options.allowedProtocols);
            if (!url) {
                self._setLinkError('Enter a valid URL (' + self.options.allowedProtocols.join(', ') + ').');
                self.$linkInput.trigger('focus');
                return this;
            }

            self._restoreSelection();
            self.$editable.trigger('focus');

            if (self._linkEl) {
                // Editing: retarget the whole existing link
                self._selectNode(self._linkEl);
                document.execCommand('createLink', false, url);
            } else if (self._selectedText) {
                document.execCommand('createLink', false, url);
            } else {
                document.execCommand('insertHTML', false,
                    `<a href="${escapeHtml(url)}">${escapeHtml(raw)}</a>`
                );
            }

            self._decorateLinks();
            self._dialog.close();
            return this;
        }

        _removeLink() {
            if (this._linkEl) {
                this._restoreSelection();
                this.$editable.trigger('focus');
                this._selectNode(this._linkEl);
                document.execCommand('unlink', false, null);
            }
            this._dialog.close();
            return this;
        }

        // Applies linkTarget and a safe rel to the anchors touched by the current selection
        _decorateLinks() {
            const target = this.options.linkTarget;
            const sel    = window.getSelection();
            if (!target || !sel || !sel.rangeCount) return this;

            this.$editable.find('a[href]').each(function() {
                if (!sel.containsNode(this, true)) return;
                this.setAttribute('target', target);
                this.setAttribute('rel', 'noopener noreferrer');
            });
            return this;
        }

        // State

        // Syncs PluginToolbar toggle items with the real formatting state. Only aria-pressed
        // and the toolbar class are written, so no commands are re-fired.
        _syncState() {
            if (!this.$toolbarEl) return this;

            this.$toolbarEl.find('[data-toolbar-toggle-item]').each(function() {
                const def = CMDS[this.getAttribute('data-toolbar-value')];
                if (!def) return;

                let active = false;
                try { active = !!document.queryCommandState(def.cmd); } catch (err) { /* unsupported */ }
                this.setAttribute('aria-pressed', active ? 'true' : 'false');
                this.classList.toggle('ts-toolbar__toggle-item--on', active);
            });
            return this;
        }

        _toggleEmpty() {
            this.$editable.toggleClass('ts-re-empty', this.isEmpty());
            return this;
        }

        _dispatch(name) {
            this.$el[0].dispatchEvent(new CustomEvent(name, {
                detail: { instance: this },
                bubbles: true
            }));
            return this;
        }

        // Public API

        isEmpty() {
            return this.$editable.text().trim() === ''
                && !this.$editable.find('img, hr, li').length;
        }

        getContent() {
            return this.isEmpty() ? '' : this.$editable.html();
        }

        getText() {
            return this.$editable.text();
        }

        setContent(html) {
            this.$editable.html(html || '');
            this._toggleEmpty();
            return this;
        }

        clear() {
            return this.setContent('');
        }

        focus() {
            this.$editable.trigger('focus');
            return this;
        }

        enable() {
            this.$editable.attr('contenteditable', 'true').removeAttr('aria-disabled');
            this.options.wrapper.removeClass('ts-re-disabled');
            return this;
        }

        disable() {
            this.$editable.attr({ contenteditable: 'false', 'aria-disabled': 'true' });
            this.options.wrapper.removeClass('ts-re-focused').addClass('ts-re-disabled');
            return this;
        }

        destroy() {
            const self = this;
            if (self._failed) return this;

            $(document).off(`selectionchange.${self._ns}`);

            if (self._toolbar && typeof self._toolbar.destroy === 'function') {
                self._toolbar.destroy();
            }
            if (self.$toolbarEl) {
                self.$toolbarEl.off(`.${EVENT_NS}`).remove();
            }

            if (self._dialog && typeof self._dialog.destroy === 'function') {
                self._dialog.destroy();
            }
            if (self.$dialog) {
                self.$dialog.off(`.${EVENT_NS}`).remove();
            }

            // The current content is handed back to the host so a re-init keeps the user's work
            const html = self.getContent();
            self.$editable.off(`.${EVENT_NS}`).remove();
            self.options.wrapper
                .removeClass('ts-richeditor ts-re-focused ts-re-disabled')
                .html(html)
                .removeData(instanceName);

            instanceCount--;
            if (instanceCount <= 0) {
                instanceCount = 0;
                const styleEl = document.getElementById(STYLE_ID);
                if (styleEl) styleEl.remove();
            }

            return this;
        }
    }

    PluginRichEditor.defaults = {
        placeholder:      'Write your message\u2026',
        ariaLabel:        'Rich text editor',
        minHeight:        '220px',
        maxHeight:        null,
        // Command keys. Legacy '|' separators are accepted but ignored, since grouping is automatic.
        // Set to false to render without a toolbar.
        toolbar:          ['bold', 'italic', 'underline', 'strike', '|', 'ul', 'ol', '|', 'link', 'clearFormat'],
        toolbarOptions:   { ariaLabel: 'Text formatting', size: 'sm', full: true },
        dialogOptions:    { animationIn: 'zoomIn', animationOut: 'zoomOut', closeOnBackdrop: true, scrollLock: false },
        linkTarget:       '_blank',    // '' leaves links without a target attribute
        allowedProtocols: ['http', 'https', 'mailto', 'tel'],
        pastePlainText:   true,        // strips formatting from pasted content
        disabled:         false,
        onChange:         null,        // function(html) {}
        onFocus:          null,        // function() {}
        onBlur:           null         // function() {}
    };

    $.extend(themestrap, { PluginRichEditor });

    $.fn.themestrapPluginRichEditor = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginRichEditor($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
