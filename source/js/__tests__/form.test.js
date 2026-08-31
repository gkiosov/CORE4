// ==========================================
// Form, Wizard, DraftSaver, PasswordStrength Tests
// ==========================================

import { Form } from '../modules/form/_form.js';
import { Wizard } from '../modules/form/_wizard.js';
import { DraftSaver } from '../modules/form/_draft-saver.js';
import { PasswordStrength } from '../modules/form/_password-strength.js';

describe('Form', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    const createFormHTML = () => `
        <form data-form id="test-form">
            <div class="form__group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" data-validate-required>
            </div>
            <div class="form__group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" data-validate-email>
            </div>
            <div class="form__group">
                <label for="age">Age</label>
                <input type="number" id="age" name="age" data-validate-number data-validate-min="18">
            </div>
            <button type="submit">Submit</button>
        </form>
    `;

    test('initializes with fields', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        expect(form.fields.length).toBe(3);
    });

    test('validates required field', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const nameField = document.getElementById('name');
        nameField.value = '';
        const valid = await form.validateField(nameField);

        expect(valid).toBe(false);
        const group = nameField.closest('.form__group');
        expect(group.classList.contains('is-invalid')).toBe(true);
    });

    test('validates email format', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const emailField = document.getElementById('email');
        emailField.value = 'invalid-email';
        const valid = await form.validateField(emailField);

        expect(valid).toBe(false);
    });

    test('validates correct email', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const emailField = document.getElementById('email');
        emailField.value = 'test@example.com';
        const valid = await form.validateField(emailField);

        expect(valid).toBe(true);
    });

    test('validates min value', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const ageField = document.getElementById('age');
        ageField.value = '10';
        const valid = await form.validateField(ageField);

        expect(valid).toBe(false);
    });

    test('validates number type', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const ageField = document.getElementById('age');
        ageField.value = 'not-a-number';
        const valid = await form.validateField(ageField);

        expect(valid).toBe(false);
    });

    test('valid form returns true', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        document.getElementById('name').value = 'John';
        document.getElementById('email').value = 'john@example.com';
        document.getElementById('age').value = '25';

        const valid = await form.validateForm();
        expect(valid).toBe(true);
    });

    test('invalid form returns false', async () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        const valid = await form.validateForm();
        expect(valid).toBe(false);
    });

    test('reset clears validation state', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        form.reset();
        const groups = formEl.querySelectorAll('.form__group');
        groups.forEach(g => {
            expect(g.classList.contains('is-invalid')).toBe(false);
        });
    });

    test('getData returns form values', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        document.getElementById('name').value = 'John';
        const data = form.getData();
        expect(data.name).toBe('John');
    });

    test('dispatches form:initialized event', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const handler = jest.fn();
        formEl.addEventListener('form:initialized', handler);

        new Form(formEl);
        expect(handler).toHaveBeenCalled();
    });

    test('destroy removes listeners', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('test-form');
        const form = new Form(formEl);

        form.destroy();
        expect(form.fields.length).toBe(0);
    });
});

describe('Wizard', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    const createWizardHTML = () => `
        <div data-wizard id="test-wizard">
            <div data-wizard-step="Step 1">
                <input type="text" name="field1" data-validate-required>
            </div>
            <div data-wizard-step="Step 2">
                <input type="email" name="field2" data-validate-email>
            </div>
            <div data-wizard-step="Step 3">
                <input type="text" name="field3">
            </div>
            <button data-wizard-prev>Back</button>
            <button data-wizard-next>Next</button>
            <button data-wizard-submit>Submit</button>
        </div>
    `;

    test('initializes with steps', () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        expect(wizard.steps.length).toBe(3);
        expect(wizard.getCurrentStep()).toBe(0);
    });

    test('next() advances to next step', async () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        // Fill required field
        el.querySelector('input[name="field1"]').value = 'test';

        await wizard.next();
        expect(wizard.getCurrentStep()).toBe(1);
    });

    test('prev() goes back', async () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        el.querySelector('input[name="field1"]').value = 'test';
        await wizard.next();
        wizard.prev();
        expect(wizard.getCurrentStep()).toBe(0);
    });

    test('goToStep navigates to specific step', () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        wizard.goToStep(2);
        expect(wizard.getCurrentStep()).toBe(2);
    });

    test('getTotalSteps returns count', () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        expect(wizard.getTotalSteps()).toBe(3);
    });

    test('destroy removes listeners', () => {
        document.body.innerHTML = createWizardHTML();
        const el = document.getElementById('test-wizard');
        const wizard = new Wizard(el);

        wizard.destroy();
        expect(wizard._handlers.length).toBe(0);
    });
});

