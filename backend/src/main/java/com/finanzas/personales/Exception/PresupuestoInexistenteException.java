package com.finanzas.personales.Exception;

public class PresupuestoInexistenteException extends RecursoNoEncontradoException {
    public PresupuestoInexistenteException(String message) {
        super(message);
    }
}
