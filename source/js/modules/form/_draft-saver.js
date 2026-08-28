// ==========================================
// Draft Saver Component
// ==========================================
// Auto-saves form data to localStorage with
// debounce, restore on load, and visual status.
// Integrates with the Form validation engine.
// ==========================================

import { qs, qsa, addClass, removeClass, toggleClass } from '../../utilities/_dom.js';
import { EventManager } from '../../core/_index.js';

/**
 * Serialize form data to a plain object.
 * Handles text inputs, checkboxes, radio buttons, selects, and file names.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function serializeForm(form) {
	const data = {};
	const elements = form.querySelectorAll('input, select, textarea');

	elements.forEach(el => {
		if (el.disabled || !el.name) return;

		const key = el.name;

		if (el.type === 'checkbox') {
			if (el.checked) {
				if (data[key]) {
					if (!Array.isArray(data[key])) data[key] = [data[key]];
					data[key].push(el.value);
				} else {
					data[key] = el.value;
				}
			}
		} else if (el.type === 'radio') {
			if (el.checked) {
				data[key] = el.value;
			}
		} else if (el.type === 'file') {
			// Store file names only — actual files cannot be serialized
			if (el.files && el.files.length) {
				data[key] = Array.from(el.files).map(f => f.name);
			}
		} else {
			data[key] = el.value;
		}
	});

	return data;
}

/**
 * Deserialize data back into a form.
 * @param {HTMLFormElement} form
 * @param {Object} data
 */
function deserializeForm(form, data) {
	Object.entries(data).forEach(([key, value]) => {
		const fields = form.querySelectorAll(`[name="${key}"]`);
		if (fields.length === 0) return;

		const firstField = fields[0];

		if (firstField.type === 'checkbox') {
			const values = Array.isArray(value) ? value : [value];
			fields.forEach(field => {
				field.checked = values.includes(field.value);
			});
		} else if (firstField.type === 'radio') {
			fields.forEach(field => {
				field.checked = field.value === value;
			});
		} else if (firstField.type === 'file') {
			// Cannot restore actual files — show a hint instead
			const hint = qs('.draft-saver__file-hint', firstField.closest('.form__group'));
			if (hint) {
				const fileNames = Array.isArray(value) ? value : [value];
				hint.textContent = `Previously selected: ${fileNames.join(', ')}`;
				addClass(hint, 'is-visible');
			}
		} else {
			firstField.value = value;
		}
	});
}

export class DraftSaver {
	/**
	 * @param {HTMLFormElement} form
	 * @param {Object} options
	 * @param {string}  options.storageKey      – localStorage key (default: auto-generated from form id/action)
	 * @param {number}  options.debounceDelay   – ms delay before saving (default: 1000)
	 * @param {boolean} options.restoreOnLoad   – restore draft on initialization (default: true)
	 * @param {boolean} options.clearOnSubmit   – clear draft after successful submit (default: true)
	 * @param {string}  options.statusSelector  – selector for status indicator
	 * @param {string}  options.savedText       – text shown when saved (default: 'Draft saved')
	 * @param {string}  options.dirtyText       – text shown when unsaved (default: 'Unsaved changes')
	 */
	constructor(form, options = {}) {
		this.form = form;
		this.options = {
			storageKey: options.storageKey || this._generateStorageKey(),
			debounceDelay: options.debounceDelay || 1000,
			restoreOnLoad: options.restoreOnLoad !== false,
			clearOnSubmit: options.clearOnSubmit !== false,
			statusSelector: options.statusSelector || '[data-draft-status]',
			savedText: options.savedText || 'Draft saved',
			dirtyText: options.dirtyText || 'Unsaved changes',
			...options
		};

		this._saveTimer = null;
		this._handlers = [];

		this.init();
	}

	_generateStorageKey() {
		const id = this.form.id || 'form';
		const action = this.form.action || '';
		return `core4_draft_${id}_${action}`.replace(/[^a-z0-9_]/gi, '_');
	}

