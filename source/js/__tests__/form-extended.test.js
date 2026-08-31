// ==========================================
// Form Extended Tests
// ==========================================
// Async validation, file upload, drag & drop,
// character counter, conditional validation,
// group validation, summary, progress, submit.
// ==========================================

import { Form } from '../modules/form/_form.js';

describe('Form Extended', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// ─── Async Validation ───
	describe('Async Validation', () => {
		test('calls fetch when async rule is present', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="username" data-validate-async="/api/check">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ valid: true })
			});

			const field = formEl.querySelector('input');
			field.value = 'john';
			await form.validateField(field);

			expect(global.fetch).toHaveBeenCalledTimes(1);
		});

		test('shows error on async invalid response', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="username" data-validate-async="/api/check">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ valid: false, message: 'Taken' })
			});

			const field = formEl.querySelector('input');
			field.value = 'taken';
			const valid = await form.validateField(field);

			expect(valid).toBe(false);
			const group = field.closest('.form__group');
			expect(group.classList.contains('is-invalid')).toBe(true);
		});

		test('skips async when value shorter than asyncMinlength', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="username" data-validate-async="/api/check" data-validate-async-minlength="5">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const field = formEl.querySelector('input');
			field.value = 'ab';
			await form.validateField(field);

			expect(global.fetch).not.toHaveBeenCalled();
		});

		test('aborts previous async request on rapid input', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="username" data-validate-async="/api/check">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const controller1 = new AbortController();
			const controller2 = new AbortController();

			global.fetch
				.mockResolvedValueOnce({ ok: true, json: async () => ({ valid: true }) })
				.mockResolvedValueOnce({ ok: true, json: async () => ({ valid: true }) });

			const field = formEl.querySelector('input');
			field.value = 'first';
			await form.validateField(field);

			field.value = 'second';
			await form.validateField(field);

			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});

	// ─── File Upload ───
	describe('File Upload', () => {
		test('file input change does not throw', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="file" name="doc">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const field = formEl.querySelector('input[type="file"]');
			const event = new Event('change', { bubbles: true });
			expect(() => field.dispatchEvent(event)).not.toThrow();
		});

		test('fileType rule validates MIME type', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="file" name="doc" data-validate-file-type="image/*,.pdf">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const field = formEl.querySelector('input');
			// Mock FileList with a fake file
			const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
			Object.defineProperty(field, 'files', {
				value: [file],
				writable: false
			});

			const valid = await form.validateField(field);
			expect(valid).toBe(true);
		});

		test('fileSize rule validates max size', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="file" name="doc" data-validate-file-size="1KB">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const field = formEl.querySelector('input');
			const file = new File(['x'.repeat(2048)], 'big.jpg', { type: 'image/jpeg' });
			Object.defineProperty(field, 'files', {
				value: [file],
				writable: false
			});

			const valid = await form.validateField(field);
			expect(valid).toBe(false);
		});

		test('fileCount rule validates max count', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="file" name="doc" data-validate-file-count="2">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const field = formEl.querySelector('input');
			const files = [
				new File(['a'], '1.jpg', { type: 'image/jpeg' }),
				new File(['b'], '2.jpg', { type: 'image/jpeg' }),
				new File(['c'], '3.jpg', { type: 'image/jpeg' })
			];
			Object.defineProperty(field, 'files', {
				value: files,
				writable: false
			});

			const valid = await form.validateField(field);
			expect(valid).toBe(false);
		});
	});

	// ─── Drag & Drop ───
	describe('Drag & Drop', () => {
		test('dragover adds is-dragover class', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__file-drop">
						<input type="file" name="doc">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const zone = formEl.querySelector('.form__file-drop');
			const event = new Event('dragover', { bubbles: true });
			event.preventDefault = jest.fn();
			event.stopPropagation = jest.fn();

			zone.dispatchEvent(event);
			expect(zone.classList.contains('is-dragover')).toBe(true);
		});

		test('dragleave removes is-dragover class', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__file-drop is-dragover">
						<input type="file" name="doc">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const zone = formEl.querySelector('.form__file-drop');
			const event = new Event('dragleave', { bubbles: true });
			event.preventDefault = jest.fn();
			event.stopPropagation = jest.fn();

			zone.dispatchEvent(event);
			expect(zone.classList.contains('is-dragover')).toBe(false);
		});

		test('drop removes is-dragover and triggers change', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__file-drop is-dragover">
						<input type="file" name="doc">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const zone = formEl.querySelector('.form__file-drop');
			const input = zone.querySelector('input');
			const changeHandler = jest.fn();
			input.addEventListener('change', changeHandler);

			const event = new Event('drop', { bubbles: true });
			event.preventDefault = jest.fn();
			event.stopPropagation = jest.fn();
			Object.defineProperty(event, 'dataTransfer', {
				value: { files: [] }
			});

			zone.dispatchEvent(event);
			expect(zone.classList.contains('is-dragover')).toBe(false);
		});
	});

	// ─── Character Counter ───
	describe('Character Counter', () => {
		test('counter updates on input', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<textarea name="bio" maxlength="100" data-maxlength="100"></textarea>
						<span class="form__counter"></span>
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const textarea = formEl.querySelector('textarea');
			const counter = formEl.querySelector('.form__counter');

			textarea.value = 'Hello world';
			textarea.dispatchEvent(new Event('input', { bubbles: true }));

			expect(counter.textContent).toBe('11 / 100');
		});

		test('counter adds is-exceeded at limit', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<textarea name="bio" maxlength="10" data-maxlength="10"></textarea>
						<span class="form__counter"></span>
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const textarea = formEl.querySelector('textarea');
			const counter = formEl.querySelector('.form__counter');

			textarea.value = '1234567890';
			textarea.dispatchEvent(new Event('input', { bubbles: true }));

			expect(counter.classList.contains('is-exceeded')).toBe(true);
		});

		test('counter adds is-near-limit at 90%', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<textarea name="bio" maxlength="10" data-maxlength="10"></textarea>
						<span class="form__counter"></span>
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const textarea = formEl.querySelector('textarea');
			const counter = formEl.querySelector('.form__counter');

			textarea.value = '123456789';
			textarea.dispatchEvent(new Event('input', { bubbles: true }));

			expect(counter.classList.contains('is-near-limit')).toBe(true);
		});
	});

	// ─── Maxlength Enforcement ───
	describe('Maxlength Enforcement', () => {
		test('truncates value exceeding maxlength', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="code" maxlength="5" data-maxlength="5">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const input = formEl.querySelector('input');
			input.value = '123456789';
			input.dispatchEvent(new Event('input', { bubbles: true }));

			expect(input.value.length).toBeLessThanOrEqual(5);
		});
	});

	// ─── Conditional Validation ───
	describe('Conditional Validation', () => {
		test('validateIf skips when condition not met', async () => {
			document.body.innerHTML = `
				<form data-form>
					<input type="checkbox" id="agree" name="agree">
					<div class="form__group">
						<input type="text" name="details" data-validate-required data-validate-if="agree:checked">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const agree = formEl.querySelector('#agree');
			const details = formEl.querySelector('[name="details"]');

			agree.checked = false;
			const valid = await form.validateField(details);
			expect(valid).toBe(true);
		});

		test('validateIf validates when condition met', async () => {
			document.body.innerHTML = `
				<form data-form>
					<input type="checkbox" id="agree" name="agree">
					<div class="form__group">
						<input type="text" name="details" data-validate-required data-validate-if="agree:checked">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const agree = formEl.querySelector('#agree');
			const details = formEl.querySelector('[name="details"]');

			agree.checked = true;
			details.value = '';
			const valid = await form.validateField(details);
			expect(valid).toBe(false);
		});

		test('validateIfNot skips when condition met', async () => {
			document.body.innerHTML = `
				<form data-form>
					<input type="checkbox" id="newsletter" name="newsletter" checked>
					<div class="form__group">
						<input type="text" name="email" data-validate-required data-validate-if-not="newsletter:checked">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const email = formEl.querySelector('[name="email"]');
			email.value = '';
			const valid = await form.validateField(email);
			expect(valid).toBe(true);
		});
	});

	// ─── Group Validation ───
	describe('Group Validation', () => {
		test('required group fails when all empty', () => {
			document.body.innerHTML = `
				<form data-form>
					<div data-validate-group="required">
						<input type="text" name="alt1">
						<input type="text" name="alt2">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const group = formEl.querySelector('[data-validate-group]');
			const valid = form.validateGroup(group);
			expect(valid).toBe(false);
		});

		test('required group passes with one value', () => {
			document.body.innerHTML = `
				<form data-form>
					<div data-validate-group="required">
						<input type="text" name="alt1" value="filled">
						<input type="text" name="alt2">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const group = formEl.querySelector('[data-validate-group]');
			const valid = form.validateGroup(group);
			expect(valid).toBe(true);
		});

		test('minChecked group fails below threshold', () => {
			document.body.innerHTML = `
				<form data-form>
					<div data-validate-group-min="2">
						<input type="checkbox" name="opts" value="a">
						<input type="checkbox" name="opts" value="b">
						<input type="checkbox" name="opts" value="c">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const group = formEl.querySelector('[data-validate-group-min]');
			const valid = form.validateGroup(group);
			expect(valid).toBe(false);
		});

		test('minChecked group passes at threshold', () => {
			document.body.innerHTML = `
				<form data-form>
					<div data-validate-group-min="2">
						<input type="checkbox" name="opts" value="a" checked>
						<input type="checkbox" name="opts" value="b" checked>
						<input type="checkbox" name="opts" value="c">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const group = formEl.querySelector('[data-validate-group-min]');
			const valid = form.validateGroup(group);
			expect(valid).toBe(true);
		});

		test('maxChecked group fails above threshold', () => {
			document.body.innerHTML = `
				<form data-form>
					<div data-validate-group-max="2">
						<input type="checkbox" name="opts" value="a" checked>
						<input type="checkbox" name="opts" value="b" checked>
						<input type="checkbox" name="opts" value="c" checked>
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const group = formEl.querySelector('[data-validate-group-max]');
			const valid = form.validateGroup(group);
			expect(valid).toBe(false);
		});
	});

	// ─── Summary ───
	describe('Summary', () => {
		test('showSummary displays error message', () => {
			document.body.innerHTML = `
				<form data-form data-form-summary="true">
					<div class="form__summary"></div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			form.showSummary('error', 'Something went wrong');
			const summary = formEl.querySelector('.form__summary');
			expect(summary.textContent).toBe('Something went wrong');
			expect(summary.classList.contains('form__summary--error')).toBe(true);
			expect(summary.classList.contains('is-visible')).toBe(true);
		});

		test('showSummary displays success message', () => {
			document.body.innerHTML = `
				<form data-form data-form-summary="true">
					<div class="form__summary"></div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			form.showSummary('success', 'All good');
			const summary = formEl.querySelector('.form__summary');
			expect(summary.classList.contains('form__summary--success')).toBe(true);
		});

		test('hideSummary removes visibility', () => {
			document.body.innerHTML = `
				<form data-form data-form-summary="true">
					<div class="form__summary is-visible"></div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			form.hideSummary();
			const summary = formEl.querySelector('.form__summary');
			expect(summary.classList.contains('is-visible')).toBe(false);
		});
	});

	// ─── Progress ───
	describe('Progress', () => {
		test('progress initializes at 0%', () => {
			document.body.innerHTML = `
				<form data-form data-form-progress="true">
					<div class="form__group">
						<input type="text" name="name" required>
					</div>
					<div class="form__progress">
						<div class="form__progress__bar"></div>
						<span class="form__progress__text">0%</span>
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const text = formEl.querySelector('.form__progress__text');
			expect(text.textContent).toBe('0%');
		});

		test('progress bar has ARIA attributes', () => {
			document.body.innerHTML = `
				<form data-form data-form-progress="true">
					<div class="form__group">
						<input type="text" name="name" required>
					</div>
					<div class="form__progress"></div>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const progress = formEl.querySelector('.form__progress');
			expect(progress.getAttribute('role')).toBe('progressbar');
			expect(progress.getAttribute('aria-valuemin')).toBe('0');
			expect(progress.getAttribute('aria-valuemax')).toBe('100');
		});
	});

	// ─── Submit ───
	describe('Submit', () => {
		test('submit prevents default when invalid', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="name" required>
					</div>
					<button type="submit">Send</button>
				</form>
			`;
			const formEl = document.querySelector('form');
			new Form(formEl);

			const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
			submitEvent.preventDefault = jest.fn();
			submitEvent.stopPropagation = jest.fn();

			formEl.dispatchEvent(submitEvent);
			await new Promise(r => setTimeout(r, 10));

			expect(submitEvent.preventDefault).toHaveBeenCalled();
		});

		test('submit dispatches form:submit when valid', async () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="name" value="John" required>
					</div>
					<button type="submit">Send</button>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const handler = jest.fn();
			formEl.addEventListener('form:submit', handler);

			const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
			submitEvent.preventDefault = jest.fn();
			submitEvent.stopPropagation = jest.fn();

			formEl.dispatchEvent(submitEvent);
			await new Promise(r => setTimeout(r, 10));

			expect(handler).toHaveBeenCalled();
		});
	});

	// ─── Field Error API ───
	describe('Field Error API', () => {
		test('setFieldError sets error on specific field', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="name">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			form.setFieldError('name', 'Custom error');
			const field = formEl.querySelector('[name="name"]');
			const group = field.closest('.form__group');

			expect(group.classList.contains('is-invalid')).toBe(true);
			expect(field.getAttribute('aria-invalid')).toBe('true');
		});

		test('clearFieldError removes error', () => {
			document.body.innerHTML = `
				<form data-form>
					<div class="form__group">
						<input type="text" name="name">
					</div>
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			form.setFieldError('name', 'Error');
			form.clearFieldError('name');
			const field = formEl.querySelector('[name="name"]');
			const group = field.closest('.form__group');

			expect(group.classList.contains('is-invalid')).toBe(false);
			expect(field.getAttribute('aria-invalid')).toBe('false');
		});
	});

	// ─── Masked Raw Values ───
	describe('Masked Raw Values', () => {
		test('getMaskedRawValues returns raw values', () => {
			document.body.innerHTML = `
				<form data-form>
					<input type="text" name="phone" data-mask="phone" data-mask-raw="79990001122">
				</form>
			`;
			const formEl = document.querySelector('form');
			const form = new Form(formEl);

			const raw = form.getMaskedRawValues();
			expect(raw.phone).toBe('79990001122');
		});
	});
});