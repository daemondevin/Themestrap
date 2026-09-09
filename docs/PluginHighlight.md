# PluginHighlight

Syntax highlighting for the Themestrap component library. Wraps [highlight.js](https://highlightjs.org/) with lazy ESM loading, language aliases, promise coalescing, line numbers, pre-marked lines, clipboard copy, and 31 CSS custom properties for full visual theming.

---

## Quick Start

### 1. Include the plugin

```html
<script src="themestrap.plugin.highlight.js"></script>
```

The plugin depends on jQuery and requires `window.themestrap` and `themestrap.fn.getOptions` to be present (provided by `themestrap.js`).

### 2. Mark up a code block

```html
<pre id="my-block"
     data-plugin-highlight="javascript"
     data-plugin-options='{"lineNumbers":true,"showCopy":true}'>
    <code>
        const greet = name => `Hello, ${name}!`;
    </code>
</pre>
```

The `<code>` child is recommended but optional — the plugin falls back to the `<pre>` itself when no `<code>` is present.

### 3. Initialize

**Auto-init via `themestrap.init.js`:**

```js
if ($.isFunction($.fn['themestrapPluginHighlight']) && $('[data-plugin-highlight]').length) {
    themestrap.fn.intObsInit('[data-plugin-highlight]:not(.manual)', 'themestrapPluginHighlight');
}
```

**Manual init:**

```js
$('#my-block').themestrapPluginHighlight();
```

**Retrieve the instance afterward** (always use a fresh selection — never chain directly off the init call):

```js
const instance = $('#my-block').data('__highlight');
```

---

## Attribute API

All attributes live on the `<pre>` element. If you target a `<code>` child or a wrapper `<div>`, the plugin relocates any `data-plugin-highlight-*` attrs to the nearest `<pre>` automatically.

| Attribute | Type | Description |
|---|---|---|
| `data-plugin-highlight` | string | Language ID or alias. Omit / leave blank for plaintext. |
| `data-plugin-highlight-lines` | string | Comma-separated line numbers and inclusive ranges to pre-mark (e.g. `"1,3,5-8"`). |
| `data-plugin-highlight-hljs-config` | JSON string | Object forwarded to `hljs.configure()` before highlighting. |
| `data-plugin-options` | JSON string | Full options bag — accepts all `PluginHighlight.defaults` keys. |
| `id` | string | Used as the line anchor prefix (`id-L1`, `id-L2`…). Auto-generated as `codeblock-N` when absent. |
| `class="manual"` | — | Opts the element out of auto-init. Initialize manually via JS. |

### Language IDs and aliases

The plugin maps shorthand aliases to canonical highlight.js grammar IDs before loading:

| Alias | Resolves to |
|---|---|
| `js` | `javascript` |
| `ts` | `typescript` |
| `py` | `python` |
| `rb` | `ruby` |
| `cs` | `csharp` |
| `sh`, `shell` | `bash` |
| `yml` | `yaml` |
| `md` | `markdown` |
| `htm`, `html` | `xml` |
| `c++` | `cpp` |

Any language not in the known-language list produces a `console.warn` before the CDN import is attempted — useful for catching typos without a silent 404.

> [!TIP]  
> The custom `modx` grammar is loaded from jsDelivr via a personal CDN found on a GitHub repository that is located [here](https://github.com/daemondevin/cdn). When loaded, it automatically pre-registers the `xml` and `json` grammars as dependencies.

---

## Options

Pass options as a JS object to the jQuery method, as JSON in `data-plugin-options`, or a mix of both. Individual `data-plugin-highlight-*` attributes always take precedence over the options object.

| Option | Type | Default | Description |
|---|---|---|---|
| `language` | string | `''` | Language ID or alias. Overridden by `data-plugin-highlight`. |
| `lineNumbers` | boolean | `true` | Render the line-number gutter. |
| `showCopy` | boolean | `true` | Render the copy button. |
| `copyIcon` | string (HTML) | SVG copy icon | HTML content for the copy button in its resting state. |
| `copySuccessIcon` | string (HTML) | SVG check icon (green `#198754`) | HTML content when a copy succeeds. |
| `copyFailureIcon` | string (HTML) | SVG × icon (red `#dc3545`) | HTML content when a copy fails. |
| `copyTimeout` | number | `800` | Milliseconds before the copy button reverts to its resting state. Also the delay before the PluginToast fires. |
| `theme` | string | `'atom-one-dark'` | Reserved for future theme switching. Currently informational only. |

**Examples:**

```html
<!-- Via attribute -->
<pre data-plugin-highlight="javascript"
     data-plugin-options='{"lineNumbers":false,"copyTimeout":1200}'>
```

```js
// Via JS
$('#my-block').themestrapPluginHighlight({
    lineNumbers: false,
    copyTimeout: 1500,
});
```

---

## Public API

Retrieve the instance first, then call methods on it:

```js
const instance = $('#my-block').data('__highlight');
```

> [!WARNING]  
> **Never chain `data('__highlight')` directly off the init call.**  
> The build is async and the instance data key is set synchronously, but internal state is populated after `build()` resolves.

### `copy(text)` &rarr; `Promise<boolean>`

Writes `text` to the clipboard. Returns `true` on success, `false` on failure. Uses the modern Clipboard API when available and falls back to `document.execCommand('copy')` in non-HTTPS contexts.

```js
const ok = await instance.copy('text to copy');
```

### `loadHLJS()` &rarr; `Promise<hljs | null>`

Forces an explicit load of the highlight.js core. Normally called internally by `build()`. Returns the `hljs` object on success or `null` on failure. Subsequent calls return the cached singleton immediately.

### `loadLanguage(lang, hljs)` &rarr; `Promise<boolean>`

Registers a language grammar with the provided `hljs` instance. Returns `true` when the grammar is available afterward, `false` otherwise. `'plaintext'` always returns `false` — no grammar is needed for the escape path.

```js
const hljs = await instance.loadHLJS();
await instance.loadLanguage('rust', hljs);
```

### `highlightBackticks(input, hljs)` &rarr; `string`

Scans `input` for backtick-delimited segments and highlights each one, auto-detecting MODX tag syntax (`[[...]]`) and valid JSON. Useful for server-rendered description strings that embed inline code.

```js
const highlighted = instance.highlightBackticks(
    'Set `[[*pagetitle]]` or pass `{"key":"val"}`.',
    hljs
);
```

### `handleHash()` &rarr; `void`

Re-evaluates `window.location.hash` and scrolls to + highlights the matching line anchor. Called automatically on `hashchange`.

### `destroy()` &rarr; `this`

Removes event listeners (`mouseup.highlight`, `hashchange.highlight`) and clears the instance data key. Does not restore the original DOM — the highlighted markup remains in place.

```js
instance.destroy();
```

---

## Events

PluginHighlight does not dispatch custom DOM events. Clipboard copy results surface via `themestrap.PluginToast` (if available on the page). Line selection is fully internal.

| Listener | Attached to | Fires when |
|---|---|---|
| `mouseup.highlight` | `document` | Mouse released after a line-number drag-select; copies selected lines. |
| `hashchange.highlight` | `window` | URL hash changes; scrolls to and highlights the matching line anchor. |
| `mousedown` | each `.hljs-ln-number` | Starts a line range selection. |
| `mouseenter` | each `.hljs-ln-number` | Extends the active selection during drag. |

### Interacting with PluginToast

When a copy succeeds, the plugin calls:

```js
themestrap.PluginToast?.show({
    type:  'success',
    title: 'Copy successful',
    body:  'Content copied to clipboard!',
});
```

If `themestrap.PluginToast` is not defined the call is a no-op (optional chaining guards it). You can stub it in a demo or test environment:

```js
themestrap.PluginToast = {
    show(opts) {
        console.log(`[${opts.type}] ${opts.title}: ${opts.body}`);
    }
};
```

---

## CSS Custom Properties

All 31 visual properties are exposed as `--ts-highlight-*` CSS custom properties, defined on `:root`. Override them globally, on any ancestor element (scoped), or inside a media query.

Fallback values are included on every var declaration, so the plugin renders correctly even when the Themestrap variable system (`--light-100`, `--dark--300`, etc.) is not present on the page.

### Dark mode

Three selector tiers handle dark mode — all three set the same subset of vars:

1. `@media (prefers-color-scheme: dark)` on `:root` — system preference
2. `html.dark, [data-bs-theme="dark"]` — explicit Bootstrap / Themestrap theme attribute
3. `[data-bs-theme="light"]` — explicit light override, restores `:root` defaults even inside a dark ancestor

Only `--ts-highlight-token-comment`, `--ts-highlight-token-tag`, and `--ts-highlight-token-operator` differ between light and dark mode. The remaining eight token colours are identical across both themes.

### Code block

| Property | Default (light) | Default (dark) | Description |
|---|---|---|---|
| `--ts-highlight-bg` | `var(--light-100, #f2f2f2)` | `#181818` | Background of the code block. |
| `--ts-highlight-color` | `var(--dark--300, #383f45)` | `#d8d8d8` | Base text colour. |
| `--ts-highlight-border-radius` | `0.5em` | `0.5em` | Border radius on bare `<pre>` elements. |
| `--ts-highlight-padding` | `1em` | `1em` | Padding inside `pre code.hljs`. |

### Header strip

| Property | Default (light) | Default (dark) | Description |
|---|---|---|---|
| `--ts-highlight-header-bg` | `var(--dark--300, #383f45)` | `var(--dark-100, #16181b)` | Background of `.code-highlight-header` and `.topfix`. |

### Text selection

| Property | Default (light) | Default (dark) | Description |
|---|---|---|---|
| `--ts-highlight-selection-bg` | `var(--light-inverse, #777)` | `#383838` | `::selection` background. |
| `--ts-highlight-selection-color` | `var(--dark-inverse, #fff)` | `#d8d8d8` | `::selection` text colour. |

### Line-number gutter

| Property | Default | Description |
|---|---|---|
| `--ts-highlight-ln-opacity` | `0.5` | Opacity of line-number labels. |
| `--ts-highlight-ln-gap` | `10px` | Right-margin and padding between gutter and code. |
| `--ts-highlight-ln-border-color` | `rgba(255,255,255,0.1)` | Colour of the gutter's right border. |

### Pre-marked lines (`data-plugin-highlight-lines`)

| Property | Default (light) | Default (dark) | Description |
|---|---|---|---|
| `--ts-highlight-marked-bg` | `rgba(229,192,123,.3)` | `rgba(229,192,123,.12)` | Background tint on a marked code line. |
| `--ts-highlight-marked-border-width` | `2px` | `2px` | Width of the left accent bar. |
| `--ts-highlight-marked-border-color` | `#cfa85e` | `#e5c07b` | Colour of the left accent bar. |
| `--ts-highlight-marked-num-color` | `#e5c07b` | `#e5c07b` | Number label colour on a marked line. |
| `--ts-highlight-marked-num-bg` | `rgba(229,192,123,.12)` | `rgba(229,192,123,.12)` | Number label background on a marked line. |

### Copy button

| Property | Default | Description |
|---|---|---|
| `--ts-highlight-copy-opacity` | `0.15` | Resting opacity of the copy button. |
| `--ts-highlight-copy-hover-opacity` | `0.75` | Hover opacity of the copy button. |
| `--ts-highlight-copy-top` | `12px` | Top offset (absolutely positioned). |
| `--ts-highlight-copy-right` | `10px` | Right offset. |
| `--ts-highlight-copy-success` | `#4caf50` | Colour of the `.copied` state label. |

### Syntax token colours

Eight of the eleven token groups share the same value in both light and dark mode. Only `comment`, `tag`, and `operator` invert.

| Property | Light | Dark |
|---|---|---|
| `--ts-highlight-token-comment` | `#b8b8b8` | `#585858` |
| `--ts-highlight-token-tag` | `#585858` | `#b8b8b8` |
| `--ts-highlight-token-operator` | `#383838` | `#d8d8d8` |
| `--ts-highlight-token-variable` | `#ab4642` | `#ab4642` |
| `--ts-highlight-token-number` | `#dc9656` | `#dc9656` |
| `--ts-highlight-token-title` | `#f7ca88` | `#f7ca88` |
| `--ts-highlight-token-string` | `#a1b56c` | `#a1b56c` |
| `--ts-highlight-token-builtin` | `#86c1b9` | `#86c1b9` |
| `--ts-highlight-token-function` | `#7cafc2` | `#7cafc2` |
| `--ts-highlight-token-keyword` | `#ba8baf` | `#ba8baf` |
| `--ts-highlight-token-meta` | `#a16946` | `#a16946` |

### Usage examples

```css
/* Global theme — VS Code dark colours */
:root {
    --ts-highlight-bg:             #1e1e1e;
    --ts-highlight-color:          #d4d4d4;
    --ts-highlight-token-keyword:  #569cd6;
    --ts-highlight-token-string:   #ce9178;
    --ts-highlight-token-comment:  #6a9955;
    --ts-highlight-token-function: #dcdcaa;
    --ts-highlight-token-number:   #b5cea8;
}

/* Scoped override — amber accent on one block */
#my-block {
    --ts-highlight-marked-border-color: #f59e0b;
    --ts-highlight-marked-bg:           rgba(245,158,11,0.12);
    --ts-highlight-marked-num-color:    #f59e0b;
}

/* Adjust copy button visibility */
:root {
    --ts-highlight-copy-opacity:       0.35;
    --ts-highlight-copy-hover-opacity: 1;
}
```

---

## Resilience and CDN Behavior

highlight.js core and language grammars are fetched via dynamic `import()` from jsDelivr. The loader is designed to degrade gracefully under CDN failure rather than throw.

### Per-attempt timeout

Each `import()` races against a `setTimeout` set to `LOAD_TIMEOUT_MS` (10 s). If the import wins, the timer is cleared. If the timer fires first, the import is considered failed for that attempt — the browser download continues silently in the background and its result lands in the browser module cache for any subsequent attempt.

### Retry with exponential backoff

Failed imports are retried up to `LOAD_RETRIES` (2) extra times, with a base delay of `RETRY_BASE_MS` (400 ms) doubled on each attempt:

| Attempt | Delay before attempt |
|---|---|
| 1 | immediate |
| 2 | 400 ms |
| 3 | 800 ms |

### Cooldown after hard core failure

If the core fails all attempts, `themestrap._hljsCoreFailed` is set to `Date.now()`. Subsequent plugin initializations within `CORE_COOLDOWN_MS` (15 s) skip the load entirely and proceed to the plaintext fallback path — preventing a retry storm against a down CDN. After the cooldown expires, the next init retries transparently.

### Cache eviction on failure

A failed in-flight promise is removed from `themestrap._hljsLoading` immediately. This means a single transient 502 never permanently poisons the session-level promise cache — the next init that runs after the cooldown always starts a fresh attempt.

### Fallback rendering

When core loading fails (or a language grammar fails), affected blocks render as **escaped plaintext** — `textContent` is HTML-escaped before being written to `innerHTML`. Line numbers and the copy button still function normally. No raw HTML injection occurs in either the highlight or the fallback path.

---

## Recipes

### Mark a single line

```html
<pre data-plugin-highlight="javascript"
     data-plugin-highlight-lines="5">
```

### Mark a range and individual lines

```html
<pre data-plugin-highlight="python"
     data-plugin-highlight-lines="1,3,7-10,14">
```

### Disable line numbers on one block, keep copy

```html
<pre data-plugin-highlight="bash"
     data-plugin-options='{"lineNumbers":false,"showCopy":true}'>
```

### Custom copy icons (emoji)

```js
$('#my-block').themestrapPluginHighlight({
    copyIcon:        '📋',
    copySuccessIcon: '✅',
    copyFailureIcon: '❌',
    copyTimeout:     1200,
});
```

### Programmatic copy

```js
const instance = $('#my-block').data('__highlight');
const ok = await instance.copy('text to copy');
console.log(ok ? 'copied' : 'failed');
```

### Swap the hljs tab-width

```html
<pre data-plugin-highlight="python"
     data-plugin-highlight-hljs-config='{"tabReplace":"    "}'>
```

### Use inside a page that lacks Themestrap CSS variables

The plugin supplies a fallback value on every custom property declaration, so it renders correctly without `--light-100`, `--dark--300`, etc.:

```css
/* These are always defined in the injected stylesheet — no extra setup needed */
:root {
    --ts-highlight-bg:    var(--light-100, #f2f2f2); /* fallback: #f2f2f2 */
    --ts-highlight-color: var(--dark--300, #383f45); /* fallback: #383f45 */
    /* ... */
}
```

### Deeplink to a line

Navigating to `page.html#my-block-L7` scrolls to and highlights line 7. This works automatically — the plugin listens to `hashchange` and also handles the hash present on initial page load.

### Programmatic language call from another plugin

When invoking `themestrapPluginHighlight` from another plugin or utility, set the language attribute **before** calling the jQuery method — `setOptions()` reads from the attribute, not from the options object key `language`:

```js
$pre.attr('data-plugin-highlight', 'javascript');
$pre.themestrapPluginHighlight();
```

---

## Keyboard Navigation

| Action | Element | Behavior |
|---|---|---|
| Click line number | `.hljs-ln-number` | Starts a selection at that line. |
| Click + drag across numbers | `.hljs-ln-number` | Extends the selection; releases on `mouseup` and copies the selected lines. |
| Navigate to `#block-L5` | URL hash | Scrolls to and highlights the target line. |

There is no keyboard shortcut for line selection. The copy button is a standard `<button>` element and is reachable via `Tab`.

---

## ARIA Wiring

Each line number div carries `role="button"` and `tabindex="0"` to signal interactivity to assistive technology. Line divs receive anchor IDs (`blockId-L1`, `blockId-L2`…) which are referenceable as fragment links.

The copy button is a standard `<button>` with visible text that updates to `Copied!` / `Copy failed` — no `aria-live` region is used, so screen readers will not announce the state change unless the user is focused on the button.

---

## Common Pitfalls

### The instance is `undefined` immediately after init

```js
/* Wrong — build() is async; data key exists but internal state may not be ready */
const inst = $('#el').themestrapPluginHighlight().data('__highlight');

/* Correct — always retrieve the instance on a fresh selection */
$('#el').themestrapPluginHighlight();
const inst = $('#el').data('__highlight');
```

### Pre-marked lines are off by one

`data-plugin-highlight-lines` uses **1-based** line numbers matching what is displayed in the gutter. If you are generating the attribute value programmatically, make sure you are not using 0-based indices.

### The language fails silently with no highlighting

The plugin warns to the console but does not throw. Check for:
1. A typo in the language name — compare against the `POPULAR_LANGUAGES` set or the alias map.
2. A CSP policy blocking `import()` from `cdn.jsdelivr.net`.
3. The `data-plugin-highlight` attribute on the wrong element — it must be on the `<pre>`, not on a wrapper `div` or the `<code>` child.

```js
/* Diagnostic — check what language was resolved */
const inst = $('#my-block').data('__highlight');
console.log(inst.options.lang);
```

### Blocks inside hidden containers initialize but look broken

The plugin does not measure layout, so initialization on hidden elements is safe. Appearance issues typically come from the `white-space: pre` on `.hljs-ln-line` interacting with a container that has `overflow: hidden`. Verify that the `<pre>` itself has `overflow-x: auto` (the injected stylesheet sets this via `pre code.hljs`).

### Dark mode not applying

Confirm one of the three selectors matches your page:

* `@media (prefers-color-scheme: dark)`   &larr; system preference  
* `html.dark`                              &larr; Themestrap class  
* `[data-bs-theme="dark"]`                &larr; Bootstrap 5 attribute  

The plugin does not read a `theme` option at runtime for dark/light switching — it relies entirely on the CSS cascade.

### `themestrap.fn.getOptions` is not a function

The plugin depends on the Themestrap namespace being initialized before the plugin script loads. Ensure `themestrap.js` (or a shim that defines `themestrap.fn.getOptions`) precedes the plugin `<script>` tag in the document.

### Diagnostic checklist

- [ ] `data-plugin-highlight` is on the `<pre>`, not a wrapper or `<code>`.
- [ ] `themestrap.js` (or shim) loads before `themestrap.plugin.highlight.js`.
- [ ] No CSP header blocking `import()` from `cdn.jsdelivr.net`.
- [ ] Language name matches a known hljs grammar or an alias in `LANG_ALIASES`.
- [ ] Instance retrieved on a fresh `$(selector)` selection, not chained off init.
- [ ] Pre-marked line numbers are 1-based.
- [ ] Dark mode selector (`html.dark` / `[data-bs-theme="dark"]`) is present if system preference is not being used.