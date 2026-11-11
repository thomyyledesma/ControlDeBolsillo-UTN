package com.finanzas.personales.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finanzas.personales.dto.request.ActualizarUsuarioRequestDTO;
import com.finanzas.personales.dto.request.CambiarPasswordRequestDTO;
import com.finanzas.personales.dto.response.UsuarioResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/actual")
    public UsuarioResponseDTO usuarioActual(@AuthenticationPrincipal Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNombre(), usuario.getEmail(), usuario.getRol());
    }


    @PutMapping("/actual")
    public UsuarioResponseDTO actualizarPerfil(@AuthenticationPrincipal Usuario usuario,
                                                @Valid @RequestBody ActualizarUsuarioRequestDTO dto) {
        Usuario actualizado = usuarioService.actualizarPerfil(usuario.getEmail(), dto.getNombre());
        return new UsuarioResponseDTO(actualizado.getId(), actualizado.getNombre(), actualizado.getEmail(), actualizado.getRol());
    }

        @PutMapping("/actual/password")
    public ResponseEntity<Void> cambiarPassword(@AuthenticationPrincipal Usuario usuario,
                                                @Valid @RequestBody CambiarPasswordRequestDTO dto) {
        usuarioService.cambiarPassword(usuario.getEmail(), dto.getPasswordActual(), dto.getPasswordNueva());
        return ResponseEntity.noContent().build();
    }

        @PostMapping("/actual/premium")
    public UsuarioResponseDTO pasarAPremium(@AuthenticationPrincipal Usuario usuario) {
        Usuario actualizado = usuarioService.pasarAPremium(usuario.getEmail());
        return new UsuarioResponseDTO(actualizado.getId(), actualizado.getNombre(), actualizado.getEmail(), actualizado.getRol());
    }
}