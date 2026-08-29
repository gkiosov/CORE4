// ==========================================
// Input Mask Component
// ==========================================
// Supports:
//   • data-mask="phone"      — auto-detect mask by country code
//   • data-mask="date|time|datetime|credit-card|ssn|zip|zip-short"
//   • data-mask="custom"     — custom mask from data-mask-pattern
// ==========================================

import { EventManager } from '../../core/_index.js';
import { detectPhoneMask } from './_phone-config.js';

const BUILTIN_MASKS = {
	date:        '##/##/####',
	time:        '##:##',
	datetime:    '##/##/#### ##:##',
	'credit-card': '#### #### #### ####',
	ssn:         '###-##-####',
	zip:         '#####-####',
	'zip-short': '#####'
};

const SLOT_CHARS = new Set(['#', 'A', '*']);

export class InputMask {
	constructor(field, options = {}) {
		this.field = field;
		this.type = field.dataset.mask || 'custom';
		this.options = {
			allowEmpty: field.dataset.maskAllowEmpty !== 'false',
			...options
		};

		this.currentMask = '';
		this.placeholder = '';

		this._onInput = this._handleInput.bind(this);
		this._onFocus = this._handleFocus.bind(this);
		this._onBlur  = this._handleBlur.bind(this);
		this._onKeydown = this._handleKeydown.bind(this);

		this._resolveMask();
		this._setPlaceholder();

		field.addEventListener('input', this._onInput);
		field.addEventListener('focus', this._onFocus);
		field.addEventListener('blur',  this._onBlur);
		field.addEventListener('keydown', this._onKeydown);
	}

	// ================================
	// Mask resolution
	// ================================

	_resolveMask() {
		if (this.type === 'phone') {
			const detected = detectPhoneMask(this.field.value || '+');
			this.currentMask = detected.mask;
			this.placeholder = detected.placeholder;
		} else if (this.type === 'custom') {
			this.currentMask = this.field.dataset.maskPattern || '';
			this.placeholder = this.field.dataset.maskPlaceholder || this._generatePlaceholder(this.currentMask);
		} else {
			this.currentMask = BUILTIN_MASKS[this.type] || this.field.dataset.maskPattern || '';
			this.placeholder = this.field.dataset.maskPlaceholder || this._generatePlaceholder(this.currentMask);
		}
	}

	_setPlaceholder() {
		if (this.placeholder && !this.field.placeholder) {
			this.field.placeholder = this.placeholder;
		}
	}

