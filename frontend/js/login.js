import { authAPI } from './api.js';
import { redirectIfLoggedIn, showError, hideError } from './auth.js';

redirectIfLoggedIn();

const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorMsg);

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showError(errorMsg, 'Please enter your username and password.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    try {
        await authAPI.login(username, password);
        window.location.href = 'chat.html';
    } catch (err) {
        showError(errorMsg, err.message || 'Invalid username or password.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});
