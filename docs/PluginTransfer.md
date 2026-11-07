# PluginTransfer

Live progress for downloads, uploads, file copies and other long-running jobs. One element shows bytes done and total, a smoothed speed, time left, the job state, an indeterminate mode and an optional cancel button.

- **File:** `js/components/themestrap.plugin.transfer.js`
- **Namespace:** `themestrap.PluginTransfer`
- **jQuery bridge:** `$.fn.themestrapPluginTransfer`
- **Instance key:** `__pluginTransfer`
- **Dependencies:** jQuery and `themestrap.js`. No vendor libraries, no separate stylesheet.

---

## How It Works

PluginTransfer is a display, not a transport. It never downloads or uploads anything itself. Your code does the work and reports numbers with `update()`; the plugin turns those numbers into a readable status block.

1. **Build.** On initialization the plugin builds its own markup inside the host element and injects its CSS into the page once, on first use. The host element's original markup and classes are saved so `destroy()` can restore them.
2. **Report.** Each `update(done, total)` call stores the byte counts and recalculates the percentage.
3. **Derive.** Speed is derived from successive `update()` calls. Samples are taken at most every `sampleMs` milliseconds and folded into an exponential moving average weighted by `smoothing`. Time left is `(total - done) / speed`. If you already know the speed (a server reports it, for example), pass it in and the derivation is skipped.
4. **Hide.** Any readout with nothing to show hides itself. No total means no percentage and no time left; no label means no heading. The same element works as a bare bar or as a full status block.
5. **State.** The root carries one state class at a time (`.is-running`, `.is-done`, …). Colors, the cancel button and animations follow the state.

### Why it initializes at DOM ready

Most Themestrap plugins initialize lazily through `themestrap.fn.intObsInit()`. PluginTransfer is the exception. Producers call `update()` whether or not the element has scrolled into view, and an instance that doesn't exist yet would silently drop those updates. The plugin is therefore initialized right away at DOM ready and is **not** listed in `themestrap.modules.js`.

---

## Quick Start

### 1. Include the script

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.transfer.js"></script>
```

### 2. Add the init block to `themestrap.init.js`

```js
// Transfer
if (typeof $.fn['themestrapPluginTransfer'] === 'function' && $('[data-plugin-transfer]').length) {
    $(() => {
        $('[data-plugin-transfer]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginTransfer(opts);
        });
    });
}
```

### 3. Add an element

```html
<div id="dl" data-plugin-transfer
     data-plugin-options='{"label": "archive.zip", "total": 52428800, "cancelable": true}'></div>
```

### 4. Report progress

```js
const t = $('#dl').data('__pluginTransfer');

t.update(1048576);                    // 1 MiB of 50 MiB done
t.update(2097152);                    // speed and time left are now derived
t.setState('done', 'Saved to Downloads');
```

---

## Markup Reference

| Attribute / class | Purpose |
| --- | --- |
| `data-plugin-transfer` | Marks the element for auto-initialization. |
| `data-plugin-options` | JSON options object, parsed with `themestrap.fn.getOptions()`. |
| `.manual` | Skips auto-initialization. Initialize it yourself with `$('#el').themestrapPluginTransfer({ … })`. |

The host can be any block element. Its contents are replaced by the plugin's markup while the instance lives and restored on `destroy()`. Don't write your own child markup into it.

### Root classes added by the plugin

| Class | Meaning |
| --- | --- |
| `.ts-transfer` | Always present. Theming hook. |
| `.is-idle` | Initialized or reset, nothing reported yet. |
| `.is-running` | Receiving updates. |
| `.is-paused` | Paused by your code. |
| `.is-done` | Finished. The bar is full and the cancel button is hidden. |
| `.is-failed` | Failed. |
| `.is-cancelled` | Cancelled by your code. |
| `.is-indeterminate` | Progress unknown for now, e.g. verifying a checksum. |
| `.is-unknown` | Running with no known total. The bar animates; bytes and speed still show. |

### Elements created after page load

Elements added later, such as a row created per upload, are initialized by hand:

```js
const $row = $('<div class="manual"></div>').appendTo('#uploads');
const t = $row.themestrapPluginTransfer({ label: file.name, total: file.size })[0];
```

The bridge returns a jQuery set of instances, so `[0]` is the instance itself.

---

## Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | `''` | Heading text. Always inserted as text, never HTML. |
| `message` | string | `''` | Initial message line. |
| `total` | number \| null | `null` | Total bytes. `null` or `0` means unknown. |
| `done` | number | `0` | Bytes already done, for a resumed transfer. |
| `units` | string | `'iec'` | `'iec'` (KiB, MiB, powers of 1024) or `'si'` (kB, MB, powers of 1000). |
| `decimals` | number | `1` | Decimal places for byte and speed values. |
| `showPercent` | boolean | `true` | Show the percentage. |
| `showBytes` | boolean | `true` | Show bytes done and total. |
| `showSpeed` | boolean | `true` | Show the smoothed speed. |
| `showEta` | boolean | `true` | Show time left. |
| `cancelable` | boolean | `false` | Render a cancel button that fires `transfer:cancel`. |
| `cancelText` | string | `'Cancel'` | Cancel button text. |
| `smoothing` | number | `0.3` | Weight of the newest sample in the speed's moving average, `0` to `1`. Higher reacts faster, lower is steadier. |
| `sampleMs` | number | `400` | Minimum milliseconds between speed samples. |
| `stateText` | object | see source | Default message per state, e.g. `{ paused: 'Paused', failed: 'Failed' }`. |
| `onProgress` | function | `null` | `function(info)`, called after each `update()`. |
| `onState` | function | `null` | `function(state, previous)`, called on each state change. |
| `onCancel` | function | `null` | `function()`, called when cancel is clicked. Return `false` to keep the button enabled. |

### Compact bar

Turning off every readout leaves just the bar:

```html
<div data-plugin-transfer
     data-plugin-options='{"showBytes": false, "showSpeed": false, "showEta": false}'></div>
