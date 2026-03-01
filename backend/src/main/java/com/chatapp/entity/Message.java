package com.chatapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    public Message() {
    }

    public Message(String content, LocalDateTime timestamp, User sender, User recipient, MessageStatus status) {
        this.content = content;
        this.timestamp = timestamp;
        this.sender = sender;
        this.recipient = recipient;
        this.status = status;
    }

    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public MessageStatus getStatus() {
        return status;
    }

    public void setStatus(MessageStatus status) {
        this.status = status;
    }

    public enum MessageStatus {
        SENT, DELIVERED, READ
    }

    public static class MessageBuilder {
        private String content;
        private LocalDateTime timestamp;
        private User sender;
        private User recipient;
        private MessageStatus status;

        public MessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public MessageBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public MessageBuilder sender(User sender) {
            this.sender = sender;
            return this;
        }

        public MessageBuilder recipient(User recipient) {
            this.recipient = recipient;
            return this;
        }

        public MessageBuilder status(MessageStatus status) {
            this.status = status;
            return this;
        }

        public Message build() {
            return new Message(content, timestamp, sender, recipient, status);
        }
    }
}
