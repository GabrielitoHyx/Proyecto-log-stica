import {getAllClientes,getClienteById,createCliente,getUsuariosClientesDisponibles,actualizarEstadoCliente,actualizarCliente} 
from '../models/clientesSQL.js';

//import { validarCliente } from '../validator/clientesValidator.js';

import { getUserByEmail } from '../models/usersSQL.js';

// OBTENER TODOS LOS CLIENTES
export const getClientes = async (req, res) => {

  try {

    const clientes = await getAllClientes();

    res.json(clientes);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


// OBTENER UN CLIENTE
export const getCliente = async (req, res) => {

  try {

    const { id } = req.params;

    const cliente = await getClienteById(id);

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    res.json(cliente);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


// REGISTRAR CLIENTE
export const registerCliente = async (req, res) => {

  try {

    const {
      correo,
      nombre,
      telefono
    } = req.body;


    if (!correo || !nombre) {

      return res.status(400).json({
        error: 'Correo y nombre son obligatorios'
      });

    }


    // BUSCAR USUARIO POR CORREO
    const usuario = await getUserByEmail(correo);


    if (!usuario) {

      return res.status(404).json({
        error: 'No existe un usuario con ese correo'
      });

    }


    // COMPROBAR QUE SEA CLIENTE
    if (usuario.Rol !== 'Cliente') {

      return res.status(400).json({
        error: 'El usuario seleccionado no tiene rol de Cliente'
      });

    }


    // CREAR REGISTRO EN CLIENTE
    const id = await createCliente({

      id_usuario: usuario.ID_Usuario,

      nombre,

      telefono

    });


    res.status(201).json({

      mensaje: 'Cliente registrado correctamente',

      id

    });


  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


// OBTENER USUARIOS CLIENTE DISPONIBLES
export const getUsuariosDisponiblesCliente = async (req, res) => {

  try {

    const usuarios = await getUsuariosClientesDisponibles();

    res.json(usuarios);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


// CAMBIAR ESTADO DEL CLIENTE
export const cambiarEstadoCliente = async (req, res) => {

  try {

    const { id } = req.params;
    const { estado } = req.body;


    // Validar que sea true o false
    if (typeof estado !== 'boolean') {

      return res.status(400).json({
        error: 'El estado debe ser true o false'
      });

    }


    const filasAfectadas = await actualizarEstadoCliente(
      id,
      estado
    );


    if (filasAfectadas === 0) {

      return res.status(404).json({
        error: 'Cliente no encontrado'
      });

    }


    res.json({

      mensaje: estado
        ? 'Cliente reactivado correctamente'
        : 'Cliente dado de baja correctamente',

      estado

    });


  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};

export const actualizarClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono } = req.body;

    const filasAfectadas = await actualizarCliente(
      id,
      nombre,
      telefono
    );

    if (filasAfectadas === 0) {
      return res.status(404).json({
        error: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente actualizado correctamente'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};