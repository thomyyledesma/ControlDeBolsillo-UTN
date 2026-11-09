package com.finanzas.personales.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PresupuestoRequestDTO {

    @NotNull(message = "El monto límite es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto límite debe ser mayor a cero")
    private BigDecimal montoLimite;

    @NotNull(message = "El mes es obligatorio")
    @Min(value = 1, message = "El mes debe estar entre 1 y 12")
    @Max(value = 12, message = "El mes debe estar entre 1 y 12")
    private Integer mes;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 2000, message = "El año no es válido")
    private Integer anio;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;
}