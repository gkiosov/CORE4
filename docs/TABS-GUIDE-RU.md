# 📘 Руководство по компоненту Tabs

> **Версия:** 0.1.0 Draft | **Обновлено:** Август 2026

---

## 📋 Содержание

1. [Обзор](#обзор)
2. [HTML-структура](#html-структура)
3. [Data-атрибуты](#data-атрибуты)
4. [CSS-варианты](#css-варианты)
5. [JavaScript API](#javascript-api)
6. [Доступность](#доступность)
7. [Клавиатурная навигация](#клавиатурная-навигация)
8. [Анимации](#анимации)
9. [Синхронизация с хешем URL](#синхронизация-с-хешем-url)
10. [History API](#history-api)
11. [Персистентность](#персистентность)
12. [Ленивая загрузка](#ленивая-загрузка)
13. [Стрелки скролла](#стрелки-скролла)
14. [Свайп тачем](#свайп-тачем)
15. [Отключённые табы](#отключённые-табы)
16. [Вложенные табы](#вложенные-табы)
17. [Примеры](#примеры)

---

## Обзор

Компонент Tabs предоставляет доступный, анимированный интерфейс вкладок с несколькими визуальными вариантами:

- **Underline** — скользящий индикатор снизу (по умолчанию)
- **Pill** — закруглённые капсулы с solid-фоном активного таба
- **Segmented** — единый контейнер с выдвижной активной пилюлей
- **Vertical** — боковая навигация, на мобильных сворачивается в горизонтальные

Дополнительные возможности:

- **Скользящий индикатор** — анимированный через `transform`, плавно перемещается между табами
- **Анимации панелей** — fade или slide-переходы между контентом
- **Auto-height** — контейнер плавно подстраивает высоту под активную панель
- **Синхронизация с хешем URL** — активный таб отражается в `#hash`
- **History API** — кнопки Назад/Вперёд переключают табы
- **Персистентность** — запоминает активный таб в `sessionStorage`
- **Ленивая загрузка** — контент панели загружается только при первой активации
- **Overflow-выпадашка** — не влезающие табы прячутся в меню "Ещё" (⋯)
- **Свайп тачем** — свайп влево/вправо переключает табы на мобильных
- **Отключённые табы** — пропускаются при навигации, визуально затемнены
- **Вложенные табы** — полностью изолированные инстансы с независимым состоянием

Модуль **лениво загружается** — JS-чанк подгружается только если в DOM есть элементы `[data-tabs]`.

---

## HTML-структура

```html
<div class="tabs" data-tabs data-tabs-variant="underline">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="panel-1">Таб 1</button>
    <button class="tabs__trigger" data-tabs-trigger="panel-2">Таб 2</button>
    <button class="tabs__trigger" data-tabs-trigger="panel-3">Таб 3</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="panel-1">Контент 1</div>
    <div class="tabs__panel" data-tabs-panel="panel-2">Контент 2</div>
    <div class="tabs__panel" data-tabs-panel="panel-3">Контент 3</div>
  </div>
</div>
```

### Элементы

| Элемент | Класс | Обязательный | Описание |
|---------|-------|--------------|----------|
| Корень | `.tabs` | Да | Контейнер. Должен иметь `data-tabs` для авто-инициализации. |
| Список | `.tabs__list` | Да | `role="tablist"`. Оборачивает все триггеры. Может авто-создаваться. |
| Триггер | `.tabs__trigger` | Да | `role="tab"`. Активирует соответствующую панель. |
| Обертка панелей | `.tabs__panels` | Нет | Опциональная обертка для позиционирования панелей. |
| Панель | `.tabs__panel` | Да | `role="tabpanel"`. Контент каждого таба. |

### Привязка триггера к панели

Триггеры и панели сопоставляются по значению `data-tabs-trigger` и `data-tabs-panel`:

```html
<button data-tabs-trigger="settings">Настройки</button>
<div data-tabs-panel="settings">Контент настроек...</div>
```

Можно также использовать `href="#id"` на якорях:

```html
<a class="tabs__trigger" href="#settings" data-tabs-trigger="settings">Настройки</a>
```

---

## Data-атрибуты

### `data-tabs`

Обязателен на корневом элементе `.tabs`. Включает авто-инициализацию.

```html
<div class="tabs" data-tabs>...</div>
```

### `data-tabs-variant`

Задаёт визуальный вариант. Один из: `underline` (по умолчанию), `pill`, `segmented`, `vertical`.

```html
<div class="tabs" data-tabs data-tabs-variant="pill">...</div>
```

### `data-tabs-animation`

Тип перехода панелей. Один из: `fade`, `slide`, `none` (по умолчанию).

```html
<div class="tabs" data-tabs data-tabs-animation="fade">...</div>
```

### `data-tabs-hash`

Включает синхронизацию с хешем URL. ID активного таба добавляется к URL как `#hash`.

```html
<div class="tabs" data-tabs data-tabs-hash>...</div>
```

### `data-tabs-history`

Включает интеграцию с History API. В сочетании с `data-tabs-hash` открытие таба пушит состояние истории, а кнопки Назад/Вперёд переключают табы.

Включено по умолчанию при наличии `data-tabs-hash`. Чтобы отключить:

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history="false">...</div>
```

### `data-tabs-persist`

Запоминает индекс активного таба в `sessionStorage`. При перезагрузке страницы восстанавливается выбор.

```html
<div class="tabs" data-tabs data-tabs-persist>...</div>
```

### `data-tabs-lazy`

Откладывает инициализацию панелей. Панели с `data-tabs-lazy-loaded="false"` рендерят контент только при первой активации. Используйте `data-tabs-lazy-src` на панели для загрузки контента через AJAX.

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/api/content/remote">
    <!-- Загрузится при первой активации -->
  </div>
</div>
```

### `data-tabs-auto-height`

Анимирует высоту контейнера панелей под высоту активной панели.

```html
<div class="tabs" data-tabs data-tabs-auto-height>...</div>
```

### `data-tabs-scroll-arrows`

Когда список табов шире контейнера, появляются кнопки-стрелки ‹ › для горизонтального скролла. На тач-устройствах стрелки скрыты — работает нативный свайп.

```html
<div class="tabs" data-tabs data-tabs-overflow="dropdown">...</div>
```

### `data-tabs-disabled="true"` / `disabled`

Помечает таб как отключённый. Отключённые табы пропускаются при клавиатурной навигации, не кликаются и получают `aria-disabled="true"`.

```html
<button class="tabs__trigger" data-tabs-trigger="premium" disabled>Premium</button>
<!-- или -->
<button class="tabs__trigger" data-tabs-trigger="premium" data-tabs-disabled="true">Premium</button>
```

---

## CSS-варианты

### Underline (по умолчанию)

```html
<div class="tabs tabs--underline" data-tabs>...</div>
```

- Нижняя граница у списка
- Скользящий индикатор-линия (2px) под активным табом
- Индикатор использует `transform: translateX()` для GPU-ускоренной анимации

### Pill

```html
<div class="tabs tabs--pill" data-tabs data-tabs-variant="pill">...</div>
```

- Закруглённые кнопки-капсулы (`border-radius: 9999px`)
- Активный таб имеет сплошной фон (`--tabs-active-bg`)
- Скользящий индикатор отсутствует — смена фона мгновенная

### Segmented

```html
<div class="tabs tabs--segmented" data-tabs data-tabs-variant="segmented">...</div>
```

- Единый фон-контейнер с padding
- Скользящий индикатор — сплошная пилюля, скользящая позади активного таба
- У индикатора есть `box-shadow` для эффекта подъёма
- Цвет текста активного таба меняется при движении индикатора

### Vertical

```html
<div class="tabs tabs--vertical" data-tabs data-tabs-variant="vertical">...</div>
```

- Расположение бок о бок: список табов слева, панели справа
- Скользящий индикатор — вертикальная линия 3px у левого края
- На мобильных (`< md`) сворачивается в горизонтальные underline-табы
- На `tablist` выставляется `aria-orientation="vertical"`

---

## JavaScript API

### Авто-инициализация

```javascript
import { initTabs } from './modules/tabs/_index.js';

const tabs = initTabs(); // Возвращает Tabs[]
```

Вызывается автоматически `App.init()` при наличии элементов `[data-tabs]` в DOM.

### Класс Tabs

```javascript
import { Tabs } from './modules/tabs/_tabs.js';

const tabs = new Tabs(document.getElementById('my-tabs'));
```

#### Опции конструктора

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `variant` | `string` | `'underline'` | Визуальный вариант |
| `animation` | `string` | `'none'` | Переход панелей: `fade`, `slide`, `none` |
| `lazy` | `boolean` | `false` | Ленивая загрузка контента панелей |
| `hash` | `boolean` | `false` | Синхронизация с хешем URL |
| `history` | `boolean` | `true` | Пушить состояние истории (требует `hash`) |
| `persist` | `boolean` | `false` | Запоминать в `sessionStorage` |
| `autoHeight` | `boolean` | `false` | Анимировать высоту контейнера |
| `openClass` | `string` | `'is-active'` | CSS-класс активного состояния |
| `disabledClass` | `string` | `'is-disabled'` | CSS-класс отключённого состояния |

#### Методы

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `activate(index, opts?)` | `void` | Активировать таб по индексу. `opts.silent`, `opts.skipHistory`, `opts.skipHash`, `opts.skipPersist` |
| `next()` | `void` | Активировать следующий неотключённый таб |
| `prev()` | `void` | Активировать предыдущий неотключённый таб |
| `disable(index)` | `void` | Отключить таб по индексу |
| `enable(index)` | `void` | Включить таб по индексу |
| `destroy()` | `void` | Удалить слушатели, очистить обсерверы, сбросить ARIA |

#### Геттеры

| Геттер | Тип | Описание |
|--------|-----|----------|
| `active` | `number` | Индекс текущего активного таба |
| `count` | `number` | Общее количество табов |

### Модульные хелперы

```javascript
import { activateTab, getTabs, getTabInstance } from './modules/tabs/_index.js';

activateTab('my-tabs', 2);           // Активировать таб с индексом 2 по ID контейнера
getTabs();                           // Получить все инстансы Tabs
getTabInstance('my-tabs');           // Получить инстанс по ID или элементу
```

### Глобальное API (development)

```javascript
// После App.init()
window.CORE4.components.Tabs;        // Класс Tabs
window.CORE4.app.getModule('tabs');  // Массив инстансов Tabs
```

---

## Доступность

### ARIA-атрибуты (авто-генерируемые)

| Атрибут | Цель | Описание |
|---------|------|----------|
| `role="tablist"` | `.tabs__list` | Объявляет контейнер табов |
| `role="tab"` | `.tabs__trigger` | Каждый таб — это tab |
| `role="tabpanel"` | `.tabs__panel` | Каждая панель — это tabpanel |
| `aria-selected="true/false"` | `.tabs__trigger` | Активное состояние |
| `aria-controls="panel-id"` | `.tabs__trigger` | Связь таба с панелью |
| `aria-labelledby="tab-id"` | `.tabs__panel` | Связь панели с табом |
| `aria-orientation="vertical"` | `.tabs__list` | Для вертикального варианта |
| `aria-disabled="true"` | `.tabs__trigger` | Для отключённых табов |
| `tabindex="0"` | активный таб | Фокусируемый |
| `tabindex="-1"` | неактивные табы | Фокусируемы только программно |
| `hidden` / `inert` | неактивные панели | Скрыты от AT и таб-ордера |

### Управление фокусом

- Фокус перемещается на активный таб при активации через клавиатуру.
- Нажатие `Tab` из списка табов переводит фокус **в активную панель**, а не на следующий таб.
- Фокус никогда не ловится — пользователи могут естественно табом выйти из компонента.

---

## Клавиатурная навигация

| Клавиша | Действие |
|---------|----------|
| `←` (гориз.) / `↑` (верт.) | Предыдущий неотключённый таб |
| `→` (гориз.) / `↓` (верт.) | Следующий неотключённый таб |
| `Home` | Первый неотключённый таб |
| `End` | Последний неотключённый таб |
| `Enter` / `Space` | Активировать сфокусированный таб |
| `Tab` | Переместить фокус из списка табов в активную панель |

Отключённые табы автоматически пропускаются при стрелочной навигации.

---

## Анимации

### Переходы панелей

Задаются через `data-tabs-animation` или опцию конструктора.

#### Fade

```html
<div data-tabs data-tabs-animation="fade">
```

- Активная панель появляется с fade-in + сдвиг вверх на 4px
- Предыдущая панель исчезает с fade-out + сдвиг вверх на -4px (absolute positioning)
- Длительность: 350ms / 200ms

#### Slide

```html
<div data-tabs data-tabs-animation="slide">
```

- Активная панель выезжает из направления навигации
- Движение вправо → выезд справа
- Движение влево → выезд слева
- Длительность: 350ms

#### None

Мгновенное переключение, без анимации. Автоматически учитывает `prefers-reduced-motion`.

### Скользящий индикатор

Индикатор underline/segmented использует:

```css
transition: transform 0.35s ease, width 0.35s ease, height 0.35s ease;
```

Это гарантирует GPU-ускоренную анимацию без layout thrashing. При `prefers-reduced-motion: reduce` переходы отключаются.

### Auto-height

При включённом `data-tabs-auto-height` обёртка панелей анимирует свойство `height` под высоту активной панели:

```css
transition: height 0.35s ease;
```

---

## Синхронизация с хешем URL

Включается через `data-tabs-hash`:

```html
<div class="tabs" data-tabs data-tabs-hash>
  <button data-tabs-trigger="settings">Настройки</button>
  <div data-tabs-panel="settings">...</div>
</div>
```

При активации таба "Настройки" URL становится:

```
https://example.com/page#settings
```

При загрузке страницы, если URL содержит `#settings`, этот таб активируется автоматически. Это позволяет делать **прямые ссылки** на конкретные табы.

---

## History API

Включается через `data-tabs-hash` (history включён по умолчанию при наличии hash):

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history>
  ...
</div>
```

Поведение:

- Открытие таба **пушит** состояние истории: `{ core4Tabs: 'tabs-id', index: N }`
- Кнопка браузера **Назад** → переход к предыдущему табу
- Кнопка браузера **Вперёд** → переход к следующему табу
- Хеш URL обновляется через `history.pushState`

Отключить для конкретного инстанса:

```html
<div class="tabs" data-tabs data-tabs-hash data-tabs-history="false">
```

---

## Персистентность

Включается через `data-tabs-persist`:

```html
<div class="tabs" data-tabs data-tabs-persist>
  ...
</div>
```

Индекс активного таба сохраняется в `sessionStorage` под ключом `core4-tabs-{id}`. При перезагрузке страницы:

1. Если в URL есть хеш → хеш имеет приоритет
2. Иначе если `sessionStorage` содержит сохранённый индекс → восстанавливается
3. Иначе → fallback на первый неотключённый таб

`sessionStorage` ограничен вкладкой/окном и очищается при закрытии сессии.

---

## Ленивая загрузка

Включается через `data-tabs-lazy`:

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/api/tab-content">
    <!-- Контент загрузится через fetch() при первой активации -->
  </div>
</div>
```

Поведение:

- При первой активации панели URL из `data-tabs-lazy-src` фетчится
- HTML ответа инжектируется в панель
- `data-tabs-lazy-loaded` устанавливается в `"true"`
- На корневом элементе диспатчится событие `tabs:loaded`

Если `data-tabs-lazy-src` не указан, панель просто помечается загруженной без сетевого запроса (полезно для отложенной инициализации JS внутри панелей).

---

## Стрелки скролла

Включается через `data-tabs-scroll-arrows`:

```html
<div class="tabs" data-tabs data-tabs-scroll-arrows>
  <div class="tabs__list" data-tabs-list>
    <button data-tabs-trigger="tab1">Таб 1</button>
    <button data-tabs-trigger="tab2">Таб 2</button>
    <!-- ...много табов... -->
  </div>
</div>
```

Поведение:

- Когда список табов шире контейнера, по бокам появляются кнопки-стрелки `‹` и `›`
- Клик по стрелке плавно скроллит список на 75% видимой ширины
- Стрелки автоматически показываются/скрываются в зависимости от позиции скролла
- На тач-устройствах (`hover: none` и `pointer: coarse`) стрелки скрыты — пользователи свайпают нативно
- Активный таб автоматически скроллится в видимую область при активации через клавиатуру или программно

---

## Свайп тачем

На тач-устройствах горизонтальный свайп по панелям переключает табы:

| Жест | Результат |
|------|-----------|
| Свайп влево | Следующий таб |
| Свайп вправо | Предыдущий таб |
| Вертикальный скролл | Игнорируется (панели скроллятся нормально) |

Порог: **50px** горизонтального движения.

Обработчик свайпа проверяет, не доминирует ли вертикальное движение, и прерывается, чтобы не мешать нормальному скроллу страницы.

---

## Отключённые табы

Пометьте таб как отключённый через атрибут `disabled` или `data-tabs-disabled="true"`:

```html
<button class="tabs__trigger" data-tabs-trigger="premium" disabled>Premium</button>
```

Эффекты:

- `aria-disabled="true"` и `tabindex="-1"`
- Класс `.is-disabled` для стилизации
- Пропускаются при стрелочной навигации
- Клик-события не навешиваются
- Если активный таб становится отключённым, фокус переходит на следующий доступный таб

---

## Вложенные табы

Табы можно вкладывать друг в друга. Каждый инстанс полностью изолирован:

```html
<div class="tabs" data-tabs data-tabs-variant="underline">
  <div class="tabs__list" data-tabs-list>
    <button data-tabs-trigger="products">Продукты</button>
    <button data-tabs-trigger="services">Услуги</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="products">
      <!-- Вложенные табы -->
      <div class="tabs" data-tabs data-tabs-variant="pill">
        <div class="tabs__list" data-tabs-list>
          <button data-tabs-trigger="electronics">Электроника</button>
          <button data-tabs-trigger="clothing">Одежда</button>
        </div>
        <div class="tabs__panels">
          <div class="tabs__panel" data-tabs-panel="electronics">...</div>
          <div class="tabs__panel" data-tabs-panel="clothing">...</div>
        </div>
      </div>
    </div>
    <div class="tabs__panel" data-tabs-panel="services">...</div>
  </div>
</div>
```

Каждый инстанс:
- Имеет своё состояние, слушатели событий и обсерверы
- Получает независимые ARIA-атрибуты
- Может использовать разные варианты и опции
- Очищается независимо при `destroy()`

---

## Примеры

### Базовые underline-табы

```html
<div class="tabs" data-tabs>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="account">Аккаунт</button>
    <button class="tabs__trigger" data-tabs-trigger="security">Безопасность</button>
    <button class="tabs__trigger" data-tabs-trigger="billing">Оплата</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="account">
      <p>Управление настройками аккаунта.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="security">
      <p>Обновление пароля и 2FA.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="billing">
      <p>Просмотр счетов и способов оплаты.</p>
    </div>
  </div>
</div>
```

### Pill-табы с fade-анимацией

```html
<div class="tabs" data-tabs data-tabs-variant="pill" data-tabs-animation="fade">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="all">Все</button>
    <button class="tabs__trigger" data-tabs-trigger="active">Активные</button>
    <button class="tabs__trigger" data-tabs-trigger="archived">Архив</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="all">Все элементы</div>
    <div class="tabs__panel" data-tabs-panel="active">Активные элементы</div>
    <div class="tabs__panel" data-tabs-panel="archived">Архивные элементы</div>
  </div>
</div>
```

### Вертикальные табы настроек

```html
<div class="tabs" data-tabs data-tabs-variant="vertical">
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="general">Общие</button>
    <button class="tabs__trigger" data-tabs-trigger="appearance">Внешний вид</button>
    <button class="tabs__trigger" data-tabs-trigger="advanced">Расширенные</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="general">Общие настройки...</div>
    <div class="tabs__panel" data-tabs-panel="appearance">Настройки темы...</div>
    <div class="tabs__panel" data-tabs-panel="advanced">Расширенные опции...</div>
  </div>
</div>
```

### Документационные табы с хешем

```html
<div class="tabs" id="docs-tabs" data-tabs data-tabs-variant="underline"
     data-tabs-hash data-tabs-history data-tabs-persist>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="getting-started">Быстрый старт</button>
    <button class="tabs__trigger" data-tabs-trigger="api">API</button>
    <button class="tabs__trigger" data-tabs-trigger="examples">Примеры</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="getting-started">...</div>
    <div class="tabs__panel" data-tabs-panel="api">...</div>
    <div class="tabs__panel" data-tabs-panel="examples">...</div>
  </div>
</div>
```

### Ленивая загрузка удалённого контента

```html
<div class="tabs" data-tabs data-tabs-lazy>
  <div class="tabs__list" data-tabs-list>
    <button class="tabs__trigger" data-tabs-trigger="local">Локальный</button>
    <button class="tabs__trigger" data-tabs-trigger="remote">Удалённый</button>
  </div>
  <div class="tabs__panels">
    <div class="tabs__panel" data-tabs-panel="local">
      <p>Этот контент сразу в DOM.</p>
    </div>
    <div class="tabs__panel" data-tabs-panel="remote" data-tabs-lazy-src="/partials/remote-content.html">
      <!-- Загрузится через fetch() при первой активации -->
    </div>
  </div>
</div>
```

### Программное управление

```javascript
// Активировать таб по индексу
const tabs = window.CORE4.app.getModule('tabs')[0];
tabs.activate(2);

// Навигация программно
tabs.next();
tabs.prev();

// Отключить/включить
tabs.disable(1);
tabs.enable(1);

// По ID контейнера
import { activateTab } from './modules/tabs/_index.js';
activateTab('docs-tabs', 1);

// Слушать события
document.getElementById('docs-tabs').addEventListener('tabs:changed', (e) => {
  console.log('Активный индекс:', e.detail.index);
  console.log('Предыдущий индекс:', e.detail.previousIndex);
});
```

---

**Автор:** George Kiosov | **Лицензия:** MIT