describe('DraftSaver', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
    });

    const createFormHTML = () => `
        <form id="draft-form">
            <input type="text" name="username" value="">
            <input type="email" name="email" value="">
        </form>
    `;

    test('initializes and restores on load', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('draft-form');

        // Pre-populate storage
        localStorage.setItem('core4_draft_draft-form_', JSON.stringify({
            timestamp: Date.now(),
            data: { username: 'saved_user', email: 'saved@example.com' }
        }));

        const saver = new DraftSaver(formEl);
        expect(saver).toBeInstanceOf(DraftSaver);
    });

    test('save stores data in localStorage', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('draft-form');
        const saver = new DraftSaver(formEl, { restoreOnLoad: false });

        formEl.querySelector('[name="username"]').value = 'john';
        formEl.querySelector('[name="email"]').value = 'john@example.com';

        saver.save();

        const stored = JSON.parse(localStorage.getItem(saver.options.storageKey));
        expect(stored.data.username).toBe('john');
        expect(stored.data.email).toBe('john@example.com');
    });

    test('clear removes data from localStorage', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('draft-form');
        const saver = new DraftSaver(formEl, { restoreOnLoad: false });

        saver.save();
        saver.clear();

        expect(localStorage.getItem(saver.options.storageKey)).toBeNull();
    });

    test('getDraftAge returns number', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('draft-form');
        const saver = new DraftSaver(formEl, { restoreOnLoad: false });

        saver.save();
        const age = saver.getDraftAge();
        expect(typeof age).toBe('number');
        expect(age).toBeGreaterThanOrEqual(0);
    });

    test('destroy removes listeners', () => {
        document.body.innerHTML = createFormHTML();
        const formEl = document.getElementById('draft-form');
        const saver = new DraftSaver(formEl, { restoreOnLoad: false });

        saver.destroy();
        expect(saver._handlers.length).toBe(0);
    });
});

describe('PasswordStrength', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('calculates score for empty password', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('');
        expect(result.score).toBe(0);
    });

    test('calculates score for weak password', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('123');
        expect(result.score).toBeLessThanOrEqual(1);
    });

    test('calculates score for strong password', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('MyStr0ng!Pass');
        expect(result.score).toBeGreaterThanOrEqual(2);
    });

    test('penalizes common patterns', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('password123!');
        expect(result.feedback.some(f => f.includes('common'))).toBe(true);
    });

    test('penalizes sequential characters', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('abcdefgh');
        expect(result.feedback.some(f => f.includes('sequential'))).toBe(true);
    });

    test('penalizes repeated characters', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        const result = ps.calculate('aaaabbbb');
        expect(result.feedback.some(f => f.includes('repeated'))).toBe(true);
    });

    test('stores score on field dataset', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        field.value = 'Test123!';
        field.dispatchEvent(new Event('input'));
        expect(field.dataset.strengthScore).toBeDefined();
    });

    test('dispatches password:strength event', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const handler = jest.fn();
        field.addEventListener('password:strength', handler);

        new PasswordStrength(field, { showIndicator: false });
        field.value = 'test';
        field.dispatchEvent(new Event('input'));

        expect(handler).toHaveBeenCalled();
    });

    test('destroy removes listener', () => {
        document.body.innerHTML = '<input type="password" id="pwd">';
        const field = document.getElementById('pwd');
        const ps = new PasswordStrength(field, { showIndicator: false });

        ps.destroy();
        expect(() => field.dispatchEvent(new Event('input'))).not.toThrow();
    });
});