import { authAPI } from './api.js';
import { redirectIfLoggedIn, showError, hideError } from './auth.js';

redirectIfLoggedIn();

const form = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorMsg);

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Basic client-side validation
    if (!fullName || !email || !username || !password) {
        showError(errorMsg, 'All fields are required.');
        return;
    }
    if (password.length < 6) {
        showError(errorMsg, 'Password must be at least 6 characters.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    try {
        await authAPI.register({ fullName, email, username, password });
        // Registration succeeded — redirect to login
        window.location.href = 'login.html';
    } catch (err) {
        showError(errorMsg, err.message || 'Registration failed. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
});
