import { createGastoViaje } from '../models/gastosviajeSQL.js';
import { getConnection } from '../config/postgres.js';

export const registerGastoViaje = async (req, res) => {

  try {

    const {
      id_viaje,
      tipo_gasto,
      concepto,
      monto_presupuestado,
      monto_comprobado
    } = req.body;

    if (!id_viaje || !tipo_gasto || !concepto) {
      return res.status(400).json({
        error: 'ID del viaje, tipo de gasto y concepto son obligatorios'
      });
    }

    const idUsuario = req.user.id;

    const pool = getConnection();

    // Verificar que el viaje pertenece al chofer
    const result = await pool.query(`
      SELECT v."ID_Viaje"
      FROM public."Viaje" v
      INNER JOIN public."Chofer" ch
        ON v."ID_cho" = ch."ID_Chof"
      WHERE v."ID_Viaje" = $1
        AND ch."ID_Usuario" = $2
    `, [id_viaje, idUsuario]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: 'No puedes registrar gastos para este viaje'
      });
    }

    const id = await createGastoViaje({
      id_viaje,
      tipo_gasto,
      concepto,
      monto_presupuestado,
      monto_comprobado
    });

    res.status(201).json({
      mensaje: 'Gasto registrado correctamente',
      id
    });

  } catch (error) {

    console.error('Error al registrar gasto:', error);

    res.status(500).json({
      error: error.message
    });

  }
};