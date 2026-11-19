package com.finanzas.personales.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.enums.Rol;
import com.finanzas.personales.model.Usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private static final ParameterizedTypeReference<Map<String, Object>> MAPA =
            new ParameterizedTypeReference<>() {};

    private final UsuarioService usuarioService;

    private final RestClient restClient = RestClient.create();

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${mercadopago.base-url:https://api.mercadopago.com}")
    private String baseUrl;

    @Value("${mercadopago.precio-premium:5000}")
    private BigDecimal precioPremium;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${app.backend-url:}")
    private String backendUrl;

    public String crearPagoPremium(Usuario usuario) {
        exigirConfiguracion();
        if (usuario.getRol() == Rol.PREMIUM) {
            throw new ReglaNegocioException("Ya tenés el plan Premium.");
        }

        String front = sinBarraFinal(frontendUrl);
        String volver = front + "/planes";

        Map<String, Object> item = Map.of(
                "title", "Plan Premium - Control de Bolsillo",
                "quantity", 1,
                "currency_id", "ARS",
                "unit_price", precioPremium);

        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(item));
        body.put("external_reference", String.valueOf(usuario.getId()));
        body.put("back_urls", Map.of("success", volver, "failure", volver, "pending", volver));
        if (front.startsWith("https://")) {
            body.put("auto_return", "approved");
        }
        if (backendUrl != null && !backendUrl.isBlank()) {
            body.put("notification_url", sinBarraFinal(backendUrl) + "/pagos/webhook");
        }

        try {
            Map<String, Object> respuesta = restClient.post()
                    .uri(baseUrl + "/checkout/preferences")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(MAPA);

            Object url = respuesta != null ? respuesta.get("init_point") : null;
            if (url == null) {
                throw new ReglaNegocioException("Mercado Pago no devolvió el link de pago.");
            }
            return url.toString();

        } catch (RestClientResponseException e) {
            log.error("[MercadoPago] Error HTTP {} al crear la preferencia: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new ReglaNegocioException("No se pudo iniciar el pago con Mercado Pago.");
        } catch (RestClientException e) {
            log.error("[MercadoPago] Error de conexión al crear la preferencia", e);
            throw new ReglaNegocioException("No se pudo conectar con Mercado Pago.");
        }
    }

    public Usuario confirmarPago(Usuario usuario, String paymentId) {
        Map<String, Object> pago = obtenerPago(paymentId);
        if (!pagoAprobadoPara(pago, usuario.getId(), precioPremium)) {
            throw new ReglaNegocioException("El pago todavía no figura como aprobado.");
        }
        return usuarioService.pasarAPremiumPorId(usuario.getId());
    }

    public void procesarNotificacion(String paymentId) {
        Map<String, Object> pago = obtenerPago(paymentId);

        Long usuarioId;
        try {
            usuarioId = Long.valueOf(String.valueOf(pago.get("external_reference")));
        } catch (NumberFormatException e) {
            log.warn("[MercadoPago] Pago {} sin referencia de usuario válida", paymentId);
            return;
        }

        if (pagoAprobadoPara(pago, usuarioId, precioPremium)) {
            usuarioService.pasarAPremiumPorId(usuarioId);
            log.info("[MercadoPago] Pago {} aprobado: usuario {} pasa a Premium", paymentId, usuarioId);
        }
    }

    /**
     * Un pago sirve para activar Premium solo si está aprobado, pertenece a este usuario
     * (external_reference), es en pesos y cubre el precio.
     */
    static boolean pagoAprobadoPara(Map<String, Object> pago, Long usuarioId, BigDecimal precio) {
        if (pago == null || usuarioId == null) {
            return false;
        }
        if (!"approved".equals(pago.get("status"))) {
            return false;
        }
        if (!String.valueOf(usuarioId).equals(String.valueOf(pago.get("external_reference")))) {
            return false;
        }
        if (!"ARS".equals(pago.get("currency_id"))) {
            return false;
        }
        if (!(pago.get("transaction_amount") instanceof Number monto)) {
            return false;
        }
        return new BigDecimal(monto.toString()).compareTo(precio) >= 0;
    }

    private Map<String, Object> obtenerPago(String paymentId) {
        exigirConfiguracion();
        if (paymentId == null || !paymentId.matches("\\d{1,20}")) {
            throw new ReglaNegocioException("Identificador de pago inválido.");
        }
        try {
            Map<String, Object> pago = restClient.get()
                    .uri(baseUrl + "/v1/payments/{id}", paymentId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(MAPA);
            if (pago == null) {
                throw new ReglaNegocioException("Mercado Pago no devolvió datos del pago.");
            }
            return pago;
        } catch (RestClientResponseException e) {
            log.error("[MercadoPago] Error HTTP {} al consultar el pago {}: {}",
                    e.getStatusCode(), paymentId, e.getResponseBodyAsString());
            throw new ReglaNegocioException("No se pudo verificar el pago con Mercado Pago.");
        } catch (RestClientException e) {
            log.error("[MercadoPago] Error de conexión al consultar el pago {}", paymentId, e);
            throw new ReglaNegocioException("No se pudo conectar con Mercado Pago.");
        }
    }

    private void exigirConfiguracion() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new ReglaNegocioException("Los pagos no están configurados (falta MP_ACCESS_TOKEN).");
        }
    }

    private static String sinBarraFinal(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}