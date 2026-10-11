# PluginMarkdownEditor

A distraction-free Markdown writing surface for Themestrap. It enhances a plain `<textarea>` with a **PluginToolbar**, smart typing (list and quote continuation, indentation, wrap toggles), image paste and drop upload, a live preview, a word count, and a fullscreen focus mode. The textarea stays the source of truth, so a normal form post keeps working and there is nothing to convert on save. No vendor dependencies.

| Feature | Notes |
| - | - |
| Formatting | Bold, italic, strikethrough, inline code, headings, quote, bullet / numbered / task lists, link, image, code block, divider, table |
| Smart typing | `Enter` continues lists and quotes, an empty item ends them, `Tab` indents list items |
| Toggles | Every wrap and line command toggles off when applied twice |
| Images | Paste, drop, or pick a file. A placeholder is inserted while `imageUpload` runs |
| Preview | Write, split, or preview-only, rendered by PluginMarkdown or your own `renderer` (sync or async) |
| Status bar | Word count and reading time |
| Focus mode | Fullscreen with `Esc` to leave |
| Undo | Edits go through the browser edit stack, so `Ctrl/⌘ + Z` undoes toolbar actions |
| Theming | `prefers-color-scheme`, `html.dark` / `[data-bs-theme="dark"]`, explicit `[data-bs-theme="light"]`, and `--ts-me-*` tokens |



## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance.
2. **`setData`** stores the instance on the textarea as `__pluginMarkdownEditor`.
3. **`setOptions`** merges `PluginMarkdownEditor.defaults` with your options. Arrays (`toolbar`) are replaced, never merged. Function options (`imageUpload`, `renderer`) are kept as given.
4. **`build`** verifies dependencies, injects the stylesheet once, wraps the textarea, builds the toolbar, preview pane and status bar.
5. **`events`** binds the toolbar, keyboard, paste, drag and drop, and scroll sync.
6. **`destroy`** unbinds everything, restores the textarea to its original place, and removes the stylesheet when the last instance goes.

### Rendered DOM

```html
<div class="ts-mdeditor ts-me-view-split">
    <div class="ts-toolbar">…</div>                       <!-- PluginToolbar -->
    <div class="ts-me-panes">
        <div class="ts-me-write"><textarea class="ts-me-input">…</textarea></div>
        <div class="ts-me-preview"><div class="ts-me-preview-body">…</div></div>
    </div>
    <div class="ts-me-status">…</div>
</div>
```

### Dependencies

| Plugin | Required when |
| - | - |
| `PluginToolbar` | The toolbar is enabled (the default) |
| `PluginMarkdown` | The preview is enabled and no `renderer` is given. Without either, the preview shows escaped plain text |

With `toolbar: false` and `preview: false`, no other plugin is needed. A missing `PluginToolbar` is reported through `themestrap.fn.showErrorMessage`, and the textarea is left untouched.

### Stylesheet injection

`<style id="ts-markdowneditor-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

### Edit engine

Edits use `document.execCommand('insertText')` when available so the native undo stack keeps working, and fall back to `setRangeText()` plus a synthetic `input` event otherwise.



## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.toolbar.js"></script>
<script src="js/components/themestrap.plugin.markdown.js"></script>
<script src="js/components/themestrap.plugin.markdowneditor.js"></script>
```

### Minimal editor

```html
<textarea name="body" data-plugin-markdowneditor></textarea>
```

### With options

```html
<textarea name="body" data-plugin-markdowneditor
          data-plugin-options='{"view": "split", "minHeight": 360}'></textarea>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// MarkdownEditor
if (typeof $.fn['themestrapPluginMarkdownEditor'] === 'function' &&
    $('[data-plugin-markdowneditor]').length) {
    themestrap.fn.intObsInit(
        '[data-plugin-markdowneditor]:not(.manual)',
        'themestrapPluginMarkdownEditor'
    );
}
```

### Manual init

Add `.manual` to skip auto-init, then initialize with options that cannot live in a data attribute, such as functions.

```js
$('#body').themestrapPluginMarkdownEditor({
    imageUpload: function (file) {
        const fd = new FormData();
        fd.append('file', file);
        return fetch('/upload', { method: 'POST', body: fd })
            .then(function (r) { return r.json(); })
            .then(function (j) { return j.url; });
    }
});
```

Zero-vendor plugins are wired in `themestrap.init.js` (as above), not in `themestrap.modules.js`, which only lists plugins that need a vendor library.



