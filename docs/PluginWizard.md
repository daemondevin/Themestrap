# PluginWizard Guide

A self-contained multi-step wizard / form stepper for Themestrap. It provides accessible, animated step-by-step navigation with a validation gate, progress tracking, localStorage persistence, and a clean programmatic API — all driven from declarative markup with no extra dependencies beyond jQuery and the Themestrap core.

---

## How It Works

The wizard organizes content into discrete `[data-wizard-step]` panels inside a `[data-wizard-steps]` viewport. Only the active step is visible at any time; inactive steps carry `aria-hidden="true"` and are excluded from the tab order. Navigation is controlled by Back / Next / Finish buttons in a `[data-wizard-nav]` bar.

Advancing a step runs a **validation gate** (HTML5 constraint validation by default, or a custom function you supply). If validation passes, the outgoing step slides out and the incoming step slides in using CSS keyframe animations. The direction of the slide (left or right) mirrors the direction of travel.

Two optional chrome elements sync automatically with every step change:

- **Indicator strip** (`[data-wizard-indicators]`) — a styled `<ol>` of bubbles with connector lines. Built from step `data-wizard-title` and `data-wizard-icon` attributes if the element is present and empty.
- **Progress bar** (`[data-wizard-progress-bar]`) — width transitions from 0 % on step 1 to 100 % on the last step.

An `aria-live="polite"` announce region (auto-created if absent) announces the step title to screen readers on every change.

### Navigation lifecycle

```
next() called
    └─ _validate(currentStep)        <- gate
           └─ passes -> _completed.add(step)
                  └─ _navigate(from, to, 'forward')
                         └─ wizard:beforechange   <- cancellable
                                └─ _render(from, to, direction)
                                       ├─ animate out -> aria-hidden outgoing step
                                       ├─ animate in  -> aria-hidden=false incoming step
                                       ├─ _syncNav / _syncIndicators / _syncProgress
                                       └─ focus first focusable element
                               └─ wizard:change
```

---

## Quick Start

### 1. Include the script

```html
<script src="js/themestrap.js"></script>
<script src="js/themestrap.plugin.wizard.js"></script>
```

### 2. Author the markup

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

### 3. Initialize

```js
$('#signup-wizard').themestrapPluginWizard();
```

### 4. (Optional) Auto-init wiring for `themestrap.init.js`

Because the wizard must be live before user interaction, use DOMReady-immediate initialization; not `intObsInit`:

```js
if ($.isFunction($.fn['themestrapPluginWizard']) && $('[data-plugin-wizard]').length) {
    $(() => {
        $('[data-plugin-wizard]:not(.manual)').each(function () {
            const $this = $(this);
            const opts = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginWizard(opts);
        });
    });
}
```

---

## Markup Reference

### Root element

| Attribute | Description |
|---|---|
| `data-plugin-wizard` | Activates the plugin on this element. |
| `data-plugin-options` | JSON options blob (merged with JS options; attribute wins on conflict). |
| `id` | Required when `persist: true` — the localStorage key is derived from it. |

### Step panels

Panels are sorted by the numeric value of `data-wizard-step` before rendering, so the order in the DOM doesn't have to be sequential.

| Attribute | Description |
|---|---|
| `data-wizard-step="N"` | 1-indexed step number. Required on every step panel. |
| `data-wizard-title="…"` | Human-readable step title — used in the indicator label and the SR announce region. |
| `data-wizard-icon="fa-class"` | FontAwesome class for the indicator bubble. When omitted the step number is shown instead. |

### Nav elements

| Attribute | Description |
|---|---|
| `data-wizard-prev` | Back button. Hidden on step 1 via `[data-wiz-first]` on the root. |
| `data-wizard-next` | Next button. Hidden on the last step via `[data-wiz-last]`. |
| `data-wizard-submit` | Finish/submit button. Shown only on the last step. |

### Optional chrome

| Attribute | Description |
|---|---|
| `data-wizard-indicators` | Empty `<ol>` — the plugin builds indicator items from step metadata. |
| `data-wizard-progress` | Progress bar track element. |
| `data-wizard-progress-bar` | Inner fill bar; width is set as an inline style and transitions via CSS. |
| `data-wizard-announce` | SR live region. Auto-created if absent. |
| `data-wizard-error` | Sibling of an `<input>` — shown when HTML5 validation fails, populated with `validationMessage`. |

### External goto triggers

Any element anywhere in the document can jump to a step:

```html
<!-- Jump to step 2 in wizard #signup-wizard -->
<button data-wizard-goto="2" data-wizard-id="signup-wizard">Go to step 2</button>
```

`data-wizard-id` is optional when only one wizard is on the page.

---

## Configuration Options

All options can be set via `data-plugin-options` JSON or passed to the jQuery initialiser.

