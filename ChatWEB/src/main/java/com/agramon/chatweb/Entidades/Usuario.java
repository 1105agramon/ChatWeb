package com.agramon.chatweb.Entidades;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false)
    private String password;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(unique = true, nullable = false, length = 20)
    private String telefono;

    @Column(length = 100)
    private String alias;

    @Column(name = "en_linea")
    private Boolean enLinea = false;

    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    // --- NUEVOS CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA ---

    @Column(name = "pregunta_seguridad")
    private String preguntaSeguridad;

    @Column(name = "respuesta_seguridad")
    private String respuestaSeguridad;

    @Column(name = "pin_recuperacion")
    private String pinRecuperacion;

    // Se ejecuta automáticamente antes de insertar en la BD
    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
        if (ultimaConexion == null) {
            ultimaConexion = LocalDateTime.now();
        }
    }
}