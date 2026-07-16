# Account Guide

Themestrap's header account flyout singleton — switches between sign-in, sign-up, and password-recovery panels inside a shared flyout wrapper.

## [How It **Works**](#how-it-works)

`themestrap.Account` is a singleton that manages a set of named panels inside a flyout container (default `#headerAccount`). Clicking trigger elements by ID switches visibility using CSS class toggling (`signin`, `signup`, `recover`). Auto-focuses the first input in each panel. Subsequent calls to `initialize()` are no-ops.

---

## [Quick **Start**](#quick-start)

```html
<div id="headerAccount" class="signin">
  <div class="signin-panel">
    <form><!-- sign in form --></form>
    <a id="headerSignUp">Create an account</a>
    <a id="headerRecover">Forgot password?</a>
  </div>
  <div class="signup-panel">
    <form><!-- register form --></form>
    <a id="headerSignIn">Back to sign in</a>
  </div>
  <div class="recover-panel">
    <form><!-- forgot password form --></form>
    <a id="headerRecoverCancel">Cancel</a>
  </div>
</div>
```

```js
themestrap.Account.initialize();
```

### Trigger IDs

| ID | Action |
|----|--------|
| `#headerSignUp` | Switch to sign-up panel |
| `#headerSignIn` | Switch to sign-in panel |
| `#headerRecover` | Switch to recover panel |
| `#headerRecoverCancel` | Return to sign-in from recover |

---
