/**
 * Themestrap Module Loader
 * Decides WHICH plugin/vendor files reach the page, resolves their dependency
 * order, fetches each once (HTTP-cacheable), then runs the same intObsInit /
 * dynIntObsInit wiring themestrap.init.js would — so loaded plugins activate.
 *
 * Load AFTER themestrap.js. For any plugin the loader manages, do NOT also
 * include its file or wire it in themestrap.init.js — the loader owns it.
 */
(((themestrap = {}, $) => {

    class Loader {
        constructor(opts) {
            this.modules = {};
            this.loaded = new Set();
            this.loading = {};
            this.events = {};

            this.options = $.extend(true, {
                basePath: '',
                mode: 'dev'   // 'dev' | 'prod'
            }, opts);
        }

        // Generic module: a JS file, a CSS file, deps, and/or an init callback.
        define(name, config) {
            this.modules[name] = $.extend(true, {
                src: null, css: null, deps: [], init: null
            }, config);
            return this;
        }

        // Themestrap-plugin module: same as define(), but init is generated to
        // run the framework's own lazy-init wiring once the file has loaded.
        //   selector      — element selector the plugin binds to
        //   method        — jQuery plugin method name (e.g. 'themestrapPluginCarousel')
        //   strategy      — 'intObs' | 'dynIntObs' | 'event'
        //   event         — required when strategy === 'event' (e.g. 'mouseover.trigger.lightbox')
        //   defaultsClass — required when strategy === 'dynIntObs' (e.g. 'PluginAnimate')
        //   manual        — respect .manual opt-out (default true)
        //   init          — optional extra setup, run after activation
        definePlugin(name, cfg) {
            const extra = cfg.init;
            return this.define(name, {
                src: cfg.src || null,
                css: cfg.css || null,
                deps: cfg.deps || [],
                init: () => {
                    this.activatePlugin(name, cfg);
                    if (typeof extra === 'function') extra(this);
                }
            });
        }

        // Require module(s): resolve graph, fetch, init, settle after DOM ready.
        require(mods = []) {
            const promises = mods.map(m => this.load(m));
            return $.when(...promises)
                .then(() => this.domReady())
                .then(() => this.log(`Loaded: ${mods.join(', ')}`))
                .fail(err => this.log(`require() failed for: ${mods.join(', ')}`, err));
        }

        // Load one module and its dependencies (once).
        load(name) {
            if (this.loaded.has(name)) return $.Deferred().resolve().promise();
            if (this.loading[name]) return this.loading[name];

            const mod = this.modules[name];
            if (!mod) {
                console.error(`[Themestrap] Module "${name}" not defined`);
                return $.Deferred().reject(new Error(`Module "${name}" not defined`)).promise();
            }

            const deps = $.when(...mod.deps.map(dep => this.load(dep)));

            const promise = deps.then(() => {
                if (this.loaded.has(name)) return;

                const tasks = [];
                if (mod.css) tasks.push(this.loadCSS(mod.css));
                if (mod.src) tasks.push(this.loadScript(mod.src));

                return $.when(...tasks).then(() => {
                    if (typeof mod.init === 'function') mod.init(this);
                    this.loaded.add(name);
                    this.emit(`loaded:${name}`, name);
                });
            });

            // Share the in-flight promise; clear on failure so it can be retried.
            this.loading[name] = promise;
            promise.fail(() => { delete this.loading[name]; });
            return promise;
        }

        // Run Themestrap's own init wiring for a freshly-loaded plugin. This is
        // the same guarded call themestrap.init.js makes, but at load time so
        // plugins fetched after DOM ready still get their IntersectionObserver.
        activatePlugin(name, cfg) {
            if (!themestrap.fn) {
                console.error(`[Themestrap] themestrap.fn unavailable — cannot activate "${name}"`);
                return;
            }
            const { method, strategy = 'intObs' } = cfg;
            if (typeof $.fn[method] !== 'function') {
                console.error(`[Themestrap] ${method}() not defined after loading "${name}"`);
                return;
            }

            // .manual opt-out must live on the selector string.
            const sel = cfg.manual === false ? cfg.selector : `${cfg.selector}:not(.manual)`;
            if (!$(sel).length) return;

            switch (strategy) {
                case 'dynIntObs': {
                    // Pass the class's *live* static defaults, not a copy —
                    // dynIntObsInit reads forceInit/accY off it directly.
                    const defs = (themestrap[cfg.defaultsClass] && themestrap[cfg.defaultsClass].defaults) || {};
                    themestrap.fn.dynIntObsInit(sel, method, defs);
                    break;
                }
                case 'event':
                    themestrap.fn.execOnceThroughEvent(sel, cfg.event, function () {
                        const opts = themestrap.fn.getOptions($(this).data('plugin-options'));
                        $(this)[method](opts || undefined);
                    });
                    break;
                case 'intObs':
                default:
                    themestrap.fn.intObsInit(sel, method);
            }
            this.log(`Activated ${method} on "${sel}"`);
        }

        // Auto-load whatever the rendered page declares via [data-module].
        scan(context = document) {
            const modules = new Set();
            $(context).find('[data-module]').each((i, el) => {
                // attr() not data(): data() coerces numeric values to Number.
                const raw = ($(el).attr('data-module') || '').trim();
                if (raw) raw.split(/\s+/).forEach(m => modules.add(m));
            });
            return modules.size
                ? this.require([...modules])
                : $.Deferred().resolve().promise();
        }

        resolveFile(src) {
            return this.options.mode === 'prod' ? src.replace(/\.js$/, '.min.js') : src;
        }

        // HTTP-cacheable script fetch. This keeps the browser cache
        // which is the whole point of loading lazily.
        loadScript(src) {
            const url = this.options.basePath + this.resolveFile(src);
            return $.ajax({ url, dataType: 'script', cache: true });
        }

        loadCSS(href) {
            const full = this.options.basePath + href;
            if ($(`link[href="${full}"]`).length) return $.Deferred().resolve().promise();

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = full;

            const dfd = $.Deferred();
            link.onload = () => dfd.resolve();
            link.onerror = () => {
                console.error(`[Themestrap] CSS failed: ${full}`);
                dfd.reject(new Error(`CSS failed: ${full}`));
            };
            document.head.appendChild(link);
            return dfd.promise();
        }

        on(evt, fn) { (this.events[evt] ||= []).push(fn); return this; }
        emit(evt, data) { (this.events[evt] || []).forEach(fn => fn(data, evt)); }

        domReady() {
            const dfd = $.Deferred();
            $(() => dfd.resolve());
            return dfd.promise();
        }

        log(...args) {
            if (this.options.mode !== 'prod') console.log('[Themestrap]', ...args);
        }
    }

    // Singleton accessor.
    themestrap.loader = function (opts) {
        if (!themestrap._loader) themestrap._loader = new Loader(opts);
        return themestrap._loader;
    };

})).apply(this, [window.themestrap, jQuery]);
