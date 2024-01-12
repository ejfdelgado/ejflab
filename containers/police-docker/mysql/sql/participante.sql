-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: police_mysql:3306
-- Tiempo de generación: 12-01-2024 a las 14:03:41
-- Versión del servidor: 8.0.35
-- Versión de PHP: 8.0.27

/*
Los datos a registrar son: 
- nombres, OK
- apellidos, OK 
- cédula, OK
- edad, (fecha de nacimiento) OK
- tiempo que lleva en la institución (fecha ingreso a institución) OK
- género, (tabla foreign key) OK
- etnia (Creo que no se necesita, si sí, tabla foreign key) OK
- cargo actual (tabla foreign key)*
- unidad a la que pertenece (OK)
*/

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
-- Estructura de tabla para la tabla `participante`
--

CREATE TABLE `participante` (
  `participante_id` varchar(20) NOT NULL COMMENT 'Tipo y número de id, eg: CC1010166710',
  `participante_nombres` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `participante_apellidos` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `participante_unidad` int NOT NULL,
  `participante_nacimiento` date DEFAULT NULL,
  `participante_ingreso` date DEFAULT NULL,
  `participante_genero` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `participante_etnia` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `participante_cargo` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `participante`
--

INSERT INTO `participante` (`participante_id`, `participante_nombres`, `participante_apellidos`, `participante_unidad`, `participante_nacimiento`, `participante_ingreso`, `participante_genero`, `participante_etnia`, `participante_cargo`) VALUES
('CC1010166710', 'Edgar José Fernando', 'Delgado Leyton', 1, '1985-12-04', '2023-09-01', 'masculino', 'mestizo', 'coronel'),
('CC53', 'Gloria Liliana', 'Delgado Leyton', 1, '1985-10-30', '2023-09-01', 'femenino', 'blanco', 'capitan'),
('CE5', 'Mary', 'Gomez Tortolero', 1, '1993-01-01', '2023-09-01', 'femenino', 'blanco', 'mayor');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `participante`
--
ALTER TABLE `participante`
  ADD PRIMARY KEY (`participante_id`),
  ADD KEY `participante_unidad` (`participante_unidad`),
  ADD KEY `participante_genero` (`participante_genero`),
  ADD KEY `participante_etnia` (`participante_etnia`),
  ADD KEY `participante_cargo` (`participante_cargo`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `participante`
--
ALTER TABLE `participante`
  ADD CONSTRAINT `participante_cargo` FOREIGN KEY (`participante_cargo`) REFERENCES `cargo` (`cargo_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `participante_etnia` FOREIGN KEY (`participante_etnia`) REFERENCES `etnia` (`etnia_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `participante_genero` FOREIGN KEY (`participante_genero`) REFERENCES `genero` (`genero_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `participante_unidad` FOREIGN KEY (`participante_unidad`) REFERENCES `unidad` (`unidad_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
