import { chatAPI, authAPI } from './api.js';
import { connectWebSocket, sendWSMessage, sendSignal, disconnectWebSocket } from './websocket.js';
import { initWebRTC, startCall, answerCall, setRemoteAnswer, addIceCandidate, hangUp, toggleMute, toggleCamera } from './webrtc.js';
import { requireAuth, currentUser, getInitials, avatarHue, formatTime } from './auth.js';

requireAuth();
const ME = currentUser();

// ─── Mobile layout helpers ────────────────────────────────────────────────
const sidebar = document.querySelector('.sidebar');
const chatPanel = document.querySelector('.chat-panel');

function isMobile() { return window.innerWidth <= 640; }

function showChatMobile() {
    if (!isMobile()) return;
    sidebar.classList.add('mobile-hidden');
    chatPanel.classList.add('mobile-visible');
}

function showSidebarMobile() {
    if (!isMobile()) return;
    sidebar.classList.remove('mobile-hidden');
    chatPanel.classList.remove('mobile-visible');
}

// Expose globally for inline onclick  
window.closeMyProfile = () => { document.getElementById('profileDrawer').style.display = 'none'; document.getElementById('profileBackdrop').style.display = 'none'; };
window.closeContactPanel = () => { document.getElementById('contactDrawer').style.display = 'none'; document.getElementById('contactBackdrop').style.display = 'none'; };


const logoutBtn = document.getElementById('logoutBtn');
const userListEl = document.getElementById('userList');
const userListMsg = document.getElementById('userListMsg');
const searchInput = document.getElementById('searchInput');
const noSelectionState = document.getElementById('noSelectionState');
const activeChat = document.getElementById('activeChat');
const chatAvatar = document.getElementById('chatAvatar');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderStatus = document.getElementById('chatHeaderStatus');
const chatOnlineDot = document.getElementById('chatOnlineDot');
const chatHeaderAvatarWrap = document.getElementById('chatHeaderAvatarWrap');
const messagesArea = document.getElementById('messagesArea');
const noMessagesState = document.getElementById('noMessagesState');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const audioCallBtn = document.getElementById('audioCallBtn');
const videoCallBtn = document.getElementById('videoCallBtn');
const infoBtn = document.getElementById('infoBtn');

// Sidebar my-profile
const myProfileBtn = document.getElementById('myProfileBtn');
const sidebarMyAvatar = document.getElementById('sidebarMyAvatar');
const sidebarMyName = document.getElementById('sidebarMyName');

// My profile drawer
const profileDrawer = document.getElementById('profileDrawer');
const profileBackdrop = document.getElementById('profileBackdrop');
const myAvatarWrap = document.getElementById('myAvatarWrap');
const drawerAvatarImg = document.getElementById('drawerAvatarImg');
const pictureInput = document.getElementById('pictureInput');
const drawerFullName = document.getElementById('drawerFullName');
const drawerUsername = document.getElementById('drawerUsername');
const drawerEmail = document.getElementById('drawerEmail');
const drawerRole = document.getElementById('drawerRole');
const drawerStatus = document.getElementById('drawerStatus');
const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');

// Contact panel
const contactDrawer = document.getElementById('contactDrawer');
const contactBackdrop = document.getElementById('contactBackdrop');
const contactAvatarImg = document.getElementById('contactAvatarImg');
const contactFullName = document.getElementById('contactFullName');
const contactUsername = document.getElementById('contactUsername');
const contactStatus = document.getElementById('contactStatus');
const contactCallBtn = document.getElementById('contactCallBtn');
const contactVideoBtn = document.getElementById('contactVideoBtn');

