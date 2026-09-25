// Importamos las librerías necesarias
const express = require("express");
//variable de conexion
const sql = require("mssql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Carga las variables del archivo .env

const app = express();

// Middlewares
app.use(express.json()); // Permite recibir formato JSON en las peticiones
app.use(cors()); // Permite la comunicación con React

// ==========================================
// MIDDLEWARE: VERIFICACIÓN DE JWT
// ==========================================
const verificarToken = (req, res, next) => {
  // El frontend debe enviar el token en los "Headers" de la petición
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    // Si el token viene como "Bearer eyJhb...", le quitamos la palabra "Bearer "
    const tokenLimpio = token.startsWith("Bearer ")
      ? token.slice(7, token.length)
      : token;

    // Verificamos que el token sea auténtico usando nuestra clave secreta
    const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

    // Guardamos los datos del usuario (id, correo, rol) por si la ruta los necesita
    req.usuario = verificado;

    next(); // ¡Token válido! Dejamos pasar la petición a la ruta.
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token inválido o expirado. Vuelve a iniciar sesión." });
  }
};

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

    // Ruta para obtener todos los camiones (PROTEGIDA CON JWT)
    app.get("/api/camiones", verificarToken, async (req, res) => {
      try {
        const resultado = await sql.query("SELECT * FROM l.Camion");
        res.json(resultado.recordset);
      } catch (error) {
        console.error("Error al consultar los camiones:", error);
        res
          .status(500)
          .json({ mensaje: "Error interno del servidor al obtener camiones" });
      }
    });

    // Ruta para registrar un NUEVO camión (PROTEGIDA CON JWT)
    app.post("/api/camiones", verificarToken, async (req, res) => {
      const { placas, modelo, capacidad_carga } = req.body;

      if (!placas || !capacidad_carga) {
        return res.status(400).json({
          message: "Las placas y la capacidad de carga son obligatorias.",
        });
      }

      try {
        const request = new sql.Request();
        request.input("placas", sql.VarChar, placas);
        request.input("modelo", sql.VarChar, modelo);
        request.input("carga", sql.Decimal, capacidad_carga);

        await request.query(
          "INSERT INTO l.Camion (Placas, Modelo, Capacidad_carga) VALUES (@placas, @modelo, @carga)",
        );

        res.status(201).json({ message: "Camión registrado exitosamente" });
      } catch (error) {
        console.error("Error al registrar camión:", error);
        res
          .status(500)
          .json({ message: "Error interno al guardar en la base de datos." });
      }
    });

    // Ruta para ACTUALIZAR un camión existente (PROTEGIDA CON JWT)
    app.put("/api/camiones/:id", verificarToken, async (req, res) => {
      const { id } = req.params;
      const { placas, modelo, capacidad_carga } = req.body;

      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        request.input("placas", sql.VarChar, placas);
        request.input("modelo", sql.VarChar, modelo);
        request.input("carga", sql.Decimal, capacidad_carga);

        const result = await request.query(
          "UPDATE l.Camion SET Placas = @placas, Modelo = @modelo, Capacidad_carga = @carga WHERE ID_CA = @id",
        );

        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "Camión no encontrado" });
        }

        res.json({ message: "Camión actualizado exitosamente" });
      } catch (error) {
        console.error("Error al actualizar camión:", error);
        res.status(500).json({
          message: "Error interno al actualizar en la base de datos.",
        });
      }
    });

    // Ruta para ELIMINAR un camión (PROTEGIDA CON JWT)
    app.delete("/api/camiones/:id", verificarToken, async (req, res) => {
      const { id } = req.params;

      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);

        const result = await request.query(
          "DELETE FROM l.Camion WHERE ID_CA = @id",
        );

        if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "Camión no encontrado" });
        }

        res.json({ message: "Camión eliminado exitosamente" });
      } catch (error) {
        console.error("Error al eliminar camión:", error);
        res.status(500).json({
          message:
            "Error al eliminar. Es posible que el camión tenga registros asociados.",
        });
      }
    });

    // ==========================================
    // RUTAS PARA EL MÓDULO DE CHOFERES
    // ==========================================

    // Obtener todos los choferes
    app.get("/api/choferes", verificarToken, async (req, res) => {
      try {
        const resultado = await sql.query("SELECT * FROM l.Chofer");
        res.json(resultado.recordset);
      } catch (error) {
        console.error("Error al consultar choferes:", error);
        res.status(500).json({ mensaje: "Error al obtener choferes" });
      }
    });

    // Registrar un nuevo chofer
    app.post("/api/choferes", verificarToken, async (req, res) => {
      const { id_usuario, nss, nombre, licencia, edad, sexo } = req.body;
      try {
        const request = new sql.Request();
        // Enviamos null si el campo id_usuario viene vacío
        request.input("id_usuario", sql.Int, id_usuario ? id_usuario : null);
        request.input("nss", sql.VarChar, nss);
        request.input("nombre", sql.VarChar, nombre);
        request.input("licencia", sql.VarChar, licencia);
        request.input("edad", sql.Int, edad);
        request.input("sexo", sql.Char, sexo);

        await request.query(
          "INSERT INTO l.Chofer (ID_Usuario, NSS, Nombre, Licencia, Edad, Sexo) VALUES (@id_usuario, @nss, @nombre, @licencia, @edad, @sexo)",
        );
        res.status(201).json({ message: "Chofer registrado exitosamente" });
      } catch (error) {
        console.error("Error al registrar chofer:", error);
        res.status(500).json({ message: "Error interno al guardar chofer." });
      }
    });

    // Actualizar un chofer
    app.put("/api/choferes/:id", verificarToken, async (req, res) => {
      const { id } = req.params;
      const { id_usuario, nss, nombre, licencia, edad, sexo } = req.body;
      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        request.input("id_usuario", sql.Int, id_usuario ? id_usuario : null);
        request.input("nss", sql.VarChar, nss);
        request.input("nombre", sql.VarChar, nombre);
        request.input("licencia", sql.VarChar, licencia);
        request.input("edad", sql.Int, edad);
        request.input("sexo", sql.Char, sexo);

        const result = await request.query(
          "UPDATE l.Chofer SET ID_Usuario = @id_usuario, NSS = @nss, Nombre = @nombre, Licencia = @licencia, Edad = @edad, Sexo = @sexo WHERE ID_Chof = @id",
        );

        if (result.rowsAffected[0] === 0)
          return res.status(404).json({ message: "Chofer no encontrado" });
        res.json({ message: "Chofer actualizado" });
      } catch (error) {
        console.error("Error al actualizar chofer:", error);
        res.status(500).json({ message: "Error al actualizar chofer." });
      }
    });

    // Eliminar un chofer
    app.delete("/api/choferes/:id", verificarToken, async (req, res) => {
      const { id } = req.params;
      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        const result = await request.query(
          "DELETE FROM l.Chofer WHERE ID_Chof = @id",
        );

        if (result.rowsAffected[0] === 0)
          return res.status(404).json({ message: "Chofer no encontrado" });
        res.json({ message: "Chofer eliminado" });
      } catch (error) {
        console.error("Error al eliminar chofer:", error);
        res.status(500).json({
          message: "Error al eliminar. Puede tener registros asociados.",
        });
      }
    });

    // ==========================================
    // RUTAS PARA EL MÓDULO DE USUARIOS
    // ==========================================

    // Obtener todos los usuarios (sin enviar las contraseñas encriptadas)
    app.get("/api/usuarios", verificarToken, async (req, res) => {
      try {
        const resultado = await sql.query(
          "SELECT ID_Usuario, Correo, Rol FROM l.Usuario",
        );
        res.json(resultado.recordset);
      } catch (error) {
        console.error("Error al consultar usuarios:", error);
        res.status(500).json({ mensaje: "Error al obtener usuarios" });
      }
    });

    // Registrar un nuevo usuario (Encriptando la contraseña)
    app.post("/api/usuarios", verificarToken, async (req, res) => {
      const { correo, password, rol } = req.body;
      try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const request = new sql.Request();
        request.input("correo", sql.VarChar, correo);
        request.input("password_hash", sql.VarChar, passwordHash);
        request.input("rol", sql.VarChar, rol);

        await request.query(
          "INSERT INTO l.Usuario (Correo, Password_Hash, Rol) VALUES (@correo, @password_hash, @rol)",
        );
        res.status(201).json({ message: "Usuario registrado exitosamente" });
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        res
          .status(500)
          .json({
            message:
              "Error interno al guardar usuario. Verifica que el correo no esté duplicado.",
          });
      }
    });

    // Actualizar un usuario
    app.put("/api/usuarios/:id", verificarToken, async (req, res) => {
      const { id } = req.params;
      const { correo, password, rol } = req.body;
      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        request.input("correo", sql.VarChar, correo);
        request.input("rol", sql.VarChar, rol);

        let query = "UPDATE l.Usuario SET Correo = @correo, Rol = @rol";

        // Si el admin escribió una nueva contraseña, la encriptamos y la incluimos en el UPDATE
        if (password && password.trim() !== "") {
          const passwordHash = await bcrypt.hash(password, 10);
          request.input("password_hash", sql.VarChar, passwordHash);
          query += ", Password_Hash = @password_hash";
        }

        query += " WHERE ID_Usuario = @id";

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0)
          return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario actualizado" });
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: "Error al actualizar usuario." });
      }
    });

    // Eliminar un usuario
    app.delete("/api/usuarios/:id", verificarToken, async (req, res) => {
      const { id } = req.params;
      try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        const result = await request.query(
          "DELETE FROM l.Usuario WHERE ID_Usuario = @id",
        );

        if (result.rowsAffected[0] === 0)
          return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado" });
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res
          .status(500)
          .json({
            message:
              "Error al eliminar. Puede tener registros asociados (como un chofer).",
          });
      }
    });

    // Ruta para iniciar sesión y generar el JWT
    app.post("/api/login", async (req, res) => {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res
          .status(400)
          .json({ message: "Por favor, completa todos los campos." });
      }

      try {
        const request = new sql.Request();
        request.input("correo", sql.VarChar, correo);
        request.input("password", sql.VarChar, password);

        const result = await request.query(
          "SELECT ID_Usuario, Correo, Rol FROM l.Usuario WHERE correo = @correo AND Password_Hash = @password",
        );

        if (result.recordset.length > 0) {
          const usuarioEncontrado = result.recordset[0];

          // Generamos el Token
          const token = jwt.sign(
            {
              id: usuarioEncontrado.ID_Usuario,
              correo: usuarioEncontrado.Correo,
              rol: usuarioEncontrado.Rol,
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" },
          );

          res.status(200).json({
            message: "Login exitoso",
            token: token,
            usuario: {
              correo: usuarioEncontrado.Correo,
              rol: usuarioEncontrado.Rol,
            },
          });
        } else {
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
