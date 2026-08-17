// Tree
(((themestrap = {}, $) => {
    const instanceName = '__pluginTree';
    const STYLE_ID     = 'ts-tree-styles';

    const CSS = `
.ts-tree {
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: 13px;
    color: var(--text-normal, #c0c0c0);
    user-select: none;
}
.ts-tree-search {
    margin-bottom: 6px;
    position: relative;
}
.ts-tree-search input {
    width: 100%;
    background: var(--bg-deepest, #0d0e0f);
    border: 1px solid var(--border-mid, rgba(255,255,255,0.20));
    border-radius: 4px;
    color: var(--text-normal, #c0c0c0);
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    padding: 4px 28px 4px 8px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
    width: 100%;
}
.ts-tree-search input:focus {
    border-color: var(--accent-cyan, #5ecfdb);
}
.ts-tree-search-clear {
    position: absolute;
    right: 7px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: var(--text-muted, rgba(255,255,255,0.35));
    font-size: 11px;
    display: none;
    line-height: 1;
}
.ts-tree-search-clear.visible { display: block; }
.ts-tree-search-clear:hover { color: var(--text-bright, #f0f0f0); }
.ts-tree-container,
.ts-tree-children {
    list-style: none;
    margin: 0;
    padding: 0;
}
.ts-tree-children { padding-left: 18px; overflow: hidden; }
.ts-tree-node { position: relative; }
.ts-tree-node-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
    min-height: 26px;
    transition: background 0.1s, color 0.1s;
    outline: none;
}
.ts-tree-node-inner:hover {
    background: var(--bg-hover, #2e2f30);
    color: var(--text-bright, #f0f0f0);
}
.ts-tree-node-inner:focus-visible {
    box-shadow: 0 0 0 2px var(--accent-cyan, #5ecfdb);
}
.ts-tree-node.ts-tree-selected > .ts-tree-node-inner {
    background: var(--bg-active, #3a3b3c);
    color: var(--accent-cyan, #5ecfdb);
}
.ts-tree-node.ts-tree-disabled > .ts-tree-node-inner {
    opacity: 0.38;
    pointer-events: none;
}
.ts-tree-node.ts-tree-hidden { display: none; }
.ts-tree-anchor {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim, rgba(255,255,255,0.18));
    font-size: 9px;
    transition: transform 0.15s ease;
    border-radius: 2px;
}
.ts-tree-anchor::before { content: '▶'; display: block; }
.ts-tree-anchor:hover { color: var(--text-muted, rgba(255,255,255,0.35)); }
.ts-tree-node.ts-tree-open > .ts-tree-node-inner > .ts-tree-anchor {
    transform: rotate(90deg);
}
.ts-tree-anchor.ts-tree-anchor-leaf { visibility: hidden; }
.ts-tree-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    line-height: 1;
}
.ts-tree-icon-folder::before { content: '📁'; }
.ts-tree-icon-leaf::before   { content: '📄'; }
.ts-tree-node.ts-tree-open > .ts-tree-node-inner > .ts-tree-icon-folder::before { content: '📂'; }
.ts-tree-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ts-tree-text mark {
    background: rgba(94,207,219,0.22);
    color: var(--accent-cyan, #5ecfdb);
    border-radius: 2px;
    padding: 0 1px;
    font-style: normal;
}
.ts-tree-checkbox {
    width: 14px;
    height: 14px;
    border: 1px solid var(--border-mid, rgba(255,255,255,0.20));
    border-radius: 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    transition: background 0.15s, border-color 0.15s;
    background: var(--bg-deepest, #0d0e0f);
}
.ts-tree-checkbox.ts-tree-checked {
    background: var(--accent-cyan, #5ecfdb);
    border-color: var(--accent-cyan, #5ecfdb);
    color: #000;
}
.ts-tree-checkbox.ts-tree-checked::before  { content: '✓'; }
.ts-tree-checkbox.ts-tree-indeterminate {
    background: rgba(94,207,219,0.35);
    border-color: var(--accent-cyan, #5ecfdb);
    color: #000;
    font-size: 11px;
}
.ts-tree-checkbox.ts-tree-indeterminate::before { content: '−'; }
.ts-tree-no-results {
    padding: 8px 6px;
    color: var(--text-muted, rgba(255,255,255,0.35));
    font-size: 12px;
    font-style: italic;
    display: none;
}
.ts-tree-no-results.visible { display: block; }
`;

    class PluginTree {
        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return this;
            }

            this.$el        = $el;
            this.initialHTML = $el.html();
            this._selected  = new Set();
            this._nodeMap   = new Map();

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            return this;
        }

        setData() {
            this.$el.data(instanceName, this);
            PluginTree.instances = (PluginTree.instances || 0) + 1;
            return this;
        }

        setOptions(opts) {
            this.options = $.extend(true, {}, PluginTree.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }

        build() {
            const self = this;
            const o    = self.options;

            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style');
                style.id    = STYLE_ID;
                style.textContent = CSS;
                document.head.appendChild(style);
            }

            self.$el.addClass('ts-tree');

            if (o.search && o.search.enabled) {
                self._buildSearch();
            }

            if (Array.isArray(o.data) && o.data.length) {
                self._buildFromJSON(o.data);
            } else {
                self._buildFromHTML();
            }

            if (o.openAll) {
                self._openAllImmediate();
            }

            return this;
        }

        _buildSearch() {
            const self = this;
            const ph   = (self.options.search && self.options.search.placeholder) || 'Search\u2026';
            self.$search = $([
                '<div class="ts-tree-search">',
                '<input type="text" autocomplete="off" placeholder="', ph, '" />',
                '<span class="ts-tree-search-clear" aria-label="Clear search">\u2715</span>',
                '</div>'
            ].join(''));
            self.$el.prepend(self.$search);
        }

        _buildFromJSON(data) {
            const self = this;
            const $ul  = $('<ul class="ts-tree-container" role="tree"></ul>');
            self._renderNodes(data, $ul);
            self.$el.append($ul);
        }

        _renderNodes(nodes, $parent) {
            const self = this;
            nodes.forEach(node => {
                const $li = self._createNode(node);
                $parent.append($li);

                const id = self._nodeId(node);
                self._nodeMap.set(id, { $li, data: node });

                if (Array.isArray(node.children) && node.children.length) {
                    const $children = $('<ul class="ts-tree-children" role="group"></ul>');
                    self._renderNodes(node.children, $children);
                    $li.append($children);
                    const opened = node.state && node.state.opened;
                    if (!opened) {
                        $children.hide();
                    } else {
                        $li.addClass('ts-tree-open').attr('aria-expanded', 'true');
                    }
                } else {
                    $li.addClass('ts-tree-leaf');
                    $li.find('> .ts-tree-node-inner > .ts-tree-anchor').addClass('ts-tree-anchor-leaf');
                }

                if (node.state && node.state.selected) {
                    self._applySelect($li, id, false);
                }
                if (node.state && node.state.disabled) {
                    $li.addClass('ts-tree-disabled').attr('aria-disabled', 'true');
                }
            });
        }

        _createNode(node) {
            const self    = this;
            const o       = self.options;
            const id      = self._nodeId(node);
            const text    = node.text || node.label || String(id);
            const isFolder = Array.isArray(node.children) && node.children.length;

            let iconHtml = '';
            if (node.icon) {
                iconHtml = '<span class="ts-tree-icon"><i class="' + node.icon + '"></i></span>';
            } else if (isFolder) {
                const cls = (o.icons && o.icons.folder) ? o.icons.folder : 'ts-tree-icon-folder';
                iconHtml = '<span class="ts-tree-icon ' + cls + '"></span>';
            } else {
                const cls = (o.icons && o.icons.leaf) ? o.icons.leaf : 'ts-tree-icon-leaf';
                iconHtml = '<span class="ts-tree-icon ' + cls + '"></span>';
            }

            const checkHtml = o.checkbox
                ? '<span class="ts-tree-checkbox" role="checkbox" aria-checked="false"></span>'
                : '';

            const anchorCls = isFolder ? 'ts-tree-anchor' : 'ts-tree-anchor ts-tree-anchor-leaf';

            const $li = $([
                '<li class="ts-tree-node" role="treeitem" tabindex="-1"',
                ' data-node-id="', self._esc(id), '">',
                '<span class="ts-tree-node-inner" tabindex="0">',
                '<span class="', anchorCls, '" aria-hidden="true"></span>',
                checkHtml,
                iconHtml,
                '<span class="ts-tree-text">', self._esc(text), '</span>',
                '</span>',
                '</li>'
            ].join(''));

            if (isFolder) {
                $li.attr('aria-expanded', 'false');
            }

            return $li;
        }

        _buildFromHTML() {
            const self = this;
            const $ul  = self.$el.find('> ul').first();
            if (!$ul.length) return;
            $ul.addClass('ts-tree-container').attr('role', 'tree');
            self._processHTMLNodes($ul.find('> li'));
        }

        _processHTMLNodes($items) {
            const self = this;
            const o    = self.options;

            $items.each(function() {
                const $li = $(this);
                $li.addClass('ts-tree-node').attr('role', 'treeitem');

                const $sub     = $li.find('> ul');
                const isFolder = $sub.length > 0;

                if (!$li.find('> .ts-tree-node-inner').length) {
                    const rawText = $li.contents()
                        .filter(function() { return this.nodeType === 3; })
                        .map(function() { return $(this).text(); })
                        .get()
                        .join('')
                        .trim();

                    $li.contents().filter(function() { return this.nodeType === 3; }).remove();

                    const nodeText = rawText || $li.attr('data-node-id') || 'Node';
                    const id       = $li.attr('id') || $li.attr('data-node-id') || nodeText;

                    $li.attr('data-node-id', id);

                    let iconHtml = '';
                    if (isFolder) {
                        const cls = (o.icons && o.icons.folder) ? o.icons.folder : 'ts-tree-icon-folder';
                        iconHtml = '<span class="ts-tree-icon ' + cls + '"></span>';
                    } else {
                        const cls = (o.icons && o.icons.leaf) ? o.icons.leaf : 'ts-tree-icon-leaf';
                        iconHtml = '<span class="ts-tree-icon ' + cls + '"></span>';
                    }

                    const checkHtml = o.checkbox
                        ? '<span class="ts-tree-checkbox" role="checkbox" aria-checked="false"></span>'
                        : '';

                    const anchorCls = isFolder ? 'ts-tree-anchor' : 'ts-tree-anchor ts-tree-anchor-leaf';

                    const $inner = $([
                        '<span class="ts-tree-node-inner" tabindex="0">',
                        '<span class="', anchorCls, '" aria-hidden="true"></span>',
                        checkHtml,
                        iconHtml,
                        '<span class="ts-tree-text">', nodeText, '</span>',
                        '</span>'
                    ].join(''));

                    $li.prepend($inner);
                    self._nodeMap.set(id, { $li, data: { id, text: nodeText, isFolder } });
                }

                const dataState = $li.attr('data-state') || '';

                if (isFolder) {
                    $sub.addClass('ts-tree-children').attr('role', 'group');
                    const opened = dataState === 'open' || $li.hasClass('open');
                    $li.attr('aria-expanded', opened ? 'true' : 'false');
                    if (!opened) { $sub.hide(); } else { $li.addClass('ts-tree-open'); }
                    self._processHTMLNodes($sub.find('> li'));
                } else {
                    $li.addClass('ts-tree-leaf');
                }

                if (dataState === 'selected' || $li.hasClass('selected')) {
                    self._applySelect($li, $li.attr('data-node-id'), false);
                }
                if (dataState === 'disabled' || $li.hasClass('disabled')) {
                    $li.addClass('ts-tree-disabled').attr('aria-disabled', 'true');
                }
            });
        }

        events() {
            const self = this;
            const o    = self.options;

            self.$el.on('click.plugintree', '.ts-tree-node-inner', function(e) {
                const $inner = $(this);
                const $li    = $inner.closest('.ts-tree-node');

                if ($li.hasClass('ts-tree-disabled')) return;

                const onAnchor   = $(e.target).is('.ts-tree-anchor') || !!$(e.target).closest('.ts-tree-anchor').length;
                const onCheckbox = $(e.target).is('.ts-tree-checkbox') || !!$(e.target).closest('.ts-tree-checkbox').length;

                if (onAnchor) {
                    if (!$li.hasClass('ts-tree-leaf')) self.toggle($li);
                    return;
                }

                if (onCheckbox && o.checkbox) {
                    self._toggleCheckbox($li);
                    return;
                }

                self._handleSelect($li, e);

                if (!$li.hasClass('ts-tree-leaf')) {
                    self.toggle($li);
                }
            });

            self.$el.on('keydown.plugintree', '.ts-tree-node-inner', function(e) {
                const $inner   = $(this);
                const $li      = $inner.closest('.ts-tree-node');
                const isFolder = !$li.hasClass('ts-tree-leaf');

                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        if (o.checkbox) {
                            self._toggleCheckbox($li);
                        } else {
                            self._handleSelect($li, e);
                        }
                        if (isFolder) self.toggle($li);
                        break;

                    case 'ArrowRight':
                        e.preventDefault();
                        if (isFolder && !$li.hasClass('ts-tree-open')) {
                            self.open($li);
                        } else {
                            const $fc = $li.find('> .ts-tree-children > .ts-tree-node:first > .ts-tree-node-inner');
                            if ($fc.length) $fc.focus();
                        }
                        break;

                    case 'ArrowLeft':
                        e.preventDefault();
                        if (isFolder && $li.hasClass('ts-tree-open')) {
                            self.close($li);
                        } else {
                            const $pi = $li.closest('.ts-tree-children').closest('.ts-tree-node').find('> .ts-tree-node-inner');
                            if ($pi.length) $pi.focus();
                        }
                        break;

                    case 'ArrowDown':
                        e.preventDefault();
                        self._focusAdjacent($li, 1);
                        break;

                    case 'ArrowUp':
                        e.preventDefault();
                        self._focusAdjacent($li, -1);
                        break;

                    case 'Home':
                        e.preventDefault();
                        self.$el.find('.ts-tree-node-inner').first().focus();
                        break;

                    case 'End':
                        e.preventDefault();
                        self.$el.find('.ts-tree-node-inner:visible').last().focus();
                        break;
                }
            });

            if (o.search && o.search.enabled && self.$search) {
                const $input = self.$search.find('input');
                const $clear = self.$search.find('.ts-tree-search-clear');

                $input.on('input.plugintree', function() {
                    const term = $(this).val();
                    $clear.toggleClass('visible', term.length > 0);
                    self.search(term);
                });

                $clear.on('click.plugintree', function() {
                    $input.val('');
                    $clear.removeClass('visible');
                    self.search('');
                    $input.focus();
                });
            }

            return this;
        }

        _handleSelect($li, e) {
            const self = this;
            const o    = self.options;
            const id   = $li.attr('data-node-id');

            if (!o.multiSelect) {
                self._selected.forEach(sid => {
                    const entry = self._nodeMap.get(sid);
                    if (entry) {
                        entry.$li.removeClass('ts-tree-selected');
                        if (o.checkbox) {
                            entry.$li.find('> .ts-tree-node-inner > .ts-tree-checkbox')
                                .removeClass('ts-tree-checked')
                                .attr('aria-checked', 'false');
                        }
                    }
                });
                self._selected.clear();
            }

            if ($li.hasClass('ts-tree-selected')) {
                self._applyDeselect($li, id, true);
            } else {
                self._applySelect($li, id, true);
            }
        }

        _applySelect($li, id, fireEvent) {
            const self = this;
            const o    = self.options;
            $li.addClass('ts-tree-selected');
            self._selected.add(id);
            if (o.checkbox) {
                $li.find('> .ts-tree-node-inner > .ts-tree-checkbox')
                    .removeClass('ts-tree-indeterminate')
                    .addClass('ts-tree-checked')
                    .attr('aria-checked', 'true');
            }
            if (fireEvent) {
                const entry = self._nodeMap.get(id);
                const data  = entry ? entry.data : { id };
                self.$el[0].dispatchEvent(new CustomEvent('ts.tree.select', {
                    bubbles: true, detail: { id, data, $el: $li }
                }));
                if (typeof o.onSelect === 'function') o.onSelect(data, $li);
            }
        }

        _applyDeselect($li, id, fireEvent) {
            const self = this;
            const o    = self.options;
            $li.removeClass('ts-tree-selected');
            self._selected.delete(id);
            if (o.checkbox) {
                $li.find('> .ts-tree-node-inner > .ts-tree-checkbox')
                    .removeClass('ts-tree-checked ts-tree-indeterminate')
                    .attr('aria-checked', 'false');
            }
            if (fireEvent) {
                const entry = self._nodeMap.get(id);
                const data  = entry ? entry.data : { id };
                self.$el[0].dispatchEvent(new CustomEvent('ts.tree.deselect', {
                    bubbles: true, detail: { id, data, $el: $li }
                }));
                if (typeof o.onDeselect === 'function') o.onDeselect(data, $li);
            }
        }

        _toggleCheckbox($li) {
            const self  = this;
            const id    = $li.attr('data-node-id');
            const isChk = $li.find('> .ts-tree-node-inner > .ts-tree-checkbox').hasClass('ts-tree-checked');

            if (isChk) {
                self._applyDeselect($li, id, true);
                $li.find('.ts-tree-node').each(function() {
                    const $c  = $(this);
                    const cid = $c.attr('data-node-id');
                    self._applyDeselect($c, cid, false);
                });
            } else {
                self._applySelect($li, id, true);
                $li.find('.ts-tree-node').each(function() {
                    const $c  = $(this);
                    const cid = $c.attr('data-node-id');
                    self._applySelect($c, cid, false);
                });
            }

            self._syncParentCheckboxes($li);
        }

        _syncParentCheckboxes($li) {
            const self = this;
            let $parent = $li.closest('.ts-tree-children').closest('.ts-tree-node');
            while ($parent.length) {
                const $chk      = $parent.find('> .ts-tree-node-inner > .ts-tree-checkbox');
                const $children = $parent.find('> .ts-tree-children > .ts-tree-node');
                const total     = $children.length;
                const checked   = $children.filter('.ts-tree-selected').length;
                const pid       = $parent.attr('data-node-id');

                if (checked === 0) {
                    $chk.removeClass('ts-tree-checked ts-tree-indeterminate').attr('aria-checked', 'false');
                    $parent.removeClass('ts-tree-selected');
                    self._selected.delete(pid);
                } else if (checked === total) {
                    $chk.removeClass('ts-tree-indeterminate').addClass('ts-tree-checked').attr('aria-checked', 'true');
                    $parent.addClass('ts-tree-selected');
                    self._selected.add(pid);
                } else {
                    $chk.removeClass('ts-tree-checked').addClass('ts-tree-indeterminate').attr('aria-checked', 'mixed');
                    $parent.removeClass('ts-tree-selected');
                    self._selected.delete(pid);
                }

                $parent = $parent.closest('.ts-tree-children').closest('.ts-tree-node');
            }
        }

        _focusAdjacent($li, dir) {
            const self     = this;
            const $all     = self.$el.find('.ts-tree-node-inner').filter(function() {
                return $(this).closest('.ts-tree-node').css('display') !== 'none' &&
                       $(this).is(':visible');
            });
            const idx = $all.index($li.find('> .ts-tree-node-inner'));
            const next = idx + dir;
            if (next >= 0 && next < $all.length) {
                $all.eq(next).focus();
            }
        }

        _openAllImmediate() {
            const self = this;
            self.$el.find('.ts-tree-node:not(.ts-tree-leaf)').each(function() {
                const $li = $(this);
                $li.addClass('ts-tree-open').attr('aria-expanded', 'true');
                $li.find('> .ts-tree-children').show();
            });
        }

        _nodeId(node) {
            return node.id !== undefined ? String(node.id) : (node.text || node.label || '');
        }

        _esc(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        _resolve(ref) {
            if (!ref) return null;
            if (ref && (ref instanceof $ || ref.jquery)) return ref;
            if (typeof ref === 'string' || typeof ref === 'number') {
                const entry = this._nodeMap.get(String(ref));
                if (entry) return entry.$li;
                return this.$el.find('[data-node-id="' + String(ref) + '"]');
            }
            return null;
        }

        open(ref) {
            const self = this;
            const $li  = self._resolve(ref);
            if (!$li || !$li.length || $li.hasClass('ts-tree-open') || $li.hasClass('ts-tree-leaf')) return self;
            const dur  = self.options.animation;
            $li.addClass('ts-tree-open').attr('aria-expanded', 'true');
            if (dur) {
                $li.find('> .ts-tree-children').slideDown(dur);
            } else {
                $li.find('> .ts-tree-children').show();
            }
            const id    = $li.attr('data-node-id');
            const entry = self._nodeMap.get(id);
            const data  = entry ? entry.data : { id };
            self.$el[0].dispatchEvent(new CustomEvent('ts.tree.open', {
                bubbles: true, detail: { id, data, $el: $li }
            }));
            if (typeof self.options.onOpen === 'function') self.options.onOpen(data, $li);
            return self;
        }

        close(ref) {
            const self = this;
            const $li  = self._resolve(ref);
            if (!$li || !$li.length || !$li.hasClass('ts-tree-open')) return self;
            const dur  = self.options.animation;
            $li.removeClass('ts-tree-open').attr('aria-expanded', 'false');
            if (dur) {
                $li.find('> .ts-tree-children').slideUp(dur);
            } else {
                $li.find('> .ts-tree-children').hide();
            }
            const id    = $li.attr('data-node-id');
            const entry = self._nodeMap.get(id);
            const data  = entry ? entry.data : { id };
            self.$el[0].dispatchEvent(new CustomEvent('ts.tree.close', {
                bubbles: true, detail: { id, data, $el: $li }
            }));
            if (typeof self.options.onClose === 'function') self.options.onClose(data, $li);
            return self;
        }

        toggle(ref) {
            const self = this;
            const $li  = self._resolve(ref);
            if (!$li || !$li.length) return self;
            return $li.hasClass('ts-tree-open') ? self.close($li) : self.open($li);
        }

        openAll() {
            const self = this;
            self.$el.find('.ts-tree-node:not(.ts-tree-leaf)').each(function() {
                self.open($(this));
            });
            return self;
        }

        closeAll() {
            const self = this;
            self.$el.find('.ts-tree-node.ts-tree-open').each(function() {
                self.close($(this));
            });
            return self;
        }

        select(ref) {
            const self = this;
            const $li  = self._resolve(ref);
            if (!$li || !$li.length) return self;
            self._applySelect($li, $li.attr('data-node-id'), true);
            return self;
        }

        deselect(ref) {
            const self = this;
            const $li  = self._resolve(ref);
            if (!$li || !$li.length) return self;
            self._applyDeselect($li, $li.attr('data-node-id'), true);
            return self;
        }

        deselectAll() {
            const self = this;
            self._selected.forEach(id => {
                const entry = self._nodeMap.get(id);
                if (entry) self._applyDeselect(entry.$li, id, false);
            });
            self._selected.clear();
            return self;
        }

        getSelected() {
            const self   = this;
            const result = [];
            self._selected.forEach(id => {
                const entry = self._nodeMap.get(id);
                if (entry) result.push({ id, data: entry.data, $el: entry.$li });
            });
            return result;
        }

        search(term) {
            const self      = this;
            const o         = self.options;
            const fuzzy     = o.search && o.search.fuzzy;
            const openFound = !o.search || o.search.openFound !== false;

            self.$el.find('.ts-tree-text').each(function() {
                const $t = $(this);
                if ($t.find('mark').length) {
                    $t.text($t.text());
                }
            });

            if (!term) {
                self.$el.find('.ts-tree-node').removeClass('ts-tree-hidden');
                self.$el.find('.ts-tree-children').each(function() {
                    const $li = $(this).closest('.ts-tree-node');
                    if (!$li.hasClass('ts-tree-open')) $(this).hide();
                });
                self.$el.find('.ts-tree-no-results').removeClass('visible');
                self.$el[0].dispatchEvent(new CustomEvent('ts.tree.search', {
                    bubbles: true, detail: { term: '', count: 0 }
                }));
                return self;
            }

            const tl = term.toLowerCase();
            let count = 0;

            self.$el.find('.ts-tree-node').addClass('ts-tree-hidden');

            self.$el.find('.ts-tree-node').each(function() {
                const $li      = $(this);
                const $textEl  = $li.find('> .ts-tree-node-inner > .ts-tree-text');
                const nodeText = $textEl.text();
                const ntl      = nodeText.toLowerCase();
                let matched    = false;

                if (fuzzy) {
                    let ti = 0;
                    for (let i = 0; i < ntl.length && ti < tl.length; i++) {
                        if (ntl[i] === tl[ti]) ti++;
                    }
                    matched = ti === tl.length;
                } else {
                    matched = ntl.includes(tl);
                }

                if (matched) {
                    count++;
                    $li.removeClass('ts-tree-hidden');

                    if (!fuzzy) {
                        const idx = ntl.indexOf(tl);
                        if (idx >= 0) {
                            const before = nodeText.substring(0, idx);
                            const match  = nodeText.substring(idx, idx + term.length);
                            const after  = nodeText.substring(idx + term.length);
                            $textEl.html(self._esc(before) + '<mark>' + self._esc(match) + '</mark>' + self._esc(after));
                        }
                    }

                    if (openFound) {
                        $li.parents('.ts-tree-node').removeClass('ts-tree-hidden');
                        $li.parents('.ts-tree-children').show();
                    }
                }
            });

            let $nr = self.$el.find('.ts-tree-no-results');
            if (!$nr.length) {
                $nr = $('<div class="ts-tree-no-results">No results found.</div>');
                self.$el.append($nr);
            }
            $nr.toggleClass('visible', count === 0);

            self.$el[0].dispatchEvent(new CustomEvent('ts.tree.search', {
                bubbles: true, detail: { term, count }
            }));
            return self;
        }

        destroy() {
            const self = this;
            self.$el.off('.plugintree');
            self.$el.html(self.initialHTML);
            self.$el.removeClass('ts-tree');
            self.$el.removeData(instanceName);
            self._selected.clear();
            self._nodeMap.clear();

            PluginTree.instances = Math.max(0, (PluginTree.instances || 1) - 1);
            if (PluginTree.instances === 0) {
                const style = document.getElementById(STYLE_ID);
                if (style) style.remove();
            }

            return this;
        }
    }

    PluginTree.defaults = {
        data:       null,
        openAll:    false,
        checkbox:   false,
        multiSelect: true,
        animation:  200,
        icons: {
            leaf:   null,
            folder: null,
        },
        search: {
            enabled:     false,
            placeholder: 'Search\u2026',
            fuzzy:       false,
            openFound:   true,
        },
        onSelect:   null,
        onDeselect: null,
        onOpen:     null,
        onClose:    null,
    };

    PluginTree.instances = 0;

    $.extend(themestrap, { PluginTree });

    $.fn.themestrapPluginTree = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginTree($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
