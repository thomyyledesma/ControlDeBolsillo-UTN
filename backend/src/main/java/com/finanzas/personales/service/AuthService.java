package com.finanzas.personales.service;

import com.finanzas.personales.Exception.CredencialesInvalidasException;
import com.finanzas.personales.Exception.EmailYaRegistradoException;
import com.finanzas.personales.Exception.UsuarioNoEncontradoException;
import com.finanzas.personales.dto.request.LoginRequestDTO;
import com.finanzas.personales.dto.request.RegisterRequestDTO;
import com.finanzas.personales.dto.response.AuthResponseDTO;
import com.finanzas.personales.enums.TipoCuenta;
import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Cuenta;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CategoriaRepository;
import com.finanzas.personales.repository.CuentaRepository;
import com.finanzas.personales.repository.UsuarioRepository;
import com.finanzas.personales.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CuentaRepository cuentaRepository;
    private final CategoriaRepository categoriaRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponseDTO registrar(RegisterRequestDTO dto) {

        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new EmailYaRegistradoException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));

        usuarioRepository.save(usuario);

        Cuenta cuentaEfectivo = new Cuenta();
        cuentaEfectivo.setNombre("Efectivo");
        cuentaEfectivo.setSaldo(BigDecimal.ZERO);
        cuentaEfectivo.setTipoCuenta(TipoCuenta.EFECTIVO);
        cuentaEfectivo.setActiva(true);
        cuentaEfectivo.setUsuario(usuario);

        cuentaRepository.save(cuentaEfectivo);

        crearCategoriasDefault(usuario);

        String token = jwtService.generarToken(usuario.getEmail());

        return new AuthResponseDTO(token, usuario.getEmail());
    }

    public AuthResponseDTO login(LoginRequestDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Contraseña incorrecta");
        }

        String token = jwtService.generarToken(usuario.getEmail());

        return new AuthResponseDTO(token, usuario.getEmail());
    }

    private void crearCategoriasDefault(Usuario usuario) {

        crearCategoria("Sueldo", TipoMovimiento.INGRESO, usuario);
        crearCategoria("Freelance", TipoMovimiento.INGRESO, usuario);
        crearCategoria("Regalo", TipoMovimiento.INGRESO, usuario);
        crearCategoria("Venta", TipoMovimiento.INGRESO, usuario);
        crearCategoria("Transferencia recibida", TipoMovimiento.INGRESO, usuario);
        crearCategoria("Otros ingresos", TipoMovimiento.INGRESO, usuario);

        crearCategoria("Supermercado", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Transporte", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Alquiler", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Servicios", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Subscripciones", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Seguro", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Salud", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Educacion", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Entretenimiento", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Ropa", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Salidas", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Gimnasio", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Impuestos", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Mascotas", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Transferencia Enviada", TipoMovimiento.EGRESO, usuario);
        crearCategoria("Otros gastos", TipoMovimiento.EGRESO, usuario);
    }

    private void crearCategoria(String nombre, TipoMovimiento tipo, Usuario usuario) {

        Categoria categoria = new Categoria();

        categoria.setNombre(nombre);
        categoria.setTipo(tipo);
        categoria.setEsDefault(true);
        categoria.setUsuario(usuario);

        categoriaRepository.save(categoria);
    }
}