// ==========================================
// Модуль управления аккордеонами
// ==========================================

import { CONFIG, EventManager } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass, toggleClass } from '../../utilities/_dom.js';

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

    /**
     * Инициализация
     */
    init() {
        // Находим все элементы аккордеона
        const items = qsa('[data-accordion-item]', this.element);

        items.forEach((item, index) => {
            const header = qs('[data-accordion-header]', item);
            const content = qs('[data-accordion-content]', item);

            if (header && content) {
                this.items.push({ item, header, content });
                header.addEventListener('click', () => this.toggle(index));
            }
        });

        // Если multiple = false, закрываем все кроме первого
        if (!this.options.multiple && this.items.length > 1) {
            this.items.forEach((item, index) => {
                if (index > 0) {
                    this.close(index);
                }
            });
        }
    }

    /**
     * Открытие элемента
     */
    open(index) {
        const item = this.items[index];
        if (!item) return;

        if (!this.options.multiple) {
            this.closeAll();
        }

        addClass(item.item, this.options.openClass);
        item.content.style.maxHeight = item.content.scrollHeight + 'px';

        EventManager.dispatch(item.item, 'accordion:opened', { index });
    }

    /**
     * Закрытие элемента
     */
    close(index) {
        const item = this.items[index];
        if (!item) return;

        removeClass(item.item, this.options.openClass);
        item.content.style.maxHeight = '0';

        EventManager.dispatch(item.item, 'accordion:closed', { index });
    }

    /**
     * Переключение элемента
     */
    toggle(index) {
        const item = this.items[index];
        if (!item) return;

        const isOpen = item.item.classList.contains(this.options.openClass);
        isOpen ? this.close(index) : this.open(index);
    }

    /**
     * Закрытие всех элементов
     */
    closeAll() {
        this.items.forEach((_, index) => this.close(index));
    }

    /**
     * Деструктор
     */
    destroy() {
        // TODO: отписка от событий
        this.closeAll();
    }
}