// ==========================================
// Управление клавиатурой
// ==========================================

import { CONFIG } from '../core/_config.js';

export const Keyboard = {
    /**
     * Проверка, является ли нажатая клавиша Escape
     */
    isEscape(e) {
        return e.key === CONFIG.KEYBOARD.ESC;
    },

    /**
     * Проверка, является ли нажатая клавиша Enter
     */
    isEnter(e) {
        return e.key === CONFIG.KEYBOARD.ENTER;
    },

    /**
     * Проверка, является ли нажатая клавиша Tab
     */
    isTab(e) {
        return e.key === CONFIG.KEYBOARD.TAB;
    },

    /**
     * Проверка, является ли нажатая клавиша стрелкой
     */
    isArrow(e) {
        return [
            CONFIG.KEYBOARD.ARROW_UP,
            CONFIG.KEYBOARD.ARROW_DOWN,
            CONFIG.KEYBOARD.ARROW_LEFT,
            CONFIG.KEYBOARD.ARROW_RIGHT
        ].includes(e.key);
    }
};