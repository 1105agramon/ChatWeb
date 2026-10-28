package com.agramon.chatweb.Entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "conversaciones", uniqueConstraints = {
        @UniqueConstraint(name = "uk_usuarios_chat", columnNames = {"id_usuario_1", "id_usuario_2"})
})
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversacion")
    private Long idConversacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_1", nullable = false)
    private Usuario usuario1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_2", nullable = false)
    private Usuario usuario2;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    // --- NUEVO: Para saber cuándo revivir el chat ---
    @Column(name = "ultima_actividad")
    private LocalDateTime ultimaActividad;

    @Column(name = "fecha_oculta_usuario1")
    private LocalDateTime fechaOcultaUsuario1;

    @Column(name = "fecha_oculta_usuario2")
    private LocalDateTime fechaOcultaUsuario2;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        ultimaActividad = LocalDateTime.now(); // Al crear el chat, la última actividad es AHORA
    }
}