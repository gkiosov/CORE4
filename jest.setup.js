class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

Element.prototype.scrollIntoView = jest.fn();