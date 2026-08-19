// src/js/__tests__/modal.test.js
// Это тест для модального окна, написанный простым языком

import { Modal } from '../modules/modal/_modal.js';

// Очищаем DOM перед каждым тестом, чтобы тесты не мешали друг другу
beforeEach(() => {
    document.body.innerHTML = `
    <div id="test-modal" class="modal" data-modal>
      <div class="modal__content">
        <h3>Тестовая модалка</h3>
        <button data-modal-close>Закрыть</button>
      </div>
    </div>
    <button data-modal-trigger="test-modal">Открыть</button>
  `;
});

describe('Модальное окно', () => {

    test('1. Открывается при вызове .open() и получает класс is-open', () => {
        // Берем нашу модалку
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        // Вызываем открытие
        modal.open();

        // Проверяем: появился ли класс "is-open"?
        expect(modalElement.classList.contains('is-open')).toBe(true);
    });

    test('2. Закрывается при нажатии на кнопку закрытия', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);
        const closeButton = modalElement.querySelector('[data-modal-close]');

        // Открываем
        modal.open();
        // Кликаем по кнопке закрытия
        closeButton.click();

        // Проверяем: класс "is-open" исчез?
        expect(modalElement.classList.contains('is-open')).toBe(false);
    });

    test('3. Закрывается по нажатию Escape', () => {
        const modalElement = document.getElementById('test-modal');
        const modal = new Modal(modalElement);

        // Открываем
        modal.open();

        // Имитируем нажатие клавиши Escape
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        // Проверяем: модалка закрылась?
        expect(modalElement.classList.contains('is-open')).toBe(false);
    });
});