package com.finanzas.personales.dto.response;

import java.math.BigDecimal;

public record CotizacionDTO(
        String moneda,
        String casa,
        String nombre,
        BigDecimal compra,
        BigDecimal venta,
        String fechaActualizacion
) {
}