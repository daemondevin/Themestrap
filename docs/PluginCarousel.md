# PluginCarousel Guide

`PluginCarousel` is a feature-rich, dependency-free carousel. It provides responsive multi-item slides, looping, multiple transition effects, autoplay, navigation controls, dots, counters, progress indicators, thumbnails, keyboard navigation, mouse/touch dragging, lazy loading, media control, RTL support, vertical orientation, and accessibility features.

## Features

* Horizontal or vertical carousels
* Responsive item counts
* Slide, fade, and zoom transitions
* Infinite looping
* Grouped slide navigation
* Autoplay
* Pause autoplay on:

  * Hover
  * Focus
  * Page visibility changes
* Previous/next navigation
* Custom navigation icons
* Dot navigation
* Dot styles:

  * Default
  * Line
  * Number
* Slide counter
* Autoplay progress bar
* Thumbnail navigation
* External thumbnail containers
* Mouse dragging
* Touch/swipe dragging
* Keyboard navigation
* RTL support
* Stage padding / adjacent-slide reveal
* Configurable gaps between slides
* Automatic height adjustment
* Lazy-loaded images
* Video/audio pausing and autoplay
* ARIA carousel semantics
* `PluginAnimate` integration
* `PluginIcon` integration
* Public JavaScript API
* Custom DOM events
* Runtime destruction and restoration



## Basic Usage

### HTML

The plugin treats the direct children of the carousel element as slides.

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

### JavaScript

```js
$('#my-carousel').themestrapPluginCarousel();
```

The plugin automatically converts the original child elements into carousel items.



## Initialization Options

Options can be supplied as an object:

```js
$('#my-carousel').themestrapPluginCarousel({
    items: 3,
    loop: true,
    speed: 500,
    autoplay: true
});
```



## Options

### Core

| Option       | Type    |                          Default | Description                                        |
| - | - | -: | -- |
| `items`      | Number  |                              `1` | Number of visible slides in slide mode.            |
| `loop`       | Boolean |                           `true` | Enables seamless looping.                          |
| `transition` | String  |                        `'slide'` | Transition type: `slide`, `fade`, or `zoom`.       |
| `speed`      | Number  |                            `500` | Transition duration in milliseconds.               |
| `easing`     | String  | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing function used for transitions.          |
| `group`      | Number  |                              `1` | Number of slides to advance per navigation action. |

### Example

```js
$('#carousel').themestrapPluginCarousel({
    items: 3,
    loop: true,
    transition: 'slide',
    speed: 400,
    easing: 'ease-out',
    group: 1
});
```

### Transition Types

#### Slide

```js
transition: 'slide'
```

The default transition. Supports multiple visible items, responsive item counts, looping, dragging, and grouped navigation.

#### Fade

```js
transition: 'fade'
```

Uses a cross-fade between slides.

Non-slide transitions automatically force:

```js
items: 1
```

#### Zoom

```js
transition: 'zoom'
```

Uses a fade/scale transition when changing slides.

Like fade, zoom supports only one visible item.



## Responsive Items

Responsive item counts can be configured with the `responsive` option.

```js
$('#carousel').themestrapPluginCarousel({
    items: 1,

    responsive: {
        576: {
            items: 2
        },

        768: {
            items: 3
        },

        1200: {
            items: 4
        }
    }
});
```

The breakpoint represents the minimum viewport width at which the configuration applies.

For example:

```text
< 576px       → 1 item
576px+        → 2 items
768px+        → 3 items
1200px+       → 4 items
```

Responsive item counts apply to `slide` transitions.



## Autoplay

Autoplay can be enabled with:

```js
autoplay: true
```

The interval is controlled with `autoplaySpeed`.

```js
$('#carousel').themestrapPluginCarousel({
    autoplay: true,
    autoplaySpeed: 4000
});
```

The default interval is:

```js
autoplaySpeed: 5000
```

### Autoplay Pause Behavior

Autoplay can automatically pause when the user interacts with the carousel.

```js
{
    autoplay: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnVisibility: true
}
```

### Pause on Hover

```js
pauseOnHover: true
```

Stops autoplay while the pointer is over the carousel.

### Pause on Focus

```js
pauseOnFocus: true
```

Stops autoplay while the carousel or one of its controls has focus.

This is particularly useful for keyboard users.

