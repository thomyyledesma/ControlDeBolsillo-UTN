package com.finanzas.personales.dto.response;

import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Movimiento;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MovimientoResponseDTO {

    private Long id;
    private TipoMovimiento tipo;
    private String descripcion;
    private BigDecimal monto;
    private LocalDate fecha;

    private Long cuentaId;
    private String cuentaNombre;

    private Long categoriaId;
    private String categoriaNombre;

    public static MovimientoResponseDTO from(Movimiento m) {
        MovimientoResponseDTO dto = new MovimientoResponseDTO();
        dto.setId(m.getId());
        dto.setTipo(m.getTipo());
        dto.setDescripcion(m.getDescripcion());
        dto.setMonto(m.getMonto());
        dto.setFecha(m.getFecha());

        if (m.getCuenta() != null) {
            dto.setCuentaId(m.getCuenta().getId());
            dto.setCuentaNombre(m.getCuenta().getNombre());
        }
         if (m.getCategoria() != null) {
            dto.setCategoriaId(m.getCategoria().getId());
            dto.setCategoriaNombre(m.getCategoria().getNombre());
        }
        return dto;
    }
}
