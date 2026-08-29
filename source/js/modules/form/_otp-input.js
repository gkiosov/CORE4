// ==========================================
// OTP Input Component
// ==========================================
// Split-digit input for verification codes.
// Supports: configurable length, paste, backspace navigation,
// arrow keys, auto-focus, and hidden input for form submission.
// ==========================================

import { EventManager } from '../../core/_index.js';

export class OtpInput {
	constructor(container, options = {}) {
		this.container = container;
		this.length = parseInt(container.dataset.otpLength, 10) || parseInt(container.dataset.otp, 10) || 4;
		this.name = container.dataset.otpName || 'otp';
		this.digits = [];

		this._onKeydown = this._handleKeydown.bind(this);
		this._onInput = this._handleInput.bind(this);
		this._onPaste = this._handlePaste.bind(this);
		this._onFocus = this._handleFocus.bind(this);

		this._init();
	}

	_init() {
		// Hidden input for form submission
		this.hiddenInput = document.createElement('input');
		this.hiddenInput.type = 'hidden';
		this.hiddenInput.name = this.name;
		this.container.appendChild(this.hiddenInput);

		// Re-use existing inputs or generate new ones
		const existing = this.container.querySelectorAll('.form__otp__digit');
		if (existing.length >= this.length) {
			this.digits = Array.from(existing).slice(0, this.length);
		} else {
			// Clear container except hidden input
			Array.from(this.container.children).forEach(child => {
				if (child !== this.hiddenInput) child.remove();
			});

			for (let i = 0; i < this.length; i++) {
				const input = document.createElement('input');
				input.type = 'text';
				input.className = 'form__otp__digit';
				input.maxLength = 1;
				input.inputMode = 'numeric';
				input.pattern = '[0-9]*';
				input.autocomplete = 'one-time-code';
				input.setAttribute('aria-label', `Digit ${i + 1} of ${this.length}`);
				this.container.appendChild(input);
				this.digits.push(input);
			}
		}

		this.digits.forEach(digit => {
			digit.addEventListener('keydown', this._onKeydown);
			digit.addEventListener('input', this._onInput);
			digit.addEventListener('paste', this._onPaste);
			digit.addEventListener('focus', this._onFocus);
		});
	}

	_handleFocus(e) {
		// Select all text on focus for easy replacement
		e.target.select();
	}

	_handleInput(e) {
		const input = e.target;
		const index = this.digits.indexOf(input);

		// Keep only digits
		const val = input.value.replace(/\D/g, '');
		if (val !== input.value) {
			input.value = val;
		}

		if (val.length === 1) {
			input.classList.add('is-filled');
			if (index < this.length - 1) {
				this.digits[index + 1].focus();
			} else {
				this._checkComplete();
			}
		} else if (val.length === 0) {
			input.classList.remove('is-filled');
		}

		this._updateHidden();
	}

	_handleKeydown(e) {
		const input = e.target;
		const index = this.digits.indexOf(input);

		if (e.key === 'Backspace') {
			e.preventDefault();
			if (input.value !== '') {
				input.value = '';
				input.classList.remove('is-filled');
				this._updateHidden();
			} else if (index > 0) {
				this.digits[index - 1].value = '';
				this.digits[index - 1].classList.remove('is-filled');
				this.digits[index - 1].focus();
				this._updateHidden();
			}
			return;
		}

		if (e.key === 'Delete') {
			e.preventDefault();
			input.value = '';
			input.classList.remove('is-filled');
			this._updateHidden();
			return;
		}

		if (e.key === 'ArrowLeft' && index > 0) {
			e.preventDefault();
			this.digits[index - 1].focus();
			return;
		}

		if (e.key === 'ArrowRight' && index < this.length - 1) {
			e.preventDefault();
			this.digits[index + 1].focus();
			return;
		}


		// Block non-digit characters, but allow shortcuts (Ctrl/Cmd+V, etc.)
		if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
		}
	}

	_handlePaste(e) {
		e.preventDefault();
		const index = this.digits.indexOf(e.target);
		const raw = e.clipboardData ? e.clipboardData.getData('text/plain') : (window.clipboardData ? window.clipboardData.getData('Text') : '');
		const paste = String(raw || '').replace(/\D/g, '');

		if (!paste) return;

		for (let i = 0; i < paste.length && (index + i) < this.length; i++) {
			const digit = this.digits[index + i];
			digit.value = paste[i];
			digit.classList.add('is-filled');
		}

		// Focus next empty or last digit
		const nextEmpty = this.digits.find(d => d.value === '');
		if (nextEmpty) {
			nextEmpty.focus();
		} else {
			this.digits[this.length - 1].focus();
		}

		this._updateHidden();
		this._checkComplete();
	}

	_updateHidden() {
		const code = this.digits.map(d => d.value).join('');
		this.hiddenInput.value = code;

		EventManager.dispatch(this.container, 'otp:input', {
			value: code,
			complete: code.length === this.length
		});
	}

	_checkComplete() {
		const code = this.digits.map(d => d.value).join('');
		if (code.length === this.length) {
			this.container.classList.add('is-complete');
			EventManager.dispatch(this.container, 'otp:complete', { value: code });
		} else {
			this.container.classList.remove('is-complete');
		}
	}

	// ================================
	// Public API
	// ================================

	getValue() {
		return this.digits.map(d => d.value).join('');
	}

	setValue(code) {
		const digits = String(code).replace(/\D/g, '').split('');
		this.digits.forEach((input, i) => {
			input.value = digits[i] || '';
			input.classList.toggle('is-filled', !!digits[i]);
		});
		this._updateHidden();
		this._checkComplete();
	}

	clear() {
		this.digits.forEach(d => {
			d.value = '';
			d.classList.remove('is-filled');
		});
		this._updateHidden();
		this.container.classList.remove('is-complete');
		this.digits[0].focus();
	}

	destroy() {
		this.digits.forEach(digit => {
			digit.removeEventListener('keydown', this._onKeydown);
			digit.removeEventListener('input', this._onInput);
			digit.removeEventListener('paste', this._onPaste);
			digit.removeEventListener('focus', this._onFocus);
		});
		if (this.hiddenInput) this.hiddenInput.remove();
	}
}