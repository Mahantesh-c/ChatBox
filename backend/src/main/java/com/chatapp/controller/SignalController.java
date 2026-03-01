package com.chatapp.controller;

import com.chatapp.dto.SignalMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

/**
 * Relays WebRTC signaling messages (offer / answer / ICE candidates /
 * call-reject / call-end) between two connected users via STOMP.
 *
 * Client sends to : /app/signal
 * Server delivers to recipient at : /user/{to}/queue/signal
 */
@Controller
public class SignalController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/signal")
    public void handleSignal(@Payload SignalMessage signal, Principal principal) {
        // Always stamp the actual sender so the caller cannot be spoofed
        if (principal != null) {
            signal.setFrom(principal.getName());
        }
        // Deliver to the recipient's personal signal queue
        messagingTemplate.convertAndSendToUser(
                signal.getTo(),
                "/queue/signal",
                signal);
    }
}
