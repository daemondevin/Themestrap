# PluginAuth

A progressive-enhancement layer for sign-in forms that works with any backend. It wraps a form you wrote, and adds inline validation, a password show/hide button, a strength meter, a Caps Lock hint, busy and lockout states, and inline or toast feedback. Submission is handled by a pluggable **adapter**, so the same form can talk to MODX, a PHP session, Laravel, Django, a JWT REST API, Firebase, an OAuth provider, or anything else. Without JavaScript the form still submits natively.

| Feature | Notes |
| - | - |
| Validation | Required, email, `minlength`, `pattern`, match another field, custom validators. Messages are linked to inputs with `aria-describedby` |
| Password helpers | Show/hide, strength meter, Caps Lock warning |
| Adapters | `form` (native), `json`, `modx`, `rest`, or your own object or function |
| Replies | Understands `{success}`, `{ok}`, `{status}`, `{error}`, Laravel, DRF and `[{field, message}]` shapes out of the box, or supply `normalize` |
| CSRF | Picked up automatically from a hidden field, a `<meta>` tag or the `XSRF-TOKEN` cookie |
| Tokens | Optional memory, session or local storage for APIs that answer with a token |
| Multi-step | A `[data-auth-step]` section is revealed when the server asks for a code (OTP, MFA) |
| Providers | `[data-auth-provider]` buttons for OAuth or social sign-in, by redirect or popup |
| Lockout | `retryAfter` or a `Retry-After` header disables the button with a live countdown |
| Redirects | Same-origin only, unless you allow otherwise. Cancelable event |
| Messages | An inline status area (`[data-auth-message]`), plus toasts when PluginToast is loaded |
| Theming | `--ts-au-*` tokens with light, dark and explicit-light tiers. Works with or without Bootstrap |

The plugin is backward compatible. Forms written for earlier versions (including MODX Login and FormIt forms) work unchanged.



## How It Works

```
initialize → setData → setOptions → build → events → destroy
```

1. **`initialize`** exits early when the element already has an instance. It reads the action from `data-auth-action` (default `login`).
2. **`setData`** stores the instance on the form as `__pluginAuth`.
3. **`setOptions`** merges `PluginAuth.defaults` with your options. Functions (`normalize`, `beforeSubmit`, `transform`), adapter objects, `validators`, `providers` and `response` are kept exactly as given.
4. **`build`** injects the stylesheet once, caches fields, links feedback text to inputs, and hides all but the first `[data-auth-step]`.
5. **`events`** binds submit, blur, input, the password toggle, provider buttons and the Caps Lock hint.
6. **`destroy`** unbinds everything, stops any lockout timer, and removes the stylesheet when the last instance goes.

### What happens on submit

```
submit event
  └─ validate (visible steps only)  ──invalid──▶ inline message, focus first bad field
        │ valid
        ▼
  collect fields (all steps + the pressed button) → ts.auth.submit event
        ▼
  beforeSubmit(data)  (optional, may be async, return false to cancel)
        ▼
  adapter 'form'?  ──yes──▶ browser posts the form natively (requestSubmit with the button)
        │ no
        ▼
  transform(data) → adapter.submit(ctx) → result
        ▼
  challenge?  ▶ reveal step      ok?  ▶ token, message, redirect      failed?  ▶ field errors, message, lockout
```

### A result

Every adapter resolves to the same shape, and the built-in ones build it from the server's reply:

| Key | Meaning |
| - | - |
| `ok` | `true` for a successful sign-in |
| `message` | Text for the status area or a toast |
| `errors` | `{ fieldName: 'message' }`, painted next to the inputs |
| `redirect` | Where to go after success |
| `token` | A token to store, when `token.store` is set |
| `challenge` | A step name such as `otp`, to reveal instead of finishing |
| `retryAfter` | Seconds to disable the button for |

### Understanding replies (the `json` adapter)

