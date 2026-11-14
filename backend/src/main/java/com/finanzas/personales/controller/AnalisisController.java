package com.finanzas.personales.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finanzas.personales.dto.response.AnalisisResponseDTO;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.service.AnalisisFinancieroService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/analisis")
@PreAuthorize("hasRole('PREMIUM')")
@RequiredArgsConstructor
public class AnalisisController {

    private final AnalisisFinancieroService analisisService;

    @GetMapping
    public AnalisisResponseDTO analizar(@AuthenticationPrincipal Usuario usuario) {
        String analisis = analisisService.analizarFinanzas(usuario.getId());
        return new AnalisisResponseDTO(analisis);
    }

    @GetMapping("/periodo")
    public AnalisisResponseDTO analizarPorPeriodo(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        String analisis = analisisService.analizarFinanzasPorPeriodo(usuario.getId(), desde, hasta);
        return new AnalisisResponseDTO(analisis);
    }
}