| Option | Type | Default | Description |
|---|---|---|---|
| `validate` | `'html5'` \| `function` \| `false` | `'html5'` | Validation strategy. `'html5'` uses native constraint validation. Pass a `function($step, stepNum, instance) -> boolean` for custom logic. `false` disables the gate entirely. |
| `animationDuration` | number | `280` | Duration in ms of the slide animation. Set `0` to disable motion entirely. |
| `persist` | boolean | `false` | Save the current step to `localStorage` and restore it on next page load. Requires a unique `id` on the wizard root. |
| `submitForm` | boolean | `true` | Submit the nearest ancestor `<form>` when the last step passes validation and the finish button is clicked. |
| `onChange` | function | `null` | `(from, to, direction)` — fired after every step change. `this` = plugin instance. |
| `onComplete` | function | `null` | `()` — fired when the finish button passes validation. |
| `onInvalid` | function | `null` | `($step, stepNum)` — fired when a validation gate blocks navigation. |
| `onReset` | function | `null` | `()` — fired after `reset()` returns. |

### Custom validation example

```js
$('#my-wizard').themestrapPluginWizard({
    validate: function ($step, stepNum, instance) {
        if (stepNum === 1) {
            const email = $step.find('[name="email"]').val().trim();
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            $step.find('[name="email"]').toggleClass('wiz-invalid', !ok);
            return ok;
        }
        return true; // all other steps pass
    }
});
```

---

## CSS Custom Properties

The wizard's appearance is controlled entirely through CSS custom properties on `:root` (or scoped to the wizard root element for per-instance theming).

| Property | Default | Description |
|---|---|---|
| `--wizard-accent` | `var(--color-primary, #e8672a)` | Bubble fill, progress bar, active connector line. |
| `--wizard-accent-subtle` | 12 % tint of accent | Focus ring and active bubble glow. |
| `--wizard-muted` | `#94a3b8` | Inactive bubble text and connector lines. |
| `--wizard-fg` | `#0f172a` | Completed indicator label colour. |
| `--wizard-bg` | `#ffffff` | Bubble background when not active/completed. |
| `--wizard-border` | `rgba(15,23,42,.10)` | Default border on bubbles and progress track. |
| `--wizard-border-strong` | `rgba(15,23,42,.20)` | Stronger border on inactive bubbles. |
| `--wizard-step-size` | `32px` | Indicator bubble diameter. |
| `--wizard-duration` | `300ms` | CSS transition duration for indicator and progress animation. |
| `--wizard-ease` | `cubic-bezier(.16,1,.3,1)` | Easing for progress bar transition. |

### Per-instance theming example

```html
<div data-plugin-wizard style="--wizard-accent: #2ab8c8">
  …
</div>
```

---

## Public API

Retrieve the instance from jQuery data and call methods directly:

```js
const wiz = $('#signup-wizard').data('__pluginWizard');
```

| Method | Returns | Description |
|---|---|---|
| `wiz.next()` | `this` | Advance one step (runs validation). |
| `wiz.prev()` | `this` | Go back one step (never validates). |
| `wiz.goTo(n)` | `this` | Jump to step `n` (1-indexed). Forward jumps validate every step between current and target. |
| `wiz.getStep()` | `number` | Current step number (1-indexed). |
| `wiz.getStepCount()` | `number` | Total number of steps. |
| `wiz.isFirst()` | `boolean` | True when on step 1. |
| `wiz.isLast()` | `boolean` | True when on the last step. |
| `wiz.markComplete(n)` | `this` | Manually mark step `n` as completed (updates indicator strip). |
| `wiz.reset()` | `this` | Return to step 1 and clear all completion flags. Clears field values and validation state. |
| `wiz.destroy()` | `this` | Detach all listeners and remove instance data. |

---

## Events

All events fire on the wizard root element. Handler signature: `function(event, instance, …args)`.

| Event | Extra args | Description |
|---|---|---|
| `wizard:beforechange` | `from, to, direction` | Fires before the step changes. Call `event.preventDefault()` to block it. |
| `wizard:change` | `from, to, direction` | Fires after the new step is visible and focused. |
| `wizard:complete` | — | Fires when the finish button passes validation on the last step. |
| `wizard:invalid` | `stepNum, $step` | Fires when a validation gate blocks next/goTo. |
| `wizard:reset` | — | Fires after `reset()` completes. |

`direction` is `'forward'`, `'backward'`, or `'none'` (initial render).

```js
$('#signup-wizard')
    .on('wizard:beforechange', function (e, inst, from, to) {
        if (to === 3 && !termsAccepted) {
            e.preventDefault(); // block the transition
        }
    })
    .on('wizard:change', function (e, inst, from, to, dir) {
        console.log('now on step', to, '(' + dir + ')');
    })
    .on('wizard:complete', function (e, inst) {
        $.post('/api/signup', collectFormData());
    })
    .on('wizard:invalid', function (e, inst, stepNum) {
        console.warn('Step', stepNum, 'failed validation');
    });
```

