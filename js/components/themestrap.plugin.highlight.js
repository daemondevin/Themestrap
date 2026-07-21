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
 * RESILIENCE
 * highlight.js core and per-language grammars are fetched from a CDN via dynamic
 * import(). Those requests can fail (502 Bad Gateway, network drops, CSP blocks,
 * timeouts). The plugin is designed to degrade gracefully rather than throw:
 *   - Each import is wrapped in a per-attempt timeout and retried with backoff.
 *   - A failed import is evicted from the in-flight cache so it is never "poisoned"
 *     (a single transient 502 will not permanently disable highlighting).
 *   - If core never loads, blocks still render as ESCAPED plaintext with line
 *     numbers and copy intact — no raw-HTML injection, no thrown errors.
 *   - After a hard core failure the loader backs off for a cooldown window to
 *     avoid hammering a down CDN, then transparently retries later.
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
// Syntax Highlight
(((themestrap = {}, $) => {
    const instanceName = '__highlight';

    // Resilience tuning
    // CDN endpoints (extracted so they can be swapped / mirrored in one place).
    const HLJS_CORE_URL  = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11-stable/build/es/core.js';
    const HLJS_LANG_BASE = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/';
    const MODX_LANG_URL  = 'https://nskiag6l.modx.dev/assets/components/themestrap/js/modx.js';

    const LOAD_TIMEOUT_MS  = 10000;  // per-attempt ceiling for a single import()
    const LOAD_RETRIES     = 2;      // extra attempts after the first (so 3 total)
    const RETRY_BASE_MS    = 400;    // exponential backoff base between attempts
    const CORE_COOLDOWN_MS = 15000;  // back-off window after a hard core failure

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
                background-color: var(--dark--300);
                width: 100%;
                text-align: right;
                border-radius: var(--border-radius);
            }
            
            html.dark .code-highlight-header {
                background-color: var(--dark-100);
            }

            .code-highlight .code-highlight-caption {
                font-size: smaller;
                float: left;
                margin-left: 12px;
                margin-top: 9px;
                color: var(--light-200);
            }

            .code-highlight .topfix {
                background-color: var(--dark--300);
                width: 100%;
                height: 1em;
                margin-top: -1em;
                border-bottom: 1px var(--light-rgba-10) solid;
            }

            html.dark .code-highlight .topfix {
                background-color: var(--dark-100);
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
                background: var(--light-100);
                color: var(--dark--300);
            }

            .hljs ::-moz-selection,
            .hljs::-moz-selection {
                background-color: var(--light-inverse);
                color: var(--dark-inverse)
            }

            .hljs ::selection,
            .hljs::selection {
                background-color: var(--light-inverse);
                color: var(--dark-inverse)
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

            html.dark .hljs-ln-highlight-line {
                background: rgba(229,192,123,.12); 
                border-left: 2px solid #e5c07b; 
                padding-left: 2px;
            }

            .hljs-ln-highlight-line {
                background: rgba(229,192,123,.3); 
                border-left: 2px solid #cfa85e; 
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
                box-shadow:inset 0px 1px 0px 0px #ffffff;
                background:linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);
                background-color:#ffffff;
                border-radius:8px;
                border:1px solid #dcdcdc;
                display:inline-block;
                cursor:pointer;
                color:#666666;
                padding:3px 10px;
                text-decoration:none;
                text-shadow:0px 1px 0px #ffffff;
                top: 12px;
                right: 10px;
                opacity: .15;
                align-items: flex-end;
                background-color: var(--light-rgba-20) !important;
            }
            
            .hljs-copy-btn:hover {
                background:linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
                background-color:#f6f6f6;
                opacity: 0.75;
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

    // HTML-escape source text for the fallback render path. When hljs is NOT
    // available we must never write raw textContent into innerHTML — code blocks
    // routinely contain <, >, & and even literal <script>/<style>, which would
    // otherwise be parsed as markup (broken layout at best, injection at worst).
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[c]));
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // import() cannot be aborted, but we can stop *waiting* on it. The module
    // keeps downloading in the background and the browser caches it, so a later
    // retry resolves instantly from cache. The timer is always cleared to avoid
    // a dangling reject on the winning path.
    function importWithTimeout(url, timeout) {
        let timer;
        const timeoutP = new Promise((_, reject) => {
            timer = setTimeout(
                () => reject(new Error(`timeout after ${timeout}ms`)),
                timeout
            );
        });
        return Promise.race([import(url), timeoutP]).finally(() => clearTimeout(timer));
    }

    // Resilient dynamic import: per-attempt timeout + exponential backoff retry.
    // Throws the last error only after all attempts are exhausted. Note that a
    // browser dynamic-import failure (e.g. a 502 from the CDN) surfaces as a
    // TypeError without an accessible HTTP status, so every failure is treated
    // as retryable rather than branching on status codes.
    async function loadModule(url, { timeout = LOAD_TIMEOUT_MS, retries = LOAD_RETRIES, label = url } = {}) {
        let lastErr;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await importWithTimeout(url, timeout);
            } catch (e) {
                lastErr = e;
                console.warn(
                    `PluginHighlight: load attempt ${attempt + 1}/${retries + 1} failed for ${label} — ${e?.message || e}`
                );
                if (attempt < retries) await delay(RETRY_BASE_MS * Math.pow(2, attempt));
            }
        }
        throw lastErr;
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
    themestrap._hljs           = null;  // hljs core singleton
    themestrap._hljsLangs      = {};    // { [lang]: true } registration flags
    themestrap._hljsLoading    = {};    // { [lang|'__core__']: Promise } — in-flight coalescing
    themestrap._hljsCoreFailed = 0;     // epoch ms of the last hard core failure (cooldown gate)

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
                .build(); // async, fire-and-forget — build() never rejects (see below)

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

        /**
         * Loads the hljs core singleton. Resolves to the hljs object on success
         * or to `null` on failure (callers degrade to escaped plaintext).
         *
         * Resilience:
         *   - Coalesces concurrent loads onto one promise.
         *   - On failure, EVICTS the in-flight cache entry so the next init can
         *     retry — a transient 502 never poisons the cache for the session.
         *   - After a hard failure, refuses to retry for CORE_COOLDOWN_MS to avoid
         *     a retry storm against a down CDN, then transparently tries again.
         */
        async loadHLJS() {
            if (themestrap._hljs) return themestrap._hljs;

            // Cooldown gate: skip fast (return null) if we failed very recently.
            if (themestrap._hljsCoreFailed &&
                (Date.now() - themestrap._hljsCoreFailed) < CORE_COOLDOWN_MS) {
                return null;
            }

            if (!themestrap._hljsLoading['__core__']) {
                themestrap._hljsLoading['__core__'] = loadModule(HLJS_CORE_URL, { label: 'hljs core' })
                    .then(m => {
                        themestrap._hljs = m.default;
                        themestrap._hljsCoreFailed = 0;     // clear any prior failure
                        return themestrap._hljs;
                    })
                    .catch(err => {
                        // Record the failure window and EVICT so a later init retries.
                        themestrap._hljsCoreFailed = Date.now();
                        delete themestrap._hljsLoading['__core__'];
                        console.warn('PluginHighlight: highlight.js core failed to load — rendering plain code blocks for now.', err?.message || err);
                        return null;                        // graceful, non-throwing
                    });
            }

            return themestrap._hljsLoading['__core__'];
        }

        /**
         * Registers a language grammar. Resolves to `true` when the grammar is
         * available afterwards, `false` otherwise. Never throws.
         *
         * Resilience: failed language imports are evicted from the in-flight
         * cache (so they can be retried), and a failure simply falls the block
         * back to escaped plaintext rather than aborting the whole build.
         */
        async loadLanguage(lang, hljs) {
            if (!hljs) return false;
            if (lang === 'plaintext') return false;   // no grammar needed; escape path handles it
            if (themestrap._hljsLangs[lang]) return true;

            if (!themestrap._hljsLoading[lang]) {
                if (!POPULAR_LANGUAGES.has(lang)) {
                    console.warn(`PluginHighlight: "${lang}" is not in the known-language list and may 404.`);
                }

                const url = (lang === 'modx') ? MODX_LANG_URL : `${HLJS_LANG_BASE}${lang}.min.js`;
                
                themestrap._hljsLoading[lang] = (async () => {
                    // modx requires xml to be registered first
                    if (lang === 'modx' && !themestrap._hljsLangs['xml']) {
                        await loadModule(`${HLJS_LANG_BASE}xml.min.js`, { label: 'language "xml"' })
                            .then(mod => {
                                hljs.registerLanguage('xml', mod.default);
                                themestrap._hljsLangs['xml'] = true;
                            });
                    }
                    if (lang === 'modx' && !themestrap._hljsLangs['json']) {
                        await loadModule(`${HLJS_LANG_BASE}json.min.js`, { label: 'language "json"' })
                            .then(mod => {
                                hljs.registerLanguage('json', mod.default);
                                themestrap._hljsLangs['json'] = true;
                            });
                    }
                    return loadModule(url, { label: `language "${lang}"` })
                        .then(mod => {
                            hljs.registerLanguage(lang, mod.default);
                            themestrap._hljsLangs[lang] = true;
                            return true;
                        })
                        .catch(err => {
                            console.warn(`PluginHighlight: language "${lang}" failed to load — falling back to plaintext.`, err?.message || err);
                            delete themestrap._hljsLoading[lang];
                            return false;
                        });
                })();
            }
            return themestrap._hljsLoading[lang];
        }

        // The whole build is wrapped so that NOTHING here can produce an
        // unhandled promise rejection from the fire-and-forget call in
        // initialize(). Any unexpected error leaves the block untouched.
        async build() {
            try {
                injectStyles();

                const hljs = await this.loadHLJS();          // null on failure
                const langReady = hljs
                    ? await this.loadLanguage(this.options.lang, hljs)
                    : false;

                if (hljs && this.options.hljsOptions && Object.keys(this.options.hljsOptions).length) {
                    try {
                        hljs.configure(this.options.hljsOptions);
                    } catch (e) {
                        console.warn('PluginHighlight: hljs.configure() failed — continuing with defaults.', e);
                    }
                }

                this.instances = [];

                this.$el.each((blockIndex, elem) => {
                    try {
                        const instance = this.buildBlock(elem, blockIndex, hljs, langReady);
                        if (instance) this.instances.push(instance);
                    } catch (e) {
                        console.warn('PluginHighlight: failed to build a code block — left as-is.', e);
                    }
                });

                this.bindGlobalEvents();
                this.handleHash();
            } catch (e) {
                console.warn('PluginHighlight: build() aborted unexpectedly.', e);
                this.instances = this.instances || [];
            }

            return this;
        }

        buildBlock(elem, blockIndex, hljs, langReady) {
            const code  = elem.querySelector('code') || elem;
            const $code = $(code);

            if ($code.hasClass('hljs-ln-done')) return null;
            
            let rawText  = code.textContent;
            const rawLines = rawText.split('\n');

            // Syntax highlight when possible; otherwise render ESCAPED plaintext.
            // Either branch produces HTML-safe markup before touching innerHTML.
            let highlightedHTML;

            const canHighlight = !!hljs && langReady && !!hljs.getLanguage(this.options.lang);

            if (canHighlight) {
                try {
                    const result = hljs.highlight(rawText, {
                        language: this.options.lang,
                        ignoreIllegals: true,
                    });
                    highlightedHTML = result.value;            // already escaped by hljs
                    $code.addClass(`hljs language-${this.options.lang}`);
                } catch (e) {
                    console.warn('PluginHighlight: hljs.highlight() threw — rendering escaped plaintext.', e);
                    highlightedHTML = escapeHtml(rawText);
                    $code.addClass('hljs');
                }
            } else {
                highlightedHTML = escapeHtml(rawText);          // never inject raw text
                $code.addClass('hljs');                         // keep base styling/background
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
                    const ok = await this.copy(rawText);
                    $copyBtn.text(ok ? 'Copied!' : 'Copy failed');
                    if (ok) {
                        setTimeout(() => {
                            themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                        }, this.options.copyTimeout);
                    }
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
                        const ok = await this.copy(text);
                        if (ok) {
                            setTimeout(() => {
                                themestrap.PluginToast?.show({ type: 'success', body: 'Copied!' });
                            }, this.options.copyTimeout);
                        }
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

        // Returns true on success, false on failure (both clipboard paths covered).
        async copy(text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
                throw new Error('clipboard API unavailable');
            } catch {
                // Fallback for older browsers / non-HTTPS contexts
                try {
                    const $ta = $('<textarea/>')
                        .val(text)
                        .css({ position: 'fixed', top: '-1000px', opacity: 0 })
                        .appendTo('body');
                    $ta[0].select();
                    const ok = document.execCommand('copy');
                    $ta.remove();
                    return ok;
                } catch (e) {
                    console.warn('PluginHighlight: copy to clipboard failed.', e);
                    return false;
                }
            }
        }
        
        highlightBackticks(input, hljs) {
            return input.replace(/`([^`]*?)`/g, (fullMatch, content) => {
                const trimmed = content.trim();
        
                let language = "xml";
                if (this.isJson(trimmed)) {
                    language = "json";
                } else if (this.isModx(trimmed)) {
                    language = "modx";
                }
        
                return "`" + hljs.highlight(trimmed, { language }).value + "`";
            });
        }
        
        isJson(value) {
            if (typeof value !== "string") return false;
        
            // Accept either the raw backtick-delimited value or just the contents.
            const match = value.match(/^`([\s\S]*)`$/);
            const content = (match ? match[1] : value).trim();
        
            if (!content || !/^[\[{]/.test(content)) {
                return false;
            }
        
            try {
                JSON.parse(content);
                return true;
            } catch {
                return false;
            }
        }
        
        isModx(value) {
            if (typeof value !== "string") return false;
        
            // Accept either the raw backtick-delimited value or just the contents.
            const match = value.match(/^`([\s\S]*)`$/);
            const content = (match ? match[1] : value).trim();
        
            if (!content || !/^[\[\[]]/.test(content)) {
                return false;
            } else {
                return true;
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
