package com.agramon.chatweb.Entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "mensajes")
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje")
    private Long idMensaje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conversacion", nullable = false)
    private Conversacion conversacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_remitente", nullable = false)
    private Usuario remitente;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "url_imagen")
    private String urlImagen;

    @Column(length = 20)
    private String estado = "enviado";

    @Column(name = "fecha_envio", updatable = false)
    private LocalDateTime fechaEnvio;

    @PrePersist
    protected void onCreate() {
        fechaEnvio = LocalDateTime.now();
    }

    // --- NUEVO: Para saber si este mensaje responde a otro ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_mensaje_respondido", nullable = true)
    private Mensaje mensajeRespondido;

    // TODO: Generar Getters y Setters en IntelliJ (Alt + Insert -> Getter and Setter)
}