// ==========================================
// Модуль управления модальными окнами
// ==========================================

import { CONFIG, EventManager, generateId } from '../../core/_index.js';
import { qs, qsa, addClass, removeClass, toggleClass } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';
import { FocusTrap } from '../../utilities/_focus-trap.js';

export class Modal {
    constructor(element, options = {}) {
        this.element = element;
        this.id = element.id || generateId('modal');
        this.options = {
            openClass: options.openClass || CONFIG.STATE.OPEN || 'is-open',
            closeOnOutsideClick: options.closeOnOutsideClick !== undefined ? options.closeOnOutsideClick : true,
            closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
            focusOnOpen: options.focusOnOpen !== undefined ? options.focusOnOpen : true,
            ...options
        };

        this.isOpen = false;
        this.focusTrap = null;
        this.triggerElement = null;

        // Элементы внутри модалки
        this.closeButton = qs('[data-modal-close]', this.element);
        this.overlay = qs('[data-modal-overlay]', this.element) || this.element.parentElement;

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        // Добавляем ID
        if (!this.element.id) {
            this.element.id = this.id;
        }

        // Навешиваем события
        this.bindEvents();

        // Активируем ловушку фокуса
        this.focusTrap = new FocusTrap(this.element);
    }

    /**
     * Открытие модалки
     */
    open(triggerElement = null) {
        if (this.isOpen) return;

        this.triggerElement = triggerElement;
        this.isOpen = true;

        // Добавляем класс открытия
        addClass(this.element, this.options.openClass);

        // Обновляем ловушку фокуса
        this.focusTrap.updateFocusableElements();
        this.focusTrap.activate();

        // Фокус на первом элементе
        if (this.options.focusOnOpen) {
            this.focusTrap.focusFirst();
        }

        // Блокируем скролл
        document.body.style.overflow = 'hidden';

        // Диспатчим событие
        EventManager.dispatch(this.element, 'modal:opened', { trigger: triggerElement });

        return this;
    }

    /**
     * Закрытие модалки
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;

        // Удаляем класс открытия
        removeClass(this.element, this.options.openClass);

        // Деактивируем ловушку фокуса
        this.focusTrap.deactivate();

        // Возвращаем фокус на триггер
        if (this.triggerElement) {
            this.triggerElement.focus();
        }

        // Разблокируем скролл
        document.body.style.overflow = '';

        // Диспатчим событие
        EventManager.dispatch(this.element, 'modal:closed');

        return this;
    }

    /**
     * Переключение модалки
     */
    toggle(triggerElement = null) {
        return this.isOpen ? this.close() : this.open(triggerElement);
    }

    /**
     * Подписка на события
     */
    bindEvents() {
        // Закрытие по клику на кнопку закрытия
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }

        // Закрытие по клику на оверлей
        if (this.options.closeOnOutsideClick && this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay || e.target === this.element) {
                    this.close();
                }
            });
        }

        // Закрытие по Escape
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (this.isOpen && Keyboard.isEscape(e)) {
                    this.close();
                }
            });
        }
    }

    /**
     * Деструктор
     */
    destroy() {
        // TODO: отписка от событий
        if (this.isOpen) {
            this.close();
        }
    }
}