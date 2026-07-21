/**
 * Themestrap Code Window Plugin
 *
 * Decorates a group of <pre> code blocks with a mac or windows editor window:
 * a chrome bar (mac or windows buttons + a filename tab strip), a body that shows
 * one pane at a time, and an optional ambient gradient glow behind the frame.
 * Syntax highlighting, line numbers and the copy button are delegated to
 * PluginHighlight — this plugin only owns the window shell and tab switching.
 *
 * Part of the Themestrap component library for MODX 3.
 *
 * MARKUP
 *   <div data-plugin-code-window
 *        data-plugin-options='{"glow": true, "activeTab": 0}'>
 *
 *     <pre data-code-window-tab="cache-advance.config.js"
 *          data-plugin-highlight="javascript"
 *          data-plugin-highlight-lines="2,3-5"><code>export default {
 *     strategy: 'predictive',
 *   }</code></pre>
 *
 *     <pre data-code-window-tab="package.json"
 *          data-plugin-highlight="json"><code>{ "name": "cache-advance" }</code></pre>
 *
 *   </div>
 *
 * Each direct-child <pre> becomes one tab. The tab label is read from
 * data-code-window-tab (falls back to "untitled"). All standard PluginHighlight
 * data-* attributes (data-plugin-highlight, -lines, -hljs-config) stay on the
 * <pre> and are honored.
 *
 * OPTIONS (data-plugin-options)
 *   activeTab   {number}  Zero-based index of the pane shown first.   default 0
 *   chrome      {string}  Render either a Mac or Windows topbar.      default 'win'
 *   tabs        {bool}    Render the filename tab strip.              default true
 *   glow        {bool}    Ambient gradient glow behind the window.    default true
 *   lineNumbers {bool}    Forwarded to PluginHighlight.               default true
 *   showCopy    {bool}    Forwarded to PluginHighlight (copy button). default true
 *   highlight   {bool}    Run PluginHighlight on each pane.           default true
 *   accent      {string}  CSS color for the active-tab indicator.    default '' (theme)
 *
 * EVENTS
 *   codewindow:ready  (e, instance)                 fired once after build
 *   codewindow:tab    (e, instance, index, $pane)   fired on every tab change
 *
 * PROGRAMMATIC API 
 *   const cw = $('#hero-code').data('__codeWindow');
 *   cw.activate(1);          // switch to the second pane
 *   cw.next(); cw.prev();    // cycle panes
 *   cw.destroy();            // restore original markup
 *
 *   // Code Window
 *   if ($.isFunction($.fn['themestrapPluginCodeWindow']) && $('[data-plugin-code-window]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-code-window]:not(.manual)', 'themestrapPluginCodeWindow');
 *   }
 */
