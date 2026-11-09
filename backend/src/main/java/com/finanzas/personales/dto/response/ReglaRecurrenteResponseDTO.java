package com.finanzas.personales.dto.response;


import com.finanzas.personales.enums.TipoMovimiento;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ReglaRecurrenteResponseDTO {
    private Long id;
    private Long cuentaId;
    private String cuentaNombre;
    private Long categoriaId;
    private String categoriaNombre;
    private TipoMovimiento tipo;
    private String descripcion;
    private BigDecimal monto;
    private Boolean esFamiliar;
    private Integer frecuenciaDias;
    private LocalDate proximaEjecucion;
    private Boolean activa;
}