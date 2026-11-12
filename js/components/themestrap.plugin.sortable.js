/**
 * Themestrap Sortable
 *
 * Drag and drop reordering for lists, rows and grids, with mouse, touch and keyboard support. Items can
 * also move between lists that share a group name, which is how a widget moves from one area to another.
 *
 * Markup:
 *
 *   <ul data-plugin-sortable data-plugin-options='{"handle": ".grip", "group": "widgets"}'>
 *     <li data-id="a"><button class="grip" type="button">Move</button> First</li>
 *     <li data-id="b"><button class="grip" type="button">Move</button> Second</li>
 *   </ul>
 *
 * Without a handle option the whole item is the handle. On a touch screen the item is then picked up
 * by pressing and holding it, so a quick swipe still scrolls the page. The arrow keys move the item
 * whose handle (or the item itself, without a handle) has focus. Escape puts a dragged item back.
 *
 * The layout is detected on every move: a column of items, a single row, or a wrapping grid.
 * Set the axis option ('y', 'x' or 'grid') to skip the detection.
 *
 * Public API (via stored instance or by name):
 *   const s = $('#list').data('__pluginSortable');
 *   s.toArray();     // the data-id of each item, in order
 *   s.refresh();     // mark items added after init
 *   s.enable(); s.disable(); s.destroy();
 *   $('#list').themestrapPluginSortable('disable');
 *
 * Events (native CustomEvent, bubbling, dispatched on the list):
 *   ts.sortable.start    detail: { instance, item }
 *   ts.sortable.sort     detail: { instance, item, order, from, to }   fired when an item is dropped in a new place
 *   ts.sortable.end      detail: { instance, item }
 *
 * CSS custom properties (all optional, they follow the skin's accent):
 *   --ts-sort-ghost   background of the item while it is dragged
 *   --ts-sort-line    color of the outlines
 *
 * Init.js wiring:
 *   if (typeof $.fn['themestrapPluginSortable'] === 'function' && $('[data-plugin-sortable]').length) {
 *       themestrap.fn.intObsInit('[data-plugin-sortable]:not(.manual)', 'themestrapPluginSortable');
 *   }
 */
