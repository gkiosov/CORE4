# 📘 Руководство по компоненту Modal

> **Версия:** 0.1.0 Альфа | **Обновлено:** Август 2026

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [HTML-структура](#html-структура)
3. [Data-атрибуты](#data-атрибуты)
4. [CSS-модификаторы](#css-модификаторы)
5. [Блокировка скролла](#блокировка-скролла)
6. [JavaScript API](#javascript-api)
7. [Доступность](#доступность)
8. [Вложенные модалки](#вложенные-модалки)
9. [Интеграция с History API](#интеграция-с-history-api)
10. [Свайп для закрытия](#свайп-для-закрытия)
11. [Примеры](#примеры)

---

## Обзор

Компонент Modal предоставляет доступные, центрированные диалоговые окна с оверлеем:

- **Блокировка скролла** через `scrollbar-gutter: stable` — без дёргания layout
- **Ловушка фокуса** — клавиатурная навигация не выходит за пределы модалки
- **Авто-триггеры** — открытие по задержке, скроллу, exit intent или beforeunload
- **Стекирование** — z-index автоматически увеличивается для вложенных модалок
- **History API** — кнопка «Назад» в браузере закрывает модалку
- **Свайп вниз** — на мобильных закрывает модалку свайпом
- **Несколько триггеров** — любое количество элементов может открывать одну модалку

Модуль **лениво загружается** — JS-чанк подгружается только при наличии `[data-modal]` в DOM.

---

## HTML-структура

Модалка состоит из трёх опциональных областей: **header**, **body** и **footer**.

```html
<div id="my-modal" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Заголовок модалки</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Содержимое модалки. При переполнении скроллится внутри.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Отмена</button>
      <button class="btn btn--primary">Подтвердить</button>
    </div>
  </div>
</div>
```

### Области

| Элемент | Класс | Обязательный | Описание |
|---------|-------|--------------|----------|
| Корень | `.modal` | Да | Фиксированный оверлей. Должен иметь `data-modal` для авто-инициализации. |
| Контент | `.modal__content` | Да | Центрирует и ограничивает ширину/высоту. |
| Заголовок | `.modal__header` | Нет | Заголовок + кнопка закрытия. Фиксируется при скролле тела. |
| Тело | `.modal__body` | Нет | Скроллируемая область контента. `overflow-y: auto`. |
| Футер | `.modal__footer` | Нет | Кнопки действий. Фиксируется внизу. |

### Кнопки закрытия

Любой элемент с `data-modal-close` внутри модалки закроет её по клику. Можно иметь несколько кнопок закрытия (например, в шапке и в футере).

---

## Data-атрибуты

### `data-modal`

Обязателен на корневом элементе `.modal`. Включает авто-инициализацию.

```html
<div class="modal" data-modal>...</div>
```

### `data-modal-trigger="id"`

Открывает модалку, чей `id` совпадает со значением. Может использоваться на любом элементе, и несколько триггеров могут ссылаться на одну модалку.

```html
<button data-modal-trigger="contact">Открыть (в шапке)</button>
<a href="#" data-modal-trigger="contact">Открыть (в тексте)</a>
<button data-modal-trigger="contact">Открыть (в футере)</button>
```

### `data-modal-close`

Закрывает содержащую модалку при клике. Может быть размещён на любом элементе внутри модалки.

```html
<button data-modal-close>Отмена</button>
<button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
```

### `data-modal-delay="ms"`

Авто-открытие модалки через N миллисекунд.

```html
<div class="modal" data-modal data-modal-delay="5000">
  <!-- Откроется через 5 секунд после загрузки страницы -->
</div>
```

### `data-modal-scroll="px"`

Авто-открытие после того, как пользователь проскроллит N пикселей вниз.

```html
<div class="modal" data-modal data-modal-scroll="400">
  <!-- Откроется после скролла на 400px -->
</div>
```

### `data-modal-exit-intent="true"`

Авто-открытие, когда мышь покидает viewport в сторону верхней границы (кнопки закрытия браузера).

```html
<div class="modal" data-modal data-modal-exit-intent="true">
  <!-- Откроется при попытке уйти -->
</div>
```

### `data-modal-beforeunload="true"`

Включает нативное предупреждение браузера при попытке закрыть вкладку. Сама модалка визуально не открывается — только регистрируется обработчик `beforeunload`.

```html
<div class="modal" data-modal data-modal-beforeunload="true"></div>
```

### `data-modal-once="true"`

Предотвращает повторное открытие модалки в рамках одной сессии страницы. Работает со всеми триггерами (клик, задержка, скролл, exit intent).

```html
<div class="modal" data-modal data-modal-delay="3000" data-modal-once="true">
  <!-- Откроется один раз, до перезагрузки страницы -->
</div>
```

### `data-modal-history="false"`

Отключает интеграцию с History API для этой модалки. По умолчанию открытие модалки добавляет запись в историю, и кнопка «Назад» её закрывает.

```html
<div class="modal" data-modal data-modal-history="false">
  <!-- Кнопка «Назад» НЕ будет закрывать эту модалку -->
</div>
```

---

## CSS-модификаторы

Применяются к `.modal__content` для изменения ширины модалки.

| Модификатор | Макс. ширина | Описание |
|-------------|--------------|----------|
| `.modal__content--sm` | 400px | Маленькие диалоги (алерты, подтверждения) |
| *(по умолчанию)* | 560px | Стандартный размер |
| `.modal__content--lg` | 800px | Большие диалоги (формы, таблицы) |
| `.modal__content--xl` | 1140px | Очень большие (галереи, мастера) |
| `.modal__content--full` | 100vw / 100dvh | Полноэкранный, без скругления |

```html
<div class="modal__content modal__content--lg">...</div>
```

---

## Блокировка скролла

При открытии первой модалки скролл страницы блокируется через:

```css
html.is-locked {
  overflow: hidden;
  touch-action: none;
}
```

Система полагается на `scrollbar-gutter: stable` (установлен в `_reset.scss`), который резервирует место под скроллбар всегда. Это означает:

- **Нет сдвига layout** при исчезновении скроллбара.
- **Не нужна компенсация `padding-right`** в современных браузерах.
- **Фиксированные элементы** (шапка, навигация) не требуют ручной корректировки.

Для старых браузеров, не поддерживающих `scrollbar-gutter`, автоматически применяется fallback `padding-right: var(--scrollbar-width)`.

---

## JavaScript API

### Авто-инициализация

```javascript
import { initModals } from './modules/modal/_index.js';

const modals = initModals(); // Возвращает Modal[]
```

Вызывается автоматически `App.init()` при наличии `[data-modal]` в DOM.

### Класс Modal

```javascript
import { Modal } from './modules/modal/_index.js';

const modal = new Modal(document.getElementById('my-modal'));
```

#### Опции конструктора

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `openClass` | `string` | `'is-open'` | CSS-класс при открытии |
| `closeOnOutsideClick` | `boolean` | `true` | Закрывать по клику на оверлей |
| `closeOnEscape` | `boolean` | `true` | Закрывать по Escape |
| `focusOnOpen` | `boolean` | `true` | Автофокус на первый фокусируемый элемент |
| `lockBodyScroll` | `boolean` | `true` | Блокировать скролл страницы |
| `history` | `boolean` | `true` | Включить интеграцию с History API |

#### Методы

| Метод | Возвращает | Описание |
|-------|------------|----------|
| `open(triggerElement?, opts?)` | `Modal` | Открыть модалку. `triggerElement` используется для возврата фокуса. |
| `close(opts?)` | `Modal` | Закрыть модалку и вернуть фокус. |
| `toggle(triggerElement?)` | `Modal` | Открыть, если закрыта; закрыть, если открыта. |
| `scheduleDelay(ms)` | `void` | Запланировать авто-открытие через N мс. |
| `cancelDelay()` | `void` | Отменить запланированную задержку. |
| `enableScrollTrigger(px)` | `void` | Включить открытие по скроллу. |
| `disableScrollTrigger()` | `void` | Отключить триггер по скроллу. |
| `enableExitIntent()` | `void` | Включить exit intent. |
| `disableExitIntent()` | `void` | Отключить exit intent. |
| `enableBeforeunload()` | `void` | Включить нативное предупреждение beforeunload. |
| `disableBeforeunload()` | `void` | Отключить обработчик beforeunload. |
| `destroy()` | `void` | Удалить все слушатели, закрыть если открыта, очистить. |

#### Объекты опций

```javascript
// Открыть без pushState в историю
modal.open(null, { skipHistory: true });

// Закрыть без вызова history.back()
modal.close({ skipHistory: true });
```

### Хелперы уровня модуля

```javascript
import { openModal, closeModal, getModals } from './modules/modal/_index.js';

openModal('my-modal');        // Открыть по ID
closeModal('my-modal');       // Закрыть по ID
closeModal();                 // Закрыть все открытые модалки
getModals();                  // Получить все инициализированные инстансы Modal
```

### Глобальное API (разработка)

```javascript
// После App.init()
window.CORE4.components.Modal;          // Класс Modal
window.CORE4.app.getModule('modals');   // Массив инстансов Modal
```

---

## Доступность

### ARIA-атрибуты (авто-генерация)

| Атрибут | Цель | Описание |
|---------|------|----------|
| `role="dialog"` | `.modal` | Объявляет элемент как диалог |
| `aria-modal="true"` | `.modal` | Указывает, что это модальный диалог |
| `aria-labelledby` | `.modal` | Ссылается на `.modal__title` (ID генерируется автоматически, если отсутствует) |
| `aria-hidden="true"` | Соседи body | Скрывает контент страницы от вспомогательных технологий пока модалка открыта |

### Клавиатурная навигация

| Клавиша | Действие |
|---------|----------|
| `Escape` | Закрыть верхнюю открытую модалку |
| `Tab` | Цикл фокуса внутри модалки (ловушка фокуса) |
| `Shift + Tab` | Цикл фокуса в обратном направлении |

### Управление фокусом

- При открытии: фокус переходит на **первый фокусируемый элемент** внутри модалки.
- При закрытии: фокус возвращается на **элемент, вызвавший открытие**.
- Фокус **захвачен** внутри модалки пока она открыта.

---

## Вложенные модалки

Несколько модалок могут быть открыты одновременно. Каждая новая получает более высокий `z-index`:

| Модалка | z-index |
|---------|---------|
| 1-я | 300 (базовый) |
| 2-я | 310 |
| 3-я | 320 |

Escape закрывает **верхнюю** модалку первой. Закрытие вложенной модалки восстанавливает её исходный z-index.

```html
<!-- Родительская модалка -->
<div id="parent" class="modal" data-modal>
  <div class="modal__content">
    <button data-modal-trigger="child">Открыть вложенную</button>
  </div>
</div>

<!-- Дочерняя модалка — автоматически z-index 310 при открытии поверх родителя -->
<div id="child" class="modal" data-modal>
  <div class="modal__content modal__content--sm">...</div>
</div>
```

---

## Интеграция с History API

По умолчанию открытие модалки добавляет запись в историю браузера. Это позволяет:

- **Кнопка «Назад»** → закрывает модалку.
- **Кнопка «Вперёд»** → снова открывает модалку.
- **Глубокие ссылки** — можно делиться URL с историей модалки (на основе state, не hash).

Запись в истории содержит:

```javascript
{ core4Modal: 'modal-id' }
```

Отключить для конкретной модалки:

```html
<div class="modal" data-modal data-modal-history="false">...</div>
```

---

## Свайп для закрытия

На сенсорных устройствах свайп **вниз** по оверлею или шапке закрывает модалку. Область скролла тела исключается, если тело не прокручено до самого верха.

| Жест | Цель | Результат |
|------|------|-----------|
| Свайп вниз | Оверлей / Шапка | Закрыть модалку |
| Свайп вниз | Тело (прокручено до верха) | Закрыть модалку |
| Свайп вниз | Тело (прокручено вниз) | Сначала прокрутить вверх |
| Горизонтальный свайп | Везде | Игнорируется |

Порог: **80px** вертикального перемещения.

---

## Примеры

### Базовая модалка с триггером

```html
<button class="btn btn--primary" data-modal-trigger="basic">Открыть модалку</button>

<div id="basic" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Привет</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Это базовая модалка с заголовком, телом и футером.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Закрыть</button>
    </div>
  </div>
</div>
```

### Диалог подтверждения

```html
<button class="btn btn--danger" data-modal-trigger="confirm">Удалить аккаунт</button>

<div id="confirm" class="modal" data-modal>
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Подтверждение удаления</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Вы уверены? Это действие необратимо.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Отмена</button>
      <button class="btn btn--danger">Удалить</button>
    </div>
  </div>
</div>
```

### Авто-открытие через 5 секунд (один раз)

```html
<div id="promo" class="modal" data-modal data-modal-delay="5000" data-modal-once="true">
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Специальное предложение</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Скидка 20% на первый заказ!</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--primary" data-modal-close>Понятно</button>
    </div>
  </div>
</div>
```

### Подписка по скроллу

```html
<div id="subscribe" class="modal" data-modal data-modal-scroll="500" data-modal-once="true">
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Подпишитесь</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Получайте лучшие материалы раз в неделю.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Нет, спасибо</button>
      <button class="btn btn--primary">Подписаться</button>
    </div>
  </div>
</div>
```

### Попап при попытке уйти

```html
<div id="exit" class="modal" data-modal data-modal-exit-intent="true" data-modal-once="true">
  <div class="modal__content modal__content--lg">
    <div class="modal__header">
      <h3 class="modal__title">Не уходите!</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>У нас есть эксклюзивное предложение только для вас.</p>
    </div>
  </div>
</div>
```

### Несколько триггеров для одной модалки

```html
<button class="btn" data-modal-trigger="contact">Контакты (в шапке)</button>
<a href="#" data-modal-trigger="contact">Контакты (в тексте)</a>
<button class="btn" data-modal-trigger="contact">Контакты (в футере)</button>

<div id="contact" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Связаться с нами</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Форма обратной связи...</p>
    </div>
  </div>
</div>
```

### Вложенные модалки

```html
<button class="btn" data-modal-trigger="parent">Открыть родителя</button>

<div id="parent" class="modal" data-modal>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Шаг 1</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Нажмите ниже, чтобы открыть модалку поверх этой.</p>
    </div>
    <div class="modal__footer">
      <button class="btn btn--primary" data-modal-trigger="child">Открыть дочернюю</button>
    </div>
  </div>
</div>

<div id="child" class="modal" data-modal>
  <div class="modal__content modal__content--sm">
    <div class="modal__header">
      <h3 class="modal__title">Шаг 2</h3>
      <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
    </div>
    <div class="modal__body">
      <p>Эта модалка поверх родительской (z-index 310).</p>
    </div>
  </div>
</div>
```

### Программное управление

```javascript
// Открыть / закрыть по ID
window.CORE4.components.modals.openModal('my-modal');
window.CORE4.components.modals.closeModal('my-modal');

// Закрыть все
window.CORE4.components.modals.closeModal();

// Получить все инстансы
const allModals = window.CORE4.components.modals.getModals();

// Ручная инициализация
const { Modal } = window.CORE4.components;
const modal = new Modal(document.getElementById('dynamic-modal'));
modal.open();
```

---

**Автор:** Георгий Киосов | **Лицензия:** MIT
