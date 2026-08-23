// ==========================================
// Modal Module (exports)
// ==========================================
// Supports multiple triggers per modal:
// any number of elements with data-modal-trigger="modal-id"
// will open the same modal. Focus returns to the specific
// trigger that opened it.
// ==========================================

import { CONFIG } from '../../core/_config.js';
import { qsa } from '../../utilities/_dom.js';
import { Keyboard } from '../../utilities/_keyboard.js';
import { Modal } from './_modal.js';

let modals = [];
let _escapeHandler = null;
let _triggerClickHandler = null;
let _popstateHandler = null;

/**
 * Initialize all [data-modal] elements on the page.
 * Clears stale references on re-init (App.reinit() safe).
 * Processes auto-triggers: delay, scroll, exit-intent, beforeunload.
 * @returns {Modal[]}
 */
export function initModals() {
	// Clear old references — old instances are destroyed by App._registerModule
	modals = [];

	const elements = qsa(CONFIG.SELECTORS.MODAL);

	elements.forEach((element, index) => {
		const modal = new Modal(element, {
			triggerSelector: `[data-modal-trigger="${element.id || index}"]`,
			history: element.dataset.modalHistory !== 'false'
		});
		modals.push(modal);

		// --- Auto-triggers from data attributes ---

		// 1. Delay: open after N ms
		const delay = element.dataset.modalDelay;
		if (delay) {
			modal.scheduleDelay(parseInt(delay, 10));
		}

		// 2. Scroll: open after scrolling N pixels
		const scrollThreshold = element.dataset.modalScroll;
		if (scrollThreshold) {
			modal.enableScrollTrigger(scrollThreshold);
		}

		// 3. Exit intent: mouse leaves viewport top
		if (element.dataset.modalExitIntent === 'true') {
			modal.enableExitIntent();
		}

		// 4. Beforeunload: native browser warning
		if (element.dataset.modalBeforeunload === 'true') {
			modal.enableBeforeunload();
		}
	});

	// Global Escape — closes the topmost open modal
	if (!_escapeHandler) {
		_escapeHandler = (e) => {
			if (!Keyboard.isEscape(e)) return;
			const openModal = modals.slice().reverse().find(m => m.isOpen);
			if (openModal) openModal.close();
		};
		document.addEventListener('keydown', _escapeHandler);
	}

	// Global trigger click — ANY element with data-modal-trigger="id"
	// Multiple triggers per modal are fully supported.
	if (!_triggerClickHandler) {
		_triggerClickHandler = (e) => {
			const trigger = e.target.closest('[data-modal-trigger]');
			if (!trigger) return;

			const target = trigger.getAttribute('data-modal-trigger');
			const modalElement = document.getElementById(target);

			if (modalElement) {
				const modal = modals.find(m => m.element === modalElement);
				if (modal) {
					e.preventDefault();
					modal.toggle(trigger);
				}
			}
		};
		document.addEventListener('click', _triggerClickHandler);
	}

	// Global popstate — browser Back/Forward button navigation
	if (!_popstateHandler) {
		_popstateHandler = (e) => {
			const modalId = e.state?.core4Modal;

			if (modalId) {
				// Forward navigation TO a modal state — open it without pushing new history
				const modal = modals.find(m => m.id === modalId);
				if (modal && !modal.isOpen) {
					modal.open(null, { skipHistory: true });
				}
			} else {
				// Back navigation AWAY from modal state — close any open modals
				modals.forEach(m => {
					if (m.isOpen) m.close({ skipHistory: true });
				});
			}
		};
		window.addEventListener('popstate', _popstateHandler);
	}

	return modals;
}

/** Open a modal by ID programmatically. */
export function openModal(id) {
	const modal = modals.find(m => m.element.id === id);
	modal?.open();
	return modal || null;
}

/** Close a modal by ID, or close all if no ID given. */
export function closeModal(id = null) {
	if (id) {
		modals.find(m => m.element.id === id)?.close();
	} else {
		[...modals].reverse().forEach(m => m.close());
	}
}

/** Get all initialized modal instances. */
export function getModals() {
	return modals;
}

export { Modal, modals };
export default { initModals, Modal, openModal, closeModal, getModals };