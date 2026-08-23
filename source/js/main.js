// ==========================================
// Entry point — initializes all modules
// ==========================================

import '../scss/main.scss';

import * as core from './core/_index.js';
import * as dom from './utilities/_dom.js';
import * as keyboard from './utilities/_keyboard.js';
import { FocusTrap } from './utilities/_focus-trap.js';
import { initRevealAnimations } from './utilities/_viewport.js';

import { ThemeManager } from './modules/theme/_theme.js';

class App {
	constructor(config = {}) {
		this.modules = {};
		this.isInitialized = false;

		this.config = {
			modules: {
				theme: true,
				modals: true,
				accordions: true,
				buttons: true,
				dropdowns: true,
				likeButtons: true,
				revealAnimations: true,
				...config.modules
			}
		};

		// Cache for lazy-loaded modules
		this._factories = {};
	}

	async init() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		await this._initModules();
	}

	/**
	 * Re-initialize modules for dynamically added DOM elements.
	 * Safe to call multiple times — destroys old instances before creating new ones.
	 */
	async reinit() {
		await this._initModules(/* isReinit = */ true);
	}

	async _initModules(isReinit = false) {
		const cfg = this.config.modules;

		// ThemeManager is lightweight — always loaded statically
		if (cfg.theme && !this.modules.theme) {
			this.modules.theme = new ThemeManager();
		}

		// Lazy-load modules only if enabled AND matching elements exist in DOM.
		// import() must use a string literal so webpack can analyze and split chunks.

		// Modals
		if (cfg.modals && document.querySelector('[data-modal]')) {
			if (!this._factories.modals) {
				this._factories.modals = await import(
					/* webpackChunkName: "modals" */
					'./modules/modal/_index.js'
					);
			}
			this._registerModule('modals', () => this._factories.modals.initModals(), isReinit);
			window.CORE4.components.Modal = this._factories.modals.Modal;
		}

		// Accordions
		if (cfg.accordions && document.querySelector('[data-accordion]')) {
			if (!this._factories.accordions) {
				this._factories.accordions = await import(
					/* webpackChunkName: "accordions" */
					'./modules/accordion/_accordion.js'
					);
			}
			this._registerModule('accordions', () => this._factories.accordions.initAccordions(), isReinit);
			window.CORE4.components.Accordion = this._factories.accordions.Accordion;
		}

		// Buttons
		if (cfg.buttons && document.querySelector('[data-button]')) {
			if (!this._factories.buttons) {
				this._factories.buttons = await import(
					/* webpackChunkName: "buttons" */
					'./modules/button/_index.js'
					);
			}
			this._registerModule('buttons', () => this._factories.buttons.initButtons(), isReinit);
			window.CORE4.components.Button = this._factories.buttons.Button;
		}

		// Dropdowns
		if (cfg.dropdowns && document.querySelector('[data-dropdown]')) {
			if (!this._factories.dropdowns) {
				this._factories.dropdowns = await import(
					/* webpackChunkName: "dropdowns" */
					'./modules/dropdown/_dropdown.js'
					);
			}
			this._registerModule('dropdowns', () => this._factories.dropdowns.initDropdowns(), isReinit);
			window.CORE4.components.Dropdown = this._factories.dropdowns.Dropdown;
		}

		// Reveal animations (lightweight, no chunk needed)
		if (cfg.revealAnimations) {
			initRevealAnimations();
		}
	}

	/**
	 * Helper: destroy old instances (on reinit) and merge new ones.
	 */
	_registerModule(name, initFn, isReinit) {
		if (isReinit && this.modules[name]) {
			this.modules[name].forEach(instance => {
				if (typeof instance.destroy === 'function') {
					instance.destroy();
				}
			});
		}
		const newInstances = initFn();
		this.modules[name] = [...(this.modules[name] || []), ...newInstances];
	}

	getModule(name) {
		return this.modules[name] || null;
	}

	destroy() {
		Object.values(this.modules).forEach(moduleList => {
			if (Array.isArray(moduleList)) {
				moduleList.forEach(m => m.destroy?.());
			} else if (moduleList && typeof moduleList.destroy === 'function') {
				moduleList.destroy();
			}
		});
		this.modules = {};
		this._factories = {};
		this.isInitialized = false;
	}
}

const app = new App({
	modules: {
		theme: true,
		modals: true,
		accordions: true,
		buttons: true,
		dropdowns: true,
		likeButtons: false,
		revealAnimations: true
	}
});

document.addEventListener('DOMContentLoaded', async () => {
	await app.init();
});

window.CORE4 = {
	app,
	core,
	utils: { dom, keyboard },
	components: { ThemeManager, FocusTrap }
	// Modal, Accordion, Button, Dropdown, LikeButton are added lazily by init()
};

if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
	console.log('🔧 Global variables available:', Object.keys(window.CORE4));
}

export default app;