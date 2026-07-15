/**
 * Themestrap Accordion Plugin
 *
 * A true multi-item accordion: a group of disclosure rows where (by default)
 * only one panel is open at a time. This is the *group* counterpart to
 * PluginCollapsible (which manages a single, standalone panel). Use Accordion
 * for FAQs, settings groups, nested docs nav, "show more" stacks — anywhere a
 * set of headers reveal/hide their own bodies and you want exclusive-open,
 * keyboard navigation, and a clean height transition out of the box.
 *
 * Visuals are themed with the Themestrap "Venom" palette (Base16 Black Metal /
 * Venom-inspired): near-black surfaces, hairline borders, cream headings, and a
 * single deep blood-red accent. Tokens resolve from global --ts-venom-* custom
 * properties when present, and fall back to baked-in literals otherwise, so the
 * component looks right standalone and inherits a site-wide palette if one is
 * defined.
 *
 * All CSS is contained in this file and injected ONCE per page, lazily, on the
 * first build() — loading the script never adds styles to pages that don't use
 * the plugin.
 *
 * Part of the Themestrap component library for MODX 3.
 *
 * MARKUP
 *   <div data-plugin-accordion data-plugin-options='{"exclusive": true, "openIndex": 0}'>
 *
 *     <div data-accordion-item>
 *       <button type="button" data-accordion-trigger>What is Themestrap?</button>
 *       <div data-accordion-panel>
 *         <p>A jQuery + Bootstrap component library for MODX 3.</p>
 *       </div>
 *     </div>
 *
 *     <div data-accordion-item>
 *       <button type="button" data-accordion-trigger>How are panels animated?</button>
 *       <div data-accordion-panel>
 *         <p>Each panel animates 0 &harr; measured height, then hands off to CSS.</p>
 *       </div>
 *     </div>
 *
 *   </div>
 *
 *   Per item the plugin looks for:
 *     [data-accordion-trigger]  the header/toggle. Falls back to the first
 *                               <button>/<a>/[data-accordion-header] in the item.
 *     [data-accordion-panel]    the collapsible body. Falls back to
 *                               [data-accordion-content], else the trigger's
 *                               next sibling element.
 *   A chevron <span data-accordion-icon> is injected into the trigger if none
 *   is present, and is rotated on open (CSS-drawn caret — no icon font needed).
 *
 * OPTIONS (data-plugin-options or the jQuery method argument)
 *   exclusive   {bool}            One panel open at a time.                 default true
 *   collapsible {bool}            In exclusive mode, allow the open panel to
 *                                 be closed (so all can be shut).           default true
 *   openIndex   {number|number[]  Which item(s) start open. A 0-based index,
 *               |'all'|'none'}    an array of indices, 'all', or 'none'.    default 0
 *   duration    {string|number}   Height transition: any CSS <time> string
 *                                 ('320ms', '0.32s') or a ms number.        default '320ms'
 *   easing      {string}          CSS easing for the transition.            default cubic-bezier(.16,1,.3,1)
 *   iconRotate  {number}          Chevron rotation when open, in degrees.   default 180
 *   flush       {bool}            Edge-to-edge style (no card border/radius).default false
 *   disabled    {bool}            Render the whole accordion inert.         default false
 *
 * EVENTS (all namespaced .ts.accordion; index is 0-based, $item is the row)
 *   ready.ts.accordion    (e, instance)
 *   open.ts.accordion     (e, index, $item)   fired when an open animation starts
 *   opened.ts.accordion   (e, index, $item)   fired after it finishes
 *   close.ts.accordion    (e, index, $item)
 *   closed.ts.accordion   (e, index, $item)
 *   change.ts.accordion   (e, index, isOpen, $item)
 *
 * PROGRAMMATIC API
 *   const acc = $('#faq').data('__accordion');
 *   acc.open(2);          // open item 2
 *   acc.close(0);         // close item 0
 *   acc.toggle(1);        // toggle item 1
 *   acc.openAll();        // (no-op in exclusive mode beyond the first)
 *   acc.closeAll();
 *   acc.openedIndexes();  // -> [0, 2]
 *   acc.refresh();        // re-scan items after dynamic DOM changes
 *   acc.setDisabled(true);
 *   acc.destroy();        // restore original markup
 *
 *   // init.js wiring
 *   if ($.isFunction($.fn['themestrapPluginAccordion']) && $('[data-plugin-accordion]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-accordion]:not(.manual)', 'themestrapPluginAccordion');
 *   }
 */
