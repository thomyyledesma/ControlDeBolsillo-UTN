package com.finanzas.personales.dto.request;

import com.finanzas.personales.enums.TipoMovimiento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MovimientoRequestDTO {

        @NotNull(message = "La cuenta es obligatoria")
        private Long cuentaId;

        @NotNull(message = "La categoria es obligatoria")
        private Long categoriaId;

        @NotNull(message = "El tipo de movimiento es obligatorio")
        private TipoMovimiento tipo;

        @Size(max = 200, message = "La descripción no debe exceder 200 caracteres")
        private String descripcion;

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
        private BigDecimal monto;

        private LocalDate fecha;
}   