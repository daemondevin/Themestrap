# CarouselLight Guide

Themestrap's dependency-free lightweight carousel — drives pre-built Owl Carousel markup with `fadeIn`/`fadeOut` CSS classes, autoplay, swipe events, and external navigation, without requiring the Owl Carousel JS library.

## [How It **Works**](#how-it-works)

PluginCarouselLight works with the _same markup structure_ as Owl Carousel (`owl-item`, `owl-next`, `owl-prev`, `owl-dot`) but drives transitions itself using CSS `fadeIn`/`fadeOut` classes. The Owl Carousel JS library is not required. One slide is visible at a time. Autoplay advances on a timer; swipe events (via jQuery.swipe if available) and dot/arrow clicks navigate manually.

---

## [Quick **Start**](#quick-start)

```html
<div class="owl-carousel owl-loaded"
     data-plugin-carousel-light
     data-plugin-options='{"autoplay": true, "autoplayTimeout": 5000}'>

  <div class="owl-stage-outer">
    <div class="owl-stage">
      <div class="owl-item active">Slide 1</div>
      <div class="owl-item">Slide 2</div>
      <div class="owl-item">Slide 3</div>
    </div>
  </div>

  <button class="owl-prev">‹</button>
  <button class="owl-next">›</button>

  <div class="owl-dots">
    <button class="owl-dot active"><span></span></button>
    <button class="owl-dot"><span></span></button>
    <button class="owl-dot"><span></span></button>
  </div>

</div>
```

---

## [Configuration **Options**](#options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoplay` | bool | `true` | Auto-advance slides on a timer. |
| `autoplayTimeout` | number | `7000` | Auto-advance interval in ms. |
| `disableAutoPlayOnClick` | bool | `true` | Stop autoplay when the user interacts. |
| `swipeEvents` | bool | `true` | Enable swipe navigation (requires jQuery.swipe). |

---

## [Common **Pitfalls**](#pitfalls)

**Markup must already be in the Owl structure.** CarouselLight expects `.owl-item`, `.owl-stage`, `.owl-prev`, `.owl-next`, `.owl-dot` to already be in the DOM. Typically this markup is pre-built server-side by a MODX chunk.

**Only one item visible at a time.** This is a single-item fade carousel. For multi-item sliders use PluginCarousel (Owl Carousel 2).

---
