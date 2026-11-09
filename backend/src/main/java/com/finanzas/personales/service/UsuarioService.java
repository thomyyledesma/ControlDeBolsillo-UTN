package com.finanzas.personales.service;


import com.finanzas.personales.Exception.UsuarioNoEncontradoException;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

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
}