function escapeHtml(t) {
    if (t == null) return '';
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'"');
}
function formatDate(ts) {
    const now = Date.now(), d = new Date(ts), diff = now - ts;
    if (diff < 86400000)      return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if (diff < 7*86400000)    return d.toLocaleDateString([],{weekday:'short'});
    return d.toLocaleDateString([],{month:'short',day:'numeric'});
}

$('[data-plugin-navigation]').each(function () {
    const $el  = $(this);
    const opts = themestrap.fn.getOptions($el.attr('data-plugin-options')) || undefined;
    $el.themestrapPluginNavigation(opts);
});

const $sb = $('.mb-sidebar-nav');
const sbInst = () => $sb.data('__pluginNavigation');
$('[data-nav-logo]').on('click', function () { 
    sbInst()?.toggle();
});

const $item = $sb.find('#mb-nav-more');
$sb.data('__pluginNavigation').openGroup($item);

    // HoverCard
    if ($.isFunction($.fn['themestrapPluginHoverCard']) && $('[data-plugin-hovercard]').length) {
        $(() => {
            $('[data-plugin-hovercard]:not(.manual)').each(function () {
                const $this = $(this);
                const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
                $this.themestrapPluginHoverCard(opts);
            });
        });
    }

    /* --- PluginDrawer init --- */
    $('[data-plugin-drawer]').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginDrawer(opts);
    });

    /* --- PluginCalendar init --- */
    $('[data-plugin-calendar]').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginCalendar(opts);
    });

    /* --- PluginScrollBar init for named containers --- */
    $('[data-plugin-scrollbar]').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginScrollbar(opts);
    });

    /* --- PluginDialog init (confirm + settings) --- */
    $('[data-plugin-dialog]:not(.manual)').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginDialog(opts);
    });

    /* --- PluginDarkMode init --- */
    $('[data-plugin-darkmode]').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginDarkMode(opts);
    });

    /* --- PluginLoadingOverlay on main area --- */
    $('#mb-main').themestrapPluginLoadingOverlay({ type:'dots', message:'', color:'' });

    /* --- PluginCommandMenu init --- */
    $('[data-plugin-command-menu]:not(.manual)').each(function() {
        const opts = themestrap.fn.getOptions($(this).data('plugin-options')) || {};
        $(this).themestrapPluginCommandMenu(opts);
    });

    const cmdMenu = $('#mb-cmd').data('__pluginCommandMenu');
    if (cmdMenu) {
        const nav = $sb.data('__pluginNavigation');

        cmdMenu.registerAction('go-inbox',    () => { location.href = '?page=inbox';   });
        cmdMenu.registerAction('go-compose',  () => { location.href = '?page=compose'; });
        cmdMenu.registerAction('go-sent',     () => { if(typeof loadEmails==='function') { loadEmails('Sent'); $('#folder-title').text('Sent'); } });
        cmdMenu.registerAction('go-drafts',   () => { if(typeof loadEmails==='function') { loadEmails('Drafts'); $('#folder-title').text('Drafts'); } });
        cmdMenu.registerAction('go-trash',    () => { if(typeof loadEmails==='function') { loadEmails('Trash'); $('#folder-title').text('Trash'); } });
        cmdMenu.registerAction('refresh',     () => { if(typeof loadEmails==='function') loadEmails($('[data-nav-item].ts-nav-item--active [data-mb-folder]').data('mb-folder')||'INBOX'); });
        cmdMenu.registerAction('toggle-theme',() => { themestrap.PluginDarkMode.toggle(); });
        cmdMenu.registerAction('sign-out',    () => { doLogout(); });
        cmdMenu.registerAction('open-settings',() => {
            const dlg = $('#dlg-settings').data('__pluginDialog');
            if (dlg) { dlg.open(); cmdMenu.close(); }
        });

        /* Live-filter the inbox email list when typing in the command menu */
        $('#mb-cmd').on('command:filter', function(e, inst, query) {
            if (!query || query.length < 2) {
                $('.mb-email-item').show();
                return;
            }
            const q = query.toLowerCase();
            $('.mb-email-item').each(function() {
                const text = $(this).text().toLowerCase();
                $(this).toggle(text.includes(q));
            });
        });
    }

    /* --- Confirm dialog utility --- */
    window.mbConfirm = function(title, message, onYes) {
        const dlg = $('#dlg-confirm').data('__pluginDialog');
        if (!dlg) { if (confirm(message)) onYes(); return; }
        $('#dlg-confirm-title').text(title);
        $('#dlg-confirm-msg').text(message);
        $('#dlg-confirm-yes').off('click.confirm').on('click.confirm', function() {
            dlg.close();
            onYes();
        });
        dlg.open();
    };

    /* --- Toast utility wrapper --- */
    window.mbToast = function(title, body, type) {
        themestrap.PluginToast.show({ title:title||'', body:body||'', type:type||'info', position:'top-end', delay:3500 });
    };

    /* --- Mobile sidebar toggle --- */
    const $sidebar = $('#mb-sidebar');
    const $overlay = $('#mb-overlay');
    $('#mb-toggle').on('click', function() {
        const open = $sidebar.hasClass('open');
        $sidebar.toggleClass('open', !open);
        $overlay.toggleClass('visible', !open);
    });
    $overlay.on('click', function() {
        $sidebar.removeClass('open');
        $overlay.removeClass('visible');
    });

    /* --- Logout --- */
    function doLogout() {
        mbConfirm('Sign out', 'Are you sure you want to sign out?', function() {
            location.href='index.html';
        });
    }
    $('#btn-logout').on('click', doLogout);

    function initLiveDateTime(targetElementId = '') {
        const element = document.querySelector(targetElementId);
        if (!element) return;

        function updateDateTime() {
            const now = new Date();

            const datePart = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const timePart = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            element.textContent = `${datePart} - ${timePart}`;
        }

        updateDateTime();

        return setInterval(updateDateTime, 30000);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initLiveDateTime('p[data-drawer-description]');
    });

    /* --- Folder nav (inbox page) --- */
    $('[data-mb-folder]').on('click', function(e) {
        const $a = $(this);
        if ($a.attr('href') === '#' || $a.attr('href') === '?page=inbox') {
            e.preventDefault();
        }
        const folder = $a.data('mb-folder');
        const label  = $a.find('[data-nav-label]').text().trim() || folder;
        $('#folder-title').text(label);

        const nav = $nav.data('__pluginNavigation');
        if (nav) nav.setActive($a.closest('[data-nav-item]'));

        if (typeof loadEmails === 'function') loadEmails(folder);
    });

    /* --- Settings dialog --- */
    const SETTINGS_KEY = 'themestrap-mailbox-settings';
    function loadSettings() {
        try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'); } catch(e) { return {}; }
    }
    function applySettingsToForm(s) {
        if (s.messagesPerPage) $('#stg-per-page').val(s.messagesPerPage);
        if (s.density)         $('#stg-density').val(s.density);
        if (s.hoverPreview !== undefined) $('#stg-hover-preview').prop('checked', s.hoverPreview);
        if (s.threadView  !== undefined) $('#stg-thread-view').prop('checked',  s.threadView);
        if (s.theme)           $('#stg-theme').val(s.theme);
        if (s.showCalendar !== undefined) $('#stg-show-calendar').prop('checked', s.showCalendar);
        if (s.signatureName)   $('#stg-sig-name').val(s.signatureName);
        if (s.signatureHtml)   { $('#stg-signature').val(s.signatureHtml); updateSigPreview(s.signatureHtml); }
        if (s.avatarSrc)       { $('#stg-avatar-preview').attr('src', s.avatarSrc).show(); $('#stg-avatar-clear').show(); }
    }
    function updateSigPreview(html) {
        if (!html) { $('#stg-sig-preview').html('<span style="color:var(--ts-mb-muted);font-size:12px">No signature set</span>'); return; }
        $('#stg-sig-preview').html(html);
    }

    /* Open settings: load saved values into form */
    $('#dlg-settings').on('dialog:open', function() {
        applySettingsToForm(loadSettings());
        /* Re-open first tab */
        $('.mb-stab-btn').first().trigger('click');
    });

    /* Tab switching inside settings */
    $(document).on('click', '.mb-stab-btn', function() {
        const tab = $(this).data('stab');
        $('.mb-stab-btn').removeClass('active');
        $(this).addClass('active');
        $('.mb-stab-content').removeClass('active');
        $('#stab-' + tab).addClass('active');
    });

    /* Signature textarea live preview */
    $(document).on('input', '#stg-signature', function() { updateSigPreview($(this).val()); });

    /* Avatar upload */
    $(document).on('change', '#stg-avatar-upload', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#stg-avatar-preview').attr('src', e.target.result).show();
            $('#stg-avatar-clear').show();
        };
        reader.readAsDataURL(file);
    });

    $(document).on('click', '#stg-avatar-clear', function() {
        $('#stg-avatar-preview').attr('src','').hide();
        $('#stg-avatar-upload').val('');
        $(this).hide();
    });

    /* Save settings */
    $('#btn-save-settings').on('click', function() {
        const settings = {
            messagesPerPage: parseInt($('#stg-per-page').val()),
            density:         $('#stg-density').val(),
            hoverPreview:    $('#stg-hover-preview').prop('checked'),
            threadView:      $('#stg-thread-view').prop('checked'),
            theme:           $('#stg-theme').val(),
            accent:          $('.mb-accent-swatch.active').data('accent') || document.documentElement.getAttribute('data-accent') || 'blue',
            signatureName:   $('#stg-sig-name').val().trim(),
            signatureHtml:   $('#stg-signature').val(),
            avatarSrc:       $('#stg-avatar-preview').attr('src') || null,
        };

        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch(e) {}

        /* Apply theme immediately via data-theme + PluginDarkMode */
        const t = settings.theme;   /* light | dark | black | '' (system) */
        const h = document.documentElement;
        if (t) {
            localStorage.setItem('mb-theme', t);
            h.setAttribute('data-theme', t);
            h.setAttribute('data-bs-theme', t === 'black' ? 'dark' : t);
            h.classList.toggle('dark', t === 'dark' || t === 'black');
        } else {
            localStorage.removeItem('mb-theme');
            const sys = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
            h.setAttribute('data-theme', sys);
            h.setAttribute('data-bs-theme', sys);
            h.classList.toggle('dark', sys === 'dark');
        }

        /* Apply accent immediately */
        const a = settings.accent || 'orange';
        localStorage.setItem('mb-accent', a);
        h.setAttribute('data-accent', a);

        /* Compact density */
        h.classList.toggle('mb-density-compact', settings.density === 'compact');

        /* Close dialog and notify */
        const dlg = $('#dlg-settings').data('__pluginDialog');
        if (dlg) dlg.close();
        mbToast('Settings saved', 'Your preferences have been updated.', 'success');
    });

    const saved = loadSettings();
    applySettingsToForm(saved);
    if (saved.density === 'compact') $('html').addClass('mb-density-compact');
    if (saved.showCalendar === false) $('.mb-calendar-section').hide();

    $('#dlg-settings').on('dialog:open', function() {
        const curAccent = document.documentElement.getAttribute('data-accent') || 'blue';
        $('.mb-accent-swatch').removeClass('active');
        $(`.mb-accent-swatch[data-accent="${curAccent}"]`).addClass('active');
        const curTheme = document.documentElement.getAttribute('data-theme') || '';
        $('#stg-theme').val(curTheme);
    });

    $(document).on('click', '.mb-accent-swatch', function() {
        $('.mb-accent-swatch').removeClass('active');
        $(this).addClass('active');
    });