// Code Window
(((themestrap = {}, $) => {
    const instanceName = '__codeWindow';

    // Injected once per page, keyed to STYLE_ID — loading the script never adds
    // CSS to pages that don't use the plugin (styles land on first build()).
    const STYLE_ID = 'ts-code-window-styles';

    const CSS_TEXT = `/* Themestrap — PluginCodeWindow */
.ts-code-window {
    --ts-cw-radius:        4px;
    --ts-cw-bg:            #212529;
    --ts-cw-chrome-bg:     #16181b;
    --ts-cw-border:        rgba(255,255,255,0.08);
    --ts-cw-tab-fg:        rgba(245,241,234,0.50);
    --ts-cw-tab-fg-active: #f5f1ea;
    --ts-cw-accent:        var(--primary);
    --ts-cw-glow-1:        rgba(42,184,200,0.30);
    --ts-cw-glow-2:        rgba(232,103,42,0.28);
    --ts-cw-shadow:        0 30px 60px -20px rgba(0,0,0,0.55),
                           0 12px 24px -12px rgba(0,0,0,0.45);

    position: relative;
    border-radius: var(--ts-cw-radius);
    background: var(--ts-cw-bg);
    border: 1px solid var(--ts-cw-border);
    box-shadow: var(--ts-cw-shadow);
    overflow: hidden;
    isolation: isolate;
    margin-bottom: 2em;
}

/* Light theme tuning (page default). Dark theme keeps the dark editor look. */
html:not(.dark) .ts-code-window {
    --ts-cw-shadow: 0 24px 50px -22px rgba(10,25,41,0.35),
                    0 8px 18px -10px rgba(10,25,41,0.20);
}

/* Ambient gradient glow */
.ts-code-window--glow::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, var(--ts-cw-glow-1), transparent 40%, var(--ts-cw-glow-2));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    opacity: 0.9;
    pointer-events: none;
}
.ts-code-window--glow::after {
    content: '';
    position: absolute;
    z-index: -2;
    inset: -40px -30px auto -30px;
    height: 120px;
    background:
        radial-gradient(40% 120% at 20% 0%, var(--ts-cw-glow-1) 0%, transparent 70%),
        radial-gradient(40% 120% at 85% 0%, var(--ts-cw-glow-2) 0%, transparent 70%);
    filter: blur(28px);
    opacity: 0.55;
    pointer-events: none;
}

/* Mac Chrome bar */
.ts-code-window__chrome.mac {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 14px;
    height: 44px;
    background: var(--ts-cw-chrome-bg);
    border-bottom: 1px solid var(--ts-cw-border);
}

.ts-code-window__dots {
    display: flex;
    gap: 7px;
    flex-shrink: 0;
}
.ts-code-window__dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255,255,255,0.16);
}
.ts-code-window__dots span:nth-child(1) { background: #ff5f57; }
.ts-code-window__dots span:nth-child(2) { background: #febc2e; }
.ts-code-window__dots span:nth-child(3) { background: #28c840; }

/* Windows chrome bar */
.ts-code-window__chrome.win {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 38px;
    background: var(--ts-cw-chrome-bg);
    border-bottom: 1px solid var(--ts-cw-border);
}

.ts-code-window__btns {
    display: flex;
    align-items: stretch;
    margin-left: auto;
    align-self: stretch;
    flex-shrink: 0;
}

.ts-code-window__btns .button {
    width: 46px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    transition: background-color 0.15s ease;
}

.ts-code-window__btns .button svg {
    width: 10px;
    height: 10px;
    fill: rgba(255,255,255,0.75);
}

.ts-code-window__btns .button {
    width: 48px;
}

.ts-code-window__btns .button svg {
    width: 9px;
    height: 9px;
}

/* Tab strip */
.ts-code-window__tabs {
    display: flex;
    align-items: stretch;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0;
    padding: 0;
    height: 100%;
}
.ts-code-window__chrome.win .ts-code-window__tabs {
    flex: 1 1 auto;
    min-width: 0;
}
.ts-code-window__tabs::-webkit-scrollbar { display: none; }

.ts-code-window__tab {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--ts-cw-tab-fg);
    font-family: var(--mono, ui-monospace, 'JetBrains Mono', monospace);
    font-size: 12.5px;
    line-height: 1;
    padding: 0 14px;
    height: 100%;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    transition: color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}
.ts-code-window__tab:hover { color: var(--ts-cw-tab-fg-active); }
.ts-code-window__tab[aria-selected="true"] {
    color: var(--ts-cw-tab-fg-active);
}
.ts-code-window__tab[aria-selected="true"]::after {
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--ts-cw-accent);
}
.ts-code-window__tab:focus-visible {
    outline: 2px solid var(--ts-cw-accent);
    outline-offset: -2px;
    border-radius: 4px;
}

/* Single-tab / no-tabs: render the filename as a static label */
.ts-code-window--single .ts-code-window__tab { cursor: default; }
.ts-code-window--single .ts-code-window__tab[aria-selected="true"]::after { display: none; }

/* Body + panes */
.ts-code-window__body {
    position: relative;
    background: var(--ts-cw-bg);
}
.ts-code-window__pane { display: none; }
.ts-code-window__pane.is-active { display: block; }

/* Normalize the contained <pre> so the window owns the frame */
.ts-code-window__pane pre {
    margin: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}

.ts-code-window__filename {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Langauge */
.ts-code-window__lang {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 2px 6px;
    border-radius: 999px;

    font-size: 10px;
    font-weight: 600;
    line-height: 1;

    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.75);

    text-transform: uppercase;
    letter-spacing: .04em;
}

.ts-code-window__lang.lang-javascript {
    background: rgba(247,223,30,.15);
    color: #f7df1e;
}

.ts-code-window__lang.lang-css {
    background: rgba(38,77,228,.15);
    color: #5b8cff;
}

.ts-code-window__lang.lang-html {
    background: rgba(228,77,38,.15);
    color: #ff8b6b;
}

.ts-code-window__lang.lang-php {
    background: rgba(119,123,180,.15);
    color: #a9afff;
}

.ts-code-window__lang.lang-json {
    background: rgba(255,255,255,.10);
    color: #fff;
}
`;

    class PluginCodeWindow {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;
            this.initialHTML = $el.html();   // capture before build mutates the DOM

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
            const pluginOpts = themestrap.fn.getOptions(
                this.$el.data('plugin-options')
            ) || {};

            this.options = $.extend(true, {}, PluginCodeWindow.defaults, pluginOpts, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            const self = this;
            this.injectStyles();

            // Collect the source panes (direct-child <pre>, else any descendant <pre>)
            let $panes = this.$el.children('pre');
            if (!$panes.length) $panes = this.$el.find('pre');
            if (!$panes.length) {
                // Nothing to decorate — leave the element untouched.
                return this;
            }

            // Build the window shell
            const $window = $('<div class="ts-code-window" role="group"></div>');
            if (this.options.glow)  $window.addClass('ts-code-window--glow');
            if ($panes.length < 2)  $window.addClass('ts-code-window--single');
            if (this.options.accent) $window.css('--ts-cw-accent', this.options.accent);

            const $chrome = $('<div class="ts-code-window__chrome mac"></div>');

            if (this.options.chrome === 'mac') {
                $chrome.addClass('mac').append(
                    '<div class="ts-code-window__dots" aria-hidden="true"><span></span><span></span><span></span></div>'
                );
            }

            const $tabs = $('<div class="ts-code-window__tabs" role="tablist"></div>');
            const $body = $('<div class="ts-code-window__body"></div>');

            this.$tabButtons = [];
            this.$panes      = [];

            const baseId  = this.$el.attr('id') || `codewindow-${++PluginCodeWindow._seq}`;
            this.$el.attr('id', baseId);

            const active = this.clampIndex(this.options.activeTab, $panes.length);

            $panes.each(function (i, preEl) {
                const $pre   = $(preEl);
                const label  = $pre.attr('data-code-window-tab') || $pre.data('codeWindowTab') || 'untitled';
                const tabId  = `${baseId}-tab-${i}`;
                const paneId = `${baseId}-pane-${i}`;
                const language = $pre.attr('data-plugin-highlight') || $pre.data('pluginHighlight') || 'text';
                // Pane wrapper
                const $pane = $('<div class="ts-code-window__pane"></div>')
                    .attr({ id: paneId, role: 'tabpanel', 'aria-labelledby': tabId, tabindex: '0' });

                if (i === active) $pane.addClass('is-active');

                // Avoid double auto-init from themestrap.init.js — this plugin
                // drives highlighting explicitly below.
                $pre.addClass('manual').appendTo($pane);
                $body.append($pane);

                // Tab button
                const $tab = $('<button type="button" class="ts-code-window__tab"></button>')
                    .attr({
                        id: tabId,
                        role: 'tab',
                        'aria-controls': paneId,
                        'aria-selected': i === active ? 'true' : 'false',
                        tabindex: i === active ? '0' : '-1',
                    });
                
                $tab.append(
                    $('<span class="ts-code-window__filename"></span>').text(label)
                );
                
                $tab.append(
                    $('<span class="ts-code-window__lang"></span>')
                        .addClass(`lang-${language.toLowerCase()}`)
                        .text(language)
                );

                if (self.options.tabs) $tabs.append($tab);

                self.$tabButtons.push($tab);
                self.$panes.push($pane);
            });

            if (this.options.tabs) $chrome.append($tabs);
            
            if (this.options.chrome === 'win') {
                const $winBtns = $('<div class="ts-code-window__btns" aria-hidden="true"></div>')
                $winBtns
                    .append('<div class="minimize button"><svg viewBox="0 0 10.2 1" y="0px" x="0px"><rect height="1" width="10.2" y="50%" x="0"></rect></svg></div>')
                    .append('<div class="maximize button"><svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z"></path></svg></div>')
                    .append('<div class="close button"><svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"></polygon></svg></div>');
                $chrome.addClass('win').removeClass('mac').append($winBtns);
            }

            // Assemble + swap into the DOM
            $window.append($chrome, $body);
            this.$el.empty().append($window);

            this.$window = $window;
            this.activeIndex = active;

            // Delegate syntax highlighting to PluginHighlight (when present)
            this.highlightPanes();

            this.$el.trigger('codewindow:ready', [this]);
            return this;
        }

        highlightPanes() {
            const self = this;
            if (!this.options.highlight) return this;

            if (!$.isFunction($.fn.themestrapPluginHighlight)) {
                // Highlight plugin not on the page — panes still render as plain
                // (but styled) code. Nothing else to do.
                return this;
            }

            this.$panes.forEach($pane => {
                $pane.find('pre').themestrapPluginHighlight({
                    lineNumbers: self.options.lineNumbers,
                    showCopy:    self.options.showCopy,
                });
            });

            return this;
        }

        events() {
            const self = this;

            // Tab click
            this.$window.on('click.codewindow', '.ts-code-window__tab', function () {
                const id = $(this).attr('id');
                const i  = self.$tabButtons.findIndex($b => $b.attr('id') === id);
                if (i > -1) self.activate(i);
            });

            // Roving-tabindex keyboard support (ARIA tab pattern)
            this.$window.on('keydown.codewindow', '.ts-code-window__tab', function (e) {
                const id = $(this).attr('id');
                const i  = self.$tabButtons.findIndex($b => $b.attr('id') === id);
                if (i < 0) return;

                let next = null;
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown': next = (i + 1) % self.$tabButtons.length; break;
                    case 'ArrowLeft':
                    case 'ArrowUp':   next = (i - 1 + self.$tabButtons.length) % self.$tabButtons.length; break;
                    case 'Home':      next = 0; break;
                    case 'End':       next = self.$tabButtons.length - 1; break;
                    default: return;
                }

                e.preventDefault();
                self.activate(next);
                self.$tabButtons[next].trigger('focus');
            });

            return this;
        }

        activate(index) {
            const i = this.clampIndex(index, this.$panes.length);
            if (i === this.activeIndex) return this;

            this.$tabButtons.forEach(($tab, n) => {
                const on = n === i;
                $tab.attr({ 'aria-selected': on ? 'true' : 'false', tabindex: on ? '0' : '-1' });
            });

            this.$panes.forEach(($pane, n) => $pane.toggleClass('is-active', n === i));

            this.activeIndex = i;
            this.$el.trigger('codewindow:tab', [this, i, this.$panes[i]]);
            return this;
        }

        next() { return this.activate((this.activeIndex + 1) % this.$panes.length); }
        prev() { return this.activate((this.activeIndex - 1 + this.$panes.length) % this.$panes.length); }

        clampIndex(n, len) {
            n = parseInt(n, 10);
            if (isNaN(n) || n < 0) return 0;
            if (n > len - 1) return len - 1;
            return n;
        }

        injectStyles() {
            if (document.getElementById(STYLE_ID)) return this;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS_TEXT;
            document.head.appendChild(style);
            return this;
        }

        destroy() {
            if (this.$window) this.$window.off('.codewindow');
            this.$el.html(this.initialHTML).removeData(instanceName);
            return this;
        }
    }

    PluginCodeWindow._seq = 0;

    PluginCodeWindow.defaults = {
        activeTab:   0,
        chrome:      'win', // win or mac
        tabs:        true,
        glow:        true,
        lineNumbers: true,
        showCopy:    true,
        highlight:   true,
        accent:      '',
    };

    $.extend(themestrap, { PluginCodeWindow });

    $.fn.themestrapPluginCodeWindow = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCodeWindow($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
