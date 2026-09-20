// Plugin RichEditor
(((themestrap = {}, $) => {
    const instanceName = '__richeditor';
    const STYLE_ID      = 'ts-richeditor-styles';
    let   instanceCount = 0;
    let   uidSeq        = 0;

    const uid = prefix =>
        `${prefix}-${++uidSeq}-${Math.random().toString(36).slice(2, 7)}`;

    const INJECTED_CSS = `
        .ts-richeditor {
            display: flex;
            flex-direction: column;
            background: var(--ts-re-bg, rgba(255,255,255,0.02));
            border: 1px solid var(--ts-re-border, rgba(255,255,255,0.10));
            border-radius: var(--ts-re-radius, 6px);
            overflow: hidden;
            transition: border-color 0.15s;
        }

        .ts-richeditor.ts-re-focused {
            border-color: var(--ts-re-border-focus, #00c7be);
        }

        /* PluginToolbar owns toolbar/item styling.
           RichEditor only supplies its toolbar placement + variable overrides. */
        .ts-re-toolbar {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 2px;
            padding: 6px 8px;
            border-bottom: 1px solid var(--ts-re-border, rgba(255,255,255,0.08));

            --ts-tb-bg: var(--ts-re-toolbar-bg, rgba(0,0,0,0.20));
            --ts-tb-border: transparent;
            --ts-tb-shadow: none;
            --ts-tb-pad: 0;
            --ts-tb-gap: 2px;
            --ts-tb-radius: 0;

            --ts-tb-item-h: 28px;
            --ts-tb-item-px: 8px;
            --ts-tb-item-radius: 4px;
            --ts-tb-item-fg: var(--ts-re-btn-text, rgba(205,216,230,0.65));
            --ts-tb-item-hover-bg: var(--ts-re-btn-hover-bg, rgba(255,255,255,0.08));
            --ts-tb-item-hover-fg: var(--ts-re-btn-text-hover, #e0eaf5);
            --ts-tb-on-bg: var(--ts-re-btn-active-bg, rgba(0,199,190,0.15));
            --ts-tb-on-fg: var(--ts-re-btn-active-text, #00c7be);
            --ts-tb-on-hover-bg: var(--ts-re-btn-active-bg, rgba(0,199,190,0.15));
            --ts-tb-focus-ring: var(--ts-re-border-focus, #00c7be);
        }

        .ts-re-toolbar [data-toolbar-separator] {
            margin-left: 4px;
            margin-right: 4px;
        }

        .ts-re-content {
            flex: 1;
            padding: var(--ts-re-padding, 14px 16px);
            outline: none;
            color: var(--ts-re-text, #cdd8e6);
            font-size: 14px;
            line-height: 1.7;
            font-family: inherit;
            overflow-y: auto;
            word-break: break-word;
        }

        .ts-re-content.ts-re-empty::before {
            content: attr(data-placeholder);
            color: var(--ts-re-placeholder, rgba(205,216,230,0.35));
            pointer-events: none;
            position: absolute;
        }

        .ts-re-content:focus.ts-re-empty::before {
            color: var(--ts-re-placeholder-focus, rgba(205,216,230,0.25));
        }

        .ts-re-content a {
            color: var(--ts-re-link, #00c7be);
        }

        .ts-re-content ul,
        .ts-re-content ol {
            padding-left: 1.4em;
            margin: 0.4em 0;
        }

        .ts-re-content p {
            margin: 0 0 0.6em;
        }

        .ts-re-content p:last-child {
            margin-bottom: 0;
        }
    `;

    const TOOLBAR_DEFS = {
        bold:         { icon: 'fas fa-bold',         label: 'Bold',           cmd: 'bold',                 type: 'toggle' },
        italic:       { icon: 'fas fa-italic',       label: 'Italic',         cmd: 'italic',               type: 'toggle' },
        underline:    { icon: 'fas fa-underline',    label: 'Underline',      cmd: 'underline',            type: 'toggle' },
        strike:       { icon: 'fas fa-strikethrough',label: 'Strikethrough',  cmd: 'strikeThrough',        type: 'toggle' },
        ul:           { icon: 'fas fa-list-ul',      label: 'Bullet List',    cmd: 'insertUnorderedList',  type: 'toggle' },
        ol:           { icon: 'fas fa-list-ol',      label: 'Numbered List',  cmd: 'insertOrderedList',    type: 'toggle' },
        link:         { icon: 'fas fa-link',         label: 'Insert Link',    cmd: 'link',                type: 'button' },
        clearFormat:  { icon: 'fas fa-eraser',       label: 'Clear Format',   cmd: 'removeFormat',         type: 'button' }
    };

    const TOGGLE_COMMANDS = new Set(
        Object.keys(TOOLBAR_DEFS)
            .filter(key => TOOLBAR_DEFS[key].type === 'toggle')
            .map(key => TOOLBAR_DEFS[key].cmd)
    );

    class PluginRichEditor {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) return this;

            this.$el = $el;
            this._uid = uid('ts-re');
            this._savedRange = null;
            this._linkDialog = null;

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
            return this;
        }

        build() {
            const self = this;
            const $el  = self.options.wrapper;

            instanceCount++;

            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style');
                style.id = STYLE_ID;
                style.textContent = INJECTED_CSS;
                (document.head || document.documentElement).appendChild(style);
            }

            $el.addClass('ts-richeditor');

            self.$toolbar = self._buildToolbar();
            self.$editable = $(
                '<div class="ts-re-content ts-re-empty" ' +
                'contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true"></div>'
            );

            if (self.options.minHeight) {
                self.$editable.css('min-height', self.options.minHeight);
            }

            if (self.options.placeholder) {
                self.$editable.attr('data-placeholder', self.options.placeholder);
            }

            $el.append(self.$toolbar).append(self.$editable);

            // PluginToolbar and PluginDialog are dependency plugins. Initialize
            // them after the RichEditor DOM has been constructed.
            if ($.isFunction($.fn.themestrapPluginToolbar)) {
                self.$toolbar.themestrapPluginToolbar({
                    ariaLabel: 'Text formatting',
                    allowDeselect: false,
                    size: 'sm'
                });
            }

            self._buildLinkDialog();

            return this;
        }

        _buildToolbar() {
            const $bar = $(
                '<div class="ts-re-toolbar" data-plugin-toolbar role="toolbar" aria-label="Text formatting"></div>'
            );

            const $group = $(
                '<div data-toolbar-toggle-group data-toolbar-type="multiple" aria-label="Text formatting"></div>'
            );

            this.options.toolbar.forEach(item => {
                if (item === '|') {
                    $bar.append(
                        '<span data-toolbar-separator class="ts-re-sep" role="separator" aria-hidden="true"></span>'
                    );
                    return;
                }

                const def = TOOLBAR_DEFS[item];
                if (!def) return;

                const $button = $(
                    `<button type="button" class="ts-re-btn" title="${def.label}" aria-label="${def.label}">` +
                    `<i class="${def.icon}" aria-hidden="true"></i>` +
                    `</button>`
                );

                $button.attr('data-toolbar-value', def.cmd);

                if (def.type === 'toggle') {
                    $button.attr('data-toolbar-toggle-item', '');
                    $button.attr('data-cmd', def.cmd);
                    $group.append($button);
                } else {
                    $button.attr('data-toolbar-button', '');
                    $button.attr('data-toolbar-value', item);
                    $button.attr('data-cmd', def.cmd);
                    $bar.append($button);
                }
            });

            // Put the toggle group into the toolbar where the first toggle item
            // occurs. This preserves the configured order around separators.
            if ($group.children().length) {
                const $ordered = $('<div class="ts-re-toolbar-items"></div>');
                let $currentGroup = null;

                this.options.toolbar.forEach(item => {
                    if (item === '|') {
                        $ordered.append(
                            '<span data-toolbar-separator class="ts-re-sep" role="separator" aria-hidden="true"></span>'
                        );
                        $currentGroup = null;
                        return;
                    }

                    const def = TOOLBAR_DEFS[item];
                    if (!def) return;

                    if (def.type === 'toggle') {
                        if (!$currentGroup) {
                            $currentGroup = $('<div data-toolbar-toggle-group data-toolbar-type="multiple"></div>');
                            $ordered.append($currentGroup);
                        }

                        const $button = $bar.find(
                            `[data-toolbar-toggle-item][data-toolbar-value="${def.cmd}"]`
                        ).first();

                        if ($button.length) {
                            $currentGroup.append($button.detach());
                        }
                    } else {
                        $currentGroup = null;

                        const $button = $bar.find(
                            `[data-toolbar-button][data-toolbar-value="${item}"]`
                        ).first();

                        if ($button.length) {
                            $ordered.append($button.detach());
                        }
                    }
                });

                $bar.empty().append($ordered.contents());
            }

            return $bar;
        }

        _buildLinkDialog() {
            if (!$.isFunction($.fn.themestrapPluginDialog)) return;

            const self = this;
            const dialogId = uid('ts-re-link-dialog');

            self.$linkDialog = $(
                `<div data-plugin-dialog id="${dialogId}" class="ts-re-link-dialog" aria-label="Insert Link">
                    <div data-dialog-backdrop></div>
                    <div data-dialog-panel>
                        <h2 data-dialog-title>Insert Link</h2>
                        <p data-dialog-description>Enter the URL for the selected text.</p>
                        <label>
                            <span>URL</span>
                            <input type="url" data-re-link-url placeholder="https://example.com" autocomplete="url">
                        </label>
                        <div>
                            <button type="button" data-dialog-close>Cancel</button>
                            <button type="button" data-re-link-save>Insert Link</button>
                        </div>
                    </div>
                </div>`
            );

            // Dialog instances are page-level overlays, so keep them outside
            // the editor's stacking/overflow context.
            $('body').append(self.$linkDialog);

            self.$linkDialog.themestrapPluginDialog({
                closeOnBackdrop: true,
                closeOnEscape: true,
                backdrop: true
            });

            self.$linkDialog.on('click.richeditor', '[data-re-link-save]', function(e) {
                e.preventDefault();

                const url = self.$linkDialog.find('[data-re-link-url]').val().trim();
                if (!url) return;

                self.$linkDialog.data('__pluginDialog').close();
                self._restoreSelection();
                self._execCmd('link', url);
            });
        }

        events() {
            const self = this;

            /*
             * PluginToolbar now emits toolbar:toggle and toolbar:button on click.
             * Prevent the toolbar's mousedown from moving focus away from the
             * contenteditable so the browser keeps the editor selection alive
             * until the click event arrives.
             */
            self.$toolbar.on(
                'mousedown.richeditor',
                '[data-toolbar-toggle-item], [data-toolbar-button]',
                function(e) {
                    e.preventDefault();
                }
            );

            // Native CustomEvent emitted by PluginToolbar.
            self.$toolbar[0].addEventListener(`toolbar:toggle`, self._onToolbarToggle = function(e) {
                const detail = e.detail || {};
                const item = detail.item;
                if (!item) return;

                const cmd = $(item).attr('data-cmd');
                if (!cmd) return;

                self._saveSelection();
                self._execCmd(cmd);
                self._syncState();
            });

            self.$toolbar[0].addEventListener(`toolbar:button`, self._onToolbarButton = function(e) {
                const detail = e.detail || {};
                const button = detail.button;
                if (!button) return;

                const item = $(button).attr('data-toolbar-value');
                const cmd  = $(button).attr('data-cmd');

                if (item === 'link' || cmd === 'link') {
                    self._saveSelection();
                    self._openLinkDialog();
                    return;
                }

                if (cmd) {
                    self._saveSelection();
                    self._execCmd(cmd);
                    self._syncState();
                }
            });

            self.$editable
                .on('focus.richeditor', () => {
                    self.options.wrapper.addClass('ts-re-focused');
                    self.$el[0].dispatchEvent(new CustomEvent('ts.richeditor.focus', {
                        bubbles: true
                    }));
                })
                .on('blur.richeditor', () => {
                    self.options.wrapper.removeClass('ts-re-focused');
                })
                .on('keyup.richeditor mouseup.richeditor', () => self._syncState())
                .on('input.richeditor keyup.richeditor', () => {
                    self._toggleEmpty();
                    self.$el[0].dispatchEvent(new CustomEvent('ts.richeditor.change', {
                        detail: { instance: self },
                        bubbles: true
                    }));
                });

            return this;
        }

        _saveSelection() {
            const editable = this.$editable[0];
            const sel = window.getSelection();

            if (!editable || !sel || !sel.rangeCount) return false;

            const range = sel.getRangeAt(0);

            if (
                !editable.contains(range.startContainer) ||
                !editable.contains(range.endContainer)
            ) {
                return false;
            }

            this._savedRange = range.cloneRange();
            return true;
        }

        _restoreSelection() {
            const range = this._savedRange;
            if (!range) return false;

            const editable = this.$editable[0];
            if (!editable) return false;

            try {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                editable.focus();
                return true;
            } catch (e) {
                return false;
            }
        }

        _openLinkDialog() {
            if (!this.$linkDialog || !this.$linkDialog.length) {
                // Fallback if PluginDialog is not installed.
                const url = window.prompt('Enter URL:', 'https://');
                if (!url || url === 'https://') return;

                this._restoreSelection();
                this._execCmd('link', url);
                return;
            }

            // The selection must be captured before PluginDialog.open()
            // moves focus into the dialog.
            this._saveSelection();

            const $url = this.$linkDialog.find('[data-re-link-url]');
            $url.val('');

            const dialog = this.$linkDialog.data('__pluginDialog');
            if (dialog) {
                dialog.open();
                setTimeout(() => $url.trigger('focus'), 50);
            }
        }

        _execCmd(cmd, value = null) {
            const self = this;

            if (cmd === 'link') {
                const sel = window.getSelection();
                const selected = sel ? sel.toString().trim() : '';

                if (!value) {
                    const url = window.prompt('Enter URL:', 'https://');
                    if (!url || url === 'https://') return;
                    value = url;
                }

                // Restore immediately before execCommand because opening the
                // dialog necessarily moved focus/selection elsewhere.
                self._restoreSelection();

                if (selected) {
                    document.execCommand('createLink', false, value);
                } else {
                    const safeUrl = String(value)
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');

                    document.execCommand(
                        'insertHTML',
                        false,
                        `<a href="${safeUrl}" target="_blank" rel="noopener">${safeUrl}</a>`
                    );
                }

                self.$editable.trigger('focus');
                self._toggleEmpty();
                return;
            }

            self._restoreSelection();
            document.execCommand(cmd, false, value);
            self.$editable.trigger('focus');
        }

        _syncState() {
            const self = this;

            self.$toolbar.find('[data-toolbar-toggle-item]').each(function() {
                const $item = $(this);
                const cmd   = $item.attr('data-cmd');
                let pressed = false;

                try {
                    pressed = !!document.queryCommandState(cmd);
                } catch (e) {
                    pressed = false;
                }

                /*
                 * Deliberately write state directly instead of calling
                 * PluginToolbar.setValue()/trigger('click'). PluginToolbar's
                 * click handler is command-agnostic, but re-triggering a click
                 * here would emit another toolbar:toggle and execute the
                 * editor command a second time.
                 */
                $item
                    .attr('aria-pressed', pressed ? 'true' : 'false')
                    .toggleClass('ts-toolbar__toggle-item--on', pressed);
            });

            // Retain the legacy active class for consumers that used it.
            self.$toolbar.find('[data-toolbar-toggle-item]').each(function() {
                $(this).toggleClass(
                    'is-active',
                    $(this).attr('aria-pressed') === 'true'
                );
            });
        }

        _toggleEmpty() {
            const empty =
                this.$editable.text().trim() === '' &&
                this.$editable.find('img, br').length === 0;

            this.$editable.toggleClass('ts-re-empty', empty);
        }

        getContent() {
            return this.$editable.html();
        }

        setContent(html) {
            this.$editable.html(html || '');
            this._toggleEmpty();
            this._syncState();
            return this;
        }

        clear() {
            return this.setContent('');
        }

        focus() {
            this.$editable.trigger('focus');
            return this;
        }

        destroy() {
            const self = this;

            if (self.$toolbar && self.$toolbar.length) {
                if (self._onToolbarToggle) {
                    self.$toolbar[0].removeEventListener('toolbar:toggle', self._onToolbarToggle);
                }

                if (self._onToolbarButton) {
                    self.$toolbar[0].removeEventListener('toolbar:button', self._onToolbarButton);
                }

                const toolbar = self.$toolbar.data('__pluginToolbar');
                if (toolbar && $.isFunction(toolbar.destroy)) {
                    toolbar.destroy();
                }

                self.$toolbar.off('.richeditor').remove();
            }

            if (self.$linkDialog && self.$linkDialog.length) {
                const dialog = self.$linkDialog.data('__pluginDialog');

                if (dialog && $.isFunction(dialog.destroy)) {
                    dialog.destroy();
                }

                self.$linkDialog.off('.richeditor').remove();
                self.$linkDialog = null;
            }

            if (self.$editable) {
                self.$editable.off('.richeditor').remove();
            }

            self.options.wrapper
                .removeClass('ts-richeditor ts-re-focused')
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
        placeholder: 'Write your message...',
        minHeight:   '220px',
        toolbar: [
            'bold', 'italic', 'underline', 'strike', '|',
            'ul', 'ol', '|',
            'link', 'clearFormat'
        ]
    };

    $.extend(themestrap, { PluginRichEditor });

    $.fn.themestrapPluginRichEditor = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginRichEditor($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
