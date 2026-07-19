# PluginDarkMode

**File:** `js/components/themestrap.plugin.darkmode.js`  
**jQuery method:** `$.fn.themestrapPluginDarkMode`  
**Instance key:** `__darkMode`  
**Init strategy:** `intObsInit` via `themestrap.init.js`

## Over**view**

PluginDarkMode provides a fully-featured light/dark theme toggle with localStorage persistence, system-preference tracking, cross-tab sync, and optional cookie support for server-side awareness.

The plugin applies the theme immediately on script load — before DOMReady — to minimize flash-of-unstyled-content. It adds a `dark` class to `<html>`, sets `data-theme`, and sets `data-bs-theme` so Bootstrap 5.3 native components respond automatically.

All toggle buttons on the page share a single module-level theme state; when one button toggles the theme, all other `[data-plugin-darkmode]` instances update their icon and ARIA state in sync.

## FOUC **Prevention** (recommended)

Place this snippet **before any CSS** in `<head>` to apply the theme class as early as possible:

```html
<script>
  (function(){
    try {
      var s = localStorage.getItem('themestrap-theme'),
          d = matchMedia('(prefers-color-scheme: dark)').matches,
          t = s || (d ? 'dark' : 'light'),
          h = document.documentElement;
      if (t === 'dark') h.classList.add('dark');
      h.setAttribute('data-theme', t);
      h.setAttribute('data-bs-theme', t);
    } catch(e) {}
  })();
</script>
```

## Mark**up**

Any element can be a toggle button:

```html
<!-- Button (preferred for accessibility) -->
<button data-plugin-darkmode></button>

<!-- Link -->
<a href="#" data-plugin-darkmode></a>

<!-- Any element (plugin adds role="button" and tabindex="0" automatically) -->
<span data-plugin-darkmode></span>
```

> [!NOTE]  
> The plugin injects a sun SVG (in light mode) or moon SVG (in dark mode) into the element. Set `renderIcon: false` to suppress icon injection and render your own content.

---

## Resolution **Order**

On every page load the plugin resolves the initial theme in this priority:

> 1. `localStorage['themestrap-theme']` — an explicit user choice (set by a previous toggle)
> 2. `window.matchMedia('(prefers-color-scheme: dark)')` — the OS preference
> 3. `'light'` — the default fallback

---

## Configuration **Options**

| Option | Type | Default | Description |
|---|---|---|---|
| `storageKey` | `string` | `'themestrap-theme'` | `localStorage` key. Override to share theme state across multiple projects on the same domain. |
| `darkClass` | `string` | `'dark'` | Class added to `<html>` in dark mode. Must match the selector your theme CSS uses. |
| `dataAttribute` | `string\|null` | `'data-theme'` | Attribute set on `<html>` reflecting the current theme. Set to `null` to disable. |
| `bsThemeAttribute` | `string\|null` | `'data-bs-theme'` | Bootstrap 5.3 theme attribute on `<html>`. Set to `null` to disable. |
| `cookieEnabled` | `boolean` | `true` | Write a cookie alongside localStorage so the server can read the theme at render time. |
| `cookieName` | `string` | `'themestrap-theme'` | Cookie name. |
| `cookieMaxAge` | `number` | `31536000` | Cookie `max-age` in seconds (default: 1 year). |
| `cookiePath` | `string` | `'/'` | Cookie `path`. |
| `cookieSameSite` | `string` | `'lax'` | Cookie `SameSite` policy: `'lax'`, `'strict'`, or `'none'`. |
| `renderIcon` | `boolean` | `true` | Inject the sun/moon SVG into the toggle element. |
| `iconSun` | `string` | *(built-in SVG)* | SVG string for the sun icon (shown in light mode). |
| `iconMoon` | `string` | *(built-in SVG)* | SVG string for the moon icon (shown in dark mode). |
| `ariaLabelLight` | `string` | `'Switch to light mode'` | `aria-label` applied when clicking will switch to light. |
| `ariaLabelDark` | `string` | `'Switch to dark mode'` | `aria-label` applied when clicking will switch to dark. |
| `onChange` | `function\|null` | `null` | Callback fired on every theme change for this instance, after the DOM is updated. Receives `(theme)`. |

## Static **API**

All static methods are callable without a plugin instance.

### `PluginDarkMode.getTheme()`

Returns the current theme: `'light'` or `'dark'`.

```js
const theme = themestrap.PluginDarkMode.getTheme();
```

### `PluginDarkMode.setTheme(theme)`

Applies and persists the given theme. Accepts `'light'` or `'dark'`.

```js
themestrap.PluginDarkMode.setTheme('dark');
```

### `PluginDarkMode.toggle()`

Flips the current theme.

```js
themestrap.PluginDarkMode.toggle();
```

### `PluginDarkMode.reset()`

Clears the stored user preference (localStorage + cookie) and reverts to the OS preference.

```js
themestrap.PluginDarkMode.reset();
```

### `PluginDarkMode.apply()`

Re-runs the full resolution order. Useful after manually changing `PluginDarkMode.defaults.storageKey`.

```js
themestrap.PluginDarkMode.apply();
```

## Instance **API**

### Retrieve the instance

```js
const dm = $('[data-plugin-darkmode]').first().data('__darkMode');
dm.destroy(); // Remove events and clean up
```

### `destroy()`

Removes click and keyboard listeners and deletes the instance from `$.data`. Also removes the instance from the shared notification set (the instance will no longer receive `_refreshUI` calls).

## Toggle **Classes**

The plugin adds helper classes to the toggle element for styling:

| Class | When |
|---|---|
| `.is-dark` | The current theme is dark |
| `.is-light` | The current theme is light |

## Cross-Tab **Sync**

The plugin listens to the `storage` event on `window`. When the theme is changed in another tab, all tabs mirror the change automatically — no page reload needed.

## Preference **Tracking**

Until a user makes a manual choice, the plugin tracks `prefers-color-scheme` changes in real time via a `MediaQueryList` listener. Once the user toggles manually (writing to localStorage), OS changes are no longer applied until `reset()` is called.

## Auto-init (init.js)

```js
if ($.isFunction($.fn['themestrapPluginDarkMode']) && $('[data-plugin-darkmode]').length) {
    themestrap.fn.intObsInit('[data-plugin-darkmode]:not(.manual)', 'themestrapPluginDarkMode');
}
```

## Common **Pitfalls**

**No anti-flash snippet = visible flash on hard reload.** The jQuery plugin runs after DOMReady. Without the synchronous inline snippet in `<head>`, a returning dark-mode user will briefly see the light theme. Always include the anti-flash snippet.

**Multiple toggle buttons on one page.** Each `[data-plugin-dark-mode]` element gets its own instance, but they all write the same `localStorage` key and toggle the same `<html>` class. They stay in sync naturally — no special wiring needed.

**Custom `darkClass` must match your CSS.** If you pass `darkClass: 'theme-dark'`, your CSS must use `html.theme-dark` for dark-mode rules, not `html.dark`.