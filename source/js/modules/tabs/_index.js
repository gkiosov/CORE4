// ==========================================
// Tabs Module (exports)
// ==========================================
// Auto-initialization and module-level helpers.
// ==========================================

import { CONFIG } from '../../core/_config.js';
import { qsa } from '../../utilities/_dom.js';
import { Tabs, initTabs, getTabs, activateTab } from './_tabs.js';

/**
 * Initialize all [data-tabs] elements on the page.
 * Clears stale references on re-init (App.reinit() safe).
 * @returns {Tabs[]}
 */
function initTabsModule(selector = CONFIG.SELECTORS.TABS) {
	return initTabs(selector);
}

/** Get all initialized Tabs instances. */
function getTabsModule() {
	return getTabs();
}

/** Activate a tab by container ID and index. */
function activateTabModule(containerId, index) {
	return activateTab(containerId, index);
}

/** Get a Tabs instance by element or ID. */
function getTabInstance(ref) {
	const instances = getTabs();
	if (typeof ref === 'string') {
		return instances.find(t => t.id === ref || t.element.id === ref) || null;
	}
	return instances.find(t => t.element === ref) || null;
}

export { Tabs, initTabsModule as initTabs, getTabsModule as getTabs, activateTabModule as activateTab, getTabInstance };
export default { initTabs: initTabsModule, Tabs, getTabs: getTabsModule, activateTab: activateTabModule, getTabInstance };