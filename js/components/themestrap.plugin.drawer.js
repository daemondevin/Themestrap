/** 
 * Themestrap PluginDrawer
 * A drawer/off-canvas component.
 *
 * Usage:
 *   $('[data-plugin-drawer]').themestrapPluginDrawer();
 *
 * Programmatic:
 *   $('#my-drawer').themestrapPluginDrawer('open');
 *   $('#my-drawer').themestrapPluginDrawer('close');
 *   $('#my-drawer').themestrapPluginDrawer('toggle');
 *
 * Markup:
 *
 * <div
 *     id="my-drawer"
 *     data-plugin-drawer
 *     data-plugin-options='{"direction":"bottom"}'
 * >
 *     <div data-drawer-overlay></div>
 *
 *     <div data-drawer-content>
 *         <div data-drawer-handle></div>
 *
 *         <div data-drawer-header>
 *             <h2 data-drawer-title>Drawer Title</h2>
 *             <p data-drawer-description>Description</p>
 *         </div>
 *
 *         <div data-drawer-body>
 *             Drawer content.
 *         </div>
 *
 *         <div data-drawer-footer>
 *             <button data-drawer-close>Close</button>
 *         </div>
 *     </div>
 * </div>
 *
 * Trigger:
 *   <button data-drawer-trigger="#my-drawer">Open Drawer</button>
 */