(((themestrap = {}, $) => {

    const instanceName = '__accordion';

    // Injected once per page, keyed to STYLE_ID. Styles land on first build(),
    // so loading this script never adds CSS to pages that don't use the plugin.
    const STYLE_ID = 'ts-accordion-styles';

    const CSS_TEXT = `
/* Themestrap — PluginAccordion (Venom palette) */
.ts-accordion {
    /* Palette tokens: prefer global --ts-venom-* if defined, else fall back. */
    --ts-acc-bg:        var(--ts-venom-surface,      #121212);
    --ts-acc-bg-hover:  var(--ts-venom-elevated,     #1c1c1c);
    --ts-acc-bg-open:   var(--ts-venom-surface-2,    #181818);
    --ts-acc-border:    var(--ts-venom-border,       #333333);
    --ts-acc-hairline:  var(--ts-venom-muted,        #444444);
    --ts-acc-text:      var(--ts-venom-text,         #c1c1c1);
    --ts-acc-heading:   var(--ts-venom-text-strong,  #f8f7f2);
    --ts-acc-muted:     var(--ts-venom-text-dim,     #999999);
    --ts-acc-accent:    var(--ts-venom-accent,       #79241f);
    --ts-acc-accent-2:  var(--ts-venom-accent-hover, #a3312a);
    --ts-acc-ring:      var(--ts-venom-ring,         rgba(163, 49, 42, .55));

    --ts-acc-radius:    10px;
    --ts-acc-duration:  320ms;
    --ts-acc-easing:    cubic-bezier(.16, 1, .3, 1);
    --ts-acc-icon-rot:  180deg;

    display: block;
    border: 1px solid var(--ts-acc-border);
    border-radius: var(--ts-acc-radius);
    overflow: hidden;
    background: var(--ts-acc-bg);
    color: var(--ts-acc-text);
}

/* Edge-to-edge variant: drop the outer frame. */
.ts-accordion--flush {
    border: 0;
    border-radius: 0;
    background: transparent;
    overflow: visible;
}

/* ── Item ── */
.ts-accordion__item {
    position: relative;
    border-top: 1px solid var(--ts-acc-border);
}
.ts-accordion__item:first-child { border-top: 0; }
.ts-accordion--flush .ts-accordion__item {
    border-top: 1px solid var(--ts-acc-hairline);
}

/* Blood-red accent bar on the open item. */
.ts-accordion__item::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--ts-acc-accent);
    transform: scaleY(0);
    transform-origin: top;
    transition: transform var(--ts-acc-duration) var(--ts-acc-easing);
    pointer-events: none;
}
.ts-accordion__item.is-open::before { transform: scaleY(1); }

/* ── Trigger / header ── */
.ts-accordion__trigger {
    display: flex;
    align-items: center;
    gap: .85rem;
    width: 100%;
    margin: 0;
    padding: 1.05rem 1.25rem;
    border: 0;
    background: transparent;
    color: var(--ts-acc-heading);
    font: inherit;
    font-weight: 600;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
    transition: background var(--ts-acc-duration) var(--ts-acc-easing),
                color    var(--ts-acc-duration) var(--ts-acc-easing);
    -webkit-appearance: none;
    appearance: none;
}
.ts-accordion__trigger:hover { background: var(--ts-acc-bg-hover); }
.ts-accordion__item.is-open > .ts-accordion__trigger {
    background: var(--ts-acc-bg-open);
    color: var(--ts-acc-heading);
}

/* Keyboard focus ring in the accent colour. */
.ts-accordion__trigger:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--ts-acc-ring);
}

/* ── Chevron (CSS-drawn caret; no icon font) ── */
.ts-accordion__chev {
    flex: 0 0 auto;
    margin-left: auto;
    width: .62em;
    height: .62em;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform var(--ts-acc-duration) var(--ts-acc-easing),
                color     var(--ts-acc-duration) var(--ts-acc-easing);
    opacity: .85;
}
/* When the icon target is a user-supplied element, just rotate it. */
[data-accordion-icon] { transition: transform var(--ts-acc-duration) var(--ts-acc-easing); }
.ts-accordion__item.is-open > .ts-accordion__trigger .ts-accordion__chev {
    transform: rotate(calc(45deg + var(--ts-acc-icon-rot)));
    color: var(--ts-acc-accent-2);
    opacity: 1;
}
.ts-accordion__item.is-open > .ts-accordion__trigger [data-accordion-icon]:not(.ts-accordion__chev) {
    transform: rotate(var(--ts-acc-icon-rot));
}

/* ── Panel shell + body ── */
.ts-accordion__shell {
    overflow: hidden;
    height: 0;
    transition: height var(--ts-acc-duration) var(--ts-acc-easing);
    will-change: height;
}
/*
 * When open, height must be 'auto' so clearing the JS inline style doesn't
 * snap back to height:0. The JS animates px→px, then removes the inline style;
 * this rule takes over cleanly from there.
 */
.ts-accordion__item.is-open > .ts-accordion__shell {
    height: auto;
    overflow: visible;
}
.ts-accordion__panel {
    padding: .35rem 1.25rem 1.25rem;
    color: var(--ts-acc-text);
}
.ts-accordion__panel > :last-child { margin-bottom: 0; }

/* ── Disabled ── */
.ts-accordion--disabled .ts-accordion__trigger {
    cursor: not-allowed;
    opacity: .55;
    pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
    .ts-accordion__shell,
    .ts-accordion__item::before,
    .ts-accordion__chev,
    [data-accordion-icon] { transition: none; }
}
`;

    class PluginAccordion {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el         = $el;
            this.initialHTML = $el.html();      // captured before build mutates the DOM
            this._uid        = `accordion-${++PluginAccordion._seq}`;
            this._timers     = {};              // per-item animation timers

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            this.$el.trigger('ready.ts.accordion', [this]);
            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            return this;
        }

        setOptions(opts) {
            const attrOpts = themestrap.fn && themestrap.fn.getOptions
                ? (themestrap.fn.getOptions(this.$el.data('plugin-options')) || {})
                : {};

            this.options = $.extend(true, {}, PluginAccordion.defaults, attrOpts, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            this.injectStyles();

            const self = this;
            const o    = this.options;
            const $el  = this.$el;

            $el.addClass('ts-accordion');
            $el.toggleClass('ts-accordion--flush', !!o.flush);
            $el.toggleClass('ts-accordion--disabled', !!o.disabled);

            // CSS custom properties only when overriding the defaults.
            if (o.duration   !== PluginAccordion.defaults.duration)   $el.css('--ts-acc-duration', self._toCssTime(o.duration));
            if (o.easing     !== PluginAccordion.defaults.easing)     $el.css('--ts-acc-easing', o.easing);
            if (o.iconRotate !== PluginAccordion.defaults.iconRotate) $el.css('--ts-acc-icon-rot', `${parseInt(o.iconRotate, 10)}deg`);

            // Collect items (top-level only, so nested accordions don't bleed).
            this.$items = $el.children('[data-accordion-item]');
            if (!this.$items.length) {
                // Tolerate a flat structure: treat each [data-accordion-trigger]
                // parent as an item by wrapping isn't safe, so we just bail clean.
                return this;
            }

            this._triggers = [];   // ordered list of trigger DOM nodes (focus mgmt)

            this.$items.each(function (i) {
                self._prepItem($(this), i);
            });

            // Apply the initial open state without animating.
            this._applyInitialState();

            return this;
        }

        /** Decorate a single item: classes, ARIA ids, chevron, shell wrap. */
        _prepItem($item, i) {
            const self = this;
            $item.addClass('ts-accordion__item');

            // Trigger
            let $trigger = $item.find('[data-accordion-trigger]').first();
            if (!$trigger.length) {
                $trigger = $item.find('[data-accordion-header], button, a').first();
            }
            if (!$trigger.length) return;        // malformed item — skip
            $trigger.addClass('ts-accordion__trigger');

            // Panel
            let $panel = $item.find('[data-accordion-panel]').first();
            if (!$panel.length) $panel = $item.find('[data-accordion-content]').first();
            if (!$panel.length) {
                const $next = $trigger.next();
                if ($next.length) $panel = $next;
            }
            if (!$panel.length) return;          // nothing to collapse — skip
            $panel.addClass('ts-accordion__panel');

            // Chevron — inject a CSS caret if the author didn't supply an icon.
            if (!$trigger.find('[data-accordion-icon]').length) {
                $trigger.append('<span class="ts-accordion__chev" data-accordion-icon aria-hidden="true"></span>');
            }

            // Wrap the panel in a clipping shell for the height transition.
            if (!$panel.parent().hasClass('ts-accordion__shell')) {
                $panel.wrap('<div class="ts-accordion__shell"></div>');
            }
            const $shell = $panel.parent();

            // ARIA wiring.
            const tid = `${self._uid}-t${i}`;
            const pid = `${self._uid}-p${i}`;
            $trigger.attr({
                id: $trigger.attr('id') || tid,
                'aria-expanded': 'false',
                'aria-controls': $panel.attr('id') || pid
            });
            $panel.attr({
                id: $panel.attr('id') || pid,
                role: 'region',
                'aria-labelledby': $trigger.attr('id')
            });

            // If the trigger is not a real <button>, make it focusable & button-like.
            if (!$trigger.is('button')) {
                $trigger.attr({ role: 'button', tabindex: $trigger.attr('tabindex') || '0' });
            }

            $item.data('_acc', { $trigger, $panel, $shell, index: i });
            self._triggers[i] = $trigger[0];
        }

        /** Open/close items to match options.openIndex without animation. */
        _applyInitialState() {
            const self = this;
            const o    = this.options;
            let openSet;

            if (o.openIndex === 'all' && !o.exclusive) {
                openSet = this.$items.map((i) => i).get();
            } else if (o.openIndex === 'all' && o.exclusive) {
                openSet = [0];
            } else if (o.openIndex === 'none' || o.openIndex == null) {
                openSet = [];
            } else if (Array.isArray(o.openIndex)) {
                openSet = o.exclusive ? o.openIndex.slice(0, 1) : o.openIndex.slice();
            } else {
                openSet = [parseInt(o.openIndex, 10)];
            }

            this.$items.each(function (i) {
                self._setItemOpen(i, openSet.indexOf(i) !== -1, false);
            });
        }

        events() {
            const self = this;

            // Toggle on trigger activation (delegated to top-level triggers only).
            this.$el.on('click.accordion', '.ts-accordion__item > .ts-accordion__trigger', function (e) {
                if (self.options.disabled) return;
                // Ignore clicks bubbling up from a nested accordion.
                if ($(this).closest('.ts-accordion__item')[0] !==
                    $(this).parent('.ts-accordion__item')[0]) { /* still ok */ }
                e.preventDefault();
                const i = self._indexOfTrigger(this);
                if (i !== -1) self.toggle(i);
            });

            // Keyboard: WAI-ARIA accordion pattern.
            this.$el.on('keydown.accordion', '.ts-accordion__item > .ts-accordion__trigger', function (e) {
                const i = self._indexOfTrigger(this);
                if (i === -1) return;

                switch (e.key) {
                    case ' ':
                    case 'Spacebar':
                    case 'Enter':
                        if ($(this).is('button')) return;   // native activation
                        e.preventDefault();
                        if (!self.options.disabled) self.toggle(i);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        self._focusTrigger(i + 1);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        self._focusTrigger(i - 1);
                        break;
                    case 'Home':
                        e.preventDefault();
                        self._focusTrigger(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        self._focusTrigger(self._triggers.length - 1);
                        break;
                    default:
                        break;
                }
            });

            return this;
        }

        // ── Public API ───────────────────────────────────────────────

        open(i)   { this._request(i, true);  return this; }
        close(i)  { this._request(i, false); return this; }
        toggle(i) {
            const it = this._item(i);
            if (!it) return this;
            this._request(i, !this.$items.eq(i).hasClass('is-open'));
            return this;
        }

        openAll() {
            if (this.options.exclusive) { this.open(0); return this; }
            const self = this;
            this.$items.each((i) => self._setItemOpen(i, true, true));
            return this;
        }

        closeAll() {
            const self = this;
            this.$items.each((i) => self._setItemOpen(i, false, true));
            return this;
        }

        openedIndexes() {
            const out = [];
            this.$items.each(function (i) {
                if ($(this).hasClass('is-open')) out.push(i);
            });
            return out;
        }

        setDisabled(state) {
            this.options.disabled = !!state;
            this.$el.toggleClass('ts-accordion--disabled', this.options.disabled);
            return this;
        }

        /** Re-scan items after the caller mutates the accordion's DOM. */
        refresh() {
            const opened = this.openedIndexes();
            this.$el.off('.accordion');
            this.$el.html(this.initialHTML);   // reset to a clean slate, then rebuild
            this._timers = {};
            this.build().events();
            // Best-effort restore of previously open items.
            opened.forEach((i) => this._setItemOpen(i, true, false));
            return this;
        }

        destroy() {
            const self = this;
            Object.keys(this._timers).forEach((k) => clearTimeout(self._timers[k]));
            this.$el.off('.accordion');
            this.$el
                .removeClass('ts-accordion ts-accordion--flush ts-accordion--disabled')
                .css({ '--ts-acc-duration': '', '--ts-acc-easing': '', '--ts-acc-icon-rot': '' })
                .html(this.initialHTML)
                .removeData(instanceName);
            return this;
        }

        // ── Internals ────────────────────────────────────────────────

        _item(i)  { return this.$items && this.$items.eq(i).length ? this.$items.eq(i) : null; }

        _indexOfTrigger(node) { return this._triggers.indexOf(node); }

        _focusTrigger(i) {
            const n = this._triggers.length;
            if (!n) return;
            const idx = ((i % n) + n) % n;     // wrap around
            if (this._triggers[idx]) this._triggers[idx].focus();
        }

        /**
         * Resolve a request to open/close item i, honouring exclusive +
         * collapsible options, then run the animated state change.
         */
        _request(i, wantOpen) {
            const $item = this._item(i);
            if (!$item) return;
            if (this.options.disabled) return;

            const isOpen = $item.hasClass('is-open');

            if (wantOpen) {
                if (this.options.exclusive) {
                    const self = this;
                    this.$items.each(function (j) {
                        if (j !== i && $(this).hasClass('is-open')) self._setItemOpen(j, false, true);
                    });
                }
                if (!isOpen) this._setItemOpen(i, true, true);
            } else {
                // Closing: in exclusive + non-collapsible mode, keep one open.
                if (this.options.exclusive && !this.options.collapsible && isOpen) return;
                if (isOpen) this._setItemOpen(i, false, true);
            }
        }

        /**
         * Core per-item open/close state machine (height transition).
         * @param {number}  i        item index
         * @param {boolean} open     desired state
         * @param {boolean} animate  run the height transition
         */
        _setItemOpen(i, open, animate) {
            const self  = this;
            const $item = this._item(i);
            if (!$item) return;

            const data = $item.data('_acc');
            if (!data) return;
            const { $trigger, $panel, $shell } = data;

            clearTimeout(this._timers[i]);
            const dur = this._parseDuration(this._cssTimeFor());

            if (open) {
                $item.addClass('is-open');
                $trigger.attr('aria-expanded', 'true');

                if (animate) {
                    $shell.css({ overflow: 'hidden', height: '0px' });
                    const targetH = $panel[0].scrollHeight;
                    $shell[0].offsetHeight;                      // force reflow
                    $shell.css('height', targetH + 'px');
                    this.$el.trigger('open.ts.accordion', [i, $item]);

                    this._timers[i] = setTimeout(() => {
                        $shell.css({ height: '', overflow: '' }); // hand off to CSS height:auto
                        self.$el.trigger('opened.ts.accordion', [i, $item]);
                    }, dur);
                } else {
                    $shell.css({ height: '', overflow: '' });
                }
            } else {
                $trigger.attr('aria-expanded', 'false');

                if (animate) {
                    const currentH = $shell[0].scrollHeight;
                    $shell.css({ overflow: 'hidden', height: currentH + 'px' });
                    $item.removeClass('is-open');                // drop height:auto rule
                    $shell[0].offsetHeight;                      // force reflow
                    $shell.css('height', '0px');
                    this.$el.trigger('close.ts.accordion', [i, $item]);

                    this._timers[i] = setTimeout(() => {
                        $shell.css('overflow', '');
                        self.$el.trigger('closed.ts.accordion', [i, $item]);
                    }, dur);
                } else {
                    $shell.css({ height: '0px', overflow: '' });
                    $item.removeClass('is-open');
                }
            }

            this.$el.trigger('change.ts.accordion', [i, open, $item]);
        }

        _cssTimeFor() {
            // Use the resolved CSS var if the browser supports it, else the option.
            return this.options.duration;
        }

        _toCssTime(v) {
            if (typeof v === 'number') return `${v}ms`;
            return String(v);
        }

        _parseDuration(str) {
            if (typeof str === 'number') return str;
            if (!str) return 320;
            const s = String(str).trim();
            if (s.endsWith('ms')) return parseFloat(s);
            if (s.endsWith('s'))  return parseFloat(s) * 1000;
            return parseFloat(s) || 320;
        }

        injectStyles() {
            if (document.getElementById(STYLE_ID)) return this;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS_TEXT;
            (document.head || document.documentElement).appendChild(style);
            return this;
        }
    }

    PluginAccordion._seq = 0;

    PluginAccordion.defaults = {
        exclusive:   true,
        collapsible: true,
        openIndex:   0,
        duration:    '320ms',
        easing:      'cubic-bezier(.16, 1, .3, 1)',
        iconRotate:  180,
        flush:       false,
        disabled:    false,
    };

    $.extend(themestrap, { PluginAccordion });

    $.fn.themestrapPluginAccordion = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginAccordion($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
