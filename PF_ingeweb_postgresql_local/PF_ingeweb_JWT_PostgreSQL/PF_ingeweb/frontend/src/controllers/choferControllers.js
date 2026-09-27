import {
  getAllChoferes,
  getChoferById,
  createChofer,
  getUsuariosChoferesDisponibles
} from '../models/choferSQL.js';

import { getUserByEmail } from '../models/usersSQL.js';


// ==========================================
// OBTENER TODOS LOS CHOFERES
// ==========================================

export const getChoferes = async (req, res) => {

  try {

    const choferes = await getAllChoferes();

    res.json(choferes);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// ==========================================
// OBTENER UN CHOFER
// ==========================================

export const getChofer = async (req, res) => {

  try {

    const { id } = req.params;

    const chofer = await getChoferById(id);

    if (!chofer) {

      return res.status(404).json({
        error: 'Chofer no encontrado'
      });

    }

    res.json(chofer);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// ==========================================
// REGISTRAR CHOFER
// ==========================================

export const registerChofer = async (req, res) => {

  try {

    const {
      correo,
      nss,
      nombre,
      licencia,
      edad,
      sexo
    } = req.body;


    // ==========================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ==========================================

    if (
      !correo ||
      !nss ||
      !nombre ||
      !licencia ||
      edad === undefined ||
      edad === null ||
      !sexo
    ) {

      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });

    }


    // ==========================================
    // VALIDAR NSS
    // Exactamente 11 dígitos
    // ==========================================

    const nssTexto = String(nss).trim();

    if (!/^\d{11}$/.test(nssTexto)) {

      return res.status(400).json({
        error: 'El NSS debe contener exactamente 11 dígitos'
      });

    }


    // ==========================================
    // VALIDAR NOMBRE
    // Más de 3 caracteres
    // ==========================================

    const nombreTexto = String(nombre).trim();

    if (nombreTexto.length <= 3) {

      return res.status(400).json({
        error: 'El nombre debe tener más de 3 caracteres'
      });

    }


    // ==========================================
    // VALIDAR LICENCIA
    // Exactamente 12 caracteres
    // ==========================================

    const licenciaTexto = String(licencia).trim();

    if (licenciaTexto.length !== 12) {

      return res.status(400).json({
        error: 'La licencia debe contener exactamente 12 caracteres'
      });

    }


    // ==========================================
    // VALIDAR EDAD
    // Mayor de 18 años
    // ==========================================

    const edadNumero = Number(edad);

    if (
      !Number.isInteger(edadNumero) ||
      edadNumero <= 18
    ) {

      return res.status(400).json({
        error: 'La edad debe ser un número entero mayor de 18 años'
      });

    }


    // ==========================================
    // VALIDAR SEXO
    // Únicamente M o F
    // ==========================================

    const sexoNormalizado = String(sexo)
      .trim()
      .toUpperCase();

    if (
      sexoNormalizado !== 'M' &&
      sexoNormalizado !== 'F'
    ) {

      return res.status(400).json({
        error: 'El sexo debe ser M o F'
      });

    }


    // ==========================================
    // BUSCAR USUARIO POR CORREO
    // ==========================================

    const usuario = await getUserByEmail(correo);


    if (!usuario) {

      return res.status(404).json({
        error: 'No existe un usuario con ese correo'
      });

    }


    // ==========================================
    // COMPROBAR QUE SEA USUARIO CHOFER
    // ==========================================

    if (usuario.Rol !== 'Chofer') {

      return res.status(400).json({
        error: 'El usuario seleccionado no tiene rol de Chofer'
      });

    }


    // ==========================================
    // CREAR REGISTRO DEL CHOFER
    // ==========================================

    const id = await createChofer({

      id_usuario: usuario.ID_Usuario,

      nss: nssTexto,

      nombre: nombreTexto,

      licencia: licenciaTexto,

      edad: edadNumero,

      sexo: sexoNormalizado

    });


    // ==========================================
    // RESPUESTA
    // ==========================================

    res.status(201).json({

      mensaje: 'Chofer registrado correctamente',

      id

    });


  } catch (error) {

    console.error(
      'Error al registrar chofer:',
      error
    );

    res.status(500).json({
      error: error.message
    });

  }

};


// ==========================================
// OBTENER USUARIOS CHOFER DISPONIBLES
// ==========================================

export const getUsuariosDisponiblesChofer = async (req, res) => {

  try {

    const usuarios =
      await getUsuariosChoferesDisponibles();

    res.json(usuarios);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};