### Pause on Visibility

```js
pauseOnVisibility: true
```

Uses the Page Visibility API to stop autoplay when the browser tab becomes hidden.



## Navigation

Previous/next navigation is enabled by default:

```js
nav: true
```

Disable it with:

```js
nav: false
```

```js
$('#carousel').themestrapPluginCarousel({
    nav: false
});
```

The plugin generates the navigation controls automatically.



## Custom Navigation Icons

The `navText` option accepts an array containing the previous and next button contents.

```js
$('#carousel').themestrapPluginCarousel({
    navText: [
        '<span class="my-prev-icon">‹</span>',
        '<span class="my-next-icon">›</span>'
    ]
});
```

The values are inserted as HTML, making SVG icons particularly useful.

```js
navText: [
    '<svg ...>...</svg>',
    '<svg ...>...</svg>'
]
```

If `navText` is not supplied, Themestrap uses built-in SVG icons.

For vertical carousels, the default icons automatically change to up/down arrows.



## Dots

Dots are enabled by default:

```js
dots: true
```

Disable them with:

```js
dots: false
```

```js
$('#carousel').themestrapPluginCarousel({
    dots: false
});
```



## Dot Styles

The `dotType` option supports three styles.

## Default

```js
dotType: 'default'
```

Displays circular indicators.

## Line

```js
dotType: 'line'
```

Displays horizontal line indicators.

```js
$('#carousel').themestrapPluginCarousel({
    dotType: 'line'
});
```

The active line expands to twice its normal width.

## Number

```js
dotType: 'number'
```

Displays numbered indicators.

```js
$('#carousel').themestrapPluginCarousel({
    dotType: 'number'
});
```



## Counter

A slide counter can be enabled with:

```js
counter: true
```

```js
$('#carousel').themestrapPluginCarousel({
    counter: true
});
```

The counter displays the current slide and total number of slides:

```text
01 / 05
```

The current slide number updates as the carousel changes.



## Progress Bar

Enable the autoplay progress indicator with:

```js
progressBar: true
```

```js
$('#carousel').themestrapPluginCarousel({
    autoplay: true,
    autoplaySpeed: 5000,
    progressBar: true
});
```

The progress bar tracks the current autoplay interval.

### Position

The progress bar can appear above or below the carousel.

```js
progressPosition: 'top'
```

or:

```js
progressPosition: 'bottom'
```

The default is:

```js
progressPosition: 'bottom'
```

Example:

```js
$('#carousel').themestrapPluginCarousel({
    autoplay: true,
    progressBar: true,
    progressPosition: 'top'
});
```



## Thumbnails

Thumbnail navigation can be enabled with:

```js
thumbs: true
```

```js
$('#carousel').themestrapPluginCarousel({
    thumbs: true
});
```

The plugin attempts to find thumbnail images in the following order:

1. `data-thumb` on the slide
2. The first `<img>` inside the slide
3. A numbered placeholder if no image is available

### Example

```html
<div id="carousel">
    <div data-thumb="/images/thumb-1.jpg">
        <img src="/images/slide-1.jpg" alt="Slide 1">
    </div>

    <div data-thumb="/images/thumb-2.jpg">
        <img src="/images/slide-2.jpg" alt="Slide 2">
    </div>

    <div data-thumb="/images/thumb-3.jpg">
        <img src="/images/slide-3.jpg" alt="Slide 3">
    </div>
</div>
```



## External Thumbnail Container

Thumbnails can be rendered into another element by using `thumbsEl`.

```html
<div id="carousel">
    ...
</div>

<div id="carousel-thumbs"></div>
```

```js
$('#carousel').themestrapPluginCarousel({
    thumbs: true,
    thumbsEl: '#carousel-thumbs'
});
```

The generated thumbnail buttons are placed inside the external container.

This is useful when the thumbnail navigation needs to be positioned separately from the main carousel.



## Dragging and Swiping

Both mouse dragging and touch dragging are enabled by default.

```js
mouseDrag: true,
touchDrag: true
```

Disable either independently:

```js
$('#carousel').themestrapPluginCarousel({
    mouseDrag: false,
    touchDrag: true
});
```

Dragging is available in `slide` transition mode.

The plugin determines the direction of the gesture and only treats movement along the carousel's active axis as a slide gesture.



## Keyboard Navigation

