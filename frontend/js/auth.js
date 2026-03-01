// ─── Shared Auth Utilities ────────────────────────────────────────────────

/** Redirect to login if no token is stored. Call at the top of protected pages. */
export function requireAuth() {
    if (!localStorage.getItem('chat_token')) {
        window.location.href = 'login.html';
    }
}

/** Redirect to chat if already logged in. Call on login/register pages. */
export function redirectIfLoggedIn() {
    if (localStorage.getItem('chat_token')) {
        window.location.href = 'chat.html';
    }
}

/** Get the current username from localStorage. */
export function currentUser() {
    return localStorage.getItem('chat_user') || '';
}

/** Generate avatar initials from a full name or username. */
export function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

/** Get a deterministic hue from a string (for avatar colours). */
export function avatarHue(str = '') {
    return (str.charCodeAt(0) * 37) % 360;
}

/** Format ISO timestamp to HH:MM */
export function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Show an error alert element. */
export function showError(el, message) {
    el.textContent = message;
    el.classList.add('visible');
}

/** Hide an error alert element. */
export function hideError(el) {
    el.classList.remove('visible');
    el.textContent = '';
}
