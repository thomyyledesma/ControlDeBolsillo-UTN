package com.finanzas.personales.service;

import com.finanzas.personales.dto.response.CriptoDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class CriptoService {

    private final RestClient restClient;
    private final String baseUrl;
    private final String monedas;
    private final String apiKey;

    public CriptoService(
            @Value("${coingecko.base-url:https://api.coingecko.com/api/v3}") String baseUrl,
            @Value("${coingecko.monedas:bitcoin,ethereum,tether,binancecoin,solana,cardano}") String monedas,
            @Value("${coingecko.api-key:}") String apiKey) {
        this.baseUrl = baseUrl;
        this.monedas = monedas;
        this.apiKey = apiKey;
        this.restClient = RestClient.create();
    }

    /** Precios en USD de las principales criptomonedas, ordenadas por capitalización. */
    public List<CriptoDTO> obtenerCriptos() {
        try {
            String uri = baseUrl + "/coins/markets?vs_currency=usd&order=market_cap_desc&ids=" + monedas;

            RestClient.RequestHeadersSpec<?> request = restClient.get().uri(uri);

            if (apiKey != null && !apiKey.isBlank()) {
                request = request.header("x-cg-demo-api-key", apiKey);
            }

            List<CriptoDTO> resultado = request
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CriptoDTO>>() {});

            return resultado != null ? resultado : Collections.emptyList();

        } catch (Exception e) {
            log.error("[CoinGecko] No se pudieron obtener las cripto: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}