# 🎨 CORE4 Design System

> **A modular design system built with SCSS and JavaScript, featuring themes, OKLCH colors, and a responsive grid.**

![Version](https://img.shields.io/badge/Alpha-0.1.0-red.svg)
![Build Status](https://img.shields.io/badge/Build-passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green.svg)

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

**core4 Design System** is a modular design system built on:
- **SCSS** with a modular architecture (ITCSS)
- **JavaScript** with ES modules
- **Webpack** for bundling
- **OKLCH colors** (2026 standard)
- **Logical properties** (RTL language support)

The system is designed for rapid creation of responsive interfaces with a unified visual rhythm (base unit of 4px).

---

## ✨ Features

- 🧱 **Modular Grid** — 12-column system based on CSS Grid (Bootstrap analog)
- 🎨 **OKLCH Colors** — perceptually uniform colors (2026 standard)
- 🌓 **Dark/Light Theme** — system + manual switching via `data-theme`
- 📱 **Responsiveness** — 6 breakpoints (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- 🔮 **Dynamic Components** — modals, accordions in vanilla JS
- ♿️ **Accessibility** — keyboard navigation (Tab, Escape, Focus Trap)
- 🧪 **Modularity** — SCSS and JS modules for reuse
- 📦 **Ready-to-use Build** — Webpack + Babel + minification

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

Open `http://localhost:3000` — the page auto-refreshes on changes.

### 4. Build for production

```bash
npm run build
```

Compiled files will appear in the `build/` folder:
- `build/css/main.min.css` — minified styles
- `build/js/main.min.js` — minified script

---

## 📁 Project Structure

```bash
core4/
├── source/
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
│   │   ├── 3-generic/         # Base styles
│   │   │   ├── _base.scss
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
│       ├── core/              # Core (configs, helpers)
│       │   ├── _config.js
│       │   ├── _helpers.js
│       │   ├── _events.js
│       │   └── _index.js
│       ├── modules/           # Modules
│       │   ├── theme/
│       │   │   ├── _theme.js
│       │   │   └── _index.js
│       │   ├── modal/
│       │   │   ├── _modal.js
│       │   │   └── _index.js
│       │   └── accordion/
│       │       ├── _accordion.js
│       │       └── _index.js
│       ├── utilities/         # Utilities
│       │   ├── _dom.js
│       │   ├── _keyboard.js
│       │   ├── _focus-trap.js
│       │   └── _index.js
│       └── main.js            # Entry point
│
├── build/                     # Build output (generated)
│   ├── css/
│   │   └── main.min.css
│   └── js/
│       └── main.min.js
│
├── docs/                      # Documentation
│   └── SCSS-GUIDE.md
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
| `npm run build` | Build production version (minified) |
| `npm run start` | Same as `npm run dev` |
| `npm run test` | Run tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 📚 Documentation

- **[SCSS Documentation](docs/SCSS-GUIDE.md)** — detailed description of all functions, mixins, and components.

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

// Colors
.element {
  color: tools.color('primary');
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

### Component Example

```html
<!-- Button -->
<button class="btn btn--primary">Primary</button>

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
```

### Theme Switching

```javascript
// Via JS
document.documentElement.setAttribute('data-theme', 'dark');

// Or via button (already implemented in ThemeManager)
```

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

**Version:** 0.1.0 Alpha  
**Updated:** August 2026  
**Author:** Georgiy Kiosov
