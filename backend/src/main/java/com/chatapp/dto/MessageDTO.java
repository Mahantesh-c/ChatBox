package com.chatapp.dto;

import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private String content;
    private String senderUsername;
    private String recipientUsername;
    private LocalDateTime timestamp;
    private String status;

    public MessageDTO() {
    }

    public MessageDTO(Long id, String content, String senderUsername, String recipientUsername, LocalDateTime timestamp,
            String status) {
        this.id = id;
        this.content = content;
        this.senderUsername = senderUsername;
        this.recipientUsername = recipientUsername;
        this.timestamp = timestamp;
        this.status = status;
    }

    public static MessageDTOBuilder builder() {
        return new MessageDTOBuilder();
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

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getRecipientUsername() {
        return recipientUsername;
    }

    public void setRecipientUsername(String recipientUsername) {
        this.recipientUsername = recipientUsername;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static class MessageDTOBuilder {
        private Long id;
        private String content;
        private String senderUsername;
        private String recipientUsername;
        private LocalDateTime timestamp;
        private String status;

        public MessageDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MessageDTOBuilder content(String content) {
            this.content = content;
            return this;
        }

        public MessageDTOBuilder senderUsername(String senderUsername) {
            this.senderUsername = senderUsername;
            return this;
        }

        public MessageDTOBuilder recipientUsername(String recipientUsername) {
            this.recipientUsername = recipientUsername;
            return this;
        }

        public MessageDTOBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public MessageDTOBuilder status(String status) {
            this.status = status;
            return this;
        }

        public MessageDTO build() {
            return new MessageDTO(id, content, senderUsername, recipientUsername, timestamp, status);
        }
    }
}
