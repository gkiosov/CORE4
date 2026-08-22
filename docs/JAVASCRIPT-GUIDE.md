# JavaScript Design System Documentation

> Version: 0.1.0  
> Modular client-side architecture in vanilla JavaScript (ES6+).

---

## Table of Contents

1. [General Information](#1-general-information)
2. [Architecture](#2-architecture)
3. [Core](#3-core)
4. [Utilities](#4-utilities)
5. [Components (Modules)](#5-components-modules)
   - [Accordion](#accordion)
   - [Button](#button)
   - [Dropdown](#dropdown)
   - [LikeButton](#likebutton)
6. [Initialization, Configuration & Build Optimization](#6-initialization-configuration--build-optimization)
7. [HTML data-attributes](#7-html-data-attributes)
8. [Usage Examples](#8-usage-examples)
9. [CMS Integration](#9-cms-integration)
10. [Optimization Checklist](#10-optimization-checklist)

---

## 1. General Information

The design system is built on the **ITCSS** principle for styles and a **modular architecture** for scripts. Each component self-initializes via `data-*` attributes in HTML. The system has no external framework dependencies.

### Stack
- **SCSS** — modular typography, OKLCH palette, CSS variable themes
- **JavaScript (ES6+)** — classes, modules, `IntersectionObserver`
- **Webpack 5** — bundling, minification, dev-server

---

## 2. Architecture

```
source/js/
├── main.js                 # Entry point, App class
├── core/
│   ├── _index.js           # Core exports
│   ├── _config.js          # Unified config (selectors, keys, states)
│   ├── _events.js          # Custom events (CustomEvent)
│   └── _helpers.js         # Utilities: debounce, throttle, generateId, etc.
├── utilities/
│   ├── _dom.js             # DOM manipulations (qs, qsa, addClass, etc.)
│   ├── _keyboard.js        # Key checks (Escape, Enter, Tab, Arrows)
│   ├── _focus-trap.js      # Focus trap for modals
│   └── _viewport.js        # IntersectionObserver: reveal animations
└── modules/
    ├── accordion/
    │   └── _accordion.js   # Accordion class + initAccordions()
    ├── modal/
    │   ├── _index.js       # Modal initialization
    │   └── _modal.js       # Modal class
    └── theme/
        └── _theme.js       # ThemeManager class
```

### Principles
1. **Every module finds itself** in the DOM via `data-*` attributes.
2. **Modules do not depend on each other directly** — only through `core` and `utilities`.
3. **Event delegation** instead of attaching listeners to every element.
4. **Accessibility first** — `aria-*`, `role`, `tabindex`, focus-trap.

---

## 3. Core

### 3.1. CONFIG

Single source of truth for selectors, state classes, keys, and animations.

```js
import { CONFIG } from './core/_index.js';

// Usage examples:
CONFIG.SELECTORS.MODAL        // '[data-modal]'
CONFIG.STATE.OPEN             // 'is-open'
CONFIG.KEYBOARD.ESC           // 'Escape'
CONFIG.ANIMATION.DURATION.MEDIUM // 300
```

| Key | Description                                                                      |
|------|-------------------------------------------------------------------------------|
| `PREFIX` | Prefix `'core4'` for IDs and classes                                            |
| `STATE` | State classes: `ACTIVE`, `OPEN`, `CLOSED`, `HIDDEN`, `LOADING`, `DISABLED` |
| `ATTR` | Data-attributes: `THEME`, `MODAL`, `ACCORDION`, etc.                            |
| `SELECTORS` | CSS selectors for auto-initialization                                           |
| `KEYBOARD` | Key codes for handlers                                                  |
| `ANIMATION` | Durations and easing functions                                                 |
| `THEME_KEY` | Key for `localStorage` (`'core4-theme'`)                                     |

### 3.2. EventManager

Dispatch and subscribe to custom events.

```js
import { EventManager } from './core/_index.js';

// Dispatch event
EventManager.dispatch(element, 'modal:opened', { trigger: button });

// Subscribe
EventManager.on(element, 'modal:opened', (e) => {
    console.log(e.detail.trigger);
});

// One-time subscription
EventManager.once(element, 'theme:changed', callback);
```

### 3.3. Helpers

```js
import { debounce, throttle, generateId, deepClone, isVisible, isPlainObject, getNestedValue } from './core/_index.js';
```

| Function | Description | Example |
|---------|----------|--------|
| `generateId(prefix)` | Unique ID with `crypto.randomUUID()` | `generateId('btn') // 'btn-a1b2...'` |
| `debounce(fn, delay)` | Debounce | `debounce(resizeHandler, 200)` |
| `throttle(fn, delay)` | Throttle | `throttle(scrollHandler, 100)` |
| `deepClone(obj)` | Deep clone via `structuredClone` | `deepClone(config)` |
| `isVisible(el)` | Is element visible (not `display:none`, not `opacity:0`) | `isVisible(card)` |
| `isPlainObject(val)` | Is value a plain object | `isPlainObject({}) // true` |
| `getNestedValue(obj, path, fallback)` | Safe path access | `getNestedValue(user, 'profile.name')` |

---

## 4. Utilities

### 4.1. DOM (`_dom.js`)

Safe wrappers over native methods.

```js
import { qs, qsa, addClass, removeClass, toggleClass, createElement, setAttr, getAttr } from './utilities/_dom.js';
```

| Function | Description |
|---------|----------|
| `qs(selector, context)` | `querySelector` with fallback to `document` |
| `qsa(selector, context)` | `querySelectorAll` → `Array` |
| `addClass(el, className)` | Add class |
| `removeClass(el, className)` | Remove class |
| `toggleClass(el, className, condition)` | Toggle with condition |
| `createElement(tag, classes, attrs, children)` | Create element |
| `setAttr / getAttr / removeAttr` | Attribute operations |

### 4.2. Keyboard (`_keyboard.js`)

```js
import { Keyboard } from './utilities/_keyboard.js';

Keyboard.isEscape(e)   // true if Escape
Keyboard.isEnter(e)    // true if Enter
Keyboard.isTab(e)      // true if Tab
Keyboard.isArrow(e)    // true if any arrow
```

### 4.3. FocusTrap (`_focus-trap.js`)

Focus trap for modals and dropdowns. Cyclic navigation via `Tab` and `Shift+Tab`.

```js
import { FocusTrap } from './utilities/_focus-trap.js';

const trap = new FocusTrap(modalElement);
trap.activate();   // Saves current focus, moves to first element
trap.deactivate(); // Returns focus to original element
trap.focusFirst(); // Focus first focusable element
trap.focusLast();  // Focus last
```

### 4.4. Viewport (`_viewport.js`)

Reveal animations and visibility tracking.

```js
import { onViewportEnter, onViewportLeave, onViewportChange, initRevealAnimations } from './utilities/_viewport.js';
```

| Function | Description |
|---------|----------|
| `onViewportEnter(el, callback, options)` | Fires on viewport entry |
| `onViewportLeave(el, callback, options)` | Fires on viewport exit |
| `onViewportChange(el, callback, options)` | Fires on entry and exit |
| `initRevealAnimations(selector)` | Auto-init `[data-reveal]` |

#### `initRevealAnimations` Parameters

| Data-attribute | Default | Description |
|-------------|----------------------|----------|
| `data-reveal` | — | Activates animation |
| `data-reveal-direction` | `up` | Direction: `up`, `down`, `left`, `right` |
| `data-reveal-duration` | `600` | Duration in ms |
| `data-reveal-delay` | `0` | Delay in ms |
| `data-reveal-once` | `true` | `true` — stays visible; `false` — hides on exit |
| `data-reveal-exit-edge` | `any` | Exit edge: `any`, `top`, `bottom`, `left`, `right` |

---

## 5. Components (Modules)

### Accordion

Accordion management module. Supports `single` and `multiple` modes, reveal animation via `height`, keyboard controls, "Expand All" / "Collapse All" buttons.

#### Import

```js
import { Accordion, initAccordions } from './modules/accordion/_accordion.js';
```

#### HTML Structure

```html
<div class="accordion" data-accordion>
  <!-- Control buttons (optional) -->
  <button type="button" data-accordion-expand>Expand All</button>
  <button type="button" data-accordion-collapse>Collapse All</button>

  <div class="accordion__item" data-accordion-item>
    <button class="accordion__header" data-accordion-header>
      Header 1
    </button>
    <div class="accordion__content" data-accordion-content>
      <div class="accordion__inner">Content 1</div>
    </div>
  </div>

  <div class="accordion__item" data-accordion-item>
    <button class="accordion__header" data-accordion-header>
      Header 2
    </button>
    <div class="accordion__content" data-accordion-content>
      <div class="accordion__inner">Content 2</div>
    </div>
  </div>
</div>
```

#### Data-attributes

| Attribute | Value | Description |
|---------|----------|----------|
| `data-accordion` | — | Initializes accordion |
| `data-accordion-multiple` | `true` / `false` | Mode: multiple open items |
| `data-accordion-item` | — | Accordion item |
| `data-accordion-header` | — | Header button |
| `data-accordion-content` | — | Expandable content |
| `data-accordion-expand` | — | "Expand All" button |
| `data-accordion-collapse` | — | "Collapse All" button |

#### Constructor

```js
const accordion = new Accordion(element, {
    openClass: 'is-open',   // Open state class
    multiple: false         // true — multiple open
});
```

#### Instance Methods

| Method | Description |
|-------|----------|
| `open(index)` | Open item by index |
| `close(index, instant)` | Close item. `instant: true` — no animation |
| `toggle(index)` | Toggle state |
| `closeAll(instant)` | Close all items |
| `expandAll()` | Open all items (ignores `multiple`) |
| `collapseAll(instant)` | Close all items |
| `destroy()` | Destroy instance, unsubscribe from events |

#### Events

| Event | Detail | Description |
|---------|--------|----------|
| `accordion:opened` | `{ index }` | Item opened |
| `accordion:closed` | `{ index }` | Item closed |

```js
accordion.element.addEventListener('accordion:opened', (e) => {
    console.log('Opened item:', e.detail.index);
});
```

#### CSS Classes

| Class | Description |
|-------|----------|
| `.accordion__item` | Item container |
| `.accordion__item.is-open` | Open state |
| `.accordion__header` | Header button |
| `.accordion__content` | Animated content (`height: 0 → scrollHeight`) |
| `.accordion__inner` | Inner wrapper for padding |

---

### Button

Button management module. Supports three modes: **default** (regular), **async** (with loading/success/error), and **toggle** (switch).

#### Import

```js
import { Button, initButtons } from './modules/button/_index.js';
```

#### HTML Structure

**Async button (with feedback):**
```html
<button 
  class="btn btn--primary" 
  data-button="async"
  data-loading-text="Saving..."
  data-success-text="Saved!"
  data-error-text="Save error"
  data-reset-delay="2000"
>
  Save
</button>
```

**Toggle button (switch):**
```html
<button 
  class="btn btn--secondary" 
  data-button="toggle"
  aria-pressed="false"
>
  <span>🔔</span> Notifications
</button>
```

**Regular button (no JS):**
```html
<button class="btn btn--primary">Submit</button>
```

#### Data-attributes

| Attribute | Value | Description |
|---------|----------|----------|
| `data-button` | `async` / `toggle` | Button type |
| `data-loading-text` | `"Loading..."` | Text during loading |
| `data-success-text` | `"Done!"` | Text on success |
| `data-error-text` | `"Error"` | Text on error |
| `data-reset-delay` | `2000` | Reset delay in ms |

#### Constructor

```js
const btn = new Button(element, {
    loadingClass: 'is-loading',
    successClass: 'is-success',
    errorClass: 'is-error',
    resetDelay: 2000
});
```

#### Instance Methods

| Method | Description |
|-------|----------|
| `setLoading()` | Disables button, shows spinner |
| `setSuccess(text?)` | Sets success state |
| `setError(text?)` | Sets error state |
| `reset()` | Resets to original state |
| `toggle(force?)` | Toggles toggle state |
| `setText(text)` | Changes button text |
| `destroy()` | Destroys instance |

#### Events

| Event | Detail | Description |
|---------|--------|----------|
| `button:click` | `{ button, originalEvent }` | Button click |
| `button:success` | `{ button }` | Successful completion |
| `button:error` | `{ button }` | Error |
| `button:toggle` | `{ button, active }` | Toggle switch |

#### State CSS Classes

| Class | Description |
|-------|----------|
| `.is-loading` | Button disabled, spinner |
| `.is-success` | Success state (green) |
| `.is-error` | Error state (red) |
| `.is-active` | Toggle active |

#### Example: Form with API

```js
import { initButtons } from './modules/button/_index.js';

initButtons();

// Handle specific button
document.querySelector('#save-btn').addEventListener('button:click', async (e) => {
  const btn = e.detail.button;

  try {
    await fetch('/api/save', { method: 'POST', body: formData });
    btn.setSuccess();
  } catch (err) {
    btn.setError('Failed to save');
  }
});
```

---

### Button Group

Button grouping with elimination of double borders. Supports horizontal and vertical layouts.

#### HTML

```html
<!-- Horizontal group -->
<div class="btn-group">
  <button class="btn btn--secondary">Left</button>
  <button class="btn btn--secondary">Center</button>
  <button class="btn btn--secondary">Right</button>
</div>

<!-- Vertical group -->
<div class="btn-group btn-group--vertical">
  <button class="btn btn--secondary">Top</button>
  <button class="btn btn--secondary">Center</button>
  <button class="btn btn--secondary">Bottom</button>
</div>
```

#### CSS Classes

| Class | Description |
|-------|----------|
| `.btn-group` | Horizontal group |
| `.btn-group--vertical` | Vertical group |

---

### Dropdown

Dropdown menu with keyboard navigation, positioning, and closing on Escape / click outside.

#### Import

```js
import { Dropdown, initDropdowns } from './modules/dropdown/_dropdown.js';
```

#### HTML

```html
<div class="dropdown" data-dropdown>
  <button class="btn btn--secondary dropdown__trigger" 
          data-dropdown-trigger 
          aria-haspopup="true" 
          aria-expanded="false">
    Actions
  </button>
  <div class="dropdown__menu" data-dropdown-menu>
    <button class="dropdown__item">✏️ Edit</button>
    <button class="dropdown__item">📋 Copy</button>
    <div class="dropdown__item dropdown__item--divider"></div>
    <button class="dropdown__item dropdown__item--danger">🗑️ Delete</button>
  </div>
</div>
```

#### Data-attributes

| Attribute | Value | Description |
|---------|----------|----------|
| `data-dropdown` | — | Initializes dropdown |
| `data-dropdown-trigger` | — | Open button |
| `data-dropdown-menu` | — | Menu container |
| `data-dropdown-placement` | `bottom-start` | Position: `top-start`, `top-end`, `bottom-start`, `bottom-end`, `left`, `right` |

#### Methods

| Method | Description |
|-------|----------|
| `open()` | Open menu (with auto-positioning) |
| `close()` | Close menu |
| `toggle()` | Toggle |

#### Auto-positioning (auto-flip)

By default, dropdown automatically checks if the menu fits in the viewport. If not — it flips direction:

| Set | If no space | Result |
|--------|-----------------|-----------|
| `bottom-start` | No space below | `top-start` |
| `bottom-end` | No space below | `top-end` |
| `top-start` | No space above | `bottom-start` |
| `left` | No space on left | `right` |
| `right` | No space on right | `left` |

**Disable auto-flip:**
```js
new Dropdown(el, { autoFlip: false });
```

#### Keyboard

| Key | Action |
|---------|----------|
| `Enter`, `Space`, `ArrowDown` | Open menu and focus first item |
| `ArrowUp` / `ArrowDown` | Navigate items |
| `Home` / `End` | First / last item |
| `Escape` | Close menu, return focus to trigger |
| `Enter` on item | Select, close |

#### Events

| Event | Detail | Description |
|---------|--------|----------|
| `dropdown:opened` | `{ dropdown }` | Menu opened |
| `dropdown:closed` | `{ dropdown }` | Menu closed |
| `dropdown:select` | `{ item, index, dropdown }` | Item selected |

#### CSS Classes

| Class | Description |
|-------|----------|
| `.dropdown` | Container |
| `.dropdown.is-open` | Open state |
| `.dropdown__trigger` | Trigger button |
| `.dropdown__menu` | Menu |
| `.dropdown__menu--{placement}` | Positioning |
| `.dropdown__item` | Menu item |
| `.dropdown__item--danger` | Danger action (red) |
| `.dropdown__item--divider` | Divider |

#### Split Button

```html
<div class="btn-group">
  <button class="btn btn--primary">Save</button>
  <div class="dropdown" data-dropdown style="display:inline-flex">
    <button class="btn btn--primary dropdown__trigger" data-dropdown-trigger>▼</button>
    <div class="dropdown__menu" data-dropdown-menu>
      <button class="dropdown__item">💾 Save As...</button>
      <button class="dropdown__item">📥 Export</button>
    </div>
  </div>
</div>
```

---

### LikeButton

A standalone "Like" button component with a counter. Supports optimistic UI updates, server submission, and rollback on error.

#### Import

```js
import { LikeButton, initLikeButtons } from './modules/like-button/_index.js';
```

#### HTML

```html
<button 
  class="btn btn--ghost" 
  data-like-button
  data-like-count="42"
  data-post-id="123"
  aria-pressed="false"
>
  <span data-like-icon>❤️</span> <span data-like-count>42</span>
</button>
```

#### Data-attributes

| Attribute | Description |
|---------|----------|
| `data-like-button` | Initializes component |
| `data-like-count` | Initial counter value |
| `data-post-id` | Post ID for API request |
| `data-like-endpoint` | URL endpoint (optional, can be set in JS) |

#### Constructor

```js
const like = new LikeButton(element, {
    activeClass: 'is-active',
    endpoint: '/api/posts/:id/like', // :id is replaced with postId
    postId: '123',
    optimistic: true // optimistic UI update
});
```

#### Methods

| Method | Description |
|-------|----------|
| `setLiked(boolean, count?)` | Programmatically set state |
| `getState()` | Get `{ liked, count }` |

#### Events

| Event | Detail | Description |
|---------|--------|----------|
| `like:click` | `{ button, willBeLiked, postId }` | Button click |
| `like:success` | `{ button, liked, count }` | Successful request |
| `like:error` | `{ button, error }` | Request error |

#### Example with API

```js
import { initLikeButtons } from './modules/like-button/_index.js';

initLikeButtons();

// Global handling (if endpoint is not set in constructor)
document.querySelectorAll('[data-like-button]').forEach(el => {
    el.addEventListener('like:click', async (e) => {
        const { button, willBeLiked, postId } = e.detail;

        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: willBeLiked ? 'POST' : 'DELETE'
            });
            if (!res.ok) throw new Error(res.statusText);

            const data = await res.json();
            button.setLiked(willBeLiked, data.count);
        } catch (err) {
            // Rollback happens automatically if optimistic: true
            console.error('Like error:', err);
        }
    });
});
```

#### CSS

```scss
[data-like-button] {
  [data-like-icon] {
    display: inline-block;
    transition: transform 0.2s ease;
  }

  &.is-active [data-like-icon] {
    color: #dc2626; // red heart
  }
}
```

---

## 6. Initialization, Configuration & Build Optimization

### 6.1. Configurable Initialization

The `App` class supports conditional module enabling. This allows building **different bundles** for different projects without pulling in unnecessary code.

```js
// main.js for a landing page (grid + typography + reveal only)
import '../scss/landing.scss';

import { ThemeManager } from './modules/theme/_theme.js';
import { initRevealAnimations } from './utilities/_viewport.js';

class App {
	constructor(config = {}) {
		this.modules = {};
		this.isInitialized = false;

		this.config = {
			modules: {
				theme: true,
				modals: false,
				accordions: false,
				buttons: false,
				dropdowns: false,
				likeButtons: false,
				revealAnimations: true,
				...config.modules
			}
		};
	}

	init() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		const cfg = this.config.modules;

		if (cfg.theme) this.modules.theme = new ThemeManager();
		if (cfg.modals) this.modules.modals = initModals();
		if (cfg.accordions) this.modules.accordions = initAccordions();
		if (cfg.buttons) this.modules.buttons = initButtons();
		if (cfg.dropdowns) this.modules.dropdowns = initDropdowns();
		if (cfg.likeButtons) this.modules.likeButtons = initLikeButtons();
		if (cfg.revealAnimations) initRevealAnimations();
	}

	getModule(name) {
		return this.modules[name] || null;
	}
}

const app = new App({
	modules: {
		theme: true,
		revealAnimations: true
		// everything else false by default
	}
});

document.addEventListener('DOMContentLoaded', () => app.init());
```

| Parameter | Type | Default | Description |
|----------|-----|--------------|----------|
| `modules.theme` | `boolean` | `true` | Theme |
| `modules.modals` | `boolean` | `true` | Modals |
| `modules.accordions` | `boolean` | `true` | Accordions |
| `modules.buttons` | `boolean` | `true` | Buttons |
| `modules.dropdowns` | `boolean` | `true` | Dropdowns |
| `modules.likeButtons` | `boolean` | `true` | Likes |
| `modules.revealAnimations` | `boolean` | `true` | Reveal animations |

**Rule:** if a module is disabled (`false`) — its JS **is not imported** → webpack does not include it in the bundle.

---

### 6.2. Tree Shaking

Webpack 5 automatically removes unused code provided:

1. **ES6 modules** (`import` / `export`) — you already have this
2. **`"sideEffects": false`** in `package.json` (except SCSS/CSS)

```json
// package.json
{
  "sideEffects": [
    "*.scss",
    "*.css"
  ]
}
```

**What this gives:**
- If `initModals()` is not called — the entire `modules/modal/` is dropped from the bundle
- If `Accordion` is not imported — the class does not end up in the build
- CSS is also tree-shaken: unimported SCSS files do not generate CSS

---

### 6.3. Code Splitting (Dynamic Imports)

For heavy modules that are not needed immediately:

```js
// Lazy-load modals only if [data-modal] exists
async function loadModals() {
	const { initModals } = await import(
		/* webpackChunkName: "modals" */
		'./modules/modal/_index.js'
	);
	return initModals();
}

// In App.init():
if (document.querySelector('[data-modal]')) {
	this.modules.modals = await loadModals();
}
```

Webpack will create a separate chunk `modals.js` (~2-5 KB gzipped), loaded asynchronously.

---

### 6.4. Multi-project Structure

```
/source
  /scss
    /core
    /objects
    /components
  /js
    /core
    /utilities
    /modules

/projects
  /landing
    main.scss      ← grid + typography + reveal only
    main.js        ← theme + reveal only
    webpack.config.js
  /dashboard
    main.scss      ← all components
    main.js        ← all modules
    webpack.config.js
  /blog
    main.scss      ← buttons + like + dropdown
    main.js        ← buttons + like + dropdown + reveal
    webpack.config.js
```

**`projects/landing/main.scss`:**

```scss
@use '../../source/scss/1-settings/index' as settings;
@use '../../source/scss/2-tools/index' as tools;
@use '../../source/scss/3-generic/base';
@use '../../source/scss/3-generic/typography';
@use '../../source/scss/4-objects/grid';
@use '../../source/scss/4-objects/layout';
@use '../../source/scss/4-objects/utilities';
// Do NOT import: button, card, modal, accordion, dropdown...
```

**`projects/landing/main.js`:**

```js
import './main.scss';

import { ThemeManager } from '../../source/js/modules/theme/_theme.js';
import { initRevealAnimations } from '../../source/js/utilities/_viewport.js';

class App {
	constructor() {
		this.modules = {};
		this.isInitialized = false;
	}
	init() {
		if (this.isInitialized) return;
		this.isInitialized = true;
		this.modules.theme = new ThemeManager();
		initRevealAnimations();
	}
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
```

**`projects/landing/webpack.config.js`:**

```js
const path = require('path');

module.exports = {
	mode: 'production',
	entry: './main.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'main.min.js'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	}
};
```

Build landing:

```bash
cd projects/landing
npx webpack --config webpack.config.js
```

---

### 6.5. Global API

```js
import { app } from './main.js';

// Get module
const accordions = app.getModule('accordions');
const modals = app.getModule('modals');
const theme = app.getModule('theme');

// Global access (for debugging)
window.CORE4.app           // App instance
window.CORE4.core          // CONFIG, EventManager, helpers
window.CORE4.utils         // dom, keyboard, viewport
window.CORE4.components    // ThemeManager, Modal, Accordion, Button, Dropdown, LikeButton, FocusTrap
```

| Method | Description |
|-------|----------|
| `app.init()` | Initialize enabled modules |
| `app.getModule(name)` | Get module by name |
| `app.destroy()` | Destroy all modules and clear events |

---

## 7. HTML data-attributes

### Summary Table of All data-attributes

| Attribute | Component | Description |
|---------|-----------|----------|
| `data-accordion` | Accordion | Initialization |
| `data-accordion-multiple` | Accordion | Multiple mode |
| `data-accordion-item` | Accordion | Item |
| `data-accordion-header` | Accordion | Header |
| `data-accordion-content` | Accordion | Content |
| `data-accordion-expand` | Accordion | "Expand All" button |
| `data-accordion-collapse` | Accordion | "Collapse All" button |
| `data-modal` | Modal | Modal initialization |
| `data-modal-trigger` | Modal | Open button (`value = modal id`) |
| `data-modal-close` | Modal | Close button inside modal |
| `data-modal-overlay` | Modal | Overlay for click-outside |
| `data-theme` | Theme | Attribute on `<html>` for theme switching |
| `data-reveal` | Viewport | Scroll-triggered reveal animation |
| `data-reveal-direction` | Viewport | Direction |
| `data-reveal-duration` | Viewport | Duration |
| `data-reveal-delay` | Viewport | Delay |
| `data-reveal-once` | Viewport | Once or cyclic |
| `data-reveal-exit-edge` | Viewport | Exit edge |
| `data-button` | Button | Type: `async` or `toggle` |
| `data-loading-text` | Button | Loading text |
| `data-success-text` | Button | Success text |
| `data-error-text` | Button | Error text |
| `data-reset-delay` | Button | Reset delay |
| `data-dropdown` | Dropdown | Dropdown initialization |
| `data-dropdown-trigger` | Dropdown | Open button |
| `data-dropdown-menu` | Dropdown | Menu container |
| `data-dropdown-placement` | Dropdown | Menu position |
| `data-like-button` | LikeButton | Initialization |
| `data-like-count` | LikeButton | Initial counter value |
| `data-like-icon` | LikeButton | Icon (for animation) |
| `data-post-id` | LikeButton | Post ID |
| `data-like-endpoint` | LikeButton | API URL |

---

## 8. Usage Examples

### 8.1. Accordion — Basic

```html
<div data-accordion>
  <div data-accordion-item>
    <button data-accordion-header>Question 1</button>
    <div data-accordion-content>
      <div class="accordion__inner">Answer 1</div>
    </div>
  </div>
  <div data-accordion-item>
    <button data-accordion-header>Question 2</button>
    <div data-accordion-content>
      <div class="accordion__inner">Answer 2</div>
    </div>
  </div>
</div>
```

### 8.2. Accordion — Multiple (several open)

```html
<div data-accordion data-accordion-multiple="true">
  <!-- items -->
</div>
```

### 8.3. Accordion — with control buttons

```html
<div data-accordion>
  <button data-accordion-expand>Expand All</button>
  <button data-accordion-collapse>Collapse All</button>
  <!-- items -->
</div>
```

### 8.4. Reveal Animation — Basic

```html
<section data-reveal>
  <h2>Heading</h2>
  <p>Appears on scroll</p>
</section>
```

### 8.5. Reveal — Direction, Delay, Cyclicity

```html
<div data-reveal
     data-reveal-direction="left"
     data-reveal-delay="200"
     data-reveal-duration="800"
     data-reveal-once="false"
     data-reveal-exit-edge="bottom">
  Block that slides in from the left, hides only when exiting bottom edge
</div>
```

### 8.6. Programmatic Accordion Control

```js
// Get first accordion
const accordion = app.getModule('accordions')[0];

// Open third item
accordion.open(2);

// Close all instantly
accordion.collapseAll(true);

// Open all (even in single mode)
accordion.expandAll();

// Subscribe to event
accordion.element.addEventListener('accordion:opened', (e) => {
    console.log('Opened item index:', e.detail.index);
});
```

### 8.7. Programmatic Theme Control

```js
const theme = app.getModule('theme');

theme.toggleTheme();           // Toggle light/dark
theme.setTheme('dark');        // Set dark
theme.setTheme('light');       // Set light
theme.setTheme('system');      // Follow system theme

// Subscribe to theme change
document.documentElement.addEventListener('theme:changed', (e) => {
    console.log('New theme:', e.detail.theme);
});
```

---

## 9. CMS Integration

The system is CMS-independent — works with any HTML. Integration is via ready-made bundles.

### 9.1. WordPress

```php
// functions.php
function core4_enqueue_assets() {
    wp_enqueue_style('core4-main', get_template_directory_uri() . '/build/css/main.min.css', [], '1.0');
    wp_enqueue_script('core4-main', get_template_directory_uri() . '/build/js/main.min.js', [], '1.0', true);
}
add_action('wp_enqueue_scripts', 'core4_enqueue_assets');
```

### 9.2. Template with data-attributes

```php
// template-parts/content.php
<div class="accordion" data-accordion>
    <?php while (have_rows('faq_items')): the_row(); ?>
        <div class="accordion__item" data-accordion-item>
            <button class="accordion__header" data-accordion-header>
                <?php the_sub_field('question'); ?>
            </button>
            <div class="accordion__content" data-accordion-content>
                <div class="accordion__inner">
                    <?php the_sub_field('answer'); ?>
                </div>
            </div>
        </div>
    <?php endwhile; ?>
</div>
```

### 9.3. Possible Conflicts

| Problem | Solution |
|----------|---------|
| CMS styles override yours | Wrap in `.core4-container` and increase specificity |
| jQuery conflicts with `window.$` | Use `window.CORE4` instead of `$` |
| No webpack in CMS | Build locally, upload ready bundles |

---

## 10. Optimization Checklist

| What to check | How |
|---------------|-----|
| Unused SCSS modules | Do not import in `main.scss` |
| Unused JS modules | `false` in App config + do not import |
| Tree shaking | `"sideEffects": ["*.scss", "*.css"]` in `package.json` |
| Code splitting | `import()` for heavy modules |
| Multi-project | Separate `main.js`/`main.scss` in `projects/` |
| Fonts | Only needed weights in `@font-face` |
| Icons | SVG sprite with only used icons |

---

## License

MIT
