// ==========================================
// Модуль модальных окон (экспорт)
// ==========================================

import { CONFIG } from '../../core/_config.js';
import { qsa } from '../../utilities/_dom.js';
import { Modal } from './_modal.js';

let modals = [];

/**
 * Инициализация всех модалок на странице
 */
export function initModals() {
    const elements = qsa(CONFIG.SELECTORS.MODAL || '[data-modal]');

    elements.forEach((element, index) => {
        const modal = new Modal(element, {
            triggerSelector: `[data-modal-trigger="${element.id || index}"]`
        });
        modals.push(modal);
    });

    // Подписка на клики по триггерам
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (!trigger) return;

        const target = trigger.getAttribute('data-modal-trigger');
        const modalElement = document.getElementById(target);

        if (modalElement) {
            const modal = modals.find(m => m.element === modalElement);
            if (modal) {
                modal.toggle(trigger);
                e.preventDefault();
            }
        }
    });
}

export { Modal };
export default { initModals, Modal };