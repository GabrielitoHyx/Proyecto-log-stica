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
     SELECT u.*, c.Estado AS EstadoCliente FROM l.Usuario
     u LEFT JOIN l.Cliente c ON u.ID_Usuario = c.ID_Usuario
    WHERE u.Correo = @correo 
    `); 
       
    return result.recordset[0];
  
};

export const updatePassword = async (idUsuario, passwordHash) => {

  const pool = await getConnection();

  await pool.request()
    .input('idUsuario', idUsuario)
    .input('passwordHash', passwordHash)
    .query(`
      UPDATE l.Usuario
      SET Password_Hash = @passwordHash
      WHERE ID_Usuario = @idUsuario
    `);
};