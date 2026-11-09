package com.finanzas.personales.controller;

import com.finanzas.personales.dto.request.CuentaRequestDTO;
import com.finanzas.personales.dto.request.CuentaUpdateRequestDTO;
import com.finanzas.personales.dto.request.TransferenciaRequestDTO;
import com.finanzas.personales.dto.response.CuentaResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.CuentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cuentas")
@RequiredArgsConstructor
public class CuentaController {

    private final CuentaService cuentaService;


    @PostMapping
    public ResponseEntity<CuentaResponseDTO> crearCuenta(@Valid @RequestBody CuentaRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        CuentaResponseDTO creada = CuentaResponseDTO.from(cuentaService.crearCuenta(dto, usuario));
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @GetMapping
    public ResponseEntity<List<CuentaResponseDTO>> listarCuentas(@AuthenticationPrincipal Usuario usuario) {
        List<CuentaResponseDTO> cuentas = cuentaService.listarPorUsuario(usuario.getId())
                .stream()
                .map(CuentaResponseDTO::from)
                .toList();
        return ResponseEntity.ok(cuentas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuentaResponseDTO> buscarPorId(@PathVariable Long id,  @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(CuentaResponseDTO.from(cuentaService.buscarPropia(id, usuario.getId())));
    }


    @PutMapping("/{id}")
    public ResponseEntity<CuentaResponseDTO> actualizarCuenta(@PathVariable Long id, @Valid @RequestBody CuentaUpdateRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(CuentaResponseDTO.from(cuentaService.actualizarCuenta(id, dto, usuario.getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCuenta(@PathVariable Long id,  @AuthenticationPrincipal Usuario usuario) {
        cuentaService.eliminarCuenta(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transferir")
    public ResponseEntity<String> transferir(@Valid @RequestBody TransferenciaRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        cuentaService.transferir(dto, usuario.getId());
        return ResponseEntity.ok("Transferencia realizada correctamente");
    }
}