-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: police_mysql:3306
-- Tiempo de generación: 12-01-2024 a las 14:05:38
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
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `cargo_id` varchar(15) NOT NULL,
  `cargo_txt` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`cargo_id`, `cargo_txt`) VALUES
('brigadiergen', 'brigadier general'),
('caboprimero', 'cabo primero'),
('cabosegundo', 'cabo segundo'),
('capitan', 'capitán'),
('comisario', 'comisario'),
('coronel', 'coronel'),
('general', 'general'),
('intendente', 'intendente'),
('intendentejefe', 'intendente jefe'),
('mayor', 'mayor'),
('mayorgeneral', 'mayor general'),
('patrullero', 'patrullero'),
('sarmayor', 'sargento mayor'),
('sarprimero', 'sargento primero'),
('sarsegundo', 'sargento segundo'),
('sarvicepri', 'sargento viceprimero'),
('subcomisario', 'subcomisario'),
('subintendente', 'subintendente'),
('subteniente', 'subteniente'),
('teniente', 'teniente'),
('tenientecoronel', 'teniente coronel');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`cargo_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
