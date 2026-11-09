package com.finanzas.personales.Exception;

public class CuentaInactivaException extends RuntimeException {
    public CuentaInactivaException(String message) {
        super(message);
    }
}
