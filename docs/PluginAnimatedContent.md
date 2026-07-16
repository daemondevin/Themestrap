# AnimatedContent Guide

Themestrap's text animation plugin — animates element content letter-by-letter or word-by-word with typewriter or Animate.css effects.

## [How It **Works**](#how-it-works)

PluginAnimatedContent splits the element's text content into individual characters (`letter` mode) or words (`word` mode), wraps each in a `<span>`, then staggers the animation class application with a timer. In `letter` mode with `animationName: 'typeWriter'`, letters appear sequentially with a blinking caret. In `word` mode, each word span is handed to PluginAnimate for Animate.css-style entrance effects.

---

## [Quick **Start**](#quick-start)

```html
<!-- Letter-by-letter typewriter -->
<h1 data-plugin-animated-content
    data-plugin-options='{"contentType":"letter","animationName":"typeWriter","animationSpeed":60}'>
  Hello, World.
</h1>

<!-- Word-by-word fade-in -->
<h2 data-plugin-animated-content
    data-plugin-options='{"contentType":"word","animationName":"fadeInUp","animationSpeed":120}'>
  This text animates word by word.
</h2>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentType` | string | `'letter'` | `'letter'` or `'word'`. |
| `animationName` | string | `'fadeIn'` | CSS animation class. Use `'typeWriter'` for the letter-mode typewriter effect. |
| `animationSpeed` | number | `50` | Delay between each letter/word in ms. |
| `startDelay` | number | `500` | Delay before animation begins in ms. |
| `minWindowWidth` | number | `768` | Minimum viewport width required to run the animation. |
| `letterClass` | string | `''` | Extra class on each letter `<span>`. |
| `wordClass` | string | `''` | Extra class on each word `<span>`. |
| `wrapperClass` | string | `''` | Extra class on the outer wrapper `<span>`. |
| `firstLoadNoAnim` | bool | `false` | Skip animation on first load (used inside carousels). |

### Control events

```js
// Re-run after a carousel slide change
$('[data-plugin-animated-content]')
  .trigger('animated.letters.initialize');

// Tear down and restore original text
$('[data-plugin-animated-content]')
  .trigger('animated.letters.destroy');
```

---
