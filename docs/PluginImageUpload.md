# PluginImageUpload Guide

A picture picker for one image, such as an avatar or a logo. It shows the current picture, accepts a click, a drag and drop or a paste, uploads the file with a progress bar, and offers a remove button. The preview is a circle for avatars or a box for logos. There are no dependencies beyond jQuery.

| | |
|---|---|
| Plugin file | `js/components/themestrap.plugin.imageupload.js` |
| Demo | `demos/plugin.demo.imageupload.html` |
| Namespace class | `themestrap.PluginImageUpload` |
| jQuery method | `$.fn.themestrapPluginImageUpload` |
| Data attribute | `data-plugin-imageupload` |
| Instance key | `__pluginImageUpload` |
| Options attribute | `data-plugin-options` |
| CSS token prefix | `--ts-iu-*` |


## How It Works

1. `initialize()` returns early if `$el.data('__pluginImageUpload')` already exists, otherwise it runs `setData → setOptions → build → events`.
2. `build()` injects one shared `<style id="ts-imageupload-styles">` (counted per instance and removed with the last one), **empties the element**, and builds the widget inside it: the picture button, a hidden file input, the Choose and Remove buttons, a status line and the optional note.
3. A click on the picture or the Choose button opens the file chooser. A file can also be dropped on the widget, or pasted when `paste` is on.
4. Before sending, the file must match `accept` (JPG, PNG, GIF or WebP by default), and its size must be at most `maxSize`. A file that fails either check is never sent.
5. The file goes to `endpoint` in a `multipart/form-data` POST, with the progress shown as a bar along the bottom of the picture. Only one request runs at a time.
6. The server answers JSON. `{ "ok": true, "url": "..." }` shows the new picture and fires `ts.imageupload.change`. Anything else shows an error and fires `ts.imageupload.error`.

Rendered structure, with a picture showing:

```html
<div class="ts-iu ts-iu--circle has-image" data-plugin-imageupload>
    <button type="button" class="ts-iu-drop" aria-label="Choose a picture">
        <img class="ts-iu-img" alt="" src="/uploads/avatars/42.jpg">
        <span class="ts-iu-hint"><svg>...</svg><span>Drop a picture here</span></span>
        <span class="ts-iu-bar"></span>
    </button>
    <input type="file" class="ts-iu-file" accept="image/jpeg,image/png,image/gif,image/webp" tabindex="-1" aria-hidden="true">
    <div class="ts-iu-side">
        <div class="ts-iu-row">
            <button type="button" class="btn btn-sm btn-outline-secondary">Change picture</button>
            <button type="button" class="btn btn-sm btn-outline-secondary text-danger">Remove</button>
        </div>
        <p class="ts-iu-msg" role="status" aria-live="polite"></p>
        <p class="ts-iu-note">...</p>   <!-- only with the note option -->
    </div>
</div>
```


## Quick Start

### 1. Include the script

```html
<script src="js/components/themestrap.plugin.imageupload.js"></script>
```

It must load after jQuery and `themestrap.js`. `themestrap.bundle.js` already contains it.

### 2. Add the markup

```html
<div data-plugin-imageupload
     data-plugin-options='{"endpoint": "/account/avatar", "shape": "circle",
                           "current": "/uploads/avatars/42.jpg", "csrf": "..."}'></div>
```

Leave the element empty: the plugin replaces whatever is inside it.

### 3. Answer the requests on the server

