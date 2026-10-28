package com.agramon.chatweb.Servicios;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;

@Service
public class ArchivoService {

    private final Path directorioRaiz = Paths.get("carpeta_imagenes");

    public synchronized String guardarImagen(MultipartFile archivo) {
        try {
            // 1. Crear el directorio si no existe
            if (!Files.exists(directorioRaiz)) {
                Files.createDirectories(directorioRaiz);
            }

            // 2. Extraer la extensión
            String nombreOriginal = archivo.getOriginalFilename();
            String extension = nombreOriginal != null && nombreOriginal.contains(".")
                    ? nombreOriginal.substring(nombreOriginal.lastIndexOf("."))
                    : ".jpg";

            long maxNumero = 0;

            // 3. Buscar el archivo con el número mayor
            try (Stream<Path> archivosEnCarpeta = Files.list(directorioRaiz)) {
                maxNumero = archivosEnCarpeta
                        .map(path -> path.getFileName().toString())
                        // Filtrar archivos que tengan extensión
                        .filter(nombre -> nombre.contains("."))
                        // Extraer el texto antes de la extensión (ej: "15" de "15.jpg")
                        .map(nombre -> nombre.substring(0, nombre.lastIndexOf('.')))
                        // Asegurar que el nombre contenga únicamente dígitos numéricos
                        .filter(nombreSinExtension -> nombreSinExtension.matches("\\d+"))
                        // Convertir a tipo numérico Long
                        .mapToLong(Long::parseLong)
                        // Obtener el valor máximo encontrado
                        .max()
                        .orElse(0L); // Si no hay archivos válidos, inicia en 0
            }

            // 4. Generar el nuevo nombre incremental
            long siguienteNumero = maxNumero + 1;
            String nuevoNombre = siguienteNumero + extension;

            // 5. Construir la ruta y copiar el archivo
            Path rutaDestino = directorioRaiz.resolve(nuevoNombre);
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            // 6. Retornar la ruta para la base de datos
            return "/imagenes/" + nuevoNombre;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar la imagen incremental", e);
        }
    }
}