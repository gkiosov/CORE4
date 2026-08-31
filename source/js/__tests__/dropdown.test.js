// ==========================================
// Dropdown Tests
// ==========================================

import { Dropdown, initDropdowns } from '../modules/dropdown/_dropdown.js';

describe('Dropdown', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    const createDropdownHTML = () => `
        <div data-dropdown>
            <button data-dropdown-trigger>Menu</button>
            <ul data-dropdown-menu>
                <li><button>Item 1</button></li>
                <li><a href="#">Item 2</a></li>
                <li><button>Item 3</button></li>
            </ul>
        </div>
    `;

    test('initializes with trigger and menu', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        expect(dropdown.trigger).toBeInstanceOf(HTMLElement);
        expect(dropdown.menu).toBeInstanceOf(HTMLElement);
        expect(dropdown.items.length).toBe(3);
    });

    test('sets ARIA attributes', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        new Dropdown(el);

        const trigger = el.querySelector('[data-dropdown-trigger]');
        expect(trigger.getAttribute('aria-haspopup')).toBe('true');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.hasAttribute('aria-controls')).toBe(true);

        const menu = el.querySelector('[data-dropdown-menu]');
        expect(menu.getAttribute('role')).toBe('menu');
    });

    test('open adds class and updates aria-expanded', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        expect(el.classList.contains('is-open')).toBe(true);
        expect(dropdown.trigger.getAttribute('aria-expanded')).toBe('true');
        expect(dropdown.isOpen).toBe(true);
    });

    test('close removes class and updates aria-expanded', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        dropdown.close();
        expect(el.classList.contains('is-open')).toBe(false);
        expect(dropdown.trigger.getAttribute('aria-expanded')).toBe('false');
        expect(dropdown.isOpen).toBe(false);
    });

    test('toggle switches state', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.toggle();
        expect(dropdown.isOpen).toBe(true);
        dropdown.toggle();
        expect(dropdown.isOpen).toBe(false);
    });

    test('click outside closes dropdown', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        expect(dropdown.isOpen).toBe(true);

        document.body.click();
        expect(dropdown.isOpen).toBe(false);
    });

    test('Escape key closes dropdown', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        expect(dropdown.isOpen).toBe(true);

        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        document.dispatchEvent(event);

        expect(dropdown.isOpen).toBe(false);
    });

    test('trigger ArrowDown opens and focuses first item', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        new Dropdown(el);

        const trigger = el.querySelector('[data-dropdown-trigger]');
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

        trigger.dispatchEvent(event);
        const firstItem = el.querySelector('ul button');
        expect(document.activeElement).toBe(firstItem);
    });

    test('menu ArrowDown moves focus to next item', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        const items = el.querySelectorAll('ul button, ul a');
        items[0].focus();

        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        dropdown.menu.dispatchEvent(event);

        expect(document.activeElement).toBe(items[1]);
    });

    test('menu ArrowUp wraps to last item', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        const items = el.querySelectorAll('ul button, ul a');
        items[0].focus();

        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        dropdown.menu.dispatchEvent(event);

        expect(document.activeElement).toBe(items[items.length - 1]);
    });

    test('menu Home focuses first item', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        const items = el.querySelectorAll('ul button, ul a');
        items[items.length - 1].focus();

        const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        dropdown.menu.dispatchEvent(event);

        expect(document.activeElement).toBe(items[0]);
    });

    test('menu End focuses last item', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.open();
        const items = el.querySelectorAll('ul button, ul a');
        items[0].focus();

        const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        dropdown.menu.dispatchEvent(event);

        expect(document.activeElement).toBe(items[items.length - 1]);
    });

    test('click on menu item dispatches select event', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        const handler = jest.fn();
        el.addEventListener('dropdown:select', handler);

        dropdown.open();
        const firstItem = el.querySelector('ul button');
        firstItem.click();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.index).toBe(0);
    });

    test('destroy removes listeners', () => {
        document.body.innerHTML = createDropdownHTML();
        const el = document.querySelector('[data-dropdown]');
        const dropdown = new Dropdown(el);

        dropdown.destroy();
        expect(dropdown._triggerClickHandler).toBeNull();
    });

    test('initDropdowns returns array', () => {
        document.body.innerHTML = `
            <div data-dropdown><button data-dropdown-trigger></button><ul data-dropdown-menu></ul></div>
            <div data-dropdown><button data-dropdown-trigger></button><ul data-dropdown-menu></ul></div>
        `;
        const instances = initDropdowns();
        expect(Array.isArray(instances)).toBe(true);
        expect(instances.length).toBe(2);
    });
});