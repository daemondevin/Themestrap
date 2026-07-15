/**
 * Themestrap Code Rail Plugin
 *
 * The signature two-column API-reference layout: prose sections on the left,
 * a sticky code column on the right whose visible panel stays in sync with the
 * section you are currently reading. Scroll the prose and the matching code
 * example cross-fades into the sticky frame.
 *
 * On narrow viewports the two columns can't co-exist, so each code panel is
 * relocated inline directly beneath the prose section it documents and the
 * scroll-sync is disabled. Resize back up and the sticky rail is restored.
 *
 * This plugin owns ONLY the layout + the scroll-sync. The code panels inside
 * it are ordinary [data-plugin-code-window] / [data-plugin-highlight] blocks
 * and are decorated by their own plugins as usual.
 *
 * Part of the Themestrap component library for MODX 3.
 *
 * MARKUP
 *   <div data-plugin-code-rail data-plugin-options='{"top": 96}'>
 *
 *     <div data-code-rail-main>
 *       <section data-code-rail-section="create" id="create"> …prose… </section>
 *       <section data-code-rail-section="list"   id="list">   …prose… </section>
 *     </div>
 *
 *     <div data-code-rail-aside>
 *       <div data-code-rail-panel="create"> …code window… </div>
 *       <div data-code-rail-panel="list">   …code window… </div>
 *     </div>
 *
 *   </div>
 *
 * Each [data-code-rail-section] is paired with the [data-code-rail-panel]
 * whose value matches its data-code-rail-section value. Sections with no
 * matching panel simply keep the previous panel on screen.
 *
 * OPTIONS (data-plugin-options)
 *   top        {number}  Sticky offset from the top, in px.            default 96
 *   breakpoint {number}  Min viewport px for the two-column rail.      default 1024
 *   rootMargin {string}  Override the IntersectionObserver band.       default '' (auto)
 *   fade       {bool}    Cross-fade panels on change.                  default true
 *
 * EVENTS
 *   coderail:ready   (e, instance)            fired once after build
 *   coderail:change  (e, instance, id, $pane) fired on every synced switch
 *
 * PROGRAMMATIC API
 *   const cr = $('#api').data('__codeRail');
 *   cr.activate('list');   // force a panel
 *   cr.refresh();          // re-evaluate layout mode
 *   cr.destroy();          // restore original markup
 *
 *   // Code Rail (init.js wiring)
 *   if ($.isFunction($.fn['themestrapPluginCodeRail']) && $('[data-plugin-code-rail]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-code-rail]:not(.manual)', 'themestrapPluginCodeRail');
 *   }
 */
