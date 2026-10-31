# PluginRating

A star rating, or a rating with any icon you like. It shows fractional values with a partial fill, highlights icons as the pointer sweeps across them, can be cleared, and reports every change through a callback.

**File:** `js/components/themestrap.plugin.rating.js`  
**Demo:** `demos/plugin.demo.rating.html`  
**jQuery method:** `$.fn.themestrapPluginRating`  
**Data attribute:** `data-plugin-rating`  
**Instance key:** `__rating`  
**Init strategy:** `intObsInit` via `themestrap.init.js`



## How It Works

The plugin works on a wrapper element. On `build()` it:

1. Looks for existing `.icon` children. If there are none, it writes `maxRating` icons from the `icon` option.
2. Marks the rating read-only (the `disabled` flag and the `.disabled` class) when `interactive: false`. A read-only rating ignores hovers and clicks.
3. Calls `setRating(initialRating)` silently (no callback).

A rating is shown with three classes on the icons:

| Class | Meaning |
| - | - |
| `.active` | Filled |
| `.partial` | Partly filled. The plugin sets `--full` on the icon to the fraction (`70%` for 3.7), and the CSS draws a left-to-right gradient clipped to the glyph. |
| `.selected` | Under the pointer sweep, from the first icon up to the hovered one |

Clicking an icon sets the rating to its position. Clicking the current rating again clears it when `clearable` allows.

**The plugin injects no CSS.** The styles come from `themestrap-elements.css` (the `.rating` block), or from your own stylesheet; the demo page carries a self-contained `.ts-rating` set you can copy.



## Quick Start

### 1. Include the files

```html
<link rel="stylesheet" href="vendor/fontawesome-free/css/all.min.css">
<link rel="stylesheet" href="css/themestrap-elements.css">

<script src="vendor/jquery/jquery.min.js"></script>
<script src="js/themestrap.js"></script>
<script src="js/components/themestrap.plugin.rating.js"></script>
<script src="js/themestrap.init.js"></script>
```

Font Awesome is needed for the default star icon. Any other icon font works through the `icon` option (`'bi bi-star-fill'` for Bootstrap Icons).

### 2. Mark it up

```html
<div class="rating rating-md" data-plugin-rating
     data-plugin-options='{"initialRating": 4}'></div>
```

`themestrap.init.js` already wires it:

```js
themestrap.fn.intObsInit('[data-plugin-rating]:not(.manual)', 'themestrapPluginRating');
```

### Manual init

```js
$('#product-rating').themestrapPluginRating({
    initialRating: 3,
    onRate: function (rating) {
        $.post('/rate', { id: this.dataset.id, rating: rating });
    }
});
```



## Markup Reference

### Generated icons

```html
<div class="rating rating-lg" data-plugin-rating></div>
```

becomes

```html
<div class="rating rating-lg" data-plugin-rating>
    <i class="fa-solid fa-star fa-lg icon active"></i>
    <i class="fa-solid fa-star fa-lg icon active"></i>
    <i class="fa-solid fa-star fa-lg icon"></i>
    <i class="fa-solid fa-star fa-lg icon"></i>
    <i class="fa-solid fa-star fa-lg icon"></i>
</div>
```

### Your own icons

Write the `.icon` elements yourself and the plugin uses them as they are, ignoring `icon` and `maxRating`:

```html
<div class="rating" data-plugin-rating>
    <span class="icon">😞</span>
    <span class="icon">😐</span>
    <span class="icon">🙂</span>
    <span class="icon">😄</span>
</div>
```

### Sizes

Put one size class on the wrapper. The plugin detects it and adds the matching Font Awesome size class (`fa-xs` … `fa-xl`, nothing for `md`) to generated icons.

| Class | Font Awesome class |
| - | - |
| `rating-xs` | `fa-xs` |
| `rating-sm` | `fa-sm` |
| `rating-md` | none |
| `rating-lg` | `fa-lg` |
| `rating-xl` | `fa-xl` |

A size class on the wrapper wins over the `size` option.

### Color skins

`themestrap-elements.css` includes `rating-primary` and the other palette skins:

```html
<div class="rating rating-primary" data-plugin-rating></div>
```



## Configuration Options

| Option | Type | Default | Description |
| - | - | - | - |
| `icon` | `string` | `'fa-solid fa-star'` | What each icon is. Inline SVG starting with `<svg`; any other markup starting with `<` (wrapped in `<span class="icon">`); or a class string for an `<i>`, from any icon font. Font Awesome class strings also get the `fa-{size}` modifier. |
| `currentColor` | `boolean` | `false` | For SVG icons: rewrite every `fill` and `stroke` (other than `none`) to `currentColor`, so CSS colors apply. |
| `initialRating` | `number` | `0` | Starting value. Fractions show a partial icon. |
| `interactive` | `boolean` | `true` | `false` makes the rating read-only: hovers and clicks are ignored and the wrapper gets `.disabled`. `enable()` and `disable()` switch it later. |
| `maxRating` | `number` | `5` | How many icons to generate. |
| `clearable` | `boolean\|string` | `'auto'` | `true`: clicking the current value clears it. `false`: never. `'auto'`: only when there is a single icon (a favorite toggle). |
| `size` | `string` | `'md'` | `xs`, `sm`, `md`, `lg` or `xl`. Overridden by a `rating-*` class on the wrapper. |
| `onRate` | `function\|null` | no-op | Called on every non-silent change. `this` is the wrapper element; the argument is the new rating. |

### SVG icons

```js
$('#hearts').themestrapPluginRating({
    icon: '<svg viewBox="0 0 24 24" width="1em" height="1em"><path fill="#e11d48" d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9z"/></svg>',
    currentColor: true
});
```

