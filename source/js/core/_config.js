// ==========================================
// Конфигурация (единый источник истины)
// ==========================================

export const CONFIG = {
    PREFIX: 'core4',

    STATE: {
        ACTIVE: 'is-active',
        OPEN: 'is-open',
        CLOSED: 'is-closed',
        HIDDEN: 'is-hidden',
        LOADING: 'is-loading',
        DISABLED: 'is-disabled'
    },

    ATTR: {
        THEME: 'data-theme',
        MODAL: 'data-modal',
        ACCORDION: 'data-accordion',
        TABS: 'data-tabs',
        DROPDOWN: 'data-dropdown',
        TARGET: 'data-target'
    },

    SELECTORS: {
        MODAL: '[data-modal]',
        ACCORDION: '[data-accordion]',
        TABS: '[data-tabs]',
        DROPDOWN: '[data-dropdown]',
        BUTTON: '[data-button]'
    },

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
    },

    THEME_KEY: 'core4-Theme'
};