package com.finanzas.personales.controller;

import com.finanzas.personales.dto.response.CotizacionDTO;
import com.finanzas.personales.service.CotizacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/cotizaciones")
@RequiredArgsConstructor
public class CotizacionController {

    private final CotizacionService cotizacionService;

    @GetMapping("/dolares")
    public List<CotizacionDTO> dolares() {
        return cotizacionService.obtenerDolares();
    }

    @GetMapping("/divisas")
    public List<CotizacionDTO> divisas() {
        return cotizacionService.obtenerDivisas();
    }
}