// ==========================================
// Вспомогательные функции
// ==========================================

/**
 * Проверка типа элемента
 */
export const isElement = (el) => el instanceof Element;

/**
 * Проверка, является ли элемент видимым
 */
export const isVisible = (el) => {
    if (!isElement(el)) return false;
    return el.offsetWidth > 0 || el.offsetHeight > 0;
};

/**
 * Получение уникального ID
 */
export const generateId = (prefix = 'ds') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Дебаунс (ограничение частоты вызовов)
 */
export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Троттлинг (пропуск вызовов)
 */
export const throttle = (fn, delay = 300) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
};

/**
 * Клонирование объекта (глубокое)
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Проверка, является ли значение объектом
 */
export const isObject = (val) => {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
};

/**
 * Безопасное получение вложенного свойства
 */
export const getNestedValue = (obj, path, fallback = null) => {
    try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            result = result[key];
            if (result === undefined) return fallback;
        }
        return result;
    } catch (e) {
        return fallback;
    }
};