// Call UI
const incomingCallModal = document.getElementById('incomingCallModal');
const incomingAvatar = document.getElementById('incomingAvatar');
const incomingCallerName = document.getElementById('incomingCallerName');
const incomingCallType = document.getElementById('incomingCallType');
const acceptBtn = document.getElementById('acceptBtn');
const declineBtn = document.getElementById('declineBtn');
const activeCallOverlay = document.getElementById('activeCallOverlay');
const videoContainer = document.getElementById('videoContainer');
const audioCallInfo = document.getElementById('audioCallInfo');
const activeCallAvatar = document.getElementById('activeCallAvatar');
const activeCallName = document.getElementById('activeCallName');
const callTimer = document.getElementById('callTimer');
const callStatus = document.getElementById('callStatus');
const muteBtn = document.getElementById('muteBtn');
const hangUpBtn = document.getElementById('hangUpBtn');
const cameraBtn = document.getElementById('cameraBtn');
const remoteVideo = document.getElementById('remoteVideo');
const localVideo = document.getElementById('localVideo');

// ─── State ────────────────────────────────────────────────────────────────
let myProfile = null;
let selectedUser = null;
let users = [];
let pendingSignal = null;
let timerInterval = null;
let timerSeconds = 0;

// ─── Avatar helper (supports photo) ───────────────────────────────────────
function renderAvatar(el, user) {
    // user can be { username, fullName, profilePicture }
    if (user.profilePicture) {
        el.innerHTML = `<img src="${user.profilePicture}" alt="${escHtml(user.fullName || user.username)}" />`;
        el.style.background = 'none';
    } else {
        el.innerHTML = getInitials(user.fullName || user.username);
        el.style.background = `hsl(${avatarHue(user.username)},60%,42%)`;
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────
initWebRTC({
    me: ME,
    onRemote: (stream) => { remoteVideo.srcObject = stream; },
    onLocal: (stream, callType) => {
        localVideo.srcObject = stream;
        if (callType === 'video') { videoContainer.style.display = 'block'; audioCallInfo.style.display = 'none'; cameraBtn.style.display = 'flex'; }
    },
    onEnded: () => closeCallUI()
});

connectWebSocket(ME, handleIncomingMessage, handleSignal);
loadMyProfile();
loadUsers();

// ─── My Profile ────────────────────────────────────────────────────────────
async function loadMyProfile() {
    try {
        myProfile = await chatAPI.getMyProfile();
        renderMyProfile(myProfile);
    } catch {
        sidebarMyName.textContent = ME;
        sidebarMyAvatar.textContent = getInitials(ME);
        sidebarMyAvatar.style.background = `hsl(${avatarHue(ME)},60%,42%)`;
    }
}

function renderMyProfile(p) {
    // Sidebar mini
    renderAvatar(sidebarMyAvatar, p);
    sidebarMyName.textContent = p.fullName || p.username;

    // Drawer
    renderAvatarLarge(drawerAvatarImg, p);
    drawerFullName.textContent = p.fullName || '—';
    drawerUsername.textContent = '@' + p.username;
    drawerEmail.textContent = p.email || '—';
    drawerRole.textContent = p.role || 'USER';
    drawerStatus.innerHTML = p.online
        ? '<span style="color:var(--success)">● Online</span>'
        : '<span style="color:var(--text-muted)">Offline</span>';
}

function renderAvatarLarge(el, user) {
    if (user.profilePicture) {
        el.innerHTML = `<img src="${user.profilePicture}" alt="${escHtml(user.fullName || user.username)}" />`;
        el.style.background = 'none';
    } else {
        el.innerHTML = getInitials(user.fullName || user.username);
        el.style.background = `hsl(${avatarHue(user.username)},60%,42%)`;
    }
}

// ─── Open / close My Profile drawer ──────────────────────────────────────
myProfileBtn.addEventListener('click', () => {
    profileDrawer.style.display = 'flex';
    profileBackdrop.style.display = 'block';
});

drawerLogoutBtn.addEventListener('click', doLogout);
logoutBtn.addEventListener('click', doLogout);

function doLogout() {
    hangUp(true);
    disconnectWebSocket();
    authAPI.logout();
    window.location.href = 'login.html';
}

// ─── Profile picture upload ────────────────────────────────────────────────
myAvatarWrap.addEventListener('click', () => pictureInput.click());
pictureInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2 MB.', true); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        try {
            await chatAPI.uploadPicture(dataUrl);
            // Update local state
            if (myProfile) myProfile.profilePicture = dataUrl;
            renderMyProfile({ ...(myProfile || {}), profilePicture: dataUrl, username: ME });
            showToast('Profile picture updated!');
        } catch (err) {
            showToast(err.message || 'Upload failed.', true);
        }
    };
    reader.readAsDataURL(file);
});

