package com.finanzas.personales.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finanzas.personales.enums.TipoCuenta;
import com.finanzas.personales.model.Cuenta;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    List<Cuenta> findByUsuarioId(Long usuarioId);

    Optional<Cuenta> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByUsuarioIdAndTipoCuenta(Long usuarioId, TipoCuenta tipoCuenta);

    boolean existsByUsuarioIdAndNombreIgnoreCase(Long usuarioId, String nombre);

    long countByUsuarioId(Long usuarioId);
}