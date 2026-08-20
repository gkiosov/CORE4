# 🎨 CORE4 Design System

> **Модульная дизайн-система на SCSS и JavaScript с поддержкой тем, OKLCH-цветов и адаптивной сетки.**

![Версия](https://img.shields.io/badge/Альфа-0.1.0-red.svg)
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

**core4 Design System** — это модульная дизайн-система, построенная на:
- **SCSS** с модульной архитектурой (ITCSS)
- **JavaScript** с ES-модулями
- **Webpack** для сборки
- **OKLCH-цветах** (стандарт 2026)
- **Логических свойствах** (поддержка RTL-языков)

Система предназначена для быстрого создания адаптивных интерфейсов с единым визуальным ритмом (базовый модуль 4px).

---

## ✨ Возможности

- 🧱 **Модульная сетка** — 12-колоночная система на CSS Grid (аналог Bootstrap)
- 🎨 **OKLCH-цвета** — перцептивно-равномерные цвета (стандарт 2026)
- 🌓 **Тёмная/светлая тема** — системная + ручное переключение через `data-theme`
- 📱 **Адаптивность** — 6 брейкпоинтов (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
- 🔮 **Динамические компоненты** — модалки, аккордеоны на чистом JS
- ♿️ **Доступность** — управление с клавиатуры (Tab, Escape, Focus Trap)
- 🧪 **Модульность** — SCSS- и JS-модули для переиспользования
- 📦 **Готовая сборка** — Webpack + Babel + минификация

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

Открой `http://localhost:3000` — страница автоматически обновляется при изменениях.

### 4. Сборка для продакшена

```bash
npm run build
```

Готовые файлы появятся в папке `build/`:
- `build/css/main.min.css` — минифицированные стили
- `build/js/main.min.js` — минифицированный скрипт

---

## 📁 Структура проекта

```bash
core4/
├── source/
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
│   │   ├── 3-generic/         # Базовые стили
│   │   │   ├── _base.scss
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
│       ├── core/              # Ядро (конфиги, хелперы)
│       │   ├── _config.js
│       │   ├── _helpers.js
│       │   ├── _events.js
│       │   └── _index.js
│       ├── modules/           # Модули
│       │   ├── theme/
│       │   │   ├── _theme.js
│       │   │   └── _index.js
│       │   ├── modal/
│       │   │   ├── _modal.js
│       │   │   └── _index.js
│       │   └── accordion/
│       │       ├── _accordion.js
│       │       └── _index.js
│       ├── utilities/         # Утилиты
│       │   ├── _dom.js
│       │   ├── _keyboard.js
│       │   ├── _focus-trap.js
│       │   └── _index.js
│       └── main.js            # Точка входа
│
├── build/                     # Сборка (генерируется)
│   ├── css/
│   │   └── main.min.css
│   └── js/
│       └── main.min.js
│
├── docs/                      # Документация
│   └── SCSS-GUIDE.md
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
| `npm run build` | Сборка продакшен-версии (минификация) |
| `npm run start` | То же, что `npm run dev` |
| `npm run test` | Запуск тестов (Jest) |
| `npm run test:watch` | Запуск тестов в режиме наблюдения |

---

## 📚 Документация

- **[SCSS-документация](docs/SCSS-GUIDE.md)** — подробное описание всех функций, миксинов и компонентов.

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

// Цвета
.element {
  color: tools.color('primary');
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

### Пример компонента

```html
<!-- Кнопка -->
<button class="btn btn--primary">Primary</button>

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
```

### Переключение темы

```javascript
// Через JS
document.documentElement.setAttribute('data-theme', 'dark');

// Или через кнопку (уже реализовано в ThemeManager)
```

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

**Версия:** 0.1.0 Альфа  
**Обновлено:** Август 2026  
**Автор:** Георгий Киосов