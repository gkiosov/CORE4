// ==========================================
// Button Tests
// ==========================================

import { Button } from '../modules/button/_button.js';

describe('Button', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('initializes with default type', () => {
        document.body.innerHTML = '<button data-button>Click</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        expect(btn.type).toBe('default');
        expect(btn.originalText).toBe('Click');
    });

    test('async button dispatches button:click and enters loading', () => {
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        const handler = jest.fn();
        el.addEventListener('button:click', handler);

        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(clickEvent, 'preventDefault', { value: jest.fn() });

        btn.handleClick(clickEvent);

        expect(clickEvent.preventDefault).toHaveBeenCalled();
        expect(btn.isProcessing).toBe(true);
        expect(el.classList.contains('is-loading')).toBe(true);
        expect(el.getAttribute('aria-busy')).toBe('true');
        expect(el.disabled).toBe(true);
        expect(handler).toHaveBeenCalled();
    });

    test('setSuccess applies success state', () => {
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setLoading();
        btn.setSuccess();

        expect(el.classList.contains('is-loading')).toBe(false);
        expect(el.classList.contains('is-success')).toBe(true);
    });

    test('setError applies error state', () => {
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setLoading();
        btn.setError('Failed!');

        expect(el.classList.contains('is-loading')).toBe(false);
        expect(el.classList.contains('is-error')).toBe(true);
        expect(el.textContent).toBe('Failed!');
    });

    test('reset restores original state', () => {
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setLoading();
        btn.reset();

        expect(btn.isProcessing).toBe(false);
        expect(el.classList.contains('is-loading')).toBe(false);
        expect(el.disabled).toBe(false);
        expect(el.textContent).toBe('Submit');
    });

    test('toggle button toggles pressed state', () => {
        document.body.innerHTML = '<button data-button="toggle">Switch</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        expect(btn.isToggled).toBe(false);
        btn.toggle();
        expect(btn.isToggled).toBe(true);
        expect(el.getAttribute('aria-pressed')).toBe('true');
        expect(el.classList.contains('is-active')).toBe(true);

        btn.toggle();
        expect(btn.isToggled).toBe(false);
        expect(el.getAttribute('aria-pressed')).toBe('false');
    });

    test('toggle button can be forced to specific state', () => {
        document.body.innerHTML = '<button data-button="toggle">Switch</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.toggle(true);
        expect(btn.isToggled).toBe(true);
        btn.toggle(false);
        expect(btn.isToggled).toBe(false);
    });

    test('default button dispatches button:click', () => {
        document.body.innerHTML = '<button data-button>Normal</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        const handler = jest.fn();
        el.addEventListener('button:click', handler);

        const clickEvent = new MouseEvent('click', { bubbles: true });
        btn.handleClick(clickEvent);

        expect(handler).toHaveBeenCalled();
    });

    test('click during processing is blocked', () => {
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setLoading();
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        Object.defineProperty(clickEvent, 'preventDefault', { value: jest.fn() });
        Object.defineProperty(clickEvent, 'stopPropagation', { value: jest.fn() });

        btn.handleClick(clickEvent);
        expect(clickEvent.preventDefault).toHaveBeenCalled();
        expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    test('setText changes text content', () => {
        document.body.innerHTML = '<button data-button>Old</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setText('New');
        expect(el.textContent).toBe('New');
    });

    test('setHTML changes inner HTML', () => {
        document.body.innerHTML = '<button data-button>Old</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setHTML('<span>New</span>');
        expect(el.innerHTML).toBe('<span>New</span>');
    });

    test('scheduleReset auto-resets after delay', () => {
        jest.useFakeTimers();
        document.body.innerHTML = '<button data-button="async">Submit</button>';
        const el = document.querySelector('[data-button]');
        const btn = new Button(el);

        btn.setLoading();
        btn.setSuccess();
        jest.advanceTimersByTime(2000);

        expect(btn.isProcessing).toBe(false);
        expect(el.classList.contains('is-success')).toBe(false);
        jest.useRealTimers();
    });
});
