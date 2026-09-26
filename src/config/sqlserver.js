import sql from 'mssql';
import dotnev from 'dotenv';
dotnev.config();
//Para desde cero
//instalar las bibliotecas que se indican en los archivos config
//dotenv para utilizar variables de entorno, npm install <biblioteca>
export const sqlServerConfig = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_SERVER,
  port: 1433,
  database: process.env.SQLSERVER_DB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
//captura de datos
export const getConnection = async () => {
  try {
    return await sql.connect(sqlServerConfig);
  } catch (error) {
    console.error('SQL Server connection error:', error);
    throw error;
  }
};

//se realiza la conexion