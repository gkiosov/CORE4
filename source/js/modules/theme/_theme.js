// ==========================================
// Theme Manager
// ==========================================
// Handles light/dark/system theme switching,
// localStorage persistence, system preference sync,
// and toggle-button UI updates.
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs } from '../../utilities/_dom.js';

export class ThemeManager {
	/**
	 * @param {Object} options
	 * @param {string} options.themeKey	       – localStorage key
	 * @param {string} options.themeAttr       – data attribute on <html>
	 * @param {string} options.darkValue       – dark theme value
	 * @param {string} options.lightValue      – light theme value
	 * @param {string} options.systemValue     – system/auto value
	 * @param {string} options.toggleSelector  – CSS selector for toggle button
	 */
	constructor(options = {}) {
		this.config = {
			themeKey: options.themeKey || CONFIG.THEME_KEY,
			themeAttr: options.themeAttr || CONFIG.ATTR.THEME,
			darkValue: options.darkValue || 'dark',
			lightValue: options.lightValue || 'light',
			systemValue: options.systemValue || 'system',
			toggleSelector: options.toggleSelector || '#theme-toggle',
			...options
		};

		this.root = document.documentElement;
		this.toggleButton = qs(this.config.toggleSelector);
		this.currentTheme = null;
		this._systemListener = null;

		this.init();
	}

	init() {
		this.currentTheme = this.getCurrentTheme();
		this.applyTheme(this.currentTheme);
		this.bindEvents();
	}

	/** Detect the user's OS-level color scheme preference. */
	getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? this.config.darkValue
			: this.config.lightValue;
	}

	/** Read the persisted theme from localStorage. */
	getStoredTheme() {
		try {
			return localStorage.getItem(this.config.themeKey);
		} catch (e) {
			return null;
		}
	}

	/** Determine the effective theme: stored → system fallback. */
	getCurrentTheme() {
		const stored = this.getStoredTheme();
		if (stored) return stored;
		return this.getSystemTheme();
	}

	/**
	 * Apply a theme and persist the choice.
	 * @param {string} theme  – 'dark' | 'light' | 'system'
	 * @returns {string}      – the effective theme applied
	 */
	applyTheme(theme) {
		const isSystem = theme === this.config.systemValue;
		const effectiveTheme = isSystem ? this.getSystemTheme() : theme;

		this.root.setAttribute(this.config.themeAttr, effectiveTheme);
		this.currentTheme = theme;

		if (isSystem) {
			try { localStorage.removeItem(this.config.themeKey); } catch (e) {}
		} else {
			try { localStorage.setItem(this.config.themeKey, theme); } catch (e) {}
		}

		this.updateUI(effectiveTheme);

		EventManager.dispatch(this.root, 'theme:changed', {
			theme: effectiveTheme,
			choice: theme
		});

		return effectiveTheme;
	}

	/** Alias for applyTheme(). */
	setTheme(theme) {
		return this.applyTheme(theme);
	}

	/** Toggle between light and dark. */
	toggleTheme() {
		const next = this.currentTheme === this.config.darkValue
			? this.config.lightValue
			: this.config.darkValue;
		return this.applyTheme(next);
	}

	/**
	 * Update toggle button icon, text, and ARIA labels.
	 * @param {string} theme  – effective theme
	 */
	updateUI(theme) {
		if (!this.toggleButton) return;

		const isDark = theme === this.config.darkValue;
		const icon = this.toggleButton.querySelector('[data-theme-icon]');
		const text = this.toggleButton.querySelector('[data-theme-text]');

		if (icon) icon.textContent = isDark ? '☀️' : '🌙';
		if (text) text.textContent = isDark ? 'Light theme' : 'Dark theme';

		this.toggleButton.setAttribute('aria-label',
			isDark ? 'Switch to light theme' : 'Switch to dark theme'
		);
		this.toggleButton.classList.toggle('is-dark', isDark);
		this.toggleButton.classList.toggle('is-light', !isDark);
	}

	/** Bind click and system-preference-change listeners. */
	bindEvents() {
		if (this.toggleButton) {
			this.toggleButton.addEventListener('click', () => this.toggleTheme());
		}

		this._systemListener = (e) => {
			const stored = this.getStoredTheme();
			if (!stored) {
				const newTheme = e.matches ? this.config.darkValue : this.config.lightValue;
				this.applyTheme(newTheme);
			}
		};

		window.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', this._systemListener);
	}

	/** Remove all listeners and clean up. */
	destroy() {
		if (this._systemListener) {
			window.matchMedia('(prefers-color-scheme: dark)')
				.removeEventListener('change', this._systemListener);
		}
		if (this.toggleButton) {
			this.toggleButton.removeEventListener('click', this.toggleTheme);
		}
	}
}
