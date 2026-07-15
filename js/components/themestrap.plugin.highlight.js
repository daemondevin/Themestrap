/**
 * Themestrap Syntax Highlight Plugin
 * Wraps highlight.js core with lazy ESM loading, language aliases, promise
 * coalescing, line numbers, pre-highlighted lines, line selection and copy.
 *
 * Part of the Themestrap component library for MODX 3
 *
 * ATTRIBUTE API  (all attributes must live on the <pre> element)
 *   data-plugin-highlight="modx"
 *   data-plugin-highlight="javascript"
 *     Canonical highlight.js language ID (or alias — see LANG_ALIASES below).
 *     Omit or leave blank for plaintext (no coloring, line numbers still apply).
 *
 *   data-plugin-highlight-lines="1,3,5-8"
 *     Comma-separated line numbers and/or inclusive ranges pre-marked with the
 *     .hljs-ln-highlight-line / .hljs-ln-highlight-num classes (amber by default).
 *     Applied after hljs runs — purely presentational, no effect on copy content.
 *
 *   data-plugin-highlight-hljs-config='{"tabReplace":"  "}'
 *     JSON object forwarded to hljs.configure() before highlighting runs.
 *     Any valid hljs configure key is accepted.
 *
 *   data-plugin-options='{"showCopy":true,"lineNumbers":true,"copyTimeout":800}'
 *     Standard Themestrap options object. Accepts all PluginHighlight.defaults keys.
 *     Individual data-plugin-highlight-* attrs take precedence over options in this bag.
 *
 *   id="my-block"
 *     Line anchors use this as a prefix: my-block-L1, my-block-L2 …
 *     A sequential id is auto-generated when absent: codeblock-1-L1, codeblock-1-L2 …
 *
 * ELEMENT NORMALIZATION
 * The plugin always operates on a <pre> element. If the jQuery selector targets
 * a <code> child or a wrapper <div>, the plugin locates the nearest <pre>,
 * relocates any highlight data-* attrs, and uses the <pre> from that point on.
 *
 * USAGE
 *   <pre id="ex1"
 *        data-plugin-highlight="javascript"
 *        data-plugin-highlight-lines="3,7-9"
 *        data-plugin-options='{"lineNumbers":true,"showCopy":true}'><code>
 *       const greet = name => `Hello, ${name}!`;
 *   </code></pre>
 *
 *   <script>
 *     $('#ex1').themestrapPluginHighlight();
 *   </script>
 *
 * Auto-init via themestrap.init.js (requires data-plugin-highlight on the <pre>):
 *
 *   if ($.isFunction($.fn['themestrapPluginHighlight']) && $('[data-plugin-highlight]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-highlight]:not(.manual)', 'themestrapPluginHighlight');
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__highlight';
    
    // Syntax Highlight stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use the this plugin.
    const STYLE_ID = 'ts-syntax-highlight-styles';
    const CSS_TEXT = `            /** 
             *  Themestrap Syntax Highlight — Styles
             */
            /* Code Block */
            .code-highlight {
                
            }

            .code-highlight-header {
                background-color: #282c34;
                width: 100%;
                text-align: right;
                border-radius: var(--border-radius);
            }

            .code-highlight .code-highlight-caption {
                font-size: smaller;
                float: left;
                margin-left: 12px;
                margin-top: 9px;
                color: var(--light-200);
            }

            .code-highlight .topfix {
                background-color: #282c34;
                width: 100%;
                height: 1em;
                margin-top: -1em;
                border-bottom: 1px var(--light-rgba-10) solid;
            }

            .code-highlight .buttons {
                height: 35px;
                margin-right: 5px;
                border: 0;
                outline: 0;
                display: flex;
                transition: 0.2s;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: flex-end;
                align-items: center;
            }

            .code-highlight .buttons .badge {
                margin-right:20px;
            }

            .code-highlight .button svg path, 
            .code-highlight .button svg rect, 
            .code-highlight .button svg polygon {
              fill: var(--light-200);
            }

            .code-highlight .button svg {
                width: 10px;
                height: 10px;
                margin: 0 8px;
            }
            
            /* Light Mode - Inspired by Base16 */
            pre code.hljs {
                display: block;
                overflow-x: auto;
                padding: 1em
            }

            code.hljs {
                padding: 3px 5px
            }

            .hljs {
                color: #383838;
                background: #f8f8f8
            }

            .hljs ::-moz-selection,
            .hljs::-moz-selection {
                background-color: #d8d8d8;
                color: #383838
            }

            .hljs ::selection,
            .hljs::selection {
                background-color: #d8d8d8;
                color: #383838
            }

            .hljs-comment {
                color: #b8b8b8
            }

            .hljs-tag {
                color: #585858
            }

            .hljs-operator,
            .hljs-punctuation,
            .hljs-subst {
                color: #383838
            }

            .hljs-operator {
                opacity: .7
            }

            .hljs-bullet,
            .hljs-deletion,
            .hljs-name,
            .hljs-selector-tag,
            .hljs-template-variable,
            .hljs-variable {
                color: #ab4642
            }

            .hljs-attr,
            .hljs-link,
            .hljs-literal,
            .hljs-number,
            .hljs-symbol,
            .hljs-variable.constant_ {
                color: #dc9656
            }

            .hljs-class .hljs-title,
            .hljs-title,
            .hljs-title.class_ {
                color: #f7ca88
            }

            .hljs-strong {
                font-weight: 700;
                color: #f7ca88
            }

            .hljs-addition,
            .hljs-code,
            .hljs-string,
            .hljs-title.class_.inherited__ {
                color: #a1b56c
            }

            .hljs-built_in,
            .hljs-doctag,
            .hljs-keyword.hljs-atrule,
            .hljs-quote,
            .hljs-regexp {
                color: #86c1b9
            }

            .hljs-attribute,
            .hljs-function .hljs-title,
            .hljs-section,
            .hljs-title.function_,
            .ruby .hljs-property {
                color: #7cafc2
            }

            .diff .hljs-meta,
            .hljs-keyword,
            .hljs-template-tag,
            .hljs-type {
                color: #ba8baf
            }

            .hljs-emphasis {
                color: #ba8baf;
                font-style: italic
            }

            .hljs-meta,
            .hljs-meta .hljs-keyword,
            .hljs-meta .hljs-string {
                color: #a16946
            }

            .hljs-meta .hljs-keyword,
            .hljs-meta-keyword {
                font-weight: 700
            }
            
            /* Dark Mode - Inspired by Base16 */
            html.dark pre code.hljs {
                display: block;
                overflow-x: auto;
                padding: 1em
            }

            html.dark code.hljs {
                padding: 3px 5px
            }

            html.dark .hljs {
                color: #d8d8d8;
                background: #181818
            }

            html.dark .hljs ::-moz-selection,
            html.dark .hljs::-moz-selection {
                background-color: #383838;
                color: #d8d8d8
            }

            html.dark .hljs ::selection,
            html.dark .hljs::selection {
                background-color: #383838;
                color: #d8d8d8
            }

            html.dark .hljs-comment {
                color: #585858
            }

            html.dark .hljs-tag {
                color: #b8b8b8
            }

            html.dark .hljs-operator,
            html.dark .hljs-punctuation,
            html.dark .hljs-subst {
                color: #d8d8d8
            }

            html.dark .hljs-operator {
                opacity: .7
            }

            html.dark .hljs-bullet,
            html.dark .hljs-deletion,
            html.dark .hljs-name,
            html.dark .hljs-selector-tag,
            html.dark .hljs-template-variable,
            html.dark .hljs-variable {
                color: #ab4642
            }

            html.dark .hljs-attr,
            html.dark .hljs-link,
            html.dark .hljs-literal,
            html.dark .hljs-number,
            html.dark .hljs-symbol,
            html.dark .hljs-variable.constant_ {
                color: #dc9656
            }

            html.dark .hljs-class .hljs-title,
            html.dark .hljs-title,
            html.dark .hljs-title.class_ {
                color: #f7ca88
            }

            html.dark .hljs-strong {
                font-weight: 700;
                color: #f7ca88
            }

            html.dark .hljs-addition,
            html.dark .hljs-code,
            html.dark .hljs-string,
            html.dark .hljs-title.class_.inherited__ {
                color: #a1b56c
            }

            html.dark .hljs-built_in,
            html.dark .hljs-doctag,
            html.dark .hljs-keyword.hljs-atrule,
            html.dark .hljs-quote,
            html.dark .hljs-regexp {
                color: #86c1b9
            }

            html.dark .hljs-attribute,
            html.dark .hljs-function .hljs-title,
            html.dark .hljs-section,
            html.dark .hljs-title.function_,
            html.dark .ruby .hljs-property {
                color: #7cafc2
            }

            html.dark .diff .hljs-meta,
            html.dark .hljs-keyword,
            html.dark .hljs-template-tag,
            html.dark .hljs-type {
                color: #ba8baf
            }

            html.dark .hljs-emphasis {
                color: #ba8baf;
                font-style: italic
            }

            html.dark .hljs-meta,
            html.dark .hljs-meta .hljs-keyword,
            html.dark .hljs-meta .hljs-string {
                color: #a16946
            }

            html.dark .hljs-meta .hljs-keyword,
            html.dark .hljs-meta-keyword {
                font-weight: 700
            }

            .hljs-ln-highlight-line {
                background: rgba(229,192,123,.12); 
                border-left: 2px solid #e5c07b; 
                padding-left: 2px;
            }

            .hljs-ln-highlight-num {
                color: #e5c07b; 
                background: rgba(229,192,123,.12);
            }

            pre:not([data-plugin-highlight]) {
                border-radius: 0.5em;
            }

            pre code, pre code.hljs {
              display: block;
              overflow-x: auto;
              padding: 1em
            }

            .hljs-ts-json.attr_ {
               color: var(--secondary);
            }
            .hljs-ts-json.string_ {
               color: var(--primary--300);
            }
            .hljs-ts-json.number_ {
               color: #0288d1;
            }
            .hljs-ts-json.literal_ {
               color: blue;
            }
            .hljs-ts-json.punctuation_ {
               color: #607d8b;
            }

            .hljs-ln-wrapper {
                display: flex;
                width: 100%;
            }

            .hljs-ln-numbers {
                text-align: right;
                margin-right: 10px;
                padding-right: 10px;
                border-right: 1px solid rgba(255,255,255,0.1);
                user-select: none;
            }

            .hljs-ln-number {
                opacity: 0.5;
                padding: 0 5px;
            }

            .hljs-ln-code {
                flex: 1;
            }

            .hljs-ln-line {
                position: relative;
                white-space: pre;
            }

            .hljs-ln-copy {
                position: absolute;
                left: -220px;
                top: -20px;
                opacity: 0;
                cursor: pointer;
                font-size: 12px;
                transition: 0.2s;
            }

            .hljs-ln-copy img {
                width: 16px;
                height: 16px;
            }

            .hljs-ln-line:hover .hljs-ln-copy {
                opacity: 1;
            }

            .hljs-ln-line:hover .hljs-ln-copy {
                opacity: 1;
            }

            .hljs-ln-copy.copied {
                color: #4caf50;
            }

            .hljs-copy-corner {
                position: absolute;
                z-index: 3;
                display: flex;
                flex-direction: column;
            }

            .hljs-copy-btn {
                top: 10px;
                right: 10px;
                opacity: .2;
                align-items: flex-end;
                background-color: var(--light-rgba-20) !important;
            }

            .hljs-copy-btn:hover {
                opacity: 1;
            }
        `;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()). Keeps the CSS out of pages that merely load the script.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    // Maps shorthand / alternate names to canonical highlight.js grammar IDs.
    // Note: hljs registers the XML grammar under both 'xml' and 'html'; using
    // 'html' as the canonical keeps parity with the CDN filename (xml.min.js).
    const LANG_ALIASES = {
        js:    'javascript',
        ts:    'typescript',
        py:    'python',
        rb:    'ruby',
        cs:    'csharp',
        sh:    'bash',
        shell: 'bash',
        yml:   'yaml',
        md:    'markdown',
        htm:   'xml',       // hljs xml grammar lives in xml.min.js; registered as 'html'
        html:  'xml',       //      ''                                      ''
        c:     'c',
        'c++': 'cpp',
    };

    // Languages known to exist on the hljs CDN. Any language NOT in this set
    // produces a console.warn before the import is attempted — catches typos
    // without a silent 404.
    const POPULAR_LANGUAGES = new Set([
        'bash', 'c', 'cpp', 'csharp', 'css', 'dart', 'diff', 'dockerfile',
        'go', 'graphql', 'html', 'ini', 'java', 'javascript', 'json',
        'kotlin', 'less', 'lua', 'makefile', 'markdown', 'modx', 'nginx',
        'objectivec', 'perl', 'php', 'plaintext', 'powershell', 'python',
        'r', 'ruby', 'rust', 'scala', 'scss', 'sql', 'swift', 'toml',
        'typescript', 'vbnet', 'xml', 'yaml',
    ]);

    // Shared caches (global across all instances on the page)
    themestrap._hljs        = null;  // hljs core singleton
    themestrap._hljsLangs   = {};    // { [lang]: true } registration flags
    themestrap._hljsLoading = {};    // { [lang|'__core__']: Promise } — in-flight coalescing

    class PluginHighlight {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            // Always operate on a <pre> — normalize before the re-init guard.
            $el = this._normalizePre($el);

            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

            this
                .setData()
                .setOptions(opts)
                .build();

            return this;
        }

        /**
         * Ensures the working element is a <pre>. When the caller targets a
         * <code> element the plugin walks up to the nearest ancestor <pre>.
         * When the caller targets any other wrapper element the plugin walks
         * down to the first descendant <pre>.
         *
         * Any highlight-related data-* attributes found on the original element
         * are relocated to the <pre> so the plugin reads them from the correct node.
         */
        _normalizePre($el) {
            if ($el.is('pre')) return $el;

            const RELOCATE = [
                'plugin-highlight',
                'plugin-highlight-hljs-config',
                'plugin-highlight-lines',
                'plugin-options',
            ];

            const $pre = $el.is('code')
                ? $el.closest('pre')
                : $el.find('pre').first();

            if (!$pre.length) {
                console.warn('PluginHighlight: no <pre> found relative to the given element. Operating on the element as-is.');
                return $el;
            }

            // Relocate data attrs from the original element to the <pre>
            RELOCATE.forEach(attr => {
                const raw = $el.attr(`data-${attr}`);
                if (raw !== undefined) {
                    $pre.attr(`data-${attr}`, raw);
                    $el.removeAttr(`data-${attr}`);
                }
            });

            // Move id to <pre> when the <pre> has no id of its own
            if ($el.attr('id') && !$pre.attr('id')) {
                $pre.attr('id', $el.attr('id'));
                $el.removeAttr('id');
            }

            return $pre;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            // Standard Themestrap plugin options bag (data-plugin-options)
            const pluginOpts = themestrap.fn.getOptions(
                this.$el.data('plugin-options')
            ) || {};

            // hljs configure object (dedicated attr takes precedence)
            let hljsOptions = {};
            const hljsConfig = themestrap.fn.getOptions(
                this.$el.data('plugin-highlight-hljs-config')
            );
            if (hljsConfig) {
                try {
                    hljsOptions = (typeof hljsConfig === 'string')
                        ? JSON.parse(hljsConfig)
                        : hljsConfig;
                } catch (e) {
                    console.warn('PluginHighlight: invalid JSON in data-plugin-highlight-hljs-config', e);
                }
            }

            // Resolve language — dedicated attr → pluginOpts.language → plaintext
            // Then normalize through the alias map.
            let lang = (
                this.$el.data('plugin-highlight') ||
                pluginOpts.language || ''
            ).toLowerCase().trim();
            lang = LANG_ALIASES[lang] || lang || 'plaintext';

            // Parse pre-highlighted line ranges
            const rawLines = (
                this.$el.data('plugin-highlight-lines') ||
                pluginOpts.highlightLines || ''
            );

            this.options = $.extend(true, {}, PluginHighlight.defaults, pluginOpts, opts, {
                wrapper:        this.$el,
                lang,
                hljsOptions,
                highlightLines: this._parseLineRanges(String(rawLines || '')),
            });

            return this;
        }

        /**
         * Converts a comma-separated string of 1-based line numbers and inclusive
         * ranges into a flat Set<number>.
         *
         *   "1,3,5-8"  →  Set { 1, 3, 5, 6, 7, 8 }
         *   ""         →  Set {}
         */
        _parseLineRanges(raw) {
            const nums = new Set();
            if (!raw.trim()) return nums;

            raw.split(',').forEach(part => {
                part = part.trim();
                if (part.includes('-')) {
                    const [a, b] = part.split('-').map(Number);
                    if (!isNaN(a) && !isNaN(b) && a > 0 && b >= a) {
                        for (let i = a; i <= b; i++) nums.add(i);
                    }
                } else {
                    const n = Number(part);
                    if (!isNaN(n) && n > 0) nums.add(n);
                }
            });

            return nums;
        }

        async loadHLJS() {
            if (themestrap._hljs) return themestrap._hljs;

            // Coalesce: if another instance already started loading core, await
            // the same promise rather than firing a second network request.
            if (!themestrap._hljsLoading['__core__']) {
                themestrap._hljsLoading['__core__'] = import(
                    'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11-stable/build/es/core.js'
                ).then(m => {
                    themestrap._hljs = m.default;
                    return themestrap._hljs;
                });
            }

            return themestrap._hljsLoading['__core__'];
        }

        async loadLanguage(lang, hljs) {
            if (themestrap._hljsLangs[lang]) return; // already registered

            // Coalesce: multiple blocks using the same language share one import()
            if (!themestrap._hljsLoading[lang]) {
                if (!POPULAR_LANGUAGES.has(lang)) {
                    console.warn(`PluginHighlight: "${lang}" is not in the known-language list and may 404.`);
                }

                themestrap._hljsLoading[lang] = (
                    lang === 'modx'
                        ? import('https://nskiag6l.modx.dev/assets/components/themestrap/js/modx.js')
                        : import(`https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/${lang}.min.js`)
                ).then(mod => {
                    hljs.registerLanguage(lang, mod.default);
                    themestrap._hljsLangs[lang] = true;
                }).catch(() => {
                    console.warn(`PluginHighlight: language "${lang}" failed to load — falling back to plaintext.`);
                    this.options.lang = 'plaintext';
                });
            }

            return themestrap._hljsLoading[lang];
        }

        async build() {
            injectStyles();
            
            const hljs = await this.loadHLJS();
            await this.loadLanguage(this.options.lang, hljs);

            if (this.options.hljsOptions && Object.keys(this.options.hljsOptions).length) {
                hljs.configure(this.options.hljsOptions);
            }

            this.instances = [];

            this.$el.each((blockIndex, elem) => {
                const instance = this.buildBlock(elem, blockIndex, hljs);
                if (instance) this.instances.push(instance);
            });

            this.bindGlobalEvents();
            this.handleHash();

            return this;
        }

        buildBlock(elem, blockIndex, hljs) {
            const code  = elem.querySelector('code') || elem;
            const $code = $(code);

            if ($code.hasClass('hljs-ln-done')) return null;

            const rawText  = code.textContent;
            const rawLines = rawText.split('\n');

            // Syntax highlight
            let highlightedHTML = rawText;

            if (hljs.getLanguage(this.options.lang)) {
                const result = hljs.highlight(rawText, {
                    language: this.options.lang,
                    ignoreIllegals: true,
                });
                highlightedHTML = result.value;
                $code.addClass(`hljs language-${this.options.lang}`);
            }

            code.innerHTML = highlightedHTML;

            // Split on newlines — both raw (for copy) and highlighted (for display)
            let htmlLines = code.innerHTML.split('\n');

            // Strip the trailing empty entry produced by a closing newline in source
            if (htmlLines.at(-1)?.trim() === '') {
                htmlLines.pop();
                rawLines.pop();
            }

            const blockId = elem.id || `codeblock-${blockIndex + 1}`;
            elem.id = blockId;

            const lineRefs = [];

            // Line numbers 
            if (this.options.lineNumbers) {
                const $wrap  = $('<div class="hljs-ln-wrapper"/>');
                const $nums  = $('<div class="hljs-ln-numbers"/>');
                const $lines = $('<div class="hljs-ln-code"/>');

                htmlLines.forEach((lineHTML, i) => {
                    const lineNumber = i + 1;
                    const anchorId   = `${blockId}-L${lineNumber}`;
                    const isMarked   = this.options.highlightLines.has(lineNumber);

                    const $num  = $(`<div class="hljs-ln-number${isMarked ? ' hljs-ln-highlight-num' : ''}" role="button" tabindex="0">${lineNumber}</div>`);
                    const $line = $('<div class="hljs-ln-line"></div>');

                    $line.attr('id', anchorId);
                    $line.html(lineHTML || '&nbsp;');

                    if (isMarked) $line.addClass('hljs-ln-highlight-line');

                    lineRefs.push($line[0]);

                    $num.on('mousedown', (e) => {
                        e.preventDefault();
                        this.startSelection(blockId, i);
                    });

                    $num.on('mouseenter', () => {
                        this.updateSelection(blockId, i);
                    });

                    $nums.append($num);
                    $lines.append($line);
                });

                $wrap.append($nums, $lines);
                $code.empty().append($wrap).addClass('hljs-ln-done');
            }

            // Copy button
            if (this.options.showCopy) {
                const $copyBtn = $('<button class="btn btn-modern btn-light btn-outline btn-xs btn-effect-1 hljs-copy-corner hljs-copy-btn">Copy</button>');

                $copyBtn.on('click', async () => {
                    await this.copy(rawText);
                    $copyBtn.text('Copied!');
                    setTimeout(() => {
                        themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                    }, this.options.copyTimeout);
                    setTimeout(() => $copyBtn.text('Copy'), this.options.copyTimeout);
                });

                $(elem).css('position', 'relative').append($copyBtn);
            }

            return { blockId, rawLines, lineRefs, selection: [], selecting: false, start: null };
        }

        bindGlobalEvents() {
            $(document).off('mouseup.highlight').on('mouseup.highlight', async () => {
                for (const inst of this.instances) {
                    if (!inst.selecting) continue;

                    inst.selecting = false;

                    const text = inst.selection
                        .map(el => el.textContent)
                        .join('\n');

                    if (text.trim()) {
                        await this.copy(text);
                        setTimeout(() => {
                            themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                        }, this.options.copyTimeout);
                    }
                }
            });

            $(window).off('hashchange.highlight')
                .on('hashchange.highlight', () => this.handleHash());
        }

        startSelection(blockId, index) {
            const inst = this.instances.find(i => i.blockId === blockId);
            if (!inst) return;

            inst.selecting = true;
            inst.start     = index;

            this.clearSelection(inst);
            this.applySelection(inst, index, index);
        }

        updateSelection(blockId, index) {
            const inst = this.instances.find(i => i.blockId === blockId);
            if (!inst || !inst.selecting) return;
            this.applySelection(inst, inst.start, index);
        }

        applySelection(inst, start, end) {
            this.clearSelection(inst);
            const [min, max] = [start, end].sort((a, b) => a - b);

            for (let i = min; i <= max; i++) {
                const el = inst.lineRefs[i];
                if (!el) continue;
                el.classList.add('hljs-ln-selected');
                inst.selection.push(el);
            }
        }

        clearSelection(inst) {
            inst.selection.forEach(el => el.classList.remove('hljs-ln-selected'));
            inst.selection = [];
        }

        async copy(text) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                // Fallback for older browsers / non-HTTPS contexts
                const $ta = $('<textarea/>').val(text).appendTo('body');
                $ta[0].select();
                document.execCommand('copy');
                $ta.remove();
            }
        }

        handleHash() {
            this.$el.find('.hljs-ln-highlight').removeClass('hljs-ln-highlight');

            const hash = window.location.hash.replace('#', '');
            if (!hash) return;

            const target = document.getElementById(hash);
            if (target) {
                target.classList.add('hljs-ln-highlight');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        destroy() {
            $(document).off('mouseup.highlight');
            $(window).off('hashchange.highlight');
            this.$el.removeData(instanceName);
            return this;
        }
    }

    // Do NOT include Set/Map values here — $.extend(true, …) cannot deep-clone
    // them. highlightLines is always set by setOptions() as a fresh Set.
    PluginHighlight.defaults = {
        language:    '',
        theme:       'atom-one-dark',
        lineNumbers: true,
        showCopy:    true,
        copyTimeout: 800,
    };

    $.extend(themestrap, { PluginHighlight });

    $.fn.themestrapPluginHighlight = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginHighlight($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
