# PluginCodeRail

**File:** `js/components/themestrap.plugin.coderail.js`  
**jQuery method:** `$.fn.themestrapPluginCodeRail`  
**Instance key:** `__codeRail`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

## Over**view**

PluginCodeRail implements the classic two-column API-reference layout: prose sections on the left, a sticky code column on the right whose visible panel cross-fades to stay in sync with the section you are currently reading.

On narrow viewports the columns collapse and each code panel is relocated inline directly beneath its matching prose section. Resize back up and the sticky rail is restored with no page reload needed.

The plugin owns only the **layout and scroll-sync logic**. The code panels inside it can be any content like, `[data-plugin-highlight]` blocks, `[data-plugin-code-window]` panels, or plain `<pre>` elements and are decorated by their own plugins independently.

## Mark**up**

```html
<div data-plugin-code-rail
     data-plugin-options='{"top": 96, "breakpoint": 1024, "fade": true}'>

  <!-- Left column: prose sections -->
  <div data-code-rail-main>
    <section data-code-rail-section="create" id="create">
      <h2>Create</h2>
      <p>Prose about creating a resource…</p>
    </section>
    <section data-code-rail-section="list" id="list">
      <h2>List</h2>
      <p>Prose about listing resources…</p>
    </section>
    <section data-code-rail-section="delete" id="delete">
      <h2>Delete</h2>
      <p>Prose about deleting a resource…</p>
    </section>
  </div>

  <!-- Right column: matching code panels -->
  <div data-code-rail-aside>
    <div data-code-rail-panel="create">
      <pre data-plugin-highlight="bash"><code>curl -X POST https://api.example.com/items</code></pre>
    </div>
    <div data-code-rail-panel="list">
      <pre data-plugin-highlight="bash"><code>curl https://api.example.com/items</code></pre>
    </div>
    <div data-code-rail-panel="delete">
      <pre data-plugin-highlight="bash"><code>curl -X DELETE https://api.example.com/items/1</code></pre>
    </div>
  </div>

</div>
```

> [!NOTE]  
> Each `data-code-rail-section` value is paired with the `data-code-rail-panel` that shares the same value. Sections with no matching panel keep the previous panel visible.

## Configuration **Options**

| Option | Type | Default | Description |
|---|---|---|---|
| `top` | `number` | `96` | Sticky offset from the viewport top in px. Should match your sticky navbar height plus desired gap. |
| `breakpoint` | `number` | `1024` | Minimum viewport width (px) for the two-column rail layout. Below this threshold the layout collapses to stacked. |
| `rootMargin` | `string` | `''` | Override the IntersectionObserver band used for scroll-sync. Defaults to `"-{top}px 0px -62% 0px"`. |
| `fade` | `boolean` | `true` | Cross-fade between panels when the active section changes. |

## Programmatic **API**

### Retrieve the instance

```js
const cr = $('#api-docs').data('__codeRail');
```

### `activate(id)`

Force a specific panel to become active. Useful for programmatic navigation (e.g. clicking a sidebar link).

```js
cr.activate('list');
```

### `refresh()`

Re-evaluates the layout mode (rail vs stacked). Call after dynamic content changes that alter the viewport width or after injecting new sections.

```js
cr.refresh();
```

### `destroy()`

Disconnects the `IntersectionObserver`, removes the `resize` listener, restores original markup, and cleans up `$.data`.

---

## Events

Events fire on the root `[data-plugin-code-rail]` element.

| Event | When | Arguments |
|---|---|---|
| `coderail:ready` | After `build()` completes | `(event, instance)` |
| `coderail:change` | When the active panel changes | `(event, instance, id, $panel)` |

```js
$('[data-plugin-code-rail]').on('coderail:change', (e, cr, id, $panel) => {
    console.log('Active section:', id);
});
```

---

## Layout **Modes**

| Mode | Class applied | When |
|---|---|---|
| Two-column rail | `.ts-code-rail--rail` | `window.innerWidth >= options.breakpoint` |
| Stacked (inline) | `.ts-code-rail--stacked` | Below the breakpoint |

In **rail** mode panels sit in the sticky aside and only the active one is visible. In **stacked** mode each panel is moved inline directly after its matching prose section; the aside becomes an empty container.

The mode is re-evaluated on every `window resize` event.

## Custom **Properties**

The plugin injects its own `<style id="ts-code-rail-styles">` on first use.

| Property | Default | Description |
|---|---|---|
| `--ts-cr-top` | `96px` | Sticky top offset (set from `options.top`). |
| `--ts-cr-gap` | `3rem` | Gap between the prose and aside columns. |
| `--ts-cr-aside-w` | `27rem` | Width of the sticky aside column. |

Override these on the root element or in your site CSS:

```css
[data-plugin-code-rail] {
    --ts-cr-aside-w: 32rem;
    --ts-cr-gap: 4rem;
}
```

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginCodeRail']) && $('[data-plugin-code-rail]').length) {
    themestrap.fn.intObsInit('[data-plugin-code-rail]:not(.manual)', 'themestrapPluginCodeRail');
}
```