document.querySelectorAll('.mb-email-item').forEach((item) => {
    const anchor = item.querySelector('a[data-hovercard-trigger]');
    if (!anchor) return;

    const subjectEl = item.querySelector('.mb-email-subject');
    const subjectText = subjectEl ? subjectEl.textContent.trim() : 'No Subject';
    const senderEl = item.querySelector('.mb-email-sender');
    const senderText = senderEl ? senderEl.textContent.trim() : 'no-reply@email.com';
    const dateEl = item.querySelector('.mb-email-date');
    const dateText = dateEl ? dateEl.textContent.trim() : 'no-reply@email.com';

    const senderEmail = item.dataset.email || 'no-reply@email.com';
    const formattedDate = item.dataset.date || new Date().toLocaleString();

    const hovercard = document.createElement('div');
    hovercard.setAttribute('data-hovercard-content', '');
    hovercard.setAttribute('role', 'group');
    hovercard.setAttribute('aria-label', 'Hover card');

    hovercard.innerHTML = `
        <div class="mb-hc-from">${senderText}
            <span style="font-size:11px;font-weight:400;color:var(--ts-mb-muted);margin-left:5px">&lt;${senderEmail}&gt;</span>
        </div>
        <div class="mb-hc-subject">${subjectText}</div>
        <div class="mb-hc-date">
            <i class="far fa-clock" style="margin-right:4px"></i>${dateText}
        </div>
    `;

    anchor.insertBefore(hovercard, anchor.firstChild);
});

