// Themestrap site manifest
// Loaded in <head> on every page with no dependencies, so the docs page can
// resolve ?doc= and set data-plugin-markdown-src before themestrap.init.js runs.
(function (window) {
    'use strict';

    const repo   = 'daemondevin/Themestrap';
    const branch = 'main';

    // Each entry: id (route key), label, path (repo-relative), desc (search text).
    // Component entries derive their plugin source file from the id unless `js` is set.
    const sections = [
        {
            title: 'Getting started',
            icon: 'bi-rocket-takeoff',
            items: [
                { id: 'introduction', label: 'Introduction', path: 'README.md', desc: 'What Themestrap is and how to include it' },
                { id: 'why-themestrap', label: 'Why Themestrap', path: 'REASON.md', desc: 'The case for components without a build step' },
                { id: 'ThemestrapArchitecture', label: 'Architecture', path: 'docs/ThemestrapArchitecture.md', desc: 'Namespace, lifecycle and init strategies' },
                { id: 'ThemestrapModuleLoader', label: 'Module loader', path: 'docs/ThemestrapModuleLoader.md', desc: 'Fetch plugins and vendor dependencies on demand' },
                { id: 'ThemestrapPluginSkeleton', label: 'Plugin skeleton', path: 'docs/ThemestrapPluginSkeleton.js', type: 'code', lang: 'javascript', desc: 'A copy-paste starting point for a new plugin' },
                { id: 'reference', label: 'Quick reference', path: 'REFERENCE.md', desc: 'Every component at a glance' },
                { id: 'changelog', label: 'Changelog', path: 'CHANGELOG.md', desc: 'What changed between releases' }
            ]
        },
        {
            title: 'Content & media',
            icon: 'bi-layout-text-window',
            items: [
                { id: 'PluginAccordion', label: 'Accordion', desc: 'Stacked panels with one open at a time' },
                { id: 'PluginAnimatedContent', label: 'Animated Content', desc: 'Letter and word reveal animations' },
                { id: 'PluginBeforeAfter', label: 'Before / After', desc: 'Drag a divider to compare two images' },
                { id: 'PluginCalendar', label: 'Calendar', desc: 'Single, multiple and range date picker' },
                { id: 'PluginCarousel', label: 'Carousel', desc: 'Looping slides with drag, dots and autoplay' },
                { id: 'PluginCollapsible', label: 'Collapsible', desc: 'A single disclosure panel' },
                { id: 'PluginLightbox', label: 'Lightbox', desc: 'Open images and media in an overlay' },
                { id: 'PluginMasonry', label: 'Masonry', desc: 'Packed grid layout for uneven items' },
                { id: 'PluginReadMore', label: 'Read More', desc: 'Truncate long content behind a toggle' },
                { id: 'PluginSort', label: 'Sort', desc: 'Filter and sort a grid of items' },
                { id: 'PluginSortable', label: 'Sortable', desc: 'Drag and drop to reorder lists' },
                { id: 'PluginTree', label: 'Tree', desc: 'Nested, expandable tree view' }
            ]
        },
        {
            title: 'Navigation',
            icon: 'bi-signpost-split',
            items: [
                { id: 'PluginMenubar', label: 'Menubar', desc: 'Desktop-style application menus' },
                { id: 'PluginNavbar', label: 'Navbar', desc: 'Responsive site header navigation' },
                { id: 'PluginNavMenu', label: 'Nav Menu', desc: 'Dropdown navigation menu' },
                { id: 'PluginNavigation', label: 'Navigation', desc: 'Sidebar navigation for apps' },
                { id: 'PluginPanelNav', label: 'Panel Nav', desc: 'Sliding multi-level panel navigation' },
                { id: 'PluginSideNav', label: 'Side Nav', desc: 'Collapsible side navigation' },
                { id: 'PluginVerticalNav', label: 'Vertical Nav', desc: 'Stacked vertical navigation' },
                { id: 'PluginToolbar', label: 'Toolbar', desc: 'Grouped buttons with keyboard support' },
                { id: 'PluginScrollToTop', label: 'Scroll To Top', desc: 'Return-to-top button' }
            ]
        },
        {
            title: 'Overlays & feedback',
            icon: 'bi-window-stack',
            items: [
                { id: 'PluginAlert', label: 'Alert', desc: 'Dismissible callouts and toast factory' },
                { id: 'PluginCommandMenu', label: 'Command Menu', desc: 'Keyboard command palette with search' },
                { id: 'PluginContextMenu', label: 'Context Menu', desc: 'Right-click menus' },
                { id: 'PluginDialog', label: 'Dialog', desc: 'Accessible modal dialogs' },
                { id: 'PluginDrawer', label: 'Drawer', desc: 'Panels that slide in from any edge' },
                { id: 'PluginHoverCard', label: 'Hover Card', desc: 'Rich preview on hover' },
                { id: 'PluginLoadingOverlay', label: 'Loading Overlay', desc: 'Block an area while work runs' },
                { id: 'PluginPopover', label: 'Popover', desc: 'Interactive floating content' },
                { id: 'PluginSplashScreen', label: 'Splash Screen', desc: 'Branded page-load screen' },
                { id: 'PluginToast', label: 'Toast', desc: 'Notifications in nine positions' },
                { id: 'PluginTooltip', label: 'Tooltip', desc: 'Short labels on hover and focus' }
            ]
        },
        {
            title: 'Forms & input',
            icon: 'bi-ui-checks',
            items: [
                { id: 'PluginColorPicker', label: 'Color Picker', desc: 'Pick and enter colors' },
                { id: 'PluginImageUpload', label: 'Image Upload', desc: 'Pick and upload one picture' },
                { id: 'PluginMarkdownEditor', label: 'Markdown Editor', desc: 'Write Markdown with a live preview' },
                { id: 'PluginNumberInput', label: 'Number Input', desc: 'Stepper for number fields' },
                { id: 'PluginOtp', label: 'OTP', desc: 'One-time code and PIN input' },
                { id: 'PluginPricingToggle', label: 'Pricing Toggle', desc: 'Switch between billing periods' },
                { id: 'PluginRating', label: 'Rating', desc: 'Star rating with partial fills' },
                { id: 'PluginRichEditor', label: 'Rich Editor', desc: 'Formatted text editing' },
                { id: 'PluginSelect', label: 'Select', desc: 'Styled, accessible select menu' },
                { id: 'PluginTagsInput', label: 'Tags Input', desc: 'Chips for emails and keywords' },
                { id: 'PluginTimePicker', label: 'Time Picker', desc: 'Pick a time of day' },
                { id: 'PluginWizard', label: 'Wizard', desc: 'Multi-step forms' }
            ]
        },
        {
            title: 'Accounts & privacy',
            icon: 'bi-shield-lock',
            items: [
                { id: 'PluginAccount', label: 'Account', desc: 'Header sign-in and sign-up panels' },
                { id: 'PluginAuth', label: 'Auth', desc: 'Sign-in and registration forms' },
                { id: 'PluginGDPR', label: 'GDPR', desc: 'Cookie consent and preferences' },
                { id: 'PluginLockscreen', label: 'Lockscreen', desc: 'Lock the page behind a PIN' }
            ]
        },
        {
            title: 'Motion & effects',
            icon: 'bi-stars',
            items: [
                { id: 'PluginAnimation', label: 'Animation', js: 'animate', desc: 'Animate elements as they appear' },
                { id: 'PluginCursorEffect', label: 'Cursor Effect', desc: 'Custom cursor followers' },
                { id: 'PluginFloatElement', label: 'Float Element', desc: 'Elements that drift on scroll' },
                { id: 'PluginHoverEffect', label: 'Hover Effect', desc: '3D tilt and hover effects' },
                { id: 'PluginIcon', label: 'Icon', desc: 'Animated SVG icons' },
                { id: 'PluginInViewportStyle', label: 'In-Viewport Style', desc: 'Apply styles while in view' },
                { id: 'PluginParallax', label: 'Parallax', desc: 'Parallax backgrounds' },
                { id: 'PluginParticles', label: 'Particles', desc: 'Animated particle backgrounds' },
                { id: 'PluginReveal', label: 'Reveal', desc: 'Fade in on scroll, parallax banners' },
                { id: 'PluginScrollFx', label: 'Scroll FX', desc: 'Scroll-linked effects' },
                { id: 'PluginScrollShadow', label: 'Scroll Shadow', desc: 'Edge fades on scrollable areas' }
            ]
        },
        {
            title: 'Code & docs',
            icon: 'bi-code-square',
            items: [
                { id: 'PluginCodeRail', label: 'Code Rail', desc: 'Prose beside synced code samples' },
                { id: 'PluginCodeWindow', label: 'Code Window', desc: 'Tabbed, windowed code blocks' },
                { id: 'PluginHighlight', label: 'Highlight', desc: 'Syntax highlighting with line numbers' },
                { id: 'PluginMarkdown', label: 'Markdown', desc: 'Render GitHub Flavored Markdown' }
            ]
        },
        {
            title: 'Data & utilities',
            icon: 'bi-sliders',
            items: [
                { id: 'PluginChartCircular', label: 'Chart Circular', desc: 'Animated circular charts' },
                { id: 'PluginCountdown', label: 'Countdown', desc: 'Count down to a date' },
                { id: 'PluginCounter', label: 'Counter', desc: 'Animate numbers into view' },
                { id: 'PluginDarkMode', label: 'Dark Mode', desc: 'Light and dark theme toggle' },
                { id: 'PluginDice', label: 'Dice', desc: '3D dice for games' },
                { id: 'PluginEmoticon', label: 'Emoticon', desc: 'Emoji picker and rendering' },
                { id: 'PluginProgressBar', label: 'Progress Bar', desc: 'Animated progress bars' },
                { id: 'PluginRandomImages', label: 'Random Images', desc: 'Rotate images at random' },
                { id: 'PluginScrollbar', label: 'Scrollbar', desc: 'Custom scrollbars without vendors' },
                { id: 'PluginScroller', label: 'Scroller', desc: 'Horizontal scrolling rails' },
                { id: 'PluginToggle', label: 'Toggle', desc: 'Classic toggle list rows' },
                { id: 'PluginTransfer', label: 'Transfer', desc: 'Live progress for uploads and jobs' }
            ]
        }
    ];

    // Fill in derived fields and build a flat, ordered index
    const flat  = [];
    const byId  = {};
    const byFile = {};

    sections.forEach(function (section) {
        section.items.forEach(function (item) {
            if (!item.path) {
                item.path = 'docs/' + item.id + '.md';
            }
            if (!item.type) {
                item.type = 'md';
            }
            item.section = section.title;
            item.isComponent = item.id.indexOf('Plugin') === 0;
            if (item.isComponent) {
                const stem = item.js || item.id.replace(/^Plugin/, '').toLowerCase();
                item.source = 'js/components/themestrap.plugin.' + stem + '.js';
            }
            item.index = flat.length;
            flat.push(item);
            byId[item.id.toLowerCase()] = item;
            byFile[item.path.split('/').pop().toLowerCase()] = item;
        });
    });

    function raw(path) {
        return 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/' + path;
    }

    function blob(path) {
        return 'https://github.com/' + repo + '/blob/' + branch + '/' + path;
    }

    function edit(path) {
        return 'https://github.com/' + repo + '/edit/' + branch + '/' + path;
    }

    // Resolve a ?doc= value (case-insensitive id) to an entry, falling back to the first page
    function resolve(id) {
        if (id && byId[String(id).toLowerCase()]) {
            return byId[String(id).toLowerCase()];
        }
        return flat[0];
    }

    // Resolve a repo file name such as "PluginHighlight.md" or "README.md"
    function fromFile(name) {
        return byFile[String(name).toLowerCase()] || null;
    }

    function href(entry, hash) {
        return 'docs.html?doc=' + encodeURIComponent(entry.id) + (hash ? '#' + hash : '');
    }

    window.TS_SITE = {
        repo: repo,
        branch: branch,
        github: 'https://github.com/' + repo,
        sections: sections,
        flat: flat,
        raw: raw,
        blob: blob,
        edit: edit,
        resolve: resolve,
        fromFile: fromFile,
        href: href,
        componentCount: flat.filter(function (e) { return e.isComponent; }).length
    };
})(window);
