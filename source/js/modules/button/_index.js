// ==========================================
// Button Module (exports)
// ==========================================

import { qsa } from '../../utilities/_dom.js';
import { Button } from './_button.js';

let buttons = [];

/**
 * Initialize all [data-button] elements on the page.
 * @param {string} selector  – CSS selector (default: '[data-button]')
 * @returns {Button[]}
 */
export function initButtons(selector = '[data-button]') {
	const elements = qsa(selector);

	elements.forEach((element) => {
		const btn = new Button(element);
		buttons.push(btn);
	});

	return buttons;
}

export { Button };
export default { initButtons, Button };
