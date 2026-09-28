import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 6543),
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,

  ssl: {
    rejectUnauthorized: false
  },

  max: Number(process.env.PGPOOL_MAX || 1),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const getConnection = () => pool;

export const testConnection = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        current_database() AS database,
        current_user AS usuario
    `);

    console.log('Conexión a PostgreSQL OK');
    console.log(result.rows[0]);
  } finally {
    client.release();
  }
};