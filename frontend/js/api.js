// ─── API Service ───────────────────────────────────────────────────────────
const BASE_URL = 'https://chatbox-production-7371.up.railway.app/api';


function authHeaders() {
    const token = localStorage.getItem('chat_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = data.message || `Request failed (${res.status})`;
        throw new Error(message);
    }
    return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
    async login(username, password) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await handleResponse(res);
        if (data.token) {
            localStorage.setItem('chat_token', data.token);
            localStorage.setItem('chat_user', data.username);
        }
        return data;
    },

    async register(formData) {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        return handleResponse(res);
    },

    logout() {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_user');
    }
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatAPI = {
    async getMyProfile() {
        const res = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders() });
        return handleResponse(res);
    },

    async getUsers() {
        const res = await fetch(`${BASE_URL}/users`, { headers: authHeaders() });
        return handleResponse(res);
    },

    async getUserDetail(username) {
        const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}`, { headers: authHeaders() });
        return handleResponse(res);
    },

    async getMessages(sender, recipient) {
        const params = new URLSearchParams({ sender, recipient });
        const res = await fetch(`${BASE_URL}/messages?${params}`, { headers: authHeaders() });
        return handleResponse(res);
    },

    async uploadPicture(base64DataUrl) {
        const res = await fetch(`${BASE_URL}/users/me/picture`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ picture: base64DataUrl })
        });
        return handleResponse(res);
    }
};

