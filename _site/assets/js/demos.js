// Demo gallery (demos.html) and demo viewer (demo.html).
// Both read window.TS_SITE.demos, which lists every demo page in sidebar order and then the tours.
(((themestrap = {}, $) => {
    const SITE = window.TS_SITE;

    if (!SITE) {
        return;
    }

    const esc = str => String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const slug = str => String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const sectionIcon = {};
    SITE.sections.forEach(s => {
        sectionIcon[s.title] = s.icon;
    });
    sectionIcon.Tours = 'bi-signpost-split';

    // Demos grouped by section, keeping manifest order
    function groups() {
        const out = [];
        const byTitle = {};
        SITE.demos.forEach(entry => {
            if (!byTitle[entry.section]) {
                byTitle[entry.section] = { title: entry.section, icon: sectionIcon[entry.section] || 'bi-grid', items: [] };
                out.push(byTitle[entry.section]);
            }
            byTitle[entry.section].items.push(entry);
        });
        return out;
    }

    // Gallery

    function buildGallery() {
        const $gallery = $('[data-gallery]');
        if (!$gallery.length) {
            return;
        }

        const list = groups();

        const jump = list.map(g => (
            `<a href="#${esc(slug(g.title))}">${esc(g.title)} <span>${g.items.length}</span></a>`
        )).join('');
        $('[data-gallery-jump]').html(jump);

        const html = list.map(g => {
            const cards = g.items.map(entry => {
                const guide = entry.isTour ? '' :
                    `<a href="${esc(SITE.href(entry))}"><i class="bi bi-book" aria-hidden="true"></i>Guide</a>`;
                return `<li class="gallery-card" data-gallery-item data-search="${esc((entry.label + ' ' + entry.id + ' ' + (entry.desc || '') + ' ' + g.title).toLowerCase())}">
                    <a class="gallery-card__main" href="${esc(SITE.demoHref(entry))}">
                        <span class="gallery-card__icon"><i class="bi ${esc(g.icon)}" aria-hidden="true"></i></span>
                        <span class="gallery-card__name">${esc(entry.label)}</span>
                        <span class="gallery-card__desc">${esc(entry.desc || '')}</span>
                    </a>
                    <div class="gallery-card__foot">
                        <code class="gallery-card__file">${esc(entry.demoFile)}</code>
                        <span class="gallery-card__links">
                            ${guide}
                            <a href="${esc(SITE.demoUrl(entry))}" target="_blank" rel="noopener" aria-label="Open the ${esc(entry.label)} demo on its own in a new tab"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
                        </span>
                    </div>
                </li>`;
            }).join('');
            return `<section class="gallery-group" id="${esc(slug(g.title))}" data-gallery-group aria-labelledby="${esc(slug(g.title))}-title">
                <h2 class="gallery-group__title" id="${esc(slug(g.title))}-title">
                    <i class="bi ${esc(g.icon)}" aria-hidden="true"></i>${esc(g.title)}
                    <span class="gallery-group__count" data-gallery-count>${g.items.length}</span>
                </h2>
                <ul class="gallery-grid">${cards}</ul>
            </section>`;
        }).join('');

        $gallery.html(html);
        $('[data-demo-total]').text(SITE.demos.length);
        $('[data-gallery-start]').attr('href', SITE.demoHref(SITE.demos[0]));

        $('[data-gallery-filter]').on('input', function () {
            filterGallery(this.value);
        });
    }

    function filterGallery(query) {
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        let any = false;
        $('[data-gallery-group]').each(function () {
            const $group = $(this);
            let shown = 0;
            $group.find('[data-gallery-item]').each(function () {
                const text = this.getAttribute('data-search');
                const hit = words.every(w => text.includes(w));
                this.hidden = !hit;
                if (hit) {
                    shown++;
                }
            });
            $group.prop('hidden', shown === 0);
            $group.find('[data-gallery-count]').text(shown);
            any = any || shown > 0;
        });
        $('[data-gallery-empty]').prop('hidden', any);
        $('[data-gallery-jump]').prop('hidden', words.length > 0);
    }

    // Viewer

    function buildViewer() {
        const frame = document.querySelector('[data-demo-frame]');
        if (!frame) {
            return;
        }

        const docsPattern = new RegExp('^https://github\\.com/' + SITE.repo.replace('/', '\\/') + '/blob/[^/]+/(docs/[^#?]+)(#.*)?$', 'i');
        const $status = $('[data-demo-status]');
        let current = null;

        const requested = new URLSearchParams(location.search).get('d');
        if (!requested) {
            location.replace(SITE.demoHref(SITE.demos[0]));
            return;
        }

        function setStep($a, entry, dir) {
            if (entry) {
                $a.attr({ href: SITE.demoHref(entry), 'aria-label': dir + ' demo: ' + entry.label, title: entry.label })
                    .find('[data-step-name]').text(entry.label);
            } else {
                $a.attr({ href: 'demos.html', 'aria-label': 'All demos', title: 'All demos' })
                    .find('[data-step-name]').text('All demos');
            }
        }

        function render(entry) {
            current = entry;
            const prev = SITE.demos[entry.demoIndex - 1];
            const next = SITE.demos[entry.demoIndex + 1];

            $('[data-demo-title]').text(entry.label);
            $('[data-demo-section]').text(entry.section);
            $('[data-demo-count]').text((entry.demoIndex + 1) + ' / ' + SITE.demos.length);

            const $guide = $('[data-demo-guide]');
            if (entry.isTour) {
                $guide.prop('hidden', true);
            } else {
                $guide.prop('hidden', false).attr('href', SITE.href(entry));
            }
            $('[data-demo-source]').attr('href', SITE.blob('demos/' + entry.demoFile));
            $('[data-demo-open]').attr('href', SITE.demoUrl(entry));

            setStep($('[data-demo-prev]'), prev, 'Previous');
            setStep($('[data-demo-next]'), next, 'Next');

            document.title = entry.label + ' demo | Themestrap';
            frame.title = 'Live demo: ' + entry.label;
        }

        function load(entry) {
            render(entry);
            $status.removeClass('is-error').prop('hidden', false).find('[data-demo-status-text]').text('Loading the ' + entry.label + ' demo');
            const url = SITE.demoUrl(entry);

            // Replacing the frame's location keeps the demo out of the back button history;
            // the address bar entry pushed by go() is the only one each step adds.
            try {
                if (frame.contentWindow && frame.getAttribute('src')) {
                    frame.contentWindow.location.replace(url);
                    return;
                }
            } catch (e) {
                // a cross-origin page is in the frame; setting src below still works
            }
            frame.setAttribute('src', url);
        }

        function go(entry) {
            if (!entry || entry === current) {
                return;
            }
            history.pushState({ demo: entry.id }, '', SITE.demoHref(entry));
            load(entry);
        }

        // Links inside the demo that point at a guide or another demo open on the site itself
        function upgradeLinks(doc) {
            $(doc).find('a[href]').each(function () {
                const href = this.getAttribute('href');
                const asGuide = href.match(docsPattern);
                if (asGuide) {
                    const guide = SITE.fromFile(asGuide[1].split('/').pop());
                    if (guide) {
                        this.setAttribute('href', new URL(SITE.href(guide, (asGuide[2] || '').slice(1)), location.href).href);
                        this.setAttribute('target', '_top');
                        this.removeAttribute('rel');
                    }
                    return;
                }
                if (/(^|\/)plugin\.demo\.[a-z0-9-]+\.html$/i.test(href)) {
                    const demo = SITE.demoForFile(href);
                    if (demo) {
                        this.setAttribute('href', new URL(SITE.demoHref(demo), location.href).href);
                        this.setAttribute('target', '_top');
                    }
                }
            });
        }

        frame.addEventListener('load', () => {
            let doc = null;
            try {
                doc = frame.contentDocument;
            } catch (e) {
                doc = null;
            }

            // A file:// page or a missing demo can't be read; say so instead of leaving a blank frame
            if (!doc || !doc.body || (/404|not found/i.test(doc.title) && !doc.querySelector('script[src]'))) {
                $status.addClass('is-error').prop('hidden', false).find('[data-demo-status-text]').html(
                    'This demo couldn\'t load here. <a href="' + esc(SITE.blob('demos/' + current.demoFile)) + '" target="_blank" rel="noopener">View it on GitHub</a>.'
                );
                return;
            }

            // The demo navigated itself somewhere else in the folder; follow it
            const landed = SITE.demoForFile(doc.location.pathname);
            if (landed && landed !== current) {
                history.replaceState({ demo: landed.id }, '', SITE.demoHref(landed));
                render(landed);
            }

            upgradeLinks(doc);
            $status.prop('hidden', true);
        });

        $(document).on('click', '[data-demo-prev], [data-demo-next]', function (e) {
            const entry = SITE.resolveDemo(new URLSearchParams(this.search).get('d'));
            if (!entry || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                return;
            }
            e.preventDefault();
            go(entry);
        });

        window.addEventListener('popstate', () => {
            const entry = SITE.resolveDemo(new URLSearchParams(location.search).get('d'));
            if (entry && entry !== current) {
                load(entry);
            }
        });

        const entry = SITE.resolveDemo(requested);
        if (!entry) {
            $('[data-demo-title]').text('Demo not found');
            $('[data-demo-section]').text('');
            $('.demo-bar__actions').prop('hidden', true);
            $status.addClass('is-error').prop('hidden', false).find('[data-demo-status-text]').html(
                'There\'s no demo called <code>' + esc(requested) + '</code>. <a href="demos.html">Browse all demos</a>.'
            );
            document.title = 'Demo not found | Themestrap';
            return;
        }
        history.replaceState({ demo: entry.id }, '', SITE.demoHref(entry));
        load(entry);
    }

    buildGallery();
    buildViewer();
})).apply(this, [window.themestrap, jQuery]);
