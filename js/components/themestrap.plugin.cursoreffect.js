
// CursorEffect
(((themestrap = {}, $) => {
	const instanceName = '__cursorEffect';

	class PluginCursorEffect {
		constructor($el, opts) {
			return this.initialize($el, opts);
		}

		initialize($el, opts) {
			if ($el.data(instanceName)) {
				return $el.data(instanceName);
			}

			this.$el = $el;

			this
				.setData()
				.setOptions(opts)
				.build()
				.events();

			return this;
		}

		setData() {
			this.$el.data(instanceName, this);

			return this;
		}

		setOptions(opts) {
			this.options = $.extend(true, {}, PluginCursorEffect.defaults, opts, {
				wrapper: this.$el
			});

			return this;
		}

		build() {
			const self = this;

			self.clientX = -100;
			self.clientY = -100;
			self.isStuck = false;
			self.isVisible = true;

			// Hide native mouse cursor.
			if (self.options.hideMouseCursor) {
				self.$el.addClass('hide-mouse-cursor');
			}

			// Creates the cursor outer node.
			self.cursorOuter = document.createElement('div');
			self.cursorOuter.className = 'cursor-outer';

			// Creates the cursor inner node.
			self.cursorInner = document.createElement('div');
			self.cursorInner.className = 'cursor-inner';

			// Custom cursor outer color.
			if (self.options.cursorOuterColor) {
				self.cursorOuter.style.borderColor = self.options.cursorOuterColor;
			}

			// Custom cursor inner color.
			if (self.options.cursorInnerColor) {
				self.cursorInner.style.backgroundColor = self.options.cursorInnerColor;
			}

			// Size.
			self.applySize();

			// Style.
			if (self.options.style) {
				self.$el.addClass(self.options.style);
			}

			// Add cursor nodes to the document.
			document.body.prepend(self.cursorOuter);
			document.body.prepend(self.cursorInner);

			// Render loop.
			const render = () => {
				if (!self.cursorOuter || !self.cursorInner) {
					return;
				}

				self.cursorOuter.style.transform =
					'translate(' + self.clientX + 'px, ' + self.clientY + 'px)';

				self.cursorInner.style.transform =
					'translate(' + self.clientX + 'px, ' + self.clientY + 'px)';

				self.loopInside = requestAnimationFrame(render);
			};

			self.loop = requestAnimationFrame(render);

			return this;
		}

		applySize() {
			const self = this;

			self.$el.removeClass(
				'cursor-effect-size-small cursor-effect-size-big'
			);

			switch (self.options.size) {
				case 'small':
					self.$el.addClass('cursor-effect-size-small');
					break;

				case 'big':
					self.$el.addClass('cursor-effect-size-big');
					break;
			}

			return this;
		}

		setSize(size) {
			const allowedSizes = ['small', 'default', 'big'];

			if (allowedSizes.indexOf(size) === -1) {
				size = 'default';
			}

			this.options.size = size;
			this.applySize();

			return this;
		}

		show() {
			const self = this;

			if (self.cursorOuter) {
				$(self.cursorOuter).removeClass('opacity-0');
			}

			if (self.cursorInner) {
				$(self.cursorInner).removeClass('opacity-0');
			}

			self.isVisible = true;

			return this;
		}

		hide() {
			const self = this;

			if (self.cursorOuter) {
				$(self.cursorOuter).addClass('opacity-0');
			}

			if (self.cursorInner) {
				$(self.cursorInner).addClass('opacity-0');
			}

			self.isVisible = false;

			return this;
		}

		events() {
			const self = this;
			const $cursorOuter = $(self.cursorOuter);
			const $cursorInner = $(self.cursorInner);

			const initialCursorOuterBox =
				self.cursorOuter.getBoundingClientRect();

			const initialCursorOuterRadius =
				$cursorOuter.css('border-radius');

			// Update cursor position.
			self._mousemoveHandler = ({ clientX, clientY }) => {
				if (!self.isStuck) {
					self.clientX = clientX - 20;
					self.clientY = clientY - 20;
				}

				if (self.isVisible) {
					$cursorOuter.removeClass('opacity-0');
				}
			};

			document.addEventListener(
				'mousemove',
				self._mousemoveHandler
			);

			// Hover effects.
			self._hoverSelector = '[data-cursor-effect-hover]';

			self._mouseenterHandler = function () {
				const $this = $(this);

				$cursorOuter.addClass('cursor-outer-hover');
				$cursorInner.addClass('cursor-inner-hover');

				const hoverColor =
					$this.data('cursor-effect-hover-color');

				if (hoverColor) {
					$cursorOuter.addClass(
						'cursor-color-' + hoverColor
					);

					$cursorInner.addClass(
						'cursor-color-' + hoverColor
					);
				}

				switch ($this.data('cursor-effect-hover')) {
					case 'fit': {
						const thisBox =
							$this[0].getBoundingClientRect();

						self.clientX = thisBox.x;
						self.clientY = thisBox.y;

						$cursorOuter.css({
							width: thisBox.width,
							height: thisBox.height,
							'border-radius': $this.css('border-radius')
						}).addClass('cursor-outer-fit');

						$cursorInner.addClass('opacity-0');

						self.isStuck = true;
						break;
					}

					case 'plus':
						$cursorInner.addClass('cursor-inner-plus');
						break;
				}
			};

			self._mouseleaveHandler = function () {
				const $this = $(this);

				$cursorOuter.removeClass('cursor-outer-hover');
				$cursorInner.removeClass('cursor-inner-hover');

				const hoverColor =
					$this.data('cursor-effect-hover-color');

				if (hoverColor) {
					$cursorOuter.removeClass(
						'cursor-color-' + hoverColor
					);

					$cursorInner.removeClass(
						'cursor-color-' + hoverColor
					);
				}

				switch ($this.data('cursor-effect-hover')) {
					case 'fit':
						$cursorOuter.css({
							width: initialCursorOuterBox.width,
							height: initialCursorOuterBox.height,
							'border-radius': initialCursorOuterRadius
						}).removeClass('cursor-outer-fit');

						$cursorInner.removeClass('opacity-0');

						self.isStuck = false;
						break;

					case 'plus':
						$cursorInner.removeClass(
							'cursor-inner-plus'
						);
						break;
				}
			};

			$(document)
				.on(
					'mouseenter' + instanceName,
					self._hoverSelector,
					self._mouseenterHandler
				)
				.on(
					'mouseleave' + instanceName,
					self._hoverSelector,
					self._mouseleaveHandler
				);

			// If the cursor is stuck to an element, release it on scroll.
			self._scrollHandler = () => {
				if ($cursorOuter.hasClass('cursor-outer-fit')) {
					$cursorOuter
						.addClass('opacity-0')
						.removeClass('cursor-outer-fit');

					$cursorInner.removeClass('opacity-0');

					self.isStuck = false;
				}
			};

			$(window).on(
				'scroll' + instanceName,
				self._scrollHandler
			);

			return this;
		}

		destroy() {
			const self = this;

			// Stop animation loop.
			if (self.loop) {
				cancelAnimationFrame(self.loop);
			}

			if (self.loopInside) {
				cancelAnimationFrame(self.loopInside);
			}

			// Remove document events.
			if (self._mousemoveHandler) {
				document.removeEventListener(
					'mousemove',
					self._mousemoveHandler
				);
			}

			$(document).off(instanceName);
			$(window).off(instanceName);

			// Restore host element.
			self.$el.removeClass(
				'hide-mouse-cursor ' +
				'cursor-effect-size-small ' +
				'cursor-effect-size-big ' +
				'cursor-effect-style-square'
			);

			// Remove cursor elements.
			if (self.cursorOuter) {
				self.cursorOuter.remove();
			}

			if (self.cursorInner) {
				self.cursorInner.remove();
			}

			// Remove stored instance.
			self.$el.removeData(instanceName);

			self.cursorOuter = null;
			self.cursorInner = null;

			return this;
		}
	}

	PluginCursorEffect.defaults = {
		size: 'default',
		hideMouseCursor: false,
		cursorOuterColor: null,
		cursorInnerColor: null,
		style: null
	};

	$.extend(themestrap, {
		PluginCursorEffect
	});

	$.fn.themestrapPluginCursorEffect = function(opts) {
		return this.map(function () {
			const $this = $(this);

			if ($this.data(instanceName)) {
				return $this.data(instanceName);
			}

			return new PluginCursorEffect($this, opts);
		});
	};

})).apply(this, [window.themestrap, jQuery]);
