// Splash Screen
(((themestrap = {}, $) => {
    const instanceName = '__splashScreen';

    const CACHE_KEY = 'ts_splashscreen_cache';

    // THREE.js CDN — r128 is the last build that ships as a classic module
    // compatible with a bare import() without an import-map.
    const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

    // Page-level singleton + in-flight promise — mirrors PluginHighlight's
    // _hljs / _hljsLoading pattern so multiple SplashScreen instances on the
    // same page never race to fetch THREE more than once.
    themestrap._three        = null;
    themestrap._threeLoading = null;

    class PluginSplashScreen {

        constructor($el, opts) {
            return this.initialize($el, opts);
        }

        initialize($el, opts) {
            if ($el.data(instanceName)) {
                return $el.data(instanceName);
            }

            this.$el = $el;

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
            const attrOpts = themestrap.fn.getOptions(this.$el.data('plugin-options'));

            this.options = $.extend(true, {}, PluginSplashScreen.defaults, opts, attrOpts, {
                wrapper: this.$el
            });

            return this;
        }

        async build() {
            const self = this;
            const o    = self.options;

            // Internal state
            self._files           = Array.isArray(o.files) ? o.files : [];
            self._fileCount       = self._files.length;
            self._downloadedCount = 0;
            self._threads         = 0;
            self._maxThreads      = o.threads || 1;
            self._queue           = [];
            self._loadedFiles     = [];
            self._hasFailed       = false;

            // StorageBin instance for file caching
            self._cache = themestrap.fn.createStorage({ backend: o.cacheBackend });

            // Resolve the optional ProgressBar instance once up front
            self._progressBar = self._resolveProgressBar();

            // Load THREE and build the ribbon before anything else renders,
            // but only when the option is enabled. Skipping the import entirely
            // when ribbon is false means pages that don't use the ribbon never
            // pay the THREE.js network cost.
            if (o.ribbon) {
                try {
                    await self.loadTHREE();
                    self._buildRibbon();
                } catch (e) {
                    self._debug('THREE.js failed to load — ribbon background skipped.', e);
                }
            }

            // Seed loadedFiles list
            self._files.forEach(file => {
                if (typeof file === 'object') {
                    self._loadedFiles.push({ path: file.url, callback: file.callback });
                } else {
                    self._loadedFiles.push({ path: file, callback: null });
                }
            });

            // Bust cache if fresh mode requested
            if (o.fresh) {
                self._cache.del(CACHE_KEY);
            }

            // Hydrate stored cache
            try {
                self._storedCache = self._cache.get(CACHE_KEY) || null;
            } catch (e) {
                self._cache.del(CACHE_KEY);
                self._storedCache = null;
            }

            // Kick off downloads
            self._loadedFiles.forEach(f => {
                self._downloadFile(f.path);
            });

            return this;
        }

        // Loads THREE.js from CDN as an ES module. Coalesces concurrent calls
        // so the network request fires at most once per page, regardless of how
        // many SplashScreen instances request it.
        async loadTHREE() {
            if (themestrap._three) {
                return themestrap._three;
            }

            if (!themestrap._threeLoading) {
                themestrap._threeLoading = import(THREE_CDN).then(m => {
                    themestrap._three = m;
                    return themestrap._three;
                });
            }

            return themestrap._threeLoading;
        }

        // THREE.js animated ribbon background. Only called after loadTHREE()
        // resolves, so themestrap._three is guaranteed to be populated here.
        _buildRibbon() {
            const self      = this;
            const THREE     = themestrap._three;
            const container = self.$el[0];

            self._scene    = new THREE.Scene();
            self._camera   = new THREE.PerspectiveCamera(75, 1, 0.1, 10000);
            self._camera.position.z = 2;

            self._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            container.appendChild(self._renderer.domElement);

            self._ribbon = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 1, 128, 128),
                new THREE.ShaderMaterial({
                    uniforms: { time: { value: 1.0 } },
                    vertexShader: `
                        varying vec3 vEC;
                        uniform float time;

                        float iqhash(float n) {
                            return fract(sin(n) * 43758.5453);
                        }

                        float noise(vec3 x) {
                            vec3 p = floor(x);
                            vec3 f = fract(x);
                            f = f * f * (3.0 - 2.0 * f);
                            float n = p.x + p.y * 57.0 + 113.0 * p.z;
                            return mix(mix(mix(iqhash(n), iqhash(n + 1.0), f.x),
                                   mix(iqhash(n + 57.0), iqhash(n + 58.0), f.x), f.y),
                                   mix(mix(iqhash(n + 113.0), iqhash(n + 114.0), f.x),
                                   mix(iqhash(n + 170.0), iqhash(n + 171.0), f.x), f.y), f.z);
                        }

                        float xmb_noise2(vec3 x) {
                            return cos(x.z * 4.0) * cos(x.z + time / 10.0 + x.x);
                        }

                        void main() {
                            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            vec3 v = vec3(pos.x, 0.0, pos.y);
                            vec3 v2 = v;
                            vec3 v3 = v;

                            v.y = xmb_noise2(v2) / 8.0;
                            v3.x -= time / 5.0;
                            v3.x /= 4.0;
                            v3.z -= time / 10.0;
                            v3.y -= time / 100.0;
                            v.z -= noise(v3 * 7.0) / 15.0;
                            v.y -= noise(v3 * 7.0) / 15.0 + cos(v.x * 2.0 - time / 2.0) / 5.0 - 0.3;

                            vEC = v;
                            gl_Position = vec4(v, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        varying vec3 vEC;

                        void main() {
                            const vec3 up = vec3(0.0, 0.0, 1.0);
                            vec3 x = dFdx(vEC);
                            vec3 y = dFdy(vEC);
                            vec3 normal = normalize(cross(x, y));
                            float c = 1.0 - dot(normal, up);
                            c = (1.0 - cos(c * c)) / 3.0;
                            gl_FragColor = vec4(1.0, 1.0, 1.0, c * 1.5);
                        }
                    `,
                    extensions: {
                        derivatives:      true,
                        fragDepth:        false,
                        drawBuffers:      false,
                        shaderTextureLOD: false
                    },
                    side:        THREE.DoubleSide,
                    transparent: true,
                    depthTest:   false,
                })
            );

            self._scene.add(self._ribbon);
            self._resizeRibbon();

            $(window).on('resize.splashscreen', () => { self._resizeRibbon(); });

            self._animateRibbon();
        }

        _resizeRibbon() {
            const self = this;
            const { offsetWidth: w, offsetHeight: h } = self.$el[0];
            self._renderer.setSize(w, h);
            self._renderer.setPixelRatio(devicePixelRatio);
            self._camera.aspect = w / h;
            self._camera.updateProjectionMatrix();
            self._ribbon.scale.set(self._camera.aspect * 1.55, 0.75, 1);
        }

        _animateRibbon() {
            const self = this;
            self._ribbon.material.uniforms.time.value += 0.01;
            self._renderer.render(self._scene, self._camera);
            self._rafId = requestAnimationFrame(() => { self._animateRibbon(); });
        }

        // Resolve the progressBar option to a PluginProgressBar instance or null.
        // Accepts a CSS selector string, a jQuery object, or a DOM element.
        // Validates that the resolved element actually holds a PluginProgressBar
        // instance before storing it — mismatched selectors degrade silently.
        _resolveProgressBar() {
            const ref = this.options.progressBar;
            if (!ref) { return null; }

            let $target;
            if (typeof ref === 'string') {
                $target = $(ref);
            } else if (ref instanceof $) {
                $target = ref;
            } else if (ref && ref.nodeType) {
                $target = $(ref);
            } else {
                return null;
            }

            const inst = $target.data('__pluginProgressBar');
            if (!inst) {
                this._debug('progressBar option resolved to an element with no PluginProgressBar instance.');
                return null;
            }

            return inst;
        }

        // Drive the ProgressBar to the current completion percentage.
        // Called after every file completes (cache hit or XHR).
        _tickProgressBar() {
            if (!this._progressBar) { return; }
            const pct = Math.round((this._downloadedCount / this._fileCount) * 100);
            this._progressBar.set(pct);
        }

        _fromCache(path) {
            const cache = this._storedCache;
            if (!cache || !Array.isArray(cache.objects)) { return null; }
            return cache.objects.find(o => o.path === path) || null;
        }

        _downloadFile(path) {
            const self = this;

            if (self._threads >= self._maxThreads) {
                self._queue.push(path);
                return;
            }

            if (self._hasFailed) { return; }

            const cached = self._fromCache(path);
            if (cached) {
                const delay = Math.floor(Math.random() * 750);
                setTimeout(() => { self._fromCacheFile(cached); }, delay);
                return;
            }

            self._threads++;

            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (self._hasFailed) { return; }
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const delay = Math.floor(Math.random() * 1500);
                    setTimeout(() => { self._processResponse(path, xhr); }, delay);
                } else if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status < 600) {
                    self._processFailure(path);
                }
            };
            xhr.open('GET', path, true);
            xhr.send(null);
        }

        _fromCacheFile(cached) {
            const self = this;
            const o    = self.options;
            const item = self._loadedFiles.find(f => f.path === cached.path);
            if (!item) { return; }

            item.data   = cached.data;
            item.cached = true;

            self._downloadedCount++;
            self._tickProgressBar();
            self._debug('from cache:', cached.path);

            if (typeof item.callback === 'function') {
                item.callback.call(self, cached.path, cached.data);
            }
            if (typeof o.onLoaded === 'function') {
                o.onLoaded.call(self, self._downloadedCount, self._fileCount, cached.path, cached.data);
            }

            self._checkComplete();
        }

        _processResponse(path, xhr) {
            const self = this;
            const o    = self.options;
            const item = self._loadedFiles.find(f => f.path === path);
            if (!item) { return; }

            item.data = xhr.responseText;
            self._downloadedCount++;
            self._threads--;
            self._tickProgressBar();

            if (typeof item.callback === 'function') {
                item.callback.call(self, path);
            }
            if (typeof o.onLoaded === 'function') {
                o.onLoaded.call(self, self._downloadedCount, self._fileCount, path);
            }

            self._checkComplete();
            self._nextQueue();
        }

        _processFailure(path) {
            const self = this;
            const o    = self.options;

            self._debug('FAILED:', path);
            self._hasFailed = true;

            if (typeof o.onError === 'function') {
                o.onError.call(self, path);
            }
        }

        _nextQueue() {
            const self = this;
            if (self._queue.length > 0) {
                self._downloadFile(self._queue.pop());
            }
        }

        _checkComplete() {
            const self = this;
            if (self._downloadedCount !== self._fileCount) { return; }
            self._runScripts();
            self._store();
        }

        _runScripts() {
            const self = this;
            const o    = self.options;

            self._loadedFiles.forEach(f => { self._execute(f); });

            if (typeof o.onSuccess === 'function') {
                o.onSuccess.call(self);
            }
        }

        _execute(loaded) {
            if (!loaded.data) { return; }

            const ext = loaded.path.split('.').pop().toLowerCase();

            if (ext === 'js') {
                const script = document.createElement('script');
                script.type  = 'text/javascript';
                script.text  = loaded.data;
                document.body.appendChild(script);
            } else if (ext === 'css') {
                const style     = document.createElement('style');
                style.type      = 'text/css';
                style.innerHTML = loaded.data;
                document.head.appendChild(style);
            }
        }

        _store() {
            const self    = this;
            const payload = {
                objects: self._loadedFiles.map(f => ({
                    path: f.path,
                    data: f.data
                }))
            };
            try {
                self._cache.set(CACHE_KEY, payload);
            } catch (e) {
                self._debug('Could not cache files:', e.message);
            }
        }

        _debug(...args) {
            if (this.options.debug) {
                console.log('[PluginSplashScreen]', ...args);
            }
        }

        // Public: retrieve downloaded file content by path
        getFile(path) {
            const item = this._loadedFiles.find(f => f.path === path);
            return item ? item.data : null;
        }

        destroy() {
            const self = this;

            if (self._rafId) {
                cancelAnimationFrame(self._rafId);
            }

            if (self._renderer) {
                self._renderer.dispose();
            }

            $(window).off('resize.splashscreen');

            self.$el.empty().removeData(instanceName);

            return this;
        }
    }

    PluginSplashScreen.defaults = {
        files:        [],                // array of URL strings or { url, callback } objects
        threads:      1,                 // max concurrent XHR downloads
        fresh:        false,             // bust StorageBin cache on init
        ribbon:       false,             // lazy-load THREE.js and render the animated ribbon
        progressBar:  null,              // selector, jQuery object, or DOM element of a PluginProgressBar instance
        debug:        false,             // console logging
        cacheBackend: 'localStorage',    // StorageBin backend for file caching
        onSuccess:    null,              // function() — all files loaded and executed
        onError:      null,              // function(path) — a file failed to load
        onLoaded:     null,              // function(current, total, path, data)
    };

    $.extend(themestrap, { PluginSplashScreen });

    $.fn.themestrapPluginSplashScreen = function(opts) {
        return this.map(function() {
            const $this = $(this);

            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            }

            return new PluginSplashScreen($this, opts);
        });
    };

})).apply(this, [window.themestrap, jQuery]);
