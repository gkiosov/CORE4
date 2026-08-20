# 📘 SCSS-документация дизайн-системы

> **Версия:** 1.0.0  
> **Обновлено:** Август 2026  
> **Совместимость:** Dart Sass 1.80+

---

## 📋 Содержание

1. [Введение](#введение)
2. [Модульная система](#-модульная-система-settings)
3. [Функции (Tools)](#-функции-tools)
4. [Миксины (Mixins)](#-миксины-mixins)
5. [Цвета и темизация](#-цвета-и-темизация)
6. [Сетка (Grid)](#-сетка-grid)
7. [Компоненты](#-компоненты)
8. [Быстрый старт](#-быстрый-старт)

---

## Введение

Эта документация описывает SCSS-систему дизайн-системы. Все размеры и отступы кратны базовому модулю **4px**, что обеспечивает визуальный ритм и предсказуемость.

**Импорт системы:**
```scss
@use '1-settings' as settings;
@use '2-tools' as tools;
```

---

## 🧱 Модульная система (Settings)

### Базовый модуль

```scss
$module: 4px; // Базовый модуль
```

### Отступы (spacing)

| Ключ | Значение | Ключ | Значение |
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

**Использование:**
```scss
.element {
  padding: settings.spacing(4); // → 16px
  margin: settings.spacing(6);  // → 24px
  gap: settings.spacing(3);     // → 12px
}
```

### Брейкпоинты

| Breakpoint | Значение | Префикс |
| :--- | :--- | :--- |
| `xs` | 375px | `col-xs-*` |
| `sm` | 576px | `col-sm-*` |
| `md` | 768px | `col-md-*` |
| `lg` | 992px | `col-lg-*` |
| `xl` | 1200px | `col-xl-*` |
| `xxl` | 1400px | `col-xxl-*` |

---

## 🧪 Функции (Tools)

### `module($modules)`
Преобразует количество модулей в пиксели.

```scss
@function module($modules) {
  @return $modules * settings.$module;
}
```

**Пример:**
```scss
.element {
  padding: tools.module(4); // → 16px
  margin: tools.module(6);  // → 24px
  height: tools.module(10); // → 40px
}
```

### `spacing($name)`
Возвращает значение отступа по ключу.

```scss
@function spacing($name) {
  $modules: map.get(settings.$spacing-modules, $name);
  @return module($modules);
}
```

**Пример:**
```scss
.element {
  padding: tools.spacing(4); // → 16px
  margin: tools.spacing(6);  // → 24px
  gap: tools.spacing(3);     // → 12px
}

// С кавычками тоже работает
.element {
  padding: tools.spacing('4'); // → 16px
}
```

### `radius($name)`
Возвращает значение скругления.

```scss
@function radius($name) {
  $modules: map.get(settings.$radius-modules, $name);
  @if $name == 'full' {
    @return 9999px;
  }
  @return module($modules);
}
```

**Пример:**
```scss
.card {
  border-radius: tools.radius('md');  // → 8px
}

.btn {
  border-radius: tools.radius('full'); // → 9999px (круг)
}
```

**Допустимые ключи:** `'none'` (0), `'sm'` (4px), `'md'` (8px), `'lg'` (12px), `'xl'` (16px), `'full'` (9999px)

### `font-size($name)`
Возвращает размер шрифта.

| Ключ | Значение | Ключ | Значение |
| :--- |:---------| :--- | :--- |
| `xs` | 16px     | `2xl` | 28px |
| `sm` | 18px     | `3xl` | 32px |
| `base` | 16px     | `4xl` | 36px |
| `md` | 18px     | `5xl` | 40px |
| `lg` | 20px     | `6xl` | 44px |
| `xl` | 24px     | `7xl` | 48px |

**Пример:**
```scss
h1 {
  font-size: tools.font-size('3xl'); // → 32px
}

p {
  font-size: tools.font-size('base'); // → 16px
}
```

### `line-height($name)`
Возвращает межстрочный интервал.

| Ключ | Значение | Ключ | Значение |
| :--- |:---------| :--- | :--- |
| `xs` | 16px     | `2xl` | 32px |
| `sm` | 18px     | `3xl` | 36px |
| `base` | 20px     | `4xl` | 40px |
| `md` | 20px     | `5xl` | 44px |
| `lg` | 24px     | `6xl` | 48px |
| `xl` | 28px     | `7xl` | 52px |

**Пример:**
```scss
p {
  line-height: tools.line-height('base'); // → 20px
}
```

### `color($name, $shade: '500')`
Универсальная функция для получения цвета. Работает с основными и семантическими цветами.

```scss
@function color($name, $shade: '500') {
  // Проверяет семантические цвета, затем основную палитру
}
```

**Примеры:**
```scss
// Основной цвет
.btn--danger {
  background: tools.color('red', '500');
}

// Семантический цвет
.btn--primary {
  background: tools.color('primary');
  // или с оттенком
  background: tools.color('primary', '300');
}

// С прозрачностью
.mark {
  background: rgba(tools.color('warning'), 0.2);
}
```

**Допустимые значения:**
- **Основные:** `'red'`, `'blue'`, `'green'`, `'grey'`, и т.д.
- **Семантические:** `'primary'`, `'success'`, `'warning'`, `'danger'`, `'info'`

### `breakpoint($name)`
Возвращает значение брейкпоинта.

```scss
@function breakpoint($name) {
  @return map.get(settings.$breakpoints, $name);
}
```

**Пример:**
```scss
.container {
  max-width: tools.breakpoint('xl'); // → 1200px
}
```

### `clamp-fluid($min, $max)`
Создаёт резиновое значение для адаптивной типографики.

```scss
@function clamp-fluid($min, $max) {
  $slope: math.div($max - $min, 1400px - 375px);
  $intercept: $min - $slope * 375px;
  @return clamp(#{$min}, #{$intercept} + #{$slope * 100}vw, #{$max});
}
```

**Пример:**
```scss
h1 {
  font-size: tools.clamp-fluid(24px, 48px);
  // От 24px на мобилках до 48px на десктопе
}
```

### `vh($value, $type: 'svh')`
Создаёт безопасное viewport-значение для мобильных устройств.

```scss
@function vh($value, $type: 'svh') {
  @return calc(#{$value} * var(--#{$type}));
}
```

**Пример:**
```scss
.hero {
  min-height: tools.vh(100, 'svh'); // → 100svh
}

.modal {
  max-height: tools.vh(80, 'dvh'); // → 80dvh
}
```

---

## 🛠 Миксины (Mixins)

### Адаптивность

#### `respond-to($breakpoint)`
Mobile-first. Применяет стили от указанного брейкпоинта и выше.

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

**Пример:**
```scss
.element {
  font-size: 14px;
  
  @include tools.respond-to('md') {
    font-size: 18px; // На планшетах и выше
  }
  
  @include tools.respond-to('lg') {
    font-size: 20px; // На десктопе и выше
  }
}
```

#### `respond-below($breakpoint)`
Desktop-first. Применяет стили до указанного брейкпоинта.

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

**Пример:**
```scss
.element {
  font-size: 18px;
  
  @include tools.respond-below('md') {
    font-size: 14px; // На мобилках и планшетах
  }
}
```

### Отступы (логические свойства)

#### `margin-block($top, $bottom)`
Устанавливает вертикальные внешние отступы.

```scss
@mixin margin-block($top, $bottom: null) {
  @if $bottom != null {
    margin-block: spacing($top) spacing($bottom);
  } @else {
    margin-block: spacing($top);
  }
}
```

**Пример:**
```scss
.element {
  @include tools.margin-block(4);       // → margin-block: 16px 16px;
  @include tools.margin-block(6, 4);    // → margin-block: 24px 16px;
}
```

#### `padding-block($top, $bottom)`
Устанавливает вертикальные внутренние отступы.

```scss
@mixin padding-block($top, $bottom: null) {
  @if $bottom != null {
    padding-block: spacing($top) spacing($bottom);
  } @else {
    padding-block: spacing($top);
  }
}
```

**Пример:**
```scss
.card {
  @include tools.padding-block(4);      // → padding-block: 16px 16px;
  @include tools.padding-block(6, 4);   // → padding-block: 24px 16px;
}
```

#### `margin-inline($start, $end)`
Устанавливает горизонтальные внешние отступы.

```scss
@mixin margin-inline($start, $end: null) {
  @if $end != null {
    margin-inline: spacing($start) spacing($end);
  } @else {
    margin-inline: spacing($start);
  }
}
```

**Пример:**
```scss
.element {
  @include tools.margin-inline(6);      // → margin-inline: 24px 24px;
  @include tools.margin-inline(6, 4);   // → margin-inline: 24px 16px;
}
```

#### `padding-inline($start, $end)`
Устанавливает горизонтальные внутренние отступы.

```scss
@mixin padding-inline($start, $end: null) {
  @if $end != null {
    padding-inline: spacing($start) spacing($end);
  } @else {
    padding-inline: spacing($start);
  }
}
```

**Пример:**
```scss
.container {
  @include tools.padding-inline(6);     // → padding-inline: 24px 24px;
  @include tools.padding-inline(6, 4);  // → padding-inline: 24px 16px;
}
```

### Адаптивные отступы

#### `adaptive($property, $base, $scales)`
Меняет отступ в зависимости от брейкпоинта.

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

**Пример:**
```scss
.section {
  // padding: 32px на мобилках, 48px на планшетах, 64px на десктопе
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

### Сетка

#### `make-row($gap: $grid-gap)`
Создаёт строку с 12 колонками.

```scss
@mixin make-row($gap: settings.$grid-gap) {
  display: grid;
  grid-template-columns: repeat(settings.$grid-columns, 1fr);
  gap: $gap;
}
```

**Пример:**
```scss
.products {
  @include tools.make-row(24px);
}
```

#### `make-col($span)`
Задаёт ширину колонки (от 1 до 12).

```scss
@mixin make-col($span) {
  grid-column: span $span;
}
```

**Пример:**
```scss
.sidebar {
  @include tools.make-col(3); // 3 колонки из 12
}

.content {
  @include tools.make-col(9); // 9 колонок из 12
}
```

#### `make-col-exact($start, $end)`
Точное позиционирование колонки.

```scss
@mixin make-col-exact($start, $end) {
  grid-column: $start / $end;
}
```

**Пример:**
```scss
.hero-text {
  @include tools.make-col-exact(2, 8);  // Со 2-й по 8-ю
}

.hero-image {
  @include tools.make-col-exact(9, 13); // С 9-й по 13-ю (12 колонок + 1)
}
```

### Типографика

#### `font($size, $weight: normal, $line-height: normal, $color: var(--color-text))`
Устанавливает все свойства текста одной строкой.

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

**Пример:**
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
Стилизует заголовки H1-H6.

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

**Пример:**
```scss
h1 { @include tools.heading(1); } // → font-size: 48px; font-weight: 700; line-height: 52px;
h2 { @include tools.heading(2); } // → font-size: 44px; font-weight: 700; line-height: 48px;
h3 { @include tools.heading(3); } // → font-size: 40px; font-weight: 700; line-height: 44px;
```

### Темизация

#### `theme-aware($property, $light-value, $dark-value)`
Переключает значения свойства в зависимости от темы.

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

**Пример:**
```scss
.card {
  @include tools.theme-aware('background', #ffffff, #0f172a);
  @include tools.theme-aware('border-color', #e2e8f0, #334155);
}
```

### Компоненты и утилиты

#### `@mixin hover($property: all, $duration: settings.$transition-base)`
Добавляет секцию @media (hover: hover) для класса с описанием :hover и :focus-visible, а так же параметры анимации.

```scss
@mixin hover($property: all, $duration: settings.$transition-base, $timing: ease) {
	// Transition выставляем ВСЕГДА (он не мешает на touch)
	@if $property != none {
		transition: $property $duration $timing;
	}

	// Hover только для устройств с настоящим наведением
	@media (hover: hover) {
		&:hover {
			@content;
		}
	}

	// Для клавиатуры — всегда показываем эффект
	&:focus-visible {
		@content;
	}
}
```

**Пример:**
```scss
// Простая смена цвета (кнопка)
.btn--primary {
	background: var(--color-primary);
	color: var(--color-text-inverse);

	@include hover(background-color) {
		background: var(--color-primary-hover);
	}
}

// Несколько свойств одновременно
.btn--secondary {
	background: var(--color-bg-secondary);
	color: var(--color-text);
	border-color: var(--color-border);

	// Перечисляем свойства, которые анимируем
	@include hover((background-color, border-color, color)) {
		background: var(--color-bg-hover);
		border-color: var(--color-border-hover);
		color: var(--color-text-hover);
	}
}

// Анимация поднятия (карточка)
.card {
	background: var(--color-surface);
	box-shadow: tools.shadow('sm');

	// Анимируем transform и box-shadow с кастомной длительностью
	@include hover((transform, box-shadow), 0.25s, ease-out) {
		transform: translateY(-4px);
		box-shadow: tools.shadow('lg');
	}
}

// Анимация масштаба (иконка/кнопка-иконка)
.icon-btn {
	background: transparent;
	color: var(--color-text);

	@include hover((transform, color), 0.2s) {
		transform: scale(1.1);
		color: var(--color-primary);
	}
}

// Смена цвета + подчёркивание (ссылка)
.link {
	color: var(--color-primary);
	text-decoration: none;
	position: relative;

	@include hover((color, width), 0.3s) {
		color: var(--color-primary-hover);

		// Если хочешь анимировать псевдоэлемент — делай это внутри
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
		transition: width 0.3s ease; // дублируем для плавности псевдо
	}
}

// Без анимации (мгновенный скачок)
.tag {
	background: var(--color-bg);

	@include hover(none) {
		background: var(--color-bg-hover);
	}
}
```

#### `custom-scrollbar($width: 8px, $radius: 4px)`
Создаёт кастомный скроллбар.

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

**Пример:**
```scss
.modal__content {
  @include tools.custom-scrollbar(6px, 6px);
}
```

#### `truncate($lines: 1)`
Обрезает текст и добавляет многоточие.

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

**Пример:**
```scss
.card__title {
  @include tools.truncate(1); // Одна строка
}

.card__description {
  @include tools.truncate(3); // Три строки
}
```

#### `center($position: absolute)`
Центрирует элемент абсолютно.

```scss
@mixin center($position: absolute) {
  position: $position;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**Пример:**
```scss
.loader {
  @include tools.center;
}

.modal {
  @include tools.center(fixed);
}
```

#### `overlay($opacity: 0.5, $z-index: z-index('overlay'))`
Создаёт затемнение для модалок.

```scss
@mixin overlay($opacity: 0.5, $z-index: z-index('overlay')) {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, $opacity);
  z-index: $z-index;
}
```

**Пример:**
```scss
.modal {
  &__overlay {
    @include tools.overlay(0.6);
  }
}
```

---

## 🌓 Цвета и темизация

### Доступные цвета

| Группа | Цвета |
| :--- | :--- |
| **Основные** | red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, blue-grey, grey |
| **Семантические** | primary (blue), success (green), warning (amber), danger (red), info (light-blue) |

### CSS-переменные

Все цвета доступны через CSS-переменные:

```css
:root {
  --red-500: oklch(0.4 0.25 27.9deg);
  --blue-500: oklch(0.4 0.25 240deg);
  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-600);
}
```

### Использование в компонентах

```scss
.element {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-border);
}
```

### Переключение темы

```html
<!-- Светлая тема -->
<html data-theme="light">

<!-- Тёмная тема -->
<html data-theme="dark">
```

**JavaScript для переключения:**
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 🎨 Сетка (Grid)

### Базовая сетка

```html
<div class="row">
  <div class="col-4">Колонка 1</div>
  <div class="col-4">Колонка 2</div>
  <div class="col-4">Колонка 3</div>
</div>
```

### Адаптивные колонки

```html
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">
    <!-- На мобилке: 1 колонка -->
    <!-- На планшете: 2 колонки -->
    <!-- На десктопе: 3 колонки -->
  </div>
</div>
```

### Доступные префиксы

| Префикс | Брейкпоинт |
| :--- | :--- |
| `col-` | Все экраны |
| `col-sm-` | ≥576px |
| `col-md-` | ≥768px |
| `col-lg-` | ≥992px |
| `col-xl-` | ≥1200px |
| `col-xxl-` | ≥1400px |

### Точное позиционирование

```html
<div class="row">
  <div class="col-start-3 col-end-9">
    <!-- Начинается с колонки 3, заканчивается на 9 -->
    <!-- Занимает колонки 3, 4, 5, 6, 7, 8 -->
  </div>
</div>
```

### Gap (отступы между колонками)

```html
<div class="row gap-4">  <!-- 16px gap -->
<div class="row gap-6">  <!-- 24px gap -->
<div class="row gap-8">  <!-- 32px gap -->
```

### Выравнивание в сетке

```html
<div class="row justify-center align-center">
  <div class="col-4">Центрированный контент</div>
</div>
```

---

## 🧩 Компоненты

### Кнопки (`.btn`)

```html
<!-- Варианты -->
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--success">Success</button>
<button class="btn btn--warning">Warning</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--info">Info</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>

<!-- Размеры -->
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>

<!-- Состояния -->
<button class="btn btn--disabled" disabled>Disabled</button>
<button class="btn btn--loading">Loading</button>
```

### Карточки (`.card`)

```html
<div class="card">
  <div class="card__image">
    <img src="image.jpg" alt="Описание">
  </div>
  <div class="card__content">
    <h3 class="card__title">Заголовок</h3>
    <p class="card__description">Описание карточки</p>
    <div class="card__footer">
      <span class="card__price">49 990 ₽</span>
      <button class="btn btn--primary">В корзину</button>
    </div>
  </div>
</div>

<!-- Выделенная карточка -->
<div class="card card--featured">...</div>

<!-- Маленькая карточка -->
<div class="card card--small">...</div>
```

### Модальные окна (`.modal`)

```html
<!-- Модалка -->
<div id="my-modal" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Заголовок</h3>
      <button class="modal__close" data-modal-close>×</button>
    </div>
    <div class="modal__body">
      <p>Содержимое модального окна</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary">Отмена</button>
      <button class="btn btn--primary">Подтвердить</button>
    </div>
  </div>
</div>

<!-- Триггер -->
<button data-modal-trigger="my-modal">Открыть модалку</button>
```

**Размеры модалки:**
```html
<div class="modal__content modal__content--sm">  <!-- 400px -->
<div class="modal__content modal__content--lg">  <!-- 800px -->
<div class="modal__content modal__content--xl">  <!-- 1140px -->
<div class="modal__content modal__content--full"> <!-- На весь экран -->
```

---

## ✅ Быстрый старт

### Подключение в проекте

```scss
// 1. Импорт всей системы
@use '1-settings' as settings;
@use '2-tools' as tools;

// 2. Использование отступов
.element {
  padding: tools.spacing(4);
  margin: tools.spacing(6);
}

// 3. Использование сетки
.grid {
  @include tools.make-row;
}

// 4. Использование цветов
.element {
  color: tools.color('primary');
  background: var(--color-background-secondary);
}

// 5. Использование адаптивности
.element {
  font-size: tools.font-size('base');
  
  @include tools.respond-to('md') {
    font-size: tools.font-size('lg');
  }
}
```

### Использование в HTML

```html
<!-- Контейнер -->
<div class="container">
  <!-- Строка -->
  <div class="row">
    <!-- Колонки -->
    <div class="col-md-6 col-lg-4">
      <!-- Контент -->
    </div>
  </div>
</div>
```

---

## 📚 Дополнительные ресурсы

- [OKLCH Color Picker](https://oklch.com/) — визуальный инструмент для цветов
- [CSS Color Level 4](https://www.w3.org/TR/css-color-4/) — спецификация
- [Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) — логические свойства в CSS

---

**Версия:** 1.0.0  
**Обновлено:** Август 2026  
**Автор:** core4 Design System