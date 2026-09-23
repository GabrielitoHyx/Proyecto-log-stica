create database DB_Logistica
use DB_Logistica
create schema l


-- 1. TABLA DE USUARIOS (Para JWT y Autenticación)
create table l.Usuario(
ID_Usuario int identity (1,1) primary key,
Correo varchar(100) unique not null,
Password_Hash varchar (225) not null,
Rol varchar(20) not null -- Puede ser: 'Admin', 'Chofer', 'Cliente',
);
alter table l.Usuario 
add  preguntarec varchar(100)
alter table l.Usuario 
add  resprec varchar(100)

-- 2. TABLA CHOFER
create table l.Chofer(
ID_Chof int not null IDENTITY(1,1) PRIMARY KEY,
ID_Usuario INT FOREIGN KEY REFERENCES l.Usuario(ID_Usuario),
NSS VARCHAR(20),
Nombre varchar(100),
Licencia VARCHAR(30),
Edad int,
Sexo char
);

-- 3. TABLA CAMION
create table l.Camion(
ID_CA int IDENTITY(1,1) PRIMARY KEY,
Placas varchar(15) NOT NULL UNIQUE,
Modelo varchar(20),
Kilometraje_total decimal(10,2),
Capacidad_tanque int,
Capacidad_carga decimal(6,2) NOT NULL UNIQUE,
-- La "Utilidad" se calcula dinámicamente, no se guarda como columna estática
);

alter table l.Camion
add Capacidad_carga int not null

-- 4. TABLA CLIENTE
create table l.Cliente(
ID_CLI int IDENTITY(1,1) PRIMARY KEY,
ID_Usuario INT FOREIGN KEY REFERENCES l.Usuario(ID_Usuario), -- Enlace para su login
Nombre varchar(100),
Telefono varchar(20)
-- Origen y Destino se movieron al Viaje
);

-- 5. TABLA VIAJE
CREATE TABLE l.Viaje (
    ID_Viaje INT IDENTITY(1,1) PRIMARY KEY,
    Folio_ruta VARCHAR(10) UNIQUE,
    Origen VARCHAR(100),
    Destino VARCHAR(100),
    Mercancia VARCHAR(100),
    Peso_Mercancia DECIMAL(6,2),
    Distancia DECIMAL(6,2),
    Fecha_partida DATE,
    Fecha_aprox_llegada DATE,
    Fecha_real_llegada DATE, -- Para saber cuándo terminó realmente
    Pago_Cliente MONEY, -- Lo que cobraste por el viaje
    Estado VARCHAR(20) DEFAULT 'Presupuesto', -- 'Presupuesto', 'En Curso', 'Finalizado'
    
    -- Llaves foráneas
    ID_cli INT FOREIGN KEY REFERENCES l.Cliente(ID_CLI),
    ID_ca INT FOREIGN KEY REFERENCES l.Camion(ID_CA),
    ID_cho INT FOREIGN KEY REFERENCES l.Chofer(ID_Chof)
);

-- 6. GASTOS DEL CAMION (Mantenimiento y Fijos)
create table l.Gastos_Camion(
ID_GCA int IDENTITY(1,1) PRIMARY KEY,
ID_ca INT FOREIGN KEY REFERENCES l.Camion(ID_CA),
Fecha_Gasto DATE,
Tipo_Gasto VARCHAR(50), -- 'Fijo' o 'Mantenimiento'
Concepto VARCHAR(100), -- Ej: 'Cambio de 6 llantas', 'Verificación 1er Semestre'
Monto MONEY,
Kilometraje_Al_Momento DECIMAL(10,2), -- Crucial para saber cuándo toca el próximo servicio
Proximo_Aviso DATE -- Para que el sistema mande una alerta

);

-- 7. GASTOS DEL VIAJE (Combina Presupuesto vs Realidad)
-- En lugar de dos tablas casi iguales, usamos una enlazada al viaje
CREATE TABLE l.Gastos_Viaje (
ID_Gasto_Viaje INT IDENTITY(1,1) PRIMARY KEY,
ID_Viaje INT FOREIGN KEY REFERENCES l.Viaje(ID_Viaje),
Tipo_Gasto VARCHAR(50), -- Ej: 'Combustible', 'Caseta', 'Sueldo', 'viaticos'
Concepto VARCHAR(100), -- Ej: 'Caseta Tepotzotlán' o 'Ticket Pemex'
Monto_Presupuestado MONEY DEFAULT 0,
Monto_Comprobado MONEY DEFAULT 0, -- El chofer llena esto en su app
Fecha_Registro DATETIME DEFAULT GETDATE() -- Guarda automáticamente la fecha y hora del sistema al insertar
);

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
SELECT * FROM l.Usuario;


SELECT @@SERVERNAME;
SELECT name
FROM sys.databases;

SELECT name
FROM sys.sql_logins;

