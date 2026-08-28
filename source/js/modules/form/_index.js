// ==========================================
// Form Module (exports)
// ==========================================
// Auto-initializes all forms with [data-form] on the page.
// Supports data-form="async" for AJAX-style submission,
// data-form-progress for fill-completion indicator,
// data-wizard for multi-step forms,
// and data-draft-key for auto-saving drafts.
// ==========================================

import { qsa } from '../../utilities/_dom.js';
import { Form } from './_form.js';
import { Wizard } from './_wizard.js';
import { DraftSaver } from './_draft-saver.js';
import { PasswordStrength } from './_password-strength.js';

let forms = [];
let wizards = [];
let draftSavers = [];

/**
 * Initialize all [data-form] elements on the page.
 * Clears stale references on re-init (App.reinit() safe).
 * @param {string} selector  – CSS selector (default: '[data-form]')
 * @returns {Form[]}
 */
export function initForms(selector = '[data-form]') {
	// Clear old references
	forms = [];
	wizards = [];
	draftSavers = [];

	const elements = qsa(selector);

	elements.forEach((element) => {
		const form = new Form(element, {
			liveValidate: element.dataset.formLive !== 'false',
			validateOnSubmit: element.dataset.formValidate !== 'false',
			showSummary: element.dataset.formSummary === 'true',
			showProgress: element.dataset.formProgress === 'true',
			debounceDelay: parseInt(element.dataset.formDebounce, 10) || 300
		});
		forms.push(form);

		// Initialize wizard if data-wizard is present
		if (element.hasAttribute('data-wizard')) {
			const wizard = new Wizard(element);
			wizard.attachForm(form);
			wizards.push(wizard);
		}

		// Initialize draft saver if data-draft-key is present
		if (element.dataset.draftKey) {
			const saver = new DraftSaver(element, {
				storageKey: element.dataset.draftKey,
				debounceDelay: parseInt(element.dataset.draftDebounce, 10) || 1000,
				restoreOnLoad: element.dataset.draftRestore !== 'false',
				clearOnSubmit: element.dataset.draftClear !== 'false'
			});
			draftSavers.push(saver);
		}
	});

	return forms;
}

/** Get all initialized form instances. */
export function getForms() {
	return forms;
}

/** Get a form instance by element or id. */
export function getForm(id) {
	return forms.find(f => f.element.id === id || f.element === id) || null;
}

/** Get all initialized wizard instances. */
export function getWizards() {
	return wizards;
}

/** Get a wizard instance by element or id. */
export function getWizard(id) {
	return wizards.find(w => w.element.id === id || w.element === id) || null;
}

/** Get all initialized draft saver instances. */
export function getDraftSavers() {
	return draftSavers;
}

export { Form, Wizard, DraftSaver, PasswordStrength };
export default { initForms, getForms, getForm, getWizards, getWizard, getDraftSavers, Form, Wizard, DraftSaver, PasswordStrength };