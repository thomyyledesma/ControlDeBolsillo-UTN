package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class EmailServiceTest {

    @Test
    void elPayloadDeResendLlevaRemitenteDestinoAsuntoYTexto() {
        Map<String, Object> payload = EmailService.construirPayload(
                "Control de Bolsillo <onboarding@resend.dev>", "persona@mail.com", "Asunto", "Hola");

        assertEquals("Control de Bolsillo <onboarding@resend.dev>", payload.get("from"));
        assertEquals(List.of("persona@mail.com"), payload.get("to"));
        assertEquals("Asunto", payload.get("subject"));
        assertEquals("Hola", payload.get("text"));
    }
}