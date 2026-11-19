package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

class PagoServiceTest {

    private static final BigDecimal PRECIO = new BigDecimal("5000");
    private static final Long USUARIO_ID = 7L;

    private Map<String, Object> pago(String status, String referencia, Object monto, String moneda) {
        Map<String, Object> pago = new HashMap<>();
        pago.put("status", status);
        pago.put("external_reference", referencia);
        pago.put("transaction_amount", monto);
        pago.put("currency_id", moneda);
        return pago;
    }

    @Test
    void pagoAprobadoDelUsuarioPorElPrecioEsValido() {
        assertTrue(PagoService.pagoAprobadoPara(pago("approved", "7", 5000, "ARS"), USUARIO_ID, PRECIO));
        assertTrue(PagoService.pagoAprobadoPara(pago("approved", "7", 5000.0, "ARS"), USUARIO_ID, PRECIO));
    }

    @Test
    void pagoNoAprobadoNoActivaPremium() {
        assertFalse(PagoService.pagoAprobadoPara(pago("pending", "7", 5000, "ARS"), USUARIO_ID, PRECIO));
        assertFalse(PagoService.pagoAprobadoPara(pago("rejected", "7", 5000, "ARS"), USUARIO_ID, PRECIO));
    }

    @Test
    void pagoDeOtroUsuarioNoSirve() {
        assertFalse(PagoService.pagoAprobadoPara(pago("approved", "8", 5000, "ARS"), USUARIO_ID, PRECIO));
    }

    @Test
    void pagoPorMenosDelPrecioONoEnPesosNoSirve() {
        assertFalse(PagoService.pagoAprobadoPara(pago("approved", "7", 100, "ARS"), USUARIO_ID, PRECIO));
        assertFalse(PagoService.pagoAprobadoPara(pago("approved", "7", 5000, "USD"), USUARIO_ID, PRECIO));
    }

    @Test
    void datosIncompletosNoSirven() {
        assertFalse(PagoService.pagoAprobadoPara(null, USUARIO_ID, PRECIO));
        assertFalse(PagoService.pagoAprobadoPara(pago("approved", "7", null, "ARS"), USUARIO_ID, PRECIO));
    }
}