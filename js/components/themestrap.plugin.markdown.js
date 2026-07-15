/**
 * Markdown
 * Renders markdown content as HTML using the Marked library.
 *
 * Source markdown is read from a child <script type="text/markdown"> tag
 * (recommended) or, as a fallback, from the element's
 * own text. Common leading whitespace is stripped automatically so markdown
 * can be indented to match the surrounding HTML. Re-render at any time by
 * calling the public renderMarkdown() method or triggering 'render.tsmarkdown'.
 *
 * Usage:
 *   <div data-plugin-markdown>
 *       <script type="text/markdown">
 *           ## Getting Started
 *           Some **bold** and `inline code`.
 *       </script>
 *   </div>
 *
 *   $('#md').data('__markdown').renderMarkdown();    * re-render after a change
 *
 * Requires: marked (window.marked). Optional: DOMPurify (window.DOMPurify)
 * for sanitize:true.
 */
// Markdown
(((themestrap = {}, $) => {
    const instanceName = '__markdown'; // double-underscore prefix, camelCase

    class PluginMarkdown {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {  // guard: prevent re-init
                return this;
            }

            this.$el = $el;
            this.initialHTML = $el.html();                 // captured before build mutates the DOM
            this.$script = $el.find('script[type="text/markdown"]').first();
            this.$content = null;
            this.pendingSource = null;                     // populated when loading from `src`

            if (!this.$script.length) {
                this.fallbackSource = $el.text();          // no script tag — read raw text instead
            }

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
            this.options = $.extend(true, {}, PluginMarkdown.defaults, opts, {
                wrapper: this.$el   // wrapper is always appended last
            });
            return this;
        }

        build() {
            const self = this;

            self.injectStyles();

            // No script tag means the raw markdown lives directly in the element —
            // clear it so the original (unrendered) text isn't shown alongside output.
            if (!self.$script.length) {
                self.$el.empty();
            }

            if (self.options.src) {
                self.fetchSource();
            } else {
                self.ensureMarked(() => self.renderMarkdown());
            }

            return this;
        }

        events() {
            const self = this;

            // Allow callers to force a re-render via a namespaced event.
            self.$el.on('render.tsmarkdown', () => {
                self.renderMarkdown();
            });

            // Optionally watch the source <script> and re-render on change.
            if (self.options.observe && self.$script.length && window.MutationObserver) {
                self.observer = new MutationObserver(() => self.renderMarkdown());
                self.observer.observe(self.$script[0], {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }

            return this;
        }

        // Re-reads the source and re-renders the HTML. Safe to call repeatedly.
        renderMarkdown() {
            const self = this;

            if (!self.markedAvailable()) {
                self.warnMissing();
                return this;
            }

            let source = self.getSource();
            if (self.options.dedent !== false) {
                source = self.dedent(source);
            }

            let html = self.parse(source);

            if (self.options.sanitize && window.DOMPurify && $.isFunction(window.DOMPurify.sanitize)) {
                html = window.DOMPurify.sanitize(html);
            }

            if (!self.$content || !self.$content.length) {
                self.$content = $('<div></div>').addClass(self.options.contentClass);
                self.$el.append(self.$content);
            }

            self.$content.html(html);
            self.$el.attr('data-markdown-rendered', 'true');
            self.$el.trigger('rendered.tsmarkdown', [self]);

            return this;
        }

        getSource() {
            const self = this;
            if (typeof self.options.content === 'string') {
                return self.options.content;                       // explicit inline override
            }
            if (typeof self.pendingSource === 'string') {
                return self.pendingSource;                         // fetched from `src`
            }
            if (self.$script && self.$script.length) {
                return self.$script[0].textContent || '';          // raw, unescaped markdown
            }
            return self.fallbackSource || '';
        }

        // Strip the longest common leading-whitespace prefix from every line so
        // indented markdown renders correctly. Handles mixed tabs/spaces.
        dedent(text) {
            const lines = String(text).split('\n');

            while (lines.length && lines[0].trim() === '') {
                lines.shift();
            }
            while (lines.length && lines[lines.length - 1].trim() === '') {
                lines.pop();
            }
            if (!lines.length) {
                return '';
            }

            let common = null;
            lines.forEach((line) => {
                if (line.trim() === '') {
                    return;                                        // ignore blank lines when measuring
                }
                const ws = (line.match(/^[ \t]*/) || [''])[0];
                if (common === null) {
                    common = ws;
                } else {
                    let i = 0;
                    const max = Math.min(common.length, ws.length);
                    while (i < max && common[i] === ws[i]) {
                        i++;
                    }
                    common = common.slice(0, i);
                }
            });
            common = common || '';

            return lines
                .map((line) => (line.startsWith(common) ? line.slice(common.length) : line.replace(/^[ \t]+/, '')))
                .join('\n');
        }

        parse(markdown) {
            const opts = this.options.markedOptions || {};
            if (window.marked) {
                if ($.isFunction(window.marked.parse)) {
                    return window.marked.parse(markdown, opts);    // marked v4+
                }
                if ($.isFunction(window.marked)) {
                    return window.marked(markdown, opts);          // marked v3 and earlier
                }
            }
            return '';
        }

        markedAvailable() {
            return typeof window.marked !== 'undefined' &&
                ($.isFunction(window.marked.parse) || $.isFunction(window.marked));
        }

        // If marked isn't loaded yet and a URL was provided, lazy-load it
        // (deduped across every markdown element on the page), then render.
        ensureMarked(callback) {
            const self = this;

            if (self.markedAvailable()) {
                callback();
                return this;
            }

            if (self.options.markedUrl) {
                themestrap.fn.getScripts([self.options.markedUrl], '').done(() => {
                    if (self.markedAvailable()) {
                        callback();
                    } else {
                        self.warnMissing();
                    }
                });
            } else {
                self.warnMissing();
            }

            return this;
        }

        fetchSource() {
            const self = this;
            $.ajax({ url: self.options.src, dataType: 'text' })
                .done((data) => {
                    self.pendingSource = data;
                    self.ensureMarked(() => self.renderMarkdown());
                })
                .fail(() => {
                    themestrap.fn.showErrorMessage(
                        'Failed to Load File',
                        'Failed to load markdown source: (' + self.options.src + ')'
                    );
                });
            return this;
        }

        injectStyles() {
            const self = this;
            if (self.options.injectStyles === false) {
                return this;
            }
            const styleId = 'themestrap-plugin-markdown-styles';
            if (document.getElementById(styleId)) {
                return this;                                       // unique ID guard — inject once
            }

            const css =
                '.markdown-content{font-family:"DM Sans",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.65;color:inherit;word-wrap:break-word}' +
                '.markdown-content>:first-child{margin-top:0}' +
                '.markdown-content>:last-child{margin-bottom:0}' +
                '.markdown-content h1,.markdown-content h2,.markdown-content h3,.markdown-content h4,.markdown-content h5,.markdown-content h6{font-family:"Syne","Fraunces",Georgia,serif;line-height:1.25;margin:1.5em 0 .6em;font-weight:700}' +
                '.markdown-content h1{font-size:2em}.markdown-content h2{font-size:1.6em}.markdown-content h3{font-size:1.3em}' +
                '.markdown-content p{margin:0 0 1em}' +
                '.markdown-content a{color:#d2541b;text-decoration:none}.markdown-content a:hover{text-decoration:underline}' +
                '.markdown-content code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.875em;background:rgba(10,25,41,.06);padding:.15em .4em;border-radius:4px}' +
                '.markdown-content pre{background:#0a1929;color:#e6edf3;padding:1em 1.15em;border-radius:8px;overflow:auto;margin:0 0 1em}' +
                '.markdown-content pre code{background:none;padding:0;color:inherit;font-size:.85em}' +
                '.markdown-content blockquote{margin:0 0 1em;padding:.5em 1em;border-left:3px solid #2ab8c8;background:rgba(42,184,200,.07);color:inherit}' +
                '.markdown-content blockquote>:last-child{margin-bottom:0}' +
                '.markdown-content ul,.markdown-content ol{margin:0 0 1em;padding-left:1.5em}' +
                '.markdown-content li+li{margin-top:.25em}' +
                '.markdown-content table{border-collapse:collapse;width:100%;margin:0 0 1em}' +
                '.markdown-content th,.markdown-content td{border:1px solid rgba(10,25,41,.15);padding:.5em .75em;text-align:left}' +
                '.markdown-content th{background:rgba(10,25,41,.05);font-weight:700}' +
                '.markdown-content img{max-width:100%;height:auto}' +
                '.markdown-content hr{border:0;border-top:1px solid rgba(10,25,41,.15);margin:1.5em 0}';

            $('<style></style>')
                .attr({ id: styleId, type: 'text/css' })
                .text(css)
                .appendTo('head');

            return this;
        }

        warnMissing() {
            themestrap.fn.showErrorMessage(
                'Failed to Load File',
                'Failed to load: Marked - Include the following file(s): (vendor/marked/marked.min.js)'
            );
            return this;
        }

        destroy() {
            const self = this;

            if (self.observer) {
                self.observer.disconnect();
                self.observer = null;
            }

            self.$el.off('.tsmarkdown');
            self.$el.removeAttr('data-markdown-rendered');
            self.$el.html(self.initialHTML);
            self.$el.removeData(instanceName);

            return this;
        }
    }

    PluginMarkdown.defaults = {
        contentClass: 'markdown-content', // class applied to the rendered output wrapper
        dedent: true,                     // strip common leading whitespace before parsing
        sanitize: false,                  // run output through DOMPurify when available
        observe: false,                   // re-render automatically when the source <script> changes
        injectStyles: true,               // inject default markdown typography styles once
        src: null,                        // optional URL to load markdown from
        content: null,                    // optional inline markdown string (overrides script/text)
        markedOptions: {},                // options object forwarded to marked
        markedUrl: null,                  // optional URL to lazy-load marked if window.marked is absent
        forceInit: false,                 // honored when wired via dynIntObsInit — render immediately
        accY: 0                           // honored when wired via dynIntObsInit — observer trigger offset
    };

    // Expose class to themestrap namespace
    $.extend(themestrap, {
        PluginMarkdown
    });

    // jQuery plugin method
    $.fn.themestrapPluginMarkdown = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginMarkdown($this, opts);
            }
        });
    };
})).apply(this, [window.themestrap, jQuery]);
