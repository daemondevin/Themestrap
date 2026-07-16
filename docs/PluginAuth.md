# Auth Guide

Themestrap's progressive-enhancement auth form plugin — inline validation, password show/hide, a five-segment strength meter, AJAX submission, PluginToast feedback, and loading state.

## [How It **Works**](#how-it-works)

PluginAuth wraps any HTML auth form (MODX Login extra or custom) without replacing it. It adds client-side validation on submit, per-field error feedback, optional AJAX handling, and visual loading state via the submit button. It does not generate the form markup — it discovers structure by `data-auth-*` attributes.

### Supported form actions

`login` · `register` · `forgot` · `reset` · `change` · `profile`

Set the action via `data-auth-action` on the `<form>`.

---

## [Quick **Start**](#quick-start)

```html
<form data-plugin-auth
      data-auth-action="login"
      data-plugin-options='{"ajax": false, "toasts": true}'
      method="post" action="">

  <div data-auth-field="username">
    <label for="auth-user">Username</label>
    <input id="auth-user" name="username" type="text"
           required data-auth-error class="form-control">
    <div data-auth-feedback class="invalid-feedback"></div>
  </div>

  <div data-auth-field="password">
    <label for="auth-pw">Password</label>
    <div class="input-group">
      <input id="auth-pw" name="password" type="password"
             required minlength="8"
             data-auth-strength data-auth-error class="form-control">
      <button type="button" class="btn btn-outline-secondary"
              data-auth-toggle-password>Show</button>
    </div>
    <div data-auth-strength-meter class="auth-strength"></div>
    <div data-auth-feedback class="invalid-feedback"></div>
  </div>

  <button type="submit" data-auth-submit class="btn btn-primary">
    <span data-auth-submit-label>Sign In</span>
    <span data-auth-spinner class="spinner-border spinner-border-sm d-none"></span>
  </button>
</form>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ajax` | bool | `false` | Submit via XHR and handle JSON response. |
| `redirect` | string | `''` | URL to redirect to after AJAX success. |
| `toasts` | bool | `true` | Emit PluginToast notifications on success/error. |
| `toastSuccessTitle` | string | `'Success'` | Title for the success toast. |
| `toastErrorTitle` | string | `'Sorry'` | Title for the error toast. |
| `successMessage` | string | `''` | Success toast body text. |
| `errorMessage` | string | `'Please check the form for errors.'` | Error toast body text. |
| `busyLabel` | string | `'Working...'` | Submit button label while submitting. |
| `messages.required` | string | `'This field is required.'` | Required validation message. |
| `messages.email` | string | `'Please enter a valid email address.'` | Email format message. |
| `messages.minlength` | string | `'Must be at least %s characters.'` | Min-length message (`%s` = length). |
| `messages.match` | string | `'Values do not match.'` | Field match message. |

---

## [Public **API**](#api)

```js
const auth = $('#myForm').data('__pluginAuth');

auth.validate();        // returns true | false
auth.setBusy(true);     // toggle loading state
auth.reset();           // clear all field error states
auth.destroy();
```

### Events

| Event | Arguments | Description |
|-------|-----------|-------------|
| `auth:validate` | `(instance, isValid)` | After client-side validation runs. |
| `auth:submit` | `(instance, formData)` | Before submission (AJAX or native). |
| `auth:success` | `(instance, response)` | After successful AJAX response. |
| `auth:error` | `(instance, error)` | After AJAX error or network failure. |

---
