// ==========================================
// Tabs Component
// ==========================================
// Accessible tab interface with gliding indicator,
// multiple visual variants, panel animations, URL hash sync,
// History API, lazy loading, persistence, scroll arrows,
// touch swipe, disabled tabs, and nested tabs support.
// ==========================================

import { CONFIG, EventManager, generateId, throttle } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass, toggleClass } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';

class Tabs {
	/**
	 * @param {Element} element
	 * @param {Object} options
	 * @param {string} options.variant        – 'underline' | 'pill' | 'segmented' | 'vertical'
	 * @param {string} options.animation      – 'fade' | 'slide' | 'none'
	 * @param {boolean} options.lazy          – load panel content only on first activation
	 * @param {boolean} options.hash          – sync with URL hash
	 * @param {boolean} options.history       – push history state on tab change
	 * @param {boolean} options.persist       – remember active tab in sessionStorage
	 * @param {boolean} options.autoHeight    – animate container height on tab change
	 * @param {boolean} options.scrollArrows  – show prev/next arrows for horizontal scroll
	 * @param {string} options.openClass      – CSS class for active tab/panel
	 * @param {string} options.disabledClass  – CSS class for disabled tab
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.id = element.id || generateId('tabs');

		this.options = {
			variant: options.variant || element.dataset.tabsVariant || 'underline',
			animation: options.animation || element.dataset.tabsAnimation || 'none',
			lazy: options.lazy !== undefined ? options.lazy : element.dataset.tabsLazy !== undefined,
			hash: options.hash !== undefined ? options.hash : element.dataset.tabsHash !== undefined,
			history: options.history !== undefined ? options.history : element.dataset.tabsHistory !== 'false',
			persist: options.persist !== undefined ? options.persist : element.dataset.tabsPersist !== undefined,
			autoHeight: options.autoHeight !== undefined ? options.autoHeight : element.dataset.tabsAutoHeight !== undefined,
			scrollArrows: options.scrollArrows !== undefined ? options.scrollArrows : element.dataset.tabsScrollArrows !== undefined,
			openClass: options.openClass || CONFIG.STATE.ACTIVE || 'is-active',
			disabledClass: options.disabledClass || 'is-disabled',
			...options
		};

		this.list = null;
		this.triggers = [];
		this.panels = [];
		this.activeIndex = -1;
		this.isVertical = this.options.variant === 'vertical';

		// Gliding indicator
		this._indicator = null;
		this._resizeObserver = null;
		this._roHandler = null;

		// Scroll arrows
		this._prevBtn = null;
		this._nextBtn = null;
		this._scrollHandler = null;

		// Touch swipe
		this._touch = { startX: 0, startY: 0, isTracking: false, threshold: 50 };

		// Handler registry for clean destroy()
		this._handlers = {
			triggers: [],
			keydown: null,
			listKeydown: null,
			touchStart: null,
			touchMove: null,
			touchEnd: null,
			hashChange: null,
			popstate: null,
			scroll: null
		};

		this.init();
	}

	// ================================
	// Initialization
	// ================================

	init() {
		this.list = qs('[data-tabs-list]', this.element) || qs('[role="tablist"]', this.element);
		if (!this.list) {
			const rawTriggers = qsa('[data-tabs-trigger]', this.element);
			if (rawTriggers.length) {
				this.list = document.createElement('div');
				this.list.setAttribute('role', 'tablist');
				rawTriggers[0].parentNode.insertBefore(this.list, rawTriggers[0]);
				rawTriggers.forEach(t => this.list.appendChild(t));
			}
		}

		if (!this.list) return;

		addClass(this.element, `tabs--${this.options.variant}`);

		const rawTriggers = qsa('[data-tabs-trigger]', this.list);
		const rawPanels = qsa('[data-tabs-panel]', this.element);

		rawTriggers.forEach((trigger, index) => {
			const targetId = trigger.dataset.tabsTrigger || trigger.getAttribute('href')?.replace('#', '');
			const panel = rawPanels.find(p => (p.id === targetId) || p.dataset.tabsPanel === targetId);
			if (!panel) return;

			const isDisabled = trigger.hasAttribute('disabled') || trigger.dataset.tabsDisabled === 'true';

			this.triggers.push({ trigger, panel, targetId, disabled: isDisabled, index });
			this.panels.push(panel);
		});

		if (this.triggers.length === 0) return;

		this._setupAria();

		if (['underline', 'segmented', 'pill'].includes(this.options.variant)) {
			this._createIndicator();
		}

		if (this.options.scrollArrows && !this.isVertical) {
			this._setupScrollArrows();
		}

		this._bindEvents();

		let initialIndex = this._resolveInitialIndex();
		if (initialIndex === -1) initialIndex = 0;

		while (this.triggers[initialIndex]?.disabled && initialIndex < this.triggers.length - 1) {
			initialIndex++;
		}

		this.activate(initialIndex, { silent: true, skipHistory: true, skipHash: true });

		if (this._indicator && typeof ResizeObserver !== 'undefined') {
			this._roHandler = () => this._updateIndicator();
			this._resizeObserver = new ResizeObserver(throttle(this._roHandler, 100));
			this._resizeObserver.observe(this.list);
		}
	}

	// ================================
	// ARIA
	// ================================

	_setupAria() {
		if (!this.list.getAttribute('role')) {
			this.list.setAttribute('role', 'tablist');
		}
		if (this.isVertical) {
			this.list.setAttribute('aria-orientation', 'vertical');
		}

		this.triggers.forEach(({ trigger, panel, targetId, disabled }, index) => {
			const tabId = trigger.id || `${this.id}-tab-${index}`;
			const panelId = panel.id || `${this.id}-panel-${index}`;

			if (!trigger.id) trigger.id = tabId;
			if (!panel.id) panel.id = panelId;

			trigger.setAttribute('role', 'tab');
			trigger.setAttribute('aria-controls', panelId);
			trigger.setAttribute('tabindex', index === 0 ? '0' : '-1');
			trigger.setAttribute('aria-selected', 'false');

			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', tabId);
			panel.setAttribute('tabindex', '0');

			if (disabled) {
				trigger.setAttribute('aria-disabled', 'true');
				trigger.setAttribute('tabindex', '-1');
				addClass(trigger, this.options.disabledClass);
			}

			if (this.options.lazy && index !== 0) {
				panel.dataset.tabsLazyLoaded = 'false';
			}
		});
	}

	// ================================
	// Gliding Indicator
	// ================================

	_createIndicator() {
		this._indicator = document.createElement('span');
		this._indicator.className = 'tabs__indicator';
		this._indicator.setAttribute('aria-hidden', 'true');
		this.list.appendChild(this._indicator);
	}

	_updateIndicator() {
		if (!this._indicator || this.activeIndex < 0) return;

		const active = this.triggers[this.activeIndex];
		if (!active || active.disabled) return;

		// Use offsetLeft/offsetTop instead of getBoundingClientRect()
		// because these are relative to offsetParent (.tabs__list) and
		// do NOT change during scroll. The indicator is a child of
		// .tabs__list with position: absolute, so it naturally moves
		// with the scrolled content.
		if (this.isVertical) {
			const offset = active.trigger.offsetTop;
			const size = active.trigger.offsetHeight;
			this._indicator.style.transform = `translateY(${offset}px)`;
			this._indicator.style.height = `${size}px`;
			this._indicator.style.width = '3px';
			this._indicator.style.left = '0';
			this._indicator.style.top = '0';
		} else {
			const offset = active.trigger.offsetLeft;
			const size = active.trigger.offsetWidth;
			this._indicator.style.transform = `translateX(${offset}px)`;
			this._indicator.style.width = `${size}px`;
			this._indicator.style.height = '2px';
			this._indicator.style.top = 'auto';
			this._indicator.style.bottom = '0';
			this._indicator.style.left = '0';
		}
	}

	// ================================
	// Scroll Arrows
	// ================================

	_setupScrollArrows() {
		// Wrap the tab list in a nav container so arrows can be
		// absolutely positioned relative to the list height only
		if (!this.list.parentElement.classList.contains('tabs__nav')) {
			this._navWrapper = document.createElement('div');
			this._navWrapper.className = 'tabs__nav';
			this.list.parentNode.insertBefore(this._navWrapper, this.list);
			this._navWrapper.appendChild(this.list);
		} else {
			this._navWrapper = this.list.parentElement;
		}

		this._prevBtn = document.createElement('button');
		this._prevBtn.type = 'button';
		this._prevBtn.className = 'tabs__scroll-btn tabs__scroll-btn--prev';
		this._prevBtn.setAttribute('aria-label', 'Previous tabs');
		this._prevBtn.innerHTML = '<span aria-hidden="true">‹</span>';
		this._prevBtn.hidden = true;

		this._nextBtn = document.createElement('button');
		this._nextBtn.type = 'button';
		this._nextBtn.className = 'tabs__scroll-btn tabs__scroll-btn--next';
		this._nextBtn.setAttribute('aria-label', 'Next tabs');
		this._nextBtn.innerHTML = '<span aria-hidden="true">›</span>';
		this._nextBtn.hidden = true;

		this._navWrapper.appendChild(this._prevBtn);
		this._navWrapper.appendChild(this._nextBtn);

		this._prevBtn.addEventListener('click', () => this._scrollBy('start'));
		this._nextBtn.addEventListener('click', () => this._scrollBy('end'));

		// Direct scroll handler — only update arrow visibility
		this._scrollHandler = () => {
			this._updateScrollArrows();
		};
		this.list.addEventListener('scroll', this._scrollHandler, { passive: true });

		// scrollend for final arrow state update
		this._scrollEndHandler = () => {
			this._updateScrollArrows();
		};
		this.list.addEventListener('scrollend', this._scrollEndHandler);

		// Fallback scroll-stop detection for Safari / older browsers
		this._scrollStopTimer = null;

		this._updateScrollArrows();
	}

	_updateScrollArrows() {
		if (!this._prevBtn || !this._nextBtn || this.triggers.length === 0) return;

		const listRect = this.list.getBoundingClientRect();
		const firstRect = this.triggers[0].trigger.getBoundingClientRect();
		const lastRect = this.triggers[this.triggers.length - 1].trigger.getBoundingClientRect();

		// ±2px tolerance for subpixel rounding and fractional widths
		const atStart = firstRect.left >= listRect.left - 2;
		const atEnd = lastRect.right <= listRect.right + 2;

		this._prevBtn.hidden = atStart;
		this._nextBtn.hidden = atEnd;
	}

	_scrollBy(direction) {
		const scrollAmount = this.list.clientWidth * 0.75;
		this.list.scrollBy({
			left: direction === 'start' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	}

	// ================================
	// Event Binding
	// ================================

	_bindEvents() {
		this.triggers.forEach(({ trigger, disabled }, index) => {
			if (disabled) return;

			const clickHandler = (e) => {
				e.preventDefault();
				this.activate(index);
			};
			trigger.addEventListener('click', clickHandler);

			const keydownHandler = (e) => this._onTriggerKeydown(e, index);
			trigger.addEventListener('keydown', keydownHandler);

			this._handlers.triggers.push({ trigger, clickHandler, keydownHandler });
		});

		this._handlers.listKeydown = (e) => this._onListKeydown(e);
		this.list.addEventListener('keydown', this._handlers.listKeydown);

		this._handlers.touchStart = (e) => this._onTouchStart(e);
		this._handlers.touchMove = (e) => this._onTouchMove(e);
		this._handlers.touchEnd = () => this._onTouchEnd();

		this.element.addEventListener('touchstart', this._handlers.touchStart, { passive: true });
		this.element.addEventListener('touchmove', this._handlers.touchMove, { passive: true });
		this.element.addEventListener('touchend', this._handlers.touchEnd);

		if (this.options.hash) {
			this._handlers.hashChange = () => this._onHashChange();
			window.addEventListener('hashchange', this._handlers.hashChange);
		}

		if (this.options.scrollArrows && !this.isVertical) {
			this._scrollArrowsResizeObserver = new ResizeObserver(() => this._updateScrollArrows());
			this._scrollArrowsResizeObserver.observe(this.element);
		}

		if (this.options.history && this.options.hash) {
			this._handlers.popstate = (e) => this._onPopstate(e);
			window.addEventListener('popstate', this._handlers.popstate);
		}
	}

	// ================================
	// Activation
	// ================================

	activate(index, opts = {}) {
		if (index === this.activeIndex) return;
		if (index < 0 || index >= this.triggers.length) return;

		const target = this.triggers[index];
		if (target.disabled) return;

		const prevIndex = this.activeIndex;
		const prev = prevIndex >= 0 ? this.triggers[prevIndex] : null;

		this.activeIndex = index;

		this.triggers.forEach(({ trigger, disabled }, i) => {
			if (disabled) return;
			const isActive = i === index;
			trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
			trigger.setAttribute('tabindex', isActive ? '0' : '-1');
			toggleClass(trigger, this.options.openClass, isActive);
		});

		this.triggers.forEach(({ panel }, i) => {
			const isActive = i === index;
			if (isActive) {
				addClass(panel, this.options.openClass);
				panel.removeAttribute('hidden');
				panel.removeAttribute('inert');
			} else {
				removeClass(panel, this.options.openClass);
				panel.setAttribute('hidden', '');
				panel.setAttribute('inert', '');
			}
		});

		if (this.options.lazy && target.panel.dataset.tabsLazyLoaded === 'false') {
			this._lazyLoad(target.panel);
		}

		this._animatePanel(target.panel, prev?.panel);

		if (this.options.autoHeight) {
			this._animateHeight(target.panel);
		}

		if (this._indicator) {
			requestAnimationFrame(() => this._updateIndicator());
		}

		if (this.options.scrollArrows && !this.isVertical) {
			requestAnimationFrame(() => {
				target.trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
			});
		}

		if (this.options.hash && !opts.skipHash) {
			this._updateHash(target.targetId, opts.skipHistory);
		}

		if (this.options.persist && !opts.skipPersist) {
			this._persist(index);
		}

		if (!opts.silent) {
			EventManager.dispatch(this.element, 'tabs:changed', {
				tabs: this,
				index,
				previousIndex: prevIndex,
				trigger: target.trigger,
				panel: target.panel,
				targetId: target.targetId
			});
		}
	}

	// ================================
	// Panel Animations
	// ================================

	_animatePanel(activePanel, prevPanel) {
		const anim = this.options.animation;
		if (anim === 'none') return;

		this.panels.forEach(p => {
			removeClass(p, 'tabs__panel--enter', 'tabs__panel--exit', 'tabs__panel--slide-left', 'tabs__panel--slide-right');
		});

		if (anim === 'fade') {
			addClass(activePanel, 'tabs__panel--enter');
			if (prevPanel) {
				addClass(prevPanel, 'tabs__panel--exit');
			}
		} else if (anim === 'slide') {
			const direction = this.activeIndex > (this._prevActiveForSlide ?? -1) ? 'right' : 'left';
			this._prevActiveForSlide = this.activeIndex;
			addClass(activePanel, direction === 'right' ? 'tabs__panel--slide-right' : 'tabs__panel--slide-left');
		}
	}

	_animateHeight(targetPanel) {
		const wrapper = qs('.tabs__panels', this.element) || this.panels[0]?.parentElement;
		if (!wrapper) return;

		const startHeight = wrapper.getBoundingClientRect().height;
		const targetHeight = targetPanel.getBoundingClientRect().height;

		wrapper.style.height = `${startHeight}px`;
		void wrapper.offsetHeight;
		wrapper.style.transition = 'height 0.35s ease';
		wrapper.style.height = `${targetHeight}px`;

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			wrapper.style.height = '';
			wrapper.style.transition = '';
			wrapper.removeEventListener('transitionend', onEnd);
		};
		wrapper.addEventListener('transitionend', onEnd);
	}

	// ================================
	// Lazy Loading
	// ================================

	_lazyLoad(panel) {
		const src = panel.dataset.tabsLazySrc;
		if (src) {
			fetch(src)
				.then(r => r.text())
				.then(html => {
					panel.innerHTML = html;
					panel.dataset.tabsLazyLoaded = 'true';
					EventManager.dispatch(this.element, 'tabs:loaded', { panel, tabs: this });
				})
				.catch(err => {
					console.error('Tabs lazy load failed:', err);
					panel.dataset.tabsLazyLoaded = 'error';
				});
		} else {
			panel.dataset.tabsLazyLoaded = 'true';
		}
	}

	// ================================
	// Hash & History
	// ================================

	_updateHash(targetId, skipHistory = false) {
		if (!targetId) return;
		const newHash = `#${targetId}`;
		if (window.location.hash === newHash) return;

		if (this.options.history && !skipHistory) {
			history.pushState({ core4Tabs: this.id, index: this.activeIndex }, '', newHash);
		} else {
			history.replaceState({ core4Tabs: this.id, index: this.activeIndex }, '', newHash);
		}
	}

	_onHashChange() {
		const hash = window.location.hash.replace('#', '');
		const index = this.triggers.findIndex(t => t.targetId === hash);
		if (index !== -1 && index !== this.activeIndex) {
			this.activate(index, { skipHash: true, skipHistory: true });
		}
	}

	_onPopstate(e) {
		const state = e.state;
		if (state?.core4Tabs === this.id && typeof state.index === 'number') {
			this.activate(state.index, { skipHash: true, skipHistory: true });
		}
	}

	// ================================
	// Persistence
	// ================================

	_persist(index) {
		try {
			const key = `core4-tabs-${this.id}`;
			sessionStorage.setItem(key, String(index));
		} catch (e) { /* noop */ }
	}

	_resolveInitialIndex() {
		if (this.options.hash) {
			const hash = window.location.hash.replace('#', '');
			const hashIndex = this.triggers.findIndex(t => t.targetId === hash);
			if (hashIndex !== -1 && !this.triggers[hashIndex].disabled) return hashIndex;
		}

		if (this.options.persist) {
			try {
				const key = `core4-tabs-${this.id}`;
				const stored = sessionStorage.getItem(key);
				if (stored !== null) {
					const idx = parseInt(stored, 10);
					if (!isNaN(idx) && idx >= 0 && idx < this.triggers.length && !this.triggers[idx].disabled) {
						return idx;
					}
				}
			} catch (e) { /* noop */ }
		}

		const defaultIndex = this.triggers.findIndex(({ trigger }) =>
			trigger.classList.contains(this.options.openClass) || trigger.getAttribute('aria-selected') === 'true'
		);
		return defaultIndex;
	}

	// ================================
	// Keyboard Navigation
	// ================================

	_onTriggerKeydown(e, index) {
		if (Keyboard.isEnter(e) || e.key === ' ') {
			e.preventDefault();
			this.activate(index);
		}
	}

	_onListKeydown(e) {
		if (!Keyboard.isArrow(e) && e.key !== 'Home' && e.key !== 'End') return;

		const activeTrigger = this.triggers[this.activeIndex]?.trigger;
		if (document.activeElement !== activeTrigger) return;

		e.preventDefault();

		let nextIndex = this.activeIndex;
		const len = this.triggers.length;
		const isVertical = this.isVertical;

		const getNext = (idx, dir) => {
			let i = idx;
			for (let step = 0; step < len; step++) {
				i = (i + dir + len) % len;
				if (!this.triggers[i].disabled) return i;
			}
			return idx;
		};

		if (e.key === 'ArrowRight' || (e.key === 'ArrowDown' && !isVertical) || (e.key === 'ArrowDown' && isVertical)) {
			nextIndex = getNext(nextIndex, 1);
		} else if (e.key === 'ArrowLeft' || (e.key === 'ArrowUp' && !isVertical) || (e.key === 'ArrowUp' && isVertical)) {
			nextIndex = getNext(nextIndex, -1);
		} else if (e.key === 'Home') {
			nextIndex = this.triggers.findIndex(t => !t.disabled);
		} else if (e.key === 'End') {
			nextIndex = this.triggers.map(t => !t.disabled).lastIndexOf(true);
		}

		if (nextIndex !== this.activeIndex) {
			const nextTrigger = this.triggers[nextIndex].trigger;
			nextTrigger.focus();
			this.activate(nextIndex);
			// Ensure focused tab is visible (instant, no animation)
			if (this.options.scrollArrows && !this.isVertical) {
				nextTrigger.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
			}
		}
	}

	// ================================
	// Touch Swipe
	// ================================

	_onTouchStart(e) {
		const touch = e.touches[0];
		this._touch.startX = touch.clientX;
		this._touch.startY = touch.clientY;
		this._touch.isTracking = true;
	}

	_onTouchMove(e) {
		if (!this._touch.isTracking) return;
		const touch = e.touches[0];
		const deltaX = touch.clientX - this._touch.startX;
		const deltaY = Math.abs(touch.clientY - this._touch.startY);

		if (deltaY > Math.abs(deltaX)) {
			this._touch.isTracking = false;
			return;
		}
	}

	_onTouchEnd() {
		if (!this._touch.isTracking) return;
		this._touch.isTracking = false;

		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - this._touch.startX;

		if (Math.abs(deltaX) < this._touch.threshold) return;

		if (deltaX < 0 && this.activeIndex < this.triggers.length - 1) {
			this.activate(this.activeIndex + 1);
		} else if (deltaX > 0 && this.activeIndex > 0) {
			this.activate(this.activeIndex - 1);
		}
	}

	// ================================
	// Public API
	// ================================

	next() {
		const idx = this.triggers.findIndex((t, i) => i > this.activeIndex && !t.disabled);
		if (idx !== -1) this.activate(idx);
	}

	prev() {
		const idx = this.triggers.map((t, i) => ({ ...t, i }))
			.filter(t => t.i < this.activeIndex && !t.disabled)
			.pop()?.i;
		if (idx !== undefined) this.activate(idx);
	}

	disable(index) {
		const item = this.triggers[index];
		if (!item) return;
		item.disabled = true;
		item.trigger.setAttribute('aria-disabled', 'true');
		item.trigger.setAttribute('tabindex', '-1');
		addClass(item.trigger, this.options.disabledClass);
		if (this.activeIndex === index) {
			this.next() || this.prev();
		}
	}

	enable(index) {
		const item = this.triggers[index];
		if (!item) return;
		item.disabled = false;
		item.trigger.removeAttribute('aria-disabled');
		item.trigger.setAttribute('tabindex', index === this.activeIndex ? '0' : '-1');
		removeClass(item.trigger, this.options.disabledClass);
	}

	get active() {
		return this.activeIndex;
	}

	get count() {
		return this.triggers.length;
	}

	// ================================
	// Destroy
	// ================================

	destroy() {
		this._handlers.triggers.forEach(({ trigger, clickHandler, keydownHandler }) => {
			trigger.removeEventListener('click', clickHandler);
			trigger.removeEventListener('keydown', keydownHandler);
		});
		this._handlers.triggers = [];

		if (this._handlers.listKeydown) {
			this.list.removeEventListener('keydown', this._handlers.listKeydown);
			this._handlers.listKeydown = null;
		}

		if (this._handlers.touchStart) {
			this.element.removeEventListener('touchstart', this._handlers.touchStart);
			this.element.removeEventListener('touchmove', this._handlers.touchMove);
			this.element.removeEventListener('touchend', this._handlers.touchEnd);
		}

		if (this._handlers.hashChange) {
			window.removeEventListener('hashchange', this._handlers.hashChange);
			this._handlers.hashChange = null;
		}

		if (this._handlers.popstate) {
			window.removeEventListener('popstate', this._handlers.popstate);
			this._handlers.popstate = null;
		}

		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}
		if (this._scrollArrowsResizeObserver) {
			this._scrollArrowsResizeObserver.disconnect();
			this._scrollArrowsResizeObserver = null;
		}

		// Scroll arrows cleanup
		if (this._scrollHandler) {
			this.list.removeEventListener('scroll', this._scrollHandler);
			this._scrollHandler = null;
		}
		if (this._scrollEndHandler) {
			this.list.removeEventListener('scrollend', this._scrollEndHandler);
			this._scrollEndHandler = null;
		}
		if (this._navWrapper) {
			// Unwrap: move list back to its original position
			if (this._navWrapper.parentNode && this.list) {
				this._navWrapper.parentNode.insertBefore(this.list, this._navWrapper);
				this._navWrapper.remove();
			}
			this._navWrapper = null;
		}
		if (this._prevBtn) {
			this._prevBtn.remove();
			this._prevBtn = null;
		}
		if (this._nextBtn) {
			this._nextBtn.remove();
			this._nextBtn = null;
		}

		if (this._indicator) {
			this._indicator.remove();
			this._indicator = null;
		}

		removeClass(this.element, `tabs--${this.options.variant}`);
		this.triggers.forEach(({ trigger, panel }) => {
			removeClass(trigger, this.options.openClass, this.options.disabledClass);
			removeClass(panel, this.options.openClass);
			trigger.removeAttribute('role');
			trigger.removeAttribute('aria-selected');
			trigger.removeAttribute('aria-controls');
			trigger.removeAttribute('aria-disabled');
			trigger.removeAttribute('tabindex');
			panel.removeAttribute('role');
			panel.removeAttribute('aria-labelledby');
			panel.removeAttribute('tabindex');
			panel.removeAttribute('hidden');
			panel.removeAttribute('inert');
		});

		this.triggers = [];
		this.panels = [];
		this.activeIndex = -1;
	}
}

