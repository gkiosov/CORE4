// ==========================================
// Form Component
// ==========================================
// Accessible form validation with live feedback,
// custom validators, async submit, group validation,
// cross-field validation, input masks, async remote validation,
// file drag & drop validation, multi-step wizard, autosave drafts,
// progress indicator, debounced input, and ARIA support.
// Integrates seamlessly with CORE4's Button async states
// and FocusTrap for error navigation.
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass, toggleClass, createElement } from '../../utilities/_dom.js';
import { FocusTrap } from '../../utilities/_focus-trap.js';
import { FileUpload } from './_file-upload.js';
import { PasswordStrength } from './_password-strength.js';

// ==========================================
// Debounce Utility
// ==========================================

function debounce(fn, delay) {
	let timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

// ==========================================
// Input Mask
// ==========================================

const MASK_PATTERNS = {
	'phone-us': '(###) ###-####',
	'phone-eu': '+## ### ### ###',
	'date': '##/##/####',
	'time': '##:##',
	'datetime': '##/##/#### ##:##',
	'credit-card': '#### #### #### ####',
	'ssn': '###-##-####',
	'zip': '#####-####',
	'zip-short': '#####'
};

class InputMask {
	constructor(field, pattern) {
		this.field = field;
		this.pattern = pattern;

		this._onInput = this._handleInput.bind(this);
		this._onKeydown = this._handleKeydown.bind(this);
		this._onBeforeInput = this._handleBeforeInput.bind(this);

		field.addEventListener('input', this._onInput);
		field.addEventListener('keydown', this._onKeydown);
		field.addEventListener('beforeinput', this._onBeforeInput);

		field.dataset.maskRaw = '';
	}

	_matchesSlot(char, pChar) {
		if (pChar === '#') return /\d/.test(char);
		if (pChar === 'A') return /[a-zA-Z]/.test(char);
		if (pChar === '*') return char.length === 1;
		return char === pChar;
	}

	_handleBeforeInput(e) {
		if (e.inputType === 'insertText' && e.data) {
			const nextSlot = this._getNextSlotIndex(this.field.value);
			if (nextSlot === -1) {
				e.preventDefault();
				return;
			}
			const pChar = this.pattern[nextSlot];
			if (!this._matchesSlot(e.data, pChar)) {
				e.preventDefault();
			}
		}
	}

	_getNextSlotIndex(value) {
		let pi = 0;
		let vi = 0;
		while (pi < this.pattern.length && vi < value.length) {
			if (value[vi] === this.pattern[pi]) {
				vi++;
			}
			pi++;
		}
		return pi < this.pattern.length ? pi : -1;
	}

	_extractRaw(value) {
		let raw = '';
		let vi = 0;
		for (let pi = 0; pi < this.pattern.length && vi < value.length; pi++) {
			const pChar = this.pattern[pi];
			if (['#', 'A', '*'].includes(pChar)) {
				if (this._matchesSlot(value[vi], pChar)) {
					raw += value[vi];
					vi++;
				}
			} else if (value[vi] === pChar) {
				vi++;
			}
		}
		return raw;
	}

	_applyPattern(raw) {
		let result = '';
		let ri = 0;
		for (const pChar of this.pattern) {
			if (ri >= raw.length) break;
			if (['#', 'A', '*'].includes(pChar)) {
				result += raw[ri++];
			} else {
				result += pChar;
			}
		}
		return result;
	}

	_handleInput(e) {
		const raw = this._extractRaw(e.target.value);
		const formatted = this._applyPattern(raw);

		if (e.target.value !== formatted) {
			e.target.value = formatted;
			e.target.setSelectionRange(formatted.length, formatted.length);
		}

		e.target.dataset.maskRaw = raw;
	}

	_handleKeydown(e) {
		if (e.key === 'Backspace') {
			const val = this.field.value;
			const len = val.length;
			if (len === 0) return;

			const lastChar = val[len - 1];
			const lastPatternChar = this.pattern[len - 1];
			if (lastPatternChar && !['#', 'A', '*'].includes(lastPatternChar)) {
				const raw = this._extractRaw(val.slice(0, -2));
				const formatted = this._applyPattern(raw);
				this.field.value = formatted;
				this.field.dataset.maskRaw = raw;
				this.field.setSelectionRange(formatted.length, formatted.length);
				e.preventDefault();
			}
		}
	}

	destroy() {
		this.field.removeEventListener('input', this._onInput);
		this.field.removeEventListener('keydown', this._onKeydown);
		this.field.removeEventListener('beforeinput', this._onBeforeInput);
		delete this.field.dataset.maskRaw;
	}
}

// ==========================================
// Built-in Field Validation Rules
// ==========================================

const BUILT_IN_RULES = {
	required(value, field) {
		if (field.type === 'checkbox') {
			return { valid: field.checked, message: 'This field is required' };
		}
		if (field.type === 'radio') {
			const group = document.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
			const checked = Array.from(group).some(r => r.checked);
			return { valid: checked, message: 'Please select an option' };
		}
		if (field.type === 'file') {
			return { valid: field.files && field.files.length > 0, message: 'Please select a file' };
		}
		return { valid: value.trim().length > 0, message: 'This field is required' };
	},

	minlength(value, field, param) {
		const min = parseInt(param, 10);
		return {
			valid: value.length >= min,
			message: `Must be at least ${min} characters`
		};
	},

	maxlength(value, field, param) {
		const max = parseInt(param, 10);
		return {
			valid: value.length <= max,
			message: `Must be no more than ${max} characters`
		};
	},

	pattern(value, field, param) {
		const regex = new RegExp(param);
		return {
			valid: regex.test(value),
			message: field.dataset.errorPattern || 'Invalid format'
		};
	},

	email(value) {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return {
			valid: regex.test(value),
			message: 'Please enter a valid email address'
		};
	},

	url(value) {
		try {
			// eslint-disable-next-line no-new
			new URL(value);
			return { valid: true };
		} catch {
			return { valid: false, message: 'Please enter a valid URL' };
		}
	},

	min(value, field, param) {
		const num = parseFloat(value);
		const min = parseFloat(param);
		return {
			valid: !isNaN(num) && num >= min,
			message: `Must be at least ${min}`
		};
	},

	max(value, field, param) {
		const num = parseFloat(value);
		const max = parseFloat(param);
		return {
			valid: !isNaN(num) && num <= max,
			message: `Must be no more than ${max}`
		};
	},

	number(value) {
		return {
			valid: value === '' || !isNaN(parseFloat(value)),
			message: 'Must be a number'
		};
	},

	match(value, field, param) {
		const target = document.getElementById(param);
		return {
			valid: value === (target ? target.value : ''),
			message: 'Fields do not match'
		};
	},

	/**
	 * Password strength validation.
	 * Requires a minimum strength score (0–4) set via data-validate-strength.
	 * The PasswordStrength component calculates the score in real time.
	 */
	strength(value, field, param) {
		const minScore = parseInt(param, 10) || 2;
		const score = parseInt(field.dataset.strengthScore, 10) || 0;
		const labels = ['too weak', 'weak', 'fair', 'good', 'strong'];
		return {
			valid: score >= minScore,
			message: field.dataset.errorStrength || `Password is ${labels[score] || 'too weak'} — must be at least ${labels[minScore]}`
		};
	},

	depends(value, field, param) {
		const parts = param.split(':');
		const targetId = parts[0];
		const operator = parts[1] || 'eq';
		const expected = parts[2];

		const target = document.getElementById(targetId);
		if (!target) return { valid: true };

		const targetValue = target.type === 'checkbox' || target.type === 'radio'
			? target.checked
			: target.value;

		const label = target.labels?.[0]?.textContent || targetId;

		switch (operator) {
			case 'eq':
				return {
					valid: String(targetValue) === expected,
					message: field.dataset.errorDepends || `Requires ${label} to be "${expected}"`
				};
			case 'neq':
				return {
					valid: String(targetValue) !== expected,
					message: field.dataset.errorDepends || `Must differ from ${label}`
				};
			case 'gt':
				return {
					valid: parseFloat(targetValue) > parseFloat(expected),
					message: field.dataset.errorDepends || `Must be greater than ${label}`
				};
			case 'lt':
				return {
					valid: parseFloat(targetValue) < parseFloat(expected),
					message: field.dataset.errorDepends || `Must be less than ${label}`
				};
			case 'gte':
				return {
					valid: parseFloat(targetValue) >= parseFloat(expected),
					message: field.dataset.errorDepends || `Must be >= ${label}`
				};
			case 'lte':
				return {
					valid: parseFloat(targetValue) <= parseFloat(expected),
					message: field.dataset.errorDepends || `Must be <= ${label}`
				};
			case 'contains':
				return {
					valid: String(targetValue).includes(expected),
					message: field.dataset.errorDepends || `${label} must contain "${expected}"`
				};
			case 'checked':
				return {
					valid: target.checked,
					message: field.dataset.errorDepends || `${label} must be checked`
				};
			case 'empty':
				return {
					valid: !targetValue,
					message: field.dataset.errorDepends || `${label} must be empty`
				};
			default:
				return { valid: true };
		}
	},

	/**
	 * File type validation.
	 * @param {string} value — ignored; uses field.files directly
	 * @param {HTMLInputElement} field
	 * @param {string} param — comma-separated MIME types or extensions, e.g. "image/*,.pdf"
	 */
	fileType(value, field, param) {
		if (!field.files || field.files.length === 0) return { valid: true };
		const allowed = param.split(',').map(s => s.trim().toLowerCase());
		const invalid = Array.from(field.files).some(file => {
			const ext = '.' + file.name.split('.').pop().toLowerCase();
			return !allowed.some(rule => {
				if (rule.startsWith('.')) return ext === rule;
				if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
				return file.type === rule;
			});
		});
		return {
			valid: !invalid,
			message: field.dataset.errorFileType || `Allowed types: ${param}`
		};
	},

	/**
	 * File size validation (per file).
	 * @param {string} value — ignored
	 * @param {HTMLInputElement} field
	 * @param {string} param — max size in bytes, or with suffix: KB, MB, GB
	 */
	fileSize(value, field, param) {
		if (!field.files || field.files.length === 0) return { valid: true };

		let maxBytes = parseFloat(param);
		const unit = param.replace(/[\d.]/g, '').trim().toUpperCase();
		if (unit === 'KB') maxBytes *= 1024;
		else if (unit === 'MB') maxBytes *= 1024 * 1024;
		else if (unit === 'GB') maxBytes *= 1024 * 1024 * 1024;

		const invalid = Array.from(field.files).some(f => f.size > maxBytes);
		const readable = unit ? param : `${maxBytes} bytes`;

		return {
			valid: !invalid,
			message: field.dataset.errorFileSize || `Each file must be under ${readable}`
		};
	},

	/**
	 * File count validation.
	 * @param {string} value — ignored
	 * @param {HTMLInputElement} field
	 * @param {string} param — max number of files
	 */
	fileCount(value, field, param) {
		const max = parseInt(param, 10);
		const count = field.files ? field.files.length : 0;
		return {
			valid: count <= max,
			message: field.dataset.errorFileCount || `Maximum ${max} files allowed`
		};
	}
};

// ==========================================
// Group Validation Rules
// ==========================================

const GROUP_RULES = {
	required(group, fields) {
		const hasValue = fields.some(f => {
			if (f.type === 'checkbox') return f.checked;
			if (f.type === 'radio') {
				return document.querySelector(`input[type="radio"][name="${f.name}"]:checked`) !== null;
			}
			if (f.type === 'file') return f.files && f.files.length > 0;
			return f.value.trim() !== '';
		});
		return {
			valid: hasValue,
			message: group.dataset.errorGroupRequired || 'Please complete at least one field in this group'
		};
	},

	minChecked(group, fields, param) {
		const min = parseInt(param, 10);
		const checked = fields.filter(f => f.type === 'checkbox' && f.checked).length;
		return {
			valid: checked >= min,
			message: group.dataset.errorGroupMin || `Please select at least ${min} options`
		};
	},

	maxChecked(group, fields, param) {
		const max = parseInt(param, 10);
		const checked = fields.filter(f => f.type === 'checkbox' && f.checked).length;
		return {
			valid: checked <= max,
			message: group.dataset.errorGroupMax || `Please select no more than ${max} options`
		};
	}
};

export class Form {
	/**
	 * @param {HTMLFormElement} element  – the <form> root element
	 * @param {Object} options
	 * @param {boolean} options.liveValidate      – validate on input after first blur (default: true)
	 * @param {boolean} options.validateOnSubmit  – validate all fields on submit (default: true)
	 * @param {boolean} options.focusFirstError   – focus first invalid field on submit (default: true)
	 * @param {boolean} options.scrollToError     – scroll to first error on submit (default: true)
	 * @param {boolean} options.showSummary       – show top-level summary on submit (default: false)
	 * @param {boolean} options.showProgress      – show fill progress bar (default: false)
	 * @param {string}  options.errorClass        – CSS class for invalid state (default: 'is-invalid')
	 * @param {string}  options.validClass        – CSS class for valid state (default: 'is-valid')
	 * @param {string}  options.dirtyClass        – CSS class for dirty state (default: 'is-dirty')
	 * @param {string}  options.focusedClass      – CSS class for focused state (default: 'is-focused')
	 * @param {string}  options.summarySelector   – selector for the summary element
	 * @param {string}  options.progressSelector  – selector for the progress element
	 * @param {number}  options.debounceDelay     – ms delay for live validation debounce (default: 300)
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			liveValidate: options.liveValidate !== false,
			validateOnSubmit: options.validateOnSubmit !== false,
			focusFirstError: options.focusFirstError !== false,
			scrollToError: options.scrollToError !== false,
			showSummary: options.showSummary || false,
			showProgress: options.showProgress || false,
			errorClass: options.errorClass || 'is-invalid',
			validClass: options.validClass || 'is-valid',
			dirtyClass: options.dirtyClass || 'is-dirty',
			focusedClass: options.focusedClass || 'is-focused',
			summarySelector: options.summarySelector || '.form__summary',
			progressSelector: options.progressSelector || '.form__progress',
			debounceDelay: options.debounceDelay || 300,
			...options
		};

		/** @type {HTMLInputElement[]} */
		this.fields = [];

		/** @type {{element: Element, fields: HTMLInputElement[]}[]} */
		this.groups = [];

		/** @type {InputMask[]} */
		this._masks = [];

		/** @type {FileUpload[]} */
		this._fileUploads = [];

		/** @type {PasswordStrength[]} */
		this._passwordStrengths = [];

		/** Tracks async validation abort controllers per field. */
		this._asyncControllers = new Map();

		/** Tracks which fields/groups have been blurred at least once. */
		this._touched = new Set();

		/** Handler registry for clean destroy(). */
		this._handlers = [];

		/** Group event handler registry. */
		this._groupHandlers = [];

		/** Wizard state. */
		this._wizard = null;

		/** Autosave timer. */
		this._autosaveTimer = null;

		this.init();
	}

	// ================================
	// Initialization
	// ================================

	init() {
		this.fields = Array.from(
			this.element.querySelectorAll('input, select, textarea')
		).filter(field => !field.disabled && !field.readOnly);

		this.fields.forEach(field => this._initField(field));
		this._initGroups();
		this._initFileDrops();
		this._initProgress();
		this._initWizard();
		this._initAutosave();
		this._bindSubmit();
		this._bindReset();

		EventManager.dispatch(this.element, 'form:initialized', { form: this });
	}

	/**
	 * Set up individual field: wrap in group, create error slot,
	 * bind events, init mask, init async validation, and sync initial state.
	 * @param {HTMLInputElement} field
	 * @private
	 */
	_initField(field) {
		const group = this._ensureGroup(field);

		// Create error message container if missing
		let errorEl = qs('.form__error', group);
		if (!errorEl) {
			errorEl = createElement('span', 'form__error', {
				id: `${field.id || field.name}-error`,
				'aria-live': 'polite'
			});
			group.appendChild(errorEl);
		}

		// Link field to error via aria-describedby
		if (errorEl.id) {
			const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
			if (!describedBy.includes(errorEl.id)) {
				describedBy.push(errorEl.id);
				field.setAttribute('aria-describedby', describedBy.join(' '));
			}
		}

		// Mark required groups
		if (field.required || field.dataset.validateRequired !== undefined) {
			addClass(group, 'form__group--required');
		}

		// Initialize input mask if specified
		this._initMask(field);

		// Initialize file upload if input type is file
		if (field.type === 'file') {
			this._initFileUpload(field);
		}

		// Initialize password strength indicator
		if (field.dataset.validateStrength !== undefined || field.dataset.strengthMinlength) {
			this._initPasswordStrength(field);
		}

		// --- Event listeners ---

		const onBlur = () => {
			this._touched.add(field);
			this.validateField(field);
			removeClass(group, this.options.focusedClass);
		};

		const onFocus = () => {
			addClass(group, this.options.focusedClass);
		};

		const onInput = debounce(() => {
			addClass(group, this.options.dirtyClass);
			if (this._touched.has(field) && this.options.liveValidate) {
				this.validateField(field);
			}
			this._updateCounter(field);
			this._updateProgress();
			this._triggerAutosave();
		}, this.options.debounceDelay);

		field.addEventListener('blur', onBlur);
		field.addEventListener('focus', onFocus);
		field.addEventListener('input', onInput);

		// File input change listener
		if (field.type === 'file') {
			const onFileChange = () => {
				this._touched.add(field);
				this._renderFilePreview(field);
				this.validateField(field);
				this._updateProgress();
				this._triggerAutosave();
			};
			field.addEventListener('change', onFileChange);
			this._handlers.push({ element: field, type: 'change', handler: onFileChange });
		}

		this._handlers.push(
			{ element: field, type: 'blur', handler: onBlur },
			{ element: field, type: 'focus', handler: onFocus },
			{ element: field, type: 'input', handler: onInput }
		);

		this._updateCounter(field);
	}

	/**
	 * Initialize an input mask on the field if data-mask is present.
	 * @param {HTMLInputElement} field
	 * @private
	 */
	_initMask(field) {
		const maskType = field.dataset.mask;
		if (!maskType) return;

		const pattern = MASK_PATTERNS[maskType] || field.dataset.maskPattern;
		if (!pattern) {
			console.warn(`[Form] Unknown mask "${maskType}" and no data-mask-pattern provided.`, field);
			return;
		}

		const mask = new InputMask(field, pattern);
		addClass(field, 'form__input--masked');
		this._masks.push(mask);
	}

	/**
	 * Initialize file upload handling for a file input.
	 * @param {HTMLInputElement} field
	 * @private
	 */
	_initFileUpload(field) {
		const upload = new FileUpload(field, {
			errorClass: this.options.errorClass
		});
		this._fileUploads.push(upload);
	}

	/**
	 * Initialize password strength indicator for a password field.
	 * @param {HTMLInputElement} field
	 * @private
	 */
	_initPasswordStrength(field) {
		const strength = new PasswordStrength(field, {
			minLength: parseInt(field.dataset.strengthMinlength, 10) || undefined,
			requireUpper: field.dataset.strengthUpper !== undefined,
			requireLower: field.dataset.strengthLower !== undefined,
			requireDigit: field.dataset.strengthDigit !== undefined,
			requireSpecial: field.dataset.strengthSpecial !== undefined
		});
		this._passwordStrengths.push(strength);
	}

	/**
	 * Ensure the field is wrapped in a .form__group.
	 * @param {HTMLInputElement} field
	 * @returns {Element}
	 * @private
	 */
	_ensureGroup(field) {
		const existing = field.closest('.form__group');
		if (existing) return existing;

		const group = createElement('div', 'form__group');
		const label = field.labels && field.labels[0];

		if (label && field.parentNode === label.parentNode) {
			field.parentNode.insertBefore(group, label);
			group.appendChild(label);
			group.appendChild(field);
		} else {
			field.parentNode.insertBefore(group, field);
			group.appendChild(field);
		}

		return group;
	}

	// ================================
	// File Drop Zone
	// ================================

	/**
	 * Initialize drag & drop zones for file inputs.
	 * Looks for .form__file-drop wrappers around file inputs.
	 * @private
	 */
	_initFileDrops() {
		const dropZones = qsa('.form__file-drop', this.element);

		dropZones.forEach(zone => {
			const input = zone.querySelector('input[type="file"]');
			if (!input) return;

			// Click on zone triggers file input
			zone.addEventListener('click', (e) => {
				if (e.target !== input) input.click();
			});

			// Drag events
			const onDragOver = (e) => {
				e.preventDefault();
				e.stopPropagation();
				addClass(zone, 'is-dragover');
			};

			const onDragLeave = (e) => {
				e.preventDefault();
				e.stopPropagation();
				removeClass(zone, 'is-dragover');
			};

			const onDrop = (e) => {
				e.preventDefault();
				e.stopPropagation();
				removeClass(zone, 'is-dragover');

				const dt = e.dataTransfer;
				if (dt && dt.files.length > 0) {
					input.files = dt.files;
					input.dispatchEvent(new Event('change', { bubbles: true }));
				}
			};

			zone.addEventListener('dragover', onDragOver);
			zone.addEventListener('dragleave', onDragLeave);
			zone.addEventListener('drop', onDrop);

			this._handlers.push(
				{ element: zone, type: 'dragover', handler: onDragOver },
				{ element: zone, type: 'dragleave', handler: onDragLeave },
				{ element: zone, type: 'drop', handler: onDrop }
			);
		});
	}

	/**
	 * Render file preview list inside the drop zone.
	 * @param {HTMLInputElement} input
	 * @private
	 */
	_renderFilePreview(input) {
		const zone = input.closest('.form__file-drop');
		if (!zone) return;

		let preview = qs('.form__file-preview', zone);
		if (!preview) {
			preview = createElement('ul', 'form__file-preview');
			zone.appendChild(preview);
		}

		preview.innerHTML = '';

		if (!input.files || input.files.length === 0) {
			preview.style.display = 'none';
			return;
		}

		preview.style.display = 'flex';

		Array.from(input.files).forEach((file, index) => {
			const item = createElement('li', 'form__file-preview__item');

			// File icon or thumbnail
			let iconHtml = '';
			if (file.type.startsWith('image/')) {
				const url = URL.createObjectURL(file);
				iconHtml = `<img src="${url}" alt="" class="form__file-preview__thumb">`;
			} else {
				iconHtml = `<span class="form__file-preview__icon">📄</span>`;
			}

			const size = this._formatFileSize(file.size);

			item.innerHTML = `
        ${iconHtml}
        <span class="form__file-preview__name">${file.name}</span>
        <span class="form__file-preview__size">${size}</span>
        <button type="button" class="form__file-preview__remove" data-file-index="${index}" aria-label="Remove ${file.name}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      `;

			preview.appendChild(item);
		});

		// Bind remove buttons
		preview.querySelectorAll('.form__file-preview__remove').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const idx = parseInt(btn.dataset.fileIndex, 10);
				this._removeFile(input, idx);
			});
		});
	}

	/**
	 * Remove a single file from the input's FileList.
	 * @param {HTMLInputElement} input
	 * @param {number} index
	 * @private
	 */
	_removeFile(input, index) {
		const dt = new DataTransfer();
		Array.from(input.files).forEach((file, i) => {
			if (i !== index) dt.items.add(file);
		});
		input.files = dt.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));
	}

	/**
	 * Format bytes to human-readable string.
	 * @param {number} bytes
	 * @returns {string}
	 * @private
	 */
	_formatFileSize(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	// ================================
	// Conditional Validation
	// ================================

	_shouldValidateField(field) {
		const condition = field.dataset.validateIf;
		if (condition) {
			const [targetId, expectedValue] = condition.split(':');
			const target = document.getElementById(targetId);
			if (target) {
				const targetValue = target.type === 'checkbox' || target.type === 'radio'
					? target.checked
					: target.value;
				if (expectedValue !== undefined) {
					if (String(targetValue) !== expectedValue) return false;
				} else if (!targetValue) {
					return false;
				}
			}
		}

		const notCondition = field.dataset.validateIfNot;
		if (notCondition) {
			const [targetId, expectedValue] = notCondition.split(':');
			const target = document.getElementById(targetId);
			if (target) {
				const targetValue = target.type === 'checkbox' || target.type === 'radio'
					? target.checked
					: target.value;
				if (expectedValue !== undefined) {
					if (String(targetValue) === expectedValue) return false;
				} else if (targetValue) {
					return false;
				}
			}
		}

		return true;
	}

	// ================================
	// Group Validation Initialization
	// ================================

	_initGroups() {
		const groupSelectors = [
			'[data-validate-group]',
			'[data-validate-group-min]',
			'[data-validate-group-max]'
		];

		const groupElements = qsa(groupSelectors.join(', '), this.element);

		groupElements.forEach(group => {
			const fields = Array.from(
				group.querySelectorAll('input, select, textarea')
			).filter(f => !f.disabled);

			if (fields.length === 0) return;

			this.groups.push({ element: group, fields });

			const handler = () => {
				if (this._touched.has(group) || group.classList.contains(this.options.dirtyClass)) {
					this.validateGroup(group);
				}
				this._updateProgress();
			};

			fields.forEach(f => {
				f.addEventListener('change', handler);
				f.addEventListener('input', handler);
			});

			this._groupHandlers.push({ group, fields, handler });
		});
	}

	// ================================
	// Progress Indicator
	// ================================

	_initProgress() {
		if (!this.options.showProgress) return;

		let progressEl = qs(this.options.progressSelector, this.element);
		if (!progressEl) {
			progressEl = createElement('div', 'form__progress', {
				'aria-label': 'Form completion progress',
				role: 'progressbar',
				'aria-valuemin': '0',
				'aria-valuemax': '100',
				'aria-valuenow': '0'
			});
			progressEl.innerHTML = `
        <div class="form__progress__track">
          <div class="form__progress__bar"></div>
        </div>
        <span class="form__progress__text">0%</span>
      `;
			this.element.insertBefore(progressEl, this.element.firstChild);
		}

		this._updateProgress();
	}

	_updateProgress() {
		if (!this.options.showProgress) return;

		const progressEl = qs(this.options.progressSelector, this.element);
		if (!progressEl) return;

		let completed = 0;
		let total = 0;

		this.fields.forEach(field => {
			const isRequired = field.required || field.dataset.validateRequired !== undefined;
			if (!isRequired) return;
			if (!this._shouldValidateField(field)) return;

			total++;
			const group = field.closest('.form__group');
			if (group && group.classList.contains(this.options.validClass)) {
				completed++;
			}
		});

		this.groups.forEach(({ element: group }) => {
			const hasGroupRule = group.hasAttribute('data-validate-group') ||
				group.hasAttribute('data-validate-group-min') ||
				group.hasAttribute('data-validate-group-max');
			if (!hasGroupRule) return;

			total++;
			if (group.classList.contains(this.options.validClass)) {
				completed++;
			}
		});

		const percent = total > 0 ? Math.round((completed / total) * 100) : 100;

		const bar = qs('.form__progress__bar', progressEl);
		const text = qs('.form__progress__text', progressEl);

		if (bar) bar.style.width = `${percent}%`;
		if (text) text.textContent = `${percent}%`;

		progressEl.setAttribute('aria-valuenow', String(percent));
		toggleClass(progressEl, 'is-complete', percent === 100);

		EventManager.dispatch(this.element, 'form:progress', {
			form: this,
			percent,
			completed,
			total
		});
	}

	// ================================
	// Wizard (Multi-Step)
	// ================================

	/**
	 * Initialize wizard mode if data-form="wizard" is set.
	 * @private
	 */
	_initWizard() {
		if (this.element.dataset.form !== 'wizard') return;

		const steps = qsa('[data-wizard-step]', this.element);
		if (steps.length === 0) return;

		this._wizard = {
			steps: Array.from(steps),
			current: 0,
			total: steps.length
		};

		// Hide all steps except first
		this._wizard.steps.forEach((step, i) => {
			if (i !== 0) step.style.display = 'none';
		});

		// Create stepper nav if not present
		this._initStepper();

		// Bind wizard navigation buttons
		this._bindWizardNav();

		this._updateWizardUI();
	}

	/**
	 * Create or update the stepper indicator bar.
	 * @private
	 */
	_initStepper() {
		let stepper = qs('.form__stepper', this.element);
		if (!stepper) {
			stepper = createElement('div', 'form__stepper');
			stepper.innerHTML = this._wizard.steps.map((step, i) => `
        <button type="button" class="form__stepper__step" data-step="${i}" ${i === 0 ? 'aria-current="step"' : ''}>
          <span class="form__stepper__badge">${i + 1}</span>
          <span class="form__stepper__label">${step.dataset.wizardStep || `Step ${i + 1}`}</span>
        </button>
      `).join('');
			this.element.insertBefore(stepper, this.element.firstChild);
		}

		// Bind stepper clicks (only to visited steps)
		stepper.querySelectorAll('.form__stepper__step').forEach(btn => {
			btn.addEventListener('click', () => {
				const targetStep = parseInt(btn.dataset.step, 10);
				if (targetStep < this._wizard.current) {
					this.goToStep(targetStep);
				}
			});
		});
	}

	/**
	 * Bind next/prev buttons inside wizard steps.
	 * @private
	 */
	_bindWizardNav() {
		this.element.querySelectorAll('[data-wizard-next]').forEach(btn => {
			const handler = (e) => {
				e.preventDefault();
				this.nextStep();
			};
			btn.addEventListener('click', handler);
			this._handlers.push({ element: btn, type: 'click', handler });
		});

		this.element.querySelectorAll('[data-wizard-prev]').forEach(btn => {
			const handler = (e) => {
				e.preventDefault();
				this.prevStep();
			};
			btn.addEventListener('click', handler);
			this._handlers.push({ element: btn, type: 'click', handler });
		});
	}

	/**
	 * Validate all fields in the current wizard step.
	 * @returns {boolean}
	 */
	validateCurrentStep() {
		if (!this._wizard) return true;

		const currentStep = this._wizard.steps[this._wizard.current];
		const stepFields = Array.from(currentStep.querySelectorAll('input, select, textarea'))
			.filter(f => !f.disabled && !f.readOnly);

		let stepValid = true;
		stepFields.forEach(field => {
			this._touched.add(field);
			const valid = this.validateField(field);
			if (!valid) stepValid = false;
		});

		// Validate groups within the step
		this.groups.forEach(({ element: group }) => {
			if (currentStep.contains(group)) {
				const valid = this.validateGroup(group);
				if (!valid) stepValid = false;
			}
		});

		return stepValid;
	}

	/**
	 * Move to the next wizard step if current is valid.
	 */
	nextStep() {
		if (!this._wizard) return;

		const isValid = this.validateCurrentStep();
		if (!isValid) {
			if (this.options.focusFirstError) this._focusFirstError();
			return;
		}

		if (this._wizard.current < this._wizard.total - 1) {
			this.goToStep(this._wizard.current + 1);
		}
	}

	/**
	 * Move to the previous wizard step.
	 */
	prevStep() {
		if (!this._wizard || this._wizard.current <= 0) return;
		this.goToStep(this._wizard.current - 1);
	}

	/**
	 * Go to a specific wizard step.
	 * @param {number} index
	 */
	goToStep(index) {
		if (!this._wizard || index < 0 || index >= this._wizard.total) return;

		const { steps } = this._wizard;

		// Hide current
		steps[this._wizard.current].style.display = 'none';

		// Show target
		steps[index].style.display = '';
		this._wizard.current = index;

		this._updateWizardUI();

		// Scroll to top of form
		this.element.scrollIntoView({ behavior: 'smooth', block: 'start' });

		EventManager.dispatch(this.element, 'wizard:stepChange', {
			form: this,
			step: index,
			total: this._wizard.total,
			isLast: index === this._wizard.total - 1
		});
	}

	/**
	 * Update stepper UI to reflect current state.
	 * @private
	 */
	_updateWizardUI() {
		if (!this._wizard) return;

		const stepper = qs('.form__stepper', this.element);
		if (!stepper) return;

		const buttons = stepper.querySelectorAll('.form__stepper__step');
		buttons.forEach((btn, i) => {
			removeClass(btn, 'is-active', 'is-completed', 'is-visited');

			if (i === this._wizard.current) {
				addClass(btn, 'is-active');
				btn.setAttribute('aria-current', 'step');
			} else if (i < this._wizard.current) {
				addClass(btn, 'is-completed is-visited');
				btn.removeAttribute('aria-current');
			} else {
				btn.removeAttribute('aria-current');
			}
		});

		// Update step actions visibility
		this._wizard.steps.forEach((step, i) => {
			const prevBtn = step.querySelector('[data-wizard-prev]');
			const nextBtn = step.querySelector('[data-wizard-next]');
			const submitBtn = step.querySelector('[type="submit"]');

			if (prevBtn) prevBtn.style.display = i === 0 ? 'none' : '';
			if (nextBtn) nextBtn.style.display = i === this._wizard.total - 1 ? 'none' : '';
			if (submitBtn) submitBtn.style.display = i === this._wizard.total - 1 ? '' : 'none';
		});
	}

	// ================================
	// Autosave
	// ================================

	/**
	 * Initialize autosave if data-form-autosave is set.
	 * Supports "localStorage" or "sessionStorage".
	 * @private
	 */
	_initAutosave() {
		const storageType = this.element.dataset.formAutosave;
		if (!storageType) return;

		const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
		const key = this.element.dataset.formAutosaveKey || `form-draft-${this.element.id || 'default'}`;
		const interval = parseInt(this.element.dataset.formAutosaveInterval, 10) || 30000;

		this._autosave = { storage, key, interval };

		// Restore draft on init
		this._restoreDraft();

		// Create status indicator
		this._initAutosaveStatus();
	}

	/**
	 * Trigger an autosave after the configured debounce.
	 * @private
	 */
	_triggerAutosave() {
		if (!this._autosave) return;

		clearTimeout(this._autosaveTimer);
		this._autosaveTimer = setTimeout(() => {
			this._saveDraft();
		}, this._autosave.interval);
	}

	/**
	 * Save current form data to storage.
	 * @private
	 */
	_saveDraft() {
		if (!this._autosave) return;

		const data = {};
		this.fields.forEach(field => {
			if (field.type === 'checkbox' || field.type === 'radio') {
				data[field.name || field.id] = field.checked;
			} else if (field.type === 'file') {
				// Files cannot be serialized; skip
			} else {
				data[field.name || field.id] = field.value;
			}
		});

		try {
			this._autosave.storage.setItem(this._autosave.key, JSON.stringify({
				timestamp: Date.now(),
				data
			}));
			this._showAutosaveStatus('Draft saved');

			EventManager.dispatch(this.element, 'form:autosaved', {
				form: this,
				key: this._autosave.key
			});
		} catch (e) {
			console.warn('[Form] Autosave failed:', e);
		}
	}

	/**
	 * Restore draft from storage on initialization.
	 * @private
	 */
	_restoreDraft() {
		if (!this._autosave) return;

		try {
			const raw = this._autosave.storage.getItem(this._autosave.key);
			if (!raw) return;

			const draft = JSON.parse(raw);
			if (!draft.data) return;

			// Check if draft is too old (optional: data-form-autosave-max-age in hours)
			const maxAge = parseInt(this.element.dataset.formAutosaveMaxAge, 10);
			if (maxAge) {
				const ageHours = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
				if (ageHours > maxAge) {
					this._autosave.storage.removeItem(this._autosave.key);
					return;
				}
			}

			Object.entries(draft.data).forEach(([name, value]) => {
				const field = this.fields.find(f => f.name === name || f.id === name);
				if (!field) return;

				if (field.type === 'checkbox' || field.type === 'radio') {
					field.checked = value;
				} else if (field.type !== 'file') {
					field.value = value;
					// Trigger input event so masks and validation update
					field.dispatchEvent(new Event('input', { bubbles: true }));
				}
			});

			this._showAutosaveStatus('Draft restored');

			EventManager.dispatch(this.element, 'form:draftRestored', {
				form: this,
				key: this._autosave.key,
				timestamp: draft.timestamp
			});
		} catch (e) {
			console.warn('[Form] Draft restore failed:', e);
		}
	}

	/**
	 * Clear the saved draft from storage.
	 * Called automatically on successful submit.
	 */
	clearDraft() {
		if (!this._autosave) return;
		this._autosave.storage.removeItem(this._autosave.key);
		this._showAutosaveStatus('Draft cleared');
	}

	/**
	 * Create or update the autosave status text element.
	 * @private
	 */
	_initAutosaveStatus() {
		let status = qs('.form__autosave-status', this.element);
		if (!status) {
			status = createElement('span', 'form__autosave-status');
			const actions = qs('.form__actions', this.element);
			if (actions) {
				actions.insertBefore(status, actions.firstChild);
			} else {
				this.element.appendChild(status);
			}
		}
	}

	/**
	 * Show a transient autosave status message.
	 * @param {string} message
	 * @private
	 */
	_showAutosaveStatus(message) {
		const status = qs('.form__autosave-status', this.element);
		if (!status) return;

		status.textContent = message;
		addClass(status, 'is-visible');

		clearTimeout(this._autosaveStatusTimer);
		this._autosaveStatusTimer = setTimeout(() => {
			removeClass(status, 'is-visible');
		}, 3000);
	}

	// ================================
	// Async Remote Validation
	// ================================

	async _validateAsync(field) {
		const endpoint = field.dataset.validateAsync;
		if (!endpoint) return { valid: true };

		const value = field.value.trim();
		const minLength = parseInt(field.dataset.validateAsyncMinlength, 10) || 3;

		if (value.length < minLength) {
			return { valid: true };
		}

		const prevController = this._asyncControllers.get(field);
		if (prevController) prevController.abort();

		const controller = new AbortController();
		this._asyncControllers.set(field, controller);

		const group = field.closest('.form__group');
		addClass(group, 'is-validating-async');

		const method = (field.dataset.validateAsyncMethod || 'GET').toUpperCase();
		const paramName = field.dataset.validateAsyncParam || 'value';

		try {
			let url = endpoint;
			let options = {
				method,
				signal: controller.signal,
				headers: { 'Accept': 'application/json' }
			};

			if (method === 'GET') {
				const sep = endpoint.includes('?') ? '&' : '?';
				url = `${endpoint}${sep}${encodeURIComponent(paramName)}=${encodeURIComponent(value)}`;
			} else {
				const body = new FormData();
				body.append(paramName, value);
				options.body = body;
			}

			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result = await response.json();

			removeClass(group, 'is-validating-async');
			this._asyncControllers.delete(field);

			return {
				valid: result.valid !== false,
				message: result.message || field.dataset.errorAsync || 'This value is not available'
			};
		} catch (err) {
			removeClass(group, 'is-validating-async');
			this._asyncControllers.delete(field);

			if (err.name === 'AbortError') {
				return { valid: true };
			}

			console.warn('[Form] Async validation failed:', err);
			return { valid: true };
		}
	}

	// ================================
	// Field Validation
	// ================================

	async validateField(field) {
		const group = field.closest('.form__group');

		if (!this._shouldValidateField(field)) {
			this._clearError(field, group);
			field.setAttribute('aria-invalid', 'false');
			return true;
		}

		const value = field.value;
		let isValid = true;
		let firstError = '';

		// 1. Native constraint validation
		if (!field.checkValidity()) {
			isValid = false;
			firstError = field.validationMessage || 'Invalid value';
		}

		// 2. Data-attribute rules
		if (isValid) {
			for (const [ruleName, validator] of Object.entries(BUILT_IN_RULES)) {
				const attrName = `data-validate-${ruleName}`;
				if (field.hasAttribute(attrName)) {
					const param = field.getAttribute(attrName);
					const result = validator(value, field, param);
					if (!result.valid) {
						isValid = false;
						const customMsg = field.getAttribute(`data-error-${ruleName}`);
						firstError = customMsg || result.message || 'Invalid value';
						break;
					}
				}
			}
		}

		// 3. Async remote validation
		if (isValid && field.dataset.validateAsync) {
			const asyncResult = await this._validateAsync(field);
			if (!asyncResult.valid) {
				isValid = false;
				firstError = asyncResult.message;
			}
		}

		// 4. Apply visual state
		if (isValid) {
			this._clearError(field, group);
		} else {
			this._showError(field, group, firstError);
		}

		field.setAttribute('aria-invalid', String(!isValid));

		EventManager.dispatch(field, 'form:fieldValidated', {
			form: this,
			field,
			valid: isValid,
			message: firstError
		});

		return isValid;
	}

	// ================================
	// Group Validation
	// ================================

	validateGroup(group) {
		const groupData = this.groups.find(g => g.element === group);
		if (!groupData) return true;

		const { fields } = groupData;
		let isValid = true;
		let firstError = '';

		const ruleMap = [
			{ name: 'required', attr: 'data-validate-group' },
			{ name: 'minChecked', attr: 'data-validate-group-min' },
			{ name: 'maxChecked', attr: 'data-validate-group-max' }
		];

		for (const { name, attr } of ruleMap) {
			if (!group.hasAttribute(attr)) continue;
			const param = group.getAttribute(attr);
			const validator = GROUP_RULES[name];
			if (!validator) continue;

			const result = validator(group, fields, param);
			if (!result.valid) {
				isValid = false;
				firstError = result.message;
				break;
			}
		}

		if (isValid) {
			this._clearGroupError(group);
		} else {
			this._showGroupError(group, firstError);
		}

		EventManager.dispatch(group, 'form:groupValidated', {
			form: this,
			group,
			valid: isValid,
			message: firstError
		});

		return isValid;
	}

	_showGroupError(group, message) {
		addClass(group, this.options.errorClass);
		removeClass(group, this.options.validClass);

		let errorEl = qs('.form__error', group);
		if (!errorEl) {
			errorEl = createElement('span', 'form__error', {
				id: `${group.id || 'group'}-${Math.random().toString(36).slice(2, 7)}-error`,
				'aria-live': 'polite'
			});
			group.appendChild(errorEl);
		}
		errorEl.textContent = message;
	}

	_clearGroupError(group) {
		removeClass(group, this.options.errorClass);
		addClass(group, this.options.validClass);

		const errorEl = qs('.form__error', group);
		if (errorEl) errorEl.textContent = '';
	}

	// ================================
	// Form-level Validation
	// ================================

	async validateForm() {
		let allValid = true;

		for (const field of this.fields) {
			const valid = await this.validateField(field);
			if (!valid) allValid = false;
		}

		this.groups.forEach(({ element: group }) => {
			const valid = this.validateGroup(group);
			if (!valid) allValid = false;
		});

		this.fields.forEach(f => this._touched.add(f));
		this.groups.forEach(g => this._touched.add(g.element));

		EventManager.dispatch(this.element, 'form:validated', {
			form: this,
			valid: allValid
		});

		return allValid;
	}

	// ================================
	// Error Display
	// ================================

	_showError(field, group, message) {
		addClass(group, this.options.errorClass);
		removeClass(group, this.options.validClass);

		const errorEl = qs('.form__error', group);
		if (errorEl) errorEl.textContent = message;
	}

	_clearError(field, group) {
		removeClass(group, this.options.errorClass);
		addClass(group, this.options.validClass);

		const errorEl = qs('.form__error', group);
		if (errorEl) errorEl.textContent = '';
	}

	// ================================
	// Summary
	// ================================

	showSummary(type, message) {
		if (!this.options.showSummary) return;

		const summary = qs(this.options.summarySelector, this.element);
		if (!summary) return;

		removeClass(summary, 'form__summary--error', 'form__summary--success');
		addClass(summary, `form__summary--${type}`);
		summary.textContent = message;
		addClass(summary, 'is-visible');
	}

	hideSummary() {
		const summary = qs(this.options.summarySelector, this.element);
		if (summary) removeClass(summary, 'is-visible');
	}

	// ================================
	// Submit & Reset
	// ================================

	_bindSubmit() {
		const handler = (e) => this._handleSubmit(e);
		this.element.addEventListener('submit', handler);
		this._handlers.push({ element: this.element, type: 'submit', handler });
	}

	async _handleSubmit(e) {
		this.hideSummary();

		if (this.options.validateOnSubmit) {
			const isValid = await this.validateForm();

			if (!isValid) {
				e.preventDefault();
				e.stopPropagation();

				if (this.options.focusFirstError) {
					this._focusFirstError();
				}

				this.showSummary('error', 'Please correct the errors below before submitting.');
				EventManager.dispatch(this.element, 'form:submitPrevented', { form: this });
				return;
			}
		}

		// Wizard: on final step submit, or regular form
		if (this.element.dataset.form === 'async') {
			e.preventDefault();
			e.stopPropagation();

			EventManager.dispatch(this.element, 'form:submit', {
				form: this,
				data: new FormData(this.element)
			});
			return;
		}

		// Clear draft on successful submit
		this.clearDraft();

		EventManager.dispatch(this.element, 'form:submit', {
			form: this,
			data: new FormData(this.element)
		});
	}

	_focusFirstError() {
		const firstInvalidField = this.fields.find(f => {
			const g = f.closest('.form__group');
			return g && g.classList.contains(this.options.errorClass);
		});

		const firstInvalidGroup = this.groups.find(g =>
			g.element.classList.contains(this.options.errorClass)
		)?.element;

		const target = firstInvalidField || firstInvalidGroup;
		if (!target) return;

		if (this.options.scrollToError) {
			target.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		setTimeout(() => {
			if (typeof target.focus === 'function') {
				target.focus();
			} else {
				const focusable = target.querySelector(
					'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
				);
				focusable?.focus();
			}

			const errorEl = qs('.form__error', target.closest('.form__group, fieldset'));
			if (errorEl && errorEl.textContent) {
				errorEl.setAttribute('role', 'alert');
				setTimeout(() => errorEl.removeAttribute('role'), 1000);
			}
		}, this.options.scrollToError ? 150 : 0);
	}

	_bindReset() {
		const handler = () => this.reset();
		this.element.addEventListener('reset', handler);
		this._handlers.push({ element: this.element, type: 'reset', handler });
	}

	reset() {
		this._touched.clear();
		this.hideSummary();

		this.fields.forEach(field => {
			const group = field.closest('.form__group');
			if (group) {
				removeClass(group, this.options.errorClass, this.options.validClass, this.options.dirtyClass);
			}
			field.setAttribute('aria-invalid', 'false');
		});

		this.groups.forEach(({ element: group }) => {
			removeClass(group, this.options.errorClass, this.options.validClass, this.options.dirtyClass);
			const errorEl = qs('.form__error', group);
			if (errorEl) errorEl.textContent = '';
		});

		// Reset wizard to first step
		if (this._wizard) {
			this.goToStep(0);
		}

		// Clear file previews
		this.element.querySelectorAll('.form__file-preview').forEach(p => {
			p.innerHTML = '';
			p.style.display = 'none';
		});

		this._updateProgress();
		this._triggerAutosave();

		EventManager.dispatch(this.element, 'form:reset', { form: this });
	}

	// ================================
	// Character Counter
	// ================================

	_updateCounter(field) {
		const max = field.dataset.maxlength || field.maxLength;
		const counter = qs('.form__counter', field.closest('.form__group'));
		if (!counter || !max || max === '-1') return;

		const current = field.value.length;
		counter.textContent = `${current} / ${max}`;
		toggleClass(counter, 'is-exceeded', current > parseInt(max, 10));
	}

	// ================================
	// Utilities
	// ================================

	setFieldError(name, message) {
		const field = this.fields.find(f => f.name === name || f.id === name);
		if (!field) return;

		const group = field.closest('.form__group');
		this._touched.add(field);
		this._showError(field, group, message);
		field.setAttribute('aria-invalid', 'true');
	}

	clearFieldError(name) {
		const field = this.fields.find(f => f.name === name || f.id === name);
		if (!field) return;

		const group = field.closest('.form__group');
		this._clearError(field, group);
		field.setAttribute('aria-invalid', 'false');
	}

	getData() {
		const data = {};
		const formData = new FormData(this.element);
		formData.forEach((value, key) => {
			if (data[key] !== undefined) {
				if (!Array.isArray(data[key])) data[key] = [data[key]];
				data[key].push(value);
			} else {
				data[key] = value;
			}
		});
		return data;
	}

	getMaskedRawValues() {
		const raw = {};
		this.fields.forEach(field => {
			if (field.dataset.maskRaw !== undefined) {
				raw[field.name || field.id] = field.dataset.maskRaw;
			}
		});
		return raw;
	}

	// ================================
	// Destroy
	// ================================

	destroy() {
		this._handlers.forEach(({ element, type, handler }) => {
			element.removeEventListener(type, handler);
		});
		this._handlers = [];

		this._groupHandlers.forEach(({ fields, handler }) => {
			fields.forEach(f => {
				f.removeEventListener('change', handler);
				f.removeEventListener('input', handler);
			});
		});
		this._groupHandlers = [];

		this._masks.forEach(mask => mask.destroy());
		this._masks = [];

		this._asyncControllers.forEach(ctrl => ctrl.abort());
		this._asyncControllers.clear();

		clearTimeout(this._autosaveTimer);
		clearTimeout(this._autosaveStatusTimer);

		this.fields = [];
		this.groups = [];
	}
}