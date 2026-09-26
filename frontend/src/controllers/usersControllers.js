import {
  createUser,
  getAllUsers,
  getUserByEmail,
  updatePassword
} from '../models/usersSQL.js';

import { validateUser } from '../validator/validator.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {

    validateUser(req.body);

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(
      req.body.contrasena,
      10
    );

    // Hash de la respuesta de recuperación
    const respuestaHash = await bcrypt.hash(
      req.body.respuestarc,
      10
    );

    const user = {
      ...req.body,
      contrasena: passwordHash,
      respuestarc: respuestaHash
    };

    const id = await createUser(user);

    res.status(201).json({ id });

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};


export const getUsers = async (req, res) => {
  try {

    const users = await getAllUsers();

    res.json(users);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


//////------------------PROCESOS--------------------------
//--------------------------------------------------------

// LOGIN
export const login = async (req, res) => {

  try {

    const { correo, contrasena } = req.body;

    const usuario = await getUserByEmail(correo);

    if (!usuario) {
      return res.status(401).json({
        error: 'Correo o contraseña incorrectos'
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      contrasena,
      usuario.Password_Hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: 'Correo o contraseña incorrectos'
      });
    }

    // Comprobar si un cliente está activo
    if (
      usuario.Rol === 'Cliente' &&
      usuario.EstadoCliente === false
    ) {

      return res.status(403).json({
        error: 'El cliente está dado de baja y no puede iniciar sesión'
      });

    }

    // Información que queremos guardar dentro del JWT
    const usuarioToken = {
      id: usuario.ID_Usuario,
      correo: usuario.Correo,
      rol: usuario.Rol
    };

    // Crear JWT
    const token = jwt.sign(
      usuarioToken,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    );

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: usuarioToken
    });

  } catch (error) {

    console.error('Error en login:', error);

    res.status(500).json({
      error: error.message
    });

  }

};

// Con JWT, no es necesario cerrar sesión en el servidor, el token se 
// almacena en el cliente y tiene una fecha de expiración.

// Verificar si hay algún usuario conectado
export const getSession = (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        autenticado: false
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        autenticado: false
      });
    }

    const token = parts[1];

    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    res.json({
      autenticado: true,
      usuario
    });

  } catch (error) {

    return res.status(401).json({
      autenticado: false
    });

  }

};

// Obtener pregunta de recuperación
export const getRecoveryQuestion = async (req, res) => {
  try {

    const { correo } = req.body;

    const usuario = await getUserByEmail(correo);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      pregunta: usuario.preguntarec
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

// Cambiar contraseña mediante recuperación
export const changePassword = async (req, res) => {
  try {

    const {
      correo,
      respuesta,
      nuevaContrasena
    } = req.body;

    const usuario = await getUserByEmail(correo);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Comprobar la respuesta contra el hash almacenado
    const respuestaCorrecta = await bcrypt.compare(
      respuesta,
      usuario.resprec
    );

    if (!respuestaCorrecta) {
      return res.status(401).json({
        error: 'Respuesta de recuperación incorrecta'
      });
    }

    // Hashear la nueva contraseña
    const nuevoPasswordHash = await bcrypt.hash(
      nuevaContrasena,
      10
    );

    // Actualizar contraseña
    await updatePassword(
      usuario.ID_Usuario,
      nuevoPasswordHash
    );

    res.json({
      mensaje: 'Contraseña actualizada correctamente'
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};