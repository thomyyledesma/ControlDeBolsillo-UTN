package com.finanzas.personales.repository;


import com.finanzas.personales.model.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;


@Repository
public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {
    List<Presupuesto> findByUsuarioId(Long usuarioId);

    Optional<Presupuesto> findByUsuarioIdAndCategoriaIdAndMesAndAnio(Long usuarioId, Long categoriaId, int mes, int anio);
}
