// ==========================================
// Главный файл — инициализация всех модулей
// ==========================================

import '../scss/main.scss';

// Импорт ядра
import * as core from './core/_index.js';

// Импорт утилит
import * as dom from './utilities/_dom.js';
import * as keyboard from './utilities/_keyboard.js';
import { FocusTrap } from './utilities/_focus-trap.js';

// Импорт модулей
import { ThemeManager } from './modules/theme/_theme.js';
import { initModals, Modal } from './modules/modal/_index.js';
import { Accordion } from './modules/accordion/_accordion.js';

// ==========================================
// Класс приложения (единая точка входа)
// ==========================================

class App {
	constructor() {
		this.modules = {};
		this.isInitialized = false;
	}

	/**
	 * Инициализация приложения
	 */
	init() {
		if (this.isInitialized) return;

		console.log('🚀 Инициализация дизайн-системы...');

		// 1. Тема
		this.modules.theme = new ThemeManager();

		// 2. Модалки
		initModals();
		this.modules.modal = { Modal };

		// 3. Аккордеоны
		const accordions = document.querySelectorAll('[data-accordion]');
		accordions.forEach((el, index) => {
			const accordion = new Accordion(el, {
				multiple: el.getAttribute('data-accordion-multiple') === 'true'
			});
			this.modules[`accordion-${index}`] = accordion;
		});

		// 4. Табы (можно добавить позже)
		// 5. Дропдауны (можно добавить позже)

		this.isInitialized = true;

		console.log('✅ Дизайн-система инициализирована');
		console.log('📦 Модули:', Object.keys(this.modules));
	}

	/**
	 * Получение модуля
	 */
	getModule(name) {
		return this.modules[name] || null;
	}

	/**
	 * Деструктор
	 */
	destroy() {
		// TODO: очистка всех модулей
		this.isInitialized = false;
	}
}

// ==========================================
// Создание экземпляра и экспорт
// ==========================================

const app = new App();

// Автоматическая инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
	app.init();
});

// Экспорт для глобального доступа
window.DS = window.DS || {};
window.DS.app = app;
window.DS.core = core;
window.DS.utils = { dom, keyboard };
window.DS.components = { ThemeManager, Modal, Accordion, FocusTrap };

// ==========================================
// Дебаг-инструменты (только в разработке)
// ==========================================

if (process.env.NODE_ENV === 'development') {
	console.log('🔧 Доступны глобальные переменные:');
	console.log('  - window.DS.app');
	console.log('  - window.DS.utils');
	console.log('  - window.DS.components');
}

export default app;