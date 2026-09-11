// Random Images
(((themestrap = {}, $) => {

    const instanceName = '__randomImages';

    let styleRefCount = 0;
    const STYLE_ID = 'ts-random-images-styles';

    class PluginRandomImages {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {

            if (!$el || !$el.length) {
                return false;
            }

            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

            this.timer = null;
            this.stopTimer = null;
            this.transitionTimer = null;

            this.times = 0;
            this.lastIndex = -1;
            this.perImageIndex = -1;

            this.running = false;
            this.destroyed = false;

            this.isInsideLightbox = false;
            this.lightbox = null;

            this.images = [];
            this.currentIndex = -1;

            this
                .setData()
                .setOptions(opts);

            /**
             * A single image requires an image list.
             */
            if (
                this.isImage() &&
                !Array.isArray(this.options.imagesListURL)
            ) {
                this.destroy();
                return false;
            }

            if (!this.build()) {
                this.destroy();
                return false;
            }

            return this;
        }


        /**
         * Core
         */

        isImage() {
            return this.$el[0].tagName.toLowerCase() === 'img';
        }


        setData() {
            this.$el.data(instanceName, this);

            /**
             * Compatibility/debugging reference.
             */
            this.$el[0].__themestrapRandomImages = this;

            return this;
        }


        setOptions(opts) {
            this.options = $.extend(
                true,
                {},
                PluginRandomImages.defaults,
                opts,
                { wrapper: this.$el }
            );

            return this;
        }


        build() {

            /**
             * Don't initialize below the configured width.
             */
            if (
                window.innerWidth <
                Number(this.options.minWindowWidth)
            ) {
                return false;
            }

            if (this.isImage()) {
                this.buildImage();
            } else {
                this.buildWrapper();
            }

            /**
             * Optional global timeout.
             */
            if (
                this.options.stopAfterFewSeconds &&
                Number(this.options.stopAfterFewSeconds) > 0
            ) {
                this.stopTimer = window.setTimeout(() => {
                    this.stop();
                }, Number(this.options.stopAfterFewSeconds));
            }

            return this;
        }


        events() {
            return this;
        }


        /**
         * Single image mode
         */

        buildImage() {

            this.lightbox =
                this.$el[0].closest('.lightbox');

            this.isInsideLightbox =
                !!this.lightbox;

            if (!Array.isArray(this.options.imagesListURL)) {
                this.options.imagesListURL = [];
            }

            /**
             * Store the original image.
             */
            const currentSrc =
                this.$el[0].getAttribute('src');

            if (currentSrc) {
                this.options.imagesListURL.push(currentSrc);
            }

            /**
             * Store the original lightbox target.
             */
            if (
                this.isInsideLightbox &&
                Array.isArray(this.options.lightboxImagesListURL)
            ) {
                const href =
                    this.lightbox.getAttribute('href');

                if (href) {
                    this.options.lightboxImagesListURL.push(href);
                }
            }

            this.lastIndex =
                this.options.imagesListURL.length - 1;

            this.currentIndex =
                this.lastIndex;

            /**
             * Preserve the old sequential-mode behavior.
             */
            if (!this.options.random) {
                this.markLastImageInstance();
            }

            const delay =
                this.options.delay == null
                    ? 3000
                    : Number(this.options.delay);

            const initialDelay =
                this.options.delay == null
                    ? 300
                    : Math.max(0, delay / 3);

            window.setTimeout(() => {

                if (this.destroyed) { return; }

                this.start(
                    () => this.perImageTag(),
                    delay
                );

            }, initialDelay);
        }


        perImageTag() {

            if (this.destroyed) { return this; }

            const images = this.options.imagesListURL;

            if (!Array.isArray(images) || !images.length) {
                return this;
            }

            let index;

            /**
             * Random selection.
             */
            if (this.options.random) {
                index = this.getRandomIndex(images.length);
            }

            /**
             * Sequential selection.
             */
            else {

                index = this.lastIndex - 1;

                if (index < 0) {
                    index = images.length - 1;
                }
            }

            /**
             * Only one possible image.
             */
            if (images.length === 1) { index = 0; }

            this.animateSingleImage(index);

            this.lastIndex = index;
            this.currentIndex = index;
            this.perImageIndex = index;
            this.times++;

            return this;
        }


        animateSingleImage(index) {

            const el = this.$el[0];

            el.classList.add('animated');
            el.classList.remove(this.options.animateIn);
            el.classList.add(this.options.animateOut);

            this.clearTransitionTimer();

            this.transitionTimer = window.setTimeout(() => {

                if (this.destroyed) { return; }

                const src = this.options.imagesListURL[index];
                if (src) { el.setAttribute('src', src); }

                el.classList.remove(this.options.animateOut);
                el.classList.add(this.options.animateIn);

                /**
                 * Keep associated lightbox URL in sync.
                 */
                if (
                    this.isInsideLightbox &&
                    this.lightbox &&
                    Array.isArray(this.options.lightboxImagesListURL)
                ) {
                    const href =
                        this.options.lightboxImagesListURL[index];

                    if (href) {
                        this.lightbox.setAttribute('href', href);
                    }
                }

            }, Number(this.options.animationDelay));
        }


        getRandomIndex(length) {

            if (length <= 1) { return 0; }

            let index;

            do {
                index = Math.floor(Math.random() * length);
            } while (index === this.lastIndex);

            return index;
        }


        /**
         * Wrapper mode
         *
         * IMPORTANT:
         *
         * Wrapper mode no longer changes image src values.
         *
         * Every image remains loaded in the DOM and is stacked
         * on top of the previous image. The plugin simply changes
         * which image is visible.
         */

        buildWrapper() {

            this.images = Array.from(
                this.$el[0].querySelectorAll('img')
            );

            if (!this.images.length) { return; }

            /**
             * Inject structural CSS lazily.
             */
            this.injectStyles();

            /**
             * Prepare the wrapper.
             */
            this.$el[0].classList.add('ts-random-images-wrapper');

            /**
             * Prepare each image.
             */
            this.images.forEach((image, index) => {

                image.classList.add('animated', 'ts-random-image');

                /**
                 * The first image is initially visible.
                 * All others begin hidden.
                 */
                if (index === 0) {

                    image.classList.add('ts-random-image-active');
                    image.classList.remove(this.getAnimateOut(image));

                } else {

                    image.classList.add('ts-random-image-hidden');
                    image.classList.remove(this.getAnimateIn(image));
                }
            });

            this.currentIndex = 0;
            this.lastIndex = 0;
            this.perImageIndex = 0;

            /**
             * Optional custom initial image.
             */
            if (
                this.options.startIndex !== false &&
                Number.isInteger(Number(this.options.startIndex))
            ) {
                const start = Number(this.options.startIndex);

                if (start >= 0 && start < this.images.length) {
                    this.showWrapperImage(start, false);
                }
            }

            /**
             * Wrapper mode needs a delay long enough to allow
             * the longest configured image delay to complete.
             */
            const delay =
                this.options.delay != null
                    ? Number(this.options.delay)
                    : this.getPerWrapperHighDelay();

            const actualDelay = delay > 0 ? delay : 3000;

            window.setTimeout(() => {

                if (this.destroyed) { return; }

                this.start(() => this.perWrapper(), actualDelay);

            }, 300);
        }


        perWrapper() {

            if (this.destroyed || !this.images.length) {
                return this;
            }

            let index;

            /**
             * Random wrapper rotation.
             */
            if (this.options.random) {
                index = this.getRandomIndex(this.images.length);
            }

            /**
             * Sequential wrapper rotation.
             */
            else {

                index = this.currentIndex + 1;

                if (index >= this.images.length) { index = 0; }
            }

            this.showWrapperImage(index, true);

            this.lastIndex = this.currentIndex;
            this.currentIndex = index;
            this.perImageIndex = index;
            this.times++;

            return this;
        }


        showWrapperImage(index, animate = true) {

            if (index < 0 || index >= this.images.length) {
                return this;
            }

            const current = this.images[this.currentIndex];
            const next = this.images[index];

            /**
             * Nothing to do if we're already displaying this image.
             */
            if (current === next && this.currentIndex === index) {
                return this;
            }

            const currentOut = current
                ? this.getAnimateOut(current)
                : this.options.animateOut;

            const nextIn = this.getAnimateIn(next);

            /**
             * Make the next image visible underneath/over the current image.
             */
            next.classList.remove('ts-random-image-hidden');
            next.classList.add('ts-random-image-active');

            if (animate) {

                next.classList.add(nextIn);

                if (current) {
                    current.classList.remove(this.getAnimateIn(current));
                    current.classList.add(currentOut);
                }

                /**
                 * After the transition, leave the new image active
                 * and completely hide the old image.
                 */
                this.clearTransitionTimer();

                this.transitionTimer = window.setTimeout(() => {

                    if (this.destroyed) { return; }

                    if (current) {
                        current.classList.remove(currentOut);
                        current.classList.remove('ts-random-image-active');
                        current.classList.add('ts-random-image-hidden');
                    }

                    next.classList.remove(nextIn);
                    next.classList.add('ts-random-image-active');

                }, Number(this.options.animationDelay));

            } else {

                /**
                 * Instant initialization.
                 */
                this.images.forEach((image, imageIndex) => {

                    image.classList.toggle(
                        'ts-random-image-active',
                        imageIndex === index
                    );

                    image.classList.toggle(
                        'ts-random-image-hidden',
                        imageIndex !== index
                    );

                    image.classList.remove(
                        this.getAnimateIn(image),
                        this.getAnimateOut(image)
                    );
                });
            }

            return this;
        }


        getAnimateIn(image) {
            return (
                image.dataset.rimageAnimateIn ||
                this.options.animateIn
            );
        }


        getAnimateOut(image) {
            return (
                image.dataset.rimageAnimateOut ||
                this.options.animateOut
            );
        }


        /**
         * Wrapper delay helpers
         */

        getPerWrapperHighDelay() {

            let delay = 0;

            this.images.forEach(image => {

                const value = Number(image.dataset.rimageDelay);

                if (Number.isFinite(value) && value > delay) {
                    delay = value;
                }
            });

            return delay;
        }


        /**
         * Sequential coordination
         */

        markLastImageInstance() {

            const elements =
                document.querySelectorAll('.plugin-random-images');

            elements.forEach((element, index) => {
                element.classList.toggle(
                    'the-last',
                    index === elements.length - 1
                );
            });
        }


        /**
         * CSS injection
         *
         * Inject structural CSS lazily from build() rather than
         * at script parse time. A ref-count ensures the stylesheet
         * is removed only when the last wrapper-mode instance is
         * destroyed.
         */

        injectStyles() {

            if (!document.getElementById(STYLE_ID)) {

                const style = document.createElement('style');

                style.id = STYLE_ID;

                style.textContent = `
                    .ts-random-images-wrapper {
                        position: relative;
                        overflow: hidden;
                    }

                    .ts-random-images-wrapper
                    .ts-random-image {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .ts-random-images-wrapper
                    .ts-random-image:first-child {
                        position: absolute;
                    }

                    .ts-random-images-wrapper
                    .ts-random-image-active {
                        z-index: 2;
                        visibility: visible;
                        pointer-events: auto;
                    }

                    .ts-random-images-wrapper
                    .ts-random-image-hidden {
                        z-index: 1;
                        visibility: hidden;
                        pointer-events: none;
                    }
                `;

                document.head.appendChild(style);
            }

            styleRefCount++;

            return this;
        }


        removeStyles() {

            styleRefCount = Math.max(0, styleRefCount - 1);

            if (styleRefCount === 0) {

                const style = document.getElementById(STYLE_ID);

                if (style) { style.remove(); }
            }

            return this;
        }


        /**
         * Lifecycle
         */

        start(callback = null, delay = 1000) {

            this.stopTimerLoop();

            this.running = true;

            const timeout = () => {

                if (this.destroyed || !this.running) { return; }

                if (typeof callback === 'function') {
                    callback.call(this);
                }

                /**
                 * Stop conditions.
                 */
                if (this.shouldStop()) {
                    this.stop();
                    return;
                }

                /**
                 * Sequential image coordination.
                 */
                if (!this.options.random) {

                    if (
                        this.$el[0].classList.contains('the-last')
                    ) {
                        document.dispatchEvent(
                            new CustomEvent('rimages.start', {
                                detail: { source: this.$el[0] }
                            })
                        );

                    } else {
                        this.stop();
                        return;
                    }
                }

                this.timer = window.setTimeout(
                    timeout,
                    Number(delay) || 1000
                );
            };

            timeout();

            return this;
        }


        stop() {
            this.running = false;
            this.stopTimerLoop();
            return this;
        }


        stopTimerLoop() {

            if (this.timer !== null) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }

            return this;
        }


        clearTransitionTimer() {

            if (this.transitionTimer !== null) {
                window.clearTimeout(this.transitionTimer);
                this.transitionTimer = null;
            }

            return this;
        }


        shouldStop() {

            /**
             * Stop at image index.
             */
            if (
                this.options.stopAtImageIndex !== false &&
                this.options.stopAtImageIndex !== null &&
                this.options.stopAtImageIndex !== '' &&
                Number(this.options.stopAtImageIndex) === this.perImageIndex
            ) {
                return true;
            }

            /**
             * Stop after X rotations.
             */
            if (
                this.options.stopAfterXTimes !== false &&
                this.options.stopAfterXTimes !== null &&
                Number(this.options.stopAfterXTimes) > 0 &&
                this.times >= Number(this.options.stopAfterXTimes)
            ) {
                return true;
            }

            return false;
        }


        /**
         * Utilities
         */

        shuffle(array) {

            for (let i = array.length - 1; i > 0; i--) {

                const j = Math.floor(Math.random() * (i + 1));

                [array[i], array[j]] = [array[j], array[i]];
            }

            return array;
        }


        /**
         * Destroy
         */

        destroy() {

            this.stop();

            if (this.stopTimer !== null) {
                window.clearTimeout(this.stopTimer);
                this.stopTimer = null;
            }

            this.clearTransitionTimer();

            /**
             * Remove plugin-added classes from wrapper images
             * and decrement the stylesheet ref-count.
             */
            if (!this.isImage()) {

                this.images.forEach(image => {
                    image.classList.remove(
                        'animated',
                        'ts-random-image',
                        'ts-random-image-active',
                        'ts-random-image-hidden'
                    );
                });

                this.$el[0].classList.remove(
                    'ts-random-images-wrapper'
                );

                this.removeStyles();
            }

            this.destroyed = true;

            this.$el.removeData(instanceName);

            delete this.$el[0].__themestrapRandomImages;

            return this;
        }
    }


    /**
     * Defaults
     */

    PluginRandomImages.defaults = {

        minWindowWidth: 0,

        random: true,

        imagesListURL: null,

        lightboxImagesListURL: null,

        delay: null,

        /** Time between changing the animation state. */
        animationDelay: 1000,

        animateIn: 'fadeIn',

        animateOut: 'fadeOut',

        /** Optional starting image for wrapper mode. */
        startIndex: false,

        /** Stop when this image index is reached. */
        stopAtImageIndex: false,

        /** Stop after this many milliseconds. */
        stopAfterFewSeconds: false,

        /** Stop after this many rotations. */
        stopAfterXTimes: false,

        accY: 0
    };


    /**
     * Expose on themestrap namespace
     */

    $.extend(themestrap, {
        PluginRandomImages
    });


    /**
     * jQuery bridge
     */

    $.fn.themestrapPluginRandomImages = function (opts) {
        return this.map(function () {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginRandomImages($this, opts);
        });
    };


    /**
     * Static helpers
     */

    PluginRandomImages.init = function (element, options = {}) {
        const $el = $(element);
        if (!$el.length) { return false; }
        return new PluginRandomImages($el, options);
    };


    PluginRandomImages.initAll = function (selector, options = {}) {
        return $(selector)
            .toArray()
            .map(el => new PluginRandomImages($(el), options))
            .filter(Boolean);
    };


    PluginRandomImages.getInstance = function (element) {
        const $el = $(element);
        return $el.length ? ($el.data(instanceName) || null) : null;
    };


    /**
     * Sequential-mode coordination
     */

    document.addEventListener('rimages.start', event => {

        const source = event.detail?.source;

        document
            .querySelectorAll('.plugin-random-images')
            .forEach(element => {

                if (element === source) { return; }

                const instance = $(element).data(instanceName);

                if (!instance || instance.options.random) { return; }

                instance.start(
                    () => {
                        if (instance.isImage()) {
                            instance.perImageTag();
                        } else {
                            instance.perWrapper();
                        }
                    },
                    instance.options.delay == null
                        ? 3000
                        : Number(instance.options.delay)
                );
            });
    });


})).apply(this, [window.themestrap, jQuery]);