	init() {
		this._bindInput();
		this._bindSubmit();
		this._initStatus();

		if (this.options.restoreOnLoad) {
			this.restore();
		}

		EventManager.dispatch(this.form, 'draft:initialized', { saver: this });
	}

	// ================================
	// Status Indicator
	// ================================

	_initStatus() {
		this._statusEl = qs(this.options.statusSelector, this.form);
		if (!this._statusEl) return;
		this._setStatus('saved');
	}

	_setStatus(state) {
		if (!this._statusEl) return;
		removeClass(this._statusEl, 'is-saved', 'is-dirty');

		if (state === 'saved') {
			addClass(this._statusEl, 'is-saved');
			this._statusEl.textContent = this.options.savedText;
		} else if (state === 'dirty') {
			addClass(this._statusEl, 'is-dirty');
			this._statusEl.textContent = this.options.dirtyText;
		}
	}

	// ================================
	// Auto-save
	// ================================

	_bindInput() {
		const handler = () => this._markDirty();

		this.form.querySelectorAll('input, select, textarea').forEach(el => {
			el.addEventListener('input', handler);
			el.addEventListener('change', handler);
			this._handlers.push(
				{ element: el, type: 'input', handler },
				{ element: el, type: 'change', handler }
			);
		});
	}

	_markDirty() {
		this._setStatus('dirty');

		clearTimeout(this._saveTimer);
		this._saveTimer = setTimeout(() => {
			this.save();
		}, this.options.debounceDelay);
	}

	_bindSubmit() {
		const handler = () => {
			if (this.options.clearOnSubmit) {
				this.clear();
			}
		};
		this.form.addEventListener('submit', handler);
		this._handlers.push({ element: this.form, type: 'submit', handler });
	}

	// ================================
	// Storage
	// ================================

	save() {
		try {
			const data = serializeForm(this.form);
			const payload = {
				timestamp: Date.now(),
				data
			};
			localStorage.setItem(this.options.storageKey, JSON.stringify(payload));
			this._setStatus('saved');

			EventManager.dispatch(this.form, 'draft:saved', { saver: this, data });
		} catch (err) {
			console.warn('[DraftSaver] Failed to save draft:', err);
		}
	}

	restore() {
		try {
			const raw = localStorage.getItem(this.options.storageKey);
			if (!raw) return false;

			const payload = JSON.parse(raw);
			if (!payload || !payload.data) return false;

			deserializeForm(this.form, payload.data);
			this._setStatus('saved');

			EventManager.dispatch(this.form, 'draft:restored', {
				saver: this,
				data: payload.data,
				timestamp: payload.timestamp
			});

			return true;
		} catch (err) {
			console.warn('[DraftSaver] Failed to restore draft:', err);
			return false;
		}
	}

	clear() {
		try {
			localStorage.removeItem(this.options.storageKey);
			this._setStatus('saved');

			// Clear file hints
			this.form.querySelectorAll('.draft-saver__file-hint').forEach(hint => {
				hint.textContent = '';
				removeClass(hint, 'is-visible');
			});

			EventManager.dispatch(this.form, 'draft:cleared', { saver: this });
		} catch (err) {
			console.warn('[DraftSaver] Failed to clear draft:', err);
		}
	}

	/**
	 * Get the age of the current draft in milliseconds.
	 * @returns {number|null}
	 */
	getDraftAge() {
		try {
			const raw = localStorage.getItem(this.options.storageKey);
			if (!raw) return null;
			const payload = JSON.parse(raw);
			return payload.timestamp ? Date.now() - payload.timestamp : null;
		} catch {
			return null;
		}
	}

	destroy() {
		clearTimeout(this._saveTimer);
		this._handlers.forEach(({ element, type, handler }) => {
			element.removeEventListener(type, handler);
		});
		this._handlers = [];
	}
}