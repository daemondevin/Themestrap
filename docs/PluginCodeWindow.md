# CodeWindow Guide

A windowed, tabbed code container. Wrap one or more `<pre>` blocks and the plugin builds the window shell — Mac's dots or Windows buttons, a filename tab strip, and an optional gradient glow — then hands each pane to PluginHighlight for syntax coloring, line numbers and a copy button. Tabs follow the ARIA tab pattern with a roving tabindex.

## [How It **Works**](#how-it-works)

PluginCodeWindow is a *decorator that composes a second plugin*. It owns the window shell and tab switching; it does **not** highlight code itself. Each `<pre>` you provide becomes one tab, and the plugin forwards that pane to [PluginHighlight](tsHighlight.html) for the actual syntax work. That separation keeps the window logic tiny and reuses a plugin already available.

#### Layer 1 — The window shell

> On `build()` the plugin collects the child `<pre>` panes and assembles the frame around them.
>
> - `ts-code-window__chrome` — Mac's dots or Windows buttons + tab strip
> - `ts-code-window__body` — holds one `__pane` per `<pre>`, only the active one shown
> - `--glow` / `--single` modifiers toggle the ambient glow and single-tab styling

#### Layer 2 — Highlight delegation

> Each pane keeps your original `<pre data-plugin-highlight="…">`. The plugin adds `.manual` to it (so `init.js` won’t double-init it) and calls PluginHighlight explicitly.
> 
> - Forwards `lineNumbers` and `showCopy`
> - Honors each pane’s own `data-plugin-highlight-lines`
> - If Highlight is absent, panes still render as styled plain code

### A real ARIA tab pattern

The chrome isn't decorative markup. Instead its a proper tablist. The window is a `role="group"`; the strip is a `role="tablist"`; each tab button is a `role="tab"` wired to its `role="tabpanel"` pane via `aria-controls` / `aria-labelledby`. Only the active tab is in the tab order (a roving tabindex); arrow keys move between tabs:

| Method                           | Returns   | Description                                                         |
|----------------------------------|-----------|---------------------------------------------------------------------|
| `→ / ↓ (ArrowRight / ArrowDown)` | next tab  | Move focus + activation to the next tab, wrapping at the end.       |
| `← / ↑ (ArrowLeft / ArrowUp)`    | prev tab  | Move focus + activation to the previous tab, wrapping at the start. |
| `Home`                           | first tab | Jump to the first tab.                                              |
| `End`                            | last tab  | Jump to the last tab.                                               |

The plugin injects a single stylesheet, `<style id="ts-code-window-styles">`, the first time any instance builds — never at parse time. Every color and dimension is a `--ts-cw-*` custom property, so you theme the frame by overriding those variables rather than editing the injected sheet.

## [Quick **Start**](#quick-start)

### Markup contract

The wrapper carries `data-plugin-code-window`. Each direct-child `<pre>` becomes a tab; its `data-code-window-tab` value is the filename label, and its `data-plugin-highlight` language drives the coloring:

```xml
<div data-plugin-code-window
     data-plugin-options='{"glow": true, "activeTab": 0}'>
 
  <pre data-code-window-tab="theme.config.js"
       data-plugin-highlight="javascript"
       data-plugin-highlight-lines="3,6-8"><code>export default {
  theme: 'dark',
}</code></pre>
 
  <pre data-code-window-tab="package.json"
       data-plugin-highlight="json"><code>{ "name": "app" }</code></pre>
 
</div>
```

Load order matters: include `themestrap.plugin.highlight.js` *before* `themestrap.plugin.codewindow.js` so the window can delegate to it. If Highlight loads later or not at all, the window still builds — the panes just render without syntax colors.

### Attribute reference

| Key                           | Type  | Default    | Description                                                                                  |
|-------------------------------|-------|------------|----------------------------------------------------------------------------------------------|
| `data-plugin-code-window`     | root  | —          | Marks the wrapper. Required for auto-init.                                                   |
| `data-plugin-options`         | attr  | —          | Single-quoted JSON of any options below.                                                     |
| `data-code-window-tab`        | attr  | `untitled` | Per-`<pre>` tab label (the filename shown in the strip).                                     |
| `data-plugin-highlight`       | attr  | —          | Per-`<pre>` language, forwarded to PluginHighlight.                                          |
| `data-plugin-highlight-lines` | attr  | —          | Per-`<pre>` emphasised line ranges (a PluginHighlight feature).                              |
| `.manual`                     | class | —          | On the wrapper, opt out of auto-init. (The plugin adds `.manual` to the inner panes itself.) |

