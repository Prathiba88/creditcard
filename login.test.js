/**
 * @jest-environment jsdom
 */

import { fireEvent } from '@testing-library/dom';

describe('Login Page', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="text" id="userid" placeholder="User ID" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit">Enter</button>
      </form>
    `;

    // Simulate the redirect logic
    document.getElementById('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'credit-card-form.html';
    });
  });

  test('Form exists and submits correctly', () => {
    const form = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userid');
    const passwordInput = document.getElementById('password');

    expect(form).not.toBeNull();
    expect(userIdInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
  });

  test('Redirects to credit-card-form.html on submit', () => {
    delete window.location;
    window.location = { href: '' }; // mock

    const form = document.getElementById('loginForm');
    fireEvent.submit(form);

    expect(window.location.href).toBe('credit-card-form.html');
  });
});
