# PluginRichEditor

A lightweight `contenteditable` rich-text editor for Themestrap. **PluginToolbar** renders the formatting controls, **PluginDialog** owns the link dialog, and the editor itself adds selection handling, safe URL normalization, plain-text paste, and light/dark theming. No vendor dependencies.

| Feature | Notes |
| - | - |
| Inline formatting | Bold, italic, underline, strikethrough |
| Lists | Bullet and numbered |
| Links | Insert, edit, and remove through a dialog, with URL normalization and a protocol allowlist |
| Clear formatting | Removes inline formatting from the selection |
| Toolbar | Any subset of commands, or none at all (`toolbar: false`) |
| Theming | `prefers-color-scheme`, `html.dark` / `[data-bs-theme="dark"]`, explicit `[data-bs-theme="light"]`, and `--ts-re-*` tokens |
| Paste | Plain text by default, rich paste on request |
| Form use | `getContent()` returns `''` when the editor is visually empty |



## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance, then stores the host element and reads the seed markup.
2. **`setData`** stores the instance on the host as `__pluginRichEditor`.
3. **`setOptions`** merges `PluginRichEditor.defaults` with your options. Arrays (`toolbar`, `allowedProtocols`) are replaced, never merged index by index.
4. **`build`** verifies dependencies, injects the stylesheet once, moves any markup found inside the host into the editable area, and builds the toolbar and the link dialog.
5. **`events`** binds the toolbar, editable, document `selectionchange`, and dialog handlers.
6. **`destroy`** unbinds everything, removes the toolbar and dialog, and writes the current content back into the host element.

### Rendered DOM

```html
<div data-plugin-richeditor class="ts-richeditor ts-re-focused">
    <div class="ts-toolbar">…</div>                      <!-- PluginToolbar -->
    <div class="ts-re-content" contenteditable="true"
         role="textbox" aria-multiline="true"
         aria-label="Rich text editor" data-placeholder="Write your message…"></div>
</div>

<!-- appended to <body> so it can escape overflow and stacking contexts -->
<div data-plugin-dialog id="ts-re-dlg-1">…</div>         <!-- PluginDialog -->
```

### Dependencies

| Plugin | Required when |
| - | - |
| `PluginToolbar` | The toolbar is enabled (any command in `toolbar`) |
| `PluginDialog` | The `link` command is enabled |

With `toolbar: false`, neither plugin is required. A missing dependency is reported through `themestrap.fn.showErrorMessage`, the instance is not created, and the host element is left untouched.

### Stylesheet injection

The `<style id="ts-richeditor-styles">` tag is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed. No separate CSS import is needed.

### Editing engine

Formatting uses `document.execCommand`. It is formally deprecated but supported by every evergreen browser, keeps the native undo stack intact, and is the only approach that needs no editor model. On focus the editor sets `defaultParagraphSeparator` to `p` so all browsers produce `<p>` blocks rather than bare `<div>`s.



## Quick Start

### Include the plugin

```html
<!-- After jQuery and themestrap.js -->
<script src="js/components/themestrap.plugin.toolbar.js"></script>
<script src="js/components/themestrap.plugin.dialog.js"></script>
<script src="js/components/themestrap.plugin.richeditor.js"></script>
```

### Minimal editor

```html
<div id="message" data-plugin-richeditor></div>
```

### With options

```html
<div data-plugin-richeditor
     data-plugin-options='{
         "placeholder": "Write your message…",
         "minHeight": 200,
         "toolbar": ["bold", "italic", "|", "ul", "ol", "|", "link"]
     }'></div>
```

### With seed content

Markup inside the host becomes the initial content.

```html
<div data-plugin-richeditor>
    <p>Hello <strong>world</strong>.</p>
</div>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// RichEditor
if (typeof $.fn['themestrapPluginRichEditor'] === 'function' &&
    $('[data-plugin-richeditor]').length) {
    themestrap.fn.intObsInit(
        '[data-plugin-richeditor]:not(.manual)',
        'themestrapPluginRichEditor'
    );
}
```

