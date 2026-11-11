package com.finanzas.personales.dto.response;

import com.finanzas.personales.enums.Rol;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
}