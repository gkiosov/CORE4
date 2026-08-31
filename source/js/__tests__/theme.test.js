// ==========================================
// Theme Manager Tests
// ==========================================

import { ThemeManager } from '../modules/theme/_theme.js';

describe('ThemeManager', () => {
    let manager;

    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark', 'light');
        localStorage.clear();
    });

    afterEach(() => {
        if (manager) manager.destroy();
        manager = null;
    });

    test('applies system theme by default', () => {
        manager = new ThemeManager();
        const effective = manager.effective;
        expect(['dark', 'light']).toContain(effective);
    });

    test('apply dark theme', () => {
        manager = new ThemeManager();
        manager.apply('dark');

        expect(manager.choice).toBe('dark');
        expect(manager.effective).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('apply light theme', () => {
        manager = new ThemeManager();
        manager.apply('light');

        expect(manager.choice).toBe('light');
        expect(manager.effective).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    test('toggle switches between dark and light', () => {
        manager = new ThemeManager();
        manager.apply('dark');
        manager.toggle();

        expect(manager.effective).toBe('light');
        manager.toggle();
        expect(manager.effective).toBe('dark');
    });

    test('reset applies system theme', () => {
        manager = new ThemeManager();
        manager.apply('dark');
        manager.reset();

        expect(manager.choice).toBe('system');
    });

    test('persists theme in localStorage', () => {
        manager = new ThemeManager();
        manager.apply('dark');

        expect(localStorage.getItem('core4-theme')).toBe('dark');
    });

    test('reads persisted theme on init', () => {
        localStorage.setItem('core4-theme', 'light');
        manager = new ThemeManager();

        expect(manager.effective).toBe('light');
    });

    test('dispatches theme:changed event', () => {
        const handler = jest.fn();
        document.documentElement.addEventListener('theme:changed', handler);

        manager = new ThemeManager();
        manager.apply('dark');

        expect(handler).toHaveBeenCalled();
        const detail = handler.mock.calls[0][0].detail;
        expect(detail.effective).toBe('dark');
        expect(detail.choice).toBe('dark');
    });

    test('isDark and isLight getters work', () => {
        manager = new ThemeManager();
        manager.apply('dark');
        expect(manager.isDark).toBe(true);
        expect(manager.isLight).toBe(false);

        manager.apply('light');
        expect(manager.isDark).toBe(false);
        expect(manager.isLight).toBe(true);
    });

    test('set() is alias for apply()', () => {
        manager = new ThemeManager();
        manager.set('dark');
        expect(manager.effective).toBe('dark');
    });

    test('destroy removes system listener', () => {
        manager = new ThemeManager();
        expect(() => manager.destroy()).not.toThrow();
    });
});