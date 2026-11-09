package com.finanzas.personales.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record CriptoDTO(
        String id,
        String symbol,
        String name,
        @JsonProperty("current_price") BigDecimal precioUsd,
        @JsonProperty("price_change_percentage_24h") BigDecimal cambio24h,
        @JsonProperty("market_cap") BigDecimal capitalizacion
) {
}