	_generatePlaceholder(pattern) {
		return pattern.replace(/[#A*]/g, '_');
	}

	_isSlotChar(char) {
		return SLOT_CHARS.has(char);
	}

	_matchesSlot(char, pChar) {
		if (pChar === '#') return /\d/.test(char);
		if (pChar === 'A') return /[a-zA-Z]/.test(char);
		if (pChar === '*') return char.length === 1 && char !== '\n';
		return char === pChar;
	}

	// ================================
	// Max length enforcement
	// ================================

	_getMaxRawLength() {
		let count = 0;
		for (const pChar of this.currentMask) {
			if (this._isSlotChar(pChar)) count++;
		}
		return count;
	}

	// ================================
	// Core engine
	// ================================

	/**
	 * Extracts raw characters from the value according to the mask.
	 * Respects the maximum number of slots in the mask.
	 */
	_extractRaw(value) {
		const maxSlots = this._getMaxRawLength();
		let raw = '';
		let vi = 0;
		let count = 0;

		for (let pi = 0; pi < this.currentMask.length && vi < value.length && count < maxSlots; pi++) {
			const pChar = this.currentMask[pi];
			if (this._isSlotChar(pChar)) {
				if (this._matchesSlot(value[vi], pChar)) {
					raw += value[vi];
					vi++;
					count++;
				}
			} else if (value[vi] === pChar) {
				vi++;
			}
		}

		// Remainder after mask (for fallback/default mask, but still respect maxSlots)
		while (vi < value.length && count < maxSlots) {
			if (/\d/.test(value[vi])) {
				raw += value[vi];
				count++;
			}
			vi++;
		}

		return raw;
	}

	/**
	 * Applies the mask to the raw string.
	 * Static characters are always included; slots are filled from raw.
	 * Stops when raw runs out — trailing static chars after the last filled slot are omitted.
	 */
	_applyPattern(raw) {
		let result = '';
		let ri = 0;
		for (const pChar of this.currentMask) {
			if (this._isSlotChar(pChar)) {
				if (ri < raw.length) {
					result += raw[ri++];
				} else {
					break;
				}
			} else {
				result += pChar;
			}
		}
		return result;
	}

	// ================================
	// Cursor positioning
	// ================================

	/**
	 * Counts how many significant (raw) characters were before the cursor,
	 * then finds the matching position in the new value.
	 */
	_findCursorPosition(newValue, targetRawCount) {
		let rawSeen = 0;
		for (let i = 0; i < newValue.length; i++) {
			if (this._isSlotChar(this.currentMask[i])) {
				if (rawSeen < targetRawCount) {
					rawSeen++;
				} else {
					return i;
				}
			}
		}
		return newValue.length;
	}

	// ================================
	// Event handlers
	// ================================

	_handleFocus() {
		if (this.type === 'phone' && !this.field.value) {
			this.field.value = '+';
			this._resolveMask();
			this.field.setSelectionRange(1, 1);
		}
	}

	_handleBlur() {
		const raw = this._extractRaw(this.field.value);
		if (!raw && this.options.allowEmpty) {
			this.field.value = '';
			this.field.dataset.maskRaw = '';
		}
	}

	_handleInput(e) {
		const input = e.target;
		let oldValue = input.value;
		let oldCursor = input.selectionStart || 0;

		// For phone: ensure leading + and recalculate mask
		if (this.type === 'phone') {
			if (!oldValue.startsWith('+')) {
				const hadLeadingPlus = oldValue.startsWith('+');
				oldValue = '+' + oldValue.replace(/^\+/, '');
				input.value = oldValue;
				if (!hadLeadingPlus) oldCursor++;
			}
			this._resolveMask();
		}

		const raw = this._extractRaw(input.value);
		const newValue = this._applyPattern(raw);

		if (input.value !== newValue) {
			const rawBeforeCursor = this._extractRaw(oldValue.slice(0, oldCursor));
			const rawCount = rawBeforeCursor.length;

			input.value = newValue;
			const newCursor = this._findCursorPosition(newValue, rawCount);
			input.setSelectionRange(newCursor, newCursor);
		}

		input.dataset.maskRaw = raw;

		EventManager.dispatch(input, 'mask:input', {
			mask: this.currentMask,
			raw,
			masked: newValue
		});
	}

	/**
	 * Handles Backspace and Delete keys to skip static mask characters.
	 * Prevents the cursor from getting stuck on separators.
	 */
	_handleKeydown(e) {
		if (e.key !== 'Backspace' && e.key !== 'Delete') return;

		const input = this.field;
		const value = input.value;
		let start = input.selectionStart;
		let end = input.selectionEnd;

		// Nothing to delete
		if (start === end && ((e.key === 'Backspace' && start === 0) || (e.key === 'Delete' && start >= value.length))) {
			return;
		}

		e.preventDefault();

		let newValue, newCursor;

		if (start !== end) {
			// Selection delete
			newValue = value.slice(0, start) + value.slice(end);
			newCursor = start;
		} else if (e.key === 'Backspace') {
			// Find the nearest slot to the left of the cursor
			let pos = start - 1;
			while (pos >= 0 && !this._isSlotChar(this.currentMask[pos])) {
				pos--;
			}

			if (pos < 0) {
				// No slot found before cursor — all prefix chars
				const currentRaw = this._extractRaw(value);
				if (currentRaw === '' && this.options.allowEmpty) {
					input.value = '';
					input.dataset.maskRaw = '';
					input.setSelectionRange(0, 0);
					return;
				}
				// Move cursor to start
				input.setSelectionRange(0, 0);
				return;
			}

			newValue = value.slice(0, pos) + value.slice(pos + 1);
			newCursor = pos;
		} else { // Delete key
			let pos = start;
			while (pos < value.length && !this._isSlotChar(this.currentMask[pos])) {
				pos++;
			}

			if (pos >= value.length) {
				return;
			}

			newValue = value.slice(0, pos) + value.slice(pos + 1);
			newCursor = pos;
		}

		const raw = this._extractRaw(newValue);
		let masked = this._applyPattern(raw);

		if (this.type === 'phone' && raw === '') {
			masked = this.options.allowEmpty ? '' : '+';
		}

		input.value = masked;

		// Place cursor: if it landed on a static char, move to the next slot
		let finalCursor = Math.min(newCursor, masked.length);
		while (finalCursor < masked.length && !this._isSlotChar(this.currentMask[finalCursor])) {
			finalCursor++;
		}

		input.setSelectionRange(finalCursor, finalCursor);
		input.dataset.maskRaw = raw;

		EventManager.dispatch(input, 'mask:input', {
			mask: this.currentMask,
			raw,
			masked
		});
	}

	// ================================
	// Public API
	// ================================

	getRawValue() {
		return this._extractRaw(this.field.value);
	}

	getMaskedValue() {
		return this.field.value;
	}

	setValue(raw) {
		const masked = this._applyPattern(String(raw));
		this.field.value = masked;
		this.field.dataset.maskRaw = this._extractRaw(masked);
	}

	destroy() {
		this.field.removeEventListener('input', this._onInput);
		this.field.removeEventListener('focus', this._onFocus);
		this.field.removeEventListener('blur',  this._onBlur);
		this.field.removeEventListener('keydown', this._onKeydown);
		delete this.field.dataset.maskRaw;
	}
}