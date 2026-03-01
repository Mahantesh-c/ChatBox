package com.chatapp.controller;

import com.chatapp.dto.MessageDTO;
import com.chatapp.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @SuppressWarnings("null")
    @MessageMapping("/chat")
    public void processMessage(@Payload MessageDTO messageDto) {
        MessageDTO savedMsg = chatService.saveMessage(messageDto);
        messagingTemplate.convertAndSendToUser(
                messageDto.getRecipientUsername(), "/queue/messages",
                savedMsg);
    }

    @GetMapping("/api/messages")
    @ResponseBody
    public List<MessageDTO> getChatHistory(
            @RequestParam String sender,
            @RequestParam String recipient) {
        return chatService.getChatHistory(sender, recipient);
    }
}
