package com.chatapp.service;

import com.chatapp.dto.MessageDTO;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;

        public ChatService(MessageRepository messageRepository, UserRepository userRepository) {
                this.messageRepository = messageRepository;
                this.userRepository = userRepository;
        }

        @SuppressWarnings("null")
        public MessageDTO saveMessage(MessageDTO messageDto) {
                User sender = userRepository.findByUsername(messageDto.getSenderUsername())
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User recipient = userRepository.findByUsername(messageDto.getRecipientUsername())
                                .orElseThrow(() -> new RuntimeException("Recipient not found"));

                Message message = Message.builder()
                                .content(messageDto.getContent())
                                .sender(sender)
                                .recipient(recipient)
                                .timestamp(LocalDateTime.now())
                                .status(Message.MessageStatus.SENT)
                                .build();

                Message savedMessage = messageRepository.save(message);
                return convertToDto(savedMessage);
        }

        public List<MessageDTO> getChatHistory(String senderUsername, String recipientUsername) {
                User sender = userRepository.findByUsername(senderUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                User recipient = userRepository.findByUsername(recipientUsername)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return messageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
                                sender, recipient, recipient, sender).stream().map(this::convertToDto)
                                .collect(Collectors.toList());
        }

        private MessageDTO convertToDto(Message message) {
                return MessageDTO.builder()
                                .id(message.getId())
                                .content(message.getContent())
                                .senderUsername(message.getSender().getUsername())
                                .recipientUsername(message.getRecipient().getUsername())
                                .timestamp(message.getTimestamp())
                                .status(message.getStatus().name())
                                .build();
        }
}
