package com.finanzas.personales.repository;



import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.ReglaRecurrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface ReglaRecurrenteRepository extends JpaRepository<ReglaRecurrente, Long> {





    @Query("SELECT r FROM ReglaRecurrente r WHERE r.cuenta.usuario.id = :usuarioId")
    List<ReglaRecurrente> findByUsuarioId(@Param("usuarioId") Long usuarioId);


    @Query("""
    SELECT r FROM ReglaRecurrente r
    JOIN FETCH r.cuenta c
    JOIN FETCH c.usuario
    JOIN FETCH r.categoria
    WHERE r.activa = true AND r.proximaEjecucion <= :fecha
    ORDER BY r.id ASC
    """)
    List<ReglaRecurrente> findByActivaTrueAndProximaEjecucionLessThanEqual(@Param("fecha") LocalDate fecha);


    @Query("""
    SELECT r FROM ReglaRecurrente r
    WHERE r.activa = true
      AND r.cuenta.id = :cuentaId
      AND r.categoria.id = :categoriaId
      AND r.tipo = :tipo
      AND r.monto = :monto
    """)
    Optional<ReglaRecurrente> buscarDuplicada(
            @Param("cuentaId") Long cuentaId,
            @Param("categoriaId") Long categoriaId,
            @Param("tipo") TipoMovimiento tipo,
            @Param("monto") BigDecimal monto);
}
