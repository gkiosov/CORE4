# CORE4 Form Module Documentation

> **Version:** 0.1.0 Draft | **Updated:** August 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Auto-initialization](#auto-initialization)
3. [Field Validation](#field-validation)
   - [Built-in Rules](#built-in-rules)
   - [Data Attributes](#data-attributes)
   - [Cross-field Validation](#cross-field-validation)
   - [Async Remote Validation](#async-remote-validation)
4. [Group Validation](#group-validation)
5. [Input Masks](#input-masks)
   - [Built-in Masks](#built-in-masks)
   - [Universal Phone Mask](#universal-phone-mask)
   - [Custom Masks](#custom-masks)
6. [File Upload & Drag and Drop](#file-upload--drag-and-drop)
   - [Native Drop Zone](#native-drop-zone)
   - [FileUpload Component](#fileupload-component)
7. [Wizard (Multi-Step Form)](#wizard-multi-step-form)
8. [Password Strength](#password-strength)
9. [Draft Saver (Autosave)](#draft-saver-autosave)
10. [Progress Indicator](#progress-indicator)
11. [Async Form Submission](#async-form-submission)
12. [OTP Verification Input](#otp-verification-input)
13. [Accessibility (ARIA)](#accessibility-aria)
14. [CSS States & Layouts](#css-states--layouts)
15. [Events](#events)
16. [Public API](#public-api)

---

## Overview

The Form module is a comprehensive form-handling system that covers validation, input masking, file uploads, multi-step wizards, autosave drafts, and async submission. It integrates seamlessly with the CORE4 Button async states and FocusTrap for error navigation.

**Key features:**

- **Live validation** — debounced real-time feedback after first blur
- **Built-in + custom validators** — 15+ rules out of the box
- **Group validation** — validate checkbox groups, fieldsets, and radio sets
- **Cross-field validation** — conditional rules based on other fields
- **Input masks** — auto-formatting with cursor preservation and universal phone detection
- **File drag & drop** — native zones and standalone FileUpload component
- **Multi-step wizard** — step validation, stepper indicator, linear navigation
- **Password strength** — real-time scoring with visual indicator
- **Autosave drafts** — localStorage / sessionStorage with restore
- **Progress bar** — fill-completion indicator
- **Async submission** — AJAX-style forms with summary and Button integration

---

## Auto-initialization

Forms are auto-initialized via `initForms()` when `[data-form]` elements exist in the DOM.

```html
<form data-form data-form-live="true" data-form-progress="true">
  <!-- fields -->
</form>
```

```javascript
import { initForms, Form, Wizard, DraftSaver, PasswordStrength } from './modules/form/_index.js';

// Auto-init all [data-form] elements
const forms = initForms();

// Manual
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

### Form data attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-form` | — | Enables the Form module on this `<form>` |
| `data-form="async"` | — | Prevents native submit; dispatches `form:submit` event instead |
| `data-form="wizard"` | — | Enables built-in wizard mode (legacy; prefer `data-wizard`) |
| `data-form-live` | `true` | Validate on input after first blur |
| `data-form-validate` | `true` | Validate on submit |
| `data-form-summary` | `false` | Show inline summary block on submit |
| `data-form-progress` | `false` | Show fill-progress bar |
| `data-form-debounce` | `300` | Debounce delay for live validation (ms) |
| `data-form-autosave` | — | Storage type: `localStorage` or `sessionStorage` |
| `data-form-autosave-key` | auto | Custom storage key |
| `data-form-autosave-interval` | `30000` | Save interval (ms) |
| `data-form-autosave-max-age` | — | Max draft age in hours |
| `data-wizard` | — | Enables the Wizard component |
| `data-draft-key` | — | Enables the DraftSaver component |

---

## Field Validation

### Built-in Rules

Rules are defined via `data-validate-{rule}` attributes.

| Rule | Attribute | Param | Description |
|------|-----------|-------|-------------|
| Required | `data-validate-required` | — | Field must not be empty |
| Min length | `data-validate-minlength` | `number` | Minimum character count |
| Max length | `data-validate-maxlength` | `number` | Maximum character count |
| Pattern | `data-validate-pattern` | `regex` | Must match regex |
| Email | `data-validate-email` | — | Valid email format |
| URL | `data-validate-url` | — | Valid URL format |
| Number | `data-validate-number` | — | Must be a number |
| Min value | `data-validate-min` | `number` | Numeric minimum |
| Max value | `data-validate-max` | `number` | Numeric maximum |
| Match | `data-validate-match` | `id` | Must match another field's value |
| Strength | `data-validate-strength` | `0–4` | Minimum password strength score |
| Depends | `data-validate-depends` | `id:op:value` | Conditional validation |
| File type | `data-validate-file-type` | `mime,ext` | Allowed file types |
| File size | `data-validate-file-size` | `bytes` or `5MB` | Max file size |
| File count | `data-validate-file-count` | `number` | Max number of files |

### Character Counter

Real-time character counter with visual limit warning and hard truncation.

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

**Behavior:**
- Counter updates instantly on every keystroke (no debounce).
- Input is **hard-truncated** when the limit is reached — no excess characters allowed.
- `.is-near-limit` class is applied when ≥90% of the limit is used (yellow warning).
- `.is-exceeded` class is applied when the limit is reached (red, bold).

| Attribute | Description |
|-----------|-------------|
| `data-maxlength` | Sets the max length for the counter and truncation |
| `data-validate-maxlength` | Validation rule (can match `data-maxlength`) |

---

### Custom error messages

Override default messages per rule:

```html
<input data-validate-required data-error-required="This field is mandatory">
<input data-validate-email data-error-email="Please provide a valid email">
<input data-validate-minlength="3" data-error-minlength="At least 3 characters">
```

### Cross-field Validation

Validate a field only when another field has a specific value.

```html
<select id="country" name="country">
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Only required when country === 'us' -->
<input data-validate-if="country:us" data-validate-required>

<!-- Only required when country !== 'us' -->
<input data-validate-if-not="country:us" data-validate-required>
```

**Depends** rule — advanced conditional logic:

```html
<input id="age" name="age" type="number">

<!-- Required only if age < 21 -->
<input type="checkbox" data-validate-depends="age:lt:21" data-error-depends="Parental consent required">
```

Operators: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `contains`, `checked`, `empty`.

### Async Remote Validation

Checks value against a remote endpoint after the user stops typing.

```html
<input
  data-validate-async="https://api.example.com/check-username"
  data-validate-async-minlength="3"
  data-validate-async-param="username"
  data-validate-async-method="GET"
  data-error-async="Username is already taken">
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-validate-async` | — | Endpoint URL |
| `data-validate-async-minlength` | `3` | Minimum length before triggering |
| `data-validate-async-param` | `value` | Query / body parameter name |
| `data-validate-async-method` | `GET` | HTTP method (`GET` or `POST`) |
| `data-error-async` | — | Error message if remote returns `valid: false` |

The endpoint must return JSON: `{ "valid": true }` or `{ "valid": false, "message": "..." }`.

---

## Group Validation

Apply rules to a group of fields (checkboxes, radios, or mixed inputs inside a container).

```html
<!-- At least 2, no more than 4 checkboxes -->
<div data-validate-group-min="2" data-validate-group-max="4">
  <label><input type="checkbox" name="interests" value="design"> Design</label>
  <label><input type="checkbox" name="interests" value="dev"> Development</label>
</div>

<!-- At least one field in the group must have a value -->
<fieldset data-validate-group="required">
  <input name="email" type="email">
  <input name="phone" type="tel">
</fieldset>
```

| Attribute | Param | Description |
|-----------|-------|-------------|
| `data-validate-group` | — | At least one field must have a value |
| `data-validate-group-min` | `number` | Minimum checked checkboxes |
| `data-validate-group-max` | `number` | Maximum checked checkboxes |
| `data-error-group-required` | — | Custom message for `required` |
| `data-error-group-min` | — | Custom message for `minChecked` |
| `data-error-group-max` | — | Custom message for `maxChecked` |

---

## Input Masks

Auto-format user input with cursor preservation and dynamic mask switching.

### Built-in Masks

```html
<input data-mask="date" placeholder="__/__/____">
<input data-mask="time" placeholder="__:__">
<input data-mask="datetime" placeholder="__/__/____ __:__">
<input data-mask="credit-card" placeholder="____ ____ ____ ____">
<input data-mask="ssn" placeholder="___-__-____">
<input data-mask="zip" placeholder="_____-____">
<input data-mask="zip-short" placeholder="_____">
```

### Universal Phone Mask

Automatically detects the country code and applies the correct mask.

```html
<input type="tel" data-mask="phone" placeholder="+_ ___ ___-__-__">
```

**How it works:**
- On focus, an empty field auto-inserts `+`.
- As the user types digits, the module matches the prefix against a JSON config of 20+ countries.
- The mask dynamically switches: `+7` → Russian, `+1` → US/Canada, `+380` → Ukrainian, etc.
- If no match is found, a generic international mask is applied.
- The input is strictly limited to the length of the active mask.

**Supported country codes:** `+1`, `+7`, `+20`, `+27`, `+30`, `+31`, `+32`, `+33`, `+34`, `+36`, `+39`, `+40`, `+41`, `+43`, `+44`, `+45`, `+46`, `+47`, `+48`, `+49`, `+51`, `+52`, `+53`, `+54`, `+55`, `+56`, `+57`, `+58`, `+60`, `+61`, `+62`, `+63`, `+64`, `+65`, `+66`, `+81`, `+82`, `+84`, `+86`, `+90`, `+91`, `+92`, `+93`, `+95`, `+98`, `+211`, `+212`, `+213`, `+216`, `+218`, `+220`, `+221`, `+223`, `+224`, `+226`, `+230`, `+233`, `+234`, `+235`, `+236`, `+237`, `+240`, `+242`, `+245`, `+250`, `+251`, `+254`, `+257`, `+260`, `+263`, `+267`, `+268`, `+269`, `+290`, `+291`, `+297`, `+298`, `+299`, `+350`, `+351`, `+352`, `+353`, `+354`, `+355`, `+356`, `+357`, `+358`, `+359`, `+370`, `+371`, `+372`, `+373`, `+374`, `+375`, `+376`, `+377`, `+378`, `+380`, `+381`, `+382`, `+385`, `+386`, `+387`, `+389`, `+420`, `+421`, `+501`, `+502`, `+504`, `+507`, `+509`, `+591`, `+592`, `+593`, `+594`, `+595`, `+596`, `+597`, `+598`, `+599`, `+670`, `+673`, `+675`, `+680`, `+682`, `+685`, `+687`, `+688`, `+689`, `+692`, `+855`, `+856`, `+880`, `+960`, `+961`, `+962`, `+963`, `+964`, `+965`, `+966`, `+967`, `+968`, `+971`, `+972`, `+973`, `+974`, `+975`, `+976`, `+977`, `+992`, `+993`, `+994`, `+995`, `+996`, `+998`.

### Custom Masks

```html
<input data-mask="custom" data-mask-pattern="AAA-####" placeholder="AAA-####">
```

**Mask syntax:**

| Symbol | Meaning |
|--------|---------|
| `#` | Digit (`0–9`) |
| `A` | Letter (`a–z`, `A–Z`) |
| `*` | Any single character |
| other | Static literal character |

---

## File Upload & Drag and Drop

### Native Drop Zone

Simple drag-and-drop zone using `.form__file-drop`. Handled natively by the Form module.

```html
<div class="form__file-drop">
  <span class="form__file-drop__text">Drag & drop files here or</span>
  <span class="form__file-drop__cta">click to browse</span>
  <input type="file" name="avatar" accept="image/*"
    data-validate-file-type="image/*"
    data-validate-file-size="5MB">
</div>
```

Features: dragover highlight, click-to-browse, file preview list with remove buttons, image thumbnails.

### FileUpload Component

Standalone component for advanced file handling.

```html
<div class="file-upload__dropzone" data-file-dropzone>
  <span class="file-upload__dropzone__icon">📁</span>
  <span class="file-upload__dropzone__text">Drag & drop or click</span>
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
  maxSize: 5 * 1024 * 1024,  // 5 MB
  maxCount: 3,
  multiple: true,
  showPreview: true
});
```

| Method | Description |
|--------|-------------|
| `getFiles()` | Returns the managed `File[]` array |
| `removeFile(index)` | Remove a file by index |
| `clear()` | Remove all files |
| `destroy()` | Cleanup listeners and state |

---

## Wizard (Multi-Step Form)

Break a long form into validated steps with a stepper indicator.

```html
<form data-form data-wizard>
  <div data-wizard-stepper></div>

  <div data-wizard-step data-wizard-label="Account">
    <input data-validate-required data-validate-email name="email">
    <button type="button" data-wizard-next>Next</button>
  </div>

  <div data-wizard-step data-wizard-label="Personal">
    <input data-validate-required name="name">
    <button type="button" data-wizard-prev>Back</button>
    <button type="button" data-wizard-next>Next</button>
  </div>

  <div data-wizard-step data-wizard-label="Confirm">
    <input type="checkbox" data-validate-required name="terms">
    <button type="button" data-wizard-prev>Back</button>
    <button type="submit">Submit</button>
  </div>
</form>
```

**Navigation buttons:**

| Attribute | Description |
|-----------|-------------|
| `data-wizard-prev` | Go to previous step |
| `data-wizard-next` | Validate current step and advance |
| `data-wizard-submit` | Submit button (auto-shown on last step) |

**Stepper:** Auto-generated if `[data-wizard-stepper]` is present. Shows step number, label, and completion state.

```javascript
import { Wizard } from './modules/form/_wizard.js';

const wizard = new Wizard(formElement, {
  validateStep: true,   // validate before advancing
  linear: true          // only go forward sequentially
});

wizard.next();
wizard.prev();
wizard.goToStep(1);
```

---

## Password Strength

Real-time password strength estimation with a visual bar and rule checklist.

```html
<input type="password" id="pwd"
  data-validate-strength="2"
  data-strength-minlength="8"
  data-strength-upper
  data-strength-lower
  data-strength-digit
  data-strength-special>
```

| Attribute | Description |
|-----------|-------------|
| `data-validate-strength` | Minimum required score (`0–4`) |
| `data-strength-minlength` | Minimum length rule |
| `data-strength-upper` | Require uppercase letter |
| `data-strength-lower` | Require lowercase letter |
| `data-strength-digit` | Require digit |
| `data-strength-special` | Require special character |

The indicator is auto-inserted after the input. Score is stored in `data-strength-score` for use by the `strength` validator.

---

## Draft Saver (Autosave)

Auto-saves form data to `localStorage` or `sessionStorage` with debounce.

```html
<form data-form data-draft-key="contact_form_v1" data-draft-debounce="800">
  <!-- fields -->
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

| Method | Description |
|--------|-------------|
| `save()` | Serialize and save to storage |
| `restore()` | Deserialize and populate the form |
| `clear()` | Remove draft from storage |
| `getDraftAge()` | Age of the current draft in ms |

---

## Progress Indicator

Shows a fill-completion bar based on required fields and valid groups.

```html
<form data-form data-form-progress="true">
  <!-- required fields and groups -->
</form>
```

The progress bar is auto-inserted at the top of the form. It updates on every `input` and `change` event.

---

## OTP Verification Input

Split-digit input for one-time passwords and verification codes. Each character is typed into its own box. Supports paste, backspace navigation, arrow keys, and auto-focus.

```html
<div class="form__otp" data-otp data-otp-length="6" data-otp-name="verification_code">
  <!-- inputs are auto-generated -->
</div>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-otp` | — | Enables the OTP component |
| `data-otp-length` | `4` | Number of digits (4, 5, 6, etc.) |
| `data-otp-name` | `otp` | Name of the hidden input for form submission |

**Behavior:**
- Only digits `0–9` are accepted.
- Typing a digit auto-advances focus to the next box.
- `Backspace` on an empty box moves focus back and clears the previous digit.
- `ArrowLeft` / `ArrowRight` navigate between boxes.
- `Ctrl+V` / `Cmd+V` pastes a code across boxes starting from the focused box.
- When all boxes are filled, the container gets `.is-complete` and dispatches `otp:complete`.
- A hidden `<input type="hidden">` is created for native form submission.

```javascript
import { OtpInput } from './modules/form/_otp-input.js';

const otp = new OtpInput(document.querySelector('[data-otp]'));

otp.getValue();     // "123456"
otp.setValue("789"); // fills first 3 boxes
otp.clear();         // empties all boxes and focuses the first
```

**Events:** `otp:input`, `otp:complete`

---

## Async Form Submission

Prevent native submit, validate, and dispatch a custom event for AJAX handling.

```html
<form id="settings" data-form="async" data-form-summary="true">
  <div class="form__summary" aria-live="assertive"></div>
  <!-- fields -->
  <button data-button="async" data-loading-text="Saving...">Save</button>
</form>
```

```javascript
document.addEventListener('form:submit', (e) => {
  if (e.target.id !== 'settings') return;

  const form = e.detail.form;
  const data = e.detail.data; // FormData instance

  fetch('/api/settings', { method: 'POST', body: data })
    .then(() => {
      form.showSummary('success', 'Settings saved!');
    })
    .catch(() => {
      form.showSummary('error', 'Something went wrong.');
    });
});
```

---

## Accessibility (ARIA)

The Form module automatically manages ARIA attributes for screen reader compatibility:

| Attribute | Applied to | When | Description |
|-----------|-----------|------|-------------|
| `aria-describedby` | Field | On init | Links the field to its `.form__error` container |
| `aria-live="polite"` | `.form__error` | On init | Error messages are announced by screen readers |
| `aria-invalid` | Field | On validation | `true` when invalid, `false` when valid or reset |
| `aria-required="true"` | Field | On init | Set on fields with `data-validate-required` or `required` |
| `aria-busy="true"` | Field | During async check | Set while remote validation request is in flight |
| `aria-busy="false"` | Field | After async check | Removed when async validation completes or errors |
| `role="progressbar"` + `aria-valuenow/min/max` | `.form__progress` | On init | Progress indicator is accessible to screen readers |
| `aria-current="step"` | Stepper button | On wizard step change | Marks the active wizard step |
| `aria-label="Remove file"` | File remove button | On file preview | Descriptive label for remove buttons |

No manual ARIA markup is required — all attributes are managed automatically by the Form module.

---

## CSS States & Layouts

### Validation states

| Class | Applied to | Description |
|-------|-----------|-------------|
| `.is-valid` | `.form__group` | Field passed validation |
| `.is-invalid` | `.form__group` | Field failed validation |
| `.is-dirty` | `.form__group` | Field has been modified |
| `.is-focused` | `.form__group` | Field is focused |
| `.is-validating-async` | `.form__group` | Async check in progress |

### Layout modifiers

| Class | Description |
|-------|-------------|
| `.form--horizontal` | Label left, input right (grid on `md+`) |
| `.form--inline` | Inline row layout |
| `.form--compact` | Reduced vertical spacing |

### Size modifiers

| Class | Description |
|-------|-------------|
| `.form__input--sm` | Small input (28px) |
| `.form__input--lg` | Large input (44px) |

---

## Events

All events are dispatched via `EventManager` and bubble.

| Event | Target | Detail |
|-------|--------|--------|
| `form:initialized` | `<form>` | `{ form }` |
| `form:fieldValidated` | `<input>` | `{ form, field, valid, message }` |
| `form:groupValidated` | `<div>` / `<fieldset>` | `{ form, group, valid, message }` |
| `form:validated` | `<form>` | `{ form, valid }` |
| `form:submit` | `<form>` | `{ form, data: FormData }` |
| `form:submitPrevented` | `<form>` | `{ form }` — submit blocked by validation errors |
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
| `otp:complete` | `<div>` | `{ value }` — all digits filled |
| `draft:saved` | `<form>` | `{ saver, data }` |
| `draft:restored` | `<form>` | `{ saver, data, timestamp }` |
| `draft:cleared` | `<form>` | `{ saver }` |

---

## Public API

### Form

| Method | Returns | Description |
|--------|---------|-------------|
| `validateField(field)` | `Promise<boolean>` | Validate a single field |
| `validateGroup(group)` | `boolean` | Validate a group container |
| `validateForm()` | `Promise<boolean>` | Validate all fields and groups |
| `validateCurrentStep()` | `boolean` | Validate fields in current wizard step |
| `nextStep()` | `void` | Advance wizard (if valid) |
| `prevStep()` | `void` | Go back in wizard |
| `goToStep(index)` | `void` | Jump to wizard step |
| `showSummary(type, message)` | `void` | Show summary: `error` or `success` |
| `hideSummary()` | `void` | Hide summary |
| `setFieldError(name, message)` | `void` | Programmatically set an error |
| `clearFieldError(name)` | `void` | Clear a field error |
| `getData()` | `Object` | Serialize form to plain object |
| `getMaskedRawValues()` | `Object` | Get raw (unmasked) values for masked fields |
| `reset()` | `void` | Reset form state and UI |
| `destroy()` | `void` | Remove all listeners and instances |

### InputMask

| Method | Returns | Description |
|--------|---------|-------------|
| `getRawValue()` | `string` | Unmasked digits/letters |
| `getMaskedValue()` | `string` | Current masked value |
| `setValue(raw)` | `void` | Set value from raw string |
| `destroy()` | `void` | Remove listeners |

### Wizard

| Method | Returns | Description |
|--------|---------|-------------|
| `next()` | `Promise<void>` | Validate and advance |
| `prev()` | `void` | Go back |
| `goToStep(index)` | `Promise<void>` | Jump to step (respects `linear`) |
| `getCurrentStep()` | `number` | Current step index |
| `getTotalSteps()` | `number` | Total number of steps |
| `attachForm(formInstance)` | `void` | Link to a Form for validation |
| `destroy()` | `void` | Cleanup |

### FileUpload

| Method | Returns | Description |
|--------|---------|-------------|
| `getFiles()` | `File[]` | Current file list |
| `removeFile(index)` | `void` | Remove file by index |
| `clear()` | `void` | Remove all files |
| `destroy()` | `void` | Cleanup |

### DraftSaver

| Method | Returns | Description |
|--------|---------|-------------|
| `save()` | `void` | Save draft now |
| `restore()` | `boolean` | Restore draft from storage |
| `clear()` | `void` | Delete draft |
| `getDraftAge()` | `number|null` | Draft age in ms |
| `destroy()` | `void` | Cleanup |

### OtpInput

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | `string` | Full code from all digits |
| `setValue(code)` | `void` | Fill boxes from a string |
| `clear()` | `void` | Empty all boxes, focus first |
| `destroy()` | `void` | Cleanup |

### PasswordStrength

| Method | Returns | Description |
|--------|---------|-------------|
| `calculate(value)` | `{score,feedback,rules}` | Compute strength (0–4) |
| `destroy()` | `void` | Cleanup |

---

**Author:** George Kiosov | **License:** MIT
