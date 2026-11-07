# PluginEmoticon

An emoji picker and emoticon converter for text inputs and textareas, built for chat boxes, comment forms and anything people type messages into. Typed emoticons such as `:)` and `<3`, and emoji names such as `:fire:`, turn into emoji as you type. A picker button opens a searchable panel of emoji grouped by category, with the ones used most recently on top. It uses the device's own emoji font, so there are no images and no vendor dependencies.

| Feature | Notes |
| - | - |
| Typed emoticons | `:)` `:D` `;)` `<3` `:'(` and more swap once a space or punctuation follows. Only at the start or after a space, so `http://` and `b)` stay as typed |
| Shortcodes | Any emoji's name between colons, `:tada:` `:thumbsup:` `:dice:`, swaps when the closing colon is typed |
| Undo | `Backspace` right after a swap puts the typed text back |
| Picker | Search box, category tabs, a recent row kept in `localStorage`, name preview, several picks in a row |
| Placement | Above or below the input, whichever has room, inside the nearest drawer, modal or offcanvas so focus traps keep working |
| Helpers | `convert()`, `isEmojiOnly()`, `search()` and `lookup()` work on plain strings, no instance needed |
| Theming | `--ts-emoticon-*` tokens with light, dark and explicit-light tiers |
| Accessibility | Labeled dialog and buttons, arrow-key grid, live region for picks and search results, reduced motion respected |

## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the input already has an instance.
2. **`setData`** stores the instance on the input as `__pluginEmoticon`.
3. **`setOptions`** merges `PluginEmoticon.defaults` with your options, then builds the emoticon table from the built-in `shortcuts` plus `extraShortcuts`.
4. **`build`** injects the stylesheet once, adds the picker button after the input (or uses `trigger`), and renders the panel into its container.
5. **`events`** binds typing, the picker, keyboard handling, outside clicks and the form's `submit`.
6. **`destroy`** closes the panel, unbinds everything, removes the button and panel it made, and removes the stylesheet when the last instance goes.

### Swapping as you type

On each `input` event that inserted text, the plugin looks at the text just before the caret. When the last character is a space or punctuation and an emoticon from the table ends right before it, preceded by the start of the text or a space, the emoticon is replaced. When the last character is `:` and a known `:name:` ends there, that is replaced. The caret stays where it was. Pasting, deleting and undo never trigger a swap.

Whatever is left unswapped (an emoticon at the very end of the message) is converted when `Enter` is pressed or the form is submitted, see `convertOnSubmit`.

### Where the panel goes

The panel is placed in `container` when given. Otherwise it goes into the closest `[data-drawer-panel]`, `.modal-dialog`, `.offcanvas` or `.ts-emoticon-container`, and into the `<body>` when there is none. Keeping it inside a drawer or modal means the drawer's focus trap, scroll lock and stacking all include the panel. A container with `position: static` is given `position: relative` and set back on `destroy()`.

### Stylesheet injection

`<style id="ts-emoticon-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

## Quick Start

```html
<script src="js/components/themestrap.plugin.emoticon.js"></script>

<form id="chat" class="input-group">
    <input type="text" class="form-control" placeholder="Write a message…"
           data-plugin-emoticon
           data-plugin-options='{"buttonClass": "btn btn-outline-secondary"}'>
    <button type="submit" class="btn btn-primary">Send</button>
</form>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// Emoticon
if (typeof $.fn['themestrapPluginEmoticon'] === 'function' && $('[data-plugin-emoticon]').length) {
    themestrap.fn.intObsInit('[data-plugin-emoticon]:not(.manual)', 'themestrapPluginEmoticon');
}
```

Zero-vendor plugins are wired in `themestrap.init.js`, not `themestrap.modules.js`.

### Manual init

Auto-init waits until the input scrolls into view. An input inside a closed drawer or modal is not in view, so start it yourself when the page loads:

```js
const $input = $('#message');
const emoticons = $input.themestrapPluginEmoticon(themestrap.fn.getOptions($input.data('plugin-options')))[0];
```

## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-emoticon` | `<input>` or `<textarea>` | Init hook |
| `data-plugin-options` | Same element | JSON options |
| `.manual` | Same element | Excludes it from auto-init |
| `.ts-emoticon-container` | Any wrapper | Makes the panel live in that wrapper |

### Generated structure

