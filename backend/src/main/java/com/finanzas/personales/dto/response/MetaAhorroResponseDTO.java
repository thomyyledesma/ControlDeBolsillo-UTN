package com.finanzas.personales.dto.response;

import com.finanzas.personales.model.MetaAhorro;
import lombok.Data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Data
public class MetaAhorroResponseDTO {

    private Long id;
    private String nombre;
    private BigDecimal montoObjetivo;
    private BigDecimal montoActual;
    private BigDecimal porcentajeProgreso;
    private LocalDate fechaLimite;
    private Boolean cumplida;
    private Long usuarioId;
    private Long cuentaId;

    public static MetaAhorroResponseDTO from(MetaAhorro meta) {
        MetaAhorroResponseDTO dto = new MetaAhorroResponseDTO();
        dto.setId(meta.getId());
        dto.setNombre(meta.getNombre());
        dto.setMontoObjetivo(meta.getMontoObjetivo());
        dto.setMontoActual(meta.getMontoActual());
        dto.setFechaLimite(meta.getFechaLimite());
        dto.setCumplida(meta.getCumplida());
        dto.setUsuarioId(meta.getUsuario().getId());
        dto.setCuentaId(meta.getCuenta() != null ? meta.getCuenta().getId() : null);

        if(meta.getMontoObjetivo().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal porcentaje = meta.getMontoActual()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(meta.getMontoObjetivo(), 2, RoundingMode.HALF_UP);
            dto.setPorcentajeProgreso(porcentaje.min(BigDecimal.valueOf(100)));
        }else{
            dto.setPorcentajeProgreso(BigDecimal.ZERO);
        }
        return dto;
    }
}