### Manual init

Add `.manual` to the host to skip auto-init, then initialize with options that cannot live in a data attribute, such as callbacks.

```html
<div id="compose" class="manual" data-plugin-richeditor></div>
```

```js
$('#compose').themestrapPluginRichEditor({
    onChange: function (html) { $('#body-field').val(html); }
});
```

### Module loader entry

If you use `themestrap.modules.js`, declare both dependencies so they load first. Adjust the keys to match the names in your manifest.

```js
.definePlugin('richEditor', {
    src:      'components/themestrap.plugin.richeditor.js',
    deps:     ['toolbar', 'dialog'],
    selector: '[data-plugin-richeditor]',
    method:   'themestrapPluginRichEditor',
    strategy: 'intObs'
})
```



## Markup Reference

| Attribute / class | Element | Notes |
| - | - | - |
| `data-plugin-richeditor` | Host `<div>` | Init hook. Existing children become the initial content. |
| `data-plugin-options` | Host | JSON options. Callbacks cannot be expressed here. |
| `.manual` | Host | Excludes the element from auto-init. |

The plugin defines no other `data-*` slots. Everything inside the host is generated.

### Generated classes

| Class | Element | Meaning |
| - | - | - |
| `ts-richeditor` | Host | Applied on init, removed on destroy. |
| `ts-re-focused` | Host | The editable has focus. |
| `ts-re-disabled` | Host | `disable()` is active. |
| `ts-re-content` | Editable | The `contenteditable` area. |
| `ts-re-empty` | Editable | No text, image, rule, or list item. Drives the placeholder. |
| `ts-re-link-input`, `ts-re-link-error` | Dialog | URL field and its inline error. |
| `ts-re-dlg-confirm`, `ts-re-dlg-cancel`, `ts-re-dlg-remove` | Dialog | Dialog buttons. |

### Toolbar commands

Use these keys in the `toolbar` array. Unknown keys are ignored, and the raw `execCommand` names in the second column are accepted for backwards compatibility.

| Key | `execCommand` | Group | Shortcut |
| - | - | - | - |
| `bold` | `bold` | Inline (toggle) | Ctrl/⌘+B |
| `italic` | `italic` | Inline (toggle) | Ctrl/⌘+I |
| `underline` | `underline` | Inline (toggle) | Ctrl/⌘+U |
| `strike` | `strikeThrough` | Inline (toggle) | none |
| `ul` | `insertUnorderedList` | List (toggle) | none |
| `ol` | `insertOrderedList` | List (toggle) | none |
| `link` | none (opens the dialog) | Action | Ctrl/⌘+K |
| `clearFormat` | `removeFormat` | Action | none |

Groups are derived automatically, and a separator is drawn between non-empty groups. `"|"` entries in the array are accepted but ignored.



## Configuration Options

Options are read from `data-plugin-options` (JSON) or passed to `.themestrapPluginRichEditor({...})`.

| Option | Type | Default | Description |
| - | - | - | - |
| `placeholder` | `string` | `'Write your message…'` | Shown while the editor is empty. Also written to `aria-placeholder`. |
| `ariaLabel` | `string` | `'Rich text editor'` | Accessible name of the editable area. |
| `minHeight` | `number \| string` | `'220px'` | Minimum height. Numbers are treated as pixels. |
| `maxHeight` | `number \| string \| null` | `null` | Maximum height. The area scrolls beyond it. |
| `toolbar` | `string[] \| false` | `['bold','italic','underline','strike','\|','ul','ol','\|','link','clearFormat']` | Commands to show. `false` renders no toolbar and builds no link dialog. |
| `toolbarOptions` | `object` | `{ ariaLabel: 'Text formatting', size: 'sm', full: true }` | Passed to `themestrapPluginToolbar`. |
| `dialogOptions` | `object` | `{ animationIn: 'zoomIn', animationOut: 'zoomOut', closeOnBackdrop: true, scrollLock: false }` | Passed to `themestrapPluginDialog`. |
| `linkTarget` | `string` | `'_blank'` | `target` written to links you create or edit. Also sets `rel="noopener noreferrer"`. Use `''` to write neither. |
| `allowedProtocols` | `string[]` | `['http','https','mailto','tel']` | Schemes accepted by the link dialog. |
| `pastePlainText` | `boolean` | `true` | Strip formatting from pasted content. |
| `disabled` | `boolean` | `false` | Start in the disabled state. |
| `onChange` | `function \| null` | `null` | `function (html) {}` called on every edit. `this` is the instance. |
| `onFocus` | `function \| null` | `null` | `function () {}`. `this` is the instance. |
| `onBlur` | `function \| null` | `null` | `function () {}`. `this` is the instance. |

