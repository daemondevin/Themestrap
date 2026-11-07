# Skins

One stylesheet in `css/skins/` decides the colors of the whole site: the original palette that `themestrap.css` reads, and the `--ts-skin-*` tokens every Themestrap plugin reads. Swap the file and every component follows, in light mode and dark mode.

**Files:** `css/skins/*.css`  
**Tokens:** `--ts-skin-*` (35 colors, 2 shadows, 3 radii, 2 font stacks)  
**Demo:** `demos/plugin.demo.skins.html`


## How It Works

Every color a plugin paints resolves through three layers, first match wins:

```css
/* inside PluginSelect's injected stylesheet */
--ts-select-content-bg: var(--ts-skin-surface, #ffffff);
/*                      ^ the skin            ^ what the plugin always used */
```

1. **The plugin's own token** (`--ts-select-content-bg`). Set it on a page or element to restyle one component.
2. **The skin token** (`--ts-skin-surface`). A skin file sets these on `:root`, once for light mode and once for dark mode.
3. **The literal** (`#ffffff`). Used when no skin is loaded, so a page without a skin looks exactly as it did before skins existed.

Plugins that read their colors from hook variables keep the same order. The page's hook comes first, then the skin, then the literal:

```css
--tp-bg: var(--ts-tp-bg, var(--ts-skin-surface, #ffffff));
```

Plugins colored with original variables (`--primary`, `--dark-300`, ...) follow the skin too, because every skin also sets the full original palette. `default.css` is the original original palette and sets no `--ts-skin-*` tokens, so with it every plugin keeps its own built-in look.


## Quick Start

Load one skin in place of `default.css`, before your own stylesheet:

```html
<link rel="stylesheet" href="css/themestrap.css">
<link rel="stylesheet" href="css/skins/nord.css">
```

That is the whole setup. PluginDarkMode already sets `html.dark` and `data-bs-theme`, which the skin's dark tier listens for.

To let visitors switch, swap the link's `href`:

```html
<link id="skin" rel="stylesheet" href="css/skins/venom.css">
<script>
  function useSkin(name) {
    document.getElementById('skin').href = 'css/skins/' + name + '.css';
  }
</script>
```


## Available Skins

| Skin | File | Source | Light accent | Dark accent |
| - | - | - | - | - |
| Default | `default.css` | original palette only, no `--ts-skin-*` tokens: plugins keep their own looks | `#0088CC` | n/a |
| Venom | `venom.css` | Base16 Black Metal (Venom) by metalelf0, as read by PluginAccordion. Light mode is derived. | `#b23a31` | `#b23a31` |
| Solarized | `solarized.css` | Base16 Solarized Light and Dark, by Ethan Schoonover. | `#268bd2` | `#268bd2` |
| Gruvbox | `gruvbox.css` | Base16 Gruvbox Light and Dark (medium), by Dawid Kurek, after Pavel Pertsev. | `#af3a03` | `#fe8019` |
| One | `one.css` | Base16 One Light and OneDark, after the Atom editor themes. | `#4078f2` | `#61afef` |
| Tomorrow | `tomorrow.css` | Base16 Tomorrow and Tomorrow Night, by Chris Kempson. | `#4271ae` | `#81a2be` |
| Nord | `nord.css` | Base16 Nord, by arcticicestudio. Light mode is derived. | `#4084a1` | `#88C0D0` |
| Dracula | `dracula.css` | Base16 Dracula, by Mike Barkmin, after Zeno Rocha. Light mode is derived. | `#9954f9` | `#bd93f9` |
| Rosé Pine | `rose-pine.css` | Base16 Rosé Pine Dawn and Rosé Pine, by Emilia Dunfelt. | `#907aa9` | `#c4a7e7` |
| Catppuccin | `catppuccin.css` | Base16 Catppuccin Latte and Mocha, by the Catppuccin community. | `#8839ef` | `#cba6f7` |

Every skin covers both modes. Schemes that only exist as a dark palette (Venom, Nord, Dracula) get a derived light mode with the same hues on paper-like neutrals, and accents darkened until they read on white.

