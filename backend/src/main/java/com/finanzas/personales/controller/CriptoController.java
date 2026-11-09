package com.finanzas.personales.controller;

import com.finanzas.personales.dto.response.CriptoDTO;
import com.finanzas.personales.service.CriptoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/criptos")
@RequiredArgsConstructor
public class CriptoController {

    private final CriptoService criptoService;

    @GetMapping
    public List<CriptoDTO> listar() {
        return criptoService.obtenerCriptos();
    }
}