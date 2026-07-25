# Lightbox Plugin

A zero-dependency, fully self-contained lightbox for the Themestrap framework. Supports images, HTML5 video, YouTube, Vimeo, and arbitrary iframes — with galleries, captions, keyboard and swipe navigation, and a complete programmatic API. No external libraries required beyond jQuery.

---

## Installation

Place `themestrap.plugin.lightbox.js` after `themestrap.js` on any page that uses the plugin.

```html
<script src="/assets/components/themestrap/js/themestrap.js"></script>
<script src="/assets/components/themestrap/js/components/themestrap.plugin.lightbox.js"></script>
<script src="/assets/components/themestrap/js/themestrap.init.js"></script>
```

The plugin injects its own CSS at first initialization via a guarded `<style>` tag (`id="themestrap-lightbox-css"`). No separate stylesheet is needed.

---

## Auto-Initialization

Add `data-plugin-lightbox` to any anchor or element to have it picked up automatically by `themestrap.init.js` via `execOnceThroughEvent` (fires on first `mouseover`):

```html
<a href="photo-large.jpg" data-plugin-lightbox>
  <img src="photo-thumb.jpg" alt="My photo">
</a>
```

`themestrap.init.js` wiring:

```js
// Lightbox
if ($.isFunction($.fn['themestrapPluginLightbox']) && $('[data-plugin-lightbox]').length) {
    themestrap.fn.execOnceThroughEvent(
        '[data-plugin-lightbox]:not(.manual)',
        'mouseover.trigger.lightbox',
        function() {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginLightbox(opts);
        }
    );
}
```

Add `.manual` to any trigger to opt out of auto-init and initialize it yourself.

---

## Media Types

The plugin detects the media type automatically from the URL. You can also set it explicitly via `data-type`.

| Type | Detection | Notes |
|---|---|---|
| `image` | `.jpg .jpeg .png .gif .webp .avif .svg` extension | Loaded as `<img>` |
| `video` | `.mp4 .webm .ogg .ogv` extension | Loaded as `<video controls>` |
| `youtube` | `youtube.com` or `youtu.be` in URL | Embedded as `<iframe>` with autoplay |
| `vimeo` | `vimeo.com` in URL | Embedded as `<iframe>` with autoplay |
| `iframe` | Anything else | Loaded as a plain `<iframe>` |

Override auto-detection:

```html
<a href="https://example.com/embed/something"
   data-plugin-lightbox
   data-type="iframe">Embedded page</a>
```

---

## Galleries

Link multiple triggers into a gallery by giving them the same `data-lightbox-group` value. Items are collected in document order.

```html
<a href="full-1.jpg" data-plugin-lightbox data-lightbox-group="portfolio" data-caption="Shot 1">
  <img src="thumb-1.jpg" alt="Shot 1">
</a>
<a href="full-2.jpg" data-plugin-lightbox data-lightbox-group="portfolio" data-caption="Shot 2">
  <img src="thumb-2.jpg" alt="Shot 2">
</a>
<a href="full-3.jpg" data-plugin-lightbox data-lightbox-group="portfolio" data-caption="Shot 3">
  <img src="thumb-3.jpg" alt="Shot 3">
</a>
```

When a group has more than one item, previous/next arrow buttons and an item counter (`1 / 3`) appear automatically. All navigation methods become active.

---

## Captions

Captions are resolved from three sources in priority order:

1. `data-caption` attribute on the trigger
2. `title` attribute on the trigger
3. `alt` attribute on a child `<img>`

```html
<!-- Highest priority -->
<a href="photo.jpg" data-plugin-lightbox data-caption="Explicit caption">...</a>

<!-- Fallback to title -->
<a href="photo.jpg" data-plugin-lightbox title="From title attribute">...</a>

<!-- Fallback to img alt -->
<a href="photo.jpg" data-plugin-lightbox>
  <img src="thumb.jpg" alt="From alt text">
</a>
```

---

## Media URL Resolution

The source URL is read from, in order:

1. `href` attribute (primary — use this for `<a>` elements)
2. `data-src` attribute (use this for non-anchor triggers)
3. The `src` of a child `<img>` (fallback)

