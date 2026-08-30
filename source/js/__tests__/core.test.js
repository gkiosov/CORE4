// ==========================================
// Core Tests — _config, _helpers, _events
// ==========================================

import { CONFIG } from '../core/_config.js';
import {
    isElement,
    isVisible,
    generateId,
    debounce,
    throttle,
    deepClone,
    isPlainObject,
    getNestedValue
} from '../core/_helpers.js';
import { EventManager } from '../core/_events.js';

// ─── CONFIG ───
describe('CONFIG', () => {
    test('has PREFIX', () => {
        expect(CONFIG.PREFIX).toBe('core4');
    });

    test('STATE contains expected keys', () => {
        expect(CONFIG.STATE.ACTIVE).toBe('is-active');
        expect(CONFIG.STATE.OPEN).toBe('is-open');
        expect(CONFIG.STATE.CLOSED).toBe('is-closed');
    });

    test('ATTR contains expected keys', () => {
        expect(CONFIG.ATTR.MODAL).toBe('data-modal');
        expect(CONFIG.ATTR.THEME).toBe('data-theme');
    });

    test('SELECTORS contains expected keys', () => {
        expect(CONFIG.SELECTORS.MODAL).toBe('[data-modal]');
        expect(CONFIG.SELECTORS.ACCORDION).toBe('[data-accordion]');
    });

    test('KEYBOARD contains expected keys', () => {
        expect(CONFIG.KEYBOARD.ESC).toBe('Escape');
        expect(CONFIG.KEYBOARD.ENTER).toBe('Enter');
    });

    test('ANIMATION.DURATION has numeric values', () => {
        expect(CONFIG.ANIMATION.DURATION.FAST).toBe(150);
        expect(CONFIG.ANIMATION.DURATION.MEDIUM).toBe(300);
        expect(CONFIG.ANIMATION.DURATION.SLOW).toBe(500);
    });

    test('THEME_KEY is defined', () => {
        expect(CONFIG.THEME_KEY).toBe('core4-theme');
    });
});

// ─── isElement ───
describe('isElement', () => {
    test('returns true for DOM element', () => {
        const el = document.createElement('div');
        expect(isElement(el)).toBe(true);
    });

    test('returns false for non-element values', () => {
        expect(isElement(null)).toBe(false);
        expect(isElement(undefined)).toBe(false);
        expect(isElement('string')).toBe(false);
        expect(isElement(42)).toBe(false);
        expect(isElement({})).toBe(false);
        expect(isElement([])).toBe(false);
    });
});

// ─── isVisible ───
describe('isVisible', () => {
    test('returns true for visible element', () => {
        const el = document.createElement('div');
        el.style.width = '100px';
        el.style.height = '100px';
        document.body.appendChild(el);
        expect(isVisible(el)).toBe(true);
        document.body.removeChild(el);
    });

    test('returns false for display:none', () => {
        const el = document.createElement('div');
        el.style.display = 'none';
        document.body.appendChild(el);
        expect(isVisible(el)).toBe(false);
        document.body.removeChild(el);
    });

    test('returns false for non-element', () => {
        expect(isVisible(null)).toBe(false);
    });
});

// ─── generateId ───
describe('generateId', () => {
    test('generates string with prefix', () => {
        const id = generateId('test');
        expect(typeof id).toBe('string');
        expect(id.startsWith('test-')).toBe(true);
    });

    test('generates unique IDs', () => {
        const id1 = generateId('test');
        const id2 = generateId('test');
        expect(id1).not.toBe(id2);
    });

    test('uses default prefix', () => {
        const id = generateId();
        expect(id.startsWith('core4-')).toBe(true);
    });
});

// ─── debounce ───
describe('debounce', () => {
    jest.useFakeTimers();

    test('delays execution', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100);

        debounced('a');
        debounced('b');
        debounced('c');

        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('c');
    });

    test('uses default delay of 300ms', () => {
        const fn = jest.fn();
        const debounced = debounce(fn);
        debounced();
        jest.advanceTimersByTime(299);
        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalled();
    });
});

// ─── throttle ───
describe('throttle', () => {
    jest.useFakeTimers();

    test('limits execution frequency', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);

        throttled('a');
        throttled('b');
        throttled('c');

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('a');

        jest.advanceTimersByTime(100);
        throttled('d');
        expect(fn).toHaveBeenCalledTimes(2);
    });
});

// ─── deepClone ───
describe('deepClone', () => {
    test('clones plain objects', () => {
        const obj = { a: 1, b: { c: 2 } };
        const cloned = deepClone(obj);
        expect(cloned).toEqual(obj);
        expect(cloned).not.toBe(obj);
        expect(cloned.b).not.toBe(obj.b);
    });

    test('clones arrays', () => {
        const arr = [1, 2, { a: 3 }];
        const cloned = deepClone(arr);
        expect(cloned).toEqual(arr);
        expect(cloned).not.toBe(arr);
    });

    test('handles null', () => {
        expect(deepClone(null)).toBeNull();
    });

    test('handles primitives', () => {
        expect(deepClone(42)).toBe(42);
        expect(deepClone('hello')).toBe('hello');
    });
});

// ─── isPlainObject ───
describe('isPlainObject', () => {
    test('returns true for plain objects', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ a: 1 })).toBe(true);
    });

    test('returns false for arrays', () => {
        expect(isPlainObject([])).toBe(false);
    });

    test('returns false for null', () => {
        expect(isPlainObject(null)).toBe(false);
    });

    test('returns false for dates', () => {
        expect(isPlainObject(new Date())).toBe(false);
    });
});

// ─── getNestedValue ───
describe('getNestedValue', () => {
    const obj = { a: { b: { c: 42 } } };

    test('retrieves nested value by dot path', () => {
        expect(getNestedValue(obj, 'a.b.c')).toBe(42);
    });

    test('retrieves nested value by array path', () => {
        expect(getNestedValue(obj, ['a', 'b', 'c'])).toBe(42);
    });

    test('returns fallback for missing path', () => {
        expect(getNestedValue(obj, 'a.b.x', 'fallback')).toBe('fallback');
    });

    test('returns fallback for null object', () => {
        expect(getNestedValue(null, 'a.b', 'fallback')).toBe('fallback');
    });
});

// ─── EventManager ───
describe('EventManager', () => {
    test('dispatches custom event', () => {
        const el = document.createElement('div');
        const handler = jest.fn();
        el.addEventListener('test:event', handler);

        EventManager.dispatch(el, 'test:event', { foo: 'bar' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail).toEqual({ foo: 'bar' });
    });

    test('on() returns unsubscribe function', () => {
        const el = document.createElement('div');
        const handler = jest.fn();
        const unsubscribe = EventManager.on(el, 'test:event', handler);

        EventManager.dispatch(el, 'test:event');
        expect(handler).toHaveBeenCalledTimes(1);

        unsubscribe();
        EventManager.dispatch(el, 'test:event');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test('once() fires only once', () => {
        const el = document.createElement('div');
        const handler = jest.fn();
        EventManager.once(el, 'test:event', handler);

        EventManager.dispatch(el, 'test:event');
        EventManager.dispatch(el, 'test:event');

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
