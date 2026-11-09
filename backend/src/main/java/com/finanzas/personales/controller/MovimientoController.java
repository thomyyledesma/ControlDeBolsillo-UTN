package com.finanzas.personales.controller;

import com.finanzas.personales.dto.request.MovimientoRequestDTO;
import com.finanzas.personales.dto.response.MovimientoResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;


    @PostMapping
    public ResponseEntity<MovimientoResponseDTO> crearMovimiento(@Valid @RequestBody MovimientoRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        MovimientoResponseDTO creado = MovimientoResponseDTO.from(movimientoService.crearMovimiento(dto, usuario.getId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    public ResponseEntity<List<MovimientoResponseDTO>> listarMovimientos(@AuthenticationPrincipal Usuario usuario) {
        List<MovimientoResponseDTO> movimientos = movimientoService.listarMovimientosPorUsuario(usuario.getId())
                .stream()
                .map(MovimientoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoResponseDTO> buscarPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(MovimientoResponseDTO.from(movimientoService.buscarPorIdYUsuario(id, usuario.getId())));
    }

    @GetMapping("/cuenta/{cuentaId}")
    public ResponseEntity<List<MovimientoResponseDTO>> listarPorCuenta(@PathVariable Long cuentaId, @AuthenticationPrincipal Usuario usuario) {
        List<MovimientoResponseDTO> movimientos = movimientoService.listarPorCuentaYUsuario(cuentaId, usuario.getId())
                .stream()
                .map(MovimientoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(movimientos);
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<MovimientoResponseDTO>> listarPorCategoria(@PathVariable Long categoriaId, @AuthenticationPrincipal Usuario usuario) {
        List<MovimientoResponseDTO> movimientos = movimientoService.listarPorCategoriaYUsuario(categoriaId, usuario.getId())
                .stream()
                .map(MovimientoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(movimientos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMovimiento(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
       movimientoService.eliminarMovimiento(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimientoResponseDTO> editarMovimiento(@PathVariable Long id, @Valid @RequestBody MovimientoRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(MovimientoResponseDTO.from(movimientoService.editarMovimiento(id, dto, usuario.getId())));
    }
}