```html
<!-- Anchor — href is the source -->
<a href="photo.jpg" data-plugin-lightbox>Open</a>

<!-- Non-anchor — use data-src -->
<button data-plugin-lightbox data-src="photo.jpg">Open</button>
<span   data-plugin-lightbox data-src="photo.jpg">Open</span>
```

---

## Navigation

Inside an open lightbox:

| Action | Result |
|---|---|
| `←` arrow key | Previous item |
| `→` arrow key | Next item |
| `Escape` | Close |
| Click prev/next buttons | Navigate |
| Swipe left | Next item |
| Swipe right | Previous item |
| Click backdrop | Close (if `closeOnBackdrop: true`) |
| Click `×` button | Always closes |

---

## Options

Options can be set via `data-plugin-options` (single-quoted attribute, double-quoted JSON keys) or passed to the jQuery method.

```html
<a href="large.jpg"
   data-plugin-lightbox
   data-plugin-options='{"closeOnBackdrop": false, "mediaWidth": 1200}'>
  Open
</a>
```

| Option | Type | Default | Description |
|---|---|---|---|
| `group` | `string\|null` | `null` | Gallery group name. Also read from `data-lightbox-group` on the trigger. |
| `closeOnBackdrop` | `boolean` | `true` | Allow clicking the dark overlay to close. |
| `iframeWidth` | `number` | `853` | Default `<iframe>` width in pixels (YouTube, Vimeo, custom). |
| `iframeHeight` | `number` | `480` | Default `<iframe>` height in pixels. |
| `mediaWidth` | `number\|null` | `null` | Override maximum image width in pixels. |
| `mediaHeight` | `number\|null` | `null` | Override maximum image height in pixels. |
| `videoAutoplay` | `boolean` | `false` | Autoplay `<video>` elements when opened. |
| `onOpen` | `function\|null` | `null` | Callback fired when the overlay opens. Receives `(item, index)`. |
| `onClose` | `function\|null` | `null` | Callback fired when the overlay closes. No arguments. |
| `onItemLoad` | `function\|null` | `null` | Callback fired when a media item finishes loading. Receives `(item, index)`. |

---

## Programmatic API

Initialize manually (add `.manual` to prevent auto-init):

```html
<a href="photo.jpg"
   data-lightbox-group="my-gallery"
   data-caption="Item one"
   class="manual"
   id="my-trigger">
  <img src="thumb.jpg" alt="Item one">
</a>
```

```js
const lb = $('#my-trigger').themestrapPluginLightbox({
    group: 'my-gallery',
    onOpen:     (item, idx) => console.log('opened', idx, item),
    onClose:    ()          => console.log('closed'),
    onItemLoad: (item, idx) => console.log('loaded', idx),
});
```

### Retrieve an existing instance

```js
const lb = $('#my-trigger').data('__pluginLightbox');
```

### Methods

| Method | Returns | Description |
|---|---|---|
| `.open(index)` | `this` | Open the lightbox at the given zero-based item index. |
| `.close()` | `this` | Close the lightbox with fade-out transition. |
| `.next()` | `this` | Advance to the next item (wraps). No-op for single-item lightboxes. |
| `.prev()` | `this` | Go to the previous item (wraps). No-op for single-item lightboxes. |
| `.goTo(index)` | `this` | Jump to a specific zero-based index. |
| `.isOpen()` | `boolean` | Returns `true` if the overlay is currently visible. |
| `.destroy()` | `this` | Remove event bindings, ARIA attributes, and the instance data key. |

---

## Callback item object

The `item` argument passed to `onOpen` and `onItemLoad` has this shape:

```js
{
    src:      'https://example.com/photo.jpg', // resolved media URL
    caption:  'My caption',                    // resolved caption string
    type:     'image',                         // detected type string
    $trigger: jQuery                           // the original trigger element
}
```

---

## YouTube / Vimeo

Point `href` (or `data-src`) at any standard YouTube or Vimeo URL. The plugin extracts the video ID and builds the embed URL with `autoplay=1`.

```html
<!-- YouTube — long URL -->
<a href="https://www.youtube.com/watch?v=ScMzIvxBSi4" data-plugin-lightbox>
  <img src="https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg" alt="Video thumbnail">
</a>

<!-- YouTube — short URL -->
<a href="https://youtu.be/ScMzIvxBSi4" data-plugin-lightbox>Watch</a>

<!-- Vimeo -->
<a href="https://vimeo.com/76979871" data-plugin-lightbox>Vimeo clip</a>
```