```

---

## Public API

Get the instance with `$('#el').data('__pluginTransfer')`. Every method except `getInfo()` returns the instance, so calls chain.

### `update(done)` · `update(done, total)` · `update({ done, total, speed })`

Reports progress.

- Without `speed`, the speed is derived from successive calls.
- A `done` smaller than the last one (a restart, or the next file in a batch) resets the speed sampling.
- Moves an `idle` or `paused` transfer to `running`.
- Turns off indeterminate mode when a total is known.

```js
t.update(bytes);
t.update(bytes, totalBytes);
t.update({ done: bytes, total: totalBytes, speed: bytesPerSecond });
```

### `setIndeterminate(bool)`

Shows unknown progress, for example while verifying a file or waiting on a server. Cleared by the next `update()` with a known total.

```js
t.setIndeterminate(true).setMessage('Verifying checksum…');
```

### `setState(state, message?)`

Sets one of `idle`, `running`, `paused`, `done`, `failed` or `cancelled`. `done` fills the bar and hides the cancel button. When `message` is omitted it defaults to `stateText[state]`.

```js
t.setState('failed', 'Connection reset by peer');
```

### `setLabel(text)`

Changes the heading.

### `setMessage(text)`

Changes the message line. `''` clears it.

### `getInfo()`

Returns a snapshot:

```js
{ done, total, percent, speed, eta, state }
```

`speed` is in bytes per second and `eta` in seconds. Both are unavailable when they can't be calculated, e.g. before the second sample or with no total.

### `reset()`

Returns to `idle` with zero bytes and keeps the options.

### `destroy()`

Removes handlers and restores the element's original markup and classes.

### Static helpers

```js
themestrap.PluginTransfer.formatBytes(1536);          // "1.5 KiB"
themestrap.PluginTransfer.formatBytes(1500, 'si');    // "1.5 kB"
themestrap.PluginTransfer.formatDuration(97);         // "1m 37s"
```

---

## Events

Events are triggered on the host element through jQuery, so they bubble and can be delegated from `document`.

| Event | Handler arguments | When |
| --- | --- | --- |
| `transfer:progress` | `(e, instance, info)` | After each `update()`. |
| `transfer:state` | `(e, instance, state, previous)` | When the state changes. |
| `transfer:complete` | `(e, instance)` | The state became `done`. |
| `transfer:cancel` | `(e, instance)` | The cancel button was clicked. |

`transfer:cancel` only reports the click. Your code stops the job and then calls `setState('cancelled')`.

```js
$(document).on('transfer:state', (e, inst, state, prev) => {
    console.log(`#${e.target.id}: ${prev} > ${state}`);
});