`linkTarget` and `allowedProtocols` are read when a link is applied, so changing them on a live instance takes effect immediately:

```js
const editor = $('#message').data('__pluginRichEditor');
editor.options.linkTarget = '';
```

`placeholder`, `minHeight`, `maxHeight`, and `toolbar` are applied once in `build()`. To change them, `destroy()` and initialize again.

### URL normalization

The link dialog normalizes input before it is written to an `href`. Whitespace and control characters are removed first.

| Input | Result |
| - | - |
| `example.com` | `https://example.com` |
| `https://example.com/a` | unchanged |
| `me@example.com` | `mailto:me@example.com` |
| `tel:+15551234567` | unchanged |
| `/docs`, `#top`, `?q=1` | unchanged (relative) |
| `javascript:alert(1)` | refused |
| `data:text/html,…` | refused |
| `ftp://host/file` | refused unless `"ftp"` is in `allowedProtocols` |
| `localhost:3000` | refused (`localhost:` parses as a scheme) |

A refused value shows an inline error in the dialog and nothing is inserted.



## Public API

Retrieve the instance from the host element:

```js
const editor = $('#message').data('__pluginRichEditor');
```

| Method | Returns | Description |
| - | - | - |
| `getContent()` | `string` | The HTML. Returns `''` when the editor is empty. |
| `getText()` | `string` | The plain text. |
| `setContent(html)` | `this` | Replaces the content. Does not sanitize and does not fire a change event. |
| `isEmpty()` | `boolean` | `true` when there is no text and no `img`, `hr`, or `li`. |
| `clear()` | `this` | Shorthand for `setContent('')`. |
| `focus()` | `this` | Moves focus into the editable area. |
| `enable()` | `this` | Re-enables editing. |
| `disable()` | `this` | Sets `contenteditable="false"` and `aria-disabled="true"`, and blocks pointer input on the toolbar. |
| `destroy()` | `this` | Removes the toolbar, dialog, handlers, and stylesheet (when it is the last instance), and writes the current content back into the host. |

### Instance properties

| Property | Description |
| - | - |
| `$el` | The host element. |
| `$editable` | The `contenteditable` element. |
| `$toolbarEl` | The toolbar host, or `undefined` when `toolbar: false`. |
| `$dialog` | The link dialog element on `<body>`, or `undefined` when `link` is not enabled. |
| `options` | The merged options, including `wrapper`. |

### jQuery bridge

```js
$('.editor').themestrapPluginRichEditor(opts);   // returns a jQuery set of instances
```

The bridge returns the instances, not the elements, so it is not chainable like a normal jQuery method. Retrieve instances from a fresh selection with `.data('__pluginRichEditor')`.



## Events

### Events dispatched by the editor

Native `CustomEvent`s dispatched on the host element. They bubble, and `detail.instance` is the editor.

| Event | When |
| - | - |
| `ts.richeditor.change` | After every edit (typing, paste, toolbar command, link change). Not fired by `setContent()` or `clear()`. |
| `ts.richeditor.focus` | The editable gains focus. |
| `ts.richeditor.blur` | The editable loses focus. |

```js
document.getElementById('message').addEventListener('ts.richeditor.change', function (e) {
    console.log(e.detail.instance.getContent());
});
```