## Markup Reference

| Attribute / class | Element | Notes |
| - | - | - |
| `data-plugin-markdowneditor` | `<textarea>` | Init hook. The host must be a textarea. |
| `data-plugin-options` | Host | JSON options. Functions cannot be expressed here. |
| `.manual` | Host | Excludes the element from auto-init. |

### Generated classes

| Class | Element | Meaning |
| - | - | - |
| `ts-mdeditor` | Wrapper | Root of the editor |
| `ts-me-view-write`, `-split`, `-preview` | Wrapper | Current view |
| `ts-me-focused` | Wrapper | The textarea has focus |
| `ts-me-disabled` | Wrapper | `disable()` is active |
| `ts-me-fullscreen` | Wrapper | Fullscreen is on |
| `ts-me-dropping` | Wrapper | An image is being dragged over the editor |
| `ts-me-input` | Textarea | The writing surface |
| `ts-me-preview-body` | Preview | The rendered HTML |

### Toolbar keys

| Key | Action | Shortcut |
| - | - | - |
| `bold` | Toggle `**…**` | Ctrl/⌘+B |
| `italic` | Toggle `*…*` | Ctrl/⌘+I |
| `strike` | Toggle `~~…~~` | none |
| `code` | Toggle `` `…` ``, or a code block for a multi-line selection | none |
| `h2`, `h3` | Toggle `## ` / `### ` on the selected lines | none |
| `quote` | Toggle `> ` | none |
| `ul`, `ol`, `task` | Toggle list markers. Switching list type replaces the old marker | none |
| `link` | Wrap the selection as `[text](url)` and select the URL. A selected URL becomes the target | Ctrl/⌘+K |
| `image` | Pick a file when `imageUpload` is set, otherwise insert `![alt](url)` | none |
| `codeblock` | Insert a fenced block around the selection | none |
| `hr` | Insert `---` | none |
| `table` | Insert a 2 by 2 table | none |
| `views` | The write / split / preview switcher | none |
| `fullscreen` | Fullscreen button | none |
| `spacer` | Pushes following items to the right | none |
| `\|` | Group separator | none |



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `placeholder` | `string` | `'Write in Markdown…'` | Textarea placeholder |
| `ariaLabel` | `string` | `'Markdown editor'` | Accessible name when the textarea has none |
| `view` | `string` | `'write'` | `'write'`, `'split'`, or `'preview'` |
| `minHeight` | `number \| string` | `420` | Height of the split and preview panes. Numbers are pixels. In write view the area grows with the text |
| `toolbar` | `string[] \| false` | see below | Keys to show. `false` removes the toolbar |
| `toolbarOptions` | `object` | `{ ariaLabel: 'Markdown formatting', size: 'sm', full: true }` | Passed to `themestrapPluginToolbar` |
| `preview` | `boolean` | `true` | `false` removes the preview pane and the view switcher |
| `renderer` | `function \| null` | `null` | `function (markdown) {}` returning HTML or a Promise of HTML. Replaces PluginMarkdown |
| `sanitize` | `boolean` | `true` | Forwarded to PluginMarkdown |
| `breaks` | `boolean` | `false` | Forwarded to PluginMarkdown |
| `previewDelay` | `number` | `150` | Debounce in milliseconds before the preview refreshes |
| `syncScroll` | `boolean` | `true` | Keep write and preview aligned in split view |
| `autoGrow` | `boolean` | `true` | Write view grows with the text like a document |
| `tabSize` | `number` | `2` | Spaces used to indent list items |
| `statusBar` | `boolean` | `true` | Word count and reading time |
| `imageUpload` | `function \| null` | `null` | `function (file) {}` returning a URL or a Promise of one. Enables paste, drop and the image picker |
| `disabled` | `boolean` | `false` | Start disabled |
| `onChange` | `function \| null` | `null` | `function (markdown) {}`. `this` is the instance |

Default toolbar:

```js
['bold', 'italic', 'strike', 'code', '|', 'h2', 'h3', 'quote', '|', 'ul', 'ol', 'task', '|',
 'link', 'image', 'codeblock', 'hr', 'table', 'spacer', 'views', 'fullscreen']
```

`toolbar`, `view` (initial), `preview` and `statusBar` are applied in `build()`. To change them, `destroy()` and initialize again.

### Using the preview safely

