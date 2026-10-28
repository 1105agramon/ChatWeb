package com.agramon.chatweb.Repositorio;

import com.agramon.chatweb.Entidades.Conversacion;
import com.agramon.chatweb.Entidades.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {

    // 1. Verifica si ya existe un chat entre dos personas (sin importar quién lo inició)
    @Query("SELECT c FROM Conversacion c WHERE (c.usuario1 = :user1 AND c.usuario2 = :user2) OR (c.usuario1 = :user2 AND c.usuario2 = :user1)")
    Optional<Conversacion> findConversacionEntreUsuarios(@Param("user1") Usuario user1, @Param("user2") Usuario user2);

    // 2. Trae todos los chats donde participa un usuario (su lista de chats activos)
    @Query("SELECT c FROM Conversacion c WHERE c.usuario1 = :usuario OR c.usuario2 = :usuario")
    List<Conversacion> findConversacionesPorUsuario(@Param("usuario") Usuario usuario);
}