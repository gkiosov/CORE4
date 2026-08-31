// ==========================================
// Utilities Tests — _dom, _keyboard, _focus-trap, _viewport
// ==========================================

import {
    qs,
    qsa,
    createElement,
    toggleClass,
    addClass,
    removeClass,
    setAttr,
    getAttr,
    removeAttr
} from '../utilities/_dom.js';
import { Keyboard } from '../utilities/_keyboard.js';
import { FocusTrap } from '../utilities/_focus-trap.js';
import { isInViewport, onViewportEnter } from '../utilities/_viewport.js';

// ─── DOM Utilities ───
describe('DOM Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('qs returns single element', () => {
        document.body.innerHTML = '<div id="test" class="foo"></div>';
        expect(qs('#test')).toBeInstanceOf(HTMLElement);
        expect(qs('.foo')).toBeInstanceOf(HTMLElement);
    });

    test('qs returns null for missing selector', () => {
        expect(qs('.nonexistent')).toBeNull();
    });

    test('qs returns null for empty selector', () => {
        expect(qs('')).toBeNull();
    });

    test('qsa returns array of elements', () => {
        document.body.innerHTML = '<div class="item"></div><div class="item"></div>';
        const result = qsa('.item');
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
    });

    test('qsa returns empty array for missing selector', () => {
        expect(qsa('.nonexistent')).toEqual([]);
    });

    test('createElement creates element with classes', () => {
        const el = createElement('div', 'foo bar');
        expect(el.tagName).toBe('DIV');
        expect(el.classList.contains('foo')).toBe(true);
        expect(el.classList.contains('bar')).toBe(true);
    });

    test('createElement sets attributes', () => {
        const el = createElement('div', '', { id: 'test', 'data-foo': 'bar' });
        expect(el.id).toBe('test');
        expect(el.dataset.foo).toBe('bar');
    });

    test('createElement appends children', () => {
        const child = createElement('span');
        const el = createElement('div', '', {}, ['text', child]);
        expect(el.childNodes.length).toBe(2);
        expect(el.firstChild.textContent).toBe('text');
        expect(el.lastChild).toBe(child);
    });

    test('addClass adds classes', () => {
        const el = document.createElement('div');
        addClass(el, 'foo', 'bar');
        expect(el.classList.contains('foo')).toBe(true);
        expect(el.classList.contains('bar')).toBe(true);
    });

    test('addClass ignores non-elements', () => {
        expect(() => addClass(null, 'foo')).not.toThrow();
    });

    test('removeClass removes classes', () => {
        const el = document.createElement('div');
        el.classList.add('foo', 'bar');
        removeClass(el, 'foo');
        expect(el.classList.contains('foo')).toBe(false);
        expect(el.classList.contains('bar')).toBe(true);
    });

    test('toggleClass toggles class', () => {
        const el = document.createElement('div');
        toggleClass(el, 'foo');
        expect(el.classList.contains('foo')).toBe(true);
        toggleClass(el, 'foo');
        expect(el.classList.contains('foo')).toBe(false);
    });

    test('toggleClass with condition', () => {
        const el = document.createElement('div');
        toggleClass(el, 'foo', true);
        expect(el.classList.contains('foo')).toBe(true);
        toggleClass(el, 'foo', false);
        expect(el.classList.contains('foo')).toBe(false);
    });

    test('setAttr sets attribute', () => {
        const el = document.createElement('div');
        setAttr(el, 'data-test', 'value');
        expect(el.getAttribute('data-test')).toBe('value');
    });

    test('getAttr gets attribute', () => {
        const el = document.createElement('div');
        el.setAttribute('data-test', 'value');
        expect(getAttr(el, 'data-test')).toBe('value');
    });

    test('getAttr returns null for non-element', () => {
        expect(getAttr(null, 'data-test')).toBeNull();
    });

    test('removeAttr removes attribute', () => {
        const el = document.createElement('div');
        el.setAttribute('data-test', 'value');
        removeAttr(el, 'data-test');
        expect(el.hasAttribute('data-test')).toBe(false);
    });
});

