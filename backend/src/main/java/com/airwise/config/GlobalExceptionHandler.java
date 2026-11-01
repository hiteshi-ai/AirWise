package com.airwise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler — ensures every unhandled exception
 * returns a well-formed JSON response with Content-Type: application/json.
 * Without this, Spring Boot can return an HTML error page (Whitelabel Error Page)
 * or an empty body, which causes "Unexpected end of JSON input" in the frontend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllUnhandled(Exception ex) {
        log.error("Unhandled exception in controller: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred.",
                        "type", ex.getClass().getSimpleName()
                ));
    }
}

