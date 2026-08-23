// ==========================================
// Dropdown Component
// ==========================================
// Accessible dropdown with ARIA roles, keyboard navigation,
// auto-flip positioning, and click-outside / Escape close.
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';

export class Dropdown {
	/**
	 * @param {Element} element
	 * @param {Object} options
	 * @param {string} options.openClass    – CSS class applied when open
	 * @param {string} options.placement    – initial placement: bottom-start | bottom-end | top-start | top-end | left | right
	 * @param {boolean} options.autoFlip    – automatically flip if viewport edge is reached (default: true)
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.trigger = qs('[data-dropdown-trigger]', element);
		this.menu = qs('[data-dropdown-menu]', element);
		this.items = [];

		this.options = {
			openClass: options.openClass || 'is-open',
			placement: options.placement || element.dataset.dropdownPlacement || 'bottom-start',
			autoFlip: options.autoFlip !== false,
			...options
		};

		this.isOpen = false;
		this.currentPlacement = this.options.placement;
		this._clickOutsideHandler = null;
		this._keydownHandler = null;
		this._triggerClickHandler = null;
		this._triggerKeydownHandler = null;
		this._menuKeydownHandler = null;
		this._itemClickHandlers = [];

		this.init();
	}

	init() {
		if (!this.trigger || !this.menu) return;

		// Ensure menu has an id for aria-controls
		if (!this.menu.id) {
			this.menu.id = `dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;
		}

		// ARIA attributes on trigger
		this.trigger.setAttribute('aria-haspopup', 'true');
		this.trigger.setAttribute('aria-expanded', 'false');
		this.trigger.setAttribute('aria-controls', this.menu.id);

		// ARIA attributes on menu
		this.menu.setAttribute('role', 'menu');

		this.items = qsa('button, a[href], [tabindex]:not([tabindex="-1"])', this.menu);

		// ARIA attributes on menu items
		this.items.forEach(item => {
			item.setAttribute('role', 'menuitem');
		});

		// Mark dividers as separators
		const dividers = qsa('.dropdown__item--divider', this.menu);
		dividers.forEach(divider => {
			divider.setAttribute('role', 'separator');
			divider.removeAttribute('role', 'menuitem');
		});

		// Trigger click
		this._triggerClickHandler = (e) => {
			e.preventDefault();
			this.toggle();
		};
		this.trigger.addEventListener('click', this._triggerClickHandler);

		// Trigger keyboard
		this._triggerKeydownHandler = (e) => {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.open();
				this._focusFirst();
			}
		};
		this.trigger.addEventListener('keydown', this._triggerKeydownHandler);

		// Menu keyboard navigation
		this._menuKeydownHandler = (e) => this._handleMenuKeydown(e);
		this.menu.addEventListener('keydown', this._menuKeydownHandler);

		// Item click handlers
		this.items.forEach((item, index) => {
			const handler = () => {
				EventManager.dispatch(this.element, 'dropdown:select', {
					item,
					index,
					dropdown: this
				});
				this.close();
			};
			item.addEventListener('click', handler);
			this._itemClickHandlers.push({ item, handler });
		});
	}

	/** Open the dropdown menu. */
	open() {
		if (this.isOpen) return;
		this.isOpen = true;

		addClass(this.element, this.options.openClass);
		this.trigger.setAttribute('aria-expanded', 'true');

		// Auto-positioning
		this._position();

		// Close on click outside
		this._clickOutsideHandler = (e) => {
			if (!this.element.contains(e.target)) {
				this.close();
			}
		};
		document.addEventListener('click', this._clickOutsideHandler);

		// Close on Escape
		this._keydownHandler = (e) => {
			if (Keyboard.isEscape(e)) {
				e.preventDefault();
				this.close();
				this.trigger.focus();
			}
		};
		document.addEventListener('keydown', this._keydownHandler);

		EventManager.dispatch(this.element, 'dropdown:opened', { dropdown: this });
	}

	/** Close the dropdown menu. */
	close() {
		if (!this.isOpen) return;
		this.isOpen = false;

		removeClass(this.element, this.options.openClass);
		this.trigger.setAttribute('aria-expanded', 'false');

		if (this._clickOutsideHandler) {
			document.removeEventListener('click', this._clickOutsideHandler);
			this._clickOutsideHandler = null;
		}
		if (this._keydownHandler) {
			document.removeEventListener('keydown', this._keydownHandler);
			this._keydownHandler = null;
		}

		EventManager.dispatch(this.element, 'dropdown:closed', { dropdown: this });
	}

	/** Toggle open/close state. */
	toggle() {
		this.isOpen ? this.close() : this.open();
	}

	// ================================
	// Positioning with auto-flip
	// ================================

	/**
	 * Apply placement class and auto-flip if needed.
	 * @private
	 */
	_position() {
		this._applyPlacementClass(this.options.placement);

		if (!this.options.autoFlip) return;

		const best = this._getBestPlacement();
		if (best !== this.currentPlacement) {
			this._applyPlacementClass(best);
		}
	}

