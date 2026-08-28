// ==========================================
// Wizard Component
// ==========================================
// Multi-step form with step validation,
// navigation, and a stepper indicator.
// Integrates with the Form validation engine.
// ==========================================

import { qs, qsa, addClass, removeClass, toggleClass, createElement } from '../../utilities/_dom.js';
import { EventManager } from '../../core/_index.js';

export class Wizard {
	/**
	 * @param {HTMLElement} element  – container with data-wizard
	 * @param {Object} options
	 * @param {string}  options.stepSelector      – selector for steps (default: '[data-wizard-step]')
	 * @param {string}  options.navSelector       – selector for nav container (default: '[data-wizard-nav]')
	 * @param {string}  options.stepperSelector   – selector for stepper indicator (default: '[data-wizard-stepper]')
	 * @param {string}  options.prevSelector      – selector for prev button (default: '[data-wizard-prev]')
	 * @param {string}  options.nextSelector      – selector for next button (default: '[data-wizard-next]')
	 * @param {string}  options.submitSelector    – selector for submit button (default: '[data-wizard-submit]')
	 * @param {boolean} options.validateStep      – validate current step before advancing (default: true)
	 * @param {boolean} options.linear            – force linear progression (default: true)
	 * @param {string}  options.activeClass       – CSS class for active step (default: 'is-active')
	 * @param {string}  options.completedClass    – CSS class for completed step (default: 'is-completed')
	 * @param {string}  options.errorClass        – CSS class for invalid step (default: 'is-invalid')
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			stepSelector: options.stepSelector || '[data-wizard-step]',
			navSelector: options.navSelector || '[data-wizard-nav]',
			stepperSelector: options.stepperSelector || '[data-wizard-stepper]',
			prevSelector: options.prevSelector || '[data-wizard-prev]',
			nextSelector: options.nextSelector || '[data-wizard-next]',
			submitSelector: options.submitSelector || '[data-wizard-submit]',
			validateStep: options.validateStep !== false,
			linear: options.linear !== false,
			activeClass: options.activeClass || 'is-active',
			completedClass: options.completedClass || 'is-completed',
			errorClass: options.errorClass || 'is-invalid',
			...options
		};

		/** @type {HTMLElement[]} */
		this.steps = [];

		/** @type {number} */
		this.currentStep = 0;

		/** @type {Form|null} */
		this.formInstance = null;

		this._handlers = [];