ALTER LOGIN sa WITH PASSWORD = 'Admin123*';
ALTER LOGIN sa ENABLE;


SELECT * FROM l.Usuario;
SELECT * FROM l.Cliente;
SELECT * FROM l.Chofer;
SELECT * FROM l.Camion;

--DELETE FROM l.Viaje;
--DELETE FROM l.Chofer;
--DELETE FROM l.Cliente;
--DELETE FROM l.Camion;
--DELETE FROM l.Usuario;

DBCC CHECKIDENT ('l.Usuario', RESEED, 0);
DBCC CHECKIDENT ('l.Cliente', RESEED, 0);
DBCC CHECKIDENT ('l.Chofer', RESEED, 0);
DBCC CHECKIDENT ('l.Camion', RESEED, 0);
DBCC CHECKIDENT ('l.Viaje', RESEED, 0);

INSERT INTO l.Usuario
(Correo, Password_Hash, Rol)
VALUES
('admin@mx.com','1234','Admin'),
('chofer1@mx.com','1234','Chofer'),
('chofer2@mx.com','1234'    ,'Chofer'),
('cliente1@mx.com','1234','Cliente'),
('cliente2@mx.com','1234','Cliente');

SELECT * FROM l.Usuario;

INSERT INTO l.Cliente
(ID_Usuario, Nombre, Telefono)
VALUES
(1,'Juan Perez','5511111111'),
(2,'Ana Lopez','5522222222');

INSERT INTO l.Chofer
(ID_Usuario, NSS, Nombre, Licencia, Edad, Sexo)
VALUES
(2,'NSS001','Carlos Ramirez','LIC001',35,'M'),
(3,'NSS002','Luis Garcia','LIC002',42,'M');

INSERT INTO l.Camion
(Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga)
VALUES
('ABC123','Kenworth',150000,400,20);

INSERT INTO l.Camion
(Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga)
VALUES
('XYZ456','Cascadia',220000,500,25);

SELECT * FROM l.Cliente;
SELECT * FROM l.Chofer;
SELECT * FROM l.Camion;

INSERT INTO l.Viaje ( Folio_ruta, Origen, Destino,
Mercancia, Peso_Mercancia, Distancia, Fecha_partida, Fecha_aprox_llegada,
Fecha_real_llegada, Pago_Cliente, Estado, ID_cli, ID_ca, ID_cho
) VALUES ( 'RUTA001', 'Ciudad de Mexico', 'Guadalajara', 'Electronicos',
1500, 550, '2026-06-15', '2026-06-16', NULL, 25000, 'Pendiente', 2, 1, 1);

INSERT INTO l.Viaje ( Folio_ruta, Origen, Destino,
Mercancia, Peso_Mercancia, Distancia, Fecha_partida, Fecha_aprox_llegada,
Fecha_real_llegada, Pago_Cliente, Estado, ID_cli, ID_ca, ID_cho
) VALUES ( 'RUTA002', 'Monterrey', 'Puebla', 'Alimentos',
3000, 900, '2026-06-18', '2026-06-20', NULL, 40000, 'En Transito', 3, 0, 0 );

SELECT * FROM l.Viaje;

SELECT * FROM l.Usuario
SELECT * FROM l.Cliente
SELECT * FROM l.Chofer
SELECT * FROM l.Camion
SELECT * FROM l.Viaje

Delete from l.Usuario where Correo= 'cliente@gmail.com'

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
SELECT TOP 5 * FROM l.Usuario;

    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'l'
    AND TABLE_NAME = 'Camion';

UPDATE l.Usuario
SET Rol = 'Chofer'
WHERE Rol IN (
    'Capturista chofer',
    'Capturista_chofer',
    'Capturista viaje'
);

  SELECT u.ID_Usuario,u.Correo
    FROM l.Usuario u
    LEFT JOIN l.Chofer c
      ON u.ID_Usuario = c.ID_Usuario
    WHERE u.Rol = 'Chofer'
      AND c.ID_Chof IS NULL
    ORDER BY u.Correo

SELECT v.ID_Viaje, v.Folio_ruta, v.Origen, v.Destino, v.Mercancia,
      v.Peso_Mercancia,
      v.Distancia,
      v.Fecha_partida,
      v.Fecha_aprox_llegada,
      v.Fecha_real_llegada,
      v.Pago_Cliente,
      v.Estado,

      c.Nombre AS Cliente,
      u.Correo AS Correo_Cliente,

      ch.Nombre AS Chofer,

      ca.Placas AS Camion

    FROM l.Viaje v

    LEFT JOIN l.Cliente c
      ON v.ID_cli = c.ID_CLI

    LEFT JOIN l.Usuario u
      ON c.ID_Usuario = u.ID_Usuario

    LEFT JOIN l.Chofer ch
      ON v.ID_cho = ch.ID_Chof

    LEFT JOIN l.Camion ca
      ON v.ID_ca = ca.ID_CA

    ORDER BY v.ID_Viaje;