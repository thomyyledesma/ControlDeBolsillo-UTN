package com.finanzas.personales.dto.response;

import com.finanzas.personales.enums.TipoCuenta;
import com.finanzas.personales.model.Cuenta;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CuentaResponseDTO {

    private Long id;
    private String nombre;
    private BigDecimal saldo;
    private TipoCuenta tipoCuenta;
    private Boolean activa;

    public static CuentaResponseDTO from(Cuenta cuenta) {
        CuentaResponseDTO dto = new CuentaResponseDTO();
        dto.setId(cuenta.getId());
        dto.setNombre(cuenta.getNombre());
        dto.setSaldo(cuenta.getSaldo());
        dto.setTipoCuenta(cuenta.getTipoCuenta());
        dto.setActiva(cuenta.getActiva());
        return dto;
    }
}
