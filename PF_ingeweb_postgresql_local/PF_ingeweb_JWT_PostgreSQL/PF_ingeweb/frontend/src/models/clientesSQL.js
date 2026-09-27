import { getConnection } from '../config/postgres.js';

export const getUsuariosClientesDisponibles = async () => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT u."Correo"
    FROM public."Usuario" u
    LEFT JOIN public."Cliente" c ON u."ID_Usuario" = c."ID_Usuario"
    WHERE u."Rol" = 'Cliente' AND c."ID_CLI" IS NULL
    ORDER BY u."Correo";
  `);
  return result.rows;
};

export const getAllClientes = async () => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT c."ID_CLI", u."Correo", c."Nombre", c."Telefono", c."Estado"
    FROM public."Cliente" c
    INNER JOIN public."Usuario" u ON c."ID_Usuario" = u."ID_Usuario"
    ORDER BY c."ID_CLI";
  `);
  return result.rows;
};

export const getClienteById = async (id) => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT c."ID_CLI", u."Correo", c."Nombre", c."Telefono", c."Estado"
    FROM public."Cliente" c
    INNER JOIN public."Usuario" u ON c."ID_Usuario" = u."ID_Usuario"
    WHERE c."ID_CLI" = $1;
  `, [id]);
  return result.rows[0];
};

export const createCliente = async (cliente) => {
  const { id_usuario, nombre, telefono } = cliente;
  const pool = getConnection();
  const result = await pool.query(`
    INSERT INTO public."Cliente"
      ("ID_Usuario", "Nombre", "Telefono", "Estado")
    VALUES ($1, $2, $3, TRUE)
    RETURNING "ID_CLI" AS id;
  `, [id_usuario, nombre, telefono]);
  return result.rows[0].id;
};

export const actualizarEstadoCliente = async (id, estado) => {
  const pool = getConnection();
  const result = await pool.query(`
    UPDATE public."Cliente"
    SET "Estado" = $1
    WHERE "ID_CLI" = $2;
  `, [estado, id]);
  return result.rowCount;
};

export const actualizarCliente = async (id, nombre, telefono) => {
  const pool = getConnection();
  const result = await pool.query(`
    UPDATE public."Cliente"
    SET "Nombre" = $1, "Telefono" = $2
    WHERE "ID_CLI" = $3;
  `, [nombre, telefono, id]);
  return result.rowCount;
};
