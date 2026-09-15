import { getConnection } from '../config/sqlserver.js';


// Usuarios con rol Chofer que todavía no tienen registro de chofer
export const getUsuariosChoferesDisponibles = async () => {

  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      u.ID_Usuario,
      u.Correo
    FROM l.Usuario u
    LEFT JOIN l.Chofer c
      ON u.ID_Usuario = c.ID_Usuario
    WHERE u.Rol = 'Chofer'
      AND c.ID_Chof IS NULL
    ORDER BY u.Correo
  `);

  return result.recordset;
};


// Obtener todos los choferes
export const getAllChoferes = async () => {

  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      ID_Chof,
      ID_Usuario,
      NSS,
      Nombre,
      Licencia,
      Edad,
      Sexo
    FROM l.Chofer
    ORDER BY ID_Chof
  `);

  return result.recordset;
};


// Obtener chofer por ID
export const getChoferById = async (id) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT
        ID_Chof,
        ID_Usuario,
        NSS,
        Nombre,
        Licencia,
        Edad,
        Sexo
      FROM l.Chofer
      WHERE ID_Chof = @id
    `);

  return result.recordset[0];
};


// Crear chofer
export const createChofer = async (chofer) => {

  const {
    id_usuario,
    nss,
    nombre,
    licencia,
    edad,
    sexo
  } = chofer;

  const pool = await getConnection();

  const result = await pool.request()
    .input('id_usuario', id_usuario)
    .input('nss', nss)
    .input('nombre', nombre)
    .input('licencia', licencia)
    .input('edad', edad)
    .input('sexo', sexo)
    .query(`
      INSERT INTO l.Chofer
      (
        ID_Usuario,
        NSS,
        Nombre,
        Licencia,
        Edad,
        Sexo
      )
      VALUES
      (
        @id_usuario,
        @nss,
        @nombre,
        @licencia,
        @edad,
        @sexo
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0].id;
};