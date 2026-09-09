/**
 * Themestrap — PluginHoverEffect
 *
 * Dependency-free hover effects:
 *   - magnetic
 *   - 3d
 *   - magnetic-3d
 *
 * Features:
 *   - Vanilla JS effect engine
 *   - jQuery plugin wrapper for Themestrap compatibility
 *   - requestAnimationFrame animation
 *   - Configurable X/Y magnetic strength
 *   - Configurable 3D rotation
 *   - Configurable perspective
 *   - Configurable scale
 *   - Optional glare
 *   - Preserves the element's original transform
 *   - Pointer and touch support
 *   - Automatic cleanup via destroy()
 *   - Prevents duplicate initialization
 *   - Works with dynamically sized elements
 */

// Hover Effect
(((themestrap = {}, $) => {

    const instanceName = '__hoverEffect';

    class PluginHoverEffect {

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
            this.el = $el[0];

            this
                .setData()
                .setOptions(opts)
                .build();

            return this;
        }

        setData() {

            this.$el.data(instanceName, this);

            return this;
        }

        setOptions(opts) {

            this.options = $.extend(
                true,
                {},
                PluginHoverEffect.defaults,
                opts,
                {
                    wrapper: this.$el
                }
            );

            /**
             * Class-based 3D activation.
             *
             * Maintains compatibility with the previous plugin:
             *
             *   .hover-effect-3d
             */
            if (this.$el.hasClass('hover-effect-3d')) {
                this.options.effect = '3d';
            }

            return this;
        }

        build() {

            this.destroyed = false;

            this.frame = null;

            this.pointer = {
                x: 0,
                y: 0,
                active: false
            };

            this.current = {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1
            };

            this.target = {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1
            };

            /**
             * Preserve the transform that existed before the plugin
             * initialized.
             */
            this.originalTransform =
                this.el.style.transform || '';

            /**
             * Preserve transition as well.
             */
            this.originalTransition =
                this.el.style.transition || '';

            /**
             * Used to avoid adding styles unnecessarily.
             */
            this.originalWillChange =
                this.el.style.willChange || '';

            /**
             * Establish the effect.
             */
            switch (this.options.effect) {

                case 'magnetic':
                    this.magnetic();
                    break;

                case '3d':
                case 'tilt':
                    this.tilt();
                    break;

                case 'magnetic-3d':
                case 'magnetic3d':
                case 'combined':
                    this.magnetic();
                    this.tilt();
                    break;

                case 'none':
                default:
                    break;
            }

            /**
             * Optional glare layer.
             */
            if (this.options.glare) {
                this.createGlare();
            }

            return this;
        }

        magnetic() {

            this.options._magnetic = true;

            this.bindPointerEvents();

            return this;
        }

        tilt() {

            this.options._tilt = true;

            this.bindPointerEvents();

            /**
             * 3D transforms require perspective on the element.
             */
            if (this.options.perspective) {
                this.el.style.transformStyle = 'preserve-3d';
            }

            return this;
        }

        bindPointerEvents() {

            /**
             * Prevent duplicate event registration when both magnetic
             * and tilt are enabled.
             */
            if (this.eventsBound) {
                return this;
            }

            this.eventsBound = true;

            this._pointerMove = (event) => {
                this.handlePointerMove(event);
            };

            this._pointerEnter = (event) => {
                this.handlePointerEnter(event);
            };

            this._pointerLeave = (event) => {
                this.handlePointerLeave(event);
            };

            this.el.addEventListener(
                'pointerenter',
                this._pointerEnter,
                { passive: true }
            );

            this.el.addEventListener(
                'pointermove',
                this._pointerMove,
                { passive: true }
            );

            this.el.addEventListener(
                'pointerleave',
                this._pointerLeave,
                { passive: true }
            );

            return this;
        }

        handlePointerEnter(event) {

            if (this.destroyed) {
                return;
            }

            /**
             * Ignore non-primary pointers.
             */
            if (event.isPrimary === false) {
                return;
            }

            this.pointer.active = true;

            /**
             * Scale slightly when entering if enabled.
             */
            if (this.options.scale !== 1) {
                this.target.scale = this.options.scale;
            }

            this.startAnimation();

            return this;
        }

        handlePointerMove(event) {

            if (
                this.destroyed ||
                event.isPrimary === false
            ) {
                return;
            }

            const rect = this.el.getBoundingClientRect();

            /**
             * Ignore invalid dimensions.
             */
            if (!rect.width || !rect.height) {
                return;
            }

            /**
             * Position relative to the center:
             *
             *   -1 = left/top
             *    0 = center
             *    1 = right/bottom
             */
            const x =
                ((event.clientX - rect.left) / rect.width) * 2 - 1;

            const y =
                ((event.clientY - rect.top) / rect.height) * 2 - 1;

            this.pointer.x = Math.max(-1, Math.min(1, x));
            this.pointer.y = Math.max(-1, Math.min(1, y));

            /**
             * Magnetic movement.
             */
            if (this.options._magnetic) {

                this.target.x =
                    this.pointer.x *
                    this.options.magneticMx *
                    rect.width;

                this.target.y =
                    this.pointer.y *
                    this.options.magneticMy *
                    rect.height;
            }

            /**
             * 3D rotation.
             *
             * Moving the pointer upward tilts the element backward,
             * while moving downward tilts it forward.
             */
            if (this.options._tilt) {

                this.target.rotateX =
                    -this.pointer.y *
                    this.options.magneticDeg;

                this.target.rotateY =
                    this.pointer.x *
                    this.options.magneticDeg;
            }

            /**
             * Glare.
             */
            if (this.options.glare) {
                this.updateGlare();
            }

            this.startAnimation();

            return this;
        }

        handlePointerLeave() {

            if (this.destroyed) {
                return;
            }

            this.pointer.active = false;

            this.target.x = 0;
            this.target.y = 0;

            this.target.rotateX = 0;
            this.target.rotateY = 0;

            this.target.scale = 1;

            this.hideGlare();

            this.startAnimation();

            return this;
        }

        startAnimation() {

            if (this.frame !== null) {
                return;
            }

            const animate = () => {

                this.frame = null;

                if (this.destroyed) {
                    return;
                }

                const ease = this.options.ease;

                this.current.x +=
                    (this.target.x - this.current.x) * ease;

                this.current.y +=
                    (this.target.y - this.current.y) * ease;

                this.current.rotateX +=
                    (this.target.rotateX - this.current.rotateX) * ease;

                this.current.rotateY +=
                    (this.target.rotateY - this.current.rotateY) * ease;

                this.current.scale +=
                    (this.target.scale - this.current.scale) * ease;

                this.render();

                /**
                 * Continue until sufficiently close to the target.
                 */
                if (this.needsAnimation()) {
                    this.frame = requestAnimationFrame(animate);
                }
            };

            this.frame = requestAnimationFrame(animate);

            return this;
        }

        needsAnimation() {

            const threshold = 0.001;

            return (
                Math.abs(this.target.x - this.current.x) > threshold ||
                Math.abs(this.target.y - this.current.y) > threshold ||
                Math.abs(this.target.rotateX - this.current.rotateX) > threshold ||
                Math.abs(this.target.rotateY - this.current.rotateY) > threshold ||
                Math.abs(this.target.scale - this.current.scale) > threshold
            );
        }

        render() {

            const x = this.current.x;
            const y = this.current.y;

            const rotateX = this.current.rotateX;
            const rotateY = this.current.rotateY;

            const scale = this.current.scale;

            /**
             * No effect is active.
             *
             * Restore the original transform instead of forcing a
             * transform onto the element.
             */
            if (
                x === 0 &&
                y === 0 &&
                rotateX === 0 &&
                rotateY === 0 &&
                scale === 1
            ) {

                this.el.style.transform =
                    this.originalTransform;

                return;
            }

            let transform = '';

            /**
             * Preserve the original transform.
             *
             * It is placed first so our transforms can be applied
             * consistently afterward.
             */
            if (this.originalTransform) {
                transform += this.originalTransform + ' ';
            }

            if (this.options._magnetic) {

                transform +=
                    'translate3d(' +
                    x + 'px, ' +
                    y + 'px, 0) ';
            }

            if (this.options._tilt) {

                if (this.options.perspective) {

                    transform +=
                        'perspective(' +
                        this.options.perspective +
                        'px) ';
                }

                transform +=
                    'rotateX(' +
                    rotateX +
                    'deg) ' +
                    'rotateY(' +
                    rotateY +
                    'deg) ';
            }

            if (scale !== 1) {

                transform +=
                    'scale(' +
                    scale +
                    ')';
            }

            this.el.style.transform =
                transform.trim();

            return this;
        }

        createGlare() {

            /**
             * Don't create multiple glare layers.
             */
            if (this.glare) {
                return this;
            }

            const glare = document.createElement('span');

            glare.className =
                this.options.glareClass;

            glare.setAttribute(
                'aria-hidden',
                'true'
            );

            /**
             * Make sure the parent can contain the glare.
             */
            const position =
                window.getComputedStyle(this.el).position;

            if (position === 'static') {
                this.el.style.position = 'relative';
            }

            glare.style.position = 'absolute';
            glare.style.inset = '0';
            glare.style.pointerEvents = 'none';
            glare.style.opacity = '0';
            glare.style.transition =
                'opacity ' +
                this.options.glareTransition +
                'ms ease';
            glare.style.overflow = 'hidden';
            glare.style.zIndex = '1';

            /**
             * The actual highlight is implemented as a radial gradient.
             * No external CSS is required.
             */
            glare.style.background =
                'radial-gradient(' +
                this.options.glareSize +
                '% ' +
                this.options.glareSize +
                '% at 50% 50%, ' +
                'rgba(255,255,255,' +
                this.options.glareOpacity +
                ') 0%, ' +
                'rgba(255,255,255,0) 100%)';

            this.el.appendChild(glare);

            this.glare = glare;

            return this;
        }

        updateGlare() {

            if (!this.glare) {
                return this;
            }

            const x =
                (this.pointer.x + 1) * 50;

            const y =
                (this.pointer.y + 1) * 50;

            this.glare.style.background =
                'radial-gradient(' +
                this.options.glareSize +
                '% ' +
                this.options.glareSize +
                '% at ' +
                x +
                '% ' +
                y +
                '%, rgba(255,255,255,' +
                this.options.glareOpacity +
                ') 0%, rgba(255,255,255,0) 100%)';

            this.glare.style.opacity = '1';

            return this;
        }

        hideGlare() {

            if (this.glare) {
                this.glare.style.opacity = '0';
            }

            return this;
        }

        refresh() {

            /**
             * Nothing is cached that needs recalculating at the moment,
             * but this method gives the plugin a public API for future
             * sizing/state updates.
             */
            return this;
        }

        destroy() {

            if (this.destroyed) {
                return this;
            }

            this.destroyed = true;

            if (this.frame !== null) {

                cancelAnimationFrame(this.frame);

                this.frame = null;
            }

            if (this.eventsBound) {

                this.el.removeEventListener(
                    'pointerenter',
                    this._pointerEnter
                );

                this.el.removeEventListener(
                    'pointermove',
                    this._pointerMove
                );

                this.el.removeEventListener(
                    'pointerleave',
                    this._pointerLeave
                );

                this.eventsBound = false;
            }

            if (this.glare) {

                this.glare.remove();

                this.glare = null;
            }

            this.el.style.transform =
                this.originalTransform;

            this.el.style.transition =
                this.originalTransition;

            this.el.style.willChange =
                this.originalWillChange;

            this.el.style.transformStyle = '';

            this.$el.removeData(instanceName);

            return this;
        }
    }

    PluginHoverEffect.defaults = {

        /**
         * Effect:
         *
         * magnetic
         * 3d
         * magnetic-3d
         * none
         */
        effect: 'magnetic',

        /**
         * Magnetic movement.
         *
         * 0.15 = subtle
         * 0.30 = moderate
         * 0.50 = strong
         *
         * Values are multipliers of the element's dimensions.
         */
        magneticMx: 0.15,
        magneticMy: 0.30,

        /**
         * Maximum 3D rotation in degrees.
         */
        magneticDeg: 12,

        /**
         * Perspective distance for 3D.
         */
        perspective: 800,

        /**
         * Scale while hovering.
         */
        scale: 1,

        /**
         * Animation interpolation.
         *
         * Higher = faster response.
         */
        ease: 0.15,

        /**
         * Optional glare.
         */
        glare: false,
        glareOpacity: 0.20,
        glareSize: 80,
        glareTransition: 150,

        /**
         * Glare CSS class.
         */
        glareClass: 'ts-hover-effect-glare',

        /**
         * Kept for API compatibility with the previous plugin.
         *
         * The old external hover3d plugin is no longer required.
         */
        selector: '.thumb-info, .hover-effect-3d-wrapper',

        /**
         * Kept for backwards compatibility.
         *
         * No external hover3d plugin is used.
         */
        sensitivity: 20
    };

    $.extend(themestrap, { PluginHoverEffect });

    $.fn.themestrapPluginHoverEffect = function(opts) {
        return this.map(function() {
            const $this    = $(this);
            const instance = $this.data(instanceName);

            if (typeof opts === 'string') {
                if (instance && typeof instance[opts] === 'function') instance[opts]();
                return $this;
            }

            if (instance) return instance;
            return new PluginHoverEffect($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);