$('#dl').on('transfer:cancel', (e, t) => {
    controller.abort();
    t.setState('cancelled', 'Cancelled, partial file kept');
});
```

---

## CSS Custom Properties

The defaults are declared with `:where(.ts-transfer)`, which has zero specificity. A plain `.ts-transfer { … }` rule in your theme always wins, whatever the load order. When a token isn't set, colors fall back to Bootstrap's variables, so dark mode with `data-bs-theme` works without extra rules.

| Token | Default | Used for |
| --- | --- | --- |
| `--ts-transfer-bar` | `var(--bs-primary)` | Bar fill while running. |
| `--ts-transfer-track` | `rgba(127,127,127,.2)` | Bar background. |
| `--ts-transfer-done` | `var(--bs-success)` | Bar fill when done. |
| `--ts-transfer-failed` | `var(--bs-danger)` | Bar fill when failed. |
| `--ts-transfer-paused` | `var(--bs-warning)` | Bar fill when paused or cancelled. |
| `--ts-transfer-muted` | `var(--bs-secondary-color)` | Secondary text. |
| `--ts-transfer-height` | `4px` | Bar height. |
| `--ts-transfer-radius` | `999px` | Bar corner radius. |
| `--ts-transfer-gap` | `6px` | Spacing between rows. |
| `--ts-transfer-font` | `inherit` | Text font. |
| `--ts-transfer-mono` | system monospace | Numeric readouts. |

```css
.themed .ts-transfer {
    --ts-transfer-bar: #ea580c;
    --ts-transfer-done: #16a34a;
    --ts-transfer-height: 8px;
    --ts-transfer-radius: 2px;
}
```

`prefers-reduced-motion: reduce` stops the indeterminate and unknown-total animations.

---

## Keyboard Navigation

The only interactive part is the cancel button, rendered when `cancelable` is `true`.

| Key | Action |
| --- | --- |
| `Tab` / `Shift+Tab` | Move focus to or from the cancel button. |
| `Enter` / `Space` | Activate cancel and fire `transfer:cancel`. |

The button leaves the tab order when it's hidden (state `done`). If `onCancel` returns `false`, the button stays enabled and focusable.

---

## ARIA Wiring

A transfer is a status that changes on its own, so assistive technology needs it described as a progress bar and needs final states announced. Check the rendered markup for:

| Element | Expected |
| --- | --- |
| Bar | `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax="100"` and `aria-valuenow` set to the percentage. `aria-valuenow` absent when indeterminate or the total is unknown. |
| Bar name | `aria-label` or `aria-labelledby` pointing at the heading, so the bar is announced as "archive.zip, progress bar". |
| Message line | A polite live region (`aria-live="polite"`) so "Done", "Failed" and similar are announced. |
| Cancel button | A native `<button type="button">`, named by its visible text. |

Don't put the speed or byte counters in a live region. They change several times a second and would flood a screen reader. Announce state changes, not every update.

If you need more than the plugin provides, listen to `transfer:state` and write to your own live region:

```js
$(document).on('transfer:state', (e, inst, state) => {
    if (['done', 'failed', 'cancelled'].includes(state)) {
        $('#sr-status').text(`${inst.getInfo().state}: ${e.target.id}`);
    }
});
```

---

## Recipes

### Download with `fetch` and cancel

```js
const t = $('#dl').themestrapPluginTransfer({ label: file.name, cancelable: true })[0];
const controller = new AbortController();
$('#dl').on('transfer:cancel', () => controller.abort());

try {
    const res = await fetch(url, { signal: controller.signal });
    const total = Number(res.headers.get('Content-Length')) || null;
    const reader = res.body.getReader();
    let done = 0;

    for (;;) {
        const { value, done: finished } = await reader.read();
        if (finished) break;
        done += value.length;
        t.update(done, total);
    }
    t.setState('done');
} catch (e) {
    t.setState(e.name === 'AbortError' ? 'cancelled' : 'failed', e.message);
}
```

### Upload with `XMLHttpRequest`

`fetch` has no upload progress. Use `XMLHttpRequest` and its `upload` events:

```js
const t = $('#up').themestrapPluginTransfer({ label: file.name, total: file.size, cancelable: true })[0];
const xhr = new XMLHttpRequest();

$('#up').on('transfer:cancel', () => xhr.abort());

xhr.upload.onprogress = (e) => t.update(e.loaded, e.lengthComputable ? e.total : null);
xhr.upload.onload     = () => t.setIndeterminate(true).setMessage('Processing on server…');
xhr.onload            = () => t.setState(xhr.status < 300 ? 'done' : 'failed', xhr.statusText);
xhr.onerror           = () => t.setState('failed', 'Network error');
xhr.onabort           = () => t.setState('cancelled');

const body = new FormData();
body.append('file', file);
xhr.open('POST', '/upload');
xhr.send(body);
```

### Download, then verify

```js
// Download loop finished
t.setIndeterminate(true).setMessage('Verifying checksum…');