```html
<input type="text" class="form-control" id="message" data-plugin-emoticon>
<button type="button" class="ts-emoticon-toggle btn btn-outline-secondary"
        aria-haspopup="dialog" aria-expanded="false" aria-controls="ts-emoticon-panel-1">
    <span class="ts-emoticon-toggle-icon" aria-hidden="true">🙂</span>
    <span class="ts-emoticon-sr">Add an emoji</span>
</button>

<!-- in the container -->
<div class="ts-emoticon-panel" id="ts-emoticon-panel-1" role="dialog" aria-label="Emoji" hidden>
    <div class="ts-emoticon-search"><input type="search" aria-label="Search emoji"></div>
    <div class="ts-emoticon-tabs" role="tablist">
        <button class="ts-emoticon-tab" role="tab" data-category="recent" aria-selected="true">🕘</button>
        …
    </div>
    <div class="ts-emoticon-body">
        <section class="ts-emoticon-section" data-category="smileys">
            <h3 class="ts-emoticon-heading">Smileys</h3>
            <div class="ts-emoticon-grid" role="group" aria-label="Smileys">
                <button class="ts-emoticon-item" data-emoji="😀" data-name="grinning" aria-label="grinning">😀</button>
                …
            </div>
        </section>
        …
    </div>
    <div class="ts-emoticon-preview" aria-hidden="true">…</div>
    <span class="ts-emoticon-sr" aria-live="polite"></span>
</div>
```

The input gets an `id` when it has none, so the button can point at it.

## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `button` | `boolean` | `true` | Add a picker button next to the input |
| `buttonPosition` | `string` | `'after'` | `'after'` or `'before'` the input |
| `buttonClass` | `string` | `'btn btn-outline-secondary'` | Classes for the button the plugin adds |
| `buttonIcon` | `string` | `'🙂'` | Text shown on that button |
| `trigger` | `string` | `null` | Selector of an existing button to open the picker instead |
| `container` | `string` | `null` | Where the panel goes. Default: the nearest drawer, modal or offcanvas, else the body |
| `placement` | `string` | `'auto'` | `'auto'` (above when it fits), `'top'` or `'bottom'` |
| `search` | `boolean` | `true` | Search box at the top of the panel |
| `preview` | `boolean` | `true` | Emoji and `:name:` under the pointer, at the bottom |
| `categories` | `array` | `null` | Category keys to show: `smileys`, `gestures`, `hearts`, `games`, `food`, `symbols`. Default all |
| `recent` | `boolean` | `true` | A row of the emoji picked last |
| `recentMax` | `number` | `16` | Emoji kept in that row |
| `recentKey` | `string` | `'ts-emoticon-recent'` | `localStorage` key. Give pickers different keys to keep separate rows |
| `closeOnPick` | `boolean` | `false` | Close after one pick. Off lets people pick several in a row |
| `shortcuts` | `boolean` | `true` | Swap typed emoticons such as `:)` |
| `extraShortcuts` | `object` | `{}` | More emoticons, for example `{"(y)": "👍"}` |
| `shortcodes` | `boolean` | `true` | Swap `:name:` |
| `convertOnSubmit` | `boolean` | `true` | Convert what is left when `Enter` is pressed or the form is submitted |
| `labels` | `object` | see below | Text for buttons, headings and screen readers |

`labels` defaults: `{ button: 'Add an emoji', panel: 'Emoji', search: 'Search emoji', categories: 'Emoji categories', recent: 'Recently used', results: 'Search results', none: 'No emoji found', found: 'emoji found', added: 'added', full: 'The message is full', hint: 'Tip: type :name: to add one without the picker' }`. Category headings can be renamed with the category key, for example `labels: { games: 'Dice night' }`.

### Built-in emoticons

| Typed | Emoji | Typed | Emoji | Typed | Emoji |
| - | - | - | - | - | - |
| `:)` `:-)` `:]` `(:` | 🙂 | `:(` `:-(` | 🙁 | `:D` `:-D` | 😃 |
| `XD` `xD` | 😆 | `;)` `;-)` | 😉 | `:P` `:p` `:-P` | 😛 |
| `;P` `;p` | 😜 | `:O` `:o` `:-O` | 😮 | `:'(` `:'-(` | 😢 |
| `T_T` | 😭 | `:\|` `:-\|` | 😐 | `:/` `:-/` | 😕 |
| `<3` | ❤️ | `</3` | 💔 | `B-)` | 😎 |
| `:*` `:-*` | 😘 | `>:(` `>:-(` | 😠 | `>:)` | 😈 |
| `O:)` `o:)` `O:-)` | 😇 | `^_^` `^^` | 😊 | `-_-` | 😑 |
| `o_O` `O_o` `:$` | 😳 | | | | |

