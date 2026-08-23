// ==========================================
// Modal Component
// ==========================================
// Accessible modal dialog with focus trap,
// outside-click / Escape close, body scroll lock,
// and sibling aria-hidden management.
// ==========================================

import { CONFIG, EventManager, generateId } from '../../core/_index.js';
import { qs, addClass, removeClass } from '../../utilities/_dom.js';
import { FocusTrap } from '../../utilities/_focus-trap.js';

export class Modal {
	/** Tracks how many modals are currently open (for nested modals). */
	static openCount = 0;

	/**
	 * @param {Element} element   – modal root element
	 * @param {Object} options
	 * @param {string} options.openClass		   – CSS class applied when open
	 * @param {boolean} options.closeOnOutsideClick – close on overlay click
	 * @param {boolean} options.closeOnEscape	   – close on Escape key
	 * @param {boolean} options.focusOnOpen		 – auto-focus first element
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.id = element.id || generateId('modal');
		this.options = {
			openClass: options.openClass || CONFIG.STATE.OPEN || 'is-open',
			closeOnOutsideClick: options.closeOnOutsideClick !== false,
			closeOnEscape: options.closeOnEscape !== false,
			focusOnOpen: options.focusOnOpen !== false,
			...options
		};

		this.isOpen = false;
		this.focusTrap = null;
		this.triggerElement = null;
		this.closeButton = qs('[data-modal-close]', this.element);
		this.overlay = qs('[data-modal-overlay]', this.element) || this.element.parentElement;

		this.init();
	}

	init() {
		if (!this.element.id) {
			this.element.id = this.id;
		}
		this.bindEvents();
		this.focusTrap = new FocusTrap(this.element);
	}

	/**
	 * Open the modal.
	 * @param {Element|null} triggerElement  – element that triggered open (for focus return)
	 * @returns {Modal}
	 */
	open(triggerElement = null) {
		if (this.isOpen) return;

		this.triggerElement = triggerElement;
		this.isOpen = true;
		Modal.openCount++;

		// Lock body scroll on first open; hide siblings from AT
		if (Modal.openCount === 1) {
			document.body.style.overflow = 'hidden';
			this._hideSiblings();
		}

		addClass(this.element, this.options.openClass);

		this.focusTrap.updateFocusableElements();
		this.focusTrap.activate();

		if (this.options.focusOnOpen) {
			this.focusTrap.focusFirst();
		}

		EventManager.dispatch(this.element, 'modal:opened', { trigger: triggerElement });

		return this;
	}

	/**
	 * Close the modal and restore focus to the trigger.
	 * @returns {Modal}
	 */
	close() {
		if (!this.isOpen) return;

		this.isOpen = false;
		Modal.openCount--;

		removeClass(this.element, this.options.openClass);
		this.focusTrap.deactivate();

		// Unlock body scroll when the last modal closes
		if (Modal.openCount <= 0) {
			Modal.openCount = 0;
			document.body.style.overflow = '';
			this._restoreSiblings();
		}

		if (this.triggerElement) {
			this.triggerElement.focus();
		}

		EventManager.dispatch(this.element, 'modal:closed');

		return this;
	}

	/**
	 * Toggle open/close state.
	 * @param {Element|null} triggerElement
	 * @returns {Modal}
	 */
	toggle(triggerElement = null) {
		return this.isOpen ? this.close() : this.open(triggerElement);
	}

	bindEvents() {
		if (this.closeButton) {
			this.closeButton.addEventListener('click', () => this.close());
		}

		if (this.options.closeOnOutsideClick && this.overlay) {
			this.overlay.addEventListener('click', (e) => {
				if (e.target === this.overlay || e.target === this.element) {
					this.close();
				}
			});
		}
	}

	/**
	 * Hide all body siblings from assistive technologies while modal is open.
	 * @private
	 */
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

	/**
	 * Restore aria-hidden state to siblings closed by this modal.
	 * @private
	 */
	_restoreSiblings() {
		document.querySelectorAll('[data-modal-hidden]').forEach(el => {
			el.removeAttribute('aria-hidden');
			el.removeAttribute('data-modal-hidden');
		});
	}

	destroy() {
		if (this.isOpen) {
			this.close();
		}
		// TODO: unsubscribe closeButton/overlay listeners
	}
}
