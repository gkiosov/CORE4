// ==========================================
// Главный файл — инициализация всех модулей
// ==========================================

import '../scss/main.scss';

import * as core from './core/_index.js';
import * as dom from './utilities/_dom.js';
import * as keyboard from './utilities/_keyboard.js';
import { FocusTrap } from './utilities/_focus-trap.js';
import { initRevealAnimations } from './utilities/_viewport.js';

import { ThemeManager } from './modules/theme/_theme.js';
import { initModals, Modal } from './modules/modal/_index.js';
import { initAccordions, Accordion } from './modules/accordion/_accordion.js';

class App {
	constructor() {
		this.modules = {};
		this.isInitialized = false;
	}

	init() {
		if (this.isInitialized) return;

		console.log('🚀 Инициализация дизайн-системы...');

		this.modules.theme = new ThemeManager();
		this.modules.modals = initModals();
		this.modules.accordions = initAccordions();

		// Reveal-анимации при скролле
		initRevealAnimations();

		this.isInitialized = true;
		console.log('✅ Дизайн-система инициализирована');
	}

	getModule(name) {
		return this.modules[name] || null;
	}

	destroy() {
		Object.values(this.modules).forEach(mod => {
			if (mod && typeof mod.destroy === 'function') {
				mod.destroy();
			}
		});
		this.isInitialized = false;
	}
}

const app = new App();

document.addEventListener('DOMContentLoaded', () => {
	app.init();
});

window.DS = {
	app,
	core,
	utils: { dom, keyboard },
	components: { ThemeManager, Modal, Accordion, FocusTrap }
};

if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
	console.log('🔧 Доступны глобальные переменные:', Object.keys(window.DS));
}

export default app;