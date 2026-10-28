package com.agramon.chatweb.Servicios;

import com.agramon.chatweb.Entidades.Conversacion;
import com.agramon.chatweb.Entidades.Mensaje;
import com.agramon.chatweb.Entidades.Usuario;
import com.agramon.chatweb.Repositorio.ConversacionRepository;
import com.agramon.chatweb.Repositorio.MensajeRepository;
import com.agramon.chatweb.Repositorio.UsuarioRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final ConversacionRepository conversacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArchivoService archivoService;
    private final SimpMessagingTemplate messagingTemplate;

    public MensajeService(MensajeRepository mensajeRepository,
                          ConversacionRepository conversacionRepository,
                          UsuarioRepository usuarioRepository,
                          ArchivoService archivoService,
                          SimpMessagingTemplate messagingTemplate) {
        this.mensajeRepository = mensajeRepository;
        this.conversacionRepository = conversacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.archivoService = archivoService;
        this.messagingTemplate = messagingTemplate;
    }

    // Actualiza la primera línea del método para recibir "idMensajeRespondido"
    public Mensaje enviarMensaje(Long idConversacion, Long idRemitente, String contenido, MultipartFile imagen, Long idMensajeRespondido) {

        Conversacion conversacion = conversacionRepository.findById(idConversacion).orElseThrow();
        Usuario remitente = usuarioRepository.findById(idRemitente).orElseThrow();

        conversacion.setUltimaActividad(LocalDateTime.now());
        conversacionRepository.save(conversacion);

        Mensaje mensaje = new Mensaje();
        mensaje.setConversacion(conversacion);
        mensaje.setRemitente(remitente);
        mensaje.setContenido(contenido);
        mensaje.setEstado("enviado");

        // --- NUEVO: Si viene un ID de respuesta, lo buscamos y lo vinculamos ---
        if (idMensajeRespondido != null) {
            Mensaje msjRespondido = mensajeRepository.findById(idMensajeRespondido).orElse(null);
            mensaje.setMensajeRespondido(msjRespondido);
        }

        if (imagen != null && !imagen.isEmpty()) {
            String urlImagen = archivoService.guardarImagen(imagen);
            mensaje.setUrlImagen(urlImagen);
        }

        Mensaje mensajeGuardado = mensajeRepository.save(mensaje);

        messagingTemplate.convertAndSend("/topic/conversacion/" + idConversacion, mensajeGuardado);
        messagingTemplate.convertAndSend("/topic/usuario/" + conversacion.getUsuario1().getIdUsuario(), mensajeGuardado);
        messagingTemplate.convertAndSend("/topic/usuario/" + conversacion.getUsuario2().getIdUsuario(), mensajeGuardado);

        return mensajeGuardado;
    }

    // --- MODIFICADO: Ahora requiere el idUsuario para saber desde qué fecha enviarle los mensajes ---
    public List<Mensaje> obtenerHistorial(Long idConversacion, Long idUsuario) {
        Conversacion conversacion = conversacionRepository.findById(idConversacion)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        List<Mensaje> historialCompleto = mensajeRepository.findByConversacionOrderByFechaEnvioAsc(conversacion);

        // Identificamos cuándo fue la última vez que este usuario borró el chat
        LocalDateTime fechaOculta = conversacion.getUsuario1().getIdUsuario().equals(idUsuario)
                ? conversacion.getFechaOcultaUsuario1()
                : conversacion.getFechaOcultaUsuario2();

        // Si alguna vez lo borró, filtramos y enviamos solo los mensajes nuevos
        if (fechaOculta != null) {
            return historialCompleto.stream()
                    .filter(m -> m.getFechaEnvio() != null && m.getFechaEnvio().isAfter(fechaOculta))
                    .collect(Collectors.toList());
        }

        return historialCompleto;
    }

    public long contarNoLeidos(Long idConversacion, Long idUsuario) {
        return mensajeRepository.contarMensajesNoLeidos(idConversacion, idUsuario);
    }

    public void marcarComoLeidos(Long idConversacion, Long idLector) {
        mensajeRepository.marcarMensajesComoLeidos(idConversacion, idLector);
        messagingTemplate.convertAndSend("/topic/conversacion/" + idConversacion + "/leido", idLector);
    }

    public Mensaje editarMensaje(Long idMensaje, String nuevoContenido) {
        Mensaje mensaje = mensajeRepository.findById(idMensaje)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));

        mensaje.setContenido(nuevoContenido);
        Mensaje mensajeActualizado = mensajeRepository.save(mensaje);

        messagingTemplate.convertAndSend("/topic/conversacion/" + mensaje.getConversacion().getIdConversacion(), mensajeActualizado);

        return mensajeActualizado;
    }
}