package com.finanzas.personales.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.finanzas.personales.Exception.PlanLimiteExcedidoException;
import com.finanzas.personales.dto.request.CuentaRequestDTO;
import com.finanzas.personales.enums.Rol;
import com.finanzas.personales.enums.TipoCuenta;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CuentaRepository;
import com.finanzas.personales.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock 
    private CuentaRepository cuentaRepository;
    @Mock 
    private MovimientoService movimientoService;
    @InjectMocks 
    private CuentaService cuentaService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private UsuarioService usuarioService;
    private Usuario usuario;

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

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioService(usuarioRepository, passwordEncoder);
        usuario = new Usuario();
        usuario.setEmail("test@mail.com");
        usuario.setPassword(passwordEncoder.encode("clave123"));
        when(usuarioRepository.findByEmail("test@mail.com")).thenReturn(Optional.of(usuario));
    }

    @Test
    void cambiarPassword_conActualCorrecta_guardaLaNuevaEncriptada() {
        usuarioService.cambiarPassword("test@mail.com", "clave123", "nueva456");

        assertTrue(passwordEncoder.matches("nueva456", usuario.getPassword()));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void cambiarPassword_conActualIncorrecta_lanzaErrorYNoGuarda() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> usuarioService.cambiarPassword("test@mail.com", "incorrecta", "nueva456"));

        assertEquals("La contraseña actual es incorrecta", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cambiarPassword_conNuevaIgualALaActual_lanzaError() {
        assertThrows(IllegalArgumentException.class,
                () -> usuarioService.cambiarPassword("test@mail.com", "clave123", "clave123"));
        verify(usuarioRepository, never()).save(any());
    }

        @Test
    void pasarAPremium_cambiaElRol() {
        Usuario u = new Usuario();
        u.setEmail("a@a.com");
        when(usuarioRepository.findByEmail("a@a.com")).thenReturn(Optional.of(u));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        Usuario resultado = usuarioService.pasarAPremium("a@a.com");

        assertEquals(Rol.PREMIUM, resultado.getRol());
    }
}