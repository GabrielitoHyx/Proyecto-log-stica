import {
  getAllCamiones,
  createCamion
} from '../models/camionesSQL.js';


export const getCamiones = async (req, res) => {

  try {

    const camiones = await getAllCamiones();

    res.json(camiones);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

};


export const registerCamion = async (req, res) => {

  try {

    const id = await createCamion(req.body);

    res.status(201).json({
      mensaje: 'Camión registrado correctamente',
      id
    });

  } catch (error) {

    console.error(error);

    res.status(400).json({
      error: error.message
    });

  }

};