### Init

```javascript
// Manual init
$('[data-plugin-code-window]').themestrapPluginCodeWindow({
    glow: true,
    activeTab: 0
});
 
// Auto-init (wire this block into themestrap.init.js)
if ($.isFunction($.fn['themestrapPluginCodeWindow']) &&
    $('[data-plugin-code-window]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-code-window]:not(.manual)',
    'themestrapPluginCodeWindow'
  );
}
```

`chrome`, `tabs` and `glow` are independent. A single-pane window automatically gains the `ts-code-window--single` modifier (which hides the active-tab underline), so you can show one file with full chrome and no tab affordance by leaving `tabs` on but supplying just one `<pre>`.

## [Configuration **Options**](#options)

| Key           | Type   | Default | Description                                                                                 |
|---------------|--------|---------|---------------------------------------------------------------------------------------------|
| `activeTab`   | number | `0`     | Index of the tab shown on load. Clamped to the available pane count.                        |
| `chrome`      | string | `'win'` | Show the macOS traffic-light dots ('mac') or the Windows buttons ('win') in the chrome bar. |
| `tabs`        | bool   | `true`  | Render the filename tab strip. With one pane it is hidden automatically.                    |
| `glow`        | bool   | `true`  | Ambient gradient glow behind the frame (adds `--glow`).                                     |
| `lineNumbers` | bool   | `true`  | Forwarded to PluginHighlight — show a line-number gutter.                                   |
| `showCopy`    | bool   | `true`  | Forwarded to PluginHighlight — show the copy-to-clipboard button.                           |
| `highlight`   | bool   | `true`  | Delegate to PluginHighlight. Set `false` to keep panes as plain styled code.                |
| `accent`      | string | `''`    | Accent color override. Empty inherits the theme — any value sets `--ts-cw-accent`.          |

### CSS custom property overrides

Every color and dimension is a `--ts-cw-*` custom property on the window, so per-instance theming is just CSS — no need to touch the injected stylesheet:

```css
.ts-code-window {
  --ts-cw-accent: #2ab8c8;   /* active-tab underline + glow tint */
}
 
/* A warm-accented window in one place only */
.docs-hero .ts-code-window {
  --ts-cw-accent: #e8672a;
}
```

`chrome`, `tabs` and `glow` are independent. A single-pane window automatically gains the `ts-code-window--single` modifier (which hides the active-tab underline), so you can show one file with full chrome and no tab affordance by leaving `tabs` on but supplying just one `<pre>`.

## [Instance **API**](#instance-api)

Grab the instance from the element’s data store under the `__codeWindow` key, then drive the window programmatically:

```javascript
const cw = $('#hero-code').data('__codeWindow');
 
cw.activate(1);   // switch to the second pane
cw.next();        // cycle forward (wraps)
cw.prev();        // cycle back   (wraps)
cw.destroy();     // restore the original markup
```

| Method            | Returns | Description                                                                                                                          |
|-------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------|
| `activate(index)` | this    | Show the pane at `index`, update `aria-selected` + the roving tabindex, and fire `codewindow:tab`. Out-of-range indexes are clamped. |
| `next()`          | this    | Activate the next pane, wrapping from the last back to the first.                                                                    |
| `prev()`          | this    | Activate the previous pane, wrapping from the first to the last.                                                                     |
| `destroy()`       | this    | Full teardown — restores the original `initialHTML` and clears the stored instance.                                                  |

### Events

The window fires two namespaced events on the wrapper element:

```javascript
const $cw = $('#hero-code');
 
// Once, after the window is built
$cw.on('codewindow:ready', (e, inst) => {
  console.log('window ready with', inst.$panes.length, 'tabs');
});
 
// On every tab change (click, keyboard, or API)
$cw.on('codewindow:tab', (e, inst, index, $pane) => {
  console.log('switched to tab', index, $pane);
});
```

