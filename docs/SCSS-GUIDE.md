# CORE4 SCSS Documentation

> **Version:** 0.1.0 Draft | **Updated:** August 2026

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Settings](#settings)
4. [Tools](#tools)
   - [Functions](#functions)
   - [Mixins](#mixins)
5. [Generic](#generic)
   - [Fonts](#fonts)
   - [Animations](#animations)
   - [Base & Typography](#base--typography)
6. [Objects](#objects)
   - [Grid](#grid)
   - [Layout](#layout)
   - [Utilities](#utilities)
7. [Components](#components)
   - [Button](#button)
   - [Card](#card)
   - [Modal](#modal)
   - [Accordion](#accordion)
   - [Dropdown](#dropdown)
8. [Themes](#themes)
9. [Build & Webpack](#build--webpack)

---

## Overview

CORE4 uses a modular SCSS architecture based on **ITCSS** (Inverted Triangle CSS):

| Layer | Folder | Purpose |
|-------|--------|---------|
| 1. Settings | `1-settings/` | Variables, colors, typography, themes |
| 2. Tools | `2-tools/` | Functions and mixins |
| 3. Generic | `3-generic/` | Base styles, fonts, animations, typography |
| 4. Objects | `4-objects/` | Grid, layout patterns, utility classes |
| 5. Components | `5-components/` | UI components (buttons, cards, modals, etc.) |

The base module is **4px**. All spacing, sizing, and grid values are multiples of 4.

---

## File Structure

```
source/scss/
├── 1-settings/
│   ├── _variables.scss
│   ├── _typography.scss
│   ├── _colors.scss
│   ├── _themes.scss
│   ├── _reset.scss
│   └── _index.scss
├── 2-tools/
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _index.scss
├── 3-generic/
│   ├── _base.scss
│   ├── _fonts.scss
│   ├── _animations.scss
│   ├── _typography.scss
│   └── _index.scss
├── 4-objects/
│   ├── _grid.scss
│   ├── _layout.scss
│   ├── _utilities.scss
│   └── _index.scss
├── 5-components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _modal.scss
│   └── _index.scss
└── main.scss
```

---

## Settings

### `_variables.scss`

Core design tokens:

| Token | Value | Description |
|-------|-------|-------------|
| `$module` | `4px` | Base unit |
| `$grid-columns` | `12` | Grid column count |
| `$transition-base` | `0.2s ease` | Default transition |

### `_colors.scss`

Color system uses **OKLCH** (perceptually uniform color space, 2026 standard). All colors are generated programmatically into CSS custom properties.

```scss
// Available color families (shades 50–950)
// --grey-*, --blue-*, --red-*, --green-*, --amber-*, --light-blue-*, --pink-*
```

### `_typography.scss`

Font families are defined as a map:

```scss
$font-family: (
  'base':     'InterTight, system-ui, sans-serif',
  'heading':  'InterTight, system-ui, sans-serif',
  'mono':     'JetBrains-Mono, monospace',
  'accent':   'InterTight, system-ui, sans-serif',
);
```

Font weights:

| Name | Weight |
|------|--------|
| `thin` | 100 |
| `light` | 300 |
| `normal` | 400 |
| `medium` | 500 |
| `semibold` | 600 |
| `bold` | 700 |

---

## Tools

### Functions

#### `module($n)`
Returns a multiple of the base module (4px).

```scss
module(4)  // → 16px
module(10) // → 40px
```

#### `spacing($n)`
Alias for `module()`. Used for padding/margin values.

```scss
spacing(4) // → 16px
```

#### `font-size($name)`
Returns a font size from the scale.

| Name | Size |
|------|------|
| `xs` | 12px |
| `sm` | 14px |
| `base` | 16px |
| `md` | 18px |
| `lg` | 20px |
| `xl` | 24px |
| `2xl` | 32px |
| `3xl` | 40px |
| `4xl` | 48px |
| `5xl` | 64px |
| `6xl` | 80px |
| `7xl` | 96px |

```scss
font-size('sm')  // → 14px
font-size('3xl') // → 40px
```

#### `line-height($name)`
Returns a line-height value.

| Name | Value |
|------|-------|
| `xs` | 1.25 |
| `sm` | 1.375 |
| `base` | 1.5 |
| `md` | 1.625 |
| `lg` | 1.75 |
| `xl` | 2 |

```scss
line-height('lg') // → 1.75
```

#### `radius($name)`
Returns a border-radius value.

| Name | Value |
|------|-------|
| `none` | 0 |
| `sm` | 4px |
| `md` | 8px |
| `lg` | 12px |
| `xl` | 16px |
| `full` | 9999px |

```scss
radius('md') // → 8px
```

#### `shadow($name)`
Returns a box-shadow value.

| Name | Value |
|------|-------|
| `sm` | `0 1px 3px rgba(0,0,0,0.06)` |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `lg` | `0 8px 24px rgba(0,0,0,0.10)` |
| `xl` | `0 16px 48px rgba(0,0,0,0.12)` |

#### `color($name, $shade: '500', $alpha: 1)`
Returns a color from the OKLCH palette with optional alpha.

```scss
color('blue', '500')      // → var(--blue-500)
color('blue', '500', 0.5) // → rgba(...) from --blue-500
```

### Mixins

#### `respond-to($breakpoint)`
Media query mixin. Breakpoints: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`.

```scss
@include tools.respond-to('md') {
  font-size: tools.font-size('md');
}
```

#### `adaptive($property, $base, $scales)`
Applies a property with stepped responsive scaling.

```scss
@include tools.adaptive(gap, 4, (
  'md': 1.5,  // → 24px at md+
  'lg': 2     // → 32px at lg+
));
```

#### `font($size, $weight: null, $line-height: null, $color: null, $family: null)`
Universal font mixin. All optional parameters default to `null` (skipped if not provided).

```scss
@include tools.font('lg', 'bold', 'lg', var(--color-primary), var(--font-family-heading));
```

#### `heading($level: 1, $color: var(--color-text), $family: var(--font-family-heading))`
Heading mixin. `$level` 1–6 maps to sizes `7xl` → `2xl`. Line-height is derived from the size token.

```scss
h1 { @include tools.heading(1); }           // → 96px, bold
h3 { @include tools.heading(3); }           // → 64px, bold
h3 { @include tools.heading(3, var(--color-primary)); } // with custom color
```

#### `hover($property: all, $duration: settings.$transition-base)`
Applies hover styles inside `@media (hover: hover)` and also on `:focus-visible`. The `$timing` parameter has been removed — timing is baked into `$duration`.

```scss
@include tools.hover((background-color)) {
  background-color: var(--color-primary-hover);
}
```

#### `focus-ring($color: var(--color-border-focus), $offset: 2px)`
Keyboard focus styles. Accepts `@content` for additional focus-visible rules.

```scss
.btn {
  @include tools.focus-ring;
}

.input {
  @include tools.focus-ring(var(--color-primary), 4px) {
    box-shadow: 0 0 0 4px var(--color-primary-light);
  };
}
```

#### `custom-scrollbar($width: 8px, $radius: 4px)`
Custom scrollbar styling.

```scss
@include tools.custom-scrollbar(8px, 4px);
```

#### Logical spacing mixins

| Mixin | Description |
|-------|-------------|
| `margin-block($top, $bottom: null)` | Logical block margins |
| `margin-inline($start, $end: null)` | Logical inline margins |
| `padding-block($top, $bottom: null)` | Logical block padding |
| `padding-inline($start, $end: null)` | Logical inline padding |
| `margin($top, $right, $bottom, $left)` | All 4 sides (falls back to logical) |
| `padding($top, $right, $bottom, $left)` | All 4 sides (falls back to logical) |

---

## Generic

### Fonts

Fonts are managed via `source/scss/3-generic/_fonts.scss`:

```scss
$font-registry: (
  'InterTight': 'InterTight',
  'JetBrains-Mono': 'JetBrains-Mono',
);

$active-fonts: ('InterTight', 'JetBrains-Mono');

$font-weights: (
  'InterTight': (
    (file: 'InterTight-Light', weight: 300, style: normal),
    (file: 'InterTight-Regular', weight: 400, style: normal),
    (file: 'InterTight-Medium', weight: 500, style: normal),
    (file: 'InterTight-SemiBold', weight: 600, style: normal),
    (file: 'InterTight-Bold', weight: 700, style: normal),
  ),
  'JetBrains-Mono': (
    (file: 'JetBrainsMono-Light', weight: 300, style: normal),
    (file: 'JetBrainsMono-Regular', weight: 400, style: normal),
    (file: 'JetBrainsMono-Medium', weight: 500, style: normal),
    (file: 'JetBrainsMono-SemiBold', weight: 600, style: normal),
    (file: 'JetBrainsMono-Bold', weight: 700, style: normal),
  ),
);
```

Only fonts listed in `$active-fonts` generate `@font-face` declarations. Files must be placed in `source/assets/fonts/{folder}/`.

### Animations

Reveal animations are defined in `source/scss/3-generic/_animations.scss`:

```scss
[data-reveal] {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translate(0, 0);
}
```

Initial state (opacity: 0, transform offset) is set by JavaScript (`utilities/_viewport.js`).

---

## Objects

### Grid

12-column CSS Grid system, Bootstrap-like.

```html
<div class="row">
  <div class="col-4">Column</div>
  <div class="col-8">Column</div>
</div>
```

Responsive gap adapts: `16px` base → `24px` at `md` → `32px` at `lg`.

### Layout

Container and section utilities.

### Utilities

Spacing, display, visibility, and other atomic utility classes.

---

## Components

### Button

Buttons use a variant map for color generation:

```scss
$button-variants: (
  primary: (bg: var(--color-primary), color: var(--color-text-inverse), hover: var(--color-primary-hover), active: var(--color-primary-active)),
  success: (bg: var(--color-success), color: var(--color-text-inverse), hover: var(--color-success-hover)),
  danger:  (bg: var(--color-danger),  color: var(--color-text-inverse), hover: var(--color-danger-hover)),
  warning: (bg: var(--color-warning), color: var(--color-text-inverse), hover: var(--color-warning-hover)),
  info:    (bg: var(--color-info),    color: var(--color-text-inverse), hover: var(--color-info-hover)),
);
```

Variants are auto-generated via `@each`. Hover uses `tools.hover()` mixin with `@media (hover: hover)`.

**Base styles:**
- `display: flex`
- `height: tools.module(10)` (40px)
- `gap: tools.spacing(1)` (4px)
- `font-size: tools.font-size('sm')` (14px)
- `line-height: tools.line-height('lg')` (1.75)
- `padding: tools.spacing(2) tools.spacing(5)` (8px 20px)

**Sizes:**

| Modifier | Height | Font Size | Padding |
|----------|--------|-------------|---------|
| `.btn--sm` | 24px | 12px | 4px 8px |
| `.btn` (default) | 40px | 14px | 8px 20px |
| `.btn--lg` | 48px | 16px | 12px 24px |

**States:**
- `.btn--disabled` / `:disabled` — `opacity: 0.5`
- `.btn--loading` — spinner overlay, `color: transparent`
- `.btn--block` — `width: 100%`

**Variants:**
- `.btn--primary`, `.btn--success`, `.btn--danger`, `.btn--warning`, `.btn--info`
- `.btn--secondary` — bordered, background-secondary
- `.btn--outline` — transparent background, colored border/text
- `.btn--ghost` — transparent, hover shows background-hover

### Card

Card component with image, content, and action areas.

### Modal

Modal overlay with focus trap support.

### Accordion

Accordion with animated height transitions and ARIA attributes.

### Dropdown

Dropdown menu with auto-positioning (flip), keyboard navigation, and ARIA support.

---

## Themes

Themes are defined in `source/scss/1-settings/_themes.scss`.

### Light theme (mixin)

```scss
@mixin light-theme {
  --color-background: var(--grey-50);
  --color-background-secondary: var(--grey-100);
  --color-background-tertiary: var(--grey-200);
  --color-background-hover: var(--grey-300);
  --color-background-inverse: var(--grey-900);

  --color-neutral: var(--grey-500);

  --color-text: var(--grey-900);
  --color-text-secondary: var(--grey-700);
  --color-text-tertiary: var(--grey-500);
  --color-text-inverse: var(--grey-50);
  --color-text-link: var(--blue-500);
  --color-text-link-hover: var(--blue-600);

  --color-border: var(--grey-300);
  --color-border-hover: var(--grey-400);
  --color-border-focus: var(--blue-500);

  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-600);
  --color-primary-active: var(--blue-700);
  --color-primary-light: var(--blue-50);

  --color-success: var(--green-500);
  --color-success-hover: var(--green-600);

  --color-warning: var(--amber-500);
  --color-warning-hover: var(--amber-600);

  --color-danger: var(--red-500);
  --color-danger-hover: var(--red-600);

  --color-error: var(--red-500);
  --color-error-hover: var(--red-600);

  --color-info: var(--light-blue-500);
  --color-info-hover: var(--light-blue-600);

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);

  --scrollbar-track: var(--grey-100);
  --scrollbar-thumb: var(--grey-300);
  --scrollbar-thumb-hover: var(--grey-400);
}
```

### Dark theme (mixin)

Same structure, inverted values (grey-950 → grey-50, etc.).

### Application

```scss
:root {
  @include color-generator.generate-color-variables(colors.$colors);
  --font-family-base: #{map.get(typo.$font-family, 'base')};
  --font-family-heading: #{map.get(typo.$font-family, 'heading')};
  --font-family-mono: #{map.get(typo.$font-family, 'mono')};
  --font-family-accent: #{map.get(typo.$font-family, 'accent')};
  @include light-theme;
  --theme-transition: 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  :root { @include dark-theme; }
}

:root[data-theme="dark"] { @include dark-theme; }
:root[data-theme="light"] { @include light-theme; }
```

---

## Build & Webpack

### Asset handling

Webpack processes the following assets:

| Asset type | Extension | Output folder |
|------------|-----------|---------------|
| Fonts | `.woff2`, `.woff`, `.eot`, `.ttf`, `.otf` | `build/fonts/` |
| SVG icons | `.svg` | `build/icons/` |
| Images | `.png`, `.jpg`, `.jpeg`, `.gif` | `build/images/` |

### Side effects

`package.json` declares SCSS/CSS as side effects to prevent tree-shaking:

```json
"sideEffects": ["*.scss", "*.css"]
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build (minified) |
| `npm run watch` | Watch mode for development |

---

**Author:** Georgy Kiosov | **License:** MIT