		this.init();
	}

	init() {
		this.steps = Array.from(qsa(this.options.stepSelector, this.element));
		if (this.steps.length === 0) return;

		this._initStepper();
		this._bindNav();
		this._showStep(0);

		EventManager.dispatch(this.element, 'wizard:initialized', { wizard: this });
	}

	/**
	 * Link this wizard to a Form instance for step validation.
	 * @param {Form} formInstance
	 */
	attachForm(formInstance) {
		this.formInstance = formInstance;
	}

	// ================================
	// Stepper
	// ================================

	_initStepper() {
		let stepper = qs(this.options.stepperSelector, this.element);
		if (!stepper) {
			stepper = createElement('div', 'wizard__stepper');
			this.element.insertBefore(stepper, this.element.firstChild);
		}
		this._stepper = stepper;
		this._renderStepper();
	}

	_renderStepper() {
		if (!this._stepper) return;
		this._stepper.innerHTML = '';

		this.steps.forEach((step, index) => {
			const label = step.dataset.wizardLabel || `Step ${index + 1}`;
			const item = createElement('button', 'wizard__stepper__item', {
				type: 'button',
				'data-step': String(index)
			});

			const badge = createElement('span', 'wizard__stepper__badge');
			badge.textContent = String(index + 1);
			item.appendChild(badge);

			const title = createElement('span', 'wizard__stepper__title');
			title.textContent = label;
			item.appendChild(title);

			item.addEventListener('click', () => this.goToStep(index));

			this._stepper.appendChild(item);
		});

		this._updateStepper();
	}

	_updateStepper() {
		if (!this._stepper) return;

		const items = qsa('.wizard__stepper__item', this._stepper);
		items.forEach((item, index) => {
			removeClass(item, this.options.activeClass, this.options.completedClass, this.options.errorClass);

			if (index === this.currentStep) {
				addClass(item, this.options.activeClass);
			} else if (index < this.currentStep) {
				addClass(item, this.options.completedClass);
			}
		});
	}

	// ================================
	// Navigation
	// ================================

	_bindNav() {
		const prevBtn = qs(this.options.prevSelector, this.element);
		const nextBtn = qs(this.options.nextSelector, this.element);

		if (prevBtn) {
			const handler = () => this.prev();
			prevBtn.addEventListener('click', handler);
			this._handlers.push({ element: prevBtn, type: 'click', handler });
		}

		if (nextBtn) {
			const handler = () => this.next();
			nextBtn.addEventListener('click', handler);
			this._handlers.push({ element: nextBtn, type: 'click', handler });
		}
	}

	// ================================
	// Step Control
	// ================================

	/**
	 * Show a specific step by index.
	 * @param {number} index
	 */
	_showStep(index) {
		this.steps.forEach((step, i) => {
			toggleClass(step, this.options.activeClass, i === index);
			step.setAttribute('aria-hidden', String(i !== index));
		});

		this.currentStep = index;
		this._updateNav();
		this._updateStepper();

		EventManager.dispatch(this.element, 'wizard:stepChange', {
			wizard: this,
			step: index,
			stepElement: this.steps[index]
		});
	}

	_updateNav() {
		const prevBtn = qs(this.options.prevSelector, this.element);
		const nextBtn = qs(this.options.nextSelector, this.element);
		const submitBtn = qs(this.options.submitSelector, this.element);

		if (prevBtn) {
			prevBtn.disabled = this.currentStep === 0;
			toggleClass(prevBtn, 'is-hidden', this.currentStep === 0);
		}

		const isLast = this.currentStep === this.steps.length - 1;
		if (nextBtn) {
			toggleClass(nextBtn, 'is-hidden', isLast);
		}
		if (submitBtn) {
			toggleClass(submitBtn, 'is-hidden', !isLast);
		}
	}

	/**
	 * Validate fields in the current step.
	 * @returns {boolean}
	 */
	async _validateCurrentStep() {
		if (!this.formInstance || !this.options.validateStep) return true;

		const currentStepEl = this.steps[this.currentStep];
		const stepFields = Array.from(currentStepEl.querySelectorAll('input, select, textarea'));

		let allValid = true;
		for (const field of stepFields) {
			if (field.disabled) continue;
			const valid = await this.formInstance.validateField(field);
			if (!valid) allValid = false;
		}

		// Validate groups within the step
		const stepGroups = Array.from(currentStepEl.querySelectorAll('[data-validate-group], [data-validate-group-min], [data-validate-group-max]'));
		for (const group of stepGroups) {
			const valid = this.formInstance.validateGroup(group);
			if (!valid) allValid = false;
		}

		if (!allValid) {
			const firstInvalid = stepFields.find(f => {
				const g = f.closest('.form__group');
				return g && g.classList.contains(this.options.errorClass);
			});
			firstInvalid?.focus();
		}

		return allValid;
	}

	// ================================
	// Public API
	// ================================

	async next() {
		if (this.currentStep >= this.steps.length - 1) return;

		const isValid = await this._validateCurrentStep();
		if (!isValid) {
			EventManager.dispatch(this.element, 'wizard:stepInvalid', {
				wizard: this,
				step: this.currentStep
			});
			return;
		}

		// Mark current step as completed
		addClass(this.steps[this.currentStep], this.options.completedClass);

		this._showStep(this.currentStep + 1);
	}

	prev() {
		if (this.currentStep <= 0) return;
		this._showStep(this.currentStep - 1);
	}

	async goToStep(index) {
		if (index < 0 || index >= this.steps.length) return;
		if (index === this.currentStep) return;

		// In linear mode, can only go to completed steps or the next one
		if (this.options.linear && index > this.currentStep + 1) return;
		if (this.options.linear && index > this.currentStep) {
			// Validate current step before jumping forward
			const isValid = await this._validateCurrentStep();
			if (!isValid) return;
			addClass(this.steps[this.currentStep], this.options.completedClass);
		}

		this._showStep(index);
	}

	getCurrentStep() {
		return this.currentStep;
	}

	getTotalSteps() {
		return this.steps.length;
	}

	destroy() {
		this._handlers.forEach(({ element, type, handler }) => {
			element.removeEventListener(type, handler);
		});
		this._handlers = [];
	}
}