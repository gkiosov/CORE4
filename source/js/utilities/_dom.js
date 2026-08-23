// ==========================================
// DOM Utilities
// ==========================================

import { isElement } from '../core/_helpers.js';

/**
 * Safe querySelector
 */
export const qs = (selector, context = document) => {
    if (!selector) return null;
    return context.querySelector(selector);
};

/**
 * Safe querySelectorAll — returns an Array
 */
export const qsa = (selector, context = document) => {
    if (!selector) return [];
    return Array.from(context.querySelectorAll(selector));
};

/**
 * Create an element with classes, attributes and children
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
 * Toggle a single class with an optional condition
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

/**
 * Add one or more classes to an element
 */
export const addClass = (el, ...classNames) => {
    if (!isElement(el)) return;
    classNames.forEach(className => {
        if (className) el.classList.add(className);
    });
};

/**
 * Remove one or more classes from an element
 */
export const removeClass = (el, ...classNames) => {
    if (!isElement(el)) return;
    classNames.forEach(className => {
        if (className) el.classList.remove(className);
    });
};

/**
 * Set an attribute on an element
 */
export const setAttr = (el, name, value) => {
    if (!isElement(el)) return;
    el.setAttribute(name, value);
};

/**
 * Get an attribute value from an element
 */
export const getAttr = (el, name) => {
    if (!isElement(el)) return null;
    return el.getAttribute(name);
};

/**
 * Remove an attribute from an element
 */
export const removeAttr = (el, name) => {
    if (!isElement(el)) return;
    el.removeAttribute(name);
};