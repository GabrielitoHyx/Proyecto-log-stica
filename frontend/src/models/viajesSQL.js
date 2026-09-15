import { getConnection } from '../config/sqlserver.js';


// =====================================================
// OBTENER TODOS LOS VIAJES
// =====================================================

export const getAllViajes = async () => {

  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      v.ID_Viaje,
      v.Folio_ruta,
      v.Origen,
      v.Destino,
      v.Mercancia,
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
  `);

  return result.recordset;
};


// =====================================================
// OBTENER UN VIAJE POR ID
// =====================================================

export const getViajeById = async (id) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT
        v.ID_Viaje,
        v.Folio_ruta,
        v.Origen,
        v.Destino,
        v.Mercancia,
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

      WHERE v.ID_Viaje = @id;
    `);

  return result.recordset[0];
};


// =====================================================
// CREAR VIAJE
// =====================================================

export const createViaje = async (viaje) => {

  const {
    folio_ruta,
    id_cli,
    id_ca,
    id_cho,
    origen,
    destino,
    mercancia,
    peso_mercancia,
    distancia,
    fecha_partida,
    fecha_aprox_llegada,
    pago_cliente
  } = viaje;


  const pool = await getConnection();

  const result = await pool.request()

    .input('folio_ruta', folio_ruta)
    .input('id_cli', id_cli)
    .input('id_ca', id_ca)
    .input('id_cho', id_cho)
    .input('origen', origen)
    .input('destino', destino)
    .input('mercancia', mercancia)
    .input('peso_mercancia', peso_mercancia)
    .input('distancia', distancia)
    .input('fecha_partida', fecha_partida)
    .input('fecha_aprox_llegada', fecha_aprox_llegada)
    .input('pago_cliente', pago_cliente)

    .query(`
      INSERT INTO l.Viaje
      (
        Folio_ruta,
        Origen,
        Destino,
        Mercancia,
        Peso_Mercancia,
        Distancia,
        Fecha_partida,
        Fecha_aprox_llegada,
        Pago_Cliente,
        ID_cli,
        ID_ca,
        ID_cho
      )
      VALUES
      (
        @folio_ruta,
        @origen,
        @destino,
        @mercancia,
        @peso_mercancia,
        @distancia,
        @fecha_partida,
        @fecha_aprox_llegada,
        @pago_cliente,
        @id_cli,
        @id_ca,
        @id_cho
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);


  return result.recordset[0].id;
};

// =====================================================
// OBTENER VIAJE POR CHOFER
// =====================================================
export const getViajesByUsuarioChofer = async (idUsuario) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('idUsuario', idUsuario)
    .query(`
      SELECT
        v.ID_Viaje,
        v.Folio_ruta,
        v.Origen,
        v.Destino,
        v.Mercancia,
        v.Peso_Mercancia,
        v.Distancia,
        v.Fecha_partida,
        v.Fecha_aprox_llegada,
        v.Fecha_real_llegada,
        v.Pago_Cliente,
        v.Estado,

        c.Nombre AS Cliente,
        u.Correo AS Correo_Cliente,
        ca.Placas AS Camion

      FROM l.Viaje v

      INNER JOIN l.Chofer ch
        ON v.ID_cho = ch.ID_Chof

      LEFT JOIN l.Cliente c
        ON v.ID_cli = c.ID_CLI

      LEFT JOIN l.Usuario u
        ON c.ID_Usuario = u.ID_Usuario

      LEFT JOIN l.Camion ca
        ON v.ID_ca = ca.ID_CA

      WHERE ch.ID_Usuario = @idUsuario

      ORDER BY v.ID_Viaje;
    `);

  return result.recordset;
};
// =====================================================
// ACTUALIZAR ESTADO DE VIAJE
// =====================================================

export const actualizarEstadoViaje = async (
  idViaje,
  idUsuario,
  estado
) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('idViaje', idViaje)
    .input('idUsuario', idUsuario)
    .input('estado', estado)
    .query(`
      UPDATE v
      SET
        Estado = @estado,
        Fecha_real_llegada =
          CASE
            WHEN @estado = 'Completado'
            THEN GETDATE()
            ELSE Fecha_real_llegada
          END
      FROM l.Viaje v
      INNER JOIN l.Chofer ch
        ON v.ID_cho = ch.ID_Chof
      WHERE
        v.ID_Viaje = @idViaje
        AND ch.ID_Usuario = @idUsuario;

      SELECT @@ROWCOUNT AS filasActualizadas;
    `);

  return result.recordset[0].filasActualizadas;
};