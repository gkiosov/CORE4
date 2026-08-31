// ==========================================
// Modal Component
// ==========================================
// Accessible modal dialog with focus trap,
// outside-click / Escape close, body scroll lock,
// sibling aria-hidden management, nested z-index
// stacking, history API integration, swipe-to-close
// on mobile, and multiple open triggers:
// click, delay, scroll, exit-intent, beforeunload.
// ==========================================

import { CONFIG, EventManager, generateId, throttle } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass } from '../../utilities/_dom.js';
import { FocusTrap } from '../../utilities/_focus-trap.js';

export class Modal {
	/** Tracks how many modals are currently open (for nested modals). */
	static openCount = 0;

	/**
	 * @param {Element} element   – modal root element
	 * @param {Object} options
	 * @param {string} options.openClass               – CSS class applied when open
	 * @param {boolean} options.closeOnOutsideClick    – close on overlay click
	 * @param {boolean} options.closeOnEscape          – close on Escape key
	 * @param {boolean} options.focusOnOpen            – auto-focus first element
	 * @param {boolean} options.lockBodyScroll         – lock page scroll when open
	 * @param {boolean} options.history                – push/pop history state (default: true)
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.id = element.id || generateId('modal');
		this.options = {
			openClass: options.openClass || CONFIG.STATE.OPEN || 'is-open',
			closeOnOutsideClick: options.closeOnOutsideClick !== false,
			closeOnEscape: options.closeOnEscape !== false,
			focusOnOpen: options.focusOnOpen !== false,
			lockBodyScroll: options.lockBodyScroll !== false,
			history: options.history !== false,
			...options
		};

		this.isOpen = false;
		this.focusTrap = null;
		this.triggerElement = null;
		this.onceShown = false;

		// DOM refs
		this.content = qs('.modal__content', this.element);
		this.closeButtons = qsa('[data-modal-close]', this.element);
		this.overlay = this.element; // .modal itself is the overlay

		// Stacking: remember original inline z-index to restore on close
		this._originalZIndex = null;

		// Touch swipe state
		this._touch = {
			startY: 0,
			startX: 0,
			isTracking: false,
			threshold: 80,
			bodyScrollTop: 0,
			isBody: false
		};

		// Handler registry for clean destroy()
		this._handlers = {
			closeButtons: [],
			overlayClick: null,
			delayTimer: null,
			scrollHandler: null,
			exitIntentHandler: null,
			beforeunloadHandler: null,
			touchStart: null,
			touchMove: null,
			touchEnd: null
		};

		this.init();
	}

	// ================================
	// Initialization
	// ================================

	init() {
		if (!this.element.id) {
			this.element.id = this.id;
		}

		// Accessibility attributes
		if (!this.element.getAttribute('role')) {
			this.element.setAttribute('role', 'dialog');
		}
		if (!this.element.getAttribute('aria-modal')) {
			this.element.setAttribute('aria-modal', 'true');
		}

		// Auto-wire aria-labelledby to title if missing
		const labelledBy = this.element.getAttribute('aria-labelledby');
		if (!labelledBy || !document.getElementById(labelledBy)) {
			const titleEl = qs('.modal__title', this.element);
			if (titleEl) {
				if (!titleEl.id) titleEl.id = `${this.id}-title`;
				this.element.setAttribute('aria-labelledby', titleEl.id);
			}
		}

		this.bindEvents();
		this.focusTrap = new FocusTrap(this.element);
	}

	// ================================
	// Open / Close / Toggle
	// ================================

	/**
	 * Open the modal.
	 * @param {Element|null} triggerElement       – element that triggered open (for focus return)
	 * @param {Object} opts
	 * @param {boolean} opts.skipHistory          – skip pushState (used by popstate forward-nav)
	 * @returns {Modal}
	 */
	open(triggerElement = null, { skipHistory = false } = {}) {
		if (this.isOpen) return this;

		// Respect data-modal-once
		if (this.element.dataset.modalOnce === 'true' && this.onceShown) {
			return this;
		}

		this.triggerElement = triggerElement;
		this.isOpen = true;
		this.onceShown = true;

		// --- Nested z-index stacking ---
		if (Modal.openCount > 0) {
			this._originalZIndex = this.element.style.zIndex;
			const baseZ = 300; // must match tools.z-index('modal')
			this.element.style.zIndex = baseZ + (Modal.openCount * 10);
		}

		Modal.openCount++;

		// Lock body scroll + hide siblings from AT on first open
		if (Modal.openCount === 1) {
			if (this.options.lockBodyScroll) this._lockBodyScroll();
			this._hideSiblings();
		}

		addClass(this.element, this.options.openClass);

		this.focusTrap.updateFocusableElements();
		this.focusTrap.activate();

		if (this.options.focusOnOpen) {
			this.focusTrap.focusFirst();
		}

		// --- History API ---
		if (this.options.history && !skipHistory) {
			this._pushHistory();
		}

		EventManager.dispatch(this.element, 'modal:opened', {
			trigger: triggerElement,
			modal: this
		});

		return this;
	}

