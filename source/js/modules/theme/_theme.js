// ==========================================
// Theme Manager (Switch Edition)
// ==========================================
// Class-driven UI, checkbox-based switch,
// prefers-reduced-motion support, proper cleanup.
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs } from '../../utilities/_dom.js';

export class ThemeManager {
	/**
	 * @param {Object} options
	 * @param {string} options.themeKey        – localStorage key
	 * @param {string} options.themeAttr       – data attribute on root
	 * @param {string} options.darkValue       – dark theme value
	 * @param {string} options.lightValue      – light theme value
	 * @param {string} options.systemValue     – system/auto value
	 * @param {string} options.toggleSelector  – wrapper with input[type="checkbox"]
	 * @param {string} options.rootSelector    – root element (default: html)
	 */
	constructor(options = {}) {
		this.config = {
			themeKey: options.themeKey || CONFIG.THEME_KEY,
			themeAttr: options.themeAttr || CONFIG.ATTR.THEME,
			darkValue: options.darkValue || 'dark',
			lightValue: options.lightValue || 'light',
			systemValue: options.systemValue || 'system',
			toggleSelector: options.toggleSelector || '[data-theme-toggle]',
			rootSelector: options.rootSelector || 'html',
			...options
		};

		this.root = qs(this.config.rootSelector) || document.documentElement;
		this.toggleWrapper = qs(this.config.toggleSelector);
		this.toggleInput = this.toggleWrapper?.querySelector('input[type="checkbox"]');

		this._systemMQ = window.matchMedia('(prefers-color-scheme: dark)');
		this._onSystemChange = this._handleSystemChange.bind(this);
		this._onToggleChange = this._handleToggleChange.bind(this);

		this._choice = null;    // что выбрал пользователь: dark | light | system
		this._effective = null; // что реально применено: dark | light

		this.init();
	}

	// ─── Public API ───

	init() {
		const stored = this._getStored();
		this.apply(stored || this.config.systemValue, { silent: true });
		this._bind();
	}

	/** User's explicit choice (dark | light | system). */
	get choice() {
		return this._choice;
	}

	/** Effective theme right now (dark | light). */
	get effective() {
		return this._effective;
	}

	get isDark() {
		return this._effective === this.config.darkValue;
	}

	get isLight() {
		return this._effective === this.config.lightValue;
	}

	/**
	 * Apply a theme choice.
	 * @param {string} theme – 'dark' | 'light' | 'system'
	 * @param {boolean} silent – skip dispatching event
	 * @returns {string} effective theme
	 */
	apply(theme, { silent = false } = {}) {
		const isSystem = theme === this.config.systemValue;
		const effective = isSystem ? this._getSystemTheme() : theme;

		// Guard: don't thrash DOM if nothing changed
		if (this._choice === theme && this._effective === effective) {
			return effective;
		}

		this._choice = theme;
		this._effective = effective;

		// Persist
		if (isSystem) {
			try { localStorage.removeItem(this.config.themeKey); } catch {}
		} else {
			try { localStorage.setItem(this.config.themeKey, theme); } catch {}
		}

		// Apply to DOM
		this.root.setAttribute(this.config.themeAttr, effective);
		this.root.classList.remove(this.config.lightValue, this.config.darkValue);
		this.root.classList.add(effective);

		// Sync UI (classes + checked only)
		this._syncUI();

		if (!silent) {
			EventManager.dispatch(this.root, 'theme:changed', {
				effective,
				choice: theme,
				isDark: this.isDark,
				isSystem: isSystem
			});
		}

		return effective;
	}

	/** Alias for apply(). */
	set(theme) {
		return this.apply(theme);
	}

	/** Toggle light ↔ dark. */
	toggle() {
		const next = this.isDark ? this.config.lightValue : this.config.darkValue;
		return this.apply(next);
	}

	/** Return to system preference. */
	reset() {
		return this.apply(this.config.systemValue);
	}

	destroy() {
		this._systemMQ.removeEventListener('change', this._onSystemChange);
		if (this.toggleInput) {
			this.toggleInput.removeEventListener('change', this._onToggleChange);
		}
	}

	// ─── Private ───

	_getSystemTheme() {
		return this._systemMQ.matches ? this.config.darkValue : this.config.lightValue;
	}

	_getStored() {
		try {
			return localStorage.getItem(this.config.themeKey);
		} catch {
			return null;
		}
	}

	_handleSystemChange() {
		const stored = this._getStored();
		if (!stored || stored === this.config.systemValue) {
			this.apply(this.config.systemValue, { silent: true });
		}
	}

	_handleToggleChange(e) {
		const desired = e.target.checked ? this.config.darkValue : this.config.lightValue;
		this.apply(desired);
	}

	_syncUI() {
		const isDark = this.isDark;

		// Sync checkbox without firing extra events
		if (this.toggleInput && this.toggleInput.checked !== isDark) {
			this.toggleInput.checked = isDark;
		}
		if (this.toggleInput) {
			this.toggleInput.setAttribute('aria-checked', String(isDark));
		}

		// Classes for CSS animations
		if (this.toggleWrapper) {
			this.toggleWrapper.classList.toggle('is-dark', isDark);
			this.toggleWrapper.classList.toggle('is-light', !isDark);
			this.toggleWrapper.classList.toggle('is-system', this._choice === this.config.systemValue);
		}
	}

	_bind() {
		this._systemMQ.addEventListener('change', this._onSystemChange);
		if (this.toggleInput) {
			this.toggleInput.addEventListener('change', this._onToggleChange);
		}
	}
}