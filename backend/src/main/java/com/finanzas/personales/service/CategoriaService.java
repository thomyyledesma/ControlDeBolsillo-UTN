package com.finanzas.personales.service;

import com.finanzas.personales.Exception.CategoriaEnUsoException;
import com.finanzas.personales.Exception.CategoriaNoEncontradaException;
import com.finanzas.personales.Exception.ReglaNegocioException;
import com.finanzas.personales.dto.request.CategoriaRequestDTO;
import com.finanzas.personales.dto.response.CategoriaResponseDTO;
import com.finanzas.personales.enums.TipoMovimiento;
import com.finanzas.personales.model.Categoria;
import com.finanzas.personales.model.Usuario;
import com.finanzas.personales.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto, Usuario usuario){
        if(categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(usuario.getId(), dto.getNombre())){
            throw new ReglaNegocioException("Ya existe una categoria con ese nombre");
        }

        Categoria categoria = new Categoria();
        categoria.setNombre(dto.getNombre());
        categoria.setIcono(dto.getIcono());
        categoria.setTipo(dto.getTipo());
        categoria.setEsDefault(false);
        categoria.setUsuario(usuario);

        return CategoriaResponseDTO.from(categoriaRepository.save(categoria));
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listar(Long usuarioId){
        return categoriaRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(CategoriaResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarPorTipo(Long usuarioId, TipoMovimiento tipo){
        return categoriaRepository.findByUsuarioIdAndTipo(usuarioId, tipo)
                .stream()
                .map(CategoriaResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(Long id, Long usuarioId){
        Categoria categoria = obtenerOLanzar(id);
        verificarPropietario(categoria, usuarioId);
        return CategoriaResponseDTO.from(categoria);
    }

    @Transactional
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto, Long usuarioId){
        Categoria categoria = obtenerOLanzar(id);
        verificarPropietario(categoria, usuarioId);

        boolean tieneMovimientos = categoria.getMovimientos() != null && !categoria.getMovimientos().isEmpty();
        if (tieneMovimientos && categoria.getTipo() != dto.getTipo()) {
            throw new ReglaNegocioException("No se puede cambiar el tipo de una categoria que ya tiene movimientos asociados");
        }

        boolean nombreCambio = !categoria.getNombre().equalsIgnoreCase(dto.getNombre());

        if(nombreCambio && categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(usuarioId, dto.getNombre())){
            throw new ReglaNegocioException("Ya existe una categoria con ese nombre");
        }

        categoria.setNombre(dto.getNombre());
        categoria.setIcono(dto.getIcono());
        categoria.setTipo(dto.getTipo());

        return CategoriaResponseDTO.from(categoriaRepository.save(categoria));
    }


    @Transactional
    public void eliminar(Long id, Long usuarioId){
        Categoria categoria = obtenerOLanzar(id);
        verificarPropietario(categoria, usuarioId);

        if (Boolean.TRUE.equals(categoria.getEsDefault())) {
            throw new ReglaNegocioException("No se puede eliminar una categoria por defecto del sistema");
        }

        if(categoria.getMovimientos() != null && !categoria.getMovimientos().isEmpty()){
            throw new CategoriaEnUsoException("No se puede eliminar la categoria porque tiene " + categoria.getMovimientos().size() + " movimientos asociados. Reasigna los movimientos a otra categoria para eliminar " + categoria.getNombre());
        }

        categoriaRepository.delete(categoria);
    }


    private Categoria obtenerOLanzar(Long id){
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNoEncontradaException("Categoria no encontrada"));
    }

    private void verificarPropietario(Categoria categoria, Long usuarioId){
        if(categoria.getUsuario() == null || !categoria.getUsuario().getId().equals(usuarioId)){
            throw new CategoriaNoEncontradaException("Categoria no encontrada");
        }
    }
}