$('.mb-email-item').each(function() {
    const msgId = $(this).data('msg-id') || $(this).find('[data-msg-id]').data('msg-id');
    $(this).themestrapPluginContextMenu({
        items: [
            { label:'Open',   icon:'<i class="fas fa-envelope-open"></i>', action:function($el) { location.href='email.html'; } },
            { label:'Reply',  icon:'<i class="fas fa-reply"></i>',         action:function($el) { location.href='compose.html'; } },
            { type:'separator' },
            { label:'Star',   icon:'<i class="fas fa-star"></i>',          action:function($el) { $el.find('.mb-email-star').trigger('click'); } },
            { label:'Mark as unread', icon:'<i class="fas fa-envelope"></i>', action:function($el) { $el.toggleClass('unread'); } },
            { type:'separator' },
            { label:'Delete', icon:'<i class="fas fa-trash-alt"></i>', destructive:true,
             action:function($el) {
                 mbConfirm('Delete message','Delete this message? This cannot be undone.', function() {
                     const fd = new FormData();
                     fd.append('action','delete_message');
                     fd.append('message_id', msgId);
                     mbApiPost(fd).then(data => {
                         if (data.success) { $el.remove(); mbToast('Deleted','Message deleted.','info'); }
                         else mbToast('Error', data.error||'Delete failed.','danger');
                     });
                 });
             }
            },
        ]
    });
});

