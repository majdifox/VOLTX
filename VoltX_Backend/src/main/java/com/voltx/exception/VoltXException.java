package com.voltx.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class VoltXException extends RuntimeException {

    private final HttpStatus status;

    public VoltXException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public VoltXException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }
}