Keyboard navigation is enabled by default:

```js
keyboard: true
```

The carousel responds to:

| Key          | Action                          |
| - | - |
| `ArrowLeft`  | Previous slide                  |
| `ArrowRight` | Next slide                      |
| `ArrowUp`    | Previous slide in vertical mode |
| `ArrowDown`  | Next slide in vertical mode     |
| `Home`       | First slide                     |
| `End`        | Last slide                      |

The carousel itself receives:

```html
tabindex="0"
```

when keyboard navigation is enabled.



## Vertical Carousel

A vertical carousel can be enabled with:

```js
vertical: true
```

```js
$('#carousel').themestrapPluginCarousel({
    vertical: true
});
```

The default navigation controls automatically switch from left/right arrows to up/down arrows.

Keyboard navigation also changes accordingly:

- ArrowUp &rarr; Previous  
- ArrowDown &rarr; Next

Touch interaction uses the vertical axis.



## RTL Support

RTL mode can be explicitly enabled:

```js
rtl: true
```

```js
$('#carousel').themestrapPluginCarousel({
    rtl: true
});
```

The plugin also detects:

```html
<html dir="rtl">
```

and automatically enables RTL behavior.

RTL affects the direction of the slide track and navigation button placement.



## Stage Padding

`stagePadding` adds space to either side of the carousel stage.

```js
stagePadding: 40
```

Example:

```js
$('#carousel').themestrapPluginCarousel({
    items: 1,
    stagePadding: 60
});
```

This can be used to create a "peek" effect where adjacent slides are partially visible.

For horizontal carousels, padding is applied to the left and right.

For vertical carousels, padding is applied to the top and bottom.



## Gap

The `gap` option controls the space between visible slides.

```js
$('#carousel').themestrapPluginCarousel({
    items: 3,
    gap: 16
});
```

The value is measured in pixels.

```text
Slide | 16px | Slide | 16px | Slide
```



## Automatic Height

Enable automatic height adjustment with:

```js
autoHeight: true
```

```js
$('#carousel').themestrapPluginCarousel({
    autoHeight: true
});
```

The plugin measures active slides and adjusts the carousel stage to accommodate the tallest active slide.

This is particularly useful when slides contain content with different heights.



## Lazy Loading

Lazy loading is enabled by default:

```js
lazyLoad: true
```

Images can be deferred using `data-lazy-src`.

```html
<div>
    <img
        data-lazy-src="/images/large-image.jpg"
        alt="Large image"
    >
</div>
```

When the slide becomes relevant, the plugin changes:

```html
data-lazy-src="/images/large-image.jpg"
```

into:

```html
src="/images/large-image.jpg"
```

The current, next, and previous real slides are loaded.



## Media Control

The `pauseMedia` option controls video and audio elements.

```js
pauseMedia: true
```

```js
$('#carousel').themestrapPluginCarousel({
    pauseMedia: true
});
```

When enabled:

* Videos and audio outside active slides are paused.
* Elements marked with `data-autoplay` inside active slides are played.

Example:

```html
<video controls data-autoplay>
    <source src="/video/slide.mp4" type="video/mp4">
</video>
```

The plugin safely attempts to play active media and ignores rejected playback promises.



## Accessibility

`PluginCarousel` adds several accessibility attributes automatically.

The carousel root receives:

```html
role="region"
aria-roledescription="carousel"
aria-label="Carousel"
```

The label can be customized:

```js
$('#carousel').themestrapPluginCarousel({
    ariaLabel: 'Featured products'
});
```

Individual slides receive:

```html
role="group"
aria-roledescription="slide"
aria-label="1 of 5"
```

Inactive slides are marked:

```html
aria-hidden="true"
tabindex="-1"
```

Active slides are exposed with:

```html
aria-hidden="false"
tabindex="0"
```

Navigation dots and thumbnails use tablist/tab semantics and update their `aria-selected` state.



## Custom ARIA Label

The default carousel label is:

```js
ariaLabel: 'Carousel'
```

For multiple carousels on the same page, descriptive labels are recommended:

```js
$('#featured-carousel').themestrapPluginCarousel({
    ariaLabel: 'Featured products'
});
```

```js
$('#testimonials-carousel').themestrapPluginCarousel({
    ariaLabel: 'Customer testimonials'
});
```



## Public API

Once initialized, the plugin exposes several public methods.

