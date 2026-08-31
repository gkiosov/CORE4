// ==========================================
// App (Main Entry Point) Tests
// ==========================================
// Tests the public API of the App orchestrator from main.js.
// Dynamic imports are not exercised here — they are covered
// by individual module tests. This suite verifies lifecycle,
// namespace exposure, and state management.
// ==========================================

jest.mock('../scss/main.scss', () => {});

jest.mock('../modules/theme/_theme.js', () => ({
	ThemeManager: class ThemeManager {
		constructor() {}
		destroy() {}
	}
}));

import app from '../main.js';

describe('App', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		if (app.isInitialized) {
			app.destroy();
		}
	});

	afterEach(() => {
		if (app.isInitialized) {
			app.destroy();
		}
	});

	test('exposes window.CORE4 namespace', () => {
		expect(window.CORE4).toBeDefined();
		expect(window.CORE4.app).toBe(app);
		expect(window.CORE4.core).toBeDefined();
		expect(window.CORE4.utils).toBeDefined();
		expect(window.CORE4.components).toBeDefined();
		expect(window.CORE4.components.ThemeManager).toBeDefined();
		expect(window.CORE4.components.FocusTrap).toBeDefined();
	});

	test('constructor merges config with defaults', () => {
		expect(app.config.modules.theme).toBe(true);
		expect(app.config.modules.modals).toBe(true);
		expect(app.config.modules.accordions).toBe(true);
		expect(app.config.modules.buttons).toBe(true);
		expect(app.config.modules.dropdowns).toBe(true);
		expect(app.config.modules.forms).toBe(true);
	});

	test('init guards against double initialization', async () => {
		await app.init();
		expect(app.isInitialized).toBe(true);

		const spy = jest.spyOn(app, '_initModules');
		await app.init();
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('destroy resets all state', async () => {
		await app.init();
		app.destroy();

		expect(app.isInitialized).toBe(false);
		expect(app.modules).toEqual({});
		expect(app._factories).toEqual({});
	});

	test('getModule returns null for unknown module', () => {
		expect(app.getModule('nonexistent')).toBeNull();
	});

	test('getModule returns null before initialization', () => {
		expect(app.getModule('modals')).toBeNull();
	});

	test('reinit method exists and is callable', () => {
		expect(typeof app.reinit).toBe('function');
	});

	test('destroy method exists and is callable', () => {
		expect(typeof app.destroy).toBe('function');
	});

	test('init method exists and is callable', () => {
		expect(typeof app.init).toBe('function');
	});

	test('modules object is empty before init', () => {
		expect(Object.keys(app.modules).length).toBe(0);
	});

	test('destroy is safe to call multiple times', () => {
		expect(() => {
			app.destroy();
			app.destroy();
			app.destroy();
		}).not.toThrow();
	});
});