import { getConnection } from '../config/sqlserver.js';

export const createUser = async (user) => {
  const { correo, contrasena, rol ,preguntarc, respuestarc } = user;

  const pool = await getConnection();

  const result = await pool.request()
  .input('correo', correo)
  .input('passwordHash', contrasena)
  .input('rol', rol)
  .input('preguntarec', preguntarc)
  .input('resprec', respuestarc)
  .query(`
    INSERT INTO l.Usuario
    (Correo, Password_Hash, Rol, preguntarec, resprec)
    VALUES
    (@correo, @passwordHash, @rol, @preguntarec, @resprec);

    SELECT SCOPE_IDENTITY() AS id;
  `);

    return result.recordset[0].id;  

  };

export const getAllUsers = async () => {  
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM l.Usuario');
    return result.recordset;  
};


export const getUserByEmail = async (correo) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('correo', correo)
    .query(`
      SELECT *
      FROM l.Usuario
      WHERE Correo = @correo
    `);

  return result.recordset[0];
};