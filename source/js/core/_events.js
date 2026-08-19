// ==========================================
// Управление событиями (кастомные события)
// ==========================================

export const EventManager = {
    /**
     * Создание и диспатч кастомного события
     */
    dispatch(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail
        });
        element.dispatchEvent(event);
        return event;
    },

    /**
     * Подписка на кастомное событие
     */
    on(element, eventName, callback) {
        element.addEventListener(eventName, callback);
        return () => element.removeEventListener(eventName, callback);
    },

    /**
     * Подписка на событие с автоматической отпиской
     */
    once(element, eventName, callback) {
        const handler = (e) => {
            callback(e);
            element.removeEventListener(eventName, handler);
        };
        element.addEventListener(eventName, handler);
        return handler;
    }
};