package com.finanzas.personales.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private final RestClient restClient = RestClient.create();

    @Value("${spring.mail.username}")
    private String remitente;

    @Value("${email.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${email.brevo.sender:}")
    private String brevoSender;

    @Value("${email.brevo.sender-name:Control de Bolsillo}")
    private String brevoSenderName;

    @Value("${email.brevo.base-url:https://api.brevo.com}")
    private String brevoBaseUrl;

    @Value("${email.resend.api-key:}")
    private String resendApiKey;

    @Value("${email.resend.from:Control de Bolsillo <onboarding@resend.dev>}")
    private String resendFrom;

    @Value("${email.resend.base-url:https://api.resend.com}")
    private String resendBaseUrl;

    public void enviar(String destino, String asunto, String cuerpo) {
        if (usaBrevo()) {
            enviarConBrevo(destino, asunto, cuerpo);
        } else if (usaResend()) {
            enviarConResend(destino, asunto, cuerpo);
        } else {
            enviarPorSmtp(destino, asunto, cuerpo);
        }
        log.info("[Email] Enviado a {} | asunto='{}'", destino, asunto);
    }

    private boolean usaBrevo() {
        return hayTexto(brevoApiKey) && hayTexto(brevoSender);
    }

    private boolean usaResend() {
        return hayTexto(resendApiKey);
    }

    private static boolean hayTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    private void enviarPorSmtp(String destino, String asunto, String cuerpo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(remitente);
        mensaje.setTo(destino);
        mensaje.setSubject(asunto);
        mensaje.setText(cuerpo);
        mailSender.send(mensaje);
    }

    private void enviarConBrevo(String destino, String asunto, String cuerpo) {
        restClient.post()
                .uri(brevoBaseUrl + "/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .body(construirPayloadBrevo(brevoSenderName, brevoSender, destino, asunto, cuerpo))
                .retrieve()
                .toBodilessEntity();
    }

    private void enviarConResend(String destino, String asunto, String cuerpo) {
        restClient.post()
                .uri(resendBaseUrl + "/emails")
                .header("Authorization", "Bearer " + resendApiKey)
                .body(construirPayload(resendFrom, destino, asunto, cuerpo))
                .retrieve()
                .toBodilessEntity();
    }

    static Map<String, Object> construirPayload(String from, String destino, String asunto, String cuerpo) {
        return Map.of(
                "from", from,
                "to", List.of(destino),
                "subject", asunto,
                "text", cuerpo);
    }

    static Map<String, Object> construirPayloadBrevo(
            String nombreRemitente, String emailRemitente, String destino, String asunto, String cuerpo) {
        return Map.of(
                "sender", Map.of("name", nombreRemitente, "email", emailRemitente),
                "to", List.of(Map.of("email", destino)),
                "subject", asunto,
                "textContent", cuerpo);
    }
}