import { getConnection } from '../config/sqlserver.js';

export const createGastoViaje = async (gasto) => {

  const {
    id_viaje,
    tipo_gasto,
    concepto,
    monto_presupuestado,
    monto_comprobado
  } = gasto;

  const pool = await getConnection();

  const result = await pool.request()
    .input('id_viaje', id_viaje)
    .input('tipo_gasto', tipo_gasto)
    .input('concepto', concepto)
    .input('monto_presupuestado', monto_presupuestado || 0)
    .input('monto_comprobado', monto_comprobado || 0)
    .query(`
      INSERT INTO l.Gastos_Viaje
      (
        ID_Viaje,
        Tipo_Gasto,
        Concepto,
        Monto_Presupuestado,
        Monto_Comprobado
      )
      VALUES
      (
        @id_viaje,
        @tipo_gasto,
        @concepto,
        @monto_presupuestado,
        @monto_comprobado
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0].id;
};