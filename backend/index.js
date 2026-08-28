// Importamos las librerías necesarias
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
require("dotenv").config(); // Carga las variables del archivo .env

const app = express();

// Middlewares
app.use(express.json()); // Permite recibir formato JSON en las peticiones
app.use(cors()); // Permite la comunicación con React

// Configuración de la conexión a SQL Server
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: "localhost", // Pon solo 'localhost' aquí
  database: process.env.DB_NAME,
  options: {
    instanceName: "SQLEXPRESS", // Declaramos la instancia explícitamente aquí
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Función para conectar a la Base de Datos y encender el servidor
async function iniciarServidor() {
  try {
    // Intentamos conectar a SQL Server
    await sql.connect(dbConfig);
    console.log("¡Conexión exitosa a SQL Server (DB_Logistica)! 🚀");

    // Ruta de prueba para verificar que el backend responde
    app.get("/api/test", (req, res) => {
      res.json({
        estado: "Conectado",
        mensaje: "El backend y la base de datos están listos.",
      });
    });

    // ==========================================
    // RUTAS DE LA API (ENDPOINTS)
    // ==========================================

    // Ruta para obtener todos los camiones de la base de datos
    app.get("/api/camiones", async (req, res) => {
      try {
        // Ejecutamos una consulta directa a tu tabla del esquema 'l'
        const resultado = await sql.query("SELECT * FROM l.Camion");

        // Respondemos al cliente con los registros encontrados en formato JSON
        res.json(resultado.recordset);
      } catch (error) {
        console.error("Error al consultar los camiones:", error);
        res
          .status(500)
          .json({ mensaje: "Error interno del servidor al obtener camiones" });
      }
    });

    // Encendemos el servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
}

// Ejecutamos la función de inicio
iniciarServidor();