	/**
	 * @param {string} placement
	 * @private
	 */
	_applyPlacementClass(placement) {
		const placements = [
			'dropdown__menu--top-start',
			'dropdown__menu--top-end',
			'dropdown__menu--bottom-start',
			'dropdown__menu--bottom-end',
			'dropdown__menu--left',
			'dropdown__menu--right'
		];
		placements.forEach(cls => this.menu.classList.remove(cls));

		const cls = `dropdown__menu--${placement}`;
		if (placements.includes(cls)) {
			this.menu.classList.add(cls);
		}
		this.currentPlacement = placement;
	}

	/**
	 * Find the first placement that fits inside the viewport.
	 * @returns {string}
	 * @private
	 */
	_getBestPlacement() {
		const triggerRect = this.trigger.getBoundingClientRect();
		const menuRect = this.menu.getBoundingClientRect();
		const viewportW = window.innerWidth;
		const viewportH = window.innerHeight;

		const padding = 8; // minimum viewport padding

		if (this._fits(this.currentPlacement, triggerRect, menuRect, viewportW, viewportH, padding)) {
			return this.currentPlacement;
		}

		const flips = this._getFlipMap();
		const alternatives = flips[this.options.placement] || [this.options.placement];

		for (const placement of alternatives) {
			if (this._fits(placement, triggerRect, menuRect, viewportW, viewportH, padding)) {
				return placement;
			}
		}

		return this.options.placement;
	}

	/**
	 * Check whether a placement fits within the viewport.
	 * @returns {boolean}
	 * @private
	 */
	_fits(placement, triggerRect, menuRect, vw, vh, pad) {
		const menuW = menuRect.width || 200;
		const menuH = menuRect.height || 150;

		switch (placement) {
			case 'bottom-start':
				return triggerRect.bottom + menuH + pad <= vh && triggerRect.left + menuW + pad <= vw;
			case 'bottom-end':
				return triggerRect.bottom + menuH + pad <= vh && triggerRect.right - menuW >= pad;
			case 'top-start':
				return triggerRect.top - menuH >= pad && triggerRect.left + menuW + pad <= vw;
			case 'top-end':
				return triggerRect.top - menuH >= pad && triggerRect.right - menuW >= pad;
			case 'left':
				return triggerRect.left - menuW >= pad && triggerRect.top + menuH + pad <= vh;
			case 'right':
				return triggerRect.right + menuW + pad <= vw && triggerRect.top + menuH + pad <= vh;
			default:
				return true;
		}
	}

	/**
	 * Map of preferred fallback placements for each base placement.
	 * @returns {Object}
	 * @private
	 */
	_getFlipMap() {
		return {
			'bottom-start': ['bottom-start', 'top-start', 'bottom-end', 'top-end'],
			'bottom-end': ['bottom-end', 'top-end', 'bottom-start', 'top-start'],
			'top-start': ['top-start', 'bottom-start', 'top-end', 'bottom-end'],
			'top-end': ['top-end', 'bottom-end', 'top-start', 'bottom-start'],
			'left': ['left', 'right'],
			'right': ['right', 'left']
		};
	}

	// ================================
	// Keyboard
	// ================================

	/**
	 * Handle ArrowDown, ArrowUp, Home, End inside the menu.
	 * @param {KeyboardEvent} e
	 * @private
	 */
	_handleMenuKeydown(e) {
		const items = this.items;
		const currentIndex = items.indexOf(document.activeElement);

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = items[currentIndex + 1] || items[0];
			next?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const prev = items[currentIndex - 1] || items[items.length - 1];
			prev?.focus();
		} else if (e.key === 'Home') {
			e.preventDefault();
			items[0]?.focus();
		} else if (e.key === 'End') {
			e.preventDefault();
			items[items.length - 1]?.focus();
		}
	}

	/** Focus the first menu item. */
	_focusFirst() {
		this.items[0]?.focus();
	}

	/** Remove all listeners and close. */
	destroy() {
		this.close();

		if (this._triggerClickHandler) {
			this.trigger.removeEventListener('click', this._triggerClickHandler);
			this._triggerClickHandler = null;
		}
		if (this._triggerKeydownHandler) {
			this.trigger.removeEventListener('keydown', this._triggerKeydownHandler);
			this._triggerKeydownHandler = null;
		}

		if (this._menuKeydownHandler) {
			this.menu.removeEventListener('keydown', this._menuKeydownHandler);
			this._menuKeydownHandler = null;
		}

		this._itemClickHandlers.forEach(({ item, handler }) => {
			item.removeEventListener('click', handler);
		});
		this._itemClickHandlers = [];
	}
}

/**
 * Initialize all dropdowns matching the selector.
 * @param {string} selector  – CSS selector (default: '[data-dropdown]')
 * @returns {Dropdown[]}
 */
export function initDropdowns(selector = '[data-dropdown]') {
	const elements = document.querySelectorAll(selector);
	return Array.from(elements).map(el => new Dropdown(el));
}
