# 📘 Tabs Component Guide

> **Version:** 0.1.0 Draft | **Updated:** August 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [HTML Structure](#html-structure)
3. [Data Attributes](#data-attributes)
4. [CSS Variants](#css-variants)
5. [JavaScript API](#javascript-api)
6. [Accessibility](#accessibility)
7. [Keyboard Navigation](#keyboard-navigation)
8. [Animations](#animations)
9. [URL Hash Sync](#url-hash-sync)
10. [History API](#history-api)
11. [Persistence](#persistence)
12. [Lazy Loading](#lazy-loading)
13. [Scroll Arrows](#scroll-arrows)
14. [Touch Swipe](#touch-swipe)
15. [Disabled Tabs](#disabled-tabs)
16. [Nested Tabs](#nested-tabs)
17. [Examples](#examples)

---

## Overview

The Tabs component provides an accessible, animated tab interface with multiple visual variants:

- **Underline** — gliding bottom indicator (default)
- **Pill** — rounded capsule buttons with solid active background
- **Segmented** — unified background container with sliding active pill
- **Vertical** — side navigation, collapses to horizontal on mobile

Additional features:

- **Gliding indicator** — animated `transform`-based indicator that smoothly slides between tabs
- **Panel animations** — fade or slide transitions between content panels
- **Auto-height** — container smoothly animates to match active panel height
- **URL hash sync** — active tab reflected in `#hash`
- **History API** — browser Back/Forward navigates between tabs
- **Persistence** — remembers active tab in `sessionStorage`
- **Lazy loading** — panel content loads only on first activation
- **Overflow dropdown** — excess tabs collapse into a "More" menu on narrow screens
- **Touch swipe** — swipe left/right to switch tabs on mobile
- **Disabled tabs** — skipped in navigation, visually dimmed
- **Nested tabs** — fully isolated instances with independent state

The module is **lazy-loaded** — the JS chunk loads only when `[data-tabs]` elements exist in the DOM.

---

## HTML Structure

```html
<div class="tabs" data-tabs data-tabs-variant="underline">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="panel-1">Tab 1</button>
    <button class="tabs__trigger" data-tabs-trigger="panel-2">Tab 2</button>
    <button class="tabs__trigger" data-tabs-trigger="panel-3">Tab 3</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="panel-1">Content 1</div>
    <div class="tabs__panel" data-tabs-panel="panel-2">Content 2</div>
    <div class="tabs__panel" data-tabs-panel="panel-3">Content 3</div>
  </div>
</div>
```

### Elements

| Element | Class | Required | Description |
|---------|-------|----------|-------------|
| Root | `.tabs` | Yes | Container. Must have `data-tabs` for auto-init. |
| List | `.tabs__list` | Yes | `role="tablist"`. Wraps all triggers. Can be auto-generated. |
| Trigger | `.tabs__trigger` | Yes | `role="tab"`. Activates the matching panel. |
| Panels wrapper | `.tabs__panels` | No | Optional wrapper for panel positioning. |
| Panel | `.tabs__panel` | Yes | `role="tabpanel"`. Content for each tab. |

### Trigger-to-panel binding

Triggers and panels are matched by the value of `data-tabs-trigger` and `data-tabs-panel`:

```html
<button data-tabs-trigger="settings">Settings</button>
<div data-tabs-panel="settings">Settings content...</div>
```

You can also use `href="#id"` on anchor tags:

```html
<a class="tabs__trigger" href="#settings" data-tabs-trigger="settings">Settings</a>
```

---

## Data Attributes

### `data-tabs`

Required on the root `.tabs` element. Enables auto-initialization.

```html
<div class="tabs" data-tabs>...</div>
```

### `data-tabs-variant`

Sets the visual variant. One of: `underline` (default), `pill`, `segmented`, `vertical`.

```html
<div class="tabs" data-tabs data-tabs-variant="pill">...</div>
```

### `data-tabs-animation`

Panel transition type. One of: `fade`, `slide`, `none` (default).

```html
<div class="tabs" data-tabs data-tabs-animation="fade">...</div>
```

### `data-tabs-hash`

Enables URL hash synchronization. The active tab's target ID is appended to the URL as `#hash`.

```html
<div class="tabs" data-tabs data-tabs-hash>...</div>
```

### `data-tabs-history`

Enables History API integration. When combined with `data-tabs-hash`, opening a tab pushes a history state, and the browser Back/Forward buttons navigate between tabs.

Enabled by default when `data-tabs-hash` is present. Set to `false` to disable:

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history="false">...</div>
```

### `data-tabs-persist`

Remembers the active tab index in `sessionStorage`. On page reload, the previously active tab is restored.

```html
<div class="tabs" data-tabs data-tabs-persist>...</div>
```

### `data-tabs-lazy`

Defers panel initialization. Panels marked with `data-tabs-lazy-loaded="false"` only render their content on first activation. Use `data-tabs-lazy-src` on a panel to fetch content via AJAX.

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/api/content/remote">
    <!-- Loaded on first activation -->
  </div>
</div>
```

### `data-tabs-auto-height`

Animates the panels container height to match the active panel.

```html
<div class="tabs" data-tabs data-tabs-auto-height>...</div>
```

### `data-tabs-scroll-arrows`

When the tab list is too narrow, previous/next arrow buttons appear to scroll the tab list horizontally. On touch devices arrows are hidden — native swipe is preferred.

```html
<div class="tabs" data-tabs data-tabs-overflow="dropdown">...</div>
```

### `data-tabs-disabled="true"` / `disabled`

Marks a tab as disabled. Disabled tabs are skipped during keyboard navigation, cannot be clicked, and receive `aria-disabled="true"`.

```html
<button class="tabs__trigger" data-tabs-trigger="premium" disabled>Premium</button>
<!-- or -->
<button class="tabs__trigger" data-tabs-trigger="premium" data-tabs-disabled="true">Premium</button>
```

---

## CSS Variants

### Underline (default)

```html
<div class="tabs tabs--underline" data-tabs>...</div>
```

- Bottom border on the list
- Gliding indicator line (2px) under the active tab
- Indicator uses `transform: translateX()` for GPU-composited animation

### Pill

```html
<div class="tabs tabs--pill" data-tabs data-tabs-variant="pill">...</div>
```

- Rounded capsule buttons (`border-radius: 9999px`)
- Active tab has solid background (`--tabs-active-bg`)
- No gliding indicator — background change is instant

### Segmented

```html
<div class="tabs tabs--segmented" data-tabs data-tabs-variant="segmented">...</div>
```

- Unified background container with padding
- Gliding indicator is a solid pill that slides behind the active tab
- Indicator has `box-shadow` for elevation
- Active tab text color changes while indicator moves

### Vertical

```html
<div class="tabs tabs--vertical" data-tabs data-tabs-variant="vertical">...</div>
```

- Side-by-side layout: tab list on the left, panels on the right
- Gliding indicator is a 3px vertical line on the left edge
- On mobile (`< md`), collapses to horizontal underline tabs
- `aria-orientation="vertical"` on the tablist

---

## JavaScript API

### Auto-initialization

```javascript
import { initTabs } from './modules/tabs/_index.js';

const tabs = initTabs(); // Returns Tabs[]
```

Called automatically by `App.init()` when `[data-tabs]` elements are present.

### Tabs class

```javascript
import { Tabs } from './modules/tabs/_tabs.js';

const tabs = new Tabs(document.getElementById('my-tabs'));
```

#### Constructor options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `variant` | `string` | `'underline'` | Visual variant |
| `animation` | `string` | `'none'` | Panel transition: `fade`, `slide`, `none` |
| `lazy` | `boolean` | `false` | Lazy-load panel content |
| `hash` | `boolean` | `false` | Sync with URL hash |
| `history` | `boolean` | `true` | Push history state (requires `hash`) |
| `persist` | `boolean` | `false` | Remember in `sessionStorage` |
| `autoHeight` | `boolean` | `false` | Animate container height |
| `openClass` | `string` | `'is-active'` | Active state CSS class |
| `disabledClass` | `string` | `'is-disabled'` | Disabled state CSS class |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `activate(index, opts?)` | `void` | Activate tab by index. `opts.silent`, `opts.skipHistory`, `opts.skipHash`, `opts.skipPersist` |
| `next()` | `void` | Activate next non-disabled tab |
| `prev()` | `void` | Activate previous non-disabled tab |
| `disable(index)` | `void` | Disable a tab by index |
| `enable(index)` | `void` | Enable a tab by index |
| `destroy()` | `void` | Remove listeners, clear observers, reset ARIA |

#### Getters

| Getter | Type | Description |
|--------|------|-------------|
| `active` | `number` | Current active tab index |
| `count` | `number` | Total number of tabs |

### Module-level helpers

```javascript
import { activateTab, getTabs, getTabInstance } from './modules/tabs/_index.js';

activateTab('my-tabs', 2);           // Activate tab index 2 by container ID
getTabs();                           // Get all Tabs instances
getTabInstance('my-tabs');           // Get instance by ID or element
```

### Global API (development)

```javascript
// After App.init()
window.CORE4.components.Tabs;        // Tabs class
window.CORE4.app.getModule('tabs');  // Array of Tabs instances
```

---

## Accessibility

### ARIA attributes (auto-generated)

| Attribute | Target | Description |
|-----------|--------|-------------|
| `role="tablist"` | `.tabs__list` | Declares the tab container |
| `role="tab"` | `.tabs__trigger` | Each tab is a tab |
| `role="tabpanel"` | `.tabs__panel` | Each panel is a tabpanel |
| `aria-selected="true/false"` | `.tabs__trigger` | Active state |
| `aria-controls="panel-id"` | `.tabs__trigger` | Links tab to panel |
| `aria-labelledby="tab-id"` | `.tabs__panel` | Links panel to tab |
| `aria-orientation="vertical"` | `.tabs__list` | For vertical variant |
| `aria-disabled="true"` | `.tabs__trigger` | For disabled tabs |
| `tabindex="0"` | active tab | Focusable |
| `tabindex="-1"` | inactive tabs | Programmatically focusable only |
| `hidden` / `inert` | inactive panels | Hidden from AT and tab order |

### Focus management

- Focus moves to the active tab when activated via keyboard.
- Pressing `Tab` from the tablist moves focus **into the active panel**, not to the next tab.
- Focus is never trapped — users can Tab out of the component naturally.

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` (horizontal) / `↑` (vertical) | Previous non-disabled tab |
| `→` (horizontal) / `↓` (vertical) | Next non-disabled tab |
| `Home` | First non-disabled tab |
| `End` | Last non-disabled tab |
| `Enter` / `Space` | Activate focused tab |
| `Tab` | Move focus from tablist to active panel |

Disabled tabs are automatically skipped during arrow navigation.

---

## Animations

### Panel transitions

Set via `data-tabs-animation` or constructor option.

#### Fade

```html
<div data-tabs data-tabs-animation="fade">
```

- Active panel fades in + slides up 4px
- Previous panel fades out + slides up -4px (absolute positioned)
- Duration: 350ms / 200ms

#### Slide

```html
<div data-tabs data-tabs-animation="slide">
```

- Active panel slides in from the direction of navigation
- Moving right → slides in from right
- Moving left → slides in from left
- Duration: 350ms

#### None

Instant switch, no animation. Respects `prefers-reduced-motion` automatically.

### Gliding indicator

The underline/segmented indicator uses:

```css
transition: transform 0.35s ease, width 0.35s ease, height 0.35s ease;
```

This ensures GPU-composited animation with no layout thrashing. On `prefers-reduced-motion: reduce`, transitions are disabled.

### Auto-height

When `data-tabs-auto-height` is enabled, the panels wrapper animates its `height` property to match the active panel's height:

```css
transition: height 0.35s ease;
```

---

## URL Hash Sync

Enable with `data-tabs-hash`:

```html
<div class="tabs" data-tabs data-tabs-hash>
  <button data-tabs-trigger="settings">Settings</button>
  <div data-tabs-panel="settings">...</div>
</div>
```

When the "Settings" tab is activated, the URL becomes:

```
https://example.com/page#settings
```

On page load, if the URL contains `#settings`, that tab is activated automatically. This enables **deep linking** to specific tabs.

---

## History API

Enable with `data-tabs-hash` (history is on by default when hash is enabled):

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history>
  ...
</div>
```

Behavior:

- Opening a tab **pushes** a history state: `{ core4Tabs: 'tabs-id', index: N }`
- Browser **Back** button → navigates to previous tab
- Browser **Forward** button → navigates to next tab
- The URL hash is updated via `history.pushState`

Disable per-instance:

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history="false">
```

---

## Persistence

Enable with `data-tabs-persist`:

```html
<div class="tabs" data-tabs data-tabs-persist>
  ...
</div>
```

The active tab index is saved to `sessionStorage` under the key `core4-tabs-{id}`. On page reload:

1. If a hash is present in the URL → hash wins
2. Else if `sessionStorage` has a stored index → restore it
3. Else → fall back to the first non-disabled tab

`sessionStorage` is scoped to the tab/window and clears when the session ends.

---

## Lazy Loading

Enable with `data-tabs-lazy`:

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/api/tab-content">
    <!-- Content loaded via fetch() on first activation -->
  </div>
</div>
```

Behavior:

- On first activation, the panel's `data-tabs-lazy-src` URL is fetched
- Response HTML is injected into the panel
- `data-tabs-lazy-loaded` is set to `"true"`
- Event `tabs:loaded` is dispatched on the root element

If no `data-tabs-lazy-src` is provided, the panel is simply marked as loaded without a network request (useful for deferred JS initialization inside panels).

---

## Scroll Arrows

Enable with `data-tabs-scroll-arrows`:

```html
<div class="tabs" data-tabs data-tabs-scroll-arrows>
  <div class="tabs__list" data-tabs-list>
    <button data-tabs-trigger="tab1">Tab 1</button>
    <button data-tabs-trigger="tab2">Tab 2</button>
    <!-- ...many tabs... -->
  </div>
</div>
```

Behavior:

- When the tab list is wider than its container, `‹` and `›` arrow buttons appear on the sides
- Clicking an arrow smoothly scrolls the tab list by 75% of its visible width
- Arrows automatically show/hide based on scroll position
- On touch devices (`hover: none` and `pointer: coarse`) arrows are hidden — users swipe natively
- The active tab is automatically scrolled into view when activated via keyboard or programmatically

---

## Touch Swipe

On touch devices, swiping horizontally across the panels switches tabs:

| Gesture | Result |
|---------|--------|
| Swipe left | Next tab |
| Swipe right | Previous tab |
| Vertical scroll | Ignored (panels scroll normally) |

Threshold: **50px** horizontal movement.

The swipe handler checks if vertical movement dominates and aborts to allow normal page scrolling.

---

## Disabled Tabs

Mark a tab as disabled via `disabled` attribute or `data-tabs-disabled="true"`:

```html
<button class="tabs__trigger" data-tabs-trigger="premium" disabled>Premium</button>
```

Effects:

- `aria-disabled="true"` and `tabindex="-1"`
- `.is-disabled` class for styling
- Skipped during arrow key navigation
- Click events are not bound
- If the active tab becomes disabled, focus moves to the next available tab

---

## Nested Tabs

Tabs can be nested inside other tabs. Each instance is fully isolated:

```html
<div class="tabs" data-tabs data-tabs-variant="underline">
  <div class="tabs__list" data-tabs-list>
    <button data-tabs-trigger="products">Products</button>
    <button data-tabs-trigger="services">Services</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="products">
      <!-- Nested tabs -->
      <div class="tabs" data-tabs data-tabs-variant="pill">
        <div class="tabs__list" data-tabs-list>
          <button data-tabs-trigger="electronics">Electronics</button>
          <button data-tabs-trigger="clothing">Clothing</button>
        </div>
        <div class="tabs__panels">
          <div class="tabs__panel" data-tabs-panel="electronics">...</div>
          <div class="tabs__panel" data-tabs-panel="clothing">...</div>
        </div>
      </div>
    </div>
    <div class="tabs__panel" data-tabs-panel="services">...</div>
  </div>
</div>
```

Each instance:
- Has its own state, event listeners, and observers
- Receives independent ARIA attributes
- Can use different variants and options
- Is cleaned up independently on `destroy()`

---

## Examples

### Basic underline tabs

```html
<div class="tabs" data-tabs>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="account">Account</button>
    <button class="tabs__trigger" data-tabs-trigger="security">Security</button>
    <button class="tabs__trigger" data-tabs-trigger="billing">Billing</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="account">
      <p>Manage your account settings.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="security">
      <p>Update password and 2FA.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="billing">
      <p>View invoices and payment methods.</p>
    </div>
  </div>
</div>
```

### Pill tabs with fade animation

```html
<div class="tabs" data-tabs data-tabs-variant="pill" data-tabs-animation="fade">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="all">All</button>
    <button class="tabs__trigger" data-tabs-trigger="active">Active</button>
    <button class="tabs__trigger" data-tabs-trigger="archived">Archived</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="all">All items</div>
    <div class="tabs__panel" data-tabs-panel="active">Active items</div>
    <div class="tabs__panel" data-tabs-panel="archived">Archived items</div>
  </div>
</div>
```

### Vertical settings tabs

```html
<div class="tabs" data-tabs data-tabs-variant="vertical">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="general">General</button>
    <button class="tabs__trigger" data-tabs-trigger="appearance">Appearance</button>
    <button class="tabs__trigger" data-tabs-trigger="advanced">Advanced</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="general">General settings...</div>
    <div class="tabs__panel" data-tabs-panel="appearance">Theme settings...</div>
    <div class="tabs__panel" data-tabs-panel="advanced">Advanced options...</div>
  </div>
</div>
```

### Hash-synced documentation tabs

```html
<div class="tabs" id="docs-tabs" data-tabs data-tabs-variant="underline"
     data-tabs-hash data-tabs-history data-tabs-persist>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="getting-started">Getting Started</button>
    <button class="tabs__trigger" data-tabs-trigger="api">API Reference</button>
    <button class="tabs__trigger" data-tabs-trigger="examples">Examples</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="getting-started">...</div>
    <div class="tabs__panel" data-tabs-panel="api">...</div>
    <div class="tabs__panel" data-tabs-panel="examples">...</div>
  </div>
</div>
```

### Lazy-loaded remote content

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="local">Local</button>
    <button class="tabs__trigger" data-tabs-trigger="remote">Remote</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="local">
      <p>This content is in the DOM immediately.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/partials/remote-content.html">
      <!-- Loaded via fetch() on first activation -->
    </div>
  </div>
</div>
```

### Programmatic control

```javascript
// Activate tab by index
const tabs = window.CORE4.app.getModule('tabs')[0];
tabs.activate(2);

// Navigate programmatically
tabs.next();
tabs.prev();

// Disable/enable
tabs.disable(1);
tabs.enable(1);

// By container ID
import { activateTab } from './modules/tabs/_index.js';
activateTab('docs-tabs', 1);

// Listen to events
document.getElementById('docs-tabs').addEventListener('tabs:changed', (e) => {
  console.log('Active index:', e.detail.index);
  console.log('Previous index:', e.detail.previousIndex);
});
```

---

**Author:** George Kiosov | **License:** MIT
