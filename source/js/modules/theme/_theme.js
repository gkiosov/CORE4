// ==========================================
// Модуль управления темой
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs } from '../../utilities/_dom.js';

export class ThemeManager {
    constructor(options = {}) {
        this.config = {
            themeKey: options.themeKey || CONFIG.THEME_KEY || 'preferred-theme',
            themeAttr: options.themeAttr || CONFIG.ATTR.THEME || 'data-theme',
            darkValue: options.darkValue || 'dark',
            lightValue: options.lightValue || 'light',
            systemValue: options.systemValue || 'system',
            toggleSelector: options.toggleSelector || '#theme-toggle',
            ...options
        };

        this.root = document.documentElement;
        this.toggleButton = qs(this.config.toggleSelector);
        this.currentTheme = null;

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        this.currentTheme = this.getCurrentTheme();
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    /**
     * Получение системной темы
     */
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? this.config.darkValue
            : this.config.lightValue;
    }

    /**
     * Получение сохранённой темы
     */
    getStoredTheme() {
        try {
            return localStorage.getItem(this.config.themeKey);
        } catch (e) {
            return null;
        }
    }

    /**
     * Получение текущей активной темы
     */
    getCurrentTheme() {
        const stored = this.getStoredTheme();
        return stored || this.getSystemTheme();
    }

    /**
     * Применение темы
     */
    applyTheme(theme) {
        if (!theme || theme === this.config.systemValue) {
            theme = this.getSystemTheme();
        }

        this.root.setAttribute(this.config.themeAttr, theme);
        this.currentTheme = theme;

        // Сохраняем в localStorage
        try {
            localStorage.setItem(this.config.themeKey, theme);
        } catch (e) {
            // Игнорируем
        }

        // Обновляем интерфейс
        this.updateUI(theme);

        // Диспатчим событие
        EventManager.dispatch(this.root, 'theme:changed', { theme });

        return theme;
    }

    /**
     * Переключение темы
     */
    toggleTheme() {
        const next = this.currentTheme === this.config.darkValue
            ? this.config.lightValue
            : this.config.darkValue;
        return this.applyTheme(next);
    }

    /**
     * Обновление UI кнопки
     */
    updateUI(theme) {
        if (!this.toggleButton) return;

        const isDark = theme === this.config.darkValue;

        const icon = this.toggleButton.querySelector('[data-theme-icon]');
        const text = this.toggleButton.querySelector('[data-theme-text]');

        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }

        if (text) {
            text.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
        }

        this.toggleButton.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
        this.toggleButton.classList.toggle('is-dark', isDark);
        this.toggleButton.classList.toggle('is-light', !isDark);
    }

    /**
     * Подписка на события
     */
    bindEvents() {
        // Клик по кнопке
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleTheme());
        }

        // Изменение системной темы
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Если пользователь не выбирал тему вручную
            const stored = this.getStoredTheme();
            if (!stored) {
                const newTheme = e.matches ? this.config.darkValue : this.config.lightValue;
                this.applyTheme(newTheme);
            }
        });
    }

    /**
     * Деструктор (очистка событий)
     */
    destroy() {
        // TODO: отписка от событий
    }
}