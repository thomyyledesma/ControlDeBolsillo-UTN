package com.finanzas.personales.Exception;

public class CuentaNoEncontradaException extends RecursoNoEncontradoException {
    public CuentaNoEncontradaException(String message) {
        super(message);
    }
}