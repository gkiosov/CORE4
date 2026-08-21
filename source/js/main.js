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
import { initButtons, Button } from './modules/button/_index.js';
import { initDropdowns, Dropdown } from './modules/dropdown/_index.js';
//import { initLikeButtons, LikeButton } from './modules/like-button/_index.js';

class App {
	constructor(config = {}) {
		this.modules = {};
		this.isInitialized = false; // ← добавлено

		this.config = {
			modules: {
				theme: true,
				modals: true,
				accordions: true,
				buttons: true,
				dropdowns: true,
				//likeButtons: true,
				revealAnimations: true,
				...config.modules
			}
		};
	}

	init() {
		if (this.isInitialized) return; // ← guard от двойного вызова
		this.isInitialized = true;      // ← сразу ставим флаг

		const cfg = this.config.modules;

		if (cfg.theme) this.modules.theme = new ThemeManager();
		if (cfg.modals) this.modules.modals = initModals();
		if (cfg.accordions) this.modules.accordions = initAccordions();
		if (cfg.buttons) this.modules.buttons = initButtons();
		if (cfg.dropdowns) this.modules.dropdowns = initDropdowns();
		//if (cfg.likeButtons) this.modules.likeButtons = initLikeButtons();
		if (cfg.revealAnimations) initRevealAnimations();
	}
}

const app = new App({
	modules: {
		theme: true,
		modals: true,
		accordions: true,
		buttons: true,
		dropdowns: true,
		//likeButtons: false,
		revealAnimations: true
	}
});

document.addEventListener('DOMContentLoaded', () => {
	app.init();
});

window.CORE4 = {
	app,
	core,
	utils: { dom, keyboard },
	components: { ThemeManager, Modal, Accordion, Button, Dropdown, FocusTrap }
};

if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
	console.log('🔧 Доступны глобальные переменные:', Object.keys(window.DS));
}

export default app;