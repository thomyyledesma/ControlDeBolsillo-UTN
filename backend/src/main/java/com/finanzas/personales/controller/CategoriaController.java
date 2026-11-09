package com.finanzas.personales.controller;

import com.finanzas.personales.dto.request.CategoriaRequestDTO;
import com.finanzas.personales.dto.response.CategoriaResponseDTO;
import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> crear(@Valid @RequestBody CategoriaRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.crear(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequestDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.actualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id ,@AuthenticationPrincipal Usuario usuario) {
        categoriaService.eliminar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar(@RequestParam(required = false) TipoMovimiento tipo, @AuthenticationPrincipal Usuario usuario) {

        if (tipo != null) {
            return ResponseEntity.ok(categoriaService.listarPorTipo(usuario.getId(), tipo));
        }
        return ResponseEntity.ok(categoriaService.listar(usuario.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario){
        return ResponseEntity.ok(categoriaService.buscarPorId(id, usuario.getId()));
    }
}