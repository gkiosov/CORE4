// ==========================================
// Конфигурация (единый источник истины)
// ==========================================

export const CONFIG = {
    // Префиксы для классов и атрибутов
    PREFIX: 'ds', // Дизайн-система

    // Классы для состояния компонентов
    STATE: {
        ACTIVE: 'is-active',
        OPEN: 'is-open',
        CLOSED: 'is-closed',
        HIDDEN: 'is-hidden',
        LOADING: 'is-loading',
        DISABLED: 'is-disabled'
    },

    // Атрибуты для JavaScript
    ATTR: {
        THEME: 'data-theme',
        MODAL: 'data-modal',
        ACCORDION: 'data-accordion',
        TABS: 'data-tabs',
        DROPDOWN: 'data-dropdown',
        TARGET: 'data-target'
    },

    // Селекторы
    SELECTORS: {
        MODAL: '[data-modal]',
        ACCORDION: '[data-accordion]',
        TABS: '[data-tabs]',
        DROPDOWN: '[data-dropdown]',
        BUTTON: '[data-button]'
    },

    // Клавиатура
    KEYBOARD: {
        ESC: 'Escape',
        ENTER: 'Enter',
        SPACE: ' ',
        TAB: 'Tab',
        ARROW_UP: 'ArrowUp',
        ARROW_DOWN: 'ArrowDown',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight'
    },

    // Анимации
    ANIMATION: {
        DURATION: {
            FAST: 150,
            MEDIUM: 300,
            SLOW: 500
        },
        EASING: {
            EASE: 'ease',
            EASE_IN: 'ease-in',
            EASE_OUT: 'ease-out',
            EASE_IN_OUT: 'ease-in-out'
        }
    }
};