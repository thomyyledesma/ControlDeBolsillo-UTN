package com.finanzas.personales.service;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finanzas.personales.Exception.CategoriaNoEncontradaException;
import com.finanzas.personales.Exception.PresupuestoInexistenteException;
import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.dto.request.PresupuestoRequestDTO;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Presupuesto;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CategoriaRepository;
import com.finanzas.personales.repository.PresupuestoRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PresupuestoService {


    private final PresupuestoRepository presupuestoRepository;
    private final CategoriaRepository categoriaRepository;

        private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private void validarPeriodoNoPasado(Integer mes, Integer anio) {
        if (YearMonth.of(anio, mes).isBefore(YearMonth.now(ZONA))) {
            throw new ReglaNegocioException("No se puede definir un presupuesto para un mes que ya pasó.");
        }
    }

    @Transactional
    public Presupuesto guardar(PresupuestoRequestDTO dto, Usuario usuario) {
                validarPeriodoNoPasado(dto.getMes(), dto.getAnio());
        Categoria categoria = categoriaRepository.findByIdAndUsuarioId(dto.getCategoriaId(), usuario.getId())
                .orElseThrow(() -> new CategoriaNoEncontradaException("Categoria no encontrada"));

        presupuestoRepository.findByUsuarioIdAndCategoriaIdAndMesAndAnio(usuario.getId(), dto.getCategoriaId(), dto.getMes(), dto.getAnio())
                .ifPresent(p -> {
                    throw new ReglaNegocioException("Presupuesto existente para esa categoria en ese mes/año");
                });

        Presupuesto p = new Presupuesto();
        p.setMontoLimite(dto.getMontoLimite());
        p.setMontoConsumido(BigDecimal.ZERO);
        p.setMes(dto.getMes());
        p.setAnio(dto.getAnio());
        p.setCategoria(categoria);
        p.setUsuario(usuario);

        return presupuestoRepository.save(p);
    }


    @Transactional(readOnly = true)
    public List<Presupuesto> listar(Long usuarioId) {
        return presupuestoRepository.findByUsuarioId(usuarioId);
    }


    @Transactional(readOnly = true)
    public Presupuesto listarXid(Long id, Long usuarioId) {
        Presupuesto p = presupuestoRepository.findById(id)
                .orElseThrow(() -> new PresupuestoInexistenteException("Presupuesto inexistente."));
        if (!p.getUsuario().getId().equals(usuarioId)) {
            throw new PresupuestoInexistenteException("Presupuesto no encontrado o no autorizado");
        }
        return p;
    }


    @Transactional
    public Presupuesto eliminar(Long id, Long usuarioId) {
        Presupuesto p = listarXid(id, usuarioId);
        presupuestoRepository.delete(p);
        return p;
    }


    @Transactional
    public Presupuesto actualizar(Long id, PresupuestoRequestDTO dto, Long usuarioId) {
        Presupuesto p = listarXid(id, usuarioId);

        Categoria categoria = categoriaRepository.findByIdAndUsuarioId(dto.getCategoriaId(), usuarioId)
                .orElseThrow(() -> new CategoriaNoEncontradaException("Categoria no encontrada"));

        boolean cambioPeriodo = !p.getMes().equals(dto.getMes()) || !p.getAnio().equals(dto.getAnio());
        boolean cambioMesAnioOCategoria = cambioPeriodo || !p.getCategoria().getId().equals(categoria.getId());
                if (cambioPeriodo) {
            validarPeriodoNoPasado(dto.getMes(), dto.getAnio());
        }
        if (cambioMesAnioOCategoria) {
            presupuestoRepository.findByUsuarioIdAndCategoriaIdAndMesAndAnio(usuarioId, dto.getCategoriaId(), dto.getMes(), dto.getAnio())
                    .ifPresent(duplicado -> {
                        throw new ReglaNegocioException("Ya existe un presupuesto para esa categoria en ese mes/año");
                    });
        }

        p.setAnio(dto.getAnio());
        p.setCategoria(categoria);
        p.setMes(dto.getMes());
        p.setMontoLimite(dto.getMontoLimite());

        return presupuestoRepository.save(p);
    }

    @Transactional
    public void registrarGasto(Long usuarioId, Long categoriaId, LocalDate fecha, BigDecimal monto) {
        presupuestoRepository
                .findByUsuarioIdAndCategoriaIdAndMesAndAnio(usuarioId, categoriaId, fecha.getMonthValue(), fecha.getYear())
                .ifPresent(p -> {
                    BigDecimal consumidoActual = p.getMontoConsumido() != null ? p.getMontoConsumido() : BigDecimal.ZERO;
                    p.setMontoConsumido(consumidoActual.add(monto));
                    presupuestoRepository.save(p);
                });
    }

    @Transactional
    public void revertirGasto(Long usuarioId, Long categoriaId, LocalDate fecha, BigDecimal monto) {
        presupuestoRepository
                .findByUsuarioIdAndCategoriaIdAndMesAndAnio(usuarioId, categoriaId, fecha.getMonthValue(), fecha.getYear())
                .ifPresent(p -> {
                    BigDecimal consumidoActual = p.getMontoConsumido() != null ? p.getMontoConsumido() : BigDecimal.ZERO;
                    BigDecimal nuevoConsumido = p.getMontoConsumido().subtract(monto);
                    if (nuevoConsumido.compareTo(BigDecimal.ZERO) < 0) {
                        nuevoConsumido = BigDecimal.ZERO;
                    }
                    p.setMontoConsumido(nuevoConsumido);
                    presupuestoRepository.save(p);
                });
    }
}
