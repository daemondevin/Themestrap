# Carousel Guide

Themestrap's full-featured carousel plugin — wraps Owl Carousel 2 with RTL auto-detection, nav/dot offset positioning, auto-height, carousel sync, AnimateIn/Out integration, and external navigation support.

## [How It **Works**](#how-it-works)

PluginCarousel is a thin but feature-rich wrapper around [Owl Carousel 2](https://owlcarousel2.github.io/OwlCarousel2/). It auto-detects RTL direction from `<html dir="rtl">`, resolves `data-plugin-options` JSON into the Owl config, wires up custom nav/dot positioning via injected CSS custom properties, coordinates PluginAnimate for per-slide entrance effects, re-injects PluginIcon instances on cloned slides, and manages cross-carousel sync.

### RTL detection

When `<html>` carries `dir="rtl"` the plugin automatically sets Owl's `rtl: true`. No extra config needed.

### AnimateIn/Out integration

Set `animateIn` / `animateOut` to any Animate.css class name and Owl handles per-slide enter/exit animations. PluginCarousel wires `PluginAnimate` for any `[data-appear-animation]` elements inside each slide on the `translated.owl.carousel` event.

### Cloned slide handling

Owl Carousel clones items for infinite loop mode. PluginCarousel listens to `initialized.owl.carousel` and `translated.owl.carousel` and re-runs `$.fn.themestrapPluginIcon` on any `[data-icon]` inside cloned slides, since cloned DOM nodes don't share the original plugin instances.

### External navigation

Any element with `data-carousel-navigate-id="myCarouselId"` and `data-carousel-go="next"` / `"prev"` will drive the matching carousel externally, without needing to be inside the Owl markup.

---

## [Quick **Start**](#quick-start)

```html
<div class="owl-carousel"
     data-plugin-carousel
     data-plugin-options='{
       "loop": true,
       "items": 3,
       "nav": true,
       "dots": true,
       "autoplay": true,
       "autoplayTimeout": 5000,
       "responsive": {
         "0":    {"items": 1},
         "768":  {"items": 2},
         "1200": {"items": 3}
       }
     }'>
  <div class="item"><img src="a.jpg" alt=""></div>
  <div class="item"><img src="b.jpg" alt=""></div>
  <div class="item"><img src="c.jpg" alt=""></div>
</div>
```

### Init.js Wiring

```js
if ($.isFunction($.fn['themestrapPluginCarousel'])
    && $('[data-plugin-carousel]').length) {
  themestrap.fn.intObsInit(
    '[data-plugin-carousel]:not(.manual)',
    'themestrapPluginCarousel'
  );
}
```

---

## [Configuration **Options**](#options)

All [Owl Carousel 2 options](https://owlcarousel2.github.io/OwlCarousel2/docs/api-options.html) are accepted. Themestrap-specific additions:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `loop` | bool | `true` | Infinite loop cloning. |
| `navText` | array | `[]` | Custom prev/next HTML strings (empty = CSS-only nav). |
| `refresh` | bool | `false` | Force a refresh after init (useful inside hidden tabs). |
| `navHorizontalOffset` | string | `''` | CSS value offsetting the nav element horizontally. |
| `navVerticalOffset` | string | `''` | CSS value offsetting the nav element vertically. |
| `dotsHorizontalOffset` | string | `''` | CSS value offsetting the dots. |
| `dotsVerticalOffset` | string | `''` | CSS value offsetting the dots. |
| `responsive` | object | `{0:1, 479:1, 768:2, 979:3, 1199:4}` | Breakpoints → `items` count. |

### Cross-carousel sync

```html
<!-- Primary carousel -->
<div id="main-slider" class="owl-carousel" data-plugin-carousel
     data-plugin-options='{"items":1,"nav":false}'>
  <div class="item">...</div>
</div>

<!-- Thumbnail carousel synced to the primary -->
<div class="owl-carousel" data-plugin-carousel
     data-plugin-options='{"items":4,"syncedCarouselId":"main-slider","center":true}'>
  <div class="item">...</div>
</div>
```

---

## [Instance **API**](#instance-api)

The Owl Carousel 2 instance is accessible via the standard Owl data key:

```js
const owl = $('.owl-carousel').data('owl.carousel');

owl.trigger('next.owl.carousel');   // go to next slide
owl.trigger('prev.owl.carousel');   // go to previous slide
owl.trigger('to.owl.carousel', [3]); // jump to slide index 3
owl.trigger('destroy.owl.carousel'); // destroy
```

### External navigation

```html
<!-- Place anywhere on the page -->
<button data-carousel-navigate-id="my-slider" data-carousel-go="prev">‹</button>
<button data-carousel-navigate-id="my-slider" data-carousel-go="next">›</button>

<div id="my-slider" class="owl-carousel" data-plugin-carousel ...>
  ...
</div>
```

---

## [Recipe **Cookbook**](#recipes)

#### Full-width hero with AnimateIn

```html
<div class="owl-carousel" data-plugin-carousel
     data-plugin-options='{
       "items": 1,
       "loop": true,
       "autoplay": true,
       "animateIn": "fadeIn",
       "animateOut": "fadeOut"
     }'>
  <div class="item">
    <h2 data-appear-animation="fadeInUp" data-appear-animation-delay="300">
      Slide One
    </h2>
  </div>
</div>
```

#### Responsive product grid carousel

```html
<div class="owl-carousel" data-plugin-carousel
     data-plugin-options='{
       "loop": false,
       "nav": true,
       "dots": false,
       "responsive": {
         "0":    {"items":1},
         "576":  {"items":2},
         "992":  {"items":3},
         "1200": {"items":4}
       }
     }'>
  <div class="item product-card">...</div>
</div>
```

---

## [Common **Pitfalls**](#pitfalls)

**Carousel inside a hidden tab or collapsed element.** Owl Carousel measures item widths at init time. If the carousel is inside a `display:none` parent, all measurements are zero and the layout breaks. Set `refresh: true` in options, or call `$(el).trigger('refresh.owl.carousel')` when the tab becomes visible.

**Cloned slides and event delegation.** Owl Carousel clones `.item` elements for infinite loop. Event listeners bound directly to `.item` elements won't fire on clones. Use event delegation on the `.owl-carousel` wrapper: `$('.owl-carousel').on('click', '.item .btn', handler)`.

**RTL nav arrow direction.** When RTL is active, Owl reverses internal slide order. If you supply custom `navText`, supply them in visual order (left arrow first) — Owl handles the RTL reversal.
