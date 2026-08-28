// ==========================================
// Entry point — initializes all modules
// ==========================================
// Orchestrates lazy loading of heavy modules and
// exposes the CORE4 namespace on window for debugging.
// ==========================================

import '../scss/main.scss';

import * as core from './core/_index.js';
import * as dom from './utilities/_dom.js';
import * as keyboard from './utilities/_keyboard.js';
import { FocusTrap } from './utilities/_focus-trap.js';
import { initRevealAnimations } from './utilities/_viewport.js';

import { ThemeManager } from './modules/theme/_theme.js';

class App {
	/**
	 * @param {Object} config  – module activation flags
	 */
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
				revealAnimations: true,
				forms: true,
				...config.modules
			}
		};

		// Cache for lazy-loaded dynamic imports
		this._factories = {};
	}

	/**
	 * Initialize the application once.
	 * Safe to call — guards against double initialization.
	 */
	async init() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		await this._initModules();
	}

	/**
	 * Re-initialize modules for dynamically added DOM elements.
	 * Destroys old instances before creating new ones.
	 */
	async reinit() {
		await this._initModules(/* isReinit = */ true);
	}

	/**
	 * Initialize or re-initialize all enabled modules.
	 * Heavy modules are lazy-loaded via dynamic import() only
	 * when their corresponding DOM elements are present.
	 * @param {boolean} isReinit  – true when called from reinit()
	 * @private
	 */
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

		// Forms
		if (cfg.forms && document.querySelector('[data-form]')) {
			if (!this._factories.forms) {
				this._factories.forms = await import(
					/* webpackChunkName: "forms" */
					'./modules/form/_index.js'
					);
			}
			this._registerModule('forms', () => this._factories.forms.initForms(), isReinit);
			window.CORE4.components.Form = this._factories.forms.Form;
			window.CORE4.components.Wizard = this._factories.forms.Wizard;
			window.CORE4.components.DraftSaver = this._factories.forms.DraftSaver;
			window.CORE4.components.PasswordStrength = this._factories.forms.PasswordStrength;
		}
	}

	/**
	 * Helper: destroy old instances (on reinit) and merge new ones.
	 * @param {string} name       – module key
	 * @param {Function} initFn   – factory returning new instances
	 * @param {boolean} isReinit  – whether this is a re-initialization
	 * @private
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

	/**
	 * Retrieve an initialized module by name.
	 * @param {string} name
	 * @returns {Array|Object|null}
	 */
	getModule(name) {
		return this.modules[name] || null;
	}

	/**
	 * Tear down all modules and reset state.
	 */
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
		forms: true,
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
	// Modal, Accordion, Button, Dropdown are added lazily by init()
};

if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
	console.log('🔧 Global variables available:', Object.keys(window.CORE4));
}

export default app;
