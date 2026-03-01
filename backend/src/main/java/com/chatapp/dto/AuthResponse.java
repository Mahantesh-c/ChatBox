package com.chatapp.dto;

public class AuthResponse {
    private String token;
    private String username;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public static class AuthResponseBuilder {
        private String token;
        private String username;

        public AuthResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, username);
        }
    }
}