`B)` and `8)` are left out on purpose, they show up in lists ("option B)").

## Public API

```js
const emoticons = $('#message').data('__pluginEmoticon');
```

| Method | Returns | Description |
| - | - | - |
| `open()`, `close(refocus)`, `toggle()` | `this` | Show or hide the panel. `close()` puts focus back in the input unless `refocus` is `false` (and never on touch screens, where it would bring up the keyboard) |
| `isOpen()` | `boolean` | The panel is showing |
| `insert(emoji)` | `this` | Insert at the caret, or at the end. Skipped when `maxlength` would be passed |
| `convertValue()` | `this` | Convert every emoticon and `:name:` in the value now |
| `destroy()` | `this` | Remove the button, panel and handlers |

### Static helpers

| Helper | Returns | Description |
| - | - | - |
| `PluginEmoticon.convert(text, opts)` | `string` | Emoticons and `:name:` in `text` turned into emoji. `opts.shortcuts` takes `false` or your own table, `opts.shortcodes` takes `false` |
| `PluginEmoticon.isEmojiOnly(text, max)` | `boolean` | `text` is one to `max` (default 3) emoji and nothing else. Skin tones, flags and keycaps count as one |
| `PluginEmoticon.search(query)` | `array` | Emoji whose name or search words start with `query`, then names that contain it: `[{ char, name, keywords, category }]` |
| `PluginEmoticon.lookup(name)` | `string` or `null` | The emoji for `'tada'` or `':tada:'` |
| `PluginEmoticon.emoji` | `array` | Every emoji in the picker |
| `PluginEmoticon.shortcuts` | `object` | The built-in emoticon table |

## Events

Native events, bubbling, dispatched on the input.

| Event | When | `detail` |
| - | - | - |
| `ts.emoticon.open` | The panel opens | `{ instance }` |
| `ts.emoticon.close` | The panel closes | `{ instance }` |
| `ts.emoticon.pick` | An emoji is picked and inserted | `{ instance, emoji, name }` |
| `ts.emoticon.convert` | Typed text was turned into emoji | `{ instance, from, to }` |

> Use `addEventListener` for these events. jQuery reads the dots as namespaces, so `$el.on('ts.emoticon.pick', …)` never fires.

Inserting an emoji also fires a plain `input` event on the input, so character counters, typing notices and validation react as if it was typed.

## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-emoticon-width` | `21rem` | same | Panel width (never wider than the screen) |
| `--ts-emoticon-height` | `22rem` | same | Panel height |
| `--ts-emoticon-size` | `1.5rem` | same | Emoji size in the grid |
| `--ts-emoticon-radius` | `.75rem` | same | Panel corners |
| `--ts-emoticon-bg` | `#ffffff` | `#1f242b` | Panel background |
| `--ts-emoticon-border` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.14)` | Panel edge and dividers |
| `--ts-emoticon-text` | `#1b1f24` | `#e8eaed` | Text |
| `--ts-emoticon-muted` | `#6b7380` | `#9aa3ad` | Headings and preview |
| `--ts-emoticon-hover` | `rgba(0,0,0,.07)` | `rgba(255,255,255,.10)` | Emoji under the pointer |
| `--ts-emoticon-accent` | `#2185d0` | `#5aa9e6` | Selected tab, search focus |
| `--ts-emoticon-shadow` | soft shadow | deeper shadow | Depth |
| `--ts-emoticon-focus-ring` | blue ring | brighter blue | Keyboard focus |
| `--ts-emoticon-z` | `1080` | same | Stacking, above Bootstrap modals and Themestrap drawers |

Dark values apply under `@media (prefers-color-scheme: dark)`, `html.dark` and `[data-bs-theme="dark"]`. `[data-bs-theme="light"]` forces the light tier. Set the tokens on an element that contains the panel, which is its container, not the input.

## Keyboard Navigation

