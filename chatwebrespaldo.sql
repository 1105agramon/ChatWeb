/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.8-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: chatweb
-- ------------------------------------------------------
-- Server version	11.8.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `conversaciones`
--

DROP TABLE IF EXISTS `conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversaciones` (
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `conversaciones` WRITE;
/*!40000 ALTER TABLE `conversaciones` DISABLE KEYS */;
INSERT INTO `conversaciones` VALUES
(1,1,2,'2026-09-27 23:47:42',NULL,NULL,'2026-09-29 10:35:49'),
(2,1,3,'2026-09-29 10:26:23','2026-09-29 10:36:13',NULL,'2026-09-29 10:26:54'),
(3,1,4,'2026-10-02 09:31:36',NULL,NULL,'2026-10-02 19:49:38'),
(4,1,5,'2026-10-02 09:47:14',NULL,NULL,'2026-10-02 09:47:14'),
(5,7,8,'2026-10-13 14:31:07',NULL,NULL,'2026-10-13 14:31:36'),
(6,1,8,'2026-10-13 14:33:34',NULL,NULL,'2026-10-13 20:37:21'),
(7,1,7,'2026-10-13 14:33:36',NULL,NULL,'2026-10-13 15:18:37');
/*!40000 ALTER TABLE `conversaciones` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
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
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
INSERT INTO `mensajes` VALUES
('2026-09-27 23:49:57.230827',1,1,1,'leido','Holi xd ',NULL,NULL),
('2026-09-27 23:51:37.790841',1,2,2,'leido','Jaja holis ',NULL,NULL),
('2026-09-27 23:51:55.795522',1,3,1,'leido','se puede mandar imagenes xd ',NULL,NULL),
('2026-09-27 23:52:47.172346',1,4,1,'leido','tmensaje modificado ',NULL,NULL),
('2026-09-27 23:53:06.492407',1,5,2,'leido','A ver jaja xd',NULL,NULL),
('2026-09-27 23:53:39.217041',1,6,2,'leido','Andaas jaja si está padre eh',NULL,NULL),
('2026-09-27 23:53:53.089584',1,7,1,'leido','chi xd ',NULL,NULL),
('2026-09-27 23:54:09.190119',1,8,1,'leido','intenta cambiar tu nombre, o datos de seguridad  ',NULL,NULL),
('2026-09-27 23:55:02.865077',1,9,1,'leido',NULL,'/imagenes/10.jpg',NULL),
('2026-09-27 23:55:15.455337',1,10,1,'leido','xD ',NULL,NULL),
('2026-09-27 23:55:20.534795',1,11,2,'leido',NULL,'/imagenes/11.jpg',NULL),
('2026-09-27 23:56:05.366913',1,12,2,'leido','Jajajajajaja borra esoooo!!!',NULL,NULL),
('2026-09-27 23:56:14.624584',1,13,1,'leido','😂nadie lo ve jajaja ',NULL,NULL),
('2026-09-27 23:56:28.779220',1,14,2,'leido','Yo siii, y me veo horrible!!',NULL,NULL),
('2026-09-27 23:56:41.641808',1,15,1,'leido','Creo que solo falta un sonido de notificaciones xd ',NULL,NULL),
('2026-09-27 23:56:43.314005',1,16,2,'leido','Como siempre haciendo caras jajajaja xD',NULL,NULL),
('2026-09-27 23:56:52.296530',1,17,1,'leido','Jajaja bien guapa xd',NULL,NULL),
('2026-09-27 23:57:07.303347',1,18,2,'leido','Sip, eso le faltaría para que avise nomás ',NULL,NULL),
('2026-09-27 23:57:26.865799',1,19,1,'leido','Pero si notifica ',NULL,NULL),
('2026-09-27 23:57:38.716384',1,20,1,'leido','Si existe otro chat y estás en otro , te avisa ',NULL,NULL),
('2026-09-27 23:57:50.634176',1,21,1,'leido','O si estás en otra pestaña del navegador también ',NULL,NULL),
('2026-09-27 23:57:57.881974',1,22,1,'leido','Obvio, en el escritorio ',NULL,NULL),
('2026-09-27 23:58:00.009670',1,23,1,'leido','Xd ',NULL,NULL),
('2026-09-27 23:58:44.468474',1,24,2,'leido','Jajaja no pues estoy desde mi cel xd',NULL,NULL),
('2026-09-27 23:59:13.969417',1,25,1,'leido','ya será despues jajaj  xd ',NULL,NULL),
('2026-09-27 23:59:36.099933',1,26,1,'leido','pero bueno, explora lo demas :3 y me dices',NULL,NULL),
('2026-09-27 23:59:43.001335',1,27,2,'leido','En los del trabajo pueden responder a los mensajes anteriores?',NULL,NULL),
('2026-09-28 00:00:26.652667',1,28,2,'leido','Ya no me acuerdo, pero si estaría bueno que pudieras implementarlo eso',NULL,NULL),
('2026-09-28 00:00:52.242766',1,29,1,'leido','no, lo borran y ya no tenemos visión después en el chat que hicieron en el trabajo',NULL,NULL),
('2026-09-28 00:01:09.478760',1,30,1,'leido','se crea la conversación y se elimina cuando el supervisor cierra el chat',NULL,NULL),
('2026-09-28 00:01:19.644213',1,31,1,'leido','y ya no podemos ver más ',NULL,NULL),
('2026-09-28 00:02:34.008212',1,32,2,'leido','No pero me refiero a los de la misma conversación que llevas en un chat',NULL,NULL),
('2026-09-28 00:03:11.008738',1,33,1,'leido','no te entiendo ._. ',NULL,NULL),
('2026-09-28 00:03:30.770508',1,34,1,'leido','como referencia de uno ?  ',NULL,NULL),
('2026-09-28 00:03:50.531249',1,35,1,'leido','osea respondes este mensaje?  ',NULL,NULL),
('2026-09-28 00:03:54.989709',1,36,2,'leido','Como por ejemplo ahorita con lo de la foto (que tienes que borrar por favor xd) que yo pueda responder a ese mensaje ',NULL,NULL),
('2026-09-28 00:04:01.569635',1,37,1,'leido','como whats ',NULL,NULL),
('2026-09-28 00:04:05.705367',1,38,2,'leido','Sip',NULL,NULL),
('2026-09-28 00:04:11.470523',1,39,1,'leido','aaah, no , aun no lo implemento jajajaja  ',NULL,NULL),
('2026-09-28 00:04:58.240817',1,40,2,'leido','Jaja deb',NULL,NULL),
('2026-09-28 00:05:14.170478',1,41,2,'leido','Jajaja perdón se me fue a medio mensaje ',NULL,NULL),
('2026-09-28 00:05:46.524495',1,42,2,'leido','Pero estaría bueno que pudiera hacer eso',NULL,NULL),
('2026-09-28 00:05:50.315447',1,43,1,'leido','jajajaja no hay falla, hay muchas cosas por hacer pero bueno, lo importante es la comunicación.  ',NULL,NULL),
('2026-09-28 00:06:29.841005',1,44,2,'leido','Jaja eso si, jala chido xd ',NULL,NULL),
('2026-09-28 00:06:53.070502',1,45,1,'leido','ya checaste lo demás?  xd ',NULL,NULL),
('2026-09-28 00:07:04.425632',1,46,1,'leido','tu puchale xd ',NULL,NULL),
('2026-09-28 00:07:08.498497',1,47,2,'leido','Ya después puedes irle implementando otras cosas',NULL,NULL),
('2026-09-28 00:07:24.714217',1,48,2,'leido','Jajajaja va pues',NULL,NULL),
('2026-09-28 00:07:45.286529',1,49,1,'leido','xd chi',NULL,NULL),
('2026-09-28 00:07:50.818072',1,50,2,'leido','Pero y si le muevo a algo que no sé? Jajaja',NULL,NULL),
('2026-09-28 00:08:05.612195',1,51,1,'leido','debe de ser muy visual ',NULL,NULL),
('2026-09-28 00:08:08.501612',1,52,1,'leido','tu picale ',NULL,NULL),
('2026-09-28 00:10:02.906209',1,53,2,'leido','Siento que me sería más fácil desde la compu que desde el cel xd',NULL,NULL),
('2026-09-28 00:10:22.200194',1,54,1,'leido','hay fallas?  ',NULL,NULL),
('2026-09-28 00:10:51.487418',1,55,2,'leido','Nop, nomas mi cerebro que no se lleva con la tecnología jajaja',NULL,NULL),
('2026-09-28 00:11:09.748045',1,56,1,'leido','no se visualiza chido como celular?  ',NULL,NULL),
('2026-09-28 00:11:44.841010',1,57,1,'leido','segun lo hice muy intuitivo para que no se equivocaran  ',NULL,NULL),
('2026-09-28 00:12:10.294275',1,58,2,'leido','Sip, se visualiza todo bien tranquilo ',NULL,NULL),
('2026-09-28 00:12:26.997610',1,59,2,'leido','Aqui la que batalla con el celular soy yo xd',NULL,NULL),
('2026-09-28 00:12:43.191890',1,60,2,'leido','Creo que ya está dando las últimas mi cel jajaja xd',NULL,NULL),
('2026-09-28 00:12:43.747577',1,61,1,'leido','a xd  ',NULL,NULL),
('2026-09-28 00:13:00.852217',1,62,1,'leido','bueno',NULL,NULL),
('2026-09-28 00:13:13.285599',1,63,1,'leido','ya despues lo checas xd jajajaja ',NULL,NULL),
('2026-09-28 00:13:22.344381',1,64,2,'leido','Pero todo bien, me agrada',NULL,NULL),
('2026-09-28 00:13:34.676344',1,65,1,'leido','va',NULL,NULL),
('2026-09-28 00:13:55.256457',1,66,2,'leido','Sip, ya mañana me gustaria intentarlo desde mi lap xd',NULL,NULL),
('2026-09-28 00:14:05.028760',1,67,1,'leido','va',NULL,NULL),
('2026-09-28 00:14:13.163009',1,68,1,'leido','me avisas para prender el servidor  ',NULL,NULL),
('2026-09-28 00:14:28.030688',1,69,2,'leido','Sale y vale, ya me voy a salir ',NULL,NULL),
('2026-09-28 00:14:33.969097',1,70,1,'leido','sip',NULL,NULL),
('2026-09-28 00:15:02.819184',1,71,2,'leido','Va xd',NULL,NULL),
('2026-09-28 00:15:21.724427',1,72,1,'leido','de todas formas, cualquier chat pendiente te notificará cuando entres jajaja  ',NULL,NULL),
('2026-09-29 00:29:07.237557',1,73,1,'leido','ya quedo este pedo jajaja',NULL,66),
('2026-09-29 00:39:55.661348',1,74,1,'leido','no',NULL,70),
('2026-09-29 00:42:25.426204',1,75,1,'leido','Ya quedó chido ',NULL,71),
('2026-09-29 10:26:44.897476',2,76,3,'leido','hola',NULL,NULL),
('2026-09-29 10:26:54.046725',2,77,1,'leido','hola',NULL,NULL),
('2026-09-29 10:30:07.385405',1,78,2,'leido','Jajaja andasss',NULL,NULL),
('2026-09-29 10:30:13.501170',1,79,2,'leido','Ahora si ya esta mejor',NULL,NULL),
('2026-09-29 10:30:19.421722',1,80,1,'leido','si xd ',NULL,NULL),
('2026-09-29 10:30:33.439425',1,81,1,'leido','creo que por ahora se quedará asi xd ',NULL,NULL),
('2026-09-29 10:30:37.793978',1,82,1,'leido','tu que dices?  ',NULL,NULL),
('2026-09-29 10:31:05.901049',1,83,2,'leido','Muy funcional, me agrada ',NULL,82),
('2026-09-29 10:31:17.647014',1,84,1,'leido','excelente xd ',NULL,NULL),
('2026-09-29 10:31:23.601533',1,85,2,'leido','Es muy sencillo de entender y de utilizar xd',NULL,NULL),
('2026-09-29 10:31:37.343901',1,86,1,'leido','muchas gracias por tu opinión jajaja  xd ',NULL,NULL),
('2026-09-29 10:31:48.250481',1,87,2,'leido','Sirve para gente tonta como yo jajaja',NULL,NULL),
('2026-09-29 10:31:59.426188',1,88,1,'leido','ora!',NULL,NULL),
('2026-09-29 10:32:11.971097',1,89,1,'leido','porque te insultas? ',NULL,NULL),
('2026-09-29 10:32:18.485391',1,90,2,'leido','Jaja xD',NULL,88),
('2026-09-29 10:32:58.229664',1,91,2,'leido','Ay porque a veces si soy muy torpe xd jajaja',NULL,89),
('2026-09-29 10:33:26.623183',1,92,1,'leido','pero no es correcto que te insultes xd  ',NULL,NULL),
('2026-09-29 10:34:21.307869',1,93,2,'leido','Si, a ver si así ya entiendo 🥲 jajaja',NULL,NULL),
('2026-09-29 10:34:52.863465',1,94,2,'leido','Hoy ya me metí en un problema por mi torpeza xd',NULL,NULL),
('2026-09-29 10:35:03.120603',1,95,1,'leido','por?  ',NULL,NULL),
('2026-09-29 10:35:33.593590',1,96,2,'leido','Pero bueno, ya me voy a chambear, te cuento en un rato jaja',NULL,NULL),
('2026-09-29 10:35:49.837040',1,97,1,'enviado','va',NULL,NULL),
('2026-10-02 09:31:56.588511',3,98,4,'leido','Holi ✌🏻',NULL,NULL),
('2026-10-02 09:32:02.205932',3,99,1,'leido','Holiii',NULL,NULL),
('2026-10-02 11:24:33.622708',3,100,1,'leido','Si te toca a lado de Liz , me la saludas xd jajajaa ✨❤️',NULL,NULL),
('2026-10-02 14:52:59.385397',3,101,4,'leido','Ya háblale ',NULL,NULL),
('2026-10-02 14:53:22.393503',3,102,4,'leido','Si te hace caso 😖',NULL,NULL),
('2026-10-02 16:58:12.067748',3,103,1,'enviado','Si pero y que tal ni le gusto? ',NULL,NULL),
('2026-10-02 16:58:27.296037',3,104,1,'enviado','🥺',NULL,NULL),
('2026-10-02 16:58:48.086309',3,105,1,'enviado','A parte es muy hermosa, apuesto que hay más detrás de ella y mejor que yo :( ',NULL,NULL),
('2026-10-02 19:49:35.057890',3,106,1,'enviado','además de que sale con el chico de lentes, medio alto , que tiene siempre botas, el que estaba atras de Irel x(  ',NULL,NULL),
('2026-10-02 19:49:38.947577',3,107,1,'enviado','Es un perro jajaja ',NULL,NULL),
('2026-10-13 14:31:20.151440',5,108,7,'leido','eyyyy.',NULL,NULL),
('2026-10-13 14:31:36.731582',5,109,8,'leido','heeey!!',NULL,NULL),
('2026-10-13 14:33:40.813595',7,110,7,'leido','heeey',NULL,NULL),
('2026-10-13 14:33:42.215494',6,111,8,'leido','Pinche Juaaaan',NULL,NULL),
('2026-10-13 15:18:20.703086',6,112,1,'leido','Pinche pame xd ',NULL,NULL),
('2026-10-13 15:18:37.471263',7,113,1,'leido','holi xd ',NULL,NULL),
('2026-10-13 16:11:44.353049',6,114,1,'leido','tkm',NULL,NULL),
('2026-10-13 18:19:23.252839',6,115,1,'leido','.l. xd  ',NULL,NULL),
('2026-10-13 18:31:54.902971',6,116,8,'leido','tqmm',NULL,NULL),
('2026-10-13 18:55:26.491612',6,117,1,'leido','Me vale xd jajja ntc',NULL,116),
('2026-10-13 18:55:33.583643',6,118,1,'leido','te quiero más xd ',NULL,NULL),
('2026-10-13 18:58:50.682047',6,119,1,'leido',NULL,'/imagenes/12.jpg',NULL),
('2026-10-13 19:11:31.908826',6,120,8,'leido','jajaja',NULL,NULL),
('2026-10-13 20:09:11.449768',6,121,1,'leido','anda triste la chamaka ',NULL,NULL),
('2026-10-13 20:11:37.162482',6,122,8,'leido','Si se veee, qué te dicee?',NULL,NULL),
('2026-10-13 20:30:59.145190',6,123,1,'leido','que no está preparado para una relación.  ',NULL,NULL),
('2026-10-13 20:31:06.112361',6,124,1,'leido','ese fue su escusa de ivan ',NULL,NULL),
('2026-10-13 20:32:21.619651',6,125,8,'leido','no maaaa',NULL,NULL),
('2026-10-13 20:37:05.519067',6,126,1,'leido','si we',NULL,NULL),
('2026-10-13 20:37:21.381992',6,127,1,'leido','y la chica anda triste :(  ',NULL,NULL);
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
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
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `telefono` (`telefono`),
  UNIQUE KEY `UK7a6nioycwi246dw0dn2etj3ye` (`telefono`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(1,'5619067751','Juan Granados',0,'2026-09-27 23:32:41','2026-09-27 23:32:41','$2a$10$VbayIrxcrCKnO0dtAXS63ufI6kTMl0g0LOqHZr2033eLevFzNTqSO',1,'¿COLOR FAVORITO?','$2a$10$L/T8SRtQ3zByxngshTsPo.Oriwy67ZzeTJIBaHzabVax2ROceqlaS','$2a$10$h2341EuIVtNlYYfhG/QvGOvbrSBLn9cCo1I55HvWa7dQQnJsMOItC'),
(2,'5518290204','Nelly Matus',0,'2026-09-27 23:46:10','2026-09-27 23:46:10','$2a$10$Ob7QPk.pRvbV9hhzYsRuzujhBC9G09KkNKHIgv9lQ8qjdt7g85h8m',1,'¿CUMPLEAÑOS?','$2a$10$hzj5lPw9Id/ayaOLSwO15uQCrB44FhDzAnTBWP1ix9ZhJLXiI5x2a','$2a$10$rEYJcF0x1flXhoukHlcl9eKeknZvKU1/eFYaCf55Ea15KaBvSNmK.'),
(3,'1234567890','Pedro',0,'2026-09-29 10:26:11','2026-09-29 10:26:11','$2a$10$s8ZCBFTc3jRmSxYvLRODCeGz88xFKs7lsh7S1R.BemCBuZSdQ.GyC',1,'¿COLOR?','$2a$10$RUXwIegBDhEHX9CotAPV9O7sGXRZinXCxPZWKjlpWSCNgWzwPmipW','$2a$10$T4c3SSOoIjcvCHp3HeeWYObExB7DkowuARXwxcUa5qLaxyoi41SAi'),
(4,'5540386925','María Cavi',0,'2026-10-02 09:29:43','2026-10-02 09:29:43','$2a$10$8bOcCom4Qq4LT5r9JvLx7OlEFlNxRSKIalj1TsQ9ufqoSyiiWy0QC',1,'¿COLOR FAVORITO?','$2a$10$s1HHzCNBit8Q4pMEWEFIq.OVQ1vcdV2DxVpJU87ca2dGrYXNKn/Bi','$2a$10$yq/2B53pkaB4ZZGprE3wUOMJ44cj8BXt0pnEKJxWmr5oI2f2fB0Ru'),
(5,'5537870237','Erika',0,'2026-10-02 09:41:24','2026-10-02 09:41:24','$2a$10$6dDBxgITtSd329ts73WCfu6uzUV53tjT3gggP6rv6AdemtvL3CCka',1,'¿AMOR DE TU VIDA?','$2a$10$Bftf/Jawacf5XQYtCb0js.h6tIYmiBm/uFe5lFJCybO7mG4pYLjRm','$2a$10$pbM3lUhm6Jpo.GZP/f4a9.jai4lVzYgds1KABxrTY/1bfxm3KsUWq'),
(6,'5512029865','Erick Albarrán',0,'2026-10-02 10:42:14','2026-10-02 10:42:14','$2a$10$Lb9xMTIENPTLvj1IJ6uXae7KidHlabt5KGrGx34P24ux4SH4XbRqi',1,'¿COMIDA FAVORITA?','$2a$10$29no7ZdP2DmLER3Z4o5okOIIN8QPCa0V3wY2P.BQ47eQSte8FO65u','$2a$10$o3jOg.e6a0O8P2gAUMTmfu8NXQB5rbwVjNkS1UDGU0qPB7PIAe782'),
(7,'5579246182','KIMCHDEAL',0,'2026-10-13 14:29:31','2026-10-13 14:29:31','$2a$10$QEgLBOr4VBtcgdmphJRPWujnUXww7p8AZDElLqxoMo7Yo4tQuYFPy',1,'¿CUÁL ES MI NICKNAME?','$2a$10$YRCm4RwoMhqDBkIISTYHe.DD1PJK3JsHGKp.FP0YUFbt2LdRzJz9e','$2a$10$1cdVKvw8G1R9v/7f/7zbmuls7S0gEsujr4NRdVfQSuA4xhES9XNwK'),
(8,'5539384854','Pame Peniche',0,'2026-10-13 14:30:02','2026-10-13 14:30:02','$2a$10$nLKZH9CSFq7AgJqFJGZrNu0tqn4A1Sukf8IHfsihPUEDiNfOoPDAK',1,'¿PERFUME FAVORITO?','$2a$10$Ooj1vyMYGEk8LakgmruV8.m.llA0.F7FqgwLtDmw.xoJGZgDRbR0q','$2a$10$tECzVwpR9m1eJOaZep8dmudr0ivv9uss3IaDQHdM6oG9Bl1pRnNoi');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-27 22:39:42