// Sortable
(((themestrap = {}, $) => {
    const instanceName = '__pluginSortable';
    const STYLE_ID     = 'ts-sortable-styles';
    const EVENT        = 'ts.sortable';
    const HOLD_MS      = 300;       // touch press needed to pick up a whole item
    const HOLD_SLOP    = 8;         // pixels a finger may move during that press

    let instanceCount = 0;
    let seq           = 0;

    const CSS = `
        .ts-sort-item { position: relative; }
        .ts-sort-item.is-dragging { opacity: .55; background: var(--ts-sort-ghost, var(--ts-skin-accent-soft, rgba(0,168,159,.08))); outline: 2px dashed var(--ts-sort-line, var(--ts-skin-accent, #00a89f)); outline-offset: -2px; }
        .ts-sort-dragging, .ts-sort-dragging * { cursor: grabbing !important; user-select: none; -webkit-user-select: none; }
        .ts-sort-dragging .ts-sort-item.is-dragging { pointer-events: none; }
        .ts-sort-handle { cursor: grab; touch-action: none; }
        .ts-sort-whole > .ts-sort-handle { touch-action: manipulation; }
        @media (pointer: coarse) {
            .ts-sort-whole > .ts-sort-item { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
        }
        .ts-sort-list.is-over { outline: 2px dashed var(--ts-sort-line, var(--ts-skin-accent, #00a89f)); outline-offset: 2px; border-radius: 6px; }
        .ts-sort-disabled .ts-sort-handle { cursor: default; opacity: .5; }
        @media (prefers-reduced-motion: reduce) { .ts-sort-item { transition: none; } }
    `;

    const groups = {};

    const rect = (el) => el.getBoundingClientRect();

    class PluginSortable {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el       = $el;
            this._uid      = ++seq;
            this._ns       = `.tssort${this._uid}`;
            this._drag     = null;
            this._hold     = null;
            this._disabled = false;

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
            this.options = $.extend(true, {}, PluginSortable.defaults, opts, { wrapper: this.$el });
            return this;
        }

        build() {
            const self = this;
            if (!document.getElementById(STYLE_ID)) {
                const st = document.createElement('style');
                st.id = STYLE_ID;
                st.textContent = CSS;
                document.head.appendChild(st);
            }
            instanceCount++;
            self.$el.addClass('ts-sort-list').toggleClass('ts-sort-whole', !self.options.handle);
            if (self.options.group) (groups[self.options.group] = groups[self.options.group] || []).push(self);
            self._mark();
            return self;
        }

        _items() {
            return this.$el.children(this.options.items).toArray();
        }

        _mark() {
            const self = this;
            self._items().forEach((li) => {
                $(li).addClass('ts-sort-item');
                const $h = self.options.handle ? $(li).find(self.options.handle).first() : $(li);
                $h.addClass('ts-sort-handle');
                if (self.options.handle && $h.length && !$h.attr('aria-label') && !$h.attr('title')) $h.attr('aria-label', self.options.labels.move);
            });
        }

        _handleOf(target) {
            const self = this;
            const li = $(target).closest('.ts-sort-item', self.$el[0])[0];
            if (!li || li.parentNode !== self.$el[0]) return null;
            if (self.options.handle) {
                const h = $(target).closest(self.options.handle, li)[0];
                return h ? li : null;
            }
            if ($(target).closest('input,textarea,select,button,a,label,[contenteditable]', li).length) return null;
            return li;
        }

        /**
         * How the items are laid out: 'y' (one column), 'x' (one row) or 'grid' (rows that wrap).
         * Read from the item positions, or from the list's CSS when it has fewer than two items.
         */
        _axis() {
            if (this.options.axis && this.options.axis !== 'auto') return this.options.axis;
            const items = this._items();
            if (items.length >= 2) {
                const a = rect(items[0]), b = rect(items[1]);
                if (Math.abs(a.top - b.top) >= Math.min(a.height, b.height) / 2) return 'y';
                const last = rect(items[items.length - 1]);
                return Math.abs(last.top - a.top) < a.height / 2 ? 'x' : 'grid';
            }
            const cs = getComputedStyle(this.$el[0]);
            if (/flex/.test(cs.display) && !/column/.test(cs.flexDirection)) return cs.flexWrap === 'wrap' ? 'grid' : 'x';
            if (/grid/.test(cs.display) && cs.gridTemplateColumns.split(' ').length > 1) return 'grid';
            return 'y';
        }

        _rtl() {
            return getComputedStyle(this.$el[0]).direction === 'rtl';
        }

        events() {
            const self = this;
            self.$el.on('pointerdown' + self._ns, (e) => {
                if (self._disabled || self._drag || (e.button != null && e.button !== 0)) return;
                const li = self._handleOf(e.target);
                if (!li) return;
                if (e.pointerType === 'touch' && !self.options.handle) {
                    self._press(li, e);
                } else {
                    e.preventDefault();
                    self._begin(li, e.clientX, e.clientY, false);
                }
            });
            self.$el.on('keydown' + self._ns, (e) => {
                if (self._disabled || self._drag) return;
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) < 0) return;
                const li = self._handleOf(e.target);
                if (!li) return;
                // without a handle, only the focused item itself moves, not a control inside it
                if (!self.options.handle && e.target !== li) return;
                self._step(li, e);
            });
            return self;
        }

        /** Move an item with the arrow keys: one place, or one row in a grid. */
        _step(li, e) {
            const self = this;
            const items = self._items();
            const index = items.indexOf(li);
            const axis = self._axis();
            const rtl = self._rtl();
            let delta = 0;

            if (axis === 'y') {
                if (e.key === 'ArrowUp') delta = -1;
                if (e.key === 'ArrowDown') delta = 1;
            } else {
                if (e.key === 'ArrowLeft') delta = rtl ? 1 : -1;
                if (e.key === 'ArrowRight') delta = rtl ? -1 : 1;
                if (axis === 'grid' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                    const top = rect(items[0]).top;
                    const cols = Math.max(1, items.filter((it) => Math.abs(rect(it).top - top) < 2).length);
                    delta = e.key === 'ArrowUp' ? -cols : cols;
                }
            }
            if (!delta) return;
            e.preventDefault();

            const to = Math.max(0, Math.min(items.length - 1, index + delta));
            if (to === index) return;

            const before = self.toArray();
            const others = items.filter((it) => it !== li);
            const parent = self.$el[0];
            if (to >= others.length) {
                parent.insertBefore(li, others[others.length - 1].nextSibling);
            } else {
                parent.insertBefore(li, others[to]);
            }

            const h = self.options.handle ? $(li).find(self.options.handle)[0] : li;
            if (h && h.focus) h.focus();
            self._emit('sort', { item: li, order: self.toArray(), from: self, to: self, before });
        }

        _emit(name, detail) {
            const ev = new CustomEvent(`${EVENT}.${name}`, { bubbles: true, detail: Object.assign({ instance: this }, detail) });
            this.$el[0].dispatchEvent(ev);
            const cb = this.options['on' + name.charAt(0).toUpperCase() + name.slice(1)];
            if (typeof cb === 'function') cb.call(this, ev.detail);
        }

        _targets() {
            const g = this.options.group;
            return g && groups[g] ? groups[g] : [this];
        }

        /** A touch on a whole item: pick it up after a short hold, or let the page scroll. */
        _press(li, e) {
            const self = this;
            const x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
            const ns = self._ns + 'h';

            const cancel = () => {
                clearTimeout(self._hold);
                self._hold = null;
                $(document).off(ns);
            };

            self._hold = setTimeout(() => {
                cancel();
                self._begin(li, x0, y0, true);
            }, HOLD_MS);

            $(document)
                .on('pointermove' + ns, (ev) => {
                    if (ev.pointerId === id && Math.hypot(ev.clientX - x0, ev.clientY - y0) > HOLD_SLOP) cancel();
                })
                .on('pointerup' + ns + ' pointercancel' + ns, (ev) => {
                    if (ev.pointerId === id) cancel();
                })
                .on('contextmenu' + ns, (ev) => ev.preventDefault());
        }

        _begin(li, x, y, touch) {
            const self = this;
            self._drag = {
                li,
                from: self,
                fromOrder: self.toArray(),
                home: { parent: li.parentNode, next: li.nextSibling },
                over: self,
                touch
            };
            li.classList.add('is-dragging');
            document.documentElement.classList.add('ts-sort-dragging');
            self._emit('start', { item: li });

            const ns = self._ns + 'd';
            const end = (cancelled) => {
                $(document).off(ns);
                if (self._onTouchMove) {
                    document.removeEventListener('touchmove', self._onTouchMove);
                    document.removeEventListener('touchend', self._onTouchEnd);
                    document.removeEventListener('touchcancel', self._onTouchEnd);
                    self._onTouchMove = self._onTouchEnd = null;
                }
                self._finish(cancelled === true);
            };

            if (touch) {
                // The browser may claim a moving finger for scrolling and cancel its pointer events,
                // so a touch drag follows touch events and stops the page from scrolling under it
                self._onTouchMove = (te) => {
                    const t = te.touches[0];
                    if (!t) return;
                    if (te.cancelable) te.preventDefault();
                    self._move(t.clientX, t.clientY);
                };
                self._onTouchEnd = () => end(false);
                document.addEventListener('touchmove', self._onTouchMove, { passive: false });
                document.addEventListener('touchend', self._onTouchEnd);
                document.addEventListener('touchcancel', self._onTouchEnd);
                $(document).on('contextmenu' + ns, (ev) => ev.preventDefault());
            } else {
                $(document)
                    .on('pointermove' + ns, (ev) => self._move(ev.clientX, ev.clientY))
                    .on('pointerup' + ns + ' pointercancel' + ns, () => end(false));
            }

            $(document).on('keydown' + ns, (ev) => {
                if (ev.key === 'Escape') {
                    ev.preventDefault();
                    end(true);
                }
            });
        }

        _move(x, y) {
            const self = this, d = self._drag;
            if (!d) return;
            let target = null;
            self._targets().forEach((s) => {
                const r = rect(s.$el[0]);
                if (x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) target = s;
            });
            self._targets().forEach((s) => s.$el.toggleClass('is-over', s === target && s !== d.from));
            if (!target) return;
            d.over = target;

            const axis = target._axis();
            const rtl = axis !== 'y' && target._rtl();
            const ahead = (r) => rtl ? x > r.left + r.width / 2 : x < r.left + r.width / 2;
            const items = target._items().filter((it) => it !== d.li);
            let before = null;

            for (const it of items) {
                const r = rect(it);
                const hit = axis === 'y' ? y < r.top + r.height / 2
                    : axis === 'x' ? ahead(r)
                    : y < r.top || (y <= r.bottom && ahead(r));
                if (hit) { before = it; break; }
            }

            const parent = target.$el[0];
            if (before) {
                if (d.li.nextElementSibling !== before || d.li.parentNode !== parent) parent.insertBefore(d.li, before);
            } else {
                const last = items[items.length - 1];
                const anchor = last ? last.nextSibling : null;
                if (d.li.parentNode !== parent || (last && d.li.previousElementSibling !== last) || (!last && parent.lastElementChild !== d.li)) {
                    parent.insertBefore(d.li, anchor);
                }
            }
        }

        _finish(cancelled) {
            const self = this, d = self._drag;
            if (!d) return;
            self._drag = null;
            d.li.classList.remove('is-dragging');
            document.documentElement.classList.remove('ts-sort-dragging');
            self._targets().forEach((s) => s.$el.removeClass('is-over'));

            if (cancelled) {
                d.home.parent.insertBefore(d.li, d.home.next && d.home.next.parentNode === d.home.parent ? d.home.next : null);
                d.from._emit('end', { item: d.li });
                return;
            }

            const to = d.li.parentNode === d.from.$el[0] ? d.from : (d.over || d.from);
            to._mark();
            const changed = to !== d.from || d.fromOrder.join('|') !== d.from.toArray().join('|');
            if (changed) {
                const detail = { item: d.li, order: to.toArray(), from: d.from, to };
                d.from._emit('sort', detail);
                if (to !== d.from) to._emit('sort', detail);
            }
            d.from._emit('end', { item: d.li });
        }

        toArray() {
            return this._items().map((li) => li.getAttribute(this.options.idAttr) || '');
        }

        refresh() {
            this._mark();
            return this;
        }

        enable() {
            this._disabled = false;
            this.$el.removeClass('ts-sort-disabled');
            return this;
        }

        disable() {
            this._disabled = true;
            this.$el.addClass('ts-sort-disabled');
            return this;
        }

        destroy() {
            const self = this;
            clearTimeout(self._hold);
            self._hold = null;
            if (self._drag) {
                self._drag.li.classList.remove('is-dragging');
                document.documentElement.classList.remove('ts-sort-dragging');
                self._drag = null;
            }
            if (self._onTouchMove) {
                document.removeEventListener('touchmove', self._onTouchMove);
                document.removeEventListener('touchend', self._onTouchEnd);
                document.removeEventListener('touchcancel', self._onTouchEnd);
                self._onTouchMove = self._onTouchEnd = null;
            }
            self.$el.off(self._ns);
            $(document).off(self._ns + 'd').off(self._ns + 'h');
            self.$el.removeClass('ts-sort-list ts-sort-whole ts-sort-disabled is-over');
            self.$el.find('.ts-sort-item').removeClass('ts-sort-item is-dragging');
            self.$el.find('.ts-sort-handle').removeClass('ts-sort-handle');
            const g = self.options.group;
            if (g && groups[g]) groups[g] = groups[g].filter((x) => x !== self);
            self.$el.removeData(instanceName);
            instanceCount--;
            if (instanceCount <= 0) {
                instanceCount = 0;
                const st = document.getElementById(STYLE_ID);
                if (st) st.remove();
            }
            return this;
        }
    }

    PluginSortable.defaults = {
        items:   '*',              // which children can be moved
        handle:  '',               // selector of the grip inside each item. Empty: the whole item
        group:   '',               // lists with the same name accept each other's items
        axis:    'auto',           // 'auto', 'y' (a column), 'x' (a row) or 'grid' (rows that wrap)
        idAttr:  'data-id',        // attribute that identifies an item in toArray()
        labels:  { move: 'Move. Use the arrow keys to change the order.' },
        onStart: null,
        onSort:  null,             // function ({ item, order, from, to }) {}
        onEnd:   null
    };

    $.extend(themestrap, { PluginSortable });

    // jquery plugin: options object to initialize, or a method name to call ('destroy', ...)
    $.fn.themestrapPluginSortable = function (opts, ...args) {
        return this.map(function () {
            const $this = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && opts.charAt(0) !== '_' && typeof instance[opts] === 'function') {
                    return instance[opts](...args);
                }
                return instance;
            }

            if (instance) {
                return instance;
            }

            // called without options, each element reads its own data-plugin-options
            const own = opts && typeof opts === 'object' ? opts
                : themestrap.fn && typeof themestrap.fn.getOptions === 'function' ? themestrap.fn.getOptions($this.data('plugin-options')) : {};

            return new PluginSortable($this, own);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
