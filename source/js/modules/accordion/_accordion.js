// ==========================================
// Модуль управления аккордеонами
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

            header.addEventListener('click', () => this.toggle(index));

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(index);
                }
            });
        });

        // Кнопки "Открыть все" / "Закрыть все"
        const expandBtn = qs('[data-accordion-expand]', this.element);
        const collapseBtn = qs('[data-accordion-collapse]', this.element);

        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.expandAll());
        }
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.collapseAll());
        }
    }

    // ================================
    // Открытие одного элемента
    // ================================

    open(index) {
        const item = this.items[index];
        if (!item || item.item.classList.contains(this.options.openClass)) return;

        // В режиме single закрываем остальные
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
    // Закрытие одного элемента
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
    // Открыть ВСЕ (игнорирует multiple)
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
    // Закрыть ВСЕ
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
    // Внутренние методы
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
        this.items.forEach(({ header }) => {
            header.removeEventListener('click', this.toggle);
            header.removeEventListener('keydown', this.toggle);
        });
        this.collapseAll(true);
    }
}

// ================================
// Автоинициализация
// ================================

export function initAccordions(selector = '[data-accordion]') {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
        return new Accordion(el, {
            multiple: el.dataset.accordionMultiple === 'true'
        });
    });
}