	/**
	 * Close the modal and restore focus to the trigger.
	 * @param {Object} opts
	 * @param {boolean} opts.skipHistory          – skip history.back() (used by popstate back-nav)
	 * @returns {Modal}
	 */
	close({ skipHistory = false } = {}) {
		if (!this.isOpen) return this;

		this.isOpen = false;
		Modal.openCount--;

		removeClass(this.element, this.options.openClass);
		this.focusTrap.deactivate();

		// Unlock body scroll when the last modal closes
		if (Modal.openCount <= 0) {
			Modal.openCount = 0;
			if (this.options.lockBodyScroll) this._unlockBodyScroll();
			this._restoreSiblings();
		}

		// Restore original z-index
		if (this._originalZIndex !== null) {
			this.element.style.zIndex = this._originalZIndex;
			this._originalZIndex = null;
		} else if (Modal.openCount === 0) {
			this.element.style.zIndex = '';
		}

		if (this.triggerElement && document.contains(this.triggerElement)) {
			this.triggerElement.focus();
		}

		// --- History API ---
		if (this.options.history && !skipHistory && this._isCurrentHistoryState()) {
			history.back();
		}

		EventManager.dispatch(this.element, 'modal:closed', { modal: this });

		return this;
	}

	toggle(triggerElement = null) {
		return this.isOpen ? this.close() : this.open(triggerElement);
	}

	// ================================
	// Event Binding
	// ================================

	bindEvents() {
		// Close buttons inside modal
		this.closeButtons.forEach((btn) => {
			const handler = () => this.close();
			btn.addEventListener('click', handler);
			this._handlers.closeButtons.push({ btn, handler });
		});

		// Outside click (on overlay, not content)
		if (this.options.closeOnOutsideClick) {
			this._handlers.overlayClick = (e) => {
				if (e.target === this.overlay || e.target === this.element) {
					this.close();
				}
			};
			this.element.addEventListener('click', this._handlers.overlayClick);
		}

		// Escape key
		if (this.options.closeOnEscape) {
			this._handlers.escape = (e) => {
				if (e.key === 'Escape') this.close();
			};
			document.addEventListener('keydown', this._handlers.escape);
		}

		// Touch swipe-down to close (mobile)
		this._handlers.touchStart = (e) => this._onTouchStart(e);
		this._handlers.touchMove = (e) => this._onTouchMove(e);
		this._handlers.touchEnd = () => this._onTouchEnd();

		this.element.addEventListener('touchstart', this._handlers.touchStart, { passive: true });
		this.element.addEventListener('touchmove', this._handlers.touchMove, { passive: true });
		this.element.addEventListener('touchend', this._handlers.touchEnd);
	}

	// ================================
	// Touch Swipe-to-Close (Mobile)
	// ================================

	_onTouchStart(e) {
		if (!this.isOpen) return;
		const touch = e.touches[0];
		this._touch.startY = touch.clientY;
		this._touch.startX = touch.clientX;
		this._touch.isTracking = true;

		// Determine if touch started inside scrollable body
		const body = qs('.modal__body', this.element);
		this._touch.isBody = body ? body.contains(e.target) : false;
		this._touch.bodyScrollTop = body ? body.scrollTop : 0;
	}

	_onTouchMove(e) {
		if (!this._touch.isTracking) return;

		const touch = e.touches[0];
		const deltaY = touch.clientY - this._touch.startY;
		const deltaX = Math.abs(touch.clientX - this._touch.startX);

		// Ignore if horizontal swipe dominates
		if (deltaX > Math.abs(deltaY)) {
			this._touch.isTracking = false;
			return;
		}

		// If body is scrolled down, don't intercept — let user scroll up first
		if (this._touch.isBody && this._touch.bodyScrollTop > 0 && deltaY > 0) {
			this._touch.isTracking = false;
			return;
		}

		// Close if swiped down past threshold
		if (deltaY > this._touch.threshold) {
			this._touch.isTracking = false;
			this.close();
		}
	}

	_onTouchEnd() {
		this._touch.isTracking = false;
	}

	// ================================
	// History API helpers
	// ================================

	_pushHistory() {
		history.pushState({ core4Modal: this.id }, '', '');
	}

	_isCurrentHistoryState() {
		return history.state?.core4Modal === this.id;
	}

	// ================================
	// Trigger: Delay
	// ================================

	/** Schedule auto-open after N ms. */
	scheduleDelay(delayMs) {
		this.cancelDelay();
		this._handlers.delayTimer = setTimeout(() => this.open(), delayMs);
	}

