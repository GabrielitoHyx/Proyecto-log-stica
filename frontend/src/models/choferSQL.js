import { getConnection } from '../config/postgres.js';


// ==========================================
// OBTENER USUARIOS CHOFER DISPONIBLES
// ==========================================

export const getUsuariosChoferesDisponibles = async () => {

  const pool = getConnection();

  const result = await pool.query(`
    SELECT
      u."ID_Usuario",
      u."Correo"
    FROM public."Usuario" u
    LEFT JOIN public."Chofer" c
      ON u."ID_Usuario" = c."ID_Usuario"
    WHERE
      u."Rol" = 'Chofer'
      AND c."ID_Chof" IS NULL
    ORDER BY
      u."Correo";
  `);

  return result.rows;

};


// ==========================================
// OBTENER TODOS LOS CHOFERES
// ==========================================

export const getAllChoferes = async () => {

  const pool = getConnection();

  const result = await pool.query(`
    SELECT
      c."ID_Chof",
      c."ID_Usuario",
      u."Correo",
      c."NSS",
      c."Nombre",
      c."Licencia",
      c."Edad",
      c."Sexo"
    FROM public."Chofer" c
    INNER JOIN public."Usuario" u
      ON c."ID_Usuario" = u."ID_Usuario"
    ORDER BY
      c."ID_Chof";
  `);

  return result.rows;

};


// ==========================================
// OBTENER CHOFER POR ID
// ==========================================

export const getChoferById = async (id) => {

  const pool = getConnection();

  const result = await pool.query(`
    SELECT
      c."ID_Chof",
      c."ID_Usuario",
      u."Correo",
      c."NSS",
      c."Nombre",
      c."Licencia",
      c."Edad",
      c."Sexo"
    FROM public."Chofer" c
    INNER JOIN public."Usuario" u
      ON c."ID_Usuario" = u."ID_Usuario"
    WHERE
      c."ID_Chof" = $1;
  `, [id]);

  return result.rows[0];

};


// ==========================================
// CREAR CHOFER
// ==========================================

export const createChofer = async (chofer) => {

  const {
    id_usuario,
    nss,
    nombre,
    licencia,
    edad,
    sexo
  } = chofer;

  const pool = getConnection();

  const result = await pool.query(`
    INSERT INTO public."Chofer"
      (
        "ID_Usuario",
        "NSS",
        "Nombre",
        "Licencia",
        "Edad",
        "Sexo"
      )
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING
      "ID_Chof" AS id;
  `, [
    id_usuario,
    nss,
    nombre,
    licencia,
    edad,
    sexo
  ]);

  return result.rows[0].id;

};


// ==========================================
// ACTUALIZAR CHOFER
// ==========================================

export const actualizarChofer = async (
  id,
  nss,
  nombre,
  licencia,
  edad,
  sexo
) => {

  const pool = getConnection();

  const result = await pool.query(`
    UPDATE public."Chofer"
    SET
      "NSS" = $1,
      "Nombre" = $2,
      "Licencia" = $3,
      "Edad" = $4,
      "Sexo" = $5
    WHERE
      "ID_Chof" = $6
    RETURNING
      "ID_Chof";
  `, [
    nss,
    nombre,
    licencia,
    edad,
    sexo,
    id
  ]);

  return result.rows[0];

};