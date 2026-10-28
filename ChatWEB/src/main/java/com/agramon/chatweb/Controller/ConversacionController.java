package com.agramon.chatweb.Controller;

import com.agramon.chatweb.Entidades.Conversacion;
import com.agramon.chatweb.Servicios.ConversacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "https://1105agramon.github.io")
@RestController
@RequestMapping("/api/conversaciones")
public class ConversacionController {

    private final ConversacionService conversacionService;

    public ConversacionController(ConversacionService conversacionService) {
        this.conversacionService = conversacionService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarConversacion(@RequestParam Long idUsuario1, @RequestParam Long idUsuario2) {
        try {
            Conversacion conversacion = conversacionService.obtenerOCrearConversacion(idUsuario1, idUsuario2);
            return ResponseEntity.ok(conversacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerMisConversaciones(@PathVariable Long idUsuario) {
        try {
            List<Conversacion> conversaciones = conversacionService.obtenerMisConversaciones(idUsuario);
            return ResponseEntity.ok(conversaciones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NUEVO: Endpoint arreglado para llamar al servicio ---
    @PutMapping("/{idConversacion}/eliminar/{idUsuario}")
    public ResponseEntity<?> ocultarConversacionParaUsuario(@PathVariable Long idConversacion, @PathVariable Long idUsuario) {
        try {
            conversacionService.ocultarConversacion(idConversacion, idUsuario);
            return ResponseEntity.ok("Chat ocultado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}