### Next

Advance to the next slide:

```js
$('#carousel').themestrapPluginCarousel('next');
```

Equivalent instance method:

```js
instance.next();
```



### Previous

Move to the previous slide:

```js
$('#carousel').themestrapPluginCarousel('prev');
```

Equivalent instance method:

```js
instance.prev();
```



### Go To Slide

Slides use zero-based indexes.

```js
$('#carousel').themestrapPluginCarousel('to', 2);
```

This navigates to the third slide.

The public `to()` method normalizes the index so values outside the normal range wrap around.



### Play

Start autoplay:

```js
$('#carousel').themestrapPluginCarousel('play');
```

Equivalent:

```js
instance.play();
```



### Pause

Stop autoplay:

```js
$('#carousel').themestrapPluginCarousel('pause');
```

Equivalent:

```js
instance.pause();
```



### Destroy

Destroy the carousel and restore its original markup:

```js
$('#carousel').themestrapPluginCarousel('destroy');
```

The plugin removes its generated structure, event handlers, classes, inline styles, and stored instance data.

The original HTML captured during initialization is restored.



## Accessing the Instance

The plugin stores the instance on the element using the internal Themestrap instance name.

```js
const carousel = $('#carousel').data('__carouselPro');
```

The returned object exposes the public API:

```js
carousel.next();
carousel.prev();
carousel.to(2);
carousel.play();
carousel.pause();
carousel.destroy();
```

It also exposes state such as:

```js
carousel.currentIndex
carousel.realIndex
carousel.slideCount
carousel.isPlaying
carousel.isDragging
```



## Custom Events

The carousel emits native `CustomEvent` events.

### `ts.carouselpro.change`

Fired when a carousel transition begins.

```js
document
    .querySelector('#carousel')
    .addEventListener('ts.carouselpro.change', event => {
        console.log(event.detail);
    });
```

The event detail contains:

```js
{
    index: 2,
    total: 5
}
```

`index` is the zero-based real slide index.



### `ts.carouselpro.changed`

Fired after the transition has completed.

```js
document
    .querySelector('#carousel')
    .addEventListener('ts.carouselpro.changed', event => {
        console.log('Carousel changed:', event.detail);
    });
```

The detail object is:

```js
{
    index: 2,
    total: 5
}
```

This event is especially useful for integrating other Themestrap plugins with active carousel slides.



## PluginAnimate Integration

`PluginCarousel` can cooperate with Themestrap's `PluginAnimate`.

The carousel watches for:

```html
[data-appear-animation]
```

elements inside active slides.

When the carousel changes slides, it attempts to initialize/re-trigger `themestrapPluginAnimate()` on those elements.

Example:

```html
<div data-appear-animation="fadeIn">
    Animated content
</div>
```

The carousel can be initialized with:

```js
$('#carousel').themestrapPluginCarousel({
    animateIn: true,
    animateOut: true
});
```

The animation options themselves are handled by `PluginAnimate`; `PluginCarousel` provides the integration hook that re-runs animations when slides become active.



## PluginIcon Integration

The carousel also contains compatibility logic for Themestrap's `PluginIcon`.

Elements using:

```html
[data-icon]
```

inside cloned carousel slides are reinitialized when their clone becomes active.

Example:

```html
<div data-icon="home"></div>
```

This is particularly useful when using looping carousels, because loop mode creates cloned slide elements.



## Looping

Looping is enabled by default:

```js
loop: true
```

```js
$('#carousel').themestrapPluginCarousel({
    loop: true
});
```

In slide mode, the plugin creates clones before and after the real slides to provide seamless looping.

For example:

```text
[Clone 4] [Clone 5] [Slide 1] [Slide 2] [Slide 3] [Slide 4] [Slide 5] [Clone 1] [Clone 2]
```

When the carousel reaches the clone region, it silently jumps back to the corresponding real slide.

Disable looping with:

```js
loop: false
```

When looping is disabled, navigation buttons automatically become disabled at the beginning and end of the carousel.



## Grouped Navigation

The `group` option controls how many slides are advanced for each navigation action.

```js
group: 2
```

For example:

```js
$('#carousel').themestrapPluginCarousel({
    items: 3,
    group: 3
});
```

A next operation advances three slides at a time.



## Complete Example

