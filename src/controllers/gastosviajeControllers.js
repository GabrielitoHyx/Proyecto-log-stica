import { createGastoViaje } from '../models/gastosviajeSQL.js';
import { getConnection } from '../config/sqlserver.js';

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

    const idUsuario = req.session.user.id;

    const pool = await getConnection();

    // Verificar que el viaje pertenece al chofer
    const result = await pool.request()
      .input('id_viaje', id_viaje)
      .input('id_usuario', idUsuario)
      .query(`
        SELECT v.ID_Viaje
        FROM l.Viaje v
        INNER JOIN l.Chofer ch
          ON v.ID_cho = ch.ID_Chof
        WHERE
          v.ID_Viaje = @id_viaje
          AND ch.ID_Usuario = @id_usuario
      `);

    if (result.recordset.length === 0) {
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