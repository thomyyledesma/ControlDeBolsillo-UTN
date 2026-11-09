package com.finanzas.personales.service;

import com.finanzas.personales.Exception.RecursoNoEncontradoException;
import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.dto.request.ReglaRecurrenteRequestDTO;
import com.finanzas.personales.dto.response.ReglaRecurrenteResponseDTO;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Cuenta;
import com.finanzas.personales.model.ReglaRecurrente;
import com.finanzas.personales.repository.CategoriaRepository;
import com.finanzas.personales.repository.CuentaRepository;
import com.finanzas.personales.repository.ReglaRecurrenteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReglaRecurrenteService {

    private final ReglaRecurrenteRepository reglaRepo;
    private final CuentaRepository cuentaRepo;
    private final CategoriaRepository categoriaRepo;
    private final ReglaRecurrenteProcessor processor;

    @Scheduled(cron = "0 0 6 * * *")
    public void ejecutarReglasVencidas() {
        LocalDate hoy = LocalDate.now();
        log.info("[Scheduler] Verificando reglas recurrentes para la fecha: {}", hoy);

        List<ReglaRecurrente> reglasPendientes = reglaRepo
                .findByActivaTrueAndProximaEjecucionLessThanEqual(hoy);

        if (reglasPendientes.isEmpty()) {
            log.info("[Scheduler] No hay reglas pendientes para hoy.");
            return;
        }

        log.info("[Scheduler] Procesando {} regla(s)...", reglasPendientes.size());

        int exitosas = 0;
        for (ReglaRecurrente regla : reglasPendientes) {
            try {
                // 2. CAMBIADO: Ahora le enviamos regla.getId() en lugar del objeto completo
                processor.procesarReglaIndividual(regla.getId(), hoy);
                exitosas++;
            } catch (org.springframework.dao.DataAccessException e) {
                log.error("[Scheduler] ✗ Error de base de datos en regla ID={}: {}", regla.getId(), e.getMessage());
            } catch (Exception e) {
                log.error("[Scheduler] ✗ Error inesperado en regla ID={}: {}", regla.getId(), e.getMessage(), e);
            }
        }

        log.info("[Scheduler] Finalizado. {}/{} regla(s) procesada(s) con éxito.",
                exitosas, reglasPendientes.size());
    }


    @Transactional
    public ReglaRecurrenteResponseDTO crearRegla(ReglaRecurrenteRequestDTO dto, Long usuarioId) {
        Cuenta cuenta = cuentaRepo.findByIdAndUsuarioId(dto.getCuentaId(), usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cuenta no encontrada o no te pertenece (ID: " + dto.getCuentaId() + ")"));


        Categoria categoria = categoriaRepo.findByIdAndUsuarioId(dto.getCategoriaId(), usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoría no encontrada o no te pertenece (ID: " + dto.getCategoriaId() + ")"));

        reglaRepo.buscarDuplicada(dto.getCuentaId(), dto.getCategoriaId(), dto.getTipo(), dto.getMonto())
                .ifPresent(r -> {
                    throw new ReglaNegocioException(
                            "Ya tenés una regla activa igual (misma cuenta, categoría, tipo y monto).");
                });

        ReglaRecurrente regla = ReglaRecurrente.builder()
                .cuenta(cuenta)
                .categoria(categoria)
                .tipo(dto.getTipo())
                .descripcion(dto.getDescripcion())
                .monto(dto.getMonto())
                .esFamiliar(dto.getEsFamiliar())
                .frecuenciaDias(dto.getFrecuenciaDias())
                .proximaEjecucion(dto.getProximaEjecucion())
                .activa(true)
                .build();

        return toDTO(reglaRepo.save(regla));
    }

    @Transactional
    public void desactivarRegla(Long reglaId, Long usuarioId) {
        ReglaRecurrente regla = reglaRepo.findById(reglaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Regla no encontrada: " + reglaId));


        Long duenioId = regla.getCuenta().getUsuario().getId();
        if (!duenioId.equals(usuarioId)) {
            log.warn("[Seguridad] El usuario ID={} intentó desactivar la regla ID={} del usuario ID={}",
                    usuarioId, reglaId, duenioId);
            throw new RecursoNoEncontradoException("No tenés permisos para cancelar esta regla porque no te pertenece.");
        }

        regla.setActiva(false);
        reglaRepo.save(regla);

        log.info("[Service] Regla ID={} desactivada con éxito por su dueño (Usuario ID={})", reglaId, usuarioId);
    }

    @Transactional
    public ReglaRecurrenteResponseDTO reactivarRegla(Long reglaId, Long usuarioId) {
        ReglaRecurrente regla = obtenerReglaPropia(reglaId, usuarioId);

        if (Boolean.TRUE.equals(regla.getActiva())) {
            throw new ReglaNegocioException("La regla ya está activa.");
        }

        reglaRepo.buscarDuplicada(regla.getCuenta().getId(), regla.getCategoria().getId(),
                        regla.getTipo(), regla.getMonto())
                .ifPresent(r -> {
                    throw new ReglaNegocioException(
                            "No se puede reactivar: ya existe una regla activa igual.");
                });

        if (regla.getProximaEjecucion() == null || regla.getProximaEjecucion().isBefore(LocalDate.now())) {
            regla.setProximaEjecucion(LocalDate.now());
        }

        regla.setActiva(true);
        ReglaRecurrente guardada = reglaRepo.save(regla);
        log.info("[Service] Regla ID={} reactivada por su dueño (Usuario ID={})", reglaId, usuarioId);
        return toDTO(guardada);
    }

    @Transactional
    public ReglaRecurrenteResponseDTO ejecutarAhora(Long reglaId, Long usuarioId) {
        ReglaRecurrente regla = obtenerReglaPropia(reglaId, usuarioId);

        if (!Boolean.TRUE.equals(regla.getActiva())) {
            throw new com.finanzas.personales.Exception.ReglaNegocioException(
                    "No se puede ejecutar una regla desactivada. Reactivala primero.");
        }

        processor.procesarReglaIndividual(regla.getId(), java.time.LocalDate.now());

        return toDTO(regla);
    }

    @Transactional(readOnly = true)
    public List<ReglaRecurrenteResponseDTO> obtenerReglasPorUsuario(Long usuarioId) {
        return reglaRepo.findByUsuarioId(usuarioId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private ReglaRecurrente obtenerReglaPropia(Long reglaId, Long usuarioId) {
        ReglaRecurrente regla = reglaRepo.findById(reglaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Regla no encontrada: " + reglaId));

        Long duenioId = regla.getCuenta().getUsuario().getId();
        if (!duenioId.equals(usuarioId)) {
            log.warn("[Seguridad] El usuario ID={} intentó operar sobre la regla ID={} del usuario ID={}",
                    usuarioId, reglaId, duenioId);
            throw new RecursoNoEncontradoException("No tenés permisos sobre esta regla porque no te pertenece.");
        }
        return regla;
    }

    private ReglaRecurrenteResponseDTO toDTO(ReglaRecurrente r) {
        return ReglaRecurrenteResponseDTO.builder()
                .id(r.getId())
                .cuentaId(r.getCuenta().getId())
                .cuentaNombre(r.getCuenta().getNombre())
                .categoriaId(r.getCategoria().getId())
                .categoriaNombre(r.getCategoria().getNombre())
                .tipo(r.getTipo())
                .descripcion(r.getDescripcion())
                .monto(r.getMonto())
                .esFamiliar(r.getEsFamiliar())
                .frecuenciaDias(r.getFrecuenciaDias())
                .proximaEjecucion(r.getProximaEjecucion())
                .activa(r.getActiva())
                .build();
    }
}