// ─── Contact detail panel ──────────────────────────────────────────────────
async function openContactPanel(user) {
    contactDrawer.style.display = 'flex';
    contactBackdrop.style.display = 'block';
    // Use cached data first, then fetch full detail
    renderAvatarLarge(contactAvatarImg, user);
    contactFullName.textContent = user.fullName || user.username;
    contactUsername.textContent = '@' + user.username;
    contactStatus.innerHTML = user.online
        ? '<span style="color:var(--success)">● Online</span>'
        : '<span style="color:var(--text-muted)">Offline</span>';

    // Wire call buttons
    contactCallBtn.onclick = () => { closeContactPanel(); initiateCall('audio'); };
    contactVideoBtn.onclick = () => { closeContactPanel(); initiateCall('video'); };

    try {
        const detail = await chatAPI.getUserDetail(user.username);
        renderAvatarLarge(contactAvatarImg, detail);
        contactStatus.innerHTML = detail.online
            ? '<span style="color:var(--success)">● Online</span>'
            : '<span style="color:var(--text-muted)">Offline</span>';
    } catch { }
}

function closeContactPanel() {
    contactDrawer.style.display = 'none';
    contactBackdrop.style.display = 'none';
}
window.closeContactPanel = closeContactPanel; // expose for inline onclick

// Chat header avatar / info button → open contact panel
chatHeaderAvatarWrap.addEventListener('click', () => selectedUser && openContactPanel(selectedUser));
infoBtn.addEventListener('click', () => selectedUser && openContactPanel(selectedUser));

// Mobile: back button → return to sidebar
const mobileBackBtn = document.getElementById('mobileBackBtn');
if (mobileBackBtn) mobileBackBtn.addEventListener('click', showSidebarMobile);


// ─── Search contacts ──────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.contact-item').forEach(el => {
        el.style.display = el.dataset.name.includes(q) ? '' : 'none';
    });
});

// ─── Send message ─────────────────────────────────────────────────────────
function handleSend() {
    const content = messageInput.value.trim();
    if (!content || !selectedUser) return;
    const msg = { content, senderUsername: ME, recipientUsername: selectedUser.username, timestamp: new Date().toISOString(), status: 'SENT' };
    sendWSMessage(msg);
    appendMessage(msg);
    messageInput.value = '';
    messageInput.focus();
}
sendBtn.addEventListener('click', handleSend);
messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });

// ─── Calls ────────────────────────────────────────────────────────────────
audioCallBtn.addEventListener('click', () => initiateCall('audio'));
videoCallBtn.addEventListener('click', () => initiateCall('video'));

async function initiateCall(callType) {
    if (!selectedUser) return;
    showActiveCallUI(selectedUser, callType, false);
    try { await startCall(selectedUser.username, callType); }
    catch { alert('Could not access microphone/camera.'); closeCallUI(); }
}

acceptBtn.addEventListener('click', async () => {
    if (!pendingSignal) return;
    const sig = pendingSignal; pendingSignal = null;
    hideIncomingModal();
    const caller = users.find(u => u.username === sig.from) || { username: sig.from, fullName: sig.from };
    showActiveCallUI(caller, sig.callType, false);
    try { await answerCall(sig); startTimer(); }
    catch { closeCallUI(); }
});

declineBtn.addEventListener('click', () => {
    if (pendingSignal) { sendSignal({ type: 'call-reject', from: ME, to: pendingSignal.from, payload: '' }); pendingSignal = null; }
    hideIncomingModal();
});

hangUpBtn.addEventListener('click', () => { hangUp(true); closeCallUI(); });
muteBtn.addEventListener('click', () => { const m = toggleMute(); muteBtn.classList.toggle('active', m); muteBtn.title = m ? 'Unmute' : 'Mute'; });
cameraBtn.addEventListener('click', () => { const o = toggleCamera(); cameraBtn.classList.toggle('active', o); cameraBtn.title = o ? 'Camera Off' : 'Camera On'; });

