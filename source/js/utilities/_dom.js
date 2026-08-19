// ==========================================
// DOM-утилиты
// ==========================================

import { isElement } from '../core/_helpers.js';

/**
 * Безопасный querySelector
 */
export const qs = (selector, context = document) => {
    if (!selector) return null;
    return context.querySelector(selector);
};

/**
 * Безопасный querySelectorAll
 */
export const qsa = (selector, context = document) => {
    if (!selector) return [];
    return Array.from(context.querySelectorAll(selector));
};

/**
 * Создание элемента
 */
export const createElement = (tag, classes = '', attrs = {}, children = []) => {
    const el = document.createElement(tag);

    if (classes) {
        el.className = classes;
    }

    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (isElement(child)) {
            el.appendChild(child);
        }
    });

    return el;
};

/**
 * Управление классами элемента
 */
export const toggleClass = (el, className, condition) => {
    if (!isElement(el)) return;
    if (condition === undefined) {
        el.classList.toggle(className);
    } else if (condition) {
        el.classList.add(className);
    } else {
        el.classList.remove(className);
    }
};

export const addClass = (el, className) => toggleClass(el, className, true);
export const removeClass = (el, className) => toggleClass(el, className, false);

/**
 * Управление атрибутами
 */
export const setAttr = (el, name, value) => {
    if (!isElement(el)) return;
    el.setAttribute(name, value);
};

export const getAttr = (el, name) => {
    if (!isElement(el)) return null;
    return el.getAttribute(name);
};

export const removeAttr = (el, name) => {
    if (!isElement(el)) return;
    el.removeAttribute(name);
};