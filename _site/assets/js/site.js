// Themestrap site behavior shared by every page.
// Loaded after the plugin files and before themestrap.init.js, so any markup it
// builds here (command menu items, lab demos) exists when init.js scans the page.
(((themestrap = {}, $) => {
    const SITE = window.TS_SITE;

    // themestrap.js scrolls to the URL hash on load with 'easeOutQuad', which normally comes
    // from jquery.easing. This site doesn't load that plugin, so provide the one curve it needs.
    if ($.easing && typeof $.easing.easeOutQuad !== 'function') {
        $.easing.easeOutQuad = p => 1 - (1 - p) * (1 - p);
    }

    // Escape text for safe insertion into HTML strings
    function esc(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Remove the common leading indentation from a block of authored markup
    function dedent(text) {
        const lines = String(text).replace(/\r\n/g, '\n').replace(/^\n+|\s+$/g, '').split('\n');
        const indents = lines
            .filter(line => line.trim().length)
            .map(line => line.match(/^\s*/)[0].length);
        const min = indents.length ? Math.min(...indents) : 0;
        return lines.map(line => line.slice(min)).join('\n');
    }

    function toast(title, body, type) {
        if (themestrap.PluginToast && typeof themestrap.PluginToast.show === 'function') {
            themestrap.PluginToast.show({
                title: title,
                body: body,
                type: type || 'success',
                position: 'bottom-end',
                delay: 2600
            });
        }
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => true, () => false);
        }
        const $tmp = $('<textarea readonly>').val(text).css({ position: 'fixed', top: '-1000px' }).appendTo('body');
        $tmp[0].select();
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (e) {
            ok = false;
        }
        $tmp.remove();
        return Promise.resolve(ok);
    }

    // Command menu: one group per manifest section, plus site actions
    function buildCommandMenu() {
        const $list = $('#cmdk [data-command-list]');
        if (!$list.length || !SITE) {
            return;
        }

        const groups = SITE.sections.map(section => {
            const items = section.items.map(item => (
                `<button type="button" id="cmd-${esc(item.id)}" data-command-item
                    data-command-href="${esc(SITE.href(item))}"
                    data-command-keywords="${esc(item.id + ' ' + section.title)}">
                    <i class="bi ${esc(section.icon)}" data-command-icon></i>
                    <span class="cmd-text">
                        <span data-command-label>${esc(item.label)}</span>
                        <span data-command-description>${esc(item.desc || '')}</span>
                    </span>
                </button>`
            )).join('');
            return `<div data-command-group data-command-heading="${esc(section.title)}">${items}</div>`;
        }).join('');

        const actions = `
            <div data-command-group data-command-heading="Actions">
                <button type="button" id="cmd-theme" data-command-item data-command-action="toggle-theme"
                    data-command-keywords="dark light mode theme appearance">
                    <i class="bi bi-circle-half" data-command-icon></i>
                    <span data-command-label>Toggle dark mode</span>
                </button>
                <button type="button" id="cmd-copy-clone" data-command-item data-command-action="copy-clone"
                    data-command-keywords="install download git clone">
                    <i class="bi bi-clipboard" data-command-icon></i>
                    <span data-command-label>Copy git clone command</span>
                </button>
                <button type="button" id="cmd-github" data-command-item
                    data-command-href="${esc(SITE.github)}" data-command-target="_blank"
                    data-command-keywords="source repository code">
                    <i class="bi bi-github" data-command-icon></i>
                    <span data-command-label>Open the GitHub repository</span>
                </button>
            </div>`;

        $list.append(groups + actions);
    }

    function bindCommandMenuActions() {
        $(document).on('command:select', '#cmdk', function (e, instance, $item, payload) {
            if (payload.action === 'toggle-theme') {
                e.preventDefault();
                if (themestrap.PluginDarkMode) {
                    themestrap.PluginDarkMode.toggle();
                }
                instance.close();
            } else if (payload.action === 'copy-clone') {
                e.preventDefault();
                instance.close();
                copyText('git clone ' + SITE.github + '.git').then(ok => {
                    toast(ok ? 'Copied' : 'Copy failed', ok ? 'The git clone command is on your clipboard.' : 'Select the command and copy it by hand.', ok ? 'success' : 'danger');
                });
            }
        });
    }

    // Copy buttons: data-copy="literal text" or data-copy-target="#selector"
    function bindCopyButtons() {
        $(document).on('click', '[data-copy], [data-copy-target]', function () {
            const $btn = $(this);
            const text = $btn.is('[data-copy]') ? $btn.attr('data-copy') : $($btn.attr('data-copy-target')).text().trim();
            copyText(text).then(ok => {
                const $icon = $btn.find('.bi');
                $icon.attr('class', ok ? 'bi bi-check2' : 'bi bi-x');
                setTimeout(() => $icon.attr('class', 'bi bi-clipboard'), 1400);
                toast(ok ? 'Copied' : 'Copy failed', ok ? 'The command is on your clipboard.' : 'Select the text and copy it by hand.', ok ? 'success' : 'danger');
            });
        });
    }

    // Star count in the nav. Cached for an hour so the GitHub API rate limit is never a problem.
    function loadStars() {
        const $out = $('.gh-link__stars');
        if (!$out.length || !SITE) {
            return;
        }
        const key = 'ts-site-stars';
        let cached = null;
        try {
            cached = JSON.parse(localStorage.getItem(key) || 'null');
        } catch (e) {
            cached = null;
        }
        const show = n => $out.text(n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n));
        if (cached && Date.now() - cached.t < 3600000) {
            show(cached.n);
            return;
        }
        $.getJSON('https://api.github.com/repos/' + SITE.repo).done(data => {
            if (typeof data.stargazers_count === 'number') {
                show(data.stargazers_count);
                try {
                    localStorage.setItem(key, JSON.stringify({ n: data.stargazers_count, t: Date.now() }));
                } catch (e) {
                    // storage unavailable; the count still shows for this visit
                }
            }
        });
    }

    // A template can't contain a literal closing script tag, so demos write <\/script> and get it back here
    function unescapeScript(text) {
        return String(text).replace(/<\\\/script>/g, '</' + 'script>');
    }

    // Landing lab: every demo is one <script type="text/html"> template.
    // The same text fills the code tab and renders the live preview, so the code shown is the code running.
    function buildLab() {
        const $lab = $('#lab');
        if (!$lab.length) {
            return;
        }

        $lab.find('pre[data-demo]').each(function () {
            const $pre = $(this);
            const source = dedent(unescapeScript($('#' + $pre.attr('data-demo')).html() || ''));
            $pre.find('code').text(source);
        });

        $lab.find('[data-demo-live]').each(function () {
            const $panel = $(this);
            const source = unescapeScript($('#' + $panel.attr('data-demo-live')).html() || '');
            // jQuery's .html() runs any <script> in the source, so the demo's own handler is bound here
            $panel.html(source);
        });

        // Code Window tabs drive which live panel is visible
        $lab.on('codewindow:tab', '[data-plugin-code-window]', function (e, instance, index) {
            const $panels = $lab.find('[data-demo-live]');
            $panels.attr('hidden', true).eq(index).removeAttr('hidden');
            $lab.find('[data-lab-caption]').text($panels.eq(index).attr('data-caption') || '');
            $lab.find('[data-lab-file]').text($lab.find('pre[data-demo]').eq(index).attr('data-code-window-tab') || '');
        });
    }

    // Component directory on the landing page
    function buildDirectory() {
        const $dir = $('#directory');
        if (!$dir.length || !SITE) {
            return;
        }
        const html = SITE.sections.filter(s => s.items.some(i => i.isComponent)).map(section => {
            const links = section.items.filter(i => i.isComponent).map(item => (
                `<li><a href="${esc(SITE.href(item))}">${esc(item.label)}</a></li>`
            )).join('');
            return `<div class="directory__group">
                <h3 class="directory__title"><i class="bi ${esc(section.icon)}" aria-hidden="true"></i>${esc(section.title)}</h3>
                <ul class="directory__list">${links}</ul>
            </div>`;
        }).join('');
        $dir.html(html);
        $('[data-component-count]').text(SITE.componentCount);
    }

    // Platform-aware shortcut hint
    function setShortcutHints() {
        const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        $('[data-mod-key]').text(mac ? '⌘' : 'Ctrl');
    }

    buildCommandMenu();
    buildLab();
    buildDirectory();
    bindCommandMenuActions();
    bindCopyButtons();
    setShortcutHints();
    $(loadStars);

    $.extend(themestrap, {
        site: { esc, dedent, toast, copyText }
    });
})).apply(this, [window.themestrap, jQuery]);
