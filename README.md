# 🎨 CORE4 Design System

> **A modular design system built with SCSS and JavaScript, featuring themes, OKLCH colors, a responsive grid, and lazy-loaded components.**

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Quick Start](#-quick-start)
4. [Project Structure](#-project-structure)
5. [Build Commands](#-build-commands)
6. [Documentation](#-documentation)
7. [How to Use](#-how-to-use)
8. [Contributing](#-contributing)
9. [License](#-license)

---

## 📖 Overview

**CORE4 Design System** is a modular design system built on:
- **SCSS** with a modular architecture (ITCSS)
- **JavaScript** with ES modules and dynamic imports
- **Webpack** for bundling with code splitting
- **OKLCH colors** (2026 standard)
- **Logical properties** (RTL language support)
- **Custom fonts** (InterTight, JetBrains Mono)

The system is designed for rapid creation of responsive interfaces with a unified visual rhythm (base unit of 4px).

---

## ✨ Features

- 🧱 **Modular Grid** — 12-column system based on CSS Grid (Bootstrap analog)
- 🎨 **OKLCH Colors** — perceptually uniform colors (2026 standard)
- 🌓 **Dark/Light Theme** — system + manual switching via `data-theme`
- 📱 **Responsiveness** — 6 breakpoints (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- 🔮 **Dynamic Components** — modals, accordions, dropdowns, buttons in vanilla JS
- ♿️ **Accessibility** — keyboard navigation (Tab, Escape, Focus Trap), ARIA attributes
- 🧪 **Modularity** — SCSS and JS modules for reuse
- 📦 **Ready-to-use Build** — Webpack + Babel + minification
- ⚡ **Lazy Loading** — JS modules load on demand only when DOM elements exist
- 🔄 **Re-initialization** — `app.reinit()` for dynamically added components
- ✨ **Reveal Animations** — scroll-triggered entrance animations via `data-reveal`

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/core4.git
cd core4
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Open `http://localhost:8080` — the page auto-refreshes on changes.

### 4. Build for production

```bash
npm run build
```

Compiled files will appear in the `build/` folder:
- `build/css/main.min.css` — minified styles
- `build/js/main.min.js` — minified script
- `build/fonts/` — font files
- `build/icons/` — SVG icons
- `build/images/` — images

---

## 📁 Project Structure

```bash
core4/
├── source/
│   ├── assets/
│   │   └── fonts/             # Font files (InterTight, JetBrains Mono)
│   ├── scss/
│   │   ├── 1-settings/        # Variables, themes, resets
│   │   │   ├── _variables.scss
│   │   │   ├── _typography.scss
│   │   │   ├── _colors.scss
│   │   │   ├── _themes.scss
│   │   │   ├── _reset.scss
│   │   │   └── _index.scss
│   │   ├── 2-tools/           # Functions and mixins
│   │   │   ├── _functions.scss
│   │   │   ├── _mixins.scss
│   │   │   └── _index.scss
│   │   ├── 3-generic/         # Base styles, fonts, animations
│   │   │   ├── _base.scss
│   │   │   ├── _fonts.scss
│   │   │   ├── _animations.scss
│   │   │   ├── _typography.scss
│   │   │   └── _index.scss
│   │   ├── 4-objects/         # Grid and utilities
│   │   │   ├── _grid.scss
│   │   │   ├── _layout.scss
│   │   │   ├── _utilities.scss
│   │   │   └── _index.scss
│   │   ├── 5-components/      # Components
│   │   │   ├── _button.scss
│   │   │   ├── _card.scss
│   │   │   ├── _modal.scss
│   │   │   └── _index.scss
│   │   └── main.scss          # Main import file
│   │
│   └── js/
│       ├── core/              # Core (configs, helpers, events)
│       │   ├── _config.js
│       │   ├── _helpers.js
│       │   ├── _events.js
│       │   └── _index.js
│       ├── modules/           # Modules (lazy-loaded)
│       │   ├── theme/
│       │   │   ├── _theme.js
│       │   │   └── _index.js
│       │   ├── modal/
│       │   │   ├── _modal.js
│       │   │   └── _index.js
│       │   ├── accordion/
│       │   │   ├── _accordion.js
│       │   │   └── _index.js
│       │   ├── button/
│       │   │   ├── _button.js
│       │   │   └── _index.js
│       │   └── dropdown/
│       │       ├── _dropdown.js
│       │       └── _index.js
│       ├── utilities/         # Utilities
│       │   ├── _dom.js
│       │   ├── _keyboard.js
│       │   ├── _focus-trap.js
│       │   ├── _viewport.js
│       │   └── _index.js
│       └── main.js            # Entry point
│
├── build/                     # Build output (generated)
│   ├── css/
│   │   └── main.min.css
│   ├── js/
│   │   └── main.min.js
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── docs/                      # Documentation
│   ├── SCSS-GUIDE.md
│   ├── SCSS-GUIDE-RU.md
│   ├── JAVASCRIPT-GUIDE.md
│   └── JAVASCRIPT-GUIDE-RU.md
│
├── webpack.config.js          # Webpack configuration
├── package.json               # Dependencies
├── .gitignore                 # Ignored files
└── README.md                  # This file
```

---

## 🛠 Build Commands

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with Hot Reload |
| `npm run build` | Build production version (minified, no dev server) |
| `npm run start` | Same as `npm run dev` |
| `npm run watch` | Watch mode for development |
| `npm run test` | Run tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 📚 Documentation

- **[SCSS Documentation](docs/SCSS-GUIDE.md)** — detailed description of all functions, mixins, and components.
- **[SCSS Documentation (RU)](docs/SCSS-GUIDE-RU.md)** — русская версия.
- **[JavaScript Documentation](docs/JAVASCRIPT-GUIDE.md)** — architecture, modules, utilities, and API reference.
- **[JavaScript Documentation (RU)](docs/JAVASCRIPT-GUIDE-RU.md)** — русская версия.

### Key SCSS Functions

```scss
@use '1-settings' as settings;
@use '2-tools' as tools;

// Spacing
.element {
  padding: tools.spacing(4); // → 16px
  margin: tools.spacing(6);  // → 24px
}

// Responsiveness
.element {
  font-size: 14px;

  @include tools.respond-to('md') {
    font-size: 18px;
  }
}

// Colors (CSS custom properties)
.element {
  color: var(--color-primary);
  background: var(--color-background-secondary);
}

// Grid
<div class="row">
  <div class="col-4">Column</div>
</div>
```

---

## 🎨 How to Use

### Include in HTML

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>

    <!-- Styles -->
    <link rel="stylesheet" href="build/css/main.min.css">
</head>
<body>
    <!-- Content -->

    <!-- Scripts -->
    <script src="build/js/main.min.js"></script>
</body>
</html>
```

### Component Examples

```html
<!-- Button -->
<button class="btn btn--primary" data-button="default">Primary</button>

<!-- Async Button -->
<button class="btn btn--primary" data-button="async"
        data-loading-text="Loading..."
        data-success-text="Done!">
  Submit
</button>

<!-- Card -->
<div class="card">
    <div class="card__image">
        <img src="image.jpg" alt="...">
    </div>
    <div class="card__content">
        <h3 class="card__title">Title</h3>
        <p class="card__description">Description</p>
        <button class="btn btn--primary">Buy</button>
    </div>
</div>

<!-- Modal -->
<button data-modal-trigger="my-modal">Open</button>

<div id="my-modal" class="modal" data-modal>
    <div class="modal__content">
        <div class="modal__header">
            <h3>Title</h3>
            <button data-modal-close>×</button>
        </div>
        <div class="modal__body">
            <p>Content</p>
        </div>
    </div>
</div>

<!-- Accordion -->
<div data-accordion data-accordion-multiple="true">
    <div data-accordion-item>
        <button data-accordion-header>Section 1</button>
        <div data-accordion-content>Content 1</div>
    </div>
</div>

<!-- Dropdown -->
<div data-dropdown data-dropdown-placement="bottom-start">
    <button data-dropdown-trigger>Menu</button>
    <div data-dropdown-menu>
        <button>Item 1</button>
        <button>Item 2</button>
    </div>
</div>

<!-- Reveal Animation -->
<div data-reveal data-reveal-direction="up" data-reveal-delay="200">
    This fades in on scroll
</div>
```

### Theme Switching

```javascript
// Via JS
document.documentElement.setAttribute('data-theme', 'dark');

// Or via button (already implemented in ThemeManager)
```

### Global API (Development)

In development mode, the following globals are available:

```javascript
window.CORE4.app              // App instance
window.CORE4.core             // Core (CONFIG, EventManager)
window.CORE4.utils.dom        // DOM helpers
window.CORE4.utils.keyboard   // Keyboard helpers
window.CORE4.components       // Components (ThemeManager, Modal, Accordion, Button, Dropdown, FocusTrap)
```

### Re-initialization for Dynamic Content

If you add components to the DOM dynamically (e.g., via AJAX), call:

```javascript
await window.CORE4.app.reinit();
```

This safely destroys old instances and creates new ones.

---

## 🔤 Fonts

CORE4 includes the following open-source fonts:

### Inter Tight
- **Author:** Rasmus Andersson
- **License:** [SIL Open Font License 1.1](https://github.com/rsms/inter/blob/master/LICENSE.txt)
- **Source:** [Google Fonts](https://fonts.google.com/specimen/Inter+Tight) / [GitHub](https://github.com/rsms/inter)
- **Weights included:** 100 (Thin), 200 (Extra Light), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (Extra Bold), 900 (Black)

### JetBrains Mono
- **Author:** JetBrains
- **License:** [SIL Open Font License 1.1](https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt)
- **Source:** [JetBrains](https://www.jetbrains.com/lp/mono/) / [GitHub](https://github.com/JetBrains/JetBrainsMono)
- **Weights included:** 100 (Thin), 200 (Extra Light), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (Extra Bold)

Both fonts are free for personal and commercial use.


---

## 👥 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Make changes and commit: `git commit -m '✨ Add new feature'`.
4. Push to your fork: `git push origin feature/my-feature`.
5. Create a Pull Request to the main branch.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🤝 Contact

If you have questions, open an [Issue](https://github.com/your-username/core4/issues).

---

**Version:** 0.1.0 Draft  
**Updated:** August 2026  
**Author:** George Kiosov