window.renderEmails = function(messages) {
    const $scroll =$('#email-scroll');
    if (!$scroll.length) return;

    if (!messages || messages.length === 0) {
        $scroll.html('<p class="p-4 text-center" style="color:var(--ts-mb-muted)">No emails found.</p>');
        return;
    }

    const emailListItems = messages.map(msg => {
        const emailAddress = msg.email 
            || `${msg.sender.toLowerCase().replace(/[^a-z0-9]/g, '')}@no-reply.com`;

        const formattedTimestamp = msg.timestamp 
            ? new Date(msg.timestamp).toLocaleString() 
            : new Date().toLocaleString();

        const cbId = `cb${msg.id}`;

        return `
            <li class="mb-email-item" data-msg-id="${msg.id}">
                <a data-hovercard-trigger href="email.html?id=${msg.id}">
                    <div data-hovercard-content role="group" aria-label="Hover card">
                        <div class="mb-hc-from">
                            <span style="font-size:11px;font-weight:400;color:var(--ts-mb-muted);margin-left:5px">&lt;${escapeHtml(emailAddress)}&gt;</span>
                        </div>
                        <div class="mb-hc-subject">${escapeHtml(msg.subject)}</div>
                        <div class="mb-hc-date">
                            <i class="far fa-clock" style="margin-right:4px"></i>${escapeHtml(formattedTimestamp)}
                        </div>
                    </div>
                    <div class="mb-check" onclick="event.preventDefault(); event.stopPropagation();">
                        <input type="checkbox" id="${cbId}" class="mb-email-select-cb" aria-label="Select email">
                        <label for="${cbId}"></label>
                    </div>
                    <span class="mb-email-star" title="Star" role="button" aria-label="Star message">
                        <i class="far fa-star"></i>
                    </span>
                    <span class="mb-email-label-dot" style="background:transparent"></span>
                    <span class="mb-email-sender">${escapeHtml(msg.sender)}</span>
                    <span class="mb-email-body">
                        <span class="mb-email-subject">${escapeHtml(msg.subject)}</span>
                        <span class="mb-email-dash">&mdash;</span>
                        <span class="mb-email-preview">${escapeHtml(msg.preview)}</span>
                    </span>
                    <span class="mb-email-meta">
                        <span class="mb-email-date">${escapeHtml(msg.date)}</span>
                    </span>
                </a>
            </li>
        `;
    }).join('');

    $scroll.html(`<ul class="mb-email-list">${emailListItems}</ul>`);

    initEmailInteractions($scroll);
};

function initEmailInteractions($container) {     
    $container.off('click', '.mb-email-star').on('click', '.mb-email-star', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const $star =$(this);
        const $icon =$star.find('i');
        const isStarred = $icon.hasClass('fas');

        if (isStarred) {
            $icon.removeClass('fas fa-star text-warning').addClass('far fa-star');$star.attr('title', 'Star');
        } else {
            $icon.removeClass('far fa-star').addClass('fas fa-star text-warning');$star.attr('title', 'Unstar');
        }

        const messageId = $star.closest('.mb-email-item').data('id');
        console.log(`[Email Action] Toggled star on message #${messageId}: ${!isStarred}`);
    });

    $container.off('change', '.mb-email-select-cb').on('change', '.mb-email-select-cb', function() {
        const $item = $(this).closest('.mb-email-item');$item.toggleClass('selected', this.checked);
        updateSelectAllState();
    });

    $container.off('click', '.mb-check').on('click', '.mb-check', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const $cb =$(this).find('input[type="checkbox"]');
        $cb.prop('checked', !$cb.prop('checked')).trigger('change');
    });
}

$(document).on('change', '#select-all-cb', function() {
    const isChecked = $(this).is(':checked');
    const $list =$('#email-scroll');

    $list.find('.mb-email-select-cb').prop('checked', isChecked);$list.find('.mb-email-item').toggleClass('selected', isChecked);
});

function updateSelectAllState() {
    const $checkboxes =$('#email-scroll .mb-email-select-cb');
    const total = $checkboxes.length;
    const checked = $checkboxes.filter(':checked').length;
    
    const $selectAll =$('#select-all-cb');
    if ($selectAll.length) {
        $selectAll.prop('checked', total > 0 && total === checked);$selectAll.prop('indeterminate', checked > 0 && checked < total);
    }
}