const ok = await verify(file);
t.setState(ok ? 'done' : 'failed', ok ? 'Checksum OK' : 'Checksum mismatch');
```

### Several files through one bar

Report each file from zero. The smaller `done` resets speed sampling, so the speed doesn't spike between files.

```js
for (const [i, f] of files.entries()) {
    t.setLabel(`${f.name} (${i + 1} of ${files.length})`);
    await copy(f, (bytes) => t.update(bytes, f.size));
}
t.setState('done', `${files.length} files copied`);
```

To show the whole batch as one job instead, sum the sizes up front and report a running total.

### Resume a partial transfer

```js
const t = $('#dl').themestrapPluginTransfer({
    label: name,
    total: fullSize,
    done: bytesOnDisk
})[0];
```

Request the rest with a `Range: bytes=${bytesOnDisk}-` header and keep adding to `bytesOnDisk`.

### Server-reported progress

When a backend job reports its own figures (for example over Server-Sent Events), pass the speed through:

```js
const source = new EventSource(`/jobs/${id}/progress`);
source.onmessage = (e) => {
    const { done, total, bytesPerSecond, status } = JSON.parse(e.data);
    t.update({ done, total, speed: bytesPerSecond });
    if (status === 'complete') { t.setState('done'); source.close(); }
};
```

### Pause and resume

Pausing is a display state. Your code stops producing updates; the next `update()` moves the transfer back to `running`.

```js
$('#pause').on('click', () => { job.pause(); t.setState('paused'); });
$('#resume').on('click', () => job.resume());
```

### Non-byte jobs

For record counts or steps, hide the byte and speed readouts and report a total of 100 or the item count:

```js
const t = $('#import').themestrapPluginTransfer({
    label: 'Importing resources',
    showBytes: false,
    showSpeed: false
})[0];

t.update(processed, totalRecords);
t.setMessage(`${processed} of ${totalRecords} resources`);
```

---

## Common Pitfalls

**Updates are lost at page load.**
The element was initialized through `intObsInit()` or listed in `themestrap.modules.js`, so no instance existed when the producer started calling `update()`. Use the DOM-ready init block from Quick Start.

**`$('#el').data('__pluginTransfer')` is `undefined`.**
The element has `.manual`, was added after DOM ready, or the init block ran before the element existed. Initialize it with `$('#el').themestrapPluginTransfer({ … })`.

**Clicking cancel does nothing.**
The plugin only fires `transfer:cancel`. Stop the job in a handler, then call `setState('cancelled')`.

**The cancel button stays disabled after a click.**
That's the default. Return `false` from `onCancel` to keep it enabled, for example when you ask the user to confirm first.

**Percentage passes 100 % or the total looks wrong.**
`Content-Length` on a compressed response is the compressed size, while the stream reader counts decompressed bytes. Use a size from your own API, or pass `null` and show bytes only.

**Time left never appears.**
There is no total, or fewer than two samples have been taken. Updates closer together than `sampleMs` count as one sample.

**Speed jumps around.**
Lower `smoothing` (try `0.15`) or raise `sampleMs`.

**Indeterminate mode switches itself off.**
An `update()` with a known total clears it. Stop reporting progress before calling `setIndeterminate(true)`.

**Byte values differ from the operating system's.**
Windows reports powers of 1024 with SI-style labels. `units: 'iec'` matches the numbers (labelled KiB, MiB); `units: 'si'` matches the labels.

**A theme rule doesn't apply.**
Set the tokens on `.ts-transfer` or a parent selector. Rules on the host's original ID still match, but tokens on unrelated ancestors only work if they're inherited by `.ts-transfer`.

**HTML shows up as text in the label.**
By design. `label`, `setLabel()` and `setMessage()` insert text only.

### Diagnostic checklist

1. `themestrap.plugin.transfer.js` loads after `jquery` and `themestrap.js`, with no console errors.
2. `$.fn.themestrapPluginTransfer` is a function.
3. The element has `data-plugin-transfer` and no `.manual`, or is initialized by hand.
4. `$('#el').data('__pluginTransfer')` returns an instance before the first `update()`.
5. The root has `.ts-transfer` and exactly one `.is-*` state class.
6. `getInfo()` shows the `done` and `total` you expect.
7. `transfer:progress` fires on each `update()`; log it from `document` to confirm.
8. For cancel: `cancelable` is `true` and a `transfer:cancel` handler calls `setState('cancelled')`.
9. For theming: tokens are set on `.ts-transfer` and visible under Computed styles in dev tools.