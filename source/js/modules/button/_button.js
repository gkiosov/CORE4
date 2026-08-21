// ==========================================
// Модуль управления кнопками
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, addClass, removeClass } from '../../utilities/_dom.js';

export class Button {
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

		this.init();
	}

	init() {
		// Если это toggle-кнопка — проверяем начальное состояние
		if (this.type === 'toggle') {
			this.isToggled = this.element.classList.contains(this.options.toggleClass);
			this.element.setAttribute('aria-pressed', String(this.isToggled));
		}

		this.element.addEventListener('click', (e) => this.handleClick(e));
	}

	handleClick(e) {
		// Если кнопка в состоянии загрузки — блокируем
		if (this.isProcessing) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		// Async-кнопка: блокируем нативное поведение
		if (this.type === 'async') {
			e.preventDefault();
			this.setLoading();
			EventManager.dispatch(this.element, 'button:click', {
				button: this,
				originalEvent: e
			});
			return;
		}

		// Toggle-кнопка
		if (this.type === 'toggle') {
			e.preventDefault();
			this.toggle();
			return;
		}

		// Обычная кнопка: просто диспатчим событие
		EventManager.dispatch(this.element, 'button:click', {
			button: this,
			originalEvent: e
		});
	}

	// ================================
	// Async-состояния
	// ================================

	setLoading() {
		this.isProcessing = true;
		addClass(this.element, this.options.loadingClass);
		this.element.setAttribute('aria-busy', 'true');
		this.element.disabled = true;

		if (this.options.loadingText) {
			this.element.textContent = this.options.loadingText;
		}
	}

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

	reset() {
		clearTimeout(this._resetTimer);
		this.isProcessing = false;
		removeClass(this.element, this.options.loadingClass, this.options.successClass, this.options.errorClass);
		this.element.removeAttribute('aria-busy');
		this.element.disabled = false;
		this.element.textContent = this.originalText;
	}

	scheduleReset() {
		clearTimeout(this._resetTimer);
		this._resetTimer = setTimeout(() => this.reset(), this.options.resetDelay);
	}

	// ================================
	// Toggle
	// ================================

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
	// Утилиты
	// ================================

	setText(text) {
		this.element.textContent = text;
	}

	setHTML(html) {
		this.element.innerHTML = html;
	}

	destroy() {
		clearTimeout(this._resetTimer);
		// Отписка от событий не нужна — элемент удаляется или переинициализируется
	}
}