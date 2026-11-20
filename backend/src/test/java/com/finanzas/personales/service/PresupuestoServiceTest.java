package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.dto.request.PresupuestoRequestDTO;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Presupuesto;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CategoriaRepository;
import com.finanzas.personales.repository.PresupuestoRepository;

@ExtendWith(MockitoExtension.class)
class PresupuestoServiceTest {

    @Mock
    private PresupuestoRepository presupuestoRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @InjectMocks
    private PresupuestoService presupuestoService;

    @Test
    void editarSinCambiarElPeriodoNoLoTomaPorDuplicado() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        Categoria categoria = new Categoria();
        categoria.setId(10L);

        Presupuesto existente = new Presupuesto();
        existente.setId(5L);
        existente.setUsuario(usuario);
        existente.setCategoria(categoria);
        existente.setMes(5);
        existente.setAnio(2026);
        existente.setMontoLimite(new BigDecimal("1000"));

        PresupuestoRequestDTO dto = new PresupuestoRequestDTO();
        dto.setCategoriaId(10L);
        dto.setMes(5);
        dto.setAnio(2026);
        dto.setMontoLimite(new BigDecimal("2000"));

        when(presupuestoRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(categoriaRepository.findByIdAndUsuarioId(10L, 1L)).thenReturn(Optional.of(categoria));
        when(presupuestoRepository.save(any(Presupuesto.class))).thenAnswer(i -> i.getArgument(0));

        Presupuesto resultado = presupuestoService.actualizar(5L, dto, 1L);

        assertEquals(new BigDecimal("2000"), resultado.getMontoLimite());
        verify(presupuestoRepository, never())
                .findByUsuarioIdAndCategoriaIdAndMesAndAnio(anyLong(), anyLong(), anyInt(), anyInt());
    }

    @Test
    void noSePuedeCrearUnPresupuestoParaUnMesQueYaPaso() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        PresupuestoRequestDTO dto = new PresupuestoRequestDTO();
        dto.setCategoriaId(10L);
        dto.setMes(1);
        dto.setAnio(2020);
        dto.setMontoLimite(new BigDecimal("1000"));

        assertThrows(ReglaNegocioException.class, () -> presupuestoService.guardar(dto, usuario));
        verify(presupuestoRepository, never()).save(any());
    }
}