// Themestrap Module Loader
// A dependency-aware, lazy loader for JS/CSS modules.
(((themestrap = {}, $) => {

    class Loader {
        constructor(opts) {
            this.modules = {};
            this.loaded = new Set();
            this.loading = {};
            this.events = {};
            this.routes = [];

            this.options = $.extend(true, {
                basePath: '',
                mode: 'dev', // 'dev' | 'prod'
                debug: true,
                waitForDOM: true
            }, opts);

            this.debugData = {
                loaded: [],
                timings: {}
            };
        }

        // Define module
        define(name, config) {
            this.modules[name] = $.extend(true, {
                src: null,
                css: null,
                deps: [],
                init: null
            }, config);

            return this;
        }

        // Require module(s)
        require(mods = []) {
            const start = performance.now();

            const promises = mods.map(m => this.load(m));

            return $.when(...promises).then(() => {
                if (this.options.waitForDOM) {
                    return this.domReady();
                }
            }).then(() => {
                this.log(`Loaded modules: ${mods.join(', ')}`);
                this.recordTiming(mods.join(','), start);
            }).fail(err => {
                // Surface failures instead of swallowing them silently.
                this.log(`require() failed for: ${mods.join(', ')}`, err);
            });
        }

        // Load a single module (and its dependencies)
        load(name) {
            if (this.loaded.has(name)) {
                return $.Deferred().resolve().promise();
            }

            if (this.loading[name]) {
                return this.loading[name];
            }

            const mod = this.modules[name];
            if (!mod) {
                console.error(`Module "${name}" not defined`);
                return $.Deferred().reject(new Error(`Module "${name}" not defined`)).promise();
            }

            const deps = $.when(...mod.deps.map(dep => this.load(dep)));

            const promise = deps.then(() => {
                if (this.loaded.has(name)) return;

                const tasks = [];

                // CSS
                if (mod.css) tasks.push(this.loadCSS(mod.css));

                // JS
                if (mod.src) {
                    const file = this.resolveFile(mod.src);
                    tasks.push($.getScript(this.options.basePath + file));
                }

                return $.when(...tasks).then(() => {
                    if (typeof mod.init === 'function') {
                        mod.init(this);
                    }

                    this.loaded.add(name);
                    this.debugData.loaded.push(name);
                    this.emit(`loaded:${name}`, name);
                });
            });

            // Cache the in-flight promise so concurrent requires share it, but
            // clear it on failure so a failed module can be retried rather than
            // returning a permanently-rejected promise forever.
            this.loading[name] = promise;
            promise.fail(() => { delete this.loading[name]; });

            return promise;
        }

        // Auto-scan DOM for [data-module] elements
        scan(context = document) {
            const modules = new Set();

            $(context).find('[data-module]').each((i, el) => {
                // Use attr() not data(): jQuery's .data() coerces a numeric
                // value (e.g. data-module="12") to a Number, and .split() on a
                // Number throws.
                const raw = ($(el).attr('data-module') || '').trim();
                if (!raw) return;
                raw.split(/\s+/).forEach(m => modules.add(m));
            });

            if (modules.size) {
                this.log('Auto-loading:', [...modules]);
                return this.require([...modules]);
            }

            return $.Deferred().resolve().promise();
        }

        // Routes
        route(path, modules) {
            this.routes.push({ path, modules });
            return this;
        }

        runRoutes() {
            const current = window.location.pathname;

            this.routes.forEach(r => {
                const isString = typeof r.path === 'string' && current.includes(r.path);
                const isRegex = r.path instanceof RegExp && r.path.test(current);

                if (isString) this.log(`Route match: ${r.path}`);
                if (isRegex) this.log(`Route match (regex): ${r.path}`);

                if (isString || isRegex) this.require(r.modules);
            });
        }

        // Development/Production switch
        resolveFile(src) {
            if (this.options.mode === 'prod') {
                return src.replace(/\.js$/, '.min.js');
            }
            return src;
        }

        // CSS loader
        loadCSS(href) {
            const full = this.options.basePath + href;

            if ($(`link[href="${full}"]`).length) {
                return $.Deferred().resolve().promise();
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = full;

            const dfd = $.Deferred();

            link.onload = () => dfd.resolve();
            link.onerror = () => {
                console.error(`CSS failed: ${full}`);
                dfd.reject(new Error(`CSS failed: ${full}`));
            };

            document.head.appendChild(link);

            return dfd.promise();
        }

        // Events
        on(evt, fn) {
            (this.events[evt] ||= []).push(fn);
            return this;
        }

        emit(evt, data) {
            (this.events[evt] || []).forEach(fn => fn(data, evt));
            // Wildcard listeners fire for every event (used by the debug panel).
            (this.events['*'] || []).forEach(fn => fn(data, evt));
        }

        // Debug panel
        debugPanel() {
            if (!this.options.debug) return;

            const panel = document.createElement('div');
            panel.className = 'ts-debug-panel';

            const render = () => {
                panel.innerHTML = `
                    <strong>Themestrap Loader</strong><br>
                    Mode: ${this.options.mode}<br>
                    Loaded: ${this.debugData.loaded.join(', ') || 'None'}<br>
                `;
            };

            render();

            document.body.appendChild(panel);

            this.on('*', render);
        }

        // Logging
        log(...args) {
            if (this.options.debug) {
                console.log('[Themestrap]', ...args);
            }
        }

        recordTiming(name, start) {
            const time = (performance.now() - start).toFixed(2);
            this.debugData.timings[name] = time;
        }

        // DOM ready
        domReady() {
            const dfd = $.Deferred();
            $(() => dfd.resolve());
            return dfd.promise();
        }
    }

    // Global (singleton)
    themestrap.loader = function(opts) {
        if (!themestrap._loader) {
            themestrap._loader = new Loader(opts);
        }
        return themestrap._loader;
    };

})).apply(this, [window.themestrap, jQuery]);
