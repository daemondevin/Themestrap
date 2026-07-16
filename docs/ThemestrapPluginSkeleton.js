/**
 * Themestrap MyPlugin Plugin
 * Short, concise description of this plugin.
 *
 * Part of the Themestrap component library.
 * https://github.com/daemondevin/Themestrap
 *
 * Markup anatomy
 *   <!-- Plugin root element -->
 *   <div id="myElement" class=""
 *        data-plugin-myplugin
 *        data-plugin-options='{"option":"value","param":true}'>
 *
 *     <!-- Anything else -->
 *     <div data-myplugin-child>
 *
 *       <span>MyPlugin</span>
 *
 *     </div>
 *
 *   </div>
 *
 * Options
 *
 *   option            "this"|"that"   what this option does      "default"
 *   param             boolean         switch this param on/off   true
 *
 * Public API 
 *
 *   // Retrieve an existing instance
 *   const instance = $('#myElement').data('__myPlugin');
 *    
 *   // Call a public method
 *   instance.build();
 *   instance.destroy();
 *    
 *   // Check whether the plugin has been initialized
 *   if ($('#myElement').data('__myPlugin')) {
 *       console.log('Plugin is active');
 *   }
 *
 * Events
 *
 *   myplugin.destroy   fired on [data-plugin-myplugin] after destroy()
 *   myplugin.rebuild   fired on [data-plugin-myplugin] after build()
 *
 *   Both events carry { detail: { index, instance } }
 *
 * Init.js wiring 
 *
 *   if ($.isFunction($.fn['themestrapPluginMyPlugin']) && $('[data-plugin-my-plugin]').length) {
 *       themestrap.fn.dynIntObsInit('[data-plugin-my-plugin]:not(.manual)', 'themestrapPluginMyPlugin', themestrap.PluginMyPlugin.defaults);
 *   }
 */
// My Plugin
(((themestrap = {}, $) => {
 
    const instanceName = '__myPlugin';
    
    // MyPlugin stylesheet — injected lazily on first init (see
    // injectStyles), so merely loading this script never adds CSS to pages
    // that don't actually use this plugin.
    const STYLE_ID = 'ts-myplugin-styles';
    const CSS_TEXT = ``;

    // Inject the stylesheet only when the plugin is actually used (called from
    // build()). Keeps the CSS out of pages that merely load the script.
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    class PluginMyPlugin {
 
        constructor($el, opts) {
            return this.initialize($el, opts);
        }
 
        initialize($el, opts) {
            // Re-init guard — bail if already initialized on this element
            if ($el.data(instanceName)) {
                return this;
            }
 
            this.$el = $el;
 
            // Store original HTML if destroy() needs to restore it
            this.initialHTML = $el.html();
 
            this
                .setData()
                .setOptions(opts)
                .build()
                .events();   // remove this line if no custom events needed
 
            return this;
        }
 
        setData() {
            this.$el.data(instanceName, this);
            return this;
        }
 
        setOptions(opts) {
            this.options = $.extend(true, {}, PluginMyPlugin.defaults, opts, {
                wrapper: this.$el
            });
            return this;
        }
 
        build() {
            const self = this;
            
            injectCSS();
 
            // Optional: skip below minimum viewport width
            if ($(window).width() < self.options.minWindowWidth) {
                return this;
            }
 
            // Your implementation here 
            self.options.wrapper.addClass('my-plugin-active');
 
            return this;
        }
 
        destroy() {
            const self = this;
 
            // Restore original state
            self.$el
                .html(self.initialHTML)
                .removeClass('my-plugin-active');
 
            // Clear the instance reference so the element can be reinitialized
            self.$el.removeData(instanceName);
 
            return this;
        }
 
        events() {
            const self = this;
 
            self.$el.on('myplugin.destroy', () => { self.destroy(); });
            self.$el.on('myplugin.rebuild', () => { self.build(); });
 
            return this;
        }
 
    }
 
    PluginMyPlugin.defaults = {
        accX: 0,
        accY: -80,            // viewport lookahead offset for dynIntObsInit
        delay: 0,
        minWindowWidth: 0,
        forceInit: false      // set true to skip IntersectionObserver
    };
 
    // Expose on namespace (required by init.js)
    $.extend(themestrap, { PluginMyPlugin });
 
    // jQuery adapter
    $.fn.themestrapPluginMyPlugin = function(opts) {
        return this.map(function() {
            const $this = $(this);
            if ($this.data(instanceName)) {
                return $this.data(instanceName);
            } else {
                return new PluginMyPlugin($this, opts);
            }
        });
    };
 
})).apply(this, [window.themestrap, jQuery]);
