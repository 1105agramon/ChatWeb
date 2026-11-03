-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         13.0.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.20.0.7320
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para chatweb
CREATE DATABASE IF NOT EXISTS `chatweb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `chatweb`;

-- Volcando estructura para tabla chatweb.conversaciones
CREATE TABLE IF NOT EXISTS `conversaciones` (
  `id_conversacion` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_usuario_1` bigint(20) NOT NULL,
  `id_usuario_2` bigint(20) NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `fecha_oculta_usuario1` datetime DEFAULT NULL,
  `fecha_oculta_usuario2` datetime DEFAULT NULL,
  `ultima_actividad` datetime DEFAULT NULL,
  PRIMARY KEY (`id_conversacion`),
  UNIQUE KEY `uk_usuarios_chat` (`id_usuario_1`,`id_usuario_2`),
  KEY `FKouxc8jndr6d3f84yqxjnymf2m` (`id_usuario_2`),
  CONSTRAINT `FKn6h2sdv8s2whcnp6lgc2arvk8` FOREIGN KEY (`id_usuario_1`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `FKouxc8jndr6d3f84yqxjnymf2m` FOREIGN KEY (`id_usuario_2`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`id_usuario_1`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`id_usuario_2`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla chatweb.conversaciones: ~3 rows (aproximadamente)
INSERT INTO `conversaciones` (`id_conversacion`, `id_usuario_1`, `id_usuario_2`, `creado_en`, `fecha_oculta_usuario1`, `fecha_oculta_usuario2`, `ultima_actividad`) VALUES
	(10, 1, 3, '2026-11-02 20:41:14', NULL, NULL, '2026-11-02 22:55:59'),
	(11, 2, 3, '2026-11-02 20:55:36', NULL, NULL, '2026-11-02 20:55:36'),
	(12, 1, 9, '2026-11-02 22:17:04', NULL, NULL, '2026-11-02 22:17:43');

-- Volcando estructura para tabla chatweb.mensajes
CREATE TABLE IF NOT EXISTS `mensajes` (
  `fecha_envio` datetime(6) DEFAULT NULL,
  `id_conversacion` bigint(20) NOT NULL,
  `id_mensaje` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_remitente` bigint(20) NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `contenido` text DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `id_mensaje_respondido` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id_mensaje`),
  KEY `FK70ylh4dtvnhiprrcpev790ome` (`id_conversacion`),
  KEY `FK91f20kcib8cge6x0exr74jkph` (`id_remitente`),
  CONSTRAINT `FK70ylh4dtvnhiprrcpev790ome` FOREIGN KEY (`id_conversacion`) REFERENCES `conversaciones` (`id_conversacion`),
  CONSTRAINT `FK91f20kcib8cge6x0exr74jkph` FOREIGN KEY (`id_remitente`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla chatweb.mensajes: ~25 rows (aproximadamente)
INSERT INTO `mensajes` (`fecha_envio`, `id_conversacion`, `id_mensaje`, `id_remitente`, `estado`, `contenido`, `url_imagen`, `id_mensaje_respondido`) VALUES
	('2026-11-02 20:41:21.170928', 10, 1, 1, 'leido', 'Hola ', NULL, NULL),
	('2026-11-02 20:42:11.206400', 10, 2, 1, 'leido', NULL, '/imagenes/26.jpg', NULL),
	('2026-11-02 20:42:22.688772', 10, 3, 1, 'leido', 'Te gusta la imagen? ', NULL, NULL),
	('2026-11-02 20:42:40.623508', 10, 4, 1, 'leido', 'Ta chido no? Jajaja ', NULL, 2),
	('2026-11-02 20:57:26.769436', 10, 5, 3, 'leido', 'esta coqueto pa', NULL, 2),
	('2026-11-02 20:58:22.023913', 10, 6, 1, 'leido', 'Simon ', NULL, NULL),
	('2026-11-02 21:10:55.998057', 10, 7, 1, 'leido', 'hola papú', NULL, NULL),
	('2026-11-02 21:11:16.848659', 10, 8, 3, 'leido', 'hola', NULL, NULL),
	('2026-11-02 21:11:36.781514', 10, 9, 1, 'leido', 'todo bien', NULL, NULL),
	('2026-11-02 21:11:46.135963', 10, 10, 3, 'leido', 'si', NULL, NULL),
	('2026-11-02 21:12:22.627051', 10, 11, 1, 'leido', 'todo bien bro', NULL, 8),
	('2026-11-02 21:22:05.590998', 10, 12, 1, 'leido', 'hola papú', NULL, NULL),
	('2026-11-02 21:22:08.693473', 10, 13, 1, 'leido', 'mejor', NULL, NULL),
	('2026-11-02 22:15:10.401092', 10, 14, 1, 'leido', 'hola', NULL, NULL),
	('2026-11-02 22:17:08.864211', 12, 15, 9, 'leido', 'hola', NULL, NULL),
	('2026-11-02 22:17:43.785424', 12, 16, 1, 'enviado', 'cómo estás?', NULL, NULL),
	('2026-11-02 22:34:56.402532', 10, 17, 1, 'leido', 'prueba 1', NULL, NULL),
	('2026-11-02 22:35:10.138339', 10, 18, 3, 'leido', 'exito', NULL, NULL),
	('2026-11-02 22:36:08.586279', 10, 19, 3, 'leido', NULL, '/imagenes/27.png', NULL),
	('2026-11-02 22:36:19.073430', 10, 20, 3, 'leido', 'otro', NULL, NULL),
	('2026-11-02 22:37:13.440848', 10, 21, 1, 'leido', '', '/imagenes/28.jpg', NULL),
	('2026-11-02 22:37:29.608910', 10, 22, 1, 'leido', '', '/imagenes/29.jpg', NULL),
	('2026-11-02 22:55:07.445159', 10, 23, 1, 'leido', 'excelente', NULL, 11),
	('2026-11-02 22:55:42.693934', 10, 24, 3, 'enviado', '1234567890', NULL, NULL),
	('2026-11-02 22:55:59.148505', 10, 25, 3, 'enviado', 'egzsh', NULL, NULL);

-- Volcando estructura para tabla chatweb.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` bigint(20) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) NOT NULL,
  `alias` varchar(100) DEFAULT NULL,
  `en_linea` tinyint(1) DEFAULT 0,
  `ultima_conexion` datetime DEFAULT current_timestamp(),
  `creado_en` datetime DEFAULT current_timestamp(),
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `pregunta_seguridad` varchar(255) DEFAULT NULL,
  `respuesta_seguridad` varchar(255) DEFAULT NULL,
  `pin_recuperacion` varchar(255) DEFAULT NULL,
  `token_fcm` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `telefono` (`telefono`),
  UNIQUE KEY `UK7a6nioycwi246dw0dn2etj3ye` (`telefono`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla chatweb.usuarios: ~9 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `telefono`, `alias`, `en_linea`, `ultima_conexion`, `creado_en`, `password`, `activo`, `pregunta_seguridad`, `respuesta_seguridad`, `pin_recuperacion`, `token_fcm`) VALUES
	(1, '5619067751', 'Juan Granados', 0, '2026-11-02 22:16:04', '2026-09-27 23:32:41', '$2a$10$VbayIrxcrCKnO0dtAXS63ufI6kTMl0g0LOqHZr2033eLevFzNTqSO', 1, '¿COLOR FAVORITO?', '$2a$10$L/T8SRtQ3zByxngshTsPo.Oriwy67ZzeTJIBaHzabVax2ROceqlaS', '$2a$10$h2341EuIVtNlYYfhG/QvGOvbrSBLn9cCo1I55HvWa7dQQnJsMOItC', 'fDfKWJ_JQeGs7LCG_iQCiV:APA91bHPJWYUURDnL5C0gRRUJSw_D0vS2vmu8qES-p6l8Do6yhDXGEIq4Jd13rXGu1Refblxdp6SlwI35jqyN1wfvtI2IOGSFaHKx_c8nya1f3AjlN0uTV8'),
	(2, '5518290204', 'Nelly Matus', 0, '2026-09-27 23:46:10', '2026-09-27 23:46:10', '$2a$10$Ob7QPk.pRvbV9hhzYsRuzujhBC9G09KkNKHIgv9lQ8qjdt7g85h8m', 1, '¿CUMPLEAÑOS?', '$2a$10$hzj5lPw9Id/ayaOLSwO15uQCrB44FhDzAnTBWP1ix9ZhJLXiI5x2a', '$2a$10$rEYJcF0x1flXhoukHlcl9eKeknZvKU1/eFYaCf55Ea15KaBvSNmK.', NULL),
	(3, '1234567890', 'Pedro Hernandez', 0, '2026-11-02 21:44:45', '2026-09-29 10:26:11', '$2a$10$jIQMFKuOiuZTEBmq/jS./e3ezioJKKB1CDuBMxIo69a/XmLg5eXWq', 1, '¿COLOR?', '$2a$10$RUXwIegBDhEHX9CotAPV9O7sGXRZinXCxPZWKjlpWSCNgWzwPmipW', '$2a$10$T4c3SSOoIjcvCHp3HeeWYObExB7DkowuARXwxcUa5qLaxyoi41SAi', 'cejc2u6pR7ylKjd2kIf_GA:APA91bH79IOBOzOgOZqZlYwv9n8nJ-KhJe9Sfjo1-3yM2BHlXwXVh009308-t3hYAo8ZPjyUFlWq_ByZnZptQEWyrOuVUbVkfkxKiWqwBrORaC3xQRSJJJM'),
	(4, '5540386925', 'María Cavi', 0, '2026-10-02 09:29:43', '2026-10-02 09:29:43', '$2a$10$8bOcCom4Qq4LT5r9JvLx7OlEFlNxRSKIalj1TsQ9ufqoSyiiWy0QC', 1, '¿COLOR FAVORITO?', '$2a$10$s1HHzCNBit8Q4pMEWEFIq.OVQ1vcdV2DxVpJU87ca2dGrYXNKn/Bi', '$2a$10$yq/2B53pkaB4ZZGprE3wUOMJ44cj8BXt0pnEKJxWmr5oI2f2fB0Ru', NULL),
	(5, '5537870237', 'Erika', 0, '2026-10-02 09:41:24', '2026-10-02 09:41:24', '$2a$10$6dDBxgITtSd329ts73WCfu6uzUV53tjT3gggP6rv6AdemtvL3CCka', 1, '¿AMOR DE TU VIDA?', '$2a$10$Bftf/Jawacf5XQYtCb0js.h6tIYmiBm/uFe5lFJCybO7mG4pYLjRm', '$2a$10$pbM3lUhm6Jpo.GZP/f4a9.jai4lVzYgds1KABxrTY/1bfxm3KsUWq', NULL),
	(6, '5512029865', 'Erick Albarrán', 0, '2026-10-02 10:42:14', '2026-10-02 10:42:14', '$2a$10$Lb9xMTIENPTLvj1IJ6uXae7KidHlabt5KGrGx34P24ux4SH4XbRqi', 1, '¿COMIDA FAVORITA?', '$2a$10$29no7ZdP2DmLER3Z4o5okOIIN8QPCa0V3wY2P.BQ47eQSte8FO65u', '$2a$10$o3jOg.e6a0O8P2gAUMTmfu8NXQB5rbwVjNkS1UDGU0qPB7PIAe782', NULL),
	(7, '5579246182', 'KIMCHDEAL', 0, '2026-10-13 14:29:31', '2026-10-13 14:29:31', '$2a$10$QEgLBOr4VBtcgdmphJRPWujnUXww7p8AZDElLqxoMo7Yo4tQuYFPy', 1, '¿CUÁL ES MI NICKNAME?', '$2a$10$YRCm4RwoMhqDBkIISTYHe.DD1PJK3JsHGKp.FP0YUFbt2LdRzJz9e', '$2a$10$1cdVKvw8G1R9v/7f/7zbmuls7S0gEsujr4NRdVfQSuA4xhES9XNwK', NULL),
	(8, '5539384854', 'Pame Peniche', 0, '2026-10-13 14:30:02', '2026-10-13 14:30:02', '$2a$10$nLKZH9CSFq7AgJqFJGZrNu0tqn4A1Sukf8IHfsihPUEDiNfOoPDAK', 1, '¿PERFUME FAVORITO?', '$2a$10$Ooj1vyMYGEk8LakgmruV8.m.llA0.F7FqgwLtDmw.xoJGZgDRbR0q', '$2a$10$tECzVwpR9m1eJOaZep8dmudr0ivv9uss3IaDQHdM6oG9Bl1pRnNoi', NULL),
	(9, '0987654321', 'Yuri', 0, '2026-11-02 22:16:50', '2026-11-02 22:16:50', '$2a$10$wld5RfD8c.SDhABFB2rzmO4D2iStcHSikKdoHK5.6/SPHQdtwCzoO', 1, '¿COLOR FAVORITO?', '$2a$10$HzUBYNe.g8.6LIw9J.5V9OYqxaJCzHYpHDmv4mjtPVVMvLYElDBKy', '$2a$10$usDIyS3Y/1VaZ5ales2kEu3uHVrMVhZMl/O.4.0bBGd2SP93ck2k.', 'fDfKWJ_JQeGs7LCG_iQCiV:APA91bHPJWYUURDnL5C0gRRUJSw_D0vS2vmu8qES-p6l8Do6yhDXGEIq4Jd13rXGu1Refblxdp6SlwI35jqyN1wfvtI2IOGSFaHKx_c8nya1f3AjlN0uTV8');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
