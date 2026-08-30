// ==========================================
// Modal Tests (Extended)
// ==========================================

import { Modal } from '../modules/modal/_modal.js';

describe('Modal', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="test-modal" class="modal" data-modal>
                <div class="modal__content">
                    <h3 class="modal__title">Test Title</h3>
                    <button data-modal-close>Close</button>
                </div>
            </div>
            <button data-modal-trigger="test-modal">Open</button>
        `;
        Modal.openCount = 0;
    });

    afterEach(() => {
        document.body.innerHTML = '';
        Modal.openCount = 0;
    });

    test('opens with .open() and adds is-open class', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        expect(modalElement.classList.contains('is-open')).toBe(true);
        expect(modal.isOpen).toBe(true);
    });

    test('closes with .close() and removes is-open class', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        modal.close();
        expect(modalElement.classList.contains('is-open')).toBe(false);
        expect(modal.isOpen).toBe(false);
    });

    test('closes on close button click', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);
        const closeButton = modalElement.querySelector('[data-modal-close]');

        modal.open();
        closeButton.click();
        expect(modalElement.classList.contains('is-open')).toBe(false);
    });

    test('closes on Escape key', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(event);

        expect(modalElement.classList.contains('is-open')).toBe(false);
    });

    test('closes on outside click (overlay)', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        modalElement.click();
        expect(modalElement.classList.contains('is-open')).toBe(false);
    });

    test('does NOT close on content click', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);
        const content = modalElement.querySelector('.modal__content');

        modal.open();
        content.click();
        expect(modalElement.classList.contains('is-open')).toBe(true);
    });

    test('sets role and aria-modal on init', () => {
        const modalElement = document.getElementById('test-modal');
        new Modal(modalElement);

        expect(modalElement.getAttribute('role')).toBe('dialog');
        expect(modalElement.getAttribute('aria-modal')).toBe('true');
    });

    test('auto-generates id if missing', () => {
        const el = document.createElement('div');
        el.setAttribute('data-modal', '');
        document.body.appendChild(el);

        const modal = new Modal(el);
        expect(el.id).toBeTruthy();
        document.body.removeChild(el);
    });

    test('sets aria-labelledby from title', () => {
        const modalElement = document.getElementById('test-modal');
        new Modal(modalElement);

        const title = modalElement.querySelector('.modal__title');
        expect(modalElement.getAttribute('aria-labelledby')).toBe(title.id);
    });

    test('focus trap activates on open', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        expect(modal.focusTrap).toBeInstanceOf(Object);
    });

    test('toggle switches state', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.toggle();
        expect(modal.isOpen).toBe(true);
        modal.toggle();
        expect(modal.isOpen).toBe(false);
    });

    test('double open does nothing', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        modal.open();
        expect(Modal.openCount).toBe(1);
    });

    test('double close does nothing', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.close();
        expect(modal.isOpen).toBe(false);
    });

    test('destroy cleans up listeners', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.destroy();
        expect(modal._handlers.closeButtons.length).toBe(0);
    });

    test('scheduleDelay opens after timeout', () => {
        jest.useFakeTimers();
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.scheduleDelay(500);
        expect(modal.isOpen).toBe(false);

        jest.advanceTimersByTime(500);
        expect(modal.isOpen).toBe(true);
        jest.useRealTimers();
    });

    test('cancelDelay prevents auto-open', () => {
        jest.useFakeTimers();
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.scheduleDelay(500);
        modal.cancelDelay();
        jest.advanceTimersByTime(500);
        expect(modal.isOpen).toBe(false);
        jest.useRealTimers();
    });

    test('data-modal-once prevents second open', () => {
        const modalElement = document.getElementById('test-modal');
        modalElement.dataset.modalOnce = 'true';
        const modal = new Modal(modalElement);

        modal.open();
        modal.close();
        modal.open();
        expect(modal.isOpen).toBe(false);
    });

    test('nested modals increment z-index', () => {
        document.body.innerHTML = `
            <div id="modal-1" data-modal><div class="modal__content"></div></div>
            <div id="modal-2" data-modal><div class="modal__content"></div></div>
        `;

        const m1 = new Modal(document.getElementById('modal-1'));
        const m2 = new Modal(document.getElementById('modal-2'));

        m1.open();
        m2.open();

        expect(m2.element.style.zIndex).toBeTruthy();
    });

    test('dispatches modal:opened event', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);
        const handler = jest.fn();
        modalElement.addEventListener('modal:opened', handler);

        modal.open();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test('dispatches modal:closed event', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);
        const handler = jest.fn();
        modalElement.addEventListener('modal:closed', handler);

        modal.open();
        modal.close();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test('lockBodyScroll adds is-locked class', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        expect(document.documentElement.classList.contains('is-locked')).toBe(true);
        expect(document.body.classList.contains('is-locked')).toBe(true);
    });

    test('unlockBodyScroll removes is-locked class', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        modal.close();
        expect(document.documentElement.classList.contains('is-locked')).toBe(false);
        expect(document.body.classList.contains('is-locked')).toBe(false);
    });

    test('hides siblings with aria-hidden on open', () => {
        document.body.innerHTML = `
            <div id="sibling">Sibling</div>
            <div id="test-modal" data-modal><div class="modal__content"></div></div>
        `;
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        const sibling = document.getElementById('sibling');
        expect(sibling.getAttribute('aria-hidden')).toBe('true');
    });

    test('restores siblings on close', () => {
        document.body.innerHTML = `
            <div id="sibling">Sibling</div>
            <div id="test-modal" data-modal><div class="modal__content"></div></div>
        `;
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        modal.open();
        modal.close();
        const sibling = document.getElementById('sibling');
        expect(sibling.hasAttribute('aria-hidden')).toBe(false);
    });

    test('returns focus to trigger on close', () => {
        document.body.innerHTML = `
            <div id="test-modal" data-modal><div class="modal__content"><button>Inside</button></div></div>
            <button id="trigger" data-modal-trigger="test-modal">Open</button>
        `;
        const trigger = document.getElementById('trigger');
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        trigger.focus();
        modal.open(trigger);
        modal.close();
        expect(document.activeElement).toBe(trigger);
    });
});
