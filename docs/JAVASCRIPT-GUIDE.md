# CORE4. Документация JavaScript

> Версия: 0.1.0 Альфа  
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

## 6. Инициализация и глобальный API

### main.js

```js
import { app } from './main.js';

// Получить модуль
const accordions = app.getModule('accordions');
const modals = app.getModule('modals');
const theme = app.getModule('theme');

// Глобальный доступ (для отладки)
window.DS.app      // Экземпляр App
window.DS.core     // CONFIG, EventManager, helpers
window.DS.utils    // dom, keyboard, viewport
window.DS.components // ThemeManager, Modal, Accordion, FocusTrap
```

### Класс App

| Метод | Описание |
|-------|----------|
| `app.init()` | Инициализация всех модулей (вызывается автоматически на `DOMContentLoaded`) |
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