// ─── Signal handler ───────────────────────────────────────────────────────
function handleSignal(signal) {
    switch (signal.type) {
        case 'call-offer': pendingSignal = signal; showIncomingModal(signal); break;
        case 'call-answer': setRemoteAnswer(signal); callStatus.textContent = 'Connected'; startTimer(); break;
        case 'ice-candidate': addIceCandidate(signal); break;
        case 'call-reject': closeCallUI(); showToast(`${signal.from} declined the call.`); break;
        case 'call-end': hangUp(false); closeCallUI(); showToast('Call ended.'); break;
    }
}
function handleIncomingMessage(msg) {
    if (selectedUser && msg.senderUsername === selectedUser.username) {
        upgradeTicksToDelivered(); // other user is active → mark our sent msgs as delivered
        appendMessage(msg);
    }
}


// ─── Users ────────────────────────────────────────────────────────────────
async function loadUsers() {
    try {
        const all = await chatAPI.getUsers();
        users = all.filter(u => u.username !== ME);
        renderUserList();
    } catch { userListMsg.textContent = 'Could not load users.'; }
}

function renderUserList() {
    userListEl.innerHTML = '';
    if (!users.length) { userListMsg.textContent = 'No other users found.'; userListEl.appendChild(userListMsg); return; }
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'contact-item' + (selectedUser?.username === user.username ? ' active' : '');
        item.dataset.username = user.username;
        item.dataset.name = (user.fullName || user.username).toLowerCase();

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'contact-avatar-wrap';
        const av = document.createElement('div');
        av.className = 'avatar';
        renderAvatar(av, user);
        const dot = document.createElement('span');
        dot.className = `contact-status-dot ${user.online ? 'online' : 'offline'}`;
        avatarWrap.appendChild(av);
        avatarWrap.appendChild(dot);

        const info = document.createElement('div');
        info.style.minWidth = '0';
        info.innerHTML = `
            <p class="contact-name">${escHtml(user.fullName || user.username)}</p>
            <p class="contact-sub ${user.online ? 'online' : ''}">${user.online ? '● Online' : 'Offline'}</p>`;

        item.appendChild(avatarWrap);
        item.appendChild(info);
        item.addEventListener('click', () => selectUser(user));
        userListEl.appendChild(item);
    });
}

async function selectUser(user) {
    selectedUser = user;
    document.querySelectorAll('.contact-item').forEach(el => el.classList.toggle('active', el.dataset.username === user.username));
    renderAvatar(chatAvatar, user);
    chatHeaderName.textContent = user.fullName || user.username;
    chatHeaderStatus.textContent = user.online ? '● Online' : 'Offline';
    chatHeaderStatus.className = 'chat-peer-status' + (user.online ? ' online' : '');
    chatOnlineDot.style.display = user.online ? 'block' : 'none';
    noSelectionState.style.display = 'none';
    activeChat.style.display = 'flex';
    showChatMobile();   // ← slide to chat on mobile
    clearMessages();
    try { const h = await chatAPI.getMessages(ME, user.username); h.forEach(appendMessage); } catch { }
    messageInput.focus();
}


// ─── Messages ─────────────────────────────────────────────────────────────
let lastDateLabel = null;

function clearMessages() {
    messagesArea.innerHTML = '';
    noMessagesState.style.display = '';
    messagesArea.appendChild(noMessagesState);
    lastDateLabel = null;
}