The built-in preview uses PluginMarkdown with `sanitize: true`. If you render previews yourself, make sure the HTML is safe, because it is inserted with `.html()`. A server-side `renderer` that uses the same code as the published page is the most accurate option.



## Public API

```js
const ed = $('#body').data('__pluginMarkdownEditor');
```

| Method | Returns | Description |
| - | - | - |
| `getValue()` | `string` | The Markdown |
| `setValue(md, silent)` | `this` | Replace the content. `silent` skips the change event |
| `getHtml()` | `string` | Rendered HTML. Empty when an async `renderer` is in use |
| `insert(text)` | `this` | Insert at the caret, replacing the selection |
| `wrap(before, after, hint)` | `this` | Toggle a wrapper around the selection |
| `command(name)` | `this` | Run any toolbar command by key |
| `setView(view)` | `this` | `'write'`, `'split'`, `'preview'` |
| `getView()` | `string` | The current view |
| `fullscreen(on)` | `this` | Enter or leave fullscreen |
| `setStatus(msg)` | `this` | Short message in the status bar |
| `focus()` | `this` | Focus the textarea |
| `enable()`, `disable()` | `this` | Toggle the disabled state |
| `destroy()` | `this` | Restore the textarea and remove the stylesheet when last |

| Property | Description |
| - | - |
| `$el` / `$ta` | The textarea |
| `$wrap` | The editor wrapper |
| `$toolbarEl` | The toolbar host, or `undefined` |
| `$preview`, `$previewBody` | Preview elements, or `undefined` when `preview: false` |
| `options` | The merged options |

The jQuery bridge returns a set of instances, not elements. Retrieve instances from a fresh selection with `.data('__pluginMarkdownEditor')`.



## Events

Native `CustomEvent`s dispatched on the textarea. They bubble, and `detail.instance` is the editor.

| Event | `detail` | When |
| - | - | - |
| `ts.markdowneditor.change` | `value` | After every edit. Not fired by `setValue(md, true)` |
| `ts.markdowneditor.save` | none | `Ctrl/⌘ + S` was pressed. The default browser action is prevented |
| `ts.markdowneditor.view` | `view` | The view changed through `setView()` or the toolbar |
| `ts.markdowneditor.upload` | `file`, `url` | `imageUpload` resolved |
| `ts.markdowneditor.error` | `error` | `imageUpload` rejected. The placeholder is removed |
| `ts.markdowneditor.focus`, `.blur` | none | Focus changes |

```js
document.getElementById('body').addEventListener('ts.markdowneditor.save', function () {
    form.requestSubmit();
});
```

> **Use `addEventListener`, not `$.on()`.** jQuery parses dots as namespaces, so `$el.on('ts.markdowneditor.change', …)` never fires. The `onChange` option is an alternative.

### Events consumed from dependencies

| Event | Source | Handling |
| - | - | - |
| `toolbar:button` | PluginToolbar | Runs the command in `detail.value` |
| `toolbar:toggle` | PluginToolbar | Switches the view |



## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-me-bg` | `#ffffff` | `rgba(255,255,255,.02)` | Background |
| `--ts-me-border` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.10)` | Borders and dividers |
| `--ts-me-border-focus` | `#00a89f` | `#00c7be` | Focus ring, pressed toolbar items, drop target |
| `--ts-me-toolbar-bg` | `rgba(0,0,0,.035)` | `rgba(0,0,0,.20)` | Toolbar and status bar |
| `--ts-me-text` | `#1f2937` | `#cdd8e6` | Text |
| `--ts-me-muted` | `rgba(31,41,55,.55)` | `rgba(205,216,230,.55)` | Placeholder and status text |
| `--ts-me-preview-bg` | `rgba(0,0,0,.02)` | `rgba(255,255,255,.03)` | Preview background |
| `--ts-me-code-bg` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.08)` | Code background in the preview |
| `--ts-me-link` | `#0b8a83` | `#00c7be` | Links in the preview |
| `--ts-me-radius` | `6px` | `6px` | Corner radius |
| `--ts-me-font` | monospace stack | monospace stack | Typing font |
| `--ts-me-font-size` | `15px` | `15px` | Typing size |
| `--ts-me-line-height` | `1.7` | `1.7` | Typing line height |
| `--ts-me-padding` | `16px 18px` | `16px 18px` | Padding of the writing and preview areas |

Theme resolution follows the standard three tiers: `prefers-color-scheme`, then `html.dark` and `[data-bs-theme="dark"]`, then an explicit `[data-bs-theme="light"]` override.

