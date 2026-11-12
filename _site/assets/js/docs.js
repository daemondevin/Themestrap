// Themestrap docs router.
// The article is a PluginMarkdown element whose data-plugin-markdown-src points at a
// file in the repository's docs folder. This script picks that file from ?doc= before
// themestrap.init.js runs, then polishes each render (headings, callouts, links, tables,
// contents list) and swaps pages in place with the plugin's own setSource().
(((themestrap = {}, $) => {
    const SITE = window.TS_SITE;
    const $doc = $('#doc');

    if (!SITE || !$doc.length) {
        return;
    }

    const esc = str => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const CALLOUTS = {
        note: { icon: 'bi-info-circle', title: 'Note' },
        tip: { icon: 'bi-lightbulb', title: 'Tip' },
        important: { icon: 'bi-exclamation-square', title: 'Important' },
        warning: { icon: 'bi-exclamation-triangle', title: 'Warning' },
        caution: { icon: 'bi-octagon', title: 'Caution' }
    };

    let current = SITE.resolve(new URLSearchParams(location.search).get('doc'));
    let spyObserver = null;
    let pendingHashScroll = location.hash.slice(1);

    // Sidebar (desktop aside and mobile drawer share the same markup)
    function buildSidebar() {
        const html = SITE.sections.map(section => {
            const links = section.items.map(item => (
                `<li><a class="side-link" href="${esc(SITE.href(item))}" data-doc-link="${esc(item.id)}">${esc(item.label)}</a></li>`
            )).join('');
            return `<div class="side-group" data-side-group>
                <h4 class="side-group__title">${esc(section.title)}</h4>
                <ul>${links}</ul>
            </div>`;
        }).join('') + '<p class="side-empty" data-side-empty hidden>No pages match that filter.</p>';
        $('[data-side-nav]').html(html);
    }

    function filterSidebar(query) {
        const q = query.trim().toLowerCase();
        $('[data-side-nav]').each(function () {
            const $nav = $(this);
            let any = false;
            $nav.find('[data-side-group]').each(function () {
                const $group = $(this);
                const title = $group.find('.side-group__title').text().toLowerCase();
                let shown = 0;
                $group.find('li').each(function () {
                    const $li = $(this);
                    const hit = !q || $li.text().toLowerCase().includes(q) || title.includes(q);
                    $li.prop('hidden', !hit);
                    if (hit) {
                        shown++;
                    }
                });
                $group.prop('hidden', shown === 0);
                any = any || shown > 0;
            });
            $nav.find('[data-side-empty]').prop('hidden', any);
        });
    }

    function markActive() {
        $('[data-doc-link]').removeAttr('aria-current');
        const $active = $(`[data-doc-link="${current.id}"]`).attr('aria-current', 'page');

        // Keep the active link visible in the desktop sidebar without moving the page
        const $scroll = $('.docs-sidebar__scroll');
        const link = $active.filter((i, el) => $scroll[0] && $scroll[0].contains(el))[0];
        if (link && $scroll[0]) {
            const box = $scroll[0].getBoundingClientRect();
            const r = link.getBoundingClientRect();
            if (r.top < box.top + 60 || r.bottom > box.bottom - 60) {
                $scroll[0].scrollTop += r.top - box.top - box.height / 3;
            }
        }
    }

    // Page chrome that depends only on the manifest entry
    function updateChrome() {
        const prev = SITE.flat[current.index - 1];
        const next = SITE.flat[current.index + 1];

        const $crumbs = $('[data-doc-crumbs]');
        $crumbs.html(`<li><a href="docs.html">Docs</a></li><li>${esc(current.section)}</li><li aria-current="page">${esc(current.label)}</li>`);

        [[$('[data-doc-prev]'), prev], [$('[data-doc-next]'), next]].forEach(([$a, entry]) => {
            if (entry) {
                $a.attr({ href: SITE.href(entry), 'data-doc-link-pager': entry.id }).prop('hidden', false);
                $a.find('.doc-pager__title').text(entry.label);
            } else {
                $a.prop('hidden', true);
            }
        });

        $('[data-doc-edit]').attr('href', current.type === 'code' ? SITE.blob(current.path) : SITE.edit(current.path));
        document.title = current.label + ' | Themestrap';
        markActive();
    }

    // Loading
    function sourceUrl(entry) {
        return SITE.raw(entry.path);
    }

    // Non-Markdown files (the plugin skeleton) are wrapped in a fenced block so PluginMarkdown can render them
    function codeAsMarkdown(entry, code) {
        return `# ${entry.label}\n\n${entry.desc}. Copy it into \`js/components/\`, rename the class, and fill in \`build()\`.\n\n~~~~${entry.lang || ''}\n${code.replace(/\s+$/, '')}\n~~~~\n`;
    }

    function load(entry) {
        const instance = $doc.data('__pluginMarkdown');

        if (entry.type === 'code') {
            // No src here, or the plugin would fetch it and render the code as Markdown
            $doc.removeAttr('data-plugin-markdown-src').addClass('ts-markdown-loading').empty();
            $.ajax({ url: sourceUrl(entry), dataType: 'text' })
                .done(code => {
                    $doc.removeClass('ts-markdown-loading');
                    const md = codeAsMarkdown(entry, code);
                    if (instance) {
                        instance.render(md);
                    } else {
                        $doc.text(md).themestrapPluginMarkdown();
                    }
                })
                .fail((xhr, status, err) => showError(entry, err || status));
            return;
        }

        $doc.attr('data-plugin-markdown-src', sourceUrl(entry));
        if (instance) {
            instance.setSource(sourceUrl(entry));
        }
        // Without an instance yet, themestrap.init.js starts the plugin and it reads the attribute above
    }

    function showError(entry, reason) {
        $doc.removeClass('ts-markdown-loading').html(
            `<div class="doc-error" role="alert">
                <h2>This guide didn't load</h2>
                <p>GitHub didn't return <code>${esc(entry.path)}</code>${reason ? ' (' + esc(reason) + ')' : ''}. Check your connection and reload, or read it on GitHub.</p>
                <a class="btn-site btn-site--ghost btn-site--sm" href="${esc(SITE.blob(entry.path))}" target="_blank" rel="noopener"><i class="bi bi-github" aria-hidden="true"></i>Open on GitHub</a>
            </div>`
        );
        $('[data-doc-toc]').empty();
    }

    // Render polishing
    function slugify(text) {
        return text.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'section';
    }

    function polishHeadings() {
        const used = {};
        $doc.find('h1, h2, h3, h4, h5, h6').each(function () {
            const $h = $(this);

            // Guides wrap some headings in a link to themselves, e.g. [How It **Works**](#how-it-works)
            $h.find('a[href^="#"]').each(function () {
                $(this).replaceWith($(this).contents());
            });

            let id = slugify($h.text());
            if (used[id]) {
                id += '-' + (++used[id]);
            } else {
                used[id] = 1;
            }
            $h.attr('id', id);

            if (/^H[234]$/.test(this.tagName)) {
                $h.prepend(`<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a>`);
            }
        });
    }

    function polishIntro() {
        let $h1 = $doc.children('h1').first();
        if (!$h1.length) {
            $h1 = $('<h1>').text(current.label).prependTo($doc);
        }
        document.title = $h1.text().replace(/^#/, '').trim() + ' | Themestrap';

        // First real paragraph after the title becomes the lead (badge rows don't count)
        let $anchor = $h1;
        const $first = $h1.nextAll().first();
        if ($first.is('p') && $first.text().trim().length > 40 && !$first.find('img').length) {
            $first.addClass('lead');
            $anchor = $first;
        }

        const $meta = $($('#doc-meta-template').html());
        const $source = $meta.find('[data-meta="source"]');
        if (current.source) {
            $source.attr('href', SITE.blob(current.source));
        } else {
            $source.remove();
        }
        $meta.find('[data-meta="blob"]').attr('href', SITE.blob(current.path));
        const $raw = $meta.find('[data-meta="raw"]');
        if (current.type === 'code') {
            $raw.remove();
        } else {
            $raw.attr('href', SITE.raw(current.path));
        }
        $anchor.after($meta);
    }

    // > [!NOTE] blockquotes become styled callouts, the way GitHub shows them
    function polishCallouts() {
        $doc.find('blockquote').each(function () {
            const $bq = $(this);
            const $p = $bq.children('p').first();
            if (!$p.length) {
                return;
            }
            const match = $p.html().match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?\s*/i);
            if (!match) {
                return;
            }
            const kind = match[1].toLowerCase();
            const meta = CALLOUTS[kind];
            $p.html($p.html().slice(match[0].length));
            if (!$p.text().trim() && !$p.children().length) {
                $p.remove();
            }
            const $callout = $(`<div class="callout callout--${kind}" role="note"></div>`)
                .append(`<p class="callout__title"><i class="bi ${meta.icon}" aria-hidden="true"></i>${meta.title}</p>`)
                .append($bq.contents());
            $bq.replaceWith($callout);
        });
    }

    // Repository-relative links point at other guides or at files on GitHub
    function resolveRepoPath(href) {
        const dir = current.path.includes('/') ? current.path.slice(0, current.path.lastIndexOf('/') + 1) : '';
        const url = new URL(href, 'https://repo.invalid/' + dir);
        return {
            path: decodeURIComponent(url.pathname.replace(/^\//, '')),
            hash: url.hash.slice(1)
        };
    }

    function guideForPath(path) {
        const file = path.split('/').pop();
        if (!file) {
            return null;
        }
        let entry = SITE.fromFile(file);
        // Older guides link to their HTML twins, e.g. tsHighlight.html
        if (!entry) {
            const legacy = file.match(/^ts([A-Z]\w+)\.html$/);
            if (legacy) {
                entry = SITE.fromFile('Plugin' + legacy[1] + '.md');
            }
        }
        return entry;
    }

    function polishLinks() {
        const ghBlob = new RegExp('^https://github\\.com/' + SITE.repo.replace('/', '\\/') + '/(?:blob|tree)/[^/]+/(.+)$', 'i');

        $doc.find('a[href]').not('.heading-anchor').each(function () {
            const $a = $(this);
            const href = $a.attr('href');

            if (!href || href.charAt(0) === '#' || /^(mailto|tel):/i.test(href)) {
                return;
            }

            if (/^https?:\/\//i.test(href)) {
                const inRepo = href.match(ghBlob);
                const entry = inRepo ? guideForPath(inRepo[1].split('#')[0]) : null;
                if (entry) {
                    $a.attr('href', SITE.href(entry, href.split('#')[1]));
                } else {
                    $a.attr({ target: '_blank', rel: 'noopener' });
                }
                return;
            }

            const { path, hash } = resolveRepoPath(href);
            const entry = guideForPath(path);
            if (entry) {
                $a.attr('href', SITE.href(entry, hash));
            } else {
                const isDir = !/\.[a-z0-9]+$/i.test(path);
                const base = 'https://github.com/' + SITE.repo + (isDir ? '/tree/' : '/blob/') + SITE.branch + '/';
                $a.attr({ href: base + path.replace(/\/$/, '') + (hash ? '#' + hash : ''), target: '_blank', rel: 'noopener' });
            }
        });

        $doc.find('img[src]').each(function () {
            const src = $(this).attr('src');
            if (src && !/^(https?:|data:)/i.test(src)) {
                $(this).attr('src', SITE.raw(resolveRepoPath(src).path));
            }
            $(this).attr('loading', 'lazy');
        });
    }

    function polishTables() {
        $doc.find('table').each(function () {
            if (!$(this).parent().hasClass('table-scroll')) {
                $(this).wrap('<div class="table-scroll" tabindex="0"></div>');
            }
        });
    }

    // On this page, with the section in view highlighted
    function buildToc() {
        const $toc = $('[data-doc-toc]').empty();
        const $heads = $doc.find('h2, h3');

        $heads.each(function () {
            const $h = $(this);
            const text = $h.clone().children('.heading-anchor').remove().end().text().trim();
            $toc.append(`<li><a href="#${esc(this.id)}" class="${this.tagName === 'H3' ? 'is-sub' : ''}">${esc(text)}</a></li>`);
        });

        $('.docs-toc').prop('hidden', $heads.length < 2);

        if (spyObserver) {
            spyObserver.disconnect();
        }
        if (!('IntersectionObserver' in window) || !$heads.length) {
            return;
        }

        const visible = new Set();
        spyObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });
            const first = $heads.toArray().find(h => visible.has(h.id));
            if (first) {
                $toc.find('a').removeClass('is-active').filter(`[href="#${first.id}"]`).addClass('is-active');
            }
        }, { rootMargin: '-64px 0px -65% 0px' });

        $heads.each(function () {
            spyObserver.observe(this);
        });
    }

    let settleScroll = null;

    function scrollAfterRender() {
        const target = pendingHashScroll && document.getElementById(pendingHashScroll);
        settleScroll = null;
        if (target) {
            target.scrollIntoView();
            settleScroll = { id: target.id, y: window.scrollY };
        }
        pendingHashScroll = '';
    }

    $doc.on('rendered.ts.markdown', function (e, html) {
        if (!html) {
            return;
        }
        polishHeadings();
        polishIntro();
        polishCallouts();
        polishLinks();
        polishTables();
        buildToc();
        scrollAfterRender();
    });

    // Mermaid diagrams are drawn after render and push the anchor down; land on it
    // again unless the reader has scrolled since
    $doc.on('diagrams.ts.markdown', function () {
        if (settleScroll && Math.abs(window.scrollY - settleScroll.y) < 2) {
            const target = document.getElementById(settleScroll.id);
            if (target) {
                target.scrollIntoView();
            }
        }
        settleScroll = null;
    });

    $doc.on('error.ts.markdown', function (e, url, err) {
        showError(current, err);
    });

    // In-place navigation between guides
    function go(entry, hash, push) {
        const sameDoc = entry.id === current.id;
        if (push) {
            history.pushState({ doc: entry.id }, '', SITE.href(entry, hash));
        }
        if (sameDoc) {
            if (hash && document.getElementById(hash)) {
                document.getElementById(hash).scrollIntoView();
            }
            return;
        }
        current = entry;
        pendingHashScroll = hash || '';
        updateChrome();
        if (!hash) {
            window.scrollTo(0, 0);
        }
        load(entry);
        $doc[0].focus({ preventScroll: true });
    }

    function entryFromHref(href) {
        try {
            const url = new URL(href, location.href);
            if (!/docs\.html$/.test(url.pathname) || url.origin !== location.origin) {
                return null;
            }
            return { entry: SITE.resolve(url.searchParams.get('doc')), hash: url.hash.slice(1) };
        } catch (err) {
            return null;
        }
    }

    $(document).on('click', 'a[href*="docs.html"]', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || this.target === '_blank') {
            return;
        }
        const hit = entryFromHref(this.getAttribute('href'));
        if (!hit) {
            return;
        }
        e.preventDefault();

        const drawer = $('#docs-nav').data('__pluginDrawer');
        if (drawer && drawer.isOpen) {
            drawer.close();
        }
        go(hit.entry, hit.hash, true);
    });

    // Command menu items for guides route in place instead of reloading
    $(document).on('command:select', '#cmdk', function (e, instance, $item, payload) {
        if (!payload.href || payload.action) {
            return;
        }
        const hit = entryFromHref(payload.href);
        if (hit) {
            e.preventDefault();
            instance.close();
            go(hit.entry, hit.hash, true);
        }
    });

    window.addEventListener('popstate', function () {
        const entry = SITE.resolve(new URLSearchParams(location.search).get('doc'));
        go(entry, location.hash.slice(1), false);
    });

    $(document).on('input', '[data-side-filter]', function () {
        filterSidebar(this.value);
    });

    // Boot: everything here runs before themestrap.init.js scans the page
    buildSidebar();
    updateChrome();
    history.replaceState({ doc: current.id }, '', SITE.href(current, location.hash.slice(1)));

    if (current.type === 'code') {
        // Keep auto-init away; load() starts the plugin once the file arrives
        $doc.addClass('manual');
    }
    load(current);
})).apply(this, [window.themestrap, jQuery]);
