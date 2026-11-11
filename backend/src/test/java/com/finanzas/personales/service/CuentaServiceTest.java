package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.finanzas.personales.Exception.PlanLimiteExcedidoException;
import com.finanzas.personales.dto.request.CuentaRequestDTO;
import com.finanzas.personales.enums.TipoCuenta;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CuentaRepository;
import com.finanzas.personales.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class CuentaServiceTest {

    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private MovimientoService movimientoService;
    @InjectMocks
    private CuentaService cuentaService;

    private CuentaRequestDTO dto() {
        CuentaRequestDTO dto = new CuentaRequestDTO();
        dto.setNombre("Nueva");
        dto.setTipoCuenta(TipoCuenta.EFECTIVO);
        return dto;
    }

    @Test
    void usuarioFreeNoPuedeCrearLaQuintaCuenta() {
        Usuario u = new Usuario();
        u.setId(1L);
        when(cuentaRepository.countByUsuarioId(1L)).thenReturn(4L);

        assertThrows(PlanLimiteExcedidoException.class, () -> cuentaService.crearCuenta(dto(), u));
        verify(cuentaRepository, never()).save(any());
    }
}