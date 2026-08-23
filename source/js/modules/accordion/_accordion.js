// ==========================================
// Accordion Module
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass } from '../../utilities/_dom.js';

export class Accordion {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            openClass: options.openClass || CONFIG.STATE.OPEN || 'is-open',
            multiple: options.multiple || false,
            ...options
        };

        this.items = [];
        this._handlers = [];        // Stores click/keydown handlers for cleanup
        this._expandHandler = null;   // Expand-all button handler
        this._collapseHandler = null; // Collapse-all button handler

        this.init();
    }

    init() {
        const items = qsa('[data-accordion-item]', this.element);

        items.forEach((item, index) => {
            const header = qs('[data-accordion-header]', item);
            const content = qs('[data-accordion-content]', item);

            if (!header || !content) return;

            if (!content.id) {
                content.id = `accordion-content-${index}`;
            }

            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', content.id);

            if (header.tagName.toLowerCase() !== 'button') {
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
            }

            this.items.push({ item, header, content });

            // Store bound handlers so we can remove them in destroy()
            const clickHandler = () => this.toggle(index);
            const keydownHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(index);
                }
            };

            header.addEventListener('click', clickHandler);
            header.addEventListener('keydown', keydownHandler);

            this._handlers.push({ header, clickHandler, keydownHandler });
        });

        // Expand All / Collapse All buttons
        const expandBtn = qs('[data-accordion-expand]', this.element);
        const collapseBtn = qs('[data-accordion-collapse]', this.element);

        if (expandBtn) {
            this._expandHandler = () => this.expandAll();
            expandBtn.addEventListener('click', this._expandHandler);
        }
        if (collapseBtn) {
            this._collapseHandler = () => this.collapseAll();
            collapseBtn.addEventListener('click', this._collapseHandler);
        }
    }

    // ================================
    // Open a single item
    // ================================

    open(index) {
        const item = this.items[index];
        if (!item || item.item.classList.contains(this.options.openClass)) return;

        // In single mode, close others
        if (!this.options.multiple) {
            this.items.forEach((other, i) => {
                if (i !== index && other.item.classList.contains(this.options.openClass)) {
                    this._closeAnimate(other);
                }
            });
        }

        addClass(item.item, this.options.openClass);
        item.header.setAttribute('aria-expanded', 'true');
        this._animate(item.content, 'open');

        EventManager.dispatch(item.item, 'accordion:opened', { index });
    }

    // ================================
    // Close a single item
    // ================================

    close(index, instant = false) {
        const item = this.items[index];
        if (!item || !item.item.classList.contains(this.options.openClass)) return;

        if (instant) {
            this._closeInstant(item);
            return;
        }

        item.header.setAttribute('aria-expanded', 'false');
        this._animate(item.content, 'close', () => {
            removeClass(item.item, this.options.openClass);
            EventManager.dispatch(item.item, 'accordion:closed', { index });
        });
    }

    toggle(index) {
        const item = this.items[index];
        if (!item) return;

        const isOpen = item.item.classList.contains(this.options.openClass);
        isOpen ? this.close(index) : this.open(index);
    }

    // ================================
    // Expand ALL (ignores multiple)
    // ================================

    expandAll() {
        this.items.forEach((item, index) => {
            if (item.item.classList.contains(this.options.openClass)) return;

            addClass(item.item, this.options.openClass);
            item.header.setAttribute('aria-expanded', 'true');
            this._animate(item.content, 'open');

            EventManager.dispatch(item.item, 'accordion:opened', { index });
        });
    }

    // ================================
    // Collapse ALL
    // ================================

    collapseAll(instant = false) {
        this.items.forEach((item, index) => {
            if (!item.item.classList.contains(this.options.openClass)) return;

            if (instant) {
                this._closeInstant(item);
                EventManager.dispatch(item.item, 'accordion:closed', { index });
            } else {
                item.header.setAttribute('aria-expanded', 'false');
                this._animate(item.content, 'close', () => {
                    removeClass(item.item, this.options.openClass);
                    EventManager.dispatch(item.item, 'accordion:closed', { index });
                });
            }
        });
    }

    // ================================
    // Internal methods
    // ================================

    _closeInstant(item) {
        this._clearTransition(item.content);
        removeClass(item.item, this.options.openClass);
        item.header.setAttribute('aria-expanded', 'false');
        item.content.style.height = '';
    }

    _closeAnimate(item) {
        if (!item.item.classList.contains(this.options.openClass)) return;
        item.header.setAttribute('aria-expanded', 'false');
        this._animate(item.content, 'close', () => {
            removeClass(item.item, this.options.openClass);
        });
    }

    _animate(content, direction, onComplete = null) {
        this._clearTransition(content);

        const startHeight = content.getBoundingClientRect().height;
        content.style.height = `${startHeight}px`;

        void content.offsetHeight;

        const onEnd = (e) => {
            if (e.propertyName !== 'height') return;

            if (direction === 'open') {
                content.style.height = 'auto';
            } else {
                content.style.height = '';
            }

            this._clearTransition(content);
            if (onComplete) onComplete();
        };

        content._transitionEndHandler = onEnd;
        content.addEventListener('transitionend', onEnd);

        if (direction === 'open') {
            content.style.height = `${content.scrollHeight}px`;
        } else {
            content.style.height = '0px';
        }
    }

    _clearTransition(content) {
        if (content._transitionEndHandler) {
            content.removeEventListener('transitionend', content._transitionEndHandler);
            content._transitionEndHandler = null;
        }
    }

    destroy() {
        // Remove all item-level event listeners
        this._handlers.forEach(({ header, clickHandler, keydownHandler }) => {
            header.removeEventListener('click', clickHandler);
            header.removeEventListener('keydown', keydownHandler);
        });
        this._handlers = [];

        // Remove expand/collapse button listeners
        const expandBtn = qs('[data-accordion-expand]', this.element);
        const collapseBtn = qs('[data-accordion-collapse]', this.element);

        if (expandBtn && this._expandHandler) {
            expandBtn.removeEventListener('click', this._expandHandler);
            this._expandHandler = null;
        }
        if (collapseBtn && this._collapseHandler) {
            collapseBtn.removeEventListener('click', this._collapseHandler);
            this._collapseHandler = null;
        }

        // Clean up pending transitions
        this.items.forEach(({ content }) => {
            this._clearTransition(content);
        });

        // Close all items instantly
        this.collapseAll(true);

        this.items = [];
    }
}

// ================================
// Auto-initialization
// ================================

export function initAccordions(selector = '[data-accordion]') {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
        return new Accordion(el, {
            multiple: el.dataset.accordionMultiple === 'true'
        });
    });
}