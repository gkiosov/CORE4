// ==========================================
// Accordion Tests
// ==========================================

import { Accordion, initAccordions } from '../modules/accordion/_accordion.js';

describe('Accordion', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    const createAccordionHTML = (multiple = false) => `
        <div data-accordion ${multiple ? 'data-accordion-multiple="true"' : ''}>
            <div data-accordion-item>
                <button data-accordion-header>Header 1</button>
                <div data-accordion-content>Content 1</div>
            </div>
            <div data-accordion-item>
                <button data-accordion-header>Header 2</button>
                <div data-accordion-content>Content 2</div>
            </div>
            <div data-accordion-item>
                <button data-accordion-header>Header 3</button>
                <div data-accordion-content>Content 3</div>
            </div>
            <button data-accordion-expand>Expand All</button>
            <button data-accordion-collapse>Collapse All</button>
        </div>
    `;

    test('initializes with correct items', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        expect(accordion.items.length).toBe(3);
        expect(accordion.items[0].header.textContent).toBe('Header 1');
    });

    test('sets ARIA attributes on headers', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        new Accordion(el);

        const headers = el.querySelectorAll('[data-accordion-header]');
        headers.forEach(header => {
            expect(header.getAttribute('aria-expanded')).toBe('false');
            expect(header.hasAttribute('aria-controls')).toBe(true);
        });
    });

    test('opens a panel', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.open(0);
        expect(accordion.items[0].item.classList.contains('is-open')).toBe(true);
        expect(accordion.items[0].header.getAttribute('aria-expanded')).toBe('true');
    });

    test('closes a panel', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.open(0);
        accordion.close(0, true);
        expect(accordion.items[0].item.classList.contains('is-open')).toBe(false);
        expect(accordion.items[0].header.getAttribute('aria-expanded')).toBe('false');
    });

    test('toggles a panel', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.toggle(0);
        expect(accordion.items[0].item.classList.contains('is-open')).toBe(true);

        accordion.toggle(0);
        expect(accordion.items[0].item.classList.contains('is-open')).toBe(false);
    });

    test('single mode closes other panels', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.open(0);
        accordion.open(1);

        expect(accordion.items[0].item.classList.contains('is-open')).toBe(false);
        expect(accordion.items[1].item.classList.contains('is-open')).toBe(true);
    });

    test('multiple mode keeps multiple panels open', () => {
        document.body.innerHTML = createAccordionHTML(true);
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.open(0);
        accordion.open(1);

        expect(accordion.items[0].item.classList.contains('is-open')).toBe(true);
        expect(accordion.items[1].item.classList.contains('is-open')).toBe(true);
    });

    test('expandAll opens all panels', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.expandAll();
        accordion.items.forEach(item => {
            expect(item.item.classList.contains('is-open')).toBe(true);
            expect(item.header.getAttribute('aria-expanded')).toBe('true');
        });
    });

    test('collapseAll closes all panels', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.expandAll();
        accordion.collapseAll(true);
        accordion.items.forEach(item => {
            expect(item.item.classList.contains('is-open')).toBe(false);
            expect(item.header.getAttribute('aria-expanded')).toBe('false');
        });
    });

    test('click on header toggles panel', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        new Accordion(el);

        const header = el.querySelector('[data-accordion-header]');
        header.click();
        expect(header.closest('[data-accordion-item]').classList.contains('is-open')).toBe(true);
    });

    test('Enter key on header toggles panel', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        new Accordion(el);

        const header = el.querySelector('[data-accordion-header]');
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

        header.dispatchEvent(event);
        expect(header.closest('[data-accordion-item]').classList.contains('is-open')).toBe(true);
    });

    test('destroy removes all listeners', () => {
        document.body.innerHTML = createAccordionHTML();
        const el = document.querySelector('[data-accordion]');
        const accordion = new Accordion(el);

        accordion.destroy();
        expect(accordion.items.length).toBe(0);
    });

    test('initAccordions returns array of instances', () => {
        document.body.innerHTML = `
            <div data-accordion></div>
            <div data-accordion></div>
        `;
        const instances = initAccordions();
        expect(Array.isArray(instances)).toBe(true);
        expect(instances.length).toBe(2);
    });
});
