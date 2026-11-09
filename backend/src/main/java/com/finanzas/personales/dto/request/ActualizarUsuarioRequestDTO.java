package com.finanzas.personales.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActualizarUsuarioRequestDTO {
    @NotBlank
    private String nombre;
}