| Where | Key | Action |
| - | - | - |
| Input | `Esc` | Close the panel |
| Input | `Backspace` | Right after a swap, bring the typed text back |
| Input | `Enter` | Convert what is left before the form sends it |
| Search box | `↓` | Into the grid |
| Search box | `Enter` | Pick the first result |
| Grid | `←` `→` `↑` `↓` | Move between emoji. `↑` from the first row goes back to search |
| Grid | `Home` / `End` | First / last emoji |
| Grid | `Enter` / `Space` | Pick |
| Grid | letters | Go to the search box and type there |
| Panel | `Esc` | Close and return to the input |

`Esc` in the panel stops there, so a drawer or modal around it stays open.

## ARIA Wiring

- The button carries `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`, plus a visually hidden label from `labels.button`.
- The panel is `role="dialog"` with `aria-label` from `labels.panel`. Tabs are `role="tab"` with `aria-selected`, following the scroll position.
- Each emoji is a `<button>` labeled with its name ("thumbsup"), and each category grid is a labeled group. Only the focused emoji is in the tab order.
- A visually hidden `aria-live="polite"` region announces picks ("tada added"), search results ("4 emoji found") and a full input.
- On touch screens the panel opens without focusing the search box, so the keyboard does not cover it.
- `prefers-reduced-motion: reduce` removes the panel's opening animation and the hover zoom.

## Recipes

#### A chat log with big emoji

```js
function addLine(sender, text) {
    const Emoticon = themestrap.PluginEmoticon;
    const shown = Emoticon.convert(text);          // messages from people without the plugin too
    const $line = $('<div class="chat-line">')
        .append($('<b>').text(sender + ': '))
        .append($('<span class="chat-text">').text(shown));
    if (Emoticon.isEmojiOnly(shown)) $line.addClass('is-emoji');
    $('#log').append($line);
}
```

```css
.chat-line.is-emoji .chat-text { font-size: 1.9rem; line-height: 1.15; vertical-align: middle; }
```

#### A chat box inside a drawer

The panel follows the input into the drawer, so the drawer's focus trap and `Esc` keep working. Start the plugin when the page loads, the drawer starts closed:

```js
$('#chatmessage').themestrapPluginEmoticon({ buttonClass: 'btn btn-outline-secondary' });

$('#chat-form').on('submit', function (e) {
    e.preventDefault();
    const $input = $('#chatmessage');
    $input.data('__pluginEmoticon').convertValue();   // the last :) too
    send($input.val());
});
```

#### Your own emoticons

```js
$('#message').themestrapPluginEmoticon({
    extraShortcuts: { '(y)': '👍', '(n)': '👎', ':dice:': '🎲' }
});
```

#### Suggestions while typing a :name:

```js
document.getElementById('message').addEventListener('input', function () {
    const m = this.value.slice(0, this.selectionStart).match(/:([a-z_]{2,})$/i);
    const found = m ? themestrap.PluginEmoticon.search(m[1]).slice(0, 6) : [];
    $('#suggest').text(found.map(e => e.char + ' :' + e.name + ':').join('   '));
});
```

## Common Pitfalls

**Events never fire.** Bind with `addEventListener`, not jQuery `.on()` (see Events).

**The picker button never appears.** Auto-init waits for the input to scroll into view, and an input in a closed drawer or modal is never in view until it opens. Start the plugin yourself on page load (see Manual init).

**The panel is cut off or sits under something.** It lives in its container. An ancestor with `overflow: hidden` clips it, and a container with its own stacking context caps its `z-index`. Wrap the input in a `.ts-emoticon-container` where there is room, or set `container`.

**The input group loses its rounded corners.** The panel was put inside the `.input-group`. Put `.ts-emoticon-container` on a wrapper around the group, not on the group.

**Some emoji show as boxes.** The device's emoji font lacks them. The built-in set stops at Unicode Emoji 13.0 (2020) for that reason. Older Windows 10 builds draw some newer emoji in black and white.

**`:/` turned a link into an emoji.** It cannot: swaps need a space or the start of the text before them, and `http://` has a letter there. Check custom `extraShortcuts` for keys that appear in normal words.

### Diagnostic checklist

1. `document.getElementById('ts-emoticon-styles')` exists once the plugin is built.
2. `$('#message').data('__pluginEmoticon')` returns the instance.
3. The button has `aria-controls` pointing at a `.ts-emoticon-panel` in the expected container.
4. `themestrap.PluginEmoticon.convert(':)')` returns `'🙂'`.
5. The event listener uses `addEventListener`.