---

## Accessibility

- **ARIA roles**: indicator strip uses `role="tablist"`; each indicator item uses `role="tab"` with `aria-selected` and `aria-controls` pointing to the step panel. Step panels carry `role="tabpanel"`.
- **Live region**: every step change announces `"{title}. Step N of M."` to screen readers via an `aria-live="polite"` region.
- **Tab order**: inactive step panels have `tabindex="-1"` on all focusable descendants, confining keyboard navigation to the active step.
- **Focus management**: on step change, focus moves to the first `[autofocus]` element in the incoming step, or the first focusable field if none.
- **Keyboard shortcuts**: `Alt+->` / `Alt+<-` advance and retreat steps from anywhere inside the wizard.
- **Reduced motion**: slide animations are disabled entirely when `prefers-reduced-motion: reduce` is active.

---

## Recipes

### Signup form inside a `<form>` tag

```html
<form id="signup-form" action="/register" method="post">
  <div data-plugin-wizard id="signup-wizard"
       data-plugin-options='{"validate":"html5","submitForm":true}'>
    <!-- steps, indicators, nav … -->
  </div>
</form>
```

When `submitForm: true` (the default) and the last step passes validation, the plugin calls `form.submit()` on the nearest ancestor `<form>`.

---

### Disable form submission, handle via `wizard:complete`

```js
$('#signup-wizard').themestrapPluginWizard({ submitForm: false });

$('#signup-wizard').on('wizard:complete', async function (e, inst) {
    const payload = Object.fromEntries(new FormData(document.getElementById('signup-form')));
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (res.ok) window.location = '/dashboard';
});
```

---

### Block a specific transition with `wizard:beforechange`

```js
$('#onboarding').on('wizard:beforechange', function (e, inst, from, to) {
    // Don't allow skipping ahead past step 2 until a feature flag is set
    if (to > 2 && !window._featureUnlocked) {
        e.preventDefault();
        alert('Complete the tutorial first.');
    }
});
```

---

### Resume a multi-page onboarding flow

```html
<!-- Step is persisted under ts.wizard.step.onboarding -->
<div data-plugin-wizard id="onboarding"
     data-plugin-options='{"validate":false,"persist":true}'>
  …
</div>
```

On each page load the wizard opens at the last-visited step. All earlier steps are automatically marked complete so the indicator strip reflects progress correctly.

---

### Per-instance colour accent

```html
<!-- Primary flow: brand orange (default) -->
<div data-plugin-wizard id="wiz-signup">…</div>

<!-- Secondary flow: teal -->
<div data-plugin-wizard id="wiz-settings" style="--wizard-accent:#2ab8c8">…</div>

<!-- Purple for a premium upsell flow -->
<div data-plugin-wizard id="wiz-upgrade" style="--wizard-accent:#7c3aed">…</div>
```

---

### Programmatic jump from an external button

```html
<button data-wizard-goto="3" data-wizard-id="signup-wizard">
  Skip to review
</button>
```

The plugin validates every skipped step before jumping. If step 1 or 2 fails validation, the jump is blocked and `wizard:invalid` fires.

---

## Diagnostic Checklist

**Wizard shows all steps at once**
: The `[data-wizard-steps]` wrapper is missing or the CSS from `themestrap.plugin.wizard.js` failed to inject. Check that the STYLE_ID guard (`ts-wizard-styles`) is present in `<head>`.

**Indicator strip is empty**
: The `[data-wizard-indicators]` element must be present in the DOM when `build()` runs. If it is absent, no indicators are generated. Verify the element exists before the script initialises.

**Back button always visible (even on step 1)**
: The CSS rule `[data-plugin-wizard][data-wiz-first] [data-wizard-prev] { visibility: hidden; }` requires the root element to carry `data-wiz-first`. Confirm the attribute is toggled by `_syncNav()` (check the DOM in DevTools after init).

**Progress bar not moving**
: Ensure `[data-wizard-progress-bar]` is a direct child of `[data-wizard-progress]` (the track). The `width` style is applied to the fill bar, not the track.

**`wizard:complete` fires but the form doesn't submit**
: Either `submitForm` is `false`, or there is no ancestor `<form>` element. Wrap the wizard in `<form>` or handle submission in a `wizard:complete` listener.

**Validation always passes when `validate: 'html5'` is set**
: HTML5 constraint validation only fires on fields that have `required`, `pattern`, `minlength`, `type="email"`, etc. Check that your `<input>` elements carry the appropriate validation attributes.

**LocalStorage step not restored on reload**
: The wizard `id` attribute must be present and unique per page. The key written is `ts.wizard.step.{id}`. Open DevTools -> Application -> Local Storage to confirm it is being written.
