// ==========================================
// Global mocks for jsdom environment
// Executed AFTER jsdom initialization
// ==========================================

// 1. window.matchMedia (ThemeManager and other modules)
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),      // legacy API
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// 2. CSS.supports (Modal scroll lock)
Object.defineProperty(global, 'CSS', {
	value: {
		supports: jest.fn().mockImplementation(() => false),
	},
	writable: true,
	configurable: true,
});

// 3. IntersectionObserver (Viewport utilities)
global.IntersectionObserver = class IntersectionObserver {
	constructor(callback, options = {}) {
		this._callback = callback;
		this._options = options;
	}
	observe(target) {
		// For test convenience, automatically treat the element as visible
		if (this._callback) {
			this._callback([
				{
					target,
					isIntersecting: true,
					intersectionRatio: 1,
					boundingClientRect: target.getBoundingClientRect?.() || {},
				},
			]);
		}
	}
	unobserve() {}
	disconnect() {}
};

// 4. ResizeObserver (used in components)
global.ResizeObserver = class ResizeObserver {
	constructor(callback) {
		this._callback = callback;
	}
	observe(target) {
		if (this._callback) {
			this._callback([
				{
					target,
					contentRect: { width: 100, height: 100, x: 0, y: 0 },
					borderBoxSize: [{ inlineSize: 100, blockSize: 100 }],
					contentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
				},
			]);
		}
	}
	unobserve() {}
	disconnect() {}
};

// 5. scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// 6. getBoundingClientRect — critical for isVisible / isInViewport
// jsdom returns all zeros by default, which makes elements appear invisible
Element.prototype.getBoundingClientRect = jest.fn(() => ({
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	top: 0,
	right: 100,
	bottom: 100,
	left: 0,
	toJSON: () => ({}),
}));

// 7. Viewport dimensions for utilities
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

// 8. requestAnimationFrame / cancelAnimationFrame
// Synchronous implementation: callbacks execute immediately.
// This ensures that DOM class changes inside rAF are applied
// right away, so tests don't need to advance fake timers.
const syncRaf = (cb) => cb();
const syncCaf = () => {};

Object.defineProperty(global, 'requestAnimationFrame', {
	value: syncRaf,
	writable: true,
	configurable: true,
});
Object.defineProperty(global, 'cancelAnimationFrame', {
	value: syncCaf,
	writable: true,
	configurable: true,
});
Object.defineProperty(window, 'requestAnimationFrame', {
	value: syncRaf,
	writable: true,
	configurable: true,
});
Object.defineProperty(window, 'cancelAnimationFrame', {
	value: syncCaf,
	writable: true,
	configurable: true,
});