// ==========================================
// Password Strength Component
// ==========================================
// Real-time password strength estimation
// with visual indicator and configurable rules.
// No external dependencies — pure JS implementation
// inspired by zxcvbn heuristics.
// ==========================================

import { qs, addClass, removeClass, toggleClass, createElement } from '../../utilities/_dom.js';
import { EventManager } from '../../core/_index.js';

/** Common weak patterns to penalize. */
const WEAK_PATTERNS = [
	'123', 'abc', 'qwerty', 'password', 'admin', 'letmein',
	'welcome', 'monkey', 'dragon', 'master', 'login', 'user'
];

/** Character class definitions. */
const CHAR_CLASSES = {
	lower: /[a-z]/,
	upper: /[A-Z]/,
	digit: /\d/,
	special: /[^a-zA-Z0-9]/
};

export class PasswordStrength {
	/**
	 * @param {HTMLInputElement} field  – the password input
	 * @param {Object} options
	 * @param {number}  options.minLength     – minimum length (default: 8)
	 * @param {boolean} options.requireUpper  – require uppercase (default: true)
	 * @param {boolean} options.requireLower  – require lowercase (default: true)
	 * @param {boolean} options.requireDigit  – require digit (default: true)
	 * @param {boolean} options.requireSpecial – require special char (default: false)
	 * @param {boolean} options.showIndicator – show visual bar (default: true)
	 * @param {string}  options.indicatorSelector – custom indicator container
	 */
	constructor(field, options = {}) {
		this.field = field;
		this.options = {
			minLength: parseInt(field.dataset.strengthMinlength, 10) || options.minLength || 8,
			requireUpper: field.dataset.strengthUpper !== undefined || options.requireUpper !== false,
			requireLower: field.dataset.strengthLower !== undefined || options.requireLower !== false,
			requireDigit: field.dataset.strengthDigit !== undefined || options.requireDigit !== false,
			requireSpecial: field.dataset.strengthSpecial !== undefined || options.requireSpecial || false,
			showIndicator: options.showIndicator !== false,
			indicatorSelector: options.indicatorSelector || null,
			...options
		};

		this._onInput = this._handleInput.bind(this);
		field.addEventListener('input', this._onInput);

		if (this.options.showIndicator) {
			this._initIndicator();
		}

		// Initial check
		this._handleInput();
	}

	// ================================
	// Indicator
	// ================================

	_initIndicator() {
		const group = this.field.closest('.form__group');
		if (!group) return;

		let container = this.options.indicatorSelector
			? qs(this.options.indicatorSelector, group)
			: qs('.form__password-strength', group);

		if (!container) {
			container = createElement('div', 'form__password-strength');
			container.innerHTML = `
        <div class="form__password-strength__track">
          <div class="form__password-strength__bar"></div>
        </div>
        <span class="form__password-strength__text"></span>
        <ul class="form__password-strength__rules"></ul>
      `;
			group.appendChild(container);
		}

		this._container = container;
		this._bar = qs('.form__password-strength__bar', container);
		this._text = qs('.form__password-strength__text', container);
		this._rules = qs('.form__password-strength__rules', container);

		this._renderRules();
	}

	_renderRules() {
		if (!this._rules) return;

		const rules = [];
		if (this.options.minLength > 0) {
			rules.push({ key: 'length', label: `At least ${this.options.minLength} characters` });
		}
		if (this.options.requireLower) {
			rules.push({ key: 'lower', label: 'One lowercase letter' });
		}
		if (this.options.requireUpper) {
			rules.push({ key: 'upper', label: 'One uppercase letter' });
		}
		if (this.options.requireDigit) {
			rules.push({ key: 'digit', label: 'One number' });
		}
		if (this.options.requireSpecial) {
			rules.push({ key: 'special', label: 'One special character' });
		}

		this._rules.innerHTML = rules.map(r =>
			`<li class="form__password-strength__rule" data-rule="${r.key}">${r.label}</li>`
		).join('');
	}

	// ================================
	// Scoring
	// ================================

