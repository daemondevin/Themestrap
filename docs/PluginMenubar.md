# PluginMenubar

An accessible menubar that provides top-level menus with dropdown panels, checkbox items, radio groups, nested sub-menus, and complete WAI-ARIA Menubar keyboard navigation; all driven by `data-*` attributes with zero external dependencies beyond jQuery.

---

## Quick Start

```html
<!-- 1. Markup -->
<div data-plugin-menubar>
  <div data-menubar-menu>
    <button data-menubar-trigger>File</button>
    <div data-menubar-content>
      <button data-menubar-item data-menubar-shortcut="⌘N">
        <span data-menubar-item-label>New Window</span>
      </button>
    </div>
  </div>
</div>

<!-- 2. Scripts (after jQuery + themestrap.js) -->
<script src="js/components/themestrap.plugin.menubar.js"></script>

<!-- 3. Init (or use init.js wiring below) -->
<script>
$('[data-plugin-menubar]').themestrapPluginMenubar();
</script>
```

---

## Markup Reference

### Root

```html
<div data-plugin-menubar data-plugin-options='{"loop": true}'>
  ...
</div>
```

The root element receives `role="menubar"`. Add `aria-label` directly on the element to override the default `"Application menu bar"`.

### Menu (trigger + panel pair)

```html
<div data-menubar-menu>
  <button data-menubar-trigger>Edit</button>
  <div data-menubar-content>
    <!-- items go here -->
  </div>
</div>
```

Each `[data-menubar-menu]` wraps exactly one trigger and one content panel. The plugin wires ARIA automatically (`role`, `aria-haspopup`, `aria-expanded`, `aria-controls`).

### Plain item

```html
<button data-menubar-item data-menubar-shortcut="⌘N">
  <span data-menubar-item-icon>+</span>
  <span data-menubar-item-label>New Window</span>
</button>
```

| Part | Attribute | Description |
|---|---|---|
| Item root | `data-menubar-item` | Required. Receives `role="menuitem"` and `tabindex="-1"`. |
| Icon | `data-menubar-item-icon` | Optional. Any inline HTML — emoji, SVG, font icon. |
| Label | `data-menubar-item-label` | Optional wrapper; used for type-ahead text matching. |
| Shortcut hint | `data-menubar-shortcut="⌘N"` | Injected into a right-aligned `[data-menubar-shortcut-text]` span. |
| Disabled | `data-menubar-disabled="true"` | Adds `.ts-mb-disabled`, `aria-disabled="true"`, removes pointer events. |

### Separator

```html
<hr data-menubar-separator>
```

Receives `role="separator"` automatically.

### Group label

```html
<div data-menubar-label>Options</div>
```

Non-interactive heading; `aria-hidden="true"`. Use before a group of related items.

### Checkbox item

```html
<button data-menubar-item
        data-menubar-type="checkbox"
        data-menubar-checked="true">
  <span data-menubar-indicator>✓</span>
  <span data-menubar-item-label>Show Status Bar</span>
</button>
```

- Receives `role="menuitemcheckbox"`.
- `data-menubar-checked="true"` sets the initial on state.
- On activation the plugin toggles `aria-checked`, `data-menubar-checked`, and `.ts-mb-indicator-on` on `[data-menubar-indicator]`.
- The menu **stays open** after toggling — checkbox items are persistent.

Read state at any time:

```js
$('[data-menubar-type="checkbox"]').attr('aria-checked'); // "true" | "false"
```

### Radio group

```html
<div data-menubar-radio-group>
  <button data-menubar-item data-menubar-type="radio"
          data-menubar-value="small">
    <span data-menubar-indicator>●</span>
    <span data-menubar-item-label>Small</span>
  </button>
  <button data-menubar-item data-menubar-type="radio"
          data-menubar-value="medium" data-menubar-checked="true">
    <span data-menubar-indicator>●</span>
    <span data-menubar-item-label>Medium</span>
  </button>
</div>
```

- The `[data-menubar-radio-group]` wrapper receives `role="group"`.
- Each item receives `role="menuitemradio"`.
- Activating one item unchecks all siblings within the same group and checks the activated item.
- The menu **stays open** after selection — radio items are persistent.

### Submenu

```html
<div data-menubar-sub>

  <!-- The trigger: also a menuitem -->
  <button data-menubar-item data-menubar-sub-trigger>
    <span data-menubar-item-label>Share</span>
  </button>

  <!-- The nested panel -->
  <div data-menubar-sub-content>
    <button data-menubar-item>Copy Link</button>
    <button data-menubar-item>Email…</button>
  </div>

</div>
```