> **Use `addEventListener`, not `$.on()`.** jQuery parses dots in an event name as namespaces, so `$el.on('ts.richeditor.change', …)` subscribes to an event called `ts` and never fires. The callbacks `onChange`, `onFocus`, and `onBlur` are an alternative that avoids the problem.

### Callbacks

```js
$('#message').themestrapPluginRichEditor({
    onChange: function (html) { /* this === editor instance */ },
    onFocus:  function ()     { },
    onBlur:   function ()     { }
});
```

### Events consumed from dependencies

| Event | Source | Handling |
| - | - | - |
| `toolbar:toggle` | PluginToolbar (native) | Runs the formatting command in `detail.value`. |
| `toolbar:button` | PluginToolbar (native) | Opens the link dialog for `link`, otherwise runs the command. |
| `dialog:open` | PluginDialog (jQuery) | Pre-fills the URL field and switches the dialog between insert and edit mode. |



## CSS Custom Properties

Every token is optional. Each has a light and a dark default, so overriding a token replaces it in both themes.

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-re-bg` | `#ffffff` | `rgba(255,255,255,.02)` | Editor background |
| `--ts-re-border` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.10)` | Border and toolbar divider |
| `--ts-re-border-focus` | `#00a89f` | `#00c7be` | Focus border and ring, dialog input focus, confirm button |
| `--ts-re-toolbar-bg` | `rgba(0,0,0,.035)` | `rgba(0,0,0,.20)` | Toolbar strip |
| `--ts-re-text` | `#1f2937` | `#cdd8e6` | Content text |
| `--ts-re-placeholder` | `rgba(31,41,55,.42)` | `rgba(205,216,230,.35)` | Placeholder text |
| `--ts-re-link` | `#0b8a83` | `#00c7be` | Links inside the content |
| `--ts-re-radius` | `6px` | `6px` | Corner radius |
| `--ts-re-padding` | `14px 16px` | `14px 16px` | Content padding |
| `--ts-re-accent-contrast` | `#04211f` | `#04211f` | Text color on the dialog confirm button |

### Theme resolution

The editor follows the standard three-tier pattern:

1. `@media (prefers-color-scheme: dark)`
2. `html.dark` and `[data-bs-theme="dark"]` ancestors
3. `[data-bs-theme="light"]` ancestors, as an explicit override of the first two

```html
<div data-bs-theme="light">
    <div data-plugin-richeditor></div>   <!-- light, even on a dark OS -->
</div>
```

### Scoping tokens

```css
/* One editor */
.re-brand {
    --ts-re-border-focus: #e8672a;
    --ts-re-radius:       14px;
}

/* Every editor and the link dialog */
:root {
    --ts-re-border-focus: #e8672a;
}
```

The link dialog is appended to `<body>`, outside the host, so tokens set on the host reach the editor but not the dialog. Set them on `:root` to restyle both. The dialog panel itself is themed by PluginDialog, and the dialog controls use `currentColor` so they follow it.

### PluginToolbar variables

Inside the editor the toolbar shell is made flush with the container by overriding `--ts-tb-bg`, `--ts-tb-border`, `--ts-tb-shadow`, and `--ts-tb-radius` on `.ts-richeditor .ts-toolbar`. Use `--ts-re-toolbar-bg` to change its background rather than setting the toolbar variables directly.



## Keyboard Navigation

| Key | Context | Action |
| - | - | - |
| `Ctrl/⌘ + B`, `I`, `U` | Editable | Native bold, italic, underline. Works even with `toolbar: false`. |
| `Ctrl/⌘ + K` | Editable | Open the link dialog. Disabled when `link` is not in `toolbar`. |
| `Ctrl/⌘ + Z`, `Shift + Z` | Editable | Native undo and redo. |
| `Enter` | Link dialog URL field | Apply the link. |
| `Esc` | Link dialog | Close the dialog (PluginDialog). |
| `Tab` / `Shift + Tab` | Link dialog | Cycle within the dialog (PluginDialog focus trap). |
| Arrow keys | Toolbar | Move between toolbar items (handled by PluginToolbar). |

