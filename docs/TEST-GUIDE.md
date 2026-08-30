# CORE4 Test Guide

> **Version:** 0.2.0 Draft  
> **Updated:** August 2026  
> **Test Runner:** Jest  
> **Environment:** jsdom

---

## Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [File Structure](#file-structure)
5. [Test Files Reference](#test-files-reference)
6. [Configuration](#configuration)
7. [Writing New Tests](#writing-new-tests)
8. [Coverage Map](#coverage-map)

---

## Overview

CORE4 uses **Jest** as its test runner with the **jsdom** environment for DOM simulation. All tests live in `source/js/__tests__/` and follow a flat structure: one test file per module or layer.

The test suite covers:
- **Core layer** — configuration, helpers, event manager
- **Utilities** — DOM helpers, keyboard, focus trap, viewport
- **Components** — Modal, Accordion, Dropdown, Tabs, Theme, Button, Form (with Wizard, DraftSaver, PasswordStrength)
- **Application shell** — App orchestrator from `main.js`

Each test file is self-contained: it sets up its own DOM, runs assertions, and cleans up after itself.

---

## Test Architecture

### Principles

1. **Isolation** — every test gets a fresh `document.body.innerHTML = ''` in `beforeEach`.
2. **No side effects** — tests never mutate global state permanently.
3. **Event-driven assertions** — where components dispatch custom events (`EventManager`), tests listen for those events instead of inspecting internal state.
4. **Accessibility-first** — ARIA attributes, roles, and keyboard navigation are always tested.
5. **Lifecycle coverage** — every component class is tested through `init` → `use` → `destroy`.

### Mocking Strategy

| What | How |
|------|-----|
| `window.matchMedia` | Mocked in `theme.test.js` for `prefers-color-scheme` |
| `localStorage` / `sessionStorage` | Cleared in `beforeEach`; real storage API is used |
| `history.pushState` / `popstate` | Mocked via `jsdom` history API |
| `ResizeObserver` | Mocked as a no-op class if unavailable in jsdom |
| `fetch` | Mocked with `jest.fn()` in form async tests |
| `setTimeout` / `debounce` | Controlled via `jest.useFakeTimers()` |
| Dynamic `import()` | Not directly tested; individual module tests cover functionality |
| `window.CORE4` | Verified in `app.test.js` |

---

## Running Tests

```bash
# Run all tests once
npm run test

# Run in watch mode (re-runs on file change)
npm run test:watch

# Run a single file
npx jest source/js/__tests__/modal.test.js

# Run with coverage report
npx jest --coverage

# Run tests matching a pattern
npx jest --testNamePattern="opens with"
```

---

## File Structure

```
core4/
├── source/
│   └── js/
│       ├── __tests__/
│       │   ├── core.test.js              # Config, helpers, events
│       │   ├── utilities.test.js         # DOM, keyboard, focus-trap, viewport
│       │   ├── modal.test.js             # Modal component
│       │   ├── accordion.test.js         # Accordion component
│       │   ├── dropdown.test.js          # Dropdown component
│       │   ├── tabs.test.js              # Tabs component
│       │   ├── theme.test.js             # ThemeManager
│       │   ├── button.test.js            # Button async / toggle
│       │   ├── form.test.js              # Form, Wizard, DraftSaver, PasswordStrength
│       │   ├── form-extended.test.js     # Async validation, file upload, drag & drop, counters, groups
│       │   └── app.test.js               # App orchestrator from main.js
│       ├── core/
│       ├── utilities/
│       ├── modules/
│       └── main.js
├── docs/
│   ├── TEST-GUIDE.md
│   └── TEST-GUIDE-RU.md
├── jest.config.js
└── package.json
```

---

## Test Files Reference

### `core.test.js`

Tests the foundational layer of CORE4.

| Test Suite | What It Covers |
|-----------|----------------|
| `CONFIG` | All exported constants: `PREFIX`, `STATE`, `ATTR`, `SELECTORS`, `KEYBOARD`, `ANIMATION`, `THEME_KEY` |
| `isElement` | `true` for DOM elements, `false` for primitives, arrays, null |
| `isVisible` | Checks `display:none`, `visibility:hidden`, `opacity:0`, zero-size rects |
| `generateId` | Prefix support, uniqueness, fallback when `crypto.randomUUID` unavailable |
| `debounce` | Timer delay, multiple rapid calls collapse into one, default 300ms |
| `throttle` | Execution frequency cap, intermediate calls skipped |
| `deepClone` | Nested objects, arrays, null, primitives; independence from original |
| `isPlainObject` | Distinguishes `{}` from `[]`, `null`, `Date` |
| `getNestedValue` | Dot-notation paths, array paths, fallback values, null safety |
| `EventManager` | `dispatch` with detail payload, `on` unsubscribe function, `once` auto-removal |

### `utilities.test.js`

Tests low-level DOM and interaction utilities.

| Test Suite | What It Covers |
|-----------|----------------|
| `qs` / `qsa` | Safe querying, empty selector handling, array return type |
| `createElement` | Tag, classes, attributes, text and element children |
| `addClass` / `removeClass` / `toggleClass` | Single and multiple classes, condition toggle, null safety |
| `setAttr` / `getAttr` / `removeAttr` | CRUD operations, null safety |
| `Keyboard` | `isEscape`, `isEnter`, `isTab`, `isArrow` for all arrow keys |
| `FocusTrap` | Focusable element discovery, `activate`/`deactivate`, focus restoration, `Tab` loop at boundaries, `Shift+Tab` reverse loop |
| `isInViewport` | Visible elements, null safety |
| `onViewportEnter` | Returns `IntersectionObserver` instance |

### `modal.test.js`

Tests the most complex component in CORE4.

| # | Test | Assertion |
|---|------|-----------|
| 1 | `.open()` adds `is-open` | `classList.contains('is-open')` |
| 2 | `.close()` removes `is-open` | `classList.contains('is-open')` is `false` |
| 3 | Close button click | Modal closes |
| 4 | `Escape` key | Modal closes |
| 5 | Outside click (overlay) | Modal closes |
| 6 | Content click | Modal **does NOT** close |
| 7 | ARIA `role="dialog"` and `aria-modal="true"` | Set on init |
| 8 | Auto-generated `id` | Non-empty string when missing |
| 9 | `aria-labelledby` from `.modal__title` | Points to title element |
| 10 | Focus trap activation | `focusTrap` is truthy after open |
| 11 | `.toggle()` | Switches `isOpen` state |
| 12 | Double `.open()` | `Modal.openCount` stays at 1 |
| 13 | Double `.close()` | No error, stays closed |
| 14 | `.destroy()` | Cleans up all listeners |
| 15 | `scheduleDelay()` | Opens after N ms (fake timers) |
| 16 | `cancelDelay()` | Prevents scheduled open |
| 17 | `data-modal-once` | Blocks second open |
| 18 | Nested z-index | Second modal gets higher `z-index` |
| 19 | `modal:opened` event | Dispatched with `{ trigger, modal }` |
| 20 | `modal:closed` event | Dispatched with `{ modal }` |
| 21 | Body scroll lock | `is-locked` on `<html>` and `<body>` |
| 22 | Body scroll unlock | `is-locked` removed on close |
| 23 | Sibling `aria-hidden` | Siblings hidden when modal opens |
| 24 | Sibling restore | Siblings restored when modal closes |
| 25 | Focus return to trigger | `document.activeElement` is trigger after close |

### `accordion.test.js`

| Test Suite | What It Covers |
|-----------|----------------|
| Initialization | Correct item count, header/content pairing |
| ARIA | `aria-expanded="false"`, `aria-controls` on headers |
| `open()` | Adds open class, updates `aria-expanded` |
| `close()` | Removes class, updates `aria-expanded` |
| `toggle()` | Switches state |
| Single mode | Opening one closes others |
| Multiple mode | `data-accordion-multiple="true"` keeps multiple open |
| `expandAll()` | All panels open, all `aria-expanded="true"` |
| `collapseAll()` | All panels close, instant or animated |
| Click handler | Header click toggles panel |
| Enter key | `keydown` with `Enter` toggles panel |
| `destroy()` | Removes all listeners, clears items |
| `initAccordions()` | Returns array of instances |

### `dropdown.test.js`

| Test Suite | What It Covers |
|-----------|----------------|
| Initialization | Trigger, menu, item discovery |
| ARIA | `aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"`, `role="menuitem"` |
| `open()` / `close()` / `toggle()` | Class and state management |
| Click outside | Document click closes dropdown |
| `Escape` | Closes and returns focus to trigger |
| Trigger `ArrowDown` | Opens menu and focuses first item |
| Menu `ArrowDown` | Moves focus to next item |
| Menu `ArrowUp` | Wraps to last item |
| Menu `Home` | Focuses first item |
| Menu `End` | Focuses last item |
| Item click | Dispatches `dropdown:select` with `{ item, index }` |
| `destroy()` | Removes all listeners |
| `initDropdowns()` | Returns array of instances |

### `tabs.test.js`

| Test Suite | What It Covers |
|-----------|----------------|
| Initialization | Trigger/panel pairing, default active index 0 |
| ARIA | `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, `aria-labelledby` |
| `activate()` | Switches active tab, updates `hidden`/`inert` on panels |
| `disable()` / `enable()` | `aria-disabled`, `tabindex`, class toggling |
| `next()` / `prev()` | Navigation skipping disabled tabs |
| `tabs:changed` event | Dispatched with `{ index, previousIndex, trigger, panel }` |
| Click handler | Trigger click activates tab |
| Enter key | `keydown` with `Enter` activates tab |
| `destroy()` | Removes listeners, classes, ARIA attributes |
| `initTabs()` | Returns array of instances |

### `theme.test.js`

| Test Suite | What It Covers |
|-----------|----------------|
| Default | Applies system theme (dark or light) |
| `apply('dark')` | Sets `data-theme="dark"`, adds `.dark` class |
| `apply('light')` | Sets `data-theme="light"`, adds `.light` class |
| `toggle()` | Switches between dark and light |
| `reset()` | Returns to system preference |
| Persistence | `localStorage` read/write |
| `theme:changed` event | Dispatched with `{ effective, choice, isDark, isSystem }` |
| Getters | `isDark`, `isLight`, `choice`, `effective` |
| `set()` | Alias for `apply()` |

### `button.test.js`

| Test Suite | What It Covers |
|-----------|----------------|
| Default type | `type === 'default'`, original text preserved |
| Async click | `preventDefault`, `isProcessing`, `aria-busy`, `disabled`, `button:click` event |
| `setSuccess()` | Removes loading, adds success class |
| `setError()` | Removes loading, adds error class, custom text |
| `reset()` | Clears all states, restores text, removes `disabled` |
| Toggle | `aria-pressed`, `is-active` class, `button:toggle` event |
| Force toggle | `toggle(true)` / `toggle(false)` |
| Default button click | Dispatches `button:click` |
| Processing block | `preventDefault` + `stopPropagation` during loading |
| `setText()` / `setHTML()` | Content mutation |
| `scheduleReset()` | Auto-reset after `resetDelay` (fake timers) |

### `form.test.js`

Tests four classes: `Form`, `Wizard`, `DraftSaver`, `PasswordStrength`.

#### Form

| Test | What It Covers |
|------|----------------|
| Field initialization | Discovers 3 fields from DOM |
| Required validation | Empty value → `is-invalid` class |
| Email validation | Invalid format rejected, valid format accepted |
| Min value validation | `data-validate-min="18"` rejects 10 |
| Number validation | Rejects non-numeric input |
| Full form valid | All fields filled → `validateForm()` returns `true` |
| Full form invalid | Empty form → `validateForm()` returns `false` |
| `reset()` | Clears all validation classes |
| `getData()` | Returns object with field values |
| `form:initialized` event | Dispatched on init |
| `destroy()` | Removes listeners, clears fields |

#### Wizard

| Test | What It Covers |
|------|----------------|
| Step initialization | 3 steps, current = 0 |
| `next()` | Advances after validation |
| `prev()` | Goes back |
| `goToStep()` | Jumps to specific index |
| `getTotalSteps()` | Returns count |
| `destroy()` | Removes listeners |

#### DraftSaver

| Test | What It Covers |
|------|----------------|
| `save()` | Serializes form to `localStorage` |
| `clear()` | Removes key from `localStorage` |
| `getDraftAge()` | Returns age in ms |
| `destroy()` | Removes listeners |

#### PasswordStrength

| Test | What It Covers |
|------|----------------|
| Empty password | Score = 0 |
| Weak password | Low score |
| Strong password | High score |
| Common patterns | Penalizes "password", "123", etc. |
| Sequential chars | Penalizes "abc", "123" |
| Repeated chars | Penalizes "aaa" |
| `dataset.strengthScore` | Stored on field after input |
| `password:strength` event | Dispatched with `{ score, feedback, rules }` |
| `destroy()` | Removes input listener |

### `form-extended.test.js`

Extends form coverage with advanced features.

#### Async Validation

| Test | What It Covers |
|------|----------------|
| Calls fetch when async rule present | `data-validate-async` triggers HTTP request |
| Shows error on async invalid | Response `{ valid: false }` → `is-invalid` |
| Skips async below minlength | `data-validate-async-minlength` gate |
| Aborts previous request | Rapid input cancels prior fetch via `AbortController` |

#### File Upload

| Test | What It Covers |
|------|----------------|
| Change does not throw | File input handler bound safely |
| `fileType` rule | Validates MIME type against whitelist |
| `fileSize` rule | Rejects files exceeding `data-validate-file-size` |
| `fileCount` rule | Rejects files exceeding `data-validate-file-count` |

#### Drag & Drop

| Test | What It Covers |
|------|----------------|
| `dragover` adds `is-dragover` | Visual feedback on drag |
| `dragleave` removes `is-dragover` | Cleanup on exit |
| `drop` removes class + triggers change | File transfer simulation |

#### Character Counter

| Test | What It Covers |
|------|----------------|
| Updates on input | Live count display (`X / Y`) |
| `is-exceeded` at limit | Visual warning at 100% |
| `is-near-limit` at 90% | Early warning at threshold |

#### Maxlength Enforcement

| Test | What It Covers |
|------|----------------|
| Truncates exceeding value | Real-time cut to `maxlength` |

#### Conditional Validation

| Test | What It Covers |
|------|----------------|
| `validateIf` skips when condition false | Field ignored when checkbox unchecked |
| `validateIf` validates when condition true | Field checked when checkbox checked |
| `validateIfNot` skips when condition true | Inverse logic gate |

#### Group Validation

| Test | What It Covers |
|------|----------------|
| `required` group fails when all empty | At least one field needed |
| `required` group passes with one value | Single filled field satisfies |
| `minChecked` fails below threshold | `data-validate-group-min` enforcement |
| `minChecked` passes at threshold | Exact minimum satisfied |
| `maxChecked` fails above threshold | `data-validate-group-max` enforcement |

#### Summary

| Test | What It Covers |
|------|----------------|
| `showSummary` error | Displays message with error styling |
| `showSummary` success | Displays message with success styling |
| `hideSummary` | Removes visibility class |

#### Progress

| Test | What It Covers |
|------|----------------|
| Initializes at 0% | Default text and bar width |
| ARIA attributes | `role="progressbar"`, `aria-valuemin`, `aria-valuemax` |

#### Submit

| Test | What It Covers |
|------|----------------|
| Prevents default when invalid | `event.preventDefault()` called on bad form |
| Dispatches `form:submit` when valid | Custom event on successful validation |

#### Field Error API

| Test | What It Covers |
|------|----------------|
| `setFieldError` | Programmatic error injection with `aria-invalid` |
| `clearFieldError` | Programmatic error removal |

#### Masked Raw Values

| Test | What It Covers |
|------|----------------|
| `getMaskedRawValues` | Returns unmasked data from `data-mask-raw` |

### `app.test.js`

Tests the application orchestrator from `main.js`.

| Test | What It Covers |
|------|----------------|
| `window.CORE4` namespace | Exposes `app`, `core`, `utils`, `components` |
| Constructor config merge | Default module flags present |
| Init guard against double init | Second `init()` is no-op |
| `destroy` resets state | `isInitialized = false`, empty `modules` and `_factories` |
| `getModule` returns null for unknown | Safe fallback |
| `getModule` returns null before init | Pre-initialization guard |
| `reinit` method exists | Callable |
| `destroy` method exists | Callable |
| `init` method exists | Callable |
| Modules empty before init | `Object.keys(app.modules).length === 0` |
| Safe multiple destroy | No errors on repeated calls |

---

## Configuration

### Jest Setup

Ensure `jest.config.js` (or `package.json`) contains:

```js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'] // optional
};
```

The `moduleNameMapper` is **critical**: CORE4 imports use explicit `.js` extensions (`import { Modal } from '../modules/modal/_modal.js'`), but Jest resolves modules without extensions by default.

### Optional: `jest.setup.js`

```js
// Mock ResizeObserver for tabs and other components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock scrollIntoView
element.prototype.scrollIntoView = jest.fn();
```

---

## Writing New Tests

### Template

```javascript
import { MyComponent } from '../modules/my-module/_my-module.js';

describe('MyComponent', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('does something expected', () => {
    document.body.innerHTML = `
      <div data-my-component>Content</div>
    `;
    const el = document.querySelector('[data-my-component]');
    const instance = new MyComponent(el);

    // Act
    instance.doSomething();

    // Assert
    expect(el.classList.contains('is-active')).toBe(true);
  });
});
```

### Checklist for New Component Tests

- [ ] DOM setup in `beforeEach`
- [ ] ARIA attributes checked after `init()`
- [ ] State classes checked after actions
- [ ] Custom events dispatched and caught
- [ ] Keyboard navigation tested (if interactive)
- [ ] `destroy()` cleans up listeners and state
- [ ] Edge cases: double calls, missing DOM, null inputs

---

## Coverage Map

| Layer | Module | Test File | Coverage |
|-------|--------|-----------|----------|
| Core | `_config.js` | `core.test.js` | Constants |
| Core | `_helpers.js` | `core.test.js` | All exported functions |
| Core | `_events.js` | `core.test.js` | dispatch, on, once |
| Utilities | `_dom.js` | `utilities.test.js` | All functions |
| Utilities | `_keyboard.js` | `utilities.test.js` | All methods |
| Utilities | `_focus-trap.js` | `utilities.test.js` | Lifecycle + Tab loop |
| Utilities | `_viewport.js` | `utilities.test.js` | isInViewport, onViewportEnter |
| Modules | `Modal` | `modal.test.js` | Full lifecycle + triggers |
| Modules | `Accordion` | `accordion.test.js` | Full lifecycle + modes |
| Modules | `Dropdown` | `dropdown.test.js` | Full lifecycle + keyboard |
| Modules | `Tabs` | `tabs.test.js` | Activation + ARIA + destroy |
| Modules | `ThemeManager` | `theme.test.js` | Apply/toggle/persist |
| Modules | `Button` | `button.test.js` | Async + toggle + reset |
| Modules | `Form` | `form.test.js` | Validation + events |
| Modules | `Form` (extended) | `form-extended.test.js` | Async, file, drag & drop, counter, groups, summary, progress, submit |
| Modules | `Wizard` | `form.test.js` | Navigation + validation |
| Modules | `DraftSaver` | `form.test.js` | Storage lifecycle |
| Modules | `PasswordStrength` | `form.test.js` | Scoring + events |
| App | `App` | `app.test.js` | Namespace, lifecycle, guards |

---

*For the Russian version, see [TEST-GUIDE-RU.md](TEST-GUIDE-RU.md).*
