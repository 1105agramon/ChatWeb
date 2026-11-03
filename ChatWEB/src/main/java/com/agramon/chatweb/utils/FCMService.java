package com.agramon.chatweb.utils;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.InputStream;

@Service
public class FCMService {

    // Intento 1: Al arrancar el servidor
    @PostConstruct
    public void inicializarAlArrancar() {
        conectarFirebase();
    }

    // Método centralizado para conectar
    private void conectarFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // ClassPathResource es el estándar de Spring Boot para leer la carpeta resources
                InputStream serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ FIREBASE LISTO Y CONECTADO ✅");
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR FATAL DE FIREBASE AL CONECTAR: " + e.getMessage());
        }
    }

    // NUEVO: Se agregó 'Long idConversacion' como parámetro
    public void enviarNotificacionPush(String tokenDestino, String titulo, String cuerpo, Long idConversacion) {
        if (tokenDestino == null || tokenDestino.isEmpty()) {
            return; // Si no tiene token (ej. usuario web), simplemente no hacemos nada
        }

        // Intento 2: LÓGICA INFALIBLE. Si por alguna razón no arrancó al inicio, lo forzamos a arrancar justo ahora.
        if (FirebaseApp.getApps().isEmpty()) {
            System.out.println("⚠️ Firebase no estaba iniciado. Forzando conexión en este momento...");
            conectarFirebase();
        }

        // Si después de forzarlo sigue vacío, nos rendimos y avisamos para no romper el chat
        if (FirebaseApp.getApps().isEmpty()) {
            System.out.println("❌ Definitivamente no se pudo conectar a Firebase. Revisa que el archivo exista.");
            return;
        }

        try {
            Message mensaje = Message.builder()
                    .setToken(tokenDestino)
                    .putData("idConversacion", String.valueOf(idConversacion)) // <-- NUEVO: DATO EXTRA INVISIBLE PARA ANDROID
                    .setNotification(Notification.builder()
                            .setTitle(titulo)
                            .setBody(cuerpo)
                            .build())
                    .build();

            FirebaseMessaging.getInstance().send(mensaje);
            System.out.println("📲 Notificación enviada a Firebase con éxito.");

        } catch (Exception e) {
            System.out.println("Error al disparar notificación push: " + e.getMessage());
        }
    }
}