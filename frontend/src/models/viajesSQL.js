import { getConnection } from '../config/postgres.js';

const pool = getConnection();


// =====================================================
// OBTENER TODOS LOS VIAJES
// =====================================================

export const getAllViajes = async () => {

  const result = await pool.query(`
    SELECT
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Mercancia",
      v."Peso_Mercancia",
      v."Distancia",
      v."Fecha_partida",
      v."Fecha_aprox_llegada",
      v."Fecha_real_llegada",
      v."Pago_Cliente",
      v."Estado",
      v."ID_cli",
      v."ID_ca",
      v."ID_cho",

      c."Nombre" AS "Cliente",
      u."Correo" AS "Correo_Cliente",

      ch."Nombre" AS "Chofer",

      ca."Placas" AS "Camion"

    FROM public."Viaje" v

    LEFT JOIN public."Cliente" c
      ON v."ID_cli" = c."ID_CLI"

    LEFT JOIN public."Usuario" u
      ON c."ID_Usuario" = u."ID_Usuario"

    LEFT JOIN public."Chofer" ch
      ON v."ID_cho" = ch."ID_Chof"

    LEFT JOIN public."Camion" ca
      ON v."ID_ca" = ca."ID_CA"

    ORDER BY v."ID_Viaje";
  `);

  return result.rows;
};


// =====================================================
// OBTENER UN VIAJE POR ID
// =====================================================

export const getViajeById = async (id) => {

  const result = await pool.query(
    `
    SELECT
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Mercancia",
      v."Peso_Mercancia",
      v."Distancia",
      v."Fecha_partida",
      v."Fecha_aprox_llegada",
      v."Fecha_real_llegada",
      v."Pago_Cliente",
      v."Estado",
      v."ID_cli",
      v."ID_ca",
      v."ID_cho",

      c."Nombre" AS "Cliente",
      u."Correo" AS "Correo_Cliente",

      ch."Nombre" AS "Chofer",

      ca."Placas" AS "Camion"

    FROM public."Viaje" v

    LEFT JOIN public."Cliente" c
      ON v."ID_cli" = c."ID_CLI"

    LEFT JOIN public."Usuario" u
      ON c."ID_Usuario" = u."ID_Usuario"

    LEFT JOIN public."Chofer" ch
      ON v."ID_cho" = ch."ID_Chof"

    LEFT JOIN public."Camion" ca
      ON v."ID_ca" = ca."ID_CA"

    WHERE v."ID_Viaje" = $1;
    `,
    [id]
  );

  return result.rows[0];
};


// =====================================================
// CREAR VIAJE
// =====================================================

