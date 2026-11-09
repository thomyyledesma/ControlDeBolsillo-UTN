package com.finanzas.personales.service;

import com.finanzas.personales.dto.response.CotizacionDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class CotizacionService {

    private final RestClient restClient;
    private final String baseUrl;

    public CotizacionService(@Value("${dolarapi.base-url:https://dolarapi.com/v1}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = RestClient.create();
    }


    public List<CotizacionDTO> obtenerDolares() {
        return restClient.get()
                .uri(baseUrl + "/dolares")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CotizacionDTO>>() {});
    }


    public List<CotizacionDTO> obtenerDivisas() {
        return restClient.get()
                .uri(baseUrl + "/cotizaciones")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CotizacionDTO>>() {});
    }
}