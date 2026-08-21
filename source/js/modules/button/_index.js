// ==========================================
// Модуль кнопок (экспорт)
// ==========================================

import { qsa } from '../../utilities/_dom.js';
import { Button } from './_button.js';

let buttons = [];

/**
 * Инициализация всех кнопок на странице
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