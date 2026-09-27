import { getAllChoferes, getChoferById,createChofer, getUsuariosChoferesDisponibles} from '../models/choferSQL.js';
import { getUserByEmail } from '../models/usersSQL.js';

// Obtener todos los choferes
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


// Obtener un chofer
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


// Registrar chofer
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


    // Validar datos básicos
    if (!correo || !nombre || !licencia) {
      return res.status(400).json({
        error: 'Correo, nombre y licencia son obligatorios'
      });
    }


    // Buscar usuario mediante el correo
    const usuario = await getUserByEmail(correo);


    if (!usuario) {
      return res.status(404).json({
        error: 'No existe un usuario con ese correo'
      });
    }


    // Verificar que el usuario tenga rol Chofer
    if (usuario.Rol !== 'Chofer') {
      return res.status(400).json({
        error: 'El usuario seleccionado no tiene rol de Chofer'
      });
    }


    // Crear el chofer usando el ID obtenido del backend
    const id = await createChofer({

      id_usuario: usuario.ID_Usuario,

      nss,
      nombre,
      licencia,
      edad,
      sexo

    });


    res.status(201).json({
      mensaje: 'Chofer registrado correctamente',
      id
    });


  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

export const getUsuariosDisponiblesChofer = async (req, res) => {

  try {

    const usuarios = await getUsuariosChoferesDisponibles();

    res.json(usuarios);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};