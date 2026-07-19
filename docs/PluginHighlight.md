# PluginHighlight Guide

**File:** `js/components/themestrap.plugin.highlight.js`  
**jQuery method:** `$.fn.themestrapPluginHighlight`  
**Instance key:** `__highlight`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

PluginHighlight wraps [highlight.js](https://highlightjs.org/) with lazy ESM loading, per-language coalescing, line numbers, pre-highlighted line ranges, line selection with copy-on-release, a copy button, and hash-based line anchors.

The `highlight.js` core and language grammars are loaded on-demand from the jsDelivr CDN — only the languages actually used on a page are fetched. Multiple blocks using the same language share a single import. A custom `modx` grammar is loaded from jsDelivr via a personal CDN found on GitHub repository that is located [here](https://github.com/daemondevin/cdn).

Styles are injected lazily into `<style id="ts-syntax-highlight-styles">` on first use and include both light and dark mode rules.

## [How It **Works**](#how-it-works)

PluginHighlight is a thin orchestration layer around [highlight.js](https://highlightjs.org/). It lazy-imports only the language module it needs (via a dynamic `import()`) and coalesces multiple concurrent requests for the same language into one network round-trip. The result is injected as a highlighted `<code>` block with optional line numbers and an interactive copy button.

### Import coalescing

When five `javascript` blocks are on the same page, only one `import('highlight.js/languages/javascript')` fires. Subsequent blocks share the same promise and register the language once. This keeps the highlight payload small even on documentation pages with many examples.

### Line range pre-highlighting

When `lineNumbers: true`, the plugin wraps code in a two-column flex layout:

- Left column (`.hljs-ln-numbers`): clickable line-number badges
- Right column (`.hljs-ln-code`): highlighted code lines with id anchors

The `data-plugin-highlight-lines` attribute accepts a comma-separated list of line numbers and ranges (e.g. `"3,7-9,12"`). Those lines receive a `ts-hl-emphasized` class and a subtle left border accent on render.

`data-plugin-highlight-lines="1,3,5-8"` applies:

- `.hljs-ln-highlight-line` to matching code lines (amber left border + background)
- `.hljs-ln-highlight-num` to the corresponding line number badges

These are purely presentational and have no effect on copy content.

### Drag-to-select lines

On `mousedown` on the line-number gutter and dragging to select a range starts a line selection. On `mouseup`, the selected lines are joined with newlines then automatically written to the clipboard and a visual class is toggled on the selected lines. A success toast fires if `PluginToast` is available and loaded.

### Hash Navigation

On `hashchange` the plugin scrolls to `#blockId-L{n}` and applies `.hljs-ln-highlight` to the target line. This enables deep-linking to specific lines, e.g. `#ex1-L7`.

### Copy button behavior

The copy button calls `navigator.clipboard.writeText()` with the raw (un-highlighted) text of the entire block. A `textarea`-based fallback is used for older browsers or non-HTTPS contexts.

### DarkMode

The injected CSS includes a full dark theme ruleset that switches the palette from a light Base16 theme to a dark Base16 theme. This behavior is automatic when using `PluginDarkMode` to switch between `light` and `dark` mode.

### Lazy CDN Loading

    Core: https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11-stable/build/es/core.js  
    Languages: https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/es/languages/{lang}.min.js  
    MODX: https://cdn.jsdelivr.net/gh/daemondevin/cdn@main/highlighjs/languages/modx.js

> [!NOTE]  
> Imports are coalesced: if two blocks on the same page use `javascript`, only one `import()` fires regardless of initialization order.

### Language aliases

- `js` -> `javascript`
- `ts` -> `typescript`
- `py` -> `python`
- `rb` -> `ruby`
- `cs` -> `csharp`
- `sh`/`shell` -> `bash`
- `yml` -> `yaml`
- `md` -> `markdown`
- `htm`/`html` -> `xml`
- `c++` -> `cpp`.

> [!TIP]  
> The custom `modx` grammar is loaded from jsDelivr via a personal CDN found on GitHub repository that is located [here](https://github.com/daemondevin/cdn).

---

## [Quick **Start**](#quick-start)

```html
<pre data-plugin-highlight="javascript"
     data-plugin-highlight-lines="3,7-9"
     data-plugin-options='{"lineNumbers": true, "showCopy": true}'><code>
const greet = name => `Hello, ${name}!`;
</code></pre>
```

### Init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginHighlight'])
    && $('[data-plugin-highlight]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-highlight]:not(.manual)',
    'themestrapPluginHighlight'
  );
}
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | string | `''` | highlight.js language ID or alias. Empty = plaintext. |
| `theme` | string | `'atom-one-dark'` | Color theme name (informational; CSS is self-contained). |
| `lineNumbers` | bool | `true` | Render the line number column. |
| `showCopy` | bool | `true` | Render the copy-to-clipboard button. |
| `copyTimeout` | number | `800` | Delay in ms before reverting the "Copied!" label back. |

---

## [Common **Pitfalls**](#pitfalls)

**Always use `:not(.manual)` in the init selector.** PluginCodeWindow adds `.manual` to inner `<pre>` panes before calling Highlight on them manually. Without the `:not(.manual)` guard, init.js will double-highlight those panes.

**Escape angle brackets in code examples.** Content inside `<code>` is parsed as HTML. Use `&lt;` / `&gt;` for any angle brackets in the code you display.
