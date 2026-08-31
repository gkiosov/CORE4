// ==========================================
// Tabs Tests
// ==========================================

import { Tabs, initTabs } from '../modules/tabs/_tabs.js';

describe('Tabs', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        window.sessionStorage.clear();
        window.location.hash = '';
    });

    const createTabsHTML = (opts = '') => `
        <div data-tabs ${opts} id="test-tabs">
            <div data-tabs-list>
                <button data-tabs-trigger="panel-1">Tab 1</button>
                <button data-tabs-trigger="panel-2">Tab 2</button>
                <button data-tabs-trigger="panel-3">Tab 3</button>
            </div>
            <div data-tabs-panel="panel-1">Panel 1</div>
            <div data-tabs-panel="panel-2">Panel 2</div>
            <div data-tabs-panel="panel-3">Panel 3</div>
        </div>
    `;

    test('initializes with correct triggers and panels', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        expect(tabs.triggers.length).toBe(3);
        expect(tabs.panels.length).toBe(3);
        expect(tabs.activeIndex).toBe(0);
    });

    test('sets ARIA attributes', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        new Tabs(el);

        const trigger = el.querySelector('[data-tabs-trigger]');
        expect(trigger.getAttribute('role')).toBe('tab');
        expect(trigger.getAttribute('aria-selected')).toBe('true');
        expect(trigger.hasAttribute('aria-controls')).toBe(true);

        const panel = el.querySelector('[data-tabs-panel]');
        expect(panel.getAttribute('role')).toBe('tabpanel');
        expect(panel.hasAttribute('aria-labelledby')).toBe(true);
    });

    test('activate switches active tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.activate(1);
        expect(tabs.activeIndex).toBe(1);
        expect(tabs.triggers[1].trigger.getAttribute('aria-selected')).toBe('true');
        expect(tabs.triggers[0].trigger.getAttribute('aria-selected')).toBe('false');
    });

    test('active panel is visible, others hidden', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.activate(1);
        expect(tabs.panels[1].hasAttribute('hidden')).toBe(false);
        expect(tabs.panels[0].hasAttribute('hidden')).toBe(true);
    });

    test('does not activate disabled tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.disable(1);
        tabs.activate(1);
        expect(tabs.activeIndex).not.toBe(1);
    });

    test('disable sets aria-disabled and tabindex', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.disable(1);
        const trigger = tabs.triggers[1].trigger;
        expect(trigger.getAttribute('aria-disabled')).toBe('true');
        expect(trigger.getAttribute('tabindex')).toBe('-1');
    });

    test('enable removes disabled state', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.disable(1);
        tabs.enable(1);
        const trigger = tabs.triggers[1].trigger;
        expect(trigger.hasAttribute('aria-disabled')).toBe(false);
    });

    test('next() skips to next non-disabled tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.next();
        expect(tabs.activeIndex).toBe(1);
    });

    test('prev() goes to previous tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.activate(2);
        tabs.prev();
        expect(tabs.activeIndex).toBe(1);
    });

    test('dispatches tabs:changed event', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);
        const handler = jest.fn();
        el.addEventListener('tabs:changed', handler);

        tabs.activate(1);
        expect(handler).toHaveBeenCalledTimes(1);
        const detail = handler.mock.calls[0][0].detail;
        expect(detail.index).toBe(1);
        expect(detail.previousIndex).toBe(0);
    });

    test('destroy cleans up', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.destroy();
        expect(tabs.triggers.length).toBe(0);
        expect(tabs.panels.length).toBe(0);
    });

    test('destroy removes variant class', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        const tabs = new Tabs(el);

        tabs.destroy();
        expect(el.classList.contains('tabs--underline')).toBe(false);
    });

    test('initTabs returns array of instances', () => {
        document.body.innerHTML = `
            <div data-tabs id="tabs-1"><div data-tabs-list><button data-tabs-trigger="p1">T1</button></div><div data-tabs-panel="p1">P1</div></div>
            <div data-tabs id="tabs-2"><div data-tabs-list><button data-tabs-trigger="p2">T2</button></div><div data-tabs-panel="p2">P2</div></div>
        `;
        const instances = initTabs();
        expect(Array.isArray(instances)).toBe(true);
        expect(instances.length).toBe(2);
    });

    test('click on trigger activates tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        new Tabs(el);

        const trigger = el.querySelectorAll('[data-tabs-trigger]')[1];
        trigger.click();
        expect(trigger.getAttribute('aria-selected')).toBe('true');
    });

    test('Enter on trigger activates tab', () => {
        document.body.innerHTML = createTabsHTML();
        const el = document.getElementById('test-tabs');
        new Tabs(el);

        const trigger = el.querySelectorAll('[data-tabs-trigger]')[1];
        const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
        trigger.dispatchEvent(event);
        expect(trigger.getAttribute('aria-selected')).toBe('true');
    });
});