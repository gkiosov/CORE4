// ==========================================
// Helper Functions
// ==========================================
// General-purpose utilities: type checking, ID generation,
// debounce/throttle, deep clone, and safe property access.
// ==========================================

// Counter for generateId (collision guard for rapid successive calls)
let _idCounter = 0;

/**
 * Check whether a value is a DOM Element.
 * @param {*} el
 * @returns {boolean}
 */
export const isElement = (el) => el instanceof Element;

/**
 * Check whether an element is visually visible (accounts for CSS).
 * @param {Element} el
 * @returns {boolean}
 */
export const isVisible = (el) => {
	if (!isElement(el)) return false;

	const rect = el.getBoundingClientRect();
	if (rect.width === 0 || rect.height === 0) return false;

	const style = window.getComputedStyle(el);
	return style.display !== 'none'
		&& style.visibility !== 'hidden'
		&& style.opacity !== '0';
};

/**
 * Generate a unique identifier.
 * Priority: crypto.randomUUID() → Date.now() + counter fallback.
 * @param {string} prefix  – ID prefix (default: 'core4')
 * @returns {string}
 */
export const generateId = (prefix = 'core4') => {
	const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: `${Date.now()}-${++_idCounter}`;
	return `${prefix}-${suffix}`;
};

/**
 * Debounce a function (limit execution frequency).
 * @param {Function} fn   – function to debounce
 * @param {number} delay  – delay in milliseconds (default: 300)
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
};

/**
 * Throttle a function (skip intermediate calls).
 * @param {Function} fn   – function to throttle
 * @param {number} delay  – minimum interval in ms (default: 300)
 * @returns {Function}
 */
export const throttle = (fn, delay = 300) => {
	let lastCall = 0;
	return (...args) => {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			fn(...args);
		}
	};
};

/**
 * Deep clone an object.
 * Priority: structuredClone() → JSON.parse/stringify (limited fallback).
 * Note: the JSON fallback does NOT preserve Date, Map, Set, RegExp, or functions.
 * @param {*} obj
 * @returns {*}
 */
export const deepClone = (obj) => {
	if (obj === null || typeof obj !== 'object') return obj;

	if (typeof structuredClone === 'function') {
		try {
			return structuredClone(obj);
		} catch (e) {
			// Fallback if structuredClone fails (e.g. functions inside)
		}
	}

	// Limited fallback: does not preserve Date, Map, Set, RegExp, or functions
	return JSON.parse(JSON.stringify(obj));
};

/**
 * Check whether a value is a plain object (not an array, not null).
 * @param {*} val
 * @returns {boolean}
 */
export const isPlainObject = (val) => {
	return Object.prototype.toString.call(val) === '[object Object]';
};

/**
 * Safely retrieve a nested property by path.
 * Supports dot-notation string ('a.b.c') or array of keys.
 * @param {Object} obj            – source object
 * @param {string|string[]} path  – property path
 * @param {*} fallback            – value returned when path is missing
 * @returns {*}
 */
export const getNestedValue = (obj, path, fallback = null) => {
	if (obj == null) return fallback;

	const keys = Array.isArray(path) ? path : String(path).split('.');
	let result = obj;

	for (const key of keys) {
		if (result == null) return fallback;
		result = result[key];
	}

	return result === undefined ? fallback : result;
};
