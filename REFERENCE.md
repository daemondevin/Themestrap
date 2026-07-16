# Themestrap Plugin Documentation

Quick reference for all plugins in `js/components/`. Each section covers the plugin's purpose, HTML markup, available options, events, and public API. 

> [!NOTE]
> Refer to the `docs/` directory for a more exhastive guide on each individual plugin as well as some of Themestrap's core infrastructure like the main runtime of the entire framework `themestrap.js` and an alternative plugin loader with dependency support like `themestrap.loader.js` and more.

---

## Table of Contents

1. [Accordion](#accordion)
2. [Account](#account)
3. [Alert](#alert)
4. [AnimatedContent](#animatedcontent)
5. [Animation (Animate)](#animation-animate)
6. [Auth](#auth)
7. [BeforeAfter](#beforeafter)
8. [Carousel](#carousel)
9. [CarouselLight](#carousellight)
10. [ChartCircular](#chartcircular)
11. [CodeRail](#coderail)
12. [CodeWindow](#codewindow)
13. [Collapsible](#collapsible)
14. [CommandMenu](#commandmenu)
15. [Countdown](#countdown)
16. [Counter](#counter)
17. [CursorEffect](#cursoreffect)
18. [DarkMode](#darkmode)
19. [Dialog](#dialog)
20. [FloatElement](#floatelement)
21. [GDPR](#gdpr)
22. [GDPRWrapper](#gdprwrapper)
23. [Highlight](#highlight)
24. [HoverEffect](#hovereffect)
25. [Icon](#icon)
26. [InViewportStyle](#inviewportstyle)
27. [Lightbox](#lightbox)
28. [LoadingOverlay](#loadingoverlay)
29. [Markdown](#markdown)
30. [Masonry](#masonry)
31. [MatchHeight](#matchheight)
32. [ModuleLoader](#moduleloader)
33. [Nav](#nav)
34. [Navbar](#navbar)
35. [NavMenu](#navmenu)
36. [Newsletter](#newsletter)
37. [PanelNav](#panelnav)
38. [Parallax](#parallax)
39. [Popover](#popover)
40. [ProgressBar](#progressbar)
41. [RandomImages](#randomimages)
42. [Rating](#rating)
43. [ReadMore](#readmore)
44. [RevolutionSlider](#revolutionslider)
45. [Scrollable](#scrollable)
46. [Scroller](#scroller)
47. [ScrollFx](#scrollfx)
48. [ScrollShadow](#scrollshadow)
49. [ScrollSpy](#scrollspy)
50. [ScrollToTop](#scrolltotop)
51. [Search](#search)
52. [SectionScroll](#sectionscroll)
53. [SideNav](#sidenav)
54. [Sort](#sort)
55. [Sticky](#sticky)
56. [StickyHeader](#stickyheader)
57. [Toast](#toast)
58. [Toggle](#toggle)
59. [Validation](#validation)
60. [VerticalNav](#verticalnav)
61. [VideoBackground](#videobackground)

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

**File:** `themestrap.plugin.animation.js`  
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

Progressive-enhancement layer for auth forms (MODX Login extra or custom). Adds inline validation, password show/hide, a five-segment password-strength meter, loading button state, Caps Lock warning, optional AJAX submission, and PluginToast feedback. Works with login, register, forgot-password, reset-password, change-password, and update-profile forms.

### Markup

```html
<form data-plugin-auth
      data-auth-action="login"
      data-plugin-options='{"ajax": false, "toasts": true}'
      method="post" action="">

  <div data-auth-field="username">
    <label for="auth-user">Username</label>
    <input id="auth-user" name="username" type="text" required data-auth-error class="form-control">
    <div data-auth-feedback class="invalid-feedback"></div>
  </div>

  <div data-auth-field="password">
    <label for="auth-pw">Password</label>
    <div class="input-group">
      <input id="auth-pw" name="password" type="password" required minlength="8"
             data-auth-strength data-auth-error class="form-control">
      <button type="button" class="btn btn-outline-secondary" data-auth-toggle-password>Show</button>
    </div>
    <div data-auth-strength-meter class="auth-strength"></div>
    <div data-auth-feedback class="invalid-feedback"></div>
  </div>

  <button type="submit" data-auth-submit class="btn btn-primary">
    <span data-auth-submit-label>Sign In</span>
    <span data-auth-spinner class="spinner-border spinner-border-sm d-none" role="status"></span>
  </button>
</form>
```

### Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-plugin-auth` | `<form>` | Plugin root. |
| `data-auth-action` | `<form>` | `'login'`, `'register'`, `'forgot'`, `'reset'`, `'change'`, `'profile'`. |
| `data-auth-field` | wrapper div | Groups a label, input, and feedback. |
| `data-auth-error` | `<input>` | Marks the input for validation. |
| `data-auth-feedback` | div | Receives validation error text. |
| `data-auth-strength` | `<input>` | Triggers the password strength meter. |
| `data-auth-strength-meter` | div | Renders the five-bar strength meter. |
| `data-auth-toggle-password` | `<button>` | Show/hide password toggle. |
| `data-auth-capslock` | div | Shown/hidden based on Caps Lock state. |
| `data-auth-submit` | `<button>` | Submit button (gets `disabled` during AJAX). |
| `data-auth-submit-label` | span | Label text swapped to `busyLabel` while busy. |
| `data-auth-spinner` | span | Shown while busy. |
| `data-auth-match` | `<input>` | CSS selector of another input this field must match. |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ajax` | Boolean | `false` | Submit via XHR and expect a JSON response. |
| `redirect` | String | `''` | URL to redirect to after AJAX success. |
| `toasts` | Boolean | `true` | Emit PluginToast notifications on success/error. |
| `toastSuccessTitle` | String | `'Success'` | Title for the success toast. |
| `toastErrorTitle` | String | `'Sorry'` | Title for the error toast. |
| `successMessage` | String | `''` | Body of the success toast. |
| `errorMessage` | String | `'Please check the form for errors.'` | Body of the error toast. |
| `networkErrorMessage` | String | `'Could not reach the server…'` | Network error body. |
| `busyLabel` | String | `'Working...'` | Submit button label while submitting. |
| `showPasswordLabel` | String | `'Show'` | Toggle button label when password is hidden. |
| `hidePasswordLabel` | String | `'Hide'` | Toggle button label when password is visible. |
| `messages.required` | String | `'This field is required.'` | Required field error. |
| `messages.email` | String | `'Please enter a valid email address.'` | Email format error. |
| `messages.minlength` | String | `'Must be at least %s characters.'` | Min-length error (`%s` = length). |
| `messages.pattern` | String | `'Invalid format.'` | Pattern mismatch error. |
| `messages.match` | String | `'Values do not match.'` | Field match error. |

### Events (fired on the form element)

| Event | Arguments | Description |
|-------|-----------|-------------|
| `auth:validate` | `(instance, isValid)` | After form-level validation runs. |
| `auth:submit` | `(instance, formData)` | Before submission (AJAX or native). |
| `auth:success` | `(instance, response)` | After successful AJAX response. |
| `auth:error` | `(instance, error)` | After AJAX error or network failure. |

### Public API

```js
const auth = $('#myForm').data('__pluginAuth');
auth.validate();        // returns true | false
auth.setBusy(true);     // toggle loading state
auth.reset();           // clear all field error states
auth.destroy();
```

### init.js Wiring

Auth forms are initialized on DOMReady (not via IntersectionObserver) since they must be functional without scrolling:

```js
if ($.isFunction($.fn['themestrapPluginAuth']) && $('[data-plugin-auth]').length) {
    $(() => {
        $('[data-plugin-auth]:not(.manual)').each(function () {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginAuth(opts);
        });
    });
}
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

## Carousel

**File:** `themestrap.plugin.carousel.js`  
**jQuery method:** `$.fn.themestrapPluginCarousel`  
**Instance key:** `__carousel`

A full-featured carousel built on [Owl Carousel 2](https://owlcarousel2.github.io/OwlCarousel2/). Handles RTL auto-detection, nav/dot offset positioning, auto-height, carousel-to-carousel syncing, center-active-item mode, AnimateIn/Out integration, animated letters coordination, data-icon re-rendering for cloned slides, and external navigation via `data-carousel-navigate-id`.

### Markup

```html
<div class="owl-carousel"
     data-plugin-carousel
     data-plugin-options='{"loop": true, "items": 3, "nav": true, "dots": true, "autoplay": true}'>
  <div class="item">Slide 1</div>
  <div class="item">Slide 2</div>
  <div class="item">Slide 3</div>
</div>
```

### Options

All Owl Carousel 2 options are accepted. Key defaults:

| Option | Default | Description |
|--------|---------|-------------|
| `loop` | `true` | Infinite loop. |
| `navText` | `[]` | Custom prev/next HTML (empty = CSS via theme). |
| `refresh` | `false` | Force a refresh after init. |
| `responsive` | `{0:1, 479:1, 768:2, 979:3, 1199:4}` | Responsive breakpoints for `items`. |

Additional Themestrap options:

| Option | Type | Description |
|--------|------|-------------|
| `navHorizontalOffset` | String | CSS offset for the nav element (e.g. `'10px'`). |
| `navVerticalOffset` | String | CSS offset for the nav element vertically. |
| `dotsHorizontalOffset` | String | CSS offset for the dots. |
| `dotsVerticalOffset` | String | CSS offset for the dots vertically. |

---

## CarouselLight

**File:** `themestrap.plugin.carousellight.js`  
**jQuery method:** `$.fn.themestrapPluginCarouselLight`  
**Instance key:** `__carouselLight`

A dependency-free lightweight carousel alternative that doesn't require Owl Carousel. It drives pre-built Owl Carousel markup (`.owl-item`, `.owl-next`, `.owl-prev`, `.owl-dot`) with its own animation logic using CSS `fadeIn`/`fadeOut` classes. Supports autoplay, swipe events (via jQuery.swipe), click debouncing, and external navigation via `data-carousel-navigate-id`.

### Markup

Same pre-built markup as a static Owl Carousel with `.owl-item` elements. Does not require the Owl Carousel JS library.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoplay` | Boolean | `true` | Auto-advance slides. |
| `autoplayTimeout` | Number | `7000` | Auto-advance interval in ms. |
| `disableAutoPlayOnClick` | Boolean | `true` | Stop autoplay when user interacts. |
| `swipeEvents` | Boolean | `true` | Enable touch/swipe navigation (requires jQuery.swipe). |

---

## ChartCircular

**File:** `themestrap.plugin.chartcircular.js`  
**jQuery method:** `$.fn.themestrapPluginChartCircular`  
**Instance key:** `__chartCircular`

Animates a circular progress/pie chart using the [easyPieChart](https://rendro.github.io/easy-pie-chart/) jQuery plugin. Reads the target percentage from `data-percent` and animates from 0 to that value after a configurable delay.

### Markup

```html
<div class="chart"
     data-plugin-chart-circular
     data-plugin-options='{"barColor": "#0088cc", "lineWidth": 13, "size": 175}'
     data-percent="75">
  <span class="percent">0</span>%
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | Number | `1` | Delay in ms before starting the animation. |
| `barColor` | String | `'#0088CC'` | Progress bar color. |
| `trackColor` | String | `'#f2f2f2'` | Background track color. |
| `scaleColor` | Boolean/String | `false` | Scale line color (false = hidden). |
| `scaleLength` | Number | `5` | Length of scale lines. |
| `lineCap` | String | `'round'` | End cap style: `'round'` or `'butt'`. |
| `lineWidth` | Number | `13` | Width of the progress bar stroke. |
| `size` | Number | `175` | Diameter of the chart in px. |
| `rotate` | Number | `0` | Starting rotation in degrees. |
| `animate` | Object | `{duration: 2500, enabled: true}` | Animation settings. |
| `accX` | Number | `0` | IntersectionObserver X offset. |
| `accY` | Number | `-150` | IntersectionObserver Y offset. |

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

## CommandMenu

**File:** `themestrap.plugin.commandmenu.js`  
**jQuery method:** `$.fn.themestrapPluginCommandMenu`  
**Instance key:** `__commandMenu`

An accessible, keyboard-driven command palette (similar to ⌘K in Linear or VS Code). Opens via a global keyboard shortcut (default: `Cmd/Ctrl+K`), provides live fuzzy substring filtering across label, description, and keywords, and supports full keyboard navigation (Arrow keys, Home, End, PgUp/PgDn, Enter, Escape).

### Markup

```html
<div data-plugin-command-menu
     data-plugin-options='{"shortcut": "mod+k", "placeholder": "Search commands..."}'>

  <input data-command-input type="text" placeholder="Search commands...">

  <div data-command-list>
    <button data-command-item
            data-command-label="Open Dashboard"
            data-command-keywords="home overview"
            data-command-href="/dashboard">
      Open Dashboard
    </button>
    <button data-command-item data-command-label="New Post">New Post</button>
  </div>

</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `shortcut` | String | `'mod+k'` | Global shortcut. `mod` = Cmd on Mac, Ctrl elsewhere. `null` disables. |
| `closeOnBackdrop` | Boolean | `true` | Close when clicking outside the palette. |
| `closeOnSelect` | Boolean | `true` | Close when an item is selected. |
| `placeholder` | String | `'Search commands...'` | Input placeholder text. |

---

## Countdown

**File:** `themestrap.plugin.countdown.js`  
**jQuery method:** `$.fn.themestrapPluginCountdown`  
**Instance key:** `__countdown`

Renders a live count-down timer to a target date, displaying days, hours, minutes, and seconds in the element's child structure.

### Markup

```html
<div data-plugin-countdown
     data-plugin-options='{"date": "2026/01/01 00:00:00"}'>
  <!-- Inner structure is generated by the plugin -->
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `date` | String | `'2030/06/10 12:00:00'` | Target date/time string. |
| `textDay` | String | `'DAYS'` | Label for the days unit. |
| `textHour` | String | `'HRS'` | Label for the hours unit. |
| `textMin` | String | `'MIN'` | Label for the minutes unit. |
| `textSec` | String | `'SEC'` | Label for the seconds unit. |
| `uppercase` | Boolean | `true` | Render labels in uppercase. |
| `numberClass` | String | `''` | Extra class on number elements. |
| `wrapperClass` | String | `''` | Extra class on unit wrapper elements. |
| `insertHTMLbefore` | String | `''` | HTML injected before each unit. |
| `insertHTMLafter` | String | `''` | HTML injected after each unit. |

---

## Counter

**File:** `themestrap.plugin.counter.js`  
**jQuery method:** `$.fn.themestrapPluginCounter`  
**Instance key:** `__counter`

Animates a numeric value from 0 to the element's text content (or a configured end value) using an easing animation when the element enters the viewport.

### Markup

```html
<span data-plugin-counter
      data-plugin-options='{"speed": 2000, "decimals": 0}'>
  1500
</span>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accX` | Number | `0` | IntersectionObserver X offset. |
| `accY` | Number | `0` | IntersectionObserver Y offset. |
| `appendWrapper` | Boolean | `false` | Wrap the count in a `<span>` appended after the element. |
| `prependWrapper` | Boolean | `false` | Wrap the count in a `<span>` prepended before the element. |
| `speed` | Number | `3000` | Total animation duration in ms. |
| `refreshInterval` | Number | `100` | Update interval in ms. |
| `decimals` | Number | `0` | Number of decimal places. |
| `comma` | Boolean | `false` | Format with comma thousands separator. |
| `onUpdate` | Function | `null` | Callback on each tick: `fn(currentValue)`. |
| `onComplete` | Function | `null` | Callback when animation completes. |

---

## CursorEffect

**File:** `themestrap.plugin.cursoreffect.js`  
**jQuery method:** `$.fn.themestrapPluginCursorEffect`  
**Instance key:** `__cursorEffect`

Applies a custom cursor visual effect to an element (or the document). No default options are defined in the source; configuration is driven entirely through `data-plugin-options`.

---

## DarkMode

**File:** `themestrap.plugin.darkmode.js`  
**jQuery method:** `$.fn.themestrapPluginDarkMode`  
**Instance key:** `__darkMode`

Toggles light/dark theme by adding or removing a class on `<html>`. Also writes `data-theme` and `data-bs-theme` attributes so Bootstrap 5.3 native components pick up the theme. Persists the user's choice in `localStorage`. Applies the correct class the moment the script executes (before DOMReady) to prevent a flash of the wrong theme.

Resolution order on first paint: `localStorage[storageKey]` → `prefers-color-scheme` media query → light.

### Markup

```html
<!-- Toggle button anywhere in the DOM -->
<button data-plugin-dark-mode>Toggle Dark Mode</button>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storageKey` | String | `'themestrap-theme'` | `localStorage` key. |
| `darkClass` | String | `'dark'` | Class added to `<html>` when dark mode is active. |
| `dataAttr` | String | `'data-theme'` | Data attribute set on `<html>`. |
| `bsDataAttr` | String | `'data-bs-theme'` | Bootstrap 5.3 theme attribute. |

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

## FloatElement

**File:** `themestrap.plugin.floatelement.js`  
**jQuery method:** `$.fn.themestrapPluginFloatElement`  
**Instance key:** `__floatElement`

Applies a floating/bobbing CSS animation to an element as it scrolls through the viewport, creating a parallax-like "floating" visual effect.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startPos` | String | `'top'` | Starting position: `'top'` or `'bottom'`. |
| `speed` | Number | `3` | Animation speed multiplier. |
| `horizontal` | Boolean | `false` | Float horizontally instead of vertically. |
| `isInsideSVG` | Boolean | `false` | Element is inside an SVG. |
| `transition` | Boolean | `false` | Apply CSS transition to the transform. |
| `transitionDelay` | Number | `0` | Delay before transition in ms. |
| `transitionDuration` | Number | `500` | CSS transition duration in ms. |
| `minWindowWidth` | Number | `991` | Minimum viewport width to activate. |

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

## HoverEffect

**File:** `themestrap.plugin.hovereffect.js`  
**jQuery method:** `$.fn.themestrapPluginHoverEffect`  
**Instance key:** `__hoverEffect`

Applies magnetic or 3D tilt hover effects to elements. The magnetic effect makes the element follow the cursor slightly on mousemove. The 3D effect delegates to the [hover3d](https://github.com/ariona/hover3d) jQuery plugin.

### Markup

```html
<!-- Magnetic -->
<div data-plugin-hover-effect
     data-plugin-options='{"effect": "magnetic", "magneticMx": 0.15}'>
  Hover me
</div>

<!-- 3D tilt (also triggered by .hover-effect-3d class) -->
<div class="hover-effect-3d" data-plugin-hover-effect>
  3D Card
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `effect` | String | `'magnetic'` | `'magnetic'` or `'3d'`. |
| `magneticMx` | Number | `0.15` | Magnetic X axis movement multiplier. |
| `magneticMy` | Number | `0.3` | Magnetic Y axis movement multiplier. |
| `magneticDeg` | Number | `12` | Magnetic rotation maximum in degrees. |
| `selector` | String | `'.thumb-info, .hover-effect-3d-wrapper'` | Target selector for the 3d effect. |
| `sensitivity` | Number | `20` | 3D tilt sensitivity. |

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
**Instance key:** `__lightbox`

A lightbox/modal gallery powered by [Magnific Popup](https://dimsemenov.com/plugins/magnific-popup/). Adds `lightbox-opened` to `<html>` on open and removes it on close.

### Markup

```html
<!-- Single image -->
<a href="large.jpg" class="lightbox" data-plugin-lightbox>
  <img src="thumb.jpg" alt="Image">
</a>

<!-- Gallery -->
<div data-plugin-lightbox
     data-plugin-options='{"type": "image", "gallery": {"enabled": true}}'>
  <a class="lightbox" href="img1.jpg"><img src="t1.jpg"></a>
  <a class="lightbox" href="img2.jpg"><img src="t2.jpg"></a>
</div>
```

### Options

All [Magnific Popup options](https://dimsemenov.com/plugins/magnific-popup/documentation.html) are accepted. Key defaults:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tClose` | String | `'Close (Esc)'` | Alt text on close button. |
| `tLoading` | String | `'Loading...'` | Loading indicator text. |
| `gallery.tPrev` | String | `'Previous (Left arrow key)'` | Prev button alt text. |
| `gallery.tNext` | String | `'Next (Right arrow key)'` | Next button alt text. |
| `gallery.tCounter` | String | `'%curr% of %total%'` | Counter format. |

---

## LoadingOverlay

**File:** `themestrap.plugin.loadingoverlay.js`  
**jQuery method:** `$.fn.loadingOverlay`

Shows a loading overlay over a wrapper element (or `<body>`) until the page or an async operation completes. Supports ten visual effect styles and a percentage-progress counter. Listens for `loading-overlay:show` and `loading-overlay:hide` custom events. Auto-hides when the window `load` event fires when bound to `<body>`.

### Markup

```html
<!-- Over an element -->
<div class="panel" data-loading-overlay
     data-loading-overlay-options='{"effect": "pulse"}'>
  Panel content
</div>

<!-- Over the full page -->
<body data-loading-overlay
      data-loading-overlay-options='{"effect": "percentageProgress1"}'>
```

### Effect Values

`'default'`, `'cubes'`, `'cubeProgress'`, `'floatRings'`, `'floatBars'`, `'speedingWheel'`, `'zenith'`, `'spinningSquare'`, `'pulse'`, `'percentageProgress1'`, `'percentageProgress2'`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `effect` | String | `'default'` | Spinner style. |
| `css` | Object | `{}` | Extra CSS applied to the overlay element. |
| `hideDelay` | Number | `500` | Delay in ms before the overlay hides. |
| `progressMinTimeout` | Number | `0` | Minimum display time in ms for percentage effects. |

### API

```js
$('body').loadingOverlay();     // initialize
$('body').data('loadingOverlay').show();  // show
$('body').data('loadingOverlay').hide();  // hide
```

---

## Markdown

**File:** `themestrap.plugin.markdown.js`  
**jQuery method:** `$.fn.themestrapPluginMarkdown`  
**Instance key:** `__markdown`

Renders Markdown to HTML using the [marked](https://marked.js.org/) library. Source markdown is read from a `<script type="text/markdown">` child tag or from the element's own text content. Injects scoped typography styles once. Supports lazy-loading of marked, remote source via `src`, optional DOMPurify sanitization, and automatic re-render via MutationObserver.

### Markup

```html
<div data-plugin-markdown>
  <script type="text/markdown">
    ## Getting Started

    Some **bold** and `inline code`.
  </script>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentClass` | String | `'markdown-content'` | Class on the rendered output wrapper. |
| `dedent` | Boolean | `true` | Strip common leading whitespace before parsing. |
| `sanitize` | Boolean | `false` | Pass output through DOMPurify when available. |
| `observe` | Boolean | `false` | Re-render when the source `<script>` changes. |
| `injectStyles` | Boolean | `true` | Inject default markdown typography styles. |
| `src` | String | `null` | URL to fetch markdown from. |
| `content` | String | `null` | Inline markdown string (overrides script/text). |
| `markedOptions` | Object | `{}` | Options object forwarded to `marked.parse()`. |
| `markedUrl` | String | `null` | URL to lazy-load marked if `window.marked` is absent. |

### Public API

```js
const md = $('#content').data('__markdown');
md.renderMarkdown();   // force a re-render
```

### Events

| Event | Description |
|-------|-------------|
| `render.tsmarkdown` | Trigger a re-render programmatically. |
| `rendered.tsmarkdown` | Fired after each render: `(e, instance)`. |

---

## Masonry

**File:** `themestrap.plugin.masonry.js`  
**jQuery method:** `$.fn.themestrapPluginMasonry`  
**Instance key:** `__masonry`

A masonry/isotope grid layout powered by [Isotope](https://isotope.metafizzy.co/). Waits for all images to load before initializing, shows a bounce-loader inside `.masonry-loader` parent wrappers, and re-runs `isotope('layout')` on window resize.

### Markup

```html
<div class="masonry-loader">
  <div class="row" data-plugin-masonry
       data-plugin-options='{"itemSelector": ".col", "layoutMode": "masonry"}'>
    <div class="col"><img src="a.jpg"></div>
    <div class="col"><img src="b.jpg"></div>
  </div>
</div>
```

All Isotope options are accepted via `data-plugin-options`. No specific defaults are set beyond Isotope's own defaults.

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
**Instance key:** `__pluginNavbar`

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
| `mobileBreakpoint` | Number | `991` | Viewport width below which mobile menu is used. |

---

## NavMenu

**File:** `themestrap.plugin.navmenu.js`  
**jQuery method:** `$.fn.themestrapPluginNavMenu`  
**Instance key:** `__navMenu`

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

## PanelNav

**File:** `themestrap.plugin.panelnav.js`  
**jQuery method:** `$.fn.themestrapPluginPanelNav`  
**Instance key:** `__pluginPanelNav`

A vertical link list with a caret-right active indicator, expandable drawer-toggle parent sections, optional left icons, right metadata (badges, dates, counts), section headings, and separators. Self-contained CSS with light and dark variants. Used for sidebar navigation, table-of-contents panels, and settings menus.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dark` | Boolean | `false` | Use the dark color scheme. |
| `bordered` | Boolean | `false` | Wrap the panel in a bordered card. |
| `compact` | Boolean | `false` | Compact (denser) row spacing. |
| `scrollable` | Boolean | `false` | Full-height with internal scroll body. |
| `activeOnLoad` | Boolean | `true` | Auto-detect and set the active item from URL. |

---

## Parallax

**File:** `themestrap.plugin.parallax.js`  
**jQuery method:** `$.fn.themestrapPluginParallax`  
**Instance key:** `__parallax`

Applies a CSS `background-position`-based parallax effect to background images as the user scrolls. Supports horizontal position, scale effects, and scrollable-container parallax.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | Number | `1.5` | Parallax scroll speed multiplier. |
| `horizontalPosition` | String | `'50%'` | Horizontal background position. |
| `offset` | Number | `0` | Vertical offset in px. |
| `parallaxDirection` | String | `'top'` | Direction of parallax movement. |
| `parallaxHeight` | String | `'180%'` | Background image height for parallax coverage. |
| `parallaxScale` | Boolean | `false` | Apply scale transform on scroll. |
| `parallaxScaleInvert` | Boolean | `false` | Invert the scale direction. |
| `scrollableParallax` | Boolean | `false` | Apply effect inside a scrollable container. |
| `scrollableParallaxMinWidth` | Number | `991` | Minimum width for scrollable parallax. |
| `startOffset` | Number | `7` | Initial scroll offset percentage. |
| `transitionDuration` | String | `'200ms'` | CSS transition duration. |
| `cssProperty` | String | `'width'` | CSS property to animate. |

---

## Popover

**File:** `themestrap.plugin.popover.js`  
**jQuery method:** `$.fn.themestrapPluginPopover`  
**Instance key:** `__pluginPopover`

Accessible, anchor-positioned popovers with CSS arrow, dark mode support, portal mode (moves the popover to `<body>` to escape overflow:hidden containers), mutual exclusion (only one open at a time), and focus trapping.

### Markup

```html
<div data-plugin-popover
     data-plugin-options='{"side": "bottom", "align": "start"}'>
  <button data-popover-trigger>Open Popover</button>
  <div data-popover-content>
    <strong>Popover Title</strong>
    <p>Popover body text.</p>
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `side` | String | `'bottom'` | Preferred side: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `align` | String | `'start'` | Alignment: `'start'`, `'center'`, `'end'`. |
| `offset` | Number | `8` | Gap between trigger and popover in px. |
| `arrow` | Boolean | `true` | Show the CSS arrow. |
| `portaling` | Boolean | `false` | Move the popover to `<body>` on open. |
| `closeOnOutsideClick` | Boolean | `true` | Close on click outside. |
| `closeOnEscape` | Boolean | `true` | Close on Escape key. |
| `dark` | Boolean | `false` | Use the dark color scheme. |

### Events

Mutual exclusion uses the event `ts-popover-opened` dispatched on `document` (hyphen-separated, not colon-separated).

---

## ProgressBar

**File:** `themestrap.plugin.progressbar.js`  
**jQuery method:** `$.fn.themestrapPluginProgressBar`  
**Instance key:** `__progressBar`

Animates Bootstrap progress bars from 0 to their target width value when they scroll into the viewport.

### Markup

```html
<div class="progress" data-plugin-progress-bar>
  <div class="progress-bar" role="progressbar" style="width: 0%"
       data-value="75" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  </div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accX` | Number | `0` | IntersectionObserver X offset. |
| `accY` | Number | `-50` | IntersectionObserver Y offset. |
| `delay` | Number | `1` | Delay in ms before starting the animation. |

---

## RandomImages

**File:** `themestrap.plugin.randomimages.js`  
**jQuery method:** `$.fn.themestrapPluginRandomImages`  
**Instance key:** `__randomimages`

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

An interactive star (or custom icon) rating widget. Supports Font Awesome class strings and inline SVG icons. Handles fractional/partial ratings with a CSS custom property fill. Clearable, disableable, and fires an `onRate` callback.

### Markup

```html
<div class="rating rating-md" data-plugin-rating
     data-plugin-options='{"initialRating": 3.5, "interactive": true, "maxRating": 5}'>
</div>
```

Size modifier classes: `rating-xs`, `rating-sm`, `rating-md`, `rating-lg`, `rating-xl`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `icon` | String | `'fa-solid fa-star'` | FA class string or inline SVG markup. |
| `currentColor` | Boolean | `false` | Normalize SVG fill/stroke to `currentColor`. |
| `initialRating` | Number | `0` | Starting rating value. |
| `interactive` | Boolean | `true` | Allow user interaction. |
| `maxRating` | Number | `5` | Number of icons to render. |
| `clearable` | Boolean/String | `'auto'` | `true`, `false`, or `'auto'` (clearable when only one icon). |
| `size` | String | `'md'` | Size variant: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`. |
| `onRate` | Function | `function(rating){}` | Callback when rating is set. |

### Public API

```js
const rating = $('.rating').data('__rating');
rating.setRating(4);     // set to 4 stars
rating.getRating();      // returns current rating
rating.clearRating();    // set to 0
rating.enable();         // re-enable interaction
rating.disable();        // disable interaction
rating.destroy();        // teardown
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

## Scrollable

**File:** `themestrap.plugin.scrollable.js`  
**jQuery method:** `$.fn.themestrapPluginScrollable`  
**Instance key:** `__scrollable`

Wraps the [nanoScroller](https://github.com/jamesflorentino/nanoScrollerJS) library to create styled custom scrollbars. Also patches Bootstrap's modal `enforceFocus` to initialize nanoScroller on any `.scrollable` element inside modals.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentClass` | String | `'scrollable-content'` | Class of the content wrapper. |
| `paneClass` | String | `'scrollable-pane'` | Class of the scrollbar pane. |
| `sliderClass` | String | `'scrollable-slider'` | Class of the scrollbar thumb. |
| `alwaysVisible` | Boolean | `true` | Keep scrollbar always visible. |
| `preventPageScrolling` | Boolean | `true` | Prevent page scroll at boundaries. |

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

Isotope-powered filter/sort grid. A source element (filter buttons) drives a destination grid (`.sort-destination`). Supports URL hash sync, text field search filtering, a loading state, and automatic Sticky plugin recalculation on layout completion.

### Markup

```html
<!-- Filter buttons -->
<ul data-plugin-sort data-sort-id="portfolio">
  <li data-option-value="*"><a href="#">All</a></li>
  <li data-option-value=".web"><a href="#">Web</a></li>
</ul>

<!-- Grid -->
<div class="sort-destination" data-sort-id="portfolio">
  <div class="isotope-item web"><img src="p1.jpg"></div>
  <div class="isotope-item print"><img src="p2.jpg"></div>
</div>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useHash` | Boolean | `true` | Sync the active filter with the URL hash. |
| `itemSelector` | String | `'.isotope-item'` | Isotope item selector. |
| `layoutMode` | String | `'masonry'` | Isotope layout mode. |
| `filter` | String | `'*'` | Initial active filter. |
| `filterFieldId` | String/Boolean | `false` | ID of a text field for live search filtering. |
| `stagger` | Number | `30` | Item stagger animation delay in ms. |

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