```css
.writer { --ts-me-font: Georgia, serif; --ts-me-font-size: 18px; }
```



## Keyboard Navigation

| Key | Action |
| - | - |
| `Ctrl/⌘ + B`, `I`, `K` | Bold, italic, link |
| `Ctrl/⌘ + S` | Raise `ts.markdowneditor.save` |
| `Ctrl/⌘ + Z`, `Shift + Z` | Native undo and redo, including toolbar edits |
| `Enter` in a list or quote | Continue it. On an empty item, end it |
| `Tab` / `Shift + Tab` in a list | Indent or outdent. Outside lists and multi-line selections Tab keeps its normal focus behavior |
| `Esc` | Leave fullscreen |
| Arrow keys in the toolbar | Handled by PluginToolbar |



## ARIA Wiring

| Element | Attributes |
| - | - |
| Textarea | `aria-label` (from `ariaLabel`) unless it already has one, `spellcheck="true"` |
| Toolbar | Labeled `Markdown formatting`. Buttons have `aria-label` and a `title` with the shortcut |
| View switcher | A single-select toggle group with `aria-pressed` on the active view |
| Status bar | The message slot has `role="status"` |

Toolbar mousedown is prevented so the textarea keeps its caret and selection while you click.



## Recipes

### Form field with Ctrl+S

```js
$('#body').themestrapPluginMarkdownEditor({ view: 'split' });
document.getElementById('body').addEventListener('ts.markdowneditor.save', function () {
    document.getElementById('post-form').requestSubmit();
});
```

### Server-rendered preview

```js
$('#body').themestrapPluginMarkdownEditor({
    view: 'split',
    previewDelay: 300,
    renderer: function (md) {
        return fetch('/admin/render', {
            method: 'POST',
            headers: { 'X-CSRF-Token': token },
            body: new URLSearchParams({ body: md })
        }).then(function (r) { return r.json(); }).then(function (j) { return j.html; });
    }
});
```

If the promise rejects, the preview falls back to escaped plain text. Only the latest result is applied, so fast typing never shows stale output.

### Image upload to your server

```js
imageUpload: function (file) {
    const fd = new FormData();
    fd.append('file', file);
    return fetch('/upload', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (!j.ok) throw new Error(j.error); return j.url; });
}
```

While it runs, the editor inserts `![Uploading name…]()` at the caret and swaps it for the final image, so you can keep typing.

### Local draft safety copy

```js
const KEY = 'draft:post';
$('#body').themestrapPluginMarkdownEditor({
    onChange: function (md) { try { localStorage.setItem(KEY, md); } catch (e) {} }
});
```

### Pair with RichEditor

Keep Markdown as the stored format and let writers choose a mode. Convert with `RichEditor.getMarkdown()` and `setMarkdown()`, and render with the same renderer in both. The Themestrap Blog admin does exactly this.



## Common Pitfalls

**Nothing happens and the console reports a missing file.** `PluginToolbar` must load first, or set `toolbar: false`.

**The host is not a textarea.** The plugin refuses non-textarea hosts and logs an error.

**`$el.on('ts.markdowneditor.change', …)` never fires.** Use `addEventListener` or `onChange`.

**The preview shows raw text.** Neither `PluginMarkdown` nor a `renderer` is available.

**The textarea is tall in write view.** That is `autoGrow`: the page scrolls like a document. Use `autoGrow: false` with a fixed height of your own, or `view: 'split'`.

**Pasting an image inserts nothing.** Paste and drop need `imageUpload`. Without it, the image button inserts an empty `![alt](url)`.

**`Tab` moves focus out of the editor.** By design outside lists and multi-line selections, so keyboard users are never trapped.

**An async renderer returns nothing from `getHtml()`.** `getHtml()` is synchronous. Fetch the HTML yourself or read the preview pane.

### Diagnostic checklist

1. Are `jQuery`, `themestrap.js`, `PluginToolbar` and `PluginMarkdown` loaded before the editor?
2. Is the host a `<textarea>` with `data-plugin-markdowneditor` and no `.manual` (or manually initialized)?
3. Does `$('#host').data('__pluginMarkdownEditor')` return an instance?
4. Is `<style id="ts-markdowneditor-styles">` in `<head>`?
5. Does the wrapper `.ts-mdeditor` have exactly one `.ts-toolbar`?
6. Are you subscribing with `addEventListener` rather than `$.on()`?
