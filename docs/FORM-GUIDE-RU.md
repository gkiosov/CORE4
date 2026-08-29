# 📘 Документация модуля Form (CORE4)

> **Версия:** 0.1.0 Альфа | **Обновлено:** Август 2026

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Автоинициализация](#автоинициализация)
3. [Валидация полей](#валидация-полей)
   - [Встроенные правила](#встроенные-правила)
   - [Data-атрибуты](#data-атрибуты)
   - [Кросс-валидация](#кросс-валидация)
   - [Асинхронная удалённая валидация](#асинхронная-удалённая-валидация)
4. [Валидация групп](#валидация-групп)
5. [Маски ввода (Input Masks)](#маски-ввода-input-masks)
   - [Встроенные маски](#встроенные-маски)
   - [Универсальная телефонная маска](#универсальная-телефонная-маска)
   - [Кастомные маски](#кастомные-маски)
6. [Загрузка файлов и Drag & Drop](#загрузка-файлов-и-drag--drop)
   - [Нативная зона перетаскивания](#нативная-зона-перетаскивания)
   - [Компонент FileUpload](#компонент-fileupload)
7. [Wizard (многошаговая форма)](#wizard-многошаговая-форма)
8. [Индикатор сложности пароля](#индикатор-сложности-пароля)
9. [Автосохранение черновика (Draft Saver)](#автосохранение-черновика-draft-saver)
10. [Индикатор прогресса](#индикатор-прогресса)
11. [Асинхронная отправка формы](#асинхронная-отправка-формы)
12. [OTP-поле верификации](#otp-поле-верификации)
13. [Доступность (ARIA)](#доступность-aria)
14. [CSS-состояния и раскладки](#css-состояния-и-раскладки)
15. [События](#события)
16. [Публичное API](#публичное-api)

---

## Обзор

Модуль Form — это комплексная система работы с формами, включающая валидацию, маски ввода, загрузку файлов, многошаговые визарды, автосохранение черновиков и асинхронную отправку. Интегрируется с модулем Button (async-состояния) и FocusTrap (навигация по ошибкам).

**Ключевые возможности:**

- **Живая валидация** — дебаунс-фидбек в реальном времени после первого blur
- **Встроенные и кастомные валидаторы** — 15+ правил из коробки
- **Валидация групп** — чекбокс-группы, fieldset'ы и radio-наборы
- **Кросс-валидация** — условные правила на основе других полей
- **Маски ввода** — автоформатирование с сохранением позиции курсора и автоопределением телефонных кодов стран
- **Drag & Drop файлов** — нативные зоны и автономный компонент FileUpload
- **Многошаговый wizard** — валидация шагов, индикатор-степпер, линейная навигация
- **Сложность пароля** — оценка в реальном времени с визуальным индикатором
- **Автосохранение** — localStorage / sessionStorage с восстановлением
- **Прогресс-бар** — индикатор заполнения обязательных полей
- **Асинхронная отправка** — AJAX-формы с summary и интеграцией с Button

---

## Автоинициализация

Формы автоматически инициализируются через `initForms()` при наличии элементов `[data-form]` в DOM.

```html
<form data-form data-form-live="true" data-form-progress="true">
  <!-- поля -->
</form>
```

```javascript
import { initForms, Form, Wizard, DraftSaver, PasswordStrength } from './modules/form/_index.js';

// Автоинициализация всех [data-form]
const forms = initForms();

// Ручная инициализация
const form = new Form(document.getElementById('my-form'), {
  liveValidate: true,
  validateOnSubmit: true,
  focusFirstError: true,
  scrollToError: true,
  showSummary: false,
  showProgress: false,
  errorClass: 'is-invalid',
  validClass: 'is-valid',
  dirtyClass: 'is-dirty',
  focusedClass: 'is-focused',
  debounceDelay: 300
});
```

### Data-атрибуты формы

| Атрибут | По умолчанию | Описание |
|---------|-------------|----------|
| `data-form` | — | Включает модуль Form на этом `<form>` |
| `data-form="async"` | — | Отменяет нативный submit; диспатчит событие `form:submit` |
| `data-form="wizard"` | — | Включает встроенный wizard-режим (устаревший; лучше `data-wizard`) |
| `data-form-live` | `true` | Валидировать при вводе после первого blur |
| `data-form-validate` | `true` | Валидировать при submit |
| `data-form-summary` | `false` | Показывать inline summary при submit |
| `data-form-progress` | `false` | Показывать прогресс-бар заполнения |
| `data-form-debounce` | `300` | Задержка дебаунса для live-валидации (мс) |
| `data-form-autosave` | — | Тип хранилища: `localStorage` или `sessionStorage` |
| `data-form-autosave-key` | auto | Пользовательский ключ хранилища |
| `data-form-autosave-interval` | `30000` | Интервал сохранения (мс) |
| `data-form-autosave-max-age` | — | Максимальный возраст черновика (часы) |
| `data-wizard` | — | Включает компонент Wizard |
| `data-draft-key` | — | Включает компонент DraftSaver |

---

## Валидация полей

### Встроенные правила

Правила задаются через атрибуты `data-validate-{rule}`.

| Правило | Атрибут | Параметр | Описание |
|---------|---------|----------|----------|
| Обязательное | `data-validate-required` | — | Поле не должно быть пустым |
| Мин. длина | `data-validate-minlength` | `число` | Минимум символов |
| Макс. длина | `data-validate-maxlength` | `число` | Максимум символов |
| Паттерн | `data-validate-pattern` | `регекс` | Должно соответствовать регулярке |
| Email | `data-validate-email` | — | Корректный email |
| URL | `data-validate-url` | — | Корректный URL |
| Число | `data-validate-number` | — | Должно быть числом |
| Мин. значение | `data-validate-min` | `число` | Числовой минимум |
| Макс. значение | `data-validate-max` | `число` | Числовой максимум |
| Совпадение | `data-validate-match` | `id` | Должно совпадать с другим полем |
| Сложность | `data-validate-strength` | `0–4` | Минимальный score пароля |
| Зависимость | `data-validate-depends` | `id:op:значение` | Условная валидация |
| Тип файла | `data-validate-file-type` | `mime,ext` | Разрешённые типы файлов |
| Размер файла | `data-validate-file-size` | `байты` или `5MB` | Максимальный размер |
| Кол-во файлов | `data-validate-file-count` | `число` | Максимальное количество файлов |

### Счётчик символов

Счётчик символов в реальном времени с визуальным предупреждением и жёсткой обрезкой.

```html
<textarea
  class="form__textarea"
  name="bio"
  rows="4"
  data-maxlength="200"
  data-validate-maxlength="200"
></textarea>
<span class="form__counter">0 / 200</span>
```

**Поведение:**
- Счётчик обновляется мгновенно при каждом нажатии клавиши (без дебаунса).
- Ввод **жёстко обрезается** при достижении лимита — лишние символы не допускаются.
- Класс `.is-near-limit` применяется при заполнении ≥90% лимита (жёлтое предупреждение).
- Класс `.is-exceeded` применяется при достижении лимита (красный, полужирный).

| Атрибут | Описание |
|---------|----------|
| `data-maxlength` | Устанавливает максимальную длину для счётчика и обрезки |
| `data-validate-maxlength` | Правило валидации (может совпадать с `data-maxlength`) |

---

### Кастомные сообщения об ошибках

Переопределить стандартные сообщения для конкретного правила:

```html
<input data-validate-required data-error-required="Это поле обязательно">
<input data-validate-email data-error-email="Введите корректный email">
<input data-validate-minlength="3" data-error-minlength="Минимум 3 символа">
```

### Кросс-валидация

Валидировать поле только при определённом значении другого поля.

```html
<select id="country" name="country">
  <option value="us">США</option>
  <option value="ca">Канада</option>
</select>

<!-- Обязательно только при country === 'us' -->
<input data-validate-if="country:us" data-validate-required>

<!-- Обязательно только при country !== 'us' -->
<input data-validate-if-not="country:us" data-validate-required>
```

**Правило depends** — расширенная условная логика:

```html
<input id="age" name="age" type="number">

<!-- Обязательно только если age < 21 -->
<input type="checkbox" data-validate-depends="age:lt:21" data-error-depends="Требуется согласие родителей">
```

Операторы: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `contains`, `checked`, `empty`.

### Асинхронная удалённая валидация

Проверяет значение на удалённом сервере после остановки ввода.

```html
<input
  data-validate-async="https://api.example.com/check-username"
  data-validate-async-minlength="3"
  data-validate-async-param="username"
  data-validate-async-method="GET"
  data-error-async="Этот username уже занят">
```

| Атрибут | По умолчанию | Описание |
|---------|-------------|----------|
| `data-validate-async` | — | URL эндпоинта |
| `data-validate-async-minlength` | `3` | Минимальная длина перед запросом |
| `data-validate-async-param` | `value` | Имя параметра query / body |
| `data-validate-async-method` | `GET` | HTTP-метод (`GET` или `POST`) |
| `data-error-async` | — | Сообщение об ошибке, если сервер вернул `valid: false` |

Эндпоинт должен возвращать JSON: `{ "valid": true }` или `{ "valid": false, "message": "..." }`.

---

## Валидация групп

Применяет правила к группе полей (чекбоксы, радио или смешанные input'ы внутри контейнера).

```html
<!-- Минимум 2, максимум 4 чекбокса -->
<div data-validate-group-min="2" data-validate-group-max="4">
  <label><input type="checkbox" name="interests" value="design"> Дизайн</label>
  <label><input type="checkbox" name="interests" value="dev"> Разработка</label>
</div>

<!-- Хотя бы одно поле в группе должно быть заполнено -->
<fieldset data-validate-group="required">
  <input name="email" type="email">
  <input name="phone" type="tel">
</fieldset>
```

| Атрибут | Параметр | Описание |
|---------|----------|----------|
| `data-validate-group` | — | Хотя бы одно поле должно иметь значение |
| `data-validate-group-min` | `число` | Минимум отмеченных чекбоксов |
| `data-validate-group-max` | `число` | Максимум отмеченных чекбоксов |
| `data-error-group-required` | — | Кастомное сообщение для `required` |
| `data-error-group-min` | — | Кастомное сообщение для `minChecked` |
| `data-error-group-max` | — | Кастомное сообщение для `maxChecked` |

---

## Маски ввода (Input Masks)

Автоформатирование ввода пользователя с сохранением позиции курсора и динамической сменой маски.

### Встроенные маски

```html
<input data-mask="date" placeholder="__/__/____">
<input data-mask="time" placeholder="__:__">
<input data-mask="datetime" placeholder="__/__/____ __:__">
<input data-mask="credit-card" placeholder="____ ____ ____ ____">
<input data-mask="ssn" placeholder="___-__-____">
<input data-mask="zip" placeholder="_____-____">
<input data-mask="zip-short" placeholder="_____">
```

### Универсальная телефонная маска

Автоматически определяет код страны и применяет соответствующую маску.

```html
<input type="tel" data-mask="phone" placeholder="+_ ___ ___-__-__">
```

**Как это работает:**
- При фокусе на пустое поле автоматически вставляется `+`.
- По мере ввода цифр модуль сопоставляет префикс с JSON-конфигом 20+ стран.
- Маска динамически переключается: `+7` → Россия, `+1` → США/Канада, `+380` → Украина и т.д.
- Если совпадение не найдено — применяется универсальная международная маска.
- Ввод строго ограничен длиной активной маски.

**Поддерживаемые коды стран:** `+1`, `+7`, `+20`, `+27`, `+30`, `+31`, `+32`, `+33`, `+34`, `+36`, `+39`, `+40`, `+41`, `+43`, `+44`, `+45`, `+46`, `+47`, `+48`, `+49`, `+51`, `+52`, `+53`, `+54`, `+55`, `+56`, `+57`, `+58`, `+60`, `+61`, `+62`, `+63`, `+64`, `+65`, `+66`, `+81`, `+82`, `+84`, `+86`, `+90`, `+91`, `+92`, `+93`, `+95`, `+98`, `+211`, `+212`, `+213`, `+216`, `+218`, `+220`, `+221`, `+223`, `+224`, `+226`, `+230`, `+233`, `+234`, `+235`, `+236`, `+237`, `+240`, `+242`, `+245`, `+250`, `+251`, `+254`, `+257`, `+260`, `+263`, `+267`, `+268`, `+269`, `+290`, `+291`, `+297`, `+298`, `+299`, `+350`, `+351`, `+352`, `+353`, `+354`, `+355`, `+356`, `+357`, `+358`, `+359`, `+370`, `+371`, `+372`, `+373`, `+374`, `+375`, `+376`, `+377`, `+378`, `+380`, `+381`, `+382`, `+385`, `+386`, `+387`, `+389`, `+420`, `+421`, `+501`, `+502`, `+504`, `+507`, `+509`, `+591`, `+592`, `+593`, `+594`, `+595`, `+596`, `+597`, `+598`, `+599`, `+670`, `+673`, `+675`, `+680`, `+682`, `+685`, `+687`, `+688`, `+689`, `+692`, `+855`, `+856`, `+880`, `+960`, `+961`, `+962`, `+963`, `+964`, `+965`, `+966`, `+967`, `+968`, `+971`, `+972`, `+973`, `+974`, `+975`, `+976`, `+977`, `+992`, `+993`, `+994`, `+995`, `+996`, `+998`.

### Кастомные маски

```html
<input data-mask="custom" data-mask-pattern="AAA-####" placeholder="AAA-####">
```

**Синтаксис маски:**

| Символ | Значение |
|--------|----------|
| `#` | Цифра (`0–9`) |
| `A` | Буква (`a–z`, `A–Z`) |
| `*` | Любой одиночный символ |
| остальное | Статический литерал |

---

## Загрузка файлов и Drag & Drop

### Нативная зона перетаскивания

Простая зона drag-and-drop на базе `.form__file-drop`. Обрабатывается нативно модулем Form.

```html
<div class="form__file-drop">
  <span class="form__file-drop__text">Перетащите файлы сюда или</span>
  <span class="form__file-drop__cta">нажмите для выбора</span>
  <input type="file" name="avatar" accept="image/*"
    data-validate-file-type="image/*"
    data-validate-file-size="5MB">
</div>
```

Возможности: подсветка при dragover, клик для выбора, список превью с кнопками удаления, миниатюры изображений.

### Компонент FileUpload

Автономный компонент для расширенной работы с файлами.

```html
<div class="file-upload__dropzone" data-file-dropzone>
  <span class="file-upload__dropzone__icon">📁</span>
  <span class="file-upload__dropzone__text">Перетащите или нажмите</span>
  <input class="file-upload__input" type="file" name="docs" multiple
    accept=".pdf" data-file-maxsize="2MB" data-file-maxcount="3">
</div>
<div class="file-upload__list" data-file-list></div>
```

```javascript
import { FileUpload } from './modules/form/_file-upload.js';

const upload = new FileUpload(input, {
  dropzoneSelector: '[data-file-dropzone]',
  listSelector: '[data-file-list]',
  accept: '.pdf,.doc',
  maxSize: 5 * 1024 * 1024,  // 5 МБ
  maxCount: 3,
  multiple: true,
  showPreview: true
});
```

| Метод | Описание |
|-------|----------|
| `getFiles()` | Возвращает управляемый массив `File[]` |
| `removeFile(index)` | Удалить файл по индексу |
| `clear()` | Удалить все файлы |
| `destroy()` | Очистка слушателей и состояния |

---

## Wizard (многошаговая форма)

Разбивает длинную форму на валидируемые шаги с индикатором-степпером.

```html
<form data-form data-wizard>
  <div data-wizard-stepper></div>

  <div data-wizard-step data-wizard-label="Аккаунт">
    <input data-validate-required data-validate-email name="email">
    <button type="button" data-wizard-next>Далее</button>
  </div>

  <div data-wizard-step data-wizard-label="Личные данные">
    <input data-validate-required name="name">
    <button type="button" data-wizard-prev>Назад</button>
    <button type="button" data-wizard-next>Далее</button>
  </div>

  <div data-wizard-step data-wizard-label="Подтверждение">
    <input type="checkbox" data-validate-required name="terms">
    <button type="button" data-wizard-prev>Назад</button>
    <button type="submit">Отправить</button>
  </div>
</form>
```

**Кнопки навигации:**

| Атрибут | Описание |
|---------|----------|
| `data-wizard-prev` | Перейти на предыдущий шаг |
| `data-wizard-next` | Валидировать текущий шаг и перейти далее |
| `data-wizard-submit` | Кнопка отправки (авто-показ на последнем шаге) |

**Степпер:** Автоматически генерируется, если присутствует `[data-wizard-stepper]`. Показывает номер шага, метку и состояние завершения.

```javascript
import { Wizard } from './modules/form/_wizard.js';

const wizard = new Wizard(formElement, {
  validateStep: true,   // валидировать перед переходом
  linear: true          // только последовательное движение вперёд
});

wizard.next();
wizard.prev();
wizard.goToStep(1);
```

---

## Индикатор сложности пароля

Оценка сложности пароля в реальном времени с визуальной шкалой и чеклистом правил.

```html
<input type="password" id="pwd"
  data-validate-strength="2"
  data-strength-minlength="8"
  data-strength-upper
  data-strength-lower
  data-strength-digit
  data-strength-special>
```

| Атрибут | Описание |
|---------|----------|
| `data-validate-strength` | Минимально требуемый score (`0–4`) |
| `data-strength-minlength` | Правило минимальной длины |
| `data-strength-upper` | Требовать заглавную букву |
| `data-strength-lower` | Требовать строчную букву |
| `data-strength-digit` | Требовать цифру |
| `data-strength-special` | Требовать спецсимвол |

Индикатор автоматически вставляется после input. Score записывается в `data-strength-score` для использования валидатором `strength`.

---

## Автосохранение черновика (Draft Saver)

Автоматически сохраняет данные формы в `localStorage` или `sessionStorage` с дебаунсом.

```html
<form data-form data-draft-key="contact_form_v1" data-draft-debounce="800">
  <!-- поля -->
  <span data-draft-status></span>
</form>
```

```javascript
import { DraftSaver } from './modules/form/_draft-saver.js';

const saver = new DraftSaver(form, {
  storageKey: 'my_form_draft',
  debounceDelay: 1000,
  restoreOnLoad: true,
  clearOnSubmit: true
});

saver.save();
saver.restore();
saver.clear();
```

| Метод | Описание |
|-------|----------|
| `save()` | Сериализовать и сохранить в хранилище |
| `restore()` | Десериализовать и заполнить форму |
| `clear()` | Удалить черновик из хранилища |
| `getDraftAge()` | Возраст текущего черновика (мс) |

---

## Индикатор прогресса

Показывает шкалу заполнения на основе обязательных полей и валидных групп.

```html
<form data-form data-form-progress="true">
  <!-- обязательные поля и группы -->
</form>
```

Прогресс-бар автоматически вставляется в начало формы. Обновляется при каждом событии `input` и `change`.

---

## OTP-поле верификации

Поле из нескольких одноцифровых ячеек для ввода одноразовых кодов (OTP, SMS, email-коды). Каждый символ вводится в свою ячейку. Поддерживает вставку, навигацию backspace, стрелки и автофокус.

```html
<div class="form__otp" data-otp data-otp-length="6" data-otp-name="verification_code">
  <!-- инпуты генерируются автоматически -->
</div>
```

| Атрибут | По умолчанию | Описание |
|---------|-------------|----------|
| `data-otp` | — | Включает компонент OTP |
| `data-otp-length` | `4` | Количество цифр (4, 5, 6 и т.д.) |
| `data-otp-name` | `otp` | Имя скрытого input'а для отправки формы |

**Поведение:**
- Принимаются только цифры `0–9`.
- Ввод цифры автоматически переносит фокус в следующую ячейку.
- `Backspace` в пустой ячейке возвращает фокус назад и очищает предыдущую цифру.
- `ArrowLeft` / `ArrowRight` — навигация между ячейками.
- `Ctrl+V` / `Cmd+V` — вставка кода по ячейкам, начиная с текущей.
- При заполнении всех ячеек контейнер получает `.is-complete` и диспатчит `otp:complete`.
- Создаётся скрытый `<input type="hidden">` для нативной отправки формы.

```javascript
import { OtpInput } from './modules/form/_otp-input.js';

const otp = new OtpInput(document.querySelector('[data-otp]'));

otp.getValue();      // "123456"
otp.setValue("789");  // заполняет первые 3 ячейки
otp.clear();          // очищает все ячейки и фокусирует первую
```

**События:** `otp:input`, `otp:complete`

---

## Асинхронная отправка формы

Отменяет нативный submit, валидирует и диспатчит кастомное событие для AJAX-обработки.

```html
<form id="settings" data-form="async" data-form-summary="true">
  <div class="form__summary" aria-live="assertive"></div>
  <!-- поля -->
  <button data-button="async" data-loading-text="Сохранение...">Сохранить</button>
</form>
```

```javascript
document.addEventListener('form:submit', (e) => {
  if (e.target.id !== 'settings') return;

  const form = e.detail.form;
  const data = e.detail.data; // экземпляр FormData

  fetch('/api/settings', { method: 'POST', body: data })
    .then(() => {
      form.showSummary('success', 'Настройки сохранены!');
    })
    .catch(() => {
      form.showSummary('error', 'Что-то пошло не так.');
    });
});
```

---

## Доступность (ARIA)

Модуль Form автоматически управляет ARIA-атрибутами для совместимости со скринридерами:

| Атрибут | Применяется к | Когда | Описание |
|---------|--------------|-------|----------|
| `aria-describedby` | Поле | При инициализации | Связывает поле с контейнером `.form__error` |
| `aria-live="polite"` | `.form__error` | При инициализации | Сообщения об ошибках озвучиваются скринридером |
| `aria-invalid` | Поле | При валидации | `true` при ошибке, `false` при валидности или сбросе |
| `aria-required="true"` | Поле | При инициализации | Устанавливается на поля с `data-validate-required` или `required` |
| `aria-busy="true"` | Поле | Во время async-проверки | Устанавливается на время удалённой валидации |
| `aria-busy="false"` | Поле | После async-проверки | Снимается по завершении или ошибке async-валидации |
| `role="progressbar"` + `aria-valuenow/min/max` | `.form__progress` | При инициализации | Прогресс-бар доступен для скринридера |
| `aria-current="step"` | Кнопка степпера | При смене шага wizard | Помечает активный шаг wizard |
| `aria-label="Remove file"` | Кнопка удаления файла | При превью файла | Описательная метка для кнопок удаления |

Ручная разметка ARIA не требуется — все атрибуты управляются автоматически модулем Form.

---

## CSS-состояния и раскладки

### Состояния валидации

| Класс | Применяется к | Описание |
|-------|--------------|----------|
| `.is-valid` | `.form__group` | Поле прошло валидацию |
| `.is-invalid` | `.form__group` | Поле не прошло валидацию |
| `.is-dirty` | `.form__group` | Поле было изменено |
| `.is-focused` | `.form__group` | Поле в фокусе |
| `.is-validating-async` | `.form__group` | Идёт асинхронная проверка |

### Модификаторы раскладки

| Класс | Описание |
|-------|----------|
| `.form--horizontal` | Метка слева, поле справа (grid на `md+`) |
| `.form--inline` | Строчная раскладка |
| `.form--compact` | Уменьшенные вертикальные отступы |

### Модификаторы размера

| Класс | Описание |
|-------|----------|
| `.form__input--sm` | Маленькое поле (28px) |
| `.form__input--lg` | Большое поле (44px) |

---

## События

Все события диспатчатся через `EventManager` и всплывают.

| Событие | Цель | Detail |
|---------|------|--------|
| `form:initialized` | `<form>` | `{ form }` |
| `form:fieldValidated` | `<input>` | `{ form, field, valid, message }` |
| `form:groupValidated` | `<div>` / `<fieldset>` | `{ form, group, valid, message }` |
| `form:validated` | `<form>` | `{ form, valid }` |
| `form:submit` | `<form>` | `{ form, data: FormData }` |
| `form:submitPrevented` | `<form>` | `{ form }` — submit заблокирован ошибками валидации |
| `form:reset` | `<form>` | `{ form }` |
| `form:progress` | `<form>` | `{ form, percent, completed, total }` |
| `form:autosaved` | `<form>` | `{ form, key }` |
| `form:draftRestored` | `<form>` | `{ form, key, timestamp }` |
| `mask:input` | `<input>` | `{ mask, raw, masked }` |
| `password:strength` | `<input>` | `{ field, score, feedback, rules }` |
| `file:change` | `<input>` | `{ upload, files, errors }` |
| `file:remove` | `<input>` | `{ upload, file, index }` |
| `file:rejected` | `<input>` | `{ upload, errors }` |
| `wizard:initialized` | `<form>` | `{ wizard }` |
| `wizard:stepChange` | `<form>` | `{ wizard, step, stepElement }` |
| `wizard:stepInvalid` | `<form>` | `{ wizard, step }` |
| `otp:input` | `<div>` | `{ value, complete }` |
| `otp:complete` | `<div>` | `{ value }` — все ячейки заполнены |
| `draft:saved` | `<form>` | `{ saver, data }` |
| `draft:restored` | `<form>` | `{ saver, data, timestamp }` |
| `draft:cleared` | `<form>` | `{ saver }` |

---

## Публичное API

### Form

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `validateField(field)` | `Promise<boolean>` | Валидировать одно поле |
| `validateGroup(group)` | `boolean` | Валидировать контейнер-группу |
| `validateForm()` | `Promise<boolean>` | Валидировать все поля и группы |
| `validateCurrentStep()` | `boolean` | Валидировать поля текущего шага wizard |
| `nextStep()` | `void` | Перейти к следующему шагу wizard (если валидно) |
| `prevStep()` | `void` | Вернуться к предыдущему шагу wizard |
| `goToStep(index)` | `void` | Перейти к шагу wizard |
| `showSummary(type, message)` | `void` | Показать summary: `error` или `success` |
| `hideSummary()` | `void` | Скрыть summary |
| `setFieldError(name, message)` | `void` | Программно установить ошибку |
| `clearFieldError(name)` | `void` | Снять ошибку с поля |
| `getData()` | `Object` | Сериализовать форму в объект |
| `getMaskedRawValues()` | `Object` | Получить сырые (немаскированные) значения маскированных полей |
| `reset()` | `void` | Сбросить состояние и UI формы |
| `destroy()` | `void` | Удалить все слушатели и инстансы |

### InputMask

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `getRawValue()` | `string` | Цифры/буквы без маски |
| `getMaskedValue()` | `string` | Текущее маскированное значение |
| `setValue(raw)` | `void` | Установить значение из сырой строки |
| `destroy()` | `void` | Удалить слушатели |

### Wizard

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `next()` | `Promise<void>` | Валидировать и перейти далее |
| `prev()` | `void` | Вернуться назад |
| `goToStep(index)` | `Promise<void>` | Перейти к шагу (учитывает `linear`) |
| `getCurrentStep()` | `number` | Индекс текущего шага |
| `getTotalSteps()` | `number` | Общее количество шагов |
| `attachForm(formInstance)` | `void` | Привязать к Form для валидации |
| `destroy()` | `void` | Очистка |

### FileUpload

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `getFiles()` | `File[]` | Текущий список файлов |
| `removeFile(index)` | `void` | Удалить файл по индексу |
| `clear()` | `void` | Удалить все файлы |
| `destroy()` | `void` | Очистка |

### DraftSaver

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `save()` | `void` | Сохранить черновик |
| `restore()` | `boolean` | Восстановить черновик из хранилища |
| `clear()` | `void` | Удалить черновик |
| `getDraftAge()` | `number|null` | Возраст черновика (мс) |
| `destroy()` | `void` | Очистка |

### OtpInput

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `getValue()` | `string` | Полный код из всех ячеек |
| `setValue(code)` | `void` | Заполнить ячейки из строки |
| `clear()` | `void` | Очистить все ячейки, фокус на первую |
| `destroy()` | `void` | Очистка |

### PasswordStrength

| Метод | Возвращает | Описание |
|-------|-----------|----------|
| `calculate(value)` | `{score,feedback,rules}` | Вычислить сложность (0–4) |
| `destroy()` | `void` | Очистка |

---

**Автор:** Георгий Киосов | **Лицензия:** MIT
