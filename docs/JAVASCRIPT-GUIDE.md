# CORE4 JavaScript Documentation

> **Version:** 0.1.0 Draft | **Updated:** August 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
   - [App Class](#app-class)
   - [Dynamic Imports](#dynamic-imports)
   - [Global API](#global-api)
3. [Core](#core)
   - [CONFIG](#config)
   - [EventManager](#eventmanager)
4. [Utilities](#utilities)
   - [DOM Helpers](#dom-helpers)
   - [Keyboard](#keyboard)
   - [FocusTrap](#focustrap)
   - [Viewport](#viewport)
5. [Modules](#modules)
   - [ThemeManager](#thememanager)
   - [Modal](#modal)
   - [Accordion](#accordion)
   - [Button](#button)
   - [Dropdown](#dropdown)
6. [Build & Webpack](#build--webpack)

---

## Overview

CORE4 JavaScript is a modular ES-module system with the following features:

- **Lazy loading** — modules are loaded on demand only if matching DOM elements exist
- **Re-initialization** — `app.reinit()` safely re-scans the DOM for dynamically added components
- **Event-driven** — all modules dispatch custom events via `EventManager`
- **Accessibility** — ARIA attributes and keyboard navigation built into every interactive component

---

## Architecture

### App Class

The `App` class is the single entry point. It manages module lifecycle, lazy loading, and re-initialization.

```javascript
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
            revealAnimations: true,
            ...config.modules
         }
      };
      this._factories = {}; // Cache for lazy-loaded chunks
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
}
```

#### Module configuration

```javascript
const app = new App({
   modules: {
      theme: true,            // ThemeManager (always loaded statically)
      modals: true,           // Lazy-loaded if [data-modal] exists
      accordions: true,       // Lazy-loaded if [data-accordion] exists
      buttons: true,          // Lazy-loaded if [data-button] exists
      dropdowns: true,        // Lazy-loaded if [data-dropdown] exists
      revealAnimations: true  // Always loaded (lightweight)
   }
});
```

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `init()` | `Promise<void>` | Initializes all enabled modules |
| `reinit()` | `Promise<void>` | Re-scans DOM, destroys old instances, creates new ones |
| `getModule(name)` | `Array\|Object\|null` | Returns module instances by name |
| `destroy()` | `void` | Destroys all modules, clears caches, resets state |

### Dynamic Imports

Modules (except `ThemeManager` and `revealAnimations`) are loaded via `import()` only when matching DOM elements are found:

```javascript
// Modals — chunk "modals"
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
```

This enables **code splitting** — each module becomes a separate webpack chunk.

### Global API

```javascript
window.CORE4 = {
   app,              // App instance
   core,             // Core exports (CONFIG, EventManager)
   utils: { dom, keyboard },
   components: { ThemeManager, FocusTrap }
   // Modal, Accordion, Button, Dropdown are added lazily by init()
};
```

In development mode, available globals are logged to the console.

---

## Core

### CONFIG

Global configuration object. Extend via `Object.assign` before `app.init()`.

```javascript
import { CONFIG } from './core/_config.js';

// Default values
CONFIG.prefix = 'core4';          // CSS class prefix
CONFIG.animations = true;       // Enable animations
```

### EventManager

Centralized event system. All modules dispatch custom events through it.

```javascript
import { EventManager } from './core/_events.js';

// Dispatch
EventManager.dispatch(element, 'modal:opened', { modal: this });

// Listen
element.addEventListener('modal:opened', (e) => {
   console.log(e.detail.modal);
});
```

---

## Utilities

### DOM Helpers

```javascript
import * as dom from './utilities/_dom.js';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `qs` | `(selector, context = document)` | Alias for `querySelector` |
| `qsa` | `(selector, context = document)` | Alias for `querySelectorAll` |
| `addClass` | `(element, ...classNames)` | Add one or more classes |
| `removeClass` | `(element, ...classNames)` | Remove one or more classes |
| `toggleClass` | `(element, className)` | Toggle a class |
| `hasClass` | `(element, className)` | Check if class exists |

```javascript
dom.addClass(el, 'is-open', 'is-active');
dom.removeClass(el, 'is-open', 'is-active');
```

### Keyboard

```javascript
import * as keyboard from './utilities/_keyboard.js';
```

| Function | Description |
|----------|-------------|
| `isEscape(e)` | Check if key is Escape |
| `isEnter(e)` | Check if key is Enter |
| `isSpace(e)` | Check if key is Space |
| `isTab(e)` | Check if key is Tab |
| `isArrowUp(e)` | Check if key is ArrowUp |
| `isArrowDown(e)` | Check if key is ArrowDown |
| `isArrowLeft(e)` | Check if key is ArrowLeft |
| `isArrowRight(e)` | Check if key is ArrowRight |
| `isHome(e)` | Check if key is Home |
| `isEnd(e)` | Check if key is End |

### FocusTrap

Manages focus within a modal or dropdown. Automatically calls `updateFocusableElements()` on activation.

```javascript
import { FocusTrap } from './utilities/_focus-trap.js';

const trap = new FocusTrap(modalElement);
trap.activate();   // Traps focus, calls updateFocusableElements()
trap.deactivate(); // Releases focus
trap.updateFocusableElements(); // Re-scan focusable elements
```

| Method | Description |
|--------|-------------|
| `activate()` | Start trapping focus |
| `deactivate()` | Stop trapping focus |
| `updateFocusableElements()` | Re-scan DOM for focusable elements |

### Viewport

Utilities for viewport detection and reveal animations.

```javascript
import { initRevealAnimations, isInViewport, onViewportEnter, onViewportLeave, onViewportChange } from './utilities/_viewport.js';
```

| Function | Description |
|----------|-------------|
| `isInViewport(el, offset = 0)` | Check if element is in viewport |
| `onViewportEnter(el, callback, options)` | Fire callback when element enters viewport |
| `onViewportLeave(el, callback, options)` | Fire callback when element leaves viewport |
| `onViewportChange(el, callback, options)` | Fire callback on both enter and leave |
| `initRevealAnimations(selector = '[data-reveal]')` | Auto-init reveal animations |

#### Reveal animations (data attributes)

```html
<div data-reveal
     data-reveal-delay="200"
     data-reveal-duration="600"
     data-reveal-direction="up"
     data-reveal-once="true"
     data-reveal-exit-edge="bottom">
  Content
</div>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-reveal-delay` | `0` | Delay in ms |
| `data-reveal-duration` | `600` | Duration in ms |
| `data-reveal-direction` | `up` | `up`, `down`, `left`, `right` |
| `data-reveal-once` | `false` | Stay visible after first appearance |
| `data-reveal-exit-edge` | `any` | Edge to track for disappearance: `top`, `bottom`, `left`, `right`, `any` |

---

## Modules

### ThemeManager

Manages dark/light theme switching. The module operates in a declarative mode: the script only controls state, classes, and attributes, while all visuals (icons, animations) are handled by CSS.

```javascript
import { ThemeManager } from './modules/theme/_theme.js';

const theme = new ThemeManager();

theme.set('dark');   // Force dark
theme.set('light');  // Force light
theme.set('system'); // Follow OS preference
theme.toggle();      // Toggle dark ↔ light
theme.reset();       // Return to system
```

#### Getters

| Getter | Type | Description |
|--------|------|-------------|
| `choice` | `string` | User's choice: `dark`, `light`, `system` |
| `effective` | `string` | Actually applied theme: `dark`, `light` |
| `isDark` | `boolean` | Current effective theme is dark |
| `isLight` | `boolean` | Current effective theme is light |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `apply(theme, options)` | `string` | Apply theme (`dark`/`light`/`system`). Returns `effective`. `options.silent` — skip dispatching event |
| `set(theme)` | `string` | Alias for `apply()` |
| `toggle()` | `string` | Toggle `light` ↔ `dark` |
| `reset()` | `string` | Return to `system` |
| `destroy()` | `void` | Remove listeners, clean up instance |

#### Switch markup

The module expects an `input[type="checkbox"]` inside the element matched by `toggleSelector` (default `[data-theme-toggle]`). The script does not mutate content — it only toggles `checked`, `aria-checked`, and CSS classes.

```html
<label class="theme-switch" data-theme-toggle>
  <input
    type="checkbox"
    class="theme-switch__input"
    role="switch"
    aria-label="Toggle dark theme"
  >
  <span class="theme-switch__track" aria-hidden="true">
    <span class="theme-switch__thumb"></span>
    <span class="theme-switch__icon theme-switch__icon--light">☀️</span>
    <span class="theme-switch__icon theme-switch__icon--dark">🌙</span>
  </span>
</label>
```

#### How `system` works

On first visit `localStorage` is empty — the module defaults to `system` and reads the OS `prefers-color-scheme`. The user sees dark or light, but `choice` remains `system`.

If the user later changes OS settings, the site **automatically** switches (as long as no manual choice exists). After clicking the switch, the choice is persisted to `localStorage` and auto-sync is disabled.

| Scenario | `localStorage` | `choice` | `effective` | Reacts to OS change |
|----------|---------------|----------|-------------|---------------------|
| First visit | — | `system` | OS-dependent | ✅ Yes |
| User picked dark | `dark` | `dark` | `dark` | ❌ No |
| User picked light | `light` | `light` | `light` | ❌ No |
| Called `reset()` | — | `system` | OS-dependent | ✅ Yes |

#### Events

```javascript
document.documentElement.addEventListener('theme:changed', (e) => {
  console.log(e.detail.effective);  // 'dark' | 'light'
  console.log(e.detail.choice);     // 'dark' | 'light' | 'system'
  console.log(e.detail.isDark);     // boolean
  console.log(e.detail.isSystem);   // boolean
});
```

#### Configuration

```javascript
const theme = new ThemeManager({
  themeKey: 'core4-theme',        // localStorage key
  themeAttr: 'data-theme',        // attribute on root element
  darkValue: 'dark',
  lightValue: 'light',
  systemValue: 'system',
  toggleSelector: '[data-theme-toggle]',
  rootSelector: 'html'
});
```

### Modal

Modal dialog with focus trap, keyboard support, and backdrop click handling.

```html
<button data-modal-trigger="my-modal">Open</button>

<div id="my-modal" class="modal" data-modal>
   <div class="modal__content">
      <div class="modal__header">
         <h3>Title</h3>
         <button data-modal-close>×</button>
      </div>
      <div class="modal__body">...</div>
   </div>
</div>
```

```javascript
import { Modal, initModals } from './modules/modal/_index.js';

// Auto-init
const modals = initModals();

// Manual
const modal = new Modal(document.getElementById('my-modal'));
modal.open();
modal.close();
```

| Method | Description |
|--------|-------------|
| `open()` | Open modal, trap focus |
| `close()` | Close modal, release focus |
| `toggle()` | Toggle open/close |

**Events:** `modal:opened`, `modal:closed`

### Accordion

Collapsible sections with animated height transitions and full ARIA support.

```html
<div data-accordion data-accordion-multiple="true">
   <div data-accordion-item>
      <button data-accordion-header>Section 1</button>
      <div data-accordion-content>Content 1</div>
   </div>
   <div data-accordion-item>
      <button data-accordion-header>Section 2</button>
      <div data-accordion-content>Content 2</div>
   </div>
</div>
```

```javascript
import { Accordion, initAccordions } from './modules/accordion/_accordion.js';

const accordions = initAccordions();

// Or manual
const accordion = new Accordion(element, { multiple: true });
accordion.open(0);
accordion.close(0);
accordion.toggle(0);
accordion.expandAll();
accordion.collapseAll(instant = false);
accordion.destroy();
```

| Method | Description |
|--------|-------------|
| `open(index)` | Open item at index |
| `close(index, instant = false)` | Close item at index (instant skips animation) |
| `toggle(index)` | Toggle item at index |
| `expandAll()` | Open all items (ignores `multiple`) |
| `collapseAll(instant = false)` | Close all items |
| `destroy()` | Remove listeners, close all items |

**ARIA:** Each header gets `aria-expanded`, `aria-controls`, `role="button"`, `tabindex="0"`. Content gets auto-generated `id`.

**Events:** `accordion:opened`, `accordion:closed`

### Button

Interactive button with async states, toggle mode, and loading spinner.

```html
<!-- Default -->
<button class="btn btn--primary" data-button="default">Click</button>

<!-- Async -->
<button class="btn btn--primary" data-button="async"
        data-loading-text="Loading..."
        data-success-text="Done!"
        data-error-text="Error!"
        data-reset-delay="3000">
   Submit
</button>

<!-- Toggle -->
<button class="btn btn--secondary" data-button="toggle">Toggle</button>
```

```javascript
import { Button, initButtons } from './modules/button/_index.js';

const buttons = initButtons();

// Or manual
const btn = new Button(element, {
   loadingClass: 'is-loading',
   successClass: 'is-success',
   errorClass: 'is-error',
   loadingText: 'Loading...',
   successText: 'Done!',
   errorText: 'Error!',
   resetDelay: 2000,
   toggleClass: 'is-active'
});
```

| Method | Description |
|--------|-------------|
| `setLoading()` | Show loading state |
| `setSuccess(text = null)` | Show success state |
| `setError(text = null)` | Show error state |
| `reset()` | Reset to initial state |
| `toggle(forceState = null)` | Toggle active state |
| `setText(text)` | Change button text |
| `setHTML(html)` | Change button HTML |
| `destroy()` | Clear timers |

**Events:** `button:click`, `button:success`, `button:error`, `button:toggle`

### Dropdown

Dropdown menu with auto-positioning, keyboard navigation, and ARIA.

```html
<div data-dropdown data-dropdown-placement="bottom-start">
   <button data-dropdown-trigger>Menu</button>
   <div data-dropdown-menu>
      <button>Item 1</button>
      <button>Item 2</button>
   </div>
</div>
```

```javascript
import { Dropdown, initDropdowns } from './modules/dropdown/_dropdown.js';

const dropdowns = initDropdowns();

// Or manual
const dropdown = new Dropdown(element, {
   openClass: 'is-open',
   placement: 'bottom-start',
   autoFlip: true
});

dropdown.open();
dropdown.close();
dropdown.toggle();
dropdown.destroy();
```

| Method | Description |
|--------|-------------|
| `open()` | Open menu, position, attach listeners |
| `close()` | Close menu, detach listeners |
| `toggle()` | Toggle open/close |
| `destroy()` | Close and cleanup |

**Placements:** `bottom-start`, `bottom-end`, `top-start`, `top-end`, `left`, `right`

**Keyboard:** ArrowUp/ArrowDown navigate items, Enter/Space open, Escape closes, Home/End jump to first/last.

**ARIA:** Trigger gets `aria-haspopup`, `aria-expanded`, `aria-controls`. Menu gets `role="menu"`. Items get `role="menuitem"`.

**Events:** `dropdown:opened`, `dropdown:closed`, `dropdown:select`

---

## Build & Webpack

### Asset handling

Webpack processes fonts, SVG icons, and images:

| Asset type | Extensions | Output |
|------------|------------|--------|
| Fonts | `.woff2`, `.woff`, `.eot`, `.ttf`, `.otf` | `build/fonts/` |
| SVG icons | `.svg` | `build/icons/` |
| Images | `.png`, `.jpg`, `.jpeg`, `.gif` | `build/images/` |

### package.json

```json
{
   "sideEffects": ["*.scss", "*.css"]
}
```

Prevents webpack from tree-shaking SCSS/CSS files.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build (minified, no dev server) |
| `npm run watch` | Watch mode for development |

---

**Author:** George Kiosov | **License:** MIT
