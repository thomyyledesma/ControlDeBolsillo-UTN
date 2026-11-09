package com.finanzas.personales.repository;

import com.finanzas.personales.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

import java.util.List;
@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByCuentaId(Long cuentaId);
    List<Movimiento> findByCuentaUsuarioId(Long usuarioId);
    List<Movimiento> findByCategoriaIdAndCuentaUsuarioId(Long categoriaId,Long usuarioId);
    List<Movimiento> findByCuentaUsuarioIdAndFechaBetween(Long usuarioId, LocalDate desde, LocalDate hasta);
}