The server receives the file under the `field` name (`file` by default) and answers JSON. See [The server contract](#the-server-contract).

`themestrap.init.js` starts every `[data-plugin-imageupload]` that isn't `.manual` as it comes near the screen, and `themestrap.modules.js` defines it as the `imageUpload` module for pages that use the loader.

### Manual init

```html
<div id="logo" class="manual"></div>
```

```js
$('#logo').themestrapPluginImageUpload({
    endpoint: '/admin/identity',
    shape:    'box',
    data:     { kind: 'logo' },
    maxSize:  1024 * 1024
});
```


## Markup Reference

| Attribute / class | On | Purpose |
| --- | --- | --- |
| `data-plugin-imageupload` | an empty `<div>` | Marks it for auto init |
| `data-plugin-options='{"k": "v"}'` | the same element | Options as JSON in a single quoted attribute |
| `.manual` | the same element | Leaves it out of auto init |

State classes on the element:

| Class | When |
| --- | --- |
| `.ts-iu--circle` / `.ts-iu--box` | Always, from `shape` |
| `.has-image` | A picture is showing |
| `.is-over` | A file is being dragged over the widget |
| `.is-busy` | A request is running |
| `.is-off` | After `disable()` |


## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `endpoint` | string | `''` | Where uploads and removals are sent. Empty sends them to the current page. |
| `field` | string | `'file'` | The form field name the file is sent under. |
| `data` | object | `{}` | Extra form fields sent with every request, uploads and removals alike. Values are sent as text. |
| `csrf` | string | `''` | A CSRF token, sent as a `_csrf` form field and an `X-CSRF-Token` header. |
| `current` | string | `''` | The URL of the picture to show at first. Empty: the drop hint. |
| `shape` | string | `'circle'` | `'circle'` for avatars (the picture fills and is cropped) or `'box'` for logos (twice and a bit as wide as it is tall, and the whole picture fits inside). Anything other than `'circle'` gives a box. |
| `accept` | string | `'image/jpeg,image/png,image/gif,image/webp'` | The file chooser's filter, and the check every file must pass before it is sent, however it arrived. Takes MIME types, wildcards such as `image/*` and extensions such as `.svg`, separated by commas. |
| `maxSize` | number | `0` | The largest file, in bytes, that will be sent. `0` leaves the limit to the server. |
| `paste` | boolean | `false` | Upload a picture pasted on the page while the widget is visible and enabled. See [Pasting](#pasting). |
| `note` | string | `''` | A line of help under the buttons. |
| `buttonClass` | string | `'btn btn-sm btn-outline-secondary'` | Classes for the Choose and Remove buttons. |
| `removeClass` | string | `'text-danger'` | Classes added to the Remove button, after `buttonClass`. |
| `labels` | object | see below | Every piece of text the widget shows. |

`labels`:

| Key | Default |
|---|---|
| `choose` | `'Choose a picture'` (also the picture button's `aria-label`) |
| `change` | `'Change picture'` (the Choose button while a picture shows) |
| `remove` | `'Remove'` |
| `drop` | `'Drop a picture here'` |
| `uploading` | `'Uploading…'` |
| `saved` | `'Saved.'` |
| `removed` | `'Removed.'` |
| `failed` | `'The picture could not be saved. Please try again.'` |
| `type` | `'Please use a JPG, PNG, GIF or WebP picture.'` (change it when you change `accept`) |
| `size` | `'That picture is too big.'` |

Merge order: `defaults → opts → { wrapper }`. Called without an options object, the jQuery method reads each element's own `data-plugin-options`. `labels` merges deeply, so you can change one label and keep the rest:

```js
$('#avatar').themestrapPluginImageUpload({ endpoint: '/account/avatar', labels: { choose: 'Upload a photo' } });
```

The button defaults are Bootstrap classes. On a page with its own button styles, pass yours:

```js
{ buttonClass: 'btn-d', removeClass: 'danger' }
```

### Accepting other types

To take SVG logos as well, add the type to `accept` and say so in `labels.type`:

```js
$('#logo').themestrapPluginImageUpload({
    endpoint: '/admin/identity',
    shape: 'box',
    accept: 'image/png,image/jpeg,image/webp,.svg',
    labels: { type: 'Please use a PNG, JPG, WebP or SVG file.' }
});
```

Your server must check SVG files too: they can carry scripts.

### Pasting

With `paste` on, one listener on the page takes every pasted picture and hands it to a single widget:

1. the widget that has focus (its picture or one of its buttons),
2. otherwise the widget clicked or focused last,
3. otherwise the first widget that is on screen,
4. otherwise the first widget on the page.

Only visible, enabled widgets with `paste: true` take part. A paste into a text field outside the widget (an input, a textarea or an editable area such as PluginRichEditor) is left alone, so pasting a picture into an editor never uploads it here.


## The server contract

### Upload

`POST` to `endpoint`, as `multipart/form-data`:

| Field | Value |
|---|---|
| `file` (or your `field`) | The picture |
| each key of `data` | Its value |
| `_csrf` | The `csrf` option, when set |

Headers: `Accept: application/json`, and `X-CSRF-Token` when `csrf` is set. Cookies are sent too (the request uses `withCredentials`).

### Remove

The same `POST`, with no file and with `remove=1`. The Remove button is only shown while there is a picture.

### Answers

| Answer | What the widget does |
|---|---|
| `{ "ok": true, "url": "..." }` to an upload | Shows the picture at `url`, says `labels.saved`, fires `change` with `action: 'upload'` |
| `{ "ok": true }` to a removal | Shows the drop hint, says `labels.removed`, fires `change` with `action: 'remove'` |
| `{ "ok": false, "errors": ["...", "..."] }` | Shows the errors joined with spaces, fires `error` |
| Anything else (not JSON, `ok` missing, a network failure) | Shows `labels.failed`, fires `error` |

The HTTP status code is not checked: only `ok` in the body decides. Answer errors with `ok: false` and whatever status suits your logs.

### A PHP endpoint

```php
<?php
// account/avatar.php
session_start();
header('Content-Type: application/json');

function answer(array $body, int $status = 200): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$token = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
    answer(['ok' => false, 'errors' => ['Your session has expired. Reload the page.']], 403);
}

$dir  = __DIR__ . '/../uploads/avatars/';
$name = 'user-' . (int) $_SESSION['user_id'];

if (($_POST['remove'] ?? '') === '1') {
    array_map('unlink', glob($dir . $name . '.*') ?: []);
    answer(['ok' => true]);
}

$upload = $_FILES['file'] ?? null;
if (!$upload || $upload['error'] !== UPLOAD_ERR_OK) {
    answer(['ok' => false, 'errors' => ['The upload did not arrive. Please try again.']], 400);
}
if ($upload['size'] > 2 * 1024 * 1024) {
    answer(['ok' => false, 'errors' => ['Pictures can be up to 2 MB.']], 413);
}

// Trust the file's contents, not its name or the browser's type
$types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
$type  = (new finfo(FILEINFO_MIME_TYPE))->file($upload['tmp_name']);
if (!isset($types[$type]) || !getimagesize($upload['tmp_name'])) {
    answer(['ok' => false, 'errors' => ['Please use a JPG, PNG, GIF or WebP picture.']], 415);
}

array_map('unlink', glob($dir . $name . '.*') ?: []);
$file = $name . '.' . $types[$type];
move_uploaded_file($upload['tmp_name'], $dir . $file);

// A new query string each time, so browsers don't show the old picture from their cache
answer(['ok' => true, 'url' => '/uploads/avatars/' . $file . '?v=' . time()]);
```


## Public API

```js
const upload = $('#avatar').data('__pluginImageUpload');
```

| Method | Returns | Description |
|---|---|---|
| `setImage(url)` | `this` | Shows the picture at `url`, or the drop hint for `''`. Sends nothing and fires no event. Use it when the picture changed somewhere else. |
| `getImage()` | `string` | The URL of the picture showing, or `''`. |
| `open()` | `this` | Opens the file chooser. Does nothing while a request runs or the widget is disabled. Browsers only open it in response to a click or a key press. |
| `remove()` | `this` | Asks the server to remove the picture (see [Remove](#remove)). Does nothing when no picture shows or a request is running. |
| `disable()` | `this` | Fades the widget, stops it reacting to the pointer, and ignores pastes. Adds `.is-off`. |
| `enable()` | `this` | Undoes `disable()`. |
| `destroy()` | `this` | Cancels a running request, unbinds every handler, **empties the element**, removes its classes and drops the instance. The stylesheet is removed with the last instance on the page. |

The jQuery method also takes a method name, with any arguments after it:

```js
$('#avatar').themestrapPluginImageUpload('disable');
const url = $('#avatar').themestrapPluginImageUpload('getImage').get(0);
```

Names starting with `_` are private and can't be called this way. Without a method name it returns a jQuery collection of instances, so `.get(0)` on the result is the instance. Calling it again on an initialized element returns the existing instance and ignores the new options.


## Events

All events are native `CustomEvent`s dispatched on the element. They bubble. Listen with `addEventListener`.

| Event | `detail` | Fired when |
|---|---|---|
| `ts.imageupload.change` | `{ instance, url, action }` | An upload or a removal succeeded. `action` is `'upload'` or `'remove'`. `url` is the new picture, or `''` after a removal. |
| `ts.imageupload.error` | `{ instance, message }` | A file was refused in the browser (type or size), the server answered `ok: false`, or the request failed. `message` is the text shown in the widget. |

```js
document.getElementById('avatar').addEventListener('ts.imageupload.change', function (e) {
    // update the small avatar in the page header too
    $('.header-avatar').attr('src', e.detail.url || '/img/default-avatar.svg');
});
```

`setImage()` fires nothing.


## CSS Custom Properties

Set them on the element or any ancestor.

| Token | Default | Controls |
|---|---|---|
| `--ts-iu-size` | `7rem` | The circle's size, and the box's height (the box is 2.2 times as wide) |
| `--ts-iu-border` | `--ts-skin-border-strong`, else `rgba(128,128,128,.45)` | The picture area's border, dashed when empty and solid with a picture |
| `--ts-iu-bg` | `--ts-skin-surface-2`, else `rgba(128,128,128,.07)` | The picture area's background |
| `--ts-iu-accent` | `--ts-skin-accent`, else `#00a89f` | Hover and focus border, the drop target tint, the focus ring and the progress bar |
| `--ts-iu-text` | `inherit` | Text color |
| `--ts-iu-muted` | `--ts-skin-text-dim`, else `rgba(128,128,128,.9)` | The drop hint and the note |
| `--ts-iu-radius` | `--ts-skin-radius`, else `10px` | The box's corner radius |
| `--ts-iu-danger` | `--ts-skin-danger`, else `#dc2626` | Error messages |

```css
.profile .ts-iu {
    --ts-iu-size:   9rem;
    --ts-iu-accent: #ff9f43;
}
```

With a skin loaded, the colors and the radius follow it. Without one, the grey defaults read on light and dark pages alike. On a dark page without a skin, lighten the error color: `--ts-iu-danger: #ff8f80`.

The progress bar runs along the bottom of a box, and sits a little higher and narrower inside a circle, where the bottom edge is too short to show it.

---

## Keyboard Navigation

| Key | Focus on | Action |
|---|---|---|
| `Tab` | | Moves to the picture, then Choose, then Remove |
| `Enter` or `Space` | the picture or Choose | Opens the file chooser |
| `Enter` or `Space` | Remove | Removes the picture |
| `Ctrl+V` / `⌘V` | anywhere on the page | Uploads a pasted picture, when `paste` is on |

All three controls are real `<button>` elements. The file input itself is taken out of the tab order.

---

## ARIA Wiring

| Element | Attribute | Value |
|---|---|---|
| `.ts-iu-drop` (the picture) | `aria-label` | `labels.choose` |
| `.ts-iu-img` | `alt` | `''` (the picture is decorative: the button says what it does) |
| `.ts-iu-file` | `aria-hidden`, `tabindex` | `true`, `-1` |
| `.ts-iu-msg` | `role`, `aria-live` | `status`, `polite`. "Uploading…", "Saved." and errors are read out |
| The hint's `<svg>` | `aria-hidden` | `true` |

The picture button keeps the label "Choose a picture" while a picture shows. The visible button next to it switches to "Change picture".

---

## Recipes

### A profile form with an avatar

The upload happens on its own, as soon as a picture is chosen, so the widget can sit inside a form without being part of it:

```html
<form method="post" action="/account">
    <label>Photo</label>
    <div data-plugin-imageupload
         data-plugin-options='{"endpoint": "/account/avatar", "current": "/uploads/avatars/42.jpg", "csrf": "..."}'></div>

    <label for="name">Name</label>
    <input id="name" name="name">
    <button type="submit">Save</button>
</form>
```

The file input has no `name`, so submitting the form never sends the picture again.

### Keep a hidden field in sync

When the form must know the picture's URL:

```html
<input type="hidden" name="logo_url" id="logo-url" value="/uploads/site/logo.png">
```

```js
document.getElementById('logo').addEventListener('ts.imageupload.change', function (e) {
    document.getElementById('logo-url').value = e.detail.url;
});
```

### MODX

Point the endpoint at a resource whose content is an uncached snippet call, and print the picture and the token with your own tags:

```html
<div data-plugin-imageupload
     data-plugin-options='{"endpoint": "[[~42]]", "current": "[[+avatar]]", "csrf": "[[!myCsrfToken]]"}'></div>
```

Here `42` is the endpoint resource, `[[+avatar]]` stands for wherever your template gets the picture's URL, and `myCsrfToken` for your own snippet. Give the endpoint resource an empty template and the JSON content type, and have its snippet do what the PHP example above does.

### Change the labels for another language

```js
$('#avatar').themestrapPluginImageUpload({
    endpoint: '/compte/photo',
    labels: {
        choose: 'Choisir une photo', change: 'Changer la photo', remove: 'Supprimer',
        drop: 'Déposez une photo ici', uploading: 'Envoi…', saved: 'Enregistré.', removed: 'Supprimé.',
        failed: "La photo n'a pas pu être enregistrée.",
        type: 'Utilisez une image JPG, PNG, GIF ou WebP.', size: 'Cette image est trop lourde.'
    }
});
```

### Rebuild after the DOM changes

`destroy()` empties the element, so keep the URL:

```js
const url = $('#avatar').data('__pluginImageUpload').getImage();
$('#avatar').themestrapPluginImageUpload('destroy');
$('#avatar').themestrapPluginImageUpload({ endpoint: '/account/avatar', current: url });
```

---

## Common Pitfalls

**`$('#avatar').on('ts.imageupload.change', ...)` never fires**
jQuery reads the dots as namespaces, so it listens for an event called `ts`. Use `addEventListener`.

**The upload "worked" but the picture went blank**
The server answered `ok: true` without a `url`. The widget shows what `url` says, so an empty one gives the drop hint.

**The old picture still shows after an upload**
The server returned the same URL as before and the browser used its cached copy. Add a version to the URL, such as `?v=` and the time.

**Every upload says "The picture could not be saved"**
The answer wasn't JSON with `ok: true`. Look at the request in the browser's network panel: a PHP warning printed before the JSON, a login page, or a 404 page are the usual causes. With no `endpoint`, the request goes to the page itself.

**An SVG (or HEIC) picture is refused**
Files must match `accept`, which lists JPG, PNG, GIF and WebP by default. Add the type (see [Accepting other types](#accepting-other-types)).

**A pasted picture went to the wrong widget**
With several paste enabled widgets, the one with focus wins, then the one used last, then the first on screen (see [Pasting](#pasting)). Click or focus the widget you mean before pasting, or turn `paste` on for one widget only.

**Pasting does nothing**
`paste` is off by default. The widget also has to be visible and enabled, and the clipboard has to hold a picture (a screenshot, or a picture copied from another page or app), not text. Pastes into a text field outside the widget are ignored on purpose.

**A request to another domain fails**
The request sends cookies, so the other server must answer with `Access-Control-Allow-Credentials: true` and name your origin in `Access-Control-Allow-Origin` (not `*`), and allow the `X-CSRF-Token` header.

**My markup inside the element disappeared**
The plugin empties the element when it is built, and again on `destroy()`. Put fallback content (such as a plain `<input type="file">` for visitors without JavaScript) next to it, not inside.

**A second file is ignored**
Only one request runs at a time. Files chosen, dropped or pasted while one is running are dropped silently.

**The buttons are unstyled**
The defaults are Bootstrap classes (`btn btn-sm btn-outline-secondary`, plus `text-danger` on Remove). On a page without Bootstrap, set `buttonClass` and `removeClass` to your own classes.

**The error text is hard to read on a dark page**
Load a skin, or set `--ts-iu-danger` to a lighter red.

### Diagnostic checklist

1. Is jQuery loaded, then `themestrap.js`, then the plugin (or `themestrap.bundle.js`)?
2. Is `themestrap.init.js` loaded, or is the widget initialized from script? `.manual` widgets must be started by hand.
3. Is `endpoint` set, and does it answer JSON with an `ok` key? Check the network panel.
4. Does the server read the file from the same name as `field` (`file` by default)?
5. Does the upload answer include `url`?
6. Is `data-plugin-options` valid JSON inside a single quoted attribute?
7. Are you listening with `addEventListener` rather than jQuery `.on()`?
8. Does `<style id="ts-imageupload-styles">` exist in `<head>` after init? If not, `build()` never ran.
9. Was the element already initialized? A second call returns the existing instance and ignores new options. Call `destroy()` first.