Contrast was checked for every skin and mode: body text is at least 5:1 on its surface, secondary text at least 4.5:1, the accent at least 3:1, and text on the accent at least 3.7:1.


## Token Reference

### Surfaces

| Token | Used for |
| - | - |
| `--ts-skin-bg` | Page background |
| `--ts-skin-surface` | Component background: menus, panels, inputs, dialogs |
| `--ts-skin-surface-2` | Secondary fill: headers, footers, subtle wells, open rows |
| `--ts-skin-elevated` | Hover and raised fill on top of a surface |
| `--ts-skin-overlay` | Backdrop behind modal layers |

### Lines

| Token | Used for |
| - | - |
| `--ts-skin-border` | Default border and hairline |
| `--ts-skin-border-strong` | Emphasized border: hover, dividers that must read |

### Text

| Token | Used for |
| - | - |
| `--ts-skin-text` | Body text |
| `--ts-skin-text-strong` | Headings and emphasized text |
| `--ts-skin-text-dim` | Secondary text: descriptions, hints, placeholders |
| `--ts-skin-text-faint` | Disabled and tertiary text |

### Accent

| Token | Used for |
| - | - |
| `--ts-skin-accent` | Brand / interactive color |
| `--ts-skin-accent-hover` | Accent on hover or press |
| `--ts-skin-accent-soft` | Tinted background for selected and active items |
| `--ts-skin-on-accent` | Text and icons drawn on the accent color |
| `--ts-skin-ring` | Focus ring |

### Status

| Token | Used for |
| - | - |
| `--ts-skin-success` | Success color |
| `--ts-skin-success-soft` | Success background tint |
| `--ts-skin-warning` | Warning color |
| `--ts-skin-warning-soft` | Warning background tint |
| `--ts-skin-danger` | Error and destructive color |
| `--ts-skin-danger-soft` | Error background tint |
| `--ts-skin-info` | Informational color |
| `--ts-skin-info-soft` | Informational background tint |

### Inverse

| Token | Used for |
| - | - |
| `--ts-skin-inverse` | Inverted chip background (tooltips) |
| `--ts-skin-on-inverse` | Text on the inverse background |

### Code

| Token | Used for |
| - | - |
| `--ts-skin-code-bg` | Code block background |
| `--ts-skin-code-text` | Code block text |
| `--ts-skin-code-comment` | Syntax: comments (Base16 base03) |
| `--ts-skin-code-keyword` | Syntax: keywords (base0E) |
| `--ts-skin-code-string` | Syntax: strings (base0B) |
| `--ts-skin-code-number` | Syntax: numbers and constants (base09) |
| `--ts-skin-code-function` | Syntax: functions (base0D) |
| `--ts-skin-code-title` | Syntax: classes and titles (base0A) |
| `--ts-skin-code-variable` | Syntax: variables (base08) |
| `--ts-skin-code-builtin` | Syntax: built-ins and regex (base0C) |
| `--ts-skin-code-tag` | Syntax: tags and attributes |
| `--ts-skin-code-operator` | Syntax: operators and punctuation |
| `--ts-skin-code-meta` | Syntax: meta and deprecated (base0F) |

### Elevation

| Token | Used for |
| - | - |
| `--ts-skin-shadow` | Shadow for menus, popovers and cards |
| `--ts-skin-shadow-lg` | Shadow for dialogs, drawers and large overlays |

### Shape

| Token | Used for |
| - | - |
| `--ts-skin-radius-sm` | Small radius: chips, tags, small controls |
| `--ts-skin-radius` | Default radius: inputs, buttons, menus |
| `--ts-skin-radius-lg` | Large radius: dialogs, cards, panels |

### Type

| Token | Used for |
| - | - |
| `--ts-skin-font` | UI font stack (skins leave this unset) |
| `--ts-skin-font-mono` | Monospace stack (skins leave this unset) |

The `--ts-skin-code-*` syntax colors come from each scheme's Base16 slots (comments `base03`, keywords `base0E`, strings `base0B`, ...), the same slots PluginHighlight's default palette was already built on.

