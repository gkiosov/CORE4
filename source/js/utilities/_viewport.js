// ==========================================
// Утилиты для работы с viewport
// ==========================================

/**
 * Проверяет, находится ли элемент в пределах экрана
 */
export function isInViewport(el, offset = 0) {
	if (!el || !(el instanceof Element)) return false;

	const rect = el.getBoundingClientRect();
	return (
		rect.top < window.innerHeight + offset &&
		rect.bottom > -offset &&
		rect.left < window.innerWidth &&
		rect.right > 0
	);
}

/**
 * IntersectionObserver: вызов callback при появлении элемента в viewport
 */
export function onViewportEnter(el, onEnter, options = {}) {
	if (!el) return null;

	const {
		root = null,
		rootMargin = '0px',
		threshold = 0,
		once = true
	} = options;

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				onEnter(entry.target, entry);
				if (once) observer.unobserve(entry.target);
			}
		});
	}, { root, rootMargin, threshold });

	observer.observe(el);
	return observer;
}

/**
 * IntersectionObserver: вызов callback при исчезновении из viewport
 */
export function onViewportLeave(el, onLeave, options = {}) {
	if (!el) return null;

	const {
		root = null,
		rootMargin = '0px',
		threshold = 0
	} = options;

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				onLeave(entry.target, entry);
			}
		});
	}, { root, rootMargin, threshold });

	observer.observe(el);
	return observer;
}

/**
 * IntersectionObserver: вызов callback при появлении ИЛИ исчезновении
 */
export function onViewportChange(el, onChange, options = {}) {
	if (!el) return null;

	const {
		root = null,
		rootMargin = '0px',
		threshold = 0
	} = options;

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			onChange(entry.target, entry, entry.isIntersecting);
		});
	}, { root, rootMargin, threshold });

	observer.observe(el);
	return observer;
}

/**
 * Проверяет, ушёл ли элемент за указанный край viewport
 * @param {IntersectionObserverEntry} entry
 * @param {string} edge - 'top' | 'bottom' | 'left' | 'right' | 'any'
 */
function isExitByEdge(entry, edge) {
	if (edge === 'any') return true;

	const rect = entry.boundingClientRect;
	const rootBounds = entry.rootBounds || {
		top: 0,
		left: 0,
		bottom: window.innerHeight,
		right: window.innerWidth
	};

	switch (edge) {
		case 'top':
			return rect.bottom < rootBounds.top;
		case 'bottom':
			return rect.top > rootBounds.bottom;
		case 'left':
			return rect.right < rootBounds.left;
		case 'right':
			return rect.left > rootBounds.right;
		default:
			return true;
	}
}

/**
 * Автоинициализация reveal-анимаций для [data-reveal]
 *
 * data-атрибуты:
 *   data-reveal-delay="200"        — задержка в ms
 *   data-reveal-duration="600"     — длительность в ms
 *   data-reveal-direction="up"     — up | down | left | right
 *   data-reveal-once="true"        — остаётся видимым после первого появления
 *   data-reveal-exit-edge="bottom" — за какой край уходит, чтобы скрыться:
 *                                    top | bottom | left | right | any
 */
export function initRevealAnimations(selector = '[data-reveal]') {
	const elements = document.querySelectorAll(selector);

	elements.forEach((el) => {
		const delay = el.dataset.revealDelay || '0';
		const duration = el.dataset.revealDuration || '600';
		const direction = el.dataset.revealDirection || 'up';
		const once = el.dataset.revealOnce === 'true';
		const exitEdge = el.dataset.revealExitEdge || 'any';

		const transforms = {
			up: 'translateY(24px)',
			down: 'translateY(-24px)',
			left: 'translateX(24px)',
			right: 'translateX(-24px)'
		};

		const initialTransform = transforms[direction] || transforms.up;

		// Начальное состояние
		el.style.opacity = '0';
		el.style.transform = initialTransform;
		el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
		el.style.transitionDelay = `${delay}ms`;

		let hasAppeared = false;

		onViewportChange(el, (target, entry, isIntersecting) => {
			if (isIntersecting) {
				// === ПОЯВЛЕНИЕ ===
				hasAppeared = true;
				target.classList.add('is-visible');
				target.style.opacity = '1';
				target.style.transform = 'translate(0, 0)';
			} else if (!once && hasAppeared) {
				// === ИСЧЕЗНОВЕНИЕ (только если не once и уже появлялся) ===
				if (isExitByEdge(entry, exitEdge)) {
					target.classList.remove('is-visible');
					target.style.opacity = '0';
					target.style.transform = initialTransform;
				}
			}
		}, {
			rootMargin: '0px 0px -50px 0px',
			threshold: 0.1
		});
	});
}