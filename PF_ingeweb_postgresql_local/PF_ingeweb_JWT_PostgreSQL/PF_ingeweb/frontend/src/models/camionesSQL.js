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

export const updateCamion = async (id, camion) => {
  const { Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga } = camion;
  const pool = getConnection();
  const result = await pool.query(`
    UPDATE public."Camion"
    SET "Placas" = $1, "Modelo" = $2, "Kilometraje_total" = $3,
        "Capacidad_tanque" = $4, "Capacidad_carga" = $5
    WHERE "ID_CA" = $6;
  `, [Placas, Modelo, Kilometraje_total, Capacidad_tanque, Capacidad_carga, id]);
  return result.rowCount;
};