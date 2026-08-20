// ==========================================
// Модуль управления темой
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs } from '../../utilities/_dom.js';

export class ThemeManager {
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

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? this.config.darkValue
            : this.config.lightValue;
    }

    getStoredTheme() {
        try {
            return localStorage.getItem(this.config.themeKey);
        } catch (e) {
            return null;
        }
    }

    getCurrentTheme() {
        const stored = this.getStoredTheme();
        if (stored) return stored;
        return this.getSystemTheme();
    }

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

    setTheme(theme) {
        return this.applyTheme(theme);
    }

    toggleTheme() {
        const next = this.currentTheme === this.config.darkValue
            ? this.config.lightValue
            : this.config.darkValue;
        return this.applyTheme(next);
    }

    updateUI(theme) {
        if (!this.toggleButton) return;

        const isDark = theme === this.config.darkValue;
        const icon = this.toggleButton.querySelector('[data-theme-icon]');
        const text = this.toggleButton.querySelector('[data-theme-text]');

        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        if (text) text.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';

        this.toggleButton.setAttribute('aria-label',
            isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'
        );
        this.toggleButton.classList.toggle('is-dark', isDark);
        this.toggleButton.classList.toggle('is-light', !isDark);
    }

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