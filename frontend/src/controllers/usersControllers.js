import{createUser,getAllUsers,getUserByEmail} from '../models/usersSQL.js';
import {validateUser} from '../models/validator.js'

import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {

    validateUser(req.body);

    const passwordHash = await bcrypt.hash(
      req.body.contrasena,
      10
    );

    const user = {
      ...req.body,
      contrasena: passwordHash
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
    res.status(500).json({ error: error.message });
  }
};


//////------------------PROCESOS--------------------------
//--------------------------------------------------------

//LOGIN
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

    req.session.user = {
      id: usuario.ID_Usuario,
      correo: usuario.Correo,
      rol: usuario.Rol
    };

    res.json({
      mensaje: 'Login correcto',
      usuario: req.session.user
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

// Logout
export const logout = (req, res) => {

  req.session.destroy((error) => {

    if (error) {
      return res.status(500).json({
        error: 'No se pudo cerrar la sesión'
      });
    }

    res.json({
      mensaje: 'Sesión cerrada correctamente'
    });

  });
};

//verificar si hay algun usuario conectado
export const getSession = (req, res) => {

  if (!req.session.user) {
    return res.status(401).json({
      autenticado: false
    });
  }

  res.json({
    autenticado: true,
    usuario: req.session.user
  });

};