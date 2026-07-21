# PluginMarkdown Guide

A fully self-contained GitHub Flavored Markdown renderer; no `marked.js`, no CDN, no build step. Add `data-plugin-markdown` to any element and the plugin parses its text content as GFM, or point `data-plugin-markdown-src` at a `.md` file URL and the plugin fetches and renders it. Tables, task-list checkboxes, fenced code blocks, reference links, strikethrough, and all standard inline formatting are handled by a bundled tokenizer with zero external dependencies at runtime.

---

## How It Works

The plugin bundles a two-phase GFM-compatible parser inside its IIFE: a block tokenizer that converts raw Markdown into a token array, and a recursive renderer that converts tokens to HTML strings. Both run synchronously in the browser — no Web Workers, no async parsing.

### Phase 1 — Tokenize

The tokenizer walks the input line-by-line, matching against block grammar rules in priority order: fenced code → ATX headings → setext headings → horizontal rules → block quotes → GFM tables → lists → raw HTML → paragraphs. Link reference definitions (`[ref]: url "title"`) are extracted first and stored for inline resolution.

- Single-pass, no backtracking
- Nested block quotes are tokenized recursively
- List items carry a `loose` flag for blank-line separation

### Phase 2 — Render

The renderer walks the token array and emits HTML. Block tokens call `renderInline()` on their text, which applies inline rules in order: auto-links → inline code (extracted to placeholders) → images → links → reference links → bold+italic → bold → italic → strikethrough → line breaks. Code placeholders are restored after all other inline rules fire, protecting backtick content from further substitution.

- Inline code isolated via byte-marker placeholders
- Recursive: inline renderer is called for link labels, list text, blockquotes
- Sanitize option strips `<script>` and `on*` attributes

### Two content source modes

**Mode 1 — Inline:** When no `src` option is set, `build()` reads the element's `.text()` content, parses it through `GFM.parse()`, and replaces the element's `innerHTML` with the result.

**Mode 2 — Fetch:** When `data-plugin-markdown-src` or `options.src` is set, `build()` calls `setSource(url)`, which fires a jQuery `$.ajax()` request. While loading, `.ts-markdown-loading` is added to the element. On success the response text is passed to `render()`; on failure an error message is injected with the `.ts-markdown-error` class.

**Lazy CSS injection:** On first instantiation, `build()` calls `injectStyles()`, which creates a `<style id="ts-markdown-styles">` tag and appends it to `<head>`. Subsequent instances find the tag by ID and skip the injection — no per-instance style duplication.

> **Note:** The bundled GFM parser is intentionally minimal — it covers the GFM spec features actually used in documentation and README files. It does not support definition lists, footnotes, custom containers, or LaTeX math blocks. For those, swap `GFM.parse()` for `marked.parse()` and keep the plugin wrapper unchanged.

---

## Quick Start

### Inline Markdown

Place Markdown as text content inside any element and add the attribute:

```html
<div data-plugin-markdown>
# Hello World

Some **bold** text, *italic*, and a [link](https://example.com).

- Item one
- [x] Completed task
- [ ] Pending task
</div>
```

### Remote Markdown file

```html
<!-- Fetch from a URL; element content is replaced on load -->
<div data-plugin-markdown
     data-plugin-markdown-src="/assets/docs/readme.md"></div>

<!-- With options -->
<div data-plugin-markdown
     data-plugin-markdown-src="/assets/docs/changelog.md"
     data-plugin-options='{"breaks": true, "sanitize": false}'></div>
```

### Include the plugin

```html
<script src="/assets/components/themestrap/vendor/plugins/js/plugins.min.js"></script>
<script src="/assets/components/themestrap/js/themestrap.js"></script>
<script src="/assets/components/themestrap/js/components/themestrap.plugin.markdown.js"></script>
<script src="/assets/components/themestrap/js/themestrap.init.js"></script>
```

### Auto-init wiring (`themestrap.init.js`)

```js
if ($.isFunction($.fn['themestrapPluginMarkdown']) && $('[data-plugin-markdown]').length) {
    themestrap.fn.intObsInit('[data-plugin-markdown]:not(.manual)', 'themestrapPluginMarkdown');
}
```