| The server sends | Result |
| - | - |
| `{ "success": true }` or `{ "ok": true }` | success |
| `{ "success": false, "message": "…" }` | failure with that message |
| `{ "status": "error", "detail": "…" }` | failure |
| `{ "error": "invalid_grant", "error_description": "…" }` | failure, using the description |
| `{ "message": "…", "errors": { "email": ["Required"] } }` (Laravel, HTTP 422) | failure, field errors painted |
| `{ "password": ["Too short"] }` (Django REST Framework, HTTP 400) | failure, field errors painted |
| `{ "errors": [{ "field": "username", "message": "Taken" }] }` | failure, field errors painted |
| HTTP `204 No Content` | success |
| `{ "token": "…" }`, `access_token`, `accessToken`, `jwt` | token captured |
| `{ "redirect": "/dash" }` (also `redirect_url`, `next`, a `Location` header) | redirect target |
| `{ "challenge": "code" }` | reveal the step named `code` |
| `{ "mfa_required": true }` or `requires_otp` | reveal the step named `otp` |
| `Retry-After` header or `retryAfter` / `retry_after` | lockout countdown |
| A page of HTML | failure, "The server sent a reply this form could not understand." |

The last row matters: a login page that answers a failed attempt with a normal HTML page and status 200 is never mistaken for success.

### Dependencies

| Plugin | Needed when |
| - | - |
| jQuery | Always |
| PluginToast | Optional. Toasts are used in addition to the inline message when it is loaded |

No Bootstrap is required. Where Bootstrap supplies a class (`is-invalid`, `d-none`, `spinner-border`), the plugin's stylesheet provides a low-specificity fallback, so Bootstrap always wins and the form still looks right without it.

### Stylesheet injection

`<style id="ts-auth-styles">` is injected lazily from `build()`, guarded by `STYLE_ID`, and removed when the last instance is destroyed. A page with a strict Content Security Policy must allow inline styles, or include the rules in its own stylesheet.



## Quick Start

### Include the plugin

```html
<script src="js/components/themestrap.plugin.auth.js"></script>
```

### A form (native submit, validation only)

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

### Send it with fetch instead

```html
<form data-plugin-auth data-auth-action="login" method="post" action="/api/login"
      data-plugin-options='{"adapter": "json", "redirect": "/dashboard"}'>
```

### Init wiring (`themestrap.init.js`)

Auth forms should work immediately, so they initialize on DOM ready rather than when scrolled into view. This is the wiring `themestrap.init.js` already has:

```js
// Auth
if (typeof $.fn['themestrapPluginAuth'] === 'function' && $('[data-plugin-auth]').length) {
    $(function () {
        $('[data-plugin-auth]:not(.manual)').each(function () {
            const $this = $(this);
            const opts  = themestrap.fn.getOptions($this.data('plugin-options')) || undefined;
            $this.themestrapPluginAuth(opts);
        });
    });
}
```

### Manual init, for options that cannot be JSON

```js
$('#login').themestrapPluginAuth({
    adapter: 'rest',
    endpoints: { login: '/api/v1/sessions' },
    token: { store: 'session' },
    beforeSubmit: function (data) { data.device = navigator.userAgent; return data; }
});
```

PluginAuth is wired in `themestrap.init.js` (as above). It has no entry in `themestrap.modules.js`, the on-demand loader manifest.



## Markup Reference

| Attribute | Element | Notes |
| - | - | - |
| `data-plugin-auth` | Form (or a button, for `logout`) | Init hook |
| `data-plugin-options` | Host | JSON options |
| `data-auth-action` | Host | `login`, `register`, `forgot`, `reset`, `change-password`, `profile`, `logout`, or your own. Adds `auth-form-<action>` and selects `options.endpoints[action]` |
| `data-auth-field="name"` | Wrapper | Groups one input with its feedback |
| `data-auth-error` | Input | Opt this input into validation |
| `data-auth-feedback` | Inside a field | Receives the error text |
| `data-auth-message` | Anywhere in the form | Inline status area. If absent and PluginToast is not loaded, one is created |
| `data-auth-submit`, `-submit-label`, `-spinner` | Button and its children | Busy and lockout state |
| `data-auth-toggle-password` | Button | Show or hide the password in the same field |
| `data-auth-strength`, `data-auth-strength-meter` | Input and a container | Strength meter |
| `data-auth-capslock` | Element | Shown while Caps Lock is on |
| `data-auth-match="#selector"` | Input | Must equal another field |
| `data-auth-validate="name"` | Input | Runs `options.validators[name]` |
| `data-auth-step="name"` | Section | A step of a multi-step flow. Only the first shows at the start |
| `data-auth-provider="name"` | Button | Starts the matching entry in `options.providers` |
| `data-auth-redirect`, `data-auth-success-msg`, `data-auth-error-msg` | Form | Per-form overrides |
| `data-auth-url` | Non-form host | The endpoint, for a logout button |

