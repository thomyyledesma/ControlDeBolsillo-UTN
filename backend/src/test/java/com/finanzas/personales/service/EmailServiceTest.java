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

        @Test
    void elPayloadDeBrevoLlevaRemitenteDestinoAsuntoYTexto() {
        Map<String, Object> payload = EmailService.construirPayloadBrevo(
                "Control de Bolsillo", "yo@mail.com", "persona@mail.com", "Asunto", "Hola");

        assertEquals(Map.of("name", "Control de Bolsillo", "email", "yo@mail.com"), payload.get("sender"));
        assertEquals(List.of(Map.of("email", "persona@mail.com")), payload.get("to"));
        assertEquals("Asunto", payload.get("subject"));
        assertEquals("Hola", payload.get("textContent"));
    }
}