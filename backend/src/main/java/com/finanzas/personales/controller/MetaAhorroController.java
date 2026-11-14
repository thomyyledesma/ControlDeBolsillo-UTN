package com.finanzas.personales.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finanzas.personales.dto.request.MetaAhorroRequestDTO;
import com.finanzas.personales.dto.request.MovimientoMetaRequestDTO;
import com.finanzas.personales.dto.response.MetaAhorroResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.MetaAhorroService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('PREMIUM')")
@RequestMapping("/metas-ahorro")
public class MetaAhorroController {

    private final MetaAhorroService metaAhorroService;

    @PostMapping
    public ResponseEntity<MetaAhorroResponseDTO> crear(@Valid @RequestBody MetaAhorroRequestDTO dto, @AuthenticationPrincipal Usuario usuarioAutenticado){

        MetaAhorroResponseDTO response = metaAhorroService.crear(dto, usuarioAutenticado.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MetaAhorroResponseDTO>> listar(@RequestParam(required = false) Boolean cumplida, @AuthenticationPrincipal Usuario usuarioAutenticado){
        List<MetaAhorroResponseDTO> metas;

        if(cumplida != null){
            metas = metaAhorroService.listarPorUsuarioYEstado(usuarioAutenticado.getId(), cumplida);
        }else{
            metas = metaAhorroService.listarPorUsuario(usuarioAutenticado.getId());
        }
        return ResponseEntity.ok(metas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetaAhorroResponseDTO> buscarPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioAutenticado){

        return ResponseEntity.ok(metaAhorroService.buscarPorId(id, usuarioAutenticado.getId()));
    }


    @PutMapping("/{id}")
    public ResponseEntity<MetaAhorroResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MetaAhorroRequestDTO dto, @AuthenticationPrincipal Usuario usuarioAutenticado){

        return ResponseEntity.ok(metaAhorroService.actualizar(id,dto, usuarioAutenticado.getId()));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioAutenticado){
        metaAhorroService.eliminar(id, usuarioAutenticado.getId());
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{id}/depositar")
    public ResponseEntity<MetaAhorroResponseDTO> depositar(@PathVariable Long id, @Valid @RequestBody MovimientoMetaRequestDTO dto, @AuthenticationPrincipal Usuario usuarioAutenticado){

        return ResponseEntity.ok(metaAhorroService.depositar(id, dto, usuarioAutenticado.getId()));
    }


    @PostMapping("/{id}/retirar")
    public ResponseEntity<MetaAhorroResponseDTO> retirar(@PathVariable Long id, @Valid @RequestBody MovimientoMetaRequestDTO dto, @AuthenticationPrincipal Usuario usuario){

        return ResponseEntity.ok(metaAhorroService.retirar(id, dto, usuario.getId()));
    }
}
