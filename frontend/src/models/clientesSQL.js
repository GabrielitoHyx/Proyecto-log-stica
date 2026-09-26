import { getConnection } from '../config/sqlserver.js';

// USUARIOS CON ROL CLIENTE QUE TODAVÍA NO ESTÁN REGISTRADOS EN LA TABLA CLIENTE
export const getUsuariosClientesDisponibles = async () => 
  { 
    const pool = await getConnection(); 
    const result = await pool.request().query
    (` SELECT u.Correo FROM l.Usuario u 
      LEFT JOIN l.Cliente c ON u.ID_Usuario = c.ID_Usuario 
      WHERE u.Rol = 'Cliente' AND c.ID_CLI IS NULL ORDER BY u.Correo `);
     return result.recordset; 
    
  }; 
     
// OBTENER TODOS LOS CLIENTES
export const getAllClientes = async () => 
  {
     const pool = await getConnection(); 
     const result = await pool.request().query
     (` SELECT c.ID_CLI, u.Correo, c.Nombre, c.Telefono, c.Estado FROM l.Cliente c 
      INNER JOIN l.Usuario u ON c.ID_Usuario = u.ID_Usuario 
      ORDER BY c.ID_CLI `); 
      return result.recordset; 
  }; 
  
// OBTENER UN CLIENTE
 export const getClienteById = async (id) =>
   { 
    const pool = await getConnection(); 
    const result = await pool.request() .input('id', id) .query
    (` SELECT c.ID_CLI, u.Correo, c.Nombre, c.Telefono, c.Estado FROM l.Cliente 
      c INNER JOIN l.Usuario u ON c.ID_Usuario = u.ID_Usuario
       WHERE c.ID_CLI = @id `);
    
       return result.recordset[0]; 
      
  }; 
// CREAR CLIENTE 
export const createCliente = async (cliente) => 
  { 
    const { id_usuario, nombre, telefono } = cliente;
     const pool = await getConnection(); 
     const result = await pool.request() 
     .input('id_usuario', id_usuario) 
     .input('nombre', nombre) 
     .input('telefono', telefono) 
     .query(
      ` INSERT INTO l.Cliente
       ( ID_Usuario, Nombre, Telefono, Estado ) 
        VALUES ( @id_usuario, @nombre, @telefono, 1 );
         SELECT SCOPE_IDENTITY() AS id; `); 
    
         return result.recordset[0].id; 
  };
  
  // CAMBIAR ESTADO DEL CLIENTE 
  export const actualizarEstadoCliente = async (id, estado) => 
    { 
      const pool = await getConnection(); 
      const result = await pool.request() 
      .input('id', id) 
      .input('estado', estado) 
      .query(
        ` UPDATE l.Cliente SET Estado = @estado WHERE ID_CLI = @id; 
        SELECT @@ROWCOUNT AS filasAfectadas; `);
         
        return result.recordset[0].filasAfectadas;
   };

// ACTUALIZAR INFORMACIÓN DEL CLIENTE
export const actualizarCliente = async (id, nombre, telefono) => {

  const pool = await getConnection();

  const result = await pool.request()
    .input('id', id)
    .input('nombre', nombre)
    .input('telefono', telefono)
    .query(`
      UPDATE l.Cliente
      SET
        Nombre = @nombre,
        Telefono = @telefono
      WHERE ID_CLI = @id;

      SELECT @@ROWCOUNT AS filasAfectadas;
    `);

  return result.recordset[0].filasAfectadas;
};