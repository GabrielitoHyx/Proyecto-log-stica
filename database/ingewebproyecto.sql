create database DB_Logistica
use DB_Logistica
create schema l


-- 1. TABLA DE USUARIOS (Para JWT y Autenticación)
create table l.Usuario(
ID_Usuario int identity (1,1) primary key,
Correo varchar(100) unique not null,
Password_Hash varchar (225) not null,
Rol varchar(20) not null -- Puede ser: 'Admin', 'Chofer', 'Cliente'
);

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