Control the player dimensions with `iframeWidth` and `iframeHeight`:

```html
<a href="https://youtu.be/ScMzIvxBSi4"
   data-plugin-lightbox
   data-plugin-options='{"iframeWidth": 1280, "iframeHeight": 720}'>
  Watch in HD frame
</a>
```

---

## HTML5 Video

```html
<a href="/video/demo.mp4"
   data-plugin-lightbox
   data-plugin-options='{"videoAutoplay": true}'
   data-caption="Product demo video">
  <img src="/video/demo-poster.jpg" alt="Watch the demo">
</a>
```

`<video>` elements are rendered with native browser controls. Set `videoAutoplay: true` to start playback immediately on open.

---

## Keyboard Accessibility

Every trigger receives `role="button"` and `tabindex="0"` automatically (unless `tabindex` is already set). The lightbox dialog receives focus on open and responds to all keyboard navigation listed above. The close button and arrow buttons are proper `<button>` elements with `aria-label` attributes.

---

## Recipes

### Gallery with Play-Button Overlay (YouTube)

```html
<a href="https://www.youtube.com/watch?v=VIDEO_ID"
   data-plugin-lightbox
   data-lightbox-group="videos"
   data-caption="Product walkthrough"
   style="position:relative; display:inline-block;">
  <img src="https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg" alt="Walkthrough">
  <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
               background:rgba(0,0,0,.4);">
    &#9654;
  </span>
</a>
```

### Lightbox from a Button (not an image)

```html
<a href="infographic.jpg"
   data-plugin-lightbox
   data-caption="Q3 2025 Results">
  <button type="button" class="btn btn-primary">View Infographic</button>
</a>
```

### Open Programmatically on Page Load

```js
$(() => {
    $('#my-trigger')
        .addClass('manual')
        .themestrapPluginLightbox({ group: 'hero' })
        .data('__pluginLightbox')
        .open(0);
});
```

### Reinit After AJAX Content Injection

```js
$('#new-content').find('[data-plugin-lightbox]:not(.manual)').each(function() {
    const $el  = $(this);
    const opts = themestrap.fn.getOptions($el.data('plugin-options')) || undefined;
    $el.themestrapPluginLightbox(opts);
});
```

### Destroy and Re-Init with New Options

```js
const lb = $('#trigger').data('__pluginLightbox');
if (lb) lb.destroy();

$('#trigger').themestrapPluginLightbox({
    iframeWidth:  1280,
    iframeHeight: 720,
});
```

---

## Diagnostics

**Lightbox does not open on click**

- Confirm `themestrap.plugin.lightbox.js` is loaded after `themestrap.js`.
- Check the trigger has `data-plugin-lightbox` (or was passed to `$.fn.themestrapPluginLightbox()`).
- Triggers with `.manual` class will not auto-init — call `.themestrapPluginLightbox()` manually.
- Verify the `href` or `data-src` value is a non-empty string.

**Gallery arrows do not appear**

- All gallery items must share the same `data-lightbox-group` value.
- At least two items must be present in that group in the DOM.
- The group name is read at init time — add items before calling `.themestrapPluginLightbox()`.

**YouTube / Vimeo shows a blank iframe**

- Confirm the URL contains a recognisable video ID (e.g. `?v=`, `/vi/`, `youtu.be/`, `vimeo.com/`).
- Ensure the page is served over HTTPS — autoplay in iframes requires a secure context.
- Some browsers block autoplay without prior user interaction. Trigger open from a click event.

**CSS not injecting**

- The style tag is injected once, guarded by `id="themestrap-lightbox-css"`. If another element in the page already has that ID, the injection will be skipped. Rename or remove the conflicting element.

**`Cannot read properties of undefined (reading 'getOptions')`**

- `themestrap.js` was not loaded before the lightbox plugin. Check script load order.

**Instance not found via `.data('__pluginLightbox')`**

- The element may not have been initialized yet (auto-init fires on first `mouseover` in production wiring). Access the instance from within a callback, or call `.themestrapPluginLightbox()` explicitly.