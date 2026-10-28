package com.agramon.chatweb.Controller;

import com.agramon.chatweb.Entidades.Usuario;
import com.agramon.chatweb.Servicios.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "https://1105agramon.github.io")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> datos) {
        try {
            String telefono = datos.get("telefono");
            String alias = datos.get("alias");
            String password = datos.get("password");

            String pregunta = datos.get("preguntaSeguridad");
            String respuesta = datos.get("respuestaSeguridad");
            String pin = datos.get("pinRecuperacion");

            Usuario nuevoUsuario = usuarioService.registrarUsuario(telefono, alias, password, pregunta, respuesta, pin);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> datos) {
        try {
            String telefono = datos.get("telefono");
            String password = datos.get("password");

            Usuario usuario = usuarioService.login(telefono, password);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/pregunta-seguridad/{telefono}")
    public ResponseEntity<?> obtenerPregunta(@PathVariable String telefono) {
        try {
            String pregunta = usuarioService.obtenerPreguntaSeguridad(telefono);
            return ResponseEntity.ok(Collections.singletonMap("pregunta", pregunta));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> datos) {
        try {
            String telefono = datos.get("telefono");
            String respuesta = datos.get("respuesta");
            String pin = datos.get("pin");
            String nuevaPassword = datos.get("nuevaPassword");

            usuarioService.restablecerPassword(telefono, respuesta, pin, nuevaPassword);
            return ResponseEntity.ok(Collections.singletonMap("mensaje", "Contraseña restablecida correctamente."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarCuenta(@PathVariable Long id) {
        usuarioService.desactivarCuenta(id);
        return ResponseEntity.ok("Cuenta desactivada correctamente.");
    }

    @PostMapping("/sincronizar-contactos")
    public ResponseEntity<List<Usuario>> sincronizarContactos(@RequestBody List<String> telefonos) {
        List<Usuario> contactos = usuarioService.sincronizarContactos(telefonos);
        return ResponseEntity.ok(contactos);
    }

    @PostMapping("/reactivar")
    public ResponseEntity<?> reactivarCuenta(@RequestBody Map<String, String> datos) {
        try {
            String telefono = datos.get("telefono");
            String password = datos.get("password");

            Usuario usuario = usuarioService.reactivarCuenta(telefono, password);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NUEVO ENDPOINT: Actualizar Perfil ---
    @PutMapping("/{id}/perfil")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String nuevoAlias = datos.get("alias");
            String nuevoTelefono = datos.get("telefono");

            Usuario usuarioActualizado = usuarioService.actualizarPerfil(id, nuevoAlias, nuevoTelefono);
            return ResponseEntity.ok(usuarioActualizado);

        } catch (RuntimeException e) {
            // Si el servicio detecta que el número ya existe, mandamos 409 Conflict
            if ("NUMERO_EXISTENTE".equals(e.getMessage())) {
                return ResponseEntity.status(409).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- NUEVO ENDPOINT: Actualizar Seguridad ---
    @PutMapping("/{id}/seguridad")
    public ResponseEntity<?> actualizarSeguridad(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
            String currentPassword = datos.get("currentPassword");
            String newPassword = datos.get("newPassword");
            String newPin = datos.get("newPin");
            String newPregunta = datos.get("newPregunta");
            String newRespuesta = datos.get("newRespuesta");

            usuarioService.actualizarSeguridad(id, currentPassword, newPassword, newPin, newPregunta, newRespuesta);

            return ResponseEntity.ok("Seguridad actualizada correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}