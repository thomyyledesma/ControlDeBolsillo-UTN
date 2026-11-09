
package com.finanzas.personales.controller;


import com.finanzas.personales.dto.request.PresupuestoRequestDTO;
import com.finanzas.personales.dto.response.PresupuestoResponseDTO;
import com.finanzas.personales.model.Presupuesto;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.PresupuestoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/presupuestos")
@RequiredArgsConstructor
public class PresupuestoController {


    private final PresupuestoService presupuestoService;

    @PostMapping
    public ResponseEntity<PresupuestoResponseDTO> guardar(@Valid @RequestBody PresupuestoRequestDTO dto,
                                                          @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(PresupuestoResponseDTO.from(presupuestoService.guardar(dto, usuario)));
    }


    @GetMapping
    public ResponseEntity<List<PresupuestoResponseDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        List<PresupuestoResponseDTO> presupuestos = presupuestoService.listar(usuario.getId())
                .stream()
                .map(PresupuestoResponseDTO::from)
                .toList();
        return ResponseEntity.ok(presupuestos);
    }


    @GetMapping("/{id}")
    public ResponseEntity<PresupuestoResponseDTO> listarXid(@PathVariable Long id,
                                 @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(PresupuestoResponseDTO.from(presupuestoService.listarXid(id, usuario.getId())));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                           @AuthenticationPrincipal Usuario usuario) {
        presupuestoService.eliminar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<PresupuestoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody PresupuestoRequestDTO dto,
                                                             @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(PresupuestoResponseDTO.from(presupuestoService.actualizar(id, dto, usuario.getId())));
    }


}