```html
<div id="products-carousel">

    <div class="product-card">
        <img
            data-lazy-src="/images/product-1.jpg"
            alt="Product One"
        >
        <h3>Product One</h3>
    </div>

    <div class="product-card">
        <img
            data-lazy-src="/images/product-2.jpg"
            alt="Product Two"
        >
        <h3>Product Two</h3>
    </div>

    <div class="product-card">
        <img
            data-lazy-src="/images/product-3.jpg"
            alt="Product Three"
        >
        <h3>Product Three</h3>
    </div>

    <div class="product-card">
        <img
            data-lazy-src="/images/product-4.jpg"
            alt="Product Four"
        >
        <h3>Product Four</h3>
    </div>

</div>
```

```js
$('#products-carousel').themestrapPluginCarousel({
    items: 1,

    responsive: {
        576: {
            items: 2
        },

        992: {
            items: 3
        },

        1200: {
            items: 4
        }
    },

    loop: true,
    transition: 'slide',
    speed: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',

    gap: 16,
    stagePadding: 20,

    autoplay: true,
    autoplaySpeed: 5000,

    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnVisibility: true,

    nav: true,
    dots: true,
    dotType: 'line',

    counter: true,

    progressBar: true,
    progressPosition: 'bottom',

    thumbs: false,

    mouseDrag: true,
    touchDrag: true,
    keyboard: true,

    lazyLoad: true,
    pauseMedia: true,

    autoHeight: true,

    ariaLabel: 'Featured products'
});
```



## Gallery Example

`PluginCarousel` works particularly well for image galleries when thumbnails, lazy loading, and navigation are combined.

```html
<div id="gallery">

    <div data-thumb="/gallery/thumb-1.jpg">
        <img
            data-lazy-src="/gallery/image-1.jpg"
            alt="Gallery image 1"
        >
    </div>

    <div data-thumb="/gallery/thumb-2.jpg">
        <img
            data-lazy-src="/gallery/image-2.jpg"
            alt="Gallery image 2"
        >
    </div>

    <div data-thumb="/gallery/thumb-3.jpg">
        <img
            data-lazy-src="/gallery/image-3.jpg"
            alt="Gallery image 3"
        >
    </div>

</div>
```

```js
$('#gallery').themestrapPluginCarousel({
    transition: 'fade',
    loop: true,
    thumbs: true,
    counter: true,
    nav: true,
    dots: false,
    lazyLoad: true,
    ariaLabel: 'Image gallery'
});
```

Because `fade` is a non-slide transition, the carousel automatically uses one visible item.



## Vertical Example

```js
$('#vertical-carousel').themestrapPluginCarousel({
    vertical: true,
    items: 2,
    gap: 12,
    nav: true,
    dots: true,
    keyboard: true,
    mouseDrag: true,
    touchDrag: true
});
```

Vertical mode changes the carousel's navigation axis and interaction behavior.



## Styling

The plugin's CSS is automatically injected once when the first `PluginCarousel` instance is created.

The generated stylesheet uses CSS custom properties, allowing the appearance to be customized without modifying the plugin source.

Some of the primary variables include:

```css
--tscp-nav-size
--tscp-nav-bg
--tscp-nav-bg-hover
--tscp-nav-color
--tscp-nav-radius
--tscp-nav-icon
--tscp-nav-shadow

--tscp-dot-size
--tscp-dot-gap
--tscp-dot-color
--tscp-dot-active-color
--tscp-dot-line-w
--tscp-dot-line-h
--tscp-dot-num-size

--tscp-progress-h
--tscp-progress-bg
--tscp-progress-color

--tscp-counter-color

--tscp-thumb-size
--tscp-thumb-gap
--tscp-thumb-radius
--tscp-thumb-opacity
--tscp-thumb-opacity-hover
--tscp-thumb-border
--tscp-thumb-border-active

--tscp-gap
```

For example:

```css
#my-carousel {
    --tscp-nav-size: 40px;
    --tscp-nav-bg: rgba(0, 0, 0, .65);
    --tscp-nav-bg-hover: rgba(0, 0, 0, .9);

    --tscp-dot-size: 10px;
    --tscp-dot-active-color: #0088cc;

    --tscp-thumb-size: 80px;
}
```



## Dark Mode

The plugin includes dark-mode support through:

```css
@media (prefers-color-scheme: dark)
```

