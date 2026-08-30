# 🎨 CORE4 Design System

> **A modular, high-performance design system built with SCSS and JavaScript, featuring OKLCH colors, lazy-loaded components, and an accessibility-first approach.**

[![Version](https://img.shields.io/badge/Draft-0.1.0-red.svg)](https://github.com/gkiosov/CORE4)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

**CORE4** is not just a collection of UI components. It is a **modular and performant design system**, engineered for building complex, accessible, and easily scalable interfaces. It represents a harmonious synthesis of modern CSS methodologies and advanced JavaScript practices, where every aspect—from the color space to component loading—is thoughtfully designed and optimized.

At its core, the system is built on several key architectural decisions that set it apart from typical solutions:

*   **Industrial-Grade Styling: ITCSS + OKLCH**. Built on the **ITCSS (Inverted Triangle CSS)** architecture, the system ensures ideal code organization: from global settings to specific components. This makes styles maximally predictable, reusable, and resistant to cascade conflicts. The use of **perceptually uniform OKLCH colors**—the 2026 industry standard—guarantees that colors always look harmonious and predictable on any screen, making light and dark themes a mathematically precise process, not a tedious guessing game.

*   **Modular JavaScript with Lazy Loading**. Instead of a monolithic script, CORE4 uses a **modular architecture with dynamic imports**. JavaScript components (modals, accordions, dropdowns) are loaded asynchronously **only when they actually appear in the DOM**. This dramatically speeds up the initial page load. A unified **EventManager** and strict cleanup of listeners in the `destroy()` method ensure no memory leaks, which is critical for long-running SPA applications.

*   **Accessibility (A11y) as a Built-in Feature**. The system is designed to be **ARIA-first**. All interactive components support keyboard navigation (Tab, Escape, arrow keys), correctly manage focus (Focus Trap), and contain all necessary ARIA attributes from day one. This is not an "add-on" but an integral part of the architecture.

*   **Global Adaptability via Logical Properties**. Instead of physical `margin-top` and `padding-left`, the system is built on **logical properties** (`margin-block-start`, `padding-inline-start`). This ensures **automatic support for RTL languages** (Arabic, Hebrew) without the need to write separate rules or override styles.

*   **Engineering Infrastructure for Real-World Development**. The project goes beyond a simple set of files, offering a complete infrastructure, including **design tokens**, **Webpack with code splitting**, and a full **lifecycle management** via `app.reinit()` for dynamically added content.

In essence, CORE4 is an **engineering system** that lets developers and designers focus on logic and user experience, with the confidence that the interface's foundation is robust, performant, and aligned with all modern web standards.

---

## ✨ Key Features

*   🧱 **Modular Grid** — 12-column system based on CSS Grid
*   🎨 **OKLCH Colors** — perceptually uniform, 2026 standard
*   🌓 **Dark/Light Theme** — system + manual switching via `data-theme`
*   📱 **Responsiveness** — 6 breakpoints (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
*   🔮 **Dynamic Components** — modals, accordions, dropdowns, buttons in vanilla JS
*   ♿️ **Accessibility** — keyboard navigation, Focus Trap, ARIA attributes
*   ⚡ **Lazy Loading** — JS modules load only when needed
*   🔄 **Re-initialization** — `app.reinit()` for dynamically added components
*   🔤 **Custom Fonts** — InterTight and JetBrains Mono (OFL-1.1)
*   📦 **Ready-to-use Build** — Webpack + Babel + minification

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/gkiosov/CORE4.git
cd CORE4
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

Compiled files will appear in the `build/` folder.

---

## 📁 Project Structure

```
core4/
├── source/
│   ├── assets/                 # Fonts, icons, images
│   ├── scss/
│   │   ├── 1-settings/         # Variables, themes, resets
│   │   ├── 2-tools/            # Functions and mixins
│   │   ├── 3-generic/          # Base styles, fonts, animations
│   │   ├── 4-objects/          # Grid and utilities
│   │   ├── 5-components/       # Components
│   │   └── main.scss           # Main import file
│   │
│   └── js/
│       ├── core/               # Configs, helpers, EventManager
│       ├── modules/            # Lazy-loaded modules
│       ├── utilities/          # DOM, keyboard, focus trap, viewport
│       └── main.js             # Entry point
│
├── build/                      # Build output (generated)
├── docs/                       # Documentation
├── webpack.config.js
├── package.json
└── README.md
```

---

## 🛠 Build Commands

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with Hot Reload |
| `npm run build` | Build production version (minified) |
| `npm run start` | Same as `npm run dev` |
| `npm run watch` | Watch mode for development |
| `npm run test` | Run tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 📚 Documentation

Full documentation is available in the [`docs/`](docs/) folder:

| Document                                                  | Description                                                                  |
|:----------------------------------------------------------|:-----------------------------------------------------------------------------|
| **[SCSS-GUIDE.md](docs/SCSS-GUIDE.md)**                   | Detailed description of all SCSS functions, mixins, and components (English) |
| **[SCSS-GUIDE-RU.md](docs/SCSS-GUIDE-RU.md)**             | SCSS documentation (Russian)                                                 |
| **[JAVASCRIPT-GUIDE.md](docs/JAVASCRIPT-GUIDE.md)**       | JavaScript architecture, modules, utilities, and API reference (English)     |
| **[JAVASCRIPT-GUIDE-RU.md](docs/JAVASCRIPT-GUIDE-RU.md)** | JavaScript documentation (Russian)                                           |
| **[FORM-GUIDE.md](docs/FORM-GUIDE.md)**                   | Form Component documentation (English)                                       |
| **[FORM-GUIDE-RU.md](docs/FORM-GUIDE-RU.md)**             | Form Component documentation (Russian)                                       |
| **[MODAL-GUIDE.md](docs/MODAL-GUIDE.md)**                 | Modal Component documentation (English)                                      |
| **[MODAL-GUIDE_RU.md](docs/MODAL-GUIDE-RU.md)**           | Modal Component documentation (Russian)                                      |
| **[TABS-GUIDE.md](docs/TABS-GUIDE.md)**                   | Tabs Component documentation (English)                                       |
| **[TABS-GUIDE_RU.md](docs/TABS-GUIDE-RU.md)**             | Tabs Component documentation (Russian)                                       |

---

## 🔤 Fonts

CORE4 includes **InterTight** and **JetBrains Mono** fonts. Both are licensed under SIL Open Font License 1.1 and are free for personal and commercial use.

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

**Version:** 0.1.0 Draft  
**Updated:** August 2026  
**Author:** George Kiosov