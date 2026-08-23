// ==========================================
// Управление фокусом (для модалок)
// ==========================================

import { qsa } from './_dom.js';
import { Keyboard } from './_keyboard.js';

export class FocusTrap {
    constructor(element) {
        this.element = element;
        this.focusableElements = [];
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.focusedElement = null;

        this.handleKeydown = this.handleKeydown.bind(this);
    }

    updateFocusableElements() {
        const selectors = [
            'button:not([disabled])',
            'a[href]:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])',
            'details > summary'
        ];

        this.focusableElements = qsa(selectors.join(','), this.element);

        if (this.focusableElements.length > 0) {
            this.firstFocusable = this.focusableElements[0];
            this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
        }
    }

    activate() {
        this.updateFocusableElements();
        this.focusedElement = document.activeElement;
        document.addEventListener('keydown', this.handleKeydown);
    }

    deactivate() {
        document.removeEventListener('keydown', this.handleKeydown);
        if (this.focusedElement && document.contains(this.focusedElement)) {
            this.focusedElement.focus();
        }
    }

    focusFirst() {
        if (this.firstFocusable) {
            this.firstFocusable.focus();
        }
    }

    focusLast() {
        if (this.lastFocusable) {
            this.lastFocusable.focus();
        }
    }

    handleKeydown(e) {
        if (!Keyboard.isTab(e)) return;

        if (e.shiftKey) {
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.focusLast();
            }
        } else {
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.focusFirst();
            }
        }
    }
}