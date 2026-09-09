
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
 * CSS CUSTOM PROPERTIES
 * All visual properties are exposed as --ts-highlight-* CSS custom properties,
 * defined on :root. Override globally or scope to any ancestor element.
 *
 *   Code block
 *     --ts-highlight-bg              Background of the <code> block.
 *     --ts-highlight-color           Base text color inside the block.
 *     --ts-highlight-border-radius   Border radius on bare <pre> elements.
 *     --ts-highlight-padding         Padding inside <pre code.hljs>.
 *
 *   Header strip
 *     --ts-highlight-header-bg       Background of .code-highlight-header.
 *
 *   Text selection
 *     --ts-highlight-selection-bg    ::selection background inside a block.
 *     --ts-highlight-selection-color ::selection text color inside a block.
 *
 *   Line-number gutter
 *     --ts-highlight-ln-opacity      Opacity of line-number labels.
 *     --ts-highlight-ln-gap          Right-margin / padding of the gutter.
 *     --ts-highlight-ln-border-color Color of the gutter's right border.
 *
 *   Pre-marked / highlighted lines (data-plugin-highlight-lines)
 *     --ts-highlight-marked-bg           Background tint on a marked code line.
 *     --ts-highlight-marked-border-width Width of the left accent bar.
 *     --ts-highlight-marked-border-color Color of the left accent bar.
 *     --ts-highlight-marked-num-color    Number label color on a marked line.
 *     --ts-highlight-marked-num-bg       Number label background on a marked line.
 *
 *   Copy button
 *     --ts-highlight-copy-opacity        Resting opacity of the Copy button.
 *     --ts-highlight-copy-hover-opacity  Hover opacity of the Copy button.
 *     --ts-highlight-copy-top            Top offset of the Copy button.
 *     --ts-highlight-copy-right          Right offset of the Copy button.
 *     --ts-highlight-copy-success        Color used on "Copied!" confirmation.
 *
 *   Syntax token colours
 *   (comment and tag swap in dark mode; the rest are mode-independent)
 *     --ts-highlight-token-comment
 *     --ts-highlight-token-tag
 *     --ts-highlight-token-operator
 *     --ts-highlight-token-variable
 *     --ts-highlight-token-number
 *     --ts-highlight-token-title
 *     --ts-highlight-token-string
 *     --ts-highlight-token-builtin
 *     --ts-highlight-token-function
 *     --ts-highlight-token-keyword
 *     --ts-highlight-token-meta
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
    const MODX_LANG_URL  = 'https://cdn.jsdelivr.net/gh/daemondevin/cdn@main/highlighjs/languages/modx.js';
 
    const LOAD_TIMEOUT_MS  = 10000;  // per-attempt ceiling for a single import()
    const LOAD_RETRIES     = 2;      // extra attempts after the first (so 3 total)
    const RETRY_BASE_MS    = 400;    // exponential backoff base between attempts
    const CORE_COOLDOWN_MS = 15000;  // back-off window after a hard core failure
 
    // Syntax Highlight stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use this plugin.
    const STYLE_ID = 'ts-syntax-highlight-styles';
    const CSS_TEXT = `
        /**
         * Themestrap Syntax Highlight — Styles
         *
         * All visual knobs are available as --ts-highlight-* CSS custom
         * properties. Override them on :root (global), on any ancestor element
         * (scoped), or inside a media query (responsive).
         *
         * Example — dark background everywhere:
         *   :root { --ts-highlight-bg: #1e1e1e; }
         *
         * Example — amber accent on one block only:
         *   #my-block { --ts-highlight-marked-border-color: #f59e0b; }
         */
 
        /* Custom Property Definitions */
        :root {
            /* Code block */
            --ts-highlight-bg:             var(--light-100, #f2f2f2);
            --ts-highlight-color:          var(--dark--300, #383f45);
            --ts-highlight-border-radius:  0.5em;
            --ts-highlight-padding:        1em;
 
            /* Header strip (.code-highlight-header / .topfix) */
            --ts-highlight-header-bg:      var(--dark--300, #383f45);
 
            /* Text selection inside a block */
            --ts-highlight-selection-bg:    var(--light-inverse, #777);
            --ts-highlight-selection-color: var(--dark-inverse, #fff);
 
            /* Line-number gutter */
            --ts-highlight-ln-opacity:      0.5;
            --ts-highlight-ln-gap:          10px;
            --ts-highlight-ln-border-color: rgba(255,255,255,0.1);
 
            /* Pre-marked lines (data-plugin-highlight-lines) */
            --ts-highlight-marked-bg:           rgba(229,192,123,.3);
            --ts-highlight-marked-border-width: 2px;
            --ts-highlight-marked-border-color: #cfa85e;
            --ts-highlight-marked-num-color:    #e5c07b;
            --ts-highlight-marked-num-bg:       rgba(229,192,123,.12);
 
            /* Copy button */
            --ts-highlight-copy-opacity:        0.15;
            --ts-highlight-copy-hover-opacity:  0.75;
            --ts-highlight-copy-top:            12px;
            --ts-highlight-copy-right:          10px;
            --ts-highlight-copy-success:        #4caf50;
 
            /* Syntax token colours — light-mode defaults.
               Only comment, tag, and operator differ in dark mode;
               the remaining eight are identical across both themes. */
            --ts-highlight-token-comment:  #b8b8b8;
            --ts-highlight-token-tag:      #585858;
            --ts-highlight-token-operator: #383838;
            --ts-highlight-token-variable: #ab4642;
            --ts-highlight-token-number:   #dc9656;
            --ts-highlight-token-title:    #f7ca88;
            --ts-highlight-token-string:   #a1b56c;
            --ts-highlight-token-builtin:  #86c1b9;
            --ts-highlight-token-function: #7cafc2;
            --ts-highlight-token-keyword:  #ba8baf;
            --ts-highlight-token-meta:     #a16946;
        }
 
        /* Dark mode — system preference */
        @media (prefers-color-scheme: dark) {
            :root {
                --ts-highlight-bg:              #181818;
                --ts-highlight-color:           #d8d8d8;
                --ts-highlight-header-bg:       var(--dark-100, #16181b);
                --ts-highlight-selection-bg:    #383838;
                --ts-highlight-selection-color: #d8d8d8;
                --ts-highlight-marked-bg:       rgba(229,192,123,.12);
                --ts-highlight-marked-border-color: #e5c07b;
                --ts-highlight-token-comment:   #585858;
                --ts-highlight-token-tag:       #b8b8b8;
                --ts-highlight-token-operator:  #d8d8d8;
            }
        }
 
        /* Dark mode — explicit Bootstrap / Themestrap theme attribute */
        html.dark,
        [data-bs-theme="dark"] {
            --ts-highlight-bg:              #181818;
            --ts-highlight-color:           #d8d8d8;
            --ts-highlight-header-bg:       var(--dark-100, #16181b);
            --ts-highlight-selection-bg:    #383838;
            --ts-highlight-selection-color: #d8d8d8;
            --ts-highlight-marked-bg:       rgba(229,192,123,.12);
            --ts-highlight-marked-border-color: #e5c07b;
            --ts-highlight-token-comment:   #585858;
            --ts-highlight-token-tag:       #b8b8b8;
            --ts-highlight-token-operator:  #d8d8d8;
        }
 
        /* Explicit light override — restores :root defaults even inside a
           dark ancestor (e.g. a light card inside a dark page shell). */
        [data-bs-theme="light"] {
            --ts-highlight-bg:              var(--light-100, #f2f2f2);
            --ts-highlight-color:           var(--dark--300, #383f45);
            --ts-highlight-header-bg:       var(--dark--300, #383f45);
            --ts-highlight-selection-bg:    var(--light-inverse, #777);
            --ts-highlight-selection-color: var(--dark-inverse, #fff);
            --ts-highlight-marked-bg:       rgba(229,192,123,.3);
            --ts-highlight-marked-border-color: #cfa85e;
            --ts-highlight-token-comment:   #b8b8b8;
            --ts-highlight-token-tag:       #585858;
            --ts-highlight-token-operator:  #383838;
        }
 
        /* === Code Block === */
 
        .code-highlight-header {
            background-color: var(--ts-highlight-header-bg);
            width: 100%;
            text-align: right;
            border-radius: var(--border-radius, 4px);
        }
 
        .code-highlight .code-highlight-caption {
            font-size: smaller;
            float: left;
            margin-left: 12px;
            margin-top: 9px;
            color: var(--light-200, #ececec);
        }
 
        .code-highlight .topfix {
            background-color: var(--ts-highlight-header-bg);
            width: 100%;
            height: 1em;
            margin-top: -1em;
            border-bottom: 1px var(--light-rgba-10, rgba(255, 255, 255, 0.1)) solid;
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
            margin-right: 20px;
        }
 
        .code-highlight .button svg path,
        .code-highlight .button svg rect,
        .code-highlight .button svg polygon {
            fill: var(--light-200, #ececec);
        }
 
        .code-highlight .button svg {
            width: 10px;
            height: 10px;
            margin: 0 8px;
        }
 
        /* === Base hljs Styles === */
 
        pre code.hljs {
            display: block;
            overflow-x: auto;
            padding: var(--ts-highlight-padding);
        }
 
        code.hljs {
            padding: 3px 5px;
        }
 
        .hljs {
            background: var(--ts-highlight-bg);
            color: var(--ts-highlight-color);
        }
 
        .hljs ::-moz-selection,
        .hljs::-moz-selection {
            background-color: var(--ts-highlight-selection-bg);
            color: var(--ts-highlight-selection-color);
        }
 
        .hljs ::selection,
        .hljs::selection {
            background-color: var(--ts-highlight-selection-bg);
            color: var(--ts-highlight-selection-color);
        }
 
        /* === Syntax Token Colours ===
           Written once; dark-mode overrides are handled via var() above. */
 
        .hljs-comment {
            color: var(--ts-highlight-token-comment);
        }
 
        .hljs-tag {
            color: var(--ts-highlight-token-tag);
        }
 
        .hljs-operator,
        .hljs-punctuation,
        .hljs-subst {
            color: var(--ts-highlight-token-operator);
        }
 
        .hljs-operator {
            opacity: .7;
        }
 
        .hljs-bullet,
        .hljs-deletion,
        .hljs-name,
        .hljs-selector-tag,
        .hljs-template-variable,
        .hljs-variable {
            color: var(--ts-highlight-token-variable);
        }
 
        .hljs-attr,
        .hljs-link,
        .hljs-literal,
        .hljs-number,
        .hljs-symbol,
        .hljs-variable.constant_ {
            color: var(--ts-highlight-token-number);
        }
 
        .hljs-class .hljs-title,
        .hljs-title,
        .hljs-title.class_ {
            color: var(--ts-highlight-token-title);
        }
 
        .hljs-strong {
            font-weight: 700;
            color: var(--ts-highlight-token-title);
        }
 
        .hljs-addition,
        .hljs-code,
        .hljs-string,
        .hljs-title.class_.inherited__ {
            color: var(--ts-highlight-token-string);
        }
 
        .hljs-built_in,
        .hljs-doctag,
        .hljs-keyword.hljs-atrule,
        .hljs-quote,
        .hljs-regexp {
            color: var(--ts-highlight-token-builtin);
        }
 
        .hljs-attribute,
        .hljs-function .hljs-title,
        .hljs-section,
        .hljs-title.function_,
        .ruby .hljs-property {
            color: var(--ts-highlight-token-function);
        }
 
        .diff .hljs-meta,
        .hljs-keyword,
        .hljs-template-tag,
        .hljs-type {
            color: var(--ts-highlight-token-keyword);
        }
 
        .hljs-emphasis {
            color: var(--ts-highlight-token-keyword);
            font-style: italic;
        }
 
        .hljs-meta,
        .hljs-meta .hljs-keyword,
        .hljs-meta .hljs-string {
            color: var(--ts-highlight-token-meta);
        }
 
        .hljs-meta .hljs-keyword,
        .hljs-meta-keyword {
            font-weight: 700;
        }
 
        /* Pre-marked / Highlighted Lines */
        .hljs-ln-highlight-line {
            background: var(--ts-highlight-marked-bg);
            border-left: var(--ts-highlight-marked-border-width) solid var(--ts-highlight-marked-border-color);
            padding-left: 2px;
        }
 
        .hljs-ln-highlight-num {
            color: var(--ts-highlight-marked-num-color);
            background: var(--ts-highlight-marked-num-bg);
        }
 
        /* === Bare <pre> (no plugin) === */
 
        pre:not([data-plugin-highlight]) {
            border-radius: var(--ts-highlight-border-radius);
        }
 
        pre code,
        pre code.hljs {
            display: block;
            overflow-x: auto;
            padding: var(--ts-highlight-padding);
        }
 
        /* Inline JSON / MODX Coloring */
        .hljs-ts-json.attr_ {
            color: var(--secondary, #e36159);
        }
        .hljs-ts-json.string_ {
            color: var(--primary--300, #00aaff);
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
 
        /* Line Numbers */
        .hljs-ln-wrapper {
            display: flex;
            width: 100%;
        }
 
        .hljs-ln-numbers {
            text-align: right;
            margin-right: var(--ts-highlight-ln-gap);
            padding-right: var(--ts-highlight-ln-gap);
            border-right: 1px solid var(--ts-highlight-ln-border-color);
            user-select: none;
        }
 
        .hljs-ln-number {
            opacity: var(--ts-highlight-ln-opacity);
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
 
        .hljs-ln-copy.copied {
            color: var(--ts-highlight-copy-success);
        }
 
        /* Copy Button */
        .hljs-copy-corner {
            position: absolute;
            z-index: 3;
            display: flex;
            flex-direction: column;
        }
 
        .hljs-copy-btn {
            box-shadow: inset 0px 1px 0px 0px #ffffff;
            background: linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #dcdcdc;
            display: inline-block;
            cursor: pointer;
            color: #666666;
            padding: 3px 10px;
            text-decoration: none;
            text-shadow: 0px 1px 0px #ffffff;
            top: var(--ts-highlight-copy-top);
            right: var(--ts-highlight-copy-right);
            opacity: var(--ts-highlight-copy-opacity);
            align-items: flex-end;
            background-color: var(--light-rgba-20, rgba(255, 255, 255, 0.2)) !important;
        }
 
        .hljs-copy-btn:hover {
            background: linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
            background-color: #f6f6f6;
            opacity: var(--ts-highlight-copy-hover-opacity);
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
                const $copyBtn = $('<button class="btn btn-modern btn-light btn-outline btn-xs btn-effect-1 hljs-copy-corner hljs-copy-btn">' + this.options.copyIcon + '</button>');

                $copyBtn.on('click', async () => {
                    const ok = await this.copy(rawText);
                    $copyBtn.html(ok ?  this.options.copySuccessIcon : this.options.copyFailureIcon);
                    if (ok) {
                        setTimeout(() => {
                            themestrap.PluginToast?.show({ type: 'success', title: 'Copy successful', body: 'Content copied to clipboard!' });
                        }, this.options.copyTimeout);
                    }
                    setTimeout(() => $copyBtn.html(this.options.copyIcon), this.options.copyTimeout);
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
                                themestrap.PluginToast?.show({ type: 'success', title: 'Copy successful', body: 'Content copied to clipboard!' });
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
        copyIcon:    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><g fill="#777"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"></path></g></svg>',
        copySuccessIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><g fill="#198754"><path fill="none" stroke="#198754" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.45 8.23l3.56 4.45 7.56-9.34"></path></g></svg>',
        copyFailureIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><g fill="#dc3545"><path fill="none" stroke="#dc3545" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12.46 3.56l-8.9 8.9"></path><path fill="none" stroke="#dc3545" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.56 3.56l8.9 8.9"></path></g></svg>',
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