	/**
	 * Calculate password strength score (0–4).
	 * @param {string} value
	 * @returns {{score: number, feedback: string[], rules: Object}}
	 */
	calculate(value) {
		const rules = {
			length: value.length >= this.options.minLength,
			lower: CHAR_CLASSES.lower.test(value),
			upper: CHAR_CLASSES.upper.test(value),
			digit: CHAR_CLASSES.digit.test(value),
			special: CHAR_CLASSES.special.test(value)
		};

		let score = 0;
		const feedback = [];

		// Base score from length
		if (value.length === 0) {
			score = 0;
		} else if (value.length < this.options.minLength) {
			score = 0;
			feedback.push(`Use at least ${this.options.minLength} characters`);
		} else {
			score = 1;
		}

		// Character variety bonus
		const varietyCount = Object.values(rules).filter(Boolean).length;
		if (varietyCount >= 3) score = Math.max(score, 2);
		if (varietyCount >= 4) score = Math.max(score, 3);
		if (varietyCount >= 5 && value.length >= 12) score = 4;

		// Penalize weak patterns
		const lowerValue = value.toLowerCase();
		for (const pattern of WEAK_PATTERNS) {
			if (lowerValue.includes(pattern)) {
				score = Math.max(0, score - 2);
				feedback.push('Avoid common words and sequences');
				break;
			}
		}

		// Penalize repeated characters
		if (/(.)\1{2,}/.test(value)) {
			score = Math.max(0, score - 1);
			feedback.push('Avoid repeated characters');
		}

		// Penalize sequential characters
		if (this._hasSequential(value)) {
			score = Math.max(0, score - 1);
			feedback.push('Avoid sequential characters');
		}

		// Rule-based feedback
		if (this.options.requireLower && !rules.lower) feedback.push('Add a lowercase letter');
		if (this.options.requireUpper && !rules.upper) feedback.push('Add an uppercase letter');
		if (this.options.requireDigit && !rules.digit) feedback.push('Add a number');
		if (this.options.requireSpecial && !rules.special) feedback.push('Add a special character');

		// Deduplicate feedback
		const uniqueFeedback = [...new Set(feedback)];

		return { score: Math.min(4, Math.max(0, score)), feedback: uniqueFeedback, rules };
	}

	/**
	 * Check for sequential characters (abc, 123, qwe).
	 * @param {string} value
	 * @returns {boolean}
	 */
	_hasSequential(value) {
		const sequences = [
			'abcdefghijklmnopqrstuvwxyz',
			'qwertyuiop',
			'asdfghjkl',
			'zxcvbnm',
			'0123456789'
		];

		const lower = value.toLowerCase();
		for (let i = 0; i < lower.length - 2; i++) {
			const chunk = lower.slice(i, i + 3);
			for (const seq of sequences) {
				if (seq.includes(chunk)) return true;
			}
		}
		return false;
	}

	// ================================
	// Rendering
	// ================================

	_handleInput() {
		const result = this.calculate(this.field.value);
		this._render(result);

		EventManager.dispatch(this.field, 'password:strength', {
			field: this.field,
			...result
		});
	}

	_render({ score, feedback, rules }) {
		if (!this._container) return;

		// Update bar width and color
		const percent = (score / 4) * 100;
		if (this._bar) {
			this._bar.style.width = `${percent}%`;
			removeClass(this._bar, 'is-weak', 'is-fair', 'is-good', 'is-strong');
			if (score <= 1) addClass(this._bar, 'is-weak');
			else if (score === 2) addClass(this._bar, 'is-fair');
			else if (score === 3) addClass(this._bar, 'is-good');
			else addClass(this._bar, 'is-strong');
		}

		// Update text
		if (this._text) {
			const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
			this._text.textContent = labels[score];
			removeClass(this._text, 'is-weak', 'is-fair', 'is-good', 'is-strong');
			if (score <= 1) addClass(this._text, 'is-weak');
			else if (score === 2) addClass(this._text, 'is-fair');
			else if (score === 3) addClass(this._text, 'is-good');
			else addClass(this._text, 'is-strong');
		}

		// Update rule checklist
		if (this._rules) {
			this._rules.querySelectorAll('.form__password-strength__rule').forEach(el => {
				const ruleKey = el.dataset.rule;
				toggleClass(el, 'is-met', rules[ruleKey]);
			});
		}

		// Store score on field for validation
		this.field.dataset.strengthScore = String(score);
	}

	destroy() {
		this.field.removeEventListener('input', this._onInput);
	}
}