(((themestrap = {}, $) => {
    const instanceName = '__codeRail';

    // Injected once per page, keyed to STYLE_ID — loading the script never adds
    // CSS to pages that don't use the plugin (styles land on first build()).
    const STYLE_ID = 'ts-code-rail-styles';

    const CSS_TEXT = `
/* Themestrap — PluginCodeRail */
.ts-code-rail {
    --ts-cr-top:     96px;
    --ts-cr-gap:     3rem;
    --ts-cr-aside-w: 27rem;
    display: block;
    position: relative;
}

.ts-code-rail__main  { min-width: 0; }
.ts-code-rail__aside { min-width: 0; }

/* Each prose section reserves enough height for a clean scroll-sync. */
.ts-code-rail [data-code-rail-section] {
    scroll-margin-top: calc(var(--ts-cr-top) + 16px);
}
.ts-code-rail [data-code-rail-section] + [data-code-rail-section] {
    margin-top: 4.5rem;
}

/* ─── Two-column rail (desktop) ─── */
@media (min-width: 64rem) {
    .ts-code-rail--rail {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, var(--ts-cr-aside-w));
        gap: var(--ts-cr-gap);
        align-items: start;
    }
    .ts-code-rail--rail .ts-code-rail__aside {
        position: sticky;
        top: var(--ts-cr-top);
        align-self: start;
    }
    /* Panels stack in the same sticky frame; only the active one shows. */
    .ts-code-rail--rail .ts-code-rail__panel { display: none; }
    .ts-code-rail--rail .ts-code-rail__panel.is-active { display: block; }
    .ts-code-rail--rail .ts-code-rail__panel.is-active.ts-cr-fade {
        animation: ts-cr-fade-in 240ms cubic-bezier(.16, 1, .3, 1) both;
    }
}

/* ─── Stacked (mobile / narrow) ─── */
.ts-code-rail--stacked .ts-code-rail__panel {
    display: block;
    margin: 1.25rem 0 0;
}
.ts-code-rail--stacked [data-code-rail-section] {
    margin-bottom: 0;
}

@keyframes ts-cr-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    .ts-code-rail--rail .ts-code-rail__panel.is-active.ts-cr-fade { animation: none; }
}
`;

    class PluginCodeRail {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el          = $el;
            this.initialHTML  = $el.html();   // capture before build mutates the DOM
            this._uid         = `coderail-${++PluginCodeRail._seq}`;
            this._observer    = null;
            this._mode        = null;         // 'rail' | 'stacked'
            this.activeId     = null;

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

            this.options = $.extend(true, {}, PluginCodeRail.defaults, pluginOpts, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            const self = this;
            this.injectStyles();

            this.$el.addClass('ts-code-rail');
            if (this.options.top != null) {
                this.$el.css('--ts-cr-top', `${parseInt(this.options.top, 10)}px`);
            }

            this.$main  = this.$el.find('[data-code-rail-main]').first().addClass('ts-code-rail__main');
            this.$aside = this.$el.find('[data-code-rail-aside]').first().addClass('ts-code-rail__aside');

            // Nothing to pair → leave the element as a plain block.
            if (!this.$main.length || !this.$aside.length) {
                this.$el.trigger('coderail:ready', [this]);
                return this;
            }

            this.$sections = this.$main.find('[data-code-rail-section]');
            this.$aside.find('[data-code-rail-panel]').addClass('ts-code-rail__panel');

            // Map each section id → its matching panel (kept in the aside).
            this._panels = {};
            const self2 = this;
            this.$aside.find('[data-code-rail-panel]').each(function () {
                const id = $(this).attr('data-code-rail-panel');
                self2._panels[id] = $(this);
            });

            // First section drives the initial active panel.
            this._sectionIds = this.$sections.map(function () {
                return $(this).attr('data-code-rail-section');
            }).get();

            this.activeId = this._sectionIds.length ? this._sectionIds[0] : null;

            // Decide layout from the current viewport and apply it.
            this._applyMode();

            this.$el.trigger('coderail:ready', [this]);
            return this;
        }

        /** Choose 'rail' (sticky two-column) or 'stacked' (inline) and apply. */
        _applyMode() {
            const wantRail = window.innerWidth >= this.options.breakpoint;
            const mode = wantRail ? 'rail' : 'stacked';
            if (mode === this._mode) return this;

            this._mode = mode;
            this.$el.removeClass('ts-code-rail--rail ts-code-rail--stacked');

            if (mode === 'rail') {
                this._teardownStacked();
                this.$el.addClass('ts-code-rail--rail');
                this._showOnly(this.activeId, false);
                this._connectObserver();
            } else {
                this._disconnectObserver();
                this.$el.addClass('ts-code-rail--stacked');
                this._stackInline();
            }

            return this;
        }

        /** Move each panel inline, directly after the section it documents. */
        _stackInline() {
            const self = this;
            this.$sections.each(function () {
                const $sec = $(this);
                const id   = $sec.attr('data-code-rail-section');
                const $panel = self._panels[id];
                if ($panel && $panel.length) {
                    $panel.removeClass('is-active').css('display', '').insertAfter($sec);
                }
            });
        }

        /** Return every panel to the aside in its original order. */
        _teardownStacked() {
            const self = this;
            this._sectionIds.forEach(id => {
                const $panel = self._panels[id];
                if ($panel && $panel.length) self.$aside.append($panel);
            });
        }

        _connectObserver() {
            const self = this;
            this._disconnectObserver();

            if (typeof IntersectionObserver === 'undefined' || !this.$sections.length) return;

            const top = parseInt(this.options.top, 10) || 0;
            const rootMargin = this.options.rootMargin ||
                `-${top}px 0px -62% 0px`;

            this._observer = new IntersectionObserver(entries => {
                // Pick the entry nearest the top band that is intersecting.
                let best = null;
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
                        best = entry;
                    }
                }
                if (best) {
                    const id = best.target.getAttribute('data-code-rail-section');
                    self.activate(id);
                }
            }, { rootMargin, threshold: 0 });

            this.$sections.each(function () { self._observer.observe(this); });
        }

        _disconnectObserver() {
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
        }

        _showOnly(id, fade) {
            const self = this;
            Object.keys(this._panels).forEach(key => {
                const $p = self._panels[key];
                const on = key === id;
                $p.toggleClass('is-active', on);
                if (on && fade !== false && self.options.fade) {
                    // restart the fade animation
                    $p.removeClass('ts-cr-fade');
                    // force reflow so re-adding the class re-triggers the keyframes
                    void $p[0].offsetWidth;
                    $p.addClass('ts-cr-fade');
                }
            });
        }

        /** Activate the panel paired with `id`. Public + used by the observer. */
        activate(id) {
            if (id == null || id === this.activeId) return this;
            if (!this._panels[id]) return this;   // no paired panel → keep current

            this.activeId = id;

            if (this._mode === 'rail') {
                this._showOnly(id, true);
            }

            this.$el.trigger('coderail:change', [this, id, this._panels[id]]);
            return this;
        }

        /** Re-evaluate the layout mode (call after dynamic content changes). */
        refresh() {
            this._mode = null;
            this._applyMode();
            return this;
        }

        events() {
            const self = this;
            $(window).on(`resize.coderail.${this._uid}`, () => {
                self._applyMode();
            });
            return this;
        }

        injectStyles() {
            if (document.getElementById(STYLE_ID)) return this;
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS_TEXT;
            (document.head || document.documentElement).appendChild(style);
            return this;
        }

        destroy() {
            $(window).off(`resize.coderail.${this._uid}`);
            this._disconnectObserver();
            this.$el
                .removeClass('ts-code-rail ts-code-rail--rail ts-code-rail--stacked')
                .css('--ts-cr-top', '')
                .html(this.initialHTML)
                .removeData(instanceName);
            return this;
        }
    }

    PluginCodeRail._seq = 0;

    PluginCodeRail.defaults = {
        top:        96,
        breakpoint: 1024,
        rootMargin: '',
        fade:       true,
    };

    $.extend(themestrap, { PluginCodeRail });

    $.fn.themestrapPluginCodeRail = function (opts) {
        return this.map(function () {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }
            return new PluginCodeRail($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
