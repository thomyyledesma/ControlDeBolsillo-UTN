package com.finanzas.personales.service;


import com.finanzas.personales.Exception.UsuarioNoEncontradoException;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
    }

    public Usuario actualizarPerfil(String email, String nombre) {
        Usuario usuario = buscarPorEmail(email);
        usuario.setNombre(nombre);
        return usuarioRepository.save(usuario);
    }

        public void cambiarPassword(String email, String passwordActual, String passwordNueva) {
        Usuario usuario = buscarPorEmail(email);

        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        if (passwordEncoder.matches(passwordNueva, usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña nueva debe ser distinta de la actual");
        }

        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }
}