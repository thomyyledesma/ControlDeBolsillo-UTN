package com.finanzas.personales.dto.response;

import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Categoria;
import lombok.Data;

@Data
public class CategoriaResponseDTO {

    private Long id;
    private String nombre;
    private String icono;
    private TipoMovimiento tipo;

    private int cantidadMovimientos;

    public static CategoriaResponseDTO from(Categoria categoria){
        CategoriaResponseDTO dto = new CategoriaResponseDTO();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setIcono(categoria.getIcono());
        dto.setTipo(categoria.getTipo());
        dto.setCantidadMovimientos(categoria.getMovimientos() != null ? categoria.getMovimientos().size() : 0);
        return dto;
    }
}