- `[data-menubar-sub-trigger]` receives `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`.
- The panel opens on hover (after `subDelay` ms) or on `ArrowRight` / `Enter` keyboard.
- Panel closes on mouse-out (after `subCloseDelay` ms) or `ArrowLeft` / `Escape`.
- Viewport edge detection flips the panel to the left when it would overflow.
- Sub-menus may **not** be nested further (one level only).

---

## Options

Pass via `data-plugin-options` JSON or as a JS object:

```js
$('[data-plugin-menubar]').themestrapPluginMenubar({
    loop:             true,
    closeOnEscape:    true,
    subDelay:         200,
    animationDuration: 150,
    onSelect: function($item, payload, instance) {
        console.log(payload.type, payload.label, payload.value);
    }
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `subDelay` | Number | `200` | ms hover delay before a sub-menu opens. |
| `subCloseDelay` | Number | `120` | ms hover-out grace period before a sub-menu closes. |
| `animationDuration` | Number | `150` | Duration of open/close opacity + transform transition. |
| `closeOnOutside` | Boolean | `true` | Clicking outside the menubar closes the open panel. |
| `closeOnEscape` | Boolean | `true` | `Escape` closes the open panel and returns focus to its trigger. |
| `loop` | Boolean | `true` | Arrow key navigation wraps from last menu back to first and vice-versa. |
| `onOpen` | Function | `null` | `(menuIndex, instance)` — called after a top-level menu opens. |
| `onClose` | Function | `null` | `(menuIndex, instance)` — called after a top-level menu closes. |
| `onSelect` | Function | `null` | `($item, payload, instance)` — called on any item activation. |

### `onSelect` payload

```js
{
    type:    "item" | "checkbox" | "radio",
    label:   "New Window",    // text from [data-menubar-item-label] or full text
    value:   "medium",        // data-menubar-value, or null
    checked: "true" | "false" | null // aria-checked after toggle, or null for plain items
}
```

---

## Keyboard Navigation

### Triggers (menubar level)

| Key | Action |
|---|---|
| `→` | Move focus to the next trigger. If a menu is open, opens the next menu immediately. |
| `←` | Move focus to the previous trigger. If a menu is open, opens the previous menu immediately. |
| `↓` / `Enter` / `Space` | Open the focused trigger's menu; focus moves to the first item. |
| `↑` | Open the focused trigger's menu; focus moves to the last item. |
| `Home` | Move focus to the first trigger. |
| `End` | Move focus to the last trigger. |
| `Tab` | Close any open menu and move browser focus normally. |

### Inside a menu panel

| Key | Action |
|---|---|
| `↓` / `↑` | Navigate items, wrapping at ends. |
| `Home` / `End` | Jump to first / last item. |
| `→` | Move to the next top-level menu (unless on a sub-trigger). |
| `←` | Move to the previous top-level menu (unless inside a sub-menu). |
| `Enter` / `Space` | Activate the focused item. |
| `Escape` | Close the panel; return focus to its trigger. |
| Letter | Type-ahead: focus jumps to the next item whose label starts with the typed character. |

### Inside a sub-menu

| Key | Action |
|---|---|
| `↓` / `↑` | Navigate sub-menu items. |
| `→` / `Enter` | Open the sub-menu when focus is on a sub-trigger. |
| `←` / `Escape` | Close the sub-menu; return focus to the sub-trigger. |

---

## Public API

```js
const mb = $('#my-menubar').data('__pluginMenubar');

mb.openMenu(2);      // Open the third menu (0-based index)
mb.closeMenu();      // Close the currently open menu
mb.getActiveMenu();  // Returns open menu index, or -1
mb.destroy();        // Full teardown — removes ARIA, events, and CSS classes
```

---

## Events

The plugin fires native `CustomEvent`s on the root `[data-plugin-menubar]` element. Listen with jQuery or `addEventListener`:

```js
document.getElementById('my-menubar').addEventListener('menubar:open', function(e) {
    console.log('Opened menu', e.detail.index);
});

