# 🎨 Документация CORE4 SCSS

> **Версия:** 0.1.0 Альфа | **Обновлено:** Август 2026

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Структура файлов](#структура-файлов)
3. [Настройки](#настройки)
4. [Инструменты](#инструменты)
   - [Функции](#функции)
   - [Миксины](#миксины)
5. [Базовые стили](#базовые-стили)
   - [Шрифты](#шрифты)
   - [Анимации](#анимации)
   - [База и типографика](#база-и-типографика)
6. [Объекты](#объекты)
   - [Сетка](#сетка)
   - [Раскладка](#раскладка)
   - [Утилиты](#утилиты)
7. [Компоненты](#компоненты)
   - [Кнопка](#кнопка)
   - [Карточка](#карточка)
   - [Модалка](#модалка)
   - [Аккордеон](#аккордеон)
   - [Dropdown](#dropdown)
8. [Темы](#темы)
9. [Сборка и Webpack](#сборка-и-webpack)

---

## Обзор

CORE4 использует модульную SCSS-архитектуру на основе **ITCSS** (Inverted Triangle CSS):

| Слой | Папка | Назначение |
|------|-------|------------|
| 1. Настройки | `1-settings/` | Переменные, цвета, типографика, темы |
| 2. Инструменты | `2-tools/` | Функции и миксины |
| 3. Базовые стили | `3-generic/` | Базовые стили, шрифты, анимации, типографика |
| 4. Объекты | `4-objects/` | Сетка, паттерны раскладки, утилитарные классы |
| 5. Компоненты | `5-components/` | UI-компоненты (кнопки, карточки, модалки и т.д.) |

Базовый модуль — **4px**. Все отступы, размеры и значения сетки — кратны 4.

---

## Структура файлов

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

## Настройки

### `_variables.scss`

Основные дизайн-токены:

| Токен | Значение | Описание |
|-------|----------|----------|
| `$module` | `4px` | Базовая единица |
| `$grid-columns` | `12` | Количество колонок сетки |
| `$transition-base` | `0.2s ease` | Переход по умолчанию |

### `_colors.scss`

Цветовая система использует **OKLCH** (перцептивно-равномерное цветовое пространство, стандарт 2026). Все цвета генерируются программно в CSS-переменные.

```scss
// Доступные цветовые семейства (оттенки 50–950)
// --grey-*, --blue-*, --red-*, --green-*, --amber-*, --light-blue-*, --pink-*
```

### `_typography.scss`

Шрифты определены как мапа:

```scss
$font-family: (
  'base':     'InterTight, system-ui, sans-serif',
  'heading':  'InterTight, system-ui, sans-serif',
  'mono':     'JetBrains-Mono, monospace',
  'accent':   'InterTight, system-ui, sans-serif',
);
```

Начертания:

| Название | Вес |
|----------|-----|
| `thin` | 100 |
| `light` | 300 |
| `normal` | 400 |
| `medium` | 500 |
| `semibold` | 600 |
| `bold` | 700 |

---

## Инструменты

### Функции

#### `module($n)`
Возвращает кратное базовому модулю (4px).

```scss
module(4)  // → 16px
module(10) // → 40px
```

#### `spacing($n)`
Псевдоним для `module()`. Используется для padding/margin.

```scss
spacing(4) // → 16px
```

#### `font-size($name)`
Возвращает размер шрифта из шкалы.

| Название | Размер |
|----------|--------|
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
Возвращает межстрочный интервал.

| Название | Значение |
|----------|----------|
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
Возвращает значение border-radius.

| Название | Значение |
|----------|----------|
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
Возвращает значение box-shadow.

| Название | Значение |
|----------|----------|
| `sm` | `0 1px 3px rgba(0,0,0,0.06)` |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `lg` | `0 8px 24px rgba(0,0,0,0.10)` |
| `xl` | `0 16px 48px rgba(0,0,0,0.12)` |

#### `color($name, $shade: '500', $alpha: 1)`
Возвращает цвет из палитры OKLCH с опциональной прозрачностью.

```scss
color('blue', '500')      // → var(--blue-500)
color('blue', '500', 0.5) // → rgba(...) из --blue-500
```

### Миксины

#### `respond-to($breakpoint)`
Медиа-запрос. Брейкпоинты: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`.

```scss
@include tools.respond-to('md') {
  font-size: tools.font-size('md');
}
```

#### `adaptive($property, $base, $scales)`
Адаптивное значение с пошаговым масштабированием.

```scss
@include tools.adaptive(gap, 4, (
  'md': 1.5,  // → 24px на md+
  'lg': 2     // → 32px на lg+
));
```

#### `font($size, $weight: null, $line-height: null, $color: null, $family: null)`
Универсальный миксин для шрифта. Все необязательные параметры по умолчанию `null` (пропускаются, если не указаны).

```scss
@include tools.font('lg', 'bold', 'lg', var(--color-primary), var(--font-family-heading));
```

#### `heading($level: 1, $color: var(--color-text), $family: var(--font-family-heading))`
Миксин для заголовков. `$level` 1–6 соответствует размерам `7xl` → `2xl`. Межстрочный интервал берётся из токена размера.

```scss
h1 { @include tools.heading(1); }           // → 96px, bold
h3 { @include tools.heading(3); }           // → 64px, bold
h3 { @include tools.heading(3, var(--color-primary)); } // с кастомным цветом
```

#### `hover($property: all, $duration: settings.$transition-base)`
Применяет стили hover внутри `@media (hover: hover)` и на `:focus-visible`. Параметр `$timing` удалён — тайминг встроен в `$duration`.

```scss
@include tools.hover((background-color)) {
  background-color: var(--color-primary-hover);
}
```

#### `focus-ring($color: var(--color-border-focus), $offset: 2px)`
Стили фокуса с клавиатуры. Принимает `@content` для дополнительных правил `focus-visible`.

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
Кастомный скроллбар.

```scss
@include tools.custom-scrollbar(8px, 4px);
```

#### Логические миксины отступов

| Миксин | Описание |
|--------|----------|
| `margin-block($top, $bottom: null)` | Логические отступы по блоковой оси |
| `margin-inline($start, $end: null)` | Логические отступы по строчной оси |
| `padding-block($top, $bottom: null)` | Логические padding по блоковой оси |
| `padding-inline($start, $end: null)` | Логические padding по строчной оси |
| `margin($top, $right, $bottom, $left)` | Все 4 стороны (с fallback на logical) |
| `padding($top, $right, $bottom, $left)` | Все 4 стороны (с fallback на logical) |

---

## Базовые стили

### Шрифты

Шрифты управляются через `source/scss/3-generic/_fonts.scss`:

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

Только шрифты из `$active-fonts` генерируют `@font-face`. Файлы должны лежать в `source/assets/fonts/{папка}/`.

### Анимации

Reveal-анимации определены в `source/scss/3-generic/_animations.scss`:

```scss
[data-reveal] {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translate(0, 0);
}
```

Начальное состояние (opacity: 0, transform offset) задаёт JavaScript (`utilities/_viewport.js`).

---

## Объекты

### Сетка

12-колоночная CSS Grid система, аналог Bootstrap.

```html
<div class="row">
  <div class="col-4">Колонка</div>
  <div class="col-8">Колонка</div>
</div>
```

Адаптивный gap: `16px` база → `24px` на `md` → `32px` на `lg`.

### Раскладка

Контейнеры и секции.

### Утилиты

Отступы, display, visibility и другие атомарные утилитарные классы.

---

## Компоненты

### Кнопка

Кнопки используют мапу вариантов для генерации цветов:

```scss
$button-variants: (
  primary: (bg: var(--color-primary), color: var(--color-text-inverse), hover: var(--color-primary-hover), active: var(--color-primary-active)),
  success: (bg: var(--color-success), color: var(--color-text-inverse), hover: var(--color-success-hover)),
  danger:  (bg: var(--color-danger),  color: var(--color-text-inverse), hover: var(--color-danger-hover)),
  warning: (bg: var(--color-warning), color: var(--color-text-inverse), hover: var(--color-warning-hover)),
  info:    (bg: var(--color-info),    color: var(--color-text-inverse), hover: var(--color-info-hover)),
);
```

Варианты генерируются через `@each`. Hover использует миксин `tools.hover()` с `@media (hover: hover)`.

**Базовые стили:**
- `display: flex`
- `height: tools.module(10)` (40px)
- `gap: tools.spacing(1)` (4px)
- `font-size: tools.font-size('sm')` (14px)
- `line-height: tools.line-height('lg')` (1.75)
- `padding: tools.spacing(2) tools.spacing(5)` (8px 20px)

**Размеры:**

| Модификатор | Высота | Размер шрифта | Отступы |
|-------------|--------|---------------|---------|
| `.btn--sm` | 24px | 12px | 4px 8px |
| `.btn` (базовый) | 40px | 14px | 8px 20px |
| `.btn--lg` | 48px | 16px | 12px 24px |

**Состояния:**
- `.btn--disabled` / `:disabled` — `opacity: 0.5`
- `.btn--loading` — спиннер, `color: transparent`
- `.btn--block` — `width: 100%`

**Варианты:**
- `.btn--primary`, `.btn--success`, `.btn--danger`, `.btn--warning`, `.btn--info`
- `.btn--secondary` — с рамкой, background-secondary
- `.btn--outline` — прозрачный фон, цветная рамка/текст
- `.btn--ghost` — прозрачный, hover показывает background-hover

### Карточка

Компонент карточки с изображением, контентом и областью действий.

### Модалка

Модальное окно с поддержкой focus trap.

### Аккордеон

Аккордеон с анимированными переходами высоты и ARIA-атрибутами.

### Dropdown

Dropdown-меню с авто-позиционированием (flip), клавиатурной навигацией и ARIA.

---

## Темы

Темы определены в `source/scss/1-settings/_themes.scss`.

### Светлая тема (миксин)

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

### Тёмная тема (миксин)

Такая же структура, инвертированные значения (grey-950 → grey-50 и т.д.).

### Применение

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

## Сборка и Webpack

### Обработка ассетов

Webpack обрабатывает следующие ресурсы:

| Тип ресурса | Расширение | Папка вывода |
|-------------|------------|--------------|
| Шрифты | `.woff2`, `.woff`, `.eot`, `.ttf`, `.otf` | `build/fonts/` |
| SVG-иконки | `.svg` | `build/icons/` |
| Изображения | `.png`, `.jpg`, `.jpeg`, `.gif` | `build/images/` |

### Side effects

`package.json` объявляет SCSS/CSS как side effects, чтобы предотвратить tree-shaking:

```json
"sideEffects": ["*.scss", "*.css"]
```

### Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Сервер разработки с HMR |
| `npm run build` | Сборка для продакшена (минификация) |
| `npm run watch` | Режим наблюдения для разработки |

---

**Автор:** Георгий Киосов | **Лицензия:** MIT
