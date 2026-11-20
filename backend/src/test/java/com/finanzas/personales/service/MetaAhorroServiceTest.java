package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Cuenta;
import com.finanzas.personales.model.MetaAhorro;
import com.finanzas.personales.model.Movimiento;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CategoriaRepository;
import com.finanzas.personales.repository.CuentaRepository;
import com.finanzas.personales.repository.MetaAhorroRepository;
import com.finanzas.personales.repository.MovimientoRepository;
import com.finanzas.personales.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class MetaAhorroServiceTest {

    @Mock
    private MetaAhorroRepository metaAhorroRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private MovimientoRepository movimientoRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @InjectMocks
    private MetaAhorroService metaAhorroService;

    private MetaAhorro meta(Cuenta cuenta, String ahorrado) {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        MetaAhorro meta = new MetaAhorro();
        meta.setId(7L);
        meta.setNombre("Viaje");
        meta.setUsuario(usuario);
        meta.setCuenta(cuenta);
        meta.setMontoActual(new BigDecimal(ahorrado));
        return meta;
    }

    @Test
    void alEliminarUnaMetaConDineroSeDevuelveALaCuenta() {
        Cuenta cuenta = new Cuenta();
        cuenta.setSaldo(new BigDecimal("1000"));
        MetaAhorro meta = meta(cuenta, "500");

        when(metaAhorroRepository.findById(7L)).thenReturn(Optional.of(meta));
        when(categoriaRepository.findByUsuarioIdAndTipo(1L, TipoMovimiento.INGRESO)).thenReturn(List.of());

        metaAhorroService.eliminar(7L, 1L);

        assertEquals(new BigDecimal("1500"), cuenta.getSaldo());
        verify(cuentaRepository).save(cuenta);
        verify(movimientoRepository).save(any(Movimiento.class));
        verify(metaAhorroRepository).delete(meta);
    }

    @Test
    void alEliminarUnaMetaSinDineroNoSeTocaLaCuenta() {
        MetaAhorro meta = meta(null, "0");
        when(metaAhorroRepository.findById(7L)).thenReturn(Optional.of(meta));

        metaAhorroService.eliminar(7L, 1L);

        verify(cuentaRepository, never()).save(any());
        verify(metaAhorroRepository).delete(meta);
    }

    @Test
    void noSePuedeEliminarUnaMetaConDineroSiNoTieneCuentaAsociada() {
        MetaAhorro meta = meta(null, "300");
        when(metaAhorroRepository.findById(7L)).thenReturn(Optional.of(meta));

        assertThrows(ReglaNegocioException.class, () -> metaAhorroService.eliminar(7L, 1L));
        verify(metaAhorroRepository, never()).delete(any());
    }
}