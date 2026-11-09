package com.finanzas.personales.repository;

import com.finanzas.personales.model.MetaAhorro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MetaAhorroRepository extends JpaRepository<MetaAhorro, Long> {

    List<MetaAhorro> findByUsuarioId(Long usuarioId);

    List<MetaAhorro> findByUsuarioIdAndCumplida(Long usuarioId, Boolean cumplida);
}
