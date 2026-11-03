package com.agramon.chatweb.Controller;

import com.agramon.chatweb.Entidades.Mensaje;
import com.agramon.chatweb.Entidades.Usuario;
import com.agramon.chatweb.Servicios.MensajeService;
import com.agramon.chatweb.utils.FCMService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "https://1105agramon.github.io")
@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    private final MensajeService mensajeService;
    private final FCMService fcmService; // 1. Declaramos el servicio de Firebase

    // 2. Lo inyectamos en el constructor
    public MensajeController(MensajeService mensajeService, FCMService fcmService) {
        this.mensajeService = mensajeService;
        this.fcmService = fcmService;
    }

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensaje(
            @RequestParam Long idConversacion,
            @RequestParam Long idRemitente,
            @RequestParam(required = false) String contenido,
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam(required = false) Long idMensajeRespondido) {

        try {
            // Validamos que al menos envíe texto o una imagen
            if ((contenido == null || contenido.trim().isEmpty()) && (imagen == null || imagen.isEmpty())) {
                return ResponseEntity.badRequest().body("El mensaje no puede estar completamente vacío.");
            }

            // Guardamos el mensaje (aquí tu servicio también debería estar haciendo el envío por WebSocket)
            Mensaje nuevoMensaje = mensajeService.enviarMensaje(idConversacion, idRemitente, contenido, imagen, idMensajeRespondido);

            // --- 3. LÓGICA DE NOTIFICACIONES PUSH FIREBASE ---
            try {
                Usuario remitente = nuevoMensaje.getRemitente();
                Usuario usuario1 = nuevoMensaje.getConversacion().getUsuario1();
                Usuario usuario2 = nuevoMensaje.getConversacion().getUsuario2();

                // Identificamos quién es el receptor (el que NO envió el mensaje)
                Usuario receptor = (usuario1.getIdUsuario().equals(idRemitente)) ? usuario2 : usuario1;

                // Verificamos si el receptor tiene un token registrado en la base de datos
                if (receptor != null && receptor.getTokenFcm() != null && !receptor.getTokenFcm().isEmpty()) {

                    // Si mandan solo foto, decimos "Imagen", si no, mostramos el texto
                    String textoNotif = (contenido == null || contenido.trim().isEmpty()) ? "📷 Imagen" : contenido;

                    // NUEVO: Disparamos la notificación mandando el idConversacion al final
                    fcmService.enviarNotificacionPush(receptor.getTokenFcm(), remitente.getAlias(), textoNotif, idConversacion);
                }
            } catch (Exception ex) {
                // Si la push falla, lo registramos pero dejamos que el método siga normal
                // para que el chat no se rompa.
                System.out.println("Aviso: No se pudo enviar notificación Push - " + ex.getMessage());
            }
            // ---------------------------------------------------------

            return ResponseEntity.ok(nuevoMensaje);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/historial/{idConversacion}/{idUsuario}")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Long idConversacion, @PathVariable Long idUsuario) {
        try {
            List<Mensaje> mensajes = mensajeService.obtenerHistorial(idConversacion, idUsuario);
            return ResponseEntity.ok(mensajes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/no-leidos/{idConversacion}/{idUsuario}")
    public ResponseEntity<Long> contarNoLeidos(@PathVariable Long idConversacion, @PathVariable Long idUsuario) {
        return ResponseEntity.ok(mensajeService.contarNoLeidos(idConversacion, idUsuario));
    }

    @PutMapping("/leer/{idConversacion}/{idLector}")
    public ResponseEntity<?> marcarComoLeidos(@PathVariable Long idConversacion, @PathVariable Long idLector) {
        mensajeService.marcarComoLeidos(idConversacion, idLector);
        return ResponseEntity.ok("Mensajes marcados como leídos");
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<Mensaje> editarMensaje(@PathVariable Long id, @RequestBody Mensaje mensajeRequest) {
        Mensaje mensajeActualizado = mensajeService.editarMensaje(id, mensajeRequest.getContenido());
        return ResponseEntity.ok(mensajeActualizado);
    }
}