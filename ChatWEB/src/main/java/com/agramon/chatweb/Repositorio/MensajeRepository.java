package com.agramon.chatweb.Repositorio;

import com.agramon.chatweb.Entidades.Conversacion;
import com.agramon.chatweb.Entidades.Mensaje;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Trae todos los mensajes de un chat, ordenados desde el más antiguo al más reciente
    List<Mensaje> findByConversacionOrderByFechaEnvioAsc(Conversacion conversacion);
    // Opcional si Spring Data JPA ya te lo provee por defecto, pero asegúrate de tenerlo disponible
    Optional<Mensaje> findById(Long idMensaje);

    // Cuenta cuántos mensajes no ha leído un usuario en un chat específico
    @Query("SELECT COUNT(m) FROM Mensaje m WHERE m.conversacion.idConversacion = :idChat AND m.remitente.idUsuario != :idUsuario AND m.estado != 'leido'")
    long contarMensajesNoLeidos(@Param("idChat") Long idChat, @Param("idUsuario") Long idUsuario);

    // Actualiza todos los mensajes recibidos a "leido" cuando el usuario abre el chat
    @Modifying
    @Transactional
    @Query("UPDATE Mensaje m SET m.estado = 'leido' WHERE m.conversacion.idConversacion = :idChat AND m.remitente.idUsuario != :idLector AND m.estado != 'leido'")
    void marcarMensajesComoLeidos(@Param("idChat") Long idChat, @Param("idLector") Long idLector);
}