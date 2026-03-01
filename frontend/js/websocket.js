// ─── WebSocket Service (SockJS + STOMP) ──────────────────────────────────
// SockJS and Stomp are loaded as globals from CDN in chat.html.

let stompClient = null;

/**
 * Connect to WebSocket and subscribe to both personal message queue
 * and the WebRTC signal queue.
 *
 * @param {string} username       - logged-in user
 * @param {function} onMessage    - callback for chat messages
 * @param {function} onSignal     - callback for WebRTC signals
 */
export function connectWebSocket(username, onMessage, onSignal) {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // silence STOMP debug logs

    stompClient.connect({}, () => {
        // 1. Chat messages
        stompClient.subscribe(`/user/${username}/queue/messages`, (frame) => {
            try { onMessage(JSON.parse(frame.body)); }
            catch (e) { console.error('Chat message parse error', e); }
        });

        // 2. WebRTC signaling
        stompClient.subscribe(`/user/${username}/queue/signal`, (frame) => {
            try { if (onSignal) onSignal(JSON.parse(frame.body)); }
            catch (e) { console.error('Signal parse error', e); }
        });
    }, (err) => {
        console.error('WebSocket error:', err);
    });
}

export function sendWSMessage(message) {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/chat', {}, JSON.stringify(message));
    }
}

export function sendSignal(signal) {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/signal', {}, JSON.stringify(signal));
    }
}

export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.disconnect();
        stompClient = null;
    }
}