### Manual init with options

```js
// jQuery adapter
$('#my-docs').themestrapPluginMarkdown({
    breaks:   true,
    sanitize: false
});

// Access the instance
const md = $('#my-docs').data('__pluginMarkdown');
md.render('# Dynamic content');
md.setSource('/api/docs/intro.md');
```

> **Tip:** The jQuery method returns the instance on every call — first call creates, subsequent calls return the existing instance without reinitializing. Use `$el.data('__pluginMarkdown')` to retrieve the instance programmatically at any time after init.

---

## GFM Support

The bundled parser covers the GitHub Flavored Markdown spec features commonly found in documentation files, READMEs, and blog content.

### Block-level elements

| Feature | Syntax | Notes |
|:--------|:-------|:------|
| ATX headings | `# h1` … `###### h6` | Trailing `#`s stripped; `id` auto-generated from text |
| Setext headings | Underline with `===` or `---` | h1 and h2 only |
| Fenced code | ` ```lang … ``` ` or `~~~lang … ~~~` | Language class added as `language-{lang}` |
| Indented code | 4 spaces or 1 tab | No language annotation |
| Block quotes | `> text` | Recursive — nested GFM inside block quotes |
| Unordered lists | `-` / `*` / `+` | Nested lists via indentation |
| Ordered lists | `1.` `2.` … | Nested lists via indentation |
| Task lists | `- [x] done` / `- [ ] todo` | Renders disabled checkboxes; wraps in `.ts-md-task-list` |
| GFM tables | Pipe syntax with alignment `---:` | Left / center / right column alignment |
| Horizontal rules | `---` / `***` / `___` | Three or more markers |
| Raw HTML | Block-level tags pass through | Stripped when `sanitize: true` |

### Inline elements

| Feature | Syntax | Output |
|:--------|:-------|:-------|
| Bold | `**text**` or `__text__` | `<strong>` |
| Italic | `*text*` or `_text_` | `<em>` |
| Bold + italic | `***text***` or `___text___` | `<strong><em>` |
| Inline code | `` `code` `` | `<code>` |
| Strikethrough | `~~text~~` | `<del>` |
| Link | `[label](url "title")` | `<a href>` |
| Reference link | `[label][ref]` + `[ref]: url` | `<a href>` |
| Image | `![alt](url "title")` | `<img>` with `max-width:100%` |
| Auto-link | `<https://…>` | `<a href>` |
| Line break | Two trailing spaces or `\` | `<br>` |

> **Note:** Heading IDs are generated from the heading text — lowercased, with non-word characters replaced by hyphens. `# Hello World` → `id="hello-world"`. These IDs are used by the TOC sidebar when rendering inside the Guide chrome.

---

## Configuration Options

Options merge: `PluginMarkdown.defaults → opts argument → data-plugin-options JSON`.

```html
<div data-plugin-markdown
     data-plugin-options='{"src":"","breaks":false,"sanitize":true}'></div>
```

### Content source

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `src` | string | `""` | URL of a `.md` file to fetch and render. When empty the element's text content is rendered. Can also be set via `data-plugin-markdown-src`. |

