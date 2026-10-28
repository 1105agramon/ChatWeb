package com.agramon.chatweb.Servicios;

import com.agramon.chatweb.Entidades.Conversacion;
import com.agramon.chatweb.Entidades.Usuario;
import com.agramon.chatweb.Repositorio.ConversacionRepository;
import com.agramon.chatweb.Repositorio.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversacionService {

    private final ConversacionRepository conversacionRepository;
    private final UsuarioRepository usuarioRepository;

    public ConversacionService(ConversacionRepository conversacionRepository, UsuarioRepository usuarioRepository) {
        this.conversacionRepository = conversacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Conversacion obtenerOCrearConversacion(Long idUsuario1, Long idUsuario2) {
        // 1. Evitar chatear consigo mismo
        if (idUsuario1.equals(idUsuario2)) {
            throw new RuntimeException("No puedes iniciar un chat contigo mismo.");
        }

        Usuario user1 = usuarioRepository.findById(idUsuario1)
                .orElseThrow(() -> new RuntimeException("Usuario 1 no encontrado"));
        Usuario user2 = usuarioRepository.findById(idUsuario2)
                .orElseThrow(() -> new RuntimeException("Usuario 2 no encontrado"));

        // 2. Buscar si ya existe para NO duplicar, o crearlo si es nuevo
        Conversacion conversacion = conversacionRepository.findConversacionEntreUsuarios(user1, user2)
                .orElseGet(() -> {
                    Conversacion nueva = new Conversacion();
                    if (user1.getIdUsuario() < user2.getIdUsuario()) {
                        nueva.setUsuario1(user1);
                        nueva.setUsuario2(user2);
                    } else {
                        nueva.setUsuario1(user2);
                        nueva.setUsuario2(user1);
                    }
                    return conversacionRepository.save(nueva);
                });

        // 3. NUEVO: Si el chat ya existía, pero el usuario lo había "eliminado" (ocultado), lo revivimos
        boolean guardarCambios = false;

        if (conversacion.getUsuario1().getIdUsuario().equals(idUsuario1) && conversacion.getFechaOcultaUsuario1() != null) {
            conversacion.setFechaOcultaUsuario1(null);
            guardarCambios = true;
        } else if (conversacion.getUsuario2().getIdUsuario().equals(idUsuario1) && conversacion.getFechaOcultaUsuario2() != null) {
            conversacion.setFechaOcultaUsuario2(null);
            guardarCambios = true;
        }

        // Si quitamos alguna fecha oculta, guardamos la actualización en la BD
        if (guardarCambios) {
            conversacion = conversacionRepository.save(conversacion);
        }

        return conversacion;
    }

    public void ocultarConversacion(Long idConversacion, Long idUsuario) {
        Conversacion conversacion = conversacionRepository.findById(idConversacion)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        if (conversacion.getUsuario1().getIdUsuario().equals(idUsuario)) {
            conversacion.setFechaOcultaUsuario1(LocalDateTime.now());
        } else if (conversacion.getUsuario2().getIdUsuario().equals(idUsuario)) {
            conversacion.setFechaOcultaUsuario2(LocalDateTime.now());
        } else {
            throw new RuntimeException("El usuario no pertenece a esta conversación");
        }

        conversacionRepository.save(conversacion);
    }

    public List<Conversacion> obtenerMisConversaciones(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Conversacion> todasMisConversaciones = conversacionRepository.findConversacionesPorUsuario(usuario);

        return todasMisConversaciones.stream().filter(conv -> {
            LocalDateTime fechaOculta = conv.getUsuario1().getIdUsuario().equals(idUsuario)
                    ? conv.getFechaOcultaUsuario1()
                    : conv.getFechaOcultaUsuario2();

            // Si nunca la he ocultado, se muestra
            if (fechaOculta == null) return true;

            // Si la oculté, pero la última actividad es DESPUÉS de que la oculté, el chat REVIVE
            if (conv.getUltimaActividad() != null && conv.getUltimaActividad().isAfter(fechaOculta)) {
                return true;
            }

            // Si está oculta y no hay mensajes nuevos, NO se muestra
            return false;
        }).collect(Collectors.toList());
    }
}