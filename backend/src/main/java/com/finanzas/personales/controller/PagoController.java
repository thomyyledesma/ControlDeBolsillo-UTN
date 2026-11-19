package com.finanzas.personales.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finanzas.personales.dto.response.PagoResponseDTO;
import com.finanzas.personales.dto.response.UsuarioResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.PagoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping("/premium")
    public PagoResponseDTO crearPagoPremium(@AuthenticationPrincipal Usuario usuario) {
        return new PagoResponseDTO(pagoService.crearPagoPremium(usuario));
    }

    @PostMapping("/confirmar")
    public UsuarioResponseDTO confirmarPago(@AuthenticationPrincipal Usuario usuario,
                                            @RequestParam("payment_id") String paymentId) {
        Usuario actualizado = pagoService.confirmarPago(usuario, paymentId);
        return new UsuarioResponseDTO(actualizado.getId(), actualizado.getNombre(),
                actualizado.getEmail(), actualizado.getRol());
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "topic", required = false) String topic,
            @RequestParam(name = "data.id", required = false) String dataId,
            @RequestParam(name = "id", required = false) String id) {

        String tipo = type != null ? type : topic;
        String paymentId = dataId != null ? dataId : id;

        if ("payment".equals(tipo) && paymentId != null) {
            try {
                pagoService.procesarNotificacion(paymentId);
            } catch (Exception e) {
                log.error("[MercadoPago] No se pudo procesar la notificación del pago {}: {}",
                        paymentId, e.getMessage());
            }
        }
        return ResponseEntity.ok().build();
    }
}