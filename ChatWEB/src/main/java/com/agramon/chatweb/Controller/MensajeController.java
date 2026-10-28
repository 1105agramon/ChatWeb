package com.agramon.chatweb.Controller;

import com.agramon.chatweb.Entidades.Mensaje;
import com.agramon.chatweb.Servicios.MensajeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "https://1105agramon.github.io")
@RestController
@RequestMapping("/api/mensajes")
public class MensajeController {

    private final MensajeService mensajeService;

    public MensajeController(MensajeService mensajeService) {
        this.mensajeService = mensajeService;
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

            // CORRECCIÓN: Se agregó 'idMensajeRespondido' como quinto parámetro
            Mensaje nuevoMensaje = mensajeService.enviarMensaje(idConversacion, idRemitente, contenido, imagen, idMensajeRespondido);
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