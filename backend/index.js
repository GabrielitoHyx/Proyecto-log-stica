// Importamos las librerías necesarias
const express = require("express");
//variable de conexion
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

    // Ruta para los login
    app.post("/api/login", async (req, res) => {
      // 1. Recibimos los datos que envía el frontend
      const { correo, password } = req.body;
      // 2. Validación básica (que no lleguen vacíos)
      if (!correo || !password) {
        return res
          .status(400)
          .json({ message: "Por favor, completa todos los campos." });
      }

      try {
        // 3. Hacemos la petición a la base de datos (Asumiendo que ya tienes tu "pool" de conexión)
        // Cambia 'pool' por la variable donde guardaste tu conexión si se llama diferente.
        const request = new sql.Request();

        // 4. Usamos .input() para evitar Inyección SQL (Seguridad)
        request.input("correo", sql.VarChar, correo);
        request.input("password", sql.VarChar, password);

        // 5. Ejecutamos el query
        // OJO: Cambia "Usuarios" por el nombre real de tu tabla en la base de datos
        const result = await request.query(
          "SELECT ID_Usuario, Correo, Rol FROM l.Usuario WHERE correo = @correo AND Password_Hash = @password",
        );

        // 6. Verificamos si encontró un usuario
        if (result.recordset.length > 0) {
          // Usuario encontrado, credenciales correctas
          const usuarioEncontrado = result.recordset[0];

          res.status(200).json({
            message: "Login exitoso",
            usuario: usuarioEncontrado,
          });
        } else {
          // No encontró a nadie con ese correo y contraseña
          res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }
      } catch (error) {
        console.error("Error en el endpoint de login:", error);
        res.status(500).json({ message: "Error interno del servidor." });
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
