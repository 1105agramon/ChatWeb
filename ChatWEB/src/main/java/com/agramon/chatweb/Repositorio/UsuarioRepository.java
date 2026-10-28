package com.agramon.chatweb.Repositorio;

import com.agramon.chatweb.Entidades.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar un usuario exacto por su teléfono (login o agregar contacto)
    Optional<Usuario> findByTelefono(String telefono);

    // Buscar varios usuarios a la vez (útil si sincronizas contactos del teléfono)
    List<Usuario> findByTelefonoIn(List<String> telefonos);
}