`Ctrl/⌘ + K` is handled only while the editable has focus, so it does not collide with a page-level command palette elsewhere on the page.



## ARIA Wiring

| Element | Attributes |
| - | - |
| Editable | `role="textbox"`, `aria-multiline="true"`, `aria-label` (from `ariaLabel`), `aria-placeholder` (from `placeholder`), `aria-disabled="true"` while disabled |
| Toolbar | Labeled with `toolbarOptions.ariaLabel` (`"Text formatting"`); each group carries a group label (`Inline formatting`, `List formatting`); keyboard navigation and roles are handled by PluginToolbar |
| Toggle buttons | `aria-label`, and `aria-pressed` kept in sync with the real formatting state at the caret (`queryCommandState`) |
| Action buttons | `aria-label` and a `title` that includes the shortcut |
| Link dialog | Modal semantics, focus trap, and focus return handled by PluginDialog; title and description come from `data-dialog-title` and `data-dialog-description` |
| URL field | Associated `<label for>`, `aria-invalid` toggled on a rejected value |
| Error message | `role="alert"`, so it is announced when it appears |

Icons are `aria-hidden="true"`; the buttons are named through `aria-label`.



## Recipes

### Compose form with a hidden field

The editor is not a form control. Mirror it into a hidden input so a normal submit or serialization picks it up.

```html
<form id="compose-form" novalidate>
    <input type="text" id="subject" class="form-control mb-3" placeholder="Subject">
    <div id="body-editor" class="manual" data-plugin-richeditor></div>
    <input type="hidden" name="body" id="body-field">
    <button type="submit" class="btn btn-primary mt-3">Send</button>
</form>
```

```js
$('#body-editor').themestrapPluginRichEditor({
    onChange: function (html) { $('#body-field').val(html); }
});

$('#compose-form').on('submit', function (e) {
    const editor = $('#body-editor').data('__pluginRichEditor');
    if (editor.isEmpty()) { e.preventDefault(); editor.focus(); }
});
```

### Comment box

```html
<div data-plugin-richeditor
     data-plugin-options='{"toolbar": false, "placeholder": "Add a comment…", "minHeight": 72, "maxHeight": 200}'></div>
```

### Character counter

```js
$('#message').themestrapPluginRichEditor({
    onChange: function () {
        const n = this.getText().length;
        $('#counter').text(n + ' / 500').toggleClass('text-danger', n > 500);
    }
});
```

### Autosave a draft

```js
const KEY = 'draft:compose';
let timer;

$('#message').themestrapPluginRichEditor({
    onChange: function (html) {
        clearTimeout(timer);
        timer = setTimeout(function () {
            try { localStorage.setItem(KEY, html); } catch (err) { /* storage unavailable */ }
        }, 600);
    }
});

try {
    const saved = localStorage.getItem(KEY);
    if (saved) { $('#message').data('__pluginRichEditor').setContent(saved); }
} catch (err) { /* storage unavailable */ }
```

### Read-only display

```js
$('#preview').themestrapPluginRichEditor({ toolbar: false, disabled: true, minHeight: 0 });
```

### Allow rich paste

```js
$('#message').themestrapPluginRichEditor({ pastePlainText: false });
```

Pasted HTML is then inserted as the browser provides it, including inline styles and classes from the source page. Pair it with the sanitizer below on read, and with server-side sanitization on write.

### Sanitize before `setContent()`

`setContent()` inserts the HTML you give it. For content that did not come from this editor, run it through an allowlist first.

