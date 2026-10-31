# Themestrap Plugin Documentation

Quick reference for all plugins in `js/components/`. Each section covers the plugin's purpose, HTML markup, available options, events, and public API. 

> [!NOTE]
> Refer to the `docs/` directory for a more exhaustive guide on each individual plugin as well as some of Themestrap's core infrastructure like the main runtime of the entire framework `themestrap.js` and an alternative plugin loader with dependency support like `themestrap.loader.js` and more.

---

## Table of Contents

1. [Accordion](#accordion)
2. [Account](#account)
3. [Alert](#alert)
4. [AnimatedContent](#animatedcontent)
5. [Animation (Animate)](#animation-animate)
6. [Auth](#auth)
7. [BeforeAfter](#beforeafter)
8. [Calendar](#calendar)
9. [Carousel](#carousel)
10. [CarouselLight](#carousellight)
11. [ChartCircular](#chartcircular)
12. [CodeRail](#coderail)
13. [CodeWindow](#codewindow)
14. [Collapsible](#collapsible)
15. [ColorPicker](#colorpicker)
16. [CommandMenu](#commandmenu)
17. [ContextMenu](#contextmenu)
18. [Countdown](#countdown)
19. [Counter](#counter)
20. [CursorEffect](#cursoreffect)
21. [DarkMode](#darkmode)
22. [Dialog](#dialog)
23. [Dice](#dice)
24. [Drawer](#drawer)
25. [FloatElement](#floatelement)
26. [GDPR](#gdpr)
27. [GDPRWrapper](#gdprwrapper)
28. [Highlight](#highlight)
29. [HoverCard](#hovercard)
30. [HoverEffect](#hovereffect)
31. [Icon](#icon)
32. [InViewportStyle](#inviewportstyle)
33. [Lightbox](#lightbox)
34. [LoadingOverlay](#loadingoverlay)
35. [Lockscreen](#lockscreen)
36. [Markdown](#markdown)
37. [MarkdownEditor](#markdowneditor)
38. [Masonry](#masonry)
39. [MatchHeight](#matchheight)
40. [Menubar](#menubar)
41. [ModuleLoader](#moduleloader)
42. [Nav](#nav)
43. [Navbar](#navbar)
44. [Navigation](#navigation)
45. [NavMenu](#navmenu)
46. [Newsletter](#newsletter)
47. [NumberInput](#numberinput)
48. [Otp](#otp)
49. [PanelNav](#panelnav)
50. [Parallax](#parallax)
51. [Particles](#particles)
52. [Popover](#popover)
53. [PricingToggle](#pricingtoggle)
54. [ProgressBar](#progressbar)
55. [RandomImages](#randomimages)
56. [Rating](#rating)
57. [ReadMore](#readmore)
58. [RevolutionSlider](#revolutionslider)
59. [RichEditor](#richeditor)
60. [Scrollable](#scrollable)
61. [Scrollbar](#scrollbar)
62. [Scroller](#scroller)
63. [ScrollFx](#scrollfx)
64. [ScrollShadow](#scrollshadow)
65. [ScrollSpy](#scrollspy)
66. [ScrollToTop](#scrolltotop)
67. [Search](#search)
68. [SectionScroll](#sectionscroll)
69. [Select](#select)
70. [SideNav](#sidenav)
71. [Sort](#sort)
72. [SplashScreen](#splashscreen)
73. [Sticky](#sticky)
74. [StickyHeader](#stickyheader)
75. [TagsInput](#tagsinput)
76. [TimePicker](#timepicker)
77. [Toast](#toast)
78. [Toggle](#toggle)
79. [Toolbar](#toolbar)
80. [Tooltip](#tooltip)
81. [Tree](#tree)
82. [Validation](#validation)
83. [VerticalNav](#verticalnav)
84. [VideoBackground](#videobackground)
85. [Wizard](#wizard)

---

## Accordion

**File:** `themestrap.plugin.accordion.js`  
**jQuery method:** `$.fn.themestrapPluginAccordion`  
**Instance key:** `__accordion`

A true multi-item accordion: a group of disclosure rows where (by default) only one panel is open at a time. This is the group counterpart to PluginCollapsible. Use Accordion for FAQs, settings groups, nested docs nav, and similar "show more" stacks where a set of headers reveal and hide their own bodies. All CSS is injected lazily on first `build()` using a Venom-palette dark theme (near-black surfaces, cream headings, blood-red accent).

### Markup

```html
<div data-plugin-accordion data-plugin-options='{"exclusive": true, "openIndex": 0}'>

  <div data-accordion-item>
    <button type="button" data-accordion-trigger>What is Themestrap?</button>
    <div data-accordion-panel>
      <p>A jQuery + Bootstrap component library for MODX 3.</p>
    </div>
  </div>

  <div data-accordion-item>
    <button type="button" data-accordion-trigger>How are panels animated?</button>
    <div data-accordion-panel>
      <p>Each panel animates between 0 and its measured height.</p>
    </div>
  </div>

</div>
```

The plugin resolves triggers with `[data-accordion-trigger]`, falling back to the first `<button>`, `<a>`, or `[data-accordion-header]`. Panels resolve via `[data-accordion-panel]`, then `[data-accordion-content]`, then the trigger's next sibling. A CSS chevron is injected automatically if no `[data-accordion-icon]` is found.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `exclusive` | Boolean | `true` | Only one panel open at a time. |
| `collapsible` | Boolean | `true` | In exclusive mode, allow the open panel to be re-closed. |
| `openIndex` | Number \| Number[] \| `'all'` \| `'none'` | `0` | Which item(s) start open. |
| `duration` | String \| Number | `'320ms'` | Height transition duration (CSS `<time>` or ms number). |
| `easing` | String | `cubic-bezier(.16,1,.3,1)` | CSS easing for the transition. |
| `iconRotate` | Number | `180` | Degrees the chevron rotates when open. |
| `flush` | Boolean | `false` | Edge-to-edge style (no card border/radius). |
| `disabled` | Boolean | `false` | Render the accordion inert. |

### Events

All events are namespaced `.ts.accordion`. The `index` value is 0-based.

| Event | Arguments | Description |
|-------|-----------|-------------|
| `ready.ts.accordion` | `(e, instance)` | Fired after initialization. |
| `open.ts.accordion` | `(e, index, $item)` | Fired when an open animation starts. |
| `opened.ts.accordion` | `(e, index, $item)` | Fired after open animation finishes. |
| `close.ts.accordion` | `(e, index, $item)` | Fired when a close animation starts. |
| `closed.ts.accordion` | `(e, index, $item)` | Fired after close animation finishes. |
| `change.ts.accordion` | `(e, index, isOpen, $item)` | Fired on any state change. |

### Public API

```js
const acc = $('#faq').data('__accordion');
acc.open(2);          // open item at index 2
acc.close(0);         // close item at index 0
acc.toggle(1);        // toggle item at index 1
acc.openAll();        // open all (no-op beyond first in exclusive mode)
acc.closeAll();       // close all
acc.openedIndexes();  // returns [0, 2]
acc.refresh();        // re-scan items after dynamic DOM changes
acc.setDisabled(true); // disable/enable all triggers
acc.destroy();        // restore original markup
```

### init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginAccordion']) && $('[data-plugin-accordion]').length) {
    themestrap.fn.intObsInit('[data-plugin-accordion]:not(.manual)', 'themestrapPluginAccordion');
}
```

---

## Account

**File:** `themestrap.plugin.account.js`  
**Namespace:** `themestrap.Account`

A header account flyout that manages sign-in, sign-up, and password-recovery form panels inside a shared wrapper (default: `#headerAccount`). Switches visibility by toggling CSS classes (`signin`, `signup`, `recover`) on the wrapper and auto-focuses the first field in each panel. Designed as a singleton—subsequent calls to `initialize()` are no-ops.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | jQuery | `$('#headerAccount')` | The flyout container element. |

### Trigger IDs

The plugin listens for clicks on these elements by ID:

- `#headerSignUp` — switch to sign-up panel
- `#headerSignIn` — switch to sign-in panel
- `#headerRecover` — switch to recover panel
- `#headerRecoverCancel` — return to sign-in from recover

### Usage

```js
themestrap.Account.initialize();
// or with a custom wrapper
themestrap.Account.initialize($('#myAccountPanel'), { wrapper: $('#myAccountPanel') });
```

---

## Alert

**File:** `themestrap.plugin.alert.js`  
**jQuery method:** `$.fn.themestrapPluginAlert`  
**Instance key:** `__pluginAlert`  
**Static factory:** `themestrap.PluginAlert.create(opts)`

Enhances Bootstrap alert elements with icons, dismiss buttons, action buttons, auto-dismiss timers with countdown progress bars, hover-pause, and slide or fade dismissal animations. Supports all Bootstrap contextual variants as well as custom `alert-ts-*` skin classes.

### Markup

```html
<div class="alert alert-ts alert-ts-info" role="alert"
     data-plugin-options='{"showIcon": true, "dismissible": true, "autoDismiss": true, "delay": 5000}'>
  This is an info message.
</div>
```

The plugin auto-detects the type from Bootstrap classes (`alert-success`, `alert-warning`, etc.) when `type` is not explicitly set.

### Programmatic Creation

```js
// Toast in the top-right corner
themestrap.PluginAlert.create({
    type:    'warning',
    title:   'Unsaved changes',
    message: 'You have unsaved changes. Do you want to save them?',
    delay:   8000,
    actions: [
        { label: 'Save',    key: 'save',    variant: 'primary' },
        { label: 'Discard', key: 'discard', variant: 'secondary' }
    ],
    onAction(key) {
        if (key === 'save') saveChanges();
        this.dismiss();
    }
});

// Inject into a specific container
themestrap.PluginAlert.create('#page-notifications', {
    type:    'success',
    message: 'Profile updated successfully.'
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | String | `null` | `'info'`, `'success'`, `'warning'`, `'danger'`, `'neutral'`, or any `alert-ts-*` variant. Auto-detected from class when null. |
| `showIcon` | Boolean | `false` | Inject an SVG icon matching the type. |
| `dismissible` | Boolean | `false` | Render a dismiss (×) button. |
| `title` | String | `null` | Bold heading above the message. |
| `message` | String | `null` | Message HTML. Used by `create()`; HTML alerts auto-detect content. |
| `actions` | Array | `[]` | Action buttons: `[{label, key, variant, class}]`. |
| `autoDismiss` | Boolean | `false` | Auto-remove after `delay` ms. |
| `delay` | Number | `5000` | Milliseconds before auto-dismiss. |
| `pauseOnHover` | Boolean | `true` | Pause countdown timer on hover. |
| `animation` | String | `'fade'` | Dismissal animation: `'fade'` or `'slide'`. |
| `animationDuration` | Number | `400` | Duration of the dismissal animation in ms. |
| `showCountdown` | Boolean | `true` | Show a shrinking progress bar along the bottom. |
| `onDismiss` | Function | `null` | Callback after the alert is dismissed. |
| `onAction` | Function | `null` | Callback when an action button is clicked: `fn(key)`. |
| `remove` | Boolean | `true` | `true` removes from DOM; `false` hides with `display:none`. |

### Events

| Event | Description |
|-------|-------------|
| `close.bs.alert` | Fired before the dismiss animation. |
| `closed.bs.alert` | Fired after the alert is removed/hidden. |
| `action.alert` | Fired when an action button is clicked: `(e, key, instance)`. |

### Public API

```js
const alert = $('#myAlert').data('__pluginAlert');
alert.dismiss();   // animate out and remove
alert.destroy();   // restore original HTML
```

---

## AnimatedContent

**File:** `themestrap.plugin.animatedcontent.js`  
**jQuery method:** `$.fn.themestrapPluginAnimatedContent`  
**Instance key:** `__animatedContent`

Animates element text content character-by-character (`letter`) or word-by-word (`word`). Letter mode supports a typewriter effect and CSS animation class injection per-letter. Word mode delegates to PluginAnimate for appear animations on each word.

### Markup

```html
<!-- Letter animation -->
<h1 data-plugin-animated-content
    data-plugin-options='{"contentType":"letter","animationName":"fadeIn","animationSpeed":50}'>
  Hello World
</h1>

<!-- Word animation -->
<h2 data-plugin-animated-content
    data-plugin-options='{"contentType":"word","animationName":"fadeInUp","animationSpeed":100}'>
  Animate each word
</h2>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentType` | String | `'letter'` | `'letter'` or `'word'`. |
| `animationName` | String | `'fadeIn'` | CSS animation class to apply. Use `'typeWriter'` for letter-mode typewriter effect. |
| `animationSpeed` | Number | `50` | Delay between each letter/word in ms. |
| `startDelay` | Number | `500` | Delay before animation begins in ms. |
| `minWindowWidth` | Number | `768` | Minimum window width required to run animation. |
| `letterClass` | String | `''` | Extra class added to each letter `<span>`. |
| `wordClass` | String | `''` | Extra class added to each word `<span>`. |
| `wrapperClass` | String | `''` | Extra class on the outer wrapper `<span>` for each unit. |
| `firstLoadNoAnim` | Boolean | `false` | Skip animation on first load (useful inside carousels). |

### Events

The plugin listens on the element for lifecycle events:

| Event | Description |
|-------|-------------|
| `animated.letters.destroy` | Tear down the animation and restore original text. |
| `animated.letters.initialize` | Re-run the animation (e.g. after carousel slide change). |

---

## Animation (Animate)

**File:** `themestrap.plugin.animate.js`  
**jQuery method:** `$.fn.themestrapPluginAnimate`  
**Instance key:** `__animate`

Triggers CSS appear-animations (Animate.css style) on elements as they enter the viewport. Used extensively by PluginCarousel, PluginAnimatedContent, and the IntersectionObserver auto-init pattern. Supports `flagClassOnly` mode for simple class-toggle animations like highlights.

### Markup

```html
<div data-appear-animation="fadeInUp"
     data-appear-animation-delay="200"
     data-appear-animation-duration="800ms">
  Content to animate in.
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accX` | Number | `0` | Horizontal IntersectionObserver offset. |
| `accY` | Number | `-80` | Vertical IntersectionObserver offset. |
| `delay` | Number | `100` | Default animation delay in ms (can be overridden by `data-appear-animation-delay`). |
| `duration` | String | `'750ms'` | Default animation duration (can be overridden by `data-appear-animation-duration`). |
| `minWindowWidth` | Number | `0` | Minimum viewport width to run the animation. |
| `forceAnimation` | Boolean | `false` | Run animation even when element is above the viewport. |
| `flagClassOnly` | Boolean | `false` | Only add the animation class; skip Animate.css `animated` class. |
| `firstLoadNoAnim` | Boolean | `false` | Skip animation on the first page load. |

---

## Auth

**File:** `themestrap.plugin.auth.js`  
**jQuery method:** `$.fn.themestrapPluginAuth`  
**Instance key:** `__pluginAuth`  
**Guide:** [`docs/PluginAuth.md`](docs/PluginAuth.md)

A progressive-enhancement layer for sign-in forms that works with any backend. It wraps a form you wrote, and adds inline validation, a password show/hide button, a strength meter, a Caps Lock hint, busy and lockout states, and inline or toast feedback. Submission is handled by a pluggable **adapter**, so the same form can talk to MODX, a PHP session, Laravel, Django, a JWT REST API, Firebase, an OAuth provider, or anything else. Without JavaScript the form still submits natively.

### Markup

```html
<form data-plugin-auth data-auth-action="login" method="post" action="/login">
    <div data-auth-message></div>

    <div data-auth-field="username">
        <label for="u">Username</label>
        <input id="u" name="username" required data-auth-error>
        <div data-auth-feedback></div>
    </div>

    <div data-auth-field="password">
        <label for="p">Password</label>
        <input id="p" name="password" type="password" required data-auth-error>
        <button type="button" data-auth-toggle-password>Show</button>
        <span data-auth-capslock class="d-none">Caps Lock is on</span>
        <div data-auth-feedback></div>
    </div>

    <button type="submit" data-auth-submit>
        <span data-auth-submit-label>Sign in</span>
        <span data-auth-spinner class="spinner-border d-none" aria-hidden="true"></span>
    </button>
</form>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `ajax` | `false` | Shorthand for `adapter: 'json'` |
| `adapter` | `null` | `'form'`, `'json'`, `'modx'`, `'rest'`, a registered name, `{ submit(ctx) }`, or a function. `null` means `'json'` when `ajax` is true, otherwise `'form'` |
| `url` | `''` | Overrides the form action |
| `endpoints` | `{}` | Per action: `{ login: '/api/login', register: '/api/register' }` |
| `method` | `''` | Overrides the form method |
| `encoding` | `'form'` | Request body format. The `rest` adapter uses `'json'` |
| `headers` | `{}` | Extra request headers |
| `credentials` | `'same-origin'` | fetch credentials mode. Use `'include'` for cross-site cookies |
| `timeout` | `20000` | Milliseconds before the request is aborted. `0` disables |
| `csrf` | `'auto'` | `{ header, field, token, cookie }`. See [CSRF](docs/PluginAuth.md#csrf) |
| `response` | `{}` | Map names to paths or functions: `{ success: 'data.ok', token: 'data.jwt', message: (body, res) => … }`. Keys: `success`, `message`, `errors`, `redirect`, `token`, `challenge`, `retryAfter` |
| `normalize` | `null` | `function (body, res, options, ctx)` returning a full result. Replaces the default understanding |
| `beforeSubmit` | `null` | `function (data, ctx)`. Return the data, `false` to cancel, or a Promise of either. Works with every adapter, including `'form'` |
| `transform` | `null` | `function (data, ctx)` returning the object to send, for renaming fields |
| `redirect` | `''` | Where to go after success |
| `redirectDelay` | `600` | Milliseconds before redirecting |
| `allowExternalRedirect` | `false` | Allow redirects to other sites. Off by default so a forged reply cannot send users away |
| `token` | `{…}` | `{ store, key, header, scheme }`: where to keep a token from the reply (`false`, `memory`, `session`, `local`) and how to send it later. |
| `providers` | `{}` | `{ github: { url, mode, origin, width, height } }`. `mode` is `'redirect'` (default) or `'popup'` |
| `toasts` | `true` | PluginToast on success and error, when that plugin is loaded |
| `messageTarget` | `'[data-auth-message]'` | Selector for the inline status area. |
| `toastSuccessTitle` | `'Success'` | Toast title for success messages, when PluginToast is loaded. |
| `toastErrorTitle` | `'Sorry'` | Toast title for error messages. |
| `successMessage` | `''` | Text shown on success when the reply has none. |
| `errorMessage` | `'Please check the form for errors.'` | Text shown when validation fails. |
| `networkErrorMessage` | `'Could not reach the server. Please t…` | Text shown when the request cannot reach the server. |
| `unexpectedResponseMessage` | `'The server sent a reply this form co…` | Text shown when the reply cannot be understood. |
| `popupBlockedMessage` | `'The sign in window was blocked. Plea…` | Text shown when the browser blocks a provider popup. |
| `busyLabel` | `'Working...'` | Submit button text while the request runs. |
| `lockedLabel` | `'Try again in %s'` | Submit button text during a lockout; `%s` is the seconds left. |
| `showPasswordLabel` | `'Show'` | Label of the password toggle while the password is hidden. |
| `hidePasswordLabel` | `'Hide'` | Label of the password toggle while the password is shown. |
| `classes` | `{ invalid: 'is-invalid', valid: 'is-v…` | Class names for validation state and the message area. |
| `validators` | `{}` | { name: function(value, $input, instance) returning '' or an error } |
| `messages` | `{…}` | Validation messages by rule name (`required`, `email`, `match` …). |

### Public API

```js
const inst = $('#el').data('__pluginAuth');
inst.validate();
inst.submit();
inst.setBusy(bool);
inst.setMessage(text, type);
inst.clearMessage();
inst.setErrors({ name: 'msg' });
inst.provider(name);
inst.reset();
inst.destroy();
inst.getToken(key, store);
```

---

## BeforeAfter

**File:** `themestrap.plugin.beforeafter.js`  
**jQuery method:** `$.fn.themestrapPluginBeforeAfter`  
**Instance key:** `__beforeafter`

A before/after image comparison slider. Wraps the [TwentyTwenty](https://zurb.com/playground/twentytwenty) jQuery plugin. Requires the `jquery.event.move.js` and `jquery.twentytwenty.js` vendor files plus the `twentytwenty.css` stylesheet.

### Markup

```html
<div class="twentytwenty-container"
     data-plugin-before-after
     data-plugin-options='{"default_offset_pct": 0.5, "orientation": "horizontal"}'>
  <img src="before.jpg" alt="Before">
  <img src="after.jpg" alt="After">
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `forceInit` | Boolean | `true` | Initialize immediately without waiting for images. |
| `default_offset_pct` | Number | `0.5` | Initial slider position (0–1). |
| `orientation` | String | `'horizontal'` | `'horizontal'` or `'vertical'`. |
| `before_label` | String | `'Before'` | Label shown on the before side. |
| `after_label` | String | `'After'` | Label shown on the after side. |
| `no_overlay` | Boolean | `false` | Hide the label overlay. |
| `move_slider_on_hover` | Boolean | `false` | Move slider on mouse hover instead of drag. |
| `move_with_handle_only` | Boolean | `true` | Require dragging the handle div. |
| `click_to_move` | Boolean | `false` | Jump slider to click position. |

---

## Calendar

**File:** `themestrap.plugin.calendar.js`  
**jQuery method:** `$.fn.themestrapPluginCalendar`  
**Instance key:** `__pluginCalendar`  
**Guide:** [`docs/PluginCalendar.md`](docs/PluginCalendar.md)

A dependency-free date picker built for Themestrap. Supports single, multiple, and range selection; disabled date rules via arrays, bounds, or a predicate function; and full keyboard navigation using the ARIA grid pattern. Styles are injected once on first use and removed when the last instance is destroyed.

### Markup

```html
<div id="my-calendar"></div>

<script>
$('#my-calendar').themestrapPluginCalendar();
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `mode` | `"single"` | Selection mode. `"single"` \| `"multiple"` \| `"range"`. |
| `selected` | `null` | Pre-selected value. Shape must match `mode` — see [Selection Modes](docs/PluginCalendar.md#selection-modes). |
| `initialMonth` | `null` | Month to open on. Defaults to the current month. Accepts a `Date` or `"YYYY-MM-DD"` string. |
| `showOutsideDays` | `true` | Render padding days from the previous and next month in the first and last rows. |
| `weekStartsOn` | `0` | Day of the week to display in the first column. `0` = Sunday, `1` = Monday. |
| `minDate` | `null` | Lower bound (inclusive). Days before this date are disabled. |
| `maxDate` | `null` | Upper bound (inclusive). Days after this date are disabled. |
| `disabled` | `[]` | Specific dates to disable. Accepts a `Date[]`, `"YYYY-MM-DD"[]`, or a predicate `(date: Date) => boolean`. Applied after `minDate`/`maxDate`. |
| `fixedWeeks` | `false` | Always render exactly 6 rows regardless of the month. Prevents layout shift when navigating. |
| `showFooter` | `false` | Render a "Today" button beneath the grid that navigates the view back to the current month. |
| `onSelect` | `null` | Callback fired after a selection is committed. Receives the same value shape as `selected`. |

### Public API

```js
const inst = $('#el').data('__pluginCalendar');
inst.getValue();
inst.setValue(val);
inst.goToMonth(year, month);
inst.goToToday();
inst.destroy();
```

### Events

`ts.calendar.select`, `ts.calendar.monthChange`

---

## Carousel

**File:** `themestrap.plugin.carousel.js`  
**jQuery method:** `$.fn.themestrapPluginCarousel`  
**Instance key:** `__carousel`  
**Guide:** [`docs/PluginCarousel.md`](docs/PluginCarousel.md)

`PluginCarousel` is a feature-rich, dependency-free carousel. It provides responsive multi-item slides, looping, multiple transition effects, autoplay, navigation controls, dots, counters, progress indicators, thumbnails, keyboard navigation, mouse/touch dragging, lazy loading, media control, RTL support, vertical orientation, and accessibility features.

### Markup

```html
<div id="my-carousel">
    <div>
        <img src="/images/slide-1.jpg" alt="Slide 1">
    </div>

    <div>
        <img src="/images/slide-2.jpg" alt="Slide 2">
    </div>

    <div>
        <img src="/images/slide-3.jpg" alt="Slide 3">
    </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `items` | `1` | Visible slides at once (slide mode). |
| `loop` | `true` | Wrap from the last slide to the first. |
| `transition` | `'slide'` | Transition type: `slide`, `fade`, or `zoom`. |
| `speed` | `500` | Transition duration in milliseconds. |
| `easing` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing function used for transitions. |
| `group` | `1` | Slides to advance per click or swipe. |
| `responsive` | `{}` | Breakpoint map, slide mode only: `{ 768: { items: 2 }, 1200: { items: 3 } }`. Keys are minimum widths. |
| `autoplay` | `false` | Advance automatically. |
| `autoplaySpeed` | `5000` | Milliseconds between automatic advances. |
| `pauseOnHover` | `true` | Pause autoplay while the pointer is over the carousel. |
| `pauseOnFocus` | `true` | Pause autoplay while focus is inside the carousel. |
| `pauseOnVisibility` | `true` | Pause autoplay while the browser tab is hidden. |
| `nav` | `true` | Show previous and next buttons. |
| `navText` | `[]` | `[prevHTML, nextHTML]` for the buttons. Empty uses the built-in SVG icons. |
| `dots` | `true` | Show the slide indicators. |
| `dotType` | `'default'` | 'default' \| 'line' \| 'number' |
| `counter` | `false` | Show a numeric "current / total" counter. |
| `progressBar` | `false` | Show an autoplay progress bar. |
| `progressPosition` | `'bottom'` | 'top' \| 'bottom' |
| `thumbs` | `false` | Show a thumbnail strip built from the slides. |
| `thumbsEl` | `null` | CSS selector for an external thumbnail container |
| `touchDrag` | `true` | Swipe to change slides on touch screens. |
| `mouseDrag` | `true` | Drag with the mouse to change slides. |
| `keyboard` | `true` | Arrow keys change slides while the carousel has focus. |
| `rtl` | `false` | Right-to-left order. |
| `vertical` | `false` | Slide vertically. |
| `stagePadding` | `0` | Space in px on either side of the stage, revealing the neighboring slides. |
| `gap` | `0` | Space in px between visible slides. |
| `autoHeight` | `false` | Resize the stage to the current slide's height. |
| `lazyLoad` | `true` | Load `data-lazy-src` images for the current slide and its two neighbors only. |
| `pauseMedia` | `false` | Pause video and audio in inactive slides, and play `[data-autoplay]` media in the active one. |
| `animateIn` | `null` | Animate.css class for the incoming slide (PluginAnimate compatibility). |
| `animateOut` | `null` | Animate.css class for the outgoing slide. |
| `ariaLabel` | `'Carousel'` | Accessible name for the carousel region. |
| `forceInit` | `false` | With `dynIntObsInit`: initialize at once instead of on scroll. |
| `accY` | `0` | With `dynIntObsInit`: bottom root margin in px for the observer. |

---

## CarouselLight

> [!NOTE]
> This plugin is no longer in `js/components/`. Use PluginCarousel (`themestrap.plugin.carousel.js`), which is dependency-free and covers the same ground. See [Carousel](#carousel).

---

## ChartCircular

**File:** `themestrap.plugin.chartcircular.js`  
**jQuery method:** `$.fn.themestrapPluginChartCircular`  
**Instance key:** `__chartCircular`  
**Guide:** [`docs/PluginChartCircular.md`](docs/PluginChartCircular.md)

An animated ring chart for a single percentage, drawn on a HiDPI-aware `<canvas>`. The ring fills from 0 to its value when it scrolls into view, with an optional track, tick marks and a counting number in the middle. No vendor library is needed.

### Markup

```html
<div class="chart-ring" data-plugin-chart-circular data-percent="85"
     data-plugin-options='{"barColor": "#e8672a", "lineWidth": 8, "size": 140}'>
    <span class="chart-ring__value"><span class="percent"></span>%</span>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `delay` | `1` | Wait in ms after init before animating. |
| `barColor` | `'#0088CC'` | Arc color, any CSS color. Must be a string (see Pitfalls). |
| `trackColor` | `'#f2f2f2'` | Full-circle track behind the arc. `false` hides it. |
| `scaleColor` | `false` | Color of 24 tick marks around the outside of the ring. `false` hides them. |
| `scaleLength` | `5` | Tick length in px. |
| `lineCap` | `'round'` | End of the arc: `round`, `square` or `butt`. The track is always `butt`. |
| `lineWidth` | `13` | Ring thickness in px. |
| `size` | `175` | Canvas width and height in CSS px. |
| `rotate` | `0` | Rotates the starting point clockwise, in degrees. `0` is 12 o'clock. |
| `animate` | `{ duration: 2500, enabled: true }` | `duration` in ms; `enabled: false` draws the final value at once. |

### Public API

```js
const inst = $('#el').data('__chartCircular');
inst.destroy();
```

---

## CodeRail

**File:** `themestrap.plugin.coderail.js`  
**jQuery method:** `$.fn.themestrapPluginCodeRail`  
**Instance key:** `__codeRail`

The signature two-column API-reference layout: prose sections on the left, a sticky code column on the right whose visible panel stays in sync with the section currently being read. Scrolling the prose cross-fades the matching code example into the sticky frame. On narrow viewports the two columns merge and each code panel is relocated inline beneath its prose section.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `top` | Number | `96` | Sticky offset from the top in px. |
| `breakpoint` | Number | `1024` | Viewport width below which rail becomes inline. |
| `rootMargin` | String | `''` | IntersectionObserver root margin override. |
| `fade` | Boolean | `true` | Cross-fade panels on scroll-sync change. |

---

## CodeWindow

**File:** `themestrap.plugin.codewindow.js`  
**jQuery method:** `$.fn.themestrapPluginCodeWindow`  
**Instance key:** `__codeWindow`

Decorates a group of `<pre>` code blocks with an editor window chrome bar (mac or windows style), a tabbed filename strip, and an optional ambient gradient glow behind the frame. Shows one pane at a time; tab clicks switch between them. Syntax highlighting, line numbers, and the copy button are delegated to PluginHighlight—this plugin owns only the window shell and tab switching.

### Markup

```html
<div data-plugin-code-window
     data-plugin-options='{"glow": true, "chrome": "mac", "activeTab": 0}'>

  <pre data-plugin-highlight="javascript"
       data-cw-filename="app.js"><code>
    const greet = name => `Hello, ${name}!`;
  </code></pre>

  <pre data-plugin-highlight="css"
       data-cw-filename="style.css"><code>
    body { margin: 0; }
  </code></pre>

</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `activeTab` | Number | `0` | Which pane is shown initially (0-based). |
| `chrome` | String | `'win'` | Window chrome style: `'win'` or `'mac'`. |
| `tabs` | Boolean | `true` | Show the filename tab strip. |
| `glow` | Boolean | `true` | Show the ambient gradient glow behind the frame. |
| `lineNumbers` | Boolean | `true` | Passed to PluginHighlight. |
| `showCopy` | Boolean | `true` | Passed to PluginHighlight. |
| `highlight` | Boolean | `true` | Run PluginHighlight on each pane. |
| `accent` | String | `''` | Custom accent color for the glow. |

---

## Collapsible

**File:** `themestrap.plugin.collapsible.js`  
**jQuery method:** `$.fn.themestrapPluginCollapsible`  
**Instance key:** `__pluginCollapsible`

A single standalone show/hide panel with animated height transition. The counterpart to Accordion (which manages a group). Use this anywhere you need a single expandable section, such as a filter panel, extended description, or sidebar widget.

### Markup

```html
<div data-plugin-collapsible
     data-plugin-options='{"defaultOpen": true}'>
  <button data-collapsible-trigger>Toggle Details</button>
  <div data-collapsible-panel>
    <p>Hidden content revealed on toggle.</p>
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultOpen` | Boolean | `false` | Start in the open state. |
| `disabled` | Boolean | `false` | Render the trigger inert. |
| `duration` | String/Number | `'300ms'` | Height transition duration. |
| `easing` | String | `'ease'` | CSS easing for the transition. |

---

## ColorPicker

**File:** `themestrap.plugin.colorpicker.js`  
**jQuery method:** `$.fn.themestrapPluginColorPicker`  
**Instance key:** `__pluginColorPicker`  
**Guide:** [`docs/PluginColorPicker.md`](docs/PluginColorPicker.md)

Zero-dependency jQuery color picker built on an HSV model. Renders a floating panel with a saturation/value area, hue slider, optional alpha slider, preset swatches, and EyeDropper API integration. Outputs in `hex`, `rgb`, `rgba`, `hsl`, or `hsla` format. No canvas, no vendor libraries.

### Markup

```html
<input type="text" id="my-picker" value="#3498db">
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `'hex'` | Output format. One of `hex`, `rgb`, `rgba`, `hsl`, `hsla`. |
| `alpha` | `false` | Show the alpha slider. Enable when using `rgba` or `hsla` format. |
| `swatches` | `[]` | Array of CSS colour strings to render as quick-pick swatches. |
| `closeOnSelect` | `false` | Close the panel immediately when a swatch is clicked. |
| `position` | `'auto'` | Panel placement. `'auto'` flips to above the input when there is not enough space below. |
| `showEyeDropper` | `true` | Show the EyeDropper button when `window.EyeDropper` is available. |
| `showInput` | `true` | Show the text field and format selector inside the panel. |
| `defaultColor` | `'#e74c3c'` | Fallback colour when the input value and `data-color` are both absent. |
| `onChange` | `null` | Called with `(formattedValue, instance)` on every colour change. |
| `onOpen` | `null` | Called with `(instance)` when the panel opens. |
| `onClose` | `null` | Called with `(instance)` when the panel closes. |

### Public API

```js
const inst = $('#el').data('__pluginColorPicker');
inst.open();
inst.close();
inst.toggle();
inst.setColor(value);
inst.getColor();
inst.destroy();
```

---

## CommandMenu

**File:** `themestrap.plugin.commandmenu.js`  
**jQuery method:** `$.fn.themestrapPluginCommandMenu`  
**Instance key:** `__pluginCommandMenu`  
**Guide:** [`docs/PluginCommandMenu.md`](docs/PluginCommandMenu.md)

A modal command palette that lives in the same family as some libraries `cmd` component. Hit `⌘K` from anywhere, type to filter, navigate with the arrow keys, hit Enter to execute. Items can navigate, dispatch JS callbacks, or fire a custom event. Recent selections persist to `localStorage` and pin themselves at the top of the list.

### Markup

```html
<!-- Trigger (anywhere in the DOM) -->
<button data-command-open="main-cmd">Open palette</button>
 
<!-- Command Menu root -->
<div data-plugin-command-menu id="main-cmd"
     data-plugin-options='{"shortcut": "mod+k", "recent": true}'>
 
  <div data-command-backdrop></div>
 
  <div data-command-panel>
 
    <div data-command-search>
      <i class="fas fa-search"></i>
      <input data-command-input type="text" placeholder="Type a command..." />
    </div>
 
    <div data-command-list>
      <div data-command-empty><strong>No results.</strong></div>
 
      <div data-command-group data-command-heading="Navigation">
        <button data-command-item
                data-command-keywords="dashboard overview"
                data-command-href="/dashboard">
          <i class="fas fa-home" data-command-icon></i>
          <span data-command-label>Dashboard</span>
          <kbd data-command-shortcut>G D</kbd>
        </button>
      </div>
 
    </div>
 
    <div data-command-footer>
      <kbd>↑</kbd><kbd>↓</kbd> navigate
      <kbd>↵</kbd> select
      <kbd>esc</kbd> close
    </div>
  </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `shortcut` | `"mod+k"` | Global keyboard shortcut to summon the menu. `mod` = ⌘ on Mac, Ctrl elsewhere. Combine with `+`: `"ctrl+shift+p"`, `"alt+/"`. Single keys work too: `"/"`, `"?"`. Set `null` to disable. |
| `closeOnBackdrop` | `true` | Close the menu when the backdrop is clicked. |
| `closeOnSelect` | `true` | Close after an item is activated. Set `false` for inline action menus that should stay open. |
| `backdrop` | `true` | Inject a `[data-command-backdrop]` element if one is not authored. Set `false` for non-modal palettes that overlay without dimming. |
| `scrollLock` | `true` | Add `dialog-scroll-lock` to `<body>` while open so the page does not scroll behind the panel. |
| `animationIn` | `"fadeIn"` | CSS animation class applied to `[data-command-panel]` on open. Falls back to the root element if no panel exists. |
| `animationOut` | `"fadeOut"` | CSS animation class applied to `[data-command-panel]` on close. |
| `animationDuration` | `200` | Fallback timeout (ms) in case `animationend` never fires — keeps state consistent. |
| `preserveQuery` | `false` | Keep the search query (and filtered state) across close/reopen cycles. When the menu reopens, the input is focused with all text selected so typing replaces it. |
| `recent` | `false` | Track activated items in `localStorage` and auto-clone them into `[data-command-recent]`. Persists per instance ID. |
| `recentLimit` | `5` | Maximum number of remembered recent entries. |
| `onOpen` | `null` | Callback fired after open animation begins. Receives the root element. `this` = plugin instance. |
| `onClose` | `null` | Callback fired after close animation completes. |
| `onFilter` | `null` | Callback fired on every query change. Receives `(query, matchCount)`. |
| `onSelect` | `null` | Callback fired when an item is activated, BEFORE navigation/close. Receives `($item, payload)` where payload = `{id, action, href, target, label}`. |

### Public API

```js
const inst = $('#el').data('__pluginCommandMenu');
inst.open();
inst.close();
inst.toggle();
inst.setQuery(q);
inst.registerAction(key, callback);
inst.unregisterAction(key);
inst.pushRecent(id);
inst.clearRecent();
inst.destroy();
```

---

## ContextMenu

**File:** `themestrap.plugin.contextmenu.js`  
**jQuery method:** `$.fn.themestrapPluginContextMenu`  
**Instance key:** `__pluginContextMenu`  
**Guide:** [`docs/PluginContextMenu.md`](docs/PluginContextMenu.md)

A right-click context menu with nested sub-menus, separators, group labels, keyboard navigation, dark mode, smart viewport-edge detection, and a public API for swapping items at runtime with zero dependencies beyond jQuery.

### Markup

```html
<!-- 1. Include plugin after jQuery -->
<script src="js/components/themestrap.plugin.contextmenu.js"></script>

<!-- 2. Mark your trigger element -->
<div id="my-area">Right-click me</div>

<!-- 3. Initialize -->
<script>
$('#my-area').themestrapPluginContextMenu({
  items: [
    { label: 'Cut',   icon: '✂️', shortcut: '⌘X', action: () => {} },
    { label: 'Copy',  icon: '📋', shortcut: '⌘C', action: () => {} },
    { label: 'Paste', icon: '📌', shortcut: '⌘V', action: () => {} },
    { type: 'separator' },
    { label: 'Delete', icon: '🗑', destructive: true, action: () => {} }
  ]
});
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `items` | `[]` | Array of item definition objects. See [Item Schema](docs/PluginContextMenu.md#item-schema). |
| `dark` | `false` | Adds `.ts-ctx-dark` to the menu — applies a dark color scheme including to any sub-menus. |
| `ariaLabel` | `'Context menu'` | Sets `aria-label` on the menu container. |
| `triggerEvent` | `null` | Pass `'longpress'` to also open on mobile touch-and-hold. Right-click is always active. |
| `longpressDelay` | `600` | Milliseconds before longpress fires. Only used with `triggerEvent: 'longpress'`. |
| `mutualExclusion` | `true` | Opening any context menu closes all other open context menus on the page. |
| `onOpen` | `null` | Callback fired when menu opens. Receives `(instance)`. `this` is the trigger element. |
| `onClose` | `null` | Callback fired when menu closes for any reason. Receives `(instance)`. |

### Public API

```js
const inst = $('#el').data('__pluginContextMenu');
inst.setItems(items);
inst.close();
inst.destroy();
```

---

## Countdown

**File:** `themestrap.plugin.countdown.js`  
**jQuery method:** `$.fn.themestrapPluginCountdown`  
**Instance key:** `__pluginCountdown`  
**Guide:** [`docs/PluginCountdown.md`](docs/PluginCountdown.md)

A live countdown to a date, in days, hours, minutes and seconds. Digits roll like an odometer using pure CSS, and four layouts cover the common cases: labels under the numbers, labels beside them, a compact clock, and boxed tiles. No vendor library is needed.

### Markup

```html
<div data-plugin-countdown data-plugin-countdown-date="2026-12-31T23:59:59"></div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `date` | `null` | Target date. Without one (and no attribute), the numbers stay at 0 and nothing ticks. |
| `layout` | `'labels-under'` | `labels-under`, `labels-side`, `clock` or `boxes`. |
| `fontSize` | `'text-5xl'` | Class added to each `.ts-countdown`. The default is not a Bootstrap class; use `fs-1`, `display-4` or your own (see Pitfalls). Ignored by `clock`. |
| `gap` | `'1rem'` | Space between units in `labels-under` and `boxes`. |
| `separator` | `':'` | Text between numbers in `clock`. |
| `minDigits` | `2` | Minimum digits shown: `1`, `2` or `3`. `2` turns 7 into 07. Only `labels-under` and `boxes` honor it. |
| `showDays` | `true` | Show the days unit. |
| `showHours` | `true` | Show the hours unit. |
| `showMinutes` | `true` | Show the minutes unit. |
| `showSeconds` | `true` | Show the seconds unit. |
| `labelDays` | `'days'` | Label for days. |
| `labelHours` | `'hours'` | Label for hours. |
| `labelMinutes` | `'min'` | Label for minutes. |
| `labelSeconds` | `'sec'` | Label for seconds. |
| `boxBg` | `'var(--ts-navy, #0a1929)'` | `boxes`: tile background. |
| `boxColor` | `'#fff'` | `boxes`: tile text color. |
| `boxPadding` | `'0.5rem 1rem'` | `boxes`: tile padding. |
| `boxRadius` | `'0.5rem'` | `boxes`: tile corner radius. |

### Public API

```js
const inst = $('#el').data('__pluginCountdown');
inst.setDate(date);
inst.pause();
inst.resume();
inst.destroy();
```

### Events

`ts.countdown.finished`

---

## Counter

**File:** `themestrap.plugin.counter.js`  
**jQuery method:** `$.fn.themestrapPluginCounter`  
**Instance key:** `__pluginCounter`  
**Guide:** [`docs/PluginCounter.md`](docs/PluginCounter.md)

Animates a number from a start value to a target value over a configurable duration. No external dependencies — the counter runs entirely on `requestAnimationFrame` with an ease-in-out-quad easing curve. Affix strings (prepend/append) are applied after the animation completes.

### Markup

```html
<span data-plugin-counter data-to="1250" data-plugin-options='{"speed":2500}'>0</span>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `from` | `0` | Start value |
| `to` | `null` | End value — required |
| `speed` | `3000` | Animation duration in milliseconds |
| `refreshInterval` | `100` | Minimum ms between DOM text updates (floored at 16) |
| `decimals` | `0` | Decimal places in the formatted output |
| `comma` | `false` | Replace `.` decimal point with `,` |
| `thousandsSeparator` | `''` | Character inserted every 3 integer digits, e.g. `','` or `'.'` |
| `appendWrapper` | `false` | Selector or HTML tag wrapping the append string |
| `prependWrapper` | `false` | Selector or HTML tag wrapping the prepend string |
| `formatter` | `null` | `(value, opts) => string` — overrides all built-in formatting |
| `onUpdate` | `null` | Called each refresh tick with the current `value` |
| `onComplete` | `null` | Called once when the animation ends with the final `value` |

---

## CursorEffect

**File:** `themestrap.plugin.cursoreffect.js`  
**jQuery method:** `$.fn.themestrapPluginCursorEffect`  
**Instance key:** `__cursorEffect`  
**Guide:** [`docs/PluginCursorEffect.md`](docs/PluginCursorEffect.md)

A custom cursor: a ring that follows the mouse with a dot at its center. The ring can snap around buttons and cards, the dot can turn into a plus sign, and the native cursor can be hidden.

### Markup

```html
<body data-plugin-cursor-effect data-plugin-options='{"hideMouseCursor": true, "size": "big"}'>
    ...
    <a href="/work" class="btn btn-dark" data-cursor-effect-hover="fit">See our work</a>
    <figure data-cursor-effect-hover="plus" data-cursor-effect-hover-color="light">...</figure>
</body>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `size` | `'default'` | `small` (20 px ring), `default` (40 px) or `big` (60 px). |
| `hideMouseCursor` | `false` | Hide the native cursor on the element and on links, buttons and fields inside it. |
| `cursorOuterColor` | `null` | Ring color, as any CSS color. Default is the theme's `--primary`. |
| `cursorInnerColor` | `null` | Dot color. Default is `--primary`. |
| `style` | `null` | A class added to the element. `cursor-effect-style-square` gives a square ring and dot. |

### Public API

```js
const inst = $('#el').data('__cursorEffect');
inst.setSize(size);
inst.hide();
inst.show();
inst.destroy();
```

---

## DarkMode

**File:** `themestrap.plugin.darkmode.js`  
**jQuery method:** `$.fn.themestrapPluginDarkMode`  
**Instance key:** `__darkMode`  
**Guide:** [`docs/PluginDarkMode.md`](docs/PluginDarkMode.md)

PluginDarkMode provides a fully-featured light/dark theme toggle with localStorage persistence, system-preference tracking, cross-tab sync, and optional cookie support for server-side awareness.

### Markup

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

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `storageKey` | `'themestrap-theme'` | `localStorage` key. Override to share theme state across multiple projects on the same domain. |
| `darkClass` | `'dark'` | Class added to `<html>` in dark mode. Must match the selector your theme CSS uses. |
| `dataAttribute` | `'data-theme'` | Attribute set on `<html>` reflecting the current theme. Set to `null` to disable. |
| `bsThemeAttribute` | `'data-bs-theme'` | Bootstrap 5.3 theme attribute on `<html>`. Set to `null` to disable. |
| `cookieEnabled` | `false` | Write a cookie alongside localStorage so the server can read the theme at render time. Off by default because cookies travel with every request; turn it on when the server needs the theme (a MODX snippet picking a stylesheet, for example). |
| `cookieName` | `'themestrap-theme'` | Cookie name. |
| `cookieMaxAge` | `31536000` | Cookie `max-age` in seconds (default: 1 year). |
| `cookiePath` | `'/'` | Cookie `path`. |
| `cookieSameSite` | `'lax'` | Cookie `SameSite` policy: `'lax'`, `'strict'`, or `'none'`. |
| `renderIcon` | `true` | Inject the sun/moon SVG into the toggle element. |
| `iconSun` | `*(built-in SVG)*` | SVG string for the sun icon (shown in light mode). |
| `iconMoon` | `*(built-in SVG)*` | SVG string for the moon icon (shown in dark mode). |
| `ariaLabelLight` | `'Switch to light mode'` | `aria-label` applied when clicking will switch to light. |
| `ariaLabelDark` | `'Switch to dark mode'` | `aria-label` applied when clicking will switch to dark. |
| `onChange` | `null` | Callback fired on every theme change for this instance, after the DOM is updated. Receives `(theme)`. |

### Public API

```js
const inst = $('#el').data('__darkMode');
inst.destroy();
```

---

## Dialog

**File:** `themestrap.plugin.dialog.js`  
**jQuery method:** `$.fn.themestrapPluginDialog`  
**Instance key:** `__pluginDialog`

Accessible, focus-trapped modal dialogs with backdrop, scroll-lock, and CSS animation support. Handles multiple open dialogs, Escape-to-close, click-to-close on backdrop, and proper ARIA attributes.

### Markup

```html
<!-- Trigger -->
<button data-dialog-open="my-dialog">Open</button>

<!-- Dialog root -->
<div data-plugin-dialog id="my-dialog"
     data-plugin-options='{"animationIn": "fadeInDown", "closeOnBackdrop": true}'>

  <div data-dialog-backdrop></div>

  <div data-dialog-panel role="dialog" aria-modal="true" aria-labelledby="dlg-title">
    <button data-dialog-close aria-label="Close">×</button>
    <h2 id="dlg-title">Dialog Title</h2>
    <p>Dialog content.</p>
  </div>

</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeOnBackdrop` | Boolean | `true` | Close when backdrop is clicked. |
| `closeOnEscape` | Boolean | `true` | Close on Escape key. |
| `backdrop` | Boolean | `true` | Require a `[data-dialog-backdrop]` element. |
| `animationIn` | String | `'fadeIn'` | CSS animation class for opening the panel. |
| `animationOut` | String | `'fadeOut'` | CSS animation class for closing the panel. |
| `animationDuration` | Number | `300` | Duration for animation classes in ms. |

---

## Dice

**File:** `themestrap.plugin.dice.js`  
**jQuery method:** `$.fn.themestrapPluginDice`  
**Instance key:** `__pluginDice`  
**Guide:** [`docs/PluginDice.md`](docs/PluginDice.md)

A tray of dice drawn with pure CSS pips. Throw some or all of the dice with a tumbling animation, let players pick dice by click or keyboard, and set dice aside. Built for dice games such as Farkle, Yahtzee or Liar's Dice, and for anything that needs a die face on screen. No images and no vendor dependencies.

### Markup

```html
<script src="js/components/themestrap.plugin.dice.js"></script>

<div id="tray" data-plugin-dice
     data-plugin-options='{"count": 6, "selectable": true}'></div>

<button id="throw">Throw</button>
<script>
$('#throw').on('click', function () {
    $('#tray').data('__pluginDice').roll().then(function (values) {
        console.log(values);
    });
});
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `count` | `6` | Dice in the tray (1 to 50) |
| `values` | `[]` | Starting faces. `null` or a missing entry draws an empty face |
| `held` | `[]` | Starting held flags |
| `selectable` | `false` | Dice can be picked by click or keyboard |
| `size` | `'md'` | `'sm'`, `'md'` or `'lg'`. Any size with `--ts-dice-size` |
| `center` | `false` | Center the dice in the tray |
| `redOne` | `true` | Draw the single pip of a one larger and in red |
| `emptyFace` | `'blank'` | `'blank'` draws no pips. `'index'` shows faces one to six in order |
| `rollDuration` | `900` | Milliseconds a throw tumbles. `0` lands at once |
| `rollInterval` | `80` | Milliseconds between face changes while tumbling |
| `labels` | `see below` | Text for screen readers |
| `onSelect` | `null` | `function (index, selected, selection) {}` |
| `onRoll` | `null` | `function (indexes) {}` when a throw starts |
| `onRolled` | `null` | `function (values, indexes) {}` when the dice land |

### Public API

```js
const inst = $('#el').data('__pluginDice');
inst.roll(indexes, values);
inst.isRolling();
inst.getValues();
inst.setValues(values);
inst.getState();
inst.setState(state);
inst.getSelected();
inst.getSelectedValues();
inst.clearSelection();
inst.setSelected(indexes);
inst.setSelectable(on);
inst.destroy();
```

### Events

`ts.dice.select`, `ts.dice.roll`, `ts.dice.rolled`

---

## Drawer

**File:** `themestrap.plugin.drawer.js`  
**jQuery method:** `$.fn.themestrapPluginDrawer`  
**Instance key:** `__pluginDrawer`  
**Guide:** [`docs/PluginDrawer.md`](docs/PluginDrawer.md)

An accessible panel that slides in from any edge of the screen: bottom (the default), top, left or right. It brings its own backdrop, locks page scroll, traps focus, closes on Escape, and bottom and top drawers can be dragged away by their handle.

### Markup

```html
<!-- Trigger, anywhere on the page -->
<button data-drawer-open="share-sheet">Share</button>

<!-- Drawer root -->
<div data-plugin-drawer id="share-sheet">
    <div data-drawer-backdrop></div>
    <div data-drawer-panel>
        <h2 data-drawer-title>Share this page</h2>
        <p data-drawer-description>Send a link or copy it.</p>

        <!-- content -->

        <button data-drawer-close>Cancel</button>
    </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `direction` | `'bottom'` | Edge the panel slides from: `'bottom'`, `'top'`, `'left'` or `'right'`. |
| `closeOnBackdrop` | `true` | Close when the backdrop is clicked. |
| `closeOnEscape` | `true` | Close on the Escape key. |
| `backdrop` | `true` | Make sure a `[data-drawer-backdrop]` exists, injecting one when missing. With `false` the backdrop is not wired at all (see Pitfalls). |
| `scrollLock` | `true` | Add `.ts-scroll-lock` to `<body>` while open. |
| `showHandle` | `true` | Inject a drag handle for bottom and top drawers. |
| `draggable` | `true` | Allow drag to dismiss from the handle. Needs a handle. |
| `dragThreshold` | `0.4` | Close when dragged further than this fraction of the panel's size. |
| `velocityThreshold` | `0.5` | Close when released faster than this, in px per ms. |
| `transitionDuration` | `320` | Milliseconds to wait before hiding after a close. Keep it equal to `--ts-drw-dur`. |
| `onOpen` | `null` | Called as the open transition starts. `this` is the instance; receives the root as a jQuery object. |
| `onClose` | `null` | Called after the close transition ends. Same arguments. |

### Public API

```js
const inst = $('#el').data('__pluginDrawer');
inst.open();
inst.close();
inst.toggle();
inst.destroy();
```

### Events

`drawer:open`, `drawer:close`

---

## FloatElement

**File:** `themestrap.plugin.floatelement.js`  
**jQuery method:** `$.fn.themestrapPluginFloatElement`  
**Instance key:** `__floatElement`  
**Guide:** [`docs/PluginFloatElement.md`](docs/PluginFloatElement.md)

Scroll-driven parallax translation with optional secondary transforms. Dependency-free — visibility is tracked with a native `IntersectionObserver` and the scroll handler feeds a `requestAnimationFrame` throttle so it never blocks input events.

### Markup

```html
<!-- 1. Markup -->
<div id="floating-card">
  Decorative content
</div>

<!-- 2. Scripts (after jQuery and themestrap.js) -->
<script src="js/components/themestrap.plugin.floatelement.js"></script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `speed` | `3` | Divisor applied to `scrollPercent` — larger values produce subtler movement |
| `horizontal` | `false` | Translate on the X axis instead of the Y axis |
| `invertDirection` | `false` | Flip the translation direction. Replaces the old `minus: '-'` pattern |
| `startPos` | `'top'` | CSS positioning preset for absolutely-placed elements: `'top'` sets `top: 0`, `'bottom'` sets `bottom: 0` and inverts the base direction, `'none'` applies no positioning |
| `minWindowWidth` | `991` | The plugin is inactive below this viewport width in px. Set to `0` to enable on all viewports |
| `opacity` | `false` | Interpolate CSS `opacity` across the scroll range, e.g. `[0, 1]` fades in, `[1, 0]` fades out |
| `scale` | `false` | Interpolate a `scale()` transform, e.g. `[1, 1.1]` |
| `rotate` | `false` | Interpolate a `rotate()` transform in degrees, e.g. `[0, 15]` |
| `skew` | `false` | Interpolate a `skewX()` transform in degrees, e.g. `[0, 8]` |
| `clamp` | `false` | Cap the absolute translation at ±N%. Prevents elements from drifting out of a bounded container |
| `transition` | `false` | Apply a CSS `transition` to smooth movement between scroll ticks. Useful for slow or stuttery scroll inputs |
| `transitionDuration` | `500` | Duration of the smoothing transition in ms. Keep this short (100–300 ms) to avoid lag |
| `transitionDelay` | `0` | Delay before the transition starts, in ms |
| `scrollDirection` | `'both'` | Gate transform updates by scroll direction: `'both'`, `'down'`, or `'up'`. The element freezes in place when scrolling against the specified direction |
| `respectReducedMotion` | `true` | Skip initialization entirely if the visitor has `prefers-reduced-motion: reduce` set. The element remains static |
| `isInsideSVG` | `false` | Applies a tighter `scrollPercent` factor (÷50 rather than ÷1) for child elements inside an SVG, where coordinate spaces are scaled |
| `style` | `null` | An arbitrary inline style string applied to the element before the plugin runs. Provided for legacy layout compatibility |
| `onMove` | `null` | Callback fired on every computed rAF tick. Receives `(scrollPct: number, transforms: object)`. See [onMove Callback](docs/PluginFloatElement.md#onmove-callback) |

---

## GDPR

**File:** `themestrap.plugin.gdpr.js`  
**jQuery method:** `$.fn.themestrapPluginGDPR`  
**Instance key:** `__gdpr`

Cookie consent bar with a preferences popup. Shows the bar after a configurable delay if the consent cookie is absent. Handles "Agree All", per-category preference checkboxes, and saves choices to `themestrap-gdpr-preferences` via jQuery Cookie. On preference change it re-initializes GDPRWrapper instances on the page. Provides a reset/clear button for testing.

### Markup

```html
<div id="gdpr-cookie-bar" data-plugin-gdpr>
  <p>We use cookies to improve your experience.</p>
  <button class="gdpr-agree-trigger">Accept All</button>
  <button class="gdpr-preferences-trigger">Manage Preferences</button>
</div>

<div class="gdpr-preferences-popup">
  <div class="gdpr-preferences-popup-content">
    <form class="gdpr-preferences-form">
      <input type="checkbox" class="gdpr-input" value="analytics"> Analytics
      <button type="submit">Save Preferences</button>
    </form>
    <button class="gdpr-close-popup">×</button>
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cookieBarShowDelay` | Number | `3000` | Delay in ms before showing the cookie bar. |
| `expires` | Number | `365` | Cookie expiry in days. |

---

## GDPRWrapper

**File:** `themestrap.plugin.gdprwrapper.js`  
**jQuery method:** `$.fn.themestrapPluginGDPRWrapper`  
**Instance key:** `__gdprwrapper`

Conditionally loads content via AJAX into an element based on the presence of a specific GDPR preference cookie value. If the required cookie category has been consented to, the `ajaxURL` response is injected into the wrapper. If not, the wrapper is still shown (presumably with a placeholder message).

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ajaxURL` | String | — | URL to fetch content from when consent is given. |
| `checkCookie` | String | — | Cookie value to check for (e.g., `'marketing'`). |

---

## Highlight

**File:** `themestrap.plugin.highlight.js`  
**jQuery method:** `$.fn.themestrapPluginHighlight`  
**Instance key:** `__highlight`

Wraps highlight.js core with lazy ESM dynamic imports, language aliases, promise coalescing (multiple blocks sharing a language fire only one `import()`), optional line numbers, line pre-highlighting via ranges, line selection/copy on mousedown drag, and a copy button. Supports a custom `modx` language grammar loaded from the Themestrap CDN. Light and dark themes are both embedded in the lazy-injected CSS.

### Markup

```html
<pre id="ex1"
     data-plugin-highlight="javascript"
     data-plugin-highlight-lines="3,7-9"
     data-plugin-options='{"lineNumbers": true, "showCopy": true}'><code>
    const greet = name => `Hello, ${name}!`;
</code></pre>
```

### Language Aliases

`js` → `javascript`, `ts` → `typescript`, `py` → `python`, `rb` → `ruby`, `cs` → `csharp`, `sh`/`shell` → `bash`, `yml` → `yaml`, `md` → `markdown`, `htm`/`html` → `xml`, `c++` → `cpp`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | String | `''` | highlight.js language ID or alias. Blank = plaintext. |
| `theme` | String | `'atom-one-dark'` | Color theme name (informational; CSS is self-contained). |
| `lineNumbers` | Boolean | `true` | Render line number column. |
| `showCopy` | Boolean | `true` | Render copy-to-clipboard button. |
| `copyTimeout` | Number | `800` | Delay in ms before reverting "Copied!" label. |

### init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginHighlight']) && $('[data-plugin-highlight]').length) {
    themestrap.fn.intObsInit('[data-plugin-highlight]:not(.manual)', 'themestrapPluginHighlight');
}
```

---

## HoverCard

**File:** `themestrap.plugin.hovercard.js`  
**jQuery method:** `$.fn.themestrapPluginHoverCard`  
**Instance key:** `__pluginHoverCard`  
**Guide:** [`docs/PluginHoverCard.md`](docs/PluginHoverCard.md)

A hover-triggered preview card that appears after a configurable delay, stays open while the cursor is inside it, auto-flips at viewport edges, and dispatches native events — zero dependencies beyond jQuery.

### Markup

```html
<span data-plugin-hovercard>
  <a data-hovercard-trigger href="/profile/daemon_devin">@daemon_devin</a>

  <div data-hovercard-content>
    <div class="hc-avatar">
      <img src="avatar.jpg" alt="daemon.devin">
    </div>
    <div class="hc-name">daemon.devin</div>
    <div class="hc-handle">@daemon_devin</div>
    <p class="hc-bio">Building Themestrap — a zero-build jQuery plugin ecosystem for MODX 3.</p>
    <hr class="hc-divider">
    <div class="hc-meta">
      <span>128 <span class="hc-meta-label">Following</span></span>
      <span>4.2k <span class="hc-meta-label">Followers</span></span>
    </div>
  </div>
</span>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `side` | `"bottom"` | Preferred side. `"top"` \| `"bottom"` \| `"left"` \| `"right"`. Auto-flips to the opposite side when the viewport has insufficient space. |
| `align` | `"start"` | Alignment along the chosen side axis. `"start"` \| `"center"` \| `"end"`. |
| `offset` | `12` | Gap in pixels between the trigger edge and the card. |
| `arrow` | `false` | Show a CSS triangle arrow pointing from the card toward the trigger. |
| `portaling` | `false` | Appends `[data-hovercard-content]` to `<body>` at init time. Escapes `overflow: hidden` ancestors and complex stacking contexts. The node is restored to its original parent on `destroy()`. |
| `delay` | `[200, 300]` | Open and close delays in milliseconds. A single number applies to both. An array `[openMs, closeMs]` sets them independently. |
| `animationDuration` | `180` | Safety timeout in ms used as a fallback if `animationend` never fires. |
| `ariaLabel` | `"Hover card"` | `aria-label` applied to the content panel (`role="group"`). Customize to reflect the card's purpose — `"User profile"`, `"Document preview"`, etc. |
| `onShow` | `null` | Callback fired after the card becomes visible. Called with the plugin instance as `this`. |
| `onHide` | `null` | Callback fired after the card is hidden. Same signature as `onShow`. |

### Events

`ts.hovercard.show`, `ts.hovercard.hide`

---

## HoverEffect

**File:** `themestrap.plugin.hovereffect.js`  
**jQuery method:** `$.fn.themestrapPluginHoverEffect`  
**Instance key:** `__hoverEffect`  
**Guide:** [`docs/PluginHoverEffect.md`](docs/PluginHoverEffect.md)

Pointer-driven hover effects with no dependencies: a magnetic pull toward the pointer, a 3D tilt, or both together, with an optional scale and a moving glare highlight. Motion is eased with `requestAnimationFrame` and springs back when the pointer leaves.

### Markup

```html
<!-- magnetic pull (the default) -->
<a href="#" class="btn btn-primary" data-plugin-hover-effect>Get started</a>

<!-- 3D tilt with glare -->
<div class="card" data-plugin-hover-effect
     data-plugin-options='{"effect": "3d", "glare": true, "scale": 1.03}'> ... </div>

<!-- tilt via the legacy class -->
<div class="hover-effect-3d"> ... </div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `effect` | `'magnetic'` | See the table above. |
| `magneticMx` | `0.15` | Horizontal pull as a fraction of the element's width at the far edge. `0.15` subtle, `0.3` moderate, `0.5` strong. |
| `magneticMy` | `0.30` | Vertical pull as a fraction of its height. |
| `magneticDeg` | `12` | Maximum tilt in degrees, used by the tilt effects. |
| `perspective` | `800` | Perspective in px for the tilt. `0` or `false` leaves it out. |
| `scale` | `1` | Scale while hovered (`1.04` lifts the element slightly). |
| `ease` | `0.15` | Fraction of the remaining distance covered each frame. Lower is smoother and slower; `1` is instant. |
| `glare` | `false` | Add the moving highlight. |
| `glareOpacity` | `0.20` | Strength of the highlight's center. |
| `glareSize` | `80` | Highlight radius as a percentage of the element. |
| `glareTransition` | `150` | Fade in and out time in ms. |
| `glareClass` | `'ts-hover-effect-glare'` | Class on the glare `<span>`. |
| `selector` | `'.thumb-info, .hover-effect-3d-wrapper'` | Left over from the hover3d version. Not used. |
| `sensitivity` | `20` | Left over from the hover3d version. Not used. |

### Public API

```js
const inst = $('#el').data('__hoverEffect');
inst.destroy();
inst.refresh();
```

---

## Icon

**File:** `themestrap.plugin.icon.js`  
**jQuery method:** `$.fn.themestrapPluginIcon`  
**Instance key:** `__icon`

Fetches an SVG file via AJAX, inlines it into the DOM (replacing the `<img>` tag), and optionally animates it with [Vivus](https://maxwallstudio.com/vivus) stroke or fill animation. Handles color assignment, fill vs. stroke-based animation, fade-in, and animated icon rendering inside carousels.

### Markup

```html
<img src="assets/icons/star.svg"
     data-icon
     data-plugin-options='{"animated": true, "color": "#0088cc", "strokeBased": true}'
     width="64">
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `color` | String | `'#2388ED'` | SVG fill/stroke color. |
| `animated` | Boolean | `false` | Animate the SVG with Vivus. |
| `delay` | Number | `300` | Delay before animation starts in ms. |
| `onlySVG` | Boolean | `false` | Skip Vivus; just inline the SVG. |
| `strokeBased` | Boolean | `false` | Use stroke animation instead of fill animation. |
| `removeClassAfterInit` | String/Boolean | `false` | Class to remove after init. |
| `fadeIn` | Boolean | `true` | Fade the SVG wrapper in after load. |
| `svgViewBox` | String | `''` | Override the SVG `viewBox` attribute. |
| `svgStyle` | String | `''` | Extra CSS string for SVG paths. |
| `extraClass` | String | `''` | Extra class on the SVG wrapper. |
| `accY` | Number | `0` | IntersectionObserver Y offset. |

---

## InViewportStyle

**File:** `themestrap.plugin.inviewportstyle.js`  
**jQuery method:** `$.fn.themestrapPluginInViewportStyle`  
**Instance key:** `__inviewportstyle`

Applies different CSS styles and classes to an element depending on whether it is inside or outside the viewport, using the IntersectionObserver API via the `observeElementInViewport` helper.

### Markup

```html
<div data-plugin-in-viewport-style
     data-plugin-options='{
       "styleIn": {"opacity": "1", "transform": "translateY(0)"},
       "styleOut": {"opacity": "0", "transform": "translateY(20px)"},
       "classIn": "visible",
       "classOut": "hidden"
     }'>
  Animated content
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `viewport` | Window | `window` | Viewport element for the observer. |
| `threshold` | Array | `[0]` | IntersectionObserver threshold values. |
| `modTop` | String | `'-200px'` | Top root margin modifier. |
| `modBottom` | String | `'-200px'` | Bottom root margin modifier. |
| `style` | Object | `{'transition': 'all 1s ease-in-out'}` | Initial CSS styles. |
| `styleIn` | Object/String | `''` | CSS to apply when in viewport. |
| `styleOut` | Object/String | `''` | CSS to apply when out of viewport. |
| `classIn` | String | `''` | Class to add when in viewport. |
| `classOut` | String | `''` | Class to add when out of viewport. |

---

## Lightbox

**File:** `themestrap.plugin.lightbox.js`  
**jQuery method:** `$.fn.themestrapPluginLightbox`  
**Instance key:** `__pluginLightbox`  
**Guide:** [`docs/PluginLightbox.md`](docs/PluginLightbox.md)

A zero-dependency, fully self-contained lightbox for the Themestrap framework. Supports images, HTML5 video, YouTube, Vimeo, and arbitrary iframes — with galleries, captions, keyboard and swipe navigation, and a complete programmatic API. No external libraries required beyond jQuery.

### Markup

```html
<a href="photo-large.jpg" data-plugin-lightbox>
  <img src="photo-thumb.jpg" alt="My photo">
</a>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `group` | `null` | Gallery group name. Also read from `data-lightbox-group` on the trigger. |
| `closeOnBackdrop` | `true` | Allow clicking the dark overlay to close. |
| `iframeWidth` | `853` | Default `<iframe>` width in pixels (YouTube, Vimeo, custom). |
| `iframeHeight` | `480` | Default `<iframe>` height in pixels. |
| `mediaWidth` | `null` | Override maximum image width in pixels. |
| `mediaHeight` | `null` | Override maximum image height in pixels. |
| `videoAutoplay` | `false` | Autoplay `<video>` elements when opened. |
| `onOpen` | `null` | Callback fired when the overlay opens. Receives `(item, index)`. |
| `onClose` | `null` | Callback fired when the overlay closes. No arguments. |
| `onItemLoad` | `null` | Callback fired when a media item finishes loading. Receives `(item, index)`. |

---

## LoadingOverlay

**File:** `themestrap.plugin.loadingoverlay.js`  
**jQuery method:** `$.fn.themestrapPluginLoadingOverlay`  
**Instance key:** `__pluginLoadingOverlay`  
**Guide:** [`docs/PluginLoadingOverlay.md`](docs/PluginLoadingOverlay.md)

Themestrap's full-element loading overlay plugin. It provides animated loading indicators, optional messages, progress bars, backdrop customization, blur effects, scroll locking, runtime controls, and automatic show/hide behavior.

### Markup

```html
<div id="panel">
    <h3>Loading Panel</h3>
    <div class="content">
        Content goes here...
    </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `type` | `'spinner'` | Controls the loading animation. |
| `message` | `''` | Text displayed beneath the loading animation. |
| `ariaLabel` | `'Loading'` | Accessibility label applied to the overlay. |
| `backdrop` | `null` | Sets the overlay's background color. |
| `color` | `null` | Controls the loader and message color. |
| `size` | `'md'` | Controls the loader size. |
| `duration` | `800` | Controls the animation cycle duration in milliseconds. |
| `fadeDuration` | `200` | Controls the overlay's fade-in and fade-out duration. |
| `blur` | `0` | Adds a backdrop blur effect. |
| `autoShow` | `false` | Automatically displays the overlay immediately after initialization. |
| `autoHide` | `0` | Automatically hides the overlay after the specified number of milliseconds. |
| `progress` | `false` | Enables the progress bar. |
| `progressValue` | `0` | Sets the initial progress percentage. |
| `scrollLock` | `true` | Controls whether body scrolling is prevented while a body-level overlay is visible. |
| `zIndex` | `9000` | Controls the overlay's stacking order. |

### Public API

```js
const inst = $('#el').data('__pluginLoadingOverlay');
inst.show();
inst.hide();
inst.toggle();
inst.isVisible();
inst.setMessage(message);
inst.setProgress(value);
inst.setType(type);
inst.setSize(size);
inst.setColor(color);
inst.setBackdrop(color);
inst.destroy();
```

### Events

`show.ts.loadingoverlay`, `shown.ts.loadingoverlay`, `hide.ts.loadingoverlay`, `hidden.ts.loadingoverlay`

---

## Lockscreen

**File:** `themestrap.plugin.lockscreen.js`  
**jQuery method:** `$.fn.themestrapPluginLockscreen`  
**Instance key:** `__pluginLockscreen`  
**Guide:** [`docs/PluginLockscreen.md`](docs/PluginLockscreen.md)

A full-viewport PIN lockscreen overlay. Covers the page with a blurred, dimmed backdrop, displays a live clock, optional avatar and user name, and embeds a **PluginOtp** input for PIN entry. Failed attempts are tracked against a configurable limit; exceeding it enters a timed blocked state. An idle timer can lock the screen automatically after a period of inactivity, with an optional countdown badge in the corner.

### Markup

```html
<div id="page-lock"></div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `pin` | `"0000"` | Expected PIN. Compared as plain strings. Change at runtime via `setPin()`. |
| `pinLength` | `4` | Number of OTP boxes rendered. Passed to PluginOtp. |
| `pinType` | `"numeric"` | `"numeric"` or `"alphanumeric"`. Passed to PluginOtp. |
| `name` | `""` | User display name shown below the avatar. First letter used as initials if no avatar image is provided. |
| `avatar` | `""` | URL to an avatar image. If absent, the first letter of `name` is rendered in the avatar circle. |
| `message` | `"Enter your PIN to continue"` | Body copy shown below the name. |
| `submitLabel` | `"Unlock"` | Label on the primary unlock button. |
| `clearLabel` | `"Clear"` | Label on the clear button. |
| `wrongPinMessage` | `"Incorrect PIN. Try again."` | Error shown in the OTP input on a failed attempt. |
| `shortPinMessage` | `"Please enter the full PIN."` | Error shown when the Unlock button is clicked before all boxes are filled. |
| `blockedMessage` | `"Too many incorrect attempts. Please wait."` | Copy shown in the blocked-state panel below the attempt dots. |
| `maxAttempts` | `5` | Maximum wrong-PIN attempts before the blocked state is entered. `0` = unlimited. |
| `blockDuration` | `30000` | Milliseconds to stay blocked after `maxAttempts` is reached. `0` = permanent until page reload. |
| `use24h` | `false` | Display the clock in 24-hour format. |
| `showClear` | `true` | Render a Clear button below the OTP input. |
| `otpSize` | `""` | Size modifier passed to PluginOtp. `""` · `"sm"` · `"lg"`. |
| `lockOnLoad` | `false` | Activate the lockscreen immediately when the plugin initializes. |
| `idleTimeout` | `0` | Seconds of inactivity (no mouse, keyboard, or touch events) before the screen locks automatically. `0` disables the watcher entirely. |
| `showIdleBadge` | `true` | Show a countdown pill fixed to the bottom-right corner of the viewport when the idle timer is active and 30 or fewer seconds remain. |

### Public API

```js
const inst = $('#el').data('__pluginLockscreen');
inst.lock();
inst.unlock();
inst.setPin(pin);
inst.isLocked();
inst.resetAttempts();
inst.destroy();
```

### Events

`ts.lockscreen.locked`, `ts.lockscreen.unlocked`, `ts.lockscreen.failed`, `ts.lockscreen.blocked`

---

## Markdown

**File:** `themestrap.plugin.markdown.js`  
**jQuery method:** `$.fn.themestrapPluginMarkdown`  
**Instance key:** `__pluginMarkdown`  
**Guide:** [`docs/PluginMarkdown.md`](docs/PluginMarkdown.md)

A fully self-contained GitHub Flavored Markdown renderer — no `marked.js`, no CDN, no build step. Add `data-plugin-markdown` to any element and the plugin parses its text content as GFM, or point `data-plugin-markdown-src` at a `.md` file URL and the plugin fetches and renders it. Tables, task-list checkboxes, fenced code blocks, reference links, strikethrough, and all standard inline formatting are handled by a bundled tokenizer — zero external dependencies at runtime.

### Markup

```html
<div data-plugin-markdown>
# Hello World

Some **bold** text, *italic*, and a [link](https://example.com).

- Item one
- [x] Completed task
- [ ] Pending task
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `src` | `""` | URL of a `.md` file to fetch and render. When empty the element's text content is rendered. Can also be set via `data-plugin-markdown-src`. |
| `breaks` | `false` | Convert single trailing newlines (two spaces or `\`) inside paragraphs to `<br>`. Mimics GitHub's "new lines as line breaks" option. |
| `sanitize` | `true` | Strip `<script>` tags and `on*` event attributes from rendered HTML. Enable for untrusted content, disable when rendering your own trusted Markdown that includes raw HTML pass-through. |
| `taskLists` | `true` | Render `- [x]` / `- [ ]` as disabled checkboxes inside `.ts-md-task-list`. When false, task-list lines render as plain list items. |
| `linkColor` | `""` | Override the link colour via `--ts-md-link`. Accepts any CSS colour value. Default: `#2ab8c8`. |
| `codeFont` | `""` | Override the code font stack via `--ts-md-code-font`. Default stack: JetBrains Mono -> Fira Code -> Courier New -> monospace. |
| `highlight` | `true` | Pass fenced code blocks to PluginHighlight after rendering. Silently no-ops if `$.fn.themestrapPluginHighlight` is not loaded. Set `false` to disable entirely. |
| `highlightOptions` | `{}` | Options forwarded to every PluginHighlight instance created for code blocks inside this Markdown element. The `language` key is set automatically from the `language-*` class and should not be set here. See the PluginHighlight guide for the full option list. |

### Public API

```js
const inst = $('#el').data('__pluginMarkdown');
inst.render(markdown);
inst.setSource(url);
inst.getHtml();
inst.destroy();
```

---

## MarkdownEditor

**File:** `themestrap.plugin.markdowneditor.js`  
**jQuery method:** `$.fn.themestrapPluginMarkdownEditor`  
**Instance key:** `__pluginMarkdownEditor`  
**Guide:** [`docs/PluginMarkdownEditor.md`](docs/PluginMarkdownEditor.md)

A distraction-free Markdown writing surface for Themestrap. It enhances a plain `<textarea>` with a **PluginToolbar**, smart typing (list and quote continuation, indentation, wrap toggles), image paste and drop upload, a live preview, a word count, and a fullscreen focus mode. The textarea stays the source of truth, so a normal form post keeps working and there is nothing to convert on save. No vendor dependencies.

### Markup

```html
<div class="ts-mdeditor ts-me-view-split">
    <div class="ts-toolbar">…</div>                       <!-- PluginToolbar -->
    <div class="ts-me-panes">
        <div class="ts-me-write"><textarea class="ts-me-input">…</textarea></div>
        <div class="ts-me-preview"><div class="ts-me-preview-body">…</div></div>
    </div>
    <div class="ts-me-status">…</div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `placeholder` | `'Write in Markdown…'` | Textarea placeholder |
| `ariaLabel` | `'Markdown editor'` | Accessible name when the textarea has none |
| `view` | `'write'` | `'write'`, `'split'`, or `'preview'` |
| `minHeight` | `420` | Height of the split and preview panes. Numbers are pixels. In write view the area grows with the text |
| `toolbar` | `see below` | Keys to show. `false` removes the toolbar |
| `toolbarOptions` | `{ ariaLabel: 'Markdown formatting', s…` | Passed to `themestrapPluginToolbar` |
| `preview` | `true` | `false` removes the preview pane and the view switcher |
| `renderer` | `null` | `function (markdown) {}` returning HTML or a Promise of HTML. Replaces PluginMarkdown |
| `sanitize` | `true` | Forwarded to PluginMarkdown |
| `breaks` | `false` | Forwarded to PluginMarkdown |
| `previewDelay` | `150` | Debounce in milliseconds before the preview refreshes |
| `syncScroll` | `true` | Keep write and preview aligned in split view |
| `autoGrow` | `true` | Write view grows with the text like a document |
| `tabSize` | `2` | Spaces used to indent list items |
| `statusBar` | `true` | Word count and reading time |
| `imageUpload` | `null` | `function (file) {}` returning a URL or a Promise of one. Enables paste, drop and the image picker |
| `disabled` | `false` | Start disabled |
| `onChange` | `null` | `function (markdown) {}`. `this` is the instance |

### Public API

```js
const inst = $('#el').data('__pluginMarkdownEditor');
inst.getValue();
inst.setValue(md, silent);
inst.getHtml();
inst.insert(text);
inst.wrap(before, after, hint);
inst.command(name);
inst.setView(view);
inst.getView();
inst.fullscreen(on);
inst.setStatus(msg);
inst.focus();
inst.destroy();
```

### Events

`ts.markdowneditor.change`, `ts.markdowneditor.save`, `ts.markdowneditor.view`, `ts.markdowneditor.upload`, `ts.markdowneditor.error`, `toolbar:button`, `toolbar:toggle`

---

## Masonry

**File:** `themestrap.plugin.masonry.js`  
**jQuery method:** `$.fn.themestrapPluginMasonry`  
**Instance key:** `__masonry`  
**Guide:** [`docs/PluginMasonry.md`](docs/PluginMasonry.md)

A fully self-contained Pinterest-style grid engine. Packs children into responsive columns using native absolute positioning — **no Isotope, no waitForImages, no external dependencies**. Images are waited on natively and a loader overlay is shown until the grid is fully settled.

### Markup

```html
<div data-plugin-masonry>
  <div>...card one...</div>
  <div>...card two...</div>
  <div>...card three...</div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `columns` | `3` | Column count when `responsive` is `false` (or a matching breakpoint has no `columns`). |
| `gutter` | `20` | Gap in pixels when `responsive` is `false` (or a matching breakpoint has no `gutter`). |
| `responsive` | `{0, 576, 768, 992, 1200}` | Breakpoint map — keys are minimum viewport widths; values are `{ columns, gutter }` objects. `false` turns it off. |
| `columnClass` | `''` | Extra class added to the container element on init. |

### Public API

```js
const inst = $('#el').data('__masonry');
inst.layout();
inst.appended($items);
inst.destroy();
```

---

## MatchHeight

**File:** `themestrap.plugin.matchheight.js`  
**jQuery method:** `$.fn.themestrapPluginMatchHeight`  
**Instance key:** `__matchHeight`

Sets all matched elements to the same height using the [jQuery Match Height](https://brm.io/jquery-match-height/) plugin.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `byRow` | Boolean | `true` | Match height per row, not globally. |
| `property` | String | `'height'` | CSS property to equalize (`'height'` or `'min-height'`). |
| `target` | jQuery | `null` | Match height to a specific target element. |
| `remove` | Boolean | `false` | Remove the plugin from the element. |

---

## Menubar

**File:** `themestrap.plugin.menubar.js`  
**jQuery method:** `$.fn.themestrapPluginMenubar`  
**Instance key:** `__pluginMenubar`  
**Guide:** [`docs/PluginMenubar.md`](docs/PluginMenubar.md)

An accessible menubar that provides top-level menus with dropdown panels, checkbox items, radio groups, nested sub-menus, and complete WAI-ARIA Menubar keyboard navigation; all driven by `data-*` attributes with zero external dependencies beyond jQuery.

### Markup

```html
<!-- 1. Markup -->
<div data-plugin-menubar>
  <div data-menubar-menu>
    <button data-menubar-trigger>File</button>
    <div data-menubar-content>
      <button data-menubar-item data-menubar-shortcut="⌘N">
        <span data-menubar-item-label>New Window</span>
      </button>
    </div>
  </div>
</div>

<!-- 2. Scripts (after jQuery + themestrap.js) -->
<script src="js/components/themestrap.plugin.menubar.js"></script>

<!-- 3. Init (or use init.js wiring below) -->
<script>
$('[data-plugin-menubar]').themestrapPluginMenubar();
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `subDelay` | `200` | ms hover delay before a sub-menu opens. |
| `subCloseDelay` | `120` | ms hover-out grace period before a sub-menu closes. |
| `animationDuration` | `150` | Duration of open/close opacity + transform transition. |
| `closeOnOutside` | `true` | Clicking outside the menubar closes the open panel. |
| `closeOnEscape` | `true` | `Escape` closes the open panel and returns focus to its trigger. |
| `loop` | `true` | Arrow key navigation wraps from last menu back to first and vice-versa. |
| `onOpen` | `null` | `(menuIndex, instance)` — called after a top-level menu opens. |
| `onClose` | `null` | `(menuIndex, instance)` — called after a top-level menu closes. |
| `onSelect` | `null` | `($item, payload, instance)` — called on any item activation. |

### Events

`menubar:open`, `menubar:close`, `menubar:select`

---

## ModuleLoader

**File:** `themestrap.plugin.moduleloader.js`  
**Namespace:** `themestrap.Loader`

A dependency-aware, lazy loader for JavaScript and CSS modules. Supports a module registry with named dependencies, route-based conditional loading, dev/prod mode (with minified vs. source paths), and a debug console. Used internally to load vendor libraries on demand.

### Usage

```js
const loader = new themestrap.Loader({
    basePath: '/assets/',
    mode: 'prod',
    debug: false
});

loader.register('myModule', {
    js:   ['vendor/mylib.min.js'],
    css:  ['vendor/mylib.min.css'],
    deps: ['anotherModule']
});

loader.load('myModule').then(() => {
    // myModule and its dependencies are loaded
});
```

---

## Nav

**File:** `themestrap.plugin.nav.js`  
**Namespace:** `themestrap.Nav`

The primary navigation singleton. Manages smooth-scroll anchor links within `#mainNav` and handles scroll behavior. Designed as a singleton—subsequent `initialize()` calls are no-ops.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | jQuery | `$('#mainNav')` | The primary nav container. |
| `scrollDelay` | Number | `600` | Smooth scroll duration in ms. |
| `scrollAnimation` | String | `'easeOutQuad'` | Easing function for smooth scroll. |

---

## Navbar

**File:** `themestrap.plugin.navbar.js`  
**jQuery method:** `$.fn.themestrapPluginNavbar`  
**Instance key:** `__navbar`

A sub-navigation bar that sits below the primary nav. Exposes a logo/title, link groups with optional dropdown menus, and an optional call-to-action. Auto-detects the current page link. Supports sticky behavior, light/dark palette, mobile breakpoints, and a hamburger mobile menu toggle.

### Markup

```html
<nav class="ts-navbar" data-plugin-navbar
     data-plugin-options='{"palette": "light", "sticky": true}'
     aria-label="Secondary">
  <!-- logo, links, CTA go here -->
</nav>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `palette` | String | `'light'` | `'light'` or `'dark'`. |
| `sticky` | Boolean | `true` | Pin to the top of the viewport on scroll. |
| `stickyOffset` | Number | `0` | px offset from the top when stuck. |
| `highlightCurrent` | Boolean | `true` | Auto-detect and highlight the current page link. |

---

## Navigation

**File:** `themestrap.plugin.navigation.js`  
**jQuery method:** `$.fn.themestrapPluginNavigation`  
**Instance key:** `__pluginNavigation`  
**Guide:** [`docs/PluginNavigation.md`](docs/PluginNavigation.md)

A single Themestrap plugin that unifies **PluginSideNav**, **PluginPanelNav**, and **PluginNavMenu** under one shared `data-nav-*` attribute namespace, one CSS token layer, and one jQuery bridge.

### Markup

```html
<nav data-plugin-navigation
     data-plugin-options='{"mode":"sidebar","showToggle":true}'>

  <div data-nav-header>
    <div data-nav-logo><i class="bi bi-layers-fill"></i></div>
    <span data-nav-title>My App</span>
  </div>

  <div data-nav-body>
    <div data-nav-section data-nav-section-title="Main">
      <ul data-nav-list>
        <li data-nav-item data-nav-active>
          <a href="/dashboard" data-nav-link>
            <i class="bi bi-house" data-nav-icon></i>
            <span data-nav-label>Dashboard</span>
            <span data-nav-badge>3</span>
          </a>
        </li>
        <li data-nav-item data-nav-has-children>
          <div data-nav-link>
            <i class="bi bi-gear" data-nav-icon></i>
            <span data-nav-label>Settings</span>
          </div>
          <ul data-nav-child-items>
            <li data-nav-item><a href="/settings/general" data-nav-link><span data-nav-label>General</span></a></li>
            <li data-nav-item><a href="/settings/api"     data-nav-link><span data-nav-label>API Keys</span></a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <div data-nav-footer>
    <ul data-nav-list>
      <li data-nav-item>
        <a href="/logout" data-nav-link>
          <i class="bi bi-box-arrow-right" data-nav-icon></i>
          <span data-nav-label>Sign Out</span>
        </a>
      </li>
    </ul>
  </div>
</nav>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `mode` | `"sidebar"` | Layout mode. `"sidebar"` \| `"panel"` \| `"megamenu"`. |
| `dark` | `false` | Apply dark colour scheme via `.ts-nav--dark`. |
| `compact` | `false` | Denser row spacing via `.ts-nav--compact`. |
| `bordered` | `false` | Wrap in a bordered card (panel mode most useful). |
| `duration` | `"240ms"` | CSS transition duration for drawers, width, and indicators. |
| `activeIndicator` | `"bar"` | Active-item indicator style. `"caret"` \| `"bar"` \| `"both"` \| `"none"`. |
| `accent` | `""` | Accent colour override. Any CSS `<color>`. Empty = theme default. |
| `activeOnLoad` | `true` | Match active leaf by comparing item hrefs to the current URL on load. |
| `fill` | `false` | Stretch to fill container height. Requires `[data-nav-body]`. |
| `width` | `"260px"` | Nav width (sidebar + panel). Any CSS length. |
| `indentStep` | `"1rem"` | Per-depth indent added to nested row `padding-left`. |
| `accordion` | `false` | Only one drawer open at a time. |
| `autoExpandActive` | `true` | Open ancestor drawers of pre-marked `[data-nav-active]` items on load. |
| `collapsed` | `false` | Start in icon-only rail mode. |
| `widthCollapsed` | `"64px"` | Width of the collapsed icon rail. |
| `showToggle` | `false` | Inject a collapse-toggle chevron button into the header. |
| `autoCollapse` | `false` | Collapse the sidebar when a leaf item is clicked. |
| `mobileBreakpoint` | `null` | Viewport width (px) below which the sidebar is treated as mobile. Null disables. |
| `collapseOnMobile` | `false` | Auto-collapse below `mobileBreakpoint`, expand above it. |
| `orientation` | `"horizontal"` | Layout axis. `"horizontal"` — triggers in a row, panels drop below. `"vertical"` — triggers stacked, panels appear to the right. |
| `openOn` | `"hover"` | What opens panels. `"hover"` uses a debounced mouseenter. `"click"` toggles on trigger click. |
| `delay` | `200` | Milliseconds after `mouseenter` before opening. |
| `closeDelay` | `150` | Milliseconds after `mouseleave` before closing. Allows mouse transit into panel. |
| `animationIn` | `"ts-nav-in"` | CSS class added when a panel opens. |
| `animationOut` | `"ts-nav-out"` | CSS class added when a panel closes. |
| `animationDuration` | `200` | Fallback timeout if `animationend` never fires. |
| `useViewport` | `false` | Move all content panels into `[data-nav-viewport]` for a shared animated container. |
| `closeOnEscape` | `true` | Press Esc to close the active panel. Focus returns to its trigger. |
| `closeOnOutside` | `true` | Click outside the nav (and viewport) to close the active panel. |
| `onOpen` | `null` | Callback after a panel opens. `fn(itemRecord, instance)`. |
| `onClose` | `null` | Callback after a panel closes. Same signature as `onOpen`. |
| `forceInit` | `true` | Skip IntersectionObserver — navigation is layout-critical and should init immediately. |
| `accY` | `0` | IntersectionObserver root-margin offset. Unused when `forceInit` is true. |

### Public API

```js
const inst = $('#el').data('__pluginNavigation');
inst.setActive($item);
inst.setSubActive($sub);
inst.getActive();
inst.refresh();
inst.destroy();
inst.collapse();
inst.expand();
inst.toggle();
inst.setCollapsed(bool);
inst.openGroup($item);
inst.closeGroup($item);
inst.toggleGroup($item);
inst.expandAll();
inst.collapseAll();
```

### Events

`sidebar.toggle.ts.navigation`, `drawer.toggle.ts.navigation`, `item.ts.navigation`, `panel.open.ts.navigation`, `panel.close.ts.navigation`

---

## NavMenu

**File:** `themestrap.plugin.navmenu.js`  
**jQuery method:** `$.fn.themestrapPluginNavMenu`  
**Instance key:** `__pluginNavmenu`

An accessible, animated mega-menu / navigation menu plugin. Supports horizontal and vertical orientations, hover or click open mode, configurable animation, nested sub-menus, and a full viewport-width mega panel. Includes IntersectionObserver-based lazy init.

### Markup

```html
<nav data-plugin-navmenu
     data-plugin-options='{"orientation": "horizontal", "openOn": "hover", "delay": 200}'>

  <div data-navmenu-item>
    <a href="/about" data-navmenu-link>About</a>
  </div>

  <div data-navmenu-item>
    <a href="#" data-navmenu-link>Services</a>
    <div data-navmenu-sub>
      <a href="/web">Web Design</a>
      <a href="/dev">Development</a>
    </div>
  </div>

</nav>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | String | `'horizontal'` | `'horizontal'` or `'vertical'`. |
| `openOn` | String | `'hover'` | `'hover'` or `'click'`. |
| `delay` | Number | `200` | Delay before opening sub-menu on hover in ms. |
| `closeDelay` | Number | `150` | Delay before closing on hover-out in ms. |
| `animationIn` | String | `'ts-navmenu-in'` | CSS class for sub-menu entrance. |
| `animationOut` | String | `'ts-navmenu-out'` | CSS class for sub-menu exit. |
| `animationDuration` | Number | `200` | Animation duration in ms. |
| `useViewport` | Boolean | `false` | Stretch mega-menu to full viewport width. |

---

## Newsletter

**File:** `themestrap.plugin.newsletter.js`  
**Namespace:** `themestrap.Newsletter`

A newsletter form singleton that validates and handles submission of `#newsletterForm` (configurable). Designed as a singleton—subsequent `initialize()` calls are no-ops.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | jQuery | `$('#newsletterForm')` | The newsletter form element. |

---

## NumberInput

**File:** `themestrap.plugin.numberinput.js`  
**jQuery method:** `$.fn.themestrapPluginNumberInput`  
**Instance key:** `__pluginNumberInput`  
**Guide:** [`docs/PluginNumberInput.md`](docs/PluginNumberInput.md)

Replaces the browser's tiny spin arrows with a proper stepper: minus and plus buttons that match your other inputs, hold-to-repeat, keyboard control, bounds, and an optional unit label. The original `<input type="number">` stays in the page and keeps the value, so forms, validation and code that reads the input keep working. No vendor dependencies.

### Markup

```html
<script src="js/components/themestrap.plugin.numberinput.js"></script>

<input type="number" name="per_page" value="8" min="1" max="50"
       data-plugin-numberinput
       data-plugin-options='{"unit": "posts"}'>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `min` | `null` | read from the min attribute when not given |
| `max` | `null` | Maximum value. Read from the `max` attribute when not given. |
| `step` | `from attribute, else `1` | Amount per press |
| `precision` | `from `step` | Decimals shown |
| `layout` | `'split'` | `'split'` or `'stacked'` |
| `size` | `'md'` | `'sm'`, `'md'` or `'lg'` |
| `block` | `false` | Fill the width of the parent |
| `unit` | `''` | Text shown after the value |
| `repeat` | `true` | Hold a button to repeat |
| `holdDelay` | `420` | Milliseconds before repeating starts |
| `holdInterval` | `90` | Milliseconds between repeats, speeding up |
| `holdMinInterval` | `25` | Fastest repeat rate |
| `wheel` | `false` | Mouse wheel changes the value while the field is focused |
| `snap` | `false` | Round typed values to a multiple of `step` |
| `labels` | `{ increase: 'Increase', decrease: 'Decrease' }` | Button names for screen readers |
| `onChange` | `null` | `function (value) {}` |

### Public API

```js
const inst = $('#el').data('__pluginNumberInput');
inst.getValue();
inst.setValue(v, silent);
inst.destroy();
```

### Events

`ts.numberinput.change`

---

## Otp

**File:** `themestrap.plugin.otp.js`  
**jQuery method:** `$.fn.themestrapPluginOtp`  
**Instance key:** `__pluginOtp`  
**Guide:** [`docs/PluginOtp.md`](docs/PluginOtp.md)

A digit-segmented one-time password and PIN input. Each character occupies its own styled box, advancing focus automatically as the user types and retreating on backspace. Supports numeric and alphanumeric modes, paste-to-fill, a mid-group separator, size variants, a light theme, and distinct error and valid states — including a shake animation triggered by `setError()`.

### Markup

```html
<div id="my-otp"></div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `length` | `6` | Number of individual input boxes rendered. |
| `type` | `"numeric"` | `"numeric"` — digits only, uses `type="tel"` and `inputmode="numeric"` for mobile. `"alphanumeric"` — accepts letters and digits. |
| `uppercase` | `false` | Forces alphanumeric input to uppercase as the user types. |
| `autoSubmit` | `false` | When `true`, dispatches `ts.otp.submit` immediately when all boxes are filled. |
| `separator` | `""` | Character rendered between the left and right halves (e.g. `"-"`). Only appears when `length` is even. |
| `label` | `""` | Text label rendered above the input group. |
| `hint` | `""` | Small helper text rendered below the input group. |
| `ariaLabel` | `"One-time code"` | `aria-label` placed on the wrapper `role="group"` element. |
| `size` | `""` | Box size modifier. `""` (default) · `"sm"` · `"lg"`. |
| `theme` | `""` | `""` (dark) · `"light"`. Light swaps the CSS variable set for use on bright backgrounds. |

### Public API

```js
const inst = $('#el').data('__pluginOtp');
inst.getValue();
inst.setValue(code);
inst.clear();
inst.focus();
inst.setError(message, shake?);
inst.setValid();
inst.disable(state);
inst.destroy();
```

### Events

`ts.otp.change`, `ts.otp.complete`, `ts.otp.submit`, `ts.otp.clear`

---

## PanelNav

**File:** `themestrap.plugin.panelnav.js`  
**jQuery method:** `$.fn.themestrapPluginPanelNav`  
**Instance key:** `__pluginPanelNav`  
**Guide:** [`docs/PluginPanelNav.md`](docs/PluginPanelNav.md)

Themestrap's vertical navigation panel. A list-group rail with a caret-right active indicator, expandable drawer-toggle parent sections, optional left icons and right-aligned metadata counts, section headings, and an actions header.

### Markup

```html
<nav data-plugin-panelnav
     data-plugin-options='{"activeIndicator":"caret"}'>

  <div data-panelnav-actions>
    <span data-panelnav-actions-title>My App</span>
  </div>

  <div data-panelnav-body>
    <div data-panelnav-section data-panelnav-section-title="Main">
      <ul data-panelnav-list>
        <li data-panelnav-item data-panelnav-active>
          <a href="/" data-panelnav-link>
            <i class="bi bi-house" data-panelnav-icon></i>
            <span data-panelnav-label>Dashboard</span>
            <span data-panelnav-metadata>24</span>
          </a>
        </li>

        <li data-panelnav-item data-panelnav-has-children>
          <a href="#" data-panelnav-link>
            <span data-panelnav-label>Settings</span>
          </a>
          <ul data-panelnav-child-items>
            <li data-panelnav-item><a href="/settings/general" data-panelnav-link>
              <span data-panelnav-label>General</span></a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `dark` | `false` | Dark color scheme. |
| `bordered` | `false` | Wrap the panel in a bordered, rounded card. |
| `compact` | `false` | Denser row spacing and smaller text. |
| `fill` | `false` | Full-height rail with an internal scroll body. Requires a `[data-panelnav-body]` wrapper. |
| `activeIndicator` | `'caret'` | One of `caret`, `bar`, `both`, `none`. |
| `accordion` | `false` | Only one drawer open at a time — opening a sibling closes the rest. |
| `autoExpandActive` | `true` | Open ancestor drawers of pre-marked active items on load. |
| `activeOnLoad` | `true` | Detect the active leaf from the current page URL on load. |
| `width` | `'280px'` | Panel width (any CSS length). |
| `indentStep` | `'1rem'` | Per-level indent applied to nested rows. |
| `duration` | `'240ms'` | Drawer + indicator transition duration. |
| `accent` | `''` | Accent color override. Empty inherits the theme primary. |
| `forceInit` | `true` | Skip IntersectionObserver — the rail is layout-critical, so init immediately. |
| `accY` | `0` | IntersectionObserver root margin offset, used by `dynIntObsInit` when `forceInit` is `false`. |

### Public API

```js
const inst = $('#el').data('__pluginPanelNav');
inst.open($item);
inst.close($item);
inst.toggle($item);
inst.expandAll();
inst.collapseAll();
inst.setActive($item);
inst.getActive();
inst.refresh();
inst.destroy();
```

### Events

`item.ts.panelnav`, `drawer-toggle.ts.panelnav`

---

## Parallax

**File:** `themestrap.plugin.parallax.js`  
**jQuery method:** `$.fn.themestrapPluginParallax`  
**Instance key:** `__parallax`  
**Guide:** [`docs/PluginParallax.md`](docs/PluginParallax.md)

Three scroll and pointer effects in one plugin: a background image that drifts or zooms as the section scrolls past, any CSS property scrubbed between two values by scroll position, and layers that shift with the mouse. Updates are throttled to one per animation frame, and no vendor library is needed.

### Markup

```html
<section data-plugin-parallax data-image-src="img/mountains.jpg"
         data-plugin-options='{"parallaxHeight": "160%"}'
         style="min-height: 60vh;">
    <div class="container py-5 text-white">
        <h2>Foreground content</h2>
    </div>
</section>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `speed` | `1.5` | Scale mode only: the image zooms to `1 + speed × 0.5`. It does not affect the translate effect. |
| `parallaxDirection` | `'top'` | Background mode: `'top'` moves the image up as the page scrolls down; `'bottom'` moves it down. |
| `parallaxHeight` | `'150%'` | Height of the image layer. The extra beyond 100% is how far it travels. |
| `imageSrc` | `null` | Background image URL. Wins over `data-image-src`. |
| `parallaxScale` | `false` | Zoom the image instead of moving it. |
| `parallaxScaleInvert` | `false` | Start zoomed in and zoom out. |
| `scrollableParallax` | `false` | Use scrub mode. |
| `cssProperty` | `'width'` | Scrub mode: the property to set, in JavaScript form (`'opacity'`, `'letterSpacing'`, `'width'`). |
| `cssValueStart` | `0` | Scrub mode: value at progress 0. |
| `cssValueEnd` | `100` | Scrub mode: value at progress 1. |
| `cssValueUnit` | `'%'` | Scrub mode: unit after the number. `''` for unitless properties. |
| `mouseParallax` | `false` | Use mouse mode. |

### Public API

```js
const inst = $('#el').data('__parallax');
inst.refresh();
inst.destroy();
```

### Events

`parallax:update`, `parallax:mouse`

---

## Particles

**File:** `themestrap.plugin.particles.js`  
**jQuery method:** `$.fn.themestrapPluginParticles`  
**Instance key:** `__pluginParticles`  
**Guide:** [`docs/PluginParticles.md`](docs/PluginParticles.md)

A canvas particle background for heroes, sections and cards: drifting dots that twinkle, link up into a network, react to the pointer, and scatter or multiply on click. It replaces particles.js with one dependency-free plugin that follows the Themestrap pattern.

### Markup

```html
<script src="js/components/themestrap.plugin.particles.js"></script>

<section class="hero" style="position: relative">
    <div data-plugin-particles
         data-plugin-options='{"density": 160, "color": "#0088cc"}'></div>
    <h1 style="position: relative">Welcome</h1>
</section>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `density` | `80` | Particles per 800 by 800 px of host |
| `count` | `null` | Fixed number of particles. Overrides `density` |
| `maxParticles` | `400` | Upper bound for density and for particles added by `push` or `burst()` |
| `color` | `'#0088cc'` | Any CSS color, or several picked at random |
| `shape` | `'circle'` | `'circle'` or `'square'` |
| `size` | `3` | Largest radius in px |
| `sizeRandom` | `true` | Radius between 15% and 100% of `size` |
| `opacity` | `0.8` | Largest opacity |
| `opacityRandom` | `true` | Opacity between 15% and 100% of `opacity` |
| `twinkle` | `{ enable: true, speed: 1, min: 0 }` | Fade particles in and out |
| `speed` | `0.6` | px per frame at 60 fps |
| `speedRandom` | `true` | Vary speed (and wobble a fixed direction) |
| `direction` | `'none'` | `'none'`, or `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `top-left` |
| `outMode` | `'out'` | `'out'` wraps around the edges, `'bounce'` bounces off them |
| `links` | `{…}` | Lines between close particles. `color` defaults to the first particle color |
| `hover` | `{…}` | `mode`: `'bubble'`, `'grab'`, `'repulse'` or `null` |
| `click` | `{ mode: 'repulse', distance: 220, strength: 9, count: 4 }` | `mode`: `'repulse'`, `'push'` or `null` |
| `fill` | `true` | Cover the nearest positioned ancestor |

### Public API

```js
const inst = $('#el').data('__pluginParticles');
inst.isPlaying();
inst.burst(x, y, count);
inst.setOptions(opts);
inst.refresh();
inst.destroy();
```

### Events

`ts.particles.ready`

---

## Popover

**File:** `themestrap.plugin.popover.js`  
**jQuery method:** `$.fn.themestrapPluginPopover`  
**Instance key:** `__pluginPopover`  
**Guide:** [`docs/PluginPopover.md`](docs/PluginPopover.md)

A click-to-open panel anchored to a trigger, with an arrow, side and alignment control, a flip when the trigger is near the viewport edge, Escape and click-outside closing, an optional focus trap, and a portal mode that escapes `overflow: hidden` containers. Only one popover is open at a time.

### Markup

```html
<div data-plugin-popover data-plugin-options='{"side": "bottom", "align": "start"}'>
    <button type="button" data-popover-trigger class="btn btn-light">Details</button>

    <div data-popover-content>
        <h4 data-popover-title class="h6">Shipping</h4>
        <p class="mb-0">Free over $50. Most orders arrive in 2 to 4 days.</p>
    </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `side` | `'bottom'` | `top`, `bottom`, `left` or `right`. Flips near the viewport edge (see Placement). |
| `align` | `'start'` | `start`, `center` or `end`, along the side. |
| `offset` | `8` | Gap in px between trigger and panel. |
| `arrow` | `true` | Draw the arrow. |
| `portaling` | `false` | Move the panel to `<body>` at init, to escape `overflow: hidden` and stacking contexts. |
| `closeOnEscape` | `true` | Escape closes and returns focus to the trigger. |
| `closeOnOutside` | `true` | A click outside the root, the panel and the trigger closes. |
| `animationIn` | `'ts-pop-in'` | Class played on open. The built-in animations slide from the side used. |
| `animationOut` | `'ts-pop-out'` | Class played on close. |
| `animationDuration` | `200` | Fallback in ms if `animationend` never fires. |
| `modal` | `false` | Trap Tab inside the panel and set `aria-modal="true"`. |
| `onOpen` | `null` | Called on open. `this` is the instance. |
| `onClose` | `null` | Called after closing. `this` is the instance. |

### Public API

```js
const inst = $('#el').data('__pluginPopover');
inst.open();
inst.close();
inst.toggle();
inst.update();
inst.destroy();
```

### Events

`popover:open`, `popover:close`

---

## PricingToggle

**File:** `themestrap.plugin.pricingtoggle.js`  
**jQuery method:** `$.fn.themestrapPluginPricingToggle`  
**Instance key:** `__pricingToggle`  
**Guide:** [`docs/PluginPricingToggle.md`](docs/PluginPricingToggle.md)

Drives a billing-period switcher (e.g. Monthly ↔ Annual) that animates a pill/thumb inside a track between two positions, broadcasts namespaced jQuery events so any number of page listeners can react (price spans, feature lists, badge visibility), and exposes a clean programmatic API with full ARIA semantics. Integrates with PluginCounter so animated price figures recount when the period switches, and fires CSS custom-property updates on the host element so pure-CSS themes can react without any JavaScript of their own.

### Markup

```html
<div data-plugin-pricingtoggle>
  <span data-pt-label-primary>Monthly</span>

  <button data-pt-track aria-pressed="false" type="button">
    <span data-pt-thumb></span>
  </button>

  <span data-pt-label-secondary>
    Annual
    <span data-pt-savings-badge>−20%</span>
  </span>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `initialState` | `null` | Starting state: `'primary'` or `'secondary'`. When `null`, the plugin reads `aria-pressed` from `[data-pt-track]`; `"true"` → secondary, anything else → primary. |
| `activeClass` | `'is-secondary'` | Class added to the wrapper element and the active label on every state change. Useful hook for external CSS. |
| `group` | `null` | Scope key for price updates. Null = update all `[data-pt-price]` elements that have no `data-pt-group`. A string value = update only elements whose `data-pt-group` matches. |
| `animatePrices` | `true` | Crossfade `[data-pt-price]` elements by toggling `.pt-fading` (opacity 0), updating the text, then removing the class. |
| `priceFadeDuration` | `160` | Duration of the price crossfade in milliseconds. Applied as `--pt-price-duration`. |
| `duration` | `250` | Thumb slide and label colour transition duration in milliseconds. Applied as `--pt-duration`. |
| `trackWidth` | `'44px'` | Switch track width, any CSS length. |
| `trackHeight` | `'24px'` | Switch track height. |
| `thumbSize` | `'18px'` | Diameter of the sliding thumb. |
| `thumbInset` | `'3px'` | Gap between the thumb and the track edge. |
| `trackColor` | `--pt-track-bg` | Track background |
| `thumbColor` | `--pt-thumb-bg` | Thumb fill |
| `labelMutedColor` | `--pt-label-muted` | Inactive label text |
| `labelActiveColor` | `--pt-label-active` | Active label text |
| `badgeBg` | `--pt-badge-bg` | Savings badge background |
| `badgeColor` | `--pt-badge-color` | Savings badge text |
| `ariaLabelPrimary` | `'Switch to annual billing'` | `aria-label` set on `[data-pt-track]` when in primary state |
| `ariaLabelSecondary` | `'Switch to monthly billing'` | `aria-label` set on `[data-pt-track]` when in secondary state |
| `onChange` | `null` | Called on every state change after DOM updates. Signature: `function(state, instance)`. Equivalent to listening for `ts-pricingtoggle-changed` but co-located with the init options. |

### Public API

```js
const inst = $('#el').data('__pricingToggle');
inst.setState(state);
inst.toggle();
inst.getState();
inst.destroy();
```

---

## ProgressBar

**File:** `themestrap.plugin.progressbar.js`  
**jQuery method:** `$.fn.themestrapPluginProgressBar`  
**Instance key:** `__pluginProgressBar`  
**Guide:** [`docs/PluginProgressBar.md`](docs/PluginProgressBar.md)

Animated progress bars that fill when they scroll into view. Nine color variants, stripes, animated stripes, an indeterminate loading state, five heights and an optional counting label. The plugin builds its own markup and styles, so no Bootstrap progress CSS is needed.

### Markup

```html
<div class="ts-progress ts-progress--lg" role="progressbar"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="75">
    <div class="ts-progress-track">
        <div class="ts-progress-fill ts-progress-fill--success"
             style="width: 75%; transition: width 1200ms cubic-bezier(0.4, 0, 0.2, 1);">
            <span class="ts-progress-label">75%</span>
        </div>
    </div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `value` | `0` | Fill percentage, clamped to 0–100. |
| `color` | `'primary'` | `primary`, `secondary`, `tertiary`, `quaternary`, `success`, `warning`, `danger`, `info` or `dark`. |
| `striped` | `false` | Diagonal stripes on the fill. |
| `animated` | `false` | Moving stripes. Turns `striped` on. |
| `indeterminate` | `false` | An endless sweep for work of unknown length. `value`, `label` and `set()` are ignored. |
| `label` | `false` | Show the value inside the fill. Needs `size: 'lg'` to be readable (see Pitfalls). |
| `labelFormat` | `'{value}%'` | Label text. `{value}` becomes the rounded number. |
| `duration` | `1200` | Fill transition in ms, also used by the label count. |
| `easing` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing for the fill. |
| `size` | `''` | Height: `''` or `md` 8 px, `xs` 3 px, `sm` 5 px, `lg` 16 px. |
| `rounded` | `true` | Pill ends. `false` gives square corners. |
| `forceInit` | `false` | With `dynIntObsInit`: initialize at once instead of on scroll. |
| `accY` | `0` | With `dynIntObsInit`: bottom root margin in px for the observer. `0` means the default 200 px. |

### Public API

```js
const inst = $('#el').data('__pluginProgressBar');
inst.set(value);
inst.get();
inst.reset();
inst.destroy();
inst.set();
```

### Events

`progressbar:change`, `progressbar:complete`

---

## RandomImages

**File:** `themestrap.plugin.randomimages.js`  
**jQuery method:** `$.fn.themestrapPluginRandomImages`  
**Instance key:** `__randomImages`

Cycles through a list of image URLs on a timer, animating between them with entrance/exit animation classes. Works in two modes: a single `<img>` that rotates from a provided URL list, or a wrapper that shuffles all child `<img>` elements' sources. Supports lightbox href updates, stopping after a fixed number of cycles, and stopping at a specific image index.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minWindowWidth` | Number | `0` | Minimum viewport width to activate. |
| `random` | Boolean | `true` | Randomize image order. |
| `imagesListURL` | Array | `null` | Array of image URL strings (required for single-image mode). |
| `lightboxImagesListURL` | Array | `null` | Array of lightbox href URLs (synced with image rotation). |
| `delay` | Number | `null` | Rotation interval in ms (default: 3000). |
| `animateIn` | String | `'fadeIn'` | Animate.css class for incoming image. |
| `animateOut` | String | `'fadeOut'` | Animate.css class for outgoing image. |
| `stopAtImageIndex` | Number/Boolean | `false` | Stop cycling at this array index. |
| `stopAfterFewSeconds` | Number/Boolean | `false` | Stop after this many ms. |
| `stopAfterXTimes` | Number/Boolean | `false` | Stop after this many cycles. |

---

## Rating

**File:** `themestrap.plugin.rating.js`  
**jQuery method:** `$.fn.themestrapPluginRating`  
**Instance key:** `__rating`  
**Guide:** [`docs/PluginRating.md`](docs/PluginRating.md)

A star rating, or a rating with any icon you like. It shows fractional values with a partial fill, highlights icons as the pointer sweeps across them, can be cleared, and reports every change through a callback.

### Markup

```html
<div class="rating rating-md" data-plugin-rating
     data-plugin-options='{"initialRating": 4}'></div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `icon` | `'fa-solid fa-star'` | What each icon is. Inline SVG starting with `<svg`; any other markup starting with `<` (wrapped in `<span class="icon">`); or a class string for an `<i>`, from any icon font. Font Awesome class strings also get the `fa-{size}` modifier. |
| `currentColor` | `false` | For SVG icons: rewrite every `fill` and `stroke` (other than `none`) to `currentColor`, so CSS colors apply. |
| `initialRating` | `0` | Starting value. Fractions show a partial icon. |
| `interactive` | `true` | `false` makes the rating read-only: hovers and clicks are ignored and the wrapper gets `.disabled`. `enable()` and `disable()` switch it later. |
| `maxRating` | `5` | How many icons to generate. |
| `clearable` | `'auto'` | `true`: clicking the current value clears it. `false`: never. `'auto'`: only when there is a single icon (a favorite toggle). |
| `size` | `'md'` | `xs`, `sm`, `md`, `lg` or `xl`. Overridden by a `rating-*` class on the wrapper. |
| `onRate` | `no-op` | Called on every non-silent change. `this` is the wrapper element; the argument is the new rating. |

### Public API

```js
const inst = $('#el').data('__rating');
inst.setRating(rating, silent);
inst.getRating();
inst.clearRating();
inst.disable();
inst.enable();
inst.destroy();
```

---

## ReadMore

**File:** `themestrap.plugin.readmore.js`  
**jQuery method:** `$.fn.themestrapPluginReadMore`  
**Instance key:** `__readmore`

Truncates content to a max height and reveals a "Read More / Read Less" toggle button with an animated overlay gradient. Supports configurable overlay color, toggle labels, max height, and enable/disable of the toggle.

### Markup

```html
<div data-plugin-readmore
     data-plugin-options='{"maxHeight": 150, "overlayColor": "#fff"}'>
  <p>Long content here...</p>
  <div class="readmore-button-wrapper d-none">
    <a href="#">Read More</a>
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `buttonOpenLabel` | String | `'Read More <i class="fas fa-chevron-down…">'` | "Expand" button label (HTML). |
| `buttonCloseLabel` | String | `'Read Less <i class="fas fa-chevron-up…">'` | "Collapse" button label (HTML). |
| `enableToggle` | Boolean | `true` | Allow re-collapsing after expanding. |
| `maxHeight` | Number | `110` | Collapsed height in px. |
| `overlayColor` | String | `'#FFF'` | CSS color for the fade overlay gradient. |
| `overlayHeight` | Number | `100` | Height of the overlay gradient in px. |
| `startOpened` | Boolean | `false` | Start in the expanded state. |
| `align` | String | `'left'` | Button alignment: `'left'`, `'center'`, `'end'`. |

---

## RevolutionSlider

**File:** `themestrap.plugin.revolutionslider.js`  
**jQuery method:** `$.fn.themestrapPluginRevolutionSlider`  
**Instance key:** `__revolution`

Initializes and configures a [Revolution Slider](https://www.themepunch.com/revslider-doc/) instance. Handles single-slide detection (disables bullets), fullscreen layout, and optional add-on initialization for: Typewriter, Whiteboard, Particles, Countdown, Slicey, Filmstrip, Before/After, Panorama, Revealer, Duotone, Bubblemorph, and Distortion effects.

All standard Revolution Slider options and add-on options are configurable via `data-plugin-options`.

---

## RichEditor

**File:** `themestrap.plugin.richeditor.js`  
**jQuery method:** `$.fn.themestrapPluginRichEditor`  
**Instance key:** `__pluginRichEditor`  
**Guide:** [`docs/PluginRichEditor.md`](docs/PluginRichEditor.md)

A lightweight `contenteditable` rich-text editor for Themestrap. **PluginToolbar** renders the formatting controls, **PluginDialog** owns the link dialog, and the editor itself adds selection handling, safe URL normalization, plain-text paste, and light/dark theming. No vendor dependencies.

### Markup

```html
<div data-plugin-richeditor class="ts-richeditor ts-re-focused">
    <div class="ts-toolbar">…</div>                      <!-- PluginToolbar -->
    <div class="ts-re-content" contenteditable="true"
         role="textbox" aria-multiline="true"
         aria-label="Rich text editor" data-placeholder="Write your message…"></div>
</div>

<!-- appended to <body> so it can escape overflow and stacking contexts -->
<div data-plugin-dialog id="ts-re-dlg-1">…</div>         <!-- PluginDialog -->
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `placeholder` | `'Write your message…'` | Shown while the editor is empty. Also written to `aria-placeholder`. |
| `ariaLabel` | `'Rich text editor'` | Accessible name of the editable area. |
| `minHeight` | `'220px'` | Minimum height. Numbers are treated as pixels. |
| `maxHeight` | `null` | Maximum height. The area scrolls beyond it. |
| `toolbar` | `['bold', 'italic', 'underline', 'stri…` | Commands to show. `false` renders no toolbar and builds no link dialog. |
| `toolbarOptions` | `{ ariaLabel: 'Text formatting', size: 'sm', full: true }` | Passed to `themestrapPluginToolbar`. |
| `dialogOptions` | `{ animationIn: 'zoomIn', animationOut…` | Passed to `themestrapPluginDialog`. |
| `linkTarget` | `'_blank'` | `target` written to links you create or edit. Also sets `rel="noopener noreferrer"`. Use `''` to write neither. |
| `allowedProtocols` | `['http','https','mailto','tel']` | Schemes accepted by the link dialog. |
| `pastePlainText` | `true` | Strip formatting from pasted content. |
| `markdownShortcuts` | `false` | Convert Markdown typed in the editor. See above. |
| `statusBar` | `false` | Word count and reading time under the editor. |
| `imageUpload` | `null` | `function (file) {}` returning a URL or a Promise of one. Enables image paste, drop and file picking. Only `http` and `https` results are accepted. |
| `renderer` | `null` | `function (markdown) {}` returning HTML. Replaces PluginMarkdown in `setMarkdown()`. |
| `disabled` | `false` | Start in the disabled state. |
| `onChange` | `null` | `function (html) {}` called on every edit. `this` is the instance. |
| `onFocus` | `null` | `function () {}`. `this` is the instance. |
| `onBlur` | `null` | `function () {}`. `this` is the instance. |

### Public API

```js
const inst = $('#el').data('__pluginRichEditor');
inst.getContent();
inst.getText();
inst.setContent(html);
inst.getMarkdown();
inst.setMarkdown(md);
inst.getWordCount();
inst.setStatus(msg);
inst.isEmpty();
inst.clear();
inst.focus();
inst.enable();
inst.disable();
inst.destroy();
```

### Events

`ts.richeditor.change`, `ts.richeditor.focus`, `ts.richeditor.blur`, `ts.richeditor.save`, `ts.richeditor.upload`, `ts.richeditor.error`, `toolbar:toggle`, `toolbar:button`

---

## Scrollable

> [!NOTE]
> This plugin is no longer in `js/components/`. Use PluginScrollbar (`themestrap.plugin.scrollbar.js`), a dependency-free custom scrollbar. See [Scrollbar](#scrollbar).

---

## Scrollbar

**File:** `themestrap.plugin.scrollbar.js`  
**jQuery method:** `$.fn.themestrapPluginScrollbar`  
**Instance key:** `__scrollbar`  
**Guide:** [`docs/PluginScrollbar.md`](docs/PluginScrollbar.md)

A self-contained Themestrap scrollbar plugin with zero vendor JS dependencies — mouse wheel, pointer drag, touch momentum, and keyboard navigation are all implemented from scratch using native browser APIs.

### Markup

```html
<div data-plugin-scrollbar style="height: 300px; overflow: hidden;">
  ...content...
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `forceInit` | `true` | Skip the IntersectionObserver and init immediately. Set `false` for panels that start well below the fold. |
| `axis` | `'y'` | Scroll axis. `'y'` vertical, `'x'` horizontal, `'yx'` both. |
| `theme` | `'light'` | Visual theme name. See [Themes](docs/PluginScrollbar.md#themes). With `darkModeTheme` set, this is the theme for light pages. |
| `darkModeTheme` | `null` | Theme to use while the page is dark. The scrollbar then switches between `theme` and `darkModeTheme` by itself. See [Light and Dark Pages](docs/PluginScrollbar.md#light-and-dark-pages). |
| `scrollInertia` | `950` | Easing animation duration in ms. `0` = instant jump, no animation. |
| `autoDraggerLength` | `true` | Size the thumb proportionally to the content/viewport ratio. `false` uses the CSS `height`/`width` minimum. |
| `autoHideScrollbar` | `false` | Fade the scrollbar out when idle; fade in on hover or scroll activity. |
| `alwaysShowScrollbar` | `0` | `0` on hover/scroll only · `1` always visible · `2` always show track, hide thumb when nothing to scroll. |
| `scrollbarPosition` | `'inside'` | `'inside'` renders the track within the element. `'outside'` renders it outside — the parent must allow `overflow: visible`. |
| `snapAmount` | `0` | Snap scroll position to multiples of this pixel value. `0` = disabled. |
| `snapOffset` | `0` | Shift the snap grid by this many pixels. |
| `mouseWheel` | `{…}` | `{ enable, scrollAmount, axis, preventDefault, invert }`. `scrollAmount` is px per notch or `'auto'`. |
| `keyboard` | `{…}` | `{ enable }`: arrow keys, Page Up/Down, Home and End scroll the content. |
| `scrollButtons` | `{…}` | `{ enable, … }`: clickable arrow buttons on the track. |
| `callbacks` | `{…}` | Hooks for scroll start, scrolling, scroll end and reaching either edge. See the guide for names. |

### Public API

```js
const inst = $('#el').data('__scrollbar');
inst.update();
inst.scrollTo(target [, opts]);
inst.stop();
inst.disable([resetScroll]);
inst.enable();
inst.setTheme(theme [, darkModeTheme]);
inst.getTheme();
inst.destroy();
```

---

## Scroller

**File:** `themestrap.plugin.scroller.js`  
**jQuery method:** `$.fn.themestrapPluginScroller`  
**Instance key:** `__pluginScroller`

A native, dependency-free custom scrollbar. Wraps element content in a hidden-native-scrollbar viewport and renders a themable track and draggable thumb on top. Unlike PluginScrollable (which delegates to nanoScroller), this plugin implements all scrollbar geometry, dragging, track-paging, and auto-hide behavior internally.

### Markup

```html
<div data-plugin-scroller
     data-plugin-options='{"height": 300, "alwaysVisible": false}'
     style="height: 300px">
  <p>Long content…</p>
</div>
```

Customize appearance with CSS custom properties:

```css
.ts-scroller {
  --ts-scroller-size:        8px;
  --ts-scroller-thumb:       rgba(10, 25, 41, 0.28);
  --ts-scroller-thumb-hover: rgba(10, 25, 41, 0.5);
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alwaysVisible` | Boolean | `false` | Keep scrollbar permanently visible. |
| `flashDelay` | Number | `1200` | How long (ms) the bar stays visible after scrolling. |
| `sliderMinHeight` | Number | `30` | Minimum thumb height in px. |
| `sliderMaxHeight` | Number/null | `null` | Maximum thumb height (null = no cap). |
| `preventPageScrolling` | Boolean | `false` | Stop wheel events bubbling at scroll boundaries. |
| `tabIndex` | Number/null | `0` | `tabindex` on the viewport for keyboard scrolling. |
| `height` | Number/String/null | `null` | Fixed wrapper height (number = px or CSS length string). |
| `maxHeight` | Number/String/null | `null` | Max viewport height; wrapper grows up to this value. |
| `isEnabled` | Boolean | `true` | Set `false` to keep instance alive but hide the scrollbar. |
| `contentClass` | String | `'ts-scroller__content'` | Class for the scroll viewport. |
| `paneClass` | String | `'ts-scroller__bar'` | Class for the track. |
| `sliderClass` | String | `'ts-scroller__thumb'` | Class for the thumb. |

### Public API

```js
const scroller = $('#panel').data('__pluginScroller');
scroller.scrollTo(200);          // scroll to 200px
scroller.scrollTo('bottom', true); // smooth scroll to bottom
scroller.scrollTop();             // scroll to top
scroller.scrollBottom();          // scroll to bottom
scroller.setEnabled(false);       // disable without destroying
scroller.update();                // recalculate geometry
scroller.destroy();               // teardown
```

---

## ScrollFx

**File:** `themestrap.plugin.scrollfx.js`  
**jQuery method:** `$.fn.themestrapPluginScrollFx`  
**Instance key:** `__scrollFx`

Animates CSS custom property values (or `data-theme` toggling) as an element scrolls through the viewport. Uses IntersectionObserver to attach/detach scroll listeners for performance. Values are interpolated linearly between a start and end value over a configurable scroll range. Respects `prefers-reduced-motion`.

### Markup

```html
<!-- Single effect: opacity from 0 to 1 between 0% and 80% scroll progress -->
<div data-scroll-fx="opacity, 0, 1, 0, 80">
  Fades in on scroll
</div>

<!-- Multiple effects stacked -->
<div data-scroll-fx-1="translateY, 50px, 0px, 0, 60"
     data-scroll-fx-2="opacity, 0, 1, 0, 60">
  Slides and fades in
</div>
```

The `data-scroll-fx` attribute format is: `property, startValue, endValue, startProgress%, endProgress%`.

Supported shorthand properties (normalized to CSS custom properties internally): `opacity`, `translateX`, `translateY`, `rotate`, `scale`, `skew`, `blur`, `brightness`, and theme name strings for dark/light toggling.

---

## ScrollShadow

**File:** `themestrap.plugin.scrollshadow.js`  
**jQuery method:** `$.fn.themestrapPluginScrollShadow`  
**Instance key:** `__pluginScrollShadow`

Adds CSS mask-image gradient "shadow" indicators to the edges of a scrollable container to signal that more content exists in that direction. Pure CSS/JS—no images or box shadows. Supports vertical, horizontal, and bi-directional scroll axes.

### Markup

```html
<div data-plugin-scroll-shadow
     data-plugin-options='{"orientation": "vertical", "size": "40px"}'>
  <ul>
    <li>Item 1</li>
    <!-- many more items -->
  </ul>
</div>
```

Customize with CSS custom properties:

```css
.ts-scroll-shadow {
  --ts-ss-size:  40px;  /* feather size */
  --ts-ss-color: black; /* mask color — always use a named color, not rgba */
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | String | `'vertical'` | `'vertical'`, `'horizontal'`, or `'both'`. |
| `size` | String | `'40px'` | Shadow feather size (any CSS length). |
| `color` | String | `'black'` | Mask color. Always use a named color for mask-image. |
| `offset` | Number | `2` | Pixel dead zone before shadows appear. |
| `isEnabled` | Boolean | `true` | Set `false` to disable without destroying. |

### Public API

```js
const shadow = $('#list').data('__pluginScrollShadow');
shadow.update();           // force recalculation
shadow.setEnabled(false);  // disable without destroying
shadow.destroy();
```

---

## ScrollSpy

**File:** `themestrap.plugin.scrollspy.js`  
**jQuery method:** `$.fn.themestrapPluginScrollSpy`  
**Instance key:** `__scrollSpy`

Watches section elements as they scroll into the viewport and highlights the corresponding nav link with an `active` class. Uses IntersectionObserver with configurable root margins per section (via `data-spy-offset`).

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | String | `'#header'` | Selector for the nav element containing the links to highlight. |

---

## ScrollToTop

**File:** `themestrap.plugin.scrolltotop.js`  
**Namespace:** `themestrap.PluginScrollToTop`

Injects a "scroll to top" button into the page that appears after the user scrolls past a configurable offset and smoothly scrolls back to the top on click.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | jQuery | `$('body')` | Container to append the button to. |
| `offset` | Number | `150` | Scroll distance (px) before the button appears. |
| `buttonClass` | String | `'scroll-to-top'` | CSS class on the button. |
| `buttonAriaLabel` | String | `'Scroll To Top'` | Accessibility label. |
| `iconClass` | String | `'fas fa-chevron-up'` | Icon class inside the button. |
| `delay` | Number | `1000` | Scroll animation duration in ms. |
| `visibleMobile` | Boolean | `false` | Show button on mobile. |
| `label` | String/Boolean | `false` | Optional text label next to the icon. |
| `easing` | String | `'easeOutBack'` | jQuery UI easing function. |

---

## Search

**File:** `themestrap.plugin.search.js`  
**Namespace:** `themestrap.Search`

A header search form singleton. Validates `#searchForm` using jQuery Validate and manages a reveal/hide toggle for `.header-nav-features-search-reveal` elements. Designed as a singleton.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | jQuery | `$('#searchForm')` | The search form element. |

---

## SectionScroll

**File:** `themestrap.plugin.sectionscroll.js`  
**jQuery method:** `$.fn.themestrapPluginSectionScroll`  
**Instance key:** `__sectionScroll`

Full-page scroll: each `.section` element fills the viewport height and transitions between them on mousewheel or touch. Handles header logo/color changes per section, dots navigation, URL hash updates, scrollable tall sections, and mobile fallback to native scroll.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetClass` | String | `'.section'` | Selector for section elements. |
| `dotsNav` | Boolean | `true` | Render dot navigation. |
| `changeHeaderLogo` | Boolean | `true` | Swap header logo image on section change. |
| `headerLogoDark` | String | `'img/logo-default-slim.png'` | Logo path for dark header. |
| `headerLogoLight` | String | `'img/logo-default-slim-dark.png'` | Logo path for light header. |

Per-section data attributes: `data-section-scroll-header-color` (`'light'` or `'dark'`) and `data-section-scroll-title` (for dots nav).

---

## Select

**File:** `themestrap.plugin.select.js`  
**jQuery method:** `$.fn.themestrapPluginSelect`  
**Instance key:** `__pluginSelect`  
**Guide:** [`docs/PluginSelect.md`](docs/PluginSelect.md)

A custom select component that replaces the browser's native `<select>` with a fully styled, fully accessible dropdown while keeping the original element in the DOM for form submission and browser autofill compatibility.

### Markup

```html
<div data-plugin-select>
  <select name="timezone">
    <option value="">Select a timezone…</option>
    <option value="utc">UTC</option>
    <option value="est">Eastern (EST / EDT)</option>
    <option value="pst">Pacific (PST / PDT)</option>
  </select>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `placeholder` | `'Select an option…'` | Placeholder text shown when no value is selected. Overridden automatically by the text of the first `<option value="">`. |
| `disabled` | `false` | Initialize the select in a disabled state. Overridden automatically if the native `<select>` carries the `disabled` attribute. |

### Public API

```js
const inst = $('#el').data('__pluginSelect');
inst.open();
inst.close();
inst.select(value);
inst.getValue();
inst.setValue(value);
inst.reset();
inst.enable();
inst.disable();
inst.destroy();
inst.setValue();
```

---

## SideNav

**File:** `themestrap.plugin.sidenav.js`  
**jQuery method:** `$.fn.themestrapPluginSideNav`  
**Instance key:** `__pluginSideNav`

A full-featured collapsible sidebar navigation with header/body/footer slots, grouped items with expandable sub-items (animated height), icon columns, badges, chevrons, CSS tooltips in collapsed state, auto-active detection from the current URL, and optional responsive collapse at a configurable breakpoint. Self-contained CSS with light and dark themes driven by CSS custom properties.

### Markup

```html
<aside data-plugin-side-nav
       data-plugin-options='{"collapsed": false, "showToggle": true, "activeOnLoad": true}'>

  <div data-sidenav-header>
    <span data-sidenav-logo><i class="fas fa-bolt"></i></span>
    <span data-sidenav-title>MyApp</span>
    <button data-sidenav-toggle>☰</button>
  </div>

  <div data-sidenav-body>
    <div data-sidenav-group data-sidenav-group-title="Main">
      <a href="/dashboard" data-sidenav-item data-sidenav-active>
        <span data-sidenav-icon><i class="fas fa-home"></i></span>
        <span data-sidenav-label>Dashboard</span>
      </a>
      <div data-sidenav-item data-sidenav-has-children>
        <span data-sidenav-icon><i class="fas fa-cog"></i></span>
        <span data-sidenav-label>Settings</span>
        <div data-sidenav-sub-items>
          <a href="/settings/profile" data-sidenav-sub-item>Profile</a>
          <a href="/settings/billing" data-sidenav-sub-item>Billing</a>
        </div>
      </div>
    </div>
  </div>

  <div data-sidenav-footer>
    <!-- footer items -->
  </div>
</aside>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsed` | Boolean | `false` | Start in icon-only mode. |
| `dark` | Boolean | `false` | Use dark color scheme. |
| `width` | String | `'260px'` | Expanded width (any CSS length). |
| `widthCollapsed` | String | `'64px'` | Collapsed width. |
| `duration` | String | `'250ms'` | CSS transition duration for width and sub-nav. |
| `showToggle` | Boolean | `false` | Inject the built-in collapse toggle button. |
| `activeOnLoad` | Boolean | `true` | Auto-detect active item from current URL. |
| `autoCollapse` | Boolean | `false` | Collapse when a leaf item is clicked. |
| `mobileBreakpoint` | Number/null | `null` | Width (px) below which sidebar is treated as mobile. |
| `collapseOnMobile` | Boolean | `false` | Auto-collapse below `mobileBreakpoint`. |
| `forceInit` | Boolean | `true` | Bypass IntersectionObserver (sidebar is layout-critical). |

### Events

| Event | Arguments | Description |
|-------|-----------|-------------|
| `toggle.ts.sidenav` | `({collapsed})` | After collapse/expand. |
| `item.ts.sidenav` | `({$item, href})` | After top-level item click. |
| `subitem.ts.sidenav` | `({$item, href})` | After sub-item click. |
| `group-toggle.ts.sidenav` | `({$item, open})` | After group expand/collapse. |

### Public API

```js
const nav = $('#mySidebar').data('__pluginSideNav');
nav.collapse();          // collapse to icon mode
nav.expand();            // expand to full width
nav.toggle();            // toggle
nav.setCollapsed(true);  // programmatic
nav.openGroup($item);    // open a group
nav.closeGroup($item);   // close a group
nav.getActive();         // returns {item, subItem}
nav.setActive($item);    // mark an item active
nav.setSubActive($sub);  // mark a sub-item active
nav.refresh();           // destroy and re-init
nav.destroy();           // teardown
```

---

## Sort

**File:** `themestrap.plugin.sort.js`  
**jQuery method:** `$.fn.themestrapPluginSort`  
**Instance key:** `__sort`  
**Guide:** [`docs/PluginSort.md`](docs/PluginSort.md)

Filter buttons and a grid that rearranges itself. Clicking a filter shows the matching items and packs them into a masonry layout, with optional live text search, URL hash sync, a loading state and RTL support. The layout engine is built in; Isotope is no longer needed.

### Markup

```html
<!-- filters (the source) -->
<ul class="nav nav-pills sort-source" data-plugin-sort data-sort-id="portfolio"
    data-plugin-options='{"useHash": false}'>
    <li class="nav-item active" data-option-value="*"><a class="nav-link" href="#">All</a></li>
    <li class="nav-item" data-option-value=".web"><a class="nav-link" href="#">Web</a></li>
    <li class="nav-item" data-option-value=".print"><a class="nav-link" href="#">Print</a></li>
</ul>

<!-- the grid (the destination) -->
<div class="row sort-destination" data-sort-id="portfolio">
    <div class="col-sm-6 col-lg-4 isotope-item web"><img src="p1.jpg" alt="Landing page" class="img-fluid"></div>
    <div class="col-sm-6 col-lg-4 isotope-item print"><img src="p2.jpg" alt="Poster" class="img-fluid"></div>
    <div class="col-sm-6 col-lg-4 isotope-item web print"><img src="p3.jpg" alt="Brand kit" class="img-fluid"></div>
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `useHash` | `true` | Write the active filter to the URL hash (`#web` for `.web`) and apply the hash on load and on `hashchange`. |
| `itemSelector` | `'.isotope-item'` | Selects the grid items. |
| `layoutMode` | `'masonry'` | `masonry` (absolute columns) or `fitRows` (your CSS does the layout). |
| `filter` | `'*'` | The current filter. Updated by `setFilter()`. |
| `filterFieldId` | `false` | Id (without `#`) of a text field for live search. |
| `filterFieldText` | `''` | The current search text. Updated as the reader types. |
| `hiddenStyle` | `{ opacity: 0 }` | CSS applied to items being hidden. |
| `visibleStyle` | `{ opacity: 1 }` | CSS applied to items being shown. |
| `stagger` | `30` | Extra `transition-delay` in ms per item, so items move one after another. `0` moves them together. |
| `isOriginLeft` | `true`, or `false` when `<html dir="rtl">` | Fill columns from the left. `false` fills from the right. |

### Public API

```js
const inst = $('#el').data('__sort');
inst.setFilter(filter);
inst.destroy();
```

---

## SplashScreen

**File:** `themestrap.plugin.splashscreen.js`  
**jQuery method:** `$.fn.themestrapPluginSplashScreen`  
**Instance key:** `__splashScreen`  
**Guide:** [`docs/PluginSplashScreen.md`](docs/PluginSplashScreen.md)

Asset-preloading splash screen plugin. It loads JavaScript and CSS assets before completing initialization, optionally caches those assets using `StorageBin`, supports concurrent downloads, reports loading progress, executes the downloaded assets, and can display an animated Three.js ribbon background.

### Markup

```html
<div id="loading-progress"></div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `files` | `[]` | Files to preload |
| `threads` | `1` | Maximum concurrent XHR downloads |
| `fresh` | `false` | Clears the Splash Screen cache before loading |
| `ribbon` | `false` | Enables the Three.js ribbon background |
| `progressBar` | `null` | Existing `PluginProgressBar` instance |
| `debug` | `false` | Enables console debugging |
| `cacheBackend` | `'localStorage'` | StorageBin backend |
| `onSuccess` | `null` | Called after all files load and execute |
| `onError` | `null` | Called when a file fails |
| `onLoaded` | `null` | Called after each file completes |

### Public API

```js
const inst = $('#el').data('__splashScreen');
inst.getFile(path);
inst.destroy();
```

---

## Sticky

**File:** `themestrap.plugin.sticky.js`  
**jQuery method:** `$.fn.themestrapPluginSticky`  
**Instance key:** `__sticky`

Makes any element sticky using the [jQuery Pin](https://webpop.github.io/jquery.pin/) plugin. Recalculates on resize, supports a transparent sticky variant, optional logo `src` swap on activation/deactivation, and sticky-effect entry at a configurable scroll offset.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minWidth` | Number | `991` | Minimum viewport width to activate sticky behavior. |
| `activeClass` | String | `'sticky-active'` | Class applied when stickied. |
| `stickyStartEffectAt` | Number | — | Scroll offset at which `sticky-effect-active` class is added. |

---

## StickyHeader

**File:** `themestrap.plugin.stickyheader.js`  
**Namespace:** `themestrap.StickyHeader`

The primary header sticky behavior singleton. Manages header shrink/reveal animations, logo swapping on sticky activation, mobile disable, boxed layout support, scroll-direction class toggling, and Notice Top Bar integration. Designed as a singleton.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stickyEnabled` | Boolean | `true` | Enable sticky behavior. |
| `stickyEnableOnMobile` | Boolean | `false` | Enable on mobile viewports. |
| `stickyEnableOnBoxed` | Boolean | `true` | Enable when `<html>` has the `.boxed` class. |
| `stickyStartAt` | Number | `0` | Scroll distance (px) before sticky activates. |
| `stickySetTop` | Number | `0` | `top` value when sticky is active. |
| `stickyEffect` | String | `''` | `'shrink'` or `'reveal'`. |
| `stickyChangeLogo` | Boolean | `false` | Swap logo image on activation. |
| `stickyScrollUp` | Boolean | `false` | Add scroll-direction classes. |

---

## TagsInput

**File:** `themestrap.plugin.tagsinput.js`  
**jQuery method:** `$.fn.themestrapPluginTagsInput`  
**Instance key:** `__tagsinput`  
**Guide:** [`docs/PluginTagsInput.md`](docs/PluginTagsInput.md)

A zero dependency tag and recipient field for Themestrap. It wraps a plain `<input type="text">`, renders each committed value as a removable chip, validates entries as email addresses by default, and keeps the original input in sync as a comma separated string so ordinary form posts keep working.

### Markup

```html
<input type="text" class="ts-tagsinput-source" ...>      <!-- hidden, keeps the value -->
<div class="ts-tagsinput" role="group" aria-label="Email addresses">
    <span class="ts-tagsinput-tags">
        <span class="ts-tag">ada@example.com <button type="button" class="ts-tag-remove" aria-label="Remove">&times;</button></span>
    </span>
    <input type="text" class="ts-tagsinput-field" aria-label="Add address">
</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `placeholder` | `'Add address...'` | Placeholder on the inner text field. Falsy values remove it. |
| `validateEmail` | `true` | Rejects any entry that does not match `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Set `false` for free form tags. |
| `separators` | `',;\n\t'` | The characters that end a tag when text is pasted, dropped or otherwise inserted: here a comma, semicolon, newline and tab. A comma always counts, because the source input stores the tags comma separated. `''` leaves only the comma. |
| `splitOnSpace` | `'auto'` | Also split on whitespace. `'auto'` follows `validateEmail`: addresses never contain spaces so they split on them, keywords often do so they do not. |
| `maxTags` | `0` | The most tags allowed. `0` is no limit. Extra entries are skipped with the reason `'max'`, and the field shakes. |
| `ignoreCase` | `false` | Treat `Web` and `web` as the same tag. The first spelling wins. |
| `normalize` | `null` | `function (text) { return text; }`, runs on every entry before it is checked. Use it to strip characters or collapse spaces so the chips show what your server will keep. |
| `messages` | `{ added: '%n added', skipped: '%n skipped' }` | What a screen reader hears after a paste. `%n` is the count. |

### Public API

```js
const inst = $('#el').data('__tagsinput');
inst.addTag(text, silent?);
inst.addTags(text, silent?);
inst.removeTag(text);
inst.getTags();
inst.clearTags();
inst.destroy();
```

### Events

`ts.tagsinput.add`, `ts.tagsinput.remove`, `ts.tagsinput.paste`

---

## TimePicker

**File:** `themestrap.plugin.timepicker.js`  
**jQuery method:** `$.fn.themestrapPluginTimePicker`  
**Instance key:** `__pluginTimePicker`  
**Guide:** [`docs/PluginTimePicker.md`](docs/PluginTimePicker.md)

A time field with a popover of scrollable hour, minute and AM/PM columns, built to sit beside `PluginCalendar`. You can also type: `8:30pm`, `830`, `20.30` and `9` are all understood. The original input stays in the page (hidden) and always holds the value as 24 hour `HH:mm`, whatever format is displayed, so forms and server code see one consistent format. No vendor dependencies.

### Markup

```html
<script src="js/components/themestrap.plugin.timepicker.js"></script>

<label for="publish_time">Publish time</label>
<input type="text" id="publish_time" name="publish_time" value="08:30"
       data-plugin-timepicker
       data-plugin-options='{"format": "12", "minuteStep": 5}'>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `'auto'` | `'12'`, `'24'`, or `'auto'` to follow the locale |
| `locale` | `''` | Locale used by `'auto'` |
| `minuteStep` | `5` | Minutes between entries in the popover (1 to 30) |
| `defaultTime` | `'09:00'` | Used for the parts you have not chosen yet, when the field is empty |
| `placeholder` | `'Time'` | Shown when empty |
| `ariaLabel` | `'Time'` | Field name when there is no label |
| `block` | `false` | Fill the width of the parent |
| `inline` | `false` | Show the columns in the page instead of a popover |
| `showNow` | `true` | A "Now" link |
| `openOnClick` | `true` | Clicking the field opens the popover |
| `labels` | `choose, hours, minutes, period, am, pm, now, done` | Text, for translation |
| `onChange` | `null` | `function (value) {}` with the `HH:mm` value |

### Public API

```js
const inst = $('#el').data('__pluginTimePicker');
inst.getValue();
inst.getTime();
inst.setValue(v, silent);
inst.setNow(source);
inst.destroy();
```

---

## Toast

**File:** `themestrap.plugin.toast.js`  
**jQuery method:** `$.fn.themestrapPluginToast`  
**Instance key:** `__toast`  
**Static factory:** `themestrap.PluginToast.show(opts)`

Bootstrap 5 toast notifications with type-based SVG icons, colored headers, optional countdown progress bar, hover-pause, and a lazy position-container registry. Nine positions supported (`top-start`, `top-center`, `top-end`, `middle-*`, `bottom-*`). Empty position containers are removed automatically on hide.

### Programmatic Usage

```js
// Fire-and-forget (most common usage)
themestrap.PluginToast.show({
    title:    'Saved!',
    body:     'Your changes have been saved.',
    type:     'success',
    position: 'top-end',
    delay:    4000
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | `'Notification'` | Toast header title. |
| `body` | String | `''` | Toast body content (HTML). |
| `type` | String | `'info'` | `'success'`, `'danger'`, `'warning'`, `'info'`, `'dark'`, `'light'`. |
| `position` | String | `'top-end'` | `{top\|middle\|bottom}-{start\|center\|end}`. |
| `autohide` | Boolean | `true` | Auto-dismiss the toast. |
| `delay` | Number | `4000` | Auto-dismiss delay in ms. |
| `dismissible` | Boolean | `true` | Show the close (×) button. |
| `progress` | Boolean | `true` | Show a countdown progress bar (requires `autohide`). |
| `timestamp` | String/null | `null` | Text shown in header right (e.g. `'just now'`). |
| `icon` | String/null | `null` | Custom image `src`; falls back to the type's SVG icon. |
| `onShown` | Function/null | `null` | Callback after the toast is visible. |
| `onHidden` | Function/null | `null` | Callback after the toast is removed. |

### Public API

```js
const toast = $('#myToastAnchor').data('__toast');
toast.hide();     // dismiss immediately
toast.dispose();  // remove and destroy Bootstrap instance
```

---

## Toggle

**File:** `themestrap.plugin.toggle.js`  
**jQuery method:** `$.fn.themestrapPluginToggle`  
**Instance key:** `__toggle`

Accordion-style toggle lists. Each `.toggle` item in the wrapper has a `label` or `.toggle-title` that expands/collapses a `.toggle-content` panel with a `slideDown`/`slideUp` animation. Optionally runs in accordion mode (only one item open at a time).

### Markup

```html
<div data-plugin-toggle
     data-plugin-options='{"isAccordion": true}'>
  <div class="toggle">
    <label>Question 1</label>
    <div class="toggle-content">Answer 1</div>
  </div>
  <div class="toggle active">
    <label>Question 2</label>
    <div class="toggle-content">Answer 2 (starts open)</div>
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | Number | `350` | Toggle animation duration in ms. |
| `isAccordion` | Boolean | `false` | Close other items when one opens. |

---

## Toolbar

**File:** `themestrap.plugin.toolbar.js`  
**jQuery method:** `$.fn.themestrapPluginToolbar`  
**Instance key:** `__pluginToolbar`  
**Guide:** [`docs/PluginToolbar.md`](docs/PluginToolbar.md)

An accessible toolbar that provides a `role="toolbar"` container with roving-tabindex keyboard navigation, `type="single"` and `type="multiple"` toggle groups, separator elements, link items, RTL support, size modifiers, and a dark theme — all driven by `data-*` attributes with zero external dependencies beyond jQuery.

### Markup

```html
<!-- 1. Markup -->
<div data-plugin-toolbar aria-label="Document actions">

  <button data-toolbar-button data-toolbar-value="save">Save</button>
  <button data-toolbar-button data-toolbar-value="export">Export</button>

  <div data-toolbar-separator></div>

  <div data-toolbar-toggle-group data-toolbar-type="single">
    <button data-toolbar-toggle-item data-toolbar-value="left"  data-toolbar-pressed="true">Left</button>
    <button data-toolbar-toggle-item data-toolbar-value="center">Center</button>
    <button data-toolbar-toggle-item data-toolbar-value="right">Right</button>
  </div>

</div>

<!-- 2. Scripts (after jQuery + themestrap.js) -->
<script src="js/components/themestrap.plugin.toolbar.js"></script>

<!-- 3. Init (or let init.js handle it automatically) -->
<script>
$('[data-plugin-toolbar]').themestrapPluginToolbar();
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `orientation` | `"horizontal"` | `"horizontal"` or `"vertical"`. Controls arrow-key axis and separator direction. |
| `loop` | `true` | Arrow-key navigation wraps at the edges of the toolbar. |
| `dir` | `"ltr"` | `"ltr"` or `"rtl"`. Flips ← → mapping so arrow keys feel natural in right-to-left layouts. |
| `ariaLabel` | `"Toolbar"` | Written to `aria-label` only when the element has none already. |
| `size` | `null` | `null`, `"sm"`, or `"lg"`. Adds `.ts-toolbar--sm` / `.ts-toolbar--lg`. |
| `dark` | `false` | Forces the dark colour scheme. Equivalent to adding `.ts-toolbar--dark` in markup. |
| `full` | `false` | Stretches the toolbar to 100% width with item wrapping. |
| `allowDeselect` | `false` | In `type="single"` groups, allow clicking the active item to clear the selection. |
| `onToggle` | `null` | `fn(value, pressed, groupEl)` — called after a toggle item changes state. |
| `onButton` | `null` | `fn(value, buttonEl)` — called when a regular button is clicked. |
| `onLink` | `null` | `fn(value, linkEl)` — called when a link item is clicked. |

### Public API

```js
const inst = $('#el').data('__pluginToolbar');
inst.getValues(groupOrSelector?);
inst.setValue(value, groupOrSelector?);
inst.setValues(values[], groupOrSelector?);
inst.clearGroup(groupOrSelector?);
inst.disable(selectorOrValue);
inst.enable(selectorOrValue);
inst.focus();
inst.destroy();
```

### Events

`toolbar:toggle`, `toolbar:button`, `toolbar:link`

---

## Tooltip

**File:** `themestrap.plugin.tooltip.js`  
**jQuery method:** `$.fn.themestrapPluginTooltip`  
**Instance key:** `__pluginTooltip`  
**Guide:** [`docs/PluginTooltip.md`](docs/PluginTooltip.md)

Small text labels that appear next to an element on hover, keyboard focus or tap. They are positioned with JavaScript, flip to the other side when there is no room, stay inside the viewport, and are linked to their trigger for screen readers.

### Markup

```html
<button data-plugin-tooltip="Save your work before continuing.">Save</button>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `content` | `''` | The tooltip text. Falls back to the `data-plugin-tooltip` value. |
| `type` | `'default'` | Color variant: `default`, `primary`, `secondary`, `tertiary`, `quaternary`, `dark`, `light`, `success`, `warning`, `danger`, `info`. |
| `location` | `'top'` | Preferred side: `top`, `bottom`, `left` or `right`. Flips when there is no room. |
| `offset` | `8` | Gap in px between the trigger and the tooltip. |
| `arrow` | `true` | Draw the pointing arrow. |
| `html` | `false` | Insert `content` as HTML instead of text. Only use with content you control. |
| `maxWidth` | `260` | Maximum width. A number is px; a string is any CSS length (`'20rem'`). |
| `delay` | `[100, 0]` | `[show, hide]` delays in ms. A single number is used for both. |
| `onShow` | `null` | Called after the tooltip shows. `this` is the instance. |
| `onHide` | `null` | Called after it hides. `this` is the instance. |

### Public API

```js
const inst = $('#el').data('__pluginTooltip');
inst.show();
inst.hide();
inst.toggle();
inst.update();
inst.setContent(content);
inst.destroy();
```

### Events

`tooltip:show`, `tooltip:hide`

---

## Tree

**File:** `themestrap.plugin.tree.js`  
**jQuery method:** `$.fn.themestrapPluginTree`  
**Instance key:** `__pluginTree`  
**Guide:** [`docs/PluginTree.md`](docs/PluginTree.md)

A self-contained jQuery tree widget with no external dependencies — JSON or inline HTML data sources, animated expand/collapse, single/multi-select, cascading checkboxes, full keyboard navigation, and fuzzy search, all in one file.

### Markup

```html
<div id="my-tree"></div>

<script>
const tree = $('#my-tree').themestrapPluginTree({
    data: [
        { id: 'home', text: 'Home' },
        {
            id: 'docs', text: 'Documentation',
            state: { opened: true },
            children: [
                { id: 'guide',  text: 'Getting Started' },
                { id: 'api',    text: 'API Reference'   }
            ]
        }
    ]
})[0];
</script>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `data` | `null` | JSON node array. `null` means read from existing `<ul>` inside the wrapper. |
| `openAll` | `false` | Expand all folder nodes immediately on init, without animation. |
| `checkbox` | `false` | Render a checkbox on every node. Clicking a parent cascades to all descendants; parent state reflects children (checked / indeterminate / unchecked). |
| `multiSelect` | `true` | When `false`, selecting a node clears all previous selections first. |
| `animation` | `200` | jQuery `slideDown`/`slideUp` duration in milliseconds. Set to `0` to disable animation entirely. |
| `icons` | `{…}` | `{ leaf, folder }`: HTML for leaf and folder icons. `null` uses the built-in ones. |
| `search` | `{…}` | `{ enabled, placeholder, fuzzy, openFound }`: adds a filter box above the tree. |
| `onSelect` | `null` | Callback invoked after a node is selected. Receives `(nodeData, $li)`. |
| `onDeselect` | `null` | Callback invoked after a node is deselected. Receives `(nodeData, $li)`. |
| `onOpen` | `null` | Callback invoked after a folder is opened. Receives `(nodeData, $li)`. |
| `onClose` | `null` | Callback invoked after a folder is closed. Receives `(nodeData, $li)`. |

### Public API

```js
const inst = $('#el').data('__pluginTree');
inst.open(ref);
inst.close(ref);
inst.toggle(ref);
inst.openAll();
inst.closeAll();
inst.select(ref);
inst.deselect(ref);
inst.deselectAll();
inst.getSelected();
inst.search(term);
inst.destroy();
```

### Events

`ts.tree.select`, `ts.tree.deselect`, `ts.tree.open`, `ts.tree.close`, `ts.tree.search`

---

## Validation

**File:** `themestrap.plugin.validation.js`  
**Namespace:** `themestrap.PluginValidation`

Initializes [jQuery Validate](https://jqueryvalidation.org/) on all `.needs-validation` forms with Bootstrap 5-compatible `is-invalid`/`is-valid` classes, `has-danger`/`has-success` parent classes, and correct error placement for radio/checkbox groups.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `formClass` | String | `'needs-validation'` | CSS class on forms to validate. |
| `validator.highlight` | Function | (adds Bootstrap classes) | Override jQuery Validate's `highlight` behavior. |
| `validator.success` | Function | (removes Bootstrap classes) | Override jQuery Validate's `success` behavior. |
| `validator.errorPlacement` | Function | (handles radio/checkbox) | Override error element placement. |

---

## VerticalNav

**File:** `themestrap.plugin.verticalnav.js`  
**jQuery method:** `$.fn.themestrapPluginVerticalNav`  
**Instance key:** `__verticalNav`

A collapsible sidebar navigation with a light/dark variant, icon-only mini mode, expandable nav groups with animated children, auto-active detection from the current URL, Bootstrap 5 tooltips in mini mode, and a hamburger-to-arrow animated toggle button. Differs from SideNav in design system and markup approach.

### Markup

```html
<nav data-plugin-vertical-nav
     data-plugin-options='{"collapsed": false, "activeTracking": true}'
     class="ts-vertical-nav">

  <div class="ts-vn-header">
    <span class="ts-vn-brand">App Name</span>
  </div>

  <div class="ts-vn-body">
    <span class="ts-vn-section-label">Main</span>

    <a href="/dashboard" class="ts-vn-link active">
      <span class="ts-vn-icon"><i class="fas fa-home"></i></span>
      <span class="ts-vn-text">Dashboard</span>
    </a>

    <div class="ts-vn-group">
      <button class="ts-vn-group-trigger">
        <span class="ts-vn-icon"><i class="fas fa-cog"></i></span>
        <span class="ts-vn-text">Settings</span>
      </button>
      <div class="ts-vn-group-children">
        <a href="/settings/profile" class="ts-vn-link">Profile</a>
      </div>
    </div>

    <div class="ts-vn-divider"></div>
  </div>

</nav>
```

Add `class="ts-vn-light"` on `.ts-vertical-nav` for the light variant.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `collapsed` | Boolean | `false` | Start in icon-only mini mode. |
| `activeTracking` | Boolean | `true` | Auto-set `.active` from current URL. |
| `hashTracking` | Boolean | `false` | Also match `location.hash`. |
| `expandActive` | Boolean | `true` | Auto-expand the group containing the active link. |
| `toggleBtn` | Boolean | `true` | Render the collapse toggle button. |
| `toggleTarget` | String/null | `null` | Selector for extra element to receive `.ts-vn-collapsed` (e.g. `'#page-wrapper'`). |
| `animDuration` | Number | `260` | Group open/close animation duration in ms. |
| `tooltips` | Boolean | `true` | Show Bootstrap tooltips in collapsed mode. |

### Public API

```js
const nav = $('#myNav').data('__verticalNav');
nav.collapse();          // collapse to mini mode
nav.expand();            // expand to full width
nav.toggle();            // toggle
nav.openGroup($group);   // expand a .ts-vn-group
nav.closeGroup($group);  // collapse a .ts-vn-group
nav.setActive('/path');  // mark matching link as active
nav.destroy();           // teardown and restore HTML
```

### Events

| Event | Description |
|-------|-------------|
| `verticalNav.collapsed` | After collapsing. |
| `verticalNav.expanded` | After expanding. |

---

## VideoBackground

**File:** `themestrap.plugin.videobackground.js`  
**jQuery method:** `$.fn.themestrapPluginVideoBackground`  
**Instance key:** `__videobackground`

Adds a fullscreen background video to an element using the [Vide](https://vodkabears.github.io/vide/) jQuery plugin. Reads the video path from `data-video-path`. Supports an overlay layer, poster image override, and re-initialization inside Owl Carousel cloned slides.

### Markup

```html
<section data-plugin-video-background
         data-video-path="assets/video/bg"
         data-plugin-options='{"overlay": true, "muted": true, "loop": true}'>
  <div class="container">Page content above the video</div>
</section>
```

The `data-video-path` value is the base path without extension. Vide appends `.mp4`, `.webm`, `.ogv`, and `.jpg` (poster) automatically.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `overlay` | Boolean | `false` | Prepend an overlay `<div>` over the video. |
| `overlayClass` | String | — | CSS class for the overlay element. |
| `changePoster` | String/Boolean | — | URL to override the poster image. |
| `volume` | Number | `1` | Video volume (0–1). |
| `playbackRate` | Number | `1` | Video playback speed. |
| `muted` | Boolean | `true` | Mute the video. |
| `loop` | Boolean | `true` | Loop the video. |
| `autoplay` | Boolean | `true` | Autoplay the video. |
| `position` | String | `'50% 50%'` | CSS background-position value. |
| `posterType` | String | `'detect'` | Poster detection mode. |
| `className` | String | `'vide-video-wrapper'` | Class on the Vide wrapper. |

---

## Wizard

**File:** `themestrap.plugin.wizard.js`  
**jQuery method:** `$.fn.themestrapPluginWizard`  
**Instance key:** `__pluginWizard`  
**Guide:** [`docs/PluginWizard.md`](docs/PluginWizard.md)

A self-contained multi-step wizard / form stepper for Themestrap. It provides accessible, animated step-by-step navigation with a validation gate, progress tracking, localStorage persistence, and a clean programmatic API — all driven from declarative markup with no extra dependencies beyond jQuery and the Themestrap core.

### Markup

```html
<div data-plugin-wizard id="signup-wizard"
     data-plugin-options='{"validate": "html5"}'>

  <!-- Optional: auto-built indicator strip -->
  <ol data-wizard-indicators role="tablist" aria-label="Registration steps"></ol>

  <!-- Optional: progress bar -->
  <div data-wizard-progress>
    <div data-wizard-progress-bar role="progressbar"
         aria-valuemin="0" aria-valuemax="100"></div>
  </div>

  <!-- Steps -->
  <div data-wizard-steps>

    <section data-wizard-step="1"
             data-wizard-title="Account"
             data-wizard-icon="fas fa-user">
      <input type="email" required>
      <input type="password" minlength="8" required>
    </section>

    <section data-wizard-step="2"
             data-wizard-title="Profile"
             data-wizard-icon="fas fa-id-card">
      <input type="text" name="name" required>
    </section>

    <section data-wizard-step="3"
             data-wizard-title="Done"
             data-wizard-icon="fas fa-check">
      <p>All set!</p>
    </section>

  </div>

  <!-- Nav buttons -->
  <div data-wizard-nav>
    <button data-wizard-prev type="button">Back</button>
    <button data-wizard-next type="button">Next</button>
    <button data-wizard-submit type="button">Finish</button>
  </div>

</div>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `validate` | `'html5'` | Validation strategy. `'html5'` uses native constraint validation. Pass a `function($step, stepNum, instance) -> boolean` for custom logic. `false` disables the gate entirely. |
| `animationDuration` | `280` | Duration in ms of the slide animation. Set `0` to disable motion entirely. |
| `persist` | `false` | Save the current step to `localStorage` and restore it on next page load. Requires a unique `id` on the wizard root. |
| `submitForm` | `true` | Submit the nearest ancestor `<form>` when the last step passes validation and the finish button is clicked. |
| `onChange` | `null` | `(from, to, direction)` — fired after every step change. `this` = plugin instance. |
| `onComplete` | `null` | `()` — fired when the finish button passes validation. |
| `onInvalid` | `null` | `($step, stepNum)` — fired when a validation gate blocks navigation. |
| `onReset` | `null` | `()` — fired after `reset()` returns. |

### Events

`wizard:beforechange`, `wizard:change`, `wizard:complete`, `wizard:invalid`, `wizard:reset`

---