function appendMessage(msg) {
    noMessagesState.style.display = 'none';
    const date = new Date(msg.timestamp || Date.now());
    const dayLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (dayLabel !== lastDateLabel) {
        lastDateLabel = dayLabel;
        const sep = document.createElement('div');
        sep.className = 'day-sep';
        sep.textContent = dayLabel === new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) ? 'Today' : dayLabel;
        messagesArea.appendChild(sep);
    }
    const isMine = msg.senderUsername === ME;
    const wrap = document.createElement('div'); wrap.className = `bubble-wrap ${isMine ? 'mine' : 'theirs'}`;
    const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = msg.content;

    const meta = document.createElement('div'); meta.className = 'bubble-meta';
    const time = document.createElement('span'); time.className = 'bubble-time'; time.textContent = formatTime(msg.timestamp);
    meta.appendChild(time);

    // Tick indicator for outgoing messages
    if (isMine) {
        const ticks = document.createElement('span');
        ticks.className = 'msg-ticks';
        // If recipient is currently selected & online → delivered (✓✓); else just sent (✓)
        const isDelivered = selectedUser && selectedUser.online;
        ticks.innerHTML = isDelivered
            ? `<svg class="tick delivered" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg" title="Delivered">
                <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 5l3.5 3.5L16 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>`
            : `<svg class="tick sent" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" title="Sent">
                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>`;
        ticks.dataset.status = isDelivered ? 'delivered' : 'sent';
        meta.appendChild(ticks);
    }

    wrap.appendChild(bubble);
    wrap.appendChild(meta);
    messagesArea.appendChild(wrap);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ─── Upgrade pending sent ticks → delivered when we receive a message back ──
function upgradeTicksToDelivered() {
    document.querySelectorAll('.msg-ticks[data-status="sent"]').forEach(ticks => {
        ticks.dataset.status = 'delivered';
        ticks.innerHTML = `<svg class="tick delivered" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg" title="Delivered">
            <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 5l3.5 3.5L16 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`;
    });
}


// ─── Call UI helpers ──────────────────────────────────────────────────────
function showIncomingModal(signal) {
    const caller = users.find(u => u.username === signal.from) || { username: signal.from, fullName: signal.from };
    renderCallAvatar(incomingAvatar, caller);
    incomingCallerName.textContent = caller.fullName || signal.from;
    incomingCallType.textContent = signal.callType === 'video' ? '📹 Incoming Video Call' : '📞 Incoming Voice Call';
    incomingCallModal.style.display = 'flex';
}
function hideIncomingModal() { incomingCallModal.style.display = 'none'; }

function showActiveCallUI(user, callType) {
    renderCallAvatar(activeCallAvatar, user);
    activeCallName.textContent = user.fullName || user.username;
    callTimer.textContent = '00:00';
    callStatus.textContent = 'Calling…';
    if (callType === 'video') { videoContainer.style.display = 'block'; audioCallInfo.style.display = 'none'; cameraBtn.style.display = 'flex'; }
    else { videoContainer.style.display = 'none'; audioCallInfo.style.display = 'flex'; cameraBtn.style.display = 'none'; }
    activeCallOverlay.style.display = 'flex';
}

function renderCallAvatar(el, user) {
    if (user.profilePicture) {
        el.innerHTML = `<img src="${user.profilePicture}" alt="" />`;
        el.style.background = 'none';
    } else {
        el.innerHTML = getInitials(user.fullName || user.username);
        el.style.background = `hsl(${avatarHue(user.username)},60%,42%)`;
    }
}

function closeCallUI() {
    activeCallOverlay.style.display = 'none'; incomingCallModal.style.display = 'none';
    stopTimer(); remoteVideo.srcObject = null; localVideo.srcObject = null;
    muteBtn.classList.remove('active'); cameraBtn.classList.remove('active');
    callTimer.textContent = '00:00';
}

function startTimer() {
    timerSeconds = 0; clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds++;
        callTimer.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;
        callStatus.textContent = 'Connected';
    }, 1000);
}
function stopTimer() { clearInterval(timerInterval); timerInterval = null; timerSeconds = 0; }

function showToast(msg, isError = false) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        background: isError ? 'hsla(0,78%,28%,0.95)' : 'hsla(224,22%,18%,0.95)',
        color: 'white', padding: '11px 22px', borderRadius: '12px', fontSize: '13px',
        fontWeight: '600', zIndex: 9999, border: `1px solid ${isError ? 'var(--error-border)' : 'var(--border-active)'}`,
        backdropFilter: 'blur(14px)', whiteSpace: 'nowrap'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

function escHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
