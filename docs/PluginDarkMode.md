# DarkMode Guide

Themestrap's zero-flash dark mode toggle — persists preference in `localStorage`, detects `prefers-color-scheme` on first visit, and writes both a class on `<html>` and Bootstrap 5.3's `data-bs-theme` attribute in the same synchronous tick that executes the script.

## [How It **Works**](#how-it-works)

The plugin applies the correct theme class the instant the script executes — before the browser paints a single pixel. This prevents the flash of the wrong theme that plagues typical `DOMContentLoaded`-based implementations.

### Resolution order on first paint

1. `localStorage[storageKey]` — the user's saved preference.
2. `prefers-color-scheme: dark` media query — the OS/browser default.
3. Light mode — the fallback.

### What gets toggled

On every toggle the plugin:

1. Adds or removes `darkClass` on `<html>`.
2. Sets `data-theme` and `data-bs-theme` on `<html>` to `'dark'` or `'light'` so Bootstrap 5.3 native components pick up the theme automatically.
3. Writes the preference to `localStorage[storageKey]`.

---

## [Quick **Start**](#quick-start)

```html
<!-- Anti-flash snippet: place as the first script in <head> -->
<script>
(function(){
  var k = 'themestrap-theme';
  var d = localStorage.getItem(k) ||
          (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  if (d === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }
})();
</script>

<!-- The toggle button — anywhere in the body -->
<button data-plugin-dark-mode class="btn btn-icon" aria-label="Toggle dark mode">
  <i class="fas fa-moon"></i>
</button>
```

### Init

```js
// Manual
$('[data-plugin-dark-mode]').themestrapPluginDarkMode();

// Auto-init (themestrap.init.js)
if ($.isFunction($.fn['themestrapPluginDarkMode'])
    && $('[data-plugin-dark-mode]').length) {
  $('[data-plugin-dark-mode]').themestrapPluginDarkMode();
}
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storageKey` | string | `'themestrap-theme'` | Key used in `localStorage` to persist the preference. |
| `darkClass` | string | `'dark'` | Class added to `<html>` when dark mode is active. |
| `dataAttr` | string | `'data-theme'` | Data attribute set on `<html>` alongside the class. |
| `bsDataAttr` | string | `'data-bs-theme'` | Bootstrap 5.3 theme attribute set on `<html>`. |
| `onChange` | function | `null` | Callback on every toggle: `fn(isDark, instance)`. |

---

## [Instance **API**](#instance-api)

```js
const dm = $('[data-plugin-dark-mode]').data('__darkMode');

dm.enable();            // force dark mode
dm.disable();           // force light mode
dm.toggle();            // flip
dm.isDark();            // => true | false
dm.destroy();           // unbind click handler, keep theme class as-is
```

---

## [Recipe **Cookbook**](#recipes)

#### Icon swap on toggle

```html
<button data-plugin-dark-mode class="btn btn-icon" aria-label="Toggle dark mode">
  <i class="fas fa-sun  d-none dark:d-inline"></i>
  <i class="fas fa-moon dark:d-none"></i>
</button>

<style>
html.dark .dark\:d-none   { display: none   !important; }
html.dark .dark\:d-inline { display: inline !important; }
</style>
```

#### Sync to a server-side cookie

```js
$('[data-plugin-dark-mode]').themestrapPluginDarkMode({
  onChange(isDark) {
    document.cookie = `theme=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000`;
  }
});
```

---

## [Common **Pitfalls**](#pitfalls)

**No anti-flash snippet = visible flash on hard reload.** The jQuery plugin runs after DOMReady. Without the synchronous inline snippet in `<head>`, a returning dark-mode user will briefly see the light theme. Always include the anti-flash snippet.

**Multiple toggle buttons on one page.** Each `[data-plugin-dark-mode]` element gets its own instance, but they all write the same `localStorage` key and toggle the same `<html>` class. They stay in sync naturally — no special wiring needed.

**Custom `darkClass` must match your CSS.** If you pass `darkClass: 'theme-dark'`, your CSS must use `html.theme-dark` for dark-mode rules, not `html.dark`.
