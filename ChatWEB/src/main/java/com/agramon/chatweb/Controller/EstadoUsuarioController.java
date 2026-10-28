package com.agramon.chatweb.Controller;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = "https://1105agramon.github.io")
@RestController
public class EstadoUsuarioController {

    private final SimpMessagingTemplate messagingTemplate;

    // Diccionario para guardar: ID de la Sesión WebSocket -> ID del Usuario
    private final Map<String, Long> sesionesActivas = new ConcurrentHashMap<>();

    public EstadoUsuarioController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // 1. Cuando el frontend se conecta, manda su ID aquí
    @MessageMapping("/usuario/conectar")
    public void registrarConexion(@Payload Long idUsuario, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        sesionesActivas.put(sessionId, idUsuario);

        // Avisamos a todos los usuarios conectados que este usuario entró (JSON)
        messagingTemplate.convertAndSend("/topic/estado-usuarios",
                "{\"idUsuario\":" + idUsuario + ", \"online\":true}");
    }

    // 2. Automático: Si el usuario cierra la pestaña o pierde internet, Spring Boot lo detecta aquí
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        Long idUsuario = sesionesActivas.remove(sessionId);

        if (idUsuario != null) {
            // Verificamos que no tenga otra pestaña de chat abierta en otro lado
            if (!sesionesActivas.containsValue(idUsuario)) {
                // Si ya no hay sesiones, avisamos a todos que se desconectó
                messagingTemplate.convertAndSend("/topic/estado-usuarios",
                        "{\"idUsuario\":" + idUsuario + ", \"online\":false}");
            }
        }
    }

    // 3. Endpoint REST para saber quién está en línea al entrar por primera vez
    @GetMapping("/api/usuarios/estados-online")
    public Set<Long> obtenerUsuariosOnline() {
        return sesionesActivas.values().stream().collect(Collectors.toSet());
    }
}