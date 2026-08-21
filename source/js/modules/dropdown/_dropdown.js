// ==========================================
// Модуль управления dropdown-меню
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';

export class Dropdown {
	constructor(element, options = {}) {
		this.element = element;
		this.trigger = qs('[data-dropdown-trigger]', element);
		this.menu = qs('[data-dropdown-menu]', element);
		this.items = [];

		this.options = {
			openClass: options.openClass || 'is-open',
			placement: options.placement || element.dataset.dropdownPlacement || 'bottom-start',
			autoFlip: options.autoFlip !== false, // по умолчанию включено
			...options
		};

		this.isOpen = false;
		this.currentPlacement = this.options.placement;
		this._clickOutsideHandler = null;
		this._keydownHandler = null;

		this.init();
	}

	init() {
		if (!this.trigger || !this.menu) return;

		this.items = qsa('button, a[href], [tabindex]:not([tabindex="-1"])', this.menu);

		this.trigger.addEventListener('click', (e) => {
			e.preventDefault();
			this.toggle();
		});

		this.trigger.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.open();
				this._focusFirst();
			}
		});

		this.menu.addEventListener('keydown', (e) => this._handleMenuKeydown(e));

		this.items.forEach((item, index) => {
			item.addEventListener('click', () => {
				EventManager.dispatch(this.element, 'dropdown:select', {
					item,
					index,
					dropdown: this
				});
				this.close();
			});
		});
	}

	open() {
		if (this.isOpen) return;
		this.isOpen = true;

		addClass(this.element, this.options.openClass);
		this.trigger.setAttribute('aria-expanded', 'true');

		// Авто-позиционирование
		this._position();

		// Закрытие по клику вне
		this._clickOutsideHandler = (e) => {
			if (!this.element.contains(e.target)) {
				this.close();
			}
		};
		document.addEventListener('click', this._clickOutsideHandler);

		// Закрытие по Escape
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

	toggle() {
		this.isOpen ? this.close() : this.open();
	}

	// ================================
	// Позиционирование с авто-flip
	// ================================

	_position() {
		// Сначала применяем заданный placement
		this._applyPlacementClass(this.options.placement);

		if (!this.options.autoFlip) return;

		// Проверяем, влезает ли меню
		const best = this._getBestPlacement();
		if (best !== this.currentPlacement) {
			this._applyPlacementClass(best);
		}
	}

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

	_getBestPlacement() {
		const triggerRect = this.trigger.getBoundingClientRect();
		const menuRect = this.menu.getBoundingClientRect();
		const viewportW = window.innerWidth;
		const viewportH = window.innerHeight;

		const padding = 8; // минимальный отступ от края viewport

		// Проверяем, влезает ли текущий placement
		if (this._fits(this.currentPlacement, triggerRect, menuRect, viewportW, viewportH, padding)) {
			return this.currentPlacement;
		}

		// Пробуем flipped-варианты
		const flips = this._getFlipMap();
		const alternatives = flips[this.options.placement] || [this.options.placement];

		for (const placement of alternatives) {
			if (this._fits(placement, triggerRect, menuRect, viewportW, viewportH, padding)) {
				return placement;
			}
		}

		// Если ничего не подошло — возвращаем исходный (лучшее из худшего)
		return this.options.placement;
	}

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
	// Клавиатура
	// ================================

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

	_focusFirst() {
		this.items[0]?.focus();
	}

	destroy() {
		this.close();
	}
}

export function initDropdowns(selector = '[data-dropdown]') {
	const elements = document.querySelectorAll(selector);
	return Array.from(elements).map(el => new Dropdown(el));
}