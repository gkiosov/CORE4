// ==========================================
// Модуль модальных окон (экспорт)
// ==========================================

import { CONFIG } from '../../core/_config.js';
import { qsa } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';
import { Modal } from './_modal.js';

let modals = [];

export function initModals() {
    const elements = qsa(CONFIG.SELECTORS.MODAL);

    elements.forEach((element, index) => {
        const modal = new Modal(element, {
            triggerSelector: `[data-modal-trigger="${element.id || index}"]`
        });
        modals.push(modal);
    });

    // Глобальный обработчик Escape
    document.addEventListener('keydown', (e) => {
        if (!Keyboard.isEscape(e)) return;
        const openModal = modals.slice().reverse().find(m => m.isOpen);
        if (openModal) openModal.close();
    });

    // Глобальный обработчик триггеров
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (!trigger) return;

        const target = trigger.getAttribute('data-modal-trigger');
        const modalElement = document.getElementById(target);

        if (modalElement) {
            const modal = modals.find(m => m.element === modalElement);
            if (modal) {
                e.preventDefault();
                modal.toggle(trigger);
            }
        }
    });

    return modals;
}

export { Modal, modals };
export default { initModals, Modal };