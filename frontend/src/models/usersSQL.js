import { getConnection } from '../config/postgres.js';

export const createUser = async (user) => {
  const { correo, contrasena, rol, preguntarc, respuestarc } = user;
  const pool = getConnection();
  const result = await pool.query(`
    INSERT INTO public."Usuario"
      ("Correo", "Password_Hash", "Rol", "preguntarec", "resprec")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "ID_Usuario" AS id;
  `, [correo, contrasena, rol, preguntarc, respuestarc]);
  return result.rows[0].id;
};

export const getAllUsers = async () => {
  const pool = getConnection();
  const result = await pool.query('SELECT * FROM public."Usuario" ORDER BY "ID_Usuario"');
  return result.rows;
};

export const getUserByEmail = async (correo) => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT u.*, c."Estado" AS "EstadoCliente"
    FROM public."Usuario" u
    LEFT JOIN public."Cliente" c ON u."ID_Usuario" = c."ID_Usuario"
    WHERE u."Correo" = $1;
  `, [correo]);
  return result.rows[0];
};

export const updatePassword = async (idUsuario, passwordHash) => {
  const pool = getConnection();
  await pool.query(`
    UPDATE public."Usuario"
    SET "Password_Hash" = $1
    WHERE "ID_Usuario" = $2;
  `, [passwordHash, idUsuario]);
};
