import { getConnection } from '../config/postgres.js';

export const getAllCamiones = async () => {
  const pool = getConnection();
  const result = await pool.query(`
    SELECT
      "ID_CA",
      "Placas",
      "Modelo",
      "Kilometraje_total",
      "Capacidad_tanque",
      "Capacidad_carga"
    FROM public."Camion"
    ORDER BY "ID_CA";
  `);
  return result.rows;
};

export const createCamion = async (camion) => {
  const { Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga } = camion;
  const pool = getConnection();
  const result = await pool.query(`
    INSERT INTO public."Camion"
      ("Placas", "Modelo", "Kilometraje_total", "Capacidad_tanque", "Capacidad_carga")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING "ID_CA" AS id;
  `, [Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga]);
  return result.rows[0].id;
};
