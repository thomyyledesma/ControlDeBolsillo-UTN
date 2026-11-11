package com.finanzas.personales.Exception;

public class PlanLimiteExcedidoException extends RuntimeException {
    public PlanLimiteExcedidoException(String message) {
        super(message);
    }
}