// ==========================================
// Модуль управления модальными окнами
// ==========================================

import { CONFIG, EventManager, generateId } from '../../core/_index.js';
import { qs, addClass, removeClass } from '../../utilities/_dom.js';
import { FocusTrap } from '../../utilities/_focus-trap.js';

export class Modal {
    static openCount = 0;

    constructor(element, options = {}) {
        this.element = element;
        this.id = element.id || generateId('modal');
        this.options = {
            openClass: options.openClass || CONFIG.STATE.OPEN || 'is-open',
            closeOnOutsideClick: options.closeOnOutsideClick !== false,
            closeOnEscape: options.closeOnEscape !== false,
            focusOnOpen: options.focusOnOpen !== false,
            ...options
        };

        this.isOpen = false;
        this.focusTrap = null;
        this.triggerElement = null;
        this.closeButton = qs('[data-modal-close]', this.element);
        this.overlay = qs('[data-modal-overlay]', this.element) || this.element.parentElement;

        this.init();
    }

    init() {
        if (!this.element.id) {
            this.element.id = this.id;
        }
        this.bindEvents();
        this.focusTrap = new FocusTrap(this.element);
    }

    open(triggerElement = null) {
        if (this.isOpen) return;

        this.triggerElement = triggerElement;
        this.isOpen = true;
        Modal.openCount++;

        if (Modal.openCount === 1) {
            document.body.style.overflow = 'hidden';
            this._hideSiblings();
        }

        addClass(this.element, this.options.openClass);

        this.focusTrap.updateFocusableElements();
        this.focusTrap.activate();

        if (this.options.focusOnOpen) {
            this.focusTrap.focusFirst();
        }

        EventManager.dispatch(this.element, 'modal:opened', { trigger: triggerElement });

        return this;
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        Modal.openCount--;

        removeClass(this.element, this.options.openClass);
        this.focusTrap.deactivate();

        if (Modal.openCount <= 0) {
            Modal.openCount = 0;
            document.body.style.overflow = '';
            this._restoreSiblings();
        }

        if (this.triggerElement) {
            this.triggerElement.focus();
        }

        EventManager.dispatch(this.element, 'modal:closed');

        return this;
    }

    toggle(triggerElement = null) {
        return this.isOpen ? this.close() : this.open(triggerElement);
    }

    bindEvents() {
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }

        if (this.options.closeOnOutsideClick && this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay || e.target === this.element) {
                    this.close();
                }
            });
        }
    }

    _hideSiblings() {
        const siblings = Array.from(document.body.children).filter(
            el => el !== this.element && !el.contains(this.element)
        );
        siblings.forEach(el => {
            if (!el.hasAttribute('aria-hidden')) {
                el.setAttribute('aria-hidden', 'true');
                el.dataset.modalHidden = '';
            }
        });
    }

    _restoreSiblings() {
        document.querySelectorAll('[data-modal-hidden]').forEach(el => {
            el.removeAttribute('aria-hidden');
            el.removeAttribute('data-modal-hidden');
        });
    }

    destroy() {
        if (this.isOpen) {
            this.close();
        }
        // TODO: отписка от событий closeButton/overlay
    }
}