as well as:

```html
<html class="dark">
```

and:

```html
<html data-bs-theme="dark">
```

Light Bootstrap mode is also explicitly recognized through:

```html
<html data-bs-theme="light">
```

The dark-mode rules primarily adjust navigation indicators, dots, progress backgrounds, and counter colors.



## Default Options

The complete default configuration is:

```js
{
    // Core
    items: 1,
    loop: true,
    transition: 'slide',
    speed: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    group: 1,

    // Responsive
    responsive: {},

    // Autoplay
    autoplay: false,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnVisibility: true,

    // Navigation
    nav: true,
    navText: [],
    dots: true,
    dotType: 'default',
    counter: false,
    progressBar: false,
    progressPosition: 'bottom',

    // Thumbnails
    thumbs: false,
    thumbsEl: null,

    // Interaction
    touchDrag: true,
    mouseDrag: true,
    keyboard: true,

    // Layout
    rtl: false,
    vertical: false,
    stagePadding: 0,
    gap: 0,
    autoHeight: false,

    // Media
    lazyLoad: true,
    pauseMedia: false,

    // PluginAnimate
    animateIn: null,
    animateOut: null,

    // Accessibility
    ariaLabel: 'Carousel',

    // Themestrap initialization
    forceInit: false,
    accY: 0
}
```



## API Quick Reference

| Method       | Description                                         |
| - | - |
| `.next()`    | Move to the next slide                              |
| `.prev()`    | Move to the previous slide                          |
| `.to(index)` | Navigate to a specific zero-based slide             |
| `.play()`    | Start autoplay                                      |
| `.pause()`   | Stop autoplay                                       |
| `.destroy()` | Remove the carousel and restore the original markup |

### jQuery Examples

```js
$('#carousel').themestrapPluginCarousel('next');

$('#carousel').themestrapPluginCarousel('prev');

$('#carousel').themestrapPluginCarousel('to', 2);

$('#carousel').themestrapPluginCarousel('play');

$('#carousel').themestrapPluginCarousel('pause');

$('#carousel').themestrapPluginCarousel('destroy');
```



## Events Quick Reference

| Event                    | Fired                                  |
| - | -- |
| `ts.carouselpro.change`  | Immediately when a slide change begins |
| `ts.carouselpro.changed` | After the transition finishes          |

Example:

```js
const carousel = document.querySelector('#carousel');

carousel.addEventListener('ts.carouselpro.changed', event => {
    const { index, total } = event.detail;

    console.log(`Showing slide ${index + 1} of ${total}`);
});
```



## Recommended Configurations

### Simple Carousel

```js
{
    items: 1,
    loop: true,
    nav: true,
    dots: true
}
```

### Product Carousel

```js
{
    items: 1,

    responsive: {
        768: { items: 2 },
        1200: { items: 4 }
    },

    gap: 16,
    loop: true,
    nav: true,
    dots: true
}
```

### Hero Slider

```js
{
    transition: 'fade',
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    pauseOnFocus: true,
    nav: true,
    dots: true,
    counter: true,
    ariaLabel: 'Featured content'
}
```

### Image Gallery

```js
{
    transition: 'fade',
    thumbs: true,
    nav: true,
    dots: false,
    counter: true,
    lazyLoad: true
}
```

### Vertical Carousel

```js
{
    vertical: true,
    items: 2,
    gap: 12,
    nav: true,
    dots: true,
    mouseDrag: true,
    touchDrag: true
}
```



## Notes

### Non-slide transitions use one item

`fade` and `zoom` automatically force:

```js
items: 1
```

The `items` and responsive item-count settings therefore apply to multi-item layouts only when using `slide`.

### Dragging is slide-mode functionality

Mouse and touch dragging are only configured for the `slide` transition.

### Looping creates clones

When looping is enabled in slide mode, the plugin creates cloned slide elements to produce seamless wrapping. The clones are marked with:

```html
class="tscp-clone"
```

### Slide indexes are zero-based

The public API uses zero-based indexes:

```js
to(0); // first slide
to(1); // second slide
to(2); // third slide
```

The user-facing counter and ARIA labels remain one-based.

### CSS is shared between instances

The plugin injects its stylesheet once using:

```text
ts-carousel-pro-styles
```

The stylesheet is removed when the final `PluginCarousel` instance is destroyed.
