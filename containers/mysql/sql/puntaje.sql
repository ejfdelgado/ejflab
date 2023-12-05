-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql:3306
-- Tiempo de generación: 29-11-2023 a las 21:48:34
-- Versión del servidor: 8.0.35
-- Versión de PHP: 8.0.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `policia_vr`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntaje`
--

CREATE TABLE `puntaje` (
  `puntaje_id` int NOT NULL,
  `puntaje_fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `puntaje_participante` varchar(20) NOT NULL,
  `puntaje_escenario` int NOT NULL,
  `puntaje_segundos` int DEFAULT NULL,
  `puntaje_triangulacion` int DEFAULT NULL,
  `puntaje_conocimiento_1` int DEFAULT NULL,
  `puntaje_conocimiento_2` int DEFAULT NULL,
  `puntaje_conocimiento_3` int DEFAULT NULL,
  `puntaje_conocimiento_4` int DEFAULT NULL,
  `puntaje_conocimiento_5` int DEFAULT NULL,
  `puntaje_conocimiento_6` int DEFAULT NULL,
  `puntaje_conocimiento_7` int DEFAULT NULL,
  `puntaje_conocimiento_8` int DEFAULT NULL,
  `puntaje_conocimiento_9` int DEFAULT NULL,
  `puntaje_conocimiento_10` int DEFAULT NULL,
  `puntaje_movimiento_1` int DEFAULT NULL,
  `puntaje_movimiento_2` int DEFAULT NULL,
  `puntaje_movimiento_3` int DEFAULT NULL,
  `puntaje_movimiento_4` int DEFAULT NULL,
  `puntaje_movimiento_5` int DEFAULT NULL,
  `puntaje_movimiento_6` int DEFAULT NULL,
  `puntaje_movimiento_7` int DEFAULT NULL,
  `puntaje_movimiento_8` int DEFAULT NULL,
  `puntaje_movimiento_9` int DEFAULT NULL,
  `puntaje_movimiento_10` int DEFAULT NULL,
  `puntaje_pareja` varchar(20) DEFAULT NULL COMMENT 'Id de la pareja policial'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `puntaje`
--

INSERT INTO `puntaje` (`puntaje_id`, `puntaje_fecha`, `puntaje_participante`, `puntaje_escenario`, `puntaje_segundos`, `puntaje_triangulacion`, `puntaje_conocimiento_1`, `puntaje_conocimiento_2`, `puntaje_conocimiento_3`, `puntaje_conocimiento_4`, `puntaje_conocimiento_5`, `puntaje_conocimiento_6`, `puntaje_conocimiento_7`, `puntaje_conocimiento_8`, `puntaje_conocimiento_9`, `puntaje_conocimiento_10`, `puntaje_movimiento_1`, `puntaje_movimiento_2`, `puntaje_movimiento_3`, `puntaje_movimiento_4`, `puntaje_movimiento_5`, `puntaje_movimiento_6`, `puntaje_movimiento_7`, `puntaje_movimiento_8`, `puntaje_movimiento_9`, `puntaje_movimiento_10`, `puntaje_pareja`) VALUES
(1, '2023-11-29 21:46:34', 'CC1010166710', 2, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CC1010166710');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `puntaje`
--
ALTER TABLE `puntaje`
  ADD PRIMARY KEY (`puntaje_id`),
  ADD KEY `puntaje_participante` (`puntaje_participante`),
  ADD KEY `puntaje_escenario` (`puntaje_escenario`),
  ADD KEY `puntaje_pareja` (`puntaje_pareja`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `puntaje`
--
ALTER TABLE `puntaje`
  MODIFY `puntaje_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `puntaje`
--
ALTER TABLE `puntaje`
  ADD CONSTRAINT `puntaje_escenario` FOREIGN KEY (`puntaje_escenario`) REFERENCES `escenario` (`escenario_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `puntaje_pareja` FOREIGN KEY (`puntaje_pareja`) REFERENCES `participante` (`participante_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `puntaje_participante` FOREIGN KEY (`puntaje_participante`) REFERENCES `participante` (`participante_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
