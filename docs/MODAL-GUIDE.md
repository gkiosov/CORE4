# 📘 Modal Component Guide

> **Version:** 0.1.0 Draft | **Updated:** August 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [HTML Structure](#html-structure)
3. [Data Attributes](#data-attributes)
4. [CSS Modifiers](#css-modifiers)
5. [Scroll Lock](#scroll-lock)
6. [JavaScript API](#javascript-api)
7. [Accessibility](#accessibility)
8. [Nested Modals](#nested-modals)
9. [History API Integration](#history-api-integration)
10. [Swipe to Close](#swipe-to-close)
11. [Examples](#examples)

---

## Overview

The Modal component provides accessible, centered overlay dialogs with:

- **Body scroll lock** with `scrollbar-gutter: stable` — no layout jitter
- **Focus trap** — keyboard navigation stays inside the modal
- **Auto-triggers** — open on delay, scroll, exit intent, or beforeunload
- **Nested stacking** — z-index auto-increments for overlapping modals
- **History API** — browser Back button closes the modal
- **Swipe-to-close** — downward swipe on mobile dismisses the modal
- **Multiple triggers** — any number of elements can open the same modal

The module is **lazy-loaded** — the JS chunk loads only when `[data-modal]` elements exist in the DOM.

---

## HTML Structure

A modal consists of three optional regions: **header**, **body**, and **footer**.

```html
<div id="my-modal" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Modal Title</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Modal content goes here. Scrolls internally if overflow.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Cancel</button>
      <button class="btn btn--primary">Confirm</button>
    </div>
  </div>
</div>
```

### Regions

| Element | Class | Required | Description |
|---------|-------|----------|-------------|
| Root | `.modal` | Yes | Fixed overlay. Must have `data-modal` for auto-init. |
| Content | `.modal__content` | Yes | Centers and constrains width/height. |
| Header | `.modal__header` | No | Title + close button. Stays fixed while body scrolls. |
| Body | `.modal__body` | No | Scrollable content area. `overflow-y: auto`. |
| Footer | `.modal__footer` | No | Action buttons. Stays fixed at the bottom. |

### Close buttons

Any element with `data-modal-close` inside the modal will close it on click. You can have multiple close buttons (e.g. one in the header, one in the footer).

---

## Data Attributes

### `data-modal`

Required on the root `.modal` element. Enables auto-initialization.

```html
<div class="modal" data-modal>...</div>
```

### `data-modal-trigger="id"`

Opens the modal whose `id` matches the value. Can be used on any element, and multiple triggers can target the same modal.

```html
<button data-modal-trigger="contact">Open (header)</button>
<a href="#" data-modal-trigger="contact">Open (inline)</a>
<button data-modal-trigger="contact">Open (footer)</button>
```

### `data-modal-close`

Closes the containing modal when clicked. Can be placed on any element inside the modal.

```html
<button data-modal-close>Cancel</button>
<button class="modal__close" data-modal-close aria-label="Close">×</button>
```

### `data-modal-delay="ms"`

Auto-opens the modal after N milliseconds.

```html
<div class="modal" data-modal data-modal-delay="5000">
  <!-- Opens 5 seconds after page load -->
</div>
```

### `data-modal-scroll="px"`

Auto-opens after the user scrolls N pixels down the page.

```html
<div class="modal" data-modal data-modal-scroll="400">
  <!-- Opens after scrolling 400px -->
</div>
```

### `data-modal-exit-intent="true"`

Auto-opens when the mouse leaves the viewport towards the top (browser chrome).

```html
<div class="modal" data-modal data-modal-exit-intent="true">
  <!-- Opens on exit intent -->
</div>
```

### `data-modal-beforeunload="true"`

Enables the native browser warning when the user tries to close the tab. The modal itself does not visually open — it only registers the `beforeunload` handler.

```html
<div class="modal" data-modal data-modal-beforeunload="true"></div>
```

### `data-modal-once="true"`

Prevents the modal from opening more than once per page session. Works with all triggers (click, delay, scroll, exit intent).

```html
<div class="modal" data-modal data-modal-delay="3000" data-modal-once="true">
  <!-- Opens once, never again until page reload -->
</div>
```

### `data-modal-history="false"`

Disables History API integration for this modal. By default, opening a modal pushes a history state so the browser Back button closes it.

```html
<div class="modal" data-modal data-modal-history="false">
  <!-- Back button will NOT close this modal -->
</div>
```

---

## CSS Modifiers

Apply to `.modal__content` to change the modal width.

| Modifier | Max Width | Description |
|----------|-----------|-------------|
| `.modal__content--sm` | 400px | Small dialogs (alerts, confirmations) |
| *(default)* | 560px | Standard size |
| `.modal__content--lg` | 800px | Large dialogs (forms, tables) |
| `.modal__content--xl` | 1140px | Extra large (image galleries, wizards) |
| `.modal__content--full` | 100vw / 100dvh | Fullscreen, no border-radius |

```html
<div class="modal__content modal__content--lg">...</div>
```

---

## Scroll Lock

When the first modal opens, page scrolling is locked via:

```css
html.is-locked {
  overflow: hidden;
  touch-action: none;
}
```

The system relies on `scrollbar-gutter: stable` (set in `_reset.scss`) to reserve scrollbar space at all times. This means:

- **No layout shift** when the scrollbar disappears.
- **No `padding-right` compensation** needed on modern browsers.
- **Fixed elements** (headers, navbars) do not need manual adjustment.

For older browsers that do not support `scrollbar-gutter`, a fallback `padding-right: var(--scrollbar-width)` is applied automatically.

---

## JavaScript API

### Auto-initialization

```javascript
import { initModals } from './modules/modal/_index.js';

const modals = initModals(); // Returns Modal[]
```

Called automatically by `App.init()` when `[data-modal]` elements are present.

### Modal class

```javascript
import { Modal } from './modules/modal/_index.js';

const modal = new Modal(document.getElementById('my-modal'));
```

#### Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `openClass` | `string` | `'is-open'` | CSS class applied when open |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking the overlay |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `focusOnOpen` | `boolean` | `true` | Auto-focus first focusable element |
| `lockBodyScroll` | `boolean` | `true` | Lock page scroll |
| `history` | `boolean` | `true` | Enable History API integration |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `open(triggerElement?, opts?)` | `Modal` | Open the modal. `triggerElement` is used for focus return. |
| `close(opts?)` | `Modal` | Close the modal and restore focus. |
| `toggle(triggerElement?)` | `Modal` | Open if closed, close if open. |
| `scheduleDelay(ms)` | `void` | Schedule auto-open after N milliseconds. |
| `cancelDelay()` | `void` | Cancel scheduled delay. |
| `enableScrollTrigger(px)` | `void` | Enable scroll-triggered open. |
| `disableScrollTrigger()` | `void` | Disable scroll trigger. |
| `enableExitIntent()` | `void` | Enable exit-intent trigger. |
| `disableExitIntent()` | `void` | Disable exit-intent trigger. |
| `enableBeforeunload()` | `void` | Enable native beforeunload warning. |
| `disableBeforeunload()` | `void` | Disable beforeunload handler. |
| `destroy()` | `void` | Remove all listeners, close if open, clean up. |

#### Options objects

```javascript
// Open without pushing history state
modal.open(null, { skipHistory: true });

// Close without calling history.back()
modal.close({ skipHistory: true });
```

### Module-level helpers

```javascript
import { openModal, closeModal, getModals } from './modules/modal/_index.js';

openModal('my-modal');        // Open by ID
closeModal('my-modal');       // Close by ID
closeModal();                 // Close all open modals
getModals();                  // Get all initialized Modal instances
```

### Global API (development)

```javascript
// After App.init()
window.CORE4.components.Modal;          // Modal class
window.CORE4.app.getModule('modals');   // Array of Modal instances
```

---

## Accessibility

### ARIA attributes (auto-generated)

| Attribute | Target | Description |
|-----------|--------|-------------|
| `role="dialog"` | `.modal` | Declares the element as a dialog |
| `aria-modal="true"` | `.modal` | Indicates this is a modal dialog |
| `aria-labelledby` | `.modal` | Points to `.modal__title` (auto-generated ID if missing) |
| `aria-hidden="true"` | Body siblings | Hides page content from assistive tech while modal is open |

### Keyboard navigation

| Key | Action |
|-----|--------|
| `Escape` | Close the topmost open modal |
| `Tab` | Cycle focus inside the modal (focus trap) |
| `Shift + Tab` | Cycle focus backwards |

### Focus management

- On open: focus moves to the **first focusable element** inside the modal.
- On close: focus returns to the **element that triggered the open**.
- Focus is **trapped** inside the modal while it is open.

---

## Nested Modals

Multiple modals can be open simultaneously. Each new modal receives a higher `z-index`:

| Modal | z-index |
|-------|---------|
| 1st | 300 (base) |
| 2nd | 310 |
| 3rd | 320 |

Escape closes the **topmost** modal first. Closing a nested modal restores its original z-index.

```html
<!-- Parent modal -->
<div id="parent" class="modal" data-modal>
  <div class="modal__content">
    <button data-modal-trigger="child">Open nested</button>
  </div>
</div>

<!-- Child modal — auto z-index 310 when opened over parent -->
<div id="child" class="modal" data-modal>
  <div class="modal__content modal__content--sm">...</div>
</div>
```

---

## History API Integration

By default, opening a modal pushes a history state. This enables:

- **Browser Back button** → closes the modal.
- **Browser Forward button** → re-opens the modal.
- **Deep linking** — sharing a URL with modal history is possible (state-based, not hash-based).

The history entry contains:

```javascript
{ core4Modal: 'modal-id' }
```

Disable per-modal:

```html
<div class="modal" data-modal data-modal-history="false">...</div>
```

---

## Swipe to Close

On touch devices, swiping **downward** on the modal overlay or header closes the modal. The body scroll area is excluded unless scrolled to the very top.

| Gesture | Target | Result |
|---------|--------|--------|
| Swipe down | Overlay / Header | Close modal |
| Swipe down | Body (scrolled to top) | Close modal |
| Swipe down | Body (scrolled down) | Scroll up first |
| Swipe horizontal | Anywhere | Ignored |

Threshold: **80px** vertical movement.

---

## Examples

### Basic modal with trigger

```html
<button class="btn btn--primary" data-modal-trigger="basic">Open Modal</button>

<div id="basic" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Hello</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>This is a basic modal with header, body, and footer.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Close</button>
    </div>
  </div>
</div>
```

### Confirmation dialog

```html
<button class="btn btn--danger" data-modal-trigger="confirm">Delete Account</button>

<div id="confirm" class="modal" data-modal>
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Confirm Deletion</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Are you sure? This action cannot be undone.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Cancel</button>
      <button class="btn btn--danger">Delete</button>
    </div>
  </div>
</div>
```

### Auto-open after 5 seconds (once)

```html
<div id="promo" class="modal" data-modal data-modal-delay="5000" data-modal-once="true">
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Special Offer</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Get 20% off your first order!</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--primary" data-modal-close>Got it</button>
    </div>
  </div>
</div>
```

### Scroll-triggered newsletter

```html
<div id="subscribe" class="modal" data-modal data-modal-scroll="500" data-modal-once="true">
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Subscribe</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Get the best content once a week.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>No thanks</button>
      <button class="btn btn--primary">Subscribe</button>
    </div>
  </div>
</div>
```

### Exit intent popup

```html
<div id="exit" class="modal" data-modal data-modal-exit-intent="true" data-modal-once="true">
  <div class="modal__content modal__content--lg">
    <div class="modal__header">
      <h3 class="modal__title">Wait!</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>We have an exclusive offer just for you.</p>
    </div>
  </div>
</div>
```

### Multiple triggers for one modal

```html
<button class="btn" data-modal-trigger="contact">Contact (header)</button>
<a href="#" data-modal-trigger="contact">Contact (text)</a>
<button class="btn" data-modal-trigger="contact">Contact (footer)</button>

<div id="contact" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Contact Us</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Contact form here...</p>
    </div>
  </div>
</div>
```

### Nested modals

```html
<button class="btn" data-modal-trigger="parent">Open Parent</button>

<div id="parent" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Step 1</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>Click below to open a modal on top of this one.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--primary" data-modal-trigger="child">Open Child</button>
    </div>
  </div>
</div>

<div id="child" class="modal" data-modal>
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Step 2</h3>
      <button class="modal__close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal__body">
      <p>This modal sits above the parent (z-index 310).</p>
    </div>
  </div>
</div>
```

### Programmatic control

```javascript
// Open / close by ID
window.CORE4.components.modals.openModal('my-modal');
window.CORE4.components.modals.closeModal('my-modal');

// Close all
window.CORE4.components.modals.closeModal();

// Get all instances
const allModals = window.CORE4.components.modals.getModals();

// Manual instantiation
const { Modal } = window.CORE4.components;
const modal = new Modal(document.getElementById('dynamic-modal'));
modal.open();
```

---

**Author:** George Kiosov | **License:** MIT
