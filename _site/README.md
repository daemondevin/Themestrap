# Themestrap site

The landing page and documentation site for [Themestrap](https://github.com/daemondevin/Themestrap).
Static files only: no build step, same as the library.

```
index.html              Landing page with live component lab
docs.html               Documentation viewer
assets/css/site.css     Site styles and plugin theme overrides
assets/js/manifest.js   Sidebar, search and routing data (one entry per guide)
assets/js/site.js       Command menu, copy buttons, lab demos, star count
assets/js/docs.js       Docs router and render polish
assets/img/favicon.svg
```

## How the docs work

`docs.html` holds one PluginMarkdown element:

```html
<article id="doc" data-plugin-markdown
         data-plugin-markdown-src="https://raw.githubusercontent.com/daemondevin/Themestrap/main/README.md"></article>
```

`docs.js` reads `?doc=` (for example `docs.html?doc=PluginDrawer`), looks it up in
`manifest.js`, and sets `data-plugin-markdown-src` to that file's raw GitHub URL before
`themestrap.init.js` starts the plugin. Later page changes call the instance's
`setSource()` and update the address bar, so moving between guides doesn't reload the page.

After each render, `docs.js` turns `> [!NOTE]` blocks into callouts, rewrites links
between guides to `docs.html?doc=…`, points other repository links at GitHub, wraps
tables so they scroll, and builds the "On this page" list.

Guides are fetched live, so edits pushed to `docs/` show up without touching the site.

## Adding a guide

Add an entry to the right section in `assets/js/manifest.js`:

```js
{ id: 'PluginExample', label: 'Example', desc: 'One line for search results' }
```

Component entries default to `docs/<id>.md` and `js/components/themestrap.plugin.<name>.js`.
Set `path` or `js` when a file doesn't follow that pattern.

## Hosting

Any static host works. To serve it from the repository with GitHub Pages, copy these
files into a `site/` (or `docs-site/`) folder and point Pages at it.

Themestrap's scripts load from jsDelivr at `@main`. jsDelivr caches branch URLs for up
to 12 hours; pin a tag or commit (for example `@1ba9f73`) for a fixed version.