Each SVG is wrapped in `<span class="icon svg-icon">`. With `currentColor: true` the icon's color comes from CSS like a font icon. The partial fill uses `background-clip: text`, which does not work on SVG, so fractions only render for font icons.



## Public API

Read the instance from a fresh selection, never off the init call. The bridge takes options only, not string commands.

```js
const r = $('#product-rating').data('__rating');
```

| Method | Returns | Description |
| - | - | - |
| `setRating(rating, silent)` | `this` | Shows a rating. Fractions are allowed. Pass `true` as the second argument to skip `onRate`. |
| `getRating()` | `number` | The current rating exactly as set, fractions included (`3.7` after `setRating(3.7)`). |
| `clearRating()` | `this` | `setRating(0)`, with the callback. |
| `disable()` | `this` | Makes the rating read-only and clears any hover highlight. |
| `enable()` | `this` | Makes it interactive again. `enable()` and `disable()` can be switched any number of times. |
| `destroy()` | `this` | Removes the handlers and the instance. The icons stay. |



## Events

There are no DOM events. Use the `onRate` callback:

```js
$('#product-rating').themestrapPluginRating({
    onRate: function (rating) {
        this.setAttribute('aria-label', rating + ' out of 5');
        $(this).trigger('rating:change', [rating]);   // re-emit as an event if you need one
    }
});
```



## CSS Custom Properties

The plugin sets one property itself:

| Property | Set on | Value |
| - | - | - |
| `--full` | The `.partial` icon | The filled fraction, such as `70%` |

The styles in `themestrap-elements.css` use fixed colors (`rgba(0,0,0,.15)` empty, `rgba(0,0,0,.85)` filled) and the palette variables for the `rating-*` skins. The demo's stand-alone stylesheet uses three tokens you can adopt:

```css
.ts-rating {
    --ts-rating-empty:  #d1d5db;
    --ts-rating-filled: #f59e0b;
    --ts-rating-hover:  #fbbf24;
    display: inline-flex;
    gap: 4px;
}
.ts-rating .icon          { color: var(--ts-rating-empty); cursor: pointer; }
.ts-rating .icon.active   { color: var(--ts-rating-filled); }
.ts-rating .icon.selected { color: var(--ts-rating-hover); }
.ts-rating .icon.partial {
    background: linear-gradient(to right, var(--ts-rating-filled) var(--full, 50%), var(--ts-rating-empty) var(--full, 50%));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.ts-rating.disabled .icon { cursor: default; }
```

### Dark mode

`themestrap-elements.css` has no dark rules for `.rating`; the empty color is a black at 15% and almost disappears on dark backgrounds. Add one:

```css
html.dark .rating .icon,
[data-bs-theme="dark"] .rating .icon { color: rgba(255, 255, 255, .2); }
html.dark .rating .active.icon,
[data-bs-theme="dark"] .rating .active.icon { color: #fbbf24; }
```



## Keyboard Navigation

The plugin has no keyboard support: the icons are not focusable and respond only to the mouse and touch. For forms that must be keyboard accessible, pair the widget with a native control and keep them in sync:

```html
<label for="score">Your rating</label>
<select id="score" name="score">
    <option value="">Choose</option>
    <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
</select>
<div id="score-stars" class="rating" data-plugin-rating aria-hidden="true"></div>
```

```js
$('#score-stars').themestrapPluginRating({
    onRate: function (r) { $('#score').val(r || ''); }
});
$('#score').on('change', function () {
    $('#score-stars').data('__rating').setRating(+this.value || 0, true);
});
```



## ARIA Wiring

The plugin adds no ARIA. For a read-only rating, give the wrapper an image role and a label:

```html
<div class="rating" data-plugin-rating role="img" aria-label="Rated 4.3 out of 5"
     data-plugin-options='{"initialRating": 4.3, "interactive": false}'></div>
```

For an interactive rating, use the native control pattern above and hide the stars from assistive technology.



## Recipes

### Read-only average with a count

```html
<div class="d-flex align-items-center gap-2">
    <div class="rating rating-sm" data-plugin-rating role="img" aria-label="Rated 4.6 out of 5"
         data-plugin-options='{"initialRating": 4.6, "interactive": false}'></div>
    <span>4.6 · 128 reviews</span>
</div>
```

### A favorite toggle

```js
$('#fav').themestrapPluginRating({
    icon: 'fa-solid fa-heart',
    maxRating: 1,                    // clearable 'auto' makes a single icon a toggle
    onRate: function (r) { saveFavorite(r === 1); }
});
```

### Ten-point scale

```js
$('#nps').themestrapPluginRating({ maxRating: 10, icon: 'fa-solid fa-circle', size: 'sm' });
```



## Common Pitfalls

### Icons look unstyled

The plugin writes plain `<i>` or `<span>` elements with the `.icon` class and injects no CSS. Load `themestrap-elements.css` (the `.rating` block) or style `.icon`, `.icon.active`, `.icon.partial` and `.icon.selected` yourself.

### A fraction shows as a full icon

The partial fill uses `background-clip: text`, which only works on font icons. SVG and image icons show a fraction as a full icon.

### Diagnostic checklist

- [ ] The `.rating` styles are loaded (`themestrap-elements.css` or your own).
- [ ] Font Awesome is loaded when using the default icon.
- [ ] The icon font named in `icon` is loaded.
- [ ] Read-only ratings have `role="img"` and an `aria-label`; interactive ones have a native control.
- [ ] The instance is read with `$(selector).data('__rating')`.
