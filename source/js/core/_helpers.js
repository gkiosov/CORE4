// ==========================================
// Вспомогательные функции
// ==========================================

// Счётчик для generateId (защита от коллизий при быстрых вызовах)
let _idCounter = 0;

/**
 * Проверка типа элемента
 */
export const isElement = (el) => el instanceof Element;

/**
 * Проверка, является ли элемент видимым (учитывает CSS)
 */
export const isVisible = (el) => {
    if (!isElement(el)) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const style = window.getComputedStyle(el);
    return style.display !== 'none'
        && style.visibility !== 'hidden'
        && style.opacity !== '0';
};

/**
 * Получение уникального ID
 * Приоритет: crypto.randomUUID() → Date.now() + счётчик
 */
export const generateId = (prefix = 'ds') => {
    const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${++_idCounter}`;
    return `${prefix}-${suffix}`;
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
 * Глубокое клонирование
 * Приоритет: structuredClone() → JSON.parse/stringify (с ограничениями)
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(obj);
        } catch (e) {
            // Fallback если structuredClone не справился (например, функции)
        }
    }

    // Ограниченный fallback: не сохраняет Date, Map, Set, RegExp, функции
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Проверка, является ли значение plain object (не массив, не null)
 */
export const isPlainObject = (val) => {
    return Object.prototype.toString.call(val) === '[object Object]';
};

/**
 * Безопасное получение вложенного свойства
 * Поддерживает строку 'a.b.c' или массив ['a', 'b.c']
 */
export const getNestedValue = (obj, path, fallback = null) => {
    if (obj == null) return fallback;

    const keys = Array.isArray(path) ? path : String(path).split('.');
    let result = obj;

    for (const key of keys) {
        if (result == null) return fallback;
        result = result[key];
    }

    return result === undefined ? fallback : result;
};