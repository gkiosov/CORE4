# Документация JavaScript-дизайн системы

> Версия: 0.1.0  
> Модульная клиентская архитектура на чистом JavaScript (ES6+).

---

## Содержание

1. [Общая информация](#1-общая-информация)
2. [Архитектура](#2-архитектура)
3. [Ядро (Core)](#3-ядро-core)
4. [Утилиты (Utilities)](#4-утилиты-utilities)
5. [Компоненты (Modules)](#5-компоненты-modules)
   - [Accordion](#accordion)
6. [Инициализация и глобальный API](#6-инициализация-и-глобальный-api)
7. [HTML data-атрибуты](#7-html-data-атрибуты)
8. [Примеры использования](#8-примеры-использования)

---

## 1. Общая информация

Дизайн-система построена по принципу **ITCSS** для стилей и **модульной архитектуры** для скриптов. Каждый компонент самоинициализируется по `data-*` атрибутам в HTML. Система не зависит от внешних фреймворков.

### Стек
- **SCSS** — модульная типографика, OKLCH-палитра, CSS-переменные тем
- **JavaScript (ES6+)** — классы, модули, `IntersectionObserver`
- **Webpack 5** — сборка, минификация, dev-server

---

## 2. Архитектура

```
source/js/
├── main.js                 # Точка входа, класс App
├── core/
│   ├── _index.js           # Экспорт ядра
│   ├── _config.js          # Единый конфиг (селекторы, клавиши, состояния)
│   ├── _events.js          # Кастомные события (CustomEvent)
│   └── _helpers.js         # Утилиты: debounce, throttle, generateId и др.
├── utilities/
│   ├── _dom.js             # DOM-манипуляции (qs, qsa, addClass и др.)
│   ├── _keyboard.js        # Проверка клавиш (Escape, Enter, Tab, Arrows)
│   ├── _focus-trap.js      # Ловушка фокуса для модалок
│   └── _viewport.js        # IntersectionObserver: reveal-анимации
└── modules/
    ├── accordion/
    │   └── _accordion.js   # Класс Accordion + initAccordions()
    ├── modal/
    │   ├── _index.js       # Инициализация модалок
    │   └── _modal.js       # Класс Modal
    └── theme/
        └── _theme.js       # Класс ThemeManager
```

### Принципы
1. **Каждый модуль сам находит себя** в DOM по `data-*` атрибутам.
2. **Модули не зависят друг от друга напрямую** — только через `core` и `utilities`.
3. **Event delegation** вместо навешивания слушателей на каждый элемент.
4. **Accessibility first** — `aria-*`, `role`, `tabindex`, focus-trap.

---

## 3. Ядро (Core)

### 3.1. CONFIG

Единый источник истины для селекторов, классов состояний, клавиш и анимаций.

```js
import { CONFIG } from './core/_index.js';

// Примеры использования:
CONFIG.SELECTORS.MODAL        // '[data-modal]'
CONFIG.STATE.OPEN             // 'is-open'
CONFIG.KEYBOARD.ESC           // 'Escape'
CONFIG.ANIMATION.DURATION.MEDIUM // 300
```

| Ключ | Описание                                                                      |
|------|-------------------------------------------------------------------------------|
| `PREFIX` | Префикс `'core4'` для ID и классов                                            |
| `STATE` | Классы состояний: `ACTIVE`, `OPEN`, `CLOSED`, `HIDDEN`, `LOADING`, `DISABLED` |
| `ATTR` | Data-атрибуты: `THEME`, `MODAL`, `ACCORDION` и др.                            |
| `SELECTORS` | CSS-селекторы для автоинициализации                                           |
| `KEYBOARD` | Коды клавиш для обработчиков                                                  |
| `ANIMATION` | Длительности и easing-функции                                                 |
| `THEME_KEY` | Ключ для `localStorage` (`'core4-theme'`)                                     |

### 3.2. EventManager

Диспатч и подписка на кастомные события.

```js
import { EventManager } from './core/_index.js';

// Отправка события
EventManager.dispatch(element, 'modal:opened', { trigger: button });

// Подписка
EventManager.on(element, 'modal:opened', (e) => {
    console.log(e.detail.trigger);
});

// Одноразовая подписка
EventManager.once(element, 'theme:changed', callback);
```

### 3.3. Helpers

```js
import { debounce, throttle, generateId, deepClone, isVisible, isPlainObject, getNestedValue } from './core/_index.js';
```

| Функция | Описание | Пример |
|---------|----------|--------|
| `generateId(prefix)` | Уникальный ID с `crypto.randomUUID()` | `generateId('btn') // 'btn-a1b2...'` |
| `debounce(fn, delay)` | Дебаунс | `debounce(resizeHandler, 200)` |
| `throttle(fn, delay)` | Троттлинг | `throttle(scrollHandler, 100)` |
| `deepClone(obj)` | Глубокое клонирование через `structuredClone` | `deepClone(config)` |
| `isVisible(el)` | Видим ли элемент (не `display:none`, не `opacity:0`) | `isVisible(card)` |
| `isPlainObject(val)` | Является ли значение plain object | `isPlainObject({}) // true` |
| `getNestedValue(obj, path, fallback)` | Безопасный доступ по пути | `getNestedValue(user, 'profile.name')` |

---

## 4. Утилиты (Utilities)

### 4.1. DOM (`_dom.js`)

Безопасные обёртки над нативными методами.

```js
import { qs, qsa, addClass, removeClass, toggleClass, createElement, setAttr, getAttr } from './utilities/_dom.js';
```

| Функция | Описание |
|---------|----------|
| `qs(selector, context)` | `querySelector` с fallback на `document` |
| `qsa(selector, context)` | `querySelectorAll` → `Array` |
| `addClass(el, className)` | Добавить класс |
| `removeClass(el, className)` | Удалить класс |
| `toggleClass(el, className, condition)` | Тоггл с условием |
| `createElement(tag, classes, attrs, children)` | Создание элемента |
| `setAttr / getAttr / removeAttr` | Работа с атрибутами |

### 4.2. Keyboard (`_keyboard.js`)

```js
import { Keyboard } from './utilities/_keyboard.js';

Keyboard.isEscape(e)   // true если Escape
Keyboard.isEnter(e)    // true если Enter
Keyboard.isTab(e)      // true если Tab
Keyboard.isArrow(e)    // true если любая стрелка
```

### 4.3. FocusTrap (`_focus-trap.js`)

Ловушка фокуса для модалок и dropdown. Циклическая навигация по `Tab` и `Shift+Tab`.

```js
import { FocusTrap } from './utilities/_focus-trap.js';

const trap = new FocusTrap(modalElement);
trap.activate();   // Запоминает текущий фокус, переводит на первый элемент
trap.deactivate(); // Возвращает фокус на исходный элемент
trap.focusFirst(); // Фокус на первый фокусируемый элемент
trap.focusLast();  // Фокус на последний
```

### 4.4. Viewport (`_viewport.js`)

Reveal-анимации и отслеживание видимости элементов.

```js
import { onViewportEnter, onViewportLeave, onViewportChange, initRevealAnimations } from './utilities/_viewport.js';
```

| Функция | Описание |
|---------|----------|
| `onViewportEnter(el, callback, options)` | Сработает при появлении во viewport |
| `onViewportLeave(el, callback, options)` | Сработает при исчезновении |
| `onViewportChange(el, callback, options)` | Сработает при появлении и исчезновении |
| `initRevealAnimations(selector)` | Автоинициализация `[data-reveal]` |

#### Параметры `initRevealAnimations`

| Data-атрибут | Значение по умолчанию | Описание |
|-------------|----------------------|----------|
| `data-reveal` | — | Активирует анимацию |
| `data-reveal-direction` | `up` | Направление появления: `up`, `down`, `left`, `right` |
| `data-reveal-duration` | `600` | Длительность в ms |
| `data-reveal-delay` | `0` | Задержка в ms |
| `data-reveal-once` | `true` | `true` — остаётся видимым; `false` — скрывается при выходе |
| `data-reveal-exit-edge` | `any` | За какой край уходит: `any`, `top`, `bottom`, `left`, `right` |

---

## 5. Компоненты (Modules)

### Accordion

Модуль управления аккордеонами. Поддерживает режимы `single` и `multiple`, reveal-анимацию через `height`, управление с клавиатуры, кнопки "Открыть все" / "Закрыть все".

#### Импорт

```js
import { Accordion, initAccordions } from './modules/accordion/_accordion.js';
```

#### HTML-структура

```html
<div class="accordion" data-accordion>
  <!-- Кнопки управления (опционально) -->
  <button type="button" data-accordion-expand>Открыть все</button>
  <button type="button" data-accordion-collapse>Закрыть все</button>

  <div class="accordion__item" data-accordion-item>
    <button class="accordion__header" data-accordion-header>
      Заголовок 1
    </button>
    <div class="accordion__content" data-accordion-content>
      <div class="accordion__inner">Содержимое 1</div>
    </div>
  </div>

  <div class="accordion__item" data-accordion-item>
    <button class="accordion__header" data-accordion-header>
      Заголовок 2
    </button>
    <div class="accordion__content" data-accordion-content>
      <div class="accordion__inner">Содержимое 2</div>
    </div>
  </div>
</div>
```

#### Data-атрибуты

| Атрибут | Значение | Описание |
|---------|----------|----------|
| `data-accordion` | — | Инициализирует аккордеон |
| `data-accordion-multiple` | `true` / `false` | Режим: несколько открытых элементов |
| `data-accordion-item` | — | Элемент аккордеона |
| `data-accordion-header` | — | Кнопка-заголовок |
| `data-accordion-content` | — | Раскрывающийся контент |
| `data-accordion-expand` | — | Кнопка "Открыть все" |
| `data-accordion-collapse` | — | Кнопка "Закрыть все" |

#### Конструктор

```js
const accordion = new Accordion(element, {
    openClass: 'is-open',   // Класс открытого состояния
    multiple: false         // true — несколько открытых
});
```

#### Методы экземпляра

| Метод | Описание |
|-------|----------|
| `open(index)` | Открыть элемент по индексу |
| `close(index, instant)` | Закрыть элемент. `instant: true` — без анимации |
| `toggle(index)` | Переключить состояние |
| `closeAll(instant)` | Закрыть все элементы |
| `expandAll()` | Открыть все элементы (игнорирует `multiple`) |
| `collapseAll(instant)` | Закрыть все элементы |
| `destroy()` | Уничтожить экземпляр, отписаться от событий |

#### События

| Событие | Detail | Описание |
|---------|--------|----------|
| `accordion:opened` | `{ index }` | Элемент открыт |
| `accordion:closed` | `{ index }` | Элемент закрыт |

```js
accordion.element.addEventListener('accordion:opened', (e) => {
    console.log('Открыт элемент:', e.detail.index);
});
```

#### CSS-классы

| Класс | Описание |
|-------|----------|
| `.accordion__item` | Контейнер элемента |
| `.accordion__item.is-open` | Открытое состояние |
| `.accordion__header` | Кнопка-заголовок |
| `.accordion__content` | Анимируемый контент (`height: 0 → scrollHeight`) |
| `.accordion__inner` | Внутренний wrapper для padding |

---

## 6. Инициализация, конфигурация и оптимизация сборки

### 6.1. Конфигурируемая инициализация

Класс `App` поддерживает условное включение модулей. Это позволяет собирать **разные бандлы** для разных проектов, не таща лишний код.

```js
// main.js для лэндинга (только сетка + типографика + reveal)
import '../scss/landing.scss';

import { ThemeManager } from './modules/theme/_theme.js';
import { initRevealAnimations } from './utilities/_viewport.js';

class App {
	constructor(config = {}) {
		this.modules = {};
		this.isInitialized = false;

		this.config = {
			modules: {
				theme: true,
				modals: false,
				accordions: false,
				buttons: false,
				dropdowns: false,
				likeButtons: false,
				revealAnimations: true,
				...config.modules
			}
		};
	}

	init() {
		if (this.isInitialized) return;
		this.isInitialized = true;

		const cfg = this.config.modules;

		if (cfg.theme) this.modules.theme = new ThemeManager();
		if (cfg.modals) this.modules.modals = initModals();
		if (cfg.accordions) this.modules.accordions = initAccordions();
		if (cfg.buttons) this.modules.buttons = initButtons();
		if (cfg.dropdowns) this.modules.dropdowns = initDropdowns();
		if (cfg.likeButtons) this.modules.likeButtons = initLikeButtons();
		if (cfg.revealAnimations) initRevealAnimations();
	}

	getModule(name) {
		return this.modules[name] || null;
	}
}

const app = new App({
	modules: {
		theme: true,
		revealAnimations: true
		// всё остальное false по умолчанию
	}
});

document.addEventListener('DOMContentLoaded', () => app.init());
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `modules.theme` | `boolean` | `true` | Тема |
| `modules.modals` | `boolean` | `true` | Модалки |
| `modules.accordions` | `boolean` | `true` | Аккордеоны |
| `modules.buttons` | `boolean` | `true` | Кнопки |
| `modules.dropdowns` | `boolean` | `true` | Dropdown |
| `modules.likeButtons` | `boolean` | `true` | Лайки |
| `modules.revealAnimations` | `boolean` | `true` | Reveal-анимации |

**Правило:** если модуль выключен (`false`) — его JS **не импортируется** → webpack не включает его в бандл.

---

### 6.2. Tree shaking

Webpack 5 автоматически удаляет неиспользуемый код при условии:

1. **ES6 modules** (`import` / `export`) — у вас уже так
2. **`"sideEffects": false`** в `package.json` (кроме SCSS/CSS)

```json
// package.json
{
  "sideEffects": [
    "*.scss",
    "*.css"
  ]
}
```

**Что это даёт:**
- Если `initModals()` не вызывается — весь `modules/modal/` выкидывается из бандла
- Если `Accordion` не импортируется — класс не попадает в сборку
- CSS тоже tree-shake'ится: неимпортированные SCSS-файлы не генерируют CSS

---

### 6.3. Code splitting (динамические импорты)

Для тяжёлых модулей, которые нужны не сразу:

```js
// Ленивая загрузка модалок только если есть data-modal
async function loadModals() {
	const { initModals } = await import(
		/* webpackChunkName: "modals" */
		'./modules/modal/_index.js'
	);
	return initModals();
}

// В App.init():
if (document.querySelector('[data-modal]')) {
	this.modules.modals = await loadModals();
}
```

Webpack создаст отдельный чанк `modals.js` (~2-5 KB gzipped), который загрузится асинхронно.

---

### 6.4. Многопроектная структура

```
/source
  /scss
    /core
    /objects
    /components
  /js
    /core
    /utilities
    /modules

/projects
  /landing
    main.scss      ← только grid + типографика + reveal
    main.js        ← только theme + reveal
    webpack.config.js
  /dashboard
    main.scss      ← все компоненты
    main.js        ← все модули
    webpack.config.js
  /blog
    main.scss      ← кнопки + like + dropdown
    main.js        ← кнопки + like + dropdown + reveal
    webpack.config.js
```

**`projects/landing/main.scss`:**

```scss
@use '../../source/scss/1-settings/index' as settings;
@use '../../source/scss/2-tools/index' as tools;
@use '../../source/scss/3-generic/base';
@use '../../source/scss/3-generic/typography';
@use '../../source/scss/4-objects/grid';
@use '../../source/scss/4-objects/layout';
@use '../../source/scss/4-objects/utilities';
// НЕ импортируем: button, card, modal, accordion, dropdown...
```

**`projects/landing/main.js`:**

```js
import './main.scss';

import { ThemeManager } from '../../source/js/modules/theme/_theme.js';
import { initRevealAnimations } from '../../source/js/utilities/_viewport.js';

class App {
	constructor() {
		this.modules = {};
		this.isInitialized = false;
	}
	init() {
		if (this.isInitialized) return;
		this.isInitialized = true;
		this.modules.theme = new ThemeManager();
		initRevealAnimations();
	}
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
```

**`projects/landing/webpack.config.js`:**

```js
const path = require('path');

module.exports = {
	mode: 'production',
	entry: './main.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'main.min.js'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	}
};
```

Собрать лэндинг:

```bash
cd projects/landing
npx webpack --config webpack.config.js
```

---

### 6.5. Глобальный API

```js
import { app } from './main.js';

// Получить модуль
const accordions = app.getModule('accordions');
const modals = app.getModule('modals');
const theme = app.getModule('theme');

// Глобальный доступ (для отладки)
window.CORE4.app           // Экземпляр App
window.CORE4.core          // CONFIG, EventManager, helpers
window.CORE4.utils         // dom, keyboard, viewport
window.CORE4.components    // ThemeManager, Modal, Accordion, Button, Dropdown, LikeButton, FocusTrap
```

| Метод | Описание |
|-------|----------|
| `app.init()` | Инициализация включённых модулей |
| `app.getModule(name)` | Получить модуль по имени |
| `app.destroy()` | Уничтожить все модули и очистить события |

---

## 7. HTML data-атрибуты

### Сводная таблица всех data-атрибутов

| Атрибут | Компонент | Описание |
|---------|-----------|----------|
| `data-accordion` | Accordion | Инициализация |
| `data-accordion-multiple` | Accordion | Режим multiple |
| `data-accordion-item` | Accordion | Элемент |
| `data-accordion-header` | Accordion | Заголовок |
| `data-accordion-content` | Accordion | Контент |
| `data-accordion-expand` | Accordion | Кнопка "Открыть все" |
| `data-accordion-collapse` | Accordion | Кнопка "Закрыть все" |
| `data-modal` | Modal | Инициализация модалки |
| `data-modal-trigger` | Modal | Кнопка открытия (`value = id модалки`) |
| `data-modal-close` | Modal | Кнопка закрытия внутри модалки |
| `data-modal-overlay` | Modal | Оверлей для клика вне окна |
| `data-theme` | Theme | Атрибут на `<html>` для переключения темы |
| `data-reveal` | Viewport | Анимация появления при скролле |
| `data-reveal-direction` | Viewport | Направление |
| `data-reveal-duration` | Viewport | Длительность |
| `data-reveal-delay` | Viewport | Задержка |
| `data-reveal-once` | Viewport | Один раз или циклично |
| `data-reveal-exit-edge` | Viewport | Край выхода |

---

## 8. Примеры использования

### 8.1. Accordion — базовый

```html
<div data-accordion>
  <div data-accordion-item>
    <button data-accordion-header>Вопрос 1</button>
    <div data-accordion-content>
      <div class="accordion__inner">Ответ 1</div>
    </div>
  </div>
  <div data-accordion-item>
    <button data-accordion-header>Вопрос 2</button>
    <div data-accordion-content>
      <div class="accordion__inner">Ответ 2</div>
    </div>
  </div>
</div>
```

### 8.2. Accordion — multiple (несколько открытых)

```html
<div data-accordion data-accordion-multiple="true">
  <!-- элементы -->
</div>
```

### 8.3. Accordion — с кнопками управления

```html
<div data-accordion>
  <button data-accordion-expand>Открыть все</button>
  <button data-accordion-collapse>Закрыть все</button>
  <!-- элементы -->
</div>
```

### 8.4. Reveal-анимация — базовая

```html
<section data-reveal>
  <h2>Заголовок</h2>
  <p>Появится при скролле</p>
</section>
```

### 8.5. Reveal — направление, задержка, цикличность

```html
<div data-reveal
     data-reveal-direction="left"
     data-reveal-delay="200"
     data-reveal-duration="800"
     data-reveal-once="false"
     data-reveal-exit-edge="bottom">
  Блок, который выезжает слева, скрывается только при уходе за нижний край
</div>
```

### 8.6. Программное управление аккордеоном

```js
// Получить первый аккордеон
const accordion = app.getModule('accordions')[0];

// Открыть третий элемент
accordion.open(2);

// Закрыть все мгновенно
accordion.collapseAll(true);

// Открыть все (даже в single-режиме)
accordion.expandAll();

// Подписка на событие
accordion.element.addEventListener('accordion:opened', (e) => {
    console.log('Открыт элемент с индексом:', e.detail.index);
});
```

### 8.7. Программное управление темой

```js
const theme = app.getModule('theme');

theme.toggleTheme();           // Переключить светлую/тёмную
theme.setTheme('dark');        // Установить тёмную
theme.setTheme('light');       // Установить светлую
theme.setTheme('system');      // Следовать за системной темой

// Подписка на смену темы
document.documentElement.addEventListener('theme:changed', (e) => {
    console.log('Новая тема:', e.detail.theme);
});
```

---

## Лицензия

MIT


---

## 5. Компоненты (Modules) — дополнение

### Button

Модуль управления кнопками. Поддерживает три режима: **default** (обычная), **async** (с loading/success/error) и **toggle** (переключатель).

#### Импорт

```js
import { Button, initButtons } from './modules/button/_index.js';
```

#### HTML-структура

**Async-кнопка (с обратной связью):**
```html
<button 
  class="btn btn--primary" 
  data-button="async"
  data-loading-text="Сохраняем..."
  data-success-text="Сохранено!"
  data-error-text="Ошибка сохранения"
  data-reset-delay="2000"
>
  Сохранить
</button>
```

**Toggle-кнопка (переключатель):**
```html
<button 
  class="btn btn--secondary" 
  data-button="toggle"
  aria-pressed="false"
>
  <span>🔔</span> Уведомления
</button>
```

**Обычная кнопка (без JS):**
```html
<button class="btn btn--primary">Отправить</button>
```

#### Data-атрибуты

| Атрибут | Значение | Описание |
|---------|----------|----------|
| `data-button` | `async` / `toggle` | Тип кнопки |
| `data-loading-text` | `"Загрузка..."` | Текст при загрузке |
| `data-success-text` | `"Готово!"` | Текст при успехе |
| `data-error-text` | `"Ошибка"` | Текст при ошибке |
| `data-reset-delay` | `2000` | Задержка сброса в ms |

#### Конструктор

```js
const btn = new Button(element, {
    loadingClass: 'is-loading',
    successClass: 'is-success',
    errorClass: 'is-error',
    resetDelay: 2000
});
```

#### Методы экземпляра

| Метод | Описание |
|-------|----------|
| `setLoading()` | Блокирует кнопку, показывает спиннер |
| `setSuccess(text?)` | Устанавливает success-состояние |
| `setError(text?)` | Устанавливает error-состояние |
| `reset()` | Сбрасывает в исходное состояние |
| `toggle(force?)` | Переключает toggle-состояние |
| `setText(text)` | Меняет текст кнопки |
| `destroy()` | Уничтожает экземпляр |

#### События

| Событие | Detail | Описание |
|---------|--------|----------|
| `button:click` | `{ button, originalEvent }` | Клик по кнопке |
| `button:success` | `{ button }` | Успешное завершение |
| `button:error` | `{ button }` | Ошибка |
| `button:toggle` | `{ button, active }` | Переключение toggle |

#### CSS-классы состояний

| Класс | Описание |
|-------|----------|
| `.is-loading` | Кнопка заблокирована, спиннер |
| `.is-success` | Успешное состояние (зелёный) |
| `.is-error` | Состояние ошибки (красный) |
| `.is-active` | Toggle-активно |

#### Пример: форма с API

```js
import { initButtons } from './modules/button/_index.js';

initButtons();

// Обработка конкретной кнопки
document.querySelector('#save-btn').addEventListener('button:click', async (e) => {
  const btn = e.detail.button;

  try {
    await fetch('/api/save', { method: 'POST', body: formData });
    btn.setSuccess();
  } catch (err) {
    btn.setError('Не удалось сохранить');
  }
});
```

---

## 7. HTML data-атрибуты — дополнение

| Атрибут | Компонент | Описание |
|---------|-----------|----------|
| `data-button` | Button | Тип: `async` или `toggle` |
| `data-loading-text` | Button | Текст загрузки |
| `data-success-text` | Button | Текст успеха |
| `data-error-text` | Button | Текст ошибки |
| `data-reset-delay` | Button | Задержка сброса |


---

### Button Group

Группировка кнопок с устранением двойных границ. Поддерживает горизонтальное и вертикальное расположение.

#### HTML

```html
<!-- Горизонтальная группа -->
<div class="btn-group">
  <button class="btn btn--secondary">Слева</button>
  <button class="btn btn--secondary">Центр</button>
  <button class="btn btn--secondary">Справа</button>
</div>

<!-- Вертикальная группа -->
<div class="btn-group btn-group--vertical">
  <button class="btn btn--secondary">Вверх</button>
  <button class="btn btn--secondary">Центр</button>
  <button class="btn btn--secondary">Вниз</button>
</div>
```

#### CSS-классы

| Класс | Описание |
|-------|----------|
| `.btn-group` | Горизонтальная группа |
| `.btn-group--vertical` | Вертикальная группа |

---

### Dropdown

Выпадающее меню с клавиатурной навигацией, позиционированием и закрытием по Escape/клику вне.

#### Импорт

```js
import { Dropdown, initDropdowns } from './modules/dropdown/_dropdown.js';
```

#### HTML

```html
<div class="dropdown" data-dropdown>
  <button class="btn btn--secondary dropdown__trigger" 
          data-dropdown-trigger 
          aria-haspopup="true" 
          aria-expanded="false">
    Действия
  </button>
  <div class="dropdown__menu" data-dropdown-menu>
    <button class="dropdown__item">✏️ Редактировать</button>
    <button class="dropdown__item">📋 Копировать</button>
    <div class="dropdown__item dropdown__item--divider"></div>
    <button class="dropdown__item dropdown__item--danger">🗑️ Удалить</button>
  </div>
</div>
```

#### Data-атрибуты

| Атрибут | Значение | Описание |
|---------|----------|----------|
| `data-dropdown` | — | Инициализирует dropdown |
| `data-dropdown-trigger` | — | Кнопка открытия |
| `data-dropdown-menu` | — | Контейнер меню |
| `data-dropdown-placement` | `bottom-start` | Позиция: `top-start`, `top-end`, `bottom-start`, `bottom-end`, `left`, `right` |

#### Методы

| Метод | Описание |
|-------|----------|
| `open()` | Открыть меню (с авто-позиционированием) |
| `close()` | Закрыть меню |
| `toggle()` | Переключить |

#### Авто-позиционирование (auto-flip)

По умолчанию dropdown автоматически проверяет, влезает ли меню в viewport. Если нет — меняет направление:

| Задано | Если не влезает | Результат |
|--------|-----------------|-----------|
| `bottom-start` | Нет места снизу | `top-start` |
| `bottom-end` | Нет места снизу | `top-end` |
| `top-start` | Нет места сверху | `bottom-start` |
| `left` | Нет места слева | `right` |
| `right` | Нет места справа | `left` |

**Отключить авто-flip:**
```js
new Dropdown(el, { autoFlip: false });
```

#### Клавиатура

| Клавиша | Действие |
|---------|----------|
| `Enter`, `Space`, `ArrowDown` | Открыть меню и сфокусировать первый пункт |
| `ArrowUp` / `ArrowDown` | Навигация по пунктам |
| `Home` / `End` | Первый / последний пункт |
| `Escape` | Закрыть меню, вернуть фокус на триггер |
| `Enter` на пункте | Выбор, закрытие |

#### События

| Событие | Detail | Описание |
|---------|--------|----------|
| `dropdown:opened` | `{ dropdown }` | Меню открыто |
| `dropdown:closed` | `{ dropdown }` | Меню закрыто |
| `dropdown:select` | `{ item, index, dropdown }` | Выбран пункт |

#### CSS-классы

| Класс | Описание |
|-------|----------|
| `.dropdown` | Контейнер |
| `.dropdown.is-open` | Открытое состояние |
| `.dropdown__trigger` | Кнопка-триггер |
| `.dropdown__menu` | Меню |
| `.dropdown__menu--{placement}` | Позиционирование |
| `.dropdown__item` | Пункт меню |
| `.dropdown__item--danger` | Опасное действие (красный) |
| `.dropdown__item--divider` | Разделитель |

#### Split Button

```html
<div class="btn-group">
  <button class="btn btn--primary">Сохранить</button>
  <div class="dropdown" data-dropdown style="display:inline-flex">
    <button class="btn btn--primary dropdown__trigger" data-dropdown-trigger>▼</button>
    <div class="dropdown__menu" data-dropdown-menu>
      <button class="dropdown__item">💾 Сохранить как...</button>
      <button class="dropdown__item">📥 Экспорт</button>
    </div>
  </div>
</div>
```

---

## 7. HTML data-атрибуты — дополнение

| Атрибут | Компонент | Описание |
|---------|-----------|----------|
| `data-dropdown` | Dropdown | Инициализация dropdown |
| `data-dropdown-trigger` | Dropdown | Кнопка открытия |
| `data-dropdown-menu` | Dropdown | Контейнер меню |
| `data-dropdown-placement` | Dropdown | Позиция меню |


---

### LikeButton

Отдельный компонент для кнопки «Нравится» с счётчиком. Поддерживает оптимистичное обновление UI, отправку на сервер и откат при ошибке.

#### Импорт

```js
import { LikeButton, initLikeButtons } from './modules/like-button/_index.js';
```

#### HTML

```html
<button 
  class="btn btn--ghost" 
  data-like-button
  data-like-count="42"
  data-post-id="123"
  aria-pressed="false"
>
  <span data-like-icon>❤️</span> <span data-like-count>42</span>
</button>
```

#### Data-атрибуты

| Атрибут | Описание |
|---------|----------|
| `data-like-button` | Инициализирует компонент |
| `data-like-count` | Начальное значение счётчика |
| `data-post-id` | ID поста для API-запроса |
| `data-like-endpoint` | URL endpoint (опционально, можно задать в JS) |

#### Конструктор

```js
const like = new LikeButton(element, {
    activeClass: 'is-active',
    endpoint: '/api/posts/:id/like', // :id заменяется на postId
    postId: '123',
    optimistic: true // оптимистичное обновление UI
});
```

#### Методы

| Метод | Описание |
|-------|----------|
| `setLiked(boolean, count?)` | Программно установить состояние |
| `getState()` | Получить `{ liked, count }` |

#### События

| Событие | Detail | Описание |
|---------|--------|----------|
| `like:click` | `{ button, willBeLiked, postId }` | Клик по кнопке |
| `like:success` | `{ button, liked, count }` | Успешный запрос |
| `like:error` | `{ button, error }` | Ошибка запроса |

#### Пример с API

```js
import { initLikeButtons } from './modules/like-button/_index.js';

initLikeButtons();

// Глобальная обработка (если endpoint не задан в конструкторе)
document.querySelectorAll('[data-like-button]').forEach(el => {
    el.addEventListener('like:click', async (e) => {
        const { button, willBeLiked, postId } = e.detail;

        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: willBeLiked ? 'POST' : 'DELETE'
            });
            if (!res.ok) throw new Error(res.statusText);

            const data = await res.json();
            button.setLiked(willBeLiked, data.count);
        } catch (err) {
            // Откат произойдёт автоматически если optimistic: true
            console.error('Ошибка лайка:', err);
        }
    });
});
```

#### CSS

```scss
[data-like-button] {
  [data-like-icon] {
    display: inline-block;
    transition: transform 0.2s ease;
  }

  &.is-active [data-like-icon] {
    color: #dc2626; // красное сердце
  }
}
```

---

## 7. HTML data-атрибуты — дополнение

| Атрибут | Компонент | Описание |
|---------|-----------|----------|
| `data-like-button` | LikeButton | Инициализация |
| `data-like-count` | LikeButton | Начальное значение счётчика |
| `data-like-icon` | LikeButton | Иконка (для анимации) |
| `data-post-id` | LikeButton | ID поста |
| `data-like-endpoint` | LikeButton | URL API |


---

## 9. Интеграция с CMS

Система независима от CMS — работает с любым HTML. Внедрение — через подключение готовых бандлов.

### 9.1. WordPress

```php
// functions.php
function core4_enqueue_assets() {
    wp_enqueue_style('core4-main', get_template_directory_uri() . '/build/css/main.min.css', [], '1.0');
    wp_enqueue_script('core4-main', get_template_directory_uri() . '/build/js/main.min.js', [], '1.0', true);
}
add_action('wp_enqueue_scripts', 'core4_enqueue_assets');
```

### 9.2. Шаблон с data-атрибутами

```php
// template-parts/content.php
<div class="accordion" data-accordion>
    <?php while (have_rows('faq_items')): the_row(); ?>
        <div class="accordion__item" data-accordion-item>
            <button class="accordion__header" data-accordion-header>
                <?php the_sub_field('question'); ?>
            </button>
            <div class="accordion__content" data-accordion-content>
                <div class="accordion__inner">
                    <?php the_sub_field('answer'); ?>
                </div>
            </div>
        </div>
    <?php endwhile; ?>
</div>
```

### 9.3. Возможные конфликты

| Проблема | Решение |
|----------|---------|
| CMS-стили перебивают ваши | Оборачивать в `.core4-container` и усиливать специфичность |
| jQuery конфликтует с `window.$` | Использовать `window.CORE4` вместо `$` |
| Нет webpack в CMS | Собирать локально, загружать готовые бандлы |

---

## 10. Чеклист оптимизации

| Что проверить | Как |
|---------------|-----|
| Неиспользуемые SCSS-модули | Не импортировать в `main.scss` |
| Неиспользуемые JS-модули | `false` в конфиге App + не импортировать |
| Tree shaking | `"sideEffects": ["*.scss", "*.css"]` в `package.json` |
| Code splitting | `import()` для тяжёлых модулей |
| Многопроектность | Отдельные `main.js`/`main.scss` в `projects/` |
| Шрифты | Только нужные веса в `@font-face` |
| Иконки | SVG-спрайт только с используемыми иконками |
