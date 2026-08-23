// ==========================================
// Event Manager (custom events)
// ==========================================
// Thin wrapper around CustomEvent for dispatching,
// subscribing, and one-shot listening.
// ==========================================

export const EventManager = {
	/**
	 * Dispatch a custom event on an element.
	 * @param {Element} element	– target element
	 * @param {string} eventName   – custom event name
	 * @param {Object} detail	  – payload attached to event.detail
	 * @returns {CustomEvent}
	 */
	dispatch(element, eventName, detail = {}) {
		const event = new CustomEvent(eventName, {
			bubbles: true,
			cancelable: true,
			detail
		});
		element.dispatchEvent(event);
		return event;
	},

	/**
	 * Subscribe to a custom event. Returns an unsubscribe function.
	 * @param {Element} element
	 * @param {string} eventName
	 * @param {Function} callback
	 * @returns {Function}  – call to remove the listener
	 */
	on(element, eventName, callback) {
		element.addEventListener(eventName, callback);
		return () => element.removeEventListener(eventName, callback);
	},

	/**
	 * Subscribe once to a custom event. The listener auto-removes after firing.
	 * @param {Element} element
	 * @param {string} eventName
	 * @param {Function} callback
	 * @returns {Function}  – the internal handler (for manual removal if needed)
	 */
	once(element, eventName, callback) {
		const handler = (e) => {
			callback(e);
			element.removeEventListener(eventName, handler);
		};
		element.addEventListener(eventName, handler);
		return handler;
	}
};