```js
function sanitize(html) {
    const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'UL', 'OL', 'LI', 'A']);
    const doc = new DOMParser().parseFromString(html, 'text/html');

    (function clean(node) {
        Array.from(node.children).forEach(function (child) {
            if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED)$/.test(child.tagName)) { child.remove(); return; }
            clean(child);
            if (!allowed.has(child.tagName)) { child.replaceWith(...child.childNodes); return; }
            Array.from(child.attributes).forEach(function (attr) {
                if (!(child.tagName === 'A' && attr.name === 'href')) { child.removeAttribute(attr.name); }
            });
            if (child.tagName === 'A' && /^\s*javascript:/i.test(child.getAttribute('href') || '')) {
                child.removeAttribute('href');
            }
        });
    }(doc.body));

    return doc.body.innerHTML;
}

editor.setContent(sanitize(savedHtml));
```

Client-side cleaning is a convenience. Always sanitize again on the server before storing or rendering the HTML for other users.

### Change options at runtime

```js
const $el = $('#message');
$el.data('__pluginRichEditor').destroy();          // content is written back into the host
$el.themestrapPluginRichEditor({ minHeight: 320 }); // and picked up as the seed
```



## Common Pitfalls

**The editor never appears and the console reports a missing file.**
`PluginToolbar` or `PluginDialog` was not loaded before the editor. Include both first, or use `toolbar: false` if you need neither.

**`$el.on('ts.richeditor.change', …)` never fires.**
jQuery treats the dots as namespaces. Subscribe with `el.addEventListener('ts.richeditor.change', …)` or use the `onChange` callback.

**`$('#x').themestrapPluginRichEditor().data('__pluginRichEditor')` returns nothing useful.**
The bridge returns a set of instances, not the element. Retrieve the instance from a fresh selection: `$('#x').data('__pluginRichEditor')`.

**`getContent()` returns `''` although the editor looks like it has content.**
`isEmpty()` treats content as empty when it has no text and no `img`, `hr`, or `li`. An empty `<p><br></p>` is empty, but a bare image is not.

**A pasted table or styled text loses its formatting.**
`pastePlainText` defaults to `true`. Set it to `false` for rich paste, and sanitize the result.

**The dialog ignores my custom accent color.**
Tokens set on the host do not reach the dialog, which lives on `<body>`. Set them on `:root`.

**A link is refused although the URL looks valid.**
The protocol is not in `allowedProtocols`, or the value parses as a scheme, as with `localhost:3000`. Use `http://localhost:3000`.

**New links do not open in a new tab.**
`linkTarget` is `''`, or the link was created before the option changed. The option is applied when a link is inserted or edited, not retroactively.

**`setContent()` does not trigger my change handler.**
By design. Programmatic writes do not dispatch `ts.richeditor.change`. Call your handler yourself, or read the value after the call.

**The host's existing children disappeared after init.**
They became the editor content. They are restored to the host by `destroy()`. Do not use the host for anything other than seed markup.

**Content ends up in `<div>` blocks instead of `<p>`.**
The default paragraph separator is set to `p` when the editable gains focus. Content written with `setContent()` keeps whatever markup you gave it, and the first line typed before focus is unaffected.

**The editor is not included in `FormData`.**
It is not a form control. Mirror the HTML into a hidden input with `onChange`.

### Diagnostic checklist

1. Are `jQuery`, `themestrap.js`, `PluginToolbar`, `PluginDialog`, and `PluginRichEditor` loaded, in that order?
2. Does the host have `data-plugin-richeditor` and lack `.manual` (or is it initialized manually)?
3. Does `$('#host').data('__pluginRichEditor')` return an instance? If not, watch the console for a dependency error.
4. Is `<style id="ts-richeditor-styles">` present in `<head>`?
5. Does `$('#host').children('.ts-toolbar').length` equal `1` (or `0` when `toolbar: false`)?
6. Is there a `[data-plugin-dialog]` element with an id starting `ts-re-dlg-` on `<body>` when `link` is enabled?
7. Are you subscribing to events with `addEventListener` or the callbacks rather than `$.on()`?
8. Is a theme ancestor (`[data-bs-theme]`, `html.dark`) overriding the scheme you expect?
9. If the toolbar shows the wrong pressed state, is the caret actually inside the editable? State is only synchronized while it has focus.