	/** Cancel scheduled delay. */
	cancelDelay() {
		if (this._handlers.delayTimer) {
			clearTimeout(this._handlers.delayTimer);
			this._handlers.delayTimer = null;
		}
	}

	// ================================
	// Trigger: Scroll
	// ================================

	/** Enable scroll-triggered open after N px. */
	enableScrollTrigger(px) {
		const threshold = parseInt(px, 10);
		if (isNaN(threshold)) return;

		this._handlers.scrollHandler = throttle(() => {
			if (window.scrollY >= threshold && !this.isOpen) {
				this.open();
				this.disableScrollTrigger();
			}
		}, 200);

		window.addEventListener('scroll', this._handlers.scrollHandler, { passive: true });
	}

	disableScrollTrigger() {
		if (this._handlers.scrollHandler) {
			window.removeEventListener('scroll', this._handlers.scrollHandler);
			this._handlers.scrollHandler = null;
		}
	}

	// ================================
	// Trigger: Exit Intent
	// ================================

	/** Open when mouse leaves viewport towards top (browser chrome). */
	enableExitIntent() {
		this._handlers.exitIntentHandler = (e) => {
			if (e.clientY < 10 && !this.isOpen) {
				this.open();
				this.disableExitIntent();
			}
		};
		document.addEventListener('mouseleave', this._handlers.exitIntentHandler);
	}

	disableExitIntent() {
		if (this._handlers.exitIntentHandler) {
			document.removeEventListener('mouseleave', this._handlers.exitIntentHandler);
			this._handlers.exitIntentHandler = null;
		}
	}

	// ================================
	// Trigger: Beforeunload
	// ================================

	/** Enable native beforeunload warning. */
	enableBeforeunload() {
		this._handlers.beforeunloadHandler = (e) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', this._handlers.beforeunloadHandler);
	}

	disableBeforeunload() {
		if (this._handlers.beforeunloadHandler) {
			window.removeEventListener('beforeunload', this._handlers.beforeunloadHandler);
			this._handlers.beforeunloadHandler = null;
		}
	}

	// ================================
	// Scroll Lock (no padding needed — scrollbar-gutter: stable handles it)
	// ================================

	_lockBodyScroll() {
		// Fallback: вычисляем ширину только если браузер не поддерживает scrollbar-gutter
		if (CSS.supports && !CSS.supports('scrollbar-gutter', 'stable')) {
			if (Modal._scrollbarWidth === undefined) {
				Modal._scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
				document.documentElement.style.setProperty('--scrollbar-width', `${Modal._scrollbarWidth}px`);
			}
		}

		document.documentElement.classList.add('is-locked');
		document.body.classList.add('is-locked');
	}

	_unlockBodyScroll() {
		document.documentElement.classList.remove('is-locked');
		document.body.classList.remove('is-locked');
	}

	// ================================
	// Sibling ARIA management
	// ================================

	_hideSiblings() {
		const siblings = Array.from(document.body.children).filter(
			el => el !== this.element && !el.contains(this.element)
		);
		siblings.forEach(el => {
			if (!el.hasAttribute('aria-hidden')) {
				el.setAttribute('aria-hidden', 'true');
				el.dataset.modalHidden = '';
			}
		});
	}

	_restoreSiblings() {
		document.querySelectorAll('[data-modal-hidden]').forEach(el => {
			el.removeAttribute('aria-hidden');
			el.removeAttribute('data-modal-hidden');
		});
	}

	// ================================
	// Destroy
	// ================================

	destroy() {
		if (this.isOpen) this.close({ skipHistory: true });

		this.cancelDelay();
		this.disableScrollTrigger();
		this.disableExitIntent();
		this.disableBeforeunload();

		this._handlers.closeButtons.forEach(({ btn, handler }) => {
			btn.removeEventListener('click', handler);
		});
		this._handlers.closeButtons = [];

		if (this._handlers.overlayClick) {
			this.element.removeEventListener('click', this._handlers.overlayClick);
			this._handlers.overlayClick = null;
		}

		// Escape key cleanup
		if (this._handlers.escape) {
			document.removeEventListener('keydown', this._handlers.escape);
			this._handlers.escape = null;
		}

		if (this._handlers.touchStart) {
			this.element.removeEventListener('touchstart', this._handlers.touchStart);
			this.element.removeEventListener('touchmove', this._handlers.touchMove);
			this.element.removeEventListener('touchend', this._handlers.touchEnd);
			this._handlers.touchStart = null;
			this._handlers.touchMove = null;
			this._handlers.touchEnd = null;
		}

		if (this.focusTrap) {
			this.focusTrap.deactivate();
			this.focusTrap = null;
		}
	}
}