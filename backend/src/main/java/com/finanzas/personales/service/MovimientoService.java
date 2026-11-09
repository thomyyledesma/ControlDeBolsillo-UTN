package com.finanzas.personales.service;

import com.finanzas.personales.Exception.*;
import com.finanzas.personales.dto.request.MovimientoRequestDTO;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Cuenta;
import com.finanzas.personales.model.Movimiento;
import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final CuentaRepository cuentaRepository;
    private final CategoriaRepository categoriaRepository;
    private final PresupuestoService presupuestoService;



    @Transactional
    public Movimiento crearMovimiento(MovimientoRequestDTO dto, Long usuarioId) {

        Cuenta cuenta = cuentaRepository.findByIdAndUsuarioId(dto.getCuentaId(), usuarioId)
                .orElseThrow(() -> new CuentaNoEncontradaException("Cuenta no encontrada"));

        Categoria categoria = categoriaRepository.findByIdAndUsuarioId(dto.getCategoriaId(), usuarioId)
                .orElseThrow(() -> new CategoriaNoEncontradaException("Categoria no encontrada"));

        if (categoria.getTipo() != dto.getTipo()) {
            throw new CategoriaNoEncontradaException(
                    "La categoria no corresponde al tipo de movimiento: " + dto.getTipo());
        }

        LocalDate fecha = dto.getFecha() != null ? dto.getFecha() : LocalDate.now();

        return aplicarMovimiento(cuenta, categoria, dto.getTipo(), dto.getDescripcion(),
                dto.getMonto(), fecha, usuarioId);
    }


    private Movimiento aplicarMovimiento(Cuenta cuenta, Categoria categoria, TipoMovimiento tipo,
                                         String descripcion, BigDecimal monto, LocalDate fecha,
                                         Long usuarioId) {

        if (Boolean.FALSE.equals(cuenta.getActiva())) {
            throw new CuentaInactivaException("No es posible operar con una cuenta inactiva");
        }

        if (tipo == TipoMovimiento.EGRESO && cuenta.getSaldo().compareTo(monto) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente en la cuenta");
        }

        Movimiento movimiento = new Movimiento();
        movimiento.setCuenta(cuenta);
        movimiento.setCategoria(categoria);
        movimiento.setTipo(tipo);
        movimiento.setDescripcion(descripcion);
        movimiento.setMonto(monto);
        movimiento.setFecha(fecha);

        if (tipo == TipoMovimiento.INGRESO) {
            cuenta.setSaldo(cuenta.getSaldo().add(monto));
        } else {
            cuenta.setSaldo(cuenta.getSaldo().subtract(monto));
            presupuestoService.registrarGasto(usuarioId, categoria.getId(), fecha, monto);
        }

        cuentaRepository.save(cuenta);
        return movimientoRepository.save(movimiento);
    }


    @Transactional
    @SuppressWarnings("UnusedReturnValue")
    public Movimiento crearMovimientoDesdeRegla(Cuenta cuenta, Categoria categoria, TipoMovimiento tipo,
                                                String descripcion, BigDecimal monto, LocalDate fecha) {
        Long usuarioId = cuenta.getUsuario().getId();
        return aplicarMovimiento(cuenta, categoria, tipo, descripcion, monto, fecha, usuarioId);
    }




    public List<Movimiento> listarMovimientosPorUsuario(Long usuarioId) {
        return movimientoRepository.findByCuentaUsuarioId(usuarioId);
    }



    public Movimiento buscarPorIdYUsuario(Long id, Long usuarioId) {
        return movimientoRepository.findById(id)
                .filter(m -> m.getCuenta().getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new MovimientoNoEncontradoException("Movimiento no encontrado"));
    }



    public List<Movimiento> listarPorCuentaYUsuario(Long cuentaId, Long usuarioId) {
        cuentaRepository.findByIdAndUsuarioId(cuentaId, usuarioId)
                .orElseThrow(() -> new CuentaNoEncontradaException("Cuenta no encontrada"));

        return movimientoRepository.findByCuentaId(cuentaId);
    }



    public List<Movimiento> listarPorCategoriaYUsuario(Long categoriaId, Long usuarioId) {

        return movimientoRepository.findByCategoriaIdAndCuentaUsuarioId(categoriaId, usuarioId);
    }



    @Transactional
    public void eliminarMovimiento(Long id, Long usuarioId) {

        Movimiento movimiento = buscarPorIdYUsuario(id, usuarioId);
        Cuenta cuenta = movimiento.getCuenta();

        if (movimiento.getTipo() == TipoMovimiento.INGRESO) {

            if (cuenta.getSaldo().compareTo(movimiento.getMonto()) < 0) {
                throw new SaldoInsuficienteException("No se puede eliminar el ingreso: el saldo actual es menor al monto del movimiento");
            }
            cuenta.setSaldo(cuenta.getSaldo().subtract(movimiento.getMonto()));
        } else {
            cuenta.setSaldo(cuenta.getSaldo().add(movimiento.getMonto()));
            if (movimiento.getCategoria() != null) {
                presupuestoService.revertirGasto(usuarioId, movimiento.getCategoria().getId(),
                        movimiento.getFecha(), movimiento.getMonto());
            }
        }

        cuentaRepository.save(cuenta);
        movimientoRepository.delete(movimiento);
    }


    @Transactional
    public Movimiento editarMovimiento(Long id, MovimientoRequestDTO dto, Long usuarioId) {

        if (dto.getCuentaId() == null) {
            throw new CuentaNoEncontradaException("La cuenta es obligatoria");
        }

        Movimiento movimiento = buscarPorIdYUsuario(id, usuarioId);
        Cuenta cuentaAnterior = movimiento.getCuenta();

        TipoMovimiento tipoAnterior = movimiento.getTipo();
        Long categoriaAnteriorId = movimiento.getCategoria() != null ? movimiento.getCategoria().getId() : null;
        LocalDate fechaAnterior = movimiento.getFecha();
        BigDecimal montoAnterior = movimiento.getMonto();


        if (tipoAnterior == TipoMovimiento.INGRESO) {
            if (cuentaAnterior.getSaldo().compareTo(movimiento.getMonto()) < 0) {
                throw new SaldoInsuficienteException("No se puede modificar: el saldo actual es menor al monto del movimiento original");
            }
            cuentaAnterior.setSaldo(cuentaAnterior.getSaldo().subtract(montoAnterior));
        } else {
            cuentaAnterior.setSaldo(cuentaAnterior.getSaldo().add(montoAnterior));
        }

        Cuenta cuentaNueva;
        if (cuentaAnterior.getId().equals(dto.getCuentaId())) {
            cuentaNueva = cuentaAnterior;
        } else {
            cuentaRepository.save(cuentaAnterior);
            cuentaNueva = cuentaRepository.findByIdAndUsuarioId(dto.getCuentaId(), usuarioId)
                    .orElseThrow(() -> new CuentaNoEncontradaException("Cuenta no encontrada"));
        }

        if (Boolean.FALSE.equals(cuentaNueva.getActiva())) {
            throw new CuentaInactivaException("No es posible operar con una cuenta inactiva");
        }

        Categoria categoria = categoriaRepository.findByIdAndUsuarioId(dto.getCategoriaId(), usuarioId)
                .orElseThrow(() -> new CategoriaNoEncontradaException("Categoria no encontrada"));


        if (categoria.getTipo() != dto.getTipo()) {
            throw new CategoriaNoEncontradaException(
                    "La categoria no corresponde al tipo de movimiento: " + dto.getTipo());
        }

        LocalDate fechaNueva = dto.getFecha() != null ? dto.getFecha() : movimiento.getFecha();

        if (dto.getTipo() == TipoMovimiento.EGRESO && cuentaNueva.getSaldo().compareTo(dto.getMonto()) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente en la cuenta");
        }

        if (dto.getTipo() == TipoMovimiento.INGRESO) {
            cuentaNueva.setSaldo(cuentaNueva.getSaldo().add(dto.getMonto()));
        } else {
            cuentaNueva.setSaldo(cuentaNueva.getSaldo().subtract(dto.getMonto()));
        }

        if (tipoAnterior == TipoMovimiento.EGRESO && categoriaAnteriorId != null) {
            presupuestoService.revertirGasto(usuarioId, categoriaAnteriorId, fechaAnterior, montoAnterior);
        }
        if (dto.getTipo() == TipoMovimiento.EGRESO) {
            presupuestoService.registrarGasto(usuarioId, categoria.getId(), fechaNueva, dto.getMonto());
        }

        movimiento.setCuenta(cuentaNueva);
        movimiento.setCategoria(categoria);
        movimiento.setTipo(dto.getTipo());
        movimiento.setDescripcion(dto.getDescripcion());
        movimiento.setMonto(dto.getMonto());
        movimiento.setFecha(fechaNueva);

        cuentaRepository.save(cuentaNueva);
        return movimientoRepository.save(movimiento);
    }

    @Transactional
    public void registrarMovimientoInterno(Cuenta cuenta, TipoMovimiento tipo, String descripcion, BigDecimal monto) {
        Movimiento movimiento = new Movimiento();
        movimiento.setCuenta(cuenta);
        movimiento.setCategoria(null);
        movimiento.setTipo(tipo);
        movimiento.setDescripcion(descripcion);
        movimiento.setMonto(monto);
        movimiento.setFecha(LocalDate.now());
        movimientoRepository.save(movimiento);
    }

    @Transactional
    public void registrarMovimientoInternoConPresupuesto(Cuenta cuenta, TipoMovimiento tipo, String descripcion, BigDecimal monto, Long usuarioId) {
        Movimiento movimiento = new Movimiento();
        movimiento.setCuenta(cuenta);

        // Buscar categoría de transferencia
        Categoria categoriaTransferencia = categoriaRepository.findByUsuarioIdAndTipo(usuarioId, tipo)
                .stream()
                .filter(c -> c.getNombre().equalsIgnoreCase("Transferencia Enviada") ||
                        c.getNombre().equalsIgnoreCase("Transferencia Recibida") ||
                        c.getNombre().equalsIgnoreCase("Transferencia enviada") ||
                        c.getNombre().equalsIgnoreCase("Transferencia recibida"))
                .findFirst()
                .orElse(null);

        movimiento.setCategoria(categoriaTransferencia);
        movimiento.setTipo(tipo);
        movimiento.setDescripcion(descripcion);
        movimiento.setMonto(monto);
        movimiento.setFecha(LocalDate.now());
        movimientoRepository.save(movimiento);

        // Registrar en presupuesto si tiene categoría
        if (tipo == TipoMovimiento.EGRESO && categoriaTransferencia != null) {
            presupuestoService.registrarGasto(usuarioId, categoriaTransferencia.getId(), LocalDate.now(), monto);
        }
    }

    public List<Movimiento> listarPorUsuarioYRango(Long usuarioId, LocalDate desde, LocalDate hasta) {
        return movimientoRepository.findByCuentaUsuarioIdAndFechaBetween(usuarioId, desde, hasta);
    }

}