export const createViaje = async (viaje) => {

  const {
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

  const result = await pool.query(
    `
    INSERT INTO public."Viaje"
    (
      "Origen",
      "Destino",
      "Mercancia",
      "Peso_Mercancia",
      "Distancia",
      "Fecha_partida",
      "Fecha_aprox_llegada",
      "Pago_Cliente",
      "Estado",
      "ID_cli",
      "ID_ca",
      "ID_cho"
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      'Presupuesto',
      $9,
      $10,
      $11
    )
    RETURNING
      "ID_Viaje",
      "Folio_ruta";
    `,
    [
      origen,
      destino,
      mercancia,
      peso_mercancia || null,
      distancia || null,
      fecha_partida,
      fecha_aprox_llegada || null,
      pago_cliente || null,
      id_cli,
      id_ca,
      id_cho
    ]
  );

  return {
    id: result.rows[0].ID_Viaje,
    folio_ruta: result.rows[0].Folio_ruta
  };
};


// =====================================================
// OBTENER VIAJES POR CHOFER
// =====================================================

export const getViajesByUsuarioChofer = async (idUsuario) => {

  const result = await pool.query(
    `
    SELECT
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Mercancia",
      v."Peso_Mercancia",
      v."Distancia",
      v."Fecha_partida",
      v."Fecha_aprox_llegada",
      v."Fecha_real_llegada",
      v."Pago_Cliente",
      v."Estado",

      c."Nombre" AS "Cliente",
      u."Correo" AS "Correo_Cliente",

      ca."Placas" AS "Camion"

    FROM public."Viaje" v

    INNER JOIN public."Chofer" ch
      ON v."ID_cho" = ch."ID_Chof"

    LEFT JOIN public."Cliente" c
      ON v."ID_cli" = c."ID_CLI"

    LEFT JOIN public."Usuario" u
      ON c."ID_Usuario" = u."ID_Usuario"

    LEFT JOIN public."Camion" ca
      ON v."ID_ca" = ca."ID_CA"

    WHERE ch."ID_Usuario" = $1

    ORDER BY v."ID_Viaje";
    `,
    [idUsuario]
  );

  return result.rows;
};


// =====================================================
// ACTUALIZAR ESTADO DE VIAJE
// CHOFER
//
// Flujo permitido:
//
// Programado
//      ↓
// En tránsito
//      ↓
// Completado
//
// Solo el chofer asignado puede cambiarlo.
// =====================================================

export const actualizarEstadoViaje = async (
  idViaje,
  idUsuario,
  estado
) => {

  const result = await pool.query(
    `
    UPDATE public."Viaje" v

    SET
      "Estado" = $1,

      "Fecha_real_llegada" =
        CASE
          WHEN $1 = 'Completado'
          THEN CURRENT_TIMESTAMP
          ELSE "Fecha_real_llegada"
        END

    FROM public."Chofer" ch

    WHERE
      v."ID_cho" = ch."ID_Chof"
      AND v."ID_Viaje" = $2
      AND ch."ID_Usuario" = $3

      AND (
        (
          $1 = 'En tránsito'
          AND v."Estado" = 'Programado'
        )
        OR
        (
          $1 = 'Completado'
          AND v."Estado" = 'En tránsito'
        )
      )

    RETURNING
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Estado",
      v."Fecha_real_llegada";
    `,
    [
      estado,
      idViaje,
      idUsuario
    ]
  );

  return result.rows[0];
};


// =====================================================
// OBTENER VIAJES DEL CLIENTE ACTUAL
// =====================================================

export const getViajesByUsuarioCliente = async (idUsuario) => {

  const result = await pool.query(
    `
    SELECT
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Mercancia",
      v."Peso_Mercancia",
      v."Distancia",
      v."Fecha_partida",
      v."Fecha_aprox_llegada",
      v."Fecha_real_llegada",
      v."Pago_Cliente",
      v."Estado",

      ch."Nombre" AS "Chofer",
      ca."Placas" AS "Camion"

    FROM public."Viaje" v

    INNER JOIN public."Cliente" c
      ON v."ID_cli" = c."ID_CLI"

    LEFT JOIN public."Chofer" ch
      ON v."ID_cho" = ch."ID_Chof"

    LEFT JOIN public."Camion" ca
      ON v."ID_ca" = ca."ID_CA"

    WHERE c."ID_Usuario" = $1

    ORDER BY v."ID_Viaje" DESC;
    `,
    [idUsuario]
  );

  return result.rows;
};


// =====================================================
// CREAR SOLICITUD DE VIAJE DEL CLIENTE
// =====================================================

export const createSolicitudViajeCliente = async (viaje) => {

  const {
    id_cli,
    origen,
    destino,
    mercancia,
    peso_mercancia,
    distancia,
    fecha_partida,
    fecha_aprox_llegada,
    pago_cliente
  } = viaje;

  const result = await pool.query(
    `
    INSERT INTO public."Viaje"
    (
      "Origen",
      "Destino",
      "Mercancia",
      "Peso_Mercancia",
      "Distancia",
      "Fecha_partida",
      "Fecha_aprox_llegada",
      "Pago_Cliente",
      "Estado",
      "ID_cli",
      "ID_ca",
      "ID_cho"
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      'Presupuesto',
      $9,
      NULL,
      NULL
    )
    RETURNING
      "ID_Viaje",
      "Folio_ruta";
    `,
    [
      origen,
      destino,
      mercancia,
      peso_mercancia || null,
      distancia || null,
      fecha_partida,
      fecha_aprox_llegada || null,
      pago_cliente || null,
      id_cli
    ]
  );

  return {
    id: result.rows[0].ID_Viaje,
    folio_ruta: result.rows[0].Folio_ruta
  };
};


// =====================================================
// ASIGNAR / REASIGNAR VIAJE DESDE ADMINISTRADOR
// =====================================================

export const asignarViaje = async (
  idViaje,
  idChofer,
  idCamion
) => {

  const result = await pool.query(
    `
    UPDATE public."Viaje"
    SET
      "ID_cho" = $1::integer,
      "ID_ca" = $2::integer,

      "Estado" =
        CASE
          WHEN $1::integer IS NULL
            OR $2::integer IS NULL
          THEN 'Presupuesto'

          WHEN "Estado" IN ('Presupuesto', 'Programado')
          THEN 'Programado'

          ELSE "Estado"
        END

    WHERE "ID_Viaje" = $3::integer

    RETURNING
      "ID_Viaje",
      "Folio_ruta",
      "ID_cho",
      "ID_ca",
      "Estado";
    `,
    [
      idChofer,
      idCamion,
      idViaje
    ]
  );

  return result.rows[0];
};


// =====================================================
// EDITAR SOLICITUD DE VIAJE DEL CLIENTE
//
// El cliente solamente puede editar:
// Estado = Presupuesto
//
// Además, se verifica que el viaje pertenezca
// al usuario autenticado.
// =====================================================

export const actualizarSolicitudViajeCliente = async (
  idViaje,
  idUsuario,
  viaje
) => {

  const {
    origen,
    destino,
    mercancia,
    peso_mercancia,
    distancia,
    fecha_partida,
    fecha_aprox_llegada,
    pago_cliente
  } = viaje;

  const result = await pool.query(
    `
    UPDATE public."Viaje" v

    SET
      "Origen" = $1,
      "Destino" = $2,
      "Mercancia" = $3,
      "Peso_Mercancia" = $4,
      "Distancia" = $5,
      "Fecha_partida" = $6,
      "Fecha_aprox_llegada" = $7,
      "Pago_Cliente" = $8

    FROM public."Cliente" c

    WHERE
      v."ID_cli" = c."ID_CLI"
      AND v."ID_Viaje" = $9
      AND c."ID_Usuario" = $10
      AND v."Estado" = 'Presupuesto'

    RETURNING
      v."ID_Viaje",
      v."Folio_ruta",
      v."Origen",
      v."Destino",
      v."Mercancia",
      v."Peso_Mercancia",
      v."Distancia",
      v."Fecha_partida",
      v."Fecha_aprox_llegada",
      v."Pago_Cliente",
      v."Estado";
    `,
    [
      origen,
      destino,
      mercancia,
      peso_mercancia || null,
      distancia || null,
      fecha_partida,
      fecha_aprox_llegada || null,
      pago_cliente || null,
      idViaje,
      idUsuario
    ]
  );

  return result.rows[0];
};