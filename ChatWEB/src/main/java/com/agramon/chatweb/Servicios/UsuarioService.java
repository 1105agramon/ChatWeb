package com.agramon.chatweb.Servicios;

import com.agramon.chatweb.Entidades.Usuario;
import com.agramon.chatweb.Repositorio.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Usuario registrarUsuario(String telefono, String alias, String passwordPlano, String pregunta, String respuesta, String pin) {
        if (usuarioRepository.findByTelefono(telefono).isPresent()) {
            throw new RuntimeException("El número de teléfono ya está registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setTelefono(telefono);
        nuevoUsuario.setAlias(alias);
        nuevoUsuario.setPassword(passwordEncoder.encode(passwordPlano));
        nuevoUsuario.setActivo(true);

        nuevoUsuario.setPreguntaSeguridad(pregunta);
        nuevoUsuario.setRespuestaSeguridad(passwordEncoder.encode(respuesta.toLowerCase()));
        nuevoUsuario.setPinRecuperacion(passwordEncoder.encode(pin));

        return usuarioRepository.save(nuevoUsuario);
    }

    public Usuario login(String telefono, String passwordPlano) {
        Usuario usuario = usuarioRepository.findByTelefono(telefono)
                .orElseThrow(() -> new RuntimeException("El número o la contraseña son incorrectos."));

        if (!passwordEncoder.matches(passwordPlano, usuario.getPassword())) {
            throw new RuntimeException("El número o la contraseña son incorrectos.");
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("CUENTA_INACTIVA");
        }

        return usuario;
    }

    public Usuario reactivarCuenta(String telefono, String passwordPlano) {
        Usuario usuario = usuarioRepository.findByTelefono(telefono)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (!passwordEncoder.matches(passwordPlano, usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta.");
        }

        usuario.setActivo(true);
        return usuarioRepository.save(usuario);
    }

    public String obtenerPreguntaSeguridad(String telefono) {
        Usuario usuario = usuarioRepository.findByTelefono(telefono)
                .orElseThrow(() -> new RuntimeException("No existe ninguna cuenta vinculada a este número."));
        return usuario.getPreguntaSeguridad();
    }

    public void restablecerPassword(String telefono, String respuestaPlana, String pinPlano, String nuevaPasswordPlana) {
        Usuario usuario = usuarioRepository.findByTelefono(telefono)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (!passwordEncoder.matches(respuestaPlana.toLowerCase(), usuario.getRespuestaSeguridad())) {
            throw new RuntimeException("La respuesta secreta es incorrecta.");
        }

        if (!passwordEncoder.matches(pinPlano, usuario.getPinRecuperacion())) {
            throw new RuntimeException("El PIN de recuperación es incorrecto.");
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPasswordPlana));
        usuarioRepository.save(usuario);
    }

    public void actualizarEstadoConexion(Long idUsuario, boolean enLinea) {
        usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
            usuario.setEnLinea(enLinea);
            if (!enLinea) {
                usuario.setUltimaConexion(LocalDateTime.now());
            }
            usuarioRepository.save(usuario);
        });
    }

    public List<Usuario> sincronizarContactos(List<String> telefonos) {
        return usuarioRepository.findByTelefonoIn(telefonos);
    }

    public void desactivarCuenta(Long idUsuario) {
        usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
            usuario.setActivo(false);
            usuario.setEnLinea(false);
            usuario.setUltimaConexion(LocalDateTime.now());
            usuarioRepository.save(usuario);
        });
    }

    public Usuario actualizarPerfil(Long idUsuario, String nuevoAlias, String nuevoTelefono) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (!usuario.getTelefono().equals(nuevoTelefono)) {
            if (usuarioRepository.findByTelefono(nuevoTelefono).isPresent()) {
                throw new RuntimeException("NUMERO_EXISTENTE");
            }
            usuario.setTelefono(nuevoTelefono);
        }

        usuario.setAlias(nuevoAlias);
        return usuarioRepository.save(usuario);
    }

    public void actualizarSeguridad(Long idUsuario, String currentPassword, String newPassword, String newPin, String newPregunta, String newRespuesta) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta.");
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(newPassword));
        }

        if (newPin != null && !newPin.trim().isEmpty()) {
            usuario.setPinRecuperacion(passwordEncoder.encode(newPin));
        }

        if (newPregunta != null && !newPregunta.trim().isEmpty() && newRespuesta != null && !newRespuesta.trim().isEmpty()) {
            usuario.setPreguntaSeguridad(newPregunta.toUpperCase());
            usuario.setRespuestaSeguridad(passwordEncoder.encode(newRespuesta.toLowerCase()));
        }

        usuarioRepository.save(usuario);
    }

    // --- NUEVO: Actualizar Token de Firebase ---
    public void actualizarTokenFcm(Long idUsuario, String tokenFcm) {
        usuarioRepository.findById(idUsuario).ifPresent(usuario -> {
            usuario.setTokenFcm(tokenFcm);
            usuarioRepository.save(usuario);
        });
    }


    public List<Usuario> buscarUsuarios(String filtro, Long idUsuarioActual) {
        return usuarioRepository.buscarUsuarios(filtro, idUsuarioActual);
    }
}