// ─── Keyboard ───
describe('Keyboard', () => {
    test('isEscape detects Escape key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        expect(Keyboard.isEscape(event)).toBe(true);
    });

    test('isEscape returns false for other keys', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(Keyboard.isEscape(event)).toBe(false);
    });

    test('isEnter detects Enter key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(Keyboard.isEnter(event)).toBe(true);
    });

    test('isTab detects Tab key', () => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        expect(Keyboard.isTab(event)).toBe(true);
    });

    test('isArrow detects arrow keys', () => {
        expect(Keyboard.isArrow(new KeyboardEvent('keydown', { key: 'ArrowUp' }))).toBe(true);
        expect(Keyboard.isArrow(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).toBe(true);
        expect(Keyboard.isArrow(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))).toBe(true);
        expect(Keyboard.isArrow(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).toBe(true);
    });

    test('isArrow returns false for non-arrow keys', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        expect(Keyboard.isArrow(event)).toBe(false);
    });
});

// ─── FocusTrap ───
describe('FocusTrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('updateFocusableElements finds focusable elements', () => {
        document.body.innerHTML = `
            <div id="trap">
                <button>First</button>
                <input type="text">
                <a href="#">Link</a>
            </div>
        `;
        const trap = new FocusTrap(document.getElementById('trap'));
        trap.updateFocusableElements();
        expect(trap.focusableElements.length).toBe(3);
    });

    test('activate sets focusedElement and adds listener', () => {
        document.body.innerHTML = `
            <div id="trap"><button>Btn</button></div>
            <button id="outside">Outside</button>
        `;
        const outsideBtn = document.getElementById('outside');
        outsideBtn.focus();

        const trap = new FocusTrap(document.getElementById('trap'));
        trap.activate();

        expect(trap.focusedElement).toBe(outsideBtn);
    });

    test('deactivate restores focus', () => {
        document.body.innerHTML = `
            <div id="trap"><button>Btn</button></div>
            <button id="outside">Outside</button>
        `;
        const outsideBtn = document.getElementById('outside');
        outsideBtn.focus();

        const trap = new FocusTrap(document.getElementById('trap'));
        trap.activate();
        trap.deactivate();

        expect(document.activeElement).toBe(outsideBtn);
    });

    test('focusFirst focuses first element', () => {
        document.body.innerHTML = `
            <div id="trap">
                <button id="first">First</button>
                <button id="second">Second</button>
            </div>
        `;
        const trap = new FocusTrap(document.getElementById('trap'));
        trap.activate();
        trap.focusFirst();
        expect(document.activeElement.id).toBe('first');
    });

    test('handleKeydown traps Tab at last element', () => {
        document.body.innerHTML = `
            <div id="trap">
                <button id="first">First</button>
                <button id="last">Last</button>
            </div>
        `;
        const trap = new FocusTrap(document.getElementById('trap'));
        trap.activate();
        document.getElementById('last').focus();

        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

        trap.handleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    test('handleKeydown traps Shift+Tab at first element', () => {
        document.body.innerHTML = `
            <div id="trap">
                <button id="first">First</button>
                <button id="last">Last</button>
            </div>
        `;
        const trap = new FocusTrap(document.getElementById('trap'));
        trap.activate();
        document.getElementById('first').focus();

        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

        trap.handleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });
});

// ─── Viewport ───
describe('Viewport Utilities', () => {
    test('isInViewport returns true for visible element', () => {
        const el = document.createElement('div');
        el.style.width = '100px';
        el.style.height = '100px';
        document.body.appendChild(el);
        expect(isInViewport(el)).toBe(true);
        document.body.removeChild(el);
    });

    test('isInViewport returns false for null', () => {
        expect(isInViewport(null)).toBe(false);
    });

    test('onViewportEnter returns observer', () => {
        const el = document.createElement('div');
        el.style.width = '100px';
        el.style.height = '100px';
        document.body.appendChild(el);

        const callback = jest.fn();
        const observer = onViewportEnter(el, callback);

        expect(observer).toBeInstanceOf(IntersectionObserver);
        observer.disconnect();
        document.body.removeChild(el);
    });
});