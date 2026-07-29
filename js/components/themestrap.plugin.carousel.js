(((themestrap = {}, $) => {
	const instanceName  = '__carousel';
	const STYLE_ID      = 'themestrap-carousel-styles';

	function injectStyles() {
		if (document.getElementById(STYLE_ID)) return;
		const css = `
/* Themestrap Carousel  */
.ts-carousel { position: relative; overflow: hidden; }
.ts-carousel .ts-stage-outer { overflow: hidden; width: 100%; }
.ts-carousel .ts-stage {
	display: flex;
	will-change: transform;
	transition: transform 0.35s ease;
	align-items: flex-start;
}
.ts-carousel.ts-no-transition .ts-stage { transition: none !important; }
.ts-carousel .ts-item { flex: 0 0 auto; box-sizing: border-box; }
.ts-carousel .ts-item.active { /* hook for external CSS */ }
.ts-carousel .ts-item.current { /* center-active hook */ }

/* Nav */
.ts-carousel .ts-nav { display: flex; position: absolute; top: 50%; transform: translateY(-50%); width: 100%; pointer-events: none; justify-content: space-between; }
.ts-carousel .ts-prev,
.ts-carousel .ts-next { pointer-events: all; background: rgba(0,0,0,.4); border: none; color: #fff; cursor: pointer; padding: .4em .7em; font-size: 1.25rem; line-height: 1; border-radius: 3px; }
.ts-carousel .ts-prev.disabled,
.ts-carousel .ts-next.disabled { opacity: .3; cursor: default; }

/* Dots */
.ts-carousel .ts-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
.ts-carousel .ts-dot { width: 10px; height: 10px; border-radius: 50%; background: #ccc; border: none; cursor: pointer; padding: 0; }
.ts-carousel .ts-dot.active { background: #555; }

/* animateIn / animateOut support */
.ts-carousel .ts-item.ts-animated-out { position: absolute; top: 0; }

/* stage-padding support */
.ts-carousel.ts-stage-padding .ts-stage-outer { overflow: visible; }
.ts-carousel.ts-stage-margin .ts-stage-outer { overflow: visible; }

/* RTL */
.ts-carousel.ts-rtl .ts-stage { flex-direction: row-reverse; }

/* Nav outside */
.ts-carousel.nav-outside .ts-nav { position: static; transform: none; }
.ts-carousel.nav-outside .ts-prev { margin-right: auto; }
.ts-carousel.nav-outside .ts-next { margin-left: auto; }

/* ts-carousel compat: keep .ts-carousel as selector alias; classes already in markup stay as-is */
.ts-carousel.ts-carousel { display: block; }

.ts-carousel {
	display: block;
	margin-bottom: 20px;
	transition: opacity 0.2s;
}
.ts-carousel.ts-carousel-init {   /* set by plugin after build() */
	opacity: 1;
}
/* hide all-but-first child while uninitialised (avoids flash) */
.ts-carousel:not(.ts-carousel-init):not(.ts-carousel-light) > div,
.ts-carousel:not(.ts-carousel-init):not(.ts-carousel-light) span {
	display: none;
}
.ts-carousel:not(.ts-carousel-init):not(.ts-carousel-light) > div:first-child,
.ts-carousel:not(.ts-carousel-init):not(.ts-carousel-light) span:first-child {
	display: block;
}

/* Stage */
.ts-carousel .ts-stage-outer { overflow: hidden; position: relative; }
.ts-carousel .ts-stage        { display: flex; will-change: transform; transition: transform 0.35s ease; align-items: flex-start; }
.ts-carousel.ts-no-transition .ts-stage { transition: none !important; }

/* item */
.ts-carousel .ts-item,
.ts-carousel .ts-item        { flex: 0 0 auto; box-sizing: border-box; }
.ts-carousel .ts-item img,
.ts-carousel .ts-item img    { transform-style: unset; max-width: 100%; }
.ts-carousel .ts-item img[data-icon],
.ts-carousel .ts-item img[data-icon] { display: inline; }
.ts-carousel .ts-item .thumbnail,
.ts-carousel .ts-item .thumbnail    { margin-right: 1px; }
.ts-carousel .ts-item .item-video,
.ts-carousel .ts-item .item-video   { height: 300px; }

/* Nav wrapper */
.ts-carousel .ts-nav,
.ts-carousel .ts-nav {
	top: 50%;
	position: absolute;
	width: 100%;
	margin-top: 0;
	transform: translate3d(0, -50%, 0);
}

/* prev / next buttons */
.ts-carousel .ts-nav .ts-prev,
.ts-carousel .ts-nav .ts-next,
.ts-carousel .ts-nav button.ts-prev,
.ts-carousel .ts-nav button.ts-next {
	display: inline-block;
	position: absolute;
	top: 50%;
	width: 30px;
	height: 30px;
	outline: 0;
	margin: 0;
	border: none;
	cursor: pointer;
	transform: translate3d(0, -50%, 0);
}
.ts-carousel .ts-prev,
.ts-carousel .ts-nav button.ts-prev { left: 0; }
.ts-carousel .ts-next,
.ts-carousel .ts-nav button.ts-next { right: 0; }

/* default FA chevron icons via ::before */
.ts-carousel .ts-prev::before,
.ts-carousel .ts-nav button.ts-prev::before {
	font-family: 'Font Awesome 7 Free';
	font-weight: 900;
	font-size: 0.7rem;
	content: "\f053";
	position: relative;
	left: -1px;
	top: -1px;
}
.ts-carousel .ts-next::before,
.ts-carousel .ts-nav button.ts-next::before {
	font-family: 'Font Awesome 7 Free';
	font-weight: 900;
	font-size: 0.7rem;
	content: "\f054";
	position: relative;
	left: 1px;
	top: -1px;
}

/* disabled state (no-loop at boundary) */
.ts-carousel .ts-prev.disabled,
.ts-carousel .ts-next.disabled { opacity: 0.35; cursor: default; pointer-events: none; }

/* Dots */
.ts-carousel .ts-dots,
.ts-carousel .ts-dots {
	display: flex;
	justify-content: center;
	gap: 4px;
	margin-top: 8px;
}
.ts-carousel .ts-dot,
.ts-carousel .ts-dot {
	outline: 0;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
}
.ts-carousel .ts-dot span,
.ts-carousel .ts-dot span {
	display: block;
	width: 8px;
	height: 8px;
	margin: 5px 4px;
	border-radius: 50%;
	background: #ccc;
	transition: background 0.2s;
}

/* Stage-margin modifier */
.ts-carousel.stage-margin .ts-stage-outer { margin-left: 40px !important; margin-right: 40px !important; }
.ts-carousel.stage-margin .ts-stage       { padding-left: 0 !important; padding-right: 0 !important; }
.ts-carousel.stage-margin.stage-margin-sm .ts-stage-outer { margin-left: 50px  !important; margin-right: 50px  !important; }
.ts-carousel.stage-margin.stage-margin-md .ts-stage-outer { margin-left: 75px  !important; margin-right: 75px  !important; }
.ts-carousel.stage-margin.stage-margin-lg .ts-stage-outer { margin-left: 100px !important; margin-right: 100px !important; }

/* Top border */
.ts-carousel.top-border { border-top: 1px solid #eaeaea; padding-top: 18px; }

/* Nav visibility modifiers */
.ts-carousel.nav-remove-prev .ts-prev,
.ts-carousel.nav-remove-prev .ts-prev { display: none; }
.ts-carousel.nav-remove-next .ts-next,
.ts-carousel.nav-remove-next .ts-next { display: none; }

/* Nav full-height */
.ts-carousel.nav-full-height .ts-stage-outer,
.ts-carousel.nav-full-height .ts-stage-outer { z-index: 1; }
.ts-carousel.nav-full-height .ts-nav,
.ts-carousel.nav-full-height .ts-nav { height: 100%; }
.ts-carousel.nav-full-height .ts-next,
.ts-carousel.nav-full-height .ts-prev,
.ts-carousel.nav-full-height .ts-next,
.ts-carousel.nav-full-height .ts-prev { height: 100% !important; }

/* show-nav-hover */
.ts-carousel.show-nav-hover .ts-nav,
.ts-carousel.show-nav-hover .ts-nav                    { opacity: 0; transition: all 0.2s ease-in-out; }
.ts-carousel.show-nav-hover .ts-prev,
.ts-carousel.show-nav-hover .ts-prev                   { left: 0;  transition: all 0.2s ease-in-out; }
.ts-carousel.show-nav-hover .ts-next,
.ts-carousel.show-nav-hover .ts-next                   { right: 0; transition: all 0.2s ease-in-out; }
.ts-carousel.show-nav-hover:hover .ts-nav,
.ts-carousel.show-nav-hover:hover .ts-nav              { opacity: 1; }
.ts-carousel.show-nav-hover:hover .ts-prev,
.ts-carousel.show-nav-hover:hover .ts-prev             { left: -40px; }
.ts-carousel.show-nav-hover:hover .ts-next,
.ts-carousel.show-nav-hover:hover .ts-next             { right: -40px; }

.ts-carousel.show-nav-hover.show-nav-hover-pos-2:hover .ts-prev,
.ts-carousel.show-nav-hover.show-nav-hover-pos-2:hover .ts-prev { left: -15px; }
.ts-carousel.show-nav-hover.show-nav-hover-pos-2:hover .ts-next,
.ts-carousel.show-nav-hover.show-nav-hover-pos-2:hover .ts-next { right: -15px; }

.ts-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .ts-prev,
.ts-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .ts-prev { left: -20px; }
.ts-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .ts-next,
.ts-carousel.show-nav-hover.show-nav-hover-pos-2.nav-md:hover .ts-next { right: -20px; }

.ts-carousel.show-nav-hover.show-nav-hover-pos-3:hover .ts-prev,
.ts-carousel.show-nav-hover.show-nav-hover-pos-3:hover .ts-prev { left: 10px; }
.ts-carousel.show-nav-hover.show-nav-hover-pos-3:hover .ts-next,
.ts-carousel.show-nav-hover.show-nav-hover-pos-3:hover .ts-next { right: 10px; }

/* show-nav-title */
.ts-carousel.show-nav-title .ts-nav,
.ts-carousel.show-nav-title .ts-nav {
	top: 0; right: 0; margin-top: -25px; width: auto;
}
.ts-carousel.show-nav-title .ts-prev,
.ts-carousel.show-nav-title .ts-next,
.ts-carousel.show-nav-title .ts-nav button[class*="ts-"],
.ts-carousel.show-nav-title .ts-nav button[class*="ts-"]:hover,
.ts-carousel.show-nav-title .ts-nav button[class*="ts-"]:active {
	font-size: 18px; background: transparent !important; width: 18px;
}
.ts-carousel.show-nav-title .ts-prev,
.ts-carousel.show-nav-title .ts-prev { left: -40px; }
.ts-carousel.show-nav-title .ts-prev::before,
.ts-carousel.show-nav-title .ts-prev::after,
.ts-carousel.show-nav-title .ts-next::before,
.ts-carousel.show-nav-title .ts-next::after,
.ts-carousel.show-nav-title .ts-prev:before,
.ts-carousel.show-nav-title .ts-prev:after,
.ts-carousel.show-nav-title .ts-next:before,
.ts-carousel.show-nav-title .ts-next:after { font-size: inherit; }

.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-nav,
.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-nav  { width: 100%; }
.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-prev,
.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-prev { left: 0; }
.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-next,
.ts-carousel.show-nav-title.show-nav-title-both-sides .ts-next { right: 0; }
.ts-carousel.show-nav-title.show-nav-title-both-sides-style-2 .ts-nav,
.ts-carousel.show-nav-title.show-nav-title-both-sides-style-2 .ts-nav { margin-top: 15px; }

/* rounded-nav */
.ts-carousel.rounded-nav .ts-prev,
.ts-carousel.rounded-nav .ts-next,
.ts-carousel.rounded-nav .ts-nav button[class*="ts-"] {
	padding: 3px 7px; border-radius: 50%;
	background: transparent; border: 1px solid #999; color: #999;
}
.ts-carousel.rounded-nav .ts-prev:hover,
.ts-carousel.rounded-nav .ts-next:hover,
.ts-carousel.rounded-nav .ts-nav button[class*="ts-"]:hover {
	background: transparent; border-color: #a1a1a1; color: #a1a1a1;
}
.ts-carousel.rounded-nav .ts-prev:active,
.ts-carousel.rounded-nav .ts-next:active,
.ts-carousel.rounded-nav .ts-nav button[class*="ts-"]:active {
	background: transparent; border-color: #666; color: #666;
}

/* nav-bottom */
.ts-carousel.nav-bottom .ts-stage-outer,
.ts-carousel.nav-bottom .ts-stage-outer { margin-bottom: 10px; }
.ts-carousel.nav-bottom .ts-nav,
.ts-carousel.nav-bottom .ts-nav {
	position: static; margin: 0; padding: 0; width: auto; transform: none;
}
.ts-carousel.nav-bottom .ts-prev,
.ts-carousel.nav-bottom .ts-next,
.ts-carousel.nav-bottom .ts-prev,
.ts-carousel.nav-bottom .ts-next { position: static; transform: none; }
.ts-carousel.nav-bottom .ts-prev,
.ts-carousel.nav-bottom .ts-prev { margin-right: 5px; }
.ts-carousel.nav-bottom .ts-next,
.ts-carousel.nav-bottom .ts-next { margin-left: 5px; }
.ts-carousel.nav-bottom.nav-bottom-align-left  .ts-nav,
.ts-carousel.nav-bottom.nav-bottom-align-left  .ts-nav { text-align: left; }
.ts-carousel.nav-bottom.nav-bottom-align-right .ts-nav,
.ts-carousel.nav-bottom.nav-bottom-align-right .ts-nav { text-align: right; }

/* nav-bottom-inside */
.ts-carousel.nav-bottom-inside .ts-nav,
.ts-carousel.nav-bottom-inside .ts-nav {
	position: relative; margin: -4.3rem 0 0 0; padding: 0; width: auto;
}
.ts-carousel.nav-bottom-inside .ts-prev,
.ts-carousel.nav-bottom-inside .ts-next,
.ts-carousel.nav-bottom-inside .ts-prev,
.ts-carousel.nav-bottom-inside .ts-next { position: static; }

/* nav-inside */
.ts-carousel.nav-inside .ts-prev,
.ts-carousel.nav-inside .ts-prev { left: 15px; }
.ts-carousel.nav-inside .ts-next,
.ts-carousel.nav-inside .ts-next { right: 15px; left: auto; }

.ts-carousel.nav-inside.nav-inside-edge .ts-prev,
.ts-carousel.nav-inside.nav-inside-edge .ts-prev { left: 0; }
.ts-carousel.nav-inside.nav-inside-edge .ts-next,
.ts-carousel.nav-inside.nav-inside-edge .ts-next { right: 0; left: auto; }

.ts-carousel.nav-inside.nav-inside-plus .ts-prev,
.ts-carousel.nav-inside.nav-inside-plus .ts-prev { left: 30px; }
.ts-carousel.nav-inside.nav-inside-plus .ts-next,
.ts-carousel.nav-inside.nav-inside-plus .ts-next { right: 30px; left: auto; }

.ts-carousel.nav-inside.nav-bottom .ts-nav,
.ts-carousel.nav-inside.nav-bottom .ts-nav {
	position: absolute; top: auto; bottom: 40px; width: 100%;
}
.ts-carousel.nav-inside.nav-bottom .ts-prev,
.ts-carousel.nav-inside.nav-bottom .ts-next,
.ts-carousel.nav-inside.nav-bottom .ts-prev,
.ts-carousel.nav-inside.nav-bottom .ts-next { position: relative; }
.ts-carousel.nav-inside.nav-bottom .ts-prev,
.ts-carousel.nav-inside.nav-bottom .ts-prev { left: 0; }
.ts-carousel.nav-inside.nav-bottom .ts-next,
.ts-carousel.nav-inside.nav-bottom .ts-next { right: 0; }

.ts-carousel.nav-inside.nav-inside-half-section .ts-nav,
.ts-carousel.nav-inside.nav-inside-half-section .ts-nav { top: auto; bottom: 60px; }
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev,
.ts-carousel.nav-inside.nav-inside-half-section .ts-next,
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev,
.ts-carousel.nav-inside.nav-inside-half-section .ts-next {
	transform: none; width: 60px !important; height: 60px !important;
}
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev::before,
.ts-carousel.nav-inside.nav-inside-half-section .ts-next::before,
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev::before,
.ts-carousel.nav-inside.nav-inside-half-section .ts-next::before {
	font-size: 0.8rem; left: 0; top: 0;
}
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev,
.ts-carousel.nav-inside.nav-inside-half-section .ts-prev { left: -60px; top: -61px; }
.ts-carousel.nav-inside.nav-inside-half-section .ts-next,
.ts-carousel.nav-inside.nav-inside-half-section .ts-next { left: -60px; }
@media (max-width: 991px) {
	.ts-carousel.nav-inside.nav-inside-half-section .ts-prev,
	.ts-carousel.nav-inside.nav-inside-half-section .ts-prev { left: 0; }
	.ts-carousel.nav-inside.nav-inside-half-section .ts-next,
	.ts-carousel.nav-inside.nav-inside-half-section .ts-next { left: 0; }
}

/* nav-outside */
.ts-carousel.nav-outside .ts-prev,
.ts-carousel.nav-outside .ts-prev { left: 0; }
.ts-carousel.nav-outside .ts-next,
.ts-carousel.nav-outside .ts-next { right: 0; }
@media (min-width: 992px) {
	.ts-carousel.nav-outside .ts-prev,
	.ts-carousel.nav-outside .ts-prev { left: -50px; }
	.ts-carousel.nav-outside .ts-next,
	.ts-carousel.nav-outside .ts-next { right: -50px; }
}

/* nav-position-1 */
.ts-carousel.nav-position-1 .ts-prev,
.ts-carousel.nav-position-1 .ts-prev { left: 20px; }
.ts-carousel.nav-position-1 .ts-next,
.ts-carousel.nav-position-1 .ts-next { right: 20px; }

/* nav-icon-1 */
.ts-carousel.nav-icon-1 .ts-next::before,
.ts-carousel.nav-icon-1 .ts-next::before { content: "\f061"; }
.ts-carousel.nav-icon-1 .ts-prev::before,
.ts-carousel.nav-icon-1 .ts-prev::before { content: "\f060"; }

/* nav sizes */
.ts-carousel.nav-size-md .ts-prev,
.ts-carousel.nav-size-md .ts-next,
.ts-carousel.nav-size-md .ts-prev,
.ts-carousel.nav-size-md .ts-next { width: 40px; height: 40px; }
.ts-carousel.nav-size-md .ts-prev::before,
.ts-carousel.nav-size-md .ts-next::before,
.ts-carousel.nav-size-md .ts-prev::before,
.ts-carousel.nav-size-md .ts-next::before { top: 0; font-size: 0.75rem; }

/* nav-style-1 */
.ts-carousel.nav-style-1 .ts-prev,
.ts-carousel.nav-style-1 .ts-next,
.ts-carousel.nav-style-1 .ts-next,
.ts-carousel.nav-style-1 .ts-prev {
	width: 20px; background: transparent !important; color: #000;
}
.ts-carousel.nav-style-1 .ts-prev:hover,
.ts-carousel.nav-style-1 .ts-next:hover,
.ts-carousel.nav-style-1 .ts-next:hover,
.ts-carousel.nav-style-1 .ts-prev:hover { color: var(--grey-500); }
.ts-carousel.nav-style-1 .ts-prev::before,
.ts-carousel.nav-style-1 .ts-prev::after,
.ts-carousel.nav-style-1 .ts-next::before,
.ts-carousel.nav-style-1 .ts-next::after,
.ts-carousel.nav-style-1 .ts-prev::before,
.ts-carousel.nav-style-1 .ts-prev::after,
.ts-carousel.nav-style-1 .ts-next::before,
.ts-carousel.nav-style-1 .ts-next::after { font-size: inherit; }

/* nav-style-2 */
.ts-carousel.nav-style-2 .ts-prev,
.ts-carousel.nav-style-2 .ts-next,
.ts-carousel.nav-style-2 .ts-next,
.ts-carousel.nav-style-2 .ts-prev { background: transparent !important; }
.ts-carousel.nav-style-2 .ts-prev::before,
.ts-carousel.nav-style-2 .ts-next::before,
.ts-carousel.nav-style-2 .ts-next::before,
.ts-carousel.nav-style-2 .ts-prev::before {
	content: ''; display: block; position: absolute;
	top: 50%; left: 1px; width: 1.3em; height: 1.3em;
	border-top: 2px solid var(--grey-500); border-left: 2px solid var(--grey-500);
	font-size: inherit;
	transform: translate3d(0, -50%, 0) rotate(-45deg);
}
.ts-carousel.nav-style-2 .ts-prev::after,
.ts-carousel.nav-style-2 .ts-next::after,
.ts-carousel.nav-style-2 .ts-next::after,
.ts-carousel.nav-style-2 .ts-prev::after {
	content: ''; display: block; border-top: 3px solid var(--grey-500);
	width: 2.5em; position: absolute; top: 50%; font-size: inherit;
	transform: translate3d(0, -50%, 0);
}
.ts-carousel.nav-style-2 .ts-next,
.ts-carousel.nav-style-2 .ts-next {
	transform: rotate(180deg) !important; transform-origin: 15px 8px;
}
.ts-carousel.nav-style-2.nav-bottom.nav-inside .ts-next,
.ts-carousel.nav-style-2.nav-bottom.nav-inside .ts-next { transform-origin: 15px; }

/* nav-style-3 */
.ts-carousel.nav-style-3 .ts-nav,
.ts-carousel.nav-style-3 .ts-nav { top: 25%; }
.ts-carousel.nav-style-3 .ts-prev,
.ts-carousel.nav-style-3 .ts-next,
.ts-carousel.nav-style-3 .ts-next,
.ts-carousel.nav-style-3 .ts-prev { width: 30px; background: transparent !important; color: var(--grey-500); }
.ts-carousel.nav-style-3 .ts-prev::before,
.ts-carousel.nav-style-3 .ts-prev::after,
.ts-carousel.nav-style-3 .ts-next::before,
.ts-carousel.nav-style-3 .ts-next::after,
.ts-carousel.nav-style-3 .ts-next::before,
.ts-carousel.nav-style-3 .ts-next::after,
.ts-carousel.nav-style-3 .ts-prev::before,
.ts-carousel.nav-style-3 .ts-prev::after { font-size: 1.5em; }

/* nav-style-4 */
.ts-carousel.nav-style-4 .ts-prev,
.ts-carousel.nav-style-4 .ts-prev { left: 75px; }
.ts-carousel.nav-style-4 .ts-next,
.ts-carousel.nav-style-4 .ts-next { right: 75px; }
@media (max-width: 991px) {
	.ts-carousel.nav-style-4 .ts-prev,
	.ts-carousel.nav-style-4 .ts-prev { left: 40px; }
	.ts-carousel.nav-style-4 .ts-next,
	.ts-carousel.nav-style-4 .ts-next { right: 40px; }
}
@media (max-width: 767px) {
	.ts-carousel.nav-style-4 .ts-prev,
	.ts-carousel.nav-style-4 .ts-prev { left: 13px; }
	.ts-carousel.nav-style-4 .ts-next,
	.ts-carousel.nav-style-4 .ts-next { right: 13px; }
}
.ts-carousel.nav-style-4 .ts-prev,
.ts-carousel.nav-style-4 .ts-next,
.ts-carousel.nav-style-4 .ts-prev,
.ts-carousel.nav-style-4 .ts-next {
	background: var(--light); font-size: 0.7rem;
	width: 40px; height: 40px; color: #000;
	border-radius: 100%;
	box-shadow: 0 0 40px -10px rgba(0,0,0,.3);
}
.ts-carousel.nav-style-4 .ts-prev:hover,
.ts-carousel.nav-style-4 .ts-next:hover,
.ts-carousel.nav-style-4 .ts-prev:hover,
.ts-carousel.nav-style-4 .ts-next:hover { color: var(--light); }

.ts-carousel.nav-style-4.nav-style-4-pos-2 .ts-prev,
.ts-carousel.nav-style-4.nav-style-4-pos-2 .ts-prev { left: 0; }
.ts-carousel.nav-style-4.nav-style-4-pos-2 .ts-next,
.ts-carousel.nav-style-4.nav-style-4-pos-2 .ts-next { right: 0; }

/* nav-style-diamond */
.ts-carousel.nav-style-diamond .ts-prev,
.ts-carousel.nav-style-diamond .ts-next,
.ts-carousel.nav-style-diamond .ts-prev,
.ts-carousel.nav-style-diamond .ts-next {
	transform: rotate(45deg); transform-origin: 100% 0%;
}
.ts-carousel.nav-style-diamond .ts-prev::before,
.ts-carousel.nav-style-diamond .ts-next::before,
.ts-carousel.nav-style-diamond .ts-prev::before,
.ts-carousel.nav-style-diamond .ts-next::before {
	display: block; transform: rotate(-45deg); transform-origin: 60% 50%;
}
.ts-carousel.nav-style-diamond .ts-next::before,
.ts-carousel.nav-style-diamond .ts-next::before { transform-origin: 50%; }

/* nav-svg-arrows-1 */
.ts-carousel.nav-svg-arrows-1 .ts-prev,
.ts-carousel.nav-svg-arrows-1 .ts-next,
.ts-carousel.nav-svg-arrows-1 .ts-prev,
.ts-carousel.nav-svg-arrows-1 .ts-next { width: 35px; height: 35px; }
.ts-carousel.nav-svg-arrows-1 .ts-prev::before,
.ts-carousel.nav-svg-arrows-1 .ts-next::before,
.ts-carousel.nav-svg-arrows-1 .ts-prev::before,
.ts-carousel.nav-svg-arrows-1 .ts-next::before { content: none; }
.ts-carousel.nav-svg-arrows-1 .ts-prev svg,
.ts-carousel.nav-svg-arrows-1 .ts-next svg,
.ts-carousel.nav-svg-arrows-1 .ts-prev svg,
.ts-carousel.nav-svg-arrows-1 .ts-next svg { width: 2em; }
.ts-carousel.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-next svg polygon { fill: #FFF; stroke: #FFF; }
.ts-carousel.nav-svg-arrows-1 .ts-prev svg,
.ts-carousel.nav-svg-arrows-1 .ts-prev svg { transform: rotate(180deg); }

/* nav-arrows-1 / nav-arrows-2 / nav-arrows-thin */
.ts-carousel.nav-arrows-1 .ts-prev,
.ts-carousel.nav-arrows-1 .ts-next,
.ts-carousel.nav-arrows-1 .ts-prev,
.ts-carousel.nav-arrows-1 .ts-next { width: 35px; height: 35px; font-size: 1.2rem; background: transparent; }
.ts-carousel.nav-arrows-1 .ts-next::before,
.ts-carousel.nav-arrows-1 .ts-next::before { content: '\f061'; font-size: inherit; }
.ts-carousel.nav-arrows-1 .ts-prev::before,
.ts-carousel.nav-arrows-1 .ts-prev::before { content: '\f060'; font-size: inherit; }

.ts-carousel.nav-arrows-2 .ts-prev,
.ts-carousel.nav-arrows-2 .ts-next,
.ts-carousel.nav-arrows-2 .ts-prev,
.ts-carousel.nav-arrows-2 .ts-next { width: 35px; height: 35px; font-size: 1.2rem; background: transparent; }
.ts-carousel.nav-arrows-2 .ts-next::before,
.ts-carousel.nav-arrows-2 .ts-next::before { content: '\f101'; font-size: inherit; }
.ts-carousel.nav-arrows-2 .ts-prev::before,
.ts-carousel.nav-arrows-2 .ts-prev::before { content: '\f100'; font-size: inherit; }

.ts-carousel.nav-arrows-thin .ts-prev::before,
.ts-carousel.nav-arrows-thin .ts-next::before,
.ts-carousel.nav-arrows-thin .ts-prev::before,
.ts-carousel.nav-arrows-thin .ts-next::before {
	font-family: simple-line-icons; speak: none;
	font-style: normal; font-weight: 700; font-variant: normal; text-transform: none;
	line-height: 1; -webkit-font-smoothing: antialiased;
}
.ts-carousel.nav-arrows-thin .ts-next::before,
.ts-carousel.nav-arrows-thin .ts-next::before { content: "\e606"; font-size: inherit; }
.ts-carousel.nav-arrows-thin .ts-prev::before,
.ts-carousel.nav-arrows-thin .ts-prev::before { content: "\e605"; font-size: inherit; }

/* nav-center-images-only */
.ts-carousel.nav-center-images-only .ts-nav,
.ts-carousel.nav-center-images-only .ts-nav { top: 37%; }

/* nav-center-outside */
.ts-carousel.nav-center-outside .ts-nav,
.ts-carousel.nav-center-outside .ts-nav {
	width: calc(100% + 90px); left: 49.9%; transform: translate3d(-50%, 0, 0);
}

/* full-width / big-nav */
.ts-carousel.full-width .ts-prev,
.ts-carousel.full-width .ts-next,
.ts-carousel.full-width .ts-prev:hover,
.ts-carousel.full-width .ts-next:hover,
.ts-carousel.big-nav .ts-prev,
.ts-carousel.big-nav .ts-next,
.ts-carousel.big-nav .ts-prev:hover,
.ts-carousel.big-nav .ts-next:hover,
.ts-carousel.full-width .ts-nav button[class*="ts-"],
.ts-carousel.full-width .ts-nav button[class*="ts-"]:hover,
.ts-carousel.big-nav   .ts-nav button[class*="ts-"],
.ts-carousel.big-nav   .ts-nav button[class*="ts-"]:hover {
	height: auto; padding: 20px 0 !important;
}
.ts-carousel.full-width .ts-prev,
.ts-carousel.big-nav   .ts-prev,
.ts-carousel.full-width .ts-prev,
.ts-carousel.big-nav   .ts-prev { border-radius: 0 4px 4px 0; }
.ts-carousel.full-width .ts-next,
.ts-carousel.big-nav   .ts-next,
.ts-carousel.full-width .ts-next,
.ts-carousel.big-nav   .ts-next { border-radius: 4px 0 0 4px; }

/* nav-squared / nav-rounded */
.ts-carousel.nav-squared .ts-prev,
.ts-carousel.nav-squared .ts-next,
.ts-carousel.nav-squared .ts-nav button[class*="ts-"] { border-radius: 0; }
.ts-carousel.nav-rounded .ts-prev,
.ts-carousel.nav-rounded .ts-next,
.ts-carousel.nav-rounded .ts-nav button[class*="ts-"] { border-radius: 50%; }

/* nav size helpers */
.ts-carousel.nav-sm .ts-prev,
.ts-carousel.nav-sm .ts-next,
.ts-carousel.nav-sm .ts-prev,
.ts-carousel.nav-sm .ts-next { width: 30px !important; height: 30px !important; }

.ts-carousel.nav-md .ts-prev,
.ts-carousel.nav-md .ts-next,
.ts-carousel.nav-md .ts-prev,
.ts-carousel.nav-md .ts-next { width: 40px; height: 40px; }

.ts-carousel.nav-lg .ts-prev,
.ts-carousel.nav-lg .ts-next,
.ts-carousel.nav-lg .ts-prev,
.ts-carousel.nav-lg .ts-next { width: 45px; height: 60px; }
.ts-carousel.nav-lg.rounded-nav .ts-prev,
.ts-carousel.nav-lg.rounded-nav .ts-next,
.ts-carousel.nav-lg.rounded-nav .ts-prev,
.ts-carousel.nav-lg.rounded-nav .ts-next { width: 55px; height: 55px; }
.ts-carousel.nav-lg.rounded-nav .ts-prev::before,
.ts-carousel.nav-lg.rounded-nav .ts-next::before,
.ts-carousel.nav-lg.rounded-nav .ts-prev::before,
.ts-carousel.nav-lg.rounded-nav .ts-next::before { font-size: 0.9rem; }
.ts-carousel.nav-lg.rounded-nav .ts-prev::before,
.ts-carousel.nav-lg.rounded-nav .ts-prev::before { top: -1px; left: -1px; }
.ts-carousel.nav-lg.rounded-nav .ts-next::before,
.ts-carousel.nav-lg.rounded-nav .ts-next::before { top: -1px; left: 1px; }

/* nav font-size helpers */
.ts-carousel.nav-font-size-sm .ts-prev,
.ts-carousel.nav-font-size-sm .ts-next,
.ts-carousel.nav-font-size-sm .ts-prev,
.ts-carousel.nav-font-size-sm .ts-next { font-size: 10px; }
.ts-carousel.nav-font-size-sm .ts-prev::before,
.ts-carousel.nav-font-size-sm .ts-next::before,
.ts-carousel.nav-font-size-sm .ts-prev::before,
.ts-carousel.nav-font-size-sm .ts-next::before { font-size: inherit; }

.ts-carousel.nav-font-size-md .ts-prev,
.ts-carousel.nav-font-size-md .ts-next,
.ts-carousel.nav-font-size-md .ts-prev,
.ts-carousel.nav-font-size-md .ts-next { font-size: 14px; }
.ts-carousel.nav-font-size-md .ts-prev::before,
.ts-carousel.nav-font-size-md .ts-next::before,
.ts-carousel.nav-font-size-md .ts-prev::before,
.ts-carousel.nav-font-size-md .ts-next::before { font-size: inherit; }

.ts-carousel.nav-font-size-lg .ts-prev,
.ts-carousel.nav-font-size-lg .ts-next,
.ts-carousel.nav-font-size-lg .ts-prev,
.ts-carousel.nav-font-size-lg .ts-next { font-size: 19px; }
.ts-carousel.nav-font-size-lg .ts-prev::before,
.ts-carousel.nav-font-size-lg .ts-next::before,
.ts-carousel.nav-font-size-lg .ts-prev::before,
.ts-carousel.nav-font-size-lg .ts-next::before { font-size: inherit; left: 2px; }

.ts-carousel.nav-font-size-xl .ts-prev,
.ts-carousel.nav-font-size-xl .ts-next,
.ts-carousel.nav-font-size-xl .ts-prev,
.ts-carousel.nav-font-size-xl .ts-next { font-size: 25px; }
.ts-carousel.nav-font-size-xl .ts-prev::before,
.ts-carousel.nav-font-size-xl .ts-next::before,
.ts-carousel.nav-font-size-xl .ts-prev::before,
.ts-carousel.nav-font-size-xl .ts-next::before { font-size: inherit; left: 2px; }

/* nav colour themes */
.ts-carousel.nav-transparent .ts-prev,
.ts-carousel.nav-transparent .ts-next,
.ts-carousel.nav-transparent .ts-nav button[class*="ts-"] {
	background-color: transparent !important; color: var(--dark) !important;
}
.ts-carousel.nav-transparent .ts-prev:hover,
.ts-carousel.nav-transparent .ts-next:hover,
.ts-carousel.nav-transparent .ts-prev:active,
.ts-carousel.nav-transparent .ts-next:active,
.ts-carousel.nav-transparent .ts-nav button[class*="ts-"]:hover,
.ts-carousel.nav-transparent .ts-nav button[class*="ts-"]:active {
	background-color: transparent !important; border-color: transparent !important;
}

.ts-carousel.nav-borders .ts-prev,
.ts-carousel.nav-borders .ts-next,
.ts-carousel.nav-borders .ts-nav button[class*="ts-"] { border-color: var(--dark-rgba-10) !important; }
.ts-carousel.nav-borders .ts-prev:hover,
.ts-carousel.nav-borders .ts-next:hover,
.ts-carousel.nav-borders .ts-nav button[class*="ts-"]:hover { border-color: var(--dark-rgba-10) !important; }
.ts-carousel.nav-borders .ts-prev:active,
.ts-carousel.nav-borders .ts-next:active,
.ts-carousel.nav-borders .ts-nav button[class*="ts-"]:active { border-color: var(--dark-rgba-30) !important; }

.ts-carousel.nav-borders-light .ts-prev,
.ts-carousel.nav-borders-light .ts-next,
.ts-carousel.nav-borders-light .ts-nav button[class*="ts-"] { border-color: var(--light-rgba-20) !important; }
.ts-carousel.nav-borders-light .ts-prev:hover,
.ts-carousel.nav-borders-light .ts-next:hover,
.ts-carousel.nav-borders-light .ts-nav button[class*="ts-"]:hover { border-color: var(--light-rgba-20) !important; }
.ts-carousel.nav-borders-light .ts-prev:active,
.ts-carousel.nav-borders-light .ts-next:active,
.ts-carousel.nav-borders-light .ts-nav button[class*="ts-"]:active { border-color: var(--light-rgba-30) !important; }

.ts-carousel.nav-arrow-light .ts-next::before,
.ts-carousel.nav-arrow-light .ts-next::after,
.ts-carousel.nav-arrow-light .ts-prev::before,
.ts-carousel.nav-arrow-light .ts-prev::after,
.ts-carousel.nav-arrow-light .ts-next::before,
.ts-carousel.nav-arrow-light .ts-next::after,
.ts-carousel.nav-arrow-light .ts-prev::before,
.ts-carousel.nav-arrow-light .ts-prev::after { color: var(--light) !important; }

/* nav-light */
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-nav button[class*="ts-"] {
	background-color: var(--grey-100) !important; border-color: var(--grey-100) !important; color: var(--dark) !important;
}
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:hover,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:hover,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-nav button[class*="ts-"]:hover {
	background-color: var(--light) !important; border-color: var(--light) !important;
}
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:active,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:active,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-nav button[class*="ts-"]:active {
	background-color: var(--grey-200) !important; border-color: var(--grey-200) !important;
}
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-prev,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-next,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-nav button[class*="ts-"] {
	width: 35px; height: 45px; background-color: var(--dark-rgba-10) !important; border-color: transparent !important;
}
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-light:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-nav button[class*="ts-"] svg polygon {
	fill: var(--dark) !important; stroke: var(--dark) !important;
}
.ts-carousel.nav-light.nav-style-1 .ts-prev,
.ts-carousel.nav-light.nav-style-1 .ts-next,
.ts-carousel.nav-light.nav-style-1 .ts-next,
.ts-carousel.nav-light.nav-style-1 .ts-prev { color: var(--light) !important; }
.ts-carousel.nav-light.nav-style-2 .ts-prev::before,
.ts-carousel.nav-light.nav-style-2 .ts-prev::after,
.ts-carousel.nav-light.nav-style-2 .ts-next::before,
.ts-carousel.nav-light.nav-style-2 .ts-next::after,
.ts-carousel.nav-light.nav-style-2 .ts-next::before,
.ts-carousel.nav-light.nav-style-2 .ts-next::after,
.ts-carousel.nav-light.nav-style-2 .ts-prev::before,
.ts-carousel.nav-light.nav-style-2 .ts-prev::after { border-color: var(--light) !important; }
.ts-carousel.nav-light.nav-style-3 .ts-prev,
.ts-carousel.nav-light.nav-style-3 .ts-next,
.ts-carousel.nav-light.nav-style-3 .ts-next,
.ts-carousel.nav-light.nav-style-3 .ts-prev { color: var(--light) !important; }
.ts-carousel.nav-light.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-light.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-light.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-light.nav-svg-arrows-1 .ts-prev svg polygon { fill: #FFF !important; stroke: #FFF !important; }
.ts-carousel.nav-light.nav-arrows-1 .ts-prev,
.ts-carousel.nav-light.nav-arrows-1 .ts-next,
.ts-carousel.nav-light.nav-arrows-1 .ts-next,
.ts-carousel.nav-light.nav-arrows-1 .ts-prev { color: var(--light) !important; }

/* nav-dark */
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev {
	background-color: var(--dark--100) !important;
	border-color: var(--dark--100) !important;
	color: var(--light) !important;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:hover {
	background-color: var(--dark--100) !important; border-color: var(--dark--100) !important;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:active,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:active,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-next:active,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1) .ts-prev:active {
	background-color: var(--dark) !important; border-color: var(--dark) !important;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-prev,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-prev {
	width: 35px; height: 45px;
	background-color: rgba(var(--dark--100), 0.4) !important; border-color: transparent !important;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-prev:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-next:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-next:hover,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency .ts-prev:hover {
	background-color: rgba(var(--dark--100), 1) !important;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency.nav-style-diamond .ts-prev,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency.nav-style-diamond .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency.nav-style-diamond .ts-next,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-with-transparency.nav-style-diamond .ts-prev {
	width: 40px; height: 40px;
}
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-dark:not(.nav-style-1):not(.nav-style-2):not(.nav-style-3):not(.show-nav-title):not(.nav-arrows-1).nav-svg-arrows-1 .ts-prev svg polygon {
	fill: #FFF !important; stroke: #FFF !important;
}
.ts-carousel.nav-dark.nav-style-1 .ts-prev,
.ts-carousel.nav-dark.nav-style-1 .ts-next,
.ts-carousel.nav-dark.nav-style-1 .ts-next,
.ts-carousel.nav-dark.nav-style-1 .ts-prev { color: var(--dark) !important; }
.ts-carousel.nav-dark.nav-style-2 .ts-prev::before,
.ts-carousel.nav-dark.nav-style-2 .ts-prev::after,
.ts-carousel.nav-dark.nav-style-2 .ts-next::before,
.ts-carousel.nav-dark.nav-style-2 .ts-next::after,
.ts-carousel.nav-dark.nav-style-2 .ts-next::before,
.ts-carousel.nav-dark.nav-style-2 .ts-next::after,
.ts-carousel.nav-dark.nav-style-2 .ts-prev::before,
.ts-carousel.nav-dark.nav-style-2 .ts-prev::after { border-color: var(--dark) !important; }
.ts-carousel.nav-dark.nav-style-3 .ts-prev,
.ts-carousel.nav-dark.nav-style-3 .ts-next,
.ts-carousel.nav-dark.nav-style-3 .ts-next,
.ts-carousel.nav-dark.nav-style-3 .ts-prev { color: var(--dark) !important; }
.ts-carousel.nav-dark.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-dark.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-dark.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-dark.nav-svg-arrows-1 .ts-prev svg polygon { fill: var(--dark) !important; stroke: var(--dark) !important; }
.ts-carousel.nav-dark.nav-arrows-1 .ts-prev,
.ts-carousel.nav-dark.nav-arrows-1 .ts-next,
.ts-carousel.nav-dark.nav-arrows-1 .ts-next,
.ts-carousel.nav-dark.nav-arrows-1 .ts-prev { color: var(--dark) !important; }

/* Dots modifiers */
.ts-carousel.dots-inside .ts-dots,
.ts-carousel.dots-inside .ts-dots {
	position: absolute; bottom: 2px; right: 10px; margin-top: 0;
}
.ts-carousel.dots-title .ts-dots,
.ts-carousel.dots-title .ts-dots {
	position: absolute; margin-top: 0 !important; top: -51px; left: 155px;
}
.ts-carousel.dots-title .ts-dot span,
.ts-carousel.dots-title .ts-dot span { width: 8px; height: 8px; margin: 5px 4px; }
.ts-carousel.dots-title.dots-title-pos-2 .ts-dots,
.ts-carousel.dots-title.dots-title-pos-2 .ts-dots { left: 235px; }

.ts-carousel.dots-light .ts-dot span,
.ts-carousel.dots-light .ts-dot span { background: rgba(255,255,255,.6); }
.ts-carousel.dots-light .ts-dot.active span,
.ts-carousel.dots-light .ts-dot:hover span,
.ts-carousel.dots-light .ts-dot.active span,
.ts-carousel.dots-light .ts-dot:hover span { background: #FFF !important; }

.ts-carousel.dots-dark .ts-dot span,
.ts-carousel.dots-dark .ts-dot span { background: rgba(33,33,33,.6); }
.ts-carousel.dots-dark .ts-dot.active span,
.ts-carousel.dots-dark .ts-dot:hover span,
.ts-carousel.dots-dark .ts-dot.active span,
.ts-carousel.dots-dark .ts-dot:hover span { background: #212121 !important; }

.ts-carousel.dots-morphing .ts-dot span,
.ts-carousel.dots-morphing .ts-dot span { width: 20px; height: 6px; transition: ease width 300ms; }
.ts-carousel.dots-morphing .ts-dot.active span,
.ts-carousel.dots-morphing .ts-dot:hover span,
.ts-carousel.dots-morphing .ts-dot.active span,
.ts-carousel.dots-morphing .ts-dot:hover span { width: 40px; }

.ts-carousel.dots-modern .ts-dots,
.ts-carousel.dots-modern .ts-dots { display: flex; align-items: center; justify-content: center; }
.ts-carousel.dots-modern .ts-dot,
.ts-carousel.dots-modern .ts-dot  { display: flex; align-items: center; justify-content: center; margin: 0 2px; }
.ts-carousel.dots-modern .ts-dot span,
.ts-carousel.dots-modern .ts-dot span { width: 4px; height: 4px; transition: ease all 300ms 300ms; }
.ts-carousel.dots-modern .ts-dot.active span,
.ts-carousel.dots-modern .ts-dot.active span { transition: ease all 300ms; transform: scale(2); }
.ts-carousel.dots-modern.dots-modern-lg .ts-dot,
.ts-carousel.dots-modern.dots-modern-lg .ts-dot { margin: 0 3px; }
.ts-carousel.dots-modern.dots-modern-lg .ts-dot span,
.ts-carousel.dots-modern.dots-modern-lg .ts-dot span { width: 6px; height: 6px; }

.ts-carousel.dots-orientation-portrait .ts-dots,
.ts-carousel.dots-orientation-portrait .ts-dots {
	display: flex; flex-direction: column; margin-left: 15px !important; margin-right: 15px !important;
}
.ts-carousel.dots-align-left .ts-dots,
.ts-carousel.dots-align-left .ts-dots  { text-align: left; justify-content: flex-start; }
.ts-carousel.dots-align-right .ts-dots,
.ts-carousel.dots-align-right .ts-dots { text-align: left; }
.ts-carousel.dots-horizontal-center .ts-dots,
.ts-carousel.dots-horizontal-center .ts-dots { left: 0; right: 0; width: 100%; }
.ts-carousel.dots-vertical-center .ts-dots,
.ts-carousel.dots-vertical-center .ts-dots {
	top: 50%; bottom: auto; margin: 0; transform: translate3d(0, -50%, 0);
}

@media (max-width: 575px) {
	.ts-carousel.show-dots-xs .ts-dots,
	.ts-carousel.show-dots-xs .ts-dots { opacity: 1 !important; visibility: visible !important; }
}
@media (min-width: 576px) and (max-width: 767px) {
	.ts-carousel.show-dots-sm .ts-dots,
	.ts-carousel.show-dots-sm .ts-dots { opacity: 1 !important; visibility: visible !important; }
}
@media (min-width: 768px) and (max-width: 991px) {
	.ts-carousel.show-dots-md .ts-dots,
	.ts-carousel.show-dots-md .ts-dots { opacity: 1 !important; visibility: visible !important; }
}
.ts-carousel.show-dots-hover .ts-dots,
.ts-carousel.show-dots-hover .ts-dots { opacity: 0; visibility: hidden; transition: ease opacity 300ms; }
.ts-carousel.show-dots-hover:hover .ts-dots,
.ts-carousel.show-dots-hover:hover .ts-dots { opacity: 1; visibility: visible; }

/* Carousel shadow */
.ts-carousel.carousel-shadow-1 { position: relative; }
.ts-carousel.carousel-shadow-1::before {
	content: ''; position: absolute; top: 50%; left: 50%;
	width: 65%; height: 0;
	box-shadow: 0 0 110px 180px rgba(0,0,0,.04);
	transform: translate3d(-50%, -50%, 0);
	z-index: 0;
}
.ts-carousel.carousel-shadow-1.carousel-shadow-1-bold::before { box-shadow: 0 0 110px 230px rgba(0,0,0,.04); }

.ts-carousel .img-thumbnail.img-thumbnail-hover-icon { display: block; }

/* carousel-right-side-nav */
.ts-carousel.carousel-right-side-nav { width: calc(100% - 55px); }
.ts-carousel.carousel-right-side-nav .ts-next,
.ts-carousel.carousel-right-side-nav .ts-next { width: 55px; transform: translate3d(100%, -50%, 0); }

/* carousel-bottom-inside-shadow */
.ts-carousel.carousel-bottom-inside-shadow .ts-stage-outer::after,
.ts-carousel.carousel-bottom-inside-shadow .ts-stage-outer::after {
	content: ''; position: absolute; bottom: 0; left: 0;
	height: 35%; width: 100%;
	background-image: linear-gradient(360deg, var(--grey-500) 0%, transparent 100%);
}

/* opacity-* items */
.ts-carousel [class*="opacity-"]:not([class*="opacity-hover"]) { transition: ease opacity 300ms; }
.ts-carousel [class*="opacity-"]:not([class*="opacity-hover"]):hover { opacity: 1 !important; }

/* carousel-sync-style-1 */
@media (min-width: 576px) {
	.ts-carousel.carousel-sync-style-1 {
		position: absolute; top: 50%; left: -30px;
		max-width: 355px; transform: translate3d(0, -50%, 0);
	}
}

/* carousel-spaced */
.carousel-spaced { margin-left: -5px; }
.carousel-spaced .ts-item > div,
.carousel-spaced .ts-item > div { margin: 5px; }
@media (max-width: 575px) { .carousel-spaced { margin-left: 0; } }

/* testimonials */
.ts-carousel.testimonials img { display: inline-block; height: 70px; width: 70px; }

/* carousel-half-full-width-wrapper */
.carousel-half-full-width-wrapper > .ts-carousel { width: 100%; }
@media (min-width: 576px)  { .carousel-half-full-width-wrapper > .ts-carousel { width: calc(100vw - ((100vw - 540px)  / 2)); } }
@media (min-width: 768px)  { .carousel-half-full-width-wrapper > .ts-carousel { width: calc(100vw - ((100vw - 720px)  / 2)); } }
@media (min-width: 992px)  { .carousel-half-full-width-wrapper > .ts-carousel { width: calc(100vw - ((100vw - 960px)  / 2)); } }
@media (min-width: 1200px) { .carousel-half-full-width-wrapper > .ts-carousel { width: calc(100vw - ((100vw - 1140px) / 2)); } }
.carousel-half-full-width-wrapper > .ts-carousel .ts-stage-outer,
.carousel-half-full-width-wrapper > .ts-carousel .ts-stage-outer { margin-bottom: 20px; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left { direction: rtl; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-nav,
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-nav { display: flex; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-prev,
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-prev { order: 2; }
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-next,
.carousel-half-full-width-wrapper.carousel-half-full-width-left > .ts-carousel .ts-next { order: 1; }

/* carousel-areas */
.carousel-areas {
	background: linear-gradient(to bottom, #f2f2f2 0%, rgba(33,37,41,.5) 100%);
	margin-bottom: -10px; padding: 8px 8px 0 8px;
	border-radius: 6px 6px 0 0;
	box-shadow: 0 0 50px 20px rgba(0,0,0,.07);
}
.carousel-areas .ts-carousel { box-shadow: 0 5px 5px rgba(0,0,0,.2); }
.carousel-areas .ts-carousel .ts-prev,
.carousel-areas .ts-carousel .ts-prev { left: -55px; }
.carousel-areas .ts-carousel .ts-next,
.carousel-areas .ts-carousel .ts-next { right: -55px; }
.carousel-areas .ts-carousel:first-child img { border-radius: 6px 6px 0 0; }
@media (max-width: 991px) {
	.carousel-areas .ts-nav,
	.carousel-areas .ts-nav { display: none; }
}

/* center-active-item */
.ts-carousel.carousel-center-active-item .ts-item,
.ts-carousel.carousel-center-active-item .ts-item {
	opacity: 0.2; transition: ease opacity 300ms;
}
.ts-carousel.carousel-center-active-item .ts-item.current,
.ts-carousel.carousel-center-active-item .ts-item.current { opacity: 1 !important; }
.ts-carousel.carousel-center-active-item.carousel-center-active-item-style-2 .ts-item,
.ts-carousel.carousel-center-active-item.carousel-center-active-item-style-2 .ts-item { opacity: 0.7; }

/* center-active-item-2 */
.ts-carousel.carousel-center-active-item-2 .ts-stage-outer,
.ts-carousel.carousel-center-active-item-2 .ts-stage-outer { overflow: visible; }
.ts-carousel.carousel-center-active-item-2 .ts-item > div,
.ts-carousel.carousel-center-active-item-2 .ts-item > div {
	width: 66.6666%; margin-left: auto; padding: 3rem;
	background: var(--light); border-radius: 7px;
	box-shadow: 0 0 70px -40px rgba(0,0,0,.2);
}
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div,
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div { margin-right: auto; }
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div *,
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div * { color: var(--light) !important; }
.ts-carousel.carousel-center-active-item-2 .ts-item.active + .ts-item > div,
.ts-carousel.carousel-center-active-item-2 .ts-item.active + .ts-item > div {
	margin-right: auto; margin-left: 0;
}

/* center-active-item-3 */
.ts-carousel.carousel-center-active-item-3 .ts-stage-outer,
.ts-carousel.carousel-center-active-item-3 .ts-stage-outer { overflow: visible; }
.ts-carousel.carousel-center-active-item-3 .ts-item > div,
.ts-carousel.carousel-center-active-item-3 .ts-item > div { width: 100%; margin-left: auto; transition: ease opacity 300ms; }
.ts-carousel.carousel-center-active-item-3 .ts-item.active > div,
.ts-carousel.carousel-center-active-item-3 .ts-item.active > div { margin-right: auto; }
.ts-carousel.carousel-center-active-item-3 .ts-item.active + .ts-item > div,
.ts-carousel.carousel-center-active-item-3 .ts-item.active + .ts-item > div { margin-right: auto; margin-left: 0; }

/* horizontal-scroller */
.horizontal-scroller         { padding: 2rem 0; height: 100vh; position: relative; }
.horizontal-scroller-scroll  { position: relative; overflow: hidden; padding: 2rem; }
.horizontal-scroller-images  { height: 100%; display: flex; align-items: center; }
.horizontal-scroller-item    { height: 100%; display: flex; justify-content: center; flex: 0 0 auto; padding: 0 2rem; }
.horizontal-scroller-image   { object-fit: fill; margin: 0 auto; max-height: 80vh; padding-top: 10vh; }

/* Skin (primary colour tokens) */
/* Dots active */
.ts-carousel .ts-dot.active span,
.ts-carousel .ts-dot:hover span,
.ts-carousel .ts-dots .ts-dot.active span,
.ts-carousel .ts-dots .ts-dot:hover span { background-color: var(--primary-100); }

/* show-nav-title colour */
.ts-carousel.show-nav-title .ts-prev,
.ts-carousel.show-nav-title .ts-next,
.ts-carousel.show-nav-title .ts-nav button[class*="ts-"],
.ts-carousel.show-nav-title .ts-nav button[class*="ts-"]:hover { color: var(--primary); }

/* default nav buttons */
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-prev,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-next,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-nav button[class*="ts-"] {
	background-color: var(--primary);
	border-color: var(--primary) var(--primary) var(--primary-300);
	color: var(--primary-inverse);
}
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-prev:hover,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-next:hover,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-nav button[class*="ts-"]:hover {
	background-color: var(--primary--100);
	border-color: var(--primary--300) var(--primary--300) var(--primary);
}
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-prev:active,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-next:active,
.ts-carousel:not(.nav-arrows-1):not(.show-nav-title) .ts-nav button[class*="ts-"]:active {
	background-color: var(--primary-300);
	background-image: none;
	border-color: var(--primary-300);
}
.ts-carousel.nav-with-transparency:not(.nav-style-1):not(.show-nav-title):not(.nav-arrows-1) .ts-prev,
.ts-carousel.nav-with-transparency:not(.nav-style-1):not(.show-nav-title):not(.nav-arrows-1) .ts-next,
.ts-carousel.nav-with-transparency:not(.nav-style-1):not(.show-nav-title):not(.nav-arrows-1) .ts-nav button[class*="ts-"] {
	background-color: var(--primary-rgba-35);
}

/* nav-style-1 skin */
.ts-carousel.nav-style-1 .ts-prev,
.ts-carousel.nav-style-1 .ts-next,
.ts-carousel.nav-style-1 .ts-next,
.ts-carousel.nav-style-1 .ts-prev { color: var(--primary) !important; }

/* nav-style-2 skin */
.ts-carousel.nav-style-2 .ts-prev::before,
.ts-carousel.nav-style-2 .ts-prev::after,
.ts-carousel.nav-style-2 .ts-next::before,
.ts-carousel.nav-style-2 .ts-next::after,
.ts-carousel.nav-style-2 .ts-next::before,
.ts-carousel.nav-style-2 .ts-next::after,
.ts-carousel.nav-style-2 .ts-prev::before,
.ts-carousel.nav-style-2 .ts-prev::after { border-color: var(--primary); }

/* nav-svg-arrows-1 skin */
.ts-carousel.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-next svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-prev svg polygon,
.ts-carousel.nav-svg-arrows-1 .ts-next svg polygon { fill: var(--primary); stroke: var(--primary); }

/* nav-arrows-1 skin */
.ts-carousel.nav-arrows-1 .ts-prev,
.ts-carousel.nav-arrows-1 .ts-next,
.ts-carousel.nav-arrows-1 .ts-prev,
.ts-carousel.nav-arrows-1 .ts-next { color: var(--primary); }

/* center-active-item-2 skin */
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div,
.ts-carousel.carousel-center-active-item-2 .ts-item.active > div { background: var(--primary); }

/* carousel-bottom-inside-shadow skin */
.ts-carousel.carousel-bottom-inside-shadow .ts-stage-outer::after,
.ts-carousel.carousel-bottom-inside-shadow .ts-stage-outer::after {
	background-image: linear-gradient(360deg, var(--primary) 0%, transparent 100%);
}

/* Cascading images (unrelated to carousel runtime) */
.cascading-images-wrapper { display: inline-block; padding: 12% 20%; }
.cascading-images-wrapper .cascading-images { transform: translate3d(0, -35%, 0); }
.cascading-images-wrapper .cascading-images img { max-width: 100%; }
`;
		const el = document.createElement('style');
		el.id   = STYLE_ID;
		el.textContent = css;
		document.head.appendChild(el);
	}

	function resolveItems(options, viewportWidth) {
		if (!options.responsive || Object.keys(options.responsive).length === 0) {
			return options.items || 1;
		}
		const bps   = Object.keys(options.responsive).map(Number).sort((a, b) => a - b);
		let   count = options.items || 1;
		for (const bp of bps) {
			if (viewportWidth >= bp) {
				const bpItems = options.responsive[bp].items;
				if (bpItems !== undefined) count = bpItems;
			}
		}
		return count;
	}

	class PluginCarousel {
		constructor($el, opts) {
			return this.initialize($el, opts);
		}

		initialize($el, opts) {
			if ($el.data(instanceName)) return this;
			this.$el = $el;

			// Defer if icon plugin hasn't rendered yet
			if ($el.find('[data-icon]').get(0)) {
				const self = this;
				$(window).on('icon.rendered', function () {
					if ($el.data(instanceName)) return;
					setTimeout(() => {
						self.setData().setOptions(opts).build().events();
					}, 1000);
				});
				return this;
			}

			this.setData().setOptions(opts).build().events();
			return this;
		}

		setData() {
			this.$el.data(instanceName, this);
			return this;
		}

		setOptions(opts) {
			this.options = $.extend(true, {}, PluginCarousel.defaults, opts, {
				wrapper: this.$el
			});
			return this;
		}

		build() {
			injectStyles();

			const self    = this;
			const $el     = this.options.wrapper;
			const o       = this.options;

			// RTL from HTML attribute
			if ($('html').attr('dir') === 'rtl') o.rtl = true;

			// single-item → clear responsive
			if (o.items === 1) o.responsive = {};

			// extra-wide responsive fix (items > 4)
			if (o.items > 4 && (!o.responsive[1199])) {
				o.responsive = $.extend(true, { 1199: { items: o.items } }, o.responsive);
			}

			// Support pre-existing ts-item wrappers (Porto markup) or raw children
			$el.addClass('ts-carousel ts-carousel-init');
			if (o.rtl) $el.addClass('ts-rtl');

			// Check if children are already .ts-item or bare
			const $existingItems = $el.children('.ts-item, .ts-item');
			let   $rawChildren;

			if ($existingItems.length) {
				$rawChildren = $existingItems;
			} else {
				// Wrap bare children
				$rawChildren = $el.children().not('.ts-stage-outer, .ts-nav, .ts-dots');
			}

			// Build stage if not present
			if (!$el.find('.ts-stage-outer').length) {
				const $stageOuter = $('<div class="ts-stage-outer">');
				const $stage      = $('<div class="ts-stage">');
				$stageOuter.append($stage);

				// Move children into stage, wrap each as a ts-item
				$rawChildren.each(function () {
					const $child = $(this);
					if (!$child.hasClass('ts-item')) {
						$child.addClass('ts-item');
					}
					$stage.append($child);
				});

				$el.prepend($stageOuter);
			}

			this.$stage      = $el.find('.ts-stage');
			this.$stageOuter = $el.find('.ts-stage-outer');
			this.$items      = this.$stage.children('.ts-item, .ts-item');

			// Store real items for loop cloning; clone refs live on this._clones
			this._realCount  = this.$items.length;
			this._clones     = [];

			// Nav 
			this._buildNav();

			// Dots 
			if (o.dots !== false) {
				this._buildDots();
			}

			// stagePadding 
			if (o.stagePadding) {
				this.$stageOuter.css({ padding: `0 ${o.stagePadding}px` });
				$el.addClass('ts-stage-padding');
			}

			// Layout / sizing 
			this._currentIndex = o.startPosition || 0;
			this._visibleItems = resolveItems(o, $(window).width());
			this._animating    = false;
			this._clickFlag    = true;

			this._updateLayout();

			// Loop cloning 
			if (o.loop && this._realCount > 1) {
				this._buildClones();
			}

			// Position without animation 
			$el.addClass('ts-no-transition');
			this._setPosition(this._loopOffset(), false);
			setTimeout(() => $el.removeClass('ts-no-transition'), 50);

			this._updateActive();
			this._updateDots();
			this._updateNav();
			this.navigationOffsets();

			// Nav outside 
			if ($el.hasClass('nav-outside')) {
				this._initNavOutside();
			}

			// SVG arrows (nav-svg-arrows-1) 
			if ($el.hasClass('nav-svg-arrows-1')) {
				const svg = '<svg version="1.1" viewBox="0 0 15.698 8.706" width="17" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">' +
					'<polygon stroke="#212121" stroke-width="0.1" fill="#212121" points="11.354,0 10.646,0.706 13.786,3.853 0,3.853 0,4.853 13.786,4.853 10.646,8 11.354,8.706 15.698,4.353 "/>' +
					'</svg>';
				$el.find('.ts-next, .ts-prev, .ts-next, .ts-prev').append(svg);
			}

			// Center active 
			if ($el.hasClass('carousel-center-active-item')) {
				this._updateCenterActive();
			}

			// autoHeight 
			if (o.autoHeight) {
				this._initAutoHeight();
			}

			// Autoplay
			if (o.autoplay) {
				this._startAutoplay();
			}

			// Sync
			if ($el.attr('data-sync')) {
				this._initSync();
			}

			// Navigate by ID 
			this.carouselNavigate();

			// Loading classes 
			$el.removeClass('ts-loading ts-loading');
			$el.css('height', 'auto');

			// Drag / touch 
			this._initDrag();

			// Respond to resize 
			$(window).on('resize.ts-carousel-' + this._uid(), () => {
				clearTimeout(self._resizeTimer);
				self._resizeTimer = setTimeout(() => self._onResize(), 200);
			});

			// Trigger initialized 
			$el.trigger('initialized.ts.carousel');

			return this;
		}

		_uid() {
			if (!this.__uid) this.__uid = Math.random().toString(36).slice(2);
			return this.__uid;
		}

		_updateLayout() {
			const $el  = this.options.wrapper;
			this._visibleItems = resolveItems(this.options, $(window).width());
			const pct  = 100 / this._visibleItems;
			const mar  = this.options.margin || 0;

			this.$items = this.$stage.children('.ts-item, .ts-item');
			this.$items.css({
				width: mar ? `calc(${pct}% - ${mar}px)` : `${pct}%`,
				'margin-right': mar ? `${mar}px` : ''
			});

			// stage width: items × itemWidth + clones
			const totalItems   = this.$stage.children('.ts-item, .ts-item').length;
			const stageWidthPct = (totalItems / this._visibleItems) * 100;
			this.$stage.css('width', `${stageWidthPct}%`);
		}

		_loopOffset() {
			// When looping, clones are prepended; offset so real[0] is visible
			return this.options.loop && this._realCount > 1 ? this._visibleItems : 0;
		}

		_setPosition(absIndex, animate) {
			const $el  = this.options.wrapper;
			if (!animate) $el.addClass('ts-no-transition');

			const allItems = this.$stage.children('.ts-item, .ts-item');
			const itemW    = allItems.first().outerWidth(true);
			const x        = -(absIndex * itemW);

			this.$stage.css('transform', `translate3d(${x}px, 0, 0)`);

			if (!animate) {
				// Force reflow before removing class
				this.$stage[0].getBoundingClientRect();
				$el.removeClass('ts-no-transition');
			}
		}

		_getCurrentAbsIndex() {
			return this._currentIndex + (this.options.loop && this._realCount > 1 ? this._visibleItems : 0);
		}

		_buildClones() {
			const o        = this.options;
			const $realItems = this.$stage.children('.ts-item, .ts-item').not('.ts-clone');
			const count    = this._visibleItems; // prepend & append visibleItems clones

			// Append clones (end of stage → beginning of logical list)
			for (let i = 0; i < count; i++) {
				const $clone = $realItems.eq(i % this._realCount).clone(true).addClass('ts-clone cloned');
				this.$stage.append($clone);
				this._clones.push($clone);
			}

			// Prepend clones (beginning of stage → end of logical list)
			for (let i = count - 1; i >= 0; i--) {
				const $clone = $realItems.eq((this._realCount - 1 - (i % this._realCount) + this._realCount) % this._realCount).clone(true).addClass('ts-clone cloned');
				this.$stage.prepend($clone);
				this._clones.unshift($clone);
			}

			// Re-measure items after cloning
			this.$items = this.$stage.children('.ts-item, .ts-item').not('.ts-clone');
			this._updateLayout();
		}

		_onTransitionEnd() {
			const self = this;
			const o    = self.options;

			if (!o.loop || this._realCount <= 1) {
				self._animating = false;
				self._triggerChanged();
				return;
			}

			const absIndex = self._getCurrentAbsIndex();
			const allItems = self.$stage.children('.ts-item, .ts-item');
			const total    = allItems.length;
			const loopOffset = self._visibleItems;

			// Jump from after-clone zone back to real
			if (absIndex >= loopOffset + self._realCount) {
				self._currentIndex = absIndex - loopOffset - self._realCount;
				self._setPosition(self._getCurrentAbsIndex(), false);
			}
			// Jump from before-clone zone forward to real
			else if (absIndex < loopOffset) {
				self._currentIndex = self._realCount - (loopOffset - absIndex);
				self._setPosition(self._getCurrentAbsIndex(), false);
			}

			self._animating = false;
			self._triggerChanged();
		}

		_triggerChange() {
			this.options.wrapper.trigger({
				type: 'change.ts.carousel',
				item: { index: this._currentIndex, count: this._realCount }
			});
		}

		_triggerChanged() {
			const self = this;
			self.options.wrapper.trigger({
				type: 'changed.ts.carousel',
				item: { index: self._currentIndex, count: self._realCount },
				property: { name: 'position', value: self._currentIndex }
			});
		}

		_buildNav() {
			const $el = this.options.wrapper;
			const o   = this.options;

			// Support pre-existing .ts-nav in markup
			let $nav = $el.find('.ts-nav, .ts-nav');
			if (!$nav.length) {
				$nav = $('<div class="ts-nav ts-nav">');
				$el.append($nav);
			}

			// Support pre-existing prev/next
			let $prev = $nav.find('.ts-prev, .ts-prev');
			let $next = $nav.find('.ts-next, .ts-next');

			const navText = o.navText && o.navText.length === 2
				? o.navText
				: ['<span aria-label="Previous">&#x2039;</span>', '<span aria-label="Next">&#x203a;</span>'];

			if (!$prev.length) {
				$prev = $('<button class="ts-prev ts-prev" type="button">').html(navText[0]);
				$nav.prepend($prev);
			}
			if (!$next.length) {
				$next = $('<button class="ts-next ts-next" type="button">').html(navText[1]);
				$nav.append($next);
			}

			if (o.nav === false) $nav.hide();

			this.$nav  = $nav;
			this.$prev = $prev;
			this.$next = $next;

			const self = this;
			$prev.on('click.ts-carousel', e => {
				e.preventDefault();
				if (o.autoplay && o.autoplayHoverPause) self._stopAutoplay();
				self.prev();
			});
			$next.on('click.ts-carousel', e => {
				e.preventDefault();
				if (o.autoplay && o.autoplayHoverPause) self._stopAutoplay();
				self.next();
			});
		}

		_buildDots() {
			const $el  = this.options.wrapper;
			const o    = this.options;

			let $dots = $el.find('.ts-dots, .ts-dots');
			if (!$dots.length) {
				$dots = $('<div class="ts-dots ts-dots">');
				$el.append($dots);
			}

			// Build one dot per real item (or per page if slideBy === 'page')
			const pages = this._pageCount();
			$dots.empty();
			for (let i = 0; i < pages; i++) {
				const $dot = $('<button class="ts-dot ts-dot" type="button"><span></span></button>');
				if (o.dotsData) {
					// pull data-dot content
					const $realItem = this.$stage.children('.ts-item, .ts-item').not('.ts-clone').eq(i);
					const dotContent = $realItem.find('[data-dot]').attr('data-dot') || '';
					$dot.html(dotContent);
				}
				$dots.append($dot);
			}

			this.$dots = $dots;
			const self = this;

			$dots.on('click.ts-carousel', '.ts-dot, .ts-dot', function () {
				const idx = $(this).index();
				if (o.autoplay && o.autoplayHoverPause) self._stopAutoplay();
				self.to(idx);
			});
		}

		_pageCount() {
			const o = this.options;
			if (o.slideBy === 'page') {
				return Math.ceil(this._realCount / this._visibleItems);
			}
			return this._realCount;
		}

		_pageForIndex(idx) {
			const o = this.options;
			if (o.slideBy === 'page') {
				return Math.floor(idx / this._visibleItems);
			}
			return idx;
		}

		_updateNav() {
			const o   = this.options;
			if (o.nav === false || !this.$prev) return;

			const atStart = !o.loop && this._currentIndex <= 0;
			const atEnd   = !o.loop && this._currentIndex >= this._realCount - this._visibleItems;
			this.$prev.toggleClass('disabled', atStart);
			this.$next.toggleClass('disabled', atEnd);
		}

		_updateDots() {
			if (!this.$dots) return;
			const page = this._pageForIndex(this._currentIndex);
			this.$dots.children().removeClass('active');
			this.$dots.children().eq(page).addClass('active');
		}

		_updateActive() {
			const self   = this;
			const allItems = this.$stage.children('.ts-item, .ts-item');
			allItems.removeClass('active');

			const offset = this._getCurrentAbsIndex();
			for (let i = 0; i < this._visibleItems; i++) {
				allItems.eq(offset + i).addClass('active');
			}
		}

		_updateCenterActive() {
			const $real = this.$stage.children('.ts-item, .ts-item').not('.ts-clone');
			$real.removeClass('current');
			const center = this._currentIndex + Math.floor(this._visibleItems / 2);
			$real.eq(center % this._realCount).addClass('current');
		}

		next(speed) {
			if (this._animating) return;
			const o   = this.options;

			if (!o.loop && this._currentIndex >= this._realCount - this._visibleItems) return;

			this._triggerChange();
			this._currentIndex++;

			if (!o.loop && this._currentIndex > this._realCount - this._visibleItems) {
				this._currentIndex = this._realCount - this._visibleItems;
			}

			this._slide(speed);
		}

		prev(speed) {
			if (this._animating) return;
			const o = this.options;

			if (!o.loop && this._currentIndex <= 0) return;

			this._triggerChange();
			this._currentIndex--;

			if (!o.loop && this._currentIndex < 0) {
				this._currentIndex = 0;
			}

			this._slide(speed);
		}

		to(index, speed) {
			if (this._animating) return;
			index = ((index % this._realCount) + this._realCount) % this._realCount;
			this._triggerChange();
			this._currentIndex = index;
			this._slide(speed);
		}

		_slide(speed) {
			const self = this;
			const o    = self.options;

			self._animating = true;

			const dur = (speed !== undefined ? speed : (o.smartSpeed || 350));

			// Apply transition duration
			self.$stage.css('transition-duration', `${dur}ms`);
			self._setPosition(self._getCurrentAbsIndex(), true);

			self._updateActive();
			self._updateDots();
			self._updateNav();

			if (o.autoHeight) self._updateAutoHeight();

			if ($('.carousel-center-active-item').length) {
				self._updateCenterActive();
			}

			// Trigger change events for animateIn/Out support
			if (o.animateIn || o.animateOut) {
				self.options.wrapper.trigger('change.ts.carousel');
			}

			clearTimeout(self._transitionTimer);
			self._transitionTimer = setTimeout(() => {
				self._onTransitionEnd();

				if (o.animateIn || o.animateOut) {
					self.options.wrapper.trigger('changed.ts.carousel');
				}
			}, dur + 50);
		}

		_startAutoplay() {
			const self = this;
			const o    = this.options;
			self._stopAutoplay();
			self._autoplayInterval = window.setInterval(() => {
				self.next();
			}, o.autoplayTimeout || 5000);

			if (o.autoplayHoverPause) {
				self.options.wrapper.on('mouseenter.ts-autoplay', () => self._stopAutoplay());
				self.options.wrapper.on('mouseleave.ts-autoplay', () => self._startAutoplay());
			}
		}

		_stopAutoplay() {
			clearInterval(this._autoplayInterval);
		}

		_initDrag() {
			const self  = this;
			const o     = self.options;
			const $el   = self.options.wrapper;
			const $stage = self.$stage;
			let   drag  = null;

			if (!o.mouseDrag && !o.touchDrag) return;

			function getPointer(e) {
				const src = e.originalEvent || e;
				const t   = (src.touches && src.touches[0]) || (src.changedTouches && src.changedTouches[0]) || src;
				return { x: t.clientX, y: t.clientY };
			}

			function onStart(e) {
				if (e.which === 3) return;
				const p = getPointer(e);
				drag = {
					startX: p.x, startY: p.y,
					currentX: p.x, currentY: p.y,
					moved: false
				};
				$el.addClass('ts-grabbing');
			}

			function onMove(e) {
				if (!drag) return;
				const p   = getPointer(e);
				const dx  = p.x - drag.startX;
				const dy  = p.y - drag.startY;

				if (!drag.moved && Math.abs(dy) > Math.abs(dx)) {
					// vertical scroll — abort drag
					drag = null;
					return;
				}

				drag.moved   = true;
				drag.currentX = p.x;
				e.preventDefault();
			}

			function onEnd() {
				if (!drag) return;
				const dx = drag.currentX - drag.startX;
				$el.removeClass('ts-grabbing');

				if (drag.moved) {
					if (dx > 30) self.prev();
					else if (dx < -30) self.next();
				}
				drag = null;
			}

			if (o.mouseDrag) {
				$stage.on('mousedown.ts-drag', onStart);
				$(document).on('mousemove.ts-drag-' + self._uid(), onMove);
				$(document).on('mouseup.ts-drag-' + self._uid(), onEnd);
				$stage.on('dragstart.ts-drag selectstart.ts-drag', () => false);
			}

			if (o.touchDrag) {
				$stage[0].addEventListener('touchstart', e => onStart(e), { passive: true });
				$stage[0].addEventListener('touchmove',  e => onMove(e),  { passive: false });
				$stage[0].addEventListener('touchend',   () => onEnd(),    { passive: true });
			}
		}

		_initAutoHeight() {
			$(window).on('load resize', () => this._updateAutoHeight());
			this._updateAutoHeight();
		}

		_updateAutoHeight() {
			const self    = this;
			const $active = self.$stage.children('.ts-item.active, .ts-item.active');
			let   maxH    = 0;
			$active.each(function () { maxH = Math.max(maxH, $(this).outerHeight(true)); });
			if (maxH) self.$stageOuter.height(maxH);
		}

		_initSync() {
			const self    = this;
			const $el     = self.options.wrapper;
			const syncSel = $el.attr('data-sync');

			$el.on('change.ts.carousel', ({ item }) => {
				if (!item) return;
				const $target = $(syncSel);
				const inst    = $target.data(instanceName);
				if (inst) inst.to(item.index);
			});
		}

		_initNavOutside() {
			const self = this;
			const $el  = self.options.wrapper;

			function update() {
				if ($(window).width() < 992) {
					self.options.stagePadding = 40;
					$el.addClass('ts-stage-margin');
					self.$stageOuter.css('padding', '0 40px');
				} else {
					self.options.stagePadding = 0;
					$el.removeClass('ts-stage-margin');
					self.$stageOuter.css('padding', '');
				}
				self.navigationOffsets();
			}

			$(window).on('load resize', update);
			update();
		}

		navigationOffsets() {
			const self = this;
			const $el  = this.options.wrapper;
			const o    = this.options;

			const $nav  = $el.find('.ts-nav, .ts-nav');
			const $dots = $el.find('.ts-dots, .ts-dots');

			function applyOffset($target, h, v) {
				if (h && v) {
					$target.css({ transform: `translate3d(${h}, ${v}, 0)` });
				} else if (h) {
					$target.css({ transform: `translate3d(${h}, 0, 0)` });
				} else if (v) {
					$target.css({ top: `calc(50% - ${v})` });
				}
			}

			if ($nav.length) applyOffset($nav, o.navHorizontalOffset, o.navVerticalOffset);
			if ($dots.length) applyOffset($dots, o.dotsHorizontalOffset, o.dotsVerticalOffset);

			return this;
		}

		_onResize() {
			const prevVisible = this._visibleItems;
			this._visibleItems = resolveItems(this.options, $(window).width());

			// Rebuild clones if visible count changed
			if (prevVisible !== this._visibleItems && this.options.loop && this._realCount > 1) {
				// Remove old clones
				this.$stage.children('.ts-clone').remove();
				this._clones = [];
				this._buildClones();
			}

			this._updateLayout();

			const $el = this.options.wrapper;
			$el.addClass('ts-no-transition');
			this._setPosition(this._getCurrentAbsIndex(), false);
			setTimeout(() => $el.removeClass('ts-no-transition'), 50);

			this._updateActive();
			this._updateDots();
			this._updateNav();
			this.navigationOffsets();

			if (this.options.autoHeight) this._updateAutoHeight();
		}

		carouselNavigate() {
			const self    = this;
			const $el     = this.options.wrapper;
			const elId    = '#' + $el.attr('id');

			if (!$('[data-carousel-navigate]').length) return;

			$(`[data-carousel-navigate-id="${elId}"]`).each(function () {
				const $btn    = $(this);
				const toIndex = parseInt($btn.data('carousel-navigate-to'), 10) - 1;

				if ($($btn.data('carousel-navigate-id')).get(0)) {
					$btn.on('click.ts-carousel', () => {
						self.to(toIndex);
					});
				}
			});

			$el.on('change.ts.carousel', () => {
				$(`[data-carousel-navigate-id="${elId}"]`).removeClass('active');
			});

			$el.on('changed.ts.carousel', ({ item }) => {
				if (!item) return;
				$(`[data-carousel-navigate-id="${elId}"][data-carousel-navigate-to="${item.index + 1}"]`).addClass('active');
			});

			return this;
		}

		events() {
			const self = this;
			const $el  = this.options.wrapper;
			const o    = this.options;

			// animateIn / Out
			if (o.animateIn || o.animateOut) {
				$el.on('change.ts.carousel', () => {
					$el.find('[data-appear-animation], [data-plugin-animated-letters]').addClass('d-none');
					$el.find('[data-plugin-animated-letters]').trigger('animated.letters.destroy');
					$el.find('.ts-item:not(.active) [data-carousel-onchange-show], .ts-item:not(.active) [data-carousel-onchange-show]').removeClass('d-none');
				});

				$el.on('changed.ts.carousel', () => {
					setTimeout(() => {
						$el.find('[data-appear-animation]').each(function () {
							const $this = $(this);
							const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
							$this.themestrapPluginAnimate(pluginOptions || undefined);
						});

						$el.find('.ts-item.active [data-appear-animation], .ts-item.active [data-appear-animation]').removeClass('d-none');
						$el.find('.ts-item.active [data-plugin-animated-letters], .ts-item.active [data-plugin-animated-letters]').removeClass('d-none');
						$el.find('[data-plugin-animated-letters]').trigger('animated.letters.initialize');
						$el.find('.ts-item.ts-clone.active [data-plugin-video-background], .ts-item.cloned.active [data-plugin-video-background]').trigger('video.background.initialize');
					}, 10);
				});
			}

			// data-icon clones
			if ($el.find('[data-icon]').length) {
				$el.on('change.ts.carousel', () => {
					$el.find('.ts-clone [data-icon], .cloned [data-icon]').each(function () {
						const $this = $(this);
						const pluginOptions = themestrap.fn.getOptions($this.data('plugin-options'));
						$this.themestrapPluginIcon(pluginOptions || undefined);
					});
				});
			}

			// Video background
			if ($el.find('[data-plugin-video-background]').get(0)) {
				$(window).trigger('resize');
			}

			// Hover pause for autoplay
			if (o.autoplay && o.autoplayHoverPause) {
				$el.on('mouseenter.ts-carousel-ap', () => self._stopAutoplay());
				$el.on('mouseleave.ts-carousel-ap', () => self._startAutoplay());
			}

			return this;
		}

		destroy() {
			const $el  = this.options.wrapper;
			this._stopAutoplay();
			clearTimeout(this._transitionTimer);
			clearTimeout(this._resizeTimer);
			$(window).off('resize.ts-carousel-' + this._uid());
			$(document).off('mousemove.ts-drag-' + this._uid());
			$(document).off('mouseup.ts-drag-' + this._uid());
			$el.off('.ts-carousel .ts-carousel-ap ts-autoplay');
			this.$stage.children('.ts-clone').remove();
			$el.removeClass('ts-carousel ts-carousel-init ts-rtl ts-loading');
			$el.removeData(instanceName);
		}
	}

	PluginCarousel.defaults = {
		// Core
		items:       3,
		loop:        true,
		center:      false,
		rewind:      false,

		// Drag
		mouseDrag:   true,
		touchDrag:   true,
		pullDrag:    true,

		// Layout
		margin:      0,
		stagePadding: 0,
		autoWidth:   false,
		startPosition: 0,
		rtl:         false,

		// Speed
		smartSpeed:  350,
		dragEndSpeed: false,

		// Responsive
		responsive: {
			0:    { items: 1 },
			479:  { items: 1 },
			768:  { items: 2 },
			979:  { items: 3 },
			1199: { items: 4 }
		},

		// Nav
		nav:         true,
		navText:     [],
		navSpeed:    false,
		slideBy:     1,

		// Dots
		dots:        true,
		dotsEach:    false,
		dotsData:    false,
		dotsSpeed:   false,

		// Autoplay
		autoplay:        false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed:   false,

		// Height
		autoHeight: false,

		// Animate
		animateIn:  false,
		animateOut: false,

		// Internal
		refresh: false
	};

	$.extend(themestrap, { PluginCarousel });

	$.fn.themestrapPluginCarousel = function (opts) {
		return this.map(function () {
			const $this = $(this);
			if ($this.data(instanceName)) return $this.data(instanceName);
			return new PluginCarousel($this, opts);
		});
	};

})).apply(this, [window.themestrap, jQuery]);
