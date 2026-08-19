// ==========================================
// Управление фокусом (для модалок)
// ==========================================

import { qsa, qs } from './_dom.js';

export class FocusTrap {
    constructor(element) {
        this.element = element;
        this.focusableElements = null;
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.focusedElement = null;

        this.updateFocusableElements();
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    /**
     * Обновление списка фокусируемых элементов
     */
    updateFocusableElements() {
        const selectors = [
            'button:not([disabled])',
            'a[href]:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        ];

        this.focusableElements = qsa(selectors.join(','), this.element);

        if (this.focusableElements.length > 0) {
            this.firstFocusable = this.focusableElements[0];
            this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
        }
    }

    /**
     * Активация ловушки фокуса
     */
    activate() {
        this.focusedElement = document.activeElement;
        document.addEventListener('keydown', this.handleKeydown);
        this.focusFirst();
    }

    /**
     * Деактивация ловушки фокуса
     */
    deactivate() {
        document.removeEventListener('keydown', this.handleKeydown);
        if (this.focusedElement) {
            this.focusedElement.focus();
        }
    }

    /**
     * Фокус на первом элементе
     */
    focusFirst() {
        if (this.firstFocusable) {
            this.firstFocusable.focus();
        }
    }

    /**
     * Фокус на последнем элементе
     */
    focusLast() {
        if (this.lastFocusable) {
            this.lastFocusable.focus();
        }
    }

    /**
     * Обработка нажатий клавиш (Tab)
     */
    handleKeydown(e) {
        if (!Keyboard.isTab(e)) return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.focusLast();
            }
        } else {
            // Tab
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.focusFirst();
            }
        }
    }
}