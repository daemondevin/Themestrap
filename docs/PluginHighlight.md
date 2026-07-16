# Highlight Guide

Themestrap's syntax-highlighting plugin — wraps highlight.js with lazy ESM imports, line numbers, line range pre-highlighting, drag-to-select-lines, a copy button, and a custom MODX language grammar.

## [How It **Works**](#how-it-works)

PluginHighlight is a thin orchestration layer around [highlight.js](https://highlightjs.org/). It lazy-imports only the language module it needs (via a dynamic `import()`) and coalesces multiple concurrent requests for the same language into one network round-trip. The result is injected as a highlighted `<code>` block with optional line numbers and an interactive copy button.

### Import coalescing

When five `javascript` blocks are on the same page, only one `import('highlight.js/languages/javascript')` fires. Subsequent blocks share the same promise and register the language once. This keeps the highlight payload small even on documentation pages with many examples.

### Line range pre-highlighting

The `data-plugin-highlight-lines` attribute accepts a comma-separated list of line numbers and ranges (e.g. `"3,7-9,12"`). Those lines receive a `ts-hl-emphasized` class and a subtle left border accent on render.

### Drag-to-select lines

Mousedown on the line-number gutter starts a line selection. Dragging extends it. The selection is written back to the OS clipboard automatically and a visual `ts-hl-selected` class is toggled on the selected lines.

### Language aliases

- `js` → `javascript`
- `ts` → `typescript`
- `py` → `python`
- `rb` → `ruby`
- `cs` → `csharp`
- `sh`/`shell` → `bash`
- `yml` → `yaml`
- `md` → `markdown`
- `htm`/`html` → `xml`
- `c++` → `cpp`.

The custom `modx` grammar is loaded from the Themestrap CDN when the language `modx` is requested.

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

**MODX tag nesting.** Never nest `[[` inside `[[tsHighlight]]` snippet arguments. Literal MODX-tag examples belong inside `<pre data-plugin-highlight="modx">` blocks with bracket entities (`&lsqb;&lsqb;`).
