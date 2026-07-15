/**
 * Themestrap Command Menu Plugin
 * Accessible, keyboard-driven command palette
 * Part of the Themestrap component library for MODX 3.
 *
 * Features:
 *   • Global keyboard shortcut (default: Cmd/Ctrl+K) to summon the palette anywhere.
 *   • Live fuzzy-ish substring filtering as the user types — searches the visible
 *     label, the optional description, AND any space-delimited keywords supplied
 *     via [data-command-keywords].
 *   • Keyboard navigation — ArrowUp / ArrowDown / Home / End / PgUp / PgDn,
 *     Enter to execute, Escape to close. The active item is auto-scrolled into view.
 *   • Item activation modes — navigate to [data-command-href], dispatch a
 *     [data-command-action] event, or invoke a JS callback registered against an
 *     [data-command-action] key.
 *   • Group headings — items inside a [data-command-group] share a sticky heading
 *     pulled from [data-command-heading]. Empty groups auto-hide as the user
 *     filters.
 *   • Empty state — a [data-command-empty] element is shown when no items match.
 *   • Recent commands — optionally pinned at the top of the list and persisted to
 *     localStorage (one history list per instance ID).
 *   • Full ARIA combobox + listbox pattern with aria-activedescendant.
 *
 * Markup anatomy:
 *
 *   <!-- Trigger (anywhere in the DOM) -->
 *   <button data-command-open="main-cmd">
 *     <kbd>⌘</kbd><kbd>K</kbd>
 *   </button>
 *
 *   <!-- Command Menu root -->
 *   <div data-plugin-command-menu id="main-cmd"
 *        data-plugin-options='{"shortcut": "mod+k", "recent": true}'>
 *
 *     <!-- Backdrop -->
 *     <div data-command-backdrop></div>
 *
 *     <!-- Panel -->
 *     <div data-command-panel>
 *
 *       <!-- Search input -->
 *       <div data-command-search>
 *         <i class="fas fa-search"></i>
 *         <input data-command-input type="text" placeholder="Type a command..." />
 *       </div>
 *
 *       <!-- List of groups and items -->
 *       <div data-command-list>
 *
 *         <!-- Empty state -->
 *         <div data-command-empty>No results found.</div>
 *
 *         <!-- Optional recents group (auto-managed when recent: true) -->
 *         <div data-command-group data-command-heading="Recent"
 *              data-command-recent></div>
 *
 *         <!-- Static groups -->
 *         <div data-command-group data-command-heading="Navigation">
 *           <button data-command-item
 *                   data-command-keywords="dashboard overview"
 *                   data-command-href="/dashboard">
 *             <i class="fas fa-home" data-command-icon></i>
 *             <span data-command-label>Dashboard</span>
 *             <span data-command-description>Go to the dashboard</span>
 *             <kbd data-command-shortcut>G D</kbd>
 *           </button>
 *
 *           <button data-command-item
 *                   data-command-action="new-project">
 *             <i class="fas fa-plus" data-command-icon></i>
 *             <span data-command-label>New project…</span>
 *             <kbd data-command-shortcut>⌘ N</kbd>
 *           </button>
 *         </div>
 *       </div>
 *
 *       <!-- Optional footer -->
 *       <div data-command-footer>
 *         <kbd>↑</kbd><kbd>↓</kbd> to navigate
 *         <kbd>↵</kbd> to select
 *         <kbd>esc</kbd> to close
 *       </div>
 *     </div>
 *   </div>
 *
 * Public API (via stored instance):
 *   const cmd = $('#main-cmd').data('__pluginCommandMenu');
 *   cmd.open();
 *   cmd.close();
 *   cmd.toggle();
 *   cmd.setQuery('proj');
 *   cmd.registerAction('new-project', () => { ... });
 *
 * Events fired on the command menu root element:
 *   command:open    — after the open transition begins                 (instance)
 *   command:close   — after the close transition completes             (instance)
 *   command:filter  — every time the query changes after filtering     (instance, query, matchCount)
 *   command:select  — when an item is activated (before navigation)    (instance, $item, payload)
 *
 * Init.js wiring (DOMReady-immediate — must be ready before any trigger fires):
 *   if ($.isFunction($.fn['themestrapPluginCommandMenu']) && $('[data-plugin-command-menu]').length) {
 *       $(() => {
 *           $('[data-plugin-command-menu]:not(.manual)').each(function () {
 *               const $this = $(this);
 *               const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
 *               $this.themestrapPluginCommandMenu(opts);
 *           });
 *       });
 *   }
 */
 // Command Menu
