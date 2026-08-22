# 📘 SCSS Design System Documentation

> **Version:** 0.1.0 Alpha  
> **Updated:** August 2026  
> **Compatibility:** Dart Sass 1.80+

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Modular System (Settings)](#-modular-system-settings)
3. [Functions (Tools)](#-functions-tools)
4. [Mixins](#-mixins)
5. [Colors & Theming](#-colors--theming)
6. [Grid](#-grid)
7. [Components](#-components)
8. [Quick Start](#-quick-start)

---

## Introduction

This documentation describes the SCSS system of the design system. All sizes and spacing are multiples of the base unit **4px**, ensuring visual rhythm and predictability.

**System import:**
```scss
@use '1-settings' as settings;
@use '2-tools' as tools;
```

---

## 🧱 Modular System (Settings)

### Base Unit

```scss
$module: 4px; // Base unit
```

### Spacing

| Key | Value | Key | Value |
| :--- | :--- | :--- | :--- |
| `0` | 0 | `10` | 40px |
| `1` | 4px | `11` | 44px |
| `2` | 8px | `12` | 48px |
| `3` | 12px | `14` | 56px |
| `4` | 16px | `16` | 64px |
| `5` | 20px | `20` | 80px |
| `6` | 24px | `24` | 96px |
| `7` | 28px | | |
| `8` | 32px | | |
| `9` | 36px | | |

**Usage:**
```scss
.element {
  padding: settings.spacing(4); // → 16px
  margin: settings.spacing(6);  // → 24px
  gap: settings.spacing(3);     // → 12px
}
```

### Breakpoints

| Breakpoint | Value | Prefix |
| :--- | :--- | :--- |
| `xs` | 375px | `col-xs-*` |
| `sm` | 576px | `col-sm-*` |
| `md` | 768px | `col-md-*` |
| `lg` | 992px | `col-lg-*` |
| `xl` | 1200px | `col-xl-*` |
| `xxl` | 1400px | `col-xxl-*` |

---

## 🧪 Functions (Tools)

### `module($modules)`
Converts the number of modules to pixels.

```scss
@function module($modules) {
  @return $modules * settings.$module;
}
```

**Example:**
```scss
.element {
  padding: tools.module(4); // → 16px
  margin: tools.module(6);  // → 24px
  height: tools.module(10); // → 40px
}
```

### `spacing($name)`
Returns a spacing value by key.

```scss
@function spacing($name) {
  $modules: map.get(settings.$spacing-modules, $name);
  @return module($modules);
}
```

**Example:**
```scss
.element {
  padding: tools.spacing(4); // → 16px
  margin: tools.spacing(6);  // → 24px
  gap: tools.spacing(3);     // → 12px
}

// Quoted keys also work
.element {
  padding: tools.spacing('4'); // → 16px
}
```

### `radius($name)`
Returns a border-radius value.

```scss
@function radius($name) {
  $modules: map.get(settings.$radius-modules, $name);
  @if $name == 'full' {
    @return 9999px;
  }
  @return module($modules);
}
```

**Example:**
```scss
.card {
  border-radius: tools.radius('md');  // → 8px
}

.btn {
  border-radius: tools.radius('full'); // → 9999px (pill)
}
```

**Valid keys:** `'none'` (0), `'sm'` (4px), `'md'` (8px), `'lg'` (12px), `'xl'` (16px), `'full'` (9999px)

### `font-size($name)`
Returns a font size.

| Key | Value | Key | Value |
| :--- |:---------| :--- | :--- |
| `xs` | 16px     | `2xl` | 28px |
| `sm` | 18px     | `3xl` | 32px |
| `base` | 16px     | `4xl` | 36px |
| `md` | 18px     | `5xl` | 40px |
| `lg` | 20px     | `6xl` | 44px |
| `xl` | 24px     | `7xl` | 48px |

**Example:**
```scss
h1 {
  font-size: tools.font-size('3xl'); // → 32px
}

p {
  font-size: tools.font-size('base'); // → 16px
}
```

### `line-height($name)`
Returns a line-height value.

| Key | Value | Key | Value |
| :--- |:---------| :--- | :--- |
| `xs` | 16px     | `2xl` | 32px |
| `sm` | 18px     | `3xl` | 36px |
| `base` | 20px     | `4xl` | 40px |
| `md` | 20px     | `5xl` | 44px |
| `lg` | 24px     | `6xl` | 48px |
| `xl` | 28px     | `7xl` | 52px |

**Example:**
```scss
p {
  line-height: tools.line-height('base'); // → 20px
}
```

### `color($name, $shade: '500')`
Universal function for retrieving colors. Works with primary and semantic colors.

```scss
@function color($name, $shade: '500') {
  // Checks semantic colors, then the main palette
}
```

**Examples:**
```scss
// Primary color
.btn--danger {
  background: tools.color('red', '500');
}

// Semantic color
.btn--primary {
  background: tools.color('primary');
  // or with a shade
  background: tools.color('primary', '300');
}

// With transparency
.mark {
  background: rgba(tools.color('warning'), 0.2);
}
```

**Valid values:**
- **Primary:** `'red'`, `'blue'`, `'green'`, `'grey'`, etc.
- **Semantic:** `'primary'`, `'success'`, `'warning'`, `'danger'`, `'info'`

### `breakpoint($name)`
Returns a breakpoint value.

```scss
@function breakpoint($name) {
  @return map.get(settings.$breakpoints, $name);
}
```

**Example:**
```scss
.container {
  max-width: tools.breakpoint('xl'); // → 1200px
}
```

### `clamp-fluid($min, $max)`
Creates a fluid value for responsive typography.

```scss
@function clamp-fluid($min, $max) {
  $slope: math.div($max - $min, 1400px - 375px);
  $intercept: $min - $slope * 375px;
  @return clamp(#{$min}, #{$intercept} + #{$slope * 100}vw, #{$max});
}
```

**Example:**
```scss
h1 {
  font-size: tools.clamp-fluid(24px, 48px);
  // From 24px on mobile to 48px on desktop
}
```

### `vh($value, $type: 'svh')`
Creates a safe viewport value for mobile devices.

```scss
@function vh($value, $type: 'svh') {
  @return calc(#{$value} * var(--#{$type}));
}
```

**Example:**
```scss
.hero {
  min-height: tools.vh(100, 'svh'); // → 100svh
}

.modal {
  max-height: tools.vh(80, 'dvh'); // → 80dvh
}
```

---

## 🛠 Mixins

### Responsiveness

#### `respond-to($breakpoint)`
Mobile-first. Applies styles from the specified breakpoint and up.

```scss
@mixin respond-to($breakpoint) {
  $value: map.get(settings.$breakpoints, $breakpoint);
  @if $value {
    @media (min-width: $value) {
      @content;
    }
  }
}
```

**Example:**
```scss
.element {
  font-size: 14px;

  @include tools.respond-to('md') {
    font-size: 18px; // On tablets and up
  }

  @include tools.respond-to('lg') {
    font-size: 20px; // On desktop and up
  }
}
```

#### `respond-below($breakpoint)`
Desktop-first. Applies styles below the specified breakpoint.

```scss
@mixin respond-below($breakpoint) {
  $value: map.get(settings.$breakpoints, $breakpoint);
  @if $value {
    @media (max-width: $value - 1px) {
      @content;
    }
  }
}
```

**Example:**
```scss
.element {
  font-size: 18px;

  @include tools.respond-below('md') {
    font-size: 14px; // On mobile and tablets
  }
}
```

### Spacing (Logical Properties)

#### `margin-block($top, $bottom)`
Sets vertical outer spacing.

```scss
@mixin margin-block($top, $bottom: null) {
  @if $bottom != null {
    margin-block: spacing($top) spacing($bottom);
  } @else {
    margin-block: spacing($top);
  }
}
```

**Example:**
```scss
.element {
  @include tools.margin-block(4);       // → margin-block: 16px 16px;
  @include tools.margin-block(6, 4);    // → margin-block: 24px 16px;
}
```

#### `padding-block($top, $bottom)`
Sets vertical inner spacing.

```scss
@mixin padding-block($top, $bottom: null) {
  @if $bottom != null {
    padding-block: spacing($top) spacing($bottom);
  } @else {
    padding-block: spacing($top);
  }
}
```

**Example:**
```scss
.card {
  @include tools.padding-block(4);      // → padding-block: 16px 16px;
  @include tools.padding-block(6, 4);   // → padding-block: 24px 16px;
}
```

#### `margin-inline($start, $end)`
Sets horizontal outer spacing.

```scss
@mixin margin-inline($start, $end: null) {
  @if $end != null {
    margin-inline: spacing($start) spacing($end);
  } @else {
    margin-inline: spacing($start);
  }
}
```

**Example:**
```scss
.element {
  @include tools.margin-inline(6);      // → margin-inline: 24px 24px;
  @include tools.margin-inline(6, 4);   // → margin-inline: 24px 16px;
}
```

#### `padding-inline($start, $end)`
Sets horizontal inner spacing.

```scss
@mixin padding-inline($start, $end: null) {
  @if $end != null {
    padding-inline: spacing($start) spacing($end);
  } @else {
    padding-inline: spacing($start);
  }
}
```

**Example:**
```scss
.container {
  @include tools.padding-inline(6);     // → padding-inline: 24px 24px;
  @include tools.padding-inline(6, 4);  // → padding-inline: 24px 16px;
}
```

### Adaptive Spacing

#### `adaptive($property, $base, $scales)`
Changes spacing depending on the breakpoint.

```scss
@mixin adaptive($property, $base, $scales) {
  #{$property}: module($base);

  @each $breakpoint, $multiplier in $scales {
    @include respond-to($breakpoint) {
      #{$property}: module($base * $multiplier);
    }
  }
}
```

**Example:**
```scss
.section {
  // padding: 32px on mobile, 48px on tablet, 64px on desktop
  @include tools.adaptive(
    padding,
    8,
    (
      'md': 1.5,
      'lg': 2
    )
  );
}

.container {
  // padding-inline: 16px → 24px → 32px
  @include tools.adaptive(
    padding-inline,
    4,
    (
      'md': 1.5,
      'lg': 2
    )
  );
}
```

### Grid

#### `make-row($gap: $grid-gap)`
Creates a row with 12 columns.

```scss
@mixin make-row($gap: settings.$grid-gap) {
  display: grid;
  grid-template-columns: repeat(settings.$grid-columns, 1fr);
  gap: $gap;
}
```

**Example:**
```scss
.products {
  @include tools.make-row(24px);
}
```

#### `make-col($span)`
Sets column width (from 1 to 12).

```scss
@mixin make-col($span) {
  grid-column: span $span;
}
```

**Example:**
```scss
.sidebar {
  @include tools.make-col(3); // 3 out of 12 columns
}

.content {
  @include tools.make-col(9); // 9 out of 12 columns
}
```

#### `make-col-exact($start, $end)`
Exact column positioning.

```scss
@mixin make-col-exact($start, $end) {
  grid-column: $start / $end;
}
```

**Example:**
```scss
.hero-text {
  @include tools.make-col-exact(2, 8);  // From 2nd to 8th
}

.hero-image {
  @include tools.make-col-exact(9, 13); // From 9th to 13th (12 columns + 1)
}
```

### Typography

#### `font($size, $weight: normal, $line-height: normal, $color: var(--color-text))`
Sets all text properties in one line.

```scss
@mixin font($size, $weight: normal, $line-height: normal, $color: var(--color-text)) {
  font-size: font-size($size);
  font-weight: map.get(settings.$font-weight, $weight);

  @if $line-height != normal {
    line-height: line-height($line-height);
  }

  color: $color;
}
```

**Example:**
```scss
.card__title {
  @include tools.font('lg', 'semibold', 'tight', var(--color-text));
  // → font-size: 20px; font-weight: 600; line-height: 28px;
}

.card__description {
  @include tools.font('base', 'normal', 'relaxed', var(--color-text-secondary));
  // → font-size: 16px; font-weight: 400; line-height: 28px;
}
```

#### `heading($level: 1)`
Styles H1-H6 headings.

```scss
@mixin heading($level: 1) {
  $sizes: (1: '7xl', 2: '6xl', 3: '5xl', 4: '4xl', 5: '3xl', 6: '2xl');
  $line-heights: (1: '7xl', 2: '6xl', 3: '5xl', 4: '4xl', 5: '3xl', 6: '2xl');

  $size: map.get($sizes, $level);
  $lh: map.get($line-heights, $level);

  @include font($size, 'bold', $lh);
  @include margin-block(0, 4);
}
```

**Example:**
```scss
h1 { @include tools.heading(1); } // → font-size: 48px; font-weight: 700; line-height: 52px;
h2 { @include tools.heading(2); } // → font-size: 44px; font-weight: 700; line-height: 48px;
h3 { @include tools.heading(3); } // → font-size: 40px; font-weight: 700; line-height: 44px;
```

### Theming

#### `theme-aware($property, $light-value, $dark-value)`
Switches property values depending on the theme.

```scss
@mixin theme-aware($property, $light-value, $dark-value) {
  #{$property}: $light-value;

  @media (prefers-color-scheme: dark) {
    #{$property}: $dark-value;
  }

  [data-theme="dark"] & {
    #{$property}: $dark-value;
  }

  [data-theme="light"] & {
    #{$property}: $light-value;
  }
}
```

**Example:**
```scss
.card {
  @include tools.theme-aware('background', #ffffff, #0f172a);
  @include tools.theme-aware('border-color', #e2e8f0, #334155);
}
```

### Components & Utilities

#### `@mixin hover($property: all, $duration: settings.$transition-base)`
Adds a `@media (hover: hover)` section for the class with `:hover` and `:focus-visible`, plus animation parameters.

```scss
@mixin hover($property: all, $duration: settings.$transition-base, $timing: ease) {
  // Transition is ALWAYS set (it doesn't interfere on touch)
  @if $property != none {
    transition: $property $duration $timing;
  }

  // Hover only for devices with real hover
  @media (hover: hover) {
    &:hover {
      @content;
    }
  }

  // For keyboard — always show the effect
  &:focus-visible {
    @content;
  }
}
```

**Example:**
```scss
// Simple color change (button)
.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);

  @include hover(background-color) {
    background: var(--color-primary-hover);
  }
}

// Multiple properties at once
.btn--secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border-color: var(--color-border);

  // List the properties to animate
  @include hover((background-color, border-color, color)) {
    background: var(--color-bg-hover);
    border-color: var(--color-border-hover);
    color: var(--color-text-hover);
  }
}

// Lift animation (card)
.card {
  background: var(--color-surface);
  box-shadow: tools.shadow('sm');

  // Animate transform and box-shadow with custom duration
  @include hover((transform, box-shadow), 0.25s, ease-out) {
    transform: translateY(-4px);
    box-shadow: tools.shadow('lg');
  }
}

// Scale animation (icon/icon button)
.icon-btn {
  background: transparent;
  color: var(--color-text);

  @include hover((transform, color), 0.2s) {
    transform: scale(1.1);
    color: var(--color-primary);
  }
}

// Color change + underline (link)
.link {
  color: var(--color-primary);
  text-decoration: none;
  position: relative;

  @include hover((color, width), 0.3s) {
    color: var(--color-primary-hover);

    // If you want to animate a pseudo-element — do it inside
    &:after {
      width: 100%;
    }
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: currentColor;
    transition: width 0.3s ease; // duplicate for smooth pseudo-element
  }
}

// No animation (instant snap)
.tag {
  background: var(--color-bg);

  @include hover(none) {
    background: var(--color-bg-hover);
  }
}
```

#### `focus-ring($color: var(--color-border-focus), $offset: 2px)`
Adds focus styles for keyboard navigation.

```scss
@mixin focus-ring($color: var(--color-border-focus), $offset: 2px) {
  &:focus-visible {
    outline: 2px solid $color;
    outline-offset: $offset;
  }
}
```

**Example:**
```scss
.btn {
  @include tools.focus-ring;
}

.input {
  @include tools.focus-ring(var(--color-primary), 4px);
}
```

#### `custom-scrollbar($width: 8px, $radius: 4px)`
Creates a custom scrollbar.

```scss
@mixin custom-scrollbar($width: 8px, $radius: 4px) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: $radius;

    &:hover {
      background: var(--scrollbar-thumb-hover);
    }
  }
}
```

**Example:**
```scss
.modal__content {
  @include tools.custom-scrollbar(6px, 6px);
}
```

#### `truncate($lines: 1)`
Truncates text and adds an ellipsis.

```scss
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

**Example:**
```scss
.card__title {
  @include tools.truncate(1); // One line
}

.card__description {
  @include tools.truncate(3); // Three lines
}
```

#### `center($position: absolute)`
Centers an element absolutely.

```scss
@mixin center($position: absolute) {
  position: $position;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**Example:**
```scss
.loader {
  @include tools.center;
}

.modal {
  @include tools.center(fixed);
}
```

#### `overlay($opacity: 0.5, $z-index: z-index('overlay'))`
Creates an overlay for modals.

```scss
@mixin overlay($opacity: 0.5, $z-index: z-index('overlay')) {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, $opacity);
  z-index: $z-index;
}
```

**Example:**
```scss
.modal {
  &__overlay {
    @include tools.overlay(0.6);
  }
}
```

---

## 🌓 Colors & Theming

### Available Colors

| Group | Colors |
| :--- | :--- |
| **Primary** | red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, blue-grey, grey |
| **Semantic** | primary (blue), success (green), warning (amber), danger (red), info (light-blue) |

### CSS Variables

All colors are available via CSS variables:

```css
:root {
  --red-500: oklch(0.4 0.25 27.9deg);
  --blue-500: oklch(0.4 0.25 240deg);
  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-600);
}
```

### Usage in Components

```scss
.element {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-border);
}
```

### Theme Switching

```html
<!-- Light theme -->
<html data-theme="light">

<!-- Dark theme -->
<html data-theme="dark">
```

**JavaScript for switching:**
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 🎨 Grid

### Basic Grid

```html
<div class="row">
  <div class="col-4">Column 1</div>
  <div class="col-4">Column 2</div>
  <div class="col-4">Column 3</div>
</div>
```

### Responsive Columns

```html
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">
    <!-- Mobile: 1 column -->
    <!-- Tablet: 2 columns -->
    <!-- Desktop: 3 columns -->
  </div>
</div>
```

### Available Prefixes

| Prefix | Breakpoint |
| :--- | :--- |
| `col-` | All screens |
| `col-sm-` | ≥576px |
| `col-md-` | ≥768px |
| `col-lg-` | ≥992px |
| `col-xl-` | ≥1200px |
| `col-xxl-` | ≥1400px |

### Exact Positioning

```html
<div class="row">
  <div class="col-start-3 col-end-9">
    <!-- Starts at column 3, ends at 9 -->
    <!-- Occupies columns 3, 4, 5, 6, 7, 8 -->
  </div>
</div>
```

### Gap (spacing between columns)

```html
<div class="row gap-4">  <!-- 16px gap -->
<div class="row gap-6">  <!-- 24px gap -->
<div class="row gap-8">  <!-- 32px gap -->
```

### Alignment in Grid

```html
<div class="row justify-center align-center">
  <div class="col-4">Centered content</div>
</div>
```

---

## 🧩 Components

### Buttons (`.btn`)

```html
<!-- Variants -->
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--success">Success</button>
<button class="btn btn--warning">Warning</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--info">Info</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>

<!-- States -->
<button class="btn btn--disabled" disabled>Disabled</button>
<button class="btn btn--loading">Loading</button>
```

### Cards (`.card`)

```html
<div class="card">
  <div class="card__image">
    <img src="image.jpg" alt="Description">
  </div>
  <div class="card__content">
    <h3 class="card__title">Title</h3>
    <p class="card__description">Card description</p>
    <div class="card__footer">
      <span class="card__price">49,990 ₽</span>
      <button class="btn btn--primary">Add to cart</button>
    </div>
  </div>
</div>

<!-- Featured card -->
<div class="card card--featured">...</div>

<!-- Small card -->
<div class="card card--small">...</div>
```

### Modals (`.modal`)

```html
<!-- Modal -->
<div id="my-modal" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Title</h3>
      <button class="modal__close" data-modal-close>×</button>
    </div>
    <div class="modal__body">
      <p>Modal window content</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary">Cancel</button>
      <button class="btn btn--primary">Confirm</button>
    </div>
  </div>
</div>

<!-- Trigger -->
<button data-modal-trigger="my-modal">Open modal</button>
```

**Modal sizes:**
```html
<div class="modal__content modal__content--sm">  <!-- 400px -->
<div class="modal__content modal__content--lg">  <!-- 800px -->
<div class="modal__content modal__content--xl">  <!-- 1140px -->
<div class="modal__content modal__content--full"> <!-- Full screen -->
```

---

## ✅ Quick Start

### Include in a Project

```scss
// 1. Import the entire system
@use '1-settings' as settings;
@use '2-tools' as tools;

// 2. Use spacing
.element {
  padding: tools.spacing(4);
  margin: tools.spacing(6);
}

// 3. Use grid
.grid {
  @include tools.make-row;
}

// 4. Use colors
.element {
  color: tools.color('primary');
  background: var(--color-background-secondary);
}

// 5. Use responsiveness
.element {
  font-size: tools.font-size('base');

  @include tools.respond-to('md') {
    font-size: tools.font-size('lg');
  }
}
```

### Usage in HTML

```html
<!-- Container -->
<div class="container">
  <!-- Row -->
  <div class="row">
    <!-- Columns -->
    <div class="col-md-6 col-lg-4">
      <!-- Content -->
    </div>
  </div>
</div>
```

---

## 📚 Additional Resources

- [OKLCH Color Picker](https://oklch.com/) — visual tool for colors
- [CSS Color Level 4](https://www.w3.org/TR/css-color-4/) — specification
- [Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) — logical properties in CSS

---

**Version:** 1.0.0  
**Updated:** August 2026  
**Author:** core4 Design System
