package com.finanzas.personales.dto.response;

import com.finanzas.personales.model.Presupuesto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PresupuestoResponseDTO {

    private Long id;
    private BigDecimal montoLimite;
    private BigDecimal montoConsumido;
    private Integer mes;
    private Integer anio;
    private Long categoriaId;
    private String categoriaNombre;

    public static PresupuestoResponseDTO from(Presupuesto p) {
        PresupuestoResponseDTO dto = new PresupuestoResponseDTO();
        dto.setId(p.getId());
        dto.setMontoLimite(p.getMontoLimite());
        dto.setMontoConsumido(p.getMontoConsumido());
        dto.setMes(p.getMes());
        dto.setAnio(p.getAnio());
        if (p.getCategoria() != null) {
            dto.setCategoriaId(p.getCategoria().getId());
            dto.setCategoriaNombre(p.getCategoria().getNombre());
        }
        return dto;
    }
}