### Generated classes

| Class | Element | Meaning |
| - | - | - |
| `auth-form`, `auth-form-<action>` | Host | Always |
| `is-invalid`, `is-valid` | Input | Validation state (names come from `options.classes`) |
| `auth-message`, `auth-message--error/--success/--info` | Message area | Current feedback |
| `auth-strength`, `auth-strength-bar`, `auth-strength-bar--on` | Meter | Strength display, with `data-score` 0 to 4 |

Fields in a hidden step are skipped by validation but are still sent, so a code step can be submitted together with the credentials entered earlier.



## Configuration Options

### Transport

| Option | Type | Default | Description |
| - | - | - | - |
| `adapter` | `string \| object \| function` | `null` | `'form'`, `'json'`, `'modx'`, `'rest'`, a registered name, `{ submit(ctx) }`, or a function. `null` means `'json'` when `ajax` is true, otherwise `'form'` |
| `ajax` | `boolean` | `false` | Shorthand for `adapter: 'json'` |
| `url` | `string` | `''` | Overrides the form action |
| `endpoints` | `object` | `{}` | Per action: `{ login: '/api/login', register: '/api/register' }` |
| `method` | `string` | `''` | Overrides the form method |
| `encoding` | `'form' \| 'json'` | `'form'` | Request body format. The `rest` adapter uses `'json'` |
| `headers` | `object` | `{}` | Extra request headers |
| `credentials` | `string` | `'same-origin'` | fetch credentials mode. Use `'include'` for cross-site cookies |
| `timeout` | `number` | `20000` | Milliseconds before the request is aborted. `0` disables |
| `csrf` | `'auto' \| false \| object` | `'auto'` | `{ header, field, token, cookie }`. See [CSRF](#csrf) |

### Understanding replies

| Option | Type | Default | Description |
| - | - | - | - |
| `response` | `object` | `{}` | Map names to paths or functions: `{ success: 'data.ok', token: 'data.jwt', message: (body, res) => … }`. Keys: `success`, `message`, `errors`, `redirect`, `token`, `challenge`, `retryAfter` |
| `normalize` | `function` | `null` | `function (body, res, options, ctx)` returning a full result. Replaces the default understanding |

### Flow

| Option | Type | Default | Description |
| - | - | - | - |
| `beforeSubmit` | `function` | `null` | `function (data, ctx)`. Return the data, `false` to cancel, or a Promise of either. Works with every adapter, including `'form'` |
| `transform` | `function` | `null` | `function (data, ctx)` returning the object to send, for renaming fields |
| `redirect` | `string` | `''` | Where to go after success |
| `redirectDelay` | `number` | `600` | Milliseconds before redirecting |
| `allowExternalRedirect` | `boolean` | `false` | Allow redirects to other sites. Off by default so a forged reply cannot send users away |

### Tokens

| Option | Type | Default | Description |
| - | - | - | - |
| `token.store` | `false \| 'memory' \| 'session' \| 'local'` | `false` | Where to keep a token from a successful reply |
| `token.key` | `string` | `'ts_auth_token'` | Storage key |
| `token.header` | `string` | `'Authorization'` | Header sent on later requests made by this form |
| `token.scheme` | `string` | `'Bearer'` | Prefix for the header value. `''` for none |

### Providers

| Option | Type | Default | Description |
| - | - | - | - |
| `providers` | `object` | `{}` | `{ github: { url, mode, origin, width, height } }`. `mode` is `'redirect'` (default) or `'popup'` |

### Feedback and labels

| Option | Type | Default |
| - | - | - |
| `toasts` | `boolean` | `true` |
| `messageTarget` | `string` | `'[data-auth-message]'` |
| `successMessage`, `errorMessage` | `string` | `''`, `'Please check the form for errors.'` |
| `networkErrorMessage` | `string` | `'Could not reach the server. Please try again.'` |
| `popupBlockedMessage` | `string` | `'The sign in window was blocked. Please allow pop-ups and try again.'` |
| `unexpectedResponseMessage` | `string` | `'The server sent a reply this form could not understand.'` |
| `busyLabel`, `lockedLabel` | `string` | `'Working...'`, `'Try again in %s'` |
| `showPasswordLabel`, `hidePasswordLabel` | `string` | `'Show'`, `'Hide'` |
| `toastSuccessTitle`, `toastErrorTitle` | `string` | `'Success'`, `'Sorry'` |
| `classes` | `object` | `{ invalid: 'is-invalid', valid: 'is-valid', hidden: 'd-none' }` |
| `validators` | `object` | `{}` |
| `messages` | `object` | `required`, `email`, `minlength` (with `%s`), `pattern`, `match` |

`adapter`, `encoding` and the rest of the transport options are read when the instance is built. To change them, `destroy()` and initialize again.



## Adapters

An adapter is anything with a `submit(ctx)` method that resolves to a result. The context carries everything it needs:

| `ctx` key | Meaning |
| - | - |
| `action` | `'login'`, `'register'`, … |
| `data` | The collected (and transformed) fields as an object |
| `url`, `method` | Resolved from `endpoints`, `url`, the form action and `method` |
| `form` | The form element, or `null` |
| `options` | The merged options |
| `csrf` | `{ value, header }` or `null` |
| `submitter` | The button that was pressed |
| `instance` | The `PluginAuth` instance |

### Built in

| Adapter | Behavior |
| - | - |
| `form` | The browser posts the form. No network handling. This is the default |
| `json` | `fetch` (or `$.ajax` on old browsers), form-encoded by default, replies understood as above |
| `modx` | `json` with form-encoded bodies. The shape used by the MODX Login and FormIt extras |
| `rest` | `json` with JSON bodies |

### Registering your own

```js
themestrap.PluginAuth.registerAdapter('firebase', {
    submit: async function (ctx) {
        try {
            const cred = await firebase.auth().signInWithEmailAndPassword(ctx.data.email, ctx.data.password);
            return { ok: true, message: 'Signed in', token: await cred.user.getIdToken(), redirect: '/app' };
        } catch (e) {
            return { ok: false, message: e.message };
        }
    }
});
```

```html
<form data-plugin-auth data-plugin-options='{"adapter": "firebase", "token": {"store": "session"}}'>
```

A function works too: `adapter: function (ctx) { return Promise.resolve({ ok: true }); }`.



## CSRF

With `csrf: 'auto'` the plugin looks for a token in this order and sends it as a request header:

1. A hidden field named `_csrf`, `csrf_token`, `csrfmiddlewaretoken`, `authenticity_token`, `_token` or `__RequestVerificationToken`
2. `<meta name="csrf-token">` (also `csrf` and `_csrf`)
3. The `XSRF-TOKEN` cookie, sent as `X-XSRF-TOKEN`

The default header is `X-CSRF-Token`. Override it, or give a token yourself:

```js
csrf: { header: 'X-CSRFToken', token: () => Cookies.get('csrftoken') }
```

A hidden field is also part of the form body, so frameworks that read the field keep working. Set `csrf: false` to send nothing extra.



## Multi-step sign-in

Give each stage a `data-auth-step`. Only the first shows at first:

```html
<form data-plugin-auth data-plugin-options='{"adapter": "json"}' action="/api/login">
    <div data-auth-step="credentials">
        <!-- username and password fields -->
    </div>
    <div data-auth-step="otp">
        <div data-auth-field="code">
            <label for="c">6-digit code</label>
            <input id="c" name="code" inputmode="numeric" required data-auth-error>
            <div data-auth-feedback></div>
        </div>
    </div>
    <button type="submit" data-auth-submit>…</button>
</form>
```

When the reply contains a `challenge` (the step's name), that step is revealed and focused. `mfa_required` and `requires_otp` are shorthand for a step named `otp`. A name with no matching step changes nothing, so the form is never hidden by mistake. The next submit sends the code together with the credentials. Call `auth.showStep('credentials')` to go back.



## Public API

```js
const auth = $('#login').data('__pluginAuth');
```

| Method | Returns | Description |
| - | - | - |
| `validate()` | `boolean` | Validate the visible fields and focus the first error |
| `submit()` | `this` | Validate and send, as if the button was pressed |
| `setBusy(bool)` | `this` | Busy state on the submit button |
| `setMessage(text, type)` | `this` | `type` is `'error'`, `'success'` or `'info'` |
| `clearMessage()` | `this` | Clear the status area |
| `setErrors({ name: 'msg' })` | `this` | Paint field errors |
| `showStep(name)`, `getStep()` | `this`, `string` | Multi-step control |
| `getToken()`, `setToken(t)`, `clearToken()` | | Token storage, per `token.store` |
| `provider(name)` | `this` | Start a provider sign-in from code |
| `reset()` | `this` | Clear errors and messages |
| `destroy()` | `this` | Remove everything |

Static helpers on `themestrap.PluginAuth`:

| Helper | Description |
| - | - |
| `registerAdapter(name, adapter)` | Add a named adapter |
| `adapters` | The registry |
| `getToken(key, store)` | Read a stored token |
| `authHeaders(tokenOptions)` | `{ Authorization: 'Bearer …' }` for your own `fetch` calls after sign-in |

The jQuery bridge returns a set of instances, not elements. Retrieve instances from a fresh selection with `.data('__pluginAuth')`.



## Events

Every event is both a jQuery event (as in earlier versions) and a native `CustomEvent` that bubbles from the form.

| jQuery | Native | Arguments or `detail` |
| - | - | - |
| `auth:validate` | `ts.auth.validate` | `(instance, isValid)` / `{ instance, valid }` |
| `auth:submit` | `ts.auth.submit` | `(instance, data)` / `{ instance, data }` |
| `auth:success` | `ts.auth.success` | `(instance, result)` / `{ instance, result }` |
| `auth:error` | `ts.auth.error` | `(instance, result)` / `{ instance, result }` |
| `auth:challenge` | `ts.auth.challenge` | `(instance, step)` / `{ instance, step, result }` |
| `auth:token` | `ts.auth.token` | `(instance, token)` / `{ instance, token }` |
| none | `ts.auth.redirect` | `{ url, instance }`. **Cancelable**: call `preventDefault()` to stay on the page |

```js
document.getElementById('login').addEventListener('ts.auth.redirect', function (e) {
    e.preventDefault();               // handle navigation yourself
    router.go(e.detail.url);
});
```

For network failures, `auth:error` carries `{ network: true, error }`.



## CSS Custom Properties

| Property | Light default | Dark default | Used for |
| - | - | - | - |
| `--ts-au-invalid` | `#dc3545` | `#f87171` | Error text and borders |
| `--ts-au-valid` | `#198754` | `#4ade80` | Valid borders and success messages |
| `--ts-au-muted` | `#6c757d` | `#9fb3c8` | Strength label |
| `--ts-au-track` | `#e9ecef` | `rgba(255,255,255,.12)` | Empty strength bars |
| `--ts-au-warn-bg`, `--ts-au-warn-text` | `#fff3cd`, `#664d03` | amber tints | Caps Lock badge |
| `--ts-au-info-bg`, `--ts-au-info-text` | `#e7f1ff`, `#0a3c7d` | blue tints | Info messages |

Theme resolution follows the standard three tiers: `prefers-color-scheme`, then `html.dark` and `[data-bs-theme="dark"]`, then an explicit `[data-bs-theme="light"]`.



## Keyboard Navigation

The plugin does not capture keys. `Enter` submits the form as usual, and focus moves to the first invalid field after a failed validation. The password toggle is a normal button.



## ARIA Wiring

| Element | Attributes |
| - | - |
| Invalid input | `aria-invalid="true"`, `aria-describedby` pointing at its feedback element |
| Message area | `role="alert"` for errors, `role="status"` otherwise |
| Submit button | `aria-busy` while working |
| Password toggle | `aria-pressed` |

Messages are written into elements that already exist, so screen readers announce them without extra work.



## Recipes

### A PHP session (the Themestrap Blog)

The server answers JSON when the request carries `X-Requested-With`, and a normal page otherwise, so the form works with and without JavaScript.

```php
if (password_verify($_POST['password'], $hash)) {
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    echo json_encode(['ok' => true, 'redirect' => '/admin']);
} else {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'That password is not right.']);
}
```

```js
$('#login').themestrapPluginAuth({ adapter: 'modx', toasts: false });
```

### MODX Login extra

```html
<form data-plugin-auth data-auth-action="login" method="post" action="">
    <input type="hidden" name="returnUrl" value="">
    <!-- fields -->
    <button type="submit" name="service" value="login" data-auth-submit>…</button>
</form>
```

With the default native adapter the pressed button's `service=login` is preserved. With `ajax: true` it is included in the body.

### Laravel (session and CSRF)

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```

```js
$('#login').themestrapPluginAuth({ adapter: 'json', url: '/login', redirect: '/home' });
```

422 replies with `errors: { email: [...] }` paint the field errors with no mapping.

### Django REST Framework

```js
$('#login').themestrapPluginAuth({
    adapter: 'rest',
    url: '/api/auth/login/',
    csrf: { header: 'X-CSRFToken', cookie: 'csrftoken' },
    response: { token: 'key' }
});
```

### A JWT API

```js
$('#login').themestrapPluginAuth({
    adapter: 'rest',
    url: 'https://api.example.com/auth/login',
    credentials: 'omit',
    csrf: false,
    token: { store: 'session' },
    redirect: '/app'
});

// Later, from your own code
fetch('https://api.example.com/me', { headers: themestrap.PluginAuth.authHeaders({ store: 'session' }) });
```

### A different field naming

```js
$('#login').themestrapPluginAuth({
    adapter: 'rest',
    transform: (data) => ({ email: data.username, pass: data.password })
});
```

### OAuth

```html
<button type="button" data-auth-provider="github">Continue with GitHub</button>
```

```js
providers: {
    github: { url: '/auth/github' },                                    // full redirect
    google: { url: '/auth/google', mode: 'popup', width: 480, height: 640 }
}
```

A popup reports back with `window.opener.postMessage({ type: 'ts-auth', ok: true, redirect: '/app' }, location.origin)`. Messages from other origins are ignored unless you set `origin`.

### Extra work before sending (setup wizards)

```js
beforeSubmit: function (data) {
    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return fetch('/probe').then(r => r.json()).then(p => { data.probe = p; return data; });
}
```

### A logout button

```html
<button data-plugin-auth data-auth-action="logout" data-auth-url="/logout"
        data-plugin-options='{"adapter": "json", "redirect": "/"}'>Sign out</button>
```

The stored token is cleared on success.

### Rate limiting

Reply with HTTP `429` and a `Retry-After` header, or `{ "retryAfter": 600 }`. The button is disabled and counts down ("Try again in 9:58").



## Common Pitfalls

**Nothing happens when the form is submitted.** Check that the plugin file loaded after jQuery and that the form has `data-plugin-auth`. A form with `.manual` is skipped by the auto-init loop.

**It reloads the page instead of using fetch.** The adapter is `'form'`. Set `adapter: 'json'` (or `ajax: true`).

**A failed login is reported as success.** It cannot be, for the `json` adapter: a reply that is not JSON is an error. A custom `normalize` that treats any 200 as success can.

**Field errors appear but nothing is highlighted.** The server's field names must match the inputs' `name` attributes.

**A hidden step's required field blocks submission.** It does not: fields in a `[hidden]` step are skipped. Make sure the step wrapper uses the `hidden` attribute (the plugin does this for you), not a custom class.

**The redirect does nothing.** Redirects to another origin are refused. Set `allowExternalRedirect: true` for a trusted site, or handle `ts.auth.redirect` yourself.

**`$el.on('ts.auth.success', …)` never fires.** jQuery treats dots as namespaces. Use `addEventListener`, or the jQuery names (`auth:success`).

**Inline styles are blocked.** The stylesheet is injected through a `<style>` element. Allow inline styles in your Content Security Policy, or copy the rules into your own CSS.

### Diagnostic checklist

1. Is jQuery loaded before `themestrap.plugin.auth.js`?
2. Does `$('#form').data('__pluginAuth')` return an instance?
3. Which adapter is active? `auth.adapter`
4. In the Network tab, does the request go to the URL you expect, with the CSRF header?
5. What does the reply look like? Compare it with the table under [Understanding replies](#understanding-replies-the-json-adapter), or supply `normalize`.
6. Is `<style id="ts-auth-styles">` in the head?
