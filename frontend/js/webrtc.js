/**
 * WebRTC peer-to-peer audio/video call manager.
 *
 * Usage:
 *   import { startCall, answerCall, addIceCandidate, hangUp, setRemoteAnswer } from './webrtc.js';
 */

import { sendSignal } from './websocket.js';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

let peerConnection = null;
let localStream = null;
let currentCallType = null; // 'audio' | 'video'
let remoteUser = null;
let currentUser = null;

// ── Callbacks set by chat.js ──────────────────────────────────────────────
let onRemoteStream = null;
let onLocalStream = null;
let onCallEnded = null;

export function initWebRTC({ me, onRemote, onLocal, onEnded }) {
    currentUser = me;
    onRemoteStream = onRemote;
    onLocalStream = onLocal;
    onCallEnded = onEnded;
}

// ── Initiate a call ───────────────────────────────────────────────────────
export async function startCall(toUser, callType) {
    remoteUser = toUser;
    currentCallType = callType;

    localStream = await getLocalStream(callType);
    if (onLocalStream) onLocalStream(localStream, callType);

    peerConnection = createPeer();
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    sendSignal({
        type: 'call-offer',
        callType,
        from: currentUser,
        to: toUser,
        payload: JSON.stringify(offer)
    });
}

// ── Answer an incoming call ───────────────────────────────────────────────
export async function answerCall(signal) {
    remoteUser = signal.from;
    currentCallType = signal.callType;

    localStream = await getLocalStream(signal.callType);
    if (onLocalStream) onLocalStream(localStream, signal.callType);

    peerConnection = createPeer();
    localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));

    const remoteDesc = new RTCSessionDescription(JSON.parse(signal.payload));
    await peerConnection.setRemoteDescription(remoteDesc);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendSignal({
        type: 'call-answer',
        callType: signal.callType,
        from: currentUser,
        to: signal.from,
        payload: JSON.stringify(answer)
    });
}

// ── Handle answer from callee ─────────────────────────────────────────────
export async function setRemoteAnswer(signal) {
    if (!peerConnection) return;
    const remoteDesc = new RTCSessionDescription(JSON.parse(signal.payload));
    await peerConnection.setRemoteDescription(remoteDesc);
}

// ── Add ICE candidate from remote ─────────────────────────────────────────
export async function addIceCandidate(signal) {
    if (!peerConnection) return;
    try {
        const candidate = new RTCIceCandidate(JSON.parse(signal.payload));
        await peerConnection.addIceCandidate(candidate);
    } catch (e) {
        console.warn('ICE candidate error:', e);
    }
}

// ── Hang up / end call ────────────────────────────────────────────────────
export function hangUp(notify = true) {
    if (notify && remoteUser) {
        sendSignal({ type: 'call-end', from: currentUser, to: remoteUser, payload: '' });
    }
    cleanup();
}

// ── Mute / unmute audio ───────────────────────────────────────────────────
export function toggleMute() {
    if (!localStream) return false;
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return false;
    audioTrack.enabled = !audioTrack.enabled;
    return !audioTrack.enabled; // returns true if now muted
}

// ── Enable / disable camera ───────────────────────────────────────────────
export function toggleCamera() {
    if (!localStream) return false;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return false;
    videoTrack.enabled = !videoTrack.enabled;
    return !videoTrack.enabled; // returns true if now off
}

// ─────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────

function createPeer() {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
        if (candidate && remoteUser) {
            sendSignal({
                type: 'ice-candidate',
                from: currentUser,
                to: remoteUser,
                payload: JSON.stringify(candidate)
            });
        }
    };

    pc.ontrack = (event) => {
        if (onRemoteStream) onRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
            cleanup();
            if (onCallEnded) onCallEnded();
        }
    };

    return pc;
}

async function getLocalStream(callType) {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
    });
}

function cleanup() {
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    remoteUser = null;
    currentCallType = null;
}
