package com.chatapp.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles explicit validation / duplicate-check errors thrown from AuthService.
     * Returns HTTP 400 with a JSON body: { "message": "..." }
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    /**
     * Safety net: if a DB unique-constraint violation slips through,
     * return 409 Conflict instead of a 500.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", "A user with that username or email already exists."));
    }

    // NOTE: No generic Exception handler — leaving that to Spring's default so that
    // CORS headers, security filters, and OPTIONS preflight responses are NOT
    // intercepted before the browser receives correct CORS headers.
}
