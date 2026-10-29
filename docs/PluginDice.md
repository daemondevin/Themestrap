# PluginDice

A tray of dice drawn with pure CSS pips. Throw some or all of the dice with a tumbling animation, let players pick dice by click or keyboard, and set dice aside. Built for dice games such as Farkle, Yahtzee or Liar's Dice, and for anything that needs a die face on screen. No images and no vendor dependencies.

| Feature | Notes |
| - | - |
| Faces | Pips are CSS grid cells, so dice stay sharp at any size and take any color |
| Throws | `roll()` tumbles the dice and returns a Promise of the values. Pass the result in when a server decides the throw |
| Picking | `selectable` turns dice into toggle buttons, with a roving tab stop and arrow keys |
| Holding | Held dice are dimmed, cannot be picked and are skipped by `roll()` |
| Empty faces | `null` draws a blank die, or faces one to six with `emptyFace: "index"` |
| Sizes | `sm`, `md`, `lg`, or any size with `--ts-dice-size` |
| Theming | `--ts-dice-*` tokens with light, dark and explicit-light tiers |
| Accessibility | Each die has a spoken label (face, held, selected), throws are announced in a live region, reduced motion is respected |

## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance.
2. **`setData`** stores the instance on the host as `__pluginDice`.
3. **`setOptions`** merges `PluginDice.defaults` with your options. `count` is clamped to 1 to 50.
4. **`build`** injects the stylesheet once, empties the host, and renders one `<button class="ts-die">` per die with nine pip cells. A face is shown by setting `data-value` on the die; CSS reveals the right cells.
5. **`events`** binds click and keyboard handling on the host (delegated, namespaced per instance).
6. **`destroy`** cancels a running throw, unbinds, restores the host's original HTML, and removes the stylesheet when the last instance goes.

### A throw

`roll(indexes, values)` marks the chosen dice `is-rolling` (a CSS tumble), changes their faces every `rollInterval` ms, and after `rollDuration` ms lands them on their final faces. Final faces come from `values` when given, otherwise they are random. The Promise resolves with every value in the tray, then `ts.dice.rolled` fires. Picks on the thrown dice are cleared. Starting a new throw while one is running finishes the first one at once.

### Stylesheet injection

`<style id="ts-dice-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed.

## Quick Start

```html
<script src="js/components/themestrap.plugin.dice.js"></script>

<div id="tray" data-plugin-dice
     data-plugin-options='{"count": 6, "selectable": true}'></div>

<button id="throw">Throw</button>
<script>
$('#throw').on('click', function () {
    $('#tray').data('__pluginDice').roll().then(function (values) {
        console.log(values);
    });
});
</script>
```

### Auto-init wiring (`themestrap.init.js`)

```js
// Dice
if (typeof $.fn['themestrapPluginDice'] === 'function' && $('[data-plugin-dice]').length) {
    themestrap.fn.intObsInit('[data-plugin-dice]:not(.manual)', 'themestrapPluginDice');
}
```

Zero-vendor plugins are wired in `themestrap.init.js`, not `themestrap.modules.js`.

### Manual init

```js
const dice = $('#tray').themestrapPluginDice({ count: 5, selectable: true, size: 'lg' })[0];
```

## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-dice` | Host `<div>` | Init hook. Its content is replaced by the tray and restored by `destroy()` |
| `data-plugin-options` | Host | JSON options |
| `.manual` | Host | Excludes the element from auto-init |

### Generated structure

```html
<div class="ts-dice" role="group" aria-label="Dice">
    <button type="button" class="ts-die is-selectable" data-index="0" data-value="5"
            aria-pressed="false" aria-disabled="false" aria-label="Die 1: 5" tabindex="0">
        <span class="ts-pip" aria-hidden="true"></span>   <!-- nine pip cells -->
        …
    </button>
    …
    <span class="ts-dice-sr" aria-live="polite">Rolled 5, 2, 6</span>
</div>
```

| Class | Meaning |
| - | - |
| `ts-dice--sm`, `ts-dice--lg` | Size |
| `ts-dice--center` | Dice centered in the tray |
| `ts-dice--plain` | The one is drawn like the other faces |
| `is-empty` | No face yet (`null`) |
| `is-selectable` | The die can be picked now |
| `is-selected` | Picked |
| `is-held` | Set aside |
| `is-rolling`, `is-landed` | Throw animation states |

## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `count` | `number` | `6` | Dice in the tray (1 to 50) |
| `values` | `array` | `[]` | Starting faces. `null` or a missing entry draws an empty face |
| `held` | `array` | `[]` | Starting held flags |
| `selectable` | `boolean` | `false` | Dice can be picked by click or keyboard |
| `size` | `string` | `'md'` | `'sm'`, `'md'` or `'lg'`. Any size with `--ts-dice-size` |
| `center` | `boolean` | `false` | Center the dice in the tray |
| `redOne` | `boolean` | `true` | Draw the single pip of a one larger and in red |
| `emptyFace` | `string` | `'blank'` | `'blank'` draws no pips. `'index'` shows faces one to six in order |
| `rollDuration` | `number` | `900` | Milliseconds a throw tumbles. `0` lands at once |
| `rollInterval` | `number` | `80` | Milliseconds between face changes while tumbling |
| `labels` | `object` | see below | Text for screen readers |
| `onSelect` | `function` | `null` | `function (index, selected, selection) {}` |
| `onRoll` | `function` | `null` | `function (indexes) {}` when a throw starts |
| `onRolled` | `function` | `null` | `function (values, indexes) {}` when the dice land |

`labels` defaults: `{ group: 'Dice', die: 'Die {n}', empty: 'not thrown', held: 'set aside', selected: 'selected', rolled: 'Rolled' }`.

## Public API

```js
const dice = $('#tray').data('__pluginDice');
```

| Method | Returns | Description |
| - | - | - |
| `roll(indexes, values)` | `Promise<array>` | Throws `indexes` (default: every die not held). Lands on `values` when given, else random |
| `isRolling()` | `boolean` | A throw is running |
| `getValues()` | `array` | Faces, `null` for empty |
| `setValues(values)` | `this` | Set faces at once, no animation |
| `getState()` | `array` | `[{ value, held, selected }]` |
| `setState(state)` | `this` | Apply `[{ value, held }]` at once. Dice whose face or held flag changes lose their pick |
| `hold(indexes, held)`, `release(indexes)` | `this` | Set dice aside or bring them back. Holding clears a pick |
| `select(index, on)`, `toggle(index)` | `this` | Pick or drop a die. Ignored for held, empty or rolling dice, and when not selectable |
| `getSelected()` | `array` | Indexes of the picked dice |
| `getSelectedValues()` | `array` | Faces of the picked dice |
| `clearSelection()` | `this` | Drop every pick |
| `setSelected(indexes)` | `this` | Show exactly these dice as picked. Fires no `ts.dice.select` and works while the tray is not selectable, for mirroring a pick made elsewhere. Held and empty dice are skipped |
| `setSelectable(on)` | `this` | Turn picking on or off. Off clears picks |
| `enable()`, `disable()` | `this` | Pause picking without changing `selectable` |
| `destroy()` | `this` | Restore the host |

The jQuery bridge also accepts a method name: `$('#tray').themestrapPluginDice('roll', [0, 1], [6, 6])`.

## Events

Native events, bubbling, dispatched on the host.

| Event | When | `detail` |
| - | - | - |
| `ts.dice.select` | A die is picked or dropped by the player or `select()` | `{ instance, index, selected, selection, values }` |
| `ts.dice.roll` | A throw starts | `{ instance, indexes }` |
| `ts.dice.rolled` | The dice have landed | `{ instance, indexes, values }` |

> Use `addEventListener` for these events. jQuery reads the dots as namespaces, so `$el.on('ts.dice.rolled', …)` never fires.

## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-dice-size` | `3.25rem` (sm `2.25rem`, lg `4.5rem`) | same | Edge length of a die |
| `--ts-dice-gap` | `.75rem` | same | Space between dice |
| `--ts-dice-radius` | 20% of the size | same | Corners. `50%` makes round dice |
| `--ts-dice-bg` | `#fffdf8` | `#f4f1ea` | Die face |
| `--ts-dice-border` | `rgba(0,0,0,.16)` | `rgba(255,255,255,.22)` | Die edge |
| `--ts-dice-pip` | `#1b1f24` | `#14181d` | Pips |
| `--ts-dice-pip-one` | `#c62828` | `#d32f2f` | The single pip of a one |
| `--ts-dice-shadow` | soft drop shadow | deeper shadow | Depth |
| `--ts-dice-selected` | `#21a366` | `#2fd08a` | Ring and border of a picked die |
| `--ts-dice-selected-bg` | `#e3f7ec` | `#d4f5e4` | Face of a picked die |
| `--ts-dice-held-bg` | `#d9dde3` | `#7d8794` | Face of a held die |
| `--ts-dice-held-opacity` | `.6` | same | Dimming of a held die |
| `--ts-dice-focus-ring` | teal ring | brighter teal | Keyboard focus |

Dark values apply under `@media (prefers-color-scheme: dark)`, `html.dark` and `[data-bs-theme="dark"]`. `[data-bs-theme="light"]` forces the light tier.

## Keyboard Navigation

Active when `selectable` is on. Only one die is in the tab order at a time.

| Key | Action |
| - | - |
| `Tab` | Into and out of the tray |
| `←` `↑` / `→` `↓` | Previous / next die (wraps) |
| `Home` / `End` | First / last die |
| `Space` / `Enter` | Pick or drop the focused die |

## ARIA Wiring

- The host is `role="group"` with `aria-label` from `labels.group`.
- Each die is a `<button>` with an `aria-label` such as "Die 3: 5 set aside".
- With `selectable` on, dice carry `aria-pressed`. Dice that cannot be picked (held, empty, rolling) carry `aria-disabled="true"` and leave the tab order.
- A visually hidden `aria-live="polite"` region announces each throw ("Rolled 5, 2, 6").
- `prefers-reduced-motion: reduce` removes the tumble and lifts, and lands throws at once.

## Recipes

#### A Farkle turn

```js
const dice = $('#tray').themestrapPluginDice({ count: 6, selectable: true })[0];

$('#keep-and-throw').on('click', function () {
    dice.hold(dice.getSelected());
    if (dice.getState().every(d => d.held)) dice.release([0, 1, 2, 3, 4, 5]);   // hot dice
    dice.roll();
});
```

#### Server-decided throws

```js
socket.on('state', function (state) {
    if (state.thrown.length) {
        dice.roll(state.thrown, state.thrown.map(i => state.dice[i].value))
            .then(() => dice.setState(state.dice));
    } else {
        dice.setState(state.dice);
    }
});
```

#### Showing another player's picks

The player whose turn it is picks dice on their own tray, and everyone else sees the same dice light up. The watchers' trays stay non-selectable, so `setSelected()` is used instead of `select()`, and nothing is sent back.

```js
// The player picking
document.getElementById('tray').addEventListener('ts.dice.select', function (e) {
    socket.emit('select', { keep: e.detail.selection });
});

// Everyone else
socket.on('selection', function (data) {
    dice.setSelectable(false).setSelected(data.indexes);
});
```

Call `setSelected()` after `setSelectable(false)`, because turning picking off clears every pick.

#### Live score of the current pick

```js
document.getElementById('tray').addEventListener('ts.dice.select', function (e) {
    $('#pick-score').text(scoreOf(e.detail.values));
});
```

## Common Pitfalls

**Events never fire.** Bind with `addEventListener`, not jQuery `.on()` (see Events).

**Options from `data-plugin-options` are ignored on a manual call.** The jQuery bridge only reads the object you pass. When you create the instance yourself before auto-init runs, pass `themestrap.fn.getOptions($el.data('plugin-options'))` along.

**Picks disappear.** Picks are cleared on dice that are thrown, held, emptied, or whose face changes through `setState()`. Read `getSelected()` before those calls.

**A die will not respond to clicks.** It is held, empty, rolling, or `selectable` is off, or `disable()` was called. Check its `aria-disabled`.

### Diagnostic checklist

1. `document.getElementById('ts-dice-styles')` exists once the tray is built.
2. `$('#tray').data('__pluginDice')` returns the instance.
3. `.ts-die` elements carry the expected `data-value`.
4. The event listener uses `addEventListener`.