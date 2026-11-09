package com.finanzas.personales.dto.request;

import com.finanzas.personales.enums.TipoMovimiento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequestDTO {

    @NotBlank(message = "El nombre de la categoria es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;

    @Size(max = 100, message = "El icono no debe exceder 100 caracteres")
    private String icono;

    @NotNull(message = "El tipo de categoria es obligatorio (ingreso o egreso)")
    private TipoMovimiento tipo;
}
