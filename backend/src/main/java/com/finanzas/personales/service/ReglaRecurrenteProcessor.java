package com.finanzas.personales.service;

import com.finanzas.personales.model.ReglaRecurrente;
import com.finanzas.personales.repository.ReglaRecurrenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReglaRecurrenteProcessor {

    private final ReglaRecurrenteRepository reglaRepo;
    private final MovimientoService movimientoService;
    private final EmailService emailService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void procesarReglaIndividual(Long reglaId, LocalDate hoy) {

        ReglaRecurrente regla = reglaRepo.findById(reglaId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Regla no encontrada con ID: " + reglaId));

        crearMovimientoDesdeRegla(regla, hoy);
        avanzarProximaEjecucion(regla, hoy);

        log.info("[Scheduler] ✓ Movimiento creado para regla ID={} | cuenta='{}' | monto={}",
                regla.getId(), regla.getCuenta().getNombre(), regla.getMonto());

        notificarPorEmail(regla, hoy);
    }

    private void crearMovimientoDesdeRegla(ReglaRecurrente regla, LocalDate fecha) {
        movimientoService.crearMovimientoDesdeRegla(
                regla.getCuenta(),
                regla.getCategoria(),
                regla.getTipo(),
                regla.getDescripcion() + " (automático)",
                regla.getMonto(),
                fecha);
    }

    private void avanzarProximaEjecucion(ReglaRecurrente regla, LocalDate hoy) {
        if (regla.getFrecuenciaDias() <= 0) {
            throw new IllegalStateException(
                    "frecuenciaDias debe ser mayor a 0 para regla ID=" + regla.getId());
        }
        LocalDate proxima = regla.getProximaEjecucion();
        while (!proxima.isAfter(hoy)) {
            proxima = proxima.plusDays(regla.getFrecuenciaDias());
        }
        regla.setProximaEjecucion(proxima);


        reglaRepo.save(regla);
    }

    private void notificarPorEmail(ReglaRecurrente regla, LocalDate fecha) {
        try {
            String destino = regla.getCuenta().getUsuario().getEmail();
            String asunto = "Movimiento automático: " + regla.getDescripcion();
            String cuerpo = "Hola!\n\n"
                    + "Se ejecutó tu regla recurrente y se registró un movimiento automático:\n\n"
                    + "- Descripción: " + regla.getDescripcion() + "\n"
                    + "- Tipo: " + regla.getTipo() + "\n"
                    + "- Monto: $" + regla.getMonto() + "\n"
                    + "- Cuenta: " + regla.getCuenta().getNombre() + "\n"
                    + "- Fecha: " + fecha + "\n\n"
                    + "Saludos,\nFinanzas Personales";
            emailService.enviar(destino, asunto, cuerpo);
        } catch (Exception e) {
            log.error("[Email] No se pudo notificar la regla ID={}: {}", regla.getId(), e.getMessage());
        }
    }
}