// Drawer
(((themestrap = {}, $) => {

    const instanceName = '__drawer';
    const STYLE_ID = 'ts-drawer-styles';

    class PluginDrawer {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if (!$el || !$el.length) {
                return this;
            }

            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

            this
                .setData()
                .setOptions(opts)
                .build()
                .events();

            $el.data(instanceName, this);

            return this;
        }

        setData() {
            this.data = {
                isOpen: false,
                isDragging: false,
                startY: 0,
                currentY: 0,
                lastY: 0,
                velocityY: 0,
                startTime: 0,
                pointerId: null,
                startTranslate: 0,
                currentTranslate: 0,
                contentHeight: 0,
                raf: null,
                previousFocus: null,
                bodyOverflow: null
            };

            return this;
        }

        setOptions(opts) {
            opts = opts || {};

            this.options = $.extend(true, {}, PluginDrawer.defaults, opts, {
                wrapper: this.$el
            });

            return this;
        }

        build() {
            this._ensureStructure();
            this._injectStyles();
            this._cacheElements();
            this._setupARIA();
            this._setupDirection();
            this._setupInitialState();

            return this;
        }

        _ensureStructure() {
            let $content = this.$el.find('[data-drawer-content]').first();

            if (!$content.length) {
                $content = $('<div data-drawer-content></div>');

                const $children = this.$el.children().detach();

                $content.append($children);
                this.$el.append($content);
            }

            if (!this.$el.find('[data-drawer-overlay]').length) {
                this.$el.prepend(
                    '<div data-drawer-overlay data-drawer-part="overlay"></div>'
                );
            }

            if (
                this.options.showHandle &&
                !this.$el.find('[data-drawer-handle]').length
            ) {
                $content.prepend(
                    '<div data-drawer-handle data-drawer-part="handle">' +
                    '<span></span>' +
                    '</div>'
                );
            }

            return this;
        }

        _cacheElements() {
            this.$overlay = this.$el.find('[data-drawer-overlay]').first();
            this.$content = this.$el.find('[data-drawer-content]').first();
            this.$handle = this.$el.find('[data-drawer-handle]').first();

            this.$trigger = $(
                `[data-drawer-trigger="#${this.$el.attr('id')}"]`
            );

            this.$close = this.$el.find(
                '[data-drawer-close], [data-drawer-dismiss]'
            );

            return this;
        }

        _setupARIA() {
            const id = this.$el.attr('id');

            this.$el.attr({
                role: 'dialog',
                'aria-modal': 'true',
                'aria-hidden': 'true'
            });

            if (id) {
                this.$trigger.attr('aria-controls', id);
            }

            if (!this.$el.find('[data-drawer-title]').length) {
                this.$el.attr('aria-label', this.options.ariaLabel);
            } else {
                const titleId = this._getOrCreateId(
                    this.$el.find('[data-drawer-title]').first(),
                    'ts-drawer-title'
                );

                this.$el.attr('aria-labelledby', titleId);
            }

            const $description = this.$el
                .find('[data-drawer-description]')
                .first();

            if ($description.length) {
                const descriptionId = this._getOrCreateId(
                    $description,
                    'ts-drawer-description'
                );

                this.$el.attr('aria-describedby', descriptionId);
            }

            return this;
        }

        _getOrCreateId($element, prefix) {
            let id = $element.attr('id');

            if (!id) {
                id =
                    prefix +
                    '-' +
                    Math.random().toString(36).slice(2, 9);

                $element.attr('id', id);
            }

            return id;
        }

        _setupDirection() {
            this.$el.attr(
                'data-drawer-direction',
                this.options.direction
            );

            return this;
        }

        _setupInitialState() {
            this.$el.addClass('ts-drawer');
            this.$el.addClass('ts-drawer--closed');

            if (this.options.modal) {
                this.$el.addClass('ts-drawer--modal');
            }

            if (this.options.overlay) {
                this.$el.addClass('ts-drawer--overlay');
            }

            if (this.options.showHandle) {
                this.$el.addClass('ts-drawer--handle');
            }

            if (this.options.closeOnOutsideClick === false) {
                this.$el.addClass('ts-drawer--no-outside-close');
            }

            this._setTranslate(this._closedTranslate(), false);

            return this;
        }

        _injectStyles() {
            if (document.getElementById(STYLE_ID)) {
                return this;
            }

            const css = `
                .ts-drawer {
                    position: fixed;
                    inset: 0;
                    z-index: var(--ts-drawer-z-index, 1050);
                    pointer-events: none;
                    visibility: hidden;
                }

                .ts-drawer *,
                .ts-drawer *::before,
                .ts-drawer *::after {
                    box-sizing: border-box;
                }

                .ts-drawer[data-drawer-direction="bottom"] {
                    --ts-drawer-size: ${this.options.size};
                }

                .ts-drawer[data-drawer-direction="top"] {
                    --ts-drawer-size: ${this.options.size};
                }

                .ts-drawer[data-drawer-direction="left"],
                .ts-drawer[data-drawer-direction="right"] {
                    --ts-drawer-size: ${this.options.sideSize};
                }

                .ts-drawer--open {
                    pointer-events: auto;
                    visibility: visible;
                }

                [data-drawer-overlay] {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, ${this.options.overlayOpacity});
                    opacity: 0;
                    transition: opacity ${this.options.animationDuration}ms
                        ${this.options.easing};
                }

                .ts-drawer--open [data-drawer-overlay] {
                    opacity: 1;
                }

                .ts-drawer--closed [data-drawer-overlay] {
                    opacity: 0;
                }

                [data-drawer-content] {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    background: ${this.options.background};
                    color: ${this.options.color};
                    box-shadow: ${this.options.shadow};
                    will-change: transform;
                    touch-action: none;
                    transition:
                        transform ${this.options.animationDuration}ms
                        ${this.options.easing};
                    overflow: hidden;
                }

                [data-drawer-direction="bottom"] [data-drawer-content] {
                    left: 0;
                    right: 0;
                    bottom: 0;
                    max-height: ${this.options.maxHeight};
                    height: var(--ts-drawer-size);
                    border-radius:
                        ${this.options.radius}
                        ${this.options.radius}
                        0 0;
                }

                [data-drawer-direction="top"] [data-drawer-content] {
                    left: 0;
                    right: 0;
                    top: 0;
                    max-height: ${this.options.maxHeight};
                    height: var(--ts-drawer-size);
                    border-radius:
                        0 0
                        ${this.options.radius}
                        ${this.options.radius};
                }

                [data-drawer-direction="left"] [data-drawer-content] {
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: var(--ts-drawer-size);
                    max-width: ${this.options.maxWidth};
                    border-radius:
                        0
                        ${this.options.radius}
                        ${this.options.radius}
                        0;
                }

                [data-drawer-direction="right"] [data-drawer-content] {
                    top: 0;
                    bottom: 0;
                    right: 0;
                    width: var(--ts-drawer-size);
                    max-width: ${this.options.maxWidth};
                    border-radius:
                        ${this.options.radius}
                        0 0
                        ${this.options.radius};
                }

                [data-drawer-handle] {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 24px;
                    cursor: grab;
                    touch-action: none;
                    user-select: none;
                }

                [data-drawer-handle]:active {
                    cursor: grabbing;
                }

                [data-drawer-handle] span {
                    display: block;
                    width: 100px;
                    height: 4px;
                    border-radius: 999px;
                    background: ${this.options.handleColor};
                }

                [data-drawer-header] {
                    flex: 0 0 auto;
                    padding: ${this.options.headerPadding};
                }

                [data-drawer-body] {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    padding: ${this.options.bodyPadding};
                    touch-action: pan-y;
                }

                [data-drawer-footer] {
                    flex: 0 0 auto;
                    padding: ${this.options.footerPadding};
                }

                [data-drawer-title] {
                    margin: 0;
                }

                [data-drawer-description] {
                    margin: ${this.options.descriptionMargin};
                    color: ${this.options.mutedColor};
                }

                .ts-drawer--dragging [data-drawer-content] {
                    transition: none !important;
                }

                .ts-drawer--dragging [data-drawer-overlay] {
                    transition: none !important;
                }

                .ts-drawer--dragging [data-drawer-content] {
                    user-select: none;
                }

                .ts-drawer--no-outside-close
                    [data-drawer-overlay] {
                    cursor: default;
                }

                @media (prefers-reduced-motion: reduce) {
                    [data-drawer-content],
                    [data-drawer-overlay] {
                        transition-duration: 1ms !important;
                    }
                }
            `;

            $('<style>', {
                id: STYLE_ID,
                type: 'text/css',
                text: css
            }).appendTo(document.head);

            return this;
        }

        events() {
            this._bindTriggers();
            this._bindOverlay();
            this._bindClose();
            this._bindKeyboard();
            this._bindDrag();

            return this;
        }

        _bindTriggers() {
            const self = this;

            $(document).on(
                'click.ts.drawer',
                '[data-drawer-trigger]',
                function (e) {
                    const selector = $(this).attr('data-drawer-trigger');

                    if (
                        selector === '#' + self.$el.attr('id') ||
                        selector === self.$el.attr('id')
                    ) {
                        e.preventDefault();

                        self.data.previousFocus = this;
                        self.open();
                    }
                }
            );

            return this;
        }

        _bindOverlay() {
            const self = this;

            this.$overlay.on('click.ts.drawer', function (e) {
                if (
                    self.options.closeOnOutsideClick &&
                    e.target === this
                ) {
                    self.close('overlay');
                }
            });

            return this;
        }

        _bindClose() {
            const self = this;

            this.$close.on('click.ts.drawer', function (e) {
                e.preventDefault();
                self.close('button');
            });

            return this;
        }

        _bindKeyboard() {
            const self = this;

            $(document).on('keydown.ts.drawer', function (e) {
                if (!self.data.isOpen) {
                    return;
                }

                if (
                    e.key === 'Escape' &&
                    self.options.closeOnEscape
                ) {
                    e.preventDefault();
                    self.close('escape');
                }
            });

            return this;
        }

        _bindDrag() {
            const self = this;

            if (!this.options.draggable) {
                return this;
            }

            this.$content.on(
                'pointerdown.ts.drawer',
                function (e) {
                    self._pointerDown(e);
                }
            );

            this.$content.on(
                'pointermove.ts.drawer',
                function (e) {
                    self._pointerMove(e);
                }
            );

            this.$content.on(
                'pointerup.ts.drawer pointercancel.ts.drawer',
                function (e) {
                    self._pointerUp(e);
                }
            );

            return this;
        }

        _pointerDown(e) {
            if (!this.data.isOpen) {
                return;
            }

            const direction = this.options.direction;

            // For horizontal drawers, use the X axis.
            const axis =
                direction === 'left' ||
                    direction === 'right'
                    ? 'x'
                    : 'y';

            // Don't hijack normal interaction with buttons,
            // links, inputs, selects, textareas, etc.
            if (
                this.options.dragAnywhere === false &&
                !$(e.target).closest('[data-drawer-handle]').length
            ) {
                return;
            }

            if (
                this.options.dragAnywhere &&
                $(e.target).closest(
                    'button, a, input, textarea, select, option'
                ).length
            ) {
                return;
            }

            this.data.pointerId = e.pointerId;
            this.data.startTime = performance.now();
            this.data.startX = e.clientX;
            this.data.startY = e.clientY;
            this.data.lastX = e.clientX;
            this.data.lastY = e.clientY;
            this.data.velocity = 0;

            this.data.axis = axis;
            this.data.startTranslate = this.data.currentTranslate;

            this.data.isDragging = false;

            try {
                this.$content[0].setPointerCapture(e.pointerId);
            } catch (_) { }

            return this;
        }

        _pointerMove(e) {
            if (
                this.data.pointerId !== e.pointerId
            ) {
                return;
            }

            const dx = e.clientX - this.data.startX;
            const dy = e.clientY - this.data.startY;

            const delta =
                this.data.axis === 'x'
                    ? dx
                    : dy;

            if (!this.data.isDragging) {
                if (Math.abs(delta) < this.options.dragStartThreshold) {
                    return;
                }

                if (!this._isCorrectDragDirection(delta)) {
                    this._resetPointer();
                    return;
                }

                this.data.isDragging = true;

                this.$el.addClass('ts-drawer--dragging');
            }

            const now = performance.now();
            const elapsed = Math.max(
                now - this.data.startTime,
                1
            );

            this.data.velocity = delta / elapsed;

            let translate =
                this.data.startTranslate + delta;

            translate = this._clampTranslate(translate);

            this.data.currentTranslate = translate;

            this._setTranslate(translate, false);

            this.data.lastX = e.clientX;
            this.data.lastY = e.clientY;

            return this;
        }

        _pointerUp(e) {
            if (
                this.data.pointerId !== e.pointerId
            ) {
                return;
            }

            if (!this.data.isDragging) {
                this._resetPointer();
                return;
            }

            const translate = this.data.currentTranslate;
            const velocity = this.data.velocity;

            const shouldClose =
                Math.abs(translate) >=
                this._dismissThreshold() ||
                this._isDismissVelocity(velocity);

            this.$el.removeClass('ts-drawer--dragging');

            this._resetPointer();

            if (shouldClose) {
                this.close('drag');
            } else {
                this._animateToOpen();
            }

            return this;
        }

        _resetPointer() {
            this.data.pointerId = null;
            this.data.isDragging = false;
            this.data.startTranslate = 0;
            this.data.velocity = 0;

            return this;
        }

        _isCorrectDragDirection(delta) {
            const direction = this.options.direction;

            if (direction === 'bottom') {
                return delta > 0;
            }

            if (direction === 'top') {
                return delta < 0;
            }

            if (direction === 'left') {
                return delta < 0;
            }

            if (direction === 'right') {
                return delta > 0;
            }

            return false;
        }

        _isDismissVelocity(velocity) {
            const direction = this.options.direction;

            if (direction === 'bottom') {
                return velocity > this.options.velocityThreshold;
            }

            if (direction === 'top') {
                return velocity < -this.options.velocityThreshold;
            }

            if (direction === 'left') {
                return velocity < -this.options.velocityThreshold;
            }

            if (direction === 'right') {
                return velocity > this.options.velocityThreshold;
            }

            return false;
        }

        _dismissThreshold() {
            const size = this._drawerSize();

            return size * this.options.dismissThreshold;
        }

        _drawerSize() {
            const rect = this.$content[0].getBoundingClientRect();

            if (
                this.options.direction === 'left' ||
                this.options.direction === 'right'
            ) {
                return rect.width;
            }

            return rect.height;
        }

        _closedTranslate() {
            return this._drawerSize();
        }

        _clampTranslate(value) {
            // The drawer is open at zero.
            // Positive/negative movement depends on direction.

            const direction = this.options.direction;

            if (
                direction === 'bottom' ||
                direction === 'right'
            ) {
                return Math.max(0, value);
            }

            return Math.min(0, value);
        }

        _setTranslate(value, animate) {
            const direction = this.options.direction;

            let transform;

            if (direction === 'bottom') {
                transform = `translate3d(0, ${Math.max(0, value)}px, 0)`;
            } else if (direction === 'top') {
                transform = `translate3d(0, ${Math.min(0, value)}px, 0)`;
            } else if (direction === 'left') {
                transform = `translate3d(${Math.min(0, value)}px, 0, 0)`;
            } else {
                transform = `translate3d(${Math.max(0, value)}px, 0, 0)`;
            }

            if (!animate) {
                this.$content.css(
                    'transition',
                    'none'
                );
            } else {
                this.$content.css(
                    'transition',
                    ''
                );
            }

            this.$content.css(
                'transform',
                transform
            );

            this._updateOverlayOpacity(value);

            if (!animate) {
                requestAnimationFrame(() => {
                    if (
                        !this.data.isDragging
                    ) {
                        this.$content.css(
                            'transition',
                            ''
                        );
                    }
                });
            }

            return this;
        }

        _updateOverlayOpacity(value) {
            if (!this.options.overlay) {
                return;
            }

            const size = Math.max(
                this._drawerSize(),
                1
            );

            const progress = Math.max(
                0,
                Math.min(
                    1,
                    1 - Math.abs(value) / size
                )
            );

            this.$overlay.css(
                'opacity',
                progress
            );

            return this;
        }

        _animateToOpen() {
            this.data.currentTranslate = 0;

            this.$content.css(
                'transition',
                ''
            );

            this.$content.css(
                'transform',
                'translate3d(0, 0, 0)'
            );

            this.$overlay.css(
                'opacity',
                1
            );

            return this;
        }

        open() {
            if (this.data.isOpen) {
                return this;
            }

            this.data.previousFocus =
                document.activeElement;

            this.data.isOpen = true;
            this.data.currentTranslate = 0;

            this.$el
                .removeClass('ts-drawer--closed')
                .addClass('ts-drawer--open');

            this.$el.attr(
                'aria-hidden',
                'false'
            );

            this._lockBody();

            requestAnimationFrame(() => {
                this.$content.css(
                    'transform',
                    'translate3d(0, 0, 0)'
                );

                this.$overlay.css(
                    'opacity',
                    this.options.overlay ? 1 : 0
                );
            });

            this._focusDrawer();

            this._dispatch(
                'open',
                {
                    reason: 'programmatic'
                }
            );

            return this;
        }

        close(reason = 'programmatic') {
            if (!this.data.isOpen) {
                return this;
            }

            this.data.isOpen = false;

            const translate =
                this._closedTranslate();

            const direction =
                this.options.direction;

            let transform;

            if (direction === 'bottom') {
                transform =
                    `translate3d(0, ${translate}px, 0)`;
            } else if (direction === 'top') {
                transform =
                    `translate3d(0, -${translate}px, 0)`;
            } else if (direction === 'left') {
                transform =
                    `translate3d(-${translate}px, 0, 0)`;
            } else {
                transform =
                    `translate3d(${translate}px, 0, 0)`;
            }

            this.$content.css(
                'transform',
                transform
            );

            this.$overlay.css(
                'opacity',
                0
            );

            this.$el.attr(
                'aria-hidden',
                'true'
            );

            const self = this;

            setTimeout(() => {
                if (!self.data.isOpen) {
                    self.$el
                        .removeClass('ts-drawer--open')
                        .addClass('ts-drawer--closed');

                    self._unlockBody();
                    self._restoreFocus();
                }
            }, this.options.animationDuration);

            this._dispatch(
                'close',
                {
                    reason
                }
            );

            return this;
        }

        toggle() {
            return this.data.isOpen
                ? this.close('toggle')
                : this.open();
        }

        isOpen() {
            return this.data.isOpen;
        }

        _focusDrawer() {
            if (!this.options.trapFocus) {
                return;
            }

            const $focusable = this.$content.find(
                'button:not([disabled]),' +
                'a[href],' +
                'input:not([disabled]),' +
                'select:not([disabled]),' +
                'textarea:not([disabled]),' +
                '[tabindex]:not([tabindex="-1"])'
            ).first();

            if ($focusable.length) {
                requestAnimationFrame(() => {
                    $focusable.trigger('focus');
                });
            } else {
                this.$el.trigger('focus');
            }
        }

        _restoreFocus() {
            if (
                this.data.previousFocus &&
                document.contains(
                    this.data.previousFocus
                )
            ) {
                try {
                    this.data.previousFocus.focus();
                } catch (_) { }
            }

            this.data.previousFocus = null;

            return this;
        }

        _lockBody() {
            if (!this.options.modal) {
                return;
            }

            if (
                document.body.classList.contains(
                    'ts-drawer-body-locked'
                )
            ) {
                return;
            }

            this.data.bodyOverflow =
                document.body.style.overflow;

            document.body.classList.add(
                'ts-drawer-body-locked'
            );

            document.body.style.overflow =
                'hidden';

            return this;
        }

        _unlockBody() {
            if (!this.options.modal) {
                return;
            }

            document.body.classList.remove(
                'ts-drawer-body-locked'
            );

            document.body.style.overflow =
                this.data.bodyOverflow || '';

            this.data.bodyOverflow = null;

            return this;
        }

        _dispatch(name, detail) {
            const event = new CustomEvent(
                `drawer:${name}`,
                {
                    bubbles: true,
                    detail: $.extend(
                        true,
                        {
                            instance: this,
                            element: this.$el[0]
                        },
                        detail || {}
                    )
                }
            );

            this.$el[0].dispatchEvent(event);

            return this;
        }

        refresh() {
            this._cacheElements();
            this._setupARIA();

            if (!this.data.isOpen) {
                this._setTranslate(
                    this._closedTranslate(),
                    false
                );
            }

            return this;
        }

        destroy() {
            this.$el
                .removeClass(
                    'ts-drawer ts-drawer--open ts-drawer--closed'
                )
                .removeAttr(
                    'aria-hidden aria-modal aria-labelledby aria-describedby'
                );

            this.$content.css({
                transform: '',
                transition: ''
            });

            this.$overlay.css({
                opacity: ''
            });

            this.$el.off('.ts.drawer');
            this.$content.off('.ts.drawer');
            this.$overlay.off('.ts.drawer');
            this.$close.off('.ts.drawer');

            $(document).off(
                '.ts.drawer'
            );

            this._unlockBody();

            this.$el.removeData(
                instanceName
            );

            this._dispatch(
                'destroy'
            );

            return this;
        }
    }

    PluginDrawer.defaults = {
        direction: 'bottom',

        // Drawer dimensions.
        size: 'auto',
        sideSize: '400px',
        maxHeight: '96vh',
        maxWidth: '90vw',

        // Appearance.
        background: '#ffffff',
        color: '#212529',
        mutedColor: '#6c757d',
        overlayOpacity: 0.5,
        shadow: '0 -8px 30px rgba(0, 0, 0, 0.12)',
        radius: '12px',
        handleColor: '#adb5bd',

        // Spacing.
        headerPadding: '16px 24px 8px',
        bodyPadding: '8px 24px 24px',
        footerPadding: '16px 24px 24px',
        descriptionMargin: '4px 0 0',

        // Animation.
        animationDuration: 300,
        easing: 'cubic-bezier(0.32, 0.72, 0, 1)',

        // Interaction.
        draggable: true,
        dragAnywhere: false,
        dragStartThreshold: 5,
        dismissThreshold: 0.5,
        velocityThreshold: 0.5,

        closeOnEscape: true,
        closeOnOutsideClick: true,

        // Modal behavior.
        modal: true,
        overlay: true,
        trapFocus: true,

        showHandle: true,

        ariaLabel: 'Drawer'
    };

    /**
     * Global stylesheet for body locking.
     */
    if (!document.getElementById('ts-drawer-body-styles')) {
        $('<style>', {
            id: 'ts-drawer-body-styles',
            text: `
                body.ts-drawer-body-locked {
                    overflow: hidden !important;
                }
            `
        }).appendTo(document.head);
    }

    $.extend(themestrap, { PluginDrawer });

    $.fn.themestrapPluginDrawer = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginDrawer($this, opts);
            }
        });
    };

})).apply(this, [window.themestrap, jQuery]);
