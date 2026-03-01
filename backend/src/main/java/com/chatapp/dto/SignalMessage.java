package com.chatapp.dto;

/**
 * WebRTC signaling message relayed between peers via WebSocket.
 *
 * type : "call-offer" | "call-answer" | "ice-candidate" | "call-reject" |
 * "call-end"
 * callType: "audio" | "video"
 * from : sender username
 * to : recipient username
 * payload : JSON string — SDP offer/answer or ICE candidate
 */
public class SignalMessage {
    private String type;
    private String callType;
    private String from;
    private String to;
    private String payload; // serialised SDP / ICE JSON

    public SignalMessage() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}
