package com.finanzas.personales.controller;

import com.finanzas.personales.dto.request.ActualizarUsuarioRequestDTO;
import com.finanzas.personales.dto.response.UsuarioResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/actual")
    public UsuarioResponseDTO usuarioActual(@AuthenticationPrincipal Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNombre(), usuario.getEmail());
    }


    @PutMapping("/actual")
    public UsuarioResponseDTO actualizarPerfil(@AuthenticationPrincipal Usuario usuario,
                                               @Valid @RequestBody ActualizarUsuarioRequestDTO dto) {
        Usuario actualizado = usuarioService.actualizarPerfil(usuario.getEmail(), dto.getNombre());
        return new UsuarioResponseDTO(actualizado.getId(), actualizado.getNombre(), actualizado.getEmail());
    }
}