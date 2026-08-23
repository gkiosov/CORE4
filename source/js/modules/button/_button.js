// ==========================================
// Button Component
// ==========================================
// Enhanced button with async states (loading, success, error),
// toggle mode, automatic reset timer, and custom event dispatch.
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, addClass, removeClass } from '../../utilities/_dom.js';

export class Button {
	/**
	 * @param {Element} element                  – the <button> or [data-button] element
	 * @param {Object} options
	 * @param {string} options.loadingClass      – CSS class for loading state
	 * @param {string} options.successClass      – CSS class for success state
	 * @param {string} options.errorClass        – CSS class for error state
	 * @param {string|null} options.loadingText  – text shown while loading
	 * @param {string|null} options.successText  – text shown on success
	 * @param {string|null} options.errorText    – text shown on error
	 * @param {number} options.resetDelay        – ms before auto-reset (default: 2000)
	 * @param {string} options.toggleClass       – CSS class for active toggle state
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.originalText = element.textContent.trim();
		this.originalHTML = element.innerHTML;

		this.options = {
			loadingClass: options.loadingClass || 'is-loading',
			successClass: options.successClass || 'is-success',
			errorClass: options.errorClass || 'is-error',
			loadingText: options.loadingText || element.dataset.loadingText || null,
			successText: options.successText || element.dataset.successText || null,
			errorText: options.errorText || element.dataset.errorText || null,
			resetDelay: options.resetDelay || Number(element.dataset.resetDelay) || 2000,
			toggleClass: options.toggleClass || 'is-active',
			...options
		};

		this.isProcessing = false;
		this.isToggled = false;
		this.type = element.dataset.button || 'default';

		this._resetTimer = null;
		this.init();
	}

	init() {
		// If toggle button — sync initial state from existing class
		if (this.type === 'toggle') {
			this.isToggled = this.element.classList.contains(this.options.toggleClass);
			this.element.setAttribute('aria-pressed', String(this.isToggled));
		}

		this.element.addEventListener('click', (e) => this.handleClick(e));
	}

	/**
	 * Route click based on button type.
	 * @param {MouseEvent} e
	 */
	handleClick(e) {
		// Block interaction while loading
		if (this.isProcessing) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		// Async button: suppress native behavior, enter loading state
		if (this.type === 'async') {
			e.preventDefault();
			this.setLoading();
			EventManager.dispatch(this.element, 'button:click', {
				button: this,
				originalEvent: e
			});
			return;
		}

		// Toggle button
		if (this.type === 'toggle') {
			e.preventDefault();
			this.toggle();
			return;
		}

		// Default button: just dispatch the event
		EventManager.dispatch(this.element, 'button:click', {
			button: this,
			originalEvent: e
		});
	}

	// ================================
	// Async states
	// ================================

	/** Enter loading state: add class, disable, optionally change text. */
	setLoading() {
		this.isProcessing = true;
		addClass(this.element, this.options.loadingClass);
		this.element.setAttribute('aria-busy', 'true');
		this.element.disabled = true;

		if (this.options.loadingText) {
			this.element.textContent = this.options.loadingText;
		}
	}

	/**
	 * Enter success state.
	 * @param {string|null} text  – override text
	 */
	setSuccess(text = null) {
		if (!this.isProcessing) return;

		removeClass(this.element, this.options.loadingClass);
		addClass(this.element, this.options.successClass);

		if (text || this.options.successText) {
			this.element.textContent = text || this.options.successText;
		}

		EventManager.dispatch(this.element, 'button:success', { button: this });
		this.scheduleReset();
	}

	/**
	 * Enter error state.
	 * @param {string|null} text  – override text
	 */
	setError(text = null) {
		if (!this.isProcessing) return;

		removeClass(this.element, this.options.loadingClass);
		addClass(this.element, this.options.errorClass);

		if (text || this.options.errorText) {
			this.element.textContent = text || this.options.errorText;
		}

		EventManager.dispatch(this.element, 'button:error', { button: this });
		this.scheduleReset();
	}

	/** Reset to original state: clear classes, text, and timer. */
	reset() {
		clearTimeout(this._resetTimer);
		this.isProcessing = false;
		removeClass(this.element, this.options.loadingClass, this.options.successClass, this.options.errorClass);
		this.element.removeAttribute('aria-busy');
		this.element.disabled = false;
		this.element.textContent = this.originalText;
	}

	/** Schedule auto-reset after resetDelay. */
	scheduleReset() {
		clearTimeout(this._resetTimer);
		this._resetTimer = setTimeout(() => this.reset(), this.options.resetDelay);
	}

	// ================================
	// Toggle
	// ================================

	/**
	 * Toggle pressed state.
	 * @param {boolean|null} forceState  – force specific state
	 */
	toggle(forceState = null) {
		this.isToggled = forceState !== null ? forceState : !this.isToggled;

		this.element.classList.toggle(this.options.toggleClass, this.isToggled);
		this.element.setAttribute('aria-pressed', String(this.isToggled));

		EventManager.dispatch(this.element, 'button:toggle', {
			button: this,
			active: this.isToggled
		});
	}

	// ================================
	// Utilities
	// ================================

	/** Set plain text content. */
	setText(text) {
		this.element.textContent = text;
	}

	/** Set HTML content. */
	setHTML(html) {
		this.element.innerHTML = html;
	}

	destroy() {
		clearTimeout(this._resetTimer);
		// Listener removal is unnecessary — element is either removed or re-initialized
	}
}