// ================================
// Auto-initialization
// ================================

let tabsInstances = [];
let _hashHandlerGlobal = null;

function initTabs(selector = CONFIG.SELECTORS.TABS) {
	const elements = document.querySelectorAll(selector);

	const newInstances = Array.from(elements).map(el => {
		return new Tabs(el, {
			variant: el.dataset.tabsVariant,
			animation: el.dataset.tabsAnimation,
			lazy: el.dataset.tabsLazy !== undefined,
			hash: el.dataset.tabsHash !== undefined,
			history: el.dataset.tabsHistory !== 'false',
			persist: el.dataset.tabsPersist !== undefined,
			autoHeight: el.dataset.tabsAutoHeight !== undefined,
			scrollArrows: el.dataset.tabsScrollArrows !== undefined
		});
	});

	tabsInstances = [...tabsInstances, ...newInstances];

	if (!_hashHandlerGlobal) {
		_hashHandlerGlobal = () => {
			const hash = window.location.hash.replace('#', '');
			tabsInstances.forEach(tabs => {
				if (!tabs.options.hash) return;
				const idx = tabs.triggers.findIndex(tr => tr.targetId === hash);
				if (idx !== -1 && idx !== tabs.activeIndex) {
					tabs.activate(idx, { skipHash: true });
				}
			});
		};
		window.addEventListener('hashchange', _hashHandlerGlobal);
	}

	return newInstances;
}

function getTabs() {
	return tabsInstances;
}

function activateTab(containerId, index) {
	const tabs = tabsInstances.find(t => t.id === containerId || t.element.id === containerId);
	tabs?.activate(index);
	return tabs || null;
}

export { Tabs, tabsInstances };
export { initTabs, getTabs, activateTab };