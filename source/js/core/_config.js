// ==========================================
// Configuration (single source of truth)
// ==========================================
// Centralized constants for state classes, data attributes,
// selectors, keyboard keys, and animation parameters.
// ==========================================

export const CONFIG = {
	/** CSS class prefix used across the framework */
	PREFIX: 'core4',

	/** State class names */
	STATE: {
		ACTIVE: 'is-active',
		OPEN: 'is-open',
		CLOSED: 'is-closed',
		HIDDEN: 'is-hidden',
		LOADING: 'is-loading',
		DISABLED: 'is-disabled'
	},

	/** Data attributes used for component binding */
	ATTR: {
		THEME: 'data-theme',
		MODAL: 'data-modal',
		ACCORDION: 'data-accordion',
		TABS: 'data-tabs',
		DROPDOWN: 'data-dropdown',
		TARGET: 'data-target'
	},

	/** Query selectors for auto-initialization */
	SELECTORS: {
		MODAL: '[data-modal]',
		ACCORDION: '[data-accordion]',
		TABS: '[data-tabs]',
		DROPDOWN: '[data-dropdown]',
		BUTTON: '[data-button]',
		FORM: '[data-form]'
	},

	/** Keyboard key names */
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

	/** Animation timing tokens */
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

	/** localStorage key for theme persistence */
	THEME_KEY: 'core4-theme'
};
