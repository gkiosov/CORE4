# Руководство по тестам CORE4

> **Версия:** 0.2.0 Draft  
> **Обновлено:** Август 2026  
> **Тест-раннер:** Jest  
> **Окружение:** jsdom

---

## Содержание

1. [Обзор](#обзор)
2. [Архитектура тестов](#архитектура-тестов)
3. [Запуск тестов](#запуск-тестов)
4. [Структура файлов](#структура-файлов)
5. [Справочник по тестовым файлам](#справочник-по-тестовым-файлам)
6. [Конфигурация](#конфигурация)
7. [Написание новых тестов](#написание-новых-тестов)
8. [Карта покрытия](#карта-покрытия)

---

## Обзор

CORE4 использует **Jest** в качестве тест-раннера с окружением **jsdom** для симуляции DOM. Все тесты расположены в `source/js/__tests__/` и следуют плоской структуре: один тестовый файл на модуль или слой.

Тестовый набор покрывает:
- **Ядро (Core)** — конфигурацию, хелперы, менеджер событий
- **Утилиты (Utilities)** — DOM-хелперы, клавиатура, ловушка фокуса, viewport
- **Компоненты (Modules)** — Modal, Accordion, Dropdown, Tabs, Theme, Button, Form (с Wizard, DraftSaver, PasswordStrength)
- **Оркестратор приложения** — App из `main.js`

Каждый тестовый файл самодостаточен: сам настраивает DOM, выполняет проверки и очищается после себя.

---

## Архитектура тестов

### Принципы

1. **Изоляция** — каждый тест получает чистый `document.body.innerHTML = ''` в `beforeEach`.
2. **Без сайд-эффектов** — тесты никогда не мутируют глобальное состояние навсегда.
3. **Событийные проверки** — где компоненты диспатчат кастомные события (`EventManager`), тесты слушают эти события вместо инспекции внутреннего состояния.
4. **Accessibility-first** — ARIA-атрибуты, роли и клавиатурная навигация всегда проверяются.
5. **Покрытие жизненного цикла** — каждый класс компонента тестируется через `init` → `использование` → `destroy`.

### Стратегия мокирования

| Что | Как |
|-----|-----|
| `window.matchMedia` | Мокается в `theme.test.js` для `prefers-color-scheme` |
| `localStorage` / `sessionStorage` | Очищается в `beforeEach`; используется реальный API хранилища |
| `history.pushState` / `popstate` | Мокается через API истории `jsdom` |
| `ResizeObserver` | Мокается как no-op-класс, если недоступен в jsdom |
| `fetch` | Мокается через `jest.fn()` в асинхронных тестах формы |
| `setTimeout` / `debounce` | Контролируется через `jest.useFakeTimers()` |
| Динамический `import()` | Не тестируется напрямую; покрывается индивидуальными тестами модулей |
| `window.CORE4` | Проверяется в `app.test.js` |

---

## Запуск тестов

```bash
# Запустить все тесты один раз
npm run test

# Запустить в режиме наблюдения (перезапуск при изменении файлов)
npm run test:watch

# Запустить один файл
npx jest source/js/__tests__/modal.test.js

# Запустить с отчётом о покрытии
npx jest --coverage

# Запустить тесты по паттерну
npx jest --testNamePattern="открывается"
```

---

## Структура файлов

```
core4/
├── source/
│   └── js/
│       ├── __tests__/
│       │   ├── core.test.js              # Конфиг, хелперы, события
│       │   ├── utilities.test.js         # DOM, клавиатура, фокус, viewport
│       │   ├── modal.test.js             # Компонент Modal
│       │   ├── accordion.test.js         # Компонент Accordion
│       │   ├── dropdown.test.js          # Компонент Dropdown
│       │   ├── tabs.test.js              # Компонент Tabs
│       │   ├── theme.test.js             # ThemeManager
│       │   ├── button.test.js            # Button async / toggle
│       │   ├── form.test.js              # Form, Wizard, DraftSaver, PasswordStrength
│       │   ├── form-extended.test.js     # Асинхронная валидация, загрузка файлов, drag & drop, счётчики, группы
│       │   └── app.test.js               # Оркестратор App из main.js
│       ├── core/
│       ├── utilities/
│       ├── modules/
│       └── main.js
├── docs/
│   ├── TEST-GUIDE.md
│   └── TEST-GUIDE-RU.md
├── jest.setup.js
└── package.json
```

---

## Справочник по тестовым файлам

### `core.test.js`

Тестирует фундаментальный слой CORE4.

| Тестовый набор | Что покрывает |
|---------------|---------------|
| `CONFIG` | Все экспортированные константы: `PREFIX`, `STATE`, `ATTR`, `SELECTORS`, `KEYBOARD`, `ANIMATION`, `THEME_KEY` |
| `isElement` | `true` для DOM-элементов, `false` для примитивов, массивов, null |
| `isVisible` | Проверяет `display:none`, `visibility:hidden`, `opacity:0`, нулевые размеры |
| `generateId` | Поддержка префикса, уникальность, fallback при недоступности `crypto.randomUUID` |
| `debounce` | Задержка таймера, множественные быстрые вызовы схлопываются в один, дефолт 300 мс |
| `throttle` | Ограничение частоты вызовов, пропуск промежуточных |
| `deepClone` | Вложенные объекты, массивы, null, примитивы; независимость от оригинала |
| `isPlainObject` | Различает `{}` от `[]`, `null`, `Date` |
| `getNestedValue` | Пути через точку, массивы путей, fallback-значения, безопасность null |
| `EventManager` | `dispatch` с payload, `on` с функцией отписки, `once` с автоудалением |

### `utilities.test.js`

Тестирует низкоуровневые DOM- и интерактивные утилиты.

| Тестовый набор | Что покрывает |
|---------------|---------------|
| `qs` / `qsa` | Безопасный поиск, обработка пустого селектора, возврат массива |
| `createElement` | Тег, классы, атрибуты, текстовые и элементные дети |
| `addClass` / `removeClass` / `toggleClass` | Один и несколько классов, условный toggle, безопасность null |
| `setAttr` / `getAttr` / `removeAttr` | CRUD-операции, безопасность null |
| `Keyboard` | `isEscape`, `isEnter`, `isTab`, `isArrow` для всех стрелок |
| `FocusTrap` | Поиск фокусируемых элементов, `activate`/`deactivate`, восстановление фокуса, цикл `Tab` на границах, обратный цикл `Shift+Tab` |
| `isInViewport` | Видимые элементы, безопасность null |
| `onViewportEnter` | Возвращает экземпляр `IntersectionObserver` |

### `modal.test.js`

Тестирует самый сложный компонент в CORE4.

| # | Тест | Утверждение |
|---|------|-------------|
| 1 | `.open()` добавляет `is-open` | `classList.contains('is-open')` |
| 2 | `.close()` убирает `is-open` | `classList.contains('is-open')` is `false` |
| 3 | Клик по кнопке закрытия | Модалка закрывается |
| 4 | Клавиша `Escape` | Модалка закрывается |
| 5 | Клик снаружи (оверлей) | Модалка закрывается |
| 6 | Клик по контенту | Модалка **НЕ** закрывается |
| 7 | ARIA `role="dialog"` и `aria-modal="true"` | Устанавливаются при инициализации |
| 8 | Автогенерация `id` | Непустая строка при отсутствии id |
| 9 | `aria-labelledby` из `.modal__title` | Указывает на элемент заголовка |
| 10 | Активация ловушки фокуса | `focusTrap` truthy после открытия |
| 11 | `.toggle()` | Переключает состояние `isOpen` |
| 12 | Двойной `.open()` | `Modal.openCount` остаётся 1 |
| 13 | Двойной `.close()` | Без ошибки, остаётся закрытой |
| 14 | `.destroy()` | Очищает все слушатели |
| 15 | `scheduleDelay()` | Открывается через N мс (fake timers) |
| 16 | `cancelDelay()` | Отменяет запланированное открытие |
| 17 | `data-modal-once` | Блокирует повторное открытие |
| 18 | Вложенные z-index | Вторая модалка получает больший `z-index` |
| 19 | Событие `modal:opened` | Диспатчится с `{ trigger, modal }` |
| 20 | Событие `modal:closed` | Диспатчится с `{ modal }` |
| 21 | Блокировка скролла | `is-locked` на `<html>` и `<body>` |
| 22 | Разблокировка скролла | `is-locked` убирается при закрытии |
| 23 | `aria-hidden` соседей | Соседи скрываются при открытии |
| 24 | Восстановление соседей | Соседи восстанавливаются при закрытии |
| 25 | Возврат фокуса на триггер | `document.activeElement` — триггер после закрытия |

### `accordion.test.js`

| Тестовый набор | Что покрывает |
|---------------|---------------|
| Инициализация | Правильное количество элементов, связка header/content |
| ARIA | `aria-expanded="false"`, `aria-controls` на заголовках |
| `open()` | Добавляет класс открытия, обновляет `aria-expanded` |
| `close()` | Убирает класс, обновляет `aria-expanded` |
| `toggle()` | Переключает состояние |
| Single-режим | Открытие одного закрывает остальные |
| Multiple-режим | `data-accordion-multiple="true"` держит несколько открытыми |
| `expandAll()` | Все панели открыты, все `aria-expanded="true"` |
| `collapseAll()` | Все панели закрыты, мгновенно или с анимацией |
| Обработчик клика | Клик по заголовку переключает панель |
| Клавиша Enter | `keydown` с `Enter` переключает панель |
| `destroy()` | Удаляет все слушатели, очищает items |
| `initAccordions()` | Возвращает массив экземпляров |

### `dropdown.test.js`

| Тестовый набор | Что покрывает |
|---------------|---------------|
| Инициализация | Триггер, меню, поиск пунктов |
| ARIA | `aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"`, `role="menuitem"` |
| `open()` / `close()` / `toggle()` | Управление классами и состоянием |
| Клик снаружи | Закрытие по клику на документ |
| `Escape` | Закрытие и возврат фокуса на триггер |
| `ArrowDown` на триггере | Открывает меню и фокусирует первый пункт |
| `ArrowDown` в меню | Перемещает фокус на следующий пункт |
| `ArrowUp` в меню | Цикл на последний пункт |
| `Home` в меню | Фокус на первый пункт |
| `End` в меню | Фокус на последний пункт |
| Клик по пункту | Диспатчит `dropdown:select` с `{ item, index }` |
| `destroy()` | Удаляет все слушатели |
| `initDropdowns()` | Возвращает массив экземпляров |

### `tabs.test.js`

| Тестовый набор | Что покрывает |
|---------------|---------------|
| Инициализация | Связка trigger/panel, активный индекс 0 |
| ARIA | `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, `aria-labelledby` |
| `activate()` | Переключение активной вкладки, `hidden`/`inert` на панелях |
| `disable()` / `enable()` | `aria-disabled`, `tabindex`, переключение классов |
| `next()` / `prev()` | Навигация с пропуском disabled |
| Событие `tabs:changed` | Диспатчится с `{ index, previousIndex, trigger, panel }` |
| Обработчик клика | Клик по триггеру активирует вкладку |
| Клавиша Enter | `keydown` с `Enter` активирует вкладку |
| `destroy()` | Удаляет слушатели, классы, ARIA-атрибуты |
| `initTabs()` | Возвращает массив экземпляров |

### `theme.test.js`

| Тестовый набор | Что покрывает |
|---------------|---------------|
| По умолчанию | Применяет системную тему (dark или light) |
| `apply('dark')` | Устанавливает `data-theme="dark"`, добавляет `.dark` |
| `apply('light')` | Устанавливает `data-theme="light"`, добавляет `.light` |
| `toggle()` | Переключает между dark и light |
| `reset()` | Возвращает к системным предпочтениям |
| Персистентность | Чтение/запись `localStorage` |
| Событие `theme:changed` | Диспатчится с `{ effective, choice, isDark, isSystem }` |
| Геттеры | `isDark`, `isLight`, `choice`, `effective` |
| `set()` | Алиас для `apply()` |

### `button.test.js`

| Тестовый набор | Что покрывает |
|---------------|---------------|
| Тип по умолчанию | `type === 'default'`, сохранение исходного текста |
| Асинхронный клик | `preventDefault`, `isProcessing`, `aria-busy`, `disabled`, событие `button:click` |
| `setSuccess()` | Убирает loading, добавляет success-класс |
| `setError()` | Убирает loading, добавляет error-класс, кастомный текст |
| `reset()` | Очищает все состояния, восстанавливает текст, убирает `disabled` |
| Toggle | `aria-pressed`, `is-active`, событие `button:toggle` |
| Принудительный toggle | `toggle(true)` / `toggle(false)` |
| Клик default-кнопки | Диспатчит `button:click` |
| Блокировка во время processing | `preventDefault` + `stopPropagation` при загрузке |
| `setText()` / `setHTML()` | Мутация контента |
| `scheduleReset()` | Авто-сброс после `resetDelay` (fake timers) |

### `form.test.js`

Тестирует четыре класса: `Form`, `Wizard`, `DraftSaver`, `PasswordStrength`.

#### Form

| Тест | Что покрывает |
|------|---------------|
| Инициализация полей | Находит 3 поля из DOM |
| Валидация required | Пустое значение → класс `is-invalid` |
| Валидация email | Неверный формат отклоняется, верный — принимается |
| Валидация min | `data-validate-min="18"` отклоняет 10 |
| Валидация number | Отклоняет нечисловой ввод |
| Вся форма валидна | Все поля заполнены → `validateForm()` возвращает `true` |
| Вся форма невалидна | Пустая форма → `validateForm()` возвращает `false` |
| `reset()` | Очищает все классы валидации |
| `getData()` | Возвращает объект со значениями полей |
| Событие `form:initialized` | Диспатчится при инициализации |
| `destroy()` | Удаляет слушатели, очищает поля |

#### Wizard

| Тест | Что покрывает |
|------|---------------|
| Инициализация шагов | 3 шага, current = 0 |
| `next()` | Продвигается после валидации |
| `prev()` | Возвращается назад |
| `goToStep()` | Прыгает на конкретный индекс |
| `getTotalSteps()` | Возвращает количество |
| `destroy()` | Удаляет слушатели |

#### DraftSaver

| Тест | Что покрывает |
|------|---------------|
| `save()` | Сериализует форму в `localStorage` |
| `clear()` | Удаляет ключ из `localStorage` |
| `getDraftAge()` | Возвращает возраст в мс |
| `destroy()` | Удаляет слушатели |

#### PasswordStrength

| Тест | Что покрывает |
|------|---------------|
| Пустой пароль | Score = 0 |
| Слабый пароль | Низкий score |
| Сильный пароль | Высокий score |
| Распространённые паттерны | Штрафует "password", "123" и т.д. |
| Последовательные символы | Штрафует "abc", "123" |
| Повторяющиеся символы | Штрафует "aaa" |
| `dataset.strengthScore` | Сохраняется на поле после ввода |
| Событие `password:strength` | Диспатчится с `{ score, feedback, rules }` |
| `destroy()` | Удаляет слушатель ввода |

### `form-extended.test.js`

Расширяет покрытие формы продвинутыми функциями.

#### Асинхронная валидация

| Тест | Что покрывает |
|------|---------------|
| Вызывает fetch при наличии async-правила | `data-validate-async` инициирует HTTP-запрос |
| Показывает ошибку при невалидном ответе | Ответ `{ valid: false }` → `is-invalid` |
| Пропускает async ниже minlength | Порог `data-validate-async-minlength` |
| Прерывает предыдущий запрос | Быстрый ввод отменяет предыдущий fetch через `AbortController` |

#### Загрузка файлов

| Тест | Что покрывает |
|------|---------------|
| Change не выбрасывает | Обработчик привязан безопасно |
| Правило `fileType` | Валидация MIME-типа по белому списку |
| Правило `fileSize` | Отклонение файлов, превышающих `data-validate-file-size` |
| Правило `fileCount` | Отклонение при превышении `data-validate-file-count` |

#### Drag & Drop

| Тест | Что покрывает |
|------|---------------|
| `dragover` добавляет `is-dragover` | Визуальная обратная связь при перетаскивании |
| `dragleave` убирает `is-dragover` | Очистка при выходе |
| `drop` убирает класс + вызывает change | Симуляция передачи файла |

#### Счётчик символов

| Тест | Что покрывает |
|------|---------------|
| Обновляется при вводе | Живой счётчик (`X / Y`) |
| `is-exceeded` на лимите | Визуальное предупреждение при 100% |
| `is-near-limit` при 90% | Раннее предупреждение на пороге |

#### Принудительное ограничение maxlength

| Тест | Что покрывает |
|------|---------------|
| Обрезает значение, превышающее maxlength | Обрезка в реальном времени до `maxlength` |

#### Условная валидация

| Тест | Что покрывает |
|------|---------------|
| `validateIf` пропускает при ложном условии | Поле игнорируется, когда чекбокс unchecked |
| `validateIf` валидирует при истинном условии | Поле проверяется, когда чекбокс checked |
| `validateIfNot` пропускает при истинном условии | Инвертированная логика |

#### Групповая валидация

| Тест | Что покрывает |
|------|---------------|
| `required`-группа падает при пустых | Нужно хотя бы одно поле |
| `required`-группа проходит с одним значением | Одно заполненное поле достаточно |
| `minChecked` падает ниже порога | Принудительное `data-validate-group-min` |
| `minChecked` проходит на пороге | Точный минимум удовлетворён |
| `maxChecked` падает выше порога | Принудительное `data-validate-group-max` |

#### Summary

| Тест | Что покрывает |
|------|---------------|
| `showSummary` error | Отображает сообщение со стилем ошибки |
| `showSummary` success | Отображает сообщение со стилем успеха |
| `hideSummary` | Убирает класс видимости |

#### Progress

| Тест | Что покрывает |
|------|---------------|
| Инициализируется с 0% | Текст и ширина бара по умолчанию |
| ARIA-атрибуты | `role="progressbar"`, `aria-valuemin`, `aria-valuemax` |

#### Submit

| Тест | Что покрывает |
|------|---------------|
| Предотвращает default при невалидной форме | `event.preventDefault()` при плохой форме |
| Диспатчит `form:submit` при валидной | Кастомное событие при успешной валидации |

#### API ошибок полей

| Тест | Что покрывает |
|------|---------------|
| `setFieldError` | Программная инъекция ошибки с `aria-invalid` |
| `clearFieldError` | Программное удаление ошибки |

#### Немаскированные значения

| Тест | Что покрывает |
|------|---------------|
| `getMaskedRawValues` | Возвращает немаскированные данные из `data-mask-raw` |

### `app.test.js`

Тестирует оркестратор приложения из `main.js`.

| Тест | Что покрывает |
|------|---------------|
| Пространство имён `window.CORE4` | Экспонирует `app`, `core`, `utils`, `components` |
| Слияние конфига конструктора | Флаги модулей по умолчанию присутствуют |
| Защита от двойной инициализации | Второй `init()` — no-op |
| `destroy` сбрасывает состояние | `isInitialized = false`, пустые `modules` и `_factories` |
| `getModule` возвращает null для неизвестного | Безопасный fallback |
| `getModule` возвращает null до init | Защита до инициализации |
| Метод `reinit` существует | Вызываемый |
| Метод `destroy` существует | Вызываемый |
| Метод `init` существует | Вызываемый |
| Модули пусты до init | `Object.keys(app.modules).length === 0` |
| Безопасный многократный destroy | Без ошибок при повторных вызовах |

---

## Конфигурация

### Настройка Jest

Убедитесь, что `jest.setup.js` (или `package.json`) содержит:

```js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'] // опционально
};
```

`moduleNameMapper` **критичен**: в CORE4 импорты используют явные расширения `.js` (`import { Modal } from '../modules/modal/_modal.js'`), но Jest по умолчанию резолвит модули без расширений.

### Опционально: `../jest.config.js`

```js
// Мок ResizeObserver для Tabs и других компонентов
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Мок scrollIntoView
element.prototype.scrollIntoView = jest.fn();
```

---

## Написание новых тестов

### Шаблон

```javascript
import { MyComponent } from '../modules/my-module/_my-module.js';

describe('MyComponent', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('делает что-то ожидаемое', () => {
    document.body.innerHTML = `
      <div data-my-component>Контент</div>
    `;
    const el = document.querySelector('[data-my-component]');
    const instance = new MyComponent(el);

    // Действие
    instance.doSomething();

    // Проверка
    expect(el.classList.contains('is-active')).toBe(true);
  });
});
```

### Чеклист для тестов нового компонента

- [ ] Настройка DOM в `beforeEach`
- [ ] Проверка ARIA-атрибутов после `init()`
- [ ] Проверка классов состояния после действий
- [ ] Кастомные события диспатчатся и ловятся
- [ ] Клавиатурная навигация протестирована (если интерактивный)
- [ ] `destroy()` очищает слушатели и состояние
- [ ] Краевые случаи: двойные вызовы, отсутствие DOM, null-входы

---

## Карта покрытия

| Слой | Модуль | Тестовый файл | Покрытие |
|------|--------|---------------|----------|
| Core | `_config.js` | `core.test.js` | Константы |
| Core | `_helpers.js` | `core.test.js` | Все экспортированные функции |
| Core | `_events.js` | `core.test.js` | dispatch, on, once |
| Utilities | `_dom.js` | `utilities.test.js` | Все функции |
| Utilities | `_keyboard.js` | `utilities.test.js` | Все методы |
| Utilities | `_focus-trap.js` | `utilities.test.js` | Жизненный цикл + цикл Tab |
| Utilities | `_viewport.js` | `utilities.test.js` | isInViewport, onViewportEnter |
| Modules | `Modal` | `modal.test.js` | Полный жизненный цикл + триггеры |
| Modules | `Accordion` | `accordion.test.js` | Полный жизненный цикл + режимы |
| Modules | `Dropdown` | `dropdown.test.js` | Полный жизненный цикл + клавиатура |
| Modules | `Tabs` | `tabs.test.js` | Активация + ARIA + destroy |
| Modules | `ThemeManager` | `theme.test.js` | Apply/toggle/persist |
| Modules | `Button` | `button.test.js` | Async + toggle + reset |
| Modules | `Form` | `form.test.js` | Валидация + события |
| Modules | `Form` (расширенный) | `form-extended.test.js` | Async, файл, drag & drop, счётчики, группы, summary, progress, submit |
| Modules | `Wizard` | `form.test.js` | Навигация + валидация |
| Modules | `DraftSaver` | `form.test.js` | Жизненный цикл хранилища |
| Modules | `PasswordStrength` | `form.test.js` | Скоринг + события |
| App | `App` | `app.test.js` | Пространство имён, жизненный цикл, защита |

---

*Для английской версии см. [TEST-GUIDE.md](TEST-GUIDE.md).*