Skins leave `--ts-skin-font` and `--ts-skin-font-mono` unset so each plugin keeps its own stack. Set them on `:root` to change type everywhere at once.


## Dark Mode

Skin files use the same three tiers as the plugins:

| Tier | Selector | When |
| - | - | - |
| System preference | `@media (prefers-color-scheme: dark) { :root:not([data-bs-theme="light"]) }` | No explicit choice, OS is dark |
| Explicit dark | `html.dark, [data-bs-theme="dark"]` | PluginDarkMode (or your code) chose dark |
| Explicit light | `:root, [data-bs-theme="light"]` | Light, including a light island inside a dark page |

The original palette (`--primary`, `--dark`, ...) is the same in both modes, as it is in `default.css`.


## Overriding

Change one token for the whole site after the skin loads:

```css
:root { --ts-skin-accent: #e8672a; --ts-skin-accent-hover: #d2541b; }
html.dark { --ts-skin-accent: #ff8a4c; }
```

Change one component, whatever the skin:

```css
.ts-select { --ts-select-content-bg: #0e2238; }
```


## Writing a Skin

Copy any skin file and change the values. A skin has two halves:

1. **The original palette.** The same names, in the same order, as `default.css`. Each color has a ramp: three darker steps (`-100` to `-300`, minus 5, 7.5 and 10 points of HSL lightness), three lighter steps (`--100` to `--300`), ten alpha steps (`-rgba-0` to `-rgba-90`) and an `-inverse` text color.
2. **The `--ts-skin-*` tokens.** One block for light mode and the same block for dark mode, using the tiers above. Leave a token out and plugins fall back to their own value for it.

The skins in this folder were generated from the official Base16 scheme files (github.com/tinted-theming/schemes), mapping `base00` (background) and `base05` (foreground) to the neutral ramp and the accent slots to accent and status colors.


## What Follows the Skin

| Plugin | Tokens that read the skin |
| - | - |
| accordion | 12 tokens: `--ts-acc-*` |
| alert | 9 tokens: `--alert-ts-*` |
| auth | 8 tokens: `--au-*` |
| calendar | 11 tokens: `--accent-cyan`, `--bg-hover`, `--bg-raised`, `--border-dim`, ...; new hooks: `--ts-cal-accent-soft`, `--ts-cal-on-accent` |
| carousel | 11 tokens: `--tsc-*` |
| codewindow | 9 tokens: `--ts-cw-*` |
| colorpicker | 12 tokens: `--ts-cp-*` |
| commandmenu | 14 tokens: `--command-*` |
| contextmenu | new hooks: `--ts-ctx-border`, `--ts-ctx-danger`, `--ts-ctx-danger-soft`, `--ts-ctx-elevated`, `--ts-ctx-surface`, `--ts-ctx-text` |
| dialog | 6 tokens: `--ts-dlg-*` |
| dice | 9 tokens: `--dc-*` |
| drawer | 10 tokens: `--ts-drw-*` |
| emoticon | 9 tokens: `--em-*`, `--ts-emoticon-*` |
| highlight | 17 tokens: `--ts-highlight-*` |
| hovercard | 2 tokens: `--color-grey-200`, `--color-grey-300`; new hooks: `--ts-hc-border`, `--ts-hc-surface`, `--ts-hc-text`, `--ts-hc-text-dim` |
| loadingoverlay | 1 token: `--ts-lo-*` |
| lockscreen | 5 tokens: `--ts-lock-*`; new hooks: `--ts-ls-accent`, `--ts-ls-accent-soft`, `--ts-ls-on-accent` |
| markdown | 9 tokens: `--ts-md-*` |
| markdowneditor | 13 tokens: `--me-*`, `--ts-me-*`, `--ts-tb-*` |
| menubar | 13 tokens: `--ts-mb-*` |
| navbar | 17 tokens: `--ts-navbar-*` |
| navigation | 23 tokens: `--ts-nav-*` |
| navmenu | 3 tokens: `--ts-nav-*` |
| numberinput | 9 tokens: `--ni-*` |
| otp | 13 tokens: `--ts-otp-*` |
| panelnav | 13 tokens: `--ts-pn-*` |
| popover | new hooks: `--ts-pop-border`, `--ts-pop-surface`, `--ts-pop-text` |
| pricingtoggle | 6 tokens: `--pt-*` |
| progressbar | 4 tokens: `--danger`, `--info`, `--success`, `--warning` |
| richeditor | 10 tokens: `--re-*`, `--ts-re-*` |
| scrollbar | new hooks: `--ts-sb-border`, `--ts-sb-border-strong`, `--ts-sb-text-faint` |
| scroller | 3 tokens: `--ts-scroller-*` |
| select | 16 tokens: `--ts-select-*` |
| sidenav | 19 tokens: `--ts-sidenav-*` |
| tagsinput | 11 tokens: `--ts-ti-*` |
| timepicker | 12 tokens: `--tp-*` |
| toast | 15 tokens: `--ts-toast-*` |
| toolbar | 17 tokens: `--ts-tb-*` |
| tooltip | 2 tokens: `--ts-tt-*` |
| transfer | 7 tokens: `--ts-transfer-*` |
| tree | 11 tokens: `--accent-cyan`, `--bg-active`, `--bg-deepest`, `--bg-hover`, ...; new hooks: `--ts-tree-accent-soft`, `--ts-tree-on-accent`, `--ts-tree-text` |
| verticalnav | 13 tokens: `--ts-vn-*` |
| wizard | 9 tokens: `--wizard-*` |


