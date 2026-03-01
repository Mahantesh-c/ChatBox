/**
 * theme.js — Light / Dark mode utility
 * Reads saved theme from localStorage, applies it once on load,
 * and exports helpers to toggle / query the current theme.
 */

const STORAGE_KEY = 'chat_theme';
const DARK = 'dark';
const LIGHT = 'light';

/** Apply a theme to <html data-theme="..."> */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === LIGHT ? LIGHT : DARK);
    localStorage.setItem(STORAGE_KEY, theme);
}

/** Call once when the page loads. */
export function initTheme() {
    // Prefer saved preference; fall back to OS setting
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? DARK : LIGHT));
}

/** Toggle between dark and light, returns the NEW theme string. */
export function toggleTheme() {
    const current = localStorage.getItem(STORAGE_KEY) || DARK;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    return next;
}

/** Returns true if currently in dark mode. */
export function isDark() {
    return (localStorage.getItem(STORAGE_KEY) || DARK) === DARK;
}
