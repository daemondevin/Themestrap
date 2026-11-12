# Themestrap site

The landing page and documentation site for [Themestrap](https://github.com/daemondevin/Themestrap).
Static files only: no build step, same as the library.

```
index.html              Landing page with live component lab
docs.html               Documentation viewer
demos.html              Demo gallery, grouped like the docs sidebar
demo.html               Demo viewer with previous and next
assets/css/site.css     Site styles and plugin theme overrides
assets/js/manifest.js   Sidebar, search and routing data (one entry per guide)
assets/js/site.js       Command menu, copy buttons, lab demos, star count
assets/js/docs.js       Docs router and render polish
assets/js/demos.js      Demo gallery and viewer
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

## How the demos work

The demos are the plain HTML files in the repository's `demos/` folder. `demo.html?d=PluginDrawer`
loads `demos/plugin.demo.drawer.html` into a frame under a toolbar with the guide, the source,
a new-tab link and previous and next. The frame keeps each demo in its own document, so its
styles and scroll effects behave exactly as they do opened on their own, and stepping between
demos doesn't add frame entries to the back button.

A demo links to its guide with a GitHub URL such as
`https://github.com/daemondevin/Themestrap/blob/main/docs/PluginDrawer.md`, which works when the
file is opened on its own; inside the viewer that link opens the guide on the site instead.
Guides that link to a demo file open it in the viewer the same way.

Every guide with a demo shows a "Live demo" link under its lead paragraph.

## Adding a guide

Add an entry to the right section in `assets/js/manifest.js`:

```js
{ id: 'PluginExample', label: 'Example', desc: 'One line for search results' }
```

Component entries default to `docs/<id>.md`, `js/components/themestrap.plugin.<name>.js`
and `demos/plugin.demo.<name>.html`. Set `path`, `js` or `demo` (the `<name>` part) when a
file doesn't follow that pattern, or `demo: false` for a component with no demo yet.
A demo that tours several components goes in the `tours` list instead.

## Hosting

`.github/workflows/static.yml` publishes to GitHub Pages on every push to `main`. It copies
these files to the root, then `demos/`, `css/`, `img/`, `js/` and `vendor/` beside them, because
the demos load their assets from `../css`, `../js` and so on.

Locally, serve the repository root rather than this folder and open `/_site/`. The pages notice
they're in `_site/` and load demos from `../demos/`:

```
npx serve .          # or: python -m http.server
```

Any other static host works the same way as Pages: put these files at the root with the five
folders beside them.

Themestrap's scripts load from jsDelivr at `@main`. jsDelivr caches branch URLs for up
to 12 hours; pin a tag or commit (for example `@1ba9f73`) for a fixed version.
