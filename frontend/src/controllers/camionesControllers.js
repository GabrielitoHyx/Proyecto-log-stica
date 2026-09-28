import {
  getAllCamiones,
  createCamion,
  updateCamion
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

export const updateCamionController = async (req, res) => {
  try {
    const { id } = req.params;
    const filasAfectadas = await updateCamion(id, req.body);

    if (filasAfectadas === 0) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    res.json({ mensaje: 'Camión actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};