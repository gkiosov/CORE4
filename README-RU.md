# 🎨 CORE4 Design System

> **Модульная дизайн-система на SCSS и JavaScript с поддержкой тем, OKLCH-цветов, адаптивной сетки и ленивой загрузки компонентов.**

![Версия](https://img.shields.io/badge/Черновик-0.1.0-red.svg)
![Статус сборки](https://img.shields.io/badge/Сборка-проходит-brightgreen)
![Лицензия](https://img.shields.io/badge/Лицензия-MIT-green.svg)

---

## 📋 Оглавление

1. [Описание](#-описание)
2. [Возможности](#-возможности)
3. [Быстрый старт](#-быстрый-старт)
4. [Структура проекта](#-структура-проекта)
5. [Команды сборки](#-команды-сборки)
6. [Документация](#-документация)
7. [Как использовать](#-как-использовать)
8. [Вклад в проект](#-вклад-в-проект)
9. [Лицензия](#-лицензия)

---

## 📖 Описание

**CORE4 Design System** — это модульная дизайн-система, построенная на:
- **SCSS** с модульной архитектурой (ITCSS)
- **JavaScript** с ES-модулями и динамическими импортами
- **Webpack** для сборки с code splitting
- **OKLCH-цветах** (стандарт 2026)
- **Логических свойствах** (поддержка RTL-языков)
- **Кастомных шрифтах** (InterTight, JetBrains Mono)

Система предназначена для быстрого создания адаптивных интерфейсов с единым визуальным ритмом (базовый модуль 4px).

---

## ✨ Возможности

- 🧱 **Модульная сетка** — 12-колоночная система на CSS Grid (аналог Bootstrap)
- 🎨 **OKLCH-цвета** — перцептивно-равномерные цвета (стандарт 2026)
- 🌓 **Тёмная/светлая тема** — системная + ручное переключение через `data-theme`
- 📱 **Адаптивность** — 6 брейкпоинтов (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- 🔮 **Динамические компоненты** — модалки, аккордеоны, дропдауны, кнопки на чистом JS
- ♿️ **Доступность** — управление с клавиатуры (Tab, Escape, Focus Trap), ARIA-атрибуты
- 🧪 **Модульность** — SCSS- и JS-модули для переиспользования
- 📦 **Готовая сборка** — Webpack + Babel + минификация
- ⚡ **Ленивая загрузка** — JS-модули подгружаются по требованию, только при наличии DOM-элементов
- 🔄 **Переинициализация** — `app.reinit()` для динамически добавленных компонентов
- ✨ **Reveal-анимации** — анимации появления при скролле через `data-reveal`

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/ваш-ник/core4.git
cd core4
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Открой `http://localhost:8080` — страница автоматически обновляется при изменениях.

### 4. Сборка для продакшена

```bash
npm run build
```

Готовые файлы появятся в папке `build/`:
- `build/css/main.min.css` — минифицированные стили
- `build/js/main.min.js` — минифицированный скрипт
- `build/fonts/` — файлы шрифтов
- `build/icons/` — SVG-иконки
- `build/images/` — изображения

---

## 📁 Структура проекта

```bash
core4/
├── source/
│   ├── assets/
│   │   └── fonts/             # Файлы шрифтов (InterTight, JetBrains Mono)
│   ├── scss/
│   │   ├── 1-settings/        # Переменные, темы, сбросы
│   │   │   ├── _variables.scss
│   │   │   ├── _typography.scss
│   │   │   ├── _colors.scss
│   │   │   ├── _themes.scss
│   │   │   ├── _reset.scss
│   │   │   └── _index.scss
│   │   ├── 2-tools/           # Функции и миксины
│   │   │   ├── _functions.scss
│   │   │   ├── _mixins.scss
│   │   │   └── _index.scss
│   │   ├── 3-generic/         # Базовые стили, шрифты, анимации
│   │   │   ├── _base.scss
│   │   │   ├── _fonts.scss
│   │   │   ├── _animations.scss
│   │   │   ├── _typography.scss
│   │   │   └── _index.scss
│   │   ├── 4-objects/         # Сетка и утилиты
│   │   │   ├── _grid.scss
│   │   │   ├── _layout.scss
│   │   │   ├── _utilities.scss
│   │   │   └── _index.scss
│   │   ├── 5-components/      # Компоненты
│   │   │   ├── _button.scss
│   │   │   ├── _card.scss
│   │   │   ├── _modal.scss
│   │   │   └── _index.scss
│   │   └── main.scss          # Главный файл импорта
│   │
│   └── js/
│       ├── core/              # Ядро (конфиги, хелперы, события)
│       │   ├── _config.js
│       │   ├── _helpers.js
│       │   ├── _events.js
│       │   └── _index.js
│       ├── modules/           # Модули (ленивая загрузка)
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
│       ├── utilities/         # Утилиты
│       │   ├── _dom.js
│       │   ├── _keyboard.js
│       │   ├── _focus-trap.js
│       │   ├── _viewport.js
│       │   └── _index.js
│       └── main.js            # Точка входа
│
├── build/                     # Сборка (генерируется)
│   ├── css/
│   │   └── main.min.css
│   ├── js/
│   │   └── main.min.js
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── docs/                      # Документация
│   ├── SCSS-GUIDE.md
│   ├── SCSS-GUIDE-RU.md
│   ├── JAVASCRIPT-GUIDE.md
│   └── JAVASCRIPT-GUIDE-RU.md
│
├── webpack.config.js          # Конфигурация Webpack
├── package.json               # Зависимости
├── .gitignore                 # Игнорируемые файлы
└── README.md                  # Этот файл
```

---

## 🛠 Команды сборки

| Команда | Описание |
|:---|:---|
| `npm run dev` | Запуск сервера разработки с Hot Reload |
| `npm run build` | Сборка продакшен-версии (минификация, без dev-сервера) |
| `npm run start` | То же, что `npm run dev` |
| `npm run watch` | Режим наблюдения для разработки |
| `npm run test` | Запуск тестов (Jest) |
| `npm run test:watch` | Запуск тестов в режиме наблюдения |

---

## 📚 Документация

- **[SCSS-документация](docs/SCSS-GUIDE.md)** — подробное описание всех функций, миксинов и компонентов.
- **[SCSS-документация (RU)](docs/SCSS-GUIDE-RU.md)** — русская версия.
- **[JavaScript-документация](docs/JAVASCRIPT-GUIDE.md)** — архитектура, модули, утилиты и API.
- **[JavaScript-документация (RU)](docs/JAVASCRIPT-GUIDE-RU.md)** — русская версия.

### Основные функции SCSS

```scss
@use '1-settings' as settings;
@use '2-tools' as tools;

// Отступы
.element {
  padding: tools.spacing(4); // → 16px
  margin: tools.spacing(6);  // → 24px
}

// Адаптивность
.element {
  font-size: 14px;

  @include tools.respond-to('md') {
    font-size: 18px;
  }
}

// Цвета (CSS-переменные)
.element {
  color: var(--color-primary);
  background: var(--color-background-secondary);
}

// Сетка
<div class="row">
  <div class="col-4">Колонка</div>
</div>
```

---

## 🎨 Как использовать

### Подключение в HTML

```html
<!DOCTYPE html>
<html lang="ru" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой проект</title>

    <!-- Подключаем стили -->
    <link rel="stylesheet" href="build/css/main.min.css">
</head>
<body>
    <!-- Контент -->

    <!-- Подключаем скрипты -->
    <script src="build/js/main.min.js"></script>
</body>
</html>
```

### Примеры компонентов

```html
<!-- Кнопка -->
<button class="btn btn--primary" data-button="default">Primary</button>

<!-- Async-кнопка -->
<button class="btn btn--primary" data-button="async"
        data-loading-text="Загрузка..."
        data-success-text="Готово!">
  Отправить
</button>

<!-- Карточка -->
<div class="card">
    <div class="card__image">
        <img src="image.jpg" alt="...">
    </div>
    <div class="card__content">
        <h3 class="card__title">Заголовок</h3>
        <p class="card__description">Описание</p>
        <button class="btn btn--primary">Купить</button>
    </div>
</div>

<!-- Модальное окно -->
<button data-modal-trigger="my-modal">Открыть</button>

<div id="my-modal" class="modal" data-modal>
    <div class="modal__content">
        <div class="modal__header">
            <h3>Заголовок</h3>
            <button data-modal-close>×</button>
        </div>
        <div class="modal__body">
            <p>Содержимое</p>
        </div>
    </div>
</div>

<!-- Аккордеон -->
<div data-accordion data-accordion-multiple="true">
    <div data-accordion-item>
        <button data-accordion-header>Секция 1</button>
        <div data-accordion-content>Контент 1</div>
    </div>
</div>

<!-- Dropdown -->
<div data-dropdown data-dropdown-placement="bottom-start">
    <button data-dropdown-trigger>Меню</button>
    <div data-dropdown-menu>
        <button>Пункт 1</button>
        <button>Пункт 2</button>
    </div>
</div>

<!-- Reveal-анимация -->
<div data-reveal data-reveal-direction="up" data-reveal-delay="200">
    Появляется при скролле
</div>
```

### Переключение темы

```javascript
// Через JS
document.documentElement.setAttribute('data-theme', 'dark');

// Или через кнопку (уже реализовано в ThemeManager)
```

### Глобальное API (разработка)

В режиме разработки доступны следующие глобальные переменные:

```javascript
window.CORE4.app              // Инстанс App
window.CORE4.core             // Ядро (CONFIG, EventManager)
window.CORE4.utils.dom        // DOM-хелперы
window.CORE4.utils.keyboard   // Хелперы клавиатуры
window.CORE4.components       // Компоненты (ThemeManager, Modal, Accordion, Button, Dropdown, FocusTrap)
```

### Переинициализация для динамического контента

Если вы добавляете компоненты в DOM динамически (например, через AJAX), вызовите:

```javascript
await window.CORE4.app.reinit();
```

Это безопасно уничтожит старые инстансы и создаст новые.

---

## 🔤 Шрифты

CORE4 включает следующие шрифты с открытым исходным кодом:

### Inter Tight
- **Автор:** Rasmus Andersson
- **Лицензия:** [SIL Open Font License 1.1](https://github.com/rsms/inter/blob/master/LICENSE.txt)
- **Источник:** [Google Fonts](https://fonts.google.com/specimen/Inter+Tight) / [GitHub](https://github.com/rsms/inter)
- **Включённые начертания:** 100 (Thin), 200 (Extra Light), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (Extra Bold), 900 (Black)

### JetBrains Mono
- **Автор:** JetBrains
- **Лицензия:** [SIL Open Font License 1.1](https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt)
- **Источник:** [JetBrains](https://www.jetbrains.com/lp/mono/) / [GitHub](https://github.com/JetBrains/JetBrainsMono)
- **Включённые начертания:** 100 (Thin), 200 (Extra Light), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (Extra Bold)

Оба шрифта бесплатны для личного и коммерческого использования.

---

## 👥 Вклад в проект

1. Форкни репозиторий.
2. Создай ветку для фичи: `git checkout -b feature/my-feature`.
3. Внеси изменения и закоммить их: `git commit -m '✨ Добавил новую фичу'`.
4. Отправь в свой форк: `git push origin feature/my-feature`.
5. Создай Pull Request в основную ветку.

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробнее в файле [LICENSE](LICENSE).

---

## 🤝 Контакты

Если есть вопросы, пиши в [Issues](https://github.com/ваш-ник/core4/issues).

---

**Версия:** 0.1.0 Draft  
**Обновлено:** Август 2026  
**Автор:** Георгий Киосов