$('#my-menubar').on('menubar:select', function(e) {
    const { $item, payload, instance } = e.detail;
    console.log(payload.type, payload.label);
});
```

| Event | `detail` keys | Fires when… |
|---|---|---|
| `menubar:open` | `{ index, instance }` | A top-level menu opens. |
| `menubar:close` | `{ index, instance }` | A top-level menu closes. |
| `menubar:select` | `{ $item, payload, instance }` | Any item is activated (click or keyboard). |

---

## Theming with CSS Variables

Override variables on the root element or in your stylesheet to retheme without touching the plugin's CSS:

```css
/* Example: navy dark theme */
#my-menubar {
    --ts-mb-fg:             #e8eaf0;
    --ts-mb-hover-bg:       rgba(255,255,255,.07);
    --ts-mb-active-bg:      rgba(255,255,255,.12);
    --ts-mb-content-bg:     #0e2238;
    --ts-mb-content-border: rgba(255,255,255,.1);
    --ts-mb-item-hover-bg:  rgba(255,255,255,.07);
    --ts-mb-separator:      rgba(255,255,255,.09);
    --ts-mb-focus-ring:     #2ab8c8;
}
```

Dark mode is applied automatically when `html.dark` is present (set by PluginDarkMode). Add `.ts-mb-dark` directly to `[data-plugin-menubar]` to force dark appearance regardless of `html.dark`.

| Variable | Default | Controls |
|---|---|---|
| `--ts-mb-fg` | `#0f172a` | Text for triggers and items. |
| `--ts-mb-muted` | `#64748b` | Icons, shortcuts, group labels. |
| `--ts-mb-hover-bg` | `rgba(0,0,0,.06)` | Trigger hover background. |
| `--ts-mb-active-bg` | `rgba(0,0,0,.09)` | Trigger open/active background. |
| `--ts-mb-focus-ring` | `#e8672a` | Trigger focus outline. |
| `--ts-mb-content-bg` | `#ffffff` | Dropdown background. |
| `--ts-mb-content-border` | `rgba(0,0,0,.08)` | Dropdown border. |
| `--ts-mb-content-shadow` | `0 4px 24px …` | Dropdown shadow. |
| `--ts-mb-item-hover-bg` | `rgba(0,0,0,.05)` | Item hover / focus background. |
| `--ts-mb-separator` | `rgba(0,0,0,.08)` | Separator line. |
| `--ts-mb-indicator-color` | `#0f172a` | Checkbox / radio indicator glyph. |
| `--ts-mb-radius` | `5px` | Trigger border-radius. |
| `--ts-mb-content-radius` | `8px` | Dropdown border-radius. |
| `--ts-mb-z` | `1050` | Dropdown z-index. |

---

## Init.js Wiring

Add to `themestrap.init.js` for auto-initialization:

```js
if ($.isFunction($.fn['themestrapPluginMenubar']) && $('[data-plugin-menubar]').length) {
    $(() => {
        $('[data-plugin-menubar]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginMenubar(opts);
        });
    });
}
```

Opt out of auto-init for a specific instance with the `.manual` class and initialize it yourself:

```js
$('#my-menubar').themestrapPluginMenubar({ loop: false });
```

---

## MODX Snippet

```php
<?php
/**
 * tsMenubar snippet
 * Renders a Themestrap Menubar from a nested MODX menu resource tree.
 *
 * Properties:
 *   &startId  — Root resource ID (default: site root)
 *   &depth    — Menu depth (default: 2)
 *   &options  — JSON options for data-plugin-options
 *   &class    — Extra CSS classes on the root element
 */

$startId = $modx->getOption('startId', $scriptProperties, $modx->resource->get('id'));
$depth   = (int)$modx->getOption('depth', $scriptProperties, 2);
$options = $modx->getOption('options', $scriptProperties, '{}');
$class   = $modx->getOption('class', $scriptProperties, '');

$resources = $modx->getChildIds($startId, $depth);
if (empty($resources)) return '';

$output  = '<div data-plugin-menubar';
if ($class)   $output .= ' class="' . htmlspecialchars($class) . '"';
if ($options !== '{}') $output .= " data-plugin-options='" . $options . "'";
$output .= '>' . PHP_EOL;

foreach ($modx->getChildIds($startId, 1) as $parentId) {
    $parent = $modx->getObject('modResource', $parentId);
    if (!$parent || !$parent->get('published')) continue;

    $output .= '  <div data-menubar-menu>' . PHP_EOL;
    $output .= '    <button data-menubar-trigger>'
             . htmlspecialchars($parent->get('menutitle') ?: $parent->get('pagetitle'))
             . '</button>' . PHP_EOL;
    $output .= '    <div data-menubar-content>' . PHP_EOL;

    foreach ($modx->getChildIds($parentId, 1) as $childId) {
        $child = $modx->getObject('modResource', $childId);
        if (!$child || !$child->get('published')) continue;
        $url   = $modx->makeUrl($childId, '', '', 'abs');
        $label = htmlspecialchars($child->get('menutitle') ?: $child->get('pagetitle'));
        $output .= '      <a data-menubar-item href="' . $url . '">'
                 . '<span data-menubar-item-label>' . $label . '</span>'
                 . '</a>' . PHP_EOL;
    }

    $output .= '    </div>' . PHP_EOL;
    $output .= '  </div>' . PHP_EOL;
}

$output .= '</div>' . PHP_EOL;
return $output;
```

Call in a template:

```
[[tsMenubar? &startId=`1` &depth=`2` &options=`{"loop": true}`]]
```