package com.finanzas.personales.dto.request;


import com.finanzas.personales.enums.TipoMovimiento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReglaRecurrenteRequestDTO {

    @NotNull
    private Long cuentaId; //  Corregido a Long

    @NotNull
    private Long categoriaId; //  Corregido a Long

    @NotNull
    private TipoMovimiento tipo;

    @NotBlank
    private String descripcion;

    @NotNull
    @Positive
    private BigDecimal monto;

    @NotNull
    private Boolean esFamiliar;

    @NotNull
    @Min(1)
    private Integer frecuenciaDias;

    @NotNull
    private LocalDate proximaEjecucion;
}