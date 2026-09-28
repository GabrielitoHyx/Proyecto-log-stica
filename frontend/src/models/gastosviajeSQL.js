import { getConnection } from '../config/postgres.js';

export const createGastoViaje = async (gasto) => {
  const { id_viaje, tipo_gasto, concepto, monto_presupuestado, monto_comprobado } = gasto;
  const pool = getConnection();
  const result = await pool.query(`
    INSERT INTO public."Gastos_Viaje"
      ("ID_Viaje", "Tipo_Gasto", "Concepto", "Monto_Presupuestado", "Monto_Comprobado")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "ID_Gasto_Viaje" AS id;
  `, [id_viaje, tipo_gasto, concepto, monto_presupuestado || 0, monto_comprobado || 0]);
  return result.rows[0].id;
};
