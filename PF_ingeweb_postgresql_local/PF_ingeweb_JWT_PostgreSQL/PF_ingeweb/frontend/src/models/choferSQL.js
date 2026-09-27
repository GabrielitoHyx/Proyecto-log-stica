import { getConnection } from '../config/postgres.js';

export const getUsuariosChoferesDisponibles = async () => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT u."ID_Usuario", u."Correo"
    FROM public."Usuario" u
    LEFT JOIN public."Chofer" c ON u."ID_Usuario" = c."ID_Usuario"
    WHERE u."Rol" = 'Chofer' AND c."ID_Chof" IS NULL
    ORDER BY u."Correo";
  `);
  return result.rows;
};

export const getAllChoferes = async () => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT "ID_Chof", "ID_Usuario", "NSS", "Nombre", "Licencia", "Edad", "Sexo"
    FROM public."Chofer"
    ORDER BY "ID_Chof";
  `);
  return result.rows;
};

export const getChoferById = async (id) => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT "ID_Chof", "ID_Usuario", "NSS", "Nombre", "Licencia", "Edad", "Sexo"
    FROM public."Chofer"
    WHERE "ID_Chof" = $1;
  `, [id]);
  return result.rows[0];
};

export const createChofer = async (chofer) => {
  const { id_usuario, nss, nombre, licencia, edad, sexo } = chofer;
  const pool = getConnection();
  const result = await pool.query(`
    INSERT INTO public."Chofer"
      ("ID_Usuario", "NSS", "Nombre", "Licencia", "Edad", "Sexo")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING "ID_Chof" AS id;
  `, [id_usuario, nss, nombre, licencia, edad, sexo]);
  return result.rows[0].id;
};
