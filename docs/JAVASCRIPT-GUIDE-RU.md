# 📘 Документация CORE4 JavaScript

> **Версия:** 0.1.0 Альфа | **Обновлено:** Август 2026

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Архитектура](#архитектура)
   - [Класс App](#класс-app)
   - [Динамические импорты](#динамические-импорты)
   - [Глобальное API](#глобальное-api)
3. [Ядро](#ядро)
   - [CONFIG](#config)
   - [EventManager](#eventmanager)
4. [Утилиты](#утилиты)
   - [DOM-хелперы](#dom-хелперы)
   - [Keyboard](#keyboard)
   - [FocusTrap](#focustrap)
   - [Viewport](#viewport)
5. [Модули](#модули)
   - [ThemeManager](#thememanager)
   - [Modal](#modal)
   - [Accordion](#accordion)
   - [Button](#button)
   - [Dropdown](#dropdown)
6. [Сборка и Webpack](#сборка-и-webpack)

---

## Обзор

JavaScript-часть CORE4 — это модульная система на ES-модулях со следующими особенностями:

- **Ленивая загрузка** — модули подгружаются только при наличии соответствующих DOM-элементов
- **Переинициализация** — `app.reinit()` безопасно пересканирует DOM для динамически добавленных компонентов
- **Event-driven** — все модули диспатчат custom events через `EventManager`
- **Доступность** — ARIA-атрибуты и клавиатурная навигация встроены в каждый интерактивный компонент

---

## Архитектура

### Класс App

Класс `App` — единая точка входа. Управляет жизненным циклом модулей, ленивой загрузкой и переинициализацией.

```javascript
class App {
  constructor(config = {}) {
    this.modules = {};
    this.isInitialized = false;
    this.config = {
      modules: {
        theme: true,
        modals: true,
        accordions: true,
        buttons: true,
        dropdowns: true,
        revealAnimations: true,
        ...config.modules
      }
    };
    this._factories = {}; // Кэш для лениво загружаемых чанков
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    await this._initModules();
  }

  /**
   * Переинициализация модулей для динамически добавленных DOM-элементов.
   * Безопасно вызывать многократно — старые инстансы уничтожаются перед созданием новых.
   */
  async reinit() {
    await this._initModules(/* isReinit = */ true);
  }
}
```

#### Конфигурация модулей

```javascript
const app = new App({
  modules: {
    theme: true,            // ThemeManager (всегда загружается статически)
    modals: true,           // Ленивая загрузка, если есть [data-modal]
    accordions: true,       // Ленивая загрузка, если есть [data-accordion]
    buttons: true,          // Ленивая загрузка, если есть [data-button]
    dropdowns: true,        // Ленивая загрузка, если есть [data-dropdown]
    revealAnimations: true  // Всегда загружается (лёгкий)
  }
});
```

#### Методы

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `init()` | `Promise<void>` | Инициализирует все включённые модули |
| `reinit()` | `Promise<void>` | Пересканирует DOM, уничтожает старые инстансы, создаёт новые |
| `getModule(name)` | `Array|Object|null` | Возвращает инстансы модуля по имени |
| `destroy()` | `void` | Уничтожает все модули, очищает кэши, сбрасывает состояние |

### Динамические импорты

Модули (кроме `ThemeManager` и `revealAnimations`) загружаются через `import()` только при наличии соответствующих DOM-элементов:

```javascript
// Модалки — чанк "modals"
if (cfg.modals && document.querySelector('[data-modal]')) {
  if (!this._factories.modals) {
    this._factories.modals = await import(
      /* webpackChunkName: "modals" */
      './modules/modal/_index.js'
    );
  }
  this._registerModule('modals', () => this._factories.modals.initModals(), isReinit);
  window.CORE4.components.Modal = this._factories.modals.Modal;
}
```

Это включает **code splitting** — каждый модуль становится отдельным webpack-чанком.

### Глобальное API

```javascript
window.CORE4 = {
  app,              // Инстанс App
  core,             // Ядро (CONFIG, EventManager)
  utils: { dom, keyboard },
  components: { ThemeManager, FocusTrap }
  // Modal, Accordion, Button, Dropdown добавляются лениво при init()
};
```

В режиме разработки доступные глобальные переменные выводятся в консоль.

---

## Ядро

### CONFIG

Глобальный объект конфигурации. Расширяется через `Object.assign` до `app.init()`.

```javascript
import { CONFIG } from './core/_config.js';

// Значения по умолчанию
CONFIG.prefix = 'core4';          // Префикс CSS-классов
CONFIG.animations = true;       // Включить анимации
```

### EventManager

Централизованная система событий. Все модули диспатчат custom events через неё.

```javascript
import { EventManager } from './core/_events.js';

// Диспатч
EventManager.dispatch(element, 'modal:opened', { modal: this });

// Прослушивание
element.addEventListener('modal:opened', (e) => {
  console.log(e.detail.modal);
});
```

---

## Утилиты

### DOM-хелперы

```javascript
import * as dom from './utilities/_dom.js';
```

| Функция | Сигнатура | Описание |
|---------|-----------|----------|
| `qs` | `(selector, context = document)` | Псевдоним `querySelector` |
| `qsa` | `(selector, context = document)` | Псевдоним `querySelectorAll` |
| `addClass` | `(element, ...classNames)` | Добавить один или несколько классов |
| `removeClass` | `(element, ...classNames)` | Удалить один или несколько классов |
| `toggleClass` | `(element, className)` | Переключить класс |
| `hasClass` | `(element, className)` | Проверить наличие класса |

```javascript
dom.addClass(el, 'is-open', 'is-active');
dom.removeClass(el, 'is-open', 'is-active');
```

### Keyboard

```javascript
import * as keyboard from './utilities/_keyboard.js';
```

| Функция | Описание |
|---------|----------|
| `isEscape(e)` | Проверка Escape |
| `isEnter(e)` | Проверка Enter |
| `isSpace(e)` | Проверка Space |
| `isTab(e)` | Проверка Tab |
| `isArrowUp(e)` | Проверка ArrowUp |
| `isArrowDown(e)` | Проверка ArrowDown |
| `isArrowLeft(e)` | Проверка ArrowLeft |
| `isArrowRight(e)` | Проверка ArrowRight |
| `isHome(e)` | Проверка Home |
| `isEnd(e)` | Проверка End |

### FocusTrap

Управляет фокусом внутри модалки или дропдауна. Автоматически вызывает `updateFocusableElements()` при активации.

```javascript
import { FocusTrap } from './utilities/_focus-trap.js';

const trap = new FocusTrap(modalElement);
trap.activate();   // Захватывает фокус, вызывает updateFocusableElements()
trap.deactivate(); // Освобождает фокус
trap.updateFocusableElements(); // Пересканировать фокусируемые элементы
```

| Метод | Описание |
|-------|----------|
| `activate()` | Начать захват фокуса |
| `deactivate()` | Остановить захват фокуса |
| `updateFocusableElements()` | Пересканировать DOM на фокусируемые элементы |

### Viewport

Утилиты для определения видимости элементов и reveal-анимаций.

```javascript
import { initRevealAnimations, isInViewport, onViewportEnter, onViewportLeave, onViewportChange } from './utilities/_viewport.js';
```

| Функция | Описание |
|---------|----------|
| `isInViewport(el, offset = 0)` | Проверить, виден ли элемент |
| `onViewportEnter(el, callback, options)` | Вызвать callback при появлении |
| `onViewportLeave(el, callback, options)` | Вызвать callback при исчезновении |
| `onViewportChange(el, callback, options)` | Вызвать callback при появлении ИЛИ исчезновении |
| `initRevealAnimations(selector = '[data-reveal]')` | Автоинициализация reveal-анимаций |

#### Reveal-анимации (data-атрибуты)

```html
<div data-reveal
     data-reveal-delay="200"
     data-reveal-duration="600"
     data-reveal-direction="up"
     data-reveal-once="true"
     data-reveal-exit-edge="bottom">
  Контент
</div>
```

| Атрибут | По умолчанию | Описание |
|---------|-------------|----------|
| `data-reveal-delay` | `0` | Задержка в мс |
| `data-reveal-duration` | `600` | Длительность в мс |
| `data-reveal-direction` | `up` | `up`, `down`, `left`, `right` |
| `data-reveal-once` | `false` | Оставаться видимым после первого появления |
| `data-reveal-exit-edge` | `any` | Край для отслеживания исчезновения: `top`, `bottom`, `left`, `right`, `any` |

---

## Модули

### ThemeManager

Управление переключением тёмной/светлой темы. Модуль работает в декларативном режиме: скрипт управляет только состоянием, классами и атрибутами, а вся визуализация (иконки, анимации) реализуется через CSS.

```javascript
import { ThemeManager } from './modules/theme/_theme.js';

const theme = new ThemeManager();

theme.set('dark');   // Принудительно тёмная
theme.set('light');  // Принудительно светлая
theme.set('system'); // Следовать системной теме ОС
theme.toggle();      // Переключить тёмная ↔ светлая
theme.reset();       // Вернуться к system
```

#### Геттеры

| Геттер | Тип | Описание |
|--------|-----|----------|
| `choice` | `string` | Выбор пользователя: `dark`, `light`, `system` |
| `effective` | `string` | Реально применённая тема: `dark`, `light` |
| `isDark` | `boolean` | Текущая эффективная тема — тёмная |
| `isLight` | `boolean` | Текущая эффективная тема — светлая |

#### Методы

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `apply(theme, options)` | `string` | Применить тему (`dark`/`light`/`system`). Возвращает `effective`. `options.silent` — не диспатчить событие |
| `set(theme)` | `string` | Алиас для `apply()` |
| `toggle()` | `string` | Переключить `light` ↔ `dark` |
| `reset()` | `string` | Вернуться к `system` |
| `destroy()` | `void` | Удалить слушатели, очистить инстанс |

#### Разметка switch

Модуль ожидает `input[type="checkbox"]` внутри элемента с селектором `toggleSelector` (по умолчанию `[data-theme-toggle]`). Скрипт не меняет содержимое — только `checked`, `aria-checked` и CSS-классы.

```html
<label class="theme-switch" data-theme-toggle>
  <input
    type="checkbox"
    class="theme-switch__input"
    role="switch"
    aria-label="Переключить тёмную тему"
  >
  <span class="theme-switch__track" aria-hidden="true">
    <span class="theme-switch__thumb"></span>
    <span class="theme-switch__icon theme-switch__icon--light">☀️</span>
    <span class="theme-switch__icon theme-switch__icon--dark">🌙</span>
  </span>
</label>
```

#### Как работает `system`

При первом визите `localStorage` пуст — модуль выбирает `system` и смотрит `prefers-color-scheme` ОС. Пользователь видит тёмную или светлую тему, но `choice` остаётся `system`.

Если пользователь позже меняет настройки ОС, сайт **автоматически** переключается (пока нет ручного выбора). После клика по switch выбор фиксируется в `localStorage`, и авто-синхронизация отключается.

| Сценарий | `localStorage` | `choice` | `effective` | Реакция на смену ОС |
|----------|---------------|----------|-------------|---------------------|
| Первый визит | — | `system` | зависит от ОС | ✅ Авто |
| Пользователь включил тёмную | `dark` | `dark` | `dark` | ❌ Нет |
| Пользователь включил светлую | `light` | `light` | `light` | ❌ Нет |
| Нажал «Авто» (`reset()`) | — | `system` | зависит от ОС | ✅ Авто |

#### События

```javascript
document.documentElement.addEventListener('theme:changed', (e) => {
  console.log(e.detail.effective);  // 'dark' | 'light'
  console.log(e.detail.choice);     // 'dark' | 'light' | 'system'
  console.log(e.detail.isDark);     // boolean
  console.log(e.detail.isSystem);   // boolean
});
```

#### Конфигурация

```javascript
const theme = new ThemeManager({
  themeKey: 'core4-theme',        // ключ в localStorage
  themeAttr: 'data-theme',        // атрибут на корневом элементе
  darkValue: 'dark',
  lightValue: 'light',
  systemValue: 'system',
  toggleSelector: '[data-theme-toggle]',
  rootSelector: 'html'
});
```

### Modal

Модальное окно с focus trap, клавиатурной поддержкой и закрытием по клику на backdrop.

```html
<button data-modal-trigger="my-modal">Открыть</button>

<div id="my-modal" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3>Заголовок</h3>
      <button data-modal-close>×</button>
    </div>
    <div class="modal__body">...</div>
  </div>
</div>
```

```javascript
import { Modal, initModals } from './modules/modal/_index.js';

// Автоинициализация
const modals = initModals();

// Ручная
const modal = new Modal(document.getElementById('my-modal'));
modal.open();
modal.close();
```

| Метод | Описание |
|-------|----------|
| `open()` | Открыть модалку, захватить фокус |
| `close()` | Закрыть модалку, освободить фокус |
| `toggle()` | Переключить открыто/закрыто |

**События:** `modal:opened`, `modal:closed`

### Accordion

Сворачиваемые секции с анимированными переходами высоты и полной поддержкой ARIA.

```html
<div data-accordion data-accordion-multiple="true">
  <div data-accordion-item>
    <button data-accordion-header>Секция 1</button>
    <div data-accordion-content>Контент 1</div>
  </div>
  <div data-accordion-item>
    <button data-accordion-header>Секция 2</button>
    <div data-accordion-content>Контент 2</div>
  </div>
</div>
```

```javascript
import { Accordion, initAccordions } from './modules/accordion/_accordion.js';

const accordions = initAccordions();

// Или вручную
const accordion = new Accordion(element, { multiple: true });
accordion.open(0);
accordion.close(0);
accordion.toggle(0);
accordion.expandAll();
accordion.collapseAll(instant = false);
accordion.destroy();
```

| Метод | Описание |
|-------|----------|
| `open(index)` | Открыть элемент по индексу |
| `close(index, instant = false)` | Закрыть элемент (instant — без анимации) |
| `toggle(index)` | Переключить элемент |
| `expandAll()` | Открыть все элементы (игнорирует `multiple`) |
| `collapseAll(instant = false)` | Закрыть все элементы |
| `destroy()` | Удалить слушатели, закрыть все элементы |

**ARIA:** Каждый заголовок получает `aria-expanded`, `aria-controls`, `role="button"`, `tabindex="0"`. Контент получает авто-generated `id`.

**События:** `accordion:opened`, `accordion:closed`

### Button

Интерактивная кнопка с async-состояниями, toggle-режимом и спиннером загрузки.

```html
<!-- Обычная -->
<button class="btn btn--primary" data-button="default">Клик</button>

<!-- Async -->
<button class="btn btn--primary" data-button="async"
        data-loading-text="Загрузка..."
        data-success-text="Готово!"
        data-error-text="Ошибка!"
        data-reset-delay="3000">
  Отправить
</button>

<!-- Toggle -->
<button class="btn btn--secondary" data-button="toggle">Переключить</button>
```

```javascript
import { Button, initButtons } from './modules/button/_index.js';

const buttons = initButtons();

// Или вручную
const btn = new Button(element, {
  loadingClass: 'is-loading',
  successClass: 'is-success',
  errorClass: 'is-error',
  loadingText: 'Загрузка...',
  successText: 'Готово!',
  errorText: 'Ошибка!',
  resetDelay: 2000,
  toggleClass: 'is-active'
});
```

| Метод | Описание |
|-------|----------|
| `setLoading()` | Показать состояние загрузки |
| `setSuccess(text = null)` | Показать состояние успеха |
| `setError(text = null)` | Показать состояние ошибки |
| `reset()` | Сбросить в начальное состояние |
| `toggle(forceState = null)` | Переключить активное состояние |
| `setText(text)` | Изменить текст кнопки |
| `setHTML(html)` | Изменить HTML кнопки |
| `destroy()` | Очистить таймеры |

**События:** `button:click`, `button:success`, `button:error`, `button:toggle`

### Dropdown

Dropdown-меню с авто-позиционированием, клавиатурной навигацией и ARIA.

```html
<div data-dropdown data-dropdown-placement="bottom-start">
  <button data-dropdown-trigger>Меню</button>
  <div data-dropdown-menu>
    <button>Пункт 1</button>
    <button>Пункт 2</button>
  </div>
</div>
```

```javascript
import { Dropdown, initDropdowns } from './modules/dropdown/_dropdown.js';

const dropdowns = initDropdowns();

// Или вручную
const dropdown = new Dropdown(element, {
  openClass: 'is-open',
  placement: 'bottom-start',
  autoFlip: true
});

dropdown.open();
dropdown.close();
dropdown.toggle();
dropdown.destroy();
```

| Метод | Описание |
|-------|----------|
| `open()` | Открыть меню, позиционировать, навесить слушатели |
| `close()` | Закрыть меню, снять слушатели |
| `toggle()` | Переключить открыто/закрыто |
| `destroy()` | Закрыть и очистить |

**Позиции:** `bottom-start`, `bottom-end`, `top-start`, `top-end`, `left`, `right`

**Клавиатура:** ArrowUp/ArrowDown — навигация, Enter/Space — открыть, Escape — закрыть, Home/End — первый/последний пункт.

**ARIA:** Триггер получает `aria-haspopup`, `aria-expanded`, `aria-controls`. Меню получает `role="menu"`. Пункты получают `role="menuitem"`.

**События:** `dropdown:opened`, `dropdown:closed`, `dropdown:select`

---

## Сборка и Webpack

### Обработка ассетов

Webpack обрабатывает шрифты, SVG-иконки и изображения:

| Тип ресурса | Расширения | Вывод |
|-------------|------------|-------|
| Шрифты | `.woff2`, `.woff`, `.eot`, `.ttf`, `.otf` | `build/fonts/` |
| SVG-иконки | `.svg` | `build/icons/` |
| Изображения | `.png`, `.jpg`, `.jpeg`, `.gif` | `build/images/` |

### package.json

```json
{
  "sideEffects": ["*.scss", "*.css"]
}
```

Предотвращает tree-shaking SCSS/CSS файлов webpack'ом.

### Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Сервер разработки с HMR |
| `npm run build` | Сборка для продакшена (минификация, без dev-сервера) |
| `npm run watch` | Режим наблюдения для разработки |

---

**Автор:** Георгий Киосов | **Лицензия:** MIT
