// ==========================================
// File Upload Component
// ==========================================
// Drag & drop file upload with validation
// (type, size, count), image previews, and
// seamless FormData integration.
// ==========================================

import { qs, qsa, addClass, removeClass, toggleClass, createElement } from '../../utilities/_dom.js';
import { EventManager } from '../../core/_index.js';

/**
 * Human-readable file size formatter.
 * @param {number} bytes
 * @returns {string}
 */
function formatSize(bytes) {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export class FileUpload {
	/**
	 * @param {HTMLInputElement} input  – the file input element
	 * @param {Object} options
	 * @param {string}  options.dropzoneSelector – selector for drag & drop zone
	 * @param {string}  options.previewSelector  – selector for preview container
	 * @param {string}  options.listSelector     – selector for file list container
	 * @param {string}  options.accept           – comma-separated MIME types or extensions
	 * @param {number}  options.maxSize          – max file size in bytes
	 * @param {number}  options.minSize          – min file size in bytes
	 * @param {number}  options.maxCount         – max number of files
	 * @param {boolean} options.multiple         – allow multiple files
	 * @param {boolean} options.showPreview      – show image previews
	 * @param {string}  options.errorClass       – CSS class for invalid state
	 */
	constructor(input, options = {}) {
		this.input = input;
		this.options = {
			dropzoneSelector: options.dropzoneSelector || '[data-file-dropzone]',
			previewSelector: options.previewSelector || '[data-file-preview]',
			listSelector: options.listSelector || '[data-file-list]',
			accept: options.accept || input.getAttribute('accept') || '',
			maxSize: options.maxSize || this._parseBytes(input.dataset.fileMaxsize),
			minSize: options.minSize || this._parseBytes(input.dataset.fileMinsize),
			maxCount: options.maxCount || parseInt(input.dataset.fileMaxcount, 10) || 0,
			multiple: options.multiple !== undefined ? options.multiple : input.multiple,
			showPreview: options.showPreview !== false,
			errorClass: options.errorClass || 'is-invalid',
			...options
		};

		/** @type {File[]} */
		this.files = [];

		/** @type {string[]} */
		this.errors = [];

		this._handlers = [];

		this.init();
	}

	/**
	 * Parse human-readable size string (e.g. "5MB", "2.5 GB") to bytes.
	 * @param {string} str
	 * @returns {number|null}
	 * @private
	 */
	_parseBytes(str) {
		if (!str) return null;
		const match = str.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
		if (!match) return null;
		const size = parseFloat(match[1]);
		const unit = (match[2] || 'B').toUpperCase();
		const multipliers = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
		return size * (multipliers[unit] || 1);
	}

	init() {
		this._initDropzone();
		this._initList();
		this._bindInput();
	}

	// ================================
	// Dropzone
	// ================================

	_initDropzone() {
		const dropzone = this.input.closest(this.options.dropzoneSelector) || this.input.parentElement;
		if (!dropzone) return;

		const onDragOver = (e) => {
			e.preventDefault();
			e.stopPropagation();
			addClass(dropzone, 'is-dragover');
		};

		const onDragLeave = (e) => {
			e.preventDefault();
			e.stopPropagation();
			removeClass(dropzone, 'is-dragover');
		};

		const onDrop = (e) => {
			e.preventDefault();
			e.stopPropagation();
			removeClass(dropzone, 'is-dragover');

			const dtFiles = e.dataTransfer?.files;
			if (dtFiles && dtFiles.length) {
				this._addFiles(Array.from(dtFiles));
			}
		};

		dropzone.addEventListener('dragover', onDragOver);
		dropzone.addEventListener('dragleave', onDragLeave);
		dropzone.addEventListener('drop', onDrop);

		this._handlers.push(
			{ element: dropzone, type: 'dragover', handler: onDragOver },
			{ element: dropzone, type: 'dragleave', handler: onDragLeave },
			{ element: dropzone, type: 'drop', handler: onDrop }
		);
	}

	// ================================
	// File List
	// ================================

	_initList() {
		const listContainer = qs(this.options.listSelector, this.input.closest('.form__group'));
		if (!listContainer) return;
		this._listContainer = listContainer;
	}

	// ================================
	// Input Binding
	// ================================

	_bindInput() {
		const onChange = (e) => {
			if (e.target.files && e.target.files.length) {
				this._addFiles(Array.from(e.target.files));
			}
			// Reset input so the same file can be selected again
			e.target.value = '';
		};

		this.input.addEventListener('change', onChange);
		this._handlers.push({ element: this.input, type: 'change', handler: onChange });
	}

	// ================================
	// File Handling
	// ================================

	/**
	 * Add files after validation.
	 * @param {File[]} newFiles
	 * @private
	 */
	_addFiles(newFiles) {
		this.errors = [];

		// Check max count
		if (this.options.maxCount > 0 && this.files.length + newFiles.length > this.options.maxCount) {
			this.errors.push(`Maximum ${this.options.maxCount} file(s) allowed`);
			this._renderErrors();
			EventManager.dispatch(this.input, 'file:rejected', { upload: this, errors: this.errors });
			return;
		}

		const validFiles = [];

		for (const file of newFiles) {
			const fileErrors = this._validateFile(file);
			if (fileErrors.length === 0) {
				validFiles.push(file);
			} else {
				this.errors.push(...fileErrors);
			}
		}

		if (!this.options.multiple && validFiles.length > 0) {
			this.files = [validFiles[0]];
		} else {
			this.files.push(...validFiles);
		}

		this._syncInput();
		this._renderList();
		this._renderErrors();

		EventManager.dispatch(this.input, 'file:change', {
			upload: this,
			files: this.files,
			errors: this.errors
		});
	}

	/**
	 * Validate a single file.
	 * @param {File} file
	 * @returns {string[]} – array of error messages
	 * @private
	 */
	_validateFile(file) {
		const errors = [];

		// Type validation
		if (this.options.accept) {
			const accepted = this.options.accept.split(',').map(s => s.trim());
			const isAccepted = accepted.some(type => {
				if (type.startsWith('.')) {
					return file.name.toLowerCase().endsWith(type.toLowerCase());
				}
				if (type.endsWith('/*')) {
					return file.type.startsWith(type.replace('/*', '/'));
				}
				return file.type === type;
			});
			if (!isAccepted) {
				errors.push(`"${file.name}": Invalid file type`);
			}
		}

		// Size validation
		if (this.options.maxSize && file.size > this.options.maxSize) {
			errors.push(`"${file.name}": Exceeds maximum size of ${formatSize(this.options.maxSize)}`);
		}
		if (this.options.minSize && file.size < this.options.minSize) {
			errors.push(`"${file.name}": Smaller than minimum size of ${formatSize(this.options.minSize)}`);
		}

		return errors;
	}

	// ================================
	// Sync with native input
	// ================================

	/**
	 * Sync the managed files back to the native input
	 * via a DataTransfer so FormData picks them up.
	 * @private
	 */
	_syncInput() {
		const dt = new DataTransfer();
		this.files.forEach(f => dt.items.add(f));
		this.input.files = dt.files;
	}

	// ================================
	// Render
	// ================================

	_renderList() {
		if (!this._listContainer) return;
		this._listContainer.innerHTML = '';

		this.files.forEach((file, index) => {
			const item = createElement('div', 'file-upload__item');

			// Preview for images
			if (this.options.showPreview && file.type.startsWith('image/')) {
				const img = createElement('img', 'file-upload__thumb');
				img.src = URL.createObjectURL(file);
				img.alt = file.name;
				item.appendChild(img);
			} else {
				const icon = createElement('span', 'file-upload__icon');
				icon.textContent = '📄';
				item.appendChild(icon);
			}

			const info = createElement('div', 'file-upload__info');
			const name = createElement('span', 'file-upload__name');
			name.textContent = file.name;
			const size = createElement('span', 'file-upload__size');
			size.textContent = formatSize(file.size);
			info.appendChild(name);
			info.appendChild(size);
			item.appendChild(info);

			const removeBtn = createElement('button', 'file-upload__remove', {
				type: 'button',
				'aria-label': `Remove ${file.name}`
			});
			removeBtn.innerHTML = '&times;';
			removeBtn.addEventListener('click', () => this.removeFile(index));
			item.appendChild(removeBtn);

			this._listContainer.appendChild(item);
		});

		toggleClass(this._listContainer, 'is-empty', this.files.length === 0);
	}

	_renderErrors() {
		const group = this.input.closest('.form__group');
		if (!group) return;

		if (this.errors.length > 0) {
			addClass(group, this.options.errorClass);
			let errorEl = qs('.form__error', group);
			if (!errorEl) {
				errorEl = createElement('span', 'form__error', { 'aria-live': 'polite' });
				group.appendChild(errorEl);
			}
			errorEl.textContent = this.errors.join('. ');
		} else {
			removeClass(group, this.options.errorClass);
			const errorEl = qs('.form__error', group);
			if (errorEl) errorEl.textContent = '';
		}
	}

	// ================================
	// Public API
	// ================================

	removeFile(index) {
		const file = this.files[index];
		this.files.splice(index, 1);
		this._syncInput();
		this._renderList();

		EventManager.dispatch(this.input, 'file:remove', { upload: this, file, index });
		EventManager.dispatch(this.input, 'file:change', { upload: this, files: this.files });
	}

	clear() {
		this.files = [];
		this.errors = [];
		this._syncInput();
		this._renderList();
		this._renderErrors();
	}

	getFiles() {
		return [...this.files];
	}

	destroy() {
		this._handlers.forEach(({ element, type, handler }) => {
			element.removeEventListener(type, handler);
		});
		this._handlers = [];
		this.clear();
	}
}