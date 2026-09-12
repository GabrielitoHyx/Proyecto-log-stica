import { getConnection } from '../config/sqlserver.js';


export const getAllCamiones = async () => {

  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      ID_CA,
      Placas,
      Modelo,
      Kilometraje_total,
      Capacidad_tanque,
      Capacidad_carga
    FROM l.Camion
    ORDER BY ID_CA
  `);

  return result.recordset;
};


export const createCamion = async (camion) => {

  const {
    Placas,
    Modelo,
    Kilometraje_total,
    Capacidad_tanque,
    Capacidad_carga
  } = camion;

  const pool = await getConnection();

  const result = await pool.request()

    .input('Placas', Placas)
    .input('Modelo', Modelo)
    .input('Kilometraje_total', Kilometraje_total)
    .input('Capacidad_tanque', Capacidad_tanque)
    .input('Capacidad_carga', Capacidad_carga)

    .query(`
      INSERT INTO l.Camion
      (
        Placas,
        Modelo,
        Kilometraje_total,
        Capacidad_tanque,
        Capacidad_carga
      )
      VALUES
      (
        @Placas,
        @Modelo,
        @Kilometraje_total,
        @Capacidad_tanque,
        @Capacidad_carga
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0].id;
};