(((themestrap = {}, $) => {
    const instanceName = '__pluginCommandMenu';
    

    // Command Menu stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use this plugin.
    const STYLE_ID = 'ts-command-menu-styles';
    const CSS_TEXT = `           /** 
             *  Themestrap Command Menu — Styles
             *
             *  Every selector is data-attribute driven (no React, no headless
             *  wrappers — just classes and data-* hooks).
             *
             *  Variables can be overridden globally via :root, per-instance via the
             *  .command-menu element, or via theme skins (dark mode, brand colors).
             */
            :root {
                --command-bg:              var(--light);
                --command-fg:              #0f172a;
                --command-muted:           #64748b;
                --command-border:          rgba(15, 23, 42, 0.08);
                --command-border-strong:   rgba(15, 23, 42, 0.16);
                --command-hover:           rgba(15, 23, 42, 0.04);
                --command-active-bg:       rgba(15, 23, 42, 0.06);
                --command-active-fg:       #0f172a;
                --command-accent:          #e8672a;
                --command-backdrop:        rgba(15, 23, 42, 0.55);
                --command-radius:          var(--border-radius);
                --command-radius-item:     var(--border-radius2x);
                --command-shadow:          0 24px 56px -12px rgba(15, 23, 42, 0.32),
                                           0 4px 12px -4px rgba(15, 23, 42, 0.16);
                --command-panel-width:     min(96vw, 640px);
                --command-list-max-h:      min(60vh, 480px);
                --command-z:               1080;
                --command-font:            inherit;
            }

            /* Dark variant */
            html.dark .command-menu, .command-menu.command-dark {
                --command-bg: var(--dark-300);
                --command-fg: var(--grey);
                --command-muted: var(--dark--300);
                --command-border: var(--dark-rgba-80);
                --command-border-strong: var(--dark-rgba-20);
                --command-hover: var(--dark-rgba-10);
                --command-active-bg: var(--dark-rgba-10);
                --command-active-fg: var(--light);
                --command-backdrop: rgba(0, 0, 0, .6);
                --command-shadow: 0 24px 56px -12px rgba(0, 0, 0, 0.6),
                                  0 4px 12px -4px rgba(0, 0, 0, 0.4);
            }

            /* Root container */
            .command-menu {
                position: fixed;
                inset: 0;
                z-index: var(--command-z);
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding: clamp(40px, 12vh, 120px) 16px 16px;
                font-family: var(--command-font);
                color: var(--command-fg);
                pointer-events: auto;
            }

            .command-menu.command-hidden {
                /* Use display:none so focus can never reach the panel when closed */
                display: none;
            }

            /* Backdrop */
            .command-menu [data-command-backdrop] {
                position: absolute;
                inset: 0;
                background: var(--command-backdrop);
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                animation: command-fade-in 180ms ease both;
            }

            .command-menu.command-hidden [data-command-backdrop] {
                animation: none;
            }

            /* Panel */
            .command-menu [data-command-panel] {
                position: relative;
                width: var(--command-panel-width);
                background: var(--command-bg);
                color: var(--command-fg);
                border: 1px solid var(--command-border);
                border-radius: var(--command-radius);
                box-shadow: var(--command-shadow);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                max-height: min(80vh, 720px);
                animation: command-panel-in 200ms cubic-bezier(.16, 1, .3, 1) both;
            }

            /* Panel size variants */
            .command-menu [data-command-panel].command-sm  { --command-panel-width: min(96vw, 440px); }
            .command-menu [data-command-panel].command-lg  { --command-panel-width: min(96vw, 800px); }
            .command-menu [data-command-panel].command-xl  { --command-panel-width: min(96vw, 960px); }

            /* Search row */
            .command-menu [data-command-search] {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 18px;
                border-bottom: 1px solid var(--command-border);
            }

            .command-menu [data-command-search] > i,
            .command-menu [data-command-search] > svg {
                color: var(--command-muted);
                font-size: 16px;
                flex: 0 0 auto;
                pointer-events: none;
            }

            .command-menu [data-command-input] {
                flex: 1 1 auto;
                appearance: none;
                border: 0;
                outline: 0;
                background: transparent;
                color: var(--command-fg);
                font-size: 15px;
                line-height: 1.5;
                padding: 4px 0;
                font-family: inherit;
            }

            .command-menu [data-command-input]::placeholder {
                color: var(--command-muted);
                opacity: 1;
            }

            /* Optional close shortcut hint inside the search row */
            .command-menu [data-command-search] kbd {
                background: var(--command-hover);
                border: 1px solid var(--command-border);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* List & groups */
            .command-menu [data-command-list] {
                flex: 1 1 auto;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 6px;
                max-height: var(--command-list-max-h);
                scrollbar-width: thin;
                scrollbar-color: var(--command-border-strong) transparent;
            }

            .command-menu [data-command-list]::-webkit-scrollbar {
                width: 8px;
            }
            .command-menu [data-command-list]::-webkit-scrollbar-thumb {
                background: var(--command-border-strong);
                border-radius: 8px;
            }

            .command-menu [data-command-group] {
                padding: 4px 0;
            }

            .command-menu [data-command-group][hidden] {
                display: none;
            }

            .command-menu [data-command-group-heading] {
                padding: 8px 10px 4px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--command-muted);
                user-select: none;
            }

            /* Visual separator between groups */
            .command-menu [data-command-group] + [data-command-group] {
                border-top: 1px solid var(--command-border);
                margin-top: 6px;
                padding-top: 8px;
            }

            /* Items */
            .command-menu [data-command-item] {
                appearance: none;
                border: 0;
                background: transparent;
                color: inherit;
                text-align: left;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 9px 10px;
                border-radius: var(--command-radius-item);
                font-size: 14px;
                line-height: 1.4;
                cursor: pointer;
                transition: background-color 80ms ease, color 80ms ease;
                font-family: inherit;
            }

            .command-menu [data-command-item][hidden] {
                display: none;
            }

            .command-menu [data-command-item]:hover,
            .command-menu [data-command-item].command-item-active,
            .command-menu [data-command-item][aria-selected="true"] {
                background: var(--command-active-bg);
                color: var(--command-active-fg);
                outline: none;
            }

            .command-menu [data-command-item]:focus-visible {
                outline: 2px solid var(--command-accent);
                outline-offset: -2px;
            }

            .command-menu [data-command-item][disabled],
            .command-menu [data-command-item][aria-disabled="true"] {
                opacity: 0.45;
                cursor: not-allowed;
                pointer-events: none;
            }

            /* Item icon */
            .command-menu [data-command-item] [data-command-icon] {
                flex: 0 0 18px;
                width: 18px;
                text-align: center;
                color: var(--command-muted);
                font-size: 15px;
                transition: color 80ms ease;
            }

            .command-menu [data-command-item].command-item-active [data-command-icon],
            .command-menu [data-command-item]:hover [data-command-icon] {
                color: var(--command-active-fg);
            }

            /* Item label + description column */
            .command-menu [data-command-item] [data-command-label] {
                flex: 1 1 auto;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: 500;
            }

            .command-menu [data-command-item] [data-command-description] {
                display: block;
                font-size: 12px;
                color: var(--command-muted);
                font-weight: 400;
                margin-top: 1px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* When both label and description live in their own span, stack them */
            .command-menu [data-command-item] [data-command-label]:has(+ [data-command-description]) {
                /* No-op for fallback; the structural CSS below handles stacking */
            }

            .command-menu [data-command-item]:has([data-command-description]) [data-command-label] {
                display: block;
            }

            .command-menu [data-command-item]:has([data-command-description]) {
                align-items: center;
            }

            /* Wrap label + description in an inline column when both are present */
            .command-menu [data-command-item] [data-command-label] + [data-command-description] {
                /* If author puts description after label without a wrapper, force it onto its own line */
                width: 100%;
                flex: 1 0 100%;
                margin-top: 2px;
                margin-left: 30px;   /* align with label, accounting for icon column */
            }

            /* Right-aligned shortcut */
            .command-menu [data-command-item] [data-command-shortcut] {
                flex: 0 0 auto;
                margin-left: auto;
                display: inline-flex;
                align-items: center;
                gap: 3px;
                color: var(--command-muted);
                font-size: 11.5px;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
                font-weight: 500;
            }

            .command-menu [data-command-item] [data-command-shortcut] kbd,
            .command-menu [data-command-item] kbd[data-command-shortcut] {
                background: var(--command-hover);
                border: 1px solid var(--command-border);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* Right-aligned trailing badge (e.g. "New", "Beta") */
            .command-menu [data-command-item] [data-command-badge] {
                flex: 0 0 auto;
                margin-left: auto;
                display: inline-block;
                padding: 2px 8px;
                border-radius: 999px;
                background: var(--command-accent);
                color: #fff;
                font-size: 10.5px;
                font-weight: 600;
                letter-spacing: 0.02em;
                text-transform: uppercase;
            }

            /* Empty state */
            .command-menu [data-command-empty] {
                padding: 36px 16px;
                text-align: center;
                color: var(--command-muted);
                font-size: 14px;
                line-height: 1.5;
            }

            .command-menu [data-command-empty] strong {
                display: block;
                color: var(--command-fg);
                font-weight: 600;
                margin-bottom: 4px;
            }

            /* Footer */
            .command-menu [data-command-footer] {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 8px 14px;
                border-top: 1px solid var(--command-border);
                background: var(--command-hover);
                color: var(--command-muted);
                font-size: 11.5px;
                flex-wrap: wrap;
            }

            .command-menu [data-command-footer] span,
            .command-menu [data-command-footer] .command-footer-item {
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .command-menu [data-command-footer] kbd {
                background: var(--command-bg);
                border: 1px solid var(--command-border-strong);
                color: var(--command-muted);
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10.5px;
                line-height: 1;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
                box-shadow: 0 1px 0 var(--command-border);
            }

            /* External trigger button preset */
            [data-command-open] {
                /* Subtle inline-input lookalike — entirely optional, opt in via the
                   .command-trigger class or use your own button styling. */
            }

            .command-trigger {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 6px 10px 6px 12px;
                background: var(--command-bg, #fff);
                color: var(--command-muted, #64748b);
                border: 1px solid var(--command-border, rgba(15, 23, 42, 0.12));
                border-radius: 8px;
                font-size: 13px;
                line-height: 1.4;
                min-width: 220px;
                cursor: pointer;
                transition: border-color 100ms ease, box-shadow 100ms ease, background 100ms ease;
            }

            .command-trigger:hover {
                border-color: var(--command-border-strong, rgba(15, 23, 42, 0.2));
                background: var(--command-hover, rgba(15, 23, 42, 0.04));
            }

            .command-trigger .command-trigger-label {
                flex: 1 1 auto;
                text-align: left;
            }

            .command-trigger .command-trigger-shortcut {
                flex: 0 0 auto;
                display: inline-flex;
                gap: 3px;
            }

            .command-trigger .command-trigger-shortcut kbd {
                background: var(--command-hover, rgba(15, 23, 42, 0.06));
                border: 1px solid var(--command-border, rgba(15, 23, 42, 0.12));
                color: var(--command-muted, #64748b);
                border-radius: 4px;
                padding: 1px 5px;
                font-size: 10.5px;
                line-height: 1.2;
                font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
            }

            /* Animations */
            @keyframes command-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            @keyframes command-fade-out {
                from { opacity: 1; }
                to   { opacity: 0; }
            }

            @keyframes command-panel-in {
                from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }

            @keyframes command-panel-out {
                from { opacity: 1; transform: translateY(0)    scale(1);    }
                to   { opacity: 0; transform: translateY(-4px) scale(0.98); }
            }

            /* Animate.css compat — the plugin applies generic animation classes. */
            .command-menu [data-command-panel].fadeIn  { animation-name: command-panel-in;  }
            .command-menu [data-command-panel].fadeOut { animation-name: command-panel-out; }

            /* Reduced motion override */
            @media (prefers-reduced-motion: reduce) {
                .command-menu [data-command-panel],
                .command-menu [data-command-backdrop],
                .command-menu [data-command-panel].fadeIn,
                .command-menu [data-command-panel].fadeOut {
                    animation: none !important;
                }
            }

            /* Responsive — full-screen on phones */
            @media (max-width: 575.98px) {
                .command-menu {
                    padding: 0;
                    align-items: stretch;
                }
                .command-menu [data-command-panel],
                .command-menu [data-command-panel].command-sm,
                .command-menu [data-command-panel].command-lg,
                .command-menu [data-command-panel].command-xl {
                    width: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                    border: 0;
                }
                .command-menu [data-command-list] {
                    max-height: none;
                    flex: 1 1 auto;
                }
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

    // Scrollbar measurement — same approach as PluginDialog, shared CSS var.
    // If PluginDialog has already set --dialog-scrollbar-width we leave it alone.
    function measureScrollbarWidth() {
        function measure() {
            if (document.documentElement.style.getPropertyValue('--dialog-scrollbar-width')) return;

            const outer = document.createElement('div');
            outer.style.cssText = 'visibility:hidden;overflow:scroll;position:absolute;width:100px';
            document.body.appendChild(outer);
            const width = outer.offsetWidth - outer.clientWidth;
            document.body.removeChild(outer);
            document.documentElement.style.setProperty('--dialog-scrollbar-width', width + 'px');
        }

        if (document.body) {
            measure();
        } else {
            document.addEventListener('DOMContentLoaded', measure, { once: true });
        }
    }

    // Short collision-resistant ID generator.
    let _seq = 0;
    const uid = (prefix) => `${prefix}-${++_seq}-${Math.random().toString(36).slice(2, 7)}`;

    // Platform detection — Mac uses ⌘ (metaKey), Win/Linux uses Ctrl.
    const isMac = typeof navigator !== 'undefined' &&
                  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');

    /**
     * Parse a shortcut string like "mod+k", "ctrl+shift+p", "/", "?" into a
     * descriptor object used by the keydown matcher.
     *
     *   mod  → ⌘ on Mac, Ctrl on others
     *   alt  → Alt / Option
     *   shift → Shift
     *   key  → the actual non-modifier key
     */
    function parseShortcut(str) {
        if (!str) return null;
        const parts = String(str).toLowerCase().split('+').map(s => s.trim());
        const desc = { mod: false, ctrl: false, alt: false, shift: false, key: '' };
        parts.forEach(p => {
            if (p === 'mod')        desc.mod   = true;
            else if (p === 'ctrl')  desc.ctrl  = true;
            else if (p === 'alt' || p === 'option') desc.alt = true;
            else if (p === 'shift') desc.shift = true;
            else                    desc.key   = p;
        });
        return desc;
    }

    function matchShortcut(e, desc) {
        if (!desc || !desc.key) return false;

        // Normalize the event key — "K" vs "k", spacebar's " ", etc.
        const key = (e.key || '').toLowerCase();
        if (key !== desc.key) return false;

        const modActive = isMac ? e.metaKey : e.ctrlKey;

        if (desc.mod   && !modActive) return false;
        if (!desc.mod  &&  desc.ctrl && !e.ctrlKey) return false;
        if (desc.alt   && !e.altKey) return false;
        if (desc.shift && !e.shiftKey) return false;

        // If mod isn't required, ensure the OS modifier ISN'T pressed
        // (so "/" doesn't fire while Cmd+/ is held).
        if (!desc.mod && !desc.ctrl) {
            if (e.metaKey || e.ctrlKey) return false;
        }

        return true;
    }

    /**
     * Should the global shortcut be ignored because the user is mid-typing?
     * We DO want ⌘K to work inside ordinary inputs (matching Linear / Vercel /
     * GitHub behaviour), so we only block plain printable shortcuts.
     */
    function isTypingTarget(target, desc) {
        if (desc && (desc.mod || desc.ctrl)) return false;

        const tag = (target && target.tagName) ? target.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
        if (target && target.isContentEditable) return true;
        return false;
    }

    class PluginCommandMenu {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el            = $el;
            this.$previousFocus = null;
            this.isOpen         = false;
            this._uid           = uid('command');
            this._actions       = {};      // string key → callback
            this._activeIndex   = -1;      // index into _visibleItems
            this._visibleItems  = $();
            this._query         = '';

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
            this.options = $.extend(true, {}, PluginCommandMenu.defaults, opts, {
                wrapper: this.$el,
            });

            // Pre-compute shortcut descriptor once.
            this._shortcutDesc = parseShortcut(this.options.shortcut);

            return this;
        }

        build() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            // Lazily inject CSS + measure the scrollbar the first time a menu is
            // actually built — never on bare script load.
            injectStyles();
            measureScrollbarWidth();

            // ARIA scaffolding — dialog wrapping a combobox over a listbox.
            $el
                .addClass('command-menu')
                .attr('role', 'dialog')
                .attr('aria-modal', 'true')
                .attr('aria-hidden', 'true')
                .attr('aria-label', $el.attr('aria-label') || 'Command Menu')
                .attr('tabindex', '-1');

            // Ensure backdrop element exists.
            self.$backdrop = $el.find('[data-command-backdrop]');
            if (!self.$backdrop.length && opts.backdrop) {
                self.$backdrop = $('<div data-command-backdrop></div>').prependTo($el);
            }

            // Cache key elements
            self.$panel     = $el.find('[data-command-panel]').first();
            self.$input     = $el.find('[data-command-input]').first();
            self.$list      = $el.find('[data-command-list]').first();
            self.$empty     = $el.find('[data-command-empty]').first();
            self.$footer    = $el.find('[data-command-footer]').first();
            self.$recent    = $el.find('[data-command-recent]').first();

            // Hidden by default — CSS-class driven so theming has full control.
            if (!$el.hasClass('command-is-open')) {
                $el.addClass('command-hidden');
            }

            // ARIA wiring on the input
            if (self.$input.length) {
                const listId = self.$list.attr('id') || uid('command-list');
                self.$list.attr('id', listId).attr('role', 'listbox');

                self.$input
                    .attr('role',           'combobox')
                    .attr('autocomplete',   'off')
                    .attr('autocorrect',    'off')
                    .attr('autocapitalize', 'off')
                    .attr('spellcheck',     'false')
                    .attr('aria-autocomplete', 'list')
                    .attr('aria-expanded',  'false')
                    .attr('aria-controls',  listId);
            }

            // Assign IDs to every item so we can use aria-activedescendant
            $el.find('[data-command-item]').each(function () {
                const $it = $(this);
                if (!$it.attr('id'))   $it.attr('id', uid('command-item'));
                if (!$it.attr('role')) $it.attr('role', 'option');
                $it.attr('aria-selected', 'false');
                $it.attr('tabindex', '-1');
            });

            // Group ARIA
            $el.find('[data-command-group]').each(function () {
                const $g = $(this);
                if (!$g.attr('role')) $g.attr('role', 'group');
                const heading = $g.attr('data-command-heading');
                if (heading && !$g.find('[data-command-group-heading]').length) {
                    $('<div data-command-group-heading></div>').text(heading).prependTo($g);
                }
            });

            // Hide empty state initially
            if (self.$empty.length) {
                self.$empty.attr('hidden', true);
            }

            // Render recents bucket on first build
            if (opts.recent) {
                self._renderRecent();
            } else if (self.$recent.length) {
                self.$recent.hide();
            }

            // Build the cached pool of items used by filter().
            self._allItems = $el.find('[data-command-item]');

            return this;
        }

        events() {
            const self     = this;
            const $el      = self.$el;
            const opts     = self.options;
            const dialogId = $el.attr('id');

            // External trigger buttons.
            if (dialogId) {
                $(document).on(
                    `click.commandmenu.${self._uid}`,
                    `[data-command-open="${dialogId}"]`,
                    function (e) {
                        e.preventDefault();
                        self.toggle();
                    }
                );
            }

            // Internal close buttons
            $el.on('click.commandmenu', '[data-command-close]', function (e) {
                e.preventDefault();
                self.close();
            });

            // Backdrop click to close
            if (opts.closeOnBackdrop && self.$backdrop && self.$backdrop.length) {
                $el.on('click.commandmenu.backdrop', function (e) {
                    if ($(e.target).is('[data-command-backdrop]')) {
                        self.close();
                    }
                });
            }

            // Item activation — click or Enter on focused item
            $el.on('click.commandmenu', '[data-command-item]', function (e) {
                e.preventDefault();
                self._activate($(this));
            });

            // Item hover should sync the active index
            $el.on('mousemove.commandmenu', '[data-command-item]', function () {
                const idx = self._visibleItems.index(this);
                if (idx >= 0 && idx !== self._activeIndex) {
                    self._setActive(idx, false);   // no scroll on hover
                }
            });

            // Search input
            if (self.$input.length) {
                self.$input.on('input.commandmenu', function () {
                    self._query = this.value;
                    self._filter();
                });

                // Key handling on the input (navigation must work while typing)
                self.$input.on('keydown.commandmenu', function (e) {
                    self._onInputKey(e);
                });
            }

            // Document-level keydown — Escape, shortcuts, etc.
            $(document).on(`keydown.commandmenu.${self._uid}`, function (e) {
                // Escape always closes when open
                if (self.isOpen && (e.key === 'Escape' || e.keyCode === 27)) {
                    e.preventDefault();
                    self.close();
                    return;
                }

                // Global open shortcut — only when CLOSED
                if (!self.isOpen && self._shortcutDesc) {
                    if (isTypingTarget(e.target, self._shortcutDesc)) return;

                    if (matchShortcut(e, self._shortcutDesc)) {
                        e.preventDefault();
                        self.open();
                    }
                }
            });

            return this;
        }

        open() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (self.isOpen) return this;
            self.isOpen = true;

            self.$previousFocus = $(document.activeElement);

            if (opts.scrollLock) {
                $('body').addClass('dialog-scroll-lock');
            }

            $el
                .removeClass('command-hidden')
                .addClass('command-is-open')
                .attr('aria-hidden', 'false');

            if (self.$input.length) {
                self.$input.attr('aria-expanded', 'true');
            }

            const $animTarget = self.$panel.length ? self.$panel : $el;
            if (opts.animationIn) {
                $animTarget
                    .addClass(`command-anim-enter ${opts.animationIn}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`command-anim-enter ${opts.animationIn}`);
                    });
                setTimeout(() => {
                    $animTarget.removeClass(`command-anim-enter ${opts.animationIn}`);
                }, opts.animationDuration + 50);
            }

            // Reset query each open unless preserveQuery is on
            if (!opts.preserveQuery) {
                self._query = '';
                if (self.$input.length) self.$input.val('');
            }

            // Initial filter pass to populate _visibleItems
            self._filter();

            // Focus the search input
            setTimeout(() => {
                if (self.$input.length) {
                    self.$input.trigger('focus');
                    if (opts.preserveQuery && self.$input.val()) {
                        // Select all so typing replaces it
                        self.$input[0].setSelectionRange(0, self.$input.val().length);
                    }
                }
            }, 50);

            if (typeof opts.onOpen === 'function') opts.onOpen.call(self, $el);
            $el.trigger('command:open', [self]);

            return this;
        }

        close() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return this;

            const $animTarget = self.$panel.length ? self.$panel : $el;

            if (opts.animationOut) {
                $animTarget
                    .addClass(`command-anim-leave ${opts.animationOut}`)
                    .one('animationend webkitAnimationEnd', function () {
                        $animTarget.removeClass(`command-anim-leave ${opts.animationOut}`);
                        self._finishClose();
                    });
                setTimeout(() => {
                    $animTarget.removeClass(`command-anim-leave ${opts.animationOut}`);
                    self._finishClose();
                }, opts.animationDuration + 50);
            } else {
                self._finishClose();
            }

            return this;
        }

        toggle() {
            return this.isOpen ? this.close() : this.open();
        }

        /**
         * Programmatically set the search query. Triggers the same filter()
         * pipeline as user typing.
         */
        setQuery(q) {
            const self = this;
            self._query = q || '';
            if (self.$input.length) self.$input.val(self._query);
            self._filter();
            return this;
        }

        /**
         * Register a JS callback against a [data-command-action] key. When the
         * matching item is activated, the callback receives ($item, instance).
         */
        registerAction(key, cb) {
            if (typeof key === 'string' && typeof cb === 'function') {
                this._actions[key] = cb;
            }
            return this;
        }

        /**
         * Unregister an action. No-op if the key was never registered.
         */
        unregisterAction(key) {
            delete this._actions[key];
            return this;
        }

        /**
         * Manually push a "recent" entry. Normally this happens automatically
         * when an item is selected and opts.recent is true.
         */
        pushRecent(id) {
            this._pushRecent(id);
            this._renderRecent();
            return this;
        }

        /**
         * Clear stored recent entries.
         */
        clearRecent() {
            const key = this._recentKey();
            if (key && typeof localStorage !== 'undefined') {
                try { localStorage.removeItem(key); } catch (_) {}
            }
            this._renderRecent();
            return this;
        }

        _finishClose() {
            const self = this;
            const $el  = self.$el;
            const opts = self.options;

            if (!self.isOpen) return;
            self.isOpen = false;

            $el
                .addClass('command-hidden')
                .removeClass('command-is-open')
                .attr('aria-hidden', 'true');

            if (self.$input.length) {
                self.$input.attr('aria-expanded', 'false');
                self.$input.removeAttr('aria-activedescendant');
            }

            if (opts.scrollLock) {
                $('body').removeClass('dialog-scroll-lock');
            }

            if (self.$previousFocus && self.$previousFocus.length) {
                self.$previousFocus.trigger('focus');
                self.$previousFocus = null;
            }

            if (typeof opts.onClose === 'function') opts.onClose.call(self, $el);
            $el.trigger('command:close', [self]);
        }

        /**
         * The core filter pipeline — runs on every input event and on open().
         * Builds the _visibleItems set, hides non-matching items, hides empty
         * groups, toggles the empty state, and re-selects the first match.
         */
        _filter() {
            const self = this;
            const opts = self.options;
            const q    = self._query.trim().toLowerCase();
            const tokens = q ? q.split(/\s+/) : [];

            // 1. Per-item match
            const visible = [];

            self._allItems.each(function () {
                const $it = $(this);

                // Items marked data-command-skip-filter are always shown when
                // their parent group is shown (used for static helpers like
                // "Clear recents").
                if ($it.is('[data-command-skip-filter]')) {
                    $it.removeAttr('hidden');
                    if (tokens.length === 0 || self._matchItem($it, tokens)) {
                        visible.push(this);
                    }
                    return;
                }

                if (tokens.length === 0 || self._matchItem($it, tokens)) {
                    $it.removeAttr('hidden');
                    visible.push(this);
                } else {
                    $it.attr('hidden', true);
                    $it.attr('aria-selected', 'false');
                }
            });

            // 2. Hide empty groups (groups with no visible items)
            self.$el.find('[data-command-group]').each(function () {
                const $g = $(this);
                const hasVisible = $g.find('[data-command-item]:not([hidden])').length > 0;
                if (hasVisible) {
                    $g.removeAttr('hidden');
                } else {
                    $g.attr('hidden', true);
                }
            });

            // 3. Toggle empty state
            self._visibleItems = $(visible);
            if (self.$empty.length) {
                if (visible.length === 0) {
                    self.$empty.removeAttr('hidden');
                } else {
                    self.$empty.attr('hidden', true);
                }
            }

            // 4. Re-select first item
            if (self._visibleItems.length) {
                self._setActive(0, false);
            } else {
                self._activeIndex = -1;
                if (self.$input.length) self.$input.removeAttr('aria-activedescendant');
            }

            // 5. Notify listeners
            self.$el.trigger('command:filter', [self, q, visible.length]);

            if (typeof opts.onFilter === 'function') {
                opts.onFilter.call(self, q, visible.length);
            }

            return this;
        }

        /**
         * Test a single item against a token list. Tokens are AND'd together.
         * The haystack is built from: label, description, keywords, and the
         * item's own text content (fallback when no [data-command-label]).
         */
        _matchItem($it, tokens) {
            // Build a haystack — cache it on the element after first read.
            let hay = $it.data('_commandHay');
            if (!hay) {
                const parts = [];
                const $label = $it.find('[data-command-label]').first();
                parts.push($label.length ? $label.text() : $it.text());

                const $desc = $it.find('[data-command-description]').first();
                if ($desc.length) parts.push($desc.text());

                const kw = $it.attr('data-command-keywords');
                if (kw) parts.push(kw);

                hay = parts.join(' ').toLowerCase().replace(/\s+/g, ' ').trim();
                $it.data('_commandHay', hay);
            }

            // Every token must appear in the haystack.
            for (let i = 0; i < tokens.length; i++) {
                if (hay.indexOf(tokens[i]) === -1) return false;
            }
            return true;
        }

        /**
         * Move the active index to `idx` (clamped to visible range) and update
         * ARIA + visual state. When `scroll` is true, the item is scrolled into
         * view inside the list.
         */
        _setActive(idx, scroll) {
            const self = this;
            const len  = self._visibleItems.length;
            if (!len) {
                self._activeIndex = -1;
                return;
            }
            // Clamp / wrap
            if (idx < 0)    idx = len - 1;
            if (idx >= len) idx = 0;

            // Clear previous
            self._visibleItems.attr('aria-selected', 'false')
                              .removeClass('command-item-active');

            self._activeIndex = idx;
            const $cur = self._visibleItems.eq(idx);
            $cur.attr('aria-selected', 'true').addClass('command-item-active');

            const itemId = $cur.attr('id');
            if (itemId && self.$input.length) {
                self.$input.attr('aria-activedescendant', itemId);
            }

            if (scroll !== false) self._scrollIntoView($cur);
        }

        _scrollIntoView($item) {
            if (!$item || !$item.length || !this.$list.length) return;
            const item = $item[0];
            const list = this.$list[0];

            const iTop    = item.offsetTop;
            const iBottom = iTop + item.offsetHeight;
            const lTop    = list.scrollTop;
            const lBottom = lTop + list.clientHeight;

            if (iTop < lTop) {
                list.scrollTop = iTop;
            } else if (iBottom > lBottom) {
                list.scrollTop = iBottom - list.clientHeight;
            }
        }

        _onInputKey(e) {
            const self = this;
            const len  = self._visibleItems.length;
            const key  = e.key;

            // Allow consumers to handle keys before us
            const beforeEvent = $.Event('command:keydown', { originalEvent: e });
            self.$el.trigger(beforeEvent, [self, key]);
            if (beforeEvent.isDefaultPrevented()) {
                e.preventDefault();
                return;
            }

            switch (key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (len) self._setActive(self._activeIndex + 1);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    if (len) self._setActive(self._activeIndex - 1);
                    break;

                case 'Home':
                    e.preventDefault();
                    if (len) self._setActive(0);
                    break;

                case 'End':
                    e.preventDefault();
                    if (len) self._setActive(len - 1);
                    break;

                case 'PageDown':
                    e.preventDefault();
                    if (len) self._setActive(Math.min(self._activeIndex + 5, len - 1));
                    break;

                case 'PageUp':
                    e.preventDefault();
                    if (len) self._setActive(Math.max(self._activeIndex - 5, 0));
                    break;

                case 'Enter':
                    if (self._activeIndex >= 0) {
                        e.preventDefault();
                        self._activate(self._visibleItems.eq(self._activeIndex));
                    }
                    break;

                case 'Tab':
                    // Trap focus inside the menu
                    if (!e.shiftKey && self._activeIndex >= 0) {
                        e.preventDefault();
                        self._setActive(self._activeIndex + 1);
                    } else if (e.shiftKey && self._activeIndex >= 0) {
                        e.preventDefault();
                        self._setActive(self._activeIndex - 1);
                    }
                    break;
            }
        }

        /**
         * Run the activation pipeline for an item:
         *   1. Fire command:select (cancellable)
         *   2. Push to recents
         *   3. Resolve action: href → navigate, action key → callback, else close
         */
        _activate($item) {
            const self = this;
            const opts = self.options;

            if (!$item || !$item.length || $item.is('[disabled], [aria-disabled="true"]')) {
                return;
            }

            const payload = {
                id:       $item.attr('id'),
                action:   $item.attr('data-command-action'),
                href:     $item.attr('data-command-href'),
                target:   $item.attr('data-command-target'),
                label:    ($item.find('[data-command-label]').first().text() || $item.text()).trim(),
            };

            // Fire select event — preventDefault to suppress navigation/close.
            const evt = $.Event('command:select');
            self.$el.trigger(evt, [self, $item, payload]);

            if (typeof opts.onSelect === 'function') {
                opts.onSelect.call(self, $item, payload);
            }

            if (evt.isDefaultPrevented()) return;

            // Track recent
            if (opts.recent && payload.id) {
                self._pushRecent(payload.id);
            }

            // Resolve action
            if (payload.action && typeof self._actions[payload.action] === 'function') {
                self._actions[payload.action].call(self, $item, self);
            } else if (payload.href) {
                if (opts.closeOnSelect) self.close();
                if (payload.target && payload.target !== '_self') {
                    window.open(payload.href, payload.target);
                    return;
                }
                window.location.href = payload.href;
                return;
            }

            if (opts.closeOnSelect) self.close();
        }

        _recentKey() {
            const id = this.$el.attr('id');
            if (!id) return null;
            return `themestrap.command.recent.${id}`;
        }

        _getRecent() {
            const key = this._recentKey();
            if (!key || typeof localStorage === 'undefined') return [];
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : [];
            } catch (_) {
                return [];
            }
        }

        _pushRecent(id) {
            const self = this;
            const key  = self._recentKey();
            if (!key || typeof localStorage === 'undefined') return;
            const list = self._getRecent().filter(x => x !== id);
            list.unshift(id);
            const trimmed = list.slice(0, self.options.recentLimit);
            try {
                localStorage.setItem(key, JSON.stringify(trimmed));
            } catch (_) {}
            self._renderRecent();
        }

        /**
         * Render the recents group by cloning each remembered item from the
         * static list into the [data-command-recent] container.
         */
        _renderRecent() {
            const self = this;
            const $rec = self.$recent;
            if (!$rec.length) return;

            $rec.empty();

            const ids = self._getRecent();
            if (!ids.length) {
                $rec.hide();
                return;
            }

            ids.forEach(id => {
                const $orig = self.$el.find(`#${$.escapeSelector ? $.escapeSelector(id) : id}`).first();
                // Don't clone items that no longer exist (or items inside the recents bucket itself).
                if (!$orig.length || $orig.closest('[data-command-recent]').length) return;

                const $clone = $orig.clone(true);
                // Mark the clone so we can identify it later if needed.
                $clone.attr('data-command-clone', id);
                // Give clones a unique ID so aria-activedescendant works for them too.
                $clone.attr('id', uid('command-item'));
                // Restore default ARIA state on the clone.
                $clone.attr('aria-selected', 'false').removeClass('command-item-active');
                $clone.removeAttr('hidden');
                $clone.removeData('_commandHay');
                $rec.append($clone);
            });

            $rec.show();

            // Re-prime the cached pool — clones are real items too.
            self._allItems = self.$el.find('[data-command-item]');
        }

        destroy() {
            const self = this;
            if (self.isOpen) self.close();

            $(document).off(`click.commandmenu.${self._uid}`);
            $(document).off(`keydown.commandmenu.${self._uid}`);
            self.$el.off('.commandmenu');
            if (self.$input.length) self.$input.off('.commandmenu');

            self.$el
                .removeData(instanceName)
                .removeClass('command-menu command-hidden command-is-open')
                .removeAttr('role aria-modal aria-hidden aria-label tabindex');

            return this;
        }
    }

    PluginCommandMenu.defaults = {
        // Global keyboard shortcut to summon the menu. Use "mod+k" for ⌘K on Mac
        // and Ctrl+K elsewhere. Set to null to disable the global shortcut.
        shortcut         : 'mod+k',

        // Close behaviour
        closeOnBackdrop  : true,
        closeOnSelect    : true,

        // Backdrop & scroll-lock
        backdrop         : true,
        scrollLock       : true,

        // Animation classes applied to [data-command-panel] (falls back to root).
        animationIn      : 'fadeIn',
        animationOut     : 'fadeOut',
        animationDuration: 200,

        // When true, the search query survives close/reopen cycles.
        preserveQuery    : false,

        // Recent commands — auto-cloned into [data-command-recent] when present.
        recent           : false,
        recentLimit      : 5,

        // Lifecycle callbacks. All receive `this` as the plugin instance.
        onOpen           : null,    // ($el)
        onClose          : null,    // ($el)
        onFilter         : null,    // (query, matchCount)
        onSelect         : null,    // ($item, payload)
    };

    $.extend(themestrap, { PluginCommandMenu });

    $.fn.themestrapPluginCommandMenu = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCommandMenu($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