## What Stays Fixed

Some colors describe the content or a deliberate design, not the theme, so they keep their literal values under every skin:

| Plugin | What stays | Why |
| - | - | - |
| Before / After | Handles and labels | Drawn on top of photos, they stay white |
| Lightbox | Viewer chrome | A media viewer stays dark |
| Lockscreen | Glass layer, clock and text | Always a dark layer over the page; its accent follows the skin |
| Scroll Shadow | Mask colors | Masks use `black` for opacity, not paint |
| Color Picker | Gradients, checkerboard, handles on the gradient | They show the color being picked |
| Scroll Bar | Named themes (`.ts-scrollbar-dark`, `-minimal`, `-3d`, ...) | Picking a named theme is an explicit choice; the default theme follows the skin |
| Code Window | Window buttons and glow | Decorative |
| Highlight | Marked-line tint | Matches the line markers in your own docs |
| Tooltip, Alert, Context Menu | Variants named `-dark`, `-light`, `primary` ... `quaternary` | Named variants are explicit; original-colored ones follow the skin through the original palette |
| Particles, Parallax, Random Images | Everything | No themable colors |


## Common Pitfalls

### Nothing changes when I load a skin

Plugins inject their stylesheets lazily, but they read the tokens at paint time, so load order between the skin and the plugin scripts doesn't matter. If nothing changes, the skin isn't on the page. Check the network panel for `css/skins/<name>.css`, then run this in the console:

```js
getComputedStyle(document.documentElement).getPropertyValue('--ts-skin-surface')
```

An empty string means no skin is loaded.

### A component ignores the skin

Your own stylesheet probably sets that plugin's token (for example `--ts-select-content-bg`). Plugin tokens win over the skin by design. Remove the override or set it to `var(--ts-skin-surface)`.

### Dark mode shows light colors

The skin's dark block listens for `html.dark` or `data-bs-theme="dark"`. A theme toggle that sets a different class (for example `body.dark-mode`) won't reach it. Use PluginDarkMode, or set `data-bs-theme` on `<html>` yourself.

### A light island inside a dark page stays dark

Plugins declare most of their tokens on `:root`, so they resolve against the page's mode, not the island's. Set the plugin tokens you need on the island element itself.

### Diagnostic checklist

- [ ] Exactly one skin file is loaded (two skins: the later one wins token by token).
- [ ] The skin loads after `themestrap.css` if you want the original palette to change too.
- [ ] Dark mode is signaled with `html.dark` or `data-bs-theme="dark"`.
- [ ] No leftover plugin-token overrides in your own CSS for components that should follow the skin.
- [ ] `--ts-skin-surface` resolves to a value in the console.
