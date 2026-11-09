package com.finanzas.personales.controller;



import com.finanzas.personales.dto.request.ReglaRecurrenteRequestDTO;
import com.finanzas.personales.dto.response.ReglaRecurrenteResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.ReglaRecurrenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/reglas-recurrentes")
@RequiredArgsConstructor
public class ReglaRecurrenteController {

    private final ReglaRecurrenteService service;

    @PostMapping
    public ResponseEntity<ReglaRecurrenteResponseDTO> crear(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody ReglaRecurrenteRequestDTO dto) {
        return ResponseEntity.ok(service.crearRegla(dto, usuario.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ReglaRecurrenteResponseDTO>> listarPorUsuario(
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.obtenerReglasPorUsuario(usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        service.desactivarRegla(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivar")
    public ResponseEntity<ReglaRecurrenteResponseDTO> reactivar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.reactivarRegla(id, usuario.getId()));
    }

    @PostMapping("/{id}/ejecutar-ahora")
    public org.springframework.http.ResponseEntity<ReglaRecurrenteResponseDTO> ejecutarAhora(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(
                service.ejecutarAhora(id, usuario.getId()));
    }
}