### Parser behaviour

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `breaks` | bool | `false` | Convert single trailing newlines (two spaces or `\`) inside paragraphs to `<br>`. Mimics GitHub's "new lines as line breaks" option. |
| `sanitize` | bool | `true` | Strip `<script>` tags and `on*` event attributes from rendered HTML. Enable for untrusted content, disable when rendering your own trusted Markdown that includes raw HTML pass-through. |
| `taskLists` | bool | `true` | Render `- [x]` / `- [ ]` as disabled checkboxes inside `.ts-md-task-list`. When false, task-list lines render as plain list items. |

### Style overrides

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `linkColor` | string | `""` | Override the link colour via `--ts-md-link`. Accepts any CSS colour value. Default: `#2ab8c8`. |
| `codeFont` | string | `""` | Override the code font stack via `--ts-md-code-font`. Default stack: JetBrains Mono → Fira Code → Courier New → monospace. |

### CSS custom properties

All visual tokens are exposed as custom properties on `.ts-markdown`. Override globally or per-instance:

```css
/* Global override */
.ts-markdown {
  --ts-md-link:       #e8672a;
  --ts-md-link-hover: #d2541b;
  --ts-md-code-bg:    rgba(0, 0, 0, .08);
}
```

```html
<!-- Per-instance via inline style -->
<div data-plugin-markdown style="--ts-md-quote-border: #2ab8c8">…</div>
```

| Property | Default | Controls |
|:---------|:--------|:---------|
| `--ts-md-font` | `inherit` | Body font family |
| `--ts-md-code-font` | JetBrains Mono stack | Code / pre font family |
| `--ts-md-code-bg` | `rgba(0,0,0,.06)` | Inline code + pre background |
| `--ts-md-border` | `rgba(0,0,0,.15)` | Table borders, h1/h2 underlines, pre border |
| `--ts-md-quote-border` | `#0a1929` | Block quote left border accent |
| `--ts-md-link` | `#2ab8c8` | Link colour |
| `--ts-md-link-hover` | `#e8672a` | Link hover colour |
| `--ts-md-table-stripe` | `rgba(0,0,0,.03)` | Even table row stripe |
| `--ts-md-hr` | `rgba(0,0,0,.15)` | Horizontal rule colour |
| `--ts-md-heading-mt` | `1.5em` | Top margin on all headings |

---

## Public API

### Accessing the instance

```js
// jQuery adapter — creates on first call, returns existing instance thereafter
const md = $('#readme').themestrapPluginMarkdown({ breaks: true });

// Data key access after init
const md = $('#readme').data('__pluginMarkdown');
```

### Instance methods

| Method | Returns | Description |
|:-------|:--------|:------------|
| `render(markdown)` | `this` | Parse a Markdown string and replace the element's HTML with the result. Fires `rendered.ts.markdown` with the HTML string as the second argument. |
| `setSource(url)` | `this` | Fetch Markdown from `url` via XHR and call `render()` on success. Adds `.ts-markdown-loading` while fetching; on error injects a `.ts-markdown-error` message and fires `error.ts.markdown`. |
| `getHtml()` | `string` | Return the HTML string produced by the last `render()` call. Empty string before first render. |
| `destroy()` | `this` | Restore the original element HTML, remove `.ts-markdown` and state classes, clear CSS custom property overrides, and drop the instance reference from `$el.data()`. |

### jQuery events

Both events bubble from the host element:

```js
$('#readme')
  .on('rendered.ts.markdown', (e, html) => {
      console.log('Rendered', html.length, 'chars of HTML');
  })
  .on('error.ts.markdown', (e, url, err) => {
      console.warn('Failed to load', url, err);
  });
```

### Direct GFM parser access

```js
// Parse Markdown to an HTML string without attaching to a DOM element
const html = themestrap.PluginMarkdown.GFM?.parse(markdownStr, {
    breaks:    false,
    sanitize:  true,
    taskLists: true,
});

// Chaining works — render() and setSource() both return this
inst.render(md).getHtml();
```

---

## Recipe Cookbook

### Fetch a GitHub README

```html
<div id="project-readme"
     data-plugin-markdown
     data-plugin-markdown-src="/assets/docs/README.md"
     data-plugin-options='{"sanitize": false}'></div>

<style>
#project-readme.ts-markdown {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
```

### MODX template variable as Markdown

```html
<!-- In a MODX template / chunk -->
<div data-plugin-markdown>[[*markdown_content]]</div>

<!-- Or fetch a managed .md file via Media Source -->
<div data-plugin-markdown
     data-plugin-markdown-src="[[++assets_url]]docs/[[*alias]].md">
</div>
```

### Live Markdown editor preview

```html
<div class="editor-layout">
  <textarea id="md-input" rows="20"></textarea>
  <div id="md-preview" data-plugin-markdown class="manual"></div>
</div>

<script>
const preview = $('#md-preview')
  .themestrapPluginMarkdown({ sanitize: false })
  .data('__pluginMarkdown');

$('#md-input').on('input', function () {
  preview.render(this.value);
});
</script>
```

### Tabbed docs section

```html
<div id="tab-intro" data-plugin-markdown
     data-plugin-markdown-src="/docs/intro.md"></div>
<div id="tab-api"   data-plugin-markdown
     data-plugin-markdown-src="/docs/api.md"
     style="display:none"></div>

<script>
$('[data-plugin-markdown]').each(function () {
  $(this).themestrapPluginMarkdown();
});

$('.tab-link').on('click', function () {
  $('#tab-' + $(this).data('target')).show().siblings().hide();
});
</script>
```

### Dynamically swap content

```js
const md = $('#docs-body')
  .themestrapPluginMarkdown()
  .data('__pluginMarkdown');

$('.doc-nav a').on('click', function (e) {
  e.preventDefault();
  md.setSource($(this).data('src'));
});
```

### Trusted content without sanitization

```html
<div data-plugin-markdown
     data-plugin-options='{"sanitize": false}'>
## Trusted content

<div class="custom-callout">
  Raw HTML preserved because sanitize is false.
</div>
</div>
```

### Scroll to heading after render

```js
$('#docs')
  .on('rendered.ts.markdown', function () {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  })
  .themestrapPluginMarkdown({ src: '/docs/reference.md' });
```

### Custom colour scheme

```html
<div data-plugin-markdown
     data-plugin-options='{"linkColor": "#e8672a", "codeFont": "Fira Code, monospace"}'
     style="
       --ts-md-code-bg:      rgba(232,103,42,.08);
       --ts-md-quote-border: #e8672a;
       --ts-md-border:       rgba(232,103,42,.2);
     ">
  Content here…
</div>
```

---

## Common Pitfalls

### HTML-entity-encoded Markdown in templates

> **Warning:** When Markdown is embedded in a MODX TV, browsers may decode HTML entities before the plugin reads the text. An asterisk written as `&ast;` in a TV value will arrive at the plugin as a literal `*`, which may trigger unintended italic formatting. Use `src` to fetch from a standalone `.md` file when working with template-variable content.

### Inline Markdown and leading whitespace

> **Note:** The plugin reads `$el.text()`, which strips surrounding whitespace. If your Markdown indents every line (e.g. because it sits inside an indented HTML template), the parser may interpret four-space-indented paragraphs as indented code blocks. Write Markdown at column zero or use `src` to fetch from a standalone file.

### Raw HTML stripped when sanitize is true

> **Warning:** The default `sanitize: true` removes `<script>` blocks and `on*` attributes, but also discards all raw HTML pass-through blocks. If your Markdown contains intentional raw HTML (`<div>`s, `<figure>` elements, etc.), set `sanitize: false` — but only for content you control. Never disable sanitization for user-supplied Markdown.

### CORS errors on remote src

> **Danger:** `setSource(url)` uses `$.ajax()`. If the `.md` file is served from a different origin, the server must include `Access-Control-Allow-Origin: *` in its response headers. CORS errors appear in the browser console and trigger the `error.ts.markdown` event. For same-origin MODX files, CORS is never an issue.

### Double-init no-ops silently

> **Note:** Calling `.themestrapPluginMarkdown()` on an already-initialised element returns the existing instance without re-parsing. To change options after init, call `destroy()` first, then re-init with the new options.

### Tables need a separator row

> **Note:** GFM tables require a separator row between the header and body rows using `---`, `:---`, `---:`, or `:---:` cells. A table without a separator row is parsed as two ordinary paragraphs.

### Diagnostic checklist

- [ ] Is `data-plugin-markdown` present on the element? (Check spelling — no typos.)
- [ ] Is `themestrap.plugin.markdown.js` loaded after `themestrap.js` and jQuery?
- [ ] Does `$el.data('__pluginMarkdown')` return an instance object?
- [ ] For fetch mode: open Network tab — is the XHR request firing? Check for 404 or CORS errors.
- [ ] Is the output element gaining the `ts-markdown` class? If not, `build()` didn't run.
- [ ] Are table rows missing — did you include the `|---|---|` separator row?
- [ ] For sanitize issues: does toggling `sanitize: false` reveal missing HTML?
- [ ] Is Markdown indented 4+ spaces in the HTML source? Those lines are parsed as indented code blocks.