| Method             | Returns                     | Description                                                                            |
|--------------------|-----------------------------|----------------------------------------------------------------------------------------|
| `codewindow:ready` | (e, instance)               | Fired once after the shell is built and panes are highlighted.                         |
| `codewindow:tab`   | (e, instance, index, $pane) | Fired on every activation — from a click, an arrow key, or `activate()/next()/prev()`. |

Because `activate()` is the single choke-point for tab changes, a `codewindow:tab` handler sees every switch no matter how it was triggered — ideal for lazy-loading a pane’s heavy content or syncing an external “copy this file” control.

#### Asset includes

* * *

Ship both plugin files (Highlight first), and make sure the auto-init block is present in `themestrap.init.js`:

```xml
<script src="/js/components/themestrap.plugin.highlight.js"></script>
<script src="/js/components/themestrap.plugin.codewindow.js"></script>
<script src="/js/themestrap.init.js"></script>
```

## [Recipe **Cookbook**](#recipes)

Tabbed hero (default)
```xml
<div data-plugin-code-window>
  <pre data-code-window-tab="app.js"
       data-plugin-highlight="javascript">
    <code>export const app = () => {}</code>
  </pre>
  <pre data-code-window-tab="app.css"
       data-plugin-highlight="css">
    <code>.app { display: grid; }</code>
  </pre>
</div>
```

Single file, full chrome
```xml
<!-- one <pre> => --single, no tab underline -->
<div data-plugin-code-window
     data-plugin-options='{"glow":false}'>
  <pre data-code-window-tab="snippet.php"
       data-plugin-highlight="php">
    <code><?php return $x;</code>
  </pre>
</div>
```

Custom accent + start on tab 2
```xml
<div data-plugin-code-window
     data-plugin-options='{"accent":"#2ab8c8","activeTab":1}'>
  <pre data-code-window-tab="before.css" ...>...</pre>
  <pre data-code-window-tab="after.css" ...>...</pre>
</div>
```

No highlighting (plain styled code)
```xml
<div data-plugin-code-window
     data-plugin-options='{"highlight":false,"lineNumbers":false}'>
  <pre data-code-window-tab="output.log">
    <code>build complete in 1.2s</code>
  </pre>
</div>
```

Auto-advance the tabs
```javascript
const cw = $('#demo').data('__codeWindow');
let i = 0;
setInterval(() => cw.next(), 4000);
```

React to a tab change
```javascript
$('#demo').on('codewindow:tab',
  (e, inst, index, $pane) => {
    analytics.track('code_tab_view', { index });
  });
```

## [Common **Pitfalls**](#pitfalls)

#### Load Highlight before Code Window

Code Window delegates highlighting by calling `$.fn.themestrapPluginHighlight`. If the Highlight plugin file hasn’t loaded yet, that method doesn’t exist and the panes render as plain (still styled) code. Always include `themestrap.plugin.highlight.js` before `themestrap.plugin.codewindow.js`.

#### Don’t hand-highlight the inner panes

* * *

The plugin adds `.manual` to each inner `<pre>` and highlights it itself. Your global Highlight auto-init should target `[data-plugin-highlight]:not(.manual)` so the panes aren’t initialized twice. The Themestrap init pattern already does this — keep the `:not(.manual)` selector.

#### Escape the code you embed

* * *

Everything inside `<code>` is treated as HTML by the browser. A raw `<div>` in a sample will be parsed as a real element and vanish from the listing. Use `&lt;` / `&gt;` for angle brackets in the source you display.

#### IDs are auto-assigned if missing

* * *

If the wrapper has no `id`, the plugin generates one (`codewindow-N`) so tabs and panes can be wired with unique `aria-controls` / `aria-labelledby`. Give the wrapper your own `id` when you need a stable handle for `$('#…').data('__codeWindow')`.

#### When the window doesn’t build

* * *

### **Quick diagnostic checklist**

> - Is `<style id="ts-code-window-styles">` present in `<head>` after init?
> - Does the wrapper carry `data-plugin-code-window` and contain at least one `<pre>`?
> - Did `themestrap.plugin.highlight.js` load *before* the code-window file?
> - Is the Highlight auto-init selector still `[data-plugin-highlight]:not(.manual)`?
> - Are the `<pre>` panes direct children of the wrapper (or at least descendants)?
> - For a stable API handle — does the wrapper have its own `id`?
